/**
 * Error Utility Functions
 * 
 * Helper functions for error handling, parsing, and user-friendly messages.
 * Centralized error handling logic for consistent error messages across the app.
 */

/**
 * Error types for categorization
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  GPS = 'GPS',
  PERMISSION = 'PERMISSION',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Parsed error with type and user-friendly message
 */
export interface ParsedError {
  type: ErrorType;
  message: string;
  originalError: unknown;
  statusCode?: number;
  retryable: boolean;
  userMessage: string;
}

/**
 * Parse any error into a standardized format
 */
export const parseError = (error: unknown): ParsedError => {
  // Handle null/undefined
  if (!error) {
    return {
      type: ErrorType.UNKNOWN,
      message: 'Unknown error occurred',
      originalError: error,
      retryable: false,
      userMessage: '❌ Something went wrong',
    };
  }

  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    let type = ErrorType.UNKNOWN;
    let retryable = false;
    let userMessage = error.message;
    let statusCode: number | undefined;

    // Network errors
    if (
      message.includes('network') ||
      message.includes('fetch failed') ||
      message.includes('connection')
    ) {
      type = ErrorType.NETWORK;
      retryable = true;
      userMessage = '📡 Network error. Check your internet connection and try again.';
    }

    // GPS errors
    else if (
      message.includes('gps') ||
      message.includes('location') ||
      message.includes('geolocation')
    ) {
      type = ErrorType.GPS;
      retryable = true;
      userMessage = '📍 GPS unavailable. Enable location services and try again.';
    }

    // Permission errors
    else if (message.includes('permission') || message.includes('denied')) {
      type = ErrorType.PERMISSION;
      retryable = true;
      userMessage = '🔒 Permission required. Please grant necessary permissions.';
    }

    // Authentication errors
    else if (
      message.includes('unauthorized') ||
      message.includes('unauthenticated') ||
      message.includes('401')
    ) {
      type = ErrorType.AUTHENTICATION;
      retryable = false;
      statusCode = 401;
      userMessage = '🔑 Session expired. Please sign in again.';
    }

    // Authorization errors
    else if (message.includes('forbidden') || message.includes('403')) {
      type = ErrorType.AUTHORIZATION;
      retryable = false;
      statusCode = 403;
      userMessage = '⛔ You don&apos;t have permission to perform this action.';
    }

    // Validation errors
    else if (message.includes('invalid') || message.includes('validation')) {
      type = ErrorType.VALIDATION;
      retryable = false;
      userMessage = `⚠️ ${error.message}`;
    }

    // Server errors
    else if (
      message.includes('server') ||
      message.includes('500') ||
      message.includes('502') ||
      message.includes('503')
    ) {
      type = ErrorType.SERVER;
      retryable = true;
      statusCode = 500;
      userMessage = '🔧 Server error. Please try again later.';
    }

    // Block claiming errors
    else if (message.includes('grace period')) {
      type = ErrorType.VALIDATION;
      retryable = false;
      userMessage = '⏳ Block is still in grace period. Try again later.';
    } else if (message.includes('already owned')) {
      type = ErrorType.VALIDATION;
      retryable = false;
      userMessage = '🚫 This block is already owned by someone else.';
    } else if (message.includes('cooldown')) {
      type = ErrorType.VALIDATION;
      retryable = false;
      userMessage = '⏱️ Cooldown active. Wait before claiming again.';
    }

    // Timeout errors
    else if (message.includes('timeout')) {
      type = ErrorType.NETWORK;
      retryable = true;
      userMessage = '⏱️ Request timed out. Please try again.';
    }

    return {
      type,
      message: error.message,
      originalError: error,
      statusCode,
      retryable,
      userMessage,
    };
  }

  // Handle HTTP response errors
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const httpError = error as { status: number; statusText?: string; data?: unknown };
    const statusCode = httpError.status;
    let type = ErrorType.SERVER;
    let retryable = false;
    let userMessage = '❌ Request failed';

    if (statusCode === 401) {
      type = ErrorType.AUTHENTICATION;
      userMessage = '🔑 Session expired. Please sign in again.';
    } else if (statusCode === 403) {
      type = ErrorType.AUTHORIZATION;
      userMessage = '⛔ You don&apos;t have permission to perform this action.';
    } else if (statusCode === 404) {
      type = ErrorType.CLIENT;
      userMessage = '🔍 Resource not found.';
    } else if (statusCode >= 400 && statusCode < 500) {
      type = ErrorType.CLIENT;
      userMessage = `⚠️ ${httpError.statusText || 'Request failed'}`;
    } else if (statusCode >= 500) {
      type = ErrorType.SERVER;
      retryable = true;
      userMessage = '🔧 Server error. Please try again later.';
    }

    return {
      type,
      message: httpError.statusText || `HTTP ${statusCode}`,
      originalError: error,
      statusCode,
      retryable,
      userMessage,
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return parseError(new Error(error));
  }

  // Unknown error type
  return {
    type: ErrorType.UNKNOWN,
    message: String(error),
    originalError: error,
    retryable: false,
    userMessage: '❌ An unexpected error occurred',
  };
};

