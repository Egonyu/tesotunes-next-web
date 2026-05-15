import { test as setup, expect } from '@playwright/test';
import * as crypto from 'crypto';

export const STORAGE_STATE = '.playwright/auth/admin.json';

const ADMIN_EMAIL = (process.env.E2E_ADMIN_EMAIL || '').trim();
const ADMIN_PASSWORD = (process.env.E2E_ADMIN_PASSWORD || '').trim();
const TOTP_SECRET = (process.env.E2E_TOTP_SECRET || '').trim();

// Inline TOTP generation — avoids adding a runtime dependency.
// Implements RFC 6238 (TOTP) on top of RFC 4226 (HOTP) using SHA-1.
function base32Decode(encoded: string): Buffer {
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const clean = encoded.toUpperCase().replace(/=+$/, '').replace(/\s/g, '');
  const bytes: number[] = [];
  let bits = 0;
  let value = 0;

  for (const char of clean) {
    const idx = ALPHABET.indexOf(char);
    if (idx < 0) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

function generateTOTP(secret: string, windowOffset = 0): string {
  const key = base32Decode(secret);
  const counter = Math.floor(Date.now() / 1000 / 30) + windowOffset;

  const buf = Buffer.alloc(8);
  // Write counter as 64-bit big-endian
  buf.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  buf.writeUInt32BE(counter >>> 0, 4);

  const hmac = crypto.createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = (hmac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
  return code.toString().padStart(6, '0');
}

setup('authenticate as admin', async ({ page }) => {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD must be set.');
  }

  setup.setTimeout(120_000);

  await page.goto('/login');

  await page.locator('input#email, input[name="email"]').first().fill(ADMIN_EMAIL);
  await page.locator('input#password, input[name="password"]').first().fill(ADMIN_PASSWORD);
  await page.locator('button[type="submit"]').first().click();

  // Race: either the page navigates away (no 2FA) or the 2FA step appears.
  const twoFaHeading = page.getByRole('heading', { name: 'Two-Factor Authentication' });
  const navigatedAway = page.waitForURL((url) => !url.pathname.endsWith('/login'), { timeout: 15000 })
    .then(() => 'navigated' as const)
    .catch(() => 'timeout' as const);
  const twoFaVisible = twoFaHeading.waitFor({ state: 'visible', timeout: 15000 })
    .then(() => 'two_fa' as const)
    .catch(() => 'timeout' as const);

  const outcome = await Promise.race([navigatedAway, twoFaVisible]);

  if (outcome === 'two_fa') {
    if (!TOTP_SECRET) {
      throw new Error(
        '2FA challenge detected but E2E_TOTP_SECRET is not set. ' +
        'Add the admin TOTP secret as a GitHub Actions secret named E2E_TOTP_SECRET.',
      );
    }

    // Try current window first, then ±1 to handle clock skew.
    let filled = false;
    for (const offset of [0, 1, -1]) {
      const code = generateTOTP(TOTP_SECRET, offset);
      await page.locator('input#two_fa_code').fill(code);
      await page.getByRole('button', { name: 'Verify' }).click();

      // Wait briefly to see if the submit succeeded or rejected the code.
      const result = await Promise.race([
        page.waitForURL((url) => !url.pathname.endsWith('/login'), { timeout: 10000 })
          .then(() => 'ok' as const)
          .catch(() => 'fail' as const),
        // If code was wrong the error text re-appears quickly.
        page.locator('[class*="destructive"]').waitFor({ state: 'visible', timeout: 3000 })
          .then(() => 'wrong_code' as const)
          .catch(() => 'fail' as const),
      ]);

      if (result === 'ok') { filled = true; break; }
    }

    if (!filled) {
      // Final wait — maybe we already navigated during the loop.
      await page.waitForURL((url) => !url.pathname.endsWith('/login'), { timeout: 15000 });
    }
  } else if (outcome === 'timeout') {
    // Both race legs timed out — surface a useful error.
    throw new Error(
      `Login did not redirect away from /login within 15 s. ` +
      `Check that the app is running and credentials are correct.`,
    );
  }
  // outcome === 'navigated' — normal login without 2FA, already past /login.

  // Confirm we can reach the admin area
  await page.goto('/admin/artists');
  await expect(page.getByRole('heading', { name: 'Artists' }).first()).toBeVisible({ timeout: 15000 });

  // Persist cookies + localStorage so subsequent tests skip the login flow
  await page.context().storageState({ path: STORAGE_STATE });
});
