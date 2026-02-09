import { test, expect } from '@playwright/test';

test.describe('Music App Audit - Find Issues', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/user/login');
    await page.fill('input#email', 'user@test.com');
    await page.fill('input#password', 'password');
    await page.click('button[type="submit"]:has-text("Sign In")');
    await page.waitForTimeout(2000);
  });

  test('Check for broken images', async ({ page }) => {
    await page.goto('/');

    const images = page.locator('img');
    const count = await images.count();
    const brokenImages = [];

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const src = await img.getAttribute('src');
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);

      if (naturalWidth === 0 && src) {
        brokenImages.push(src);
      }
    }

    if (brokenImages.length > 0) {
      console.log('🔴 ISSUE: Broken images found:', brokenImages);
    } else {
      console.log('✅ No broken images');
    }
  });

  test('Check for console errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      consoleErrors.push(error.message);
    });

    await page.goto('/');
    await page.waitForTimeout(3000);

    if (consoleErrors.length > 0) {
      console.log('🔴 ISSUE: Console errors found:');
      consoleErrors.forEach(err => console.log('  -', err));
    } else {
      console.log('✅ No console errors');
    }
  });

  test('Check navigation links are working', async ({ page }) => {
    await page.goto('/');

    const navLinks = page.locator('nav a, header a');
    const count = await navLinks.count();
    const brokenLinks = [];

    console.log(`Testing ${count} navigation links...`);

    for (let i = 0; i < Math.min(count, 10); i++) {
      const link = navLinks.nth(i);
      const href = await link.getAttribute('href');
      const text = await link.textContent();

      if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
        try {
          const response = await page.request.get(href);
          if (response.status() >= 400) {
            brokenLinks.push({ text, href, status: response.status() });
          }
        } catch (e) {
          brokenLinks.push({ text, href, error: 'Failed to fetch' });
        }
      }
    }

    if (brokenLinks.length > 0) {
      console.log('🔴 ISSUE: Broken navigation links:', brokenLinks);
    } else {
      console.log('✅ Navigation links working');
    }
  });

  test('Check for missing ARIA labels on interactive elements', async ({ page }) => {
    await page.goto('/');

    const buttons = page.locator('button:not([aria-label]):not([aria-labelledby])');
    const buttonCount = await buttons.count();

    const links = page.locator('a[href]:not([aria-label]):not([aria-labelledby])');
    const linkCount = await links.count();

    console.log(`Found ${buttonCount} buttons without ARIA labels`);
    console.log(`Found ${linkCount} links without ARIA labels`);

    if (buttonCount > 10 || linkCount > 20) {
      console.log('🔴 ISSUE: Many elements missing accessibility labels');
    } else {
      console.log('✅ Accessibility labels look reasonable');
    }
  });

  test('Test music player functionality', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Try to play a song
    const playButton = page.locator('.play-button').first();

    if (await playButton.isVisible()) {
      await playButton.click();
      await page.waitForTimeout(1000);

      // Check if player appeared
      const player = page.locator('[data-player], .player, #player, audio');
      const playerExists = await player.count() > 0;

      if (!playerExists) {
        console.log('🔴 ISSUE: Player does not appear after clicking play button');
      } else {
        console.log('✅ Music player appears');

        // Check for player controls
        const hasPlayPause = await page.locator('button:has-text("play"), button:has-text("pause"), [aria-label*="play"], [aria-label*="pause"]').count() > 0;
        const hasVolume = await page.locator('[aria-label*="volume"], input[type="range"]').count() > 0;

        if (!hasPlayPause) {
          console.log('🔴 ISSUE: No play/pause control found in player');
        }
        if (!hasVolume) {
          console.log('🔴 ISSUE: No volume control found in player');
        }
      }
    } else {
      console.log('🔴 ISSUE: No play buttons found on page');
    }
  });

  test('Check responsive design on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Check if content is overflowing
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = 375;

    if (bodyWidth > viewportWidth + 10) {
      console.log(`🔴 ISSUE: Horizontal overflow on mobile (body width: ${bodyWidth}px, viewport: ${viewportWidth}px)`);
    } else {
      console.log('✅ No horizontal overflow on mobile');
    }

    // Check if hamburger menu exists
    const mobileMenu = page.locator('[aria-label*="menu"], button:has-text("☰"), .hamburger');
    const hasMobileMenu = await mobileMenu.count() > 0;

    if (!hasMobileMenu) {
      console.log('🔴 ISSUE: No mobile menu button found');
    } else {
      console.log('✅ Mobile menu button exists');
    }
  });

  test('Test search functionality', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[name*="search" i]');

    if (await searchInput.count() === 0) {
      console.log('🔴 ISSUE: No search input found on homepage');
    } else {
      await searchInput.first().fill('test');
      await page.waitForTimeout(1000);

      // Check if search results appear
      const results = page.locator('[data-search-results], .search-results, .results');
      const hasResults = await results.count() > 0;

      if (!hasResults) {
        console.log('⚠️  WARNING: Search might not show live results');
      } else {
        console.log('✅ Search shows results');
      }
    }
  });

  test('Check for performance issues', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    console.log(`Page load time: ${loadTime}ms`);

    if (loadTime > 5000) {
      console.log('🔴 ISSUE: Page takes more than 5 seconds to load');
    } else if (loadTime > 3000) {
      console.log('⚠️  WARNING: Page load time is slow (>3s)');
    } else {
      console.log('✅ Page load time is good');
    }

    // Check for large images
    const images = await page.locator('img').evaluateAll((imgs) =>
      imgs.map((img: HTMLImageElement) => ({
        src: img.src,
        width: img.width,
        height: img.height
      }))
    );

    const largeImages = images.filter(img => img.width * img.height > 1000000);
    if (largeImages.length > 0) {
      console.log(`⚠️  WARNING: ${largeImages.length} large images found (>1MP)`);
    }
  });

  test('Test user authentication edge cases', async ({ page }) => {
    // Test logout button exists
    await page.goto('/');

    const logoutButton = page.locator('button:has-text("logout"), a:has-text("logout"), button:has-text("sign out"), a:has-text("sign out")');

    if (await logoutButton.count() === 0) {
      console.log('🔴 ISSUE: No logout button found');
    } else {
      console.log('✅ Logout button exists');
    }

    // Test that logged-in users are redirected from login page
    await page.goto('/user/login');
    await page.waitForTimeout(1000);

    const currentUrl = page.url();
    if (currentUrl.includes('/user/login')) {
      console.log('🔴 ISSUE: Logged-in user not redirected from login page');
    } else {
      console.log('✅ Logged-in users correctly redirected from login page');
    }

    // Logout to test validation
    if (await logoutButton.count() > 0) {
      await page.goto('/');
      await logoutButton.first().click();
      await page.waitForTimeout(1000);

      // Now test login validation
      await page.goto('/user/login');
      await page.click('button[type="submit"]:has-text("Sign In")'); // Try empty login
      await page.waitForTimeout(1000);

      const errorMessage = page.locator('.text-red-400, .text-red-500, .error, [role="alert"]');
      const hasError = await errorMessage.count() > 0;

      if (!hasError) {
        console.log('⚠️  WARNING: No error message shown for invalid login');
      } else {
        console.log('✅ Error messages shown for validation');
      }
    }
  });

  test('Check for duplicate IDs', async ({ page }) => {
    await page.goto('/');

    const duplicateIds = await page.evaluate(() => {
      const ids = Array.from(document.querySelectorAll('[id]')).map(el => el.id);
      const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
      return [...new Set(duplicates)];
    });

    if (duplicateIds.length > 0) {
      console.log('🔴 ISSUE: Duplicate IDs found:', duplicateIds);
    } else {
      console.log('✅ No duplicate IDs');
    }
  });

  test('Test song upload/add functionality', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    const uploadButton = page.locator('button:has-text("upload"), a:has-text("upload"), button:has-text("add song"), a:has-text("add song")');

    if (await uploadButton.count() === 0) {
      console.log('⚠️  INFO: No upload button found (might be artist-only)');
    } else {
      console.log('✅ Upload functionality available');
    }
  });
});
