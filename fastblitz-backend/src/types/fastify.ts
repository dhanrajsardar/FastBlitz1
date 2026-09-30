// src/types/fastify.ts
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Platform, PostStatus, ContentStatus, UserRole, SubscriptionPlan, MediaType, JobStatus, CampaignStatus, CreditTransactionType, SubscriptionStatus } from './prisma';

declare module 'fastify' {
  interface FastifyRequest {
    authUser?: { id: string; email: string; workspaceId: string; role: string; permissions: string[] };
    workspace?: { id: string; plan: string; slug: string };
    prisma: any;
    validate<T>(schema: any): T;
  }

  interface FastifyReply {
    setCookie(name: string, value: string, options?: { httpOnly?: boolean; secure?: boolean; sameSite?: 'lax' | 'strict' | 'none'; maxAge?: number; path?: string }): this;
    clearCookie(name: string, options?: { path?: string }): this;
  }

  interface FastifyInstance {
    prisma: any;
    io: any;
    config: { FRONTEND_URL: string };
  }
}