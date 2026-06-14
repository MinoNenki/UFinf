'use client';

import { useMemo, useState } from 'react';
import { Brain, CalendarClock, CheckCircle2 } from 'lucide-react';
import { byLanguage, useI18n } from '@/lib/i18n';

const NICHES = ['AI / tech', 'Gaming', 'Lifestyle', 'Finance', 'Travel', 'Food', 'Fitness', 'Creator Economy'];
const GOALS = ['awareness', 'leads', 'sales', 'authority', 'community'] as const;

type GoalType = (typeof GOALS)[number];

function getProfileTier(followers: number) {
  if (followers < 1_000) return 'starter';
  if (followers < 10_000) return 'builder';
  if (followers < 100_000) return 'scaler';
  return 'authority';
}

function buildCoachPlan(niche: string, followers: number, goal: GoalType, language: 'pl' | 'en' | 'es') {
  const tier = getProfileTier(followers);
  const postingPerWeek = tier === 'starter' ? 4 : tier === 'builder' ? 5 : tier === 'scaler' ? 6 : 7;
  const bestWindows = tier === 'starter'
    ? ['12:00-14:00', '18:00-20:30']
    : tier === 'builder'
    ? ['11:30-13:00', '19:00-22:00']
    : ['09:30-11:00', '18:00-21:30'];

  const focusByGoal: Record<GoalType, string> = {
    awareness: language === 'pl' ? 'Skalowac zasieg i widocznosc top-of-funnel.' : language === 'es' ? 'Escalar alcance y visibilidad top-of-funnel.' : 'Scale top-of-funnel reach and visibility.',
    leads: language === 'pl' ? 'Zbierac leady przez lead magnet i CTA komentarz/DM.' : language === 'es' ? 'Captar leads con lead magnet y CTA de comentario/DM.' : 'Capture leads via lead magnet and comment/DM CTA.',
    sales: language === 'pl' ? 'Domykac sprzedaż przez oferta-first sekwencje contentu.' : language === 'es' ? 'Cerrar ventas con secuencias de contenido orientadas a oferta.' : 'Close sales with offer-first content sequences.',
    authority: language === 'pl' ? 'Budowac pozycje eksperta i zaufanie premium.' : language === 'es' ? 'Construir autoridad experta y confianza premium.' : 'Build expert authority and premium trust.',
    community: language === 'pl' ? 'Budowac lojalna spolecznosc i aktywny dialog.' : language === 'es' ? 'Construir comunidad leal y dialogo activo.' : 'Build a loyal community with active dialogue.',
  };

  const publishMix = language === 'pl'
    ? [
      `2x tygodniowo: Format edukacyjny "jak zrobic" dla niszy ${niche}.`,
      '2x tygodniowo: Case study z wynikiem i konkretnymi liczbami.',
      '1x tygodniowo: Kontrowersyjny myth-busting lub hot take.',
      '1x tygodniowo: Soft-sprzedaz z CTA do DM / formularza.',
      'Codziennie: 2 stories z kulisami i mini-ankieta.',
    ]
    : language === 'es'
    ? [
      `2 veces por semana: formato educativo "como hacerlo" para el nicho ${niche}.`,
      '2 veces por semana: case study con resultado y numeros reales.',
      '1 vez por semana: myth-busting o hot take controlado.',
      '1 vez por semana: venta soft con CTA a DM / formulario.',
      'Diario: 2 stories de backstage con mini encuesta.',
    ]
    : [
      `2x weekly: educational "how-to" format for ${niche}.`,
      '2x weekly: case study with real numbers and outcomes.',
      '1x weekly: controlled myth-busting or bold hot take.',
      '1x weekly: soft-sales asset with DM / form CTA.',
      'Daily: 2 behind-the-scenes stories with a mini poll.',
    ];

  const mistakes = language === 'pl'
    ? [
      'Błąd: publikacja bez jednego, jasnego CTA.',
      'Błąd: za długi intro hook (ponad 1.5 sek).',
      'Błąd: mieszanie 3 celów kampanii w jednym poście.',
      'Błąd: brak recyklingu top 20% treści na inne formaty.',
      'Błąd: publikacja poza dwoma stałymi oknami czasowymi.',
    ]
    : language === 'es'
    ? [
      'Error: publicar sin un CTA unico y claro.',
      'Error: hook inicial demasiado largo (mas de 1.5 s).',
      'Error: mezclar 3 objetivos de campana en un post.',
      'Error: no reciclar el top 20% en otros formatos.',
      'Error: publicar fuera de dos ventanas fijas.',
    ]
    : [
      'Mistake: publishing without one clear CTA.',
      'Mistake: opening hook too long (over 1.5s).',
      'Mistake: mixing three campaign goals in one post.',
      'Mistake: not repurposing the top 20% assets.',
      'Mistake: posting outside two fixed windows.',
    ];

  const trends = language === 'pl'
    ? [
      `Trend: nisza ${niche} premiuje "before/after" i checklist content.`,
      'Trend: krótkie serie 3-częściowe mają wyższy follow-through.',
      'Trend: komentarz-pin z pytaniem daje więcej odpowiedzi niż CTA "link bio".',
      'Trend: materiał z opinią eksperta > ogólne ciekawostki.',
    ]
    : language === 'es'
    ? [
      `Tendencia: en ${niche} funciona mejor el formato before/after y checklist.`,
      'Tendencia: mini-series en 3 partes elevan el follow-through.',
      'Tendencia: comentario fijado con pregunta supera CTA de link en bio.',
      'Tendencia: opinion experta supera curiosidades generales.',
    ]
    : [
      `Trend: in ${niche}, before/after and checklist formats outperform generic tips.`,
      'Trend: 3-part mini-series increase follow-through.',
      'Trend: pinned-question comments beat link-in-bio CTAs.',
      'Trend: expert-opinion assets outperform general trivia.',
    ];

  return {
    tier,
    postingPerWeek,
    bestWindows,
    focus: focusByGoal[goal],
    publishMix,
    mistakes,
    trends,
  };
}

