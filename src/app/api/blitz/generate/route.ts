import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '../../../../lib/auth/getSession';
import { synthesizeMemeRemix } from '../../../../lib/ai/meme-matcher';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { session } = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const workspace = await prisma.workspace.findFirst({
      where: { userId: session.user.id }
    });

    if (!workspace) {
      return NextResponse.json({ error: 'No workspace found.' }, { status: 400 });
    }

    const profile = await prisma.brandProfile.findFirst({
      where: { workspaceId: workspace.id }
    });

    if (!profile) {
      return NextResponse.json({ error: 'No profile found.' }, { status: 400 });
    }

    // Fetch existing unviewed to see if we actually need more
    const unviewedCount = await prisma.blitzCard.count({
      where: { brandProfileId: profile.id, status: 'UNVIEWED' }
    });

    if (unviewedCount > 10) {
      return NextResponse.json({ success: true, message: 'Buffer full', count: unviewedCount });
    }

    // Generate more cards in the background
    const dna = {
      companyName: profile.companyName,
      tagline: profile.tagline || '',
      targetAudience: profile.targetAudience,
      brandVoice: profile.brandVoice,
      corePainPoints: profile.corePainPoints,
      keyBenefits: profile.keyBenefits
    };

    const templates = await prisma.memeTemplate.findMany({ take: 5 });

    if (templates.length > 0) {
      const newCardsData = [];
      for (const template of templates) {
        const remix = await synthesizeMemeRemix(dna, template);

        newCardsData.push({
          workspaceId: workspace.id,
          brandProfileId: profile.id,
          memeTemplateId: template.id,
          templateType: template.templateType,
          positioningAngle: remix.positioningAngle,
          whyThisContent: remix.whyThisContent,
          hookText: remix.hookText,
          mentionBusiness: true,

          foregroundVideoUrl: template.foregroundCutoutUrl,
          backgroundAssetUrl: template.defaultBrollUrl,
          audioTrackUrl: template.audioTrackUrl,

          zoomPercent: 102,
          posX: 0,
          posY: 0,
          status: 'UNVIEWED' as any
        });
      }

      await prisma.blitzCard.createMany({ data: newCardsData });
    }

    return NextResponse.json({ success: true, added: templates.length });

  } catch (error) {
    console.error('Failed to auto-replenish generate:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
