/**
 * PlayerProfile Component
 * 
 * Displays:
 * - Character avatar and username
 * - Level and XP progress bar
 * - Health bar
 * - Stats (Strength, Intelligence, Dexterity, Constitution, Wisdom)
 * - Equipment slots (Weapon, Armor, Accessory)
 * - Gold and territory count
 */

import { MOCK_ITEMS } from '@/data/mockItems';
import { PlayerProfile as PlayerProfileType } from '@/types';
import {
    calculateLevelProgress,
    calculateTotalStats,
    calculateXPForNextLevel,
    getEquipmentBonuses,
    getRarityColor,
} from '@/utils/playerStats';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface PlayerProfileProps {
    profile: PlayerProfileType;
    showEquipment?: boolean;
    showInventory?: boolean;
}

export function PlayerProfile({ profile, showEquipment = true }: PlayerProfileProps) {
    const xpForNextLevel = calculateXPForNextLevel(profile.level);
    const levelProgress = calculateLevelProgress(profile.xp, profile.level);
    const totalStats = calculateTotalStats(profile.baseStats, profile.equipment, MOCK_ITEMS);
    const equipmentBonuses = getEquipmentBonuses(profile.equipment, MOCK_ITEMS);

    const healthPercent = (profile.health / profile.maxHealth) * 100;

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header - Avatar & Name */}
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatar}>{profile.avatar || '🧙'}</Text>
                    <View style={styles.levelBadge}>
                        <Text style={styles.levelText}>{profile.level}</Text>
                    </View>
                </View>
                <View style={styles.nameContainer}>
                    <Text style={styles.username}>{profile.username}</Text>
                    <Text style={styles.subtitle}>Level {profile.level} Wanderer</Text>
                </View>
            </View>

            {/* XP Progress Bar */}
            <View style={styles.section}>
                <View style={styles.labelRow}>
                    <Text style={styles.label}>Experience</Text>
                    <Text style={styles.xpText}>
                        {profile.xp} / {xpForNextLevel} XP
                    </Text>
                </View>
                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${levelProgress}%` }]} />
                </View>
            </View>

            {/* Health Bar */}
            <View style={styles.section}>
                <View style={styles.labelRow}>
                    <Text style={styles.label}>Health</Text>
                    <Text style={styles.healthText}>
                        {profile.health} / {profile.maxHealth} HP
                    </Text>
                </View>
                <View style={styles.healthBarContainer}>
                    <View style={[styles.healthBar, { width: `${healthPercent}%` }]} />
                </View>
            </View>

            {/* Resources */}
            <View style={styles.resourcesContainer}>
                <View style={styles.resourceItem}>
                    <Text style={styles.resourceIcon}>💰</Text>
                    <Text style={styles.resourceValue}>{profile.gold}</Text>
                    <Text style={styles.resourceLabel}>Gold</Text>
                </View>
                <View style={styles.resourceItem}>
                    <Text style={styles.resourceIcon}>🏰</Text>
                    <Text style={styles.resourceValue}>{profile.totalBlocksClaimed}</Text>
                    <Text style={styles.resourceLabel}>Blocks</Text>
                </View>
            </View>

            {/* Character Stats */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚔️ Character Stats</Text>
                <View style={styles.statsGrid}>
                    <StatRow
                        name="Strength"
                        icon="💪"
                        base={profile.baseStats.strength}
                        bonus={equipmentBonuses.strength || 0}
                        total={totalStats.strength}
                    />
                    <StatRow
                        name="Intelligence"
                        icon="🧠"
                        base={profile.baseStats.intelligence}
                        bonus={equipmentBonuses.intelligence || 0}
                        total={totalStats.intelligence}
                    />
                    <StatRow
                        name="Dexterity"
                        icon="🎯"
                        base={profile.baseStats.dexterity}
                        bonus={equipmentBonuses.dexterity || 0}
                        total={totalStats.dexterity}
                    />
                    <StatRow
                        name="Constitution"
                        icon="❤️"
                        base={profile.baseStats.constitution}
                        bonus={equipmentBonuses.constitution || 0}
                        total={totalStats.constitution}
                    />
                    <StatRow
                        name="Wisdom"
                        icon="📚"
                        base={profile.baseStats.wisdom}
                        bonus={equipmentBonuses.wisdom || 0}
                        total={totalStats.wisdom}
                    />
                </View>
            </View>

            {/* Equipment */}
            {showEquipment && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🎒 Equipment</Text>
                    <View style={styles.equipmentContainer}>
                        <EquipmentSlot
                            label="Weapon"
                            itemId={profile.equipment.weapon}
                            icon="⚔️"
                        />
                        <EquipmentSlot
                            label="Armor"
                            itemId={profile.equipment.armor}
                            icon="🛡️"
                        />
                        <EquipmentSlot
                            label="Accessory"
                            itemId={profile.equipment.accessory}
                            icon="💍"
                        />
                    </View>
                </View>
            )}
        </ScrollView>
    );
}

// Stat Row Component
function StatRow({
    name,
    icon,
    base,
    bonus,
    total,
}: {
    name: string;
    icon: string;
    base: number;
    bonus: number;
    total: number;
}) {
    return (
        <View style={styles.statRow}>
            <View style={styles.statLeft}>
                <Text style={styles.statIcon}>{icon}</Text>
                <Text style={styles.statName}>{name}</Text>
            </View>
            <View style={styles.statRight}>
                <Text style={styles.statTotal}>{total}</Text>
                {bonus > 0 && <Text style={styles.statBonus}>(+{bonus})</Text>}
            </View>
        </View>
    );
}

// Equipment Slot Component
function EquipmentSlot({
    label,
    itemId,
    icon,
}: {
    label: string;
    itemId?: string;
    icon: string;
}) {
    const item = itemId ? MOCK_ITEMS[itemId] : undefined;
    const rarityColor = item ? getRarityColor(item.rarity) : '#6B7280';

    return (
        <View style={styles.equipmentSlot}>
            <Text style={styles.equipmentLabel}>{label}</Text>
            <View style={[styles.equipmentBox, { borderColor: rarityColor }]}>
                <Text style={styles.equipmentIcon}>{item ? item.icon : icon}</Text>
            </View>
            {item && (
                <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, { color: rarityColor }]} numberOfLines={1}>
                        {item.name}
                    </Text>
                    <Text style={styles.itemLevel}>Lv. {item.level}</Text>
                </View>
            )}
            {!item && <Text style={styles.emptySlot}>Empty</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 16,
    },
    avatar: {
        fontSize: 64,
    },
    levelBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: '#3B82F6',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    levelText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    nameContainer: {
        flex: 1,
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },
    section: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        marginTop: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 12,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    xpText: {
        fontSize: 12,
        color: '#6B7280',
    },
    progressBarContainer: {
        height: 12,
        backgroundColor: '#E5E7EB',
        borderRadius: 6,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#3B82F6',
        borderRadius: 6,
    },
    healthText: {
        fontSize: 12,
        color: '#DC2626',
        fontWeight: '600',
    },
    healthBarContainer: {
        height: 12,
        backgroundColor: '#E5E7EB',
        borderRadius: 6,
        overflow: 'hidden',
    },
    healthBar: {
        height: '100%',
        backgroundColor: '#EF4444',
        borderRadius: 6,
    },
    resourcesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#FFFFFF',
        padding: 16,
        marginTop: 12,
    },
    resourceItem: {
        alignItems: 'center',
    },
    resourceIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    resourceValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    resourceLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
    statsGrid: {
        gap: 12,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    statLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    statName: {
        fontSize: 16,
        color: '#374151',
        fontWeight: '500',
    },
    statRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statTotal: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginRight: 8,
    },
    statBonus: {
        fontSize: 14,
        color: '#10B981',
        fontWeight: '600',
    },
    equipmentContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        gap: 12,
    },
    equipmentSlot: {
        flex: 1,
        alignItems: 'center',
    },
    equipmentLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 8,
    },
    equipmentBox: {
        width: 80,
        height: 80,
        borderRadius: 12,
        borderWidth: 3,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    equipmentIcon: {
        fontSize: 36,
    },
    itemInfo: {
        alignItems: 'center',
    },
    itemName: {
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    itemLevel: {
        fontSize: 10,
        color: '#9CA3AF',
        marginTop: 2,
    },
    emptySlot: {
        fontSize: 12,
        color: '#9CA3AF',
        fontStyle: 'italic',
    },
});
