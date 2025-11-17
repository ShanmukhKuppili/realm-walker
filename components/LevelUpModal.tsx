/**
 * Level Up Modal Component
 * 
 * Celebration modal shown when player levels up
 * Features:
 * - Animated entrance
 * - Confetti/star effects
 * - Reward display (stats, health, gold)
 * - Special milestone rewards
 */

import { getLevelUpRewards } from '@/services/xpService';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface LevelUpModalProps {
    visible: boolean;
    newLevel: number;
    onClose: () => void;
}

export function LevelUpModal({ visible, newLevel, onClose }: LevelUpModalProps) {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const confettiAnims = useRef(
        Array.from({ length: 20 }, () => ({
            translateY: new Animated.Value(0),
            translateX: new Animated.Value(0),
            opacity: new Animated.Value(1),
            rotate: new Animated.Value(0),
        }))
    ).current;

    const rewards = getLevelUpRewards(newLevel);

    useEffect(() => {
        if (visible) {
            // Animate modal entrance
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            // Animate confetti
            const confettiAnimations = confettiAnims.map((anim, index) => {
                const startX = (Math.random() - 0.5) * 100;
                const endX = startX + (Math.random() - 0.5) * 200;
                const endY = Dimensions.get('window').height;

                return Animated.parallel([
                    Animated.timing(anim.translateY, {
                        toValue: endY,
                        duration: 2000 + Math.random() * 1000,
                        delay: index * 50,
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim.translateX, {
                        toValue: endX,
                        duration: 2000 + Math.random() * 1000,
                        delay: index * 50,
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim.opacity, {
                        toValue: 0,
                        duration: 2000,
                        delay: index * 50,
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim.rotate, {
                        toValue: Math.random() * 360,
                        duration: 2000,
                        delay: index * 50,
                        useNativeDriver: true,
                    }),
                ]);
            });

            Animated.sequence(confettiAnimations).start();
        } else {
            scaleAnim.setValue(0);
            fadeAnim.setValue(0);
            confettiAnims.forEach((anim) => {
                anim.translateY.setValue(0);
                anim.translateX.setValue(0);
                anim.opacity.setValue(1);
                anim.rotate.setValue(0);
            });
        }
    }, [visible, scaleAnim, fadeAnim, confettiAnims]);

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
            <View style={styles.overlay}>
                {/* Confetti */}
                {confettiAnims.map((anim, index) => (
                    <Animated.View
                        key={index}
                        style={[
                            styles.confetti,
                            {
                                left: '50%',
                                transform: [
                                    { translateX: anim.translateX },
                                    { translateY: anim.translateY },
                                    {
                                        rotate: anim.rotate.interpolate({
                                            inputRange: [0, 360],
                                            outputRange: ['0deg', '360deg'],
                                        }),
                                    },
                                ],
                                opacity: anim.opacity,
                                backgroundColor: getConfettiColor(index),
                            },
                        ]}
                    />
                ))}

                {/* Modal Content */}
                <Animated.View
                    style={[
                        styles.modal,
                        {
                            transform: [{ scale: scaleAnim }],
                            opacity: fadeAnim,
                        },
                    ]}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.emoji}>🎉</Text>
                        <Text style={styles.title}>Level Up!</Text>
                        <Text style={styles.levelText}>Level {newLevel}</Text>
                    </View>

                    {/* Rewards Section */}
                    <View style={styles.rewardsContainer}>
                        <Text style={styles.rewardsTitle}>Rewards</Text>

                        {/* Stat Increases */}
                        <View style={styles.rewardSection}>
                            <Text style={styles.sectionLabel}>⚔️ Stats Increased</Text>
                            <View style={styles.statsGrid}>
                                <RewardStat
                                    icon="💪"
                                    name="STR"
                                    value={rewards.statIncrease.strength}
                                />
                                <RewardStat
                                    icon="🧠"
                                    name="INT"
                                    value={rewards.statIncrease.intelligence}
                                />
                                <RewardStat
                                    icon="🎯"
                                    name="DEX"
                                    value={rewards.statIncrease.dexterity}
                                />
                                <RewardStat
                                    icon="❤️"
                                    name="CON"
                                    value={rewards.statIncrease.constitution}
                                />
                                <RewardStat
                                    icon="📚"
                                    name="WIS"
                                    value={rewards.statIncrease.wisdom}
                                />
                            </View>
                        </View>

                        {/* Health & Gold */}
                        <View style={styles.rewardSection}>
                            <RewardItem
                                icon="❤️"
                                label="Max Health"
                                value={`+${rewards.healthIncrease}`}
                            />
                            <RewardItem
                                icon="💰"
                                label="Gold Bonus"
                                value={`+${rewards.goldBonus}`}
                            />
                        </View>

                        {/* Special Reward */}
                        {rewards.specialReward && (
                            <View style={[styles.rewardSection, styles.specialReward]}>
                                <Text style={styles.specialRewardText}>{rewards.specialReward}</Text>
                            </View>
                        )}
                    </View>

                    {/* Close Button */}
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>Continue</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
}

// Helper Components
function RewardStat({ icon, name, value }: { icon: string; name: string; value: number }) {
    return (
        <View style={styles.statItem}>
            <Text style={styles.statIcon}>{icon}</Text>
            <Text style={styles.statName}>{name}</Text>
            <Text style={styles.statValue}>+{value}</Text>
        </View>
    );
}

function RewardItem({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
        <View style={styles.rewardItem}>
            <Text style={styles.rewardIcon}>{icon}</Text>
            <Text style={styles.rewardLabel}>{label}</Text>
            <Text style={styles.rewardValue}>{value}</Text>
        </View>
    );
}

function getConfettiColor(index: number): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA'];
    return colors[index % colors.length];
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    confetti: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    modal: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    emoji: {
        fontSize: 64,
        marginBottom: 12,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    levelText: {
        fontSize: 24,
        fontWeight: '600',
        color: '#3B82F6',
    },
    rewardsContainer: {
        marginBottom: 24,
    },
    rewardsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 16,
        textAlign: 'center',
    },
    rewardSection: {
        marginBottom: 16,
        padding: 16,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 12,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    statItem: {
        flex: 1,
        minWidth: 60,
        alignItems: 'center',
        padding: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
    },
    statIcon: {
        fontSize: 20,
        marginBottom: 4,
    },
    statName: {
        fontSize: 10,
        color: '#6B7280',
        marginBottom: 2,
    },
    statValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#10B981',
    },
    rewardItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    rewardIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    rewardLabel: {
        flex: 1,
        fontSize: 16,
        color: '#374151',
        fontWeight: '500',
    },
    rewardValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#10B981',
    },
    specialReward: {
        backgroundColor: '#FEF3C7',
        borderWidth: 2,
        borderColor: '#F59E0B',
    },
    specialRewardText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#92400E',
        textAlign: 'center',
    },
    closeButton: {
        backgroundColor: '#3B82F6',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
