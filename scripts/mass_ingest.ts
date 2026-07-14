import fs from 'fs';
// @ts-ignore
import csv from 'csv-parser';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const prisma = new PrismaClient();

// Configuration
const BATCH_SIZE = 5;
const RATE_LIMIT_DELAY_MS = 2000;
const CSV_FILE_PATH = process.argv[2];

if (!CSV_FILE_PATH) {
  console.error("Please provide a CSV file path. Usage: npx ts-node scripts/mass_ingest.ts <path-to-csv>");
  process.exit(1);
}

// Function to process a single company and enrich it
async function processCompany(name: string, gst: string) {
  try {
    // 1. Check if it already exists
    const existing = await prisma.company.findUnique({
      where: { name }
    });

    if (existing && existing.data && (existing.data as any).enriched) {
      console.log(`[SKIP] ${name} is already enriched.`);
      return;
    }

    console.log(`[PROCESS] Enriching ${name}...`);

    const searchRes = await axios.post('https://api.tavily.com/search', {
      api_key: process.env.TAVILY_API_KEY,
      query: `Company profile for ${name} in India. GST: ${gst}. Business details, products, contact, location.`,
      search_depth: 'basic',
      include_answer: true,
      max_results: 3
    });

    const searchContext = searchRes.data.results?.map((r: any) => r.content).join("\n") || "";

    const { GoogleGenAI } = require('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `
Extract detailed B2B information about the following Indian company:
Name: ${name}
GST: ${gst}

Search Context:
${searchContext}
${searchRes.data.answer || ""}

Return a JSON object containing:
- description: string
- industry: string
- location: string
- phone: string
- email: string
- products: array of strings
- raw_materials_purchased: string
- financials: string
- enriched: boolean (true)
`;

    const chat = ai.chats.create({ model: 'gemini-2.5-flash' });
    const response = await chat.sendMessage({ message: prompt });
    let resultText = response.text || "";
    resultText = resultText.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsedData = JSON.parse(resultText);

    await prisma.company.upsert({
      where: { name },
      update: { data: { ...parsedData, gst, source: 'Mass Ingestion' } },
      create: { name, data: { ...parsedData, gst, source: 'Mass Ingestion' } }
    });

    console.log(`[SUCCESS] Saved ${name}`);
  } catch (error: any) {
    console.error(`[ERROR] Failed to process ${name}:`, error?.message || error);
  }
}

async function main() {
  console.log(`Starting Mass Ingestion from ${CSV_FILE_PATH}`);
  const records: any[] = [];

  // Read CSV
  fs.createReadStream(CSV_FILE_PATH)
    .pipe(csv())
    .on('data', (data) => records.push(data))
    .on('end', async () => {
      console.log(`Loaded ${records.length} records. Beginning processing in batches of ${BATCH_SIZE}...`);
      
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE);
        console.log(`\n--- Processing Batch ${i / BATCH_SIZE + 1} / ${Math.ceil(records.length / BATCH_SIZE)} ---`);
        
        await Promise.all(batch.map(async (row) => {
          const name = row['Company Name'] || row['name'] || row['Name'];
          const gst = row['GST'] || row['gst'] || '';
          if (name) {
            await processCompany(name, gst);
          }
        }));

        if (i + BATCH_SIZE < records.length) {
          console.log(`Waiting ${RATE_LIMIT_DELAY_MS}ms for rate limits...`);
          await new Promise(r => setTimeout(r, RATE_LIMIT_DELAY_MS));
        }
      }
      
      console.log("Mass Ingestion Complete!");
      process.exit(0);
    });
}

main();
