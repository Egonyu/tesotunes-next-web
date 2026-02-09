@extends('layouts.admin')

@section('title', 'Payments Management')

@section('page-header')
    {{-- Page header content --}}
@endsection

@section('content')
<div x-data="{ showFailureModal: false, showProviderModal: false }">
    <!-- Primary Stats Row -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Total Revenue</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">UGX {{ number_format($stats['total_revenue'], 0) }}</p>
                </div>
                <div class="size-11 rounded-full bg-success/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                </div>
            </div>
            <div class="mt-1">
                @if($stats['revenue_trend'] != 0)
                    <span class="text-xs+ {{ $stats['revenue_trend'] > 0 ? 'text-success' : 'text-error' }}">
                        {{ $stats['revenue_trend'] > 0 ? '+' : '' }}{{ $stats['revenue_trend'] }}%
                    </span>
                    <span class="text-xs text-slate-400">from last month</span>
                @else
                    <span class="text-xs text-slate-400">No change from last month</span>
                @endif
            </div>
        </div>

        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Successful</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ number_format($stats['completed_payments']) }}</p>
                </div>
                <div class="size-11 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
            <div class="mt-1">
                <span class="text-xs text-slate-400">{{ $stats['success_rate'] }}% success rate</span>
            </div>
        </div>

        <div class="card px-4 py-4 cursor-pointer hover:shadow-lg transition-shadow" @click="showFailureModal = true">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Failed</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ number_format($stats['failed_payments']) }}</p>
                </div>
                <div class="size-11 rounded-full bg-error/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
            <div class="mt-1">
                <span class="text-xs text-slate-400 underline">Click for failure reasons →</span>
            </div>
        </div>

        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Pending</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ number_format($stats['pending_payments']) }}</p>
                </div>
                <div class="size-11 rounded-full bg-warning/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
            <div class="mt-1">
                <span class="text-xs text-slate-400">Awaiting confirmation</span>
            </div>
        </div>
    </div>

    <!-- Secondary Stats Row -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-6">
        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs font-medium text-slate-500 dark:text-navy-300">Monthly Revenue</p>
                    <p class="text-lg font-semibold text-slate-700 dark:text-navy-100">UGX {{ number_format($stats['monthly_revenue'] ?? 0, 0) }}</p>
                </div>
                <div class="size-9 rounded-full bg-info/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs font-medium text-slate-500 dark:text-navy-300">Today's Revenue</p>
                    <p class="text-lg font-semibold text-slate-700 dark:text-navy-100">UGX {{ number_format($stats['today_revenue'] ?? 0, 0) }}</p>
                </div>
                <div class="size-9 rounded-full bg-success/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs font-medium text-slate-500 dark:text-navy-300">Avg Completion</p>
                    <p class="text-lg font-semibold text-slate-700 dark:text-navy-100">{{ $stats['avg_completion_time'] ?? 0 }} min</p>
                </div>
                <div class="size-9 rounded-full bg-secondary/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs font-medium text-slate-500 dark:text-navy-300">Refunded</p>
                    <p class="text-lg font-semibold text-slate-700 dark:text-navy-100">{{ number_format($stats['refunded_payments'] ?? 0) }}</p>
                </div>
                <div class="size-9 rounded-full bg-warning/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="card px-4 py-4 cursor-pointer hover:shadow-lg transition-shadow" @click="showProviderModal = true">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs font-medium text-slate-500 dark:text-navy-300">Providers</p>
                    <p class="text-lg font-semibold text-slate-700 dark:text-navy-100">{{ count($stats['provider_stats'] ?? []) }} Active</p>
                </div>
                <div class="size-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
            </div>
            <div class="mt-1">
                <span class="text-xs text-slate-400 underline">View breakdown →</span>
            </div>
        </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <!-- Revenue Chart -->
        <div class="card lg:col-span-2">
            <div class="border-b border-slate-200 p-4 dark:border-navy-500">
                <h3 class="text-lg font-medium text-slate-700 dark:text-navy-100">Weekly Revenue Trend</h3>
            </div>
            <div class="p-4">
                <canvas id="revenueChart" width="400" height="150"></canvas>
            </div>
        </div>

        <!-- Provider Distribution Chart -->
        <div class="card">
            <div class="border-b border-slate-200 p-4 dark:border-navy-500">
                <h3 class="text-lg font-medium text-slate-700 dark:text-navy-100">Provider Distribution</h3>
            </div>
            <div class="p-4">
                <div class="relative">
                    <canvas id="providerChart" width="200" height="200"></canvas>
                </div>
                <div class="mt-4 space-y-2">
                    @forelse($stats['provider_stats'] ?? [] as $provider => $data)
                        @php
                            $providerName = match($provider) {
                                'mtn_mobile_money', 'mtn' => 'MTN Mobile Money',
                                'airtel_money', 'airtel' => 'Airtel Money',
                                'zengapay' => 'ZengaPay',
                                'stripe' => 'Stripe',
                                'flutterwave' => 'Flutterwave',
                                default => ucwords(str_replace('_', ' ', $provider ?? 'Unknown'))
                            };
                            $providerColor = match($provider) {
                                'mtn_mobile_money', 'mtn' => '#EAB308',
                                'airtel_money', 'airtel' => '#EF4444',
                                'zengapay' => '#3B82F6',
                                'stripe' => '#6366F1',
                                default => '#64748B'
                            };
                            $totalRevenue = collect($stats['provider_stats'])->sum('total');
                            $percentage = $totalRevenue > 0 ? round(($data['total'] / $totalRevenue) * 100, 1) : 0;
                        @endphp
                        <div class="flex items-center justify-between text-sm">
                            <div class="flex items-center gap-2">
                                <div class="size-2.5 rounded-full" style="background-color: {{ $providerColor }}"></div>
                                <span class="text-slate-600 dark:text-navy-300">{{ $providerName }}</span>
                            </div>
                            <span class="font-medium text-slate-700 dark:text-navy-100">{{ $percentage }}%</span>
                        </div>
                    @empty
                        <p class="text-center text-slate-400 text-sm">No provider data</p>
                    @endforelse
                </div>
            </div>
        </div>
    </div>

    <!-- Filters & Search -->
    <div class="card mb-6">
        <div class="border-b border-slate-200 p-4 dark:border-navy-500">
            <h3 class="text-lg font-medium text-slate-700 dark:text-navy-100">Payments Management</h3>
        </div>

        <form method="GET" class="p-4">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                <!-- Search -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Search</label>
                    <input name="search" type="text" placeholder="Payment reference, user..."
                           value="{{ request('search') }}"
                           class="form-input mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent">
                </div>

                <!-- Status Filter -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Status</label>
                    <select name="status" class="form-select mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent">
                        <option value="">All Status</option>
                        <option value="completed" {{ request('status') === 'completed' ? 'selected' : '' }}>Completed</option>
                        <option value="pending" {{ request('status') === 'pending' ? 'selected' : '' }}>Pending</option>
                        <option value="failed" {{ request('status') === 'failed' ? 'selected' : '' }}>Failed</option>
                        <option value="cancelled" {{ request('status') === 'cancelled' ? 'selected' : '' }}>Cancelled</option>
                    </select>
                </div>

                <!-- Payment Method -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Method</label>
                    <select name="payment_method" class="form-select mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent">
                        <option value="">All Methods</option>
                        <option value="mobile_money" {{ request('payment_method') === 'mobile_money' ? 'selected' : '' }}>Mobile Money</option>
                        <option value="credit_card" {{ request('payment_method') === 'credit_card' ? 'selected' : '' }}>Credit Card</option>
                        <option value="bank_transfer" {{ request('payment_method') === 'bank_transfer' ? 'selected' : '' }}>Bank Transfer</option>
                    </select>
                </div>

                <!-- Amount Range -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Amount Range</label>
                    <select name="amount_range" class="form-select mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent">
                        <option value="">All Amounts</option>
                        <option value="0-10" {{ request('amount_range') === '0-10' ? 'selected' : '' }}>$0 - $10</option>
                        <option value="10-50" {{ request('amount_range') === '10-50' ? 'selected' : '' }}>$10 - $50</option>
                        <option value="50-100" {{ request('amount_range') === '50-100' ? 'selected' : '' }}>$50 - $100</option>
                        <option value="100+" {{ request('amount_range') === '100+' ? 'selected' : '' }}>$100+</option>
                    </select>
                </div>

                <!-- Date Range -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Date Range</label>
                    <select name="date_range" class="form-select mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent">
                        <option value="">All Time</option>
                        <option value="today" {{ request('date_range') === 'today' ? 'selected' : '' }}>Today</option>
                        <option value="week" {{ request('date_range') === 'week' ? 'selected' : '' }}>This Week</option>
                        <option value="month" {{ request('date_range') === 'month' ? 'selected' : '' }}>This Month</option>
                        <option value="year" {{ request('date_range') === 'year' ? 'selected' : '' }}>This Year</option>
                    </select>
                </div>
            </div>

            <div class="mt-4 flex justify-end space-x-2">
                <a href="{{ route('admin.payments.index') }}" class="btn border border-slate-300 font-medium text-slate-700 hover:bg-slate-150 dark:border-navy-450 dark:text-navy-100 dark:hover:bg-navy-500">
                    Clear
                </a>
                <button type="submit" class="btn bg-primary text-white hover:bg-primary-focus">
                    Apply Filters
                </button>
                <a href="{{ route('admin.payments.analytics') }}" class="btn bg-success text-white hover:bg-success-focus">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export
                </a>
                <a href="{{ route('admin.wallets.index') }}" class="btn bg-info text-white hover:bg-info-focus">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Wallets
                </a>
            </div>
        </form>
    </div>

    <!-- Payments Table -->
    <div class="card">
        <div class="is-scrollbar-hidden min-w-full overflow-x-auto">
            <table class="is-hoverable w-full text-left">
                <thead>
                    <tr class="border-y border-transparent border-b-slate-200 dark:border-b-navy-500">
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Payment
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            User
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Amount
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Method
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Status
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Date
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($payments as $payment)
                        <tr class="border-y border-transparent border-b-slate-200 dark:border-b-navy-500">
                            <!-- Payment Info -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <div>
                                    <p class="font-medium text-slate-700 dark:text-navy-100">{{ $payment->payment_reference }}</p>
                                    <p class="text-xs text-slate-400">{{ $payment->description ?? 'Subscription Payment' }}</p>
                                </div>
                            </td>

                            <!-- User -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <div class="flex items-center space-x-2">
                                    <div class="avatar size-8">
                                        <img class="rounded-full" src="{{ $payment->user->avatar ? Storage::url($payment->user->avatar) : asset('images/200x200.png') }}" alt="{{ $payment->user->name }}" />
                                    </div>
                                    <div>
                                        <p class="text-sm font-medium text-slate-700 dark:text-navy-100">{{ $payment->user->name }}</p>
                                        <p class="text-xs text-slate-400">{{ $payment->user->email }}</p>
                                    </div>
                                </div>
                            </td>

                            <!-- Amount -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <div>
                                    <p class="font-semibold text-slate-700 dark:text-navy-100">${{ number_format($payment->amount, 2) }}</p>
                                    <p class="text-xs text-slate-400">{{ strtoupper($payment->currency) }}</p>
                                </div>
                            </td>

                            <!-- Method -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <div class="flex items-center space-x-2">
                                    @if($payment->payment_method === 'mobile_money')
                                        <div class="size-8 rounded bg-warning/10 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p class="text-sm font-medium text-slate-700 dark:text-navy-100">Mobile Money</p>
                                            <p class="text-xs text-slate-400">{{ $payment->provider ?? 'MTN/Airtel' }}</p>
                                        </div>
                                    @elseif($payment->payment_method === 'credit_card')
                                        <div class="size-8 rounded bg-info/10 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p class="text-sm font-medium text-slate-700 dark:text-navy-100">Credit Card</p>
                                            <p class="text-xs text-slate-400">{{ $payment->card_last_four ? '**** ' . $payment->card_last_four : 'Card' }}</p>
                                        </div>
                                    @else
                                        <div class="size-8 rounded bg-success/10 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p class="text-sm font-medium text-slate-700 dark:text-navy-100">Bank Transfer</p>
                                            <p class="text-xs text-slate-400">{{ $payment->provider ?? 'Bank' }}</p>
                                        </div>
                                    @endif
                                </div>
                            </td>

                            <!-- Status -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <span class="badge rounded-full
                                    {{ $payment->status === 'completed' ? 'bg-success/10 text-success' :
                                       ($payment->status === 'pending' ? 'bg-warning/10 text-warning' :
                                       ($payment->status === 'failed' ? 'bg-error/10 text-error' : 'bg-slate-150 text-slate-800 dark:bg-navy-500 dark:text-navy-100')) }}">
                                    {{ ucfirst($payment->status) }}
                                </span>
                            </td>

                            <!-- Date -->
                            <td class="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-navy-100 lg:px-5">
                                <div>
                                    <p>{{ $payment->created_at->format('M j, Y') }}</p>
                                    <p class="text-xs text-slate-400">{{ $payment->created_at->format('H:i A') }}</p>
                                </div>
                            </td>

                            <!-- Actions -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <div class="flex items-center space-x-2">
                                    <!-- View Payment Details (Eye Icon) -->
                                    <a href="{{ route('admin.payments.show', $payment) }}" 
                                       class="btn size-8 rounded-full p-0 hover:bg-slate-300/20 focus:bg-slate-300/20 active:bg-slate-300/25"
                                       title="View Details">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </a>

                                    <!-- Process Pending Payment (Checkmark Icon) -->
                                    @if($payment->status === 'pending')
                                        <form method="POST" action="{{ route('admin.payments.process', $payment) }}" class="inline">
                                            @csrf
                                            <button type="submit" 
                                                    class="btn size-8 rounded-full p-0 hover:bg-slate-300/20 focus:bg-slate-300/20 active:bg-slate-300/25"
                                                    onclick="return confirm('Are you sure you want to approve and process this payment?')"
                                                    title="Approve Payment">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </button>
                                        </form>
                                    @endif

                                    <!-- Retry Failed Payment (Refresh Icon) -->
                                    @if($payment->status === 'failed')
                                        <form method="POST" action="{{ route('admin.payments.retry', $payment) }}" class="inline">
                                            @csrf
                                            <button type="submit" 
                                                    class="btn size-8 rounded-full p-0 hover:bg-slate-300/20 focus:bg-slate-300/20 active:bg-slate-300/25"
                                                    onclick="return confirm('Are you sure you want to retry this payment?')"
                                                    title="Retry Payment">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                            </button>
                                        </form>
                                    @endif
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="px-4 py-8 text-center text-slate-400">
                                No payments found matching your criteria.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        @if($payments->hasPages())
            <div class="flex items-center justify-between px-4 py-4">
                <div class="text-sm text-slate-400">
                    Showing {{ $payments->firstItem() }}-{{ $payments->lastItem() }} of {{ $payments->total() }} payments
                </div>
                {{ $payments->links() }}
            </div>
        @endif
    </div>

    <script>
        // Revenue Chart with weekly data
        const ctx = document.getElementById('revenueChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: {!! json_encode(array_keys($stats['weekly_revenue'] ?? [])) !!},
                datasets: [{
                    label: 'Revenue (UGX)',
                    data: {!! json_encode(array_values($stats['weekly_revenue'] ?? [])) !!},
                    borderColor: 'rgb(79, 70, 229)',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'UGX ' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });

        // Provider Distribution Donut Chart
        @if(!empty($stats['provider_stats']))
            const providerCtx = document.getElementById('providerChart').getContext('2d');
            const providerColors = {
                'mtn_mobile_money': '#EAB308',
                'mtn': '#EAB308',
                'airtel_money': '#EF4444',
                'airtel': '#EF4444',
                'zengapay': '#3B82F6',
                'stripe': '#6366F1',
                'flutterwave': '#10B981'
            };
            const providerData = @json($stats['provider_stats']);
            const labels = Object.keys(providerData).map(key => {
                const nameMap = {
                    'mtn_mobile_money': 'MTN Mobile Money',
                    'mtn': 'MTN',
                    'airtel_money': 'Airtel Money',
                    'airtel': 'Airtel',
                    'zengapay': 'ZengaPay',
                    'stripe': 'Stripe',
                    'flutterwave': 'Flutterwave'
                };
                return nameMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            });
            const values = Object.values(providerData).map(d => d.total);
            const colors = Object.keys(providerData).map(key => providerColors[key] || '#64748B');

            new Chart(providerCtx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: values,
                        backgroundColor: colors,
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    cutout: '65%',
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const value = context.parsed;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `UGX ${value.toLocaleString()} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        @endif
    </script>

    <!-- Failure Reasons Modal -->
    <div x-show="showFailureModal" 
         x-cloak
         class="fixed inset-0 z-50 overflow-y-auto"
         x-transition:enter="ease-out duration-300"
         x-transition:enter-start="opacity-0"
         x-transition:enter-end="opacity-100"
         x-transition:leave="ease-in duration-200"
         x-transition:leave-start="opacity-100"
         x-transition:leave-end="opacity-0">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="showFailureModal = false"></div>
        <div class="fixed inset-0 z-10 overflow-y-auto">
            <div class="flex min-h-full items-center justify-center p-4">
                <div class="relative w-full max-w-lg transform rounded-xl bg-white dark:bg-navy-700 shadow-xl transition-all"
                     x-transition:enter="ease-out duration-300"
                     x-transition:enter-start="opacity-0 scale-95"
                     x-transition:enter-end="opacity-100 scale-100"
                     x-transition:leave="ease-in duration-200"
                     x-transition:leave-start="opacity-100 scale-100"
                     x-transition:leave-end="opacity-0 scale-95"
                     @click.stop>
                    <div class="p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50">Top Failure Reasons</h3>
                            <button @click="showFailureModal = false" class="text-slate-400 hover:text-slate-600">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div class="space-y-3">
                            @forelse($stats['failure_reasons'] ?? [] as $reason => $count)
                                <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-navy-600 rounded-lg">
                                    <span class="text-sm text-slate-700 dark:text-navy-100 truncate max-w-xs" title="{{ $reason }}">{{ Str::limit($reason, 50) }}</span>
                                    <span class="badge bg-error/10 text-error">{{ $count }}</span>
                                </div>
                            @empty
                                <p class="text-center text-slate-400 py-4">No failure reasons recorded</p>
                            @endforelse
                        </div>
                        <div class="mt-4 pt-4 border-t border-slate-200 dark:border-navy-500">
                            <a href="{{ route('admin.payments.index', ['status' => 'failed']) }}" 
                               class="btn w-full bg-error text-white hover:bg-error-focus">
                                View All Failed Payments
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Provider Breakdown Modal -->
    <div x-show="showProviderModal" 
         x-cloak
         class="fixed inset-0 z-50 overflow-y-auto"
         x-transition:enter="ease-out duration-300"
         x-transition:enter-start="opacity-0"
         x-transition:enter-end="opacity-100"
         x-transition:leave="ease-in duration-200"
         x-transition:leave-start="opacity-100"
         x-transition:leave-end="opacity-0">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="showProviderModal = false"></div>
        <div class="fixed inset-0 z-10 overflow-y-auto">
            <div class="flex min-h-full items-center justify-center p-4">
                <div class="relative w-full max-w-lg transform rounded-xl bg-white dark:bg-navy-700 shadow-xl transition-all"
                     x-transition:enter="ease-out duration-300"
                     x-transition:enter-start="opacity-0 scale-95"
                     x-transition:enter-end="opacity-100 scale-100"
                     x-transition:leave="ease-in duration-200"
                     x-transition:leave-start="opacity-100 scale-100"
                     x-transition:leave-end="opacity-0 scale-95"
                     @click.stop>
                    <div class="p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50">Provider Breakdown</h3>
                            <button @click="showProviderModal = false" class="text-slate-400 hover:text-slate-600">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div class="space-y-3">
                            @forelse($stats['provider_stats'] ?? [] as $provider => $data)
                                @php
                                    $providerName = match($provider) {
                                        'mtn_mobile_money', 'mtn' => 'MTN Mobile Money',
                                        'airtel_money', 'airtel' => 'Airtel Money',
                                        'zengapay' => 'ZengaPay',
                                        'stripe' => 'Stripe',
                                        'flutterwave' => 'Flutterwave',
                                        default => ucwords(str_replace('_', ' ', $provider ?? 'Unknown'))
                                    };
                                    $providerColor = match($provider) {
                                        'mtn_mobile_money', 'mtn' => 'bg-yellow-500',
                                        'airtel_money', 'airtel' => 'bg-red-500',
                                        'zengapay' => 'bg-blue-500',
                                        default => 'bg-slate-500'
                                    };
                                @endphp
                                <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-navy-600 rounded-lg">
                                    <div class="flex items-center space-x-3">
                                        <div class="size-3 rounded-full {{ $providerColor }}"></div>
                                        <span class="text-sm font-medium text-slate-700 dark:text-navy-100">{{ $providerName }}</span>
                                    </div>
                                    <div class="text-right">
                                        <p class="text-sm font-semibold text-slate-700 dark:text-navy-100">UGX {{ number_format($data['total'] ?? 0, 0) }}</p>
                                        <p class="text-xs text-slate-400">{{ $data['count'] ?? 0 }} transactions</p>
                                    </div>
                                </div>
                            @empty
                                <p class="text-center text-slate-400 py-4">No provider data available</p>
                            @endforelse
                        </div>
                        @if(!empty($stats['provider_stats']))
                            <div class="mt-4 pt-4 border-t border-slate-200 dark:border-navy-500">
                                <div class="flex justify-between text-sm">
                                    <span class="text-slate-500 dark:text-navy-300">Total from all providers:</span>
                                    <span class="font-semibold text-slate-700 dark:text-navy-100">
                                        UGX {{ number_format(collect($stats['provider_stats'])->sum('total'), 0) }}
                                    </span>
                                </div>
                            </div>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection