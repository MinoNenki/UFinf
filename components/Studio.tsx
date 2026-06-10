'use client';

import { useMemo, useState } from 'react';
import { Image, Video, Sparkles } from 'lucide-react';
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
    pl: { title: 'AI Studio', subtitle: 'Tworzenie promptow do miniatur, grafik i krotkich materialow wideo.', topicLabel: 'Temat', preset: 'Preset', tone: 'Ton wizualny', generate: 'Generuj', image: 'Prompt obraz', video: 'Prompt video', result: 'Wynik', resultText: 'Gotowy prompt do Midjourney, DALL-E lub innego narzedzia graficznego.', defaultTopic: 'Path of Exile 2: najlepszy build startowy', defaultTone: 'dynamiczny, gamingowy', placeholder: 'Np. Top 5 narzedzi AI dla tworcow', tonePlaceholder: 'Np. premium, nowoczesny', emptyPrompt: 'Wpisz temat, aby wygenerowac prompt.', presets: ['Miniatura YouTube 16:9', 'Okladka Reels 9:16', 'Post Facebook 1:1', 'Post X 16:9'], lines: (topic: string, preset: string, tone: string) => [ `Stworz grafike promocyjna dla tematu: ${topic}.`, `Format: ${preset}.`, `Styl: ${tone}.`, 'Wymagania: wysoki kontrast, czytelny duzy tytul, twarz lub kluczowy obiekt w centrum, miejsce na logo w prawym dolnym rogu.', 'Kolory: neon cyan + ciemne tlo + akcent pomaranczowy.', 'Dodaj efekt ruchu i energii, ale bez przesadnego szumu.' ] },
    en: { title: 'AI Studio', subtitle: 'Prompt creation for thumbnails, graphics, and short-form video assets.', topicLabel: 'Topic', preset: 'Preset', tone: 'Visual tone', generate: 'Generate', image: 'Image prompt', video: 'Video prompt', result: 'Result', resultText: 'Ready prompt for Midjourney, DALL-E, or another visual tool.', defaultTopic: 'Path of Exile 2: best starter build', defaultTone: 'dynamic, gaming', placeholder: 'E.g. Top 5 AI tools for creators', tonePlaceholder: 'E.g. premium, modern', emptyPrompt: 'Enter a topic to generate a prompt.', presets: ['YouTube thumbnail 16:9', 'Reels cover 9:16', 'Facebook post 1:1', 'X post 16:9'], lines: (topic: string, preset: string, tone: string) => [ `Create a promotional graphic for the topic: ${topic}.`, `Format: ${preset}.`, `Style: ${tone}.`, 'Requirements: high contrast, large readable headline, face or key object centered, logo space in the bottom-right corner.', 'Colors: neon cyan + dark background + orange accent.', 'Add motion and energy, but avoid excessive noise.' ] },
    es: { title: 'AI Studio', subtitle: 'Creacion de prompts para miniaturas, graficos y piezas cortas de video.', topicLabel: 'Tema', preset: 'Preset', tone: 'Tono visual', generate: 'Generar', image: 'Prompt de imagen', video: 'Prompt de video', result: 'Resultado', resultText: 'Prompt listo para Midjourney, DALL-E u otra herramienta visual.', defaultTopic: 'Path of Exile 2: mejor build inicial', defaultTone: 'dinamico, gaming', placeholder: 'Ej. Top 5 herramientas AI para creadores', tonePlaceholder: 'Ej. premium, moderno', emptyPrompt: 'Introduce un tema para generar un prompt.', presets: ['Miniatura YouTube 16:9', 'Portada Reels 9:16', 'Post Facebook 1:1', 'Post X 16:9'], lines: (topic: string, preset: string, tone: string) => [ `Crea un grafico promocional para el tema: ${topic}.`, `Formato: ${preset}.`, `Estilo: ${tone}.`, 'Requisitos: alto contraste, titulo grande y legible, rostro u objeto clave en el centro, espacio para logo en la esquina inferior derecha.', 'Colores: cyan neon + fondo oscuro + acento naranja.', 'Agrega sensacion de movimiento y energia, pero sin ruido excesivo.' ] },
  });
  const [topic, setTopic] = useState(copy.defaultTopic);
  const [preset, setPreset] = useState(copy.presets[0]);
  const [tone, setTone] = useState(copy.defaultTone);

  const prompt = useMemo(() => {
    if (!topic.trim()) return copy.emptyPrompt;
    return copy.lines(topic, preset, tone).join(' ');
  }, [copy, preset, tone, topic]);

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>{copy.title}</h1>
        <p>{copy.subtitle}</p>
      </div>

      <div className="grid-2" style={{ gap: 20 }}>
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
    </div>
  );
}
