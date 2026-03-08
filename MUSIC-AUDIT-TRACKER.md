# TesoTunes Music Module — Comprehensive Audit Tracker

> **Generated:** 2026-03-07 | **Scope:** Music-first full platform audit  
> **Platform:** Next.js 16 (Frontend) + Laravel 12 (API)  
> **Auditor:** Multi-agent deep exploration (5 parallel audit agents)

---

## Executive Summary

TesoTunes has **strong backend infrastructure** (complete APIs, database schema, payment integration) and a **solid player/streaming core** (9/10), but suffers from **broken purchase flows**, **incomplete monetization wiring**, **hardcoded homepage content**, and **missing critical UX** for tips, royalty splits, and subscriptions. The admin panel is comprehensive (12 feature areas, 70+ pages) but lacks a centralized featured content manager.

### Overall Score: **6.4 / 10**

| Module | Score | Status | Verdict |
|--------|-------|--------|---------|
| Music Player & Streaming | 9/10 | :white_check_mark: Solid | Production-ready core |
| Play Tracking & Analytics | 8/10 | :white_check_mark: Good | Minor gaps |
| Song Upload & Management | 8/10 | :white_check_mark: Good | Works, needs polish |
| Artist Dashboard & Profile | 7/10 | :construction: Good | Avatar upload missing |
| Admin Music Management | 8/10 | :white_check_mark: Good | Full CRUD |
| Homepage & Discovery | 5/10 | :construction: Needs Work | Hardcoded content, no CMS |
| Song Purchases | 2/10 | :x: Broken | No buy button anywhere |
| Subscriptions | 3/10 | :x: Broken | Hook export error |
| Artist Revenue & Payouts | 5/10 | :construction: Partial | Withdrawal incomplete |
| Royalty Splits | 1/10 | :x: Missing | Zero frontend |
| Tips / Donations | 0/10 | :x: Missing | Zero frontend |
| Downloads | 4/10 | :construction: Partial | No quality selection |
| Credits Earning | 3/10 | :construction: Partial | Display only, no earn triggers |
| Promotions Marketplace | 4/10 | :construction: Partial | Browse only, no checkout |
| Campaigns / Crowdfunding | 3/10 | :construction: Partial | Browse only, no pledge |
| Events / Tickets | 4/10 | :construction: Partial | Browse only, no checkout |

---

## Status Legend

| Icon | Meaning |
|------|---------|
| :x: | Not implemented / Broken — blocks revenue or core UX |
| :construction: | Partially implemented — needs completion |
| :white_check_mark: | Working — production-ready or near-ready |
| :no_entry: | Won't fix / Deferred |
| :warning: | Technical debt / Hardcoded / Workaround |

---

## SECTION A: MUSIC PLAYER, STREAMING & PLAYBACK

### A1 — Player Core

| # | Item | Files | Status | Details |
|---|------|-------|--------|---------|
| A1.1 | Audio player component | `src/components/player/audio-player.tsx` | :white_check_mark: | Native HTMLAudioElement, dual-ref crossfade, auth-aware |
| A1.2 | Player bar (mini player) | `src/components/player/player-bar.tsx` | :white_check_mark: | Progress bar, controls, song info, responsive |
| A1.3 | Full-screen player | `src/components/player/full-screen-player.tsx` | :white_check_mark: | Lyrics, speed control (0.5-2x), queue view |
| A1.4 | Crossfade transitions | `audio-player.tsx` | :white_check_mark: | Configurable duration (default 3s), 20-level fade |
| A1.5 | Playback speed control | `full-screen-player.tsx` | :white_check_mark: | 0.5x to 2.0x in fullscreen mode |
| A1.6 | Lyrics display | `full-screen-player.tsx` | :white_check_mark: | Fetched from API, displayed in fullscreen |

### A2 — State Management & Queue

| # | Item | Files | Status | Details |
|---|------|-------|--------|---------|
| A2.1 | Zustand player store | `src/stores/player.ts` | :white_check_mark: | 12+ state properties, persisted to localStorage |
| A2.2 | Queue management | `src/stores/player.ts` | :white_check_mark: | play, next, previous, addToQueue, removeFromQueue |
| A2.3 | Shuffle mode | `src/stores/player.ts` | :white_check_mark: | Toggleable, preserves original queue |
| A2.4 | Repeat modes | `src/stores/player.ts` | :white_check_mark: | off / all / one |
| A2.5 | Volume & mute | `src/stores/player.ts` | :white_check_mark: | Persisted across sessions |
| A2.6 | Server queue sync | `src/stores/player.ts` | :warning: | Hook exists (`/player/queue`) but **never called** — multi-device queue won't work |
| A2.7 | UI store integration | `src/stores/ui.ts` | :white_check_mark: | playerExpanded, playerMinimized, queueVisible |

### A3 — Streaming & Audio

