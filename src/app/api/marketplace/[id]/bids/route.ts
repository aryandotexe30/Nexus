import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";



export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const bids = await prisma.bid.findMany({
      where: { postId: id },
      include: {
        bidder: { select: { id: true, email: true, companyName: true, domain: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, bids });
  } catch (error: any) {
    console.error("Fetch bids error:", error);
    return NextResponse.json({ error: 'Failed to fetch bids' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;
    const { amount, proposal } = await req.json();

    if (!amount || !proposal) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const post = await prisma.marketplacePost.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.authorId === user.id) {
      return NextResponse.json({ error: 'Cannot bid on your own post' }, { status: 400 });
    }

    // Check if user already bid
    const existingBid = await prisma.bid.findFirst({
      where: { postId: id, bidderId: user.id }
    });

    if (existingBid) {
      return NextResponse.json({ error: 'You have already placed a bid' }, { status: 400 });
    }

    const newBid = await prisma.bid.create({
      data: {
        postId: id,
        bidderId: user.id,
        amount,
        proposal
      }
    });

    return NextResponse.json({ success: true, bid: newBid });
  } catch (error: any) {
    console.error("Submit bid error:", error);
    return NextResponse.json({ error: 'Failed to submit bid' }, { status: 500 });
  }
}
