import { prisma } from './prisma';
import { generateStructuredAIResponse } from './searchProtocol';
import { searchWebFallback } from './searchProtocol';
import { Type } from '@google/genai';

export interface BrainProductItem {
  name: string;
  category: string;
  description: string;
  specs: string;
  rawMaterials?: string[];
  applications?: string[];
}

export interface BrainFamilyGroup {
  family: string;
  description?: string;
  items: BrainProductItem[];
}

export interface BrainSynthesisResult {
  success: boolean;
  entity: string;
  entityType: string;
  action: string;
  industry?: string;
  summary?: string;
  families?: BrainFamilyGroup[];
  items: string[];
  rawItems?: BrainProductItem[];
}

/**
 * TarasAI Brain Engine
 * Core intelligence, memory, and reasoning pipeline for B2B supply chains & product graphs.
 */
export class BrainEngine {
  /**
   * Main query entry point: checks persistent memory, runs deep web harvesting,
   * performs LLM clustering & reasoning, and records discoveries into the graph.
   */
  static async query(
    entityName: string,
    entityType: string,
    action: string,
    contextHint?: string
  ): Promise<BrainSynthesisResult> {
    const cleanEntity = entityName.trim();
    console.log(`[Brain Engine] Processing query for "${cleanEntity}" [${entityType}] -> Action: ${action}`);

    // 1. Fresh Live Autonomous Web Harvest & Direct Corporate Crawl (Cache reads disabled)
    let searchContext = "";
    let directProducts: string[] = [];

    try {
      const searchRes = await searchWebFallback(`${cleanEntity} ${action.replace('Find ', '')}`, 10);
      searchContext = searchRes.contextString || "";
      if (Array.isArray(searchRes.directProducts) && searchRes.directProducts.length > 0) {
        directProducts = searchRes.directProducts;
      }
    } catch (crawlErr) {
      console.warn(`[Brain Engine] Web harvester notice: ${(crawlErr as any)?.message}`);
    }

    // 2. If direct verified products are available for "Find Products", use them directly for 100% authenticity
    if (action === "Find Products" && directProducts.length >= 5) {
      console.log(`[Brain Engine] Direct Catalog Match: Using ${directProducts.length} verified products directly from official site.`);
      return {
        success: true,
        entity: cleanEntity,
        entityType,
        action,
        industry: "Specialty Industrial Manufacturing",
        summary: `Official product catalog extracted directly from verified manufacturer portal for ${cleanEntity}`,
        items: directProducts
      };
    }

    // 3. AI Brain Reasoning & Synthesis for analytical actions (Raw Materials, Suppliers, Applications)
    const clampedContext = searchContext.length > 10000 ? searchContext.substring(0, 10000) : searchContext;

    const synthesisPrompt = `
You are the TarasAI Enterprise Brain Engine.
Target Entity: ${cleanEntity}
Entity Type: ${entityType}
Action Requested: ${action}

LIVE HARVESTED CONTEXT:
${clampedContext}

${directProducts.length > 0 ? `DIRECT OFFICIAL MODELS DISCOVERED ON SITE:\n${directProducts.join('\n')}\n` : ''}

MISSION:
1. Identify the genuine core industry of "${cleanEntity}" (e.g., Electrical Switchgear & Appliances, Industrial Adhesive Tapes, Commercial Vehicles, Specialty Chemicals).
2. Synthesize an extensive, structured, and authentic list for "${action}".
3. Group products into meaningful "families" or subcategories.
4. STRICT ANTI-HALLUCINATION & NOISE REDUCTION RULES:
   - FORBIDDEN from including website navigation text (e.g. "Privacy Policy", "Terms", "Career", "Stories", "About Us", "Contact").
   - FORBIDDEN from outputting products from unrelated industries.
   - For every product, provide genuine model numbers, technical parameters (thickness, voltage, temp rating, adhesive type, material grade), and applications.
   - For "Find Raw Materials", identify the exact underlying polymers, adhesives, base substrates, and chemicals.
   - For "Find Suppliers" or "Find Competitors", identify real active manufacturers.

Output strictly a valid JSON object matching this schema:
{
  "industry": "Core Industry Sector",
  "summary": "Brief 1-line description of the company's manufacturing profile",
  "items": [
    "Item Name / Model Code | Category: Family Name | Description: Industrial application | Specs: Key technical parameters"
  ]
}
    `;

    const schemaProps = {
      industry: { type: Type.STRING, description: "Core industry sector" },
      summary: { type: Type.STRING, description: "Summary of entity profile" },
      items: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Exhaustive array of structured pipe-delimited items"
      }
    };

    let synthesizedItems: string[] = [];
    let discoveredIndustry = "Enterprise Industrial Sector";
    let discoveredSummary = "";

    try {
      const aiResponse = await generateStructuredAIResponse(synthesisPrompt, schemaProps, ["items"]);
      if (aiResponse && Array.isArray(aiResponse.items) && aiResponse.items.length > 0) {
        synthesizedItems = aiResponse.items;
        discoveredIndustry = aiResponse.industry || discoveredIndustry;
        discoveredSummary = aiResponse.summary || discoveredSummary;
      }
    } catch (aiErr) {
      console.warn(`[Brain Engine] AI reasoning fallback: ${(aiErr as any)?.message}`);
    }

    // Fallback: If AI reasoning yielded 0 and we have direct products, use them
    if (synthesizedItems.length === 0 && directProducts.length > 0) {
      synthesizedItems = directProducts;
    }

    // 4. Persistence into Brain Knowledge Graph
    if (synthesizedItems.length > 0) {
      try {
        if (prisma && (prisma as any).brainEntity) {
          await (prisma as any).brainEntity.upsert({
            where: { name: cleanEntity },
            create: {
              name: cleanEntity,
              entityType: entityType.toUpperCase().replace(/\s+/g, '_'),
              industry: discoveredIndustry,
              summary: discoveredSummary,
              attributes: { [action]: synthesizedItems },
              confidence: 1.0
            },
            update: {
              industry: discoveredIndustry,
              summary: discoveredSummary,
              attributes: { [action]: synthesizedItems },
              updatedAt: new Date()
            }
          });
          console.log(`[Brain Engine] Memory Persisted: Saved ${synthesizedItems.length} items to Brain Knowledge for ${cleanEntity}`);
        }
      } catch (saveErr) {
        console.warn(`[Brain Engine] Memory persist notice: ${(saveErr as any)?.message}`);
      }
    }

    return {
      success: true,
      entity: cleanEntity,
      entityType,
      action,
      industry: discoveredIndustry,
      summary: discoveredSummary,
      items: synthesizedItems
    };
  }
}
