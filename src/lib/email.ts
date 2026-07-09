import nodemailer from 'nodemailer';

// Configure the Nodemailer transporter for Outlook
export const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

export const sendWelcomeEmail = async (to: string, companyName: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Welcome to Nexus - Your B2B Lead Engine 🚀',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4F46E5;">Welcome to Nexus!</h2>
        <p>Hi ${companyName},</p>
        <p>Your business account has been successfully verified and created.</p>
        <p>You can now log in to the dashboard to access the AI Business Plan Generator, Network Mapper, and the new Equity & IPO Advisor.</p>
        <br/>
        <p>Best regards,<br/>The Nexus Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendAdminInviteEmail = async (to: string, name: string, tempPassword: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'You have been invited as an Admin to Nexus 🛡️',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4F46E5;">Admin Access Granted</h2>
        <p>Hi ${name},</p>
        <p>You have been granted Admin access to the Nexus platform.</p>
        <p>Your temporary password is: <strong>${tempPassword}</strong></p>
        <p>Please log in immediately and change your password in the settings dashboard.</p>
        <br/>
        <p>Best regards,<br/>The Nexus Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
