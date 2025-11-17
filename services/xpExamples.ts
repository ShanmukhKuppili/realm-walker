/**
 * XP System Examples & Documentation
 * 
 * Demonstrates level progression from 1-5 with practical examples
 */

import {
    calculateLevelProgress,
    calculateTotalXPToLevel,
    calculateXPForLevel,
    checkLevelUp,
    getLevelUpRewards,
    getXPTable,
} from './xpService';

/**
 * Example 1: XP Requirements Table (Levels 1-10)
 */
export function printXPTable() {
    console.log('=== XP Requirements (Levels 1-10) ===\n');
    
    const table = getXPTable(10);
    
    table.forEach((entry, index) => {
        if (index === 0) {
            console.log(`Level ${entry.level}: Starting level`);
        } else {
            const prevLevel = table[index - 1];
            console.log(
                `Level ${prevLevel.level} → ${entry.level}: ${entry.xpNeeded} XP needed (Total earned: ${entry.totalXP})`
            );
        }
    });
    
    console.log('\n');
}

/**
 * Example 2: Level 1 to 5 Progression
 */
export function demonstrateLevel1to5() {
    console.log('=== LEVEL 1 → 5 PROGRESSION ===\n');
    
    let currentLevel = 1;
    let currentXP = 0;
    let totalXPEarned = 0;
    
    // Simulated gameplay activities
    const activities = [
        // Early game (Level 1 → 2)
        { action: 'Claim first block', xp: 50 },
        { action: 'Walk 500m', xp: 10 },
        { action: 'Claim block', xp: 50 },
        { action: 'Claim block', xp: 50 },
        { action: 'Walk 1km', xp: 20 },
        { action: 'Claim block', xp: 50 },
        { action: 'Claim block', xp: 50 },
        // Should level up to 2 (282 XP needed)
        
        // Level 2 → 3
        { action: 'Combat victory', xp: 100 },
        { action: 'Claim block', xp: 50 },
        { action: 'Walk 750m', xp: 15 },
        { action: 'Claim block', xp: 50 },
        { action: 'Claim block', xp: 50 },
        { action: 'Combat victory', xp: 100 },
        // Should level up to 3 (519 XP needed)
        
        // Level 3 → 4
        { action: 'Claim 3 blocks', xp: 150 },
        { action: 'Walk 2km', xp: 40 },
        { action: 'Combat victory', xp: 100 },
        { action: 'Claim 2 blocks', xp: 100 },
        { action: 'Walk 1.5km', xp: 30 },
        { action: 'Claim 2 blocks', xp: 100 },
        // Should level up to 4 (746 XP needed)
        
        // Level 4 → 5
        { action: 'Combat victory', xp: 100 },
        { action: 'Claim 5 blocks', xp: 250 },
        { action: 'Walk 2km', xp: 40 },
        { action: 'Combat victory', xp: 100 },
        { action: 'Claim 5 blocks', xp: 250 },
        { action: 'Combat victory', xp: 100 },
        // Should level up to 5 (1000 XP needed)
    ];
    
    console.log('Starting: Level 1, 0 XP\n');
    
    activities.forEach((activity, index) => {
        // Check if this action will cause level up
        const levelUpCheck = checkLevelUp(currentXP, currentLevel, activity.xp);
        
        // Add XP
        currentXP += activity.xp;
        totalXPEarned += activity.xp;
        
        console.log(`${index + 1}. ${activity.action} (+${activity.xp} XP)`);
        
        // Handle level up
        if (levelUpCheck.willLevelUp) {
            const oldLevel = currentLevel;
            const xpNeededForOldLevel = calculateXPForLevel(currentLevel + 1);
            
            // Level up!
            currentLevel = levelUpCheck.newLevel;
            currentXP -= xpNeededForOldLevel;
            
            const rewards = getLevelUpRewards(currentLevel);
            
            console.log(`   🎉 LEVEL UP! ${oldLevel} → ${currentLevel}`);
            console.log(`   ═══════════════════════`);
            console.log(`   ⚔️  All Stats: +${rewards.statIncrease.strength}`);
            console.log(`   ❤️  Max Health: +${rewards.healthIncrease}`);
            console.log(`   💰 Gold Bonus: +${rewards.goldBonus}`);
            
            if (rewards.specialReward) {
                console.log(`   🎁 Special: ${rewards.specialReward}`);
            }
            console.log(`   ═══════════════════════`);
        }
        
        // Show current progress
        const progress = calculateLevelProgress(currentXP, currentLevel);
        const xpForNext = calculateXPForLevel(currentLevel + 1);
        console.log(`   Progress: Level ${currentLevel} | ${currentXP}/${xpForNext} XP (${progress.toFixed(1)}%)\n`);
    });
    
    console.log(`\n=== Final Result ===`);
    console.log(`Level: ${currentLevel}`);
    console.log(`Current XP: ${currentXP}`);
    console.log(`Total XP Earned: ${totalXPEarned}`);
    console.log(`XP to Next Level: ${calculateXPForLevel(currentLevel + 1)}`);
}

