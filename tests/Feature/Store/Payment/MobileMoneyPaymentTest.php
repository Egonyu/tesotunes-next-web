<?php

use App\Models\User;
use App\Modules\Store\Models\Product;
use App\Modules\Store\Models\Order;
use App\Services\Store\CartService;
use App\Services\Payment\MobileMoneyService;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->cartService = app(CartService::class);
});

test('initiates mobile money payment for order', function () {
    Http::fake([
        'sandbox.momodeveloper.mtn.com/*' => Http::response(['status' => 'PENDING', 'transactionId' => 'TXN123'], 200),
    ]);

    $product = Product::factory()->create([
        'price_ugx' => 10000,
        'inventory_quantity' => 10,
    ]);
    
    $this->actingAs($this->user);
    $this->cartService->addItem($product, 1);

    $response = $this->actingAs($this->user)->post(route('frontend.store.checkout.process'), [
        'payment_method' => 'mobile_money',
        'payment_provider' => 'mtn',
        'phone_number' => '256700000000',
        'shipping_address' => [
            'name' => 'John Doe',
            'phone' => '256700000000',
            'address' => '123 Main St',
            'city' => 'Kampala',
            'region' => 'Central',
        ],
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('orders', [
        'user_id' => $this->user->id,
        'payment_method' => 'mobile_money',
        'payment_provider' => 'mtn',
        'payment_status' => 'pending',
    ]);
});

test('handles successful mobile money payment callback', function () {
    $order = Order::factory()->create([
        'payment_method' => 'mobile_money',
        'payment_status' => 'pending',
        'payment_provider' => 'mtn',
        'transaction_id' => 'TXN123',
    ]);

    $response = $this->post(route('webhooks.mobile-money'), [
        'referenceId' => $order->transaction_id,
        'status' => 'SUCCESSFUL',
        'amount' => $order->total,
    ]);

    $response->assertOk();

    $order->refresh();
    
    expect($order->payment_status)->toBe('paid');
    expect($order->paid_at)->not->toBeNull();
});

test('handles failed mobile money payment callback', function () {
    $order = Order::factory()->create([
        'payment_method' => 'mobile_money',
        'payment_status' => 'pending',
        'transaction_id' => 'TXN123',
    ]);

    $response = $this->post(route('webhooks.mobile-money'), [
        'referenceId' => $order->transaction_id,
        'status' => 'FAILED',
        'message' => 'Insufficient balance',
    ]);

    $response->assertOk();

    $order->refresh();
    
    expect($order->payment_status)->toBe('failed');
    expect($order->payment_failure_reason)->toBe('Insufficient balance');
});

test('validates phone number format for mobile money', function () {
    $product = Product::factory()->create(['price_ugx' => 10000]);
    
    $this->actingAs($this->user);
    $this->cartService->addItem($product, 1);

    $response = $this->actingAs($this->user)->post(route('frontend.store.checkout.process'), [
        'payment_method' => 'mobile_money',
        'payment_provider' => 'mtn',
        'phone_number' => 'invalid_phone',
        'shipping_address' => [
            'name' => 'John Doe',
            'phone' => '256700000000',
            'address' => '123 Main St',
            'city' => 'Kampala',
            'region' => 'Central',
        ],
    ]);

    $response->assertSessionHasErrors('phone_number');
});

test('supports multiple mobile money providers', function () {
    Http::fake([
        'openapiuat.airtel.africa/*' => Http::response(['status' => 'PENDING'], 200),
    ]);

    $product = Product::factory()->create(['price_ugx' => 10000]);
    
    $this->actingAs($this->user);
    $this->cartService->addItem($product, 1);

    $response = $this->actingAs($this->user)->post(route('frontend.store.checkout.process'), [
        'payment_method' => 'mobile_money',
        'payment_provider' => 'airtel',
        'phone_number' => '256750000000',
        'shipping_address' => [
            'name' => 'John Doe',
            'phone' => '256750000000',
            'address' => '123 Main St',
            'city' => 'Kampala',
            'region' => 'Central',
        ],
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $this->assertDatabaseHas('orders', [
        'payment_method' => 'mobile_money',
        'payment_provider' => 'airtel',
    ]);
});

test('stores transaction id from payment provider', function () {
    Http::fake([
        'sandbox.momodeveloper.mtn.com/*' => Http::response([
            'status' => 'PENDING',
            'transactionId' => 'MTN-TXN-123456',
        ], 200),
    ]);

    $product = Product::factory()->create([
        'price_ugx' => 10000,
        'inventory_quantity' => 10,
        'stock_quantity' => 10,
    ]);
    
    $this->actingAs($this->user);
    $this->cartService->addItem($product, 1);

    $this->actingAs($this->user)->post(route('frontend.store.checkout.process'), [
        'payment_method' => 'mobile_money',
        'payment_provider' => 'mtn',
        'phone_number' => '256700000000',
        'shipping_address' => [
            'name' => 'John Doe',
            'phone' => '256700000000',
            'address' => '123 Main St',
            'city' => 'Kampala',
            'region' => 'Central',
        ],
    ]);

    $this->assertDatabaseHas('orders', [
        'transaction_id' => 'MTN-TXN-123456',
    ]);
});
