import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '../../../../../../lib/auth/getSession';

const prisma = new PrismaClient();

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session } = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { action, platforms, scheduledTime } = body;

  try {
    const workspace = await prisma.workspace.findFirst({
      where: { userId: session.user.id }
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 400 });
    }

    const card = await prisma.blitzCard.findUnique({
      where: { id }
    });

    if (!card || card.workspaceId !== workspace.id) {
      return NextResponse.json({ error: 'Card not found or unauthorized' }, { status: 404 });
    }

    if (action === 'SAVE_TO_LIBRARY' || action === 'DISMISS') {
      const updatedCard = await prisma.blitzCard.update({
        where: { id },
        data: { status: action === 'SAVE_TO_LIBRARY' ? 'LIBRARY_SAVED' : 'DISMISSED', swipedAt: new Date() },
      });
      return NextResponse.json({ success: true, card: updatedCard });
    }

    if (action === 'SCHEDULE') {
      const parsedTime = scheduledTime ? new Date(scheduledTime) : new Date(new Date().getTime() + 4 * 60 * 60 * 1000);
      const parsedPlatforms = Array.isArray(platforms) ? platforms : ['TIKTOK', 'INSTAGRAM', 'YOUTUBE'];

      const updatedCard = await prisma.blitzCard.update({
        where: { id },
        data: {
          status: 'SCHEDULED',
          scheduledFor: parsedTime,
          swipedAt: new Date(),
          targetPlatforms: parsedPlatforms as any
        },
      });

      return NextResponse.json({
        success: true,
        card: updatedCard,
        scheduledTimeMessage: `Scheduled for ${parsedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Failed to action card:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
