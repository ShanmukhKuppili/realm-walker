/**
 * Tab Navigation Icons - Visual Reference
 * Quick reference for all tab icons used in Realm Walker
 */

// ============================================
// TAB ICONS - Ionicons from @expo/vector-icons
// ============================================

/*
┌──────────────────────────────────────────────────────┐
│  TAB 1: HOME (Dashboard)                             │
├──────────────────────────────────────────────────────┤
│  Inactive: 🏠 home-outline                           │
│  Active:   🏠 home                                    │
│  Purpose:  Main dashboard with stats & achievements  │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  TAB 2: MAP (Territory Control)                      │
├──────────────────────────────────────────────────────┤
│  Inactive: 🗺️  map-outline                           │
│  Active:   🗺️  map                                    │
│  Purpose:  Claim blocks and view territory          │
│  Badge:    Shows blocks expiring within 2 hours     │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  TAB 3: PROFILE (Character & Stats)                  │
├──────────────────────────────────────────────────────┤
│  Inactive: 👤 person-outline                         │
│  Active:   👤 person                                  │
│  Purpose:  View character stats and resources       │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  TAB 4: GUILDS (Teams & Social)                      │
├──────────────────────────────────────────────────────┤
│  Inactive: 👥 people-outline                         │
│  Active:   👥 people                                  │
│  Purpose:  Join guilds and view team territory      │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  TAB 5: SETTINGS (App Options)                       │
├──────────────────────────────────────────────────────┤
│  Inactive: ⚙️  settings-outline                      │
│  Active:   ⚙️  settings                               │
│  Purpose:  App settings and preferences             │
└──────────────────────────────────────────────────────┘
*/

// ============================================
// ICON SIZES (Platform Specific)
// ============================================

/*
iOS:     28px (larger for better visibility)
Android: 24px (standard Material Design size)
*/

// ============================================
// TAB COLORS
// ============================================

/*
Active Tab:   #3b82f6 (Blue)     ████
Inactive Tab: #64748b (Gray)     ████
Badge:        #ef4444 (Red)      ████
Badge Text:   #ffffff (White)    ████
Background:   #0f172a (Dark)     ████
Border:       #1e293b (Darker)   ████
*/

// ============================================
// BADGE LOGIC
// ============================================

/*
MAP TAB BADGE:
- Shows when user has blocks expiring within 2 hours
- Format: "2" for count ≤ 99, "99+" for count > 99
- Updates automatically when blocks change
- Red background (#ef4444) with white text

Example:
  No blocks expiring:  [MAP] (no badge)
  2 blocks expiring:   [MAP] ②
  150 blocks expiring: [MAP] 99+
*/

// ============================================
// ALTERNATIVE ICON OPTIONS
// ============================================

/*
If you want to change icons, here are alternatives:

HOME alternatives:
- home-outline / home
- grid-outline / grid
- apps-outline / apps

MAP alternatives:
- map-outline / map
- navigate-outline / navigate
- compass-outline / compass
- location-outline / location

PROFILE alternatives:
- person-outline / person
- person-circle-outline / person-circle
- happy-outline / happy

GUILDS alternatives:
- people-outline / people
- people-circle-outline / people-circle
- shield-outline / shield
- trophy-outline / trophy

SETTINGS alternatives:
- settings-outline / settings
- cog-outline / cog
- options-outline / options
*/

// ============================================
// CUSTOM ICON IMPLEMENTATION
// ============================================

/*
To use custom SVG icons instead of Ionicons:

1. Install react-native-svg:
   npm install react-native-svg

2. Create custom icon component:
   import { Svg, Path } from 'react-native-svg';
   
   export function CustomMapIcon({ color, size }) {
     return (
       <Svg width={size} height={size} viewBox="0 0 24 24">
         <Path d="M..." fill={color} />
       </Svg>
     );
   }

3. Use in tab:
   tabBarIcon: ({ color, focused }) => (
     <CustomMapIcon color={color} size={TAB_ICON_SIZE} />
   )
*/

// ============================================
// ICON TESTING
// ============================================

/*
To test icons in isolation:

import { Ionicons } from '@expo/vector-icons';

// Test component
function IconTest() {
  return (
    <View style={{ flexDirection: 'row', gap: 20 }}>
      <Ionicons name="home-outline" size={28} color="#64748b" />
      <Ionicons name="home" size={28} color="#3b82f6" />
      
      <Ionicons name="map-outline" size={28} color="#64748b" />
      <Ionicons name="map" size={28} color="#3b82f6" />
      
      <Ionicons name="person-outline" size={28} color="#64748b" />
      <Ionicons name="person" size={28} color="#3b82f6" />
      
      <Ionicons name="people-outline" size={28} color="#64748b" />
      <Ionicons name="people" size={28} color="#3b82f6" />
      
      <Ionicons name="settings-outline" size={28} color="#64748b" />
      <Ionicons name="settings" size={28} color="#3b82f6" />
    </View>
  );
}
*/

export { }; // Make this a module

