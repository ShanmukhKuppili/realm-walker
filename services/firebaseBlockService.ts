/**
 * Firebase Firestore Block Service
 * Handles block claiming and ownership persistence
 */
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    setDoc,
    Timestamp,
    updateDoc,
    where,
} from 'firebase/firestore';
import { db } from '../config/FirebaseConfig';

// Firestore collection names
const BLOCKS_COLLECTION = 'blocks';
const USER_BLOCKS_COLLECTION = 'userBlocks';

// Block ownership duration (24 hours in milliseconds)
const OWNERSHIP_DURATION = 24 * 60 * 60 * 1000;

// Claim rewards
const CLAIM_REWARDS = {
    XP: 50,
    GOLD: 10,
};

export interface FirestoreBlock {
    blockId: string;
    ownerId: string | null;
    ownerType: 'user' | 'guild' | 'unclaimed';
    claimedAt: Timestamp | null;
    expiresAt: Timestamp | null;
    gridX: number;
    gridY: number;
    latitude: number;
    longitude: number;
    level: number;
    resourceType?: string;
    blockType?: string;
}

export interface ClaimResult {
    success: boolean;
    blockId: string;
    ownerId: string;
    claimedAt: number;
    expiresAt: number;
    rewards: {
        xp: number;
        gold: number;
    };
    isRefresh: boolean;
    message: string;
}

/**
 * Get block ownership from Firestore
 */
export async function getBlockOwnershipFromFirestore(
    blockId: string,
    userId: string
): Promise<{
    blockId: string;
    owner: string | null;
    ownerType: 'user' | 'guild' | 'unclaimed' | 'enemy';
    claimedAt: number | null;
    expiresAt: number | null;
    canClaim: boolean;
}> {
    try {
        const blockRef = doc(db, BLOCKS_COLLECTION, blockId);
        const blockSnap = await getDoc(blockRef);

        if (!blockSnap.exists()) {
            // Block not in database = unclaimed
            return {
                blockId,
                owner: null,
                ownerType: 'unclaimed',
                claimedAt: null,
                expiresAt: null,
                canClaim: true,
            };
        }

        const data = blockSnap.data() as FirestoreBlock;
        const now = Date.now();

        // Check if ownership expired
        if (data.expiresAt && data.expiresAt.toMillis() < now) {
            return {
                blockId,
                owner: null,
                ownerType: 'unclaimed',
                claimedAt: null,
                expiresAt: null,
                canClaim: true,
            };
        }

        // Check ownership
        const isOwner = data.ownerId === userId;
        const ownerType = isOwner ? 'user' : data.ownerId ? 'enemy' : 'unclaimed';

        return {
            blockId,
            owner: data.ownerId,
            ownerType,
            claimedAt: data.claimedAt?.toMillis() || null,
            expiresAt: data.expiresAt?.toMillis() || null,
            canClaim: ownerType === 'unclaimed' || ownerType === 'user',
        };
    } catch (error) {
        console.error('❌ Error fetching block ownership:', error);
        throw error;
    }
}

/**
 * Claim a block in Firestore
 */
