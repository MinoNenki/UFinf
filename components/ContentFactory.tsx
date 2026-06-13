'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Clapperboard, ShieldCheck, Copy, Check, Loader, Paperclip, X, WandSparkles } from 'lucide-react';
import { buildAttachmentContext } from '@/lib/attachmentContext';
import { byLanguage, useI18n } from '@/lib/i18n';

const PLATFORMS = [
  { id: 'tiktok', label: 'TikTok', cls: 'plat-tiktok' },
  { id: 'youtube', label: 'YouTube Shorts', cls: 'plat-youtube' },
  { id: 'instagram', label: 'Instagram Reels', cls: 'plat-instagram' },
  { id: 'facebook', label: 'Facebook', cls: 'plat-facebook' },
  { id: 'x', label: 'X / Twitter', cls: 'plat-x' },
];

const NICHES = ['AI / tech', 'Gaming', 'Lifestyle', 'Finance', 'Travel', 'Food', 'Fitness', 'Creator Economy'];

const CAMPAIGN_GOALS = [
  { id: 'awareness', label: 'Awareness' },
  { id: 'leads', label: 'Leads' },
  { id: 'sales', label: 'Sales' },
  { id: 'authority', label: 'Authority' },
  { id: 'community', label: 'Community' },
];

const SHORT_VIDEO_TEMPLATES = [
  { id: 'finance-authority', label: 'Finanse: Ekspert', niche: 'Finance', goal: 'authority', styleHint: 'editorial premium, high-contrast data overlays, trust-first narrative' },
  { id: 'ecommerce-sales', label: 'Ecommerce: Sprzedaz', niche: 'AI / tech', goal: 'sales', styleHint: 'product-led storytelling, offer-stack clarity, conversion-focused CTA' },
  { id: 'gaming-community', label: 'Gaming: Community', niche: 'Gaming', goal: 'community', styleHint: 'high-energy pacing, neon accents, co-op vibe, strong comment bait' },
  { id: 'education-leads', label: 'Edukacja: Leady', niche: 'Creator Economy', goal: 'leads', styleHint: 'clarity-first teaching, step overlays, practical lead magnet CTA' },
  { id: 'travel-awareness', label: 'Travel: Viral Discovery', niche: 'Travel', goal: 'awareness', styleHint: 'cinematic discovery shots, geo-story pacing, curiosity-first hooks' },
  { id: 'food-sales', label: 'Food: Conversion Menu', niche: 'Food', goal: 'sales', styleHint: 'close-up sensory cuts, irresistible offer stack, fast appetite triggers' },
  { id: 'fitness-leads', label: 'Fitness: Lead Magnet', niche: 'Fitness', goal: 'leads', styleHint: 'performance coach vibe, tangible milestones, challenge-based CTA' },
  { id: 'lifestyle-authority', label: 'Lifestyle: Premium Authority', niche: 'Lifestyle', goal: 'authority', styleHint: 'editorial vlog aesthetic, credible routines, anti-hype expert framing' },
  { id: 'tech-awareness', label: 'Tech: Pattern Break', niche: 'AI / tech', goal: 'awareness', styleHint: 'future-forward visuals, myth-busting openers, precision language' },
  { id: 'creator-community', label: 'Creator: Audience Loop', niche: 'Creator Economy', goal: 'community', styleHint: 'comment-driven narrative, collab invitations, social proof loops' },
  { id: 'gaming-sales', label: 'Gaming: Offer Push', niche: 'Gaming', goal: 'sales', styleHint: 'high-retention pacing, power-up progression, urgency CTA' },
  { id: 'finance-leads', label: 'Finance: Lead Engine', niche: 'Finance', goal: 'leads', styleHint: 'clarity-first money framework, practical examples, trust-forward lead magnet CTA' },
] as const;

type ContentResult = {
  guard?: { estimatedCost: number; allowed: boolean };
  promptQuality?: {
    score: number;
    issues: Array<{
      key: string;
      message: string;
      penalty: number;
      autoFix: string;
    }>;
    appliedAutoFixes: string[];
  };
  strategy?: {
    goal: string;
    styleMode: string;
    resolvedNiche: string;
    styleProfile: string;
    shortVideoTemplate: {
      hookFormula: string;
      sceneFlow: string[];
      ctaFormula: string;
      visualDirection: string;
      editCadence: string;
    };
  };
  result?: {
    verdict: string;
    score: number;
    bestTime: string;
    trend: string;
    content: Record<string, string>;
    hashtags: string[];
    nextIdeas: string[];
    coach: string[];
  };
  error?: string;
};

