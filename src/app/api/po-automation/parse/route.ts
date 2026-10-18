import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { extractText } from "unpdf";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let rawText = "";
    let senderEmail = "";
    let subject = "";
    let fileName = "";
    let imageBase64 = "";
    let imageMimeType = "";

    // 1. Handle multipart/form-data (Real File Upload: PDF, XLSX, CSV, Image, TXT, EML)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      senderEmail = ((formData.get("senderEmail") as string) || "").trim();
      subject = ((formData.get("subject") as string) || "").trim();
      const extraText = ((formData.get("rawEmailText") as string) || "").trim();

      if (file) {
        fileName = file.name;
        const lowerName = file.name.toLowerCase();
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (lowerName.endsWith(".pdf")) {
          const uint8 = new Uint8Array(arrayBuffer);
          const { text } = await extractText(uint8, { mergePages: true });
          rawText = Array.isArray(text) ? text.join("\n") : String(text || "");
        } else if (
          lowerName.endsWith(".xlsx") ||
          lowerName.endsWith(".xls") ||
          lowerName.endsWith(".csv")
        ) {
          const workbook = XLSX.read(buffer, { type: "buffer" });
          const sheetTexts: string[] = [];
          for (const sheetName of workbook.SheetNames) {
            const sheet = workbook.Sheets[sheetName];
            const csv = XLSX.utils.sheet_to_csv(sheet);
            if (csv.trim()) {
              sheetTexts.push(`--- Sheet: ${sheetName} ---\n${csv}`);
            }
          }
          rawText = sheetTexts.join("\n\n");
        } else if (
          lowerName.endsWith(".png") ||
          lowerName.endsWith(".jpg") ||
          lowerName.endsWith(".jpeg") ||
          lowerName.endsWith(".webp")
        ) {
          imageBase64 = buffer.toString("base64");
          imageMimeType = file.type || "image/png";
        } else {
          rawText = buffer.toString("utf-8");
        }
      }

      if (extraText) {
        rawText = rawText ? `${extraText}\n\n--- ATTACHED PO DOCUMENT (${fileName}) ---\n${rawText}` : extraText;
      }
    } else {
      // 2. Handle JSON body
      const body = await req.json();
      rawText = (body.rawEmailText || "").trim();
      senderEmail = (body.senderEmail || "").trim();
      subject = (body.subject || "").trim();
      fileName = (body.fileName || "Uploaded_PO.txt").trim();
    }

    if (!rawText && !imageBase64) {
      return NextResponse.json(
        {
          success: false,
          error: "Could not read text from the uploaded PO. Please upload a valid PDF, Excel/CSV, Image, or paste the PO text."
        },
        { status: 400 }
      );
    }

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return NextResponse.json(
        {
          success: false,
          error: "GROQ_API_KEY is not configured in environment variables."
        },
        { status: 500 }
      );
    }

    // If user uploaded an image of a PO, perform vision OCR via Groq Llama-4 Scout first
    if (imageBase64 && !rawText) {
      const visionRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Transcribe all text, tables, PO number, buyer details, GSTIN, addresses, line items, quantities, units, and unit prices verbatim from this Purchase Order image."
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${imageMimeType};base64,${imageBase64}`
                  }
                }
              ]
            }
          ],
          temperature: 0.1
        })
      });

      if (visionRes.ok) {
        const visionData = await visionRes.json();
        rawText = visionData.choices?.[0]?.message?.content || "";
      }
    }

    if (!rawText || rawText.trim().length < 5) {
      return NextResponse.json(
        {
          success: false,
          error: "The uploaded PDF appears to be an empty or non-text file. Please upload a text-searchable PDF, Excel/CSV, Image, or paste the PO text."
        },
        { status: 400 }
      );
    }

    // 3. Extract structured PO & generate Sales Plan strictly from the user's uploaded PO
    const systemPrompt = `You are an autonomous B2B Purchase Order (PO) Extraction & Sales Planning AI Agent.
Extract the exact details from the user's uploaded Purchase Order document/email and output ONLY valid JSON matching this schema:
{
  "poNumber": "string (extract exact PO number from document)",
  "poDate": "string (extract PO date from document, or YYYY-MM-DD)",
  "buyerCompany": "string (extract exact buyer company name from document)",
  "buyerGstin": "string (extract exact GSTIN / Tax ID from document, or 'Not Specified in PO')",
  "contactName": "string (extract contact person / signatory from document, or 'Procurement Desk')",
  "contactEmail": "string (extract buyer email from document or sender email)",
  "contactPhone": "string (extract phone from document, or 'Not Specified')",
  "deliveryAddress": "string (extract exact shipping/delivery address from document)",
  "paymentTerms": "string (extract exact payment terms from document, e.g. 'Net 30 Days')",
  "requestedDeliveryDate": "string (extract delivery date/schedule from document)",
  "requiresHumanIntervention": boolean,
  "interventionReason": "string (explain what the human operator should review before approving the Sales Plan, e.g. verifying commercial terms, pricing, or delivery schedule)",
  "aiConfidence": number (between 92 and 99),
  "items": [
    {
      "id": "string (e.g. item-1, item-2)",
      "sku": "string (extract item code/SKU/part number from PO, or generate a code based on item name)",
      "description": "string (exact line item description from the PO)",
      "hsnCode": "string (extract HSN/SAC code from PO if present, or appropriate 8-digit HSN)",
      "quantity": number (exact numeric quantity from PO),
      "unit": "string (exact unit of measure from PO, e.g. Nos, Rolls, Kgs, Units, Pcs, Meters)",
      "poUnitPrice": number (exact numeric unit price/rate from PO),
      "catalogFloorPrice": number (reference benchmark price — set equal to poUnitPrice or slightly higher if a discount is noted in the PO),
      "unitCost": number (estimated manufacturing/sourcing cost, ~75% of poUnitPrice),
      "stockAvailable": number (available warehouse stock quantity),
      "warehouseHub": "string (recommended dispatch facility based on delivery address)",
      "leadTimeDays": number (estimated dispatch lead time in days, e.g. 2),
      "status": "READY_IN_STOCK" | "PRICE_VARIANCE" | "PARTIAL_STOCK_JOBWORK"
    }
  ],
  "salesPlanSummary": "string (concise 2-3 sentence executive sales & fulfillment plan tailored specifically to the extracted buyer and line items)"
}

IMPORTANT RULES:
- Extract ONLY the real company, PO number, addresses, and line items present in the user's document.
- Do NOT invent fake companies or unrelated line items.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `${senderEmail ? `Sender Email: ${senderEmail}\n` : ""}${
              subject ? `Email Subject: ${subject}\n` : ""
            }${fileName ? `Uploaded File Name: ${fileName}\n` : ""}\n--- RAW UPLOADED PO CONTENT ---\n${rawText.slice(0, 18000)}`
          }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        {
          success: false,
          error: `AI Extraction service error (${response.status}): ${errText}`
        },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { success: false, error: "AI returned an empty response while parsing the PO." },
        { status: 500 }
      );
    }

    const parsedPo = JSON.parse(content);

    return NextResponse.json({
      success: true,
      fileName: fileName || "Pasted_PO.txt",
      extractedRawText: rawText,
      parsedPo
    });
  } catch (error: any) {
    console.error("[API PO Parse] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to parse uploaded Purchase Order."
      },
      { status: 500 }
    );
  }
}
