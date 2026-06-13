'use client';

import { useEffect, useMemo, useState } from 'react';
import { Image, Video, Sparkles, Film, Zap, Wand2, Download, FileText, History, Crown } from 'lucide-react';
import { byLanguage, useI18n } from '@/lib/i18n';

type StudioMode = 'image' | 'video';
type ProviderMode = 'fast' | 'fallback' | 'quality_max';

type VideoBlueprint = {
  headline?: string;
  hook?: string;
  scenes?: Array<{
    title?: string;
    visual?: string;
    voiceover?: string;
    caption?: string;
    durationSec?: number;
  }>;
  cta?: string;
  soundtrack?: string;
  editNotes?: string[];
};

type HistoryItem = {
  id: string;
  mode: StudioMode;
  topic: string;
  preset: string;
  tone: string;
  language: 'pl' | 'en' | 'es';
  providerMode: ProviderMode;
  providerUsed: string;
  generatedPrompt?: string;
  revisedPrompt?: string;
  imageDataUrl?: string;
  blueprint?: VideoBlueprint;
  createdAt: string;
};

type FreeAssetGroup = {
  id: string;
  title: string;
  description: string;
  items: Array<{
    name: string;
    url: string;
    license: string;
    bestFor: string;
  }>;
};

const LOCAL_HISTORY_KEY = 'ufinf_studio_history_v1';

