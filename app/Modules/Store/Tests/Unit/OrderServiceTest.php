<?php

namespace App\Modules\Store\Tests\Unit;

use App\Models\User;
use App\Modules\Store\Models\Store;
use App\Modules\Store\Models\Product;
use App\Modules\Store\Models\Order;
use App\Modules\Store\Services\OrderService;
use App\Modules\Store\Services\CartService;
use Tests\TestCase;

class OrderServiceTest extends TestCase
{

    protected OrderService $orderService;
    protected CartService $cartService;
    protected User $buyer;
    protected Store $store;
    protected Product $product;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->orderService = app(OrderService::class);
        $this->cartService = app(CartService::class);
        
        $this->buyer = User::factory()->create([
            'credits' => 2000,
        ]);
        
        $this->store = Store::factory()->create();
        $this->product = Product::factory()->create([
            'store_id' => $this->store->id,
            'price_ugx' => 50000,
            'price_credits' => 500,
            'inventory_quantity' => 10,
            'stock_quantity' => 10,
        ]);
    }

    public function test_can_create_order_from_cart()
    {
        $items = [
            [
                'product_id' => $this->product->id,
                'quantity' => 2,
            ],
        ];

        $orderData = [
            'store_id' => $this->store->id,
            'shipping_address' => [
                'name' => 'John Doe',
                'phone' => '256700000000',
                'address' => '123 Main St',
                'city' => 'Kampala',
                'country' => 'Uganda',
            ],
        ];

        $order = $this->orderService->create($this->buyer, $this->store, $items, $orderData);

        $this->assertInstanceOf(Order::class, $order);
        $this->assertEquals($this->buyer->id, $order->user_id);
        $this->assertEquals($this->store->id, $order->store_id);
    }

    public function test_order_generates_unique_order_number()
    {
        $items = [
            ['product_id' => $this->product->id, 'quantity' => 1],
        ];

        $orderData = [
            'store_id' => $this->store->id,
            'shipping_address' => [
                'name' => 'John Doe',
                'phone' => '256700000000',
                'address' => '123 Main St',
                'city' => 'Kampala',
                'country' => 'Uganda',
            ],
        ];

        $order1 = $this->orderService->create($this->buyer, $this->store, $items, $orderData);
        $order2 = $this->orderService->create($this->buyer, $this->store, $items, $orderData);

        $this->assertNotEquals($order1->order_number, $order2->order_number);
    }

    public function test_order_reduces_product_stock()
    {
        $initialStock = $this->product->inventory_quantity;
        
        $items = [
            ['product_id' => $this->product->id, 'quantity' => 3],
        ];

        $orderData = [
            'store_id' => $this->store->id,
            'shipping_address' => [
                'name' => 'John Doe',
                'phone' => '256700000000',
                'address' => '123 Main St',
                'city' => 'Kampala',
                'country' => 'Uganda',
            ],
        ];

        $this->orderService->create($this->buyer, $this->store, $items, $orderData);

        $this->product->refresh();
        $this->assertEquals($initialStock - 3, $this->product->inventory_quantity);
    }

    public function test_order_creates_correct_totals()
    {
        $items = [
            ['product_id' => $this->product->id, 'quantity' => 2],
        ];

        $orderData = [
            'store_id' => $this->store->id,
            'shipping_address' => [
                'name' => 'John Doe',
                'phone' => '256700000000',
                'address' => '123 Main St',
                'city' => 'Kampala',
                'country' => 'Uganda',
            ],
        ];

        $order = $this->orderService->create($this->buyer, $this->store, $items, $orderData);

        $this->assertEquals(100000, $order->subtotal_ugx); // 50000 * 2
        $this->assertEquals(1000, $order->subtotal_credits); // 500 * 2
    }

    public function test_can_mark_order_as_paid()
    {
        $items = [
            ['product_id' => $this->product->id, 'quantity' => 1],
        ];

        $orderData = [
            'store_id' => $this->store->id,
        ];

        $order = $this->orderService->create($this->buyer, $this->store, $items, $orderData);
        $this->orderService->markAsPaid($order, 50000, 0);

        $order->refresh();
        $this->assertEquals(Order::PAYMENT_PAID, $order->payment_status);
    }

    public function test_order_creates_order_items()
    {
        $product2 = Product::factory()->create(['store_id' => $this->store->id]);
        
        $items = [
            ['product_id' => $this->product->id, 'quantity' => 2],
            ['product_id' => $product2->id, 'quantity' => 1],
        ];

        $orderData = [
            'store_id' => $this->store->id,
            'shipping_address' => [
                'name' => 'John Doe',
                'phone' => '256700000000',
                'address' => '123 Main St',
                'city' => 'Kampala',
                'country' => 'Uganda',
            ],
        ];

        $order = $this->orderService->create($this->buyer, $this->store, $items, $orderData);

        $this->assertCount(2, $order->items);
    }

    public function test_can_mark_order_as_shipped()
    {
        $order = Order::factory()->create([
            'status' => Order::STATUS_PROCESSING,
            'user_id' => $this->buyer->id,
            'store_id' => $this->store->id,
        ]);

        $this->orderService->markAsShipped($order, 'TRACK123', 'DHL');

        $order->refresh();
        $this->assertEquals(Order::STATUS_SHIPPED, $order->status);
        $this->assertEquals('TRACK123', $order->tracking_number);
    }

    public function test_can_cancel_order()
    {
        $order = Order::factory()->create([
            'status' => Order::STATUS_PENDING,
            'user_id' => $this->buyer->id,
            'store_id' => $this->store->id,
        ]);

        $this->orderService->cancel($order, 'Customer request');

        $order->refresh();
        $this->assertEquals(Order::STATUS_CANCELLED, $order->status);
    }

    public function test_cancelled_order_restores_stock()
    {
        $initialStock = $this->product->inventory_quantity;
        
        $items = [
            ['product_id' => $this->product->id, 'quantity' => 3],
        ];

        $orderData = ['store_id' => $this->store->id];

        $order = $this->orderService->create($this->buyer, $this->store, $items, $orderData);

        $stockAfterOrder = $this->product->fresh()->inventory_quantity;
        $this->assertEquals($initialStock - 3, $stockAfterOrder);
        
        $this->orderService->cancel($order, 'Test cancellation');

        $this->product->refresh();
        $this->assertEquals($initialStock, $this->product->inventory_quantity);
    }

    public function test_can_mark_order_as_delivered()
    {
        $order = Order::factory()->create([
            'status' => Order::STATUS_SHIPPED,
            'user_id' => $this->buyer->id,
            'store_id' => $this->store->id,
        ]);

        $this->orderService->markAsDelivered($order);

        $order->refresh();
        $this->assertEquals(Order::STATUS_DELIVERED, $order->status);
    }
}
