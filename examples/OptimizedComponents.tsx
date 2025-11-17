/**
 * Optimized Components Examples
 * 
 * Demonstrates React.memo, useCallback, useMemo optimization patterns
 * for Realm Walker components.
 */

import React, { memo, useCallback, useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

// ============================================================================
// Example 1: Optimized Resource Panel
// ============================================================================

interface ResourcePanelProps {
  gold: number;
  mana: number;
  health: number;
  maxHealth: number;
  onCollect?: () => void;
}

// Before optimization: Re-renders on every parent update
export function ResourcePanelUnoptimized({
  gold,
  mana,
  health,
  maxHealth,
  onCollect,
}: ResourcePanelProps) {
  return (
    <View style={styles.resourcePanel}>
      <Text>💰 {gold}</Text>
      <Text>✨ {mana}</Text>
      <Text>❤️ {health}/{maxHealth}</Text>
      <Pressable onPress={onCollect}>
        <Text>Collect</Text>
      </Pressable>
    </View>
  );
}

// After optimization: Only re-renders when props change
export const ResourcePanelOptimized = memo<ResourcePanelProps>(
  function ResourcePanel({ gold, mana, health, maxHealth, onCollect }) {
    // Memoize expensive calculation
    const healthPercentage = useMemo(
      () => Math.round((health / maxHealth) * 100),
      [health, maxHealth]
    );

    // Memoize callback to prevent re-creating function
    const handleCollect = useCallback(() => {
      onCollect?.();
    }, [onCollect]);

    return (
      <View style={styles.resourcePanel}>
        <ResourceItem icon="💰" value={gold} label="Gold" />
        <ResourceItem icon="✨" value={mana} label="Mana" />
        <ResourceItem
          icon="❤️"
          value={health}
          label={`Health (${healthPercentage}%)`}
        />
        <Pressable style={styles.collectButton} onPress={handleCollect}>
          <Text style={styles.collectText}>Collect Resources</Text>
        </Pressable>
      </View>
    );
  },
  // Custom comparison: only re-render if these props change
  (prevProps, nextProps) =>
    prevProps.gold === nextProps.gold &&
    prevProps.mana === nextProps.mana &&
    prevProps.health === nextProps.health &&
    prevProps.maxHealth === nextProps.maxHealth
);

// Memoized sub-component
const ResourceItem = memo<{
  icon: string;
  value: number;
  label: string;
}>(
  function ResourceItem({ icon, value, label }) {
    return (
      <View style={styles.resourceItem}>
        <Text style={styles.resourceIcon}>{icon}</Text>
        <Text style={styles.resourceValue}>{value}</Text>
        <Text style={styles.resourceLabel}>{label}</Text>
      </View>
    );
  },
  (prev, next) => prev.value === next.value && prev.label === next.label
);

// ============================================================================
// Example 2: Optimized Player Profile Card
// ============================================================================

interface PlayerProfileProps {
  userId: string;
  name: string;
  level: number;
  xp: number;
  blocksOwned: number;
  guildName?: string;
  avatarUrl?: string;
  onPress?: (userId: string) => void;
}

export const PlayerProfileOptimized = memo<PlayerProfileProps>(
  function PlayerProfile({
    userId,
    name,
    level,
    xp,
    blocksOwned,
    guildName,
    avatarUrl,
    onPress,
  }) {
    // Memoize XP calculation for next level
    const xpProgress = useMemo(() => {
      const currentLevelXP = level * 100;
      const nextLevelXP = (level + 1) * 100;
      const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
      return Math.min(Math.max(progress, 0), 100);
    }, [level, xp]);

    // Memoize press handler
    const handlePress = useCallback(() => {
      onPress?.(userId);
    }, [userId, onPress]);

    return (
      <Pressable style={styles.profileCard} onPress={handlePress}>
        <ProfileAvatar url={avatarUrl} name={name} />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{name}</Text>
          <Text style={styles.profileLevel}>Level {level}</Text>
          {guildName && (
            <Text style={styles.profileGuild}>🛡️ {guildName}</Text>
          )}
          <View style={styles.statsRow}>
            <StatBadge icon="🗺️" value={blocksOwned} label="Blocks" />
            <StatBadge icon="⭐" value={xp} label="XP" />
          </View>
          <ProgressBar progress={xpProgress} />
        </View>
      </Pressable>
    );
  },
  // Deep comparison for nested props
  (prev, next) =>
    prev.userId === next.userId &&
    prev.name === next.name &&
    prev.level === next.level &&
    prev.xp === next.xp &&
    prev.blocksOwned === next.blocksOwned &&
    prev.guildName === next.guildName &&
    prev.avatarUrl === next.avatarUrl
);

// Memoized avatar component
const ProfileAvatar = memo<{ url?: string; name: string }>(
  function ProfileAvatar({ url, name }) {
    // Memoize initials
    const initials = useMemo(() => {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }, [name]);

    return (
      <View style={styles.avatar}>
        {url ? (
          <Image source={{ uri: url }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarInitials}>{initials}</Text>
        )}
      </View>
    );
  }
);

// Memoized stat badge
const StatBadge = memo<{ icon: string; value: number; label: string }>(
  function StatBadge({ icon, value, label }) {
    return (
      <View style={styles.statBadge}>
        <Text style={styles.statIcon}>{icon}</Text>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    );
  }
);

// Memoized progress bar
const ProgressBar = memo<{ progress: number }>(
  function ProgressBar({ progress }) {
    const progressStyle = useMemo(
      () => [
        styles.progressFill,
        { width: `${progress}%` as any }, // Type cast for percentage width
      ],
      [progress]
    );

    return (
      <View style={styles.progressBar}>
        <View style={progressStyle} />
      </View>
    );
  }
);

// ============================================================================
// Example 3: Optimized Achievement Card
// ============================================================================

interface AchievementCardProps {
  id: string;
  title: string;
  description: string;
  progress: number;
  total: number;
  unlocked: boolean;
  icon: string;
}

export const AchievementCardOptimized = memo<AchievementCardProps>(
  function AchievementCard({
    title,
    description,
    progress,
    total,
    unlocked,
    icon,
  }) {
    // Memoize percentage
    const percentage = useMemo(
      () => Math.round((progress / total) * 100),
      [progress, total]
    );

    // Memoize styles based on unlock state
    const cardStyle = useMemo(
      () => [
        styles.achievementCard,
        unlocked && styles.achievementUnlocked,
      ],
      [unlocked]
    );

    return (
      <View style={cardStyle}>
        <Text style={styles.achievementIcon}>{icon}</Text>
        <View style={styles.achievementContent}>
          <Text style={styles.achievementTitle}>{title}</Text>
          <Text style={styles.achievementDescription}>{description}</Text>
          {!unlocked && (
            <View style={styles.achievementProgress}>
              <Text style={styles.achievementProgressText}>
                {progress}/{total} ({percentage}%)
              </Text>
              <ProgressBar progress={percentage} />
            </View>
          )}
        </View>
        {unlocked && <Text style={styles.unlockedBadge}>✅</Text>}
      </View>
    );
  },
  // Only re-render if progress or unlock status changes
  (prev, next) =>
    prev.progress === next.progress &&
    prev.total === next.total &&
    prev.unlocked === next.unlocked
);

// ============================================================================
// Example 4: Optimized Block List Item (for FlatList)
// ============================================================================

interface BlockListItemProps {
  blockId: string;
  latitude: number;
  longitude: number;
  ownerId?: string;
  claimedAt?: number;
  onPress?: (blockId: string) => void;
}

export const BlockListItemOptimized = memo<BlockListItemProps>(
  function BlockListItem({
    blockId,
    latitude,
    longitude,
    ownerId,
    claimedAt,
    onPress,
  }) {
    // Memoize formatted coordinates
    const coordinates = useMemo(
      () => `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      [latitude, longitude]
    );

    // Memoize time since claimed
    const timeSinceClaimed = useMemo(() => {
      if (!claimedAt) return null;
      const hours = Math.floor((Date.now() - claimedAt) / (1000 * 60 * 60));
      return `${hours}h ago`;
    }, [claimedAt]);

    // Memoize press handler
    const handlePress = useCallback(() => {
      onPress?.(blockId);
    }, [blockId, onPress]);

    return (
      <Pressable style={styles.blockListItem} onPress={handlePress}>
        <View style={styles.blockInfo}>
          <Text style={styles.blockId}>{blockId}</Text>
          <Text style={styles.blockCoords}>{coordinates}</Text>
          {ownerId && (
            <Text style={styles.blockOwner}>Owner: {ownerId}</Text>
          )}
          {timeSinceClaimed && (
            <Text style={styles.blockTime}>Claimed {timeSinceClaimed}</Text>
          )}
        </View>
      </Pressable>
    );
  },
  // Critical for FlatList performance
  (prev, next) =>
    prev.blockId === next.blockId &&
    prev.ownerId === next.ownerId &&
    prev.claimedAt === next.claimedAt
);

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  resourcePanel: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    gap: 12,
  },
  resourceItem: {
    flex: 1,
    alignItems: 'center',
  },
  resourceIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  resourceValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  resourceLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  collectButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
  },
  collectText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  profileCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    gap: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarInitials: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '600',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  profileLevel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  profileGuild: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statIcon: {
    fontSize: 16,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
  achievementCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    gap: 12,
    opacity: 0.6,
  },
  achievementUnlocked: {
    backgroundColor: '#ffffff',
    opacity: 1,
    borderColor: '#10b981',
    borderWidth: 2,
  },
  achievementIcon: {
    fontSize: 32,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  achievementProgress: {
    marginTop: 8,
  },
  achievementProgressText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  unlockedBadge: {
    fontSize: 24,
  },
  blockListItem: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  blockInfo: {
    gap: 4,
  },
  blockId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  blockCoords: {
    fontSize: 14,
    color: '#6b7280',
  },
  blockOwner: {
    fontSize: 12,
    color: '#10b981',
  },
  blockTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
