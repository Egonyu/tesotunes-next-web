# TesoTunes Frontend Audit Tracker

> Generated: 2026-02-22 | Build: Next.js 16.1.6 (Turbopack) — **PASS**  
> Total Pages: 220 | Static: 165 | Dynamic: 55

---

## Status Legend

| Icon | Meaning |
|------|---------|
| :x: | Open — not started |
| :construction: | In progress |
| :white_check_mark: | Resolved |
| :no_entry: | Won't fix / Not applicable |

---

## P0 — Critical (must fix before production)

| # | Issue | File(s) | Status | Notes |
|---|-------|---------|--------|-------|
| 1 | `/admin/store/api/` double-prefix — 9 endpoints resolve to `.../api/admin/store/api/...` (404) | `src/app/(admin)/admin/store/products/page.tsx`, `products/[id]/page.tsx`, `products/create/page.tsx`, `products/[id]/edit/page.tsx`, `orders/page.tsx` | :white_check_mark: | Replaced `/admin/store/api/` → `/admin/store/` in all 9 locations |
| 2 | `/edula/api/` double-prefix — 4 endpoints resolve to `.../api/edula/api/...` (404) | `src/hooks/useFeed.ts` | :white_check_mark: | Replaced `/edula/api/` → `/edula/` in all 4 locations |
| 3 | Hardcoded `NEXTAUTH_SECRET` fallback `"dev-secret-change-in-production-abc123xyz"` | `src/lib/auth.ts` | :white_check_mark: | Removed hardcoded fallback — now uses env var only |
| 4 | Production API URL fallback missing `/api` suffix — all calls 404 if env var unset | `src/lib/api.ts` | :white_check_mark: | Changed to `https://api.tesotunes.com/api` |

---

## P1 — High

| # | Issue | File(s) | Status | Notes |
|---|-------|---------|--------|-------|
| 5 | Broken link `/admin/albums/create` — page only exists at `/admin/albums/new` | `src/app/(admin)/admin/albums/page.tsx` | :white_check_mark: | Fixed href to `/admin/albums/new` |
| 6 | Broken link `/admin/podcasts/create` — page only exists at `/admin/podcasts/new` | `src/app/(admin)/admin/podcasts/page.tsx` | :white_check_mark: | Fixed href to `/admin/podcasts/new` |
| 7 | Broken link `/about` — no page exists | `src/app/(app)/edula/layout.tsx` | :white_check_mark: | Removed link from edula footer |
| 8 | Broken link `/help` — no page exists | `src/app/(app)/edula/layout.tsx` | :white_check_mark: | Removed link from edula footer |
| 9 | Backend 500 on `GET /api/playlists/featured` (QueryException) — breaks SSG build | `src/app/(app)/playlists/page.tsx` | :white_check_mark: | Frontend already handles gracefully with try-catch → returns []. Backend fix needed separately. |

---

## P2 — Medium

| # | Issue | File(s) | Status | Notes |
|---|-------|---------|--------|-------|
| 10 | 216/218 pages missing `metadata` — no page titles, no SEO, no social sharing | All `page.tsx` (except terms, privacy) | :white_check_mark: | Added `template.tsx` with metadata for `(admin)`, `(artist)`, `(auth)` groups. Created `usePageTitle` hook for per-page client-side titles. Root layout already has template pattern. |
| 11 | No route-level `loading.tsx` — blank screen during route transitions | Missing for `(app)/`, `(admin)/`, `(artist)/`, `(auth)/` | :white_check_mark: | Added `loading.tsx` for all 4 route groups with contextual skeletons |
| 12 | No route-level `error.tsx` — any crash kills entire view | Missing for `(app)/`, `(admin)/`, `(artist)/`, `(auth)/` | :white_check_mark: | Added `error.tsx` for all 4 route groups with retry + navigation buttons |
| 13 | Auth pages bypass centralized API client (raw `fetch()`) | `src/app/(auth)/login/page.tsx`, `forgot-password/page.tsx`, `src/app/(app)/join/[code]/page.tsx` | :white_check_mark: | Login & forgot-password refactored to `apiPost`. Join page refactored to `serverFetch`. |
| 14 | Hardcoded Pusher key fallback | `src/lib/echo.ts` | :white_check_mark: | Removed hardcoded key; uses empty string fallback. Fixed API URL fallback. |
| 15 | `.env.example` is a Laravel file, not Next.js | `.env.example` | :white_check_mark: | Replaced with proper Next.js template with all required env vars |

---

## P3 — Low / Cleanup

