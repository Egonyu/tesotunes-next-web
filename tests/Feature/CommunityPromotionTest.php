<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserCredit;
use App\Models\CommunityPromotion;
use App\Models\PromotionParticipant;
use App\Models\Song;
use Tests\TestCase;

class CommunityPromotionTest extends TestCase
{

    protected function setUp(): void
    {
        parent::setUp();
    }

    /** @test */
    public function community_promotion_can_be_created()
    {
        $creator = User::factory()->create();
        $song = Song::factory()->create();
        $song = \App\Models\Song::factory()->create();

        $promotion = CommunityPromotion::create([
            'promoter_id' => $creator->id,
            'promotable_type' => 'App\Models\Song',
            'promotable_id' => $song->id,
            'promotable_type' => 'App\\Models\\Song',
            'promotable_id' => $song->id,
            'title' => 'Artist Shoutout Campaign',
            'description' => 'Get featured on popular artist social media',
            'type' => 'artist_shoutout',
            'credits_required' => 25,
            'total_slots' => 10,
            'total_credits_pool' => 10 * 25, // total_slots * credits_required
            'filled_slots' => 0,
            'status' => 'active',
            'starts_at' => now(),
            'ends_at' => now()->addDays(7),
        ]);

        $this->assertDatabaseHas('community_promotions', [
            'promoter_id' => $creator->id,
            'promotable_type' => 'App\Models\Song',
            'promotable_id' => $song->id,
            'title' => 'Artist Shoutout Campaign',
            'type' => 'artist_shoutout',
            'credits_required' => 25,
        ]);
    }

    /** @test */
    public function promotion_can_check_if_active()
    {
        $creator = User::factory()->create();
        $song = Song::factory()->create();

        $activePromotion = CommunityPromotion::create([
            'promoter_id' => $creator->id,
            'promotable_type' => 'App\Models\Song',
            'promotable_id' => $song->id,
            'title' => 'Active Promotion',
            'description' => 'Test promotion',
            'type' => 'social_boost',
            'credits_required' => 20,
            'total_slots' => 10,
            'total_credits_pool' => 10 * 25, // total_slots * credits_required
            'status' => 'active',
            'starts_at' => now()->subHour(),
            'ends_at' => now()->addHour(),
        ]);

        $inactivePromotion = CommunityPromotion::create([
            'promoter_id' => $creator->id,
            'promotable_type' => 'App\Models\Song',
            'promotable_id' => $song->id,
            'title' => 'Inactive Promotion',
            'description' => 'Test promotion',
            'type' => 'social_boost',
            'credits_required' => 20,
            'total_slots' => 10,
            'total_credits_pool' => 10 * 25, // total_slots * credits_required
            'status' => 'completed',
            'starts_at' => now()->subDay(),
            'ends_at' => now()->subHour(),
        ]);

        $this->assertTrue($activePromotion->isActive());
        $this->assertFalse($inactivePromotion->isActive());
    }

    /** @test */
    public function promotion_can_check_available_slots()
    {
        $creator = User::factory()->create();
        $song = Song::factory()->create();

        $promotion = CommunityPromotion::create([
            'promoter_id' => $creator->id,
            'promotable_type' => 'App\Models\Song',
            'promotable_id' => $song->id,
            'title' => 'Limited Promotion',
            'description' => 'Test promotion',
            'type' => 'playlist_feature',
            'credits_required' => 15,
            'total_slots' => 5,
            'total_credits_pool' => 5 * 25, // total_slots * credits_required
            'filled_slots' => 3,
            'status' => 'active',
            'starts_at' => now(),
            'ends_at' => now()->addDay(),
        ]);

        $this->assertTrue($promotion->hasAvailableSlots());

        $promotion->update(['filled_slots' => 5]);
        $this->assertFalse($promotion->fresh()->hasAvailableSlots());
    }

    /** @test */
    public function user_can_participate_in_promotion_with_sufficient_credits()
    {
        $creator = User::factory()->create();
        $song = Song::factory()->create();
        $participant = User::factory()->create();

        // Setup participant wallet with enough credits
        $wallet = UserCredit::create([
            'user_id' => $participant->id,
            'available_credits' => 50,
            'earned_credits' => 50,
            'spent_credits' => 0,
            'pending_credits' => 0,
        ]);

        $promotion = CommunityPromotion::create([
            'promoter_id' => $creator->id,
            'promotable_type' => 'App\Models\Song',
            'promotable_id' => $song->id,
            'title' => 'Test Promotion',
            'description' => 'Test promotion',
            'type' => 'artist_shoutout',
            'credits_required' => 25,
            'total_slots' => 10,
            'total_credits_pool' => 10 * 25, // total_slots * credits_required
            'filled_slots' => 0,
            'status' => 'active',
            'starts_at' => now(),
            'ends_at' => now()->addDay(),
        ]);

        $this->assertTrue($promotion->canUserParticipate($participant));
    }

