/**
 * Core TypeScript types for Realm Walker
 */

// User & Profile
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  level: number;
  xp: number;
  totalBlocksClaimed: number;
  guildId?: string;
  createdAt: string;
  updatedAt: string;
}

// Location & Map
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export type BlockType = 'park' | 'urban' | 'landmark' | 'residential' | 'commercial';

export interface Block {
  id: string;
  coordinates: Coordinates;
  gridX: number;
  gridY: number;
  ownerId?: string;
  ownerType: 'user' | 'guild' | 'neutral';
  claimedAt?: string;
  expiresAt?: string;
  resourceType?: ResourceType;
  blockType?: BlockType;
  level: number;
}

export interface GridPosition {
  x: number;
  y: number;
}

// Resources
export type ResourceType = 'gold' | 'mana' | 'health' | 'experience';

export interface Resources {
  gold: number;
  mana: number;
  health: number;
  maxHealth: number;
}

export interface ResourceGeneration {
  gold: number;
  mana: number;
  health: number;
  interval: number; // milliseconds
}

// Guild
export interface Guild {
  id: string;
  name: string;
  description: string;
  leaderId: string;
  memberCount: number;
  totalTerritory: number;
  level: number;
  createdAt: string;
  color: string; // hex color for map display
}

export interface GuildMember {
  userId: string;
  guildId: string;
  role: 'leader' | 'officer' | 'member';
  joinedAt: string;
  contribution: number;
}

// Leaderboard
export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  score: number;
  rank: number;
  guildId?: string;
}

// Game State
export interface GameState {
  currentBlock?: Block;
  nearbyBlocks: Block[];
  userLocation?: Coordinates;
  isTracking: boolean;
  lastUpdate: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Navigation types
export type RootTabParamList = {
  Home: undefined;
  Map: undefined;
  Profile: undefined;
  Guilds: undefined;
  Settings: undefined;
};

// Redux State
export interface RootState {
  user: UserState;
  location: LocationState;
  map: MapState;
  guild: GuildState;
}

export interface UserState {
  user: User | null;
  resources: Resources;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface LocationState {
  currentLocation: Coordinates | null;
  currentBlock: Block | null;
  isTracking: boolean;
  permission: 'granted' | 'denied' | 'undetermined';
  error: string | null;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  timestamp: number | null;
}

export interface MapState {
  blocks: { [key: string]: Block };
  visibleBlocks: string[];
  selectedBlock: Block | null;
  loading: boolean;
  error: string | null;
}

export interface GuildState {
  currentGuild: Guild | null;
  members: GuildMember[];
  guilds: Guild[];
  loading: boolean;
  error: string | null;
}

// Settings
export interface AppSettings {
  notifications: boolean;
  soundEffects: boolean;
  backgroundTracking: boolean;
  mapStyle: 'standard' | 'satellite' | 'hybrid';
  theme: 'light' | 'dark' | 'auto';
}

// Achievements
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  progress: number;
  completed: boolean;
  unlockedAt?: string;
}

// Character Stats & Equipment
export interface CharacterStats {
  strength: number;
  intelligence: number;
  dexterity: number;
  constitution: number;
  wisdom: number;
}

export interface Equipment {
  weapon?: string; // Item ID
  armor?: string; // Item ID
  accessory?: string; // Item ID
}

export interface InventoryItem {
  itemId: string;
  quantity: number;
  acquiredAt: string;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  icon: string;
  statBonus?: Partial<CharacterStats>;
  price: number;
  level: number; // Minimum level required
}

export interface PlayerProfile {
  userId: string;
  username: string;
  avatar?: string;
  level: number;
  xp: number;
  gold: number;
  health: number;
  maxHealth: number;
  baseStats: CharacterStats;
  equipment: Equipment;
  inventory: InventoryItem[];
  totalBlocksClaimed: number;
  joinedAt: string;
}
