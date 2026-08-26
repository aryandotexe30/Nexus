import { GoogleGenAI, Type } from '@google/genai';
import axios from 'axios';

// Unified constants
export const TAVILY_EXCLUDED_DOMAINS = [
  "amazon.com", "amazon.in", "flipkart.com", "ebay.com", 
  "justdial.com", "indiamart.com", "dir.indiamart.com", "tradeindia.com", 
  "facebook.com", "instagram.com", "exportersindia.com", "alibaba.com", 
  "made-in-china.com", "thomasnet.com", "kompass.com", "crunchbase.com", "linkedin.com"
];

export const TAVILY_VERIFIED_DOMAINS = [
  "zaubacorp.com", "tofler.in", "mca.gov.in", 
  "bloomberg.com", "pitchbook.com", "dunandbradstreet.com"
];

// Unified memory TTl checker
export function isCacheExpired(date: Date | null | undefined, days: number = 30): boolean {
  if (!date) return true;
  const timeLimit = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return date < timeLimit;
}

// Unified AI generator with robust error handling and timeout
export async function generateStructuredAIResponse(
  prompt: string, 
  schemaProps: any, 
  requiredKeys: string[],
  modelName: string = 'gemini-2.5-flash'
) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  // Make sure thinking is strictly enforced if not provided
  if (!schemaProps.thinking) {
    schemaProps.thinking = { type: Type.STRING, description: "Your chain of thought reasoning." };
    if (!requiredKeys.includes("thinking")) {
      requiredKeys.unshift("thinking");
    }
  }

  const modelsToTry = [modelName, 'gemini-2.5-flash-lite', 'gemini-flash-lite-latest'];
  let responseText = "";

  for (const model of modelsToTry) {
    let attempt = 0;
    let success = false;
    while (attempt < 2 && !success) {
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Gemini SDK Timeout")), 60000)
        );

        const response: any = await Promise.race([
          ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: schemaProps,
                required: requiredKeys
              }
            }
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
    throw new Error("All AI models are currently overloaded or rate-limited. Please try again later.");
  }

  // Parse result robustly
  const resultText = responseText.replace(/^```json/gi, "").replace(/```$/gi, "").trim();
  return JSON.parse(resultText);
}

import { search } from 'duck-duck-scrape';

import * as cheerio from 'cheerio';

// Unified internet fetcher
export async function fetchVerifiedInternetData(
  query: string,
  maxResults: number = 5,
  useStrictWhitelists: boolean = false,
  includeRawContent: boolean = false
) {
  try {
    console.log(`[DuckDuckGo Search] Executing query: ${query}`);
    const searchResults = await search(query, { safeSearch: search.SafeSearchType.OFF });
    
    // Filter results if whitelist is requested
    let filteredResults = searchResults.results;
    if (useStrictWhitelists) {
      filteredResults = filteredResults.filter(r => 
        TAVILY_VERIFIED_DOMAINS.some(domain => r.url.toLowerCase().includes(domain))
      );
    }
    
    // Exclude blacklisted domains
    filteredResults = filteredResults.filter(r => 
      !TAVILY_EXCLUDED_DOMAINS.some(domain => r.url.toLowerCase().includes(domain))
    );

    const topResults = filteredResults.slice(0, maxResults);
    let contextString = "";

    // Fetch actual page content
    const fetchPromises = topResults.map(async (result) => {
      let pageText = result.description;
      if (includeRawContent) {
        try {
          const res = await axios.get(result.url, { 
            timeout: 5000,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
          });
          const $ = cheerio.load(res.data);
          // Strip unnecessary tags
          $('script, style, noscript, nav, footer, header').remove();
          const text = $('body').text().replace(/\s+/g, ' ').trim();
          if (text.length > 200) {
            pageText = text.substring(0, 15000); // Take top 15k chars per page
          }
        } catch (e) {
          console.log(`Failed to scrape raw content from ${result.url}`);
        }
      }
      return `URL: ${result.url}\nTitle: ${result.title}\nContent: ${pageText}\n\n`;
    });

    const scrapedContents = await Promise.all(fetchPromises);
    contextString = scrapedContents.join("\n---\n");

    return {
      answer: "",
      context: topResults.map(r => ({ url: r.url, title: r.title })),
      contextString
    };
  } catch (e: any) {
    console.error(`DuckDuckGo search failed for query: ${query}.`, e.message);
    return { answer: "", context: [], contextString: "No internet data could be fetched." };
  }
}
