import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import axios from 'axios';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `
You are the "Nexus AI Sourcing Copilot", an elite B2B procurement consultant and industrial expert.
Your goal is to help users figure out EXACTLY what product they need to source, what their budget should be, and what the market options are.

CRITICAL ANONYMITY RULE:
You represent "Nexus", a B2B matchmaking platform that acts as a middleman. YOU MUST NEVER REVEAL THE REAL NAMES OF SUPPLIERS OR MANUFACTURERS. 
If you find a supplier named "3M" or "Tata Steel", you must refer to them using pseudonyms like "A premium global manufacturer", "Supplier A (Based in Germany)", or "A tier-1 Asian supplier".

CONVERSATIONAL GUIDELINES:
1. When a user asks for a vague product (e.g., "I need tape"), DO NOT just dump a list of products.
2. Instead, ask 1 or 2 clarifying questions: What is the end application? What are the temperature/environmental requirements? What is the budget constraint?
3. Once you have enough context, present 2-3 specific options (e.g., "Option 1: Polyimide High-Temp Tape. Option 2: PTFE Film Tape").
4. Keep your responses concise, highly professional, and structured (use bolding and bullet points).
5. If the user is ready to buy, encourage them to use the "Matchmaker" tool on the dashboard to anonymously blast their enquiry to the matched suppliers.

Use the provided search context to inform your recommendations with real-time market data.
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

    // Extract the latest user message to search the web for context
    const latestUserMessage = messages[messages.length - 1].text;

    // Optional: Search Tavily for real-time market data based on the user's latest query
    let searchContext = "";
    try {
      const tavilyRes = await axios.post('https://api.tavily.com/search', {
        api_key: process.env.TAVILY_API_KEY,
        query: `industrial suppliers and specifications for: ${latestUserMessage}`,
        search_depth: 'basic',
        include_answer: true,
        max_results: 3
      }, { timeout: 5000 });
      
      searchContext = JSON.stringify(tavilyRes.data.results?.map((r: any) => ({ t: r.title, c: r.content?.substring(0, 300) })));
    } catch (e) {
      console.log("Tavily search skipped or failed in Copilot.");
    }

    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // Inject system prompt and search context into the first message
    if (formattedMessages.length > 0) {
      formattedMessages[0].parts[0].text = `
${SYSTEM_PROMPT}

CURRENT MARKET INTELLIGENCE:
${searchContext || "No real-time data retrieved."}

User's actual message:
${formattedMessages[0].parts[0].text}
`;
    }

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: formattedMessages.slice(0, -1),
    });

    const response = await chat.sendMessage({ message: formattedMessages[formattedMessages.length - 1].parts[0].text });

    return NextResponse.json({ 
      success: true, 
      text: response.text
    });

  } catch (error: any) {
    console.error("Copilot error:", error);
    return NextResponse.json({ 
      error: error.message || 'An error occurred. Please try again.' 
    }, { status: 500 });
  }
}