export default function Coach() {
  const { language } = useI18n();
  const [niche, setNiche] = useState('AI / tech');
  const [followers, setFollowers] = useState(1200);
  const [goal, setGoal] = useState<GoalType>('awareness');

  const plan = useMemo(() => buildCoachPlan(niche, followers, goal, language), [niche, followers, goal, language]);

  const copy = byLanguage(language, {
    pl: { 
      title: 'AI Growth Coach', 
      subtitle: 'Etap 2: strategia publikacji na bazie niszy i liczby obserwujacych.', 
      priority: 'Priorytet strategii', 
      priorityText: 'Najpierw ustaw nisze i audience size, a potem dostajesz plan co publikowac, kiedy i jak eliminowac bledy.',
      profile: 'Profil konta',
      niche: 'Nisza',
      followers: 'Liczba obserwujacych',
      goal: 'Cel',
      focus: 'Focus kampanii',
      plan: 'Plan publikacji',
      windows: 'Okna publikacji',
      mistakes: 'Bledy do usuniecia',
      trends: 'Trendy do wykorzystania',
    },
    en: { 
      title: 'AI Growth Coach', 
      subtitle: 'Stage 2: publishing strategy based on niche and follower count.', 
      priority: 'Strategy priority', 
      priorityText: 'Set niche and audience size first, then execute what to publish, when to publish, and what mistakes to remove.',
      profile: 'Profile',
      niche: 'Niche',
      followers: 'Followers',
      goal: 'Goal',
      focus: 'Campaign focus',
      plan: 'Publishing plan',
      windows: 'Posting windows',
      mistakes: 'Mistakes to remove',
      trends: 'Trend opportunities',
    },
    es: { 
      title: 'AI Growth Coach', 
      subtitle: 'Etapa 2: estrategia de publicacion segun nicho y volumen de seguidores.', 
      priority: 'Prioridad estrategica', 
      priorityText: 'Define nicho y tamano de audiencia para recibir que publicar, cuando publicar y que errores corregir.',
      profile: 'Perfil',
      niche: 'Nicho',
      followers: 'Seguidores',
      goal: 'Objetivo',
      focus: 'Foco de campana',
      plan: 'Plan de publicacion',
      windows: 'Ventanas de publicacion',
      mistakes: 'Errores a eliminar',
      trends: 'Oportunidades de tendencia',
    },
  });

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>{copy.title}</h1>
        <p>{copy.subtitle}</p>
      </div>

      <div className="card" style={{ marginBottom: 16, background: 'rgba(103,247,255,.07)', borderColor: 'rgba(103,247,255,.22)' }}>
        <div className="flex items-center gap-8" style={{ marginBottom: 8 }}>
          <Brain size={17} color="var(--cyan)" />
          <strong>{copy.priority}</strong>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>
          {copy.priorityText}
        </p>
      </div>

      <div className="card" style={{ marginBottom: 16 }} data-testid="coach-v2-controls">
        <h3 style={{ fontSize: 15, marginBottom: 12 }}>{copy.profile}</h3>
        <div className="grid-2" style={{ gap: 12 }}>
          <div className="form-group">
            <label className="form-label">{copy.niche}</label>
            <select data-testid="coach-niche" value={niche} onChange={(event) => setNiche(event.target.value)}>
              {NICHES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">{copy.followers}</label>
            <input data-testid="coach-followers" type="number" min={0} value={followers} onChange={(event) => setFollowers(Math.max(0, Number(event.target.value) || 0))} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">{copy.goal}</label>
          <div className="checkbox-group" style={{ gap: 8 }}>
            {GOALS.map((item) => (
              <button
                key={item}
                type="button"
                data-testid={`coach-goal-${item}`}
                className={`btn btn-ghost btn-sm${goal === item ? ' active' : ''}`}
                onClick={() => setGoal(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-8" style={{ marginBottom: 14 }}>
          <CalendarClock size={16} color="var(--cyan)" />
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>{copy.plan}</h3>
        </div>

        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>
          <strong>{copy.focus}:</strong> {plan.focus}
        </div>

        <div style={{ fontSize: 13, marginBottom: 12 }}>
          <strong>{copy.windows}:</strong> {plan.bestWindows.join(' / ')} | {plan.postingPerWeek}/week
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {plan.publishMix.map((action, index) => (
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

        <div className="grid-2" style={{ gap: 14, marginTop: 16 }}>
          <div className="card" style={{ background: 'rgba(255,255,255,.03)' }} data-testid="coach-mistakes">
            <h4 style={{ fontSize: 13, marginBottom: 8 }}>{copy.mistakes}</h4>
            <div style={{ display: 'grid', gap: 6 }}>
              {plan.mistakes.map((item) => (
                <div key={item} style={{ fontSize: 12, color: 'var(--muted)' }}>- {item}</div>
              ))}
            </div>
          </div>
          <div className="card" style={{ background: 'rgba(255,255,255,.03)' }} data-testid="coach-trends">
            <h4 style={{ fontSize: 13, marginBottom: 8 }}>{copy.trends}</h4>
            <div style={{ display: 'grid', gap: 6 }}>
              {plan.trends.map((item) => (
                <div key={item} style={{ fontSize: 12, color: 'var(--muted)' }}>- {item}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}