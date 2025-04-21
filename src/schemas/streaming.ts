import { z } from 'zod';

/**
 * Schema for streaming quality formats
 * The quality keys (e.g., "480p", "720p", "1080p") are examples and may vary
 */
export const streamingQualitySchema = z.record(z.string(), z.string());

/**
 * Schema for transcoding links response from GET /streaming/transcode/{id}
 */
export const transcodingLinksResponseSchema = z.object({
  apple: streamingQualitySchema.optional(), // M3U8 Live Streaming format
  dash: streamingQualitySchema.optional(), // MPD Live Streaming format
  liveMP4: streamingQualitySchema.optional(), // Live MP4
  h264WebM: streamingQualitySchema.optional(), // Live H264 WebM
});

export type TranscodingLinks = z.infer<typeof transcodingLinksResponseSchema>;

/**
 * Schema for video stream details
 */
export const videoStreamSchema = z.object({
  stream: z.string(),
  lang: z.string(), // Language in plain text (ex "English", "French")
  lang_iso: z.string(), // Language in iso_639 (ex fre, eng)
  codec: z.string(), // Codec of the video (ex "h264", "divx")
  colorspace: z.string(), // Colorspace of the video (ex "yuv420p")
  width: z.number().int().positive(), // Width of the video (ex 1980)
  height: z.number().int().positive(), // Height of the video (ex 1080)
});

/**
 * Schema for audio stream details
 */
export const audioStreamSchema = z.object({
  stream: z.string(),
  lang: z.string(), // Language in plain text (ex "English", "French")
  lang_iso: z.string(), // Language in iso_639 (ex fre, eng)
  codec: z.string(), // Codec of the audio (ex "aac", "mp3")
  sampling: z.number().int().positive(), // Audio sampling rate
  channels: z.number().positive(), // Number of channels (ex 2, 5.1, 7.1)
});

/**
 * Schema for subtitle details
 */
export const subtitleStreamSchema = z.object({
  stream: z.string(),
  lang: z.string(), // Language in plain text (ex English, French)
  lang_iso: z.string(), // Language in iso_639 (ex fre, eng)
  type: z.string(), // Format of subtitles (ex "ASS" / "SRT")
});

/**
 * Schema for media details response from GET /streaming/mediaInfos/{id}
 */
export const mediaInfoResponseSchema = z.object({
  filename: z.string(), // Cleaned filename
  hoster: z.string(), // File hosted on
  link: z.string(), // Original content link
  type: z.enum(['movie', 'show', 'audio']), // Media type
  season: z.string().nullable(), // Season number if found, else null
  episode: z.string().nullable(), // Episode number if found, else null
  year: z.string().nullable(), // Release year if found, else null
  duration: z.number(), // Media duration in seconds (float)
  bitrate: z.number().int(), // Bitrate of the media file
  size: z.number().int(), // Original filesize in bytes
  details: z.object({
    video: z.record(z.string(), videoStreamSchema).optional(),
    audio: z.record(z.string(), audioStreamSchema).optional(),
    subtitles: z.record(z.string(), subtitleStreamSchema).optional(),
  }),
  poster_path: z.string().optional(), // URL of the poster image if found
  audio_image: z.string().optional(), // URL of the music image in HD if found
  backdrop_path: z.string().optional(), // URL of the backdrop image if found
});

export type MediaInfo = z.infer<typeof mediaInfoResponseSchema>;
