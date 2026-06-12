'use client';

import { useMemo, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { MOCK_TRENDS, NICHES } from '@/lib/mockData';
import { navigate } from '@/lib/navigate';
import { byLanguage, useI18n } from '@/lib/i18n';

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values);
  return <div className="sparkline">{values.map((v, i) => <span key={i} style={{ height: `${Math.round((v / max) * 22)}px` }} />)}</div>;
}

export default function TrendRadarLocalized() {
  const { language } = useI18n();
  const copy = byLanguage(language, {
    pl: { title: 'Trend Radar', subtitle: 'Rosnace tematy i sygnaly trendow, ktore realnie zwiekszaja zasieg i sprzedaz', filters: ['Dzisiaj', 'Ten tydzien', 'Ten miesiac'], all: 'Wszystkie', hot: 'Goracy', growing: 'Rosnacy', growth: 'wzrost', views: 'wyswietlen', generate: 'Wygeneruj tresc ->', action: 'Wygeneruj teraz', table: ['Trend', 'Nisza', 'Wzrost', 'Wyswietlenia', 'Wykres', 'Akcja'] },
    en: { title: 'Trend Radar', subtitle: 'Rising topics and trend signals that directly increase reach and revenue', filters: ['Today', 'This week', 'This month'], all: 'All', hot: 'Hot', growing: 'Rising', growth: 'growth', views: 'views', generate: 'Generate content ->', action: 'Generate now', table: ['Trend', 'Niche', 'Growth', 'Views', 'Chart', 'Action'] },
    es: { title: 'Radar de tendencias', subtitle: 'Temas en crecimiento y señales de tendencia que aumentan alcance e ingresos', filters: ['Hoy', 'Esta semana', 'Este mes'], all: 'Todos', hot: 'Caliente', growing: 'En crecimiento', growth: 'crecimiento', views: 'vistas', generate: 'Generar contenido ->', action: 'Generar ahora', table: ['Tendencia', 'Nicho', 'Crecimiento', 'Vistas', 'Grafico', 'Accion'] },
  });
  const [activeNiche, setActiveNiche] = useState('all');
  const [activeFilter, setActiveFilter] = useState(copy.filters[1]);

  const filtered = useMemo(() => activeNiche === 'all' ? MOCK_TRENDS : MOCK_TRENDS.filter((item) => item.niche === activeNiche), [activeNiche]);
  const sorted = [...filtered].sort((a, b) => b.growth - a.growth);

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>{copy.title}</h1>
        <p>{copy.subtitle}</p>
      </div>

      <div className="grid-3 mb-20" style={{ marginBottom: 20 }}>
        {sorted.slice(0, 3).map((trend, index) => (
          <div key={trend.id} className={`card ${index === 0 ? 'card-glow-cyan' : ''}`} style={{ position: 'relative' }}>
            <div className="flex items-center justify-between mb-8">
              <span className="badge badge-muted" style={{ fontSize: 11 }}>{trend.niche}</span>
              {index === 0 && <span className="hot-badge">🔥 HOT</span>}
              {index === 1 && <span className="badge badge-orange" style={{ fontSize: 10 }}>🔥 {copy.hot}</span>}
              {index === 2 && <span className="badge badge-yellow" style={{ fontSize: 10 }}>📈 {copy.growing}</span>}
            </div>
            <h3 style={{ fontSize: 16, marginBottom: 6 }}>{trend.topic}</h3>
            <div className="flex items-center gap-12">
              <div>
                <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--cyan)' }}>+{trend.growth}%</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{copy.growth}</div>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{trend.views}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{copy.views}</div>
              </div>
            </div>
            <button className="btn btn-primary btn-sm btn-full btn-pulse-attention" style={{ marginTop: 12 }} onClick={() => navigate('/dashboard/factory')}>{copy.generate}</button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-16" style={{ marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div className="flex items-center gap-8" style={{ flexWrap: 'wrap', gap: 8 }}>
          <button className={`btn btn-sm ${activeNiche === 'all' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveNiche('all')}>{copy.all}</button>
          {NICHES.map((niche) => <button key={niche} className={`btn btn-sm ${activeNiche === niche ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveNiche(niche)}>{niche}</button>)}
        </div>
        <div className="flex items-center gap-4">{copy.filters.map((item) => <button key={item} className={`btn btn-sm ${activeFilter === item ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveFilter(item)}>{item}</button>)}</div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>#</th><th>{copy.table[0]}</th><th>{copy.table[1]}</th><th>{copy.table[2]}</th><th>{copy.table[3]}</th><th>{copy.table[4]}</th><th>{copy.table[5]}</th></tr>
          </thead>
          <tbody>
            {sorted.map((trend, index) => (
              <tr key={trend.id}>
                <td style={{ color: 'var(--muted)', fontWeight: 700 }}>{index + 1}</td>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontWeight: 600 }}>{trend.topic}</span>{trend.hot && <span className="hot-badge">🔥</span>}</div></td>
                <td><span className="badge badge-muted" style={{ fontSize: 11 }}>{trend.niche}</span></td>
                <td><span style={{ color: 'var(--green)', fontWeight: 700 }}><TrendingUp size={13} style={{ verticalAlign: 'middle', marginRight: 3 }} />+{trend.growth}%</span></td>
                <td style={{ color: 'var(--muted)' }}>{trend.views}</td>
                <td><Sparkline values={[20, 35, 45, 30, 60, 70, trend.growth > 80 ? 100 : 85]} /></td>
                <td><button className="btn btn-primary btn-sm btn-pulse-attention" onClick={() => navigate('/dashboard/factory')}>{copy.action}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
