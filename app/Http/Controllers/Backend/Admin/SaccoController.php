<?php

namespace App\Http\Controllers\Backend\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sacco\SaccoMember;
use App\Models\Sacco\SaccoLoan;
use App\Models\Sacco\SaccoLoanProduct;
use App\Models\Sacco\SaccoSavingsTransaction;
use App\Models\Sacco\SaccoDividend;
use App\Models\Sacco\SaccoSavingsAccount;
use App\Models\Sacco\SaccoShare;
use App\Models\Sacco\SaccoBoardMember;
use App\Models\Sacco\SaccoAuditLog;
use App\Models\Sacco\SaccoAccountType;
use App\Models\Sacco\SaccoMemberDividend;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class SaccoController extends Controller
{
    /**
     * SACCO Dashboard
     */
    public function index()
    {
        if (!config('sacco.enabled', false)) {
            return redirect()->route('admin.dashboard')->with('warning', 'SACCO module is currently disabled.');
        }

        return $this->dashboard();
    }

    /**
     * SACCO Dashboard with statistics
     */
    public function dashboard()
    {
        $stats = $this->getStats();
        
        return view('backend.sacco.dashboard', compact('stats'));
    }

    /**
     * Get SACCO statistics
     */
    public function getStats()
    {
        $totalMembers = SaccoMember::count();
        $activeMembers = SaccoMember::where('status', 'active')->count();
        $pendingMembers = SaccoMember::whereIn('status', ['pending', 'pending_approval'])->count();
        
        $totalSavings = SaccoSavingsAccount::where('account_type', 'regular')->sum('balance_ugx');
        $totalShares = SaccoShare::sum('total_value_ugx');
        $totalFixedDeposits = SaccoSavingsAccount::where('account_type', 'fixed_deposit')->sum('balance_ugx');
        
        $totalLoans = SaccoLoan::sum('principal_amount_ugx');
        $activeLoans = SaccoLoan::whereIn('status', ['active', 'disbursed'])->count();
        $pendingLoans = SaccoLoan::where('status', 'pending')->count();
        $overdueLoans = SaccoLoan::where('status', 'defaulted')->count();
        
        $loanRepayments = SaccoLoan::whereIn('status', ['active', 'disbursed'])->sum('amount_paid_ugx');
        $loanOutstanding = SaccoLoan::whereIn('status', ['active', 'disbursed'])->sum('balance_remaining_ugx');
        
        // Use sacco_savings_transactions table
        $todayTransactions = SaccoSavingsTransaction::whereDate('created_at', today())->count();
        $todayVolume = SaccoSavingsTransaction::whereDate('created_at', today())->sum('amount_ugx');
        
        $monthTransactions = SaccoSavingsTransaction::whereMonth('created_at', now()->month)->count();
        $monthVolume = SaccoSavingsTransaction::whereMonth('created_at', now()->month)->sum('amount_ugx');

        // Recent activity
        $recentMembers = SaccoMember::with('user')->latest()->take(5)->get();
        $recentLoans = SaccoLoan::with('member.user')->latest()->take(5)->get();
        $recentTransactions = SaccoSavingsTransaction::with('member.user')->latest()->take(10)->get();

        return compact(
            'totalMembers',
            'activeMembers',
            'pendingMembers',
            'totalSavings',
            'totalShares',
            'totalFixedDeposits',
            'totalLoans',
            'activeLoans',
            'pendingLoans',
            'overdueLoans',
            'loanRepayments',
            'loanOutstanding',
            'todayTransactions',
            'todayVolume',
            'monthTransactions',
            'monthVolume',
            'recentMembers',
            'recentLoans',
            'recentTransactions'
        );
    }

    /**
     * List all members
     */
    public function members(Request $request)
    {
        $query = SaccoMember::with('user');

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->search) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('display_name', 'like', "%{$request->search}%")
                  ->orWhere('username', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        $members = $query->paginate(20);

        return view('backend.sacco.members.index', compact('members'));
    }

    /**
     * Show pending members
     */
    public function pendingMembers()
    {
        $members = SaccoMember::with('user')
            ->where('status', 'pending')
            ->paginate(20);

        return view('backend.sacco.members.pending', compact('members'));
    }

    /**
     * Show single member details
     */
    public function showMember(SaccoMember $member)
    {
        $member->load(['user', 'accounts', 'loans', 'transactions']);
        
        return view('backend.sacco.members.show', compact('member'));
    }

    /**
     * Approve member
     */
    public function approveMember(SaccoMember $member)
    {
        $member->update([
            'status' => 'active',
            'approved_at' => now(),
            'approved_by' => auth()->id()
        ]);

        SaccoAuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'member_approved',
            'auditable_type' => SaccoMember::class,
            'auditable_id' => $member->id,
            'old_values' => ['status' => 'pending'],
            'new_values' => ['status' => 'active'],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ]);

        return redirect()->back()->with('success', 'Member approved successfully.');
    }

    /**
     * Reject member
     */
    public function rejectMember(Request $request, SaccoMember $member)
    {
        $request->validate([
            'reason' => 'required|string|max:500'
        ]);

        $member->update([
            'status' => 'rejected',
            'rejection_reason' => $request->reason
        ]);

        return redirect()->back()->with('success', 'Member application rejected.');
    }

    /**
     * Suspend member
     */
    public function suspendMember(Request $request, SaccoMember $member)
    {
        $request->validate([
            'reason' => 'required|string|max:500'
        ]);

        $member->update([
            'status' => 'suspended',
            'suspension_reason' => $request->reason
        ]);

        return redirect()->back()->with('success', 'Member suspended.');
    }

    /**
     * Activate member
     */
    public function activateMember(SaccoMember $member)
    {
        $member->update(['status' => 'active']);

        return redirect()->back()->with('success', 'Member activated.');
    }

    /**
     * Update member credit score
     */
    public function updateCreditScore(Request $request, SaccoMember $member)
    {
        $request->validate([
            'credit_score' => 'required|integer|min:300|max:900'
        ]);

        $member->update(['credit_score' => $request->credit_score]);

        return redirect()->back()->with('success', 'Credit score updated.');
    }

    /**
     * Show user enrollment form
     */
    public function showEnrollForm()
    {
        // Get users who are not SACCO members yet
        $eligibleUsers = \App\Models\User::whereDoesntHave('saccoMember')
            ->where('status', 'active')
            ->orderBy('display_name')
            ->get();

        return view('backend.sacco.members.enroll', compact('eligibleUsers'));
    }

    /**
     * Enroll user as SACCO member
     */
    public function enrollUser(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'membership_type' => 'required|in:regular,associate,premium',
            'initial_savings' => 'nullable|numeric|min:0',
            'initial_shares' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:500',
            'auto_approve' => 'boolean'
        ]);

        $user = \App\Models\User::findOrFail($request->user_id);

        // Check if user is already a SACCO member
        if ($user->saccoMember) {
            return redirect()->back()->with('error', 'User is already a SACCO member.');
        }

        DB::beginTransaction();
        try {
            // Generate member number
            $memberNumber = 'SM' . date('Y') . str_pad(SaccoMember::count() + 1, 4, '0', STR_PAD_LEFT);

            // Create SACCO member (using correct DB column names)
            $member = SaccoMember::create([
                'uuid' => \Illuminate\Support\Str::uuid()->toString(),
                'user_id' => $user->id,
                'member_number' => $memberNumber,
                'member_type' => $request->membership_type == 'associate' ? 'regular' : $request->membership_type,
                'status' => $request->auto_approve ? 'active' : 'active', // DB enum: active, suspended, resigned, expelled
                'joined_at' => now(),
            ]);

            // Create default accounts if initial amounts provided
            if ($request->initial_savings && $request->initial_savings > 0) {
                $account = SaccoSavingsAccount::create([
                    'member_id' => $member->id,
                    'account_type' => 'regular',  // DB enum: regular, fixed_deposit, target, retirement
                    'account_number' => 'SAV' . $memberNumber,
                    'account_name' => 'Savings Account',
                    'balance_ugx' => $request->initial_savings,
                    'interest_rate' => config('sacco.savings_interest_rate', 5.0),
                    'status' => 'active',
                ]);

                // Record initial deposit transaction
                SaccoSavingsTransaction::create([
                    'account_id' => $account->id,
                    'member_id' => $member->id,
                    'type' => 'deposit',  // DB enum: deposit, withdrawal, interest, fee, transfer_in, transfer_out
                    'amount_ugx' => $request->initial_savings,
                    'balance_before_ugx' => 0,
                    'balance_after_ugx' => $request->initial_savings,
                    'description' => 'Initial savings deposit by admin',
                    'status' => 'completed',
                ]);
            }

            if ($request->initial_shares && $request->initial_shares > 0) {
                $sharesAccount = SaccoSavingsAccount::create([
                    'member_id' => $member->id,
                    'account_type' => 'regular',  // Use regular for shares as well
                    'account_number' => 'SHR' . $memberNumber,
                    'account_name' => 'Shares Account',
                    'balance_ugx' => $request->initial_shares,
                    'interest_rate' => 0,
                    'status' => 'active',
                ]);

                // Record initial shares transaction
                SaccoSavingsTransaction::create([
                    'account_id' => $sharesAccount->id,
                    'member_id' => $member->id,
                    'type' => 'deposit',
                    'amount_ugx' => $request->initial_shares,
                    'balance_before_ugx' => 0,
                    'balance_after_ugx' => $request->initial_shares,
                    'description' => 'Initial shares purchase by admin',
                    'status' => 'completed',
                ]);
            }

            // Log the enrollment using audit_logs table columns
            SaccoAuditLog::create([
                'user_id' => auth()->id(),
                'event' => 'member_enrolled_by_admin',
                'auditable_type' => SaccoMember::class,
                'auditable_id' => $member->id,
                'data' => $member->toArray(),
                'ip_address' => request()->ip(),
            ]);

            DB::commit();

            $message = $request->auto_approve
                ? 'User enrolled and approved as SACCO member successfully.'
                : 'User enrolled as SACCO member. Approval required.';

            return redirect()->route('admin.sacco.members.show', $member)
                ->with('success', $message);

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to enroll user: ' . $e->getMessage());
        }
    }

    /**
     * List all loans
     */
    public function loans(Request $request)
    {
        $query = SaccoLoan::with('member.user', 'loanProduct');

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $loans = $query->paginate(20);

        return view('backend.sacco.loans.index', compact('loans'));
    }

    /**
     * Show pending loans
     */
    public function pendingLoans()
    {
        $loans = SaccoLoan::with('member.user', 'loanProduct')
            ->where('status', 'pending')
            ->paginate(20);

        return view('backend.sacco.loans.pending', compact('loans'));
    }

    /**
     * Show active loans
     */
    public function activeLoans()
    {
        $loans = SaccoLoan::with('member.user', 'loanProduct')
            ->where('status', 'active')
            ->paginate(20);

        return view('backend.sacco.loans.active', compact('loans'));
    }

    /**
     * Show overdue loans
     */
    public function overdueLoans()
    {
        $loans = SaccoLoan::with('member.user', 'loanProduct')
            ->where('status', 'overdue')
            ->paginate(20);

        return view('backend.sacco.loans.overdue', compact('loans'));
    }

    /**
     * Show defaulted loans
     */
    public function defaultedLoans()
    {
        $loans = SaccoLoan::with('member.user', 'loanProduct')
            ->where('status', 'defaulted')
            ->paginate(20);

        return view('backend.sacco.loans.defaulted', compact('loans'));
    }

    /**
     * Show single loan
     */
    public function showLoan(SaccoLoan $loan)
    {
        $loan->load(['member.user', 'loanProduct', 'repayments', 'guarantors.guarantor.user']);

        return view('backend.sacco.loans.show', compact('loan'));
    }

    /**
     * Approve loan
     */
    public function approveLoan(Request $request, SaccoLoan $loan)
    {
        $request->validate([
            'approval_notes' => 'nullable|string'
        ]);

        DB::beginTransaction();
        try {
            $loan->update([
                'status' => 'approved',
                'approved_at' => now(),
                'approved_by' => auth()->id(),
                'approval_notes' => $request->approval_notes
            ]);

            SaccoAuditLog::create([
                'user_id' => auth()->id(),
                'action' => 'loan_approved',
                'auditable_type' => SaccoLoan::class,
                'auditable_id' => $loan->id,
                'new_values' => ['status' => 'approved'],
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent()
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Loan approved successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to approve loan: ' . $e->getMessage());
        }
    }

    /**
     * Reject loan
     */
    public function rejectLoan(Request $request, SaccoLoan $loan)
    {
        $request->validate([
            'rejection_reason' => 'required|string'
        ]);

        $loan->update([
            'status' => 'rejected',
            'rejection_reason' => $request->rejection_reason,
            'rejected_at' => now(),
            'rejected_by' => auth()->id()
        ]);

        return redirect()->back()->with('success', 'Loan rejected.');
    }

    /**
     * Disburse loan
     */
    public function disburseLoan(Request $request, SaccoLoan $loan)
    {
        $request->validate([
            'disbursement_method' => 'required|in:mobile_money,bank_transfer,cash',
            'disbursement_notes' => 'nullable|string'
        ]);

        DB::beginTransaction();
        try {
            $loan->update([
                'status' => 'active',
                'disbursed_at' => now(),
                'disbursed_by' => auth()->id(),
                'disbursement_method' => $request->disbursement_method,
                'disbursement_notes' => $request->disbursement_notes
            ]);

            // Create transaction record
            SaccoSavingsTransaction::create([
                'member_id' => $loan->member_id,
                'loan_id' => $loan->id,
                'type' => 'fee',
                'amount' => $loan->principal_amount,
                'status' => 'completed',
                'processed_by' => auth()->id()
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Loan disbursed successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to disburse loan: ' . $e->getMessage());
        }
    }

    /**
     * List loan products
     */
    public function loanProducts()
    {
        $products = SaccoLoanProduct::withCount('loans')->paginate(20);

        return view('backend.sacco.loan-products.index', compact('products'));
    }

    /**
     * Show create loan product form
     */
    public function createLoanProduct()
    {
        return view('backend.sacco.loan-products.create');
    }

    /**
     * Store new loan product
     */
    public function storeLoanProduct(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'min_amount' => 'required|numeric|min:0',
            'max_amount' => 'required|numeric|gt:min_amount',
            'interest_rate' => 'required|numeric|min:0|max:100',
            'interest_type' => 'required|in:monthly,yearly',
            'min_duration_months' => 'required|integer|min:1',
            'max_duration_months' => 'required|integer|gt:min_duration_months',
            'processing_fee_percentage' => 'nullable|numeric|min:0|max:100',
            'penalty_rate' => 'nullable|numeric|min:0|max:100',
            'grace_period_days' => 'nullable|integer|min:0',
            'min_guarantors' => 'required|integer|min:0|max:10',
            'collateral_required' => 'required|boolean',
            'collateral_percentage' => 'nullable|numeric|min:0|max:100',
        ]);

        $product = SaccoLoanProduct::create([
            'name' => $request->name,
            'description' => $request->description,
            'min_amount' => $request->min_amount,
            'max_amount' => $request->max_amount,
            'interest_rate' => $request->interest_rate,
            'interest_type' => $request->interest_type,
            'min_duration_months' => $request->min_duration_months,
            'max_duration_months' => $request->max_duration_months,
            'processing_fee_percentage' => $request->processing_fee_percentage ?? 0,
            'penalty_rate' => $request->penalty_rate ?? 5,
            'grace_period_days' => $request->grace_period_days ?? 0,
            'min_guarantors' => $request->min_guarantors,
            'collateral_required' => $request->collateral_required,
            'collateral_percentage' => $request->collateral_percentage ?? 0,
            'is_active' => true,
        ]);

        SaccoAuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'loan_product_created',
            'auditable_type' => SaccoLoanProduct::class,
            'auditable_id' => $product->id,
            'new_values' => $product->toArray(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ]);

        return redirect()->route('admin.sacco.loan-products.index')
            ->with('success', 'Loan product created successfully.');
    }

    /**
     * Show edit loan product form
     */
    public function editLoanProduct(SaccoLoanProduct $product)
    {
        return view('backend.sacco.loan-products.edit', compact('product'));
    }

    /**
     * Update loan product
     */
    public function updateLoanProduct(Request $request, SaccoLoanProduct $product)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'min_amount' => 'required|numeric|min:0',
            'max_amount' => 'required|numeric|gt:min_amount',
            'interest_rate' => 'required|numeric|min:0|max:100',
            'interest_type' => 'required|in:monthly,yearly',
            'min_duration_months' => 'required|integer|min:1',
            'max_duration_months' => 'required|integer|gt:min_duration_months',
            'processing_fee_percentage' => 'nullable|numeric|min:0|max:100',
            'penalty_rate' => 'nullable|numeric|min:0|max:100',
            'grace_period_days' => 'nullable|integer|min:0',
            'min_guarantors' => 'required|integer|min:0|max:10',
            'collateral_required' => 'required|boolean',
            'collateral_percentage' => 'nullable|numeric|min:0|max:100',
        ]);

        $oldValues = $product->toArray();

        $product->update([
            'name' => $request->name,
            'description' => $request->description,
            'min_amount' => $request->min_amount,
            'max_amount' => $request->max_amount,
            'interest_rate' => $request->interest_rate,
            'interest_type' => $request->interest_type,
            'min_duration_months' => $request->min_duration_months,
            'max_duration_months' => $request->max_duration_months,
            'processing_fee_percentage' => $request->processing_fee_percentage ?? 0,
            'penalty_rate' => $request->penalty_rate ?? 5,
            'grace_period_days' => $request->grace_period_days ?? 0,
            'min_guarantors' => $request->min_guarantors,
            'collateral_required' => $request->collateral_required,
            'collateral_percentage' => $request->collateral_percentage ?? 0,
        ]);

        SaccoAuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'loan_product_updated',
            'auditable_type' => SaccoLoanProduct::class,
            'auditable_id' => $product->id,
            'old_values' => $oldValues,
            'new_values' => $product->toArray(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ]);

        return redirect()->route('admin.sacco.loan-products.index')
            ->with('success', 'Loan product updated successfully.');
    }

    /**
     * Toggle loan product active status
     */
    public function toggleLoanProduct(SaccoLoanProduct $product)
    {
        $product->update(['is_active' => !$product->is_active]);

        SaccoAuditLog::create([
            'user_id' => auth()->id(),
            'action' => $product->is_active ? 'loan_product_activated' : 'loan_product_deactivated',
            'auditable_type' => SaccoLoanProduct::class,
            'auditable_id' => $product->id,
            'new_values' => ['is_active' => $product->is_active],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ]);

        return redirect()->back()
            ->with('success', 'Loan product status updated.');
    }

    /**
     * Delete loan product
     */
    public function deleteLoanProduct(SaccoLoanProduct $product)
    {
        // Check if product has active loans
        if ($product->loans()->whereIn('status', ['pending', 'approved', 'active'])->exists()) {
            return redirect()->back()
                ->with('error', 'Cannot delete loan product with active loans.');
        }

        SaccoAuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'loan_product_deleted',
            'auditable_type' => SaccoLoanProduct::class,
            'auditable_id' => $product->id,
            'old_values' => $product->toArray(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ]);

        $product->delete();

        return redirect()->route('admin.sacco.loan-products.index')
            ->with('success', 'Loan product deleted successfully.');
    }

    /**
     * List transactions
     */
    public function transactions(Request $request)
    {
        $query = SaccoSavingsTransaction::with('member.user');

        if ($request->type) {
            $query->where('type', $request->type);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->search) {
            $query->whereHas('member.user', function($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%");
            });
        }

        $transactions = $query->latest()->paginate(20);

        return view('backend.sacco.transactions.index', compact('transactions'));
    }

    /**
     * List deposits
     */
    public function deposits(Request $request)
    {
        $query = SaccoSavingsTransaction::with('member.user')
            ->where('type', 'deposit');

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->search) {
            $query->whereHas('member.user', function($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%");
            });
        }

        $transactions = $query->latest()->paginate(20);

        return view('backend.sacco.transactions.index', compact('transactions'));
    }

    /**
     * List withdrawals
     */
    public function withdrawals(Request $request)
    {
        $query = SaccoSavingsTransaction::with('member.user')
            ->where('type', 'withdrawal');

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->search) {
            $query->whereHas('member.user', function($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%");
            });
        }

        $transactions = $query->latest()->paginate(20);

        return view('backend.sacco.transactions.index', compact('transactions'));
    }

    /**
     * Show single transaction
     */
    public function showTransaction(SaccoSavingsTransaction $transaction)
    {
        $transaction->load(['member.user']);
        
        return view('backend.sacco.transactions.show', compact('transaction'));
    }

    /**
     * Show pending transactions
     */
    public function pendingTransactions()
    {
        $transactions = SaccoSavingsTransaction::with('member.user')
            ->where('status', 'pending')
            ->latest()
            ->paginate(20);

        return view('backend.sacco.transactions.pending', compact('transactions'));
    }

    /**
     * Approve transaction
     */
    public function approveTransaction(SaccoSavingsTransaction $transaction)
    {
        DB::beginTransaction();
        try {
            $transaction->update([
                'status' => 'completed',
                'processed_by' => auth()->id(),
                'processed_at' => now()
            ]);

            SaccoAuditLog::create([
                'user_id' => auth()->id(),
                'action' => 'transaction_approved',
                'auditable_type' => SaccoSavingsTransaction::class,
                'auditable_id' => $transaction->id,
                'old_values' => ['status' => 'pending'],
                'new_values' => ['status' => 'completed'],
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent()
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Transaction approved successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to approve transaction: ' . $e->getMessage());
        }
    }

    /**
     * Reject transaction
     */
    public function rejectTransaction(Request $request, SaccoSavingsTransaction $transaction)
    {
        $request->validate([
            'rejection_reason' => 'required|string|max:500'
        ]);

        $transaction->update([
            'status' => 'rejected',
            'rejection_reason' => $request->rejection_reason,
            'processed_by' => auth()->id(),
            'processed_at' => now()
        ]);

        SaccoAuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'transaction_rejected',
            'auditable_type' => SaccoSavingsTransaction::class,
            'auditable_id' => $transaction->id,
            'new_values' => [
                'status' => 'rejected',
                'rejection_reason' => $request->rejection_reason
            ],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ]);

        return redirect()->back()->with('success', 'Transaction rejected.');
    }

    /**
     * List dividends
     */
    public function dividends(Request $request)
    {
        $query = SaccoDividend::with(['distributions', 'calculatedBy', 'approvedBy']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $dividends = $query->latest()->paginate(20);

        return view('backend.sacco.dividends.index', compact('dividends'));
    }

    /**
     * Show dividend details
     */
    public function showDividend(SaccoDividend $dividend)
    {
        $dividend->load(['distributions.member.user', 'calculatedBy', 'approvedBy']);

        return view('backend.sacco.dividends.show', compact('dividend'));
    }

    /**
     * Calculate new dividend
     */
    public function calculateDividend(Request $request)
    {
        $request->validate([
            'year' => 'required|integer|min:2000|max:2100',
            'total_profit' => 'required|numeric|min:0',
            'distribution_percentage' => 'required|numeric|min:1|max:100',
            'withholding_tax_percentage' => 'required|numeric|min:0|max:100',
        ]);

        DB::beginTransaction();
        try {
            // Check if dividend already exists for the year
            if (SaccoDividend::where('year', $request->year)->exists()) {
                return redirect()->back()->with('error', 'Dividend for this year already exists.');
            }

            // Calculate distributable amount
            $distributableAmount = $request->total_profit * ($request->distribution_percentage / 100);

            // Get total shares from all active members
            $totalShares = SaccoSavingsAccount::where('account_type', 'shares')
                ->whereHas('member', function($q) {
                    $q->where('status', 'active');
                })
                ->sum('balance_ugx');

            if ($totalShares == 0) {
                return redirect()->back()->with('error', 'No active members with shares found.');
            }

            // Calculate rate per share
            $ratePerShare = $distributableAmount / $totalShares;

            // Create dividend record
            $dividend = SaccoDividend::create([
                'year' => $request->year,
                'total_profit' => $request->total_profit,
                'distributable_amount' => $distributableAmount,
                'distribution_percentage' => $request->distribution_percentage,
                'total_shares' => $totalShares,
                'rate_per_share' => $ratePerShare,
                'withholding_tax_percentage' => $request->withholding_tax_percentage,
                'status' => 'calculated',
                'calculated_at' => now(),
                'calculated_by' => auth()->id(),
            ]);

            // Create distribution records for each eligible member
            $members = SaccoMember::where('status', 'active')
                ->whereHas('savingsAccounts', function($q) {
                    $q->where('balance_ugx', '>', 0);
                })
                ->with('savingsAccounts')
                ->get();

            foreach ($members as $member) {
                $sharesHeld = $member->savingsAccounts->sum('balance_ugx');
                $grossAmount = $sharesHeld * $ratePerShare;
                $withholdingTax = $grossAmount * ($request->withholding_tax_percentage / 100);
                $netAmount = $grossAmount - $withholdingTax;

                SaccoMemberDividend::create([
                    'dividend_id' => $dividend->id,
                    'member_id' => $member->id,
                    'shares_held' => $sharesHeld,
                    'gross_amount' => $grossAmount,
                    'withholding_tax' => $withholdingTax,
                    'net_amount' => $netAmount,
                    'status' => 'pending',
                ]);
            }

            // Log action
            SaccoAuditLog::create([
                'user_id' => auth()->id(),
                'action' => 'dividend_calculated',
                'auditable_type' => SaccoDividend::class,
                'auditable_id' => $dividend->id,
                'new_values' => $dividend->toArray(),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent()
            ]);

            DB::commit();
            return redirect()->route('admin.sacco.dividends.show', $dividend)
                ->with('success', 'Dividend calculated successfully. ' . $members->count() . ' members eligible.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to calculate dividend: ' . $e->getMessage());
        }
    }

    /**
     * Approve dividend
     */
    public function approveDividend(SaccoDividend $dividend)
    {
        if ($dividend->status !== 'calculated') {
            return response()->json(['success' => false, 'message' => 'Only calculated dividends can be approved.']);
        }

        $dividend->update([
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => auth()->id(),
        ]);

        SaccoAuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'dividend_approved',
            'auditable_type' => SaccoDividend::class,
            'auditable_id' => $dividend->id,
            'old_values' => ['status' => 'calculated'],
            'new_values' => ['status' => 'approved'],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ]);

        return response()->json(['success' => true, 'message' => 'Dividend approved successfully.']);
    }

    /**
     * Distribute dividend to members
     */
    public function distributeDividend(SaccoDividend $dividend)
    {
        if ($dividend->status !== 'approved') {
            return response()->json(['success' => false, 'message' => 'Only approved dividends can be distributed.']);
        }

        DB::beginTransaction();
        try {
            // Update all distribution records to paid
            $dividend->distributions()->update([
                'status' => 'paid',
                'paid_at' => now(),
            ]);

            // Credit member accounts (you might want to implement this based on your account structure)
            foreach ($dividend->distributions as $distribution) {
                // Create transaction record
                SaccoSavingsTransaction::create([
                    'member_id' => $distribution->member_id,
                    'type' => 'interest',
                    'amount' => $distribution->net_amount,
                    'status' => 'completed',
                    'description' => "Dividend payment for year {$dividend->year}",
                    'processed_by' => auth()->id(),
                    'processed_at' => now(),
                ]);

                // Optionally credit their savings account
                // This depends on your business rules
            }

            // Update dividend status
            $dividend->update([
                'status' => 'distributed',
                'distributed_at' => now(),
            ]);

            SaccoAuditLog::create([
                'user_id' => auth()->id(),
                'action' => 'dividend_distributed',
                'auditable_type' => SaccoDividend::class,
                'auditable_id' => $dividend->id,
                'old_values' => ['status' => 'approved'],
                'new_values' => ['status' => 'distributed'],
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent()
            ]);

            DB::commit();
            return response()->json(['success' => true, 'message' => 'Dividend distributed successfully to all members.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Failed to distribute dividend: ' . $e->getMessage()]);
        }
    }

    /**
     * Cancel dividend
     */
    public function cancelDividend(Request $request, SaccoDividend $dividend)
    {
        if (!in_array($dividend->status, ['calculated', 'approved'])) {
            return response()->json(['success' => false, 'message' => 'Only calculated or approved dividends can be cancelled.']);
        }

        $dividend->update([
            'status' => 'cancelled',
        ]);

        SaccoAuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'dividend_cancelled',
            'auditable_type' => SaccoDividend::class,
            'auditable_id' => $dividend->id,
            'old_values' => ['status' => $dividend->status],
            'new_values' => ['status' => 'cancelled', 'reason' => $request->reason],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ]);

        return response()->json(['success' => true, 'message' => 'Dividend cancelled successfully.']);
    }

    /**
     * Export dividend report
     */
    public function exportDividend(SaccoDividend $dividend, Request $request)
    {
        $format = $request->get('format', 'csv');
        $dividend->load(['memberDividends.member.user']);

        if ($format === 'csv') {
            $filename = "dividend_{$dividend->dividend_year}_" . now()->format('YmdHis') . '.csv';
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            ];

            $callback = function() use ($dividend) {
                $file = fopen('php://output', 'w');
                
                // Header
                fputcsv($file, ['Dividend Report - Year ' . $dividend->dividend_year]);
                fputcsv($file, ['Generated:', now()->format('Y-m-d H:i:s')]);
                fputcsv($file, []);
                fputcsv($file, ['Summary']);
                fputcsv($file, ['Total Profit', number_format($dividend->total_profit, 2)]);
                fputcsv($file, ['Dividend Rate', $dividend->dividend_rate . '%']);
                fputcsv($file, ['Total Distributed', number_format($dividend->memberDividends->sum('amount'), 2)]);
                fputcsv($file, ['Total Recipients', $dividend->memberDividends->count()]);
                fputcsv($file, []);
                
                // Member dividends
                fputcsv($file, ['Member Number', 'Member Name', 'Shares Value', 'Dividend Amount', 'Status']);
                foreach ($dividend->memberDividends as $md) {
                    fputcsv($file, [
                        $md->member->member_number ?? 'N/A',
                        $md->member->user->display_name ?? $md->member->user->name ?? 'Unknown',
                        number_format($md->shares_amount ?? 0, 2),
                        number_format($md->amount, 2),
                        $md->status ?? 'pending',
                    ]);
                }
                
                fclose($file);
            };

            return response()->stream($callback, 200, $headers);
        }

        // Return HTML-based printable report for PDF
        return view('backend.sacco.reports.dividend-export', compact('dividend'));
    }

    /**
     * Reports dashboard
     */
    public function reports()
    {
        return view('backend.sacco.reports.index');
    }

    /**
     * Financial report
     */
    public function financialReport(Request $request)
    {
        $startDate = $request->start_date ? Carbon::parse($request->start_date) : now()->startOfMonth();
        $endDate = $request->end_date ? Carbon::parse($request->end_date) : now()->endOfMonth();

        $data = [
            'total_deposits' => SaccoSavingsTransaction::where('transaction_type', 'deposit')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->sum('amount'),
            'total_withdrawals' => SaccoSavingsTransaction::where('transaction_type', 'withdrawal')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->sum('amount'),
            'loans_disbursed' => SaccoLoan::whereBetween('created_at', [$startDate, $endDate])
                ->whereNotNull('approved_at')
                ->sum('principal_amount'),
            'loan_repayments' => SaccoSavingsTransaction::where('transaction_type', 'loan_repayment')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->sum('amount'),
            'total_savings' => SaccoSavingsAccount::where('account_type', 'savings')->sum('balance_ugx'),
            'total_shares' => SaccoSavingsAccount::where('account_type', 'shares')->sum('balance_ugx'),
            'active_loans' => SaccoLoan::where('status', 'active')->count(),
            'outstanding_loans' => SaccoLoan::where('status', 'active')->sum('balance_ugx'),
        ];

        return view('backend.sacco.reports.financial', compact('data', 'startDate', 'endDate'));
    }

    /**
     * Loans report
     */
    public function loansReport(Request $request)
    {
        $startDate = $request->start_date ? Carbon::parse($request->start_date) : now()->startOfMonth();
        $endDate = $request->end_date ? Carbon::parse($request->end_date) : now()->endOfMonth();

        $data = [
            'total_disbursed' => SaccoLoan::whereBetween('disbursed_at', [$startDate, $endDate])
                ->sum('principal_amount'),
            'total_repaid' => SaccoLoan::whereBetween('disbursed_at', [$startDate, $endDate])
                ->sum('amount_paid'),
            'active_loans' => SaccoLoan::where('status', 'active')->count(),
            'overdue_loans' => SaccoLoan::where('status', 'overdue')->count(),
            'defaulted_loans' => SaccoLoan::where('status', 'defaulted')->count(),
            'loans_by_product' => SaccoLoan::with('loanProduct')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->get()
                ->groupBy('loan_product_id'),
        ];

        return view('backend.sacco.reports.loans', compact('data', 'startDate', 'endDate'));
    }

    /**
     * Members report
     */
    public function membersReport(Request $request)
    {
        $data = [
            'total_members' => SaccoMember::count(),
            'active_members' => SaccoMember::where('status', 'active')->count(),
            'pending_members' => SaccoMember::where('status', 'pending')->count(),
            'suspended_members' => SaccoMember::where('status', 'suspended')->count(),
            'growth_data' => SaccoMember::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as count')
                ->groupBy('month')
                ->orderBy('month')
                ->get(),
        ];

        return view('backend.sacco.reports.members', compact('data'));
    }

    /**
     * Transactions report
     */
    public function transactionsReport(Request $request)
    {
        $startDate = $request->start_date ? Carbon::parse($request->start_date) : now()->startOfMonth();
        $endDate = $request->end_date ? Carbon::parse($request->end_date) : now()->endOfMonth();

        $data = [
            'total_transactions' => SaccoSavingsTransaction::whereBetween('created_at', [$startDate, $endDate])->count(),
            'total_volume' => SaccoSavingsTransaction::whereBetween('created_at', [$startDate, $endDate])->sum('amount_ugx'),
            'by_type' => SaccoSavingsTransaction::whereBetween('created_at', [$startDate, $endDate])
                ->selectRaw('type, COUNT(*) as count, SUM(amount_ugx) as total')
                ->groupBy('type')
                ->get(),
        ];

        return view('backend.sacco.reports.transactions', compact('data', 'startDate', 'endDate'));
    }

    /**
     * Generate custom report
     */
    public function generateReport(Request $request)
    {
        $request->validate([
            'report_type' => 'required|string|in:financial,members,loans,transactions,savings',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'format' => 'required|in:pdf,excel,csv',
        ]);

        $startDate = Carbon::parse($request->start_date);
        $endDate = Carbon::parse($request->end_date);
        $reportType = $request->report_type;
        $format = $request->format;

        // Gather report data based on type
        $reportData = $this->gatherReportData($reportType, $startDate, $endDate);

        if ($format === 'csv') {
            return $this->exportReportAsCsv($reportType, $reportData, $startDate, $endDate);
        }

        // PDF/Excel - return printable HTML view
        return view('backend.sacco.reports.export', [
            'reportType' => $reportType,
            'data' => $reportData,
            'startDate' => $startDate,
            'endDate' => $endDate,
        ]);
    }

    /**
     * Gather report data based on type
     */
    protected function gatherReportData(string $type, Carbon $startDate, Carbon $endDate): array
    {
        return match($type) {
            'financial' => [
                'total_deposits' => SaccoSavingsTransaction::where('type', 'deposit')
                    ->whereBetween('created_at', [$startDate, $endDate])->sum('amount_ugx'),
                'total_withdrawals' => SaccoSavingsTransaction::where('type', 'withdrawal')
                    ->whereBetween('created_at', [$startDate, $endDate])->sum('amount_ugx'),
                'total_loans_disbursed' => SaccoLoan::whereBetween('disbursed_at', [$startDate, $endDate])->sum('principal_amount_ugx'),
                'total_repayments' => SaccoLoan::whereBetween('updated_at', [$startDate, $endDate])->sum('amount_paid_ugx'),
                'net_position' => SaccoSavingsAccount::sum('balance_ugx'),
            ],
            'members' => [
                'total_members' => SaccoMember::count(),
                'new_members' => SaccoMember::whereBetween('joined_at', [$startDate, $endDate])->count(),
                'active_members' => SaccoMember::where('status', 'active')->count(),
                'members_list' => SaccoMember::with('user')
                    ->whereBetween('joined_at', [$startDate, $endDate])
                    ->get(),
            ],
            'loans' => [
                'total_disbursed' => SaccoLoan::whereBetween('disbursed_at', [$startDate, $endDate])->sum('principal_amount_ugx'),
                'active_loans' => SaccoLoan::where('status', 'active')->count(),
                'defaulted_loans' => SaccoLoan::where('status', 'defaulted')->count(),
                'loans_list' => SaccoLoan::with('member.user')
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->get(),
            ],
            'transactions' => [
                'total_count' => SaccoSavingsTransaction::whereBetween('created_at', [$startDate, $endDate])->count(),
                'total_volume' => SaccoSavingsTransaction::whereBetween('created_at', [$startDate, $endDate])->sum('amount_ugx'),
                'by_type' => SaccoSavingsTransaction::whereBetween('created_at', [$startDate, $endDate])
                    ->selectRaw('type, COUNT(*) as count, SUM(amount_ugx) as total')
                    ->groupBy('type')
                    ->get(),
            ],
            'savings' => [
                'total_savings' => SaccoSavingsAccount::where('account_type', 'regular')->sum('balance_ugx'),
                'members_with_savings' => SaccoSavingsAccount::where('account_type', 'regular')
                    ->where('balance_ugx', '>', 0)->distinct('member_id')->count('member_id'),
                'average_savings' => SaccoSavingsAccount::where('account_type', 'regular')
                    ->where('balance_ugx', '>', 0)->avg('balance_ugx'),
            ],
            default => [],
        };
    }

    /**
     * Export report as CSV
     */
    protected function exportReportAsCsv(string $type, array $data, Carbon $startDate, Carbon $endDate)
    {
        $filename = "sacco_{$type}_report_" . now()->format('YmdHis') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($type, $data, $startDate, $endDate) {
            $file = fopen('php://output', 'w');
            
            fputcsv($file, ["SACCO " . ucfirst($type) . " Report"]);
            fputcsv($file, ['Period:', $startDate->format('Y-m-d') . ' to ' . $endDate->format('Y-m-d')]);
            fputcsv($file, ['Generated:', now()->format('Y-m-d H:i:s')]);
            fputcsv($file, []);

            foreach ($data as $key => $value) {
                if (is_array($value) || $value instanceof \Illuminate\Support\Collection) {
                    continue; // Skip complex data in simple CSV
                }
                fputcsv($file, [str_replace('_', ' ', ucfirst($key)), is_numeric($value) ? number_format($value, 2) : $value]);
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Savings report
     */
    public function savingsReport(Request $request)
    {
        $data = [
            'total_savings' => SaccoSavingsAccount::where('account_type', 'savings')->sum('balance_ugx'),
            'total_members_with_savings' => SaccoSavingsAccount::where('account_type', 'savings')
                ->where('balance_ugx', '>', 0)
                ->distinct('member_id')
                ->count(),
            'average_savings' => SaccoSavingsAccount::where('account_type', 'savings')
                ->where('balance_ugx', '>', 0)
                ->avg('balance_ugx'),
        ];

        return view('backend.sacco.reports.savings', compact('data'));
    }

    /**
     * Shares report
     */
    public function sharesReport(Request $request)
    {
        $data = [
            'total_shares' => SaccoSavingsAccount::where('account_type', 'shares')->sum('balance_ugx'),
            'total_shareholders' => SaccoSavingsAccount::where('account_type', 'shares')
                ->where('balance_ugx', '>', 0)
                ->distinct('member_id')
                ->count(),
            'average_shares' => SaccoSavingsAccount::where('account_type', 'shares')
                ->where('balance_ugx', '>', 0)
                ->avg('balance_ugx'),
        ];

        return view('backend.sacco.reports.shares', compact('data'));
    }

    /**
     * Dividends report
     */
    public function dividendsReport(Request $request)
    {
        $data = [
            'total_distributed' => SaccoDividend::where('status', 'distributed')->sum('distributable_amount'),
            'total_years' => SaccoDividend::where('status', 'distributed')->distinct('year')->count(),
            'history' => SaccoDividend::where('status', 'distributed')->orderBy('year', 'desc')->get(),
        ];

        return view('backend.sacco.reports.dividends-report', compact('data'));
    }

    /**
     * Performance report
     */
    public function performanceReport(Request $request)
    {
        $data = [
            'loan_portfolio_quality' => [
                'active' => SaccoLoan::where('status', 'active')->count(),
                'overdue' => SaccoLoan::where('status', 'overdue')->count(),
                'defaulted' => SaccoLoan::where('status', 'defaulted')->count(),
            ],
            'financial_health' => [
                'total_assets' => SaccoSavingsAccount::sum('balance_ugx'),
                'total_liabilities' => SaccoLoan::where('status', 'active')->sum('balance_ugx'),
                'capital_adequacy' => 0, // Calculate based on your formula
            ],
        ];

        return view('backend.sacco.reports.performance', compact('data'));
    }

    /**
     * Audit report
     */
    public function auditReport(Request $request)
    {
        $logs = SaccoAuditLog::with('user')
            ->when($request->start_date, function($q) use ($request) {
                $q->whereDate('created_at', '>=', $request->start_date);
            })
            ->when($request->end_date, function($q) use ($request) {
                $q->whereDate('created_at', '<=', $request->end_date);
            })
            ->latest()
            ->paginate(50);

        return view('backend.sacco.reports.audit', compact('logs'));
    }

    /**
     * Compliance report
     */
    public function complianceReport(Request $request)
    {
        $data = [
            'kyc_compliance' => [
                'verified' => SaccoMember::where('kyc_verified', true)->count(),
                'pending' => SaccoMember::where('kyc_verified', false)->count(),
            ],
            'loan_limits' => [
                'within_limits' => SaccoLoan::where('status', 'active')->count(), // Add proper check
                'exceeding_limits' => 0, // Calculate based on your rules
            ],
        ];

        return view('backend.sacco.reports.compliance', compact('data'));
    }

    /**
     * SACCO Settings
     */
    public function settings()
    {
        $config = config('sacco');

        return view('backend.sacco.settings', compact('config'));
    }

    /**
     * Update settings
     */
    public function updateSettings(Request $request)
    {
        $request->validate([
            'enabled' => 'boolean',
            'name' => 'required|string|max:255',
            'registration_number' => 'nullable|string',
            'min_savings' => 'required|numeric|min:0',
            'share_value' => 'required|numeric|min:0',
            'min_shares' => 'required|integer|min:1',
            'default_interest_rate' => 'required|numeric|min:0|max:100',
            'max_loan_multiple' => 'required|numeric|min:1',
            'penalty_rate' => 'required|numeric|min:0|max:100',
            'grace_period_days' => 'required|integer|min:0',
            'processing_fee_percentage' => 'required|numeric|min:0|max:100',
            'min_guarantors' => 'required|integer|min:0',
            'min_deposit' => 'required|numeric|min:0',
            'min_withdrawal' => 'required|numeric|min:0',
            'max_withdrawal' => 'required|numeric|min:0',
            'withdrawal_fee_percentage' => 'required|numeric|min:0|max:100',
            'auto_approve_transactions' => 'boolean',
            'auto_approve_threshold' => 'required|numeric|min:0',
            'enable_dividends' => 'boolean',
            'default_distribution_percentage' => 'required|numeric|min:0|max:100',
            'withholding_tax_percentage' => 'required|numeric|min:0|max:100',
            'savings_interest_rate' => 'required|numeric|min:0|max:100',
            'fixed_deposit_interest_rate' => 'required|numeric|min:0|max:100',
            'registration_fee' => 'required|numeric|min:0',
            'monthly_membership_fee' => 'required|numeric|min:0',
            'auto_approve_members' => 'boolean',
            'require_kyc' => 'boolean',
            'max_members' => 'required|integer|min:0',
            'enable_email_notifications' => 'boolean',
            'enable_sms_notifications' => 'boolean',
            'loan_reminder_days' => 'required|integer|min:0',
            'overdue_notice_days' => 'required|integer|min:0',
        ]);

        // Store old settings for audit
        $oldSettings = config('sacco');

        // Update settings in config file
        $configPath = config_path('sacco.php');
        $configContent = file_get_contents($configPath);
        
        // Update each setting in the config file
        foreach ($request->except(['_token', '_method']) as $key => $value) {
            $pattern = "/'$key'\s*=>\s*[^,\n]+/";
            $replacement = "'$key' => " . (is_bool($value) ? ($value ? 'true' : 'false') : (is_numeric($value) ? $value : "'$value'"));
            $configContent = preg_replace($pattern, $replacement, $configContent);
        }
        
        file_put_contents($configPath, $configContent);

        // Clear config cache
        \Artisan::call('config:clear');

        // Log the update
        SaccoAuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'settings_updated',
            'auditable_type' => 'SaccoSettings',
            'old_values' => $oldSettings,
            'new_values' => $request->except(['_token', '_method']),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ]);
        
        return redirect()->back()->with('success', 'Settings updated successfully.');
    }

    /**
     * Toggle SACCO module
     */
    public function toggleModule(Request $request)
    {
        // This would update SACCO_ENABLED in .env or database
        
        return redirect()->back()->with('success', 'SACCO module status updated.');
    }

    /**
     * Get member accounts (AJAX)
     */
    public function getMemberAccounts(SaccoMember $member)
    {
        return response()->json($member->savingsAccounts);
    }

    /**
     * Get member loans (AJAX)
     */
    public function getMemberLoans(SaccoMember $member)
    {
        return response()->json($member->loans()->with('loanProduct')->get());
    }

    /**
     * Get member transactions (AJAX)
     */
    public function getMemberTransactions(SaccoMember $member)
    {
        return response()->json($member->transactions()->latest()->get());
    }

    /**
     * Get loan repayments (AJAX)
     */
    public function getLoanRepayments(SaccoLoan $loan)
    {
        return response()->json($loan->repayments()->latest()->get());
    }

    /**
     * Board members
     */
    public function boardMembers()
    {
        $board = SaccoBoardMember::with(['member.user', 'appointedBy'])->get();

        return view('backend.sacco.board.index', compact('board'));
    }

    /**
     * Add board member
     */
    public function addBoardMember(Request $request)
    {
        $request->validate([
            'member_id' => 'required|exists:sacco_members,id',
            'position' => 'required|in:chairperson,vice_chairperson,secretary,treasurer,member',
            'term_start' => 'required|date',
            'term_end' => 'nullable|date|after:term_start',
            'is_active' => 'boolean',
            'responsibilities' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        // Check if member is already a board member
        if (SaccoBoardMember::where('member_id', $request->member_id)->where('is_active', true)->exists()) {
            return redirect()->back()->with('error', 'This member is already on the board.');
        }

        // Check if position is already taken (for unique positions)
        if (in_array($request->position, ['chairperson', 'secretary', 'treasurer'])) {
            if (SaccoBoardMember::where('position', $request->position)->where('is_active', true)->exists()) {
                return redirect()->back()->with('error', 'This position is already occupied.');
            }
        }

        $boardMember = SaccoBoardMember::create([
            'member_id' => $request->member_id,
            'position' => $request->position,
            'term_start' => $request->term_start,
            'term_end' => $request->term_end,
            'is_active' => $request->is_active ?? true,
            'responsibilities' => $request->responsibilities,
            'notes' => $request->notes,
            'appointed_by' => auth()->id(),
        ]);

        SaccoAuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'board_member_added',
            'auditable_type' => SaccoBoardMember::class,
            'auditable_id' => $boardMember->id,
            'new_values' => $boardMember->toArray(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ]);

        return redirect()->route('admin.sacco.board.index')
            ->with('success', 'Board member added successfully.');
    }

    /**
     * Remove board member
     */
    public function removeBoardMember(SaccoBoardMember $member)
    {
        $oldValues = $member->toArray();

        SaccoAuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'board_member_removed',
            'auditable_type' => SaccoBoardMember::class,
            'auditable_id' => $member->id,
            'old_values' => $oldValues,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ]);

        $member->delete();

        return redirect()->route('admin.sacco.board.index')
            ->with('success', 'Board member removed successfully.');
    }

    /**
     * Audit logs
     */
    public function auditLogs(Request $request)
    {
        $logs = SaccoAuditLog::with('user')->latest()->paginate(50);

        return view('backend.sacco.audit-logs', compact('logs'));
    }

    /**
     * Account Types Management - List all account types
     */
    public function accountTypes()
    {
        $accountTypes = \App\Models\Sacco\SaccoAccountType::orderBy('name')->get();
        
        return view('backend.sacco.account-types.index', compact('accountTypes'));
    }

    /**
     * Store a new account type
     */
    public function storeAccountType(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100|unique:sacco_account_types,name',
            'code' => 'required|string|max:10|unique:sacco_account_types,code',
            'description' => 'nullable|string|max:500',
            'interest_rate' => 'required|numeric|min:0|max:100',
            'minimum_balance' => 'required|numeric|min:0',
            'allow_withdrawals' => 'boolean',
            'allow_deposits' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $accountType = \App\Models\Sacco\SaccoAccountType::create([
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'description' => $request->description,
            'interest_rate' => $request->interest_rate,
            'minimum_balance_ugx' => $request->minimum_balance,
            'allow_withdrawals' => $request->boolean('allow_withdrawals', true),
            'allow_deposits' => $request->boolean('allow_deposits', true),
            'is_active' => $request->boolean('is_active', true),
        ]);

        SaccoAuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'account_type_created',
            'auditable_type' => \App\Models\Sacco\SaccoAccountType::class,
            'auditable_id' => $accountType->id,
            'new_values' => $accountType->toArray(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ]);

        return redirect()->route('admin.sacco.account-types.index')
            ->with('success', 'Account type created successfully.');
    }

    /**
     * Update account type
     */
    public function updateAccountType(Request $request, $accountTypeId)
    {
        $accountType = \App\Models\Sacco\SaccoAccountType::findOrFail($accountTypeId);
        
        $request->validate([
            'name' => 'required|string|max:100|unique:sacco_account_types,name,' . $accountType->id,
            'code' => 'required|string|max:10|unique:sacco_account_types,code,' . $accountType->id,
            'description' => 'nullable|string|max:500',
            'interest_rate' => 'required|numeric|min:0|max:100',
            'minimum_balance' => 'required|numeric|min:0',
            'allow_withdrawals' => 'boolean',
            'allow_deposits' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $oldValues = $accountType->toArray();

        $accountType->update([
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'description' => $request->description,
            'interest_rate' => $request->interest_rate,
            'minimum_balance_ugx' => $request->minimum_balance,
            'allow_withdrawals' => $request->boolean('allow_withdrawals', true),
            'allow_deposits' => $request->boolean('allow_deposits', true),
            'is_active' => $request->boolean('is_active', true),
        ]);

        SaccoAuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'account_type_updated',
            'auditable_type' => \App\Models\Sacco\SaccoAccountType::class,
            'auditable_id' => $accountType->id,
            'old_values' => $oldValues,
            'new_values' => $accountType->toArray(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ]);

        return redirect()->route('admin.sacco.account-types.index')
            ->with('success', 'Account type updated successfully.');
    }

    /**
     * Delete account type
     */
    public function deleteAccountType($accountTypeId)
    {
        $accountType = \App\Models\Sacco\SaccoAccountType::findOrFail($accountTypeId);
        
        // Check if any accounts are using this type
        $accountsCount = \App\Modules\Sacco\Models\SaccoSavingsAccount::where('account_type', $accountType->code)->count();
        
        if ($accountsCount > 0) {
            return redirect()->back()->with('error', "Cannot delete: {$accountsCount} accounts are using this type.");
        }

        $oldValues = $accountType->toArray();

        SaccoAuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'account_type_deleted',
            'auditable_type' => \App\Models\Sacco\SaccoAccountType::class,
            'auditable_id' => $accountType->id,
            'old_values' => $oldValues,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ]);

        $accountType->delete();

        return redirect()->route('admin.sacco.account-types.index')
            ->with('success', 'Account type deleted successfully.');
    }

    /**
     * View member accounts
     */
    public function memberAccounts(SaccoMember $member)
    {
        $member->load(['user', 'savingsAccounts', 'accounts']);
        $accountTypes = \App\Models\Sacco\SaccoAccountType::where('is_active', true)->get();
        
        return view('backend.sacco.members.accounts', compact('member', 'accountTypes'));
    }

    /**
     * Create account for member
     */
    public function createMemberAccount(Request $request, SaccoMember $member)
    {
        $request->validate([
            'account_type' => 'required|string|max:50',
            'account_name' => 'required|string|max:100',
            'interest_rate' => 'required|numeric|min:0|max:100',
            'initial_balance' => 'nullable|numeric|min:0',
        ]);

        // Generate account number
        $prefix = strtoupper(substr($request->account_type, 0, 3));
        $accountNumber = $prefix . '-' . str_pad($member->id, 8, '0', STR_PAD_LEFT);
        
        // Check if account with same type already exists
        $existingAccount = \App\Modules\Sacco\Models\SaccoSavingsAccount::where('member_id', $member->id)
            ->where('account_type', $request->account_type)
            ->first();
        
        if ($existingAccount) {
            return redirect()->back()->with('error', 'Member already has an account of this type.');
        }

        $account = \App\Modules\Sacco\Models\SaccoSavingsAccount::create([
            'uuid' => \Illuminate\Support\Str::uuid(),
            'member_id' => $member->id,
            'account_number' => $accountNumber,
            'account_type' => $request->account_type,
            'account_name' => $request->account_name,
            'balance_ugx' => $request->initial_balance ?? 0,
            'interest_rate' => $request->interest_rate,
            'status' => 'active',
        ]);

        SaccoAuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'member_account_created',
            'auditable_type' => \App\Modules\Sacco\Models\SaccoSavingsAccount::class,
            'auditable_id' => $account->id,
            'new_values' => array_merge($account->toArray(), ['member_name' => $member->user->name]),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ]);

        return redirect()->back()->with('success', "Account '{$request->account_name}' created successfully for {$member->user->name}.");
    }

    /**
     * Update member account
     */
    public function updateMemberAccount(Request $request, $accountId)
    {
        $account = \App\Modules\Sacco\Models\SaccoSavingsAccount::findOrFail($accountId);
        
        $request->validate([
            'account_name' => 'required|string|max:100',
            'interest_rate' => 'required|numeric|min:0|max:100',
            'status' => 'required|in:active,dormant,closed',
        ]);

        $oldValues = $account->toArray();

        $account->update([
            'account_name' => $request->account_name,
            'interest_rate' => $request->interest_rate,
            'status' => $request->status,
        ]);

        SaccoAuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'member_account_updated',
            'auditable_type' => \App\Modules\Sacco\Models\SaccoSavingsAccount::class,
            'auditable_id' => $account->id,
            'old_values' => $oldValues,
            'new_values' => $account->toArray(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ]);

        return redirect()->back()->with('success', 'Account updated successfully.');
    }

    /**
     * Delete member account
     */
    public function deleteMemberAccount($accountId)
    {
        $account = \App\Modules\Sacco\Models\SaccoSavingsAccount::findOrFail($accountId);
        
        // Check if account has balance
        if ($account->balance_ugx > 0) {
            return redirect()->back()->with('error', 'Cannot delete account with balance. Please withdraw or transfer funds first.');
        }

        // Check if account has transactions
        $transactionsCount = $account->transactions()->count();
        if ($transactionsCount > 0) {
            return redirect()->back()->with('error', "Cannot delete: Account has {$transactionsCount} transaction(s). Consider closing the account instead.");
        }

        $oldValues = $account->toArray();

        SaccoAuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'member_account_deleted',
            'auditable_type' => \App\Modules\Sacco\Models\SaccoSavingsAccount::class,
            'auditable_id' => $account->id,
            'old_values' => $oldValues,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ]);

        $account->delete();

        return redirect()->back()->with('success', 'Account deleted successfully.');
    }
}
