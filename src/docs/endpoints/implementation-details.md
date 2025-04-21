# Implementation Details

## API Base URL

The Base URL of the Rest API is: `https://api.real-debrid.com/rest/1.0/`

## General Requirements

- Methods are grouped by namespaces (e.g. "unrestrict", "user").
- Supported HTTP verbs are GET, POST, PUT, and DELETE. If your client does not support all HTTP verbs you can override the verb with _X-HTTP-Verb_ HTTP header.
- Unless specified otherwise in the method's documentation, all successful API calls return HTTP code 200 with a JSON object.
- Errors are returned with HTTP code 4XX or 5XX, a JSON object with properties "error" (an error message) and "error_code" (optional, an integer).
- Every string passed to and from the API needs to be UTF-8 encoded. For maximum compatibility, normalize to Unicode Normalization Form C (NFC) before UTF-8 encoding.
- The API sends ETag headers and supports the _If-None-Match_ header.
- Dates are formatted according to the Javascript method date.toJSON.
- Unless specified otherwise, all API methods require authentication.
- The API is limited to **250 requests per minute**, all refused requests will return HTTP 429 error and will count in the limit (bruteforcing will leave you blocked for undefined amount of time)

## Authentication

Authentication to the API is done through an OAuth2 bearer token in the Authorization HTTP header.

Example:

```
Authorization: Bearer YOUR_TOKEN
```

The token can be obtained by following the OAuth2 Device Authorization Flow (see the OAuth documentation file).

## Rate Limiting

The API is limited to 250 requests per minute per account. If this limit is reached, the API will return HTTP 429 (Too Many Requests).
