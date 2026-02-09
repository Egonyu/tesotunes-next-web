<?php

namespace Tests\Unit\Models;

use App\Models\Payment;
use App\Models\User;
use App\Models\Song;
use App\Models\Artist;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Payment $payment;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->payment = Payment::factory()->create([
            'user_id' => $this->user->id,
        ]);
    }

    public function test_payment_can_be_created(): void
    {
        $payment = Payment::factory()->create([
            'user_id' => $this->user->id,
            'payment_type' => 'subscription',
        ]);

        // Set amount using unguard temporarily since it's for testing
        $payment->unguard();
        $payment->update(['amount' => 15000]);
        $payment->reguard();

        $this->assertDatabaseHas('payments', [
            'user_id' => $this->user->id,
            'payment_type' => 'subscription',
            'amount' => 15000,
        ]);
    }

    public function test_payment_belongs_to_user(): void
    {
        $this->assertInstanceOf(User::class, $this->payment->user);
        $this->assertEquals($this->user->id, $this->payment->user->id);
    }

    public function test_payment_can_belong_to_song(): void
    {
        $artist = Artist::factory()->create(['user_id' => $this->user->id]);
        $song = Song::factory()->create([
            'user_id' => $this->user->id,
            'artist_id' => $artist->id,
        ]);

        $payment = Payment::factory()->create([
            'user_id' => $this->user->id,
            'song_id' => $song->id,
            'payment_type' => 'royalty',
        ]);

        $this->assertInstanceOf(Song::class, $payment->song);
        $this->assertEquals($song->id, $payment->song->id);
    }

    public function test_payment_type_values(): void
    {
        $types = ['subscription', 'royalty', 'payout', 'download', 'purchase'];

        foreach ($types as $type) {
            $payment = Payment::factory()->create([
                'user_id' => $this->user->id,
                'payment_type' => $type,
            ]);

            $this->assertEquals($type, $payment->payment_type);
        }
    }

    public function test_payment_status_values(): void
    {
        $statuses = ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'];

        foreach ($statuses as $status) {
            $payment = Payment::factory()->create([
                'user_id' => $this->user->id,
                'status' => $status,
            ]);

            $this->assertEquals($status, $payment->status);
        }
    }

    public function test_payment_method_values(): void
    {
        $methods = ['mobile_money', 'bank_transfer', 'card', 'cash'];

        foreach ($methods as $method) {
            $payment = Payment::factory()->create([
                'user_id' => $this->user->id,
                'payment_method' => $method,
            ]);

            $this->assertEquals($method, $payment->payment_method);
        }
    }

    public function test_payment_transaction_id_is_unique(): void
    {
        $txnId = 'TXN-UNIQUE-12345';

        Payment::factory()->create([
            'user_id' => $this->user->id,
            'transaction_id' => $txnId,
        ]);

        $this->expectException(\Illuminate\Database\QueryException::class);

        Payment::factory()->create([
            'user_id' => $this->user->id,
            'transaction_id' => $txnId,
        ]);
    }

    public function test_payment_amount_is_decimal(): void
    {
        $payment = Payment::factory()->create([
            'user_id' => $this->user->id,
            'amount' => 15000.50,
        ]);

        $this->assertEquals('15000.50', $payment->amount);
    }

    public function test_payment_default_currency_is_ugx(): void
    {
        $payment = Payment::factory()->create([
            'user_id' => $this->user->id,
        ]);

        $this->assertEquals('UGX', $payment->currency);
    }

    public function test_payment_default_status_is_pending(): void
    {
        $payment = Payment::factory()->create([
            'user_id' => $this->user->id,
        ]);

        $this->assertEquals('pending', $payment->status);
    }

    public function test_payment_stores_mobile_money_number(): void
    {
        $payment = Payment::factory()->create([
            'user_id' => $this->user->id,
            'payment_method' => 'mobile_money',
            'phone_number' => '+256700000000',
        ]);

        $this->assertEquals('+256700000000', $payment->phone_number);
    }

    public function test_payment_stores_payment_provider(): void
    {
        $providers = ['mtn_money', 'airtel_money', 'bank', 'stripe'];

        foreach ($providers as $provider) {
            $payment = Payment::factory()->create([
                'user_id' => $this->user->id,
                'payment_provider' => $provider,
            ]);

            $this->assertEquals($provider, $payment->payment_provider);
        }
    }

    public function test_payment_stores_payment_reference(): void
    {
        $payment = Payment::factory()->create([
            'user_id' => $this->user->id,
            'payment_reference' => 'MTN-REF-123456',
        ]);

        $this->assertNotNull($payment->payment_reference);
        $this->assertEquals('MTN-REF-123456', $payment->payment_reference);
    }

    public function test_payment_stores_description(): void
    {
        $description = 'Monthly premium subscription payment';

        $payment = Payment::factory()->create([
            'user_id' => $this->user->id,
            'description' => $description,
        ]);

        $this->assertEquals($description, $payment->description);
    }

    public function test_payment_has_processed_timestamp(): void
    {
        $payment = Payment::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        $this->assertNotNull($payment->completed_at);
        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $payment->completed_at);
    }

    public function test_payment_stores_metadata_as_json(): void
    {
        $metadata = [
            'ip_address' => '192.168.1.1',
            'user_agent' => 'Mozilla/5.0',
            'device' => 'mobile',
        ];

        $payment = Payment::factory()->create([
            'user_id' => $this->user->id,
            'metadata' => $metadata,
        ]);

        $this->assertIsArray($payment->metadata);
        $this->assertEquals('192.168.1.1', $payment->metadata['ip_address']);
    }

    public function test_payment_guards_sensitive_fields(): void
    {
        $payment = new Payment();
        $guarded = $payment->getGuarded();

        // These fields should be guarded (not mass assignable)
        $this->assertContains('id', $guarded);
    }

    public function test_subscription_payment_calculation(): void
    {
        $subscriptionPrice = 15000; // UGX 15,000 monthly

        $payment = Payment::factory()->create([
            'user_id' => $this->user->id,
            'payment_type' => 'subscription',
            'amount' => $subscriptionPrice,
            'currency' => 'UGX',
            'status' => 'completed',
        ]);

        $this->assertEquals($subscriptionPrice, $payment->amount);
        $this->assertEquals('subscription', $payment->payment_type);
    }

    public function test_royalty_payment_for_artist(): void
    {
        $artist = Artist::factory()->create(['user_id' => $this->user->id]);
        $song = Song::factory()->create([
            'user_id' => $this->user->id,
            'artist_id' => $artist->id,
        ]);

        $royaltyAmount = 50000; // UGX 50,000 minimum payout

        $payment = Payment::factory()->create([
            'user_id' => $this->user->id,
            'song_id' => $song->id,
            'payment_type' => 'royalty',
            'amount' => $royaltyAmount,
            'status' => 'completed',
        ]);

        $this->assertEquals($royaltyAmount, $payment->amount);
        $this->assertEquals('royalty', $payment->payment_type);
        $this->assertEquals($song->id, $payment->song_id);
    }

    public function test_payout_payment_to_artist(): void
    {
        $artist = Artist::factory()->create(['user_id' => $this->user->id]);

        $payoutAmount = 100000; // UGX 100,000

        $payment = Payment::factory()->completed()->create([
            'user_id' => $this->user->id,
            'payment_type' => 'payout',
            'payment_method' => 'mobile_money',
            'phone_number' => '+256700000000',
        ]);

        // Set amount using unguard for testing
        $payment->unguard();
        $payment->update(['amount' => $payoutAmount]);
        $payment->reguard();

        $this->assertEquals($payoutAmount, $payment->fresh()->amount);
        $this->assertEquals('payout', $payment->payment_type);
        $this->assertEquals('mobile_money', $payment->payment_method);
    }

    public function test_failed_payment_retains_data(): void
    {
        $payment = Payment::factory()->failed()->create([
            'user_id' => $this->user->id,
            'metadata' => ['error' => 'Insufficient funds'],
        ]);

        $this->assertEquals('failed', $payment->fresh()->status);
        $this->assertArrayHasKey('error', $payment->metadata);
    }

    public function test_payment_can_be_refunded(): void
    {
        $payment = Payment::factory()->completed()->create([
            'user_id' => $this->user->id,
            'amount' => 15000,
        ]);

        $payment->markAsRefunded();

        $this->assertEquals('refunded', $payment->fresh()->status);
        $this->assertNotNull($payment->fresh()->refunded_at);
    }
}
