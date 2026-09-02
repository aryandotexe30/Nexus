import { GoogleGenAI, Type } from '@google/genai';
import Groq from 'groq-sdk';
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

// Unified memory TTL checker
export function isCacheExpired(date: Date | null | undefined, days: number = 30): boolean {
  if (!date) return true;
  const timeLimit = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return date < timeLimit;
}

// Active Gemini model fallback list
export const VALID_GEMINI_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-2.5-flash',
  'gemini-3.6-pro',
  'gemini-2.5-pro'
];

// Active Open-Weight / Groq model list
export const GROQ_MODELS = [
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.6-27b',
  'groq/compound-mini',
  'qwen/qwen3.8-27b'
];

// Universal Structured AI Generator (Groq LPU Engine -> Local Ollama -> Gemini Fallback)
export async function generateStructuredAIResponse(
  prompt: string, 
  schemaProps: any, 
  requiredKeys: string[],
  preferredModel: string = 'openai/gpt-oss-120b'
) {
  let responseText = "";

  // 1. Primary Path: Groq (Llama 3.3 70B / DeepSeek) - Fast, Free, High Rate Limits
  if (process.env.GROQ_API_KEY) {
    try {
      console.log(`[Custom AI Engine] Routing extraction to Groq (Llama 3.3 70B)...`);
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

      for (const model of GROQ_MODELS) {
        try {
          const completion = await groq.chat.completions.create({
            model: model,
            messages: [
              {
                role: "system",
                content: `You are an elite B2B data extraction analyst. You strictly output valid, minified JSON matching the exact requested schema.`
              },
              {
                role: "user",
                content: prompt
              }
            ],
            response_format: { type: "json_object" },
            temperature: 0.1,
            max_tokens: 4096
          });

          responseText = completion.choices[0]?.message?.content || "";
          if (responseText) {
            console.log(`[Custom AI Engine] Successfully generated extraction with Groq (${model}).`);
            break;
          }
        } catch (groqErr: any) {
          console.warn(`[Custom AI Engine] Groq ${model} failed (${groqErr.message}), trying next Groq model...`);
        }
      }
    } catch (err: any) {
      console.warn(`[Custom AI Engine] Groq client failed (${err.message}), cascading to fallback engines.`);
    }
  }

  // 2. Secondary Path: Self-Hosted / Local Ollama (if OLLAMA_BASE_URL is configured)
  if (!responseText && process.env.OLLAMA_BASE_URL) {
    try {
      console.log(`[Custom AI Engine] Routing to private Ollama instance: ${process.env.OLLAMA_BASE_URL}`);
      const ollamaRes = await axios.post(`${process.env.OLLAMA_BASE_URL}/api/generate`, {
        model: process.env.OLLAMA_MODEL || "llama3.3",
        prompt: prompt,
        format: "json",
        stream: false
      }, { timeout: 30000 });

      responseText = ollamaRes.data?.response || "";
    } catch (ollamaErr: any) {
      console.warn(`[Custom AI Engine] Ollama failed (${ollamaErr.message}), cascading to cloud models.`);
    }
  }

  // 3. Fallback Path: Google Gemini (if Groq / Ollama not configured or failed)
  if (!responseText && process.env.GEMINI_API_KEY) {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    if (!schemaProps.thinking) {
      schemaProps.thinking = { type: Type.STRING, description: "Your chain of thought reasoning." };
      if (!requiredKeys.includes("thinking")) {
        requiredKeys.unshift("thinking");
      }
    }

    const modelsToTry = [
      'gemini-3.6-flash',
      ...VALID_GEMINI_MODELS.filter(m => m !== 'gemini-3.6-flash')
    ];

    for (const model of modelsToTry) {
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`Timeout for ${model}`)), 10000)
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
          break;
        }
      } catch (err: any) {
        console.log(`[AI Generation] Gemini ${model} failed (${err.message}), trying next...`);
      }
    }
  }

  if (!responseText) {
    throw new Error("All AI extraction engines (Groq, Ollama, Gemini) are currently unavailable.");
  }

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

// Autonomous Regional Search Harvester (Zero API Cost, No Quota Limits)
export async function searchWebFallback(query: string, maxResults: number = 5): Promise<{ answer: string, context: any[], contextString: string }> {
  try {
    console.log(`[Autonomous Harvester] Crawling regional search for: ${query}`);
    const res = await axios.get('https://www.bing.com/search', {
      params: { 
        q: query,
        cc: 'IN',
        setlang: 'en-IN',
        setmkt: 'en-IN'
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-IN,en;q=0.9',
        'Cookie': 'SRCHHPGUSR=ADLT=OFF&NRSLT=10&SRCHLANG=en&LOCATION=1'
      },
      timeout: 6000
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

    // Scrape top pages in parallel with 3.5s timeout
    const fetchPromises = topResults.slice(0, 4).map(async (r) => {
      let pageContent = r.snippet;
      try {
        const pageRes = await axios.get(r.url, {
          timeout: 3500,
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
    console.error('[Autonomous Harvester] Error:', err.message);
    return { answer: "", context: [], contextString: "No internet data could be fetched." };
  }
}

// Unified internet fetcher
export async function fetchVerifiedInternetData(
  query: string,
  maxResults: number = 5,
  useStrictWhitelists: boolean = false,
  includeRawContent: boolean = false
) {
  // 1. Primary Path: Autonomous Harvester (Fast, Free, No Google Rate Limits)
  try {
    const scrapedResult = await searchWebFallback(query, maxResults);
    if (scrapedResult.contextString && scrapedResult.contextString.length > 100 && scrapedResult.context.length > 0) {
      console.log(`[Autonomous Harvester] Successfully crawled ${scrapedResult.context.length} sources (${scrapedResult.contextString.length} chars).`);
      return scrapedResult;
    }
  } catch (err: any) {
    console.warn(`[Autonomous Harvester] Scraper failed (${err.message}), trying auxiliary sources...`);
  }

  // 2. Secondary Path: Gemini Search Grounding (if available)
  if (process.env.GEMINI_API_KEY) {
    const searchModels = ['gemini-3.6-flash', 'gemini-3.5-flash'];
    
    for (const model of searchModels) {
      try {
        console.log(`[Gemini Grounding] Searching with ${model}: ${query}`);
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const searchPrompt = `
          You are an elite corporate intelligence researcher. Use Google Search to thoroughly research: "${query}"
          1. PRODUCTS: Extract EVERY single product model name, category, and technical specification.
          2. PERSONNEL (SignalHire & LinkedIn): Search SignalHire and LinkedIn to extract names, job titles, and roles of Sales heads, Business Development, HR, and Directors.
          3. FINANCIALS & ECONOMIC TIMES: Search Economic Times and registry databases for revenue, profits, net worth, and historical financials.
          List all specific names, specs, numbers, and links in extreme detail without summarizing.
        `;

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout on ${model}`)), 6000)
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
          console.log(`[Gemini Grounding] Successfully fetched ${rawData.length} chars with ${model}.`);
          return {
            answer: "",
            context: [{ url: "google-search-grounding", title: "Google Search Grounding" }],
            contextString: rawData.substring(0, 100000)
          };
        }
      } catch (e: any) {
        console.warn(`[Gemini Grounding] ${model} unavailable (${e.message}), continuing.`);
      }
    }
  }

  return { answer: "", context: [], contextString: "No internet data could be fetched." };
}
