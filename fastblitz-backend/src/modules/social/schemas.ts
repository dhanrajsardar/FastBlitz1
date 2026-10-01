// src/modules/social/schemas.ts
import { Type } from '@sinclair/typebox';

export const connectSocialSchema = {
  body: Type.Object({
    platform: Type.String(),
    redirectUri: Type.String(),
  }),
};

export const callbackSocialSchema = {
  body: Type.Object({
    platform: Type.String(),
    code: Type.String(),
    redirectUri: Type.String(),
  }),
};

export const deleteAccountSchema = {
  params: Type.Object({
    accountId: Type.String(),
  }),
};
