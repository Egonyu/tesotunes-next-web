@extends('layouts.admin')

@section('title', 'Loan Details - ' . $loan->loan_number)

@section('content')
<div class="dashboard-content">
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
            <a href="{{ route('admin.sacco.loans.index') }}" 
               class="inline-flex items-center justify-center size-10 bg-slate-200 dark:bg-navy-600 text-slate-700 dark:text-navy-100 rounded-lg hover:bg-slate-300 transition">
                <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
            </a>
            <div>
                <h1 class="text-2xl font-bold text-slate-800 dark:text-navy-50">{{ $loan->loan_number }}</h1>
                <p class="text-slate-600 dark:text-navy-300 mt-1">{{ $loan->loanProduct->name ?? 'N/A' }}</p>
            </div>
        </div>
        <div class="flex items-center gap-2">
            @if($loan->status === 'pending')
                <button onclick="document.getElementById('approveModal').classList.remove('hidden')" 
                        class="inline-flex items-center gap-2 px-4 py-2 bg-success text-white rounded-lg hover:bg-success-dark transition">
                    <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Approve Loan
                </button>
                <button onclick="document.getElementById('rejectModal').classList.remove('hidden')" 
                        class="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                    <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Reject
                </button>
            @elseif($loan->status === 'approved')
                <button onclick="document.getElementById('disburseModal').classList.remove('hidden')" 
                        class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition">
                    <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Disburse Loan
                </button>
            @endif
            <span class="px-3 py-1.5 rounded-lg text-sm font-medium
                {{ $loan->status === 'pending' ? 'bg-warning/10 text-warning' : '' }}
                {{ $loan->status === 'approved' ? 'bg-info/10 text-info' : '' }}
                {{ $loan->status === 'active' ? 'bg-success/10 text-success' : '' }}
                {{ $loan->status === 'overdue' ? 'bg-red-500/10 text-red-500' : '' }}
                {{ $loan->status === 'completed' ? 'bg-blue-500/10 text-blue-500' : '' }}">
                {{ ucfirst($loan->status) }}
            </span>
        </div>
    </div>

    <!-- Loan Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6 mb-6">
        <div class="card bg-gradient-to-br from-purple-500 to-purple-600 text-white p-5">
            <div class="flex items-center justify-between mb-2">
                <p class="text-purple-100 text-sm">Principal Amount</p>
                <svg class="size-6 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h3 class="text-2xl font-bold">UGX {{ number_format($loan->principal_amount) }}</h3>
        </div>

        <div class="card bg-gradient-to-br from-green-500 to-green-600 text-white p-5">
            <div class="flex items-center justify-between mb-2">
                <p class="text-green-100 text-sm">Total with Interest</p>
                <svg class="size-6 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            </div>
            <h3 class="text-2xl font-bold">UGX {{ number_format($loan->total_amount) }}</h3>
        </div>

        <div class="card bg-gradient-to-br from-orange-500 to-orange-600 text-white p-5">
            <div class="flex items-center justify-between mb-2">
                <p class="text-orange-100 text-sm">Amount Paid</p>
                <svg class="size-6 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h3 class="text-2xl font-bold">UGX {{ number_format($loan->amount_paid ?? 0) }}</h3>
        </div>

        <div class="card bg-gradient-to-br from-red-500 to-red-600 text-white p-5">
            <div class="flex items-center justify-between mb-2">
                <p class="text-red-100 text-sm">Outstanding</p>
                <svg class="size-6 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h3 class="text-2xl font-bold">UGX {{ number_format($loan->outstanding_balance ?? $loan->total_amount) }}</h3>
        </div>
    </div>

    <!-- Member & Loan Details -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
        <!-- Member Information -->
        <div class="card p-5">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Member Information</h3>
            <div class="flex items-center gap-3 mb-4 p-3 bg-slate-50 dark:bg-navy-600 rounded-lg">
                <div class="size-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                    {{ substr($loan->member->user->display_name ?? $loan->member->user->username, 0, 1) }}
                </div>
                <div>
                    <p class="font-medium text-slate-800 dark:text-navy-50">{{ $loan->member->user->display_name ?? $loan->member->user->username }}</p>
                    <p class="text-xs text-slate-500 dark:text-navy-400">{{ $loan->member->membership_number }}</p>
                </div>
            </div>
            <div class="space-y-3">
                <div>
                    <p class="text-xs text-slate-500 dark:text-navy-400">Email</p>
                    <p class="text-sm font-medium text-slate-800 dark:text-navy-50">{{ $loan->member->user->email }}</p>
                </div>
                <div>
                    <p class="text-xs text-slate-500 dark:text-navy-400">Phone</p>
                    <p class="text-sm font-medium text-slate-800 dark:text-navy-50">{{ $loan->member->user->phone ?? 'N/A' }}</p>
                </div>
                <div>
                    <p class="text-xs text-slate-500 dark:text-navy-400">Credit Score</p>
                    <div class="flex items-center gap-2">
                        <p class="text-sm font-bold text-slate-800 dark:text-navy-50">{{ $loan->member->credit_score }}</p>
                        <div class="flex-1 h-2 bg-slate-200 dark:bg-navy-500 rounded-full overflow-hidden">
                            <div class="h-full bg-gradient-to-r from-blue-500 to-green-500" style="width: {{ ($loan->member->credit_score / 900) * 100 }}%"></div>
                        </div>
                    </div>
                </div>
                <div class="pt-3 border-t border-slate-200 dark:border-navy-500">
                    <a href="{{ route('admin.sacco.members.show', $loan->member) }}" 
                       class="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                        View Full Profile
                        <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </a>
                </div>
            </div>
        </div>

        <!-- Loan Details -->
        <div class="card p-5">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Loan Details</h3>
            <div class="space-y-3">
                <div>
                    <p class="text-xs text-slate-500 dark:text-navy-400">Loan Product</p>
                    <p class="text-sm font-medium text-slate-800 dark:text-navy-50">{{ $loan->loanProduct->name ?? 'N/A' }}</p>
                </div>
                <div>
                    <p class="text-xs text-slate-500 dark:text-navy-400">Interest Rate</p>
                    <p class="text-sm font-medium text-slate-800 dark:text-navy-50">{{ $loan->interest_rate }}% per {{ $loan->interest_type ?? 'month' }}</p>
                </div>
                <div>
                    <p class="text-xs text-slate-500 dark:text-navy-400">Loan Duration</p>
                    <p class="text-sm font-medium text-slate-800 dark:text-navy-50">{{ $loan->duration_months }} months</p>
                </div>
                <div>
                    <p class="text-xs text-slate-500 dark:text-navy-400">Application Date</p>
                    <p class="text-sm font-medium text-slate-800 dark:text-navy-50">{{ $loan->application_date->format('M d, Y') }}</p>
                </div>
                @if($loan->approved_at)
                <div>
                    <p class="text-xs text-slate-500 dark:text-navy-400">Approved Date</p>
                    <p class="text-sm font-medium text-slate-800 dark:text-navy-50">{{ $loan->approved_at->format('M d, Y') }}</p>
                </div>
                @endif
                @if($loan->disbursed_at)
                <div>
                    <p class="text-xs text-slate-500 dark:text-navy-400">Disbursed Date</p>
                    <p class="text-sm font-medium text-slate-800 dark:text-navy-50">{{ $loan->disbursed_at->format('M d, Y') }}</p>
                </div>
                <div>
                    <p class="text-xs text-slate-500 dark:text-navy-400">Disbursement Method</p>
                    <p class="text-sm font-medium text-slate-800 dark:text-navy-50">{{ ucfirst(str_replace('_', ' ', $loan->disbursement_method)) }}</p>
                </div>
                @endif
            </div>
        </div>

        <!-- Guarantors -->
        <div class="card p-5">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Guarantors</h3>
            <div class="space-y-3">
                @forelse($loan->guarantors as $guarantor)
                    <div class="p-3 bg-slate-50 dark:bg-navy-600 rounded-lg">
                        <p class="text-sm font-medium text-slate-800 dark:text-navy-50">{{ $guarantor->guarantor->user->display_name ?? $guarantor->guarantor->user->username }}</p>
                        <p class="text-xs text-slate-500 dark:text-navy-400">{{ $guarantor->guarantor->membership_number }}</p>
                        <p class="text-xs text-slate-600 dark:text-navy-300 mt-1">Amount: UGX {{ number_format($guarantor->guaranteed_amount) }}</p>
                        <span class="inline-block mt-1 px-2 py-0.5 text-xs rounded-full {{ $guarantor->status === 'approved' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning' }}">
                            {{ ucfirst($guarantor->status) }}
                        </span>
                    </div>
                @empty
                    <p class="text-center py-4 text-slate-400 dark:text-navy-400 text-sm">No guarantors</p>
                @endforelse
            </div>
        </div>
    </div>

    <!-- Repayment Schedule & History -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <!-- Repayment Schedule -->
        <div class="card p-5">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Repayment Schedule</h3>
            <div class="space-y-2">
                @if($loan->repayments->count() > 0)
                    @foreach($loan->repayments->take(10) as $repayment)
                        <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-navy-600 rounded-lg">
                            <div>
                                <p class="text-sm font-medium text-slate-800 dark:text-navy-50">Payment #{{ $loop->iteration }}</p>
                                <p class="text-xs text-slate-500 dark:text-navy-400">Due: {{ $repayment->due_date->format('M d, Y') }}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-sm font-bold text-slate-800 dark:text-navy-50">UGX {{ number_format($repayment->amount) }}</p>
                                <span class="text-xs px-2 py-0.5 rounded-full {{ $repayment->status === 'paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning' }}">
                                    {{ ucfirst($repayment->status) }}
                                </span>
                            </div>
                        </div>
                    @endforeach
                @else
                    <p class="text-center py-8 text-slate-400 dark:text-navy-400">No repayment schedule yet</p>
                @endif
            </div>
        </div>

        <!-- Payment History -->
        <div class="card p-5">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Payment History</h3>
            <div class="space-y-2">
                @if($loan->repayments->where('status', 'paid')->count() > 0)
                    @foreach($loan->repayments->where('status', 'paid')->take(10) as $payment)
                        <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-navy-600 rounded-lg">
                            <div>
                                <p class="text-sm font-medium text-slate-800 dark:text-navy-50">Payment Received</p>
                                <p class="text-xs text-slate-500 dark:text-navy-400">{{ $payment->paid_at->format('M d, Y h:i A') }}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-sm font-bold text-success">UGX {{ number_format($payment->amount_paid) }}</p>
                                <p class="text-xs text-slate-500 dark:text-navy-400">{{ ucfirst($payment->payment_method ?? 'N/A') }}</p>
                            </div>
                        </div>
                    @endforeach
                @else
                    <p class="text-center py-8 text-slate-400 dark:text-navy-400">No payments yet</p>
                @endif
            </div>
        </div>
    </div>
