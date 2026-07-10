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
    console.log(`[Equity Funding] Step 1: Searching for ${companyName}`);
    const tavilyCompanyRes = await axios.post('https://api.tavily.com/search', {
      api_key: process.env.TAVILY_API_KEY,
      query: `${companyName} company profile products services financials revenue profit market share competitors`,
      search_depth: 'advanced',
      include_answer: true,
      max_results: 5
    }, { timeout: 15000 });

    const companyContext = JSON.stringify(tavilyCompanyRes.data.results?.map((r: any) => ({ t: r.title, c: r.content?.substring(0, 1000) })));

    // Step 2: Extract MSME SME IPO and PE Trends
    console.log(`[Equity Funding] Step 2: Pulling Indian PE and SME IPO trends`);
    const tavilyEquityRes = await axios.post('https://api.tavily.com/search', {
      api_key: process.env.TAVILY_API_KEY,
      query: `India SME IPO BSE NSE Emerge requirements Private equity funding criteria for MSMEs 2026`,
      search_depth: 'basic',
      include_answer: true,
      max_results: 3
    }, { timeout: 15000 });

    const equityContext = JSON.stringify(tavilyEquityRes.data.results?.map((r: any) => ({ t: r.title, c: r.content?.substring(0, 800) })));

    // Step 3: Generate the Equity & IPO Plan
    console.log(`[Equity Funding] Step 3: Generating Strategy`);
    const planPrompt = `
You are a top-tier Investment Banker and Financial Advisor specializing in Indian MSMEs.
Your task is to create a highly detailed "Equity & SME IPO Roadmap" for "${companyName}".

CRITICAL INSTRUCTION: You MUST rely ONLY on accurate, verified real-world data from the provided context. NEVER use dummy data, make up numbers, or create hypothetical scenarios, "hypothetical MSME subsidiaries", or "what if" situations. If the company is already a large publicly listed corporation (e.g., Tata Motors, Reliance), explicitly acknowledge their true public status and immense scale instead of pretending they are an MSME. Deal strictly in facts.

You must use the provided context to first explain how Private Equity (PE) and SME IPOs (BSE SME / NSE Emerge) work in India, and then map this process EXACTLY to the company's specific, real-world financial situation.

Format the output as a beautiful, highly-readable Markdown document. Use Headers (##, ###), bullet points, bold text, and blockquotes where appropriate.
DO NOT wrap the entire output in a markdown code block (\`\`\`markdown). Just output the raw markdown text directly.

The Guide MUST include the following sections:
# Equity & SME IPO Roadmap: ${companyName}
## 1. Demystifying Equity for MSMEs
(Explain in simple terms what Private Equity vs. an SME IPO means, the pros/cons of each, and how Indian MSMEs are using them to scale).
## 2. Company Readiness Assessment
(Based on the scraped company context below, analyze their current financial readiness. Are they too small? Just right? What is their current market position?).
## 3. The Personalized Action Plan
(A highly specific, step-by-step roadmap of what ${companyName} MUST do over the next 2-3 years to successfully list or raise PE. Include corporatization, auditing, hiring merchant bankers, and EBITDA targets).
## 4. Valuation & Market Appeal
(How attractive is their specific industry to investors right now? What should they highlight in their pitch?).

Here is the context:

--- COMPANY CONTEXT ---
${companyContext}

--- SME IPO & PE TRENDS CONTEXT ---
${equityContext}
`;

    const planRes = await ai.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: planPrompt,
    });

    const roadmap = planRes.text || "Failed to generate equity roadmap.";

    return NextResponse.json({ 
      success: true, 
      roadmap,
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
    console.error("Equity Funding error:", error);
    return NextResponse.json({ error: error.message || 'An error occurred during generation' }, { status: 500 });
  }
}
