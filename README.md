# Realm Walker 🚶‍♂️⚔️🗺️

**Turn walking into an epic RPG adventure!**

Realm Walker is a location-based fitness game built with React Native and Expo. Claim territory by walking in the real world, collect resources, level up your character, join guilds, and compete with other players on global leaderboards.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

### 🗺️ Location-Based Gameplay
- **Grid-Based Territory System**: 20m × 20m blocks
- **Real-Time GPS Tracking**: Foreground and background tracking
- **Interactive Map**: View your claimed blocks and nearby territories
- **Block Claiming**: Walk to blocks to claim them as your own

### ⚔️ RPG Progression
- **Leveling System**: Gain XP from claiming blocks and completing activities
- **Resource Management**: Collect gold, mana, and health
- **Character Stats**: Track your level, XP, and blocks claimed

### 👥 Social Features
- **Guilds**: Create or join guilds to claim territory together
- **Guild Leaderboards**: Compete with other guilds for dominance
- **Player Rankings**: See top players on global leaderboards

### 🎨 Modern UI/UX
- **Bottom Tab Navigation**: Easy access to all features
- **Responsive Design**: Works on all screen sizes
- **Dark/Light Theme**: Automatic theme switching
- **Smooth Animations**: Polished user experience

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Emulator

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/ShanmukhKuppili/realm-walker.git
cd realm-walker
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Firebase**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication (Email/Password)
   - Create Firestore Database
   - Copy `.env.example` to `.env` and add your Firebase credentials

4. **Run the app**
```bash
npm start
```

Then press `i` for iOS or `a` for Android.

📖 **For detailed setup instructions, see [SETUP.md](./SETUP.md)**

## 📱 Screenshots

Coming soon! The app includes:
- Home dashboard with stats and resources
- Interactive map with territory visualization
- Profile screen with achievements
- Guild management interface
- Settings and preferences

## 🛠️ Tech Stack

### Frontend
- **React Native** 0.81.5
- **Expo** SDK 54
- **TypeScript** 5.9.2
- **Redux Toolkit** 2.5.0 - State management
- **React Navigation** 7.x - Navigation

### Location & Maps
- **expo-location** - GPS tracking
- **react-native-maps** - Map display
- **expo-task-manager** - Background location

### Backend & Services
- **Firebase** 11.1.0 - Authentication & Firestore
- **axios** - API client

## 📂 Project Structure

```
realm-walker/
├── app/                    # Expo Router screens
│   ├── _layout.tsx        # Root layout with Redux & Navigation
│   ├── index.tsx          # Home tab
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
│   ├── index.ts
│   └── slices/
│       ├── userSlice.ts
│       ├── locationSlice.ts
│       ├── mapSlice.ts
│       └── guildSlice.ts
├── services/              # External services
│   ├── firebase.ts
│   ├── locationService.ts
│   └── apiService.ts
├── hooks/                 # Custom React hooks
│   └── useLocationTracking.ts
├── types/                 # TypeScript definitions
│   └── index.ts
├── utils/                 # Helper functions
│   └── helpers.ts
└── assets/               # Images, fonts, etc.
```

## 🎮 How to Play

1. **Sign Up**: Create an account with email and password
2. **Grant Location**: Allow the app to access your location
3. **Start Walking**: Move around in the real world
4. **Claim Blocks**: Walk to territory blocks to claim them
5. **Gain XP**: Level up by claiming more blocks
6. **Join a Guild**: Team up with other players
7. **Compete**: Climb the leaderboards!

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run linter
npm run lint

# Clear cache
npm start --clear
```

### Key Commands

```bash
# Install new dependency
npm install package-name

# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

## 🌟 Roadmap

### Phase 1 (Current) ✅
- [x] Basic project setup
- [x] Redux state management
- [x] Firebase authentication
- [x] Location tracking
- [x] Map display with blocks
- [x] Guild system
- [x] Basic UI/UX

### Phase 2 (Planned)
- [ ] Real-time multiplayer updates
- [ ] Combat system between players
- [ ] Advanced RPG features (classes, skills)
- [ ] Quest system
- [ ] In-app economy
- [ ] Achievement badges

### Phase 3 (Future)
- [ ] Social features (friends, chat)
- [ ] Events and tournaments
- [ ] Custom avatars and skins
- [ ] Trading system
- [ ] Mobile app store release

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/)
- Maps powered by [React Native Maps](https://github.com/react-native-maps/react-native-maps)
- Authentication by [Firebase](https://firebase.google.com/)
- State management with [Redux Toolkit](https://redux-toolkit.js.org/)

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/ShanmukhKuppili/realm-walker/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ShanmukhKuppili/realm-walker/discussions)
- **Email**: support@realmwalker.app

---

**Made with ❤️ by the Realm Walker team**

*Happy walking and claiming! 🚶‍♂️⚔️*

