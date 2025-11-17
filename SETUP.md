# Realm Walker - Setup Instructions

## Project Overview
Realm Walker is a location-based fitness RPG built with React Native and Expo. Players claim territory blocks by walking in the real world, collect resources, gain XP, and compete with guilds.

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Expo CLI installed globally: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Emulator / physical device
- Firebase account (for authentication)

## Step 1: Install Dependencies

Navigate to the project directory and install all dependencies:

```bash
cd realm-walker
npm install
```

This will install all required packages including:
- React Native & Expo SDK
- React Navigation for bottom tabs
- Redux Toolkit & React-Redux for state management
- Firebase for authentication
- expo-location for GPS tracking
- react-native-maps for map display
- axios for API calls

## Step 2: Firebase Setup

### 2.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" and follow the wizard
3. Give your project a name (e.g., "realm-walker")
4. Disable Google Analytics (optional)

### 2.2 Enable Authentication
1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** provider
3. (Optional) Enable Google, Facebook, or other social providers

### 2.3 Create Firestore Database
1. Go to **Firestore Database** in Firebase Console
2. Click "Create database"
3. Start in **test mode** (change to production rules later)
4. Choose a location closest to your users

### 2.4 Get Firebase Config
1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click the **Web** icon (`</>`)
4. Register your app with a nickname
5. Copy the `firebaseConfig` object

### 2.5 Configure Environment Variables
Create a `.env` file in the project root:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

Replace the placeholder values with your actual Firebase config values.

## Step 3: Configure Location Permissions

### 3.1 iOS Configuration
Edit `app.json` and add:

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "Realm Walker needs your location to claim territory blocks.",
        "NSLocationAlwaysAndWhenInUseUsageDescription": "Realm Walker uses your location to track your journey and claim blocks even when the app is in the background."
      }
    }
  }
}
```

### 3.2 Android Configuration
Edit `app.json` and add:

```json
{
  "expo": {
    "android": {
      "permissions": [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION"
      ]
    }
  }
}
```

## Step 4: Configure Google Maps (Required for react-native-maps)

### 4.1 Get Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Maps SDK for Android** and **Maps SDK for iOS**
4. Create credentials > API Key
5. Restrict the key to your app (optional but recommended)

### 4.2 Add API Key to app.json

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_GOOGLE_MAPS_ANDROID_API_KEY"
        }
      }
    },
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_GOOGLE_MAPS_IOS_API_KEY"
      }
    }
  }
}
```

## Step 5: Run the App

### Development Server
Start the Expo development server:

```bash
npm start
```

This will open Expo Dev Tools in your browser.

### Run on iOS Simulator (Mac only)
```bash
npm run ios
```

### Run on Android Emulator/Device
```bash
npm run android
```

### Run on Web (Limited functionality)
```bash
npm run web
```

## Step 6: Test Core Features

### 6.1 Test Authentication
1. Navigate to Profile screen
2. Try signing up with email/password
3. Verify user is created in Firebase Console

### 6.2 Test Location Tracking
1. Grant location permissions when prompted
2. Navigate to Map screen
3. Verify your current location shows on the map
4. Try claiming a block

### 6.3 Test Redux State
1. Navigate to Home screen
2. Click "+100 XP (Test)" button
3. Verify XP increases and level ups work

## Step 7: Backend Setup (Optional)

The app currently uses Firebase for data storage, but you can set up a custom backend:

1. Create a Node.js/Express server
2. Implement REST API endpoints:
   - `POST /api/auth/signup` - User registration
   - `POST /api/auth/login` - User login
   - `GET /api/blocks` - Get blocks in region
   - `POST /api/blocks/claim` - Claim a block
   - `GET /api/guilds` - Get all guilds
   - `POST /api/guilds` - Create guild
3. Update `EXPO_PUBLIC_API_URL` in `.env`
4. Modify `services/apiService.ts` to use your endpoints

## Project Structure

