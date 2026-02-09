<?php

namespace App\Modules\Store\Tests\Unit;

use App\Models\User;
use App\Modules\Store\Models\Store;
use App\Modules\Store\Models\Product;
use App\Modules\Store\Models\StoreCategory;
use App\Modules\Store\Tests\TestCase;

class StoreModelTest extends TestCase
{

    protected User $user;
    protected Store $store;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $this->store = Store::factory()->create([
            'owner_id' => $this->user->id,
            'owner_type' => User::class,
            'status' => 'pending', // Use non-active status to not interfere with status scope tests
        ]);
    }

    public function test_store_has_owner_relationship()
    {
        $this->assertInstanceOf(User::class, $this->store->owner);
        $this->assertEquals($this->user->id, $this->store->owner->id);
    }

    public function test_store_has_products_relationship()
    {
        Product::factory()->count(3)->create(['store_id' => $this->store->id]);

        $this->assertCount(3, $this->store->products);
    }

    public function test_store_has_categories_relationship()
    {
        $categories = StoreCategory::factory()->count(2)->create();
        $this->store->categories()->attach($categories->pluck('id'));

        $this->assertCount(2, $this->store->categories);
    }

    public function test_store_slug_is_automatically_generated()
    {
        $store = Store::factory()->create(['name' => 'Test Store Name']);
        
        $this->assertNotNull($store->slug);
        $this->assertStringStartsWith('test-store-name', $store->slug);
    }

    public function test_store_status_scope()
    {
        Store::factory()->count(2)->create(['status' => 'active']);
        Store::factory()->count(3)->create(['status' => 'inactive']);

        $activeStores = Store::active()->get();
        
        $this->assertCount(2, $activeStores);
    }

    public function test_store_can_calculate_total_revenue()
    {
        // This will be implemented when orders are fully integrated
        $this->assertTrue(method_exists($this->store, 'getTotalRevenue'));
    }

    public function test_store_can_get_product_count()
    {
        Product::factory()->count(5)->create(['store_id' => $this->store->id]);

        $this->assertEquals(5, $this->store->products()->count());
    }

    public function test_store_settings_are_stored_as_json()
    {
        $settings = [
            'allow_reviews' => true,
            'auto_accept_orders' => false,
            'shipping_enabled' => true,
        ];

        $this->store->update(['settings' => $settings]);
        $this->store->refresh();

        $this->assertEquals($settings, $this->store->settings);
    }

    public function test_store_can_be_soft_deleted()
    {
        $storeId = $this->store->id;
        $this->store->delete();

        $this->assertSoftDeleted('stores', ['id' => $storeId]);
    }
}
