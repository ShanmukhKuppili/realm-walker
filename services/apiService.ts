/**
 * API Service
 * Handles HTTP requests to backend server with retry logic and error handling
 */
import { ApiResponse, Block, BlockType, Guild, LeaderboardEntry, User } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
const API_TIMEOUT = 15000; // 15 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Mock mode for offline testing
const MOCK_MODE = process.env.EXPO_PUBLIC_MOCK_API === 'true';

/**
 * API Error Types
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Player Stats Response
 */
export interface PlayerStats {
  userId: string;
  level: number;
  xp: number;
  gold: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  blocksOwned: number;
  totalBlocksClaimed: number;
  guildId?: string;
  achievements: string[];
  lastActive: number;
}

/**
 * Block Claim Request
 */
export interface ClaimBlockRequest {
  blockId: string;
  userId: string;
  latitude: number;
  longitude: number;
  timestamp: number;
}

/**
 * Resource Collection Response
 */
export interface CollectResourcesResponse {
  gold: number;
  mana: number;
  health: number;
  xp: number;
  timestamp: number;
}

/**
 * Nearby Blocks Request
 */
export interface NearbyBlocksRequest {
  latitude: number;
  longitude: number;
  radius?: number; // meters, default 1000
}

/**
 * Level Up Response
 */
export interface LevelUpResponse {
  newLevel: number;
  xp: number;
  rewards: {
    gold?: number;
    health?: number;
    mana?: number;
    unlocks?: string[];
  };
}

class ApiService {
  private api: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load auth token from storage on initialization
    this.loadAuthToken();

