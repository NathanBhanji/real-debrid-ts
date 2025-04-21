# Downloads Endpoints

## GET /downloads

Get user downloads list.

### Parameters

No parameters mentioned in the documentation.

### Return value

```json
[
  {
    "id": "string",
    "filename": "string",
    "mimeType": "string", // Mime Type of the file, guessed by the file extension
    "filesize": 0, // bytes, 0 if unknown (integer)
    "link": "string", // Original link
    "host": "string", // Host main domain
    "chunks": 0, // Max Chunks allowed (integer)
    "download": "string", // Generated link
    "generated": "string" // jsonDate
  },
  {
    "id": "string",
    "filename": "string",
    "mimeType": "string",
    "filesize": 0,
    "link": "string",
    "host": "string",
    "chunks": 0,
    "download": "string",
    "generated": "string",
    "type": "string" // Type of the file (in general, its quality)
  }
]
```

### Possible HTTP error codes

Common error codes would likely include:
| HTTP Status Code | Reason |
| ---------------- | ---------------------------------- |
| 401 | Bad token (expired, invalid) |
| 403 | Permission denied (account locked) |
