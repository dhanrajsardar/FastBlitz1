import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { nextAvailableTimeSlot } from '../../../../../lib/scheduler';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { cardId, action } = await request.json(); // action: 'SCHEDULE' or 'DISMISS'

    if (!cardId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (action === 'SCHEDULE') {
      // Find currently scheduled dates to calculate next slot
      const existingScheduledCards = await prisma.blitzCard.findMany({
        where: { status: 'SCHEDULED' },
        select: { scheduledFor: true }
      });

      const dates = existingScheduledCards
        .map(c => c.scheduledFor)
        .filter((d): d is Date => d !== null);

      const nextSlot = nextAvailableTimeSlot(dates);

      const updatedCard = await prisma.blitzCard.update({
        where: { id: cardId },
        data: {
          status: 'SCHEDULED',
          scheduledFor: nextSlot,
          swipedAt: new Date()
        }
      });

      return NextResponse.json({ success: true, card: updatedCard });
    } else if (action === 'DISMISS') {
      const updatedCard = await prisma.blitzCard.update({
        where: { id: cardId },
        data: {
          status: 'DISMISSED',
          swipedAt: new Date()
        }
      });

      return NextResponse.json({ success: true, card: updatedCard });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Swipe API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
