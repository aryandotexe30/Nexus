import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";



export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id, action } = await req.json();

    if (action === "approve") {
      await prisma.user.update({
        where: { id },
        data: {
          isVerified: true
        }
      });
    } else if (action === "delete") {
      await prisma.user.delete({
        where: { id }
      });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("User verification error:", error);
    return NextResponse.json({ error: 'Failed to process user verification action' }, { status: 500 });
  }
}
