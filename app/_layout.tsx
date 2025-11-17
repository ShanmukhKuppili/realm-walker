/**
 * Root Layout
 * Sets up Redux Provider, Navigation, and Authentication Flow
 */
import AuthNavigator from '@/components/AuthNavigator';
import {
    formatBadgeCount,
    getMapBadgeCount,
    SCREEN_OPTIONS,
    TAB_BAR_STYLE,
    TAB_COLORS,
    TAB_ICON_SIZE,
    TAB_ICONS,
} from '@/config/navigation.config';
import { AppDispatch, RootState, store } from '@/store';
import { initializeAuth } from '@/store/slices/authSlice';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Provider, useDispatch, useSelector } from 'react-redux';

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isInitializing } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Initialize authentication state on app start
    dispatch(initializeAuth());
  }, [dispatch]);

  // Show loading screen while initializing auth
  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  // Show auth screens if not authenticated
  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  // Show main app if authenticated
  return <>{children}</>;
}

function TabLayout() {
  // Get blocks for badge count
  const allBlocks = useSelector((state: RootState) => state.map.blocks || {});
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  
  // Calculate badge count for Map tab
  const ownedBlocks = useMemo(() => {
    return Object.values(allBlocks).filter((block: any) => block.ownerId === userId);
  }, [allBlocks, userId]);
  
  const mapBadgeCount = useMemo(() => {
    return getMapBadgeCount(ownedBlocks);
  }, [ownedBlocks]);
  
  const mapBadge = formatBadgeCount(mapBadgeCount);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: TAB_COLORS.active,
        tabBarInactiveTintColor: TAB_COLORS.inactive,
        tabBarStyle: TAB_BAR_STYLE,
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarBadgeStyle: {
          backgroundColor: TAB_COLORS.badge,
          color: TAB_COLORS.badgeText,
          fontSize: 10,
          fontWeight: 'bold',
          minWidth: 18,
          height: 18,
          borderRadius: 9,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: SCREEN_OPTIONS.index.title,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? TAB_ICONS.index.focused : TAB_ICONS.index.default}
              size={TAB_ICON_SIZE}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: SCREEN_OPTIONS.map.title,
          tabBarBadge: mapBadge,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? TAB_ICONS.map.focused : TAB_ICONS.map.default}
              size={TAB_ICON_SIZE}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: SCREEN_OPTIONS.profile.title,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? TAB_ICONS.profile.focused : TAB_ICONS.profile.default}
              size={TAB_ICON_SIZE}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="guilds"
        options={{
          title: SCREEN_OPTIONS.guilds.title,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? TAB_ICONS.guilds.focused : TAB_ICONS.guilds.default}
              size={TAB_ICON_SIZE}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: SCREEN_OPTIONS.settings.title,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? TAB_ICONS.settings.focused : TAB_ICONS.settings.default}
              size={TAB_ICON_SIZE}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AuthWrapper>
        <TabLayout />
      </AuthWrapper>
    </Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
