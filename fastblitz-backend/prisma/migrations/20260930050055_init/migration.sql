-- CreateTable
CREATE TABLE "PlatformEnum" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "PostStatusEnum" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ContentStatusEnum" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "UserRoleEnum" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "SubscriptionPlanEnum" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "MediaTypeEnum" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "JobStatusEnum" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "CampaignStatusEnum" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "CreditTransactionTypeEnum" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "SubscriptionStatusEnum" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "passwordHash" TEXT,
    "name" TEXT,
    "avatarUrl" TEXT,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "plan" TEXT NOT NULL DEFAULT 'FREE',
    "credits" INTEGER NOT NULL DEFAULT 10,
    "swipesUsedToday" INTEGER NOT NULL DEFAULT 0,
    "lastSwipeReset" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stripeCustomerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastLoginAt" DATETIME
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'FREE',
    "apiKey" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "subscriptionEndsAt" DATETIME,
    "maxTeamMembers" INTEGER NOT NULL DEFAULT 5,
    "maxMonthlyPosts" INTEGER NOT NULL DEFAULT 100,
    "maxAiCredits" INTEGER NOT NULL DEFAULT 1000,
    "dailySwipeLimit" INTEGER NOT NULL DEFAULT 10,
    "monthlyCredits" INTEGER NOT NULL DEFAULT 100,
    "settings" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "Workspace_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkspaceMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invitedById" TEXT,
    CONSTRAINT "WorkspaceMember_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WorkspaceMember_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WorkspaceMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SocialAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspaceId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "platformAccountId" TEXT NOT NULL,
    "username" TEXT,
    "displayName" TEXT,
    "profileImageUrl" TEXT,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "tokenExpiresAt" DATETIME,
    "tokenType" TEXT,
    "scope" TEXT,
    "metadata" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncedAt" DATETIME,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SocialAccount_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SocialAccount_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OAuthAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "expiresAt" DATETIME,
    "scope" TEXT,
    "idToken" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OAuthAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "websiteUrl" TEXT NOT NULL,
    "niche" TEXT,
    "brandName" TEXT,
    "brandDescription" TEXT,
    "brandVoice" TEXT,
    "targetAudience" TEXT,
    "keyMessages" TEXT NOT NULL,
    "extractedData" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "totalVideosGenerated" INTEGER NOT NULL DEFAULT 0,
    "totalVideosApproved" INTEGER NOT NULL DEFAULT 0,
    "totalCreditsUsed" INTEGER NOT NULL DEFAULT 0,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Campaign_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Campaign_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VideoJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "templateId" TEXT,
    "templateName" TEXT,
    "parameters" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "currentStep" TEXT,
    "errorMessage" TEXT,
    "result" TEXT,
    "falRequestId" TEXT,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VideoJob_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VideoCandidate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "jobId" TEXT,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL DEFAULT 'VIDEO',
    "title" TEXT,
    "description" TEXT,
    "script" TEXT,
    "hook" TEXT,
    "videoUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "duration" INTEGER,
    "aspectRatio" TEXT DEFAULT '9:16',
    "fileSize" BIGINT,
    "mimeType" TEXT,
    "templateId" TEXT,
    "templateName" TEXT,
    "aiModelUsed" TEXT,
    "generationParams" TEXT,
    "tags" TEXT NOT NULL,
    "niche" TEXT,
    "status" TEXT NOT NULL DEFAULT 'READY_FOR_REVIEW',
    "reviewedAt" DATETIME,
    "reviewedById" TEXT,
    "rejectionReason" TEXT,
    "scheduledPostId" TEXT,
    "creditsUsed" INTEGER NOT NULL DEFAULT 5,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VideoCandidate_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VideoCandidate_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "VideoJob" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "VideoCandidate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VideoCandidate_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContentItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspaceId" TEXT NOT NULL,
    "campaignId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "mediaType" TEXT NOT NULL DEFAULT 'VIDEO',
    "mediaUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "duration" INTEGER,
    "aspectRatio" TEXT DEFAULT '9:16',
    "fileSize" BIGINT,
    "mimeType" TEXT,
    "tags" TEXT NOT NULL,
    "niche" TEXT,
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "isTrending" BOOLEAN NOT NULL DEFAULT false,
    "sourceType" TEXT,
    "sourceId" TEXT,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ContentItem_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContentItem_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrendingVideo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspaceId" TEXT,
    "niche" TEXT NOT NULL,
    "subNiche" TEXT,
    "videoUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "duration" INTEGER NOT NULL,
    "aspectRatio" TEXT NOT NULL DEFAULT '9:16',
    "fileSize" BIGINT,
    "mimeType" TEXT,
    "title" TEXT,
    "description" TEXT,
    "tags" TEXT NOT NULL,
    "originalCreator" TEXT,
    "originalUrl" TEXT,
    "sourceViews" BIGINT NOT NULL DEFAULT 0,
    "sourceLikes" BIGINT NOT NULL DEFAULT 0,
    "sourceShares" BIGINT NOT NULL DEFAULT 0,
    "sourcePlatform" TEXT,
    "trendingScore" REAL NOT NULL DEFAULT 0,
    "trendingAt" DATETIME,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "addedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TrendingVideo_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScheduledPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentItemId" TEXT,
    "videoCandidateId" TEXT,
    "socialAccountId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "caption" TEXT,
    "hashtags" TEXT NOT NULL,
    "mentions" TEXT NOT NULL,
    "location" TEXT,
    "altText" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "scheduledFor" DATETIME NOT NULL,
    "publishedAt" DATETIME,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "platformPostId" TEXT,
    "platformUrl" TEXT,
    "platformError" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ScheduledPost_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ScheduledPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ScheduledPost_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "ContentItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ScheduledPost_videoCandidateId_fkey" FOREIGN KEY ("videoCandidateId") REFERENCES "VideoCandidate" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ScheduledPost_socialAccountId_fkey" FOREIGN KEY ("socialAccountId") REFERENCES "SocialAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PublishedPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scheduledPostId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "socialAccountId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "platformPostId" TEXT NOT NULL,
    "platformUrl" TEXT NOT NULL,
    "caption" TEXT,
    "hashtags" TEXT NOT NULL,
    "mediaUrls" TEXT NOT NULL,
    "initialViews" INTEGER NOT NULL DEFAULT 0,
    "initialLikes" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PublishedPost_scheduledPostId_fkey" FOREIGN KEY ("scheduledPostId") REFERENCES "ScheduledPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PublishedPost_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PublishedPost_socialAccountId_fkey" FOREIGN KEY ("socialAccountId") REFERENCES "SocialAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PostAnalytics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "publishedPostId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "socialAccountId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "granularity" TEXT NOT NULL DEFAULT 'daily',
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "saves" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "reach" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "watchTime" INTEGER DEFAULT 0,
    "averageWatchTime" INTEGER DEFAULT 0,
    "completionRate" REAL DEFAULT 0,
    "rawData" TEXT,
    "fetchedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PostAnalytics_publishedPostId_fkey" FOREIGN KEY ("publishedPostId") REFERENCES "PublishedPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PostAnalytics_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PostAnalytics_socialAccountId_fkey" FOREIGN KEY ("socialAccountId") REFERENCES "SocialAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PostAnalytics_publishedPostId_fkey" FOREIGN KEY ("publishedPostId") REFERENCES "ScheduledPost" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AICharacter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "appearanceParams" TEXT NOT NULL,
    "voiceParams" TEXT,
    "avatarUrl" TEXT,
    "previewVideoUrl" TEXT,
    "modelProvider" TEXT,
    "modelId" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "creditsCost" INTEGER NOT NULL DEFAULT 50,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AICharacter_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspaceId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "stripePriceId" TEXT NOT NULL,
    "stripeCurrentPeriodEnd" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "plan" TEXT NOT NULL DEFAULT 'FREE',
    "creditsIncluded" INTEGER NOT NULL DEFAULT 0,
    "swipeLimit" INTEGER NOT NULL DEFAULT 10,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "canceledAt" DATETIME,
    "trialEndsAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subscription_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CreditTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL,
    "description" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CreditTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CreditTransaction_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspaceId" TEXT,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "oldData" TEXT,
    "newData" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "PlatformEnum_value_key" ON "PlatformEnum"("value");