/**
 * Example 3: XP Sources Breakdown
 */
export function xpSourcesExample() {
    console.log('=== XP SOURCES ===\n');
    
    console.log('Walking:');
    console.log('  • 1 XP per 50 meters');
    console.log('  • 500m walk = 10 XP');
    console.log('  • 1km walk = 20 XP');
    console.log('  • 5km walk = 100 XP\n');
    
    console.log('Block Claiming:');
    console.log('  • 50 XP per block claimed');
    console.log('  • 0 XP for refreshing owned blocks');
    console.log('  • 6 blocks = Level 2 (300 XP > 282 needed)\n');
    
    console.log('Combat (future):');
    console.log('  • 100 XP per victory');
    console.log('  • 3 victories = Level 2\n');
    
    console.log('Other sources:');
    console.log('  • Quest completion: 200 XP');
    console.log('  • Achievement: 150 XP');
    console.log('  • Daily login: 25 XP\n');
}

/**
 * Example 4: Practical Scenarios
 */
export function practicalScenarios() {
    console.log('=== PRACTICAL SCENARIOS ===\n');
    
    // Scenario 1: Casual player
    console.log('Scenario 1: Casual Player (30 min session)');
    console.log('  • Walk 2km: 40 XP');
    console.log('  • Claim 4 blocks: 200 XP');
    console.log('  • Total: 240 XP');
    console.log('  • Result: 85% to Level 2\n');
    
    // Scenario 2: Active player
    console.log('Scenario 2: Active Player (1 hour session)');
    console.log('  • Walk 5km: 100 XP');
    console.log('  • Claim 8 blocks: 400 XP');
    console.log('  • Win 1 combat: 100 XP');
    console.log('  • Total: 600 XP');
    console.log('  • Result: Level 2 + 318 XP towards Level 3\n');
    
    // Scenario 3: Dedicated player
    console.log('Scenario 3: Dedicated Player (Daily goal)');
    console.log('  • Walk 10km: 200 XP');
    console.log('  • Claim 20 blocks: 1000 XP');
    console.log('  • Win 3 combats: 300 XP');
    console.log('  • Complete quest: 200 XP');
    console.log('  • Total: 1700 XP');
    console.log('  • Result: Level 3 with progress to Level 4\n');
}

/**
 * Example 5: Level Up Milestones
 */
export function levelUpMilestones() {
    console.log('=== LEVEL UP MILESTONES ===\n');
    
    const milestones = [1, 10, 25, 50, 100];
    
    milestones.forEach(level => {
        const rewards = getLevelUpRewards(level);
        const xpNeeded = level === 1 ? 0 : calculateXPForLevel(level);
        const totalXP = calculateTotalXPToLevel(level);
        
        console.log(`Level ${level}:`);
        
        if (level > 1) {
            console.log(`  XP to reach: ${xpNeeded.toLocaleString()}`);
            console.log(`  Total XP: ${totalXP.toLocaleString()}`);
        }
        
        console.log(`  Stat increase: +${rewards.statIncrease.strength}`);
        console.log(`  Health increase: +${rewards.healthIncrease}`);
        console.log(`  Gold bonus: ${rewards.goldBonus}`);
        
        if (rewards.specialReward) {
            console.log(`  🎁 ${rewards.specialReward}`);
        }
        
        console.log('');
    });
}

// Run all examples
export function runAllExamples() {
    console.log('\n\n');
    console.log('╔════════════════════════════════════════════╗');
    console.log('║   REALM WALKER - XP SYSTEM EXAMPLES        ║');
    console.log('╚════════════════════════════════════════════╝');
    console.log('\n\n');
    
    printXPTable();
    console.log('\n' + '─'.repeat(50) + '\n');
    
    xpSourcesExample();
    console.log('\n' + '─'.repeat(50) + '\n');
    
    demonstrateLevel1to5();
    console.log('\n' + '─'.repeat(50) + '\n');
    
    practicalScenarios();
    console.log('\n' + '─'.repeat(50) + '\n');
    
    levelUpMilestones();
}

// Quick reference for testing
export const quickTests = {
    // How many blocks to reach Level 2?
    blocksToLevel2: Math.ceil(calculateXPForLevel(2) / 50), // 6 blocks
    
    // How far to walk to reach Level 2?
    metersToLevel2: calculateXPForLevel(2) * 50, // 14,100 meters (14.1km)
    
    // How many combats to reach Level 2?
    combatsToLevel2: Math.ceil(calculateXPForLevel(2) / 100), // 3 combats
    
    // Mixed approach (most realistic):
    mixedToLevel2: {
        blocks: 4, // 200 XP
        walking: 1500, // 30 XP (1.5km)
        combat: 1, // 100 XP
        // Total: 330 XP (enough for Level 2: 282 XP)
    },
};

// Export for use in app
export { calculateLevelProgress, calculateXPForLevel, checkLevelUp, getLevelUpRewards };

