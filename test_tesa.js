const axios = require('axios');
const cheerio = require('cheerio');

async function testTesa() {
  console.log('Crawling tesa.com...');
  const res = await axios.get('https://www.tesa.com/en-in', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9'
    },
    timeout: 6000
  });

  const $ = cheerio.load(res.data);
  const links = [];
  $('a[href]').each((_, el) => {
    const text = $(el).text().trim().replace(/\s+/g, ' ');
    const href = $(el).attr('href')?.trim() || '';
    if (text.length > 2 && text.length < 80) {
      links.push({ text, href });
    }
  });

  console.log(`Found ${links.length} links on tesa.com/en-in:`);
  links.slice(0, 30).forEach((l, i) => console.log(` ${i + 1}. ${l.text} (${l.href})`));
}

testTesa();
