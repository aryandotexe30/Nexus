import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// Only ADMIN users should be able to hit this API
async function verifyAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) return false;
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });
  
  return user?.role === "ADMIN";
}

export async function PUT(req: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { userId, role, credits, plan } = await req.json();

    if (!userId || typeof credits !== "number" || !role) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role,
        credits,
        ...(plan && { plan })
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
