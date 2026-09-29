import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '../../../../lib/auth/getSession';
import { scrapeWebsite } from '../../../../lib/scraper/web-scraper';
import { extractBrandDNA } from '../../../../lib/ai/brand-profiler';
import { synthesizeMemeRemix } from '../../../../lib/ai/meme-matcher';

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

    // Fetch unviewed cards
    let cards = await prisma.blitzCard.findMany({
      where: { brandProfileId: profile.id, status: 'UNVIEWED' },
      include: { memeTemplate: true },
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    // Generate new cards if running low
    if (cards.length < limit) {
      const templates = await prisma.memeTemplate.findMany({ take: 5 });

      if (templates.length > 0) {
        // We need Brand DNA to generate content
        const scraped = await scrapeWebsite(profile.websiteUrl || 'https://example.com');
        const dna = await extractBrandDNA(scraped, profile.websiteUrl);

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
            status: 'UNVIEWED'
          });
        }

        await prisma.blitzCard.createMany({ data: newCardsData });

        // Re-fetch to include newly generated
        cards = await prisma.blitzCard.findMany({
          where: { brandProfileId: profile.id, status: 'UNVIEWED' },
          include: { memeTemplate: true },
          take: limit,
          orderBy: { createdAt: 'desc' }
        });
      }
    }

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
