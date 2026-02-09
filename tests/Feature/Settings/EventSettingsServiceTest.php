<?php

use App\Models\Setting;
use App\Models\User;
use App\Services\Settings\EventSettingsService;
use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->service = new EventSettingsService();
    $this->admin = User::factory()->create();
});

describe('Event Settings Management', function () {
    
    test('can get all event settings with defaults', function () {
        $settings = $this->service->getSettings();
        
        expect($settings)->toBeArray()
            ->and($settings)->toHaveKeys([
                'events_enabled',
                'events_require_approval',
                'max_events_per_artist',
                'event_lead_time',
                'paid_tickets_enabled',
                'min_ticket_price',
                'max_ticket_price',
                'ticket_verification',
                'platform_commission',
                'processing_fee',
                'auto_calculate_total',
                'refund_fee',
                'cancellation_period',
            ])
            ->and($settings['events_enabled'])->toBeTrue()
            ->and($settings['max_events_per_artist'])->toBe(5)
            ->and($settings['platform_commission'])->toBe(10);
    });

    test('can update general settings successfully', function () {
        actingAs($this->admin);
        
        $data = [
            'events_enabled' => true,
            'events_require_approval' => false,
            'max_events_per_artist' => 10,
            'event_lead_time' => 14,
        ];
        
        $result = $this->service->updateGeneralSettings($data);
        
        expect($result)->toBeTrue()
            ->and((int)Setting::get('max_events_per_artist'))->toBe(10)
            ->and((int)Setting::get('event_lead_time'))->toBe(14)
            ->and(Setting::get('events_require_approval'))->toBeFalse();
    });

    test('validates max events per artist range', function () {
        actingAs($this->admin);
        
        // Test invalid value (too high)
        $result = $this->service->updateGeneralSettings([
            'max_events_per_artist' => 150,
        ]);
        
        expect($result)->toBeFalse();
        
        // Test invalid value (too low)
        $result = $this->service->updateGeneralSettings([
            'max_events_per_artist' => 0,
        ]);
        
        expect($result)->toBeFalse();
    });

    test('can update ticketing settings successfully', function () {
        actingAs($this->admin);
        
        $data = [
            'paid_tickets_enabled' => true,
            'min_ticket_price' => 10000,
            'max_ticket_price' => 1000000,
            'ticket_verification' => true,
        ];
        
        $result = $this->service->updateTicketingSettings($data);
        
        expect($result)->toBeTrue()
            ->and(Setting::get('min_ticket_price'))->toBe(10000.0)
            ->and(Setting::get('max_ticket_price'))->toBe(1000000.0);
    });

    test('validates ticket price range', function () {
        actingAs($this->admin);
        
        // Max price must be greater than min price
        $result = $this->service->updateTicketingSettings([
            'min_ticket_price' => 50000,
            'max_ticket_price' => 10000,
        ]);
        
        expect($result)->toBeFalse();
    });

    test('can update fee settings successfully', function () {
        actingAs($this->admin);
        
        $data = [
            'platform_commission' => 15,
            'processing_fee' => 3.5,
            'auto_calculate_total' => true,
            'refund_fee' => 10,
            'cancellation_period' => 48,
        ];
        
        $result = $this->service->updateFeeSettings($data);
        
        expect($result)->toBeTrue()
            ->and(Setting::get('platform_commission'))->toBe(15.0)
            ->and(Setting::get('processing_fee'))->toBe(3.5)
            ->and((int)Setting::get('cancellation_period'))->toBe(48);
    });

    test('validates commission percentage range', function () {
        actingAs($this->admin);
        
        // Commission too high
        $result = $this->service->updateFeeSettings([
            'platform_commission' => 60,
        ]);
        
        expect($result)->toBeFalse();
    });
});

