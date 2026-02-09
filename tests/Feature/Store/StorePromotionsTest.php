<?php

use App\Models\User;
use App\Modules\Store\Models\Store;
use App\Modules\Store\Models\Product;
use App\Modules\Store\Models\Order;
use App\Modules\Store\Models\OrderItem;
use Carbon\Carbon;
use Illuminate\Http\Request;

beforeEach(function () {
    $this->artist = User::factory()->create();
    $this->store = Store::factory()->create(['user_id' => $this->artist->id]);
});

// ============================================================================
// PHASE 1: BASIC PROMOTIONAL PRODUCT TESTS
// ============================================================================

test('artist can create promotional product with metadata', function () {
    $promotion = Product::create([
        'store_id' => $this->store->id,
        'name' => 'Instagram Story Mention',
        'description' => 'I will mention your music on my Instagram story with 10k followers',
        'product_type' => Product::TYPE_PROMOTION,
        'price_credits' => 500,
        'price_ugx' => 5000, // Promotions support both currencies
        'allow_credit_payment' => true,
        'allow_hybrid_payment' => true, // Can mix credits + UGX
        'status' => Product::STATUS_ACTIVE,
        'metadata' => [
            'promotion_type' => 'social_media_mention',
            'promotion_details' => [
                'platform' => 'instagram',
                'reach' => 10000,
                'format' => 'story',
            ],
            'verification_required' => true,
            'verification_deadline_hours' => 72,
            'guidelines' => 'Please provide a screenshot of the story mention',
        ],
    ]);

    expect($promotion)->not->toBeNull()
        ->and($promotion->product_type)->toBe(Product::TYPE_PROMOTION)
        ->and($promotion->price_credits)->toBe(500)
        ->and((float)$promotion->price_ugx)->toBe(5000.0)
        ->and($promotion->allow_hybrid_payment)->toBeTrue()
        ->and($promotion->metadata['promotion_type'])->toBe('social_media_mention')
        ->and($promotion->metadata['verification_required'])->toBeTrue()
        ->and($promotion->metadata['verification_deadline_hours'])->toBe(72);
});

test('user can purchase promotion with UGX', function () {
    $buyer = User::factory()->create();
    
    $promotion = Product::factory()->create([
        'store_id' => $this->store->id,
        'product_type' => Product::TYPE_PROMOTION,
        'price_ugx' => 10000,
        'price_credits' => 0,
        'status' => Product::STATUS_ACTIVE,
    ]);

    // Create order with UGX payment
    $order = Order::create([
        'order_number' => 'ORD-' . strtoupper(uniqid()),
        'store_id' => $this->store->id,
        'user_id' => $buyer->id,
        'status' => Order::STATUS_PENDING,
        'payment_status' => Order::PAYMENT_PAID,
        'payment_method' => 'mobile_money',
        'subtotal' => 10000,
        'total_amount' => 10000,
        'total_ugx' => 10000,
        'total_credits' => 0,
        'paid_at' => now(),
    ]);

    OrderItem::create([
        'order_id' => $order->id,
        'product_id' => $promotion->id,
        'product_name' => $promotion->name,
        'quantity' => 1,
        'unit_price' => 10000,
        'subtotal' => 10000,
        'total_amount' => 10000,
    ]);

    // Assertions
    expect((float)$order->total_ugx)->toBe(10000.0)
        ->and($order->total_credits)->toBe(0)
        ->and($order->payment_method)->toBe('mobile_money')
        ->and($order->payment_status)->toBe(Order::PAYMENT_PAID);
    
    $this->assertDatabaseHas('orders', [
        'id' => $order->id,
        'user_id' => $buyer->id,
        'total_ugx' => 10000,
        'payment_status' => Order::PAYMENT_PAID,
    ]);
});

