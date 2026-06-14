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
      subtitle: 'Najwazniejsze informacje o Twoim koncie, generacjach i kolejnych krokach.',
      cards: ['Zalogowany uzytkownik', 'Status konta', 'Jednorazowe generacje', 'Analityka platform'],
      emptyMetrics: 'Brak realnych danych. Podlacz platformy i wykonaj pierwsze publikacje, aby zobaczyc wyniki.',
      account: 'Moje konto',
      generate: 'Przejdz do generowania',
      coach: 'Kolejne kroki',
      coachItems: [
        'Dodaj zrodla materialow, aby tworzyc pakiety pod wszystkie platformy.',
        'Wygeneruj pierwsza tresc z prawdziwego tematu albo z przeslanych plikow.',
        'Po publikacji i pierwszych interakcjach zobaczysz pierwsze realne sygnaly wzrostu.',
      ],
      verified: 'Zweryfikowany email',
      yes: 'Tak',
      no: 'Nie',
      topUpFallback: 'Brak aktywnych pakietow jednorazowych',
      accountStates: { supabase: 'Aktywne konto', local: 'Aktywne konto' },
      best: 'Na czym skupic sie teraz',
      bestText: 'Najwieksza wartosc daje teraz regularne generowanie, publikacja i zbieranie pierwszych wynikow z platform.',
    },
    en: {
      title: 'Account and system status', subtitle: 'Your key account, generation, and progress information in one place.', cards: ['Logged user', 'Account status', 'One-time generations', 'Platform analytics'], emptyMetrics: 'No real data yet. Connect platforms and publish first content to see metrics.', account: 'My account', generate: 'Go to content generation', coach: 'Next steps', coachItems: ['Add source materials to create packs for every platform.', 'Generate your first content from a real topic or uploaded files.', 'After publishing and first interactions, you will see the first real growth signals.'], verified: 'Verified email', yes: 'Yes', no: 'No', topUpFallback: 'No active one-time packs', accountStates: { supabase: 'Active account', local: 'Active account' }, best: 'What to focus on now', bestText: 'Your biggest leverage now is consistent generation, publishing, and collecting the first platform signals.'
    },
    es: {
      title: 'Estado de la cuenta y del sistema', subtitle: 'La informacion clave de tu cuenta, generaciones y progreso en un solo lugar.', cards: ['Usuario conectado', 'Estado de la cuenta', 'Generaciones de un solo uso', 'Analitica de plataformas'], emptyMetrics: 'Aun no hay datos reales. Conecta plataformas y publica el primer contenido para ver metricas.', account: 'Mi cuenta', generate: 'Ir a generar contenido', coach: 'Siguientes pasos', coachItems: ['Agrega materiales fuente para crear paquetes para cada plataforma.', 'Genera tu primer contenido desde un tema real o archivos subidos.', 'Tras publicar y recibir primeras interacciones veras las primeras senales reales de crecimiento.'], verified: 'Correo verificado', yes: 'Si', no: 'No', topUpFallback: 'Sin paquetes de un solo uso activos', accountStates: { supabase: 'Cuenta activa', local: 'Cuenta activa' }, best: 'En que enfocarte ahora', bestText: 'Tu mayor palanca ahora es generar, publicar y recoger las primeras senales reales de las plataformas.'
    },
  });

  useEffect(() => {
    let active = true;
    const effectiveEmail = user?.email || (typeof window !== 'undefined' ? localStorage.getItem('usinf_signup_email') || '' : '');
    const topupUrl = effectiveEmail ? `/api/usage/topup?email=${encodeURIComponent(effectiveEmail)}` : '/api/usage/topup';
    fetch(topupUrl)
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
  }, [user?.email]);

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
            <div className="stat-value" style={{ fontSize: 22 }}>{copy.accountStates[authMode]}</div>
            <div className="stat-change">{copy.verified}: {user?.emailVerified ? copy.yes : copy.no}</div>
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
