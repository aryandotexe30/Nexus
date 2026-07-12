import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { pusherServer } from "@/lib/pusher";

const prisma = new PrismaClient();

// POST: Send a message in a support ticket
export async function POST(req: Request, { params }: { params: Promise<{ ticketId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { ticketId } = await params;
    const { content } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

    if (ticket.status === 'CLOSED') {
      return NextResponse.json({ error: 'Cannot send messages to a closed ticket' }, { status: 400 });
    }

    // Access control
    if (user.role !== 'ADMIN' && ticket.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // If an admin replies to a PENDING ticket, auto-accept it
    if (user.role === 'ADMIN' && ticket.status === 'PENDING') {
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: {
          adminId: user.id,
          status: 'ACTIVE'
        }
      });
      // Notify that ticket is now ACTIVE
      const updatedTicket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
      await pusherServer?.trigger(`support-ticket-${ticketId}`, 'ticket-updated', updatedTicket);
      await pusherServer?.trigger('admin-notifications', 'ticket-updated', updatedTicket);
    }

    // Create the message
    const message = await prisma.supportMessage.create({
      data: {
        ticketId,
        senderId: user.id,
        content: content.trim()
      },
      include: {
        sender: { select: { id: true, companyName: true, email: true, role: true } }
      }
    });

    // Notify clients connected to this ticket's channel
    await pusherServer?.trigger(`support-ticket-${ticketId}`, 'new-message', message);

    return NextResponse.json({ message });
  } catch (error) {
    console.error("POST Support Message Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
