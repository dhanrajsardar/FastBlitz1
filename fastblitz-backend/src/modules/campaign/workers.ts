import { createWorker, QUEUE_NAMES } from '../../shared/queue';
import { prisma } from '../../config';
import { submitVideoGeneration, FAL_MODELS, FalVideoInput } from '../../config/fal';
import { getEnv } from '../../config';
import { emitCampaignProgress, emitBlitzCardsReady } from '../../shared/events';
import { generateStorageKey, uploadBuffer } from '../../config/s3';
import { openai } from '../../config/openai';
import puppeteer from 'puppeteer';
import crypto from 'crypto';

const env = getEnv();

interface ScrapeJobData {
  campaignId: string;
  websiteUrl: string;
  targetPlatforms: string[];
  brandVoice?: string;
  customInstructions?: string;
}

async function processScrapeWorker() {
  await createWorker<ScrapeJobData>(QUEUE_NAMES.CAMPAIGN_SCRAPE, async (job) => {
    const { campaignId, websiteUrl, targetPlatforms, brandVoice, customInstructions } = job.data;
    const { processScrapeJob } = await import('./service');
    await processScrapeJob({ campaignId, websiteUrl, targetPlatforms, brandVoice, customInstructions });
  }, { concurrency: 3, limiter: { max: 10, duration: 60000 } });
}

interface GenerateJobData {
  campaignId: string;
  platform: string;
  idea: any;
  brandAnalysis: any;
}

interface CheckCompletionJobData {
  campaignId: string;
  expectedCount: number;
}

async function processGenerationWorker() {
  await createWorker<GenerateJobData | CheckCompletionJobData>(QUEUE_NAMES.CAMPAIGN_GENERATE, async (job) => {
    if (job.name === 'check-completion') {
      const { checkGenerationCompletion } = await import('./service');
      await checkGenerationCompletion(job.data as CheckCompletionJobData);
      return;
    }

    const { campaignId, platform, idea, brandAnalysis } = job.data as GenerateJobData;

    await prisma.videoJob.create({
      data: {
        campaignId,
        platform,
        templateName: idea.angle,
        parameters: JSON.stringify({ idea, brandAnalysis }),
        status: 'PROCESSING',
        startedAt: new Date(),
      },
    });

    emitCampaignProgress({ campaignId, stage: 'generating', progress: 60, message: `Generating ${idea.hook}...` });

    const falModel = FAL_MODELS.kling;

    const prompt = buildVideoPrompt(idea, brandAnalysis, platform);
    const imageUrl = brandAnalysis.logoUrl || idea.visualConcept.includes('http') ? extractImageUrl(idea.visualConcept) : undefined;

    const input: FalVideoInput = {
      prompt,
      duration: idea.estimatedDuration,
      aspect_ratio: '9:16',
      ...(imageUrl && { image_url: imageUrl }),
      callback_url: `${env.API_URL}/webhooks/fal`,
    };

    const { request_id } = await submitVideoGeneration('kling', input);

    await prisma.videoJob.update({
      where: { campaignId, platform, templateName: idea.angle },
      data: { falRequestId: request_id, currentStep: 'submitted_to_fal' },
    });
  }, { concurrency: 2, limiter: { max: 5, duration: 60000 } });
}

function buildVideoPrompt(idea: any, brand: any, platform: string): string {
  const nichePrompts = {
    fitness: 'High-energy fitness content, proper form demonstrations, motivational, dynamic camera',
    tech: 'Clean screen recordings, UI close-ups, code snippets, minimal aesthetic, professional',
    beauty: 'Aesthetic close-ups, product application, satisfying textures, soft lighting, ASMR',
    finance: 'Clean graphics, charts, text overlays, trust signals, professional aesthetic',
    food: 'Overhead shots, sizzle/steam, vibrant colors, satisfying process, ASMR audio',
    travel: 'Cinematic b-roll, drone shots, golden hour, authentic local moments',
    default: 'Dynamic cuts, text overlays, engaging hooks, clear value prop, scroll-stopping',
  };

  const nicheStyle = nichePrompts[brand.niche as keyof typeof nichePrompts] || nichePrompts.default;

  return `${idea.scriptOutline}

Visual Style: ${nicheStyle}. ${idea.visualConcept}

Brand Voice: ${brand.brandVoice}. Brand: ${brand.brandName}.

Platform: ${platform}. Format: Vertical 9:16, ${idea.estimatedDuration}s.
Hook: "${idea.hook}"
CTA: "${idea.callToAction}"

Make it native to ${platform}, high production value, viral-potential.`;
}

