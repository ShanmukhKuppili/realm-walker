/**
 * Profile Screen
 * Shows user profile, stats, achievements, and progress
 */
import { PlayerProfile } from '@/components/PlayerProfile';
import ResourceCollectionNotification from '@/components/ResourceCollectionNotification';
import ResourcePanel from '@/components/ResourcePanel';
import { getStarterEquipment, getStarterInventory } from '@/data/mockItems';
import { useResourceCollection } from '@/hooks/useResourceCollection';
import { firebaseAuth } from '@/services/firebase';
import { getUserBlocksFromFirestore } from '@/services/firebaseBlockService';
import { useAppDispatch, useAppSelector } from '@/store';
import { initializePlayer } from '@/store/slices/playerSlice';
import { clearUser } from '@/store/slices/userSlice';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);
  const playerProfile = useAppSelector((state) => (state as any).player?.profile);

  // Resource collection hook
  const {
    goldPerHour,
    pendingGold,
    isCollecting,
    playerGold,
    playerHealth,
    playerMaxHealth,
    collectResources,
    showNotification,
    lastCollectedAmount,
    dismissNotification,
  } = useResourceCollection();

  // Get owned blocks for breakdown
  const allBlocks = useAppSelector((state) => state.map.blocks || {});
  const userId = useAppSelector((state) => state.auth.user?.id);
  const ownedBlocks = Object.values(allBlocks).filter(
    (block) => block.ownerId === userId
  );

  // Get total blocks claimed from user profile (Redux counter)
  const totalBlocksClaimed = authUser?.totalBlocksClaimed || 0;

  // Fetch actual blocks from Firebase
  const [firebaseBlockCount, setFirebaseBlockCount] = useState<number>(0);

  useEffect(() => {
    const fetchUserBlocks = async () => {
      if (userId) {
        try {
          const blocks = await getUserBlocksFromFirestore(userId);
          setFirebaseBlockCount(blocks.length);
          console.log(`📊 [PROFILE] User has ${blocks.length} active blocks in Firebase`);
        } catch (error) {
          console.error('❌ [PROFILE] Error fetching user blocks:', error);
        }
      }
    };

    fetchUserBlocks();
  }, [userId]);

  // Combined block count: max of Redux counter and Firebase count
  const actualBlockCount = Math.max(totalBlocksClaimed, firebaseBlockCount);

  // Initialize player profile when user logs in
  useEffect(() => {
    if (authUser && !playerProfile) {
      // Create initial player profile
      const starterEquipment = getStarterEquipment();
      const starterInventory = getStarterInventory();

      dispatch(initializePlayer({
        userId: authUser.id,
        username: authUser.displayName || 'Wanderer',
        avatar: '🧙',
        level: 1,
        xp: 0,
        gold: 100,
        health: 100,
        maxHealth: 100,
        baseStats: {
          strength: 10,
          intelligence: 10,
          dexterity: 10,
          constitution: 10,
          wisdom: 10,
        },
        equipment: starterEquipment,
        inventory: starterInventory,
        totalBlocksClaimed: authUser.totalBlocksClaimed || 0,
        joinedAt: authUser.createdAt,
      }));
    }
  }, [authUser, playerProfile, dispatch]);

  const handleSignOut = async () => {
    try {
      await firebaseAuth.signOut();
      dispatch(clearUser());
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (!authUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.noDataText}>Please log in to view profile</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!playerProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Quick Stats Banner */}
        <View style={styles.statsBanner}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🏆</Text>
            <Text style={styles.statNumber}>{playerProfile.level}</Text>
            <Text style={styles.statText}>Level</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🏰</Text>
            <Text style={styles.statNumber}>{actualBlockCount}</Text>
            <Text style={styles.statText}>Blocks Claimed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>💰</Text>
            <Text style={styles.statNumber}>{playerGold}</Text>
            <Text style={styles.statText}>Gold</Text>
          </View>
        </View>

        {/* Resource Panel - Comprehensive View */}
        <View style={styles.section}>
          <ResourcePanel
            gold={playerGold}
            health={playerHealth}
            maxHealth={playerMaxHealth}
            pendingGold={pendingGold}
            goldPerHour={goldPerHour}
            onCollect={collectResources}
            isCollecting={isCollecting}
            ownedBlocks={ownedBlocks}
            showBreakdown={true}
          />
        </View>

        {/* Player Profile Component */}
        <View style={styles.section}>
          <PlayerProfile profile={playerProfile} showEquipment={true} />
        </View>

        {/* Sign Out Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Collection Notification */}
      <ResourceCollectionNotification
        visible={showNotification}
        amount={lastCollectedAmount}
        resourceType="gold"
        onDismiss={dismissNotification}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#6B7280',
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  signOutButton: {
    backgroundColor: '#EF4444',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statsBanner: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statText: {
    fontSize: 12,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#334155',
    marginHorizontal: 12,
  },
});
