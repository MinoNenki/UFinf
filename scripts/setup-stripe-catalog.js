/* eslint-disable no-console */
const path = require('node:path');
const fs = require('node:fs');
const Stripe = require('stripe');

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

async function ensureProduct(stripe, { name, description }) {
  const found = await stripe.products.list({ active: true, limit: 100 });
  const existing = found.data.find((p) => p.name === name);
  if (existing) return existing;
  return stripe.products.create({ name, description });
}

async function ensureRecurringPrice(stripe, { lookupKey, productId, amountUsd }) {
  const list = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
  if (list.data.length > 0) {
    return list.data[0];
  }

  return stripe.prices.create({
    currency: 'usd',
    unit_amount: Math.round(amountUsd * 100),
    recurring: { interval: 'month' },
    product: productId,
    lookup_key: lookupKey,
  });
}

async function ensureOneTimePrice(stripe, { lookupKey, productId, amountUsd }) {
  const list = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
  if (list.data.length > 0) {
    return list.data[0];
  }

  return stripe.prices.create({
    currency: 'usd',
    unit_amount: Math.round(amountUsd * 100),
    product: productId,
    lookup_key: lookupKey,
  });
}

async function main() {
  loadEnvLocal();

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw new Error('Missing STRIPE_SECRET_KEY in environment/.env.local');
  }

  const stripe = new Stripe(secret);

  const plans = [
    {
      key: 'pro',
      name: 'USInf Pro',
      description: '60 daily generations. Best for growing solo creators.',
      monthlyUsd: 24,
      lookupKey: 'usinf_pro_monthly',
    },
    {
      key: 'premium_plus',
      name: 'USInf Premium Plus',
      description: '180 daily generations + One Click Publish + AI Content Brain.',
      monthlyUsd: 69,
      lookupKey: 'usinf_premium_plus_monthly',
    },
    {
      key: 'expert',
      name: 'USInf Expert',
      description: '360 daily generations + priority processing + advanced growth support.',
      monthlyUsd: 119,
      lookupKey: 'usinf_expert_monthly',
    },
  ];

  const topups = [
    {
      key: 'boost_25',
      name: 'USInf Starter Boost',
      description: 'One-time 25 content credits.',
      amountUsd: 9,
      lookupKey: 'usinf_topup_boost_25',
    },
    {
      key: 'boost_75',
      name: 'USInf Creator Boost',
      description: 'One-time 75 content credits.',
      amountUsd: 19,
      lookupKey: 'usinf_topup_boost_75',
    },
    {
      key: 'boost_200',
      name: 'USInf Scale Boost',
      description: 'One-time 150 content credits.',
      amountUsd: 39,
      lookupKey: 'usinf_topup_boost_200',
    },
  ];

  const created = {
    subscriptions: [],
    topups: [],
  };

  for (const plan of plans) {
    const product = await ensureProduct(stripe, {
      name: plan.name,
      description: plan.description,
    });

    const price = await ensureRecurringPrice(stripe, {
      lookupKey: plan.lookupKey,
      productId: product.id,
      amountUsd: plan.monthlyUsd,
    });

    created.subscriptions.push({
      plan: plan.key,
      productId: product.id,
      priceId: price.id,
      lookupKey: plan.lookupKey,
      amountUsd: plan.monthlyUsd,
    });
  }

  for (const topup of topups) {
    const product = await ensureProduct(stripe, {
      name: topup.name,
      description: topup.description,
    });

    const price = await ensureOneTimePrice(stripe, {
      lookupKey: topup.lookupKey,
      productId: product.id,
      amountUsd: topup.amountUsd,
    });

    created.topups.push({
      pack: topup.key,
      productId: product.id,
      priceId: price.id,
      lookupKey: topup.lookupKey,
      amountUsd: topup.amountUsd,
    });
  }

  console.log('Stripe catalog ready:');
  console.log(JSON.stringify(created, null, 2));
}

main().catch((err) => {
  console.error('Stripe catalog setup failed:', err.message);
  process.exit(1);
});
