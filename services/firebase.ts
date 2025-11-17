/**
 * Firebase Configuration and Authentication Service
 * 
 * Setup Instructions:
 * 1. Create a Firebase project at https://console.firebase.google.com
 * 2. Enable Authentication (Email/Password and Social providers)
 * 3. Enable Firestore Database
 * 4. Copy your Firebase config values here
 */
import { FirebaseApp, initializeApp } from 'firebase/app';
import {
    Auth,
    User as FirebaseUser,
    createUserWithEmailAndPassword,
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
} from 'firebase/auth';
import {
    Firestore,
    collection,
    doc,
    getDoc,
    getDocs,
    getFirestore,
    query,
    setDoc,
    updateDoc,
    where,
} from 'firebase/firestore';

// TODO: Replace with your Firebase project configuration
// Get these values from Firebase Console > Project Settings > General
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'your-api-key',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'your-auth-domain',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'your-project-id',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'your-storage-bucket',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'your-sender-id',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || 'your-app-id',
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

// Authentication functions
export const firebaseAuth = {
  // Sign up with email and password
  signUp: async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with display name
      await updateProfile(user, { displayName });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        email: user.email,
        displayName,
        level: 1,
        xp: 0,
        totalBlocksClaimed: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Listen to auth state changes
  onAuthStateChanged: (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback);
  },

  // Get current user
  getCurrentUser: () => auth.currentUser,
};

// Firestore database functions
export const firebaseDB = {
  // Get user document
  getUser: async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Update user document
  updateUser: async (userId: string, data: any) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...data,
        updatedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get blocks in a region
  getBlocks: async (minLat: number, maxLat: number, minLng: number, maxLng: number) => {
    try {
      const blocksRef = collection(db, 'blocks');
      const q = query(
        blocksRef,
        where('coordinates.latitude', '>=', minLat),
        where('coordinates.latitude', '<=', maxLat)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Claim a block
  claimBlock: async (blockId: string, userId: string) => {
    try {
      await setDoc(doc(db, 'blocks', blockId), {
        id: blockId,
        ownerId: userId,
        ownerType: 'user',
        claimedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }, { merge: true });
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get guild by ID
  getGuild: async (guildId: string) => {
    try {
      const guildDoc = await getDoc(doc(db, 'guilds', guildId));
      if (guildDoc.exists()) {
        return guildDoc.data();
      }
      return null;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get all guilds
  getGuilds: async () => {
    try {
      const guildsRef = collection(db, 'guilds');
      const snapshot = await getDocs(guildsRef);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error: any) {
      throw new Error(error.message);
    }
  },
};

export { auth, db };
export default app;
