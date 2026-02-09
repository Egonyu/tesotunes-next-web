<?php

use App\Models\User;
use App\Modules\Store\Models\Store;
use App\Modules\Store\Models\ProductCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('authenticated user can create a store', function () {
    $user = User::factory()->create();
    $category = ProductCategory::factory()->create();
    
    config(['store.enabled' => true]);
    
    $response = $this->actingAs($user)->post(route('frontend.store.store'), [
        'name' => 'Test Store',
        'slug' => 'test-store',
        'description' => 'A test store',
        'categories' => [$category->id],
    ]);
    
    $response->assertRedirect();
    $this->assertDatabaseHas('stores', [
        'name' => 'Test Store',
        'slug' => 'test-store',
        'user_id' => $user->id,
    ]);
});

test('store creation requires authentication', function () {
    $response = $this->post(route('frontend.store.store'), [
        'name' => 'Test Store',
        'slug' => 'test-store',
    ]);
    
    $response->assertRedirect(route('login'));
});

test('store owner can view their store dashboard', function () {
    $user = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $user->id]);
    
    $response = $this->actingAs($user)->get(route('frontend.store.dashboard', $store));
    
    $response->assertOk();
    $response->assertSee($store->name);
});

test('non-owner cannot access store dashboard', function () {
    $owner = User::factory()->create();
    $user = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $owner->id]);
    
    $response = $this->actingAs($user)->get(route('frontend.store.dashboard', $store));
    
    $response->assertForbidden();
});

test('store owner can update their store', function () {
    $user = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $user->id]);
    
    $response = $this->actingAs($user)->put(route('frontend.store.update', $store), [
        'name' => 'Updated Store Name',
        'slug' => $store->slug,
        'description' => 'Updated description',
    ]);
    
    $response->assertRedirect();
    $this->assertDatabaseHas('stores', [
        'id' => $store->id,
        'name' => 'Updated Store Name',
    ]);
});

test('store owner can delete their store', function () {
    $user = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $user->id]);
    
    $response = $this->actingAs($user)->delete(route('frontend.store.destroy', $store));
    
    $response->assertRedirect();
    $this->assertSoftDeleted('stores', ['id' => $store->id]);
});

test('admin can suspend a store', function () {
    // Create admin role first
    \App\Models\Role::create([
        'name' => 'admin',
        'display_name' => 'Administrator',
        'priority' => 90,
    ]);
    
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    
    $store = Store::factory()->create(['status' => 'active']);
    
    $response = $this->actingAs($admin)->patch(route('admin.store.suspend', $store), [
        'reason' => 'Policy violation',
    ]);
    
    $response->assertRedirect();
    $this->assertDatabaseHas('stores', [
        'id' => $store->id,
        'status' => 'suspended',
    ]);
});

test('public can view active stores', function () {
    Store::factory()->count(5)->create(['status' => 'active', 'is_verified' => true]);
    
    $response = $this->get(route('frontend.store.index'));
    
    $response->assertOk();
    $response->assertViewHas('featuredStores');
});

test('suspended stores are hidden from public', function () {
    $activeStore = Store::factory()->create(['status' => 'active', 'is_verified' => true]);
    $suspendedStore = Store::factory()->create(['status' => 'suspended', 'is_verified' => true]);
    
    $response = $this->get(route('frontend.store.index'));
    
    $response->assertSee($activeStore->name);
    $response->assertDontSee($suspendedStore->name);
});

test('store creation fails when module is disabled', function () {
    config(['store.enabled' => false]);
    
    $user = User::factory()->create();
    
    $response = $this->actingAs($user)->get(route('frontend.store.create'));
    
    $response->assertForbidden();
});
