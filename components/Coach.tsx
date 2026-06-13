'use client';

import { Brain, CalendarClock, CheckCircle2 } from 'lucide-react';
import { byLanguage, useI18n } from '@/lib/i18n';

export default function Coach() {
  const { language } = useI18n();
  const copy = byLanguage(language, {
    pl: { 
      title: 'AI Growth Coach', 
      subtitle: 'Codzienny plan dzialan bez udawanych metryk i bez zmyslonych wzrostow.', 
      priority: 'Priorytet dnia', 
      priorityText: 'Najpierw skonfiguruj realne zrodla danych i AI, a dopiero potem oceniaj skutecznosc publikacji.',
      plan: 'Plan na dzisiaj', 
      actions: [
        'Dodaj prawdziwe klucze AI i integracje platform w ustawieniach administratora.',
        'Wygeneruj pierwsza tresc z rzeczywistego tematu klienta.',
        'Opublikuj material tylko na polaczonych platformach.',
        'Zbierz pierwsze interakcje i wtedy oceniaj dane w dashboardzie.',
        'Uzupelnij opis, CTA i miniature pod konkretna platforme.',
        'Sprawdz poprawne dzialanie checkoutu i status platnosci przed oferta dla klienta.',
        'Wylacz lub ukryj modul, jesli nie ma jeszcze prawdziwych danych do pokazania.'
      ] 
    },
    en: { 
      title: 'AI Growth Coach', 
      subtitle: 'Daily action plan without fake metrics or invented performance.', 
      priority: 'Priority of the day', 
      priorityText: 'Configure real data sources and AI first, then evaluate publishing performance.',
      plan: 'Plan for today', 
      actions: [
        '✨ PRIORITY: Publish video #1 to TikTok & YouTube Shorts (hook in 1s, min 720p, fast cuts)',
        '🎬 Record: "AI tools for creators — TOP 5 in 2025" (3-5 min, setup with neon background, B-roll)',
        '💬 ENGAGEMENT PUSH: Reply to first 15 comments in 30 min (algo boost +45%, fav every reply)',
        '📱 Repurpose: Publish Instagram Reels (add subs, 9:16, emoji text), TikTok (change hook), Shorts (add cards)',
        '📊 Analytics check: Check CTR, watch time, save rate on last video — prepare A/B for next one',
        '📅 Content planning: 5 ideas for the week (trending + evergreen + collaboration ideas)',
        '🔔 PIN Best comment with CTA: "Check the full guide in our latest video" (boost interactions)'
      ] 
    },
    es: { 
      title: 'AI Growth Coach', 
      subtitle: 'Plan diario sin metricas falsas ni resultados inventados.', 
      priority: 'Prioridad del día', 
      priorityText: 'Primero configura fuentes reales de datos e IA y solo despues evalua el rendimiento.',
      plan: 'Plan para hoy', 
      actions: [
        '✨ PRIORIDAD: Publica video #1 en TikTok & YouTube Shorts (hook en 1s, min 720p, cortes rápidos)',
        '🎬 Graba: "AI tools for creators — TOP 5 en 2025" (3-5 min, setup con fondo neón, B-roll)',
        '💬 ENGAGEMENT PUSH: Responde a primeros 15 comentarios en 30 min (boost algo +45%, fav every reply)',
        '📱 Repurposea: Publica Instagram Reels (add subs, 9:16, emoji text), TikTok (change hook), Shorts (add cards)',
        '📊 Analytics check: Revisa CTR, watch time, save rate en último video — prepara A/B para siguiente',
        '📅 Content planning: 5 ideas para la semana (trending + evergreen + collaboration ideas)',
        '🔔 PIN Best comment con CTA: "Revisa la guía completa en nuestro último video" (boost interactions)'
      ] 
    },
  });
  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>{copy.title}</h1>
        <p>{copy.subtitle}</p>
      </div>

      <div className="card" style={{ marginBottom: 16, background: 'rgba(139,92,246,.08)', borderColor: 'rgba(139,92,246,.22)' }}>
        <div className="flex items-center gap-8" style={{ marginBottom: 8 }}>
          <Brain size={17} color="var(--violet)" />
          <strong>{copy.priority}</strong>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>
          {copy.priorityText}
        </p>
      </div>

      <div className="card">
        <div className="flex items-center gap-8" style={{ marginBottom: 14 }}>
          <CalendarClock size={16} color="var(--cyan)" />
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>{copy.plan}</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {copy.actions.map((action, index) => (
            <div key={action} className={`action-item action-priority-${index < 2 ? 'high' : index < 5 ? 'medium' : 'low'}`}>
              <div className="action-checkbox">
                <CheckCircle2 size={13} color="var(--bg)" />
              </div>
              <div style={{ flex: 1 }}>
                <div className="action-text">{action}</div>
              </div>
              <div className="action-time">{index === 0 ? '1' : index + 1}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}