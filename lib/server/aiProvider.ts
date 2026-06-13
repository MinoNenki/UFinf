import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

type AiLanguage = 'pl' | 'en' | 'es';

type StrategyContext = {
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

type GrowthPack = {
  verdict: string;
  score: number;
  bestTime: string;
  trend: string;
  content: {
    tiktok: string;
    shorts: string;
    reels: string;
    facebook: string;
    x: string;
  };
  hashtags: string[];
  nextIdeas: string[];
  coach: string[];
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

function resolveApiKey(preferred: string | undefined, envName: 'OPENAI_API_KEY' | 'ANTHROPIC_API_KEY') {
  if (preferred?.trim()) return preferred.trim();
  if (process.env[envName]?.trim()) return String(process.env[envName]).trim();
  const envMap = readEnvLocalMap();
  return envMap[envName] || '';
}

function extractJson(text: string) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  return trimmed;
}

function asStringArray(value: unknown, fallback: string[]) {
  return Array.isArray(value)
    ? value.map((item) => String(item || '').trim()).filter(Boolean)
    : fallback;
}

function normalizePack(raw: unknown, language: AiLanguage): GrowthPack {
  const source = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;
  const content = (typeof source.content === 'object' && source.content !== null ? source.content : {}) as Record<string, unknown>;

  const defaultVerdict = language === 'pl' ? 'GOTOWE DO PUBLIKACJI' : language === 'es' ? 'LISTO PARA PUBLICAR' : 'READY TO PUBLISH';
  const defaultBestTime = language === 'pl' ? '18:00-20:00' : '6:00 PM-8:00 PM';

  return {
    verdict: String(source.verdict || defaultVerdict),
    score: Math.max(0, Math.min(100, Number(source.score) || 75)),
    bestTime: String(source.bestTime || defaultBestTime),
    trend: String(source.trend || ''),
    content: {
      tiktok: String(content.tiktok || ''),
      shorts: String(content.shorts || ''),
      reels: String(content.reels || ''),
      facebook: String(content.facebook || ''),
      x: String(content.x || ''),
    },
    hashtags: asStringArray(source.hashtags, []),
    nextIdeas: asStringArray(source.nextIdeas, []),
    coach: asStringArray(source.coach, []),
  };
}

function buildPrompt(input: {
  topic: string;
  niche: string;
  platform: string;
  language: AiLanguage;
  campaignGoal?: string;
  styleMode?: string;
  styleProfile?: string;
  strategy?: StrategyContext;
}) {
  const languageLabel = input.language === 'pl' ? 'Polish' : input.language === 'es' ? 'Spanish' : 'English';

  return [
    'You are a principal global growth strategist for creator brands.',
    `Respond only with valid JSON in ${languageLabel}.`,
    'Generate a realistic, premium multi-platform content pack based on the topic, niche, and requested platforms.',
    'Do not add markdown, commentary or code fences.',
    'Required JSON schema:',
    JSON.stringify({
      verdict: 'string',
      score: 0,
      bestTime: 'string',
      trend: 'string',
      content: {
        tiktok: 'string',
        shorts: 'string',
        reels: 'string',
        facebook: 'string',
        x: 'string',
      },
      hashtags: ['string'],
      nextIdeas: ['string'],
      coach: ['string'],
    }),
    `Topic: ${input.topic}`,
    `Niche: ${input.niche}`,
    `Requested platforms: ${input.platform}`,
    `Campaign goal: ${input.campaignGoal || 'awareness'}`,
    `Style mode: ${input.styleMode || 'auto'}`,
    `Style profile: ${input.styleProfile || 'high-performance premium social'}`,
    input.strategy ? `Strategy pack: ${JSON.stringify(input.strategy)}` : '',
    'Rules:',
    '- be concrete and production-ready',
    '- output must be useful for immediate execution by a content team',
    '- hooks should be specific, emotionally sharp, and platform-native',
    '- avoid cliches, bland motivational tone, and generic "value-packed" filler',
    '- each platform copy must differ in structure and rhythm (no clone text)',
    '- adapt style to platform mechanics: TikTok fast pattern interrupt, Shorts retention rhythm, Reels emotional storytelling, Facebook clarity, X punchline precision',
    '- trend field should describe a usable creative angle, not buzzword soup',
    '- no invented performance numbers or claims of having analyzed unavailable data',
    '- coach items must be actionable and realistic',
    '- include 8-14 hashtags with mix: broad + niche + intent-based',
    '- include 4-6 next ideas',
    '- include 4-6 coach actions',
    '- respect the campaign goal and strategy pack with strict alignment',
    '- short-form copy must follow hookFormula + sceneFlow + ctaFormula logic from strategy pack when provided',
  ].join('\n');
}

async function callOpenAi(apiKey: string, prompt: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You create structured creator-growth content packs and answer strictly in JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI ${response.status}: ${await response.text()}`);
  }

  const payload = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return payload.choices?.[0]?.message?.content || '';
}

async function callAnthropic(apiKey: string, prompt: string) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-latest',
      max_tokens: 1600,
      temperature: 0.7,
      system: 'You create structured creator-growth content packs and answer strictly in JSON.',
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic ${response.status}: ${await response.text()}`);
  }

  const payload = await response.json() as {
    content?: Array<{ type?: string; text?: string }>;
  };
  return payload.content?.find((item) => item.type === 'text')?.text || '';
}

export async function generateGrowthPackFromProvider(input: {
  topic: string;
  niche: string;
  platform: string;
  language: AiLanguage;
  openaiApiKey?: string;
  anthropicApiKey?: string;
  campaignGoal?: string;
  styleMode?: string;
  styleProfile?: string;
  strategy?: StrategyContext;
}) {
  const openaiApiKey = resolveApiKey(input.openaiApiKey, 'OPENAI_API_KEY');
  const anthropicApiKey = resolveApiKey(input.anthropicApiKey, 'ANTHROPIC_API_KEY');
  const prompt = buildPrompt(input);
  const errors: string[] = [];

  if (openaiApiKey) {
    try {
      const raw = await callOpenAi(openaiApiKey, prompt);
      return normalizePack(JSON.parse(extractJson(raw)), input.language);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'OpenAI request failed');
    }
  }

  if (anthropicApiKey) {
    try {
      const raw = await callAnthropic(anthropicApiKey, prompt);
      return normalizePack(JSON.parse(extractJson(raw)), input.language);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Anthropic request failed');
    }
  }

  if (!openaiApiKey && !anthropicApiKey) {
    throw new Error('Generator AI nie jest skonfigurowany. Administrator musi dodac OPENAI_API_KEY lub ANTHROPIC_API_KEY.');
  }

  throw new Error(errors.join(' | ') || 'Nie udalo sie wygenerowac tresci AI.');
}