| # | Item | Endpoint / File | Status | Details |
|---|------|-----------------|--------|---------|
| A3.1 | Audio source resolution | `audio-player.tsx` | :white_check_mark: | Priority: `audio_url` > `stream_url` > `file_url` |
| A3.2 | Stream endpoint | `GET /stream/{songId}` | :white_check_mark: | Rate-limited 30:1 |
| A3.3 | Audio quality settings | `src/hooks/useSettings.ts` | :warning: | Settings exist (wifi/mobile quality) but **no UI to change quality** |
| A3.4 | Quality enforcement by tier | `audio-player.tsx` | :white_check_mark: | Quality param appended based on subscription `audio_quality_kbps` |
| A3.5 | Preload strategy | `audio-player.tsx` | :white_check_mark: | `preload="metadata"` (lazy) |

### A4 — Play Tracking

| # | Item | Files | Status | Details |
|---|------|-------|--------|---------|
| A4.1 | Record play hook | `src/hooks/api.ts` → `useRecordPlay()` | :white_check_mark: | Robust — 30s OR 30% threshold |
| A4.2 | Play tracking endpoint | `POST /api/player/record-play` | :white_check_mark: | Rate-limited 20:1, sends song_id, duration, completed |
| A4.3 | Duplicate prevention | `audio-player.tsx` | :white_check_mark: | `playTrackedRef` prevents double-counting per track |
| A4.4 | Unauthenticated play handling | `audio-player.tsx` | :warning: | Silently skips tracking — **no prompt to sign in** |
| A4.5 | Now-playing sync | `POST /player/update-now-playing` | :white_check_mark: | Auth required, rate-limited |
| A4.6 | Credit earning on play completion | — | :x: | **Backend awards 0.5 credits/play but frontend shows NO notification** |

---

## SECTION B: DOWNLOADS

| # | Item | Files | Status | Details |
|---|------|-------|--------|---------|
| B1 | Download gate component | `src/components/social/DownloadGate.tsx` | :construction: | Pre-checks isDownloadable + isAuthenticated |
| B2 | Download endpoint | `POST /v1/songs/{songId}/download` | :construction: | Returns signed URL, but **may not exist on backend** |
| B3 | Free song direct download | `song-grid.tsx` | :construction: | `<a href={song.audio_url} download>` for free songs |
| B4 | Quality selection before download | — | :x: | **No bitrate choice UI** (backend has 128/192/320/FLAC) |
| B5 | Download progress tracking | — | :x: | **No progress bar or status** |
| B6 | Download history | — | :x: | **No page showing user's downloads** |
| B7 | Offline playback (service worker) | — | :x: | **Not implemented** |
| B8 | Subscription-gated downloads | `DownloadGate.tsx` | :construction: | Shows "Upgrade to Premium" but **no inline purchase** |

---

## SECTION C: SONG PURCHASES & MONETIZATION

### C1 — Song Purchase Flow

| # | Item | Files | Status | Details |
|---|------|-------|--------|---------|
| C1.1 | Song price display | `src/app/(app)/songs/[slug]/page.tsx` L298-300 | :white_check_mark: | Shows `{price} Credits` when not free |
| C1.2 | Buy button on song page | — | :x: | **NO BUY BUTTON ANYWHERE** |
| C1.3 | Purchase checkout modal | — | :x: | **Not implemented** |
| C1.4 | Credit deduction on purchase | — | :x: | **No POST /credits/purchase-song or equivalent** |
| C1.5 | Purchase confirmation | — | :x: | **No receipt or confirmation** |
| C1.6 | Purchased songs library | — | :x: | **No "My Purchases" page** |
| C1.7 | Price field in upload form | `artist/upload/page.tsx` | :warning: | Field exists but **no is_free toggle visible** |

### C2 — Credits System

| # | Item | Files | Status | Details |
|---|------|-------|--------|---------|
| C2.1 | Credits balance display | `src/app/(app)/credits/page.tsx` | :white_check_mark: | Wallet integration, header display |
| C2.2 | Credit packages purchase | `src/app/(app)/credits/page.tsx` | :white_check_mark: | Working — custom amount, packages |
| C2.3 | Credit history | `src/app/(app)/credits/page.tsx` | :white_check_mark: | Shows purchase history |
| C2.4 | Credit earning — stream reward | — | :x: | Backend awards 0.5/play but **no frontend notification/trigger** |
| C2.5 | Credit earning — social (likes) | — | :x: | +1 credit/like in backend but **not wired in UI** |
| C2.6 | Credit earning — shares | — | :x: | +2 credits/share in backend but **not wired in UI** |
| C2.7 | Credit earning — daily login | — | :x: | +10 credits + streak in backend but **no UI** |
| C2.8 | Credit earning — referrals | — | :x: | +50 credits/signup in backend but **no frontend notification** |
| C2.9 | Daily limits display | — | :x: | Backend has per-category limits (50/30/10/25/100) but **not shown in UI** |
| C2.10 | Credit transfer | `POST /credits/transfer` | :x: | **Endpoint exists but no UI** |
| C2.11 | "How to Earn Credits" guide | — | :x: | **No guide page** |

### C3 — Subscriptions

