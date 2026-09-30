// src/config/constants.ts
import { Platform, PostStatus, ContentStatus, UserRole, SubscriptionPlan, MediaType, JobStatus, CampaignStatus, CreditTransactionType, SubscriptionStatus } from '../types/prisma';

export const PLAN_LIMITS: Record<SubscriptionPlan, {
  dailySwipes: number;
  monthlyCredits: number;
  videoCost: number;
  maxTeamMembers: number;
  maxMonthlyPosts: number;
  maxAiCredits: number;
}> = {
  FREE: { dailySwipes: 10, monthlyCredits: 10, videoCost: 5, maxTeamMembers: 1, maxMonthlyPosts: 10, maxAiCredits: 100 },
  STARTER: { dailySwipes: 50, monthlyCredits: 500, videoCost: 4, maxTeamMembers: 3, maxMonthlyPosts: 100, maxAiCredits: 1000 },
  PRO: { dailySwipes: 200, monthlyCredits: 2000, videoCost: 3, maxTeamMembers: 10, maxMonthlyPosts: 1000, maxAiCredits: 5000 },
  ENTERPRISE: { dailySwipes: -1, monthlyCredits: 10000, videoCost: 2, maxTeamMembers: 50, maxMonthlyPosts: 10000, maxAiCredits: 50000 },
};

export const CREDIT_COSTS = {
  VIDEO_GENERATION: (plan: SubscriptionPlan) => PLAN_LIMITS[plan].videoCost,
  AI_CHARACTER_CREATION: 50,
  PREMIUM_TRENDING_TEMPLATE: 10,
};

export const PLATFORM_LIMITS: Record<Platform, any> = {
  TIKTOK: { selfOnlyDailyLimit: 5, publicDailyLimit: 1000, requiresAudit: true },
  INSTAGRAM: { dailyLimit: 50, requiresBusinessAccount: true },
  YOUTUBE: { dailyQuota: 10000, shortsUploadCost: 1600 },
  LINKEDIN: { dailyLimit: 25 },
  REDDIT: { rateLimitPerMinute: 60 },
};

export const NICHES = [
  'fitness', 'tech', 'beauty', 'finance', 'food', 'travel',
  'fashion', 'gaming', 'education', 'health', 'business', 'lifestyle',
  'pets', 'parenting', 'diy', 'cooking', 'music', 'art',
] as const;

export const NICHE_PROMPTS: Record<string, {
  system: string;
  hooks: string[];
  visualStyle: string;
}> = {
  fitness: {
    system: 'Create high-energy fitness content for TikTok/Reels/Shorts. Focus on: proper form, motivation, quick tips, transformations.',
    hooks: ['{benefit} in just {time}', 'Stop doing {common_mistake}', 'The {exercise} everyone gets wrong', '{number} exercises for {body_part}', 'Why your {body_part} isn\'t growing'],
    visualStyle: 'Bright lighting, clean background, dynamic camera angles, text overlays, energetic music',
  },
  tech: {
    system: 'Create engaging tech content. Focus on: demos, tips, hidden features, comparisons, productivity.',
    hooks: ['Hidden {feature} you didn\'t know', '{app} vs {competitor}: which wins?', 'Speed up your {workflow} with this trick', 'Stop wasting time on {task}', 'The {tool} that changed everything'],
    visualStyle: 'Screen recording, clean UI, zoom effects, code snippets, minimal aesthetic',
  },
  beauty: {
    system: 'Create aesthetic beauty content. Focus on: routines, product demos, before/after, tips.',
    hooks: ['My {time} {routine} routine', 'Why {product} changed my skin', 'Stop buying {product_type}', 'The {ingredient} your routine needs', '{number} beauty hacks that actually work'],
    visualStyle: 'Soft lighting, close-ups, flat lays, aesthetic transitions, satisfying textures',
  },
  finance: {
    system: 'Create educational finance content. Focus on: tips, strategies, myths, actionable advice.',
    hooks: ['How I save ${amount} per month', 'The {concept} nobody explains', 'Stop making this {mistake} with money', '{number} ways to build wealth', 'Why {strategy} beats {alternative}'],
    visualStyle: 'Clean graphics, charts, text overlays, professional aesthetic, trust signals',
  },
  food: {
    system: 'Create mouth-watering food content. Focus on: recipes, tips, hacks, satisfying process.',
    hooks: ['{dish} in {time} minutes', 'The secret to perfect {food}', 'Stop cooking {food} wrong', '{number} ingredients, {result}', 'Restaurant quality {dish} at home'],
    visualStyle: 'Overhead shots, close-ups, steam/sizzle, vibrant colors, ASMR audio',
  },
  travel: {
    system: 'Create inspiring travel content. Focus on: hidden gems, tips, itineraries, budget hacks.',
    hooks: ['Hidden gem in {destination}', 'How to do {destination} for ${budget}', 'Don\'t visit {place} without this tip', '{number} days in {destination}', 'The {experience} you can\'t miss'],
    visualStyle: 'Cinematic b-roll, drone shots, local culture, authentic moments, golden hour',
  },
  default: {
    system: 'Create engaging short-form content that stops the scroll and drives action.',
    hooks: ['Why {topic} matters more than you think', 'The truth about {topic}', '{number} things I wish I knew about {topic}', 'How to {result} without {pain}', 'Stop {common_action}, do this instead'],
    visualStyle: 'Dynamic cuts, text overlays, engaging hooks, clear value prop',
  },
};

