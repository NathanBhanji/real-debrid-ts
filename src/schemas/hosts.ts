import { z } from 'zod';

// Schema for GET /hosts
export const hostInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string(),
});
export type HostInfo = z.infer<typeof hostInfoSchema>;

export const hostsResponseSchema = z.record(hostInfoSchema);
export type HostsResponse = z.infer<typeof hostsResponseSchema>;

// Schema for GET /hosts/status
export const competitorStatusSchema = z.object({
  status: z.enum(['up', 'down', 'unsupported']),
  check_time: z.string(),
});
export type CompetitorStatus = z.infer<typeof competitorStatusSchema>;

export const hostStatusSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string(),
  supported: z.number().int().min(0).max(1),
  status: z.enum(['up', 'down', 'unsupported']),
  check_time: z.string(),
  competitors_status: z.record(competitorStatusSchema),
});
export type HostStatus = z.infer<typeof hostStatusSchema>;

export const hostsStatusResponseSchema = z.record(hostStatusSchema);
export type HostsStatusResponse = z.infer<typeof hostsStatusResponseSchema>;

// Schema for GET /hosts/regex, GET /hosts/regexFolder
export const regexResponseSchema = z.array(z.string());
export type RegexResponse = z.infer<typeof regexResponseSchema>;

// Schema for GET /hosts/domains
export const domainsResponseSchema = z.array(z.string());
export type DomainsResponse = z.infer<typeof domainsResponseSchema>;
