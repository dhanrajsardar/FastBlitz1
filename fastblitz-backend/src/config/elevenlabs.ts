// src/config/elevenlabs.ts
import { getEnv } from './env';
const { OpenAI } = require('openai');

const env: any = getEnv();
const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export async function generateTTS(text: string, voice: string = 'nova'): Promise<Buffer> {
  const response = await openai.audio.speech.create({ model: 'tts-1', voice, input: text });
  return Buffer.from(await response.arrayBuffer());
}