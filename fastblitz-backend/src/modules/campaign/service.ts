import { prisma } from '../../config';
import { getQueue, QUEUE_NAMES } from '../../shared/queue';
import { getEnv } from '../../config';
import { openai } from '../../config/openai';
import { NotFoundError, ValidationError } from '../../shared/errors';
import puppeteer from 'puppeteer';
import { emitCampaignProgress } from '../../shared/events';

const env = getEnv();

interface ScrapedContent {
  title: string;
  description: string;
  headings: string[];
  bodyText: string;
  images: string[];
  metaTags: Record<string, string>;
  structuredData: any[];
}

interface BrandAnalysis {
  brandName: string;
  brandDescription: string;
  brandVoice: string;
  targetAudience: string;
  keyMessages: string[];
  valueProps: string[];
  painPoints: string[];
  niche: string;
  subNiche?: string;
  colorPalette?: string[];
  logoUrl?: string;
}

interface VideoIdea {
  hook: string;
  angle: string;
  scriptOutline: string;
  visualConcept: string;
  callToAction: string;
  platform: string;
  estimatedDuration: number;
  nicheTags: string[];
}

async function scrapeWebsite(url: string): Promise<ScrapedContent> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (compatible; FastBlitzBot/1.0; +https://fastblitz.app/bot)');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const content = await page.evaluate(() => {
      const getText = (selector: string) => {
        const el = document.querySelector(selector);
        return el?.textContent?.trim() || '';
      };

      const getAllText = (selector: string) => {
        return Array.from(document.querySelectorAll(selector))
          .map(el => el.textContent?.trim())
          .filter(Boolean);
      };

      const images = Array.from(document.querySelectorAll('img'))
        .map(img => img.src)
        .filter(src => src && !src.startsWith('data:') && src.startsWith('http'))
        .slice(0, 20);

      const metaTags: Record<string, string> = {};
      document.querySelectorAll('meta').forEach(meta => {
        const name = meta.getAttribute('name') || meta.getAttribute('property');
        const content = meta.getAttribute('content');
        if (name && content) metaTags[name] = content;
      });

      const structuredData: any[] = [];
      document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
        try {
          structuredData.push(JSON.parse(script.textContent || '{}'));
        } catch {}
      });

      return {
        title: getText('title') || getText('h1') || '',
        description: getText('meta[name="description"]') || getText('meta[property="og:description"]') || '',
        headings: getAllText('h1, h2, h3'),
        bodyText: getText('main') || getText('article') || getText('body') || '',
        images,
        metaTags,
        structuredData,
      };
    });

    return content;
  } finally {
    await browser.close();
  }
}

