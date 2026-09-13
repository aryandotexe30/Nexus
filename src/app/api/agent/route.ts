import { NextResponse } from 'next/server';
import { Type } from '@google/genai';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { fetchVerifiedInternetData, generateStructuredAIResponse } from "@/lib/searchProtocol";
import { isValidProduct } from "@/lib/deepProductHarvester";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages, companyContext } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages array' }, { status: 400 });
    }

    // Fetch user details for company-aware personalization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { companyName: true, industry: true, domain: true, gstNumber: true }
    });

    const userCompany = companyContext?.companyName || user?.companyName || "Your Enterprise";
    const userIndustry = companyContext?.industry || user?.industry || "Industrial Manufacturing & Assembly";

    const latestUserMessage = messages[messages.length - 1]?.text || "";

    // 1. Gather all verified enterprise catalogs and database products
    const { ENTERPRISE_CATALOGS } = await import('@/lib/enterpriseCatalogs');
    const { classifyProduct } = await import('@/lib/productClassifier');

    let allProducts: any[] = [];

    // Collect all enterprise catalog items (160+ verified models across 12 manufacturers)
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
        take: 60,
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
      console.warn("[Copilot] Database fetch notice:", dbErr);
    }

    // 2. Intelligent Supervised Technical & Company-Aware Semantic Ranking
    const queryLower = latestUserMessage.toLowerCase();
    const queryTokens = queryLower
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w: string) => w.length > 2 && !['the', 'and', 'for', 'with', 'need', 'want', 'buy', 'how', 'what', 'which', 'can', 'you', 'give', 'tape', 'tapes', 'show'].includes(w));

    const scoredProducts = allProducts.map(p => {
      let score = 0;
      const c = p.classification;
      const text = `${p.name} ${p.companyName} ${p.application || ''} ${p.market || ''} ${JSON.stringify(p.specs || {})} ${c.attributesList.join(' ')}`.toLowerCase();

      // Exact phrase match
      if (text.includes(queryLower)) score += 60;

      // Token matches
      for (const token of queryTokens) {
        if (text.includes(token)) score += 10;
        if (p.name.toLowerCase().includes(token)) score += 20;
        if (p.companyName.toLowerCase().includes(token)) score += 25;
      }

      // Feature & Substrate Boosts
      if (queryLower.includes('double') && c.sideType === 'Double-Sided') score += 35;
      if (queryLower.includes('single') && c.sideType === 'Single-Sided') score += 20;
      if (queryLower.includes('transfer') && c.sideType === 'Transfer (Unsupported)') score += 35;
      if ((queryLower.includes('kapton') || queryLower.includes('polyimide')) && c.backingType.includes('Polyimide')) score += 40;
      if ((queryLower.includes('glass') || queryLower.includes('fiberglass')) && c.backingType.includes('Glass')) score += 40;
      if ((queryLower.includes('foam') || queryLower.includes('vhb')) && c.backingType.includes('Foam')) score += 40;
      if ((queryLower.includes('foil') || queryLower.includes('aluminium') || queryLower.includes('aluminum')) && c.backingType.includes('Foil')) score += 40;
      if (queryLower.includes('silicone') && c.adhesionType.includes('Silicone')) score += 35;
      if (queryLower.includes('acrylic') && c.adhesionType.includes('Acrylic')) score += 30;
      if ((queryLower.includes('heat') || queryLower.includes('temp') || queryLower.includes('high temperature')) && (c.tempRange.includes('Ultra-High') || c.tempRange.includes('High Temp'))) score += 30;
      if (queryLower.includes('masking') && (p.name.toLowerCase().includes('masking') || c.backingType.includes('Crepe') || c.backingType.includes('Polyimide'))) score += 30;
      if ((queryLower.includes('hvac') || queryLower.includes('duct')) && (p.market?.toLowerCase().includes('hvac') || c.backingType.includes('Foil'))) score += 35;
      if ((queryLower.includes('auto') || queryLower.includes('automotive')) && (p.market?.toLowerCase().includes('auto') || p.industry?.toLowerCase().includes('auto'))) score += 35;
      if ((queryLower.includes('transformer') || queryLower.includes('electrical') || queryLower.includes('class h') || queryLower.includes('class f')) && (p.market?.toLowerCase().includes('electr') || p.application?.toLowerCase().includes('transformer'))) score += 35;

      // Company industry affinity boost
      if (userIndustry && p.market && userIndustry.toLowerCase().includes(p.market.toLowerCase().slice(0, 5))) {
        score += 15;
      }

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
- Application: ${p.application || 'Industrial Engineering'}
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

    const SYSTEM_PROMPT = `
You are "TarasAI Finder Copilot", an elite B2B Industrial Adhesive Tapes & Technical Materials AI Sourcing Engineer.
You have direct, comprehensive access to our Master Industrial Product Database (160+ verified physical models from 3M, Tesa, Nitto Denko, CG Adhesive Products Ltd / CGAPL, Ajit Industries / AIPL, Sri Vasavi, Henkel Loctite, Saint-Gobain, Shurtape, Polycab, Havells).

CURRENT USER PROFILE:
- User Company: "${userCompany}"
- Company Industry / Sector: "${userIndustry}"

YOUR CORE WORKFLOW:
1. COMPANY & INDUSTRY SOURCING AWARENESS:
   - When suggesting products or greeting the user, align your recommendations directly with the engineering demands of ${userCompany}'s sector (${userIndustry}).
   - For example:
     * Automotive: Recommend wire harnessing tapes (tesa 51608/51036), acrylic foam exterior bonding (3M 4229P / VHB 4910), high-temp powder coating masking.
     * Electronics & PCB: Recommend Kapton polyimide (CGAPL 7011, 3M 5413), thermally conductive interface tapes (CGAPL 9500), copper foil EMI shielding (CGAPL ET9110).
     * Electrical & Transformers: Recommend Class H glass cloth (CGAPL 8415, Nitto 188UL), Nomex aramid paper (CGAPL 6512), self-fusing silicone busbar tapes (CGAPL 7500).
     * HVAC & Appliances: Recommend pure aluminium foil tapes (CGAPL ET900 HT, AIPL Aluminum, Shurtape AF 100), heavy duct sealing.

2. SUPERVISED TECHNICAL GROUNDING:
   - Ground all product recommendations exclusively in the MASTER DATABASE PRODUCTS provided below.
   - NEVER hallucinate fake product codes or companies.
   - For each recommended tape, provide:
     * Model name and real manufacturer
     * Backing substrate and adhesive chemistry
     * Temperature rating and certifications (UL, RDSO, CLW)
     * Technical Pros (2-3 strengths)
     * Engineering Cons (1-2 limitations or substrate caveats)
     * Clear application verdict

3. INTERACTIVE FOLLOW-UP OPTIONS:
   - Always output 3-5 concise, clickable multiple-choice option strings in the "options" array so the user can quickly specify technical requirements (e.g. ["Class H (Up to 260°C)", "Double Sided Foam", "Aluminium Foil Backing", "Request Anonymous RFQ", "Other"]).

JSON OUTPUT FORMAT:
Output your entire response strictly as valid JSON matching this schema:
{
  "type": "clarification" | "recommendation" | "comparison",
  "text": "Comprehensive technical markdown explanation covering materials chemistry, substrate adhesion, thermal performance, and comparisons.",
  "options": ["Option 1", "Option 2", "Option 3", "Other"],
  "recommendations": [
    {
      "name": "Exact Model Name",
      "companyName": "Manufacturer Name",
      "application": "Application description",
      "specs": { "Backing material": "...", "Adhesive type": "...", "Total thickness": "...", "Temperature resistance": "..." },
      "pros": ["Pro 1", "Pro 2"],
      "cons": ["Con 1"],
      "verdict": "Precise engineering verdict",
      "productUrl": "https://..."
    }
  ]
}
`;

    const fullPrompt = `${SYSTEM_PROMPT}

MASTER TECHNICAL PRODUCT MATRIX IN SYSTEM (160+ VERIFIED MODELS ACROSS ALL MAJOR MANUFACTURERS):
${dbContextString}

CHAT HISTORY:
${historyPrompt}`;

    const schemaProps = {
      type: { type: Type.STRING, description: "clarification, recommendation, or comparison" },
      text: { type: Type.STRING, description: "Comprehensive markdown response with technical analysis and comparison tables." },
      options: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "3-5 clickable interactive technical options for the user."
      },
      recommendations: {
        type: Type.ARRAY,
        description: "List of matching verified products with pros, cons, and technical specs.",
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
      console.error("[Copilot] AI Generation fallback:", aiErr);
      return NextResponse.json({
        success: true,
        text: `Based on **${userCompany}**'s industry profile and your query "${latestUserMessage}", here are the top verified matching tapes from our master database:`,
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
    console.error("[Copilot] Route error:", error);
    return NextResponse.json({ error: error.message || "Failed to process AI Copilot query" }, { status: 500 });
  }
}
