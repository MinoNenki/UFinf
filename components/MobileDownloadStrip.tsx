'use client';

import { byLanguage, type Language, useI18n } from '@/lib/i18n';

const COPY = {
  pl: {
    eyebrow: 'Mobile',
    title: 'Pobierz aplikacje',
    text: 'Na telefonie masz szybki dostep do One Click Publish, coacha i analityki. Desktop zostaje jako panel dowodzenia, a mobile jako szybki workflow w terenie.',
    primary: 'App Store',
    secondary: 'Google Play',
    website: 'Przejdz na wersje web',
  },
  en: {
    eyebrow: 'Mobile',
    title: 'Download the app',
    text: 'On mobile you get quick access to One Click Publish, coaching, and analytics. Desktop stays the command center, mobile stays the field workflow.',
    primary: 'App Store',
    secondary: 'Google Play',
    website: 'Go to the web version',
  },
  es: {
    eyebrow: 'Mobile',
    title: 'Descarga la app',
    text: 'En el telefono tienes acceso rapido a One Click Publish, coach y analitica. El escritorio queda como centro de mando y el mobile como flujo rapido en campo.',
    primary: 'App Store',
    secondary: 'Google Play',
    website: 'Ir a la version web',
  },
} satisfies Record<Language, {
  eyebrow: string;
  title: string;
  text: string;
  primary: string;
  secondary: string;
  website: string;
}>;

const APP_STORE_URL = process.env.NEXT_PUBLIC_APP_STORE_URL || 'https://apps.apple.com';
const GOOGLE_PLAY_URL = process.env.NEXT_PUBLIC_GOOGLE_PLAY_URL || 'https://play.google.com/store';

export default function MobileDownloadStrip() {
  const { language } = useI18n();
  const copy = byLanguage(language, COPY);

  return (
    <section className="section" id="download" style={{ paddingTop: 0 }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 5vw' }}>
        <div className="card" style={{ display: 'grid', gap: 16, gridTemplateColumns: '1.2fr .8fr', alignItems: 'center' }}>
          <div>
            <p className="section-label">{copy.eyebrow}</p>
            <h2 style={{ fontSize: 'clamp(28px, 3vw, 42px)', letterSpacing: '-.05em', marginBottom: 12 }}>{copy.title}</h2>
            <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>{copy.text}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a href={APP_STORE_URL} className="btn btn-primary btn-full" aria-label={copy.primary}>{copy.primary}</a>
            <a href={GOOGLE_PLAY_URL} className="btn btn-ghost btn-full" aria-label={copy.secondary}>{copy.secondary}</a>
            <a href="/dashboard" className="btn btn-ghost btn-full">{copy.website}</a>
          </div>
        </div>
      </div>
    </section>
  );
}
