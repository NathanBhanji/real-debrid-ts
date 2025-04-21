import { z } from 'zod';

export const torrentStatusSchema = z.enum([
  'magnet_error',
  'magnet_conversion',
  'waiting_files_selection',
  'queued',
  'downloading',
  'downloaded',
  'error',
  'virus',
  'compressing',
  'uploading',
  'dead',
]);
export type TorrentStatus = z.infer<typeof torrentStatusSchema>;

export const getTorrentsParamsSchema = z
  .object({
    offset: z.number().optional(),
    page: z.number().optional(),
    limit: z.number().min(0).max(5000).optional(),
    filter: z.literal('active').optional(),
  })
  .refine((data) => !(data.offset !== undefined && data.page !== undefined), {
    message: 'Cannot use both offset and page parameters',
  });
export type GetTorrentsParams = z.infer<typeof getTorrentsParamsSchema>;

export const torrentFileSchema = z.object({
  id: z.number(),
  path: z.string(),
  bytes: z.number(),
  selected: z.union([z.literal(0), z.literal(1)]),
});
export type TorrentFile = z.infer<typeof torrentFileSchema>;

export const torrentListItemSchema = z.object({
  id: z.string(),
  filename: z.string(),
  hash: z.string(),
  bytes: z.number(),
  host: z.string(),
  split: z.number(),
  progress: z.number(),
  status: torrentStatusSchema,
  added: z.string(),
  links: z.array(z.string()),
  ended: z.string().optional(),
  speed: z.number().optional(),
  seeders: z.number().optional(),
});
export type TorrentListItem = z.infer<typeof torrentListItemSchema>;

export const getTorrentsResponseSchema = z.array(torrentListItemSchema);
export type TorrentsList = z.infer<typeof getTorrentsResponseSchema>;

export const getTorrentInfoParamsSchema = z.object({
  id: z.string(),
});
export type GetTorrentInfoParams = z.infer<typeof getTorrentInfoParamsSchema>;

export const torrentInfoSchema = torrentListItemSchema.extend({
  original_filename: z.string(),
  original_bytes: z.number(),
  files: z.array(torrentFileSchema),
});
export type TorrentInfo = z.infer<typeof torrentInfoSchema>;

export const getTorrentInfoResponseSchema = z.array(torrentInfoSchema);
export type GetTorrentInfoResponse = z.infer<typeof getTorrentInfoResponseSchema>;

export const activeTorrentsCountResponseSchema = z.object({
  nb: z.number(),
  limit: z.number(),
});
export type ActiveTorrentsCount = z.infer<typeof activeTorrentsCountResponseSchema>;

export const availableHostSchema = z.object({
  host: z.string(),
  max_file_size: z.number(),
});
export type AvailableHost = z.infer<typeof availableHostSchema>;

export const availableHostsResponseSchema = z.array(availableHostSchema);
export type AvailableHosts = z.infer<typeof availableHostsResponseSchema>;

export const addTorrentParamsSchema = z.object({
  host: z.string().optional(),
  torrent: z.instanceof(File),
});
export type AddTorrentParams = z.infer<typeof addTorrentParamsSchema>;

export const addTorrentResponseSchema = z.object({
  id: z.string(),
  uri: z.string(),
});
export type AddTorrentResponse = z.infer<typeof addTorrentResponseSchema>;

export const addMagnetParamsSchema = z.object({
  magnet: z.string(),
  host: z.string().optional(),
});
export type AddMagnetParams = z.infer<typeof addMagnetParamsSchema>;

export const addMagnetResponseSchema = z.object({
  id: z.string(),
  uri: z.string(),
});
export type AddMagnetResponse = z.infer<typeof addMagnetResponseSchema>;

export const selectFilesParamsSchema = z.object({
  id: z.string(),
  files: z.string(),
});
export type SelectFilesParams = z.infer<typeof selectFilesParamsSchema>;

export const selectFilesResponseSchema = z.void();

export const deleteTorrentParamsSchema = z.object({
  id: z.string(),
});
export type DeleteTorrentParams = z.infer<typeof deleteTorrentParamsSchema>;
