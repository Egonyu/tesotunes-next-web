import { defineConfig, devices } from '@playwright/test';

// path.resolve() works in both ESM and CJS — no __dirname needed
export const ADMIN_STORAGE_STATE = '.playwright/auth/admin.json';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Retry twice on CI — covers transient network hiccups. Login happens only
  // once (in the setup project) so retries do NOT re-burn the rate limit.
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL || 'http://tesotunes.com',
    trace: 'on-first-retry',
  },

  projects: [
    // ── Auth setup — runs once, saves session to disk ──────────────────────
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },

    // ── Admin tests — reuse the saved session, skip login entirely ─────────
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: ADMIN_STORAGE_STATE,
      },
      dependencies: ['setup'],
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: ADMIN_STORAGE_STATE,
      },
      dependencies: ['setup'],
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: ADMIN_STORAGE_STATE,
      },
      dependencies: ['setup'],
    },
  ],
});
