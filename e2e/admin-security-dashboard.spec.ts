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

test.describe('Admin Security Console', () => {
  test.skip(
    !ADMIN_EMAIL || !ADMIN_PASSWORD,
    'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run admin security E2E tests.'
  );

  test('renders the console shell and supports tab navigation', async ({ page }) => {
    await page.route('**/api/backend/admin/observability/console/posture*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            window: { from: '2026-03-22T00:00:00Z', to: '2026-03-22T12:00:00Z' },
            kpis: {
              open_incidents: 1,
              critical_incidents: 0,
              events: 12,
              high_risk_events: 2,
              failed_logins: 4,
              webhook_failures: 0,
              blocked_api: 1,
            },
            by_domain: { auth: 6, payments: 3, api: 3 },
            by_severity: { low: 8, medium: 3, high: 1 },
            top_risk_entities: [],
          },
        }),
      });
    });

    await page.route('**/api/backend/admin/observability/console/incidents*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 5001,
              incident_key: 'inc-5001',
              title: 'Repeated failed logins from a single IP',
              status: 'open',
              severity: 'high',
              summary: 'Brute-force pattern detected against the auth domain.',
              event_count: 9,
              owner: null,
              detected_at: '2026-03-22T10:00:00Z',
              resolved_at: null,
              metadata: {},
            },
          ],
        }),
      });
    });

    await page.route('**/api/backend/admin/observability/console/feed*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [],
          meta: { current_page: 1, last_page: 1, per_page: 30, total: 0 },
        }),
      });
    });

    await loginAsAdmin(page);
    await page.goto('/admin/observability');

    await expect(page.getByRole('heading', { name: 'Security Console' })).toBeVisible();

    const overviewTab = page.getByRole('button', { name: /^Overview$/i });
    const feedTab = page.getByRole('button', { name: /^Event feed$/i });
    const incidentsTab = page.getByRole('button', { name: /^Incidents$/i });

    await expect(overviewTab).toBeVisible();
    await expect(feedTab).toBeVisible();
    await expect(incidentsTab).toBeVisible();

    await expect(page.getByText('Repeated failed logins from a single IP')).toBeVisible();

    await incidentsTab.click();
    await expect(page.getByText('Repeated failed logins from a single IP')).toBeVisible();

    await feedTab.click();
    await expect(overviewTab).toBeVisible();
  });
});
