require('dotenv').config({ path: '.env.local' });
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function testGemini(modelName) {
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: 'Hello',
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    console.log(`Success for ${modelName}:`, response.text.substring(0, 50));
  } catch (err) {
    console.error(`Failed for ${modelName}:`, err.message);
  }
}

async function main() {
  await testGemini('gemini-2.5-flash');
  await testGemini('gemini-1.5-flash');
  await testGemini('gemini-1.5-pro');
  await testGemini('gemini-2.5-pro');
}
main();
