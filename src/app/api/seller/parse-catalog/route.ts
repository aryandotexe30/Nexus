import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import * as XLSX from 'xlsx';

const ai = new GoogleGenAI({});

export function computeMissingFields(product: any): string[] {
  const missing: string[] = [];
  if (!product.name || product.name.trim().length === 0) missing.push("Product Title / Model");
  if (!product.backing || product.backing === 'Specialty Substrate' || product.backing === 'Unknown') missing.push("Backing Substrate");
  if (!product.adhesionType || product.adhesionType === 'Standard Polymer' || product.adhesionType === 'Polymer System') missing.push("Adhesive Chemistry");
  if (!product.thickness || product.thickness === 'Standard' || product.thickness === 'N/A') missing.push("Thickness / Caliper");
  if (!product.tempRange || product.tempRange === 'Industrial Grade' || product.tempRange === 'N/A') missing.push("Temperature Rating");
  if (!product.application || product.application.trim().length === 0) missing.push("Application Scope");
  if (!product.price || product.price.trim().length === 0 || product.price === 'Inquire on Request') missing.push("Indicative Price / MOQ");
  return missing;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const companyName = (formData.get('companyName') as string)?.trim() || 'Manufacturer';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());

    let extractedProducts: any[] = [];

    // 1. Spreadsheet (.xlsx, .xls, .csv)
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) {
      try {
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (rawRows.length > 0) {
          try {
            const prompt = `
You are an expert industrial materials engineer.
A manufacturer/supplier named "${companyName}" uploaded a spreadsheet product catalog.
Convert and normalize the following spreadsheet rows into an array of standardized products matching our Master Products database schema.
Extract all relevant technical parameters (thickness, backing, adhesive chemistry, temperature endurance, dielectric, peel adhesion, applications, price).

RAW SPREADSHEET ROWS:
${JSON.stringify(rawRows.slice(0, 100), null, 2)}

Return strictly a valid JSON array of objects with this schema:
[
  {
    "name": "Full Product Model & Title (e.g. 50µm Polyimide Masking Film or 6 W/m-K Silicone Gap Pad)",
    "category": "Adhesive Tapes & Transfer Films" | "Liquid Adhesives & Structural Sealants" | "Foams, Gaskets & Cushioning" | "Thermal Interface Materials (TIM)" | "Electrical & High-Dielectric Insulation" | "Optical, Display & Barrier Films" | "EMI / RFI Shielding & Conductive Foils" | "Protective Films & Surface Protection" | "Specialty Industrial Packaging & Strapping" | "Custom Precision Die-Cut Components" | "Abrasives, Polishing & Surface Finishing" | "Industrial Fasteners & Reclosables" | "Specialty Polymers, Resins & Raw Compounds" | "Other Industrial Materials & Consumables",
    "productType": "Tape" | "Adhesive" | "Film" | "Foam" | "Die-Cut" | "Sealant" | "Thermal Pad" | "Liquid" | "Abrasive" | "Fastener",
    "sideType": "Single-Sided" | "Double-Sided" | "Transfer" | "N/A (Liquid / Non-Adhesive)",
    "backing": "Carrier/Substrate/Backing Material (e.g. Polyimide Film, PVC, Acrylic Foam, Aluminum Foil, Fiberglass, PET, EPDM)",
    "adhesionType": "Adhesive / Chemical System (e.g. Cross-Linked Silicone, Pure Acrylic, Epoxy, Polyurethane, Synthetic Rubber)",
    "thickness": "Total thickness / caliper / gauge (e.g. 0.05 mm, 1.1 mm, 0.5 mm, 125 µm)",
    "tempRange": "Temperature resistance rating (e.g. 260°C, 180°C, 150°C, -40°C to 120°C)",
    "application": "Primary industrial engineering applications",
    "price": "Wholesale benchmark unit price or MOQ (e.g. ₹350 / roll, $4.50)",
    "imageUrl": "",
    "specs": {
      "Backing material": "...",
      "Adhesive type": "...",
      "Total thickness": "...",
      "Temperature resistance": "..."
    }
  }
]
`;
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
            });

            const text = response.text || '';
            const match = text.match(/\[[\s\S]*\]/);
            if (match) {
              extractedProducts = JSON.parse(match[0]);
            }
          } catch (aiErr) {
            console.warn("Gemini spreadsheet parse error, falling back to heuristic parsing:", aiErr);
          }

          // Fallback heuristic if AI parsing didn't return items
          if (extractedProducts.length === 0) {
            extractedProducts = rawRows.map((row: any, i: number) => {
              const keys = Object.keys(row);
              const getVal = (possibleNames: string[]) => {
                for (const p of possibleNames) {
                  const found = keys.find(k => k.toLowerCase().includes(p.toLowerCase()));
                  if (found && row[found]) return String(row[found]).trim();
                }
                return '';
              };

              const name = getVal(['name', 'product', 'item', 'model', 'title', 'sku', 'code']) || `Material Specification #${i + 1}`;
              const backing = getVal(['backing', 'carrier', 'substrate', 'material', 'base']) || 'Specialty Substrate';
              const adhesion = getVal(['adhesive', 'glue', 'adhesion', 'polymer', 'resin', 'chemistry']) || 'Standard Polymer';
              const thickness = getVal(['thickness', 'caliper', 'gauge', 'micron', 'mil', 'size']) || 'Standard';
              const temp = getVal(['temp', 'temperature', 'heat', 'thermal']) || 'Industrial Grade';
              const side = getVal(['side', 'coated', 'coating', 'format']) || (name.toLowerCase().includes('double') ? 'Double-Sided' : 'Single-Sided');
              const app = getVal(['app', 'application', 'usage', 'industry', 'use']) || 'Industrial manufacturing & engineering';
              const price = getVal(['price', 'rate', 'cost', 'inr', 'usd', 'moq']) || '';

              return {
                name,
                category: 'Adhesive Tapes & Transfer Films',
                productType: 'Tape',
                sideType: side.toLowerCase().includes('double') ? 'Double-Sided' : (side.toLowerCase().includes('transfer') ? 'Transfer' : 'Single-Sided'),
                backing,
                adhesionType: adhesion,
                thickness,
                tempRange: temp,
                application: app,
                price,
                imageUrl: '',
                specs: {
                  'Backing material': backing,
                  'Adhesive type': adhesion,
                  'Total thickness': thickness,
                  'Temperature resistance': temp,
                }
              };
            });
          }
        }
      } catch (err) {
        console.error('Spreadsheet parse error:', err);
      }
    } 
    // 2. PDF, Multi-Page Brochure, Images (PNG/JPG/WEBP), or Text Documents
    else {
      try {
        let mimeType = file.type || 'application/pdf';
        if (fileName.endsWith('.pdf')) mimeType = 'application/pdf';
        else if (fileName.endsWith('.png')) mimeType = 'image/png';
        else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) mimeType = 'image/jpeg';
        else if (fileName.endsWith('.webp')) mimeType = 'image/webp';
        else if (fileName.endsWith('.txt')) mimeType = 'text/plain';

        const prompt = `
You are an expert industrial materials scientist and technical datasheet procurement specialist.
A manufacturer/supplier named "${companyName}" uploaded their technical catalog/brochure/datasheet.
Scan the entire document and extract every distinct product, material, technical tape, adhesive, thermal interface material, dielectric insulation, gasket foam, foil shielding, or die-cut item.

Extract all technical specifications thoroughly from tables, parameter blocks, and descriptions.

Return strictly a valid JSON array of objects matching this exact schema:
[
  {
    "name": "Full Product Name & Model Code (e.g. TARAS-PI-5413 50µm Polyimide Tape or Ultra-Therm 6.0 W/m-K Gap Pad)",
    "category": "Adhesive Tapes & Transfer Films" | "Liquid Adhesives & Structural Sealants" | "Foams, Gaskets & Cushioning" | "Thermal Interface Materials (TIM)" | "Electrical & High-Dielectric Insulation" | "Optical, Display & Barrier Films" | "EMI / RFI Shielding & Conductive Foils" | "Protective Films & Surface Protection" | "Specialty Industrial Packaging & Strapping" | "Custom Precision Die-Cut Components" | "Abrasives, Polishing & Surface Finishing" | "Industrial Fasteners & Reclosables" | "Specialty Polymers, Resins & Raw Compounds" | "Other Industrial Materials & Consumables",
    "productType": "Tape" | "Adhesive" | "Film" | "Foam" | "Die-Cut" | "Sealant" | "Thermal Pad" | "Liquid" | "Abrasive" | "Fastener",
    "sideType": "Single-Sided" | "Double-Sided" | "Transfer" | "N/A (Liquid / Non-Adhesive)",
    "backing": "Backing / Carrier / Substrate (e.g. Polyimide Film, PVC, Acrylic Foam, Aluminum Foil, Fiberglass, Glass Cloth, PET, EPDM, Silicone)",
    "adhesionType": "Adhesive / Polymer Chemistry (e.g. Cross-Linked Silicone, Pure Solvent Acrylic, Epoxy, Polyurethane, Natural Rubber)",
    "thickness": "Total thickness / caliper / gauge (e.g. 0.05 mm, 0.07 mm, 1.1 mm, 0.5 mm, 125 µm)",
    "tempRange": "Temperature rating (e.g. 260°C, 180°C, 150°C, -40°C to 120°C)",
    "application": "Key industrial engineering use cases and applications",
    "price": "Wholesale benchmark unit price or MOQ if mentioned (e.g. ₹320.00 / roll, $4.20)",
    "imageUrl": "",
    "specs": {
      "Backing material": "...",
      "Adhesive type": "...",
      "Total thickness": "...",
      "Temperature resistance": "...",
      "Tensile Strength": "...",
      "Dielectric Breakdown": "...",
      "Adhesion to Steel": "..."
    }
  }
]
`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    mimeType,
                    data: buffer.toString('base64'),
                  }
                },
                {
                  text: prompt,
                }
              ]
            }
          ]
        });

        const text = response.text || '';
        const match = text.match(/\[[\s\S]*\]/);
        if (match) {
          extractedProducts = JSON.parse(match[0]);
        }
      } catch (err: any) {
        console.error('AI brochure parsing error:', err);
        return NextResponse.json({ 
          error: `Failed to parse document: ${err.message || 'Unknown error'}. Please verify the file or use manual entry.` 
        }, { status: 500 });
      }
    }

    if (!extractedProducts || extractedProducts.length === 0) {
      return NextResponse.json({ 
        error: 'No product specifications could be extracted from this document. Please verify the file content or add items manually.' 
      }, { status: 400 });
    }

    // Attach missingFields calculation to each extracted product
    const processedProducts = extractedProducts.map(prod => ({
      ...prod,
      missingFields: computeMissingFields(prod)
    }));

    return NextResponse.json({
      success: true,
      count: processedProducts.length,
      fileName: file.name,
      products: processedProducts,
    });

  } catch (error: any) {
    console.error('Parse catalog endpoint error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
