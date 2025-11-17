/**
 * XP Progress Bar Component
 * 
 * Displays animated progress bar showing XP progress to next level
 * Shows current XP, XP needed, and percentage complete
 */

import { calculateLevelProgress, calculateXPForLevel } from '@/services/xpService';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface XPProgressBarProps {
    currentXP: number;
    currentLevel: number;
    animated?: boolean;
    showNumbers?: boolean;
    height?: number;
    color?: string;
    backgroundColor?: string;
}

export function XPProgressBar({
    currentXP,
    currentLevel,
    animated = true,
    showNumbers = true,
    height = 24,
    color = '#3B82F6',
    backgroundColor = '#E5E7EB',
}: XPProgressBarProps) {
    const progressAnim = useRef(new Animated.Value(0)).current;
    const xpForNextLevel = calculateXPForLevel(currentLevel + 1);
    const progressPercent = calculateLevelProgress(currentXP, currentLevel);

    useEffect(() => {
        if (animated) {
            Animated.spring(progressAnim, {
                toValue: progressPercent,
                useNativeDriver: false,
                tension: 50,
                friction: 7,
            }).start();
        } else {
            progressAnim.setValue(progressPercent);
        }
    }, [progressPercent, animated, progressAnim]);

    const animatedWidth = progressAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={styles.container}>
            {showNumbers && (
                <View style={styles.labelRow}>
                    <Text style={styles.label}>Level {currentLevel}</Text>
                    <Text style={styles.xpText}>
                        {currentXP.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
                    </Text>
                </View>
            )}
            <View style={[styles.progressContainer, { height, backgroundColor }]}>
                <Animated.View
                    style={[
                        styles.progressFill,
                        {
                            width: animatedWidth,
                            backgroundColor: color,
                        },
                    ]}
                />
                {showNumbers && (
                    <View style={styles.percentContainer}>
                        <Text style={styles.percentText}>{Math.floor(progressPercent)}%</Text>
                    </View>
                )}
            </View>
        </View>
    );
}

// Compact version for small spaces
export function XPProgressBarCompact({
    currentXP,
    currentLevel,
    height = 8,
}: {
    currentXP: number;
    currentLevel: number;
    height?: number;
}) {
    const progressPercent = calculateLevelProgress(currentXP, currentLevel);

    return (
        <View style={styles.compactContainer}>
            <View style={[styles.progressContainer, { height }]}>
                <View
                    style={[
                        styles.progressFill,
                        {
                            width: `${progressPercent}%`,
                            backgroundColor: '#3B82F6',
                        },
                    ]}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
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
        fontWeight: '500',
    },
    progressContainer: {
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    progressFill: {
        height: '100%',
        borderRadius: 12,
    },
    percentContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    percentText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    compactContainer: {
        width: '100%',
    },
});
