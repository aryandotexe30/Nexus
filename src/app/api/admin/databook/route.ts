import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    try {
      await requireAdmin();
    } catch (e) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companies = await prisma.company.findMany({
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({ success: true, companies });
  } catch (error: any) {
    console.error("Failed to fetch databook:", error);
    return NextResponse.json({ error: 'Failed to fetch databook' }, { status: 500 });
  }
}
