<?php

use App\Models\User;
use App\Modules\Store\Models\Store;
use App\Modules\Store\Models\Product;
use App\Modules\Store\Models\Order;
use App\Services\Store\ShippingService;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->shippingService = app(ShippingService::class);
});

test('calculates shipping cost for physical products', function () {
    $product = Product::factory()->create([
        'product_type' => 'physical',
        'weight' => 1000, // 1kg
    ]);

    $shippingAddress = [
        'city' => 'Kampala',
        'region' => 'Central',
    ];

    $cost = $this->shippingService->calculateShipping($product, $shippingAddress);

    expect($cost)->toBeGreaterThan(0);
});

test('digital products have zero shipping cost', function () {
    $product = Product::factory()->create(['product_type' => 'digital']);

    $shippingAddress = [
        'city' => 'Kampala',
        'region' => 'Central',
    ];

    $cost = $this->shippingService->calculateShipping($product, $shippingAddress);

    expect($cost)->toBe(0);
});

test('shipping cost varies by region', function () {
    $product = Product::factory()->create([
        'product_type' => 'physical',
        'weight' => 500,
    ]);

    $kampalaShipping = $this->shippingService->calculateShipping($product, [
        'city' => 'Kampala',
        'region' => 'Central',
    ]);

    $mbararaShipping = $this->shippingService->calculateShipping($product, [
        'city' => 'Mbarara',
        'region' => 'Western',
    ]);

    expect($mbararaShipping)->toBeGreaterThan($kampalaShipping);
});

test('order includes shipping address', function () {
    $store = Store::factory()->create();
    $product = Product::factory()->create(['store_id' => $store->id]);

    $order = Order::factory()->create([
        'user_id' => $this->user->id,
        'store_id' => $store->id,
        'shipping_address' => [
            'name' => 'John Doe',
            'phone' => '256700000000',
            'address' => '123 Main Street',
            'city' => 'Kampala',
            'region' => 'Central',
            'postal_code' => '00100',
        ],
    ]);

    expect($order->shipping_address)->toBeArray();
    expect($order->shipping_address['city'])->toBe('Kampala');
});

test('store owner can update order tracking number', function () {
    $owner = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $owner->id]);
    $order = Order::factory()->create([
        'store_id' => $store->id,
        'status' => 'processing',
        'payment_status' => 'paid',
    ]);

    $response = $this->actingAs($owner)->post(route('frontend.store.orders.update-tracking', $order), [
        'tracking_number' => 'TRK123456',
        'shipping_provider' => 'Posta Uganda',
    ]);

    $response->assertRedirect();

    $order->refresh();
    expect($order->tracking_number)->toBe('TRK123456');
    expect($order->shipping_provider)->toBe('Posta Uganda');
});

test('buyer receives notification when tracking added', function () {
    $buyer = User::factory()->create();
    $owner = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $owner->id]);
    $order = Order::factory()->create([
        'store_id' => $store->id,
        'user_id' => $buyer->id,
        'status' => 'processing',
        'payment_status' => 'paid',
    ]);

    $this->actingAs($owner)->post(route('frontend.store.orders.update-tracking', $order), [
        'tracking_number' => 'TRK123456',
    ]);

    $this->assertDatabaseHas('notifications', [
        'user_id' => $buyer->id,
        'type' => 'order_shipped',
    ]);
});

test('buyer can mark order as received', function () {
    $store = Store::factory()->create();
    $order = Order::factory()->create([
        'store_id' => $store->id,
        'user_id' => $this->user->id,
        'status' => 'shipped',
    ]);

    $response = $this->actingAs($this->user)->post(route('frontend.store.orders.confirm-received', $order));

    $response->assertRedirect();

    $order->refresh();
    expect($order->status)->toBe('completed');
    expect($order->completed_at)->not->toBeNull();
});

test('free shipping for orders above threshold', function () {
    config(['store.free_shipping_threshold' => 50000]); // UGX 50,000

    $order = Order::factory()->create([
        'subtotal' => 60000,
        'shipping_amount' => 0,
    ]);

    expect((float)$order->shipping_cost)->toBe(0.0);
});

test('shipping cost added to order total', function () {
    $product = Product::factory()->create([
        'product_type' => 'physical',
        'price' => 10000,
    ]);

    $order = Order::factory()->create([
        'subtotal' => 10000,
        'shipping_amount' => 3000,
    ]);

    expect($order->total)->toBe(13000.0);
});

test('can offer local pickup option', function () {
    $store = Store::factory()->create([
        'offers_local_pickup' => true,
        'pickup_address' => '123 Shop Street, Kampala',
    ]);

    $product = Product::factory()->create(['store_id' => $store->id]);

    $order = Order::factory()->create([
        'store_id' => $store->id,
        'shipping_amount' => 0,
    ]);

    expect((float)$order->shipping_cost)->toBe(0.0);
});
