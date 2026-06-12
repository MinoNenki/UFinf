'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Brain, CalendarClock, CheckCircle2, Clapperboard, DollarSign, Gauge, Globe2, Inbox, LockKeyhole, Radar, Rocket, ShieldCheck, Sparkles, UploadCloud, Zap, TrendingUp, Users, BarChart3, LogIn, LogOut, UserCircle2 } from 'lucide-react';
import { TOP_UP_PACKS } from '@/lib/budget';
import { byLanguage, useI18n } from '@/lib/i18n';
import LanguageSwitcher from './LanguageSwitcher';
import MobileDownloadStrip from './MobileDownloadStrip';

const PLATFORMS = [
  { name: 'TikTok', cls: 'plat-tiktok' },
  { name: 'YouTube Shorts', cls: 'plat-youtube' },
  { name: 'Instagram Reels', cls: 'plat-instagram' },
  { name: 'Facebook', cls: 'plat-facebook' },
  { name: 'X / Twitter', cls: 'plat-x' },
];

type Result = any;

export default function LandingPageLocalized({ variant }: { variant: 'a' | 'b' }) {
  const { language } = useI18n();
  const copy = byLanguage(language, {
    pl: {
      nav: { factory: 'Factory', trends: 'Trends', dashboard: 'Dashboard', pricing: 'Ceny', login: 'Logowanie', logout: 'Wylogowanie', account: 'Moje konto', register: 'Zarejestruj sie', enter: 'Wejdz do dashboardu ->' },
      heroA: { eyebrow: 'USInf.com | AI Operating System dla tworcow globalnych', title1: 'Publikuj szybciej od konkurencji.', title2: 'Skaluj przychod bez chaosu.', subtitle: 'USInf.com łączy strategię, produkcję, publikację i analitykę ROI w jeden premium workflow. Jeden materiał -> wiele platform -> większy zasięg, większa sprzedaż, większa marka.', main: 'Startuj i rosnij globalnie', alt: 'Porownaj plan wzrostu' },
      heroB: { eyebrow: 'USInf.com | Performance stack dla creator economy', title1: 'One Click Publish + AI Content Brain.', title2: 'Wyniki, nie chaos contentowy.', subtitle: 'Zamień każdy film w maszynę wzrostu: produkcja, publikacja, analiza i automatyczne rekomendacje godzin, formatu i tematów pod najwyższy zwrot.', main: 'Uruchom strategie testowa', alt: 'Zobacz case study ROI' },
      score: 'Growth Score', publishWindow: 'Publikuj dzis 18:00-20:00', sectionLabels: ['System produktu', 'Live MVP', 'Anti-loss', 'Monetyzacja'],
      enterprise: ['Gotowe na App Store i Google Play', 'One Click Publish orchestration', 'AI Content Brain insights engine', 'Anti-loss control layer', 'Multi-workspace dla agencji'],
      stats: ['Tworcow korzysta', 'Generacji tresci', 'Sredni wzrost kanalu', 'Zaoszczedzone godziny'],
      featuresTitle: 'Komplet funkcji klasy premium dla tworcow i zespolow',
      features: [
        ['AI Content Factory', 'Jeden film, link albo pomysl -> komplet tresci na TikTok, Shorts, Reels, Facebook i X.'],
        ['AI Trend Radar', 'Codzienne sygnaly trendow, rosnace tematy i gotowe propozycje filmow.'],
        ['AI Konkurencja', 'Analiza profili konkurencji: formaty, godziny, slowa i czestotliwosc publikacji.'],
        ['AI Growth Coach', 'Codzienny plan dzialania: co nagrac, kiedy publikowac i co poprawic.'],
        ['Smart Inbox', 'Komentarze i wiadomosci ze wszystkich platform w jednym miejscu.'],
        ['Revenue AI', 'Wskazuje tresci i nisze z najwyzszym potencjalem zarobkowym.'],
        ['AI Studio', 'Generator miniatur, opisow SEO, hashtagow i konceptow kreatywnych.'],
      ],
      demo: { title: 'Content Factory + Growth Coach', topic: 'Temat / link / pomysl / opis filmu', niche: 'Nisza', plan: 'Plan', estimated: 'Szacowany koszt', active: 'Budget guard aktywny', button: 'Wygeneruj pakiet tresci', loading: 'Generuje pakiet...', emptyTitle: 'Wynik pojawi sie tutaj', emptyText: 'MVP dziala w trybie bezpiecznego demo - bez spalania kluczy API.', planToday: 'Plan na dzis', content: 'Tresci', blocked: 'Budget Guard zablokowal request', defaultTopic: 'Wrzuc jeden film YouTube i zrob z niego serie na TikTok, Shorts, Reels, Facebook i X', defaultNiche: 'AI / biznes / edukacja', apiError: 'Blad polaczenia z API.' },
      security: { title: 'Zabezpieczenia przed spaleniem budzetu i kluczy API', text: 'Projekt ma juz warstwe ochronna: limity planow, limit kosztu jednego requestu, tryb demo bez API, estymacje kosztu i dzienne limity globalne.', items: [['Limit requestu', 'Kazdy request ma maksymalny koszt USD'], ['Brak kluczy w frontendzie', 'API keys tylko po stronie serwera'], ['Safe demo mode', 'Dziala bez kluczy AI'], ['Gotowe pod platformy', 'TikTok, YouTube, IG, FB, X']] },
      pricing: { title: '🚀 Wybierz plan i zacznij rosnąć już dziś', plans: [['Free', '$0', 'Zacznij bez ryzyka', 'Przetestuj platformę za darmo — 5 generacji dziennie, żadnej karty kredytowej'], ['Pro', '$24', '⭐ Najlepszy start', 'Rośnij bez limitów — 60 generacji dziennie, Trend Radar, Growth Coach i Smart Inbox'], ['Premium Plus', '$69', '🔥 Nasz bestseller', 'Pełna automatyzacja — 180 generacji, One Click Publish, AI Content Brain i Revenue AI'], ['Expert', '$119', '💎 Dla ambitnych', '360 generacji dziennie — priorytetowe przetwarzanie, pełny stack, dedykowane wsparcie']], choose: 'Zacznij teraz', start: 'Zacznij teraz ->', topup: '💡 Potrzebujesz więcej na raz? Dokup jednorazowo: 25 generacji za $9, 75 za $19, 150 za $39 — bez zobowiązań, bez abonamentu' },
      cta: { title: 'USInf.com: Twoj globalny system wzrostu creator-first.', text: 'Dołącz do ponad 2 400 twórców, którzy publikują szybciej, zarabiają więcej i nie tracą czasu na ręczne zarządzanie contentem. Zacznij dziś — bezpłatnie.', growth: 'Zacznij za darmo', admin: '' },
      footer: { text: 'USInf.com - AI Growth OS for Global Creators - 2026 - Built to scale', pricing: 'Cennik', features: 'Features' },
    },
    en: {
      nav: { factory: 'Factory', trends: 'Trends', dashboard: 'Dashboard', pricing: 'Pricing', login: 'Login', logout: 'Logout', account: 'My account', register: 'Register', enter: 'Open dashboard ->' },
      heroA: { eyebrow: 'USInf.com | AI Operating System for global creators', title1: 'Publish faster than the competition.', title2: 'Scale revenue without chaos.', subtitle: 'USInf.com combines strategy, production, distribution, and ROI analytics in one premium workflow. One asset -> many platforms -> stronger brand and revenue growth.', main: 'Launch your global growth engine', alt: 'Compare growth plans' },
      heroB: { eyebrow: 'USInf.com | Performance stack for creator economy', title1: 'One Click Publish + AI Content Brain.', title2: 'Results, not content chaos.', subtitle: 'Turn every video into a growth machine: production, publishing, analysis, and automatic recommendations for the highest-return topics and timing.', main: 'Start trial strategy', alt: 'See ROI case study' },
      score: 'Growth Score', publishWindow: 'Publish today 6:00 PM-8:00 PM', sectionLabels: ['Product system', 'Live MVP', 'Anti-loss', 'Monetization'],
      enterprise: ['Ready for App Store and Google Play', 'One Click Publish orchestration', 'AI Content Brain insights engine', 'Anti-loss control layer', 'Multi-workspace for agencies'],
      stats: ['Creators using it', 'Content generations', 'Average channel growth', 'Hours saved'],
      featuresTitle: 'Complete premium feature stack for creators and teams',
      features: [
        ['AI Content Factory', 'One video, link, or idea -> complete content pack for TikTok, Shorts, Reels, Facebook, and X.'],
        ['AI Trend Radar', 'Daily trend signals, rising topics, and ready-made video suggestions.'],
        ['AI Competition', 'Competitor profile analysis: formats, timing, keywords, and posting frequency.'],
        ['AI Growth Coach', 'Daily action plan: what to record, when to publish, and what to improve.'],
        ['Smart Inbox', 'Comments and messages from every platform in one place.'],
        ['Revenue AI', 'Highlights content and niches with the strongest revenue potential.'],
        ['AI Studio', 'Generator for thumbnails, SEO descriptions, hashtags, and creative concepts.'],
      ],
      demo: { title: 'Content Factory + Growth Coach', topic: 'Topic / link / idea / video description', niche: 'Niche', plan: 'Plan', estimated: 'Estimated cost', active: 'Budget guard active', button: 'Generate content pack', loading: 'Generating pack...', emptyTitle: 'Result will appear here', emptyText: 'The MVP runs in safe demo mode without burning API keys.', planToday: 'Plan for today', content: 'Content', blocked: 'Budget Guard blocked the request', defaultTopic: 'Upload one YouTube video and turn it into a TikTok, Shorts, Reels, Facebook, and X series', defaultNiche: 'AI / business / education', apiError: 'API connection error.' },
      security: { title: 'Protection against burning budget and API keys', text: 'The project already has a protection layer: plan limits, per-request cost caps, demo mode without API keys, cost estimation, and daily global limits.', items: [['Request limit', 'Each request has a max USD cost'], ['No frontend keys', 'API keys stay server-side only'], ['Safe demo mode', 'Works without AI keys'], ['Ready for platforms', 'TikTok, YouTube, IG, FB, X']] },
      pricing: { title: '🚀 Choose a plan and start growing today', plans: [['Free', '$0', 'Try risk-free', 'Start for free — 5 generations per day, no credit card required'], ['Pro', '$24', '⭐ Best start', 'Grow without limits — 60 daily generations, Trend Radar, Growth Coach and Smart Inbox'], ['Premium Plus', '$69', '🔥 Our bestseller', 'Full automation — 180 generations, One Click Publish, AI Content Brain and Revenue AI'], ['Expert', '$119', '💎 For power users', '360 daily generations — priority processing, full stack, dedicated support']], choose: 'Get started', start: 'Start now ->', topup: '💡 Need more at once? Buy one-time: 25 credits for $9, 75 for $19, 150 for $39 — no commitment, no subscription' },
      cta: { title: 'USInf.com: your creator-first global growth system.', text: 'Join 2,400+ creators who publish faster, earn more, and stop wasting time on manual content management. Start today — for free.', growth: 'Get started for free', admin: '' },
      footer: { text: 'USInf.com - AI Growth OS for Global Creators - 2026 - Built to scale', pricing: 'Pricing', features: 'Features' },
    },
    es: {
      nav: { factory: 'Factory', trends: 'Trends', dashboard: 'Dashboard', pricing: 'Precios', login: 'Iniciar sesion', logout: 'Cerrar sesion', account: 'Mi cuenta', register: 'Registrarme', enter: 'Abrir dashboard ->' },
      heroA: { eyebrow: 'USInf.com | Sistema operativo AI para creadores globales', title1: 'Publica mas rapido que la competencia.', title2: 'Escala ingresos sin caos.', subtitle: 'USInf.com une estrategia, produccion, publicacion y analitica ROI en un flujo premium. Un activo -> muchas plataformas -> mas alcance, mas marca y mas ingresos.', main: 'Lanza tu motor de crecimiento global', alt: 'Comparar planes de crecimiento' },
      heroB: { eyebrow: 'USInf.com | Stack performance para creator economy', title1: 'One Click Publish + AI Content Brain.', title2: 'Resultados, no caos de contenido.', subtitle: 'Convierte cada video en una maquina de crecimiento: produccion, publicacion, analisis y recomendaciones automaticas para temas y horarios de mayor retorno.', main: 'Iniciar estrategia de prueba', alt: 'Ver caso ROI' },
      score: 'Growth Score', publishWindow: 'Publica hoy 18:00-20:00', sectionLabels: ['Sistema del producto', 'Live MVP', 'Anti-loss', 'Monetizacion'],
      enterprise: ['Listo para App Store y Google Play', 'One Click Publish orchestration', 'AI Content Brain insights engine', 'Anti-loss control layer', 'Multi-workspace para agencias'],
      stats: ['Creadores activos', 'Generaciones de contenido', 'Crecimiento medio del canal', 'Horas ahorradas'],
      featuresTitle: 'Suite premium completa para creadores y equipos',
      features: [
        ['AI Content Factory', 'Un video, link o idea -> paquete completo de contenido para TikTok, Shorts, Reels, Facebook y X.'],
        ['AI Trend Radar', 'Senales diarias de tendencia, temas en crecimiento y sugerencias de video listas.'],
        ['AI Competition', 'Analisis de perfiles de competencia: formatos, horarios, keywords y frecuencia de publicacion.'],
        ['AI Growth Coach', 'Plan diario de accion: que grabar, cuando publicar y que mejorar.'],
        ['Smart Inbox', 'Comentarios y mensajes de todas las plataformas en un solo lugar.'],
        ['Revenue AI', 'Detecta contenidos y nichos con mayor potencial de ingresos.'],
        ['AI Studio', 'Generador de miniaturas, descripciones SEO, hashtags y conceptos creativos.'],
      ],
      demo: { title: 'Content Factory + Growth Coach', topic: 'Tema / link / idea / descripcion del video', niche: 'Nicho', plan: 'Plan', estimated: 'Coste estimado', active: 'Budget guard activo', button: 'Generar paquete de contenido', loading: 'Generando paquete...', emptyTitle: 'El resultado aparecera aqui', emptyText: 'El MVP funciona en modo demo seguro sin quemar claves API.', planToday: 'Plan para hoy', content: 'Contenido', blocked: 'Budget Guard bloqueo la solicitud', defaultTopic: 'Sube un video de YouTube y conviertelo en una serie para TikTok, Shorts, Reels, Facebook y X', defaultNiche: 'AI / negocio / educacion', apiError: 'Error de conexion con la API.' },
      security: { title: 'Proteccion contra quemar presupuesto y claves API', text: 'El proyecto ya tiene una capa de proteccion: limites por plan, coste maximo por request, modo demo sin API, estimacion de coste y limites globales diarios.', items: [['Limite por request', 'Cada request tiene un coste maximo en USD'], ['Sin claves en frontend', 'Las API keys quedan solo en el servidor'], ['Safe demo mode', 'Funciona sin claves AI'], ['Listo para plataformas', 'TikTok, YouTube, IG, FB, X']] },
      pricing: { title: '🚀 Elige un plan y empieza a crecer hoy', plans: [['Free', '$0', 'Prueba sin riesgo', 'Empieza gratis — 5 generaciones al dia, sin tarjeta de credito'], ['Pro', '$24', '⭐ Mejor inicio', 'Crece sin limites — 60 generaciones diarias, Trend Radar, Growth Coach y Smart Inbox'], ['Premium Plus', '$69', '🔥 Nuestro bestseller', 'Automatizacion total — 180 generaciones, One Click Publish, AI Content Brain y Revenue AI'], ['Expert', '$119', '💎 Para usuarios avanzados', '360 generaciones diarias — procesamiento prioritario, stack completo, soporte dedicado']], choose: 'Empezar ahora', start: 'Empezar ahora ->', topup: '💡 Necesitas mas de una vez? Compra puntual: 25 creditos por $9, 75 por $19, 150 por $39 — sin compromiso ni suscripcion' },
      cta: { title: 'USInf.com: tu sistema global de crecimiento creator-first.', text: 'Unete a mas de 2 400 creadores que publican mas rapido, ganan mas y dejan de perder tiempo gestionando contenido manualmente. Empieza hoy — gratis.', growth: 'Empezar gratis', admin: '' },
      footer: { text: 'USInf.com - AI Growth OS for Global Creators - 2026 - Built to scale', pricing: 'Precios', features: 'Features' },
    },
  });

  const hero = variant === 'a' ? copy.heroA : copy.heroB;
  const [topic, setTopic] = useState(copy.demo.defaultTopic);
  const [niche, setNiche] = useState(copy.demo.defaultNiche);
  const [plan, setPlan] = useState('pro');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [billingMessage, setBillingMessage] = useState('');
  const [checkoutLoadingKey, setCheckoutLoadingKey] = useState('');
  const estimated = useMemo(() => Math.max(0.01, ((topic.length + niche.length + 500) / 4 / 1000) * 0.00015 + 0.0006).toFixed(4), [topic, niche]);

  useEffect(() => {
    fetch('/api/admin/session').then((res) => res.json()).then((data) => setIsAdmin(Boolean(data.isAdmin))).catch(() => setIsAdmin(false));
  }, []);

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    setIsAdmin(false);
  }

  async function runDemo() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic, niche, plan, platform: 'all', language }) });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: copy.demo.apiError });
    }
    setLoading(false);
  }

  async function openCheckout(kind: 'subscription' | 'topup', itemKey: string) {
    setBillingMessage('');
    setCheckoutLoadingKey(`${kind}:${itemKey}`);
    try {
      const customerEmail = window.localStorage.getItem('usinf_signup_email') || '';
      const payload = kind === 'topup'
        ? { kind, packId: itemKey, customerEmail }
        : { kind, planKey: itemKey, customerEmail };
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setBillingMessage(data?.error || 'Nie udalo sie otworzyc checkoutu.');
        return;
      }

      if (data.checkoutMode === 'stripe' && data.url) {
        window.location.assign(data.url);
        return;
      }

      setBillingMessage(language === 'pl' ? 'Nie udalo sie uruchomic Stripe Checkout.' : language === 'es' ? 'No se pudo iniciar Stripe Checkout.' : 'Could not start Stripe Checkout.');
    } catch {
      setBillingMessage('Blad polaczenia z API płatności.');
    } finally {
      setCheckoutLoadingKey('');
    }
  }

  const featureIcons = [Clapperboard, Radar, Gauge, Brain, Inbox, DollarSign, Sparkles];

  return (
    <main className="page-bg">
      <nav className="nav">
        <div className="brand"><span className="logo"><Sparkles size={17} color="#030d1a" /></span>USInf.com</div>
        <div className="navlinks"><a href="#factory">{copy.nav.factory}</a><a href="#trends">{copy.nav.trends}</a><a href="/dashboard" className="navlink-hot">{copy.nav.dashboard}</a><a href="#pricing" className="navlink-hot">{copy.nav.pricing}</a></div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <LanguageSwitcher compact />
          <a href="/dashboard/account" className="btn btn-ghost btn-sm"><UserCircle2 size={13} /> {copy.nav.account}</a>
          {isAdmin && <button className="btn btn-ghost btn-sm" onClick={logout}><LogOut size={13} /> {copy.nav.logout}</button>}
          <a href="/dashboard" className="btn btn-primary btn-sm btn-pulse-attention">{copy.nav.enter}</a>
        </div>
      </nav>

      <section className="hero">
        <div>
          <div className="eyebrow"><Rocket size={14} /> {hero.eyebrow}</div>
          <h1>{hero.title1}<br /><span className="gradient-text">USInf.com</span><br />{hero.title2}</h1>
          <p className="lead">{hero.subtitle}</p>
          <div className="cta-row"><a href="/dashboard" className="btn btn-primary btn-lg btn-pulse-attention">{hero.main} <ArrowRight size={18} /></a><a href="#pricing" className="btn btn-ghost btn-lg navlink-hot">{hero.alt}</a></div>
          <div className="platforms-row">{PLATFORMS.map((platform) => <span key={platform.name} className={`badge ${platform.cls}`}>{platform.name}</span>)}</div>
        </div>
        <div className="hero-card"><div className="phone-mock"><div className="phone-notch" /><div className="phone-score-ring"><b>87</b><small>{copy.score}</small></div><div className="phone-coach-tip"><CalendarClock size={15} /> {copy.publishWindow}</div><div className="phone-mini-grid"><div className="phone-mini-card"><b>128K</b>Views</div><div className="phone-mini-card"><b>+12%</b>Growth</div><div className="phone-mini-card"><b>🔥 PoE2</b>Trend +120%</div><div className="phone-mini-card"><b>3</b>Inbox</div></div><button className="phone-publish-btn">✨ Publish Everywhere</button></div></div>
      </section>

      <section className="section" style={{ paddingTop: 10 }}><div className="enterprise-strip"><span>A/B variant: {variant.toUpperCase()}</span>{copy.enterprise.map((item) => <span key={item}>{item}</span>)}</div></section>

      <div style={{ maxWidth: 1480, margin: '0 auto', padding: '0 5vw 40px' }}><div className="grid-4">{[{ label: copy.stats[0], value: '2,400+', icon: Users }, { label: copy.stats[1], value: '180K+', icon: Clapperboard }, { label: copy.stats[2], value: '+34%', icon: TrendingUp }, { label: copy.stats[3], value: '12h/week', icon: BarChart3 }].map(({ label, value, icon: Icon }) => <div key={label} className="card card-sm" style={{ textAlign: 'center' }}><Icon size={20} color="var(--cyan)" style={{ margin: '0 auto 8px' }} /><div style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-.04em' }}>{value}</div><div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{label}</div></div>)}</div></div>

      <section className="section" id="factory"><div className="section-header"><p className="section-label">{copy.sectionLabels[0]}</p><h2>{copy.featuresTitle}</h2></div><div className="feature-grid">{copy.features.map(([title, text], index) => { const Icon = featureIcons[index]; return <article className="feature-card" key={title}><div className="feature-icon"><Icon size={28} color={['var(--cyan)', 'var(--violet)', 'var(--pink)', 'var(--green)', 'var(--orange)', 'var(--yellow)', 'var(--violet)'][index]} /></div><h3>{title}</h3><p>{text}</p></article>; })}</div></section>

      <section className="section" id="demo"><div className="section-header left"><p className="section-label">{copy.sectionLabels[1]}</p><h2>{copy.demo.title}</h2></div><div className="demo-section"><div className="demo-panel"><div className="form-group"><label className="form-label">{copy.demo.topic}</label><textarea value={topic} onChange={(e) => setTopic(e.target.value)} /></div><div className="grid-2" style={{ gap: 12, marginBottom: 12 }}><div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">{copy.demo.niche}</label><input value={niche} onChange={(e) => setNiche(e.target.value)} type="text" /></div><div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">{copy.demo.plan}</label><select value={plan} onChange={(e) => setPlan(e.target.value)}><option value="free">Free</option><option value="pro">Pro</option><option value="premium_plus">Premium Plus</option><option value="expert">Expert</option></select></div></div><div className="budget-guard"><ShieldCheck size={16} /> {copy.demo.estimated}: <strong>${estimated}</strong> - {copy.demo.active}</div><button className="btn btn-primary btn-full" onClick={runDemo} disabled={loading}>{loading ? <><span className="spinner" /> {copy.demo.loading}</> : `⚡ ${copy.demo.button}`}</button></div><div className="result-panel">{!result && <div className="result-empty"><UploadCloud size={44} /><h3>{copy.demo.emptyTitle}</h3><p style={{ fontSize: 13 }}>{copy.demo.emptyText}</p></div>}{result?.result && <div className="animate-in"><div className="result-top"><span className="verdict">{result.result.verdict}</span><span className="score">{result.result.score}/100</span></div><h3 style={{ fontSize: 15, marginBottom: 10 }}>{copy.demo.planToday}</h3>{result.result.coach.map((item: string) => <div className="check-item" key={item}><CheckCircle2 size={15} />{item}</div>)}<h3 style={{ fontSize: 15, margin: '14px 0 8px' }}>{copy.demo.content}</h3>{Object.entries(result.result.content).map(([key, value]) => <div className="content-item" key={key}><div className="content-item-label">{key}</div><p>{String(value)}</p></div>)}<div className="hashtag-row">{result.result.hashtags.map((tag: string) => <span key={tag}>{tag}</span>)}</div></div>}{result?.error && <div className="result-empty"><LockKeyhole size={44} /><h3>{copy.demo.blocked}</h3><p style={{ fontSize: 13 }}>{result.error}</p></div>}</div></div></section>

      <section className="section" id="security"><div className="security-section"><div><p className="section-label">{copy.sectionLabels[2]}</p><h2 style={{ fontSize: 'clamp(28px,3vw,46px)', letterSpacing: '-.05em', marginBottom: 14 }}>{copy.security.title}</h2><p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>{copy.security.text}</p></div><div className="security-grid">{copy.security.items.map(([title, text], index) => { const icons = [Zap, LockKeyhole, ShieldCheck, Globe2]; const Icon = icons[index]; return <div className="security-item" key={title}><Icon size={20} /><h4>{title}</h4><p>{text}</p></div>; })}</div></div></section>

      <section className="section" id="pricing"><div className="section-header"><p className="section-label">{copy.sectionLabels[3]}</p><h2>{copy.pricing.title}</h2></div><div className="pricing-grid">{copy.pricing.plans.map(([name, price, badge, limit], index, all) => { const planKey = (['free', 'pro', 'premium_plus', 'expert'][index] || 'free') as 'free' | 'pro' | 'premium_plus' | 'expert'; return <article key={String(name)} className={`price-card${index === 1 ? ' best' : ''}`}><div className="price-badge">{badge}</div><h3 style={{ fontSize: 20, marginBottom: 10 }}>{name}</h3><div className="price-amount">{price}<small>/mo</small></div><div className="price-limit">{limit}</div><button className={`btn ${index === 1 ? 'btn-primary' : 'btn-ghost'} btn-full`} style={{ marginTop: 20 }} onClick={() => openCheckout('subscription', planKey)} disabled={checkoutLoadingKey === `subscription:${planKey}`}>{checkoutLoadingKey === `subscription:${planKey}` ? (language === 'pl' ? 'Otwieranie...' : language === 'es' ? 'Abriendo...' : 'Opening...') : (index === 1 ? copy.pricing.start : copy.pricing.choose)}</button></article>; })}</div><p style={{ textAlign: 'center', color: 'var(--muted)', marginTop: 14 }}>{copy.pricing.topup}</p></section>

      <section className="section" id="topup"><div className="section-header"><p className="section-label">{language === 'pl' ? 'Zakup jednorazowy' : language === 'es' ? 'Compra unica' : 'One-time purchase'}</p><h2>{language === 'pl' ? 'Dokup kredyty contentu, gdy potrzebujesz skali' : language === 'es' ? 'Compra creditos de contenido cuando necesites escala' : 'Buy extra content credits when you need scale'}</h2></div><div className="pricing-grid">{Object.values(TOP_UP_PACKS).map((pack) => <article key={pack.id} className="price-card"><div className="price-badge">{pack.bonusLabel || (language === 'pl' ? 'Jednorazowe' : language === 'es' ? 'Unica vez' : 'One-time')}</div><h3 style={{ fontSize: 20, marginBottom: 10 }}>{pack.label}</h3><div className="price-amount">${pack.priceUsd}<small>one-time</small></div><div className="price-limit">{pack.generations} {language === 'pl' ? 'generacji' : language === 'es' ? 'generaciones' : 'generations'}</div>{pack.description && <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, marginBottom: 16, lineHeight: 1.5 }}>{pack.description}</p>}<button className="btn btn-primary btn-full" style={{ marginTop: 'auto' }} onClick={() => openCheckout('topup', pack.id)} disabled={checkoutLoadingKey === `topup:${pack.id}`}>{checkoutLoadingKey === `topup:${pack.id}` ? (language === 'pl' ? 'Otwieranie...' : language === 'es' ? 'Abriendo...' : 'Opening...') : (language === 'pl' ? 'Kup pakiet' : language === 'es' ? 'Comprar paquete' : 'Buy pack')}</button></article>)}</div>{billingMessage ? <div className="alert alert-info" style={{ marginTop: 14, maxWidth: 920, marginLeft: 'auto', marginRight: 'auto' }}>{billingMessage}</div> : null}</section>

      <section className="section" style={{ paddingTop: 16 }}><div className="global-cta"><h2>{copy.cta.title}</h2><p>{copy.cta.text}</p><div className="cta-row" style={{ justifyContent: 'center', marginBottom: 0 }}><a href="/dashboard" className="btn btn-gradient btn-lg">{copy.cta.growth}</a></div></div></section>

      <MobileDownloadStrip />

      <footer style={{ textAlign: 'center', color: 'var(--muted)', padding: '32px 5vw', borderTop: '1px solid var(--stroke)' }}><p>{copy.footer.text}</p><p style={{ marginTop: 8, fontSize: 12 }}><a href="/dashboard" style={{ color: 'var(--cyan)' }}>Dashboard</a> · <a href="#pricing" style={{ color: 'var(--muted)', marginLeft: 12 }}>{copy.footer.pricing}</a> · <a href="#factory" style={{ color: 'var(--muted)', marginLeft: 12 }}>{copy.footer.features}</a></p></footer>
    </main>
  );
}
