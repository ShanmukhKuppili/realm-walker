/**
 * useAsyncError Hook
 * 
 * Custom hook for handling async operations with loading and error states.
 * Provides automatic error handling, retry logic, and loading indicators.
 * 
 * @example
 * const { execute, loading, error, retry } = useAsyncError(claimBlock);
 * await execute(blockId);
 */

import { useToast } from '@/components/Toast';
import { useCallback, useRef, useState } from 'react';

interface UseAsyncErrorOptions<T> {
  /** Initial data value */
  initialData?: T;
  /** Show toast on error */
  showErrorToast?: boolean;
  /** Show toast on success */
  showSuccessToast?: boolean;
  /** Success toast message */
  successMessage?: string;
  /** Custom error message parser */
  errorParser?: (error: unknown) => string;
  /** Callback on success */
  onSuccess?: (data: T) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
  /** Retry attempts on failure */
  retryAttempts?: number;
  /** Delay between retries (ms) */
  retryDelay?: number;
}

interface UseAsyncErrorResult<T, Args extends unknown[]> {
  /** Execute the async function */
  execute: (...args: Args) => Promise<T | undefined>;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Result data */
  data: T | undefined;
  /** Retry the last failed operation */
  retry: () => Promise<T | undefined>;
  /** Reset state */
  reset: () => void;
}

export const useAsyncError = <T, Args extends unknown[]>(
  asyncFunction: (...args: Args) => Promise<T>,
  options: UseAsyncErrorOptions<T> = {}
): UseAsyncErrorResult<T, Args> => {
  const {
    initialData,
    showErrorToast = true,
    showSuccessToast = false,
    successMessage,
    errorParser = parseError,
    onSuccess,
    onError,
    retryAttempts = 0,
    retryDelay = 1000,
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | undefined>(initialData);
  const lastArgsRef = useRef<Args | null>(null);
  const { showToast } = useToast();

  const execute = useCallback(
    async (...args: Args): Promise<T | undefined> => {
      lastArgsRef.current = args;
      setLoading(true);
      setError(null);

      let lastError: Error | null = null;
      let attempts = 0;

      while (attempts <= retryAttempts) {
        try {
          const result = await asyncFunction(...args);
          setData(result);
          setLoading(false);

          // Success callbacks
          onSuccess?.(result);
          if (showSuccessToast && successMessage) {
            showToast(successMessage, 'success');
          }

          return result;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));
          attempts++;

          // If we have retry attempts left, wait and retry
          if (attempts <= retryAttempts) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            continue;
          }

          // All retries exhausted
          setError(lastError);
          setLoading(false);

          // Error callbacks
          onError?.(lastError);
          if (showErrorToast) {
            const message = errorParser(lastError);
            showToast(message, 'error', 4000);
          }

          return undefined;
        }
      }

      return undefined;
    },
    [
      asyncFunction,
      retryAttempts,
      retryDelay,
      onSuccess,
      onError,
      showErrorToast,
      showSuccessToast,
      successMessage,
      errorParser,
      showToast,
    ]
  );

  const retry = useCallback(async (): Promise<T | undefined> => {
    if (lastArgsRef.current) {
      return execute(...lastArgsRef.current);
    }
    return undefined;
  }, [execute]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(initialData);
    lastArgsRef.current = null;
  }, [initialData]);

  return {
    execute,
    loading,
    error,
    data,
    retry,
    reset,
  };
};

/**
 * Default error parser
 * Converts various error types to user-friendly messages
 */
const parseError = (error: unknown): string => {
  if (error instanceof Error) {
    // Check for specific error types
    if (error.message.includes('Network request failed')) {
      return '📡 Network error. Check your internet connection.';
    }
    if (error.message.includes('timeout')) {
      return '⏱️ Request timed out. Please try again.';
    }
    if (error.message.includes('GPS')) {
      return '📍 GPS unavailable. Enable location services.';
    }
    if (error.message.includes('grace period')) {
      return '⏳ Block is still in grace period.';
    }
    if (error.message.includes('already owned')) {
      return '🚫 This block is already owned.';
    }
    if (error.message.includes('unauthorized') || error.message.includes('401')) {
      return '🔒 Session expired. Please sign in again.';
    }
    if (error.message.includes('forbidden') || error.message.includes('403')) {
      return '⛔ You don&apos;t have permission to do this.';
    }
    if (error.message.includes('not found') || error.message.includes('404')) {
      return '🔍 Resource not found.';
    }
    if (error.message.includes('server') || error.message.includes('500')) {
      return '🔧 Server error. Please try again later.';
    }

    // Return the error message if it's user-friendly
    if (error.message.length < 100) {
      return error.message;
    }
  }

  // Generic fallback
  return '❌ Something went wrong. Please try again.';
};

/**
 * useAsyncOperation Hook (simplified version)
 * 
 * Simplified hook for quick async operations without toast notifications.
 * 
 * @example
 * const { execute, loading, error } = useAsyncOperation(fetchData);
 */
export const useAsyncOperation = <T, Args extends unknown[]>(
  asyncFunction: (...args: Args) => Promise<T>
) => {
  return useAsyncError<T, Args>(asyncFunction, {
    showErrorToast: false,
    showSuccessToast: false,
  });
};

/**
 * useAsyncCallback Hook
 * 
 * Wraps a callback function with loading and error handling.
 * Useful for form submissions and button actions.
 * 
 * @example
 * const [handleSubmit, { loading, error }] = useAsyncCallback(async () => {
 *   await submitForm(data);
 * });
 */
export const useAsyncCallback = <Args extends unknown[]>(
  callback: (...args: Args) => Promise<void>,
  options: UseAsyncErrorOptions<void> = {}
): [
  (...args: Args) => Promise<void>,
  { loading: boolean; error: Error | null; retry: () => Promise<void | undefined> }
] => {
  const { execute, loading, error, retry } = useAsyncError(callback, options);

  const wrappedExecute = useCallback(
    async (...args: Args) => {
      await execute(...args);
    },
    [execute]
  );

  return [wrappedExecute, { loading, error, retry }];
};
