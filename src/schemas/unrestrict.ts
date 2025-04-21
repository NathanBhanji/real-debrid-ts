import { z } from 'zod';

/**
 * Schema for unrestrict/check response
 */
export const unrestrictCheckSchema = z.object({
  host: z.string(), // Host main domain
  link: z.string(),
  filename: z.string(),
  filesize: z.number().int().nonnegative(), // Filesize in bytes, 0 if unknown
  supported: z.number().int(), // Whether file is supported (1) or not (0)
});

export type UnrestrictCheck = z.infer<typeof unrestrictCheckSchema>;

/**
 * Schema for single link from unrestrict/link response
 */
export const unrestrictLinkSingleSchema = z.object({
  id: z.string(),
  filename: z.string(),
  mimeType: z.string(), // Mime Type of the file, guessed by the file extension
  filesize: z.number().int().nonnegative(), // Filesize in bytes, 0 if unknown
  link: z.string(), // Original link
  host: z.string(), // Host main domain
  chunks: z.number().int(), // Max Chunks allowed
  crc: z.number().int(), // Disable / enable CRC check
  download: z.string(), // Generated link
  streamable: z.number().int(), // Is the file streamable on website
  generated: z.string().optional(), // jsonDate, only present in downloads endpoint
  type: z.string().optional(), // Type of the file (in general, its quality)
});

export type UnrestrictLinkSingle = z.infer<typeof unrestrictLinkSingleSchema>;

/**
 * Schema for alternative links in unrestrict/link response
 */
export const unrestrictLinkAlternativeSchema = z.object({
  id: z.string(),
  filename: z.string(),
  download: z.string(),
  type: z.string(),
});

export type UnrestrictLinkAlternative = z.infer<typeof unrestrictLinkAlternativeSchema>;

/**
 * Schema for multiple links from unrestrict/link response
 */
export const unrestrictLinkMultipleSchema = unrestrictLinkSingleSchema.extend({
  type: z.string(), // Type of the file (in general, its quality)
  alternative: z.array(unrestrictLinkAlternativeSchema),
});

export type UnrestrictLinkMultiple = z.infer<typeof unrestrictLinkMultipleSchema>;

/**
 * Combined schema for unrestrict/link response (handles both single and multiple links)
 */
export const unrestrictLinkResponseSchema = z.union([
  unrestrictLinkSingleSchema,
  unrestrictLinkMultipleSchema,
]);

export type UnrestrictLinkResponse = z.infer<typeof unrestrictLinkResponseSchema>;

/**
 * Schema for folder item in unrestrict/folder response
 */
export const unrestrictFolderItemSchema = z.object({
  filename: z.string(),
  link: z.string(), // URL to the file
  size: z.number().int().nonnegative(), // File size in bytes
});

export type UnrestrictFolderItem = z.infer<typeof unrestrictFolderItemSchema>;

/**
 * Schema for unrestrict/folder response
 */
export const unrestrictFolderResponseSchema = z.array(unrestrictFolderItemSchema);

export type UnrestrictFolderResponse = z.infer<typeof unrestrictFolderResponseSchema>;

/**
 * Schema for container file responses (both containerFile and containerLink)
 */
export const unrestrictContainerResponseSchema = z.array(z.string());

export type UnrestrictContainerResponse = z.infer<typeof unrestrictContainerResponseSchema>;

// Request parameter schemas
export const unrestrictLinkParamsSchema = z.object({
  link: z.string(),
  password: z.string().optional(),
  remote: z.union([z.literal(0), z.literal(1)]).optional(),
});

export const unrestrictFolderParamsSchema = z.object({
  link: z.string(),
});

export const unrestrictCheckParamsSchema = z.object({
  link: z.string(),
  password: z.string().optional(),
});

export const unrestrictContainerLinkParamsSchema = z.object({
  link: z.string(),
});
