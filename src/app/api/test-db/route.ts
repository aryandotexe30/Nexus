import { NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const companies = await prisma.company.findMany({ take: 5 });
  return NextResponse.json({ companies });
}
