import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

const envLocal = fs.existsSync('.env.local') ? fs.readFileSync('.env.local', 'utf-8') : '';
const env = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf-8') : '';
const fullEnv = envLocal + '\n' + env;
const keyMatch = fullEnv.match(/GEMINI_API_KEY=(.*)/);
const key = keyMatch ? keyMatch[1].trim().replace(/['"]/g, '') : '';

const ai = new GoogleGenAI({ apiKey: key });

async function run() {
  const models = ['gemini-2.5-flash-lite', 'gemini-flash-lite-latest'];
  for (const model of models) {
    try {
      console.log(`Testing ${model}...`);
      const response = await ai.models.generateContent({
        model: model,
        contents: "hello",
      });
      console.log(`SUCCESS ${model}:`, response.text);
    } catch (err) {
      console.error(`ERROR ${model}:`, err.message);
    }
  }
}
run();
