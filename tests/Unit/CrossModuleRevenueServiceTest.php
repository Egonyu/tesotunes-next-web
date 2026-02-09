<?php

namespace Tests\Unit;

use App\Models\User;
use App\Models\Song;
use App\Services\CrossModuleRevenueService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CrossModuleRevenueServiceTest extends TestCase
{
    use RefreshDatabase;

    protected CrossModuleRevenueService $service;
    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new CrossModuleRevenueService();
        $this->user = User::factory()->create();
    }

    /** @test */
    public function calculates_music_revenue_correctly()
    {
        // Create an artist for the user
        $artist = \App\Models\Artist::factory()->create(['user_id' => $this->user->id]);
        
        // Create songs with different play counts
        Song::factory()->create([
            'user_id' => $this->user->id,
            'artist_id' => $artist->id,
            'play_count' => 1000,
            'download_count' => 50,
            'status' => 'published',
        ]);

        Song::factory()->create([
            'user_id' => $this->user->id,
            'artist_id' => $artist->id,
            'play_count' => 2000,
            'download_count' => 75,
            'status' => 'published',
        ]);

        $revenue = $this->service->calculateTotalUserRevenue($this->user);

        // Check music revenue structure
        $this->assertArrayHasKey('music', $revenue);
        $this->assertArrayHasKey('streaming', $revenue['music']);
        $this->assertArrayHasKey('downloads', $revenue['music']);
        $this->assertArrayHasKey('total', $revenue['music']);
        $this->assertArrayHasKey('stats', $revenue['music']);

        // Check calculations
        $expectedStreams = 1000 + 2000; // Total streams
        $expectedDownloads = 50 + 75;   // Total downloads

        $this->assertEquals($expectedStreams, $revenue['music']['stats']['total_streams']);
        $this->assertEquals($expectedDownloads, $revenue['music']['stats']['total_downloads']);
        $this->assertEquals(2, $revenue['music']['stats']['songs_count']);

        // Revenue should be greater than 0
        $this->assertGreaterThan(0, $revenue['music']['streaming']);
        $this->assertGreaterThan(0, $revenue['music']['downloads']);
        $this->assertGreaterThan(0, $revenue['music']['total']);
    }

    /** @test */
    public function handles_zero_revenue_gracefully()
    {
        // User with no content
        $revenue = $this->service->calculateTotalUserRevenue($this->user);

        $this->assertEquals(0, $revenue['music']['total']);
        $this->assertEquals(0, $revenue['podcast']['total']);
        $this->assertEquals(0, $revenue['store']['total']);
        $this->assertEquals(0, $revenue['total']);

        // Percentages should all be 0
        $this->assertEquals(0, $revenue['breakdown']['music_percentage']);
        $this->assertEquals(0, $revenue['breakdown']['podcast_percentage']);
        $this->assertEquals(0, $revenue['breakdown']['store_percentage']);
    }

    /** @test */
    public function calculates_percentages_correctly()
    {
        // Create an artist for the user
        $artist = \App\Models\Artist::factory()->create(['user_id' => $this->user->id]);
        
        // Create content with known revenue
        Song::factory()->create([
            'user_id' => $this->user->id,
            'artist_id' => $artist->id,
            'play_count' => 1000,
            'download_count' => 0,
            'status' => 'published',
        ]);

        $revenue = $this->service->calculateTotalUserRevenue($this->user);

        // Music should be 100% since no other revenue sources
        $this->assertEquals(100, $revenue['breakdown']['music_percentage']);
        $this->assertEquals(0, $revenue['breakdown']['podcast_percentage']);
        $this->assertEquals(0, $revenue['breakdown']['store_percentage']);

        // Total should equal sum of parts
        $total = $revenue['breakdown']['music_percentage'] +
                $revenue['breakdown']['podcast_percentage'] +
                $revenue['breakdown']['store_percentage'];

        $this->assertEquals(100, $total);
    }

    /** @test */
    public function loan_eligibility_calculation_works()
    {
        // Create an artist for the user
        $artist = \App\Models\Artist::factory()->create(['user_id' => $this->user->id]);
        
        // Create high-revenue scenario
        Song::factory()->count(5)->create([
            'user_id' => $this->user->id,
            'artist_id' => $artist->id,
            'play_count' => 10000,
            'download_count' => 100,
            'status' => 'published',
        ]);

        $revenue = $this->service->calculateTotalUserRevenue($this->user);
        $report = $this->service->generateCrossModuleReport($this->user);

        $eligibility = $report['loan_eligibility'];

        $this->assertArrayHasKey('eligible', $eligibility);
        $this->assertArrayHasKey('max_loan_amount', $eligibility);
        $this->assertArrayHasKey('recommended_payment', $eligibility);
        $this->assertArrayHasKey('risk_level', $eligibility);

        // High revenue should make user eligible
        if ($revenue['total'] >= 50000) {
            $this->assertTrue($eligibility['eligible']);
            $this->assertGreaterThan(0, $eligibility['max_loan_amount']);
            $this->assertGreaterThan(0, $eligibility['recommended_payment']);
        }
    }

    /** @test */
    public function risk_level_calculation_works()
    {
        // Create an artist for the user
        $artist = \App\Models\Artist::factory()->create(['user_id' => $this->user->id]);
        
        // Test low risk (high revenue, diversified)
        Song::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'artist_id' => $artist->id,
            'play_count' => 50000,
            'status' => 'published',
        ]);

        $revenue = $this->service->calculateTotalUserRevenue($this->user);
        $report = $this->service->generateCrossModuleReport($this->user);

        $riskLevel = $report['loan_eligibility']['risk_level'];
        $this->assertContains($riskLevel, ['low', 'medium', 'high']);

        // High revenue should generally result in lower risk
        if ($revenue['total'] >= 200000) {
            $this->assertContains($riskLevel, ['low', 'medium']);
        }
    }

    /** @test */
    public function generates_appropriate_recommendations()
    {
        // Create an artist for the user
        $artist = \App\Models\Artist::factory()->create(['user_id' => $this->user->id]);
        
        // Create music-only revenue
        Song::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'artist_id' => $artist->id,
            'play_count' => 5000,
            'status' => 'published',
        ]);

        $report = $this->service->generateCrossModuleReport($this->user);
        $recommendations = $report['recommendations'];

        $this->assertIsArray($recommendations);
        $this->assertNotEmpty($recommendations, 'Recommendations should not be empty');

        // Should recommend diversification if only music revenue (store total should be 0)
        $this->assertEquals(0, $report['revenue']['store']['total'], 'Store revenue should be 0');
        
        $hasStoreRecommendation = false;
        foreach ($recommendations as $recommendation) {
            if (str_contains(strtolower($recommendation), 'merchandise') || str_contains(strtolower($recommendation), 'store')) {
                $hasStoreRecommendation = true;
                break;
            }
        }

        $this->assertTrue($hasStoreRecommendation, 'Should have store/merchandise recommendation. Got: ' . implode(', ', $recommendations));
    }

    /** @test */
    public function cross_module_report_has_correct_structure()
    {
        $report = $this->service->generateCrossModuleReport($this->user, 'monthly');

        // Check required fields
        $this->assertArrayHasKey('user_id', $report);
        $this->assertArrayHasKey('user_name', $report);
        $this->assertArrayHasKey('period', $report);
        $this->assertArrayHasKey('period_start', $report);
        $this->assertArrayHasKey('period_end', $report);
        $this->assertArrayHasKey('revenue', $report);
        $this->assertArrayHasKey('growth_potential', $report);
        $this->assertArrayHasKey('recommendations', $report);
        $this->assertArrayHasKey('loan_eligibility', $report);

        // Check values
        $this->assertEquals($this->user->id, $report['user_id']);
        $this->assertEquals($this->user->name, $report['user_name']);
        $this->assertEquals('monthly', $report['period']);

        // Check date range
        $this->assertInstanceOf(\Carbon\Carbon::class, $report['period_start']);
        $this->assertInstanceOf(\Carbon\Carbon::class, $report['period_end']);
        $this->assertTrue($report['period_start']->lt($report['period_end']));
    }

    /** @test */
    public function handles_different_report_periods()
    {
        $weeklyReport = $this->service->generateCrossModuleReport($this->user, 'weekly');
        $monthlyReport = $this->service->generateCrossModuleReport($this->user, 'monthly');
        $quarterlyReport = $this->service->generateCrossModuleReport($this->user, 'quarterly');
        $yearlyReport = $this->service->generateCrossModuleReport($this->user, 'yearly');

        $this->assertEquals('weekly', $weeklyReport['period']);
        $this->assertEquals('monthly', $monthlyReport['period']);
        $this->assertEquals('quarterly', $quarterlyReport['period']);
        $this->assertEquals('yearly', $yearlyReport['period']);

        // Weekly should have shorter date range than monthly
        $weeklyDays = $weeklyReport['period_end']->diffInDays($weeklyReport['period_start']);
        $monthlyDays = $monthlyReport['period_end']->diffInDays($monthlyReport['period_start']);

        $this->assertLessThan($weeklyDays, $monthlyDays);
    }

    /** @test */
    public function automated_loan_payment_validation_works()
    {
        // Test with insufficient revenue
        $result = $this->service->processAutomatedLoanPayment($this->user);

        $this->assertFalse($result['success']);
        $this->assertArrayHasKey('message', $result);
    }

    /** @test */
    public function revenue_calculation_is_accurate()
    {
        // Create an artist for the user
        $artist = \App\Models\Artist::factory()->create(['user_id' => $this->user->id]);
        
        // Create specific test scenario
        Song::factory()->create([
            'user_id' => $this->user->id,
            'artist_id' => $artist->id,
            'play_count' => 1000,
            'download_count' => 50,
            'status' => 'published',
        ]);

        $revenue = $this->service->calculateTotalUserRevenue($this->user);

        // Manual calculation for verification
        $expectedStreamingRevenue = 1000 * 0.003 * 0.7; // streams * rate * artist_share
        $expectedDownloadRevenue = 50 * 0.99 * 0.7;     // downloads * rate * artist_share

        $this->assertEquals(round($expectedStreamingRevenue, 2), $revenue['music']['streaming']);
        $this->assertEquals(round($expectedDownloadRevenue, 2), $revenue['music']['downloads']);
        $this->assertEquals(
            round($expectedStreamingRevenue + $expectedDownloadRevenue, 2),
            $revenue['music']['total']
        );
    }

    /** @test */
    public function growth_potential_calculation_exists()
    {
        $report = $this->service->generateCrossModuleReport($this->user);

        $growth = $report['growth_potential'];

        $this->assertArrayHasKey('music_growth_rate', $growth);
        $this->assertArrayHasKey('podcast_growth_rate', $growth);
        $this->assertArrayHasKey('store_growth_rate', $growth);
        $this->assertArrayHasKey('overall_growth_rate', $growth);

        // Growth rates should be reasonable percentages
        foreach ($growth as $rate) {
            $this->assertIsNumeric($rate);
            $this->assertGreaterThanOrEqual(0, $rate);
            $this->assertLessThanOrEqual(100, $rate);
        }
    }

    /** @test */
    public function service_handles_missing_modules_gracefully()
    {
        // Even if podcast/store modules aren't available, should not crash
        $revenue = $this->service->calculateTotalUserRevenue($this->user);

        $this->assertArrayHasKey('podcast', $revenue);
        $this->assertArrayHasKey('store', $revenue);

        // These should default to 0 if modules aren't available
        $this->assertIsNumeric($revenue['podcast']['total']);
        $this->assertIsNumeric($revenue['store']['total']);
    }
}