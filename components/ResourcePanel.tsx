/**
 * ResourcePanel Component
 * Comprehensive resource display with collection, projections, and breakdown
 */

import CountUpNumber from '@/components/CountUpNumber';
import ResourceBlockBreakdown from '@/components/ResourceBlockBreakdown';
import ResourceIcon from '@/components/ResourceIcon';
import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface ResourcePanelProps {
  // Current resources
  gold: number;
  health: number;
  maxHealth: number;
  mana?: number;
  maxMana?: number;

  // Generation data
  goldPerHour: number;
  manaPerHour?: number;
  healthPerHour?: number;
  pendingGold: number;
  pendingMana?: number;
  pendingHealth?: number;

  // Collection
  onCollect: () => void;
  isCollecting: boolean;

  // Breakdown data (optional)
  ownedBlocks?: any[];
  showBreakdown?: boolean;

  // Styling
  compact?: boolean;
}

export default function ResourcePanel({
  gold,
  health,
  maxHealth,
  mana,
  maxMana,
  goldPerHour,
  manaPerHour = 0,
  healthPerHour = 0,
  pendingGold,
  pendingMana = 0,
  pendingHealth = 0,
  onCollect,
  isCollecting,
  ownedBlocks = [],
  showBreakdown = true,
  compact = false,
}: ResourcePanelProps) {
  const [showDetails, setShowDetails] = useState(false);

  const hasResourcesToCollect = pendingGold > 0 || pendingMana > 0 || pendingHealth > 0;
  const totalPendingValue = pendingGold + pendingMana + pendingHealth;

  // Calculate 24-hour projections
  const gold24h = Math.floor(goldPerHour * 24);
  const mana24h = Math.floor(manaPerHour * 24);
  const health24h = Math.floor(healthPerHour * 24);

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Resources</Text>
          <Text style={styles.headerSubtitle}>
            {ownedBlocks.length} {ownedBlocks.length === 1 ? 'block' : 'blocks'} generating
          </Text>
        </View>
        {showBreakdown && ownedBlocks.length > 0 && (
          <TouchableOpacity
            onPress={() => setShowDetails(!showDetails)}
            style={styles.toggleButton}
          >
            <Text style={styles.toggleButtonText}>
              {showDetails ? 'Hide' : 'Show'} Details
            </Text>
            <Text style={styles.toggleIcon}>{showDetails ? '▼' : '▶'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Current Resources */}
      <View style={styles.resourcesGrid}>
        {/* Gold */}
        <View style={styles.resourceCard}>
          <ResourceIcon type="gold" size={32} />
          <View style={styles.resourceInfo}>
            <Text style={styles.resourceLabel}>Gold</Text>
            <CountUpNumber
              value={gold}
              style={styles.resourceValue}
              duration={800}
            />
            {goldPerHour > 0 && (
              <Text style={styles.rateText}>+{goldPerHour.toFixed(1)}/hr</Text>
            )}
          </View>
        </View>

        {/* Health */}
        <View style={styles.resourceCard}>
          <ResourceIcon type="health" size={32} />
          <View style={styles.resourceInfo}>
            <Text style={styles.resourceLabel}>Health</Text>
            <Text style={styles.resourceValue}>
              {health} / {maxHealth}
            </Text>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  styles.healthBar,
                  { width: `${(health / maxHealth) * 100}%` },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Mana (if applicable) */}
        {mana !== undefined && maxMana && (
          <View style={styles.resourceCard}>
            <ResourceIcon type="mana" size={32} />
            <View style={styles.resourceInfo}>
              <Text style={styles.resourceLabel}>Mana</Text>
              <Text style={styles.resourceValue}>
                {mana} / {maxMana}
              </Text>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    styles.manaBar,
                    { width: `${(mana / maxMana) * 100}%` },
                  ]}
                />
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Pending Resources */}
      {hasResourcesToCollect && (
        <View style={styles.pendingSection}>
          <View style={styles.pendingHeader}>
            <Text style={styles.pendingTitle}>Ready to Collect</Text>
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>{totalPendingValue}</Text>
            </View>
          </View>

          <View style={styles.pendingGrid}>
            {pendingGold > 0 && (
              <View style={styles.pendingItem}>
                <ResourceIcon type="gold" size={20} />
                <Text style={styles.pendingValue}>+{pendingGold}</Text>
              </View>
            )}
            {pendingMana > 0 && (
              <View style={styles.pendingItem}>
                <ResourceIcon type="mana" size={20} />
                <Text style={styles.pendingValue}>+{pendingMana}</Text>
              </View>
            )}
            {pendingHealth > 0 && (
              <View style={styles.pendingItem}>
                <ResourceIcon type="health" size={20} />
                <Text style={styles.pendingValue}>+{pendingHealth}</Text>
              </View>
            )}
          </View>

          {/* Collect Button */}
          <TouchableOpacity
            style={[
              styles.collectButton,
              isCollecting && styles.collectButtonDisabled,
            ]}
            onPress={onCollect}
            disabled={isCollecting}
          >
            <Text style={styles.collectButtonIcon}>💰</Text>
            <Text style={styles.collectButtonText}>
              {isCollecting ? 'Collecting...' : 'Collect Now'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 24-Hour Projection */}
      {(goldPerHour > 0 || manaPerHour > 0 || healthPerHour > 0) && (
        <View style={styles.projectionSection}>
          <Text style={styles.projectionTitle}>📊 Next 24 Hours</Text>
          <View style={styles.projectionGrid}>
            {goldPerHour > 0 && (
              <View style={styles.projectionItem}>
                <ResourceIcon type="gold" size={18} />
                <Text style={styles.projectionValue}>+{gold24h}</Text>
              </View>
            )}
            {manaPerHour > 0 && (
              <View style={styles.projectionItem}>
                <ResourceIcon type="mana" size={18} />
                <Text style={styles.projectionValue}>+{mana24h}</Text>
              </View>
            )}
            {healthPerHour > 0 && (
              <View style={styles.projectionItem}>
                <ResourceIcon type="health" size={18} />
                <Text style={styles.projectionValue}>+{health24h}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Block Breakdown */}
      {showDetails && ownedBlocks.length > 0 && (
        <ResourceBlockBreakdown blocks={ownedBlocks} />
      )}

      {/* No Blocks Message */}
      {ownedBlocks.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🗺️</Text>
          <Text style={styles.emptyTitle}>No Territory Yet</Text>
          <Text style={styles.emptyText}>
            Claim blocks on the map to start generating resources!
          </Text>
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
    gap: 16,
  },
  containerCompact: {
    padding: 12,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#2d2d3d',
    borderRadius: 8,
  },
  toggleButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3b82f6',
  },
  toggleIcon: {
    fontSize: 10,
    color: '#3b82f6',
  },
  resourcesGrid: {
    gap: 12,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#2d2d3d',
    borderRadius: 12,
    padding: 12,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  resourceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  rateText: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 2,
  },
  barContainer: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    marginTop: 6,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 3,
  },
  healthBar: {
    backgroundColor: '#ef4444',
  },
  manaBar: {
    backgroundColor: '#3b82f6',
  },
  pendingSection: {
    backgroundColor: '#2d2d3d',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  pendingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pendingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fbbf24',
  },
  pendingBadge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e1e2e',
  },
  pendingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  pendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  pendingValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
  },
  collectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 10,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  collectButtonDisabled: {
    backgroundColor: '#6b7280',
    shadowColor: '#000',
  },
  collectButtonIcon: {
    fontSize: 20,
  },
  collectButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  projectionSection: {
    backgroundColor: '#2d2d3d',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  projectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 4,
  },
  projectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  projectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#374151',
    borderRadius: 8,
  },
  projectionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    maxWidth: 250,
  },
});
