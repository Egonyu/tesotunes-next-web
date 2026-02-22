# TesoTunes Promotions System - Laravel API Development Checklist

## Overview
This checklist ensures all Laravel API endpoints are properly implemented for the Next.js frontend to consume. Use this as a sprint planning tool and development tracker.

---

## 1. Models & Database

### Models to Review/Extend
- [ ] `App\Modules\Store\Models\Promotion` - Ensure all fields match API requirements
- [ ] `App\Modules\Store\Models\PromotionOrder` - Add verification and dispute fields if missing
- [ ] `App\Modules\Store\Models\Product` - Verify `TYPE_PROMOTION` constant and scopes
- [ ] `App\Models\User` - Add promoter profile fields (reach, verified_badge, etc.)

### Database Migrations
- [ ] Verify `promotion_campaigns` table has all required fields:
  - `slug`, `title`, `short_description`, `description`
  - `type`, `platform`, `price_credits`, `price_ugx`
  - `accepts_credits`, `accepts_ugx`, `accepts_hybrid`
  - `estimated_reach`, `delivery_days_min`, `delivery_days_max`
  - `requirements` (JSON), `deliverables` (JSON), `terms` (text)
  - `rating_average`, `rating_count`, `total_orders`, `completed_orders`
  - `status`, `is_featured`, `is_top_rated`, `featured_image_url`
  - `created_by_id`, `published_at`, `timestamps`, `soft_deletes`

- [ ] Verify `store_promotion_orders` table has:
  - `promotion_id`, `user_id`, `song_id`
  - `order_number`, `status`, `payment_status`, `payment_method`
  - `credit_amount`, `ugx_amount`, `total_amount`
  - `verification_status`, `verification_url`, `verification_notes`, `verification_files` (JSON)
  - `verified_at`, `verified_by`, `rejection_reason`
  - `is_disputed`, `dispute_reason`, `disputed_at`
  - `notes`, `expected_delivery_at`, `completed_at`, `timestamps`

- [ ] Create migration for `promotion_reviews` table:
  - `promotion_id`, `order_id`, `user_id`
  - `rating` (1-5), `comment`, `would_recommend` (boolean)
  - `helpful_count`, `flagged`, `timestamps`

- [ ] Create migration for `promotion_platforms` table (if not exists):
  - `name`, `slug`, `icon_url`, `is_active`, `display_order`

### Model Relationships
- [ ] `Promotion::creator()` - belongsTo User
- [ ] `Promotion::platform()` - belongsTo PromotionPlatform
- [ ] `Promotion::orders()` - hasMany PromotionOrder
- [ ] `Promotion::reviews()` - hasMany PromotionReview
- [ ] `PromotionOrder::promotion()` - belongsTo Promotion
- [ ] `PromotionOrder::buyer()` - belongsTo User
- [ ] `PromotionOrder::song()` - belongsTo Song
- [ ] `PromotionOrder::verifier()` - belongsTo User (verified_by)
- [ ] `PromotionOrder::review()` - hasOne PromotionReview
- [ ] `User::createdPromotions()` - hasMany Promotion
- [ ] `User::promotionPurchases()` - hasMany PromotionOrder

### Scopes & Query Helpers
- [ ] `Promotion::scopeActive($query)` - active, published, not expired
- [ ] `Promotion::scopeAvailable($query)` - active + within date range
- [ ] `Promotion::scopeFeatured($query)` - is_featured = true
- [ ] `Promotion::scopeTopRated($query)` - rating >= 4.5, min 20 orders
- [ ] `Promotion::scopeByType($query, $type)` - filter by type
- [ ] `Promotion::scopeByPlatform($query, $platform)` - filter by platform
- [ ] `PromotionOrder::scopePendingVerification($query)` - needs seller verification
- [ ] `PromotionOrder::scopeCompleted($query)` - successfully completed
- [ ] `PromotionOrder::scopeDisputed($query)` - disputed orders

---

## 2. API Routes

### Public Routes (No Auth) - `routes/api.php`
```php
Route::prefix('promotions')->group(function () {
    // Browse & discover
    Route::get('/', [PromotionController::class, 'index']);
    Route::get('/{slug}', [PromotionController::class, 'show']);
    Route::get('/{slug}/reviews', [PromotionController::class, 'reviews']);
    Route::get('/types/list', [PromotionController::class, 'types']);
    Route::get('/platforms/list', [PromotionController::class, 'platforms']);
});

Route::get('/promoters/{username}', [PromoterController::class, 'show']);
```

