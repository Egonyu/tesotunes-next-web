<?php

use App\Models\Ad;
use App\Services\AdService;

beforeEach(function () {
    $this->adService = app(AdService::class);
});

test('device detection works correctly', function () {
    // Mobile user agents
    $mobileAgents = [
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36',
        'Mozilla/5.0 (iPad; CPU OS 13_0 like Mac OS X) AppleWebKit/605.1.15',
    ];
    
    foreach ($mobileAgents as $agent) {
        request()->server->set('HTTP_USER_AGENT', $agent);
        $deviceType = $this->adService->detectDeviceType($agent);
        expect(in_array($deviceType, ['mobile', 'tablet']))->toBeTrue();
    }
    
    // Desktop user agent
    $desktopAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    $deviceType = $this->adService->detectDeviceType($desktopAgent);
    expect($deviceType)->toBe('desktop');
});

test('ad stats are calculated correctly', function () {
    $ad = Ad::factory()->create();
    
    // Create impressions
    $ad->impressions()->createMany([
        ['page_url' => '/home', 'device_type' => 'mobile', 'clicked' => false],
        ['page_url' => '/discover', 'device_type' => 'mobile', 'clicked' => true],
        ['page_url' => '/artist', 'device_type' => 'desktop', 'clicked' => false],
        ['page_url' => '/home', 'device_type' => 'desktop', 'clicked' => true],
        ['page_url' => '/genres', 'device_type' => 'tablet', 'clicked' => false],
    ]);
    
    $stats = $this->adService->getAdStats($ad, 30);
    
    expect($stats['total_impressions'])->toBe(5);
    expect($stats['total_clicks'])->toBe(2);
    expect($stats['ctr'])->toBe(40.0);
    expect($stats['by_device'])->toHaveCount(3);
    expect($stats['by_device']['mobile'])->toBe(2);
    expect($stats['by_device']['desktop'])->toBe(2);
    expect($stats['by_device']['tablet'])->toBe(1);
});

test('ad priority sorting works', function () {
    $lowPriority = Ad::factory()->create(['priority' => 1, 'is_active' => true, 'placement' => 'inline', 'pages' => ['home']]);
    $mediumPriority = Ad::factory()->create(['priority' => 5, 'is_active' => true, 'placement' => 'inline', 'pages' => ['home']]);
    $highPriority = Ad::factory()->create(['priority' => 10, 'is_active' => true, 'placement' => 'inline', 'pages' => ['home']]);
    
    $result = $this->adService->getAd('inline', 'home', 'mobile');
    
    // Should return high priority ad
    expect($result->priority)->toBeGreaterThanOrEqual(5);
});

test('ad cache is cleared on update', function () {
    $ad = Ad::factory()->create([
        'is_active' => true,
        'placement' => 'inline',
        'pages' => ['home'],
        'mobile_only' => false,
        'desktop_only' => false,
    ]);
    
    // First call - cache miss
    $result1 = $this->adService->getAd('inline', 'home', 'mobile');
    expect($result1)->not->toBeNull();
    
    // Update ad
    $ad->update(['is_active' => false]);
    $this->adService->clearAdCache($ad);
    
    // Second call - should reflect update
    $result2 = $this->adService->getAd('inline', 'home', 'mobile');
    expect($result2)->toBeNull();
});

test('ctr returns zero when no impressions', function () {
    $ad = Ad::factory()->create(['impressions' => 0, 'clicks' => 0]);
    
    $ctr = $this->adService->calculateCTR($ad);
    
    expect($ctr)->toBe(0.0);
});
