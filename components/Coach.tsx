'use client';

import { Brain, CalendarClock, CheckCircle2 } from 'lucide-react';
import { MOCK_COACH_ACTIONS } from '@/lib/mockData';
import { byLanguage, useI18n } from '@/lib/i18n';

export default function Coach() {
  const { language } = useI18n();
  const copy = byLanguage(language, {
    pl: { 
      title: 'AI Growth Coach', 
      subtitle: 'Codzienny plan działań na podstawie trendów i wyników kanału.', 
      priority: 'Priorytet dnia', 
      priorityText: '✨ Opublikuj główny material między 18:00 a 20:00 i odpowiedz na 15 najnowszych komentarzy w ciągu 30 minut — to podnosi reach +45%.',
      plan: 'Plan na dzisiaj', 
      actions: [
        '✨ PRIORYTET: Opublikuj film #1 na TikTok & YouTube Shorts (hook w 1s, min 720p, fast cuts)',
        '🎬 Nagraj: "AI tools for creators — TOP 5 w 2025" (3-5 min, setup z neonowym tłem, B-roll)',
        '💬 ENGAGEMENT PUSH: Odpowiedz na pierwsze 15 komentarzy w 30 min (boost +45% algorytm, fav every reply)',
        '📱 Repurpose: Opublikuj Instagram Reels (add subs, 9:16, emoji text), TikTok (zmień hook), Shorts (add cards)',
        '📊 Analytics check: Sprawdź CTR, watch time, save rate na ostatnim filmie — przygotuj A/B dla kolejnego',
        '📅 Content planning: 5 pomysłów na tydzień (trending + evergreen + collaboration ideas)',
        '🔔 PIN Best comment z CTą: "Sprawdź pełny poradnik w naszym ostatnim video" (boost interactions)'
      ] 
    },
    en: { 
      title: 'AI Growth Coach', 
      subtitle: 'Daily action plan based on trends and channel performance.', 
      priority: 'Priority of the day', 
      priorityText: '✨ Publish your main piece between 6:00 PM and 8:00 PM and reply to the latest 15 comments within 30 minutes — this boosts reach +45%.',
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
      subtitle: 'Plan diario de acciones basado en tendencias y resultados del canal.', 
      priority: 'Prioridad del día', 
      priorityText: '✨ Publica la pieza principal entre las 18:00 y las 20:00 y responde a los 15 comentarios más recientes en 30 minutos — esto aumenta reach +45%.',
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
          {MOCK_COACH_ACTIONS.map((item, index) => (
            <div key={item.id} className={`action-item action-priority-${item.priority}${item.done ? ' done' : ''}`}>
              <div className="action-checkbox">
                {item.done && <CheckCircle2 size={13} color="var(--bg)" />}
              </div>
              <div style={{ flex: 1 }}>
                <div className="action-text">{copy.actions[index] || item.action}</div>
              </div>
              <div className="action-time">{item.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}