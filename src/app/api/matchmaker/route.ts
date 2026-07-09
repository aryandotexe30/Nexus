import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import axios from 'axios';

const prisma = new PrismaClient();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query } = await req.json();
    if (!query) {
      return NextResponse.json({ error: 'No query provided' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (user.credits <= 0) {
      return NextResponse.json({ error: 'Insufficient credits. Please upgrade your account.' }, { status: 403 });
    }

    // Search the internet globally for matches using Tavily
    const searchRes = await axios.post('https://api.tavily.com/search', {
      api_key: process.env.TAVILY_API_KEY,
      query: `Top companies in India for: ${query}. B2B, providers, buyers, list, contacts`,
      search_depth: 'advanced',
      include_answer: true,
      max_results: 10
    });

    const searchContext = searchRes.data.results?.map((r: any) => ({
      title: r.title,
      url: r.url,
      content: r.content?.substring(0, 800)
    }));

    const prompt = `
You are an expert B2B matchmaker and lead generation AI.
A user has submitted the following request: "${query}"

Here is raw internet search data representing potential companies in India that match their request:
${JSON.stringify(searchContext)}
${searchRes.data.answer ? `Internet Summary: ${searchRes.data.answer}` : ''}

Analyze the user's request and evaluate the provided internet search data to extract the best matching companies for buying, selling, or partnering.

Return a JSON array of the top matching companies. Maximum 5 matches.
If there are no good matches, return an empty array [].

CRITICAL FORMATTING RULES:
Strictly output a JSON array of objects with the following keys:
- "name": The company's name.
- "reason": A 2-3 sentence explanation of exactly why they are a perfect match for the user's specific request.
- "matchScore": A number from 0 to 100 indicating how strong the match is.
- "contact": The best email or person to contact (extracted from hr_contacts, sales_people, or board_of_directors). If none, output null.

Do not include markdown formatting around the JSON array.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let resultText = response.text || "";
    resultText = resultText.replace(/^```json/g, "").replace(/```$/g, "").trim();
    
    const matches = JSON.parse(resultText);

    // Deduct credits
    await prisma.user.update({
      where: { id: user.id },
      data: { credits: { decrement: 1 } }
    });

    return NextResponse.json({ success: true, matches, remainingCredits: user.role === 'ADMIN' ? 'Unlimited' : user.credits - 1 });
  } catch (error: any) {
    console.error("Matchmaker error:", error);
    return NextResponse.json({ error: 'Failed to process matchmaking request' }, { status: 500 });
  }
}
