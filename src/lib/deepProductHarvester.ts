import axios from 'axios';
import * as cheerio from 'cheerio';
import prisma from '@/lib/prisma';
import { generateStructuredAIResponse } from '@/lib/searchProtocol';
import { Type } from '@google/genai';

export interface ExtractedProductItem {
  name: string;
  industry?: string;
  market?: string;
  application?: string;
  specs?: Record<string, string>;
  imageUrl?: string;
  productUrl?: string;
  rawMaterials?: string[];
}

export interface HarvestResult {
  success: boolean;
  companyName: string;
  companyUrl: string;
  totalProducts: number;
  products: ExtractedProductItem[];
  marketsDiscovered: string[];
  applicationsDiscovered: string[];
  error?: string;
}

const AXIOS_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br'
};

/**
 * Universal Deep Product Harvester
 * Recursively crawls any corporate website or company name, traverses market/application trees,
 * parses structured specification tables & catalog arrays, and persists all products to PostgreSQL.
 */
export async function harvestCompanyProducts(input: string): Promise<HarvestResult> {
  const cleanInput = input.trim();
  let targetUrl = cleanInput;
  let companyName = cleanInput;

  // 1. Resolve Target Domain
  if (!cleanInput.startsWith('http://') && !cleanInput.startsWith('https://')) {
    companyName = cleanInput;
    if (cleanInput.includes('.')) {
      targetUrl = `https://${cleanInput.replace(/^www\./, '')}`;
    } else {
      // Resolve company name to domain
      const lower = cleanInput.toLowerCase();
      if (lower.includes('tesa')) targetUrl = 'https://www.tesa.com/en-in/industry';
      else if (lower.includes('vasavi')) targetUrl = 'https://vasavitapes.com';
      else if (lower.includes('havells')) targetUrl = 'https://www.havells.com';
      else if (lower.includes('polycab')) targetUrl = 'https://polycab.com';
      else if (lower.includes('3m')) targetUrl = 'https://www.3mindia.in';
      else if (lower.includes('cgapl') || lower.includes('cg adhesive')) targetUrl = 'https://cgapl.co.in';
      else {
        // Fallback domain probe
        const brand = lower.replace(/[^a-z0-9]/g, '');
        targetUrl = `https://www.${brand}.com`;
      }
    }
  } else {
    try {
      const parsedUrl = new URL(cleanInput);
      const hostParts = parsedUrl.hostname.replace('www.', '').split('.');
      companyName = hostParts[0].toUpperCase();
    } catch {
      companyName = cleanInput;
    }
  }

  console.log(`[Deep Harvester] Initiating deep product crawl for "${companyName}" -> Target Root: ${targetUrl}`);

  const discoveredProducts: Map<string, ExtractedProductItem> = new Map();
  const visitedUrls = new Set<string>();
  const urlsToVisit: { url: string; market?: string; application?: string }[] = [{ url: targetUrl }];
  const marketsDiscovered = new Set<string>();
  const applicationsDiscovered = new Set<string>();

  const baseOrigin = new URL(targetUrl).origin;

  // 2. Fetch Root Page and Discover Hierarchy
  try {
    const rootRes = await axios.get(targetUrl, { headers: AXIOS_HEADERS, timeout: 9000 });
    visitedUrls.add(targetUrl);
    const $root = cheerio.load(rootRes.data);

    // Extract products on root
    extractProductsFromCheerio($root, targetUrl, discoveredProducts, marketsDiscovered, applicationsDiscovered, 'General Industrial', 'Overview');

    // Discover Market / Industry / Sub-application links
    $root('a[href]').each((_, a) => {
      const href = $root(a).attr('href');
      const text = $root(a).text().trim().replace(/\s+/g, ' ');
      if (!href) return;

      let fullUrl = href;
      if (href.startsWith('/')) fullUrl = `${baseOrigin}${href}`;
      if (!fullUrl.startsWith(baseOrigin)) return;

      const lowerHref = fullUrl.toLowerCase();
      const lowerText = text.toLowerCase();

      // Filter for industry / market / application / product sub-pages
      const isRelevant = 
        (lowerHref.includes('/industry') || lowerHref.includes('/market') || lowerHref.includes('/application') || 
         lowerHref.includes('/product') || lowerHref.includes('/catalog') || lowerHref.includes('/solutions') ||
         lowerHref.includes('/tapes') || lowerHref.includes('/appliances') || lowerHref.includes('/automotive') ||
         lowerHref.includes('/electronics') || lowerHref.includes('/building') || lowerHref.includes('/paper-print') ||
         lowerHref.includes('/healthcare') || lowerHref.includes('/renewable') || lowerHref.includes('/craftsmen')) &&
        !lowerHref.includes('#') && !lowerHref.includes('privacy') && !lowerHref.includes('cookie') &&
        !lowerHref.includes('login') && !lowerHref.includes('contact') && !lowerHref.includes('career') &&
        !lowerHref.includes('sustainability') && !lowerHref.includes('press') && !lowerHref.includes('stories');

      if (isRelevant && !visitedUrls.has(fullUrl) && urlsToVisit.length < 35) {
        // Infer market / application from URL path or text
        let market = 'Industrial';
        let application = text || 'General Application';

        if (lowerHref.includes('appliance')) market = 'Appliances Tapes';
        else if (lowerHref.includes('automotive')) market = 'Automotive';
        else if (lowerHref.includes('electronic')) market = 'Electronics';
        else if (lowerHref.includes('building') || lowerHref.includes('construction')) market = 'Building Components';
        else if (lowerHref.includes('paper') || lowerHref.includes('print')) market = 'Paper & Print';
        else if (lowerHref.includes('health') || lowerHref.includes('medical')) market = 'Healthcare';
        else if (lowerHref.includes('energy') || lowerHref.includes('solar') || lowerHref.includes('wind')) market = 'Renewable Energy';
        else if (lowerHref.includes('craft') || lowerHref.includes('trade')) market = 'Craftsmen & Trade';

        if (text && text.length > 3 && text.length < 50) {
          application = text;
        }

        urlsToVisit.push({ url: fullUrl, market, application });
      }
    });

  } catch (err: any) {
    console.warn(`[Deep Harvester] Notice visiting root: ${err.message}`);
  }

  // 3. Concurrently Crawl Discovered Hierarchy Subpages (Up to 25 pages)
  console.log(`[Deep Harvester] Queued ${urlsToVisit.length} hierarchy sub-pages for deep extraction...`);

  const pagesToCrawl = urlsToVisit.slice(0, 25);
  for (const page of pagesToCrawl) {
    if (visitedUrls.has(page.url)) continue;
    visitedUrls.add(page.url);

    try {
      const res = await axios.get(page.url, { headers: AXIOS_HEADERS, timeout: 8000 });
      const $ = cheerio.load(res.data);
      extractProductsFromCheerio($, page.url, discoveredProducts, marketsDiscovered, applicationsDiscovered, page.market, page.application);
    } catch {
      // Continue next page
    }
  }

  console.log(`[Deep Harvester] Extraction finished. Discovered ${discoveredProducts.size} unique products.`);

  const productsList = Array.from(discoveredProducts.values());

  // 4. Persist to PostgreSQL Database (ExtractedProduct Table)
  if (productsList.length > 0) {
    try {
      for (const prod of productsList) {
        await prisma.extractedProduct.create({
          data: {
            companyName: companyName,
            companyUrl: targetUrl,
            name: prod.name,
            industry: prod.industry || 'Industrial Manufacturing',
            market: prod.market || 'Industrial',
            application: prod.application || 'General Industrial',
            specs: prod.specs ? (prod.specs as any) : undefined,
            imageUrl: prod.imageUrl || null,
            productUrl: prod.productUrl || null,
            rawMaterials: prod.rawMaterials ? (prod.rawMaterials as any) : undefined
          }
        });
      }
      console.log(`[Deep Harvester] Successfully persisted ${productsList.length} products to database for ${companyName}.`);
    } catch (dbErr: any) {
      console.warn(`[Deep Harvester] Database persistence notice: ${dbErr.message}`);
    }
  }

  return {
    success: true,
    companyName,
    companyUrl: targetUrl,
    totalProducts: productsList.length,
    products: productsList,
    marketsDiscovered: Array.from(marketsDiscovered),
    applicationsDiscovered: Array.from(applicationsDiscovered)
  };
}

