import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id, action } = await req.json();

    if (action === "approve") {
      await prisma.marketplacePost.update({
        where: { id },
        data: {
          isApproved: true,
          isFlagged: false
        }
      });
    } else if (action === "delete") {
      await prisma.marketplacePost.delete({
        where: { id }
      });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Moderation error:", error);
    return NextResponse.json({ error: 'Failed to process moderation action' }, { status: 500 });
  }
}
