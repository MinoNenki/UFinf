'use client';

import { useState } from 'react';
import { Search, TrendingUp, BarChart3, Clock, Hash } from 'lucide-react';
import { MOCK_COMPETITOR } from '@/lib/mockData';
import { byLanguage, useI18n } from '@/lib/i18n';

const MAX_BAR = Math.max(...MOCK_COMPETITOR.postingFrequency.map((item) => item.count));
const MAX_HOUR = Math.max(...MOCK_COMPETITOR.bestHours.map((item) => item.score));

const WORD_SIZES: Record<string, string> = {
  AI: 'word-lg', ChatGPT: 'word-lg', automation: 'word-md', tools: 'word-md', creator: 'word-md', content: 'word-md', YouTube: 'word-sm', growth: 'word-sm', tutorial: 'word-sm', free: 'word-sm', tips: 'word-sm', '2025': 'word-sm',
};

export default function CompetitionLocalized() {
  const { language } = useI18n();
  const copy = byLanguage(language, {
    pl: { title: 'AI Konkurencja', subtitle: 'Analiza kanalow konkurencji: formaty, godziny, slowa kluczowe', label: 'URL kanalu lub @nazwa', placeholder: 'np. https://youtube.com/@techguru2025 lub @techguru2025', analyze: 'Analizuj kanal', sample: 'Zaladuj przyklad: @techguru2025', loading: 'Analizuje kanal', niche: 'Nisza', engagement: 'Zaangazowanie', subscribers: 'Subskrybenci', views: 'Sr. wyswietlen', top: 'Top 3 filmy', posting: 'Czestotliwosc publikacji', active: 'Najaktywniejszy', hours: 'Najlepsze godziny publikacji', peak: 'Szczyt zaangazowania', keywords: 'Najczestsze slowa kluczowe', topWord: 'Top slowo' },
    en: { title: 'AI Competition', subtitle: 'Competitor channel analysis: formats, hours, and keywords', label: 'Channel URL or @handle', placeholder: 'e.g. https://youtube.com/@techguru2025 or @techguru2025', analyze: 'Analyze channel', sample: 'Load sample: @techguru2025', loading: 'Analyzing channel', niche: 'Niche', engagement: 'Engagement', subscribers: 'Subscribers', views: 'Avg views', top: 'Top 3 videos', posting: 'Posting frequency', active: 'Most active', hours: 'Best publishing hours', peak: 'Peak engagement', keywords: 'Most frequent keywords', topWord: 'Top word' },
    es: { title: 'Competencia AI', subtitle: 'Analisis de canales de competencia: formatos, horarios y palabras clave', label: 'URL del canal o @usuario', placeholder: 'ej. https://youtube.com/@techguru2025 o @techguru2025', analyze: 'Analizar canal', sample: 'Cargar ejemplo: @techguru2025', loading: 'Analizando canal', niche: 'Nicho', engagement: 'Engagement', subscribers: 'Suscriptores', views: 'Vistas medias', top: 'Top 3 videos', posting: 'Frecuencia de publicacion', active: 'Mas activo', hours: 'Mejores horas de publicacion', peak: 'Pico de engagement', keywords: 'Palabras clave mas frecuentes', topWord: 'Palabra top' },
  });
  const [channelUrl, setChannelUrl] = useState('');
  const [analyzed, setAnalyzed] = useState(false);
  const [loading, setLoading] = useState(false);

  function analyze() {
    if (!channelUrl.trim() && !analyzed) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setAnalyzed(true); }, 1400);
  }

  return (
    <div className="animate-in">
      <div className="page-header"><h1>{copy.title}</h1><p>{copy.subtitle}</p></div>
      <div className="card mb-20" style={{ marginBottom: 20 }}>
        <div className="flex items-center gap-12" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <label className="form-label">{copy.label}</label>
            <input type="url" value={channelUrl} onChange={(e) => setChannelUrl(e.target.value)} placeholder={copy.placeholder} />
          </div>
          <div style={{ marginTop: 20 }}><button className="btn btn-primary" onClick={analyze} disabled={loading}>{loading ? `⏳ ${copy.loading}...` : <><Search size={15} /> {copy.analyze}</>}</button></div>
        </div>
        {!analyzed && <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={() => { setChannelUrl('@techguru2025'); analyze(); }}>🔍 {copy.sample}</button>}
      </div>
      {loading && <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}><div className="spinner spinner-lg" style={{ margin: '0 auto 16px' }} /><p>{copy.loading} {channelUrl || '@techguru2025'}...</p></div>}
      {analyzed && !loading && (
        <div className="animate-in">
          <div className="card mb-20" style={{ marginBottom: 20, background: 'linear-gradient(135deg,rgba(34,211,238,.08),rgba(139,92,246,.06))' }}>
            <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 12 }}>
              <div><h2 style={{ fontSize: 22, fontWeight: 900 }}>{MOCK_COMPETITOR.username}</h2><div style={{ color: 'var(--muted)', fontSize: 13 }}>{copy.niche}: {MOCK_COMPETITOR.niche} • {copy.engagement}: {MOCK_COMPETITOR.engagementRate}</div></div>
              <div className="flex items-center gap-16" style={{ gap: 16 }}>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: 22, fontWeight: 900, color: 'var(--cyan)' }}>{MOCK_COMPETITOR.subscribers}</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>{copy.subscribers}</div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: 22, fontWeight: 900, color: 'var(--violet)' }}>{MOCK_COMPETITOR.avgViews}</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>{copy.views}</div></div>
              </div>
            </div>
          </div>

          <div className="grid-2 mb-20" style={{ gap: 20, marginBottom: 20 }}>
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}><TrendingUp size={16} color="var(--cyan)" style={{ marginRight: 8 }} />{copy.top}</h3>
              {MOCK_COMPETITOR.topVideos.map((video, index) => <div key={index} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.06)' }}><div style={{ width: 72, height: 44, borderRadius: 8, background: 'rgba(255,255,255,.08)', flexShrink: 0, display: 'grid', placeItems: 'center', fontSize: 20 }}>{['🥇', '🥈', '🥉'][index]}</div><div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, lineHeight: 1.4 }}>{video.title}</div><div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--muted)' }}><span>👁 {video.views}</span><span>❤️ {video.likes}</span></div></div></div>)}
            </div>
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}><BarChart3 size={16} color="var(--violet)" style={{ marginRight: 8 }} />{copy.posting}</h3>
              <div className="bar-chart">{MOCK_COMPETITOR.postingFrequency.map((item) => <div key={item.day} className="bar-chart-col"><div className="bar-chart-val">{item.count > 0 ? item.count : ''}</div><div className="bar-chart-bar violet" style={{ height: `${item.count === 0 ? 4 : Math.round((item.count / MAX_BAR) * 70)}px` }} /><div className="bar-chart-label">{item.day}</div></div>)}</div>
              <div style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)' }}>{copy.active}: <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>Friday</span> (4 videos/week)</div>
            </div>
          </div>

          <div className="grid-2" style={{ gap: 20 }}>
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}><Clock size={16} color="var(--green)" style={{ marginRight: 8 }} />{copy.hours}</h3>
              <div className="heatmap">{MOCK_COMPETITOR.bestHours.map((item) => { const intensity = item.score / MAX_HOUR; return <div key={item.hour} className="heatmap-cell" style={{ background: `rgba(34,211,238,${intensity * 0.7 + 0.05})`, color: intensity > 0.6 ? '#030d1a' : 'var(--text)', fontWeight: intensity > 0.6 ? 900 : 400 }}>{item.hour}h</div>; })}</div>
              <div style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)' }}>{copy.peak}: <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>18:00-20:00</span></div>
            </div>
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}><Hash size={16} color="var(--pink)" style={{ marginRight: 8 }} />{copy.keywords}</h3>
              <div className="word-cloud">{MOCK_COMPETITOR.topKeywords.map((word) => <span key={word} className={`word-item ${WORD_SIZES[word] || 'word-sm'}`}>{word}</span>)}</div>
              <div style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)' }}>{copy.topWord}: <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>AI</span> - appears in 78% of videos</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
