/**
 * GPS Battery Optimization for Realm Walker
 * 
 * Implements intelligent GPS tracking strategies to minimize battery drain
 * while maintaining accurate location tracking for block claiming.
 */

import * as Battery from 'expo-battery';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { useCallback, useEffect, useRef, useState } from 'react';

// ============================================================================
// GPS Accuracy Levels
// ============================================================================

export enum GPSAccuracy {
  HIGH = 'HIGH',           // <10m accuracy, highest battery drain
  BALANCED = 'BALANCED',   // 10-50m accuracy, moderate battery
  LOW = 'LOW',             // 50-100m accuracy, low battery
  PASSIVE = 'PASSIVE',     // Use other app's location, minimal battery
}

export const ACCURACY_CONFIG = {
  [GPSAccuracy.HIGH]: {
    accuracy: Location.Accuracy.BestForNavigation,
    distanceInterval: 5, // meters
    timeInterval: 3000, // ms
    description: 'Maximum accuracy, high battery use',
    batteryDrain: 'High (5-8% per hour)',
  },
  [GPSAccuracy.BALANCED]: {
    accuracy: Location.Accuracy.Balanced,
    distanceInterval: 10,
    timeInterval: 5000,
    description: 'Good accuracy, moderate battery use',
    batteryDrain: 'Moderate (3-5% per hour)',
  },
  [GPSAccuracy.LOW]: {
    accuracy: Location.Accuracy.Low,
    distanceInterval: 20,
    timeInterval: 10000,
    description: 'Basic accuracy, low battery use',
    batteryDrain: 'Low (1-3% per hour)',
  },
  [GPSAccuracy.PASSIVE]: {
    accuracy: Location.Accuracy.Lowest,
    distanceInterval: 50,
    timeInterval: 30000,
    description: 'Passive updates, minimal battery',
    batteryDrain: 'Minimal (<1% per hour)',
  },
};

// ============================================================================
// Dynamic GPS Strategy
// ============================================================================

/**
 * Determine optimal GPS accuracy based on battery level and app state
 */
export function getOptimalGPSAccuracy(
  batteryLevel: number,
  isAppActive: boolean,
  userPreference?: GPSAccuracy
): GPSAccuracy {
  // User override
  if (userPreference) {
    return userPreference;
  }

  // Critical battery - minimal tracking
  if (batteryLevel < 0.15) {
    return GPSAccuracy.PASSIVE;
  }

  // Low battery - reduce accuracy
  if (batteryLevel < 0.30) {
    return isAppActive ? GPSAccuracy.LOW : GPSAccuracy.PASSIVE;
  }

  // Moderate battery - balanced approach
  if (batteryLevel < 0.60) {
    return isAppActive ? GPSAccuracy.BALANCED : GPSAccuracy.LOW;
  }

  // Good battery - use high accuracy when app is active
  return isAppActive ? GPSAccuracy.HIGH : GPSAccuracy.BALANCED;
}

// ============================================================================
// Adaptive GPS Hook
// ============================================================================

export interface AdaptiveGPSConfig {
  // User preference (overrides adaptive logic)
  preferredAccuracy?: GPSAccuracy;
  
  // Enable/disable adaptive behavior
  enableAdaptive?: boolean;
  
  // Enable background tracking
  enableBackground?: boolean;
  
  // Callbacks
  onLocationUpdate?: (location: Location.LocationObject) => void;
  onAccuracyChange?: (accuracy: GPSAccuracy) => void;
  onError?: (error: Error) => void;
}

