// src/config/s3.ts
import { S3Client, PutObjectCommand, GetObjectCommand, HeadBucketCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getEnv } from './env';

const env: any = getEnv();

let s3Client: any = null;

export function getS3Client(): any {
  if (s3Client) return s3Client;

  const endpoint = env.R2_ACCOUNT_ID ? `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : env.R2_PUBLIC_URL?.replace('/fastblitz', '') || 'http://localhost:9000';

  s3Client = new S3Client({ region: 'auto', endpoint, credentials: { accessKeyId: env.R2_ACCESS_KEY_ID || 'minioadmin', secretAccessKey: env.R2_SECRET_ACCESS_KEY || 'minioadmin' } });
  return s3Client;
}

export async function checkBucketExists(): Promise<boolean> {
  try { const client = getS3Client(); await client.send(new HeadBucketCommand({ Bucket: env.R2_BUCKET })); return true; } catch { return false; }
}

export interface PresignedUploadResult { uploadUrl: string; cdnUrl: string; key: string; }

export async function getPresignedUploadUrl(key: string, contentType: string, expiresIn = 3600): Promise<PresignedUploadResult> {
  const client = getS3Client();
  const command = new PutObjectCommand({ Bucket: env.R2_BUCKET, Key: key, ContentType: contentType });
  const uploadUrl = await getSignedUrl(client, command, { expiresIn });
  const cdnUrl = `${env.R2_PUBLIC_URL || `http://localhost:9000/${env.R2_BUCKET}`}/${key}`;
  return { uploadUrl, cdnUrl, key };
}

export async function uploadBuffer(key: string, buffer: Buffer, contentType: string, cacheControl = 'public, max-age=31536000, immutable'): Promise<string> {
  const client = getS3Client();
  await client.send(new PutObjectCommand({ Bucket: env.R2_BUCKET, Key: key, Body: buffer, ContentType: contentType, CacheControl: cacheControl }));
  return `${env.R2_PUBLIC_URL || `http://localhost:9000/${env.R2_BUCKET}`}/${key}`;
}

export async function downloadBuffer(key: string): Promise<Buffer> {
  const client = getS3Client();
  const response = await client.send(new GetObjectCommand({ Bucket: env.R2_BUCKET, Key: key }));
  const chunks: Uint8Array[] = []; for await (const chunk of response.Body as any) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export async function deleteObject(key: string): Promise<void> {
  const client = getS3Client();
  await client.send(new DeleteObjectCommand({ Bucket: env.R2_BUCKET, Key: key }));
}

export function generateStorageKey(workspaceId: string, type: string, filename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = filename.split('.').pop() || 'bin';
  return `workspaces/${workspaceId}/${type}/${timestamp}-${random}.${ext}`;
}