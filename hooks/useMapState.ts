/**
 * useMapState Hook
 * 
 * Manages map state including:
 * - Visible blocks in current map view
 * - Block ownership data from Firebase + Local cache
 * - Block claiming functionality
 * - Performance optimization for rendering many blocks
 * 
 * STRATEGY:
 * 1. On mount: Fetch all user's claimed blocks and cache locally
 * 2. On claim: Update local cache + Firebase
 * 3. On region change: Only fetch visible area for enemy blocks
 */
import { BlockOwnership } from '@/screens/MapScreen';
import { getClaimedBlocksInRegion, getUserBlocksFromFirestore } from '@/services/firebaseBlockService';
import { RootState } from '@/store';
import { getCellsInRadius } from '@/utils/gridUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

const USER_BLOCKS_CACHE_KEY = '@realm_walker_user_blocks';

export function useMapState() {
    const user = useSelector((state: RootState) => state.auth.user);
    const currentBlock = useSelector((state: RootState) => state.location.currentBlock);
    
    const [visibleBlocks, setVisibleBlocks] = useState<string[]>([]);
    const [blockOwnership, setBlockOwnership] = useState<Record<string, BlockOwnership>>({});
    const [loading, setLoading] = useState(false);
    
    // Cache of all user's claimed blocks (never cleared)
    const userBlocksCache = useRef<Set<string>>(new Set());
    const lastFetchRef = useRef({ timestamp: 0, latitude: 0, longitude: 0 });
    const fetchThrottleMs = 3000;
    const minDistanceMeters = 50;
    const initialLoadComplete = useRef(false);

    /**
     * Calculate distance between two points (simple approximation)
     */
    const calculateSimpleDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const latDiff = (lat2 - lat1) * 111320;
        const lonDiff = (lon2 - lon1) * 111320 * Math.cos(lat1 * Math.PI / 180);
        return Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
    };

    /**
     * Load user's claimed blocks from cache/Firebase on mount
     */
    useEffect(() => {
        if (!user?.id || initialLoadComplete.current) return;

        const loadUserBlocks = async () => {
            try {
                console.log('🔵 [MAP] Loading user claimed blocks...');
                
                // First try AsyncStorage cache
                const cached = await AsyncStorage.getItem(USER_BLOCKS_CACHE_KEY);
                if (cached) {
                    const cachedBlocks = JSON.parse(cached) as string[];
                    cachedBlocks.forEach(blockId => userBlocksCache.current.add(blockId));
                    console.log(`💾 [MAP] Loaded ${cachedBlocks.length} blocks from cache`);
                }

                // Then fetch from Firebase to get latest
                const firebaseBlocks = await getUserBlocksFromFirestore(user.id);
                firebaseBlocks.forEach(blockId => userBlocksCache.current.add(blockId));
                
                console.log(`✅ [MAP] Total user blocks: ${userBlocksCache.current.size}`);
                
                // Save to cache
                await AsyncStorage.setItem(
                    USER_BLOCKS_CACHE_KEY,
                    JSON.stringify(Array.from(userBlocksCache.current))
                );

                // Update ownership for all cached blocks
                const ownership: Record<string, BlockOwnership> = {};
                userBlocksCache.current.forEach(blockId => {
                    ownership[blockId] = 'user';
                });
                setBlockOwnership(ownership);
                
                initialLoadComplete.current = true;
            } catch (error) {
                console.error('❌ [MAP] Error loading user blocks:', error);
            }
        };

        loadUserBlocks();
    }, [user?.id]);

    /**
     * Fetch blocks in a given area
     */
    const fetchBlocksInArea = useCallback(async (
        latitude: number,
        longitude: number,
        radiusMeters: number
    ) => {
        try {
            const now = Date.now();
            const timeSinceLastFetch = now - lastFetchRef.current.timestamp;
            const distanceMoved = calculateSimpleDistance(
                latitude,
                longitude,
                lastFetchRef.current.latitude,
                lastFetchRef.current.longitude
            );

            // Get all cells within radius
            const cells = getCellsInRadius(latitude, longitude, radiusMeters);
            setVisibleBlocks(cells);

            // Skip fetch if too soon or not moved enough (but only after initial load)
            if (lastFetchRef.current.timestamp > 0 && 
                timeSinceLastFetch < fetchThrottleMs && 
                distanceMoved < minDistanceMeters) {
                console.log(`⏭️ [MAP] Skipping fetch - using cached data (${distanceMoved.toFixed(0)}m)`);
                return;
            }

            setLoading(true);
            lastFetchRef.current = { timestamp: now, latitude, longitude };
            
            console.log(`🗺️ [MAP] Fetching ${cells.length} visible cells in ${radiusMeters}m radius`);
            
            // Calculate grid bounds
            const gridXValues = cells.map(cellId => {
                const [, lon] = cellId.split('_').map(Number);
                return Math.floor(lon * 1000);
            });
            const gridYValues = cells.map(cellId => {
                const [lat] = cellId.split('_').map(Number);
                return Math.floor(lat * 1000);
            });
            
            const minGridX = Math.min(...gridXValues);
            const maxGridX = Math.max(...gridXValues);
            const minGridY = Math.min(...gridYValues);
            const maxGridY = Math.max(...gridYValues);
            
            // Fetch claimed blocks from Firebase (for enemy blocks)
            console.log(`🔍 [MAP] Fetching blocks in region: gridX(${minGridX}-${maxGridX}), gridY(${minGridY}-${maxGridY})`);
            const claimedBlocks = await getClaimedBlocksInRegion(
                minGridX,
                maxGridX,
                minGridY,
                maxGridY
            );
            
            console.log(`📦 [MAP] Found ${claimedBlocks.length} claimed blocks in Firebase`);
            
            // Build ownership map
            const ownershipData: Record<string, BlockOwnership> = {};
            
            // First, set all user's cached blocks
            cells.forEach(cellId => {
                if (userBlocksCache.current.has(cellId)) {
                    ownershipData[cellId] = 'user';
                }
            });
            
            // Then, set enemy blocks from Firebase
            claimedBlocks.forEach(block => {
                if (block.ownerId && block.ownerId !== user?.id) {
                    ownershipData[block.blockId] = 'enemy';
                }
            });
            
            // Finally, set unclaimed for remaining visible cells
            cells.forEach(cellId => {
                if (!ownershipData[cellId]) {
                    ownershipData[cellId] = 'unclaimed';
                }
            });
            
            const userBlockCount = Object.values(ownershipData).filter(o => o === 'user').length;
            const enemyBlockCount = Object.values(ownershipData).filter(o => o === 'enemy').length;
            console.log(`✅ [MAP] Visible: ${userBlockCount} user, ${enemyBlockCount} enemy blocks`);
            
            // Update state
            setBlockOwnership(prev => ({
                ...prev,
                ...ownershipData
            }));
            
        } catch (error) {
            console.error('❌ [MAP] Error fetching blocks:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    /**
     * Claim the current block the user is in
     */
    const claimCurrentBlock = useCallback(async (): Promise<boolean> => {
        if (!currentBlock || !user) {
            return false;
        }

        try {
            setLoading(true);
            
            // In production, call API to claim block
            // const response = await apiService.claimBlock(currentBlock.blockId, user.uid);
            
            // Mock success - update local state
            setBlockOwnership(prev => ({
                ...prev,
                [currentBlock.id]: 'user',
            }));
            
            console.log(`Block ${currentBlock.id} claimed by user ${user.id}`);
            
            return true;
        } catch (error) {
            console.error('Error claiming block:', error);
            return false;
        } finally {
            setLoading(false);
        }
    }, [currentBlock, user]);

    /**
     * Get ownership info for a specific block
     */
    const getBlockOwnership = useCallback((cellId: string): BlockOwnership => {
        return blockOwnership[cellId] || 'unclaimed';
    }, [blockOwnership]);

    /**
     * Clear the cache (useful for refresh)
     */
    const clearCache = useCallback(() => {
        setBlockOwnership({});
        setVisibleBlocks([]);
    }, []);

    /**
     * Update block ownership locally (after claiming)
     * Also updates the cache
     */
    const updateBlockOwnership = useCallback(async (blockId: string, ownership: BlockOwnership) => {
        console.log(`🎨 [MAP] Updating block ${blockId} ownership to: ${ownership}`);
        
        // Update state
        setBlockOwnership(prev => ({
            ...prev,
            [blockId]: ownership,
        }));

        // If it's a user block, add to cache
        if (ownership === 'user' && user?.id) {
            userBlocksCache.current.add(blockId);
            
            // Save to AsyncStorage
            try {
                await AsyncStorage.setItem(
                    USER_BLOCKS_CACHE_KEY,
                    JSON.stringify(Array.from(userBlocksCache.current))
                );
                console.log(`💾 [MAP] Cached block ${blockId} (Total: ${userBlocksCache.current.size})`);
            } catch (error) {
                console.error('❌ [MAP] Error caching block:', error);
            }
        }
    }, [user?.id]);

    return {
        visibleBlocks,
        blockOwnership,
        loading,
        fetchBlocksInArea,
        claimCurrentBlock,
        getBlockOwnership,
        clearCache,
        updateBlockOwnership,
    };
}
