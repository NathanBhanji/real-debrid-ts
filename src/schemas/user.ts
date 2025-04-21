import { z } from 'zod';

/**
 * User account type
 */
export const userTypeSchema = z.enum(['premium', 'free']);

/**
 * Schema for User information from GET /user endpoint
 */
export const userInfoSchema = z.object({
  id: z.number().int(),
  username: z.string(),
  email: z.string().email(),
  points: z.number().int().nonnegative(), // Fidelity points
  locale: z.string(), // User language
  avatar: z.string().url(), // Avatar URL
  type: userTypeSchema, // "premium" or "free"
  premium: z.number().int().nonnegative(), // seconds left as a Premium user
  expiration: z.string(), // jsonDate format
});

export type UserInfo = z.infer<typeof userInfoSchema>;

export const userInfoResponseSchema = userInfoSchema;

/**
 * Schema for GET /time endpoint
 */
export const timeResponseSchema = z.string();

/**
 * Schema for GET /time/iso endpoint
 */
export const timeIsoResponseSchema = z.string();
