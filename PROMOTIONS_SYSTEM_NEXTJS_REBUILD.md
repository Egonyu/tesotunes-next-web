# TesoTunes Promotions System - Next.js Frontend Rebuild

## Executive Summary

The **Promotions System** is a marketplace feature that enables **anyone** (artists, influencers, DJs, radio stations, event organizers) to offer promotional services to artists in exchange for payment. Artists can discover, purchase, and verify promotional services using **credits**, **UGX**, or **hybrid payment** (credits + UGX). The system creates a decentralized promotional economy where service providers earn income by promoting artists' music through various channels (TikTok Live, Instagram mentions, radio play, DJ shoutouts, event tickets, etc.).

---

## 1. Current Implementation Overview

### 1.1 What's Already Built

#### **Backend (Laravel)**
- ✅ **Models**:
  - `App\Modules\Store\Models\Promotion` - Promotion campaigns (maps to `promotion_campaigns` table for platform-wide)
  - `App\Modules\Store\Models\PromotionOrder` - Orders for purchased promotions (maps to `store_promotion_orders` table)
  - `App\Models\User` - Users who create/purchase promotions
  - Promotions are also managed as **Products** with `product_type = 'promotion'` in the Store module

- ✅ **Controllers**:
  - `Backend\Admin\PromotionController` - Admin CRUD, approval/rejection workflow
  - `Frontend\Artist\PromotionController` - Artists view their promotion listings, orders, purchases
  - `Frontend\PromotionController` - Public browsing, participation
  - `Frontend\Store\PromotionController` - Store-based promotions (product-level)
  - `Backend\Store\PromotionManagementController` - Backend management of store promotions

- ✅ **Services**:
  - `App\Services\Store\PromotionService` - Validation, discount calculation, redemption logic
  - `App\Services\CreditService` - Credit spending/earning for promotions

- ✅ **Routes**:
  - Admin: `/admin/promotions/*` (CRUD, approve, reject, participants)
  - Artist: `/artist/promotions` (view my promotions as seller)
  - Frontend: `/promotions/*` (browse, create, participate)
  - API: `/api/store/promotions/*` (buyer endpoints)
  - API: `/api/store/seller/promotions/*` (seller endpoints)

