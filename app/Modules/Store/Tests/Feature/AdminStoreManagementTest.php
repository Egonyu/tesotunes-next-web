<?php

namespace App\Modules\Store\Tests\Feature;

use App\Models\Role;
use App\Models\User;
use App\Modules\Store\Models\Store;
use App\Modules\Store\Models\Product;
use App\Modules\Store\Models\Order;
use Tests\TestCase;

class AdminStoreManagementTest extends TestCase
{

    protected User $admin;
    protected User $regularUser;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create admin role if it doesn't exist
        $adminRole = Role::firstOrCreate(
            ['name' => 'admin'],
            [
                'display_name' => 'Administrator',
                'priority' => 90,
            ]
        );
        
        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');
        
        $this->regularUser = User::factory()->create();
    }

    public function test_admin_can_view_store_management_dashboard()
    {
        $response = $this->actingAs($this->admin)
            ->get(route('admin.store.index'));

        $response->assertStatus(200);
        $response->assertViewIs('admin.store.index');
    }

    public function test_regular_user_cannot_access_store_management()
    {
        $response = $this->actingAs($this->regularUser)
            ->get(route('admin.store.index'));

        $response->assertStatus(403);
    }

    public function test_admin_can_view_all_stores()
    {
        Store::factory()->count(5)->create();

        $response = $this->actingAs($this->admin)
            ->get(route('admin.store.index'));

        $response->assertStatus(200);
        $response->assertViewHas('stores');
    }

    public function test_admin_can_search_stores()
    {
        Store::factory()->create(['name' => 'Rock Store']);
        Store::factory()->create(['name' => 'Jazz Store']);

        $response = $this->actingAs($this->admin)
            ->get(route('admin.store.index', ['search' => 'Rock']));

        $response->assertStatus(200);
        $response->assertSee('Rock Store');
        $response->assertDontSee('Jazz Store');
    }

    public function test_admin_can_filter_stores_by_status()
    {
        Store::factory()->create(['status' => 'active']);
        Store::factory()->create(['status' => 'inactive']);

        $response = $this->actingAs($this->admin)
            ->get(route('admin.store.index', ['status' => 'active']));

        $response->assertStatus(200);
    }

    public function test_admin_can_view_store_details()
    {
        $store = Store::factory()->create();

        $response = $this->actingAs($this->admin)
            ->get(route('admin.store.show', $store));

        $response->assertStatus(200);
        $response->assertViewIs('admin.store.show');
        $response->assertViewHas('store');
    }

    public function test_admin_can_approve_store()
    {
        $store = Store::factory()->create(['status' => 'pending']);

        $response = $this->actingAs($this->admin)
            ->patch(route('admin.store.approve', $store));

        $response->assertRedirect();
        $this->assertDatabaseHas('stores', [
            'id' => $store->id,
            'status' => 'active',
        ]);
    }

    public function test_admin_can_suspend_store()
    {
        $store = Store::factory()->create(['status' => 'active']);

        $response = $this->actingAs($this->admin)
            ->patch(route('admin.store.suspend', $store), [
                'reason' => 'Violation of terms',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('stores', [
            'id' => $store->id,
            'status' => 'suspended',
            'suspended_reason' => 'Violation of terms',
        ]);
    }

    public function test_admin_can_reactivate_suspended_store()
    {
        $store = Store::factory()->create([
            'status' => 'suspended',
            'suspended_reason' => 'Violation',
        ]);

        $response = $this->actingAs($this->admin)
            ->patch(route('admin.store.reactivate', $store));

        $response->assertRedirect();
        $this->assertDatabaseHas('stores', [
            'id' => $store->id,
            'status' => 'active',
            'suspended_reason' => null,
        ]);
    }

    public function test_admin_can_delete_store()
    {
        $store = Store::factory()->create();

        $response = $this->actingAs($this->admin)
            ->delete(route('admin.store.destroy', $store));

        $response->assertRedirect();
        $this->assertSoftDeleted('stores', ['id' => $store->id]);
    }

    public function test_admin_can_view_store_settings()
    {
        $response = $this->actingAs($this->admin)
            ->get(route('admin.store.settings'));

        $response->assertStatus(200);
        $response->assertViewIs('admin.store.settings');
    }

    public function test_admin_can_update_store_settings()
    {
        $settings = [
            'store_enabled' => true,
            'require_verification' => true,
            'platform_commission' => 15,
            'allow_credits' => true,
        ];

        $response = $this->actingAs($this->admin)
            ->put(route('admin.store.settings.update'), $settings);

        $response->assertRedirect();
        $response->assertSessionHas('success');
    }

    public function test_admin_can_view_product_list()
    {
        $store = Store::factory()->create();
        Product::factory()->count(5)->create(['store_id' => $store->id]);

        $response = $this->actingAs($this->admin)
            ->get(route('admin.store.products.index', $store));

        $response->assertStatus(200);
    }

    /** @test */
    public function admin_can_update_product_status()
    {
        $store = Store::factory()->create();
        $product = Product::factory()->create([
            'store_id' => $store->id,
            'status' => 'draft'
        ]);

        $response = $this->actingAs($this->admin)
            ->put(route('admin.store.products.update', [$store, $product]), [
                'name' => $product->name,
                'slug' => $product->slug,
                'description' => $product->description,
                'product_type' => $product->product_type,
                'price_ugx' => $product->price_ugx,
                'status' => 'active',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('store_products', [
            'id' => $product->id,
            'status' => 'active',
        ]);
    }

    public function test_admin_can_view_orders_list()
    {
        Order::factory()->count(10)->create();

        $response = $this->actingAs($this->admin)
            ->get(route('admin.store.orders.index'));

        $response->assertStatus(200);
        $response->assertViewIs('admin.store.orders.index');
    }

    public function test_admin_can_filter_orders_by_status()
    {
        Order::factory()->create(['status' => 'pending']);
        Order::factory()->create(['status' => 'completed']);

        $response = $this->actingAs($this->admin)
            ->get(route('admin.store.orders.index', ['status' => 'pending']));

        $response->assertStatus(200);
    }

    public function test_admin_can_view_order_details()
    {
        $order = Order::factory()->create();

        $response = $this->actingAs($this->admin)
            ->get(route('admin.store.orders.show', $order));

        $response->assertStatus(200);
        $response->assertViewIs('admin.store.orders.show');
    }

    public function test_admin_sees_store_statistics()
    {
        Store::factory()->count(10)->create();
        Product::factory()->count(50)->create();
        Order::factory()->count(30)->create();

        $response = $this->actingAs($this->admin)
            ->get(route('admin.store.index'));

        $response->assertStatus(200);
        $response->assertViewHas('stats');
    }
}
