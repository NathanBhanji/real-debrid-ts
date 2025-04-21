import { z } from 'zod';

// Available setting names as documented in the API
export const settingNameSchema = z.enum([
  'download_port',
  'locale',
  'streaming_language_preference',
  'streaming_quality',
  'mobile_streaming_quality',
  'streaming_cast_audio_preference',
]);
export type SettingName = z.infer<typeof settingNameSchema>;

// Schema for GET /settings
export const userSettingsSchema = z.object({
  download_ports: z.array(z.string()),
  download_port: z.string(),
  locales: z.record(z.string()),
  locale: z.string(),
  streaming_qualities: z.array(z.string()),
  streaming_quality: z.string(),
  mobile_streaming_quality: z.string(),
  streaming_languages: z.record(z.string()),
  streaming_language_preference: z.string(),
  streaming_cast_audio: z.array(z.string()),
  streaming_cast_audio_preference: z.string(),
});
export type UserSettings = z.infer<typeof userSettingsSchema>;

export const getSettingsResponseSchema = userSettingsSchema;
export type GetSettingsResponse = z.infer<typeof getSettingsResponseSchema>;

// Schema for POST /settings/update
export const updateSettingParamsSchema = z.object({
  setting_name: settingNameSchema,
  setting_value: z.string(),
});
export type UpdateSettingParams = z.infer<typeof updateSettingParamsSchema>;

export const updateSettingResponseSchema = z.void();

// Schema for POST /settings/convertPoints
export const convertPointsResponseSchema = z.void();

// Schema for POST /settings/changePassword
export const changePasswordParamsSchema = z.object({
  password: z.string(),
  newPassword: z.string(),
});
export type ChangePasswordParams = z.infer<typeof changePasswordParamsSchema>;

export const changePasswordResponseSchema = z.void();

// Schema for PUT /settings/avatarFile
export const uploadAvatarParamsSchema = z.object({
  avatar: z.instanceof(File),
});
export type UploadAvatarParams = z.infer<typeof uploadAvatarParamsSchema>;

export const uploadAvatarResponseSchema = z.void();

// Schema for DELETE /settings/avatarDelete
export const deleteAvatarResponseSchema = z.void();
