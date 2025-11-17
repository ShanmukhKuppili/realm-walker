/**
 * Location Tracking Service for Realm Walker
 * Handles GPS tracking, block ID generation, and permission management
 */
import { store } from '@/store';
import { setCurrentBlock, setTracking, updateLocation } from '@/store/slices/locationSlice';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { AppState, AppStateStatus, Platform } from 'react-native';


const LOCATION_TASK_NAME = 'realm-walker-location-task';

let locationSubscription: Location.LocationSubscription | null = null;
let appStateSubscription: any = null;

type LocationCallback = (locationData: {
  blockId: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
}) => void;

let customCallback: LocationCallback | null = null;

/**
 * Generate block ID: lat_lon with 4 decimals
 * Example: "40.7128_-74.0060"
 */
export const generateBlockId = (latitude: number, longitude: number): string => {
  const latRounded = parseFloat(latitude.toFixed(4));
  const lonRounded = parseFloat(longitude.toFixed(4));
  return `${latRounded}_${lonRounded}`;
};

/**
 * Request location permissions
 */
export const requestLocationPermission = async (): Promise<{
  granted: boolean;
  canRequestBackgroundPermission: boolean;
}> => {
  try {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    
    if (foregroundStatus !== 'granted') {
      console.warn('Foreground location permission denied');
      return { granted: false, canRequestBackgroundPermission: false };
    }

    if (Platform.OS === 'ios') {
      const { status: backgroundStatus} = await Location.requestBackgroundPermissionsAsync();
      return {
        granted: foregroundStatus === 'granted',
        canRequestBackgroundPermission: backgroundStatus === 'granted',
      };
    }

    return { granted: true, canRequestBackgroundPermission: true };
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return { granted: false, canRequestBackgroundPermission: false };
  }
};

/**
 * Check location permission status
 */
export const checkLocationPermission = async (): Promise<{
  foreground: string;
  background: string;
}> => {
  try {
    const { status: foregroundStatus } = await Location.getForegroundPermissionsAsync();
    const { status: backgroundStatus } = await Location.getBackgroundPermissionsAsync();
    
    return {
      foreground: foregroundStatus,
      background: backgroundStatus,
    };
  } catch (error) {
    console.error('Error checking location permission:', error);
    return { foreground: 'undetermined', background: 'undetermined' };
  }
};

/**
 * Get current block - Returns { blockId, latitude, longitude, accuracy }
 */
export const getCurrentBlock = async (): Promise<{
  blockId: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
} | null> => {
  try {
    const permissionStatus = await checkLocationPermission();
    
    if (permissionStatus.foreground !== 'granted') {
      console.warn('Location permission not granted');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const blockId = generateBlockId(
      location.coords.latitude,
      location.coords.longitude
    );

    return {
      blockId,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy || null,
    };
  } catch (error) {
    console.error('Error getting current block:', error);
    return null;
  }
};

/**
 * Handle location update
 */
const handleLocationUpdate = (location: Location.LocationObject) => {
  const blockId = generateBlockId(
    location.coords.latitude,
    location.coords.longitude
  );

  const locationData = {
    blockId,
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    accuracy: location.coords.accuracy || null,
  };

  // Update Redux location state (lat/lng)
  store.dispatch(
    updateLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy || null,
      timestamp: Date.now(),
    })
  );

  // Update Redux currentBlock state (needed for auto-claim)
  store.dispatch(
    setCurrentBlock({
      id: blockId,
      coordinates: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
      gridX: 0, // Will be calculated by grid utils if needed
      gridY: 0,
      ownerType: 'neutral',
      level: 1,
    })
  );

  // Call custom callback if provided
  if (customCallback) {
    customCallback(locationData);
  }

  console.log('[LocationService] Block update:', blockId);
};

/**
 * Start continuous tracking (every 5-10 seconds)
 */
export const startTracking = async (callback?: LocationCallback): Promise<boolean> => {
  try {
    const permissionStatus = await checkLocationPermission();
    
    if (permissionStatus.foreground !== 'granted') {
      console.warn('Cannot start tracking: location permission not granted');
      const requested = await requestLocationPermission();
      if (!requested.granted) {
        return false;
      }
    }

    if (locationSubscription) {
      locationSubscription.remove();
      locationSubscription = null;
    }

    if (callback) {
      customCallback = callback;
    }

    locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      },
      handleLocationUpdate
    );

    appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    // Update Redux to indicate tracking is active
    store.dispatch(setTracking(true));

    console.log('[LocationService] Tracking started');
    return true;
  } catch (error) {
    console.error('Error starting location tracking:', error);
    return false;
  }
};

