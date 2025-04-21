# Streaming Endpoints

## GET /streaming/transcode/{id}

Get transcoding links for given file, {id} from /downloads or /unrestrict/link

### Parameters

| Type | Name | Required | Description                                 |
| ---- | ---- | -------- | ------------------------------------------- |
| PATH | id   | Yes      | File ID from /downloads or /unrestrict/link |

### Return value

```json
{
  "apple": {
    // M3U8 Live Streaming format
    "480p": "string",
    "720p": "string",
    "1080p": "string"
  },
  "dash": {
    // MPD Live Streaming format
    "480p": "string",
    "720p": "string",
    "1080p": "string"
  },
  "liveMP4": {
    // Live MP4
    "480p": "string",
    "720p": "string",
    "1080p": "string"
  },
  "h264WebM": {
    // Live H264 WebM
    "480p": "string",
    "720p": "string",
    "1080p": "string"
  }
}
```

Note: The quality keys (480p, 720p, 1080p) are examples and may vary based on the available transcoding options for each file.

### Possible HTTP error codes

| HTTP Status Code | Reason                             |
| ---------------- | ---------------------------------- |
| 401              | Bad token (expired, invalid)       |
| 403              | Permission denied (account locked) |

## GET /streaming/mediaInfos/{id}

Get detailed media information for given file, {id} from /downloads or /unrestrict/link

### Parameters

| Type | Name | Required | Description                                 |
| ---- | ---- | -------- | ------------------------------------------- |
| PATH | id   | Yes      | File ID from /downloads or /unrestrict/link |

### Return value

```json
{
    "filename": "string", // Cleaned filename
    "hoster": "string", // File hosted on
    "link": "string", // Original content link
    "type": "string", // "movie" / "show" / "audio"
    "season": "string", // if found, else null
    "episode": "string", // if found, else null
    "year": "string", // if found, else null
    "duration": 0.0, // media duration in seconds (float)
    "bitrate": 0, // birate of the media file (integer)
    "size": 0, // original filesize in bytes (integer)
    "details": {
        "video": {
            "und1": { // if available, lang in iso_639 followed by a number ID
                "stream": "string",
                "lang": "string", // Language in plain text (ex "English", "French")
                "lang_iso": "string", // Language in iso_639 (ex fre, eng)
                "codec": "string", // Codec of the video (ex "h264", "divx")
                "colorspace": "string", // Colorspace of the video (ex "yuv420p")
                "width": 0, // Width of the video (ex 1980) (integer)
                "height": 0 // Height of the video (ex 1080) (integer)
            }
        },
        "audio": {
            "und1": { // if available, lang in iso_639 followed by a number ID
                "stream": "string",
                "lang": "string", // Language in plain text (ex "English", "French")
                "lang_iso": "string", // Language in iso_639 (ex fre, eng)
                "codec": "string", // Codec of the audio (ex "aac", "mp3")
                "sampling": 0, // Audio sampling rate (integer)
                "channels": 0.0 // Number of channels (ex 2, 5.1, 7.1) (float)
            }
        },
        "subtitles": [
            "und1": { // if available, lang in iso_639 followed by a number ID
                "stream": "string",
                "lang": "string", // Language in plain text (ex English, French)
                "lang_iso": "string", // Language in iso_639 (ex fre, eng)
                "type": "string" // Format of subtitles (ex "ASS" / "SRT")
            }
        ]
    },
    "poster_path": "string", // URL of the poster image if found / available
    "audio_image": "string", // URL of the music image in HD if found / available
    "backdrop_path": "string" // URL of the backdrop image if found / available
}
```

### Possible HTTP error codes

| HTTP Status Code | Reason                                                      |
| ---------------- | ----------------------------------------------------------- |
| 401              | Bad token (expired, invalid)                                |
| 403              | Permission denied (account locked)                          |
| 503              | Service unavailable (problem finding metadata of the media) |
