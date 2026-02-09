<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\PaymentService;
use App\Services\Payment\MobileMoneyService;
use App\Models\Payment;
use App\Models\User;
use App\Models\UserSubscription;
use App\Models\SubscriptionPlan;
use App\Models\Payout;
use App\Models\Artist;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Mockery;
use Exception;

class PaymentServiceTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected PaymentService $paymentService;
    protected $mobileMoneyServiceMock;

    protected function setUp(): void
    {
        parent::setUp();

        $this->mobileMoneyServiceMock = Mockery::mock(MobileMoneyService::class);
        $this->paymentService = new PaymentService($this->mobileMoneyServiceMock);
    }

    /**
     * Test subscription payment processing - success scenario
     */
    public function test_process_subscription_payment_success()
    {
        // Arrange
        $user = User::factory()->create();
        $plan = SubscriptionPlan::factory()->create([
            'price_local' => 50000,
            'currency' => 'UGX',
            'duration_days' => 30,
        ]);

        $paymentData = [
            'phone_number' => '256701234567',
        ];

        $this->mobileMoneyServiceMock
            ->shouldReceive('initiatePayment')
            ->once()
            ->with(Mockery::type(Payment::class))
            ->andReturn(['success' => true, 'message' => 'Payment processed successfully']);

        // Act
        $result = $this->paymentService->processSubscriptionPayment(
            $user,
            $plan,
            PaymentService::METHOD_MTN_MOBILE_MONEY,
            $paymentData
        );

        // Assert
        $this->assertTrue($result['success'], 'Payment failed: ' . ($result['message'] ?? 'Unknown error'));
        $this->assertArrayHasKey('payment_id', $result);
        $this->assertArrayHasKey('subscription_id', $result);
        $this->assertEquals('Subscription payment processed successfully', $result['message']);

        // Check database records
        $this->assertDatabaseHas('payments', [
            'user_id' => $user->id,
            'payable_type' => 'App\Models\SubscriptionPlan',
            'payable_id' => $plan->id,
            'amount' => $plan->price_local,
            'payment_method' => 'mobile_money',
            'payment_provider' => 'mtn_mobile_money',
        ]);

        $this->assertDatabaseHas('user_subscriptions', [
            'user_id' => $user->id,
            'subscription_plan_id' => $plan->id,
            'status' => PaymentService::SUBSCRIPTION_ACTIVE,
        ]);
    }

    /**
     * Test subscription payment processing - validation failure
     */
    public function test_process_subscription_payment_validation_failure()
    {
        // Arrange
        $user = User::factory()->create();
        $plan = SubscriptionPlan::factory()->create();

        $invalidPaymentData = []; // Missing phone number

        // Act & Assert
        $result = $this->paymentService->processSubscriptionPayment(
            $user,
            $plan,
            PaymentService::METHOD_MTN_MOBILE_MONEY,
            $invalidPaymentData
        );

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('Phone number is required', $result['message']);
    }

    /**
     * Test subscription payment processing - payment gateway failure
     */
    public function test_process_subscription_payment_gateway_failure()
    {
        // Arrange
        $user = User::factory()->create();
        $plan = SubscriptionPlan::factory()->create();
        $paymentData = ['phone_number' => '256701234567'];

        $this->mobileMoneyServiceMock
            ->shouldReceive('initiatePayment')
            ->once()
            ->andReturn(['success' => false, 'message' => 'Insufficient funds']);

        // Act
        $result = $this->paymentService->processSubscriptionPayment(
            $user,
            $plan,
            PaymentService::METHOD_MTN_MOBILE_MONEY,
            $paymentData
        );

        // Assert
        $this->assertFalse($result['success']);
        $this->assertEquals('Insufficient funds', $result['message']);
    }

    /**
     * Test one-time payment processing
     */
    public function test_process_one_time_payment_success()
    {
        // Arrange
        $user = User::factory()->create();
        $amount = 100000;
        $currency = 'UGX';
        $description = 'Credit purchase';
        $paymentData = ['phone_number' => '256701234567'];

        $this->mobileMoneyServiceMock
            ->shouldReceive('initiatePayment')
            ->once()
            ->andReturn(['success' => true, 'message' => 'Payment processed successfully']);

        // Act
        $result = $this->paymentService->processOneTimePayment(
            $user,
            $amount,
            $currency,
            PaymentService::METHOD_MTN_MOBILE_MONEY,
            $description,
            $paymentData
        );

        // Assert
        $this->assertTrue($result['success']);
        $this->assertArrayHasKey('payment_id', $result);
        $this->assertEquals('Payment processed successfully', $result['message']);
    }

    /**
     * Test refund processing - success scenario
     */
    public function test_process_refund_success()
    {
        // Arrange
        $payment = Payment::factory()->create([
            'status' => PaymentService::STATUS_COMPLETED,
            'amount' => 50000,
            'payment_method' => PaymentService::PAYMENT_METHOD_MOBILE_MONEY,
            'payment_provider' => 'mtn_mobile_money',
        ]);

        $subscription = UserSubscription::factory()->create([
            'payment_id' => $payment->id,
            'status' => PaymentService::SUBSCRIPTION_ACTIVE,
        ]);

        $this->mobileMoneyServiceMock
            ->shouldReceive('processRefund')
            ->once()
            ->andReturn(['success' => true, 'message' => 'Refund processed successfully']);

        // Act
        $result = $this->paymentService->processRefund($payment, null, 'Customer request');

        // Assert
        $this->assertTrue($result['success']);
        $this->assertEquals('Refund processed successfully', $result['message']);

        $payment->refresh();
        $this->assertEquals(PaymentService::STATUS_REFUNDED, $payment->status);
        $this->assertEquals(50000, $payment->metadata['refund_amount']);
        $this->assertEquals('Customer request', $payment->metadata['refund_reason']);
    }

    /**
     * Test refund processing - invalid payment status
     */
    public function test_process_refund_invalid_payment_status()
    {
        // Arrange
        $payment = Payment::factory()->create([
            'status' => PaymentService::STATUS_PENDING,
        ]);

        // Act & Assert
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Only completed payments can be refunded');

        $this->paymentService->processRefund($payment);
    }

    /**
     * Test refund processing - amount exceeds original payment
     */
    public function test_process_refund_amount_exceeds_original()
    {
        // Arrange
        $payment = Payment::factory()->create([
            'status' => PaymentService::STATUS_COMPLETED,
            'amount' => 50000,
        ]);

        // Act & Assert
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Refund amount cannot exceed original payment amount');

        $this->paymentService->processRefund($payment, 60000);
    }

    /**
     * Test artist payout processing - success scenario
     */
    public function test_process_artist_payout_success()
    {
        // Arrange
        $artist = Artist::factory()->create([
            'earnings_balance' => 100000,
            'payout_phone_number' => '256701234567',
        ]);

        $payoutAmount = 75000;

        // Act
        $result = $this->paymentService->processArtistPayout($artist, $payoutAmount);

        // Assert
        $this->assertTrue($result['success']);
        $this->assertArrayHasKey('payout_id', $result);
        $this->assertEquals('Payout request submitted successfully', $result['message']);

        // Check artist balance was deducted
        $artist->refresh();
        $this->assertEquals(25000, $artist->earnings_balance);

        // Check payout record was created
        $this->assertDatabaseHas('payouts', [
            'artist_id' => $artist->id,
            'amount' => $payoutAmount,
            'status' => 'pending',
        ]);
    }

    /**
     * Test artist payout processing - insufficient balance
     */
    public function test_process_artist_payout_insufficient_balance()
    {
        // Arrange
        $artist = Artist::factory()->create([
            'earnings_balance' => 30000,
            'payout_phone_number' => '256701234567',
        ]);

        $payoutAmount = 75000;

        // Act & Assert
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Artist not eligible for payout or insufficient balance');

        $this->paymentService->processArtistPayout($artist, $payoutAmount);
    }

    /**
     * Test artist payout processing - below minimum payout
     */
    public function test_process_artist_payout_below_minimum()
    {
        // Arrange
        config(['payments.minimum_payout' => 50000]);

        $artist = Artist::factory()->create([
            'earnings_balance' => 100000,
            'payout_phone_number' => '256701234567',
        ]);

        $payoutAmount = 30000; // Below minimum

        // Act & Assert
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Artist not eligible for payout or insufficient balance');

        $this->paymentService->processArtistPayout($artist, $payoutAmount);
    }

    /**
     * Test subscription cancellation
     */
    public function test_cancel_subscription_success()
    {
        // Arrange
        $subscription = UserSubscription::factory()->create([
            'status' => PaymentService::SUBSCRIPTION_ACTIVE,
        ]);

        // Act
        $result = $this->paymentService->cancelSubscription($subscription, 'User request');

        // Assert
        $this->assertTrue($result['success']);
        $this->assertEquals('Subscription cancelled successfully', $result['message']);

        $subscription->refresh();
        $this->assertEquals(PaymentService::SUBSCRIPTION_CANCELLED, $subscription->status);
        $this->assertEquals('User request', $subscription->cancellation_reason);
        $this->assertFalse($subscription->auto_renew);
    }

    /**
     * Test subscription cancellation - already cancelled
     */
    public function test_cancel_subscription_already_cancelled()
    {
        // Arrange
        $subscription = UserSubscription::factory()->create([
            'status' => PaymentService::SUBSCRIPTION_CANCELLED,
        ]);

        // Act & Assert
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Subscription is already cancelled');

        $this->paymentService->cancelSubscription($subscription);
    }

    /**
     * Test subscription extension
     */
    public function test_extend_subscription_success()
    {
        // Arrange
        $originalEndDate = now()->addDays(10)->startOfSecond(); // Remove microseconds
        $subscription = UserSubscription::factory()->create([
            'status' => PaymentService::SUBSCRIPTION_ACTIVE,
            'expires_at' => $originalEndDate,
        ]);

        $extensionDays = 15;

        // Act
        $result = $this->paymentService->extendSubscription($subscription, $extensionDays, 'Promotional extension');

        // Assert
        // Compare only up to seconds precision (MySQL doesn't store microseconds by default)
        $expectedDate = $originalEndDate->copy()->addDays($extensionDays)->startOfSecond();
        $actualDate = $result->expires_at->startOfSecond();
        $this->assertEquals($expectedDate->format('Y-m-d H:i:s'), $actualDate->format('Y-m-d H:i:s'));
        $this->assertEquals('Promotional extension', $result->extension_reason);
        $this->assertNotNull($result->extended_at);
    }

    /**
     * Test payment analytics generation
     */
    public function test_get_payment_analytics()
    {
        // Arrange
        Payment::factory()->count(5)->create([
            'status' => PaymentService::STATUS_COMPLETED,
            'amount' => 50000,
            'payment_method' => 'mobile_money',
            'payment_provider' => 'mtn_mobile_money',
            'currency' => 'UGX',
        ]);

        Payment::factory()->count(2)->create([
            'status' => PaymentService::STATUS_FAILED,
            'amount' => 50000,
            'payment_method' => 'mobile_money',
            'payment_provider' => 'airtel_money',
            'currency' => 'UGX',
        ]);

        Payment::factory()->count(3)->create([
            'status' => PaymentService::STATUS_PENDING,
            'amount' => 30000,
            'payment_method' => 'card',
            'currency' => 'USD',
        ]);

        // Act
        $analytics = $this->paymentService->getPaymentAnalytics();

        // Assert
        $this->assertEquals(10, $analytics['total_payments']);
        $this->assertEquals(5, $analytics['completed_payments']);
        $this->assertEquals(2, $analytics['failed_payments']);
        $this->assertEquals(3, $analytics['pending_payments']);
        $this->assertEquals(250000, $analytics['total_revenue']); // 5 * 50000
        $this->assertEquals(50000, $analytics['average_payment']);
        $this->assertArrayHasKey('payment_methods', $analytics);
        $this->assertArrayHasKey('currency_breakdown', $analytics);
    }

    /**
     * Test subscription analytics generation
     */
    public function test_get_subscription_analytics()
    {
        // Arrange
        UserSubscription::factory()->count(10)->create([
            'status' => PaymentService::SUBSCRIPTION_ACTIVE,
            'expires_at' => now()->addMonths(2), // Far in the future
        ]);

        UserSubscription::factory()->count(3)->create([
            'status' => PaymentService::SUBSCRIPTION_EXPIRED,
        ]);

        UserSubscription::factory()->count(2)->create([
            'status' => PaymentService::SUBSCRIPTION_CANCELLED,
        ]);

        // Create expiring soon subscriptions
        UserSubscription::factory()->count(2)->create([
            'status' => PaymentService::SUBSCRIPTION_ACTIVE,
            'expires_at' => now()->addDays(3),
        ]);

        // Act
        $analytics = $this->paymentService->getSubscriptionAnalytics();

        // Assert
        $this->assertEquals(17, $analytics['total_subscriptions']);
        $this->assertEquals(12, $analytics['active_subscriptions']);
        $this->assertEquals(3, $analytics['expired_subscriptions']);
        $this->assertEquals(2, $analytics['cancelled_subscriptions']);
        $this->assertEquals(2, $analytics['expiring_soon']);
        $this->assertArrayHasKey('plan_distribution', $analytics);
        $this->assertArrayHasKey('churn_rate', $analytics);
        $this->assertArrayHasKey('mrr', $analytics);
    }

    /**
     * Test payment validation - MTN Mobile Money
     */
    public function test_validate_payment_data_mtn_mobile_money()
    {
        // Test valid phone number
        $this->paymentService->processSubscriptionPayment(
            User::factory()->create(),
            SubscriptionPlan::factory()->create(),
            PaymentService::METHOD_MTN_MOBILE_MONEY,
            ['phone_number' => '256701234567']
        );

        // This should not throw an exception
        $this->assertTrue(true);
    }

    /**
     * Test payment validation - Invalid phone number format
     */
    public function test_validate_payment_data_invalid_phone_format()
    {
        $user = User::factory()->create();
        $plan = SubscriptionPlan::factory()->create();

        $result = $this->paymentService->processSubscriptionPayment(
            $user,
            $plan,
            PaymentService::METHOD_MTN_MOBILE_MONEY,
            ['phone_number' => 'invalid-phone']
        );

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('Invalid phone number format', $result['message']);
    }

    /**
     * Test payment validation - Stripe
     */
    public function test_validate_payment_data_stripe_missing_token()
    {
        $user = User::factory()->create();
        $plan = SubscriptionPlan::factory()->create();

        $result = $this->paymentService->processSubscriptionPayment(
            $user,
            $plan,
            PaymentService::METHOD_STRIPE,
            []
        );

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('Payment token is required for card payments', $result['message']);
    }

    /**
     * Test payment validation - Bank Transfer
     */
    public function test_validate_payment_data_bank_transfer_missing_details()
    {
        $user = User::factory()->create();
        $plan = SubscriptionPlan::factory()->create();

        $result = $this->paymentService->processSubscriptionPayment(
            $user,
            $plan,
            PaymentService::METHOD_BANK_TRANSFER,
            ['account_number' => '123456789'] // Missing bank_code
        );

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('Account number and bank code are required', $result['message']);
    }

    /**
     * Test payment validation - Unsupported payment method
     */
    public function test_validate_payment_data_unsupported_method()
    {
        $user = User::factory()->create();
        $plan = SubscriptionPlan::factory()->create();

        $result = $this->paymentService->processSubscriptionPayment(
            $user,
            $plan,
            'unsupported_method',
            []
        );

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('Unsupported payment method', $result['message']);
    }

    /**
     * Test payment reference generation uniqueness
     */
    public function test_payment_reference_generation_uniqueness()
    {
        $user = User::factory()->create();
        $plan = SubscriptionPlan::factory()->create();

        $this->mobileMoneyServiceMock
            ->shouldReceive('initiatePayment')
            ->twice()
            ->andReturn(['success' => true, 'message' => 'Payment processed successfully']);

        // Create two payments
        $result1 = $this->paymentService->processSubscriptionPayment(
            $user,
            $plan,
            PaymentService::METHOD_MTN_MOBILE_MONEY,
            ['phone_number' => '256701234567']
        );

        $result2 = $this->paymentService->processSubscriptionPayment(
            $user,
            $plan,
            PaymentService::METHOD_MTN_MOBILE_MONEY,
            ['phone_number' => '256701234567']
        );

        // Get the payments
        $payment1 = Payment::find($result1['payment_id']);
        $payment2 = Payment::find($result2['payment_id']);

        // Assert references are different
        $this->assertNotEquals($payment1->payment_reference, $payment2->payment_reference);
        $this->assertStringStartsWith('PAY_', $payment1->payment_reference);
        $this->assertStringStartsWith('PAY_', $payment2->payment_reference);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}