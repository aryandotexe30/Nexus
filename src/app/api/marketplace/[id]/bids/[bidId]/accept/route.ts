import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";



export async function POST(req: Request, { params }: { params: Promise<{ id: string, bidId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id, bidId } = await params;

    const post = await prisma.marketplacePost.findUnique({ where: { id } });
    if (!post || post.authorId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to accept bids for this post' }, { status: 403 });
    }

    const bid = await prisma.bid.findUnique({ where: { id: bidId } });
    if (!bid) {
      return NextResponse.json({ error: 'Bid not found' }, { status: 404 });
    }

    // 1. Update Bid Status
    await prisma.bid.update({
      where: { id: bidId },
      data: { status: 'ACCEPTED' }
    });

    // 2. Create Chat Thread
    // Ensure we don't duplicate threads
    let thread = await prisma.chatThread.findFirst({
      where: {
        postId: post.id,
        OR: [
          { user1Id: user.id, user2Id: bid.bidderId },
          { user1Id: bid.bidderId, user2Id: user.id }
        ]
      }
    });

    if (!thread) {
      thread = await prisma.chatThread.create({
        data: {
          postId: post.id,
          user1Id: user.id,
          user2Id: bid.bidderId
        }
      });

      // System message
      await prisma.chatMessage.create({
        data: {
          threadId: thread.id,
          senderId: user.id,
          content: `Hi! I have accepted your bid of ${bid.amount} for "${post.title}". Let's discuss the details.`
        }
      });
    }

    return NextResponse.json({ success: true, threadId: thread.id });
  } catch (error: any) {
    console.error("Accept bid error:", error);
    return NextResponse.json({ error: 'Failed to accept bid' }, { status: 500 });
  }
}
