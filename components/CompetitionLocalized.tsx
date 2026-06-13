'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { byLanguage, useI18n } from '@/lib/i18n';

export default function CompetitionLocalized() {
  const { language } = useI18n();
  const copy = byLanguage(language, {
    pl: { title: 'Analiza konkurencji', subtitle: 'Ten modul nie pokazuje juz udawanej analizy konkurencji. Pokazujemy wynik dopiero po podlaczeniu realnego zrodla.', label: 'URL kanalu lub @nazwa', placeholder: 'np. https://youtube.com/@twoj-kanal lub @twoj-kanal', analyze: 'Sprawdz status', sample: 'Uzyj przykladowego wejscia', loading: 'Sprawdzam status', empty: 'Brak realnego polaczenia z danymi konkurencji. Wynik nie zostal wygenerowany, aby nie pokazywac klientowi zmyslonych liczb.' },
    en: { title: 'Competition analysis', subtitle: 'This module no longer shows fake competitor analysis. A result appears only after a real data source is connected.', label: 'Channel URL or @handle', placeholder: 'e.g. https://youtube.com/@your-channel or @your-channel', analyze: 'Check status', sample: 'Use sample input', loading: 'Checking status', empty: 'No real competitor data source is connected. No result was generated to avoid showing invented numbers.' },
    es: { title: 'Analisis de competencia', subtitle: 'Este modulo ya no muestra analisis falsos. El resultado aparece solo despues de conectar una fuente real.', label: 'URL del canal o @usuario', placeholder: 'ej. https://youtube.com/@tu-canal o @tu-canal', analyze: 'Comprobar estado', sample: 'Usar ejemplo', loading: 'Comprobando estado', empty: 'No hay una fuente real conectada para competencia. No se genera resultado para evitar cifras inventadas.' },
  });
  const [channelUrl, setChannelUrl] = useState('');
  const [analyzed, setAnalyzed] = useState(false);
  const [loading, setLoading] = useState(false);

  function analyze() {
    if (!channelUrl.trim() && !analyzed) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setAnalyzed(true); }, 250);
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
        {!analyzed && <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={() => { setChannelUrl('@twoj-kanal'); analyze(); }}>🔍 {copy.sample}</button>}
      </div>
      {loading && <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}><div className="spinner spinner-lg" style={{ margin: '0 auto 16px' }} /><p>{copy.loading} {channelUrl || '@twoj-kanal'}...</p></div>}
      {analyzed && !loading && <div className="card"><div className="alert alert-info">{copy.empty}</div></div>}
    </div>
  );
}
