/**
 * Settings Screen
 * App settings and preferences
 */
import { useAppDispatch, useAppSelector } from '@/store';
import { signOutUser } from '@/store/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SettingsScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const userStats = useAppSelector((state) => state.user.user);
  
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [backgroundTracking, setBackgroundTracking] = useState(true);
  const [autoClaimEnabled, setAutoClaimEnabled] = useState(true);
  const [mapStyle, setMapStyle] = useState<'standard' | 'satellite' | 'hybrid'>('standard');

  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear all cached data? This will not delete your account or progress.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'cached_blocks',
                'cached_user_data',
                'cached_guilds',
              ]);
              Alert.alert('Success', 'Cache cleared successfully');
            } catch {
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(signOutUser()).unwrap();
            } catch {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Info', 'Account deletion will be available in a future update');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your Realm Walker experience</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Email</Text>
              <Text style={styles.settingValue}>{user?.email || 'Not logged in'}</Text>
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>User ID</Text>
              <Text style={styles.settingValue}>{user?.id.substring(0, 8) || 'N/A'}...</Text>
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Level</Text>
              <Text style={styles.settingValue}>Level {userStats?.level || 1}</Text>
            </View>
            <View style={[styles.settingRow, styles.noBorder]}>
              <Text style={styles.settingLabel}>Total XP</Text>
              <Text style={styles.settingValue}>{userStats?.xp || 0}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gameplay</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLabelContainer}>
                <Text style={styles.settingLabel}>Auto-Claim Blocks</Text>
                <Text style={styles.settingDescription}>Automatically claim blocks when you enter them</Text>
              </View>
              <Switch
                value={autoClaimEnabled}
                onValueChange={setAutoClaimEnabled}
                trackColor={{ false: '#ccc', true: '#4CAF50' }}
              />
            </View>
            <View style={[styles.settingRow, styles.noBorder]}>
              <Text style={styles.settingLabel}>Sound Effects</Text>
              <Switch
                value={soundEffects}
                onValueChange={setSoundEffects}
                trackColor={{ false: '#ccc', true: '#4CAF50' }}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.card}>
            <View style={[styles.settingRow, styles.noBorder]}>
              <View style={styles.settingLabelContainer}>
                <Text style={styles.settingLabel}>Push Notifications</Text>
                <Text style={styles.settingDescription}>Get notified about claims and attacks</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#ccc', true: '#4CAF50' }}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.card}>
            <View style={[styles.settingRow, styles.noBorder]}>
              <View style={styles.settingLabelContainer}>
                <Text style={styles.settingLabel}>Background Tracking</Text>
                <Text style={styles.settingDescription}>Track location when app is in background</Text>
              </View>
              <Switch
                value={backgroundTracking}
                onValueChange={setBackgroundTracking}
                trackColor={{ false: '#ccc', true: '#4CAF50' }}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Map</Text>
          <View style={styles.card}>
            <Text style={styles.settingLabel}>Map Style</Text>
            <View style={styles.mapStyleButtons}>
              {(['standard', 'satellite', 'hybrid'] as const).map((style) => (
                <TouchableOpacity
                  key={style}
                  style={[styles.mapStyleButton, mapStyle === style && styles.mapStyleButtonActive]}
                  onPress={() => setMapStyle(style)}
                >
                  <Text style={[styles.mapStyleButtonText, mapStyle === style && styles.mapStyleButtonTextActive]}>
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <View style={styles.card}>
            <TouchableOpacity style={[styles.actionRow, styles.noBorder]} onPress={handleClearCache}>
              <Text style={styles.actionText}>Clear Cache</Text>
              <Text style={styles.actionIcon}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          <View style={styles.card}>
            <TouchableOpacity style={[styles.actionRow, styles.noBorder]} onPress={handleLogout}>
              <Text style={[styles.actionText, styles.logoutText]}>Logout</Text>
              <Text style={styles.actionIcon}>→</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.card, styles.dangerCard]}>
            <TouchableOpacity style={[styles.actionRow, styles.noBorder]} onPress={handleDeleteAccount}>
              <Text style={[styles.actionText, styles.dangerText]}>Delete Account</Text>
              <Text style={styles.actionIcon}>⚠️</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Version</Text>
              <Text style={styles.settingValue}>1.0.0</Text>
            </View>
            <View style={[styles.settingRow, styles.noBorder]}>
              <Text style={styles.settingLabel}>Build</Text>
              <Text style={styles.settingValue}>1</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Realm Walker</Text>
          <Text style={styles.footerSubtext}>Turn walking into an adventure</Text>
          <Text style={styles.footerCopyright}>© 2024 Realm Walker</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent: { padding: 16, paddingBottom: 32 },
  header: { marginBottom: 24 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, marginBottom: 8 },
  dangerCard: { borderWidth: 1, borderColor: '#ff4444' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  noBorder: { borderBottomWidth: 0 },
  settingLabelContainer: { flex: 1, marginRight: 16 },
  settingLabel: { fontSize: 16, color: '#333', marginBottom: 2 },
  settingDescription: { fontSize: 12, color: '#666' },
  settingValue: { fontSize: 14, color: '#666' },
  mapStyleButtons: { flexDirection: 'row', gap: 8, marginTop: 12 },
  mapStyleButton: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  mapStyleButtonActive: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
  mapStyleButtonText: { fontSize: 14, color: '#666' },
  mapStyleButtonTextActive: { color: '#fff', fontWeight: '600' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  actionText: { fontSize: 16, color: '#2196F3' },
  logoutText: { color: '#ff9800' },
  dangerText: { color: '#ff4444', fontWeight: '600' },
  actionIcon: { fontSize: 20, color: '#ccc' },
  footer: { alignItems: 'center', marginTop: 32, marginBottom: 20 },
  footerText: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 4 },
  footerSubtext: { fontSize: 14, color: '#666', marginBottom: 8 },
  footerCopyright: { fontSize: 12, color: '#999' },
});
