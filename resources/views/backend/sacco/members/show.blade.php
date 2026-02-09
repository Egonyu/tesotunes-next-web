@extends('layouts.admin')

@section('title', 'Member Details - ' . $member->user->display_name ?? $member->user->username)

@section('content')
<div class="dashboard-content">
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
            <a href="{{ route('admin.sacco.members.index') }}" 
               class="inline-flex items-center justify-center size-10 bg-slate-200 dark:bg-navy-600 text-slate-700 dark:text-navy-100 rounded-lg hover:bg-slate-300 transition">
                <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
            </a>
            <div>
                <h1 class="text-2xl font-bold text-slate-800 dark:text-navy-50">{{ $member->user->display_name ?? $member->user->username }}</h1>
                <p class="text-slate-600 dark:text-navy-300 mt-1">Member #{{ $member->membership_number }}</p>
            </div>
        </div>
        <div class="flex items-center gap-2">
            @if($member->status === 'pending')
                <form action="{{ route('admin.sacco.members.approve', $member) }}" method="POST" class="inline">
                    @csrf
                    <button type="submit" class="inline-flex items-center gap-2 px-4 py-2 bg-success text-white rounded-lg hover:bg-success-dark transition">
                        <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Approve Member
                    </button>
                </form>
                <button onclick="document.getElementById('rejectModal').classList.remove('hidden')" 
                        class="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                    <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Reject
                </button>
            @elseif($member->status === 'active')
                <button onclick="document.getElementById('suspendModal').classList.remove('hidden')" 
                        class="inline-flex items-center gap-2 px-4 py-2 bg-warning text-white rounded-lg hover:bg-warning-dark transition">
                    <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    Suspend
                </button>
            @elseif($member->status === 'suspended')
                <form action="{{ route('admin.sacco.members.activate', $member) }}" method="POST" class="inline">
                    @csrf
                    <button type="submit" class="inline-flex items-center gap-2 px-4 py-2 bg-success text-white rounded-lg hover:bg-success-dark transition">
                        <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Activate
                    </button>
                </form>
            @endif
            <button onclick="document.getElementById('creditScoreModal').classList.remove('hidden')" 
                    class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition">
                <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Update Credit Score
            </button>
            <a href="{{ route('admin.sacco.member-accounts.index', $member) }}" 
               class="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
                <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Manage Accounts
            </a>
        </div>
    </div>

    <!-- Member Info Cards -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
        <!-- Personal Information -->
        <div class="card p-5">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Personal Information</h3>
            <div class="space-y-3">
                <div>
                    <p class="text-xs text-slate-500 dark:text-navy-400">Full Name</p>
                    <p class="text-sm font-medium text-slate-800 dark:text-navy-50">{{ $member->user->display_name ?? $member->user->username }}</p>
                </div>
                <div>
                    <p class="text-xs text-slate-500 dark:text-navy-400">Email</p>
                    <p class="text-sm font-medium text-slate-800 dark:text-navy-50">{{ $member->user->email }}</p>
                </div>
                <div>
                    <p class="text-xs text-slate-500 dark:text-navy-400">Phone</p>
                    <p class="text-sm font-medium text-slate-800 dark:text-navy-50">{{ $member->user->phone ?? 'N/A' }}</p>
                </div>
                <div>
                    <p class="text-xs text-slate-500 dark:text-navy-400">Member Type</p>
                    <span class="inline-block px-2 py-1 text-xs font-medium rounded-full bg-info/10 text-info">
                        {{ ucfirst($member->member_type) }}
                    </span>
                </div>
                <div>
                    <p class="text-xs text-slate-500 dark:text-navy-400">Status</p>
                    <span class="inline-block px-2 py-1 text-xs font-medium rounded-full 
                        {{ $member->status === 'active' ? 'bg-success/10 text-success' : '' }}
                        {{ $member->status === 'pending' ? 'bg-warning/10 text-warning' : '' }}
                        {{ $member->status === 'suspended' ? 'bg-red-500/10 text-red-500' : '' }}
                        {{ $member->status === 'rejected' ? 'bg-slate-500/10 text-slate-500' : '' }}">
                        {{ ucfirst($member->status) }}
                    </span>
                </div>
                <div>
                    <p class="text-xs text-slate-500 dark:text-navy-400">Joined Date</p>
                    <p class="text-sm font-medium text-slate-800 dark:text-navy-50">{{ $member->created_at->format('M d, Y') }}</p>
                </div>
            </div>
        </div>

        <!-- Credit Score -->
        <div class="card p-5">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Credit Score</h3>
            <div class="text-center mb-4">
                <div class="text-5xl font-bold text-slate-800 dark:text-navy-50 mb-2">{{ $member->credit_score }}</div>
                <div class="text-sm text-slate-500 dark:text-navy-400">Out of 900</div>
            </div>
            <div class="relative pt-1">
                <div class="flex mb-2 items-center justify-between">
                    <div>
                        <span class="text-xs font-semibold inline-block text-slate-600 dark:text-navy-300">
                            Score Rating
                        </span>
                    </div>
                    <div class="text-right">
                        <span class="text-xs font-semibold inline-block text-slate-600 dark:text-navy-300">
                            {{ number_format(($member->credit_score / 900) * 100, 1) }}%
                        </span>
                    </div>
                </div>
                <div class="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-slate-200 dark:bg-navy-500">
                    <div style="width:{{ ($member->credit_score / 900) * 100 }}%" 
                         class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-green-500"></div>
                </div>
            </div>
            <div class="text-xs text-slate-500 dark:text-navy-400 mt-4">
                <p class="mb-1"><strong>Last Updated:</strong> {{ $member->updated_at->diffForHumans() }}</p>
                @if($member->credit_score >= 700)
                    <p class="text-success">✓ Excellent credit rating</p>
                @elseif($member->credit_score >= 600)
                    <p class="text-info">✓ Good credit rating</p>
                @elseif($member->credit_score >= 500)
                    <p class="text-warning">⚠ Fair credit rating</p>
                @else
                    <p class="text-red-500">✗ Poor credit rating</p>
                @endif
            </div>
        </div>

        <!-- Account Summary -->
        <div class="card p-5">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Account Summary</h3>
            <div class="space-y-4">
                <div class="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                    <div>
                        <p class="text-xs text-slate-600 dark:text-navy-300">Savings Account</p>
                        <p class="text-lg font-bold text-slate-800 dark:text-navy-50">
                            UGX {{ number_format($member->accounts->where('account_type', 'savings')->sum('balance')) }}
                        </p>
                    </div>
                    <svg class="size-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
                <div class="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                    <div>
                        <p class="text-xs text-slate-600 dark:text-navy-300">Shares</p>
                        <p class="text-lg font-bold text-slate-800 dark:text-navy-50">
                            UGX {{ number_format($member->accounts->where('account_type', 'shares')->sum('balance')) }}
                        </p>
                    </div>
                    <svg class="size-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <div class="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg">
                    <div>
                        <p class="text-xs text-slate-600 dark:text-navy-300">Fixed Deposits</p>
                        <p class="text-lg font-bold text-slate-800 dark:text-navy-50">
                            UGX {{ number_format($member->accounts->where('account_type', 'fixed_deposit')->sum('balance')) }}
                        </p>
                    </div>
                    <svg class="size-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
        </div>
    </div>

    <!-- Loans & Transactions -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <!-- Active Loans -->
        <div class="card p-5">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50">Active Loans</h3>
                <span class="text-sm text-slate-500 dark:text-navy-400">{{ $member->loans->count() }} Total</span>
            </div>
            <div class="space-y-3">
                @forelse($member->loans->take(5) as $loan)
                    <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-navy-600 rounded-lg">
                        <div>
                            <p class="text-sm font-medium text-slate-800 dark:text-navy-50">{{ $loan->loan_number }}</p>
                            <p class="text-xs text-slate-500 dark:text-navy-400">{{ $loan->loanProduct->name ?? 'N/A' }}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-sm font-bold text-slate-800 dark:text-navy-50">UGX {{ number_format($loan->principal_amount) }}</p>
                            <span class="text-xs px-2 py-0.5 rounded-full 
                                {{ $loan->status === 'active' ? 'bg-success/10 text-success' : '' }}
                                {{ $loan->status === 'overdue' ? 'bg-red-500/10 text-red-500' : '' }}
                                {{ $loan->status === 'pending' ? 'bg-warning/10 text-warning' : '' }}">
                                {{ ucfirst($loan->status) }}
                            </span>
                        </div>
                    </div>
                @empty
                    <p class="text-center py-8 text-slate-400 dark:text-navy-400">No loans</p>
                @endforelse
            </div>
        </div>

        <!-- Recent Transactions -->
        <div class="card p-5">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50">Recent Transactions</h3>
                <span class="text-sm text-slate-500 dark:text-navy-400">Last 5</span>
            </div>
            <div class="space-y-3">
                @forelse($member->transactions->take(5) as $transaction)
                    <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-navy-600 rounded-lg">
                        <div>
                            <p class="text-sm font-medium text-slate-800 dark:text-navy-50">{{ ucfirst(str_replace('_', ' ', $transaction->transaction_type)) }}</p>
                            <p class="text-xs text-slate-500 dark:text-navy-400">{{ $transaction->created_at->format('M d, Y') }}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-sm font-bold text-slate-800 dark:text-navy-50">UGX {{ number_format($transaction->amount) }}</p>
                            <span class="text-xs px-2 py-0.5 rounded-full {{ $transaction->status === 'completed' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning' }}">
                                {{ ucfirst($transaction->status) }}
                            </span>
                        </div>
                    </div>
                @empty
                    <p class="text-center py-8 text-slate-400 dark:text-navy-400">No transactions</p>
                @endforelse
            </div>
        </div>
    </div>