-- CreateIndex
CREATE UNIQUE INDEX "PostStatusEnum_value_key" ON "PostStatusEnum"("value");

-- CreateIndex
CREATE UNIQUE INDEX "ContentStatusEnum_value_key" ON "ContentStatusEnum"("value");

-- CreateIndex
CREATE UNIQUE INDEX "UserRoleEnum_value_key" ON "UserRoleEnum"("value");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlanEnum_value_key" ON "SubscriptionPlanEnum"("value");

-- CreateIndex
CREATE UNIQUE INDEX "MediaTypeEnum_value_key" ON "MediaTypeEnum"("value");

-- CreateIndex
CREATE UNIQUE INDEX "JobStatusEnum_value_key" ON "JobStatusEnum"("value");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignStatusEnum_value_key" ON "CampaignStatusEnum"("value");

-- CreateIndex
CREATE UNIQUE INDEX "CreditTransactionTypeEnum_value_key" ON "CreditTransactionTypeEnum"("value");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionStatusEnum_value_key" ON "SubscriptionStatusEnum"("value");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_stripeCustomerId_idx" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "User_plan_idx" ON "User"("plan");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_slug_key" ON "Workspace"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_apiKey_key" ON "Workspace"("apiKey");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_stripeSubscriptionId_key" ON "Workspace"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "Workspace_slug_idx" ON "Workspace"("slug");

