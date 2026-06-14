import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import type { PlanKey } from '@/lib/settings';
import { PLANS, TOP_UP_PACKS } from '@/lib/budget';
import { fulfillTopUpCheckout, upsertSubscriptionEntitlement } from '@/lib/server/usageStore';
import { getStripeClient } from '@/lib/server/stripe';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

function asPlanKey(value: unknown): PlanKey | null {
  if (value === 'free' || value === 'pro' || value === 'premium_plus' || value === 'expert') {
    return value;
  }
  return null;
}

function asTopUpPackId(value: unknown): 'boost_25' | 'boost_75' | 'boost_200' | null {
  if (value === 'boost_25' || value === 'boost_75' || value === 'boost_200') {
    return value;
  }
  return null;
}

function asSubscriptionStatus(value: string): 'active' | 'past_due' | 'canceled' | 'incomplete' | 'trialing' | 'unpaid' {
  if (value === 'active' || value === 'past_due' || value === 'canceled' || value === 'trialing' || value === 'unpaid') {
    return value;
  }
  return 'incomplete';
}

function readEmailFromSession(session: Stripe.Checkout.Session) {
  const metadataEmail = typeof session.metadata?.customerEmail === 'string' ? session.metadata.customerEmail : '';
  const customerEmail = session.customer_email || session.customer_details?.email || session.client_reference_id || '';
  return (metadataEmail || customerEmail || '').trim().toLowerCase();
}

function expectedAmountValid(session: Stripe.Checkout.Session) {
  const kind = session.metadata?.kind;
  const expectedCurrency = String(session.metadata?.expectedCurrency || 'usd').toLowerCase();
  if ((session.currency || '').toLowerCase() !== expectedCurrency) return false;

  if (kind === 'topup') {
    const packId = asTopUpPackId(session.metadata?.packId);
    if (!packId) return false;
    return session.amount_total === Math.round(TOP_UP_PACKS[packId].priceUsd * 100);
  }

  if (kind === 'subscription') {
    const planKey = asPlanKey(session.metadata?.planKey);
    if (!planKey) return false;
    return session.amount_total === Math.round(PLANS[planKey].priceMonthly * 100);
  }

  return false;
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (process.env.NODE_ENV === 'production' && !session.livemode) {
    return;
  }

  if (session.status !== 'complete') {
    return;
  }

  if (!expectedAmountValid(session)) {
    return;
  }

  const kind = session.metadata?.kind;

  if (kind === 'topup' && session.mode === 'payment') {
    if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') {
      return;
    }

    const packId = asTopUpPackId(session.metadata?.packId);
    if (!packId) return;

    const email = readEmailFromSession(session);
    if (!email) return;

    await fulfillTopUpCheckout(
      session.id,
      packId,
      email,
      typeof session.amount_total === 'number' ? session.amount_total / 100 : undefined,
    );
    return;
  }

  if (kind === 'subscription' && session.mode === 'subscription') {
    const planKey = asPlanKey(session.metadata?.planKey);
    const email = readEmailFromSession(session);
    if (!planKey || !email) return;

    await upsertSubscriptionEntitlement({
      email,
      planKey,
      status: session.payment_status === 'paid' ? 'active' : 'incomplete',
      stripeCustomerId: typeof session.customer === 'string' ? session.customer : undefined,
      stripeSubscriptionId: typeof session.subscription === 'string' ? session.subscription : undefined,
    });
  }
}

async function handleSubscriptionEvent(subscription: Stripe.Subscription) {
  const email = (subscription.metadata?.customerEmail || '').trim().toLowerCase();
  const planKey = asPlanKey(subscription.metadata?.planKey);
  if (!email || !planKey) return;

  await upsertSubscriptionEntitlement({
    email,
    planKey,
    status: asSubscriptionStatus(subscription.status),
    stripeCustomerId: typeof subscription.customer === 'string' ? subscription.customer : undefined,
    stripeSubscriptionId: subscription.id,
  });
}

export async function POST(req: Request) {
  const stripe = getStripeClient();
  if (!stripe || !WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Stripe webhook is not configured.' }, { status: 503 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 });
  }

  const raw = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(raw, signature, WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
  }

  if (
    event.type === 'customer.subscription.created' ||
    event.type === 'customer.subscription.updated' ||
    event.type === 'customer.subscription.deleted'
  ) {
    await handleSubscriptionEvent(event.data.object as Stripe.Subscription);
  }

  return NextResponse.json({ ok: true });
}
