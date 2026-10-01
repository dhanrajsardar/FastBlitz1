// src/modules/social/crypto.ts
import crypto from 'crypto';
import { getEnv } from '../../config';

const env = getEnv();
const ALGORITHM = 'aes-256-gcm';

// We assume ENCRYPTION_KEY is a 32-byte string or base64
function getKey(): Buffer {
  if (!env.ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable must be set in production for securely storing social tokens.');
  }

  if (env.ENCRYPTION_KEY.length === 32) {
    return Buffer.from(env.ENCRYPTION_KEY, 'utf-8');
  }

  const buf = Buffer.from(env.ENCRYPTION_KEY, 'base64');
  if (buf.length === 32) {
    return buf;
  }

  throw new Error('ENCRYPTION_KEY must be exactly 32 bytes (either raw string or base64 decoded).');
}

/**
 * SecretManager Interface abstracts how tokens are stored and retrieved.
 * For enterprise scalability, this can be swapped with AWS KMS or HashiCorp Vault.
 */
export interface SecretManager {
  encrypt(text: string): Promise<string>;
  decrypt(encryptedText: string): Promise<string>;
}

export class LocalAESSecretManager implements SecretManager {
  async encrypt(text: string): Promise<string> {
    const iv = crypto.randomBytes(16);
    const key = getKey();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    // Format: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  async decrypt(encryptedText: string): Promise<string> {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      // Maybe it wasn't encrypted (legacy data)? Just return it or handle error
      return encryptedText;
    }

    const [ivHex, authTagHex, dataHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = getKey();

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(dataHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}

// Global instance to use throughout the app.
// Can easily be replaced by VaultSecretManager in the future.
export const secretManager = new LocalAESSecretManager();

// Backwards compatibility wrappers
export async function encryptToken(text: string): Promise<string> {
  return secretManager.encrypt(text);
}

export async function decryptToken(encryptedText: string): Promise<string> {
  return secretManager.decrypt(encryptedText);
}