- ✅ **Key Features**:
  - Dual currency support (credits + UGX)
  - Hybrid payments (mix credits and UGX in one transaction)
  - Verification workflow (buyer submits proof → seller verifies → platform releases payment)
  - Dispute resolution (buyer can dispute if seller doesn't verify)
  - Auto-verification after 7 days if seller doesn't respond
  - Auto-refund for expired promotions with no verification
  - Commission/platform fees (higher rate for promotions than physical products)
  - Rating and review system
  - Featured/top-rated promotions
  - Promotion types: social_media_mention, radio_mention, dj_shoutout, ticket_giveaway, content_creation, etc.

#### **Database Schema**
- `promotion_campaigns` - Platform-wide promotion campaigns
- `store_promotion_orders` - Promotion purchase orders
- `store_products` - Promotions stored as products with `product_type = 'promotion'`
- `store_orders` and `store_order_items` - Order and line items
- `credit_transactions` - Credit spending/earning logs

#### **Current Frontend (Blade/Views)**
- Blade views exist but need Next.js replacement:
  - `admin.promotions.index`, `admin.promotions.show`, `admin.promotions.create`
  - `frontend.artist.promotions`, `frontend.artist.promotion-orders`, `frontend.artist.promotion-purchases`
  - `frontend.promotions.index`, `frontend.promotions.show`, `frontend.promotions.create`
  - `frontend.store.promotions.index`, `frontend.store.promotions.analytics`

---

## 2. Core Concept & Value Proposition

### 2.1 The Idea
**"Turn anyone into a promotional partner"**

- **Promoters** (influencers, DJs, radio hosts, event organizers, TikTok creators) list their promotional services with transparent pricing, reach estimates, and delivery timelines.
- **Artists** browse the marketplace, compare promoters based on ratings/reach/price, and purchase services using credits or UGX.
- **Verification System** ensures trust: buyers submit proof (screenshot, link, etc.), sellers verify completion, and the platform holds funds until verification.
- **Dispute Resolution** protects buyers if sellers don't deliver or verify.

### 2.2 Promotion Types Supported
1. **Social Media Mentions** - Instagram story, TikTok video, Facebook post, YouTube shoutout
2. **Live Stream Promotion** - TikTok Live, YouTube Live, Twitch mention
3. **Radio Airplay** - FM/online radio station plays
4. **DJ Shoutouts** - Club DJ mentions during sets
5. **Event Tickets** - Giveaway tickets for artist visibility
6. **Content Creation** - Review videos, reaction videos, blog posts
7. **Playlist Inclusion** - Add song to influencer's public playlists
8. **Collaboration Offers** - Feature on remix, collaboration track

### 2.3 Value to Stakeholders

#### **For Artists (Buyers)**
- **Affordable Marketing**: Access promotional services at transparent, competitive prices
- **Credit-First Economy**: Use earned credits from streams/downloads to pay for promotions (no upfront UGX needed)
- **Verified Reach**: See proof of promotion (screenshots, links) before payment is released
- **Diverse Options**: Compare promoters by price, reach, rating, delivery speed
- **Risk Mitigation**: Dispute resolution and auto-refunds protect against fraud

#### **For Promoters (Sellers)**
- **Monetize Influence**: Turn social media following, radio audience, or DJ reputation into income
- **Passive Income**: List services once, receive orders continuously
- **Platform Credibility**: Build verified ratings, featured badges, and reputation
- **Flexible Pricing**: Set own prices in credits or UGX based on reach/effort
- **Auto-Payment**: Platform handles payment collection, verification, and disbursement

#### **For TesoTunes Platform**
- **Revenue**: Commission on every promotion transaction (e.g., 15-20% platform fee)
- **Network Effects**: More promoters attract more artists; more artists attract more promoters
- **Credit Circulation**: Promotions are a high-value credit sink, balancing the credit economy
- **User Retention**: Artists return frequently to browse/purchase promotions
- **Data & Insights**: Track which promotion types work best, optimize marketplace

---

## 3. How Promotions Tie to Other TesoTunes Components

### 3.1 Integration with Credit System
- **Credit Earning**: Artists earn credits from streams, downloads, referrals, challenges
- **Credit Spending**: Artists spend credits on promotions (primary use case for credit circulation)
- **Credit-to-UGX Conversion**: Promoters can convert earned credits to UGX for payout
- **Hybrid Payments**: Artists can pay 300 credits + 2000 UGX for a 500-credit promotion

### 3.2 Integration with Store Module
- Promotions are **Store Products** with `product_type = 'promotion'`
- Leverage existing **Order**, **OrderItem**, **Payment**, and **Commission** logic
- Share **Cart**, **Checkout**, and **Payment Gateway** infrastructure
- Unified **Order History** and **Analytics** dashboards

### 3.3 Integration with Edula (Events/Feed)
- **Promotion Posts**: Promoters can showcase completed promotions in the Edula feed
- **Event Promotions**: Event organizers offer ticket giveaways as promotions
- **Social Proof**: Artists share successful promotions (e.g., "Featured on @DJKiboko's set!")
- **Discovery**: Feed algorithm surfaces trending promotions and promoters

### 3.4 Integration with SACCO Module
- **Promotion Loans**: Artists can take SACCO loans to fund promotion campaigns
- **ROI Tracking**: Link promotion spending to revenue growth (streams, downloads, ticket sales)
- **Production Milestones**: Include promotions in milestone-based funding (e.g., "Hire 3 TikTok influencers")
- **Savings Goals**: Create goals like "Save 5000 credits for radio airplay campaign"

### 3.5 Integration with Analytics
- **Promotion Performance**: Track streams, downloads, and revenue before/after promotion
- **ROI Calculation**: `(Revenue Increase - Promotion Cost) / Promotion Cost * 100`
- **A/B Testing**: Compare different promotion types and promoters
- **Conversion Funnel**: Track artist journey from browsing → purchasing → verifying → repeat

---

## 4. Next.js Frontend Requirements

### 4.1 Technology Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI components
- **State Management**: Zustand (global state), React Query (server state)
- **Forms**: React Hook Form + Zod validation
- **API Client**: Axios with interceptors
- **Auth**: NextAuth.js or custom JWT via Laravel Sanctum
- **Media**: Next/Image for optimized images
- **Real-time**: Pusher or Socket.IO for order status updates

### 4.2 User Roles & Permissions
- **Admin**: Approve/reject promotions, manage disputes, view analytics
- **Artist (Buyer)**: Browse, purchase, verify, rate promotions
- **Promoter (Seller)**: Create promotions, verify orders, manage listings
- **Guest**: View public promotions (limited access)

### 4.3 Core Pages/Routes

#### **Public/Guest Routes**
- `/promotions` - Browse all active promotions (filterable, sortable)
- `/promotions/[slug]` - Promotion detail page with reach, rating, reviews, pricing
- `/promoters/[username]` - Promoter profile with all their promotions

#### **Artist/Buyer Routes (Protected)**
- `/promotions/browse` - Enhanced browse with recommendations
- `/promotions/[slug]/checkout` - Checkout page with payment options (credits/UGX/hybrid)
- `/dashboard/promotions/purchases` - My promotion purchases (pending, completed, disputed)
- `/dashboard/promotions/purchases/[orderId]` - Order detail with verification submission
- `/dashboard/analytics/promotions` - ROI tracking for promotions

#### **Promoter/Seller Routes (Protected)**
- `/dashboard/promotions/create` - Create new promotion listing
- `/dashboard/promotions/manage` - Manage my promotions (edit, pause, archive)
- `/dashboard/promotions/orders` - Pending verifications (queue)
- `/dashboard/promotions/orders/[orderId]` - Verify order completion
- `/dashboard/promotions/earnings` - Revenue and payout dashboard
- `/dashboard/promotions/analytics` - Promotion performance stats

#### **Admin Routes (Protected)**
- `/admin/promotions` - All promotions with status filters
- `/admin/promotions/pending` - Pending approval queue
- `/admin/promotions/[id]` - Promotion detail with approve/reject actions
- `/admin/promotions/disputes` - Dispute resolution queue
- `/admin/promotions/analytics` - Platform-wide promotion stats

---

## 5. Laravel API Contracts (Required Endpoints)

### 5.1 Public Endpoints (No Auth)

#### **GET `/api/promotions`**
**Purpose**: List all active promotions with filters/sorting
**Query Params**:
- `type` (string): Filter by promotion_type (social_media_mention, radio_mention, etc.)
- `platform` (string): Filter by platform (instagram, tiktok, radio, etc.)
- `min_reach` (int): Minimum estimated reach
- `max_reach` (int): Maximum estimated reach
- `min_price_credits` (int): Min price in credits
- `max_price_credits` (int): Max price in credits
- `min_price_ugx` (int): Min price in UGX
- `max_price_ugx` (int): Max price in UGX
- `rating_min` (float): Minimum rating (1-5)
- `sort` (string): `price_asc`, `price_desc`, `rating`, `popularity`, `newest`
- `featured` (boolean): Only featured promotions
- `page` (int): Pagination
- `per_page` (int): Items per page (default 20)

**Response**:
```json
{
  "data": [
    {
      "id": 123,
      "slug": "tiktok-live-shoutout-djkiboko",
      "title": "TikTok Live Shoutout (10k+ viewers)",
      "short_description": "I'll play your song on my TikTok Live...",
      "type": "live_stream_promotion",
      "platform": "tiktok",
      "price_credits": 800,
      "price_ugx": 8000,
      "accepts_credits": true,
      "accepts_ugx": true,
      "accepts_hybrid": true,
      "estimated_reach": 12000,
      "delivery_days_min": 1,
      "delivery_days_max": 3,
      "rating_average": 4.7,
      "rating_count": 45,
      "total_orders": 120,
      "completed_orders": 110,
      "is_featured": true,
      "is_top_rated": true,
      "promoter": {
        "id": 456,
        "name": "DJ Kiboko",
        "username": "djkiboko",
        "avatar_url": "https://...",
        "is_verified": true,
        "follower_count": 15000
      },
      "featured_image_url": "https://...",
      "status": "active"
    }
  ],
  "meta": {
    "current_page": 1,
    "total": 150,
    "per_page": 20,
    "last_page": 8
  }
}
```

#### **GET `/api/promotions/{slug}`**
**Purpose**: Get promotion detail
**Response**: Full promotion object with `description`, `requirements`, `deliverables`, `terms`, `reviews[]`

#### **GET `/api/promotions/{slug}/reviews`**
**Purpose**: Get reviews for a promotion
**Response**: Paginated reviews with ratings, comments, buyer info

#### **GET `/api/promoters/{username}`**
**Purpose**: Get promoter profile with all their promotions
**Response**: User profile + promotions array

---

### 5.2 Artist/Buyer Endpoints (Auth Required)

#### **POST `/api/promotions/{slug}/purchase`**
**Purpose**: Purchase a promotion
**Body**:
```json
{
  "payment_method": "credits", // "credits", "ugx", "hybrid"
  "credits_amount": 800,
  "ugx_amount": 0,
  "song_id": 789, // Song to promote
  "notes": "Please mention my new single 'Fire'",
  "preferred_delivery_date": "2024-02-15"
}
```
**Response**:
```json
{
  "order_id": 999,
  "order_number": "ORD-PROMO-123456",
  "status": "pending_verification",
  "payment_status": "paid",
  "total_credits": 800,
  "total_ugx": 0,
  "created_at": "2024-02-10T10:00:00Z"
}
```

#### **GET `/api/my/promotions/purchases`**
**Purpose**: Get my promotion purchases
**Query Params**: `status` (pending_verification, completed, disputed, refunded)
**Response**: Paginated orders

#### **GET `/api/my/promotions/purchases/{orderId}`**
**Purpose**: Get order detail
**Response**:
```json
{
  "id": 999,
  "order_number": "ORD-PROMO-123456",
  "status": "pending_verification",
  "promotion": { /* promotion object */ },
  "song": { /* song object */ },
  "verification": {
    "status": "pending",
    "submitted_at": null,
    "verified_at": null,
    "verification_url": null,
    "verification_notes": null,
    "rejection_reason": null
  },
  "dispute": {
    "is_disputed": false,
    "dispute_reason": null,
    "disputed_at": null
  },
  "created_at": "2024-02-10T10:00:00Z",
  "expected_delivery_at": "2024-02-13T10:00:00Z"
}
```

#### **POST `/api/promotions/orders/{orderId}/submit-verification`**
**Purpose**: Submit verification proof (screenshot, link)
**Body**:
```json
{
  "verification_url": "https://tiktok.com/@djkiboko/video/12345",
  "verification_notes": "Screenshot of live stream attached",
  "verification_files": ["file1.jpg", "file2.jpg"] // S3 URLs
}
```
**Response**: `{ "success": true, "message": "Verification submitted" }`

#### **POST `/api/promotions/orders/{orderId}/dispute`**
**Purpose**: Dispute an order
**Body**:
```json
{
  "reason": "Promoter didn't deliver within 7 days"
}
```
**Response**: `{ "success": true, "dispute_id": 123 }`

#### **POST `/api/promotions/orders/{orderId}/review`**
**Purpose**: Leave a review after completion
**Body**:
```json
{
  "rating": 5,
  "comment": "Great promotion! Got 500+ new streams",
  "would_recommend": true
}
```
**Response**: `{ "success": true, "review_id": 456 }`

---

### 5.3 Promoter/Seller Endpoints (Auth Required)

#### **POST `/api/promotions`**
**Purpose**: Create a new promotion
**Body**:
```json
{
  "title": "Instagram Story Mention (50k followers)",
  "short_description": "I'll share your song on my story...",
  "description": "Full description...",
  "type": "social_media_mention",
  "platform": "instagram",
  "price_credits": 1000,
  "price_ugx": 10000,
  "accepts_credits": true,
  "accepts_ugx": true,
  "accepts_hybrid": true,
  "estimated_reach": 50000,
  "delivery_days_min": 1,
  "delivery_days_max": 2,
  "requirements": {
    "action": "Share song link on Instagram story",
    "duration_hours": 24,
    "hashtags": ["#NewMusic", "#UgandanMusic"]
  },
  "deliverables": [
    "Screenshot of story post",
    "Story insights (reach, impressions)"
  ],
  "terms": "Payment released after verification...",
  "featured_image": "base64..." // or S3 URL
}
```
**Response**: `{ "promotion": { /* created promotion */ } }`

#### **PUT `/api/promotions/{id}`**
**Purpose**: Update promotion
**Body**: Same as create
**Response**: `{ "promotion": { /* updated promotion */ } }`

#### **DELETE `/api/promotions/{id}`**
**Purpose**: Delete/archive promotion
**Response**: `{ "success": true }`

#### **PATCH `/api/promotions/{id}/pause`**
**Purpose**: Pause promotion (stop accepting orders)
**Response**: `{ "success": true, "status": "paused" }`

#### **PATCH `/api/promotions/{id}/activate`**
**Purpose**: Reactivate paused promotion
**Response**: `{ "success": true, "status": "active" }`

#### **GET `/api/my/promotions`**
**Purpose**: Get my promotions as seller
**Query Params**: `status` (draft, pending, active, paused, rejected)
**Response**: Paginated promotions

#### **GET `/api/my/promotions/orders`**
**Purpose**: Get orders for my promotions (pending verifications)
**Query Params**: `status` (pending_verification, completed, disputed)
**Response**: Paginated orders

#### **GET `/api/my/promotions/orders/{orderId}`**
**Purpose**: Get order detail to verify
**Response**: Order object with buyer info, song, verification proof

#### **POST `/api/promotions/orders/{orderId}/verify`**
**Purpose**: Verify order completion
**Body**:
```json
{
  "verified": true,
  "notes": "Completed as requested"
}
```
**Response**: `{ "success": true, "payment_released": true }`

#### **POST `/api/promotions/orders/{orderId}/reject`**
**Purpose**: Reject verification (triggers refund)
**Body**:
```json
{
  "reason": "Buyer didn't provide correct song link"
}
```
**Response**: `{ "success": true, "refund_issued": true }`

#### **GET `/api/my/promotions/analytics`**
**Purpose**: Get seller analytics
**Response**:
```json
{
  "total_promotions": 5,
  "active_promotions": 3,
  "total_orders": 150,
  "completed_orders": 140,
  "pending_verifications": 8,
  "total_revenue_credits": 120000,
  "total_revenue_ugx": 1200000,
  "average_rating": 4.8,
  "conversion_rate": 0.35,
  "top_performing_promotion": { /* promotion object */ }
}
```

---

### 5.4 Admin Endpoints (Auth Required + Admin Role)

#### **GET `/api/admin/promotions`**
**Purpose**: List all promotions with admin filters
**Query Params**: `status` (draft, pending, active, paused, rejected, flagged)
**Response**: Paginated promotions

#### **PATCH `/api/admin/promotions/{id}/approve`**
**Purpose**: Approve pending promotion
**Response**: `{ "success": true, "status": "active" }`

#### **PATCH `/api/admin/promotions/{id}/reject`**
**Purpose**: Reject promotion
**Body**: `{ "reason": "Violates terms..." }`
**Response**: `{ "success": true, "status": "rejected" }`

#### **GET `/api/admin/promotions/disputes`**
**Purpose**: Get all disputed orders
**Response**: Paginated disputes with order details

#### **POST `/api/admin/promotions/disputes/{disputeId}/resolve`**
**Purpose**: Resolve dispute
**Body**:
```json
{
  "resolution": "refund_buyer", // or "release_to_seller"
  "notes": "Buyer provided sufficient evidence"
}
```
**Response**: `{ "success": true }`

#### **GET `/api/admin/promotions/analytics`**
**Purpose**: Platform-wide analytics
**Response**:
```json
{
  "total_promotions": 500,
  "active_promotions": 350,
  "total_orders": 10000,
  "total_gmv_credits": 5000000,
  "total_gmv_ugx": 50000000,
  "platform_revenue_ugx": 7500000,
  "top_promoters": [ /* top 10 promoters */ ],
  "top_promotion_types": [ /* breakdown by type */ ],
  "average_order_value": 500,
  "dispute_rate": 0.02
}
```

---

## 6. Key Business Logic & Rules

### 6.1 Pricing & Payment
- **Credit-First**: Default to credits when available
- **Hybrid Payments**: Allow mixing credits + UGX (e.g., 300 credits + 2000 UGX)
- **Platform Commission**: 15-20% on promotion orders (configurable)
- **Minimum Prices**: Credits ≥ 100, UGX ≥ 1000
- **Credit-to-UGX Rate**: 1 credit = 10 UGX (configurable)

### 6.2 Verification Workflow
1. **Buyer purchases** → Order status: `pending_verification`
2. **Promoter delivers** promotion (externally)
3. **Buyer submits proof** (screenshot, link) → Status: `verification_submitted`
4. **Promoter reviews** proof → Two options:
   - **Verify**: Status → `completed`, payment released to promoter
   - **Reject**: Status → `disputed`, buyer can escalate
5. **Auto-verify**: If promoter doesn't respond in 7 days → auto-complete
6. **Auto-refund**: If verification not submitted by expiry date → auto-refund buyer

### 6.3 Dispute Resolution
- Buyer can dispute if:
  - Promoter doesn't deliver within delivery window
  - Verification rejected unfairly
  - Quality doesn't match listing
- Admin reviews dispute → Decides to refund buyer or release payment to seller
- Platform may ban repeat offenders

### 6.4 Rating & Reviews
- Buyers can rate after order completion (1-5 stars)
- Review includes: rating, comment, would_recommend boolean
- Promoter's average rating displayed prominently
- Low-rated promoters may be hidden from search

### 6.5 Featured & Top-Rated Badges
- **Featured**: Admin-curated (paid promotion or high performer)
- **Top-Rated**: Rating ≥ 4.5 + ≥ 20 orders
- **Verified Promoter**: Admin-verified identity

---

## 7. UI/UX Requirements

### 7.1 Promotion Browse/Discover
- **Grid View**: Cards with featured image, title, price, rating, reach
- **Filters**: Type, platform, price range, rating, delivery speed
- **Sort**: Price, rating, popularity, newest
- **Search**: By keyword (title, description, promoter name)
- **Featured Section**: Carousel of featured promotions at top
- **Recommendations**: "Recommended for you" based on genre, past purchases

### 7.2 Promotion Detail Page
- **Hero Section**: Featured image, title, promoter info (name, avatar, verified badge)
- **Pricing Card**: Credits price, UGX price, "Purchase" CTA
- **Stats Bar**: Rating, total orders, average delivery time, reach
- **Description Tabs**: Overview, Requirements, Deliverables, Terms
- **Reviews Section**: Paginated reviews with ratings/comments
- **Similar Promotions**: "You might also like..."

### 7.3 Checkout Flow
1. **Select Payment Method**: Credits, UGX, or Hybrid (slider to allocate)
2. **Provide Details**: Song to promote, notes for promoter, preferred date
3. **Review Order**: Summary with total, delivery estimate
4. **Confirm Payment**: Process payment (credits deducted instantly, UGX via gateway)
5. **Success Screen**: Order number, "Track Order" link

### 7.4 Order Tracking (Buyer)
- **Order Timeline**: Purchased → Delivered → Verification Submitted → Completed
- **Status Badge**: Pending, Completed, Disputed, Refunded
- **Action CTAs**: "Submit Verification", "Contact Promoter", "Dispute"
- **Countdown Timer**: "Auto-verify in 5 days" or "Auto-refund in 2 days"

### 7.5 Verification Queue (Seller)
- **Queue List**: Orders awaiting verification (sortable by oldest first)
- **Card Preview**: Buyer name, song, verification proof (link/screenshot)
- **Quick Actions**: "Verify" or "Reject" buttons
- **Modal Detail**: Full order detail with proof, notes, song player

### 7.6 Analytics Dashboards
#### **Buyer Analytics**
- **Total Spent**: Credits + UGX on promotions
- **ROI Chart**: Revenue increase vs promotion cost
- **Best Performers**: Which promotions drove most streams
- **Promotion History**: Timeline of all purchased promotions

#### **Seller Analytics**
- **Revenue Chart**: Credits + UGX earned over time
- **Conversion Funnel**: Views → Orders → Completions
- **Rating Trend**: Rating over time
- **Top Promotion**: Best-selling promotion

---

## 8. Technical Implementation Plan

### Phase 1: Core Marketplace (Weeks 1-3)
- [ ] Bootstrap Next.js app with TypeScript, Tailwind, Shadcn UI
- [ ] Set up API client (Axios + interceptors) and auth (Sanctum)
- [ ] Laravel: Finalize API endpoints (GET promotions, GET promotion detail)
- [ ] Next.js: Build `/promotions` browse page (grid, filters, sort)
- [ ] Next.js: Build `/promotions/[slug]` detail page
- [ ] Laravel: Implement purchase endpoint (`POST /api/promotions/{slug}/purchase`)
- [ ] Next.js: Build checkout flow (payment method selector, order confirmation)

### Phase 2: Buyer Flows (Weeks 4-5)
- [ ] Laravel: Implement buyer endpoints (GET purchases, GET order detail, POST submit verification)
- [ ] Next.js: Build `/dashboard/promotions/purchases` page (order list)
- [ ] Next.js: Build order detail page with verification submission form
- [ ] Next.js: Build dispute submission flow
- [ ] Implement real-time order status updates (Pusher/Socket.IO)

### Phase 3: Seller Flows (Weeks 6-7)
- [ ] Laravel: Implement seller endpoints (POST create, PUT update, GET orders, POST verify)
- [ ] Next.js: Build `/dashboard/promotions/create` form (multi-step wizard)
- [ ] Next.js: Build `/dashboard/promotions/manage` page (promotion list)
- [ ] Next.js: Build verification queue (`/dashboard/promotions/orders`)
- [ ] Next.js: Build verification detail page with approve/reject actions

### Phase 4: Admin & Analytics (Weeks 8-9)
- [ ] Laravel: Implement admin endpoints (GET all, approve, reject, disputes, analytics)
- [ ] Next.js: Build admin dashboard (`/admin/promotions`)
- [ ] Next.js: Build dispute resolution interface
- [ ] Next.js: Build buyer and seller analytics dashboards
- [ ] Implement CSV export for analytics

### Phase 5: Advanced Features (Weeks 10-12)
- [ ] Implement rating & review system (backend + frontend)
- [ ] Build promoter profile pages (`/promoters/[username]`)
- [ ] Implement featured/top-rated badges
- [ ] Add recommendation algorithm (collaborative filtering)
- [ ] Implement auto-verification and auto-refund cron jobs
- [ ] Add email/push notifications for order events

### Phase 6: Testing & Optimization (Weeks 13-14)
- [ ] Unit tests for business logic (verification, payments, disputes)
- [ ] Integration tests for API endpoints
- [ ] E2E tests for critical flows (purchase, verify, dispute)
- [ ] Performance optimization (lazy loading, caching, image optimization)
- [ ] SEO optimization (meta tags, sitemap, structured data)
- [ ] Accessibility audit (WCAG 2.1 AA)

---

## 9. Data Models & Relationships

### Promotion Model (Laravel)
```php
// Two models coexist:
// 1. App\Modules\Store\Models\Promotion (maps to promotion_campaigns)
// 2. Products with product_type = 'promotion' (maps to store_products)

// Relationships:
- belongsTo: creator (User)
- hasMany: orders (PromotionOrder or OrderItem)
- hasMany: reviews (Review)
- belongsTo: platform (PromotionPlatform) // optional

// Key Fields:
- title, short_description, description
- type, platform (instagram, tiktok, radio, etc.)
- price_credits, price_ugx
- accepts_credits, accepts_ugx, accepts_hybrid
- estimated_reach, delivery_days_min, delivery_days_max
- requirements (JSON), deliverables (JSON), terms (text)
- rating_average, rating_count, total_orders, completed_orders
- status (draft, pending, active, paused, rejected, archived)
- is_featured, is_top_rated, is_verified
- featured_image_url
```

### PromotionOrder Model (Laravel)
```php
// Relationships:
- belongsTo: promotion (Promotion)
- belongsTo: user/buyer (User)
- belongsTo: song (Song) // optional
- hasOne: verification (PromotionVerification) // or embedded JSON

// Key Fields:
- order_number, status, payment_status
- credit_amount, ugx_amount, total_amount
- payment_method (credits, ugx, hybrid)
- verification_status (pending, submitted, verified, rejected)
- verification_url, verification_notes, verification_files (JSON)
- verified_at, verified_by
- is_disputed, dispute_reason, disputed_at
- created_at, expected_delivery_at, completed_at
```

---

## 10. Success Metrics & KPIs

### Platform KPIs
- **GMV (Gross Merchandise Value)**: Total value of promotions sold (credits + UGX)
- **Platform Revenue**: Commission earned (15-20% of GMV)
- **Active Promoters**: Number of promoters with ≥1 active listing
- **Active Buyers**: Number of artists who purchased promotions in last 30 days
- **Order Volume**: Total promotion orders per month
- **Marketplace Liquidity**: % of promotions that receive ≥1 order per month

### Quality Metrics
- **Average Rating**: Platform-wide average promoter rating
- **Completion Rate**: % of orders completed successfully
- **Dispute Rate**: % of orders disputed
- **Verification Time**: Average time for promoter to verify order
- **Repeat Purchase Rate**: % of buyers who purchase again within 90 days

### User Engagement
- **Browse-to-Purchase Conversion**: % of visitors who purchase
- **Promoter Onboarding Rate**: % of new promoters who complete first listing
- **Buyer Retention**: % of buyers who return for 2nd+ purchase
- **Credit Usage**: % of promotion purchases using credits vs UGX

---

## 11. Risk Mitigation & Compliance

### Trust & Safety
- **Promoter Vetting**: Admin approval required before promotion goes live
- **Identity Verification**: Require ID verification for high-value promoters
- **Fraud Detection**: Flag suspicious patterns (e.g., buyer and seller are same IP)
- **Content Moderation**: Review promotion descriptions for prohibited content
- **Refund Policy**: Clear refund policy for disputes

### Legal Compliance
- **Terms of Service**: Explicit terms for promotions (delivery, verification, refunds)
- **Payment Regulations**: Comply with mobile money regulations in Uganda
- **Data Privacy**: GDPR/local privacy laws for user data
- **Tax Reporting**: Issue tax documents for promoters earning above threshold

---

## 12. Documentation & Developer Handoff

### Required Documentation
1. **API Documentation**: OpenAPI/Swagger spec for all endpoints
2. **Component Library**: Storybook for UI components
3. **State Management Guide**: Zustand store structure
4. **Deployment Guide**: CI/CD pipeline, environment variables
5. **Testing Guide**: How to run unit, integration, and E2E tests

### Handoff Checklist
- [ ] All API endpoints tested and documented
- [ ] Next.js app deployed to staging environment
- [ ] Admin panel fully functional
- [ ] Payment flows tested end-to-end (sandbox)
- [ ] Email templates reviewed and approved
- [ ] User documentation (FAQ, help articles)
- [ ] Training session with support team
- [ ] Monitoring and alerting set up (Sentry, LogRocket)

---

## 13. Future Enhancements (Roadmap)

### Q1 2024
- **Promotion Bundles**: Packages with multiple promoters (e.g., "Radio + TikTok" bundle)
- **Subscription Promotions**: Monthly retainer for ongoing promotion
- **Geo-Targeting**: Promotions for specific regions (Kampala, Nairobi, etc.)

### Q2 2024
- **Live Auction**: Real-time bidding for high-demand promoters (e.g., "Highest bidder gets Friday slot")
- **White-Label Promotion**: Reseller program where agencies manage promoters
- **Smart Recommendations**: ML-based promoter recommendations

### Q3 2024
- **Promotion Contracts**: Multi-deliverable contracts (e.g., "3 TikTok videos over 30 days")
- **Performance-Based Pricing**: Pay based on results (e.g., cost-per-stream)
- **Promoter Agencies**: Allow agencies to manage multiple promoters

---

## Conclusion

The **Promotions System** is a high-value, revenue-generating feature that transforms TesoTunes into a two-sided marketplace. By enabling **anyone** to monetize their influence and helping **artists** access affordable, verified promotional services, the platform creates a win-win economy. The credit-first approach ensures that artists can participate even without upfront UGX, while the verification workflow builds trust and reduces fraud.

**Next Steps**:
1. Validate Laravel API contracts with backend team
2. Design high-fidelity mockups for core flows (browse, checkout, verification)
3. Set up Next.js project structure and boilerplate
4. Begin Phase 1 implementation (core marketplace)

---

**Document Version**: 1.0  
**Last Updated**: 2024-02-10  
**Author**: TesoTunes Engineering Team  
**Status**: Ready for Implementation