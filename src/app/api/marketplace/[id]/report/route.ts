import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const post = await prisma.marketplacePost.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Flag the post and hide it from the public feed pending admin review
    await prisma.marketplacePost.update({
      where: { id },
      data: {
        isFlagged: true,
        isApproved: false
      }
    });

    return NextResponse.json({ success: true, message: "Post reported successfully." });
  } catch (error: any) {
    console.error("Report post error:", error);
    return NextResponse.json({ error: 'Failed to report post' }, { status: 500 });
  }
}
