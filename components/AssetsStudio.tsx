'use client';

import { useMemo, useState } from 'react';
import { Download, Image as ImageIcon, Layers, Sparkles } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { byLanguage, useI18n } from '@/lib/i18n';

type AssetType = 'meme' | 'instagram' | 'facebook' | 'thumbnail' | 'carousel' | 'ad' | 'quote' | 'story' | 'linkedin';

type AssetTemplate = {
  id: string;
  type: AssetType;
  label: string;
  width: number;
  height: number;
  background: string;
  accent: string;
  style: 'meme-classic' | 'social-gradient' | 'thumbnail-bold' | 'carousel-clean' | 'ad-convert' | 'quote-card' | 'story-format';
};

type AssetCopy = {
  title: string;
  subtitle: string;
  cta: string;
  topLine: string;
  bottomLine: string;
  quote: string;
};

const TEMPLATES: AssetTemplate[] = [
  // MEMES (4 warianty)
  { id: 'meme-classic-1', type: 'meme', label: 'Meme Classic Dark', width: 1080, height: 1080, background: '#141414', accent: '#ffffff', style: 'meme-classic' },
  { id: 'meme-contrast-2', type: 'meme', label: 'Meme Neon Blue', width: 1080, height: 1080, background: '#001a30', accent: '#67f7ff', style: 'meme-classic' },
  { id: 'meme-red-3', type: 'meme', label: 'Meme Fire Red', width: 1080, height: 1080, background: '#1a0808', accent: '#ff5d5d', style: 'meme-classic' },
  { id: 'meme-green-4', type: 'meme', label: 'Meme Matrix Green', width: 1080, height: 1080, background: '#051408', accent: '#4dff91', style: 'meme-classic' },
  // INSTAGRAM (4 warianty)
  { id: 'ig-neon-1', type: 'instagram', label: 'Instagram Neon', width: 1080, height: 1350, background: '#081220', accent: '#67f7ff', style: 'social-gradient' },
  { id: 'ig-editorial-2', type: 'instagram', label: 'Instagram Editorial', width: 1080, height: 1350, background: '#1b1422', accent: '#ffcf5b', style: 'social-gradient' },
  { id: 'ig-coral-3', type: 'instagram', label: 'Instagram Coral', width: 1080, height: 1350, background: '#1f0e0e', accent: '#ff8c69', style: 'social-gradient' },
  { id: 'ig-mint-4', type: 'instagram', label: 'Instagram Mint', width: 1080, height: 1350, background: '#0c1f17', accent: '#59f5b8', style: 'social-gradient' },
  // FACEBOOK (4 warianty)
  { id: 'fb-boost-1', type: 'facebook', label: 'Facebook Boost', width: 1200, height: 630, background: '#0b1e3a', accent: '#92ffcb', style: 'social-gradient' },
  { id: 'fb-offer-2', type: 'facebook', label: 'Facebook Offer', width: 1200, height: 630, background: '#2a1d14', accent: '#ff9e6b', style: 'social-gradient' },
  { id: 'fb-event-3', type: 'facebook', label: 'Facebook Event', width: 1200, height: 630, background: '#160d24', accent: '#c97bff', style: 'social-gradient' },
  { id: 'fb-promo-4', type: 'facebook', label: 'Facebook Promo', width: 1200, height: 630, background: '#111b11', accent: '#79f07e', style: 'social-gradient' },
  // THUMBNAILS (4 warianty)
  { id: 'thumb-shock-1', type: 'thumbnail', label: 'YouTube Shock', width: 1280, height: 720, background: '#140f28', accent: '#ff5d8f', style: 'thumbnail-bold' },
  { id: 'thumb-authority-2', type: 'thumbnail', label: 'YouTube Authority', width: 1280, height: 720, background: '#10211f', accent: '#4dffe1', style: 'thumbnail-bold' },
  { id: 'thumb-viral-3', type: 'thumbnail', label: 'YouTube Viral Gold', width: 1280, height: 720, background: '#1c1500', accent: '#ffd84d', style: 'thumbnail-bold' },
  { id: 'thumb-clean-4', type: 'thumbnail', label: 'YouTube Clean White', width: 1280, height: 720, background: '#101010', accent: '#f0f0f0', style: 'thumbnail-bold' },
  // CAROUSELS (4 warianty)
  { id: 'carousel-clean-1', type: 'carousel', label: 'Carousel Clean', width: 1080, height: 1080, background: '#101820', accent: '#6fe7ff', style: 'carousel-clean' },
  { id: 'carousel-bold-2', type: 'carousel', label: 'Carousel Bold', width: 1080, height: 1080, background: '#1d1329', accent: '#ffbf67', style: 'carousel-clean' },
  { id: 'carousel-sage-3', type: 'carousel', label: 'Carousel Sage', width: 1080, height: 1080, background: '#111c13', accent: '#85e8a1', style: 'carousel-clean' },
  { id: 'carousel-rose-4', type: 'carousel', label: 'Carousel Rose', width: 1080, height: 1080, background: '#1e0f15', accent: '#f77bc3', style: 'carousel-clean' },
  // ADS (4 warianty)
  { id: 'ad-convert-1', type: 'ad', label: 'Ad Conversion', width: 1080, height: 1080, background: '#10191f', accent: '#58f3c3', style: 'ad-convert' },
  { id: 'ad-sale-2', type: 'ad', label: 'Ad Quick Sale', width: 1080, height: 1080, background: '#24110f', accent: '#ff856a', style: 'ad-convert' },
  { id: 'ad-premium-3', type: 'ad', label: 'Ad Premium Dark', width: 1080, height: 1080, background: '#0d0d1a', accent: '#9b8fff', style: 'ad-convert' },
  { id: 'ad-flash-4', type: 'ad', label: 'Ad Flash Yellow', width: 1080, height: 1080, background: '#1a1600', accent: '#ffe033', style: 'ad-convert' },
  // QUOTE CARDS (4 warianty) — nowy typ
  { id: 'quote-dark-1', type: 'quote', label: 'Quote Dark Premium', width: 1080, height: 1080, background: '#0a0a0a', accent: '#67f7ff', style: 'quote-card' },
  { id: 'quote-gold-2', type: 'quote', label: 'Quote Gold Authority', width: 1080, height: 1080, background: '#120f00', accent: '#f5c842', style: 'quote-card' },
  { id: 'quote-violet-3', type: 'quote', label: 'Quote Violet', width: 1080, height: 1080, background: '#110a1e', accent: '#c97bff', style: 'quote-card' },
  { id: 'quote-minimal-4', type: 'quote', label: 'Quote Minimal White', width: 1080, height: 1080, background: '#f7f7f7', accent: '#111111', style: 'quote-card' },
  // STORY (4 warianty) — nowy typ, format 9:16
  { id: 'story-neon-1', type: 'story', label: 'Story Neon Drop', width: 1080, height: 1920, background: '#060d1a', accent: '#67f7ff', style: 'story-format' },
  { id: 'story-fire-2', type: 'story', label: 'Story Fire Red', width: 1080, height: 1920, background: '#1a0505', accent: '#ff6b6b', style: 'story-format' },
  { id: 'story-gold-3', type: 'story', label: 'Story Gold Boss', width: 1080, height: 1920, background: '#120d00', accent: '#ffc107', style: 'story-format' },
  { id: 'story-mint-4', type: 'story', label: 'Story Mint Fresh', width: 1080, height: 1920, background: '#071510', accent: '#4dffa1', style: 'story-format' },
  // LINKEDIN (4 warianty) — nowy typ
  { id: 'li-authority-1', type: 'linkedin', label: 'LinkedIn Authority', width: 1200, height: 628, background: '#0a1628', accent: '#67f7ff', style: 'social-gradient' },
  { id: 'li-insight-2', type: 'linkedin', label: 'LinkedIn Insight', width: 1200, height: 628, background: '#1a1200', accent: '#f5c842', style: 'social-gradient' },
  { id: 'li-case-3', type: 'linkedin', label: 'LinkedIn Case Study', width: 1200, height: 628, background: '#0e1a10', accent: '#5de89e', style: 'social-gradient' },
  { id: 'li-bold-4', type: 'linkedin', label: 'LinkedIn Bold Claim', width: 1200, height: 628, background: '#12000f', accent: '#ff7de3', style: 'social-gradient' },
];

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function chunkLine(value: string, maxLen = 26) {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxLen) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = (current + ' ' + word).trim();
    }
  }

  if (current) lines.push(current);
  return lines.slice(0, 3);
}

