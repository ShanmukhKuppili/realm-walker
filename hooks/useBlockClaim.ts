/**
 * useBlockClaim Hook
 * 
 * Manages automatic block claiming when user enters a new block.
 * Handles:
 * - Auto-detection of new block entry via GPS
 * - Ownership checks (neutral/owned/enemy)
 * - Auto-claim for neutral blocks
 * - Ownership timer refresh for owned blocks
 * - Grace period validation for enemy blocks
 * - XP and Gold reward distribution
 * - Visual feedback and notifications
 */

import {
    canClaimBlock,
    ClaimBlockError,
    claimBlockWithRetry,
    getBlockOwnership,
} from '@/services/blockClaimService';
import {
    notifyBlockClaimed,
    notifyClaimFailed,
    notifyOwnershipRefreshed,
} from '@/services/notificationService';
import { RootState } from '@/store';
import { addGold, addXP } from '@/store/slices/userSlice';
import { useCallback, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

interface UseBlockClaimOptions {
    autoClaimEnabled?: boolean;
    showNotifications?: boolean;
    showVisualFeedback?: boolean;
    onClaimSuccess?: (blockId: string, rewards: { xp: number; gold: number }) => void;
    onClaimFailed?: (error: ClaimBlockError) => void;
}

interface UseBlockClaimReturn {
    claiming: boolean;
    lastClaimedBlock: string | null;
    claimBlock: (blockId: string) => Promise<boolean>;
    canClaim: (blockId: string) => Promise<{ canClaim: boolean; reason?: string }>;
}

export function useBlockClaim(options: UseBlockClaimOptions = {}): UseBlockClaimReturn {
    const {
        autoClaimEnabled = true,
        showNotifications = true,
        showVisualFeedback = true,
        onClaimSuccess,
        onClaimFailed,
    } = options;

    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);
    const currentBlock = useSelector((state: RootState) => state.location.currentBlock);
    const latitude = useSelector((state: RootState) => state.location.latitude);
    const longitude = useSelector((state: RootState) => state.location.longitude);
    const isTracking = useSelector((state: RootState) => state.location.isTracking);

    const claimingRef = useRef(false);
    const lastClaimedBlockRef = useRef<string | null>(null);
    const previousBlockRef = useRef<string | null>(null);
    const claimAttemptTimestamps = useRef<Record<string, number>>({});
    const autoClaimTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Get current block ID (handle both Block type and blockId string)
    const getCurrentBlockId = useCallback((): string | null => {
        if (!currentBlock) return null;
        // If currentBlock is Block type, use id property
        if (typeof currentBlock === 'object' && 'id' in currentBlock) {
            return currentBlock.id;
        }
        // If it's the structure from locationService with blockId
        if (typeof currentBlock === 'object' && 'blockId' in currentBlock) {
            return (currentBlock as any).blockId;
        }
        return null;
    }, [currentBlock]);

    /**
     * Check if a block can be claimed
     */
    const canClaim = useCallback(
        async (blockId: string): Promise<{ canClaim: boolean; reason?: string }> => {
            if (!user) {
                return { canClaim: false, reason: 'User not authenticated' };
            }

            try {
                const ownershipInfo = await getBlockOwnership(blockId, user.id);
                return canClaimBlock(ownershipInfo, user.id);
            } catch (error) {
                console.error('Error checking if block can be claimed:', error);
                return { canClaim: false, reason: 'Failed to check ownership' };
            }
        },
        [user]
    );

    /**
     * Claim a block manually or automatically
     */
    const claimBlock = useCallback(
        async (blockId: string): Promise<boolean> => {
            // Prevent concurrent claims
            if (claimingRef.current) {
                console.log('⏳ Claim already in progress, skipping...');
                return false;
            }

            if (!user || !latitude || !longitude) {
                console.warn('❌ Cannot claim: User or location not available');
                return false;
            }

            // Rate limiting: prevent claiming same block within 10 seconds
            const lastAttempt = claimAttemptTimestamps.current[blockId];
            if (lastAttempt && Date.now() - lastAttempt < 10000) {
                console.log('⏱️ Rate limited: Too soon to claim this block again');
                return false;
            }

            claimingRef.current = true;
            claimAttemptTimestamps.current[blockId] = Date.now();

            try {
                console.log(`🎯 Attempting to claim block: ${blockId}`);

                // Check if can claim
                const claimCheck = await canClaim(blockId);
                if (!claimCheck.canClaim) {
                    console.log(`❌ Cannot claim: ${claimCheck.reason}`);
                    
                    if (showVisualFeedback) {
                        Alert.alert('Cannot Claim', claimCheck.reason || 'Block is not available');
                    }
                    
                    if (showNotifications) {
                        await notifyClaimFailed(claimCheck.reason || 'Cannot claim block');
                    }

                    if (onClaimFailed) {
                        onClaimFailed({
                            error: claimCheck.reason || 'Cannot claim',
                            code: 'ALREADY_OWNED',
                            retryable: false,
                        });
                    }

                    return false;
                }

                // Attempt claim with retry
                const response = await claimBlockWithRetry(blockId, user.id, latitude, longitude);

                if (response.success) {
                    console.log(`✅ Block claimed successfully: ${blockId}`);
                    lastClaimedBlockRef.current = blockId;

                    // Award XP and Gold
                    if (response.rewards.xp > 0) {
                        dispatch(addXP(response.rewards.xp));
                        dispatch(addGold(response.rewards.gold));
                        
                        console.log(
                            `💰 Rewards granted: +${response.rewards.xp} XP, +${response.rewards.gold} Gold`
                        );
                    }

                    // Show notifications
                    if (showNotifications) {
                        if (response.rewards.xp > 0) {
                            await notifyBlockClaimed(
                                blockId,
                                response.rewards.xp,
                                response.rewards.gold
                            );
                        } else {
                            await notifyOwnershipRefreshed(blockId);
                        }
                    }

                    // Show visual feedback
                    if (showVisualFeedback && response.rewards.xp > 0) {
                        Alert.alert(
                            '🎉 Block Claimed!',
                            response.message,
                            [{ text: 'OK' }]
                        );
                    }

                    // Call success callback
                    if (onClaimSuccess) {
                        onClaimSuccess(blockId, response.rewards);
                    }

                    return true;
                }

                return false;
            } catch (error: any) {
                console.error('❌ Error claiming block:', error);

                const claimError = error as ClaimBlockError;

                if (showNotifications) {
                    await notifyClaimFailed(
                        claimError.error || 'Failed to claim block'
                    );
                }

                if (showVisualFeedback) {
                    Alert.alert(
                        'Claim Failed',
                        claimError.error || 'An error occurred while claiming the block',
                        [{ text: 'OK' }]
                    );
                }

                if (onClaimFailed) {
                    onClaimFailed(claimError);
                }

                return false;
            } finally {
                claimingRef.current = false;
            }
        },
        [user, latitude, longitude, showNotifications, showVisualFeedback, canClaim, dispatch, onClaimSuccess, onClaimFailed]
    );

    /**
     * Auto-claim when entering a new block
     */
    useEffect(() => {
        console.log('🔍 [AUTO-CLAIM] Check triggered:', {
            autoClaimEnabled,
            isTracking,
            hasCurrentBlock: !!currentBlock,
            currentBlockId: currentBlock?.id,
            previousBlock: previousBlockRef.current,
        });

        if (!autoClaimEnabled || !isTracking || !currentBlock) {
            console.log('⏸️ [AUTO-CLAIM] Conditions not met - auto-claim disabled');
            return;
        }

        const currentBlockId = getCurrentBlockId();
        if (!currentBlockId) {
            console.log('❌ [AUTO-CLAIM] No current block ID available');
            return;
        }

        // Check if this is a new block
        if (previousBlockRef.current === currentBlockId) {
            console.log(`⏸️ [AUTO-CLAIM] Still in same block: ${currentBlockId}`);
            return; // Still in same block - don't restart timer
        }

        console.log(`📍 [AUTO-CLAIM] Entered new block: ${currentBlockId} (from: ${previousBlockRef.current || 'none'})`);
        
        // Clear any existing timer
        if (autoClaimTimerRef.current) {
            console.log(`🧹 [AUTO-CLAIM] Clearing previous timer`);
            clearTimeout(autoClaimTimerRef.current);
            autoClaimTimerRef.current = null;
        }

        // Update previous block
        previousBlockRef.current = currentBlockId;

        // Skip if we just claimed this block
        if (lastClaimedBlockRef.current === currentBlockId) {
            console.log(`⏭️ [AUTO-CLAIM] Skipping: Block ${currentBlockId} was recently claimed`);
            return;
        }

        // Attempt auto-claim after a short delay (to ensure stable GPS)
        console.log(`⏳ [AUTO-CLAIM] Starting 2-second GPS stabilization timer for ${currentBlockId}...`);
        autoClaimTimerRef.current = setTimeout(() => {
            console.log(`🔄 [AUTO-CLAIM] Timer expired, attempting to claim ${currentBlockId}...`);
            autoClaimTimerRef.current = null; // Clear ref after timer fires
            
            claimBlock(currentBlockId).then((success) => {
                if (success) {
                    console.log(`✅ [AUTO-CLAIM] Successfully claimed block: ${currentBlockId}`);
                } else {
                    console.log(`⏭️ [AUTO-CLAIM] Claim skipped for ${currentBlockId} (already owned or invalid)`);
                }
            }).catch((error) => {
                console.error(`❌ [AUTO-CLAIM] Error claiming block ${currentBlockId}:`, error);
            });
        }, 2000); // 2 second delay for GPS stabilization

        // Cleanup function only runs on unmount, not on every re-render
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoClaimEnabled, isTracking, getCurrentBlockId, claimBlock, currentBlock?.id]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (autoClaimTimerRef.current) {
                console.log(`🧹 [AUTO-CLAIM] Component unmounting, clearing timer`);
                clearTimeout(autoClaimTimerRef.current);
                autoClaimTimerRef.current = null;
            }
        };
    }, []);

    return {
        claiming: claimingRef.current,
        lastClaimedBlock: lastClaimedBlockRef.current,
        claimBlock,
        canClaim,
    };
}
