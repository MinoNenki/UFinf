import { NextResponse } from 'next/server';
import { cookieName } from '@/lib/server/security/adminAuth';
import { writeAuditLog } from '@/lib/server/security/auditLog';
import { getClientIp, getUserAgent } from '@/lib/server/security/requestMeta';

export async function POST(req: Request) {
  await writeAuditLog({
    action: 'admin.logout',
    outcome: 'allow',
    ip: getClientIp(req),
    userAgent: getUserAgent(req),
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookieName(), '', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  return res;
}
