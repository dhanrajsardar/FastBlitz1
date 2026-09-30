// src/shared/utils/helpers.ts
import { randomBytes } from 'crypto';

export function generateId(): string { return randomBytes(16).toString('hex'); }
export function generateShortId(length = 8): string { const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; let result = ''; const bytes = randomBytes(length); for (let i = 0; i < length; i++) { result += chars[bytes[i] % chars.length]; } return result; }
export function sleep(ms: number): Promise<void> { return new Promise(resolve => setTimeout(resolve, ms)); }
export async function retry<T>(fn: () => Promise<T>, retries = 3, delay = 1000, backoff = 2): Promise<T> { try { return await fn(); } catch (err) { if (retries === 0) throw err; await sleep(delay); return retry(fn, retries - 1, delay * backoff, backoff); } }
export function chunkArray<T>(array: T[], size: number): T[][] { const chunks: T[][] = []; for (let i = 0; i < array.length; i += size) { chunks.push(array.slice(i, i + size)); } return chunks; }
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> { const result = {} as Pick<T, K>; for (const key of keys) { if (key in obj) result[key] = obj[key]; } return result; }
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> { const result = { ...obj }; for (const key of keys) delete result[key]; return result; }
export function isEmpty(obj: unknown): boolean { if (obj === null || obj === undefined) return true; if (typeof obj === 'string') return obj.trim() === ''; if (Array.isArray(obj)) return obj.length === 0; if (typeof obj === 'object') return Object.keys(obj).length === 0; return false; }
export function deepClone<T>(obj: T): T { return JSON.parse(JSON.stringify(obj)); }
export function formatBytes(bytes: number): string { if (bytes === 0) return '0 Bytes'; const k = 1024; const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']; const i = Math.floor(Math.log(bytes) / Math.log(k)); return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]; }
export function formatDuration(seconds: number): string { const hours = Math.floor(seconds / 3600); const minutes = Math.floor((seconds % 3600) / 60); const secs = seconds % 60; if (hours > 0) return `${hours}h ${minutes}m ${secs}s`; if (minutes > 0) return `${minutes}m ${secs}s`; return `${secs}s`; }