</div>

<!-- Modals -->
<!-- Approve Modal -->
<div id="approveModal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-navy-700 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-bold text-slate-800 dark:text-navy-50 mb-4">Approve Loan</h3>
        <form action="{{ route('admin.sacco.loans.approve', $loan) }}" method="POST">
            @csrf
            <div class="mb-4">
                <label class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">Approval Notes (Optional)</label>
                <textarea name="approval_notes" rows="3" 
                          class="w-full px-3 py-2 border border-slate-300 dark:border-navy-400 rounded-lg focus:ring-2 focus:ring-primary"></textarea>
            </div>
            <div class="bg-slate-50 dark:bg-navy-600 p-3 rounded-lg mb-4">
                <p class="text-sm text-slate-700 dark:text-navy-200"><strong>Principal:</strong> UGX {{ number_format($loan->principal_amount) }}</p>
                <p class="text-sm text-slate-700 dark:text-navy-200"><strong>Total Amount:</strong> UGX {{ number_format($loan->total_amount) }}</p>
                <p class="text-sm text-slate-700 dark:text-navy-200"><strong>Duration:</strong> {{ $loan->duration_months }} months</p>
            </div>
            <div class="flex gap-2">
                <button type="button" onclick="document.getElementById('approveModal').classList.add('hidden')" 
                        class="flex-1 px-4 py-2 bg-slate-200 dark:bg-navy-600 rounded-lg">Cancel</button>
                <button type="submit" class="flex-1 px-4 py-2 bg-success text-white rounded-lg">Approve Loan</button>
            </div>
        </form>
    </div>
