/**
 * Error response format returned by the Real-Debrid API
 */
export interface ErrorResponse {
  error: string;
  error_code?: number;
}

/**
 * HTTP verb enum for API requests
 */
export enum HttpVerb {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}
