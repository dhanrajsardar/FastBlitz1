// src/config/fal.ts
import { fal } from '@fal-ai/client';
import { getEnv } from './env';

const env: any = getEnv();

if (env.FAL_API_KEY) {
  fal.config({ credentials: env.FAL_API_KEY });
}

export const FAL_MODELS = {
  kling: { id: 'fal-ai/kling-video/v1.6/pro', name: 'Kling 1.6 Pro', maxDuration: 10, costPerSecond: 0.05, bestFor: ['realistic', 'human', 'cinematic'], aspectRatios: ['9:16', '16:9', '1:1'] },
  'runway-gen3': { id: 'fal-ai/runway-gen3/turbo', name: 'Runway Gen-3 Turbo', maxDuration: 10, costPerSecond: 0.04, bestFor: ['artistic', 'abstract', 'fast-motion'], aspectRatios: ['9:16', '16:9', '1:1'] },
  'luma-ray-2': { id: 'fal-ai/luma-ray-2', name: 'Luma Ray 2', maxDuration: 5, costPerSecond: 0.03, bestFor: ['smooth-motion', 'camera-moves'], aspectRatios: ['9:16', '16:9', '1:1'] },
} as const;

export type FalModelId = keyof typeof FAL_MODELS;

export interface FalVideoInput {
  prompt: string;
  image_url?: string;
  duration: number;
  aspect_ratio: '9:16' | '16:9' | '1:1';
  callback_url?: string;
}

export interface FalVideoOutput {
  video_url: string;
  request_id: string;
  status: 'completed' | 'failed';
  error?: string;
}

export async function submitVideoGeneration(
  modelId: keyof typeof FAL_MODELS,
  input: FalVideoInput
): Promise<{ request_id: string }> {
  if (!env.FAL_API_KEY) throw new Error('FAL_API_KEY not configured');
  const model = FAL_MODELS[modelId];
  const result = await fal.queue.submit(model.id, { ...input, callback_url: input.callback_url || `${env.API_URL}/webhooks/fal` });
  return { request_id: result.request_id };
}

export async function checkVideoStatus(requestId: string): Promise<any> {
  if (!env.FAL_API_KEY) throw new Error('FAL_API_KEY not configured');
  return fal.queue.status('fal-ai/kling-video/v1.6/pro', { requestId: requestId, logs: true });
}

export async function getVideoResult(requestId: string): Promise<any> {
  if (!env.FAL_API_KEY) throw new Error('FAL_API_KEY not configured');
  return fal.queue.result('fal-ai/kling-video/v1.6/pro', { requestId: requestId });
}

export { fal };