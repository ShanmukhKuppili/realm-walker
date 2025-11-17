/**
 * Mock Item Database
 * 
 * Test data for weapons, armor, accessories with stat bonuses
 * Used for development and testing
 */

import { Item } from '@/types';

export const MOCK_ITEMS: Record<string, Item> = {
    // ===== WEAPONS =====
    'wooden-sword': {
        id: 'wooden-sword',
        name: 'Wooden Sword',
        description: 'A simple training sword made of oak.',
        type: 'weapon',
        rarity: 'common',
        icon: '🗡️',
        statBonus: {
            strength: 5,
            dexterity: 2,
        },
        price: 50,
        level: 1,
    },
    'iron-sword': {
        id: 'iron-sword',
        name: 'Iron Sword',
        description: 'A sturdy sword forged from iron.',
        type: 'weapon',
        rarity: 'uncommon',
        icon: '⚔️',
        statBonus: {
            strength: 12,
            dexterity: 5,
        },
        price: 250,
        level: 5,
    },
    'steel-sword': {
        id: 'steel-sword',
        name: 'Steel Sword',
        description: 'A well-crafted steel blade with excellent balance.',
        type: 'weapon',
        rarity: 'rare',
        icon: '⚔️',
        statBonus: {
            strength: 20,
            dexterity: 10,
        },
        price: 800,
        level: 15,
    },
    'enchanted-blade': {
        id: 'enchanted-blade',
        name: 'Enchanted Blade',
        description: 'A magical sword infused with arcane power.',
        type: 'weapon',
        rarity: 'epic',
        icon: '🗡️',
        statBonus: {
            strength: 30,
            intelligence: 15,
            dexterity: 12,
        },
        price: 2500,
        level: 25,
    },
    'dragon-slayer': {
        id: 'dragon-slayer',
        name: 'Dragon Slayer',
        description: 'A legendary greatsword said to have slain ancient dragons.',
        type: 'weapon',
        rarity: 'legendary',
        icon: '⚔️',
        statBonus: {
            strength: 50,
            constitution: 20,
            dexterity: 15,
        },
        price: 10000,
        level: 40,
    },
    'wizards-staff': {
        id: 'wizards-staff',
        name: "Wizard's Staff",
        description: 'A staff crackling with magical energy.',
        type: 'weapon',
        rarity: 'rare',
        icon: '🪄',
        statBonus: {
            intelligence: 25,
            wisdom: 15,
        },
        price: 900,
        level: 12,
    },

    // ===== ARMOR =====
    'leather-armor': {
        id: 'leather-armor',
        name: 'Leather Armor',
        description: 'Basic leather protection for travelers.',
        type: 'armor',
        rarity: 'common',
        icon: '🦺',
        statBonus: {
            constitution: 5,
            dexterity: 3,
        },
        price: 60,
        level: 1,
    },
    'chainmail': {
        id: 'chainmail',
        name: 'Chainmail',
        description: 'Interlocking metal rings provide solid protection.',
        type: 'armor',
        rarity: 'uncommon',
        icon: '🦺',
        statBonus: {
            constitution: 15,
            strength: 5,
        },
        price: 300,
        level: 8,
    },
    'plate-armor': {
        id: 'plate-armor',
        name: 'Plate Armor',
        description: 'Heavy steel plates offer maximum protection.',
        type: 'armor',
        rarity: 'rare',
        icon: '🛡️',
        statBonus: {
            constitution: 25,
            strength: 10,
        },
        price: 1000,
        level: 18,
    },
    'enchanted-robes': {
        id: 'enchanted-robes',
        name: 'Enchanted Robes',
        description: 'Magical robes woven with protective spells.',
        type: 'armor',
        rarity: 'epic',
        icon: '👘',
        statBonus: {
            intelligence: 20,
            wisdom: 15,
            constitution: 10,
        },
        price: 2000,
        level: 22,
    },
    'dragon-scale-armor': {
        id: 'dragon-scale-armor',
        name: 'Dragon Scale Armor',
        description: 'Impenetrable armor crafted from dragon scales.',
        type: 'armor',
        rarity: 'legendary',
        icon: '🛡️',
        statBonus: {
            constitution: 45,
            strength: 20,
            dexterity: 10,
        },
        price: 12000,
        level: 45,
    },

    // ===== ACCESSORIES =====
    'silver-ring': {
        id: 'silver-ring',
        name: 'Silver Ring',
        description: 'A simple silver band.',
        type: 'accessory',
        rarity: 'common',
        icon: '💍',
        statBonus: {
            wisdom: 3,
        },
        price: 40,
        level: 1,
    },
    'amulet-of-strength': {
        id: 'amulet-of-strength',
        name: 'Amulet of Strength',
        description: 'An amulet that enhances physical power.',
        type: 'accessory',
        rarity: 'uncommon',
        icon: '📿',
        statBonus: {
            strength: 10,
            constitution: 5,
        },
        price: 200,
        level: 6,
    },
    'ring-of-intelligence': {
        id: 'ring-of-intelligence',
        name: 'Ring of Intelligence',
        description: 'Sharpens the mind and magical prowess.',
        type: 'accessory',
        rarity: 'rare',
        icon: '💍',
        statBonus: {
            intelligence: 15,
            wisdom: 10,
        },
        price: 750,
        level: 14,
    },
    'cloak-of-shadows': {
        id: 'cloak-of-shadows',
        name: 'Cloak of Shadows',
        description: 'A dark cloak that enhances stealth.',
        type: 'accessory',
        rarity: 'epic',
        icon: '🧥',
        statBonus: {
            dexterity: 20,
            intelligence: 10,
            wisdom: 10,
        },
        price: 2200,
        level: 28,
    },
    'crown-of-kings': {
        id: 'crown-of-kings',
        name: 'Crown of Kings',
        description: 'A legendary crown that grants wisdom and authority.',
        type: 'accessory',
        rarity: 'legendary',
        icon: '👑',
        statBonus: {
            wisdom: 40,
            intelligence: 30,
            strength: 15,
            constitution: 15,
            dexterity: 15,
        },
        price: 15000,
        level: 50,
    },
    'pendant-of-vitality': {
        id: 'pendant-of-vitality',
        name: 'Pendant of Vitality',
        description: 'Increases health and stamina.',
        type: 'accessory',
        rarity: 'rare',
        icon: '📿',
        statBonus: {
            constitution: 18,
            wisdom: 8,
        },
        price: 850,
        level: 16,
    },

    // ===== CONSUMABLES =====
    'health-potion': {
        id: 'health-potion',
        name: 'Health Potion',
        description: 'Restores 50 health points.',
        type: 'consumable',
        rarity: 'common',
        icon: '🧪',
        price: 25,
        level: 1,
    },
    'mana-potion': {
        id: 'mana-potion',
        name: 'Mana Potion',
        description: 'Restores magical energy.',
        type: 'consumable',
        rarity: 'common',
        icon: '🧪',
        price: 30,
        level: 1,
    },
    'elixir-of-strength': {
        id: 'elixir-of-strength',
        name: 'Elixir of Strength',
        description: 'Temporarily increases strength by 20 for 1 hour.',
        type: 'consumable',
        rarity: 'uncommon',
        icon: '🧪',
        price: 100,
        level: 5,
    },

    // ===== MATERIALS =====
    'iron-ore': {
        id: 'iron-ore',
        name: 'Iron Ore',
        description: 'Raw iron ready for smelting.',
        type: 'material',
        rarity: 'common',
        icon: '⛏️',
        price: 10,
        level: 1,
    },
    'dragon-scale': {
        id: 'dragon-scale',
        name: 'Dragon Scale',
        description: 'A rare scale from a mighty dragon.',
        type: 'material',
        rarity: 'legendary',
        icon: '🐉',
        price: 500,
        level: 30,
    },
};

// Helper to get all items by type
export function getItemsByType(type: Item['type']): Item[] {
    return Object.values(MOCK_ITEMS).filter(item => item.type === type);
}

// Helper to get all items by rarity
export function getItemsByRarity(rarity: Item['rarity']): Item[] {
    return Object.values(MOCK_ITEMS).filter(item => item.rarity === rarity);
}

// Helper to get items player can equip at their level
export function getEquippableItems(playerLevel: number): Item[] {
    return Object.values(MOCK_ITEMS).filter(item => item.level <= playerLevel);
}

// Get starter equipment for new players
export function getStarterEquipment(): { weapon: string; armor: string; accessory: string } {
    return {
        weapon: 'wooden-sword',
        armor: 'leather-armor',
        accessory: 'silver-ring',
    };
}

// Get starter inventory
export function getStarterInventory() {
    return [
        { itemId: 'health-potion', quantity: 3 },
        { itemId: 'iron-ore', quantity: 5 },
    ];
}
