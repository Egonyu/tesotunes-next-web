<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Sacco\SaccoMember;
use App\Models\Sacco\SaccoLoan;
use App\Models\Sacco\SaccoLoanProduct;
use App\Models\Sacco\SaccoSavingsTransaction;
use App\Models\Sacco\SaccoSavingsAccount;
use App\Models\Sacco\SaccoMemberDividend;
use App\Models\Sacco\SaccoAutoSaveSettings;
use App\Services\Payment\ZengaPayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Carbon\Carbon;

class SaccoMemberController extends Controller
{
    /**
     * SACCO landing page
     * Guests see about page, logged-in users go to dashboard with auto-enrollment
     */
    public function landing()
    {
        if (!config('sacco.enabled', false)) {
            abort(503, 'SACCO module is currently unavailable.');
        }

        // Guests see about page (prevents redirect loop)
        if (!auth()->check()) {
            return view('frontend.sacco.about');
        }

        $user = auth()->user();
        
        // Auto-create membership if doesn't exist (non-blocking)
        if (!$user->isSaccoMember()) {
            try {
                $service = app(\App\Services\SaccoMembershipService::class);
                $member = $service->autoCreateMembership($user);
                
                // If membership created successfully, redirect to dashboard with welcome message
                if ($member) {
                    return redirect()->route('frontend.sacco.dashboard')
                        ->with('success', 'Welcome to LineOne Music SACCO! Your account has been created.');
                }
            } catch (\Exception $e) {
                // Log error but don't block user
                \Log::error('SACCO auto-enrollment failed', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        // Already a member or enrollment failed, go to dashboard anyway
        return redirect()->route('frontend.sacco.dashboard');
    }

    /**
     * About SACCO
     * Redirects to dashboard if user is already a SACCO member
     */
    public function about()
    {
        // If user is logged in and already a SACCO member, redirect to dashboard
        if (auth()->check() && auth()->user()->isSaccoMember()) {
            return redirect()->route('frontend.sacco.dashboard');
        }
        
        return view('frontend.sacco.about');
    }

    /**
     * Show join form
     */
    public function join()
    {
        $user = auth()->user();

        if ($user->isSaccoMember()) {
            return redirect()->route('frontend.sacco.dashboard');
        }

        if (!$user->canJoinSacco()) {
            return redirect()->back()->with('error', 'You are not eligible to join SACCO at this time.');
        }

        return view('frontend.sacco.join');
    }

    /**
     * Submit membership application
     */
    public function apply(Request $request)
    {
        $request->validate([
            'membership_type' => 'required|in:regular,associate,honorary',  // Fixed: Match database ENUM
            'next_of_kin_name' => 'nullable|string',
            'next_of_kin_phone' => 'nullable|string',
            'next_of_kin_relationship' => 'nullable|string',
            'employer_name' => 'nullable|string',
            'monthly_income_range' => 'nullable|in:0-500k,500k-1m,1m-3m,3m-5m,5m+',
        ]);

        DB::beginTransaction();
        try {
            $membershipNumber = $this->generateMembershipNumber();

            // Map frontend types to database ENUM if needed
            $membershipType = $request->membership_type;
            
            // Create member with only existing columns
            $member = SaccoMember::create([
                'user_id' => auth()->id(),
                'member_number' => $membershipNumber,
                'membership_type' => $membershipType,  // Now matches ENUM: regular, associate, honorary
                'status' => 'pending_approval',  // Match ENUM default
                'joined_date' => now(),  // Changed from application_date
                'approved_at' => now(),
                'total_shares' => 0,
                'total_savings' => 0,
                'total_loans' => 0,
            ]);

            // Store additional info in user profile or separate table if needed
            // Fields like next_of_kin, employer, etc. don't exist in sacco_members

            // Create default savings account
            SaccoSavingsAccount::create([
                'member_id' => $member->id,
                'account_number' => $this->generateAccountNumber('SAV'),
                'account_name' => $user->name . ' Savings',
                'account_type' => 'regular',
                'balance_ugx' => 0,
                'interest_rate' => config('sacco.default_interest_rate', 8.0),
                'status' => 'active'
            ]);

            DB::commit();

            return redirect()->route('frontend.sacco.dashboard')->with('success', 'Your SACCO membership application has been submitted for review.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to submit application: ' . $e->getMessage());
        }
    }

    /**
     * Member dashboard
     */
    public function dashboard()
    {
        $member = auth()->user()->saccoMember;

        if (!$member) {
            return redirect()->route('frontend.sacco.register');
        }

        // Load savings accounts with proper relationship
        $savingsAccounts = $member->savingsAccounts()->where('status', 'active')->get();
        $loans = $member->loans()->with('loanProduct')->latest()->get();
        
        // Get transactions from savings accounts
        $recentTransactions = SaccoSavingsTransaction::where('member_id', $member->id)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();
        $transactions = SaccoSavingsTransaction::where('member_id', $member->id)
            ->orderBy('created_at', 'desc')
            ->take(20)
            ->get();

        // Get loan products
        $loanProducts = SaccoLoanProduct::where('is_active', true)->get();

        // Get member dividends
        $memberDividends = SaccoMemberDividend::where('member_id', $member->id)
            ->orderBy('created_at', 'desc')
            ->get();
        $lastDividend = $memberDividends->first();
        
        // Get total dividend earned
        $totalDividendEarned = $memberDividends->where('status', 'paid')->sum('net_amount');
        $thisYearDividend = $memberDividends->where('year', now()->year)->sum('net_amount');

        // Calculate savings totals
        $totalSavings = $savingsAccounts->sum('balance_ugx');
        $totalInterestEarned = $savingsAccounts->sum('accrued_interest_ugx');
        
        // Get auto-save settings
        $autoSaveSettings = SaccoAutoSaveSettings::where('user_id', auth()->id())->first();
        
        // Calculate actual growth percentage from last month
        $currentBalance = $totalSavings;
        $lastMonthDate = Carbon::now()->subMonth();
        $lastMonthDeposits = SaccoSavingsTransaction::where('member_id', $member->id)
            ->where('created_at', '<', $lastMonthDate)
            ->where('type', 'deposit')
            ->where('status', 'completed')
            ->sum('amount_ugx');
        $lastMonthWithdrawals = SaccoSavingsTransaction::where('member_id', $member->id)
            ->where('created_at', '<', $lastMonthDate)
            ->where('type', 'withdrawal')
            ->where('status', 'completed')
            ->sum('amount_ugx');
        $lastMonthBalance = $lastMonthDeposits - $lastMonthWithdrawals;
        
        $growthPercentage = $lastMonthBalance > 0 
            ? round((($currentBalance - $lastMonthBalance) / $lastMonthBalance) * 100, 1)
            : ($currentBalance > 0 ? 100 : 0);
        
        // Get monthly growth data for last 6 months
        $monthlyGrowth = [];
        $monthLabels = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthStart = Carbon::now()->subMonths($i)->startOfMonth();
            $monthEnd = Carbon::now()->subMonths($i)->endOfMonth();
            $monthlyDeposits = SaccoSavingsTransaction::where('member_id', $member->id)
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->where('type', 'deposit')
                ->where('status', 'completed')
                ->sum('amount_ugx');
            $monthlyGrowth[] = (int) ($monthlyDeposits / 1000); // in thousands
            $monthLabels[] = $monthStart->format('M');
        }
        
        // Calculate loan eligibility (3x savings)
        $loanLimit = $totalSavings * 3;
        $activeLoans = $loans->whereIn('status', ['active', 'disbursed']);
        $totalActiveLoanBalance = $activeLoans->sum('balance_remaining_ugx');
        $availableLoanLimit = max(0, $loanLimit - $totalActiveLoanBalance);
        
        // Estimate annual dividend (12.5% of average balance)
        $estimatedAnnualDividend = $totalSavings * 0.125;
        $nextDividendDate = Carbon::create(now()->year, 12, 31);
        if ($nextDividendDate->isPast()) {
            $nextDividendDate = Carbon::create(now()->year + 1, 12, 31);
        }
        
        // Calculate membership duration
        $memberSince = $member->joined_at ?? $member->created_at;
        $membershipDays = $memberSince->diffInDays(now());
        $membershipMonths = $memberSince->diffInMonths(now());
        
        // Determine membership tier based on savings
        $membershipTier = match(true) {
            $totalSavings >= 5000000 => ['name' => 'Platinum', 'color' => 'purple', 'icon' => 'diamond'],
            $totalSavings >= 1000000 => ['name' => 'Gold', 'color' => 'yellow', 'icon' => 'workspace_premium'],
            $totalSavings >= 500000 => ['name' => 'Silver', 'color' => 'gray', 'icon' => 'military_tech'],
            default => ['name' => 'Bronze', 'color' => 'orange', 'icon' => 'star']
        };
        
        // Calculate credit score based on activity
        $baseScore = 500;
        $savingsBonus = min(150, $totalSavings / 50000); // Up to 150 points for savings
        $tenureBonus = min(100, $membershipMonths * 5); // Up to 100 points for tenure
        $transactionBonus = min(50, $transactions->count() * 5); // Up to 50 points for activity
        $loanRepaymentBonus = $loans->where('status', 'completed')->count() * 20; // 20 points per completed loan
        $creditScore = min(850, $baseScore + $savingsBonus + $tenureBonus + $transactionBonus + $loanRepaymentBonus);
        
        $stats = [
            'total_savings' => $totalSavings,
            'total_interest_earned' => $totalInterestEarned,
            'active_loans_count' => $activeLoans->count(),
            'total_borrowed' => $activeLoans->sum('principal_amount_ugx'),
            'total_loan_balance' => $totalActiveLoanBalance,
            'total_repaid' => $loans->sum('amount_paid_ugx'),
            'credit_score' => round($creditScore),
            'loan_limit' => $loanLimit,
            'available_loan_limit' => $availableLoanLimit,
            'estimated_annual_dividend' => $estimatedAnnualDividend,
            'total_dividend_earned' => $totalDividendEarned,
            'this_year_dividend' => $thisYearDividend,
            'growth_percentage' => $growthPercentage > 0 ? '+' . $growthPercentage . '%' : $growthPercentage . '%',
            'monthly_growth' => $monthlyGrowth,
            'growth_months' => $monthLabels,
            'dividend_yield' => 12.5,
            'membership_tier' => $membershipTier,
            'membership_days' => $membershipDays,
            'membership_months' => $membershipMonths,
            'next_dividend_date' => $nextDividendDate->format('M d, Y'),
            'accounts' => [
                'total_balance' => $totalSavings,
                'count' => $savingsAccounts->count(),
            ],
            'eligibility' => [
                'max_loan_eligibility' => $availableLoanLimit,
            ],
            'dividends' => [
                'pending_dividends' => round($estimatedAnnualDividend * (now()->month / 12)),
            ],
        ];

        return view('frontend.sacco.dashboard', compact(
            'member', 
            'savingsAccounts',
            'loans', 
            'recentTransactions',
            'transactions',
            'stats',
            'loanProducts',
            'lastDividend',
            'memberDividends',
            'autoSaveSettings'
        ));
    }

    /**
     * Modern financials dashboard
     */
    public function financials()
    {
        $member = auth()->user()->saccoMember;

        if (!$member) {
            return redirect()->route('frontend.sacco.register');
        }

        $accounts = $member->savingsAccounts()->where('status', 'active')->get();
        $loans = $member->loans()->with('loanProduct')->latest()->get();
        $recentTransactions = SaccoSavingsTransaction::where('member_id', $member->id)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();
        $transactions = SaccoSavingsTransaction::where('member_id', $member->id)
            ->orderBy('created_at', 'desc')
            ->take(20)
            ->get();

        // Get active loan
        $activeLoan = $loans->where('status', 'active')->first();

        // Get available loan products
        $loanProducts = SaccoLoanProduct::where('is_active', true)->get();

        // Get last dividend
        $lastDividend = SaccoMemberDividend::where('member_id', $member->id)
            ->orderBy('created_at', 'desc')
            ->first();

        // Calculate stats
        $totalSavings = $accounts->sum('balance_ugx');
        
        // Calculate actual growth percentage
        $currentBalance = $totalSavings;
        $lastMonthDate = Carbon::now()->subMonth();
        $lastMonthDeposits = SaccoSavingsTransaction::where('member_id', $member->id)
            ->where('created_at', '<', $lastMonthDate)
            ->where('type', 'deposit')
            ->where('status', 'completed')
            ->sum('amount_ugx');
        $lastMonthWithdrawals = SaccoSavingsTransaction::where('member_id', $member->id)
            ->where('created_at', '<', $lastMonthDate)
            ->where('type', 'withdrawal')
            ->where('status', 'completed')
            ->sum('amount_ugx');
        $lastMonthBalance = $lastMonthDeposits - $lastMonthWithdrawals;
        $growthPercentage = $lastMonthBalance > 0 
            ? round((($currentBalance - $lastMonthBalance) / $lastMonthBalance) * 100, 1)
            : ($currentBalance > 0 ? 100 : 0);
        
        // Get monthly growth data for last 6 months
        $monthlyGrowth = [];
        $monthLabels = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthStart = Carbon::now()->subMonths($i)->startOfMonth();
            $monthEnd = Carbon::now()->subMonths($i)->endOfMonth();
            $monthlyDeposits = SaccoSavingsTransaction::where('member_id', $member->id)
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->where('type', 'deposit')
                ->where('status', 'completed')
                ->sum('amount_ugx');
            $monthlyGrowth[] = (int) ($monthlyDeposits / 1000);
            $monthLabels[] = $monthStart->format('M');
        }
        
        $stats = [
            'total_savings' => $totalSavings,
            'loan_limit' => $totalSavings * 3, // 3x savings as loan limit
            'estimated_dividend' => $totalSavings * 0.125 / 12, // 12.5% annual / 12 months
            'growth_percentage' => $growthPercentage > 0 ? '+' . $growthPercentage . '%' : $growthPercentage . '%',
            'monthly_growth' => $monthlyGrowth,
            'growth_months' => $monthLabels,
            'dividend_yield' => 12.5,
        ];

        return view('frontend.sacco.financials', compact(
            'member', 
            'accounts', 
            'loans', 
            'recentTransactions',
            'transactions',
            'stats',
            'activeLoan',
            'loanProducts',
            'lastDividend'
        ));
    }

    /**
     * List accounts
     */
    public function accounts()
    {
        $member = auth()->user()->saccoMember;
        
        if (!$member) {
            return redirect()->route('frontend.sacco.register');
        }
        
        $accounts = $member->savingsAccounts()->get();
        
        // Calculate summary stats
        $totalBalance = $accounts->sum('balance_ugx');
        $activeAccounts = $accounts->where('status', 'active')->count();
        $interestEarned = SaccoSavingsTransaction::where('member_id', $member->id)
            ->where('type', 'interest')
            ->where('created_at', '>=', now()->startOfYear())
            ->sum('amount_ugx');

        return view('frontend.sacco.accounts.index', compact('accounts', 'totalBalance', 'activeAccounts', 'interestEarned'));
    }

    /**
     * Show account details
     */
    public function showAccount(SaccoSavingsAccount $account)
    {
        $this->authorize('view', $account);

        $transactions = SaccoSavingsTransaction::where('account_id', $account->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return view('frontend.sacco.accounts.show', compact('account', 'transactions'));
    }

    /**
     * Create deposit
     */
    public function createDeposit()
    {
        $member = auth()->user()->saccoMember;
        $accounts = $member->savingsAccounts ?? $member->accounts;
        
        // Get active account types from admin configuration
        $accountTypes = \App\Models\Sacco\SaccoAccountType::where('is_active', true)
            ->where('allow_deposits', true)
            ->orderBy('name')
            ->get()
            ->keyBy('code');

        return view('frontend.sacco.deposits.create', compact('accounts', 'accountTypes'));
    }

    /**
     * Store deposit - ZengaPay Mobile Money Integration
     */
    public function storeDeposit(Request $request)
    {
        $request->validate([
            'account_id' => 'required|exists:sacco_savings_accounts,id',
            'amount' => 'required|numeric|min:' . config('sacco.transactions.min_deposit', 5000),
            'phone' => ['required', 'regex:/^(\+256|0)[0-9]{9}$/'],
            'description' => 'nullable|string|max:255'
        ]);

        $user = auth()->user();
        $member = $user->saccoMember;
        
        // Find the savings account
        $account = SaccoSavingsAccount::findOrFail($request->account_id);
        
        // Verify the account belongs to the member
        if ($account->member_id !== $member->id) {
            return redirect()->back()->with('error', 'Invalid account selected.');
        }

        // Format phone number for ZengaPay
        $phone = $request->phone;
        if (str_starts_with($phone, '0')) {
            $phone = '+256' . substr($phone, 1);
        }

        DB::beginTransaction();
        try {
            // Generate transaction code
            $transactionCode = 'DEP' . strtoupper(Str::random(8)) . date('ymd');
            
            // Create pending transaction
            $transaction = SaccoSavingsTransaction::create([
                'uuid' => Str::uuid(),
                'transaction_code' => $transactionCode,
                'account_id' => $account->id,
                'member_id' => $member->id,
                'type' => 'deposit',
                'amount_ugx' => $request->amount,
                'balance_before_ugx' => $account->balance_ugx ?? 0,
                'balance_after_ugx' => ($account->balance_ugx ?? 0) + $request->amount,
                'description' => $request->description ?? 'SACCO Savings Deposit via Mobile Money',
                'status' => 'pending'
            ]);

            // Initiate ZengaPay collection
            $zengaPay = app(ZengaPayService::class);
            $paymentResult = $zengaPay->collect([
                'user_id' => $user->id,
                'amount' => $request->amount,
                'phone' => $phone,
                'description' => "SACCO Deposit - {$transactionCode}",
                'metadata' => [
                    'transaction_id' => $transaction->id,
                    'transaction_code' => $transactionCode,
                    'account_id' => $account->id,
                    'member_id' => $member->id,
                    'type' => 'sacco_deposit'
                ]
            ]);

            if ($paymentResult['success']) {
                // Update transaction with payment reference
                $transaction->update([
                    'reference_number' => $paymentResult['reference'] ?? $paymentResult['payment_id'] ?? null
                ]);

                DB::commit();

                return redirect()->route('frontend.sacco.transactions')
                    ->with('success', 'Deposit initiated! Please check your phone and enter your Mobile Money PIN to confirm payment of UGX ' . number_format($request->amount) . '.');
            } else {
                DB::rollBack();
                Log::error('ZengaPay collection failed', [
                    'user_id' => $user->id,
                    'amount' => $request->amount,
                    'phone' => $phone,
                    'error' => $paymentResult['message'] ?? 'Unknown error'
                ]);
                
                return redirect()->back()
                    ->withInput()
                    ->with('error', 'Payment initiation failed: ' . ($paymentResult['message'] ?? 'Please try again.'));
            }
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('SACCO deposit failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to process deposit: ' . $e->getMessage());
        }
    }

    /**
     * List loans
     */
    public function loans()
    {
        $member = auth()->user()->saccoMember;
        $loans = $member->loans()->with('loanProduct')->paginate(10);

        return view('frontend.sacco.loans.index', compact('loans'));
    }

    /**
     * Show loan products
     */
    public function loanProducts()
    {
        $products = SaccoLoanProduct::where('is_active', true)->get();

        return view('frontend.sacco.loans.products', compact('products'));
    }

    /**
     * Apply for loan
     */
    public function applyLoan()
    {
        $member = auth()->user()->saccoMember;
        
        if (!$member) {
            return redirect()->route('frontend.sacco.register');
        }
        
        if ($member->status !== 'active') {
            return redirect()->back()->with('error', 'Your membership must be active to apply for loans.');
        }

        $products = SaccoLoanProduct::where('is_active', true)->get();
        $savingsBalance = $member->savingsAccounts()->where('status', 'active')->sum('balance_ugx');
        $maxLoanAmount = $savingsBalance * config('sacco.loans.max_loan_to_savings_ratio', 3);

        return view('frontend.sacco.loans.apply', compact('products', 'savingsBalance', 'maxLoanAmount'));
    }

    /**
     * Submit loan application
     */
    public function submitLoanApplication(Request $request)
    {
        $request->validate([
            'loan_product_id' => 'required|exists:sacco_loan_products,id',
            'principal_amount' => 'required|numeric|min:' . config('sacco.loans.min_loan_amount', 50000),
            'repayment_period_months' => 'required|integer|min:3|max:36',
            'purpose' => 'required|string',
            'guarantor_member_ids' => 'nullable|array',
            'guarantor_member_ids.*' => 'exists:sacco_members,id',
            'auto_deduct_from_royalties' => 'boolean'
        ]);

        $member = auth()->user()->saccoMember;

        DB::beginTransaction();
        try {
            $loanNumber = $this->generateLoanNumber();
            $product = SaccoLoanProduct::find($request->loan_product_id);

            $loan = SaccoLoan::create([
                'member_id' => $member->id,
                'loan_product_id' => $request->loan_product_id,
                'loan_number' => $loanNumber,
                'principal_amount' => $request->principal_amount,
                'interest_rate' => $product->interest_rate,
                'repayment_period_months' => $request->repayment_period_months,
                'purpose' => $request->purpose,
                'status' => 'pending',
                'application_date' => now(),
                'auto_deduct_from_royalties' => $request->auto_deduct_from_royalties ?? false,
            ]);

            DB::commit();

            return redirect()->route('sacco.loans.show', $loan->id)->with('success', 'Loan application submitted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to submit loan application: ' . $e->getMessage());
        }
    }

    /**
     * Show loan details
     */
    public function showLoan(SaccoLoan $loan)
    {
        $this->authorize('view', $loan);

        $loan->load(['loanProduct', 'guarantors']);
        $repayments = $loan->repayments()->latest()->paginate(20);

        return view('frontend.sacco.loans.show', compact('loan', 'repayments'));
    }

    /**
     * Show payment page for loan
     */
    public function showPayment(SaccoLoan $loan)
    {
        $this->authorize('view', $loan);

        $loan->load(['loanProduct', 'repayments']);

        return view('frontend.sacco.loans.payment', compact('loan'));
    }

    /**
     * Show payment method selection page
     */
    public function showPaymentMethod(SaccoLoan $loan, Request $request)
    {
        $this->authorize('view', $loan);

        $loan->load(['loanProduct', 'repayments']);
        $member = auth()->user()->saccoMember;
        
        // Get amount from request (passed from payment page)
        $amount = $request->input('amount', $loan->monthly_payment);
        
        return view('frontend.sacco.loans.payment-method', compact('loan', 'member', 'amount'));
    }

    /**
     * List transactions
     */
    public function transactions()
    {
        $member = auth()->user()->saccoMember;
        $accounts = $member->savingsAccounts ?? collect();
        
        // Get transactions from savings accounts (sacco_savings_transactions table)
        $transactions = SaccoSavingsTransaction::where('member_id', $member->id)
            ->with('account')
            ->latest('created_at')
            ->paginate(20);
        
        // Calculate stats from completed transactions
        $completedTransactions = SaccoSavingsTransaction::where('member_id', $member->id)
            ->where('status', 'completed');
        
        $stats = [
            'total_deposits' => (clone $completedTransactions)->where('type', 'deposit')->sum('amount_ugx'),
            'deposit_count' => (clone $completedTransactions)->where('type', 'deposit')->count(),
            'total_withdrawals' => (clone $completedTransactions)->where('type', 'withdrawal')->sum('amount_ugx'),
            'withdrawal_count' => (clone $completedTransactions)->where('type', 'withdrawal')->count(),
            'total_interest' => (clone $completedTransactions)->where('type', 'interest')->sum('amount_ugx'),
            'interest_count' => (clone $completedTransactions)->where('type', 'interest')->count(),
            'total_fees' => (clone $completedTransactions)->where('type', 'fee')->sum('amount_ugx'),
            'fee_count' => (clone $completedTransactions)->where('type', 'fee')->count(),
        ];

        return view('frontend.sacco.transactions', compact('transactions', 'accounts', 'stats', 'member'));
    }

    /**
     * Generate membership number
     */
    private function generateMembershipNumber()
    {
        $prefix = config('sacco.membership.member_number_prefix', 'SACCO');
        $lastMember = SaccoMember::latest('id')->first();
        $nextNumber = $lastMember ? ($lastMember->id + 1) : 1;

        return $prefix . '-' . str_pad($nextNumber, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Generate account number
     */
    private function generateAccountNumber($type)
    {
        $lastAccount = SaccoSavingsAccount::latest('id')->first();
        $nextNumber = $lastAccount ? ($lastAccount->id + 1) : 1;

        return $type . '-' . str_pad($nextNumber, 8, '0', STR_PAD_LEFT);
    }

    /**
     * Generate loan number
     */
    private function generateLoanNumber()
    {
        $lastLoan = SaccoLoan::latest('id')->first();
        $nextNumber = $lastLoan ? ($lastLoan->id + 1) : 1;

        return 'LOAN-' . date('Y') . '-' . str_pad($nextNumber, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Member profile
     */
    public function profile()
    {
        $member = auth()->user()->saccoMember;

        return view('frontend.sacco.profile', compact('member'));
    }

    /**
     * List dividends
     */
    public function dividends()
    {
        $member = auth()->user()->saccoMember;
        $dividends = $member->dividendDistributions()->with('dividend')->get();

        return view('frontend.sacco.dividends', compact('dividends'));
    }

    /**
     * Update member profile
     */
    public function updateProfile(Request $request)
    {
        $member = auth()->user()->saccoMember;
        
        $validated = $request->validate([
            'next_of_kin_name' => 'nullable|string|max:255',
            'next_of_kin_phone' => 'nullable|string|max:20',
            'next_of_kin_relationship' => 'nullable|string|max:100',
            'employer_name' => 'nullable|string|max:255',
            'monthly_income_range' => 'nullable|string|max:50',
        ]);

        $member->update($validated);

        return back()->with('success', 'Profile updated successfully.');
    }

    /**
     * List deposits
     */
    public function deposits()
    {
        $member = auth()->user()->saccoMember;
        
        if (!$member) {
            return redirect()->route('frontend.sacco.register');
        }
        
        $deposits = SaccoSavingsTransaction::where('member_id', $member->id)
            ->where('type', 'deposit')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return view('frontend.sacco.deposits.index', compact('deposits'));
    }

    /**
     * Get account statement
     */
    public function accountStatement(SaccoSavingsAccount $account)
    {
        $member = auth()->user()->saccoMember;
        
        if (!$member) {
            return redirect()->route('frontend.sacco.register');
        }
        
        // Verify ownership
        if ($account->member_id !== $member->id) {
            abort(403, 'Unauthorized access to this account.');
        }

        $transactions = SaccoSavingsTransaction::where('account_id', $account->id)
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return view('frontend.sacco.accounts.statement', compact('account', 'transactions'));
    }

    /**
     * Show withdrawal form
     */
    public function createWithdrawal()
    {
        $member = auth()->user()->saccoMember;
        
        if (!$member) {
            return redirect()->route('frontend.sacco.register');
        }
        
        $accounts = $member->savingsAccounts()
            ->where('balance_ugx', '>', 0)
            ->where('status', 'active')
            ->get();
        
        // Calculate minimum balance that must be maintained
        $minimumBalance = config('sacco.minimum_balance', 5000);
        
        // Calculate pending withdrawals
        $pendingWithdrawals = SaccoSavingsTransaction::where('member_id', $member->id)
            ->where('type', 'withdrawal')
            ->where('status', 'pending')
            ->sum('amount_ugx');

        return view('frontend.sacco.withdrawals.create', compact('accounts', 'member', 'minimumBalance', 'pendingWithdrawals'));
    }

    /**
     * Process withdrawal request
     */
    public function storeWithdrawal(Request $request)
    {
        $validated = $request->validate([
            'account_id' => 'required|exists:sacco_savings_accounts,id',
            'amount' => 'required|numeric|min:1000',
            'reason' => 'nullable|string|max:500',
        ]);

        $member = auth()->user()->saccoMember;
        $account = SaccoSavingsAccount::find($validated['account_id']);

        // Verify ownership
        if ($account->member_id !== $member->id) {
            return back()->with('error', 'Unauthorized access to this account.');
        }

        // Check balance
        if ($account->balance_ugx < $validated['amount']) {
            return back()->with('error', 'Insufficient available balance.');
        }

        try {
            DB::transaction(function () use ($account, $validated, $member) {
                $balanceBefore = $account->balance_ugx;
                $balanceAfter = $balanceBefore - $validated['amount'];
                
                // Create pending withdrawal transaction
                SaccoSavingsTransaction::create([
                    'uuid' => (string) Str::uuid(),
                    'transaction_code' => 'WD-' . strtoupper(Str::random(10)),
                    'member_id' => $member->id,
                    'account_id' => $account->id,
                    'type' => 'withdrawal',
                    'amount_ugx' => $validated['amount'],
                    'balance_before_ugx' => $balanceBefore,
                    'balance_after_ugx' => $balanceAfter,
                    'description' => $validated['reason'] ?? 'Withdrawal request',
                    'status' => 'pending',
                ]);

                // Reserve the amount
                $account->decrement('balance_ugx', $validated['amount']);
            });

            return redirect()->route('frontend.sacco.accounts.index')->with('success', 'Withdrawal request submitted. Pending approval.');
        } catch (\Exception $e) {
            Log::error('Withdrawal request failed', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to submit withdrawal request.');
        }
    }

    /**
     * Process loan repayment
     */
    public function processRepayment(Request $request, SaccoLoan $loan)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1000',
            'payment_method' => 'required|in:mobile_money,bank_transfer,cash',
        ]);

        $member = auth()->user()->saccoMember;

        // Verify loan ownership
        if ($loan->member_id !== $member->id) {
            return back()->with('error', 'Unauthorized access to this loan.');
        }

        // Check loan is active
        if (!in_array($loan->status, ['disbursed', 'active'])) {
            return back()->with('error', 'This loan is not active.');
        }

        try {
            DB::transaction(function () use ($loan, $validated, $member) {
                // Create repayment transaction
                SaccoSavingsTransaction::create([
                    'member_id' => $member->id,
                    'type' => 'fee',  // Using 'fee' type for loan repayment
                    'amount_ugx' => $validated['amount'],
                    'description' => 'Loan repayment via ' . $validated['payment_method'] . ' for loan #' . $loan->loan_number,
                    'reference_number' => 'REP-' . strtoupper(Str::random(10)),
                    'status' => 'completed',
                ]);

                // Update loan balance
                $loan->decrement('outstanding_balance', $validated['amount']);
                $loan->increment('total_repaid', $validated['amount']);

                // Check if loan is fully paid
                if ($loan->outstanding_balance <= 0) {
                    $loan->update(['status' => 'paid']);
                }
            });

            return redirect()->route('sacco.loans.show', $loan)->with('success', 'Repayment of UGX ' . number_format($validated['amount']) . ' processed successfully.');
        } catch (\Exception $e) {
            Log::error('Loan repayment failed', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to process repayment.');
        }
    }

    /**
     * Phase 4: Convert Platform Credits to SACCO Cash
     */
    public function depositCreditsForm()
    {
        $user = auth()->user();
        $member = $user->saccoMember;

        if (!$member) {
            return redirect()->route('frontend.sacco.dashboard')->with('error', 'SACCO membership required.');
        }

        $config = config('sacco.credit_exchange');
        $userCredits = $user->credits_balance ?? 0;
        $exchangeRate = $config['rate'];
        $minConversion = $config['minimum_conversion'];
        $maxDaily = $config['maximum_conversion_daily'];

        // Get today's conversions
        $todayConversions = SaccoSavingsTransaction::where('member_id', $member->id)
            ->whereDate('created_at', today())
            ->where('description', 'LIKE', '%platform credits%')
            ->sum('amount_ugx');

        $remainingDaily = $maxDaily - ($todayConversions * $exchangeRate);

        return view('frontend.sacco.credits.convert', compact(
            'member', 'userCredits', 'exchangeRate', 'minConversion', 
            'maxDaily', 'remainingDaily', 'todayConversions'
        ));
    }

    /**
     * Phase 4: Process Credit to Cash Conversion
     */
    public function depositCredits(Request $request)
    {
        $validated = $request->validate([
            'credits_amount' => [
                'required',
                'integer',
                'min:' . config('sacco.credit_exchange.minimum_conversion', 1000),
                'max:' . config('sacco.credit_exchange.maximum_conversion_daily', 50000),
            ],
        ]);

        $user = auth()->user();
        $member = $user->saccoMember;
        $credits = $validated['credits_amount'];

        // Check SACCO membership
        if (!$member) {
            return back()->with('error', 'SACCO membership required for credit conversion.');
        }

        // Check credit balance
        if ($user->credits_balance < $credits) {
            return back()->with('error', 'Insufficient credits balance. You have ' . number_format($user->credits_balance) . ' credits.');
        }

        // Check daily limit
        $todayConversions = SaccoSavingsTransaction::where('member_id', $member->id)
            ->whereDate('created_at', today())
            ->where('description', 'LIKE', '%platform credits%')
            ->count();

        $maxDaily = config('sacco.credit_exchange.maximum_conversion_daily', 50000);
        if ($todayConversions + $credits > $maxDaily) {
            return back()->with('error', 'Daily conversion limit exceeded. Maximum ' . number_format($maxDaily) . ' credits per day.');
        }

        // Calculate cash amount
        $exchangeRate = config('sacco.credit_exchange.rate', 100);
        $cashAmount = $credits / $exchangeRate;
        $fee = $cashAmount * (config('sacco.credit_exchange.transaction_fee_percentage', 0) / 100);
        $netAmount = $cashAmount - $fee;

        try {
            DB::transaction(function () use ($user, $member, $credits, $netAmount, $cashAmount, $exchangeRate, $fee) {
                // Deduct credits from user
                $user->decrement('credits_balance', $credits);

                // Find savings account
                $savingsAccount = $member->savingsAccounts()
                    ->where('status', 'active')
                    ->first();

                if (!$savingsAccount) {
                    throw new \Exception('Savings account not found.');
                }

                // Create SACCO transaction
                SaccoSavingsTransaction::create([
                    'member_id' => $member->id,
                    'account_id' => $savingsAccount->id,
                    'type' => 'deposit',
                    'amount_ugx' => $netAmount,
                    'balance_before_ugx' => $savingsAccount->balance_ugx,
                    'balance_after_ugx' => $savingsAccount->balance_ugx + $netAmount,
                    'description' => "Converted {$credits} platform credits to cash",
                    'reference_number' => 'CREDIT-' . strtoupper(Str::random(10)),
                    'status' => 'completed',
                    'metadata' => json_encode([
                        'source' => 'platform_credits',
                        'credits_converted' => $credits,
                        'exchange_rate' => $exchangeRate,
                        'gross_amount' => $cashAmount,
                        'fee' => $fee,
                        'net_amount' => $netAmount,
                    ]),
                ]);

                // Update account balance
                $savingsAccount->increment('balance_ugx', $netAmount);

                // Update member totals
                $member->increment('total_savings', $netAmount);
                $member->increment('total_credits_deposited', $netAmount);

                Log::info('Credits converted to SACCO cash', [
                    'user_id' => $user->id,
                    'member_id' => $member->id,
                    'credits' => $credits,
                    'cash_amount' => $netAmount,
                ]);
            });

            $message = "Successfully deposited UGX " . number_format($netAmount) . " from {$credits} credits.";
            if ($fee > 0) {
                $message .= " (Transaction fee: UGX " . number_format($fee) . ")";
            }

            return redirect()->route('sacco.accounts.index')->with('success', $message);
        } catch (\Exception $e) {
            Log::error('Credit conversion failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Conversion failed: ' . $e->getMessage());
        }
    }
}

