'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getLocalUser, setLocalUser, clearLocalUser, type LocalUser } from './auth';

type AuthContextType = {
  user: LocalUser | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hydrate from localStorage
    const stored = getLocalUser();
    setUser(stored);
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    const { registerLocalUser } = await import('./auth');
    const newUser = await registerLocalUser(email, password, displayName);
    setUser(newUser);
  };

  const signIn = async (email: string, password: string) => {
    const { loginLocalUser } = await import('./auth');
    const existingUser = await loginLocalUser(email, password);
    setUser(existingUser);
  };

  const signOut = async () => {
    const { logoutUser } = await import('./auth');
    await logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
