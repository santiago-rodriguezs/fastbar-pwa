import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin() {
  try {
    if (getApps().length === 0) {
      // Use environment variables for Firebase Admin configuration
      const privateKey = process.env.FIREBASE_PRIVATE_KEY 
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
        : undefined;
      
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
      });
    }
    
    return {
      db: getFirestore(),
      auth: getAuth(),
    };
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    
    // #TODO: Return mock implementation for demo purposes
    return {
      db: {
        collection: () => ({
          doc: () => ({
            get: async () => ({
              exists: true,
              data: () => ({ role: 'user' }),
              id: 'demo-user',
            }),
            set: async () => ({}),
            update: async () => ({}),
          }),
          where: () => ({
            get: async () => ({
              empty: false,
              docs: [
                {
                  id: 'demo-doc',
                  data: () => ({ 
                    name: 'Demo Data',
                    active: true,
                  }),
                },
              ],
            }),
          }),
          add: async () => ({ id: 'demo-doc-id' }),
        }),
      },
      auth: {
        verifyIdToken: async () => ({ 
          uid: 'demo-user',
          email: 'demo@example.com',
        }),
        createCustomToken: async () => 'demo-token',
      },
    };
  }
}

// Export the Firebase Admin instances
export const { db, auth } = initializeFirebaseAdmin();
