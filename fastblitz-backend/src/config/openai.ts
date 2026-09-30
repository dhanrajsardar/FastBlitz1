import { OpenAI } from 'openai';
import { getEnv } from './env';

const env: any = getEnv();

export const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({ model: 'text-embedding-3-small', input: text });
  return response.data[0].embedding;
}