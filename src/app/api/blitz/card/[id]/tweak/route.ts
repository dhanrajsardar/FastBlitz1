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
  const updates = await request.json();

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

    const updatedCard = await prisma.blitzCard.update({
      where: { id },
      data: {
        hookText: updates.hookText !== undefined ? updates.hookText : card.hookText,
        voiceId: updates.voiceId !== undefined ? updates.voiceId : card.voiceId,
        brollVideoUrl: updates.brollVideoUrl !== undefined ? updates.brollVideoUrl : card.brollVideoUrl
      }
    });

    return NextResponse.json({ success: true, card: updatedCard });

  } catch (error) {
    console.error('Failed to update tweak:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
