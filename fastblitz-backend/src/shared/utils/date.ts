// src/shared/utils/date.ts
import { z } from 'zod';
import { format, startOfDay, endOfDay, addDays, subDays, parseISO } from 'date-fns';

export const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;

export function formatForAPI(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
}

export function formatDateOnly(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function getDayBounds(date: Date): { start: Date; end: Date } {
  return { start: startOfDay(date), end: endOfDay(date) };
}

export function parseISOOrNow(dateString?: string): Date {
  if (!dateString) return new Date();
  try { return parseISO(dateString); } catch { return new Date(); }
}

export const zDateString = z.string().refine((val) => ISO_DATE_REGEX.test(val), { message: 'Invalid date format, expected ISO 8601' });