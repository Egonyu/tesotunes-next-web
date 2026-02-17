# TesoTunes Platform - Development Guidelines

## CRITICAL RULES

### Rule 1: Backend is ALWAYS the Source of Truth
- **NEVER** modify Laravel migrations, models, or API endpoints to "fix" frontend issues
- **ALWAYS** read the Laravel code first before implementing frontend features
- If backend returns field `X`, frontend must use `X` - don't rename or transform
- If frontend needs a field that doesn't exist, ADD it to backend first

### Rule 2: Full Feature Implementation
- When implementing a feature, include ALL fields the backend supports
- Read the full validation rules in the controller before building forms
- Check the model's `$fillable` array to see all available fields
- Never strip down forms to "minimal" versions

### Rule 3: API URLs Must Be Absolute
- All `*_url` fields from Laravel must be full URLs (http://...)
- StorageHelper.php uses `config('app.url')` prefix
- Never pass relative paths to Next.js Image components

### Rule 4: Status Fields Must Have Defaults
- Every `status` field must have a valid default in backend
- Songs: draft → pending → published/rejected
- Artists: pending → active → verified/suspended
- Don't create records with empty status strings

---

## Platform Overview

TesoTunes is an African music distribution and streaming platform with:
- **Credits System**: Platform currency for all transactions
- **UGX Wallet**: Real money balance for withdrawals
- **Subscription Tiers**: Free, Premium, Artist, Label
- **Artist Earnings**: Streams, downloads, tips, royalty splits

---

## Core Business Models

### 1. Credits System (Platform Currency)

**Models:**
- `UserCredit` - User's credit wallet balance
- `CreditTransaction` - All credit movements (earn/spend/transfer)
- `CreditRate` - Rates for different activities

**How Credits Work:**
```
User earns credits by:
- Listening to songs (0.5 credits per complete play)
- Social actions (likes: 1 credit, shares: 2 credits)
- Daily login bonus (10 credits + streak bonus)
- Referrals (50 credits per signup)

User spends credits on:
- Song/album purchases
- Artist tips
- Premium content
- Promotions
- Voting in awards
```

**Daily Limits (prevent abuse):**
```php
'listening' => 50.0 credits/day
'social_interaction' => 30.0 credits/day
'daily_login' => 10.0 credits/day
'content_creation' => 25.0 credits/day
'referral' => 100.0 credits/day
```

**API Endpoints:**
```
GET  /api/credits/balance     - Get user's credit balance
GET  /api/credits/packages    - Available purchase packages
POST /api/credits/purchase    - Buy credits with wallet
GET  /api/credits/history     - Transaction history
POST /api/credits/transfer    - Transfer to another user
```

### 2. Wallet System (Real Money - UGX)

**Models:**
- `User.ugx_balance` - User's UGX cash balance
- `Payment` - Payment records
- `UserSubscription` - Subscription payments

**Wallet Operations:**
```
Topup via:
- Mobile Money (MTN MoMo, Airtel Money)
- Bank transfer
- Card payment

Withdraw to:
- Mobile Money
- Bank account
```

**API Endpoints:**
```
GET  /api/payments/wallet           - Get wallet balance
POST /api/payments/mobile-money/initiate - Deposit via mobile money
GET  /api/payments/mobile-money/status/{ref} - Check payment status
POST /api/payments/wallet/withdraw  - Request withdrawal
GET  /api/payments/wallet/transactions - Transaction history
```

### 3. Artist Earnings System

**Models:**
- `ArtistRevenue` - All revenue records for artists
- `RoyaltySplit` - Revenue sharing with collaborators

**Revenue Types:**
```php
TYPE_STREAM = 'stream'       // Per-play revenue
TYPE_DOWNLOAD = 'download'   // Song/album purchase
TYPE_DISTRIBUTION = 'distribution' // External platform revenue
TYPE_TIP = 'tip'             // Fan tips
TYPE_SALE = 'sale'           // Merchandise
```

**Revenue Flow:**
```
1. User pays credits for stream/download
2. Platform takes fee (configurable %)
3. Net amount goes to artist's pending_earnings
4. If song has RoyaltySplits, distribute proportionally
5. Artist can withdraw when balance >= 50,000 UGX
```

**API Endpoints:**
```
GET  /api/artist/earnings          - Earnings dashboard
GET  /api/artist/earnings/history  - Transaction history
POST /api/artist/earnings/withdraw - Request withdrawal
GET  /api/artist/analytics         - Play/download stats
```

### 4. Subscription System

**Plans (from SubscriptionPlan model):**
```
Free Tier:
- 10 downloads/day
- 128kbps streaming
- Ads enabled
- Basic library features

Premium Tier:
- Unlimited downloads
- 320kbps streaming
- Ad-free
- Offline mode
- Exclusive content

Artist Tier:
- All Premium features
- Upload songs/albums
- Analytics dashboard
- Distribution tools
- Revenue tracking

Label Tier:
- Multi-artist management
- Bulk operations
- Advanced analytics
- Priority support
```

**API Endpoints:**
```
GET  /api/subscriptions/plans     - Available plans
POST /api/subscriptions/subscribe - Subscribe to plan
GET  /api/subscriptions/current   - Current subscription
POST /api/subscriptions/cancel    - Cancel subscription
```

---

## API Contract Reference

### Song Upload (POST /api/artist/songs)

**Required Fields:**
```
title: string (max 255)
audio: file (mp3, wav, flac, aac, m4a, ogg, max 100MB)
```

**Optional Fields:**
```
cover: image (jpeg, jpg, png, webp, max 10MB)
album_id: integer
genre_id: string|integer
genre_ids: array of integers
featured_artists: string|array
lyrics: string
release_date: date
price: numeric (min 0)
is_explicit: boolean
description: string (max 2000)
composer: string (max 255)
producer: string (max 255)
is_downloadable: boolean (default true)
is_free: boolean (default true)
```

**Response Fields (from SongResource):**
```typescript
{
  id: number
  uuid: string
  title: string
  slug: string
  artwork_url: string | null  // FULL URL
  audio_url: string | null    // FULL URL
  duration_seconds: number
  is_explicit: boolean
  is_featured: boolean
  is_free: boolean
  price?: number
  release_date: string | null
  play_count: number
  like_count: number
  download_count: number
  artist: {
    id: number
    name: string
    slug: string
    avatar_url: string | null
  }
  album?: {
    id: number
    title: string
    slug: string
    artwork_url: string | null
  }
  genre?: {
    id: number
    name: string
    slug: string
  }
  created_at: string
  updated_at: string
  links: {
    self: string
    artist: string
    album: string | null
  }
}
```

### Artist Profile (GET /api/artists/{slug})

**Response Fields (from ArtistResource):**
```typescript
{
  id: number
  uuid: string
  name: string           // stage_name in DB
  slug: string
  bio: string | null
  avatar_url: string     // FULL URL or ui-avatars fallback
  banner_url: string | null  // FULL URL
  country: string | null
  city: string | null
  is_verified: boolean
  verification_badge: string | null
  verification_status: string
  total_plays: number
  total_songs: number
  total_albums: number
  follower_count: number
  social_links: {
    instagram?: string
    twitter?: string
    facebook?: string
    youtube?: string
    tiktok?: string
    spotify?: string
    apple_music?: string
  }
  website_url: string | null
  career_start_year: number | null
  record_label: string | null
  influences: string | null
  genre: {
    id: number
    name: string
    slug: string
  } | null
  created_at: string
  updated_at: string
  links: {
    self: string
    songs: string
    albums: string
  }
}
```

### User Profile (GET /api/user/profile)

**Response Fields:**
```typescript
{
  id: number
  name: string
  email: string
  username: string | null
  avatar_url: string
  role: 'user' | 'artist' | 'label' | 'moderator' | 'admin' | 'super_admin'
  entity_type: string | null
  credits_balance: number      // From creditWallet relation
  ugx_balance: number          // Cash balance
  subscription_tier: string | null
  is_verified: boolean
  phone_number: string | null
  country: string | null
  referral_code: string
  referred_by: number | null
  created_at: string
}
```

---

## Field Name Mappings

| Backend Field | Frontend Field | Notes |
|--------------|----------------|-------|
| `stage_name` | `name` | Artist display name |
| `avatar` | `avatar_url` | Always full URL |
| `banner` | `banner_url` | Always full URL |
| `artwork` | `artwork_url` | Always full URL |
| `audio_file_320` | `audio_url` | Always full URL |
| `primary_genre_id` | `genre.id` | Loaded via relation |
| `followers_count` | `follower_count` | Aliased in Resource |
| `credit_balance` | `credits_balance` | Via accessor |

---

## Common Gotchas

### 1. Image URLs
```php
// WRONG - returns relative path
return Storage::url($this->artwork);

// CORRECT - returns full URL
return config('app.url') . Storage::url($this->artwork);
```

### 2. Song Status
```php
// WRONG - empty string fails queries
$status = '';

// CORRECT - use pending as default
$status = $artist->auto_publish ? 'published' : 'pending';
```

### 3. Genre Selection
```php
// Accept both genre_id (string) and genre_ids (array)
'genre_id' => 'nullable|string',
'genre_ids' => 'nullable|array',

// Resolve in controller
if (is_numeric($validated['genre_id'])) {
    $genreId = (int) $validated['genre_id'];
} else {
    $genre = Genre::where('name', $request->genre_id)->first();
    $genreId = $genre?->id;
}
```

### 4. File Uploads on Windows
```php
// WRONG - fails due to temp file cleanup
$path = $file->store('songs/audio', 'public');

// CORRECT - move immediately
$file->move(storage_path('app/public/songs/audio'), $filename);
```

---

## Frontend Implementation Checklist

When implementing a new feature:

1. [ ] Read the Laravel controller's validation rules
2. [ ] Read the Model's `$fillable` and `$casts` arrays
3. [ ] Read the Resource class for response structure
4. [ ] Match TypeScript interfaces to Resource output
5. [ ] Use exact field names from API
6. [ ] Handle null/undefined for optional fields
7. [ ] Test with real API calls, not mocked data

---

## Database Schema Reference

### Key Tables

```
users
├── credits (integer, default 0)
├── ugx_balance (decimal, default 0)
├── role (enum)
├── referral_code (unique)
└── referrer_id (foreign key)

user_credits (wallet)
├── user_id
├── balance (decimal)
└── currency

credit_transactions
├── user_id
├── type (earn/spend/transfer/bonus/refund)
├── amount
├── balance_after
├── source
├── description
└── reference

artists
├── user_id
├── stage_name
├── slug (unique)
├── avatar
├── banner
├── is_verified
├── can_upload
├── auto_publish
├── monthly_upload_limit
└── primary_genre_id

songs
├── artist_id
├── album_id (nullable)
├── title
├── slug
├── audio_file_original
├── audio_file_320
├── audio_file_128
├── artwork
├── status (draft/pending/published/rejected)
├── duration_seconds
├── is_explicit
├── is_free
├── price
└── primary_genre_id

artist_revenues
├── artist_id
├── revenue_type (stream/download/tip/distribution)
├── amount_ugx
├── amount_usd
├── platform_fee
├── net_amount
├── status (pending/confirmed/paid)
└── revenue_date

royalty_splits
├── song_id
├── recipient_id (user_id of collaborator)
├── percentage
├── applies_to_streaming
├── applies_to_downloads
└── status
```

---

## Testing Checklist

Before marking a feature complete:

1. [ ] API endpoint returns expected fields
2. [ ] Image URLs are absolute (start with http)
3. [ ] Status fields have valid values
4. [ ] Numbers are numbers, not strings
5. [ ] Dates are ISO format strings
6. [ ] Nullable fields handle null gracefully
7. [ ] Error responses are properly typed
8. [ ] Loading states are implemented
9. [ ] Empty states are handled
10. [ ] Mobile responsive design works
