// src/shared/queue/index.ts
import { Queue, Worker, Job } from 'bullmq';
import { getRedisClient } from '../../config';

export const QUEUE_NAMES = {
  CAMPAIGN_SCRAPE: 'campaign:scrape',
  CAMPAIGN_ANALYZE: 'campaign:analyze',
  CAMPAIGN_IDEAS: 'campaign:ideas',
  CAMPAIGN_GENERATE: 'campaign:generate',
  PUBLISHING_POST: 'publishing:post',
  PUBLISHING_RETRY: 'publishing:retry',
  ANALYTICS_COLLECT: 'analytics:collect',
  ANALYTICS_SYNC: 'analytics:sync',
  SOCIAL_TOKEN_REFRESH: 'social:token-refresh',
  TRENDING_UPDATE: 'trending:update',
  CREDITS_DAILY_RESET: 'credits:daily-reset',
} as const;

export type QueueName = typeof QUEUE_NAMES[keyof typeof QUEUE_NAMES];

const queues = new Map<string, Queue>();

export async function getQueue<T>(name: string): Promise<Queue<T>> {
  if (queues.has(name)) return queues.get(name)! as Queue<T>;
  const redis = await (await import('../../config')).getRedisClient();
  const queue = new Queue<T>(name, { connection: redis, defaultJobOptions: { removeOnComplete: 100, removeOnFail: 50, attempts: 3, backoff: { type: 'exponential', delay: 2000 } } });
  queues.set(name, queue);
  return queue;
}

export async function closeAllQueues(): Promise<void> {
  await Promise.all(Array.from(queues.values()).map(q => q.close()));
  queues.clear();
}

let workers: Worker[] = [];

export async function createWorker<T>(name: string, processor: (job: Job<T>) => Promise<any>, options?: { concurrency?: number; limiter?: { max: number; duration: number } }): Promise<Worker<T>> {
  const redis = await (await import('../../config')).getRedisClient();
  const worker = new Worker<T>(name, processor, { connection: redis, concurrency: options?.concurrency ?? 5, limiter: options?.limiter, maxStalledCount: 2, stalledInterval: 30000 });
  worker.on('failed', (job: any, err: any) => console.error(`Job failed: ${job?.name} (${job?.id})`, err));
  worker.on('completed', (job: any) => console.log(`Job completed: ${job.name} (${job.id})`));
  workers.push(worker);
  return worker;
}

export async function shutdownAllWorkers(): Promise<void> {
  await Promise.all(workers.map(w => w.close()));
  workers.length = 0;
}