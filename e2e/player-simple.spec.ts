import { test, expect } from '@playwright/test';

test.describe('Simple Player Test', () => {
    test.skip('test player directly', async ({ page }) => {
        // Enable console logging
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('🎵') || text.includes('📻') || text.includes('🔍') || text.includes('❌') || text.includes('✅') || text.includes('Player') || text.includes('API') || text.includes('testPlayer')) {
                console.log(`[CONSOLE]:`, text);
            }
        });

        // Login
        console.log('\n1. Logging in...');
        await page.goto('/login');
        await page.fill('input[name="email"]', 'admin@music.test');
        await page.fill('input[name="password"]', 'password');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');

        // Go to home
        console.log('\n2. Going to home page...');
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Execute test command
        console.log('\n3. Testing player with song ID 3...\n');
        const result = await page.evaluate(() => {
            try {
                (window as any).testPlayer(3);
                return { success: true };
            } catch (e: any) {
                return { success: false, error: e.message };
            }
        });

        console.log('Test player result:', result);

        // Wait for potential responses
        await page.waitForTimeout(5000);

        // Check player state
        const playerVisible = await page.locator('[x-data="musicPlayer()"]').isVisible();
        console.log('\n4. Player visible:', playerVisible);

        const audioSrc = await page.locator('audio').getAttribute('src');
        console.log('5. Audio source:', audioSrc);

        // Screenshot
        await page.screenshot({ path: 'player-test-simple.png', fullPage: true });
        console.log('6. Screenshot saved: player-test-simple.png\n');
    });
});
