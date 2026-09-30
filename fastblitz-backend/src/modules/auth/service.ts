// src/modules/auth/service.ts
import { prisma } from '../../config';
import { hash, verify } from 'argon2';
import jwt from 'jsonwebtoken';
import { getEnv } from '../../config';
import { AuthenticationError, ConflictError, NotFoundError } from '../../shared/errors';
import { v4 as uuidv4 } from 'uuid';

const env = getEnv();

export interface AccessTokenPayload {
  sub: string;
  workspaceId: string;
  role: string;
  permissions: string[];
  type: 'access';
  iat: number;
  exp: number;
  jti: string;
}

export interface RefreshTokenPayload {
  sub: string;
  workspaceId: string;
  type: 'refresh';
  iat: number;
  exp: number;
  jti: string;
  family: string;
}

const ROLE_PERMISSIONS: Record<string, string[]> = {
  OWNER: ['workspace:read', 'workspace:update', 'workspace:delete', 'workspace:settings', 'members:invite', 'members:update', 'members:remove', 'social:connect', 'social:disconnect', 'social:manage', 'campaigns:create', 'campaigns:read', 'campaigns:delete', 'campaigns:regenerate', 'generation:create', 'generation:read', 'blitz:swipe', 'blitz:read', 'schedule:create', 'schedule:read', 'schedule:update', 'schedule:delete', 'schedule:publish', 'posts:read', 'posts:retry', 'analytics:read', 'billing:read', 'billing:manage', 'library:read', 'library:write', 'library:delete'],
  ADMIN: ['workspace:read', 'workspace:update', 'workspace:settings', 'members:invite', 'members:update', 'members:remove', 'social:connect', 'social:disconnect', 'social:manage', 'campaigns:create', 'campaigns:read', 'campaigns:regenerate', 'generation:create', 'generation:read', 'blitz:swipe', 'blitz:read', 'schedule:create', 'schedule:read', 'schedule:update', 'schedule:delete', 'schedule:publish', 'posts:read', 'posts:retry', 'analytics:read', 'library:read', 'library:write', 'library:delete'],
  MEMBER: ['workspace:read', 'social:connect', 'campaigns:create', 'campaigns:read', 'campaigns:regenerate', 'generation:create', 'generation:read', 'blitz:swipe', 'blitz:read', 'schedule:create', 'schedule:read', 'schedule:update', 'schedule:delete', 'schedule:publish', 'posts:read', 'posts:retry', 'analytics:read', 'library:read', 'library:write'],
  VIEWER: ['workspace:read', 'campaigns:read', 'generation:read', 'blitz:read', 'schedule:read', 'posts:read', 'analytics:read', 'library:read'],
};

export function getPermissionsForRole(role: string): string[] {
  return ROLE_PERMISSIONS[role] || [];
}

export async function createAccessToken(userId: string, workspaceId: string, role: string): Promise<string> {
  const payload = { sub: userId, workspaceId, role, permissions: getPermissionsForRole(role), type: 'access', jti: uuidv4() };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRY, algorithm: 'RS256' });
}

export async function createRefreshToken(userId: string, workspaceId: string, family: string): Promise<string> {
  const payload = { sub: userId, workspaceId, type: 'refresh', jti: uuidv4(), family };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRY, algorithm: 'RS256' });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try { return jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: ['RS256'] }) as AccessTokenPayload; }
  catch { throw new Error('Invalid access token'); }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try { return jwt.verify(token, env.JWT_REFRESH_SECRET, { algorithms: ['RS256'] }) as RefreshTokenPayload; }
  catch { throw new Error('Invalid refresh token'); }
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, { type: 2, memoryCost: 2 ** 16, timeCost: 3, parallelism: 1 });
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try { return await verify(hash, password); } catch { return false; }
}

export async function registerUser(data: { email: string; password: string; name?: string }) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error('Email already registered');

  const passwordHash = await hashPassword(data.password);
  const result = await prisma.$transaction(async (tx: any) => {
    const user = await tx.user.create({ data: { email: data.email, passwordHash, name: data.name, role: 'OWNER', plan: 'FREE', credits: 10 } });
    const slug = await generateUniqueSlug(data.name || 'workspace', tx);
    const workspace = await tx.workspace.create({ data: { name: `${data.name || 'User'}'s Workspace`, slug, ownerId: user.id, plan: 'FREE' } });
    await tx.workspaceMember.create({ data: { workspaceId: workspace.id, userId: user.id, role: 'OWNER' } });
    await tx.subscription.create({ data: { workspaceId: workspace.id, stripeCustomerId: `cus_${user.id}`, stripeSubscriptionId: `sub_free_${user.id}`, stripePriceId: 'price_free', stripeCurrentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), status: 'ACTIVE', plan: 'FREE', creditsIncluded: 10, swipeLimit: 10 } });
    return { user, workspace };
  });

  const family = uuidv4();
  const accessToken = await createAccessToken(result.user.id, result.workspace.id, 'OWNER');
  const refreshToken = await createRefreshToken(result.user.id, result.workspace.id, family);
  return { user: result.user, workspace: result.workspace, accessToken, refreshToken };
}

export async function loginUser(data: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user || !user.passwordHash) throw new Error('Invalid email or password');
  const valid = await verifyPassword(user.passwordHash, data.password);
  if (!valid) throw new Error('Invalid email or password');

  const membership = await prisma.workspaceMember.findFirst({ where: { userId: user.id }, include: { workspace: true }, orderBy: { joinedAt: 'asc' } });
  if (!membership) throw new Error('No workspace found');

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  const family = uuidv4();
  const accessToken = await createAccessToken(user.id, membership.workspaceId, membership.role);
  const refreshToken = await createRefreshToken(user.id, membership.workspaceId, family);
  return { user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl, role: membership.role, plan: user.plan, credits: user.credits }, workspace: { id: membership.workspace.id, name: membership.workspace.name, slug: membership.workspace.slug, plan: membership.workspace.plan }, accessToken, refreshToken };
}

export async function refreshTokens(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken);
  const membership = await prisma.workspaceMember.findUnique({ where: { workspaceId_userId: { workspaceId: payload.workspaceId, userId: payload.sub } } });
  if (!membership) throw new Error('Workspace access revoked');

  const newFamily = uuidv4();
  const accessToken = await createAccessToken(payload.sub, payload.workspaceId, membership.role);
  const newRefreshToken = await createRefreshToken(payload.sub, payload.workspaceId, newFamily);
  return { accessToken, refreshToken: newRefreshToken };
}

export async function logoutUser(refreshToken: string) { verifyRefreshToken(refreshToken); return { success: true }; }

export async function getMe(userId: string, workspaceId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, name: true, avatarUrl: true, role: true, plan: true, credits: true, swipesUsedToday: true, lastSwipeReset: true, createdAt: true } });
  if (!user) throw new Error('User not found');
  const membership = await prisma.workspaceMember.findUnique({ where: { workspaceId_userId: { workspaceId, userId } }, include: { workspace: true } });
  if (!membership) throw new Error('Workspace membership not found');
  return { user, workspace: membership.workspace, role: membership.role };
}

async function generateUniqueSlug(name: string, tx: any): Promise<string> {
  let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  let counter = 1; const original = slug;
  while (true) { const existing = await tx.workspace.findUnique({ where: { slug } }); if (!existing) break; slug = `${original}-${counter++}`; }
  return slug;
}