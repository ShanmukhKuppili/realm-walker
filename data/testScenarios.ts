/**
 * Test Scenarios for Realm Walker MVP
 * Provides simulation functions for testing game mechanics
 */

import {
    calculateResourceGeneration,
    canClaimBlock,
    getLevelFromXP,
    getXPToNextLevel,
    LEVEL_PROGRESSION,
    MOCK_BLOCKS,
    MOCK_PLAYERS,
    OWNERSHIP_CONFIG,
    RESOURCE_GENERATION_RATES,
    SAMPLE_CITIES,
} from './mockData';

// ============================================================================
// TEST SCENARIO 1: New Player Claiming First Block
// ============================================================================

export function testScenario_NewPlayerFirstClaim() {
  console.log('🎯 TEST SCENARIO 1: New Player Claiming First Block\n');

  const newPlayer = {
    id: 'test_player_new',
    displayName: 'Test Newbie',
    level: 1,
    xp: 0,
    totalBlocksClaimed: 0,
    gold: 0,
  };

  // Find a neutral block in Mumbai
  const neutralBlock = MOCK_BLOCKS.find(
    (block) =>
      block.ownerType === 'neutral' &&
      Math.abs(block.coordinates.latitude - SAMPLE_CITIES.MUMBAI.center.latitude) < 0.01
  );

  if (!neutralBlock) {
    console.log('❌ No neutral blocks found');
    return;
  }

  console.log('📍 Player Location:', SAMPLE_CITIES.MUMBAI.center);
  console.log('🎯 Target Block:', neutralBlock.id);
  console.log('📊 Block Status:', neutralBlock.ownerType);

  // Check if can claim
  const claimCheck = canClaimBlock(neutralBlock, newPlayer.id);
  console.log('\n✅ Can Claim:', claimCheck.canClaim);
  console.log('💡 Reason:', claimCheck.reason || 'Neutral block');

  // Simulate claim
  if (claimCheck.canClaim) {
    const claimResult = {
      success: true,
      blockId: neutralBlock.id,
      rewards: {
        xp: RESOURCE_GENERATION_RATES.BASE_XP_PER_CLAIM,
        gold: RESOURCE_GENERATION_RATES.BASE_GOLD_PER_CLAIM,
      },
      newStats: {
        xp: newPlayer.xp + RESOURCE_GENERATION_RATES.BASE_XP_PER_CLAIM,
        gold: newPlayer.gold + RESOURCE_GENERATION_RATES.BASE_GOLD_PER_CLAIM,
        totalBlocksClaimed: newPlayer.totalBlocksClaimed + 1,
      },
    };

    console.log('\n🎉 CLAIM SUCCESSFUL!');
    console.log('💰 Rewards:', claimResult.rewards);
    console.log('📈 New Stats:', claimResult.newStats);
    console.log('🏆 Achievement Unlocked: First Steps (Claim your first block)');

    return claimResult;
  }

  return null;
}

// ============================================================================
// TEST SCENARIO 2: Player Gaining 100 XP and Leveling Up
// ============================================================================

export function testScenario_PlayerLevelUp() {
  console.log('\n⭐ TEST SCENARIO 2: Player Gaining 100 XP and Leveling Up\n');

  const player = {
    id: 'test_player_levelup',
    displayName: 'Test Leveler',
    level: 1,
    xp: 50, // Currently at 50 XP (needs 50 more to level up)
    gold: 100,
  };

  console.log('👤 Starting Stats:');
  console.log('  Level:', player.level);
  console.log('  XP:', player.xp);
  console.log('  Gold:', player.gold);

  const xpToNextLevel = getXPToNextLevel(player.xp);
  console.log('  XP to Next Level:', xpToNextLevel);

  // Simulate claiming 2 blocks (50 XP each = 100 XP total)
  console.log('\n🎯 Claiming 2 blocks...');
  
  const claims = [];
  for (let i = 0; i < 2; i++) {
    const xpGain = RESOURCE_GENERATION_RATES.BASE_XP_PER_CLAIM;
    const goldGain = RESOURCE_GENERATION_RATES.BASE_GOLD_PER_CLAIM;
    
    player.xp += xpGain;
    player.gold += goldGain;

    claims.push({
      blockNumber: i + 1,
      xpGained: xpGain,
      goldGained: goldGain,
      currentXP: player.xp,
    });

    console.log(`  Block ${i + 1}: +${xpGain} XP, +${goldGain} Gold (Total XP: ${player.xp})`);
  }

  // Check if leveled up
  const newLevel = getLevelFromXP(player.xp);
  const didLevelUp = newLevel > player.level;

  if (didLevelUp) {
    const levelData = LEVEL_PROGRESSION[newLevel - 1];
    player.level = newLevel;

    console.log('\n🎊 LEVEL UP!!!');
    console.log('  New Level:', player.level);
    console.log('  Total XP:', player.xp);
    console.log('  XP to Next Level:', getXPToNextLevel(player.xp));
    console.log('  Level Up Rewards:', levelData.rewards);
    console.log('  🎉 Visual Effect: Show level up animation');
    console.log('  🔊 Sound Effect: Play level up sound');

    return {
      success: true,
      leveledUp: true,
      oldLevel: 1,
      newLevel: player.level,
      rewards: levelData.rewards,
      finalStats: player,
      claims,
    };
  }

  console.log('\n📊 Final Stats (No Level Up):');
  console.log('  Level:', player.level);
  console.log('  XP:', player.xp);
  console.log('  Gold:', player.gold);

  return {
    success: true,
    leveledUp: false,
    finalStats: player,
    claims,
  };
}