/**
 * Stop location tracking
 */
export const stopTracking = async (): Promise<void> => {
  try {
    if (locationSubscription) {
      locationSubscription.remove();
      locationSubscription = null;
    }

    await stopBackgroundTracking();

    if (appStateSubscription) {
      appStateSubscription.remove();
      appStateSubscription = null;
    }

    customCallback = null;

    // Update Redux to indicate tracking is stopped
    store.dispatch(setTracking(false));

    console.log('[LocationService] Tracking stopped');
  } catch (error) {
    console.error('Error stopping location tracking:', error);
  }
};

/**
 * Handle app state changes for battery optimization
 */
const handleAppStateChange = async (nextAppState: AppStateStatus) => {
  console.log('[LocationService] App state changed to:', nextAppState);

  if (nextAppState === 'background' || nextAppState === 'inactive') {
    if (locationSubscription) {
      locationSubscription.remove();
      locationSubscription = null;
    }
    await startBackgroundTracking();
  } else if (nextAppState === 'active') {
    await stopBackgroundTracking();
    if (!locationSubscription && customCallback) {
      await startTracking(customCallback);
    }
  }
};

/**
 * Start background tracking
 */
const startBackgroundTracking = async (): Promise<boolean> => {
  try {
    const permissionStatus = await checkLocationPermission();
    
    if (permissionStatus.background !== 'granted') {
      console.warn('Background location permission not granted');
      return false;
    }

    const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
    if (isRegistered) {
      console.log('[LocationService] Background task already running');
      return true;
    }

    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 30000,
      distanceInterval: 50,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'Realm Walker Active',
        notificationBody: 'Tracking your territory exploration',
        notificationColor: '#2196F3',
      },
    });

    console.log('[LocationService] Background tracking started');
    return true;
  } catch (error) {
    console.error('Error starting background tracking:', error);
    return false;
  }
};

/**
 * Stop background tracking
 */
const stopBackgroundTracking = async (): Promise<void> => {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
    if (isRegistered) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      console.log('[LocationService] Background tracking stopped');
    }
  } catch (error) {
    console.error('Error stopping background tracking:', error);
  }
};

/**
 * Calculate distance between coordinates (Haversine formula) - Returns meters
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Check if within claiming range (20m x 20m block)
 */
export const isWithinClaimRange = (
  userLat: number,
  userLon: number,
  blockLat: number,
  blockLon: number
): boolean => {
  const distance = calculateDistance(userLat, userLon, blockLat, blockLon);
  const maxDistance = Math.sqrt(2) * 10;
  return distance <= maxDistance;
};

/**
 * Detect suspicious movement - Anti-cheat
 */
export const detectSuspiciousMovement = (
  prevLat: number,
  prevLon: number,
  currLat: number,
  currLon: number,
  timeElapsedMs: number
): boolean => {
  const distance = calculateDistance(prevLat, prevLon, currLat, currLon);
  const timeElapsedSeconds = timeElapsedMs / 1000;
  const speedMps = distance / timeElapsedSeconds;

  const MAX_REALISTIC_SPEED = 50;

  if (speedMps > MAX_REALISTIC_SPEED) {
    console.warn(
      `[LocationService] Suspicious movement detected: ${speedMps.toFixed(2)} m/s over ${distance.toFixed(0)}m`
    );
    return true;
  }

  return false;
};

/**
 * Get blocks in radius around location
 */
export const getBlocksInRadius = (
  centerLat: number,
  centerLon: number,
  radiusMeters: number
): { blockId: string; latitude: number; longitude: number }[] => {
  const blocks: { blockId: string; latitude: number; longitude: number }[] = [];
  
  const blockCount = Math.ceil(radiusMeters / 20);
  const degreeStep = 0.0001 * 2;

  for (let latOffset = -blockCount; latOffset <= blockCount; latOffset++) {
    for (let lonOffset = -blockCount; lonOffset <= blockCount; lonOffset++) {
      const lat = centerLat + latOffset * degreeStep;
      const lon = centerLon + lonOffset * degreeStep;
      
      if (calculateDistance(centerLat, centerLon, lat, lon) <= radiusMeters) {
        blocks.push({
          blockId: generateBlockId(lat, lon),
          latitude: lat,
          longitude: lon,
        });
      }
    }
  }

  return blocks;
};

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: any) => {
  if (error) {
    console.error('[LocationService] Background task error:', error);
    return;
  }

  if (data) {
    const { locations } = data;
    if (locations && locations.length > 0) {
      const location = locations[0];
      handleLocationUpdate(location);
    }
  }
});

export { LOCATION_TASK_NAME };
