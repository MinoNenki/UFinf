import type { Metadata, Viewport } from 'next';
import './globals.css';
import { validateEnvOnStartup } from '@/lib/server/env';
import { I18nProvider } from '@/lib/i18n';

validateEnvOnStartup();

export const metadata: Metadata = {
  title: 'UFInf — Ultra Future Influencer | AI Growth OS',
  description: 'UFInf: Twój AI engine do publikacji na wszystkie platformy. One Click Publish, AI Content Brain, Trend Radar dla TikTok, YouTube, Instagram, Facebook, X — skaluj kanał bez granic.',
  keywords: ['UFInf', 'Ultra Future Influencer', 'AI Growth', 'TikTok', 'YouTube', 'Instagram', 'creator economy', 'one click publish', 'content brain'],
  authors: [{ name: 'UFInf' }],
};

export const viewport: Viewport = {
  themeColor: '#050816',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body><I18nProvider>{children}</I18nProvider></body>
    </html>
  );
}

