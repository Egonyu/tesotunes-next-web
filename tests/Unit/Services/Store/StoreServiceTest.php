<?php

use App\Models\User;
use App\Modules\Store\Models\Store;
use App\Modules\Store\Models\ProductCategory;
use App\Modules\Store\Services\StoreService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->storeService = app(StoreService::class);
    $this->user = User::factory()->create();
});

test('creates store for user', function () {
    $category = ProductCategory::factory()->create();

    $storeData = [
        'name' => 'Test Store',
        'slug' => 'test-store',
        'description' => 'A test store description',
        'categories' => [$category->id],
    ];

    $store = $this->storeService->create($this->user, $storeData);

    expect($store)->toBeInstanceOf(Store::class);
    expect($store->user_id)->toBe($this->user->id);
    expect($store->name)->toBe('Test Store');
    expect($store->status)->toBe('pending');
});

test('generates unique slug for duplicate names', function () {
    $store1 = Store::factory()->create(['name' => 'My Store']);

    $storeData = [
        'name' => 'My Store',
    ];

    $store2 = $this->storeService->create($this->user, $storeData);
    
    expect($store2->slug)->not->toBe($store1->slug);
    expect($store2->slug)->toStartWith('my-store');
});

test('calculates store revenue correctly', function () {
    $store = Store::factory()->create(['user_id' => $this->user->id]);
    
    // Create completed orders
    App\Modules\Store\Models\Order::factory()->count(3)->create([
        'store_id' => $store->id,
        'total_ugx' => 10000,
        'status' => 'delivered',
        'payment_status' => 'paid',
    ]);

    $revenue = $this->storeService->calculateRevenue($store);

    expect($revenue['total'])->toBe(30000.0);
    expect($revenue['orders_count'])->toBe(3);
});

test('calculates store commission correctly', function () {
    $store = Store::factory()->create(['user_id' => $this->user->id]);
    
    App\Modules\Store\Models\Order::factory()->create([
        'store_id' => $store->id,
        'total_amount' => 10000,
        'platform_fee_ugx' => 500,
        'status' => 'delivered',
    ]);

    $commission = $this->storeService->calculateCommission($store);

    expect($commission)->toBe(500.0);
});

test('gets store analytics', function () {
    $store = Store::factory()->create(['user_id' => $this->user->id]);

    $analytics = $this->storeService->getAnalytics($store, 30);

    expect($analytics)->toHaveKeys([
        'total_revenue',
        'total_orders',
        'pending_orders',
        'completed_orders',
        'cancelled_orders',
        'total_products',
        'views',
    ]);
});

test('suspends store with reason', function () {
    $store = Store::factory()->create(['status' => 'active']);

    $this->storeService->suspend($store, 'Policy violation');

    $store->refresh();
    
    expect($store->status)->toBe('suspended');
    expect($store->suspended_reason)->toBe('Policy violation');
    expect($store->suspended_at)->not->toBeNull();
});

test('activates suspended store', function () {
    $store = Store::factory()->create([
        'status' => 'suspended',
        'suspended_at' => now(),
    ]);

    $this->storeService->activate($store);

    $store->refresh();
    
    expect($store->status)->toBe('active');
    expect($store->suspended_reason)->toBeNull();
    expect($store->suspended_at)->toBeNull();
});

test('verifies store sets verified status', function () {
    $store = Store::factory()->create(['is_verified' => false]);

    $this->storeService->verify($store);

    $store->refresh();
    
    expect($store->is_verified)->toBeTrue();
    expect($store->verified_at)->not->toBeNull();
});
