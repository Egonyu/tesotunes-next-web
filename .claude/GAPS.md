# Implementation Gap Analysis

## Overview
This document tracks gaps between the Laravel backend and Next.js frontend.

---

## CRITICAL GAPS (Business Logic Missing)

### 1. Credits System
**Backend:** Fully implemented with CreditService, CreditRate, CreditTransaction
**Frontend:** Basic page exists at /credits but missing:
- [ ] useCredits.ts hook
- [ ] Credit earning notifications
- [ ] Activity-based credit awards
- [ ] Daily limit tracking
- [ ] Streak bonus UI

### 2. Artist Earnings Flow
**Backend:** ArtistRevenue model tracks all earnings
**Frontend:** Basic wallet page but missing:
- [ ] Revenue breakdown by type (streams, downloads, tips)
- [ ] Pending vs confirmed earnings
- [ ] Royalty split management
- [ ] Payout history

### 3. Subscription Features
**Backend:** SubscriptionPlan with feature limits
**Frontend:** Missing enforcement of:
- [ ] Download limits per tier
- [ ] Audio quality restrictions
- [ ] Offline mode toggle
- [ ] Ad display logic

---

## DATA CONTRACT GAPS

### Song Model
| Backend Field | Frontend Status | Notes |
|--------------|-----------------|-------|
| composer | ❌ Not in form | Add to upload form |
| producer | ❌ Not in form | Add to upload form |
| description | ❌ Not in form | Add to upload form |
| release_date | ❌ Not in form | Add date picker |
| price | ❌ Not in form | Add for paid songs |
| is_downloadable | ❌ Not in form | Add toggle |
| is_free | ❌ Not in form | Add toggle |
| duration_seconds | ⚠️ Always 0 | Need audio processing |
| lyrics | ✅ In form | Works |
| is_explicit | ✅ In form | Works |
| featured_artists | ⚠️ Basic | Need multi-select |

### Artist Model
| Backend Field | Frontend Status | Notes |
|--------------|-----------------|-------|
| career_start_year | ❌ Not in settings | Add to artist profile |
| record_label | ❌ Not in settings | Add to artist profile |
| influences | ❌ Not in settings | Add to artist profile |
| can_upload | ❌ Not displayed | Show in dashboard |
| monthly_upload_limit | ❌ Not displayed | Show remaining uploads |
| auto_publish | ❌ Not configurable | Add to settings |

### User Model
| Backend Field | Frontend Status | Notes |
|--------------|-----------------|-------|
| credits | ✅ Displayed | In header/profile |
| ugx_balance | ✅ Displayed | In wallet |
| referral_code | ⚠️ Basic | Needs better UI |
| referred_count | ❌ Not shown | Add to referrals page |

---

## API ENDPOINTS NOT USED

### Credits API (exists but not integrated)
```
GET  /api/credits/balance
GET  /api/credits/packages
POST /api/credits/purchase
GET  /api/credits/history
POST /api/credits/transfer
```

### Artist Analytics (exists but basic)
```
GET  /api/artist/analytics
GET  /api/artist/analytics/streams
GET  /api/artist/analytics/demographics
GET  /api/artist/analytics/geography
```

### Revenue API (exists but not integrated)
```
GET  /api/artist/earnings/sources
GET  /api/artist/earnings/by-song
POST /api/artist/royalty-splits
```

---

## UI/UX GAPS

### Missing Pages
- [ ] /artist/royalty-splits - Manage collaborator splits
- [ ] /artist/distribution - External platform distribution
- [ ] /credits/transfer - Send credits to users
- [ ] /credits/earn - How to earn credits guide

### Missing Components
- [ ] CreditDisplay - Show credit balance consistently
- [ ] SubscriptionBadge - Show user tier
- [ ] DownloadButton - Respect tier limits
- [ ] AudioQualitySelector - Based on subscription

### Missing Notifications
- [ ] Credit earned notifications
- [ ] Withdrawal status updates
- [ ] Upload limit warnings
- [ ] Song approval notifications

---

## Priority Fix Order

### Phase 1: Data Integrity (CRITICAL)
1. Fix all relative URLs in backend
2. Add default status values
3. Align field names in types

### Phase 2: Core Features
1. Complete upload form fields
2. Implement credit earning
3. Add subscription enforcement

### Phase 3: Artist Features
1. Royalty split management
2. Advanced analytics
3. Distribution tools

### Phase 4: User Features
1. Credit transfer
2. Gift system
3. Referral improvements

---

## How to Use This Document

1. Before implementing any feature, check this gap analysis
2. Mark items as complete [x] when done
3. Add new gaps when discovered
4. Reference the main CLAUDE.md for API contracts
