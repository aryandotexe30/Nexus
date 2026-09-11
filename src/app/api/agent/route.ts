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

    // 1. Query Master ExtractedProduct Database in PostgreSQL for live grounding
    let dbProducts: any[] = [];
    try {
      // Extract keywords from user query
      const searchTerms = latestUserMessage
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter((w: string) => w.length > 2 && !['the', 'and', 'for', 'with', 'need', 'want', 'buy', 'how', 'what', 'which', 'can', 'you', 'give'].includes(w.toLowerCase()));

      const orConditions: any[] = [
        { name: { contains: latestUserMessage.slice(0, 30), mode: 'insensitive' } },
        { application: { contains: latestUserMessage.slice(0, 30), mode: 'insensitive' } }
      ];

      for (const term of searchTerms.slice(0, 4)) {
        orConditions.push({ name: { contains: term, mode: 'insensitive' } });
        orConditions.push({ application: { contains: term, mode: 'insensitive' } });
        orConditions.push({ companyName: { contains: term, mode: 'insensitive' } });
      }

      const fetched = await prisma.extractedProduct.findMany({
        where: {
          OR: orConditions
        },
        take: 25,
        orderBy: { updatedAt: 'desc' }
      });

      dbProducts = fetched.filter((p: any) => isValidProduct(p.name, p.productUrl, Object.keys(p.specs || {}).length));

      // If specific search yields few, fetch high-quality sample models from each top brand
      if (dbProducts.length < 8) {
        const topBrands = ['Tesa', '3M', 'Ajit Industries (AIPL)', 'Sri Vasavi Tapes', 'Polycab', 'Havells'];
        const sampleProducts = await prisma.extractedProduct.findMany({
          where: {
            companyName: { in: topBrands }
          },
          take: 20,
          orderBy: { createdAt: 'desc' }
        });
        const validSamples = sampleProducts.filter((p: any) => isValidProduct(p.name, p.productUrl, Object.keys(p.specs || {}).length));
        dbProducts = Array.from(new Map([...dbProducts, ...validSamples].map(p => [p.name, p])).values()).slice(0, 30);
      }
    } catch (dbErr) {
      console.warn("Database search in Copilot noticed:", dbErr);
    }

    // Format DB context
    const dbContextString = dbProducts.map((p: any, i: number) => {
      const specsStr = Object.entries(p.specs || {})
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
      return `[Product #${i+1}] Name: ${p.name} | Manufacturer: ${p.companyName} | Market: ${p.market || 'Industrial'} | Application: ${p.application || 'General'} | Specs: { ${specsStr} } | URL: ${p.productUrl || ''}`;
    }).join('\n');

    // 2. Search live internet if database context is minimal
    let searchContext = "";
    if (dbProducts.length < 3) {
      try {
        const tavilyRes = await fetchVerifiedInternetData(`"${latestUserMessage}" technical specifications datasheet TDS manufacturer`, 3, false);
        searchContext = tavilyRes.contextString;
      } catch (e) {}
    }

    // 3. Format Conversation History
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

MASTER DATABASE PRODUCTS IN SYSTEM (GROUND TRUTH):
${dbContextString || "Master database connected."}

ADDITIONAL MARKET INTELLIGENCE:
${searchContext || "No external search required; use master database."}

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
        text: `I found ${dbProducts.length} verified products in our master catalog matching "${latestUserMessage}". Here are the top options:`,
        options: ["View Technical Datasheets", "Request Anonymous RFQ", "Compare Specifications", "Other"],
        recommendations: dbProducts.slice(0, 3).map(p => ({
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

