import { NextResponse } from 'next/server';
import { TOP_UP_PACKS, type TopUpPackId, PLANS } from '@/lib/budget';
import type { PlanKey } from '@/lib/settings';
import { getStripeClient, resolvePublicOrigin } from '@/lib/server/stripe';
import { consumeRateLimit } from '@/lib/server/security/rateLimit';
import { getClientIp } from '@/lib/server/security/requestMeta';

function isTopUpPackId(value: unknown): value is TopUpPackId {
  return value === 'boost_25' || value === 'boost_75' || value === 'boost_200';
}

function isPlanKey(value: unknown): value is PlanKey {
  return value === 'free' || value === 'pro' || value === 'premium_plus' || value === 'expert';
}

function resolveSuccessUrl(origin: string, kind: 'subscription' | 'topup', suffix: string) {
  return `${origin}/dashboard/account?payment=success&kind=${kind}&item=${encodeURIComponent(suffix)}`;
}

function resolveCancelUrl(origin: string) {
  return `${origin}/dashboard/account?payment=cancelled`;
}

function normalizeEmail(value: unknown) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const kind = body?.kind === 'topup' ? 'topup' : 'subscription';
    const origin = resolvePublicOrigin(req);
    const stripe = getStripeClient();
    const ip = getClientIp(req);
    const rl = await consumeRateLimit({
      bucket: 'stripe-checkout',
      key: `${ip}:${kind}`,
      maxRequests: 10,
      windowSeconds: 10 * 60,
    });

    if (!rl.allowed) {
      return NextResponse.json({ error: 'Za duzo prob checkoutu. Odczekaj chwile i sprobuj ponownie.' }, { status: 429 });
    }

    if (kind === 'topup') {
      const packId = body?.packId;
      if (!isTopUpPackId(packId)) {
        return NextResponse.json({ error: 'Nieprawidlowy pakiet dokupienia.' }, { status: 400 });
      }

      if (!stripe) {
        return NextResponse.json({ error: 'Stripe nie jest skonfigurowany. Ustaw STRIPE_SECRET_KEY.' }, { status: 503 });
      }

      const pack = TOP_UP_PACKS[packId];
      const customerEmail = normalizeEmail(body?.customerEmail);
      if (customerEmail && !isValidEmail(customerEmail)) {
        return NextResponse.json({ error: 'Podaj poprawny email przed przejsciem do platnosci.' }, { status: 400 });
      }
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: customerEmail || undefined,
        client_reference_id: customerEmail || undefined,
        billing_address_collection: 'auto',
        payment_method_collection: 'always',
        allow_promotion_codes: true,
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
        success_url: resolveSuccessUrl(origin, 'topup', packId),
        cancel_url: resolveCancelUrl(origin),
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `USInf ${pack.label}`,
                description: `${pack.generations} one-time generations for launch spikes, campaigns, and overflow without changing your plan`,
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
          expectedAmountUsd: String(pack.priceUsd),
          expectedCurrency: 'usd',
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
      const customerEmail = normalizeEmail(body?.customerEmail);
      if (customerEmail && !isValidEmail(customerEmail)) {
      return NextResponse.json({ error: 'Podaj poprawny email przed przejsciem do platnosci.' }, { status: 400 });
    }
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: customerEmail || undefined,
      client_reference_id: customerEmail || undefined,
      billing_address_collection: 'auto',
      payment_method_collection: 'always',
      allow_promotion_codes: true,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      subscription_data: {
        metadata: {
          planKey,
          customerEmail,
          expectedAmountUsd: String(plan.priceMonthly),
          expectedCurrency: 'usd',
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
              description: `${plan.dailyGenerations} generations per day with AI Growth OS, assets, scheduling, and growth automation`,
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
        expectedAmountUsd: String(plan.priceMonthly),
        expectedCurrency: 'usd',
      },
    });

    return NextResponse.json({
      checkoutMode: 'stripe',
      url: session.url,
      sessionId: session.id,
      plan,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Stripe checkout error.';
    return NextResponse.json({ error: `Stripe checkout failed: ${message}` }, { status: 500 });
  }
}