export async function claimBlockInFirestore(
    blockId: string,
    userId: string,
    gridX: number,
    gridY: number,
    latitude: number,
    longitude: number
): Promise<ClaimResult> {
    try {
        const now = Date.now();
        const expiresAt = now + OWNERSHIP_DURATION;

        // Check if block exists and ownership status
        const ownership = await getBlockOwnershipFromFirestore(blockId, userId);

        if (!ownership.canClaim) {
            throw new Error('Cannot claim block - owned by another player');
        }

        const isRefresh = ownership.owner === userId;
        const blockRef = doc(db, BLOCKS_COLLECTION, blockId);

        // Create or update block document
        const blockData: FirestoreBlock = {
            blockId,
            ownerId: userId,
            ownerType: 'user',
            claimedAt: Timestamp.fromMillis(now),
            expiresAt: Timestamp.fromMillis(expiresAt),
            gridX,
            gridY,
            latitude,
            longitude,
            level: 1,
        };

        await setDoc(blockRef, blockData, { merge: true });

        // Update user's block count
        const userBlockRef = doc(db, USER_BLOCKS_COLLECTION, userId);
        const userBlockSnap = await getDoc(userBlockRef);

        if (userBlockSnap.exists()) {
            const userBlocks = userBlockSnap.data().blocks || [];
            if (!userBlocks.includes(blockId)) {
                await updateDoc(userBlockRef, {
                    blocks: [...userBlocks, blockId],
                    totalClaimed: userBlocks.length + 1,
                    lastClaimed: serverTimestamp(),
                });
            }
        } else {
            await setDoc(userBlockRef, {
                userId,
                blocks: [blockId],
                totalClaimed: 1,
                lastClaimed: serverTimestamp(),
            });
        }

        console.log(`✅ Block ${blockId} claimed by ${userId}`);

        return {
            success: true,
            blockId,
            ownerId: userId,
            claimedAt: now,
            expiresAt,
            rewards: {
                xp: isRefresh ? 0 : CLAIM_REWARDS.XP,
                gold: isRefresh ? 0 : CLAIM_REWARDS.GOLD,
            },
            isRefresh,
            message: isRefresh
                ? 'Ownership timer refreshed for 24 hours'
                : 'Block claimed successfully! +50 XP, +10 Gold',
        };
    } catch (error) {
        console.error('❌ Error claiming block in Firestore:', error);
        throw error;
    }
}

/**
 * Get all blocks owned by a user
 */
/**
 * Get all blocks owned by a user
 * Queries the blocks collection for all blocks owned by the user
 */
export async function getUserBlocksFromFirestore(userId: string): Promise<string[]> {
    try {
        const blocksRef = collection(db, BLOCKS_COLLECTION);
        const q = query(blocksRef, where('ownerId', '==', userId));
        
        const querySnapshot = await getDocs(q);
        const blockIds: string[] = [];
        const now = Date.now();

        querySnapshot.forEach((doc) => {
            const data = doc.data() as FirestoreBlock;
            
            // Only include non-expired blocks
            const isExpired = data.expiresAt && data.expiresAt.toMillis() < now;
            if (!isExpired) {
                blockIds.push(data.blockId);
            }
        });

        console.log(`🔍 [Firebase] Found ${blockIds.length} active blocks for user ${userId}`);
        return blockIds;
    } catch (error) {
        console.error('❌ Error fetching user blocks:', error);
        return [];
    }
}

/**
 * Get all claimed blocks in a region (for map display)
 */
export async function getClaimedBlocksInRegion(
    minGridX: number,
    maxGridX: number,
    minGridY: number,
    maxGridY: number
): Promise<FirestoreBlock[]> {
    try {
        const blocksRef = collection(db, BLOCKS_COLLECTION);
        const q = query(
            blocksRef,
            where('gridX', '>=', minGridX),
            where('gridX', '<=', maxGridX)
        );

        const querySnapshot = await getDocs(q);
        const blocks: FirestoreBlock[] = [];
        const now = Date.now();

        querySnapshot.forEach((doc) => {
            const data = doc.data() as FirestoreBlock;
            
            // Filter by gridY and check expiration
            if (data.gridY >= minGridY && data.gridY <= maxGridY) {
                const isExpired = data.expiresAt && data.expiresAt.toMillis() < now;
                if (!isExpired) {
                    blocks.push(data);
                }
            }
        });

        return blocks;
    } catch (error) {
        console.error('❌ Error fetching claimed blocks in region:', error);
        return [];
    }
}

/**
 * Check if a block is expired and should be marked as unclaimed
 */
export function isBlockExpired(expiresAt: Timestamp | null): boolean {
    if (!expiresAt) return true;
    return expiresAt.toMillis() < Date.now();
}
