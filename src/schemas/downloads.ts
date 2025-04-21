import { z } from 'zod';

/**
 * Schema for download item in GET /downloads response
 */
export const downloadItemSchema = z.object({
  id: z.string(),
  filename: z.string(),
  mimeType: z.string(), // Mime Type of the file, guessed by the file extension
  filesize: z.number().int().nonnegative(), // bytes, 0 if unknown
  link: z.string(), // Original link
  host: z.string(), // Host main domain
  chunks: z.number().int().nonnegative(), // Max Chunks allowed
  download: z.string(), // Generated link
  generated: z.string(), // jsonDate
  type: z.string().optional(), // Type of the file (quality)
});

export type DownloadItem = z.infer<typeof downloadItemSchema>;

/**
 * Schema for GET /downloads parameters
 */
export const getDownloadsParamsSchema = z
  .object({
    offset: z.number().int().min(0).optional(),
    page: z.number().int().min(1).optional(),
    limit: z.number().int().min(0).max(5000).default(100).optional(),
  })
  .refine((data) => !(data.offset !== undefined && data.page !== undefined), {
    message: 'Cannot use both offset and page parameters',
  });

/**
 * Schema for GET /downloads response
 */
export const getDownloadsResponseSchema = z.array(downloadItemSchema);

export type Downloads = z.infer<typeof getDownloadsResponseSchema>;

/**
 * Schema for DELETE /downloads/{id} parameters
 */
export const deleteDownloadParamsSchema = z.object({
  id: z.string(),
});

/**
 * Schema for DELETE /downloads/{id} response
 */
export const deleteDownloadResponseSchema = z.void();
