import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { sendAdminInviteEmail } from '@/lib/email';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify caller is actually an admin
    const caller = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!caller || caller.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Only admins can invite new admins" }, { status: 403 });
    }

    const { email, name, companyName } = await req.json();

    if (!email || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      if (existingUser.role === "ADMIN") {
        return NextResponse.json({ error: "User is already an admin" }, { status: 409 });
      } else {
        // Upgrade existing user to ADMIN
        await prisma.user.update({
          where: { email },
          data: { role: "ADMIN" }
        });
        return NextResponse.json({ message: "Existing user upgraded to ADMIN successfully" }, { status: 200 });
      }
    }

    // Generate secure temporary password
    const tempPassword = crypto.randomBytes(8).toString('hex'); // 16 char string
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const domain = email.split('@')[1] || "nexus.admin";

    // Create the new admin
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        companyName: companyName || "Nexus Admin",
        domain,
        role: "ADMIN",
        credits: 9999, // Admins get unlimited credits effectively
        isVerified: true
      }
    });

    // Send the invitation email with the temporary password
    try {
      await sendAdminInviteEmail(email, name, tempPassword);
    } catch (emailError) {
      console.error("Failed to send admin invite email:", emailError);
      return NextResponse.json({ error: "Admin created but email failed to send. Temp Password: " + tempPassword }, { status: 500 });
    }

    return NextResponse.json({ message: "Admin invited successfully" }, { status: 201 });

  } catch (error) {
    console.error("Admin invite error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