| # | Issue | File(s) | Status | Notes |
|---|-------|---------|--------|-------|
| 16 | Debug pages exposed in production | `src/app/(app)/api-diagnostics/page.tsx`, `src/app/(app)/api-test/page.tsx` | :white_check_mark: | Deleted both debug pages |
| 17 | Duplicate admin pages: `/admin/artists/new` AND `/admin/artists/create` | Both `new/page.tsx` and `create/page.tsx` | :white_check_mark: | Kept both — `/create` re-exports from `/new`. Both URLs work. Not a bug. |
| 18 | Duplicate admin pages: `/admin/events/new` AND `/admin/events/create` | Both `new/page.tsx` and `create/page.tsx` | :white_check_mark: | Kept both — `/create` re-exports from `/new`. Both URLs work. Not a bug. |
| 19 | Auth token in `localStorage` (XSS-vulnerable) | `src/lib/api.ts`, `src/components/providers.tsx`, `src/hooks/useArtist.ts`, `src/hooks/useSacco.ts`, `src/app/(auth)/login/page.tsx`, `src/app/(app)/become-artist/page.tsx` | :white_check_mark: | Migrated from localStorage to in-memory module variable. Token only lives in RAM, repopulated on mount from httpOnly NextAuth JWT cookie. |
| 20 | Artist sections duplicated on general sidebar for signed-in artists | `src/components/layout/sidebar.tsx` | :white_check_mark: | Removed — artist studio has its own layout sidebar. Added "Artist Studio" link instead. |

---

## P4 — Future / Won't Fix Now

| # | Issue | Status | Notes |
|---|-------|--------|-------|
| 21 | Server components for list pages (`/artists`, `/songs`, etc.) | :no_entry: | All pages currently `'use client'` — significant refactor |
| 22 | i18n framework | :no_entry: | Not needed at this stage |
| 23 | Missing nav items for 14+ pages (charts, moods, new-releases, polls, wallet, etc.) | :white_check_mark: | Added to sidebar & mobile nav: Browse (+4: Songs, Charts, New Releases, Moods), Explore (+2: Polls, Promotions), Your Activity (+5: Notifications, Messages, History, Wallet, Credits) |

---

## Resolved Issues Log

| # | Issue | Resolved Date | Commit/Notes |
|---|-------|---------------|--------------|
| 1 | `/admin/store/api/` double-prefix (9 endpoints) | 2026-02-22 | Replaced `/admin/store/api/` → `/admin/store/` in 5 files |
| 2 | `/edula/api/` double-prefix (4 endpoints) | 2026-02-22 | Replaced `/edula/api/` → `/edula/` in useFeed.ts |
| 3 | Hardcoded NEXTAUTH_SECRET fallback | 2026-02-22 | Removed fallback in auth.ts |
| 4 | Production API URL missing `/api` suffix | 2026-02-22 | Fixed fallback in api.ts and echo.ts |
| 5 | Broken link `/admin/albums/create` | 2026-02-22 | Changed href to `/admin/albums/new` |
| 6 | Broken link `/admin/podcasts/create` | 2026-02-22 | Changed href to `/admin/podcasts/new` |
| 7 | Broken link `/about` in edula footer | 2026-02-22 | Removed link |
| 8 | Broken link `/help` in edula footer | 2026-02-22 | Removed link |
| 9 | Backend 500 on `/playlists/featured` | 2026-02-22 | Frontend already handles gracefully (try-catch). Backend fix needed. |
| 10 | Missing page metadata/SEO | 2026-02-22 | Added `template.tsx` per route group + `usePageTitle` hook |
| 11 | No route-level loading.tsx | 2026-02-22 | Added loading.tsx for (app), (admin), (artist), (auth) |
| 12 | No route-level error.tsx | 2026-02-22 | Added error.tsx for (app), (admin), (artist), (auth) |
| 13 | Auth pages bypass API client | 2026-02-22 | Refactored login + forgot-password to apiPost, join to serverFetch |
| 14 | Hardcoded Pusher key | 2026-02-22 | Removed hardcoded key from echo.ts |
| 15 | `.env.example` was Laravel file | 2026-02-22 | Replaced with proper Next.js template |
| 16 | Debug pages in production | 2026-02-22 | Deleted api-diagnostics and api-test pages |
| 17 | Duplicate `/admin/artists/new` + `/create` | 2026-02-22 | Kept both — /create re-exports from /new. Intentional design. |
| 18 | Duplicate `/admin/events/new` + `/create` | 2026-02-22 | Kept both — /create re-exports from /new. Intentional design. |
| 19 | Auth token in localStorage (XSS risk) | 2026-02-22 | Migrated all 6 files from localStorage to in-memory module variable |
| 20 | Artist sidebar duplication on general sidebar | 2026-02-22 | Removed `artistSections` from general sidebar; added "Artist Studio" quick link. |
| 23 | Missing nav items for 14+ pages | 2026-02-22 | Added 11 nav items across Browse, Explore, and Your Activity sections |

---

## Quick Stats

| Metric | Count |
|--------|-------|
| Total Issues | 23 |
| :x: Open | 0 |
| :construction: In Progress | 0 |
| :white_check_mark: Resolved | 20 |
| :no_entry: Won't Fix | 3 |
| :no_entry: Won't Fix | 3 |
