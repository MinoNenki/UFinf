import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { AntiLossSettings, PlanKey } from '@/lib/settings';
import { TOP_UP_PACKS, TopUpPackId } from '@/lib/budget';

type TopUpPurchase = {
  id: string;
  packId: TopUpPackId;
  generations: number;
  amountUsd: number;
  purchasedAt: string;
};

type UsageState = {
  dayKey: string;
  globalSpentUsd: number;
  counts: Record<PlanKey, number>;
  topUpGenerationsRemaining: number;
  topUpPurchases: TopUpPurchase[];
  fulfilledStripeSessions: string[];
  subscriptionEntitlements: Record<string, SubscriptionEntitlement>;
};

type SubscriptionEntitlement = {
  email: string;
  planKey: PlanKey;
  status: 'active' | 'past_due' | 'canceled' | 'incomplete' | 'trialing' | 'unpaid';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  updatedAt: string;
};

const USAGE_FILE = path.join(process.cwd(), '.runtime', 'usage-state.json');

let memoryUsageState: UsageState | null = null;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function defaultUsage(): UsageState {
  return {
    dayKey: todayKey(),
    globalSpentUsd: 0,
    counts: {
      free: 0,
      pro: 0,
      premium_plus: 0,
      expert: 0,
    },
    topUpGenerationsRemaining: 0,
    topUpPurchases: [],
    fulfilledStripeSessions: [],
    subscriptionEntitlements: {},
  };
}

function planDailyLimit(plan: PlanKey, antiLoss: AntiLossSettings) {
  if (plan === 'free') return antiLoss.freeDailyGenerations;
  if (plan === 'pro') return antiLoss.proDailyGenerations;
  if (plan === 'expert') return antiLoss.premiumPlusDailyGenerations * 2;
  return antiLoss.premiumPlusDailyGenerations;
}

