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

### P0: public detail and promoter profile are now backed, with initial structured backend modeling in place

- `src/lib/promotions-api.ts` expects:
  - `GET /promotions/{slug}`
  - `GET /promotions/{slug}/reviews`
  - `GET /promotions/platforms/list`
  - `GET /promoters/{username}`
- Those routes are implemented in the Laravel API.
- Remaining gap:
  - richer proof/media-kit asset modeling for radio, DJ, and creator offers beyond the structured metadata now in the backend contract

### P0: buyer flow is wired and usable, but still needs deeper operational fidelity

- `src/app/(app)/promotions/purchases/page.tsx` and `src/app/(app)/promotions/purchases/[orderId]/page.tsx` expect real order, verification, dispute, and review data.
- `src/lib/promotions-api.ts` expects `/my/promotions/purchases*` and `/promotions/orders/*`.
- The buyer routes are implemented in the Laravel API.
- Remaining gap:
  - stronger structured evidence metadata and richer dispute intelligence

### P0: seller flow is now live end-to-end, but still needs deeper structured service metadata

- `src/app/(artist)/artist/promotions/page.tsx`
- `src/app/(artist)/artist/promotions/create/page.tsx`
- `src/app/(artist)/artist/promotions/orders/page.tsx`

These screens now have working create/list/edit/order/analytics routes, plus a rebuilt offer builder and storefront editor.
Remaining gap:
- richer media-kit style proof assets and portfolios layered on top of the structured service details now supported in backend metadata

### P0: admin panel is now aligned to influencer services, but operational depth still needs hardening

- `app/Http/Controllers/Api/Admin/AdminPromotionsController.php` has been repointed to `store_products` promotion listings.
- Admin metrics, top promoters, and dispute behavior are aligned to the influencer marketplace.
- Remaining gap:
  - deeper platform-aware dispute, settlement, and repeat-purchase analytics from canonical backend metrics

### P1: current backend Promotion model is not the same concept the frontend is using

- `app/Modules/Store/Models/Promotion.php` maps to `promotion_campaigns`
- Its fields and service methods are discount/campaign oriented
- The frontend expects service listings with promoter profile, deliverables, requirements, reviews, completed orders, and featured image
- Result: even where routes exist, raw model responses will not match the expected marketplace shape

### P1: influencer profile is implemented, with richer proof still open

- `src/app/(app)/promoters/[username]/page.tsx` is now a real showcase storefront.
- `src/app/(artist)/artist/promotions/profile/page.tsx` is now a real promoter identity editor.
- Portfolio snapshots with image/link/outcome metadata are now supported on promoter profiles and storefronts.
- Remaining marketplace profile elements:
  - deeper proof-of-performance media assets
  - richer media-kit style galleries or longer-form case studies



### P1: filters are largely implemented

- The browse UI now exposes budget, reach, delivery speed, verified promoters, featured listings, rating filters, audience niche, audience region, and content format.
- Browse now also supports structured capability filters over service metadata such as channel/account, placement style, proof type, and timing window.
- Marketplace browse now has a `best match` ranking path that weights audience fit, platform metadata, delivery fit, and storefront trust signals.
- Marketplace browse now surfaces recommendation lanes that help artists start from real marketplace fit before filling filters manually.
- Remaining marketplace discovery gaps:
  - deeper recommendation intelligence that can adapt to artist history, songs, or campaign goals automatically





### P1: dispute and review flows are partially wired but still need settlement logic

- UI exists
- type contracts exist
- admin dispute resolution screen exists
- backend dispute resolution is routed through store order-item records, with evidence capture and open-dispute payout locks now in place; settlement rules still need final hardening

### P2: analytics are now live, and backend depth has started improving

- Admin analytics page exists and now shows marketplace, platform-mix, and dispute-risk signals.
- Seller stats cards exist and are backed by real order data.
- Backend analytics now includes refund rate, repeat buyer rate, proof submission lag, and dispute resolution lag.
- Remaining gaps:
  - deeper conversion quality metrics by platform and promotion type

## Entry point status matrix

| Entry point | Status | Notes |
| --- | --- | --- |
| `/promotions` | `done` | Canonical marketplace browse is live. |
| `/promotions/[slug]` | `done` | Detail, purchase flow, and proof expectations are now implemented. |
| `/promoters/[username]` | `done` | Public promoter storefront is now rebuilt and live. |
| `/promotions/purchases` | `done` | Buyer purchases dashboard is live. |
| `/promotions/purchases/[orderId]` | `done` | Verification, dispute, review, and proof guidance are now implemented. |
| `/artist/promotions` | `done` | Seller promotions workspace is live. |
| `/artist/promotions/create` | `done` | Canonical seller builder is live. |
| `/artist/promotions/orders` | `done` | Seller queue and order review are live. |
| `/admin/promotions` | `done` | Moderation queue is live and now platform-aware. |
| `/admin/promotions/disputes` | `done` | Dispute queue is live and now proof-aware. |
| `/admin/promotions/analytics` | `partial` | Analytics is live; deeper backend platform/conversion metrics still need expansion. |

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
- `[done]` Stop mixing event promotion requests, discount campaigns, and influencer service listings under the same feature name
- `[done]` Define one JSON resource shape shared by public, seller, buyer, and admin flows

