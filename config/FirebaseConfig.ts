/**
 * Firebase Configuration
 * Initializes Firebase with environment variables and exports auth/db instances
 */
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Validate Firebase configuration
const validateConfig = () => {
  const requiredKeys = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];

  const missingKeys = requiredKeys.filter(
    (key) => !firebaseConfig[key as keyof typeof firebaseConfig]
  );

  if (missingKeys.length > 0) {
    console.error(
      '❌ Missing Firebase configuration keys:',
      missingKeys.join(', ')
    );
    console.error('Please check your .env file and ensure all Firebase keys are set.');
    return false;
  }

  return true;
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  // Validate configuration before initializing
  if (!validateConfig()) {
    throw new Error('Invalid Firebase configuration');
  }

  // Check if Firebase is already initialized
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully');
  } else {
    app = getApp();
    console.log('✅ Firebase already initialized');
  }

  // Initialize Auth (Firebase v11 handles persistence automatically with AsyncStorage in React Native)
  auth = getAuth(app);

  // Initialize Firestore
  db = getFirestore(app);

  console.log('✅ Firebase Auth initialized');
  console.log('✅ Firestore initialized');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  throw error;
}

// Export initialized instances
export { app, auth, db };

// Export Firebase config for debugging (without sensitive data)
export const getFirebaseConfig = () => ({
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  configured: validateConfig(),
});

// Helper to check if Firebase is properly configured
export const isFirebaseConfigured = (): boolean => {
  return validateConfig();
};

export default app;
