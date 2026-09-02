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

    const queryKey = `v16-${action}-${nodeLabel}-${context || ''}`.toLowerCase().trim();

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

    // Fresh live web crawl & graph expansion (Cache reads disabled)
    console.log(`[Fresh Network Expansion] Action: ${action} for ${nodeLabel}`);

    // 1. Tavily Search - Efficient Exhaustive Scraping
    const isExhaustiveProductScrape = action === "Find Products";
    const maxResults = isExhaustiveProductScrape ? 15 : 20; // Deep crawl of 15 pages to catch all subcategory and product pages
    const searchRes = await fetchVerifiedInternetData(searchQuery, maxResults, false, isExhaustiveProductScrape);
    const searchContext = searchRes.contextString;

    // 2. Universal Structured AI Extraction
    const prompt = `
You are an elite B2B product catalog and industrial supply chain analyst.
Target Entity: ${nodeLabel}
Entity Type: ${nodeType}
Requested Action: ${action}

Search Context:
${searchContext}

CRITICAL EXHAUSTIVE CATALOG EXTRACTION:
- Extract and list EVERY SINGLE distinct product model, catalog item, and specialized industrial material/component manufactured or supplied by ${nodeLabel}.
- Do NOT stop at 5 or 10 items. Exhaustively cover ALL product categories and individual item models.
- Format each item cleanly: "Product Model / Name | Category: ... | Description: ... | Specs: ..."

Output strictly a valid JSON object with the "items" array:
{
  "items": [
    "Exact Product Model/Name | Category: Subcategory | Description: Detailed function | Specs: Technical parameters",
    ...
  ]
}
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
      if (Array.isArray(parsedObject?.items) && parsedObject.items.length > 0) {
        items = parsedObject.items;
      } else if (Array.isArray(parsedObject?.products) && parsedObject.products.length > 0) {
        items = parsedObject.products;
      } else if (Array.isArray(parsedObject?.results) && parsedObject.results.length > 0) {
        items = parsedObject.results;
      } else if (Array.isArray(parsedObject) && parsedObject.length > 0) {
        items = parsedObject;
      } else {
        const anyArray = Object.values(parsedObject || {}).find(v => Array.isArray(v) && v.length > 0);
        items = (anyArray as string[]) || [];
      }
    } catch (parseError) {
      console.error("Failed to parse AI output:", parseError);
      items = [];
    }

    // Knowledge base fallback if web scraper yielded 0 items
    if (items.length === 0) {
      try {
        console.log(`[Network Expand] Running fallback exhaustive B2B extraction for ${nodeLabel} (${action})...`);
        const fallbackPrompt = `
You are an expert supply chain and industrial catalog analyst.
Target Entity: ${nodeLabel}
Entity Type: ${nodeType}
Requested Action: ${action}

CRITICAL: Provide an exhaustive, extensive list of all known product lines, models, materials, or supply chain nodes for ${nodeLabel} across all its industrial categories.
Output strictly valid JSON with this exact schema:
{
  "items": [
    "Product Model/Name | Category: Subcategory | Description: Detailed function | Specs: Technical parameters"
  ]
}
        `;
        const fallbackRes = await generateStructuredAIResponse(fallbackPrompt, schemaProps, ["items"]);
        if (Array.isArray(fallbackRes?.items) && fallbackRes.items.length > 0) {
          items = fallbackRes.items;
        }
      } catch (fallbackErr) {
        console.error("Fallback extraction error:", fallbackErr);
      }
    }


    // STEALTH AUTO-ENRICHMENT: Automatically store ALL extracted entities to Databook
    if (items.length > 0) {
      try {
        console.log(`[Auto-Enrichment] Saving ${items.length} items to Databook for ${nodeLabel} (${action})`);
        
        // Parse items into structured Databook entries
        const records = items.map(item => {
          const parts = item.split('|').map(s => s.trim()).filter(Boolean);
          const entityName = parts[0] || "Unknown Entity";
          let description = "";
          const specs: Record<string, string> = { entityType: targetType, sourceAction: action };
          
          parts.slice(1).forEach(part => {
            if (part.includes(':')) {
              const [k, ...v] = part.split(':');
              const key = k.trim();
              const val = v.join(':').trim();
              if (key.toLowerCase() === 'description') {
                description = val;
              } else {
                specs[key] = val;
              }
            }
          });
          
          return {
            query: nodeLabel,
            productName: entityName, // Using productName field generically to store the entity name
            description,
            specs
          };
        });
        
        // Bulk insert into ProductKnowledge (Acting as Databook)
        if (records.length > 0) {
          await prisma.productKnowledge.createMany({
            data: records,
            skipDuplicates: true // Prevent crashing on re-exploration
          });
        }
      } catch (enrichError) {
        console.error("[Auto-Enrichment] Failed to save items to Databook:", enrichError);
      }
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
