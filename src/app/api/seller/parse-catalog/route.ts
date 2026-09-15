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
You are an expert industrial materials and adhesive specifications classifier.
A tape manufacturer named "${companyName}" uploaded a spreadsheet catalog.
Convert and normalize the following spreadsheet rows into an array of standardized products matching our Master Products database schema.

RAW ROWS:
${JSON.stringify(rawRows.slice(0, 100), null, 2)}

Return strictly a valid JSON array of objects with this schema:
[
  {
    "name": "Product Model Name (e.g. High-Temp Polyimide Tape 50µm)",
    "productType": "Tape" | "Adhesive" | "Film" | "Foam" | "Die-Cut",
    "sideType": "Single-Sided" | "Double-Sided" | "Transfer",
    "backing": "Carrier/Backing Material (e.g. Polyimide, Acrylic Foam, PVC, Aluminum Foil, Fiberglass, PET)",
    "adhesionType": "Adhesive System (e.g. Silicone, Acrylic, Rubber, Synthetic Resin)",
    "thickness": "Total thickness/caliper (e.g. 0.05 mm, 1.1 mm, 0.13 mm)",
    "tempRange": "Temperature rating (e.g. 260°C, 150°C, 80°C)",
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
              const backing = getVal(['backing', 'carrier', 'substrate', 'material', 'base']) || 'Specialty Carrier';
              const adhesion = getVal(['adhesive', 'glue', 'adhesion', 'polymer', 'resin']) || 'Pressure Sensitive';
              const thickness = getVal(['thickness', 'caliper', 'gauge', 'micron', 'mil']) || 'Standard';
              const temp = getVal(['temp', 'temperature', 'heat', 'thermal']) || 'Industrial Grade';
              const side = getVal(['side', 'coated', 'coating']) || (name.toLowerCase().includes('double') ? 'Double-Sided' : 'Single-Sided');
              const app = getVal(['app', 'application', 'usage', 'industry', 'use']) || 'Industrial manufacturing & bonding';
              const price = getVal(['price', 'rate', 'cost', 'inr', 'usd', 'moq']) || 'Inquire on Request';

              return {
                name,
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
You are an expert materials scientist and industrial tape engineer.
A manufacturer named "${companyName}" uploaded their technical brochure/catalog document.
Extract all distinct tape, adhesive, film, and foam materials listed in this document.
Extract every product's specifications and normalize into our standard Master Products catalog format.

Return strictly a valid JSON array of objects with this schema:
[
  {
    "name": "Full Product Name & Model Code",
    "productType": "Tape" | "Adhesive" | "Film" | "Foam" | "Die-Cut",
    "sideType": "Single-Sided" | "Double-Sided" | "Transfer",
    "backing": "Backing / Carrier Material (e.g. Polyimide Film, PVC, Acrylic Foam, Aluminum Foil, Fiberglass, Glass Cloth, PET, Crepe Paper)",
    "adhesionType": "Adhesive Polymer (e.g. Cross-Linked Silicone, Pure Solvent Acrylic, Natural Rubber, Synthetic Resin)",
    "thickness": "Total thickness/caliper (e.g. 0.05 mm, 0.07 mm, 1.1 mm, 0.15 mm)",
    "tempRange": "Temperature rating (e.g. 260°C, 180°C, 150°C, 90°C)",
    "application": "Key industrial engineering use cases and applications",
    "price": "Estimated benchmark unit price or MOQ (e.g. ₹320.00 / roll, $4.20)",
    "specs": {
      "Backing material": "...",
      "Adhesive type": "...",
      "Total thickness": "...",
      "Temperature resistance": "...",
      "Adhesion to Steel": "...",
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
