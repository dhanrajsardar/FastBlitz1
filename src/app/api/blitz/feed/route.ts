import { NextResponse } from 'next/server';
import { PrismaClient, TemplateArchetype } from '@prisma/client';
import { scrapeUrl } from '../../../../lib/scraper/blitz-scraper';
import { generateBrandDNA, generateBlitzScript } from '../../../../lib/ai/profiler';
import { synthesizeVoiceWithTimestamps } from '../../../../lib/audio/voice-engine';
import { getSession } from '../../../../lib/auth/getSession';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get('cursor');
  const limit = 5;

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

    const queryArgs: any = {
      take: limit,
      where: {
        workspaceId: workspace.id,
        status: 'UNVIEWED'
      },
      orderBy: { createdAt: 'desc' }
    };

    if (cursor) {
      queryArgs.cursor = { id: cursor };
      queryArgs.skip = 1; // Skip the cursor itself
    }

    let cards = await prisma.blitzCard.findMany(queryArgs);

    // If we fetch cards and there are few left, trigger generation pipeline
    if (cards.length < limit) {
      let profile = await prisma.brandProfile.findFirst({ where: { workspaceId: workspace.id } });

      if (profile) {
        // Run AI pipeline to synthesize new cards
        const scrapedData = await scrapeUrl(profile.websiteUrl || 'https://example.com') || {};
        const dna = await generateBrandDNA(profile.websiteUrl, scrapedData);

        const newCardsData = [];
        for (let i = 0; i < 5; i++) {
          const script = await generateBlitzScript(dna);
          const audio = await synthesizeVoiceWithTimestamps(script.fullScript);

          newCardsData.push({
            workspaceId: workspace.id,
            brandProfileId: profile.id,
            templateType: i % 2 === 0 ? TemplateArchetype.WALL_OF_TEXT : TemplateArchetype.HOOK_DEMO,
            hookText: script.hookText,
            bodyText: script.bodyText,
            ctaText: script.ctaText,
            fullScript: script.fullScript,
            voiceAudioUrl: audio.audioUrl,
            brollVideoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            subtitlesJson: audio.subtitlesJson,
            durationSeconds: audio.durationSeconds,
            status: 'UNVIEWED' as any
          });
        }

        await prisma.blitzCard.createMany({ data: newCardsData });

        // Fetch again to include the newly created cards
        cards = await prisma.blitzCard.findMany(queryArgs);
      }
    }

    const nextCursor = cards.length === limit ? cards[limit - 1].id : null;

    const scheduledCount = await prisma.blitzCard.count({
        where: { workspaceId: workspace.id, status: 'SCHEDULED' }
    });

    return NextResponse.json({
      cards,
      nextCursor,
      scheduledCount
    });

  } catch (error) {
    console.error('Failed to fetch feed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