    /** @test */
    public function user_cannot_participate_without_sufficient_credits()
    {
        $creator = User::factory()->create();
        $song = Song::factory()->create();
        $participant = User::factory()->create();

        // Setup participant wallet with insufficient credits
        $wallet = UserCredit::create([
            'user_id' => $participant->id,
            'available_credits' => 10,
            'earned_credits' => 10,
            'spent_credits' => 0,
            'pending_credits' => 0,
        ]);

        $promotion = CommunityPromotion::create([
            'promoter_id' => $creator->id,
            'promotable_type' => 'App\Models\Song',
            'promotable_id' => $song->id,
            'title' => 'Expensive Promotion',
            'description' => 'Test promotion',
            'type' => 'event_mention',
            'credits_required' => 30,
            'total_slots' => 10,
            'total_credits_pool' => 10 * 25, // total_slots * credits_required
            'filled_slots' => 0,
            'status' => 'active',
            'starts_at' => now(),
            'ends_at' => now()->addDay(),
        ]);

        $this->assertFalse($promotion->canUserParticipate($participant));
    }

    /** @test */
    public function user_cannot_participate_in_same_promotion_twice()
    {
        $creator = User::factory()->create();
        $song = Song::factory()->create();
        $participant = User::factory()->create();

        $wallet = UserCredit::create([
            'user_id' => $participant->id,
            'available_credits' => 100,
            'earned_credits' => 100,
            'spent_credits' => 0,
            'pending_credits' => 0,
        ]);

        $promotion = CommunityPromotion::create([
            'promoter_id' => $creator->id,
            'promotable_type' => 'App\Models\Song',
            'promotable_id' => $song->id,
            'title' => 'Test Promotion',
            'description' => 'Test promotion',
            'type' => 'social_boost',
            'credits_required' => 20,
            'total_slots' => 10,
            'total_credits_pool' => 10 * 25, // total_slots * credits_required
            'filled_slots' => 0,
            'status' => 'active',
            'starts_at' => now(),
            'ends_at' => now()->addDay(),
        ]);

        // First participation
        PromotionParticipant::create([
            'promotion_id' => $promotion->id,
            'user_id' => $participant->id,
            'credits_spent' => 20,
            'status' => 'completed',
            'participated_at' => now(),
        ]);

        $this->assertFalse($promotion->canUserParticipate($participant));
    }

    /** @test */
    public function user_cannot_participate_when_promotion_is_full()
    {
        $creator = User::factory()->create();
        $song = Song::factory()->create();
        $participant = User::factory()->create();

        $wallet = UserCredit::create([
            'user_id' => $participant->id,
            'available_credits' => 100,
            'earned_credits' => 100,
            'spent_credits' => 0,
            'pending_credits' => 0,
        ]);

        $promotion = CommunityPromotion::create([
            'promoter_id' => $creator->id,
            'promotable_type' => 'App\Models\Song',
            'promotable_id' => $song->id,
            'title' => 'Full Promotion',
            'description' => 'Test promotion',
            'type' => 'playlist_feature',
            'credits_required' => 15,
            'total_slots' => 2,
            'total_credits_pool' => 2 * 25, // total_slots * credits_required
            'filled_slots' => 2, // Already full
            'status' => 'active',
            'starts_at' => now(),
            'ends_at' => now()->addDay(),
        ]);

        $this->assertFalse($promotion->canUserParticipate($participant));
    }

    /** @test */
    public function promotion_scopes_work_correctly()
    {
        $creator = User::factory()->create();
        $song = Song::factory()->create();

        // Active promotion
        $activePromotion = CommunityPromotion::create([
            'promoter_id' => $creator->id,
            'promotable_type' => 'App\Models\Song',
            'promotable_id' => $song->id,
            'title' => 'Active Promotion',
            'description' => 'Test',
            'type' => 'social_boost',
            'credits_required' => 20,
            'total_slots' => 10,
            'total_credits_pool' => 10 * 25, // total_slots * credits_required
            'filled_slots' => 0,
            'status' => 'active',
            'starts_at' => now()->subHour(),
            'ends_at' => now()->addHour(),
        ]);

        // Completed promotion
        $completedPromotion = CommunityPromotion::create([
            'promoter_id' => $creator->id,
            'promotable_type' => 'App\Models\Song',
            'promotable_id' => $song->id,
            'title' => 'Completed Promotion',
            'description' => 'Test',
            'type' => 'artist_shoutout',
            'credits_required' => 25,
            'total_slots' => 10,
            'total_credits_pool' => 10 * 25, // total_slots * credits_required
            'filled_slots' => 10,
            'status' => 'completed',
            'starts_at' => now()->subDay(),
            'ends_at' => now()->subHour(),
        ]);

        // Test active scope
        $activePromotions = CommunityPromotion::active()->get();
        $this->assertCount(1, $activePromotions);
        $this->assertEquals($activePromotion->id, $activePromotions->first()->id);
    }

