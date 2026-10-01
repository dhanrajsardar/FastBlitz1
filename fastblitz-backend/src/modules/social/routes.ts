// src/modules/social/routes.ts
import { FastifyInstance } from 'fastify';
import { requirePermission } from '../../shared/middleware/auth';
import * as socialService from './service';
import { connectSocialSchema, callbackSocialSchema, deleteAccountSchema } from './schemas';

export async function registerRoutes(app: any) {
  app.post('/social/connect', { schema: connectSocialSchema, preHandler: [requirePermission('workspace:read')] }, async (request: any, reply: any) => {
    const { platform, redirectUri } = request.body;
    const url = await socialService.generateAuthUrl(platform, redirectUri);
    return reply.send({ url });
  });

  app.post('/social/callback', { schema: callbackSocialSchema, preHandler: [requirePermission('workspace:read')] }, async (request: any, reply: any) => {
    const { platform, code } = request.body;
    const account = await socialService.handleOAuthCallback(request.workspace.id, platform, code);
    return reply.send({ success: true, accountId: account.id });
  });

  app.get('/social/accounts', { preHandler: [requirePermission('workspace:read')] }, async (request: any, reply: any) => {
    const accounts = await socialService.listAccounts(request.workspace.id);
    return reply.send({ accounts });
  });

  app.delete('/social/accounts/:accountId', { schema: deleteAccountSchema, preHandler: [requirePermission('workspace:read')] }, async (request: any, reply: any) => {
    await socialService.deleteAccount(request.workspace.id, request.params.accountId);
    return reply.send({ success: true });
  });
}
