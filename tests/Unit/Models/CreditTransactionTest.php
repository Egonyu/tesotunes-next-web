<?php

namespace Tests\Unit\Models;

use Tests\TestCase;
use App\Models\CreditTransaction;
use App\Models\User;
use App\Models\UserCredit;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CreditTransactionTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        
        // Create user credit wallet
        UserCredit::create([
            'user_id' => $this->user->id,
            'available_credits' => 100,
            'earned_credits' => 100,
            'spent_credits' => 0,
            'pending_credits' => 0,
        ]);
    }

    public function test_can_create_credit_transaction_with_source_field(): void
    {
        $transaction = CreditTransaction::create([
            'user_id' => $this->user->id,
            'type' => 'earned',
            'amount' => 5.0,
            'balance_after' => 105.0,
            'source' => 'song_play_complete',
            'description' => 'Completed song play',
            'processed_at' => now(),
        ]);

        $this->assertInstanceOf(CreditTransaction::class, $transaction);
        $this->assertEquals('song_play_complete', $transaction->source);
        $this->assertEquals('5.00', $transaction->amount);
    }

    public function test_can_query_earned_transactions(): void
    {
        CreditTransaction::create([
            'user_id' => $this->user->id,
            'type' => 'earned',
            'amount' => 5.0,
            'balance_after' => 105.0,
            'source' => 'listening',
            'processed_at' => now(),
        ]);

        CreditTransaction::create([
            'user_id' => $this->user->id,
            'type' => 'spent',
            'amount' => -3.0,
            'balance_after' => 102.0,
            'source' => 'transfer_out',
            'processed_at' => now(),
        ]);

        $this->assertEquals(1, CreditTransaction::earned()->count());
        $this->assertEquals(1, CreditTransaction::spent()->count());
    }

    public function test_can_query_by_source(): void
    {
        CreditTransaction::create([
            'user_id' => $this->user->id,
            'type' => 'earned',
            'amount' => 1.0,
            'balance_after' => 101.0,
            'source' => 'daily_login',
            'processed_at' => now(),
        ]);

        CreditTransaction::create([
            'user_id' => $this->user->id,
            'type' => 'earned',
            'amount' => 2.0,
            'balance_after' => 103.0,
            'source' => 'referral',
            'processed_at' => now(),
        ]);

        $this->assertEquals(1, CreditTransaction::bySource('daily_login')->count());
        $this->assertEquals(1, CreditTransaction::bySource('referral')->count());
    }

    public function test_can_query_transactions_for_today(): void
    {
        CreditTransaction::create([
            'user_id' => $this->user->id,
            'type' => 'earned',
            'amount' => 1.0,
            'balance_after' => 101.0,
            'source' => 'listening',
            'processed_at' => now(),
        ]);

        CreditTransaction::create([
            'user_id' => $this->user->id,
            'type' => 'earned',
            'amount' => 1.0,
            'balance_after' => 102.0,
            'source' => 'listening',
            'processed_at' => now()->subDays(2),
        ]);

        $this->assertEquals(1, CreditTransaction::today()->count());
    }

    public function test_has_metadata_json_field(): void
    {
        $transaction = CreditTransaction::create([
            'user_id' => $this->user->id,
            'type' => 'earned',
            'amount' => 1.0,
            'balance_after' => 101.0,
            'source' => 'listening',
            'metadata' => [
                'song_id' => 123,
                'duration_listened' => 180,
                'completion_percentage' => 95,
            ],
            'processed_at' => now(),
        ]);

        $fresh = $transaction->fresh();
        $this->assertIsArray($fresh->metadata);
        $this->assertEquals(123, $fresh->metadata['song_id']);
        $this->assertEquals(180, $fresh->metadata['duration_listened']);
    }

    public function test_can_have_related_user_for_transfers(): void
    {
        $relatedUser = User::factory()->create();

        $transaction = CreditTransaction::create([
            'user_id' => $this->user->id,
            'type' => 'transferred',
            'amount' => -10.0,
            'balance_after' => 90.0,
            'source' => 'transfer_out',
            'related_user_id' => $relatedUser->id,
            'description' => 'Sent to friend',
            'processed_at' => now(),
        ]);

        $this->assertInstanceOf(User::class, $transaction->relatedUser);
        $this->assertEquals($relatedUser->id, $transaction->relatedUser->id);
    }

    public function test_tracks_balance_after_transaction(): void
    {
        $transaction = CreditTransaction::create([
            'user_id' => $this->user->id,
            'type' => 'earned',
            'amount' => 7.5,
            'balance_after' => 107.5,
            'source' => 'bonus',
            'processed_at' => now(),
        ]);

        $this->assertEquals('107.50', $transaction->balance_after);
    }

    public function test_has_processed_at_timestamp(): void
    {
        $processedTime = now()->subHours(2);
        
        $transaction = CreditTransaction::create([
            'user_id' => $this->user->id,
            'type' => 'earned',
            'amount' => 1.0,
            'balance_after' => 101.0,
            'source' => 'listening',
            'processed_at' => $processedTime,
        ]);

        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $transaction->processed_at);
        $this->assertEquals($processedTime->format('Y-m-d H:i'), $transaction->processed_at->format('Y-m-d H:i'));
    }

    public function test_source_description_accessor_works(): void
    {
        $transaction = CreditTransaction::create([
            'user_id' => $this->user->id,
            'type' => 'earned',
            'amount' => 1.0,
            'balance_after' => 101.0,
            'source' => 'listening',
            'processed_at' => now(),
        ]);

        $this->assertEquals('Music listening', $transaction->source_description);

        $transaction->source = 'daily_login';
        $transaction->save();

        $this->assertEquals('Daily login bonus', $transaction->fresh()->source_description);
    }

    public function test_type_icon_accessor_works(): void
    {
        $earnedTx = CreditTransaction::create([
            'user_id' => $this->user->id,
            'type' => 'earned',
            'amount' => 1.0,
            'balance_after' => 101.0,
            'source' => 'listening',
            'processed_at' => now(),
        ]);

        $spentTx = CreditTransaction::create([
            'user_id' => $this->user->id,
            'type' => 'spent',
            'amount' => -1.0,
            'balance_after' => 100.0,
            'source' => 'transfer_out',
            'processed_at' => now(),
        ]);

        $this->assertEquals('💰', $earnedTx->type_icon);
        $this->assertEquals('💸', $spentTx->type_icon);
    }

    public function test_can_store_reference_to_related_model(): void
    {
        $transaction = CreditTransaction::create([
            'user_id' => $this->user->id,
            'type' => 'earned',
            'amount' => 1.0,
            'balance_after' => 101.0,
            'source' => 'listening',
            'reference_type' => 'song',
            'reference_id' => 456,
            'processed_at' => now(),
        ]);

        $this->assertEquals('song', $transaction->reference_type);
        $this->assertEquals(456, $transaction->reference_id);
    }
}
