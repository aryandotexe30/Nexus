import axios from 'axios';
import * as cheerio from 'cheerio';

export interface SignalHireContact {
  name: string;
  title: string;
  department: 'Sales' | 'Management' | 'HR' | 'Other';
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  source: string;
}

export async function fetchSignalHirePersonnel(companyName: string): Promise<{
  salesContacts: SignalHireContact[];
  managementContacts: SignalHireContact[];
  hrContacts: SignalHireContact[];
  rawContext: string;
}> {
  const salesContacts: SignalHireContact[] = [];
  const managementContacts: SignalHireContact[] = [];
  const hrContacts: SignalHireContact[] = [];
  let rawContext = "";

  const apiKey = process.env.SIGNALHIRE_API_KEY;

  // 1. Official SignalHire API Request (if key configured)
  if (apiKey) {
    try {
      console.log(`[SignalHire API] Querying candidates for company: ${companyName}`);
      const res = await axios.post(
        'https://www.signalhire.com/api/v1/candidate/search',
        {
          currentCompany: [companyName],
          size: 15
        },
        {
          headers: {
            'apiKey': apiKey.trim(),
            'Content-Type': 'application/json'
          },
          timeout: 6000
        }
      );

      const candidates = res.data?.items || res.data?.candidates || res.data || [];
      if (Array.isArray(candidates) && candidates.length > 0) {
        console.log(`[SignalHire API] Found ${candidates.length} verified candidates.`);
        for (const c of candidates) {
          const name = c.fullName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.name;
          const title = c.currentPosition || c.title || c.headline || 'Executive';
          const email = c.emails?.[0]?.value || c.email || '';
          const phone = c.phones?.[0]?.value || c.phone || '';
          const linkedinUrl = c.socialProfiles?.find((s: any) => s.type === 'linkedin')?.url || c.linkedin || c.profileUrl || '';

          const lowerTitle = title.toLowerCase();
          let dept: 'Sales' | 'Management' | 'HR' | 'Other' = 'Other';

          if (lowerTitle.includes('sale') || lowerTitle.includes('business') || lowerTitle.includes('commercial') || lowerTitle.includes('procurement') || lowerTitle.includes('marketing')) {
            dept = 'Sales';
            salesContacts.push({ name, title, department: dept, email, phone, linkedinUrl, source: 'SignalHire API (Verified LinkedIn)' });
          } else if (lowerTitle.includes('director') || lowerTitle.includes('founder') || lowerTitle.includes('ceo') || lowerTitle.includes('president') || lowerTitle.includes('managing') || lowerTitle.includes('vp') || lowerTitle.includes('head')) {
            dept = 'Management';
            managementContacts.push({ name, title, department: dept, email, phone, linkedinUrl, source: 'SignalHire API (Verified LinkedIn)' });
          } else if (lowerTitle.includes('hr') || lowerTitle.includes('human') || lowerTitle.includes('talent') || lowerTitle.includes('recruit') || lowerTitle.includes('people')) {
            dept = 'HR';
            hrContacts.push({ name, title, department: dept, email, phone, linkedinUrl, source: 'SignalHire API (Verified LinkedIn)' });
          } else {
            salesContacts.push({ name, title, department: dept, email, phone, linkedinUrl, source: 'SignalHire API (Verified LinkedIn)' });
          }
        }
      }
    } catch (err: any) {
      console.warn(`[SignalHire API] Request failed (${err.message}), falling back to live crawler.`);
    }
  }

  // 2. Auxiliary Deep LinkedIn & SignalHire Search Crawler
  try {
    const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(`site:signalhire.com/companies OR site:linkedin.com/in ("${companyName}" AND (Sales OR HR OR Director OR Manager))`)}&cc=IN&setlang=en-IN`;
    const crawlRes = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-IN,en;q=0.9'
      },
      timeout: 5000
    });

    const $ = cheerio.load(crawlRes.data);
    const snippets: string[] = [];

    $('li.b_algo').each((_, el) => {
      const title = $(el).find('h2 a').text().trim();
      const snippet = $(el).find('.b_caption p, .b_algoSlug, p').text().trim();
      const href = $(el).find('h2 a').attr('href') || '';
      if (title && (href.includes('linkedin.com') || href.includes('signalhire.com'))) {
        snippets.push(`Profile: ${title}\nURL: ${href}\nSummary: ${snippet}`);
      }
    });

    if (snippets.length > 0) {
      rawContext = snippets.join('\n\n---\n\n');
    }
  } catch (e) {}

  return {
    salesContacts,
    managementContacts,
    hrContacts,
    rawContext
  };
}
