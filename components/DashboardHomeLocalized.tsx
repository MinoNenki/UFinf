'use client';

import { useEffect, useState } from 'react';
import { CalendarClock, Brain, ShieldCheck, UserCircle2, Sparkles } from 'lucide-react';
import { navigate } from '@/lib/navigate';
import { byLanguage, useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/authContext';

export default function DashboardHomeLocalized() {
  const { language } = useI18n();
  const { user, authMode } = useAuth();
  const [remainingTopUps, setRemainingTopUps] = useState<number | null>(null);
  const copy = byLanguage(language, {
    pl: {
      title: 'Stan konta i systemu',
      subtitle: 'Ten dashboard pokazuje tylko dane potwierdzone przez system. Brak fikcyjnych statystyk i demo liczb.',
      cards: ['Zalogowany uzytkownik', 'Tryb logowania', 'Jednorazowe generacje', 'Analityka platform'],
      emptyMetrics: 'Brak realnych danych. Podlacz platformy i wykonaj pierwsze publikacje, aby zobaczyc wyniki.',
      account: 'Moje konto',
      generate: 'Przejdz do generowania',
      coach: 'Kolejne kroki',
      coachItems: [
        'Uzupelnij klucze AI i integracje platform w panelu administratora.',
        'Wygeneruj pierwsza tresc z prawdziwego tematu, bez danych demo.',
        'Po publikacji i pierwszych interakcjach dashboard zacznie pokazywac realne liczby.',
      ],
      verified: 'Zweryfikowany email',
      yes: 'Tak',
      no: 'Nie',
      topUpFallback: 'Brak aktywnych pakietow jednorazowych',
      authModes: { supabase: 'Supabase', local: 'Lokalny fallback' },
      best: 'Najlepsza praktyka na start',
      bestText: 'Najpierw napraw konfiguracje i przeplywy, potem pokazuj klientowi tylko dane pochodzace z prawdziwych zrodel.',
    },
    en: {
      title: 'Account and system status', subtitle: 'This dashboard only shows system-confirmed data. No fake statistics or demo numbers.', cards: ['Logged user', 'Auth mode', 'One-time generations', 'Platform analytics'], emptyMetrics: 'No real data yet. Connect platforms and publish first content to see metrics.', account: 'My account', generate: 'Go to content generation', coach: 'Next steps', coachItems: ['Complete AI keys and platform integrations in the admin panel.', 'Generate your first content from a real topic, with no demo data.', 'After publishing and first interactions, the dashboard will start showing real numbers.'], verified: 'Verified email', yes: 'Yes', no: 'No', topUpFallback: 'No active one-time packs', authModes: { supabase: 'Supabase', local: 'Local fallback' }, best: 'Best first step', bestText: 'Fix configuration and flows first, then show the client only data coming from real sources.'
    },
    es: {
      title: 'Estado de la cuenta y del sistema', subtitle: 'Este dashboard solo muestra datos confirmados por el sistema. Sin estadisticas falsas ni numeros demo.', cards: ['Usuario conectado', 'Modo de acceso', 'Generaciones de un solo uso', 'Analitica de plataformas'], emptyMetrics: 'Aun no hay datos reales. Conecta plataformas y publica el primer contenido para ver metricas.', account: 'Mi cuenta', generate: 'Ir a generar contenido', coach: 'Siguientes pasos', coachItems: ['Completa claves AI e integraciones de plataformas en el panel admin.', 'Genera el primer contenido desde un tema real, sin datos demo.', 'Despues de publicar y recibir primeras interacciones, el dashboard mostrara numeros reales.'], verified: 'Correo verificado', yes: 'Si', no: 'No', topUpFallback: 'Sin paquetes de un solo uso activos', authModes: { supabase: 'Supabase', local: 'Fallback local' }, best: 'Mejor primer paso', bestText: 'Primero corrige configuracion y flujos; despues muestra al cliente solo datos de fuentes reales.'
    },
  });

  useEffect(() => {
    let active = true;
    fetch('/api/usage/topup')
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        setRemainingTopUps(Number(data?.usage?.topUpGenerationsRemaining || 0));
      })
      .catch(() => {
        if (!active) return;
        setRemainingTopUps(0);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>{copy.title}</h1>
        <p>{copy.subtitle}</p>
      </div>

      <div className="grid-2" style={{ gap: 16, marginBottom: 16 }}>
        <div className="card">
          <div className="flex items-center gap-8" style={{ marginBottom: 12 }}>
            <UserCircle2 size={18} color="var(--cyan)" />
            <strong>{copy.cards[0]}</strong>
          </div>
          <div style={{ fontSize: 14, marginBottom: 6 }}>{user?.displayName || user?.email || '—'}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{user?.email || '—'}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>{copy.verified}: <strong>{user?.emailVerified ? copy.yes : copy.no}</strong></div>
        </div>

        <div className="grid-2" style={{ gap: 12 }}>
          <div className="stat-card">
            <div className="stat-label">{copy.cards[1]}</div>
            <div className="stat-value" style={{ fontSize: 22 }}>{copy.authModes[authMode]}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">{copy.cards[2]}</div>
            <div className="stat-value" style={{ fontSize: 22 }}>{remainingTopUps == null ? '…' : remainingTopUps}</div>
            <div className="stat-change">{remainingTopUps ? '' : copy.topUpFallback}</div>
          </div>
          <div className="stat-card" style={{ gridColumn: '1 / -1' }}>
            <div className="stat-label">{copy.cards[3]}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>{copy.emptyMetrics}</div>
          </div>
        </div>
      </div>

      <div className="grid-2-1" style={{ gap: 20 }}>
        <div className="card">
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-8">
              <Brain size={18} color="var(--violet)" />
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>{copy.coach}</h3>
            </div>
            <span className="badge badge-violet">AI</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {copy.coachItems.map((item) => (
              <div key={item} className="action-item action-priority-medium">
                <div className="action-checkbox"><ShieldCheck size={13} color="var(--bg)" /></div>
                <div style={{ flex: 1 }}><div className="action-text">{item}</div></div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-8" style={{ marginTop: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard/account')}>{copy.account}</button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard/factory')}><Sparkles size={13} /> {copy.generate}</button>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>{copy.best}</h3>
          <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>{copy.bestText}</p>
          <div className="alert alert-info" style={{ marginTop: 14 }}>
            <CalendarClock size={16} />
            <div>{copy.emptyMetrics}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
