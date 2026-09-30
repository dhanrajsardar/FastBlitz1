// src/shared/middleware/auth.ts
import { FastifyInstance } from 'fastify';
import { getEnv } from '../../config';

const env = getEnv();

export async function authMiddleware(app: any) {
  app.addHook('preHandler', async (request: any, reply: any) => {
    const publicPaths = ['/health', '/ready', '/api/v1/auth/register', '/api/v1/auth/login', '/api/v1/auth/refresh', '/api/v1/auth/forgot-password', '/api/v1/auth/reset-password', '/api/v1/social/callback/', '/api/v1/webhooks/'];
    const isPublic = publicPaths.some(path => request.url.startsWith(path));
    if (isPublic) return;

    const authHeader = request.headers.authorization;
    const token = authHeader?.replace('Bearer ', '') || request.cookies?.accessToken;

    if (!token) {
      return reply.status(401).send({ error: { code: 'AUTHENTICATION_ERROR', message: 'Access token required' } });
    }

    try {
      const decoded = await request.jwtVerify(token);
      if (decoded.type !== 'access') throw new Error('Invalid token type');

      const { prisma } = app;
      const membership = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId: decoded.workspaceId, userId: decoded.sub } },
        include: { workspace: true, user: true },
      });

      if (!membership || !membership.user) throw new Error('User not found in workspace');

      request.authUser = { id: membership.user.id, email: membership.user.email, workspaceId: membership.workspaceId, role: membership.role, permissions: decoded.permissions };
      request.workspace = { id: membership.workspace.id, plan: membership.workspace.plan, slug: membership.workspace.slug };
    } catch (err) {
      return reply.status(401).send({ error: { code: 'AUTHENTICATION_ERROR', message: 'Invalid or expired token' } });
    }
  });
}

export function requirePermission(permission: string) {
  return async (request: any, reply: any) => {
    if (!request.authUser?.permissions?.includes(permission)) {
      return reply.status(403).send({ error: { code: 'AUTHORIZATION_ERROR', message: `Permission required: ${permission}` } });
    }
  };
}

export function requireRole(...roles: string[]) {
  return async (request: any, reply: any) => {
    if (!request.authUser || !roles.includes(request.authUser.role)) {
      return reply.status(403).send({ error: { code: 'AUTHORIZATION_ERROR', message: `Role required: ${roles.join(' or ')}` } });
    }
  };
}