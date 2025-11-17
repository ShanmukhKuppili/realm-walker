/**
 * Lazy Loading Setup for Realm Walker
 * 
 * Implements code splitting and lazy loading for screens
 * to reduce initial bundle size and improve app startup time.
 */

import { LoadingSpinner } from '@/components/LoadingOverlay';
import React, { ComponentType, lazy, Suspense } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

// ============================================================================
// Loading Fallback Components
// ============================================================================

/**
 * Default loading fallback
 */
export function DefaultLoadingFallback() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

/**
 * Screen-specific loading fallback
 */
export function ScreenLoadingFallback({ screenName }: { screenName: string }) {
  return (
    <View style={styles.loadingContainer}>
      <LoadingSpinner size="large" message={`Loading ${screenName}...`} />
    </View>
  );
}

/**
 * Minimal loading fallback (for fast screens)
 */
export function MinimalLoadingFallback() {
  return (
    <View style={styles.minimalLoadingContainer}>
      <ActivityIndicator size="small" color="#3b82f6" />
    </View>
  );
}

// ============================================================================
// Lazy Loading Wrapper
// ============================================================================

/**
 * Wrapper to lazy load a screen with custom fallback
 */
export function lazyLoadScreen<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc);

  return function LazyLoadedScreen(props: P) {
    return (
      <Suspense fallback={fallback || <DefaultLoadingFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// ============================================================================
// Lazy Loaded Screens
// ============================================================================

// Home Screen (load immediately - critical path)
export const LazyHomeScreen = lazy(
  () => import('@/screens/HomeScreen')
);

// Map Screen (load immediately - critical path)
export const LazyMapScreen = lazy(
  () => import('@/screens/MapScreen')
);

// Profile Screen (lazy load)
export const LazyProfileScreen = lazy(
  () => import('@/screens/ProfileScreen')
);

// Guilds Screen (lazy load)
export const LazyGuildsScreen = lazy(
  () => import('@/screens/GuildsScreen')
);

// Settings Screen (lazy load - low priority)
export const LazySettingsScreen = lazy(
  () => import('@/screens/SettingsScreen')
);

// Login Screen (load immediately - auth required)
export const LazyLoginScreen = lazy(
  () => import('@/screens/LoginScreen')
);

// Sign Up Screen (lazy load - auth flow)
export const LazySignUpScreen = lazy(
  () => import('@/screens/SignUpScreen')
);

// ============================================================================
// Lazy Loaded Components (Heavy)
// ============================================================================

// Heavy map components
export const LazyBlockOverlay = lazy(
  () => import('@/components/BlockOverlay')
);

// Resource components
export const LazyResourcePanel = lazy(
  () => import('@/components/ResourcePanel')
);

// Achievement components
export const LazyAchievementCard = lazy(
  () => import('@/components/AchievementCard')
);

// Leaderboard components
export const LazyLeaderboardSnippet = lazy(
  () => import('@/components/LeaderboardSnippet')
);

// ============================================================================
// Preloading Strategy
// ============================================================================

/**
 * Preload a lazy component
 * Call this when you know the user will navigate to a screen soon
 */
export function preloadScreen(
  importFunc: () => Promise<{ default: ComponentType<any> }>
) {
  // Trigger the import but don't wait for it
  importFunc().catch((err) => {
    console.warn('Failed to preload screen:', err);
  });
}

/**
 * Preload multiple screens
 */
export function preloadScreens(
  importFuncs: (() => Promise<{ default: ComponentType<any> }>)[]
) {
  importFuncs.forEach((importFunc) => preloadScreen(importFunc));
}

/**
 * Preload critical screens after app loads
 * Call this after the initial screen is rendered
 */
export function preloadCriticalScreens() {
  // Preload Profile and Guilds screens
  // These are likely to be navigated to next
  setTimeout(() => {
    preloadScreens([
      () => import('@/screens/ProfileScreen'),
      () => import('@/screens/GuildsScreen'),
    ]);
  }, 2000); // Wait 2 seconds after app load
}

/**
 * Preload low-priority screens
 * Call this when the app is idle
 */
export function preloadLowPriorityScreens() {
  setTimeout(() => {
    preloadScreens([
      () => import('@/screens/SettingsScreen'),
    ]);
  }, 5000); // Wait 5 seconds
}

// ============================================================================
// Usage in app/_layout.tsx
// ============================================================================

/*
import { Suspense, useEffect } from 'react';
import { Stack } from 'expo-router';
import { DefaultLoadingFallback, preloadCriticalScreens } from '@/examples/LazyLoadingSetup';
import {
  LazyHomeScreen,
  LazyMapScreen,
  LazyProfileScreen,
  LazyGuildsScreen,
  LazySettingsScreen,
} from '@/examples/LazyLoadingSetup';

export default function RootLayout() {
  // Preload screens after initial render
  useEffect(() => {
    preloadCriticalScreens();
  }, []);

  return (
    <Suspense fallback={<DefaultLoadingFallback />}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{ headerShown: false }}
        >
          {() => (
            <Suspense fallback={<DefaultLoadingFallback />}>
              <LazyHomeScreen />
            </Suspense>
          )}
        </Stack.Screen>
        
        <Stack.Screen name="map" options={{ title: "Map" }}>
          {() => (
            <Suspense fallback={<ScreenLoadingFallback screenName="Map" />}>
              <LazyMapScreen />
            </Suspense>
          )}
        </Stack.Screen>
        
        <Stack.Screen name="profile" options={{ title: "Profile" }}>
          {() => (
            <Suspense fallback={<ScreenLoadingFallback screenName="Profile" />}>
              <LazyProfileScreen />
            </Suspense>
          )}
        </Stack.Screen>
        
        <Stack.Screen name="guilds" options={{ title: "Guilds" }}>
          {() => (
            <Suspense fallback={<ScreenLoadingFallback screenName="Guilds" />}>
              <LazyGuildsScreen />
            </Suspense>
          )}
        </Stack.Screen>
        
        <Stack.Screen name="settings" options={{ title: "Settings" }}>
          {() => (
            <Suspense fallback={<ScreenLoadingFallback screenName="Settings" />}>
              <LazySettingsScreen />
            </Suspense>
          )}
        </Stack.Screen>
      </Stack>
    </Suspense>
  );
}
*/

// ============================================================================
// Alternative: Route-based Code Splitting
// ============================================================================

/**
 * Create lazy route with preloading
 */
export function createLazyRoute<P extends object>(config: {
  importFunc: () => Promise<{ default: ComponentType<P> }>;
  fallback?: React.ReactNode;
  preload?: boolean;
}) {
  const { importFunc, fallback, preload = false } = config;

  // Preload if requested
  if (preload) {
    preloadScreen(importFunc);
  }

  return lazyLoadScreen(importFunc, fallback);
}

// Example usage
export const routes = {
  home: createLazyRoute({
    importFunc: () => import('@/screens/HomeScreen'),
    fallback: <ScreenLoadingFallback screenName="Home" />,
    preload: true, // Critical screen
  }),
  map: createLazyRoute({
    importFunc: () => import('@/screens/MapScreen'),
    fallback: <ScreenLoadingFallback screenName="Map" />,
    preload: true, // Critical screen
  }),
  profile: createLazyRoute({
    importFunc: () => import('@/screens/ProfileScreen'),
    fallback: <ScreenLoadingFallback screenName="Profile" />,
    preload: false, // Load on demand
  }),
  guilds: createLazyRoute({
    importFunc: () => import('@/screens/GuildsScreen'),
    fallback: <ScreenLoadingFallback screenName="Guilds" />,
    preload: false, // Load on demand
  }),
  settings: createLazyRoute({
    importFunc: () => import('@/screens/SettingsScreen'),
    fallback: <ScreenLoadingFallback screenName="Settings" />,
    preload: false, // Low priority
  }),
};

// ============================================================================
// Performance Monitoring
// ============================================================================

/**
 * Track lazy loading performance
 */
export function trackLazyLoadPerformance(
  screenName: string,
  startTime: number
) {
  const loadTime = Date.now() - startTime;
  console.log(`[Lazy Load] ${screenName} loaded in ${loadTime}ms`);
  
  // Send to analytics
  // analytics.track('screen_lazy_load', {
  //   screen: screenName,
  //   loadTime,
  // });
}

/**
 * Lazy load with performance tracking
 */
export function lazyLoadWithTracking<P extends object>(
  screenName: string,
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode
) {
  const startTime = Date.now();
  
  const LazyComponent = lazy(async () => {
    const component = await importFunc();
    trackLazyLoadPerformance(screenName, startTime);
    return component;
  });

  return function TrackedLazyScreen(props: P) {
    return (
      <Suspense fallback={fallback || <DefaultLoadingFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  minimalLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});

// ============================================================================
// Best Practices
// ============================================================================

/*
1. **Prioritize Critical Screens**
   - Load Home and Map screens immediately
   - Lazy load Profile, Guilds, Settings

2. **Preload Predictable Navigation**
   - Preload Profile when user opens app
   - Preload Guilds when user navigates to Map
   - Preload Settings when app is idle

3. **Use Appropriate Fallbacks**
   - Fast screens: Minimal fallback
   - Heavy screens: Full loading screen with message
   - Critical screens: Branded loading screen

4. **Monitor Performance**
   - Track lazy load times
   - Identify slow-loading screens
   - Optimize import sizes

5. **Bundle Analysis**
   - Run `npx react-native-bundle-visualizer`
   - Identify large dependencies
   - Split large modules

Expected Results:
- 40-60% faster initial app startup
- 20-30% smaller initial bundle
- Smoother navigation (preloading)
- Better perceived performance
*/
