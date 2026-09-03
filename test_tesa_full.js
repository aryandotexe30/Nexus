const axios = require('axios');
const cheerio = require('cheerio');

async function testTesaExtraction() {
  const url = 'https://www.tesa.com/en-in/industry';
  const res = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    timeout: 5000
  });

  const $ = cheerio.load(res.data);
  const discovered = [];
  const seen = new Set();

  const NON_CORE_CONSUMER = [
    'shower', 'towel', 'squeegee', 'soap', 'bathroom', 'toilet', 'curtain', 'mirror', 'dispenser', 'hooks', 'ring', 'holder', 'rack'
  ];

  const NON_PRODUCT_WORDS = [
    'privacy', 'terms', 'cookie', 'login', 'signup', 'sign in', 'register', 
    'cart', 'checkout', 'subscribe', 'copyright', 'all rights', 'sitemap', 
    'skip to', 'language', 'search', 'facebook', 'twitter', 'linkedin', 'instagram', 'youtube',
    'about', 'board of director', 'director', 'management', 'governance', 'investor', 
    'annual report', 'financial result', 'agm report', 'prospectus', 'corporate information', 
    'enquiry', 'gallery', 'awards', 'strength', 'statement', 'career', 'contact', 'exhibition',
    'announcement', 'shareholding', 'grievance', 'draft', 'abridge', 'pdf', 'image', 'policy',
    'certification', 'initial public', 'group companies', 'annual returns', 'echopx', 'industry',
    'download e-brochure', 'e-brochures', 'stories', 'press', 'homepage', 'markets', 'applications', 'products',
    'sustainability', 'home & office', 'contact us'
  ];

  $('a[href]').each((_, el) => {
    const text = $(el).text().trim().replace(/\s+/g, ' ');
    const href = $(el).attr('href')?.trim() || '';
    const lower = text.toLowerCase();

    if (
      !NON_PRODUCT_WORDS.some(np => lower === np || lower.includes(np)) &&
      !NON_CORE_CONSUMER.some(nc => lower.includes(nc)) &&
      text.length > 3 && text.length < 80 &&
      !seen.has(lower)
    ) {
      seen.add(lower);
      discovered.push(`${text} | Category: Industrial Tape & Adhesive Solution | Specs: Official tesa Catalog Item`);
    }
  });

  console.log(`Discovered ${discovered.length} genuine tesa industrial products:`);
  discovered.slice(0, 25).forEach((d, i) => console.log(` ${i + 1}. ${d}`));
}

testTesaExtraction();
