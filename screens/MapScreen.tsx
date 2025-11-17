/**
 * Map Screen - Interactive Territory Map
 * 
 * Features:
 * - Real-time user location with animated marker
 * - Grid block overlays (20m x 20m cells)
 * - Color-coded territories (User/Guild/Enemy/Unclaimed)
 * - Interactive block details
 * - Auto-claim animation
 * - Performance optimized for 50+ blocks
 */
import BlockOverlay from '@/components/BlockOverlay';
import { useBlockClaim } from '@/hooks/useBlockClaim';
import { useLocation } from '@/hooks/useLocation';
import { useMapState } from '@/hooks/useMapState';
import { incrementBlocksClaimed } from '@/store/slices/userSlice';
import { parseCellId } from '@/utils/gridUtils';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useDispatch } from 'react-redux';

// Block ownership types
export type BlockOwnership = 'user' | 'guild' | 'enemy' | 'unclaimed';

export default function MapScreen() {
    const dispatch = useDispatch();
    
    const {
        currentBlock,
        latitude,
        longitude,
        isTracking,
        startTracking,
        requestPermission,
        hasLocationPermission,
    } = useLocation();

    const {
        visibleBlocks,
        blockOwnership,
        fetchBlocksInArea,
        updateBlockOwnership,
    } = useMapState();

    // Block claiming with auto-claim enabled (manual claim button removed)
    useBlockClaim({
        autoClaimEnabled: true,
        showNotifications: true,
        showVisualFeedback: true,
        onClaimSuccess: (blockId, rewards) => {
            console.log(`✅ Block ${blockId} claimed! Rewards:`, rewards);
            // Update map ownership immediately
            updateBlockOwnership(blockId, 'user');
            // Increment claimed blocks count
            dispatch(incrementBlocksClaimed());
            // Trigger animation
            triggerClaimAnimation();
        },
        onClaimFailed: (error) => {
            console.error('❌ Claim failed:', error);
        },
    });

    const [region, setRegion] = useState<Region | null>(null);
    const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
    const [showClaimAnimation, setShowClaimAnimation] = useState(false);
    const mapRef = useRef<MapView>(null);
    const claimAnimValue = useRef(new Animated.Value(0)).current;
    const [blockStats, setBlockStats] = useState({
        user: 0,
        guild: 0,
        enemy: 0,
        unclaimed: 0,
        total: 0,
    });

    // Initialize location tracking
    useEffect(() => {
        if (!hasLocationPermission) {
            requestPermission().then((granted) => {
                if (granted && !isTracking) {
                    startTracking();
                }
            });
        } else if (!isTracking) {
            startTracking();
        }
    }, [hasLocationPermission, isTracking, requestPermission, startTracking]);

    // Center map on user location when available
    useEffect(() => {
        if (latitude && longitude && !region) {
            setRegion({
                latitude,
                longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            });
        }
    }, [latitude, longitude, region]);

    // Fetch blocks when region changes
    useEffect(() => {
        if (latitude && longitude) {
            fetchBlocksInArea(latitude, longitude, 500);
        }
    }, [latitude, longitude, fetchBlocksInArea]);

    // Update block statistics
    useEffect(() => {
        const stats = {
            user: 0,
            guild: 0,
            enemy: 0,
            unclaimed: 0,
            total: visibleBlocks.length,
        };

        visibleBlocks.forEach((cellId) => {
            const ownership = blockOwnership[cellId] || 'unclaimed';
            stats[ownership]++;
        });

        setBlockStats(stats);
    }, [visibleBlocks, blockOwnership]);

    // Claim animation function
    const triggerClaimAnimation = useCallback(() => {
        setShowClaimAnimation(true);
        claimAnimValue.setValue(0);
        
        Animated.sequence([
            Animated.spring(claimAnimValue, {
                toValue: 1,
                useNativeDriver: true,
                tension: 50,
                friction: 5,
            }),
            Animated.delay(1500),
            Animated.timing(claimAnimValue, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => setShowClaimAnimation(false));
    }, [claimAnimValue]);

    // Handle block tap
    const handleBlockTap = useCallback((cellId: string) => {
        setSelectedBlock(cellId);
        const coords = parseCellId(cellId);
        
        if (mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.002,
                longitudeDelta: 0.002,
            }, 300);
        }

        const ownership = blockOwnership[cellId] || 'unclaimed';
        const ownerText = {
            user: 'You',
            guild: 'Your Guild',
            enemy: 'Enemy Player',
            unclaimed: 'No one',
        }[ownership];

        Alert.alert(
            `Block ${cellId}`,
            `Owner: ${ownerText}`,
            [{ text: 'OK' }]
        );
    }, [blockOwnership]);

    // Recenter map on user
    const handleRecenter = useCallback(() => {
        if (latitude && longitude && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude,
                longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            }, 500);
        }
    }, [latitude, longitude]);

    // Memoized marker position
    const userMarkerCoordinate = useMemo(() => {
        if (!latitude || !longitude) return null;
        return { latitude, longitude };
    }, [latitude, longitude]);

    if (!hasLocationPermission) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContent}>
                    <Text style={styles.permissionText}>
                        Location permission required
                    </Text>
                    <TouchableOpacity
                        style={styles.permissionButton}
                        onPress={requestPermission}
                    >
                        <Text style={styles.permissionButtonText}>
                            Grant Permission
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (!region || !latitude || !longitude) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color="#2196F3" />
                    <Text style={styles.loadingText}>Loading map...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={region}
                showsUserLocation={false}
                showsMyLocationButton={false}
                showsCompass={true}
                onRegionChangeComplete={setRegion}
            >
                {visibleBlocks.map((cellId) => (
                    <BlockOverlay
                        key={cellId}
                        cellId={cellId}
                        ownership={blockOwnership[cellId] || 'unclaimed'}
                        isSelected={selectedBlock === cellId}
                        isCurrent={currentBlock?.blockId === cellId}
                        onPress={() => handleBlockTap(cellId)}
                    />
                ))}

                {userMarkerCoordinate && (
                    <Marker
                        coordinate={userMarkerCoordinate}
                        anchor={{ x: 0.5, y: 0.5 }}
                    >
                        <View style={styles.markerContainer}>
                            <View style={styles.markerPulse} />
                            <View style={styles.marker} />
                        </View>
                    </Marker>
                )}
            </MapView>

            <View style={styles.statsContainer}>
                <Text style={styles.statsTitle}>Territory Stats</Text>
                <View style={styles.statsRow}>
                    <View style={[styles.statBox, styles.userStat]}>
                        <Text style={styles.statValue}>{blockStats.user}</Text>
                        <Text style={styles.statLabel}>Yours</Text>
                    </View>
                    <View style={[styles.statBox, styles.guildStat]}>
                        <Text style={styles.statValue}>{blockStats.guild}</Text>
                        <Text style={styles.statLabel}>Guild</Text>
                    </View>
                    <View style={[styles.statBox, styles.enemyStat]}>
                        <Text style={styles.statValue}>{blockStats.enemy}</Text>
                        <Text style={styles.statLabel}>Enemy</Text>
                    </View>
                    <View style={[styles.statBox, styles.unclaimedStat]}>
                        <Text style={styles.statValue}>{blockStats.unclaimed}</Text>
                        <Text style={styles.statLabel}>Free</Text>
                    </View>
                </View>
                <Text style={styles.totalBlocks}>
                    {blockStats.total} blocks visible
                </Text>
            </View>

            {currentBlock && (
                <View style={styles.currentBlockInfo}>
                    <Text style={styles.currentBlockTitle}>Current Block</Text>
                    <Text style={styles.currentBlockId}>{currentBlock.blockId}</Text>
                    <Text style={styles.currentBlockAccuracy}>
                        Accuracy: ±{currentBlock.accuracy?.toFixed(0) || '?'}m
                    </Text>
                </View>
            )}

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.recenterButton}
                    onPress={handleRecenter}
                >
                    <Text style={styles.buttonIcon}>📍</Text>
                </TouchableOpacity>
            </View>

            {showClaimAnimation && (
                <Animated.View
                    style={[
                        styles.claimAnimationOverlay,
                        {
                            opacity: claimAnimValue,
                            transform: [
                                {
                                    scale: claimAnimValue.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.5, 1.2],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    <Text style={styles.claimAnimationText}>
                        ✨ Territory Claimed! ✨
                    </Text>
                </Animated.View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    map: {
        flex: 1,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    permissionText: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    permissionButton: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
    },
    permissionButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: '#666',
    },
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    marker: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#2196F3',
        borderWidth: 3,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    markerPulse: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(33, 150, 243, 0.3)',
    },
    statsContainer: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        minWidth: 150,
    },
    statsTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    statBox: {
        alignItems: 'center',
        flex: 1,
        paddingVertical: 6,
        marginHorizontal: 2,
        borderRadius: 6,
    },
    userStat: {
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
    },
    guildStat: {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
    },
    enemyStat: {
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
    },
    unclaimedStat: {
        backgroundColor: 'rgba(158, 158, 158, 0.1)',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    statLabel: {
        fontSize: 10,
        color: '#666',
        marginTop: 2,
    },
    totalBlocks: {
        fontSize: 11,
        color: '#999',
        textAlign: 'center',
    },
    currentBlockInfo: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        maxWidth: 200,
    },
    currentBlockTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 4,
    },
    currentBlockId: {
        fontSize: 14,
        fontFamily: 'monospace',
        color: '#333',
        marginBottom: 4,
    },
    currentBlockAccuracy: {
        fontSize: 11,
        color: '#999',
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    recenterButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    buttonIcon: {
        fontSize: 24,
    },
    claimButton: {
        flexDirection: 'row',
        backgroundColor: '#4CAF50',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 28,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        minWidth: 200,
        justifyContent: 'center',
    },
    claimButtonText: {
        fontSize: 20,
        marginRight: 8,
    },
    claimButtonLabel: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    claimAnimationOverlay: {
        position: 'absolute',
        top: '40%',
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    claimAnimationText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#4CAF50',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
});