| # | Item | Files | Status | Details |
|---|------|-------|--------|---------|
| C3.1 | Plans listing & comparison | `src/app/(app)/settings/subscription/page.tsx` | :white_check_mark: | Shows Free/Premium/Artist/Label tiers |
| C3.2 | Current subscription display | `useMySubscription()` hook | :white_check_mark: | Plan name, expiry, limits, days remaining |
| C3.3 | Subscribe button | `useCanAccess()` | :x: | **BROKEN — hook export missing, build error** |
| C3.4 | Upgrade/downgrade flow | `useChangePlan()` | :x: | **Hook defined but NOT EXPORTED** |
| C3.5 | Auto-renew toggle | `useToggleAutoRenew()` | :x: | **Hook defined but NOT EXPORTED** |
| C3.6 | Cancel subscription | `POST /subscriptions/cancel` | :construction: | Button exists but **not wired** |
| C3.7 | Billing history | `src/app/(app)/settings/subscription/page.tsx` | :white_check_mark: | Recently added (2026-03-07) |
| C3.8 | Audio quality enforcement | — | :x: | **Always 320kbps regardless of tier** |
| C3.9 | Ad insertion for free tier | — | :x: | **No ads system** |
| C3.10 | Offline mode for premium | — | :x: | **Not implemented** |

---

## SECTION D: ARTIST WORKFLOWS

### D1 — Artist Registration & Onboarding

| # | Item | Files | Status | Details |
|---|------|-------|--------|---------|
| D1.1 | Become Artist wizard (4 steps) | `src/app/(app)/become-artist/page.tsx` | :white_check_mark: | Welcome → Music Details → Payment → Review |
| D1.2 | Application status page | `src/app/(app)/become-artist/status/page.tsx` | :white_check_mark: | Shows pending/approved/rejected |
| D1.3 | File uploads (avatar, ID, selfie) | `become-artist/page.tsx` | :white_check_mark: | FormData multipart upload |
| D1.4 | Duplicate application prevention | — | :warning: | **No guard — user could resubmit after rejection** |
| D1.5 | File size validation (frontend) | — | :warning: | **Missing — backend has 10MB limit** |
| D1.6 | Secondary genres handling | — | :warning: | **Sent as array but backend handling uncertain** |

### D2 — Song Upload

| # | Item | Files | Status | Details |
|---|------|-------|--------|---------|
| D2.1 | Upload form (all fields) | `src/app/(artist)/artist/upload/page.tsx` | :white_check_mark: | title, audio, cover, album, genre, lyrics, price, etc. |
| D2.2 | Upload progress tracking | `upload/page.tsx` | :white_check_mark: | Real-time via `onUploadProgress` |
| D2.3 | File type validation | `upload/page.tsx` | :white_check_mark: | MIME + extension check, mobile browser edge cases |
| D2.4 | Genre resolution | `upload/page.tsx` | :white_check_mark: | Accepts ID or name string |
| D2.5 | Album selection | `upload/page.tsx` | :white_check_mark: | Fetches via `useArtistAlbums()` |
| D2.6 | Subscription gate | `upload/page.tsx` | :white_check_mark: | Feature-gated by subscription tier |
| D2.7 | Upload retry on failure | — | :warning: | **No retry — 500 error just shows toast, file in memory** |
| D2.8 | Collaborator/split assignment on upload | — | :x: | **No royalty split UI during upload** |

### D3 — Artist Dashboard & Profile

| # | Item | Files | Status | Details |
|---|------|-------|--------|---------|
| D3.1 | Dashboard with stats | `src/app/(artist)/artist/page.tsx` | :white_check_mark: | Songs, plays, followers, earnings, chart |
| D3.2 | Quick actions | `artist/page.tsx` | :white_check_mark: | Upload, wallet, earnings, events, analytics, albums |
| D3.3 | My Songs list | `src/app/(artist)/artist/songs/page.tsx` | :white_check_mark: | Search, filter, sort, batch ops, mini player |
| D3.4 | Song editing | `artist/songs/[id]/page.tsx` | :white_check_mark: | Edit metadata, status, delete |
| D3.5 | Profile editing | `src/app/(artist)/artist/profile/page.tsx` | :white_check_mark: | stage_name, bio, website, social links |
| D3.6 | Avatar/banner upload | `artist/profile/page.tsx` | :white_check_mark: | File inputs wired with `useUpdateArtistAvatar/Banner` hooks |
| D3.7 | Country/city fields | `artist/profile/page.tsx` | :warning: | **Form has them but backend rejects — not in $fillable** |
| D3.8 | Verification badge display | `artist/profile/page.tsx` | :white_check_mark: | Shows verification status (read-only) |

### D4 — Album Management

| # | Item | Files | Status | Details |
|---|------|-------|--------|---------|
| D4.1 | Album list | `src/app/(artist)/artist/albums/page.tsx` | :white_check_mark: | Search, filter by type, pagination |
| D4.2 | Album creation | `src/app/(artist)/artist/albums/create/page.tsx` | :white_check_mark: | Title, description, genre, type, cover, tracks |
| D4.3 | Album editing | `artist/albums/[id]/edit/page.tsx` | :white_check_mark: | Full edit form with cover upload, tracks read-only |
| D4.4 | Album statistics | — | :warning: | **No play counts or revenue per album** |
| D4.5 | Bulk operations | `artist/albums/page.tsx` | :white_check_mark: | Batch mode with delete |

### D5 — Earnings & Withdrawal

