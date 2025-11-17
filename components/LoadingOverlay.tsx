/**
 * LoadingOverlay Component
 * 
 * Displays a loading spinner overlay with customizable message.
 * Used during async operations like GPS requests, API calls, block claiming.
 * 
 * @example
 * <LoadingOverlay visible={loading} message="Claiming block..." />
 */

import React from 'react';
import {
    ActivityIndicator,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface LoadingOverlayProps {
  /** Whether the overlay is visible */
  visible: boolean;
  /** Loading message to display */
  message?: string;
  /** Allow cancellation (shows cancel button) */
  cancelable?: boolean;
  /** Callback when cancel button is pressed */
  onCancel?: () => void;
  /** Overlay transparency (0-1) */
  opacity?: number;
  /** Spinner size */
  size?: 'small' | 'large';
  /** Spinner color */
  color?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Loading...',
  cancelable = false,
  onCancel,
  opacity = 0.8,
  size = 'large',
  color = '#3b82f6',
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <Pressable
        style={[styles.overlay, { backgroundColor: `rgba(0, 0, 0, ${opacity})` }]}
        onPress={cancelable ? onCancel : undefined}
        disabled={!cancelable}
      >
        <View style={styles.container}>
          <View style={styles.content}>
            <ActivityIndicator size={size} color={color} />
            {message && <Text style={styles.message}>{message}</Text>}
            {cancelable && onCancel && (
              <Pressable style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    maxWidth: 300,
  },
  content: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500',
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  cancelText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  spinnerContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerInline: {
    flexDirection: 'row',
    padding: 8,
  },
  spinnerMessage: {
    marginTop: 8,
    marginLeft: 8,
    fontSize: 14,
    color: '#6b7280',
  },
});

/**
 * LoadingSpinner Component
 * 
 * Inline loading spinner for smaller UI elements.
 * 
 * @example
 * <LoadingSpinner size="small" message="Loading..." />
 */

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  inline?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'small',
  color = '#3b82f6',
  message,
  inline = false,
}) => {
  return (
    <View style={[styles.spinnerContainer, inline && styles.spinnerInline]}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.spinnerMessage}>{message}</Text>}
    </View>
  );
};
