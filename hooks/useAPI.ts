/**
 * useAPI Hook
 * Custom hook for making API calls with loading and error states
 */
import { ApiError } from '@/services/apiService';
import { useCallback, useState } from 'react';

export interface UseAPIState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  statusCode?: number;
}

export interface UseAPIResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  statusCode?: number;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

/**
 * Custom hook for API calls with automatic loading/error state management
 * 
 * @param apiFunction - The API function to call (from apiService)
 * @returns Object containing data, loading, error states and execute function
 * 
 * @example
 * const { data, loading, error, execute } = useAPI(apiService.claimBlock);
 * 
 * const handleClaim = async () => {
 *   const result = await execute({ blockId: '123', userId: 'user1', ... });
 *   if (result) {
 *     console.log('Block claimed:', result);
 *   }
 * };
 */
export function useAPI<T, Args extends any[] = any[]>(
  apiFunction: (...args: Args) => Promise<T>
): UseAPIResult<T> {
  const [state, setState] = useState<UseAPIState<T>>({
    data: null,
    loading: false,
    error: null,
    statusCode: undefined,
  });

  /**
   * Execute the API call
   */
  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      setState({
        data: null,
        loading: true,
        error: null,
        statusCode: undefined,
      });

      try {
        const result = await apiFunction(...args);
        setState({
          data: result,
          loading: false,
          error: null,
          statusCode: 200,
        });
        return result;
      } catch (err) {
        const error = err as ApiError;
        setState({
          data: null,
          loading: false,
          error: error.message || 'An unexpected error occurred',
          statusCode: error.statusCode,
        });
        return null;
      }
    },
    [apiFunction]
  );

  /**
   * Reset state to initial values
   */
  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      statusCode: undefined,
    });
  }, []);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    statusCode: state.statusCode,
    execute,
    reset,
  };
}

/**
 * useAPIQuery Hook
 * For GET requests that should execute immediately
 * 
 * @param apiFunction - The API function to call
 * @param args - Arguments to pass to the API function
 * @param enabled - Whether to execute the query (default: true)
 * 
 * @example
 * const { data, loading, error, refetch } = useAPIQuery(
 *   apiService.getPlayerStats,
 *   ['user123'],
 *   true
 * );
 */
export function useAPIQuery<T, Args extends any[] = any[]>(
  apiFunction: (...args: Args) => Promise<T>,
  args: Args,
  enabled: boolean = true
): UseAPIResult<T> & { refetch: () => Promise<T | null> } {
  const apiResult = useAPI(apiFunction);

  // Execute on mount if enabled
  useState(() => {
    if (enabled) {
      apiResult.execute(...args);
    }
  });

  /**
   * Refetch the data
   */
  const refetch = useCallback(async (): Promise<T | null> => {
    return apiResult.execute(...args);
  }, [apiResult, args]);

  return {
    ...apiResult,
    refetch,
  };
}

/**
 * useAPIMutation Hook
 * For POST/PUT/DELETE requests that should be triggered manually
 * Includes optimistic updates support
 * 
 * @param apiFunction - The API function to call
 * @param options - Configuration options
 * 
 * @example
 * const { mutate, loading, error } = useAPIMutation(apiService.claimBlock, {
 *   onSuccess: (data) => console.log('Success:', data),
 *   onError: (error) => console.error('Error:', error),
 * });
 * 
 * await mutate({ blockId: '123', userId: 'user1', ... });
 */
export interface MutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string, statusCode?: number) => void;
  onSettled?: () => void;
}

export function useAPIMutation<T, Args extends any[] = any[]>(
  apiFunction: (...args: Args) => Promise<T>,
  options?: MutationOptions<T>
): Omit<UseAPIResult<T>, 'execute'> & {
  mutate: (...args: Args) => Promise<T | null>;
  isSuccess: boolean;
} {
  const apiResult = useAPI(apiFunction);
  const [isSuccess, setIsSuccess] = useState(false);

  const mutate = useCallback(
    async (...args: Args): Promise<T | null> => {
      setIsSuccess(false);
      const result = await apiResult.execute(...args);

      if (result) {
        setIsSuccess(true);
        options?.onSuccess?.(result);
      } else if (apiResult.error) {
        options?.onError?.(apiResult.error, apiResult.statusCode);
      }

      options?.onSettled?.();

      return result;
    },
    [apiResult, options]
  );

  return {
    data: apiResult.data,
    loading: apiResult.loading,
    error: apiResult.error,
    statusCode: apiResult.statusCode,
    reset: apiResult.reset,
    mutate,
    isSuccess,
  };
}

/**
 * Example Usage:
 * 
 * // Simple API call
 * const { data, loading, error, execute } = useAPI(apiService.claimBlock);
 * await execute({ blockId: '123', userId: 'user1', latitude: 40.7, longitude: -74.0, timestamp: Date.now() });
 * 
 * // Query (auto-execute)
 * const { data, loading, error, refetch } = useAPIQuery(
 *   apiService.getPlayerStats,
 *   ['user123']
 * );
 * 
 * // Mutation with callbacks
 * const { mutate, loading, error, isSuccess } = useAPIMutation(
 *   apiService.collectResources,
 *   {
 *     onSuccess: (data) => {
 *       console.log('Collected:', data.gold, 'gold');
 *     },
 *     onError: (error) => {
 *       Alert.alert('Error', error);
 *     },
 *   }
 * );
 * 
 * await mutate('user123');
 */
