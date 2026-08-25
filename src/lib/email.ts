import { Resend } from 'resend';

// Initialize Resend with the API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

// The verified domain email you set up in Resend
const FROM_EMAIL = 'TarasAI <support@tarasai.in>'; 

export const sendWelcomeEmail = async (to: string, companyName: string) => {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Welcome to TarasAI - Your B2B Lead Engine 🚀',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4F46E5;">Welcome to TarasAI!</h2>
          <p>Hi ${companyName},</p>
          <p>Your business account has been successfully verified and created.</p>
          <p>You can now log in to the dashboard to access the AI Business Plan Generator, Network Mapper, and the new Equity & IPO Advisor.</p>
          <br/>
          <p>Best regards,<br/>The TarasAI Team</p>
        </div>
      `,
    });
    console.log(`[Resend] Successfully sent welcome email to ${to}`);
  } catch (error) {
    console.error(`[Resend] Failed to send welcome email to ${to}:`, error);
  }
};

export const sendAdminInviteEmail = async (to: string, name: string, tempPassword: string) => {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'You have been invited as an Admin to TarasAI 🛡️',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4F46E5;">Admin Access Granted</h2>
          <p>Hi ${name},</p>
          <p>You have been granted Admin access to the TarasAI platform.</p>
          <p>Your temporary password is: <strong>${tempPassword}</strong></p>
          <p>Please log in immediately and change your password in the settings dashboard.</p>
          <br/>
          <p>Best regards,<br/>The TarasAI Team</p>
        </div>
      `,
    });
    console.log(`[Resend] Successfully sent admin invite to ${to}`);
  } catch (error) {
    console.error(`[Resend] Failed to send admin invite to ${to}:`, error);
  }
};

export const sendSupportTicketConfirmation = async (to: string, companyName: string, ticketId: string) => {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Support Ticket Received [${ticketId}] 🛠️`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4F46E5;">Ticket Received</h2>
          <p>Hi ${companyName},</p>
          <p>We have successfully received your support request.</p>
          <p>Your Ticket ID is: <strong>${ticketId}</strong></p>
          <p>One of our team members will review it and get back to you shortly via the Support Chat on your dashboard.</p>
          <br/>
          <p>Best regards,<br/>TarasAI Support</p>
        </div>
      `,
    });
    console.log(`[Resend] Successfully sent support ticket email to ${to}`);
  } catch (error) {
    console.error(`[Resend] Failed to send support ticket email to ${to}:`, error);
  }
};

export const sendMarketplaceBidEmail = async (to: string, postTitle: string, bidderName: string, amount: string) => {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `New Bid on your Post: ${postTitle} 💰`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4F46E5;">You have a new bid!</h2>
          <p>Great news!</p>
          <p><strong>${bidderName}</strong> has just submitted a bid of <strong>${amount}</strong> on your marketplace post: <em>${postTitle}</em>.</p>
          <p>Log in to your TarasAI dashboard to review their proposal and start a chat with them.</p>
          <br/>
          <p>Best regards,<br/>The TarasAI Marketplace</p>
        </div>
      `,
    });
    console.log(`[Resend] Successfully sent bid email to ${to}`);
  } catch (error) {
    console.error(`[Resend] Failed to send bid email to ${to}:`, error);
  }
};
