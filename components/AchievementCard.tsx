/**
 * AchievementCard Component
 * Displays recent achievements or daily quest progress
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
  reward?: string;
  isCompleted: boolean;
  type: 'daily' | 'achievement';
}

interface AchievementCardProps {
  achievement: Achievement;
  onPress?: () => void;
}

export default function AchievementCard({ achievement, onPress }: AchievementCardProps) {
  const progressPercent = (achievement.progress / achievement.maxProgress) * 100;
  const isDaily = achievement.type === 'daily';

  return (
    <TouchableOpacity
      style={[
        styles.container,
        achievement.isCompleted && styles.containerCompleted,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Icon & Badge */}
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{achievement.icon}</Text>
        {isDaily && (
          <View style={styles.dailyBadge}>
            <Text style={styles.dailyText}>DAILY</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{achievement.title}</Text>
          {achievement.isCompleted && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>✓</Text>
            </View>
          )}
        </View>
        <Text style={styles.description}>{achievement.description}</Text>

        {/* Progress Bar */}
        {!achievement.isCompleted && (
          <View style={styles.progressSection}>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {achievement.progress} / {achievement.maxProgress}
            </Text>
          </View>
        )}

        {/* Reward */}
        {achievement.reward && (
          <View style={styles.rewardContainer}>
            <Text style={styles.rewardLabel}>Reward:</Text>
            <Text style={styles.rewardValue}>{achievement.reward}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#1e1e2e',
    borderRadius: 12,
    padding: 12,
    gap: 12,
    borderWidth: 2,
    borderColor: '#2d2d3d',
  },
  containerCompleted: {
    borderColor: '#10b981',
    backgroundColor: '#1e2e26',
  },
  iconContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 48,
  },
  dailyBadge: {
    position: 'absolute',
    bottom: -4,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dailyText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
  },
  completedBadge: {
    backgroundColor: '#10b981',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  description: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
  },
  progressSection: {
    gap: 4,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'right',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  rewardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  rewardValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fbbf24',
  },
});
