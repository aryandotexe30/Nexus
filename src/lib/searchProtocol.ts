import { GoogleGenAI, Type } from '@google/genai';
import axios from 'axios';

// Unified constants
export const TAVILY_EXCLUDED_DOMAINS = [
  "amazon.com", "amazon.in", "flipkart.com", "ebay.com", 
  "justdial.com", "indiamart.com", "tradeindia.com", 
  "facebook.com", "instagram.com"
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
          setTimeout(() => reject(new Error("Gemini SDK Timeout")), 25000)
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

// Unified internet fetcher
export async function fetchVerifiedInternetData(
  query: string,
  maxResults: number = 5,
  useStrictWhitelists: boolean = false
) {
  try {
    const payload: any = {
      api_key: process.env.TAVILY_API_KEY,
      query: query,
      search_depth: 'advanced',
      include_answer: true,
      max_results: maxResults,
    };

    if (useStrictWhitelists) {
      payload.include_domains = TAVILY_VERIFIED_DOMAINS;
    } else {
      payload.exclude_domains = TAVILY_EXCLUDED_DOMAINS;
    }

    const res = await axios.post('https://api.tavily.com/search', payload, { timeout: 20000 });
    return {
      answer: res.data.answer || "",
      context: res.data.results || [],
      contextString: JSON.stringify(res.data.results?.map((r: any) => ({ t: r.title, c: r.content?.substring(0, 800) })))
    };
  } catch (e: any) {
    console.error(`Tavily search failed for query: ${query}.`, e.message);
    return { answer: "", context: [], contextString: "No internet data could be fetched." };
  }
}
