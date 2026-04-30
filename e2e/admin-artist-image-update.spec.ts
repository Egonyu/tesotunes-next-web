import { test, expect, type Locator } from '@playwright/test';

const ARTIST_ID = process.env.E2E_ARTIST_ID;

// 50×50 solid-color PNGs — must be ≥50px to pass server-side dimension validation
const RED_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAAQ0lEQVR4nO3OMQ0AMAwDsPAnvRHonxyWDMB5yaD+QEtLS0tLa0N/oKWlpaWltaE/0NLS0tLS2tAfaGlpaWlpbegPTh97K7rEaOcNTQAAAABJRU5ErkJggg==';
const GREEN_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAARElEQVR4nO3OMQ0AMAwDsPBHNlgj0D85LBmAk5dF/YGWlpaWltaG/kBLS0tLS2tDf6ClpaWlpbWhP9DS0tLS0trQH1w+rEehih7s10EAAAAASUVORK5CYII=';

function extractRealImageUrl(rawSrc: string | null, currentPageUrl: string): string {
  if (!rawSrc) return '';

  const absolute = new URL(rawSrc, currentPageUrl);
  if (!absolute.pathname.startsWith('/_next/image')) {
    return absolute.toString();
  }

  return decodeURIComponent(absolute.searchParams.get('url') || '');
}

async function getOptionalImageSrc(page: Parameters<typeof test>[0]['page'], selector: string): Promise<string> {
  const image = page.locator(selector).first();
  if ((await image.count()) === 0) return '';
  const src = await image.getAttribute('src');
  return extractRealImageUrl(src, page.url());
}

async function getOptionalLocatorImageSrc(
  page: Parameters<typeof test>[0]['page'],
  locator: Locator
): Promise<string> {
  if ((await locator.count()) === 0) return '';
  const src = await locator.first().getAttribute('src');
  return extractRealImageUrl(src, page.url());
}

async function resolveArtistImageInputs(page: Parameters<typeof test>[0]['page']) {
  const profileByTestId = page.getByTestId('artist-profile-image-input');
  const coverByTestId = page.getByTestId('artist-cover-image-input');

  if ((await profileByTestId.count()) > 0 && (await coverByTestId.count()) > 0) {
    return { profile: profileByTestId.first(), cover: coverByTestId.first() };
  }

  const profileByAria = page.locator('input[type="file"][aria-label="Profile image file"]');
  const coverByAria = page.locator('input[type="file"][aria-label="Cover image file"]');

  if ((await profileByAria.count()) > 0 && (await coverByAria.count()) > 0) {
    return { profile: profileByAria.first(), cover: coverByAria.first() };
  }

  const allFileInputs = page.locator('input[type="file"]');
  const fileInputCount = await allFileInputs.count();

  if (fileInputCount >= 2) {
    return { profile: allFileInputs.nth(0), cover: allFileInputs.nth(1) };
  }

  throw new Error(`Expected at least 2 file inputs on ${page.url()}, found ${fileInputCount}`);
}

async function resolveArtistId(page: Parameters<typeof test>[0]['page']): Promise<string> {
  if (ARTIST_ID) return ARTIST_ID;

  await page.goto('/admin/artists');
  await expect(page.getByRole('heading', { name: 'Artists' })).toBeVisible();

  const editLink = page.locator('a[href*="/admin/artists/"][href$="/edit"]').first();

  try {
    await editLink.waitFor({ timeout: 10000, state: 'visible' });
  } catch {
    throw new Error(
      'No artist found. Ensure at least one artist exists or set E2E_ARTIST_ID.'
    );
  }

  const href = await editLink.getAttribute('href');
  if (!href) throw new Error('Expected an admin artist edit link but none found.');

  const match = href.match(/\/admin\/artists\/(\d+)\/edit$/);
  if (!match) throw new Error(`Could not extract artist id from href: ${href}`);

  return match[1];
}

async function resolveDetailImageLocators(
  page: Parameters<typeof test>[0]['page'],
  artistName: string
) {
  const coverByTestId = page.getByTestId('artist-cover-image').first();
  const avatarByTestId = page.getByTestId('artist-profile-image').first();

  const coverImg = (await coverByTestId.count()) > 0
    ? coverByTestId
    : page.locator(`img[alt="${artistName} cover"]`).first();

  const avatarImg = (await avatarByTestId.count()) > 0
    ? avatarByTestId
    : page.locator(`img[alt="${artistName}"]`).first();

  return { coverImg, avatarImg };
}

