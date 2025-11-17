/**
 * ErrorMessage Component
 * 
 * Displays error messages with retry button and contextual information.
 * Used for inline error display in screens and forms.
 * 
 * @example
 * <ErrorMessage 
 *   error={error} 
 *   onRetry={handleRetry}
 *   context="claiming block"
 * />
 */

import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

interface ErrorMessageProps {
  /** Error object or message string */
  error: Error | string | null;
  /** Retry callback */
  onRetry?: () => void;
  /** Context for the error (e.g., "claiming block") */
  context?: string;
  /** Show retry button */
  showRetry?: boolean;
  /** Custom retry button text */
  retryText?: string;
  /** Error icon */
  icon?: string;
  /** Compact mode (smaller UI) */
  compact?: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  onRetry,
  context,
  showRetry = true,
  retryText = 'Try Again',
  icon = '❌',
  compact = false,
}) => {
  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error.message;
  const title = context ? `Error ${context}` : 'Error';

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Text style={styles.compactMessage}>
          {icon} {errorMessage}
        </Text>
        {showRetry && onRetry && (
          <Pressable style={styles.compactRetryButton} onPress={onRetry}>
            <Text style={styles.compactRetryText}>Retry</Text>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{errorMessage}</Text>
        {showRetry && onRetry && (
          <Pressable style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryButtonText}>{retryText}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  iconContainer: {
    marginRight: 12,
  },
  icon: {
    fontSize: 32,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#991b1b',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#dc2626',
    lineHeight: 20,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
  },
  compactMessage: {
    flex: 1,
    fontSize: 14,
    color: '#dc2626',
    marginRight: 8,
  },
  compactRetryButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  compactRetryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});

/**
 * EmptyState Component
 * 
 * Displays an empty state with icon and message.
 * Used when no data is available.
 * 
 * @example
 * <EmptyState 
 *   icon="🗺️"
 *   title="No blocks claimed"
 *   message="Start walking to claim your first territory!"
 * />
 */

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title,
  message,
  action,
}) => {
  return (
    <View style={emptyStyles.container}>
      <Text style={emptyStyles.icon}>{icon}</Text>
      <Text style={emptyStyles.title}>{title}</Text>
      {message && <Text style={emptyStyles.message}>{message}</Text>}
      {action && (
        <Pressable style={emptyStyles.actionButton} onPress={action.onPress}>
          <Text style={emptyStyles.actionButtonText}>{action.label}</Text>
        </Pressable>
      )}
    </View>
  );
};

const emptyStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

/**
 * PermissionError Component
 * 
 * Specialized error component for permission-related errors.
 * Provides contextual guidance for enabling permissions.
 * 
 * @example
 * <PermissionError 
 *   type="location"
 *   onRetry={requestLocationPermission}
 * />
 */

interface PermissionErrorProps {
  type: 'location' | 'notification' | 'camera' | 'storage';
  onRetry?: () => void;
  onOpenSettings?: () => void;
}

export const PermissionError: React.FC<PermissionErrorProps> = ({
  type,
  onRetry,
  onOpenSettings,
}) => {
  const permissionInfo = getPermissionInfo(type);

  return (
    <View style={permissionStyles.container}>
      <Text style={permissionStyles.icon}>{permissionInfo.icon}</Text>
      <Text style={permissionStyles.title}>{permissionInfo.title}</Text>
      <Text style={permissionStyles.message}>{permissionInfo.message}</Text>
      
      <View style={permissionStyles.instructions}>
        <Text style={permissionStyles.instructionsTitle}>How to enable:</Text>
        {permissionInfo.steps.map((step, index) => (
          <Text key={index} style={permissionStyles.instructionStep}>
            {index + 1}. {step}
          </Text>
        ))}
      </View>

      {onRetry && (
        <Pressable style={permissionStyles.retryButton} onPress={onRetry}>
          <Text style={permissionStyles.retryButtonText}>Grant Permission</Text>
        </Pressable>
      )}

      {onOpenSettings && (
        <Pressable style={permissionStyles.settingsButton} onPress={onOpenSettings}>
          <Text style={permissionStyles.settingsButtonText}>Open Settings</Text>
        </Pressable>
      )}
    </View>
  );
};

const getPermissionInfo = (type: string) => {
  const platform = Platform.OS === 'ios' ? 'iOS' : 'Android';

  const info: Record<string, { icon: string; title: string; message: string; steps: string[] }> = {
    location: {
      icon: '📍',
      title: 'Location Permission Required',
      message: 'Realm Walker needs access to your location to track your walking and claim territories.',
      steps:
        platform === 'iOS'
          ? [
              'Open Settings app',
              'Tap Privacy > Location Services',
              'Find Realm Walker',
              'Select "Always" or "While Using the App"',
            ]
          : [
              'Open Settings app',
              'Tap Apps > Realm Walker',
              'Tap Permissions > Location',
              'Select "Allow all the time"',
            ],
    },
    notification: {
      icon: '🔔',
      title: 'Notification Permission Required',
      message: 'Enable notifications to receive updates about territory claims and resources.',
      steps:
        platform === 'iOS'
          ? [
              'Open Settings app',
              'Tap Notifications',
              'Find Realm Walker',
              'Enable "Allow Notifications"',
            ]
          : [
              'Open Settings app',
              'Tap Apps > Realm Walker',
              'Tap Notifications',
              'Enable notifications',
            ],
    },
    camera: {
      icon: '📷',
      title: 'Camera Permission Required',
      message: 'Camera access is needed for this feature.',
      steps:
        platform === 'iOS'
          ? ['Open Settings app', 'Tap Privacy > Camera', 'Enable Realm Walker']
          : ['Open Settings app', 'Tap Apps > Realm Walker', 'Tap Permissions > Camera', 'Allow'],
    },
    storage: {
      icon: '💾',
      title: 'Storage Permission Required',
      message: 'Storage access is needed to save data.',
      steps:
        platform === 'iOS'
          ? ['Open Settings app', 'Tap Privacy > Files', 'Enable Realm Walker']
          : ['Open Settings app', 'Tap Apps > Realm Walker', 'Tap Permissions > Storage', 'Allow'],
    },
  };

  return info[type] || info.location;
};

const permissionStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  instructions: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  instructionStep: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 22,
    marginBottom: 6,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  settingsButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});
