import { test, expect } from '@playwright/test';

const ARTIST_ID = process.env.E2E_ARTIST_ID;
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || 'admin@tesotunes.com';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || 'password';

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

async function resolveArtistId(page: Parameters<typeof test>[0]['page']): Promise<string> {
  if (ARTIST_ID) {
    return ARTIST_ID;
  }

  await page.goto('/admin/artists');
  await expect(page.getByRole('heading', { name: 'Artists' })).toBeVisible();

  const editLink = page.locator('a[href*="/admin/artists/"][href$="/edit"]').first();
  await expect(editLink).toBeVisible();

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
    test.setTimeout(90000);

    await page.goto('/login');

    const email = page.locator('input#email, input[name="email"]').first();
    const password = page.locator('input#password, input[name="password"]').first();
    await email.fill(ADMIN_EMAIL);
    await password.fill(ADMIN_PASSWORD);

    await page.locator('button[type="submit"]').first().click();
    await page.waitForURL((url) => !url.pathname.startsWith('/login'));
    await expect(page.getByRole('link', { name: 'Artists', exact: true })).toBeVisible();

    const artistId = await resolveArtistId(page);

    await page.goto(`/admin/artists/${artistId}/edit`);
    await expect(page.getByRole('heading', { name: 'Edit Artist' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save Artist Profile' })).toBeVisible();

    const beforeCoverSrcRaw = await page.locator('img[alt="Cover preview"]').first().getAttribute('src').catch(() => null);
    const beforeProfileSrcRaw = await page.locator('img[alt="Profile preview"]').first().getAttribute('src').catch(() => null);
    const beforeCoverSrc = extractRealImageUrl(beforeCoverSrcRaw, page.url());
    const beforeProfileSrc = extractRealImageUrl(beforeProfileSrcRaw, page.url());

    const profileUpload = page.getByTestId('artist-profile-upload');
    const coverUpload = page.getByTestId('artist-cover-upload');

    await expect(profileUpload).toBeVisible();
    await expect(coverUpload).toBeVisible();

    await profileUpload.locator('input[type="file"]').setInputFiles({
      name: `profile-${Date.now()}.png`,
      mimeType: 'image/png',
      buffer: Buffer.from(RED_PNG_BASE64, 'base64'),
    });

    await coverUpload.locator('input[type="file"]').setInputFiles({
      name: `cover-${Date.now()}.png`,
      mimeType: 'image/png',
      buffer: Buffer.from(GREEN_PNG_BASE64, 'base64'),
    });

    const updateResponsePromise = page.waitForResponse((response) => {
      const req = response.request();
      return (
        req.method() === 'POST' &&
        response.url().includes(`/api/admin/artists/${artistId}`) &&
        response.status() === 200
      );
    });

    await page.getByRole('button', { name: 'Save Artist Profile' }).click();

    const updateResponse = await updateResponsePromise;
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