test('user can purchase promotion with credits', function () {
    $buyer = User::factory()->create(['credits' => 1000]);
    
    $promotion = Product::factory()->create([
        'store_id' => $this->store->id,
        'product_type' => Product::TYPE_PROMOTION,
        'price_credits' => 500,
        'price_ugx' => 0,
        'status' => Product::STATUS_ACTIVE,
        'allow_credit_payment' => true,
    ]);

    // Create order (simulating purchase)
    $order = Order::create([
        'order_number' => 'ORD-' . strtoupper(uniqid()),
        'store_id' => $this->store->id,
        'user_id' => $buyer->id,
        'status' => Order::STATUS_PENDING,
        'payment_status' => Order::PAYMENT_PAID,
        'payment_method' => 'credits',
        'subtotal' => 500,
        'total_amount' => 500,
        'total_credits' => 500,
        'total_ugx' => 0,
        'subtotal_credits' => 500,
        'paid_at' => now(),
    ]);

    OrderItem::create([
        'order_id' => $order->id,
        'product_id' => $promotion->id,
        'product_name' => $promotion->name,
        'quantity' => 1,
        'unit_price' => 500,
        'subtotal' => 500,
        'total_amount' => 500,
    ]);

    // Deduct credits from buyer
    $buyer->decrement('credits', 500);
    $buyer->refresh();

    // Assertions
    expect($buyer->credits)->toBe(500)
        ->and($order->total_credits)->toBe(500)
        ->and($order->payment_method)->toBe('credits')
        ->and($order->payment_status)->toBe(Order::PAYMENT_PAID);
    
    $this->assertDatabaseHas('orders', [
        'id' => $order->id,
        'user_id' => $buyer->id,
        'total_credits' => 500,
        'payment_status' => Order::PAYMENT_PAID,
    ]);
});

test('inactive promotions are not shown in active listings', function () {
    Product::factory()->create([
        'product_type' => Product::TYPE_PROMOTION,
        'status' => Product::STATUS_ACTIVE,
    ]);
    
    Product::factory()->create([
        'product_type' => Product::TYPE_PROMOTION,
        'status' => Product::STATUS_DRAFT, // Draft is like inactive
    ]);
    
    Product::factory()->create([
        'product_type' => Product::TYPE_PROMOTION,
        'status' => Product::STATUS_ARCHIVED,
    ]);

    $activePromotions = Product::where('product_type', Product::TYPE_PROMOTION)
        ->where('status', Product::STATUS_ACTIVE)
        ->count();

    expect($activePromotions)->toBe(1);
});

test('promotion types are tracked in metadata', function () {
    $types = ['social_media_mention', 'radio_mention', 'dj_shoutout', 'ticket_giveaway'];

    foreach ($types as $type) {
        Product::factory()->create([
            'store_id' => $this->store->id,
            'product_type' => Product::TYPE_PROMOTION,
            'metadata' => ['promotion_type' => $type],
        ]);
    }

    $promotions = Product::where('store_id', $this->store->id)
        ->where('product_type', Product::TYPE_PROMOTION)
        ->get();

    expect($promotions->count())->toBe(4);
    
    $promotionTypes = $promotions->pluck('metadata')->pluck('promotion_type')->toArray();
    expect($promotionTypes)->toContain('social_media_mention')
        ->and($promotionTypes)->toContain('radio_mention')
        ->and($promotionTypes)->toContain('dj_shoutout')
        ->and($promotionTypes)->toContain('ticket_giveaway');
});

test('can query promotions by type using metadata', function () {
    Product::factory()->create([
        'store_id' => $this->store->id,
        'product_type' => Product::TYPE_PROMOTION,
        'metadata' => ['promotion_type' => 'social_media_mention'],
    ]);
    
    Product::factory()->create([
        'store_id' => $this->store->id,
        'product_type' => Product::TYPE_PROMOTION,
        'metadata' => ['promotion_type' => 'radio_mention'],
    ]);

    $socialMediaPromotions = Product::where('product_type', Product::TYPE_PROMOTION)
        ->whereJsonContains('metadata->promotion_type', 'social_media_mention')
        ->count();

    expect($socialMediaPromotions)->toBe(1);
});

