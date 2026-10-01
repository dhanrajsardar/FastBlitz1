// src/modules/analytics/schemas.ts
import { Type } from '@sinclair/typebox';

export const analyticsOverviewSchema = {
  querystring: Type.Object({
    startDate: Type.Optional(Type.String({ format: 'date-time' })),
    endDate: Type.Optional(Type.String({ format: 'date-time' })),
  }),
};

export const analyticsPostsSchema = {
  querystring: Type.Object({
    page: Type.Optional(Type.Number({ default: 1 })),
    limit: Type.Optional(Type.Number({ default: 20 })),
    platform: Type.Optional(Type.String()),
  }),
};
