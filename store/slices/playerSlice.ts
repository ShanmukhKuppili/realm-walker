/**
 * Player Slice - Character Profile & Stats Redux State
 * 
 * Manages:
 * - Character stats (Strength, Intelligence, Dexterity, Constitution, Wisdom)
 * - Level and XP progression
 * - Equipment (weapon, armor, accessory)
 * - Inventory management
 * - Gold and Health
 */

import { CharacterStats, Equipment, PlayerProfile } from '@/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// XP formula: XP_needed = 100 * (level)^1.5
export function calculateXPForLevel(level: number): number {
    return Math.floor(100 * Math.pow(level, 1.5));
}

export function calculateXPForNextLevel(currentLevel: number): number {
    return calculateXPForLevel(currentLevel + 1);
}

interface PlayerState {
    profile: PlayerProfile | null;
    loading: boolean;
    error: string | null;
}

const initialStats: CharacterStats = {
    strength: 10,
    intelligence: 10,
    dexterity: 10,
    constitution: 10,
    wisdom: 10,
};

const initialState: PlayerState = {
    profile: null,
    loading: false,
    error: null,
};

const playerSlice = createSlice({
    name: 'player',
    initialState,
    reducers: {
        // Initialize player profile
        initializePlayer: (state, action: PayloadAction<Partial<PlayerProfile>>) => {
            const now = new Date().toISOString();
            state.profile = {
                userId: action.payload.userId || '',
                username: action.payload.username || 'Wanderer',
                avatar: action.payload.avatar,
                level: action.payload.level || 1,
                xp: action.payload.xp || 0,
                gold: action.payload.gold || 100,
                health: action.payload.health || 100,
                maxHealth: action.payload.maxHealth || 100,
                baseStats: action.payload.baseStats || { ...initialStats },
                equipment: action.payload.equipment || {},
                inventory: action.payload.inventory || [],
                totalBlocksClaimed: action.payload.totalBlocksClaimed || 0,
                joinedAt: action.payload.joinedAt || now,
            };
        },

        // Update XP and handle level ups
        addXP: (state, action: PayloadAction<number>) => {
            if (!state.profile) return;

            state.profile.xp += action.payload;

            // Check for level up
            let xpNeeded = calculateXPForNextLevel(state.profile.level);
            
            while (state.profile.xp >= xpNeeded) {
                state.profile.level += 1;
                state.profile.xp -= xpNeeded;

                // Increase base stats on level up
                state.profile.baseStats.strength += 2;
                state.profile.baseStats.intelligence += 2;
                state.profile.baseStats.dexterity += 2;
                state.profile.baseStats.constitution += 2;
                state.profile.baseStats.wisdom += 2;

                // Increase max health
                state.profile.maxHealth += 10;
                state.profile.health = state.profile.maxHealth; // Full heal on level up

                // Recalculate XP needed for next level
                xpNeeded = calculateXPForNextLevel(state.profile.level);

                console.log(`🎉 Level Up! Now level ${state.profile.level}`);
            }
        },

        // Set XP directly (for loading saved data)
        setXP: (state, action: PayloadAction<number>) => {
            if (!state.profile) return;
            state.profile.xp = action.payload;
        },

        // Update Gold
        addGold: (state, action: PayloadAction<number>) => {
            if (!state.profile) return;
            state.profile.gold += action.payload;
        },

        removeGold: (state, action: PayloadAction<number>) => {
            if (!state.profile) return;
            state.profile.gold = Math.max(0, state.profile.gold - action.payload);
        },

        setGold: (state, action: PayloadAction<number>) => {
            if (!state.profile) return;
            state.profile.gold = Math.max(0, action.payload);
        },

        // Update Health
        addHealth: (state, action: PayloadAction<number>) => {
            if (!state.profile) return;
            state.profile.health = Math.min(
                state.profile.maxHealth,
                state.profile.health + action.payload
            );
        },

        removeHealth: (state, action: PayloadAction<number>) => {
            if (!state.profile) return;
            state.profile.health = Math.max(0, state.profile.health - action.payload);
        },

        setHealth: (state, action: PayloadAction<number>) => {
            if (!state.profile) return;
            state.profile.health = Math.min(state.profile.maxHealth, Math.max(0, action.payload));
        },

        healToFull: (state) => {
            if (!state.profile) return;
            state.profile.health = state.profile.maxHealth;
        },

        // Equip an item
        equipItem: (state, action: PayloadAction<{ slot: keyof Equipment; itemId: string }>) => {
            if (!state.profile) return;

            const { slot, itemId } = action.payload;

            // Unequip current item (add back to inventory if needed)
            const currentItemId = state.profile.equipment[slot];
            if (currentItemId) {
                // Item is being swapped, keep it in inventory
            }

            // Equip new item
            state.profile.equipment[slot] = itemId;

            console.log(`⚔️ Equipped ${itemId} in ${slot} slot`);
        },

        // Unequip an item
        unequipItem: (state, action: PayloadAction<keyof Equipment>) => {
            if (!state.profile) return;

            const slot = action.payload;
            const itemId = state.profile.equipment[slot];

            if (itemId) {
                delete state.profile.equipment[slot];
                console.log(`🎒 Unequipped ${itemId} from ${slot} slot`);
            }
        },

        // Add item to inventory
        addItemToInventory: (state, action: PayloadAction<{ itemId: string; quantity: number }>) => {
            if (!state.profile) return;

            const { itemId, quantity } = action.payload;

            // Check if item already exists in inventory
            const existingItem = state.profile.inventory.find(item => item.itemId === itemId);

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                state.profile.inventory.push({
                    itemId,
                    quantity,
                    acquiredAt: new Date().toISOString(),
                });
            }

            console.log(`📦 Added ${quantity}x ${itemId} to inventory`);
        },

        // Remove item from inventory
        removeItemFromInventory: (state, action: PayloadAction<{ itemId: string; quantity: number }>) => {
            if (!state.profile) return;

            const { itemId, quantity } = action.payload;

            const existingItem = state.profile.inventory.find(item => item.itemId === itemId);

            if (existingItem) {
                existingItem.quantity -= quantity;

                // Remove item completely if quantity reaches 0
                if (existingItem.quantity <= 0) {
                    state.profile.inventory = state.profile.inventory.filter(
                        item => item.itemId !== itemId
                    );
                }

                console.log(`🗑️ Removed ${quantity}x ${itemId} from inventory`);
            }
        },

        // Update base stats
        updateBaseStats: (state, action: PayloadAction<Partial<CharacterStats>>) => {
            if (!state.profile) return;
            state.profile.baseStats = {
                ...state.profile.baseStats,
                ...action.payload,
            };
        },

        // Increment stat by points
        incrementStat: (state, action: PayloadAction<{ stat: keyof CharacterStats; points: number }>) => {
            if (!state.profile) return;
            const { stat, points } = action.payload;
            state.profile.baseStats[stat] += points;
        },

        // Update username/avatar
        updateProfile: (state, action: PayloadAction<{ username?: string; avatar?: string }>) => {
            if (!state.profile) return;
            if (action.payload.username) {
                state.profile.username = action.payload.username;
            }
            if (action.payload.avatar !== undefined) {
                state.profile.avatar = action.payload.avatar;
            }
        },

        // Increment blocks claimed
        incrementBlocksClaimed: (state, action: PayloadAction<number>) => {
            if (!state.profile) return;
            state.profile.totalBlocksClaimed += action.payload;
        },

        // Loading states
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },

        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },

        // Reset player state
        resetPlayer: (state) => {
            state.profile = null;
            state.loading = false;
            state.error = null;
        },
    },
});

export const {
    initializePlayer,
    addXP,
    setXP,
    addGold,
    removeGold,
    setGold,
    addHealth,
    removeHealth,
    setHealth,
    healToFull,
    equipItem,
    unequipItem,
    addItemToInventory,
    removeItemFromInventory,
    updateBaseStats,
    incrementStat,
    updateProfile,
    incrementBlocksClaimed,
    setLoading,
    setError,
    resetPlayer,
} = playerSlice.actions;

export default playerSlice.reducer;
