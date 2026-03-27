# Promotions Implementation Audit Tracker
## Goal

Make Tesotunes promotions usable as a real marketplace where:

- an influencer or tiktoker can create a personal profile and showcase promotion services
- an artist can browse those services, purchase one, submit proof, and track progress
- admin can moderate listings, handle disputes, and view marketplace analytics

This audit starts from the real web entry points and the current admin panel, not the product docs.

## Target user journey

### Seller journey

1. Influencer signs in
2. Influencer gets a promoter-facing profile
3. Influencer creates one or more services
4. Service goes through admin review
5. Service is publicly discoverable on `/promotions`
6. Influencer receives orders and verifies completion

### Buyer journey

1. Artist visits `/promotions`
2. Artist filters by platform, type, budget, reach, or promoter
3. Artist opens service detail page
4. Artist buys using credits, UGX, or hybrid payment
5. Artist tracks order status
6. Artist submits proof, disputes if needed, and reviews the seller

## Entry points audited

### Public web

- `src/app/(app)/promotions/page.tsx`
- `src/app/(app)/promotions/[slug]/page.tsx`
- `src/app/(app)/promoters/[username]/page.tsx`
- `src/app/(app)/promotions/purchases/page.tsx`
- `src/app/(app)/promotions/purchases/[orderId]/page.tsx`

### Seller web

- `src/app/(artist)/artist/promotions/page.tsx`
- `src/app/(artist)/artist/promotions/create/page.tsx`
- `src/app/(artist)/artist/promotions/orders/page.tsx`

### Admin web

- `src/app/(admin)/admin/promotions/page.tsx`
- `src/app/(admin)/admin/promotions/disputes/page.tsx`
- `src/app/(admin)/admin/promotions/analytics/page.tsx`

### Shared frontend data layer

- `src/hooks/usePromotions.ts`
- `src/lib/promotions-api.ts`
- `src/types/promotions.ts`
- `src/components/promotions/*`

### Backend surfaces audited

- `routes/api/store.php`
- `app/Modules/Store/Http/Controllers/Api/PromotionController.php`
- `app/Modules/Store/Http/Controllers/Api/SellerPromotionController.php`
- `app/Http/Controllers/Api/Admin/AdminPromotionsController.php`
- `app/Modules/Store/Models/Promotion.php`
- `app/Modules/Store/Models/Product.php`

## Wins

- Public browse, detail, purchases, seller, and admin UI entry points already exist in the Next.js app.
- The frontend already has a clear type system for marketplace-style promotions with promoter, reviews, pricing, delivery windows, disputes, and analytics.
- The seller create page already models the right shape for influencer services: title, type, platform, price, reach, deliverables, and terms.
- The detail page already supports artist purchase intent and event-linked promotion requests.
- The shared Store product model already supports `product_type = promotion`, dual pricing, credits, and hybrid payments.
- Admin moderation patterns already exist and can be reused once the data model is aligned.

## Current implementation issues

### P0: the feature is split across different backend concepts

- Public frontend calls `/promotions`, `/promotions/{slug}`, `/promoters/{username}`, and buyer order routes.
- Store backend routes are actually under `/store/promotions` and `/store/seller/promotions`.
- Admin backend routes are now being repointed to the influencer-service listings, but the buyer order flow is still separate work.
- Result: public browse/profile, seller CRUD, and admin moderation now share one canonical promotions contract; buyer purchase/order lifecycle still needs follow-through.

### P0: public detail and promoter profile are not backed by matching API routes

- `src/lib/promotions-api.ts` expects:
  - `GET /promotions/{slug}`
  - `GET /promotions/{slug}/reviews`
  - `GET /promotions/platforms/list`
  - `GET /promoters/{username}`
- Those routes are now implemented in the Laravel API; the remaining work is tightening the buyer/order data model and settlement logic.

### P0: buyer flow is wired but still needs model fidelity

- `src/app/(app)/promotions/purchases/page.tsx` and `src/app/(app)/promotions/purchases/[orderId]/page.tsx` expect real order, verification, dispute, and review data.
- `src/lib/promotions-api.ts` expects `/my/promotions/purchases*` and `/promotions/orders/*`.
- The buyer routes are now implemented in the Laravel API; remaining work is tightening the order/model data that powers them.

