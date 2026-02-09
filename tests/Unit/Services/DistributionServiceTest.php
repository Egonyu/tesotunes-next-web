<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\DistributionService;
use App\Services\MusicStorageService;
use App\Models\Song;
use App\Models\Distribution;
use App\Models\DistributionPlatform;
use App\Models\Artist;
use App\Models\ArtistProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Queue;
use Illuminate\Database\Eloquent\Collection;
use Mockery;
use Exception;

class DistributionServiceTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected DistributionService $distributionService;
    protected $storageServiceMock;

    protected function setUp(): void
    {
        parent::setUp();

        $this->storageServiceMock = Mockery::mock(MusicStorageService::class);
        $this->distributionService = new DistributionService($this->storageServiceMock);

        Queue::fake();
    }

    /**
     * Test successful music distribution to multiple platforms
     */
    public function test_distribute_music_success()
    {
        // Arrange - Create artist with proper verification
        $user = User::factory()->create();
        $artist = Artist::factory()->create([
            'user_id' => $user->id,
            'is_verified' => true,
            'distribution_suspended' => false,
            'stage_name' => 'Test Artist',
            'bio' => 'Test artist biography',
        ]);

        $song = Song::factory()->create([
            'artist_id' => $artist->id,
            'status' => 'published',
            'visibility' => 'public',
            'title' => 'Test Song',
            'duration_seconds' => 180, // 3 minutes
            'file_size_bytes' => 5000000, // 5MB
        ]);

        $platforms = ['spotify', 'apple_music', 'youtube_music'];
        $distributionData = [
            'release_date' => now()->addDays(7)->format('Y-m-d'),
            'territories' => ['worldwide'],
        ];

        // Act
        $result = $this->distributionService->distributeMusic($song, $platforms, $distributionData);

        // Assert
        $this->assertTrue($result['success']);
        $this->assertEquals('Music submitted for distribution', $result['message']);
        $this->assertCount(3, $result['distributions']);

        // Verify distribution records were created
        foreach ($platforms as $platform) {
            $this->assertDatabaseHas('distributions', [
                'song_id' => $song->id,
                'artist_id' => $artist->id,
                'platform_code' => $platform,
                'status' => DistributionService::STATUS_PENDING,
            ]);
        }

        // Verify distribution jobs were queued
        Queue::assertPushed(\App\Jobs\ProcessDistribution::class, 3);
    }

    /**
     * Test distribution validation - song not eligible
     */
    public function test_distribute_music_song_not_eligible()
    {
        // Arrange
        $artist = ArtistProfile::factory()->create();
        $song = Song::factory()->create([
            'artist_id' => $artist->id,
            'status' => 'pending_review', // Not published
            'visibility' => 'public',
        ]);

        $platforms = ['spotify'];

        // Act & Assert
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Song must be published before distribution');

        $this->distributionService->distributeMusic($song, $platforms);
    }

    /**
     * Test distribution validation - file too small
     */
    public function test_distribute_music_file_too_small()
    {
        // Arrange
        $user = User::factory()->create();
        $artist = Artist::factory()->create([
            'user_id' => $user->id,
            'is_verified' => true,
            'distribution_suspended' => false,
            'stage_name' => 'Test Artist',
            'bio' => 'Test bio',
        ]);
        
        $song = Song::factory()->create([
            'artist_id' => $artist->id,
            'status' => 'published',
            'visibility' => 'public',
            'file_size_bytes' => 500000, // 500KB - too small
        ]);

        $platforms = ['spotify'];

        // Act & Assert
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Audio file too small for distribution');

        $this->distributionService->distributeMusic($song, $platforms);
    }

    /**
     * Test distribution validation - song too short
     */
    public function test_distribute_music_song_too_short()
    {
        // Arrange
        $user = User::factory()->create();
        $artist = Artist::factory()->create([
            'user_id' => $user->id,
            'is_verified' => true,
            'distribution_suspended' => false,
            'stage_name' => 'Test Artist',
            'bio' => 'Test bio',
        ]);
        
        $song = Song::factory()->create([
            'artist_id' => $artist->id,
            'status' => 'published',
            'visibility' => 'public',
            'file_size_bytes' => 5000000,
            'duration_seconds' => 25, // 25 seconds - too short
        ]);

        $platforms = ['spotify'];

        // Act & Assert
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Song too short for distribution (minimum 30 seconds)');

        $this->distributionService->distributeMusic($song, $platforms);
    }

    /**
     * Test distribution validation - song too long
     */
    public function test_distribute_music_song_too_long()
    {
        // Arrange
        $user = User::factory()->create();
        $artist = Artist::factory()->create([
            'user_id' => $user->id,
            'is_verified' => true,
            'distribution_suspended' => false,
            'stage_name' => 'Test Artist',
            'bio' => 'Test bio',
        ]);
        
        $song = Song::factory()->create([
            'artist_id' => $artist->id,
            'status' => 'published',
            'visibility' => 'public',
            'file_size_bytes' => 5000000,
            'duration_seconds' => 1000, // Over 15 minutes
        ]);

        $platforms = ['spotify'];

        // Act & Assert
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Song too long for distribution (maximum 15 minutes)');

        $this->distributionService->distributeMusic($song, $platforms);
    }

    /**
     * Test distribution validation - artist rights validation
     */
    public function test_distribute_music_artist_no_rights()
    {
        // Arrange - Create artist without verification
        $user = User::factory()->create();
        $artist = Artist::factory()->create([
            'user_id' => $user->id,
            'is_verified' => false, // Not verified = no distribution rights
            'distribution_suspended' => false,
            'stage_name' => 'Test Artist',
            'bio' => 'Test bio',
        ]);
        
        $song = Song::factory()->create([
            'artist_id' => $artist->id,
            'status' => 'published',
            'visibility' => 'public',
            'file_size_bytes' => 5000000,
            'duration_seconds' => 180,
        ]);

        $platforms = ['spotify'];

        // Act & Assert
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Artist does not have distribution rights');

        $this->distributionService->distributeMusic($song, $platforms);
    }

    /**
     * Test distribution validation - artist suspended
     */
    public function test_distribute_music_artist_suspended()
    {
        // Arrange - Create suspended artist
        $user = User::factory()->create();
        $artist = Artist::factory()->create([
            'user_id' => $user->id,
            'is_verified' => true,
            'distribution_suspended' => true, // Suspended
            'stage_name' => 'Test Artist',
            'bio' => 'Test bio',
        ]);

        $song = Song::factory()->create([
            'artist_id' => $artist->id,
            'status' => 'published',
            'visibility' => 'public',
            'file_size_bytes' => 5000000,
            'duration_seconds' => 180,
        ]);

        $platforms = ['spotify'];

        // Act & Assert
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Artist distribution privileges are suspended');

        $this->distributionService->distributeMusic($song, $platforms);
    }

    /**
     * Test distribution validation - unsupported platform
     */
    public function test_distribute_music_unsupported_platform()
    {
        // Arrange
        $user = User::factory()->create();
        $artist = Artist::factory()->create([
            'user_id' => $user->id,
            'is_verified' => true,
            'distribution_suspended' => false,
            'stage_name' => 'Test Artist',
            'bio' => 'Test bio',
        ]);
        
        $song = Song::factory()->create([
            'artist_id' => $artist->id,
            'status' => 'published',
            'visibility' => 'public',
            'file_size_bytes' => 5000000,
            'duration_seconds' => 180,
        ]);

        $platforms = ['unsupported_platform'];

        // Act & Assert
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Unsupported platform: unsupported_platform');

        $this->distributionService->distributeMusic($song, $platforms);
    }

    /**
     * Test distribution status update
     */
    public function test_update_distribution_status()
    {
        // Arrange
        $distribution = Distribution::factory()->create([
            'status' => DistributionService::STATUS_PENDING,
        ]);

        $metadata = [
            'platform_url' => 'https://spotify.com/track/123',
            'platform_id' => 'SPOT_123456',
        ];

        // Act
        $result = $this->distributionService->updateDistributionStatus(
            $distribution,
            DistributionService::STATUS_LIVE,
            $metadata
        );

        // Assert
        $this->assertEquals(DistributionService::STATUS_LIVE, $result->status);
        $this->assertNotNull($result->live_date);
        $this->assertEquals('https://spotify.com/track/123', $result->platform_url);
        $this->assertEquals('SPOT_123456', $result->platform_id);
        $this->assertArrayHasKey('platform_url', $result->platform_metadata);
    }

    /**
     * Test distribution status update - failure
     */
    public function test_update_distribution_status_failure()
    {
        // Arrange
        $distribution = Distribution::factory()->create([
            'status' => DistributionService::STATUS_PROCESSING,
        ]);

        $metadata = [
            'error_message' => 'Invalid audio format',
            'rejection_reason' => 'Audio quality does not meet standards',
        ];

        // Act
        $result = $this->distributionService->updateDistributionStatus(
            $distribution,
            DistributionService::STATUS_FAILED,
            $metadata
        );

        // Assert
        $this->assertEquals(DistributionService::STATUS_FAILED, $result->status);
        $this->assertEquals('Invalid audio format', $result->error_message);
        $this->assertEquals('Audio quality does not meet standards', $result->rejection_reason);
    }

    /**
     * Test distribution status update - invalid status
     */
    public function test_update_distribution_status_invalid()
    {
        // Arrange
        $distribution = Distribution::factory()->create();

        // Act & Assert
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Invalid distribution status: invalid_status');

        $this->distributionService->updateDistributionStatus($distribution, 'invalid_status');
    }

    /**
     * Test remove from distribution
     */
    public function test_remove_from_distribution()
    {
        // Arrange
        $song = Song::factory()->create();

        $distributions = collect([
            Distribution::factory()->create([
                'song_id' => $song->id,
                'platform_code' => 'spotify',
                'status' => DistributionService::STATUS_LIVE,
            ]),
            Distribution::factory()->create([
                'song_id' => $song->id,
                'platform_code' => 'apple_music',
                'status' => DistributionService::STATUS_LIVE,
            ]),
        ]);

        // Act
        $results = $this->distributionService->removeFromDistribution($song, ['spotify']);

        // Assert
        $this->assertCount(1, $results);
        $this->assertEquals('spotify', $results[0]['platform']);
        $this->assertEquals('removal_queued', $results[0]['status']);

        // Verify removal job was queued
        Queue::assertPushed(\App\Jobs\RemoveFromDistribution::class, 1);

        // Verify only Spotify distribution was updated
        $distributions[0]->refresh();
        $this->assertEquals(DistributionService::STATUS_PENDING, $distributions[0]->status);
        $this->assertNotNull($distributions[0]->removal_requested_at);

        $distributions[1]->refresh();
        $this->assertEquals(DistributionService::STATUS_LIVE, $distributions[1]->status);
    }

    /**
     * Test get distribution analytics
     */
    public function test_get_distribution_analytics()
    {
        // Arrange
        $song = Song::factory()->create();

        Distribution::factory()->create([
            'song_id' => $song->id,
            'platform_code' => 'spotify',
            'status' => DistributionService::STATUS_LIVE,
            'platform_metadata' => ['streams' => 1000, 'revenue' => 100.50],
            'total_streams' => 1000,
            'total_revenue' => 100.50,
        ]);

        Distribution::factory()->create([
            'song_id' => $song->id,
            'platform_code' => 'apple_music',
            'status' => DistributionService::STATUS_LIVE,
            'platform_metadata' => ['streams' => 500, 'revenue' => 75.25],
            'total_streams' => 500,
            'total_revenue' => 75.25,
        ]);

        Distribution::factory()->create([
            'song_id' => $song->id,
            'platform_code' => 'youtube_music',
            'status' => DistributionService::STATUS_FAILED,
            'total_streams' => 0,
            'total_revenue' => 0,
        ]);

        // Act
        $analytics = $this->distributionService->getDistributionAnalytics($song, 30);

        // Assert
        $this->assertEquals(3, $analytics['total_platforms']);
        $this->assertEquals(2, $analytics['live_platforms']);
        $this->assertEquals(0, $analytics['pending_platforms']);
        $this->assertEquals(1, $analytics['failed_platforms']);
        $this->assertEquals(1500, $analytics['total_streams']); // 1000 + 500
        $this->assertEquals(175.75, $analytics['total_revenue']); // 100.50 + 75.25
        $this->assertArrayHasKey('platform_breakdown', $analytics);
    }

    /**
     * Test get artist distributions
     */
    public function test_get_artist_distributions()
    {
        // Arrange
        $artist = ArtistProfile::factory()->create();
        $otherArtist = ArtistProfile::factory()->create();

        $song1 = Song::factory()->create(['artist_id' => $artist->id]);
        $song2 = Song::factory()->create(['artist_id' => $artist->id]);
        $song3 = Song::factory()->create(['artist_id' => $otherArtist->id]);

        Distribution::factory()->count(2)->create(['artist_id' => $artist->id]);
        Distribution::factory()->create(['artist_id' => $otherArtist->id]);

        // Act
        $distributions = $this->distributionService->getArtistDistributions($artist);

        // Assert
        $this->assertInstanceOf(Collection::class, $distributions);
        $this->assertEquals(2, $distributions->count());
        $this->assertTrue($distributions->every(fn($d) => $d->artist_id === $artist->id));
    }

    /**
     * Test royalty calculation
     */
    public function test_calculate_royalties()
    {
        // Arrange
        $distribution = Distribution::factory()->create([
            'platform_code' => 'spotify',
        ]);

        $grossRevenue = 1000.00;

        // Act
        $royalties = $this->distributionService->calculateRoyalties($distribution, $grossRevenue);

        // Assert
        $this->assertEquals(1000.00, $royalties['gross_revenue']);
        $this->assertEquals(70.0, $royalties['platform_rate']); // Spotify rate
        $this->assertEquals(10.0, $royalties['service_rate']); // Default service rate

        $expectedPlatformFee = 1000.00 * 0.70; // 700.00
        $expectedServiceFee = (1000.00 - $expectedPlatformFee) * 0.10; // 30.00
        $expectedArtistEarnings = 1000.00 - $expectedPlatformFee - $expectedServiceFee; // 270.00

        $this->assertEquals($expectedPlatformFee, $royalties['platform_fee']);
        $this->assertEquals($expectedServiceFee, $royalties['service_fee']);
        $this->assertEquals($expectedArtistEarnings, $royalties['artist_earnings']);
    }

    /**
     * Test royalty calculation for different platforms
     */
    public function test_calculate_royalties_different_platforms()
    {
        // Test Apple Music (71% platform rate)
        $appleDistribution = Distribution::factory()->create(['platform_code' => 'apple_music']);
        $royalties = $this->distributionService->calculateRoyalties($appleDistribution, 1000.00);
        $this->assertEquals(71.0, $royalties['platform_rate']);

        // Test Bandcamp (85% platform rate)
        $bandcampDistribution = Distribution::factory()->create(['platform_code' => 'bandcamp']);
        $royalties = $this->distributionService->calculateRoyalties($bandcampDistribution, 1000.00);
        $this->assertEquals(85.0, $royalties['platform_rate']);

        // Test unknown platform (default 65% rate)
        $unknownDistribution = Distribution::factory()->create(['platform_code' => 'unknown_platform']);
        $royalties = $this->distributionService->calculateRoyalties($unknownDistribution, 1000.00);
        $this->assertEquals(65.0, $royalties['platform_rate']);
    }

    /**
     * Test generate distribution report
     */
    public function test_generate_distribution_report()
    {
        // Arrange
        $artist = ArtistProfile::factory()->create(['stage_name' => 'Test Artist']);
        $startDate = '2024-01-01';
        $endDate = '2024-01-31';

        $song1 = Song::factory()->create(['artist_id' => $artist->id]);
        $song2 = Song::factory()->create(['artist_id' => $artist->id]);

        Distribution::factory()->create([
            'artist_id' => $artist->id,
            'song_id' => $song1->id,
            'platform_code' => 'spotify',
            'status' => DistributionService::STATUS_LIVE,
            'created_at' => '2024-01-15',
        ]);

        Distribution::factory()->create([
            'artist_id' => $artist->id,
            'song_id' => $song2->id,
            'platform_code' => 'apple_music',
            'status' => DistributionService::STATUS_LIVE,
            'created_at' => '2024-01-20',
        ]);

        // Act
        $report = $this->distributionService->generateDistributionReport($artist, $startDate, $endDate);

        // Assert
        $this->assertEquals($startDate, $report['period']['start']);
        $this->assertEquals($endDate, $report['period']['end']);
        $this->assertEquals('Test Artist', $report['artist']['stage_name']);
        $this->assertEquals(2, $report['summary']['total_songs_distributed']);
        $this->assertEquals(2, $report['summary']['total_platforms']);
        $this->assertEquals(2, $report['summary']['active_distributions']);
        $this->assertArrayHasKey('platform_breakdown', $report);
        $this->assertArrayHasKey('song_performance', $report);
    }

    /**
     * Test sync distribution data
     */
    public function test_sync_distribution_data()
    {
        $this->markTestSkipped('Platform services not yet implemented - requires actual Spotify/AppleMusic API integration');
        
        // Arrange
        $distribution = Distribution::factory()->create([
            'platform_code' => 'spotify',
            'platform_metadata' => ['old_data' => 'value'],
        ]);

        // Mock platform service
        $platformServiceMock = Mockery::mock();
        $platformServiceMock->shouldReceive('syncData')
            ->once()
            ->with($distribution)
            ->andReturn([
                'metadata' => ['streams' => 5000, 'revenue' => 250.75],
                'revenue_data' => [
                    'period' => '2024-01',
                    'streams' => 5000,
                    'revenue' => 250.75,
                    'currency' => 'USD',
                ],
            ]);

        $this->app->instance("App\\Services\\Distribution\\spotifyService", $platformServiceMock);

        // Act
        $result = $this->distributionService->syncDistributionData($distribution);

        // Assert
        $this->assertTrue($result['success']);
        $this->assertEquals('Distribution data synced successfully', $result['message']);

        $distribution->refresh();
        $this->assertArrayHasKey('streams', $distribution->platform_metadata);
        $this->assertEquals(5000, $distribution->platform_metadata['streams']);
        $this->assertNotNull($distribution->last_synced);
    }

    /**
     * Test sync distribution data failure
     */
    public function test_sync_distribution_data_failure()
    {
        $this->markTestSkipped('Platform services not yet implemented - requires actual Spotify/AppleMusic API integration');
        
        // Arrange
        $distribution = Distribution::factory()->create(['platform_code' => 'spotify']);

        // Mock platform service to throw exception
        $platformServiceMock = Mockery::mock();
        $platformServiceMock->shouldReceive('syncData')
            ->once()
            ->andThrow(new Exception('API connection failed'));

        $this->app->instance("App\\Services\\Distribution\\spotifyService", $platformServiceMock);

        // Act
        $result = $this->distributionService->syncDistributionData($distribution);

        // Assert
        $this->assertFalse($result['success']);
        $this->assertEquals('Failed to sync distribution data', $result['message']);
        $this->assertEquals('API connection failed', $result['error']);
    }

    /**
     * Test platform service loading
     */
    public function test_get_platform_service_not_found()
    {
        // Arrange
        $distribution = Distribution::factory()->create(['platform_code' => 'nonexistent_platform']);

        // Act & Assert
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Platform service not found: nonexistent_platform');

        // Use reflection to access protected method
        $reflection = new \ReflectionClass($this->distributionService);
        $method = $reflection->getMethod('getPlatformService');
        $method->setAccessible(true);
        $method->invoke($this->distributionService, 'nonexistent_platform');
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}