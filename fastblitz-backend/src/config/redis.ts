// src/config/redis.ts
import { getEnv } from './env';

const env: any = getEnv();

let redisClient: any = null;

export async function getRedisClient(): Promise<any> {
  if (redisClient?.isOpen) return redisClient;

  const { createClient } = await import('redis');
  redisClient = createClient({ url: env.REDIS_URL, socket: { reconnectStrategy: (retries: number) => Math.min(retries * 100, 3000) } });

  redisClient.on('error', (err: Error) => console.error('Redis Client Error:', err));
  redisClient.on('connect', () => console.log('Redis connected'));
  redisClient.on('reconnecting', () => console.log('Redis reconnecting...'));

  await redisClient.connect();
  return redisClient;
}

export async function closeRedis(): Promise<void> {
  if (redisClient?.isOpen) { await redisClient.quit(); redisClient = null; }
}

export { redisClient };