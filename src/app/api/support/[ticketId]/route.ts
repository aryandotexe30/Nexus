import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";



// GET ticket details
export async function GET(req: Request, { params }: { params: Promise<{ ticketId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { ticketId } = await params;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: { select: { id: true, companyName: true, email: true } },
        admin: { select: { id: true, companyName: true, email: true } },
        messages: {
          include: {
            sender: { select: { id: true, companyName: true, email: true, role: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

    // Access control
    if (user.role !== 'ADMIN' && ticket.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error("GET Ticket Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Accept or Close ticket
export async function PATCH(req: Request, { params }: { params: Promise<{ ticketId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { ticketId } = await params;
    const { action } = await req.json(); // "accept" or "close"

    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

    if (action === "accept") {
      if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      if (ticket.status !== 'PENDING') return NextResponse.json({ error: 'Ticket is already accepted' }, { status: 400 });

      const updated = await prisma.supportTicket.update({
        where: { id: ticketId },
        data: {
          adminId: user.id,
          status: 'ACTIVE'
        },
        include: {
          user: { select: { companyName: true, email: true } },
          admin: { select: { companyName: true, email: true } }
        }
      });
      
      // Notify user that their ticket was accepted
      await pusherServer?.trigger(`support-ticket-${ticketId}`, 'ticket-updated', updated);
      await pusherServer?.trigger('admin-notifications', 'ticket-updated', updated);

      return NextResponse.json({ ticket: updated });
    } 
    
    if (action === "close") {
      // Both admin and the user who created it can close it
      if (user.role !== 'ADMIN' && ticket.userId !== user.id) {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const updated = await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: 'CLOSED' }
      });

      await pusherServer?.trigger(`support-ticket-${ticketId}`, 'ticket-updated', updated);
      await pusherServer?.trigger('admin-notifications', 'ticket-updated', updated);

      return NextResponse.json({ ticket: updated });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error("PATCH Ticket Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