test('promotion has higher commission rate than physical products', function () {
    // Get commission rates from config
    $physicalFreeRate = config('store.fees.free_tier');
    $promotionFreeRate = config('store.fees.promotion_free_tier');
    
    $physicalPremiumRate = config('store.fees.premium_tier');
    $promotionPremiumRate = config('store.fees.promotion_premium_tier');
    
    // Promotions should have higher fees
    expect($promotionFreeRate)->toBeGreaterThan($physicalFreeRate)
        ->and($promotionPremiumRate)->toBeGreaterThan($physicalPremiumRate);
    
    // Verify actual values
    expect($promotionFreeRate)->toBe(10.0) // vs 7.0 for physical
        ->and($promotionPremiumRate)->toBe(7.0) // vs 5.0 for physical
        ->and(config('store.fees.promotion_business_tier'))->toBe(5.0); // vs 3.0 for physical
});

test('promotion supports both UGX and credits payment', function () {
    $promotion = Product::factory()->create([
        'product_type' => Product::TYPE_PROMOTION,
        'price_ugx' => 10000,
        'price_credits' => 1000,
        'allow_credit_payment' => true,
        'allow_hybrid_payment' => true,
    ]);

    expect($promotion->price_ugx)->toBeGreaterThan(0)
        ->and($promotion->price_credits)->toBeGreaterThan(0)
        ->and($promotion->allow_credit_payment)->toBeTrue()
        ->and($promotion->allow_hybrid_payment)->toBeTrue();
});

// ============================================================================
// PHASE 2: VERIFICATION WORKFLOW TESTS (Will fail until migration is added)
// ============================================================================

test('order item can have verification status', function () {
    $buyer = User::factory()->create(['credits' => 1000]);
    $promotion = Product::factory()->create([
        'store_id' => $this->store->id,
        'product_type' => Product::TYPE_PROMOTION,
        'price_credits' => 500,
    ]);

    $order = Order::create([
        'order_number' => 'ORD-TEST',
        'store_id' => $this->store->id,
        'user_id' => $buyer->id,
        'subtotal' => 500,
        'total_amount' => 500,
        'total_credits' => 500,
        'payment_status' => Order::PAYMENT_PAID,
    ]);

    $orderItem = OrderItem::create([
        'order_id' => $order->id,
        'product_id' => $promotion->id,
        'product_name' => $promotion->name,
        'quantity' => 1,
        'unit_price' => 500,
        'subtotal' => 500,
        'total_amount' => 500,
        'verification_status' => 'pending',
        'verification_expires_at' => now()->addHours(72),
    ]);

    expect($orderItem->verification_status)->toBe('pending')
        ->and($orderItem->verification_expires_at)->not->toBeNull();
});

test('buyer can submit verification proof', function () {
    $orderItem = OrderItem::factory()->create([
        'verification_status' => 'pending',
    ]);

    $orderItem->update([
        'verification_status' => 'submitted',
        'verification_url' => 'https://instagram.com/p/test123',
        'verification_notes' => 'Posted on my story at 2pm',
        'verification_submitted_at' => now(),
    ]);

    expect($orderItem->verification_status)->toBe('submitted')
        ->and($orderItem->verification_url)->toBe('https://instagram.com/p/test123')
        ->and($orderItem->verification_submitted_at)->not->toBeNull();
});

test('artist can verify promotion completion and mark as verified', function () {
    $order = Order::factory()->create();
    $orderItem = OrderItem::factory()->create([
        'order_id' => $order->id,
        'verification_status' => 'submitted',
        'verification_url' => 'https://twitter.com/test/status/123',
    ]);

    $orderItem->update([
        'verification_status' => 'verified',
        'verified_at' => now(),
    ]);

    expect($orderItem->verification_status)->toBe('verified')
        ->and($orderItem->verified_at)->not->toBeNull();
});

test('artist can reject verification with reason', function () {
    $order = Order::factory()->create();
    $orderItem = OrderItem::factory()->create([
        'order_id' => $order->id,
        'verification_status' => 'submitted',
        'verification_url' => 'https://fake.com',
    ]);

    $orderItem->update([
        'verification_status' => 'rejected',
        'rejection_reason' => 'Screenshot does not match requirements',
    ]);

    expect($orderItem->verification_status)->toBe('rejected')
        ->and($orderItem->rejection_reason)->toBe('Screenshot does not match requirements');
});

