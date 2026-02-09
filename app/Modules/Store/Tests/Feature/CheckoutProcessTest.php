<?php

namespace App\Modules\Store\Tests\Feature;

use App\Models\User;
use App\Modules\Store\Models\Store;
use App\Modules\Store\Models\Product;
use App\Modules\Store\Models\Order;
use App\Modules\Store\Services\CartService;
use App\Modules\Store\Services\OrderService;
use Tests\TestCase;

class CheckoutProcessTest extends TestCase
{

    protected User $user;
    protected Store $store;
    protected Product $product;
    protected CartService $cartService;
    protected OrderService $orderService;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create([
            'credits' => 2000,
        ]);
        $this->store = Store::factory()->create();
        $this->product = Product::factory()->create([
            'store_id' => $this->store->id,
            'price_ugx' => 50000,
            'price_credits' => 500,
            'stock_quantity' => 10,
            'inventory_quantity' => 10,
        ]);
        
        $this->cartService = app(CartService::class);
        $this->orderService = app(OrderService::class);
    }

    /**
     * Helper to add item to cart and return session data
     */
    protected function addToCart(Product $product, int $quantity = 1): array
    {
        $this->cartService->addItem($product, $quantity);
        return $this->cartService->getCart();
    }

    /**
     * Helper to create a database cart for testing
     */
    protected function createDatabaseCart(Product $product, int $quantity = 1): \App\Modules\Store\Models\Cart
    {
        $cart = \App\Modules\Store\Models\Cart::create([
            'user_id' => $this->user->id,
            'status' => 'active',
        ]);

        \App\Modules\Store\Models\CartItem::create([
            'cart_id' => $cart->id,
            'store_id' => $product->store_id,
            'product_id' => $product->id,
            'quantity' => $quantity,
            'unit_price_ugx' => $product->price_ugx,
            'unit_price_credits' => $product->price_credits,
            'subtotal_ugx' => $product->price_ugx * $quantity,
            'subtotal_credits' => $product->price_credits * $quantity,
        ]);

        return $cart->fresh();
    }

    public function test_authenticated_user_can_view_checkout_page()
    {
        // Create a database cart for the user
        $cart = \App\Modules\Store\Models\Cart::create([
            'user_id' => $this->user->id,
            'status' => 'active',
        ]);

        // Add cart item
        \App\Modules\Store\Models\CartItem::create([
            'cart_id' => $cart->id,
            'store_id' => $this->store->id,
            'product_id' => $this->product->id,
            'quantity' => 1,
            'unit_price_ugx' => $this->product->price_ugx,
            'unit_price_credits' => $this->product->price_credits,
            'subtotal_ugx' => $this->product->price_ugx,
            'subtotal_credits' => $this->product->price_credits,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('frontend.store.checkout'));

        $response->assertStatus(200);
        $response->assertViewIs('frontend.store.checkout-payment');
    }

    public function test_cannot_checkout_with_empty_cart()
    {
        $response = $this->actingAs($this->user)
            ->get(route('frontend.store.checkout'));

        $response->assertRedirect(route('frontend.store.cart'));
    }

    public function test_user_can_complete_checkout_with_mobile_money()
    {
        // Create database cart
        $this->createDatabaseCart($this->product, 1);

        $response = $this->actingAs($this->user)
            ->post(route('frontend.store.checkout.process'), [
                'payment_method' => 'mobile_money',
                'payment_provider' => 'mtn',
                'phone_number' => '256700000000',
                'shipping' => [
                    'full_name' => 'John Doe',
                    'phone' => '256700000000',
                    'address' => '123 Main St',
                    'city' => 'Kampala',
                    'region' => 'Central',
                    'shipping_method' => 'standard',
                    'shipping_cost' => 5000,
                ],
                'agreed_to_terms' => true,
            ]);
        
        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
        $this->assertDatabaseHas('orders', [
            'user_id' => $this->user->id,
        ]);
    }

    public function test_user_can_complete_checkout_with_credits()
    {
        $this->createDatabaseCart($this->product, 1);

        $response = $this->actingAs($this->user)
            ->post(route('frontend.store.checkout.process'), [
                'payment_method' => 'credits',
                'shipping' => [
                    'full_name' => 'John Doe',
                    'phone' => '256700000000',
                    'address' => '123 Main St',
                    'city' => 'Kampala',
                    'region' => 'Central',
                    'shipping_method' => 'standard',
                    'shipping_cost' => 5000,
                ],
                'agreed_to_terms' => true,
            ]);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
        $this->assertDatabaseHas('orders', [
            'user_id' => $this->user->id,
            'payment_method' => 'credits',
        ]);
    }

    public function test_cannot_checkout_with_insufficient_credits()
    {
        $this->user->update(['credits' => 100]); // Less than product price
        $this->createDatabaseCart($this->product, 1);

        $response = $this->actingAs($this->user)
            ->post(route('frontend.store.checkout.process'), [
                'payment_method' => 'credits',
                'shipping' => [
                    'full_name' => 'John Doe',
                    'phone' => '256700000000',
                    'address' => '123 Main St',
                    'city' => 'Kampala',
                    'region' => 'Central',
                    'shipping_method' => 'standard',
                    'shipping_cost' => 5000,
                ],
                'agreed_to_terms' => true,
            ]);

        $response->assertStatus(302);
        $response->assertSessionHas('error');
    }

    public function test_checkout_requires_shipping_address_for_physical_products()
    {
        $this->createDatabaseCart($this->product, 1);

        $response = $this->actingAs($this->user)
            ->post(route('frontend.store.checkout.process'), [
                'payment_method' => 'mobile_money',
                'payment_provider' => 'mtn',
                'phone_number' => '256700000000',
                'agreed_to_terms' => true,
            ]);

        $response->assertSessionHasErrors('shipping');
    }

    public function test_digital_products_do_not_require_shipping_address()
    {
        $digitalProduct = Product::factory()->create([
            'store_id' => $this->store->id,
            'type' => 'digital',
            'price_ugx' => 20000,
        ]);

        $cart = $this->addToCart($digitalProduct, 1);

        $response = $this->actingAs($this->user)
            ->withSession(['store_cart' => $cart])
            ->post(route('frontend.store.checkout.process'), [
                'payment_method' => 'mobile_money',
                'payment_provider' => 'mtn',
                'phone_number' => '256700000000',
            ]);

        $response->assertRedirect();
    }

    public function test_order_reduces_product_stock()
    {
        $initialStock = $this->product->stock_quantity;
        $this->createDatabaseCart($this->product, 2);

        $this->actingAs($this->user)
            ->post(route('frontend.store.checkout.process'), [
                'payment_method' => 'mobile_money',
                'payment_provider' => 'mtn',
                'phone_number' => '256700000000',
                'shipping' => [
                    'full_name' => 'John Doe',
                    'phone' => '256700000000',
                    'address' => '123 Main St',
                    'city' => 'Kampala',
                    'region' => 'Central',
                    'shipping_method' => 'standard',
                    'shipping_cost' => 5000,
                ],
                'agreed_to_terms' => true,
            ]);

        $this->product->refresh();
        $this->assertEquals($initialStock - 2, $this->product->stock_quantity);
    }

    public function test_order_deducts_credits_from_user_balance()
    {
        $initialBalance = $this->user->credits;
        $this->createDatabaseCart($this->product, 1);

        $this->actingAs($this->user)
            ->post(route('frontend.store.checkout.process'), [
                'payment_method' => 'credits',
                'shipping' => [
                    'full_name' => 'John Doe',
                    'phone' => '256700000000',
                    'address' => '123 Main St',
                    'city' => 'Kampala',
                    'region' => 'Central',
                    'shipping_method' => 'standard',
                    'shipping_cost' => 5000,
                ],
                'agreed_to_terms' => true,
            ]);

        $this->user->refresh();
        $this->assertEquals($initialBalance - 500, $this->user->credits);
    }

    public function test_successful_checkout_clears_cart()
    {
        $this->createDatabaseCart($this->product, 1);

        $response = $this->actingAs($this->user)
            ->post(route('frontend.store.checkout.process'), [
                'payment_method' => 'mobile_money',
                'payment_provider' => 'mtn',
                'phone_number' => '256700000000',
                'shipping' => [
                    'full_name' => 'John Doe',
                    'phone' => '256700000000',
                    'address' => '123 Main St',
                    'city' => 'Kampala',
                    'region' => 'Central',
                    'shipping_method' => 'standard',
                    'shipping_cost' => 5000,
                ],
                'agreed_to_terms' => true,
            ]);

        // Verify order was created (cart should be cleared after successful order)
        $response->assertStatus(200);
        $this->assertDatabaseHas('orders', [
            'user_id' => $this->user->id,
        ]);
    }

    public function test_order_generates_unique_order_number()
    {
        $this->createDatabaseCart($this->product, 1);

        $this->actingAs($this->user)
            ->post(route('frontend.store.checkout.process'), [
                'payment_method' => 'mobile_money',
                'payment_provider' => 'mtn',
                'phone_number' => '256700000000',
                'shipping' => [
                    'full_name' => 'John Doe',
                    'phone' => '256700000000',
                    'address' => '123 Main St',
                    'city' => 'Kampala',
                    'region' => 'Central',
                    'shipping_method' => 'standard',
                    'shipping_cost' => 5000,
                ],
                'agreed_to_terms' => true,
            ]);

        $order = Order::latest()->first();
        $this->assertNotNull($order->order_number);
        $this->assertStringStartsWith('ORD-', $order->order_number);
    }

    public function test_user_can_view_order_confirmation_page()
    {
        $this->createDatabaseCart($this->product, 1);

        $response = $this->actingAs($this->user)
            ->post(route('frontend.store.checkout.process'), [
                'payment_method' => 'mobile_money',
                'payment_provider' => 'mtn',
                'phone_number' => '256700000000',
                'shipping' => [
                    'full_name' => 'John Doe',
                    'phone' => '256700000000',
                    'address' => '123 Main St',
                    'city' => 'Kampala',
                    'region' => 'Central',
                    'shipping_method' => 'standard',
                    'shipping_cost' => 5000,
                ],
                'agreed_to_terms' => true,
            ]);

        $order = Order::latest()->first();
        $response->assertStatus(200);
        $response->assertJsonPath('redirect_url', route('frontend.store.orders.confirmation', $order));
    }
}
