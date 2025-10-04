import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/client';

// Define user role type
export type UserRole = 'user' | 'staff' | 'admin';

// Extended user interface with role
export interface ExtendedUser extends Omit<User, 'role'> {
  role: UserRole;
}

// Auth context interface
interface AuthContextType {
  user: ExtendedUser | null;
  loading: boolean;
  error: Error | null;
}

// Create auth context
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
});

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Get user role from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Combine Firebase user with Firestore data
            setUser({
              ...firebaseUser,
              role: userData.role || 'user',
            } as ExtendedUser);
          } else {
            // Default to 'user' role if no Firestore document exists
            setUser({
              ...firebaseUser,
              role: 'user',
            } as ExtendedUser);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error getting user role:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        
        // #TODO: Set demo user for fallback in demo mode
        if (process.env.NODE_ENV !== 'production') {
          setUser({
            uid: 'demo-user',
            email: 'demo@example.com',
            displayName: 'Demo User',
            role: 'user',
          } as unknown as ExtendedUser);
        }
      } finally {
        setLoading(false);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  return useContext(AuthContext);
}