// ============================================================================
// TEST SCENARIO 3: Reclaiming Own Block (Refresh Timer)
// ============================================================================

export function testScenario_ReclaimOwnBlock() {
  console.log('\n🔄 TEST SCENARIO 3: Reclaiming Own Block (Refresh Timer)\n');

  const player = MOCK_PLAYERS[1]; // Bob Explorer
  const now = Date.now();

  // Find a block owned by this player that's been owned for 10 hours
  const ownBlock = {
    id: '40.7128_-74.0060',
    coordinates: { latitude: 40.7128, longitude: -74.006 },
    gridX: 0,
    gridY: 0,
    ownerId: player.id,
    ownerType: 'user' as const,
    claimedAt: new Date(now - 10 * 60 * 60 * 1000).toISOString(), // 10 hours ago
    expiresAt: new Date(now + 14 * 60 * 60 * 1000).toISOString(), // Expires in 14 hours
    level: 2,
  };

  console.log('👤 Player:', player.displayName);
  console.log('📍 Block ID:', ownBlock.id);
  console.log('⏰ Claimed:', new Date(ownBlock.claimedAt).toLocaleString());
  console.log('⏰ Expires:', new Date(ownBlock.expiresAt).toLocaleString());

  const hoursOwned = (now - new Date(ownBlock.claimedAt).getTime()) / (1000 * 60 * 60);
  const hoursUntilExpiry = (new Date(ownBlock.expiresAt).getTime() - now) / (1000 * 60 * 60);

  console.log(`📊 Ownership: ${hoursOwned.toFixed(1)} hours (${hoursUntilExpiry.toFixed(1)} hours left)`);

  // Check if can reclaim
  const claimCheck = canClaimBlock(ownBlock, player.id);
  console.log('\n✅ Can Reclaim:', claimCheck.canClaim);
  console.log('💡 Reason:', claimCheck.reason);

  if (claimCheck.canClaim) {
    const reclaimResult = {
      success: true,
      blockId: ownBlock.id,
      action: 'refresh_ownership',
      newExpiresAt: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
      rewards: {
        xp: RESOURCE_GENERATION_RATES.BASE_XP_PER_CLAIM,
        gold: RESOURCE_GENERATION_RATES.BASE_GOLD_PER_CLAIM,
      },
    };

    console.log('\n✅ OWNERSHIP REFRESHED!');
    console.log('⏰ New Expiration:', new Date(reclaimResult.newExpiresAt).toLocaleString());
    console.log('💰 Rewards:', reclaimResult.rewards);
    console.log('💡 Benefit: Keep your territory secure!');

    return reclaimResult;
  }

  return null;
}

// ============================================================================
// TEST SCENARIO 4: Enemy Block Within Grace Period (Cannot Claim)
// ============================================================================

