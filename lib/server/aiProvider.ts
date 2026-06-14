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
  performance: {
    viralPotential: number;
    conversionPotential: number;
    engagementPotential: number;
  };
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
  campaignCalendar: Array<{
    day: number;
    title: string;
    publishWindow: string;
    tiktok: string;
    shorts: string;
    reels: string;
    description: string;
    hashtags: string[];
    cta: string;
  }>;
};

type PromptQualityIssue = {
  key: string;
  message: string;
  penalty: number;
  autoFix: string;
};

export type PromptQualityReport = {
  score: number;
  issues: PromptQualityIssue[];
  appliedAutoFixes: string[];
};

export type PromptPreparationResult = {
  fixedInput: {
    topic: string;
    niche: string;
    platform: string;
    campaignGoal: string;
    styleMode: string;
    styleProfile: string;
  };
  quality: PromptQualityReport;
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

function clampScore(value: unknown, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.min(100, Math.round(parsed)));
}

function ensureHashtags(tags: string[]) {
  if (tags.length >= 8) return tags.slice(0, 14);
  return [
    ...tags,
    '#growth',
    '#contentstrategy',
    '#socialmedia',
    '#creator',
    '#marketing',
    '#tiktoktips',
    '#shortsvideo',
    '#reels',
  ].filter((tag, index, all) => all.indexOf(tag) === index).slice(0, 14);
}

function buildCampaignCalendar(input: {
  days: number;
  language: AiLanguage;
  topic: string;
  niche: string;
  baseTrend: string;
  baseIdeas: string[];
  baseHashtags: string[];
  baseCta: string;
}) {
  const days = Math.max(1, Math.min(90, input.days));
  const ideas = input.baseIdeas.length ? input.baseIdeas : [input.baseTrend || input.topic || 'Content pillar'];
  const hashtags = ensureHashtags(input.baseHashtags);

  return Array.from({ length: days }, (_, idx) => {
    const day = idx + 1;
    const seedIdea = ideas[idx % ideas.length] || input.topic;
    const window = day % 3 === 0 ? '12:00-14:00' : day % 2 === 0 ? '18:00-20:00' : '08:00-10:00';

    const title = input.language === 'pl'
      ? `Dzien ${day}: ${seedIdea}`
      : input.language === 'es'
      ? `Dia ${day}: ${seedIdea}`
      : `Day ${day}: ${seedIdea}`;

    const cta = input.language === 'pl'
      ? `${input.baseCta} (Dzien ${day})`
      : input.language === 'es'
      ? `${input.baseCta} (Dia ${day})`
      : `${input.baseCta} (Day ${day})`;

    return {
      day,
      title,
      publishWindow: window,
      tiktok: `${seedIdea} | Hook 1-2s + pattern break + szybkie cięcia`,
      shorts: `${seedIdea} | Proof-first structure + retention loop`,
      reels: `${seedIdea} | Storytelling intro + emotional pivot + CTA`,
      description: `${input.niche}: ${seedIdea}`,
      hashtags,
      cta,
    };
  });
}

function normalizePack(raw: unknown, language: AiLanguage, requestedDays = 30): GrowthPack {
  const source = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;
  const content = (typeof source.content === 'object' && source.content !== null ? source.content : {}) as Record<string, unknown>;
  const performance = (typeof source.performance === 'object' && source.performance !== null ? source.performance : {}) as Record<string, unknown>;

  const defaultVerdict = language === 'pl' ? 'GOTOWE DO PUBLIKACJI' : language === 'es' ? 'LISTO PARA PUBLICAR' : 'READY TO PUBLISH';
  const defaultBestTime = language === 'pl' ? '18:00-20:00' : '6:00 PM-8:00 PM';
  const hashtags = ensureHashtags(asStringArray(source.hashtags, []));
  const nextIdeas = asStringArray(source.nextIdeas, []);
  const coach = asStringArray(source.coach, []);
  const bestCta = coach[0] || (language === 'pl' ? 'Dodaj CTA: Napisz PLAN i skomentuj.' : language === 'es' ? 'Agrega CTA: comenta PLAN.' : 'Add CTA: comment PLAN.');

  return {
    verdict: String(source.verdict || defaultVerdict),
    score: Math.max(0, Math.min(100, Number(source.score) || 75)),
    bestTime: String(source.bestTime || defaultBestTime),
    trend: String(source.trend || ''),
    performance: {
      viralPotential: clampScore(performance.viralPotential, clampScore(source.score, 76)),
      conversionPotential: clampScore(performance.conversionPotential, 72),
      engagementPotential: clampScore(performance.engagementPotential, 78),
    },
    content: {
      tiktok: String(content.tiktok || ''),
      shorts: String(content.shorts || ''),
      reels: String(content.reels || ''),
      facebook: String(content.facebook || ''),
      x: String(content.x || ''),
    },
    hashtags,
    nextIdeas,
    coach,
    campaignCalendar: buildCampaignCalendar({
      days: requestedDays,
      language,
      topic: String(source.trend || source.verdict || 'Campaign'),
      niche: String(source.niche || 'creator'),
      baseTrend: String(source.trend || ''),
      baseIdeas: nextIdeas,
      baseHashtags: hashtags,
      baseCta: bestCta,
    }),
  };
}

