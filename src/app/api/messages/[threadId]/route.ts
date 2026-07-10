import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { pusherServer } from "@/lib/pusher";

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: Promise<{ threadId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { threadId } = await params;

    const messages = await prisma.chatMessage.findMany({
      where: { threadId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, companyName: true } }
      }
    });

    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    console.error("Fetch messages error:", error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ threadId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { threadId } = await params;
    const { content, attachmentUrl } = await req.json();

    if (!content && !attachmentUrl) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    if (content && typeof content === 'string' && content.length > 2000) {
      return NextResponse.json({ error: 'Message content is too long (max 2000 chars)' }, { status: 400 });
    }

    if (attachmentUrl) {
      if (typeof attachmentUrl !== 'string' || attachmentUrl.length > 500) {
        return NextResponse.json({ error: 'Attachment URL is too long' }, { status: 400 });
      }
      if (!attachmentUrl.startsWith('http://') && !attachmentUrl.startsWith('https://')) {
        return NextResponse.json({ error: 'Invalid Attachment URL' }, { status: 400 });
      }
    }

    const newMessage = await prisma.chatMessage.create({
      data: {
        threadId,
        senderId: user.id,
        content: content || "",
        attachmentUrl
      },
      include: {
        sender: { select: { id: true, companyName: true } }
      }
    });

    await prisma.chatThread.update({
      where: { id: threadId },
      data: { updatedAt: new Date() }
    });

    try {
      await pusherServer.trigger(
        `thread-${threadId}`,
        'new-message',
        newMessage
      );
    } catch (pusherError) {
      console.error("Pusher trigger error:", pusherError);
    }

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error: any) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ threadId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { threadId } = await params;

    const thread = await prisma.chatThread.findUnique({
      where: { id: threadId }
    });

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    // Verify user is a participant
    if (thread.user1Id !== user.id && thread.user2Id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to delete this thread' }, { status: 403 });
    }

    // Delete thread (cascades to messages)
    await prisma.chatThread.delete({
      where: { id: threadId }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete thread error:", error);
    return NextResponse.json({ error: 'Failed to delete thread' }, { status: 500 });
  }
}