export function useAdaptiveGPS(config: AdaptiveGPSConfig = {}) {
  const {
    preferredAccuracy,
    enableAdaptive = true,
    enableBackground = false,
    onLocationUpdate,
    onAccuracyChange,
    onError,
  } = config;

  const [currentAccuracy, setCurrentAccuracy] = useState<GPSAccuracy>(GPSAccuracy.BALANCED);
  const [batteryLevel, setBatteryLevel] = useState<number>(1.0);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());

  // Monitor battery level
  useEffect(() => {
    let batterySubscription: Battery.Subscription | null = null;

    async function setupBatteryMonitoring() {
      try {
        // Get initial battery level
        const level = await Battery.getBatteryLevelAsync();
        setBatteryLevel(level);

        // Subscribe to battery changes
        batterySubscription = Battery.addBatteryLevelListener(({ batteryLevel: level }) => {
          setBatteryLevel(level);
        });
      } catch (err) {
        console.warn('Battery monitoring not available:', err);
      }
    }

    setupBatteryMonitoring();

    return () => {
      batterySubscription?.remove();
    };
  }, []);

  // Adjust GPS accuracy based on battery level
  useEffect(() => {
    if (!enableAdaptive) return;

    const newAccuracy = getOptimalGPSAccuracy(
      batteryLevel,
      true, // Assuming app is active when using this hook
      preferredAccuracy
    );

    if (newAccuracy !== currentAccuracy) {
      setCurrentAccuracy(newAccuracy);
      onAccuracyChange?.(newAccuracy);
      
      // Restart tracking with new accuracy
      if (isTracking) {
        stopTracking();
        setTimeout(() => startTracking(), 100);
      }
    }
  }, [batteryLevel, enableAdaptive, preferredAccuracy]);

  // Start GPS tracking
  const startTracking = useCallback(async () => {
    try {
      // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }

      // Request background permission if needed
      if (enableBackground) {
        const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
        if (bgStatus !== 'granted') {
          console.warn('Background location permission not granted');
        }
      }

      // Get accuracy config
      const accuracyConfig = ACCURACY_CONFIG[currentAccuracy];

      // Start location updates
      subscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: accuracyConfig.accuracy,
          distanceInterval: accuracyConfig.distanceInterval,
          timeInterval: accuracyConfig.timeInterval,
        },
        (newLocation) => {
          setLocation(newLocation);
          lastUpdateRef.current = Date.now();
          onLocationUpdate?.(newLocation);
        }
      );

      setIsTracking(true);
    } catch (err) {
      onError?.(err as Error);
      console.error('Failed to start GPS tracking:', err);
    }
  }, [currentAccuracy, enableBackground, onLocationUpdate, onError]);

  // Stop GPS tracking
  const stopTracking = useCallback(() => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
    setIsTracking(false);
  }, []);

  // Get single location update (more battery efficient)
  const getSingleLocation = useCallback(async (): Promise<Location.LocationObject | null> => {
    try {
      const accuracyConfig = ACCURACY_CONFIG[currentAccuracy];
      const newLocation = await Location.getCurrentPositionAsync({
        accuracy: accuracyConfig.accuracy,
      });
      setLocation(newLocation);
      return newLocation;
    } catch (err) {
      onError?.(err as Error);
      return null;
    }
  }, [currentAccuracy, onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return {
    // State
    location,
    currentAccuracy,
    batteryLevel,
    isTracking,
    
    // Actions
    startTracking,
    stopTracking,
    getSingleLocation,
    
    // Config
    accuracyConfig: ACCURACY_CONFIG[currentAccuracy],
  };
}

// ============================================================================
// Background GPS Task
// ============================================================================

const BACKGROUND_LOCATION_TASK = 'background-location-task';

export function defineBackgroundLocationTask(
  onLocationUpdate: (location: Location.LocationObject) => void
) {
  TaskManager.defineTask(
    BACKGROUND_LOCATION_TASK,
    async ({ data, error }: TaskManager.TaskManagerTaskBody<Location.LocationData>) => {
      if (error) {
        console.error('Background location error:', error);
        return;
      }

      if (data) {
        const { locations } = data;
        const location = locations[0];
        
        if (location) {
          onLocationUpdate(location as Location.LocationObject);
        }
      }
    }
  );
}

export async function startBackgroundLocationTask(accuracy: GPSAccuracy = GPSAccuracy.LOW) {
  try {
    // Check if task is already registered
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
    if (!isRegistered) {
      throw new Error('Background location task not defined');
    }

    const accuracyConfig = ACCURACY_CONFIG[accuracy];

    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: accuracyConfig.accuracy,
      distanceInterval: accuracyConfig.distanceInterval,
      timeInterval: accuracyConfig.timeInterval,
      foregroundService: {
        notificationTitle: 'Realm Walker',
        notificationBody: 'Tracking your location',
      },
      pausesUpdatesAutomatically: true, // Pause when stationary
      showsBackgroundLocationIndicator: true,
    });

    console.log('Background location tracking started');
  } catch (err) {
    console.error('Failed to start background location:', err);
  }
}

