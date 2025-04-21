# User Endpoints

## GET /user

Get current user info. Returns information on the current user.

### Parameters

None

### Return value

```json
{
  "id": 0, // Integer
  "username": "string",
  "email": "string",
  "points": 0, // Fidelity points (integer)
  "locale": "string", // User language
  "avatar": "string", // URL
  "type": "string", // "premium" or "free"
  "premium": 0, // seconds left as a Premium user (integer)
  "expiration": "string" // jsonDate
}
```

### Possible HTTP error codes

| HTTP Status Code | Reason                             |
| ---------------- | ---------------------------------- |
| 401              | Bad token (expired, invalid)       |
| 403              | Permission denied (account locked) |