export function testScenario_EnemyBlockGracePeriod() {
  console.log('\n⚔️ TEST SCENARIO 4: Enemy Block Within Grace Period\n');

  const player = MOCK_PLAYERS[0]; // Alice Walker
  const enemyPlayer = MOCK_PLAYERS[2]; // Charlie Conqueror
  const now = Date.now();

  // Enemy block that expired 30 minutes ago (within 1-hour grace period)
  const enemyBlock = {
    id: '40.7130_-74.0060',
    coordinates: { latitude: 40.713, longitude: -74.006 },
    gridX: 1,
    gridY: 0,
    ownerId: enemyPlayer.id,
    ownerType: 'user' as const,
    claimedAt: new Date(now - 24.5 * 60 * 60 * 1000).toISOString(), // 24.5 hours ago
    expiresAt: new Date(now - 0.5 * 60 * 60 * 1000).toISOString(), // Expired 30 min ago
    level: 3,
  };

  console.log('👤 Attempting Player:', player.displayName);
  console.log('🛡️ Current Owner:', enemyPlayer.displayName);
  console.log('📍 Block ID:', enemyBlock.id);
  console.log('⏰ Claimed:', new Date(enemyBlock.claimedAt).toLocaleString());
  console.log('⏰ Expired:', new Date(enemyBlock.expiresAt).toLocaleString());

  const minutesSinceExpiry = (now - new Date(enemyBlock.expiresAt).getTime()) / (1000 * 60);
  const minutesLeftInGrace = OWNERSHIP_CONFIG.GRACE_PERIOD_HOURS * 60 - minutesSinceExpiry;

  console.log(`⏱️ Grace Period: ${minutesSinceExpiry.toFixed(0)} / ${OWNERSHIP_CONFIG.GRACE_PERIOD_HOURS * 60} minutes`);
  console.log(`⏱️ Time Left in Grace: ${minutesLeftInGrace.toFixed(0)} minutes`);

  // Check if can claim
  const claimCheck = canClaimBlock(enemyBlock, player.id);
  console.log('\n✅ Can Claim:', claimCheck.canClaim);
  console.log('💡 Reason:', claimCheck.reason);

  if (claimCheck.canClaim) {
    console.log('\n🎯 CLAIM AVAILABLE!');
    console.log('💡 Within grace period - enemy block vulnerable!');
    
    return {
      success: true,
      blockId: enemyBlock.id,
      action: 'claim_from_enemy',
      previousOwner: enemyPlayer.displayName,
      rewards: {
        xp: RESOURCE_GENERATION_RATES.BASE_XP_PER_CLAIM,
        gold: RESOURCE_GENERATION_RATES.BASE_GOLD_PER_CLAIM,
      },
    };
  } else {
    console.log('\n❌ CANNOT CLAIM');
    console.log('⏰ Wait until grace period ends');
    console.log(`⏱️ Try again in ${minutesLeftInGrace.toFixed(0)} minutes`);
    
    return {
      success: false,
      reason: claimCheck.reason,
      minutesUntilAvailable: Math.ceil(minutesLeftInGrace),
    };
  }
}

// ============================================================================
// TEST SCENARIO 5: Resource Generation Calculation
// ============================================================================

export function testScenario_ResourceGeneration() {
  console.log('\n💰 TEST SCENARIO 5: Resource Generation Calculation\n');

  const player = MOCK_PLAYERS[2]; // Charlie Conqueror
  const ownedBlocks = MOCK_BLOCKS.filter((block) => block.ownerId === player.id).slice(0, 5);

  const lastCollectionTime = Date.now() - 3.5 * 60 * 60 * 1000; // 3.5 hours ago

  console.log('👤 Player:', player.displayName);
  console.log('🏘️ Owned Blocks:', ownedBlocks.length);
  console.log('⏰ Last Collection:', new Date(lastCollectionTime).toLocaleString());
  console.log('⏰ Current Time:', new Date().toLocaleString());
  console.log('⏱️ Time Elapsed: 3.5 hours');

  console.log('\n📊 Generation Rates:');
  console.log(`  Gold: ${RESOURCE_GENERATION_RATES.GOLD_PER_BLOCK_PER_HOUR} per block per hour`);
  console.log(`  Mana: ${RESOURCE_GENERATION_RATES.MANA_PER_BLOCK_PER_HOUR} per block per hour`);
  console.log(`  Health: ${RESOURCE_GENERATION_RATES.HEALTH_REGEN_PER_HOUR} per hour`);

  // Calculate resources
  const resources = calculateResourceGeneration(ownedBlocks, lastCollectionTime);

  console.log('\n💎 RESOURCES GENERATED:');
  console.log(`  Gold: ${resources.gold} 💰`);
  console.log(`  Mana: ${resources.mana} ✨`);
  console.log(`  Health: ${resources.health} ❤️`);

  console.log('\n📐 Calculation:');
  console.log(`  Gold = ${ownedBlocks.length} blocks × ${RESOURCE_GENERATION_RATES.GOLD_PER_BLOCK_PER_HOUR} × 3.5 hours = ${resources.gold}`);
  console.log(`  Mana = ${ownedBlocks.length} blocks × ${RESOURCE_GENERATION_RATES.MANA_PER_BLOCK_PER_HOUR} × 3.5 hours = ${resources.mana}`);
  console.log(`  Health = ${RESOURCE_GENERATION_RATES.HEALTH_REGEN_PER_HOUR} × 3.5 hours = ${resources.health}`);

  console.log('\n💡 Tip: Collect resources regularly to maximize gains!');

  return {
    success: true,
    player: player.displayName,
    blocksOwned: ownedBlocks.length,
    hoursElapsed: 3.5,
    resources,
    calculations: {
      goldPerHour: ownedBlocks.length * RESOURCE_GENERATION_RATES.GOLD_PER_BLOCK_PER_HOUR,
      manaPerHour: ownedBlocks.length * RESOURCE_GENERATION_RATES.MANA_PER_BLOCK_PER_HOUR,
      healthPerHour: RESOURCE_GENERATION_RATES.HEALTH_REGEN_PER_HOUR,
    },
  };
}

