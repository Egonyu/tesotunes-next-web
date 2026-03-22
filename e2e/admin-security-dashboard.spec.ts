import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = (process.env.E2E_ADMIN_EMAIL || '').trim();
const ADMIN_PASSWORD = (process.env.E2E_ADMIN_PASSWORD || '').trim();

async function loginAsAdmin(page: Parameters<typeof test>[0]['page']) {
  await page.goto('/login');

  await page.locator('input#email, input[name="email"]').first().fill(ADMIN_EMAIL);
  await page.locator('input#password, input[name="password"]').first().fill(ADMIN_PASSWORD);
  await page.locator('button[type="submit"]').first().click();

  const adminNav = page.getByRole('link', { name: 'Security', exact: true });
  const authError = page
    .getByText(/invalid credentials|invalid email or password|authentication failed|unauthorized/i)
    .first();

  const authErrorVisible = await authError.isVisible({ timeout: 5000 }).catch(() => false);
  if (authErrorVisible) {
    throw new Error('Admin login failed: set valid E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD.');
  }

  await expect(adminNav).toBeVisible({ timeout: 20000 });
}

test.describe('Admin security dashboard', () => {
  test.skip(
    !ADMIN_EMAIL || !ADMIN_PASSWORD,
    'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run admin security E2E tests.'
  );

  test('renders observability controls and supports filter interactions', async ({ page }) => {
    await page.route('**/api/backend/admin/audit-logs*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 9101,
              action: 'login_failed',
              resource_type: 'auth',
              description: 'Unauthorized login failed from proxy',
              ip_address: '10.1.1.1',
              created_at: '2026-03-22T10:00:00Z',
              user: { name: 'Ops', email: 'ops@tesotunes.com' },
            },
            {
              id: 9102,
              action: 'policy_check',
              resource_type: 'security',
              description: 'Routine policy scan complete',
              ip_address: '10.1.1.2',
              created_at: '2026-03-22T09:00:00Z',
              user: null,
            },
          ],
        }),
      });
    });

    await loginAsAdmin(page);
    await page.goto('/admin/security');

    await expect(page.getByRole('heading', { name: /Security Monitoring Center/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Filter$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Reset$/i })).toBeVisible();

    const searchInput = page.getByLabel('Search events');
    const severitySelect = page.getByLabel('Filter by severity');
    const statusSelect = page.getByLabel('Filter by status');
    const typeSelect = page.getByLabel('Filter by event type');
    const monitoringSection = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: /Security Monitoring Center/i }) })
      .first();
    const filterSection = page.locator('section').filter({ has: searchInput }).first();

    await expect(searchInput).toBeVisible();
    await expect(severitySelect).toBeVisible();
    await expect(statusSelect).toBeVisible();
    await expect(typeSelect).toBeVisible();

    await monitoringSection.getByRole('button', { name: 'Analyze IP' }).click();
    await expect(searchInput).toBeFocused();

    await monitoringSection.getByRole('button', { name: 'Blocked IPs' }).click();
    await expect(typeSelect).toHaveValue('network');

    await expect(page.getByText('Unauthorized login failed from proxy')).toBeVisible();
    await expect(page.getByText('Routine policy scan complete')).toBeVisible();

    await searchInput.fill('unauthorized');
    await filterSection.getByRole('button', { name: /^Filter$/i }).click();

    await expect(page.getByText('Unauthorized login failed from proxy')).toBeVisible();
    await expect(page.getByText('Routine policy scan complete')).not.toBeVisible();

    await filterSection.getByRole('button', { name: /^Reset$/i }).click();
    await expect(searchInput).toHaveValue('');
    await expect(severitySelect).toHaveValue('all');
    await expect(statusSelect).toHaveValue('all');
    await expect(typeSelect).toHaveValue('all');
    await expect(page.getByText('Routine policy scan complete')).toBeVisible();
  });
});
