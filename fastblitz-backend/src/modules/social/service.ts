// src/modules/social/service.ts
import { prisma } from '../../config';
import { encryptToken, decryptToken } from './crypto';

// Minimal mock for social OAuth
// In a real app, you would use axios to exchange `code` with the respective platform API
// e.g. TikTok API, Instagram Graph API, etc.

export async function generateAuthUrl(platform: string, redirectUri: string) {
  // Generate platform-specific OAuth URLs
  if (platform === 'TIKTOK') {
    return `https://www.tiktok.com/v2/auth/authorize/?client_key=MOCK&response_type=code&scope=user.info.basic,video.upload&redirect_uri=${redirectUri}&state=state`;
  } else if (platform === 'INSTAGRAM') {
    return `https://api.instagram.com/oauth/authorize?client_id=MOCK&redirect_uri=${redirectUri}&scope=user_profile,user_media&response_type=code`;
  }
  // Default mock URL
  return `https://mock-oauth.example.com/auth?platform=${platform}&redirect_uri=${redirectUri}`;
}

export async function handleOAuthCallback(workspaceId: string, platform: string, code: string) {
  // Mock exchange token
  // Real implementation would POST to platform's /oauth/access_token

  const mockAccessToken = `mock_access_token_${platform}_${Date.now()}`;
  const mockRefreshToken = `mock_refresh_token_${platform}_${Date.now()}`;
  const mockAccountId = `acc_${platform}_${Date.now()}`;

  const encryptedAccess = await encryptToken(mockAccessToken);
  const encryptedRefresh = await encryptToken(mockRefreshToken);

  const account = await prisma.socialAccount.upsert({
    where: {
      workspaceId_platform_platformAccountId: {
        workspaceId,
        platform,
        platformAccountId: mockAccountId
      }
    },
    update: {
      accessToken: encryptedAccess,
      refreshToken: encryptedRefresh,
      tokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60), // 60 days
      isActive: true
    },
    create: {
      workspaceId,
      platform,
      platformAccountId: mockAccountId,
      username: `Mock User ${platform}`,
      accessToken: encryptedAccess,
      refreshToken: encryptedRefresh,
      tokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
      isActive: true
    }
  });

  return account;
}

export async function listAccounts(workspaceId: string) {
  const accounts = await prisma.socialAccount.findMany({
    where: { workspaceId }
  });

  // Don't expose tokens to client!
  return accounts.map(a => ({
    id: a.id,
    platform: a.platform,
    username: a.username,
    profileImageUrl: a.profileImageUrl,
    isActive: a.isActive,
    lastSyncedAt: a.lastSyncedAt
  }));
}

export async function deleteAccount(workspaceId: string, accountId: string) {
  return prisma.socialAccount.deleteMany({
    where: {
      id: accountId,
      workspaceId
    }
  });
}
