# Traffic Endpoints

## GET /traffic

Get traffic information for limited hosters (limits, current usage, extra packages).

### Parameters

None

### Return value

```json
{
  "string": {
    // Host main domain
    "left": 0, // Available bytes / links to use (integer)
    "bytes": 0, // Bytes downloaded (integer)
    "links": 0, // Links unrestricted (integer)
    "limit": 0, // Integer
    "type": "string", // "links", "gigabytes", "bytes"
    "extra": 0, // Additional traffic / links the user may have buy (integer)
    "reset": "string" // "daily", "weekly" or "monthly"
  },
  "string": {
    "left": 0,
    "bytes": 0,
    "links": 0,
    "limit": 0,
    "type": "string",
    "extra": 0,
    "reset": "string"
  }
}
```

### Possible HTTP error codes

| HTTP Status Code | Reason                             |
| ---------------- | ---------------------------------- |
| 401              | Bad token (expired, invalid)       |
| 403              | Permission denied (account locked) |

## GET /traffic/details

Get traffic details on each hoster used during a defined period.

### Parameters

| Type | Name  | Required | Description                                    |
| ---- | ----- | -------- | ---------------------------------------------- |
| GET  | start | No       | Start period, default: a week ago (YYYY-MM-DD) |
| GET  | end   | No       | End period, default: today (YYYY-MM-DD)        |

**Warning:** The period cannot exceed 31 days.

### Return value

```json
{
  "YYYY-MM-DD": {
    "host": {
      // By Host main domain
      "string": 0, // bytes downloaded on concerned host (integer)
      "string": 0,
      "string": 0,
      "string": 0,
      "string": 0,
      "string": 0
    },
    "bytes": 0 // Total downloaded (in bytes) this day (integer)
  },
  "YYYY-MM-DD": {
    "host": {
      "string": 0,
      "string": 0,
      "string": 0,
      "string": 0,
      "string": 0
    },
    "bytes": 0
  }
}
```

### Possible HTTP error codes

| HTTP Status Code | Reason                             |
| ---------------- | ---------------------------------- |
| 401              | Bad token (expired, invalid)       |
| 403              | Permission denied (account locked) |
