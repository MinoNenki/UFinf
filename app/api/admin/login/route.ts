import { NextResponse } from 'next/server';
import { adminCredentialsValid, adminRoleFromEnv, cookieName, createAdminSessionToken } from '@/lib/server/security/adminAuth';
import { consumeRateLimit } from '@/lib/server/security/rateLimit';
import { writeAuditLog } from '@/lib/server/security/auditLog';
import { adminTotpSecret, verifyTotpCode } from '@/lib/server/security/totp';
import { getClientIp, getUserAgent } from '@/lib/server/security/requestMeta';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || '');
  const password = String(body.password || '');
  const otp = String(body.otp || '');
  const ip = getClientIp(req);
  const userAgent = getUserAgent(req);

  const rl = await consumeRateLimit({
    bucket: 'admin-login',
    key: `${ip}:${email || 'unknown'}`,
    maxRequests: 5,
    windowSeconds: 10 * 60,
  });

  if (!rl.allowed) {
    await writeAuditLog({
      action: 'admin.login',
      outcome: 'deny',
      ip,
      userAgent,
      adminEmail: email,
      details: { reason: 'rate_limit', retryAfterSeconds: rl.retryAfterSeconds },
    });
    return NextResponse.json({ error: 'Too many login attempts', retryAfterSeconds: rl.retryAfterSeconds }, { status: 429 });
  }

  if (!adminCredentialsValid(email, password)) {
    await writeAuditLog({
      action: 'admin.login',
      outcome: 'deny',
      ip,
      userAgent,
      adminEmail: email,
      details: { reason: 'invalid_credentials' },
    });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const totpSecret = adminTotpSecret();
  if (!totpSecret) {
    await writeAuditLog({
      action: 'admin.login',
      outcome: 'error',
      ip,
      userAgent,
      adminEmail: email,
      details: { reason: 'missing_totp_secret' },
    });
    return NextResponse.json({ error: '2FA is not configured on server.' }, { status: 503 });
  }

  if (!verifyTotpCode(totpSecret, otp)) {
    await writeAuditLog({
      action: 'admin.login',
      outcome: 'deny',
      ip,
      userAgent,
      adminEmail: email,
      details: { reason: 'invalid_otp' },
    });
    return NextResponse.json({ error: 'Invalid one-time code (2FA).' }, { status: 401 });
  }

  const role = adminRoleFromEnv();
  const token = createAdminSessionToken(role);
  const res = NextResponse.json({ ok: true, role });
  res.cookies.set(cookieName(), token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  });

  await writeAuditLog({
    action: 'admin.login',
    outcome: 'allow',
    ip,
    userAgent,
    adminEmail: email,
    adminRole: role,
  });

  return res;
}
