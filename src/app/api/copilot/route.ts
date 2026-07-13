import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import axios from 'axios';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `
You are the "Nexus AI Sourcing Copilot", an elite B2B procurement consultant and specification engine.

YOUR CORE DIRECTIVE:
1. SPECIFICATION GATHERING (Keep it extremely user-friendly): 
   When a user asks for a product, briefly check if you have enough technical details to recommend a specific industrial grade. 
   If it's too vague, ask ONE highly targeted, friendly question to gather the most critical missing spec (e.g., temperature, thickness, or load capacity). DO NOT interrogate them. DO NOT ask about budget.
   
2. A-TO-Z PRODUCT PITCH & ANONYMOUS VENDORS:
   Once you have enough context, you must output a highly detailed, A-to-Z technical description of the exact product they need. 
   You must also list 2-3 matched vendors COMPLETELY ANONYMOUSLY (e.g., "Supplier A: A tier-1 German manufacturer", "Supplier B: A high-volume Asian factory"). NEVER REVEAL REAL COMPANY NAMES (like 3M, Tesa, Tata).

JSON OUTPUT ENFORCEMENT:
To allow us to save this valuable knowledge, if you are providing the FINAL A-TO-Z PRODUCT PITCH, you MUST output your response as a valid JSON object enclosed in \`\`\`json blocks.
The JSON must follow this exact structure:
{
  "type": "final_pitch",
  "productName": "Generic name of the product",
  "description": "Your complete A-to-Z highly detailed description and technical breakdown",
  "specs": { "Temp": "...", "Adhesion": "..." },
  "vendors": ["Supplier A: ...", "Supplier B: ..."],
  "messageToUser": "A friendly concluding message telling them they can now click 'Matchmaker' to enquire."
}

If you are just asking a clarifying question, output standard text (NOT JSON), but keep it to exactly ONE friendly question.
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

    // Search Tavily for real-time market data
    let searchContext = "";
    try {
      const tavilyRes = await axios.post('https://api.tavily.com/search', {
        api_key: process.env.TAVILY_API_KEY,
        query: `industrial specifications and generic suppliers for: ${latestUserMessage}`,
        search_depth: 'basic',
        include_answer: true,
        max_results: 3
      }, { timeout: 5000 });
      
      searchContext = JSON.stringify(tavilyRes.data.results?.map((r: any) => ({ t: r.title, c: r.content?.substring(0, 300) })));
    } catch (e) {
      console.log("Tavily search skipped or failed in Copilot.");
    }

    const formattedMessages = messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    if (formattedMessages.length > 0) {
      formattedMessages[0].parts[0].text = `
${SYSTEM_PROMPT}

MARKET INTELLIGENCE:
${searchContext || "No real-time data."}

User's message:
${formattedMessages[0].parts[0].text}
`;
    }

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: formattedMessages.slice(0, -1),
    });

    const response = await chat.sendMessage({ message: formattedMessages[formattedMessages.length - 1].parts[0].text });
    let text = response.text || "";

    // Parse JSON if it's a final pitch
    if (text.includes("```json") && text.includes('"type": "final_pitch"')) {
      try {
        const jsonStr = text.split("```json")[1].split("```")[0].trim();
        const data = JSON.parse(jsonStr);

        // Save to Database! The Brain gets smarter.
        await prisma.productKnowledge.create({
          data: {
            query: latestUserMessage,
            productName: data.productName,
            description: data.description,
            specs: data.specs,
          }
        });

        // Format a beautiful markdown response for the user
        let formattedMarkdown = `### ${data.productName}\n\n${data.description}\n\n**Technical Specifications:**\n`;
        for (const [k, v] of Object.entries(data.specs)) {
          formattedMarkdown += `- **${k}**: ${v}\n`;
        }
        formattedMarkdown += `\n**Available Anonymous Vendors:**\n`;
        data.vendors.forEach((v: string) => {
          formattedMarkdown += `- ${v}\n`;
        });
        formattedMarkdown += `\n\n*${data.messageToUser}*`;

        text = formattedMarkdown;

      } catch (e) {
        console.error("Failed to parse Copilot JSON:", e);
      }
    }

    return NextResponse.json({ 
      success: true, 
      text: text
    });

  } catch (error: any) {
    console.error("Copilot error:", error);
    return NextResponse.json({ 
      error: error.message || 'An error occurred. Please try again.' 
    }, { status: 500 });
  }
}
