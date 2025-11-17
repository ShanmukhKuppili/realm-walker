/**
 * Error Handling Integration Example
 * 
 * Complete example showing how to integrate all error handling
 * and loading UI components in a real screen.
 */

import { EmptyState, ErrorMessage, PermissionError } from '@/components/ErrorMessage';
import { LoadingOverlay, LoadingSpinner } from '@/components/LoadingOverlay';
import { useToast } from '@/components/Toast';
import { useAsyncCallback, useAsyncError } from '@/hooks/useAsyncError';
import { logError } from '@/utils/errorUtils';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type BlockData = { id: string; latitude: number; longitude: number; ownerId?: string };

export default function ErrorHandlingExampleScreen() {
  const [permissionStatus, setPermissionStatus] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const { showToast } = useToast();

  // Example 1: GPS Permission Request with Loading & Error Handling
  const {
    execute: requestPermission,
    loading: permissionLoading,
  } = useAsyncError(
    async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status;
    },
    {
      showSuccessToast: true,
      successMessage: '✅ GPS permission granted',
      showErrorToast: true,
      onSuccess: (status) => {
        setPermissionStatus(status === 'granted' ? 'granted' : 'denied');
      },
      onError: (error) => {
        logError(error, 'ErrorHandlingExampleScreen.requestPermission');
        setPermissionStatus('denied');
      },
    }
  );

  // Example 2: Fetch Blocks with Auto-Retry (Simplified Mock)
  const {
    execute: fetchBlocks,
    loading: blocksLoading,
    error: blocksError,
    retry: retryFetchBlocks,
  } = useAsyncError(
    async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockBlocks: BlockData[] = [
        { id: '40.7128_-74.0060', latitude: 40.7128, longitude: -74.0060 },
        { id: '40.7130_-74.0058', latitude: 40.7130, longitude: -74.0058 },
        { id: '40.7132_-74.0056', latitude: 40.7132, longitude: -74.0056 },
      ];
      
      return mockBlocks;
    },
    {
      showErrorToast: true,
      retryAttempts: 3,
      retryDelay: 1000,
      onSuccess: (data) => {
        setBlocks(data);
      },
      onError: (error) => {
        logError(error, 'ErrorHandlingExampleScreen.fetchBlocks');
      },
    }
  );

  // Example 3: Claim Block with Loading & Success Toast
  const [claimBlock, { loading: claimingBlock }] = useAsyncCallback(
    async (blockId: string) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update block ownership locally
      setBlocks(prev => 
        prev.map(block => 
          block.id === blockId 
            ? { ...block, ownerId: 'current-user' }
            : block
        )
      );
    },
    {
      showSuccessToast: true,
      successMessage: '🏆 Territory claimed! +50 XP',
      showErrorToast: true,
    }
  );

  // Example 4: Collect Resources
  const [collectResources, { loading: collectingResources, error: collectError, retry: retryCollect }] = useAsyncCallback(
    async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock resource collection
      const resources = { gold: 87, mana: 52, health: 35 };
      showToast(`💰 Collected: ${resources.gold} gold, ${resources.mana} mana`, 'success');
    },
    {
      showErrorToast: true,
    }
  );

  // Request permission on mount
  useEffect(() => {
    requestPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch blocks when permission granted
  useEffect(() => {
    if (permissionStatus === 'granted') {
      fetchBlocks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissionStatus]);

  // Permission denied state
  if (permissionStatus === 'denied') {
    return (
      <PermissionError
        type="location"
        onRetry={requestPermission}
        onOpenSettings={() => Linking.openSettings()}
      />
    );
  }

  // Permission loading state
  if (permissionLoading) {
    return (
      <LoadingOverlay
        visible
        message="Requesting GPS permission..."
        cancelable={false}
      />
    );
  }

  // Main content
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <Text style={styles.title}>Error Handling Example</Text>
        <Text style={styles.subtitle}>
          Demonstrates loading indicators, error messages, and toast notifications
        </Text>

        {/* Blocks Loading Error */}
        {blocksError && (
          <ErrorMessage
            error={blocksError}
            onRetry={retryFetchBlocks}
            context="loading blocks"
          />
        )}

        {/* Empty State */}
        {!blocksLoading && !blocksError && blocks.length === 0 && (
          <EmptyState
            icon="🗺️"
            title="No blocks nearby"
            message="Walk around to discover territories"
            action={{
              label: "Refresh",
              onPress: () => fetchBlocks(),
            }}
          />
        )}

        {/* Blocks List */}
        {blocksLoading ? (
          <LoadingSpinner size="large" message="Loading blocks..." />
        ) : (
          <View style={styles.blocksList}>
            {blocks.map((block) => (
              <View key={block.id} style={styles.blockCard}>
                <Text style={styles.blockId}>Block: {block.id}</Text>
                <Text style={styles.blockCoords}>
                  {block.latitude.toFixed(4)}, {block.longitude.toFixed(4)}
                </Text>
                <Pressable
                  style={[styles.claimButton, claimingBlock && styles.claimButtonDisabled]}
                  onPress={() => claimBlock(block.id)}
                  disabled={claimingBlock}
                >
                  {claimingBlock ? (
                    <LoadingSpinner size="small" inline color="#ffffff" />
                  ) : (
                    <Text style={styles.claimButtonText}>Claim Block</Text>
                  )}
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* Resource Collection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>
          <Pressable
            style={[styles.collectButton, collectingResources && styles.collectButtonDisabled]}
            onPress={collectResources}
            disabled={collectingResources}
          >
            {collectingResources ? (
              <LoadingSpinner size="small" inline color="#ffffff" />
            ) : (
              <Text style={styles.collectButtonText}>Collect Resources</Text>
            )}
          </Pressable>
          
          {collectError && (
            <ErrorMessage
              error={collectError}
              onRetry={retryCollect}
              context="collecting resources"
              compact
            />
          )}
        </View>

        {/* Test Toasts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Toast Notifications</Text>
          <View style={styles.toastButtons}>
            <Pressable
              style={[styles.toastButton, { backgroundColor: '#10b981' }]}
              onPress={() => showToast('Success message!', 'success')}
            >
              <Text style={styles.toastButtonText}>Success</Text>
            </Pressable>
            <Pressable
              style={[styles.toastButton, { backgroundColor: '#ef4444' }]}
              onPress={() => showToast('Error message!', 'error')}
            >
              <Text style={styles.toastButtonText}>Error</Text>
            </Pressable>
            <Pressable
              style={[styles.toastButton, { backgroundColor: '#f59e0b' }]}
              onPress={() => showToast('Warning message!', 'warning')}
            >
              <Text style={styles.toastButtonText}>Warning</Text>
            </Pressable>
            <Pressable
              style={[styles.toastButton, { backgroundColor: '#3b82f6' }]}
              onPress={() => showToast('Info message!', 'info')}
            >
              <Text style={styles.toastButtonText}>Info</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    padding: 16,
    paddingBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  blocksList: {
    padding: 16,
  },
  blockCard: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  blockId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  blockCoords: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  claimButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  claimButtonDisabled: {
    opacity: 0.6,
  },
  claimButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  collectButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  collectButtonDisabled: {
    opacity: 0.6,
  },
  collectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  toastButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  toastButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  toastButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