### Public marketplace

- `[done]` Public browse page shell exists
- `[done]` Make `/promotions` use the canonical marketplace backend resource
- `[done]` Implement public promotion detail endpoint
- `[done]` Implement public promotion reviews endpoint
- `[done]` Implement promoter public profile endpoint
- `[done]` Add richer browse filters for budget, reach, verified sellers, and delivery time
- `[done]` Add audience niche, region, and content format targeting across seller listings and buyer browse

### Influencer seller experience

- `[done]` Add promoter profile fields for influencer onboarding
- `[done]` Add public-facing influencer showcase page backed by real data
- `[done]` Seller promotions dashboard now reads canonical backend listing data
- `[done]` Seller create form now posts to the canonical promotions endpoint
- `[done]` Add seller edit, pause, archive, and activation lifecycle backed by real endpoints
- `[done]` Add seller edit page backed by a real seller promotion detail endpoint
- `[done]` Implement seller verification queue
- `[done]` Implement seller analytics backed by real order data

### Artist buyer experience

- `[done]` Promotion detail page exists
- `[done]` Implement promotion purchase endpoint
- `[done]` Implement buyer purchases list endpoint
- `[done]` Implement buyer purchase detail endpoint
- `[done]` Implement verification proof submission endpoint
- `[done]` Implement dispute creation endpoint
- `[done]` Implement review submission endpoint

### Admin

- `[done]` Admin pages exist
- `[done]` Repoint admin moderation to the same influencer service entity used by public and seller flows
- `[done]` Implement dispute listing and resolution for actual service orders
- `[done]` Implement real marketplace analytics
- `[done]` Add platform-aware moderation cues and dispute proof guidance
- `[partial]` Expand analytics toward platform-specific risk, conversion, and settlement intelligence

### Implemented so far

- Public `/promotions` browse, detail, reviews, platforms, and promoter profile routes now resolve to a canonical influencer-service marketplace controller in Laravel.
- Seller `/my/promotions*` and `/promotions` management routes now use the same `store_products` marketplace entity for create, update, pause, activate, delete, and verification queue flows.
- Buyer `/my/promotions/purchases*` and `/promotions/orders/*` routes now exist for purchase history, proof submission, disputes, and reviews.
- Promotion list items, detail payloads, and promoter profile payloads are now serialized from the same product/store/user data model the frontend already expects.
- Promotion listings and detail payloads now expose structured `platform_specifics` metadata for channel, placement, proof expectation, and timing.
- Disputes are now surfaced from existing store order-item fields instead of a separate fake model, so the admin panel can at least see real signals while we build the dedicated workflow.
- Admin `/admin/promotions*` moderation, dispute resolution, and analytics now run on the same `store_products` and `store_orders` marketplace records as the public, buyer, and seller flows.
- Admin analytics now includes canonical backend platform breakdown, dispute concentration, proof coverage, targeting coverage, refund rate, repeat buyer rate, and settlement-lag style metrics.
- Seller `/promotions` and `/my/promotions/orders/{orderId}` contracts now support real create, update, pause, activate, delete, queue, and order-detail operations instead of stub responses.
- Promoter showcase data now has real public `/promoters/{username}` and seller `/my/promoter-profile` contracts for bio, social links, audience summary, proof points, and campaign highlights.

### Commercial logic

- `[done]` Define promotion commission and payout release rules
- `[done]` Connect credits, wallet, and hybrid payment to promotion orders
- `[in-progress]` Add refund and dispute settlement rules
- `[partial]` Add platform-aware dispute review heuristics on the admin side
- `[done]` Add audit trail for approvals, payouts, and disputes

### Local visualization

- `[done]` Add local dev seed data for influencer, DJ, radio, and artist buyer marketplace visualization

## Recommended implementation order

1. Canonical backend contract for public + seller + buyer + admin
2. Influencer promoter profile and service model
3. Public browse and detail backed by that model
4. Seller create/manage flow
5. Buyer purchase and order tracking
6. Admin moderation and disputes
7. Commission, payout, and analytics hardening

## Remaining priority areas

1. Deeper backend analytics for conversion quality by platform/type, now that repeat purchase and settlement-lag signals are in place
2. Expand proof-of-performance media beyond the new portfolio snapshots into fuller media-kit and case-study depth
3. Final refund and dispute settlement hardening beyond the current audit trail and admin heuristics
4. Deeper recommendation intelligence that uses artist history, songs, and richer platform metadata end-to-end

## Working conclusion

Tesotunes already has the shape of a promotions marketplace in the frontend, but it is not yet one coherent implementation. The immediate job is not to invent a new feature. It is to unify the current entry points around one real influencer-service marketplace contract so the tiktoker profile, the service listing, the artist purchase journey, and the admin panel are all talking about the same thing.
