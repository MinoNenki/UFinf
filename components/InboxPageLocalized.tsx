'use client';

import { MessageSquare } from 'lucide-react';
import { byLanguage, useI18n } from '@/lib/i18n';

export default function InboxPageLocalized() {
  const { language } = useI18n();
  const copy = byLanguage(language, {
    pl: { title: 'Smart Inbox', subtitle: 'To miejsce pokazuje tylko prawdziwe rozmowy po podlaczeniu kanalow i integracji skrzynek.', empty: 'Brak realnych wiadomosci do wyswietlenia.' },
    en: { title: 'Smart Inbox', subtitle: 'This area shows only real conversations after connecting channels and inbox integrations.', empty: 'No real messages to display.' },
    es: { title: 'Bandeja inteligente', subtitle: 'Esta seccion muestra solo conversaciones reales despues de conectar canales e integraciones.', empty: 'No hay mensajes reales para mostrar.' },
  });

  return (
    <div className="animate-in">
      <div className="page-header"><h1>{copy.title}</h1><p>{copy.subtitle}</p></div>
      <div className="card"><div className="alert alert-info"><MessageSquare size={16} />{copy.empty}</div></div>
    </div>
  );
}
