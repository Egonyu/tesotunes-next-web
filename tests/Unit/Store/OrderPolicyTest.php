<?php

use App\Models\User;
use App\Models\Role;
use App\Modules\Store\Models\Store;
use App\Modules\Store\Models\Order;
use App\Policies\Store\OrderPolicy;

beforeEach(function () {
    // Seed roles required by tests
    Role::create(['name' => 'admin', 'display_name' => 'Admin', 'priority' => 90]);
    Role::create(['name' => 'finance', 'display_name' => 'Finance', 'priority' => 85]);
});

test('order policy allows buyer to view their order', function () {
    $user = User::factory()->create();
    $order = Order::factory()->create(['user_id' => $user->id]);
    $policy = new OrderPolicy();
    
    expect($policy->view($user, $order))->toBeTrue();
});

test('order policy allows store owner to view order', function () {
    $owner = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $owner->id]);
    $order = Order::factory()->create(['store_id' => $store->id]);
    $policy = new OrderPolicy();
    
    expect($policy->view($owner, $order))->toBeTrue();
});

test('order policy denies unrelated user from viewing order', function () {
    $user = User::factory()->create();
    $order = Order::factory()->create();
    $policy = new OrderPolicy();
    
    expect($policy->view($user, $order))->toBeFalse();
});

test('order policy allows admin to view any order', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    
    $order = Order::factory()->create();
    $policy = new OrderPolicy();
    
    expect($policy->view($admin, $order))->toBeTrue();
});

test('order policy allows finance role to view orders', function () {
    $finance = User::factory()->create();
    $finance->assignRole('finance');
    
    $order = Order::factory()->create();
    $policy = new OrderPolicy();
    
    expect($policy->view($finance, $order))->toBeTrue();
});

test('order policy allows buyer to cancel pending order', function () {
    $user = User::factory()->create();
    $order = Order::factory()->create([
        'user_id' => $user->id,
        'status' => 'pending',
    ]);
    $policy = new OrderPolicy();
    
    expect($policy->cancel($user, $order))->toBeTrue();
});

test('order policy denies cancelling completed order', function () {
    $user = User::factory()->create();
    $order = Order::factory()->create([
        'user_id' => $user->id,
        'status' => 'delivered',
    ]);
    $policy = new OrderPolicy();
    
    expect($policy->cancel($user, $order))->toBeFalse();
});

test('order policy denies cancelling already cancelled order', function () {
    $user = User::factory()->create();
    $order = Order::factory()->create([
        'user_id' => $user->id,
        'status' => 'cancelled',
    ]);
    $policy = new OrderPolicy();
    
    expect($policy->cancel($user, $order))->toBeFalse();
});

test('order policy allows store owner to cancel order', function () {
    $owner = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $owner->id]);
    $order = Order::factory()->create([
        'store_id' => $store->id,
        'status' => 'processing',
    ]);
    $policy = new OrderPolicy();
    
    expect($policy->cancel($owner, $order))->toBeTrue();
});

test('order policy allows buyer to confirm receipt of shipped order', function () {
    $user = User::factory()->create();
    $order = Order::factory()->create([
        'user_id' => $user->id,
        'status' => 'shipped',
    ]);
    $policy = new OrderPolicy();
    
    expect($policy->update($user, $order))->toBeTrue();
});

test('order policy allows store owner to update order status', function () {
    $owner = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $owner->id]);
    $order = Order::factory()->create(['store_id' => $store->id]);
    $policy = new OrderPolicy();
    
    expect($policy->update($owner, $order))->toBeTrue();
});

test('order policy allows store owner to refund order', function () {
    $owner = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $owner->id]);
    $order = Order::factory()->create(['store_id' => $store->id]);
    $policy = new OrderPolicy();
    
    expect($policy->refund($owner, $order))->toBeTrue();
});

test('order policy allows admin to refund order', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    
    $order = Order::factory()->create();
    $policy = new OrderPolicy();
    
    expect($policy->refund($admin, $order))->toBeTrue();
});

test('order policy allows finance role to refund order', function () {
    $finance = User::factory()->create();
    $finance->assignRole('finance');
    
    $order = Order::factory()->create();
    $policy = new OrderPolicy();
    
    expect($policy->refund($finance, $order))->toBeTrue();
});

test('order policy denies regular user from refunding order', function () {
    $user = User::factory()->create();
    $order = Order::factory()->create();
    $policy = new OrderPolicy();
    
    expect($policy->refund($user, $order))->toBeFalse();
});
