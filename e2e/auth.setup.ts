import { test as setup, expect } from '@playwright/test';

export const STORAGE_STATE = '.playwright/auth/admin.json';

const ADMIN_EMAIL = (process.env.E2E_ADMIN_EMAIL || '').trim();
const ADMIN_PASSWORD = (process.env.E2E_ADMIN_PASSWORD || '').trim();

setup('authenticate as admin', async ({ page }) => {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD must be set.');
  }

  await page.goto('/login');

  await page.locator('input#email, input[name="email"]').first().fill(ADMIN_EMAIL);
  await page.locator('input#password, input[name="password"]').first().fill(ADMIN_PASSWORD);
  await page.locator('button[type="submit"]').first().click();

  // Wait for redirect off login page
  await page.waitForURL((url) => !url.pathname.endsWith('/login'), { timeout: 30000 });

  // Confirm we can reach the admin area
  await page.goto('/admin/artists');
  await expect(page.getByRole('heading', { name: 'Artists' }).first()).toBeVisible({ timeout: 15000 });

  // Persist cookies + localStorage so subsequent tests skip the login flow
  await page.context().storageState({ path: STORAGE_STATE });
});
