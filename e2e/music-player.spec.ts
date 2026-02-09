import { test, expect } from '@playwright/test';

test.describe('Music Player', () => {
    test.beforeEach(async ({ page }) => {
        // Listen to console messages
        page.on('console', msg => {
            const text = msg.text();
            console.log(`[BROWSER ${msg.type()}]:`, text);
        });

        // Listen to page errors
        page.on('pageerror', error => {
            console.error('[PAGE ERROR]:', error.message);
        });

        // Listen to failed requests
        page.on('requestfailed', request => {
            console.error('[REQUEST FAILED]:', request.url(), request.failure()?.errorText);
        });
    });

    test.skip('should initialize player on home page', async ({ page }) => {
        console.log('\n=== TEST: Player Initialization ===\n');

        // Navigate to home page
        await page.goto('/');

        // Wait for page to load
        await page.waitForLoadState('networkidle');

        // Check if player component exists
        const player = page.locator('[x-data="musicPlayer()"]');
        await expect(player).toBeAttached();
        console.log('✅ Player component found');

        // Check for initialization log
        await page.waitForTimeout(1000);

        // Try to find play button
        const playButtons = page.locator('button[aria-label*="Play"]').first();
        const playButtonCount = await page.locator('button[aria-label*="Play"]').count();
        console.log(`Found ${playButtonCount} play buttons`);

        if (playButtonCount > 0) {
            await expect(playButtons).toBeVisible();
            console.log('✅ Play buttons visible');
        }
    });

    test.skip('should test player with console command', async ({ page }) => {
        console.log('\n=== TEST: Player Console Command ===\n');

        // Go to home page
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Check if user is logged in
        const isLoggedIn = await page.locator('text=/logout/i').count() > 0;
        console.log('Logged in:', isLoggedIn);

        if (!isLoggedIn) {
            console.log('⚠️  Not logged in, attempting to log in...');

            // Try to login
            await page.goto('/login');
            await page.fill('input[name="email"]', 'admin@music.test');
            await page.fill('input[name="password"]', 'password');
            await page.click('button[type="submit"]');
            await page.waitForLoadState('networkidle');
        }

        // Go back to home
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Capture console logs
        const consoleLogs: string[] = [];
        page.on('console', msg => {
            consoleLogs.push(msg.text());
        });

        // Execute test player command
        console.log('\n🧪 Executing: window.testPlayer(3)\n');

        await page.evaluate(() => {
            (window as any).testPlayer(3);
        });

        // Wait for API calls
        await page.waitForTimeout(3000);

        // Print all console logs
        console.log('\n=== CONSOLE LOGS ===');
        consoleLogs.forEach(log => console.log(log));

        // Check if player became visible
        const playerVisible = await page.locator('[x-data="musicPlayer()"]').isVisible();
        console.log('\nPlayer visible:', playerVisible);

        // Check for audio element
        const audio = page.locator('audio');
        const audioSrc = await audio.getAttribute('src');
        console.log('Audio src:', audioSrc);

        // Take screenshot
        await page.screenshot({ path: 'tests/screenshots/player-test.png', fullPage: true });
        console.log('📸 Screenshot saved to tests/screenshots/player-test.png');
    });

    test.skip('should click play button and capture all network traffic', async ({ page }) => {
        console.log('\n=== TEST: Click Play Button ===\n');

        // Track network requests
        const requests: any[] = [];
        page.on('request', request => {
            if (request.url().includes('api') || request.url().includes('music')) {
                requests.push({
                    url: request.url(),
                    method: request.method(),
                    headers: request.headers()
                });
            }
        });

        page.on('response', async response => {
            if (response.url().includes('api') || response.url().includes('music')) {
                console.log(`\n[RESPONSE] ${response.status()} ${response.url()}`);
                try {
                    const body = await response.text();
                    console.log('[BODY]', body.substring(0, 200));
                } catch (e) {
                    console.log('[BODY] Unable to read');
                }
            }
        });

        // Login first
        await page.goto('/login');
        await page.fill('input[name="email"]', 'admin@music.test');
        await page.fill('input[name="password"]', 'password');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');

        // Go to home
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Find first play button
        const playButton = page.locator('button[aria-label*="Play"]').first();

        if (await playButton.count() > 0) {
            console.log('🎯 Clicking play button...');
            await playButton.click();

            // Wait for network activity
            await page.waitForTimeout(5000);

            // Print all API requests
            console.log('\n=== API REQUESTS ===');
            requests.forEach(req => {
                console.log(`${req.method} ${req.url}`);
                console.log('Headers:', JSON.stringify(req.headers, null, 2));
            });

            // Check player state
            const playerVisible = await page.locator('[x-data="musicPlayer()"]').isVisible();
            console.log('\nPlayer visible after click:', playerVisible);

            // Get audio element state
            const audioElement = page.locator('audio');
            const audioSrc = await audioElement.getAttribute('src');
            const paused = await audioElement.evaluate(el => (el as HTMLAudioElement).paused);
            const error = await audioElement.evaluate(el => (el as HTMLAudioElement).error?.code || null);

            console.log('\n=== AUDIO ELEMENT STATE ===');
            console.log('Src:', audioSrc);
            console.log('Paused:', paused);
            console.log('Error:', error);

            // Take screenshot
            await page.screenshot({ path: 'tests/screenshots/player-clicked.png', fullPage: true });
        } else {
            console.log('❌ No play buttons found');
        }
    });

    test.skip('should check authentication state', async ({ page }) => {
        console.log('\n=== TEST: Authentication Check ===\n');

        // Go to API endpoint directly
        const response = await page.goto('/api/tracks/3/stream-url');

        console.log('Status:', response?.status());
        const body = await response?.text();
        console.log('Response:', body);

        // Check cookies
        const cookies = await page.context().cookies();
        console.log('\n=== COOKIES ===');
        cookies.forEach(cookie => {
            console.log(`${cookie.name}: ${cookie.value.substring(0, 50)}...`);
        });
    });

    test('should check if songs exist in database', async ({ page }) => {
        console.log('\n=== TEST: Database Check ===\n');

        // This would need a backend endpoint to check
        // For now, let's check the home page for song listings
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const songElements = await page.locator('[data-song-id], .song-card, .track-item').count();
        console.log(`Found ${songElements} song elements on page`);

        // Check for any text mentioning songs
        const pageContent = await page.content();
        const hasSongReferences = pageContent.includes('song') || pageContent.includes('track') || pageContent.includes('play');
        console.log('Page has song references:', hasSongReferences);
    });
});
