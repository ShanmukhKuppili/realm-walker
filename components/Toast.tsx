/**
 * Toast Notification System
 * 
 * Provides toast notifications for success, error, info, and warning messages.
 * Auto-dismisses after specified duration with swipe-to-dismiss support.
 * 
 * @example
 * showToast('Block claimed!', 'success');
 * showToast('GPS unavailable', 'error');
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    PanResponder,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  icon?: string;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number, icon?: string) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

/**
 * useToast Hook
 * 
 * Access toast notification functions from any component.
 */
export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

/**
 * ToastProvider Component
 * 
 * Wrap your app with this provider to enable toast notifications.
 * 
 * @example
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 3000, icon?: string) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const newToast: Toast = { id, message, type, duration, icon };

      setToasts((prev) => [...prev, newToast]);

      // Auto-dismiss after duration
      setTimeout(() => {
        hideToast(id);
      }, duration);
    },
    [hideToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={hideToast} />
    </ToastContext.Provider>
  );
};

/**
 * ToastContainer Component
 * 
 * Renders all active toasts.
 */
interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((toast, index) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          index={index}
          onDismiss={onDismiss}
        />
      ))}
    </View>
  );
};

/**
 * ToastItem Component
 * 
 * Individual toast notification with animation.
 */
interface ToastItemProps {
  toast: Toast;
  index: number;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, index, onDismiss }) => {
  const [translateY] = useState(new Animated.Value(-100));
  const [opacity] = useState(new Animated.Value(0));
  const [translateX] = useState(new Animated.Value(0));

  useEffect(() => {
    // Slide in animation
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 8,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismiss = useCallback(() => {
    // Slide out animation
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss(toast.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.id, onDismiss]);

  // Swipe to dismiss
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 10,
    onPanResponderMove: (_, gesture) => {
      translateX.setValue(gesture.dx);
    },
    onPanResponderRelease: (_, gesture) => {
      if (Math.abs(gesture.dx) > 100) {
        // Swipe dismiss
        Animated.timing(translateX, {
          toValue: gesture.dx > 0 ? 400 : -400,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          onDismiss(toast.id);
        });
      } else {
        // Reset position
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 8,
        }).start();
      }
    },
  });

  const backgroundColor = getBackgroundColor(toast.type);
  const icon = toast.icon || getDefaultIcon(toast.type);

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor },
        {
          transform: [{ translateY }, { translateX }],
          opacity,
          top: 60 + index * 80, // Stack toasts
        },
      ]}
      {...panResponder.panHandlers}
    >
      <Pressable style={styles.toastContent} onPress={dismiss}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.message} numberOfLines={2}>
          {toast.message}
        </Text>
        <Pressable style={styles.closeButton} onPress={dismiss}>
          <Text style={styles.closeIcon}>✕</Text>
        </Pressable>
      </Pressable>
    </Animated.View>
  );
};

// Helper functions
const getBackgroundColor = (type: ToastType): string => {
  switch (type) {
    case 'success':
      return '#10b981'; // Green
    case 'error':
      return '#ef4444'; // Red
    case 'warning':
      return '#f59e0b'; // Amber
    case 'info':
    default:
      return '#3b82f6'; // Blue
  }
};

const getDefaultIcon = (type: ToastType): string => {
  switch (type) {
    case 'success':
      return '✅';
    case 'error':
      return '❌';
    case 'warning':
      return '⚠️';
    case 'info':
    default:
      return 'ℹ️';
  }
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    position: 'absolute',
    width: width - 32,
    maxWidth: 400,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '500',
    lineHeight: 20,
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
  closeIcon: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
});

/**
 * Standalone toast function (alternative to hook)
 * 
 * Use this if you need to show toasts outside React components.
 */
let globalShowToast: ((message: string, type?: ToastType, duration?: number) => void) | null = null;

export const setGlobalToast = (
  showToast: (message: string, type?: ToastType, duration?: number) => void
) => {
  globalShowToast = showToast;
};

export const showToast = (
  message: string,
  type: ToastType = 'info',
  duration: number = 3000
): void => {
  if (globalShowToast) {
    globalShowToast(message, type, duration);
  } else {
    console.warn('Toast not initialized. Wrap your app with ToastProvider.');
    console.log(`[Toast] ${type.toUpperCase()}: ${message}`);
  }
};