/**
 * Universal Extraction Routine from loaded Cheerio DOM
 */
function extractProductsFromCheerio(
  $: cheerio.CheerioAPI,
  currentUrl: string,
  productsMap: Map<string, ExtractedProductItem>,
  marketsSet: Set<string>,
  applicationsSet: Set<string>,
  defaultMarket?: string,
  defaultApp?: string
) {
  const origin = new URL(currentUrl).origin;

  // A. Extract from Vue / Custom Element Product Tables (e.g. <product-filter-table :products="...">)
  $('product-filter-table, [data-products], [data-table-products], product-table').each((_, el) => {
    const rawAttr = $(el).attr(':products') || $(el).attr('products') || $(el).attr('data-products') || $(el).attr(':initial-products');
    if (!rawAttr) return;

    try {
      const items = JSON.parse(rawAttr);
      if (Array.isArray(items)) {
        for (const item of items) {
          const rawName = item.name || item.title || item.model || item.sortTitle;
          if (!rawName || typeof rawName !== 'string') continue;

          const cleanName = rawName.replace(/[\u00ae\u2122\u00a9]/g, '').trim();
          if (cleanName.length < 3) continue;

          // Parse specs from item properties
          const specs: Record<string, string> = {};
          if (item.properties && typeof item.properties === 'object') {
            for (const [k, v] of Object.entries(item.properties)) {
              if (v && typeof v === 'object' && (v as any).label) {
                const labelKey = formatSpecKey(k);
                specs[labelKey] = String((v as any).label).trim();
              } else if (v && typeof v === 'object' && (v as any).value !== undefined) {
                const labelKey = formatSpecKey(k);
                specs[labelKey] = String((v as any).value).trim();
              } else if (typeof v === 'string' || typeof v === 'number') {
                specs[formatSpecKey(k)] = String(v).trim();
              }
            }
          }

          // Image URL
          let imageUrl: string | undefined;
          if (item.image?.fallbackSource) {
            imageUrl = item.image.fallbackSource.startsWith('http') ? item.image.fallbackSource : `${origin}${item.image.fallbackSource}`;
          } else if (item.image?.src) {
            imageUrl = item.image.src.startsWith('http') ? item.image.src : `${origin}${item.image.src}`;
          } else if (typeof item.image === 'string' && item.image.startsWith('http')) {
            imageUrl = item.image;
          }

          // Product URL
          let productUrl: string | undefined;
          if (item.url) {
            productUrl = item.url.startsWith('http') ? item.url : `${origin}${item.url}`;
          }

          if (defaultMarket) marketsSet.add(defaultMarket);
          if (defaultApp) applicationsSet.add(defaultApp);

          if (!productsMap.has(cleanName)) {
            productsMap.set(cleanName, {
              name: cleanName,
              industry: 'Specialty Adhesive Tapes & Industrial Solutions',
              market: defaultMarket || 'Industrial',
              application: defaultApp || 'General Application',
              specs: Object.keys(specs).length > 0 ? specs : undefined,
              imageUrl,
              productUrl
            });
          }
        }
      }
    } catch {}
  });

  // B. Extract from Standard HTML Tables (<table> with <th> and <td>)
  $('table').each((_, tbl) => {
    const headers: string[] = [];
    $(tbl).find('thead th, tr:first-child th, tr:first-child td').each((_, th) => {
      headers.push($(th).text().trim().replace(/\s+/g, ' '));
    });

    if (headers.length >= 2) {
      $(tbl).find('tbody tr, tr').each((rIdx, tr) => {
        if (rIdx === 0 && $(tr).find('th').length > 0) return; // skip header row

        const cells: string[] = [];
        let rowLink: string | undefined;
        let rowImg: string | undefined;

        $(tr).find('td').each((cIdx, td) => {
          cells.push($(td).text().trim().replace(/\s+/g, ' '));
          const href = $(td).find('a').attr('href');
          if (href && !rowLink) rowLink = href.startsWith('http') ? href : `${origin}${href}`;
          const img = $(td).find('img').attr('src');
          if (img && !rowImg) rowImg = img.startsWith('http') ? img : `${origin}${img}`;
        });

        if (cells.length >= 2 && cells[0].length > 2) {
          const rawName = cells[0].replace(/[\u00ae\u2122\u00a9]/g, '').trim();
          if (rawName.length > 2 && !rawName.toLowerCase().includes('product') && !rawName.toLowerCase().includes('model')) {
            const specs: Record<string, string> = {};
            for (let i = 1; i < cells.length; i++) {
              const header = headers[i] || `Spec ${i}`;
              if (cells[i] && cells[i].length > 0 && cells[i] !== '-') {
                specs[header] = cells[i];
              }
            }

            if (defaultMarket) marketsSet.add(defaultMarket);
            if (defaultApp) applicationsSet.add(defaultApp);

            if (!productsMap.has(rawName)) {
              productsMap.set(rawName, {
                name: rawName,
                industry: 'Industrial Manufacturing',
                market: defaultMarket || 'Industrial',
                application: defaultApp || 'General Application',
                specs: Object.keys(specs).length > 0 ? specs : undefined,
                imageUrl: rowImg,
                productUrl: rowLink
              });
            }
          }
        }
      });
    }
  });

  // C. Extract from Product Listing Cards (.product-card, .product-item, .item)
  $('[class*="product-card"], [class*="product-item"], [class*="product-box"], .woocommerce-loop-product__title, .product-title').each((_, el) => {
    const title = $(el).find('h2, h3, h4, .title, a').first().text().trim() || $(el).text().trim();
    const cleanTitle = title.replace(/\s+/g, ' ').replace(/[\u00ae\u2122\u00a9]/g, '').trim();
    const href = $(el).find('a').attr('href') || $(el).attr('href');
    const img = $(el).find('img').attr('src');

    if (cleanTitle.length > 3 && cleanTitle.length < 80 && !cleanTitle.toLowerCase().includes('privacy') && !cleanTitle.toLowerCase().includes('contact')) {
      if (!productsMap.has(cleanTitle)) {
        if (defaultMarket) marketsSet.add(defaultMarket);
        if (defaultApp) applicationsSet.add(defaultApp);

        productsMap.set(cleanTitle, {
          name: cleanTitle,
          industry: 'Industrial Manufacturing',
          market: defaultMarket || 'Industrial',
          application: defaultApp || 'General Application',
          imageUrl: img ? (img.startsWith('http') ? img : `${origin}${img}`) : undefined,
          productUrl: href ? (href.startsWith('http') ? href : `${origin}${href}`) : undefined
        });
      }
    }
  });
}

function formatSpecKey(key: string): string {
  const map: Record<string, string> = {
    backingmaterial: 'Backing material',
    typeofadhesive: 'Adhesive type',
    totalthickness: 'Total thickness',
    adhesiontosteel: 'Adhesion to Steel',
    elongationatbreak: 'Elongation at break',
    tensilestrength: 'Tensile strength',
    temperatureresistance: 'Temperature resistance',
    breakdownvoltage: 'Dielectric Breakdown Voltage',
    dielectricstrength: 'Dielectric strength',
    color: 'Color',
    width: 'Width',
    length: 'Length'
  };

  return map[key.toLowerCase()] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
}
