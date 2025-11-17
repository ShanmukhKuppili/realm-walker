/**
 * Mock Data for Realm Walker MVP
 * Provides sample data for offline testing and development
 */

import { Block, Guild, User } from '@/types';

// ============================================================================
// SAMPLE CITIES WITH COORDINATES (INDIAN CITIES)
// ============================================================================

export const SAMPLE_CITIES = {
  MUMBAI: {
    name: 'Mumbai',
    center: { latitude: 19.0760, longitude: 72.8777 },
    bounds: {
      north: 19.0960,
      south: 19.0560,
      east: 72.8977,
      west: 72.8577,
    },
  },
  DELHI: {
    name: 'New Delhi',
    center: { latitude: 28.6139, longitude: 77.2090 },
    bounds: {
      north: 28.6339,
      south: 28.5939,
      east: 77.2290,
      west: 77.1890,
    },
  },
  BANGALORE: {
    name: 'Bangalore',
    center: { latitude: 12.9716, longitude: 77.5946 },
    bounds: {
      north: 12.9916,
      south: 12.9516,
      east: 77.6146,
      west: 77.5746,
    },
  },
  HYDERABAD: {
    name: 'Hyderabad',
    center: { latitude: 17.3850, longitude: 78.4867 },
    bounds: {
      north: 17.4050,
      south: 17.3650,
      east: 78.5067,
      west: 78.4667,
    },
  },
  CHENNAI: {
    name: 'Chennai',
    center: { latitude: 13.0827, longitude: 80.2707 },
    bounds: {
      north: 13.1027,
      south: 13.0627,
      east: 80.2907,
      west: 80.2507,
    },
  },
  KOLKATA: {
    name: 'Kolkata',
    center: { latitude: 22.5726, longitude: 88.3639 },
    bounds: {
      north: 22.5926,
      south: 22.5526,
      east: 88.3839,
      west: 88.3439,
    },
  },
};

// ============================================================================
// MOCK PLAYERS (Levels 1-10) - Indian Names
// ============================================================================

export const MOCK_PLAYERS: User[] = [
  {
    id: 'player1',
    email: 'priya.sharma@example.com',
    displayName: 'Priya Sharma',
    photoURL: 'https://i.pravatar.cc/150?img=1',
    level: 1,
    xp: 0,
    totalBlocksClaimed: 0,
    guildId: undefined,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'player2',
    email: 'arjun.patel@example.com',
    displayName: 'Arjun Patel',
    photoURL: 'https://i.pravatar.cc/150?img=2',
    level: 3,
    xp: 420,
    totalBlocksClaimed: 15,
    guildId: 'guild1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'player3',
    email: 'aisha.khan@example.com',
    displayName: 'Aisha Khan',
    photoURL: 'https://i.pravatar.cc/150?img=3',
    level: 5,
    xp: 1250,
    totalBlocksClaimed: 42,
    guildId: 'guild1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(), // 14 days ago
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'player4',
    email: 'rohan.kumar@example.com',
    displayName: 'Rohan Kumar',
    photoURL: 'https://i.pravatar.cc/150?img=4',
    level: 7,
    xp: 3100,
    totalBlocksClaimed: 89,
    guildId: 'guild2',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21).toISOString(), // 21 days ago
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'player5',
    email: 'neha.reddy@example.com',
    displayName: 'Neha Reddy',
    photoURL: 'https://i.pravatar.cc/150?img=5',
    level: 10,
    xp: 7850,
    totalBlocksClaimed: 156,
    guildId: 'guild2',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days ago
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'player6',
    email: 'vikram.singh@example.com',
    displayName: 'Vikram Singh',
    photoURL: 'https://i.pravatar.cc/150?img=6',
    level: 2,
    xp: 180,
    totalBlocksClaimed: 8,
    guildId: undefined,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    updatedAt: new Date().toISOString(),
  },
];

// ============================================================================
// MOCK GUILDS - Indian Themed
// ============================================================================

export const MOCK_GUILDS: Guild[] = [
  {
    id: 'guild1',
    name: 'Maratha Warriors',
    description: 'Elite territory claimers conquering the urban landscape',
    leaderId: 'player2',
    memberCount: 25,
    totalTerritory: 342,
    level: 5,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    color: '#9C27B0',
  },
  {
    id: 'guild2',
    name: 'Rajput Defenders',
    description: 'Protecting our territories with honor and strategy',
    leaderId: 'player4',
    memberCount: 42,
    totalTerritory: 589,
    level: 8,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
    color: '#F44336',
  },
  {
    id: 'guild3',
    name: 'Chola Explorers',
    description: 'Discovering new lands and claiming the unknown',
    leaderId: 'player6',
    memberCount: 18,
    totalTerritory: 156,
    level: 3,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    color: '#4CAF50',
  },
];

// ============================================================================
// MOCK BLOCKS GENERATOR
// ============================================================================

