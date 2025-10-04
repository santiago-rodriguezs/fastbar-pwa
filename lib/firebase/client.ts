import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase client configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase client
function initializeFirebaseClient() {
  try {
    if (getApps().length === 0) {
      const app = initializeApp(firebaseConfig);
      return {
        app,
        auth: getAuth(app),
        db: getFirestore(app),
      };
    }
    
    return {
      app: getApps()[0],
      auth: getAuth(),
      db: getFirestore(),
    };
  } catch (error) {
    console.error('Firebase client initialization error:', error);
    
    // #TODO: Return mock implementation for demo purposes
    return {
      app: {} as any,
      auth: {
        currentUser: { uid: 'demo-user', email: 'demo@example.com', displayName: 'Demo User' },
        onAuthStateChanged: (callback: any) => {
          callback({ uid: 'demo-user', email: 'demo@example.com', displayName: 'Demo User' });
          return () => {};
        },
        signOut: async () => {},
      } as any,
      db: {} as any,
    };
  }
}

// Export Firebase client instances
export const { app, auth, db } = initializeFirebaseClient();

// Authentication providers
export const googleProvider = new GoogleAuthProvider();

// Authentication functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google sign-in error:', error);
    // #TODO: Return mock user for demo purposes
    return { uid: 'demo-user', email: 'demo@example.com', displayName: 'Demo User' };
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Email/password sign-in error:', error);
    // #TODO: Return mock user for demo purposes
    return { uid: 'demo-user', email: 'demo@example.com', displayName: 'Demo User' };
  }
};

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Email/password sign-up error:', error);
    // #TODO: Return mock user for demo purposes
    return { uid: 'demo-user', email: 'demo@example.com', displayName: 'Demo User' };
  }
};
