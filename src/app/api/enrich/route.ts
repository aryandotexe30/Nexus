import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import axios from 'axios';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";



// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Interfaces
interface CompanyInput {
  name: string;
  address: string;
  pincode: string;
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const companies: CompanyInput[] = data.companies;

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!companies || !Array.isArray(companies) || companies.length === 0) {
      return NextResponse.json({ error: 'No companies provided' }, { status: 400 });
    }

    if (companies.length > 50) {
      return NextResponse.json({ error: 'Max 50 companies per batch allowed' }, { status: 400 });
    }

    // Validate inputs
    for (const c of companies) {
      if (c.name && c.name.length > 100) {
        return NextResponse.json({ error: 'Company name too long' }, { status: 400 });
      }
    }

    let companiesToProcess = companies;
    
    // Free Tier Limit logic and UPFRONT Deduction
    if (user.role !== 'ADMIN') {
      if (user.credits <= 0) {
        return NextResponse.json({ error: 'Insufficient credits. Please upgrade your account.' }, { status: 403 });
      }
      if (companiesToProcess.length > user.credits) {
        companiesToProcess = companiesToProcess.slice(0, user.credits);
      }
      // Deduct upfront
      await prisma.user.update({
        where: { id: user.id },
        data: { credits: { decrement: companiesToProcess.length } }
      });
    }

    try {
      const results = [];

    // For testing, process them sequentially to avoid rate limits
    for (const company of companiesToProcess) {
      const normalizedName = company.name.trim();

      // 1. Check if company already exists in DB
      const existingCompany = await prisma.company.findUnique({
        where: { name: normalizedName }
      });

      if (existingCompany && existingCompany.data) {
        console.log(`[Cache Hit] Enriched data found for: ${normalizedName}`);
        results.push({
          company_input: company,
          extracted_data: existingCompany.data
        });
      } else {
        // 2. Fetch from APIs if not found
        const enrichedData = await processCompany(company);
        results.push(enrichedData);

        // Save to global database for Matchmaker
        if (enrichedData.extracted_data) {
          try {
            await prisma.company.upsert({
              where: { name: normalizedName },
              update: { data: enrichedData.extracted_data },
              create: { name: normalizedName, data: enrichedData.extracted_data }
            });
          } catch (dbErr) {
            console.error("Failed to save to DB:", dbErr);
          }
        }
        
        // Delay 3 seconds between API calls to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: results, 
      processedCount: companiesToProcess.length,
      remainingCredits: user.role === 'ADMIN' ? 'Unlimited' : user.credits - companiesToProcess.length
    });

    } catch (innerError: any) {
      // Refund credits on catastrophic failure
      if (user.role !== 'ADMIN') {
        await prisma.user.update({
          where: { id: user.id },
          data: { credits: { increment: companiesToProcess.length } }
        });
      }
      throw innerError;
    }

  } catch (error: any) {
    console.error("Enrichment error:", error);
    return NextResponse.json({ error: error.message || 'An error occurred during enrichment' }, { status: 500 });
  }
}