async function analyzeBrand(scraped: ScrapedContent, customInstructions?: string): Promise<BrandAnalysis> {
  const systemPrompt = `You are an expert brand strategist. Analyze the provided website content and extract a comprehensive brand profile for short-form video marketing.

Return ONLY valid JSON with this exact structure:
{
  "brandName": "string",
  "brandDescription": "string (2-3 sentences)",
  "brandVoice": "professional|casual|energetic|authoritative|friendly|witty",
  "targetAudience": "string (specific demographic/psychographic)",
  "keyMessages": ["string", "string", "string"],
  "valueProps": ["string", "string", "string"],
  "painPoints": ["string", "string", "string"],
  "niche": "string (from: fitness, tech, beauty, finance, food, travel, fashion, gaming, education, health, business, lifestyle, pets, parenting, diy, cooking, music, art)",
  "subNiche": "string (optional, more specific)",
  "colorPalette": ["hex", "hex", "hex"],
  "logoUrl": "string (optional, extract from meta tags)"
}`;

  const userPrompt = `Website Content:
TITLE: ${scraped.title}
DESCRIPTION: ${scraped.description}
HEADINGS: ${scraped.headings.join(' | ')}
BODY (truncated): ${scraped.bodyText.slice(0, 8000)}
IMAGES: ${scraped.images.slice(0, 10).join(', ')}
META TAGS: ${JSON.stringify(scraped.metaTags)}
STRUCTURED DATA: ${JSON.stringify(scraped.structuredData).slice(0, 2000)}

${customInstructions ? `CUSTOM INSTRUCTIONS: ${customInstructions}` : ''}

Analyze this brand for creating viral short-form videos (TikTok/Reels/Shorts). Focus on what makes this brand unique, their audience's desires, and angles that stop the scroll.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  const analysis = JSON.parse(completion.choices[0].message.content || '{}');
  return analysis as BrandAnalysis;
}

async function generateVideoIdeas(brand: BrandAnalysis, platforms: string[], count: number = 15): Promise<VideoIdea[]> {
  const platformList = platforms.join(', ');
  
  const systemPrompt = `You are a viral short-form video strategist. Generate ${count} distinct video ideas for ${platformList}.

Each idea must be unique in angle/hook. Return ONLY valid JSON array:
[
  {
    "hook": "string (first 3 seconds - stops scroll)",
    "angle": "string (unique perspective/story)",
    "scriptOutline": "string (beat-by-beat 15-30 sec structure)",
    "visualConcept": "string (what viewer sees - specific shots)",
    "callToAction": "string (specific, low-friction)",
    "platform": "string (TIKTOK|INSTAGRAM|YOUTUBE|LINKEDIN|REDDIT)",
    "estimatedDuration": number (15-30),
    "nicheTags": ["string", "string"]
  }
]

Rules:
- Hooks must be specific, not generic
- Angles must differ: problem/solution, before/after, myth-busting, demo, story, listicle, contrarian, tutorial, transformation, behind-scenes
- Visual concepts must be production-ready (not "show product")
- CTAs must be platform-native
- Distribute ideas across requested platforms`;

  const userPrompt = `BRAND PROFILE:
Name: ${brand.brandName}
Description: ${brand.brandDescription}
Voice: ${brand.brandVoice}
Audience: ${brand.targetAudience}
Key Messages: ${brand.keyMessages.join(', ')}
Value Props: ${brand.valueProps.join(', ')}
Pain Points: ${brand.painPoints.join(', ')}
Niche: ${brand.niche}${brand.subNiche ? ` / ${brand.subNiche}` : ''}
Platforms: ${platformList}

Generate ${count} ideas. Each must be distinctly different.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.85,
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(completion.choices[0].message.content || '{}');
  return (result.ideas || result) as VideoIdea[];
}

export async function createCampaign(data: {
  workspaceId: string;
  userId: string;
  websiteUrl: string;
  niche?: string;
  targetPlatforms?: string[];
  brandVoice?: string;
  customInstructions?: string;
}) {
  const campaign = await prisma.campaign.create({
    data: {
      workspaceId: data.workspaceId,
      userId: data.userId,
      websiteUrl: data.websiteUrl,
      niche: data.niche,
      status: 'SCRAPING',
      keyMessages: JSON.stringify([]),
    },
  });

  const scrapeQueue = await getQueue(QUEUE_NAMES.CAMPAIGN_SCRAPE);
  await scrapeQueue.add('scrape', {
    campaignId: campaign.id,
    websiteUrl: data.websiteUrl,
    targetPlatforms: data.targetPlatforms || ['TIKTOK', 'INSTAGRAM', 'YOUTUBE'],
    brandVoice: data.brandVoice,
    customInstructions: data.customInstructions,
  });

  return campaign;
}

export async function processScrapeJob(jobData: {
  campaignId: string;
  websiteUrl: string;
  targetPlatforms: string[];
  brandVoice?: string;
  customInstructions?: string;
}) {
  const { campaignId, websiteUrl, targetPlatforms, brandVoice, customInstructions } = jobData;

  emitCampaignProgress({ campaignId, stage: 'scraping', progress: 10, message: 'Fetching website content...' });

  const scraped = await scrapeWebsite(websiteUrl);

  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      status: 'ANALYZING',
      extractedData: JSON.stringify(scraped),
    },
  });

  emitCampaignProgress({ campaignId, stage: 'analyzing', progress: 30, message: 'Analyzing brand...' });

  const brandAnalysis = await analyzeBrand(scraped, customInstructions);

  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      status: 'GENERATING_IDEAS',
      brandName: brandAnalysis.brandName,
      brandDescription: brandAnalysis.brandDescription,
      brandVoice: brandVoice || brandAnalysis.brandVoice,
      targetAudience: brandAnalysis.targetAudience,
      keyMessages: JSON.stringify(brandAnalysis.keyMessages),
      niche: brandAnalysis.niche,
    },
  });

  emitCampaignProgress({ campaignId, stage: 'generating_ideas', progress: 50, message: 'Generating video ideas...' });

  const ideas = await generateVideoIdeas(brandAnalysis, targetPlatforms, 15);

  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      status: 'READY_FOR_GENERATION',
      totalVideosGenerated: ideas.length,
    },
  });

  const generateQueue = await getQueue(QUEUE_NAMES.CAMPAIGN_GENERATE);
  for (const idea of ideas) {
    await generateQueue.add('generate', {
      campaignId,
      platform: idea.platform,
      idea,
      brandAnalysis,
    });
  }

  emitCampaignProgress({ campaignId, stage: 'generating', progress: 60, message: `Queued ${ideas.length} videos for generation`, totalVideos: ideas.length });

  await generateQueue.add('check-completion', { campaignId, expectedCount: ideas.length }, { delay: 5000 });
}

