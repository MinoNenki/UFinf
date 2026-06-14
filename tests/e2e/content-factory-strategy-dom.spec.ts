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
async function openFactoryWithSession(page: Page) {
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

  await page.goto('/dashboard/factory');
  await page.getByRole('button', { name: /^EN$/ }).first().click();
}

test('content factory strategy panel and DOM options work', async ({ page }) => {
  test.setTimeout(120_000);
  await openFactoryWithSession(page);
  await expect(page.locator('[data-testid="cf-topic"]')).toBeVisible();

  const templates = page.locator('[data-testid^="cf-template-"]');
  await expect(templates).toHaveCount(12);

  await page.locator('[data-testid="cf-template-finance-leads"]').click();
  await expect(page.locator('[data-testid="cf-campaign-goal"]')).toHaveValue('leads');
  await expect(page.locator('[data-testid="cf-style-manual"]')).toBeChecked();
  await expect(page.locator('[data-testid="cf-style-hint"]')).toHaveValue(/clarity-first/);

  await page.locator('[data-testid="cf-topic"]').fill('Scale-ready campaign for premium B2B service');
  await expect(page.locator('[data-testid="cf-generate"]')).toBeEnabled();

  await page.route('**/api/generate', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        mode: 'real_ai',
        strategy: {
          goal: 'leads',
          styleMode: 'manual',
          resolvedNiche: 'finance',
          styleProfile: 'clarity-first money framework, practical examples, trust-forward lead magnet CTA',
          shortVideoTemplate: {
            hookFormula: 'Pain hook for leads',
            sceneFlow: ['0-2 hook', '2-6 problem', '6-12 solution', '12-18 proof', '18-22 CTA'],
            ctaFormula: 'Comment PLAN',
            visualDirection: 'Editorial premium charts',
            editCadence: 'Fast cadence 0.8-1.4s',
          },
        },
        result: {
          verdict: 'READY TO PUBLISH',
          bestTime: '6:00 PM-8:00 PM',
          trend: 'Proof-first authority short videos',
          performance: {
            viralPotential: 85,
            conversionPotential: 79,
            engagementPotential: 82,
          },
          content: {
            tiktok: 'TikTok copy',
            shorts: 'Shorts copy',
            reels: 'Reels copy',
            facebook: 'Facebook copy',
            x: 'X copy',
          },
          hashtags: ['#growth', '#finance'],
          nextIdeas: ['Idea one', 'Idea two'],
          coach: ['Action one', 'Action two'],
          campaignCalendar: [
            {
              day: 1,
              title: 'Day 1: Authority Launch',
              publishWindow: '6:00 PM-8:00 PM',
              tiktok: 'Tiktok day 1',
              shorts: 'Shorts day 1',
              reels: 'Reels day 1',
              description: 'Launch authority narrative',
              hashtags: ['#growth'],
              cta: 'Comment PLAN',
            },
          ],
        },
      }),
    });
  });

  await page.locator('[data-testid="cf-generate"]').click();

  await expect(page.getByText('Viral Potential: 85%')).toBeVisible();
  await expect(page.getByText('Campaign strategy engine')).toBeVisible();
  await expect(page.getByText('Hook formula: Pain hook for leads')).toBeVisible();

  await page.locator('.tabs').getByRole('button', { name: 'Growth Coach' }).click();
  await expect(page.getByText('Action one')).toBeVisible();

  await page.locator('.tabs').getByRole('button', { name: 'Next ideas' }).click();
  await expect(page.getByText('Idea one')).toBeVisible();

  await page.locator('.tabs').getByRole('button', { name: '30-day Calendar' }).click();
  await expect(page.getByText('Day 1: Authority Launch')).toBeVisible();
  await expect(page.locator('[data-testid="cf-export-calendar-csv"]')).toBeVisible();
  await expect(page.locator('[data-testid="cf-export-calendar-notion"]')).toBeVisible();

  await page.getByRole('button', { name: 'YouTube Shorts' }).click();
  await expect(page.locator('.studio-output')).toContainText('Shorts copy');
});