function extractImageUrl(text: string): string | undefined {
  const match = text.match(/https?:\/\/[^\s]+\.(?:jpg|jpeg|png|webp|gif)/i);
  return match?.[0];
}

async function processFALWebhook(payload: any) {
  const { request_id, status, video_url, error } = payload;

  const videoJob = await prisma.videoJob.findFirst({ where: { falRequestId: request_id } });
  if (!videoJob) return;

  if (status === 'completed' && video_url) {
    const videoBuffer = await fetch(video_url).then(r => r.arrayBuffer()).then(b => Buffer.from(b));
    const key = generateStorageKey(videoJob.campaignId, 'generated', `${request_id}.mp4`);
    const cdnUrl = await uploadBuffer(key, videoBuffer, 'video/mp4');

    const thumbnailBuffer = await generateThumbnail(video_url);
    const thumbKey = generateStorageKey(videoJob.campaignId, 'thumbnails', `${request_id}.jpg`);
    const thumbUrl = await uploadBuffer(thumbKey, thumbnailBuffer, 'image/jpeg');

    const videoCandidate = await prisma.videoCandidate.create({
      data: {
        campaignId: videoJob.campaignId,
        jobId: videoJob.id,
        userId: (await prisma.campaign.findUnique({ where: { id: videoJob.campaignId }, select: { userId: true } }))!.userId,
        workspaceId: (await prisma.campaign.findUnique({ where: { id: videoJob.campaignId }, select: { workspaceId: true } }))!.workspaceId,
        platform: videoJob.platform,
        mediaType: 'VIDEO',
        title: videoJob.templateName,
        script: JSON.parse(videoJob.parameters).idea?.scriptOutline,
        hook: JSON.parse(videoJob.parameters).idea?.hook,
        videoUrl: cdnUrl,
        thumbnailUrl: thumbUrl,
        duration: JSON.parse(videoJob.parameters).idea?.estimatedDuration || 15,
        aspectRatio: '9:16',
        mimeType: 'video/mp4',
        templateId: videoJob.templateId,
        templateName: videoJob.templateName,
        aiModelUsed: 'kling',
        generationParams: videoJob.parameters,
        tags: JSON.stringify(JSON.parse(videoJob.parameters).idea?.nicheTags || []),
        niche: (await prisma.campaign.findUnique({ where: { id: videoJob.campaignId }, select: { niche: true } }))?.niche,
        status: 'READY_FOR_REVIEW',
        creditsUsed: 5,
      },
    });

    await prisma.videoJob.update({
      where: { id: videoJob.id },
      data: { status: 'COMPLETED', progress: 100, currentStep: 'completed', completedAt: new Date(), result: JSON.stringify({ videoUrl: cdnUrl, thumbnailUrl: thumbUrl }) },
    });

    await prisma.campaign.update({
      where: { id: videoJob.campaignId },
      data: { totalVideosGenerated: { increment: 1 } },
    });

    emitBlitzCardsReady({ campaignId: videoJob.campaignId, count: 1, cards: [videoCandidate] });
  } else if (status === 'failed') {
    await prisma.videoJob.update({
      where: { id: videoJob.id },
      data: { status: 'FAILED', errorMessage: error || 'Generation failed', currentStep: 'failed' },
    });
  }
}

async function generateThumbnail(videoUrl: string): Promise<Buffer> {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.goto(`data:text/html,<video src="${videoUrl}" style="width:100%;height:100vh" muted playsinline></video>`, { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 1000));
    return await page.screenshot({ type: 'jpeg', quality: 80 });
  } finally {
    await browser.close();
  }
}

export async function startCampaignWorkers() {
  await processScrapeWorker();
  await processGenerationWorker();
  console.log('✅ Campaign workers started');
}

export { processFALWebhook };