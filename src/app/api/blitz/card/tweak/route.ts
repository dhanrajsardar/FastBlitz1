import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { cardId, updates } = await request.json();

    if (!cardId || !updates) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updatedCard = await prisma.blitzCard.update({
      where: { id: cardId },
      data: {
        hookText: updates.hookText,
        voiceId: updates.voice,
        brollVideoUrl: updates.brollVideoUrl
      }
    });

    return NextResponse.json({ success: true, card: updatedCard });
  } catch (error) {
    console.error('Tweak API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