/**
 * Check if error is retryable
 */
export const isRetryableError = (error: unknown): boolean => {
  const parsed = parseError(error);
  return parsed.retryable;
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error: unknown): string => {
  const parsed = parseError(error);
  return parsed.userMessage;
};

/**
 * Get error type
 */
export const getErrorType = (error: unknown): ErrorType => {
  const parsed = parseError(error);
  return parsed.type;
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: unknown): boolean => {
  return getErrorType(error) === ErrorType.NETWORK;
};

/**
 * Check if error is an authentication error
 */
export const isAuthError = (error: unknown): boolean => {
  return getErrorType(error) === ErrorType.AUTHENTICATION;
};

/**
 * Check if error is a GPS error
 */
export const isGPSError = (error: unknown): boolean => {
  return getErrorType(error) === ErrorType.GPS;
};

/**
 * Check if error is a permission error
 */
export const isPermissionError = (error: unknown): boolean => {
  return getErrorType(error) === ErrorType.PERMISSION;
};

/**
 * Log error with context
 */
export const logError = (
  error: unknown,
  context: string,
  additionalData?: Record<string, unknown>
): void => {
  const parsed = parseError(error);

  console.error('🔴 [ERROR]', {
    context,
    type: parsed.type,
    message: parsed.message,
    userMessage: parsed.userMessage,
    statusCode: parsed.statusCode,
    retryable: parsed.retryable,
    timestamp: new Date().toISOString(),
    ...additionalData,
  });

  // TODO: Send to error tracking service (Sentry, etc.)
  // if (parsed.type === ErrorType.SERVER || parsed.type === ErrorType.UNKNOWN) {
  //   Sentry.captureException(parsed.originalError, {
  //     contexts: { custom: { context, ...additionalData } },
  //   });
  // }
};

/**
 * Create custom error classes
 */
export class GPSError extends Error {
  constructor(message: string = 'GPS unavailable') {
    super(message);
    this.name = 'GPSError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network request failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class BlockClaimError extends Error {
  constructor(message: string, public readonly reason: 'grace_period' | 'owned' | 'cooldown') {
    super(message);
    this.name = 'BlockClaimError';
  }
}

export class PermissionError extends Error {
  constructor(
    message: string,
    public readonly permissionType: 'location' | 'notification' | 'camera' | 'storage'
  ) {
    super(message);
    this.name = 'PermissionError';
  }
}

/**
 * Retry logic helper
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delay?: number;
    backoff?: boolean;
    shouldRetry?: (error: unknown) => boolean;
  } = {}
): Promise<T> => {
  const { maxAttempts = 3, delay = 1000, backoff = true, shouldRetry = isRetryableError } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      logError(error, `withRetry attempt ${attempt}/${maxAttempts}`);

      // Don't retry if we're on the last attempt or if error is not retryable
      if (attempt === maxAttempts || !shouldRetry(error)) {
        throw error;
      }

      // Wait before retrying with exponential backoff
      const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
};

/**
 * Timeout wrapper
 */
export const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string = 'Operation timed out'
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    ),
  ]);
};

/**
 * Safe async wrapper
 */
export const safeAsync = async <T>(
  fn: () => Promise<T>,
  fallback?: T
): Promise<{ data: T | undefined; error: ParsedError | null }> => {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (error) {
    const parsedError = parseError(error);
    logError(error, 'safeAsync');
    return { data: fallback, error: parsedError };
  }
};
