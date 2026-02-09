@extends('layouts.admin')

@section('title', 'SACCO Settings')

@section('content')
<div class="dashboard-content">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
        <div>
            <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">SACCO Settings</h1>
            <p class="text-slate-600 dark:text-navy-300 mt-1">Configure SACCO module settings and parameters</p>
        </div>
        <div class="flex items-center gap-3">
            <a href="{{ route('admin.sacco.account-types.index') }}" class="btn btn-secondary">
                <svg class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Account Types
            </a>
            <a href="{{ route('admin.sacco.dashboard') }}" class="btn btn-primary">
                <svg class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
            </a>
        </div>
    </div>

    <form action="{{ route('admin.sacco.settings.update') }}" method="POST" id="settingsForm">
        @csrf
        @method('PUT')

        <!-- Tabs Navigation -->
        <div class="card mb-6">
            <div class="border-b border-slate-200 dark:border-navy-600">
                <nav class="flex -mb-px overflow-x-auto scrollbar-none" aria-label="Tabs">
                    <button type="button" onclick="switchTab('general')" id="tab-general"
                            class="tab-btn active group flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 border-primary text-primary dark:text-accent dark:border-accent whitespace-nowrap">
                        <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        General
                    </button>
                    <button type="button" onclick="switchTab('loans')" id="tab-loans"
                            class="tab-btn group flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 border-transparent text-slate-500 hover:text-slate-700 dark:text-navy-300 dark:hover:text-navy-100 whitespace-nowrap">
                        <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Loans
                    </button>
                    <button type="button" onclick="switchTab('transactions')" id="tab-transactions"
                            class="tab-btn group flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 border-transparent text-slate-500 hover:text-slate-700 dark:text-navy-300 dark:hover:text-navy-100 whitespace-nowrap">
                        <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        Transactions
                    </button>
                    <button type="button" onclick="switchTab('dividends')" id="tab-dividends"
                            class="tab-btn group flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 border-transparent text-slate-500 hover:text-slate-700 dark:text-navy-300 dark:hover:text-navy-100 whitespace-nowrap">
                        <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Dividends
                    </button>
                    <button type="button" onclick="switchTab('membership')" id="tab-membership"
                            class="tab-btn group flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 border-transparent text-slate-500 hover:text-slate-700 dark:text-navy-300 dark:hover:text-navy-100 whitespace-nowrap">
                        <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Membership
                    </button>
                    <button type="button" onclick="switchTab('notifications')" id="tab-notifications"
                            class="tab-btn group flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 border-transparent text-slate-500 hover:text-slate-700 dark:text-navy-300 dark:hover:text-navy-100 whitespace-nowrap">
                        <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        Notifications
                    </button>
                </nav>
            </div>
        </div>

        <!-- Tab Content -->
        <div class="space-y-6">
            
            <!-- General Settings Tab -->
            <div id="panel-general" class="tab-panel">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Organization Info Card -->
                    <div class="card p-6">
                        <div class="flex items-center gap-3 mb-6">
                            <div class="p-2 bg-primary/10 text-primary rounded-lg">
                                <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div>
                                <h3 class="font-semibold text-slate-800 dark:text-navy-50">Organization Details</h3>
                                <p class="text-sm text-slate-500 dark:text-navy-400">Basic SACCO information</p>
                            </div>
                        </div>

                        <div class="space-y-4">
                            <!-- Module Status Toggle -->
                            <div class="p-4 rounded-lg bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-600">
                                <label class="flex items-center justify-between cursor-pointer">
                                    <div class="flex items-center gap-3">
                                        <div class="p-2 bg-green-500/10 text-green-500 rounded-lg">
                                            <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <span class="font-medium text-slate-800 dark:text-navy-50">SACCO Module Status</span>
                                            <p class="text-xs text-slate-500 dark:text-navy-400">Enable/disable entire SACCO module</p>
                                        </div>
                                    </div>
                                    <div class="relative">
                                        <input type="hidden" name="enabled" value="0">
                                        <input type="checkbox" name="enabled" value="1" id="enabled"
                                            {{ $config['enabled'] ? 'checked' : '' }}
                                            class="form-switch h-6 w-11 rounded-full bg-slate-300 before:rounded-full before:bg-white checked:bg-primary dark:bg-navy-500 dark:before:bg-navy-300 dark:checked:bg-accent">
                                    </div>
                                </label>
                            </div>

                            <div>
                                <label for="name" class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">SACCO Name</label>
                                <input type="text" class="form-input w-full" id="name" name="name"
                                    value="{{ $config['name'] ?? 'LineOne Music SACCO' }}" required>
                            </div>

                            <div>
                                <label for="registration_number" class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">Registration Number</label>
                                <input type="text" class="form-input w-full" id="registration_number" name="registration_number"
                                    value="{{ $config['registration_number'] ?? '' }}" placeholder="e.g., SCC/12345">
                                <p class="text-xs text-slate-500 dark:text-navy-400 mt-1">Official SACCO registration number</p>
                            </div>
                        </div>
                    </div>

                    <!-- Savings & Shares Card -->
                    <div class="card p-6">
                        <div class="flex items-center gap-3 mb-6">
                            <div class="p-2 bg-green-500/10 text-green-500 rounded-lg">
                                <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 class="font-semibold text-slate-800 dark:text-navy-50">Savings & Shares</h3>
                                <p class="text-sm text-slate-500 dark:text-navy-400">Member contribution settings</p>
                            </div>
                        </div>

                        <div class="space-y-4">
                            <div>
                                <label for="min_savings" class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">Minimum Savings (UGX)</label>
                                <div class="relative">
                                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">UGX</span>
                                    <input type="number" class="form-input w-full pl-12" id="min_savings" name="min_savings"
                                        value="{{ $config['min_savings'] ?? 50000 }}" step="1000" min="0">
                                </div>
                            </div>

                            <div>
                                <label for="share_value" class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">Share Value (UGX)</label>
                                <div class="relative">
                                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">UGX</span>
                                    <input type="number" class="form-input w-full pl-12" id="share_value" name="share_value"
                                        value="{{ $config['share_value'] ?? 5000 }}" step="1000" min="0">
                                </div>
                                <p class="text-xs text-slate-500 dark:text-navy-400 mt-1">Value per share unit</p>
                            </div>

                            <div>
                                <label for="min_shares" class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">Minimum Shares Required</label>
                                <input type="number" class="form-input w-full" id="min_shares" name="min_shares"
                                    value="{{ $config['min_shares'] ?? 10 }}" min="1">
                                <p class="text-xs text-slate-500 dark:text-navy-400 mt-1">Minimum shares for membership</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Loans Tab -->
            <div id="panel-loans" class="tab-panel hidden">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Interest & Fees Card -->
                    <div class="card p-6">
                        <div class="flex items-center gap-3 mb-6">
                            <div class="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                                <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 class="font-semibold text-slate-800 dark:text-navy-50">Interest & Fees</h3>
                                <p class="text-sm text-slate-500 dark:text-navy-400">Loan interest and fee configuration</p>
                            </div>
                        </div>

                        <div class="space-y-4">
                            <div>
                                <label for="default_interest_rate" class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">Default Interest Rate</label>
                                <div class="relative">
                                    <input type="number" class="form-input w-full pr-12" id="default_interest_rate" name="default_interest_rate"
                                        value="{{ $config['default_interest_rate'] ?? 12 }}" step="0.1" min="0">
                                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">% p.a.</span>
                                </div>
                            </div>

                            <div>
                                <label for="penalty_rate" class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">Late Payment Penalty</label>
                                <div class="relative">
                                    <input type="number" class="form-input w-full pr-12" id="penalty_rate" name="penalty_rate"
                                        value="{{ $config['penalty_rate'] ?? 5 }}" step="0.1" min="0">
                                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                                </div>
                            </div>

                            <div>
                                <label for="processing_fee_percentage" class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">Processing Fee</label>
                                <div class="relative">
                                    <input type="number" class="form-input w-full pr-12" id="processing_fee_percentage" name="processing_fee_percentage"
                                        value="{{ $config['processing_fee_percentage'] ?? 2 }}" step="0.1" min="0">
                                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Loan Limits Card -->
                    <div class="card p-6">
                        <div class="flex items-center gap-3 mb-6">
                            <div class="p-2 bg-red-500/10 text-red-500 rounded-lg">
                                <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div>
                                <h3 class="font-semibold text-slate-800 dark:text-navy-50">Loan Limits & Requirements</h3>
                                <p class="text-sm text-slate-500 dark:text-navy-400">Eligibility and limits</p>
                            </div>
                        </div>

                        <div class="space-y-4">
                            <div>
                                <label for="max_loan_multiple" class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">Maximum Loan Multiple</label>
                                <div class="relative">
                                    <input type="number" class="form-input w-full pr-12" id="max_loan_multiple" name="max_loan_multiple"
                                        value="{{ $config['max_loan_multiple'] ?? 3 }}" step="0.5" min="1">
                                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">x</span>
                                </div>
                                <p class="text-xs text-slate-500 dark:text-navy-400 mt-1">Multiple of member's savings + shares</p>
                            </div>

                            <div>
                                <label for="grace_period_days" class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">Grace Period</label>
                                <div class="relative">
                                    <input type="number" class="form-input w-full pr-16" id="grace_period_days" name="grace_period_days"
                                        value="{{ $config['grace_period_days'] ?? 7 }}" min="0">
                                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">days</span>
                                </div>
                            </div>

                            <div>
                                <label for="min_guarantors" class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">Minimum Guarantors</label>
                                <input type="number" class="form-input w-full" id="min_guarantors" name="min_guarantors"
                                    value="{{ $config['min_guarantors'] ?? 2 }}" min="0">
                                <p class="text-xs text-slate-500 dark:text-navy-400 mt-1">Required number of guarantors per loan</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Transactions Tab -->
            <div id="panel-transactions" class="tab-panel hidden">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Deposit Settings Card -->
                    <div class="card p-6">
                        <div class="flex items-center gap-3 mb-6">
                            <div class="p-2 bg-green-500/10 text-green-500 rounded-lg">
                                <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                </svg>
                            </div>
                            <div>
                                <h3 class="font-semibold text-slate-800 dark:text-navy-50">Deposit Settings</h3>
                                <p class="text-sm text-slate-500 dark:text-navy-400">Configure deposit rules</p>
                            </div>
                        </div>

                        <div class="space-y-4">
                            <div>
                                <label for="min_deposit" class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">Minimum Deposit</label>
                                <div class="relative">
                                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">UGX</span>
                                    <input type="number" class="form-input w-full pl-12" id="min_deposit" name="min_deposit"
                                        value="{{ $config['min_deposit'] ?? 10000 }}" step="1000" min="0">
                                </div>
                            </div>

                            <!-- Auto Approve Toggle -->
                            <div class="p-4 rounded-lg bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-600">
                                <label class="flex items-center justify-between cursor-pointer">
                                    <div>
                                        <span class="font-medium text-slate-800 dark:text-navy-50">Auto-approve Deposits</span>
                                        <p class="text-xs text-slate-500 dark:text-navy-400">Automatically approve deposits below threshold</p>
                                    </div>
                                    <div class="relative">
                                        <input type="hidden" name="auto_approve_transactions" value="0">
                                        <input type="checkbox" name="auto_approve_transactions" value="1" id="auto_approve_transactions"
                                            {{ ($config['auto_approve_transactions'] ?? false) ? 'checked' : '' }}
                                            class="form-switch h-6 w-11 rounded-full bg-slate-300 before:rounded-full before:bg-white checked:bg-primary dark:bg-navy-500 dark:before:bg-navy-300 dark:checked:bg-accent">
                                    </div>
                                </label>
                            </div>

                            <div>
                                <label for="auto_approve_threshold" class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">Auto-approve Threshold</label>
                                <div class="relative">
                                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">UGX</span>
                                    <input type="number" class="form-input w-full pl-12" id="auto_approve_threshold" name="auto_approve_threshold"
                                        value="{{ $config['auto_approve_threshold'] ?? 500000 }}" step="10000" min="0">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Withdrawal Settings Card -->
                    <div class="card p-6">
                        <div class="flex items-center gap-3 mb-6">
                            <div class="p-2 bg-red-500/10 text-red-500 rounded-lg">
                                <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                                </svg>
                            </div>
                            <div>
                                <h3 class="font-semibold text-slate-800 dark:text-navy-50">Withdrawal Settings</h3>
                                <p class="text-sm text-slate-500 dark:text-navy-400">Configure withdrawal rules</p>
                            </div>
                        </div>

                        <div class="space-y-4">
                            <div>
                                <label for="min_withdrawal" class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">Minimum Withdrawal</label>
                                <div class="relative">
                                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">UGX</span>
                                    <input type="number" class="form-input w-full pl-12" id="min_withdrawal" name="min_withdrawal"
                                        value="{{ $config['min_withdrawal'] ?? 10000 }}" step="1000" min="0">
                                </div>
                            </div>

                            <div>
                                <label for="max_withdrawal" class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">Maximum Withdrawal</label>
                                <div class="relative">
                                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">UGX</span>
                                    <input type="number" class="form-input w-full pl-12" id="max_withdrawal" name="max_withdrawal"
                                        value="{{ $config['max_withdrawal'] ?? 10000000 }}" step="100000" min="0">
                                </div>
                            </div>

                            <div>
                                <label for="withdrawal_fee_percentage" class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">Withdrawal Fee</label>
                                <div class="relative">
                                    <input type="number" class="form-input w-full pr-12" id="withdrawal_fee_percentage" name="withdrawal_fee_percentage"
                                        value="{{ $config['withdrawal_fee_percentage'] ?? 0 }}" step="0.1" min="0">
                                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Dividends Tab -->
            <div id="panel-dividends" class="tab-panel hidden">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Dividend Distribution Card -->
                    <div class="card p-6">
                        <div class="flex items-center gap-3 mb-6">
                            <div class="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                                <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <div>
                                <h3 class="font-semibold text-slate-800 dark:text-navy-50">Dividend Distribution</h3>
                                <p class="text-sm text-slate-500 dark:text-navy-400">Configure profit sharing</p>
                            </div>
                        </div>

                        <div class="space-y-4">
                            <!-- Enable Dividends Toggle -->
                            <div class="p-4 rounded-lg bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-600">
                                <label class="flex items-center justify-between cursor-pointer">
                                    <div>
                                        <span class="font-medium text-slate-800 dark:text-navy-50">Enable Dividends</span>
                                        <p class="text-xs text-slate-500 dark:text-navy-400">Allow dividend distribution to members</p>
                                    </div>
                                    <div class="relative">
                                        <input type="hidden" name="enable_dividends" value="0">
                                        <input type="checkbox" name="enable_dividends" value="1" id="enable_dividends"
                                            {{ ($config['enable_dividends'] ?? true) ? 'checked' : '' }}
                                            class="form-switch h-6 w-11 rounded-full bg-slate-300 before:rounded-full before:bg-white checked:bg-primary dark:bg-navy-500 dark:before:bg-navy-300 dark:checked:bg-accent">
                                    </div>
                                </label>
                            </div>

                            <div>
                                <label for="default_distribution_percentage" class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">Distribution Percentage</label>
                                <div class="relative">
                                    <input type="number" class="form-input w-full pr-20" id="default_distribution_percentage" name="default_distribution_percentage"
                                        value="{{ $config['default_distribution_percentage'] ?? 60 }}" step="1" min="0" max="100">
                                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">% of profit</span>
                                </div>
                            </div>

                            <div>
                                <label for="withholding_tax_percentage" class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">Withholding Tax</label>
                                <div class="relative">
                                    <input type="number" class="form-input w-full pr-12" id="withholding_tax_percentage" name="withholding_tax_percentage"
                                        value="{{ $config['withholding_tax_percentage'] ?? 15 }}" step="0.1" min="0" max="100">
                                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Interest Rates Card -->
                    <div class="card p-6">
                        <div class="flex items-center gap-3 mb-6">
                            <div class="p-2 bg-green-500/10 text-green-500 rounded-lg">
                                <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 class="font-semibold text-slate-800 dark:text-navy-50">Interest Rates</h3>
                                <p class="text-sm text-slate-500 dark:text-navy-400">Savings interest configuration</p>
                            </div>
                        </div>

                        <div class="space-y-4">
                            <div>
                                <label for="savings_interest_rate" class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">Savings Interest Rate</label>
                                <div class="relative">
                                    <input type="number" class="form-input w-full pr-16" id="savings_interest_rate" name="savings_interest_rate"
                                        value="{{ $config['savings_interest_rate'] ?? 6 }}" step="0.1" min="0">
                                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">% p.a.</span>
                                </div>
                            </div>

                            <div>
                                <label for="fixed_deposit_interest_rate" class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">Fixed Deposit Interest</label>
                                <div class="relative">
                                    <input type="number" class="form-input w-full pr-16" id="fixed_deposit_interest_rate" name="fixed_deposit_interest_rate"
                                        value="{{ $config['fixed_deposit_interest_rate'] ?? 10 }}" step="0.1" min="0">
                                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">% p.a.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Membership Tab -->
            <div id="panel-membership" class="tab-panel hidden">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Membership Fees Card -->
                    <div class="card p-6">
                        <div class="flex items-center gap-3 mb-6">
                            <div class="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                                <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                            <div>
                                <h3 class="font-semibold text-slate-800 dark:text-navy-50">Membership Fees</h3>
                                <p class="text-sm text-slate-500 dark:text-navy-400">Registration and recurring fees</p>
                            </div>
                        </div>

                        <div class="space-y-4">
                            <div>
                                <label for="registration_fee" class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">Registration Fee</label>
                                <div class="relative">
                                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">UGX</span>
                                    <input type="number" class="form-input w-full pl-12" id="registration_fee" name="registration_fee"
                                        value="{{ $config['registration_fee'] ?? 50000 }}" step="1000" min="0">
                                </div>
                            </div>

                            <div>
                                <label for="monthly_membership_fee" class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">Monthly Fee</label>
                                <div class="relative">
                                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">UGX</span>
                                    <input type="number" class="form-input w-full pl-12" id="monthly_membership_fee" name="monthly_membership_fee"
                                        value="{{ $config['monthly_membership_fee'] ?? 5000 }}" step="1000" min="0">
                                </div>
                            </div>

                            <div>
                                <label for="max_members" class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">Maximum Members</label>
                                <input type="number" class="form-input w-full" id="max_members" name="max_members"
                                    value="{{ $config['max_members'] ?? 0 }}" min="0">
                                <p class="text-xs text-slate-500 dark:text-navy-400 mt-1">Set to 0 for unlimited members</p>
                            </div>
                        </div>
                    </div>

                    <!-- Approval Settings Card -->
                    <div class="card p-6">
                        <div class="flex items-center gap-3 mb-6">
                            <div class="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
                                <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <h3 class="font-semibold text-slate-800 dark:text-navy-50">Approval Settings</h3>
                                <p class="text-sm text-slate-500 dark:text-navy-400">Member verification options</p>
                            </div>
                        </div>

                        <div class="space-y-4">
                            <!-- Auto Approve Members Toggle -->
                            <div class="p-4 rounded-lg bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-600">
                                <label class="flex items-center justify-between cursor-pointer">
                                    <div>
                                        <span class="font-medium text-slate-800 dark:text-navy-50">Auto-approve Members</span>
                                        <p class="text-xs text-slate-500 dark:text-navy-400">Skip admin approval for new members</p>
                                    </div>
                                    <div class="relative">
                                        <input type="hidden" name="auto_approve_members" value="0">
                                        <input type="checkbox" name="auto_approve_members" value="1" id="auto_approve_members"
                                            {{ ($config['auto_approve_members'] ?? false) ? 'checked' : '' }}
                                            class="form-switch h-6 w-11 rounded-full bg-slate-300 before:rounded-full before:bg-white checked:bg-primary dark:bg-navy-500 dark:before:bg-navy-300 dark:checked:bg-accent">
                                    </div>
                                </label>
                            </div>

                            <!-- Require KYC Toggle -->
                            <div class="p-4 rounded-lg bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-600">
                                <label class="flex items-center justify-between cursor-pointer">
                                    <div>
                                        <span class="font-medium text-slate-800 dark:text-navy-50">Require KYC Verification</span>
                                        <p class="text-xs text-slate-500 dark:text-navy-400">Members must complete KYC</p>
                                    </div>
                                    <div class="relative">
                                        <input type="hidden" name="require_kyc" value="0">
                                        <input type="checkbox" name="require_kyc" value="1" id="require_kyc"
                                            {{ ($config['require_kyc'] ?? true) ? 'checked' : '' }}
                                            class="form-switch h-6 w-11 rounded-full bg-slate-300 before:rounded-full before:bg-white checked:bg-primary dark:bg-navy-500 dark:before:bg-navy-300 dark:checked:bg-accent">
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Notifications Tab -->
            <div id="panel-notifications" class="tab-panel hidden">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Notification Channels Card -->
                    <div class="card p-6">
                        <div class="flex items-center gap-3 mb-6">
                            <div class="p-2 bg-pink-500/10 text-pink-500 rounded-lg">
                                <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 class="font-semibold text-slate-800 dark:text-navy-50">Notification Channels</h3>
                                <p class="text-sm text-slate-500 dark:text-navy-400">Enable/disable notification methods</p>
                            </div>
                        </div>

                        <div class="space-y-4">
                            <!-- Email Notifications Toggle -->
                            <div class="p-4 rounded-lg bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-600">
                                <label class="flex items-center justify-between cursor-pointer">
                                    <div class="flex items-center gap-3">
                                        <div class="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                                            <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                            </svg>
                                        </div>
                                        <div>
                                            <span class="font-medium text-slate-800 dark:text-navy-50">Email Notifications</span>
                                            <p class="text-xs text-slate-500 dark:text-navy-400">Send email notifications to members</p>
                                        </div>
                                    </div>
                                    <div class="relative">
                                        <input type="hidden" name="enable_email_notifications" value="0">
                                        <input type="checkbox" name="enable_email_notifications" value="1" id="enable_email_notifications"
                                            {{ ($config['enable_email_notifications'] ?? true) ? 'checked' : '' }}
                                            class="form-switch h-6 w-11 rounded-full bg-slate-300 before:rounded-full before:bg-white checked:bg-primary dark:bg-navy-500 dark:before:bg-navy-300 dark:checked:bg-accent">
                                    </div>
                                </label>
                            </div>

                            <!-- SMS Notifications Toggle -->
                            <div class="p-4 rounded-lg bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-600">
                                <label class="flex items-center justify-between cursor-pointer">
                                    <div class="flex items-center gap-3">
                                        <div class="p-2 bg-green-500/10 text-green-500 rounded-lg">
                                            <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <span class="font-medium text-slate-800 dark:text-navy-50">SMS Notifications</span>
                                            <p class="text-xs text-slate-500 dark:text-navy-400">Send SMS alerts to members</p>
                                        </div>
                                    </div>
                                    <div class="relative">
                                        <input type="hidden" name="enable_sms_notifications" value="0">
                                        <input type="checkbox" name="enable_sms_notifications" value="1" id="enable_sms_notifications"
                                            {{ ($config['enable_sms_notifications'] ?? true) ? 'checked' : '' }}
                                            class="form-switch h-6 w-11 rounded-full bg-slate-300 before:rounded-full before:bg-white checked:bg-primary dark:bg-navy-500 dark:before:bg-navy-300 dark:checked:bg-accent">
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Reminder Settings Card -->
                    <div class="card p-6">
                        <div class="flex items-center gap-3 mb-6">
                            <div class="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                                <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 class="font-semibold text-slate-800 dark:text-navy-50">Reminder Settings</h3>
                                <p class="text-sm text-slate-500 dark:text-navy-400">Configure payment reminders</p>
                            </div>
                        </div>

                        <div class="space-y-4">
                            <div>
                                <label for="loan_reminder_days" class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">Loan Payment Reminder</label>
                                <div class="relative">
                                    <input type="number" class="form-input w-full pr-28" id="loan_reminder_days" name="loan_reminder_days"
                                        value="{{ $config['loan_reminder_days'] ?? 7 }}" min="0">
                                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">days before</span>
                                </div>
                            </div>

                            <div>
                                <label for="overdue_notice_days" class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">Overdue Notice</label>
                                <div class="relative">
                                    <input type="number" class="form-input w-full pr-28" id="overdue_notice_days" name="overdue_notice_days"
                                        value="{{ $config['overdue_notice_days'] ?? 3 }}" min="0">
                                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">days after due</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <!-- Sticky Save Button -->
        <div class="sticky bottom-6 mt-8">
            <div class="card p-4 bg-white/95 dark:bg-navy-700/95 backdrop-blur-sm shadow-lg border border-slate-200 dark:border-navy-600">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="p-2 bg-primary/10 text-primary rounded-lg">
                            <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-slate-800 dark:text-navy-50">Remember to save your changes</p>
                            <p class="text-xs text-slate-500 dark:text-navy-400">Changes will take effect immediately after saving</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <a href="{{ route('admin.sacco.dashboard') }}" class="btn btn-secondary">
                            Cancel
                        </a>
                        <button type="submit" class="btn btn-primary px-6" id="saveBtn">
                            <svg class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Save Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </form>
