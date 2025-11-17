/**
 * LeaderboardSnippet Component
 * Displays top 3 players on the leaderboard
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface LeaderboardPlayer {
  userId: string;
  displayName: string;
  level: number;
  totalBlocksClaimed: number;
  rank: number;
  avatar?: string;
}

interface LeaderboardSnippetProps {
  topPlayers: LeaderboardPlayer[];
  currentUserId?: string;
  onViewFull?: () => void;
}

export default function LeaderboardSnippet({
  topPlayers,
  currentUserId,
  onViewFull,
}: LeaderboardSnippetProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#fbbf24';
      case 2:
        return '#94a3b8';
      case 3:
        return '#d97706';
      default:
        return '#6b7280';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Leaderboard</Text>
        {onViewFull && (
          <TouchableOpacity onPress={onViewFull} style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Top 3 Players */}
      {topPlayers.length > 0 ? (
        <View style={styles.playersList}>
          {topPlayers.slice(0, 3).map((player) => {
            const isCurrentUser = player.userId === currentUserId;
            return (
              <View
                key={player.userId}
                style={[
                  styles.playerRow,
                  isCurrentUser && styles.playerRowHighlight,
                ]}
              >
                {/* Rank */}
                <View
                  style={[
                    styles.rankBadge,
                    { backgroundColor: getRankColor(player.rank) },
                  ]}
                >
                  <Text style={styles.rankText}>{getRankIcon(player.rank)}</Text>
                </View>

                {/* Player Info */}
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName} numberOfLines={1}>
                    {player.displayName}
                    {isCurrentUser && (
                      <Text style={styles.youBadge}> (You)</Text>
                    )}
                  </Text>
                  <Text style={styles.playerLevel}>Level {player.level}</Text>
                </View>

                {/* Blocks Count */}
                <View style={styles.blocksContainer}>
                  <Text style={styles.blocksValue}>
                    {player.totalBlocksClaimed}
                  </Text>
                  <Text style={styles.blocksLabel}>blocks</Text>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🗺️</Text>
          <Text style={styles.emptyText}>No leaderboard data yet</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e1e2e',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#2d2d3d',
    borderRadius: 8,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3b82f6',
  },
  playersList: {
    gap: 8,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#2d2d3d',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  playerRowHighlight: {
    borderColor: '#3b82f6',
    backgroundColor: '#1e2a3d',
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  playerInfo: {
    flex: 1,
    gap: 2,
  },
  playerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  youBadge: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3b82f6',
  },
  playerLevel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  blocksContainer: {
    alignItems: 'flex-end',
  },
  blocksValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
  },
  blocksLabel: {
    fontSize: 11,
    color: '#94a3b8',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
  },
});
