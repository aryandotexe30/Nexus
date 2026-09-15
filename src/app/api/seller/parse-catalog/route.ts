import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import * as XLSX from 'xlsx';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
          // Normalize spreadsheet rows with AI or heuristic mapping
          if (process.env.GEMINI_API_KEY) {
            const prompt = `
You are an expert industrial materials and specifications engineer.
A manufacturer/supplier named "${companyName}" uploaded a spreadsheet catalog.
Convert and normalize the following spreadsheet rows into an array of standardized products matching our Master Products database schema.
The seller can supply tapes, adhesives, sealants, foams, gaskets, thermal interface materials, insulation, shielding, optical films, abrasives, or fasteners.

RAW ROWS:
${JSON.stringify(rawRows.slice(0, 100), null, 2)}

Return strictly a valid JSON array of objects with this schema:
[
  {
    "name": "Product Model Name (e.g. 50µm Polyimide Masking Film or RTV Silicone Gasket Sealant)",
    "category": "Adhesive Tapes & Transfer Films" | "Liquid Adhesives & Structural Sealants" | "Foams, Gaskets & Cushioning" | "Thermal Interface Materials (TIM)" | "Electrical & High-Dielectric Insulation" | "Optical, Display & Barrier Films" | "EMI / RFI Shielding & Conductive Foils" | "Protective Films & Surface Protection" | "Specialty Industrial Packaging & Strapping" | "Custom Precision Die-Cut Components" | "Abrasives, Polishing & Surface Finishing" | "Industrial Fasteners & Reclosables" | "Specialty Polymers, Resins & Raw Compounds" | "Other Industrial Materials & Consumables",
    "productType": "Tape" | "Adhesive" | "Film" | "Foam" | "Die-Cut" | "Sealant" | "Thermal Pad" | "Liquid" | "Abrasive" | "Fastener",
    "sideType": "Single-Sided" | "Double-Sided" | "Transfer" | "N/A (Liquid / Non-Adhesive)",
    "backing": "Carrier/Substrate/Backing Material (e.g. Polyimide, Acrylic Foam, EPDM, Aluminum Foil, Fiberglass, PET, Crepe, None / Bulk Resin)",
    "adhesionType": "Adhesive / Chemical System (e.g. Silicone, Pure Acrylic, Epoxy, Polyurethane, Synthetic Rubber)",
    "thickness": "Total thickness / caliper / viscosity (e.g. 0.05 mm, 1.1 mm, 0.5 mm, 120 cP)",
    "tempRange": "Temperature resistance rating (e.g. 260°C, 180°C, 150°C, 80°C)",
    "application": "Primary industrial engineering applications",
    "price": "Wholesale benchmark price or MOQ (e.g. ₹350 / roll, $4.50)",
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
              const price = getVal(['price', 'rate', 'cost', 'inr', 'usd', 'moq']) || 'Inquire on Request';

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
    // 2. PDF, Images, Text or Brochure Documents
    else {
      try {
        if (!process.env.GEMINI_API_KEY) {
          throw new Error('Gemini API key is required to parse brochures/datasheets.');
        }

        const mimeType = file.type || (fileName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');

        const prompt = `
You are an expert industrial materials scientist and technical procurement engineer.
A manufacturer/supplier named "${companyName}" uploaded their technical brochure/catalog.
Extract all distinct industrial materials, products, tapes, adhesives, sealants, foams, gaskets, thermal pads, films, shielding, or fasteners listed in this document.
Extract every product's specifications and normalize into our standard Master Products catalog schema.

Return strictly a valid JSON array of objects with this schema:
[
  {
    "name": "Full Product Name & Model Code",
    "category": "Adhesive Tapes & Transfer Films" | "Liquid Adhesives & Structural Sealants" | "Foams, Gaskets & Cushioning" | "Thermal Interface Materials (TIM)" | "Electrical & High-Dielectric Insulation" | "Optical, Display & Barrier Films" | "EMI / RFI Shielding & Conductive Foils" | "Protective Films & Surface Protection" | "Specialty Industrial Packaging & Strapping" | "Custom Precision Die-Cut Components" | "Abrasives, Polishing & Surface Finishing" | "Industrial Fasteners & Reclosables" | "Specialty Polymers, Resins & Raw Compounds" | "Other Industrial Materials & Consumables",
    "productType": "Tape" | "Adhesive" | "Film" | "Foam" | "Die-Cut" | "Sealant" | "Thermal Pad" | "Liquid" | "Abrasive" | "Fastener",
    "sideType": "Single-Sided" | "Double-Sided" | "Transfer" | "N/A (Liquid / Non-Adhesive)",
    "backing": "Backing / Carrier / Substrate (e.g. Polyimide Film, PVC, Acrylic Foam, Aluminum Foil, Fiberglass, Glass Cloth, PET, EPDM, None)",
    "adhesionType": "Adhesive / Polymer Chemistry (e.g. Cross-Linked Silicone, Pure Solvent Acrylic, Epoxy, Polyurethane, Natural Rubber)",
    "thickness": "Total thickness / caliper / gauge (e.g. 0.05 mm, 0.07 mm, 1.1 mm, 0.5 mm)",
    "tempRange": "Temperature rating (e.g. 260°C, 180°C, 150°C, 90°C)",
    "application": "Key industrial engineering use cases and applications",
    "price": "Estimated benchmark unit price or MOQ (e.g. ₹320.00 / roll, $4.20)",
    "specs": {
      "Backing material": "...",
      "Adhesive type": "...",
      "Total thickness": "...",
      "Temperature resistance": "...",
      "Tensile Strength": "..."
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
          error: `Failed to parse document: ${err.message || 'Unknown error'}. Please try an Excel (.xlsx) file or use manual entry.` 
        }, { status: 500 });
      }
    }

    if (!extractedProducts || extractedProducts.length === 0) {
      return NextResponse.json({ 
        error: 'No product specifications could be extracted. Please ensure the file contains product data or use manual entry.' 
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      count: extractedProducts.length,
      products: extractedProducts,
    });

  } catch (error: any) {
    console.error('Parse catalog endpoint error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
