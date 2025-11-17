/**
 * ResourceIcon Component
 * Displays emoji icons for different resource types
 */

import React from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';

type ResourceType = 'gold' | 'mana' | 'health' | 'experience' | 'energy';

interface ResourceIconProps {
  type: ResourceType;
  size?: number;
  style?: TextStyle;
}

const RESOURCE_ICONS: Record<ResourceType, string> = {
  gold: '💰',
  mana: '✨',
  health: '❤️',
  experience: '⭐',
  energy: '⚡',
};

export default function ResourceIcon({ type, size = 24, style }: ResourceIconProps) {
  return (
    <Text style={[styles.icon, { fontSize: size }, style]}>
      {RESOURCE_ICONS[type] || '❓'}
    </Text>
  );
}

const styles = StyleSheet.create({
  icon: {
    textAlign: 'center',
  },
});
