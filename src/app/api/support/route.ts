import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export const dynamic = 'force-dynamic';



// GET all tickets (Admins get all PENDING/ACTIVE, Users get their own)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    let tickets;
    if (user.role === 'ADMIN') {
      tickets = await prisma.supportTicket.findMany({
        where: {
          status: { in: ['PENDING', 'ACTIVE'] }
        },
        include: {
          user: { select: { companyName: true, email: true, domain: true } },
          admin: { select: { companyName: true, email: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      tickets = await prisma.supportTicket.findMany({
        where: { userId: user.id },
        include: {
          admin: { select: { companyName: true, email: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("GET Support Tickets Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new support ticket (User only)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Check if the user already has a pending or active ticket
    const existingTicket = await prisma.supportTicket.findFirst({
      where: {
        userId: user.id,
        status: { in: ['PENDING', 'ACTIVE'] }
      }
    });

    if (existingTicket) {
      return NextResponse.json({ error: 'You already have an active support ticket.', ticketId: existingTicket.id }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: user.id,
        status: 'PENDING'
      },
      include: {
        user: { select: { companyName: true, email: true, domain: true } }
      }
    });

    // Notify admins about the new ticket
    await pusherServer?.trigger('admin-notifications', 'new-ticket', ticket);

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error("POST Support Ticket Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
