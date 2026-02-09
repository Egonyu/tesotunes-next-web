<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Services\PaymentService;
use App\Services\Payment\MobileMoneyService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SubscriptionController extends Controller
{
    protected PaymentService $paymentService;
    protected MobileMoneyService $mobileMoneyService;

    public function __construct(
        PaymentService $paymentService,
        MobileMoneyService $mobileMoneyService
    ) {
        $this->middleware('auth');
        $this->paymentService = $paymentService;
        $this->mobileMoneyService = $mobileMoneyService;
    }

    public function index()
    {
        $user = Auth::user();
        $currentSubscription = $this->paymentService->getUserSubscription($user);
        
        return view('frontend.subscription.index', compact('currentSubscription'));
    }

    public function plans()
    {
        $plans = $this->paymentService->getAvailablePlans();
        
        return view('frontend.subscription.plans', compact('plans'));
    }

    public function subscribe(Request $request, $plan)
    {
        $validated = $request->validate([
            'payment_method' => 'required|in:mobile_money,credit,bank_transfer',
            'provider' => 'required_if:payment_method,mobile_money|in:mtn,airtel',
            'phone_number' => 'required_if:payment_method,mobile_money|string',
        ]);

        try {
            $subscription = $this->paymentService->createSubscription(
                Auth::user(),
                $plan,
                $validated
            );

            return redirect()
                ->route('frontend.subscription.index')
                ->with('success', 'Subscription activated successfully!');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    public function cancel(Request $request)
    {
        try {
            $this->paymentService->cancelSubscription(Auth::user());
            
            return redirect()
                ->route('frontend.subscription.index')
                ->with('success', 'Subscription cancelled successfully');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function history()
    {
        $user = Auth::user();
        $history = $this->paymentService->getSubscriptionHistory($user);
        
        return view('frontend.subscription.history', compact('history'));
    }

    public function mobileMoney()
    {
        $providers = $this->mobileMoneyService->getAvailableProviders();
        
        return view('frontend.subscription.mobile-money', compact('providers'));
    }
}