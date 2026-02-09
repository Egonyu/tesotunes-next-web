<?php

namespace Tests\Feature\Payment;

use Tests\TestCase;
use App\Models\User;
use App\Models\SubscriptionPlan;
use App\Models\Payment;
use App\Models\UserSubscription;
use App\Models\Artist;
use App\Models\Payout;
use App\Services\PaymentService;
use App\Services\Payment\MobileMoneyService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Notification;
use Mockery;

class PaymentProcessingTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();
        Queue::fake();
        Notification::fake();
    }

    /**
     * Test end-to-end subscription payment flow
     */
    public function test_complete_subscription_payment_flow()
    {
        // Arrange
        $user = User::factory()->create();
        $plan = SubscriptionPlan::factory()->create([
            'name' => 'Premium Plan',
            'price_local' => 50000,
            'currency' => 'UGX',
            'duration_days' => 30,
        ]);

        // Mock the mobile money service to return success
        $this->mock(MobileMoneyService::class, function ($mock) {
            $mock->shouldReceive('initiatePayment')
                ->once()
                ->andReturn([
                    'success' => true,
                    'message' => 'Payment processed successfully',
                    'transaction_id' => 'TXN_123456789',
                    'reference' => 'MTN_REF_987654321'
                ]);
        });

        // Act
        $response = $this->actingAs($user)->postJson('/api/payments/subscription', [
            'subscription_plan_id' => $plan->id,
            'payment_method' => 'mtn_mobile_money',
            'phone_number' => '256701234567',
        ]);

        // Assert
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Subscription payment processed successfully',
            ]);

        // Verify payment record was created
        $this->assertDatabaseHas('payments', [
            'user_id' => $user->id,
            'payable_type' => 'App\Models\SubscriptionPlan',
            'payable_id' => $plan->id,
            'amount' => 50000,
            'currency' => 'UGX',
            'payment_method' => 'mobile_money',
            'status' => 'completed',
        ]);

        // Verify subscription was created
        $this->assertDatabaseHas('user_subscriptions', [
            'user_id' => $user->id,
            'subscription_plan_id' => $plan->id,
            'status' => 'active',
        ]);
    }

    /**
     * Test subscription payment failure scenario
     */
    public function test_subscription_payment_failure_handling()
    {
        // Arrange
        $user = User::factory()->create();
        $plan = SubscriptionPlan::factory()->create();

        $this->mock(MobileMoneyService::class, function ($mock) {
            $mock->shouldReceive('initiatePayment')
                ->once()
                ->andReturn([
                    'success' => false,
                    'message' => 'Insufficient funds',
                    'error_code' => 'INSUFFICIENT_FUNDS'
                ]);
        });

        // Act
        $response = $this->actingAs($user)->postJson('/api/payments/subscription', [
            'subscription_plan_id' => $plan->id,
            'payment_method' => 'mtn_mobile_money',
            'phone_number' => '256701234567',
        ]);

        // Assert
        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'Insufficient funds',
            ]);

        // Verify payment record shows failure
        $this->assertDatabaseHas('payments', [
            'user_id' => $user->id,
            'status' => 'failed',
        ]);

        // Verify no subscription was created
        $this->assertDatabaseMissing('user_subscriptions', [
            'user_id' => $user->id,
            'subscription_plan_id' => $plan->id,
        ]);
    }

    /**
     * Test payment validation with invalid data
     */
    public function test_payment_validation_errors()
    {
        $user = User::factory()->create();

        // Test missing required fields
        $response = $this->actingAs($user)->postJson('/api/payments/subscription', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['subscription_plan_id', 'payment_method']);

        // Test invalid phone number format
        $plan = SubscriptionPlan::factory()->create();
        $response = $this->actingAs($user)->postJson('/api/payments/subscription', [
            'subscription_plan_id' => $plan->id,
            'payment_method' => 'mtn_mobile_money',
            'phone_number' => 'invalid-phone',
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
            ]);
    }

    /**
     * Test multiple payment methods support
     */
    public function test_multiple_payment_methods_support()
    {
        $user = User::factory()->create();
        $plan = SubscriptionPlan::factory()->create();

        // Test MTN Mobile Money
        $this->mock(MobileMoneyService::class, function ($mock) {
            $mock->shouldReceive('initiatePayment')
                ->andReturn(['success' => true, 'message' => 'Payment processed successfully']);
        });

        $response = $this->actingAs($user)->postJson('/api/payments/subscription', [
            'subscription_plan_id' => $plan->id,
            'payment_method' => 'mtn_mobile_money',
            'phone_number' => '256701234567',
        ]);

        $response->assertStatus(200);

        // Test Airtel Money
        $response = $this->actingAs($user)->postJson('/api/payments/subscription', [
            'subscription_plan_id' => $plan->id,
            'payment_method' => 'airtel_money',
            'phone_number' => '256751234567',
        ]);

        $response->assertStatus(200);

        // Test Stripe
        $response = $this->actingAs($user)->postJson('/api/payments/subscription', [
            'subscription_plan_id' => $plan->id,
            'payment_method' => 'stripe',
            'token' => 'test_token_123',
        ]);

        // Stripe requires additional implementation
        $response->assertStatus(400);
    }

    /**
     * Test refund processing workflow
     */
    public function test_refund_processing_workflow()
    {
        // Arrange
        $user = User::factory()->create();
        $payment = Payment::factory()->completed()->create([
            'user_id' => $user->id,
            'amount' => 50000,
            'payment_method' => 'mobile_money',
            'payment_provider' => 'mtn_mobile_money',
        ]);

        $subscription = UserSubscription::factory()->create([
            'user_id' => $user->id,
            'payment_id' => $payment->id,
            'status' => 'active',
        ]);

        $admin = User::factory()->create();

        $this->mock(MobileMoneyService::class, function ($mock) {
            $mock->shouldReceive('processRefund')
                ->once()
                ->andReturn([
                    'success' => true,
                    'message' => 'Refund processed successfully',
                    'refund_id' => 'REFUND_123456789'
                ]);
        });

        // Act
        $response = $this->actingAs($admin)->postJson("/api/payments/{$payment->id}/refund", [
            'amount' => 50000,
            'reason' => 'Customer request',
        ]);

        // Assert
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Refund processed successfully',
            ]);

        // Verify payment was updated
        $payment->refresh();
        $this->assertEquals('refunded', $payment->status);
        $this->assertEquals(50000, $payment->refund_amount);
        $this->assertEquals('Customer request', $payment->refund_reason);

        // Verify subscription was cancelled
        $subscription->refresh();
        $this->assertEquals('cancelled', $subscription->status);
    }

    /**
     * Test artist payout workflow
     */
    public function test_artist_payout_workflow()
    {
        // Arrange
        $artist = Artist::factory()->create([
            'earnings_balance' => 200000,
            'payout_phone_number' => '256701234567',
        ]);

        $user = $artist->user;

        // Act
        $response = $this->actingAs($user)->postJson('/api/payouts/request', [
            'amount' => 150000,
            'method' => 'mobile_money',
        ]);

        // Assert
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Payout request submitted successfully',
            ]);

        // Verify payout record was created
        $this->assertDatabaseHas('payouts', [
            'artist_id' => $artist->id,
            'amount' => 150000,
            'payout_method' => 'mobile_money',
            'status' => 'pending',
        ]);

        // Verify artist balance was deducted
        $artist->refresh();
        $this->assertEquals(50000, $artist->earnings_balance);

        // Verify job was queued for processing
        Queue::assertPushed(\App\Jobs\ProcessArtistPayout::class);
    }

    /**
     * Test artist payout validation
     */
    public function test_artist_payout_validation()
    {
        // Test insufficient balance
        $artist = Artist::factory()->create([
            'earnings_balance' => 30000,
            'payout_phone_number' => '256701234567',
        ]);

        $user = $artist->user;

        $response = $this->actingAs($user)->postJson('/api/payouts/request', [
            'amount' => 75000,
            'method' => 'mobile_money',
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
            ]);

        // Test missing payout phone number
        $artist2 = Artist::factory()->create([
            'earnings_balance' => 100000,
            'payout_phone_number' => null,
        ]);

        $user2 = $artist2->user;

        $response = $this->actingAs($user2)->postJson('/api/payouts/request', [
            'amount' => 75000,
            'method' => 'mobile_money',
        ]);

        $response->assertStatus(400);
    }

    /**
     * Test subscription lifecycle management
     */
    public function test_subscription_lifecycle_management()
    {
        $user = User::factory()->create();
        $plan = SubscriptionPlan::factory()->create();

        // Create active subscription
        $subscription = UserSubscription::factory()->create([
            'user_id' => $user->id,
            'subscription_plan_id' => $plan->id,
            'status' => 'active',
            'expires_at' => now()->addDays(30),
        ]);

        // Test subscription cancellation
        $response = $this->actingAs($user)->postJson("/api/subscriptions/{$subscription->id}/cancel", [
            'reason' => 'No longer needed',
        ]);

        $response->assertStatus(200);

        $subscription->refresh();
        $this->assertEquals('cancelled', $subscription->status);
        $this->assertEquals('No longer needed', $subscription->cancellation_reason);

        // Test subscription extension (admin only)
        $admin = User::factory()->create();
        $activeSubscription = UserSubscription::factory()->create([
            'status' => 'active',
            'expires_at' => now()->addDays(10),
        ]);

        $response = $this->actingAs($admin)->postJson("/api/subscriptions/{$activeSubscription->id}/extend", [
            'days' => 15,
            'reason' => 'Promotional extension',
        ]);

        $response->assertStatus(200);

        $activeSubscription->refresh();
        $this->assertEquals(now()->addDays(25)->format('Y-m-d'), $activeSubscription->expires_at->format('Y-m-d'));
    }

    /**
     * Test payment analytics endpoint
     */
    public function test_payment_analytics_endpoint()
    {
        // Create test data
        Payment::factory()->count(5)->create([
            'status' => 'completed',
            'amount' => 50000,
            'currency' => 'UGX',
            'created_at' => now()->subDays(5),
        ]);

        Payment::factory()->count(3)->create([
            'status' => 'failed',
            'amount' => 30000,
            'currency' => 'UGX',
            'created_at' => now()->subDays(3),
        ]);

        $admin = User::factory()->create();

        $response = $this->actingAs($admin)->getJson('/api/admin/payment-analytics', [
            'start_date' => now()->subDays(7)->format('Y-m-d'),
            'end_date' => now()->format('Y-m-d'),
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'total_payments',
                'completed_payments',
                'failed_payments',
                'pending_payments',
                'total_revenue',
                'average_payment',
                'payment_methods',
                'daily_revenue',
                'currency_breakdown',
            ]);

        $data = $response->json();
        $this->assertEquals(8, $data['total_payments']);
        $this->assertEquals(5, $data['completed_payments']);
        $this->assertEquals(3, $data['failed_payments']);
        $this->assertEquals(250000, $data['total_revenue']);
    }

    /**
     * Test payment webhook handling
     */
    public function test_payment_webhook_handling()
    {
        $payment = Payment::factory()->create([
            'status' => 'pending',
            'payment_reference' => 'PAY_TEST123',
        ]);

        // Mock webhook payload from payment provider
        $webhookPayload = [
            'payment_id' => $payment->id,
            'event' => 'payment.completed',
            'reference' => 'PAY_TEST123',
            'status' => 'completed',
            'transaction_id' => 'TXN_789456123',
            'amount' => $payment->amount,
        ];

        // Compute correct webhook signature
        $payload = json_encode($webhookPayload);
        $secret = config('services.payment.webhook_secret', 'default_secret');
        $signature = hash_hmac('sha256', $payload, $secret);

        $response = $this->postJson('/api/webhooks/payment/mtn', $webhookPayload, [
            'X-Webhook-Signature' => $signature
        ]);

        $response->assertStatus(200);

        // Verify payment status was updated
        $payment->refresh();
        $this->assertEquals('completed', $payment->status);
    }

    /**
     * Test concurrent payment processing
     */
    public function test_concurrent_payment_processing()
    {
        $user = User::factory()->create();
        $plan = SubscriptionPlan::factory()->create();

        $this->mock(MobileMoneyService::class, function ($mock) {
            $mock->shouldReceive('initiatePayment')
                ->twice()
                ->andReturn(['success' => true, 'message' => 'Payment processed successfully']);
        });

        // Simulate concurrent requests
        $response1 = $this->actingAs($user)->postJson('/api/payments/subscription', [
            'subscription_plan_id' => $plan->id,
            'payment_method' => 'mtn_mobile_money',
            'phone_number' => '256701234567',
        ]);

        $response2 = $this->actingAs($user)->postJson('/api/payments/subscription', [
            'subscription_plan_id' => $plan->id,
            'payment_method' => 'mtn_mobile_money',
            'phone_number' => '256701234567',
        ]);

        // Both should succeed but only one subscription should be active
        $response1->assertStatus(200);
        $response2->assertStatus(200);

        // Check that the previous subscription was cancelled
        $subscriptions = UserSubscription::where('user_id', $user->id)->get();
        $activeSubscriptions = $subscriptions->where('status', 'active');

        $this->assertEquals(1, $activeSubscriptions->count());
    }

    /**
     * Test payment retry mechanism
     */
    public function test_payment_retry_mechanism()
    {
        $user = User::factory()->create();
        $plan = SubscriptionPlan::factory()->create();

        // First attempt fails
        $this->mock(MobileMoneyService::class, function ($mock) {
            $mock->shouldReceive('initiatePayment')
                ->once()
                ->andReturn(['success' => false, 'message' => 'Network timeout']);
        });

        $response = $this->actingAs($user)->postJson('/api/payments/subscription', [
            'subscription_plan_id' => $plan->id,
            'payment_method' => 'mtn_mobile_money',
            'phone_number' => '256701234567',
        ]);

        $response->assertStatus(400);

        // Retry should work
        $this->mock(MobileMoneyService::class, function ($mock) {
            $mock->shouldReceive('initiatePayment')
                ->once()
                ->andReturn(['success' => true, 'message' => 'Payment processed successfully']);
        });

        $response = $this->actingAs($user)->postJson('/api/payments/subscription', [
            'subscription_plan_id' => $plan->id,
            'payment_method' => 'mtn_mobile_money',
            'phone_number' => '256701234567',
        ]);

        $response->assertStatus(200);
    }
}