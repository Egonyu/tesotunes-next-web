<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserCredit;
use App\Models\CreditRate;
use App\Models\CreditTransaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CreditSystemTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Seed credit rates
        $this->artisan('db:seed', ['--class' => 'CreditRateSeeder']);
    }

    /** @test */
    public function user_can_have_credit_wallet()
    {
        $user = User::factory()->create();
        
        $wallet = UserCredit::create([
            'user_id' => $user->id,
            'available_credits' => 100,
            'earned_credits' => 100,
            'spent_credits' => 0,
            'pending_credits' => 0,
            'last_activity_at' => now(),
        ]);

        $this->assertInstanceOf(UserCredit::class, $wallet);
        $this->assertEquals(100, $wallet->available_credits);
        $this->assertEquals(100, $wallet->earned_credits);
        $this->assertEquals(0, $wallet->spent_credits);
    }

    /** @test */
    public function user_can_earn_credits()
    {
        $user = User::factory()->create();
        $wallet = UserCredit::create([
            'user_id' => $user->id,
            'available_credits' => 0,
            'earned_credits' => 0,
            'spent_credits' => 0,
            'pending_credits' => 0,
        ]);

        $transaction = $wallet->addCredits(
            50,
            'song_play_complete',
            'Listened to a song'
        );

        $this->assertInstanceOf(CreditTransaction::class, $transaction);
        $this->assertEquals(50, $wallet->fresh()->available_credits);
        $this->assertEquals(50, $wallet->fresh()->earned_credits);
        $this->assertEquals('earned', $transaction->type);
        $this->assertEquals(50, $transaction->amount);
    }

    /** @test */
    public function user_can_spend_credits()
    {
        $user = User::factory()->create();
        $wallet = UserCredit::create([
            'user_id' => $user->id,
            'available_credits' => 100,
            'earned_credits' => 100,
            'spent_credits' => 0,
            'pending_credits' => 0,
        ]);

        $transaction = $wallet->spendCredits(
            30,
            'promotion_participation',
            'Joined community promotion'
        );

        $this->assertNotNull($transaction);
        $this->assertEquals(70, $wallet->fresh()->available_credits);
        $this->assertEquals(30, $wallet->fresh()->spent_credits);
        $this->assertEquals('spent', $transaction->type);
        $this->assertEquals(30, $transaction->amount);
    }

    /** @test */
    public function user_cannot_spend_more_than_available_credits()
    {
        $user = User::factory()->create();
        $wallet = UserCredit::create([
            'user_id' => $user->id,
            'available_credits' => 10,
            'earned_credits' => 10,
            'spent_credits' => 0,
            'pending_credits' => 0,
        ]);

        $transaction = $wallet->spendCredits(
            50,
            'promotion_participation',
            'Attempted to join promotion'
        );

        $this->assertNull($transaction);
        $this->assertEquals(10, $wallet->fresh()->available_credits);
        $this->assertEquals(0, $wallet->fresh()->spent_credits);
    }

    /** @test */
    public function user_can_transfer_credits_to_another_user()
    {
        $sender = User::factory()->create();
        $receiver = User::factory()->create();

        $senderWallet = UserCredit::create([
            'user_id' => $sender->id,
            'available_credits' => 100,
            'earned_credits' => 100,
            'spent_credits' => 0,
            'pending_credits' => 0,
        ]);

        $receiverWallet = UserCredit::create([
            'user_id' => $receiver->id,
            'available_credits' => 0,
            'earned_credits' => 0,
            'spent_credits' => 0,
            'pending_credits' => 0,
        ]);

        $result = $senderWallet->transferCredits($receiver, 25, 'Gift transfer');

        $this->assertNotNull($result);
        $this->assertEquals(75, $senderWallet->fresh()->available_credits);
        $this->assertEquals(25, $senderWallet->fresh()->spent_credits);
        $this->assertEquals(25, $receiverWallet->fresh()->available_credits);
        $this->assertEquals(25, $receiverWallet->fresh()->earned_credits);

        // Check transactions
        $this->assertDatabaseHas('credit_transactions', [
            'user_id' => $sender->id,
            'type' => 'transferred',
            'source' => 'transfer_out',
            'related_user_id' => $receiver->id,
        ]);

        $this->assertDatabaseHas('credit_transactions', [
            'user_id' => $receiver->id,
            'type' => 'transferred',
            'source' => 'transfer_in',
            'related_user_id' => $sender->id,
        ]);
    }

    /** @test */
    public function user_cannot_transfer_more_than_available_credits()
    {
        $sender = User::factory()->create();
        $receiver = User::factory()->create();

        $senderWallet = UserCredit::create([
            'user_id' => $sender->id,
            'available_credits' => 10,
            'earned_credits' => 10,
            'spent_credits' => 0,
            'pending_credits' => 0,
        ]);

        $receiverWallet = UserCredit::create([
            'user_id' => $receiver->id,
            'available_credits' => 0,
            'earned_credits' => 0,
            'spent_credits' => 0,
            'pending_credits' => 0,
        ]);

        $result = $senderWallet->transferCredits($receiver, 50);

        $this->assertNull($result);
        $this->assertEquals(10, $senderWallet->fresh()->available_credits);
        $this->assertEquals(0, $receiverWallet->fresh()->available_credits);
    }

    /** @test */
    public function credit_rates_can_be_created()
    {
        $rate = CreditRate::create([
            'activity_type' => 'test_activity',
            'base_rate' => 5.5,
            'max_daily' => 50,
            'cooldown_minutes' => 30,
            'is_active' => true,
        ]);

        $this->assertDatabaseHas('credit_rates', [
            'activity_type' => 'test_activity',
            'base_rate' => 5.5,
            'max_daily' => 50,
            'is_active' => true,
        ]);
    }

    /** @test */
    public function credit_rates_have_correct_structure()
    {
        $rate = CreditRate::where('activity_type', 'song_play_complete')->first();

        $this->assertNotNull($rate);
        $this->assertEquals('song_play_complete', $rate->activity_type);
        $this->assertIsNumeric($rate->base_rate);
        $this->assertIsNumeric($rate->max_daily);
        $this->assertIsBool($rate->is_active);
    }

    /** @test */
    public function credit_transactions_are_recorded_with_correct_fields()
    {
        $user = User::factory()->create();
        $wallet = UserCredit::create([
            'user_id' => $user->id,
            'available_credits' => 0,
            'earned_credits' => 0,
            'spent_credits' => 0,
            'pending_credits' => 0,
        ]);

        $transaction = $wallet->addCredits(
            10,
            'daily_login',
            'Daily login bonus',
            ['streak' => 5, 'bonus_multiplier' => 1.5]
        );

        $this->assertDatabaseHas('credit_transactions', [
            'user_id' => $user->id,
            'type' => 'earned',
            'amount' => 10,
            'source' => 'daily_login',
            'description' => 'Daily login bonus',
        ]);

        // Check metadata is stored
        $this->assertNotNull($transaction->metadata);
        $this->assertEquals(5, $transaction->metadata['streak']);
        $this->assertEquals(1.5, $transaction->metadata['bonus_multiplier']);

        // Check processed_at is set
        $this->assertNotNull($transaction->processed_at);
    }

    /** @test */
    public function credit_transaction_scopes_work_correctly()
    {
        $user = User::factory()->create();
        $wallet = UserCredit::create([
            'user_id' => $user->id,
            'available_credits' => 100,
            'earned_credits' => 100,
            'spent_credits' => 0,
            'pending_credits' => 0,
        ]);

        // Create earned transactions
        $wallet->addCredits(10, 'daily_login', 'Daily login');
        $wallet->addCredits(5, 'song_play_complete', 'Listened to song');

        // Create spent transaction
        $wallet->spendCredits(20, 'promotion_participation', 'Joined promotion');

        // Test scopes
        $earnedTransactions = CreditTransaction::where('user_id', $user->id)->earned()->get();
        $spentTransactions = CreditTransaction::where('user_id', $user->id)->spent()->get();
        $todayTransactions = CreditTransaction::where('user_id', $user->id)->today()->get();

        $this->assertCount(2, $earnedTransactions);
        $this->assertCount(1, $spentTransactions);
        $this->assertCount(3, $todayTransactions);
    }

    /** @test */
    public function user_credit_balance_calculations_are_accurate()
    {
        $user = User::factory()->create();
        $wallet = UserCredit::create([
            'user_id' => $user->id,
            'available_credits' => 0,
            'earned_credits' => 0,
            'spent_credits' => 0,
            'pending_credits' => 0,
        ]);

        // Earn credits
        $wallet->addCredits(50, 'daily_login', 'Day 1');
        $wallet->addCredits(30, 'song_play_complete', 'Listened to song');
        $wallet->addCredits(20, 'referral', 'Friend joined');

        // Spend credits
        $wallet->spendCredits(25, 'promotion_participation', 'Promotion');
        $wallet->spendCredits(15, 'artist_support', 'Supported artist');

        $wallet->refresh();

        // Check calculations
        $this->assertEquals(60, $wallet->available_credits); // 100 earned - 40 spent
        $this->assertEquals(100, $wallet->earned_credits);
        $this->assertEquals(40, $wallet->spent_credits);
    }

    /** @test */
    public function credit_rate_can_be_activated_and_deactivated()
    {
        $rate = CreditRate::create([
            'activity_type' => 'test_activity',
            'base_rate' => 5,
            'is_active' => true,
        ]);

        $this->assertTrue($rate->is_active);

        $rate->deactivate();
        $this->assertFalse($rate->fresh()->is_active);

        $rate->activate();
        $this->assertTrue($rate->fresh()->is_active);
    }

    /** @test */
    public function credit_rate_can_be_updated()
    {
        $rate = CreditRate::create([
            'activity_type' => 'test_activity',
            'base_rate' => 5,
            'is_active' => true,
        ]);

        $this->assertEquals(5, $rate->base_rate);

        $rate->updateRate(10.5);
        $this->assertEquals(10.5, $rate->fresh()->base_rate);
    }
}
