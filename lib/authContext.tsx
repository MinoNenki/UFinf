'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  getLocalUser,
  getSupabaseSessionUser,
  isEmailVerificationAvailable,
  onSupabaseAuthStateChange,
  resendVerificationEmail,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
  supabaseConfigured,
  type AuthProviderMode,
  type AuthUser,
  type SignUpResult,
  logoutUser,
} from './auth';

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  authMode: AuthProviderMode;
  emailVerificationAvailable: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<SignUpResult>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function hydrate() {
      if (supabaseConfigured) {
        const currentUser = await getSupabaseSessionUser();
        if (!active) return;
        setUser(currentUser);
      } else {
        const stored = getLocalUser();
        if (!active) return;
        setUser(stored);
      }

      if (active) setLoading(false);
    }

    hydrate();

    if (!supabaseConfigured) {
      return () => {
        active = false;
      };
    }

    const unsubscribe = onSupabaseAuthStateChange((nextUser) => {
      if (!active) return;
      setUser(nextUser);
      setLoading(false);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    const result = await signUpWithEmail(email, password, displayName);
    setUser(result.user);
    return result;
  };

  const signIn = async (email: string, password: string) => {
    const existingUser = await signInWithEmail(email, password);
    setUser(existingUser);
  };

  const refreshUser = async () => {
    if (supabaseConfigured) {
      setUser(await getSupabaseSessionUser());
      return;
    }

    setUser(getLocalUser());
  };

  const signOut = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authMode: supabaseConfigured ? 'supabase' : 'local',
        emailVerificationAvailable: isEmailVerificationAvailable(),
        signUp,
        signIn,
        signInWithGoogle,
        resendVerification: resendVerificationEmail,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
