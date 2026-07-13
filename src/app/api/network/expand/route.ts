import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import axios from 'axios';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";


const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { nodeLabel, nodeType, action, context } = await req.json();

    if (!nodeLabel || !action) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (user.credits <= 0) {
      return NextResponse.json({ error: 'Insufficient credits. Please upgrade your account.' }, { status: 403 });
    }

    const queryKey = `v4-${action}-${nodeLabel}-${context || ''}`.toLowerCase().trim();

    // Determine target node type based on action
    let targetType = "Company";
    let searchQuery = "";
    
    const contextStr = context ? ` (in the context of the company ${context})` : "";

    switch (action) {
      case "Find Products":
        targetType = "Product";
        searchQuery = `"${nodeLabel}" official product catalog list, specific model numbers, and detailed technical specifications`;
        break;
      case "Find Raw Materials":
        targetType = "Raw Material";
        searchQuery = `What industrial raw materials and components are required to manufacture ${nodeLabel}?${contextStr}`;
        break;
      case "Find Other Applications":
      case "Find Alternative Uses":
        targetType = "Application";
        searchQuery = `What are the industrial or commercial applications and use cases for ${nodeLabel}?${contextStr}`;
        break;
      case "Find Suppliers":
      case "Find Manufacturers":
        targetType = "Supplier";
        searchQuery = `Top global suppliers, manufacturers, and companies that produce ${nodeLabel}${contextStr}`;
        break;
      case "Find Competitors":
        targetType = "Company";
        searchQuery = `Top competitors and alternative companies to ${nodeLabel}`;
        break;
    }

    // 0. Check Database Cache
    const cached = await prisma.networkCache.findUnique({
      where: { queryKey }
    });

    if (cached && cached.result) {
      console.log(`Cache hit for: ${queryKey}`);
      return NextResponse.json({ 
        success: true, 
        items: cached.result,
        targetType 
      });
    }

    // 1. Tavily Search
    const tavilyRes = await axios.post('https://api.tavily.com/search', {
      api_key: process.env.TAVILY_API_KEY,
      query: searchQuery,
      search_depth: 'advanced',
      include_answer: true,
      max_results: 30
    }, { timeout: 15000 });

    const searchContext = JSON.stringify(tavilyRes.data.results?.map((r: any) => ({ t: r.title, c: r.content?.substring(0, 1000) })));

    // 2. Gemini Extraction
    const prompt = `
You are an expert supply chain and industrial analyst.
Based on the following search context, perform the requested action.

Target Entity: ${nodeLabel}
Entity Type: ${nodeType}
Requested Action: ${action}

Extract ALL highly specific, distinct items related to the query found in the search context. Do NOT arbitrarily limit the list. If there are 50 products or items, you must list all 50. 
- If asking for "Suppliers", "Manufacturers", or "Competitors", output EXACT COMPANY NAMES (e.g., "Tata Steel", "Suraj Metal Corp", "Reliance Industries"). Do NOT output product names.
- If asking for "Raw Materials", output specific materials like "Lithium Cobalt Oxide", "Graphite Anode", "Polyethylene Separator", rather than generic terms.
- If asking for "Products", you MUST adhere strictly to these rules:
  1. SCRUB ALL BRANDING: Completely remove brand names (e.g., "3M", "Dollar", "Tesa", "Srivasavi") from the product name.
  2. STRICT FORMATTING: You must format EVERY SINGLE product EXACTLY like this (using newlines):
  
[Product Name without branding]
Backing: [value]
Temperature: [value]
Adhesive: [value]
Features:
1. [feature 1]
2. [feature 2]
Applications:
1. [app 1]
2. [app 2]

Search Context:
${searchContext}

Output exactly the JSON array of strings and nothing else.
    `;

    const modelsToTry = ['gemini-2.5-flash-lite', 'gemini-flash-lite-latest', 'gemini-2.5-flash'];
    let responseText = "";
    
    for (const model of modelsToTry) {
      let attempt = 0;
      let success = false;
      while (attempt < 2 && !success) {
        try {
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Gemini SDK Timeout")), 25000)
          );

          const response: any = await Promise.race([
            ai.models.generateContent({
              model: model,
              contents: prompt,
            }),
            timeoutPromise
          ]);
          
          responseText = response.text || "";
          success = true;
          break;
        } catch (err: any) {
          console.log(`Model ${model} Error: ${err.message}. Retrying... (Attempt ${attempt + 1})`);
          await new Promise(r => setTimeout(r, 4000));
          attempt++;
        }
      }
      if (success) break;
    }

    if (!responseText) {
      throw new Error("All AI models are currently overloaded or rate-limited. Please try again in 60 seconds.");
    }
    
    // Robust parsing
    let items: string[] = [];
    try {
      const match = responseText.match(/\[[\s\S]*\]/);
      if (match) {
        items = JSON.parse(match[0]);
      } else {
        throw new Error("No JSON array found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse Gemini output:", responseText);
      items = responseText.split('\n')
        .map(l => l.replace(/^[-\*\d\.\s"]+/, '').replace(/"?,?$/, '').trim())
        .filter(l => l.length > 2 && l.length < 100);
      
      if (items.length === 0) {
         items = ["No data found"];
      }
    }

    try {
      await prisma.networkCache.create({
        data: {
          queryKey,
          result: items
        }
      });
    } catch (cacheError) {
      console.error("Failed to save to cache:", cacheError);
    }

    // Deduct credits
    await prisma.user.update({
      where: { id: user.id },
      data: { credits: { decrement: 1 } }
    });

    return NextResponse.json({ 
      success: true, 
      items,
      targetType,
      remainingCredits: user.role === 'ADMIN' ? 'Unlimited' : user.credits - 1
    });

  } catch (error: any) {
    console.error("Network expand error:", error);
    return NextResponse.json({ 
      error: error.message || 'An error occurred. Please try again.' 
    }, { status: 500 });
  }
}
