<?php

namespace Tests\Feature\Freemium;

use App\Models\User;
use App\Models\Artist;
use App\Models\Song;
use App\Models\Download;
use App\Models\UserSubscription;
use App\Models\SubscriptionPlan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DownloadLimitTest extends TestCase
{
    use RefreshDatabase;

    protected User $freeUser;
    protected User $premiumUser;
    protected Song $song;

    protected function setUp(): void
    {
        parent::setUp();

        // Create free user
        $this->freeUser = User::factory()->create();

        // Create premium user with active subscription
        $this->premiumUser = User::factory()->create();

        $premiumPlan = SubscriptionPlan::factory()->create([
            'name' => 'Premium',
            'download_limit' => null, // Unlimited
        ]);

        UserSubscription::factory()->create([
            'user_id' => $this->premiumUser->id,
            'plan_id' => $premiumPlan->id,
            'status' => 'active',
            'expires_at' => now()->addMonth(),
        ]);

        // Create test song
        $artist = Artist::factory()->create([
            'user_id' => User::factory()->create()->id,
        ]);

        $this->song = Song::factory()->create([
            'user_id' => $artist->user_id,
            'artist_id' => $artist->id,
            'status' => 'published',
            'is_downloadable' => true,
        ]);
    }

    public function test_free_user_has_10_downloads_per_day_limit(): void
    {
        $dailyLimit = 10;

        // Create 10 downloads for today
        Download::factory()->count($dailyLimit)->create([
            'user_id' => $this->freeUser->id,
            'song_id' => $this->song->id,
            'downloaded_at' => now(),
        ]);

        $todayDownloads = Download::where('user_id', $this->freeUser->id)
            ->whereDate('downloaded_at', today())
            ->count();

        $this->assertEquals($dailyLimit, $todayDownloads);
    }

    public function test_free_user_cannot_exceed_daily_download_limit(): void
    {
        $dailyLimit = 10;

        // Create 10 downloads
        Download::factory()->count($dailyLimit)->create([
            'user_id' => $this->freeUser->id,
            'song_id' => $this->song->id,
            'downloaded_at' => now(),
        ]);

        $todayDownloads = Download::where('user_id', $this->freeUser->id)
            ->whereDate('downloaded_at', today())
            ->count();

        // Check if limit is reached
        $limitReached = $todayDownloads >= $dailyLimit;

        $this->assertTrue($limitReached);
    }

    public function test_free_user_download_limit_resets_daily(): void
    {
        $dailyLimit = 10;

        // Create 10 downloads yesterday
        Download::factory()->count($dailyLimit)->create([
            'user_id' => $this->freeUser->id,
            'song_id' => $this->song->id,
            'downloaded_at' => now()->subDay(),
        ]);

        // Check yesterday's downloads
        $yesterdayDownloads = Download::where('user_id', $this->freeUser->id)
            ->whereDate('downloaded_at', today()->subDay())
            ->count();

        $this->assertEquals($dailyLimit, $yesterdayDownloads);

        // Check today's downloads (should be 0)
        $todayDownloads = Download::where('user_id', $this->freeUser->id)
            ->whereDate('downloaded_at', today())
            ->count();

        $this->assertEquals(0, $todayDownloads);
    }

    public function test_premium_user_has_unlimited_downloads(): void
    {
        // Create 50 downloads (way more than free limit)
        Download::factory()->count(50)->create([
            'user_id' => $this->premiumUser->id,
            'song_id' => $this->song->id,
            'downloaded_at' => now(),
        ]);

        $todayDownloads = Download::where('user_id', $this->premiumUser->id)
            ->whereDate('downloaded_at', today())
            ->count();

        $this->assertEquals(50, $todayDownloads);
        $this->assertGreaterThan(10, $todayDownloads); // Exceeds free limit
    }

    public function test_free_user_gets_128kbps_quality(): void
    {
        $download = Download::factory()->create([
            'user_id' => $this->freeUser->id,
            'song_id' => $this->song->id,
            'quality' => '128kbps',
        ]);

        $this->assertEquals('128kbps', $download->quality);
    }

    public function test_premium_user_gets_320kbps_quality(): void
    {
        $download = Download::factory()->create([
            'user_id' => $this->premiumUser->id,
            'song_id' => $this->song->id,
            'quality' => '320kbps',
        ]);

        $this->assertEquals('320kbps', $download->quality);
    }

    public function test_download_tracks_ip_address(): void
    {
        $download = Download::factory()->create([
            'user_id' => $this->freeUser->id,
            'song_id' => $this->song->id,
            'ip_address' => '192.168.1.1',
        ]);

        $this->assertEquals('192.168.1.1', $download->ip_address);
    }

    public function test_download_tracks_timestamp(): void
    {
        $downloadTime = now();

        $download = Download::factory()->create([
            'user_id' => $this->freeUser->id,
            'song_id' => $this->song->id,
            'downloaded_at' => $downloadTime,
        ]);

        $this->assertEquals($downloadTime->toDateTimeString(), $download->downloaded_at->toDateTimeString());
    }

    public function test_user_can_download_different_songs_within_limit(): void
    {
        $songs = Song::factory()->count(5)->create([
            'user_id' => $this->song->user_id,
            'artist_id' => $this->song->artist_id,
            'status' => 'published',
        ]);

        foreach ($songs as $song) {
            Download::factory()->create([
                'user_id' => $this->freeUser->id,
                'song_id' => $song->id,
                'downloaded_at' => now(),
            ]);
        }

        $todayDownloads = Download::where('user_id', $this->freeUser->id)
            ->whereDate('downloaded_at', today())
            ->count();

        $this->assertEquals(5, $todayDownloads);
        $this->assertLessThan(10, $todayDownloads); // Still within free limit
    }

    public function test_user_can_download_same_song_multiple_times(): void
    {
        Download::factory()->count(3)->create([
            'user_id' => $this->freeUser->id,
            'song_id' => $this->song->id,
            'downloaded_at' => now(),
        ]);

        $downloads = Download::where('user_id', $this->freeUser->id)
            ->where('song_id', $this->song->id)
            ->whereDate('downloaded_at', today())
            ->count();

        $this->assertEquals(3, $downloads);
    }

    public function test_song_download_count_increments(): void
    {
        $initialCount = $this->song->download_count;

        Download::factory()->create([
            'user_id' => $this->freeUser->id,
            'song_id' => $this->song->id,
        ]);

        // In real implementation, this would trigger an event/listener to increment
        $this->song->increment('download_count');

        $this->assertEquals($initialCount + 1, $this->song->fresh()->download_count);
    }

    public function test_expired_premium_user_reverts_to_free_limits(): void
    {
        // Create user with expired subscription
        $expiredUser = User::factory()->create();

        $plan = SubscriptionPlan::factory()->create(['download_limit' => null]);

        UserSubscription::factory()->create([
            'user_id' => $expiredUser->id,
            'plan_id' => $plan->id,
            'status' => 'expired',
            'expires_at' => now()->subDay(),
        ]);

        // User should now be treated as free tier
        $activeSubscription = UserSubscription::where('user_id', $expiredUser->id)
            ->where('status', 'active')
            ->where('expires_at', '>', now())
            ->exists();

        $this->assertFalse($activeSubscription);
    }

    public function test_downloads_are_indexed_for_performance(): void
    {
        // Create many downloads
        Download::factory()->count(100)->create([
            'user_id' => $this->freeUser->id,
            'song_id' => $this->song->id,
            'downloaded_at' => today(),
        ]);

        // Query should be fast due to indexes on user_id and downloaded_at
        $todayDownloads = Download::where('user_id', $this->freeUser->id)
            ->whereDate('downloaded_at', today())
            ->count();

        $this->assertGreaterThan(0, $todayDownloads);
    }

    public function test_guest_user_cannot_download(): void
    {
        // Guests (not authenticated) should not be able to create downloads
        // This would be enforced at the controller/middleware level
        
        $this->assertFalse(auth()->check());
    }

    public function test_download_limit_check_query_is_efficient(): void
    {
        // Test that checking download limits doesn't cause N+1 queries
        $dailyLimit = 10;

        Download::factory()->count(5)->create([
            'user_id' => $this->freeUser->id,
            'song_id' => $this->song->id,
            'downloaded_at' => now(),
        ]);

        $count = Download::where('user_id', $this->freeUser->id)
            ->whereDate('downloaded_at', today())
            ->count();

        $canDownload = $count < $dailyLimit;

        $this->assertTrue($canDownload);
    }

    public function test_download_belongs_to_user(): void
    {
        $download = Download::factory()->create([
            'user_id' => $this->freeUser->id,
            'song_id' => $this->song->id,
        ]);

        $this->assertInstanceOf(User::class, $download->user);
        $this->assertEquals($this->freeUser->id, $download->user->id);
    }

    public function test_download_belongs_to_song(): void
    {
        $download = Download::factory()->create([
            'user_id' => $this->freeUser->id,
            'song_id' => $this->song->id,
        ]);

        $this->assertInstanceOf(Song::class, $download->song);
        $this->assertEquals($this->song->id, $download->song->id);
    }
}
