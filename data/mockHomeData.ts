/**
 * Mock Data for Home Screen
 * Test data for achievements, leaderboard, and daily quests
 */

import { Achievement } from '@/components/AchievementCard';
import { LeaderboardPlayer } from '@/components/LeaderboardSnippet';

// Mock Achievements and Daily Quests
export const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'daily_claim_5',
    title: 'Daily Explorer',
    description: 'Claim 5 blocks today',
    icon: '🗺️',
    progress: 3,
    maxProgress: 5,
    reward: '50 Gold + 100 XP',
    isCompleted: false,
    type: 'daily',
  },
  {
    id: 'daily_walk_2km',
    title: 'Daily Steps',
    description: 'Walk 2 kilometers',
    icon: '🚶',
    progress: 1.2,
    maxProgress: 2,
    reward: '30 Gold + 50 XP',
    isCompleted: false,
    type: 'daily',
  },
  {
    id: 'achievement_100_blocks',
    title: 'Territory Master',
    description: 'Claim 100 total blocks',
    icon: '👑',
    progress: 87,
    maxProgress: 100,
    reward: 'Legendary Badge',
    isCompleted: false,
    type: 'achievement',
  },
  {
    id: 'achievement_level_10',
    title: 'Realm Veteran',
    description: 'Reach Level 10',
    icon: '⭐',
    progress: 10,
    maxProgress: 10,
    reward: '500 Gold',
    isCompleted: true,
    type: 'achievement',
  },
];

// Mock Leaderboard Data - Indian Themed
export const MOCK_LEADERBOARD: LeaderboardPlayer[] = [
  {
    userId: 'user_001',
    displayName: 'MumbaiMaharaj',
    level: 25,
    totalBlocksClaimed: 342,
    rank: 1,
    avatar: '�',
  },
  {
    userId: 'user_002',
    displayName: 'DelhiDefender',
    level: 23,
    totalBlocksClaimed: 298,
    rank: 2,
    avatar: '🛡️',
  },
  {
    userId: 'user_003',
    displayName: 'BangaloreWarrior',
    level: 22,
    totalBlocksClaimed: 276,
    rank: 3,
    avatar: '⚔️',
  },
  {
    userId: 'user_004',
    displayName: 'HyderabadHero',
    level: 20,
    totalBlocksClaimed: 245,
    rank: 4,
    avatar: '🏹',
  },
  {
    userId: 'user_005',
    displayName: 'ChennaiChampion',
    level: 19,
    totalBlocksClaimed: 223,
    rank: 5,
    avatar: '�',
  },
];

// Helper function to get daily quests
export function getDailyQuests(): Achievement[] {
  return MOCK_ACHIEVEMENTS.filter((a) => a.type === 'daily');
}

// Helper function to get recent achievements
export function getRecentAchievements(): Achievement[] {
  return MOCK_ACHIEVEMENTS.filter((a) => a.type === 'achievement').slice(0, 2);
}

// Helper function to get top 3 leaderboard
export function getTopThreeLeaderboard(): LeaderboardPlayer[] {
  return MOCK_LEADERBOARD.slice(0, 3);
}

// Helper function to simulate player's own stats
export function getMockPlayerStats(userId?: string) {
  return {
    userId: userId || 'current_user',
    displayName: 'You',
    level: 12,
    currentXP: 450,
    nextLevelXP: 1300,
    gold: 1250,
    blocksOwnedToday: 7,
    totalBlocksOwned: 89,
    goldPerHour: 15.5,
  };
}

// Helper to update leaderboard with current user
export function getLeaderboardWithCurrentUser(
  currentUserId: string,
  currentUserStats: {
    displayName: string;
    level: number;
    totalBlocksClaimed: number;
  }
): LeaderboardPlayer[] {
  const currentUserEntry: LeaderboardPlayer = {
    userId: currentUserId,
    displayName: currentUserStats.displayName,
    level: currentUserStats.level,
    totalBlocksClaimed: currentUserStats.totalBlocksClaimed,
    rank: 0, // Will be calculated
  };

  // Insert current user into leaderboard
  const allPlayers = [...MOCK_LEADERBOARD];
  
  // Find where current user would rank
  let insertIndex = allPlayers.findIndex(
    (p) => p.totalBlocksClaimed < currentUserStats.totalBlocksClaimed
  );
  
  if (insertIndex === -1) {
    insertIndex = allPlayers.length;
  }

  allPlayers.splice(insertIndex, 0, currentUserEntry);

  // Update ranks
  return allPlayers.map((player, index) => ({
    ...player,
    rank: index + 1,
  }));
}
