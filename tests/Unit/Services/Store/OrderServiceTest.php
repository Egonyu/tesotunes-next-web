<?php

use App\Models\User;
use App\Modules\Store\Models\Store;
use App\Modules\Store\Models\Product;
use App\Modules\Store\Models\Order;
use App\Modules\Store\Services\OrderService;
use App\Modules\Store\Services\CartService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use App\Events\Store\OrderCreated;

beforeEach(function () {
    $this->orderService = app(OrderService::class);
    $this->cartService = app(CartService::class);
    $this->user = User::factory()->create(['credits' => 5000]);
});

test('creates order from cart successfully', function () {
    $product = Product::factory()->create(['price_ugx' => 1000, 'inventory_quantity' => 10]);
    
    $this->cartService->addItem($product, 2);

    $orderData = [
        'payment_method' => 'mobile_money',
        'shipping_cost_ugx' => 0,
        'shipping_address' => [
            'name' => 'John Doe',
            'phone' => '256700000000',
            'address' => '123 Main St',
            'city' => 'Kampala',
            'region' => 'Central',
        ],
    ];

    $cart = $this->cartService->getCart();
    $order = $this->orderService->create($this->user, $product->store, $cart, $orderData);

    expect($order)->toBeInstanceOf(Order::class);
    expect($order->user_id)->toBe($this->user->id);
    expect((float)$order->total_ugx)->toBe(2000.0);
    expect($order->items)->toHaveCount(1);
});

test('deducts credits when paying with credits', function () {
    $product = Product::factory()->create(['price_credits' => 500]);
    
    $this->cartService->addItem($product, 1);

    $orderData = [
        'payment_method' => 'credit',
        'use_credits' => true,
        'shipping_cost_ugx' => 0,
        'shipping_cost_credits' => 0,
    ];

    $initialCredits = $this->user->credits;
    $cart = $this->cartService->getCart();
    $order = $this->orderService->create($this->user, $product->store, $cart, $orderData);

    $this->user->refresh();
    
    expect($this->user->credits)->toBe($initialCredits - 500);
    expect($order->payment_status)->toBe('paid');
});

test('reduces stock quantity after order', function () {
    $product = Product::factory()->create(['inventory_quantity' => 10]);
    
    $this->cartService->addItem($product, 3);

    $orderData = [
        'payment_method' => 'mobile_money',
        'shipping_address' => ['name' => 'Test', 'phone' => '256700000000'],
    ];

    $cart = $this->cartService->getCart();
    $this->orderService->create($this->user, $product->store, $cart, $orderData);

    $product->refresh();
    expect($product->inventory_quantity)->toBe(7);
});

test('marks product as out of stock when quantity reaches zero', function () {
    $product = Product::factory()->create(['inventory_quantity' => 2]);
    
    $this->cartService->addItem($product, 2);

    $orderData = [
        'payment_method' => 'mobile_money',
        'shipping_address' => ['name' => 'Test', 'phone' => '256700000000'],
    ];

    $cart = $this->cartService->getCart();
    $this->orderService->create($this->user, $product->store, $cart, $orderData);

    $product->refresh();
    expect($product->inventory_quantity)->toBe(0);
    expect($product->status)->toBe('out_of_stock');
});

test('generates unique order number', function () {
    $product = Product::factory()->create();
    $this->cartService->addItem($product, 1);

    $cart = $this->cartService->getCart();
    $order1 = $this->orderService->create($this->user, $product->store, $cart, [
        'payment_method' => 'mobile_money',
        'shipping_address' => ['name' => 'Test', 'phone' => '256700000000'],
    ]);

    $this->cartService->clearCart();
    $this->cartService->addItem($product, 1);

    $cart = $this->cartService->getCart();
    $order2 = $this->orderService->create($this->user, $product->store, $cart, [
        'payment_method' => 'mobile_money',
        'shipping_address' => ['name' => 'Test', 'phone' => '256700000000'],
    ]);

    expect($order1->order_number)->not->toBe($order2->order_number);
    expect($order1->order_number)->toMatch('/^ORD-\d{8}-[A-Z0-9]{6}$/');
});

test('dispatches order created event', function () {
    Event::fake();
    
    $product = Product::factory()->create();
    $this->cartService->addItem($product, 1);

    $cart = $this->cartService->getCart();
    $order = $this->orderService->create($this->user, $product->store, $cart, [
        'payment_method' => 'mobile_money',
        'shipping_address' => ['name' => 'Test', 'phone' => '256700000000'],
    ]);

    Event::assertDispatched(OrderCreated::class, function ($event) use ($order) {
        return $event->order->id === $order->id;
    });
});

test('calculates platform commission correctly', function () {
    $store = Store::factory()->create(['subscription_tier' => 'premium']);
    $product = Product::factory()->create(['price_ugx' => 50000, 'store_id' => $store->id]);
    $this->cartService->addItem($product, 1);

    $cart = $this->cartService->getCart();
    $order = $this->orderService->create($this->user, $product->store, $cart, [
        'payment_method' => 'mobile_money',
        'shipping_address' => ['name' => 'Test', 'phone' => '256700000000'],
    ]);

    // Premium tier has 5% fee on 50000 = 2500 (above minimum of 1000)
    $expectedCommission = 50000 * (5.0 / 100);
    
    expect((float)$order->platform_fee_ugx)->toBe($expectedCommission);
});

test('processes order fulfillment', function () {
    $order = Order::factory()->create([
        'status' => 'processing',
        'payment_status' => 'paid',
    ]);

    $this->orderService->markAsShipped($order, 'TRK123456');
    $this->orderService->markAsDelivered($order);

    $order->refresh();
    
    expect($order->status)->toBe('delivered');
    expect($order->tracking_number)->toBe('TRK123456');
    expect($order->delivered_at)->not->toBeNull();
});

test('cancels order and restores stock', function () {
    $product = Product::factory()->create(['inventory_quantity' => 5, 'price_ugx' => 10000]);
    $order = Order::factory()->create(['status' => 'pending']);
    
    // Get price - fallback to 10000 if null
    $priceUgx = $product->price_ugx ?? 10000;
    
    $order->items()->create([
        'product_id' => $product->id,
        'product_name' => $product->name,
        'quantity' => 2,
        'unit_price' => $priceUgx,
        'subtotal' => $priceUgx * 2,
        'total_amount' => $priceUgx * 2,
    ]);

    $initialStock = 3; // Stock after order
    $product->update(['inventory_quantity' => $initialStock, 'stock_quantity' => $initialStock]);

    $this->orderService->cancel($order, 'Customer requested cancellation');

    $product->refresh();
    $order->refresh();

    expect($order->status)->toBe('cancelled');
    expect($product->inventory_quantity)->toBe($initialStock + 2);
});

test('refunds credits on cancellation', function () {
    $product = Product::factory()->create(['price_credits' => 1000]);
    $order = Order::factory()->create([
        'user_id' => $this->user->id,
        'payment_method' => 'credit',
        'total_credits' => 1000,
        'status' => 'processing',
        'payment_status' => 'paid',
    ]);

    $initialCredits = $this->user->credits;

    $this->orderService->cancel($order, 'Refund requested');

    $this->user->refresh();
    expect($this->user->credits)->toBe($initialCredits + 1000);
});