function aiCopyFromPrompt(prompt: string, type: AssetType, language: 'pl' | 'en' | 'es'): AssetCopy {
  const normalized = prompt.trim() || (language === 'pl' ? 'Twoj temat marketingowy' : language === 'es' ? 'Tu tema de marketing' : 'Your marketing topic');
  const short = normalized.length > 64 ? `${normalized.slice(0, 61)}...` : normalized;

  const baseCta = language === 'pl'
    ? 'Napisz START w komentarzu'
    : language === 'es'
    ? 'Escribe START en comentarios'
    : 'Comment START below';

  const typeHooks: Record<AssetType, string> = {
    meme: language === 'pl' ? 'Kiedy klient chce viral bez strategii' : language === 'es' ? 'Cuando el cliente quiere viral sin estrategia' : 'When the client wants viral without strategy',
    instagram: language === 'pl' ? '3 rzeczy, ktore podnosza zasieg o 40%' : language === 'es' ? '3 cosas que elevan tu alcance un 40%' : '3 things that boost your reach by 40%',
    facebook: language === 'pl' ? 'Case study: 10x zasieg bez wiekszego budzetu' : language === 'es' ? 'Caso real: 10x alcance sin mas presupuesto' : 'Case study: 10x reach with no extra budget',
    thumbnail: language === 'pl' ? 'NIKT CI TEGO NIE POWIE' : language === 'es' ? 'NADIE TE LO DIRA' : 'NOBODY WILL TELL YOU THIS',
    carousel: language === 'pl' ? 'Plan 7 krokow na ten tydzien' : language === 'es' ? 'Plan de 7 pasos para esta semana' : '7-step plan for this week',
    ad: language === 'pl' ? 'Oferta wygasa dzisiaj o polnocy' : language === 'es' ? 'La oferta expira hoy a medianoche' : 'Offer expires tonight at midnight',
    quote: language === 'pl' ? 'Jedno zdanie, ktore zmienia wszystko' : language === 'es' ? 'Una frase que lo cambia todo' : 'One sentence that changes everything',
    story: language === 'pl' ? 'Swipe up — tylko dzis dostepne' : language === 'es' ? 'Swipe up — disponible solo hoy' : 'Swipe up — available today only',
    linkedin: language === 'pl' ? 'Wynik, ktory zrobil z nas lidera rynku' : language === 'es' ? 'El resultado que nos convirtio en lideres' : 'The result that made us market leaders',
  };

  const subtitle = language === 'pl'
    ? `Temat: ${short}`
    : language === 'es'
    ? `Tema: ${short}`
    : `Topic: ${short}`;

  const quote = language === 'pl'
    ? 'Marketing to system, nie przypadek.'
    : language === 'es'
    ? 'Marketing es sistema, no suerte.'
    : 'Marketing is a system, not luck.';

  const quoteLines: Record<AssetType, string> = {
    meme: 'Marketing to system, nie przypadek.',
    instagram: language === 'pl' ? 'Konsekwencja bije talent za kazdym razem.' : language === 'es' ? 'La constancia supera al talento siempre.' : 'Consistency beats talent every time.',
    facebook: language === 'pl' ? 'Dane mowia glosniej niz opinie.' : language === 'es' ? 'Los datos hablan mas fuerte que las opiniones.' : 'Data speaks louder than opinions.',
    thumbnail: language === 'pl' ? 'Pierwszy sekund decyduje o wszystkim.' : language === 'es' ? 'El primer segundo lo decide todo.' : 'The first second decides everything.',
    carousel: language === 'pl' ? 'Dobry system wygrywa z dobrymi intencjami.' : language === 'es' ? 'Un buen sistema gana a las buenas intenciones.' : 'A good system beats good intentions.',
    ad: language === 'pl' ? 'Pilnosc bez jasnosci to chaos.' : language === 'es' ? 'La urgencia sin claridad es caos.' : 'Urgency without clarity is chaos.',
    quote: language === 'pl' ? 'Jedna prosta prawda moze zmienic caly rynek.' : language === 'es' ? 'Una verdad simple puede cambiar todo el mercado.' : 'One simple truth can shift the entire market.',
    story: language === 'pl' ? 'Twoja historia jest Twoim najlepszym produktem.' : language === 'es' ? 'Tu historia es tu mejor producto.' : 'Your story is your best product.',
    linkedin: language === 'pl' ? 'Eksperci nie czekaja. Buduja dowody.' : language === 'es' ? 'Los expertos no esperan. Construyen evidencia.' : 'Experts don\'t wait. They build proof.',
  };

  return {
    title: typeHooks[type],
    subtitle,
    cta: baseCta,
    topLine: type === 'meme' ? chunkLine(typeHooks[type], 18).join(' | ') : chunkLine(short, 24).join(' | '),
    bottomLine: type === 'meme' ? chunkLine(short, 18).join(' | ') : chunkLine(baseCta, 24).join(' | '),
    quote: quoteLines[type] || quote,
  };
}

