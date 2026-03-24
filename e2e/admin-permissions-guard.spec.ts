import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = (process.env.E2E_ADMIN_EMAIL || '').trim();
const ADMIN_PASSWORD = (process.env.E2E_ADMIN_PASSWORD || '').trim();

async function login(page: Parameters<typeof test>[0]['page']) {
  await page.goto('/login');
  await page.locator('input#email, input[name="email"]').first().fill(ADMIN_EMAIL);
  await page.locator('input#password, input[name="password"]').first().fill(ADMIN_PASSWORD);
  await page.locator('button[type="submit"]').first().click();
}

test.describe('Admin permission guards', () => {
  test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, 'Set E2E admin credentials to run permission guard tests.');

  test('blocks unauthorized access to roles route', async ({ page }) => {
    await login(page);

    await page.route('**/api/backend/user/profile', async (route) => {
      const response = {
        data: {
          id: 55,
          name: 'Limited Admin',
          email: 'limited@tesotunes.com',
          role: 'admin',
          permissions: ['catalog.view'],
        },
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    });

    await page.goto('/admin/roles');
    await expect(page).toHaveURL(/\/access-required\?reason=forbidden/);
    await expect(page.getByRole('heading', { name: /Access Restricted/i })).toBeVisible();
  });
});
