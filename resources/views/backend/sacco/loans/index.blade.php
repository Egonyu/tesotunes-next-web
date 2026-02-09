@extends('layouts.admin')

@section('title', 'SACCO Loans')

@section('content')
<div class="dashboard-content">
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-6">
        <div>
            <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">SACCO Loans</h1>
            <p class="text-slate-600 dark:text-navy-300 mt-1">Manage loan applications and disbursements</p>
        </div>
        <div class="flex items-center gap-3">
            <a href="{{ route('admin.sacco.loans.pending') }}" class="inline-flex items-center gap-2 px-4 py-2 bg-warning/10 text-warning hover:bg-warning/20 rounded-lg transition">
                <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pending Loans
            </a>
            <a href="{{ route('admin.sacco.loans.overdue') }}" class="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition">
                <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Overdue Loans
            </a>
        </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-6">
        <div class="card p-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-slate-600 dark:text-navy-300 text-sm">Total Loans</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50 mt-1">{{ $loans->total() }}</p>
                </div>
                <div class="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                    <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="card p-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-slate-600 dark:text-navy-300 text-sm">Pending</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50 mt-1">{{ $loans->where('status', 'pending')->count() }}</p>
                </div>
                <div class="p-2 bg-warning/10 text-warning rounded-lg">
                    <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="card p-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-slate-600 dark:text-navy-300 text-sm">Active</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50 mt-1">{{ $loans->where('status', 'active')->count() }}</p>
                </div>
                <div class="p-2 bg-success/10 text-success rounded-lg">
                    <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="card p-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-slate-600 dark:text-navy-300 text-sm">Overdue</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50 mt-1">{{ $loans->where('status', 'overdue')->count() }}</p>
                </div>
                <div class="p-2 bg-red-500/10 text-red-500 rounded-lg">
                    <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="card p-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-slate-600 dark:text-navy-300 text-sm">Completed</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50 mt-1">{{ $loans->where('status', 'completed')->count() }}</p>
                </div>
                <div class="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                    <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            </div>
        </div>
    </div>

    <!-- Filter Form -->
    <div class="card p-5 mb-6">
        <form method="GET" action="{{ route('admin.sacco.loans.index') }}" class="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div class="md:col-span-4">
                <select name="status" class="w-full px-4 py-2 border border-slate-300 dark:border-navy-400 rounded-lg focus:ring-2 focus:ring-primary">
                    <option value="">All Status</option>
                    <option value="pending" {{ request('status') === 'pending' ? 'selected' : '' }}>Pending</option>
                    <option value="approved" {{ request('status') === 'approved' ? 'selected' : '' }}>Approved</option>
                    <option value="active" {{ request('status') === 'active' ? 'selected' : '' }}>Active</option>
                    <option value="overdue" {{ request('status') === 'overdue' ? 'selected' : '' }}>Overdue</option>
                    <option value="completed" {{ request('status') === 'completed' ? 'selected' : '' }}>Completed</option>
                    <option value="defaulted" {{ request('status') === 'defaulted' ? 'selected' : '' }}>Defaulted</option>
                </select>
            </div>
            <div class="md:col-span-8 flex gap-2">
                <button type="submit" class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition">
                    <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filter
                </button>
                <a href="{{ route('admin.sacco.loans.index') }}" class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 dark:bg-navy-600 text-slate-700 dark:text-navy-100 rounded-lg hover:bg-slate-300 transition">
                    <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset
                </a>
            </div>
        </form>
    </div>

    <!-- Loans Table -->
    <div class="card">
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead class="bg-slate-50 dark:bg-navy-600">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-navy-200 uppercase tracking-wider">Loan #</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-navy-200 uppercase tracking-wider">Member</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-navy-200 uppercase tracking-wider">Product</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-navy-200 uppercase tracking-wider">Principal</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-navy-200 uppercase tracking-wider">Total Amount</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-navy-200 uppercase tracking-wider">Outstanding</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-navy-200 uppercase tracking-wider">Status</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-navy-200 uppercase tracking-wider">Date</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-navy-200 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 dark:divide-navy-500">
                    @forelse($loans as $loan)
                    <tr class="hover:bg-slate-50 dark:hover:bg-navy-600 transition">
                        <td class="px-4 py-3 text-sm font-medium text-slate-800 dark:text-navy-50">{{ $loan->loan_number }}</td>
                        <td class="px-4 py-3">
                            <div class="text-sm font-medium text-slate-800 dark:text-navy-50">{{ $loan->member->user->display_name ?? $loan->member->user->username }}</div>
                            <div class="text-xs text-slate-500 dark:text-navy-400">{{ $loan->member->membership_number }}</div>
                        </td>
                        <td class="px-4 py-3 text-sm text-slate-700 dark:text-navy-200">{{ $loan->loanProduct->name ?? 'N/A' }}</td>
                        <td class="px-4 py-3 text-sm font-medium text-slate-800 dark:text-navy-50">{{ $loan->formatted_principal }}</td>
                        <td class="px-4 py-3 text-sm text-slate-700 dark:text-navy-200">UGX {{ number_format($loan->total_amount, 2) }}</td>
                        <td class="px-4 py-3 text-sm font-medium text-slate-800 dark:text-navy-50">{{ $loan->formatted_outstanding }}</td>
                        <td class="px-4 py-3">
                            <span class="px-2 py-1 text-xs font-medium rounded-full 
                                {{ $loan->status === 'pending' ? 'bg-warning/10 text-warning' : '' }}
                                {{ $loan->status === 'approved' ? 'bg-info/10 text-info' : '' }}
                                {{ $loan->status === 'active' ? 'bg-success/10 text-success' : '' }}
                                {{ $loan->status === 'overdue' ? 'bg-red-500/10 text-red-500' : '' }}
                                {{ $loan->status === 'completed' ? 'bg-blue-500/10 text-blue-500' : '' }}
                                {{ $loan->status === 'defaulted' ? 'bg-slate-500/10 text-slate-500' : '' }}">
                                {{ ucfirst($loan->status) }}
                            </span>
                        </td>
                        <td class="px-4 py-3 text-sm text-slate-700 dark:text-navy-200">{{ $loan->application_date->format('M d, Y') }}</td>
                        <td class="px-4 py-3">
                            <div class="flex items-center gap-2">
                                <a href="{{ route('admin.sacco.loans.show', $loan) }}" 
                                   class="inline-flex items-center justify-center size-8 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition">
                                    <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </a>
                                @if($loan->status === 'pending')
                                <form action="{{ route('admin.sacco.loans.approve', $loan) }}" method="POST" class="inline">
                                    @csrf
                                    <button type="submit" 
                                            class="inline-flex items-center justify-center size-8 bg-success/10 text-success hover:bg-success/20 rounded-lg transition"
                                            onclick="return confirm('Approve this loan?')">
                                        <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </button>
                                </form>
                                @endif
                            </div>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="9" class="px-4 py-12 text-center">
                            <div class="flex flex-col items-center">
                                <svg class="size-12 text-slate-400 dark:text-navy-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p class="text-slate-500 dark:text-navy-400">No loans found</p>
                            </div>
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        @if($loans->hasPages())
        <div class="px-4 py-3 border-t border-slate-200 dark:border-navy-500">
            {{ $loans->links() }}
        </div>
        @endif
    </div>
</div>
@endsection
