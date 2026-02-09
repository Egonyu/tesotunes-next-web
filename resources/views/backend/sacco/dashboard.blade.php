@extends('layouts.admin')

@section('title', 'SACCO Dashboard')

@section('content')
<div class="p-6">
<div class="dashboard-content">
    <!-- Page Header - Matching Admin Dashboard Style -->
    <div class="flex items-center justify-between mb-6">
        <div>
            <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">SACCO Management</h1>
            <p class="text-slate-600 dark:text-navy-300 mt-1">Savings and Credit Cooperative Organization</p>
        </div>
        <div class="flex items-center gap-3">
            <div class="flex items-center gap-2">
                <!-- Quick Actions -->
                <a href="{{ route('admin.sacco.members.enroll') }}" class="btn btn-primary">
                    <svg class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Enroll User
                </a>

                <div class="flex items-center gap-2 px-3 py-2 bg-success/10 text-success rounded-lg">
                    <div class="size-2 bg-success rounded-full animate-pulse"></div>
                    <span class="text-sm font-medium">Module Active</span>
                </div>
            </div>
            <span class="text-sm text-slate-400 dark:text-navy-400">{{ now()->format('l, M j, Y H:i') }}</span>
        </div>
    </div>

    <!-- Main Stats Grid - Matching Admin Dashboard Gradient Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        <!-- Total Members Card -->
        <div class="card bg-gradient-to-br from-blue-500 to-blue-600 text-white p-5">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <p class="text-blue-100 text-sm font-medium">Total Members</p>
                    <h3 class="text-3xl font-bold mt-1">{{ number_format($stats['totalMembers']) }}</h3>
                </div>
                <div class="p-3 bg-white/20 rounded-xl">
                    <svg class="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                </div>
            </div>
            <div class="flex items-center justify-between text-sm">
                <span class="text-blue-100">{{ $stats['activeMembers'] }} active</span>
                <span class="flex items-center gap-1 text-yellow-200 font-medium">
                    <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ $stats['pendingMembers'] }} pending
                </span>
            </div>
        </div>

        <!-- Total Savings Card -->
        <div class="card bg-gradient-to-br from-green-500 to-green-600 text-white p-5">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <p class="text-green-100 text-sm font-medium">Total Savings</p>
                    <h3 class="text-3xl font-bold mt-1">UGX {{ number_format($stats['totalSavings']) }}</h3>
                </div>
                <div class="p-3 bg-white/20 rounded-xl">
                    <svg class="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
            </div>
            <div class="flex items-center justify-between text-sm">
                <span class="text-green-100">Shares: UGX {{ number_format($stats['totalShares']) }}</span>
                <span class="text-green-100">Fixed: UGX {{ number_format($stats['totalFixedDeposits']) }}</span>
            </div>
        </div>

        <!-- Total Loans Card -->
        <div class="card bg-gradient-to-br from-purple-500 to-purple-600 text-white p-5">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <p class="text-purple-100 text-sm font-medium">Total Loans</p>
                    <h3 class="text-3xl font-bold mt-1">UGX {{ number_format($stats['totalLoans']) }}</h3>
                </div>
                <div class="p-3 bg-white/20 rounded-xl">
                    <svg class="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
            <div class="flex items-center justify-between text-sm">
                <span class="text-purple-100">{{ $stats['activeLoans'] }} active</span>
                <span class="flex items-center gap-1 text-red-200 font-medium">
                    <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {{ $stats['overdueLoans'] }} overdue
                </span>
            </div>
        </div>

        <!-- Today's Transactions Card -->
        <div class="card bg-gradient-to-br from-orange-500 to-orange-600 text-white p-5">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <p class="text-orange-100 text-sm font-medium">Today's Transactions</p>
                    <h3 class="text-3xl font-bold mt-1">{{ $stats['todayTransactions'] }}</h3>
                </div>
                <div class="p-3 bg-white/20 rounded-xl">
                    <svg class="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                </div>
            </div>
            <div class="flex items-center justify-between text-sm">
                <span class="text-orange-100">Volume: UGX {{ number_format($stats['todayVolume']) }}</span>
                <span class="text-orange-100">{{ $stats['monthTransactions'] }} this month</span>
            </div>
        </div>
    </div>

    <!-- Quick Actions for Pending Requests -->
    @if($stats['pendingMembers'] > 0 || $stats['pendingLoans'] > 0)
    <div class="card p-5 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-navy-900 dark:to-navy-800 border border-blue-200 dark:border-navy-600">
        <div class="flex items-start justify-between mb-4">
            <div>
                <h2 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-1">Pending Administrative Actions</h2>
                <p class="text-sm text-slate-600 dark:text-navy-300">{{ $stats['pendingMembers'] + $stats['pendingLoans'] }} item(s) require your attention</p>
            </div>
            <div class="p-2 bg-warning/20 text-warning rounded-lg">
                <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @if($stats['pendingMembers'] > 0)
            <div class="bg-white dark:bg-navy-800 rounded-lg p-4 border border-slate-200 dark:border-navy-600">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-slate-700 dark:text-navy-200">Member Applications</span>
                    <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">{{ $stats['pendingMembers'] }}</span>
                </div>
                <p class="text-xs text-slate-500 dark:text-navy-400 mb-3">New member applications awaiting approval</p>
                <a href="{{ route('admin.sacco.members.pending') }}" class="btn btn-sm btn-outline-primary w-full">
                    Review Applications
                </a>
            </div>
            @endif

            @if($stats['pendingLoans'] > 0)
            <div class="bg-white dark:bg-navy-800 rounded-lg p-4 border border-slate-200 dark:border-navy-600">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-slate-700 dark:text-navy-200">Loan Applications</span>
                    <span class="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">{{ $stats['pendingLoans'] }}</span>
                </div>
                <p class="text-xs text-slate-500 dark:text-navy-400 mb-3">Loan applications awaiting approval</p>
                <a href="{{ route('admin.sacco.loans.pending') }}" class="btn btn-sm btn-outline-primary w-full">
                    Review Loans
                </a>
            </div>
            @endif
        </div>
    </div>
    @endif

    <!-- Secondary Stats - Matching Admin Dashboard Style -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        <div class="card p-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-slate-600 dark:text-navy-300 text-sm">Pending Members</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50 mt-1">{{ number_format($stats['pendingMembers']) }}</p>
                </div>
                <div class="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                    <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                </div>
            </div>
            <div class="mt-2">
                <a href="{{ route('admin.sacco.members.pending') }}" class="text-xs text-primary hover:underline">Review approvals →</a>
            </div>
        </div>

        <div class="card p-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-slate-600 dark:text-navy-300 text-sm">Pending Loans</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50 mt-1">{{ number_format($stats['pendingLoans']) }}</p>
                </div>
                <div class="p-2 bg-warning/10 text-warning rounded-lg">
                    <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
            <div class="mt-2">
                <a href="{{ route('admin.sacco.loans.pending') }}" class="text-xs text-primary hover:underline">Review loans →</a>
            </div>
        </div>

        <div class="card p-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-slate-600 dark:text-navy-300 text-sm">Overdue Loans</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50 mt-1">{{ $stats['overdueLoans'] }}</p>
                </div>
                <div class="p-2 bg-red-500/10 text-red-500 rounded-lg">
                    <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
            </div>
            <div class="mt-2">
                <a href="{{ route('admin.sacco.loans.overdue') }}" class="text-xs text-primary hover:underline">View overdue →</a>
            </div>
        </div>

        <div class="card p-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-slate-600 dark:text-navy-300 text-sm">Reports</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50 mt-1">
                        <svg class="size-6 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </p>
                </div>
                <div class="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
                    <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                </div>
            </div>
            <div class="mt-2">
                <a href="{{ route('admin.sacco.reports.index') }}" class="text-xs text-primary hover:underline">View reports →</a>
            </div>
        </div>
    </div>

    <!-- SACCO Administration Overview -->
    <div class="card p-5 mb-6">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-slate-800 dark:text-navy-50">SACCO Administration</h2>
            <span class="text-xs text-slate-500 dark:text-navy-400">Last updated: {{ now()->format('M j, Y H:i') }}</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Member Management -->
            <div class="p-4 border border-slate-200 dark:border-navy-600 rounded-lg hover:bg-slate-50 dark:hover:bg-navy-700 transition">
                <div class="flex items-center gap-3 mb-3">
                    <div class="p-2 bg-blue-500/10 text-blue-500 rounded">
                        <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <h3 class="font-medium text-slate-800 dark:text-navy-200">Members</h3>
                </div>
                <div class="space-y-2">
                    <a href="{{ route('admin.sacco.members.index') }}" class="block text-sm text-slate-600 dark:text-navy-300 hover:text-primary">All Members</a>
                    <a href="{{ route('admin.sacco.members.pending') }}" class="block text-sm text-slate-600 dark:text-navy-300 hover:text-primary">Pending Approvals ({{ $stats['pendingMembers'] }})</a>
                    <a href="{{ route('admin.sacco.members.enroll') }}" class="block text-sm text-primary hover:underline">Enroll New Member</a>
                </div>
            </div>

            <!-- Loan Management -->
            <div class="p-4 border border-slate-200 dark:border-navy-600 rounded-lg hover:bg-slate-50 dark:hover:bg-navy-700 transition">
                <div class="flex items-center gap-3 mb-3">
                    <div class="p-2 bg-green-500/10 text-green-500 rounded">
                        <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 class="font-medium text-slate-800 dark:text-navy-200">Loans</h3>
                </div>
                <div class="space-y-2">
                    <a href="{{ route('admin.sacco.loans.index') }}" class="block text-sm text-slate-600 dark:text-navy-300 hover:text-primary">All Loans</a>
                    <a href="{{ route('admin.sacco.loans.pending') }}" class="block text-sm text-slate-600 dark:text-navy-300 hover:text-primary">Pending Approval ({{ $stats['pendingLoans'] }})</a>
                    <a href="{{ route('admin.sacco.loans.overdue') }}" class="block text-sm text-red-600 hover:text-red-700">Overdue ({{ $stats['overdueLoans'] }})</a>
                </div>
            </div>

            <!-- Financial Management -->
            <div class="p-4 border border-slate-200 dark:border-navy-600 rounded-lg hover:bg-slate-50 dark:hover:bg-navy-700 transition">
                <div class="flex items-center gap-3 mb-3">
                    <div class="p-2 bg-purple-500/10 text-purple-500 rounded">
                        <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 class="font-medium text-slate-800 dark:text-navy-200">Financial</h3>
                </div>
                <div class="space-y-2">
                    <a href="{{ route('admin.sacco.transactions.index') }}" class="block text-sm text-slate-600 dark:text-navy-300 hover:text-primary">Transactions</a>
                    <a href="{{ route('admin.sacco.dividends.index') }}" class="block text-sm text-slate-600 dark:text-navy-300 hover:text-primary">Dividends</a>
                    <a href="{{ route('admin.sacco.reports.financial') }}" class="block text-sm text-slate-600 dark:text-navy-300 hover:text-primary">Financial Reports</a>
                </div>
            </div>

            <!-- System Settings -->
            <div class="p-4 border border-slate-200 dark:border-navy-600 rounded-lg hover:bg-slate-50 dark:hover:bg-navy-700 transition">
                <div class="flex items-center gap-3 mb-3">
                    <div class="p-2 bg-orange-500/10 text-orange-500 rounded">
                        <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h3 class="font-medium text-slate-800 dark:text-navy-200">Settings</h3>
                </div>
                <div class="space-y-2">
                    <a href="{{ route('admin.sacco.loan-products.index') }}" class="block text-sm text-slate-600 dark:text-navy-300 hover:text-primary">Loan Products</a>
                    <a href="{{ route('admin.sacco.settings.index') }}" class="block text-sm text-slate-600 dark:text-navy-300 hover:text-primary">SACCO Settings</a>
                    <a href="{{ route('admin.sacco.audit-logs') }}" class="block text-sm text-slate-600 dark:text-navy-300 hover:text-primary">Audit Logs</a>
                </div>
            </div>
        </div>

        <!-- Financial Health Indicator -->
        <div class="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-sm font-medium text-green-800 dark:text-green-200 mb-1">SACCO Financial Health</h3>
                    <div class="flex items-center gap-4 text-sm text-green-700 dark:text-green-300">
                        <span>Total Assets: UGX {{ number_format($stats['totalSavings'] + $stats['totalShares'] + $stats['totalFixedDeposits']) }}</span>
                        <span>•</span>
                        <span>Outstanding Loans: UGX {{ number_format($stats['loanOutstanding']) }}</span>
                        <span>•</span>
                        <span>Loan Repayments: UGX {{ number_format($stats['loanRepayments']) }}</span>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <div class="size-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span class="text-sm font-medium text-green-800 dark:text-green-200">Healthy</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Content Grid - Matching Admin Dashboard Style -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <!-- Recent Members -->
        <div class="card p-5">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-slate-800 dark:text-navy-50">Recent Members</h2>
                <a href="{{ route('admin.sacco.members.index') }}" class="text-sm text-primary hover:underline">View All</a>
            </div>
            <div class="space-y-3">
                @forelse($stats['recentMembers'] as $member)
                    <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-navy-600 transition">
                        <div class="size-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {{ substr($member->user->display_name ?? $member->user->username ?? 'U', 0, 1) }}
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="font-medium text-slate-800 dark:text-navy-50 truncate">{{ $member->user->display_name ?? $member->user->username }}</p>
                            <p class="text-sm text-slate-500 dark:text-navy-400 truncate">{{ $member->membership_number }}</p>
                        </div>
                        <span class="text-xs font-medium px-2 py-1 rounded-full {{ $member->status === 'active' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning' }}">
                            {{ ucfirst($member->status) }}
                        </span>
                    </div>
                @empty
                    <p class="text-center py-8 text-slate-400 dark:text-navy-400">No recent members</p>
                @endforelse
            </div>
        </div>

        <!-- Recent Loans -->
        <div class="card p-5">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-slate-800 dark:text-navy-50">Recent Loans</h2>
                <a href="{{ route('admin.sacco.loans.index') }}" class="text-sm text-primary hover:underline">View All</a>
            </div>
            <div class="space-y-3">
                @forelse($stats['recentLoans'] as $loan)
                    <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-navy-600 transition">
                        <div class="size-12 bg-gradient-to-br from-green-500 to-teal-500 rounded flex items-center justify-center text-white font-bold">
                            <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="font-medium text-slate-800 dark:text-navy-50 truncate">{{ $loan->member->user->display_name ?? $loan->member->user->username }}</p>
                            <p class="text-sm text-slate-500 dark:text-navy-400">UGX {{ number_format($loan->principal_amount) }}</p>
                        </div>
                        <span class="text-xs font-medium px-2 py-1 rounded-full 
                            @if($loan->status === 'pending') bg-warning/10 text-warning
                            @elseif($loan->status === 'active') bg-success/10 text-success
                            @else bg-info/10 text-info
                            @endif">
                            {{ ucfirst($loan->status) }}
                        </span>
                    </div>
                @empty
                    <p class="text-center py-8 text-slate-400 dark:text-navy-400">No recent loans</p>
                @endforelse
            </div>
        </div>

        <!-- Recent Transactions -->
        <div class="card p-5">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-slate-800 dark:text-navy-50">Recent Transactions</h2>
                <a href="{{ route('admin.sacco.transactions.index') }}" class="text-sm text-primary hover:underline">View All</a>
            </div>
            <div class="space-y-3">
                @forelse($stats['recentTransactions'] as $transaction)
                    <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-navy-600 transition">
                        <div class="size-10 rounded-lg flex items-center justify-center bg-info/10 text-info">
                            <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="font-medium text-slate-800 dark:text-navy-50 truncate">{{ $transaction->member->user->display_name ?? $transaction->member->user->username }}</p>
                            <p class="text-xs text-slate-500 dark:text-navy-400 truncate">{{ ucfirst(str_replace('_', ' ', $transaction->transaction_type)) }}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-sm font-medium text-slate-800 dark:text-navy-50">
                                {{ number_format($transaction->amount) }}
                            </p>
                            <p class="text-xs {{ $transaction->status === 'completed' ? 'text-success' : 'text-warning' }}">
                                {{ ucfirst($transaction->status) }}
                            </p>
                        </div>
                    </div>
                @empty
                    <p class="text-center py-8 text-slate-400 dark:text-navy-400">No recent transactions</p>
                @endforelse
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
// SACCO Dashboard loaded
console.log('SACCO Dashboard initialized');
</script>
@endpush
