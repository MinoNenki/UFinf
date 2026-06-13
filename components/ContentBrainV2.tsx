'use client';

import { useEffect, useState } from 'react';
import { byLanguage, useI18n } from '@/lib/i18n';

export default function ContentBrainV2() {
  const { language } = useI18n();
  const copy = byLanguage(language, {
    pl: { title: 'Mózg tresci AI', subtitle: 'Ranking tematow i godzin publikacji wyłącznie na podstawie realnych metryk.', refresh: 'Odswiez insighty', loading: 'Ladowanie...', topics: 'Top tematy', hours: 'Najlepsze godziny', recs: 'Rekomendacje', samples: 'probek', avgViews: 'srednie wyswietlenia', empty: 'Brak realnych insightow. Nie dodajemy juz danych demo.' },
    en: { title: 'AI Content Brain', subtitle: 'Topic and publish-time ranking based only on real metrics.', refresh: 'Refresh insights', loading: 'Loading...', topics: 'Top topics', hours: 'Best hours', recs: 'Recommendations', samples: 'samples', avgViews: 'avg views', empty: 'No real insights yet. Demo metrics are no longer injected.' },
    es: { title: 'Cerebro de contenido AI', subtitle: 'Ranking de temas y horarios basado solo en metricas reales.', refresh: 'Actualizar insights', loading: 'Cargando...', topics: 'Temas top', hours: 'Mejores horas', recs: 'Recomendaciones', samples: 'muestras', avgViews: 'vistas medias', empty: 'Todavia no hay insights reales. Ya no inyectamos metricas demo.' },
  });
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/content-brain/insights?limit=6&lang=${language}`);
      const data = await res.json();
      setInsights(data);
    } catch {
      setInsights({ topTopics: [], bestHours: [], recommendations: [] });
    } finally {
      setLoading(false);
    }
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
        </div>
      </div>

      {!insights && <div className="card">{copy.loading}</div>}

      {insights && !(insights.topTopics?.length || insights.bestHours?.length || insights.recommendations?.length) && (
        <div className="card"><div className="alert alert-info">{copy.empty}</div></div>
      )}

      {insights && (insights.topTopics?.length || insights.bestHours?.length || insights.recommendations?.length) ? (
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
      ) : null}
    </div>
  );
}
