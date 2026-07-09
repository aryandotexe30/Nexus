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

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // OFFERING or REQUEST

    const whereClause: any = { isOpen: true };
    if (type) whereClause.type = type;

    const posts = await prisma.marketplacePost.findMany({
      where: whereClause,
      include: {
        author: { select: { companyName: true, email: true, domain: true } },
        _count: { select: { bids: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, posts });
  } catch (error: any) {
    console.error("Fetch posts error:", error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { title, description, type, budget } = await req.json();
    if (!title || !description || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newPost = await prisma.marketplacePost.create({
      data: {
        title,
        description,
        type,
        budget,
        authorId: user.id
      }
    });

    return NextResponse.json({ success: true, post: newPost });
  } catch (error: any) {
    console.error("Create post error:", error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
