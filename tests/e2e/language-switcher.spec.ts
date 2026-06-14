import { test, expect } from '@playwright/test';

test('landing and dashboard switch language across PL EN ES', async ({ page }) => {
  // Landing page: PL default
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Wejdz do dashboardu ->' })).toBeVisible();

  // Switch to EN
  await page.getByRole('button', { name: /^EN$/ }).first().click();
  await expect(page.getByRole('link', { name: 'Open dashboard ->' })).toBeVisible();
  await expect(page.getByText('Estimated cost:')).toBeVisible();
  await expect(page.getByText('Result will appear here')).toBeVisible();

  // Switch to ES
  await page.getByRole('button', { name: /^ES$/ }).first().click();
  await expect(page.getByRole('link', { name: 'Abrir dashboard ->' })).toBeVisible();
  await expect(page.getByText('Coste estimado:')).toBeVisible();
  await expect(page.getByText('El resultado aparecera aqui')).toBeVisible();

  // Reload: ES persists
  await page.reload();
  await expect(page.getByRole('link', { name: 'Abrir dashboard ->' })).toBeVisible();

  // Switch back to PL
  await page.getByRole('button', { name: /^PL$/ }).first().click();
  await expect(page.getByRole('link', { name: 'Wejdz do dashboardu ->' })).toBeVisible();
});