describe('Business Logic Methods', function () {
    
    test('calculates total ticket price with fees correctly', function () {
        Setting::set('platform_commission', 10, Setting::TYPE_NUMBER, Setting::GROUP_EVENTS);
        Setting::set('processing_fee', 2.9, Setting::TYPE_NUMBER, Setting::GROUP_EVENTS);
        
        $basePrice = 50000;
        $totalPrice = $this->service->calculateTotalPrice($basePrice);
        
        // 50000 + (50000 * 0.10) + (50000 * 0.029) = 50000 + 5000 + 1450 = 56450
        expect($totalPrice)->toBe(56450.0);
    });

    test('calculates artist payout correctly', function () {
        Setting::set('platform_commission', 10, Setting::TYPE_NUMBER, Setting::GROUP_EVENTS);
        Setting::set('processing_fee', 2.9, Setting::TYPE_NUMBER, Setting::GROUP_EVENTS);
        
        $ticketRevenue = 56450; // Total from customer
        $artistPayout = $this->service->calculateArtistPayout($ticketRevenue);
        
        // 56450 - (56450 * 0.10) - (56450 * 0.029) = 56450 - 5645 - 1637.05 = 49167.95
        expect($artistPayout)->toBe(49167.95);
    });

    test('provides fee breakdown for transparency', function () {
        Setting::set('platform_commission', 10, Setting::TYPE_NUMBER, Setting::GROUP_EVENTS);
        Setting::set('processing_fee', 2.9, Setting::TYPE_NUMBER, Setting::GROUP_EVENTS);
        
        $basePrice = 100000;
        $breakdown = $this->service->calculateFeeBreakdown($basePrice);
        
        expect($breakdown)->toHaveKeys([
            'base_price',
            'platform_commission',
            'processing_fee',
            'total_price',
            'artist_receives',
        ])
            ->and($breakdown['base_price'])->toBe(100000.0)
            ->and($breakdown['platform_commission'])->toBe(10000.0)
            ->and($breakdown['processing_fee'])->toBe(2900.0)
            ->and($breakdown['total_price'])->toBe(112900.0)
            ->and($breakdown['artist_receives'])->toBe(100000.0);
    });

    test('calculates refund amount with fee', function () {
        Setting::set('refund_fee', 5, Setting::TYPE_NUMBER, Setting::GROUP_EVENTS);
        
        $ticketPrice = 50000;
        $refundAmount = $this->service->calculateRefundAmount($ticketPrice);
        
        // 50000 - (50000 * 0.05) = 50000 - 2500 = 47500
        expect($refundAmount)->toBe(47500.0);
    });

    test('checks if refund is allowed based on cancellation period', function () {
        Setting::set('cancellation_period', 24, Setting::TYPE_NUMBER, Setting::GROUP_EVENTS);
        
        // Event in 48 hours - should allow refund
        $eventDate = new DateTime();
        $eventDate->modify('+48 hours');
        expect($this->service->isRefundAllowed($eventDate))->toBeTrue();
        
        // Event in 12 hours - should not allow refund
        $eventDate = new DateTime();
        $eventDate->modify('+12 hours');
        expect($this->service->isRefundAllowed($eventDate))->toBeFalse();
    });

    test('validates ticket price is within allowed range', function () {
        Setting::set('min_ticket_price', 5000, Setting::TYPE_NUMBER, Setting::GROUP_EVENTS);
        Setting::set('max_ticket_price', 500000, Setting::TYPE_NUMBER, Setting::GROUP_EVENTS);
        
        expect($this->service->isValidTicketPrice(10000))->toBeTrue()
            ->and($this->service->isValidTicketPrice(3000))->toBeFalse()
            ->and($this->service->isValidTicketPrice(600000))->toBeFalse();
    });

    test('checks if event meets lead time requirement', function () {
        Setting::set('event_lead_time', 7, Setting::TYPE_NUMBER, Setting::GROUP_EVENTS);
        
        // Event in 10 days - should meet requirement
        $eventDate = new DateTime();
        $eventDate->modify('+10 days');
        expect($this->service->meetsLeadTimeRequirement($eventDate))->toBeTrue();
        
        // Event in 3 days - should not meet requirement
        $eventDate = new DateTime();
        $eventDate->modify('+3 days');
        expect($this->service->meetsLeadTimeRequirement($eventDate))->toBeFalse();
    });

    test('checks if artist can create more events this month', function () {
        Setting::set('events_enabled', true, Setting::TYPE_BOOLEAN, Setting::GROUP_EVENTS);
        Setting::set('max_events_per_artist', 5, Setting::TYPE_NUMBER, Setting::GROUP_EVENTS);
        
        $artist = User::factory()->create();
        
        // Artist with no events - should be able to create
        expect($this->service->canArtistCreateEvent($artist))->toBeTrue();
        
        // Create 5 events for this month
        for ($i = 0; $i < 5; $i++) {
            DB::table('events')->insert([
                'title' => "Event $i",
                'slug' => 'event-' . $i . '-' . time(),
                'starts_at' => now()->addDays($i + 10),
                'venue_name' => 'Test Venue',
                'user_id' => $artist->id,
                'status' => 'published',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        
        // Artist has reached limit - should not be able to create
        expect($this->service->canArtistCreateEvent($artist))->toBeFalse();
    });
});

describe('Settings Retrieval', function () {
    
    test('can check if events system is enabled', function () {
        Setting::set('events_enabled', true, Setting::TYPE_BOOLEAN, Setting::GROUP_EVENTS);
        expect($this->service->isEnabled())->toBeTrue();
        
        Setting::set('events_enabled', false, Setting::TYPE_BOOLEAN, Setting::GROUP_EVENTS);
        expect($this->service->isEnabled())->toBeFalse();
    });

    test('can get platform commission percentage', function () {
        Setting::set('platform_commission', 15, Setting::TYPE_NUMBER, Setting::GROUP_EVENTS);
        expect($this->service->getPlatformCommission())->toBe(15.0);
    });

    test('can get maximum events per artist', function () {
        Setting::set('max_events_per_artist', 8, Setting::TYPE_NUMBER, Setting::GROUP_EVENTS);
        expect($this->service->getMaxEventsPerArtist())->toBe(8);
    });
});
