import { NextResponse } from 'next/server';
import { Type } from '@google/genai';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { isCacheExpired, fetchVerifiedInternetData, generateStructuredAIResponse } from "@/lib/searchProtocol";



export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { nodeLabel, nodeType, action, context } = await req.json();

    if (!nodeLabel || !action) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (user.credits <= 0) {
      return NextResponse.json({ error: 'Insufficient credits. Please upgrade your account.' }, { status: 403 });
    }

    const queryKey = `v12-${action}-${nodeLabel}-${context || ''}`.toLowerCase().trim();

    // Determine target node type based on action
    let targetType = "Company";
    let searchQuery = "";
    
    const contextStr = context ? ` (in the context of the company ${context})` : "";

    switch (action) {
      case "Find Products":
        targetType = "Product";
        searchQuery = `"${nodeLabel}" specific product models, technical specifications, detailed catalog list`;
        break;
      case "Find Raw Materials":
        targetType = "Raw Material";
        searchQuery = `What industrial raw materials and components are required to manufacture ${nodeLabel}?${contextStr}`;
        break;
      case "Find Other Applications":
      case "Find Alternative Uses":
        targetType = "Application";
        searchQuery = `What are the industrial or commercial applications and use cases for ${nodeLabel}?${contextStr}`;
        break;
      case "Find Suppliers":
      case "Find Manufacturers":
        targetType = "Supplier";
        searchQuery = `Top global suppliers, manufacturers, and companies that produce ${nodeLabel}${contextStr}`;
        break;
      case "Find Competitors":
        targetType = "Company";
        searchQuery = `Top competitors and alternative companies to ${nodeLabel}`;
        break;
    }

    // 0. Check Database Cache
    const cached = await prisma.networkCache.findUnique({
      where: { queryKey }
    });

    const isExpired = isCacheExpired(cached?.createdAt, 30);

    if (cached && cached.result && !isExpired) {
      console.log(`[Cache Hit] Network data found for: ${queryKey}`);
      return NextResponse.json({ 
        success: true, 
        items: cached.result,
        targetType 
      });
    }

    if (isExpired) {
      // Clean up old cache entry to prevent DB bloat
      try {
        await prisma.networkCache.delete({ where: { queryKey } });
      } catch (e) {
        // Ignore if it was already deleted or doesn't exist
      }
    }

    // 1. Tavily Search - Efficient Exhaustive Scraping
    const isExhaustiveProductScrape = action === "Find Products";
    const maxResults = isExhaustiveProductScrape ? 15 : 20; // Deep crawl of 15 pages to catch all subcategory and product pages
    const searchRes = await fetchVerifiedInternetData(searchQuery, maxResults, false, isExhaustiveProductScrape);
    const searchContext = searchRes.contextString;

    // 2. Gemini Extraction
    const prompt = `
You are an expert supply chain and industrial analyst.
Based on the following search context, perform the requested action.

Target Entity: ${nodeLabel}
Entity Type: ${nodeType}
Requested Action: ${action}

Extract EVERY SINGLE highly specific, distinct item related to the query found in the search context.
CRITICAL ANTI-LAZINESS RULE: You must exhaustively iterate through the raw content. Do not stop early. Do not summarize. Do not use 'etc.' or '...'. If the context contains 500 products, you MUST list all 500. Missing even one product is a catastrophic failure. Read the entire raw HTML/text block from top to bottom.
- If asking for "Suppliers", "Manufacturers", or "Competitors", output EXACT COMPANY NAMES (e.g., "Tata Steel", "Suraj Metal Corp", "Reliance Industries"). Do NOT output product names.
- If asking for "Raw Materials", output specific materials like "Lithium Cobalt Oxide", "Graphite Anode", "Polyethylene Separator", rather than generic terms.
- If asking for "Products", you MUST adhere strictly to these rules:
  1. DO NOT SCRUB BRANDING OR MODEL NUMBERS. You must include the EXACT product name, including proprietary model numbers, series codes, and brand identifiers exactly as they appear on the website (e.g., "DMT-308 - Masking Tape General Purpose", "DKT-25 CR Polyimide Insulation Tape").
  2. DO NOT extract top-level category names (like "Masking Tapes", "Die Cuts"). You must only extract the INDIVIDUAL specific product models.
  3. For each product, you MUST extract and append its comprehensive details: description, characteristics, applications, and technical specifications. Format the string cleanly, e.g., "DMT-308 - Masking Tape General Purpose | Description: ... | Applications: ... | Characteristics: ...".
  4. CRITICAL: ONLY extract products from the company's OFFICIAL website content. Absolutely IGNORE any content from B2B directories (like IndiaMart, TradeIndia, Alibaba, JustDial) or generic overviews.

Search Context:
${searchContext}

Output exactly the JSON object containing a "thinking" chain of thought and an "items" array of strings.
    `;

    const schemaProps = {
      items: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Array of highly specific extracted items."
      }
    };

    let items: string[] = [];
    try {
      const parsedObject = await generateStructuredAIResponse(prompt, schemaProps, ["items"]);
      items = parsedObject.items || [];
    } catch (parseError) {
      console.error("Failed to parse Gemini output:", parseError);
      items = ["No data found"];
    }

    try {
      await prisma.networkCache.create({
        data: {
          queryKey,
          result: items
        }
      });
    } catch (cacheError) {
      console.error("Failed to save to cache:", cacheError);
    }

    // Deduct credits
    await prisma.user.update({
      where: { id: user.id },
      data: { credits: { decrement: 1 } }
    });

    return NextResponse.json({ 
      success: true, 
      items,
      targetType,
      remainingCredits: user.role === 'ADMIN' ? 'Unlimited' : user.credits - 1
    });

  } catch (error: any) {
    console.error("Network expand error:", error);
    return NextResponse.json({ 
      error: error.message || 'An error occurred. Please try again.' 
    }, { status: 500 });
  }
}
