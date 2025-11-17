/**
 * Authentication Service
 * Provides Firebase authentication methods with error handling
 */
import { auth, db } from '@/config/FirebaseConfig';
import { User } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    User as FirebaseUser,
    onAuthStateChanged,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    updateProfile,
    UserCredential,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

// Storage keys
const AUTH_TOKEN_KEY = '@realm_walker_auth_token';
const USER_DATA_KEY = '@realm_walker_user_data';

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Parse Firebase error messages to user-friendly text
 */
export const parseAuthError = (error: any): string => {
  const errorCode = error?.code || '';
  const errorMessage = error?.message || 'An unknown error occurred';

  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Invalid email address format.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled. Please contact support.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use a stronger password.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-credential':
      return 'Invalid credentials. Please check your email and password.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    default:
      return errorMessage;
  }
};

/**
 * Create user profile in Firestore
 */
const createUserProfile = async (firebaseUser: FirebaseUser, displayName: string): Promise<User> => {
  const userData: User = {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: displayName || firebaseUser.email?.split('@')[0] || 'User',
    photoURL: firebaseUser.photoURL || undefined,
    level: 1,
    xp: 0,
    totalBlocksClaimed: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    // Prepare Firestore document data, excluding undefined values
    const firestoreData: any = {
      email: userData.email,
      displayName: userData.displayName,
      level: userData.level,
      xp: userData.xp,
      totalBlocksClaimed: userData.totalBlocksClaimed,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Only add photoURL if it exists
    if (firebaseUser.photoURL) {
      firestoreData.photoURL = firebaseUser.photoURL;
    }

    await setDoc(doc(db, 'users', firebaseUser.uid), firestoreData);

    // Cache user data locally
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));

    return userData;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

/**
 * Get user profile from Firestore
 */
export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      const userData: User = {
        id: userId,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        level: data.level || 1,
        xp: data.xp || 0,
        totalBlocksClaimed: data.totalBlocksClaimed || 0,
        guildId: data.guildId,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      };

      // Cache user data locally
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));

      return userData;
    }

    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    
    // Try to get cached data
    try {
      const cachedData = await AsyncStorage.getItem(USER_DATA_KEY);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    } catch (cacheError) {
      console.error('Error reading cached user data:', cacheError);
    }

    throw error;
  }
};

/**
 * Sign up with email and password
 */
export const signUp = async (
  email: string,
  password: string,
  displayName: string
): Promise<{ user: User; firebaseUser: FirebaseUser }> => {
  try {
    // Validate email
    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors[0]);
    }

    // Create Firebase auth user
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Update Firebase profile
    await updateProfile(userCredential.user, {
      displayName: displayName || email.split('@')[0],
    });

    // Send email verification
    try {
      await sendEmailVerification(userCredential.user);
    } catch (emailError) {
      console.warn('Failed to send verification email:', emailError);
    }

    // Create Firestore user profile
    const user = await createUserProfile(userCredential.user, displayName);

    // Store auth token
    const token = await userCredential.user.getIdToken();
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);

    return {
      user,
      firebaseUser: userCredential.user,
    };
  } catch (error: any) {
    console.error('Sign up error:', error);
    throw new Error(parseAuthError(error));
  }
};

/**
 * Sign in with email and password
 */
export const signIn = async (
  email: string,
  password: string
): Promise<{ user: User; firebaseUser: FirebaseUser }> => {
  try {
    // Validate email
    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    // Sign in with Firebase
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Get user profile from Firestore
    const user = await getUserProfile(userCredential.user.uid);

    if (!user) {
      // If profile doesn't exist, create it
      const newUser = await createUserProfile(
        userCredential.user,
        userCredential.user.displayName || email.split('@')[0]
      );
      
      // Store auth token
      const token = await userCredential.user.getIdToken();
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);

      return {
        user: newUser,
        firebaseUser: userCredential.user,
      };
    }

    // Store auth token
    const token = await userCredential.user.getIdToken();
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);

    return {
      user,
      firebaseUser: userCredential.user,
    };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw new Error(parseAuthError(error));
  }
};

/**
 * Sign out current user
 */
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
    
    // Clear local storage
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY]);
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw new Error(parseAuthError(error));
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

/**
 * Get current user's auth token
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    const user = getCurrentUser();
    if (user) {
      return await user.getIdToken();
    }
    
    // Try to get cached token
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Password reset error:', error);
    throw new Error(parseAuthError(error));
  }
};

/**
 * Listen to authentication state changes
 */
export const onAuthStateChange = (
  callback: (user: FirebaseUser | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Restore authentication state from storage
 */
export const restoreAuthState = async (): Promise<{
  user: User | null;
  firebaseUser: FirebaseUser | null;
}> => {
  try {
    const firebaseUser = getCurrentUser();
    
    if (firebaseUser) {
      const user = await getUserProfile(firebaseUser.uid);
      return { user, firebaseUser };
    }

    // Try to restore from cache
    const cachedUserData = await AsyncStorage.getItem(USER_DATA_KEY);
    if (cachedUserData) {
      const user = JSON.parse(cachedUserData);
      return { user, firebaseUser: null };
    }

    return { user: null, firebaseUser: null };
  } catch (error) {
    console.error('Error restoring auth state:', error);
    return { user: null, firebaseUser: null };
  }
};

export default {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  getAuthToken,
  isAuthenticated,
  getUserProfile,
  resetPassword,
  validateEmail,
  validatePassword,
  parseAuthError,
  onAuthStateChange,
  restoreAuthState,
};
