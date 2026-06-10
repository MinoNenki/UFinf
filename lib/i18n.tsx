'use client';

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

export type Language = 'pl' | 'en' | 'es';

type I18nContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  lastSavedAt: string | null;
};

const STORAGE_KEY = 'usinf_language';
const SAVED_AT_KEY = 'usinf_language_saved_at';
const SERVER_LANGUAGE_ENDPOINT = '/api/i18n/language';

const I18nContext = createContext<I18nContextValue | null>(null);

function normalizeLanguage(input: string | null | undefined): Language {
  if (input === 'pl' || input === 'en' || input === 'es') return input;
  return 'pl';
}

function readStoredLanguage(): Language | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === 'pl' || raw === 'en' || raw === 'es') return raw;
  return null;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('pl');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const hydratedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function loadLanguagePreference() {
      const stored = readStoredLanguage();
      setLastSavedAt(window.localStorage.getItem(SAVED_AT_KEY));

      try {
        const response = await fetch(SERVER_LANGUAGE_ENDPOINT, { method: 'GET' });
        if (!response.ok) throw new Error('Preference fetch failed');
        const data = await response.json() as { language?: string | null; savedAt?: string | null };
        if (cancelled) return;

        const serverLanguage = data.language === 'pl' || data.language === 'en' || data.language === 'es'
          ? data.language
          : null;
        const nextLanguage = serverLanguage || stored || normalizeLanguage(window.navigator.language?.slice(0, 2));
        setLanguage(nextLanguage);
        if (serverLanguage) {
          window.localStorage.setItem(STORAGE_KEY, serverLanguage);
        }
        if (data.savedAt) {
          window.localStorage.setItem(SAVED_AT_KEY, data.savedAt);
          setLastSavedAt(data.savedAt);
        }
      } catch {
        if (cancelled) return;
        setLanguage(stored || normalizeLanguage(window.navigator.language?.slice(0, 2)));
      } finally {
        if (!cancelled) hydratedRef.current = true;
      }
    }

    void loadLanguagePreference();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
    const savedAt = new Date().toISOString();
    window.localStorage.setItem(SAVED_AT_KEY, savedAt);
    setLastSavedAt(savedAt);
    document.documentElement.lang = language;
    if (!hydratedRef.current) return;

    void fetch(SERVER_LANGUAGE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language, savedAt }),
    }).catch(() => undefined);
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, lastSavedAt }), [language, lastSavedAt]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}

export function byLanguage<T>(language: Language, values: Record<Language, T>) {
  return values[language];
}

export const LANGUAGE_LABELS: Record<Language, string> = {
  pl: 'Polski',
  en: 'English',
  es: 'Espanol',
};
