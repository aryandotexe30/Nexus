import { NextResponse } from "next/server";
import { generateTarasTDS } from "@/lib/tdsGenerator";
import { findTarasAlternate } from "@/lib/alternateMatcherEngine";

export async function POST(req: Request) {
  try {
    const { sku, query } = await req.json();
    const identifier = sku || query || "TARAS-VAF-1000";

    const tdsData = generateTarasTDS(identifier);
    const alternateInfo = findTarasAlternate(identifier)[0] || null;

    return NextResponse.json({
      success: true,
      tds: tdsData,
      alternateInfo
    });
  } catch (error: any) {
    console.error("Error in generate-tds API:", error);
    return NextResponse.json({ error: error.message || "Failed to generate TDS" }, { status: 500 });
  }
}
