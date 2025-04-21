import { z } from 'zod';

/**
 * Schema for /device/code response
 */
export const deviceCodeResponseSchema = z.object({
  device_code: z.string(),
  user_code: z.string(),
  verification_url: z.string(),
  expires_in: z.number().int().positive(),
  interval: z.number().int().positive(),
});

export type DeviceCodeResponse = z.infer<typeof deviceCodeResponseSchema>;

/**
 * Schema for /device/credentials response
 */
export const deviceCredentialsResponseSchema = z.object({
  client_id: z.string(),
  client_secret: z.string(),
});

export type DeviceCredentialsResponse = z.infer<typeof deviceCredentialsResponseSchema>;

/**
 * OAuth grant types
 */
export const grantTypeSchema = z.enum([
  'http://oauth.net/grant_type/device/1.0',
  'authorization_code',
  'password',
  'refresh_token',
  'twofactor',
]);

export type GrantType = z.infer<typeof grantTypeSchema>;

/**
 * Schema for /token response
 */
export const tokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string().default('Bearer'),
  expires_in: z.number().int().positive(),
  refresh_token: z.string(),
  scope: z.string().optional(),
});

export type TokenResponse = z.infer<typeof tokenResponseSchema>;

/**
 * Schema for /disable_access_token response
 * Returns HTTP 204 with no content
 */
export const disableAccessTokenResponseSchema = z.void();

/**
 * Schema for two-factor authentication error response
 */
export const twoFactorErrorResponseSchema = z.object({
  verification_url: z.string(),
  twofactor_code: z.string(),
  error: z.literal('twofactor_auth_needed'),
  error_code: z.literal(11),
});

export type TwoFactorErrorResponse = z.infer<typeof twoFactorErrorResponseSchema>;

/**
 * Schema for getDeviceCode parameters
 */
export const deviceCodeParamsSchema = z.object({
  client_id: z.string(),
  new_credentials: z.enum(['yes', 'no']).optional(),
});

/**
 * Schema for getCredentials parameters
 */
export const deviceCredentialsParamsSchema = z.object({
  client_id: z.string(),
  code: z.string(),
});

/**
 * Schema for getToken parameters
 */
export const tokenParamsSchema = z.object({
  client_id: z.string(),
  client_secret: z.string(),
  code: z.string(),
  redirect_uri: z.string().url().optional(),
  grant_type: z.string(),
});

/**
 * Schema for refreshToken parameters
 */
export const refreshTokenParamsSchema = z.object({
  client_id: z.string(),
  client_secret: z.string(),
  refresh_token: z.string(),
  grant_type: z.string(),
});
