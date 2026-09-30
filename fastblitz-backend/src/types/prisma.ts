// src/types/prisma.ts
export type Platform = 'TIKTOK' | 'INSTAGRAM' | 'YOUTUBE' | 'LINKEDIN' | 'REDDIT';
export type PostStatus = 'DRAFT' | 'SCHEDULED' | 'PROCESSING' | 'PUBLISHED' | 'FAILED' | 'CANCELLED';
export type ContentStatus = 'GENERATING' | 'READY_FOR_REVIEW' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';
export type UserRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
export type SubscriptionPlan = 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
export type MediaType = 'VIDEO' | 'IMAGE' | 'SLIDESHOW' | 'MEME' | 'CAROUSEL';
export type JobStatus = 'PENDING' | 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type CampaignStatus = 'PENDING' | 'SCRAPING' | 'ANALYZING' | 'GENERATING' | 'READY_FOR_REVIEW' | 'COMPLETED' | 'FAILED';
export type CreditTransactionType = 'PURCHASE' | 'USAGE_GENERATION' | 'USAGE_CHARACTER' | 'USAGE_TRENDING' | 'REFUND' | 'BONUS' | 'EXPIRED' | 'SWIPE_FREE' | 'SWIPE_PAID';
export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'INCOMPLETE' | 'TRIALING' | 'PAUSED';

export type User = any;
export type Workspace = any;
export type WorkspaceMember = any;
export type SocialAccount = any;
export type OAuthAccount = any;
export type Campaign = any;
export type VideoJob = any;
export type VideoCandidate = any;
export type ContentItem = any;
export type TrendingVideo = any;
export type ScheduledPost = any;
export type PublishedPost = any;
export type PostAnalytics = any;
export type AICharacter = any;
export type Subscription = any;
export type CreditTransaction = any;
export type AuditLog = any;

export type PrismaClient = any;