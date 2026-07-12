import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { decrypt } from "@/lib/encryption";
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
  },
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { targetToken, productName, quantity, unit, purpose, details } = body;

    if (!targetToken || !details) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Decrypt the target company info
    let supplierEmail, supplierName;
    try {
      const decryptedStr = decrypt(targetToken);
      const supplierData = JSON.parse(decryptedStr);
      supplierEmail = supplierData.contactEmail;
      supplierName = supplierData.realName;
    } catch (e) {
      return NextResponse.json({ error: 'Invalid or expired target token' }, { status: 400 });
    }

    const nexusEmail = "NexusB2BAI@outlook.com";
    const tempToken = Math.random().toString(36).substring(2, 8).toUpperCase(); // Temporary token, will use ticket ID later

    // 1. Try to send the email first
    let emailSent = false;
    let emailErrorMsg = null;
    
    try {
      const emailUser = process.env.SMTP_USER || process.env.EMAIL_USER;
      const emailPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
      
      if (supplierEmail && emailUser && emailPass) {
        await transporter.sendMail({
          from: `"Nexus B2B Platform" <${emailUser}>`,
          to: supplierEmail,
          replyTo: nexusEmail,
          subject: `New B2B Enquiry: ${productName || 'Product'} - Ref: ENQ-${tempToken}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #0f172a; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">New B2B Enquiry</h2>
              <p style="color: #475569; font-size: 16px;">Hello ${supplierName},</p>
              <p style="color: #475569; font-size: 16px;">We have a verified buyer on the <strong>Nexus B2B Platform</strong> interested in your products.</p>
              
              <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <h3 style="color: #1e293b; margin-top: 0;">Requirement Details:</h3>
                ${productName ? `<p><strong>Product:</strong> ${productName}</p>` : ''}
                ${quantity ? `<p><strong>Quantity:</strong> ${quantity} ${unit}</p>` : ''}
                ${purpose ? `<p><strong>Purpose:</strong> ${purpose}</p>` : ''}
                <p><strong>Message:</strong></p>
                <p style="white-space: pre-wrap; background: #fff; padding: 10px; border: 1px solid #e2e8f0; border-radius: 4px;">${details}</p>
              </div>

              <p style="color: #475569; font-size: 16px; font-weight: bold;">To respond to this buyer and provide a quotation, please simply reply to this email.</p>
              
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              
              <p style="color: #64748b; font-size: 14px; margin-bottom: 5px;"><strong>Contact Information</strong></p>
              <p style="color: #64748b; font-size: 14px; margin: 2px 0;">Name: Nexus B2B Admin</p>
              <p style="color: #64748b; font-size: 14px; margin: 2px 0;">Email: ${nexusEmail}</p>
            </div>
          `,
        });
        emailSent = true;
      } else if (!supplierEmail) {
        emailErrorMsg = "No public email found for this supplier.";
      } else {
        emailErrorMsg = "SMTP credentials not configured on server.";
      }
    } catch (emailError: any) {
      console.error("Failed to send email via SMTP:", emailError);
      emailErrorMsg = emailError.message || "Unknown SMTP error";
    }

    // 2. Create Support Ticket (Now we know if email succeeded or failed)
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: user.id,
        status: 'PENDING',
      }
    });

    // Update the temp token in the email subject? We can't retroactively change the sent email subject.
    // So the email subject will use tempToken. Let's make sure the ticket gets an initial message that includes it!
    const displayToken = emailSent ? tempToken : ticket.id.slice(-6).toUpperCase();

    let systemContent = `[SYSTEM] B2B Enquiry for ${supplierName}.\n\n`;
    if (emailSent) {
      systemContent += `✅ SUCCESS: An automated email enquiry was successfully sent to ${supplierEmail}.\n\nWaiting for their reply (Reference: ENQ-${displayToken}).\n\n`;
    } else {
      systemContent += `⚠️ ACTION REQUIRED: Admin must manually contact this supplier via their website form or alternative method.\n\nReason: ${emailErrorMsg}\n\n`;
    }

    systemContent += `Requirement Details:\nProduct: ${productName}\nQuantity: ${quantity} ${unit}\nPurpose: ${purpose}\nDetails: ${details}`;

    await prisma.supportMessage.create({
      data: {
        ticketId: ticket.id,
        senderId: user.id,
        content: systemContent
      }
    });

    return NextResponse.json({ success: true, ticketId: ticket.id, token: displayToken, emailSent });
  } catch (error: any) {
    console.error("Enquiry error:", error);
    return NextResponse.json({ error: 'Failed to process enquiry request' }, { status: 500 });
  }
}
