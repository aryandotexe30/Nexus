import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";



export async function GET() {
  const companies = await prisma.company.findMany({ take: 5 });
  return NextResponse.json({ companies });
}
