import { NextResponse } from "next/server";
import { getMaterialsCopilotSystemPrompt } from "@/lib/materialsCopilot";
import { GoogleGenAI } from "@google/genai";
import { findTarasAlternate } from "@/lib/alternateMatcherEngine";
import { findSellerDemandMatches } from "@/lib/sellerDemandEngine";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const ai = new GoogleGenAI({});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { messages, userContext } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array required" }, { status: 400 });
    }

    const latestMessage = messages[messages.length - 1]?.content || "";

    // 1. Determine User Role strictly from Account Session or Context
    const sessionUser = session?.user as any;
    let accountType = sessionUser?.accountType || userContext?.accountType;
    let companyName = sessionUser?.companyName || userContext?.companyName || "Industrial Client";
    let industry = sessionUser?.industry || userContext?.industry || "Industrial Manufacturing";

    // Detect seller intent if unauthenticated guest asks about selling/manufacturing
    if (!accountType || accountType === 'BUYER') {
      const lowerText = latestMessage.toLowerCase();
      if (
        lowerText.includes("i manufacture") || 
        lowerText.includes("we manufacture") || 
        lowerText.includes("i produce") || 
        lowerText.includes("we make") || 
        lowerText.includes("i sell") || 
        lowerText.includes("we sell") ||
        lowerText.includes("our factory") ||
        lowerText.includes("i am a supplier")
      ) {
        accountType = 'SELLER';
      } else {
        accountType = accountType || 'BUYER';
      }
    }

    // 2. Structured Data Attachments:
    // - For Buyers: Competitor Alternate Part Matcher
    // - For Sellers: Demand Radar & Indian Enterprise Buyers
    const matchedAlternates = accountType === 'BUYER' ? findTarasAlternate(latestMessage) : [];
    const matchedSellerDemand = accountType === 'SELLER' ? findSellerDemandMatches(latestMessage) : [];

    // 3. Prepare full conversation contents for Gemini
    const conversationHistory = messages.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    // 4. Build Persona-Calibrated System Prompt
    const systemPrompt = getMaterialsCopilotSystemPrompt(accountType, companyName, industry);

    // 5. Generate AI Response
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: conversationHistory,
      config: {
        systemInstruction: systemPrompt
      }
    });

    const replyText = response.text || (
      accountType === 'SELLER'
        ? "I have analyzed your manufacturing specification. Here are the target enterprise buyers, benchmark procurement prices, and TarasAI qualification steps."
        : "I have analyzed your specification. Please find the TarasAI private-label engineering recommendation below."
    );

    return NextResponse.json({
      success: true,
      accountType,
      message: {
        role: "assistant",
        content: replyText,
        matchedAlternates: matchedAlternates.length > 0 ? matchedAlternates.slice(0, 2) : undefined,
        matchedSellerDemand: matchedSellerDemand.length > 0 ? matchedSellerDemand.slice(0, 1) : undefined
      }
    });

  } catch (error: any) {
    console.error("Error in Materials Copilot API:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to process copilot query",
      fallbackReply: "Our Materials Intelligence team has received your query. You can also explore our technical catalog or submit an RFQ in the portal."
    }, { status: 500 });
  }
}
