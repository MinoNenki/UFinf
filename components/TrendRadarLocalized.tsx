'use client';

import { AlertTriangle } from 'lucide-react';
import { navigate } from '@/lib/navigate';
import { byLanguage, useI18n } from '@/lib/i18n';

export default function TrendRadarLocalized() {
  const { language } = useI18n();
  const copy = byLanguage(language, {
    pl: { title: 'Radar trendow', subtitle: 'Ten modul nie pokazuje juz danych demo. Trendy pojawia sie dopiero po podlaczeniu realnych zrodel i historii publikacji.', empty: 'Brak realnych danych trendowych do pokazania.', cta: 'Przejdz do generowania tresci' },
    en: { title: 'Trend Radar', subtitle: 'This module no longer shows demo data. Trends appear only after real sources and publishing history are connected.', empty: 'No real trend data available yet.', cta: 'Go to content generation' },
    es: { title: 'Radar de tendencias', subtitle: 'Este modulo ya no muestra datos demo. Las tendencias apareceran solo despues de conectar fuentes reales e historial de publicaciones.', empty: 'Todavia no hay datos reales de tendencias.', cta: 'Ir a generar contenido' },
  });

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>{copy.title}</h1>
        <p>{copy.subtitle}</p>
      </div>
      <div className="card">
        <div className="alert alert-warning" style={{ marginBottom: 16 }}>
          <AlertTriangle size={18} />
          <div>{copy.empty}</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard/factory')}>{copy.cta}</button>
      </div>
    </div>
  );
}
