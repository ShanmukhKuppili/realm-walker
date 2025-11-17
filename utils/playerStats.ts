/**
 * Player Stats Utility Functions
 * 
 * Handles:
 * - Total stat calculation (base + equipment bonuses)
 * - XP requirements per level
 * - Item stat bonus aggregation
 * - Level progression formulas
 */

import { CharacterStats, Equipment, Item, PlayerProfile } from '@/types';

/**
 * Calculate XP required to reach a specific level
 * Formula: XP_needed = 100 * (level)^1.5
 */
export function calculateXPForLevel(level: number): number {
    if (level <= 1) return 0;
    return Math.floor(100 * Math.pow(level, 1.5));
}

/**
 * Calculate XP required for the next level
 */
export function calculateXPForNextLevel(currentLevel: number): number {
    return calculateXPForLevel(currentLevel + 1);
}

/**
 * Calculate total XP needed to reach target level from level 1
 */
export function calculateTotalXPToLevel(targetLevel: number): number {
    let totalXP = 0;
    for (let level = 2; level <= targetLevel; level++) {
        totalXP += calculateXPForLevel(level);
    }
    return totalXP;
}

/**
 * Calculate progress percentage to next level
 */
export function calculateLevelProgress(currentXP: number, currentLevel: number): number {
    const xpForNextLevel = calculateXPForNextLevel(currentLevel);
    if (xpForNextLevel === 0) return 100;
    return Math.min(100, (currentXP / xpForNextLevel) * 100);
}

/**
 * Get stat bonuses from a single item
 */
export function getItemStatBonus(item: Item | undefined): Partial<CharacterStats> {
    if (!item || !item.statBonus) {
        return {};
    }
    return item.statBonus;
}

/**
 * Calculate total stats from base stats + equipment bonuses
 */
export function calculateTotalStats(
    baseStats: CharacterStats,
    equipment: Equipment,
    itemDatabase: Record<string, Item>
): CharacterStats {
    const totalStats: CharacterStats = { ...baseStats };

    // Get equipped items
    const weaponItem = equipment.weapon ? itemDatabase[equipment.weapon] : undefined;
    const armorItem = equipment.armor ? itemDatabase[equipment.armor] : undefined;
    const accessoryItem = equipment.accessory ? itemDatabase[equipment.accessory] : undefined;

    // Apply weapon bonuses
    const weaponBonus = getItemStatBonus(weaponItem);
    if (weaponBonus.strength) totalStats.strength += weaponBonus.strength;
    if (weaponBonus.intelligence) totalStats.intelligence += weaponBonus.intelligence;
    if (weaponBonus.dexterity) totalStats.dexterity += weaponBonus.dexterity;
    if (weaponBonus.constitution) totalStats.constitution += weaponBonus.constitution;
    if (weaponBonus.wisdom) totalStats.wisdom += weaponBonus.wisdom;

    // Apply armor bonuses
    const armorBonus = getItemStatBonus(armorItem);
    if (armorBonus.strength) totalStats.strength += armorBonus.strength;
    if (armorBonus.intelligence) totalStats.intelligence += armorBonus.intelligence;
    if (armorBonus.dexterity) totalStats.dexterity += armorBonus.dexterity;
    if (armorBonus.constitution) totalStats.constitution += armorBonus.constitution;
    if (armorBonus.wisdom) totalStats.wisdom += armorBonus.wisdom;

    // Apply accessory bonuses
    const accessoryBonus = getItemStatBonus(accessoryItem);
    if (accessoryBonus.strength) totalStats.strength += accessoryBonus.strength;
    if (accessoryBonus.intelligence) totalStats.intelligence += accessoryBonus.intelligence;
    if (accessoryBonus.dexterity) totalStats.dexterity += accessoryBonus.dexterity;
    if (accessoryBonus.constitution) totalStats.constitution += accessoryBonus.constitution;
    if (accessoryBonus.wisdom) totalStats.wisdom += accessoryBonus.wisdom;

    return totalStats;
}

