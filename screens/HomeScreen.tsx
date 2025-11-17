/**
 * Home Screen - MVP
 * Main dashboard with player stats, resources, achievements, and quick actions
 */
import AchievementCard from '@/components/AchievementCard';
import LeaderboardSnippet from '@/components/LeaderboardSnippet';
import QuickActions from '@/components/QuickActions';
import ResourceCollectionNotification from '@/components/ResourceCollectionNotification';
import StatsCard from '@/components/StatsCard';
import {
    getDailyQuests,
    getTopThreeLeaderboard,
    MOCK_ACHIEVEMENTS,
} from '@/data/mockHomeData';
import { useResourceCollection } from '@/hooks/useResourceCollection';
import { getUserBlocksFromFirestore } from '@/services/firebaseBlockService';
import { useAppSelector } from '@/store';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function HomeScreen() {
  const navigation = useNavigation();
  const user = useAppSelector((state) => state.user.user);
  const playerProfile = useAppSelector((state) => (state as any).player?.profile);
  const [refreshing, setRefreshing] = useState(false);

  // Get total blocks claimed from user profile (Redux counter)
  const totalBlocksClaimed = user?.totalBlocksClaimed || 0;

  // Fetch actual blocks from Firebase
  const [firebaseBlockCount, setFirebaseBlockCount] = useState<number>(0);
  const userId = useAppSelector((state) => state.auth.user?.id);

  // Fetch user's blocks from Firebase
  useEffect(() => {
    const fetchUserBlocks = async () => {
      if (userId) {
        try {
          const blocks = await getUserBlocksFromFirestore(userId);
          setFirebaseBlockCount(blocks.length);
          console.log(`📊 [HOME] User has ${blocks.length} active blocks in Firebase`);
        } catch (error) {
          console.error('❌ [HOME] Error fetching user blocks:', error);
        }
      }
    };

    fetchUserBlocks();
  }, [userId]);

  // Combined block count: max of Redux counter and Firebase count
  const actualBlockCount = Math.max(totalBlocksClaimed, firebaseBlockCount);

  // Resource collection hook
  const {
    goldPerHour,
    pendingGold,
    playerGold,
    collectResources,
    showNotification,
    lastCollectedAmount,
    dismissNotification,
  } = useResourceCollection();

  // Get owned blocks from map state
  const allBlocks = useAppSelector((state) => state.map.blocks || {});
  const ownedBlocks = Object.values(allBlocks).filter(
    (block) => block.ownerId === userId
  );

  // Calculate blocks owned today (mock for now)
  const blocksOwnedToday = ownedBlocks.length > 0 ? Math.min(ownedBlocks.length, 10) : 0;

  // Player stats
  const level = playerProfile?.level || user?.level || 1;
  const currentXP = playerProfile?.xp || user?.xp || 0;
  const nextLevelXP = 100 * Math.pow(level, 1.5);

  // Mock leaderboard with current user
  const topPlayers = getTopThreeLeaderboard();

  // Mock achievements - filter to show daily quest and one recent achievement
  const dailyQuest = getDailyQuests()[0];
  const recentAchievement = MOCK_ACHIEVEMENTS.find((a) => a.type === 'achievement' && !a.isCompleted);

  // Quick actions
  const quickActions = [
    {
      id: 'map',
      label: 'Go to Map',
      icon: '🗺️',
      color: '#3b82f6',
      onPress: () => (navigation as any).navigate('map'),
    },
    {
      id: 'collect',
      label: 'Collect Resources',
      icon: '💰',
      color: '#10b981',
      onPress: collectResources,
    },
    {
      id: 'profile',
      label: 'View Profile',
      icon: '👤',
      color: '#8b5cf6',
      onPress: () => (navigation as any).navigate('profile'),
    },
  ];

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    
    // Refetch user blocks from Firebase
    if (userId) {
      try {
        const blocks = await getUserBlocksFromFirestore(userId);
        setFirebaseBlockCount(blocks.length);
        console.log(`🔄 [HOME] Refreshed: ${blocks.length} active blocks`);
      } catch (error) {
        console.error('❌ [HOME] Error refreshing blocks:', error);
      }
    }
    
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  }, [userId]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3b82f6"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Realm Walker</Text>
            <Text style={styles.subtitle}>
              {user ? `Welcome back, ${user.displayName}!` : 'Welcome, Wanderer!'}
            </Text>
          </View>
          <Text style={styles.timeGreeting}>{getTimeGreeting()}</Text>
        </View>

        {/* Stats Card */}
        <View style={styles.section}>
          <StatsCard
            level={level}
            currentXP={currentXP}
            nextLevelXP={nextLevelXP}
            gold={playerGold}
            blocksOwnedToday={blocksOwnedToday}
            totalBlocksOwned={actualBlockCount}
          />
        </View>

        {/* Resource Generation Preview */}
        {goldPerHour > 0 && (
          <View style={[styles.section, styles.resourcePreview]}>
            <View style={styles.resourcePreviewHeader}>
              <Text style={styles.resourcePreviewTitle}>💰 Resource Generation</Text>
              <Text style={styles.resourcePreviewRate}>+{goldPerHour.toFixed(1)}/hr</Text>
            </View>
            <Text style={styles.resourcePreviewText}>
              You&apos;re earning {goldPerHour.toFixed(1)} Gold per hour from {ownedBlocks.length} blocks
            </Text>
            {pendingGold > 0 && (
              <Text style={styles.resourcePreviewPending}>
                {pendingGold} Gold ready to collect!
              </Text>
            )}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <QuickActions actions={quickActions} />
        </View>

        {/* Daily Quest */}
        {dailyQuest && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 Daily Quest</Text>
            <AchievementCard achievement={dailyQuest} />
          </View>
        )}

        {/* Recent Achievement */}
        {recentAchievement && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 In Progress</Text>
            <AchievementCard achievement={recentAchievement} />
          </View>
        )}

        {/* Leaderboard Snippet */}
        <View style={styles.section}>
          <LeaderboardSnippet
            topPlayers={topPlayers}
            currentUserId={userId}
            onViewFull={() => console.log('View full leaderboard')}
          />
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

// Helper function for time-based greeting
function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return '🌅';
  if (hour < 17) return '☀️';
  if (hour < 20) return '🌆';
  return '🌙';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#94a3b8',
  },
  timeGreeting: {
    fontSize: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  resourcePreview: {
    backgroundColor: '#1e1e2e',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  resourcePreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resourcePreviewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  resourcePreviewRate: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
  },
  resourcePreviewText: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
  resourcePreviewPending: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fbbf24',
    marginTop: 4,
  },
});
