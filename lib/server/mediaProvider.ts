import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

type StudioLanguage = 'pl' | 'en' | 'es';

type StudioImagePreset = 'Miniatura YouTube 16:9' | 'Okładka Reels 9:16' | 'Post Facebook 1:1' | 'Post X 16:9' | string;

export type StudioProviderMode = 'fast' | 'fallback' | 'quality_max';

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

type StudioBlueprintResult = {
  blueprint: StudioVideoBlueprint;
  providerUsed: string;
  providersTried: string[];
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

function resolveAnthropicApiKey(preferred?: string) {
  if (preferred?.trim()) return preferred.trim();
  if (process.env.ANTHROPIC_API_KEY?.trim()) return String(process.env.ANTHROPIC_API_KEY).trim();
  const envMap = readEnvLocalMap();
  return envMap.ANTHROPIC_API_KEY || '';
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
    `Create a premium social-media key visual in ${languageLabel(input.language)}.`,
    'You are a global creative director for top-tier creator brands.',
    `Topic and narrative intent: ${input.topic}.`,
    `Target format and safe area: ${input.preset}.`,
    `Visual tone keywords: ${input.tone}.`,
    'Art direction goals: cinematic lighting, clear subject hierarchy, precise depth, premium texture quality, and emotionally strong first impression in less than 1 second.',
    'Composition rules: one dominant focal subject, foreground-midground-background layering, intentional negative space for headline text, logo-safe zone bottom-right.',
    'Color strategy: controlled palette with one primary and one accent color, high local contrast, no color clipping, and skin tones must remain natural when present.',
    'Platform optimization: make it thumb-stopping on mobile at small size while preserving detail at full resolution.',
    'Output quality: photoreal or hyper-illustrative premium finish, no compression artifacts, no noise smearing, no over-sharpening halos.',
    'Forbidden: watermarks, UI overlays, extra text blocks, low-end stock-photo look, distorted anatomy, duplicated limbs, malformed hands, and chaotic clutter.',
  ].join(' ');
}

