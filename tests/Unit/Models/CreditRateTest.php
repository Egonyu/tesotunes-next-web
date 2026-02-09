<?php

namespace Tests\Unit\Models;

use App\Models\CreditRate;
use App\Models\CreditTransaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CreditRateTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_has_correct_fillable_attributes()
    {
        $fillable = [
            'activity_type',
            'base_rate',
            'max_daily',
            'cooldown_minutes',
            'is_active',
            'conditions',
        ];

        $rate = new CreditRate();
        $this->assertEquals($fillable, $rate->getFillable());
    }

    /** @test */
    public function it_casts_attributes_correctly()
    {
        $rate = CreditRate::create([
            'activity_type' => 'test_activity',
            'base_rate' => '10.50',
            'max_daily' => '100.00',
            'is_active' => 1,
            'conditions' => ['test' => 'value'],
        ]);

        // In Laravel, decimal is cast to string in SQLite and float in MySQL
        // We just check it's numeric and matches expected value
        $this->assertIsNumeric($rate->base_rate);
        $this->assertEquals(10.50, (float)$rate->base_rate);
        $this->assertIsNumeric($rate->max_daily);
        $this->assertEquals(100.00, (float)$rate->max_daily);
        $this->assertIsBool($rate->is_active);
        $this->assertIsArray($rate->conditions);
    }

    /** @test */
    public function active_scope_filters_active_rates()
    {
        CreditRate::create([
            'activity_type' => 'active_rate',
            'base_rate' => 5,
            'is_active' => true,
        ]);

        CreditRate::create([
            'activity_type' => 'inactive_rate',
            'base_rate' => 5,
            'is_active' => false,
        ]);

        $activeRates = CreditRate::active()->get();
        $this->assertCount(1, $activeRates);
        $this->assertEquals('active_rate', $activeRates->first()->activity_type);
    }

    /** @test */
    public function by_activity_scope_filters_by_activity_type()
    {
        CreditRate::create([
            'activity_type' => 'song_play',
            'base_rate' => 0.5,
        ]);

        CreditRate::create([
            'activity_type' => 'daily_login',
            'base_rate' => 5,
        ]);

        $songPlayRates = CreditRate::byActivity('song_play')->get();
        $this->assertCount(1, $songPlayRates);
        $this->assertEquals('song_play', $songPlayRates->first()->activity_type);
    }

    /** @test */
    public function update_rate_method_updates_base_rate()
    {
        $rate = CreditRate::create([
            'activity_type' => 'test_activity',
            'base_rate' => 5,
        ]);

        $this->assertEquals(5, $rate->base_rate);

        $rate->updateRate(10);

        $this->assertEquals(10, $rate->fresh()->base_rate);
    }

    /** @test */
    public function activate_method_sets_is_active_to_true()
    {
        $rate = CreditRate::create([
            'activity_type' => 'test_activity',
            'base_rate' => 5,
            'is_active' => false,
        ]);

        $this->assertFalse($rate->is_active);

        $rate->activate();

        $this->assertTrue($rate->fresh()->is_active);
    }

    /** @test */
    public function deactivate_method_sets_is_active_to_false()
    {
        $rate = CreditRate::create([
            'activity_type' => 'test_activity',
            'base_rate' => 5,
            'is_active' => true,
        ]);

        $this->assertTrue($rate->is_active);

        $rate->deactivate();

        $this->assertFalse($rate->fresh()->is_active);
    }

    /** @test */
    public function it_can_store_complex_conditions()
    {
        $rate = CreditRate::create([
            'activity_type' => 'complex_activity',
            'base_rate' => 10,
            'conditions' => [
                'minimum_duration' => 30,
                'completion_percentage' => 80,
                'actions' => ['like', 'comment', 'share'],
                'platform' => ['spotify', 'apple_music'],
            ],
        ]);

        $conditions = $rate->fresh()->conditions;
        $this->assertEquals(30, $conditions['minimum_duration']);
        $this->assertEquals(80, $conditions['completion_percentage']);
        $this->assertContains('like', $conditions['actions']);
        $this->assertCount(2, $conditions['platform']);
    }
}
