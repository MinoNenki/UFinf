import { test, expect } from '@playwright/test';

test('landing DOM smoke: sections, pricing plans, topups, and key navigation', async ({ page }) => {
  await page.goto('/');

  // Main navigation labels are visible in default PL locale.
  await expect(page.getByRole('link', { name: 'Factory' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Trends' })).toBeVisible();
  await expect(page.getByRole('navigation').getByRole('link', { name: 'Dashboard', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ceny' })).toBeVisible();

  // Core page sections exist.
  await expect(page.locator('#factory')).toBeVisible();
  await expect(page.locator('#demo')).toBeVisible();
  await expect(page.locator('#pricing')).toBeVisible();
  await expect(page.locator('#topup')).toBeVisible();

  // Demo plan selector should include the new Expert plan.
  const planSelect = page.locator('#demo select').first();
  await expect(planSelect).toBeVisible();
  await expect(planSelect.locator('option[value="free"]')).toHaveCount(1);
  await expect(planSelect.locator('option[value="pro"]')).toHaveCount(1);
  await expect(planSelect.locator('option[value="premium_plus"]')).toHaveCount(1);
  await expect(planSelect.locator('option[value="expert"]')).toHaveCount(1);

  // Pricing cards include all subscription plans.
  await expect(page.getByRole('heading', { name: 'Free', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Pro' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Premium Plus' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Expert' })).toBeVisible();
  await expect(page.getByText('$119')).toBeVisible();

  // Top-up offers are present.
  await expect(page.getByRole('heading', { name: 'Starter Boost' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Creator Boost' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Scale Boost' })).toBeVisible();

  // Route-level smoke for dedicated pricing page.
  await page.goto('/pricing');
  await expect(page).toHaveURL(/\/pricing$/);
});
