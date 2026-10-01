// src/modules/scheduling/schemas.ts
import { Type } from '@sinclair/typebox';

export const listCardsSchema = {
  querystring: Type.Object({
    limit: Type.Optional(Type.Number({ default: 10 })),
    campaignId: Type.Optional(Type.String()),
  }),
};

export const actionCardSchema = {
  body: Type.Object({
    videoId: Type.String(),
    action: Type.Union([Type.Literal('APPROVE'), Type.Literal('REJECT')]),
    accountId: Type.Optional(Type.String()), // Required if APPROVE
    scheduledFor: Type.Optional(Type.String({ format: 'date-time' })), // Optional, if empty will schedule immediately
    caption: Type.Optional(Type.String()),
    hashtags: Type.Optional(Type.Array(Type.String())),
  }),
};

export const listScheduleSchema = {
  querystring: Type.Object({
    status: Type.Optional(Type.String()),
    startDate: Type.Optional(Type.String({ format: 'date-time' })),
    endDate: Type.Optional(Type.String({ format: 'date-time' })),
  }),
};

export const updateScheduleSchema = {
  params: Type.Object({
    id: Type.String(),
  }),
  body: Type.Object({
    scheduledFor: Type.Optional(Type.String({ format: 'date-time' })),
    caption: Type.Optional(Type.String()),
    hashtags: Type.Optional(Type.Array(Type.String())),
    status: Type.Optional(Type.Union([Type.Literal('DRAFT'), Type.Literal('SCHEDULED'), Type.Literal('CANCELLED')])),
  }),
};

export const publishNowSchema = {
  params: Type.Object({
    id: Type.String(),
  }),
};
