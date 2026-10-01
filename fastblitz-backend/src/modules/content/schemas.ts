// src/modules/content/schemas.ts
import { Type } from '@sinclair/typebox';

export const listTrendingSchema = {
  querystring: Type.Object({
    page: Type.Optional(Type.Number({ default: 1 })),
    limit: Type.Optional(Type.Number({ default: 20 })),
    niche: Type.Optional(Type.String()),
    tag: Type.Optional(Type.String()),
  }),
};