// ============================================================================
// RUN ALL TEST SCENARIOS
// ============================================================================

export function runAllTestScenarios() {
  console.log('🧪 RUNNING ALL TEST SCENARIOS FOR REALM WALKER MVP\n');
  console.log('='.repeat(80));

  const results = {
    scenario1: testScenario_NewPlayerFirstClaim(),
    scenario2: testScenario_PlayerLevelUp(),
    scenario3: testScenario_ReclaimOwnBlock(),
    scenario4: testScenario_EnemyBlockGracePeriod(),
    scenario5: testScenario_ResourceGeneration(),
  };

  console.log('\n' + '='.repeat(80));
  console.log('✅ ALL TEST SCENARIOS COMPLETED\n');

  return results;
}

// ============================================================================
// HELPER: Simulate GPS Movement
// ============================================================================

export function simulateGPSMovement(startLat: number, startLon: number, steps: number = 5) {
  console.log('\n📍 SIMULATING GPS MOVEMENT\n');

  const GRID_SIZE_DEGREES = 0.0002; // ~20 meters
  const positions = [];

  for (let i = 0; i <= steps; i++) {
    const lat = startLat + i * GRID_SIZE_DEGREES;
    const lon = startLon + i * GRID_SIZE_DEGREES;
    const blockId = `${lat.toFixed(4)}_${lon.toFixed(4)}`;

    positions.push({
      step: i,
      latitude: lat,
      longitude: lon,
      blockId,
      distance: i * 20, // meters
    });

    console.log(`Step ${i}: (${lat.toFixed(4)}, ${lon.toFixed(4)}) - Block: ${blockId} - Distance: ${i * 20}m`);
  }

  console.log(`\n✅ Simulated ${steps + 1} GPS positions over ${steps * 20} meters`);

  return positions;
}

// ============================================================================
// HELPER: Test Auto-Claim Flow
// ============================================================================

export function testAutoClaimFlow() {
  console.log('\n🤖 TESTING AUTO-CLAIM FLOW\n');

  const player = MOCK_PLAYERS[0];
  const startPosition = SAMPLE_CITIES.MUMBAI.center;

  console.log('👤 Player:', player.displayName);
  console.log('📍 Starting Position:', startPosition);

  // Simulate walking 5 blocks (100 meters)
  const positions = simulateGPSMovement(startPosition.latitude, startPosition.longitude, 5);

  console.log('\n🎯 AUTO-CLAIM SIMULATION:');

  positions.forEach((pos, index) => {
    if (index === 0) {
      console.log(`\nPosition ${index}: Initial position - no claim`);
      return;
    }

    console.log(`\nPosition ${index}: Entered new block ${pos.blockId}`);
    console.log('  ⏱️ GPS Stabilization: Waiting 2 seconds...');
    console.log('  🔍 Checking ownership...');
    
    // Check if block can be claimed (simplified)
    const canClaim = true; // Assume neutral
    
    if (canClaim) {
      console.log('  ✅ Block is neutral - attempting claim...');
      console.log(`  🎉 SUCCESS! Claimed ${pos.blockId}`);
      console.log(`  💰 Rewards: +${RESOURCE_GENERATION_RATES.BASE_XP_PER_CLAIM} XP, +${RESOURCE_GENERATION_RATES.BASE_GOLD_PER_CLAIM} Gold`);
      console.log('  📲 Notification: "Territory claimed! +50 XP, +10 Gold"');
    } else {
      console.log('  ⏭️ Skip: Block already owned');
    }
  });

  console.log('\n✅ Auto-claim flow simulation complete');
  console.log(`📊 Total blocks claimed: ${positions.length - 1}`);
  console.log(`📊 Total XP gained: ${(positions.length - 1) * RESOURCE_GENERATION_RATES.BASE_XP_PER_CLAIM}`);
  console.log(`📊 Total Gold gained: ${(positions.length - 1) * RESOURCE_GENERATION_RATES.BASE_GOLD_PER_CLAIM}`);
}

export default {
  testScenario_NewPlayerFirstClaim,
  testScenario_PlayerLevelUp,
  testScenario_ReclaimOwnBlock,
  testScenario_EnemyBlockGracePeriod,
  testScenario_ResourceGeneration,
  runAllTestScenarios,
  simulateGPSMovement,
  testAutoClaimFlow,
};
