/**
 * useResourceCollection Hook
 * Manages resource generation and collection logic
 */

import { useCallback, useEffect, useState } from 'react';
import {
    calculatePendingResources,
    calculateResourcesPerHour,
    collectResources,
} from '../services/resourceService';
import { useAppDispatch, useAppSelector } from '../store';
import { addGold } from '../store/slices/playerSlice';
import {
    collectResourcesFailure,
    collectResourcesSuccess,
    initializeResources,
    simulateHourlyUpdate,
    startCollecting,
    updateGoldPerHour,
    updatePendingResources,
} from '../store/slices/resourceSlice';
import { Block } from '../types';

export function useResourceCollection() {
  const dispatch = useAppDispatch();
  const [showNotification, setShowNotification] = useState(false);
  const [lastCollectedAmount, setLastCollectedAmount] = useState(0);

  // Selectors
  const userId = useAppSelector((state) => state.auth.user?.id);
  const allBlocks = useAppSelector((state) => state.map.blocks || {});
  const ownedBlocks = Object.values(allBlocks).filter(
    (block) => block.ownerId === userId
  );
  const playerGold = useAppSelector((state) => (state as any).player?.profile?.gold || 0);
  const playerHealth = useAppSelector((state) => (state as any).player?.profile?.health || 100);
  const playerMaxHealth = useAppSelector((state) => (state as any).player?.profile?.maxHealth || 100);
  
  const {
    lastCollectionTime,
    pendingGold,
    isCollecting,
    goldPerHour,
  } = useAppSelector((state) => state.resource);

  // Initialize resources on mount
  useEffect(() => {
    if (userId) {
      dispatch(initializeResources({}));
    }
  }, [dispatch, userId]);

  // Update gold per hour when owned blocks change
  useEffect(() => {
    const rate = calculateResourcesPerHour(ownedBlocks as Block[]);
    dispatch(updateGoldPerHour(rate));
  }, [dispatch, ownedBlocks]);

  // Update pending resources periodically
  useEffect(() => {
    if (!lastCollectionTime || goldPerHour === 0) return;

    const updatePending = () => {
      const lastCollection = new Date(lastCollectionTime);
      const pending = calculatePendingResources(ownedBlocks as Block[], lastCollection);
      dispatch(updatePendingResources(pending));
    };

    // Update immediately
    updatePending();

    // Update every 10 seconds
    const interval = setInterval(updatePending, 10000);

    return () => clearInterval(interval);
  }, [dispatch, lastCollectionTime, goldPerHour, ownedBlocks]);

  // Mock hourly update for testing (simulates time passage)
  useEffect(() => {
    // Update every minute for testing (in production, this would be handled by backend)
    const interval = setInterval(() => {
      dispatch(simulateHourlyUpdate());
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, [dispatch]);

  // Collect resources
  const handleCollectResources = useCallback(async () => {
    if (!userId || !lastCollectionTime || pendingGold === 0) {
      return;
    }

    dispatch(startCollecting());

    try {
      const result = await collectResources(
        userId,
        new Date(lastCollectionTime),
        ownedBlocks as Block[],
        {
          gold: playerGold,
          health: playerHealth,
          maxHealth: playerMaxHealth,
          mana: 0,
        }
      );

      if (result.success) {
        // Update Redux state
        dispatch(
          collectResourcesSuccess({
            collected: result.collected,
            newCollectionTime: result.newCollectionTime.toISOString(),
          })
        );

        // Update player gold
        dispatch(addGold(result.collected));

        // Show notification
        setLastCollectedAmount(result.collected);
        setShowNotification(true);
      } else {
        dispatch(collectResourcesFailure('Failed to collect resources'));
      }
    } catch (error) {
      console.error('Error collecting resources:', error);
      dispatch(collectResourcesFailure('An error occurred'));
    }
  }, [
    dispatch,
    userId,
    lastCollectionTime,
    pendingGold,
    ownedBlocks,
    playerGold,
    playerHealth,
    playerMaxHealth,
  ]);

  // Dismiss notification
  const dismissNotification = useCallback(() => {
    setShowNotification(false);
  }, []);

  return {
    // Resource data
    goldPerHour,
    pendingGold,
    isCollecting,
    playerGold,
    playerHealth,
    playerMaxHealth,

    // Actions
    collectResources: handleCollectResources,

    // Notification state
    showNotification,
    lastCollectedAmount,
    dismissNotification,
  };
}
