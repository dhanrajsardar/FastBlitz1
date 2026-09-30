// src/modules/campaign/schemas.ts
import { z } from 'zod';

export const createCampaignSchema = z.object({
  body: z.object({
    websiteUrl: z.string().url(),
    niche: z.string().min(1).max(50).optional(),
    targetPlatforms: z.array(z.enum(['TIKTOK', 'INSTAGRAM', 'YOUTUBE', 'LINKEDIN', 'REDDIT'])).optional(),
    brandVoice: z.enum(['professional', 'casual', 'energetic', 'authoritative', 'friendly', 'witty']).optional(),
    customInstructions: z.string().max(2000).optional(),
  }),
});

export const campaignIdSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});

export const listCampaignsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    status: z.string().optional(),
    niche: z.string().optional(),
  }),
});

export const regenerateCampaignSchema = z.object({
  body: z.object({
    targetPlatforms: z.array(z.enum(['TIKTOK', 'INSTAGRAM', 'YOUTUBE', 'LINKEDIN', 'REDDIT'])).optional(),
    brandVoice: z.enum(['professional', 'casual', 'energetic', 'authoritative', 'friendly', 'witty']).optional(),
    customInstructions: z.string().max(2000).optional(),
    regenerateIdeas: z.boolean().default(false),
    regenerateVideos: z.boolean().default(false),
  }),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>['body'];
export type CampaignIdParams = z.infer<typeof campaignIdSchema>['params'];
export type ListCampaignsQuery = z.infer<typeof listCampaignsSchema>['query'];
export type RegenerateCampaignInput = z.infer<typeof regenerateCampaignSchema>['body'];