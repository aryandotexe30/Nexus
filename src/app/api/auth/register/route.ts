import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import WelcomeEmail from '@/emails/WelcomeEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password, companyName, gstNumber } = await req.json();

    if (!email || !password || !companyName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Extract domain from email (e.g., aryan@tata.com -> tata.com)
    const domain = email.split('@')[1];
    
    // Check if a user with this domain already exists
    const existingDomainUser = await prisma.user.findFirst({
      where: { domain: domain }
    });

    // Check if exact email exists
    const existingEmailUser = await prisma.user.findUnique({
      where: { email: email }
    });

    if (existingEmailUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    if (existingDomainUser) {
      // ENFORCING: Temporarily disabled to allow multiple generic emails
      // return NextResponse.json({ 
      //   error: `An account for the business domain @${domain} already exists. Please contact your administrator.` 
      // }, { status: 403 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        companyName,
        gstNumber: gstNumber || null,
        domain,
        role: "USER", // Default role
        credits: 3    // Free tier gets 3 credits
      }
    });

    // Send the Welcome Email
    try {
      await resend.emails.send({
        from: 'Nexus <onboarding@resend.dev>',
        to: email,
        subject: 'Welcome to Nexus - Your B2B Lead Engine 🚀',
        react: WelcomeEmail({ companyName }),
      });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // We don't fail the registration if the email fails, just log it.
    }

    return NextResponse.json({ message: "Account created successfully" }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
