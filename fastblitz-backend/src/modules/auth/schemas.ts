// src/modules/auth/schemas.ts
import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({ email: z.string().email(), password: z.string().min(8).max(128), name: z.string().min(1).max(100).optional() }),
});

export const loginSchema = z.object({
  body: z.object({ email: z.string().email(), password: z.string() }),
});

export const refreshSchema = z.object({
  body: z.object({ refreshToken: z.string().optional() }).optional(),
  cookies: z.object({ refreshToken: z.string().optional() }).optional(),
});

export const forgotPasswordSchema = z.object({
  body: z.object({ email: z.string().email() }),
});

export const resetPasswordSchema = z.object({
  body: z.object({ token: z.string(), password: z.string().min(8).max(128) }),
});

export const updateProfileSchema = z.object({
  body: z.object({ name: z.string().min(1).max(100).optional(), avatarUrl: z.string().url().optional() }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type RefreshInput = z.infer<typeof refreshSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>['body'];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body'];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];