</div>

<!-- Reject Modal -->
<div id="rejectModal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-navy-700 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-bold text-slate-800 dark:text-navy-50 mb-4">Reject Loan Application</h3>
        <form action="{{ route('admin.sacco.loans.reject', $loan) }}" method="POST">
            @csrf
            <div class="mb-4">
                <label class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">Reason for Rejection</label>
                <textarea name="rejection_reason" rows="4" required 
                          class="w-full px-3 py-2 border border-slate-300 dark:border-navy-400 rounded-lg focus:ring-2 focus:ring-primary"></textarea>
            </div>
            <div class="flex gap-2">
                <button type="button" onclick="document.getElementById('rejectModal').classList.add('hidden')" 
                        class="flex-1 px-4 py-2 bg-slate-200 dark:bg-navy-600 rounded-lg">Cancel</button>
                <button type="submit" class="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg">Reject Loan</button>
            </div>
        </form>
    </div>
</div>

<!-- Disburse Modal -->
<div id="disburseModal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-navy-700 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-bold text-slate-800 dark:text-navy-50 mb-4">Disburse Loan</h3>
        <form action="{{ route('admin.sacco.loans.disburse', $loan) }}" method="POST">
            @csrf
            <div class="mb-4">
                <label class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">Disbursement Method</label>
                <select name="disbursement_method" required class="w-full px-3 py-2 border border-slate-300 dark:border-navy-400 rounded-lg focus:ring-2 focus:ring-primary">
                    <option value="">Select Method</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                </select>
            </div>
            <div class="mb-4">
                <label class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">Disbursement Notes (Optional)</label>
                <textarea name="disbursement_notes" rows="3" 
                          class="w-full px-3 py-2 border border-slate-300 dark:border-navy-400 rounded-lg focus:ring-2 focus:ring-primary"></textarea>
            </div>
            <div class="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg mb-4">
                <p class="text-sm text-slate-700 dark:text-navy-200"><strong>Amount to Disburse:</strong> UGX {{ number_format($loan->principal_amount) }}</p>
                <p class="text-sm text-slate-700 dark:text-navy-200"><strong>To:</strong> {{ $loan->member->user->display_name ?? $loan->member->user->username }}</p>
            </div>
            <div class="flex gap-2">
                <button type="button" onclick="document.getElementById('disburseModal').classList.add('hidden')" 
                        class="flex-1 px-4 py-2 bg-slate-200 dark:bg-navy-600 rounded-lg">Cancel</button>
                <button type="submit" class="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg">Disburse Now</button>
            </div>
        </form>
    </div>
</div>
@endsection
