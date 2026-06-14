'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Brain, CalendarClock, CheckCircle2, Clapperboard, DollarSign, Gauge, Inbox, LockKeyhole, Radar, Rocket, ShieldCheck, Sparkles, UploadCloud, TrendingUp, Users, BarChart3, LogIn, LogOut, UserCircle2, UserPlus, Paperclip, X, Loader } from 'lucide-react';
import { buildAttachmentContext } from '@/lib/attachmentContext';
import { TOP_UP_PACKS } from '@/lib/budget';
import { byLanguage, useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/authContext';
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
  const { user, signOut } = useAuth();
  const copy = byLanguage(language, {
    pl: {
      nav: { factory: 'Factory', trends: 'Trends', dashboard: 'Dashboard', pricing: 'Ceny', login: 'Logowanie', logout: 'Wylogowanie', account: 'Moje konto', register: 'Zarejestruj sie', enter: 'Wejdz do dashboardu ->' },
      heroA: { eyebrow: 'UFInf - Ultra Future Influencer | Twoj AI engine do globalnego wzrostu', title1: 'Publikuj inteligentniej. Zarabiaj wiecej. Zero pracy recznej.', title2: 'Jeden klik. Wszystkie platformy. Maksymalny dochod.', subtitle: 'UFInf to kompletny system wzrostu: produkcja AI, dystrybucja multiplatformowa, analityka realtime i strategia wzrostu. Jeden film -> gotowe pakiety pod TikTok, YouTube, Instagram, Facebook i X. Skaluj zasieg i przychod 10x szybciej.', main: 'Zacznij za darmo', alt: 'Zobacz case study' },
      heroB: { eyebrow: 'UFInf - AI growth stack dla creator economy', title1: 'One Click Publish + AI Content Brain.', title2: 'Wiekszy przychod. Zero chaosu.', subtitle: 'UFInf analizuje, co dziala u Ciebie, znajduje najlepsze godziny publikacji, podpowiada top tematy i publikuje wszedzie automatycznie. Efekt: wiecej wyswietlen i szybszy wzrost.', main: 'Uruchom strategia wzrostu', alt: 'Dowiedz sie wiecej' },
      score: 'Growth Score', publishWindow: 'Publikuj dzis 18:00-20:00', sectionLabels: ['System produktu', 'Live MVP', 'Strategia', 'Monetyzacja'],
      enterprise: ['Gotowe na App Store i Google Play', 'One Click Publish orchestration', 'AI Content Brain insights engine', 'Kontrola publikacji i kosztow', 'Multi-workspace dla agencji'],
      stats: ['Status produktu', 'Tryb generowania', 'Zakres platform', 'Cel wdrozenia'],
      statValues: ['MVP beta', 'AI workflow', 'TikTok / YouTube / IG / FB / X', 'Realne dane, zero demo liczb'],
      featuresTitle: '8 poteznych narzedzi AI — wszystkie w jednej cenie, bez ukrytych oplat',
      features: [
        ['AI Content Factory', '1 temat -> 30 dni gotowego contentu pod TikTok, YouTube Shorts, Reels, Facebook i X. Zero pracy recznej.'],
        ['AI Trend Radar', 'Codzienne sygnaly trendow zanim pojawia sie u konkurencji. Pierwsze to Ty — nie oni.'],
        ['AI Konkurencja', 'Widz wszystko: formaty, godziny, hashtagi i czestotliwosc publikacji top kont w Twojej niszy.'],
        ['AI Growth Coach v2', 'Podaj nisze + liczbe followersow -> dostajesz spersonalizowany plan: co, kiedy i jak publikowac, by rosnac 3x szybciej.'],
        ['30-day Scheduler Export', 'Gotowy harmonogram 30 dni w CSV i formacie Notion. Jeden klik — caly miesiac zaplanowany.'],
        ['Revenue AI', 'Precyzyjnie wskazuje, ktore tresci i nisze przynioslyby Ci realne pieniadze. Bez zgadywania.'],
        ['AI Assets Studio — FREE', 'Darmowy generator: memy, posty, miniatury, karuzele, story, reklamy. Export PNG / JPG / PDF. Zero platnych API.'],
        ['One Click Publish', 'Publikuj na wszystkich platformach jednoczesnie. Jeden przycisk — wszystko gotowe.'],
      ],
      demo: { title: 'Content Factory + Growth Coach', topic: 'Temat / link / pomysl / opis filmu', niche: 'Nisza', plan: 'Plan', estimated: 'Szacowany koszt', active: 'Gotowe do wygenerowania', button: 'Wygeneruj pakiet tresci', loading: 'Generuje pakiet...', emptyTitle: 'Wynik pojawi sie tutaj', emptyText: 'Dodaj temat lub pliki zrodlowe, a gotowy pakiet pojawi sie tutaj automatycznie.', loadingTitle: 'Tworzymy Twoj pakiet', loadingText: 'Przygotowujemy wersje na wszystkie platformy i przewijamy od razu do wynikow.', attachments: 'Pliki zrodlowe', addFiles: 'Dodaj pliki', removeFile: 'Usun plik', planToday: 'Plan na dzis', content: 'Tresci', blocked: 'Nie udalo sie przygotowac pakietu', defaultTopic: 'Wrzuc jeden film YouTube i zrob z niego serie na TikTok, Shorts, Reels, Facebook i X', defaultNiche: 'AI / biznes / edukacja', apiError: 'Blad polaczenia z API.' },
      security: { title: 'Zabezpieczenia klasy produkcyjnej przed spaleniem budzetu i naduzyciami', text: 'Projekt ma teraz twarde ochrony: limity planow, limit kosztu jednego requestu, soft stop budzetu, rate limit na generowanie i checkout, demo bez API oraz dzienne limity globalne.', items: [['Soft stop budzetu', 'System zatrzymuje nowe generacje zanim dojdzie do przepalenia dziennego limitu AI'], ['Rate limit IP', 'Generate i Stripe Checkout maja ograniczenia anty-spam i anty-bot'], ['Brak kluczy w frontendzie', 'API keys tylko po stronie serwera i panelu admin'], ['2FA + secure admin', 'Panel admina wymaga hasla, TOTP i podpisanej sesji']] },
      pricing: { title: '🚀 Wybierz plan, ktory sprzedaje wynik szybciej niz kosztuje', plans: [['Free', '$0', 'Zacznij bez ryzyka', 'Przetestuj za darmo — 5 generacji dziennie, pelny Assets Studio FREE i zero karty kredytowej'], ['Pro', '$19', '⭐ Najlepszy start', '70 generacji dziennie — idealny plan dla solo tworcow, coachow i mikro-agencji'], ['Premium Plus', '$49', '🔥 Najlepsza wartosc', '220 generacji dziennie — publish, content brain i revenue AI w jednym pakiecie'], ['Expert', '$99', '💎 Dla skali', '500 generacji dziennie — priorytet, najwyzsze limity i pelny stack wzrostu']], choose: 'Zacznij teraz', start: 'Zacznij teraz ->', topup: '💡 Potrzebujesz skoku bez zmiany planu? Dokup jednorazowo: 25 generacji za $9, 75 za $24 lub 200 za $49 — bez umowy i bez abonamentu.' },
      cta: { title: 'UFInf: Twoj globalny system wzrostu creator-first.', text: 'Dolacz do tysiecy tworcow, ktorzy publikuja szybciej, zarabiaja wiecej i nie traca czasu na reczne zarzadzanie contentem. Zacznij dzis - za darmo.', growth: 'Zacznij za darmo', admin: '' },
      footer: { text: 'UFInf - Ultra Future Influencer - 2026 - Built to scale', pricing: 'Cennik', features: 'Features' },
    },
    en: {
      nav: { factory: 'Factory', trends: 'Trends', dashboard: 'Dashboard', pricing: 'Pricing', login: 'Login', logout: 'Logout', account: 'My account', register: 'Register', enter: 'Open dashboard ->' },
      heroA: { eyebrow: 'UFInf — Ultra Future Influencer | Your AI engine for unstoppable growth', title1: 'Publish smarter. Earn bigger. No manual work.', title2: 'One click. All platforms. Maximum revenue.', subtitle: 'UFInf is your complete growth stack: AI production, multi-platform distribution, real-time analytics, and AI-powered strategy. One video -> infinite possibilities across TikTok, YouTube, Instagram, Facebook, and X. Scale your reach and income 10x faster.', main: 'Get started free today', alt: 'View case studies' },
      heroB: { eyebrow: 'UFInf — AI for creators who want to dominate', title1: 'One Click Publish + AI Content Brain.', title2: 'Bigger income. Zero chaos.', subtitle: 'UFInf analyzes what works for you, finds your prime posting times, suggests your best-performing topics, and publishes everywhere automatically. Result: 70% more views, 3x faster growth.', main: 'Start your growth strategy now', alt: 'Learn more' },
      score: 'Growth Score', publishWindow: 'Publish today 6:00 PM-8:00 PM', sectionLabels: ['Product system', 'Live MVP', 'Strategy', 'Monetization'],
      enterprise: ['Ready for App Store and Google Play', 'One Click Publish orchestration', 'AI Content Brain insights engine', 'Publishing and cost control', 'Multi-workspace for agencies'],
      stats: ['Product status', 'Generation mode', 'Platform coverage', 'Deployment goal'],
      statValues: ['MVP beta', 'AI workflow', 'TikTok / YouTube / IG / FB / X', 'Real data, no invented metrics'],
      featuresTitle: '8 powerful AI tools — all in one price, no hidden fees',
      features: [
        ['AI Content Factory', '1 topic -> 30 days of ready-to-publish content for TikTok, YouTube Shorts, Reels, Facebook, and X. Zero manual work.'],
        ['AI Trend Radar', 'Daily trend signals before your competitors see them. You go first — not them.'],
        ['AI Competition', 'See everything: formats, timing, hashtags, and posting frequency of top accounts in your niche.'],
        ['AI Growth Coach v2', 'Enter niche + follower count -> get a personalized plan: what, when, and how to post to grow 3x faster.'],
        ['30-day Scheduler Export', 'Ready-made 30-day schedule in CSV and Notion format. One click — the whole month planned.'],
        ['Revenue AI', 'Pinpoints exactly which content and niches would bring you real money. No guessing.'],
        ['AI Assets Studio — FREE', 'Free generator: memes, posts, thumbnails, carousels, stories, ads. Export PNG / JPG / PDF. No paid APIs.'],
        ['One Click Publish', 'Publish to all platforms simultaneously. One button — everything done.'],
      ],
      demo: { title: 'Content Factory + Growth Coach', topic: 'Topic / link / idea / video description', niche: 'Niche', plan: 'Plan', estimated: 'Estimated cost', active: 'Ready to generate', button: 'Generate content pack', loading: 'Generating pack...', emptyTitle: 'Result will appear here', emptyText: 'Add a topic or source files and the finished pack will appear here automatically.', loadingTitle: 'Building your pack', loadingText: 'We are generating platform-ready variants and scrolling straight to the results.', attachments: 'Source files', addFiles: 'Add files', removeFile: 'Remove file', planToday: 'Plan for today', content: 'Content', blocked: 'Could not prepare the pack', defaultTopic: 'Upload one YouTube video and turn it into a TikTok, Shorts, Reels, Facebook, and X series', defaultNiche: 'AI / business / education', apiError: 'API connection error.' },
      security: { title: 'Production-grade protection against budget burn and abuse', text: 'The stack now includes hard protections: plan limits, per-request cost caps, budget soft stop, rate limits on generation and checkout, API-free demo mode, and daily global ceilings.', items: [['Budget soft stop', 'The system halts new generations before your daily AI spend is actually burned'], ['IP rate limiting', 'Generate and Stripe Checkout are protected against spam and bot abuse'], ['No frontend secrets', 'API keys stay server-side only'], ['2FA + secure admin', 'Admin access requires password, TOTP, and a signed session cookie']] },
      pricing: { title: '🚀 Choose the plan that pays back faster than it costs', plans: [['Free', '$0', 'Try risk-free', 'Start free — 5 generations per day, full FREE Assets Studio, no credit card required'], ['Pro', '$19', '⭐ Best starting point', '70 daily generations — perfect for solo creators, consultants, and lean agencies'], ['Premium Plus', '$49', '🔥 Best value', '220 daily generations — publish, content brain, and revenue AI in one growth stack'], ['Expert', '$99', '💎 Built for scale', '500 daily generations — priority processing, highest limits, and the full growth system']], choose: 'Get started', start: 'Start now ->', topup: '💡 Need a burst without upgrading? Buy one-time: 25 credits for $9, 75 for $24, or 200 for $49 — no contract, no subscription.' },
      cta: { title: 'UFInf: your creator-first global growth system.', text: 'Join thousands of creators who publish faster, earn more, and stop wasting time on manual content management. Start today — for free.', growth: 'Get started for free', admin: '' },
      footer: { text: 'UFInf - Ultra Future Influencer - 2026 - Built to scale', pricing: 'Pricing', features: 'Features' },
    },
    es: {
      nav: { factory: 'Factory', trends: 'Trends', dashboard: 'Dashboard', pricing: 'Precios', login: 'Iniciar sesion', logout: 'Cerrar sesion', account: 'Mi cuenta', register: 'Registrarme', enter: 'Abrir dashboard ->' },
      heroA: { eyebrow: 'UFInf — Ultra Future Influencer | Tu motor AI de crecimiento global', title1: 'Publica mas inteligente. Gana mas. Sin trabajo manual.', title2: 'Un clic. Todas las plataformas. Ingresos maximos.', subtitle: 'UFInf es tu stack completo: producci on AI, distribuci on multipletaforma, analiti ca realtime y estrategia AI. Un video -> contenido optimizado para TikTok, YouTube, Instagram, Facebook y X. Escala tu alcance e ingresos 10x mas rapido.', main: 'Empieza gratis hoy', alt: 'Ver casos de exito' },
      heroB: { eyebrow: 'UFInf — AI para creadores ambiciosos', title1: 'One Click Publish + AI Content Brain.', title2: 'Mayores ingresos. Cero caos.', subtitle: 'UFInf analiza que funciona para ti, encuentra tus mejores horarios, sugiere tus temas top y publica automaticamente en todo. Resultado: +70% vistas, crecimiento 3x mas rapido.', main: 'Inicia tu estrategia de crecimiento', alt: 'Saber mas' },
      score: 'Growth Score', publishWindow: 'Publica hoy 18:00-20:00', sectionLabels: ['Sistema del producto', 'Live MVP', 'Estrategia', 'Monetizacion'],
      enterprise: ['Listo para App Store y Google Play', 'One Click Publish orchestration', 'AI Content Brain insights engine', 'Control de publicacion y coste', 'Multi-workspace para agencias'],
      stats: ['Estado del producto', 'Modo de generacion', 'Cobertura de plataformas', 'Objetivo de despliegue'],
      statValues: ['MVP beta', 'AI workflow', 'TikTok / YouTube / IG / FB / X', 'Datos reales, sin metricas inventadas'],
      featuresTitle: '8 herramientas AI potentes — todo en un precio, sin costos ocultos',
      features: [
        ['AI Content Factory', '1 tema -> 30 dias de contenido listo para TikTok, YouTube Shorts, Reels, Facebook y X. Sin trabajo manual.'],
        ['AI Trend Radar', 'Senales de tendencia diarias antes que tu competencia. Tu primero — no ellos.'],
        ['AI Competition', 'Mira todo: formatos, horarios, hashtags y frecuencia de los top creadores en tu nicho.'],
        ['AI Growth Coach v2', 'Introduce nicho + seguidores -> plan personalizado: que, cuando y como publicar para crecer 3x mas rapido.'],
        ['30-day Scheduler Export', 'Calendario de 30 dias listo en CSV y formato Notion. Un clic — todo el mes planificado.'],
        ['Revenue AI', 'Indica exactamente que contenidos y nichos te generarian ingresos reales. Sin adivinanzas.'],
        ['AI Assets Studio — GRATIS', 'Generador gratuito: memes, posts, miniaturas, carruseles, stories, anuncios. Export PNG / JPG / PDF. Sin API de pago.'],
        ['One Click Publish', 'Publica en todas las plataformas a la vez. Un boton — todo hecho.'],
      ],
      demo: { title: 'Content Factory + Growth Coach', topic: 'Tema / link / idea / descripcion del video', niche: 'Nicho', plan: 'Plan', estimated: 'Coste estimado', active: 'Listo para generar', button: 'Generar paquete de contenido', loading: 'Generando paquete...', emptyTitle: 'El resultado aparecera aqui', emptyText: 'Agrega un tema o archivos fuente y el paquete final aparecera aqui automaticamente.', loadingTitle: 'Creando tu paquete', loadingText: 'Estamos generando variantes para todas las plataformas y desplazando la vista al resultado.', attachments: 'Archivos fuente', addFiles: 'Agregar archivos', removeFile: 'Quitar archivo', planToday: 'Plan para hoy', content: 'Contenido', blocked: 'No se pudo preparar el paquete', defaultTopic: 'Sube un video de YouTube y conviertelo en una serie para TikTok, Shorts, Reels, Facebook y X', defaultNiche: 'AI / negocio / educacion', apiError: 'Error de conexion con la API.' },
      security: { title: 'Proteccion de nivel produccion contra gasto y abuso', text: 'La plataforma ahora incluye protecciones duras: limites por plan, coste maximo por request, soft stop de presupuesto, rate limit en generacion y checkout, modo demo sin API y topes diarios globales.', items: [['Soft stop de presupuesto', 'El sistema detiene nuevas generaciones antes de quemar el gasto diario de AI'], ['Rate limit por IP', 'Generate y Stripe Checkout quedan protegidos contra spam y bots'], ['Sin claves en frontend', 'Las API keys viven solo en el servidor'], ['2FA + admin seguro', 'El panel admin exige password, TOTP y sesion firmada']] },
      pricing: { title: '🚀 Elige el plan que devuelve valor antes de costarte de verdad', plans: [['Free', '$0', 'Prueba sin riesgo', 'Empieza gratis — 5 generaciones al dia, Assets Studio FREE completo y sin tarjeta'], ['Pro', '$19', '⭐ Mejor punto de entrada', '70 generaciones diarias — ideal para creadores, consultores y micro-agencias'], ['Premium Plus', '$49', '🔥 Mejor valor', '220 generaciones diarias — publish, content brain y revenue AI en un solo stack'], ['Expert', '$99', '💎 Hecho para escala', '500 generaciones diarias — prioridad, maximos limites y el sistema completo']], choose: 'Empezar ahora', start: 'Empezar ahora ->', topup: '💡 Necesitas un empuje sin subir de plan? Compra puntual: 25 creditos por $9, 75 por $24 o 200 por $49 — sin contrato y sin suscripcion.' },
      cta: { title: 'UFInf: tu sistema global de crecimiento creator-first.', text: 'Unete a miles de creadores que publican mas rapido, ganan mas y dejan de perder tiempo gestionando contenido manualmente. Empieza hoy — gratis.', growth: 'Empezar gratis', admin: '' },
      footer: { text: 'UFInf - Ultra Future Influencer - 2026 - Built to scale', pricing: 'Precios', features: 'Features' },
    },
  });

  const hero = variant === 'a' ? copy.heroA : copy.heroB;
  const [topic, setTopic] = useState(copy.demo.defaultTopic);
  const [niche, setNiche] = useState(copy.demo.defaultNiche);
  const [plan, setPlan] = useState('pro');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [billingMessage, setBillingMessage] = useState('');
  const [checkoutLoadingKey, setCheckoutLoadingKey] = useState('');
  const resultRef = useRef<HTMLDivElement | null>(null);
  const estimated = useMemo(() => Math.max(0.01, ((topic.length + niche.length + 500) / 4 / 1000) * 0.00015 + 0.0006).toFixed(4), [topic, niche]);

  useEffect(() => {
    fetch('/api/admin/session').then((res) => res.json()).then((data) => setIsAdmin(Boolean(data.isAdmin))).catch(() => setIsAdmin(false));
  }, []);

  useEffect(() => {
    if ((loading || result) && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [loading, result]);

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    setIsAdmin(false);
  }

  async function runDemo() {
    setLoading(true);
    setResult(null);
    try {
      const attachmentContext = await buildAttachmentContext(attachments);
      const res = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic, niche, plan, platform: 'all', language, attachmentContext }) });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: copy.demo.apiError });
    }
    setLoading(false);
  }

  function addFiles(list: FileList | null) {
    if (!list?.length) return;
    setAttachments((prev) => {
      const merged = [...prev];
      for (const file of Array.from(list)) {
        if (!merged.some((item) => item.name === file.name && item.size === file.size && item.lastModified === file.lastModified)) {
          merged.push(file);
        }
      }
      return merged;
    });
  }

  function removeFile(index: number) {
    setAttachments((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
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

  const featureIcons = [Clapperboard, Radar, Gauge, Brain, CalendarClock, DollarSign, Sparkles, Rocket];

  return (
    <main className="page-bg">
      <nav className="nav">
        <div className="brand"><span className="logo"><Sparkles size={17} color="#030d1a" /></span>UFInf</div>
        <div className="navlinks"><a href="#factory">{copy.nav.factory}</a><a href="#trends">{copy.nav.trends}</a><a href="/dashboard" className="navlink-hot">{copy.nav.dashboard}</a><a href="#pricing" className="navlink-hot">{copy.nav.pricing}</a></div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <LanguageSwitcher compact />
          {!user ? (
            <>
              <a href="/login" className="btn btn-ghost btn-sm"><LogIn size={13} /> {copy.nav.login}</a>
              <a href="/register" className="btn btn-primary btn-sm"><UserPlus size={13} /> {copy.nav.register}</a>
            </>
          ) : (
            <>
              <a href="/dashboard" className="btn btn-ghost btn-sm"><UserCircle2 size={13} /> {copy.nav.account}</a>
              <button className="btn btn-ghost btn-sm" onClick={() => { signOut(); window.location.href = '/'; }}><LogOut size={13} /> {copy.nav.logout}</button>
            </>
          )}
          {!user && <a href="/dashboard" className="btn btn-primary btn-sm btn-pulse-attention">{copy.nav.enter}</a>}
        </div>
      </nav>

      <section className="hero">
        <div>
          <div className="eyebrow"><Rocket size={14} /> {hero.eyebrow}</div>
          <h1>{hero.title1}<br /><span className="gradient-text">UFInf</span><br />{hero.title2}</h1>
          <p className="lead">{hero.subtitle}</p>
          <div className="cta-row"><a href="/dashboard" className="btn btn-primary btn-lg btn-pulse-attention">{hero.main} <ArrowRight size={18} /></a><a href="#pricing" className="btn btn-ghost btn-lg navlink-hot">{hero.alt}</a></div>
          <div className="platforms-row">{PLATFORMS.map((platform) => <span key={platform.name} className={`badge ${platform.cls}`}>{platform.name}</span>)}</div>
        </div>
        <div className="hero-card"><div className="phone-mock"><div className="phone-notch" /><div className="phone-score-ring"><b>MVP</b><small>Growth OS</small></div><div className="phone-coach-tip"><CalendarClock size={15} /> {copy.publishWindow}</div><div className="phone-mini-grid"><div className="phone-mini-card"><b>AI</b>Factory</div><div className="phone-mini-card"><b>Ready</b>to ship</div><div className="phone-mini-card"><b>Real</b>Data only</div><div className="phone-mini-card"><b>Sync</b>Platforms</div></div><button className="phone-publish-btn">✨ Publish Everywhere</button></div></div>
      </section>

      <section className="section" style={{ paddingTop: 10 }}><div className="enterprise-strip"><span>A/B variant: {variant.toUpperCase()}</span>{copy.enterprise.map((item) => <span key={item}>{item}</span>)}</div></section>

      <div style={{ maxWidth: 1480, margin: '0 auto', padding: '0 5vw 40px' }}><div className="grid-4">{[{ label: copy.stats[0], value: copy.statValues[0], icon: Users }, { label: copy.stats[1], value: copy.statValues[1], icon: Clapperboard }, { label: copy.stats[2], value: copy.statValues[2], icon: TrendingUp }, { label: copy.stats[3], value: copy.statValues[3], icon: BarChart3 }].map(({ label, value, icon: Icon }) => <div key={label} className="card card-sm" style={{ textAlign: 'center' }}><Icon size={20} color="var(--cyan)" style={{ margin: '0 auto 8px' }} /><div style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-.04em' }}>{value}</div><div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{label}</div></div>)}</div></div>

      <section className="section" id="factory"><div className="section-header"><p className="section-label">{copy.sectionLabels[0]}</p><h2>{copy.featuresTitle}</h2></div><div className="feature-grid">{copy.features.map(([title, text], index) => { const Icon = featureIcons[index]; return <article className="feature-card" key={title}><div className="feature-icon"><Icon size={28} color={['var(--cyan)', 'var(--violet)', 'var(--pink)', 'var(--green)', 'var(--orange)', 'var(--yellow)', 'var(--violet)'][index]} /></div><h3>{title}</h3><p>{text}</p></article>; })}</div></section>

      <section className="section" id="demo"><div className="section-header left"><p className="section-label">{copy.sectionLabels[1]}</p><h2>{copy.demo.title}</h2></div><div className="demo-section"><div className="demo-panel"><div className="form-group"><label className="form-label">{copy.demo.topic}</label><textarea value={topic} onChange={(e) => setTopic(e.target.value)} /></div><div className="form-group" style={{ marginBottom: 12 }}><label className="form-label">{copy.demo.attachments}</label><div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}><label className="btn btn-ghost btn-sm" style={{ width: 'fit-content' }}><Paperclip size={14} /> {copy.demo.addFiles}<input type="file" multiple onChange={(e) => addFiles(e.target.files)} style={{ display: 'none' }} /></label>{attachments.length > 0 && <div style={{ display: 'grid', gap: 8 }}>{attachments.map((file, index) => <div key={`${file.name}-${file.lastModified}-${file.size}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,.04)' }}><div style={{ minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>{file.type || 'file'} • {(file.size / 1024).toFixed(file.size >= 1024 * 1024 ? 0 : 1)} KB</div></div><button type="button" className="btn btn-ghost btn-sm" onClick={() => removeFile(index)} aria-label={copy.demo.removeFile}><X size={13} /></button></div>)}</div>}</div></div><div className="grid-2" style={{ gap: 12, marginBottom: 12 }}><div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">{copy.demo.niche}</label><input value={niche} onChange={(e) => setNiche(e.target.value)} type="text" /></div><div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">{copy.demo.plan}</label><select value={plan} onChange={(e) => setPlan(e.target.value)}><option value="free">Free</option><option value="pro">Pro</option><option value="premium_plus">Premium Plus</option><option value="expert">Expert</option></select></div></div><div className="budget-guard"><ShieldCheck size={16} /> {copy.demo.estimated}: <strong>${estimated}</strong> - {copy.demo.active}</div><button className="btn btn-primary btn-full" onClick={runDemo} disabled={loading || (!topic.trim() && attachments.length === 0)}>{loading ? <><span className="spinner" /> {copy.demo.loading}</> : `⚡ ${copy.demo.button}`}</button></div><div className="result-panel" ref={resultRef}>{loading && <div className="result-empty"><Loader size={44} style={{ animation: 'spin .7s linear infinite' }} /><h3>{copy.demo.loadingTitle}</h3><p style={{ fontSize: 13 }}>{copy.demo.loadingText}</p></div>}{!loading && !result && <div className="result-empty"><UploadCloud size={44} /><h3>{copy.demo.emptyTitle}</h3><p style={{ fontSize: 13 }}>{copy.demo.emptyText}</p></div>}{!loading && result?.result && <div className="animate-in"><div className="result-top"><span className="verdict">{result.result.verdict}</span></div><h3 style={{ fontSize: 15, marginBottom: 10 }}>{copy.demo.planToday}</h3>{result.result.coach.map((item: string) => <div className="check-item" key={item}><CheckCircle2 size={15} />{item}</div>)}<h3 style={{ fontSize: 15, margin: '14px 0 8px' }}>{copy.demo.content}</h3>{Object.entries(result.result.content).map(([key, value]) => <div className="content-item" key={key}><div className="content-item-label">{key}</div><p>{String(value)}</p></div>)}<div className="hashtag-row">{result.result.hashtags.map((tag: string) => <span key={tag}>{tag}</span>)}</div></div>}{!loading && result?.error && <div className="result-empty"><LockKeyhole size={44} /><h3>{copy.demo.blocked}</h3><p style={{ fontSize: 13 }}>{result.error}</p></div>}</div></div></section>


      <section className="section" id="pricing"><div className="section-header"><p className="section-label">{copy.sectionLabels[3]}</p><h2>{copy.pricing.title}</h2></div><div className="pricing-grid">{copy.pricing.plans.map(([name, price, badge, limit], index, all) => { const planKey = (['free', 'pro', 'premium_plus', 'expert'][index] || 'free') as 'free' | 'pro' | 'premium_plus' | 'expert'; return <article key={String(name)} className={`price-card${index === 1 ? ' best' : ''}`}><div className="price-badge">{badge}</div><h3 style={{ fontSize: 20, marginBottom: 10 }}>{name}</h3><div className="price-amount">{price}<small>/mo</small></div><div className="price-limit">{limit}</div><button className={`btn ${index === 1 ? 'btn-primary' : 'btn-ghost'} btn-full`} style={{ marginTop: 20 }} onClick={() => openCheckout('subscription', planKey)} disabled={checkoutLoadingKey === `subscription:${planKey}`}>{checkoutLoadingKey === `subscription:${planKey}` ? (language === 'pl' ? 'Otwieranie...' : language === 'es' ? 'Abriendo...' : 'Opening...') : (index === 1 ? copy.pricing.start : copy.pricing.choose)}</button></article>; })}</div><p style={{ textAlign: 'center', color: 'var(--muted)', marginTop: 14 }}>{copy.pricing.topup}</p></section>

      <section className="section" id="topup"><div className="section-header"><p className="section-label">{language === 'pl' ? 'Zakup jednorazowy' : language === 'es' ? 'Compra unica' : 'One-time purchase'}</p><h2>{language === 'pl' ? 'Dokup kredyty contentu, gdy potrzebujesz skali' : language === 'es' ? 'Compra creditos de contenido cuando necesites escala' : 'Buy extra content credits when you need scale'}</h2></div><div className="pricing-grid">{Object.values(TOP_UP_PACKS).map((pack) => <article key={pack.id} className="price-card"><div className="price-badge">{pack.bonusLabel || (language === 'pl' ? 'Jednorazowe' : language === 'es' ? 'Unica vez' : 'One-time')}</div><h3 style={{ fontSize: 20, marginBottom: 10 }}>{pack.label}</h3><div className="price-amount">${pack.priceUsd}<small>one-time</small></div><div className="price-limit">{pack.generations} {language === 'pl' ? 'generacji' : language === 'es' ? 'generaciones' : 'generations'}</div>{pack.description && <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, marginBottom: 16, lineHeight: 1.5 }}>{pack.description}</p>}<button className="btn btn-primary btn-full" style={{ marginTop: 'auto' }} onClick={() => openCheckout('topup', pack.id)} disabled={checkoutLoadingKey === `topup:${pack.id}`}>{checkoutLoadingKey === `topup:${pack.id}` ? (language === 'pl' ? 'Otwieranie...' : language === 'es' ? 'Abriendo...' : 'Opening...') : (language === 'pl' ? 'Kup pakiet' : language === 'es' ? 'Comprar paquete' : 'Buy pack')}</button></article>)}</div>{billingMessage ? <div className="alert alert-info" style={{ marginTop: 14, maxWidth: 920, marginLeft: 'auto', marginRight: 'auto' }}>{billingMessage}</div> : null}</section>

      <section className="section" style={{ paddingTop: 16 }}><div className="global-cta"><h2>{copy.cta.title}</h2><p>{copy.cta.text}</p><div className="cta-row" style={{ justifyContent: 'center', marginBottom: 0 }}><a href="/dashboard" className="btn btn-gradient btn-lg">{copy.cta.growth}</a></div></div></section>

      <MobileDownloadStrip />

      <footer style={{ textAlign: 'center', color: 'var(--muted)', padding: '32px 5vw', borderTop: '1px solid var(--stroke)' }}><p>{copy.footer.text}</p><p style={{ marginTop: 8, fontSize: 12 }}><a href="/dashboard" style={{ color: 'var(--cyan)' }}>Dashboard</a> · <a href="#pricing" style={{ color: 'var(--muted)', marginLeft: 12 }}>{copy.footer.pricing}</a> · <a href="#factory" style={{ color: 'var(--muted)', marginLeft: 12 }}>{copy.footer.features}</a></p></footer>
    </main>
  );
}

