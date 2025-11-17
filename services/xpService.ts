/**
 * XP Service
 * 
 * Handles experience point calculations and leveling logic for Realm Walker.
 * 
 * XP Sources:
 * - Walking: 1 XP per 50 meters
 * - Claiming blocks: 50 XP per block
 * - Combat victories: 100 XP (placeholder for future)
 * 
 * Level Formula: nextLevelXP = 100 * (currentLevel)^1.5
 */

import { store } from '@/store';
import { addXP as addXPAction, calculateXPForNextLevel } from '@/store/slices/playerSlice';

// XP reward constants
export const XP_SOURCES = {
    WALKING_PER_50M: 1,
    BLOCK_CLAIM: 50,
    BLOCK_REFRESH: 0, // No XP for refreshing owned blocks
    COMBAT_VICTORY: 100,
    QUEST_COMPLETION: 200,
    ACHIEVEMENT: 150,
    DAILY_LOGIN: 25,
} as const;

// Track XP statistics
export interface XPStats {
    totalXPEarned: number;
    xpFromWalking: number;
    xpFromBlocks: number;
    xpFromCombat: number;
    xpFromQuests: number;
    currentLevel: number;
    currentXP: number;
    xpToNextLevel: number;
}

// Level-up rewards
export interface LevelUpRewards {
    level: number;
    statIncrease: {
        strength: number;
        intelligence: number;
        dexterity: number;
        constitution: number;
        wisdom: number;
    };
    healthIncrease: number;
    goldBonus: number;
    specialReward?: string;
}

/**
 * Calculate XP required to reach a specific level
 * Formula: XP_needed = 100 * (level)^1.5
 */
export function calculateXPForLevel(level: number): number {
    if (level <= 1) return 0;
    return Math.floor(100 * Math.pow(level, 1.5));
}

/**
 * Calculate total XP earned from level 1 to target level
 */
export function calculateTotalXPToLevel(targetLevel: number): number {
    let totalXP = 0;
    for (let level = 2; level <= targetLevel; level++) {
        totalXP += calculateXPForLevel(level);
    }
    return totalXP;
}

/**
 * Get level from total XP earned
 */
export function getLevelFromTotalXP(totalXP: number): { level: number; remainingXP: number } {
    let level = 1;
    let xpRemaining = totalXP;

    while (xpRemaining >= calculateXPForLevel(level + 1)) {
        xpRemaining -= calculateXPForLevel(level + 1);
        level++;
    }

    return { level, remainingXP: xpRemaining };
}

/**
 * Calculate progress percentage to next level
 */
export function calculateLevelProgress(currentXP: number, currentLevel: number): number {
    const xpForNextLevel = calculateXPForLevel(currentLevel + 1);
    if (xpForNextLevel === 0) return 100;
    return Math.min(100, (currentXP / xpForNextLevel) * 100);
}

/**
 * Check if player will level up with XP amount
 */
export function checkLevelUp(currentXP: number, currentLevel: number, xpToAdd: number): {
    willLevelUp: boolean;
    newLevel: number;
    levelsGained: number;
} {
    let xp = currentXP + xpToAdd;
    let level = currentLevel;
    let levelsGained = 0;

    while (xp >= calculateXPForLevel(level + 1)) {
        xp -= calculateXPForLevel(level + 1);
        level++;
        levelsGained++;
    }

    return {
        willLevelUp: levelsGained > 0,
        newLevel: level,
        levelsGained,
    };
}

/**
 * Get rewards for leveling up
 */
export function getLevelUpRewards(newLevel: number): LevelUpRewards {
    const baseStatIncrease = 2;
    const bonusStatIncrease = newLevel % 10 === 0 ? 5 : 0; // Milestone bonus

    const rewards: LevelUpRewards = {
        level: newLevel,
        statIncrease: {
            strength: baseStatIncrease + bonusStatIncrease,
            intelligence: baseStatIncrease + bonusStatIncrease,
            dexterity: baseStatIncrease + bonusStatIncrease,
            constitution: baseStatIncrease + bonusStatIncrease,
            wisdom: baseStatIncrease + bonusStatIncrease,
        },
        healthIncrease: 10,
        goldBonus: newLevel * 10,
    };

    // Special milestone rewards
    if (newLevel === 10) {
        rewards.specialReward = '🎁 Uncommon Item Chest';
    } else if (newLevel === 25) {
        rewards.specialReward = '🎁 Rare Item Chest';
    } else if (newLevel === 50) {
        rewards.specialReward = '🎁 Epic Item Chest';
    } else if (newLevel === 100) {
        rewards.specialReward = '🎁 Legendary Item Chest';
    }

    return rewards;
}

