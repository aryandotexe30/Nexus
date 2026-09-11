import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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

    const where: any = {};
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
      [products, total] = await Promise.all([
        prisma.extractedProduct.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset
        }),
        prisma.extractedProduct.count({ where })
      ]);
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
