import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import axios from 'axios';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // If we already have a cached profile, return it instantly
    if (user.companyProfile) {
      return NextResponse.json({ success: true, profile: user.companyProfile });
    }

    const companyName = user.companyName;
    if (!companyName) {
      return NextResponse.json({ error: 'No company name associated with your profile.' }, { status: 400 });
    }

    // Use Tavily to scrape data about their company
    const searchQuery = `"${companyName}" company overview, core business, target market, and manufacturing products supply chain`;
    const tavilyRes = await axios.post('https://api.tavily.com/search', {
      api_key: process.env.TAVILY_API_KEY,
      query: searchQuery,
      search_depth: 'advanced',
      include_answer: true,
      max_results: 3
    }, { timeout: 15000 }).catch(() => ({ data: { results: [] } }));

    const searchContext = JSON.stringify(tavilyRes.data.results?.map((r: any) => ({ t: r.title, c: r.content?.substring(0, 1000) })));

    // Ask Gemini to analyze their supply chain
    const prompt = `
You are an expert B2B supply chain consultant.
Analyze the following company to determine their core business, who they should buy raw materials from, and who they should sell their products to.

Company Name: ${companyName}
Industry (from profile): ${user.industry || 'Unknown'}

Context from Web Search:
${searchContext}

Based on this, generate a highly insightful JSON object with exactly this structure (output ONLY valid JSON):
{
  "summary": "A 2-sentence summary of what this company does and their core value proposition.",
  "targetCustomers": [
    { "type": "Specific Industry/Business Type (e.g. Automotive OEMs, Tier 1 Suppliers)", "reason": "Why they need this product" },
    { "type": "...", "reason": "..." },
    { "type": "...", "reason": "..." }
  ],
  "potentialSuppliers": [
    { "material": "Specific Raw Material (e.g. Copper Wire, Lithium)", "sourceType": "Type of supplier to look for (e.g. Foundries, Chemical Plants)" },
    { "material": "...", "sourceType": "..." },
    { "material": "...", "sourceType": "..." }
  ]
}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    let responseText = response.text || "";
    let profileData = null;

    try {
      const match = responseText.match(/\{[\s\S]*\}/);
      if (match) {
        profileData = JSON.parse(match[0]);
      } else {
        throw new Error("No JSON object found");
      }
    } catch (parseError) {
      console.error("Failed to parse Gemini output:", responseText);
      return NextResponse.json({ error: 'Failed to generate profile. Try again.' }, { status: 500 });
    }

    // Save to user model
    await prisma.user.update({
      where: { id: user.id },
      data: { companyProfile: profileData }
    });

    return NextResponse.json({ success: true, profile: profileData });

  } catch (error: any) {
    console.error("Company analysis error:", error);
    return NextResponse.json({ error: error.message || 'An error occurred.' }, { status: 500 });
  }
}
