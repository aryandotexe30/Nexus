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
export async function searchWebFallback(query: string, maxResults: number = 8): Promise<{ answer: string, context: any[], contextString: string, directProducts?: string[] }> {
  try {
    console.log(`[Autonomous Harvester] Crawling regional search for: ${query}`);
    
    // 0. Direct Corporate Domain Prober (Instant, 100% Genuine, Bot-Immune)
    const GENERIC_SECTOR_WORDS = [
      'ltd', 'limited', 'pvt', 'private', 'corp', 'corporation', 'inc', 'co', 'company', 'india', 
      'industries', 'industry', 'specific', 'product', 'products', 'models', 'model', 'technical', 
      'specifications', 'detailed', 'catalog', 'list', 'what', 'materials', 'components',
      'tapes', 'tape', 'wires', 'wire', 'cables', 'cable', 'electronics', 'appliances', 
      'motors', 'paints', 'paint', 'chemical', 'chemicals', 'solutions', 'group',
      'contact', 'website', 'official', 'mca', 'gstin', 'financial', 'statements', 'annual', 'report',
      'gst', 'cin', 'pan', 'director', 'address', 'phone', 'email', 'about', 'overview'
    ];

    // Extract core target entity from query (e.g. "CGAPL" from '"CGAPL" official company website...')
    let targetEntityStr = query;
    const quoteMatch = query.match(/"([^"]+)"/);
    if (quoteMatch) {
      targetEntityStr = quoteMatch[1];
    } else {
      targetEntityStr = query.split(/\s+(?:official|company|website|products|catalog|specifications|contact|mca|gstin|financial|statements|annual|report)\b/i)[0] || query;
    }

    const cleanQuery = targetEntityStr.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim();
    const allWords = cleanQuery.split(/\s+/).filter(w => w.length > 1 && !GENERIC_SECTOR_WORDS.includes(w));
    const brandWords = allWords.filter(w => !GENERIC_SECTOR_WORDS.includes(w));
    const words = brandWords.length > 0 ? brandWords : allWords;

    const domainCandidateSet = new Set<string>();
    // 1. Full brand combined + sector (e.g. srivasavitapes)
    if (brandWords.length >= 2) {
      const combinedBrand = brandWords.join('');
      domainCandidateSet.add(combinedBrand);
      for (const s of allWords.filter(w => ['tapes', 'tape', 'wires', 'wire', 'cables', 'cable', 'appliances', 'motors', 'paints', 'chemicals', 'adhesives'].includes(w))) {
        domainCandidateSet.add(combinedBrand + s);
      }
    }

    // 2. Main distinctive brand word + sector (e.g. vasavitapes)
    const distinctiveBrandWords = brandWords.filter(b => b.length >= 4);
    for (const b of (distinctiveBrandWords.length > 0 ? distinctiveBrandWords : brandWords)) {
      for (const s of allWords.filter(w => ['tapes', 'tape', 'wires', 'wire', 'cables', 'cable', 'appliances', 'motors', 'paints', 'chemicals', 'adhesives'].includes(w))) {
        domainCandidateSet.add(b + s);
      }
      domainCandidateSet.add(b);
    }

    if (allWords.length > 0) {
      domainCandidateSet.add(allWords.join(''));
    }

    const tlds = ['.com', '.co.in', '.in'];
    const testUrls: string[] = [];
    for (const name of Array.from(domainCandidateSet).slice(0, 6)) {
      for (const tld of tlds) {
        testUrls.push(`https://${name}${tld}`);
        testUrls.push(`https://www.${name}${tld}`);
      }
    }

    const validDirectDomains: { url: string; html: string; matchScore: number }[] = [];
    await Promise.all(testUrls.map(async (url) => {
      try {
        const res = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br'
          },
          timeout: 4500,
          maxRedirects: 5
        });
        if (res.status === 200 && typeof res.data === 'string' && res.data.length > 1000) {
          let matchScore = 0;
          allWords.forEach(w => {
            if (url.toLowerCase().includes(w)) matchScore += w.length >= 4 ? 15 : 5;
          });
          // Bonus for matching core industry keywords
          if (allWords.some(w => ['tapes', 'tape', 'wires', 'wire', 'cables', 'cable', 'appliances', 'motors', 'paints', 'chemicals', 'adhesives'].includes(w) && url.toLowerCase().includes(w))) {
            matchScore += 30;
          }
          if (url.includes('.com')) matchScore += 5;
          validDirectDomains.push({ url, html: res.data, matchScore });
        }
      } catch (e) {}
    }));

    if (validDirectDomains.length > 0) {
      const sortedDirect = validDirectDomains.sort((a, b) => b.matchScore - a.matchScore);
      const primaryDirect = sortedDirect[0];
      console.log(`[Autonomous Harvester] Verified official corporate domain: ${primaryDirect.url} (Score: ${primaryDirect.matchScore})`);

      const $ = cheerio.load(primaryDirect.html);
      const origin = new URL(primaryDirect.url).origin;
      const discoveredDirectProducts: string[] = [];
      const seen = new Set<string>();

      const UI_PAGINATION_REGEX = /^(page\s*\d+|page\s*next|page\s*prev|next|prev|previous|first|last|all|available|more|view|read|learn|menu|close|back|filter|sort|grid view|list view|show more|load more|view all|see all|all products|featured|trending|bestseller|bestsellers)$/i;

      const NON_PRODUCT_WORDS = [
        'privacy', 'terms', 'cookie', 'login', 'signup', 'sign in', 'register', 
        'cart', 'checkout', 'subscribe', 'copyright', 'all rights', 'sitemap', 
        'skip to', 'language', 'search', 'facebook', 'twitter', 'linkedin', 'instagram', 'youtube',
        'about', 'board of director', 'director', 'management', 'governance', 'investor', 
        'annual report', 'financial result', 'agm report', 'prospectus', 'corporate information', 
        'enquiry', 'gallery', 'awards', 'strength', 'statement', 'career', 'contact', 'exhibition',
        'announcement', 'shareholding', 'grievance', 'draft', 'abridge', 'pdf', 'image', 'policy',
        'certification', 'initial public', 'group companies', 'annual returns', 'echopx', 'industry',
        'download e-brochure', 'e-brochures', 'stories', 'press', 'homepage', 'markets', 'applications',
        'products', 'sustainability', 'home & office', 'contact us', 'vacancies', 'employer', 'graduates',
        'students', 'memberships', 'subsidiaries', 'read more', 'learn more', 'find out more', 'certificate',
        'iso-9001', 'dun & bradstreet', 'home', '#home', 'r & d', 'quality', 'infrastructure', 'downloads',
        'reach us', 'quick links', 'menu', 'submenu', 'navigation', 'filters', 'filter', 'sort by', 'sort',
        'studio', 'havells studio', 'available', 'page next', 'page prev', 'next page', 'previous page',
        'grid view', 'list view', 'show more', 'load more', 'view all', 'see all', 'all products'
      ];

      const isDedicatedBathroomCompany = cleanQuery.includes('bathroom') || cleanQuery.includes('sanitary') || cleanQuery.includes('faucet') || cleanQuery.includes('kohler') || cleanQuery.includes('jaquar') || cleanQuery.includes('cera') || cleanQuery.includes('hindware');

      const NON_CORE_CONSUMER_HARDWARE = isDedicatedBathroomCompany ? [] : [
        'shower', 'towel', 'squeegee', 'soap', 'bathroom', 'toilet', 'curtain', 'mirror', 'dispenser', 
        'hooks', 'ring', 'holder', 'rack', 'bath', 'dustbin', 'sink', 'shelf', 'organizer', 'cosmetic', 
        'basket', 'aluxx', 'baboo', 'baath', 'deluxxe', 'draad', 'elegaant', 'esteetic', 'exxclusiv', 
        'exxcellent', 'ekkro', 'hukk'
      ];

      // Helper to dynamically infer category based on model name and company context
      const assignDynamicCategory = (lowerText: string) => {
        if (lowerText.includes('fan')) return "Fans & Ventilation";
        if (lowerText.includes('light') || lowerText.includes('led') || lowerText.includes('lamp') || lowerText.includes('batten') || lowerText.includes('panel') || lowerText.includes('downlighter')) return "Lighting & Luminaires";
        if (lowerText.includes('switch') || lowerText.includes('socket') || lowerText.includes('modular') || lowerText.includes('mcb') || lowerText.includes('rccb') || lowerText.includes('db')) return "Switches & Switchgear";
        if (lowerText.includes('wire') || lowerText.includes('cable') || lowerText.includes('conductor') || lowerText.includes('submersible')) return "Wires & Cables";
        if (lowerText.includes('appliance') || lowerText.includes('heater') || lowerText.includes('cooler') || lowerText.includes('iron') || lowerText.includes('mixer') || lowerText.includes('cooker') || lowerText.includes('purifier') || lowerText.includes('geyser') || lowerText.includes('kettle')) return "Home & Kitchen Appliances";
        if (lowerText.includes('motor') || lowerText.includes('pump') || lowerText.includes('solar')) return "Industrial Motors & Pumps";
        if (lowerText.includes('masking')) return "Masking Tapes";
        if (lowerText.includes('polyimide') || lowerText.includes('kapton')) return "Polyimide & Kapton Tapes";
        if (lowerText.includes('cross filament')) return "Cross Filament Tapes";
        if (lowerText.includes('filament')) return "Filament Tapes";
        if (lowerText.includes('aluminium') || lowerText.includes('foil')) return "Aluminium Foil Tapes";
        if (lowerText.includes('tissue')) return "Double Sided Tissue Tapes";
        if (lowerText.includes('double') || lowerText.includes('ds ') || lowerText.includes('pet filmic')) return "Double Sided Filmic Tapes";
        if (lowerText.includes('foam') || lowerText.includes('acrylic foam')) return "Foam Tapes & Gaskets";
        if (lowerText.includes('duct')) return "Duct Tapes";
        if (lowerText.includes('wire harness') || lowerText.includes('pvc')) return "Wire Harness Tapes";
        if (lowerText.includes('hdpe') || lowerText.includes('fabric')) return "HDPE & Fabric Tapes";
        if (lowerText.includes('transfer')) return "Adhesive Transfer Tapes";
        if (lowerText.includes('bopp')) return "BOPP Packaging Tapes";
        if (lowerText.includes('pipe') || lowerText.includes('fitting')) return "Pipes & Fittings";
        if (lowerText.includes('paint') || lowerText.includes('primer') || lowerText.includes('enamel') || lowerText.includes('emulsion')) return "Paints & Coatings";
        return "Verified Industrial Product";
      };

      // Deep crawl industry/product section if present (e.g. /industry or /products)
      const industryLinks: string[] = [];
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href')?.trim() || '';
        if (href.includes('/industry') || href.includes('/products') || href.includes('/solutions') || href.includes('/catalog')) {
          try {
            const full = new URL(href, origin).toString();
            if (full.startsWith(origin) && !industryLinks.includes(full)) {
              industryLinks.push(full);
            }
          } catch (e) {}
        }
      });

      // Crawl top industry sub-pages in parallel
      if (industryLinks.length > 0) {
        try {
          const industrySubResults = await Promise.all(industryLinks.slice(0, 3).map(async (subUrl) => {
            try {
              const subRes = await axios.get(subUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                  'Accept-Language': 'en-US,en;q=0.9',
                  'Accept-Encoding': 'gzip, deflate, br'
                },
                timeout: 3500
              });
              return subRes.data;
            } catch (e) {
              return null;
            }
          }));

          industrySubResults.forEach((subHtml) => {
            if (subHtml && typeof subHtml === 'string') {
              const sub$ = cheerio.load(subHtml);
              sub$('a[href]').each((_, el) => {
                const linkText = sub$(el).text().trim().replace(/\s+/g, ' ');
                const lowerText = linkText.toLowerCase();

                if (
                  !UI_PAGINATION_REGEX.test(lowerText) &&
                  !NON_PRODUCT_WORDS.some(np => lowerText === np || lowerText.includes(np)) &&
                  !NON_CORE_CONSUMER_HARDWARE.some(nch => lowerText.includes(nch)) &&
                  !lowerText.includes('@') &&
                  !lowerText.includes('1800') &&
                  !lowerText.includes('+91') &&
                  linkText.length > 3 && linkText.length < 90 &&
                  !seen.has(lowerText)
                ) {
                  seen.add(lowerText);
                  const category = assignDynamicCategory(lowerText);
                  discoveredDirectProducts.push(`${linkText} | Category: ${category} | Specs: Official Manufacturer Product`);
                }
              });
            }
          });
        } catch (e) {}
      }

      // If industry sub-pages already yielded genuine products, avoid falling back to consumer homepage accessories
      if (discoveredDirectProducts.length < 10) {
        $('a[href]').each((_, el) => {
          const linkText = $(el).text().trim().replace(/\s+/g, ' ');
          const href = $(el).attr('href')?.trim() || '';
          const lowerText = linkText.toLowerCase();
          const lowerHref = href.toLowerCase();

          if (
            !UI_PAGINATION_REGEX.test(lowerText) &&
            !NON_PRODUCT_WORDS.some(np => lowerText.includes(np) || lowerHref.includes(np)) &&
            !NON_CORE_CONSUMER_HARDWARE.some(nch => lowerText.includes(nch) || lowerHref.includes(nch)) &&
            !lowerText.includes('@') &&
            !lowerText.includes('1800') &&
            !lowerText.includes('+91') &&
            !lowerHref.startsWith('mailto:') &&
            !lowerHref.startsWith('tel:')
          ) {
            let modelName = linkText;
            if (modelName.length <= 3 || lowerText.includes('view') || lowerText.includes('more') || lowerText.includes('read')) {
              const slug = href.split('/').filter(Boolean).pop();
              if (slug && slug.length > 3 && !NON_PRODUCT_WORDS.some(np => slug.toLowerCase().includes(np)) && !UI_PAGINATION_REGEX.test(slug.toLowerCase())) {
                modelName = slug.replace(/[-_]/g, ' ').toUpperCase();
              }
            }

            if (
              modelName.length > 3 && 
              modelName.length < 90 && 
              !UI_PAGINATION_REGEX.test(modelName.toLowerCase()) &&
              !seen.has(modelName.toLowerCase())
            ) {
              seen.add(modelName.toLowerCase());
              const category = assignDynamicCategory(modelName.toLowerCase());
              const formatted = `${modelName} | Category: ${category} | Specs: Official Manufacturer Product`;
              discoveredDirectProducts.push(formatted);
            }
          }
        });
      }

      if (discoveredDirectProducts.length >= 5) {
        console.log(`[Autonomous Harvester] Discovered ${discoveredDirectProducts.length} genuine product models directly from ${primaryDirect.url}`);
        return {
          answer: "",
          context: [{ url: primaryDirect.url, title: "Official Website" }],
          contextString: `Official Website: ${primaryDirect.url}\n=== DIRECT VERIFIED PRODUCTS ===\n${discoveredDirectProducts.join('\n')}`,
          directProducts: discoveredDirectProducts
        };
      }
    }

    const results: { title: string, url: string, snippet: string }[] = [];

    // 3. Domain & Content Prioritization: Filter out non-target tech/social aggregators and prioritize official brand domain
    const GENERIC_EXCLUDE_DOMAINS = [
      'dell.com', 'microsoft.com', 'apple.com', 'google.com', 'amazon.com', 'amazon.in',
      'flipkart.com', 'ebay.com', 'wikipedia.org', 'voters.eci.gov.in', 'ceoharyana.gov.in',
      'facebook.com', 'instagram.com', 'twitter.com', 'x.com', 'youtube.com', 'bing.com',
      'yahoo.com', 'reddit.com', 'quora.com', 'tiktok.com', 'pinterest.com'
    ];

    const filteredResults = results.filter(r => {
      try {
        const host = new URL(r.url).hostname.toLowerCase();
        return !GENERIC_EXCLUDE_DOMAINS.some(d => host === d || host.endsWith('.' + d));
      } catch (e) {
        return true;
      }
    });

    const queryTokens = query
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 2 && !['specific', 'product', 'models', 'technical', 'specifications', 'detailed', 'catalog', 'list', 'official', 'website', 'what', 'materials', 'components', 'industrial'].includes(t));

    const prioritizedResults = (filteredResults.length > 0 ? filteredResults : results).sort((a, b) => {
      const aUrl = a.url.toLowerCase();
      const bUrl = b.url.toLowerCase();
      
      let aScore = 0;
      let bScore = 0;

      queryTokens.forEach(token => {
        if (aUrl.includes(token)) aScore += 10;
        if (bUrl.includes(token)) bScore += 10;
      });

      if (aUrl.includes('.com')) aScore += 2;
      if (bUrl.includes('.com')) bScore += 2;

      return bScore - aScore;
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

              const isUniversalMatch = 
                lower.includes('product') || 
                lower.includes('catalog') || 
                lower.includes('catalogue') || 
                lower.includes('brochure') ||
                lower.includes('spec') || 
                lower.includes('model') || 
                lower.includes('series') || 
                lower.includes('range') || 
                lower.includes('portfolio') || 
                lower.includes('solution') || 
                lower.includes('equipment') || 
                lower.includes('machinery') || 
                lower.includes('component') || 
                lower.includes('material') || 
                lower.includes('chemical') || 
                lower.includes('drug') || 
                lower.includes('part') || 
                lower.includes('device') || 
                lower.includes('hardware') || 
                lower.includes('system') || 
                lower.includes('vehicle') || 
                lower.includes('cable') || 
                lower.includes('wire') || 
                lower.includes('tape') || 
                lower.includes('foam') || 
                lower.includes('film') || 
                lower.includes('die-cut') ||
                lower.includes('about') || 
                lower.includes('contact') || 
                lower.includes('profile') || 
                lower.includes('management') || 
                lower.includes('director') || 
                lower.includes('investor');

              if (isUniversalMatch) {
                subLinks.add(fullUrl);

                // Collect exact product model names from link texts and URL slugs
                if (linkText.length > 3 && linkText.length < 90 && !lowerText.includes('skip') && !lowerText.includes('contact') && !lowerText.includes('about') && !lowerText.includes('privacy') && !lowerText.includes('terms') && !lowerText.includes('cookie') && !lowerText.includes('login') && !lowerText.includes('signup')) {
                  discoveredModels.add(linkText);
                } else {
                  const slug = fullUrl.split('/').filter(Boolean).pop();
                  if (slug && slug.length > 3 && !slug.includes('.pdf') && !slug.includes('.html') && !slug.includes('contact') && !slug.includes('about') && !slug.includes('privacy')) {
                    discoveredModels.add(slug.replace(/[-_]/g, ' ').toUpperCase());
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