export default function Studio() {
  const { language } = useI18n();
  const copy = byLanguage(language, {
    pl: { 
      title: 'AI Studio', 
      subtitle: 'Tworzenie promptów do miniatur, grafik i krótkich materiałów wideo.', 
      topicLabel: 'Temat', 
      preset: 'Preset', 
      tone: 'Ton wizualny', 
      generate: 'Generuj', 
      image: 'Prompt obraz', 
      video: 'Prompt video', 
      providerLabel: 'Tryb premium video',
      providerModes: {
        fast: 'Fast',
        fallback: 'Fallback',
        quality_max: 'Quality Max',
      },
      result: 'Wynik', 
      resultText: 'Gotowy prompt do Midjourney, DALL-E lub innego narzędzia graficznego.',
      historyTitle: 'Historia projektów',
      historySubtitle: 'Każda generacja obrazu i blueprintu zapisuje się automatycznie.',
      historyEmpty: 'Brak zapisanych projektów Studio.',
      historyLoad: 'Przywróć',
      downloadImage: 'Pobierz obraz',
      exportPdf: 'Eksport briefu do PDF',
      providerUsed: 'Provider',
      generatedAt: 'Wygenerowano',
      qualityModeHint: 'Quality Max łączy dwa premium modele, aby wyciągnąć mocniejszy hook, sceny i notatki montażowe.',
      assetsTitle: 'Darmowe assety produkcyjne',
      assetsSubtitle: 'Zweryfikowane źródła video, audio, obrazów i fontów do zastosowań komercyjnych.',
      assetsEmpty: 'Brak katalogu assetów.',
      defaultTopic: 'Path of Exile 2: najlepszy build startowy', 
      defaultTone: 'dynamiczny, gamingowy', 
      placeholder: 'Np. Top 5 narzędzi AI dla twórców', 
      tonePlaceholder: 'Np. premium, nowoczesny', 
      emptyPrompt: 'Wpisz temat, aby wygenerować prompt.',
      presets: ['Miniatura YouTube 16:9', 'Okładka Reels 9:16', 'Post Facebook 1:1', 'Post X 16:9'],
      videoTitle: 'AI Video Editor',
      videoSubtitle: 'Wrzuć film, wpisz co chcesz zmienić, a AI automatycznie wyedytuje materiał na potrzeby klienta',
      uploadLabel: 'Wrzuć film (MP4, WebM)',
      editorPrompt: 'Co chcesz zmienić w tym filmie?',
      editorPlaceholder: 'Np. "Dodaj napisy, zmień tempo do 1.5x, wytnij pierwsze 5 sekund, zmień muzykę na energiczną"',
      editorGenerate: 'Edytuj wideo',
      editorResult: 'Edytowane wideo',
      editorEmptyPrompt: 'Wrzuć film i wpisz instrukcje edycji',
      lines: (topic: string, preset: string, tone: string) => [ 
        `Stworz grafikę promocyjną dla tematu: ${topic}.`, 
        `Format: ${preset}.`, 
        `Styl: ${tone}.`, 
        'Wymagania: wysoki kontrast, czytelny duży tytuł, twarz lub kluczowy obiekt w centrum, miejsce na logo w prawym dolnym rogu.', 
        'Kolory: neon cyan + ciemne tło + akcent pomarańczowy.', 
        'Dodaj efekt ruchu i energii, ale bez przesadnego szumu.' 
      ] 
    },
    en: { 
      title: 'AI Studio', 
      subtitle: 'Prompt creation for thumbnails, graphics, and short-form video assets.', 
      topicLabel: 'Topic', 
      preset: 'Preset', 
      tone: 'Visual tone', 
      generate: 'Generate', 
      image: 'Image prompt', 
      video: 'Video prompt', 
      providerLabel: 'Premium video mode',
      providerModes: {
        fast: 'Fast',
        fallback: 'Fallback',
        quality_max: 'Quality Max',
      },
      result: 'Result', 
      resultText: 'Ready prompt for Midjourney, DALL-E, or another visual tool.', 
      historyTitle: 'Project history',
      historySubtitle: 'Every generated image and blueprint is saved automatically.',
      historyEmpty: 'No Studio projects saved yet.',
      historyLoad: 'Restore',
      downloadImage: 'Download image',
      exportPdf: 'Export brief to PDF',
      providerUsed: 'Provider',
      generatedAt: 'Generated',
      qualityModeHint: 'Quality Max blends two premium models to produce a stronger hook, richer scenes, and tighter edit notes.',
      assetsTitle: 'Free production assets',
      assetsSubtitle: 'Curated sources for video, audio, image, and typography assets.',
      assetsEmpty: 'Asset catalog is not available.',
      defaultTopic: 'Path of Exile 2: best starter build', 
      defaultTone: 'dynamic, gaming', 
      placeholder: 'E.g. Top 5 AI tools for creators', 
      tonePlaceholder: 'E.g. premium, modern', 
      emptyPrompt: 'Enter a topic to generate a prompt.',
      presets: ['YouTube thumbnail 16:9', 'Reels cover 9:16', 'Facebook post 1:1', 'X post 16:9'],
      videoTitle: 'AI Video Editor',
      videoSubtitle: 'Upload a video, type what you want to change, and AI will automatically edit it for your client',
      uploadLabel: 'Upload video (MP4, WebM)',
      editorPrompt: 'What do you want to change in this video?',
      editorPlaceholder: 'E.g. "Add subtitles, speed up to 1.5x, trim first 5 seconds, change music to upbeat"',
      editorGenerate: 'Edit video',
      editorResult: 'Edited video',
      editorEmptyPrompt: 'Upload a video and type editing instructions',
      lines: (topic: string, preset: string, tone: string) => [ 
        `Create a promotional graphic for the topic: ${topic}.`, 
        `Format: ${preset}.`, 
        `Style: ${tone}.`, 
        'Requirements: high contrast, large readable headline, face or key object centered, logo space in the bottom-right corner.', 
        'Colors: neon cyan + dark background + orange accent.', 
        'Add motion and energy, but avoid excessive noise.' 
      ] 
    },
    es: { 
      title: 'AI Studio', 
      subtitle: 'Creación de prompts para miniaturas, gráficos y piezas cortas de video.', 
      topicLabel: 'Tema', 
      preset: 'Preset', 
      tone: 'Tono visual', 
      generate: 'Generar', 
      image: 'Prompt de imagen', 
      video: 'Prompt de video', 
      providerLabel: 'Modo premium de video',
      providerModes: {
        fast: 'Fast',
        fallback: 'Fallback',
        quality_max: 'Quality Max',
      },
      result: 'Resultado', 
      resultText: 'Prompt listo para Midjourney, DALL-E u otra herramienta visual.', 
      historyTitle: 'Historial de proyectos',
      historySubtitle: 'Cada imagen y blueprint generado se guarda automáticamente.',
      historyEmpty: 'Aún no hay proyectos guardados en Studio.',
      historyLoad: 'Restaurar',
      downloadImage: 'Descargar imagen',
      exportPdf: 'Exportar brief a PDF',
      providerUsed: 'Provider',
      generatedAt: 'Generado',
      qualityModeHint: 'Quality Max combina dos modelos premium para conseguir un hook más fuerte, escenas más ricas y mejores notas de edición.',
      assetsTitle: 'Activos gratuitos de producción',
      assetsSubtitle: 'Fuentes curadas para video, audio, imagen y tipografía.',
      assetsEmpty: 'El catálogo de activos no está disponible.',
      defaultTopic: 'Path of Exile 2: mejor build inicial', 
      defaultTone: 'dinámico, gaming', 
      placeholder: 'Ej. Top 5 herramientas AI para creadores', 
      tonePlaceholder: 'Ej. premium, moderno', 
      emptyPrompt: 'Introduce un tema para generar un prompt.',
      presets: ['Miniatura YouTube 16:9', 'Portada Reels 9:16', 'Post Facebook 1:1', 'Post X 16:9'],
      videoTitle: 'Editor de Video AI',
      videoSubtitle: 'Sube un video, escribe qué quieres cambiar, y la IA editará automáticamente el material para tu cliente',
      uploadLabel: 'Subir video (MP4, WebM)',
      editorPrompt: '¿Qué quieres cambiar en este video?',
      editorPlaceholder: 'Ej. "Agrega subtítulos, aumenta velocidad a 1.5x, corta primeros 5 segundos, cambia música a energética"',
      editorGenerate: 'Editar video',
      editorResult: 'Video editado',
      editorEmptyPrompt: 'Sube un video e introduce instrucciones de edición',
      lines: (topic: string, preset: string, tone: string) => [ 
        `Crea un gráfico promocional para el tema: ${topic}.`, 
        `Formato: ${preset}.`, 
        `Estilo: ${tone}.`, 
        'Requisitos: alto contraste, título grande y legible, rostro u objeto clave en el centro, espacio para logo en la esquina inferior derecha.', 
        'Colores: cyan neon + fondo oscuro + acento naranja.', 
        'Agrega sensación de movimiento y energía, pero sin ruido excesivo.' 
      ] 
    },
  });
  const [topic, setTopic] = useState(copy.defaultTopic);
  const [preset, setPreset] = useState(copy.presets[0]);
  const [tone, setTone] = useState(copy.defaultTone);
  const [activePromptType, setActivePromptType] = useState<StudioMode>('image');
  const [providerMode, setProviderMode] = useState<ProviderMode>('quality_max');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [studioLoading, setStudioLoading] = useState(false);
  const [studioError, setStudioError] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [videoBlueprint, setVideoBlueprint] = useState<VideoBlueprint | null>(null);
  const [providerUsed, setProviderUsed] = useState<string | null>(null);
  const [providersTried, setProvidersTried] = useState<string[]>([]);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [assetGroups, setAssetGroups] = useState<FreeAssetGroup[]>([]);
  const [assetsError, setAssetsError] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoEditorPrompt, setVideoEditorPrompt] = useState('');
  const [videoEditing, setVideoEditing] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoEditError, setVideoEditError] = useState<string | null>(null);
  const [videoEditSummary, setVideoEditSummary] = useState<Record<string, unknown> | null>(null);
  const [editedVideoUrl, setEditedVideoUrl] = useState<string | null>(null);
  const [activeVideoJobId, setActiveVideoJobId] = useState<string | null>(null);

  const imagePrompt = useMemo(() => {
    if (!topic.trim()) return copy.emptyPrompt;
    return copy.lines(topic, preset, tone).join(' ');
  }, [copy, preset, tone, topic]);

  const videoPrompt = useMemo(() => {
    if (!topic.trim()) return copy.emptyPrompt;
    return [
      language === 'pl'
        ? `Stworz scenariusz short video dla tematu: ${topic}.`
        : language === 'es'
        ? `Crea un guion de short video sobre: ${topic}.`
        : `Create a short-form video script about: ${topic}.`,
      language === 'pl'
        ? `Format wyjsciowy: ${preset}.`
        : language === 'es'
        ? `Formato de salida: ${preset}.`
        : `Output format: ${preset}.`,
      language === 'pl'
        ? `Ton: ${tone}.`
        : language === 'es'
        ? `Tono: ${tone}.`
        : `Tone: ${tone}.`,
      language === 'pl'
        ? 'Zawrz: hook 0-3s, glowna teza, 3 kluczowe sceny, CTA na koncu, propozycje ujec i tempo montazu.'
        : language === 'es'
        ? 'Incluye: hook 0-3s, tesis principal, 3 escenas clave, CTA final, sugerencias de tomas y ritmo de edicion.'
        : 'Include: 0-3s hook, core thesis, 3 key scenes, final CTA, shot list suggestions and editing cadence.',
    ].join(' ');
  }, [language, preset, tone, topic, copy.emptyPrompt]);

  useEffect(() => {
    setGeneratedPrompt(activePromptType === 'image' ? imagePrompt : videoPrompt);
  }, [activePromptType, imagePrompt, videoPrompt]);

  useEffect(() => {
    return () => {
      if (editedVideoUrl) {
        URL.revokeObjectURL(editedVideoUrl);
      }
    };
  }, [editedVideoUrl]);

  useEffect(() => {
    void loadHistory();
    void loadAssetCatalog();
  }, []);

  async function loadHistory() {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const localItems = readLocalHistory();
      const res = await fetch('/api/studio/history?limit=12', { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setHistoryError(String(data?.error || 'History load failed.'));
        setHistoryItems(localItems);
        return;
      }
      const remoteItems = Array.isArray(data?.items) ? data.items as HistoryItem[] : [];
      const merged = [...localItems, ...remoteItems]
        .filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index)
        .slice(0, 12);
      setHistoryItems(merged);
    } catch {
      setHistoryError(language === 'pl' ? 'Nie udalo sie wczytac historii Studio.' : language === 'es' ? 'No se pudo cargar el historial de Studio.' : 'Failed to load Studio history.');
      setHistoryItems(readLocalHistory());
    } finally {
      setHistoryLoading(false);
    }
  }

  function readLocalHistory() {
    if (typeof window === 'undefined') return [] as HistoryItem[];
    try {
      const raw = window.localStorage.getItem(LOCAL_HISTORY_KEY);
      if (!raw) return [] as HistoryItem[];
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? parsed as HistoryItem[] : [];
    } catch {
      return [] as HistoryItem[];
    }
  }

  function writeLocalHistory(items: HistoryItem[]) {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(items.slice(0, 20)));
    } catch {
      // Ignore storage quota issues to keep generation flow uninterrupted.
    }
  }

  async function loadAssetCatalog() {
    setAssetsError(null);
    try {
      const res = await fetch('/api/studio/assets', { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAssetsError(String(data?.error || 'Asset catalog load failed.'));
        return;
      }
      setAssetGroups(Array.isArray(data?.groups) ? data.groups as FreeAssetGroup[] : []);
    } catch {
      setAssetsError(language === 'pl' ? 'Nie udalo sie pobrac katalogu assetow.' : language === 'es' ? 'No se pudo cargar el catálogo de activos.' : 'Failed to load asset catalog.');
    }
  }

  function applyHistoryItem(item: HistoryItem) {
    setTopic(item.topic);
    setPreset(item.preset);
    setTone(item.tone);
    setProviderMode(item.providerMode || 'fallback');
    setActivePromptType(item.mode);
    setProviderUsed(item.providerUsed || null);
    setGeneratedPrompt(item.revisedPrompt || item.generatedPrompt || '');
    setGeneratedImageUrl(item.imageDataUrl || null);
    setVideoBlueprint(item.blueprint || null);
    setStudioError(null);
  }

  function prependHistoryItem(item: HistoryItem | null | undefined) {
    if (!item) return;
    setHistoryItems((prev) => {
      const merged = [item, ...prev.filter((entry) => entry.id !== item.id)].slice(0, 12);
      writeLocalHistory(merged);
      return merged;
    });
  }

  function downloadImageAsset(imageUrl: string, fileTopic: string) {
    const anchor = document.createElement('a');
    const safeTopic = fileTopic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'studio-image';
    anchor.href = imageUrl;
    anchor.download = `${safeTopic}.png`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  async function exportVideoBriefPdf() {
    if (!videoBlueprint) return;
    try {
      const res = await fetch('/api/studio/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          preset,
          tone,
          language,
          providerUsed,
          blueprint: videoBlueprint,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setStudioError(String(errorData?.error || 'PDF export failed.'));
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      const safeTopic = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'video-brief';
      anchor.href = url;
      anchor.download = `${safeTopic}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch {
      setStudioError(language === 'pl' ? 'Nie udalo sie wyeksportowac PDF.' : language === 'es' ? 'No se pudo exportar el PDF.' : 'Failed to export PDF.');
    }
  }

  async function generateStudioAsset() {
    if (!topic.trim()) return;
    setStudioLoading(true);
    setStudioError(null);
    setGeneratedImageUrl(null);
    setVideoBlueprint(null);
    setProviderUsed(null);
    setProvidersTried([]);

    try {
      const res = await fetch('/api/studio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          preset,
          tone,
          language,
          mode: activePromptType,
          providerMode,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStudioError(String(data?.error || 'Studio generation failed.'));
        return;
      }

      if (activePromptType === 'image') {
        setGeneratedImageUrl(typeof data?.imageDataUrl === 'string' ? data.imageDataUrl : null);
        setGeneratedPrompt(typeof data?.revisedPrompt === 'string' ? data.revisedPrompt : imagePrompt);
        setProviderUsed(typeof data?.providerUsed === 'string' ? data.providerUsed : 'openai:gpt-image-1');
        prependHistoryItem((typeof data?.historyEntry === 'object' && data.historyEntry) ? data.historyEntry as HistoryItem : null);
        return;
      }

      setVideoBlueprint((typeof data?.blueprint === 'object' && data.blueprint !== null) ? data.blueprint as VideoBlueprint : null);
      setGeneratedPrompt(videoPrompt);
      setProviderUsed(typeof data?.providerUsed === 'string' ? data.providerUsed : null);
      setProvidersTried(Array.isArray(data?.providersTried) ? data.providersTried.map((item: unknown) => String(item)) : []);
      prependHistoryItem((typeof data?.historyEntry === 'object' && data.historyEntry) ? data.historyEntry as HistoryItem : null);
    } catch {
      setStudioError(language === 'pl' ? 'Blad polaczenia ze Studio AI.' : language === 'es' ? 'Error de conexion con Studio AI.' : 'Studio AI connection error.');
    } finally {
      setStudioLoading(false);
    }
  }

  async function editVideo() {
    if (!videoFile || !videoEditorPrompt.trim()) return;
    setVideoEditing(true);
    setVideoProgress(0);
    setVideoEditError(null);
    setVideoEditSummary(null);
    setActiveVideoJobId(null);
    if (editedVideoUrl) {
      URL.revokeObjectURL(editedVideoUrl);
      setEditedVideoUrl(null);
    }
    
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('instruction', videoEditorPrompt);
    formData.append('language', language);
    
    try {
      const res = await fetch('/api/video/edit', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setVideoEditError(String(errData?.error || 'Video processing failed.'));
        return;
      }
      const data = await res.json().catch(() => ({}));
      const jobId = typeof data?.id === 'string' ? data.id : typeof data?.jobId === 'string' ? data.jobId : null;
      if (!jobId) {
        setVideoEditError(language === 'pl' ? 'Brak ID zadania video.' : language === 'es' ? 'Falta ID de tarea de video.' : 'Missing video job ID.');
        return;
      }

      setActiveVideoJobId(jobId);
      setVideoEditSummary(data || {});

      for (let attempt = 0; attempt < 120; attempt += 1) {
        const pollRes = await fetch(`/api/video/jobs/${jobId}`, { cache: 'no-store' });
        const pollData = await pollRes.json().catch(() => ({}));
        if (!pollRes.ok) {
          setVideoEditError(String(pollData?.error || 'Polling failed.'));
          return;
        }

        setVideoEditSummary(pollData || {});
        const progressValue = Number(pollData?.progress);
        if (Number.isFinite(progressValue)) {
          setVideoProgress(Math.max(0, Math.min(100, progressValue)));
        }

        const status = String(pollData?.status || '');
        if (status === 'failed') {
          setVideoEditError(String(pollData?.error || pollData?.message || 'Video processing failed.'));
          return;
        }

        if (status === 'done') {
          const resultRes = await fetch(`/api/video/jobs/${jobId}/result`, { cache: 'no-store' });
          if (!resultRes.ok) {
            const err = await resultRes.json().catch(() => ({}));
            setVideoEditError(String(err?.error || 'Rendered file is unavailable.'));
            return;
          }

          const blob = await resultRes.blob();
          const url = URL.createObjectURL(blob);
          setEditedVideoUrl(url);
          setVideoProgress(100);
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      setVideoEditError(language === 'pl' ? 'Przekroczono czas oczekiwania na wynik video.' : language === 'es' ? 'Tiempo de espera agotado para el resultado de video.' : 'Timed out waiting for video result.');
    } catch (error) {
      console.error('Video editing error:', error);
      setVideoEditError(language === 'pl' ? 'Blad polaczenia z silnikiem video.' : language === 'es' ? 'Error de conexion con el motor de video.' : 'Video engine connection error.');
    } finally {
      setVideoProgress((prev) => (prev < 100 ? 0 : prev));
      setVideoEditing(false);
    }
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>{copy.title}</h1>
        <p>{copy.subtitle}</p>
      </div>

      {/* Prompt Generator */}
      <div className="grid-2" style={{ gap: 20, marginBottom: 40 }}>
        <div className="card">
          <div className="form-group">
            <label className="form-label">{copy.topicLabel}</label>
            <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder={copy.placeholder} />
          </div>

          <div className="form-group">
            <label className="form-label">{copy.preset}</label>
            <select value={preset} onChange={(e) => setPreset(e.target.value)}>
              {copy.presets.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">{copy.tone}</label>
            <input type="text" value={tone} onChange={(e) => setTone(e.target.value)} placeholder={copy.tonePlaceholder} />
          </div>

          {activePromptType === 'video' && (
            <div className="form-group">
              <label className="form-label">{copy.providerLabel}</label>
              <div className="flex items-center gap-8" style={{ gap: 8, flexWrap: 'wrap' }}>
                {(['fast', 'fallback', 'quality_max'] as ProviderMode[]).map((mode) => (
                  <button
                    key={mode}
                    className={`btn btn-ghost btn-sm${providerMode === mode ? ' active' : ''}`}
                    onClick={() => setProviderMode(mode)}
                  >
                    <Crown size={14} /> {copy.providerModes[mode]}
                  </button>
                ))}
              </div>
              <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 8 }}>{copy.qualityModeHint}</p>
            </div>
          )}

          <div className="flex items-center gap-8" style={{ gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={generateStudioAsset} disabled={studioLoading || !topic.trim()}>
              <Sparkles size={14} /> {copy.generate}
            </button>
            <button className={`btn btn-ghost btn-sm${activePromptType === 'image' ? ' active' : ''}`} onClick={() => setActivePromptType('image')}>
              <Image size={14} /> {copy.image}
            </button>
            <button className={`btn btn-ghost btn-sm${activePromptType === 'video' ? ' active' : ''}`} onClick={() => setActivePromptType('video')}>
              <Video size={14} /> {copy.video}
            </button>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{copy.result}</h3>
          <p style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 10 }}>
            {copy.resultText}
          </p>
          {studioError && (
            <div className="alert alert-error" style={{ marginBottom: 10 }}>{studioError}</div>
          )}
          {studioLoading && (
            <div className="alert alert-info" style={{ marginBottom: 10 }}>
              <Sparkles size={14} /> {language === 'pl' ? 'Studio generuje asset premium...' : language === 'es' ? 'Studio esta generando el asset premium...' : 'Studio is generating the premium asset...'}
            </div>
          )}
          {providerUsed && (
            <div className="alert alert-success" style={{ marginBottom: 10 }}>
              <Crown size={14} /> {copy.providerUsed}: {providerUsed}
              {providersTried.length > 1 ? ` | tried: ${providersTried.join(' -> ')}` : ''}
            </div>
          )}
          {generatedImageUrl && activePromptType === 'image' && (
            <div style={{ marginBottom: 12 }}>
              <img src={generatedImageUrl} alt={topic} style={{ width: '100%', borderRadius: 12, border: '1px solid var(--stroke)' }} />
              <div className="flex items-center gap-8" style={{ marginTop: 10, gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => downloadImageAsset(generatedImageUrl, topic)}>
                  <Download size={14} /> {copy.downloadImage}
                </button>
              </div>
            </div>
          )}
          {videoBlueprint && activePromptType === 'video' && (
            <div style={{ display: 'grid', gap: 10, marginBottom: 12 }}>
              {typeof videoBlueprint.headline === 'string' && (
                <div style={{ fontSize: 16, fontWeight: 700 }}>{videoBlueprint.headline}</div>
              )}
              {typeof videoBlueprint.hook === 'string' && (
                <div className="studio-output">{videoBlueprint.hook}</div>
              )}
              {Array.isArray(videoBlueprint.scenes) && (
                <div style={{ display: 'grid', gap: 8 }}>
                  {(videoBlueprint.scenes as Array<Record<string, unknown>>).map((scene, index) => (
                    <div key={index} style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,.04)' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{String(scene.title || `Scene ${index + 1}`)}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>{String(scene.visual || '')}</div>
                      <div style={{ fontSize: 12 }}>{String(scene.voiceover || '')}</div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-8" style={{ gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-ghost btn-sm" onClick={exportVideoBriefPdf}>
                  <FileText size={14} /> {copy.exportPdf}
                </button>
              </div>
            </div>
          )}
          <div className="studio-output">{generatedPrompt || copy.emptyPrompt}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <History size={18} color="var(--cyan)" />
          <div>
            <h3 style={{ margin: 0, fontSize: 16 }}>{copy.historyTitle}</h3>
            <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 12 }}>{copy.historySubtitle}</p>
          </div>
        </div>
        {historyError && <div className="alert alert-error" style={{ marginBottom: 10 }}>{historyError}</div>}
        {historyLoading ? (
          <div className="alert alert-info"><Sparkles size={14} /> Loading history...</div>
        ) : historyItems.length ? (
          <div style={{ display: 'grid', gap: 12 }}>
            {historyItems.map((item) => (
              <div key={item.id} style={{ display: 'grid', gap: 8, padding: 14, borderRadius: 14, border: '1px solid var(--stroke)', background: 'rgba(255,255,255,.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'start', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{item.topic}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                      {item.mode.toUpperCase()} | {item.preset} | {copy.providerUsed}: {item.providerUsed}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                      {copy.generatedAt}: {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => applyHistoryItem(item)}>
                    <History size={14} /> {copy.historyLoad}
                  </button>
                </div>
                {item.imageDataUrl && (
                  <img src={item.imageDataUrl} alt={item.topic} style={{ width: '100%', maxWidth: 280, borderRadius: 12, border: '1px solid var(--stroke)' }} />
                )}
                {item.blueprint?.hook && (
                  <div className="studio-output">{item.blueprint.hook}</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="studio-output">{copy.historyEmpty}</div>
        )}
      </div>

      <div className="card" style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <Sparkles size={18} color="var(--cyan)" />
          <div>
            <h3 style={{ margin: 0, fontSize: 16 }}>{copy.assetsTitle}</h3>
            <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 12 }}>{copy.assetsSubtitle}</p>
          </div>
        </div>
        {assetsError && <div className="alert alert-error" style={{ marginBottom: 10 }}>{assetsError}</div>}
        {assetGroups.length ? (
          <div style={{ display: 'grid', gap: 12 }}>
            {assetGroups.map((group) => (
              <div key={group.id} style={{ padding: 14, borderRadius: 12, border: '1px solid var(--stroke)', background: 'rgba(255,255,255,.02)' }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{group.title}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>{group.description}</div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {group.items.map((item) => (
                    <a key={item.url} href={item.url} target="_blank" rel="noreferrer" style={{ display: 'block', textDecoration: 'none' }}>
                      <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,.04)' }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{item.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{item.license}</div>
                        <div style={{ fontSize: 12, marginTop: 4 }}>{item.bestFor}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="studio-output">{copy.assetsEmpty}</div>
        )}
      </div>

      {/* AI Video Editor - NEW */}
      <div className="card" style={{ marginBottom: 40, borderColor: 'var(--cyan)', borderWidth: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Film size={24} color="var(--cyan)" />
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px' }}>{copy.videoTitle}</h2>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>{copy.videoSubtitle}</p>
          </div>
        </div>

        <div className="grid-2" style={{ gap: 20 }}>
          <div>
            <div className="form-group">
              <label className="form-label">{copy.uploadLabel}</label>
              <div style={{
                border: '2px dashed var(--stroke)',
                borderRadius: 8,
                padding: 20,
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: 'rgba(0,200,255,0.05)',
                transition: 'all 0.2s',
              }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.backgroundColor = 'rgba(0,200,255,0.15)';
                  e.currentTarget.style.borderColor = 'var(--cyan)';
                }}
                onDragLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0,200,255,0.05)';
                  e.currentTarget.style.borderColor = 'var(--stroke)';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.backgroundColor = 'rgba(0,200,255,0.05)';
                  const files = e.dataTransfer.files;
                  if (files.length > 0) setVideoFile(files[0]);
                }}
              >
                <input
                  type="file"
                  accept="video/mp4,video/webm"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  style={{ display: 'none' }}
                  id="video-upload"
                />
                <label htmlFor="video-upload" style={{ cursor: 'pointer' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🎬</div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    {videoFile ? videoFile.name : 'Wrzuć lub kliknij aby wybrać'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>MP4 lub WebM (max 500MB)</div>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{copy.editorPrompt}</label>
              <textarea
                value={videoEditorPrompt}
                onChange={(e) => setVideoEditorPrompt(e.target.value)}
                placeholder={copy.editorPlaceholder}
                style={{ minHeight: 100 }}
              />
            </div>

            <button 
              className="btn btn-primary btn-full" 
              onClick={editVideo}
              disabled={!videoFile || !videoEditorPrompt.trim() || videoEditing}
            >
              <Wand2 size={14} />
              {videoEditing ? (language === 'pl' ? 'Edytuję...' : language === 'es' ? 'Editando...' : 'Editing...') : copy.editorGenerate}
            </button>

            {videoEditing && (
              <div style={{ marginTop: 10 }}>
                <div style={{
                  height: 8,
                  borderRadius: 999,
                  background: 'rgba(255,255,255,.08)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${videoProgress}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--cyan), #58f3c3)',
                    transition: 'width .3s ease',
                  }} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
                  {language === 'pl' ? `Przetwarzanie: ${videoProgress}%` : language === 'es' ? `Procesando: ${videoProgress}%` : `Processing: ${videoProgress}%`}
                </div>
                {activeVideoJobId && (
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                    Job ID: {activeVideoJobId}
                  </div>
                )}
              </div>
            )}

            {videoEditError && (
              <div className="alert alert-error" style={{ marginTop: 12 }}>
                {videoEditError}
              </div>
            )}

            {videoEditSummary && (
              <div className="card" style={{ marginTop: 12, background: 'rgba(255,255,255,.03)' }}>
                {(() => {
                  const summaryStatus = typeof videoEditSummary.status === 'string'
                    ? videoEditSummary.status
                    : (language === 'pl' ? 'Status zadania' : language === 'es' ? 'Estado de tarea' : 'Job status');
                  const summaryMessage = typeof videoEditSummary.message === 'string'
                    ? videoEditSummary.message
                    : '';

                  return (
                    <>
                <h4 style={{ fontSize: 14, marginBottom: 8 }}>
                  {summaryStatus}
                </h4>
                {summaryMessage && (
                  <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>{summaryMessage}</p>
                )}
                {Array.isArray(videoEditSummary.editingOperations) && (
                  <div style={{ display: 'grid', gap: 6 }}>
                    {(videoEditSummary.editingOperations as Array<Record<string, unknown>>).map((op, idx) => (
                      <div key={idx} style={{ fontSize: 12, padding: '6px 8px', borderRadius: 8, background: 'rgba(255,255,255,.04)' }}>
                        <strong>{String(op.operation || 'step')}</strong>: {String(op.description || '')}
                      </div>
                    ))}
                  </div>
                )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          <div style={{
            backgroundColor: 'rgba(0,200,255,0.05)',
            borderRadius: 8,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 250,
          }}>
            {videoFile ? (
              <>
                <Video size={48} color="var(--cyan)" style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Gotowe do edycji</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{videoFile.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 12 }}>
                  {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                </div>
                {editedVideoUrl && (
                  <div style={{ width: '100%', marginTop: 12 }}>
                    <video controls src={editedVideoUrl} style={{ width: '100%', borderRadius: 8 }} />
                  </div>
                )}
              </>
            ) : (
              <>
                <Zap size={48} color="var(--muted)" style={{ marginBottom: 8, opacity: 0.3 }} />
                <div style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>
                  {copy.editorEmptyPrompt}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