- [ ] Create `App\Http\Controllers\Api\PromotionController`
- [ ] Create `App\Http\Controllers\Api\PromoterController`
- [ ] Register routes in `routes/api.php`

### Authenticated Artist/Buyer Routes
```php
Route::middleware(['auth:sanctum'])->group(function () {
    Route::prefix('promotions')->group(function () {
        // Purchase
        Route::post('/{slug}/purchase', [PromotionController::class, 'purchase']);
        
        // My purchases
        Route::get('/my/purchases', [PromotionPurchaseController::class, 'index']);
        Route::get('/my/purchases/{orderId}', [PromotionPurchaseController::class, 'show']);
        
        // Verification & disputes
        Route::post('/orders/{orderId}/submit-verification', [PromotionPurchaseController::class, 'submitVerification']);
        Route::post('/orders/{orderId}/dispute', [PromotionPurchaseController::class, 'dispute']);
        Route::post('/orders/{orderId}/review', [PromotionPurchaseController::class, 'review']);
    });
});
```

- [ ] Create `App\Http\Controllers\Api\PromotionPurchaseController`
- [ ] Implement purchase logic with credit/UGX/hybrid payment
- [ ] Implement verification submission (file upload to S3)
- [ ] Implement dispute creation
- [ ] Implement review submission

### Authenticated Promoter/Seller Routes
```php
Route::middleware(['auth:sanctum'])->group(function () {
    Route::prefix('promotions')->group(function () {
        // CRUD
        Route::post('/', [PromotionManagementController::class, 'store']);
        Route::put('/{id}', [PromotionManagementController::class, 'update']);
        Route::delete('/{id}', [PromotionManagementController::class, 'destroy']);
        Route::patch('/{id}/pause', [PromotionManagementController::class, 'pause']);
        Route::patch('/{id}/activate', [PromotionManagementController::class, 'activate']);
        
        // My promotions
        Route::get('/my/listings', [PromotionManagementController::class, 'index']);
        Route::get('/my/orders', [PromotionManagementController::class, 'orders']);
        Route::get('/my/orders/{orderId}', [PromotionManagementController::class, 'orderDetail']);
        
        // Verification
        Route::post('/orders/{orderId}/verify', [PromotionManagementController::class, 'verify']);
        Route::post('/orders/{orderId}/reject', [PromotionManagementController::class, 'reject']);
        
        // Analytics
        Route::get('/my/analytics', [PromotionManagementController::class, 'analytics']);
        Route::get('/my/earnings', [PromotionManagementController::class, 'earnings']);
    });
});
```

- [ ] Create `App\Http\Controllers\Api\PromotionManagementController`
- [ ] Implement CRUD with validation (CreatePromotionRequest, UpdatePromotionRequest)
- [ ] Implement order verification with payment release
- [ ] Implement order rejection with refund
- [ ] Implement analytics aggregation
- [ ] Implement earnings dashboard

### Admin Routes
```php
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::prefix('promotions')->group(function () {
        Route::get('/', [AdminPromotionController::class, 'index']);
        Route::get('/{id}', [AdminPromotionController::class, 'show']);
        Route::patch('/{id}/approve', [AdminPromotionController::class, 'approve']);
        Route::patch('/{id}/reject', [AdminPromotionController::class, 'reject']);
        Route::patch('/{id}/feature', [AdminPromotionController::class, 'feature']);
        
        // Disputes
        Route::get('/disputes', [AdminPromotionController::class, 'disputes']);
        Route::post('/disputes/{disputeId}/resolve', [AdminPromotionController::class, 'resolveDispute']);
        
        // Analytics
        Route::get('/analytics', [AdminPromotionController::class, 'analytics']);
    });
});
```

- [ ] Create `App\Http\Controllers\Api\Admin\AdminPromotionController`
- [ ] Implement approval/rejection workflow
- [ ] Implement dispute resolution with refund/release logic
- [ ] Implement platform-wide analytics

---

## 3. Request Validation

### Form Requests to Create
- [ ] `App\Http\Requests\Promotion\CreatePromotionRequest`
  - Validate title, description, type, platform, pricing, reach, delivery days
  - Validate requirements (JSON), deliverables (array), terms
  - Validate featured_image upload

- [ ] `App\Http\Requests\Promotion\UpdatePromotionRequest`
  - Same as create, but all fields optional

- [ ] `App\Http\Requests\Promotion\PurchasePromotionRequest`
  - Validate payment_method (credits/ugx/hybrid)
  - Validate credits_amount, ugx_amount (sum = promotion price)
  - Validate song_id (optional), notes, preferred_delivery_date