export const VIDEO_GENERATION_DEFAULTS = {
  duration: 15,
  aspectRatio: '9:16',
  defaultModel: 'kling',
  maxRetries: 2,
  batchSize: 3,
};

export const RATE_LIMITS = {
  auth: {
    login: { max: 5, window: '15m' },
    register: { max: 3, window: '1h' },
    refresh: { max: 10, window: '1m' },
  },
  api: {
    default: { max: 100, window: '1m' },
    generation: { max: 10, window: '1m' },
    publish: { max: 20, window: '1m' },
  },
  social: {
    TIKTOK: { max: 5, window: '1d' },
    INSTAGRAM: { max: 50, window: '1d' },
    YOUTUBE: { max: 100, window: '1d' },
    LINKEDIN: { max: 25, window: '1d' },
    REDDIT: { max: 60, window: '1m' },
  },
};

export const QUEUE_CONFIG: Record<string, { concurrency: number; limiter?: { max: number; duration: number } }> = {
  'campaign:scrape': { concurrency: 3, limiter: { max: 10, duration: 60000 } },
  'campaign:analyze': { concurrency: 5 },
  'campaign:ideas': { concurrency: 5 },
  'campaign:generate': { concurrency: 2, limiter: { max: 5, duration: 60000 } },
  'publishing:post': { concurrency: 5 },
  'publishing:retry': { concurrency: 3 },
  'analytics:collect': { concurrency: 10 },
  'analytics:sync': { concurrency: 1 },
  'social:token-refresh': { concurrency: 5 },
  'trending:update': { concurrency: 1 },
  'credits:daily-reset': { concurrency: 1 },
};

export const SOCKET_EVENTS = {
  CAMPAIGN_PROGRESS: 'campaign:progress',
  BLITZ_CARDS_READY: 'blitz:cards-ready',
  BLITZ_CARD_UPDATE: 'blitz:card-update',
  SCHEDULE_UPDATE: 'schedule:update',
  ANALYTICS_UPDATE: 'analytics:update',
  NOTIFICATION: 'notification',
  BLITZ_SWIPE: 'blitz:swipe',
  CAMPAIGN_SUBSCRIBE: 'campaign:subscribe',
  SCHEDULE_SUBSCRIBE: 'schedule:subscribe',
  WORKSPACE_SUBSCRIBE: 'workspace:subscribe',
};

export const AUDIT_ACTIONS = {
  USER_REGISTERED: 'user.registered',
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  WORKSPACE_CREATED: 'workspace.created',
  WORKSPACE_UPDATED: 'workspace.updated',
  WORKSPACE_DELETED: 'workspace.deleted',
  MEMBER_INVITED: 'member.invited',
  MEMBER_REMOVED: 'member.removed',
  MEMBER_ROLE_CHANGED: 'member.role_changed',
  SOCIAL_CONNECTED: 'social.connected',
  SOCIAL_DISCONNECTED: 'social.disconnected',
  CAMPAIGN_CREATED: 'campaign.created',
  CAMPAIGN_REGENERATED: 'campaign.regenerated',
  VIDEO_APPROVED: 'video.approved',
  VIDEO_REJECTED: 'video.rejected',
  POST_SCHEDULED: 'post.scheduled',
  POST_PUBLISHED: 'post.published',
  POST_FAILED: 'post.failed',
  SUBSCRIPTION_CREATED: 'subscription.created',
  SUBSCRIPTION_UPDATED: 'subscription.updated',
  SUBSCRIPTION_CANCELED: 'subscription.canceled',
  CREDITS_PURCHASED: 'credits.purchased',
  CREDITS_CONSUMED: 'credits.consumed',
};