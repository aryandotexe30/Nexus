import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function PATCH() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.notification.updateMany({
      where: { 
        userId: session.user.id,
        isRead: false
      },
      data: { isRead: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to mark notifications as read:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