/**
 * Get equipment bonuses summary
 */
export function getEquipmentBonuses(
    equipment: Equipment,
    itemDatabase: Record<string, Item>
): Partial<CharacterStats> {
    const bonuses: Partial<CharacterStats> = {
        strength: 0,
        intelligence: 0,
        dexterity: 0,
        constitution: 0,
        wisdom: 0,
    };

    const weaponItem = equipment.weapon ? itemDatabase[equipment.weapon] : undefined;
    const armorItem = equipment.armor ? itemDatabase[equipment.armor] : undefined;
    const accessoryItem = equipment.accessory ? itemDatabase[equipment.accessory] : undefined;

    // Sum all bonuses
    [weaponItem, armorItem, accessoryItem].forEach(item => {
        const itemBonus = getItemStatBonus(item);
        if (itemBonus.strength) bonuses.strength! += itemBonus.strength;
        if (itemBonus.intelligence) bonuses.intelligence! += itemBonus.intelligence;
        if (itemBonus.dexterity) bonuses.dexterity! += itemBonus.dexterity;
        if (itemBonus.constitution) bonuses.constitution! += itemBonus.constitution;
        if (itemBonus.wisdom) bonuses.wisdom! += itemBonus.wisdom;
    });

    return bonuses;
}

/**
 * Calculate max health based on constitution and level
 * Formula: 100 + (10 * level) + (constitution * 5)
 */
export function calculateMaxHealth(level: number, constitution: number): number {
    return 100 + (10 * level) + (constitution * 5);
}

/**
 * Calculate stat scaling value for combat/resource generation
 */
export function calculateStatValue(statAmount: number): number {
    // Simple linear scaling for now
    return statAmount;
}

/**
 * Get player power level (sum of all stats)
 */
export function calculatePowerLevel(stats: CharacterStats): number {
    return (
        stats.strength +
        stats.intelligence +
        stats.dexterity +
        stats.constitution +
        stats.wisdom
    );
}

/**
 * Get rarity color for UI display
 */
export function getRarityColor(rarity: Item['rarity']): string {
    const colors: Record<Item['rarity'], string> = {
        common: '#9CA3AF', // Gray
        uncommon: '#10B981', // Green
        rare: '#3B82F6', // Blue
        epic: '#8B5CF6', // Purple
        legendary: '#F59E0B', // Gold
    };
    return colors[rarity];
}

/**
 * Format stat display with + or - sign
 */
export function formatStatBonus(value: number): string {
    if (value > 0) return `+${value}`;
    if (value < 0) return `${value}`;
    return '0';
}

/**
 * Get player's current combat rating
 */
export function getCombatRating(profile: PlayerProfile, itemDatabase: Record<string, Item>): number {
    const totalStats = calculateTotalStats(profile.baseStats, profile.equipment, itemDatabase);
    const powerLevel = calculatePowerLevel(totalStats);
    const levelBonus = profile.level * 10;
    
    return powerLevel + levelBonus;
}

/**
 * Check if player meets item requirements
 */
export function canEquipItem(playerLevel: number, item: Item): boolean {
    return playerLevel >= item.level;
}

/**
 * Get level-up stat gains (called when player levels up)
 */
export function getLevelUpStatGains(newLevel: number): Partial<CharacterStats> {
    // Base gains per level
    const baseGains = {
        strength: 2,
        intelligence: 2,
        dexterity: 2,
        constitution: 2,
        wisdom: 2,
    };

    // Bonus gains at milestone levels (10, 20, 30, etc.)
    if (newLevel % 10 === 0) {
        return {
            strength: baseGains.strength + 5,
            intelligence: baseGains.intelligence + 5,
            dexterity: baseGains.dexterity + 5,
            constitution: baseGains.constitution + 5,
            wisdom: baseGains.wisdom + 5,
        };
    }

    return baseGains;
}
