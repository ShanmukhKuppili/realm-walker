/**
 * useSyncWithBackend Hook
 * Auto-sync local data with backend when online
 * Manages pending actions queue and data synchronization
 */
import apiService from '@/services/apiService';
import storageService, { PendingAction, PendingClaim } from '@/services/storageService';
import { useAppDispatch, useAppSelector } from '@/store';
import { claimBlock as claimBlockAction, unclaimBlock as unclaimBlockAction } from '@/store/slices/mapSlice';
import { addGold, addXP, updateProfile } from '@/store/slices/playerSlice';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNetworkListener, useOnlineStatus } from './useNetworkStatus';

export interface SyncStatus {
  isSyncing: boolean;
  lastSync: number | null;
  pendingCount: number;
  error: string | null;
}

/**
 * Hook to automatically sync local data with backend
 * 
 * Features:
 * - Auto-syncs when coming online
 * - Processes pending claims queue
 * - Processes pending actions queue
 * - Updates local cache with backend data
 * - Tracks sync status
 * 
 * @param enabled - Whether sync is enabled (default: true)
 * @returns Sync status and manual sync function
 * 
 * @example
 * const { isSyncing, lastSync, pendingCount, sync } = useSyncWithBackend();
 * 
 * // Manual sync
 * await sync();
 * 
 * // Check status
 * if (isSyncing) {
 *   console.log('Syncing...');
 * }
 */
export function useSyncWithBackend(enabled: boolean = true) {
  const dispatch = useAppDispatch();
  const isOnline = useOnlineStatus();
  const userId = useAppSelector((state) => state.auth.user?.id);
  
  const [status, setStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSync: null,
    pendingCount: 0,
    error: null,
  });

  const syncInProgressRef = useRef(false);

  /**
   * Process pending claims
   */
  const processPendingClaims = useCallback(async (): Promise<number> => {
    if (!userId) return 0;

    const pendingClaims = await storageService.getPendingClaims();
    if (pendingClaims.length === 0) return 0;

    let successCount = 0;
    const maxRetries = 3;

    for (const claim of pendingClaims) {
      try {
        // Attempt to claim the block
        const block = await apiService.claimBlock({
          blockId: claim.blockId,
          userId: claim.userId,
          latitude: claim.latitude,
          longitude: claim.longitude,
          timestamp: claim.timestamp,
        });

        // Success - update Redux and remove from queue
        dispatch(claimBlockAction({ blockId: block.id, userId: claim.userId }));
        await storageService.removePendingClaim(claim.id);
        successCount++;
      } catch (error) {
        console.error('Failed to process pending claim:', error);

        // Increment retry count
        if (claim.retries < maxRetries) {
          await storageService.updatePendingClaimRetries(claim.id);
        } else {
          // Max retries reached, remove from queue
          console.warn('Max retries reached for claim:', claim.id);
          await storageService.removePendingClaim(claim.id);
        }
      }
    }

    return successCount;
  }, [userId, dispatch]);

  /**
   * Process pending actions
   */
  const processPendingActions = useCallback(async (): Promise<number> => {
    if (!userId) return 0;

    const pendingActions = await storageService.getPendingActions();
    if (pendingActions.length === 0) return 0;

    let successCount = 0;
    const maxRetries = 3;

    for (const action of pendingActions) {
      try {
        switch (action.type) {
          case 'collect_resources':
            const resources = await apiService.collectResources(userId);
            dispatch(addGold(resources.gold));
            // Note: addMana not available in playerSlice, would need to be added
            dispatch(addXP(resources.xp));
            break;

          case 'unclaim_block':
            await apiService.unclaimBlock(action.payload.blockId);
            dispatch(unclaimBlockAction(action.payload.blockId));
            break;

          case 'join_guild':
            await apiService.joinGuild(action.payload.guildId, userId);
            break;

          case 'leave_guild':
            await apiService.leaveGuild(action.payload.guildId, userId);
            break;

          default:
            console.warn('Unknown action type:', action.type);
        }

        // Success - remove from queue
        await storageService.removePendingAction(action.id);
        successCount++;
      } catch (error) {
        console.error('Failed to process pending action:', error);

        // Increment retry count or remove if max retries reached
        if (action.retries < maxRetries) {
          // Note: would need to add updatePendingActionRetries to storageService
        } else {
          await storageService.removePendingAction(action.id);
        }
      }
    }

    return successCount;
  }, [userId, dispatch]);

  /**
   * Sync player stats from backend
   */
  const syncPlayerStats = useCallback(async (): Promise<boolean> => {
    if (!userId) return false;

    try {
      const stats = await apiService.getPlayerStats(userId);
      
      // Update Redux
      dispatch(updateProfile({
        level: stats.level,
        xp: stats.xp,
        gold: stats.gold,
        health: stats.health,
        maxHealth: stats.maxHealth,
        mana: stats.mana,
        maxMana: stats.maxMana,
      }));

      // Save to local storage
      await storageService.savePlayerStats(stats);
      
      return true;
    } catch (error) {
      console.error('Failed to sync player stats:', error);
      return false;
    }
  }, [userId, dispatch]);

  /**
   * Sync claimed blocks from backend (placeholder for future use)
   */
  // const syncClaimedBlocks = useCallback(async (): Promise<boolean> => {
  //   if (!userId) return false;
  //   try {
  //     const nearbyBlocks = await apiService.getNearbyBlocks({
  //       latitude: 0, // Would need actual location
  //       longitude: 0,
  //       radius: 5000,
  //     });
  //     const claimedBlocks = nearbyBlocks.filter((block) => block.ownerId === userId);
  //     await storageService.saveClaimedBlocks(claimedBlocks);
  //     return true;
  //   } catch (error) {
  //     console.error('Failed to sync claimed blocks:', error);
  //     return false;
  //   }
  // }, [userId]);

  /**
   * Main sync function
   */
  const sync = useCallback(async (): Promise<void> => {
    if (!isOnline || !enabled || !userId) {
      return;
    }

    // Prevent concurrent syncs
    if (syncInProgressRef.current) {
      console.log('Sync already in progress, skipping...');
      return;
    }

    syncInProgressRef.current = true;
    setStatus((prev) => ({ ...prev, isSyncing: true, error: null }));

    try {
      // Process pending items first
      const claimsProcessed = await processPendingClaims();
      const actionsProcessed = await processPendingActions();

      // Sync data from backend
      await syncPlayerStats();
      // await syncClaimedBlocks(); // Uncomment when location is available

      // Update last sync timestamp
      const now = Date.now();
      await storageService.saveLastSync(now);

      // Get remaining pending count
      const remainingClaims = await storageService.getPendingClaims();
      const remainingActions = await storageService.getPendingActions();
      const remainingCount = remainingClaims.length + remainingActions.length;

      setStatus({
        isSyncing: false,
        lastSync: now,
        pendingCount: remainingCount,
        error: null,
      });

      console.log(`Sync completed: ${claimsProcessed} claims, ${actionsProcessed} actions processed`);
    } catch (error) {
      console.error('Sync failed:', error);
      setStatus((prev) => ({
        ...prev,
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Sync failed',
      }));
    } finally {
      syncInProgressRef.current = false;
    }
  }, [isOnline, enabled, userId, processPendingClaims, processPendingActions, syncPlayerStats]);

  /**
   * Load initial pending count and last sync time
   */
  useEffect(() => {
    const loadInitialStatus = async () => {
      const pendingClaims = await storageService.getPendingClaims();
      const pendingActions = await storageService.getPendingActions();
      const lastSync = await storageService.getLastSync();

      setStatus((prev) => ({
        ...prev,
        pendingCount: pendingClaims.length + pendingActions.length,
        lastSync,
      }));
    };

    loadInitialStatus();
  }, []);

  /**
   * Auto-sync when coming online
   */
  useNetworkListener(
    () => {
      console.log('Network online - starting sync...');
      if (enabled) {
        sync();
      }
    },
    () => {
      console.log('Network offline');
    }
  );

  /**
   * Periodic sync when online (every 5 minutes)
   */
  useEffect(() => {
    if (!isOnline || !enabled) return;

    // Sync immediately
    sync();

    // Set up periodic sync
    const interval = setInterval(() => {
      sync();
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      clearInterval(interval);
    };
  }, [isOnline, enabled, sync]);

  return {
    ...status,
    sync,
  };
}

