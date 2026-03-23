import { test, expect } from '@playwright/test';

const ARTIST_ID = process.env.E2E_ARTIST_ID;
const ADMIN_EMAIL = (process.env.E2E_ADMIN_EMAIL || '').trim();
const ADMIN_PASSWORD = (process.env.E2E_ADMIN_PASSWORD || '').trim();

const RED_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR42mP8z8AARQABywGf3n6vWQAAAABJRU5ErkJggg==';
const GREEN_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR42mP8/58BAgMDAwB77gM8f8w8uQAAAABJRU5ErkJggg==';

function extractRealImageUrl(rawSrc: string | null, currentPageUrl: string): string {
  if (!rawSrc) return '';

  const absolute = new URL(rawSrc, currentPageUrl);
  if (!absolute.pathname.startsWith('/_next/image')) {
    return absolute.toString();
  }

  const encoded = absolute.searchParams.get('url') || '';
  return decodeURIComponent(encoded);
}

async function getOptionalImageSrc(page: Parameters<typeof test>[0]['page'], selector: string): Promise<string> {
  const image = page.locator(selector).first();
  if ((await image.count()) === 0) {
    return '';
  }

  const src = await image.getAttribute('src');
  return extractRealImageUrl(src, page.url());
}

async function resolveArtistImageInputs(page: Parameters<typeof test>[0]['page']) {
  const profileByTestId = page.getByTestId('artist-profile-image-input');
  const coverByTestId = page.getByTestId('artist-cover-image-input');

  if ((await profileByTestId.count()) > 0 && (await coverByTestId.count()) > 0) {
    return {
      profile: profileByTestId.first(),
      cover: coverByTestId.first(),
    };
  }

  const profileByAria = page.locator('input[type="file"][aria-label="Profile image file"]');
  const coverByAria = page.locator('input[type="file"][aria-label="Cover image file"]');

  if ((await profileByAria.count()) > 0 && (await coverByAria.count()) > 0) {
    return {
      profile: profileByAria.first(),
      cover: coverByAria.first(),
    };
  }

  const allFileInputs = page.locator('input[type="file"]');
  const fileInputCount = await allFileInputs.count();

  if (fileInputCount >= 2) {
    return {
      profile: allFileInputs.nth(0),
      cover: allFileInputs.nth(1),
    };
  }

  throw new Error(`Expected at least 2 file inputs on ${page.url()}, found ${fileInputCount}`);
}

async function resolveArtistId(page: Parameters<typeof test>[0]['page']): Promise<string> {
  if (ARTIST_ID) {
    return ARTIST_ID;
  }

  await page.goto('/admin/artists');
  await expect(page.getByRole('heading', { name: 'Artists' })).toBeVisible();

  // Try to find an artist edit link with a short timeout (10s)
  const editLink = page.locator('a[href*="/admin/artists/"][href$="/edit"]').first();

  try {
    await editLink.waitFor({ timeout: 10000, state: 'visible' });
  } catch {
    throw new Error(
      'No artist found. Please ensure at least one artist exists in the database or set E2E_ARTIST_ID env var. ' +
      'Use env var E2E_ARTIST_ID to specify a specific artist ID for testing.'
    );
  }

  const href = await editLink.getAttribute('href');

  if (!href) {
    throw new Error('Expected at least one admin artist edit link, but none was found.');
  }

  const match = href.match(/\/admin\/artists\/(\d+)\/edit$/);

  if (!match) {
    throw new Error(`Could not extract artist id from href: ${href}`);
  }

  return match[1];
}

