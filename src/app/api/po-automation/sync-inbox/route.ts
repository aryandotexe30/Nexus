import { NextResponse } from "next/server";
import { ImapFlow } from "imapflow";
import { simpleParser, ParsedMail } from "mailparser";
import * as XLSX from "xlsx";
import { extractText } from "unpdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ImapConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
}

function resolveImapConfig(body: any): ImapConfig | null {
  const host =
    body.host ||
    process.env.IMAP_HOST ||
    (body.provider === "outlook"
      ? "outlook.office365.com"
      : body.provider === "zoho"
      ? "imap.zoho.com"
      : "imap.gmail.com");

  const port = Number(body.port || process.env.IMAP_PORT || 993);
  const secure = body.secure !== undefined ? Boolean(body.secure) : true;
  const user = body.user || process.env.IMAP_USER || process.env.EMAIL_USER;
  const pass = body.pass || process.env.IMAP_PASS || process.env.EMAIL_PASS;

  if (!user || !pass) {
    return null;
  }

  return { host, port, secure, user, pass };
}

function createClient(config: ImapConfig) {
  return new ImapFlow({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass
    },
    logger: false,
    emitLogs: false
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = body.action || "scan"; // 'test' | 'scan' | 'ingest'
    const config = resolveImapConfig(body);

    if (!config) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Email credentials not provided. Please enter your email address and App Password (or configure IMAP_USER and IMAP_PASS)."
        },
        { status: 400 }
      );
    }

    // 1. Action: Test Connection
    if (action === "test") {
      const client = createClient(config);
      try {
        await client.connect();
        const status = await client.status("INBOX", { messages: true, unseen: true });
        await client.logout();
        return NextResponse.json({
          success: true,
          message: `Successfully connected to ${config.user}!`,
          inboxStats: {
            totalMessages: status.messages,
            unseenMessages: status.unseen
          }
        });
      } catch (err: any) {
        return NextResponse.json(
          {
            success: false,
            error: `Failed to connect to email inbox: ${err.message || String(err)}`
          },
          { status: 401 }
        );
      }
    }

    // 2. Action: Scan Inbox for Purchase Orders
    if (action === "scan") {
      const client = createClient(config);
      try {
        await client.connect();
        const lock = await client.getMailboxLock("INBOX");
        const foundEmails: any[] = [];

        try {
          // Search for recent emails (last 50 messages)
          const status = await client.status("INBOX", { messages: true });
          const totalMsgs = status.messages || 0;
          if (totalMsgs === 0) {
            return NextResponse.json({
              success: true,
              emails: [],
              message: "Inbox is empty."
            });
          }

          // Fetch recent message sequence
          const startSeq = Math.max(1, totalMsgs - 40);
          const range = `${startSeq}:${totalMsgs}`;

          for await (const message of client.fetch(range, {
            envelope: true,
            bodyStructure: true,
            uid: true,
            internalDate: true,
            flags: true
          })) {
            const subject = message.envelope?.subject || "No Subject";
            const fromAddr = message.envelope?.from?.[0];
            const senderEmail = fromAddr?.address || "";
            const senderName = fromAddr?.name || senderEmail;
            const dateStr = message.internalDate ? new Date(message.internalDate).toISOString() : new Date().toISOString();

            // Detect potential PO attachments
            const attachments: string[] = [];
            const checkParts = (part: any) => {
              if (part?.disposition === "attachment" || part?.disposition === "inline") {
                const name = part.dispositionParameters?.filename || part.parameters?.name;
                if (name) attachments.push(name);
              }
              if (part?.childNodes && Array.isArray(part.childNodes)) {
                part.childNodes.forEach(checkParts);
              }
            };
            if (message.bodyStructure) {
              checkParts(message.bodyStructure);
            }

            const lowerSub = subject.toLowerCase();
            const isPoSubject =
              lowerSub.includes("po") ||
              lowerSub.includes("purchase order") ||
              lowerSub.includes("p.o.") ||
              lowerSub.includes("order") ||
              lowerSub.includes("invoice") ||
              lowerSub.includes("rfq") ||
              lowerSub.includes("quotation");

            const hasPoAttachment = attachments.some((att) => {
              const l = att.toLowerCase();
              return (
                l.endsWith(".pdf") ||
                l.endsWith(".xlsx") ||
                l.endsWith(".xls") ||
                l.endsWith(".csv") ||
                l.endsWith(".png") ||
                l.endsWith(".jpg")
              );
            });

            // Score likelihood of being a PO
            const isLikelyPo = isPoSubject || (hasPoAttachment && attachments.length > 0);

            foundEmails.push({
              uid: message.uid,
              seq: message.seq,
              subject,
              senderName,
              senderEmail,
              date: dateStr,
              hasAttachments: attachments.length > 0,
              attachments,
              isLikelyPo,
              unread: !message.flags?.has("\\Seen")
            });
          }
        } finally {
          lock.release();
          await client.logout();
        }

        // Sort descending: most recent and PO-matches first
        foundEmails.sort((a, b) => {
          if (a.isLikelyPo && !b.isLikelyPo) return -1;
          if (!a.isLikelyPo && b.isLikelyPo) return 1;
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        return NextResponse.json({
          success: true,
          count: foundEmails.length,
          emails: foundEmails.slice(0, 25)
        });
      } catch (err: any) {
        console.error("[IMAP Scan Error]", err);
        return NextResponse.json(
          {
            success: false,
            error: `Failed to scan inbox: ${err.message || String(err)}`
          },
          { status: 500 }
        );
      }
    }

    // 3. Action: Ingest specific email and run PO AI extraction
    if (action === "ingest") {
      const emailUid = Number(body.uid);
      if (!emailUid) {
        return NextResponse.json(
          { success: false, error: "Missing required 'uid' for email ingestion." },
          { status: 400 }
        );
      }

      const client = createClient(config);
      let parsedMail: ParsedMail | null = null;

      try {
        await client.connect();
        const lock = await client.getMailboxLock("INBOX");
        try {
          const download = await client.download(String(emailUid), undefined, { uid: true });
          if (!download || !download.content) {
            throw new Error(`Could not download message content for UID ${emailUid}`);
          }
          parsedMail = await simpleParser(download.content);
        } finally {
          lock.release();
          await client.logout();
        }
      } catch (err: any) {
        return NextResponse.json(
          { success: false, error: `Failed to fetch email message: ${err.message || String(err)}` },
          { status: 500 }
        );
      }

      if (!parsedMail) {
        return NextResponse.json(
          { success: false, error: "Failed to parse email message content." },
          { status: 500 }
        );
      }

      // Extract raw body & attachment content
      const subject = parsedMail.subject || "Purchase Order";
      const fromAddr = parsedMail.from?.value?.[0];
      const senderEmail = fromAddr?.address || "";
      const senderName = fromAddr?.name || senderEmail;
      const emailBodyText = parsedMail.text || "";

      let extractedDocText = "";
      let primaryAttachmentName = "";
      let imageBase64 = "";
      let imageMimeType = "";

      // Look through attachments for PDF, Excel, or Images
      if (parsedMail.attachments && parsedMail.attachments.length > 0) {
        for (const att of parsedMail.attachments) {
          const lowerFilename = (att.filename || "").toLowerCase();
          primaryAttachmentName = att.filename || "Attachment";

          if (lowerFilename.endsWith(".pdf")) {
            try {
              const uint8 = new Uint8Array(att.content);
              const { text } = await extractText(uint8, { mergePages: true });
              extractedDocText = Array.isArray(text) ? text.join("\n") : String(text || "");
              if (extractedDocText.trim()) break;
            } catch (pdfErr) {
              console.warn("PDF extraction error in email attachment:", pdfErr);
            }
          } else if (
            lowerFilename.endsWith(".xlsx") ||
            lowerFilename.endsWith(".xls") ||
            lowerFilename.endsWith(".csv")
          ) {
            try {
              const workbook = XLSX.read(att.content, { type: "buffer" });
              const sheetTexts: string[] = [];
              for (const sheetName of workbook.SheetNames) {
                const sheet = workbook.Sheets[sheetName];
                const csv = XLSX.utils.sheet_to_csv(sheet);
                if (csv.trim()) {
                  sheetTexts.push(`--- Sheet: ${sheetName} ---\n${csv}`);
                }
              }
              extractedDocText = sheetTexts.join("\n\n");
              if (extractedDocText.trim()) break;
            } catch (xlErr) {
              console.warn("Excel extraction error in email attachment:", xlErr);
            }
          } else if (
            lowerFilename.endsWith(".png") ||
            lowerFilename.endsWith(".jpg") ||
            lowerFilename.endsWith(".jpeg") ||
            lowerFilename.endsWith(".webp")
          ) {
            imageBase64 = att.content.toString("base64");
            imageMimeType = att.contentType || "image/png";
            break;
          }
        }
      }

      let combinedRawText = emailBodyText;
      if (extractedDocText) {
        combinedRawText = `${emailBodyText}\n\n--- EXTRACTED ATTACHMENT (${primaryAttachmentName}) ---\n${extractedDocText}`;
      }

      const groqKey = process.env.GROQ_API_KEY;
      if (!groqKey) {
        return NextResponse.json(
          { success: false, error: "GROQ_API_KEY is not configured in environment variables." },
          { status: 500 }
        );
      }

      // If only image was attached without text, perform OCR
      if (imageBase64 && !extractedDocText && combinedRawText.length < 50) {
        try {
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
            const ocrContent = visionData.choices?.[0]?.message?.content || "";
            if (ocrContent) {
              combinedRawText = `${combinedRawText}\n\n--- OCR TRANSCRIBED ATTACHMENT (${primaryAttachmentName}) ---\n${ocrContent}`;
            }
          }
        } catch (visionErr) {
          console.warn("Vision OCR error:", visionErr);
        }
      }

      if (!combinedRawText || combinedRawText.trim().length < 5) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Could not find readable PO text or attachments in this email. Make sure the email contains PO text or a PDF/Excel attachment."
          },
          { status: 400 }
        );
      }

      // 4. Run Groq LLM extraction strictly on this email's contents
      const systemPrompt = `You are an autonomous B2B Purchase Order (PO) Extraction & Sales Planning AI Agent.
Extract the exact details from this incoming buyer email and PO document, and output ONLY valid JSON matching this schema:
{
  "poNumber": "string (extract exact PO number from document/email)",
  "poDate": "string (extract PO date from document/email, or YYYY-MM-DD)",
  "buyerCompany": "string (extract exact buyer company name from document/email)",
  "buyerGstin": "string (extract exact GSTIN / Tax ID from document/email, or 'Not Specified in PO')",
  "contactName": "string (extract contact person / signatory, or buyer sender name)",
  "contactEmail": "string (buyer email address)",
  "contactPhone": "string (phone number, or 'Not Specified')",
  "deliveryAddress": "string (exact shipping/delivery address specified in PO)",
  "paymentTerms": "string (exact payment terms specified, e.g. 'Net 30 Days')",
  "requestedDeliveryDate": "string (extract delivery date or schedule)",
  "requiresHumanIntervention": boolean,
  "interventionReason": "string (clear reason why human operator should review before approving Sales Plan)",
  "aiConfidence": number (between 92 and 99),
  "items": [
    {
      "id": "string (e.g. item-1, item-2)",
      "sku": "string (item code/SKU/part number from PO)",
      "description": "string (exact line item description)",
      "hsnCode": "string (HSN/SAC code if present, or appropriate 8-digit HSN)",
      "quantity": number (exact numeric quantity from PO)",
      "unit": "string (unit of measure, e.g. Nos, Rolls, Kgs, Units, Pcs, Meters)",
      "poUnitPrice": number (exact numeric unit price/rate from PO)",
      "catalogFloorPrice": number (benchmark price — equal to poUnitPrice or slightly higher if discounted)",
      "unitCost": number (estimated sourcing/manufacturing cost, ~75% of poUnitPrice)",
      "stockAvailable": number (available warehouse stock quantity)",
      "warehouseHub": "string (recommended dispatch facility based on delivery address)",
      "leadTimeDays": number (estimated dispatch lead time in days, e.g. 2)",
      "status": "READY_IN_STOCK" | "PRICE_VARIANCE" | "PARTIAL_STOCK_JOBWORK"
    }
  ],
  "salesPlanSummary": "string (concise 2-3 sentence executive sales & fulfillment plan tailored specifically to the extracted buyer and line items)"
}

IMPORTANT RULES:
- Extract ONLY the real company, PO number, addresses, and line items present in the email or attachment.
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
              content: `Sender Name: ${senderName}\nSender Email: ${senderEmail}\nEmail Subject: ${subject}\nPrimary Attachment: ${
                primaryAttachmentName || "None"
              }\n\n--- EMAIL & ATTACHMENT CONTENT ---\n${combinedRawText.slice(0, 18000)}`
            }
          ],
          temperature: 0.1,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        return NextResponse.json(
          { success: false, error: `AI Extraction service error: ${errText}` },
          { status: 502 }
        );
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        return NextResponse.json(
          { success: false, error: "AI returned empty response while parsing PO email." },
          { status: 500 }
        );
      }

      const parsedPo = JSON.parse(content);

      return NextResponse.json({
        success: true,
        emailDetails: {
          uid: emailUid,
          subject,
          senderName,
          senderEmail,
          attachmentName: primaryAttachmentName,
          rawEmailBody: emailBodyText
        },
        parsedPo
      });
    }

    return NextResponse.json({ success: false, error: "Unknown action specified." }, { status: 400 });
  } catch (error: any) {
    console.error("[API PO Sync Inbox Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process email inbox sync."
      },
      { status: 500 }
    );
  }
}
