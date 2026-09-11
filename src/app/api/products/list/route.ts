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

    // Auto-clean legacy database entries matching corporate/SEO pages
    try {
      await prisma.extractedProduct.deleteMany({
        where: {
          OR: [
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
      where.companyName = { contains: company, mode: 'insensitive' };
    }
    if (market && market !== 'ALL') {
      where.market = { equals: market, mode: 'insensitive' };
    }
    if (industry && industry !== 'ALL') {
      where.industry = { equals: industry, mode: 'insensitive' };
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { application: { contains: search, mode: 'insensitive' } },
        { market: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } }
      ];
    }

    let products: any[] = [];
    let total = 0;

    try {
      const dbProducts = await prisma.extractedProduct.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit * 2, // Fetch buffer to account for post-filtering
        skip: offset
      });

      // Strict post-filter to guarantee 100% genuine physical products
      products = dbProducts.filter((p: any) => {
        const specsObj = p.specs && typeof p.specs === 'object' ? p.specs : {};
        const specKeys = Object.keys(specsObj);
        
        // Reject if specs only contain corporate metadata
        const hasCorporateSpecs = specKeys.some(k => {
          const lk = k.toLowerCase();
          return lk.includes('year of establishment') || lk.includes('import market') || lk.includes('no of staff') || lk.includes('business type');
        });
        if (hasCorporateSpecs) return false;

        return isValidProduct(p.name, p.productUrl || '', specKeys.length);
      }).slice(0, limit);

      total = products.length;
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
      companies = Array.from(new Set(distinctCompanies.map(c => c.companyName).filter(Boolean)));

      const distinctMarkets = await prisma.extractedProduct.findMany({
        select: { market: true },
        distinct: ['market']
      });
      markets = Array.from(new Set(distinctMarkets.map(m => m.market).filter(Boolean) as string[]));
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
