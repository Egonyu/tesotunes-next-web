@extends('layouts.admin')

@section('title', 'Pending Loan Applications')

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
                <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">Pending Loan Applications</h1>
                <p class="text-slate-600 dark:text-navy-300 mt-1">Review and approve loan requests</p>
            </div>
        </div>
        <div class="flex items-center gap-2">
            <span class="px-3 py-1.5 bg-warning/10 text-warning rounded-lg text-sm font-medium">
                {{ $loans->total() }} Pending
            </span>
        </div>
    </div>

    <!-- Pending Loans List -->
    <div class="space-y-4">
        @forelse($loans as $loan)
            <div class="card p-5">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <!-- Loan Header -->
                        <div class="flex items-center gap-4 mb-4">
                            <div class="size-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-1">
                                    <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50">{{ $loan->member->user->display_name ?? $loan->member->user->username }}</h3>
                                    <span class="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">
                                        Credit: {{ $loan->member->credit_score }}
                                    </span>
                                </div>
                                <p class="text-sm text-slate-500 dark:text-navy-400">{{ $loan->loan_number }} • {{ $loan->member->membership_number }}</p>
                            </div>
                        </div>

                        <!-- Loan Details Grid -->
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div class="p-3 bg-slate-50 dark:bg-navy-600 rounded-lg">
                                <p class="text-xs text-slate-500 dark:text-navy-400 mb-1">Loan Product</p>
                                <p class="text-sm font-medium text-slate-800 dark:text-navy-50">{{ $loan->loanProduct->name ?? 'N/A' }}</p>
                            </div>
                            <div class="p-3 bg-slate-50 dark:bg-navy-600 rounded-lg">
                                <p class="text-xs text-slate-500 dark:text-navy-400 mb-1">Principal Amount</p>
                                <p class="text-sm font-bold text-slate-800 dark:text-navy-50">UGX {{ number_format($loan->principal_amount) }}</p>
                            </div>
                            <div class="p-3 bg-slate-50 dark:bg-navy-600 rounded-lg">
                                <p class="text-xs text-slate-500 dark:text-navy-400 mb-1">Duration</p>
                                <p class="text-sm font-medium text-slate-800 dark:text-navy-50">{{ $loan->duration_months }} months</p>
                            </div>
                            <div class="p-3 bg-slate-50 dark:bg-navy-600 rounded-lg">
                                <p class="text-xs text-slate-500 dark:text-navy-400 mb-1">Interest Rate</p>
                                <p class="text-sm font-medium text-slate-800 dark:text-navy-50">{{ $loan->interest_rate }}%</p>
                            </div>
                        </div>

                        <!-- Additional Info -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p class="text-xs text-slate-500 dark:text-navy-400 mb-1">Total with Interest</p>
                                <p class="text-sm font-bold text-slate-800 dark:text-navy-50">UGX {{ number_format($loan->total_amount) }}</p>
                            </div>
                            <div>
                                <p class="text-xs text-slate-500 dark:text-navy-400 mb-1">Application Date</p>
                                <p class="text-sm font-medium text-slate-800 dark:text-navy-50">{{ $loan->application_date->format('M d, Y') }}</p>
                            </div>
                            <div>
                                <p class="text-xs text-slate-500 dark:text-navy-400 mb-1">Guarantors</p>
                                <p class="text-sm font-medium text-slate-800 dark:text-navy-50">
                                    {{ $loan->guarantors->count() }} 
                                    <span class="text-xs text-slate-500">({{ $loan->guarantors->where('status', 'approved')->count() }} approved)</span>
                                </p>
                            </div>
                        </div>

                        <!-- Member Savings Info -->
                        <div class="mt-4 p-3 bg-green-500/10 rounded-lg">
                            <div class="flex items-center justify-between">
                                <p class="text-xs text-slate-600 dark:text-navy-300">Member Savings Balance</p>
                                <p class="text-sm font-bold text-slate-800 dark:text-navy-50">
                                    UGX {{ number_format($loan->member->accounts->where('account_type', 'savings')->sum('balance')) }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex flex-col gap-2 ml-4">
                        <a href="{{ route('admin.sacco.loans.show', $loan) }}" 
                           class="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition">
                            <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Details
                        </a>
                        <button onclick="openApproveModal('{{ $loan->id }}', '{{ $loan->loan_number }}', '{{ number_format($loan->principal_amount) }}')" 
                                class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-success text-white hover:bg-success-dark rounded-lg transition">
                            <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Approve
                        </button>
                        <button onclick="openRejectModal('{{ $loan->id }}', '{{ $loan->loan_number }}')" 
                                class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition">
                            <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Reject
                        </button>
                    </div>
                </div>
            </div>
        @empty
            <div class="card p-12 text-center">
                <svg class="size-16 text-slate-400 dark:text-navy-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-2">No Pending Loans</h3>
                <p class="text-slate-500 dark:text-navy-400">All loan applications have been reviewed</p>
            </div>
        @endforelse
    </div>

    <!-- Pagination -->
    @if($loans->hasPages())
        <div class="mt-6">
            {{ $loans->links() }}
        </div>
    @endif
</div>

<!-- Approve Modal -->
<div id="approveModal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-navy-700 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-bold text-slate-800 dark:text-navy-50 mb-2">Approve Loan</h3>
        <p id="approveLoanNumber" class="text-sm text-slate-600 dark:text-navy-300 mb-4"></p>
        <form id="approveForm" method="POST">
            @csrf
            <div class="bg-slate-50 dark:bg-navy-600 p-3 rounded-lg mb-4">
                <p id="approveLoanAmount" class="text-sm text-slate-700 dark:text-navy-200 font-medium"></p>
            </div>
            <div class="mb-4">
                <label class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">Approval Notes (Optional)</label>
                <textarea name="approval_notes" rows="3" 
                          class="w-full px-3 py-2 border border-slate-300 dark:border-navy-400 rounded-lg focus:ring-2 focus:ring-primary"
                          placeholder="Add any notes about this approval..."></textarea>
            </div>
            <div class="flex gap-2">
                <button type="button" onclick="closeApproveModal()" 
                        class="flex-1 px-4 py-2 bg-slate-200 dark:bg-navy-600 rounded-lg hover:bg-slate-300 transition">
                    Cancel
                </button>
                <button type="submit" class="flex-1 px-4 py-2 bg-success text-white rounded-lg hover:bg-success-dark transition">
                    Approve Loan
                </button>
            </div>
        </form>
    </div>
</div>

<!-- Reject Modal -->
<div id="rejectModal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-navy-700 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-bold text-slate-800 dark:text-navy-50 mb-2">Reject Loan Application</h3>
        <p id="rejectLoanNumber" class="text-sm text-slate-600 dark:text-navy-300 mb-4"></p>
        <form id="rejectForm" method="POST">
            @csrf
            <div class="mb-4">
                <label class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">Reason for Rejection</label>
                <textarea name="rejection_reason" rows="4" required 
                          class="w-full px-3 py-2 border border-slate-300 dark:border-navy-400 rounded-lg focus:ring-2 focus:ring-primary"
                          placeholder="Provide a detailed reason for rejecting this loan application..."></textarea>
            </div>
            <div class="flex gap-2">
                <button type="button" onclick="closeRejectModal()" 
                        class="flex-1 px-4 py-2 bg-slate-200 dark:bg-navy-600 rounded-lg hover:bg-slate-300 transition">
                    Cancel
                </button>
                <button type="submit" class="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                    Reject Loan
                </button>
            </div>
        </form>
    </div>
</div>

@push('scripts')
<script>
function openApproveModal(loanId, loanNumber, amount) {
    document.getElementById('approveModal').classList.remove('hidden');
    document.getElementById('approveLoanNumber').textContent = 'Approving: ' + loanNumber;
    document.getElementById('approveLoanAmount').textContent = 'Amount: UGX ' + amount;
    document.getElementById('approveForm').action = `/admin/sacco/loans/${loanId}/approve`;
}

function closeApproveModal() {
    document.getElementById('approveModal').classList.add('hidden');
    document.getElementById('approveForm').reset();
}

function openRejectModal(loanId, loanNumber) {
    document.getElementById('rejectModal').classList.remove('hidden');
    document.getElementById('rejectLoanNumber').textContent = 'Rejecting: ' + loanNumber;
    document.getElementById('rejectForm').action = `/admin/sacco/loans/${loanId}/reject`;
}

function closeRejectModal() {
    document.getElementById('rejectModal').classList.add('hidden');
    document.getElementById('rejectForm').reset();
}

// Close modals on Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeApproveModal();
        closeRejectModal();
    }
});
</script>
@endpush
@endsection
