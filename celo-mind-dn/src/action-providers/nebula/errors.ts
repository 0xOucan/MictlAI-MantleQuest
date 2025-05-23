/**
 * Custom error classes for Nebula AI integration
 */

/**
 * Base error class for all Nebula-related errors
 */
export class NebulaError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  
  constructor(message: string, code: string = "NEBULA_ERROR", statusCode?: number) {
    super(message);
    this.name = "NebulaError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Error thrown when thirdweb secret key is missing or invalid
 */
export class NebulaConfigurationError extends NebulaError {
  constructor(message: string = "Thirdweb secret key is not configured") {
    super(message, "NEBULA_CONFIGURATION_ERROR");
    this.name = "NebulaConfigurationError";
  }
}

/**
 * Error thrown when there's a network issue connecting to Nebula API
 */
export class NebulaNetworkError extends NebulaError {
  constructor(message: string = "Network error connecting to Nebula API", statusCode?: number) {
    super(message, "NEBULA_NETWORK_ERROR", statusCode);
    this.name = "NebulaNetworkError";
  }
}

/**
 * Error thrown when Nebula API returns an error response
 */
export class NebulaAPIError extends NebulaError {
  public readonly apiCode?: string;
  
  constructor(message: string, statusCode?: number, apiCode?: string) {
    super(message, "NEBULA_API_ERROR", statusCode);
    this.name = "NebulaAPIError";
    this.apiCode = apiCode;
  }
}

/**
 * Error thrown when Nebula response cannot be parsed or is invalid
 */
export class NebulaResponseError extends NebulaError {
  constructor(message: string = "Invalid or unparseable response from Nebula") {
    super(message, "NEBULA_RESPONSE_ERROR");
    this.name = "NebulaResponseError";
  }
}

/**
 * Error thrown when transaction execution fails
 */
export class NebulaExecutionError extends NebulaError {
  public readonly transactionHash?: string;
  
  constructor(message: string, transactionHash?: string) {
    super(message, "NEBULA_EXECUTION_ERROR");
    this.name = "NebulaExecutionError";
    this.transactionHash = transactionHash;
  }
}

/**
 * Error thrown when the current network is not supported
 */
export class NebulaUnsupportedChainError extends NebulaError {
  public readonly currentChainId?: number;
  public readonly supportedChainId: number;
  
  constructor(currentChainId?: number, supportedChainId: number = 5000) {
    const message = `Chain ${currentChainId} not supported. Only Mantle (${supportedChainId}) is supported.`;
    super(message, "NEBULA_UNSUPPORTED_CHAIN");
    this.name = "NebulaUnsupportedChainError";
    this.currentChainId = currentChainId;
    this.supportedChainId = supportedChainId;
  }
}

/**
 * Error thrown when session is invalid or expired
 */
export class NebulaSessionError extends NebulaError {
  public readonly sessionId?: string;
  
  constructor(message: string, sessionId?: string) {
    super(message, "NEBULA_SESSION_ERROR");
    this.name = "NebulaSessionError";
    this.sessionId = sessionId;
  }
}

/**
 * Error thrown when rate limit is exceeded
 */
export class NebulaRateLimitError extends NebulaError {
  public readonly retryAfter?: number;
  
  constructor(retryAfter?: number) {
    const message = retryAfter 
      ? `Rate limit exceeded. Retry after ${retryAfter} seconds.`
      : "Rate limit exceeded. Please try again later.";
    super(message, "NEBULA_RATE_LIMIT", 429);
    this.name = "NebulaRateLimitError";
    this.retryAfter = retryAfter;
  }
}

/**
 * Error thrown when input validation fails
 */
export class NebulaValidationError extends NebulaError {
  public readonly field?: string;
  
  constructor(message: string, field?: string) {
    super(message, "NEBULA_VALIDATION_ERROR");
    this.name = "NebulaValidationError";
    this.field = field;
  }
}

/**
 * Error thrown when operation times out
 */
export class NebulaTimeoutError extends NebulaError {
  public readonly timeoutMs: number;
  
  constructor(timeoutMs: number) {
    super(`Operation timed out after ${timeoutMs}ms`, "NEBULA_TIMEOUT");
    this.name = "NebulaTimeoutError";
    this.timeoutMs = timeoutMs;
  }
}

/**
 * Type guard to check if error is a Nebula error
 */
export function isNebulaError(error: any): error is NebulaError {
  return error instanceof NebulaError;
}

/**
 * Utility function to create appropriate error from HTTP response
 */
export function createNebulaErrorFromResponse(
  response: Response, 
  responseBody?: any
): NebulaError {
  const status = response.status;
  const statusText = response.statusText;
  
  // Extract error message from response body if available
  let message = statusText;
  let apiCode: string | undefined;
  
  if (responseBody) {
    if (typeof responseBody === 'object') {
      message = responseBody.error || responseBody.message || statusText;
      apiCode = responseBody.code;
    } else if (typeof responseBody === 'string') {
      message = responseBody;
    }
  }
  
  // Create specific error types based on status code
  switch (status) {
    case 401:
    case 403:
      return new NebulaConfigurationError(`Authentication failed: ${message}`);
    case 429:
      const retryAfter = response.headers.get('retry-after');
      return new NebulaRateLimitError(retryAfter ? parseInt(retryAfter) : undefined);
    case 400:
      return new NebulaValidationError(message);
    case 404:
      return new NebulaAPIError(`Resource not found: ${message}`, status, apiCode);
    case 500:
    case 502:
    case 503:
    case 504:
      return new NebulaAPIError(`Server error: ${message}`, status, apiCode);
    default:
      return new NebulaAPIError(message, status, apiCode);
  }
} 