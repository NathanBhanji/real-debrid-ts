import { RealDebridClientError } from './error';
import { ErrorResponse, HttpVerb } from './error-types';
import type {
  ActiveTorrentsCount,
  AvailableHosts,
  DeviceCodeResponse,
  DeviceCredentialsResponse,
  DomainsResponse,
  Downloads,
  GrantType,
  HostsResponse,
  HostsStatusResponse,
  MediaInfo,
  RegexResponse,
  TokenResponse,
  TorrentInfo,
  TorrentsList,
  Traffic,
  TrafficDetails,
  TranscodingLinks,
  UnrestrictCheck,
  UnrestrictFolderResponse,
  UnrestrictLinkResponse,
  UserInfo,
  UserSettings,
} from './schemas';

import { z } from 'zod';
import {
  deviceCodeParamsSchema,
  deviceCredentialsParamsSchema,
  refreshTokenParamsSchema,
  tokenParamsSchema,
} from './schemas/auth';
import { deleteDownloadParamsSchema, getDownloadsParamsSchema } from './schemas/downloads';
import {
  changePasswordParamsSchema,
  updateSettingParamsSchema,
  uploadAvatarParamsSchema,
} from './schemas/settings';
import {
  addMagnetParamsSchema,
  addTorrentParamsSchema,
  deleteTorrentParamsSchema,
  getTorrentInfoParamsSchema,
  getTorrentsParamsSchema,
  selectFilesParamsSchema,
} from './schemas/torrents';
import { trafficDetailsParamsSchema } from './schemas/traffic';
import {
  unrestrictCheckParamsSchema,
  unrestrictContainerLinkParamsSchema,
  unrestrictFolderParamsSchema,
  unrestrictLinkParamsSchema,
} from './schemas/unrestrict';

const BASE_URL = 'https://api.real-debrid.com/rest/1.0';
const AUTH_URL = 'https://api.real-debrid.com/oauth/v2';

export class RealDebridClient {
  private client_id: string;
  private client_secret: string | undefined;
  private access_token: string | undefined;
  private refresh_token: string | undefined;

  public constructor(client_id: string, client_secret?: string) {
    this.client_id = client_id;
    this.client_secret = client_secret;
  }

