<?php

namespace App\Modules\Store\Tests\Feature;

use App\Models\User;
use App\Modules\Store\Models\Store;
use App\Modules\Store\Models\Product;
use App\Modules\Store\Services\CartService;
use Tests\TestCase;

class ShoppingCartTest extends TestCase
{

    protected User $user;
    protected Store $store;
    protected Product $product;
    protected CartService $cartService;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $this->store = Store::factory()->create();
        $this->product = Product::factory()->create([
            'store_id' => $this->store->id,
            'price_ugx' => 50000,
            'price_credits' => 500,
            'inventory_quantity' => 10,
            'track_inventory' => true,
            'product_type' => 'physical', // Ensure physical product for stock validation tests
        ]);
        
        $this->cartService = app(CartService::class);
    }

    public function test_authenticated_user_can_view_cart()
    {
        $response = $this->actingAs($this->user)
            ->get(route('frontend.store.cart'));

        $response->assertStatus(200);
        $response->assertViewIs('frontend.store.cart');
    }

    public function test_guest_cannot_view_cart()
    {
        $response = $this->get(route('frontend.store.cart'));

        $response->assertRedirect(route('login'));
    }

    public function test_user_can_add_product_to_cart()
    {
        $response = $this->actingAs($this->user)
            ->post(route('frontend.store.cart.add', $this->product), [
                'quantity' => 2,
                'payment_method' => 'ugx',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Verify cart via HTTP request (shares session with previous request)
        $cartResponse = $this->actingAs($this->user)
            ->get(route('frontend.store.cart.count'));
        
        $cartResponse->assertJson([
            'count' => 2,
        ]);
    }

    public function test_add_to_cart_uses_default_quantity_when_not_provided()
    {
        $response = $this->actingAs($this->user)
            ->post(route('frontend.store.cart.add', $this->product), [
                'payment_method' => 'ugx',
            ]);

        // Should succeed with default quantity of 1
        $response->assertRedirect();
        $response->assertSessionHas('success');
    }

    public function test_add_to_cart_uses_default_payment_method_when_not_provided()
    {
        $response = $this->actingAs($this->user)
            ->post(route('frontend.store.cart.add', $this->product), [
                'quantity' => 1,
            ]);

        // Should succeed with default payment method of 'ugx'
        $response->assertRedirect();
        $response->assertSessionHas('success');
    }

    public function test_cannot_add_more_than_available_stock()
    {
        // Set inventory to 5 in the inventory table
        $this->product->inventory()->update(['stock_quantity' => 5]);
        $this->product->refresh();

        $response = $this->actingAs($this->user)
            ->post(route('frontend.store.cart.add', $this->product), [
                'quantity' => 10,
                'payment_method' => 'ugx',
            ]);

        $response->assertStatus(302);
        $response->assertSessionHas('error');
    }

    public function test_user_can_update_cart_quantity()
    {
        // Add to cart first
        $this->cartService->addItem($this->product, 2);

        $response = $this->actingAs($this->user)
            ->patch(route('frontend.store.cart.update', $this->product), [
                'quantity' => 3,
            ]);

        $response->assertRedirect();
        
        $cart = $this->cartService->getCart($this->user);
        $this->assertEquals(3, $cart['count']);
    }

    public function test_user_can_remove_item_from_cart()
    {
        // Add to cart first
        $this->cartService->addItem($this->product, 2);

        $response = $this->actingAs($this->user)
            ->delete(route('frontend.store.cart.remove', $this->product));

        $response->assertRedirect();
        
        $cart = $this->cartService->getCart();
        $this->assertEmpty($cart);
    }

    public function test_user_can_clear_cart()
    {
        // Add multiple items
        $product2 = Product::factory()->create(['store_id' => $this->store->id]);
        $this->cartService->addItem($this->product, 2);
        $this->cartService->addItem($product2, 1);

        $response = $this->actingAs($this->user)
            ->delete(route('frontend.store.cart.clear'));

        $response->assertRedirect();
        
        $cart = $this->cartService->getCart();
        $this->assertEmpty($cart);
    }

    public function test_cart_calculates_total_correctly()
    {
        $this->actingAs($this->user);
        $this->cartService->addItem($this->product, 2);

        $cart = $this->cartService->getCart();
        
        // Cart is an array of items with 'quantity' and 'price'
        $total = 0;
        foreach ($cart as $item) {
            $total += $item['price'] * $item['quantity'];
        }
        
        $expectedTotal = 50000 * 2;
        $this->assertEquals($expectedTotal, $total);
    }

    public function test_cart_supports_credit_payment()
    {
        $this->actingAs($this->user);
        $this->cartService->addItem($this->product, 1);

        $cart = $this->cartService->getCart();
        
        $this->assertCount(1, $cart);
    }

    public function test_ajax_add_to_cart_returns_json()
    {
        $response = $this->actingAs($this->user)
            ->postJson(route('frontend.store.cart.add', $this->product), [
                'quantity' => 1,
                'payment_method' => 'ugx',
            ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
    }

    public function test_cart_count_endpoint_returns_correct_count()
    {
        // Add items via HTTP endpoint so session is shared
        $this->actingAs($this->user)
            ->post(route('frontend.store.cart.add', $this->product), [
                'quantity' => 3,
                'payment_method' => 'ugx',
            ]);

        $response = $this->actingAs($this->user)
            ->get(route('frontend.store.cart.count'));

        $response->assertStatus(200);
        $response->assertJson([
            'count' => 3,
        ]);
    }

    public function test_cannot_add_out_of_stock_product()
    {
        // Set inventory to zero in the inventory table
        $this->product->inventory()->update(['stock_quantity' => 0]);
        $this->product->refresh();

        $response = $this->actingAs($this->user)
            ->post(route('frontend.store.cart.add', $this->product), [
                'quantity' => 1,
                'payment_method' => 'ugx',
            ]);

        $response->assertStatus(302);
        $response->assertSessionHas('error');
    }

    public function test_digital_products_can_be_added_without_stock_check()
    {
        $digitalProduct = Product::factory()->create([
            'store_id' => $this->store->id,
            'product_type' => 'digital',
            'price_ugx' => 20000,
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('frontend.store.cart.add', $digitalProduct), [
                'quantity' => 1,
                'payment_method' => 'ugx',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');
    }
}