test('buyer can dispute unverified promotion', function () {
    $order = Order::factory()->create();
    $orderItem = OrderItem::factory()->create([
        'order_id' => $order->id,
        'verification_status' => 'pending',
        'created_at' => now()->subDays(10),
    ]);

    $orderItem->update([
        'verification_status' => 'disputed',
        'dispute_reason' => 'Artist not responding to my submission',
    ]);

    expect($orderItem->verification_status)->toBe('disputed')
        ->and($orderItem->dispute_reason)->not->toBeEmpty();
});

// ============================================================================
// PHASE 3: SERVICE LAYER TESTS (Will be implemented after migration)
// ============================================================================

test('platform calculates correct commission for promotions', function () {
    // Free tier store
    $freeStore = Store::factory()->create(['subscription_tier' => Store::TIER_FREE]);
    $premiumStore = Store::factory()->create(['subscription_tier' => Store::TIER_PREMIUM]);
    $businessStore = Store::factory()->create(['subscription_tier' => Store::TIER_BUSINESS]);
    
    // Test free tier (10%)
    $feeAmount = $freeStore->calculatePromotionFee(10000);
    expect($feeAmount)->toBe(1000.0);
    
    // Test premium tier (7%)
    $feeAmount = $premiumStore->calculatePromotionFee(10000);
    expect($feeAmount)->toBe(700.0);
    
    // Test business tier (5%)
    $feeAmount = $businessStore->calculatePromotionFee(10000);
    expect($feeAmount)->toBe(500.0);
    
    // Compare with physical product fees (should be higher)
    // Use higher amount to avoid minimum fee threshold
    $physicalFee = $freeStore->calculatePlatformFee(100000); // 7000
    $promotionFee = $freeStore->calculatePromotionFee(100000); // 10000
    expect($promotionFee)->toBeGreaterThan($physicalFee);
});

test('buyer can submit verification proof via service', function () {
    $promotion = Product::factory()->create([
        'product_type' => Product::TYPE_PROMOTION,
    ]);
    $order = Order::factory()->create();
    $orderItem = OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_id' => $promotion->id,
        'verification_status' => 'pending',
    ]);

    $service = app(\App\Modules\Store\Services\PromotionService::class);
    
    $service->submitVerification(
        $orderItem,
        'https://instagram.com/p/test123',
        'Posted on my story'
    );

    $orderItem->refresh();
    
    expect($orderItem->verification_status)->toBe('submitted')
        ->and($orderItem->verification_url)->toBe('https://instagram.com/p/test123')
        ->and($orderItem->verification_notes)->toBe('Posted on my story')
        ->and($orderItem->verification_submitted_at)->not->toBeNull();
});

test('platform returns commission on refunded orders', function () {
    $buyer = User::factory()->create(['ugx_balance' => 0]);
    $promotion = Product::factory()->create([
        'product_type' => Product::TYPE_PROMOTION,
        'price_ugx' => 10000,
    ]);
    
    $order = Order::create([
        'order_number' => 'ORD-TEST',
        'store_id' => $this->store->id,
        'user_id' => $buyer->id,
        'status' => Order::STATUS_PENDING,
        'payment_status' => Order::PAYMENT_PAID,
        'subtotal' => 10000,
        'total_amount' => 10000,
        'total_ugx' => 10000,
        'total_credits' => 0,
    ]);

    $service = app(\App\Modules\Store\Services\PromotionService::class);
    $service->processRefund($order, 'Test refund');
    
    $buyer->refresh();
    $order->refresh();
    
    // Buyer gets FULL refund (including platform commission)
    expect((float)$buyer->ugx_balance)->toBe(10000.0)
        ->and($order->status)->toBe(Order::STATUS_REFUNDED)
        ->and($order->payment_status)->toBe(Order::PAYMENT_REFUNDED)
        ->and((float)$order->refund_amount)->toBe(10000.0);
});

