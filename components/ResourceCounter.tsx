/**
 * ResourceCounter Component
 * Displays current resources with animated increments
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ResourceCounterProps {
  gold: number;
  health: number;
  maxHealth: number;
  mana?: number;
  maxMana?: number;
  pendingGold?: number;
  goldPerHour?: number;
  onCollect?: () => void;
  isCollecting?: boolean;
  compact?: boolean;
}

export default function ResourceCounter({
  gold,
  health,
  maxHealth,
  mana,
  maxMana,
  pendingGold = 0,
  goldPerHour = 0,
  onCollect,
  isCollecting = false,
  compact = false,
}: ResourceCounterProps) {
  const goldAnim = useRef(new Animated.Value(gold)).current;
  const pendingAnim = useRef(new Animated.Value(1)).current;
  const prevGold = useRef(gold);

  // Animate gold changes
  useEffect(() => {
    if (gold !== prevGold.current) {
      Animated.spring(goldAnim, {
        toValue: gold,
        tension: 50,
        friction: 7,
        useNativeDriver: false,
      }).start();
      prevGold.current = gold;
    }
  }, [gold, goldAnim]);

  // Pulse animation for pending resources
  useEffect(() => {
    if (pendingGold > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pendingAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pendingAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pendingAnim.setValue(1);
    }
  }, [pendingGold, pendingAnim]);

  const healthPercent = (health / maxHealth) * 100;
  const manaPercent = mana && maxMana ? (mana / maxMana) * 100 : 0;

  const containerStyle = compact ? styles.compactContainer : styles.container;
  const resourceStyle = compact ? styles.compactResource : styles.resource;
  const labelStyle = compact ? styles.compactLabel : styles.label;
  const valueStyle = compact ? styles.compactValue : styles.value;

  return (
    <View style={containerStyle}>
      {/* Gold */}
      <View style={resourceStyle}>
        <Text style={styles.icon}>💰</Text>
        <View style={styles.resourceInfo}>
          <Text style={labelStyle}>Gold</Text>
          <Animated.Text style={valueStyle}>
            {goldAnim.interpolate({
              inputRange: [0, gold],
              outputRange: ['0', gold.toString()],
            })}
          </Animated.Text>
          {goldPerHour > 0 && !compact && (
            <Text style={styles.rateText}>+{goldPerHour.toFixed(1)}/hr</Text>
          )}
        </View>
      </View>

      {/* Pending Gold with Collect Button */}
      {pendingGold > 0 && onCollect && (
        <Animated.View
          style={[
            styles.pendingContainer,
            { transform: [{ scale: pendingAnim }] },
          ]}
        >
          <TouchableOpacity
            onPress={onCollect}
            disabled={isCollecting}
            style={[
              styles.collectButton,
              isCollecting && styles.collectButtonDisabled,
            ]}
          >
            <Text style={styles.pendingText}>
              ⏱️ +{pendingGold} Gold
            </Text>
            <Text style={styles.collectButtonText}>
              {isCollecting ? 'Collecting...' : 'Collect'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Health */}
      <View style={resourceStyle}>
        <Text style={styles.icon}>❤️</Text>
        <View style={styles.resourceInfo}>
          <Text style={labelStyle}>Health</Text>
          <Text style={valueStyle}>
            {health} / {maxHealth}
          </Text>
          {!compact && (
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  styles.healthBar,
                  { width: `${healthPercent}%` },
                ]}
              />
            </View>
          )}
        </View>
      </View>

      {/* Mana (if provided) */}
      {mana !== undefined && maxMana && (
        <View style={resourceStyle}>
          <Text style={styles.icon}>✨</Text>
          <View style={styles.resourceInfo}>
            <Text style={labelStyle}>Mana</Text>
            <Text style={valueStyle}>
              {mana} / {maxMana}
            </Text>
            {!compact && (
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    styles.manaBar,
                    { width: `${manaPercent}%` },
                  ]}
                />
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#1e1e2e',
    borderRadius: 12,
    gap: 12,
  },
  compactContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#1e1e2e',
    borderRadius: 8,
    gap: 12,
    alignItems: 'center',
  },
  resource: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  compactResource: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  icon: {
    fontSize: 24,
  },
  resourceInfo: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 2,
  },
  compactLabel: {
    fontSize: 10,
    color: '#94a3b8',
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  compactValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  rateText: {
    fontSize: 11,
    color: '#10b981',
    marginTop: 2,
  },
  barContainer: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    marginTop: 4,
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
  pendingContainer: {
    marginVertical: 8,
  },
  collectButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  pendingText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  collectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
});
