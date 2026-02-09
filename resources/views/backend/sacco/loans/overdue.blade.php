@extends('layouts.admin')

@section('title', 'Overdue Loans')

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
                <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">Overdue Loans</h1>
                <p class="text-slate-600 dark:text-navy-300 mt-1">Loans past their payment due dates</p>
            </div>
        </div>
        <span class="px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg text-sm font-medium">
            {{ $loans->total() }} Overdue
        </span>
    </div>

    <!-- Alert Banner -->
    @if($loans->total() > 0)
    <div class="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
        <div class="flex items-start gap-3">
            <svg class="size-5 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div class="flex-1">
                <h3 class="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">Immediate Action Required</h3>
                <p class="text-sm text-red-700 dark:text-red-400">{{ $loans->total() }} loan(s) are past due. Contact members immediately to arrange payment.</p>
            </div>
        </div>
    </div>
    @endif

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6 mb-6">
        <div class="card bg-gradient-to-br from-red-500 to-red-600 text-white p-5">
            <div class="flex items-center justify-between mb-2">
                <p class="text-red-100 text-sm">Total Overdue</p>
                <svg class="size-6 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h3 class="text-2xl font-bold">{{ $loans->total() }}</h3>
        </div>

        <div class="card bg-gradient-to-br from-orange-500 to-orange-600 text-white p-5">
            <div class="flex items-center justify-between mb-2">
                <p class="text-orange-100 text-sm">Total Amount Overdue</p>
                <svg class="size-6 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h3 class="text-2xl font-bold">UGX {{ number_format($loans->sum('outstanding_balance')) }}</h3>
        </div>

        <div class="card bg-gradient-to-br from-purple-500 to-purple-600 text-white p-5">
            <div class="flex items-center justify-between mb-2">
                <p class="text-purple-100 text-sm">Average Days Overdue</p>
                <svg class="size-6 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
            <h3 class="text-2xl font-bold">15</h3>
        </div>

        <div class="card bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-5">
            <div class="flex items-center justify-between mb-2">
                <p class="text-indigo-100 text-sm">Penalties Accrued</p>
                <svg class="size-6 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </div>
            <h3 class="text-2xl font-bold">UGX {{ number_format($loans->sum('penalty_amount') ?? 0) }}</h3>
        </div>
    </div>

    <!-- Overdue Loans List -->
    <div class="space-y-4">
        @forelse($loans as $loan)
            @php
                $overdueDays = now()->diffInDays($loan->repayments()->where('status', 'overdue')->orderBy('due_date')->first()->due_date ?? now());
            @endphp
            <div class="card p-5 border-l-4 border-red-500">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center gap-3 mb-3">
                            <div class="size-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold">
                                <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50">{{ $loan->member->user->display_name ?? $loan->member->user->username }}</h3>
                                <p class="text-sm text-slate-500 dark:text-navy-400">{{ $loan->loan_number }} • {{ $loan->member->membership_number }}</p>
                            </div>
                            <span class="px-3 py-1 text-xs font-medium rounded-full bg-red-500/10 text-red-500">
                                {{ $overdueDays }} days overdue
                            </span>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                            <div class="p-3 bg-slate-50 dark:bg-navy-600 rounded-lg">
                                <p class="text-xs text-slate-500 dark:text-navy-400 mb-1">Loan Product</p>
                                <p class="text-sm font-medium text-slate-800 dark:text-navy-50">{{ $loan->loanProduct->name ?? 'N/A' }}</p>
                            </div>
                            <div class="p-3 bg-slate-50 dark:bg-navy-600 rounded-lg">
                                <p class="text-xs text-slate-500 dark:text-navy-400 mb-1">Principal</p>
                                <p class="text-sm font-bold text-slate-800 dark:text-navy-50">UGX {{ number_format($loan->principal_amount) }}</p>
                            </div>
                            <div class="p-3 bg-slate-50 dark:bg-navy-600 rounded-lg">
                                <p class="text-xs text-slate-500 dark:text-navy-400 mb-1">Outstanding</p>
                                <p class="text-sm font-bold text-red-500">UGX {{ number_format($loan->outstanding_balance ?? $loan->total_amount) }}</p>
                            </div>
                            <div class="p-3 bg-slate-50 dark:bg-navy-600 rounded-lg">
                                <p class="text-xs text-slate-500 dark:text-navy-400 mb-1">Contact</p>
                                <p class="text-sm font-medium text-slate-800 dark:text-navy-50">{{ $loan->member->user->phone ?? 'N/A' }}</p>
                            </div>
                            <div class="p-3 bg-slate-50 dark:bg-navy-600 rounded-lg">
                                <p class="text-xs text-slate-500 dark:text-navy-400 mb-1">Penalty</p>
                                <p class="text-sm font-bold text-orange-500">UGX {{ number_format($loan->penalty_amount ?? 0) }}</p>
                            </div>
                        </div>

                        <div class="flex items-center gap-4 p-3 bg-red-500/10 rounded-lg">
                            <div class="flex-1">
                                <p class="text-xs text-slate-600 dark:text-navy-300 mb-1">Last Payment</p>
                                <p class="text-sm font-medium text-slate-800 dark:text-navy-50">
                                    @if($loan->repayments()->where('status', 'paid')->exists())
                                        {{ $loan->repayments()->where('status', 'paid')->orderBy('paid_at', 'desc')->first()->paid_at->format('M d, Y') }}
                                    @else
                                        No payments yet
                                    @endif
                                </p>
                            </div>
                            <div class="flex-1">
                                <p class="text-xs text-slate-600 dark:text-navy-300 mb-1">Next Due Date</p>
                                <p class="text-sm font-bold text-red-600">
                                    {{ $loan->repayments()->where('status', 'pending')->orderBy('due_date')->first()->due_date->format('M d, Y') ?? 'N/A' }}
                                </p>
                            </div>
                            <div class="flex-1">
                                <p class="text-xs text-slate-600 dark:text-navy-300 mb-1">Member Credit Score</p>
                                <p class="text-sm font-bold text-slate-800 dark:text-navy-50">{{ $loan->member->credit_score }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="flex flex-col gap-2 ml-4">
                        <a href="{{ route('admin.sacco.loans.show', $loan) }}" 
                           class="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition">
                            <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Details
                        </a>
                        <button class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-warning/10 text-warning hover:bg-warning/20 rounded-lg transition">
                            <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Send Reminder
                        </button>
                        <button class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 rounded-lg transition">
                            <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Restructure
                        </button>
                    </div>
                </div>
            </div>
        @empty
            <div class="card p-12 text-center">
                <svg class="size-16 text-slate-400 dark:text-navy-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-2">No Overdue Loans</h3>
                <p class="text-slate-500 dark:text-navy-400">All loans are current on payments</p>
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
@endsection
