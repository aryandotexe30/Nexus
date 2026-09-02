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

// Active Open-Weight / Groq model list (Ranked by speed, reasoning depth, and large context capacity)
export const GROQ_MODELS = [
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.6-27b',
  'qwen/qwen3.8-27b'
];

function safeParseJson(raw: string): any {
  if (!raw) return null;
  const clean = raw.trim();
  try {
    return JSON.parse(clean);
  } catch (e) {}

  // Extract from ```json ... ``` code fence
  const codeBlockMatch = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch (e) {}
  }

  // Extract from outer braces { ... }
  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(clean.substring(firstBrace, lastBrace + 1));
    } catch (e) {}
  }

  throw new Error(`Failed to parse AI output into JSON: ${raw.substring(0, 80)}...`);
}

// Universal Structured AI Generator (Groq LPU Engine -> Local Ollama -> Gemini Fallback)
export async function generateStructuredAIResponse(
  prompt: string, 
  schemaProps: any, 
  requiredKeys: string[],
  preferredModel: string = 'openai/gpt-oss-20b'
) {
  let responseText = "";

  // Clamp input context to ~4,000 tokens (16,000 characters) to strictly respect Groq TPM rate limits
  const safePrompt = prompt.length > 16000 
    ? prompt.substring(0, 16000) + "\n\n[Context truncated for model context limits]" 
    : prompt;

  // 1. Primary Path: Groq (LPU Engine) - Fast, Free, High Rate Limits
  if (process.env.GROQ_API_KEY) {
    try {
      console.log(`[Custom AI Engine] Routing extraction to Groq LPU engine...`);
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

      for (const model of GROQ_MODELS) {
        try {
          const completion = await groq.chat.completions.create({
            model: model,
            messages: [
              {
                role: "system",
                content: `You are an elite B2B corporate intelligence analyst. You strictly output valid JSON matching the requested schema. Never output conversational preamble.`
              },
              {
                role: "user",
                content: safePrompt
              }
            ],
            response_format: { type: "json_object" },
            temperature: 0.1,
            max_tokens: 3500
          });

          const raw = completion.choices[0]?.message?.content || "";
          if (raw) {
            // Validate JSON parsing immediately
            const parsed = safeParseJson(raw);
            if (parsed) {
              console.log(`[Custom AI Engine] Successfully generated extraction with Groq (${model}).`);
              return parsed;
            }
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
      console.log(`[Custom AI Engine] Cascading to local Ollama (${process.env.OLLAMA_BASE_URL})...`);
      const ollamaRes = await axios.post(`${process.env.OLLAMA_BASE_URL}/api/generate`, {
        model: process.env.OLLAMA_MODEL || "llama3.3:70b",
        prompt: `You are a B2B intelligence engine. Output strictly JSON matching schema.\n\n${prompt}`,
        format: "json",
        stream: false
      }, { timeout: 15000 });

      const raw = ollamaRes.data?.response;
      if (raw) {
        const parsed = safeParseJson(raw);
        if (parsed) {
          console.log(`[Custom AI Engine] Successfully extracted via local Ollama.`);
          return parsed;
        }
      }
    } catch (ollamaErr: any) {
      console.warn(`[Custom AI Engine] Ollama failed (${ollamaErr.message}), cascading to Gemini fallback.`);
    }
  }

  // 3. Fallback Path: Google Gemini (if available)
  if (process.env.GEMINI_API_KEY) {
    console.log(`[Custom AI Engine] Cascading to Gemini fallback...`);
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    for (const model of VALID_GEMINI_MODELS) {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout on ${model}`)), 10000)
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
        
        const raw = response.text || "";
        if (raw) {
          const parsed = safeParseJson(raw);
          if (parsed) return parsed;
        }
      } catch (err: any) {
        console.log(`[AI Generation] Gemini ${model} failed (${err.message}), trying next...`);
      }
    }
  }

  throw new Error("All AI extraction engines (Groq, Ollama, Gemini) are currently unavailable.");
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
export async function searchWebFallback(query: string, maxResults: number = 8): Promise<{ answer: string, context: any[], contextString: string }> {
  try {
    console.log(`[Autonomous Harvester] Crawling regional search for: ${query}`);
    const results: { title: string, url: string, snippet: string }[] = [];

    // 1. Primary Engine: DuckDuckGo Lite (Highly accurate direct corporate domain discovery)
    try {
      const ddgRes = await axios.post('https://lite.duckduckgo.com/lite/', `q=${encodeURIComponent(query)}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 4500
      });

      const ddg$ = cheerio.load(ddgRes.data);
      ddg$('a.result-link').each((_, el) => {
        const title = ddg$(el).text().trim();
        const href = ddg$(el).attr('href') || '';
        if (href.startsWith('http') && !href.includes('duckduckgo.com')) {
          results.push({ title, url: href, snippet: '' });
        }
      });
    } catch (ddgErr) {
      console.warn('[Autonomous Harvester] DDG Lite notice, using Bing...');
    }

    // 2. Secondary Engine: Bing Regional Search
    if (results.length < 4) {
      try {
        const bingRes = await axios.get('https://www.bing.com/search', {
          params: { q: query, cc: 'IN', setlang: 'en-IN', setmkt: 'en-IN' },
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept-Language': 'en-IN,en;q=0.9',
            'Cookie': 'SRCHHPGUSR=ADLT=OFF&NRSLT=10&SRCHLANG=en&LOCATION=1'
          },
          timeout: 4500
        });

        const bing$ = cheerio.load(bingRes.data);
        bing$('li.b_algo').each((_, el) => {
          const title = bing$(el).find('h2 a').text().trim();
          const rawUrl = bing$(el).find('h2 a').attr('href') || '';
          const url = decodeBingUrl(rawUrl);
          const snippet = bing$(el).find('.b_caption p, .b_algoSlug, p').text().trim();
          if (title && url && !url.includes('bing.com/search') && !results.some(r => r.url === url)) {
            results.push({ title, url, snippet });
          }
        });
      } catch (bingErr) {}
    }

    if (results.length === 0) {
      return { answer: "", context: [], contextString: "No web results found." };
    }

    // 3. Domain & Content Prioritization: Prioritize .com corporate portals over .in brochure landing pages
    const prioritizedResults = results.sort((a, b) => {
      const aUrl = a.url.toLowerCase();
      const bUrl = b.url.toLowerCase();
      const aIsCom = aUrl.includes('.com');
      const bIsCom = bUrl.includes('.com');
      if (aIsCom && !bIsCom) return -1;
      if (!aIsCom && bIsCom) return 1;
      return 0;
    });

    const topResults = prioritizedResults.slice(0, maxResults);

    // 4. Deep Crawl: Scrape top pages AND their internal product/catalog sub-pages
    const fetchPromises = topResults.slice(0, 5).map(async (r) => {
      let pageContent = r.snippet;
      let subPageTexts: string[] = [];
      const discoveredModels = new Set<string>();

      try {
        const pageRes = await axios.get(r.url, {
          timeout: 3500,
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });

        const page$ = cheerio.load(pageRes.data);
        const origin = new URL(r.url).origin;

        // Discover internal sub-pages (products, catalog, specs, about, contact)
        const subLinks = new Set<string>();

        page$('a[href]').each((_, el) => {
          let href = page$(el).attr('href')?.trim();
          let linkText = page$(el).text().trim().replace(/\s+/g, ' ');
          if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
          try {
            const fullUrl = new URL(href, origin).toString();
            if (fullUrl.startsWith(origin)) {
              const lower = fullUrl.toLowerCase();
              const lowerText = linkText.toLowerCase();

              if (
                lower.includes('product') || 
                lower.includes('catalog') || 
                lower.includes('brochure') ||
                lower.includes('spec') || 
                lower.includes('about') || 
                lower.includes('contact') || 
                lower.includes('profile') ||
                lower.includes('management') ||
                lower.includes('director') ||
                lower.includes('tape') ||
                lower.includes('foam') ||
                lower.includes('film') ||
                lower.includes('die-cut')
              ) {
                subLinks.add(fullUrl);

                // Collect exact product model names from link texts and URL slugs
                if (linkText.length > 5 && !lowerText.includes('skip') && !lowerText.includes('contact') && !lowerText.includes('about') && !lowerText.includes('privacy')) {
                  discoveredModels.add(linkText);
                } else {
                  const slug = fullUrl.split('/').filter(Boolean).pop();
                  if (slug && slug.length > 5 && !slug.includes('.pdf') && !slug.includes('contact') && !slug.includes('about')) {
                    discoveredModels.add(slug.replace(/-/g, ' ').toUpperCase());
                  }
                }
              }
            }
          } catch (e) {}
        });

        // Parallel scrape up to 8 high-priority product and catalog sub-pages
        const subPagePromises = Array.from(subLinks).slice(0, 8).map(async (subUrl) => {
          try {
            const subRes = await axios.get(subUrl, {
              timeout: 3000,
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
            });
            const sub$ = cheerio.load(subRes.data);
            sub$('script, style, noscript, nav, footer, header').remove();
            const subText = sub$('body').text().replace(/\s+/g, ' ').trim();
            if (subText.length > 100) {
              return `[Subpage: ${subUrl}]\n${subText.substring(0, 6000)}`;
            }
          } catch (e) {}
          return '';
        });

        const resolvedSubs = await Promise.all(subPagePromises);
        subPageTexts = resolvedSubs.filter(Boolean);

        page$('script, style, noscript, nav, footer, header').remove();
        const mainText = page$('body').text().replace(/\s+/g, ' ').trim();
        if (mainText.length > 150) {
          pageContent = mainText.substring(0, 8000);
        }
      } catch (e) {}

      const discoveredList = Array.from(discoveredModels);
      const fullBlock = [
        `URL: ${r.url}`,
        `Title: ${r.title}`,
        discoveredList.length > 0 ? `=== DIRECT PRODUCT CATALOG MODELS DISCOVERED ON SITE ===\n${discoveredList.map((m, i) => `${i + 1}. ${m}`).join('\n')}` : '',
        `Main Content: ${pageContent}`,
        subPageTexts.length > 0 ? `--- Deep Crawled Sub-pages ---\n${subPageTexts.join('\n\n')}` : ''
      ].filter(Boolean).join('\n');

      return fullBlock;
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