/**
 * Generate grid blocks around a center point
 */
export function generateBlocksAroundPoint(
  centerLat: number,
  centerLon: number,
  gridSize: number = 5
): Block[] {
  const blocks: Block[] = [];
  const GRID_PRECISION = 4; // 4 decimal places = ~11m precision
  const GRID_SIZE_DEGREES = 0.0002; // Approximately 20 meters

  // Generate grid around center point
  for (let x = -gridSize; x <= gridSize; x++) {
    for (let y = -gridSize; y <= gridSize; y++) {
      const lat = parseFloat((centerLat + x * GRID_SIZE_DEGREES).toFixed(GRID_PRECISION));
      const lon = parseFloat((centerLon + y * GRID_SIZE_DEGREES).toFixed(GRID_PRECISION));
      const blockId = `${lat}_${lon}`;

      blocks.push({
        id: blockId,
        coordinates: { latitude: lat, longitude: lon },
        gridX: x,
        gridY: y,
        ownerType: 'neutral',
        level: 1,
      });
    }
  }

  return blocks;
}

/**
 * Generate mock blocks for all sample cities
 */
export function generateMockBlocks(): Block[] {
  const allBlocks: Block[] = [];

  // Generate blocks for each city
  Object.values(SAMPLE_CITIES).forEach((city) => {
    const cityBlocks = generateBlocksAroundPoint(
      city.center.latitude,
      city.center.longitude,
      10 // 10x10 grid = 121 blocks per city
    );
    allBlocks.push(...cityBlocks);
  });

  return allBlocks;
}

/**
 * Assign ownership to some blocks
 */
export function assignBlockOwnership(blocks: Block[]): Block[] {
  const now = Date.now();
  const ownedBlocks = blocks.map((block, index) => {
    // Assign ownership to ~30% of blocks
    if (index % 3 === 0) {
      const playerIndex = index % MOCK_PLAYERS.length;
      const player = MOCK_PLAYERS[playerIndex];
      const hoursAgo = Math.floor(Math.random() * 30); // 0-30 hours ago

      return {
        ...block,
        ownerId: player.id,
        ownerType: player.guildId ? 'guild' : 'user',
        claimedAt: new Date(now - hoursAgo * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(now - hoursAgo * 60 * 60 * 1000 + 24 * 60 * 60 * 1000).toISOString(),
        level: Math.ceil(player.level / 2),
      } as Block;
    }
    return block;
  });

  return ownedBlocks;
}

// ============================================================================
// COMPLETE MOCK DATA
// ============================================================================

export const MOCK_BLOCKS = assignBlockOwnership(generateMockBlocks());

export const MOCK_DATA = {
  players: MOCK_PLAYERS,
  guilds: MOCK_GUILDS,
  blocks: MOCK_BLOCKS,
  cities: SAMPLE_CITIES,
};

// ============================================================================
// RESOURCE GENERATION DATA
// ============================================================================

export const RESOURCE_GENERATION_RATES = {
  GOLD_PER_BLOCK_PER_HOUR: 5,
  MANA_PER_BLOCK_PER_HOUR: 3,
  HEALTH_REGEN_PER_HOUR: 10,
  BASE_XP_PER_CLAIM: 50,
  BASE_GOLD_PER_CLAIM: 10,
};

// ============================================================================
// LEVEL PROGRESSION DATA
// ============================================================================

export const LEVEL_PROGRESSION = [
  { level: 1, xpRequired: 0, xpToNext: 100, rewards: { gold: 0, health: 100, mana: 50 } },
  { level: 2, xpRequired: 100, xpToNext: 150, rewards: { gold: 50, health: 120, mana: 60 } },
  { level: 3, xpRequired: 250, xpToNext: 200, rewards: { gold: 75, health: 140, mana: 70 } },
  { level: 4, xpRequired: 450, xpToNext: 300, rewards: { gold: 100, health: 160, mana: 80 } },
  { level: 5, xpRequired: 750, xpToNext: 400, rewards: { gold: 150, health: 180, mana: 90 } },
  { level: 6, xpRequired: 1150, xpToNext: 500, rewards: { gold: 200, health: 200, mana: 100 } },
  { level: 7, xpRequired: 1650, xpToNext: 700, rewards: { gold: 300, health: 220, mana: 110 } },
  { level: 8, xpRequired: 2350, xpToNext: 900, rewards: { gold: 400, health: 240, mana: 120 } },
  { level: 9, xpRequired: 3250, xpToNext: 1200, rewards: { gold: 500, health: 260, mana: 130 } },
  { level: 10, xpRequired: 4450, xpToNext: 1500, rewards: { gold: 750, health: 300, mana: 150 } },
];

/**
 * Calculate XP required for a specific level
 */
export function getXPForLevel(level: number): number {
  if (level <= 0) return 0;
  if (level > 10) return LEVEL_PROGRESSION[9].xpRequired + (level - 10) * 1500;
  return LEVEL_PROGRESSION[level - 1].xpRequired;
}

/**
 * Calculate level from XP
 */
export function getLevelFromXP(xp: number): number {
  for (let i = LEVEL_PROGRESSION.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_PROGRESSION[i].xpRequired) {
      return LEVEL_PROGRESSION[i].level;
    }
  }
  return 1;
}

