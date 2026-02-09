<?php

namespace App\Http\Controllers\Backend\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\UserSubscription;
use App\Models\SubscriptionPlan;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    protected PaymentService $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Display the payments dashboard
     */
    public function index(Request $request)
    {
        return $this->payments($request);
    }

    public function payments(Request $request)
    {
        $query = Payment::with(['user', 'subscriptionPlan']);

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('payment_reference', 'LIKE', "%{$search}%")
                  ->orWhere('transaction_id', 'LIKE', "%{$search}%")
                  ->orWhereHas('user', function($userQuery) use ($search) {
                      $userQuery->where('name', 'LIKE', "%{$search}%")
                               ->orWhere('email', 'LIKE', "%{$search}%");
                  });
            });
        }

        // Filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        if ($request->filled('currency')) {
            $query->where('currency', $request->currency);
        }

        if ($request->filled('amount_min')) {
            $query->where('amount', '>=', $request->amount_min);
        }

        if ($request->filled('amount_max')) {
            $query->where('amount', '<=', $request->amount_max);
        }

        // Date filters
        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', $request->date_to);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $payments = $query->paginate($request->get('per_page', 25));

        // Enhanced summary statistics
        $stats = $this->getPaymentStats();

        // Filter options
        $statuses = ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'];
        $paymentMethods = ['mobile_money', 'mtn_mobile_money', 'airtel_money', 'zengapay', 'card', 'bank_transfer'];
        $currencies = ['UGX', 'USD', 'KES', 'TZS', 'EUR', 'GBP'];

        // Check which view exists
        $viewPath = view()->exists('admin.payments.index') ? 'admin.payments.index' : 'backend.payments.index';
        return view($viewPath, compact('payments', 'stats', 'statuses', 'paymentMethods', 'currencies'));
    }

    /**
     * Get comprehensive payment statistics
     */
    protected function getPaymentStats(): array
    {
        $now = now();
        $thisMonth = $now->copy()->startOfMonth();
        $lastMonth = $now->copy()->subMonth()->startOfMonth();
        $lastMonthEnd = $now->copy()->subMonth()->endOfMonth();

        // Basic counts
        $totalPayments = Payment::count();
        $completedPayments = Payment::where('status', 'completed')->count();
        $pendingPayments = Payment::whereIn('status', ['pending', 'processing'])->count();
        $failedPayments = Payment::where('status', 'failed')->count();
        $refundedPayments = Payment::where('status', 'refunded')->count();
        $cancelledPayments = Payment::where('status', 'cancelled')->count();

        // Revenue
        $totalRevenue = Payment::where('status', 'completed')->sum('amount');
        $monthlyRevenue = Payment::where('status', 'completed')
            ->where('completed_at', '>=', $thisMonth)
            ->sum('amount');
        $lastMonthRevenue = Payment::where('status', 'completed')
            ->whereBetween('completed_at', [$lastMonth, $lastMonthEnd])
            ->sum('amount');

        // Revenue trend
        $revenueTrend = $lastMonthRevenue > 0 
            ? (($monthlyRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100 
            : ($monthlyRevenue > 0 ? 100 : 0);

        // Success rate
        $totalAttempts = $completedPayments + $failedPayments;
        $successRate = $totalAttempts > 0 ? ($completedPayments / $totalAttempts) * 100 : 0;

        // Average completion time (in minutes)
        $avgCompletionTime = Payment::where('status', 'completed')
            ->whereNotNull('initiated_at')
            ->whereNotNull('completed_at')
            ->selectRaw('AVG(TIMESTAMPDIFF(MINUTE, initiated_at, completed_at)) as avg_time')
            ->value('avg_time') ?? 0;

        // Refund stats
        $totalRefunded = Payment::where('status', 'refunded')->sum('refund_amount') 
            ?? Payment::where('status', 'refunded')->sum('amount');

        // Provider breakdown
        $providerStats = Payment::where('status', 'completed')
            ->selectRaw('payment_provider, COUNT(*) as count, SUM(amount) as total')
            ->groupBy('payment_provider')
            ->get()
            ->keyBy('payment_provider')
            ->map(fn($item) => [
                'count' => $item->count,
                'total' => $item->total,
            ])
            ->toArray();

        // Top failure reasons
        $failureReasons = Payment::where('status', 'failed')
            ->whereNotNull('failure_reason')
            ->selectRaw('failure_reason, COUNT(*) as count')
            ->groupBy('failure_reason')
            ->orderByDesc('count')
            ->limit(5)
            ->pluck('count', 'failure_reason')
            ->toArray();

        // Today's stats
        $todayRevenue = Payment::where('status', 'completed')
            ->whereDate('completed_at', $now->toDateString())
            ->sum('amount');
        $todayPayments = Payment::whereDate('created_at', $now->toDateString())->count();

        // Weekly revenue for chart
        $weeklyRevenue = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = $now->copy()->subDays($i);
            $weeklyRevenue[$date->format('D')] = Payment::where('status', 'completed')
                ->whereDate('completed_at', $date->toDateString())
                ->sum('amount');
        }

        return [
            'total_payments' => $totalPayments,
            'completed_payments' => $completedPayments,
            'pending_payments' => $pendingPayments,
            'failed_payments' => $failedPayments,
            'refunded_payments' => $refundedPayments,
            'cancelled_payments' => $cancelledPayments,
            'total_revenue' => $totalRevenue,
            'monthly_revenue' => $monthlyRevenue,
            'last_month_revenue' => $lastMonthRevenue,
            'revenue_trend' => round($revenueTrend, 1),
            'success_rate' => round($successRate, 1),
            'avg_completion_time' => round($avgCompletionTime, 1),
            'total_refunded' => $totalRefunded,
            'provider_stats' => $providerStats,
            'failure_reasons' => $failureReasons,
            'today_revenue' => $todayRevenue,
            'today_payments' => $todayPayments,
            'weekly_revenue' => $weeklyRevenue,
        ];
    }

    public function showPayment(Payment $payment)
    {
        $payment->load(['user', 'subscriptionPlan']);

        return view('backend.payments.show', compact('payment'));
    }

    public function processRefund(Request $request, Payment $payment)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
            'amount' => 'nullable|numeric|min:0|max:' . $payment->amount,
        ]);

        try {
            $refundAmount = $request->amount ?? $payment->amount;
            $result = $this->paymentService->processRefund($payment, $refundAmount, $request->reason);

            if ($result['success']) {
                return back()->with('success', $result['message']);
            } else {
                return back()->withErrors(['error' => $result['message']]);
            }

        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function subscriptions(Request $request)
    {
        $query = UserSubscription::with(['user', 'subscriptionPlan', 'payment']);

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('user', function($userQuery) use ($search) {
                $userQuery->where('name', 'LIKE', "%{$search}%")
                         ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        // Filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('plan_id')) {
            $query->where('subscription_plan_id', $request->plan_id);
        }

        if ($request->filled('auto_renew')) {
            $query->where('auto_renew', $request->boolean('auto_renew'));
        }

        // Date filters
        if ($request->filled('expires_before')) {
            $query->where('ends_at', '<=', $request->expires_before);
        }

        if ($request->filled('expires_after')) {
            $query->where('ends_at', '>=', $request->expires_after);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $subscriptions = $query->paginate($request->get('per_page', 25));

        // Summary statistics
        $stats = [
            'total_subscriptions' => UserSubscription::count(),
            'active_subscriptions' => UserSubscription::where('status', 'active')->count(),
            'expired_subscriptions' => UserSubscription::where('status', 'expired')->count(),
            'cancelled_subscriptions' => UserSubscription::where('status', 'cancelled')->count(),
            'expiring_soon' => UserSubscription::where('status', 'active')
                ->where('ends_at', '<=', now()->addDays(7))
                ->count(),
            'monthly_revenue' => Payment::where('status', 'completed')
                ->whereMonth('completed_at', now()->month)
                ->sum('amount'),
        ];

        // Filter options
        $statuses = ['active', 'expired', 'cancelled', 'paused'];
        $plans = SubscriptionPlan::where('is_active', true)->orderBy('name')->get();

        return view('backend.subscriptions.index', compact('subscriptions', 'stats', 'statuses', 'plans'));
    }

    public function showSubscription(UserSubscription $subscription)
    {
        $subscription->load(['user', 'subscriptionPlan', 'payment']);

        return view('backend.subscriptions.show', compact('subscription'));
    }

    public function extendSubscription(Request $request, UserSubscription $subscription)
    {
        $request->validate([
            'extension_days' => 'required|integer|min:1|max:365',
            'reason' => 'required|string|max:500',
        ]);

        $newEndDate = $subscription->ends_at->addDays($request->extension_days);

        $subscription->update([
            'ends_at' => $newEndDate,
            'extension_reason' => $request->reason,
            'extended_at' => now(),
        ]);

        // Create notification for user
        $subscription->user->notifications()->create([
            'type' => 'subscription_extended',
            'title' => 'Subscription Extended',
            'message' => "Your subscription has been extended by {$request->extension_days} days.",
            'data' => [
                'subscription_id' => $subscription->id,
                'extension_days' => $request->extension_days,
                'new_end_date' => $newEndDate,
                'reason' => $request->reason,
            ],
        ]);

        return back()->with('success', 'Subscription extended successfully');
    }

    public function cancelSubscription(Request $request, UserSubscription $subscription)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
            'immediate' => 'boolean',
        ]);

        $updateData = [
            'status' => 'cancelled',
            'auto_renew' => false,
            'cancellation_reason' => $request->reason,
            'cancelled_at' => now(),
        ];

        if ($request->boolean('immediate')) {
            $updateData['ends_at'] = now();
        }

        $subscription->update($updateData);

        // Create notification for user
        $subscription->user->notifications()->create([
            'type' => 'subscription_cancelled',
            'title' => 'Subscription Cancelled',
            'message' => 'Your subscription has been cancelled by an administrator.',
            'data' => [
                'subscription_id' => $subscription->id,
                'reason' => $request->reason,
                'immediate' => $request->boolean('immediate'),
            ],
        ]);

        return back()->with('success', 'Subscription cancelled successfully');
    }

    public function subscriptionPlans(Request $request)
    {
        $query = SubscriptionPlan::withCount('userSubscriptions');

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        // Filters
        if ($request->filled('region')) {
            $query->where('region', $request->region);
        }

        if ($request->filled('currency')) {
            $query->where('currency', $request->currency);
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $plans = $query->orderBy('price_usd')->get();

        // Filter options
        $regions = SubscriptionPlan::distinct('region')->pluck('region')->filter()->sort();
        $currencies = SubscriptionPlan::distinct('currency')->pluck('currency')->filter()->sort();

        return view('backend.subscription-plans.index', compact('plans', 'regions', 'currencies'));
    }

    public function createSubscriptionPlan()
    {
        $regions = ['UG', 'KE', 'TZ', 'RW', 'INTL', 'ALL'];
        $currencies = ['UGX', 'KES', 'TZS', 'USD', 'EUR', 'GBP'];

        return view('backend.subscription-plans.create', compact('regions', 'currencies'));
    }

    public function storeSubscriptionPlan(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:subscription_plans',
            'description' => 'required|string|max:1000',
            'price_usd' => 'required|numeric|min:0',
            'price_local' => 'required|numeric|min:0',
            'currency' => 'required|string|max:3',
            'duration_days' => 'required|integer|min:1',
            'region' => 'required|string|max:10',
            'features' => 'required|array',
            'limits' => 'nullable|array',
            'is_trial' => 'boolean',
            'is_popular' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer',
        ]);

        SubscriptionPlan::create($request->all());

        return redirect()->route('backend.subscription-plans.index')
            ->with('success', 'Subscription plan created successfully');
    }

    public function editSubscriptionPlan(SubscriptionPlan $plan)
    {
        $regions = ['UG', 'KE', 'TZ', 'RW', 'INTL', 'ALL'];
        $currencies = ['UGX', 'KES', 'TZS', 'USD', 'EUR', 'GBP'];

        return view('backend.subscription-plans.edit', compact('plan', 'regions', 'currencies'));
    }

    public function updateSubscriptionPlan(Request $request, SubscriptionPlan $plan)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:subscription_plans,slug,' . $plan->id,
            'description' => 'required|string|max:1000',
            'price_usd' => 'required|numeric|min:0',
            'price_local' => 'required|numeric|min:0',
            'currency' => 'required|string|max:3',
            'duration_days' => 'required|integer|min:1',
            'region' => 'required|string|max:10',
            'features' => 'required|array',
            'limits' => 'nullable|array',
            'is_trial' => 'boolean',
            'is_popular' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $plan->update($request->all());

        return redirect()->route('backend.subscription-plans.index')
            ->with('success', 'Subscription plan updated successfully');
    }

    public function analytics(Request $request)
    {
        $dateRange = $request->get('range', '30'); // days
        $startDate = now()->subDays((int)$dateRange);

        // Revenue analytics
        $revenueData = Payment::where('status', 'completed')
            ->where('completed_at', '>=', $startDate)
            ->selectRaw('DATE(completed_at) as date, SUM(amount) as total, currency')
            ->groupBy('date', 'currency')
            ->orderBy('date')
            ->get();

        // Payment method analytics
        $paymentMethodData = Payment::where('status', 'completed')
            ->where('completed_at', '>=', $startDate)
            ->selectRaw('payment_method, COUNT(*) as count, SUM(amount) as total')
            ->groupBy('payment_method')
            ->get();

        // Subscription plan performance
        $planPerformance = SubscriptionPlan::withCount([
            'userSubscriptions',
            'userSubscriptions as active_subscriptions_count' => function($query) {
                $query->where('status', 'active');
            }
        ])->with(['userSubscriptions' => function($query) use ($startDate) {
            $query->where('created_at', '>=', $startDate);
        }])->get();

        // Country revenue breakdown
        $countryRevenue = Payment::where('payments.status', 'completed')
            ->where('payments.completed_at', '>=', $startDate)
            ->join('users', 'payments.user_id', '=', 'users.id')
            ->selectRaw('users.country, SUM(payments.amount) as total, COUNT(*) as count')
            ->groupBy('users.country')
            ->orderBy('total', 'desc')
            ->get();

        return view('backend.payments.analytics', compact(
            'revenueData',
            'paymentMethodData',
            'planPerformance',
            'countryRevenue',
            'dateRange'
        ));
    }

    /**
     * Process a pending payment
     */
    public function processPayment(Payment $payment)
    {
        if ($payment->status !== 'pending') {
            return back()->with('error', 'Only pending payments can be processed');
        }

        try {
            $payment->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);

            return back()->with('success', 'Payment processed successfully');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to process payment: ' . $e->getMessage());
        }
    }

    /**
     * Retry a failed payment
     */
    public function retryPayment(Payment $payment)
    {
        if ($payment->status !== 'failed') {
            return back()->with('error', 'Only failed payments can be retried');
        }

        try {
            $payment->update([
                'status' => 'pending',
            ]);

            return back()->with('success', 'Payment queued for retry');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to retry payment: ' . $e->getMessage());
        }
    }
}