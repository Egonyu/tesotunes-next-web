import { test, expect } from '@playwright/test';

test.describe('Homepage Review - music.test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Tesotunes/);
    await expect(page.getByText('Trending Now')).toBeVisible();
    await expect(page.getByText('Popular Artists')).toBeVisible();
  });

  test('should display discover and catalog sections', async ({ page }) => {
    await expect(page.getByText('Browse by Genre')).toBeVisible();
    await expect(page.getByText('Discover More')).toBeVisible();
    await expect(page.getByText('Freshly Updated')).toBeVisible();
  });

  test('should link search control to the search page', async ({ page }) => {
    await expect(page.getByRole('link', { name: /search songs, artists, albums/i })).toHaveAttribute('href', '/search');
  });

  test('should check for console errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      consoleErrors.push(error.message);
    });

    await page.waitForLoadState('networkidle');

    // Take screenshot for review
    await page.screenshot({ path: 'screenshots/homepage-full.png', fullPage: true });

    // Log any errors found
    if (consoleErrors.length > 0) {
      console.log('Console Errors Found:', consoleErrors);
    }
  });

  test('should check empty states have proper messaging', async ({ page }) => {
    const emptyMessages = [
      'No active polls',
      'No genres available',
      'No songs available',
      'No artists available'
    ];

    for (const message of emptyMessages) {
      const element = page.getByText(message);
      if (await element.isVisible()) {
        console.log(`Found empty state: ${message}`);
      }
    }
  });

  test('should verify responsive design - mobile view', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await expect(page.getByText('Trending Now')).toBeVisible();

    await page.screenshot({ path: 'screenshots/homepage-mobile.png', fullPage: true });
  });

  test('should verify responsive design - tablet view', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    await expect(page.getByText('Trending Now')).toBeVisible();

    await page.screenshot({ path: 'screenshots/homepage-tablet.png', fullPage: true });
  });
});
