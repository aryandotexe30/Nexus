import { NextResponse } from 'next/server';
import { Type } from '@google/genai';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { fetchVerifiedInternetData, generateStructuredAIResponse } from "@/lib/searchProtocol";
import { isValidProduct } from "@/lib/deepProductHarvester";

const SYSTEM_PROMPT = `
You are "TarasAI Copilot", an elite B2B Industrial Materials & Adhesive Tape Procurement Intelligence Engineer.
You have FULL, DIRECT ACCESS to our Master Industrial Product Database containing verified physical products, manufacturer datasheets, and technical specifications (Tesa, 3M, Ajit Industries / AIPL, Sri Vasavi Tapes, Polycab, Havells, Nitto Denko, Saint-Gobain, Shurtape, etc.).

YOUR CORE CAPABILITIES & WORKFLOW:

1. MASTER DATABASE CONTEXT AWARENESS:
   - You MUST utilize the provided MASTER DATABASE PRODUCTS in your prompt context.
   - Ground your recommendations in real, physical models (e.g., "tesa 4965", "3M 468MP", "3M VHB 4910", "AIPL ABRO Masking Tape", "AIPL Polyimide Kapton", "Sri Vasavi High Temp Tape", "Polycab FRLS", etc.).
   - NEVER hallucinate fake model numbers or corporate profile generic entries.

2. INTERACTIVE TECHNICAL GUIDANCE & OPTIONS (STEP 1):
   - When the user query is broad (e.g., "I need tape for powder coating", "Double sided tape for automotive trim", "Heat resistant tape"), ask 1-2 focused engineering questions (temperature requirements, surface substrate like aluminum/plastic/glass, thickness, indoor/outdoor).
   - You MUST always provide 3-5 concise, clickable multiple-choice options in the "options" array (e.g., ["Up to 150°C (Short term)", "High Shear on Metals", "Removable Clean Peel", "Thick Gap Filling (>1mm)", "Other"]).

3. DEEP PRODUCT INTELLIGENCE WITH PROS & CONS (STEP 2):
   - When presenting product recommendations or comparing models, structure them into the "recommendations" array.
   - For EACH recommended product, you MUST provide:
     * "name": Exact product name and model number
     * "companyName": Real manufacturer name
     * "application": Primary verified industrial application
     * "specs": Key technical specification key-values (Backing material, Adhesive type, Total thickness, Temperature resistance, Adhesion to Steel, Tensile strength)
     * "pros": 2-3 specific technical advantages / strengths (e.g. "Outstanding resistance to plasticizers", "Instant tack on low surface energy plastics")
     * "cons": 1-2 practical limitations or application trade-offs (e.g. "Higher initial unit price", "Requires surface primer on unpainted polypropylene")
     * "verdict": 1-sentence engineering summary of why this product fits the requirement
     * "productUrl": Official link if present in DB
   - Include a detailed markdown synthesis in "text" explaining the engineering trade-offs and comparison.

JSON OUTPUT STRUCTURE ENFORCEMENT:
Output your entire response as a structured JSON object with:
{
  "type": "clarification" | "recommendation" | "comparison",
  "text": "Comprehensive, technical markdown response explaining the materials science, engineering parameters, and substrate adhesion mechanisms.",
  "options": ["Clickable Option 1", "Clickable Option 2", "Clickable Option 3", "Other"],
  "recommendations": [
    {
      "name": "Product Model Name",
      "companyName": "Manufacturer Name",
      "application": "Application description",
      "specs": { "Backing material": "...", "Adhesive type": "...", "Total thickness": "...", "Temperature resistance": "..." },
      "pros": ["Pro 1", "Pro 2"],
      "cons": ["Con 1"],
      "verdict": "Clear engineering verdict",
      "productUrl": "https://..."
    }
  ]
}
`;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages array' }, { status: 400 });
    }

    const latestUserMessage = messages[messages.length - 1]?.text || "";

    // 1. Gather all verified enterprise catalogs and database products
    const { ENTERPRISE_CATALOGS } = await import('@/lib/enterpriseCatalogs');
    const { classifyProduct } = await import('@/lib/productClassifier');

    let allProducts: any[] = [];

    // Collect all enterprise catalog items
    for (const [catCompany, items] of Object.entries(ENTERPRISE_CATALOGS)) {
      for (const item of items) {
        allProducts.push({
          id: `cat-${catCompany}-${item.name.replace(/\s+/g, '-').toLowerCase()}`,
          name: item.name,
          companyName: catCompany,
          productUrl: item.productUrl,
          industry: item.industry,
          market: item.market,
          application: item.application,
          specs: item.specs,
          classification: classifyProduct({
            name: item.name,
            specs: item.specs,
            application: item.application,
            market: item.market,
            industry: item.industry
          })
        });
      }
    }

    // Also fetch DB products
    try {
      const dbFetched = await prisma.extractedProduct.findMany({
        take: 50,
        orderBy: { updatedAt: 'desc' }
      });
      const validDb = dbFetched.filter((p: any) => isValidProduct(p.name, p.productUrl, Object.keys(p.specs || {}).length));
      for (const p of validDb) {
        if (!allProducts.some(ap => ap.name.toLowerCase() === p.name.toLowerCase())) {
          allProducts.push({
            id: p.id,
            name: p.name,
            companyName: p.companyName,
            productUrl: p.productUrl,
            industry: p.industry,
            market: p.market,
            application: p.application,
            specs: p.specs,
            classification: classifyProduct({
              name: p.name,
              specs: p.specs as any,
              application: p.application,
              market: p.market,
              industry: p.industry
            })
          });
        }
      }
    } catch (dbErr) {
      console.warn("Database fetch in Copilot noticed:", dbErr);
    }

    // 2. Intelligent Multi-Attribute Semantic Ranking
    const queryLower = latestUserMessage.toLowerCase();
    const queryTokens = queryLower
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w: string) => w.length > 2 && !['the', 'and', 'for', 'with', 'need', 'want', 'buy', 'how', 'what', 'which', 'can', 'you', 'give', 'tape', 'tapes'].includes(w));

    const scoredProducts = allProducts.map(p => {
      let score = 0;
      const c = p.classification;
      const text = `${p.name} ${p.companyName} ${p.application || ''} ${JSON.stringify(p.specs || {})} ${c.attributesList.join(' ')}`.toLowerCase();

      // Exact phrase match
      if (text.includes(queryLower)) score += 50;

      // Token matches
      for (const token of queryTokens) {
        if (text.includes(token)) score += 10;
        if (p.name.toLowerCase().includes(token)) score += 15;
      }

      // Feature specific boosts
      if (queryLower.includes('double') && c.sideType === 'Double-Sided') score += 30;
      if (queryLower.includes('single') && c.sideType === 'Single-Sided') score += 20;
      if (queryLower.includes('transfer') && c.sideType === 'Transfer (Unsupported)') score += 30;
      if ((queryLower.includes('kapton') || queryLower.includes('polyimide')) && c.backingType === 'Polyimide / Kapton') score += 35;
      if ((queryLower.includes('glass') || queryLower.includes('fiberglass')) && c.backingType === 'Fiberglass / Glass Cloth') score += 35;
      if ((queryLower.includes('foam') || queryLower.includes('vhb')) && c.backingType.includes('Foam')) score += 35;
      if ((queryLower.includes('silicone') || queryLower.includes('polysiloxane')) && c.adhesionType.includes('Silicone')) score += 35;
      if (queryLower.includes('acrylic') && c.adhesionType.includes('Acrylic')) score += 25;
      if ((queryLower.includes('high temp') || queryLower.includes('heat') || queryLower.includes('200') || queryLower.includes('260') || queryLower.includes('180') || queryLower.includes('150')) && (c.tempRange.includes('High') || c.tempRange.includes('Ultra-High'))) score += 30;

      return { product: p, score };
    });

    scoredProducts.sort((a, b) => b.score - a.score);
    const topProducts = (scoredProducts[0]?.score > 0 ? scoredProducts.slice(0, 20) : scoredProducts.slice(0, 15)).map(s => s.product);

    // Format Technical DB context
    const dbContextString = topProducts.map((p: any, i: number) => {
      const specsStr = Object.entries(p.specs || {})
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
      const c = p.classification;
      return `[Product #${i+1}]
- Model: ${p.name} (${p.companyName})
- Type: ${c.productType} | Side: ${c.sideType}
- Backing: ${c.backingType} | Adhesive: ${c.adhesionType}
- Thickness: ${c.thicknessCategory} | Temp Rating: ${c.tempRange}
- Application: ${p.application || 'Industrial'}
- Specs: { ${specsStr} }
- Link: ${p.productUrl || ''}`;
    }).join('\n\n');

    // Format Conversation History
    let filteredMessages = messages;
    if (messages.length > 0 && messages[0].role === 'ai' && messages[0].text.includes("Welcome to")) {
      filteredMessages = messages.slice(1);
    }

    const formattedMessages = filteredMessages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const historyPrompt = formattedMessages.map((m: any) => `${m.role}: ${m.parts[0].text}`).join("\n");
    
    const fullPrompt = `${SYSTEM_PROMPT}

MASTER TECHNICAL PRODUCT MATRIX IN SYSTEM (160+ VERIFIED MODELS ACROSS ALL MAJOR MANUFACTURERS):
${dbContextString}

CHAT HISTORY:
${historyPrompt}`;

    const schemaProps = {
      type: { type: Type.STRING, description: "clarification, recommendation, or comparison" },
      text: { type: Type.STRING, description: "Comprehensive markdown response with technical analysis and comparison tables." },
      options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-5 clickable options for next user steps." },
      recommendations: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            companyName: { type: Type.STRING },
            application: { type: Type.STRING },
            specs: { type: Type.OBJECT },
            pros: { type: Type.ARRAY, items: { type: Type.STRING } },
            cons: { type: Type.ARRAY, items: { type: Type.STRING } },
            verdict: { type: Type.STRING },
            productUrl: { type: Type.STRING }
          },
          required: ["name", "companyName", "application", "specs", "pros", "cons", "verdict"]
        }
      }
    };

    let data;
    try {
      data = await generateStructuredAIResponse(fullPrompt, schemaProps, ["type", "text", "options"]);
    } catch (aiErr: any) {
      console.error("AI Generation failed:", aiErr);
      return NextResponse.json({
        success: true,
        text: `I found ${topProducts.length} verified products in our master catalog matching "${latestUserMessage}". Here are the top options:`,
        options: ["View Technical Datasheets", "Request Anonymous RFQ", "Compare Specifications", "Other"],
        recommendations: topProducts.slice(0, 3).map((p: any) => ({
          name: p.name,
          companyName: p.companyName,
          application: p.application || "General Industrial",
          specs: p.specs || {},
          pros: ["Verified physical model in master database", "Industrial grade performance"],
          cons: ["Confirm substrate compatibility prior to bulk order"],
          verdict: `Recommended model from ${p.companyName}`,
          productUrl: p.productUrl
        }))
      });
    }

    return NextResponse.json({
      success: true,
      text: data.text || "Here are the matching verified specifications from our master database:",
      options: data.options || ["Request RFQ", "Compare Models", "Check Temperature Rating", "Other"],
      recommendations: data.recommendations || []
    });

  } catch (error: any) {
    console.error("Copilot Error:", error);
    return NextResponse.json({ error: error.message || 'Failed to process AI Copilot request' }, { status: 500 });
  }
}

