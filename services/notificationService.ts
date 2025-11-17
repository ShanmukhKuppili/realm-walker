/**
 * Notification Service
 * 
 * Handles push notifications for:
 * - Block claims
 * - Rewards
 * - Territory attacks
 * - Ownership expiration warnings
 */

import { Platform } from 'react-native';

// Lazy-load expo-notifications with dynamic import() so Metro doesn't attempt
// to initialize native modules in environments like Expo Go where some
// features are unavailable. We set a runtime flag `notificationsAvailable`
// to gate all calls. In a development build this will enable full behavior.
let Notifications: any = null;
let notificationsAvailable = false;

// Attempt to import expo-notifications asynchronously. We don't await this at
// module evaluation time to avoid blocking; the functions below will check
// `notificationsAvailable` before calling into the native API.
(async () => {
    try {
        // Use dynamic import instead of require to satisfy lint rules and TS.
        const mod = await import('expo-notifications');
        Notifications = mod;
        notificationsAvailable = true;

        // Configure notification handler when available.
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: true,
            }),
        });
    } catch (err: any) {
    // Notifications aren't available (likely running in Expo Go). Degrade
    // gracefully — functions below will no-op and return safe defaults.
    console.warn('expo-notifications not available in this environment:', err?.message || err);
        Notifications = null;
        notificationsAvailable = false;
    }
})();

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
    try {
        if (!notificationsAvailable) {
            // Running in an environment without native notifications (Expo Go).
            // Return false so callers know notifications are not enabled.
            console.warn('requestNotificationPermissions: notifications not available in this environment');
            return false;
        }
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.warn('Notification permission not granted');
            return false;
        }

        // For Android, create notification channel
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('block-claims', {
                name: 'Block Claims',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                sound: 'default',
            });

            await Notifications.setNotificationChannelAsync('rewards', {
                name: 'Rewards',
                importance: Notifications.AndroidImportance.DEFAULT,
                sound: 'default',
            });
        }

        return true;
    } catch (error) {
        console.error('Error requesting notification permissions:', error);
        return false;
    }
}

/**
 * Show notification for successful block claim
 */
export async function notifyBlockClaimed(
    blockId: string,
    xpReward: number,
    goldReward: number
): Promise<void> {
    try {
        if (!notificationsAvailable) {
            // No-op in environments without native notifications.
            return;
        }
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '🎉 Block Claimed!',
                body: `+${xpReward} XP, +${goldReward} Gold`,
                data: {
                    type: 'block_claimed',
                    blockId,
                    xpReward,
                    goldReward,
                },
                sound: 'default',
            },
            trigger: null, // Show immediately
        });
    } catch (error) {
        console.error('Error showing block claim notification:', error);
    }
}

/**
 * Show notification for ownership refresh
 */
export async function notifyOwnershipRefreshed(blockId: string): Promise<void> {
    try {
        if (!notificationsAvailable) return;
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '🔄 Ownership Refreshed',
                body: `Block ${blockId} ownership extended for 24 hours`,
                data: {
                    type: 'ownership_refreshed',
                    blockId,
                },
            },
            trigger: null,
        });
    } catch (error) {
        console.error('Error showing refresh notification:', error);
    }
}

/**
 * Show notification for block under attack
 */
export async function notifyBlockUnderAttack(blockId: string): Promise<void> {
    try {
        if (!notificationsAvailable) return;
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '⚔️ Territory Under Attack!',
                body: `Your block ${blockId} is being challenged`,
                data: {
                    type: 'block_attack',
                    blockId,
                },
                sound: 'default',
            },
            trigger: null,
        });
    } catch (error) {
        console.error('Error showing attack notification:', error);
    }
}

/**
 * Show notification when ownership is about to expire
 */
export async function notifyOwnershipExpiring(
    blockId: string,
    hoursRemaining: number
): Promise<void> {
    try {
        if (!notificationsAvailable) return;
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '⏰ Ownership Expiring Soon',
                body: `Block ${blockId} expires in ${hoursRemaining} hours. Visit to refresh!`,
                data: {
                    type: 'ownership_expiring',
                    blockId,
                    hoursRemaining,
                },
            },
            trigger: null,
        });
    } catch (error) {
        console.error('Error showing expiration notification:', error);
    }
}

/**
 * Show notification for failed claim attempt
 */
export async function notifyClaimFailed(reason: string): Promise<void> {
    try {
        if (!notificationsAvailable) return;
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '❌ Claim Failed',
                body: reason,
                data: {
                    type: 'claim_failed',
                    reason,
                },
            },
            trigger: null,
        });
    } catch (error) {
        console.error('Error showing claim failed notification:', error);
    }
}

/**
 * Schedule notification for ownership expiration (23 hours from now)
 */
export async function scheduleOwnershipExpirationReminder(
    blockId: string
): Promise<string | null> {
    try {
        if (!notificationsAvailable) return null;
        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title: '⏰ Ownership Expiring',
                body: `Your block ${blockId} expires in 1 hour!`,
                data: {
                    type: 'ownership_reminder',
                    blockId,
                },
            },
            trigger: {
                seconds: 23 * 60 * 60, // 23 hours
            },
        });

        return notificationId;
    } catch (error) {
        console.error('Error scheduling expiration reminder:', error);
        return null;
    }
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(notificationId: string): Promise<void> {
    try {
        if (!notificationsAvailable) return;
        await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
        console.error('Error canceling notification:', error);
    }
}

/**
 * Get push notification token (for remote notifications)
 */
export async function getPushToken(): Promise<string | null> {
    try {
        if (!notificationsAvailable) return null;
        const { data: token } = await Notifications.getExpoPushTokenAsync();
        return token;
    } catch (error) {
        console.error('Error getting push token:', error);
        return null;
    }
}

/**
 * Add notification listener
 */
export function addNotificationListener(
    callback: (notification: any) => void
): any {
    if (!notificationsAvailable) {
        // Return a dummy subscription with a remove() method to avoid callers
        // having to null check.
        return { remove: () => {} };
    }

    return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add notification response listener (when user taps notification)
 */
export function addNotificationResponseListener(
    callback: (response: any) => void
): any {
    if (!notificationsAvailable) return { remove: () => {} };
    return Notifications.addNotificationResponseReceivedListener(callback);
}