    // Request interceptor for adding auth token
    this.api.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response) {
          const status = error.response.status;
          
          // Handle 401 Unauthorized - clear auth and redirect to login
          if (status === 401) {
            await this.clearAuth();
            throw new ApiError('Authentication required', 401, error.response.data);
          }
          
          // Handle 403 Forbidden
          if (status === 403) {
            throw new ApiError('Access denied', 403, error.response.data);
          }
          
          // Handle 404 Not Found
          if (status === 404) {
            throw new ApiError('Resource not found', 404, error.response.data);
          }
          
          // Handle 500 Server Error
          if (status >= 500) {
            throw new ApiError('Server error. Please try again later.', status, error.response.data);
          }
          
          // Other errors
          const message = (error.response.data as any)?.message || 'An error occurred';
          throw new ApiError(message, status, error.response.data);
        } else if (error.request) {
          // Network error - no response received
          throw new ApiError('Network error. Please check your connection.', undefined, error);
        } else {
          // Other errors
          throw new ApiError(error.message || 'An unexpected error occurred', undefined, error);
        }
      }
    );
  }

  /**
   * Load auth token from AsyncStorage
   */
  private async loadAuthToken() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        this.authToken = token;
      }
    } catch (error) {
      console.error('Failed to load auth token:', error);
    }
  }

  /**
   * Set authentication token
   */
  async setAuthToken(token: string) {
    this.authToken = token;
    try {
      await AsyncStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Failed to save auth token:', error);
    }
  }

  /**
   * Clear authentication
   */
  async clearAuth() {
    this.authToken = null;
    try {
      await AsyncStorage.removeItem('authToken');
    } catch (error) {
      console.error('Failed to clear auth token:', error);
    }
  }

  /**
   * Retry logic for failed requests
   */
  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    retries: number = MAX_RETRIES
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      if (retries > 0 && this.shouldRetry(error as AxiosError)) {
        await this.delay(RETRY_DELAY);
        return this.retryRequest(requestFn, retries - 1);
      }
      throw error;
    }
  }

  /**
   * Determine if request should be retried
   */
  private shouldRetry(error: AxiosError): boolean {
    // Retry on network errors or 5xx server errors
    if (!error.response) return true;
    const status = error.response.status;
    return status >= 500 && status < 600;
  }

  /**
   * Delay helper for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ============================================
  // BLOCK ENDPOINTS
  // ============================================

  /**
   * POST /api/blocks/claim
   * Claim a block at user's current location
   */
  async claimBlock(data: ClaimBlockRequest): Promise<Block> {
    if (MOCK_MODE) {
      return this.mockClaimBlock(data);
    }

    return this.retryRequest(async () => {
      const response: AxiosResponse<ApiResponse<Block>> = await this.api.post('/blocks/claim', data);
      return response.data.data!;
    });
  }

  /**
   * GET /api/blocks/nearby
   * Get blocks near user's current location
   */
  async getNearbyBlocks(data: NearbyBlocksRequest): Promise<Block[]> {
    if (MOCK_MODE) {
      return this.mockGetNearbyBlocks(data);
    }

    return this.retryRequest(async () => {
      const response: AxiosResponse<ApiResponse<Block[]>> = await this.api.get('/blocks/nearby', {
        params: {
          latitude: data.latitude,
          longitude: data.longitude,
          radius: data.radius || 1000,
        },
      });
      return response.data.data || [];
    });
  }

  /**
   * GET /api/blocks (legacy - get blocks in bounding box)
   */
  async getBlocks(minLat: number, maxLat: number, minLng: number, maxLng: number): Promise<Block[]> {
    return this.retryRequest(async () => {
      const response: AxiosResponse<ApiResponse<Block[]>> = await this.api.get('/blocks', {
        params: { minLat, maxLat, minLng, maxLng },
      });
      return response.data.data || [];
    });
  }

  /**
   * POST /api/blocks/unclaim
   * Unclaim a block
   */
  async unclaimBlock(blockId: string): Promise<void> {
    await this.retryRequest(async () => {
      await this.api.post('/blocks/unclaim', { blockId });
    });
  }

  // ============================================
  // RESOURCE ENDPOINTS
  // ============================================

  /**
   * POST /api/resources/collect
   * Collect accumulated resources
   */
  async collectResources(userId: string): Promise<CollectResourcesResponse> {
    if (MOCK_MODE) {
      return this.mockCollectResources(userId);
    }

    return this.retryRequest(async () => {
      const response: AxiosResponse<ApiResponse<CollectResourcesResponse>> = await this.api.post(
        '/resources/collect',
        { userId }
      );
      return response.data.data!;
    });
  }

  // ============================================
  // PLAYER ENDPOINTS
  // ============================================

  /**
   * GET /api/player/stats
   * Fetch player profile and stats
   */
  async getPlayerStats(userId: string): Promise<PlayerStats> {
    if (MOCK_MODE) {
      return this.mockGetPlayerStats(userId);
    }

    return this.retryRequest(async () => {
      const response: AxiosResponse<ApiResponse<PlayerStats>> = await this.api.get(
        `/player/stats/${userId}`
      );
      return response.data.data!;
    });
  }

  /**
   * POST /api/player/levelup
   * Handle level up and grant rewards
   */
  async levelUp(userId: string, newLevel: number): Promise<LevelUpResponse> {
    if (MOCK_MODE) {
      return this.mockLevelUp(userId, newLevel);
    }

    return this.retryRequest(async () => {
      const response: AxiosResponse<ApiResponse<LevelUpResponse>> = await this.api.post(
        '/player/levelup',
        { userId, newLevel }
      );
      return response.data.data!;
    });
  }

  // ============================================
  // USER ENDPOINTS
  // ============================================

  async getUser(userId: string): Promise<User> {
    return this.retryRequest(async () => {
      const response: AxiosResponse<ApiResponse<User>> = await this.api.get(`/users/${userId}`);
      return response.data.data!;
    });
  }

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    return this.retryRequest(async () => {
      const response: AxiosResponse<ApiResponse<User>> = await this.api.put(`/users/${userId}`, data);
      return response.data.data!;
    });
  }

  // ============================================
  // GUILD ENDPOINTS
  // ============================================

  async getGuilds(): Promise<Guild[]> {
    return this.retryRequest(async () => {
      const response: AxiosResponse<ApiResponse<Guild[]>> = await this.api.get('/guilds');
      return response.data.data || [];
    });
  }

  async getGuild(guildId: string): Promise<Guild> {
    return this.retryRequest(async () => {
      const response: AxiosResponse<ApiResponse<Guild>> = await this.api.get(`/guilds/${guildId}`);
      return response.data.data!;
    });
  }

  async createGuild(name: string, description: string, leaderId: string): Promise<Guild> {
    return this.retryRequest(async () => {
      const response: AxiosResponse<ApiResponse<Guild>> = await this.api.post('/guilds', {
        name,
        description,
        leaderId,
      });
      return response.data.data!;
    });
  }

  async joinGuild(guildId: string, userId: string): Promise<void> {
    await this.retryRequest(async () => {
      await this.api.post(`/guilds/${guildId}/join`, { userId });
    });
  }

  async leaveGuild(guildId: string, userId: string): Promise<void> {
    await this.retryRequest(async () => {
      await this.api.post(`/guilds/${guildId}/leave`, { userId });
    });
  }

  // ============================================
  // LEADERBOARD ENDPOINTS
  // ============================================

  async getLeaderboard(type: 'blocks' | 'xp', limit: number = 100): Promise<LeaderboardEntry[]> {
    return this.retryRequest(async () => {
      const response: AxiosResponse<ApiResponse<LeaderboardEntry[]>> = await this.api.get('/leaderboard', {
        params: { type, limit },
      });
      return response.data.data || [];
    });
  }

  async getGuildLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    return this.retryRequest(async () => {
      const response: AxiosResponse<ApiResponse<LeaderboardEntry[]>> = await this.api.get('/leaderboard/guilds', {
        params: { limit },
      });
      return response.data.data || [];
    });
  }

  // ============================================
  // MOCK API METHODS (for offline testing)
  // ============================================

  private async mockClaimBlock(data: ClaimBlockRequest): Promise<Block> {
    await this.delay(500); // Simulate network delay
    
    return {
      id: data.blockId,
      coordinates: {
        latitude: data.latitude,
        longitude: data.longitude,
      },
      gridX: Math.floor(data.longitude * 1000),
      gridY: Math.floor(data.latitude * 1000),
      ownerId: data.userId,
      ownerType: 'user',
      claimedAt: new Date(data.timestamp).toISOString(),
      expiresAt: new Date(data.timestamp + 24 * 60 * 60 * 1000).toISOString(),
      resourceType: 'gold',
      blockType: 'urban',
      level: 1,
    };
  }

  private async mockGetNearbyBlocks(data: NearbyBlocksRequest): Promise<Block[]> {
    await this.delay(300);
    
    // Generate mock blocks around user location
    const blocks: Block[] = [];
    for (let i = 0; i < 10; i++) {
      const lat = data.latitude + (Math.random() - 0.5) * 0.01;
      const lng = data.longitude + (Math.random() - 0.5) * 0.01;
      const hasOwner = Math.random() > 0.5;
      
      blocks.push({
        id: `mock-block-${i}`,
        coordinates: { latitude: lat, longitude: lng },
        gridX: Math.floor(lng * 1000),
        gridY: Math.floor(lat * 1000),
        ownerId: hasOwner ? 'user123' : undefined,
        ownerType: hasOwner ? 'user' : 'neutral',
        blockType: ['urban', 'park', 'residential', 'commercial'][Math.floor(Math.random() * 4)] as BlockType,
        resourceType: 'gold',
        claimedAt: hasOwner ? new Date(Date.now() - Math.random() * 10000000).toISOString() : undefined,
        expiresAt: hasOwner ? new Date(Date.now() + Math.random() * 86400000).toISOString() : undefined,
        level: Math.floor(Math.random() * 3) + 1,
      });
    }
    
    return blocks;
  }

  private async mockCollectResources(userId: string): Promise<CollectResourcesResponse> {
    await this.delay(400);
    
    return {
      gold: Math.floor(Math.random() * 100) + 50,
      mana: Math.floor(Math.random() * 50) + 10,
      health: Math.floor(Math.random() * 30) + 5,
      xp: Math.floor(Math.random() * 50) + 20,
      timestamp: Date.now(),
    };
  }

  private async mockGetPlayerStats(userId: string): Promise<PlayerStats> {
    await this.delay(350);
    
    return {
      userId,
      level: 5,
      xp: 1234,
      gold: 5000,
      health: 80,
      maxHealth: 100,
      mana: 45,
      maxMana: 60,
      blocksOwned: 15,
      totalBlocksClaimed: 87,
      achievements: ['first_block', 'level_5', 'walk_10km'],
      lastActive: Date.now(),
    };
  }

  private async mockLevelUp(userId: string, newLevel: number): Promise<LevelUpResponse> {
    await this.delay(400);
    
    return {
      newLevel,
      xp: 0,
      rewards: {
        gold: 100,
        health: 20,
        mana: 15,
        unlocks: newLevel === 5 ? ['guild_join'] : newLevel === 10 ? ['guild_create'] : [],
      },
    };
  }
}

export default new ApiService();
