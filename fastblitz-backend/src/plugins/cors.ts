// src/plugins/cors.ts
import { FastifyInstance } from 'fastify';
import { getEnv } from '../config';

const env = getEnv();

export async function corsPlugin(app: any) {
  await app.register((await import('@fastify/cors')).default, {
    origin: [env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    maxAge: 86400,
  });
}