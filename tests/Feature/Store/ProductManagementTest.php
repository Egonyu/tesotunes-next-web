<?php

use App\Models\User;
use App\Modules\Store\Models\Store;
use App\Modules\Store\Models\Product;
use App\Modules\Store\Models\ProductCategory;

test('store owner can create a product', function () {
    $user = User::factory()->create();
    $store = Store::factory()->create([
        'user_id' => $user->id,
        'owner_id' => $user->id,
        'owner_type' => User::class,
    ]);
    $category = ProductCategory::factory()->create();
    
    $response = $this->actingAs($user)->post(route('frontend.store.products.store', $store), [
        'name' => 'Test Product',
        'description' => 'A test product',
        'product_type' => 'physical',
        'category_id' => $category->id,
        'price_ugx' => 10000, // Price in UGX
        'inventory_quantity' => 100,
    ]);
    
    $response->assertStatus(302); // Should redirect
    
    $this->assertDatabaseHas('store_products', [
        'name' => 'Test Product',
        'store_id' => $store->id,
    ]);
});

test('product creation requires store ownership', function () {
    $owner = User::factory()->create();
    $user = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $owner->id]);
    
    $response = $this->actingAs($user)->post(route('frontend.store.products.store', $store), [
        'name' => 'Test Product',
        'slug' => 'test-product',
        'description' => 'A test product',
        'product_type' => 'physical',
        'price_ugx' => 10000,
    ]);
    
    $response->assertForbidden();
});

test('product price is stored in cents', function () {
    $user = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $user->id]);
    
    $response = $this->actingAs($user)->post(route('frontend.store.products.store', $store), [
        'name' => 'Test Product',
        'slug' => 'test-product',
        'description' => 'A test product',
        'product_type' => 'physical',
        'price_ugx' => 10000,
        'stock_quantity' => 100,
    ]);
    
    $this->assertDatabaseHas('store_products', [
        'name' => 'Test Product',
        'price_ugx' => 10000
    ]);
});

test('digital product does not require stock quantity', function () {
    $user = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $user->id]);
    
    $response = $this->actingAs($user)->post(route('frontend.store.products.store', $store), [
        'name' => 'Digital Product',
        'slug' => 'digital-product',
        'description' => 'A digital product',
        'product_type' => 'digital',
        'price_ugx' => 5000,
    ]);
    
    $response->assertRedirect();
    $this->assertDatabaseHas('store_products', [
        'name' => 'Digital Product',
        'product_type' => 'digital',
    ]);
});

test('service product does not require stock', function () {
    $user = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $user->id]);
    
    $response = $this->actingAs($user)->post(route('frontend.store.products.store', $store), [
        'name' => 'Consultation Service',
        'slug' => 'consultation-service',
        'description' => 'A consultation service',
        'product_type' => 'service',
        'price_ugx' => 50000,
    ]);
    
    $response->assertRedirect();
    $this->assertDatabaseHas('store_products', [
        'name' => 'Consultation Service',
        'product_type' => 'service',
    ]);
});

test('product can have credit price', function () {
    $user = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $user->id]);
    
    $response = $this->actingAs($user)->post(route('frontend.store.products.store', $store), [
        'name' => 'Credit Product',
        'slug' => 'credit-product',
        'description' => 'Purchasable with credits',
        'product_type' => 'physical',
        'price_ugx' => 10000,
        'price_credits' => 500,
        'stock_quantity' => 50,
    ]);
    
    $this->assertDatabaseHas('store_products', [
        'name' => 'Credit Product',
        'price_credits' => 500,
    ]);
});

test('product owner can update product', function () {
    $user = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $user->id]);
    $product = Product::factory()->create(['store_id' => $store->id]);
    
    $response = $this->actingAs($user)->put(route('frontend.store.products.update', [$store, $product]), [
        'name' => 'Updated Product',
        'slug' => $product->slug,
        'description' => $product->description,
        'product_type' => $product->product_type,
        'price_ugx' => 15000,
    ]);
    
    $response->assertRedirect();
    $this->assertDatabaseHas('store_products', [
        'id' => $product->id,
        'name' => 'Updated Product',
    ]);
});

test('product owner can delete product', function () {
    $user = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $user->id]);
    $product = Product::factory()->create(['store_id' => $store->id]);
    
    $response = $this->actingAs($user)->delete(route('frontend.store.products.destroy', [$store, $product]));
    
    $response->assertRedirect();
    $this->assertSoftDeleted('store_products', ['id' => $product->id]);
});

test('products are filtered by type', function () {
    Store::factory()
        ->has(Product::factory()->count(3)->state(['product_type' => 'physical']))
        ->has(Product::factory()->count(2)->state(['product_type' => 'digital']))
        ->create(['status' => 'active']);
    
    $response = $this->get(route('frontend.store.products.index', ['type' => 'physical']));
    
    $response->assertOk();
    $products = $response->viewData('products');
    expect($products->count())->toBe(3);
});

test('out of stock products are marked correctly', function () {
    $store = Store::factory()->create(['status' => 'active']);
    $product = Product::factory()->create([
        'store_id' => $store->id,
        'stock_quantity' => 0,
        'status' => 'out_of_stock',
    ]);
    
    $response = $this->get(route('frontend.store.products.show', $product));
    
    $response->assertSee('Out of Stock');
});
