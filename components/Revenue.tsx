'use client';

import { DollarSign } from 'lucide-react';
import { byLanguage, useI18n } from '@/lib/i18n';

export default function Revenue() {
  const { language } = useI18n();
  const copy = byLanguage(language, {
    pl: { title: 'Przychody AI', subtitle: 'Ten modul pokazuje tylko prawdziwe dane z platnosci i monetyzacji.', empty: 'Brak realnych danych przychodowych. Skonfiguruj Stripe i poczekaj na pierwsze prawdziwe transakcje.' },
    en: { title: 'Revenue AI', subtitle: 'This module shows only real payment and monetization data.', empty: 'No real revenue data yet. Configure Stripe and wait for the first real transactions.' },
    es: { title: 'Ingresos AI', subtitle: 'Este modulo muestra solo datos reales de pagos y monetizacion.', empty: 'Todavia no hay datos reales de ingresos. Configura Stripe y espera las primeras transacciones reales.' },
  });
  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>{copy.title}</h1>
        <p>{copy.subtitle}</p>
      </div>

      <div className="card">
        <div className="alert alert-info"><DollarSign size={16} />{copy.empty}</div>
      </div>
    </div>
  );
}
