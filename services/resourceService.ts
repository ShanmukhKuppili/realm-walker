/**
 * Resource Generation Service
 * Handles passive resource generation from owned blocks
 */

import { Block, BlockType, Resources } from '../types';

// Constants for resource generation
export const RESOURCE_GENERATION = {
  BASE_RATES: {
    park: 5,       // 5 Gold/hour
    urban: 3,      // 3 Gold/hour
    landmark: 2,   // 2 Gold/hour
    residential: 1, // 1 Gold/hour
    commercial: 4,  // 4 Gold/hour
  },
  LEVEL_MULTIPLIERS: {
    1: 1.0,   // Level 1 = 1x
    2: 1.2,   // Level 2 = 1.2x
    3: 1.5,   // Level 3 = 1.5x
  },
  CLUSTER_BONUS: {
    MIN: 0.2,  // 20% min bonus
    MAX: 0.5,  // 50% max bonus
    PER_ADJACENT: 0.1, // 10% per adjacent block
  },
} as const;

/**
 * Get block type based on coordinates or metadata
 * In production, this would query backend for map data
 */
export function getBlockType(block: Block): BlockType {
  // If block already has type, return it
  if (block.blockType) {
    return block.blockType;
  }
  
  // Mock: Determine type based on coordinates (for testing)
  // In production, fetch from map API (Google Places, OpenStreetMap, etc.)
  const latInt = Math.floor(block.coordinates.latitude * 1000);
  const lonInt = Math.floor(block.coordinates.longitude * 1000);
  const combined = Math.abs(latInt + lonInt);
  
  const typeIndex = combined % 5;
  const types: BlockType[] = ['park', 'urban', 'landmark', 'residential', 'commercial'];
  return types[typeIndex];
}

/**
 * Get level multiplier for resource generation
 */
export function getLevelMultiplier(blockLevel: number): number {
  if (blockLevel >= 3) return RESOURCE_GENERATION.LEVEL_MULTIPLIERS[3];
  if (blockLevel >= 2) return RESOURCE_GENERATION.LEVEL_MULTIPLIERS[2];
  return RESOURCE_GENERATION.LEVEL_MULTIPLIERS[1];
}

/**
 * Check if two blocks are adjacent (within grid distance of 1)
 */
export function areBlocksAdjacent(block1: Block, block2: Block): boolean {
  const dx = Math.abs(block1.gridX - block2.gridX);
  const dy = Math.abs(block1.gridY - block2.gridY);
  
  // Adjacent if within 1 grid cell (including diagonals)
  return dx <= 1 && dy <= 1 && !(dx === 0 && dy === 0);
}

/**
 * Calculate cluster bonus for a block based on adjacent owned blocks
 */
export function calculateClusterBonus(
  block: Block,
  allOwnedBlocks: Block[]
): number {
  // Count adjacent blocks owned by same player
  const adjacentCount = allOwnedBlocks.filter(
    (other) => other.id !== block.id && areBlocksAdjacent(block, other)
  ).length;
  
  // Calculate bonus: 10% per adjacent block, capped at 50%
  const bonus = adjacentCount * RESOURCE_GENERATION.CLUSTER_BONUS.PER_ADJACENT;
  const maxBonus = RESOURCE_GENERATION.CLUSTER_BONUS.MAX;
  
  return Math.min(bonus, maxBonus);
}

/**
 * Calculate resources generated per hour for a single block
 */
export function calculateBlockResourcesPerHour(
  block: Block,
  allOwnedBlocks: Block[]
): number {
  const blockType = getBlockType(block);
  const baseRate = RESOURCE_GENERATION.BASE_RATES[blockType] || 1;
  const levelMultiplier = getLevelMultiplier(block.level);
  const clusterBonus = calculateClusterBonus(block, allOwnedBlocks);
  
  // Formula: Base × Level Multiplier × (1 + Cluster Bonus)
  const resourcesPerHour = baseRate * levelMultiplier * (1 + clusterBonus);
  
  return resourcesPerHour;
}

/**
 * Calculate total resources generated per hour from all owned blocks
 */
export function calculateResourcesPerHour(ownedBlocks: Block[]): number {
  if (ownedBlocks.length === 0) return 0;
  
  let totalPerHour = 0;
  
  for (const block of ownedBlocks) {
    totalPerHour += calculateBlockResourcesPerHour(block, ownedBlocks);
  }
  
  return totalPerHour;
}

/**
 * Calculate resources generated since last collection
 */
export function calculatePendingResources(
  ownedBlocks: Block[],
  lastCollectionTime: Date
): number {
  const now = new Date();
  const hoursElapsed = (now.getTime() - lastCollectionTime.getTime()) / (1000 * 60 * 60);
  
  const resourcesPerHour = calculateResourcesPerHour(ownedBlocks);
  const pendingResources = resourcesPerHour * hoursElapsed;
  
  return Math.floor(pendingResources);
}

/**
 * Get projected resources for next X hours
 */
export function getProjectedResources(
  ownedBlocks: Block[],
  hours: number = 1
): number {
  const resourcesPerHour = calculateResourcesPerHour(ownedBlocks);
  return Math.floor(resourcesPerHour * hours);
}

/**
 * Collect resources and return updated resources state
 * In production, this would call backend API
 */
export async function collectResources(
  userId: string,
  lastCollectionTime: Date,
  ownedBlocks: Block[],
  currentResources: Resources
): Promise<{
  success: boolean;
  collected: number;
  updatedResources: Resources;
  newCollectionTime: Date;
}> {
  try {
    // Calculate pending resources
    const collected = calculatePendingResources(ownedBlocks, lastCollectionTime);
    
    // Update resources
    const updatedResources: Resources = {
      ...currentResources,
      gold: currentResources.gold + collected,
    };
    
    // Mock API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    return {
      success: true,
      collected,
      updatedResources,
      newCollectionTime: new Date(),
    };
  } catch (error) {
    console.error('Error collecting resources:', error);
    return {
      success: false,
      collected: 0,
      updatedResources: currentResources,
      newCollectionTime: lastCollectionTime,
    };
  }
}

/**
 * Get detailed resource generation breakdown for UI
 */
export function getResourceGenerationBreakdown(ownedBlocks: Block[]): {
  totalPerHour: number;
  blockBreakdown: {
    blockId: string;
    blockType: BlockType;
    baseRate: number;
    levelMultiplier: number;
    clusterBonus: number;
    totalPerHour: number;
  }[];
} {
  const blockBreakdown = ownedBlocks.map((block) => {
    const blockType = getBlockType(block);
    const baseRate = RESOURCE_GENERATION.BASE_RATES[blockType] || 1;
    const levelMultiplier = getLevelMultiplier(block.level);
    const clusterBonus = calculateClusterBonus(block, ownedBlocks);
    const totalPerHour = calculateBlockResourcesPerHour(block, ownedBlocks);
    
    return {
      blockId: block.id,
      blockType,
      baseRate,
      levelMultiplier,
      clusterBonus,
      totalPerHour,
    };
  });
  
  const totalPerHour = calculateResourcesPerHour(ownedBlocks);
  
  return {
    totalPerHour,
    blockBreakdown,
  };
}

/**
 * Format resource amount for display
 */
export function formatResourceAmount(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toFixed(0);
}
