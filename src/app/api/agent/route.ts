import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import axios from 'axios';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";


const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `
You are "Nexus", an elite B2B procurement and lead generation consultant focused EXCLUSIVELY on the Indian MSME (Micro, Small, and Medium Enterprises) market.

YOUR CORE DIRECTIVE:
1. INTENT PARSING & SPECIFICATION GATHERING:
   First, determine if the user wants to BUY (procure) or SELL (supply). 
   - If they want to SELL, you must help them find BUYERS (companies that purchase their material as raw inputs). DO NOT SHOW OTHER SELLERS OR MANUFACTURERS OF THAT PRODUCT.
   - If they want to BUY, you must help them find SELLERS (companies that manufacture or supply the material).
   Briefly check if you have enough technical details. If it's too vague, ask ONE highly targeted, friendly question to gather the most critical missing spec (e.g., temperature, thickness, or load capacity). DO NOT interrogate them. DO NOT ask about budget.
   
2. A-TO-Z PRODUCT PITCH & VERIFIED LEADS (INDIAN MSME FOCUS):
   Once you have enough context, you must output a highly detailed, A-to-Z technical description of the exact product. 
   You must extract ALL comprehensive technical specifications.
   You must list AS MANY VERIFIED COMPANIES as possible (aim for 5-10 or more) from the PROVIDED MARKET INTELLIGENCE or PROPRIETARY DATABASE.
   CRITICAL: Use their REAL NAMES based on the provided database context. Only use "Supplier X" or "Buyer X" if you cannot find a real verified company name in the provided context. 

JSON OUTPUT ENFORCEMENT:
You MUST ALWAYS output your response as a valid JSON object enclosed in \`\`\`json blocks.

If you are asking a clarifying question, use this structure:
{
  "type": "clarification",
  "text": "Your ONE friendly question here.",
  "options": ["Option 1", "Option 2", "Option 3", "Other"]
}

If you are providing the FINAL PITCH AND VERIFIED LEADS, use this exact structure:
{
  "type": "final_pitch",
  "productName": "Generic name of the product",
  "description": "Your complete A-to-Z highly detailed description and technical breakdown suitable for the Indian MSME market.",
  "vendors": [
    {
      "alias": "The REAL Company Name (or 'Buyer/Supplier X' if unknown)",
      "location": "State/City",
      "specialty": "Their core business",
      "specs": { "Key 1": "Value", "Key 2": "Value" },
      "matchReason": "A 2-3 sentence explanation of exactly why they match the user's intent."
    }
  ],
  "messageToUser": "A friendly concluding message."
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

    const latestUserMessage = messages[messages.length - 1].text;

    // Fetch proprietary database for context
    const allDbCompanies = await prisma.company.findMany({
      select: { name: true, data: true }
    });

    const queryWords = latestUserMessage.toLowerCase().split(' ').filter((w: string) => w.length > 2);
    const dbCompanies = allDbCompanies.filter(c => {
      const dataStr = JSON.stringify(c.data).toLowerCase();
      return queryWords.length === 0 || queryWords.some((w: string) => dataStr.includes(w) || c.name.toLowerCase().includes(w));
    }).slice(0, 20);

    // Search Tavily for real-time market data fallback
    let searchContext = "";
    try {
      const tavilyRes = await axios.post('https://api.tavily.com/search', {
        api_key: process.env.TAVILY_API_KEY,
        query: `Top companies in India for: ${latestUserMessage}. B2B, buyers, sellers, contacts`,
        search_depth: 'basic',
        include_answer: true,
        max_results: 3
      }, { timeout: 5000 });
      
      searchContext = JSON.stringify(tavilyRes.data.results?.map((r: any) => ({ t: r.title, c: r.content?.substring(0, 300) })));
    } catch (e) {
      console.log("Tavily search skipped or failed in Copilot.");
    }

    // Filter out the initial greeting
    let filteredMessages = messages;
    if (messages.length > 0 && messages[0].role === 'ai' && messages[0].text.includes("Hello! I am Nexus")) {
      filteredMessages = messages.slice(1);
    }

    const formattedMessages = filteredMessages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    if (formattedMessages.length === 0) {
      return NextResponse.json({ error: 'No user messages found' }, { status: 400 });
    }

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `${SYSTEM_PROMPT}\n\nPROPRIETARY DATABASE CONTEXT:\n${JSON.stringify(dbCompanies)}\n\nMARKET INTELLIGENCE (INTERNET SEARCH FALLBACK):\n${searchContext || "No real-time data."}`,
      },
      history: formattedMessages.slice(0, -1),
    });

    const response = await chat.sendMessage({ message: formattedMessages[formattedMessages.length - 1].parts[0].text });
    let text = response.text || "";

    let isFinalPitch = false;
    let productData = null;
    let options: string[] = [];

    // Parse JSON
    if (text.includes("```json")) {
      try {
        const jsonStr = text.split("```json")[1].split("```")[0].trim();
        const data = JSON.parse(jsonStr);

        if (data.type === "clarification") {
          text = data.text;
          options = data.options || [];
        } else if (data.type === "final_pitch") {
          // Extract a generic specs object to save to the DB by looking at the first vendor's specs
          const firstVendorSpecs = data.vendors?.[0]?.specs || {};
          
          // Save to Database! The Brain gets smarter.
          await prisma.productKnowledge.create({
            data: {
              query: latestUserMessage,
              productName: data.productName,
              description: data.description,
              specs: firstVendorSpecs,
            }
          });

          isFinalPitch = true;
          productData = data;
          
          // Formulate a clean fallback text without the huge summary
          text = `Here is your detailed breakdown for **${data.productName}**.\n\n*Scroll down to view detailed vendor cards and technical specifications.*`;
        }

      } catch (e) {
        console.error("Failed to parse Copilot JSON:", e);
      }
    }

    return NextResponse.json({ 
      success: true, 
      text: text,
      isFinalPitch,
      productData,
      options
    });

  } catch (error: any) {
    console.error("Copilot error:", error);
    return NextResponse.json({ 
      error: error.message || 'An error occurred. Please try again.' 
    }, { status: 500 });
  }
}
