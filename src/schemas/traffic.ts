import { z } from 'zod';
import { dateFormats, dateRangeRefinement } from './common';

/**
 * Schema for traffic host information
 */
export const trafficHostSchema = z.object({
  left: z.number().int().nonnegative(), // Available bytes / links to use
  bytes: z.number().int().nonnegative(), // Bytes downloaded
  links: z.number().int().nonnegative(), // Links unrestricted
  limit: z.number().int().nonnegative(), // Limit in bytes or links
  type: z.enum(['links', 'gigabytes', 'bytes']), // Type of limit
  extra: z.number().int().nonnegative(), // Additional traffic / links the user may have bought
  reset: z.enum(['daily', 'weekly', 'monthly']), // Reset period
});

export type TrafficHost = z.infer<typeof trafficHostSchema>;

/**
 * Schema for traffic endpoint response
 * Keys are host domain names
 */
export const trafficResponseSchema = z.record(z.string(), trafficHostSchema);

export type Traffic = z.infer<typeof trafficResponseSchema>;

/**
 * Schema for traffic/details host information per day
 * Keys are host domain names, values are bytes downloaded
 */
export const trafficHostDailySchema = z.record(z.string(), z.number().int().nonnegative());

/**
 * Schema for traffic details daily entry
 */
export const trafficDetailsDaySchema = z.object({
  host: trafficHostDailySchema, // By Host main domain
  bytes: z.number().int().nonnegative(), // Total downloaded (in bytes) this day
});

export type TrafficDetailDay = z.infer<typeof trafficDetailsDaySchema>;

/**
 * Schema for traffic/details endpoint response
 * Keys are dates in YYYY-MM-DD format
 */
export const trafficDetailsResponseSchema = z.record(z.string(), trafficDetailsDaySchema);

export type TrafficDetails = z.infer<typeof trafficDetailsResponseSchema>;

/**
 * Schema for traffic/details request parameters
 * - start: Start date in YYYY-MM-DD format
 * - end: End date in YYYY-MM-DD format
 * The period cannot exceed 31 days
 */
export const trafficDetailsParamsSchema = z
  .object({
    start: z.string().regex(dateFormats.dateOnly).optional(),
    end: z.string().regex(dateFormats.dateOnly).optional(),
  })
  .refine(
    (data) => {
      if (!data.start || !data.end) return true;
      return dateRangeRefinement(data.start, data.end);
    },
    { message: 'Date range cannot exceed 31 days' }
  );
