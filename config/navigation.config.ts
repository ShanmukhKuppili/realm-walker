/**
 * Navigation Configuration
 * Central configuration for tab navigation, icons, and deep linking
 */
import { Platform } from 'react-native';

export type TabName = 'index' | 'map' | 'profile' | 'guilds' | 'settings';

export interface TabConfig {
  name: TabName;
  title: string;
  icon: string;
  iconFocused: string;
  badge?: string | number;
}

/**
 * Tab Navigation Icons
 * Using Ionicons from @expo/vector-icons
 */
export const TAB_ICONS = {
  index: {
    default: 'home-outline' as const,
    focused: 'home' as const,
  },
  map: {
    default: 'map-outline' as const,
    focused: 'map' as const,
  },
  profile: {
    default: 'person-outline' as const,
    focused: 'person' as const,
  },
  guilds: {
    default: 'people-outline' as const,
    focused: 'people' as const,
  },
  settings: {
    default: 'settings-outline' as const,
    focused: 'settings' as const,
  },
};

/**
 * Tab Bar Styling - Platform Specific
 */
export const TAB_BAR_STYLE = {
  height: Platform.select({
    ios: 88, // Account for safe area on iOS
    android: 60,
    default: 60,
  }),
  paddingBottom: Platform.select({
    ios: 24, // More padding on iOS for home indicator
    android: 8,
    default: 8,
  }),
  paddingTop: 8,
  backgroundColor: '#0f172a', // Dark theme
  borderTopWidth: 1,
  borderTopColor: '#1e293b',
  elevation: 8, // Android shadow
  shadowColor: '#000', // iOS shadow
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
};

/**
 * Tab Bar Colors
 */
export const TAB_COLORS = {
  active: '#3b82f6', // Blue
  inactive: '#64748b', // Gray
  badge: '#ef4444', // Red
  badgeText: '#ffffff',
};

/**
 * Tab Bar Icon Size
 */
export const TAB_ICON_SIZE = Platform.select({
  ios: 28,
  android: 24,
  default: 24,
});

/**
 * Deep Linking Configuration
 * For handling app:// and https:// deep links
 */
export const DEEP_LINK_CONFIG = {
  prefixes: ['realmwalker://', 'https://realmwalker.app'],
  config: {
    screens: {
      index: {
        path: 'home',
        screens: {
          Home: '',
        },
      },
      map: {
        path: 'map',
        screens: {
          Map: '',
          BlockDetail: 'block/:blockId',
        },
      },
      profile: {
        path: 'profile',
        screens: {
          Profile: '',
          EditProfile: 'edit',
        },
      },
      guilds: {
        path: 'guilds',
        screens: {
          Guilds: '',
          GuildDetail: 'guild/:guildId',
        },
      },
      settings: {
        path: 'settings',
        screens: {
          Settings: '',
        },
      },
    },
  },
};

/**
 * Screen Options for Each Tab
 */
export const SCREEN_OPTIONS = {
  index: {
    title: 'Home',
    headerTitle: 'Realm Walker',
  },
  map: {
    title: 'Map',
    headerTitle: 'Territory Map',
  },
  profile: {
    title: 'Profile',
    headerTitle: 'My Profile',
  },
  guilds: {
    title: 'Guilds',
    headerTitle: 'Guilds',
  },
  settings: {
    title: 'Settings',
    headerTitle: 'Settings',
  },
};

/**
 * Get badge count for Map tab
 * Returns number of blocks that need attention
 */
export function getMapBadgeCount(blocks: any[]): number | undefined {
  if (!blocks || blocks.length === 0) return undefined;
  
  // Count blocks that need claiming or are about to expire
  const now = Date.now();
  const expiringThreshold = 2 * 60 * 60 * 1000; // 2 hours
  
  const count = blocks.filter((block) => {
    // Check if block is expiring soon
    if (block.expiresAt) {
      const timeUntilExpiry = block.expiresAt - now;
      return timeUntilExpiry > 0 && timeUntilExpiry < expiringThreshold;
    }
    return false;
  }).length;
  
  return count > 0 ? count : undefined;
}

/**
 * Format badge count for display
 * Shows "99+" for counts over 99
 */
export function formatBadgeCount(count: number | undefined): string | undefined {
  if (!count) return undefined;
  return count > 99 ? '99+' : count.toString();
}
