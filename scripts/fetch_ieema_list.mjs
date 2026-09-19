import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

function decodeCloudflareEmail(cfemail) {
  if (!cfemail) return '';
  try {
    const k = parseInt(cfemail.substr(0, 2), 16);
    let email = '';
    for (let i = 2; i < cfemail.length; i += 2) {
      email += String.fromCharCode(parseInt(cfemail.substr(i, 2), 16) ^ k);
    }
    return email.trim();
  } catch (e) {
    return '';
  }
}

async function fetchPageSlugs(pageNum) {
  const url = `https://ieema.org/member-directory?page=${pageNum}&pagination=500`;
  const res = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    timeout: 30000
  });

  const $ = cheerio.load(res.data);
  const items = [];
  $('a.member-card').each((_, el) => {
    const href = $(el).attr('href');
    const name = $(el).find('h5').text().trim();
    const loc = $(el).find('.member-loc').text().trim();
    const region = $(el).find('.member-region').text().trim();
    if (href && name) {
      items.push({ href, name, loc, region });
    }
  });
  return items;
}

async function main() {
  console.log('Fetching all member URLs from IEEMA Directory...');
  const allMembers = [];
  for (let page = 1; page <= 4; page++) {
    try {
      console.log(`Fetching listing page ${page}...`);
      const items = await fetchPageSlugs(page);
      console.log(`Page ${page} yielded ${items.length} members.`);
      if (items.length === 0) break;
      allMembers.push(...items);
    } catch (err) {
      console.error(`Error on page ${page}:`, err.message);
    }
  }

  // Deduplicate by href
  const uniqueMap = new Map();
  for (const m of allMembers) {
    uniqueMap.set(m.href, m);
  }
  const uniqueMembers = Array.from(uniqueMap.values());
  console.log(`Total unique IEEMA members discovered: ${uniqueMembers.length}`);

  fs.writeFileSync('scripts/ieema_members_list.json', JSON.stringify(uniqueMembers, null, 2));
  console.log('Saved members list to scripts/ieema_members_list.json');
}

main();
