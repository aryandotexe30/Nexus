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

      for (const company of companiesToProcess) {
        const normalizedName = company.name.trim();

        // Always run fresh live crawling & enrichment (Cache reads disabled)
        console.log(`[Fresh Enrichment] Processing company: ${normalizedName}`);
        const enrichedData = await processCompany(company);
        results.push(enrichedData);

        // Update global database
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
        
        // Delay 300ms between companies
        await new Promise(resolve => setTimeout(resolve, 300));
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

    const cleanAddress = (company.address && company.address.toLowerCase() !== 'unknown' && company.address.toLowerCase() !== 'n/a') ? company.address : '';
    const cleanPincode = (company.pincode && company.pincode.toLowerCase() !== 'unknown' && company.pincode.toLowerCase() !== 'n/a') ? company.pincode : '';
    const locationContext = [cleanAddress, cleanPincode].filter(Boolean).join(' ');

    // Run a single MEGA search to prevent Gemini 15 RPM rate limits
    const searchRes = await fetchVerifiedInternetData(
      `"${company.name}" ${locationContext} official company website products catalog specifications contact MCA GSTIN financial statements`.trim(),
      10, // Max 10 results
      false, // Skip DB
      true  // Include Raw Content for Exhaustive Extraction
    );

    // 6. Free GSTIN Website Crawler
    let scrapedGstNumbers: string[] = [];
    try {
      const generalResults = searchRes.context;
      const firstUrl = generalResults.length > 0 ? generalResults[0].url : null;
      if (firstUrl && !firstUrl.includes('linkedin.com') && !firstUrl.includes('facebook.com')) {
        console.log(`Crawling ${firstUrl} for GSTIN...`);
        const homepageRes = await axios.get(firstUrl, { timeout: 3000, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
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

    // 7. Feed all context to Groq / Custom AI to extract JSON
    const prompt = `
You are an elite B2B financial and corporate intelligence analyst.
Your objective is to generate an exhaustive, highly detailed, production-grade intelligence profile for the target company.

Company Name: ${company.name}
Location / Address: ${locationContext || 'India'}

Context gathered from web and registry queries:
--- WEB CONTEXT ---
${searchRes.contextString}
--- SCRAPED GST NUMBERS ---
${scrapedGstNumbers.length > 0 ? scrapedGstNumbers.join(', ') : 'None extracted from raw HTML'}
--- END CONTEXT ---

CRITICAL INSTRUCTIONS:
1. Synthesize the web context above with your extensive corporate knowledge of Indian manufacturing, trade, MCA records, and industrial catalogs.
2. NEVER output "Not found", "Unknown", or empty text. Provide complete, rich, professional corporate intelligence for every single field.
3. For 'products_and_services': Exhaustively list specific product models, categories, materials, and technical specifications as a detailed markdown bulleted list.
4. For 'sales_people' and 'sales_and_business_heads': Provide key sales leadership, business development heads, and management roles with titles and contact roles.
5. For 'board_of_directors': List managing directors, founders, and board members.
6. For 'financials', 'profits_made', and 'loss_made': Provide exact or realistic annual turnover figures (e.g. in ₹ Cr / millions), profit margins, and financial trajectories.
7. For 'economic_times_info': Provide corporate registry overview, CIN/incorporation details, and industry market positioning.
8. For 'financial_chart_data': Provide an ARRAY of at least 3 historical yearly financial data objects: [{ "year": "2021", "revenue": number_in_cr, "profit": number_in_cr }, ...].

Format ALL text fields using clean, structured Markdown (bold text, bullet points).
Output strictly valid JSON matching the exact keys below:
- "description": Comprehensive executive summary
- "industry": Exact industry vertical
- "gst_number": GSTIN (State code + PAN + entity code)
- "financials": Revenue and turnover overview
- "goods_sold": Primary manufactured/supplied goods
- "goods_purchased": Key raw materials and inputs procured
- "profits_made": Profit figures and margins
- "loss_made": Debt, expenses, or loss analysis
- "economic_times_info": Corporate registry and market intelligence
- "sales_people": Sales heads and business managers
- "sales_and_business_heads": Primary dealmakers and procurement contacts
- "board_of_directors": Board of directors and founders
- "products_and_services": Exhaustive catalog and specifications list
- "hr_contacts": HR and talent leadership
- "all_available_info": Summary combining company operations and scale
- "stock_information": Market status or private company overview
- "financial_chart_data": Historical array of { year, revenue, profit }
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
      sales_people: { type: Type.STRING, description: "Sales heads, business managers, directors with contact info (Markdown text)" },
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
      "sales_people", "sales_and_business_heads", "board_of_directors", "products_and_services", 
      "hr_contacts", "all_available_info", "stock_information", "financial_chart_data"
    ];

    const jsonResult = await generateStructuredAIResponse(prompt, schemaProps, requiredKeys, 'gemini-3.6-flash');

    if (jsonResult) {
      if (!jsonResult.sales_people && jsonResult.sales_and_business_heads) {
        jsonResult.sales_people = jsonResult.sales_and_business_heads;
      }
      if (!jsonResult.sales_and_business_heads && jsonResult.sales_people) {
        jsonResult.sales_and_business_heads = jsonResult.sales_people;
      }
    }

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
