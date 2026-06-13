import { NextResponse, type NextRequest } from 'next/server';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const API_ORIGIN_CHECK_EXCEPTIONS = new Set([
  '/api/stripe/webhook',
]);

function applySecurityHeaders(res: NextResponse) {
  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "style-src 'self' 'unsafe-inline'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "connect-src 'self' https://*.supabase.co https://api.stripe.com https://*.vercel-insights.com",
    "form-action 'self'",
    'upgrade-insecure-requests',
  ].join('; ');

  res.headers.set('Content-Security-Policy', csp);
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-DNS-Prefetch-Control', 'off');
  res.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  res.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  res.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
}

function isSameOrigin(req: NextRequest) {
  const origin = req.headers.get('origin');
  if (!origin) return true;

  try {
    const originUrl = new URL(origin);
    const requestUrl = req.nextUrl;
    return originUrl.protocol === requestUrl.protocol && originUrl.host === requestUrl.host;
  } catch {
    return false;
  }
}

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const method = req.method.toUpperCase();

  if (pathname.startsWith('/api') && MUTATING_METHODS.has(method) && !API_ORIGIN_CHECK_EXCEPTIONS.has(pathname)) {
    const fetchSite = req.headers.get('sec-fetch-site');
    if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'same-site' && fetchSite !== 'none') {
      const denied = NextResponse.json({ error: 'Cross-site request blocked.' }, { status: 403 });
      applySecurityHeaders(denied);
      return denied;
    }

    if (!isSameOrigin(req)) {
      const denied = NextResponse.json({ error: 'Origin mismatch.' }, { status: 403 });
      applySecurityHeaders(denied);
      return denied;
    }
  }

  const res = NextResponse.next();
  applySecurityHeaders(res);
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
