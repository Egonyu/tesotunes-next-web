<?php

use App\Models\User;
use App\Modules\Store\Models\Product;
use App\Services\Store\CartService;
use Illuminate\Support\Facades\Cache;

beforeEach(function () {
    $this->cartService = app(CartService::class);
    $this->user = User::factory()->create(['credits' => 1000]);
});

test('adds item to cart successfully', function () {
    $product = Product::factory()->create([
        'price_ugx' => 1000,
        'status' => 'active',
        'inventory_quantity' => 10,
    ]);

    $this->cartService->addItem($product, 2);

    $cart = $this->cartService->getCart();
    
    expect($cart)->toHaveKey('items');
    expect($cart['items'])->toHaveCount(1);
});

test('calculates cart total correctly for money payment', function () {
    $product1 = Product::factory()->create([
        'price_ugx' => 1000,
        'status' => 'active',
        'inventory_quantity' => 10,
    ]);
    $product2 = Product::factory()->create([
        'price_ugx' => 2500,
        'status' => 'active',
        'inventory_quantity' => 10,
    ]);

    $this->cartService->addItem($product1, 2);
    $this->cartService->addItem($product2, 1);

    $cart = $this->cartService->getCart();

    expect($cart['totals']['total'])->toBe(4500.0); // (1000 * 2) + (2500 * 1)
});

test('calculates cart total correctly for credit payment', function () {
    $product1 = Product::factory()->create([
        'price_ugx' => 10000,
        'price_credits' => 100,
        'status' => 'active',
        'inventory_quantity' => 10,
    ]);
    $product2 = Product::factory()->create([
        'price_ugx' => 25000,
        'price_credits' => 250,
        'status' => 'active',
        'inventory_quantity' => 10,
    ]);

    $this->cartService->addItem($product1, 2);
    $this->cartService->addItem($product2, 1);

    $totals = $this->cartService->getCartTotal('credit');

    expect($totals['total_credits'])->toBe(45000); // Total converted to credits
});

test('throws exception when adding out of stock product', function () {
    $product = Product::factory()->create([
        'inventory_quantity' => 0,
        'status' => 'out_of_stock',
    ]);

    expect(fn() => $this->cartService->addItem($product, 1))
        ->toThrow(\Exception::class, 'out of stock');
});

test('throws exception when quantity exceeds stock', function () {
    $product = Product::factory()->create([
        'inventory_quantity' => 5,
        'track_inventory' => true,
        'status' => 'active',
    ]);

    expect(fn() => $this->cartService->addItem($product, 10))
        ->toThrow(\Exception::class, 'Insufficient stock');
});

test('updates item quantity in cart', function () {
    $product = Product::factory()->create([
        'inventory_quantity' => 10,
        'status' => 'active',
    ]);

    $this->cartService->addItem($product, 2);
    
    // Generate the item ID that CartService uses
    $itemId = "product_{$product->id}_" . md5(serialize([]));
    $this->cartService->updateQuantity($itemId, 5);

    $cart = $this->cartService->getCart();
    $items = array_values($cart['items']);

    expect($items[0]['quantity'])->toBe(5);
});

test('removes item from cart', function () {
    $product = Product::factory()->create([
        'status' => 'active',
        'inventory_quantity' => 10,
    ]);

    $this->cartService->addItem($product, 2);
    
    // Generate the item ID that CartService uses
    $itemId = "product_{$product->id}_" . md5(serialize([]));
    $this->cartService->removeItem($itemId);

    $cart = $this->cartService->getCart();

    expect($cart['items'])->toBeEmpty();
});

test('clears entire cart', function () {
    $products = Product::factory()->count(3)->create([
        'status' => 'active',
        'inventory_quantity' => 10,
    ]);

    foreach ($products as $product) {
        $this->cartService->addItem($product, 1);
    }

    $this->cartService->clear();

    $cart = $this->cartService->getCart();

    expect($cart['items'])->toBeEmpty();
});

test('handles product variants correctly', function () {
    $product = Product::factory()->create([
        'price_ugx' => 1000,
        'status' => 'active',
        'inventory_quantity' => 10,
    ]);
    $options = ['size' => 'L', 'color' => 'Blue'];

    $this->cartService->addItem($product, 1, $options);

    $cart = $this->cartService->getCart();
    $items = array_values($cart['items']);

    expect($items[0]['options'])->toBe($options);
});
