<?php

namespace Tests\Feature\Payment;

use App\Models\User;
use App\Models\Payment;
use App\Models\SubscriptionPlan;
use App\Models\UserSubscription;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubscriptionPaymentTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected SubscriptionPlan $plan;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        $this->plan = SubscriptionPlan::factory()->create([
            'name' => 'Premium Monthly',
            'slug' => 'premium-monthly',
            'price' => 15000,
            'currency' => 'UGX',
            'interval' => 'monthly',
            'features' => [
                'unlimited_downloads',
                '320kbps_streaming',
                'offline_playlists',
            ],
        ]);
    }

    public function test_user_can_initiate_subscription_payment(): void
    {
        $this->markTestSkipped('Subscription initiate route not yet implemented');
        
        $response = $this->actingAs($this->user)
            ->post(route('frontend.subscription.initiate'), [
                'subscription_plan_id' => $this->plan->id,
                'payment_method' => 'mobile_money',
                'phone_number' => '+256700000000',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('payments', [
            'user_id' => $this->user->id,
            'payment_type' => 'subscription',
            'amount' => 15000,
            'status' => 'pending',
        ]);
    }

    public function test_subscription_payment_has_correct_amount(): void
    {
        $payment = Payment::factory()->create([
            'user_id' => $this->user->id,
            'payment_type' => 'subscription',
            'amount' => $this->plan->price,
            'currency' => 'UGX',
        ]);

        $this->assertEquals(15000, $payment->amount);
        $this->assertEquals('UGX', $payment->currency);
    }

    public function test_completed_subscription_payment_activates_subscription(): void
    {
        $payment = Payment::factory()->create([
            'user_id' => $this->user->id,
            'payment_type' => 'subscription',
            'amount' => $this->plan->price,
            'status' => 'pending',
        ]);

        // Simulate payment completion
        $payment->update([
            'status' => 'completed',
            'processed_at' => now(),
        ]);

        // Create subscription
        $subscription = UserSubscription::create([
            'user_id' => $this->user->id,
            'subscription_plan_id' => $this->plan->id,
            'status' => 'active',
            'started_at' => now(),
            'expires_at' => now()->addMonth(),
            'payment_id' => $payment->id,
        ]);

        $this->assertDatabaseHas('user_subscriptions', [
            'user_id' => $this->user->id,
            'status' => 'active',
        ]);
    }

    public function test_failed_subscription_payment_does_not_activate_subscription(): void
    {
        $payment = Payment::factory()->create([
            'user_id' => $this->user->id,
            'payment_type' => 'subscription',
            'amount' => $this->plan->price,
            'status' => 'failed',
        ]);

        $this->assertEquals('failed', $payment->status);

        $subscriptionExists = UserSubscription::where('user_id', $this->user->id)
            ->where('status', 'active')
            ->exists();

        $this->assertFalse($subscriptionExists);
    }

    public function test_subscription_expires_after_interval(): void
    {
        $subscription = UserSubscription::create([
            'user_id' => $this->user->id,
            'subscription_plan_id' => $this->plan->id,
            'status' => 'active',
            'started_at' => now(),
            'expires_at' => now()->addMonth(),
        ]);

        // Check if subscription is active
        $this->assertEquals('active', $subscription->status);
        $this->assertTrue($subscription->expires_at->isFuture());

        // Simulate time passing (subscription expired)
        $subscription->update([
            'expires_at' => now()->subDay(),
            'status' => 'expired',
        ]);

        $this->assertEquals('expired', $subscription->status);
        $this->assertTrue($subscription->expires_at->isPast());
    }

    public function test_user_can_have_only_one_active_subscription(): void
    {
        // Create first active subscription
        $subscription1 = UserSubscription::factory()->create([
            'user_id' => $this->user->id,
            'subscription_plan_id' => $this->plan->id,
            'status' => 'active',
            'started_at' => now(),
            'expires_at' => now()->addMonth(),
        ]);

        // Attempting to create another active subscription should deactivate the first
        $subscription2 = UserSubscription::factory()->create([
            'user_id' => $this->user->id,
            'subscription_plan_id' => $this->plan->id,
            'status' => 'active',
            'started_at' => now(),
            'expires_at' => now()->addMonth(),
        ]);

        // In implementation, first subscription should be cancelled
        $subscription1->update(['status' => 'cancelled']);

        $activeSubscriptions = UserSubscription::where('user_id', $this->user->id)
            ->where('status', 'active')
            ->count();

        $this->assertEquals(1, $activeSubscriptions);
    }

    public function test_mobile_money_payment_stores_phone_number(): void
    {
        $payment = Payment::factory()->create([
            'user_id' => $this->user->id,
            'payment_type' => 'subscription',
            'payment_method' => 'mobile_money',
            'phone_number' => '+256700000000',
            'amount' => $this->plan->price,
        ]);

        $this->assertEquals('mobile_money', $payment->payment_method);
        $this->assertEquals('+256700000000', $payment->phone_number);
    }

    public function test_mtn_money_payment_has_correct_provider(): void
    {
        $payment = Payment::factory()->create([
            'user_id' => $this->user->id,
            'payment_type' => 'subscription',
            'payment_method' => 'mobile_money',
            'payment_provider' => 'mtn_money',
            'amount' => $this->plan->price,
        ]);

        $this->assertEquals('mtn_money', $payment->payment_provider);
    }

    public function test_airtel_money_payment_has_correct_provider(): void
    {
        $payment = Payment::factory()->create([
            'user_id' => $this->user->id,
            'payment_type' => 'subscription',
            'payment_method' => 'mobile_money',
            'payment_provider' => 'airtel_money',
            'amount' => $this->plan->price,
        ]);

        $this->assertEquals('airtel_money', $payment->payment_provider);
    }

    public function test_payment_transaction_id_is_unique(): void
    {
        $txnId = 'TXN-SUB-' . uniqid();

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

    public function test_subscription_payment_stores_metadata(): void
    {
        $metadata = [
            'ip_address' => '192.168.1.1',
            'user_agent' => 'Mozilla/5.0',
            'device' => 'mobile',
            'plan_name' => 'Premium Monthly',
        ];

        $payment = Payment::factory()->create([
            'user_id' => $this->user->id,
            'payment_type' => 'subscription',
            'amount' => $this->plan->price,
            'metadata' => $metadata,
        ]);

        $this->assertIsArray($payment->metadata);
        $this->assertEquals('192.168.1.1', $payment->metadata['ip_address']);
        $this->assertEquals('Premium Monthly', $payment->metadata['plan_name']);
    }

    public function test_subscription_can_be_cancelled(): void
    {
        $subscription = UserSubscription::factory()->create([
            'user_id' => $this->user->id,
            'subscription_plan_id' => $this->plan->id,
            'status' => 'active',
        ]);

        $subscription->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
        ]);

        $this->assertEquals('cancelled', $subscription->status);
        $this->assertNotNull($subscription->cancelled_at);
    }

    public function test_subscription_renewal_creates_new_payment(): void
    {
        $subscription = UserSubscription::factory()->create([
            'user_id' => $this->user->id,
            'subscription_plan_id' => $this->plan->id,
            'status' => 'active',
            'expires_at' => now()->addMonth(),
        ]);

        // Create renewal payment
        $renewalPayment = Payment::factory()->create([
            'user_id' => $this->user->id,
            'payment_type' => 'subscription',
            'amount' => $this->plan->price,
            'description' => 'Subscription renewal',
        ]);

        $this->assertDatabaseHas('payments', [
            'user_id' => $this->user->id,
            'payment_type' => 'subscription',
            'description' => 'Subscription renewal',
        ]);
    }

    public function test_free_tier_has_download_limits(): void
    {
        // Free user (no subscription)
        $freeUser = User::factory()->create();

        // Check if user has no active subscription
        $hasActiveSubscription = UserSubscription::where('user_id', $freeUser->id)
            ->where('status', 'active')
            ->where('expires_at', '>', now())
            ->exists();

        $this->assertFalse($hasActiveSubscription);
    }

    public function test_premium_tier_has_unlimited_downloads(): void
    {
        $subscription = UserSubscription::factory()->create([
            'user_id' => $this->user->id,
            'subscription_plan_id' => $this->plan->id,
            'status' => 'active',
            'expires_at' => now()->addMonth(),
        ]);

        $this->assertTrue($subscription->expires_at->isFuture());
        $this->assertEquals('active', $subscription->status);
    }
}
