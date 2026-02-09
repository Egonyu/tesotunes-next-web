<?php

namespace App\Modules\Store\Tests\Unit;

use App\Models\User;
use App\Modules\Store\Models\Store;
use App\Modules\Store\Models\Order;
use App\Modules\Store\Models\OrderItem;
use App\Modules\Store\Models\Product;
use Tests\TestCase;

class OrderModelTest extends TestCase
{

    protected User $buyer;
    protected Store $store;
    protected Order $order;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->buyer = User::factory()->create();
        $this->store = Store::factory()->create();
        $this->order = Order::factory()->create([
            'user_id' => $this->buyer->id,
            'store_id' => $this->store->id,
            'status' => 'delivered', // Use non-interfering status for scope tests
        ]);
    }

    public function test_order_belongs_to_buyer()
    {
        $this->assertInstanceOf(User::class, $this->order->buyer);
        $this->assertEquals($this->buyer->id, $this->order->buyer->id);
    }

    public function test_order_belongs_to_store()
    {
        $this->assertInstanceOf(Store::class, $this->order->store);
        $this->assertEquals($this->store->id, $this->order->store->id);
    }

    public function test_order_has_items()
    {
        $product1 = Product::factory()->create(['store_id' => $this->store->id]);
        $product2 = Product::factory()->create(['store_id' => $this->store->id]);

        OrderItem::factory()->create([
            'order_id' => $this->order->id,
            'product_id' => $product1->id,
        ]);

        OrderItem::factory()->create([
            'order_id' => $this->order->id,
            'product_id' => $product2->id,
        ]);

        $this->assertCount(2, $this->order->items);
    }

    public function test_order_number_is_unique()
    {
        $order1 = Order::factory()->create();
        $order2 = Order::factory()->create();

        $this->assertNotEquals($order1->order_number, $order2->order_number);
    }

    public function test_order_calculates_total_correctly()
    {
        $this->order->update([
            'subtotal' => 50000,
            'shipping_cost' => 5000,
            'tax_amount' => 2500,
            'discount_amount' => 0,
        ]);
        
        $this->order->refresh(); // Reload from database to get fresh values

        $expectedTotal = 50000 + 5000 + 2500;
        $this->assertEquals($expectedTotal, $this->order->total);
    }

    public function test_order_has_payment_method()
    {
        $this->order->update(['payment_method' => 'mobile_money']);
        
        $this->assertEquals('mobile_money', $this->order->payment_method);
        $this->assertTrue(in_array($this->order->payment_method, ['mobile_money', 'credits', 'bank_transfer']));
    }

    public function test_order_has_status_tracking()
    {
        $this->order->update(['status' => 'pending']);
        $this->assertEquals('pending', $this->order->status);

        $this->order->update(['status' => 'processing']);
        $this->assertEquals('processing', $this->order->status);

        $this->order->update(['status' => 'completed']);
        $this->assertEquals('completed', $this->order->status);
    }

    public function test_order_has_shipping_address()
    {
        $shippingAddress = [
            'name' => 'John Doe',
            'phone' => '256700000000',
            'address' => '123 Main St',
            'city' => 'Kampala',
            'country' => 'Uganda',
        ];

        $this->order->update(['shipping_address' => $shippingAddress]);
        $this->order->refresh();

        $this->assertEquals($shippingAddress, $this->order->shipping_address);
        $this->assertIsArray($this->order->shipping_address);
    }

    public function test_order_scope_by_status()
    {
        Order::factory()->count(3)->create(['status' => 'pending']);
        Order::factory()->count(2)->create(['status' => 'completed']);

        $pendingOrders = Order::where('status', 'pending')->get();
        $completedOrders = Order::where('status', 'completed')->get();

        $this->assertCount(3, $pendingOrders);
        $this->assertCount(2, $completedOrders);
    }

    public function test_order_can_be_cancelled()
    {
        $this->order->update(['status' => 'cancelled']);
        
        $this->assertEquals('cancelled', $this->order->status);
    }
}
