/**
 * useNetworkStatus Hook
 * Detect and monitor online/offline connection status
 * Uses simple HTTP ping to detect internet connectivity
 */
import { useCallback, useEffect, useState } from 'react';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: 'wifi' | 'cellular' | 'none' | 'unknown';
}

/**
 * Check internet connectivity by pinging a reliable endpoint
 */
async function checkInternetConnectivity(): Promise<boolean> {
  try {
    // Try to fetch a small, reliable endpoint
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-cache',
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Hook to monitor network connectivity status
 * 
 * @returns NetworkStatus object with connection info
 * 
 * @example
 * const { isConnected, isInternetReachable, type } = useNetworkStatus();
 * 
 * if (!isConnected) {
 *   Alert.alert('Offline', 'You are currently offline');
 * }
 */
export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
  });

  const [isChecking, setIsChecking] = useState(true);

  /**
   * Check current network status
   */
  const checkNetworkStatus = useCallback(async () => {
    try {
      setIsChecking(true);
      const isReachable = await checkInternetConnectivity();
      
      setStatus({
        isConnected: isReachable,
        isInternetReachable: isReachable,
        type: isReachable ? 'unknown' : 'none',
      });
      
      setIsChecking(false);
    } catch (error) {
      console.error('Failed to check network status:', error);
      setStatus({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
      });
      setIsChecking(false);
    }
  }, []);

  /**
   * Poll network status periodically
   */
  useEffect(() => {
    // Check immediately
    checkNetworkStatus();

    // Set up polling interval (every 10 seconds to avoid excessive requests)
    const interval = setInterval(checkNetworkStatus, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [checkNetworkStatus]);

  return {
    ...status,
    isChecking,
    refresh: checkNetworkStatus,
  };
}

/**
 * useOnlineStatus Hook (Simplified)
 * Returns just a boolean for online/offline
 * 
 * @example
 * const isOnline = useOnlineStatus();
 * 
 * if (isOnline) {
 *   // Sync with backend
 * }
 */
export function useOnlineStatus(): boolean {
  const { isConnected, isInternetReachable } = useNetworkStatus();
  return isConnected && isInternetReachable;
}

/**
 * useNetworkListener Hook
 * Execute callbacks when network status changes
 * 
 * @param onOnline - Callback when going online
 * @param onOffline - Callback when going offline
 * 
 * @example
 * useNetworkListener(
 *   () => console.log('Back online!'),
 *   () => console.log('Gone offline!')
 * );
 */
export function useNetworkListener(
  onOnline?: () => void,
  onOffline?: () => void
) {
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const [wasOnline, setWasOnline] = useState(true);

  useEffect(() => {
    const isOnline = isConnected && isInternetReachable;

    if (isOnline && !wasOnline) {
      // Just came online
      onOnline?.();
    } else if (!isOnline && wasOnline) {
      // Just went offline
      onOffline?.();
    }

    setWasOnline(isOnline);
  }, [isConnected, isInternetReachable, wasOnline, onOnline, onOffline]);
}
