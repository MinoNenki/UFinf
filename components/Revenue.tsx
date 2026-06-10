'use client';

import { TrendingUp, DollarSign } from 'lucide-react';
import { MOCK_REVENUE } from '@/lib/mockData';
import { byLanguage, useI18n } from '@/lib/i18n';

const maxMonthly = Math.max(...MOCK_REVENUE.monthly.map((item) => item.revenue));

export default function Revenue() {
  const { language } = useI18n();
  const copy = byLanguage(language, {
    pl: { title: 'Revenue AI', subtitle: 'Analiza przychodow, najskuteczniejszych tematow i prognoz wzrostu.', monthly: 'Przychod miesieczny', forecast: 'Prognoza 3M', niche: 'Najbardziej oplacalna nisza', forecastHint: 'Wzrost napedzany przez AI/Tech', trend: 'Trend przychodow', top: 'Najlepiej monetyzowane tresci', score: 'Score' },
    en: { title: 'Revenue AI', subtitle: 'Revenue analysis, top-performing topics, and growth forecasts.', monthly: 'Monthly revenue', forecast: '3M forecast', niche: 'Most profitable niche', forecastHint: 'Growth driven by AI/Tech', trend: 'Revenue trend', top: 'Best monetized content', score: 'Score' },
    es: { title: 'Revenue AI', subtitle: 'Analisis de ingresos, temas con mejor rendimiento y previsiones de crecimiento.', monthly: 'Ingresos mensuales', forecast: 'Pronostico 3M', niche: 'Nicho mas rentable', forecastHint: 'Crecimiento impulsado por AI/Tech', trend: 'Tendencia de ingresos', top: 'Contenido mejor monetizado', score: 'Score' },
  });
  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>{copy.title}</h1>
        <p>{copy.subtitle}</p>
      </div>

      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-8">
            <span className="stat-label">{copy.monthly}</span>
            <DollarSign size={16} color="var(--green)" />
          </div>
          <div className="stat-value">$1,120</div>
          <div className="stat-change stat-up">
            <TrendingUp size={12} /> +33% m/m
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">{copy.forecast}</div>
          <div className="stat-value" style={{ fontSize: 24 }}>{MOCK_REVENUE.forecast}</div>
          <div className="stat-change stat-up">{copy.forecastHint}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">{copy.niche}</div>
          <div className="stat-value" style={{ fontSize: 24 }}>{MOCK_REVENUE.topNiches[0].niche}</div>
          <div className="stat-change stat-up">{copy.score}: {MOCK_REVENUE.topNiches[0].score}/100</div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 20 }}>
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>{copy.trend}</h3>
          <div className="bar-chart" style={{ height: 140 }}>
            {MOCK_REVENUE.monthly.map((item) => (
              <div className="bar-chart-col" key={item.month}>
                <div className="bar-chart-val">${item.revenue}</div>
                <div
                  className="bar-chart-bar"
                  style={{ height: `${Math.max(10, Math.round((item.revenue / maxMonthly) * 100))}px` }}
                />
                <div className="bar-chart-label">{item.month}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>{copy.top}</h3>
          {MOCK_REVENUE.topContent.map((item) => (
            <div
              key={item.title}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid rgba(255,255,255,.06)',
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{item.title}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                  {item.platform} • {item.views}
                </div>
              </div>
              <span className="badge badge-green">${item.revenue}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
