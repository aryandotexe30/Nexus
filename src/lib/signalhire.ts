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

  const apiKey = process.env.SIGNALHIRE_API_KEY?.trim();

  // 1. Auxiliary Deep LinkedIn & SignalHire Search Crawler
  const foundLinkedInUrls: string[] = [];
  try {
    const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(`site:linkedin.com/in OR site:signalhire.com/companies ("${companyName}" AND (Sales OR HR OR Director OR Manager OR Procurement))`)}&cc=IN&setlang=en-IN`;
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
      if (title && href.includes('linkedin.com/in/')) {
        foundLinkedInUrls.push(href);
        snippets.push(`LinkedIn Profile: ${title}\nURL: ${href}\nSummary: ${snippet}`);
      } else if (title && href.includes('signalhire.com')) {
        snippets.push(`SignalHire Profile: ${title}\nURL: ${href}\nSummary: ${snippet}`);
      }
    });

    if (snippets.length > 0) {
      rawContext = snippets.join('\n\n---\n\n');
    }
  } catch (e) {}

  // 2. Query Official SignalHire API to unlock direct verified emails & phone numbers
  if (apiKey) {
    try {
      const itemsToEnrich = foundLinkedInUrls.length > 0 
        ? foundLinkedInUrls.slice(0, 5) 
        : [companyName];

      console.log(`[SignalHire API] Querying candidate enrichment for ${itemsToEnrich.length} items...`);
      const res = await axios.post(
        'https://www.signalhire.com/api/v1/candidate/search',
        { items: itemsToEnrich },
        {
          headers: {
            'apiKey': apiKey,
            'Content-Type': 'application/json'
          },
          timeout: 6000
        }
      );

      const candidates = res.data?.items || res.data?.candidates || (Array.isArray(res.data) ? res.data : []);
      if (Array.isArray(candidates) && candidates.length > 0) {
        console.log(`[SignalHire API] Successfully unlocked ${candidates.length} verified LinkedIn profiles.`);
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
            salesContacts.push({ name, title, department: dept, email, phone, linkedinUrl, source: 'SignalHire (Verified LinkedIn)' });
          } else if (lowerTitle.includes('director') || lowerTitle.includes('founder') || lowerTitle.includes('ceo') || lowerTitle.includes('president') || lowerTitle.includes('managing') || lowerTitle.includes('vp') || lowerTitle.includes('head')) {
            dept = 'Management';
            managementContacts.push({ name, title, department: dept, email, phone, linkedinUrl, source: 'SignalHire (Verified LinkedIn)' });
          } else if (lowerTitle.includes('hr') || lowerTitle.includes('human') || lowerTitle.includes('talent') || lowerTitle.includes('recruit') || lowerTitle.includes('people')) {
            dept = 'HR';
            hrContacts.push({ name, title, department: dept, email, phone, linkedinUrl, source: 'SignalHire (Verified LinkedIn)' });
          } else {
            salesContacts.push({ name, title, department: dept, email, phone, linkedinUrl, source: 'SignalHire (Verified LinkedIn)' });
          }
        }
      }
    } catch (err: any) {
      console.warn(`[SignalHire API] Candidate enrichment notice (${err.message}).`);
    }
  }

  return {
    salesContacts,
    managementContacts,
    hrContacts,
    rawContext
  };
}
