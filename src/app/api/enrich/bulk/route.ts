import { NextResponse } from 'next/server';

export const maxDuration = 60; // Increase Vercel serverless function timeout
import prisma from "@/lib/prisma";
import { GoogleGenAI } from '@google/genai';
import axios from 'axios';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";


const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    // In a real app, verify if session.user is an ADMIN here.
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, gst } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    // 1. Search Tavily for public info
    let searchContext = "";
    try {
      const tavilyRes = await axios.post('https://api.tavily.com/search', {
        api_key: process.env.TAVILY_API_KEY,
        query: `"${name}" GST ${gst || ''} products address contact certifications company profile india`,
        search_depth: 'advanced',
        include_answer: true,
        max_results: 5
      }, { timeout: 25000 });
      
      searchContext = JSON.stringify(tavilyRes.data.results?.map((r: any) => ({ url: r.url, c: r.content?.substring(0, 500) })));
    } catch (e) {
      console.log(`Tavily search failed for ${name}:`, e);
      searchContext = "No web data found.";
    }

    // 2. Use Gemini to extract structured data
    const prompt = `
      You are an elite data enrichment AI. Extract a structured profile for the company based on the following web search results.
      
      Company Name: ${name}
      GST Number: ${gst || 'Not provided'}
      
      Web Search Context:
      ${searchContext}

      CRITICAL: If the Web Search Context is empty or says 'No web data found.', you MUST use your own extensive pre-trained knowledge to fill out the company profile as best as you can. Do NOT leave fields blank if you know who the company is.
      
      Return ONLY a valid JSON object with this exact structure. NEVER output null. Use "Unknown" or [] if truly unavailable.
      {
        "description": "Short 2-sentence summary of what they do",
        "location": "City, State (if found, else Unknown)",
        "website": "URL if found",
        "gst_number": "${gst || 'Extract if found'}",
        "industry": "Industry of the company",
        "financials": "All available financials (Including previous years Revenue, Profits, etc.)",
        "raw_materials_purchased": "Every raw material they purchase and from who (suppliers)",
        "customers": "Who their customers are and what all they sell to these customers",
        "stock_market_info": "Their stock market information (if available)",
        "personnel_contacts": "Personnel contact details including sales people, HR, etc.",
        "goods_sold": "Goods sold overview",
        "goods_purchased": "Goods Purchased overview",
        "board_of_directors": "Board of directors",
        "products_and_services": "Detailed Products and services",
        "products": ["Product 1", "Product 2"]
      }
    `;

    const modelsToTry = ['gemini-2.5-flash-lite', 'gemini-flash-lite-latest', 'gemini-2.5-flash', 'gemini-1.5-flash'];
    let text = "";
    
    for (const model of modelsToTry) {
      let attempt = 0;
      let success = false;
      while (attempt < 2 && !success) {
        try {
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Gemini SDK Timeout")), 20000)
          );

          const response: any = await Promise.race([
            ai.models.generateContent({
              model: model,
              contents: prompt,
            }),
            timeoutPromise
          ]);
          
          text = response.text || "";
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

    if (!text) {
      throw new Error("All AI models are currently overloaded or rate-limited. Please try again later.");
    }
    
    let enrichedData: any = {};
    try {
      // Clean up markdown block if present
      let cleanText = text.replace(/^```json/gi, '').replace(/```$/g, '').trim();
      enrichedData = JSON.parse(cleanText);

      // Protect against nulls
      if (!enrichedData.description) enrichedData.description = "No description available.";
      if (!enrichedData.products) enrichedData.products = [];
      if (!enrichedData.location) enrichedData.location = "Unknown";
    } catch (e) {
      console.error("Failed to parse Gemini JSON:", text);
      enrichedData = { description: "Failed to parse data", products: [], location: "Unknown", raw: text };
    }

    // 3. Save to Database
    const finalData = {
      gst,
      ...enrichedData,
      enrichedAt: new Date().toISOString()
    };

    const company = await prisma.company.upsert({
      where: { name: name },
      update: {
        data: finalData
      },
      create: {
        name: name,
        data: finalData
      }
    });

    return NextResponse.json({ success: true, company });

  } catch (error: any) {
    console.error("Bulk Enrichment error:", error);
    return NextResponse.json({ 
      error: error.message || 'An error occurred during enrichment.' 
    }, { status: 500 });
  }
}
