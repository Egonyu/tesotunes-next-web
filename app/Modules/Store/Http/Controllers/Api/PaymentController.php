<?php

namespace App\Modules\Store\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Modules\Store\Models\Order;
use App\Notifications\Store\StorePaymentNotification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

/**
 * Payment API Controller
 * 
 * Handles payment processing for store orders
 */
class PaymentController extends Controller
{
    /**
     * Initiate payment for order
     */
    public function initiate(Request $request, string $orderNumber): JsonResponse
    {
        $validated = $request->validate([
            'payment_method' => 'required|in:mobile_money,credits,bank_transfer',
            'phone_number' => 'required_if:payment_method,mobile_money|string',
            'provider' => 'required_if:payment_method,mobile_money|in:mtn,airtel',
        ]);

        $order = Order::where('order_number', $orderNumber)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if ($order->payment_status === 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'Order already paid'
            ], 422);
        }

        try {
            if ($validated['payment_method'] === 'mobile_money') {
                // TODO: Integrate with Mobile Money API
                $paymentReference = 'PMT-' . strtoupper(uniqid());
                
                $order->update([
                    'payment_reference' => $paymentReference,
                    'payment_provider' => $validated['provider'],
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Payment initiated. Please check your phone to complete payment.',
                    'data' => [
                        'payment_reference' => $paymentReference,
                        'order_number' => $order->order_number,
                    ]
                ]);
            } elseif ($validated['payment_method'] === 'credits') {
                // Deduct credits
                if ($request->user()->credits < $order->total_credits) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Insufficient credits'
                    ], 422);
                }

                $request->user()->decrement('credits', $order->total_credits);
                $order->update([
                    'payment_status' => 'paid',
                    'payment_method' => 'credits',
                    'paid_at' => now(),
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Payment successful',
                    'data' => [
                        'order_number' => $order->order_number,
                        'payment_method' => 'credits',
                    ]
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check payment status
     */
    public function status(Request $request, string $orderNumber): JsonResponse
    {
        $order = Order::where('order_number', $orderNumber)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => [
                'order_number' => $order->order_number,
                'payment_status' => $order->payment_status,
                'payment_method' => $order->payment_method,
                'payment_reference' => $order->payment_reference,
                'paid_at' => $order->paid_at,
            ]
        ]);
    }

    /**
     * Webhook for payment providers
     */
    public function webhook(Request $request): JsonResponse
    {
        // ✅ SECURITY FIX: Verify webhook signature before processing
        if (!$this->verifyWebhookSignature($request)) {
            Log::warning('Store: Invalid webhook signature', [
                'ip' => $request->ip(),
                'provider' => $request->header('X-Payment-Provider')
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Invalid signature'
            ], 401);
        }
        
        $provider = $request->header('X-Payment-Provider');
        $paymentReference = $request->input('reference');
        $status = $request->input('status');

        $order = Order::where('payment_reference', $paymentReference)->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }

        if ($status === 'successful' || $status === 'completed') {
            $order->update([
                'payment_status' => 'paid',
                'paid_at' => now(),
            ]);

            // Notify buyer about successful payment
            $order->user->notify(new StorePaymentNotification(
                recipientType: 'buyer',
                order: $order,
                amount: $order->total ?? 0,
                paymentMethod: $order->payment_provider ?? $provider,
                transactionId: $paymentReference
            ));

            // Notify seller(s) about the sale
            $this->notifySellers($order, $paymentReference);

            Log::info('Store payment successful', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'provider' => $provider
            ]);
        } elseif ($status === 'failed') {
            $order->update([
                'payment_status' => 'failed',
            ]);

            Log::warning('Store payment failed', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'provider' => $provider
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Webhook processed'
        ]);
    }

    /**
     * Verify webhook signature to prevent tampering
     */
    protected function verifyWebhookSignature(Request $request): bool
    {
        $signature = $request->header('X-Signature') ?? $request->header('X-Webhook-Signature');
        $payload = $request->getContent();
        $provider = $request->header('X-Payment-Provider');

        if (!$signature) {
            return false;
        }

        // Get secret key based on provider
        $secretKey = match($provider) {
            'mtn' => config('services.mtn.webhook_secret'),
            'airtel' => config('services.airtel.webhook_secret'),
            default => config('services.payment.webhook_secret')
        };

        if (!$secretKey) {
            // In development, allow if no secret is set (log warning)
            if (config('app.env') === 'local') {
                Log::warning('Store: Webhook signature verification skipped in development');
                return true;
            }
            return false;
        }

        // Calculate expected signature using HMAC SHA256
        $expectedSignature = hash_hmac('sha256', $payload, $secretKey);

        // Use timing-safe comparison to prevent timing attacks
        return hash_equals($expectedSignature, $signature);
    }

    /**
     * Get payment methods
     */
    public function methods(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'data' => [
                'methods' => [
                    [
                        'id' => 'mobile_money',
                        'name' => 'Mobile Money',
                        'enabled' => true,
                        'providers' => [
                            ['id' => 'mtn', 'name' => 'MTN Mobile Money'],
                            ['id' => 'airtel', 'name' => 'Airtel Money'],
                        ]
                    ],
                    [
                        'id' => 'credits',
                        'name' => 'Platform Credits',
                        'enabled' => true,
                        'balance' => $user->credits ?? 0,
                    ],
                    [
                        'id' => 'bank_transfer',
                        'name' => 'Bank Transfer',
                        'enabled' => config('store.payments.bank_transfer_enabled', false),
                    ],
                ]
            ]
        ]);
    }

    /**
     * Notify sellers about a successful sale
     */
    protected function notifySellers(Order $order, string $transactionId): void
    {
        // Get unique sellers from order items
        $sellerIds = $order->items()
            ->with('product.user')
            ->get()
            ->pluck('product.user')
            ->filter()
            ->unique('id');

        foreach ($sellerIds as $seller) {
            // Calculate seller's portion of the order
            $sellerTotal = $order->items()
                ->whereHas('product', fn($q) => $q->where('user_id', $seller->id))
                ->sum('total');

            $seller->notify(new StorePaymentNotification(
                recipientType: 'seller',
                order: $order,
                amount: $sellerTotal,
                paymentMethod: $order->payment_provider ?? 'mobile_money',
                transactionId: $transactionId
            ));
        }
    }
}
