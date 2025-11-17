/**
 * ResourceCollectionNotification Component
 * Shows animated notification when resources are collected
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Modal, StyleSheet, Text, View } from 'react-native';

interface ResourceCollectionNotificationProps {
  visible: boolean;
  amount: number;
  resourceType?: 'gold' | 'mana' | 'health';
  onDismiss: () => void;
}

export default function ResourceCollectionNotification({
  visible,
  amount,
  resourceType = 'gold',
  onDismiss,
}: ResourceCollectionNotificationProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      // Start animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after 2.5 seconds
      const timeout = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 50,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onDismiss();
        });
      }, 2500);

      return () => clearTimeout(timeout);
    } else {
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(-50);
      scaleAnim.setValue(0.8);
    }
  }, [visible, fadeAnim, slideAnim, scaleAnim, onDismiss]);

  const getResourceIcon = () => {
    switch (resourceType) {
      case 'gold':
        return '💰';
      case 'mana':
        return '✨';
      case 'health':
        return '❤️';
      default:
        return '💰';
    }
  };

  const getResourceColor = () => {
    switch (resourceType) {
      case 'gold':
        return '#fbbf24';
      case 'mana':
        return '#3b82f6';
      case 'health':
        return '#ef4444';
      default:
        return '#fbbf24';
    }
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          <View style={[styles.badge, { backgroundColor: getResourceColor() }]}>
            <Text style={styles.icon}>{getResourceIcon()}</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Resources Collected!</Text>
            <Text style={styles.amount}>
              +{amount} {resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}
            </Text>
          </View>
          
          {/* Sparkle particles */}
          {[...Array(6)].map((_, i) => (
            <SparkleParticle key={i} index={i} />
          ))}
        </Animated.View>
      </View>
    </Modal>
  );
}

// Sparkle particle component for extra flair
function SparkleParticle({ index }: { index: number }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const angle = (index / 6) * Math.PI * 2;
    const distance = 60;
    
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: Math.cos(angle) * distance,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: Math.sin(angle) * distance,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.3,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, translateX, translateY, opacity, scale]);

  return (
    <Animated.View
      style={[
        styles.sparkle,
        {
          transform: [
            { translateX },
            { translateY },
            { scale },
          ],
          opacity,
        },
      ]}
    >
      <Text style={styles.sparkleText}>✨</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    backgroundColor: '#1e1e2e',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  icon: {
    fontSize: 32,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  amount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fbbf24',
  },
  sparkle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
  },
  sparkleText: {
    fontSize: 16,
  },
});
