'use client';

import { useMemo, useState } from 'react';
import { Image, Video, Sparkles, Film, Zap, Wand2 } from 'lucide-react';
import { byLanguage, useI18n } from '@/lib/i18n';

const PRESETS = [
  'Miniatura YouTube 16:9',
  'Okładka Reels 9:16',
  'Post Facebook 1:1',
  'Post X 16:9',
];

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
      result: 'Wynik', 
      resultText: 'Gotowy prompt do Midjourney, DALL-E lub innego narzędzia graficznego.',
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
      result: 'Result', 
      resultText: 'Ready prompt for Midjourney, DALL-E, or another visual tool.', 
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
      result: 'Resultado', 
      resultText: 'Prompt listo para Midjourney, DALL-E u otra herramienta visual.', 
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
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoEditorPrompt, setVideoEditorPrompt] = useState('');
  const [videoEditing, setVideoEditing] = useState(false);

  const prompt = useMemo(() => {
    if (!topic.trim()) return copy.emptyPrompt;
    return copy.lines(topic, preset, tone).join(' ');
  }, [copy, preset, tone, topic]);

  async function editVideo() {
    if (!videoFile || !videoEditorPrompt.trim()) return;
    setVideoEditing(true);
    
    // Symulacja edycji - w produkcji byłoby połączenie z FFmpeg/API video editing
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('instruction', videoEditorPrompt);
    formData.append('language', language);
    
    try {
      const res = await fetch('/api/video/edit', {
        method: 'POST',
        body: formData,
      });
      
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        // Wynik byłby wyświetlony w video playerze
      }
    } catch (error) {
      console.error('Video editing error:', error);
    } finally {
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

          <div className="flex items-center gap-8" style={{ gap: 8 }}>
            <button className="btn btn-primary btn-sm">
              <Sparkles size={14} /> {copy.generate}
            </button>
            <button className="btn btn-ghost btn-sm">
              <Image size={14} /> {copy.image}
            </button>
            <button className="btn btn-ghost btn-sm">
              <Video size={14} /> {copy.video}
            </button>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{copy.result}</h3>
          <p style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 10 }}>
            {copy.resultText}
          </p>
          <div className="studio-output">{prompt}</div>
        </div>
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
