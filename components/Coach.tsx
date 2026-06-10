'use client';

import { Brain, CalendarClock, CheckCircle2 } from 'lucide-react';
import { MOCK_COACH_ACTIONS } from '@/lib/mockData';
import { byLanguage, useI18n } from '@/lib/i18n';

export default function Coach() {
  const { language } = useI18n();
  const copy = byLanguage(language, {
    pl: { title: 'AI Growth Coach', subtitle: 'Codzienny plan dzialan na podstawie trendow i wynikow kanalu.', priority: 'Priorytet dnia', priorityText: 'Opublikuj glowny material miedzy 18:00 a 20:00 i odpowiedz na 10 najnowszych komentarzy.', plan: 'Plan na dzisiaj', actions: ['Opublikuj film na TikTok i YouTube Shorts', 'Nagraj: "AI tools for creators - TOP 5 w 2025"', 'Odpowiedz na pierwsze 10 komentarzy (Smart Inbox)', 'Opublikuj Instagram Reels z wczorajszego materialu', 'Zaplanuj tresc na nastepny tydzien (3 tematy)'] },
    en: { title: 'AI Growth Coach', subtitle: 'Daily action plan based on trends and channel performance.', priority: 'Priority of the day', priorityText: 'Publish your main piece between 6:00 PM and 8:00 PM and reply to the latest 10 comments.', plan: 'Plan for today', actions: ['Publish the video to TikTok and YouTube Shorts', 'Record: "AI tools for creators - TOP 5 in 2025"', 'Reply to the first 10 comments (Smart Inbox)', 'Publish an Instagram Reel from yesterday\'s content', 'Plan content for next week (3 topics)'] },
    es: { title: 'AI Growth Coach', subtitle: 'Plan diario de acciones basado en tendencias y resultados del canal.', priority: 'Prioridad del dia', priorityText: 'Publica la pieza principal entre las 18:00 y las 20:00 y responde a los 10 comentarios mas recientes.', plan: 'Plan para hoy', actions: ['Publica el video en TikTok y YouTube Shorts', 'Graba: "AI tools for creators - TOP 5 en 2025"', 'Responde a los primeros 10 comentarios (Smart Inbox)', 'Publica un Instagram Reel del contenido de ayer', 'Planifica contenido para la proxima semana (3 temas)'] },
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