import { NextResponse } from 'next/server';

export const maxDuration = 60; // Increase Vercel serverless function timeout
import { Type } from '@google/genai';
import axios from 'axios';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { 
  isCacheExpired, 
  fetchVerifiedInternetData, 
  generateStructuredAIResponse 
} from "@/lib/searchProtocol";

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

      const existingCompany = await prisma.company.findUnique({
        where: { name: normalizedName }
      });

      const isExpired = isCacheExpired(existingCompany?.updatedAt, 30);

      if (existingCompany && existingCompany.data && !isExpired) {
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

    // 1. Tavily General Search (Filtered for official/B2B data)
    const generalSearch = await fetchVerifiedInternetData(
      `${company.name} ${company.address} official company profile products services directors`,
      5,
      false // use excluded domains
    );

    // 2. Tavily Official Govt & Registration Search (ZaubaCorp / MCA / Verified)
    const verifiedSearch = await fetchVerifiedInternetData(
      `"${company.name}" registration details directors GSTIN MCA`,
      3,
      true // use strict whitelist
    );

    // 3. Tavily Stock & Market Search
    const stockSearch = await fetchVerifiedInternetData(
      `"${company.name}" stock ticker symbol market cap share price performance NASDAQ NSE BSE`,
      3,
      false
    );

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
      const generalResults = generalSearch.context;
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
${generalSearch.contextString}
--- TAVILY VERIFIED REGISTRY SEARCH ---
${verifiedSearch.contextString}
--- TAVILY STOCK SEARCH ---
${stockSearch.contextString}
--- SIGNALHIRE DATA ---
${JSON.stringify(signalHireData)}
--- SCRAPED GST NUMBERS (HIGH ACCURACY) ---
${scrapedGstNumbers.length > 0 ? scrapedGstNumbers.join(', ') : 'None found directly'}
--- END CONTEXT ---

Output strictly valid JSON matching the exact keys above. Do not include markdown formatting around the JSON itself.
    `;

    const schemaProps = {
      gst_number: { type: Type.STRING, description: "GST Number (Markdown text)" },
      industry: { type: Type.STRING, description: "Industry of the company (Markdown text)" },
      financials: { type: Type.STRING, description: "All available financials (Markdown text)" },
      goods_sold: { type: Type.STRING, description: "Goods sold (Markdown text)" },
      goods_purchased: { type: Type.STRING, description: "Goods Purchased (Markdown text)" },
      profits_made: { type: Type.STRING, description: "Profits made (Markdown text)" },
      loss_made: { type: Type.STRING, description: "loss made (Markdown text)" },
      economic_times_info: { type: Type.STRING, description: "All information from verified sources (Markdown text with links)" },
      sales_and_business_heads: { type: Type.STRING, description: "Primary dealmakers, managers, directors (Markdown text)" },
      board_of_directors: { type: Type.STRING, description: "Board of directors (Markdown text)" },
      products_and_services: { type: Type.STRING, description: "Products and services (Markdown text)" },
      hr_contacts: { type: Type.STRING, description: "HR and people available (Markdown text)" },
      all_available_info: { type: Type.STRING, description: "Summary of all other info (Markdown text)" },
      stock_information: { type: Type.STRING, description: "Stock data (Markdown text)" },
      financial_chart_data: { 
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            year: { type: Type.STRING },
            revenue: { type: Type.NUMBER },
            profit: { type: Type.NUMBER }
          }
        },
        description: "Array of historical financial data for charts"
      }
    };

    const requiredKeys = [
      "gst_number", "industry", "financials", "goods_sold", 
      "goods_purchased", "profits_made", "loss_made", "economic_times_info", 
      "sales_and_business_heads", "board_of_directors", "products_and_services", 
      "hr_contacts", "all_available_info", "stock_information", "financial_chart_data"
    ];

    const jsonResult = await generateStructuredAIResponse(prompt, schemaProps, requiredKeys, 'gemini-2.5-flash');

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
