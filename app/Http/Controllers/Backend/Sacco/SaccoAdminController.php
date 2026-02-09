<?php

namespace App\Http\Controllers\Backend\Sacco;

use App\Http\Controllers\Controller;
use App\Services\Sacco\SaccoMembershipService;
use App\Services\Sacco\SaccoAccountService;
use App\Services\Sacco\SaccoLoanService;
use App\Services\SaccoDividendService;
use App\Models\Sacco\SaccoMember;
use App\Models\Sacco\SaccoAccount;
use App\Models\Sacco\SaccoLoan;
use App\Models\Sacco\SaccoLoanProduct;
use App\Models\Sacco\SaccoDividend;
use App\Models\Sacco\SaccoTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class SaccoAdminController extends Controller
{
    protected SaccoMembershipService $membershipService;
    protected SaccoAccountService $accountService;
    protected SaccoLoanService $loanService;
    protected SaccoDividendService $dividendService;

    public function __construct(
        SaccoMembershipService $membershipService,
        SaccoAccountService $accountService,
        SaccoLoanService $loanService,
        SaccoDividendService $dividendService
    ) {
        $this->middleware(['auth', 'role:admin,super_admin,finance']);
        $this->membershipService = $membershipService;
        $this->accountService = $accountService;
        $this->dividendService = $dividendService;
        $this->loanService = $loanService;
    }

    /**
     * SACCO Admin Dashboard
     */
    public function dashboard()
    {
        $membershipStats = $this->membershipService->getMembershipSummary();
        $loanStats = $this->loanService->getLoanSummary();

        $pendingMembers = SaccoMember::pendingApproval()->count();
        $pendingLoans = SaccoLoan::pending()->count();

        return view('backend.sacco.dashboard', compact(
            'membershipStats',
            'loanStats',
            'pendingMembers',
            'pendingLoans'
        ));
    }

    /**
     * Members List
     */
    public function members(Request $request)
    {
        $query = SaccoMember::with('user')->latest();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('member_number', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%")
                               ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        $members = $query->paginate(50);

        return view('backend.sacco.members.index', compact('members'));
    }

    /**
     * Member Details
     */
    public function memberDetails($id)
    {
        $member = SaccoMember::with([
            'user',
            'accounts',
            'loans.loanProduct',
            'transactions' => function ($query) {
                $query->latest('transaction_date')->limit(20);
            },
        ])->findOrFail($id);

        $stats = $this->membershipService->calculateMemberStats($member);

        return view('backend.sacco.members.details', compact('member', 'stats'));
    }

    /**
     * Pending Member Approvals
     */
    public function pendingMembers()
    {
        $members = SaccoMember::pendingApproval()
            ->with('user')
            ->latest()
            ->paginate(50);

        return view('backend.sacco.members.pending', compact('members'));
    }

    /**
     * Approve Member
     */
    public function approveMember($id)
    {
        $member = SaccoMember::findOrFail($id);

        try {
            $this->membershipService->approveMember($member, Auth::user());

            return back()->with('success', "Member {$member->member_number} approved successfully");
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Suspend Member
     */
    public function suspendMember(Request $request, $id)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $member = SaccoMember::findOrFail($id);

        try {
            $this->membershipService->suspendMember($member, $validated['reason']);

            return back()->with('success', "Member {$member->member_number} suspended");
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Reactivate Member
     */
    public function reactivateMember($id)
    {
        $member = SaccoMember::findOrFail($id);

        try {
            $this->membershipService->reactivateMember($member);

            return back()->with('success', "Member {$member->member_number} reactivated");
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Loan Products Management
     */
    public function loanProducts()
    {
        $products = SaccoLoanProduct::withCount('loans')->latest()->get();

        return view('backend.sacco.loan-products.index', compact('products'));
    }

    /**
     * Create Loan Product Form
     */
    public function createLoanProductForm()
    {
        return view('backend.sacco.loan-products.create');
    }

    /**
     * Store Loan Product
     */
    public function storeLoanProduct(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:sacco_loan_products,slug',
            'description' => 'required|string',
            'min_amount' => 'required|numeric|min:1000',
            'max_amount' => 'required|numeric|gt:min_amount',
            'interest_rate' => 'required|numeric|min:0|max:30',
            'min_term_months' => 'required|integer|min:1',
            'max_term_months' => 'required|integer|gt:min_term_months',
            'processing_fee_percentage' => 'nullable|numeric|min:0|max:10',
            'insurance_fee_percentage' => 'nullable|numeric|min:0|max:5',
            'min_guarantors' => 'nullable|integer|min:0|max:5',
            'collateral_percentage' => 'nullable|numeric|min:0|max:100',
        ]);

        $product = SaccoLoanProduct::create($validated);

        return redirect()->route('backend.sacco.loan-products')
            ->with('success', 'Loan product created successfully');
    }

    /**
     * Edit Loan Product Form
     */
    public function editLoanProductForm($id)
    {
        $product = SaccoLoanProduct::findOrFail($id);

        return view('backend.sacco.loan-products.edit', compact('product'));
    }

    /**
     * Update Loan Product
     */
    public function updateLoanProduct(Request $request, $id)
    {
        $product = SaccoLoanProduct::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:sacco_loan_products,slug,' . $id,
            'description' => 'required|string',
            'min_amount' => 'required|numeric|min:1000',
            'max_amount' => 'required|numeric|gt:min_amount',
            'interest_rate' => 'required|numeric|min:0|max:30',
            'min_term_months' => 'required|integer|min:1',
            'max_term_months' => 'required|integer|gt:min_term_months',
            'processing_fee_percentage' => 'nullable|numeric|min:0|max:10',
            'insurance_fee_percentage' => 'nullable|numeric|min:0|max:5',
            'min_guarantors' => 'nullable|integer|min:0|max:5',
            'collateral_percentage' => 'nullable|numeric|min:0|max:100',
            'is_active' => 'required|boolean',
        ]);

        $product->update($validated);

        return redirect()->route('backend.sacco.loan-products')
            ->with('success', 'Loan product updated successfully');
    }

    /**
     * Pending Loan Applications
     */
    public function pendingLoans()
    {
        $loans = SaccoLoan::pending()
            ->with('member.user', 'loanProduct')
            ->latest()
            ->paginate(50);

        return view('backend.sacco.loans.pending', compact('loans'));
    }

    /**
     * All Loans
     */
    public function loans(Request $request)
    {
        $query = SaccoLoan::with('member.user', 'loanProduct')->latest();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $loans = $query->paginate(50);

        return view('backend.sacco.loans.index', compact('loans'));
    }

    /**
     * Loan Details
     */
    public function loanDetails($id)
    {
        $loan = SaccoLoan::with('member.user', 'loanProduct', 'approver', 'disburser')
            ->findOrFail($id);

        $schedule = $this->loanService->calculateLoanSchedule($loan);

        return view('backend.sacco.loans.details', compact('loan', 'schedule'));
    }

    /**
     * Approve Loan
     */
    public function approveLoan($id)
    {
        $loan = SaccoLoan::findOrFail($id);

        try {
            $this->loanService->approveLoan($loan, Auth::user());

            return back()->with('success', "Loan {$loan->loan_number} approved successfully");
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Reject Loan
     */
    public function rejectLoan(Request $request, $id)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $loan = SaccoLoan::findOrFail($id);

        try {
            $this->loanService->rejectLoan($loan, Auth::user(), $validated['reason']);

            return back()->with('success', "Loan {$loan->loan_number} rejected");
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Disburse Loan
     */
    public function disburseLoan($id)
    {
        $loan = SaccoLoan::findOrFail($id);

        try {
            $transaction = $this->loanService->disburseLoan($loan, Auth::user());

            return back()->with('success', "Loan {$loan->loan_number} disbursed successfully. Amount: UGX " . number_format($loan->principal_amount, 2));
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Dividends Management
     */
    public function dividends()
    {
        $dividends = SaccoDividend::withCount('memberDividends')
            ->latest('dividend_year')
            ->paginate(20);

        return view('backend.sacco.dividends.index', compact('dividends'));
    }

    /**
     * Declare Dividend Form
     */
    public function declareDividendForm()
    {
        return view('backend.sacco.dividends.declare');
    }

    /**
     * Declare Dividend
     */
    public function declareDividend(Request $request)
    {
        $validated = $request->validate([
            'dividend_year' => 'required|integer|min:2020|max:' . (date('Y') + 1),
            'total_profit' => 'required|numeric|min:0',
            'dividend_rate' => 'required|numeric|min:0|max:100',
            'declaration_date' => 'required|date',
            'payment_date' => 'required|date|after:declaration_date',
        ]);

        try {
            $dividend = $this->dividendService->declareDividend($validated);

            return redirect()->route('backend.sacco.dividends')
                ->with('success', "Dividend for {$validated['dividend_year']} declared successfully. " .
                    "{$dividend->memberDividends->count()} members will receive dividends.");
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to declare dividend: ' . $e->getMessage());
        }
    }

    /**
     * Reports
     */
    public function reports()
    {
        return view('backend.sacco.reports');
    }

    /**
     * Financial Report
     */
    public function financialReport(Request $request)
    {
        $validated = $request->validate([
            'report_type' => 'required|in:monthly,quarterly,annual',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        $startDate = Carbon::parse($validated['start_date']);
        $endDate = Carbon::parse($validated['end_date']);

        // Generate comprehensive financial report
        $report = [
            'period' => [
                'type' => $validated['report_type'],
                'start' => $startDate->format('Y-m-d'),
                'end' => $endDate->format('Y-m-d'),
            ],
            'membership' => [
                'total_members' => SaccoMember::count(),
                'new_members' => SaccoMember::whereBetween('joined_at', [$startDate, $endDate])->count(),
                'active_members' => SaccoMember::where('status', 'active')->count(),
            ],
            'savings' => [
                'total_balance' => SaccoAccount::where('account_type', 'regular')->sum('balance_ugx'),
                'period_deposits' => SaccoTransaction::where('type', 'deposit')
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->sum('amount_ugx'),
                'period_withdrawals' => SaccoTransaction::where('type', 'withdrawal')
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->sum('amount_ugx'),
            ],
            'loans' => [
                'total_outstanding' => SaccoLoan::whereIn('status', ['active', 'defaulted'])->sum('balance_remaining_ugx'),
                'period_disbursed' => SaccoLoan::whereBetween('disbursed_at', [$startDate, $endDate])->sum('principal_amount_ugx'),
                'period_repayments' => SaccoLoan::whereBetween('updated_at', [$startDate, $endDate])->sum('amount_paid_ugx'),
                'active_loans' => SaccoLoan::where('status', 'active')->count(),
                'defaulted_loans' => SaccoLoan::where('status', 'defaulted')->count(),
            ],
            'income' => [
                'interest_income' => SaccoTransaction::where('type', 'interest')
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->sum('amount_ugx'),
                'fee_income' => SaccoTransaction::where('type', 'fee')
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->sum('amount_ugx'),
            ],
            'generated_at' => now()->format('Y-m-d H:i:s'),
        ];

        return view('backend.sacco.reports.financial', array_merge($validated, ['report' => $report]));
    }
}