export async function stopBackgroundLocationTask() {
  try {
    await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    console.log('Background location tracking stopped');
  } catch (err) {
    console.error('Failed to stop background location:', err);
  }
}

// ============================================================================
// Geofencing for Auto-Claim
// ============================================================================

export interface GeofenceConfig {
  latitude: number;
  longitude: number;
  radius: number; // meters
  notifyOnEnter: boolean;
  notifyOnExit: boolean;
}

const GEOFENCE_TASK = 'geofence-task';

export function defineGeofenceTask(
  onEnter: (region: Location.LocationRegion) => void,
  onExit: (region: Location.LocationRegion) => void
) {
  TaskManager.defineTask(
    GEOFENCE_TASK,
    async ({ data, error }: TaskManager.TaskManagerTaskBody<Location.LocationGeofencingEventData>) => {
      if (error) {
        console.error('Geofence error:', error);
        return;
      }

      if (data) {
        const { eventType, region } = data;
        
        if (eventType === Location.LocationGeofencingEventType.Enter) {
          onEnter(region);
        } else if (eventType === Location.LocationGeofencingEventType.Exit) {
          onExit(region);
        }
      }
    }
  );
}

export async function startGeofencing(geofences: GeofenceConfig[]) {
  try {
    const regions: Location.LocationRegion[] = geofences.map((fence, index) => ({
      identifier: `fence-${index}`,
      latitude: fence.latitude,
      longitude: fence.longitude,
      radius: fence.radius,
      notifyOnEnter: fence.notifyOnEnter,
      notifyOnExit: fence.notifyOnExit,
    }));

    await Location.startGeofencingAsync(GEOFENCE_TASK, regions);
    console.log('Geofencing started for', regions.length, 'regions');
  } catch (err) {
    console.error('Failed to start geofencing:', err);
  }
}

export async function stopGeofencing() {
  try {
    await Location.stopGeofencingAsync(GEOFENCE_TASK);
    console.log('Geofencing stopped');
  } catch (err) {
    console.error('Failed to stop geofencing:', err);
  }
}

// ============================================================================
// Power-Saving Strategies
// ============================================================================

/**
 * Detect if device is charging
 */
export async function isDeviceCharging(): Promise<boolean> {
  try {
    const batteryState = await Battery.getBatteryStateAsync();
    return batteryState === Battery.BatteryState.CHARGING;
  } catch {
    return false;
  }
}

/**
 * Detect if device is in low power mode
 */
export async function isLowPowerMode(): Promise<boolean> {
  try {
    const powerState = await Battery.getPowerStateAsync();
    return powerState.lowPowerMode;
  } catch {
    return false;
  }
}

/**
 * Hook to monitor power state and adjust GPS accordingly
 */