async function processCompany(company: CompanyInput) {
  try {
    console.log(`Processing company: ${company.name}`);

    // 1. Tavily General Search
    const tavilyGeneralRes = await axios.post('https://api.tavily.com/search', {
      api_key: process.env.TAVILY_API_KEY,
      query: `${company.name} ${company.address} company profile products services directors`,
      search_depth: 'advanced',
      include_answer: true,
      max_results: 5
    }, { timeout: 15000 });

    // 2. Tavily Economic Times Search
    const tavilyETRes = await axios.post('https://api.tavily.com/search', {
      api_key: process.env.TAVILY_API_KEY,
      query: `site:economictimes.indiatimes.com "${company.name}" financials news`,
      search_depth: 'advanced',
      include_answer: true,
      max_results: 3
    }, { timeout: 15000 });

    // 3. Tavily Stock & Market Search
    const tavilyStockRes = await axios.post('https://api.tavily.com/search', {
      api_key: process.env.TAVILY_API_KEY,
      query: `"${company.name}" stock ticker symbol market cap share price performance NASDAQ NSE BSE`,
      search_depth: 'advanced',
      include_answer: true,
      max_results: 3
    }, { timeout: 15000 });

    // 3. SignalHire Search (Targeting Dealmakers)
    let signalHireData = null;
    try {
      const shRes = await axios.post(`https://www.signalhire.com/api/v1/candidate/search`, {
        companyName: company.name, 
        keywords: "Sales Manager, Business Head, Director, Procurement",
        items: 10 
      }, {
        headers: { apikey: process.env.SIGNALHIRE_API_KEY }
      });
      signalHireData = shRes.data;
    } catch (shError) {
      console.error("SignalHire Error:", shError);
      signalHireData = { error: "Failed to fetch from SignalHire" };
    }

    // 4. Free GSTIN Website Crawler (Option 1)
    let scrapedGstNumbers: string[] = [];
    try {
      const generalResults = tavilyGeneralRes.data.results || [];
      const firstUrl = generalResults.length > 0 ? generalResults[0].url : null;
      if (firstUrl && !firstUrl.includes('linkedin.com') && !firstUrl.includes('facebook.com')) {
        console.log(`Crawling ${firstUrl} for GSTIN...`);
        const homepageRes = await axios.get(firstUrl, { timeout: 8000, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
        const gstRegex = /\b[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}\b/gi;
        const matches = typeof homepageRes.data === 'string' ? homepageRes.data.match(gstRegex) : null;
        if (matches) {
          scrapedGstNumbers = Array.from(new Set(matches)).map(m => m.toUpperCase());
          console.log(`Found GSTIN(s):`, scrapedGstNumbers);
        }
      }
    } catch (e: any) {
      console.log("Failed to crawl for GSTIN:", e.message);
    }

    // 5. Feed all context to Gemini to extract JSON
    const prompt = `
You are an expert B2B financial and corporate data analyst. 
I have gathered raw information from the web about a company. 
Extract the following details from the provided context and output them strictly as a JSON object.

CRITICAL FORMATTING RULES:
- For ALL text fields (except financial_chart_data), use STANDARD MARKDOWN to make it highly readable.
- Use bold text (**bold**), bullet points (- ), and sub-headers (###).
- For ANY links, citations, or references, strictly use standard markdown links: [Link Name](https://url.com).
- Ensure the text is written beautifully like a premium Notion document.

Company Name: ${company.name}
Address: ${company.address}
Pincode: ${company.pincode}

Target Fields to Extract:
1. "gst_number": GST Number of the company (Markdown text)
2. "industry": Industry of the company (e.g. IT, Power, Healthcare, Finance) (Markdown text)
3. "financials": All available financials (Revenue, etc.) (Markdown text)
4. "goods_sold": Goods sold (Markdown text)
5. "goods_purchased": Goods Purchased (Markdown text)
6. "profits_made": Profits made (Markdown text)
7. "loss_made": loss made (Markdown text)
8. "economic_times_info": All information available on economic times (Markdown text with [Links](url))
9. "sales_and_business_heads": The primary dealmakers. Extract Regional Sales Managers, Business Heads, Procurement Officers, or Directors. If none exist, fallback to CEO. Include names and contact info if available. (Markdown text)
10. "board_of_directors": Board of directors (Markdown text)
11. "products_and_services": Products and services (Markdown text)
12. "hr_contacts": HR and people available (Markdown text)
13. "all_available_info": A summary of all other available information (Markdown text)
13. "stock_information": Live or recent stock data (Ticker, Market Cap, Share Price, Exchange, Performance). If private, say "Private Company". (Markdown text)
14. "financial_chart_data": An ARRAY of JSON objects representing historical financial data to plot on a chart. Must contain { "year": "2023", "revenue": number_in_millions, "profit": number_in_millions }. Infer or extract this from the text. Ensure it is a valid JSON array of objects, NOT markdown.

Context:
--- TAVILY GENERAL SEARCH ---
${JSON.stringify(tavilyGeneralRes.data.results?.map((r: any) => ({ t: r.title, c: r.content?.substring(0, 1000) })))}
--- TAVILY ECONOMIC TIMES SEARCH ---
${JSON.stringify(tavilyETRes.data.results?.map((r: any) => ({ t: r.title, c: r.content?.substring(0, 1000) })))}
--- TAVILY STOCK SEARCH ---
${JSON.stringify(tavilyStockRes.data.results?.map((r: any) => ({ t: r.title, c: r.content?.substring(0, 1000) })))}
--- SIGNALHIRE DATA ---
${JSON.stringify(signalHireData)}
--- SCRAPED GST NUMBERS (HIGH ACCURACY) ---
${scrapedGstNumbers.length > 0 ? scrapedGstNumbers.join(', ') : 'None found directly'}
--- END CONTEXT ---

Output strictly valid JSON matching the exact keys above. Do not include markdown formatting around the JSON itself.
    `;

    const modelsToTry = ['gemini-2.5-flash-lite', 'gemini-flash-lite-latest', 'gemini-2.5-flash'];
    let responseText = "";
    
    for (const model of modelsToTry) {
      let attempt = 0;
      let success = false;
      while (attempt < 2 && !success) {
        try {
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Gemini SDK Timeout")), 45000)
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

    let resultText = responseText || "";
    // Clean up potential markdown formatting if the model disobeys instructions
    resultText = resultText.replace(/^```json/g, "").replace(/```$/g, "").trim();
    
    const jsonResult = JSON.parse(resultText);

    // Merge original inputs
    return {
      company_input: company,
      extracted_data: jsonResult
    };

  } catch (error) {
    console.error(`Error processing ${company.name}:`, error);
    return {
      company_input: company,
      error: "Failed to extract data",
      extracted_data: null
    };
  }
}
