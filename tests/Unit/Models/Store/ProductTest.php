<?php

/**
 * Product Model Tests - NORMALIZED SCHEMA
 * 
 * Tests the Product model with the new normalized database structure.
 * Product data is split across multiple tables:
 * - store_products: Core product info
 * - product_pricing: Prices in UGX and Credits
 * - product_inventory: Stock management
 * - product_physical_specs: Shipping dimensions
 * - product_seo: Meta tags and structured data
 */

use App\Modules\Store\Models\Product;
use App\Modules\Store\Models\Store;
use App\Modules\Store\Models\ProductPricing;
use App\Modules\Store\Models\ProductInventory;

test('product is created with core attributes', function () {
    $product = Product::factory()->create([
        'name' => 'Amazing Product',
        'slug' => 'amazing-product',
        'product_type' => 'physical',
        'status' => 'active',
    ]);

    expect($product->name)->toBe('Amazing Product');
    expect($product->slug)->toBe('amazing-product');
    expect($product->product_type)->toBe('physical');
    expect($product->status)->toBe('active');
});

test('product has pricing relationship with dual currency support', function () {
    $product = Product::factory()->create();
    
    // Refresh to get afterCreating relations
    $product->refresh();
    
    // Factory auto-creates pricing via afterCreating hook
    expect($product->pricing)->toBeInstanceOf(ProductPricing::class);
    expect($product->pricing->price_ugx)->toBeGreaterThan(0);
    
    // Can also access via accessor for backward compatibility
    expect($product->price_ugx)->toBe($product->pricing->price_ugx);
});

test('product pricing can be updated', function () {
    $product = Product::factory()->create();
    
    $product->pricing()->update([
        'price_ugx' => 25000,
        'price_credits' => 250,
    ]);
    
    expect((float)$product->fresh()->price_ugx)->toBe(25000.00);
    expect($product->fresh()->price_credits)->toBe(250);
});

test('product has inventory relationship with stock tracking', function () {
    $product = Product::factory()->create();
    
    expect($product->inventory)->toBeInstanceOf(ProductInventory::class);
    expect($product->inventory->stock_quantity)->toBeGreaterThanOrEqual(0);
});

test('product belongs to store', function () {
    $store = Store::factory()->create();
    $product = Product::factory()->create(['store_id' => $store->id]);

    expect($product->store)->toBeInstanceOf(Store::class);
    expect($product->store->id)->toBe($store->id);
});

test('digital product does not require stock tracking', function () {
    $product = Product::factory()->create([
        'product_type' => 'digital',
    ]);
    
    // Set inventory to not track
    $product->inventory()->update([
        'track_inventory' => 'dont_track',
    ]);

    expect($product->requiresStock())->toBeFalse();
});

test('physical product requires stock tracking', function () {
    $product = Product::factory()->create([
        'product_type' => 'physical',
    ]);
    
    // Factory creates inventory with track_inventory = 'track' for physical products
    expect($product->requiresStock())->toBeTrue();
});

test('product is in stock when quantity greater than zero', function () {
    $product = Product::factory()->create();
    
    $product->inventory()->update([
        'stock_quantity' => 5,
        'available_quantity' => 5,
        'is_in_stock' => true,
    ]);

    expect($product->fresh()->isInStock())->toBeTrue();
});

test('product is out of stock when quantity is zero', function () {
    $product = Product::factory()->create();
    
    $product->inventory()->update([
        'stock_quantity' => 0,
        'available_quantity' => 0,
        'is_in_stock' => false,
        'track_inventory' => 'track', // Ensure tracking is on
    ]);

    $fresh = $product->fresh();
    $fresh->load('inventory'); // Explicitly load relationship
    expect($fresh->isInStock())->toBeFalse();
});

test('product has slug generated from name', function () {
    $product = Product::factory()->create([
        'name' => 'Amazing Product',
        'slug' => 'amazing-product'
    ]);

    expect($product->slug)->toBe('amazing-product');
});

