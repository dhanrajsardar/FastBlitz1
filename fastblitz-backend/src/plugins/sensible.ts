// src/plugins/sensible.ts
import { FastifyInstance } from 'fastify';

export async function sensiblePlugin(app: any) {
  await app.register((await import('@fastify/sensible')).default, { errorHandler: false });
}