function buildVideoBlueprintPrompt(input: { topic: string; preset: string; tone: string; language: StudioLanguage }) {
  return [
    `Respond only with valid JSON in ${languageLabel(input.language)}.`,
    'You are a world-class creative director and performance strategist for short-form video.',
    `Build a premium short-form video blueprint for the topic: ${input.topic}.`,
    `Output format: ${input.preset}.`,
    `Creative tone and brand DNA: ${input.tone}.`,
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
    '- hook must win attention in first 0-2 seconds with specific sensory trigger',
    '- each scene must include clear visual intent, camera logic, and message progression',
    '- voiceover must be concise, high-impact, and aligned with platform-native pacing',
    '- captions must be short, bold, readable on mobile, and emotionally charged',
    '- CTA must be specific, non-generic, and aligned with campaign intent',
    '- soundtrack should specify genre, energy arc, and bpm range',
    '- editNotes must be concrete and production-ready',
    '- avoid fluff, repetition, fake metrics, and vague cinematic wording without execution details',
    '- keep language natively natural for the requested locale',
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

function normalizeBlueprint(input: Partial<StudioVideoBlueprint>, fallbackTitle: string): StudioVideoBlueprint {
  return {
    headline: String(input.headline || fallbackTitle),
    hook: String(input.hook || ''),
    scenes: Array.isArray(input.scenes)
      ? input.scenes.map((scene) => ({
          title: String(scene?.title || ''),
          visual: String(scene?.visual || ''),
          voiceover: String(scene?.voiceover || ''),
          caption: String(scene?.caption || ''),
          durationSec: Math.max(1, Number(scene?.durationSec) || 3),
        }))
      : [],
    cta: String(input.cta || ''),
    soundtrack: String(input.soundtrack || ''),
    editNotes: Array.isArray(input.editNotes)
      ? input.editNotes.map((item) => String(item || '').trim()).filter(Boolean)
      : [],
  };
}

function blueprintScore(blueprint: StudioVideoBlueprint) {
  return (
    Math.min(20, blueprint.headline.length / 4) +
    Math.min(24, blueprint.hook.length / 5) +
    blueprint.scenes.length * 10 +
    blueprint.scenes.reduce((sum, scene) => sum + Math.min(10, scene.visual.length / 12 + scene.voiceover.length / 14), 0) +
    blueprint.editNotes.length * 4 +
    Math.min(8, blueprint.cta.length / 8) +
    Math.min(6, blueprint.soundtrack.length / 10)
  );
}

function richerText(primary: string, secondary: string) {
  return secondary.trim().length > primary.trim().length ? secondary : primary;
}

function combineBlueprints(primary: StudioVideoBlueprint, secondary: StudioVideoBlueprint) {
  const base = blueprintScore(primary) >= blueprintScore(secondary) ? primary : secondary;
  const extra = base === primary ? secondary : primary;
  const sceneCount = Math.max(base.scenes.length, extra.scenes.length);
  const scenes = Array.from({ length: sceneCount }, (_, index) => {
    const left = base.scenes[index];
    const right = extra.scenes[index];
    return {
      title: richerText(String(left?.title || ''), String(right?.title || '')) || `Scene ${index + 1}`,
      visual: richerText(String(left?.visual || ''), String(right?.visual || '')),
      voiceover: richerText(String(left?.voiceover || ''), String(right?.voiceover || '')),
      caption: richerText(String(left?.caption || ''), String(right?.caption || '')),
      durationSec: Math.max(Number(left?.durationSec || 0), Number(right?.durationSec || 0), 3),
    };
  });

  return {
    headline: richerText(base.headline, extra.headline),
    hook: richerText(base.hook, extra.hook),
    scenes,
    cta: richerText(base.cta, extra.cta),
    soundtrack: richerText(base.soundtrack, extra.soundtrack),
    editNotes: Array.from(new Set([...base.editNotes, ...extra.editNotes])).slice(0, 10),
  } satisfies StudioVideoBlueprint;
}

async function generateStudioVideoBlueprintOpenAI(input: {
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
  return normalizeBlueprint(parsed, input.topic);
}

async function generateStudioVideoBlueprintAnthropic(input: {
  topic: string;
  preset: string;
  tone: string;
  language: StudioLanguage;
  anthropicApiKey?: string;
}) {
  const apiKey = resolveAnthropicApiKey(input.anthropicApiKey);
  if (!apiKey) {
    throw new Error('Studio fallback video provider requires ANTHROPIC_API_KEY.');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1400,
      temperature: 0.6,
      system: 'You are a premium creative strategist for social-first video. Reply with JSON only.',
      messages: [
        {
          role: 'user',
          content: buildVideoBlueprintPrompt(input),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic blueprint ${response.status}: ${await response.text()}`);
  }

  const payload = await response.json() as {
    content?: Array<{ type?: string; text?: string }>;
  };

  const raw = payload.content?.map((item) => item.text || '').join('\n') || '';
  const parsed = JSON.parse(extractJson(raw)) as Partial<StudioVideoBlueprint>;
  return normalizeBlueprint(parsed, input.topic);
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
    providerUsed: 'openai:gpt-image-1',
  };
}

export async function generateStudioVideoBlueprint(input: {
  topic: string;
  preset: string;
  tone: string;
  language: StudioLanguage;
  openaiApiKey?: string;
  anthropicApiKey?: string;
  providerMode?: StudioProviderMode;
}): Promise<StudioBlueprintResult> {
  const providerMode = input.providerMode || 'fallback';
  const providersTried: string[] = [];

  const runOpenAI = async () => {
    providersTried.push('openai:gpt-4.1');
    return generateStudioVideoBlueprintOpenAI(input);
  };
  const runAnthropic = async () => {
    providersTried.push('anthropic:claude-3-5-sonnet-20241022');
    return generateStudioVideoBlueprintAnthropic(input);
  };

  if (providerMode === 'quality_max') {
    const results = await Promise.allSettled([runOpenAI(), runAnthropic()]);
    const successful = results
      .map((result, index) => ({ result, index }))
      .filter((entry): entry is { result: PromiseFulfilledResult<StudioVideoBlueprint>; index: number } => entry.result.status === 'fulfilled')
      .map((entry) => ({
        provider: entry.index === 0 ? 'openai:gpt-4.1' : 'anthropic:claude-3-5-sonnet-20241022',
        blueprint: entry.result.value,
      }));

    if (!successful.length) {
      const messages = results
        .filter((entry): entry is PromiseRejectedResult => entry.status === 'rejected')
        .map((entry) => entry.reason instanceof Error ? entry.reason.message : String(entry.reason));
      throw new Error(messages.join(' | ') || 'No premium video provider succeeded.');
    }

    if (successful.length === 1) {
      return {
        blueprint: successful[0].blueprint,
        providerUsed: successful[0].provider,
        providersTried,
      };
    }

    return {
      blueprint: combineBlueprints(successful[0].blueprint, successful[1].blueprint),
      providerUsed: 'openai:gpt-4.1+anthropic:claude-3-5-sonnet-20241022',
      providersTried,
    };
  }

  try {
    const primary = await runOpenAI();
    if (providerMode === 'fallback' && blueprintScore(primary) < 55) {
      try {
        const backup = await runAnthropic();
        if (blueprintScore(backup) > blueprintScore(primary)) {
          return {
            blueprint: backup,
            providerUsed: 'anthropic:claude-3-5-sonnet-20241022',
            providersTried,
          };
        }
      } catch {
        // OpenAI result stays primary when fallback provider is unavailable.
      }
    }

    return {
      blueprint: primary,
      providerUsed: 'openai:gpt-4.1',
      providersTried,
    };
  } catch (openAiError) {
    if (providerMode === 'fast') {
      throw openAiError;
    }

    const fallback = await runAnthropic();
    return {
      blueprint: fallback,
      providerUsed: 'anthropic:claude-3-5-sonnet-20241022',
      providersTried,
    };
  }
}
