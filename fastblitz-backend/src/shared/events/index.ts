// src/shared/events/index.ts
import { EventEmitter } from 'events';

export interface CampaignProgressEvent { campaignId: string; stage: string; progress: number; message: string; totalVideos?: number; completedVideos?: number; }
export interface BlitzCardsReadyEvent { campaignId: string; count: number; cards: any[]; }
export interface BlitzCardUpdateEvent { candidateId: string; status: string; reviewedBy: string; reviewedAt: Date; scheduledPostId?: string; rejectionReason?: string; }
export interface ScheduleUpdateEvent { postId: string; status: string; platformPostId?: string; platformUrl?: string; error?: string; publishedAt?: Date; }
export interface AnalyticsUpdateEvent { postId: string; metrics: any; }
export interface NotificationEvent { userId: string; workspaceId: string; type: string; title: string; message: string; actionUrl?: string; }

export class TypedEventEmitter extends EventEmitter {
  emit<K extends string>(event: K, data: any): boolean { return super.emit(event, data); }
  on<K extends string>(event: K, listener: (data: any) => void): this { return super.on(event, listener); }
  once<K extends string>(event: K, listener: (data: any) => void): this { return super.once(event, listener); }
  off<K extends string>(event: K, listener: (data: any) => void): this { return super.off(event, listener); }
}

export const eventEmitter = new TypedEventEmitter();

export function emitCampaignProgress(data: CampaignProgressEvent) { eventEmitter.emit('campaign:progress', data); }
export function emitBlitzCardsReady(data: BlitzCardsReadyEvent) { eventEmitter.emit('blitz:cards-ready', data); }
export function emitBlitzCardUpdate(data: BlitzCardUpdateEvent) { eventEmitter.emit('blitz:card-update', data); }
export function emitScheduleUpdate(data: ScheduleUpdateEvent) { eventEmitter.emit('schedule:update', data); }
export function emitAnalyticsUpdate(data: AnalyticsUpdateEvent) { eventEmitter.emit('analytics:update', data); }
export function emitNotification(data: NotificationEvent) { eventEmitter.emit('notification', data); }