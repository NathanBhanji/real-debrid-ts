# Hosts

Real-Debrid offers a variety of endpoints to interact with supported hosters.

## GET /hosts

Get the list of supported hosters along with their current status.

### Return value

A map with hoster domain as key and hoster information as value.

```json
{
  "string": {
    // Host main domain
    "id": "string",
    "name": "string",
    "image": "string" // URL
  },
  "string": {
    "id": "string",
    "name": "string",
    "image": "string"
  }
}
```

## GET /hosts/status

Get the status of each hoster.

### Return value

A map with hoster domain as key and hoster status information as value.

```json
{
    "string": { // Host main domain
        "id": "string",
        "name": "string",
        "image": "string", // URL
        "supported": int, // 0 or 1
        "status": "string", // "up" / "down" / "unsupported"
        "check_time": "string", // jsonDate
        "competitors_status": {
            "string": { // Competitor domain
                "status": "string", // "up" / "down" / "unsupported"
                "check_time": "string" // jsonDate
            },
            "string": {
                "status": "string",
                "check_time": "string"
            },
            "string": {
                "status": "string",
                "check_time": "string"
            }
        }
    },
    "string": {
        "id": "string",
        "name": "string",
        "image": "string",
        "supported": int,
        "status": "string",
        "check_time": "string",
        "competitors_status": {
            "string": {
                "status": "string",
                "check_time": "string"
            },
            "string": {
                "status": "string",
                "check_time": "string"
            },
            "string": {
                "status": "string",
                "check_time": "string"
            }
        }
    }
}
```

## GET /hosts/regex

Get regular expressions to identify supported hosters.

### Return value

An array of regular expressions as strings.

```json
[
  "string", // RegExp
  "string",
  "string"
]
```

## GET /hosts/domains

Get the list of supported domains.

### Return value

An array of domain strings.

```json
[
  "string", // Domain
  "string",
  "string"
]
```

## GET /hosts/regexFolder

Get regular expressions to identify supported folders.

### Return value

An array of regular expressions as strings.

```json
[
  "string", // RegExp
  "string",
  "string"
]
```