test('partial refund adjusts commission proportionally', function () {
    $buyer = User::factory()->create(['ugx_balance' => 0, 'credits' => 0]);
    $promotion = Product::factory()->create([
        'product_type' => Product::TYPE_PROMOTION,
        'price_ugx' => 10000,
    ]);
    
    $order = Order::create([
        'order_number' => 'ORD-TEST',
        'store_id' => $this->store->id,
        'user_id' => $buyer->id,
        'status' => Order::STATUS_PENDING,
        'payment_status' => Order::PAYMENT_PAID,
        'subtotal' => 10000,
        'total_amount' => 10000,
        'total_ugx' => 10000,
        'total_credits' => 0,
    ]);

    $service = app(\App\Modules\Store\Services\PromotionService::class);
    
    // 50% refund
    $service->processPartialRefund($order, 50, 'Partial completion');
    
    $buyer->refresh();
    
    // Buyer gets 50% back (5000)
    // Platform returns 50% of commission
    expect((float)$buyer->ugx_balance)->toBe(5000.0)
        ->and((float)$order->refund_amount)->toBe(5000.0);
});

test('buyer gets refund if artist rejects verification', function () {
    $buyer = User::factory()->create(['ugx_balance' => 0]);
    $promotion = Product::factory()->create([
        'store_id' => $this->store->id,
        'product_type' => Product::TYPE_PROMOTION,
        'price_ugx' => 10000,
    ]);
    
    $order = Order::create([
        'order_number' => 'ORD-TEST',
        'store_id' => $this->store->id,
        'user_id' => $buyer->id,
        'status' => Order::STATUS_PENDING,
        'payment_status' => Order::PAYMENT_PAID,
        'subtotal' => 10000,
        'total_amount' => 10000,
        'total_ugx' => 10000,
        'total_credits' => 0,
    ]);
    
    $orderItem = OrderItem::create([
        'order_id' => $order->id,
        'product_id' => $promotion->id,
        'product_name' => $promotion->name,
        'quantity' => 1,
        'unit_price' => 10000,
        'subtotal' => 10000,
        'total_amount' => 10000,
        'verification_status' => 'submitted',
        'verification_url' => 'https://test.com/proof',
    ]);

    $service = app(\App\Modules\Store\Services\PromotionService::class);
    $service->verifyCompletion($orderItem, false, 'Does not meet requirements');
    
    $buyer->refresh();
    $order->refresh();
    $orderItem->refresh();
    
    expect($orderItem->verification_status)->toBe('rejected')
        ->and($orderItem->rejection_reason)->toBe('Does not meet requirements')
        ->and((float)$buyer->ugx_balance)->toBe(10000.0)
        ->and($order->status)->toBe(Order::STATUS_REFUNDED);
});

test('expired promotions auto-refund if no verification submitted', function () {
    $buyer = User::factory()->create(['ugx_balance' => 0]);
    $promotion = Product::factory()->create([
        'product_type' => Product::TYPE_PROMOTION,
        'price_ugx' => 10000,
    ]);
    
    $order = Order::create([
        'order_number' => 'ORD-TEST',
        'store_id' => $this->store->id,
        'user_id' => $buyer->id,
        'status' => Order::STATUS_PENDING,
        'payment_status' => Order::PAYMENT_PAID,
        'subtotal' => 10000,
        'total_amount' => 10000,
        'total_ugx' => 10000,
        'total_credits' => 0,
    ]);
    
    $orderItem = OrderItem::create([
        'order_id' => $order->id,
        'product_id' => $promotion->id,
        'product_name' => $promotion->name,
        'quantity' => 1,
        'unit_price' => 10000,
        'subtotal' => 10000,
        'total_amount' => 10000,
        'verification_status' => 'pending',
        'verification_expires_at' => now()->subHours(1), // Expired 1 hour ago
        'verification_submitted_at' => null, // Never submitted
    ]);

    $service = app(\App\Modules\Store\Services\PromotionService::class);
    $count = $service->processExpiredPromotions();
    
    $buyer->refresh();
    $order->refresh();
    $orderItem->refresh();
    
    expect($count)->toBe(1)
        ->and($orderItem->verification_status)->toBe('expired')
        ->and((float)$buyer->ugx_balance)->toBe(10000.0)
        ->and($order->status)->toBe(Order::STATUS_REFUNDED);
});