### P0: seller flow is mostly frontend-only

- `src/app/(artist)/artist/promotions/page.tsx`
- `src/app/(artist)/artist/promotions/create/page.tsx`
- `src/app/(artist)/artist/promotions/orders/page.tsx`

These screens now have working create/list/order/analytics routes, but richer edit/media-kit/payout behavior is still to be finished.

### P0: admin panel is pointed at event promotion requests, not influencer services

- `app/Http/Controllers/Api/Admin/AdminPromotionsController.php` has been repointed to `store_products` promotion listings.
- Admin metrics, top promoters, and dispute behavior are now aligned to the influencer marketplace, although the dispute UX still needs deeper workflow work.

### P1: current backend Promotion model is not the same concept the frontend is using

- `app/Modules/Store/Models/Promotion.php` maps to `promotion_campaigns`
- Its fields and service methods are discount/campaign oriented
- The frontend expects service listings with promoter profile, deliverables, requirements, reviews, completed orders, and featured image
- Result: even where routes exist, raw model responses will not match the expected marketplace shape

### P1: influencer profile is partially implemented

- `src/app/(app)/promoters/[username]/page.tsx` is now a real showcase surface with banner, bio, location, social links, and service highlights.
- The actual creator storefront is still missing deeper marketing fields and proof assets.
- Remaining marketplace profile elements:
  - audience size and geography
  - proof-of-performance and media kit
  - example campaigns
  - service packages
  - verification state
  - response time



### P1: filters are partially implemented

- The browse UI now exposes budget, reach, delivery speed, verified promoters, featured listings, and rating filters.
- Remaining marketplace discovery gaps:
  - promoted audience / niche
  - platform-specific service capabilities





### P1: dispute and review flows are partially wired but still need settlement logic

- UI exists
- type contracts exist
- admin dispute resolution screen exists
- backend dispute resolution is routed through store order-item records, but settlement rules still need hardening

### P2: analytics are not yet tied to actual marketplace outcomes

- Admin analytics page exists
- Seller stats cards exist
- but there is no real order ledger powering:
  - conversion
  - revenue by promoter
  - completion rate
  - dispute rate for actual service orders
  - repeat purchase behavior

## Entry point status matrix

| Entry point | Status | Notes |
| --- | --- | --- |
| `/promotions` | `partial` | Good browse shell, but depends on a backend contract that is not yet canonical. |
| `/promotions/[slug]` | `partial` | Detail and reviews are now backed by the canonical backend; purchase/order actions still need completion. |
| `/promoters/[username]` | `partial` | Profile API is live; the richer influencer showcase content still needs to be expanded. |
| `/promotions/purchases` | `partial` | Buyer history UI exists and the backend routes are now implemented; the remaining work is model fidelity and UX polish. |
| `/promotions/purchases/[orderId]` | `partial` | Verification, dispute, and review UI exists and the backend lifecycle routes are now implemented. |
| `/artist/promotions` | `partial` | Shell exists and backend data is now live, but richer seller controls still need finishing. |
| `/artist/promotions/create` | `partial` | Create is wired to the canonical backend; edit/publish UX can still be polished. |
| `/artist/promotions/orders` | `partial` | Queue is now backed by real order items, but buyer-side proof/dispute lifecycle still needs completion. |
| `/admin/promotions` | `partial` | Moderation now targets promotion listings, but the admin UX and dispute workflow still need refinement. |
| `/admin/promotions/disputes` | `partial` | Backend now returns real order-item dispute signals, but the dedicated resolution flow is still thin. |
| `/admin/promotions/analytics` | `partial` | Backend analytics now use the marketplace entity, but payout and conversion depth still needs work. |

## What needs implementing for the influencer use case

### 1. Canonical promotion service model

- Define one promotion marketplace entity for influencer services
- One model should represent:
  - promoter user
  - promoter profile summary
  - service type
  - platform
  - pricing
  - delivery window
  - requirements
  - deliverables
  - status
  - public media
  - rating stats

### 2. Influencer profile and service showcase

- Create a proper promoter profile surface
- Must support:
  - public profile page
  - platform handles
  - follower counts
  - audience proof
  - intro/about
  - active services grid
  - completed campaign credibility

