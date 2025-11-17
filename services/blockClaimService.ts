/**
 * Block Claim Service
 * 
 * Handles all block claiming operations including:
 * - Checking block ownership status
 * - Claiming neutral blocks
 * - Refreshing ownership timers
 * - Grace period checks for enemy blocks
 * - Reward distribution (XP + Gold)
 * - Retry logic for network failures
 */

import { parseCellId } from '../utils/gridUtils';
import { claimBlockInFirestore, getBlockOwnershipFromFirestore } from './firebaseBlockService';

// Constants
export const OWNERSHIP_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
export const GRACE_PERIOD = 60 * 60 * 1000; // 1 hour in milliseconds
export const CLAIM_REWARDS = {
    XP: 50,
    GOLD: 10,
};

// Types
export interface BlockOwnershipInfo {
    blockId: string;
    owner: string | null;
    ownerType: 'user' | 'guild' | 'enemy' | 'unclaimed';
    claimedAt: number | null;
    expiresAt: number | null;
    lastAttackAt: number | null;
    canClaim: boolean;
    reason?: string;
}

export interface ClaimBlockResponse {
    success: boolean;
    blockId: string;
    ownershipInfo: BlockOwnershipInfo;
    rewards: {
        xp: number;
        gold: number;
    };
    message: string;
}

export interface ClaimBlockError {
    error: string;
    code: 'NETWORK_ERROR' | 'ALREADY_OWNED' | 'GRACE_PERIOD' | 'INVALID_BLOCK' | 'UNAUTHORIZED' | 'SERVER_ERROR';
    retryable: boolean;
    retryAfter?: number;
}

/**
 * Fetch ownership information for a block
 */
export async function getBlockOwnership(
    blockId: string,
    userId: string
): Promise<BlockOwnershipInfo> {
    try {
        // Use Firebase Firestore for block ownership
        const firestoreData = await getBlockOwnershipFromFirestore(blockId, userId);
        
        return {
            blockId: firestoreData.blockId,
            owner: firestoreData.owner,
            ownerType: firestoreData.ownerType,
            claimedAt: firestoreData.claimedAt,
            expiresAt: firestoreData.expiresAt,
            lastAttackAt: null,
            canClaim: firestoreData.canClaim,
        };
    } catch (error) {
        console.error('Error fetching block ownership:', error);
        throw error;
    }
}

/**
 * Check if a block can be claimed based on ownership and grace period
 */
export function canClaimBlock(ownershipInfo: BlockOwnershipInfo, userId: string): {
    canClaim: boolean;
    reason?: string;
} {
    const now = Date.now();

    // Neutral blocks can always be claimed
    if (ownershipInfo.ownerType === 'unclaimed' || !ownershipInfo.owner) {
        return { canClaim: true };
    }

    // User already owns this block - can refresh
    if (ownershipInfo.owner === userId) {
        return { canClaim: true, reason: 'refresh' };
    }

    // Check if ownership has expired
    if (ownershipInfo.expiresAt && now > ownershipInfo.expiresAt) {
        return { canClaim: true, reason: 'expired' };
    }

    // Enemy block - check grace period
    if (ownershipInfo.ownerType === 'enemy') {
        if (!ownershipInfo.lastAttackAt) {
            // No previous attack - can attempt
            return { canClaim: true, reason: 'first_attack' };
        }

        const timeSinceLastAttack = now - ownershipInfo.lastAttackAt;
        if (timeSinceLastAttack < GRACE_PERIOD) {
            const remainingTime = Math.ceil((GRACE_PERIOD - timeSinceLastAttack) / 1000 / 60);
            return {
                canClaim: false,
                reason: `Grace period active. Try again in ${remainingTime} minutes.`,
            };
        }

        return { canClaim: true, reason: 'grace_period_expired' };
    }

    // Guild blocks cannot be claimed by guild members
    if (ownershipInfo.ownerType === 'guild') {
        return { canClaim: false, reason: 'Cannot claim guild territory' };
    }

    return { canClaim: false, reason: 'Block is owned by another player' };
}

/**
 * Claim a block (neutral or expired)
 */