function normalizeInline(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

export function rankAndAutoFixPromptInput(input: {
  topic: string;
  niche: string;
  platform: string;
  campaignGoal?: string;
  styleMode?: string;
  styleProfile?: string;
}): PromptPreparationResult {
  const issues: PromptQualityIssue[] = [];
  const fixes: string[] = [];

  let fixedTopic = normalizeInline(input.topic || '');
  let fixedNiche = normalizeInline(input.niche || '');
  let fixedPlatform = normalizeInline(input.platform || '');
  let fixedGoal = normalizeInline(input.campaignGoal || 'awareness').toLowerCase();
  let fixedStyleMode = normalizeInline(input.styleMode || 'auto').toLowerCase();
  let fixedStyleProfile = normalizeInline(input.styleProfile || '');

  if (!fixedTopic) {
    issues.push({
      key: 'topic.empty',
      message: 'Topic is empty or missing.',
      penalty: 50,
      autoFix: 'Inserted fallback topic skeleton with audience, pain, and CTA context.',
    });
    fixedTopic = 'Creator growth campaign: define target audience, core pain, differentiator, proof point, and a direct CTA.';
    fixes.push('Filled missing topic with a campaign-ready fallback brief.');
  } else if (fixedTopic.length < 18) {
    issues.push({
      key: 'topic.too_short',
      message: 'Topic is too short for high-quality output.',
      penalty: 20,
      autoFix: 'Expanded topic with execution constraints and audience context.',
    });
    fixedTopic = `${fixedTopic}. Include audience pain, unique promise, and measurable CTA.`;
    fixes.push('Expanded short topic with strategic execution constraints.');
  }

  if (!fixedNiche) {
    issues.push({
      key: 'niche.empty',
      message: 'Niche is missing.',
      penalty: 8,
      autoFix: 'Set niche to creator economy by default.',
    });
    fixedNiche = 'creator economy';
    fixes.push('Set fallback niche to creator economy.');
  }

  if (!fixedPlatform) {
    issues.push({
      key: 'platform.empty',
      message: 'Requested platform list is empty.',
      penalty: 10,
      autoFix: 'Set default short-form platform set.',
    });
    fixedPlatform = 'tiktok,youtube,instagram';
    fixes.push('Applied fallback platform set: tiktok,youtube,instagram.');
  }

  const validGoals = new Set(['awareness', 'leads', 'sales', 'authority', 'community']);
  if (!validGoals.has(fixedGoal)) {
    issues.push({
      key: 'goal.invalid',
      message: 'Campaign goal is invalid.',
      penalty: 6,
      autoFix: 'Replaced invalid campaign goal with awareness.',
    });
    fixedGoal = 'awareness';
    fixes.push('Normalized invalid campaign goal to awareness.');
  }

  if (fixedStyleMode !== 'auto' && fixedStyleMode !== 'manual') {
    issues.push({
      key: 'style_mode.invalid',
      message: 'Style mode is invalid.',
      penalty: 4,
      autoFix: 'Replaced invalid style mode with auto.',
    });
    fixedStyleMode = 'auto';
    fixes.push('Normalized invalid style mode to auto.');
  }

  if (!fixedStyleProfile) {
    issues.push({
      key: 'style_profile.empty',
      message: 'Style profile is empty.',
      penalty: 8,
      autoFix: 'Applied default premium performance style profile.',
    });
    fixedStyleProfile = 'high-performance premium social, crisp hook-first copy, platform-native rhythm';
    fixes.push('Applied fallback style profile for premium short-form output.');
  }

  const score = Math.max(0, 100 - issues.reduce((sum, issue) => sum + issue.penalty, 0));
  return {
    fixedInput: {
      topic: fixedTopic,
      niche: fixedNiche,
      platform: fixedPlatform,
      campaignGoal: fixedGoal,
      styleMode: fixedStyleMode,
      styleProfile: fixedStyleProfile,
    },
    quality: {
      score,
      issues,
      appliedAutoFixes: fixes,
    },
  };
}

function buildPrompt(input: {
  topic: string;
  niche: string;
  platform: string;
  language: AiLanguage;
  campaignLengthDays?: number;
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
      performance: {
        viralPotential: 0,
        conversionPotential: 0,
        engagementPotential: 0,
      },
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
    `Campaign length in days: ${Math.max(1, Math.min(90, Number(input.campaignLengthDays) || 30))}`,
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
  campaignLengthDays?: number;
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
      return normalizePack(JSON.parse(extractJson(raw)), input.language, input.campaignLengthDays || 30);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'OpenAI request failed');
    }
  }

  if (anthropicApiKey) {
    try {
      const raw = await callAnthropic(anthropicApiKey, prompt);
      return normalizePack(JSON.parse(extractJson(raw)), input.language, input.campaignLengthDays || 30);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Anthropic request failed');
    }
  }

  if (!openaiApiKey && !anthropicApiKey) {
    throw new Error('Generator AI nie jest skonfigurowany. Administrator musi dodac OPENAI_API_KEY lub ANTHROPIC_API_KEY.');
  }

  throw new Error(errors.join(' | ') || 'Nie udalo sie wygenerowac tresci AI.');
}