### 3. Artist purchase workflow

- canonical public browse route
- detail route
- purchase route
- order history
- proof submission
- dispute
- review

### 4. Seller operating workflow

- seller onboarding for promoter profile
- create service
- edit/pause/archive service
- view incoming orders
- verify or reject delivery
- see revenue and ratings

### 5. Admin governance workflow

- approve/reject service listings
- feature or suspend listings
- resolve disputes
- inspect seller history
- see real marketplace analytics

### 6. Commission and payout workflow

- platform fee rules
- seller net earnings
- credit and UGX settlement
- payout release after verification
- refund handling on disputes or failed delivery

## Tracker

### Track key

- `[done]` complete and working
- `[in-progress]` currently being worked on
- `[todo]` not started
- `[blocked]` cannot progress until a dependency is fixed

### Foundation

- `[done]` Choose one canonical backend contract for promotions marketplace routes
- `[in-progress]` Stop mixing event promotion requests, discount campaigns, and influencer service listings under the same feature name
- `[done]` Define one JSON resource shape shared by public, seller, buyer, and admin flows

### Public marketplace

- `[done]` Public browse page shell exists
- `[done]` Make `/promotions` use the canonical marketplace backend resource
- `[done]` Implement public promotion detail endpoint
- `[done]` Implement public promotion reviews endpoint
- `[done]` Implement promoter public profile endpoint
- `[done]` Add richer browse filters for budget, reach, verified sellers, and delivery time

### Influencer seller experience

- `[todo]` Add promoter profile fields for influencer onboarding
- `[done]` Add public-facing influencer showcase page backed by real data
- `[done]` Seller promotions dashboard now reads canonical backend listing data
- `[done]` Seller create form now posts to the canonical promotions endpoint
- `[done]` Add seller edit, pause, archive, and activation lifecycle backed by real endpoints
- `[done]` Implement seller verification queue
- `[done]` Implement seller analytics backed by real order data

### Artist buyer experience

- `[partial]` Promotion detail page exists
- `[done]` Implement promotion purchase endpoint
- `[done]` Implement buyer purchases list endpoint
- `[done]` Implement buyer purchase detail endpoint
- `[done]` Implement verification proof submission endpoint
- `[done]` Implement dispute creation endpoint
- `[done]` Implement review submission endpoint

### Admin

- `[partial]` Admin pages exist
- `[done]` Repoint admin moderation to the same influencer service entity used by public and seller flows
- `[done]` Implement dispute listing and resolution for actual service orders
- `[done]` Implement real marketplace analytics

### Implemented so far

- Public `/promotions` browse, detail, reviews, platforms, and promoter profile routes now resolve to a canonical influencer-service marketplace controller in Laravel.
- Seller `/my/promotions*` and `/promotions` management routes now use the same `store_products` marketplace entity for create, update, pause, activate, delete, and verification queue flows.
- Buyer `/my/promotions/purchases*` and `/promotions/orders/*` routes now exist for purchase history, proof submission, disputes, and reviews.
- Promotion list items, detail payloads, and promoter profile payloads are now serialized from the same product/store/user data model the frontend already expects.
- Disputes are now surfaced from existing store order-item fields instead of a separate fake model, so the admin panel can at least see real signals while we build the dedicated workflow.

### Commercial logic

- `[done]` Define promotion commission and payout release rules
- `[in-progress]` Connect credits, wallet, and hybrid payment to promotion orders
- `[in-progress]` Add refund and dispute settlement rules
- `[todo]` Add audit trail for approvals, payouts, and disputes

## Recommended implementation order

1. Canonical backend contract for public + seller + buyer + admin
2. Influencer promoter profile and service model
3. Public browse and detail backed by that model
4. Seller create/manage flow
5. Buyer purchase and order tracking
6. Admin moderation and disputes
7. Commission, payout, and analytics hardening

## Working conclusion

Tesotunes already has the shape of a promotions marketplace in the frontend, but it is not yet one coherent implementation. The immediate job is not to invent a new feature. It is to unify the current entry points around one real influencer-service marketplace contract so the tiktoker profile, the service listing, the artist purchase journey, and the admin panel are all talking about the same thing.
