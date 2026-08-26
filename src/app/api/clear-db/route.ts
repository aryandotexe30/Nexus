import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.productKnowledge.deleteMany({});
    await prisma.company.deleteMany({});
    return NextResponse.json({ success: true, message: 'Databook completely cleared.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
