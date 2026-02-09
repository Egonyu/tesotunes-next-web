<?php

use App\Models\User;
use App\Modules\Store\Models\Product;
use App\Modules\Store\Models\Store;
use App\Modules\Store\Models\Order;
use App\Services\Store\CartService;
use App\Modules\Store\Services\OrderService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create(['credits' => 2000]);
    $this->cartService = app(CartService::class);
    $this->orderService = app(OrderService::class);
});

test('cart service can add product with credit price', function () {
    $product = Product::factory()->create([
        'credit_price' => 500,
        'price_ugx' => 10000,
        'type' => 'digital',
    ]);

    $this->actingAs($this->user);
    $cart = $this->cartService->addItem($product, 1);

    expect($cart)->toHaveKey('items');
    expect($cart['totals']['total'])->toBeGreaterThan(0);
});

test('cart calculates credit total correctly', function () {
    $product = Product::factory()->create([
        'credit_price' => 1000,
        'price_ugx' => 50000,
    ]);

    $this->actingAs($this->user);
    $this->cartService->addItem($product, 2);

    $creditTotal = $this->cartService->getCartTotal('credit');
    expect($creditTotal['total_credits'])->toBeGreaterThan(0);
});

test('user with sufficient credits can create order', function () {
    $seller = User::factory()->create();
    $store = Store::factory()->create(['owner_id' => $seller->id, 'user_id' => $seller->id]);
    $product = Product::factory()->create([
        'store_id' => $store->id,
        'price_ugx' => 1000,
        'credit_price' => 100,
    ]);

    $order = $this->orderService->create(
        $this->user,
        $store,
        [
            [
                'product_id' => $product->id,
                'quantity' => 1,
                'price' => 1000,
            ],
        ],
        ['payment_method' => 'credit']
    );

    expect($order)->toBeInstanceOf(Order::class);
    expect($order->user_id)->toBe($this->user->id);
});

test('order service can cancel order', function () {
    $seller = User::factory()->create();
    $store = Store::factory()->create(['owner_id' => $seller->id, 'user_id' => $seller->id]);
    $product = Product::factory()->create([
        'store_id' => $store->id,
        'price_ugx' => 1000,
    ]);

    $order = $this->orderService->create(
        $this->user,
        $store,
        [
            [
                'product_id' => $product->id,
                'quantity' => 1,
                'price' => 1000,
            ],
        ],
        ['payment_method' => 'mobile_money']
    );

    $result = $this->orderService->cancel($order, 'Changed my mind');

    expect($result)->toBeTrue();
    $order->refresh();
    expect($order->status)->toBe('cancelled');
});

test('order can be marked as paid with credits', function () {
    $seller = User::factory()->create();
    $store = Store::factory()->create(['owner_id' => $seller->id, 'user_id' => $seller->id]);
    $product = Product::factory()->create([
        'store_id' => $store->id,
        'price_ugx' => 1000,
        'credit_price' => 100,
    ]);

    $order = $this->orderService->create(
        $this->user,
        $store,
        [
            [
                'product_id' => $product->id,
                'quantity' => 1,
                'price' => 1000,
            ],
        ],
        ['payment_method' => 'credit']
    );

    $result = $this->orderService->markAsPaid($order, 0, 100);

    expect($result)->toBeTrue();
    $order->refresh();
    expect($order->payment_status)->toBe('paid');
});

test('cart can be cleared', function () {
    $product = Product::factory()->create(['price_ugx' => 1000]);

    $this->actingAs($this->user);
    $this->cartService->addItem($product, 1);
    $this->cartService->clear();

    $cart = $this->cartService->getCart();
    expect($cart['items'])->toBeEmpty();
});

test('multiple products can be added to cart', function () {
    $product1 = Product::factory()->create(['price_ugx' => 1000]);
    $product2 = Product::factory()->create(['price_ugx' => 2000]);

    $this->actingAs($this->user);
    $this->cartService->addItem($product1, 1);
    $this->cartService->addItem($product2, 1);

    $cart = $this->cartService->getCart();
    expect(count($cart['items']))->toBe(2);
    expect($cart['totals']['total'])->toBe(3000.0);
});
