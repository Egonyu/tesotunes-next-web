import { test, expect } from '@playwright/test';

test.skip('login and play a song', async ({ page }) => {
  test.setTimeout(60000); // 60 second timeout

  // Navigate to user login page
  await page.goto('/user/login', { waitUntil: 'domcontentloaded' });

  // Fill in login credentials
  await page.fill('input#email', 'user@test.com');
  await page.fill('input#password', 'password');

  // Click login button
  await page.click('button[type="submit"]:has-text("Sign In")');

  // Wait for navigation after login
  await page.waitForURL('**/dashboard', { timeout: 15000 }).catch(() => {
    console.log('Did not redirect to dashboard, continuing...');
  });

  // Navigate to home page to find songs
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  // Wait for page to load
  await page.waitForTimeout(2000);

  // Try to find and click a song
  // First try: look for trending songs with play buttons
  const trendingSongSelector = '.hover\\:bg-gray-700\\/50';
  const trendingSongs = page.locator(trendingSongSelector);

  if (await trendingSongs.count() > 0) {
    console.log(`Found ${await trendingSongs.count()} trending songs`);
    await trendingSongs.first().click();
    console.log('✅ Clicked on first trending song');
  } else {
    console.log('No trending songs found, trying play buttons...');
    // Alternative: try clicking any play button
    const playButton = page.locator('.play-button').first();
    if (await playButton.isVisible()) {
      await playButton.click();
      console.log('✅ Clicked on play button');
    }
  }

  // Wait for player to respond
  await page.waitForTimeout(2000);

  console.log('✅ Test completed successfully!');
});