export async function checkGenerationCompletion(jobData: { campaignId: string; expectedCount: number }) {
  const { campaignId, expectedCount } = jobData;
  
  const completed = await prisma.videoCandidate.count({
    where: { campaignId, status: { in: ['READY_FOR_REVIEW', 'APPROVED'] } },
  });

  if (completed >= expectedCount) {
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'READY_FOR_REVIEW', completedAt: new Date() },
    });
    emitCampaignProgress({ campaignId, stage: 'completed', progress: 100, message: 'All videos ready for review', completedVideos: completed, totalVideos: expectedCount });
  } else {
    const generateQueue = await getQueue(QUEUE_NAMES.CAMPAIGN_GENERATE);
    await generateQueue.add('check-completion', { campaignId, expectedCount }, { delay: 10000 });
  }
}

export async function getCampaigns(workspaceId: string, query: { page: number; limit: number; status?: string; niche?: string }) {
  const where: any = { workspaceId };
  if (query.status) where.status = query.status;
  if (query.niche) where.niche = query.niche;

  const [campaigns, total] = await Promise.all([
    prisma.campaign.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      include: {
        _count: { select: { videoCandidates: true } },
        videoCandidates: { take: 1, orderBy: { createdAt: 'desc' }, select: { thumbnailUrl: true, status: true } },
      },
    }),
    prisma.campaign.count({ where }),
  ]);

  return { campaigns, total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) };
}

export async function getCampaignById(campaignId: string, workspaceId: string) {
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, workspaceId },
    include: {
      videoCandidates: { orderBy: { createdAt: 'desc' } },
      videoJobs: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!campaign) throw new NotFoundError('Campaign not found');
  return campaign;
}

export async function regenerateCampaign(campaignId: string, workspaceId: string, data: {
  targetPlatforms?: string[];
  brandVoice?: string;
  customInstructions?: string;
  regenerateIdeas?: boolean;
  regenerateVideos?: boolean;
}) {
  const campaign = await getCampaignById(campaignId, workspaceId);

  if (data.regenerateIdeas) {
    await prisma.videoCandidate.deleteMany({ where: { campaignId } });
    await prisma.videoJob.deleteMany({ where: { campaignId } });

    const brandAnalysis = {
      brandName: campaign.brandName,
      brandDescription: campaign.brandDescription,
      brandVoice: data.brandVoice || campaign.brandVoice,
      targetAudience: campaign.targetAudience,
      keyMessages: JSON.parse(campaign.keyMessages),
      valueProps: [],
      painPoints: [],
      niche: campaign.niche,
    };

    const ideas = await generateVideoIdeas(brandAnalysis, data.targetPlatforms || ['TIKTOK', 'INSTAGRAM', 'YOUTUBE'], 15);

    const generateQueue = await getQueue(QUEUE_NAMES.CAMPAIGN_GENERATE);
    for (const idea of ideas) {
      await generateQueue.add('generate', {
        campaignId,
        platform: idea.platform,
        idea,
        brandAnalysis,
      });
    }

    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'GENERATING', totalVideosGenerated: ideas.length, brandVoice: data.brandVoice || campaign.brandVoice },
    });
  }

  return getCampaignById(campaignId, workspaceId);
}

export async function deleteCampaign(campaignId: string, workspaceId: string) {
  await getCampaignById(campaignId, workspaceId);
  await prisma.campaign.delete({ where: { id: campaignId } });
  return { success: true };
}