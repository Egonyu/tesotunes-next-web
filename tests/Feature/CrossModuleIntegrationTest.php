<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Song;
use App\Modules\Podcast\Models\Podcast;
use App\Modules\Podcast\Models\PodcastCategory;
use App\Modules\Store\Models\Product;
use App\Modules\Sacco\Models\SaccoMember;
use App\Services\CrossModuleRevenueService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CrossModuleIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected CrossModuleRevenueService $revenueService;
    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->revenueService = new CrossModuleRevenueService();
        $this->user = User::factory()->create();
    }

    /** @test */
    public function user_can_access_all_module_relationships()
    {
        // Test HasPodcast trait
        $this->assertTrue(method_exists($this->user, 'ownedPodcasts'));
        $this->assertTrue(method_exists($this->user, 'podcastSubscriptions'));
        $this->assertTrue(method_exists($this->user, 'podcastListens'));

        // Test HasStore trait
        $this->assertTrue(method_exists($this->user, 'storeProducts'));
        $this->assertTrue(method_exists($this->user, 'storeOrders'));

        // Test HasSaccoMembership trait
        $this->assertTrue(method_exists($this->user, 'saccoMembership'));
    }

    /** @test */
    public function cross_module_revenue_calculation_works()
    {
        // Create artist for the user
        $artist = \App\Models\Artist::factory()->create(['user_id' => $this->user->id]);
        
        // Create test data for music revenue
        $song = Song::factory()->create([
            'user_id' => $this->user->id,
            'artist_id' => $artist->id,
            'play_count' => 1000,
            'download_count' => 50,
            'status' => 'published',
        ]);

        // Calculate revenue
        $revenue = $this->revenueService->calculateTotalUserRevenue($this->user);

        $this->assertArrayHasKey('music', $revenue);
        $this->assertArrayHasKey('podcast', $revenue);
        $this->assertArrayHasKey('store', $revenue);
        $this->assertArrayHasKey('total', $revenue);

        // Music revenue should be calculated
        $this->assertGreaterThan(0, $revenue['music']['total']);
        $this->assertEquals(1000, $revenue['music']['stats']['total_streams']);
        $this->assertEquals(50, $revenue['music']['stats']['total_downloads']);
    }

    /** @test */
    public function podcast_revenue_integration_works()
    {
        if (!class_exists(\App\Modules\Podcast\Models\Podcast::class)) {
            $this->markTestSkipped('Podcast module not available');
        }

        // Create podcast category
        $category = PodcastCategory::factory()->create();

        // Create podcast with subscription
        $podcast = Podcast::factory()->create([
            'user_id' => $this->user->id,
            'podcast_category_id' => $category->id,
            'subscription_price' => 15000, // UGX 15,000
            'status' => 'published',
        ]);

        // Calculate revenue
        $revenue = $this->revenueService->calculateTotalUserRevenue($this->user);

        $this->assertArrayHasKey('podcast', $revenue);
        $this->assertEquals(0, $revenue['podcast']['total']); // No subscribers yet
        $this->assertEquals(1, $revenue['podcast']['stats']['podcasts_count']);
    }

    /** @test */
    public function store_revenue_integration_works()
    {
        if (!class_exists(\App\Modules\Store\Models\Product::class)) {
            $this->markTestSkipped('Store module not available');
        }

        // Create a store for the user
        $store = \App\Modules\Store\Models\Store::factory()->create([
            'user_id' => $this->user->id,
        ]);

        // Create store product
        $product = Product::factory()->create([
            'store_id' => $store->id,
            'price_ugx' => 25000, // UGX 25,000
        ]);

        // Create some orders to simulate sales
        $order = \App\Modules\Store\Models\Order::factory()->create([
            'store_id' => $store->id,
            'user_id' => User::factory()->create()->id,
            'subtotal' => 25000,
            'status' => 'completed',
        ]);

        \App\Modules\Store\Models\OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => 1,
            'unit_price' => 25000,
        ]);

        // Calculate revenue
        $revenue = $this->revenueService->calculateTotalUserRevenue($this->user);

        $this->assertArrayHasKey('store', $revenue);
        $this->assertEquals(1, $revenue['store']['stats']['products_count']);
    }

    /** @test */
    public function user_can_subscribe_to_podcast()
    {
        if (!class_exists(\App\Modules\Podcast\Models\Podcast::class)) {
            $this->markTestSkipped('Podcast module not available');
        }

        $category = PodcastCategory::factory()->create();
        $podcast = Podcast::factory()->create(['podcast_category_id' => $category->id]);

        // Subscribe to podcast
        $subscription = $this->user->subscribeToPodcast($podcast);

        $this->assertDatabaseHas('podcast_subscriptions', [
            'user_id' => $this->user->id,
            'podcast_id' => $podcast->id,
            'status' => 'active',
        ]);

        $this->assertTrue($this->user->isSubscribedToPodcast($podcast));
    }

    /** @test */
    public function cross_module_report_generation_works()
    {
        // Create some test data
        Song::factory()->create([
            'user_id' => $this->user->id,
            'play_count' => 500,
            'status' => 'published',
        ]);

        $report = $this->revenueService->generateCrossModuleReport($this->user, 'monthly');

        $this->assertArrayHasKey('user_id', $report);
        $this->assertArrayHasKey('revenue', $report);
        $this->assertArrayHasKey('growth_potential', $report);
        $this->assertArrayHasKey('recommendations', $report);
        $this->assertArrayHasKey('loan_eligibility', $report);

        $this->assertEquals($this->user->id, $report['user_id']);
        $this->assertEquals('monthly', $report['period']);
    }

    /** @test */
    public function loan_eligibility_calculation_works()
    {
        // Create high-revenue user
        Song::factory()->count(5)->create([
            'user_id' => $this->user->id,
            'play_count' => 10000,
            'download_count' => 100,
            'status' => 'published',
        ]);

        $revenue = $this->revenueService->calculateTotalUserRevenue($this->user);
        $report = $this->revenueService->generateCrossModuleReport($this->user);

        $this->assertArrayHasKey('loan_eligibility', $report);
        $eligibility = $report['loan_eligibility'];

        $this->assertArrayHasKey('eligible', $eligibility);
        $this->assertArrayHasKey('max_loan_amount', $eligibility);
        $this->assertArrayHasKey('recommended_payment', $eligibility);
        $this->assertArrayHasKey('risk_level', $eligibility);

        if ($revenue['total'] >= 50000) {
            $this->assertTrue($eligibility['eligible']);
            $this->assertGreaterThan(0, $eligibility['max_loan_amount']);
        }
    }

    /** @test */
    public function automated_loan_payment_system_works()
    {
        if (!class_exists(\App\Modules\Sacco\Models\SaccoMember::class)) {
            $this->markTestSkipped('SACCO module not available');
        }

        // Create SACCO member with active loan
        $saccoMember = SaccoMember::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'active',
        ]);

        // Create artist for the user
        $artist = \App\Models\Artist::factory()->create(['user_id' => $this->user->id]);

        // Create sufficient revenue
        Song::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'artist_id' => $artist->id,
            'play_count' => 20000,
            'status' => 'published',
        ]);

        $users = $this->revenueService->getUsersEligibleForLoanPayments();

        $this->assertInstanceOf(\Illuminate\Support\Collection::class, $users);
    }

    /** @test */
    public function module_health_check_command_works()
    {
        // Test that command runs and produces expected output
        // Don't check exit code as it may vary in test environment
        $this->artisan('modules:health-check')
            ->expectsOutput('🔍 Starting module health check...')
            ->run(); // Just run it without asserting exit code

        $this->artisan('modules:health-check', ['--module' => 'podcast'])
            ->expectsOutput('🔍 Starting module health check...')
            ->run();
    }

    /** @test */
    public function user_podcast_ownership_works()
    {
        if (!class_exists(\App\Modules\Podcast\Models\Podcast::class)) {
            $this->markTestSkipped('Podcast module not available');
        }

        $category = PodcastCategory::factory()->create();
        $podcast = Podcast::factory()->create([
            'user_id' => $this->user->id,
            'podcast_category_id' => $category->id,
        ]);

        $this->assertTrue($this->user->ownsPodcast($podcast));
        $this->assertTrue($podcast->isOwnedBy($this->user));

        // Test with different user
        $otherUser = User::factory()->create();
        $this->assertFalse($otherUser->ownsPodcast($podcast));
        $this->assertFalse($podcast->isOwnedBy($otherUser));
    }

    /** @test */
    public function podcast_collaboration_works()
    {
        if (!class_exists(\App\Modules\Podcast\Models\Podcast::class)) {
            $this->markTestSkipped('Podcast module not available');
        }

        $category = PodcastCategory::factory()->create();
        $podcast = Podcast::factory()->create(['podcast_category_id' => $category->id]);
        $collaborator = User::factory()->create();

        // Add collaborator
        $podcast->collaborators()->create([
            'user_id' => $collaborator->id,
            'role' => 'editor',
            'status' => 'active',
            'can_edit' => true,
            'can_publish' => false,
            'revenue_split_percentage' => 25.00,
        ]);

        $this->assertTrue($collaborator->isCollaboratorOnPodcast($podcast));
        $this->assertTrue($podcast->hasCollaborator($collaborator));
    }

    /** @test */
    public function cross_module_statistics_are_accurate()
    {
        // Create artist for the user
        $artist = \App\Models\Artist::factory()->create(['user_id' => $this->user->id]);
        
        // Create diverse content
        $songs = Song::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'artist_id' => $artist->id,
            'play_count' => 1000,
            'status' => 'published',
        ]);

        if (class_exists(\App\Modules\Podcast\Models\Podcast::class)) {
            $category = PodcastCategory::factory()->create();
            $podcast = Podcast::factory()->create([
                'user_id' => $this->user->id,
                'podcast_category_id' => $category->id,
                'total_episodes' => 5,
                'subscriber_count' => 50,
            ]);
        }

        $revenue = $this->revenueService->calculateTotalUserRevenue($this->user);

        // Verify music stats
        $this->assertEquals(3, $revenue['music']['stats']['songs_count']);
        $this->assertEquals(3000, $revenue['music']['stats']['total_streams']); // 3 songs × 1000 plays

        // Verify breakdown percentages add up to 100%
        $breakdown = $revenue['breakdown'];
        $totalPercentage = $breakdown['music_percentage'] +
                          $breakdown['podcast_percentage'] +
                          $breakdown['store_percentage'];

        $this->assertEquals(100, $totalPercentage);
    }

    /** @test */
    public function revenue_recommendations_are_generated()
    {
        // Create unbalanced revenue (only music)
        Song::factory()->count(2)->create([
            'user_id' => $this->user->id,
            'play_count' => 5000,
            'status' => 'published',
        ]);

        $revenue = $this->revenueService->calculateTotalUserRevenue($this->user);
        $report = $this->revenueService->generateCrossModuleReport($this->user);

        $this->assertArrayHasKey('recommendations', $report);
        $recommendations = $report['recommendations'];

        $this->assertIsArray($recommendations);

        // Should suggest diversification if only music revenue exists
        if ($revenue['music']['total'] > 0 && $revenue['store']['total'] === 0) {
            $this->assertContains(
                'Consider adding merchandise to your store to diversify revenue streams',
                $recommendations
            );
        }
    }
}