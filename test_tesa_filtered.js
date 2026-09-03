const axios = require('axios');
const cheerio = require('cheerio');

async function testTesaFiltered() {
  const urls = [
    'https://www.tesa.com/en-in/industry',
    'https://www.tesa.com/en-in/industry/products'
  ];

  const NON_CORE_ACCESSORIES = [
    'shower', 'towel', 'squeegee', 'basket', 'soap', 'dispenser', 'shelf', 'toilet', 'bathroom',
    'hooks', 'ring', 'holder', 'rack', 'curtain', 'mirror'
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
    'sustainability'
  ];

  const products = [];
  const seen = new Set();

  for (const u of urls) {
    try {
      const res = await axios.get(u, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        timeout: 5000
      });
      const $ = cheerio.load(res.data);
      $('a[href]').each((_, el) => {
        const text = $(el).text().trim().replace(/\s+/g, ' ');
        const href = $(el).attr('href')?.trim() || '';
        const lower = text.toLowerCase();
        const lowerHref = href.toLowerCase();

        if (
          !NON_PRODUCT_WORDS.some(np => lower === np || lowerHref.endsWith('/' + np)) &&
          !NON_CORE_ACCESSORIES.some(nca => lower.includes(nca)) &&
          text.length > 2 && text.length < 80 &&
          !seen.has(text.toLowerCase())
        ) {
          seen.add(text.toLowerCase());
          products.push({ name: text, href });
        }
      });
    } catch (e) {}
  }

  console.log(`Found ${products.length} genuine industrial tesa products/solutions:`);
  products.slice(0, 30).forEach((p, i) => console.log(` ${i + 1}. ${p.name} (${p.href})`));
}

testTesaFiltered();
