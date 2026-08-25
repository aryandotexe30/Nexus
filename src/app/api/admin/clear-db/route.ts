import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.company.deleteMany({});
    await prisma.productKnowledge.deleteMany({});
    await prisma.networkCache.deleteMany({});
    return NextResponse.json({ success: true, message: "Database tables cleared." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
