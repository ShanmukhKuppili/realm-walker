/**
 * Custom Hook: useLocationTracking
 * Manages location tracking lifecycle and updates Redux state
 * 
 * ⚠️ DEPRECATED: This hook is not currently used. MapScreen uses useLocation hook instead.
 * 
 * ISSUE: This hook imports functions that don't exist in locationService.ts:
 * - coordinatesToGrid (doesn't exist)
 * - getCurrentLocation (should be getCurrentBlock)
 * - gridToBlockId (doesn't exist)
 * - startLocationWatch (should be startTracking)
 * - stopLocationWatch (should be stopTracking)
 * 
 * If you need to use this hook, fix the imports to match the actual locationService exports.
 */

/*
import {
    coordinatesToGrid,
    getCurrentLocation,
    gridToBlockId,
    requestLocationPermission,
    startLocationWatch,
    stopLocationWatch,
} from '@/services/locationService';
import { useAppDispatch, useAppSelector } from '@/store';
import {
    setCurrentBlock,
    setCurrentLocation,
    setLocationError,
    setPermission,
    setTracking,
} from '@/store/slices/locationSlice';
import { Coordinates } from '@/types';
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

export const useLocationTracking = () => {
  const dispatch = useAppDispatch();
  const isTracking = useAppSelector((state) => state.location.isTracking);
  const [subscription, setSubscription] = useState<Location.LocationSubscription | null>(null);

  // Request permission on mount
  useEffect(() => {
    initializeLocation();
  }, []);

  const initializeLocation = async () => {
    const granted = await requestLocationPermission();
    
    if (granted) {
      dispatch(setPermission('granted'));
      // Get initial location
      const location = await getCurrentLocation();
      if (location) {
        handleLocationUpdate(location);
      }
    } else {
      dispatch(setPermission('denied'));
      dispatch(setLocationError('Location permission denied'));
    }
  };

  const handleLocationUpdate = useCallback((location: Coordinates) => {
    dispatch(setCurrentLocation(location));

    // Calculate current block
    const grid = coordinatesToGrid(location);
    const blockId = gridToBlockId(grid);
    
    console.log('📍 [LOCATION] Location updated:', {
      lat: location.latitude.toFixed(6),
      lng: location.longitude.toFixed(6),
      gridX: grid.x,
      gridY: grid.y,
      blockId,
    });
    
    // Update current block in state
    dispatch(setCurrentBlock({
      id: blockId,
      coordinates: location,
      gridX: grid.x,
      gridY: grid.y,
      ownerType: 'neutral',
      level: 1,
    }));
  }, [dispatch]);

  const startTracking = useCallback(async () => {
    if (isTracking) return;

    const sub = await startLocationWatch(handleLocationUpdate);
    
    if (sub) {
      setSubscription(sub);
      dispatch(setTracking(true));
    } else {
      dispatch(setLocationError('Failed to start location tracking'));
    }
  }, [isTracking, handleLocationUpdate, dispatch]);

  const stopTracking = useCallback(() => {
    if (subscription) {
      stopLocationWatch(subscription);
      setSubscription(null);
      dispatch(setTracking(false));
    }
  }, [subscription, dispatch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (subscription) {
        stopLocationWatch(subscription);
      }
    };
  }, [subscription]);

  return {
    isTracking,
    startTracking,
    stopTracking,
    initializeLocation,
  };
};
*/

// Export a dummy function to avoid import errors
export const useLocationTracking = () => {
  console.warn('useLocationTracking is deprecated. Use useLocation hook instead.');
  return {
    isTracking: false,
    startTracking: async () => { },
    stopTracking: () => { },
    initializeLocation: async () => { },
  };
};