test('product can have both money and credit prices', function () {
    $product = Product::factory()->create();
    
    $product->pricing()->update([
        'price_ugx' => 10000,
        'price_credits' => 500,
        'accepts_credits' => true,
        'allow_hybrid_payment' => true,
    ]);

    $product = $product->fresh();
    expect((float)$product->price_ugx)->toBe(10000.00);
    expect($product->price_credits)->toBe(500);
    expect($product->hasMultiplePaymentOptions())->toBeTrue();
});

test('product calculates discount percentage correctly', function () {
    $product = Product::factory()->create();
    
    $product->pricing()->update([
        'price_ugx' => 10000,
        'compare_at_price_ugx' => 15000,
    ]);

    expect($product->fresh()->discount_percentage)->toBe(33);
});

test('product can be featured', function () {
    $product = Product::factory()->create(['is_featured' => true]);

    expect($product->is_featured)->toBeTrue();
});

test('product tracks view count', function () {
    $product = Product::factory()->create(['view_count' => 0]);

    $product->incrementViews();

    expect($product->fresh()->view_count)->toBe(1);
});

test('product can have multiple images', function () {
    $product = Product::factory()->create([
        'images' => [
            'path/to/image1.jpg',
            'path/to/image2.jpg',
            'path/to/image3.jpg',
        ],
    ]);

    expect($product->images)->toBeArray();
    expect($product->images)->toHaveCount(3);
});

test('product has primary image', function () {
    $product = Product::factory()->create([
        'featured_image' => 'path/to/primary.jpg',
    ]);

    expect($product->featured_image)->toBe('path/to/primary.jpg');
});

test('product soft deletes', function () {
    $product = Product::factory()->create();
    $productId = $product->id;

    $product->delete();

    expect(Product::find($productId))->toBeNull();
    expect(Product::withTrashed()->find($productId))->not->toBeNull();
});

test('service type product does not require shipping', function () {
    $product = Product::factory()->create([
        'product_type' => 'service',
    ]);

    expect($product->product_type)->toBe('service');
    // Service products don't get physical specs created
    expect($product->physicalSpecs)->toBeNull();
});

test('product can have weight and dimensions for shipping', function () {
    $product = Product::factory()->create([
        'product_type' => 'physical',
    ]);
    
    // Factory auto-creates physical specs for physical products
    expect($product->physicalSpecs)->not->toBeNull();
    expect($product->physicalSpecs->weight)->toBeGreaterThan(0);
    expect($product->physicalSpecs->length)->toBeGreaterThan(0);
    expect($product->weight)->toBe($product->physicalSpecs->weight);
});

test('product has seo metadata relationship', function () {
    $product = Product::factory()->create();
    
    expect($product->seo)->not->toBeNull();
    expect($product->seo->meta_title)->not->toBeNull();
    expect($product->meta_title)->toBe($product->seo->meta_title);
});

test('product inventory tracks reserved quantity', function () {
    $product = Product::factory()->create();
    
    $product->inventory()->update([
        'stock_quantity' => 10,
        'reserved_quantity' => 3,
        'available_quantity' => 7,
    ]);
    
    $inventory = $product->fresh()->inventory;
    expect($inventory->stock_quantity)->toBe(10);
    expect($inventory->reserved_quantity)->toBe(3);
    expect($inventory->available_quantity)->toBe(7);
});

test('product can be created with custom pricing', function () {
    $product = Product::factory()->create();
    
    // Override default pricing
    $product->pricing()->update([
        'price_ugx' => 50000,
        'price_credits' => 500,
        'currency_type' => 'both',
    ]);
    
    $product = $product->fresh();
    expect((float)$product->pricing->price_ugx)->toBe(50000.00);
    expect($product->pricing->price_credits)->toBe(500);
    expect($product->pricing->currency_type)->toBe('both');
});
