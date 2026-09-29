import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { scrapeUrl } from '../../../../lib/scraper/blitz-scraper';
import { generateBrandDNA, generateBlitzScript } from '../../../../lib/ai/profiler';
import { synthesizeVoiceWithTimestamps } from '../../../../lib/audio/voice-engine';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get('cursor');
  const limit = 5;

  try {
    const queryArgs: any = {
      take: limit,
      where: { status: 'UNVIEWED' },
      orderBy: { createdAt: 'desc' }
    };

    if (cursor) {
      queryArgs.cursor = { id: cursor };
      queryArgs.skip = 1; // Skip the cursor itself
    }

    let cards = await prisma.blitzCard.findMany(queryArgs);

    // If we fetch cards and there are few left, trigger generation pipeline
    if (cards.length < limit) {
      // Find a workspace and profile to attach these to (assumes user has onboarded)
      const workspace = await prisma.workspace.findFirst();
      let profile = await prisma.brandProfile.findFirst({ where: { workspaceId: workspace?.id } });

      if (workspace && profile) {
        // Run AI pipeline to synthesize new cards

        // 1. Scrape url (assuming profile has one, fallback if not)
        const scrapedData = await scrapeUrl(profile.websiteUrl || 'https://example.com') || {};

        // 2. Generate Brand DNA (skip if already generated, but generating here for demo context)
        const dna = await generateBrandDNA(profile.websiteUrl, scrapedData);

        const newCardsData = [];
        for (let i = 0; i < 5; i++) {
          // 3. Generate Script
          const script = await generateBlitzScript(dna);

          // 4. Synthesize Voice
          const audio = await synthesizeVoiceWithTimestamps(script.fullScript);

          newCardsData.push({
            workspaceId: workspace.id,
            brandProfileId: profile.id,
            templateType: i % 2 === 0 ? 'WALL_OF_TEXT' : 'HOOK_DEMO',
            hookText: script.hookText,
            bodyText: script.bodyText,
            ctaText: script.ctaText,
            fullScript: script.fullScript,
            voiceAudioUrl: audio.audioUrl,
            brollVideoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            subtitlesJson: audio.subtitlesJson,
            durationSeconds: audio.durationSeconds,
            status: 'UNVIEWED'
          });
        }

        await prisma.blitzCard.createMany({ data: newCardsData });

        // Fetch again to include the newly created cards
        cards = await prisma.blitzCard.findMany(queryArgs);
      }
    }

    const nextCursor = cards.length === limit ? cards[limit - 1].id : null;

    // Also fetch the current queue count to inform the frontend
    const scheduledCount = await prisma.blitzCard.count({
        where: { status: 'SCHEDULED' }
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