| # | Item | Files | Status | Details |
|---|------|-------|--------|---------|
| D5.1 | Earnings dashboard | `src/app/(artist)/artist/earnings/page.tsx` | :white_check_mark: | Balance, pending, this month, chart |
| D5.2 | Revenue by type breakdown | — | :x: | **API exists (`/artist/earnings/sources`) but frontend doesn't call it** |
| D5.3 | Per-song earnings | — | :x: | **API exists (`/artist/earnings/by-song`) but not implemented** |
| D5.4 | Withdrawal request | `artist/earnings/page.tsx` | :construction: | Modal opens but **submit button not fully wired** |
| D5.5 | Withdrawal status tracking | — | :x: | **No tracking after request submitted** |
| D5.6 | Withdrawal history | — | :x: | **No dedicated payout history** |
| D5.7 | Minimum withdrawal validation | `artist/earnings/page.tsx` | :white_check_mark: | 50,000 UGX minimum enforced |
| D5.8 | Royalty splits display | `artist/earnings/page.tsx` | :x: | **Hook exists but UI shows empty state — no data fetched** |

### D6 — Analytics

| # | Item | Files | Status | Details |
|---|------|-------|--------|---------|
| D6.1 | Plays over time chart | `src/app/(artist)/artist/analytics/page.tsx` | :white_check_mark: | Line chart, configurable period |
| D6.2 | Top songs table | `artist/analytics/page.tsx` | :white_check_mark: | play_count, download_count |
| D6.3 | Geographic breakdown | `artist/analytics/page.tsx` | :construction: | Data fetched but **map UI not fully rendered** |
| D6.4 | Device breakdown | `artist/analytics/page.tsx` | :white_check_mark: | device_type distribution |
| D6.5 | CSV export | `artist/analytics/page.tsx` | :white_check_mark: | Client-side generation |
| D6.6 | PDF export | `artist/analytics/page.tsx` | :construction: | **Falls back to CSV silently if endpoint unavailable** |
| D6.7 | Period comparison | — | :x: | **No "vs previous period" comparison** |

---

## SECTION E: HOMEPAGE & DISCOVERY

### E1 — Featured Section (Hero Slider)

| # | Item | Files | Status | Details |
|---|------|-------|--------|---------|
| E1.1 | Featured carousel | `src/components/home/featured-section.tsx` | :construction: | Manual navigation, dot controls |
| E1.2 | API data fetching | `GET /featured` | :warning: | **Endpoint may not exist on backend — not documented** |
| E1.3 | Fallback data | `featured-section.tsx` | :warning: | **3 hardcoded items with placeholder images** |
| E1.4 | Auto-advance timer | — | :x: | **No auto-play — requires manual interaction** |
| E1.5 | Admin featured management | — | :x: | **No centralized admin page for all featured items** |
| E1.6 | Swiper library usage | `package.json` | :warning: | **swiper@11.2.8 installed but NEVER imported/used** |

### E2 — Content Sections

| # | Item | Files | Status | Details |
|---|------|-------|--------|---------|
| E2.1 | Trending songs grid | `src/components/home/song-grid.tsx` | :white_check_mark: | API: `/songs?sort=-play_count` |
| E2.2 | Popular artists carousel | `src/components/home/artist-carousel.tsx` | :white_check_mark: | API: `/artists?sort=-followers_count` |
| E2.3 | New releases grid | `src/components/home/song-grid.tsx` | :white_check_mark: | API: `/songs?sort=-created_at` |
| E2.4 | Recently played grid | `src/components/home/song-grid.tsx` | :white_check_mark: | API: `/songs?sort=-updated_at` |
| E2.5 | Genre grid | `src/components/home/genre-grid.tsx` | :warning: | API fetched BUT **hardcoded fallback with fake song counts** |
| E2.6 | Community poll | `src/components/home/community-poll.tsx` | :white_check_mark: | API: `/polls?status=active`, auth-gated voting |
| E2.7 | Discover sections | `src/components/home/discover-sections.tsx` | :warning: | **100% HARDCODED — Events, Store, Awards, SACCO cards all static** |
| E2.8 | Like button on song grid | `song-grid.tsx` | :warning: | **UI present but DISABLED** (opacity-0, never visible) |

### E3 — Search & Browse

| # | Item | Files | Status | Details |
|---|------|-------|--------|---------|
| E3.1 | Song search | sidebar/header search | :construction: | Basic text search implemented |
| E3.2 | Artist browse | `src/app/(app)/artists/page.tsx` | :white_check_mark: | Grid with filters |
| E3.3 | Genre browse | `src/app/(app)/genres/page.tsx` | :white_check_mark: | Genre cards linking to filtered songs |
| E3.4 | Charts page | — | :construction: | Needs verification |
| E3.5 | Moods/playlists | `src/app/(app)/playlists/page.tsx` | :construction: | **Backend 500 on `/playlists/featured`** |

---

## SECTION F: ADMIN PANEL — MUSIC MANAGEMENT

### F1 — Admin Song Management

