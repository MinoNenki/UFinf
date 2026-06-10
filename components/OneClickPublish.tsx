'use client';

import { useEffect, useMemo, useState } from 'react';
import { byLanguage, useI18n } from '@/lib/i18n';

type Platform = 'tiktok' | 'youtube' | 'instagram' | 'facebook' | 'x';

const ALL_PLATFORMS: Platform[] = ['tiktok', 'youtube', 'instagram', 'facebook', 'x'];

export default function OneClickPublish() {
  const { language } = useI18n();
  const copy = byLanguage(language, {
    pl: { title: 'One Click Publish', subtitle: 'Kolejka publikacji z retry per platforma i hybrydowym routingiem koszt/jakosc.', topicLabel: 'Temat', nicheLabel: 'Nisza', platforms: 'Platformy', start: 'Publish Everywhere', starting: 'Uruchamianie...', empty: 'Brak aktywnego joba. Uruchom Publish Everywhere.', refresh: 'Odswiez status', worker: 'Uruchom worker retry', defaultTopic: 'Start USInf.com: AI Growth OS dla tworcow', defaultNiche: 'creator economy' },
    en: { title: 'One Click Publish', subtitle: 'Publishing queue with per-platform retry and hybrid cost/quality routing.', topicLabel: 'Topic', nicheLabel: 'Niche', platforms: 'Platforms', start: 'Publish Everywhere', starting: 'Starting...', empty: 'No active job yet. Start Publish Everywhere.', refresh: 'Refresh status', worker: 'Run retry worker', defaultTopic: 'USInf.com launch: AI Growth OS for creators', defaultNiche: 'creator economy' },
    es: { title: 'Publicacion en un clic', subtitle: 'Cola de publicacion con retry por plataforma y enrutamiento hibrido de coste/calidad.', topicLabel: 'Tema', nicheLabel: 'Nicho', platforms: 'Plataformas', start: 'Publicar en todas partes', starting: 'Iniciando...', empty: 'No hay un job activo. Inicia la publicacion.', refresh: 'Actualizar estado', worker: 'Ejecutar worker de retry', defaultTopic: 'Lanzamiento USInf.com: AI Growth OS para creadores', defaultNiche: 'creator economy' },
  });
  const [topic, setTopic] = useState(copy.defaultTopic);
  const [niche, setNiche] = useState(copy.defaultNiche);
  const [loading, setLoading] = useState(false);
  const [job, setJob] = useState<any>(null);
  const [platforms, setPlatforms] = useState<Platform[]>(ALL_PLATFORMS);

  useEffect(() => {
    setTopic(copy.defaultTopic);
    setNiche(copy.defaultNiche);
  }, [copy.defaultNiche, copy.defaultTopic]);

  const progress = useMemo(() => {
    if (!job?.platforms) return 0;
    const values = Object.values(job.platforms) as any[];
    const done = values.filter((x) => x.status === 'published' || x.status === 'failed').length;
    return Math.round((done / values.length) * 100);
  }, [job]);

  function togglePlatform(p: Platform) {
    setPlatforms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  }

  async function start() {
    setLoading(true);
    try {
      const res = await fetch('/api/publish/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          niche,
          plan: 'premium_plus',
          platforms,
          language,
        }),
      });
      const data = await res.json();
      setJob(data.job || null);
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    if (!job?.id) return;
    const res = await fetch(`/api/publish/jobs/${job.id}`);
    const data = await res.json();
    setJob(data.job || null);
  }

  async function runRetryWorker() {
    await fetch('/api/publish/worker', { method: 'POST' });
    await refresh();
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>{copy.title}</h1>
        <p>{copy.subtitle}</p>
      </div>

      <div className="grid-2" style={{ gap: 16 }}>
        <div className="card">
          <div className="form-group">
            <label className="form-label">{copy.topicLabel}</label>
            <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">{copy.nicheLabel}</label>
            <input type="text" value={niche} onChange={(e) => setNiche(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">{copy.platforms}</label>
            <div className="checkbox-group">
              {ALL_PLATFORMS.map((p) => (
                <label key={p} className={`checkbox-item${platforms.includes(p) ? ' selected' : ''}`}>
                  <input type="checkbox" checked={platforms.includes(p)} onChange={() => togglePlatform(p)} />
                  {p}
                </label>
              ))}
            </div>
          </div>

          <button className="btn btn-gradient btn-full" onClick={start} disabled={loading || platforms.length === 0}>
            {loading ? copy.starting : copy.start}
          </button>
        </div>

        <div className="card">
          {!job && <p style={{ color: 'var(--muted)' }}>{copy.empty}</p>}
          {job && (
            <>
              <div className="flex items-center justify-between mb-8">
                <strong>Job: {job.id}</strong>
                <span className="badge badge-cyan">{progress}%</span>
              </div>
              <div className="bar-chart" style={{ height: 20, marginBottom: 12 }}>
                <div className="bar-chart-bar" style={{ width: `${progress}%`, height: 10, borderRadius: 999 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                {Object.entries(job.platforms).map(([platform, state]: any) => (
                  <div key={platform} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span>{platform}</span>
                    <span className="badge badge-muted">{state.status} (#{state.attempts})</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-8" style={{ gap: 8 }}>
                <button className="btn btn-ghost btn-sm" onClick={refresh}>{copy.refresh}</button>
                <button className="btn btn-primary btn-sm" onClick={runRetryWorker}>{copy.worker}</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