- [ ] `App\Http\Requests\Promotion\SubmitVerificationRequest`
  - Validate verification_url (URL format)
  - Validate verification_notes (string, max 1000)
  - Validate verification_files (array of file uploads)

- [ ] `App\Http\Requests\Promotion\DisputeOrderRequest`
  - Validate reason (required, string, max 500)

- [ ] `App\Http\Requests\Promotion\ReviewPromotionRequest`
  - Validate rating (required, integer, 1-5)
  - Validate comment (string, max 2000)
  - Validate would_recommend (boolean)

---

## 4. Services & Business Logic

### Services to Create/Extend
- [ ] `App\Services\PromotionService`
  - `browsePromotions($filters, $sort, $perPage)` - query builder with filters
  - `getPromotionDetail($slug)` - eager load relationships
  - `purchasePromotion($user, $promotion, $paymentData)` - handle purchase
  - `submitVerification($order, $verificationData)` - save proof
  - `verifyOrder($order, $verifier)` - release payment to seller
  - `rejectOrder($order, $reason)` - trigger refund
  - `disputeOrder($order, $reason)` - create dispute record
  - `reviewPromotion($order, $rating, $comment)` - create review, update avg

- [ ] `App\Services\CreditService` (extend existing)
  - `spendCreditsForPromotion($user, $amount, $promotion)` - deduct credits
  - `refundCreditsForPromotion($user, $amount, $order)` - refund credits
  - `releasePromotionPayment($seller, $amount, $order)` - credit seller after verification

- [ ] `App\Services\PaymentService` (extend existing)
  - `processHybridPayment($user, $creditsAmount, $ugxAmount, $order)` - split payment
  - `refundHybridPayment($order)` - refund both credits and UGX

- [ ] `App\Services\NotificationService` (extend existing)
  - `notifyOrderCreated($order)` - notify seller
  - `notifyVerificationSubmitted($order)` - notify seller
  - `notifyOrderVerified($order)` - notify buyer
  - `notifyOrderDisputed($order)` - notify admin
  - `notifyDisputeResolved($order, $resolution)` - notify both parties

---

## 5. API Resources (JSON Transformers)

### Resources to Create
- [ ] `App\Http\Resources\PromotionResource`
  - Transform Promotion model to API response
  - Include: id, slug, title, description, type, platform, pricing, reach, delivery, rating, promoter
  - Conditional fields: full description only on detail view

- [ ] `App\Http\Resources\PromotionListResource`
  - Lightweight version for browse/list pages
  - Exclude: full description, requirements, terms

- [ ] `App\Http\Resources\PromotionOrderResource`
  - Transform PromotionOrder model to API response
  - Include: order details, promotion info, verification status, dispute info

- [ ] `App\Http\Resources\PromotionReviewResource`
  - Transform review model to API response
  - Include: rating, comment, reviewer info, helpful_count

- [ ] `App\Http\Resources\PromoterProfileResource`
  - Transform User model (as promoter) to API response
  - Include: name, username, avatar, verified badge, total promotions, avg rating

---

## 6. Policies & Authorization

### Policies to Create
- [ ] `App\Policies\PromotionPolicy`
  - `view($user, $promotion)` - anyone can view active promotions
  - `create($user)` - any authenticated user can create
  - `update($user, $promotion)` - only creator can update
  - `delete($user, $promotion)` - only creator can delete
  - `verify($user, $order)` - only promotion creator can verify order

- [ ] `App\Policies\PromotionOrderPolicy`
  - `view($user, $order)` - buyer or seller can view
  - `submitVerification($user, $order)` - only buyer can submit
  - `verify($user, $order)` - only seller can verify
  - `dispute($user, $order)` - only buyer can dispute

---

## 7. Jobs & Queues

### Jobs to Create
- [ ] `App\Jobs\AutoVerifyPromotionOrder`
  - Run 7 days after order creation if seller hasn't verified
  - Mark order as completed, release payment

- [ ] `App\Jobs\AutoRefundExpiredPromotion`
  - Run at promotion expiry if no verification submitted
  - Refund buyer, notify both parties

- [ ] `App\Jobs\ProcessPromotionPayment`
  - Handle payment release to seller after verification
  - Deduct platform commission, credit seller wallet

- [ ] `App\Jobs\SendPromotionNotification`
  - Send email/push notifications for order events
  - Queue to avoid blocking API responses

