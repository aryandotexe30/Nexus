import { NextResponse } from "next/server";
import { MATERIALS_COPILOT_SYSTEM_PROMPT } from "@/lib/materialsCopilot";
import { GoogleGenAI } from "@google/genai";
import { findTarasAlternate } from "@/lib/alternateMatcherEngine";

const ai = new GoogleGenAI({});

export async function POST(req: Request) {
  try {
    const { messages, userContext } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array required" }, { status: 400 });
    }

    const latestMessage = messages[messages.length - 1]?.content || "";

    // Check if user is asking for a specific part number to attach fast structured data
    const matchedAlternates = findTarasAlternate(latestMessage);

    // Prepare full conversation contents for Gemini
    const conversationHistory = messages.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    // Inject system instructions
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: conversationHistory,
      config: {
        systemInstruction: MATERIALS_COPILOT_SYSTEM_PROMPT + (userContext?.industry ? `\nUser Industry Context: ${userContext.industry}` : "")
      }
    });

    const replyText = response.text || "I have analyzed your specification. Please find the TarasAI private-label recommendation below.";

    return NextResponse.json({
      success: true,
      message: {
        role: "assistant",
        content: replyText,
        matchedAlternates: matchedAlternates.length > 0 ? matchedAlternates.slice(0, 2) : undefined
      }
    });

  } catch (error: any) {
    console.error("Error in Materials Copilot API:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to process materials engineering copilot query",
      fallbackReply: "Our Materials Engineering team has received your query. You can also search directly for TarasAI Private-Label equivalents in the search bar above."
    }, { status: 500 });
  }
}
