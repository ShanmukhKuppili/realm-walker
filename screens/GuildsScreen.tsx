/**
 * Guilds Screen
 * Browse and join guilds, view guild info and members
 */
import { useAppDispatch, useAppSelector } from '@/store';
import { setCurrentGuild, setGuilds } from '@/store/slices/guildSlice';
import { Guild } from '@/types';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function GuildsScreen() {
  const dispatch = useAppDispatch();
  const currentGuild = useAppSelector((state) => state.guild.currentGuild);
  const guilds = useAppSelector((state) => state.guild.guilds);
  const user = useAppSelector((state) => state.user.user);

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGuildName, setNewGuildName] = useState('');
  const [newGuildDescription, setNewGuildDescription] = useState('');

  // Mock guilds data - replace with API call
  useEffect(() => {
    loadGuilds();
  }, []);

  const loadGuilds = () => {
    const mockGuilds: Guild[] = [
      {
        id: 'guild1',
        name: 'Shadow Walkers',
        description: 'Elite territory claimers',
        leaderId: 'user1',
        memberCount: 25,
        totalTerritory: 150,
        level: 5,
        createdAt: new Date().toISOString(),
        color: '#9C27B0',
      },
      {
        id: 'guild2',
        name: 'Realm Defenders',
        description: 'Protecting our territories',
        leaderId: 'user2',
        memberCount: 42,
        totalTerritory: 320,
        level: 8,
        createdAt: new Date().toISOString(),
        color: '#F44336',
      },
      {
        id: 'guild3',
        name: 'Explorer Guild',
        description: 'Discovering new lands',
        leaderId: 'user3',
        memberCount: 18,
        totalTerritory: 95,
        level: 3,
        createdAt: new Date().toISOString(),
        color: '#4CAF50',
      },
    ];
    dispatch(setGuilds(mockGuilds));
  };

  const handleJoinGuild = (guild: Guild) => {
    if (!user) {
      Alert.alert('Error', 'Please log in to join a guild');
      return;
    }

    Alert.alert(
      'Join Guild',
      `Do you want to join ${guild.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Join',
          onPress: () => {
            dispatch(setCurrentGuild(guild));
            Alert.alert('Success', `You joined ${guild.name}!`);
          },
        },
      ]
    );
  };

  const handleLeaveGuild = () => {
    Alert.alert(
      'Leave Guild',
      'Are you sure you want to leave your guild?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            dispatch(setCurrentGuild(null));
            Alert.alert('Success', 'You left the guild');
          },
        },
      ]
    );
  };

  const handleCreateGuild = () => {
    if (!newGuildName.trim()) {
      Alert.alert('Error', 'Please enter a guild name');
      return;
    }

    const newGuild: Guild = {
      id: `guild_${Date.now()}`,
      name: newGuildName,
      description: newGuildDescription,
      leaderId: user?.id || '',
      memberCount: 1,
      totalTerritory: 0,
      level: 1,
      createdAt: new Date().toISOString(),
      color: '#2196F3',
    };

    dispatch(setCurrentGuild(newGuild));
    dispatch(setGuilds([...guilds, newGuild]));
    setShowCreateForm(false);
    setNewGuildName('');
    setNewGuildDescription('');
    Alert.alert('Success', `Guild "${newGuild.name}" created!`);
  };

  const filteredGuilds = guilds.filter((guild) =>
    guild.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (currentGuild) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Current Guild Header */}
          <View style={styles.guildHeader}>
            <View style={[styles.guildBadge, { backgroundColor: currentGuild.color }]}>
              <Text style={styles.guildBadgeText}>{currentGuild.name.charAt(0)}</Text>
            </View>
            <Text style={styles.guildName}>{currentGuild.name}</Text>
            <Text style={styles.guildDescription}>{currentGuild.description}</Text>
          </View>

          {/* Guild Stats */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Guild Stats</Text>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Level</Text>
                <Text style={styles.statValue}>{currentGuild.level}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Members</Text>
                <Text style={styles.statValue}>{currentGuild.memberCount}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Territory</Text>
                <Text style={styles.statValue}>{currentGuild.totalTerritory}</Text>
              </View>
            </View>
          </View>

          {/* Leave Guild Button */}
          <TouchableOpacity style={styles.leaveButton} onPress={handleLeaveGuild}>
            <Text style={styles.leaveButtonText}>Leave Guild</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Guilds</Text>
          <Text style={styles.subtitle}>Join a guild to claim territory together</Text>
        </View>

        {/* Search */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search guilds..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Create Guild Button */}
        {!showCreateForm && (
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateForm(true)}
          >
            <Text style={styles.createButtonText}>+ Create New Guild</Text>
          </TouchableOpacity>
        )}

        {/* Create Guild Form */}
        {showCreateForm && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Create New Guild</Text>
            <TextInput
              style={styles.input}
              placeholder="Guild Name"
              value={newGuildName}
              onChangeText={setNewGuildName}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              value={newGuildDescription}
              onChangeText={setNewGuildDescription}
              multiline
              numberOfLines={3}
            />
            <View style={styles.formButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCreateForm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleCreateGuild}>
                <Text style={styles.submitButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Guild List */}
        <Text style={styles.sectionTitle}>Available Guilds</Text>
        {filteredGuilds.map((guild) => (
          <View key={guild.id} style={styles.guildCard}>
            <View style={styles.guildCardHeader}>
              <View style={[styles.guildIcon, { backgroundColor: guild.color }]}>
                <Text style={styles.guildIconText}>{guild.name.charAt(0)}</Text>
              </View>
              <View style={styles.guildInfo}>
                <Text style={styles.guildCardName}>{guild.name}</Text>
                <Text style={styles.guildCardDescription}>{guild.description}</Text>
              </View>
            </View>
            <View style={styles.guildCardStats}>
              <Text style={styles.guildCardStat}>👥 {guild.memberCount}</Text>
              <Text style={styles.guildCardStat}>📍 {guild.totalTerritory}</Text>
              <Text style={styles.guildCardStat}>⭐ Lvl {guild.level}</Text>
            </View>
            <TouchableOpacity
              style={styles.joinButton}
              onPress={() => handleJoinGuild(guild)}
            >
              <Text style={styles.joinButtonText}>Join Guild</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  createButton: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  guildCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  guildCardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  guildIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  guildIconText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  guildInfo: {
    flex: 1,
  },
  guildCardName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  guildCardDescription: {
    fontSize: 14,
    color: '#666',
  },
  guildCardStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  guildCardStat: {
    fontSize: 14,
    color: '#666',
  },
  joinButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  guildHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20,
  },
  guildBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  guildBadgeText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  guildName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  guildDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  leaveButton: {
    backgroundColor: '#f44336',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  leaveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
