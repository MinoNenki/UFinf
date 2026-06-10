import { NextResponse } from 'next/server';
import { languageCookieName, parseLanguagePreferenceBody, readLanguagePreference, resolveLanguageScope, upsertLanguagePreference } from '@/lib/server/languagePreferenceStore';

export async function GET(req: Request) {
  const { scopeId } = resolveLanguageScope(req);
  const record = await readLanguagePreference(scopeId);
  const res = NextResponse.json({
    language: record?.language || null,
    savedAt: record?.savedAt || null,
    scopeId,
  });

  res.cookies.set(languageCookieName(), scopeId, {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });

  return res;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = parseLanguagePreferenceBody(body);
  if (!parsed.language) {
    return NextResponse.json({ error: 'Invalid language' }, { status: 400 });
  }

  const { scopeId, userId } = resolveLanguageScope(req, parsed.userId ? { userId: parsed.userId } : undefined);
  const saved = await upsertLanguagePreference(scopeId, parsed.language, parsed.savedAt, userId);

  const res = NextResponse.json({
    ok: true,
    language: saved.language,
    savedAt: saved.savedAt,
    scopeId: saved.scopeId,
  });

  res.cookies.set(languageCookieName(), scopeId, {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });

  return res;
}