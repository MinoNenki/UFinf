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

function loadSupabaseUrl() {
  const rootEnv = parseEnvFile('./.env.local');
  const appEnv = parseEnvFile('./ai_growth_os/.env.local');
  const env = { ...rootEnv, ...appEnv };
  return env.NEXT_PUBLIC_SUPABASE_URL || '';
}

async function openAssetsWithSession(page: Page) {
  const supabaseUrl = loadSupabaseUrl();
  const projectRef = supabaseUrl ? new URL(supabaseUrl).hostname.split('.')[0] : '';
  const email = 'e2e@ufinf.com';

  await page.addInitScript(({ ref, email }) => {
    if (!ref) return;
    const key = `sb-${ref}-auth-token`;
    const nowIso = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify({
      access_token: 'e2e-access-token',
      refresh_token: 'e2e-refresh-token',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      user: {
        id: 'e2e-supabase-user',
        aud: 'authenticated',
        role: 'authenticated',
        email,
        email_confirmed_at: nowIso,
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { display_name: 'E2E User' },
        created_at: nowIso,
        updated_at: nowIso,
      },
    }));
  }, { ref: projectRef, email });

  await page.goto('/dashboard/assets');
  await page.getByRole('button', { name: /^EN$/ }).first().click();
}

test('assets studio generates and offers export controls', async ({ page }) => {
  await openAssetsWithSession(page);

  await expect(page.locator('[data-testid="as-controls"]')).toBeVisible();
  await expect(page.locator('[data-testid="as-preview-card"]')).toBeVisible();

  await page.locator('[data-testid="as-prompt"]').fill('High-converting ad for AI audit service for ecommerce brands');
  await page.locator('[data-testid="as-type-ad"]').click();
  await page.locator('[data-testid="as-generate"]').click();

  await expect(page.locator('[data-testid="as-preview-title"]')).toContainText(/Limited offer|Oferta limitada|Oferta limitowana|Offer expires|La oferta expira|Oferta wygasa/i);
  await expect(page.locator('[data-testid="as-export-png"]')).toBeVisible();
  await expect(page.locator('[data-testid="as-export-jpg"]')).toBeVisible();
  await expect(page.locator('[data-testid="as-export-pdf"]')).toBeVisible();
});