```
realm-walker/
├── app/                    # Expo Router screens
│   ├── _layout.tsx        # Root layout with Redux & Navigation
│   ├── index.tsx          # Home tab (HomeScreen)
│   ├── map.tsx            # Map tab
│   ├── profile.tsx        # Profile tab
│   ├── guilds.tsx         # Guilds tab
│   └── settings.tsx       # Settings tab
├── screens/               # Screen components
│   ├── HomeScreen.tsx
│   ├── MapScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── GuildsScreen.tsx
│   └── SettingsScreen.tsx
├── store/                 # Redux store
│   ├── index.ts           # Store configuration
│   └── slices/            # Redux slices
│       ├── userSlice.ts
│       ├── locationSlice.ts
│       ├── mapSlice.ts
│       └── guildSlice.ts
├── services/              # External services
│   ├── firebase.ts        # Firebase auth & Firestore
│   ├── locationService.ts # GPS tracking & grid logic
│   └── apiService.ts      # REST API client
├── hooks/                 # Custom React hooks
│   └── useLocationTracking.ts
├── types/                 # TypeScript types
│   └── index.ts
├── utils/                 # Utility functions
│   └── helpers.ts
├── assets/                # Images, fonts, etc.
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
└── app.json               # Expo configuration
```

## Key Features Implemented

### ✅ Authentication
- Firebase Email/Password authentication
- User profile creation and management
- Sign in/Sign out functionality

### ✅ Redux State Management
- User state (profile, XP, level, resources)
- Location state (current position, tracking status)
- Map state (blocks, territory ownership)
- Guild state (current guild, members)

### ✅ Location Tracking
- Foreground GPS tracking
- Background location updates (when permissions granted)
- Grid-based block system (20m x 20m)
- Block claiming logic
- Anti-cheat detection for GPS spoofing

### ✅ Map Display
- React Native Maps integration
- Real-time user location marker
- Territory blocks visualization
- Color-coded ownership (user, guild, neutral)

### ✅ RPG Progression
- XP and leveling system
- Resource management (gold, mana, health)
- Block ownership tracking
- Achievement-ready structure

### ✅ Social Features
- Guild creation and joining
- Guild member management
- Leaderboard data structure
- Guild territory aggregation

### ✅ UI/UX
- Bottom tab navigation (5 screens)
- Responsive design
- Dark/Light theme support (in settings)
- Smooth animations and transitions

## Common Issues & Troubleshooting

### Issue: "Cannot find module 'react-native-maps'"
**Solution:** Install dependencies first: `npm install`

### Issue: Location permission denied on iOS
**Solution:** Go to iPhone Settings > Privacy > Location Services > Realm Walker and enable "Always"

### Issue: Map not showing on Android
**Solution:** Make sure you added Google Maps API key in `app.json`

### Issue: Firebase auth not working
**Solution:** Verify your Firebase config values in `.env` are correct

### Issue: TypeScript errors
**Solution:** Run `npm install` to ensure all type definitions are installed

## Next Steps

### Phase 2 Features to Implement
1. **Real-time Multiplayer**
   - WebSocket integration for live map updates
   - See other players on map
   - Real-time block claiming notifications

2. **Combat System**
   - Challenge other players for blocks
   - Guild wars
   - PvP battles

3. **Economy**
   - In-app shop for resources
   - Trading system between players
   - Premium membership

4. **Enhanced RPG**
   - Character classes (Warrior, Mage, Scout)
   - Skill trees and abilities
   - Equipment and inventory
   - Quests and daily challenges

5. **Backend Development**
   - Build REST API with Node.js/Express
   - Set up PostgreSQL with PostGIS
   - Implement WebSocket server
   - Deploy to cloud (AWS, Heroku, Railway)

6. **Testing & QA**
   - Write unit tests (Jest)
   - E2E tests (Detox)
   - Performance optimization
   - Security audit

## Deployment

### Build for iOS
```bash
eas build --platform ios
```

### Build for Android
```bash
eas build --platform android
```

### Submit to App Stores
```bash
eas submit --platform ios
eas submit --platform android
```

## Resources
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [React Navigation](https://reactnavigation.org/)

## Support
For issues or questions:
- Check the [GitHub Issues](https://github.com/your-repo/realm-walker/issues)
- Join our [Discord Community](https://discord.gg/your-invite)
- Email: support@realmwalker.app

---

**Happy Walking! 🚶‍♂️⚔️🗺️**
