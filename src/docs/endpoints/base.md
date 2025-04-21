# Base Endpoints

The Base URL of the Rest API is: https://api.real-debrid.com/rest/1.0/

## GET /disable_access_token

Disable current access token, returns 204 HTTP code.

### Parameters

None

### Return value

None

### Possible HTTP error codes

| HTTP Status Code | Reason                       |
| ---------------- | ---------------------------- |
| 401              | Bad token (expired, invalid) |

## GET /time

Get server time, raw data returned. This request does not require authentication.

### Parameters

None

### Return value

Y-m-d H:i:s (string)

## GET /time/iso

Get server time in ISO, raw data returned. This request does not require authentication.

### Parameters

None

### Return value

Y-m-dTH:i:sO (string)