/**
 * useOfflineQueue Hook
 * Manage offline action queue without auto-sync
 * 
 * @example
 * const { addClaim, getPendingCount, clearQueue } = useOfflineQueue();
 * 
 * // Add claim to queue
 * await addClaim({ blockId, userId, latitude, longitude, timestamp });
 * 
 * // Check pending count
 * const count = await getPendingCount();
 */
export function useOfflineQueue() {
  /**
   * Add claim to offline queue
   */
  const addClaim = useCallback(
    async (claim: Omit<PendingClaim, 'id' | 'retries'>): Promise<string> => {
      return await storageService.addPendingClaim(claim);
    },
    []
  );

  /**
   * Add action to offline queue
   */
  const addAction = useCallback(
    async (action: Omit<PendingAction, 'id' | 'retries'>): Promise<string> => {
      return await storageService.addPendingAction(action);
    },
    []
  );

  /**
   * Get pending items count
   */
  const getPendingCount = useCallback(async (): Promise<number> => {
    const claims = await storageService.getPendingClaims();
    const actions = await storageService.getPendingActions();
    return claims.length + actions.length;
  }, []);

  /**
   * Clear all queues
   */
  const clearQueue = useCallback(async (): Promise<void> => {
    await storageService.clearPendingClaims();
    await storageService.clearPendingActions();
  }, []);

  return {
    addClaim,
    addAction,
    getPendingCount,
    clearQueue,
  };
}
