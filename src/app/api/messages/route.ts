import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const threads = await prisma.chatThread.findMany({
      where: {
        OR: [
          { user1Id: user.id },
          { user2Id: user.id }
        ]
      },
      include: {
        user1: { select: { id: true, companyName: true, domain: true } },
        user2: { select: { id: true, companyName: true, domain: true } },
        post: { select: { title: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({ success: true, threads });
  } catch (error: any) {
    console.error("Fetch threads error:", error);
    return NextResponse.json({ error: 'Failed to fetch threads' }, { status: 500 });
  }
}
