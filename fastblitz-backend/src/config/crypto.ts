// src/config/crypto.ts
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import { getEnv } from './env';

const env: any = getEnv();

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

function deriveKey(password: string, salt: Buffer): Buffer {
  return scryptSync(password, salt, KEY_LENGTH);
}

export function encrypt(text: string): string {
  const masterKey = env.ENCRYPTION_KEY;
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);
  const key = deriveKey(masterKey, salt);

  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [salt, iv, tag, encrypted].map(b => b.toString('base64')).join(':');
}

export function decrypt(encryptedData: string): string {
  const masterKey = env.ENCRYPTION_KEY;
  const parts = encryptedData.split(':');
  if (parts.length !== 4) throw new Error('Invalid encrypted data format');

  const [saltB64, ivB64, tagB64, encryptedB64] = parts;
  const salt = Buffer.from(saltB64, 'base64');
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const encrypted = Buffer.from(encryptedB64, 'base64');

  const key = deriveKey(masterKey, salt);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

export function hashToken(token: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateSecureToken(length = 32): string {
  return randomBytes(length).toString('hex');
}