</div>
@endsection

@push('scripts')
<script>
// Tab switching functionality
function switchTab(tabName) {
    // Hide all panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.add('hidden');
    });
    
    // Remove active state from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('border-primary', 'text-primary', 'dark:text-accent', 'dark:border-accent');
        btn.classList.add('border-transparent', 'text-slate-500', 'dark:text-navy-300');
    });
    
    // Show selected panel
    const panel = document.getElementById('panel-' + tabName);
    if (panel) {
        panel.classList.remove('hidden');
    }
    
    // Activate selected tab
    const tab = document.getElementById('tab-' + tabName);
    if (tab) {
        tab.classList.remove('border-transparent', 'text-slate-500', 'dark:text-navy-300');
        tab.classList.add('border-primary', 'text-primary', 'dark:text-accent', 'dark:border-accent');
    }
    
    // Store in localStorage
    localStorage.setItem('sacco-settings-tab', tabName);
}

// Restore last active tab on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedTab = localStorage.getItem('sacco-settings-tab');
    if (savedTab) {
        switchTab(savedTab);
    }
});

// Form submit handling
document.getElementById('settingsForm').addEventListener('submit', function(e) {
    const btn = document.getElementById('saveBtn');
    const originalHtml = btn.innerHTML;

    btn.innerHTML = '<svg class="size-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Saving...';
    btn.disabled = true;
});
</script>
@endpush
