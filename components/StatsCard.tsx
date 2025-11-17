/**
 * StatsCard Component
 * Displays player stats summary with level, XP, and progress
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StatsCardProps {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  gold: number;
  blocksOwnedToday: number;
  totalBlocksOwned: number;
}

export default function StatsCard({
  level,
  currentXP,
  nextLevelXP,
  gold,
  blocksOwnedToday,
  totalBlocksOwned,
}: StatsCardProps) {
  const xpProgress = (currentXP / nextLevelXP) * 100;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>LVL {level}</Text>
        </View>
        <View style={styles.goldContainer}>
          <Text style={styles.goldIcon}>💰</Text>
          <Text style={styles.goldValue}>{gold.toLocaleString()}</Text>
        </View>
      </View>

      {/* XP Progress */}
      <View style={styles.xpSection}>
        <View style={styles.xpHeader}>
          <Text style={styles.xpLabel}>Experience</Text>
          <Text style={styles.xpText}>
            {currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${xpProgress}%` }]} />
        </View>
        <Text style={styles.progressPercent}>{Math.floor(xpProgress)}% to Level {level + 1}</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{blocksOwnedToday}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{totalBlocksOwned}</Text>
          <Text style={styles.statLabel}>Total Blocks</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e1e2e',
    borderRadius: 16,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  levelText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  goldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2d2d3d',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  goldIcon: {
    fontSize: 20,
  },
  goldValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fbbf24',
  },
  xpSection: {
    gap: 8,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
  },
  xpText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#374151',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 6,
  },
  progressPercent: {
    fontSize: 12,
    color: '#10b981',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: '#2d2d3d',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#374151',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
});
