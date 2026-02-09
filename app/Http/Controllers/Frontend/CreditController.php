<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Services\CreditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CreditController extends Controller
{
    protected CreditService $creditService;

    public function __construct(CreditService $creditService)
    {
        $this->middleware('auth');
        $this->creditService = $creditService;
    }

    public function index()
    {
        $user = Auth::user();
        $balance = $this->creditService->getBalance($user);
        $stats = $this->creditService->getUserCreditStats($user);
        
        return view('frontend.credits.index', [
            'balance' => $balance,
            'totalEarned' => $stats['totalEarned'],
            'totalSpent' => $stats['totalSpent'],
            'thisMonth' => $stats['thisMonth'],
            'recentTransactions' => $stats['recentTransactions'],
        ]);
    }

    public function earn()
    {
        $opportunities = $this->creditService->getEarningOpportunities();
        
        return view('frontend.credits.earn', compact('opportunities'));
    }

    public function spend()
    {
        $options = $this->creditService->getSpendingOptions();
        
        return view('frontend.credits.spend', compact('options'));
    }

    public function history(Request $request)
    {
        $user = Auth::user();
        $data = $this->creditService->getTransactionHistory(
            $user,
            $request->input('type'),
            $request->input('category'),
            $request->input('date')
        );
        
        return view('frontend.credits.history', [
            'transactions' => $data['transactions'],
            'totalEarned' => $data['totalEarned'],
            'totalSpent' => $data['totalSpent'],
            'thisMonth' => $data['thisMonth'],
        ]);
    }

    public function claimDaily(Request $request)
    {
        try {
            $result = $this->creditService->claimDailyBonus(Auth::user());
            
            return response()->json([
                'success' => true,
                'credits_earned' => $result['credits'],
                'new_balance' => $result['balance'],
                'message' => 'Daily bonus claimed successfully!'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        }
    }

    public function transfer(Request $request)
    {
        $validated = $request->validate([
            'recipient_id' => 'required|exists:users,id',
            'amount' => 'required|integer|min:1',
            'note' => 'nullable|string|max:255',
        ]);

        try {
            $result = $this->creditService->transferCredits(
                Auth::user(),
                $validated['recipient_id'],
                $validated['amount'],
                $validated['note'] ?? null
            );
            
            return response()->json([
                'success' => true,
                'new_balance' => $result['balance'],
                'message' => 'Credits transferred successfully!'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        }
    }
}