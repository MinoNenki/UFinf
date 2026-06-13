import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

type StudioLanguage = 'pl' | 'en' | 'es';

type StudioImagePreset = 'Miniatura YouTube 16:9' | 'Okładka Reels 9:16' | 'Post Facebook 1:1' | 'Post X 16:9' | string;

export type StudioVideoBlueprint = {
  headline: string;
  hook: string;
  scenes: Array<{
    title: string;
    visual: string;
    voiceover: string;
    caption: string;
    durationSec: number;
  }>;
  cta: string;
  soundtrack: string;
  editNotes: string[];
};

function readEnvLocalMap() {
  const candidates = [
    path.join(process.cwd(), '.env.local'),
    path.join(process.cwd(), 'ai_growth_os', '.env.local'),
  ];
  const result: Record<string, string> = {};
  for (const file of candidates) {
    if (!existsSync(file)) continue;
    const lines = readFileSync(file, 'utf8').split(/\r?\n/);
    for (const raw of lines) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const idx = line.indexOf('=');
      if (idx <= 0) continue;
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      if (!(key in result)) result[key] = value;
    }
  }
  return result;
}

function resolveApiKey(preferred?: string) {
  if (preferred?.trim()) return preferred.trim();
  if (process.env.OPENAI_API_KEY?.trim()) return String(process.env.OPENAI_API_KEY).trim();
  const envMap = readEnvLocalMap();
  return envMap.OPENAI_API_KEY || '';
}

function visualSizeForPreset(preset: StudioImagePreset) {
  if (/16:9/i.test(preset)) return '1536x1024';
  if (/9:16/i.test(preset)) return '1024x1536';
  return '1024x1024';
}

function languageLabel(language: StudioLanguage) {
  if (language === 'pl') return 'Polish';
  if (language === 'es') return 'Spanish';
  return 'English';
}

function buildImagePrompt(input: { topic: string; preset: string; tone: string; language: StudioLanguage }) {
  return [
    `Create a premium social-media key visual in ${languageLabel(input.language)}.` ,
    `Topic: ${input.topic}.`,
    `Format: ${input.preset}.`,
    `Visual tone: ${input.tone}.`,
    'The result must feel premium, bold, cinematic, and optimized for creator-economy marketing.',
    'Prioritize strong composition, dramatic lighting, crisp focal subject, readable title area, and high visual contrast.',
    'Avoid generic stock-photo look, muddy lighting, and cheap meme aesthetics.',
  ].join(' ');
}

function buildVideoBlueprintPrompt(input: { topic: string; preset: string; tone: string; language: StudioLanguage }) {
  return [
    `Respond only with valid JSON in ${languageLabel(input.language)}.`,
    'You are a senior creative director for short-form video.',
    `Build a premium short-form video blueprint for topic: ${input.topic}.`,
    `Output format: ${input.preset}.`,
    `Creative tone: ${input.tone}.`,
    'Required schema:',
    JSON.stringify({
      headline: 'string',
      hook: 'string',
      scenes: [
        {
          title: 'string',
          visual: 'string',
          voiceover: 'string',
          caption: 'string',
          durationSec: 3,
        },
      ],
      cta: 'string',
      soundtrack: 'string',
      editNotes: ['string'],
    }),
    'Rules:',
    '- 4 to 6 scenes',
    '- every scene must be practical for vertical or social video editing',
    '- keep the hook high-intensity and creator-friendly',
    '- editNotes must be concrete and production-ready',
  ].join('\n');
}

function extractJson(text: string) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  return trimmed;
}

export async function generateStudioImageAsset(input: {
  topic: string;
  preset: string;
  tone: string;
  language: StudioLanguage;
  openaiApiKey?: string;
}) {
  const apiKey = resolveApiKey(input.openaiApiKey);
  if (!apiKey) {
    throw new Error('Studio image generation requires OPENAI_API_KEY.');
  }

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt: buildImagePrompt(input),
      size: visualSizeForPreset(input.preset),
      quality: 'high',
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI image ${response.status}: ${await response.text()}`);
  }

  const payload = await response.json() as {
    data?: Array<{ b64_json?: string; revised_prompt?: string }>;
  };

  const asset = payload.data?.[0];
  if (!asset?.b64_json) {
    throw new Error('OpenAI image generation returned no asset.');
  }

  return {
    imageDataUrl: `data:image/png;base64,${asset.b64_json}`,
    revisedPrompt: asset.revised_prompt || buildImagePrompt(input),
  };
}

export async function generateStudioVideoBlueprint(input: {
  topic: string;
  preset: string;
  tone: string;
  language: StudioLanguage;
  openaiApiKey?: string;
}) {
  const apiKey = resolveApiKey(input.openaiApiKey);
  if (!apiKey) {
    throw new Error('Studio video ideation requires OPENAI_API_KEY.');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1',
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You are a premium creative strategist for social-first video and answer strictly in JSON.',
        },
        {
          role: 'user',
          content: buildVideoBlueprintPrompt(input),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI blueprint ${response.status}: ${await response.text()}`);
  }

  const payload = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const raw = payload.choices?.[0]?.message?.content || '';
  const parsed = JSON.parse(extractJson(raw)) as Partial<StudioVideoBlueprint>;
  return {
    headline: String(parsed.headline || input.topic),
    hook: String(parsed.hook || ''),
    scenes: Array.isArray(parsed.scenes)
      ? parsed.scenes.map((scene) => ({
          title: String(scene?.title || ''),
          visual: String(scene?.visual || ''),
          voiceover: String(scene?.voiceover || ''),
          caption: String(scene?.caption || ''),
          durationSec: Math.max(1, Number(scene?.durationSec) || 3),
        }))
      : [],
    cta: String(parsed.cta || ''),
    soundtrack: String(parsed.soundtrack || ''),
    editNotes: Array.isArray(parsed.editNotes)
      ? parsed.editNotes.map((item) => String(item || '').trim()).filter(Boolean)
      : [],
  };
}