export async function claimBlock(
    blockId: string,
    userId: string,
    latitude: number,
    longitude: number
): Promise<ClaimBlockResponse> {
    try {
        // First, check ownership
        const ownershipInfo = await getBlockOwnership(blockId, userId);
        const claimCheck = canClaimBlock(ownershipInfo, userId);

        if (!claimCheck.canClaim) {
            throw {
                error: claimCheck.reason || 'Cannot claim this block',
                code: 'ALREADY_OWNED',
                retryable: false,
            } as ClaimBlockError;
        }

        // Parse blockId to get grid coordinates
        const { latitude: blockLat, longitude: blockLon } = parseCellId(blockId);
        
        // Calculate grid X and Y from lat/lon (simple grid system)
        const gridX = Math.floor(blockLon * 1000);
        const gridY = Math.floor(blockLat * 1000);

        // Use Firebase to claim the block
        const firestoreResult = await claimBlockInFirestore(
            blockId,
            userId,
            gridX,
            gridY,
            latitude,
            longitude
        );

        // Convert Firebase result to ClaimBlockResponse format
        const response: ClaimBlockResponse = {
            success: true,
            blockId: firestoreResult.blockId,
            ownershipInfo: {
                blockId: firestoreResult.blockId,
                owner: firestoreResult.ownerId,
                ownerType: 'user',
                claimedAt: firestoreResult.claimedAt,
                expiresAt: firestoreResult.expiresAt,
                lastAttackAt: null,
                canClaim: true,
            },
            rewards: firestoreResult.rewards,
            message: firestoreResult.message,
        };

        console.log('✅ Block claimed:', response);
        return response;
    } catch (error: any) {
        console.error('❌ Error claiming block:', error);
        
        // Convert to ClaimBlockError
        if (error.code) {
            throw error as ClaimBlockError;
        }

        throw {
            error: error.message || 'Failed to claim block',
            code: 'SERVER_ERROR',
            retryable: true,
        } as ClaimBlockError;
    }
}

/**
 * Attack an enemy block (initiates grace period)
 */
export async function attackBlock(
    blockId: string,
    userId: string
): Promise<{ success: boolean; message: string; retryAfter?: number }> {
    try {
        const ownershipInfo = await getBlockOwnership(blockId, userId);

        if (ownershipInfo.ownerType !== 'enemy') {
            throw {
                error: 'Can only attack enemy blocks',
                code: 'INVALID_BLOCK',
                retryable: false,
            } as ClaimBlockError;
        }

        // Check if grace period is active
        if (ownershipInfo.lastAttackAt) {
            const timeSinceLastAttack = Date.now() - ownershipInfo.lastAttackAt;
            if (timeSinceLastAttack < GRACE_PERIOD) {
                const remainingSeconds = Math.ceil((GRACE_PERIOD - timeSinceLastAttack) / 1000);
                return {
                    success: false,
                    message: 'Grace period active',
                    retryAfter: remainingSeconds,
                };
            }
        }

        // TODO: Replace with actual API call
        // const response = await apiService.post('/blocks/attack', {
        //     blockId,
        //     userId,
        //     timestamp: Date.now(),
        // });

        return {
            success: true,
            message: 'Attack initiated. Block can be claimed after grace period.',
        };
    } catch (error: any) {
        throw {
            error: error.message || 'Failed to attack block',
            code: 'SERVER_ERROR',
            retryable: true,
        } as ClaimBlockError;
    }
}

/**
 * Refresh ownership timer for owned block
 */
export async function refreshOwnership(
    blockId: string,
    userId: string
): Promise<ClaimBlockResponse> {
    return claimBlock(blockId, userId, 0, 0); // Coordinates not needed for refresh
}

/**
 * Retry wrapper with exponential backoff
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;

            // Don't retry if error is not retryable
            if (error.retryable === false) {
                throw error;
            }

            // Don't retry on last attempt
            if (attempt === maxRetries - 1) {
                throw error;
            }

            // Wait with exponential backoff
            const delay = initialDelay * Math.pow(2, attempt);
            console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError;
}

/**
 * Claim block with automatic retry
 */
export async function claimBlockWithRetry(
    blockId: string,
    userId: string,
    latitude: number,
    longitude: number,
    maxRetries: number = 3
): Promise<ClaimBlockResponse> {
    return retryWithBackoff(
        () => claimBlock(blockId, userId, latitude, longitude),
        maxRetries
    );
}

/**
 * Batch check ownership for multiple blocks
 */
export async function batchGetOwnership(
    blockIds: string[],
    userId: string
): Promise<Record<string, BlockOwnershipInfo>> {
    try {
        // TODO: Replace with actual batch API call
        // const response = await apiService.post('/blocks/batch-ownership', {
        //     blockIds,
        //     userId,
        // });

        // Mock implementation
        const result: Record<string, BlockOwnershipInfo> = {};
        for (const blockId of blockIds) {
            result[blockId] = await getBlockOwnership(blockId, userId);
        }

        return result;
    } catch (error) {
        console.error('Error in batch ownership check:', error);
        throw error;
    }
}