/**
 * Award XP from walking distance
 * @param distanceMeters - Distance walked in meters
 */
export function addXPFromWalking(distanceMeters: number): number {
    const xpEarned = Math.floor(distanceMeters / 50) * XP_SOURCES.WALKING_PER_50M;
    
    if (xpEarned > 0) {
        store.dispatch(addXPAction(xpEarned));
        console.log(`🚶 Walked ${distanceMeters}m → +${xpEarned} XP`);
    }
    
    return xpEarned;
}

/**
 * Award XP from claiming a block
 */
export function addXPFromBlockClaim(): number {
    const xpEarned = XP_SOURCES.BLOCK_CLAIM;
    store.dispatch(addXPAction(xpEarned));
    console.log(`🏰 Block claimed → +${xpEarned} XP`);
    return xpEarned;
}

/**
 * Award XP from combat victory
 */
export function addXPFromCombat(): number {
    const xpEarned = XP_SOURCES.COMBAT_VICTORY;
    store.dispatch(addXPAction(xpEarned));
    console.log(`⚔️ Combat victory → +${xpEarned} XP`);
    return xpEarned;
}

/**
 * Award XP from quest completion
 */
export function addXPFromQuest(): number {
    const xpEarned = XP_SOURCES.QUEST_COMPLETION;
    store.dispatch(addXPAction(xpEarned));
    console.log(`📜 Quest completed → +${xpEarned} XP`);
    return xpEarned;
}

/**
 * Award XP from achievement unlock
 */
export function addXPFromAchievement(): number {
    const xpEarned = XP_SOURCES.ACHIEVEMENT;
    store.dispatch(addXPAction(xpEarned));
    console.log(`🏆 Achievement unlocked → +${xpEarned} XP`);
    return xpEarned;
}

/**
 * Award XP from daily login
 */
export function addXPFromDailyLogin(): number {
    const xpEarned = XP_SOURCES.DAILY_LOGIN;
    store.dispatch(addXPAction(xpEarned));
    console.log(`📅 Daily login → +${xpEarned} XP`);
    return xpEarned;
}

/**
 * Award XP with custom amount and source
 */
export function addXP(amount: number, source: string = 'custom'): number {
    if (amount <= 0) return 0;
    
    store.dispatch(addXPAction(amount));
    console.log(`✨ ${source} → +${amount} XP`);
    return amount;
}

/**
 * Get current XP stats from Redux state
 */
export function getCurrentXPStats(): XPStats {
    const state = store.getState();
    const profile = (state as any).player?.profile;

    if (!profile) {
        return {
            totalXPEarned: 0,
            xpFromWalking: 0,
            xpFromBlocks: 0,
            xpFromCombat: 0,
            xpFromQuests: 0,
            currentLevel: 1,
            currentXP: 0,
            xpToNextLevel: 100,
        };
    }

    const xpToNextLevel = calculateXPForNextLevel(profile.level);

    return {
        totalXPEarned: calculateTotalXPToLevel(profile.level) + profile.xp,
        xpFromWalking: 0, // TODO: Track separately
        xpFromBlocks: 0, // TODO: Track separately
        xpFromCombat: 0, // TODO: Track separately
        xpFromQuests: 0, // TODO: Track separately
        currentLevel: profile.level,
        currentXP: profile.xp,
        xpToNextLevel,
    };
}

/**
 * Get XP table for reference (levels 1-10)
 */
export function getXPTable(maxLevel: number = 10): { level: number; xpNeeded: number; totalXP: number }[] {
    const table: { level: number; xpNeeded: number; totalXP: number }[] = [];
    let totalXP = 0;

    for (let level = 1; level <= maxLevel; level++) {
        const xpNeeded = calculateXPForLevel(level);
        table.push({
            level,
            xpNeeded,
            totalXP,
        });
        totalXP += xpNeeded;
    }

    return table;
}

/**
 * Format XP number with commas
 */
export function formatXP(xp: number): string {
    return xp.toLocaleString();
}
