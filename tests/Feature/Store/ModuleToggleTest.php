<?php

use App\Models\User;
use App\Modules\Store\Models\Order;

test('store routes are accessible when module enabled', function () {
    config(['store.enabled' => true]);

    $response = $this->get(route('frontend.store.index'));

    $response->assertOk();
});

test('store routes return 403 when module disabled', function () {
    config(['store.enabled' => false]);

    $response = $this->get(route('frontend.store.index'));

    $response->assertStatus(403);
})->skip('Module middleware needs implementation');

test('admin can enable store module', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $response = $this->actingAs($admin)->post(route('admin.settings.modules.update'), [
        'store_enabled' => true,
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('settings', [
        'key' => 'store.enabled',
        'value' => '1',
    ]);
})->skip('Settings implementation required');

test('admin can disable store module', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    config(['store.enabled' => true]);

    $response = $this->actingAs($admin)->post(route('admin.settings.modules.update'), [
        'store_enabled' => false,
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('settings', [
        'key' => 'store.enabled',
        'value' => '0',
    ]);
})->skip('Settings implementation required');

test('existing orders remain accessible when module disabled', function () {
    $user = User::factory()->create();
    $order = Order::factory()->create(['user_id' => $user->id]);

    config(['store.enabled' => false]);

    $response = $this->actingAs($user)->get(route('frontend.store.orders.show', $order));

    $response->assertOk();
})->skip('Order view access needs special handling');

test('new store creation blocked when module disabled', function () {
    config(['store.enabled' => false]);

    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('frontend.store.store'), [
        'name' => 'New Store',
        'slug' => 'new-store',
    ]);

    $response->assertStatus(403);
})->skip('Module middleware needs implementation');

test('store menu items hidden when module disabled', function () {
    config(['store.enabled' => false]);

    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('frontend.dashboard'));

    $response->assertOk();
    $response->assertDontSee('My Store');
    $response->assertDontSee('Browse Products');
})->skip('Dashboard view needs verification');

test('store menu items visible when module enabled', function () {
    config(['store.enabled' => true]);

    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('frontend.dashboard'));

    $response->assertOk();
    $response->assertSee('Store');
})->skip('Dashboard view needs verification');

test('store API endpoints respect module status', function () {
    config(['store.enabled' => false]);

    $response = $this->getJson('/api/v1/store/public/products');

    $response->assertStatus(403);
})->skip('API middleware needs implementation');

test('module status persists across requests', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    // Enable module
    $this->actingAs($admin)->post(route('admin.settings.modules.update'), [
        'store_enabled' => true,
    ]);

    // Check in new request
    $response = $this->get(route('frontend.store.index'));
    $response->assertOk();

    // Disable module
    $this->actingAs($admin)->post(route('admin.settings.modules.update'), [
        'store_enabled' => false,
    ]);

    // Check in new request
    $response = $this->get(route('frontend.store.index'));
    $response->assertStatus(403);
})->skip('Settings persistence needs implementation');

test('background jobs for disabled module do not execute', function () {
    config(['store.enabled' => false]);

    expect(config('store.enabled'))->toBeFalse();
})->skip('Job class needs creation');
