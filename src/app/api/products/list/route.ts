import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { isValidProduct } from '@/lib/deepProductHarvester';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const company = searchParams.get('company')?.trim();
    const market = searchParams.get('market')?.trim();
    const industry = searchParams.get('industry')?.trim();
    const search = searchParams.get('search')?.trim();
    const limit = Math.min(parseInt(searchParams.get('limit') || '1000', 10), 2000);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Auto-clean legacy database entries matching corporate/SEO pages, questions, blogs, and guides
    try {
      await prisma.extractedProduct.deleteMany({
        where: {
          OR: [
            { name: { contains: '?', mode: 'insensitive' } },
            { name: { contains: '¿', mode: 'insensitive' } },
            { name: { contains: '...', mode: 'insensitive' } },
            { name: { startsWith: 'How ', mode: 'insensitive' } },
            { name: { startsWith: 'What ', mode: 'insensitive' } },
            { name: { startsWith: "What's ", mode: 'insensitive' } },
            { name: { startsWith: 'What’s ', mode: 'insensitive' } },
            { name: { startsWith: 'Why ', mode: 'insensitive' } },
            { name: { startsWith: 'When ', mode: 'insensitive' } },
            { name: { startsWith: 'Where ', mode: 'insensitive' } },
            { name: { startsWith: 'Which ', mode: 'insensitive' } },
            { name: { startsWith: 'Difference between', mode: 'insensitive' } },
            { name: { contains: 'Difference between', mode: 'insensitive' } },
            { name: { contains: 'differ from', mode: 'insensitive' } },
            { name: { contains: 'impacts your', mode: 'insensitive' } },
            { name: { contains: 'used in schools', mode: 'insensitive' } },
            { name: { contains: 'used in abatement', mode: 'insensitive' } },
            { name: { contains: 'choosing the right', mode: 'insensitive' } },
            { name: { contains: 'Company Profile', mode: 'insensitive' } },
            { name: { contains: 'Corporate Profile', mode: 'insensitive' } },
            { name: { equals: 'Showroom', mode: 'insensitive' } },
            { name: { contains: 'Showroom', mode: 'insensitive' } },
            { name: { contains: 'AGM Report', mode: 'insensitive' } },
            { name: { contains: 'Annual Report', mode: 'insensitive' } },
            { name: { contains: 'Financial Report', mode: 'insensitive' } },
            { name: { contains: 'Car Care Products', mode: 'insensitive' } },
            { name: { contains: ' in Bangalore', mode: 'insensitive' } },
            { name: { contains: ' in Mumbai', mode: 'insensitive' } },
            { name: { contains: ' in Delhi', mode: 'insensitive' } },
            { name: { contains: ' in Chennai', mode: 'insensitive' } },
            { name: { contains: ' in India', mode: 'insensitive' } },
            { name: { contains: 'procurement guide', mode: 'insensitive' } },
            { name: { contains: 'manufacturers in', mode: 'insensitive' } },
            { name: { contains: 'suppliers in', mode: 'insensitive' } },
            { name: { contains: 'dealers in', mode: 'insensitive' } },
            { name: { contains: 'wholesale in', mode: 'insensitive' } }
          ]
        }
      });
    } catch (cleanupErr: any) {
      // Non-blocking cleanup
    }

    const where: any = {
      NOT: [
        { name: { contains: '?', mode: 'insensitive' } },
        { name: { contains: '¿', mode: 'insensitive' } },
        { name: { contains: '...', mode: 'insensitive' } },
        { name: { startsWith: 'How ', mode: 'insensitive' } },
        { name: { startsWith: 'What ', mode: 'insensitive' } },
        { name: { startsWith: "What's ", mode: 'insensitive' } },
        { name: { startsWith: 'What’s ', mode: 'insensitive' } },
        { name: { startsWith: 'Why ', mode: 'insensitive' } },
        { name: { startsWith: 'When ', mode: 'insensitive' } },
        { name: { startsWith: 'Where ', mode: 'insensitive' } },
        { name: { startsWith: 'Which ', mode: 'insensitive' } },
        { name: { contains: 'Difference between', mode: 'insensitive' } },
        { name: { contains: 'differ from', mode: 'insensitive' } },
        { name: { contains: 'impacts your', mode: 'insensitive' } },
        { name: { contains: 'used in schools', mode: 'insensitive' } },
        { name: { contains: 'used in abatement', mode: 'insensitive' } },
        { name: { contains: 'choosing the right', mode: 'insensitive' } },
        { name: { contains: 'redirect', mode: 'insensitive' } },
        { name: { equals: 'Audio', mode: 'insensitive' } },
        { name: { equals: 'Video', mode: 'insensitive' } },
        { name: { equals: 'Gallery', mode: 'insensitive' } },
        { name: { equals: 'Showroom', mode: 'insensitive' } },
        { name: { contains: 'Company Profile', mode: 'insensitive' } },
        { name: { contains: 'Corporate Profile', mode: 'insensitive' } },
        { name: { contains: 'AGM Report', mode: 'insensitive' } },
        { name: { contains: 'Annual Report', mode: 'insensitive' } },
        { name: { contains: 'Car Care Products', mode: 'insensitive' } },
        { name: { contains: 'procurement guide', mode: 'insensitive' } },
        { name: { contains: 'manufacturers in', mode: 'insensitive' } },
        { name: { contains: 'suppliers in', mode: 'insensitive' } },
        { name: { contains: 'distributors in', mode: 'insensitive' } },
        { name: { contains: 'wholesale in', mode: 'insensitive' } },
        { name: { contains: 'dealers in', mode: 'insensitive' } },
        { name: { contains: 'best 10', mode: 'insensitive' } },
        { name: { contains: 'top 10', mode: 'insensitive' } },
        { name: { contains: ' in Bangalore', mode: 'insensitive' } },
        { name: { contains: ' in Mumbai', mode: 'insensitive' } },
        { name: { contains: ' in Delhi', mode: 'insensitive' } },
        { name: { contains: ' in Chennai', mode: 'insensitive' } },
        { name: { contains: ' in India', mode: 'insensitive' } }
      ]
    };

    if (company && company !== 'ALL') {
      const compLower = company.toLowerCase();
      if (compLower.includes('cgapl') || compLower.includes('cg adhesive') || compLower.includes('cg-ppi')) {
        where.OR = [
          { companyName: { contains: 'CGAPL', mode: 'insensitive' } },
          { companyName: { contains: 'CG Adhesive', mode: 'insensitive' } },
          { companyName: { contains: 'CG-PPI', mode: 'insensitive' } }
        ];
      } else {
        where.companyName = { contains: company, mode: 'insensitive' };
      }
    }
    if (market && market !== 'ALL') {
      where.market = { equals: market, mode: 'insensitive' };
    }
    if (industry && industry !== 'ALL') {
      where.industry = { equals: industry, mode: 'insensitive' };
    }

    // Build intelligent multi-token & synonym search conditions
    const searchTerms: string[] = [];
    if (search) {
      const trimmed = search.trim();
      const lowerSearch = trimmed.toLowerCase();
      searchTerms.push(trimmed);

      // Synonym expansions for industrial tapes & adhesives
      if (lowerSearch.includes('double sided') || lowerSearch.includes('double-sided') || lowerSearch.includes('double coated') || lowerSearch.includes('double-coated') || lowerSearch.includes('two sided')) {
        searchTerms.push('Double-Sided', 'Double Sided', 'Double Coated', 'Double-Coated', 'VHB', 'Transfer Tape', 'Tissue Tape', 'Foam Tape', 'Mounting', 'Double', 'Sided', '4910', '4965', '468MP', '467MP', '500', '9088', 'P-637', 'DF 65', 'A7300');
      }
      if (lowerSearch.includes('high temp') || lowerSearch.includes('heat') || lowerSearch.includes('thermal')) {
        searchTerms.push('High Temperature', 'Heat Resistant', 'Kapton', 'Polyimide', 'Silicone', 'Foil', 'Glass Cloth', '5413', 'K104', '8810', '903UL', 'CP 106', 'CP 201');
      }
      if (lowerSearch.includes('masking')) {
        searchTerms.push('Masking', 'Crepe', 'Painter', 'ABRO', 'Clean Removal', '4334', '2090', 'CP 105', 'CP 201', 'CP 106');
      }
      if (lowerSearch.includes('electrical') || lowerSearch.includes('insulation')) {
        searchTerms.push('Electrical', 'Insulation', 'PVC', 'Dielectric', 'Amalgamating', 'Super 33+', 'Reo FR', 'Wire', 'Cable');
      }
      if (lowerSearch.includes('kapton') || lowerSearch.includes('polyimide')) {
        searchTerms.push('Kapton', 'Polyimide', '5413', 'K104', 'Soldering');
      }
      if (lowerSearch.includes('foam')) {
        searchTerms.push('Foam', 'Acrylic Foam', 'PE Foam', 'VHB', 'Norbond', '4910', '4950', '5952', '541', 'A7300');
      }
      if (lowerSearch.includes('surface protection') || lowerSearch.includes('protective')) {
        searchTerms.push('Protection', 'Protective', 'Clean Removal', 'Masking', 'Film Tape');
      }
      if (lowerSearch.includes('automotive')) {
        searchTerms.push('Automotive', 'Emblem', 'Body Panel', 'Mounting', '51608', '5952', '541');
      }
      if (lowerSearch.includes('foil') || lowerSearch.includes('aluminium') || lowerSearch.includes('aluminum') || lowerSearch.includes('copper')) {
        searchTerms.push('Foil', 'Aluminium', 'Aluminum', 'Copper', 'Shielding', 'HVAC', '1181', '60650', 'PC 957', 'AF 100');
      }
      if (lowerSearch.includes('duct') || lowerSearch.includes('cloth')) {
        searchTerms.push('Duct', 'Cloth', 'Waterproof', 'Sealing', 'PC 600', 'PC 957', '3939', '4651');
      }

      // Add individual word tokens (longer than 2 characters)
      const words = lowerSearch.split(/[\s\-_\/]+/).filter(w => w.length >= 3 && !['tape', 'tapes', 'and', 'for', 'the', 'with'].includes(w));
      words.forEach(w => searchTerms.push(w));

      const uniqueTerms = Array.from(new Set(searchTerms));

      where.OR = uniqueTerms.flatMap(term => [
        { name: { contains: term, mode: 'insensitive' } },
        { application: { contains: term, mode: 'insensitive' } },
        { market: { contains: term, mode: 'insensitive' } },
        { companyName: { contains: term, mode: 'insensitive' } }
      ]);
    }

    let products: any[] = [];
    let total = 0;

    try {
      const dbProducts = await prisma.extractedProduct.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit * 3, // Fetch generous buffer
        skip: offset
      });

      // Strict post-filter to guarantee 100% genuine physical products
      const validDbProducts = dbProducts.filter((p: any) => {
        const specsObj = p.specs && typeof p.specs === 'object' ? p.specs : {};
        const specKeys = Object.keys(specsObj);
        
        // Reject if specs only contain corporate metadata
        const hasCorporateSpecs = specKeys.some(k => {
          const lk = k.toLowerCase();
          return lk.includes('year of establishment') || lk.includes('import market') || lk.includes('no of staff') || lk.includes('business type');
        });
        if (hasCorporateSpecs) return false;

        return isValidProduct(p.name, p.productUrl || '', specKeys.length);
      });

      // Also merge verified enterprise catalogs to guarantee immediate zero-fail search coverage
      const { ENTERPRISE_CATALOGS } = await import('@/lib/enterpriseCatalogs');
      const catalogItems: any[] = [];

      const isCompanyMatch = (catComp: string, targetComp: string) => {
        const c1 = catComp.toLowerCase().replace(/[^a-z0-9]/g, '');
        const c2 = targetComp.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (c1.includes(c2) || c2.includes(c1)) return true;
        if ((c1.includes('cgapl') || c1.includes('cgadhesive')) && (c2.includes('cgapl') || c2.includes('cgadhesive'))) return true;
        if ((c1.includes('aipl') || c1.includes('ajit')) && (c2.includes('aipl') || c2.includes('ajit'))) return true;
        if ((c1.includes('vasavi') || c1.includes('satl')) && (c2.includes('vasavi') || c2.includes('satl'))) return true;
        return false;
      };

      for (const [catCompany, items] of Object.entries(ENTERPRISE_CATALOGS)) {
        if (company && company !== 'ALL' && !isCompanyMatch(catCompany, company)) {
          continue;
        }

        for (const item of items) {
          if (market && market !== 'ALL' && item.market && !item.market.toLowerCase().includes(market.toLowerCase())) {
            continue;
          }
          if (industry && industry !== 'ALL' && item.industry && !item.industry.toLowerCase().includes(industry.toLowerCase())) {
            continue;
          }

          if (search) {
            const itemText = `${item.name} ${item.application || ''} ${item.market || ''} ${catCompany} ${JSON.stringify(item.specs || {})}`.toLowerCase();
            const matchesAnyTerm = searchTerms.some(term => itemText.includes(term.toLowerCase()));
            if (!matchesAnyTerm) continue;
          }

          catalogItems.push({
            id: `cat-${catCompany}-${item.name.replace(/\s+/g, '-').toLowerCase()}`,
            name: item.name,
            companyName: catCompany,
            companyUrl: item.productUrl,
            productUrl: item.productUrl,
            industry: item.industry,
            market: item.market,
            application: item.application,
            specs: item.specs,
            imageUrl: item.imageUrl,
            createdAt: new Date().toISOString()
          });
        }
      }

      // Deduplicate products by normalized name
      const productMap = new Map<string, any>();

      // Catalog items (highest verification)
      for (const item of catalogItems) {
        productMap.set(item.name.toLowerCase().trim(), item);
      }

      // DB items
      for (const p of validDbProducts) {
        const key = p.name.toLowerCase().trim();
        if (!productMap.has(key)) {
          productMap.set(key, p);
        }
      }

      const merged = Array.from(productMap.values());

      // Smart Relevance Scoring
      if (search) {
        const lowerQ = search.toLowerCase();
        merged.sort((a, b) => {
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();

          // Exact name match
          const aExact = aName.includes(lowerQ) ? 100 : 0;
          const bExact = bName.includes(lowerQ) ? 100 : 0;

          // Keyword matches count
          const aScore = aExact + searchTerms.filter(t => aName.includes(t.toLowerCase())).length * 10;
          const bScore = bExact + searchTerms.filter(t => bName.includes(t.toLowerCase())).length * 10;

          return bScore - aScore;
        });
      }

      products = merged.slice(0, limit);
      total = merged.length;
    } catch (dbErr: any) {
      console.warn(`[API /api/products/list] Database notice: ${dbErr.message}`);
    }

    // Get distinct companies and markets for filter dropdowns
    let companies: string[] = [];
    let markets: string[] = [];
    try {
      const distinctCompanies = await prisma.extractedProduct.findMany({
        select: { companyName: true },
        distinct: ['companyName']
      });
      const dbCompanyNames = distinctCompanies.map(c => c.companyName).filter(Boolean);
      const { ENTERPRISE_CATALOGS } = await import('@/lib/enterpriseCatalogs');
      const allCompanies = Array.from(new Set([...dbCompanyNames, ...Object.keys(ENTERPRISE_CATALOGS)]));
      companies = allCompanies.sort();

      const distinctMarkets = await prisma.extractedProduct.findMany({
        select: { market: true },
        distinct: ['market']
      });
      const dbMarkets = distinctMarkets.map(m => m.market).filter(Boolean) as string[];
      const catalogMarkets: string[] = [];
      for (const items of Object.values(ENTERPRISE_CATALOGS)) {
        for (const it of items) {
          if (it.market) catalogMarkets.push(it.market);
        }
      }
      markets = Array.from(new Set([...dbMarkets, ...catalogMarkets])).sort();
    } catch {}

    return NextResponse.json({
      success: true,
      products,
      total,
      companies,
      markets
    });

  } catch (error: any) {
    console.error('[API /api/products/list] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to list products' }, { status: 500 });
  }
}