function buildSvgMarkup(template: AssetTemplate, copy: AssetCopy) {
  const { width, height, background, accent } = template;

  if (template.style === 'meme-classic') {
    const top = chunkLine(copy.topLine, 20);
    const bottom = chunkLine(copy.bottomLine, 20);

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${background}"/><stop offset="100%" stop-color="#000"/></linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg)" />
      <rect x="40" y="40" width="${width - 80}" height="${height - 80}" rx="26" fill="rgba(255,255,255,0.06)" stroke="${accent}" stroke-opacity="0.25" />
      ${top.map((line, idx) => `<text x="${width / 2}" y="${120 + idx * 58}" font-size="52" font-family="Arial, Helvetica, sans-serif" font-weight="800" text-anchor="middle" fill="#fff" stroke="#000" stroke-width="5">${escapeXml(line)}</text>`).join('')}
      ${bottom.map((line, idx) => `<text x="${width / 2}" y="${height - 120 + idx * 58}" font-size="52" font-family="Arial, Helvetica, sans-serif" font-weight="800" text-anchor="middle" fill="#fff" stroke="#000" stroke-width="5">${escapeXml(line)}</text>`).join('')}
      <text x="${width / 2}" y="${height / 2}" font-size="24" font-family="Arial, Helvetica, sans-serif" text-anchor="middle" fill="${accent}">UFINF AI ASSETS STUDIO</text>
    </svg>`;
  }

  if (template.style === 'thumbnail-bold') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" fill="${background}" />
      <circle cx="${width - 220}" cy="160" r="220" fill="${accent}" fill-opacity="0.22" />
      <rect x="56" y="56" width="${width - 112}" height="${height - 112}" rx="22" fill="rgba(255,255,255,0.03)" stroke="${accent}" stroke-opacity="0.4" />
      <text x="90" y="170" font-size="32" font-family="Arial, Helvetica, sans-serif" fill="${accent}" font-weight="700">NEW VIDEO</text>
      ${chunkLine(copy.title.toUpperCase(), 22).map((line, idx) => `<text x="90" y="${280 + idx * 104}" font-size="90" font-family="Arial, Helvetica, sans-serif" fill="#fff" font-weight="900">${escapeXml(line)}</text>`).join('')}
      <text x="90" y="${height - 80}" font-size="32" font-family="Arial, Helvetica, sans-serif" fill="#fff">${escapeXml(copy.cta)}</text>
    </svg>`;
  }

  if (template.style === 'carousel-clean') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${background}"/><stop offset="100%" stop-color="#0a0a0a"/></linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg)" />
      <rect x="56" y="56" width="${width - 112}" height="${height - 112}" rx="22" fill="rgba(255,255,255,0.04)" stroke="${accent}" stroke-opacity="0.42" />
      <text x="90" y="140" font-size="34" font-family="Arial, Helvetica, sans-serif" fill="${accent}" font-weight="700">SLIDE 1/5</text>
      ${chunkLine(copy.title, 24).map((line, idx) => `<text x="90" y="${240 + idx * 76}" font-size="64" font-family="Arial, Helvetica, sans-serif" fill="#fff" font-weight="900">${escapeXml(line)}</text>`).join('')}
      <text x="90" y="${height - 170}" font-size="34" font-family="Arial, Helvetica, sans-serif" fill="#d8d8d8">${escapeXml(copy.subtitle)}</text>
      <text x="90" y="${height - 96}" font-size="38" font-family="Arial, Helvetica, sans-serif" fill="${accent}" font-weight="700">${escapeXml(copy.cta)}</text>
    </svg>`;
  }

  if (template.style === 'ad-convert') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" fill="${background}" />
      <rect x="56" y="56" width="${width - 112}" height="${height - 112}" rx="26" fill="rgba(255,255,255,0.05)" />
      <rect x="90" y="102" width="280" height="50" rx="25" fill="${accent}" fill-opacity="0.22" />
      <text x="230" y="136" font-size="26" font-family="Arial, Helvetica, sans-serif" fill="${accent}" text-anchor="middle" font-weight="700">HIGH CONVERTING AD</text>
      ${chunkLine(copy.title, 20).map((line, idx) => `<text x="90" y="${250 + idx * 84}" font-size="72" font-family="Arial, Helvetica, sans-serif" fill="#fff" font-weight="900">${escapeXml(line)}</text>`).join('')}
      <text x="90" y="${height - 200}" font-size="34" font-family="Arial, Helvetica, sans-serif" fill="#d6d6d6">${escapeXml(copy.subtitle)}</text>
      <rect x="90" y="${height - 150}" width="460" height="66" rx="33" fill="${accent}" />
      <text x="320" y="${height - 106}" font-size="31" font-family="Arial, Helvetica, sans-serif" fill="#111" text-anchor="middle" font-weight="800">${escapeXml(copy.cta)}</text>
    </svg>`;
  }

  if (template.style === 'quote-card') {
    const isDark = background !== '#f7f7f7';
    const textColor = isDark ? '#fff' : '#111';
    const subColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';
    const quoteLines = chunkLine(`\u201c${copy.quote}\u201d`, 28);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" fill="${background}" />
      <rect x="60" y="60" width="${width - 120}" height="${height - 120}" rx="32" fill="rgba(128,128,128,0.07)" stroke="${accent}" stroke-opacity="0.3" />
      <text x="120" y="180" font-size="120" font-family="Georgia, serif" fill="${accent}" opacity="0.35">\u201c</text>
      ${quoteLines.map((line, idx) => `<text x="${width / 2}" y="${380 + idx * 90}" font-size="62" font-family="Georgia, serif" font-style="italic" text-anchor="middle" fill="${textColor}">${escapeXml(line)}</text>`).join('')}
      <line x1="${width / 2 - 60}" y1="${height - 220}" x2="${width / 2 + 60}" y2="${height - 220}" stroke="${accent}" stroke-width="3" />
      <text x="${width / 2}" y="${height - 170}" font-size="32" font-family="Arial, Helvetica, sans-serif" text-anchor="middle" fill="${subColor}">${escapeXml(copy.subtitle)}</text>
      <text x="${width / 2}" y="${height - 100}" font-size="28" font-family="Arial, Helvetica, sans-serif" text-anchor="middle" fill="${accent}" font-weight="700">UFInf AI Assets Studio</text>
    </svg>`;
  }

  if (template.style === 'story-format') {
    const safeZoneTop = 200;
    const safeZoneBottom = 300;
    const titleLines = chunkLine(copy.title.toUpperCase(), 16);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${background}"/><stop offset="100%" stop-color="#000"/></linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#sg)" />
      <circle cx="${width / 2}" cy="${height / 2}" r="360" fill="${accent}" fill-opacity="0.08" />
      <rect x="56" y="${safeZoneTop}" width="${width - 112}" height="${height - safeZoneTop - safeZoneBottom}" rx="28" fill="rgba(255,255,255,0.04)" stroke="${accent}" stroke-opacity="0.3" />
      <text x="${width / 2}" y="${safeZoneTop + 80}" font-size="30" font-family="Arial, Helvetica, sans-serif" text-anchor="middle" fill="${accent}" font-weight="700" letter-spacing="6">STORY</text>
      ${titleLines.map((line, idx) => `<text x="${width / 2}" y="${safeZoneTop + 200 + idx * 100}" font-size="86" font-family="Arial, Helvetica, sans-serif" font-weight="900" text-anchor="middle" fill="#fff" stroke="${background}" stroke-width="4">${escapeXml(line)}</text>`).join('')}
      <text x="${width / 2}" y="${height - safeZoneBottom + 60}" font-size="38" font-family="Arial, Helvetica, sans-serif" text-anchor="middle" fill="rgba(255,255,255,0.8)">${escapeXml(copy.subtitle)}</text>
      <rect x="${width / 2 - 200}" y="${height - safeZoneBottom + 110}" width="400" height="70" rx="35" fill="${accent}" />
      <text x="${width / 2}" y="${height - safeZoneBottom + 156}" font-size="32" font-family="Arial, Helvetica, sans-serif" text-anchor="middle" fill="#111" font-weight="800">${escapeXml(copy.cta)}</text>
      <text x="${width / 2}" y="${height - 80}" font-size="28" font-family="Arial, Helvetica, sans-serif" text-anchor="middle" fill="rgba(255,255,255,0.35)">\u2191 swipe up</text>
    </svg>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${background}"/><stop offset="100%" stop-color="#0d0d0d"/></linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bg)" />
    <circle cx="${width - 140}" cy="160" r="140" fill="${accent}" fill-opacity="0.24" />
    <rect x="56" y="56" width="${width - 112}" height="${height - 112}" rx="22" fill="rgba(255,255,255,0.04)" stroke="${accent}" stroke-opacity="0.35" />
    ${chunkLine(copy.title, 24).map((line, idx) => `<text x="90" y="${220 + idx * 76}" font-size="66" font-family="Arial, Helvetica, sans-serif" fill="#fff" font-weight="900">${escapeXml(line)}</text>`).join('')}
    <text x="90" y="${height - 170}" font-size="32" font-family="Arial, Helvetica, sans-serif" fill="#d4d4d4">${escapeXml(copy.subtitle)}</text>
    <text x="90" y="${height - 94}" font-size="38" font-family="Arial, Helvetica, sans-serif" fill="${accent}" font-weight="700">${escapeXml(copy.cta)}</text>
  </svg>`;
}

