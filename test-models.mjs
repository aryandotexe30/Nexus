import fs from 'fs';
const envLocal = fs.existsSync('.env.local') ? fs.readFileSync('.env.local', 'utf-8') : '';
const env = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf-8') : '';
const fullEnv = envLocal + '\n' + env;
const keyMatch = fullEnv.match(/GEMINI_API_KEY=(.*)/);
const key = keyMatch ? keyMatch[1].trim().replace(/['"]/g, '') : '';

async function run() {
  if (!key) return console.log("NO KEY FOUND");
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
  const data = await response.json();
  if (data.models) {
    console.log(data.models.map(m => m.name).join('\n'));
  } else {
    console.log(data);
  }
}
run();
