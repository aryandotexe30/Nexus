import { NextResponse } from 'next/server';
import { Type } from '@google/genai';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { fetchVerifiedInternetData, generateStructuredAIResponse } from "@/lib/searchProtocol";



const SYSTEM_PROMPT = `
You are "Nexus", an elite B2B procurement and lead generation consultant focused EXCLUSIVELY on the Indian MSME (Micro, Small, and Medium Enterprises) market.

YOUR CORE DIRECTIVE:
1. INTENT PARSING & SPECIFICATION GATHERING:
   First, determine if the user wants to BUY (procure) or SELL (supply). 
   - If they want to SELL, you must help them find BUYERS (companies that purchase their material as raw inputs). DO NOT SHOW OTHER SELLERS OR MANUFACTURERS OF THAT PRODUCT.
   - If they want to BUY, you must help them find SELLERS (companies that manufacture or supply the material).
   - EXTREMELY IMPORTANT: If the user provides a very short or vague query (like "I want tissue tape"), you MUST ALWAYS ask a clarification question to gather the most critical missing spec (e.g., thickness, width, or adhesion strength) before giving a final pitch. DO NOT provide a final pitch on the first message unless they gave detailed specs.
   
2. A-TO-Z PRODUCT PITCH & VERIFIED LEADS (INDIAN MSME FOCUS):
   Once you have gathered enough technical context from the user, you must output a highly detailed, A-to-Z technical description of the exact product. 
   You must extract ALL comprehensive technical specifications.
   You must list AS MANY VERIFIED COMPANIES as possible (aim for 5-10 or more) from the PROVIDED MARKET INTELLIGENCE or PROPRIETARY DATABASE.
   CRITICAL ANONYMITY RULE: You must NEVER reveal the company's real name in the 'matchReason', 'description', or 'specialty' fields. ALWAYS refer to them as "This company" or "The supplier". The real name goes ONLY in the 'realName' field.

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
      "realName": "The REAL Company Name (or 'Buyer/Supplier X' if unknown)",
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
      const tavilyRes = await fetchVerifiedInternetData(`Top companies in India for: ${latestUserMessage}. B2B, buyers, sellers, contacts`, 3, false);
      searchContext = tavilyRes.contextString;
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

    const historyPrompt = formattedMessages.map((m: any) => `${m.role}: ${m.parts[0].text}`).join("\n");
    const fullPrompt = `${SYSTEM_PROMPT}\n\nPROPRIETARY DATABASE CONTEXT:\n${JSON.stringify(dbCompanies)}\n\nMARKET INTELLIGENCE (INTERNET SEARCH FALLBACK):\n${searchContext || "No real-time data."}\n\nCHAT HISTORY:\n${historyPrompt}`;

    let data;
    try {
      const schemaProps = {
        type: { type: Type.STRING, description: "clarification OR final_pitch" },
        text: { type: Type.STRING, description: "Message for the user." },
        options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Options if asking clarification" },
        productName: { type: Type.STRING },
        description: { type: Type.STRING, description: "DO NOT REVEAL COMPANY REAL NAMES IN THIS FIELD." },
        vendors: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              realName: { type: Type.STRING },
              location: { type: Type.STRING },
              specialty: { type: Type.STRING, description: "DO NOT REVEAL COMPANY REAL NAMES IN THIS FIELD." },
              specs: { type: Type.OBJECT, description: "JSON object of 3-4 key-value technical specs, e.g. { 'Thickness': '0.5mm', 'Color': 'Transparent' }" },
              matchReason: { type: Type.STRING, description: "DO NOT REVEAL COMPANY REAL NAMES IN THIS FIELD." }
            },
            required: ["realName", "location", "specialty", "specs", "matchReason"]
          }
        },
        messageToUser: { type: Type.STRING }
      };

      data = await generateStructuredAIResponse(fullPrompt, schemaProps, ["type", "text"]);
    } catch (e) {
      console.error("Agent generation failed:", e);
      return NextResponse.json({ error: "Agent generation failed" }, { status: 500 });
    }

    let text = "";

    let isFinalPitch = false;
    let productData = null;
    let options: string[] = [];

    // Parse logic
    try {

        if (data.type === "clarification") {
          text = data.text || "Could you provide some more details about your requirement?";
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

          // Save newly discovered vendors to the Company database AND ANONYMIZE
          if (data.vendors && Array.isArray(data.vendors)) {
            for (let i = 0; i < data.vendors.length; i++) {
              const v = data.vendors[i];
              const realName = v.realName || v.alias;
              
              if (realName && realName !== "Supplier X" && realName !== "Buyer X" && !realName.startsWith("Company ")) {
                try {
                  const existing = await prisma.company.findUnique({ where: { name: realName } });
                  const newData = {
                    description: v.matchReason || v.specialty,
                    products: [data.productName],
                    location: v.location,
                    specs: v.specs,
                    source: "Agent Chat Hybrid Search",
                  };
        
                  if (existing) {
                    const mergedData = { ...newData, ...(existing.data as object || {}) };
                    await prisma.company.update({
                      where: { name: realName },
                      data: { data: mergedData }
                    });
                  } else {
                    await prisma.company.create({
                      data: {
                        name: realName,
                        data: newData
                      }
                    });
                  }
                } catch (dbErr) {
                  console.error("Failed to store discovered company from Agent in DB", dbErr);
                }

                // SECURE ANONYMIZATION
                const secureAlias = `Company ${String.fromCharCode(65 + i)}`;
                
                const maskString = (str: string) => {
                  if (!str) return str;
                  return str.replace(new RegExp(realName, 'gi'), secureAlias);
                };

                v.alias = secureAlias;
                v.matchReason = maskString(v.matchReason);
                v.specialty = maskString(v.specialty);
                if (data.description) {
                  data.description = maskString(data.description);
                }
                delete v.realName;
              } else if (realName) {
                // If it's already an alias or unknown, just move it to alias property
                v.alias = realName;
                delete v.realName;
              }
            }
          }

          isFinalPitch = true;
          productData = data;
          
          text = `Here is your detailed breakdown for **${data.productName}**.\n\n*Scroll down to view detailed vendor cards and technical specifications.*`;
        }

      } catch (e) {
        console.error("Failed to parse Copilot JSON:", e);
        // Fallback: If it completely failed to parse as JSON, just return the raw text to the user.
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