    /** @test */
    public function promotion_can_be_completed()
    {
        $creator = User::factory()->create();
        $song = Song::factory()->create();

        $promotion = CommunityPromotion::create([
            'promoter_id' => $creator->id,
            'promotable_type' => 'App\Models\Song',
            'promotable_id' => $song->id,
            'title' => 'Test Promotion',
            'description' => 'Test',
            'type' => 'event_mention',
            'credits_required' => 30,
            'total_slots' => 10,
            'total_credits_pool' => 10 * 25, // total_slots * credits_required
            'status' => 'active',
            'starts_at' => now(),
            'ends_at' => now()->addDay(),
        ]);

        $this->assertEquals('active', $promotion->status);

        $promotion->complete();

        $this->assertEquals('completed', $promotion->fresh()->status);
    }

    /** @test */
    public function promotion_can_be_cancelled_with_refunds()
    {
        $creator = User::factory()->create();
        $song = Song::factory()->create();
        $participant = User::factory()->create();

        $promotion = CommunityPromotion::create([
            'promoter_id' => $creator->id,
            'promotable_type' => 'App\Models\Song',
            'promotable_id' => $song->id,
            'title' => 'Cancelled Promotion',
            'description' => 'Test',
            'type' => 'social_boost',
            'credits_required' => 20,
            'total_slots' => 10,
            'total_credits_pool' => 10 * 25, // total_slots * credits_required
            'status' => 'active',
            'starts_at' => now(),
            'ends_at' => now()->addDay(),
        ]);

        // Add a pending participant
        PromotionParticipant::create([
            'promotion_id' => $promotion->id,
            'user_id' => $participant->id,
            'credits_spent' => 20,
            'status' => 'pending',
            'participated_at' => now(),
        ]);

        $promotion->cancel();

        $this->assertEquals('cancelled', $promotion->fresh()->status);
        
        // Check participant status changed to refunded
        $participant = PromotionParticipant::where('promotion_id', $promotion->id)
            ->where('user_id', $participant->id)
            ->first();
        
        $this->assertEquals('refunded', $participant->status);
    }

    /** @test */
    public function promotion_type_constants_work()
    {
        $this->assertEquals('artist_shoutout', CommunityPromotion::TYPE_ARTIST_SHOUTOUT);
        $this->assertEquals('playlist_feature', CommunityPromotion::TYPE_PLAYLIST_FEATURE);
        $this->assertEquals('social_boost', CommunityPromotion::TYPE_SOCIAL_BOOST);
        $this->assertEquals('event_mention', CommunityPromotion::TYPE_EVENT_MENTION);

        $types = CommunityPromotion::getPromotionTypes();
        $this->assertIsArray($types);
        $this->assertArrayHasKey('artist_shoutout', $types);
        $this->assertArrayHasKey('typical_cost', $types['artist_shoutout']);
    }

    /** @test */
    public function promotion_relationships_work()
    {
        $creator = User::factory()->create(['name' => 'Creator User']);
        $participant = User::factory()->create(['name' => 'Participant User']);
        $song = Song::factory()->create();

        $promotion = CommunityPromotion::create([
            'promoter_id' => $creator->id,
            'promotable_type' => 'App\Models\Song',
            'promotable_id' => $song->id,
            'title' => 'Test Promotion',
            'description' => 'Test',
            'type' => 'playlist_feature',
            'credits_required' => 15,
            'total_slots' => 10,
            'total_credits_pool' => 10 * 15,
            'status' => 'active',
            'starts_at' => now(),
            'ends_at' => now()->addDay(),
        ]);

        PromotionParticipant::create([
            'promotion_id' => $promotion->id,
            'user_id' => $participant->id,
            'credits_spent' => 15,
            'status' => 'completed',
            'participated_at' => now(),
        ]);

        // Test creator relationship
        $this->assertEquals('Creator User', $promotion->promoter->name);

        // Test participants relationship
        $this->assertCount(1, $promotion->participants);
        $this->assertEquals('Participant User', $promotion->participants->first()->user->name);
    }

    /** @test */
    public function promotion_participation_rate_calculated_correctly()
    {
        $creator = User::factory()->create();
        $song = Song::factory()->create();

        $promotion = CommunityPromotion::create([
            'promoter_id' => $creator->id,
            'promotable_type' => 'App\Models\Song',
            'promotable_id' => $song->id,
            'title' => 'Test Promotion',
            'description' => 'Test',
            'type' => 'social_boost',
            'credits_required' => 20,
            'total_slots' => 20,
            'total_credits_pool' => 20 * 25, // total_slots * credits_required
            'filled_slots' => 5,
            'status' => 'active',
            'starts_at' => now(),
            'ends_at' => now()->addDay(),
        ]);

        $this->assertEquals(25.0, $promotion->participation_rate); // 5/20 * 100 = 25%
    }
}
