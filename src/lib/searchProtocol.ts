import { GoogleGenAI, Type } from '@google/genai';
import axios from 'axios';
import * as cheerio from 'cheerio';

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

// Model priority list - using valid Google GenAI v1beta model names
export const VALID_GEMINI_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash-002',
  'gemini-1.5-pro-002'
];

// Unified AI generator with robust error handling and model fallback
export async function generateStructuredAIResponse(
  prompt: string, 
  schemaProps: any, 
  requiredKeys: string[],
  preferredModel: string = 'gemini-2.0-flash'
) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  // Make sure thinking is strictly enforced if not provided
  if (!schemaProps.thinking) {
    schemaProps.thinking = { type: Type.STRING, description: "Your chain of thought reasoning." };
    if (!requiredKeys.includes("thinking")) {
      requiredKeys.unshift("thinking");
    }
  }

  // Prioritize preferred model, followed by all valid fallback models
  const modelsToTry = [
    preferredModel,
    ...VALID_GEMINI_MODELS.filter(m => m !== preferredModel)
  ];

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
        if (responseText) {
          success = true;
          break;
        }
      } catch (err: any) {
        console.log(`[AI Generation] Model ${model} Attempt ${attempt + 1} Error: ${err.message}`);
        if (err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED')) {
          await new Promise(r => setTimeout(r, 2000));
        }
        attempt++;
      }
    }
    if (success && responseText) break;
  }

  if (!responseText) {
    throw new Error("All AI models are currently overloaded or rate-limited. Please try again later.");
  }

  // Parse result robustly
  const resultText = responseText.replace(/^```json/gi, "").replace(/```$/gi, "").trim();
  return JSON.parse(resultText);
}

function decodeBingUrl(url: string): string {
  if (!url) return '';
  if (!url.includes('/ck/a?')) return url;
  try {
    const match = url.match(/[?&]u=a1([A-Za-z0-9_-]+)/);
    if (match && match[1]) {
      let b64 = match[1].replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) b64 += '=';
      const decoded = Buffer.from(b64, 'base64').toString('utf8');
      if (decoded.startsWith('http')) return decoded;
    }
  } catch (e) {}
  return url;
}

// Fallback search using Bing + live page scraping
async function searchWebFallback(query: string, maxResults: number = 6): Promise<{ answer: string, context: any[], contextString: string }> {
  try {
    console.log(`[Web Fallback Search] Querying Bing for: ${query}`);
    const res = await axios.get('https://www.bing.com/search', {
      params: { q: query },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 8000
    });

    const $ = cheerio.load(res.data);
    const results: { title: string, url: string, snippet: string }[] = [];

    $('li.b_algo').each((i, el) => {
      const title = $(el).find('h2 a').text().trim();
      const rawUrl = $(el).find('h2 a').attr('href') || '';
      const url = decodeBingUrl(rawUrl);
      const snippet = $(el).find('.b_caption p, .b_algoSlug, p').text().trim();
      if (title && url && !url.includes('bing.com/search')) {
        results.push({ title, url, snippet });
      }
    });

    const topResults = results.slice(0, maxResults);
    if (topResults.length === 0) {
      return { answer: "", context: [], contextString: "No web results found." };
    }

    // Scrape pages
    const fetchPromises = topResults.map(async (r) => {
      let pageContent = r.snippet;
      try {
        const pageRes = await axios.get(r.url, {
          timeout: 5000,
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        const page$ = cheerio.load(pageRes.data);
        page$('script, style, noscript, nav, footer, header').remove();
        const text = page$('body').text().replace(/\s+/g, ' ').trim();
        if (text.length > 200) {
          pageContent = text.substring(0, 10000);
        }
      } catch (e) {}
      return `URL: ${r.url}\nTitle: ${r.title}\nContent: ${pageContent}\n\n`;
    });

    const scraped = await Promise.all(fetchPromises);
    return {
      answer: "",
      context: topResults.map(r => ({ url: r.url, title: r.title })),
      contextString: scraped.join("\n---\n")
    };
  } catch (err: any) {
    console.error('[Web Fallback Search] Error:', err.message);
    return { answer: "", context: [], contextString: "No internet data could be fetched." };
  }
}

// Unified internet fetcher: Gemini Google Search Grounding with seamless fallback
export async function fetchVerifiedInternetData(
  query: string,
  maxResults: number = 5,
  useStrictWhitelists: boolean = false,
  includeRawContent: boolean = false
) {
  // Step 1: Attempt Gemini Google Search Grounding
  const groundingModels = ['gemini-2.0-flash', 'gemini-2.5-flash'];
  
  for (const model of groundingModels) {
    try {
      console.log(`[Gemini Grounding] Searching with ${model}: ${query}`);
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      let searchPrompt = `You are a high-speed research assistant. Use Google Search to find concise, factual data for this query: "${query}". Include all key business facts, dates, financials, and details.`;
      
      if (includeRawContent) {
        searchPrompt = `
          You are an expert researcher. Use Google Search to exhaustively find information for this query: "${query}"
          Extract EVERY SINGLE product model number, name, technical specification, and contact found.
          List them in high detail. Do not summarize.
        `;
      }

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Gemini Grounding Timeout")), 30000)
      );

      const searchResponse: any = await Promise.race([
        ai.models.generateContent({
          model: model,
          contents: searchPrompt,
          config: {
            tools: [{ googleSearch: {} }]
          }
        }),
        timeoutPromise
      ]);

      const rawData = searchResponse.text || "";
      if (rawData.length > 50) {
        console.log(`[Gemini Grounding] Successfully fetched ${rawData.length} chars of data.`);
        return {
          answer: "",
          context: [{ url: "google-search-grounding", title: "Google Search Grounding" }],
          contextString: rawData.substring(0, 150000)
        };
      }
    } catch (e: any) {
      console.warn(`[Gemini Grounding] ${model} failed (${e.message}).`);
    }
  }

  // Step 2: Fallback to live web search & scraping
  console.log(`[Search Protocol] Falling back to direct web scraper for: ${query}`);
  return await searchWebFallback(query, maxResults);
}
