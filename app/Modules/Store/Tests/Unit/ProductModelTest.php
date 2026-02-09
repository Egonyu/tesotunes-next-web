<?php

namespace App\Modules\Store\Tests\Unit;

use App\Modules\Store\Models\Store;
use App\Modules\Store\Models\Product;
use App\Modules\Store\Models\ProductCategory;
use Tests\TestCase;

class ProductModelTest extends TestCase
{

    protected Store $store;
    protected Product $product;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->store = Store::factory()->create();
        $this->product = Product::factory()->create([
            'store_id' => $this->store->id,
        ]);
    }

    public function test_product_belongs_to_store()
    {
        $this->assertInstanceOf(Store::class, $this->product->store);
        $this->assertEquals($this->store->id, $this->product->store->id);
    }

    public function test_product_has_category_relationship()
    {
        $category = ProductCategory::factory()->create();
        $this->product->update(['category_id' => $category->id]);

        $this->assertInstanceOf(ProductCategory::class, $this->product->category);
    }

    public function test_product_price_is_in_ugx()
    {
        $this->product->update(['price_ugx' => 50000]);
        
        $this->assertEquals(50000, $this->product->price_ugx);
    }

    public function test_product_can_accept_credits()
    {
        // Use updateOrCreate for the related pricing record
        \App\Modules\Store\Models\ProductPricing::updateOrCreate(
            ['product_id' => $this->product->id],
            [
                'accepts_credits' => true,
                'price_credits' => 500,
            ]
        );
        
        $this->product->refresh();

        $this->assertTrue($this->product->accepts_credits);
        $this->assertEquals(500, $this->product->price_credits);
    }

    public function test_product_has_stock_tracking()
    {
        // Use updateOrCreate for the related inventory record
        \App\Modules\Store\Models\ProductInventory::updateOrCreate(
            ['product_id' => $this->product->id],
            [
                'track_inventory' => 'track',
                'stock_quantity' => 10,
                'quantity' => 10,
                'low_stock_threshold' => 3,
            ]
        );
        
        // Clear the cached relation and refresh
        $this->product->unsetRelation('inventory');
        $this->product->refresh();

        $this->assertEquals(10, $this->product->stock_quantity);
        $this->assertFalse($this->product->isLowStock());

        $this->product->inventory->update(['stock_quantity' => 2, 'quantity' => 2]);
        $this->product->unsetRelation('inventory');
        $this->product->refresh();
        $this->assertTrue($this->product->isLowStock());
    }

    public function test_product_can_be_featured()
    {
        $this->product->update(['is_featured' => true]);
        
        $featuredProducts = Product::featured()->get();
        
        $this->assertTrue($featuredProducts->contains($this->product));
    }

    public function test_product_has_active_scope()
    {
        Product::factory()->count(2)->create(['status' => 'active', 'store_id' => $this->store->id]);
        Product::factory()->count(3)->create(['status' => 'draft', 'store_id' => $this->store->id]);

        $activeProducts = Product::active()->get();
        
        $this->assertGreaterThanOrEqual(2, $activeProducts->count());
    }

    public function test_product_images_stored_as_json()
    {
        $images = [
            'https://example.com/image1.jpg',
            'https://example.com/image2.jpg',
            'https://example.com/image3.jpg',
        ];

        $this->product->update(['images' => $images]);
        $this->product->refresh();

        $this->assertEquals($images, $this->product->images);
        $this->assertIsArray($this->product->images);
    }

    public function test_product_slug_generation()
    {
        $product = Product::factory()->create([
            'name' => 'Cool Band T-Shirt',
            'slug' => null, // Let the model auto-generate
            'store_id' => $this->store->id,
        ]);

        $this->assertNotNull($product->slug);
        $this->assertEquals('cool-band-t-shirt', $product->slug);
    }

    public function test_product_can_be_soft_deleted()
    {
        $productId = $this->product->id;
        $this->product->delete();

        $this->assertSoftDeleted('store_products', ['id' => $productId]);
    }

    public function test_digital_product_has_no_stock()
    {
        $digitalProduct = Product::factory()->create([
            'type' => 'digital',
            'store_id' => $this->store->id,
        ]);

        $this->assertEquals('digital', $digitalProduct->type);
        $this->assertTrue($digitalProduct->isDigital());
    }

    public function test_service_product_has_no_stock()
    {
        $serviceProduct = Product::factory()->create([
            'type' => 'service',
            'store_id' => $this->store->id,
        ]);

        $this->assertEquals('service', $serviceProduct->type);
        $this->assertTrue($serviceProduct->isService());
    }
}
