/**
 * Storage Service
 * Offline-first data persistence using AsyncStorage
 * Handles local caching and data persistence for offline functionality
 */
import { Block, User } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlayerStats } from './apiService';

// Storage Keys
const STORAGE_KEYS = {
  PLAYER_STATS: '@realm_walker:player_stats',
  BLOCKS_CACHE: '@realm_walker:blocks_cache',
  CLAIMED_BLOCKS: '@realm_walker:claimed_blocks',
  RESOURCES: '@realm_walker:resources',
  PENDING_CLAIMS: '@realm_walker:pending_claims',
  PENDING_ACTIONS: '@realm_walker:pending_actions',
  LAST_SYNC: '@realm_walker:last_sync',
  USER_PROFILE: '@realm_walker:user_profile',
  NEARBY_BLOCKS: '@realm_walker:nearby_blocks',
  CACHE_METADATA: '@realm_walker:cache_metadata',
} as const;

// Cache expiration times (milliseconds)
const CACHE_EXPIRATION = {
  NEARBY_BLOCKS: 5 * 60 * 1000, // 5 minutes
  PLAYER_STATS: 2 * 60 * 1000, // 2 minutes
  BLOCKS_CACHE: 10 * 60 * 1000, // 10 minutes
};

/**
 * Cache Metadata
 */
interface CacheMetadata {
  key: string;
  timestamp: number;
  expiresAt: number;
}

/**
 * Pending Claim
 */
export interface PendingClaim {
  id: string;
  blockId: string;
  userId: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  retries: number;
}

/**
 * Pending Action (generic for other operations)
 */
export interface PendingAction {
  id: string;
  type: 'collect_resources' | 'unclaim_block' | 'join_guild' | 'leave_guild';
  payload: any;
  timestamp: number;
  retries: number;
}

/**
 * Resources Data
 */
export interface ResourcesData {
  gold: number;
  mana: number;
  health: number;
  maxHealth: number;
  pendingGold: number;
  pendingMana: number;
  pendingHealth: number;
  lastCollected: number;
}

/**
 * Storage Service Class
 */
class StorageService {
  /**
   * ========================================
   * PLAYER DATA
   * ========================================
   */

