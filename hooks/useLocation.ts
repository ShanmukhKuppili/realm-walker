/**
 * useLocation Hook
 * Custom React Hook for easy location tracking integration
 * 
 * Usage:
 * ```tsx
 * const { currentBlock, isTracking, startTracking, stopTracking, requestPermission } = useLocation();
 * ```
 */
import * as LocationService from '@/services/locationService';
import { RootState } from '@/store';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useSelector } from 'react-redux';

export const useLocation = () => {
  const location = useSelector((state: RootState) => state.location);
  
  const [permissionStatus, setPermissionStatus] = useState<{
    foreground: string;
    background: string;
  }>({ foreground: 'undetermined', background: 'undetermined' });
  
  // Use Redux currentBlock instead of local state
  const currentBlock = location.currentBlock ? {
    blockId: location.currentBlock.id,
    latitude: location.currentBlock.coordinates.latitude,
    longitude: location.currentBlock.coordinates.longitude,
    accuracy: location.accuracy,
  } : null;

  /**
   * Check current location permission status
   */
  const checkPermissions = useCallback(async () => {
    const status = await LocationService.checkLocationPermission();
    setPermissionStatus(status);
    return status;
  }, []);

  /**
   * Check permission status on mount
   */
  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  /**
   * Request location permissions with user-friendly dialog
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const result = await LocationService.requestLocationPermission();
      
      if (result.granted) {
        await checkPermissions();
        return true;
      } else {
        Alert.alert(
          'Location Permission Required',
          'Realm Walker needs location access to track your territory exploration. Please enable location permissions in your device settings.',
          [{ text: 'OK' }]
        );
        return false;
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  }, [checkPermissions]);

  /**
   * Get current block once
   */
  const fetchCurrentBlock = useCallback(async () => {
    const block = await LocationService.getCurrentBlock();
    // Block is set by locationService directly in Redux
    return block;
  }, []);

  /**
   * Start continuous location tracking
   */
  const startTracking = useCallback(async (): Promise<boolean> => {
    const status = await checkPermissions();
    
    if (status.foreground !== 'granted') {
      const granted = await requestPermission();
      if (!granted) {
        return false;
      }
    }

    const started = await LocationService.startTracking();

    if (started) {
      // isTracking is now managed by Redux via locationService
      // Fetch initial location
      await fetchCurrentBlock();
    }

    return started;
  }, [checkPermissions, requestPermission, fetchCurrentBlock]);

  /**
   * Stop location tracking
   */
  const stopTracking = useCallback(async () => {
    await LocationService.stopTracking();
    // isTracking is now managed by Redux via locationService
  }, []);

  return {
    // Current location state
    currentBlock,
    latitude: location.latitude,
    longitude: location.longitude,
    accuracy: location.accuracy,
    timestamp: location.timestamp,
    
    // Tracking state from Redux
    isTracking: location.isTracking,
    
    // Permission state
    permissionStatus,
    hasLocationPermission: permissionStatus.foreground === 'granted',
    hasBackgroundPermission: permissionStatus.background === 'granted',
    
    // Actions
    startTracking,
    stopTracking,
    requestPermission,
    checkPermissions,
    fetchCurrentBlock,
    
    // Utility functions
    generateBlockId: LocationService.generateBlockId,
    calculateDistance: LocationService.calculateDistance,
    isWithinClaimRange: LocationService.isWithinClaimRange,
    detectSuspiciousMovement: LocationService.detectSuspiciousMovement,
    getBlocksInRadius: LocationService.getBlocksInRadius,
  };
};