async function fetchArtistDetailPayload(
  page: Parameters<typeof test>[0]['page'],
  artistId: string
): Promise<{ cover_url?: string | null; profile_url?: string | null }> {
  return page.evaluate(async (resolvedArtistId) => {
    const response = await fetch(`/api/backend/admin/artists/${resolvedArtistId}`, {
      credentials: 'include',
    });
    if (!response.ok) return {};
    const payload = await response.json() as { data?: { cover_url?: string | null; profile_url?: string | null } };
    return payload.data ?? {};
  }, artistId);
}

test.describe('Admin artist image update', () => {
  test('updates profile and cover images and reflects new URLs', async ({ page }) => {
    test.setTimeout(120000);

    const artistId = await resolveArtistId(page);

    await page.goto(`/admin/artists/${artistId}/edit`);
    await expect(page.getByRole('heading', { name: 'Edit Artist' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: 'Save Artist Profile' })).toBeVisible({ timeout: 10000 });

    const beforeCoverSrc = await getOptionalImageSrc(page, 'img[alt="Cover preview"]');
    const beforeProfileSrc = await getOptionalImageSrc(page, 'img[alt="Profile preview"]');

    const { profile: profileImageInput, cover: coverImageInput } = await resolveArtistImageInputs(page);

    await profileImageInput.setInputFiles({
      name: `profile-${Date.now()}.png`,
      mimeType: 'image/png',
      buffer: Buffer.from(RED_PNG_BASE64, 'base64'),
    });
    expect(await profileImageInput.evaluate((el) => (el as HTMLInputElement).files?.length ?? 0)).toBe(1);

    await coverImageInput.setInputFiles({
      name: `cover-${Date.now()}.png`,
      mimeType: 'image/png',
      buffer: Buffer.from(GREEN_PNG_BASE64, 'base64'),
    });
    expect(await coverImageInput.evaluate((el) => (el as HTMLInputElement).files?.length ?? 0)).toBe(1);

    await page.waitForTimeout(500);

    // Register BEFORE click so we never race against the response.
    // Status is intentionally excluded from the predicate — non-200 responses
    // would previously cause a silent 15s timeout; now they surface as a clear
    // assertion failure on the explicit status check below.
    const updateResponsePromise = page.waitForResponse((response) => {
      const req = response.request();
      const { pathname } = new URL(response.url());
      const matchesEndpoint =
        pathname.endsWith(`/api/admin/artists/${artistId}`) ||
        pathname.endsWith(`/api/backend/admin/artists/${artistId}`);
      return ['POST', 'PUT', 'PATCH'].includes(req.method()) && matchesEndpoint;
    }, { timeout: 30000 });

    await page.getByRole('button', { name: 'Save Artist Profile' }).click();

    const updateResponse = await updateResponsePromise;
    expect(updateResponse.status(), `Artist update returned unexpected status ${updateResponse.status()}`).toBe(200);
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

    if (beforeCoverSrc) expect(updatePayload.data?.cover_url).not.toBe(beforeCoverSrc);
    if (beforeProfileSrc) expect(updatePayload.data?.profile_url).not.toBe(beforeProfileSrc);

    const artistName = updatePayload.data?.name || 'Artist';

    await page.goto(`/admin/artists/${artistId}`);
    await expect(page.locator('h1').filter({ hasText: artistName }).first()).toBeVisible({ timeout: 10000 });

    const { coverImg, avatarImg } = await resolveDetailImageLocators(page, artistName);

    await expect
      .poll(async () => (await fetchArtistDetailPayload(page, artistId)).cover_url || '', {
        timeout: 15000,
        message: `Expected artist cover URL to persist for ${artistName}`,
      })
      .toContain(updatePayload.data?.cover_url || '/storage/artists/covers/');

    await expect
      .poll(async () => (await fetchArtistDetailPayload(page, artistId)).profile_url || '', {
        timeout: 15000,
        message: `Expected artist profile URL to persist for ${artistName}`,
      })
      .toContain(updatePayload.data?.profile_url || '/storage/artists/avatars/');

    const currentCoverUrl = await getOptionalLocatorImageSrc(page, coverImg);
    const currentAvatarUrl = await getOptionalLocatorImageSrc(page, avatarImg);

    if (currentCoverUrl) {
      expect(currentCoverUrl).toContain('?v=');
      expect(currentCoverUrl).toContain(updatePayload.data?.cover_url || '');
    }

    if (currentAvatarUrl) {
      expect(currentAvatarUrl).toContain('?v=');
      expect(currentAvatarUrl).toContain(updatePayload.data?.profile_url || '');
    }
  });
});
