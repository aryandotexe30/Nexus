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
      udyamNumber, cinNumber, personalEmail, companyPhone, personalPhone,
      accountType, products, sourcingCategories, annualSpend, procurementNeeds,
      deliveryLocations, designation, buyerRequirements
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

    // Build structured profile
    const profileData = {
      accountType: accountType || 'BUYER',
      designation: designation || null,
      sourcingCategories: sourcingCategories || [],
      annualSpend: annualSpend || null,
      procurementNeeds: procurementNeeds || [],
      deliveryLocations: deliveryLocations || null,
      buyerRequirements: buyerRequirements || null,
      registeredAt: new Date().toISOString()
    };

    // Create the new user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        companyName,
        gstNumber,
        udyamNumber: udyamNumber || null,
        cinNumber: cinNumber || null,
        personalEmail: personalEmail || null,
        companyPhone,
        personalPhone: personalPhone || null,
        industry: industry || (accountType === 'SELLER' ? 'Tape & Adhesive Manufacturing' : 'Industrial Manufacturing'),
        companyProfile: profileData,
        domain,
        isVerified: false,
        role: "USER", // Default role
        credits: accountType === 'SELLER' ? 10 : 3
      }
    });

    // Ingest Seller Catalog Products directly into Master Products database
    if (Array.isArray(products) && products.length > 0) {
      try {
        const productInserts = products.map((p: any) => ({
          companyName: companyName,
          name: p.name || 'Industrial Material Specification',
          industry: industry || 'Specialty Adhesive Tapes & Industrial Solutions',
          market: 'Automotive, Electronics & Industrial Manufacturing',
          application: p.application || 'Industrial bonding, masking & thermal insulation',
          price: p.price || null,
          specs: p.specs || {
            'Category': p.category || 'Adhesive Tapes & Transfer Films',
            'Backing material': p.backing || 'Specialty Carrier / Substrate',
            'Adhesive type': p.adhesionType || 'Polymer System',
            'Total thickness': p.thickness || 'Standard',
            'Temperature resistance': p.tempRange || 'Industrial Grade',
            'Side format': p.sideType || 'Single-Sided'
          },
          imageUrl: p.imageUrl || null,
          productUrl: p.productUrl || null,
        }));

        await prisma.extractedProduct.createMany({
          data: productInserts
        });
      } catch (prodErr) {
        console.error("Failed to batch insert seller products during signup:", prodErr);
      }
    }

    // Send the Welcome Email via Nodemailer/Outlook
    try {
      await sendWelcomeEmail(email, companyName);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }

    return NextResponse.json({ 
      message: "Account created successfully",
      productsAdded: Array.isArray(products) ? products.length : 0 
    }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
