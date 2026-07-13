import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail } from '@/lib/email';
import { registerSchema } from "@/lib/validations";



export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = registerSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { 
      email, password, companyName, gstNumber, industry, 
      udyamNumber, cinNumber, personalEmail, companyPhone, personalPhone 
    } = validation.data;

    // Extract domain from email (e.g., aryan@tata.com -> tata.com)
    const domain = email.split('@')[1];
    
    // Check if exact email exists
    const existingEmailUser = await prisma.user.findUnique({
      where: { email: email }
    });

    if (existingEmailUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        companyName,
        gstNumber,
        udyamNumber: udyamNumber || null,
        cinNumber,
        personalEmail,
        companyPhone,
        personalPhone,
        industry,
        domain,
        isVerified: false,
        role: "USER", // Default role
        credits: 3    // Free tier gets 3 credits
      }
    });

    // Send the Welcome Email via Nodemailer/Outlook
    try {
      await sendWelcomeEmail(email, companyName);
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