### Scheduled Commands (Console Kernel)
```php
$schedule->job(new AutoVerifyPromotionOrder)->dailyAt('02:00');
$schedule->job(new AutoRefundExpiredPromotion)->dailyAt('03:00');
```

- [ ] Register scheduled jobs in `app/Console/Kernel.php`

---

## 8. Tests

### Feature Tests to Write
- [ ] `tests/Feature/Promotion/BrowsePromotionsTest.php`
  - Test filtering by type, platform, price range, rating
  - Test sorting by price, rating, popularity
  - Test pagination

- [ ] `tests/Feature/Promotion/PurchasePromotionTest.php`
  - Test purchase with credits only
  - Test purchase with UGX only
  - Test purchase with hybrid payment
  - Test insufficient balance error
  - Test inactive promotion error

- [ ] `tests/Feature/Promotion/VerificationWorkflowTest.php`
  - Test buyer submits verification
  - Test seller verifies order (payment released)
  - Test seller rejects order (refund issued)
  - Test auto-verification after 7 days
  - Test auto-refund on expiry

- [ ] `tests/Feature/Promotion/DisputeResolutionTest.php`
  - Test buyer disputes order
  - Test admin resolves dispute (refund buyer)
  - Test admin resolves dispute (release to seller)

- [ ] `tests/Feature/Promotion/PromotionCRUDTest.php`
  - Test create promotion
  - Test update promotion
  - Test delete promotion
  - Test pause/activate promotion

### Unit Tests to Write
- [ ] `tests/Unit/Services/PromotionServiceTest.php`
  - Test promotion filters logic
  - Test price calculation (credits + UGX)
  - Test verification logic

- [ ] `tests/Unit/Models/PromotionTest.php`
  - Test scopes (active, available, featured)
  - Test attribute accessors (price_display, delivery_display)

---

## 9. Documentation

### API Documentation (OpenAPI/Swagger)
- [ ] Generate OpenAPI spec for all endpoints
- [ ] Document request/response schemas
- [ ] Document authentication requirements
- [ ] Document error codes and messages
- [ ] Publish to `/api/documentation`

### Code Documentation
- [ ] Add PHPDoc blocks to all controllers
- [ ] Add PHPDoc blocks to all services
- [ ] Add comments for complex business logic
- [ ] Update README with Promotions setup instructions

---

## 10. Configuration

### Config Files to Update
- [ ] `config/store.php`
  - Add `promotion_commission_rate` (default 0.18 = 18%)
  - Add `promotion_auto_verify_days` (default 7)
  - Add `promotion_expiry_refund` (default true)

- [ ] `config/services.php`
  - Add Pusher/Socket.IO config for real-time updates

- [ ] `.env` variables
  - `PROMOTION_COMMISSION_RATE=0.18`
  - `PROMOTION_AUTO_VERIFY_DAYS=7`
  - `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET` (if using Pusher)

---

## 11. Middleware

### Middleware to Create/Use
- [ ] `EnsurePromoterVerified` - only verified promoters can create promotions
- [ ] `CheckPromotionOwnership` - ensure user owns promotion before edit/delete
- [ ] `RateLimitPromotions` - prevent spam (max 10 promotions per day)

---

## 12. Events & Listeners

### Events to Create
- [ ] `PromotionCreated` - fired when new promotion is created
- [ ] `PromotionPurchased` - fired when order is placed
- [ ] `VerificationSubmitted` - fired when buyer submits proof
- [ ] `OrderVerified` - fired when seller verifies order
- [ ] `OrderDisputed` - fired when buyer disputes order

### Listeners to Create
- [ ] `SendPromotionCreatedNotification` - notify admin for approval
- [ ] `SendOrderCreatedNotification` - notify seller
- [ ] `SendVerificationReminderNotification` - remind seller to verify
- [ ] `SendOrderCompletedNotification` - notify buyer
- [ ] `SendDisputeNotification` - notify admin

---

## 13. Security Checklist

- [ ] Validate all inputs (use Form Requests)
- [ ] Sanitize user-generated content (description, notes)
- [ ] Prevent SQL injection (use Eloquent, never raw queries with user input)
- [ ] Rate limit API endpoints (100 req/min per user)
- [ ] Verify user owns resources before modification (use Policies)
- [ ] Hash sensitive data (credit card info, if stored)
- [ ] Use HTTPS for all API calls
- [ ] Implement CSRF protection for state-changing operations
- [ ] Log all financial transactions (credits, UGX)
- [ ] Implement 2FA for high-value transactions (optional)