  /**
   * Helper method to validate parameters against Zod schemas
   * @throws {RealDebridClientError} If validation fails
   */
  private validateParams<T>(schema: z.ZodType<T>, params: unknown): T {
    try {
      return schema.parse(params);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.errors
          .map((err) => `${err.path.join('.')}: ${err.message}`)
          .join('; ');
        throw RealDebridClientError.invalidParamError('validation', issues);
      }
      throw error;
    }
  }

  /**
   * Create a client instance for an existing user with tokens
   */
  public static fromExistingAuth(
    client_id: string,
    client_secret: string,
    access_token: string,
    refresh_token: string
  ): RealDebridClient {
    const client = new RealDebridClient(client_id, client_secret);
    client.setTokens(access_token, refresh_token);
    return client;
  }

  /**
   * Update the access and refresh tokens
   */
  public setTokens(access_token: string, refresh_token: string): void {
    this.access_token = access_token;
    this.refresh_token = refresh_token;
  }

  /**
   * Get the current access token
   */
  public getAccessToken(): string | undefined {
    return this.access_token;
  }

  /**
   * Get the current refresh token
   */
  public getRefreshToken(): string | undefined {
    return this.refresh_token;
  }

  /**
   * Get a device code for the device authentication flow
   * @returns Device code response or error response
   */
  public async getDeviceCode(): Promise<DeviceCodeResponse | ErrorResponse> {
    try {
      // Prepare and validate parameters
      const paramsObj = {
        client_id: this.client_id,
        ...(!this.client_secret && { new_credentials: 'yes' as const }),
      };
      const validParams = this.validateParams(deviceCodeParamsSchema, paramsObj);

      const params = new URLSearchParams(validParams as Record<string, string>);
      const response = await fetch(`${AUTH_URL}/device/code?${params.toString()}`);
      const data = (await response.json()) as DeviceCodeResponse | ErrorResponse;
      return data;
    } catch (error) {
      if (error instanceof RealDebridClientError) {
        throw error;
      }
      throw RealDebridClientError.unknownError('Failed to get device code');
    }
  }

  /**
   * Get credentials from a device code after the user has authenticated
   * @param deviceCode The device code obtained from getDeviceCode
   * @returns Credentials response containing client_id and client_secret if successful
   */
  public async getCredentials(
    deviceCode: string
  ): Promise<DeviceCredentialsResponse | ErrorResponse> {
    // Validate parameters
    const validParams = this.validateParams(deviceCredentialsParamsSchema, {
      client_id: this.client_id,
      code: deviceCode,
    });

    const params = new URLSearchParams({
      client_id: validParams.client_id,
      code: validParams.code,
    });

    try {
      const response = await fetch(`${AUTH_URL}/device/credentials?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          return {
            error: 'permission_denied',
            error_code: 9,
          };
        }
        if (response.status === 400) {
          const error = (await response.json()) as ErrorResponse;
          return error;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = (await response.json()) as DeviceCredentialsResponse | ErrorResponse;

      // Check if we got valid credentials
      if ('client_id' in data && 'client_secret' in data) {
        this.client_id = data.client_id;
        this.client_secret = data.client_secret;
        return {
          client_id: data.client_id,
          client_secret: data.client_secret,
        };
      }

      throw RealDebridClientError.unknownError('Invalid response from credentials endpoint');
    } catch (error) {
      if (error instanceof RealDebridClientError) {
        throw error;
      }
      throw RealDebridClientError.unknownError(
        error instanceof Error ? error.message : 'Failed to get credentials'
      );
    }
  }

  /**
   * Get an access token using an authorization code or device code
   * @param code The authorization code or device code
   * @param redirectUri Optional redirect URI for web flow
   * @returns Token response containing access_token, refresh_token, etc.
   */
  public async getToken(
    code: string,
    redirectUri?: string
  ): Promise<TokenResponse | ErrorResponse> {
    const grantType: GrantType = redirectUri
      ? 'authorization_code'
      : 'http://oauth.net/grant_type/device/1.0';

    if (!this.client_secret) {
      throw RealDebridClientError.invalidParamError('client_secret', 'Client secret is required');
    }

    // Validate parameters
    const validParams = this.validateParams(tokenParamsSchema, {
      client_id: this.client_id,
      client_secret: this.client_secret,
      code: code,
      ...(redirectUri && { redirect_uri: redirectUri }),
      grant_type: grantType,
    });

    const params = new URLSearchParams({
      client_id: validParams.client_id,
      client_secret: validParams.client_secret,
      code: validParams.code,
      ...(validParams.redirect_uri && { redirect_uri: validParams.redirect_uri }),
      grant_type: validParams.grant_type,
    });

    try {
      const response = await fetch(`${AUTH_URL}/token`, {
        method: HttpVerb.POST,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });
      const data = (await response.json()) as TokenResponse | ErrorResponse;
      return data;
    } catch (error) {
      if (error instanceof RealDebridClientError) {
        throw error;
      }
      throw RealDebridClientError.unknownError('Failed to get token');
    }
  }

  /**
   * Refresh an expired access token using a refresh token
   * @param refreshToken The refresh token
   * @returns New token response containing a new access_token and refresh_token
   */
  public async refreshToken(refreshToken: string) {
    if (!this.client_secret) {
      throw RealDebridClientError.invalidParamError('client_secret', 'Client secret is required');
    }

    // Validate parameters
    const validParams = this.validateParams(refreshTokenParamsSchema, {
      client_id: this.client_id,
      refresh_token: refreshToken,
      client_secret: this.client_secret,
      grant_type: 'http://oauth.net/grant_type/refresh_token/1.0',
    });

    const params = new URLSearchParams({
      client_id: validParams.client_id,
      refresh_token: validParams.refresh_token,
      client_secret: validParams.client_secret,
      grant_type: validParams.grant_type,
    });

    try {
      const response = await fetch(`${AUTH_URL}/token?${params.toString()}`);
      const data = (await response.json()) as TokenResponse | ErrorResponse;
      return data;
    } catch (error) {
      if (error instanceof RealDebridClientError) {
        throw error;
      }
      throw RealDebridClientError.unknownError('Failed to refresh token');
    }
  }

  /**
   * Helper method to make authenticated requests with automatic token refresh
   */
  private async makeAuthenticatedRequest<T>(
    url: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    if (!this.access_token) {
      throw RealDebridClientError.invalidParamError('access_token', 'No access token available');
    }

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${this.access_token}`,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // If we get a 401/403 and have a refresh token, try to refresh and retry
    if (
      (response.status === 401 || response.status === 403) &&
      this.refresh_token &&
      retryCount < 1
    ) {
      try {
        const newTokens = await this.refreshToken(this.refresh_token);
        if ('access_token' in newTokens) {
          this.setTokens(newTokens.access_token, newTokens.refresh_token);
          // Retry the request with new token, increment retry count
          return this.makeAuthenticatedRequest<T>(url, options, retryCount + 1);
        }
      } catch (error) {
        // If refresh fails, throw the original error
        throw RealDebridClientError.invalidParamError('access_token', 'Token refresh failed');
      }
    }

    if (!response.ok) {
      throw RealDebridClientError.unknownError(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as T;
    return data;
  }

  /**
   * Check if a file is downloadable from a hoster
   * @param link The hoster link to check
   * @param password Optional password to unlock the file
   * @returns Information about the file availability
   */
  public async unrestrictCheck(link: string, password?: string): Promise<UnrestrictCheck> {
    // Validate parameters
    const validParams = this.validateParams(unrestrictCheckParamsSchema, { link, password });

    const params = new URLSearchParams({
      link: validParams.link,
      ...(validParams.password && { password: validParams.password }),
    });

    try {
      const response = await fetch(`${BASE_URL}/unrestrict/check`, {
        method: HttpVerb.POST,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const error = (await response.json()) as ErrorResponse;
        throw RealDebridClientError.fromApiError(error);
      }

      return (await response.json()) as UnrestrictCheck;
    } catch (error) {
      if (error instanceof RealDebridClientError) {
        throw error;
      }
      throw RealDebridClientError.unknownError(
        error instanceof Error ? error.message : 'Failed to check link'
      );
    }
  }

  /**
   * Unrestrict a hoster link to get a direct download link
   * @param link The hoster link to unrestrict
   * @param password Optional password to unlock the file
   * @param remote Optional flag to use remote traffic (0 or 1)
   * @returns Unrestricted link data
   */
  public async unrestrictLink(
    link: string,
    password?: string,
    remote?: 0 | 1
  ): Promise<UnrestrictLinkResponse> {
    if (!this.access_token) {
      throw RealDebridClientError.invalidParamError('access_token', 'No access token available');
    }

    // Validate parameters
    const validParams = this.validateParams(unrestrictLinkParamsSchema, { link, password, remote });

    const params = new URLSearchParams({
      link: validParams.link,
      ...(validParams.password && { password: validParams.password }),
      ...(validParams.remote !== undefined && { remote: validParams.remote.toString() }),
    });

    try {
      const response = await fetch(`${BASE_URL}/unrestrict/link`, {
        method: HttpVerb.POST,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${this.access_token}`,
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const error = (await response.json()) as ErrorResponse;
        throw RealDebridClientError.fromApiError(error);
      }

      return (await response.json()) as UnrestrictLinkResponse;
    } catch (error) {
      if (error instanceof RealDebridClientError) {
        throw error;
      }
      throw RealDebridClientError.unknownError(
        error instanceof Error ? error.message : 'Failed to unrestrict link'
      );
    }
  }

  /**
   * Unrestrict a hoster folder link to get individual links
   * @param link The hoster folder link
   * @returns Array of unrestricted links from the folder
   */
  public async unrestrictFolder(link: string): Promise<UnrestrictFolderResponse> {
    // Validate parameters
    const validParams = this.validateParams(unrestrictFolderParamsSchema, { link });

    const params = new URLSearchParams({
      link: validParams.link,
    });

    try {
      return await this.makeAuthenticatedRequest<UnrestrictFolderResponse>(
        `${BASE_URL}/unrestrict/folder`,
        {
          method: HttpVerb.POST,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        }
      );
    } catch (error) {
      if (error instanceof RealDebridClientError) {
        throw error;
      }
      throw RealDebridClientError.unknownError(
        error instanceof Error ? error.message : 'Failed to unrestrict folder'
      );
    }
  }

  /**
   * Decrypt a container file (RSDF, CCF, DLC)
   * @param file The container file
   * @returns Array of links contained in the file
   */
  public async decryptContainerFile(file: File): Promise<string[]> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      return await this.makeAuthenticatedRequest<string[]>(`${BASE_URL}/unrestrict/containerFile`, {
        method: HttpVerb.PUT,
        body: formData,
      });
    } catch (error) {
      if (error instanceof RealDebridClientError) {
        throw error;
      }
      throw RealDebridClientError.unknownError(
        error instanceof Error ? error.message : 'Failed to decrypt container file'
      );
    }
  }

  /**
   * Decrypt a container file from a link
   * @param link HTTP link to the container file
   * @returns Array of links contained in the file
   */
  public async decryptContainerLink(link: string): Promise<string[]> {
    // Validate parameters
    const validParams = this.validateParams(unrestrictContainerLinkParamsSchema, { link });

    const params = new URLSearchParams({
      link: validParams.link,
    });

    try {
      return await this.makeAuthenticatedRequest<string[]>(`${BASE_URL}/unrestrict/containerLink`, {
        method: HttpVerb.POST,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });
    } catch (error) {
      if (error instanceof RealDebridClientError) {
        throw error;
      }
      throw RealDebridClientError.unknownError(
        error instanceof Error ? error.message : 'Failed to decrypt container link'
      );
    }
  }

  /**
   * Get traffic information for limited hosters
   * @returns Traffic data including limits and usage
   */
  public async getTraffic(): Promise<Traffic> {
    try {
      return await this.makeAuthenticatedRequest<Traffic>(`${BASE_URL}/traffic`);
    } catch (error) {
      throw RealDebridClientError.unknownError(
        error instanceof Error ? error.message : 'Failed to get traffic'
      );
    }
  }

  /**
   * Get detailed traffic information for a specific period
   * @param start Optional start date (YYYY-MM-DD)
   * @param end Optional end date (YYYY-MM-DD)
   * @returns Detailed traffic data by hoster
   */
  public async getTrafficDetails(start?: string, end?: string): Promise<TrafficDetails> {
    // Validate parameters
    const validParams = this.validateParams(trafficDetailsParamsSchema, { start, end });

    const params = new URLSearchParams({
      ...(validParams.start && { start: validParams.start }),
      ...(validParams.end && { end: validParams.end }),
    });

    try {
      return await this.makeAuthenticatedRequest<TrafficDetails>(
        `${BASE_URL}/traffic/details?${params.toString()}`
      );
    } catch (error) {
      throw RealDebridClientError.unknownError(
        error instanceof Error ? error.message : 'Failed to get traffic details'
      );
    }
  }

  /**
   * Get transcoding links for a file
   * @param id File ID from downloads or unrestrict/link
   * @returns Available transcoding links
   */
  public async getTranscodingLinks(id: string): Promise<TranscodingLinks> {
    try {
      return await this.makeAuthenticatedRequest<TranscodingLinks>(
        `${BASE_URL}/streaming/transcode/${id}`
      );
    } catch (error) {
      throw RealDebridClientError.unknownError(
        error instanceof Error ? error.message : 'Failed to get transcoding links'
      );
    }
  }

  /**
   * Get detailed media information for a file
   * @param id File ID from downloads or unrestrict/link
   * @returns Media metadata
   */
  public async getMediaInfo(id: string): Promise<MediaInfo> {
    try {
      return await this.makeAuthenticatedRequest<MediaInfo>(
        `${BASE_URL}/streaming/mediaInfos/${id}`
      );
    } catch (error) {
      throw RealDebridClientError.unknownError(
        error instanceof Error ? error.message : 'Failed to get media info'
      );
    }
  }

  /**
   * Get user download history
   * @param options Optional pagination parameters
   * @returns Downloads list
   */
  public async getDownloads(options?: {
    offset?: number;
    page?: number;
    limit?: number;
  }): Promise<Downloads> {
    // Validate parameters
    const validOptions = options ? this.validateParams(getDownloadsParamsSchema, options) : {};

    const params = new URLSearchParams();

    if (validOptions.page !== undefined) {
      params.append('page', validOptions.page.toString());
    } else if (validOptions.offset !== undefined) {
      params.append('offset', validOptions.offset.toString());
    }

    if (validOptions.limit !== undefined) {
      params.append('limit', validOptions.limit.toString());
    }

    try {
      return await this.makeAuthenticatedRequest<Downloads>(
        `${BASE_URL}/downloads${params.toString() ? `?${params.toString()}` : ''}`
      );
    } catch (error) {
      if (error instanceof RealDebridClientError) {
        throw error;
      }
      throw RealDebridClientError.unknownError(
        error instanceof Error ? error.message : 'Failed to get downloads'
      );
    }
  }

  /**
   * Delete a download from the user's download history
   * @param id ID of the download to delete
   * @returns void (HTTP 204 No Content)
   */
  public async deleteDownload(id: string): Promise<void> {
    // Validate parameters
    const validParams = this.validateParams(deleteDownloadParamsSchema, { id });

    try {
      return await this.makeAuthenticatedRequest<void>(
        `${BASE_URL}/downloads/delete/${validParams.id}`,
        {
          method: HttpVerb.DELETE,
        }
      );
    } catch (error) {
      if (error instanceof RealDebridClientError) {
        throw error;
      }
      throw RealDebridClientError.unknownError(
        error instanceof Error ? error.message : 'Failed to delete download'
      );
    }
  }

  /**
   * Get current user information
   * @returns User profile data
   */
  public async getUser(): Promise<UserInfo> {
    try {
      return await this.makeAuthenticatedRequest<UserInfo>(`${BASE_URL}/user`);
    } catch (error) {
      throw RealDebridClientError.unknownError('Failed to get user info');
    }
  }

  /**
   * Get the list of torrents
   * @param options Optional parameters for pagination and filtering
   * @returns List of torrents
   */
  public async getTorrents(options?: {
    offset?: number;
    page?: number;
    limit?: number;
    filter?: 'active';
  }): Promise<TorrentsList> {
    // Validate parameters
    const validOptions = options ? this.validateParams(getTorrentsParamsSchema, options) : {};

    const params = new URLSearchParams();

    if (validOptions.page !== undefined) {
      params.append('page', validOptions.page.toString());
    } else if (validOptions.offset !== undefined) {
      params.append('offset', validOptions.offset.toString());
    }

    if (validOptions.limit !== undefined) {
      params.append('limit', validOptions.limit.toString());
    }

    if (validOptions.filter !== undefined) {
      params.append('filter', validOptions.filter);
    }

    try {
      return await this.makeAuthenticatedRequest<TorrentsList>(
        `${BASE_URL}/torrents${params.toString() ? `?${params.toString()}` : ''}`
      );
    } catch (error) {
      if (error instanceof RealDebridClientError) {
        throw error;
      }
      throw RealDebridClientError.unknownError(
        error instanceof Error ? error.message : 'Failed to get torrents'
      );
    }
  }

  /**
   * Get info about a specific torrent
   * @param id Torrent ID
   * @returns Detailed torrent information
   */
  public async getTorrentInfo(id: string): Promise<TorrentInfo> {
    // Validate parameters
    const validParams = this.validateParams(getTorrentInfoParamsSchema, { id });

    try {
      return await this.makeAuthenticatedRequest<TorrentInfo>(
        `${BASE_URL}/torrents/info/${validParams.id}`
      );
    } catch (error) {
      if (error instanceof RealDebridClientError) {
        throw error;
      }
      throw RealDebridClientError.unknownError(
        error instanceof Error ? error.message : 'Failed to get torrent info'
      );
    }
  }

  /**
   * Disable the current access token
   * @returns void
   */
  public async disableAccessToken(): Promise<void> {
    return this.makeAuthenticatedRequest<void>(`${BASE_URL}/disable_access_token`, {
      method: HttpVerb.GET,
    });
  }

  /**
   * Get server time in Y-m-d H:i:s format
   * @returns Server time string
   */
  public async getServerTime(): Promise<string> {
    const response = await fetch(`${BASE_URL}/time`);
    const data = await response.text();
    return data;
  }

  /**
   * Get server time in ISO format
   * @returns Server time string in ISO format
   */
  public async getServerTimeISO(): Promise<string> {
    const response = await fetch(`${BASE_URL}/time/iso`);
    const data = await response.text();
    return data;
  }

  /**
   * Get the active torrents count
   * @returns Count of active torrents and limit
   */
  public async getActiveTorrentsCount(): Promise<ActiveTorrentsCount> {
    try {
      return await this.makeAuthenticatedRequest<ActiveTorrentsCount>(
        `${BASE_URL}/torrents/activeCount`
      );
    } catch (error) {
      if (error instanceof RealDebridClientError) {
        throw error;
      }
      throw RealDebridClientError.unknownError(
        error instanceof Error ? error.message : 'Failed to get active torrents count'
      );
    }
  }

  /**
   * Get available hosts for torrents
   * @returns List of available hosts
   */
  public async getAvailableHosts(): Promise<AvailableHosts> {
    try {
      return await this.makeAuthenticatedRequest<AvailableHosts>(
        `${BASE_URL}/torrents/availableHosts`
      );
    } catch (error) {
      if (error instanceof RealDebridClientError) {
        throw error;
      }
      throw RealDebridClientError.unknownError(
        error instanceof Error ? error.message : 'Failed to get available hosts'
      );
    }
  }

  /**
   * Add a torrent file
   * @param torrent Torrent file
   * @param host Optional host to use for the torrent
   * @returns Torrent ID and URI
   */
  public async addTorrent(torrent: File, host?: string): Promise<{ id: string; uri: string }> {
    // Validate parameters
    const validParams = this.validateParams(addTorrentParamsSchema, { torrent, host });

    const formData = new FormData();
    if (validParams.host) {
      formData.append('host', validParams.host);
    }
    formData.append('torrent', validParams.torrent);

    try {
      return await this.makeAuthenticatedRequest<{ id: string; uri: string }>(
        `${BASE_URL}/torrents/addTorrent`,
        {
          method: HttpVerb.PUT,
          body: formData,
        }
      );
    } catch (error) {
      if (error instanceof RealDebridClientError) {
        throw error;
      }
      throw RealDebridClientError.unknownError(
        error instanceof Error ? error.message : 'Failed to add torrent'
      );
    }
  }

  /**
   * Add a magnet link
   * @param magnet Magnet link
   * @param host Optional host to use for the torrent
   * @returns Torrent ID and URI
   */
  public async addMagnet(magnet: string, host?: string): Promise<{ id: string; uri: string }> {
    // Validate parameters
    const validParams = this.validateParams(addMagnetParamsSchema, { magnet, host });

    const params = new URLSearchParams({
      magnet: validParams.magnet,
    });

    if (validParams.host) {
      params.append('host', validParams.host);
    }

    try {
      return await this.makeAuthenticatedRequest<{ id: string; uri: string }>(
        `${BASE_URL}/torrents/addMagnet`,
        {
          method: HttpVerb.POST,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        }
      );
    } catch (error) {
      if (error instanceof RealDebridClientError) {
        throw error;
      }
      throw RealDebridClientError.unknownError(
        error instanceof Error ? error.message : 'Failed to add magnet'
      );
    }
  }

  /**
   * Select files from a torrent
   * @param id Torrent ID
   * @param files Comma-separated list of file IDs to select
   * @returns void
   */
  public async selectFiles(id: string, files: string): Promise<void> {
    // Validate parameters
    const validParams = this.validateParams(selectFilesParamsSchema, { id, files });

    const params = new URLSearchParams({
      files: validParams.files,
    });

    try {
      return await this.makeAuthenticatedRequest<void>(
        `${BASE_URL}/torrents/selectFiles/${validParams.id}`,
        {
          method: HttpVerb.POST,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        }
      );
    } catch (error) {
      if (error instanceof RealDebridClientError) {
        throw error;
      }
      throw RealDebridClientError.unknownError(
        error instanceof Error ? error.message : 'Failed to select files'
      );
    }
  }

  /**
   * Delete a torrent
   * @param id Torrent ID
   * @returns void
   */
  public async deleteTorrent(id: string): Promise<void> {
    // Validate parameters
    const validParams = this.validateParams(deleteTorrentParamsSchema, { id });

    try {
      return await this.makeAuthenticatedRequest<void>(
        `${BASE_URL}/torrents/delete/${validParams.id}`,
        {
          method: HttpVerb.DELETE,
        }
      );
    } catch (error) {
      if (error instanceof RealDebridClientError) {
        throw error;
      }
      throw RealDebridClientError.unknownError(
        error instanceof Error ? error.message : 'Failed to delete torrent'
      );
    }
  }

  /**
   * Get the list of supported hosters
   * @returns Map of host domains to their information
   */
  public async getHosts(): Promise<HostsResponse> {
    try {
      return await this.makeAuthenticatedRequest<HostsResponse>(`${BASE_URL}/hosts`);
    } catch (error) {
      if (error instanceof RealDebridClientError) {
        throw error;
      }
      throw RealDebridClientError.unknownError(
        error instanceof Error ? error.message : 'Failed to get hosts'
      );
    }
  }

  /**
   * Get the status of each hoster
   * @returns Map of host domains to their status information
   */
  public async getHostsStatus(): Promise<HostsStatusResponse> {
    try {
      return await this.makeAuthenticatedRequest<HostsStatusResponse>(`${BASE_URL}/hosts/status`);
    } catch (error) {
      if (error instanceof RealDebridClientError) {
        throw error;
      }
      throw RealDebridClientError.unknownError(
        error instanceof Error ? error.message : 'Failed to get hosts status'
      );
    }
  }

  /**
   * Get regular expressions to identify supported hosters
   * @returns Array of regular expression strings
   */
  public async getHostsRegex(): Promise<RegexResponse> {
    try {
      return await this.makeAuthenticatedRequest<RegexResponse>(`${BASE_URL}/hosts/regex`);
    } catch (error) {
      if (error instanceof RealDebridClientError) {
        throw error;
      }
      throw RealDebridClientError.unknownError(
        error instanceof Error ? error.message : 'Failed to get hosts regex'
      );
    }
  }

  /**
   * Get the list of supported domains
   * @returns Array of domain strings
   */
  public async getHostsDomains(): Promise<DomainsResponse> {
    try {
      return await this.makeAuthenticatedRequest<DomainsResponse>(`${BASE_URL}/hosts/domains`);
    } catch (error) {
      if (error instanceof RealDebridClientError) {
        throw error;
      }
      throw RealDebridClientError.unknownError(
        error instanceof Error ? error.message : 'Failed to get hosts domains'
      );
    }
  }

  /**
   * Get regular expressions to identify supported folders
   * @returns Array of regular expression strings
   */
  public async getHostsRegexFolder(): Promise<RegexResponse> {
    try {
      return await this.makeAuthenticatedRequest<RegexResponse>(`${BASE_URL}/hosts/regexFolder`);
    } catch (error) {
      if (error instanceof RealDebridClientError) {
        throw error;
      }
      throw RealDebridClientError.unknownError(
        error instanceof Error ? error.message : 'Failed to get hosts regex folder'
      );
    }
  }

  /**
   * Get the current user settings
   * @returns User settings object
   */
  public async getSettings(): Promise<UserSettings> {
    try {
      return await this.makeAuthenticatedRequest<UserSettings>(`${BASE_URL}/settings`);
    } catch (error) {
      if (error instanceof RealDebridClientError) {
        throw error;
      }
      throw RealDebridClientError.unknownError(
        error instanceof Error ? error.message : 'Failed to get settings'
      );
    }
  }

  /**
   * Update a specific setting
   * @param settingName The name of the setting to update
   * @param settingValue The new value for the setting
   * @returns void (HTTP 204)
   */
  public async updateSetting(settingName: string, settingValue: string): Promise<void> {
    // Validate parameters
    const validParams = this.validateParams(updateSettingParamsSchema, {
      setting_name: settingName,
      setting_value: settingValue,
    });

    const params = new URLSearchParams({
      setting_value: validParams.setting_value,
    });

    try {
      return await this.makeAuthenticatedRequest<void>(
        `${BASE_URL}/settings/update/${validParams.setting_name}`,
        {
          method: HttpVerb.POST,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        }
      );
    } catch (error) {
      if (error instanceof RealDebridClientError) {
        throw error;
      }
      throw RealDebridClientError.unknownError(
        error instanceof Error ? error.message : 'Failed to update setting'
      );
    }
  }

  /**
   * Convert fidelity points to premium days
   * @returns void (HTTP 204)
   */
  public async convertPoints(): Promise<void> {
    try {
      return await this.makeAuthenticatedRequest<void>(`${BASE_URL}/settings/convertPoints`, {
        method: HttpVerb.POST,
      });
    } catch (error) {
      if (error instanceof RealDebridClientError) {
        throw error;
      }
      throw RealDebridClientError.unknownError(
        error instanceof Error ? error.message : 'Failed to convert points'
      );
    }
  }

  /**
   * Change the user's password
   * @param password Current password
   * @param newPassword New password
   * @returns void (HTTP 204)
   */
  public async changePassword(password: string, newPassword: string): Promise<void> {
    // Validate parameters
    const validParams = this.validateParams(changePasswordParamsSchema, {
      password,
      newPassword,
    });

    const params = new URLSearchParams({
      password: validParams.password,
      newPassword: validParams.newPassword,
    });

    try {
      return await this.makeAuthenticatedRequest<void>(`${BASE_URL}/settings/changePassword`, {
        method: HttpVerb.POST,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });
    } catch (error) {
      if (error instanceof RealDebridClientError) {
        throw error;
      }
      throw RealDebridClientError.unknownError(
        error instanceof Error ? error.message : 'Failed to change password'
      );
    }
  }

  /**
   * Update the user's avatar
   * @param avatar The avatar image file
   * @returns void (HTTP 204)
   */
  public async updateAvatar(avatar: File): Promise<void> {
    // Validate parameters
    const validParams = this.validateParams(uploadAvatarParamsSchema, { avatar });

    const formData = new FormData();
    formData.append('avatar', validParams.avatar);

    try {
      return await this.makeAuthenticatedRequest<void>(`${BASE_URL}/settings/avatarFile`, {
        method: HttpVerb.PUT,
        body: formData,
      });
    } catch (error) {
      if (error instanceof RealDebridClientError) {
        throw error;
      }
      throw RealDebridClientError.unknownError(
        error instanceof Error ? error.message : 'Failed to update avatar'
      );
    }
  }

  /**
   * Delete the user's avatar
   * @returns void (HTTP 204)
   */
  public async deleteAvatar(): Promise<void> {
    try {
      return await this.makeAuthenticatedRequest<void>(`${BASE_URL}/settings/avatarDelete`, {
        method: HttpVerb.DELETE,
      });
    } catch (error) {
      if (error instanceof RealDebridClientError) {
        throw error;
      }
      throw RealDebridClientError.unknownError(
        error instanceof Error ? error.message : 'Failed to delete avatar'
      );
    }
  }
}
