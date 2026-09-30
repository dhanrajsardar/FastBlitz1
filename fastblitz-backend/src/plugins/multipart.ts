// src/plugins/multipart.ts
import { FastifyInstance } from 'fastify';

export async function multipartPlugin(app: any) {
  await app.register((await import('@fastify/multipart')).default, {
    limits: { fileSize: 100 * 1024 * 1024, files: 10 },
  });
}