import { createHmac, pbkdf2Sync, timingSafeEqual } from 'node:crypto';
import { AdminRole, normalizeAdminRole } from '@/lib/server/security/rbac';

type AdminSessionPayload = {
  role: 'admin';
  adminRole: AdminRole;
  mfa: true;
  exp: number;
};

const ADMIN_COOKIE = 'usinf_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function secret() {
  return process.env.ADMIN_SESSION_SECRET || 'change-me-admin-session-secret';
}

function toBase64Url(input: string) {
  return Buffer.from(input, 'utf8').toString('base64url');
}

function fromBase64Url(input: string) {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function sign(data: string) {
  return createHmac('sha256', secret()).update(data).digest('base64url');
}

function constantTimeEqualString(a: string, b: string) {
  const left = Buffer.from(a, 'utf8');
  const right = Buffer.from(b, 'utf8');
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function decodeBase64Flexible(input: string) {
  try {
    return Buffer.from(input, 'base64url');
  } catch {
    return Buffer.from(input, 'base64');
  }
}

function verifyPbkdf2PasswordHash(password: string, hashString: string) {
  const parts = hashString.split('$');
  if (parts.length !== 5) return false;
  const [algorithm, digest, iterationsRaw, salt, expectedHashRaw] = parts;
  if (algorithm !== 'pbkdf2' || digest !== 'sha256') return false;

  const iterations = Number(iterationsRaw);
  if (!Number.isInteger(iterations) || iterations < 100_000) return false;

  const expectedHash = decodeBase64Flexible(expectedHashRaw);
  const derived = pbkdf2Sync(password, salt, iterations, expectedHash.length, 'sha256');
  return timingSafeEqual(derived, expectedHash);
}

export function createAdminSessionToken(adminRole: AdminRole) {
  const payload: AdminSessionPayload = {
    role: 'admin',
    adminRole,
    mfa: true,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const body = toBase64Url(JSON.stringify(payload));
  const mac = sign(body);
  return `${body}.${mac}`;
}

export function verifyAdminSessionToken(token: string | undefined) {
  if (!token || !token.includes('.')) return false;
  const [body, mac] = token.split('.');
  if (!body || !mac) return false;

  const expected = sign(body);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  try {
    const payload = JSON.parse(fromBase64Url(body)) as AdminSessionPayload;
    if (payload.role !== 'admin') return null;
    if (!payload.mfa) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function cookieName() {
  return ADMIN_COOKIE;
}

export function adminCredentialsValid(email: string, password: string) {
  const expectedEmail = (process.env.ADMIN_EMAIL || 'admin@usinf.com').trim().toLowerCase();
  const incomingEmail = email.trim().toLowerCase();
  if (!constantTimeEqualString(incomingEmail, expectedEmail)) return false;

  const passwordHash = (process.env.ADMIN_PASSWORD_HASH || '').trim();
  if (passwordHash) {
    return verifyPbkdf2PasswordHash(password, passwordHash);
  }

  const expectedPassword = process.env.ADMIN_PASSWORD || 'change-me-admin-password';
  return constantTimeEqualString(password, expectedPassword);
}

export function adminRoleFromEnv(): AdminRole {
  return normalizeAdminRole(process.env.ADMIN_ROLE);
}