export default function ContentFactory() {
  const { language } = useI18n();
  const copy = byLanguage(language, {
    pl: {
      title: 'Content Factory',
      subtitle: 'Jeden temat -> premium pakiet tresci gotowy do publikacji globalnej',
      steps: ['Wpisz temat', 'Sprawdz koszt', 'Odbierz tresci'],
      config: 'Konfiguracja tresci',
      topic: 'Temat / link / opis / pomysl na film',
      placeholder: 'np. Jak zbudowac globalna marke creator-first i zwiekszyc konwersje...',
      niche: 'Nisza',
      campaignGoal: 'Cel kampanii',
      styleMode: 'Tryb stylu',
      styleAuto: 'Auto',
      styleManual: 'Manual',
      styleHint: 'Styl manualny',
      styleHintPlaceholder: 'Np. cinematic premium, editorial, high contrast, trust-first',
      templatesTitle: 'Gotowe szablony short-video',
      templatesSubtitle: 'Kliknij, aby od razu ustawic nisze, cel i styl promptu.',
      plan: 'Plan API',
      platforms: 'Platformy',
      budget: 'Szacowany koszt',
      limit: 'Gotowe do wygenerowania',
      generate: 'Wygeneruj Pakiet Tresci',
      generating: 'Generuje pakiet...',
      emptyTitle: 'Wyniki pojawia sie tutaj',
      emptyText: 'Wpisz temat albo dodaj pliki zrodlowe i kliknij przycisk generowania.',
      loadingTitle: 'Tworzymy pakiet tresci',
      loadingText: 'Przygotowujemy wersje pod wybrane platformy. Wyniki pojawia sie automatycznie ponizej.',
      attachments: 'Pliki zrodlowe',
      addFiles: 'Dodaj pliki',
      removeFile: 'Usun plik',
      bestTime: 'Najlepszy czas',
      coach: 'Growth Coach',
      ideas: 'Kolejne pomysly',
      planTitle: 'PLAN DZIALANIA',
      ideasTitle: 'KOLEJNE POMYSLY',
      copied: 'Skopiowano',
      copyBtn: 'Kopiuj',
      hashtags: 'Hashtagi',
      error: 'Blad polaczenia z API.',
      strategyTitle: 'Silnik strategii kampanii',
      strategyMode: 'Tryb',
      strategyProfile: 'Profil',
      strategyHook: 'Formula hooka',
      strategyCta: 'Formula CTA',
      strategyVisual: 'Kierunek wizualny',
      strategyCadence: 'Tempo montazu',
      promptRankTitle: 'Ranking jakosci promptu',
      promptScore: 'Wynik',
      promptFixes: 'Auto-fix',
      promptIssues: 'Wykryte problemy',
    },
    en: {
      title: 'Content Factory',
      subtitle: 'One topic -> premium content package ready for global distribution',
      steps: ['Enter topic', 'Check cost', 'Collect content'],
      config: 'Content setup',
      topic: 'Topic / link / description / video idea',
      placeholder: 'e.g. How to build a global creator-first brand and increase conversion...',
      niche: 'Niche',
      campaignGoal: 'Campaign goal',
      styleMode: 'Style mode',
      styleAuto: 'Auto',
      styleManual: 'Manual',
      styleHint: 'Manual style',
      styleHintPlaceholder: 'E.g. cinematic premium, editorial, high contrast, trust-first',
      templatesTitle: 'Ready short-video templates',
      templatesSubtitle: 'Click once to set niche, campaign goal, and prompt style.',
      plan: 'API plan',
      platforms: 'Platforms',
      budget: 'Estimated cost',
      limit: 'Ready to generate',
      generate: 'Generate Content Pack',
      generating: 'Generating pack...',
      emptyTitle: 'Results will appear here',
      emptyText: 'Enter a topic or add source files and start generation.',
      loadingTitle: 'Building your content pack',
      loadingText: 'We are generating versions for the selected platforms. Results will appear below automatically.',
      attachments: 'Source files',
      addFiles: 'Add files',
      removeFile: 'Remove file',
      bestTime: 'Best time',
      coach: 'Growth Coach',
      ideas: 'Next ideas',
      planTitle: 'ACTION PLAN',
      ideasTitle: 'NEXT IDEAS',
      copied: 'Copied',
      copyBtn: 'Copy',
      hashtags: 'Hashtags',
      error: 'API connection error.',
      strategyTitle: 'Campaign strategy engine',
      strategyMode: 'Mode',
      strategyProfile: 'Profile',
      strategyHook: 'Hook formula',
      strategyCta: 'CTA formula',
      strategyVisual: 'Visual direction',
      strategyCadence: 'Edit cadence',
      promptRankTitle: 'Prompt quality ranking',
      promptScore: 'Score',
      promptFixes: 'Auto-fix',
      promptIssues: 'Detected issues',
    },
    es: {
      title: 'Fabrica de contenido',
      subtitle: 'Un tema -> paquete premium listo para distribucion global',
      steps: ['Introduce tema', 'Revisa coste', 'Recoge contenido'],
      config: 'Configuracion de contenido',
      topic: 'Tema / link / descripcion / idea de video',
      placeholder: 'ej. Como construir una marca global creator-first y aumentar conversion...',
      niche: 'Nicho',
      campaignGoal: 'Objetivo de campana',
      styleMode: 'Modo de estilo',
      styleAuto: 'Auto',
      styleManual: 'Manual',
      styleHint: 'Estilo manual',
      styleHintPlaceholder: 'Ej. cinematic premium, editorial, high contrast, trust-first',
      templatesTitle: 'Plantillas short-video',
      templatesSubtitle: 'Haz clic para definir nicho, objetivo y estilo del prompt.',
      plan: 'Plan API',
      platforms: 'Plataformas',
      budget: 'Coste estimado',
      limit: 'Listo para generar',
      generate: 'Generar paquete de contenido',
      generating: 'Generando paquete...',
      emptyTitle: 'Los resultados apareceran aqui',
      emptyText: 'Introduce un tema o agrega archivos fuente y lanza la generacion.',
      loadingTitle: 'Creando tu paquete de contenido',
      loadingText: 'Estamos preparando versiones para las plataformas seleccionadas. Los resultados apareceran abajo automaticamente.',
      attachments: 'Archivos fuente',
      addFiles: 'Agregar archivos',
      removeFile: 'Quitar archivo',
      bestTime: 'Mejor hora',
      coach: 'Growth Coach',
      ideas: 'Siguientes ideas',
      planTitle: 'PLAN DE ACCION',
      ideasTitle: 'SIGUIENTES IDEAS',
      copied: 'Copiado',
      copyBtn: 'Copiar',
      hashtags: 'Hashtags',
      error: 'Error de conexion con la API.',
      strategyTitle: 'Motor de estrategia de campana',
      strategyMode: 'Modo',
      strategyProfile: 'Perfil',
      strategyHook: 'Formula de hook',
      strategyCta: 'Formula de CTA',
      strategyVisual: 'Direccion visual',
      strategyCadence: 'Cadencia de edicion',
      promptRankTitle: 'Ranking de calidad del prompt',
      promptScore: 'Puntuacion',
      promptFixes: 'Auto-fix',
      promptIssues: 'Problemas detectados',
    },
  });

  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState('');
  const [niche, setNiche] = useState('AI / tech');
  const [plan, setPlan] = useState('pro');
  const [campaignGoal, setCampaignGoal] = useState('awareness');
  const [styleMode, setStyleMode] = useState<'auto' | 'manual'>('auto');
  const [manualStyleHint, setManualStyleHint] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['tiktok', 'youtube', 'instagram']);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ContentResult | null>(null);
  const [activeTab, setActiveTab] = useState('tiktok');
  const [copied, setCopied] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const resultRef = useRef<HTMLDivElement | null>(null);

  const inputLength = topic.length + niche.length + 500;
  const estimatedCost = useMemo(() => Math.max(0.001, (inputLength / 4 / 1000) * 0.00015 + 0.0006).toFixed(4), [inputLength]);

  useEffect(() => {
    if ((loading || result) && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [loading, result]);

  function togglePlatform(id: string) {
    setSelectedPlatforms((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  function applyTemplate(templateId: string) {
    const template = SHORT_VIDEO_TEMPLATES.find((item) => item.id === templateId);
    if (!template) return;
    setNiche(template.niche);
    setCampaignGoal(template.goal);
    setStyleMode('manual');
    setManualStyleHint(template.styleHint);
  }

  async function generate() {
    if (!topic.trim() && attachments.length === 0) return;
    setLoading(true);
    setResult(null);
    setStep(2);
    try {
      const attachmentContext = await buildAttachmentContext(attachments);
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          niche,
          plan,
          platform: selectedPlatforms.join(','),
          language,
          attachmentContext,
          campaignGoal,
          styleMode,
          manualStyleHint,
        }),
      });
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : {};
      if (!res.ok) {
        setResult({ error: data?.error || raw || copy.error });
        setLoading(false);
        return;
      }
      setResult(data);
      if (data.result) {
        setStep(3);
        setActiveTab(selectedPlatforms[0] || 'tiktok');
      }
    } catch {
      setResult({ error: copy.error });
    }
    setLoading(false);
  }

  function addFiles(list: FileList | null) {
    if (!list?.length) return;
    setAttachments((prev) => {
      const incoming = Array.from(list);
      const merged = [...prev];
      for (const file of incoming) {
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

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  const PLATFORM_KEYS: Record<string, string> = {
    tiktok: 'tiktok',
    youtube: 'shorts',
    instagram: 'reels',
    facebook: 'facebook',
    x: 'x',
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>{copy.title}</h1>
        <p>{copy.subtitle}</p>
      </div>

      <div className="flex items-center gap-8 mb-20" style={{ marginBottom: 20 }}>
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-8">
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              fontSize: 12,
              fontWeight: 900,
              background: step >= s ? 'var(--cyan)' : 'rgba(255,255,255,.08)',
              color: step >= s ? '#030d1a' : 'var(--muted)',
            }}>{s}</div>
            <span style={{ fontSize: 13, color: step >= s ? 'var(--text)' : 'var(--muted)' }}>{copy.steps[s - 1]}</span>
            {s < 3 && <span style={{ color: 'var(--stroke)', margin: '0 4px' }}>-&gt;</span>}
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ gap: 20, alignItems: 'start' }}>
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}><Clapperboard size={16} style={{ marginRight: 8 }} />{copy.config}</h3>

          <div className="form-group">
            <label className="form-label">{copy.topic}</label>
            <textarea data-testid="cf-topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder={copy.placeholder} style={{ minHeight: 120 }} />
          </div>

          <div className="form-group">
            <label className="form-label">{copy.attachments}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label className="btn btn-ghost btn-sm" style={{ width: 'fit-content' }}>
                <Paperclip size={14} /> {copy.addFiles}
                <input type="file" multiple onChange={(event) => addFiles(event.target.files)} style={{ display: 'none' }} />
              </label>
              {attachments.length > 0 && (
                <div style={{ display: 'grid', gap: 8 }}>
                  {attachments.map((file, index) => (
                    <div key={`${file.name}-${file.lastModified}-${file.size}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,.04)' }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{file.type || 'file'} | {(file.size / 1024).toFixed(file.size >= 1024 * 1024 ? 0 : 1)} KB</div>
                      </div>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeFile(index)} aria-label={copy.removeFile}><X size={13} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-group"><label className="form-label">{copy.niche}</label><select data-testid="cf-niche" value={niche} onChange={(e) => setNiche(e.target.value)}>{NICHES.map((n) => <option key={n} value={n}>{n}</option>)}</select></div>
          <div className="form-group"><label className="form-label">{copy.campaignGoal}</label><select data-testid="cf-campaign-goal" value={campaignGoal} onChange={(e) => setCampaignGoal(e.target.value)}>{CAMPAIGN_GOALS.map((goal) => <option key={goal.id} value={goal.id}>{goal.label}</option>)}</select></div>

          <div className="form-group">
            <label className="form-label">{copy.styleMode}</label>
            <div className="checkbox-group">
              <label className={`checkbox-item${styleMode === 'auto' ? ' selected' : ''}`}><input data-testid="cf-style-auto" type="radio" name="styleMode" checked={styleMode === 'auto'} onChange={() => setStyleMode('auto')} /><span>{copy.styleAuto}</span></label>
              <label className={`checkbox-item${styleMode === 'manual' ? ' selected' : ''}`}><input data-testid="cf-style-manual" type="radio" name="styleMode" checked={styleMode === 'manual'} onChange={() => setStyleMode('manual')} /><span>{copy.styleManual}</span></label>
            </div>
          </div>

          {styleMode === 'manual' && (
            <div className="form-group">
              <label className="form-label">{copy.styleHint}</label>
              <input data-testid="cf-style-hint" type="text" value={manualStyleHint} onChange={(event) => setManualStyleHint(event.target.value)} placeholder={copy.styleHintPlaceholder} />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">{copy.templatesTitle}</label>
            <p style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 8 }}>{copy.templatesSubtitle}</p>
            <div className="checkbox-group" style={{ gap: 8 }}>
              {SHORT_VIDEO_TEMPLATES.map((template) => (
                <button data-testid={`cf-template-${template.id}`} key={template.id} type="button" className="btn btn-ghost btn-sm" onClick={() => applyTemplate(template.id)}><WandSparkles size={13} /> {template.label}</button>
              ))}
            </div>
          </div>

          <div className="form-group"><label className="form-label">{copy.plan}</label><select value={plan} onChange={(e) => setPlan(e.target.value)}><option value="free">Free (3/dzien)</option><option value="pro">Pro (40/dzien)</option><option value="premium_plus">Premium Plus (120/dzien)</option><option value="expert">Expert (360/dzien)</option></select></div>

          <div className="form-group">
            <label className="form-label">{copy.platforms}</label>
            <div className="checkbox-group">
              {PLATFORMS.map((p) => (
                <label key={p.id} className={`checkbox-item${selectedPlatforms.includes(p.id) ? ' selected' : ''}`}>
                  <input type="checkbox" checked={selectedPlatforms.includes(p.id)} onChange={() => togglePlatform(p.id)} />
                  <span className={`badge ${p.cls}`} style={{ border: 'none', padding: '0', background: 'none', fontSize: 12 }}>{p.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="budget-guard" onClick={() => step === 1 && setStep(2)} style={{ cursor: 'pointer' }}>
            <ShieldCheck size={16} />
            <div>
              <strong>{copy.budget}</strong>: <strong>${estimatedCost}</strong>
              {step >= 2 && <span style={{ color: 'var(--green)', marginLeft: 8 }}>[OK] {copy.limit}</span>}
            </div>
          </div>

          <button data-testid="cf-generate" className="btn btn-primary btn-full" onClick={generate} disabled={loading || (!topic.trim() && attachments.length === 0) || selectedPlatforms.length === 0} style={{ marginTop: 12 }}>
            {loading ? <><Loader size={15} style={{ animation: 'spin .7s linear infinite' }} /> {copy.generating}</> : copy.generate}
          </button>

          {result?.error && <div className="alert alert-error" style={{ marginTop: 12 }}>{result.error}</div>}
        </div>

        <div className="card" ref={resultRef}>
          {loading && (
            <div style={{ minHeight: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 12 }}>
              <Loader size={32} style={{ animation: 'spin .7s linear infinite', color: 'var(--cyan)' }} />
              <h3 style={{ fontSize: 17 }}>{copy.loadingTitle}</h3>
              <p style={{ color: 'var(--muted)', fontSize: 13 }}>{copy.loadingText}</p>
            </div>
          )}

          {!loading && !result?.result && (
            <div style={{ minHeight: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 12 }}>
              <Clapperboard size={44} color="rgba(255,255,255,.15)" />
              <h3 style={{ fontSize: 17 }}>{copy.emptyTitle}</h3>
              <p style={{ color: 'var(--muted)', fontSize: 13 }}>{copy.emptyText}</p>
            </div>
          )}

          {!loading && result?.result && (
            <div className="animate-in">
              {result.promptQuality && (
                <div data-testid="cf-prompt-quality" className="card" style={{ marginBottom: 14, background: 'rgba(255,255,255,.03)' }}>
                  <h4 style={{ fontSize: 14, marginBottom: 8 }}>{copy.promptRankTitle}</h4>
                  <div style={{ fontSize: 12, marginBottom: 8 }}>
                    <strong>{copy.promptScore}:</strong> {result.promptQuality.score}/100
                  </div>
                  {result.promptQuality.issues.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>{copy.promptIssues}</div>
                      <div style={{ display: 'grid', gap: 6 }}>
                        {result.promptQuality.issues.map((issue) => (
                          <div key={issue.key} style={{ fontSize: 12 }}>
                            - {issue.message} (-{issue.penalty})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.promptQuality.appliedAutoFixes.length > 0 && (
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>{copy.promptFixes}</div>
                      <div style={{ display: 'grid', gap: 6 }}>
                        {result.promptQuality.appliedAutoFixes.map((fix, idx) => (
                          <div key={`${fix}-${idx}`} style={{ fontSize: 12 }}>- {fix}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {result.strategy && (
                <div className="card" style={{ marginBottom: 14, background: 'rgba(255,255,255,.03)' }}>
                  <h4 style={{ fontSize: 14, marginBottom: 8 }}>{copy.strategyTitle}</h4>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
                    {copy.strategyMode}: {result.strategy.styleMode} | {copy.strategyProfile}: {result.strategy.styleProfile}
                  </div>
                  <div style={{ fontSize: 12, marginBottom: 6 }}><strong>{copy.strategyHook}:</strong> {result.strategy.shortVideoTemplate.hookFormula}</div>
                  <div style={{ fontSize: 12, marginBottom: 6 }}><strong>{copy.strategyCta}:</strong> {result.strategy.shortVideoTemplate.ctaFormula}</div>
                  <div style={{ fontSize: 12, marginBottom: 6 }}><strong>{copy.strategyVisual}:</strong> {result.strategy.shortVideoTemplate.visualDirection}</div>
                  <div style={{ fontSize: 12 }}><strong>{copy.strategyCadence}:</strong> {result.strategy.shortVideoTemplate.editCadence}</div>
                </div>
              )}

              <div className="result-top" style={{ marginBottom: 16 }}>
                <div>
                  <span className="verdict">{result.result.verdict}</span>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{copy.bestTime}: {result.result.bestTime}</div>
                </div>
                <div className="score">{result.result.score}/100</div>
              </div>

              <div className="tabs" style={{ marginBottom: 16 }}>
                {selectedPlatforms.map((plat) => (
                  <button key={plat} className={`tab-btn${activeTab === plat ? ' active' : ''}`} onClick={() => setActiveTab(plat)}>
                    {PLATFORMS.find((p) => p.id === plat)?.label || plat}
                  </button>
                ))}
                <button className={`tab-btn${activeTab === 'coach' ? ' active' : ''}`} onClick={() => setActiveTab('coach')}>{copy.coach}</button>
                <button className={`tab-btn${activeTab === 'ideas' ? ' active' : ''}`} onClick={() => setActiveTab('ideas')}>{copy.ideas}</button>
              </div>

              {activeTab === 'coach' && (
                <div>
                  <h4 style={{ fontSize: 14, marginBottom: 10, color: 'var(--muted)' }}>{copy.planTitle}</h4>
                  {result.result.coach.map((c, i) => (
                    <div key={i} className="check-item" style={{ padding: '6px 0' }}>
                      <Check size={15} color="var(--green)" />
                      {c}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'ideas' && (
                <div>
                  <h4 style={{ fontSize: 14, marginBottom: 10, color: 'var(--muted)' }}>{copy.ideasTitle}</h4>
                  {result.result.nextIdeas.map((idea, i) => (
                    <div key={i} style={{ padding: '8px 12px', background: 'rgba(255,255,255,.04)', borderRadius: 10, marginBottom: 8, fontSize: 14 }}>
                      * {idea}
                    </div>
                  ))}
                </div>
              )}

              {!['coach', 'ideas'].includes(activeTab) && (
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <h4 style={{ fontSize: 13, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
                      {PLATFORMS.find((p) => p.id === activeTab)?.label}
                    </h4>
                    <button className={`copy-btn${copied === activeTab ? ' copied' : ''}`} onClick={() => copyText(result.result!.content[PLATFORM_KEYS[activeTab] || activeTab] || '', activeTab)}>
                      {copied === activeTab ? <><Check size={11} /> {copy.copied}</> : <><Copy size={11} /> {copy.copyBtn}</>}
                    </button>
                  </div>
                  <div className="studio-output">
                    {result.result.content[PLATFORM_KEYS[activeTab] || activeTab] || result.result.content.tiktok}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', margin: '12px 0 6px', textTransform: 'uppercase', letterSpacing: '.08em' }}>{copy.hashtags}</div>
                    <div className="hashtag-row">
                      {result.result.hashtags.map((h) => <span key={h}>{h}</span>)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

