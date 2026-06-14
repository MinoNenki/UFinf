'use client';

import { useMemo, useState } from 'react';
import { Download, Image as ImageIcon, Layers, Sparkles } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { byLanguage, useI18n } from '@/lib/i18n';

type AssetType = 'meme' | 'instagram' | 'facebook' | 'thumbnail' | 'carousel' | 'ad';

type AssetTemplate = {
  id: string;
  type: AssetType;
  label: string;
  width: number;
  height: number;
  background: string;
  accent: string;
  style: 'meme-classic' | 'social-gradient' | 'thumbnail-bold' | 'carousel-clean' | 'ad-convert';
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
  { id: 'meme-classic-1', type: 'meme', label: 'Meme Classic', width: 1080, height: 1080, background: '#141414', accent: '#ffffff', style: 'meme-classic' },
  { id: 'meme-contrast-2', type: 'meme', label: 'Meme Contrast', width: 1080, height: 1080, background: '#001a30', accent: '#67f7ff', style: 'meme-classic' },
  { id: 'ig-neon-1', type: 'instagram', label: 'Instagram Neon', width: 1080, height: 1350, background: '#081220', accent: '#67f7ff', style: 'social-gradient' },
  { id: 'ig-editorial-2', type: 'instagram', label: 'Instagram Editorial', width: 1080, height: 1350, background: '#1b1422', accent: '#ffcf5b', style: 'social-gradient' },
  { id: 'fb-boost-1', type: 'facebook', label: 'Facebook Boost', width: 1200, height: 630, background: '#0b1e3a', accent: '#92ffcb', style: 'social-gradient' },
  { id: 'fb-offer-2', type: 'facebook', label: 'Facebook Offer', width: 1200, height: 630, background: '#2a1d14', accent: '#ff9e6b', style: 'social-gradient' },
  { id: 'thumb-shock-1', type: 'thumbnail', label: 'YouTube Shock', width: 1280, height: 720, background: '#140f28', accent: '#ff5d8f', style: 'thumbnail-bold' },
  { id: 'thumb-authority-2', type: 'thumbnail', label: 'YouTube Authority', width: 1280, height: 720, background: '#10211f', accent: '#4dffe1', style: 'thumbnail-bold' },
  { id: 'carousel-clean-1', type: 'carousel', label: 'Carousel Clean', width: 1080, height: 1080, background: '#101820', accent: '#6fe7ff', style: 'carousel-clean' },
  { id: 'carousel-bold-2', type: 'carousel', label: 'Carousel Bold', width: 1080, height: 1080, background: '#1d1329', accent: '#ffbf67', style: 'carousel-clean' },
  { id: 'ad-convert-1', type: 'ad', label: 'Ad Conversion', width: 1080, height: 1080, background: '#10191f', accent: '#58f3c3', style: 'ad-convert' },
  { id: 'ad-sale-2', type: 'ad', label: 'Ad Quick Sale', width: 1080, height: 1080, background: '#24110f', accent: '#ff856a', style: 'ad-convert' },
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
    instagram: language === 'pl' ? '3 rzeczy, ktore podnosza zasieg' : language === 'es' ? '3 cosas que elevan tu alcance' : '3 things that increase your reach',
    facebook: language === 'pl' ? 'Case study: wzrost bez zwiekszania budzetu' : language === 'es' ? 'Caso real: crecer sin subir presupuesto' : 'Case study: growth without raising budget',
    thumbnail: language === 'pl' ? 'NIKT O TYM NIE MOWI' : language === 'es' ? 'NADIE TE LO DICE' : 'NOBODY TELLS YOU THIS',
    carousel: language === 'pl' ? 'Plan 5 krokow na ten tydzien' : language === 'es' ? 'Plan de 5 pasos para esta semana' : '5-step plan for this week',
    ad: language === 'pl' ? 'Oferta limitowana: tylko dzis' : language === 'es' ? 'Oferta limitada: solo hoy' : 'Limited offer: today only',
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

  return {
    title: typeHooks[type],
    subtitle,
    cta: baseCta,
    topLine: type === 'meme' ? chunkLine(typeHooks[type], 18).join(' | ') : chunkLine(short, 24).join(' | '),
    bottomLine: type === 'meme' ? chunkLine(short, 18).join(' | ') : chunkLine(baseCta, 24).join(' | '),
    quote,
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
      title: 'AI Assets Studio',
      subtitle: 'Darmowy generator szablonow: memy, posty, miniatury, karuzele i grafiki reklamowe bez platnego API.',
      freeNote: 'Tryb FREE: tekst i grafiki budowane lokalnie na szablonach HTML/SVG.',
      prompt: 'Brief kreatywny',
      promptPlaceholder: 'Np. Zrob mem o pracy zdalnej dla marketerow B2B',
      type: 'Typ assetu',
      template: 'Szablon',
      generate: 'Generate Asset',
      export: 'Eksport',
      png: 'Export PNG',
      jpg: 'Export JPG',
      pdf: 'Export PDF',
      quote: 'Copy marketingowe',
    },
    en: {
      title: 'AI Assets Studio',
      subtitle: 'Free template generator for memes, social posts, thumbnails, carousels, and ad creatives without paid image APIs.',
      freeNote: 'FREE mode: copy and visuals generated locally from HTML/SVG templates.',
      prompt: 'Creative brief',
      promptPlaceholder: 'E.g. Build a remote-work meme for B2B marketers',
      type: 'Asset type',
      template: 'Template',
      generate: 'Generate Asset',
      export: 'Export',
      png: 'Export PNG',
      jpg: 'Export JPG',
      pdf: 'Export PDF',
      quote: 'Marketing copy',
    },
    es: {
      title: 'AI Assets Studio',
      subtitle: 'Generador gratuito de plantillas para memes, posts, miniaturas, carruseles y anuncios sin API de imagen paga.',
      freeNote: 'Modo FREE: texto y visuales generados localmente desde plantillas HTML/SVG.',
      prompt: 'Brief creativo',
      promptPlaceholder: 'Ej. Crea un meme sobre trabajo remoto para marketers B2B',
      type: 'Tipo de asset',
      template: 'Plantilla',
      generate: 'Generate Asset',
      export: 'Export',
      png: 'Export PNG',
      jpg: 'Export JPG',
      pdf: 'Export PDF',
      quote: 'Copy de marketing',
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
              {(['meme', 'instagram', 'facebook', 'thumbnail', 'carousel', 'ad'] as AssetType[]).map((item) => (
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
