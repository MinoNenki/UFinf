'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Clapperboard, ShieldCheck, Copy, Check, Loader, Paperclip, X } from 'lucide-react';
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

type ContentResult = {
  guard?: { estimatedCost: number; allowed: boolean };
  result?: {
    verdict: string; score: number; bestTime: string; trend: string;
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
      title: 'Content Factory', subtitle: 'Jeden temat -> premium pakiet tresci gotowy do publikacji globalnej', steps: ['Wpisz temat', 'Sprawdz koszt', 'Odbierz tresci'], config: 'Konfiguracja tresci', topic: 'Temat / link / opis / pomysl na film', placeholder: 'np. Jak zbudowac globalna marke creator-first i zwiekszyc konwersje...', niche: 'Nisza', plan: 'Plan API', platforms: 'Platformy', budget: 'Szacowany koszt', limit: 'Gotowe do wygenerowania', generate: 'Wygeneruj Pakiet Tresci', generating: 'Generuje pakiet...', emptyTitle: 'Wyniki pojawia sie tutaj', emptyText: 'Wpisz temat albo dodaj pliki zrodlowe i kliknij przycisk generowania.', loadingTitle: 'Tworzymy pakiet tresci', loadingText: 'Przygotowujemy wersje pod wybrane platformy. Wyniki pojawia sie automatycznie ponizej.', attachments: 'Pliki zrodlowe', addFiles: 'Dodaj pliki', removeFile: 'Usun plik', bestTime: 'Najlepszy czas', coach: 'Growth Coach', ideas: 'Kolejne pomysly', planTitle: 'PLAN DZIALANIA', ideasTitle: 'KOLEJNE POMYSLY', copied: 'Skopiowano', copyBtn: 'Kopiuj', hashtags: 'Hashtagi', error: 'Blad polaczenia z API.' },
    en: {
      title: 'Content Factory', subtitle: 'One topic -> premium content package ready for global distribution', steps: ['Enter topic', 'Check cost', 'Collect content'], config: 'Content setup', topic: 'Topic / link / description / video idea', placeholder: 'e.g. How to build a global creator-first brand and increase conversion...', niche: 'Niche', plan: 'API plan', platforms: 'Platforms', budget: 'Estimated cost', limit: 'Ready to generate', generate: 'Generate Content Pack', generating: 'Generating pack...', emptyTitle: 'Results will appear here', emptyText: 'Enter a topic or add source files and start generation.', loadingTitle: 'Building your content pack', loadingText: 'We are generating versions for the selected platforms. Results will appear below automatically.', attachments: 'Source files', addFiles: 'Add files', removeFile: 'Remove file', bestTime: 'Best time', coach: 'Growth Coach', ideas: 'Next ideas', planTitle: 'ACTION PLAN', ideasTitle: 'NEXT IDEAS', copied: 'Copied', copyBtn: 'Copy', hashtags: 'Hashtags', error: 'API connection error.' },
    es: {
      title: 'Fabrica de contenido', subtitle: 'Un tema -> paquete premium listo para distribucion global', steps: ['Introduce tema', 'Revisa coste', 'Recoge contenido'], config: 'Configuracion de contenido', topic: 'Tema / link / descripcion / idea de video', placeholder: 'ej. Como construir una marca global creator-first y aumentar conversion...', niche: 'Nicho', plan: 'Plan API', platforms: 'Plataformas', budget: 'Coste estimado', limit: 'Listo para generar', generate: 'Generar paquete de contenido', generating: 'Generando paquete...', emptyTitle: 'Los resultados apareceran aqui', emptyText: 'Introduce un tema o agrega archivos fuente y lanza la generacion.', loadingTitle: 'Creando tu paquete de contenido', loadingText: 'Estamos preparando versiones para las plataformas seleccionadas. Los resultados apareceran abajo automaticamente.', attachments: 'Archivos fuente', addFiles: 'Agregar archivos', removeFile: 'Quitar archivo', bestTime: 'Mejor hora', coach: 'Growth Coach', ideas: 'Siguientes ideas', planTitle: 'PLAN DE ACCION', ideasTitle: 'SIGUIENTES IDEAS', copied: 'Copiado', copyBtn: 'Copiar', hashtags: 'Hashtags', error: 'Error de conexion con la API.' },
  });
  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState('');
  const [niche, setNiche] = useState('AI / tech');
  const [plan, setPlan] = useState('pro');
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
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
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
        body: JSON.stringify({ topic, niche, plan, platform: selectedPlatforms.join(','), language, attachmentContext }),
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
    tiktok: 'tiktok', youtube: 'shorts', instagram: 'reels', facebook: 'facebook', x: 'x',
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>{copy.title}</h1>
        <p>{copy.subtitle}</p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-8 mb-20" style={{ marginBottom: 20 }}>
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-8">
            <div style={{
              width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center',
              fontSize: 12, fontWeight: 900,
              background: step >= s ? 'var(--cyan)' : 'rgba(255,255,255,.08)',
              color: step >= s ? '#030d1a' : 'var(--muted)',
            }}>
              {s}
            </div>
            <span style={{ fontSize: 13, color: step >= s ? 'var(--text)' : 'var(--muted)' }}>
              {copy.steps[s - 1]}
            </span>
            {s < 3 && <span style={{ color: 'var(--stroke)', margin: '0 4px' }}>→</span>}
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ gap: 20, alignItems: 'start' }}>
        {/* Left: Input form */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
            <Clapperboard size={16} style={{ marginRight: 8 }} />
            {copy.config}
          </h3>

          <div className="form-group">
            <label className="form-label">{copy.topic}</label>
            <textarea
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder={copy.placeholder}
              style={{ minHeight: 120 }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{copy.attachments}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label className="btn btn-ghost btn-sm" style={{ width: 'fit-content' }}>
                <Paperclip size={14} /> {copy.addFiles}
                <input
                  type="file"
                  multiple
                  onChange={(event) => addFiles(event.target.files)}
                  style={{ display: 'none' }}
                />
              </label>
              {attachments.length > 0 && (
                <div style={{ display: 'grid', gap: 8 }}>
                  {attachments.map((file, index) => (
                    <div key={`${file.name}-${file.lastModified}-${file.size}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,.04)' }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{file.type || 'file'} • {(file.size / 1024).toFixed(file.size >= 1024 * 1024 ? 0 : 1)} KB</div>
                      </div>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeFile(index)} aria-label={copy.removeFile}>
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{copy.niche}</label>
            <select value={niche} onChange={e => setNiche(e.target.value)}>
              {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">{copy.plan}</label>
            <select value={plan} onChange={e => setPlan(e.target.value)}>
              <option value="free">Free (3/dzień)</option>
              <option value="pro">Pro (40/dzień)</option>
              <option value="premium_plus">Premium Plus (120/dzień)</option>
              <option value="expert">Expert (360/dzień)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">{copy.platforms}</label>
            <div className="checkbox-group">
              {PLATFORMS.map(p => (
                <label key={p.id} className={`checkbox-item${selectedPlatforms.includes(p.id) ? ' selected' : ''}`}>
                  <input type="checkbox" checked={selectedPlatforms.includes(p.id)} onChange={() => togglePlatform(p.id)} />
                  <span className={`badge ${p.cls}`} style={{ border: 'none', padding: '0', background: 'none', fontSize: 12 }}>{p.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Budget guard */}
          <div className="budget-guard" onClick={() => step === 1 && setStep(2)} style={{ cursor: 'pointer' }}>
            <ShieldCheck size={16} />
            <div>
              <strong>{copy.budget}</strong>: <strong>${estimatedCost}</strong>
              {step >= 2 && <span style={{ color: 'var(--green)', marginLeft: 8 }}>✓ {copy.limit}</span>}
            </div>
          </div>

          <button
            className="btn btn-primary btn-full"
            onClick={generate}
            disabled={loading || (!topic.trim() && attachments.length === 0) || selectedPlatforms.length === 0}
            style={{ marginTop: 12 }}
          >
            {loading ? (
              <><Loader size={15} style={{ animation: 'spin .7s linear infinite' }} /> {copy.generating}</>
            ) : (
              `⚡ ${copy.generate}`
            )}
          </button>

          {result?.error && (
            <div className="alert alert-error" style={{ marginTop: 12 }}>
              {result.error}
            </div>
          )}
        </div>

        {/* Right: Results */}
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
              {/* Score */}
              <div className="result-top" style={{ marginBottom: 16 }}>
                <div>
                  <span className="verdict">{result.result.verdict}</span>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{copy.bestTime}: {result.result.bestTime}</div>
                </div>
                <div className="score">{result.result.score}/100</div>
              </div>

              {/* Platform tabs */}
              <div className="tabs" style={{ marginBottom: 16 }}>
                {selectedPlatforms.map(plat => (
                  <button
                    key={plat}
                    className={`tab-btn${activeTab === plat ? ' active' : ''}`}
                    onClick={() => setActiveTab(plat)}
                  >
                    {PLATFORMS.find(p => p.id === plat)?.label || plat}
                  </button>
                ))}
                <button className={`tab-btn${activeTab === 'coach' ? ' active' : ''}`} onClick={() => setActiveTab('coach')}>
                  {copy.coach}
                </button>
                <button className={`tab-btn${activeTab === 'ideas' ? ' active' : ''}`} onClick={() => setActiveTab('ideas')}>
                  {copy.ideas}
                </button>
              </div>

              {/* Tab content */}
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
                      💡 {idea}
                    </div>
                  ))}
                </div>
              )}

              {!['coach', 'ideas'].includes(activeTab) && (
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <h4 style={{ fontSize: 13, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
                      {PLATFORMS.find(p => p.id === activeTab)?.label}
                    </h4>
                    <button
                      className={`copy-btn${copied === activeTab ? ' copied' : ''}`}
                      onClick={() => copyText(result.result!.content[PLATFORM_KEYS[activeTab] || activeTab] || '', activeTab)}
                    >
                      {copied === activeTab ? <><Check size={11} /> {copy.copied}</> : <><Copy size={11} /> {copy.copyBtn}</>}
                    </button>
                  </div>
                  <div className="studio-output">
                    {result.result.content[PLATFORM_KEYS[activeTab] || activeTab] || result.result.content.tiktok}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', margin: '12px 0 6px', textTransform: 'uppercase', letterSpacing: '.08em' }}>{copy.hashtags}</div>
                    <div className="hashtag-row">
                      {result.result.hashtags.map(h => <span key={h}>{h}</span>)}
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
