import { NextResponse } from 'next/server';
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
      }, { timeout: 10000 });
      
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
      
      Return ONLY a valid JSON object with this exact structure. NEVER output null. Use "Unknown" or [] if truly unavailable:
      {
        "description": "Short 2-sentence summary of what they do",
        "products": ["Product 1", "Product 2"],
        "location": "City, State (if found, else Unknown)",
        "certifications": ["ISO...", etc (if found)],
        "website": "URL if found",
        "confidence": "High/Medium/Low based on data quality"
      }
    `;

    const chat = ai.chats.create({ model: 'gemini-2.5-flash' });
    const response = await chat.sendMessage({ message: prompt });
    let text = response.text || "{}";
    
    let enrichedData: any = {};
    try {
      // Clean up markdown block if present
      let cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
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
