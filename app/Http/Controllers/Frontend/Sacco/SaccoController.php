<?php

namespace App\Http\Controllers\Frontend\Sacco;

use App\Http\Controllers\Controller;
use App\Services\Sacco\SaccoMembershipService;
use App\Services\Sacco\SaccoAccountService;
use App\Services\Sacco\SaccoLoanService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SaccoController extends Controller
{
    protected SaccoMembershipService $membershipService;
    protected SaccoAccountService $accountService;
    protected SaccoLoanService $loanService;

    public function __construct(
        SaccoMembershipService $membershipService,
        SaccoAccountService $accountService,
        SaccoLoanService $loanService
    ) {
        $this->middleware('auth');
        $this->membershipService = $membershipService;
        $this->accountService = $accountService;
        $this->loanService = $loanService;
    }

    /**
     * SACCO Dashboard
     */
    public function dashboard()
    {
        $user = Auth::user();
        $member = $user->saccoMember;

        if (!$member) {
            return redirect()->route('frontend.sacco.register');
        }

        $stats = $this->membershipService->calculateMemberStats($member);
        $recentTransactions = $member->transactions()
            ->with('account')
            ->latest('transaction_date')
            ->limit(10)
            ->get();
        
        // Get loans for the dashboard
        $loans = $member->loans()->with('loanProduct')->latest()->get();
        
        // Calculate monthly growth data for the chart (last 6 months)
        $monthlyGrowth = $this->calculateMonthlyGrowth($member);
        $stats['monthly_growth'] = $monthlyGrowth['values'];
        $stats['growth_months'] = $monthlyGrowth['months'];
        $stats['growth_percentage'] = $monthlyGrowth['percentage'];
        
        // Get next dividend payout date
        $stats['next_dividend_date'] = $this->getNextDividendDate();

        return view('frontend.sacco.dashboard', compact('member', 'stats', 'recentTransactions', 'loans'));
    }
    
    /**
     * Calculate monthly growth for the chart
     */
    protected function calculateMonthlyGrowth($member): array
    {
        $months = [];
        $values = [];
        $startBalance = 0;
        
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $months[] = $date->format('M');
            
            // Get month-end balance (sum of all deposits minus withdrawals up to that date)
            $monthEndDate = $date->endOfMonth();
            $deposits = $member->transactions()
                ->where('type', 'deposit')
                ->where('transaction_date', '<=', $monthEndDate)
                ->sum('amount_ugx');
            
            $withdrawals = $member->transactions()
                ->where('type', 'withdrawal')
                ->where('transaction_date', '<=', $monthEndDate)
                ->sum('amount_ugx');
            
            $balance = ($deposits - $withdrawals) / 1000; // Convert to thousands
            $values[] = max(0, round($balance));
            
            if ($i === 5) {
                $startBalance = $balance;
            }
        }
        
        // Calculate growth percentage
        $endBalance = end($values);
        $percentage = $startBalance > 0 
            ? round((($endBalance - $startBalance) / $startBalance) * 100, 1) 
            : ($endBalance > 0 ? 100 : 0);
        
        return [
            'months' => $months,
            'values' => $values,
            'percentage' => ($percentage >= 0 ? '+' : '') . $percentage . '%',
        ];
    }
    
    /**
     * Get next dividend payout date
     */
    protected function getNextDividendDate(): string
    {
        // Dividends are typically paid at year end
        $currentYear = now()->year;
        $yearEnd = now()->setMonth(12)->setDay(31)->setYear($currentYear);
        
        if (now()->gt($yearEnd)) {
            $yearEnd = $yearEnd->addYear();
        }
        
        return $yearEnd->format('M jS');
    }

    /**
     * Join SACCO (Membership Application)
     */
    public function showJoinForm()
    {
        $user = Auth::user();

        if ($user->saccoMember) {
            return redirect()->route('frontend.sacco.dashboard')
                ->with('info', 'You are already a SACCO member');
        }

        $eligibility = $this->membershipService->checkEligibility($user);

        return view('frontend.sacco.join', compact('eligibility'));
    }

    /**
     * Process Membership Application
     */
    public function join(Request $request)
    {
        $validated = $request->validate([
            'membership_type' => 'required|in:regular,associate',
            'terms_accepted' => 'required|accepted',
        ]);

        try {
            $member = $this->membershipService->registerMember(Auth::user(), $validated);

            return redirect()->route('frontend.sacco.dashboard')
                ->with('success', 'SACCO membership application submitted. Awaiting approval.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Account Overview
     */
    public function accounts()
    {
        $member = Auth::user()->saccoMember;

        if (!$member) {
            return redirect()->route('frontend.sacco.register');
        }

        $accounts = $member->accounts()->with('transactions')->get();

        return view('frontend.sacco.accounts', compact('member', 'accounts'));
    }

    /**
     * Account Details & Transactions
     */
    public function accountDetails($accountId)
    {
        $member = Auth::user()->saccoMember;
        $account = $member->accounts()->findOrFail($accountId);
        
        $transactions = $this->accountService->getTransactionHistory($account, 50);

        return view('frontend.sacco.account-details', compact('account', 'transactions'));
    }

    /**
     * Deposit Form
     */
    public function showDepositForm($accountId)
    {
        $member = Auth::user()->saccoMember;
        $account = $member->accounts()->findOrFail($accountId);

        return view('frontend.sacco.deposit', compact('account'));
    }

    /**
     * Process Deposit (Mobile Money Integration)
     */
    public function deposit(Request $request, $accountId)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1000',
            'payment_method' => 'required|in:mtn_mobile_money,airtel_money,bank_transfer',
            'phone_number' => 'required_if:payment_method,mtn_mobile_money,airtel_money|regex:/^256[0-9]{9}$/',
        ]);

        $member = Auth::user()->saccoMember;
        $account = $member->accounts()->findOrFail($accountId);

        try {
            // TODO: Integrate with Mobile Money API
            // For now, create pending transaction
            
            $transaction = $this->accountService->deposit($account, $validated['amount'], [
                'description' => 'Deposit via ' . $validated['payment_method'],
                'payment_method' => $validated['payment_method'],
            ]);

            return redirect()->route('sacco.account.details', $accountId)
                ->with('success', 'Deposit successful! Amount: UGX ' . number_format($validated['amount'], 2));
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Withdrawal Form
     */
    public function showWithdrawalForm($accountId)
    {
        $member = Auth::user()->saccoMember;
        $account = $member->accounts()->findOrFail($accountId);

        return view('frontend.sacco.withdrawal', compact('account'));
    }

    /**
     * Process Withdrawal
     */
    public function withdraw(Request $request, $accountId)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1000',
            'withdrawal_method' => 'required|in:mtn_mobile_money,airtel_money,bank_transfer',
            'phone_number' => 'required_if:withdrawal_method,mtn_mobile_money,airtel_money|regex:/^256[0-9]{9}$/',
            'description' => 'required|string|max:255',
        ]);

        $member = Auth::user()->saccoMember;
        $account = $member->accounts()->findOrFail($accountId);

        try {
            $transaction = $this->accountService->withdraw($account, $validated['amount'], $validated['description']);

            // TODO: Integrate with Mobile Money API for disbursement

            return redirect()->route('sacco.account.details', $accountId)
                ->with('success', 'Withdrawal successful! Amount: UGX ' . number_format($validated['amount'], 2));
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Loan Products List
     */
    public function loanProducts()
    {
        $member = Auth::user()->saccoMember;
        $loanProducts = $this->loanService->getLoanProductsWithStats();

        return view('frontend.sacco.loan-products', compact('member', 'loanProducts'));
    }

    /**
     * Loan Application Form
     */
    public function showLoanApplicationForm($productId)
    {
        $member = Auth::user()->saccoMember;
        $loanProduct = \App\Models\Sacco\SaccoLoanProduct::findOrFail($productId);
        
        $eligibility = $this->loanService->checkLoanEligibility($member, $loanProduct->min_amount);

        return view('frontend.sacco.loan-apply', compact('member', 'loanProduct', 'eligibility'));
    }

    /**
     * Submit Loan Application
     */
    public function applyForLoan(Request $request)
    {
        $validated = $request->validate([
            'loan_product_id' => 'required|exists:sacco_loan_products,id',
            'principal_amount' => 'required|numeric|min:10000',
            'term_months' => 'required|integer|min:1',
            'purpose' => 'required|string|max:500',
            'guarantors' => 'nullable|array',
            'guarantors.*' => 'exists:users,id',
        ]);

        $member = Auth::user()->saccoMember;

        try {
            $loan = $this->loanService->applyForLoan($member, $validated);

            return redirect()->route('sacco.loans')
                ->with('success', 'Loan application submitted successfully. Application ID: ' . $loan->loan_number);
        } catch (\Exception $e) {
            return back()->withInput()->with('error', $e->getMessage());
        }
    }

    /**
     * My Loans
     */
    public function loans()
    {
        $member = Auth::user()->saccoMember;
        $loans = $member->loans()->with('loanProduct')->latest()->get();

        return view('frontend.sacco.loans', compact('member', 'loans'));
    }

    /**
     * Loan Details & Repayment Schedule
     */
    public function loanDetails($loanId)
    {
        $member = Auth::user()->saccoMember;
        $loan = $member->loans()->with('loanProduct')->findOrFail($loanId);
        
        $schedule = $this->loanService->calculateLoanSchedule($loan);

        return view('frontend.sacco.loan-details', compact('loan', 'schedule'));
    }

    /**
     * Loan Repayment Form
     */
    public function showRepaymentForm($loanId)
    {
        $member = Auth::user()->saccoMember;
        $loan = $member->loans()->findOrFail($loanId);

        return view('frontend.sacco.loan-repayment', compact('loan'));
    }

    /**
     * Process Loan Repayment
     */
    public function repayLoan(Request $request, $loanId)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1000',
            'payment_method' => 'required|in:checking_account,mtn_mobile_money,airtel_money',
        ]);

        $member = Auth::user()->saccoMember;
        $loan = $member->loans()->findOrFail($loanId);

        try {
            $transaction = $this->loanService->recordRepayment($loan, $validated['amount']);

            return redirect()->route('sacco.loan.details', $loanId)
                ->with('success', 'Repayment successful! Amount: UGX ' . number_format($validated['amount'], 2));
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Dividends History
     */
    public function dividends()
    {
        $member = Auth::user()->saccoMember;
        
        // Get member dividends from database
        $memberDividends = \App\Models\Sacco\SaccoMemberDividend::where('member_id', $member->id)
            ->with('dividend')
            ->latest()
            ->get();
        
        // Calculate stats
        $totalEarned = $memberDividends->where('status', 'paid')->sum('net_amount');
        $thisYear = $memberDividends->where('year', date('Y'))->where('status', 'paid')->sum('net_amount');
        $thisYearCount = $memberDividends->where('year', date('Y'))->where('status', 'paid')->count();
        $lastDividend = $memberDividends->where('status', 'paid')->first();
        
        $stats = [
            'total_earned' => $totalEarned,
            'distribution_count' => $memberDividends->where('status', 'paid')->count(),
            'this_year' => $thisYear,
            'this_year_count' => $thisYearCount,
            'last_amount' => $lastDividend?->net_amount ?? 0,
            'last_date' => $lastDividend?->paid_at,
            'average' => $memberDividends->where('status', 'paid')->count() > 0 
                ? $totalEarned / $memberDividends->where('status', 'paid')->count() 
                : 0,
        ];
        
        $settings = [
            'dividend_frequency' => config('sacco.dividend_frequency', 'annually'),
        ];

        return view('frontend.sacco.dividends', compact('member', 'memberDividends', 'stats', 'settings'));
    }

    /**
     * Transaction History
     */
    public function transactions()
    {
        $member = Auth::user()->saccoMember;
        $transactions = $member->transactions()
            ->with('account')
            ->latest('transaction_date')
            ->paginate(50);

        return view('frontend.sacco.transactions', compact('member', 'transactions'));
    }

    /**
     * Account Statement
     */
    public function statement(Request $request, $accountId)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $member = Auth::user()->saccoMember;
        $account = $member->accounts()->findOrFail($accountId);

        $statement = $this->accountService->getAccountStatement(
            $account,
            \Carbon\Carbon::parse($validated['start_date']),
            \Carbon\Carbon::parse($validated['end_date'])
        );

        return view('frontend.sacco.statement', compact('statement'));
    }
}
