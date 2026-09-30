// src/modules/auth/routes.ts
import { FastifyInstance } from 'fastify';
import { registerSchema, loginSchema, refreshSchema, forgotPasswordSchema, resetPasswordSchema, updateProfileSchema } from './schemas';
import * as authService from './service';
import { requirePermission } from '../../shared/middleware/auth';

export async function registerRoutes(app: any) {
  app.post('/auth/register', { schema: registerSchema }, async (request: any, reply: any) => {
    const result = await authService.registerUser(request.body);
    reply.setCookie('refreshToken', result.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000, path: '/' });
    return reply.status(201).send({ user: result.user, workspace: result.workspace, accessToken: result.accessToken });
  });

  app.post('/auth/login', { schema: loginSchema }, async (request: any, reply: any) => {
    const result = await authService.loginUser(request.body);
    reply.setCookie('refreshToken', result.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000, path: '/' });
    return reply.send({ user: result.user, workspace: result.workspace, accessToken: result.accessToken });
  });

  app.post('/auth/refresh', { schema: refreshSchema }, async (request: any, reply: any) => {
    const refreshToken = request.body?.refreshToken || request.cookies?.refreshToken;
    if (!refreshToken) return reply.status(401).send({ error: { code: 'MISSING_REFRESH_TOKEN', message: 'Refresh token required' } });
    const result = await authService.refreshTokens(refreshToken);
    reply.setCookie('refreshToken', result.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000, path: '/' });
    return reply.send({ accessToken: result.accessToken });
  });

  app.post('/auth/logout', { preHandler: [requirePermission('workspace:read')] }, async (request: any, reply: any) => {
    const refreshToken = request.cookies?.refreshToken;
    if (refreshToken) await authService.logoutUser(refreshToken);
    reply.clearCookie('refreshToken', { path: '/' });
    return reply.send({ success: true });
  });

  app.post('/auth/forgot-password', { schema: forgotPasswordSchema }, async (request: any, reply: any) => {
    return reply.send({ success: true, message: 'If the email exists, a reset link will be sent' });
  });

  app.post('/auth/reset-password', { schema: resetPasswordSchema }, async (request: any, reply: any) => {
    return reply.send({ success: true, message: 'Password reset successful' });
  });

  app.get('/auth/me', { preHandler: [requirePermission('workspace:read')] }, async (request: any, reply: any) => {
    const result = await authService.getMe(request.authUser!.id, request.authUser!.workspaceId);
    return reply.send(result);
  });

  app.patch('/auth/me', { schema: updateProfileSchema, preHandler: [requirePermission('workspace:read')] }, async (request: any, reply: any) => {
    const user = await app.prisma.user.update({ where: { id: request.authUser!.id }, data: request.body, select: { id: true, email: true, name: true, avatarUrl: true, role: true, plan: true, credits: true } });
    return reply.send({ user });
  });
}