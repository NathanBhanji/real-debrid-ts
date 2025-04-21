# real-debrid-ts

A TypeScript SDK for the Real Debrid API.

## Installation

```bash
pnpm add real-debrid-ts
```

## Usage

```typescript
import { RealDebridClient } from 'real-debrid-ts';

// Create a client
const client = new RealDebridClient('your-client-id', 'your-client-secret');

// You MUST authenticate before making any API calls
// Get a device code for authentication
const deviceCodeResponse = await client.getDeviceCode();
console.log(`Visit: ${deviceCodeResponse.verification_url}`);
console.log(`Enter the code: ${deviceCodeResponse.user_code}`);

// After the user authenticates, get the credentials and token
const credentialsResponse = await client.getCredentials(deviceCodeResponse.device_code);
const tokenResponse = await client.getToken(deviceCodeResponse.device_code);

// Make API calls
const userInfo = await client.getUser();
const downloads = await client.getDownloads({ limit: 10 });
const torrents = await client.getTorrents({ filter: 'active' });
const unrestrictedLink = await client.unrestrictLink('https://example.com/file');
```

## Authentication

**Important**: You must authenticate the client before making any API calls. The SDK will throw an error if you attempt to make authenticated requests without setting tokens first.

The SDK supports different authentication flows:

1. **Device Code Flow**

   ```typescript
   // Get a device code
   const deviceCodeResponse = await client.getDeviceCode();

   // Display the verification URL and code to the user
   console.log(`Visit: ${deviceCodeResponse.verification_url}`);
   console.log(`Enter the code: ${deviceCodeResponse.user_code}`);

   // After user authenticates, get credentials and token
   const credentials = await client.getCredentials(deviceCodeResponse.device_code);
   const tokenResponse = await client.getToken(deviceCodeResponse.device_code);

   // Set the tokens
   client.setTokens(tokenResponse.access_token, tokenResponse.refresh_token);
   ```

2. **Using Existing Tokens**

   ```typescript
   // Create client with existing tokens
   const client = RealDebridClient.fromExistingAuth(
     'your-client-id',
     'your-client-secret',
     'your-access-token',
     'your-refresh-token'
   );
   ```

3. **Web Auth Flow**

   ```typescript
   // After redirecting back from Real-Debrid with a code
   const tokenResponse = await client.getToken(code, redirectUri);
   client.setTokens(tokenResponse.access_token, tokenResponse.refresh_token);
   ```

## Examples

### Working with Torrents

#### Adding a Torrent File

```typescript
// Add a torrent file with an optional host
const torrentFile = new File(
  [
    /* torrent data */
  ],
  'example.torrent'
);
const result = await client.addTorrent(torrentFile);
console.log(`Torrent added with ID: ${result.id}`);

// Specify a preferred host
const availableHosts = await client.getAvailableHosts();
const preferredHost = availableHosts[0].host;
const resultWithHost = await client.addTorrent(torrentFile, preferredHost);
console.log(`Torrent added with ID: ${resultWithHost.id} using host: ${preferredHost}`);
```

#### Adding a Magnet Link

```typescript
// Add a magnet link
const magnetLink = 'magnet:?xt=urn:btih:example';
const result = await client.addMagnet(magnetLink);
console.log(`Magnet added with ID: ${result.id}`);

// Add a magnet link with a preferred host
const availableHosts = await client.getAvailableHosts();
const preferredHost = availableHosts[0].host;
const resultWithHost = await client.addMagnet(magnetLink, preferredHost);
console.log(`Magnet added with ID: ${resultWithHost.id} using host: ${preferredHost}`);
```

#### Selecting Files and Managing Torrents

```typescript
// Select specific files from a torrent
await client.selectFiles(torrentId, '1,2,3'); // Select files with IDs 1, 2, and 3

// Delete a torrent
await client.deleteTorrent(torrentId);
```

## Project Structure

The project is organized as follows:

### Schema Organization

All API schemas are defined in the `src/schemas` directory, organized by category:

- Each schema file (e.g., `torrents.ts`) contains:
  - Zod schema definitions for request/response validation
  - TypeScript type definitions co-located with their schemas
  - Type definitions are exported alongside schemas using `z.infer<>`

This approach ensures types and schemas stay in sync and are easy to maintain.

Example:

```typescript
// src/schemas/torrents.ts
import { z } from 'zod';

// Schema definition
export const torrentInfoSchema = z.object({
  id: z.string(),
  // ...other fields
});

// Co-located type definition
export type TorrentInfo = z.infer<typeof torrentInfoSchema>;
```

### Using Schema Types

Types can be imported directly from the schema package:

```typescript
import { TorrentInfo, UserSettings } from './schemas';

// Use the types for parameters and return values
function processTorrent(torrent: TorrentInfo): void {
  console.log(`Processing torrent: ${torrent.id}`);
}
```

## Development

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Build the project:
   ```bash
   pnpm build
   ```

## Scripts

- `pnpm build` - Build the project
- `pnpm dev` - Run the development server
- `pnpm start` - Run the built project
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm test` - Run tests

## License

ISC
