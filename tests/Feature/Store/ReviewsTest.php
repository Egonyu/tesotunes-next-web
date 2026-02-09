<?php

use App\Models\User;
use App\Modules\Store\Models\Product;
use App\Modules\Store\Models\Order;
use App\Modules\Store\Models\Review;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

test('buyer can review purchased product', function () {
    $buyer = User::factory()->create();
    $product = Product::factory()->create();
    
    // Create completed order
    $order = Order::factory()->create([
        'user_id' => $buyer->id,
        'status' => 'completed',
    ]);
    
    $order->items()->create([
        'product_id' => $product->id,
        'product_name' => $product->name,
        'product_description' => $product->description,
        'quantity' => 1,
        'unit_price' => $product->price,
        'subtotal' => $product->price,
        'total_amount' => $product->price,
    ]);

    $response = $this->actingAs($buyer)->post(route('frontend.store.reviews.store', $product), [
        'rating' => 5,
        'comment' => 'Great product!',
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('store_reviews', [
        'product_id' => $product->id,
        'user_id' => $buyer->id,
        'rating' => 5,
    ]);
});

test('cannot review product without purchase', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create();

    $response = $this->actingAs($user)->post(route('frontend.store.reviews.store', $product), [
        'rating' => 5,
        'comment' => 'Great product!',
    ]);

    $response->assertForbidden();
});

test('product average rating is calculated correctly', function () {
    $product = Product::factory()->create();

    Review::factory()->create(['product_id' => $product->id, 'store_id' => $product->store_id, 'rating' => 5, 'status' => 'approved']);
    Review::factory()->create(['product_id' => $product->id, 'store_id' => $product->store_id, 'rating' => 4, 'status' => 'approved']);
    Review::factory()->create(['product_id' => $product->id, 'store_id' => $product->store_id, 'rating' => 3, 'status' => 'approved']);

    // Manually trigger rating update since observer might not fire in tests
    $product->updateAverageRating();
    $product->refresh();

    expect((float)$product->average_rating)->toBe(4.0);
    expect($product->review_count)->toBe(3);
});

test('store owner can respond to reviews', function () {
    $owner = User::factory()->create();
    $store = App\Modules\Store\Models\Store::factory()->create(['user_id' => $owner->id]);
    $product = Product::factory()->create(['store_id' => $store->id]);
    $review = Review::factory()->create([
        'product_id' => $product->id,
        'store_id' => $store->id,
    ]);

    $response = $this->actingAs($owner)->post(route('frontend.store.reviews.respond', $review), [
        'response' => 'Thank you for your feedback!',
    ]);

    $response->assertRedirect();

    $review->refresh();
    expect($review->owner_response)->toBe('Thank you for your feedback!');
});

test('reviews can be helpful voted', function () {
    $user = User::factory()->create();
    $review = Review::factory()->create();

    $response = $this->actingAs($user)->post(route('frontend.store.reviews.helpful', $review));

    $response->assertRedirect();

    $review->refresh();
    expect($review->helpful_count)->toBe(1);
});

test('reviews can include images', function () {
    Storage::fake('public');

    $buyer = User::factory()->create();
    $product = Product::factory()->create();
    $order = Order::factory()->create(['user_id' => $buyer->id, 'status' => 'completed']);
    $order->items()->create([
        'product_id' => $product->id,
        'product_name' => $product->name,
        'quantity' => 1,
        'unit_price' => 1000,
        'subtotal' => 1000,
        'total_amount' => 1000,
    ]);

    $image1 = UploadedFile::fake()->image('review1.jpg');
    $image2 = UploadedFile::fake()->image('review2.jpg');

    $response = $this->actingAs($buyer)->post(route('frontend.store.reviews.store', $product), [
        'rating' => 5,
        'comment' => 'Great product!',
        'images' => [$image1, $image2],
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('store_reviews', [
        'product_id' => $product->id,
    ]);

    Storage::disk('public')->assertExists('reviews/' . $image1->hashName());
    Storage::disk('public')->assertExists('reviews/' . $image2->hashName());
});

test('admin can moderate reviews', function () {
    // Seed roles first
    $this->seed(\Database\Seeders\RolePermissionSeeder::class);
    
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $review = Review::factory()->create(['status' => 'pending']);

    $response = $this->actingAs($admin)->post(route('admin.store.reviews.approve', $review));

    $response->assertRedirect();

    $review->refresh();
    expect($review->is_approved)->toBeTrue();
});

test('inappropriate reviews can be reported', function () {
    $user = User::factory()->create();
    $review = Review::factory()->create();

    $response = $this->actingAs($user)->post(route('frontend.store.reviews.report', $review), [
        'reason' => 'Spam content',
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('review_reports', [
        'review_id' => $review->id,
        'user_id' => $user->id,
        'reason' => 'Spam content',
    ]);
});
