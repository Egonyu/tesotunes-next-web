<?php

namespace Tests\Feature\Distribution;

use Tests\TestCase;
use App\Models\User;
use App\Models\Artist;
use App\Models\ArtistProfile;
use App\Models\Song;
use App\Models\Album;
use App\Models\Distribution;
use App\Models\DistributionPlatform;
use App\Models\ISRCCode;
use App\Services\DistributionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Event;

class DistributionSubmissionTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();
        Queue::fake();
        Event::fake();
    }

    /**
     * Test successful distribution submission to single platform
     */
    public function test_submit_single_platform_distribution()
    {
        // Arrange
        $artist = User::factory()->create();
        $artistProfile = ArtistProfile::factory()->create([
            'user_id' => $artist->id,
            'distribution_suspended' => false,
        ]);

        $song = Song::factory()->create([
            'artist_id' => $artistProfile->id,
            'status' => 'published',
            'is_active' => true,
            'title' => 'Test Song',
            'duration_seconds' => 180,
            'file_size_bytes' => 5000000,
        ]);

        // Create ISRC for the song
        ISRCCode::factory()->create([
            'song_id' => $song->id,
            'status' => 'registered',
            'cleared_for_distribution' => true,
        ]);

        // Act
        $response = $this->actingAs($artist)->postJson("/api/songs/{$song->id}/distribute", [
            'platforms' => ['spotify'],
            'release_date' => now()->addDays(7)->format('Y-m-d'),
            'territories' => ['worldwide'],
            'price_tier' => 'standard',
        ]);

        // Assert
        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'distributions' => [
                    '*' => [
                        'id',
                        'platform_code',
                        'platform_name',
                        'status',
                        'created_at',
                    ]
                ],
                'estimated_delivery',
            ]);

        // Verify distribution record was created
        $this->assertDatabaseHas('distributions', [
            'song_id' => $song->id,
            'artist_id' => $artistProfile->id,
            'platform_code' => 'spotify',
            'status' => 'pending',
        ]);

        // Verify distribution job was queued
        Queue::assertPushed(\App\Jobs\ProcessDistribution::class);
    }

    /**
     * Test multi-platform distribution submission
     */
    public function test_submit_multi_platform_distribution()
    {
        $artist = User::factory()->create();
        $artistProfile = ArtistProfile::factory()->create(['user_id' => $artist->id]);
        $song = Song::factory()->create([
            'artist_id' => $artistProfile->id,
            'status' => 'published',
            'is_active' => true,
            'duration_seconds' => 180,
            'file_size_bytes' => 5000000,
        ]);

        ISRCCode::factory()->create([
            'song_id' => $song->id,
            'status' => 'registered',
            'cleared_for_distribution' => true,
        ]);

        $platforms = ['spotify', 'apple_music', 'youtube_music', 'amazon_music'];

        $response = $this->actingAs($artist)->postJson("/api/songs/{$song->id}/distribute", [
            'platforms' => $platforms,
            'release_date' => now()->addDays(14)->format('Y-m-d'),
            'territories' => ['worldwide'],
        ]);

        $response->assertStatus(201);

        // Verify distributions were created for all platforms
        foreach ($platforms as $platform) {
            $this->assertDatabaseHas('distributions', [
                'song_id' => $song->id,
                'platform_code' => $platform,
                'status' => 'pending',
            ]);
        }

        // Verify correct number of jobs were queued
        Queue::assertPushed(\App\Jobs\ProcessDistribution::class, count($platforms));
    }

    /**
     * Test distribution submission validation
     */
    public function test_distribution_submission_validation()
    {
        $artist = User::factory()->create();
        $artistProfile = ArtistProfile::factory()->create(['user_id' => $artist->id]);
        $song = Song::factory()->create(['artist_id' => $artistProfile->id]);

        // Test missing required fields
        $response = $this->actingAs($artist)->postJson("/api/songs/{$song->id}/distribute", []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['platforms']);

        // Test invalid platform
        $response = $this->actingAs($artist)->postJson("/api/songs/{$song->id}/distribute", [
            'platforms' => ['invalid_platform'],
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['platforms.0']);

        // Test invalid release date (in the past)
        $response = $this->actingAs($artist)->postJson("/api/songs/{$song->id}/distribute", [
            'platforms' => ['spotify'],
            'release_date' => now()->subDays(1)->format('Y-m-d'),
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['release_date']);
    }

    /**
     * Test distribution submission for unpublished song
     */
    public function test_distribute_unpublished_song()
    {
        $artist = User::factory()->create();
        $artistProfile = ArtistProfile::factory()->create(['user_id' => $artist->id]);
        $song = Song::factory()->create([
            'artist_id' => $artistProfile->id,
            'status' => 'pending_review', // Not published
        ]);

        $response = $this->actingAs($artist)->postJson("/api/songs/{$song->id}/distribute", [
            'platforms' => ['spotify'],
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'Song must be published before distribution',
            ]);
    }

    /**
     * Test distribution submission without ISRC
     */
    public function test_distribute_song_without_isrc()
    {
        $artist = User::factory()->create();
        $artistProfile = ArtistProfile::factory()->create(['user_id' => $artist->id]);
        $song = Song::factory()->create([
            'artist_id' => $artistProfile->id,
            'status' => 'published',
            'is_active' => true,
            'duration_seconds' => 180,
            'file_size_bytes' => 5000000,
        ]);

        // No ISRC created for this song

        $response = $this->actingAs($artist)->postJson("/api/songs/{$song->id}/distribute", [
            'platforms' => ['spotify'],
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'ISRC code is required for distribution',
            ]);
    }

    /**
     * Test distribution submission for song not owned by user
     */
    public function test_distribute_song_not_owned()
    {
        $artist1 = User::factory()->create();
        $artist2 = User::factory()->create();
        $artistProfile2 = ArtistProfile::factory()->create(['user_id' => $artist2->id]);
        $song = Song::factory()->create(['artist_id' => $artistProfile2->id]);

        $response = $this->actingAs($artist1)->postJson("/api/songs/{$song->id}/distribute", [
            'platforms' => ['spotify'],
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'You do not have permission to distribute this song',
            ]);
    }

    /**
     * Test distribution with territorial restrictions
     */
    public function test_distribution_with_territorial_restrictions()
    {
        $artist = User::factory()->create();
        $artistProfile = ArtistProfile::factory()->create(['user_id' => $artist->id]);
        $song = Song::factory()->create([
            'artist_id' => $artistProfile->id,
            'status' => 'published',
            'is_active' => true,
            'duration_seconds' => 180,
            'file_size_bytes' => 5000000,
        ]);

        ISRCCode::factory()->create([
            'song_id' => $song->id,
            'status' => 'registered',
            'cleared_for_distribution' => true,
            'territorial_restrictions' => ['China', 'Iran'],
        ]);

        $response = $this->actingAs($artist)->postJson("/api/songs/{$song->id}/distribute", [
            'platforms' => ['spotify'],
            'territories' => ['worldwide'],
        ]);

        $response->assertStatus(201);

        $distribution = Distribution::where('song_id', $song->id)->first();
        $this->assertArrayHasKey('territorial_restrictions', $distribution->distribution_metadata);
        $this->assertContains('China', $distribution->distribution_metadata['territorial_restrictions']);
    }

    /**
     * Test album distribution submission
     */
    public function test_album_distribution_submission()
    {
        $artist = User::factory()->create();
        $artistProfile = ArtistProfile::factory()->create(['user_id' => $artist->id]);
        $album = Album::factory()->create(['artist_id' => $artistProfile->id]);

        // Create songs for the album
        $songs = Song::factory()->count(5)->create([
            'artist_id' => $artistProfile->id,
            'album_id' => $album->id,
            'status' => 'published',
            'is_active' => true,
            'duration_seconds' => 180,
            'file_size_bytes' => 5000000,
        ]);

        // Create ISRCs for all songs
        foreach ($songs as $song) {
            ISRCCode::factory()->create([
                'song_id' => $song->id,
                'status' => 'registered',
                'cleared_for_distribution' => true,
            ]);
        }

        $response = $this->actingAs($artist)->postJson("/api/albums/{$album->id}/distribute", [
            'platforms' => ['spotify', 'apple_music'],
            'release_date' => now()->addDays(21)->format('Y-m-d'),
            'territories' => ['worldwide'],
            'release_type' => 'album',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'album_distribution_id',
                'songs_distributed',
                'total_distributions',
            ]);

        // Verify distributions were created for all songs and platforms
        foreach ($songs as $song) {
            $this->assertDatabaseHas('distributions', [
                'song_id' => $song->id,
                'platform_code' => 'spotify',
                'status' => 'pending',
            ]);
            $this->assertDatabaseHas('distributions', [
                'song_id' => $song->id,
                'platform_code' => 'apple_music',
                'status' => 'pending',
            ]);
        }
    }

    /**
     * Test distribution status tracking
     */
    public function test_distribution_status_tracking()
    {
        $artist = User::factory()->create();
        $artistProfile = ArtistProfile::factory()->create(['user_id' => $artist->id]);
        $song = Song::factory()->create(['artist_id' => $artistProfile->id]);

        $distribution = Distribution::factory()->create([
            'song_id' => $song->id,
            'artist_id' => $artistProfile->id,
            'platform_code' => 'spotify',
            'status' => 'processing',
        ]);

        $response = $this->actingAs($artist)->getJson("/api/distributions/{$distribution->id}/status");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'distribution' => [
                    'id',
                    'platform_code',
                    'platform_name',
                    'status',
                    'created_at',
                    'last_updated',
                ],
                'timeline' => [
                    '*' => [
                        'status',
                        'timestamp',
                        'message',
                    ]
                ],
            ]);
    }

    /**
     * Test distribution removal request
     */
    public function test_distribution_removal_request()
    {
        $artist = User::factory()->create();
        $artistProfile = ArtistProfile::factory()->create(['user_id' => $artist->id]);
        $song = Song::factory()->create(['artist_id' => $artistProfile->id]);

        $distribution = Distribution::factory()->create([
            'song_id' => $song->id,
            'artist_id' => $artistProfile->id,
            'platform_code' => 'spotify',
            'status' => 'live',
            'live_date' => now()->subDays(30),
        ]);

        $response = $this->actingAs($artist)->postJson("/api/distributions/{$distribution->id}/remove", [
            'reason' => 'Artist request',
            'immediate' => false,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Removal request submitted successfully',
            ]);

        // Verify removal job was queued
        Queue::assertPushed(\App\Jobs\RemoveFromDistribution::class);

        $distribution->refresh();
        $this->assertNotNull($distribution->removal_requested_at);
    }

    /**
     * Test distribution analytics endpoint
     */
    public function test_distribution_analytics()
    {
        $artist = User::factory()->create();
        $artistProfile = ArtistProfile::factory()->create(['user_id' => $artist->id]);

        // Create test distributions with analytics data
        $songs = Song::factory()->count(3)->create(['artist_id' => $artistProfile->id]);

        foreach ($songs as $song) {
            Distribution::factory()->create([
                'song_id' => $song->id,
                'artist_id' => $artistProfile->id,
                'platform_code' => 'spotify',
                'status' => 'live',
                'platform_metadata' => [
                    'streams' => $this->faker->numberBetween(1000, 10000),
                    'revenue' => $this->faker->randomFloat(2, 50, 500),
                ],
            ]);
        }

        $response = $this->actingAs($artist)->getJson('/api/artist/distribution-analytics', [
            'start_date' => now()->subDays(30)->format('Y-m-d'),
            'end_date' => now()->format('Y-m-d'),
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'total_distributions',
                'live_distributions',
                'total_streams',
                'total_revenue',
                'platform_breakdown' => [
                    '*' => [
                        'platform',
                        'distributions_count',
                        'streams',
                        'revenue',
                    ]
                ],
                'performance_trends',
            ]);
    }

    /**
     * Test distribution webhook handling
     */
    public function test_distribution_webhook_handling()
    {
        $distribution = Distribution::factory()->create([
            'platform_code' => 'spotify',
            'status' => 'processing',
            'platform_metadata' => ['submission_id' => 'SPOT_SUB_123'],
        ]);

        // Mock webhook payload from Spotify
        $webhookPayload = [
            'event' => 'distribution.live',
            'submission_id' => 'SPOT_SUB_123',
            'track_id' => 'spotify:track:4iV5W9uYEdYUVa79Axb7Rh',
            'track_url' => 'https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh',
            'live_date' => now()->toISOString(),
        ];

        $response = $this->postJson('/api/webhooks/distribution/spotify', $webhookPayload, [
            'X-Spotify-Signature' => 'valid_signature_hash'
        ]);

        $response->assertStatus(200)
            ->assertJson(['status' => 'processed']);

        // Verify distribution status was updated
        $distribution->refresh();
        $this->assertEquals('live', $distribution->status);
        $this->assertNotNull($distribution->live_date);
        $this->assertEquals('https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh', $distribution->platform_url);
    }

    /**
     * Test distribution retry mechanism
     */
    public function test_distribution_retry_mechanism()
    {
        $artist = User::factory()->create();
        $artistProfile = ArtistProfile::factory()->create(['user_id' => $artist->id]);

        $distribution = Distribution::factory()->create([
            'artist_id' => $artistProfile->id,
            'platform_code' => 'spotify',
            'status' => 'failed',
            'error_message' => 'Temporary API error',
            'retry_count' => 1,
        ]);

        $response = $this->actingAs($artist)->postJson("/api/distributions/{$distribution->id}/retry");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Distribution retry initiated',
            ]);

        // Verify retry job was queued
        Queue::assertPushed(\App\Jobs\ProcessDistribution::class);

        $distribution->refresh();
        $this->assertEquals('pending', $distribution->status);
        $this->assertEquals(2, $distribution->retry_count);
    }

    /**
     * Test distribution with content advisory warnings
     */
    public function test_distribution_with_content_advisory()
    {
        $artist = User::factory()->create();
        $artistProfile = ArtistProfile::factory()->create(['user_id' => $artist->id]);
        $song = Song::factory()->create([
            'artist_id' => $artistProfile->id,
            'status' => 'published',
            'is_active' => true,
            'is_explicit' => true,
            'duration_seconds' => 180,
            'file_size_bytes' => 5000000,
        ]);

        ISRCCode::factory()->create([
            'song_id' => $song->id,
            'status' => 'registered',
            'cleared_for_distribution' => true,
        ]);

        $response = $this->actingAs($artist)->postJson("/api/songs/{$song->id}/distribute", [
            'platforms' => ['spotify'],
            'content_advisory' => 'explicit',
            'parental_advisory' => true,
        ]);

        $response->assertStatus(201);

        $distribution = Distribution::where('song_id', $song->id)->first();
        $this->assertEquals('explicit', $distribution->distribution_metadata['content_advisory']);
        $this->assertTrue($distribution->distribution_metadata['parental_advisory']);
    }

    /**
     * Test distribution royalty reporting
     */
    public function test_distribution_royalty_reporting()
    {
        $user = User::factory()->create();
        $artist = Artist::factory()->create(['user_id' => $user->id]);

        $distribution = Distribution::factory()->create([
            'artist_id' => $artist->id,
            'platform_code' => 'spotify',
            'status' => 'live',
        ]);

        // Create some revenue data
        \DB::table('distribution_revenue')->insert([
            'distribution_id' => $distribution->id,
            'reporting_period' => '2024-01',
            'streams' => 10000,
            'revenue' => 500.00,
            'currency' => 'USD',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Verify data exists
        $revenueExists = \DB::table('distribution_revenue')
            ->where('distribution_id', $distribution->id)
            ->where('reporting_period', '2024-01')
            ->exists();
        
        $this->assertTrue($revenueExists, 'Revenue data should exist in database');

        \Laravel\Sanctum\Sanctum::actingAs($user);

        $response = $this->getJson("/api/distributions/{$distribution->id}/royalty-report?period=2024-01");

        // Debug
        if ($response->status() !== 200) {
            dump($response->json());
            dump($response->status());
        }

        $response->assertStatus(200)
            ->assertJsonStructure([
                'distribution',
                'revenue_data' => [
                    'gross_revenue',
                    'platform_fee',
                    'service_fee',
                    'artist_earnings',
                    'streams',
                    'currency',
                ],
                'payment_details',
            ]);
    }

    /**
     * Test bulk distribution operations
     */
    public function test_bulk_distribution_operations()
    {
        $artist = User::factory()->create();
        $artistProfile = ArtistProfile::factory()->create(['user_id' => $artist->id]);

        $songs = Song::factory()->count(5)->create([
            'artist_id' => $artistProfile->id,
            'status' => 'published',
            'is_active' => true,
            'duration_seconds' => 180,
            'file_size_bytes' => 5000000,
        ]);

        // Create ISRCs for all songs
        foreach ($songs as $song) {
            ISRCCode::factory()->create([
                'song_id' => $song->id,
                'status' => 'registered',
                'cleared_for_distribution' => true,
            ]);
        }

        $songIds = $songs->pluck('id')->toArray();

        $response = $this->actingAs($artist)->postJson('/api/distributions/bulk-submit', [
            'song_ids' => $songIds,
            'platforms' => ['spotify', 'apple_music'],
            'release_date' => now()->addDays(14)->format('Y-m-d'),
            'territories' => ['worldwide'],
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'bulk_distribution_id',
                'total_distributions_created',
                'estimated_completion',
            ]);

        // Verify distributions were created for all songs and platforms
        foreach ($songs as $song) {
            $this->assertDatabaseHas('distributions', [
                'song_id' => $song->id,
                'platform_code' => 'spotify',
                'status' => 'pending',
            ]);
            $this->assertDatabaseHas('distributions', [
                'song_id' => $song->id,
                'platform_code' => 'apple_music',
                'status' => 'pending',
            ]);
        }

        // Verify bulk processing job was queued
        Queue::assertPushed(\App\Jobs\ProcessBulkDistribution::class);
    }

    /**
     * Test distribution performance monitoring
     */
    public function test_distribution_performance_monitoring()
    {
        $admin = User::factory()->create();

        // Create test distributions with various statuses
        Distribution::factory()->count(10)->create(['status' => 'live']);
        Distribution::factory()->count(5)->create(['status' => 'failed']);
        Distribution::factory()->count(3)->create(['status' => 'pending']);

        $response = $this->actingAs($admin)->getJson('/api/admin/distribution-performance');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'total_distributions',
                'success_rate',
                'failure_rate',
                'average_processing_time',
                'platform_performance' => [
                    '*' => [
                        'platform',
                        'total_submissions',
                        'success_count',
                        'failure_count',
                        'success_rate',
                    ]
                ],
                'recent_failures',
                'processing_queue_length',
            ]);

        $data = $response->json();
        $this->assertEquals(18, $data['total_distributions']);
        $this->assertGreaterThan(0, $data['success_rate']);
    }
}