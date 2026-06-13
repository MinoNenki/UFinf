import { createClient, type AuthChangeEvent, type Session, type User } from '@supabase/supabase-js';

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

export type AuthProviderMode = 'supabase' | 'local';

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  createdAt: number;
  emailVerified: boolean;
  provider: AuthProviderMode;
};

export type SignUpResult = {
  user: AuthUser | null;
  needsEmailVerification: boolean;
  provider: AuthProviderMode;
  warning?: string;
};

type LocalStoredUser = AuthUser & {
  passwordHash: string;
};

const LOCAL_USERS_KEY = 'ufinf_users';
const LOCAL_SESSION_KEY = 'ufinf_session_user';

function getRedirectTo() {
  if (typeof window === 'undefined') return undefined;
  return `${window.location.origin}/auth/callback`;
}

async function withRateLimitRetry<T>(
  fn: () => Promise<T>,
  operationName: string,
  maxRetries: number = 3
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRateLimitError =
        error?.message?.includes('email rate limit') ||
        error?.message?.includes('rate limit') ||
        error?.status === 429;

      if (!isRateLimitError || attempt === maxRetries - 1) {
        throw error;
      }

      // Exponential backoff: 2s, 4s, 8s
      const delayMs = Math.pow(2, attempt + 1) * 1000;
      console.log(
        `[${operationName}] Rate limited. Retrying in ${delayMs / 1000}s... (attempt ${attempt + 1}/${maxRetries - 1})`
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw new Error(`${operationName} failed after ${maxRetries} retries`);
}

function toAuthUser(user: User): AuthUser {
  const meta = user.user_metadata || {};
  const displayName =
    (typeof meta.name === 'string' && meta.name.trim()) ||
    (typeof meta.display_name === 'string' && meta.display_name.trim()) ||
    (typeof meta.full_name === 'string' && meta.full_name.trim()) ||
    (typeof meta.given_name === 'string' && meta.given_name.trim()) ||
    user.email?.split('@')[0] ||
    'UFInf User';
  return {
    id: user.id,
    email: user.email || '',
    displayName,
    createdAt: user.created_at ? new Date(user.created_at).getTime() : Date.now(),
    emailVerified: Boolean(user.email_confirmed_at),
    provider: 'supabase',
  };
}

function getLocalUsers(): LocalStoredUser[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(LOCAL_USERS_KEY);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setLocalUsers(users: LocalStoredUser[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

export function getLocalUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(LOCAL_SESSION_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as AuthUser;
  } catch {
    return null;
  }
}

export function setLocalUser(user: AuthUser) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(user));
}

export function clearLocalUser() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LOCAL_SESSION_KEY);
}

export async function getSupabaseSessionUser() {
  if (!supabase) return null;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.user ? toAuthUser(session.user) : null;
}

export function onSupabaseAuthStateChange(callback: (user: AuthUser | null, event: AuthChangeEvent, session: Session | null) => void) {
  if (!supabase) return () => undefined;

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user ? toAuthUser(session.user) : null, event, session);
  });

  return () => subscription.unsubscribe();
}

export async function exchangeSupabaseCodeForSession(code: string) {
  if (!supabase) throw new Error('Brak konfiguracji Supabase dla weryfikacji email.');
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) throw error;
  return getSupabaseSessionUser();
}

export async function resendVerificationEmail(email: string) {
  if (!supabase) {
    throw new Error('Ta instalacja nie ma jeszcze skonfigurowanej wysylki maili. Dodaj NEXT_PUBLIC_SUPABASE_URL i NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: getRedirectTo(),
    },
  });

  if (error) throw error;
}

export async function signInWithGoogle() {
  if (!supabase) {
    throw new Error('Google login wymaga skonfigurowanego Supabase Auth na webie.');
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getRedirectTo(),
      queryParams: {
        prompt: 'consent',
        access_type: 'offline',
      },
    },
  });

  if (error) throw error;
  if (!data?.url) throw new Error('Nie udalo sie wygenerowac linku Google OAuth.');

  window.location.assign(data.url);
}

export async function registerLocalUser(email: string, password: string, displayName: string): Promise<SignUpResult> {
  if (!email.includes('@') || password.length < 6 || !displayName.trim()) {
    throw new Error('Invalid input');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const users = getLocalUsers();

  if (users.some((entry) => entry.email.toLowerCase() === normalizedEmail)) {
    throw new Error('Account already exists for this email.');
  }

  const user: AuthUser = {
    id: Math.random().toString(36).slice(2),
    email: normalizedEmail,
    displayName: displayName.trim(),
    createdAt: Date.now(),
    emailVerified: true,
    provider: 'local',
  };

  const passwordHash = btoa(password);
  users.push({ ...user, passwordHash });
  setLocalUsers(users);
  setLocalUser(user);

  return {
    user,
    needsEmailVerification: false,
    provider: 'local',
    warning: 'Ta wersja deployu nie ma jeszcze skonfigurowanego providera mail. Konto zostalo aktywowane bez maila. Aby wlaczyc prawdziwa weryfikacje, dodaj NEXT_PUBLIC_SUPABASE_URL i NEXT_PUBLIC_SUPABASE_ANON_KEY w Vercel.',
  };
}

export async function signUpWithEmail(email: string, password: string, displayName: string): Promise<SignUpResult> {
  if (!supabase) {
    return registerLocalUser(email, password, displayName);
  }

  const { data, error } = await withRateLimitRetry(
    () =>
      supabase!.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            display_name: displayName.trim(),
          },
          emailRedirectTo: getRedirectTo(),
        },
      }),
    'SignUp'
  );

  if (error) throw error;

  const sessionUser = data.user ? toAuthUser(data.user) : null;
  const hasSession = Boolean(data.session?.user);

  if (hasSession && sessionUser) {
    return {
      user: sessionUser,
      needsEmailVerification: false,
      provider: 'supabase',
    };
  }

  return {
    user: null,
    needsEmailVerification: true,
    provider: 'supabase',
  };
}

export async function loginLocalUser(email: string, password: string): Promise<AuthUser> {
  const normalizedEmail = email.trim().toLowerCase();
  const user = getLocalUsers().find((entry) => entry.email.toLowerCase() === normalizedEmail);
  if (!user) throw new Error('User not found');

  const incomingHash = btoa(password);
  if (user.passwordHash !== incomingHash) throw new Error('Invalid credentials');

  const sessionUser: AuthUser = {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    createdAt: user.createdAt,
    emailVerified: user.emailVerified,
    provider: 'local',
  };

  setLocalUser(sessionUser);
  return sessionUser;
}

export async function signInWithEmail(email: string, password: string): Promise<AuthUser> {
  if (!supabase) {
    return loginLocalUser(email, password);
  }

  const { data, error } = await withRateLimitRetry(
    () =>
      supabase!.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      }),
    'SignIn'
  );

  if (error) throw error;
  if (!data.user) throw new Error('Login failed');

  return toAuthUser(data.user);
}

export function isEmailVerificationAvailable() {
  return supabaseConfigured;
}

export async function logoutUser() {
  if (supabase) {
    await supabase.auth.signOut();
    return;
  }

  clearLocalUser();
}
