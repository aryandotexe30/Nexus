import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import axios from 'axios';
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { companyName } = data;

    if (!companyName || typeof companyName !== 'string') {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    if (companyName.length > 100) {
      return NextResponse.json({ error: 'Company name is too long' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    
    // Deduct credits upfront to prevent race conditions
    if (user.role !== 'ADMIN') {
      if (user.credits <= 0) {
        return NextResponse.json({ error: 'Insufficient credits. Please upgrade your account.' }, { status: 403 });
      }
      await prisma.user.update({
        where: { id: user.id },
        data: { credits: { decrement: 1 } }
      });
    }

    try {

    // Step 1: Initial Reconnaissance on the Company
    console.log(`[Business Plan] Step 1: Searching for ${companyName}`);
    const tavilyCompanyRes = await axios.post('https://api.tavily.com/search', {
      api_key: process.env.TAVILY_API_KEY,
      query: `${companyName} company profile products services business model financial performance revenue market share competitors`,
      search_depth: 'advanced',
      include_answer: true,
      max_results: 5
    }, { timeout: 15000 });

    const companyContext = JSON.stringify(tavilyCompanyRes.data.results?.map((r: any) => ({ t: r.title, c: r.content?.substring(0, 1000) })));

    // Step 2: Identify the Industry
    console.log(`[Business Plan] Step 2: Identifying Industry`);
    const industryPrompt = `Based on the following search results for ${companyName}, identify the specific industry this company operates in (e.g., "Renewable Energy", "Fintech", "E-commerce"). Return ONLY the industry name, nothing else.\n\nContext:\n${companyContext}`;
    
    const industryRes = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: industryPrompt,
    });
    const industry = (industryRes.text || "").trim();
    console.log(`[Business Plan] Identified Industry: ${industry}`);

    if (!industry || industry.length > 50) {
       throw new Error("Could not accurately identify the industry.");
    }

    // Step 3: Macro-Economic Search for the Industry
    console.log(`[Business Plan] Step 3: Macro-Economic Search for ${industry}`);
    const tavilyIndustryRes = await axios.post('https://api.tavily.com/search', {
      api_key: process.env.TAVILY_API_KEY,
      query: `${industry} industry market trends growth projections challenges 2026-2030 global India`,
      search_depth: 'advanced',
      include_answer: true,
      max_results: 5
    }, { timeout: 15000 });

    const industryContext = JSON.stringify(tavilyIndustryRes.data.results?.map((r: any) => ({ t: r.title, c: r.content?.substring(0, 1000) })));

    // Step 4: Generate the 5-Year Business Plan
    console.log(`[Business Plan] Step 4: Generating 5-Year Plan`);
    const planPrompt = `
You are a world-class McKinsey Strategic Business Consultant. 
Your task is to synthesize a highly accurate, DATA-BACKED 5-Year Strategic Business Model and Growth Plan for "${companyName}".

CRITICAL INSTRUCTION: You MUST rely ONLY on accurate, verified real-world data from the provided context. NEVER use dummy data, make up numbers, or create hypothetical scenarios. If the company's actual data is sparse, state exactly what is verified and do not hallucinate fillers. Deal strictly in facts.

DO NOT rely on generic hypotheticals. You MUST use the specific financial data, competitor information, and industry projections provided in the context below to justify your roadmap. I want YOU to act as their Chief Strategy Officer and create a bold, highly-actionable 5-year roadmap for their future growth, strictly rooted in reality.

You must meticulously analyze the provided context:
1. Extract and cite their current operational and financial data, identifying their precise market position.
2. Leverage the macro-economic trends and projections for their specific industry (${industry}) between 2026-2030 to identify actionable gaps and lucrative opportunities.
3. Propose NEW revenue streams, NEW product lines, and NEW markets they should aggressively expand into, explicitly stating the data that supports these moves.

Format the output as a beautiful, highly-readable Markdown document. Use Headers (##, ###), bullet points, bold text, and blockquotes where appropriate.
DO NOT wrap the entire output in a markdown code block (\`\`\`markdown). Just output the raw markdown text directly.

The Business Plan MUST include the following sections:
# 5-Year Strategic Business Plan: ${companyName}
## 1. Executive Summary & Future Vision
(Where are they today, and what is your bold vision for them by 2030?)
## 2. Data-Backed Evolved Business Model & Revenue Strategy
(Propose your ideas for how they can completely evolve their business model to make significantly more money. You MUST reference their current competitors and financial position from the context)
## 3. Innovative Growth & Expansion Opportunities
(What brand new products, services, or demographics MUST they target based on upcoming industry trends?)
## 4. Year-by-Year Strategic Roadmap (2026-2030)
(A phased, step-by-step action plan of what they need to build and do each year)
## 5. Risk Assessment & Mitigation
(What could destroy this plan, and how to survive it)

Here is the context:

--- COMPANY CONTEXT ---
${companyContext}

--- INDUSTRY CONTEXT (${industry}) ---
${industryContext}
`;

    // Using gemini-2.5-flash for speed as the prompt is a bit shorter than a full codebase, 
    // and flash is incredibly smart and fast for text generation. 
    // "gemini-2.5-pro" is not available in the current standard client configuration without explicit setup.
    const planRes = await ai.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: planPrompt,
    });

    const businessPlan = planRes.text || "Failed to generate business plan.";

    return NextResponse.json({ 
      success: true, 
      businessPlan,
      industry,
      remainingCredits: user.role === 'ADMIN' ? 'Unlimited' : user.credits - 1
    });

    } catch (innerError: any) {
      // Refund credit on failure
      if (user.role !== 'ADMIN') {
        await prisma.user.update({
          where: { id: user.id },
          data: { credits: { increment: 1 } }
        });
      }
      throw innerError;
    }

  } catch (error: any) {
    console.error("Business Plan error:", error);
    return NextResponse.json({ error: error.message || 'An error occurred during generation' }, { status: 500 });
  }
}
