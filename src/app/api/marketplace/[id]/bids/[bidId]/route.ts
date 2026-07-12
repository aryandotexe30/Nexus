import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string, bidId: string }> }) {
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

    const bid = await prisma.bid.findUnique({ 
      where: { id: bidId },
      include: { post: true }
    });
    if (!bid) {
      return NextResponse.json({ error: 'Bid not found' }, { status: 404 });
    }

    // Verify user is the bidder or the post author
    if (bid.bidderId !== user.id && bid.post.authorId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to delete this bid' }, { status: 403 });
    }

    await prisma.bid.delete({
      where: { id: bidId }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete bid error:", error);
    return NextResponse.json({ error: 'Failed to delete bid' }, { status: 500 });
  }
}
