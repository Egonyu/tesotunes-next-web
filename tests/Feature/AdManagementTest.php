<?php

use App\Models\Ad;
use App\Models\User;
use App\Services\AdService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    // Create admin role
    \App\Models\Role::firstOrCreate(
        ['name' => 'admin'],
        ['display_name' => 'Administrator', 'description' => 'Administrator']
    );
    
    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');
    $this->actingAs($this->admin);
});

test('admin can view ads index', function () {
    $response = $this->get(route('backend.ads.index'));
    
    $response->assertStatus(200);
    $response->assertViewIs('backend.ads.index');
    $response->assertViewHas('ads');
    $response->assertViewHas('stats');
});

test('admin can create google adsense ad', function () {
    $adData = [
        'name' => 'Test AdSense Banner',
        'type' => 'google_adsense',
        'placement' => 'header',
        'format' => 'banner',
        'adsense_slot_id' => '1234567890',
        'adsense_format' => 'auto',
        'priority' => 10,
        'is_active' => true,
    ];
    
    $response = $this->post(route('backend.ads.store'), $adData);
    
    $response->assertRedirect();
    $this->assertDatabaseHas('ads', [
        'name' => 'Test AdSense Banner',
        'type' => 'google_adsense',
        'adsense_slot_id' => '1234567890',
    ]);
});

test('admin can create direct ad with image', function () {
    Storage::fake('public');
    
    $image = UploadedFile::fake()->image('ad-banner.jpg', 728, 90);
    
    $adData = [
        'name' => 'Test Direct Ad',
        'type' => 'direct',
        'placement' => 'inline',
        'format' => 'banner',
        'image' => $image,
        'link_url' => 'https://example.com',
        'advertiser_name' => 'Test Company',
        'priority' => 5,
        'is_active' => true,
    ];
    
    $response = $this->post(route('backend.ads.store'), $adData);
    
    $response->assertRedirect();
    $this->assertDatabaseHas('ads', [
        'name' => 'Test Direct Ad',
        'type' => 'direct',
        'advertiser_name' => 'Test Company',
    ]);
    
    Storage::disk('public')->assertExists('ads/' . $image->hashName());
});

test('ad targeting filters work correctly', function () {
    $ad = Ad::factory()->create([
        'placement' => 'inline',
        'pages' => ['home', 'discover'],
        'mobile_only' => true,
        'desktop_only' => false,
        'is_active' => true,
    ]);
    
    $adService = app(AdService::class);
    
    // Should show on home page for mobile
    $result = $adService->getAd('inline', 'home', 'mobile');
    expect($result)->not->toBeNull();
    expect($result->id)->toBe($ad->id);
    
    // Should NOT show on desktop
    $result = $adService->getAd('inline', 'home', 'desktop');
    expect($result)->toBeNull();
    
    // Should NOT show on artist page
    $result = $adService->getAd('inline', 'artist', 'mobile');
    expect($result)->toBeNull();
});

test('ad impressions are tracked correctly', function () {
    $ad = Ad::factory()->create(['is_active' => true]);
    $adService = app(AdService::class);
    
    $initialImpressions = $ad->impressions;
    
    $adService->recordImpression($ad->id, '/test-page');
    
    $ad->refresh();
    expect($ad->impressions)->toBe($initialImpressions + 1);
    
    $this->assertDatabaseHas('ad_impressions', [
        'ad_id' => $ad->id,
        'page_url' => '/test-page',
    ]);
});

test('ad clicks are tracked correctly', function () {
    $ad = Ad::factory()->create(['is_active' => true]);
    $impression = $ad->impressions()->create([
        'page_url' => '/test-page',
        'device_type' => 'mobile',
    ]);
    
    $adService = app(AdService::class);
    
    $initialClicks = $ad->clicks;
    
    $adService->recordClick($ad->id, $impression->id);
    
    $ad->refresh();
    $impression->refresh();
    
    expect($ad->clicks)->toBe($initialClicks + 1);
    expect($impression->clicked)->toBeTrue();
    expect($impression->clicked_at)->not->toBeNull();
});

test('ctr is calculated correctly', function () {
    $ad = Ad::factory()->create([
        'impressions' => 1000,
        'clicks' => 25,
    ]);
    
    $adService = app(AdService::class);
    $ctr = $adService->calculateCTR($ad);
    
    expect($ctr)->toBe(2.5);
});

test('premium users dont see ads', function () {
    $premiumUser = User::factory()->create(['subscription_tier' => 'premium']);
    $this->actingAs($premiumUser);
    
    $ad = Ad::factory()->create(['is_active' => true]);
    $adService = app(AdService::class);
    
    $result = $adService->getAd('inline', 'home', 'mobile');
    
    expect($result)->toBeNull();
});

test('inactive ads are not shown', function () {
    $ad = Ad::factory()->create(['is_active' => false]);
    $adService = app(AdService::class);
    
    $result = $adService->getAd('inline', 'home', 'mobile');
    
    expect($result)->toBeNull();
});

test('ads respect scheduling dates', function () {
    // Future ad
    $futureAd = Ad::factory()->create([
        'is_active' => true,
        'start_date' => now()->addDays(5),
    ]);
    
    // Expired ad
    $expiredAd = Ad::factory()->create([
        'is_active' => true,
        'end_date' => now()->subDays(5),
    ]);
    
    $adService = app(AdService::class);
    
    // Should not show future ad
    $result = $adService->getAd('inline', 'home', 'mobile');
    expect($result)->toBeNull();
});

test('admin can toggle ad status', function () {
    $ad = Ad::factory()->create(['is_active' => true]);
    
    $response = $this->patch(route('backend.ads.toggle', $ad));
    
    $response->assertRedirect();
    $ad->refresh();
    expect($ad->is_active)->toBeFalse();
});

test('admin can delete ad', function () {
    $ad = Ad::factory()->create();
    
    $response = $this->delete(route('backend.ads.destroy', $ad));
    
    $response->assertRedirect();
    $this->assertSoftDeleted('ads', ['id' => $ad->id]);
});

test('analytics dashboard shows correct data', function () {
    // Create ads with performance data
    Ad::factory()->count(5)->create([
        'impressions' => 1000,
        'clicks' => 50,
        'revenue' => 5000,
    ]);
    
    $response = $this->get(route('backend.ads.analytics'));
    
    $response->assertStatus(200);
    $response->assertViewIs('backend.ads.analytics');
    $response->assertViewHas(['totalRevenue', 'totalImpressions', 'totalClicks', 'avgCTR']);
});
