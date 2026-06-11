import { AntiLossSettings, PlanKey } from '@/lib/settings';

export type TopUpPackId = 'boost_25' | 'boost_75' | 'boost_200';

export const TOP_UP_PACKS: Record<TopUpPackId, {
  id: TopUpPackId;
  label: string;
  priceUsd: number;
  generations: number;
  bonusLabel?: string;
  description?: string;
}> = {
  boost_25: {
    id: 'boost_25',
    label: 'Starter Boost',
    priceUsd: 9,
    generations: 25,
    description: 'Idealne dla nowych twórców • $0.36 za generację • 25 generacji na content i produkcję',
  },
  boost_75: {
    id: 'boost_75',
    label: 'Creator Boost',
    priceUsd: 19,
    generations: 75,
    bonusLabel: 'Najczesciej wybierany',
    description: 'Bestseller • $0.25 za generację • 75 generacji w tydzień • Oszczędzasz $6 vs Starter',
  },
  boost_200: {
    id: 'boost_200',
    label: 'Scale Boost',
    priceUsd: 39,
    generations: 150,
    bonusLabel: 'Najlepsza cena / generacje',
    description: 'Dla profesjonalistów • $0.26 za generację • 150 generacji/miesiąc • Oszczędzasz $15 vs Starter',
  },
};

export const PLANS: Record<PlanKey, {
  name: string;
  priceMonthly: number;
  dailyGenerations: number;
  maxRequestCostUsd: number;
  features: string[];
  fullDescription?: string;
}> = {
  free: {
    name: 'Free',
    priceMonthly: 0,
    dailyGenerations: Number(process.env.FREE_DAILY_GENERATIONS || 5),
    maxRequestCostUsd: 0.03,
    features: ['Demo Content Factory', '5 generacji dziennie', 'podstawowy Growth Coach'],
    fullDescription: 'Darmowy start • Testuj wszystkie funkcje • Bez karty kredytowej • Wsparcie community'
  },
  pro: {
    name: 'Pro',
    priceMonthly: 24,
    dailyGenerations: Number(process.env.PRO_DAILY_GENERATIONS || 60),
    maxRequestCostUsd: 0.08,
    features: ['Content Factory', 'Trend Radar', 'AI Konkurencja', 'Smart Inbox', 'dokupienia jednorazowe'],
    fullDescription: 'Dla rosnących twórców • 60 generacji dziennie • AI Trend Radar (daily insights) • Smart Inbox • oszczędź czas na publikacji'
  },
  premium_plus: {
    name: 'Premium Plus',
    priceMonthly: 69,
    dailyGenerations: Number(process.env.PREMIUM_PLUS_DAILY_GENERATIONS || 180),
    maxRequestCostUsd: Number(process.env.MAX_REQUEST_COST_USD || 0.12),
    features: ['One Click Publish', 'AI Content Brain', 'Revenue AI', 'wieksze limity', 'najtansze dokupienia'],
    fullDescription: 'Pro-level ecosystem • 180 generacji dziennie • One Click Publish (auto TikTok→YouTube→Instagram) • AI Content Brain (intelligentna analiza trendu) • Revenue AI (monetyzacja) • Priority support'
  },
  expert: {
    name: 'Expert',
    priceMonthly: 119,
    dailyGenerations: Number(process.env.EXPERT_DAILY_GENERATIONS || 360),
    maxRequestCostUsd: Number(process.env.MAX_REQUEST_COST_USD || 0.12),
    features: ['Everything in Premium Plus', 'priority queue', 'workspace growth support', 'highest limits'],
    fullDescription: 'Best for teams and power creators • 360 generacji dziennie • priorytetowe przetwarzanie • pełny stack automatyzacji i publikacji'
  }
};

export function plansFromSettings(antiLoss: AntiLossSettings): Record<PlanKey, {
  name: string;
  priceMonthly: number;
  dailyGenerations: number;
  maxRequestCostUsd: number;
  features: string[];
  fullDescription?: string;
}> {
  return {
    free: {
      ...PLANS.free,
      dailyGenerations: antiLoss.freeDailyGenerations,
      maxRequestCostUsd: Math.min(PLANS.free.maxRequestCostUsd, antiLoss.maxRequestCostUsd),
    },
    pro: {
      ...PLANS.pro,
      dailyGenerations: antiLoss.proDailyGenerations,
      maxRequestCostUsd: Math.min(PLANS.pro.maxRequestCostUsd, antiLoss.maxRequestCostUsd),
    },
    premium_plus: {
      ...PLANS.premium_plus,
      dailyGenerations: antiLoss.premiumPlusDailyGenerations,
      maxRequestCostUsd: antiLoss.maxRequestCostUsd,
    },
    expert: {
      ...PLANS.expert,
      dailyGenerations: antiLoss.premiumPlusDailyGenerations * 2,
      maxRequestCostUsd: antiLoss.maxRequestCostUsd,
    },
  };
}

const MODEL_PRICE_PER_1K_INPUT = 0.00015;
const MODEL_PRICE_PER_1K_OUTPUT = 0.0006;

export function estimateAiCostUsd(inputChars: number, outputChars = 3500) {
  const inputTokens = Math.ceil(inputChars / 4);
  const outputTokens = Math.ceil(outputChars / 4);
  return Number(((inputTokens / 1000) * MODEL_PRICE_PER_1K_INPUT + (outputTokens / 1000) * MODEL_PRICE_PER_1K_OUTPUT).toFixed(4));
}

export function budgetGuard(plan: PlanKey, inputChars: number, antiLoss?: AntiLossSettings) {
  const catalog = antiLoss ? plansFromSettings(antiLoss) : PLANS;
  const selected = catalog[plan] || catalog.free;
  const estimatedCost = estimateAiCostUsd(inputChars);
  const allowed = estimatedCost <= selected.maxRequestCostUsd;
  return {
    allowed,
    estimatedCost,
    maxRequestCostUsd: selected.maxRequestCostUsd,
    dailyGenerations: selected.dailyGenerations,
    message: allowed
      ? 'OK — request mieści się w limicie kosztu.'
      : 'Zablokowano — request może być za drogi. Skróć prompt albo użyj wyższego planu.'
  };
}
