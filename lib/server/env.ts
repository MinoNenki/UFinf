import { existsSync } from 'node:fs';
import path from 'node:path';

let validated = false;

function mustNumber(name: string, fallback: number) {
  const raw = process.env[name];
  if (raw == null || raw === '') return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    throw new Error(`ENV_INVALID: ${name} musi byc liczba.`);
  }
  return parsed;
}

export function validateEnvOnStartup() {
  if (validated) return;
  validated = true;

  const envLocal = path.join(process.cwd(), '.env.local');
  const envExample = path.join(process.cwd(), '.env.example');
  const isProd = process.env.NODE_ENV === 'production';

  if (!existsSync(envLocal)) {
    const warning = '[env] Brak .env.local. Dla bezpieczenstwa trzymaj klucze i limity w .env.local.';
    // eslint-disable-next-line no-console
    console.warn(isProd ? `${warning} W produkcji na Vercel uzyj zmiennych srodowiskowych projektu.` : warning);
  }

  if (!existsSync(envExample)) {
    // eslint-disable-next-line no-console
    console.warn('[env] Brak .env.example - utrudnia onboarding i walidacje konfiguracji.');
  }

  const maxRequest = mustNumber('MAX_REQUEST_COST_USD', 0.12);
  const dailyBudget = mustNumber('DAILY_GLOBAL_AI_BUDGET_USD', 20);

  if (maxRequest <= 0) {
    throw new Error('ENV_INVALID: MAX_REQUEST_COST_USD musi byc > 0.');
  }

  if (dailyBudget <= 0) {
    throw new Error('ENV_INVALID: DAILY_GLOBAL_AI_BUDGET_USD musi byc > 0.');
  }

  if (isProd && !process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    // eslint-disable-next-line no-console
    console.warn('[env] Brak OPENAI_API_KEY i ANTHROPIC_API_KEY - aplikacja uruchomi sie w trybie demo/safe mode.');
  }

  const adminSecret = process.env.ADMIN_SESSION_SECRET || '';
  const adminPassword = process.env.ADMIN_PASSWORD || '';
  const adminTotpSecret = process.env.ADMIN_TOTP_SECRET || '';
  const adminRole = process.env.ADMIN_ROLE || 'super_admin';

  if (isProd && adminSecret.length < 32) {
    throw new Error('ENV_INVALID: ADMIN_SESSION_SECRET musi miec co najmniej 32 znaki w produkcji.');
  }

  if (isProd && adminPassword.length < 10) {
    throw new Error('ENV_INVALID: ADMIN_PASSWORD musi miec co najmniej 10 znakow w produkcji.');
  }

  if (isProd && adminTotpSecret.length < 16) {
    throw new Error('ENV_INVALID: ADMIN_TOTP_SECRET musi miec co najmniej 16 znakow w produkcji.');
  }

  if (!['super_admin', 'ops_admin', 'security_admin', 'analyst'].includes(adminRole)) {
    throw new Error('ENV_INVALID: ADMIN_ROLE musi byc jednym z: super_admin, ops_admin, security_admin, analyst.');
  }
}
