# Unrestrict Endpoints

## POST /unrestrict/check

Check if a file is downloadable on the concerned hoster. This request does not require authentication.

### Parameters

| Type | Name     | Required | Description                                    |
| ---- | -------- | -------- | ---------------------------------------------- |
| POST | link     | Yes      | The original hoster link                       |
| POST | password | No       | Password to unlock the file access hoster side |

### Return value

```json
{
  "host": "string",
  "link": "string",
  "filename": "string",
  "filesize": 0,
  "supported": 0
}
```

### Possible HTTP error codes

| HTTP Status Code | Reason           |
| ---------------- | ---------------- |
| 503              | File unavailable |

## POST /unrestrict/link

Unrestrict a hoster link and get a new unrestricted link.

### Parameters

| Type | Name     | Required | Description                                                                          |
| ---- | -------- | -------- | ------------------------------------------------------------------------------------ |
| POST | link     | Yes      | The original hoster link                                                             |
| POST | password | No       | Password to unlock the file access hoster side                                       |
| POST | remote   | No       | 0 or 1, use Remote traffic, dedicated servers and account sharing protections lifted |

### Return value for a unique generated link

```json
{
  "id": "string",
  "filename": "string",
  "mimeType": "string",
  "filesize": 0,
  "link": "string",
  "host": "string",
  "chunks": 0,
  "crc": 0,
  "download": "string",
  "streamable": 0
}
```

### Return value for multiple generated links (ex Youtube)

```json
{
  "id": "string",
  "filename": "string",
  "filesize": 0,
  "link": "string",
  "host": "string",
  "chunks": 0,
  "crc": 0,
  "download": "string",
  "streamable": 0,
  "type": "string",
  "alternative": [
    {
      "id": "string",
      "filename": "string",
      "download": "string",
      "type": "string"
    },
    {
      "id": "string",
      "filename": "string",
      "download": "string",
      "type": "string"
    }
  ]
}
```

### Possible HTTP error codes

| HTTP Status Code | Reason                             |
| ---------------- | ---------------------------------- |
| 401              | Bad token (expired, invalid)       |
| 403              | Permission denied (account locked) |

## POST /unrestrict/folder

Unrestrict a hoster folder link and get individual links, returns an empty array if no links found.

### Parameters

| Type | Name | Required | Description            |
| ---- | ---- | -------- | ---------------------- |
| POST | link | Yes      | The hoster folder link |

### Return value

```json
[
  {
    "filename": "string",
    "link": "string",
    "size": 0
  },
  {
    "filename": "string",
    "link": "string",
    "size": 0
  }
]
```

### Possible HTTP error codes

| HTTP Status Code | Reason                             |
| ---------------- | ---------------------------------- |
| 401              | Bad token (expired, invalid)       |
| 403              | Permission denied (account locked) |

## PUT /unrestrict/containerFile

Decrypt a container file (RSDF, CCF, CCF3, DLC).

### Return value

```json
["string", "string", "string"]
```

### Possible HTTP error codes

| HTTP Status Code | Reason                                          |
| ---------------- | ----------------------------------------------- |
| 400              | Bad Request (see _error_ message)               |
| 401              | Bad token (expired, invalid)                    |
| 403              | Permission denied (account locked, not premium) |
| 503              | Service unavailable (see _error_ message)       |

## POST /unrestrict/containerLink

Decrypt a container file from a link.

### Parameters

| Type | Name | Required | Description                     |
| ---- | ---- | -------- | ------------------------------- |
| POST | link | Yes      | HTTP Link of the container file |

### Return value

```json
["string", "string", "string"]
```

### Possible HTTP error codes

| HTTP Status Code | Reason                                          |
| ---------------- | ----------------------------------------------- |
| 400              | Bad Request (see _error_ message)               |
| 401              | Bad token (expired, invalid)                    |
| 403              | Permission denied (account locked, not premium) |
| 503              | Service unavailable (see _error_ message)       |
