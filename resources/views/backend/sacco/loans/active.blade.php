@extends('layouts.admin')

@section('title', 'Active Loans')

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
                <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">Active Loans</h1>
                <p class="text-slate-600 dark:text-navy-300 mt-1">Currently running loan accounts</p>
            </div>
        </div>
        <span class="px-3 py-1.5 bg-success/10 text-success rounded-lg text-sm font-medium">
            {{ $loans->total() }} Active
        </span>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6 mb-6">
        <div class="card bg-gradient-to-br from-success to-green-600 text-white p-5">
            <div class="flex items-center justify-between mb-2">
                <p class="text-green-100 text-sm">Total Active</p>
                <svg class="size-6 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h3 class="text-2xl font-bold">{{ $loans->total() }}</h3>
        </div>

        <div class="card bg-gradient-to-br from-purple-500 to-purple-600 text-white p-5">
            <div class="flex items-center justify-between mb-2">
                <p class="text-purple-100 text-sm">Total Principal</p>
                <svg class="size-6 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h3 class="text-2xl font-bold">UGX {{ number_format($loans->sum('principal_amount')) }}</h3>
        </div>

        <div class="card bg-gradient-to-br from-blue-500 to-blue-600 text-white p-5">
            <div class="flex items-center justify-between mb-2">
                <p class="text-blue-100 text-sm">Amount Collected</p>
                <svg class="size-6 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            </div>
            <h3 class="text-2xl font-bold">UGX {{ number_format($loans->sum('amount_paid')) }}</h3>
        </div>

        <div class="card bg-gradient-to-br from-orange-500 to-orange-600 text-white p-5">
            <div class="flex items-center justify-between mb-2">
                <p class="text-orange-100 text-sm">Outstanding</p>
                <svg class="size-6 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h3 class="text-2xl font-bold">UGX {{ number_format($loans->sum('outstanding_balance')) }}</h3>
        </div>
    </div>

    <!-- Active Loans Table -->
    <div class="card">
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead class="bg-slate-50 dark:bg-navy-600">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-navy-200 uppercase tracking-wider">Loan #</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-navy-200 uppercase tracking-wider">Member</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-navy-200 uppercase tracking-wider">Product</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-navy-200 uppercase tracking-wider">Principal</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-navy-200 uppercase tracking-wider">Paid</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-navy-200 uppercase tracking-wider">Outstanding</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-navy-200 uppercase tracking-wider">Next Payment</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-navy-200 uppercase tracking-wider">Progress</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-navy-200 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 dark:divide-navy-500">
                    @forelse($loans as $loan)
                        @php
                            $progress = $loan->total_amount > 0 ? ($loan->amount_paid / $loan->total_amount) * 100 : 0;
                            $nextPayment = $loan->repayments()->where('status', 'pending')->orderBy('due_date')->first();
                        @endphp
                        <tr class="hover:bg-slate-50 dark:hover:bg-navy-600 transition">
                            <td class="px-4 py-3 text-sm font-medium text-slate-800 dark:text-navy-50">{{ $loan->loan_number }}</td>
                            <td class="px-4 py-3">
                                <div class="text-sm font-medium text-slate-800 dark:text-navy-50">{{ $loan->member->user->display_name ?? $loan->member->user->username }}</div>
                                <div class="text-xs text-slate-500 dark:text-navy-400">{{ $loan->member->membership_number }}</div>
                            </td>
                            <td class="px-4 py-3 text-sm text-slate-700 dark:text-navy-200">{{ $loan->loanProduct->name ?? 'N/A' }}</td>
                            <td class="px-4 py-3 text-sm font-medium text-slate-800 dark:text-navy-50">UGX {{ number_format($loan->principal_amount) }}</td>
                            <td class="px-4 py-3 text-sm font-medium text-success">UGX {{ number_format($loan->amount_paid ?? 0) }}</td>
                            <td class="px-4 py-3 text-sm font-medium text-orange-500">UGX {{ number_format($loan->outstanding_balance ?? $loan->total_amount) }}</td>
                            <td class="px-4 py-3 text-sm text-slate-700 dark:text-navy-200">
                                @if($nextPayment)
                                    <div>{{ $nextPayment->due_date->format('M d, Y') }}</div>
                                    <div class="text-xs text-slate-500">UGX {{ number_format($nextPayment->amount) }}</div>
                                @else
                                    <span class="text-xs text-slate-400">N/A</span>
                                @endif
                            </td>
                            <td class="px-4 py-3">
                                <div class="flex items-center gap-2">
                                    <div class="flex-1 h-2 bg-slate-200 dark:bg-navy-500 rounded-full overflow-hidden">
                                        <div class="h-full bg-gradient-to-r from-green-500 to-blue-500" style="width: {{ $progress }}%"></div>
                                    </div>
                                    <span class="text-xs font-medium text-slate-600 dark:text-navy-300">{{ number_format($progress, 0) }}%</span>
                                </div>
                            </td>
                            <td class="px-4 py-3">
                                <a href="{{ route('admin.sacco.loans.show', $loan) }}" 
                                   class="inline-flex items-center justify-center size-8 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition">
                                    <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="9" class="px-4 py-12 text-center">
                                <div class="flex flex-col items-center">
                                    <svg class="size-12 text-slate-400 dark:text-navy-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p class="text-slate-500 dark:text-navy-400">No active loans</p>
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
