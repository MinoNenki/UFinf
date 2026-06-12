import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = supabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// Simple local auth for MVP (fallback if Supabase not configured)
export type LocalUser = {
  id: string;
  email: string;
  displayName: string;
  createdAt: number;
};

export function getLocalUser(): LocalUser | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('ufinf_user');
  return stored ? JSON.parse(stored) : null;
}

export function setLocalUser(user: LocalUser) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('ufinf_user', JSON.stringify(user));
}

export function clearLocalUser() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('ufinf_user');
}

export async function registerLocalUser(email: string, password: string, displayName: string) {
  // Simple validation
  if (!email.includes('@') || password.length < 6 || !displayName.trim()) {
    throw new Error('Invalid input');
  }

  const user: LocalUser = {
    id: Math.random().toString(36).slice(2),
    email,
    displayName: displayName.trim(),
    createdAt: Date.now(),
  };

  // Store password hash (for MVP only - NOT production ready!)
  const passwordHash = btoa(password); // Base64 encode (NOT secure, just for demo)
  localStorage.setItem(`ufinf_pass_${user.id}`, passwordHash);
  
  setLocalUser(user);
  return user;
}

export async function loginLocalUser(email: string, password: string) {
  // Find user by email
  const stored = localStorage.getItem('ufinf_user');
  if (!stored) throw new Error('User not found');

  const user: LocalUser = JSON.parse(stored);
  if (user.email !== email) throw new Error('Invalid credentials');

  // Verify password (simple check)
  const storedHash = localStorage.getItem(`ufinf_pass_${user.id}`);
  const incomingHash = btoa(password);
  if (storedHash !== incomingHash) throw new Error('Invalid credentials');

  return user;
}

export async function logoutUser() {
  clearLocalUser();
  if (supabase) {
    await supabase.auth.signOut();
  }
}
