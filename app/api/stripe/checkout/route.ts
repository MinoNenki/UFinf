import { NextResponse } from 'next/server';
import { TOP_UP_PACKS, type TopUpPackId, PLANS } from '@/lib/budget';
import type { PlanKey } from '@/lib/settings';
import { getStripeClient, resolvePublicOrigin } from '@/lib/server/stripe';

function isTopUpPackId(value: unknown): value is TopUpPackId {
  return value === 'boost_25' || value === 'boost_75' || value === 'boost_200';
}

function isPlanKey(value: unknown): value is PlanKey {
  return value === 'free' || value === 'pro' || value === 'premium_plus';
}

function resolveSuccessUrl(origin: string, kind: 'subscription' | 'topup', suffix: string) {
  return `${origin}/dashboard/account?payment=success&kind=${kind}&item=${encodeURIComponent(suffix)}`;
}

function resolveCancelUrl(origin: string) {
  return `${origin}/dashboard/account?payment=cancelled`;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const kind = body?.kind === 'topup' ? 'topup' : 'subscription';
  const origin = resolvePublicOrigin(req);
  const stripe = getStripeClient();

  if (kind === 'topup') {
    const packId = body?.packId;
    if (!isTopUpPackId(packId)) {
      return NextResponse.json({ error: 'Nieprawidlowy pakiet dokupienia.' }, { status: 400 });
    }

    if (!stripe) {
      return NextResponse.json({ error: 'Stripe nie jest skonfigurowany. Ustaw STRIPE_SECRET_KEY.' }, { status: 503 });
    }

    const pack = TOP_UP_PACKS[packId];
    const customerEmail = typeof body?.customerEmail === 'string' ? body.customerEmail.trim().toLowerCase() : '';
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: customerEmail || undefined,
      client_reference_id: customerEmail || undefined,
      billing_address_collection: 'auto',
      allow_promotion_codes: true,
      success_url: resolveSuccessUrl(origin, 'topup', packId),
      cancel_url: resolveCancelUrl(origin),
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `USInf ${pack.label}`,
              description: `${pack.generations} generations one-time top-up`,
            },
            unit_amount: Math.round(pack.priceUsd * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        kind: 'topup',
        packId,
        generations: String(pack.generations),
        customerEmail,
      },
    });

    return NextResponse.json({
      checkoutMode: 'stripe',
      url: session.url,
      sessionId: session.id,
      pack,
    });
  }

  const planKey = body?.planKey;
  if (!isPlanKey(planKey)) {
    return NextResponse.json({ error: 'Nieprawidlowy plan subskrypcji.' }, { status: 400 });
  }

  if (!stripe) {
    return NextResponse.json({ error: 'Stripe nie jest skonfigurowany. Ustaw STRIPE_SECRET_KEY.' }, { status: 503 });
  }

  const plan = PLANS[planKey];
  const customerEmail = typeof body?.customerEmail === 'string' ? body.customerEmail.trim().toLowerCase() : '';
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: customerEmail || undefined,
    client_reference_id: customerEmail || undefined,
    billing_address_collection: 'auto',
    allow_promotion_codes: true,
    subscription_data: {
      metadata: {
        planKey,
        customerEmail,
      },
    },
    success_url: resolveSuccessUrl(origin, 'subscription', planKey),
    cancel_url: resolveCancelUrl(origin),
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `USInf ${plan.name}`,
            description: `${plan.dailyGenerations} generations per day`,
          },
          recurring: {
            interval: 'month',
          },
          unit_amount: Math.round(plan.priceMonthly * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      kind: 'subscription',
      planKey,
      dailyGenerations: String(plan.dailyGenerations),
      customerEmail,
    },
  });

  return NextResponse.json({
    checkoutMode: 'stripe',
    url: session.url,
    sessionId: session.id,
    plan,
  });
}