test.describe('Admin artist image update', () => {
  test('updates profile and cover images and reflects new URLs', async ({ page }) => {
    test.setTimeout(120000); // Increase to 2 minutes

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error('Missing E2E_ADMIN_EMAIL or E2E_ADMIN_PASSWORD for admin image update E2E test.');
    }

    await page.goto('/login');

    const email = page.locator('input#email, input[name="email"]').first();
    const password = page.locator('input#password, input[name="password"]').first();
    await email.fill(ADMIN_EMAIL);
    await password.fill(ADMIN_PASSWORD);

    await page.locator('button[type="submit"]').first().click();
    const artistsNavLink = page.getByRole('link', { name: 'Artists', exact: true });
    const authError = page.getByText(
      /invalid credentials|invalid email or password|invalid login|authentication failed|unauthorized/i
    ).first();

    const loginOutcome = await Promise.race([
      artistsNavLink.waitFor({ state: 'visible', timeout: 20000 }).then(() => 'ok' as const),
      authError.waitFor({ state: 'visible', timeout: 20000 }).then(() => 'auth_error' as const),
    ]).catch(() => 'timeout' as const);

    if (loginOutcome === 'auth_error') {
      throw new Error(
        'Admin login failed: invalid credentials. Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to valid admin credentials.'
      );
    }

    if (loginOutcome === 'timeout') {
      throw new Error(
        `Admin login did not reach Artists navigation within 20s. Current URL: ${page.url()}`
      );
    }

    await expect(artistsNavLink).toBeVisible({ timeout: 5000 });

    const artistId = await resolveArtistId(page);

    await page.goto(`/admin/artists/${artistId}/edit`);
    await expect(page.getByRole('heading', { name: 'Edit Artist' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: 'Save Artist Profile' })).toBeVisible({ timeout: 10000 });

    const beforeCoverSrc = await getOptionalImageSrc(page, 'img[alt="Cover preview"]');
    const beforeProfileSrc = await getOptionalImageSrc(page, 'img[alt="Profile preview"]');

    const { profile: profileImageInput, cover: coverImageInput } = await resolveArtistImageInputs(page);

    // Set profile image with explicit attachment check
    await profileImageInput.setInputFiles({
      name: `profile-${Date.now()}.png`,
      mimeType: 'image/png',
      buffer: Buffer.from(RED_PNG_BASE64, 'base64'),
    });
    const profileFileCount = await profileImageInput.evaluate((el) => {
      return (el as HTMLInputElement).files?.length ?? 0;
    });
    expect(profileFileCount).toBe(1);

    // Set cover image with explicit attachment check
    await coverImageInput.setInputFiles({
      name: `cover-${Date.now()}.png`,
      mimeType: 'image/png',
      buffer: Buffer.from(GREEN_PNG_BASE64, 'base64'),
    });
    const coverFileCount = await coverImageInput.evaluate((el) => {
      return (el as HTMLInputElement).files?.length ?? 0;
    });
    expect(coverFileCount).toBe(1);

    // Wait a bit for state updates
    await page.waitForTimeout(500);

    const updateResponsePromise = page.waitForResponse((response) => {
      const req = response.request();
      return (
        req.method() === 'POST' &&
        response.url().includes(`/api/admin/artists/${artistId}`) &&
        response.status() === 200
      );
    }, { timeout: 15000 });

    await page.getByRole('button', { name: 'Save Artist Profile' }).click();

    const updateResponse = await updateResponsePromise;
    expect(updateResponse.headers()['content-type'] || '').toContain('application/json');
    const updatePayload = (await updateResponse.json()) as {
      success: boolean;
      data?: { name?: string; profile_url?: string; cover_url?: string };
    };

    expect(updatePayload.success).toBeTruthy();
    expect(updatePayload.data?.profile_url).toContain('/storage/artists/avatars/');
    expect(updatePayload.data?.cover_url).toContain('/storage/artists/covers/');
    expect(updatePayload.data?.profile_url).toContain('?v=');
    expect(updatePayload.data?.cover_url).toContain('?v=');

    if (beforeCoverSrc) {
      expect(updatePayload.data?.cover_url).not.toBe(beforeCoverSrc);
    }
    if (beforeProfileSrc) {
      expect(updatePayload.data?.profile_url).not.toBe(beforeProfileSrc);
    }

    const artistName = updatePayload.data?.name || 'Artist';

    await page.goto(`/admin/artists/${artistId}`);

    const coverImg = page.locator(`img[alt="${artistName} cover"]`).first();
    const avatarImg = page.locator(`img[alt="${artistName}"]`).first();

    await expect(coverImg).toBeVisible();
    await expect(avatarImg).toBeVisible();

    const coverSrc = await coverImg.getAttribute('src');
    const avatarSrc = await avatarImg.getAttribute('src');

    const realCoverUrl = extractRealImageUrl(coverSrc, page.url());
    const realAvatarUrl = extractRealImageUrl(avatarSrc, page.url());

    expect(realCoverUrl).toContain('/storage/artists/covers/');
    expect(realAvatarUrl).toContain('/storage/artists/avatars/');
    expect(realCoverUrl).toContain('?v=');
    expect(realAvatarUrl).toContain('?v=');

    expect(realCoverUrl).toContain(updatePayload.data?.cover_url || '');
    expect(realAvatarUrl).toContain(updatePayload.data?.profile_url || '');
  });
});
