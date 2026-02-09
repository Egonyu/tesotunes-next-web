<?php

use App\Models\User;
use App\Modules\Store\Models\Store;
use App\Modules\Store\Policies\StorePolicy;

beforeEach(function () {
    // Create roles needed for tests
    \App\Models\Role::firstOrCreate(
        ['name' => 'admin'],
        ['display_name' => 'Administrator', 'description' => 'Administrator']
    );
    \App\Models\Role::firstOrCreate(
        ['name' => 'artist'],
        ['display_name' => 'Artist', 'description' => 'Artist']
    );
    \App\Models\Role::firstOrCreate(
        ['name' => 'finance'],
        ['display_name' => 'Finance', 'description' => 'Finance team']
    );
});

test('store policy allows viewing active stores', function () {
    $store = Store::factory()->create(['status' => 'active']);
    $policy = new StorePolicy();
    
    expect($policy->view(null, $store))->toBeTrue();
});

test('store policy denies viewing suspended stores to non-owners', function () {
    $user = User::factory()->create();
    $store = Store::factory()->create(['status' => 'suspended']);
    $policy = new StorePolicy();
    
    expect($policy->view($user, $store))->toBeFalse();
});

test('store policy allows owner to view suspended store', function () {
    $user = User::factory()->create();
    $store = Store::factory()->create([
        'user_id' => $user->id,
        'status' => 'suspended',
    ]);
    $policy = new StorePolicy();
    
    expect($policy->view($user, $store))->toBeTrue();
});

test('store policy allows admin to view any store', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    
    $store = Store::factory()->create(['status' => 'suspended']);
    $policy = new StorePolicy();
    
    expect($policy->view($admin, $store))->toBeTrue();
});

test('store policy allows store creation when module enabled', function () {
    config(['store.enabled' => true]);
    
    $user = User::factory()->create();
    $policy = new StorePolicy();
    
    expect($policy->create($user))->toBeTrue();
});

test('store policy denies store creation when module disabled', function () {
    config(['store.enabled' => false]);
    
    $user = User::factory()->create();
    $policy = new StorePolicy();
    
    expect($policy->create($user))->toBeFalse();
});

test('store policy restricts creation to artists when artists_only enabled', function () {
    config([
        'store.enabled' => true,
        'modules.store.artists_only' => true,
    ]);
    
    $user = User::factory()->create();
    $artist = User::factory()->create();
    $artist->assignRole('artist');
    
    $policy = new StorePolicy();
    
    expect($policy->create($user))->toBeFalse();
    expect($policy->create($artist))->toBeTrue();
});

test('store policy allows owner to update their store', function () {
    $user = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $user->id]);
    $policy = new StorePolicy();
    
    expect($policy->update($user, $store))->toBeTrue();
});

test('store policy denies non-owner from updating store', function () {
    $owner = User::factory()->create();
    $user = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $owner->id]);
    $policy = new StorePolicy();
    
    expect($policy->update($user, $store))->toBeFalse();
});

test('store policy allows admin to update any store', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    
    $store = Store::factory()->create();
    $policy = new StorePolicy();
    
    expect($policy->update($admin, $store))->toBeTrue();
});

test('store policy allows owner to delete their store', function () {
    $user = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $user->id]);
    $policy = new StorePolicy();
    
    expect($policy->delete($user, $store))->toBeTrue();
});

test('store policy allows owner to manage orders', function () {
    $user = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $user->id]);
    $policy = new StorePolicy();
    
    expect($policy->manageOrders($user, $store))->toBeTrue();
});

test('store policy allows owner to view analytics', function () {
    $user = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $user->id]);
    $policy = new StorePolicy();
    
    expect($policy->viewAnalytics($user, $store))->toBeTrue();
});

test('store policy allows finance role to view analytics', function () {
    $finance = User::factory()->create();
    $finance->assignRole('finance');
    
    $store = Store::factory()->create();
    $policy = new StorePolicy();
    
    expect($policy->viewAnalytics($finance, $store))->toBeTrue();
});
