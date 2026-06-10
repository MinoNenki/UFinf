import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test, expect, type Page } from '@playwright/test';

type EnvMap = Record<string, string>;

function parseEnvFile(filePath: string): EnvMap {
  try {
    const raw = readFileSync(filePath, 'utf8');
    return raw.split(/\r?\n/).reduce<EnvMap>((acc, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return acc;
      const index = trimmed.indexOf('=');
      if (index < 0) return acc;
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim();
      acc[key] = value;
      return acc;
    }, {});
  } catch {
    return {};
  }
}

function loadAdminConfig() {
  const rootEnv = parseEnvFile('./.env.local');
  const appEnv = parseEnvFile('./ai_growth_os/.env.local');
  const env = { ...rootEnv, ...appEnv };
  return {
    adminEmail: env.ADMIN_EMAIL || 'admin@usinf.com',
    adminPassword: env.ADMIN_PASSWORD || 'change-me-admin-password',
    adminTotpSecret: env.ADMIN_TOTP_SECRET || 'JBSWY3DPEHPK3PXP',
  };
}

function base32Decode(input: string) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const normalized = input.toUpperCase().replace(/=+$/g, '').replace(/\s+/g, '');
  let bits = '';
  for (const ch of normalized) {
    const idx = alphabet.indexOf(ch);
    if (idx < 0) throw new Error('Invalid base32 secret');
    bits += idx.toString(2).padStart(5, '0');
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(Number.parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}

function generateTotp(secret: string, timestamp = Date.now()) {
  const step = 30;
  const counter = Math.floor(timestamp / 1000 / step);
  const buffer = Buffer.alloc(8);
  buffer.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  buffer.writeUInt32BE(counter >>> 0, 4);
  const hmac = createHmac('sha1', base32Decode(secret)).update(buffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = ((hmac[offset] & 0x7f) << 24)
    | ((hmac[offset + 1] & 0xff) << 16)
    | ((hmac[offset + 2] & 0xff) << 8)
    | (hmac[offset + 3] & 0xff);
  return String(code % 1_000_000).padStart(6, '0');
}

async function loginAdmin(page: Page) {
  const { adminEmail, adminPassword, adminTotpSecret } = loadAdminConfig();
  await page.goto('/dashboard/admin');
  await page.getByRole('button', { name: /^EN$/ }).first().click();
  await page.locator('input[type="email"]').fill(adminEmail);
  await page.locator('input[type="password"]').first().fill(adminPassword);
  await page.locator('input[maxlength="6"]').fill(generateTotp(adminTotpSecret));
  await page.getByRole('button', { name: 'Sign in as admin' }).click();
}

test('admin login, account, settings and language persistence across PL EN ES', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Wejdz do dashboardu ->' })).toBeVisible();

  await page.getByRole('button', { name: /^EN$/ }).first().click();
  await expect(page.getByRole('link', { name: 'Open dashboard ->' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('link', { name: 'Open dashboard ->' })).toBeVisible();

  await page.getByRole('button', { name: /^ES$/ }).first().click();
  await expect(page.getByRole('link', { name: 'Abrir dashboard ->' })).toBeVisible();

  await loginAdmin(page);
  await expect(page.getByRole('heading', { name: 'Admin control center' })).toBeVisible();

  await page.goto('/dashboard/account');
  await expect(page.getByRole('heading', { name: 'My account' })).toBeVisible();
  await expect(page.getByText('Language preference is saved for this browser user profile.')).toBeVisible();
  await page.getByRole('button', { name: /^Polski$/ }).click();
  await expect(page.getByRole('heading', { name: 'Moje konto' })).toBeVisible();

  await page.goto('/dashboard/settings');
  await expect(page.getByRole('heading', { name: 'Ustawienia' })).toBeVisible();
  await expect(page.getByText('Konfiguracja kluczy API, limitow anti-loss i funkcji Premium Plus.')).toBeVisible();

  await page.getByRole('button', { name: /^EN$/ }).first().click();
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  await expect(page.getByText('Configuration for API keys, anti-loss limits, and Premium Plus features.')).toBeVisible();

  await page.getByRole('button', { name: /^ES$/ }).first().click();
  await expect(page.getByRole('heading', { name: 'Ajustes' })).toBeVisible();
  await expect(page.getByText('Configuracion de claves API, limites anti-loss y funciones Premium Plus.')).toBeVisible();

  await page.goto('/dashboard/account');
  await expect(page.getByRole('heading', { name: 'Mi cuenta' })).toBeVisible();
  await expect(page.getByText('La preferencia de idioma se guarda para este perfil de navegador.')).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Mi cuenta' })).toBeVisible();
});