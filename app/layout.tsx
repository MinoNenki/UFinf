import type { Metadata, Viewport } from 'next';
import './globals.css';
import { validateEnvOnStartup } from '@/lib/server/env';
import { I18nProvider } from '@/lib/i18n';

validateEnvOnStartup();

export const metadata: Metadata = {
  title: 'USInf.com — AI Growth OS for Global Creators',
  description: 'USInf.com: One Click Publish, AI Content Brain v2, Trend Radar i Growth Coach dla TikTok, YouTube, Instagram, Facebook i X.',
  keywords: ['USInf', 'AI Growth OS', 'TikTok', 'YouTube', 'Instagram', 'creator economy', 'one click publish', 'content brain'],
  authors: [{ name: 'USInf.com' }],
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

