import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '../../../../../../lib/auth/getSession';

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session } = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { direction } = await request.json();

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

    let status = 'DISMISSED';
    let scheduledFor = null;

    if (direction === 'right') {
      status = 'SCHEDULED';

      // Auto-schedule logic
      const existingScheduled = await prisma.blitzCard.findMany({
        where: { workspaceId: workspace.id, status: 'SCHEDULED', scheduledFor: { not: null } },
        orderBy: { scheduledFor: 'desc' },
        take: 1
      });

      const now = new Date();
      if (existingScheduled.length > 0 && existingScheduled[0].scheduledFor) {
        // Schedule 4 hours after the last one
        scheduledFor = new Date(existingScheduled[0].scheduledFor.getTime() + 4 * 60 * 60 * 1000);
      } else {
        // Schedule next open 4-hour window from now
        scheduledFor = new Date(now.getTime() + 4 * 60 * 60 * 1000);
      }
    }

    const updatedCard = await prisma.blitzCard.update({
      where: { id },
      data: {
        status: status as any,
        swipedAt: new Date(),
        scheduledFor
      }
    });

    return NextResponse.json({ success: true, card: updatedCard });

  } catch (error) {
    console.error('Failed to update swipe:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
