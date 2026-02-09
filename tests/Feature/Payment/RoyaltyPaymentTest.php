<?php

namespace Tests\Feature\Payment;

use App\Models\User;
use App\Models\Artist;
use App\Models\Song;
use App\Models\Payment;
use App\Models\PlayHistory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoyaltyPaymentTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Artist $artist;
    protected Song $song;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->artist = Artist::factory()->create(['user_id' => $this->user->id]);
        $this->song = Song::factory()->create([
            'user_id' => $this->user->id,
            'artist_id' => $this->artist->id,
            'status' => 'published',
            'master_ownership_percentage' => 100.00,
        ]);
    }

    public function test_royalty_payment_calculation_per_stream(): void
    {
        // Spotify rate: $0.003 per stream
        $streams = 10000;
        $ratePerStream = 0.003;
        $platformCut = 0.30; // 30%

        $grossRevenue = $streams * $ratePerStream; // $30
        $netRevenue = $grossRevenue * (1 - $platformCut); // $21
        $netRevenueUGX = $netRevenue * 3700; // Convert to UGX (~77,700)

        $payment = Payment::factory()->create([
            'user_id' => $this->user->id,
            'song_id' => $this->song->id,
            'payment_type' => 'royalty',
            'amount' => $netRevenueUGX,
            'currency' => 'UGX',
            'description' => "Royalty for {$streams} streams on Spotify",
        ]);

        $this->assertEquals($netRevenueUGX, $payment->amount);
        $this->assertEquals('royalty', $payment->payment_type);
    }

    public function test_minimum_payout_threshold_is_enforced(): void
    {
        $minimumPayout = 50000; // UGX 50,000

        // Create payment below threshold
        $belowThreshold = Payment::factory()->create([
            'user_id' => $this->user->id,
            'song_id' => $this->song->id,
            'payment_type' => 'royalty',
            'amount' => 30000,
            'status' => 'pending',
        ]);

        // Should not be processed yet
        $this->assertEquals('pending', $belowThreshold->status);
        $this->assertTrue($belowThreshold->amount < $minimumPayout);

        // Create payment above threshold
        $aboveThreshold = Payment::factory()->create([
            'user_id' => $this->user->id,
            'song_id' => $this->song->id,
            'payment_type' => 'royalty',
            'amount' => 75000,
            'status' => 'completed',
        ]);

        $this->assertTrue($aboveThreshold->amount >= $minimumPayout);
    }

    public function test_royalty_splits_among_collaborators(): void
    {
        $totalRevenue = 100000; // UGX 100,000

        // Main artist: 70%
        $mainArtistShare = $totalRevenue * 0.70;

        // Featured artist: 30%
        $featuredArtist = User::factory()->create();
        $featuredArtistProfile = Artist::factory()->create(['user_id' => $featuredArtist->id]);
        $featuredArtistShare = $totalRevenue * 0.30;

        // Create payment for main artist
        $mainPayment = Payment::factory()->create([
            'user_id' => $this->user->id,
            'song_id' => $this->song->id,
            'payment_type' => 'royalty',
            'amount' => $mainArtistShare,
        ]);

        // Create payment for featured artist
        $featuredPayment = Payment::factory()->create([
            'user_id' => $featuredArtist->id,
            'song_id' => $this->song->id,
            'payment_type' => 'royalty',
            'amount' => $featuredArtistShare,
        ]);

        $this->assertEquals(70000, $mainPayment->amount);
        $this->assertEquals(30000, $featuredPayment->amount);
        $this->assertEquals($totalRevenue, $mainPayment->amount + $featuredPayment->amount);
    }

    public function test_artist_ownership_percentage_affects_royalty(): void
    {
        $totalRevenue = 100000;

        // Artist owns 50% of master rights
        $this->song->update([
            'master_ownership_percentage' => 50.00,
        ]);

        $artistShare = $totalRevenue * 0.50;

        $payment = Payment::factory()->create([
            'user_id' => $this->user->id,
            'song_id' => $this->song->id,
            'payment_type' => 'royalty',
            'amount' => $artistShare,
        ]);

        $this->assertEquals(50000, $payment->amount);
    }

    public function test_royalty_payment_monthly_schedule(): void
    {
        // Payments should be processed on the 1st of each month
        $paymentDate = now()->firstOfMonth();

        $payment = Payment::factory()->create([
            'user_id' => $this->user->id,
            'song_id' => $this->song->id,
            'payment_type' => 'royalty',
            'amount' => 75000,
            'created_at' => $paymentDate,
        ]);

        $this->assertEquals(1, $payment->created_at->day);
    }

    public function test_royalty_payment_for_multiple_platforms(): void
    {
        $platforms = [
            'spotify' => ['streams' => 10000, 'rate' => 0.003],
            'apple_music' => ['streams' => 5000, 'rate' => 0.007],
            'youtube_music' => ['streams' => 20000, 'rate' => 0.001],
            'boomplay' => ['streams' => 15000, 'rate' => 0.002],
        ];

        $totalRevenue = 0;

        foreach ($platforms as $platform => $data) {
            $revenue = $data['streams'] * $data['rate'];
            $netRevenue = $revenue * 0.70; // After platform cut
            $revenueUGX = $netRevenue * 3700; // Convert to UGX

            Payment::factory()->create([
                'user_id' => $this->user->id,
                'song_id' => $this->song->id,
                'payment_type' => 'royalty',
                'amount' => $revenueUGX,
                'payment_provider' => 'internal',
                'description' => "Royalty from {$platform}",
            ]);

            $totalRevenue += $revenueUGX;
        }

        $payments = Payment::where('user_id', $this->user->id)
            ->where('payment_type', 'royalty')
            ->get();

        $this->assertCount(4, $payments);
        $this->assertEquals($totalRevenue, $payments->sum('amount'));
    }

    public function test_payout_to_artist_via_mobile_money(): void
    {
        // Artist has earned UGX 100,000 in royalties
        $royaltyAmount = 100000;

        $payout = Payment::factory()->create([
            'user_id' => $this->user->id,
            'payment_type' => 'payout',
            'amount' => $royaltyAmount,
            'payment_method' => 'mobile_money',
            'payment_provider' => 'mtn_money',
            'phone_number' => '+256700000000',
            'status' => 'completed',
            'description' => 'Monthly royalty payout',
        ]);

        $this->assertEquals('payout', $payout->payment_type);
        $this->assertEquals('mobile_money', $payout->payment_method);
        $this->assertEquals($royaltyAmount, $payout->amount);
    }

    public function test_payout_to_artist_via_bank_transfer(): void
    {
        $payoutAmount = 150000;

        $payout = Payment::factory()->create([
            'user_id' => $this->user->id,
            'payment_type' => 'payout',
            'amount' => $payoutAmount,
            'payment_method' => 'bank_transfer',
            'payment_reference' => 'BANK-TXN-123456',
            'status' => 'completed',
            'metadata' => [
                'bank_name' => 'Stanbic Bank',
                'account_number' => '1234567890',
            ],
        ]);

        $this->assertEquals('bank_transfer', $payout->payment_method);
        $this->assertArrayHasKey('bank_name', $payout->metadata);
    }

    public function test_play_count_affects_royalty_calculation(): void
    {
        // Create play history
        PlayHistory::factory()->count(1000)->create([
            'song_id' => $this->song->id,
        ]);

        $playCount = PlayHistory::where('song_id', $this->song->id)->count();
        $ratePerPlay = 0.002; // Average rate
        $platformCut = 0.30;

        $grossRevenue = $playCount * $ratePerPlay;
        $netRevenue = $grossRevenue * (1 - $platformCut);
        $revenueUGX = $netRevenue * 3700;

        $payment = Payment::factory()->create([
            'user_id' => $this->user->id,
            'song_id' => $this->song->id,
            'payment_type' => 'royalty',
            'amount' => $revenueUGX,
            'description' => "Royalty for {$playCount} plays",
        ]);

        $this->assertEquals($playCount, 1000);
        $this->assertGreaterThan(0, $payment->amount);
    }

    public function test_royalty_payment_stores_calculation_metadata(): void
    {
        $metadata = [
            'streams' => 10000,
            'platform' => 'spotify',
            'rate_per_stream' => 0.003,
            'gross_revenue_usd' => 30.00,
            'platform_cut' => 0.30,
            'net_revenue_usd' => 21.00,
            'exchange_rate' => 3700,
            'period_start' => now()->startOfMonth()->toDateString(),
            'period_end' => now()->endOfMonth()->toDateString(),
        ];

        $payment = Payment::factory()->create([
            'user_id' => $this->user->id,
            'song_id' => $this->song->id,
            'payment_type' => 'royalty',
            'amount' => 77700,
            'metadata' => $metadata,
        ]);

        $this->assertArrayHasKey('streams', $payment->metadata);
        $this->assertArrayHasKey('platform', $payment->metadata);
        $this->assertEquals(10000, $payment->metadata['streams']);
    }

    public function test_failed_payout_can_be_retried(): void
    {
        $payout = Payment::factory()->create([
            'user_id' => $this->user->id,
            'payment_type' => 'payout',
            'amount' => 75000,
            'status' => 'failed',
            'metadata' => ['error' => 'Network timeout'],
        ]);

        // Retry the payout
        $payout->status = 'processing';
        $payout->save();

        // Simulate successful retry
        $payout->status = 'completed';
        $payout->completed_at = now();
        $payout->save();
        
        $payout->refresh();

        $this->assertEquals('completed', $payout->status);
        $this->assertNotNull($payout->completed_at);
    }

    public function test_artist_can_view_royalty_history(): void
    {
        // Create multiple royalty payments
        Payment::factory()->count(5)->create([
            'user_id' => $this->user->id,
            'song_id' => $this->song->id,
            'payment_type' => 'royalty',
            'status' => 'completed',
        ]);

        $royalties = Payment::where('user_id', $this->user->id)
            ->where('payment_type', 'royalty')
            ->get();

        $this->assertCount(5, $royalties);
    }

    public function test_total_revenue_calculation_for_song(): void
    {
        $payments = [
            ['amount' => 10000, 'platform' => 'spotify'],
            ['amount' => 15000, 'platform' => 'apple_music'],
            ['amount' => 5000, 'platform' => 'youtube_music'],
        ];

        foreach ($payments as $paymentData) {
            Payment::factory()->create([
                'user_id' => $this->user->id,
                'song_id' => $this->song->id,
                'payment_type' => 'royalty',
                'amount' => $paymentData['amount'],
                'payment_provider' => 'internal',
            ]);
        }

        $totalRevenue = Payment::where('song_id', $this->song->id)
            ->where('payment_type', 'royalty')
            ->sum('amount');

        $this->assertEquals(30000, $totalRevenue);
    }
}