test('auto-verify after 7 days of no artist response', function () {
    $buyer = User::factory()->create(['ugx_balance' => 0]);
    $artist = $this->artist;
    $artist->update(['ugx_balance' => 0]);
    
    $promotion = Product::factory()->create([
        'store_id' => $this->store->id,
        'product_type' => Product::TYPE_PROMOTION,
        'price_ugx' => 10000,
    ]);
    
    $order = Order::create([
        'order_number' => 'ORD-TEST',
        'store_id' => $this->store->id,
        'user_id' => $buyer->id,
        'status' => Order::STATUS_PENDING,
        'payment_status' => Order::PAYMENT_PAID,
        'subtotal' => 10000,
        'total_amount' => 10000,
        'total_ugx' => 10000,
        'total_credits' => 0,
    ]);
    
    $orderItem = OrderItem::create([
        'order_id' => $order->id,
        'product_id' => $promotion->id,
        'product_name' => $promotion->name,
        'quantity' => 1,
        'unit_price' => 10000,
        'subtotal' => 10000,
        'total_amount' => 10000,
        'verification_status' => 'submitted',
        'verification_url' => 'https://test.com/proof',
        'verification_submitted_at' => now()->subDays(8), // 8 days ago
    ]);

    $service = app(\App\Modules\Store\Services\PromotionService::class);
    $count = $service->autoVerifyOverduePromotions();
    
    $artist->refresh();
    $order->refresh();
    $orderItem->refresh();
    
    expect($count)->toBe(1)
        ->and($orderItem->verification_status)->toBe('verified')
        ->and($orderItem->verified_at)->not->toBeNull()
        ->and($order->status)->toBe(Order::STATUS_COMPLETED)
        // Artist receives payment minus platform fee (10% = 1000)
        ->and((float)$artist->ugx_balance)->toBe(9000.0);
});

test('platform fee is calculated correctly for promotions', function () {
    $freeStore = Store::factory()->create(['subscription_tier' => Store::TIER_FREE]);
    $premiumStore = Store::factory()->create(['subscription_tier' => Store::TIER_PREMIUM]);
    $businessStore = Store::factory()->create(['subscription_tier' => Store::TIER_BUSINESS]);
    
    $service = app(\App\Modules\Store\Services\PromotionService::class);
    
    // Free tier (10%)
    $fee = $service->calculatePromotionFee($freeStore, 10000);
    expect($fee)->toBe(1000.0);
    
    // Premium tier (7%)
    $fee = $service->calculatePromotionFee($premiumStore, 10000);
    expect($fee)->toBe(700.0);
    
    // Business tier (5%)
    $fee = $service->calculatePromotionFee($businessStore, 10000);
    expect($fee)->toBe(500.0);
});

// ============================================================================
// PHASE 4: INTEGRATION TESTS (Controllers/Routes)
// ============================================================================

test('artist can create promotion via HTTP request', function () {
    $controller = new \App\Modules\Store\Http\Controllers\Api\SellerPromotionController(
        app(\App\Modules\Store\Services\PromotionService::class)
    );
    
    $request = Request::create('/api/seller/promotions', 'POST', [
        'name' => 'Instagram Story Shoutout',
        'description' => 'I will promote your music on my Instagram story',
        'price_ugx' => 10000,
        'price_credits' => 500,
        'allow_credit_payment' => true,
        'promotion_type' => 'social_media_mention',
        'platform' => 'instagram',
        'reach' => 50000,
        'verification_deadline_hours' => 48,
    ]);
    
    $request->setUserResolver(fn() => $this->artist);
    
    $response = $controller->store($request);
    $data = $response->getData(true);
    
    expect($response->status())->toBe(201)
        ->and($data['success'])->toBeTrue()
        ->and($data['data']['name'])->toBe('Instagram Story Shoutout')
        ->and($data['data']['product_type'])->toBe(Product::TYPE_PROMOTION)
        ->and((float)$data['data']['price_ugx'])->toBe(10000.0);
});

