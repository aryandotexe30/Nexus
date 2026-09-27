import { NextResponse } from "next/server";
import { findTarasAlternate, TARAS_ALTERNATE_DATABASE, TarasAlternateMatch } from "@/lib/alternateMatcherEngine";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

export async function POST(req: Request) {
  try {
    const { query, tdsText, industry } = await req.json();

    if (!query && !tdsText) {
      return NextResponse.json({ 
        success: true, 
        matches: TARAS_ALTERNATE_DATABASE.slice(0, 4) 
      });
    }

    const searchTerm = (query || tdsText || "").trim();

    // 1. First check high-confidence pre-calibrated database
    const localMatches = findTarasAlternate(searchTerm);
    if (localMatches.length > 0) {
      return NextResponse.json({
        success: true,
        source: "deterministic_spec_engine",
        matches: localMatches,
        topMatch: localMatches[0]
      });
    }

    // 2. If not found in deterministic table, run Gemini AI Parametric Reasoning Engine
    try {
      const prompt = `You are the Lead Materials Science & Industrial Sourcing AI for TarasAI (TarasAI.in).
TarasAI is a B2B private-label managed marketplace connecting enterprise buyers (OEMs like Tata, Mahindra, Havells) with verified domestic Indian manufacturing plants.
The user is looking for a domestic private-label TarasAI replacement for the following foreign/competitor material, part number, or technical constraint:
"${searchTerm}" ${industry ? `in the ${industry} industry` : ""}

Conduct deep parametric material science analysis and output a single JSON object (no markdown, no backticks) with the following exact keys:
{
  "tarasSku": "TARAS-<FAMILY>-<NUMBER>",
  "tarasName": "TarasAI <Substrate & Chemistry Name>",
  "category": "Industrial Category",
  "competitorBrand": "Recognized Brand (or Generic)",
  "competitorPartNumber": "${searchTerm}",
  "compatibilityScore": 98.4,
  "costSavingsPercent": 32,
  "substrate": "Substrate & Core formulation",
  "adhesiveSystem": "Adhesive chemistry",
  "totalThickness": "e.g. 0.05 mm or 1.0 mm",
  "operatingTemp": "Temperature range e.g. -40C to 200C",
  "peelAdhesion": "Peel adhesion in N/25mm",
  "tensileStrength": "Tensile strength",
  "dielectricBreakdown": "Dielectric breakdown in kV/mm",
  "flammabilityRating": "UL 94 rating",
  "certifications": ["RoHS 3", "REACH SVHC", "ISO 9001:2015"],
  "standardSizes": ["12mm x 33m", "24mm x 33m", "Custom Die-Cut"],
  "moq": "MOQ requirement",
  "estimatedTarasPrice": "Price in INR per roll / unit",
  "estimatedCompetitorPrice": "Estimated competitor price in INR",
  "domesticPlantDispatchTime": "24-48 Hours from Domestic Plant",
  "technicalSummary": "A 2-sentence technical rationale explaining why this TarasAI formulation replaces the requested material with equal or superior properties."
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const responseText = response.text || "";
      const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsedMatch: TarasAlternateMatch = JSON.parse(cleaned);

      return NextResponse.json({
        success: true,
        source: "gemini_parametric_reasoning",
        matches: [parsedMatch],
        topMatch: parsedMatch
      });
    } catch (aiErr) {
      console.warn("AI fallback matching error, returning closest catalog items:", aiErr);
      return NextResponse.json({
        success: true,
        source: "fallback_catalog",
        matches: TARAS_ALTERNATE_DATABASE.slice(0, 2),
        topMatch: TARAS_ALTERNATE_DATABASE[0]
      });
    }

  } catch (error: any) {
    console.error("Error in match-alternate API:", error);
    return NextResponse.json({ error: error.message || "Failed to match alternate" }, { status: 500 });
  }
}
