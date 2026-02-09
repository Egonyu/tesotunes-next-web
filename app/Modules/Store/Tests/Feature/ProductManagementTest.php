<?php

namespace App\Modules\Store\Tests\Feature;

use App\Models\User;
use App\Modules\Store\Models\Store;
use App\Modules\Store\Models\Product;
use App\Modules\Store\Models\ProductCategory;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProductManagementTest extends TestCase
{

    protected User $user;
    protected Store $store;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $this->store = Store::factory()->create([
            'user_id' => $this->user->id,  // Direct ownership
            'owner_id' => $this->user->id,
            'owner_type' => User::class,
        ]);
        
        Storage::fake('public');
    }

    public function test_store_owner_can_create_product()
    {
        $category = ProductCategory::factory()->create();

        $productData = [
            'name' => 'Cool Band T-Shirt',
            'slug' => 'cool-band-t-shirt',
            'description' => 'High quality cotton t-shirt',
            'category_id' => $category->id,
            'product_type' => 'physical',
            'price_ugx' => 50000,
            'accepts_credits' => true,
            'price_credits' => 500,
            'stock_quantity' => 100,
            'status' => 'active',
        ];

        $response = $this->actingAs($this->user)
            ->post(route('frontend.store.products.store', $this->store), $productData);

        $response->assertRedirect();
        $this->assertDatabaseHas('store_products', [
            'name' => 'Cool Band T-Shirt',
            'store_id' => $this->store->id,
        ]);
    }

    public function test_product_creation_requires_name()
    {
        $response = $this->actingAs($this->user)
            ->post(route('frontend.store.products.store', $this->store), [
                'price_ugx' => 50000,
            ]);

        $response->assertSessionHasErrors('name');
    }

    public function test_product_creation_requires_price()
    {
        $response = $this->actingAs($this->user)
            ->post(route('frontend.store.products.store', $this->store), [
                'name' => 'Test Product',
                'slug' => 'test-product',
            ]);

        $response->assertSessionHasErrors('price_ugx');
    }

    public function test_product_can_upload_images()
    {
        $images = [
            UploadedFile::fake()->image('product1.jpg'),
            UploadedFile::fake()->image('product2.jpg'),
        ];

        $category = ProductCategory::factory()->create();

        $response = $this->actingAs($this->user)
            ->post(route('frontend.store.products.store', $this->store), [
                'name' => 'Product with Images',
                'slug' => 'product-with-images',
                'description' => 'A product with images',
                'category_id' => $category->id,
                'product_type' => 'physical',
                'price_ugx' => 50000,
                'images' => $images,
            ]);

        $response->assertRedirect();
        
        $product = Product::where('slug', 'product-with-images')->first();
        $this->assertNotNull($product->images);
        $this->assertIsArray($product->images);
    }

    public function test_digital_product_does_not_require_stock()
    {
        $category = ProductCategory::factory()->create();

        $response = $this->actingAs($this->user)
            ->post(route('frontend.store.products.store', $this->store), [
                'name' => 'Digital Album',
                'slug' => 'digital-album',
                'description' => 'A digital album',
                'category_id' => $category->id,
                'product_type' => 'digital',
                'price_ugx' => 20000,
            ]);

        $response->assertRedirect();
        
        $product = Product::where('slug', 'digital-album')->first();
        $this->assertEquals('digital', $product->product_type);
    }

    public function test_store_owner_can_update_product()
    {
        $product = Product::factory()->create(['store_id' => $this->store->id]);

        $response = $this->actingAs($this->user)
            ->put(route('frontend.store.products.update', [$this->store, $product]), [
                'name' => 'Updated Product Name',
                'slug' => $product->slug,
                'description' => $product->description,
                'product_type' => $product->product_type,
                'price_ugx' => 60000,
                'category_id' => $product->category_id,
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('store_products', [
            'id' => $product->id,
            'name' => 'Updated Product Name',
            'price_ugx' => 60000,
        ]);
    }

    public function test_store_owner_can_delete_product()
    {
        $product = Product::factory()->create(['store_id' => $this->store->id]);

        $response = $this->actingAs($this->user)
            ->delete(route('frontend.store.products.destroy', [$this->store, $product]));

        $response->assertRedirect();
        $this->assertSoftDeleted('store_products', ['id' => $product->id]);
    }

    public function test_non_owner_cannot_manage_products()
    {
        $otherUser = User::factory()->create();
        $product = Product::factory()->create(['store_id' => $this->store->id]);

        $response = $this->actingAs($otherUser)
            ->delete(route('frontend.store.products.destroy', [$this->store, $product]));

        $response->assertStatus(403);
    }

    public function test_product_can_be_featured()
    {
        $product = Product::factory()->create([
            'store_id' => $this->store->id,
            'is_featured' => false,
        ]);

        $response = $this->actingAs($this->user)
            ->put(route('frontend.store.products.update', [$this->store, $product]), [
                'name' => $product->name,
                'slug' => $product->slug,
                'description' => $product->description,
                'product_type' => $product->product_type,
                'price_ugx' => $product->price_ugx,
                'category_id' => $product->category_id,
                'is_featured' => true,
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('store_products', [
            'id' => $product->id,
            'is_featured' => true,
        ]);
    }

    public function test_physical_product_tracks_stock()
    {
        $product = Product::factory()->create([
            'store_id' => $this->store->id,
            'product_type' => 'physical',
            'stock_quantity' => 10,
        ]);

        $this->assertEquals(10, $product->stock_quantity);
        
        // Simulate sale
        $product->update(['stock_quantity' => 9]);
        $this->assertEquals(9, $product->fresh()->stock_quantity);
    }
}
