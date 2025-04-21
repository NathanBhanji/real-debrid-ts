/**
 * Base error class for Real-Debrid API errors
 */
export class RealDebridClientError extends Error {
  public readonly code: number;
  public readonly status?: number;

  constructor(message: string, code: number = -1, status?: number) {
    super(message);
    this.name = 'RealDebridClientError';
    this.code = code;
    this.status = status;

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Create an error from an API error response
   */
  static fromApiError(
    error: { error: string; error_code?: number },
    status?: number
  ): RealDebridClientError {
    return new RealDebridClientError(
      `[${error.error_code || 'unknown'}] ${error.error}`,
      error.error_code || -1,
      status
    );
  }

  /**
   * Create an error for authentication failures
   */
  static authError(message: string): RealDebridClientError {
    return new RealDebridClientError(`Authentication error: ${message}`, 8);
  }

  /**
   * Create an error for rate limiting
   */
  static rateLimitError(): RealDebridClientError {
    return new RealDebridClientError('Rate limit exceeded. Please try again later.', 5);
  }

  /**
   * Create an error for invalid parameters
   */
  static invalidParamError(param: string, reason: string): RealDebridClientError {
    return new RealDebridClientError(`Invalid parameter '${param}': ${reason}`, 2);
  }

  /**
   * Create an error for missing parameters
   */
  static missingParamError(param: string): RealDebridClientError {
    return new RealDebridClientError(`Missing required parameter: ${param}`, 1);
  }

  /**
   * Create an error for unknown/unexpected errors
   */
  static unknownError(message: string, status?: number): RealDebridClientError {
    return new RealDebridClientError(`Unknown error: ${message}`, -1, status);
  }
}
