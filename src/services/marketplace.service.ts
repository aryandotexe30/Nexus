import prisma from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";
import nodemailer from 'nodemailer';
import { logAction } from "@/lib/audit";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, 
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
  },
});

export class MarketplaceService {
  static async createEnquiry({
    userId,
    targetToken,
    productName,
    quantity,
    unit,
    purpose,
    details
  }: {
    userId: string;
    targetToken: string;
    productName: string;
    quantity: string;
    unit: string;
    purpose: string;
    details: string;
  }) {
    // 1. Decrypt token
    let supplierEmail, supplierName;
    try {
      const decryptedStr = decrypt(targetToken);
      const supplierData = JSON.parse(decryptedStr);
      supplierEmail = supplierData.contactEmail;
      supplierName = supplierData.realName;
    } catch (e) {
      throw new Error("Invalid or expired target token");
    }

    const nexusEmail = "NexusB2BAI@outlook.com";
    const tempToken = Math.random().toString(36).substring(2, 8).toUpperCase();

    // 2. Send Email
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
          html: `<p>New Enquiry for ${supplierName}: ${details}</p>`, // Simplified for now
        });
        emailSent = true;
      } else if (!supplierEmail) {
        emailErrorMsg = "No public email found for this supplier.";
      } else {
        emailErrorMsg = "SMTP credentials not configured on server.";
      }
    } catch (emailError: any) {
      emailErrorMsg = emailError.message || "Unknown SMTP error";
    }

    // 3. Create Ticket
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: userId,
        status: 'PENDING',
      }
    });

    const displayToken = emailSent ? tempToken : ticket.id.slice(-6).toUpperCase();
    let systemContent = `[SYSTEM] B2B Enquiry for ${supplierName}.\n\nRequirement Details:\nProduct: ${productName}\nDetails: ${details}`;

    await prisma.supportMessage.create({
      data: {
        ticketId: ticket.id,
        senderId: userId,
        content: systemContent
      }
    });

    // 4. Audit Log
    await logAction({
      userId,
      action: "CREATED_ENQUIRY",
      entity: "SupportTicket",
      entityId: ticket.id,
      newValue: { supplierName, productName }
    });

    return { success: true, ticketId: ticket.id, token: displayToken, emailSent };
  }
}
