# Implementation Gap Analysis

## Overview
This document tracks gaps between the Laravel backend and Next.js frontend.
Last audited: 2026-05-08

---

## CRITICAL GAPS (Business Logic Missing)

### 1. Credits System
**Backend:** Fully implemented with CreditService, CreditRate, CreditTransaction
**Frontend:**
- [x] Credits dashboard page (`/credits`)
- [x] Credit marketplace (`/credits/marketplace`)
- [x] Credit balance hook (`useCreditBalance` in usePayments.ts)
- [x] Daily limit tracking displayed on credits page
- [x] Streak bonus UI on credits page
- [x] `/credits/transfer` — P2P credit send page with live user search
- [ ] `/credits/earn` — Earn guide / activity discovery page

### 2. Artist Earnings Flow
**Backend:** ArtistRevenue model tracks all earnings
**Frontend:**
- [x] Earnings dashboard with stats (`/artist/earnings`)
- [x] Revenue breakdown by type (streams, downloads, tips)
- [x] Pending vs confirmed earnings
- [x] Royalty split management (`/artist/royalty-splits`)
- [x] Payout history with pagination
- [x] Per-song earnings breakdown

### 3. Subscription Features
**Backend:** SubscriptionPlan with feature limits
**Frontend:**
- [x] Download limits per tier enforced (DownloadGate component)
- [x] Audio quality restrictions (StreamingQualityPicker + subscription cap)
- [ ] Offline mode toggle (backend field `offline_access` exists)
- [ ] Ad display logic (backend field `has_ads` exists, no ad component)

### 4. Artist Distribution
**Backend:** Fully implemented — DistributionController, DistributionService
- 9 platforms: Spotify, Apple Music, YouTube Music, Amazon Music, Deezer, Tidal, Pandora, SoundCloud, Bandcamp
- Submit song/album, retry, remove, royalty reports, analytics dashboard
**Frontend:**
- [x] `/artist/distribution` page implemented (`src/app/(artist)/artist/distribution/page.tsx`)
- [x] `useDistribution.ts` hook (`useDistributionAnalytics`, `useSongDistributions`, `useSubmitDistribution`, `useRetryDistribution`, `useRemoveDistribution`)
- [x] Distribution nav item added to artist sidebar

---

## DATA CONTRACT GAPS

### Song Model
| Backend Field | Frontend Status | Notes |
|--------------|-----------------|-------|
| composer | ✅ In form | Advanced Options section |
| producer | ✅ In form | Advanced Options section |
| description | ✅ In form | Advanced Options section |
| release_date | ✅ In form | Standalone date input |
| price | ✅ In form | Pricing section |
| is_downloadable | ✅ In form | Pricing section checkbox |
| is_free | ✅ In form | Pricing section checkbox |
| duration_seconds | ⚠️ Always 0 | Need audio processing |
| lyrics | ✅ In form | Works |
| is_explicit | ✅ In form | Works |
| featured_artists | ⚠️ Basic | Need multi-select |

### Artist Model
| Backend Field | Frontend Status | Notes |
|--------------|-----------------|-------|
| career_start_year | ✅ In settings | Profile tab |
| record_label | ✅ In settings | Profile tab |
| influences | ✅ In settings | Profile tab, one per line |
| can_upload | ✅ Displayed | Payout tab, read-only |
| monthly_upload_limit | ✅ Displayed | Payout tab, read-only |
| auto_publish | ✅ Configurable | Payout tab toggle |

### User Model
| Backend Field | Frontend Status | Notes |
|--------------|-----------------|-------|
| credits | ✅ Displayed | In header/profile |
| ugx_balance | ✅ Displayed | In wallet |
| referral_code | ✅ Working | Referrals pages (4 routes) |
| referred_count | ⚠️ Basic | Add to referrals page |

---

## API ENDPOINTS NOT USED

### Distribution API (backend complete, frontend 0%)
```
POST /api/songs/{song}/distribute        ← submit for distribution
GET  /api/songs/{song}/distributions     ← list song distributions
POST /api/albums/{album}/distribute      ← distribute full album
GET  /api/artist/distribution-analytics  ← dashboard analytics
POST /api/distributions/{id}/retry       ← retry failed
POST /api/distributions/{id}/remove      ← request removal
GET  /api/distributions/{id}/royalty-report
```

### Credits Transfer (backend exists)
```
POST /api/credits/transfer               ← send credits to user
```

### Artist Analytics (partially integrated)
```
GET  /api/artist/analytics/streams       ← detailed stream data
GET  /api/artist/analytics/demographics  ← audience demographics
GET  /api/artist/analytics/geography     ← geographic breakdown
```

---

## UI/UX GAPS

### Missing Pages
- [ ] `/artist/distribution` — Distribute to Spotify, Apple Music, etc. (**PRIORITY 1**)
- [x] `/credits/transfer` — Implemented with live user search
- [ ] `/credits/earn` — Earning opportunities guide (low priority)

### Missing Components
- [ ] `OfflineModeToggle` — Honor subscription offline_access field
- [ ] `AdBanner` — Conditional ads for free tier (has_ads field)

### Existing but could be improved
- `SubscriptionBadge` — Inline tier badge for profile/header (no component, inlined in multiple places)
- `CreditDisplay` — No shared component; each page queries balance independently

---

## Priority Fix Order

### Phase 1: Critical Missing Pages ✅ DONE
1. **`/artist/distribution`** — Implemented with analytics, per-song status, submit/retry/remove
2. **`/credits/transfer`** — Implemented with live user search (debounced, GET /api/users/search)

### Phase 2: Subscription Enforcement
1. Offline mode toggle in settings (uses existing `offline_access` from subscription API)
2. Ad display logic for free-tier users

### Phase 3: Polish & Components
1. Shared `SubscriptionBadge` component
2. Shared `CreditDisplay` component
3. `referred_count` on referrals page

### Phase 4: Analytics Depth
1. Stream demographics view
2. Geographic breakdown
3. Per-platform revenue (already in distribution analytics)

---

## How to Use This Document

1. Before implementing any feature, check this gap analysis
2. Mark items as complete [x] when done
3. Add new gaps when discovered
4. Reference the main CLAUDE.md for API contracts
