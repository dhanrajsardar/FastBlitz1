import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '../../../../lib/auth/getSession';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { session } = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const workspace = await prisma.workspace.findFirst({
      where: { userId: session.user.id }
    });

    if (!workspace) {
      return NextResponse.json({ error: 'No workspace found. Please onboard first.' }, { status: 400 });
    }

    let profile = await prisma.brandProfile.findFirst({ where: { workspaceId: workspace.id } });
    if (!profile) {
       return NextResponse.json({ error: 'No brand profile found.' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const limit = 5;

    // Fast lookup for unviewed cards (<50ms)
    let cards = await prisma.blitzCard.findMany({
      where: { brandProfileId: profile.id, status: 'UNVIEWED' },
      include: { memeTemplate: true },
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    // We do NOT block on AI here. If we run out, return what we have.
    // In production a background BullMQ worker should replenish when count < threshold.

    const scheduledCount = await prisma.blitzCard.count({
        where: { workspaceId: workspace.id, status: 'SCHEDULED' }
    });

    return NextResponse.json({
      cards,
      scheduledCount
    });

  } catch (error) {
    console.error('Failed to fetch feed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