export function usePowerAwareGPS() {
  const [isCharging, setIsCharging] = useState(false);
  const [isLowPower, setIsLowPower] = useState(false);

  useEffect(() => {
    async function checkPowerState() {
      const charging = await isDeviceCharging();
      const lowPower = await isLowPowerMode();
      setIsCharging(charging);
      setIsLowPower(lowPower);
    }

    checkPowerState();
    const interval = setInterval(checkPowerState, 30000); // Check every 30s

    return () => clearInterval(interval);
  }, []);

  // Suggest GPS accuracy based on power state
  const suggestedAccuracy = (): GPSAccuracy => {
    if (isCharging) {
      return GPSAccuracy.HIGH; // Device is charging, use high accuracy
    }
    if (isLowPower) {
      return GPSAccuracy.PASSIVE; // Low power mode, minimal tracking
    }
    return GPSAccuracy.BALANCED; // Normal operation
  };

  return {
    isCharging,
    isLowPower,
    suggestedAccuracy: suggestedAccuracy(),
  };
}

// ============================================================================
// Usage Examples
// ============================================================================

/*
// Example 1: Simple adaptive GPS tracking
function MyMapScreen() {
  const { location, currentAccuracy, startTracking, stopTracking } = useAdaptiveGPS({
    enableAdaptive: true,
    onLocationUpdate: (loc) => {
      console.log('New location:', loc.coords);
    },
  });

  useEffect(() => {
    startTracking();
    return () => stopTracking();
  }, []);

  return (
    <View>
      <Text>Current Accuracy: {currentAccuracy}</Text>
      <Text>Battery Level: {batteryLevel * 100}%</Text>
    </View>
  );
}

// Example 2: Power-aware GPS
function MyMapScreenWithPowerAware() {
  const { isCharging, suggestedAccuracy } = usePowerAwareGPS();
  
  const { location, startTracking } = useAdaptiveGPS({
    preferredAccuracy: suggestedAccuracy,
  });

  return (
    <View>
      <Text>Charging: {isCharging ? 'Yes' : 'No'}</Text>
      <Text>Accuracy: {suggestedAccuracy}</Text>
    </View>
  );
}

// Example 3: Background location tracking
async function setupBackgroundTracking() {
  // Define the task
  defineBackgroundLocationTask((location) => {
    // Handle location update
    console.log('Background location:', location.coords);
    
    // Check if in claimable block
    // Auto-claim if criteria met
  });

  // Start background tracking
  await startBackgroundLocationTask(GPSAccuracy.LOW);
}

// Example 4: Geofencing for auto-claim
async function setupGeofencing() {
  defineGeofenceTask(
    (region) => {
      console.log('Entered region:', region.identifier);
      // Trigger auto-claim
    },
    (region) => {
      console.log('Exited region:', region.identifier);
    }
  );

  // Add geofences for claimed blocks
  const claimedBlocks = [
    { latitude: 37.7749, longitude: -122.4194, radius: 20 },
    { latitude: 37.7750, longitude: -122.4195, radius: 20 },
  ];

  await startGeofencing(
    claimedBlocks.map(block => ({
      ...block,
      notifyOnEnter: true,
      notifyOnExit: true,
    }))
  );
}
*/

// ============================================================================
// Battery Optimization Tips
// ============================================================================

/*
1. **Use Appropriate Accuracy**
   - HIGH: Only when actively claiming blocks
   - BALANCED: Normal walking/exploration
   - LOW: Background monitoring
   - PASSIVE: Low battery or idle

2. **Implement Smart Intervals**
   - Increase interval when stationary
   - Decrease when moving
   - Use distanceInterval over timeInterval

3. **Leverage Geofencing**
   - Use for claimed blocks
   - More battery efficient than continuous polling
   - Native OS support

4. **Pause When Unnecessary**
   - Stop tracking when app is backgrounded
   - Resume only for auto-claim feature
   - Use location updates only when needed

5. **Batch Location Updates**
   - Process multiple updates at once
   - Reduce wake-ups
   - Use deferred updates on iOS

Expected Battery Usage:
- HIGH accuracy: 5-8% per hour
- BALANCED: 3-5% per hour
- LOW: 1-3% per hour
- PASSIVE: <1% per hour

Target: <5% battery drain per hour of active gameplay
*/
