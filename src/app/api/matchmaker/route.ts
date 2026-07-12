import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import axios from 'axios';
import { encrypt } from "@/lib/encryption";

const prisma = new PrismaClient();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query } = await req.json();
    if (!query) {
      return NextResponse.json({ error: 'No query provided' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (user.credits <= 0) {
      return NextResponse.json({ error: 'Insufficient credits. Please upgrade your account.' }, { status: 403 });
    }

    // Search the internet globally for matches using Tavily
    const searchRes = await axios.post('https://api.tavily.com/search', {
      api_key: process.env.TAVILY_API_KEY,
      query: `Top companies in India for: ${query}. B2B, providers, buyers, list, contacts`,
      search_depth: 'advanced',
      include_answer: true,
      max_results: 10
    });

    const searchContext = searchRes.data.results?.map((r: any) => ({
      title: r.title,
      url: r.url,
      content: r.content?.substring(0, 800)
    }));

    const prompt = `
You are an expert B2B matchmaker and lead generation AI.
A user has submitted the following request: "${query}"

Here is raw internet search data representing potential companies in India that match their request:
${JSON.stringify(searchContext)}
${searchRes.data.answer ? `Internet Summary: ${searchRes.data.answer}` : ''}

Analyze the user's request and evaluate the provided internet search data to extract the best matching companies for buying, selling, or partnering.

Return a JSON array of the top matching companies. EXACTLY up to 10 matches, prioritizing companies located in India.
If there are no good matches, return an empty array [].

CRITICAL FORMATTING RULES:
Strictly output a JSON array of objects with the following keys:
- "alias": A generic anonymous alias for the company (e.g., "Supplier A", "Manufacturer 1"). Do NOT include the real company name here.
- "realName": The company's actual real name.
- "reason": A 2-3 sentence explanation of exactly why they are a perfect match. CRITICAL: Do NOT include their real company name in this explanation! Refer to them as "This supplier" or use the alias.
- "properties": An array of strings representing an EXTENSIVE list of PHYSICAL PRODUCT properties and technical specifications. You MUST extract as many details as possible (e.g., ["Width: 50mm", "Length: 100m", "Adhesive: Acrylic", "Thickness: 1.5mm", "Material: PE Foam", "Color: Black", "Certifications: ISO9001", "Applications: Automotive", "MOQ: 100 Rolls"]). CRITICAL: If the specific technical properties of the product are not explicitly mentioned in the search results, YOU MUST USE YOUR GENERAL KNOWLEDGE to generate a comprehensive list of standard industry properties, specs, and variants that a buyer would typically need to specify for this exact product. 100% REQUIRED to include product properties, not just company properties. Do not just return 2 or 3; generate an exhaustive list of standard specs for the product.
- "matchScore": A number from 0 to 100 indicating how strong the match is.
- "contactEmail": The best email to contact. CRITICAL: If an explicit email is not found in the search text, you MUST construct a highly probable standard B2B email based on the company's name or domain (e.g., "sales@[companyname].in", "info@[companyname].com"). NEVER output null for this field; always provide a constructed guess so the automated email system can attempt outreach.
- "contactPhone": The best phone number to contact. If none, output null.
- "prefillQuantity": A suggested quantity based on standard B2B orders for this product (e.g., "500").
- "prefillUnit": The unit for the quantity (e.g., "Pieces", "Rolls", "Kg").
- "prefillProduct": The simplified name of the product they are looking for (e.g., "Double Sided Foam Tapes").
- "prefillDetails": A short professional 1-2 sentence enquiry message body to pre-fill the form.

Do not include markdown formatting around the JSON array.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let resultText = response.text || "";
    resultText = resultText.replace(/```json/gi, "").replace(/```/g, "").trim();
    
    const matches = JSON.parse(resultText);

    // Encrypt sensitive targets
    const secureMatches = matches.map((m: any) => {
      const sensitiveData = JSON.stringify({
        realName: m.realName,
        contactEmail: m.contactEmail,
        contactPhone: m.contactPhone
      });
      const targetToken = encrypt(sensitiveData);
      
      // Return only safe fields + targetToken to frontend
      return {
        alias: m.alias,
        reason: m.reason,
        properties: m.properties || [],
        matchScore: m.matchScore,
        targetToken,
        prefillQuantity: m.prefillQuantity,
        prefillUnit: m.prefillUnit,
        prefillProduct: m.prefillProduct,
        prefillDetails: m.prefillDetails
      };
    });

    // Deduct credits
    await prisma.user.update({
      where: { id: user.id },
      data: { credits: { decrement: 1 } }
    });

    return NextResponse.json({ success: true, matches: secureMatches, remainingCredits: user.role === 'ADMIN' ? 'Unlimited' : user.credits - 1 });
  } catch (error: any) {
    console.error("Matchmaker error:", error);
    return NextResponse.json({ error: 'Failed to process matchmaking request' }, { status: 500 });
  }
}