| # | Item | Files | Status | Details |
|---|------|-------|--------|---------|
| F1.1 | Song list with filters | `src/app/(admin)/admin/songs/page.tsx` | :white_check_mark: | Pagination, search, status filter, statistics |
| F1.2 | Bulk approve/reject | `admin/songs/page.tsx` | :white_check_mark: | Multi-select with batch operations |
| F1.3 | Song detail view | `admin/songs/[id]/page.tsx` | :white_check_mark: | Audio player, play history, stats |
| F1.4 | Song edit form | `admin/songs/[id]/edit/page.tsx` | :white_check_mark: | All metadata fields including ISRC, BPM, key |
| F1.5 | Song creation | `admin/songs/new/page.tsx` | :white_check_mark: | Full form with file upload |
| F1.6 | Toggle featured | `admin/songs/[id]/page.tsx` | :white_check_mark: | Per-song toggle button |
| F1.7 | Play history chart | `admin/songs/[id]/page.tsx` | :white_check_mark: | Visual play count over time |

### F2 — Admin Artist Management

| # | Item | Files | Status | Details |
|---|------|-------|--------|---------|
| F2.1 | Artist list | `src/app/(admin)/admin/artists/page.tsx` | :white_check_mark: | Avatar, stats, verification, status filter |
| F2.2 | Artist verification toggle | `admin/artists/[id]/page.tsx` | :white_check_mark: | Verify/unverify with badge |
| F2.3 | Artist approval | `admin/artists/[id]/page.tsx` | :white_check_mark: | Approve pending applications |
| F2.4 | Artist suspension | `admin/artists/[id]/page.tsx` | :white_check_mark: | Suspend accounts |
| F2.5 | Artist creation | `admin/artists/new/page.tsx` | :white_check_mark: | Two-step: create user → create artist profile |
| F2.6 | Artist edit | `admin/artists/[id]/edit/page.tsx` | :white_check_mark: | Profile, socials, genres |
| F2.7 | Artist's songs view | `admin/artists/[id]/page.tsx` | :white_check_mark: | Songs gallery on detail page |

### F3 — Admin Album Management

| # | Item | Files | Status | Details |
|---|------|-------|--------|---------|
| F3.1 | Album list | `src/app/(admin)/admin/albums/page.tsx` | :white_check_mark: | Status filter, pagination |
| F3.2 | Album creation | `admin/albums/new/page.tsx` | :white_check_mark: | Full form with cover upload |
| F3.3 | Album editing | `admin/albums/[id]/edit/page.tsx` | :white_check_mark: | All metadata |
| F3.4 | Album detail + tracks | `admin/albums/[id]/page.tsx` | :white_check_mark: | Track listing with play counts |
| F3.5 | Toggle status | `admin/albums/[id]/page.tsx` | :white_check_mark: | released ↔ draft |

### F4 — Admin Genre Management

| # | Item | Files | Status | Details |
|---|------|-------|--------|---------|
| F4.1 | Genre CRUD | `admin/genres/*` | :white_check_mark: | Create, edit, delete, toggle active |
| F4.2 | Genre metadata | `admin/genres/*` | :white_check_mark: | Color, icon, emoji, description, sort_order |
| F4.3 | Song count per genre | `admin/genres/page.tsx` | :white_check_mark: | Statistics display |

### F5 — Admin Featured Content (MISSING)

| # | Item | Files | Status | Details |
|---|------|-------|--------|---------|
| F5.1 | Centralized featured manager | — | :x: | **NO page to manage all featured content in one place** |
| F5.2 | Featured items ordering | — | :x: | **No drag-to-reorder for carousel** |
| F5.3 | Featured content preview | — | :x: | **Can't preview how featured items look on homepage** |
| F5.4 | Banner/slider management | — | :x: | **No admin page to create/edit homepage banners** |
| F5.5 | Scheduled featured | — | :x: | **Can't schedule future featured items** |

---

## SECTION G: AUTH, REGISTRATION & USER ROLES