-- CreateIndex
CREATE INDEX "Workspace_ownerId_idx" ON "Workspace"("ownerId");

-- CreateIndex
CREATE INDEX "Workspace_plan_idx" ON "Workspace"("plan");

-- CreateIndex
CREATE INDEX "Workspace_stripeSubscriptionId_idx" ON "Workspace"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "WorkspaceMember_workspaceId_idx" ON "WorkspaceMember"("workspaceId");

-- CreateIndex
CREATE INDEX "WorkspaceMember_userId_idx" ON "WorkspaceMember"("userId");

-- CreateIndex
CREATE INDEX "WorkspaceMember_role_idx" ON "WorkspaceMember"("role");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceMember_workspaceId_userId_key" ON "WorkspaceMember"("workspaceId", "userId");

-- CreateIndex
CREATE INDEX "SocialAccount_workspaceId_idx" ON "SocialAccount"("workspaceId");

-- CreateIndex
CREATE INDEX "SocialAccount_platform_idx" ON "SocialAccount"("platform");

-- CreateIndex
CREATE INDEX "SocialAccount_isActive_idx" ON "SocialAccount"("isActive");

-- CreateIndex
CREATE INDEX "SocialAccount_tokenExpiresAt_idx" ON "SocialAccount"("tokenExpiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "SocialAccount_workspaceId_platform_platformAccountId_key" ON "SocialAccount"("workspaceId", "platform", "platformAccountId");

-- CreateIndex
CREATE INDEX "OAuthAccount_userId_idx" ON "OAuthAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OAuthAccount_provider_providerId_key" ON "OAuthAccount"("provider", "providerId");

-- CreateIndex
CREATE INDEX "Campaign_workspaceId_idx" ON "Campaign"("workspaceId");

-- CreateIndex
CREATE INDEX "Campaign_userId_idx" ON "Campaign"("userId");

-- CreateIndex
CREATE INDEX "Campaign_status_idx" ON "Campaign"("status");

-- CreateIndex
CREATE INDEX "Campaign_createdAt_idx" ON "Campaign"("createdAt");

-- CreateIndex
CREATE INDEX "Campaign_niche_idx" ON "Campaign"("niche");

-- CreateIndex
CREATE INDEX "VideoJob_campaignId_idx" ON "VideoJob"("campaignId");

-- CreateIndex
CREATE INDEX "VideoJob_status_idx" ON "VideoJob"("status");

-- CreateIndex
CREATE INDEX "VideoJob_platform_idx" ON "VideoJob"("platform");

-- CreateIndex
CREATE INDEX "VideoJob_falRequestId_idx" ON "VideoJob"("falRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoCandidate_scheduledPostId_key" ON "VideoCandidate"("scheduledPostId");

-- CreateIndex
CREATE INDEX "VideoCandidate_campaignId_idx" ON "VideoCandidate"("campaignId");

-- CreateIndex
CREATE INDEX "VideoCandidate_workspaceId_idx" ON "VideoCandidate"("workspaceId");

-- CreateIndex
CREATE INDEX "VideoCandidate_userId_idx" ON "VideoCandidate"("userId");

-- CreateIndex
CREATE INDEX "VideoCandidate_status_idx" ON "VideoCandidate"("status");

-- CreateIndex
CREATE INDEX "VideoCandidate_platform_idx" ON "VideoCandidate"("platform");

-- CreateIndex
CREATE INDEX "VideoCandidate_niche_idx" ON "VideoCandidate"("niche");

-- CreateIndex
CREATE INDEX "VideoCandidate_createdAt_idx" ON "VideoCandidate"("createdAt");

-- CreateIndex
CREATE INDEX "VideoCandidate_templateId_idx" ON "VideoCandidate"("templateId");

-- CreateIndex
CREATE INDEX "ContentItem_workspaceId_idx" ON "ContentItem"("workspaceId");

-- CreateIndex
CREATE INDEX "ContentItem_campaignId_idx" ON "ContentItem"("campaignId");

-- CreateIndex
CREATE INDEX "ContentItem_mediaType_idx" ON "ContentItem"("mediaType");

-- CreateIndex
CREATE INDEX "ContentItem_niche_idx" ON "ContentItem"("niche");

-- CreateIndex
CREATE INDEX "ContentItem_isTemplate_idx" ON "ContentItem"("isTemplate");

-- CreateIndex
CREATE INDEX "ContentItem_isTrending_idx" ON "ContentItem"("isTrending");

-- CreateIndex
CREATE INDEX "ContentItem_sourceType_idx" ON "ContentItem"("sourceType");

-- CreateIndex
CREATE INDEX "ContentItem_createdAt_idx" ON "ContentItem"("createdAt");

-- CreateIndex
CREATE INDEX "TrendingVideo_workspaceId_idx" ON "TrendingVideo"("workspaceId");

-- CreateIndex
CREATE INDEX "TrendingVideo_niche_idx" ON "TrendingVideo"("niche");

-- CreateIndex
CREATE INDEX "TrendingVideo_subNiche_idx" ON "TrendingVideo"("subNiche");

-- CreateIndex
CREATE INDEX "TrendingVideo_trendingScore_idx" ON "TrendingVideo"("trendingScore");

-- CreateIndex
CREATE INDEX "TrendingVideo_isActive_idx" ON "TrendingVideo"("isActive");

-- CreateIndex
CREATE INDEX "TrendingVideo_addedAt_idx" ON "TrendingVideo"("addedAt");

-- CreateIndex
CREATE INDEX "TrendingVideo_sourcePlatform_idx" ON "TrendingVideo"("sourcePlatform");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledPost_videoCandidateId_key" ON "ScheduledPost"("videoCandidateId");

-- CreateIndex
CREATE INDEX "ScheduledPost_workspaceId_idx" ON "ScheduledPost"("workspaceId");

-- CreateIndex
CREATE INDEX "ScheduledPost_userId_idx" ON "ScheduledPost"("userId");

-- CreateIndex
CREATE INDEX "ScheduledPost_socialAccountId_idx" ON "ScheduledPost"("socialAccountId");

-- CreateIndex
CREATE INDEX "ScheduledPost_status_idx" ON "ScheduledPost"("status");

-- CreateIndex
CREATE INDEX "ScheduledPost_scheduledFor_idx" ON "ScheduledPost"("scheduledFor");

-- CreateIndex
CREATE INDEX "ScheduledPost_platform_idx" ON "ScheduledPost"("platform");

-- CreateIndex
CREATE INDEX "ScheduledPost_platformPostId_idx" ON "ScheduledPost"("platformPostId");

-- CreateIndex
CREATE INDEX "ScheduledPost_contentItemId_idx" ON "ScheduledPost"("contentItemId");

-- CreateIndex
CREATE INDEX "ScheduledPost_videoCandidateId_idx" ON "ScheduledPost"("videoCandidateId");

-- CreateIndex
CREATE UNIQUE INDEX "PublishedPost_scheduledPostId_key" ON "PublishedPost"("scheduledPostId");

-- CreateIndex
CREATE INDEX "PublishedPost_workspaceId_idx" ON "PublishedPost"("workspaceId");

-- CreateIndex
CREATE INDEX "PublishedPost_socialAccountId_idx" ON "PublishedPost"("socialAccountId");

-- CreateIndex
CREATE INDEX "PublishedPost_platform_idx" ON "PublishedPost"("platform");

-- CreateIndex
CREATE INDEX "PublishedPost_platformPostId_idx" ON "PublishedPost"("platformPostId");

-- CreateIndex
CREATE INDEX "PublishedPost_publishedAt_idx" ON "PublishedPost"("publishedAt");

-- CreateIndex
CREATE INDEX "PostAnalytics_workspaceId_idx" ON "PostAnalytics"("workspaceId");

-- CreateIndex
CREATE INDEX "PostAnalytics_socialAccountId_idx" ON "PostAnalytics"("socialAccountId");

-- CreateIndex
CREATE INDEX "PostAnalytics_platform_idx" ON "PostAnalytics"("platform");

-- CreateIndex
CREATE INDEX "PostAnalytics_date_idx" ON "PostAnalytics"("date");

-- CreateIndex
CREATE INDEX "PostAnalytics_granularity_idx" ON "PostAnalytics"("granularity");

-- CreateIndex
CREATE UNIQUE INDEX "PostAnalytics_publishedPostId_date_granularity_key" ON "PostAnalytics"("publishedPostId", "date", "granularity");

-- CreateIndex
CREATE INDEX "AICharacter_workspaceId_idx" ON "AICharacter"("workspaceId");

-- CreateIndex
CREATE INDEX "AICharacter_isActive_idx" ON "AICharacter"("isActive");

-- CreateIndex
CREATE INDEX "AICharacter_isDefault_idx" ON "AICharacter"("isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_workspaceId_key" ON "Subscription"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "Subscription_workspaceId_idx" ON "Subscription"("workspaceId");

-- CreateIndex
CREATE INDEX "Subscription_stripeSubscriptionId_idx" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "Subscription_plan_idx" ON "Subscription"("plan");

-- CreateIndex
CREATE INDEX "CreditTransaction_userId_idx" ON "CreditTransaction"("userId");

-- CreateIndex
CREATE INDEX "CreditTransaction_workspaceId_idx" ON "CreditTransaction"("workspaceId");

-- CreateIndex
CREATE INDEX "CreditTransaction_type_idx" ON "CreditTransaction"("type");

-- CreateIndex
CREATE INDEX "CreditTransaction_createdAt_idx" ON "CreditTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_workspaceId_idx" ON "AuditLog"("workspaceId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
