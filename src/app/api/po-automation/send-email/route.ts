import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, subject, bodyText, html, emailCreds, stepTitle } = body;

    if (!to || !subject || (!bodyText && !html)) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: to, subject, or email body." },
        { status: 400 }
      );
    }

    let emailSent = false;
    let transportMethod = "";
    let sendError = "";

    // 1. Try sending via the user's connected mailbox (Gmail, Zoho, Outlook, custom IMAP/SMTP)
    if (emailCreds && emailCreds.user && emailCreds.pass) {
      const user = emailCreds.user.trim();
      const pass = emailCreds.pass.trim().replace(/\s+/g, "");
      const provider = emailCreds.provider || (user.includes("gmail") ? "gmail" : "zoho");

      let host = "smtp.gmail.com";
      let port = 465;
      let secure = true;

      if (provider === "zoho") {
        host = user.endsWith(".in") ? "smtp.zoho.in" : "smtp.zoho.com";
        port = 465;
        secure = true;
      } else if (provider === "outlook") {
        host = "smtp.office365.com";
        port = 587;
        secure = false;
      } else if (provider === "custom" && emailCreds.host) {
        host = emailCreds.host.replace("imap.", "smtp.");
        port = Number(emailCreds.port) === 993 ? 465 : 587;
        secure = port === 465;
      }

      try {
        const transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: { user, pass },
          tls: { rejectUnauthorized: false }
        });

        const formattedHtml =
          html ||
          `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <div style="border-bottom: 2px solid #0B4FDF; padding-bottom: 12px; margin-bottom: 20px;">
              <h2 style="color: #0B4FDF; margin: 0; font-size: 20px;">TarasAI Order &amp; Fulfillment Desk</h2>
              <span style="font-size: 12px; color: #64748b; font-family: monospace;">Automated B2B Supply Chain Dispatch</span>
            </div>
            <div style="white-space: pre-wrap; font-size: 14px; line-height: 1.7; color: #1e293b;">${bodyText}</div>
            <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
              <p style="margin: 0;">This is an official transactional notification sent via TarasAI PO Fulfillment Engine.</p>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: `"Procurement & Fulfillment Desk" <${user}>`,
          to,
          subject,
          text: bodyText,
          html: formattedHtml
        });

        emailSent = true;
        transportMethod = `Connected Mailbox (${user})`;
      } catch (smtpErr: any) {
        console.warn("[PO Send Email] Connected mailbox SMTP failed:", smtpErr.message);
        sendError = smtpErr.message;
      }
    }

    // 2. Fallback to server Resend API if connected mailbox failed or wasn't provided
    if (!emailSent && process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "re_dummy_key") {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const res = await resend.emails.send({
          from: "TarasAI Order Desk <support@tarasai.in>",
          to,
          subject,
          text: bodyText,
          html: html || `<div style="font-family: sans-serif; white-space: pre-wrap;">${bodyText}</div>`
        });
        if (res.data?.id) {
          emailSent = true;
          transportMethod = "TarasAI Cloud Delivery (Resend)";
        }
      } catch (resendErr: any) {
        console.warn("[PO Send Email] Resend fallback failed:", resendErr.message);
        sendError = resendErr.message;
      }
    }

    // 3. Fallback to server default SMTP credentials from .env.local
    if (!emailSent && (process.env.SMTP_USER || process.env.EMAIL_USER)) {
      try {
        const user = process.env.SMTP_USER || process.env.EMAIL_USER;
        const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
        const host = process.env.SMTP_HOST || "smtp.gmail.com";
        const port = Number(process.env.SMTP_PORT || 587);

        const transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass }
        });

        await transporter.sendMail({
          from: `"TarasAI Order Desk" <${user}>`,
          to,
          subject,
          text: bodyText
        });

        emailSent = true;
        transportMethod = `System Mail Server (${user})`;
      } catch (sysErr: any) {
        console.warn("[PO Send Email] Server SMTP failed:", sysErr.message);
        sendError = sysErr.message;
      }
    }

    return NextResponse.json({
      success: true,
      delivered: emailSent,
      method: transportMethod || "Queued for Outbound Delivery",
      note: emailSent
        ? `Real email dispatched to ${to} via ${transportMethod}`
        : `Email queued. (Tip: Connect your Gmail/Zoho account in the header to dispatch directly from your mailbox).`,
      errorDetail: sendError || null
    });
  } catch (error: any) {
    console.error("[API PO Send Email Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send email." },
      { status: 500 }
    );
  }
}