  /**
   * Save player stats to local storage
   */
  async savePlayerStats(stats: PlayerStats): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PLAYER_STATS, JSON.stringify(stats));
      await this.updateCacheMetadata(STORAGE_KEYS.PLAYER_STATS, CACHE_EXPIRATION.PLAYER_STATS);
    } catch (error) {
      console.error('Failed to save player stats:', error);
      throw error;
    }
  }

  /**
   * Get player stats from local storage
   */
  async getPlayerStats(): Promise<PlayerStats | null> {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.PLAYER_STATS);
      if (!cached) return null;

      const isValid = await this.isCacheValid(STORAGE_KEYS.PLAYER_STATS);
      if (!isValid) {
        await this.removePlayerStats();
        return null;
      }

      return JSON.parse(cached);
    } catch (error) {
      console.error('Failed to get player stats:', error);
      return null;
    }
  }

  /**
   * Remove player stats from storage
   */
  async removePlayerStats(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.PLAYER_STATS);
      await this.removeCacheMetadata(STORAGE_KEYS.PLAYER_STATS);
    } catch (error) {
      console.error('Failed to remove player stats:', error);
    }
  }

  /**
   * Save user profile
   */
  async saveUserProfile(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save user profile:', error);
      throw error;
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(): Promise<User | null> {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return null;
    }
  }

  /**
   * ========================================
   * BLOCKS DATA
   * ========================================
   */

  /**
   * Save nearby blocks to cache
   */
  async saveNearbyBlocks(blocks: Block[], latitude: number, longitude: number): Promise<void> {
    try {
      const data = {
        blocks,
        location: { latitude, longitude },
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.NEARBY_BLOCKS, JSON.stringify(data));
      await this.updateCacheMetadata(STORAGE_KEYS.NEARBY_BLOCKS, CACHE_EXPIRATION.NEARBY_BLOCKS);
    } catch (error) {
      console.error('Failed to save nearby blocks:', error);
      throw error;
    }
  }

  /**
   * Get nearby blocks from cache
   * Checks if cache is still valid and location hasn't changed too much
   */
  async getNearbyBlocks(
    currentLat: number,
    currentLng: number,
    maxDistance: number = 500 // meters
  ): Promise<Block[] | null> {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.NEARBY_BLOCKS);
      if (!cached) return null;

      const isValid = await this.isCacheValid(STORAGE_KEYS.NEARBY_BLOCKS);
      if (!isValid) {
        await this.removeNearbyBlocks();
        return null;
      }

      const data = JSON.parse(cached);
      
      // Check if user has moved too far
      const distance = this.calculateDistance(
        currentLat,
        currentLng,
        data.location.latitude,
        data.location.longitude
      );

      if (distance > maxDistance) {
        // User moved too far, cache is stale
        return null;
      }

      return data.blocks;
    } catch (error) {
      console.error('Failed to get nearby blocks:', error);
      return null;
    }
  }

  /**
   * Remove nearby blocks cache
   */
  async removeNearbyBlocks(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.NEARBY_BLOCKS);
      await this.removeCacheMetadata(STORAGE_KEYS.NEARBY_BLOCKS);
    } catch (error) {
      console.error('Failed to remove nearby blocks:', error);
    }
  }

  /**
   * Save all blocks (general cache)
   */
  async saveBlocks(blocks: Block[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BLOCKS_CACHE, JSON.stringify(blocks));
      await this.updateCacheMetadata(STORAGE_KEYS.BLOCKS_CACHE, CACHE_EXPIRATION.BLOCKS_CACHE);
    } catch (error) {
      console.error('Failed to save blocks:', error);
      throw error;
    }
  }

  /**
   * Get all blocks from cache
   */
  async getBlocks(): Promise<Block[] | null> {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.BLOCKS_CACHE);
      if (!cached) return null;

      const isValid = await this.isCacheValid(STORAGE_KEYS.BLOCKS_CACHE);
      if (!isValid) {
        await AsyncStorage.removeItem(STORAGE_KEYS.BLOCKS_CACHE);
        return null;
      }

      return JSON.parse(cached);
    } catch (error) {
      console.error('Failed to get blocks:', error);
      return null;
    }
  }

  /**
   * Save user's claimed blocks
   */
  async saveClaimedBlocks(blocks: Block[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CLAIMED_BLOCKS, JSON.stringify(blocks));
    } catch (error) {
      console.error('Failed to save claimed blocks:', error);
      throw error;
    }
  }

  /**
   * Get user's claimed blocks
   */
  async getClaimedBlocks(): Promise<Block[] | null> {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.CLAIMED_BLOCKS);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Failed to get claimed blocks:', error);
      return null;
    }
  }

  /**
   * ========================================
   * RESOURCES DATA
   * ========================================
   */

  /**
   * Save resources data
   */
  async saveResources(resources: ResourcesData): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(resources));
    } catch (error) {
      console.error('Failed to save resources:', error);
      throw error;
    }
  }

  /**
   * Get resources data
   */
  async getResources(): Promise<ResourcesData | null> {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.RESOURCES);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Failed to get resources:', error);
      return null;
    }
  }

  /**
   * ========================================
   * PENDING ACTIONS QUEUE
   * ========================================
   */

  /**
   * Add pending claim to queue
   */
  async addPendingClaim(claim: Omit<PendingClaim, 'id' | 'retries'>): Promise<string> {
    try {
      const pendingClaim: PendingClaim = {
        ...claim,
        id: `claim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        retries: 0,
      };

      const existing = await this.getPendingClaims();
      const updated = [...existing, pendingClaim];
      
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_CLAIMS, JSON.stringify(updated));
      return pendingClaim.id;
    } catch (error) {
      console.error('Failed to add pending claim:', error);
      throw error;
    }
  }

  /**
   * Get all pending claims
   */
  async getPendingClaims(): Promise<PendingClaim[]> {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_CLAIMS);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Failed to get pending claims:', error);
      return [];
    }
  }

  /**
   * Remove pending claim from queue
   */
  async removePendingClaim(claimId: string): Promise<void> {
    try {
      const existing = await this.getPendingClaims();
      const updated = existing.filter((c) => c.id !== claimId);
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_CLAIMS, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to remove pending claim:', error);
      throw error;
    }
  }

  /**
   * Update pending claim retry count
   */
  async updatePendingClaimRetries(claimId: string): Promise<void> {
    try {
      const existing = await this.getPendingClaims();
      const updated = existing.map((c) => 
        c.id === claimId ? { ...c, retries: c.retries + 1 } : c
      );
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_CLAIMS, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to update pending claim retries:', error);
      throw error;
    }
  }

  /**
   * Clear all pending claims
   */
  async clearPendingClaims(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_CLAIMS);
    } catch (error) {
      console.error('Failed to clear pending claims:', error);
    }
  }

  /**
   * Add pending action to queue
   */
  async addPendingAction(action: Omit<PendingAction, 'id' | 'retries'>): Promise<string> {
    try {
      const pendingAction: PendingAction = {
        ...action,
        id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        retries: 0,
      };

      const existing = await this.getPendingActions();
      const updated = [...existing, pendingAction];
      
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_ACTIONS, JSON.stringify(updated));
      return pendingAction.id;
    } catch (error) {
      console.error('Failed to add pending action:', error);
      throw error;
    }
  }

  /**
   * Get all pending actions
   */
  async getPendingActions(): Promise<PendingAction[]> {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_ACTIONS);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Failed to get pending actions:', error);
      return [];
    }
  }

  /**
   * Remove pending action from queue
   */
  async removePendingAction(actionId: string): Promise<void> {
    try {
      const existing = await this.getPendingActions();
      const updated = existing.filter((a) => a.id !== actionId);
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_ACTIONS, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to remove pending action:', error);
      throw error;
    }
  }

  /**
   * Clear all pending actions
   */
  async clearPendingActions(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_ACTIONS);
    } catch (error) {
      console.error('Failed to clear pending actions:', error);
    }
  }

  /**
   * ========================================
   * SYNC TRACKING
   * ========================================
   */

  /**
   * Save last sync timestamp
   */
  async saveLastSync(timestamp: number = Date.now()): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp.toString());
    } catch (error) {
      console.error('Failed to save last sync:', error);
    }
  }

  /**
   * Get last sync timestamp
   */
  async getLastSync(): Promise<number | null> {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      return cached ? parseInt(cached, 10) : null;
    } catch (error) {
      console.error('Failed to get last sync:', error);
      return null;
    }
  }

  /**
   * ========================================
   * CACHE MANAGEMENT
   * ========================================
   */

  /**
   * Update cache metadata
   */
  private async updateCacheMetadata(key: string, ttl: number): Promise<void> {
    try {
      const metadata: CacheMetadata = {
        key,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl,
      };
      
      await AsyncStorage.setItem(
        `${STORAGE_KEYS.CACHE_METADATA}:${key}`,
        JSON.stringify(metadata)
      );
    } catch (error) {
      console.error('Failed to update cache metadata:', error);
    }
  }

  /**
   * Check if cache is still valid
   */
  private async isCacheValid(key: string): Promise<boolean> {
    try {
      const metadataStr = await AsyncStorage.getItem(`${STORAGE_KEYS.CACHE_METADATA}:${key}`);
      if (!metadataStr) return false;

      const metadata: CacheMetadata = JSON.parse(metadataStr);
      return Date.now() < metadata.expiresAt;
    } catch (error) {
      console.error('Failed to check cache validity:', error);
      return false;
    }
  }

  /**
   * Remove cache metadata
   */
  private async removeCacheMetadata(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${STORAGE_KEYS.CACHE_METADATA}:${key}`);
    } catch (error) {
      console.error('Failed to remove cache metadata:', error);
    }
  }

  /**
   * Clear all caches
   */
  async clearAllCaches(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.BLOCKS_CACHE,
        STORAGE_KEYS.NEARBY_BLOCKS,
        STORAGE_KEYS.PLAYER_STATS,
      ]);
      
      // Clear all cache metadata
      const allKeys = await AsyncStorage.getAllKeys();
      const metadataKeys = allKeys.filter((key) => key.startsWith(STORAGE_KEYS.CACHE_METADATA));
      if (metadataKeys.length > 0) {
        await AsyncStorage.multiRemove(metadataKeys);
      }
    } catch (error) {
      console.error('Failed to clear all caches:', error);
    }
  }

  /**
   * Clear all data (logout)
   */
  async clearAll(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const realmWalkerKeys = allKeys.filter((key) => key.startsWith('@realm_walker:'));
      if (realmWalkerKeys.length > 0) {
        await AsyncStorage.multiRemove(realmWalkerKeys);
      }
    } catch (error) {
      console.error('Failed to clear all data:', error);
    }
  }

  /**
   * ========================================
   * UTILITY FUNCTIONS
   * ========================================
   */

  /**
   * Calculate distance between two coordinates (Haversine formula)
   * Returns distance in meters
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Get storage size (for debugging)
   */
  async getStorageSize(): Promise<{ key: string; size: number }[]> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const realmWalkerKeys = allKeys.filter((key) => key.startsWith('@realm_walker:'));
      
      const sizes = await Promise.all(
        realmWalkerKeys.map(async (key) => {
          const value = await AsyncStorage.getItem(key);
          return {
            key,
            size: value ? new Blob([value]).size : 0,
          };
        })
      );

      return sizes;
    } catch (error) {
      console.error('Failed to get storage size:', error);
      return [];
    }
  }
}

export default new StorageService();