async function readUsage(): Promise<UsageState> {
  try {
    const raw = await readFile(USAGE_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<UsageState>;
    const base = defaultUsage();
    const merged: UsageState = {
      ...base,
      ...parsed,
      counts: {
        ...base.counts,
        ...(parsed.counts || {}),
      },
      topUpPurchases: Array.isArray(parsed.topUpPurchases) ? parsed.topUpPurchases : [],
      topUpGenerationsRemaining: Number.isFinite(Number(parsed.topUpGenerationsRemaining))
        ? Number(parsed.topUpGenerationsRemaining)
        : 0,
      fulfilledStripeSessions: Array.isArray(parsed.fulfilledStripeSessions) ? parsed.fulfilledStripeSessions : [],
      subscriptionEntitlements: typeof parsed.subscriptionEntitlements === 'object' && parsed.subscriptionEntitlements !== null
        ? parsed.subscriptionEntitlements as UsageState['subscriptionEntitlements']
        : {},
    };

    if (!merged || merged.dayKey !== todayKey()) {
      return {
        ...base,
        topUpGenerationsRemaining: merged.topUpGenerationsRemaining,
        topUpPurchases: merged.topUpPurchases,
        fulfilledStripeSessions: merged.fulfilledStripeSessions,
        subscriptionEntitlements: merged.subscriptionEntitlements,
      };
    }
    return merged;
  } catch {
    if (memoryUsageState) {
      return memoryUsageState.dayKey === todayKey()
        ? memoryUsageState
        : {
            ...defaultUsage(),
            topUpGenerationsRemaining: memoryUsageState.topUpGenerationsRemaining,
            topUpPurchases: memoryUsageState.topUpPurchases,
            fulfilledStripeSessions: memoryUsageState.fulfilledStripeSessions,
            subscriptionEntitlements: memoryUsageState.subscriptionEntitlements,
          };
    }
    return defaultUsage();
  }
}

async function writeUsage(state: UsageState) {
  memoryUsageState = state;
  try {
    await mkdir(path.dirname(USAGE_FILE), { recursive: true });
    await writeFile(USAGE_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch {
    // Produkcyjne runtime'y bez zapisu do FS nie mogą blokować requestów generowania.
  }
}

export async function reserveUsage(plan: PlanKey, estimatedCostUsd: number, antiLoss: AntiLossSettings) {
  const state = await readUsage();
  const nextCount = state.counts[plan] + 1;
  const nextGlobalCost = Number((state.globalSpentUsd + estimatedCostUsd).toFixed(4));
  const perPlanLimit = planDailyLimit(plan, antiLoss);

  if (nextGlobalCost > antiLoss.dailyGlobalAiBudgetUsd) {
    return {
      allowed: false,
      message: 'Przekroczono globalny dzienny budzet AI.',
      usage: state,
    };
  }

  // Najpierw probujemy wykorzystac limit planu. Po limicie schodzimy z jednorazowych dokupien.
  const useTopUp = nextCount > perPlanLimit;
  if (useTopUp && state.topUpGenerationsRemaining <= 0) {
    return {
      allowed: false,
      message: 'Przekroczono dzienny limit planu i brak dokupionych generacji jednorazowych.',
      usage: state,
    };
  }

  const nextState: UsageState = {
    ...state,
    globalSpentUsd: nextGlobalCost,
    counts: {
      ...state.counts,
      [plan]: useTopUp ? state.counts[plan] : nextCount,
    },
    topUpGenerationsRemaining: useTopUp ? state.topUpGenerationsRemaining - 1 : state.topUpGenerationsRemaining,
  };

  await writeUsage(nextState);

  return {
    allowed: true,
    consumedTopUp: useTopUp,
    message: useTopUp ? 'Wykorzystano 1 generacje z pakietu jednorazowego.' : 'Wykorzystano limit planu dziennego.',
    usage: nextState,
  };
}

export async function purchaseTopUp(packId: TopUpPackId) {
  const pack = TOP_UP_PACKS[packId];
  if (!pack) {
    return {
      ok: false,
      message: 'Nieznany pakiet dokupienia.',
      usage: await readUsage(),
    };
  }

  const state = await readUsage();
  const purchase: TopUpPurchase = {
    id: `${pack.id}_${Date.now()}`,
    packId: pack.id,
    generations: pack.generations,
    amountUsd: pack.priceUsd,
    purchasedAt: new Date().toISOString(),
  };

  const nextState: UsageState = {
    ...state,
    topUpGenerationsRemaining: state.topUpGenerationsRemaining + pack.generations,
    topUpPurchases: [purchase, ...state.topUpPurchases].slice(0, 50),
  };

  await writeUsage(nextState);

  return {
    ok: true,
    message: `Dodano ${pack.generations} generacji jednorazowych.`,
    purchase,
    usage: nextState,
  };
}

export async function usageSnapshot() {
  return readUsage();
}

export async function fulfillTopUpCheckout(checkoutSessionId: string, packId: TopUpPackId, amountUsd?: number) {
  const pack = TOP_UP_PACKS[packId];
  if (!pack) {
    return {
      ok: false,
      message: 'Nieznany pakiet dokupienia.',
      usage: await readUsage(),
      alreadyFulfilled: false,
    };
  }

  const state = await readUsage();
  if (state.fulfilledStripeSessions.includes(checkoutSessionId)) {
    return {
      ok: true,
      message: 'Checkout byl juz wczesniej rozliczony.',
      usage: state,
      alreadyFulfilled: true,
    };
  }

  const purchase: TopUpPurchase = {
    id: `stripe_${checkoutSessionId}`,
    packId: pack.id,
    generations: pack.generations,
    amountUsd: Number.isFinite(Number(amountUsd)) ? Number(amountUsd) : pack.priceUsd,
    purchasedAt: new Date().toISOString(),
  };

  const nextState: UsageState = {
    ...state,
    topUpGenerationsRemaining: state.topUpGenerationsRemaining + pack.generations,
    topUpPurchases: [purchase, ...state.topUpPurchases].slice(0, 100),
    fulfilledStripeSessions: [checkoutSessionId, ...state.fulfilledStripeSessions].slice(0, 500),
  };

  await writeUsage(nextState);

  return {
    ok: true,
    message: `Rozliczono checkout i dodano ${pack.generations} generacji.`,
    usage: nextState,
    purchase,
    alreadyFulfilled: false,
  };
}

export async function upsertSubscriptionEntitlement(input: {
  email: string;
  planKey: PlanKey;
  status: SubscriptionEntitlement['status'];
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}) {
  const email = input.email.trim().toLowerCase();
  if (!email) {
    return {
      ok: false,
      message: 'Brak emaila do przypisania subskrypcji.',
      usage: await readUsage(),
    };
  }

  const state = await readUsage();
  const nextState: UsageState = {
    ...state,
    subscriptionEntitlements: {
      ...state.subscriptionEntitlements,
      [email]: {
        email,
        planKey: input.planKey,
        status: input.status,
        stripeCustomerId: input.stripeCustomerId || state.subscriptionEntitlements[email]?.stripeCustomerId,
        stripeSubscriptionId: input.stripeSubscriptionId || state.subscriptionEntitlements[email]?.stripeSubscriptionId,
        updatedAt: new Date().toISOString(),
      },
    },
  };

  await writeUsage(nextState);

  return {
    ok: true,
    message: 'Zaktualizowano status subskrypcji.',
    usage: nextState,
    entitlement: nextState.subscriptionEntitlements[email],
  };
}
