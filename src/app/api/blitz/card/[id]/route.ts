import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '../../../../../lib/auth/getSession';

const prisma = new PrismaClient();

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session } = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { zoomPercent, posX, posY, hookText, foregroundVideoUrl, backgroundAssetUrl, mentionBusiness } = body;

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

    const updated = await prisma.blitzCard.update({
      where: { id },
      data: {
        ...(zoomPercent !== undefined && { zoomPercent }),
        ...(posX !== undefined && { posX }),
        ...(posY !== undefined && { posY }),
        ...(hookText !== undefined && { hookText }),
        ...(foregroundVideoUrl !== undefined && { foregroundVideoUrl }),
        ...(backgroundAssetUrl !== undefined && { backgroundAssetUrl }),
        ...(mentionBusiness !== undefined && { mentionBusiness }),
      },
    });

    return NextResponse.json({ success: true, card: updated });
  } catch (error) {
    console.error('Failed to update card:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
