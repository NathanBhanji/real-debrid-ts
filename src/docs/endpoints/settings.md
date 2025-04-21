# Settings

The settings endpoints allow users to retrieve and update their account settings.

## GET /settings

Get current user settings.

### Return value

A JSON object containing all user settings.

```json
{
  "download_ports": [
    // Possible "download_port" value to update settings
    "string",
    "string"
  ],
  "download_port": "string", // Current user download port
  "locales": {
    // Possible "locale" value to update settings
    "string": "string",
    "string": "string"
  },
  "locale": "string", // Current user locale
  "streaming_qualities": [
    // Possible "streaming_quality" value to update settings
    "string",
    "string",
    "string",
    "string"
  ],
  "streaming_quality": "string", // Current user streaming quality
  "mobile_streaming_quality": "string", // Current user streaming quality on mobile devices
  "streaming_languages": {
    // Possible "streaming_language_preference" value to update settings
    "string": "string",
    "string": "string"
  },
  "streaming_language_preference": "string", // Current user streaming language preference
  "streaming_cast_audio": [
    // Possible "streaming_cast_audio_preference" value to update settings
    "string",
    "string"
  ],
  "streaming_cast_audio_preference": "string" // Current user audio preference on Google Cast devices
}
```

## POST /settings/update

Update a specific setting.

### Parameters

| Name          | Type   | Description                       |
| ------------- | ------ | --------------------------------- |
| setting_name  | string | The name of the setting to update |
| setting_value | string | The new value for the setting     |

Available setting names:

- `download_port`
- `locale`
- `streaming_language_preference`
- `streaming_quality`
- `mobile_streaming_quality`
- `streaming_cast_audio_preference`

### Return value

No content (HTTP 204).

## POST /settings/convertPoints

Convert fidelity points to premium days.

### Return value

No content (HTTP 204).

## POST /settings/changePassword

Change the user's password.

### Parameters

| Name        | Type   | Description      |
| ----------- | ------ | ---------------- |
| password    | string | Current password |
| newPassword | string | New password     |

### Return value

No content (HTTP 204).

## PUT /settings/avatarFile

Update the user's avatar.

### Parameters

| Name   | Type | Description      |
| ------ | ---- | ---------------- |
| avatar | File | The avatar image |

### Return value

No content (HTTP 204).

## DELETE /settings/avatarDelete

Delete the user's avatar.

### Return value

No content (HTTP 204).
