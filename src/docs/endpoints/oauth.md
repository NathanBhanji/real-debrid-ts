# OAuth Endpoints

The OAuth authentication process follows the Device Code Flow and has three main endpoints.

## Base URL

The base URL for OAuth endpoints:

```
https://api.real-debrid.com/oauth/v2
```

## GET /device/code

Get initial device authentication data.

### Parameters

| Type | Name            | Required | Description                              |
| ---- | --------------- | -------- | ---------------------------------------- |
| GET  | client_id       | Yes      | Your application's client ID             |
| GET  | new_credentials | Yes      | Set to "yes" to generate new credentials |

### Return value

```json
{
  "device_code": "string",
  "user_code": "string",
  "interval": 0,
  "expires_in": 0,
  "verification_url": "string"
}
```

## GET /device/credentials

Get client credentials after user authentication.

### Parameters

| Type | Name      | Required | Description                        |
| ---- | --------- | -------- | ---------------------------------- |
| GET  | client_id | Yes      | Your application's client ID       |
| GET  | code      | Yes      | The device_code from previous step |

### Return value

```json
{
  "client_id": "string",
  "client_secret": "string"
}
```

## POST /token

Get access and refresh tokens.

### Parameters

| Type | Name          | Required | Description                                  |
| ---- | ------------- | -------- | -------------------------------------------- |
| POST | client_id     | Yes      | The client_id from credentials endpoint      |
| POST | client_secret | Yes      | The client_secret from credentials endpoint  |
| POST | code          | Yes      | The device_code from first step              |
| POST | grant_type    | Yes      | Use "http://oauth.net/grant_type/device/1.0" |

### Return value

```json
{
  "access_token": "string",
  "expires_in": 0,
  "token_type": "Bearer",
  "refresh_token": "string"
}
```

## Refresh Token Process

### POST /token (for refresh)

Get a new access token using a refresh token.

### Parameters

| Type | Name          | Required | Description                                  |
| ---- | ------------- | -------- | -------------------------------------------- |
| POST | client_id     | Yes      | Your client_id                               |
| POST | client_secret | Yes      | Your client_secret                           |
| POST | code          | Yes      | The refresh_token value                      |
| POST | grant_type    | Yes      | Use "http://oauth.net/grant_type/device/1.0" |

### Return value

```json
{
  "access_token": "string",
  "expires_in": 0,
  "token_type": "Bearer",
  "refresh_token": "string"
}
```
