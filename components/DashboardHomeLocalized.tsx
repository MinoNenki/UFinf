'use client';

import { TrendingUp, Eye, Users, DollarSign, CalendarClock, Flame, CheckCircle2, Brain } from 'lucide-react';
import { MOCK_STATS, MOCK_COACH_ACTIONS, MOCK_PLATFORM_STATUS, MOCK_RECENT_CONTENT, MOCK_TRENDS } from '@/lib/mockData';
import { navigate } from '@/lib/navigate';
import { byLanguage, useI18n } from '@/lib/i18n';

const SCORE = 87;

export default function DashboardHomeLocalized() {
  const { language } = useI18n();
  const copy = byLanguage(language, {
    pl: {
      score: 'Growth Score', top: 'Top 15% tworcow premium', week: '+3 punkty w tym tygodniu',
      labels: ['Wyswietlenia', 'Subskrybenci', 'Zaangazowanie', 'Przychod'],
      hot: 'Goracy trend!', suffix: 'idealne dla Twojej niszy!', cta: 'Wygeneruj teraz ->',
      today: 'Plan na dzis', full: 'Pelny plan -> Growth Coach', status: 'STATUS PLATFORM', disconnected: 'Niepolaczony',
      recent: 'OSTATNIE TRESCI', best: 'Najlepszy czas na publikacje dzisiaj', bestText: 'Twoja nisza osiaga szczytowe zaangazowanie miedzy 18:00-20:00 - to okno z najwyzszym potencjalem konwersji.',
      publish: 'One Click Publish', premium: 'Premium Plus', publishText: 'Wrzucasz material i klikasz "Publish Everywhere". System przygotowuje opisy, hashtagi, miniature, CTA i gotowe pakiety publikacji pod kazda platforme.',
      brain: 'AI Content Brain', insight: 'Insight', brainText: 'Twoje filmy o AI osiagaja o 70% wiecej wyswietlen niz filmy o programowaniu. Publikuj miedzy ',
      actions: ['Opublikuj film na TikTok i YouTube Shorts', 'Nagraj: "AI tools for creators - TOP 5 w 2025"', 'Odpowiedz na pierwsze 10 komentarzy (Smart Inbox)'],
      dates: ['2 godz. temu', 'Wczoraj', '3 dni temu'],
    },
    en: {
      score: 'Growth Score', top: 'Top 15% premium creators', week: '+3 points this week',
      labels: ['Views', 'Subscribers', 'Engagement', 'Revenue'],
      hot: 'Hot trend!', suffix: 'perfect for your niche!', cta: 'Generate now ->',
      today: 'Plan for today', full: 'Full plan -> Growth Coach', status: 'PLATFORM STATUS', disconnected: 'Not connected',
      recent: 'RECENT CONTENT', best: 'Best time to publish today', bestText: 'Your niche reaches peak engagement between 6:00 PM and 8:00 PM - your highest conversion window.',
      publish: 'One Click Publish', premium: 'Premium Plus', publishText: 'Upload once and click "Publish Everywhere". The system builds platform-ready descriptions, hashtags, thumbnails, CTA blocks, and execution-ready publish packages.',
      brain: 'AI Content Brain', insight: 'Insight', brainText: 'Your AI videos get 70% more views than programming videos. Publish between ',
      actions: ['Publish the video to TikTok and YouTube Shorts', 'Record: "AI tools for creators - TOP 5 in 2025"', 'Reply to the first 10 comments (Smart Inbox)'],
      dates: ['2 hours ago', 'Yesterday', '3 days ago'],
    },
    es: {
      score: 'Growth Score', top: 'Top 15% de creadores premium', week: '+3 puntos esta semana',
      labels: ['Vistas', 'Suscriptores', 'Engagement', 'Ingresos'],
      hot: 'Tendencia caliente!', suffix: 'perfecta para tu nicho!', cta: 'Generar ahora ->',
      today: 'Plan para hoy', full: 'Plan completo -> Growth Coach', status: 'ESTADO DE PLATAFORMAS', disconnected: 'No conectado',
      recent: 'CONTENIDO RECIENTE', best: 'Mejor momento para publicar hoy', bestText: 'Tu nicho alcanza el pico de engagement entre las 18:00 y las 20:00 - la ventana de mayor conversion.',
      publish: 'Publicacion en un clic', premium: 'Premium Plus', publishText: 'Subes una vez y haces clic en "Publish Everywhere". El sistema crea descripciones, hashtags, miniaturas, CTA y paquetes listos para publicar en cada plataforma.',
      brain: 'AI Content Brain', insight: 'Insight', brainText: 'Tus videos de AI consiguen un 70% mas de vistas que los videos de programacion. Publica entre ',
      actions: ['Publica el video en TikTok y YouTube Shorts', 'Graba: "AI tools for creators - TOP 5 en 2025"', 'Responde a los primeros 10 comentarios (Smart Inbox)'],
      dates: ['hace 2 horas', 'Ayer', 'hace 3 dias'],
    },
  });
  const hotTrend = MOCK_TRENDS.find((item) => item.hot);

  return (
    <div className="animate-in">
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div className="score-ring ring-lg" style={{ ['--pct' as any]: `${SCORE}%`, width: 140, height: 140 }}>
            <div className="score-ring-inner">
              <div className="score-number">{SCORE}</div>
              <div className="score-label">{copy.score}</div>
            </div>
          </div>
          <div style={{ marginTop: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{copy.top}</div>
            <div style={{ fontSize: 12, color: 'var(--green)', fontWeight: 700, marginTop: 2 }}>{copy.week}</div>
          </div>
        </div>

        <div className="grid-2" style={{ gap: 12 }}>
          {[
            { label: copy.labels[0], value: MOCK_STATS.views.value, change: MOCK_STATS.views.change, icon: Eye, color: 'var(--cyan)' },
            { label: copy.labels[1], value: MOCK_STATS.subscribers.value, change: MOCK_STATS.subscribers.change, icon: Users, color: 'var(--violet)' },
            { label: copy.labels[2], value: MOCK_STATS.engagement.value, change: MOCK_STATS.engagement.change, icon: TrendingUp, color: 'var(--green)' },
            { label: copy.labels[3], value: MOCK_STATS.revenue.value, change: MOCK_STATS.revenue.change, icon: DollarSign, color: 'var(--yellow)' },
          ].map(({ label, value, change, icon: Icon, color }) => (
            <div key={label} className="stat-card">
              <div className="flex items-center justify-between mb-8">
                <span className="stat-label">{label}</span>
                <Icon size={16} color={color} />
              </div>
              <div className="stat-value">{value}</div>
              <div className="stat-change stat-up"><TrendingUp size={12} /> {change}</div>
            </div>
          ))}
        </div>
      </div>

      {hotTrend && (
        <div className="alert alert-warning mb-16" style={{ marginBottom: 16 }}>
          <Flame size={18} />
          <div>
            <strong>{copy.hot}</strong> <span style={{ fontWeight: 900 }}>&quot;{hotTrend.topic}&quot;</span> +{hotTrend.growth}% - {copy.suffix}{' '}
            <button style={{ color: 'var(--yellow)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: 13, fontFamily: 'inherit' }} onClick={() => navigate('/dashboard/factory')}>
              {copy.cta}
            </button>
          </div>
        </div>
      )}

      <div className="grid-2-1" style={{ gap: 20 }}>
        <div className="card">
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-8">
              <Brain size={18} color="var(--violet)" />
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>{copy.today}</h3>
            </div>
            <span className="badge badge-violet">AI Coach</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {MOCK_COACH_ACTIONS.slice(0, 3).map((action, index) => (
              <div key={action.id} className={`action-item action-priority-${action.priority}`}>
                <div className="action-checkbox">{action.done && <CheckCircle2 size={13} color="var(--bg)" />}</div>
                <div style={{ flex: 1 }}><div className="action-text">{copy.actions[index] || action.action}</div></div>
                <div className="action-time">{action.time}</div>
              </div>
            ))}
          </div>
          <button className="btn btn-ghost btn-sm btn-full" style={{ marginTop: 12 }} onClick={() => navigate('/dashboard/coach')}>{copy.full}</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card card-sm">
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--muted)' }}>{copy.status}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {MOCK_PLATFORM_STATUS.map((item) => (
                <div key={item.platform} className="flex items-center justify-between">
                  <div className="flex items-center gap-8">
                    <span className={`status-dot ${item.connected ? 'online' : 'offline'}`} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{item.platform}</span>
                  </div>
                  <span style={{ fontSize: 12, color: item.connected ? 'var(--muted)' : 'var(--muted2)' }}>{item.connected ? item.followers : copy.disconnected}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card card-sm">
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--muted)' }}>{copy.recent}</h3>
            {MOCK_RECENT_CONTENT.map((item, index) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{item.topic}</div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {item.platforms.map((platform) => <span key={platform} className={`badge badge-muted plat-${platform}`} style={{ fontSize: 10, padding: '1px 6px' }}>{platform}</span>)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, color: 'var(--cyan)', fontWeight: 700 }}>{item.score}/100</div>
                  <div style={{ fontSize: 10, color: 'var(--muted2)' }}>{copy.dates[index] || item.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16, background: 'rgba(34,211,238,.06)', borderColor: 'rgba(34,211,238,.2)' }}>
        <div className="flex items-center gap-12">
          <CalendarClock size={20} color="var(--cyan)" />
          <div>
            <div style={{ fontWeight: 700 }}>{copy.best}</div>
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>{copy.bestText}</div>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 22, fontWeight: 900, color: 'var(--cyan)' }}>18:00-20:00</div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 16, marginTop: 16 }}>
        <div className="card" style={{ background: 'linear-gradient(135deg,rgba(236,72,153,.1),rgba(139,92,246,.1))', borderColor: 'rgba(139,92,246,.24)' }}>
          <div className="flex items-center justify-between mb-8">
            <h3 style={{ fontSize: 15, fontWeight: 800 }}>{copy.publish}</h3>
            <span className="badge badge-violet">{copy.premium}</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>{copy.publishText}</p>
          <button className="btn btn-gradient btn-sm btn-pulse-attention" onClick={() => navigate('/dashboard/factory')}>Publish Everywhere</button>
        </div>

        <div className="card" style={{ background: 'rgba(52,211,153,.08)', borderColor: 'rgba(52,211,153,.22)' }}>
          <div className="flex items-center justify-between mb-8">
            <h3 style={{ fontSize: 15, fontWeight: 800 }}>{copy.brain}</h3>
            <span className="badge badge-green">{copy.insight}</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>{copy.brainText}<strong style={{ color: 'var(--green)' }}>18:00 a 20:00</strong>.</p>
        </div>
      </div>
    </div>
  );
}
