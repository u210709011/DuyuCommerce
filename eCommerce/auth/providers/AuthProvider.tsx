import React, { createContext, useContext, ReactNode, useEffect } from 'react';

import { useAuth } from '@/hooks/useAuth';

import { User } from '@/types/auth';

import { useWishlist } from '@/store/user';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();
  const { loadWishlist } = useWishlist();

  // INFO: Initialize persisted stores on app mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await loadWishlist();
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };

    initializeApp();
  }, [loadWishlist]);

  // INFO: Provide auth state/actions via context
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

// INFO: Hook to access AuthContext safely
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}; 