<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventAttendee;
use App\Models\Payment;
use App\Services\Payment\MobileMoneyService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    protected MobileMoneyService $mobileMoneyService;

    public function __construct(MobileMoneyService $mobileMoneyService)
    {
        $this->mobileMoneyService = $mobileMoneyService;
    }

    public function initiate(Request $request, Event $event)
    {
        if (!Auth::check()) {
            return redirect()->route('frontend.login');
        }

        // Get user's pending registration
        $attendee = $event->attendees()
            ->where('user_id', Auth::id())
            ->where('status', 'pending')
            ->where('payment_status', 'pending')
            ->with(['eventTicket'])
            ->first();

        if (!$attendee) {
            return redirect()->route('frontend.events.show', $event)
                ->with('error', 'No pending registration found.');
        }

        $request->validate([
            'payment_method' => 'required|in:mobile_money,card',
            'provider' => 'required_if:payment_method,mobile_money|in:mtn,airtel',
            'phone_number' => 'required_if:payment_method,mobile_money|string|regex:/^[0-9+\-\s()]+$/',
        ]);

        try {
            DB::transaction(function () use ($request, $attendee) {
                // Create payment record
                $payment = Payment::createForAttendee($attendee, [
                    'payment_method' => $request->payment_method,
                    'provider' => $request->provider,
                    'phone_number' => $request->phone_number,
                ]);

                // Process payment based on method
                if ($request->payment_method === 'mobile_money') {
                    $this->processMobileMoneyPayment($payment);
                } else {
                    // Handle other payment methods (card, etc.)
                    throw new \Exception('Payment method not yet implemented');
                }
            });

            return redirect()->route('frontend.payments.status', [
                'event' => $event,
                'payment' => $payment ?? null
            ])->with('success', 'Payment initiated successfully. Please check your phone for payment prompt.');

        } catch (\Exception $e) {
            Log::error('Payment initiation failed', [
                'event_id' => $event->id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return redirect()->back()
                ->with('error', 'Payment initiation failed: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function status(Request $request, Event $event, Payment $payment = null)
    {
        if (!Auth::check()) {
            return redirect()->route('frontend.login');
        }

        // If no payment specified, get the latest payment for this user and event
        if (!$payment) {
            $attendee = $event->attendees()
                ->where('user_id', Auth::id())
                ->latest()
                ->first();

            if (!$attendee) {
                return redirect()->route('frontend.events.show', $event)
                    ->with('error', 'No registration found.');
            }

            $payment = Payment::where('payable_type', EventAttendee::class)
                ->where('payable_id', $attendee->id)
                ->latest()
                ->first();
        }

        if (!$payment) {
            return redirect()->route('frontend.events.show', $event)
                ->with('error', 'No payment found.');
        }

        // Verify payment belongs to current user
        if ($payment->user_id !== Auth::id()) {
            abort(403);
        }

        return view('frontend.payments.status', compact('event', 'payment'));
    }

    public function checkStatus(Request $request, Event $event, Payment $payment)
    {
        if (!Auth::check() || $payment->user_id !== Auth::id()) {
            abort(403);
        }

        try {
            if ($payment->payment_method === 'mobile_money') {
                $result = $this->mobileMoneyService->checkPaymentStatus($payment);
            } else {
                throw new \Exception('Payment method not supported for status check');
            }

            return response()->json([
                'success' => true,
                'payment_status' => $payment->fresh()->status,
                'status_text' => $payment->fresh()->status_text,
                'message' => $result['message'] ?? 'Status checked successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Payment status check failed', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to check payment status'
            ], 500);
        }
    }

    public function webhook(Request $request)
    {
        // ✅ SECURITY FIX: Verify webhook signature before processing
        if (!$this->verifyWebhookSignature($request)) {
            Log::warning('Invalid webhook signature', [
                'ip' => $request->ip(),
                'headers' => $request->headers->all()
            ]);
            return response()->json(['error' => 'Invalid signature'], 401);
        }

        // Handle payment provider webhooks
        Log::info('Payment webhook received', [
            'headers' => $request->headers->all(),
            'body' => $request->all()
        ]);

        $provider = $request->header('X-Provider') ?? $request->get('provider');

        try {
            switch ($provider) {
                case 'mtn':
                    return $this->handleMtnWebhook($request);
                case 'airtel':
                    return $this->handleAirtelWebhook($request);
                case 'zengapay':
                    return $this->handleZengaPayWebhook($request);
                default:
                    Log::warning('Unknown webhook provider', ['provider' => $provider]);
                    return response()->json(['status' => 'ignored'], 200);
            }
        } catch (\Exception $e) {
            Log::error('Webhook processing failed', [
                'provider' => $provider,
                'error' => $e->getMessage()
            ]);

            return response()->json(['status' => 'error'], 500);
        }
    }

    /**
     * Verify webhook signature to prevent tampering
     */
    protected function verifyWebhookSignature(Request $request): bool
    {
        $signature = $request->header('X-Signature') ?? $request->header('X-Webhook-Signature');
        $payload = $request->getContent();
        $provider = $request->header('X-Provider') ?? $request->get('provider');

        if (!$signature) {
            Log::warning('Webhook received without signature', ['provider' => $provider]);
            return false;
        }

        // Get secret key based on provider
        $secretKey = match($provider) {
            'mtn' => config('services.mtn.webhook_secret'),
            'airtel' => config('services.airtel.webhook_secret'),
            'zengapay' => config('payments.zengapay.webhook_secret'),
            default => config('services.payment.webhook_secret')
        };

        if (!$secretKey) {
            Log::error('Webhook secret not configured for provider', ['provider' => $provider]);
            // In development, allow if no secret is set (log warning)
            if (config('app.env') === 'local') {
                Log::warning('Webhook signature verification skipped in development');
                return true;
            }
            return false;
        }

        // Calculate expected signature
        $expectedSignature = hash_hmac('sha256', $payload, $secretKey);

        // Use timing-safe comparison to prevent timing attacks
        if (!hash_equals($expectedSignature, $signature)) {
            Log::warning('Webhook signature mismatch', [
                'provider' => $provider,
                'expected' => substr($expectedSignature, 0, 10) . '...',
                'received' => substr($signature, 0, 10) . '...'
            ]);
            return false;
        }

        return true;
    }

    protected function processMobileMoneyPayment(Payment $payment): void
    {
        // Validate phone number for the specific provider
        if (!$this->mobileMoneyService->validatePhoneNumber($payment->phone_number, $payment->provider)) {
            throw new \Exception('Invalid phone number for ' . strtoupper($payment->provider) . ' network');
        }

        $result = $this->mobileMoneyService->initiatePayment($payment);

        if (!$result['success']) {
            throw new \Exception($result['message'] ?? 'Payment initiation failed');
        }
    }

    protected function handleMtnWebhook(Request $request): \Illuminate\Http\JsonResponse
    {
        $transactionId = $request->get('external_id');
        $status = $request->get('status');

        $payment = Payment::where('transaction_id', $transactionId)->first();

        if (!$payment) {
            Log::warning('MTN webhook for unknown payment', ['transaction_id' => $transactionId]);
            return response()->json(['status' => 'not_found'], 404);
        }

        switch (strtoupper($status)) {
            case 'SUCCESSFUL':
            case 'SUCCESS':
                $payment->markAsCompleted([
                    'external_transaction_id' => $request->get('financial_transaction_id'),
                    'provider_reference' => $request->get('reference'),
                    'payment_data' => ['webhook_data' => $request->all()]
                ]);
                break;

            case 'FAILED':
            case 'REJECTED':
                $payment->markAsFailed(
                    $request->get('reason', 'Payment failed'),
                    ['payment_data' => ['webhook_data' => $request->all()]]
                );
                break;
        }

        return response()->json(['status' => 'processed'], 200);
    }

    protected function handleAirtelWebhook(Request $request): \Illuminate\Http\JsonResponse
    {
        $transactionId = $request->get('transaction.id');
        $status = $request->get('transaction.status');

        $payment = Payment::where('transaction_id', $transactionId)->first();

        if (!$payment) {
            Log::warning('Airtel webhook for unknown payment', ['transaction_id' => $transactionId]);
            return response()->json(['status' => 'not_found'], 404);
        }

        switch (strtoupper($status)) {
            case 'SUCCESSFUL':
            case 'SUCCESS':
                $payment->markAsCompleted([
                    'external_transaction_id' => $request->get('transaction.airtel_money_id'),
                    'provider_reference' => $request->get('transaction.id'),
                    'payment_data' => ['webhook_data' => $request->all()]
                ]);
                break;

            case 'FAILED':
            case 'REJECTED':
                $payment->markAsFailed(
                    $request->get('transaction.message', 'Payment failed'),
                    ['payment_data' => ['webhook_data' => $request->all()]]
                );
                break;
        }

        return response()->json(['status' => 'processed'], 200);
    }

    /**
     * Handle ZengaPay webhook
     * ZengaPay sends webhooks for collection and transfer status updates
     */
    protected function handleZengaPayWebhook(Request $request): \Illuminate\Http\JsonResponse
    {
        $data = $request->all();
        $webhookData = $data['data'] ?? $data;
        
        $transactionReference = $webhookData['transactionReference'] ?? $webhookData['external_reference'] ?? null;
        $transactionId = $webhookData['transactionSystemId'] ?? $webhookData['transaction_id'] ?? null;
        $status = $webhookData['transactionStatus'] ?? $webhookData['status'] ?? null;
        $event = $data['event'] ?? null;

        Log::info('ZengaPay webhook processing', [
            'event' => $event,
            'status' => $status,
            'reference' => $transactionReference,
            'transaction_id' => $transactionId,
        ]);

        // Find payment by reference or transaction ID
        $payment = Payment::where('transaction_reference', $transactionReference)
            ->orWhere('payment_reference', $transactionReference)
            ->orWhere('provider_transaction_id', $transactionId)
            ->first();

        if (!$payment) {
            Log::warning('ZengaPay webhook for unknown payment', [
                'transaction_reference' => $transactionReference,
                'transaction_id' => $transactionId,
            ]);
            // Return 202 to acknowledge but indicate not found
            return response()->json(['status' => 'not_found'], 202);
        }

        // Map ZengaPay status to our status
        $mappedStatus = $this->mapZengaPayStatus($status, $event);

        switch ($mappedStatus) {
            case 'completed':
                $payment->markAsCompleted([
                    'external_transaction_id' => $transactionId,
                    'provider_reference' => $transactionReference,
                    'payment_data' => ['webhook_data' => $data]
                ]);
                break;

            case 'failed':
                $payment->markAsFailed(
                    $webhookData['failureReason'] ?? $webhookData['reason'] ?? 'Payment failed',
                    ['payment_data' => ['webhook_data' => $data]]
                );
                break;

            case 'cancelled':
                $payment->markAsCancelled();
                break;

            case 'pending':
                // Update to processing if still pending
                if ($payment->status === 'pending') {
                    $payment->markAsProcessing();
                }
                break;
        }

        // Return 202 Accepted as recommended by ZengaPay
        return response()->json(['status' => 'processed'], 202);
    }

    /**
     * Map ZengaPay status to internal status
     */
    protected function mapZengaPayStatus(?string $status, ?string $event): string
    {
        // Check event first
        if ($event) {
            $eventStatus = match (strtolower($event)) {
                'collection.success', 'transfer.success' => 'completed',
                'collection.failed', 'transfer.failed' => 'failed',
                'collection.pending', 'transfer.pending' => 'pending',
                'collection.cancelled', 'transfer.cancelled' => 'cancelled',
                default => null,
            };

            if ($eventStatus) {
                return $eventStatus;
            }
        }

        // Fall back to status field
        return match (strtoupper($status ?? '')) {
            'SUCCEEDED', 'SUCCESS', 'SUCCESSFUL', 'COMPLETED' => 'completed',
            'FAILED', 'FAILURE', 'ERROR' => 'failed',
            'PENDING', 'PROCESSING', 'INITIATED' => 'pending',
            'CANCELLED', 'CANCELED', 'REJECTED' => 'cancelled',
            'EXPIRED', 'TIMEOUT' => 'failed',
            default => 'pending',
        };
    }
}