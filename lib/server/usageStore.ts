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
  email?: string;
};

type UsageState = {
  dayKey: string;
  globalSpentUsd: number;
  counts: Record<PlanKey, number>;
  topUpGenerationsRemaining: number;
  topUpGenerationsByEmail: Record<string, number>;
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

const LEGACY_USAGE_FILE = path.join(process.cwd(), '.runtime', 'usage-state.json');
const RUNTIME_DIR = process.env.VERCEL ? path.join('/tmp', 'ufinf-runtime') : path.join(process.cwd(), '.runtime');
const USAGE_FILE = path.join(RUNTIME_DIR, 'usage-state.json');

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
    topUpGenerationsByEmail: {},
    topUpPurchases: [],
    fulfilledStripeSessions: [],
    subscriptionEntitlements: {},
  };
}

function normalizeEmail(email: string | undefined | null) {
  return (email || '').trim().toLowerCase();
}

function planRank(plan: PlanKey) {
  if (plan === 'expert') return 3;
  if (plan === 'premium_plus') return 2;
  if (plan === 'pro') return 1;
  return 0;
}

function subscriptionIsActive(status: SubscriptionEntitlement['status']) {
  return status === 'active' || status === 'trialing';
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
      topUpGenerationsByEmail: typeof parsed.topUpGenerationsByEmail === 'object' && parsed.topUpGenerationsByEmail !== null
        ? parsed.topUpGenerationsByEmail as UsageState['topUpGenerationsByEmail']
        : {},
      fulfilledStripeSessions: Array.isArray(parsed.fulfilledStripeSessions) ? parsed.fulfilledStripeSessions : [],
      subscriptionEntitlements: typeof parsed.subscriptionEntitlements === 'object' && parsed.subscriptionEntitlements !== null
        ? parsed.subscriptionEntitlements as UsageState['subscriptionEntitlements']
        : {},
    };

    if (!merged || merged.dayKey !== todayKey()) {
      return {
        ...base,
        topUpGenerationsRemaining: merged.topUpGenerationsRemaining,
        topUpGenerationsByEmail: merged.topUpGenerationsByEmail,
        topUpPurchases: merged.topUpPurchases,
        fulfilledStripeSessions: merged.fulfilledStripeSessions,
        subscriptionEntitlements: merged.subscriptionEntitlements,
      };
    }
    return merged;
  } catch {
    // On first boot in serverless, seed from legacy bundled runtime file when writable file does not exist yet.
    try {
      const legacyRaw = await readFile(LEGACY_USAGE_FILE, 'utf8');
      const legacyParsed = JSON.parse(legacyRaw) as Partial<UsageState>;
      const base = defaultUsage();
      const seeded: UsageState = {
        ...base,
        ...legacyParsed,
        counts: {
          ...base.counts,
          ...(legacyParsed.counts || {}),
        },
        topUpPurchases: Array.isArray(legacyParsed.topUpPurchases) ? legacyParsed.topUpPurchases : [],
        topUpGenerationsRemaining: Number.isFinite(Number(legacyParsed.topUpGenerationsRemaining))
          ? Number(legacyParsed.topUpGenerationsRemaining)
          : 0,
        topUpGenerationsByEmail: typeof legacyParsed.topUpGenerationsByEmail === 'object' && legacyParsed.topUpGenerationsByEmail !== null
          ? legacyParsed.topUpGenerationsByEmail as UsageState['topUpGenerationsByEmail']
          : {},
        fulfilledStripeSessions: Array.isArray(legacyParsed.fulfilledStripeSessions) ? legacyParsed.fulfilledStripeSessions : [],
        subscriptionEntitlements: typeof legacyParsed.subscriptionEntitlements === 'object' && legacyParsed.subscriptionEntitlements !== null
          ? legacyParsed.subscriptionEntitlements as UsageState['subscriptionEntitlements']
          : {},
      };
      return seeded.dayKey === todayKey()
        ? seeded
        : {
            ...base,
            topUpGenerationsRemaining: seeded.topUpGenerationsRemaining,
            topUpGenerationsByEmail: seeded.topUpGenerationsByEmail,
            topUpPurchases: seeded.topUpPurchases,
            fulfilledStripeSessions: seeded.fulfilledStripeSessions,
            subscriptionEntitlements: seeded.subscriptionEntitlements,
          };
    } catch {
      // Continue to in-memory fallback below.
    }

    if (memoryUsageState) {
      return memoryUsageState.dayKey === todayKey()
        ? memoryUsageState
        : {
            ...defaultUsage(),
            topUpGenerationsRemaining: memoryUsageState.topUpGenerationsRemaining,
            topUpGenerationsByEmail: memoryUsageState.topUpGenerationsByEmail,
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

export async function resolveEffectivePlan(requestedPlan: PlanKey, customerEmail?: string) {
  const state = await readUsage();
  const email = normalizeEmail(customerEmail);
  const entitlement = email ? state.subscriptionEntitlements[email] : undefined;
  const entitledPlan = entitlement && subscriptionIsActive(entitlement.status) ? entitlement.planKey : 'free';
  const effectivePlan = planRank(requestedPlan) <= planRank(entitledPlan) ? requestedPlan : entitledPlan;

  return {
    email,
    entitledPlan,
    effectivePlan,
    downgraded: effectivePlan !== requestedPlan,
    entitlement: entitlement || null,
  };
}

export async function reserveUsage(plan: PlanKey, estimatedCostUsd: number, antiLoss: AntiLossSettings, customerEmail?: string) {
  const state = await readUsage();
  const email = normalizeEmail(customerEmail);
  const nextCount = state.counts[plan] + 1;
  const nextGlobalCost = Number((state.globalSpentUsd + estimatedCostUsd).toFixed(4));
  const perPlanLimit = planDailyLimit(plan, antiLoss);
  const emailTopUpBalance = email ? Number(state.topUpGenerationsByEmail[email] || 0) : 0;
  const softStopUsd = Number(((antiLoss.dailyGlobalAiBudgetUsd * antiLoss.softStopPercent) / 100).toFixed(4));

  if (state.globalSpentUsd >= softStopUsd) {
    return {
      allowed: false,
      message: 'Aktywowano soft stop budzetowy. Zatrzymano nowe generacje przed przepaleniem dziennego limitu AI.',
      usage: state,
    };
  }

  if (nextGlobalCost > antiLoss.dailyGlobalAiBudgetUsd) {
    return {
      allowed: false,
      message: 'Przekroczono globalny dzienny budzet AI.',
      usage: state,
    };
  }

  // Najpierw probujemy wykorzystac limit planu. Po limicie schodzimy z jednorazowych dokupien przypisanych do konkretnego emaila.
  const useTopUp = nextCount > perPlanLimit;
  if (useTopUp && (!email || emailTopUpBalance <= 0)) {
    return {
      allowed: false,
      message: 'Przekroczono dzienny limit planu i brak aktywnych generacji jednorazowych przypisanych do tego emaila.',
      usage: await usageSnapshot(email),
    };
  }

  const nextState: UsageState = {
    ...state,
    globalSpentUsd: nextGlobalCost,
    counts: {
      ...state.counts,
      [plan]: useTopUp ? state.counts[plan] : nextCount,
    },
    topUpGenerationsRemaining: useTopUp ? Math.max(0, state.topUpGenerationsRemaining - 1) : state.topUpGenerationsRemaining,
    topUpGenerationsByEmail: useTopUp && email
      ? {
          ...state.topUpGenerationsByEmail,
          [email]: Math.max(0, emailTopUpBalance - 1),
        }
      : state.topUpGenerationsByEmail,
  };

  await writeUsage(nextState);

  return {
    allowed: true,
    consumedTopUp: useTopUp,
    message: useTopUp ? 'Wykorzystano 1 generacje z pakietu jednorazowego przypisanego do tego emaila.' : 'Wykorzystano limit planu dziennego.',
    usage: await usageSnapshot(email),
  };
}

export async function purchaseTopUp(packId: TopUpPackId, customerEmail?: string) {
  const pack = TOP_UP_PACKS[packId];
  if (!pack) {
    return {
      ok: false,
      message: 'Nieznany pakiet dokupienia.',
      usage: await readUsage(),
    };
  }

  const email = normalizeEmail(customerEmail);
  if (!email) {
    return {
      ok: false,
      message: 'Email jest wymagany do przypisania pakietu jednorazowego.',
      usage: await usageSnapshot(),
    };
  }

  const state = await readUsage();
  const purchase: TopUpPurchase = {
    id: `${pack.id}_${Date.now()}`,
    packId: pack.id,
    generations: pack.generations,
    amountUsd: pack.priceUsd,
    purchasedAt: new Date().toISOString(),
    email,
  };

  const nextState: UsageState = {
    ...state,
    topUpGenerationsRemaining: state.topUpGenerationsRemaining + pack.generations,
    topUpGenerationsByEmail: {
      ...state.topUpGenerationsByEmail,
      [email]: Number(state.topUpGenerationsByEmail[email] || 0) + pack.generations,
    },
    topUpPurchases: [purchase, ...state.topUpPurchases].slice(0, 50),
  };

  await writeUsage(nextState);

  return {
    ok: true,
    message: `Dodano ${pack.generations} generacji jednorazowych do ${email}.`,
    purchase,
    usage: await usageSnapshot(email),
  };
}

export async function usageSnapshot(customerEmail?: string) {
  const state = await readUsage();
  const email = normalizeEmail(customerEmail);
  const entitlement = email ? state.subscriptionEntitlements[email] || null : null;
  return {
    ...state,
    topUpGenerationsRemaining: email ? Number(state.topUpGenerationsByEmail[email] || 0) : state.topUpGenerationsRemaining,
    totalTopUpGenerationsRemainingGlobal: state.topUpGenerationsRemaining,
    entitlement,
    effectivePlan: entitlement && subscriptionIsActive(entitlement.status) ? entitlement.planKey : 'free',
  };
}

export async function fulfillTopUpCheckout(checkoutSessionId: string, packId: TopUpPackId, customerEmail: string, amountUsd?: number) {
  const pack = TOP_UP_PACKS[packId];
  if (!pack) {
    return {
      ok: false,
      message: 'Nieznany pakiet dokupienia.',
      usage: await readUsage(),
      alreadyFulfilled: false,
    };
  }

  const email = normalizeEmail(customerEmail);
  if (!email) {
    return {
      ok: false,
      message: 'Brak emaila do przypisania checkoutu top-up.',
      usage: await usageSnapshot(),
      alreadyFulfilled: false,
    };
  }

  const state = await readUsage();
  if (state.fulfilledStripeSessions.includes(checkoutSessionId)) {
    return {
      ok: true,
      message: 'Checkout byl juz wczesniej rozliczony.',
      usage: await usageSnapshot(email),
      alreadyFulfilled: true,
    };
  }

  const purchase: TopUpPurchase = {
    id: `stripe_${checkoutSessionId}`,
    packId: pack.id,
    generations: pack.generations,
    amountUsd: Number.isFinite(Number(amountUsd)) ? Number(amountUsd) : pack.priceUsd,
    purchasedAt: new Date().toISOString(),
    email,
  };

  const nextState: UsageState = {
    ...state,
    topUpGenerationsRemaining: state.topUpGenerationsRemaining + pack.generations,
    topUpGenerationsByEmail: {
      ...state.topUpGenerationsByEmail,
      [email]: Number(state.topUpGenerationsByEmail[email] || 0) + pack.generations,
    },
    topUpPurchases: [purchase, ...state.topUpPurchases].slice(0, 100),
    fulfilledStripeSessions: [checkoutSessionId, ...state.fulfilledStripeSessions].slice(0, 500),
  };

  await writeUsage(nextState);

  return {
    ok: true,
    message: `Rozliczono checkout i dodano ${pack.generations} generacji do ${email}.`,
    usage: await usageSnapshot(email),
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
