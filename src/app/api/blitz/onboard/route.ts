import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '../../../../lib/auth/getSession';
import { scrapeWebsite } from '../../../../lib/scraper/web-scraper';
import { extractBrandDNA } from '../../../../lib/ai/brand-profiler';
import { synthesizeMemeRemix } from '../../../../lib/ai/meme-matcher';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { session } = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const userMeta = (session.user as any).user_metadata;
    const name = userMeta?.full_name || 'User';

    const user = await prisma.user.upsert({
      where: { id: session.user.id },
      update: {},
      create: {
        id: session.user.id,
        email: session.user.email || 'mock@example.com',
        name
      }
    });

    let workspace = await prisma.workspace.findFirst({
      where: { userId: user.id }
    });

    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: {
          name: 'My Workspace',
          userId: user.id
        }
      });
    }

    // Process AI generation in the background/sync based on requirements
    // For onboarding, we scrape and extract DNA
    const scraped = await scrapeWebsite(url);
    const dna = await extractBrandDNA(scraped, url);

    const profile = await prisma.brandProfile.create({
      data: {
        workspaceId: workspace.id,
        websiteUrl: url,
        companyName: dna.companyName,
        targetAudience: dna.targetAudience,
        brandVoice: dna.brandVoice,
        corePainPoints: dna.corePainPoints,
        keyBenefits: dna.keyBenefits,
      }
    });

    // Pre-generate 10 cards using Meme templates
    const templates = await prisma.memeTemplate.findMany({ take: 10 });

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

    return NextResponse.json({ success: true, workspace, profile });

  } catch (error) {
    console.error('Failed to onboard:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
