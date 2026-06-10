'use client';

import { useEffect, useState } from 'react';
import { byLanguage, useI18n } from '@/lib/i18n';

export default function ContentBrainV2() {
  const { language } = useI18n();
  const copy = byLanguage(language, {
    pl: { title: 'AI Content Brain v2', subtitle: 'Ranking tematow i godzin publikacji na realnych metrykach.', refresh: 'Odswiez insighty', seed: 'Dodaj metryki demo', loading: 'Ladowanie...', topics: 'Top tematy', hours: 'Najlepsze godziny', recs: 'Rekomendacje', samples: 'probek', avgViews: 'srednie wyswietlenia' },
    en: { title: 'AI Content Brain v2', subtitle: 'Ranking of topics and publishing hours based on real metrics.', refresh: 'Refresh insights', seed: 'Add demo metrics', loading: 'Loading...', topics: 'Top topics', hours: 'Best hours', recs: 'Recommendations', samples: 'samples', avgViews: 'avg views' },
    es: { title: 'AI Content Brain v2', subtitle: 'Ranking de temas y horas de publicacion basado en metricas reales.', refresh: 'Actualizar insights', seed: 'Agregar metricas demo', loading: 'Cargando...', topics: 'Temas top', hours: 'Mejores horas', recs: 'Recomendaciones', samples: 'muestras', avgViews: 'vistas medias' },
  });
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/content-brain/insights?limit=6&lang=${language}`);
      const data = await res.json();
      setInsights(data);
    } finally {
      setLoading(false);
    }
  }

  async function seedDemo() {
    const demoEvents = [
      { topic: 'AI automations', platform: 'youtube', publishHour: 19, views: 18300, likes: 1200, comments: 210, shares: 150, retentionRate: 0.52, conversions: 83, revenueUsd: 92 },
      { topic: 'AI automations', platform: 'tiktok', publishHour: 20, views: 26400, likes: 1900, comments: 320, shares: 410, retentionRate: 0.48, conversions: 71, revenueUsd: 54 },
      { topic: 'Programming tutorials', platform: 'youtube', publishHour: 14, views: 9300, likes: 480, comments: 66, shares: 44, retentionRate: 0.36, conversions: 24, revenueUsd: 21 },
      { topic: 'Creator monetization', platform: 'instagram', publishHour: 18, views: 15200, likes: 970, comments: 140, shares: 120, retentionRate: 0.44, conversions: 66, revenueUsd: 74 },
      { topic: 'AI automations', platform: 'facebook', publishHour: 18, views: 8100, likes: 430, comments: 57, shares: 38, retentionRate: 0.34, conversions: 28, revenueUsd: 18 },
    ];

    await fetch('/api/content-brain/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: demoEvents }),
    });

    await load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>{copy.title}</h1>
        <p>{copy.subtitle}</p>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="flex items-center gap-8" style={{ gap: 8 }}>
          <button className="btn btn-primary btn-sm" onClick={load} disabled={loading}>{copy.refresh}</button>
          <button className="btn btn-ghost btn-sm" onClick={seedDemo}>{copy.seed}</button>
        </div>
      </div>

      {!insights && <div className="card">{copy.loading}</div>}

      {insights && (
        <div className="grid-2" style={{ gap: 16 }}>
          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>{copy.topics}</h3>
            {(insights.topTopics || []).map((item: any) => (
              <div key={item.topic} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{item.topic}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{item.samples} {copy.samples} • {copy.avgViews} {item.avgViews}</div>
                </div>
                <div className="badge badge-green">+{item.upliftPct}%</div>
              </div>
            ))}
          </div>

          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>{copy.hours}</h3>
            {(insights.bestHours || []).map((item: any) => (
              <div key={item.hour} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                <span>{item.hour}:00</span>
                <span className="badge badge-cyan">score {item.score}</span>
              </div>
            ))}
          </div>

          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>{copy.recs}</h3>
            {(insights.recommendations || []).map((r: string) => (
              <div key={r} className="check-item">{r}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
