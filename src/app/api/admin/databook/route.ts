import { NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
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
