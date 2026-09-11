import { NextResponse } from 'next/server';
import { harvestCompanyProducts } from '@/lib/deepProductHarvester';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const query = body.query?.trim();

    if (!query) {
      return NextResponse.json({ error: 'Please provide a company name or URL' }, { status: 400 });
    }

    console.log(`[API /api/products/harvest] Processing harvest request for: "${query}"`);
    const result = await harvestCompanyProducts(query);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('[API /api/products/harvest] Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to harvest products' 
    }, { status: 500 });
  }
}
