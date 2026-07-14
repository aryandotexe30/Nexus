import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import axios from 'axios';
import { encrypt } from "@/lib/encryption";


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

    // Fetch proprietary database for context
    const dbCompanies = await prisma.company.findMany({
      take: 50, // Limit to prevent payload bloat
      select: { name: true, data: true }
    });
    
    // Search the internet globally for matches using Tavily
    let searchContext = [];
    let searchAnswer = "";
    try {
      const searchRes = await axios.post('https://api.tavily.com/search', {
        api_key: process.env.TAVILY_API_KEY,
        query: `Top companies in India for: ${query}. B2B, providers, buyers, list, contacts`,
        search_depth: 'advanced',
        include_answer: true,
        max_results: 5
      }, { timeout: 20000 });
      
      searchContext = searchRes.data.results?.map((r: any) => ({
        title: r.title,
        url: r.url,
        content: r.content?.substring(0, 800)
      })) || [];
      searchAnswer = searchRes.data.answer || "";
    } catch (e) {
      console.log("Tavily search timeout or error in Matchmaker, relying on DB.");
    }

    const prompt = `
You are an expert B2B matchmaker, intent parser, and lead generation AI.
A user has submitted the following request: "${query}"

CRITICAL INTENT PARSING RULES:
First, determine if the user wants to BUY (procure) or SELL (supply) a product.
- If they want to SELL (or supply/export), you MUST strictly find companies that PURCHASE that material as a raw material or input. Do NOT show them other competitors who sell the same thing.
- If they want to BUY (or procure/import), you MUST strictly find companies that MANUFACTURE or SELL that material.

Here is data from our Proprietary Database of pre-vetted companies:
${JSON.stringify(dbCompanies)}

Here is raw internet search data representing potential companies in India:
${JSON.stringify(searchContext)}
${searchAnswer ? `Internet Summary: ${searchAnswer}` : ''}

Analyze the user's intent. Then extract the best matching companies (prioritize the Proprietary Database first, then fallback to internet search data).

Return a JSON array of the top matching companies. EXACTLY up to 10 matches, prioritizing companies located in India.
If there are no good matches, return an empty array [].

CRITICAL FORMATTING RULES:
Strictly output a JSON array of objects with the following keys:
- "realName": The company's actual real name.
- "intent": Either "BUYING" or "SELLING" based on what the user wants to do.
- "reason": A 2-3 sentence explanation of exactly why they are a perfect match based on the parsed intent.
- "description": A highly detailed description of the company.
- "properties": An array of strings representing an EXTENSIVE list of technical properties or keywords associated with the match.
- "matchScore": A number from 0 to 100 indicating how strong the match is.
- "parsedData": A JSON object containing all known verified data about this company (e.g., location, industry, phone, email, raw_materials_purchased, products). Extract this from the Proprietary Database or construct it from the internet search.
- "prefillQuantity": A suggested quantity based on standard B2B orders for this product (e.g., "500").
- "prefillUnit": The unit for the quantity (e.g., "Pieces", "Rolls", "Kg").
- "prefillProduct": The simplified name of the product they are looking for (e.g., "Double Sided Foam Tapes").
- "prefillDetails": A short professional 1-2 sentence message body.

Do not include markdown formatting around the JSON array.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let resultText = response.text || "";
    resultText = resultText.replace(/```json/gi, "").replace(/```/g, "").trim();
    
    const matches = JSON.parse(resultText);

    // Send full data to frontend for "Lead Finder" UI
    const secureMatches = matches.map((m: any) => {
      const sensitiveData = JSON.stringify({
        realName: m.realName,
        contactEmail: m.parsedData?.email || m.contactEmail,
        contactPhone: m.parsedData?.phone || m.contactPhone
      });
      const targetToken = encrypt(sensitiveData);
      
      return {
        realName: m.realName, // WE NOW EXPOSE THE REAL NAME
        intent: m.intent,
        reason: m.reason,
        description: m.description,
        parsedData: m.parsedData || {},
        properties: m.properties || [],
        matchScore: m.matchScore,
        targetToken,
        prefillQuantity: m.prefillQuantity,
        prefillUnit: m.prefillUnit,
        prefillProduct: m.prefillProduct,
        prefillDetails: m.prefillDetails
      };
    });

    // Store all found companies in the Database for quick access by Admins
    for (const m of matches) {
      if (m.realName) {
        try {
          await prisma.company.upsert({
            where: { name: m.realName },
            update: {}, // Don't overwrite existing rich data
            create: {
              name: m.realName,
              data: {
                description: m.description || m.reason,
                products: [m.prefillProduct || query],
                source: "Matchmaker Hybrid Search",
                ...m.parsedData
              }
            }
          });
        } catch (dbErr) {
          console.error("Failed to store discovered company in DB", dbErr);
        }
      }
    }

    // Deduct credits
    await prisma.user.update({
      where: { id: user.id },
      data: { credits: { decrement: 1 } }
    });

    return NextResponse.json({ success: true, matches: secureMatches, remainingCredits: user.role === 'ADMIN' ? 'Unlimited' : user.credits - 1 });
  } catch (error: any) {
    console.error("Matchmaker error:", error);
    return NextResponse.json({ error: 'Failed to process matchmaking request' }, { status: 500 });
  }
}