---

## 14. Performance Optimization

- [ ] Add database indexes:
  - `promotions`: `slug`, `status`, `is_featured`, `rating_average`
  - `promotion_orders`: `user_id`, `promotion_id`, `status`
  - Composite index: `(status, created_at)`

- [ ] Implement caching:
  - Cache featured promotions (1 hour TTL)
  - Cache top-rated promoters (6 hours TTL)
  - Cache promotion counts by type (1 hour TTL)

- [ ] Eager load relationships:
  - Always eager load `creator`, `platform`, `reviews` on detail page
  - Lazy load only when necessary

- [ ] Paginate all list endpoints (default 20 items)

- [ ] Use queues for expensive operations:
  - Email notifications
  - Payment processing
  - Analytics aggregation

---

## 15. Monitoring & Logging

- [ ] Log all promotion purchases (user, promotion, amount)
- [ ] Log all payment transactions (credits, UGX, refunds)
- [ ] Log all disputes (order, reason, resolution)
- [ ] Set up alerts for:
  - High dispute rate (>5%)
  - Failed payment transactions
  - Long verification times (>7 days avg)
  - Low conversion rate (<2%)

- [ ] Track metrics in analytics:
  - Daily/monthly promotion sales
  - GMV (Gross Merchandise Value)
  - Platform revenue (commissions)
  - Conversion funnel (views → purchases)

---

## 16. Deployment Checklist

- [ ] Run migrations on staging environment
- [ ] Seed test data (promotions, orders, reviews)
- [ ] Test all API endpoints with Postman/Insomnia
- [ ] Run full test suite (`php artisan test`)
- [ ] Generate API documentation
- [ ] Deploy to staging, test end-to-end with Next.js frontend
- [ ] Performance test (load testing with 1000+ concurrent users)
- [ ] Security audit (penetration testing)
- [ ] Deploy to production (blue-green deployment)
- [ ] Monitor error logs for 48 hours post-launch

---

## 17. Post-Launch Tasks

- [ ] Gather user feedback (surveys, interviews)
- [ ] Analyze conversion funnel (identify drop-off points)
- [ ] A/B test promotion card designs
- [ ] Optimize recommendation algorithm
- [ ] Add more promotion types based on demand
- [ ] Implement promoter dashboard improvements
- [ ] Build mobile app screens for promotions

---

## Quick Reference: API Endpoint Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/promotions` | No | Browse promotions |
| GET | `/api/promotions/{slug}` | No | Promotion detail |
| POST | `/api/promotions/{slug}/purchase` | Yes | Purchase promotion |
| GET | `/api/my/promotions/purchases` | Yes | My purchases |
| POST | `/api/promotions/orders/{id}/submit-verification` | Yes | Submit proof |
| POST | `/api/promotions/orders/{id}/dispute` | Yes | Dispute order |
| POST | `/api/promotions` | Yes | Create promotion |
| PUT | `/api/promotions/{id}` | Yes | Update promotion |
| GET | `/api/my/promotions/orders` | Yes | My pending verifications |
| POST | `/api/promotions/orders/{id}/verify` | Yes | Verify order |
| GET | `/api/admin/promotions` | Admin | All promotions |
| PATCH | `/api/admin/promotions/{id}/approve` | Admin | Approve promotion |
| GET | `/api/admin/promotions/disputes` | Admin | All disputes |
| POST | `/api/admin/promotions/disputes/{id}/resolve` | Admin | Resolve dispute |

---

## Estimated Timeline

- **Week 1-2**: Models, migrations, relationships, scopes
- **Week 3-4**: Public & buyer API endpoints + services
- **Week 5-6**: Seller API endpoints + verification logic
- **Week 7**: Admin endpoints + dispute resolution
- **Week 8**: Jobs, events, notifications
- **Week 9**: Tests, documentation, optimization
- **Week 10**: Staging deployment, integration with Next.js
- **Week 11**: Security audit, performance testing
- **Week 12**: Production deployment, monitoring

**Total: 12 weeks (3 months)**

---

## Notes

- Prioritize buyer flow (browse → purchase → verify) in Weeks 1-4
- Seller flow (create → verify orders) in Weeks 5-6
- Admin features can be built in parallel with frontend work
- Use feature flags to enable/disable promotions module during development
- Run weekly demos with stakeholders to gather feedback early

---

**Document Version**: 1.0  
**Last Updated**: 2024-02-10  
**Owner**: Backend Engineering Team  
**Status**: Development Roadmap - Ready for Sprint Planning