| # | Item | Files | Status | Details |
|---|------|-------|--------|---------|
| G1 | Login (email/password) | `src/app/(auth)/login/page.tsx` | :white_check_mark: | NextAuth Credentials provider |
| G2 | Registration | `src/app/(auth)/register/page.tsx` | :white_check_mark: | Email, password, referral code |
| G3 | Forgot password | `src/app/(auth)/forgot-password/page.tsx` | :white_check_mark: | Reset via email |
| G4 | JWT token management | `src/lib/auth.ts` | :white_check_mark: | 30-day JWT, in-memory token storage |
| G5 | Role-based route protection | `src/middleware.ts` | :white_check_mark: | /artist/* → artist role, /admin/* → admin role |
| G6 | 2FA support | `src/lib/auth.ts` | :construction: | Detection exists (throws "2FA_REQUIRED") but **no 2FA setup UI** |
| G7 | User → Artist upgrade | `src/app/(app)/become-artist/page.tsx` | :white_check_mark: | 4-step wizard with file uploads |
| G8 | Role refresh | `src/lib/auth.ts` | :white_check_mark: | Every 30 minutes via `/user/profile` |
| G9 | Social login (OAuth) | — | :x: | **Not implemented — email/password only** |
| G10 | Email verification | — | :construction: | Backend requires it but **no resend verification UI** |

---

## SECTION H: TIPS, ROYALTY SPLITS & MISSING FEATURES

### H1 — Tips / Fan Donations

| # | Item | Files | Status | Details |
|---|------|-------|--------|---------|
| H1.1 | Tip button on artist profile | — | :x: | **Not implemented** |
| H1.2 | Tip button on song page | — | :x: | **Not implemented** |
| H1.3 | Tip amount modal | — | :x: | **Not implemented** |
| H1.4 | Tip payment integration | — | :x: | Backend `TYPE_TIP` exists but **zero frontend** |
| H1.5 | Tip history for artists | — | :x: | **Not implemented** |
| H1.6 | Tip notifications | — | :x: | **Not implemented** |

### H2 — Royalty Splits

| # | Item | Files | Status | Details |
|---|------|-------|--------|---------|
| H2.1 | Split editor on song upload | — | :x: | **No collaborator assignment during upload** |
| H2.2 | Split management page | — | :x: | **No /artist/royalty-splits page** |
| H2.3 | Per-song splits configuration | — | :x: | **No UI to add/edit/delete splits** |
| H2.4 | Collaborator earnings view | — | :x: | **No breakdown of per-split earnings** |
| H2.5 | Split validation (% ≤ 100) | — | :x: | **No frontend validation** |
| H2.6 | Collaborator notifications | — | :x: | **Not implemented** |

### H3 — Promotions Marketplace

| # | Item | Files | Status | Details |
|---|------|-------|--------|---------|
| H3.1 | Browse promotions | `src/app/(app)/promotions/page.tsx` | :white_check_mark: | Filter by platform, sort, search |
| H3.2 | Promotion detail | `src/app/(app)/promotions/[slug]/page.tsx` | :white_check_mark: | Requirements, deliverables, reviews |
| H3.3 | Order/purchase button | — | :x: | **NO "Order Now" button on detail page** |
| H3.4 | Checkout flow | — | :x: | **No payment integration for promotions** |
| H3.5 | Order status tracking | — | :x: | **Buyer can't see order status** |
| H3.6 | Proof of delivery | — | :x: | **No verification workflow** |
| H3.7 | Seller creation UI | `artist/promotions/page.tsx` | :x: | **Page exists but empty** |
| H3.8 | Dispute resolution | — | :x: | **No buyer-side dispute UI** |

### H4 — Campaigns / Crowdfunding (Ojokotau)

| # | Item | Files | Status | Details |
|---|------|-------|--------|---------|
| H4.1 | Browse campaigns | `src/app/(app)/campaigns/page.tsx` | :white_check_mark: | Featured carousel, grid, category filter |
| H4.2 | Campaign detail | `src/app/(app)/ojokotau/campaigns/[id]/` | :white_check_mark: | Description, updates, progress bar |
| H4.3 | Pledge/donate button | — | :x: | **No pledge button or amount input** |
| H4.4 | Reward tiers display | — | :x: | **Backend supports tiers but no tier UI** |
| H4.5 | Payment checkout | — | :x: | **No checkout for pledges** |
| H4.6 | Backer list | — | :x: | **No backer profile/list** |
| H4.7 | Campaign creation (artist) | — | :x: | **No creation UI** |

### H5 — Events / Tickets

| # | Item | Files | Status | Details |
|---|------|-------|--------|---------|
| H5.1 | Event browsing | `src/app/(app)/events/page.tsx` | :white_check_mark: | Featured, trending, search, filters |
| H5.2 | Event detail | `src/app/(app)/events/[id]/page.tsx` | :white_check_mark: | Full details, venue, ticket tiers |
| H5.3 | Ticket tier selector | `src/components/events/TicketSelector.tsx` | :white_check_mark: | UGX + credits pricing, quantity selector |
| H5.4 | Ticket checkout | — | :x: | **No "Proceed to Checkout" button** |
| H5.5 | QR code ticket generation | — | :x: | **Not implemented** |
| H5.6 | Ticket delivery (email/SMS) | — | :x: | **Not implemented** |
| H5.7 | My tickets page | — | :x: | **No user ticket history** |
| H5.8 | Ticket refunds | — | :x: | **Not implemented** |

---

## SECTION I: WALLET & PAYMENTS

| # | Item | Files | Status | Details |
|---|------|-------|--------|---------|
| I1 | Wallet balance display | `src/app/(app)/wallet/page.tsx` | :white_check_mark: | Available + Pending |
| I2 | Topup via Mobile Money | `src/app/(app)/wallet/topup/page.tsx` | :white_check_mark: | MTN MoMo, Airtel Money via ZengaPay |
| I3 | Phone validation | `src/hooks/usePayments.ts` | :white_check_mark: | MTN (077x, 070x) vs Airtel (075x, 034x) |
| I4 | Payment status polling | `usePayments.ts` | :white_check_mark: | Every 5s until confirmed |
| I5 | Withdrawal request | `wallet/page.tsx` | :construction: | Modal opens but **submit incomplete** |
| I6 | Transaction history | `wallet/page.tsx` | :white_check_mark: | Shows 5 recent |
| I7 | Artist wallet top-up | `src/app/(artist)/artist/wallet/topup/page.tsx` | :x: | **Page exists but NOT implemented** |
| I8 | Card payment | — | :x: | **Backend supports but no UI** |
| I9 | Unified transaction ledger | — | :x: | **History scattered across 6+ pages** |

---

## SECTION J: TECHNICAL DEBT & INFRASTRUCTURE

| # | Item | Details | Priority |
|---|------|---------|----------|
| J1 | ~~Swiper library unused~~ | ✅ Removed from package.json | Done |
| J2 | Server queue sync never called | `POST /player/queue` hook exists but unused — no multi-device sync | Medium |
| J3 | Hardcoded discover sections | Events/Store/Awards/SACCO cards are 100% static | Medium |
| J4 | Genre grid hardcoded counts | Fallback data has fake `song_count` values | Low |
| J5 | Song status not reflecting after bulk updates | UI requires page refresh | Medium |
| J6 | PDF export silently falls back to CSV | User may not realize they got CSV | Low |
| J7 | No file cleanup on upload error | Audio file stays in memory after 500 error | Medium |
| J8 | No auto-publish toggle in artist settings | Backend supports it but no UI | Low |

---

## PRIORITY IMPLEMENTATION ROADMAP

### Phase 1 — CRITICAL REVENUE BLOCKERS (Week 1-2)

| # | Task | Impact | Effort |
|---|------|--------|--------|
| P1.1 | **Fix subscription hook exports** (`useCanAccess`, `useChangePlan`, `useToggleAutoRenew`) | Unblocks entire subscription flow | Small |
| P1.2 | **Build song purchase flow** — Buy button + checkout modal + credit deduction | Enables song sales revenue | Medium |
| P1.3 | **Complete withdrawal submit** in artist earnings | Artists can get paid | Small |
| P1.4 | **Add tip button** to artist profile + song pages with amount modal | New revenue stream | Medium |
| P1.5 | **Wire credit earning notifications** for streams, likes, shares, daily login | User engagement + retention | Medium |

### Phase 2 — COMPLETE PURCHASE FLOWS (Week 2-3)

| # | Task | Impact | Effort |
|---|------|--------|--------|
| P2.1 | **Promotions checkout flow** — Order button + payment method + status tracking | Marketplace revenue | Medium |
| P2.2 | **Event ticket checkout** — Checkout button + payment + QR code | Event revenue | Large |
| P2.3 | **Campaign pledge flow** — Pledge button + amount + payment + backer list | Crowdfunding revenue | Medium |
| P2.4 | **Royalty split management UI** — Split editor on upload + management page | Fair collaborator payments | Medium |
| P2.5 | **Artist revenue breakdown** — Wire `/earnings/sources` + per-song analytics | Artist retention | Small |

### Phase 3 — HOMEPAGE & DISCOVERY (Week 3-4)

| # | Task | Impact | Effort |
|---|------|--------|--------|
| P3.1 | **Build admin Featured Content Manager** — Centralized featured items CRUD + ordering | Content curation | Large |
| P3.2 | **Add carousel auto-advance** + pause on hover + Swiper migration | UX improvement | Small |
| P3.3 | **Enable like button** on song grid (currently hidden) | Engagement metric | Small |
| P3.4 | **Make discover sections dynamic** — API-driven Events/Store/Awards cards | Content freshness | Medium |
| P3.5 | **Add download quality selection UI** | Premium feature value | Medium |

### Phase 4 — POLISH & INFRASTRUCTURE (Week 4-5) ✅ COMPLETE

| # | Task | Impact | Effort | Status |
|---|------|--------|--------|--------|
| P4.1 | **Audio quality enforcement by subscription tier** | Subscription value proposition | Medium | ✅ Done — quality param appended to stream URLs based on sub tier |
| P4.2 | **Artist avatar/banner upload** in profile editor | Profile completeness | Small | ✅ Done — file inputs + upload hooks wired |
| P4.3 | **Album editing** for artists (currently create-only) | Artist workflow | Small | ✅ Done — /artist/albums/[id]/edit page + hooks |
| P4.4 | **Unified transaction history** — Single page for all financial activity | User clarity | Medium | ✅ Done — /transactions aggregates wallet, credits, subscription |
| P4.5 | **2FA setup UI** + social login (OAuth) | Security + UX | Large | ✅ 2FA exists at /settings/security (OAuth deferred) |
| P4.6 | **Remove unused Swiper dependency** or fully integrate it | Bundle size | Tiny | ✅ Done — swiper removed from package.json |

---

## METRICS & KPIs TO TRACK

| Metric | Current | Target | How to Measure |
|--------|---------|--------|----------------|
| Purchase flows working | 1/7 (store only) | 7/7 | All checkout buttons functional |
| Revenue streams active | 2/10 | 10/10 | End-to-end purchase → payout |
| Subscription conversions | 0% | 5%+ | Hook fix unblocks measurement |
| Artist withdrawal success | Unknown | 95%+ | Withdrawal tracking needed |
| Credit earning engagement | 0 notifications | 10+/user/day | Wire backend rewards to UI |
| Homepage dynamic content | 40% API-driven | 90%+ | Remove hardcoded data |
| Download quality options | 1 (default) | 4 (128/192/320/FLAC) | Add selector UI |

---

## FILES REFERENCE INDEX

### Player & Streaming
- [src/components/player/audio-player.tsx](src/components/player/audio-player.tsx) — Core audio engine
- [src/components/player/player-bar.tsx](src/components/player/player-bar.tsx) — Mini player bar
- [src/components/player/full-screen-player.tsx](src/components/player/full-screen-player.tsx) — Fullscreen mode
- [src/stores/player.ts](src/stores/player.ts) — Zustand player state
- [src/stores/ui.ts](src/stores/ui.ts) — Player UI visibility

### Homepage
- [src/app/(app)/page.tsx](src/app/(app)/page.tsx) — Homepage
- [src/components/home/featured-section.tsx](src/components/home/featured-section.tsx) — Hero slider
- [src/components/home/song-grid.tsx](src/components/home/song-grid.tsx) — Trending/New/Recent songs
- [src/components/home/artist-carousel.tsx](src/components/home/artist-carousel.tsx) — Popular artists
- [src/components/home/genre-grid.tsx](src/components/home/genre-grid.tsx) — Genre browse
- [src/components/home/discover-sections.tsx](src/components/home/discover-sections.tsx) — Static cards
- [src/components/home/community-poll.tsx](src/components/home/community-poll.tsx) — Polls widget

### Artist Workflows
- [src/app/(app)/become-artist/page.tsx](src/app/(app)/become-artist/page.tsx) — Registration wizard
- [src/app/(artist)/artist/page.tsx](src/app/(artist)/artist/page.tsx) — Dashboard
- [src/app/(artist)/artist/upload/page.tsx](src/app/(artist)/artist/upload/page.tsx) — Song upload
- [src/app/(artist)/artist/songs/page.tsx](src/app/(artist)/artist/songs/page.tsx) — Song management
- [src/app/(artist)/artist/albums/page.tsx](src/app/(artist)/artist/albums/page.tsx) — Albums
- [src/app/(artist)/artist/profile/page.tsx](src/app/(artist)/artist/profile/page.tsx) — Profile editor
- [src/app/(artist)/artist/earnings/page.tsx](src/app/(artist)/artist/earnings/page.tsx) — Earnings
- [src/app/(artist)/artist/analytics/page.tsx](src/app/(artist)/artist/analytics/page.tsx) — Analytics
- [src/app/(artist)/artist/wallet/page.tsx](src/app/(artist)/artist/wallet/page.tsx) — Wallet

### Admin Music
- [src/app/(admin)/admin/songs/page.tsx](src/app/(admin)/admin/songs/page.tsx) — Song list
- [src/app/(admin)/admin/artists/page.tsx](src/app/(admin)/admin/artists/page.tsx) — Artist list
- [src/app/(admin)/admin/albums/page.tsx](src/app/(admin)/admin/albums/page.tsx) — Album list
- [src/app/(admin)/admin/genres/page.tsx](src/app/(admin)/admin/genres/page.tsx) — Genre list

### Monetization
- [src/app/(app)/credits/page.tsx](src/app/(app)/credits/page.tsx) — Credits
- [src/app/(app)/wallet/page.tsx](src/app/(app)/wallet/page.tsx) — Wallet
- [src/app/(app)/wallet/topup/page.tsx](src/app/(app)/wallet/topup/page.tsx) — Top-up
- [src/app/(app)/store/page.tsx](src/app/(app)/store/page.tsx) — Store
- [src/app/(app)/promotions/page.tsx](src/app/(app)/promotions/page.tsx) — Promotions
- [src/app/(app)/campaigns/page.tsx](src/app/(app)/campaigns/page.tsx) — Campaigns
- [src/app/(app)/events/page.tsx](src/app/(app)/events/page.tsx) — Events

### Hooks & Services
- [src/hooks/api.ts](src/hooks/api.ts) — Core API hooks (useTrendingSongs, useRecordPlay, etc.)
- [src/hooks/usePayments.ts](src/hooks/usePayments.ts) — Payment integration
- [src/hooks/useSubscriptions.ts](src/hooks/useSubscriptions.ts) — Subscription hooks (BROKEN exports)
- [src/hooks/useSettings.ts](src/hooks/useSettings.ts) — User settings
- [src/hooks/useEvents.ts](src/hooks/useEvents.ts) — Events hooks
- [src/hooks/usePromotions.ts](src/hooks/usePromotions.ts) — Promotions hooks
- [src/hooks/useCampaigns.ts](src/hooks/useCampaigns.ts) — Campaign hooks
- [src/lib/api.ts](src/lib/api.ts) — API client
- [src/lib/auth.ts](src/lib/auth.ts) — Auth config

### Auth
- [src/app/(auth)/login/page.tsx](src/app/(auth)/login/page.tsx) — Login
- [src/app/(auth)/register/page.tsx](src/app/(auth)/register/page.tsx) — Registration
- [src/middleware.ts](src/middleware.ts) — Route protection

---

## CHANGE LOG

| Date | Change | By |
|------|--------|----|
| 2026-03-07 | Initial Music Module audit — 5 parallel agents | Audit Team |

---

> **Next Steps:** Begin Phase 1 fixes (subscription hooks, song purchase flow, tip system).  
> **Review Cadence:** Weekly audit review — update this tracker as items are resolved.