/**
 * Calculate XP needed for next level
 */
export function getXPToNextLevel(currentXP: number): number {
  const currentLevel = getLevelFromXP(currentXP);
  if (currentLevel >= 10) {
    return getXPForLevel(currentLevel + 1) - currentXP;
  }
  return LEVEL_PROGRESSION[currentLevel].xpRequired - currentXP;
}

// ============================================================================
// OWNERSHIP TIMING DATA
// ============================================================================

export const OWNERSHIP_CONFIG = {
  OWNERSHIP_DURATION_HOURS: 24,
  GRACE_PERIOD_HOURS: 1,
  CLAIM_COOLDOWN_SECONDS: 10,
  GPS_STABILIZATION_DELAY_MS: 2000,
  LOCATION_UPDATE_INTERVAL_MS: 5000,
  MIN_CLAIM_DISTANCE_METERS: 10,
};

/**
 * Calculate if a block can be claimed
 */
export function canClaimBlock(block: Block, currentUserId: string): {
  canClaim: boolean;
  reason?: string;
} {
  const now = Date.now();

  // Neutral blocks can always be claimed
  if (block.ownerType === 'neutral' || !block.ownerId) {
    return { canClaim: true };
  }

  // Own block - can refresh ownership
  if (block.ownerId === currentUserId) {
    return { canClaim: true, reason: 'Refreshing ownership timer' };
  }

  // Check if ownership has expired
  if (block.expiresAt) {
    const expiresAt = new Date(block.expiresAt).getTime();
    const graceEndTime = expiresAt + OWNERSHIP_CONFIG.GRACE_PERIOD_HOURS * 60 * 60 * 1000;

    if (now > graceEndTime) {
      // Ownership fully expired, can claim
      return { canClaim: true, reason: 'Ownership expired' };
    } else if (now > expiresAt && now <= graceEndTime) {
      // Within grace period, can claim
      return { canClaim: true, reason: 'Within grace period' };
    } else {
      // Still owned by enemy
      const hoursLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60));
      return { canClaim: false, reason: `Owned by enemy. Expires in ${hoursLeft}h` };
    }
  }

  return { canClaim: false, reason: 'Block owned by another player' };
}

/**
 * Calculate resources generated from owned blocks
 */
export function calculateResourceGeneration(
  ownedBlocks: Block[],
  lastCollectionTime: number
): {
  gold: number;
  mana: number;
  health: number;
} {
  const now = Date.now();
  const hoursElapsed = (now - lastCollectionTime) / (1000 * 60 * 60);
  const blockCount = ownedBlocks.length;

  return {
    gold: Math.floor(blockCount * RESOURCE_GENERATION_RATES.GOLD_PER_BLOCK_PER_HOUR * hoursElapsed),
    mana: Math.floor(blockCount * RESOURCE_GENERATION_RATES.MANA_PER_BLOCK_PER_HOUR * hoursElapsed),
    health: Math.floor(RESOURCE_GENERATION_RATES.HEALTH_REGEN_PER_HOUR * hoursElapsed),
  };
}

// ============================================================================
// ACHIEVEMENT DATA
// ============================================================================

export const MOCK_ACHIEVEMENTS = [
  {
    id: 'first_claim',
    title: 'First Steps',
    description: 'Claim your first territory block',
    xp: 50,
    icon: '🎯',
    unlocked: false,
  },
  {
    id: 'claim_10',
    title: 'Explorer',
    description: 'Claim 10 territory blocks',
    xp: 100,
    icon: '🗺️',
    unlocked: false,
  },
  {
    id: 'claim_50',
    title: 'Conqueror',
    description: 'Claim 50 territory blocks',
    xp: 500,
    icon: '⚔️',
    unlocked: false,
  },
  {
    id: 'level_5',
    title: 'Rising Star',
    description: 'Reach level 5',
    xp: 250,
    icon: '⭐',
    unlocked: false,
  },
  {
    id: 'level_10',
    title: 'Master Walker',
    description: 'Reach level 10',
    xp: 1000,
    icon: '👑',
    unlocked: false,
  },
  {
    id: 'join_guild',
    title: 'Team Player',
    description: 'Join a guild',
    xp: 100,
    icon: '🛡️',
    unlocked: false,
  },
  {
    id: 'distance_10km',
    title: 'Marathon Walker',
    description: 'Walk 10 kilometers',
    xp: 300,
    icon: '🏃',
    unlocked: false,
  },
];

export default MOCK_DATA;
