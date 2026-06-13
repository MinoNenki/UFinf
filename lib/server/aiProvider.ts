import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

type AiLanguage = 'pl' | 'en' | 'es';

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

function buildPrompt(input: { topic: string; niche: string; platform: string; language: AiLanguage }) {
  const languageLabel = input.language === 'pl' ? 'Polish' : input.language === 'es' ? 'Spanish' : 'English';

  return [
    'You are a senior social media strategist for creators.',
    `Respond only with valid JSON in ${languageLabel}.`,
    'Generate a realistic multi-platform content pack based on the topic, niche and target platforms.',
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
    'Rules:',
    '- be concrete and production-ready',
    '- no invented performance numbers or claims of having analyzed unavailable data',
    '- coach items must be actionable and realistic',
    '- include 6-10 hashtags',
    '- include 4-6 next ideas',
    '- include 4-6 coach actions',
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