</div>

<!-- Modals -->
<!-- Reject Modal -->
<div id="rejectModal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-navy-700 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-bold text-slate-800 dark:text-navy-50 mb-4">Reject Member Application</h3>
        <form action="{{ route('admin.sacco.members.reject', $member) }}" method="POST">
            @csrf
            <div class="mb-4">
                <label class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">Reason for Rejection</label>
                <textarea name="reason" rows="4" required class="w-full px-3 py-2 border border-slate-300 dark:border-navy-400 rounded-lg focus:ring-2 focus:ring-primary"></textarea>
            </div>
            <div class="flex gap-2">
                <button type="button" onclick="document.getElementById('rejectModal').classList.add('hidden')" 
                        class="flex-1 px-4 py-2 bg-slate-200 dark:bg-navy-600 rounded-lg">Cancel</button>
                <button type="submit" class="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg">Reject</button>
            </div>
        </form>
    </div>
</div>

<!-- Suspend Modal -->
<div id="suspendModal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-navy-700 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-bold text-slate-800 dark:text-navy-50 mb-4">Suspend Member</h3>
        <form action="{{ route('admin.sacco.members.suspend', $member) }}" method="POST">
            @csrf
            <div class="mb-4">
                <label class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">Reason for Suspension</label>
                <textarea name="reason" rows="4" required class="w-full px-3 py-2 border border-slate-300 dark:border-navy-400 rounded-lg focus:ring-2 focus:ring-primary"></textarea>
            </div>
            <div class="flex gap-2">
                <button type="button" onclick="document.getElementById('suspendModal').classList.add('hidden')" 
                        class="flex-1 px-4 py-2 bg-slate-200 dark:bg-navy-600 rounded-lg">Cancel</button>
                <button type="submit" class="flex-1 px-4 py-2 bg-warning text-white rounded-lg">Suspend</button>
            </div>
        </form>
    </div>
</div>

<!-- Credit Score Modal -->
<div id="creditScoreModal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-navy-700 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-bold text-slate-800 dark:text-navy-50 mb-4">Update Credit Score</h3>
        <form action="{{ route('admin.sacco.members.update-credit-score', $member) }}" method="POST">
            @csrf
            @method('PUT')
            <div class="mb-4">
                <label class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">Credit Score (300-900)</label>
                <input type="number" name="credit_score" min="300" max="900" value="{{ $member->credit_score }}" 
                       class="w-full px-3 py-2 border border-slate-300 dark:border-navy-400 rounded-lg focus:ring-2 focus:ring-primary" required>
                <p class="text-xs text-slate-500 dark:text-navy-400 mt-1">Current score: {{ $member->credit_score }}</p>
            </div>
            <div class="flex gap-2">
                <button type="button" onclick="document.getElementById('creditScoreModal').classList.add('hidden')" 
                        class="flex-1 px-4 py-2 bg-slate-200 dark:bg-navy-600 rounded-lg">Cancel</button>
                <button type="submit" class="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg">Update</button>
            </div>
        </form>
    </div>
</div>
@endsection