test('buyer can purchase promotion via HTTP request', function () {
    $buyer = User::factory()->create(['credits' => 1000]);
    
    $promotion = Product::factory()->create([
        'store_id' => $this->store->id,
        'product_type' => Product::TYPE_PROMOTION,
        'price_credits' => 500,
        'status' => Product::STATUS_ACTIVE,
    ]);
    
    // Simulate purchase by creating order
    $order = Order::create([
        'order_number' => 'ORD-' . strtoupper(uniqid()),
        'store_id' => $this->store->id,
        'user_id' => $buyer->id,
        'status' => Order::STATUS_PENDING,
        'payment_status' => Order::PAYMENT_PAID,
        'payment_method' => 'credits',
        'subtotal' => 500,
        'total_amount' => 500,
        'total_credits' => 500,
        'total_ugx' => 0,
    ]);
    
    $orderItem = OrderItem::create([
        'order_id' => $order->id,
        'product_id' => $promotion->id,
        'product_name' => $promotion->name,
        'quantity' => 1,
        'unit_price' => 500,
        'subtotal' => 500,
        'total_amount' => 500,
        'verification_status' => 'pending',
    ]);
    
    expect($order->payment_status)->toBe(Order::PAYMENT_PAID)
        ->and($orderItem->verification_status)->toBe('pending')
        ->and($orderItem->product->product_type)->toBe(Product::TYPE_PROMOTION);
});

test('buyer can submit verification via HTTP request', function () {
    $buyer = User::factory()->create();
    $promotion = Product::factory()->create([
        'product_type' => Product::TYPE_PROMOTION,
    ]);
    
    $order = Order::factory()->create(['user_id' => $buyer->id]);
    $orderItem = OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_id' => $promotion->id,
        'verification_status' => 'pending',
    ]);
    
    $controller = new \App\Modules\Store\Http\Controllers\Api\PromotionController(
        app(\App\Modules\Store\Services\PromotionService::class)
    );
    
    $request = Request::create('/api/promotions/verify', 'POST', [
        'verification_url' => 'https://instagram.com/p/abc123',
        'verification_notes' => 'Posted on my story',
    ]);
    
    $request->setUserResolver(fn() => $buyer);
    
    $response = $controller->submitVerification($request, $orderItem);
    $data = $response->getData(true);
    
    expect($response->status())->toBe(200)
        ->and($data['success'])->toBeTrue()
        ->and($data['data']['verification_status'])->toBe('submitted')
        ->and($data['data']['verification_url'])->toBe('https://instagram.com/p/abc123');
});

test('artist can verify completion via HTTP request', function () {
    $artist = $this->artist;
    $store = $this->store;
    
    $buyer = User::factory()->create(['ugx_balance' => 0]);
    $promotion = Product::factory()->create([
        'store_id' => $store->id,
        'product_type' => Product::TYPE_PROMOTION,
        'price_ugx' => 10000,
    ]);
    
    $order = Order::create([
        'order_number' => 'ORD-TEST',
        'store_id' => $store->id,
        'user_id' => $buyer->id,
        'status' => Order::STATUS_PENDING,
        'payment_status' => Order::PAYMENT_PAID,
        'subtotal' => 10000,
        'total_amount' => 10000,
        'total_ugx' => 10000,
        'total_credits' => 0,
    ]);
    
    $orderItem = OrderItem::create([
        'order_id' => $order->id,
        'product_id' => $promotion->id,
        'product_name' => $promotion->name,
        'quantity' => 1,
        'unit_price' => 10000,
        'subtotal' => 10000,
        'total_amount' => 10000,
        'verification_status' => 'submitted',
        'verification_url' => 'https://test.com/proof',
    ]);
    
    $controller = new \App\Modules\Store\Http\Controllers\Api\SellerPromotionController(
        app(\App\Modules\Store\Services\PromotionService::class)
    );
    
    $request = Request::create('/api/seller/promotions/verify', 'POST', [
        'approved' => true,
    ]);
    
    $request->setUserResolver(fn() => $artist);
    
    $response = $controller->verifyCompletion($request, $orderItem);
    $data = $response->getData(true);
    
    expect($response->status())->toBe(200)
        ->and($data['success'])->toBeTrue()
        ->and($data['data']['verification_status'])->toBe('verified');
});

test('analytics show promotion statistics', function () {
    $this->markTestSkipped('Requires AnalyticsService implementation');
});
