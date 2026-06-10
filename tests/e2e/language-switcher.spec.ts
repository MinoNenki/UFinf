import { test, expect } from '@playwright/test';

test('landing and dashboard switch language across PL EN ES', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('link', { name: 'Wejdz do dashboardu ->' })).toBeVisible();

  await page.getByRole('button', { name: /^EN$/ }).first().click();
  await expect(page.getByRole('link', { name: 'Open dashboard ->' })).toBeVisible();
  await expect(page.getByText('Estimated cost:')).toBeVisible();
  await expect(page.getByText('Result will appear here')).toBeVisible();

  await page.getByRole('button', { name: /^ES$/ }).first().click();
  await expect(page.getByRole('link', { name: 'Abrir dashboard ->' })).toBeVisible();
  await expect(page.getByText('Coste estimado:')).toBeVisible();
  await expect(page.getByText('El resultado aparecera aqui')).toBeVisible();

  await page.goto('/dashboard/account');
  await page.getByRole('button', { name: /^ES$/ }).first().click();
  await expect(page.getByRole('heading', { name: 'Mi cuenta' })).toBeVisible();
  await expect(page.getByText('La preferencia de idioma se guarda para este perfil de navegador.')).toBeVisible();

  await page.getByRole('button', { name: /^Polski$/ }).click();
  await expect(page.getByRole('heading', { name: 'Moje konto' })).toBeVisible();
  await expect(page.getByText('Preferencja jezyka zapisana dla tego uzytkownika przegladarki.')).toBeVisible();

  await page.goto('/dashboard');
  await expect(page.getByRole('button', { name: 'Moje konto' }).first()).toBeVisible();
  await page.getByText('Dashboard').first().waitFor();

  await page.getByRole('button', { name: /^EN$/ }).first().click();
  await expect(page.getByRole('button', { name: 'My account' }).first()).toBeVisible();
  await expect(page.getByText('Dashboard').first()).toBeVisible();
});
