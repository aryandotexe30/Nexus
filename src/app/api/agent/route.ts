import { NextResponse } from 'next/server';
import { Type } from '@google/genai';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { fetchVerifiedInternetData, generateStructuredAIResponse } from "@/lib/searchProtocol";
import { isValidProduct } from "@/lib/deepProductHarvester";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        companyName: true,
        industry: true,
        isVerified: true,
        role: true,
        credits: true,
        plan: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isAdmin = user.role === 'ADMIN';
    const isVerified = user.isVerified || isAdmin;
    const credits = isAdmin || user.plan === 'ENTERPRISE' ? 'Unlimited' : user.credits;

    return NextResponse.json({
      success: true,
      isVerified,
      credits,
      rawCredits: user.credits,
      plan: user.plan,
      role: user.role,
      companyName: user.companyName,
      industry: user.industry
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch user status' }, { status: 500 });
  }
}

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

    // Fetch user details for company-aware personalization, KYC verification, and credit checking
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true, 
        companyName: true, 
        industry: true, 
        domain: true, 
        gstNumber: true, 
        isVerified: true, 
        role: true, 
        credits: true, 
        plan: true 
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const isAdmin = user.role === 'ADMIN';

    // 1. Enforce KYC Verification: Account must be verified or ADMIN
    if (!user.isVerified && !isAdmin) {
      return NextResponse.json({ 
        error: 'KYC_UNVERIFIED', 
        message: 'Your account KYC is currently unverified. Please complete company KYC verification in Settings to unlock the AI Materials Copilot.' 
      }, { status: 403 });
    }

    // 2. Enforce Credits: Check if user has sufficient query credits
    if (!isAdmin && user.plan !== 'ENTERPRISE' && user.credits <= 0) {
      return NextResponse.json({ 
        error: 'INSUFFICIENT_CREDITS', 
        message: 'You have 0 Copilot credits remaining. Please upgrade your plan or purchase additional credits.' 
      }, { status: 403 });
    }

    const userCompany = companyContext?.companyName || user?.companyName || "Your Enterprise";
    const userIndustry = companyContext?.industry || user?.industry || "Industrial Manufacturing & Assembly";

    const latestUserMessage = messages[messages.length - 1]?.text || "";

    // 1. Gather all verified enterprise catalogs (3,370+ physical models across all regions) and database products
    const { ENTERPRISE_CATALOGS } = await import('@/lib/enterpriseCatalogs');
    const { classifyProduct } = await import('@/lib/productClassifier');
    const { clusterProducts } = await import('@/lib/productClusterEngine');

    let allRawProducts: any[] = [];

    // Collect all enterprise catalog items
    for (const [catCompany, items] of Object.entries(ENTERPRISE_CATALOGS || {})) {
      for (const item of items) {
        allRawProducts.push({
          id: `cat-${catCompany}-${item.name.replace(/\s+/g, '-').toLowerCase()}`,
          name: item.name,
          companyName: catCompany,
          productUrl: item.productUrl,
          industry: item.industry,
          market: item.market,
          application: item.application,
          specs: item.specs,
          price: item.price || item.specs?.['Indicative Price'] || item.specs?.['Price'],
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
        take: 500,
        orderBy: { updatedAt: 'desc' }
      });
      const validDb = dbFetched.filter((p: any) => isValidProduct(p.name, p.productUrl, Object.keys(p.specs || {}).length));
      for (const p of validDb) {
        if (!allRawProducts.some(ap => ap.name.toLowerCase() === p.name.toLowerCase())) {
          allRawProducts.push({
            id: p.id,
            name: p.name,
            companyName: p.companyName,
            productUrl: p.productUrl,
            industry: p.industry,
            market: p.market,
            application: p.application,
            specs: p.specs,
            price: (p.specs as any)?.['Indicative Price'] || (p.specs as any)?.['Price'],
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

    // 2. Cluster all products into unified Tarasai Specification Standards
    const clusteredTarasaiStandards = clusterProducts(allRawProducts);

    // 3. Intelligent Semantic Ranking on Tarasai Specification Standards
    const queryLower = latestUserMessage.toLowerCase();
    const queryTokens = queryLower
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w: string) => w.length > 2 && !['the', 'and', 'for', 'with', 'need', 'want', 'buy', 'how', 'what', 'which', 'can', 'you', 'give', 'tape', 'tapes', 'show'].includes(w));

    const scoredStandards = clusteredTarasaiStandards.map(std => {
      let score = 0;
      const c = std.classification || {};
      const specs = std.specs || {};
      const text = `${std.serialCode} ${std.name} ${std.application || ''} ${std.market || ''} ${JSON.stringify(specs)} ${(c.attributesList || []).join(' ')}`.toLowerCase();

      // Exact phrase match
      if (text.includes(queryLower)) score += 80;

      // Token matches
      for (const token of queryTokens) {
        if (text.includes(token)) score += 15;
        if (std.name.toLowerCase().includes(token)) score += 30;
        if (std.serialCode.toLowerCase().includes(token)) score += 40;
      }

      // Feature & Substrate Boosts
      if (queryLower.includes('kapton') || queryLower.includes('polyimide')) {
        if (std.serialCode.includes('KAP') || text.includes('polyimide') || text.includes('kapton')) score += 70;
      }
      if (queryLower.includes('vhb') || queryLower.includes('acrylic foam') || queryLower.includes('foam')) {
        if (std.serialCode.includes('VHB') || std.serialCode.includes('PEF')) score += 60;
      }
      if (queryLower.includes('masking') || queryLower.includes('crepe')) {
        if (std.serialCode.includes('MSK')) score += 60;
      }
      if (queryLower.includes('aluminum') || queryLower.includes('aluminium') || queryLower.includes('foil')) {
        if (std.serialCode.includes('ALU')) score += 60;
      }
      if (queryLower.includes('glass') || queryLower.includes('fiberglass')) {
        if (std.serialCode.includes('GLS')) score += 60;
      }
      if (queryLower.includes('mica')) {
        if (std.serialCode.includes('MIC')) score += 60;
      }
      if (queryLower.includes('silicone') && std.serialCode.includes('SIL')) score += 40;
      if (queryLower.includes('acrylic') && std.serialCode.includes('ACR')) score += 35;
      if (queryLower.includes('rubber') && std.serialCode.includes('RUB')) score += 35;

      // Specific Thickness / Temp matching
      if (queryLower.includes('0.05') || queryLower.includes('50') || queryLower.includes('2 mil')) {
        if (std.serialCode.includes('0050')) score += 50;
      }
      if (queryLower.includes('0.07') || queryLower.includes('70') || queryLower.includes('3 mil')) {
        if (std.serialCode.includes('0070') || std.serialCode.includes('0075')) score += 50;
      }
      if (queryLower.includes('260') || queryLower.includes('wave solder')) {
        if (std.serialCode.includes('T260')) score += 50;
      }
      if (queryLower.includes('180') || queryLower.includes('class h')) {
        if (std.serialCode.includes('T180')) score += 50;
      }

      return { standard: std, score };
    });

    scoredStandards.sort((a, b) => b.score - a.score);
    const topStandards = (scoredStandards[0]?.score > 0 ? scoredStandards.slice(0, 15) : scoredStandards.slice(0, 10)).map(s => s.standard);

    // Format Clustered Tarasai Specification Standards for AI context
    const dbContextString = topStandards.map((s: any, i: number) => {
      const specsStr = Object.entries(s.specs || {})
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
      return `[Tarasai Standard #${i+1}]
- Tarasai Serial Code: ${s.serialCode}
- Specification Standard: ${s.name}
- Wholesale Benchmark Price: ${s.price}
- Backing: ${s.specs?.['Backing material'] || 'Specialty Carrier'} | Adhesive: ${s.specs?.['Adhesive type'] || 'Pressure Sensitive'}
- Caliper/Thickness: ${s.specs?.['Total thickness'] || 'Standard'} | Thermal Endurance: ${s.specs?.['Temperature resistance'] || 'Industrial Grade'}
- Application Scope: ${s.application || 'Industrial Engineering'}
- Full Technical Spec: { ${specsStr} }`;
    }).join('\n\n');

    // Format Conversation History cleanly
    const formattedMessages = messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'User' : 'Assistant',
      text: msg.text
    }));

    const historyPrompt = formattedMessages.map((m: any) => `${m.role}: ${m.text}`).join("\n\n");

    const SYSTEM_PROMPT = `
You are "TarasAI Copilot", an elite B2B Senior Materials & Adhesive Applications Engineer.
You represent the TarasAI Technical Procurement Consortium. You have access to our unified Specification Cluster Database containing standardized industrial products.

CURRENT CLIENT CONTEXT:
- Client Enterprise: "${userCompany}"
- Operating Sector: "${userIndustry}"

CORE OPERATIONAL BEHAVIORS:
1. ACTUAL AI MATERIALS APPLICATION ENGINEER (INTERACTIVE REQUIREMENTS GATHERING):
   - When a user enters a broad, brief, or underspecified query (such as just "kapton tape", "masking tape", "vhb tape", "foam tape", "insulation tape", "silicone tape", "foil tape", etc.) WITHOUT stating key engineering variables:
     * Act like a real senior materials engineer! Greet the inquiry technically, explain what physical parameters govern the correct specification selection, and actively ask the user for their exact requirements:
       1. Total Caliper / Film Thickness (e.g., 0.05mm / 2 mil standard, 0.07mm / 3 mil dielectric, 0.10mm heavy-duty)
       2. Continuous Temperature Rating & Process (e.g., 260°C Wave Soldering, 180°C Class H Motor Insulation, 300°C High-Bake Reflow)
       3. Adhesive Chemistry (e.g., Cross-linked Silicone for zero residue vs Solvent Acrylic)
       4. Specific Application / Substrate (e.g., PCB Gold Finger Masking, Lithium-Ion Battery Tab Wrapping, Transformer Winding)
     * In "options", provide 4-5 clear, clickable interactive requirement choices matching these variants (e.g., ["0.05mm Silicone 260°C (PCB Wave Solder)", "0.07mm Class H 180°C (Transformer Insulation)", "0.06mm Flame-Retardant (Battery Tab Wrap)", "0.09mm High-Bake 300°C (Powder Coating)"]).
     * In "recommendations", you may present 1-2 representative baseline Tarasai grouped standards matching that category so the user sees real benchmark specs while deciding.
   - When the user selects an option chip or provides specific engineering requirements:
     * Deliver the exact matching Tarasai specification standard(s) in "recommendations" with thorough engineering analysis in "text".
     * In "options", provide next-step actions (e.g., ["Request Confidential Volume RFQ", "Inquire Custom Roll Width Slitting", "Check Dielectric Breakdown Specs", "Compare with 0.07mm Class H"]).

2. STRICT TARASAI CODE & UNIFIED STANDARD FORMAT (NO MANUFACTURER NAMES):
   - Every product in "recommendations" MUST use its unique **Tarasai Serial Code** (e.g. "TAR-KAP-SIL-0050-T260-G841", "TAR-VHB-ACR-1100-T150-G219", "TAR-MSK-RUB-0140-T110-G705") in the "serialCode" field.
   - The "name" must be the professional unified specification standard title (e.g. "High-Temperature Polyimide (Kapton) Tape (0.05 mm / Silicone / 260°C)").
   - In "companyName", always set "Tarasai Verified Consortium".
   - **CRITICAL**: NEVER display individual competitor manufacturer brand names (e.g., DO NOT say "3M", "3M 5413", "CGAPL", "Shenzhen You-San", "AIPL", etc.). The buyer is interacting with Tarasai as a single unified procurement standard.
   - Include realistic wholesale benchmark pricing (in ₹ INR / $ USD) in "price".
   - Provide 2-3 detailed engineering pros (strengths), 1-2 honest engineering caveats (cons), and a 1-sentence engineering verdict.

JSON OUTPUT FORMAT:
Output your entire response strictly as valid JSON matching this schema:
{
  "type": "recommendation" | "inquiry",
  "text": "Detailed, professional engineering analysis in markdown explaining materials chemistry, thermal endurance, dielectric properties, and requirement clarification questions.",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "recommendations": [
    {
      "serialCode": "TAR-KAP-SIL-0050-T260-G841",
      "name": "High-Temperature Polyimide (Kapton) Tape (0.05 mm / Silicone / 260°C)",
      "companyName": "Tarasai Verified Consortium",
      "price": "₹340.00 / roll ($4.20)",
      "application": "PCB wave solder masking & gold finger protection",
      "specs": {
        "Backing material": "Polyimide (Kapton) Film",
        "Adhesive type": "High-Temp Cross-Linked Silicone",
        "Total thickness": "0.05 mm (50 µm)",
        "Temperature resistance": "-73°C to 260°C",
        "Dielectric Breakdown": "6.5 kV",
        "Adhesion to Steel": "28.0 N/25mm"
      },
      "pros": ["Zero adhesive residue post 260°C wave solder bath", "UL-94 V-0 flame retardancy", "Class H electrical insulation"],
      "cons": ["Requires clean, degreased substrate for maximum initial tack"],
      "verdict": "Industry standard benchmark specification for electronics wave soldering and high-temperature masking."
    }
  ]
}
`;

    const fullPrompt = `${SYSTEM_PROMPT}

TARASAI SPECIFICATION CLUSTER DATABASE (VERIFIED GROUPED STANDARDS):
${dbContextString}

CHAT HISTORY:
${historyPrompt}`;

    const schemaProps = {
      type: { type: Type.STRING, description: "recommendation or inquiry" },
      text: { type: Type.STRING, description: "Comprehensive markdown engineering response with materials chemistry, thermal analysis, and clarifying questions." },
      options: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "3-5 interactive clickable options for the user."
      },
      recommendations: {
        type: Type.ARRAY,
        description: "List of matching Tarasai specification standards with Tarasai serial code, pros, cons, and unified specs.",
        items: {
          type: Type.OBJECT,
          properties: {
            serialCode: { type: Type.STRING },
            name: { type: Type.STRING },
            companyName: { type: Type.STRING },
            price: { type: Type.STRING },
            application: { type: Type.STRING },
            specs: { type: Type.OBJECT },
            pros: { type: Type.ARRAY, items: { type: Type.STRING } },
            cons: { type: Type.ARRAY, items: { type: Type.STRING } },
            verdict: { type: Type.STRING },
            productUrl: { type: Type.STRING }
          },
          required: ["serialCode", "name", "specs", "pros", "cons", "verdict"]
        }
      }
    };

    let data: any = null;
    const { evaluateMaterialsConversation } = await import('@/lib/materialsReasoningEngine');

    // Attempt AI Generation if LLM credentials are configured
    if (process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY || process.env.OLLAMA_BASE_URL) {
      try {
        data = await generateStructuredAIResponse(fullPrompt, schemaProps, ["type", "text", "options"]);
      } catch (aiErr: any) {
        console.warn("[Copilot] LLM generation failed, switching to deterministic engineering engine:", aiErr.message);
      }
    }

    // If LLM was not used or failed, run the deterministic Materials Application Reasoning Engine
    if (!data || !data.text) {
      data = evaluateMaterialsConversation(
        messages,
        userCompany,
        userIndustry,
        clusteredTarasaiStandards
      );
    }

    // Deduct 1 credit for non-admin, non-enterprise users
    let remainingCredits: number | string = 'Unlimited';
    if (!isAdmin && user.plan !== 'ENTERPRISE') {
      try {
        const { logCreditTransaction } = await import('@/lib/audit');
        await logCreditTransaction({
          userId: user.id,
          amount: -1,
          type: 'AI_USAGE',
          description: `Copilot Technical Query: "${latestUserMessage.substring(0, 45)}..."`
        });
        remainingCredits = Math.max(0, user.credits - 1);
      } catch (creditErr) {
        const updated = await prisma.user.update({
          where: { id: user.id },
          data: { credits: { decrement: 1 } }
        });
        remainingCredits = updated.credits;
      }
    }

    // Map underlying manufacturers for RFQ routing on recommended standards
    const finalRecs = (data.recommendations || []).map((rec: any) => {
      // Find matching standard to attach underlying manufacturers for background RFQ
      const matchedStd = clusteredTarasaiStandards.find(s => 
        s.serialCode === rec.serialCode || 
        s.name.toLowerCase() === rec.name?.toLowerCase()
      );
      return {
        ...rec,
        serialCode: rec.serialCode || matchedStd?.serialCode || `TAR-${(rec.name || 'SPEC').substring(0, 3).toUpperCase()}`,
        companyName: "Tarasai Verified Consortium",
        price: rec.price || matchedStd?.price || "₹340.00 / roll ($4.20)",
        underlyingManufacturers: matchedStd?.underlyingManufacturers || []
      };
    });

    return NextResponse.json({
      success: true,
      text: data.text || "Here are the engineering parameters and matching Tarasai standards:",
      options: data.options || ["Request Confidential Volume RFQ", "Request 1-Roll Verification Sample", "Inquire Custom Roll Width Slitting", "Other"],
      recommendations: finalRecs,
      creditsRemaining: remainingCredits
    });

  } catch (error: any) {
    console.error("[Copilot] Route error:", error);
    return NextResponse.json({ error: error.message || "Failed to process AI Copilot query" }, { status: 500 });
  }
}
