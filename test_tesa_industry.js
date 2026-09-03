const axios = require('axios');
const cheerio = require('cheerio');

async function testTesaIndustry() {
  const urls = [
    'https://www.tesa.com/en-in/industry',
    'https://www.tesa.com/en-in/industry/products'
  ];

  console.log('Crawling tesa industrial sections...');
  const industrialItems = new Set();

  for (const u of urls) {
    try {
      const res = await axios.get(u, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        timeout: 5000
      });
      const $ = cheerio.load(res.data);
      $('a[href]').each((_, el) => {
        const text = $(el).text().trim().replace(/\s+/g, ' ');
        const href = $(el).attr('href')?.trim() || '';
        const lower = text.toLowerCase();
        if (
          text.length > 2 && text.length < 90 &&
          !lower.includes('privacy') && !lower.includes('cookie') && !lower.includes('terms') &&
          !lower.includes('contact') && !lower.includes('about') && !lower.includes('career') &&
          !lower.includes('stories') && !lower.includes('press') && !lower.includes('homepage') &&
          !lower.includes('skip')
        ) {
          industrialItems.add(`${text} (${href})`);
        }
      });
    } catch (e) {
      console.log('Error on', u, e.message);
    }
  }

  console.log(`Discovered ${industrialItems.size} Industrial tesa items:`);
  Array.from(industrialItems).slice(0, 30).forEach((item, i) => console.log(` ${i + 1}. ${item}`));
}

testTesaIndustry();
