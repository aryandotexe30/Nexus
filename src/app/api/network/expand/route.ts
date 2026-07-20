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

    const queryKey = `v5-${action}-${nodeLabel}-${context || ''}`.toLowerCase().trim();

    // Determine target node type based on action
    let targetType = "Company";
    let searchQuery = "";
    
    const contextStr = context ? ` (in the context of the company ${context})` : "";

    switch (action) {
      case "Find Products":
        targetType = "Product";
        searchQuery = `"${nodeLabel}" official product catalog list, specific model numbers, and detailed technical specifications`;
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

    // 1. Tavily Search
    const searchRes = await fetchVerifiedInternetData(searchQuery, 30, false);
    const searchContext = searchRes.contextString;

    // 2. Gemini Extraction
    const prompt = `
You are an expert supply chain and industrial analyst.
Based on the following search context, perform the requested action.

Target Entity: ${nodeLabel}
Entity Type: ${nodeType}
Requested Action: ${action}

Extract ALL highly specific, distinct items related to the query found in the search context. Do NOT arbitrarily limit the list. If there are 50 products or items, you must list all 50. 
- If asking for "Suppliers", "Manufacturers", or "Competitors", output EXACT COMPANY NAMES (e.g., "Tata Steel", "Suraj Metal Corp", "Reliance Industries"). Do NOT output product names.
- If asking for "Raw Materials", output specific materials like "Lithium Cobalt Oxide", "Graphite Anode", "Polyethylene Separator", rather than generic terms.
- If asking for "Products", you MUST adhere strictly to these rules:
  1. SCRUB ALL BRANDING: Completely remove brand names (e.g., "3M", "Dollar", "Tesa", "Srivasavi", "Havells") from the product name.
  2. Return ONLY the generic technical or industrial name of the product (e.g., "LED Troffer", "Industrial Motor", "Copper Wire"). Do not include properties, descriptions, or specs.

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