async function rasterizeSvg(svg: string, width: number, height: number, mimeType: 'image/png' | 'image/jpeg') {
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context unavailable');

    if (mimeType === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
    }

    ctx.drawImage(image, 0, 0, width, height);

    const output = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((value) => {
        if (value) resolve(value);
        else reject(new Error('Unable to export image blob'));
      }, mimeType, 0.92);
    });

    return output;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function AssetsStudio() {
  const { language } = useI18n();
  const copy = byLanguage(language, {
    pl: {
      title: 'AI Assets Studio — 100% za darmo',
      subtitle: 'Ponad 36 gotowych szablonow: memy, posty, miniatury, karuzele, story, reklamy, cytaty i LinkedIn. Export PNG / JPG / PDF. Zero platnych API. Zero rejestracji.',
      freeNote: '⭐ Tryb FREE: wszystkie szablony, wszystkie eksporty — lokalnie w przegladarce, bez serwera AI i bez kosztow.',
      prompt: 'Brief kreatywny (opcjonalnie)',
      promptPlaceholder: 'Np. Zrob mem o pracy zdalnej dla marketerow B2B — albo kliknij Generate Asset bez tekstu',
      type: 'Typ assetu',
      template: 'Szablon',
      generate: '⚡ Generate Asset',
      export: 'Eksport',
      png: '↓ PNG',
      jpg: '↓ JPG',
      pdf: '↓ PDF',
      quote: 'Hook marketingowy',
    },
    en: {
      title: 'AI Assets Studio — 100% Free',
      subtitle: '36+ ready templates: memes, posts, thumbnails, carousels, stories, ads, quote cards, and LinkedIn banners. Export PNG / JPG / PDF. No paid APIs. No signups.',
      freeNote: '⭐ FREE mode: all templates, all exports — local browser rendering, no AI server, no costs.',
      prompt: 'Creative brief (optional)',
      promptPlaceholder: 'E.g. Build a remote-work meme for B2B marketers — or click Generate Asset without text',
      type: 'Asset type',
      template: 'Template',
      generate: '⚡ Generate Asset',
      export: 'Export',
      png: '↓ PNG',
      jpg: '↓ JPG',
      pdf: '↓ PDF',
      quote: 'Marketing hook',
    },
    es: {
      title: 'AI Assets Studio — 100% Gratis',
      subtitle: 'Más de 36 plantillas: memes, posts, miniaturas, carruseles, stories, anuncios, citas y LinkedIn. Export PNG / JPG / PDF. Sin API de pago. Sin registro.',
      freeNote: '⭐ Modo FREE: todas las plantillas, todos los exports — render local en navegador, sin servidor AI, sin costos.',
      prompt: 'Brief creativo (opcional)',
      promptPlaceholder: 'Ej. Crea un meme sobre trabajo remoto para marketers B2B — o haz clic en Generate Asset sin texto',
      type: 'Tipo de asset',
      template: 'Plantilla',
      generate: '⚡ Generate Asset',
      export: 'Export',
      png: '↓ PNG',
      jpg: '↓ JPG',
      pdf: '↓ PDF',
      quote: 'Hook de marketing',
    },
  });

  const [prompt, setPrompt] = useState('');
  const [assetType, setAssetType] = useState<AssetType>('thumbnail');
  const [templateId, setTemplateId] = useState('thumb-shock-1');
  const [generated, setGenerated] = useState<AssetCopy>(() => aiCopyFromPrompt('', 'thumbnail', language));
  const [exporting, setExporting] = useState(false);

  const availableTemplates = useMemo(() => TEMPLATES.filter((item) => item.type === assetType), [assetType]);

  const activeTemplate = useMemo(() => {
    const fromSelected = TEMPLATES.find((item) => item.id === templateId && item.type === assetType);
    if (fromSelected) return fromSelected;
    return availableTemplates[0] || TEMPLATES[0];
  }, [assetType, availableTemplates, templateId]);

  const svgMarkup = useMemo(() => buildSvgMarkup(activeTemplate, generated), [activeTemplate, generated]);

  const previewDataUrl = useMemo(() => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`, [svgMarkup]);

  function runGenerate() {
    setGenerated(aiCopyFromPrompt(prompt, assetType, language));
  }

  async function exportImage(format: 'png' | 'jpg' | 'pdf') {
    setExporting(true);
    try {
      const nameBase = `${assetType}-${activeTemplate.id}-${Date.now()}`;

      if (format === 'png') {
        const blob = await rasterizeSvg(svgMarkup, activeTemplate.width, activeTemplate.height, 'image/png');
        downloadBlob(blob, `${nameBase}.png`);
        return;
      }

      if (format === 'jpg') {
        const blob = await rasterizeSvg(svgMarkup, activeTemplate.width, activeTemplate.height, 'image/jpeg');
        downloadBlob(blob, `${nameBase}.jpg`);
        return;
      }

      const pngBlob = await rasterizeSvg(svgMarkup, activeTemplate.width, activeTemplate.height, 'image/png');
      const pngBytes = new Uint8Array(await pngBlob.arrayBuffer());
      const pdf = await PDFDocument.create();
      const embedded = await pdf.embedPng(pngBytes);
      const page = pdf.addPage([activeTemplate.width, activeTemplate.height]);
      page.drawImage(embedded, { x: 0, y: 0, width: activeTemplate.width, height: activeTemplate.height });
      const pdfDataUri = await pdf.saveAsBase64({ dataUri: true });
      const anchor = document.createElement('a');
      anchor.href = pdfDataUri;
      anchor.download = `${nameBase}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>{copy.title}</h1>
        <p>{copy.subtitle}</p>
      </div>

      <div className="alert alert-info" style={{ marginBottom: 14 }}>
        <Sparkles size={14} /> {copy.freeNote}
      </div>

      <div className="grid-2" style={{ gap: 20, alignItems: 'start' }}>
        <div className="card" data-testid="as-controls">
          <div className="form-group">
            <label className="form-label">{copy.prompt}</label>
            <textarea
              data-testid="as-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder={copy.promptPlaceholder}
              style={{ minHeight: 110 }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{copy.type}</label>
            <div className="checkbox-group" style={{ gap: 8 }}>
              {(['meme', 'instagram', 'facebook', 'thumbnail', 'carousel', 'ad', 'quote', 'story', 'linkedin'] as AssetType[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  data-testid={`as-type-${item}`}
                  className={`btn btn-ghost btn-sm${assetType === item ? ' active' : ''}`}
                  onClick={() => {
                    setAssetType(item);
                    const nextTemplate = TEMPLATES.find((entry) => entry.type === item);
                    if (nextTemplate) setTemplateId(nextTemplate.id);
                  }}
                >
                  <Layers size={13} /> {item}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{copy.template}</label>
            <div className="checkbox-group" style={{ gap: 8 }}>
              {availableTemplates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  data-testid={`as-template-${template.id}`}
                  className={`btn btn-ghost btn-sm${templateId === template.id ? ' active' : ''}`}
                  onClick={() => setTemplateId(template.id)}
                >
                  <ImageIcon size={13} /> {template.label}
                </button>
              ))}
            </div>
          </div>

          <button type="button" data-testid="as-generate" className="btn btn-primary btn-full" onClick={runGenerate}>
            <Sparkles size={14} /> {copy.generate}
          </button>
        </div>

        <div className="card" data-testid="as-preview-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
            <div data-testid="as-preview-title" style={{ fontSize: 14, fontWeight: 700 }}>{generated.title}</div>
            <span className="badge badge-cyan">{activeTemplate.width} x {activeTemplate.height}</span>
          </div>

          <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--stroke)' }}>
            <img
              src={previewDataUrl}
              alt={generated.title}
              style={{ width: '100%', display: 'block', animation: 'asPulse 5s ease-in-out infinite' }}
            />
          </div>

          <div className="studio-output" style={{ marginTop: 12 }}>
            <strong>{copy.quote}:</strong> {generated.quote}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 8, marginTop: 12 }}>
            <button type="button" data-testid="as-export-png" className="btn btn-ghost btn-sm" onClick={() => void exportImage('png')} disabled={exporting}>
              <Download size={13} /> {copy.png}
            </button>
            <button type="button" data-testid="as-export-jpg" className="btn btn-ghost btn-sm" onClick={() => void exportImage('jpg')} disabled={exporting}>
              <Download size={13} /> {copy.jpg}
            </button>
            <button type="button" data-testid="as-export-pdf" className="btn btn-ghost btn-sm" onClick={() => void exportImage('pdf')} disabled={exporting}>
              <Download size={13} /> {copy.pdf}
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes asPulse {
          0% { transform: scale(1); filter: saturate(1); }
          50% { transform: scale(1.01); filter: saturate(1.08); }
          100% { transform: scale(1); filter: saturate(1); }
        }
      `}</style>
    </div>
  );
}
