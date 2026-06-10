import Stripe from 'stripe';

export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY || '';
  if (!secretKey) {
    return null;
  }

  return new Stripe(secretKey, {
    apiVersion: Stripe.API_VERSION,
  });
}

export function resolvePublicOrigin(req: Request) {
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_PUBLIC_URL || '';
  if (configuredOrigin) {
    return configuredOrigin.replace(/\/$/, '');
  }

  const headerOrigin = req.headers.get('origin');
  if (headerOrigin) {
    return headerOrigin.replace(/\/$/, '');
  }

  const forwardedProto = req.headers.get('x-forwarded-proto') || 'http';
  const forwardedHost = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000';
  return `${forwardedProto}://${forwardedHost}`.replace(/\/$/, '');
}
