@extends('layouts.app')

@section('title', 'My SACCO Dashboard - TesoTunes')

@section('left-sidebar')
    @include('frontend.partials.sacco-left-sidebar')
@endsection

@push('styles')
<style>
    .tooltip-trigger { position: relative; cursor: help; }
    .tooltip-content {
        visibility: hidden;
        opacity: 0;
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: #1f2937;
        color: white;
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 12px;
        white-space: nowrap;
        z-index: 50;
        transition: all 0.2s;
        margin-bottom: 8px;
    }
    .tooltip-content::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 6px solid transparent;
        border-top-color: #1f2937;
    }
    .tooltip-trigger:hover .tooltip-content {
        visibility: visible;
        opacity: 1;
    }
    .progress-ring { transform: rotate(-90deg); }
    .animate-pulse-slow { animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
    @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
    }
    .shimmer {
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        background-size: 200% 100%;
        animation: shimmer 2s infinite;
    }
</style>
@endpush

@section('content')
<div class="min-h-screen bg-gray-50 dark:bg-[#0D1117]">
    <main class="p-4 md:p-6 lg:p-8 scroll-smooth">
        <div class="max-w-[1600px] mx-auto space-y-6">
            
            {{-- Welcome Header with Member Info --}}
            <div class="relative bg-gradient-to-br from-brand-green/10 via-white to-emerald-50 dark:from-brand-green/5 dark:via-[#161B22] dark:to-[#161B22] border border-brand-green/20 rounded-2xl p-6 md:p-8 overflow-hidden shadow-sm">
                <div class="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl pointer-events-none bg-brand-green/10"></div>
                <div class="absolute -left-10 -bottom-10 w-40 h-40 rounded-full blur-2xl pointer-events-none bg-emerald-500/5"></div>
                
                <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
                    {{-- Left: Member Welcome --}}
                    <div class="flex-1">
                        <div class="flex items-center gap-3 mb-4">
                            <div class="relative">
                                <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-green to-emerald-600 flex items-center justify-center shadow-lg shadow-brand-green/30">
                                    <span class="material-symbols-outlined text-white text-2xl">account_balance</span>
                                </div>
                                <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-brand-green rounded-full border-2 border-white dark:border-[#161B22] flex items-center justify-center">
                                    <span class="material-symbols-outlined text-white text-xs">check</span>
                                </div>
                            </div>
                            <div>
                                <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                                    Welcome back, {{ auth()->user()->first_name ?? explode(' ', auth()->user()->name)[0] }}!
                                </h1>
                                <p class="text-gray-500 dark:text-gray-400 text-sm">
                                    Member since {{ ($member->joined_at ?? $member->created_at)->format('F Y') }}
                                    <span class="mx-1">•</span>
                                    <span class="text-brand-green font-medium">{{ $stats['membership_days'] }} days active</span>
                                </p>
                            </div>
                        </div>
                        
                        {{-- Member Status Badges --}}
                        <div class="flex flex-wrap gap-3">
                            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-green/10 border border-brand-green/20">
                                <span class="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span>
                                <span class="text-xs font-bold text-brand-green uppercase tracking-wide">Active Member</span>
                            </div>
                            @php
                                $tierColors = [
                                    'purple' => 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400',
                                    'yellow' => 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400',
                                    'gray' => 'bg-gray-500/10 border-gray-500/20 text-gray-600 dark:text-gray-400',
                                    'orange' => 'bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400',
                                ];
                                $tierClass = $tierColors[$stats['membership_tier']['color']] ?? $tierColors['gray'];
                            @endphp
                            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full {{ $tierClass }}">
                                <span class="material-symbols-outlined text-sm">{{ $stats['membership_tier']['icon'] }}</span>
                                <span class="text-xs font-bold uppercase tracking-wide">{{ $stats['membership_tier']['name'] }} Tier</span>
                            </div>
                            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                                <span class="material-symbols-outlined text-sm text-blue-500">verified</span>
                                <span class="text-xs font-bold text-blue-600 dark:text-blue-400">{{ $member->member_number }}</span>
                            </div>
                        </div>
                    </div>

                    {{-- Right: Quick Actions --}}
                    <div class="flex flex-wrap gap-3">
                        <a href="{{ route('sacco.deposits.create') }}" class="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-green hover:bg-green-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-green/30 hover:shadow-brand-green/40 hover:scale-[1.02]">
                            <span class="material-symbols-outlined text-lg">add_circle</span>
                            <span>Deposit</span>
                        </a>
                        <a href="{{ route('sacco.withdrawals.create') }}" class="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#21262D] hover:bg-gray-100 dark:hover:bg-[#30363D] text-gray-700 dark:text-white font-bold rounded-xl border border-gray-200 dark:border-[#30363D] transition-all hover:scale-[1.02]">
                            <span class="material-symbols-outlined text-lg">account_balance_wallet</span>
                            <span>Withdraw</span>
                        </a>
                        <a href="{{ route('sacco.loans.apply') }}" class="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#21262D] hover:bg-gray-100 dark:hover:bg-[#30363D] text-gray-700 dark:text-white font-bold rounded-xl border border-gray-200 dark:border-[#30363D] transition-all hover:scale-[1.02]">
                            <span class="material-symbols-outlined text-lg">handshake</span>
                            <span>Apply Loan</span>
                        </a>
                    </div>
                </div>
            </div>

            {{-- Financial Overview Cards --}}
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {{-- Total Savings Card --}}
                <div class="relative bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#30363D] rounded-2xl p-5 overflow-hidden group hover:border-brand-green/50 transition-all shadow-sm hover:shadow-md">
                    <div class="absolute top-0 right-0 w-24 h-24 bg-brand-green/5 rounded-full blur-2xl"></div>
                    <div class="relative z-10">
                        <div class="flex items-center justify-between mb-3">
                            <div class="tooltip-trigger">
                                <span class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    Total Savings
                                    <span class="material-symbols-outlined text-sm text-gray-400">help</span>
                                </span>
                                <div class="tooltip-content max-w-xs whitespace-normal">
                                    Your total savings across all accounts. This is money you've deposited and can be used as collateral for loans.
                                </div>
                            </div>
                            <div class="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <span class="material-symbols-outlined text-brand-green">savings</span>
                            </div>
                        </div>
                        <h3 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                            UGX {{ number_format($stats['total_savings']) }}
                        </h3>
                        <div class="flex items-center gap-2">
                            @php
                                $isPositiveGrowth = str_starts_with($stats['growth_percentage'], '+');
                            @endphp
                            <span class="inline-flex items-center gap-1 text-xs font-medium {{ $isPositiveGrowth ? 'text-brand-green' : 'text-gray-500' }}">
                                <span class="material-symbols-outlined text-sm">{{ $isPositiveGrowth ? 'trending_up' : 'trending_flat' }}</span>
                                {{ $stats['growth_percentage'] }} this month
                            </span>
                        </div>
                    </div>
                </div>

                {{-- Loan Eligibility Card --}}
                <div class="relative bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#30363D] rounded-2xl p-5 overflow-hidden group hover:border-blue-500/50 transition-all shadow-sm hover:shadow-md">
                    <div class="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
                    <div class="relative z-10">
                        <div class="flex items-center justify-between mb-3">
                            <div class="tooltip-trigger">
                                <span class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    Loan Eligibility
                                    <span class="material-symbols-outlined text-sm text-gray-400">help</span>
                                </span>
                                <div class="tooltip-content max-w-xs whitespace-normal">
                                    You can borrow up to 3x your total savings. This shows how much you can still borrow.
                                </div>
                            </div>
                            <div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <span class="material-symbols-outlined text-blue-500">credit_card</span>
                            </div>
                        </div>
                        <h3 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                            UGX {{ number_format($stats['available_loan_limit']) }}
                        </h3>
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-gray-500 dark:text-gray-400">
                                Max: UGX {{ number_format($stats['loan_limit']) }}
                            </span>
                        </div>
                    </div>
                </div>

                {{-- Estimated Dividend Card --}}
                <div class="relative bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#30363D] rounded-2xl p-5 overflow-hidden group hover:border-purple-500/50 transition-all shadow-sm hover:shadow-md">
                    <div class="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl"></div>
                    <div class="relative z-10">
                        <div class="flex items-center justify-between mb-3">
                            <div class="tooltip-trigger">
                                <span class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    Est. Dividend
                                    <span class="material-symbols-outlined text-sm text-gray-400">help</span>
                                </span>
                                <div class="tooltip-content max-w-xs whitespace-normal">
                                    Projected annual dividend based on {{ $stats['dividend_yield'] }}% return. Paid quarterly or annually.
                                </div>
                            </div>
                            <div class="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <span class="material-symbols-outlined text-purple-500">pie_chart</span>
                            </div>
                        </div>
                        <h3 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                            UGX {{ number_format($stats['estimated_annual_dividend']) }}
                        </h3>
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-purple-500 font-medium">
                                Next: {{ $stats['next_dividend_date'] }}
                            </span>
                        </div>
                    </div>
                </div>

                {{-- Credit Score Card --}}
                <div class="relative bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#30363D] rounded-2xl p-5 overflow-hidden group hover:border-emerald-500/50 transition-all shadow-sm hover:shadow-md">
                    <div class="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl"></div>
                    <div class="relative z-10">
                        <div class="flex items-center justify-between mb-3">
                            <div class="tooltip-trigger">
                                <span class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    Credit Score
                                    <span class="material-symbols-outlined text-sm text-gray-400">help</span>
                                </span>
                                <div class="tooltip-content max-w-xs whitespace-normal">
                                    Based on your savings history, loan repayments, and account activity. Higher score = better loan terms.
                                </div>
                            </div>
                            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <span class="material-symbols-outlined text-emerald-500">speed</span>
                            </div>
                        </div>
                        <div class="flex items-end gap-2 mb-1">
                            <h3 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{{ $stats['credit_score'] }}</h3>
                            <span class="text-sm text-gray-400 mb-1">/ 850</span>
                        </div>
                        <div class="flex items-center gap-2">
                            @php
                                $scoreLevel = match(true) {
                                    $stats['credit_score'] >= 750 => ['Excellent', 'text-brand-green'],
                                    $stats['credit_score'] >= 650 => ['Good', 'text-blue-500'],
                                    $stats['credit_score'] >= 550 => ['Fair', 'text-yellow-500'],
                                    default => ['Building', 'text-orange-500']
                                };
                            @endphp
                            <span class="text-xs font-bold {{ $scoreLevel[1] }}">{{ $scoreLevel[0] }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {{-- Main Content Area --}}
                <div class="lg:col-span-2 space-y-6">
                    
                    {{-- Savings Accounts Overview --}}
                    <div class="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#30363D] rounded-2xl overflow-hidden shadow-sm">
                        <div class="p-5 border-b border-gray-100 dark:border-[#30363D]">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center">
                                        <span class="material-symbols-outlined text-brand-green">account_balance_wallet</span>
                                    </div>
                                    <div>
                                        <h3 class="text-lg font-bold text-gray-900 dark:text-white">My Savings Accounts</h3>
                                        <p class="text-xs text-gray-500 dark:text-gray-400">{{ $savingsAccounts->count() }} active account(s)</p>
                                    </div>
                                </div>
                                <a href="{{ route('sacco.accounts.index') }}" class="text-sm text-brand-green hover:text-green-600 font-medium flex items-center gap-1">
                                    View All <span class="material-symbols-outlined text-sm">arrow_forward</span>
                                </a>
                            </div>
                        </div>
                        
                        <div class="p-5">
                            @if($savingsAccounts->isEmpty())
                                <div class="text-center py-8">
                                    <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-[#21262D] flex items-center justify-center mx-auto mb-4">
                                        <span class="material-symbols-outlined text-3xl text-gray-400">account_balance_wallet</span>
                                    </div>
                                    <h4 class="font-bold text-gray-900 dark:text-white mb-2">No Savings Accounts Yet</h4>
                                    <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Start your savings journey by making your first deposit</p>
                                    <a href="{{ route('sacco.deposits.create') }}" class="inline-flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
                                        <span class="material-symbols-outlined text-sm">add</span>
                                        Make First Deposit
                                    </a>
                                </div>
                            @else
                                <div class="space-y-4">
                                    @foreach($savingsAccounts as $account)
                                        @php
                                            $accountTypeConfig = match($account->account_type) {
                                                'regular' => ['bg' => 'bg-brand-green/10', 'text' => 'text-brand-green', 'icon' => 'savings'],
                                                'fixed_deposit' => ['bg' => 'bg-blue-500/10', 'text' => 'text-blue-500', 'icon' => 'lock'],
                                                'target' => ['bg' => 'bg-purple-500/10', 'text' => 'text-purple-500', 'icon' => 'flag'],
                                                'retirement' => ['bg' => 'bg-orange-500/10', 'text' => 'text-orange-500', 'icon' => 'elderly'],
                                                default => ['bg' => 'bg-gray-500/10', 'text' => 'text-gray-500', 'icon' => 'savings']
                                            };
                                        @endphp
                                        <div class="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-[#21262D]/50 border border-gray-100 dark:border-[#30363D]/50 hover:border-brand-green/30 transition-colors group">
                                            <div class="flex items-center gap-4">
                                                <div class="w-12 h-12 rounded-xl flex items-center justify-center {{ $accountTypeConfig['bg'] }}">
                                                    <span class="material-symbols-outlined {{ $accountTypeConfig['text'] }}">{{ $accountTypeConfig['icon'] }}</span>
                                                </div>
                                                <div>
                                                    <h4 class="font-bold text-gray-900 dark:text-white">
                                                        {{ $account->account_name ?? ucfirst(str_replace('_', ' ', $account->account_type)) . ' Account' }}
                                                    </h4>
                                                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ $account->account_number }}</p>
                                                </div>
                                            </div>
                                            <div class="text-right">
                                                <p class="text-lg font-bold text-gray-900 dark:text-white">UGX {{ number_format($account->balance_ugx) }}</p>
                                                @if($account->interest_rate > 0)
                                                    <p class="text-xs text-brand-green">+{{ $account->interest_rate }}% p.a. interest</p>
                                                @endif
                                            </div>
                                        </div>
                                    @endforeach
                                </div>
                            @endif
                        </div>
                    </div>

                    {{-- Savings Growth Chart --}}
                    <div class="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#30363D] rounded-2xl overflow-hidden shadow-sm">
                        <div class="p-5 border-b border-gray-100 dark:border-[#30363D]">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                        <span class="material-symbols-outlined text-emerald-500">trending_up</span>
                                    </div>
                                    <div>
                                        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Savings Growth</h3>
                                        <p class="text-xs text-gray-500 dark:text-gray-400">Monthly deposits over the last 6 months</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="p-5">
                            {{-- Chart Container --}}
                            <div class="h-48 flex items-end justify-between gap-3 px-2">
                                @php
                                    $maxValue = count($stats['monthly_growth']) > 0 ? max(array_merge($stats['monthly_growth'], [1])) : 1;
                                @endphp
                                @forelse($stats['monthly_growth'] as $index => $value)
                                    @php
                                        $height = $maxValue > 0 ? max(8, ($value / $maxValue) * 100) : 8;
                                        $isLast = $index === count($stats['monthly_growth']) - 1;
                                    @endphp
                                    <div class="flex-1 flex flex-col items-center gap-2">
                                        <div class="w-full rounded-t-lg relative group cursor-pointer transition-all hover:opacity-90
                                            {{ $isLast ? 'bg-gradient-to-t from-brand-green to-emerald-400 shadow-lg shadow-brand-green/30' : 'bg-brand-green/20 dark:bg-brand-green/30' }}" 
                                            style="height: {{ $height }}%">
                                            <div class="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap
                                                {{ $isLast ? 'bg-brand-green text-white' : 'bg-gray-800 text-white' }}">
                                                UGX {{ number_format($value * 1000) }}
                                            </div>
                                        </div>
                                        <span class="text-[11px] text-gray-500 dark:text-gray-400 font-medium">{{ $stats['growth_months'][$index] ?? '' }}</span>
                                    </div>
                                @empty
                                    <div class="w-full h-full flex items-center justify-center">
                                        <div class="text-center">
                                            <span class="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-2">bar_chart</span>
                                            <p class="text-sm text-gray-500 dark:text-gray-400">No deposit history yet</p>
                                        </div>
                                    </div>
                                @endforelse
                            </div>
                            
                            {{-- Chart Legend --}}
                            <div class="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100 dark:border-[#30363D]">
                                <div class="flex items-center gap-2">
                                    <div class="w-3 h-3 rounded bg-brand-green/20"></div>
                                    <span class="text-xs text-gray-500 dark:text-gray-400">Previous Months</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <div class="w-3 h-3 rounded bg-brand-green"></div>
                                    <span class="text-xs text-gray-500 dark:text-gray-400">Current Month</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {{-- Loan Center --}}
                    <div class="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#30363D] rounded-2xl overflow-hidden shadow-sm">
                        <div class="p-5 border-b border-gray-100 dark:border-[#30363D]">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                        <span class="material-symbols-outlined text-blue-500">handshake</span>
                                    </div>
                                    <div>
                                        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Loan Center</h3>
                                        <p class="text-xs text-gray-500 dark:text-gray-400">Manage loans and apply for new ones</p>
                                    </div>
                                </div>
                                <a href="{{ route('sacco.loans.index') }}" class="text-sm text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1">
                                    View All <span class="material-symbols-outlined text-sm">arrow_forward</span>
                                </a>
                            </div>
                        </div>
                        
                        <div class="p-5">
                            @php
                                $activeLoans = $loans->whereIn('status', ['active', 'disbursed']);
                            @endphp
                            
                            @if($activeLoans->isNotEmpty())
                                {{-- Active Loans --}}
                                <div class="space-y-4 mb-6">
                                    @foreach($activeLoans->take(2) as $loan)
                                        <div class="relative p-5 rounded-xl bg-gradient-to-r from-blue-500/5 to-transparent border border-blue-500/20 overflow-hidden">
                                            <div class="absolute top-0 right-0 w-32 h-32 opacity-5">
                                                <span class="material-symbols-outlined text-[128px] text-blue-500">account_balance</span>
                                            </div>
                                            
                                            <div class="relative z-10">
                                                <div class="flex items-start justify-between mb-4">
                                                    <div>
                                                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500 text-white mb-2">
                                                            <span class="material-symbols-outlined text-xs">pending</span>
                                                            ACTIVE LOAN
                                                        </span>
                                                        <h4 class="font-bold text-gray-900 dark:text-white">{{ optional($loan->loanProduct)->name ?? 'Personal Loan' }}</h4>
                                                        <p class="text-xs text-gray-500 dark:text-gray-400">Loan #{{ $loan->loan_number }}</p>
                                                    </div>
                                                    <div class="text-right">
                                                        <p class="text-xs text-gray-500 dark:text-gray-400">Balance</p>
                                                        <p class="text-xl font-bold text-blue-500">UGX {{ number_format($loan->balance_remaining_ugx) }}</p>
                                                    </div>
                                                </div>
                                                
                                                {{-- Loan Progress --}}
                                                @php
                                                    $principal = $loan->total_payable_ugx ?: 1;
                                                    $paid = $loan->amount_paid_ugx ?: 0;
                                                    $progress = min(100, ($paid / $principal) * 100);
                                                @endphp
                                                <div class="mb-4">
                                                    <div class="flex justify-between text-xs mb-2">
                                                        <span class="text-gray-500 dark:text-gray-400">Repayment Progress</span>
                                                        <span class="font-bold text-blue-500">{{ number_format($progress, 0) }}% Complete</span>
                                                    </div>
                                                    <div class="w-full h-2 rounded-full bg-gray-200 dark:bg-[#30363D] overflow-hidden">
                                                        <div class="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all" style="width: {{ $progress }}%"></div>
                                                    </div>
                                                </div>
                                                
                                                <div class="grid grid-cols-3 gap-4 text-center">
                                                    <div class="p-2 rounded-lg bg-gray-50 dark:bg-[#21262D]">
                                                        <p class="text-[10px] uppercase text-gray-500 dark:text-gray-400 mb-1">Principal</p>
                                                        <p class="text-sm font-bold text-gray-900 dark:text-white">{{ number_format($loan->principal_amount_ugx) }}</p>
                                                    </div>
                                                    <div class="p-2 rounded-lg bg-gray-50 dark:bg-[#21262D]">
                                                        <p class="text-[10px] uppercase text-gray-500 dark:text-gray-400 mb-1">Total Paid</p>
                                                        <p class="text-sm font-bold text-brand-green">{{ number_format($loan->amount_paid_ugx) }}</p>
                                                    </div>
                                                    <div class="p-2 rounded-lg bg-gray-50 dark:bg-[#21262D]">
                                                        <p class="text-[10px] uppercase text-gray-500 dark:text-gray-400 mb-1">Monthly</p>
                                                        <p class="text-sm font-bold text-gray-900 dark:text-white">{{ number_format($loan->monthly_installment_ugx) }}</p>
                                                    </div>
                                                </div>
                                                
                                                <div class="flex gap-3 mt-4">
                                                    <a href="{{ route('sacco.loans.show', $loan->id) }}" class="flex-1 text-center py-2 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors">
                                                        View Details
                                                    </a>
                                                    <a href="{{ route('sacco.loans.payment', $loan->id) }}" class="flex-1 text-center py-2 text-sm font-medium rounded-lg border border-blue-500 text-blue-500 hover:bg-blue-500/10 transition-colors">
                                                        Make Payment
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    @endforeach
                                </div>
                            @else
                                {{-- No Active Loans --}}
                                <div class="text-center py-6 mb-6 bg-gray-50 dark:bg-[#21262D]/50 rounded-xl border border-dashed border-gray-200 dark:border-[#30363D]">
                                    <div class="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                                        <span class="material-symbols-outlined text-3xl text-blue-500">handshake</span>
                                    </div>
                                    <h4 class="font-bold text-gray-900 dark:text-white mb-2">No Active Loans</h4>
                                    <p class="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-xs mx-auto">
                                        You're eligible for up to <span class="font-bold text-brand-green">UGX {{ number_format($stats['available_loan_limit']) }}</span> in loans
                                    </p>
                                    <a href="{{ route('sacco.loans.apply') }}" class="inline-flex items-center gap-2 px-5 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                                        <span class="material-symbols-outlined text-sm">add</span>
                                        Apply for Loan
                                    </a>
                                </div>
                            @endif

                            {{-- Available Loan Products --}}
                            @if($loanProducts->isNotEmpty())
                                <div>
                                    <h4 class="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Available Loan Products</h4>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        @foreach($loanProducts->take(4) as $product)
                                            <div class="p-4 rounded-xl border border-gray-200 dark:border-[#30363D] hover:border-brand-green/50 transition-colors group bg-white dark:bg-[#21262D]/30">
                                                <div class="flex items-start justify-between mb-3">
                                                    <div class="w-10 h-10 rounded-lg bg-brand-green/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <span class="material-symbols-outlined text-brand-green">payments</span>
                                                    </div>
                                                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-green/10 text-brand-green">
                                                        {{ $product->interest_rate }}% p.a.
                                                    </span>
                                                </div>
                                                <h5 class="font-bold text-gray-900 dark:text-white text-sm mb-1">{{ $product->name }}</h5>
                                                <p class="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{{ $product->description ?? 'Flexible loan product for your needs' }}</p>
                                                <div class="flex items-center justify-between">
                                                    <span class="text-[10px] text-gray-400">Up to UGX {{ number_format($product->max_amount_ugx) }}</span>
                                                    <a href="{{ route('sacco.loans.apply') }}?product={{ $product->id }}" class="text-xs font-medium text-brand-green hover:text-green-600">
                                                        Apply →
                                                    </a>
                                                </div>
                                            </div>
                                        @endforeach
                                    </div>
                                </div>
                            @else
                                {{-- No Loan Products Available --}}
                                <div class="text-center py-6 bg-gray-50 dark:bg-[#21262D]/50 rounded-xl">
                                    <span class="material-symbols-outlined text-4xl text-gray-400 mb-2">info</span>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">Loan products coming soon</p>
                                </div>
                            @endif
                        </div>
                    </div>

                    {{-- Recent Transactions --}}
                    <div class="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#30363D] rounded-2xl overflow-hidden shadow-sm">
                        <div class="p-5 border-b border-gray-100 dark:border-[#30363D]">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                        <span class="material-symbols-outlined text-orange-500">receipt_long</span>
                                    </div>
                                    <div>
                                        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Recent Transactions</h3>
                                        <p class="text-xs text-gray-500 dark:text-gray-400">Your latest account activity</p>
                                    </div>
                                </div>
                                <a href="{{ route('sacco.transactions') }}" class="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1">
                                    View All <span class="material-symbols-outlined text-sm">arrow_forward</span>
                                </a>
                            </div>
                        </div>
                        
                        <div class="divide-y divide-gray-100 dark:divide-[#30363D]">
                            @forelse($recentTransactions as $transaction)
                                @php
                                    $isDeposit = $transaction->type === 'deposit' || $transaction->type === 'interest';
                                    $typeConfig = match($transaction->type) {
                                        'deposit' => ['icon' => 'arrow_downward', 'color' => 'brand-green', 'label' => 'Deposit'],
                                        'withdrawal' => ['icon' => 'arrow_upward', 'color' => 'red-500', 'label' => 'Withdrawal'],
                                        'interest' => ['icon' => 'percent', 'color' => 'purple-500', 'label' => 'Interest'],
                                        'fee' => ['icon' => 'receipt', 'color' => 'gray-500', 'label' => 'Fee'],
                                        'transfer_in' => ['icon' => 'call_received', 'color' => 'blue-500', 'label' => 'Transfer In'],
                                        'transfer_out' => ['icon' => 'call_made', 'color' => 'orange-500', 'label' => 'Transfer Out'],
                                        default => ['icon' => 'swap_horiz', 'color' => 'gray-500', 'label' => ucfirst($transaction->type)]
                                    };
                                    $colorClasses = match($typeConfig['color']) {
                                        'brand-green' => 'bg-brand-green/10 text-brand-green',
                                        'red-500' => 'bg-red-500/10 text-red-500',
                                        'purple-500' => 'bg-purple-500/10 text-purple-500',
                                        'blue-500' => 'bg-blue-500/10 text-blue-500',
                                        'orange-500' => 'bg-orange-500/10 text-orange-500',
                                        default => 'bg-gray-500/10 text-gray-500'
                                    };
                                @endphp
                                <div class="p-4 hover:bg-gray-50 dark:hover:bg-[#21262D]/50 transition-colors flex items-center justify-between">
                                    <div class="flex items-center gap-4">
                                        <div class="w-10 h-10 rounded-full flex items-center justify-center {{ $colorClasses }}">
                                            <span class="material-symbols-outlined">{{ $typeConfig['icon'] }}</span>
                                        </div>
                                        <div>
                                            <p class="font-medium text-gray-900 dark:text-white">{{ $typeConfig['label'] }}</p>
                                            <p class="text-xs text-gray-500 dark:text-gray-400">
                                                {{ $transaction->created_at->format('M d, Y') }}
                                                @if($transaction->description)
                                                    • {{ Str::limit($transaction->description, 30) }}
                                                @endif
                                            </p>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <p class="font-bold {{ $isDeposit ? 'text-brand-green' : 'text-gray-900 dark:text-white' }}">
                                            {{ $isDeposit ? '+' : '-' }}UGX {{ number_format($transaction->amount_ugx) }}
                                        </p>
                                        @php
                                            $statusClass = match($transaction->status) {
                                                'completed' => 'bg-brand-green/10 text-brand-green',
                                                'pending' => 'bg-yellow-500/10 text-yellow-600',
                                                default => 'bg-red-500/10 text-red-500'
                                            };
                                        @endphp
                                        <span class="text-[10px] px-2 py-0.5 rounded {{ $statusClass }}">
                                            {{ ucfirst($transaction->status) }}
                                        </span>
                                    </div>
                                </div>
                            @empty
                                <div class="p-8 text-center">
                                    <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-[#21262D] flex items-center justify-center mx-auto mb-4">
                                        <span class="material-symbols-outlined text-3xl text-gray-400">receipt_long</span>
                                    </div>
                                    <p class="text-gray-500 dark:text-gray-400">No transactions yet</p>
                                    <a href="{{ route('sacco.deposits.create') }}" class="text-sm text-brand-green hover:text-green-600 mt-2 inline-block">
                                        Make your first deposit →
                                    </a>
                                </div>
                            @endforelse
                        </div>
                    </div>
                </div>

                {{-- Sidebar --}}
                <div class="space-y-6">
                    
                    {{-- Auto-Save Status --}}
                    <div class="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#30363D] rounded-2xl p-5 shadow-sm">
                        <div class="flex items-center gap-3 mb-4">
                            <div class="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                                <span class="material-symbols-outlined text-cyan-500">autorenew</span>
                            </div>
                            <div>
                                <h4 class="font-bold text-gray-900 dark:text-white">Auto-Save</h4>
                                <p class="text-xs text-gray-500 dark:text-gray-400">Automatic savings from earnings</p>
                            </div>
                        </div>
                        
                        @if($autoSaveSettings && $autoSaveSettings->is_active)
                            <div class="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 mb-4">
                                <div class="flex items-center justify-between mb-3">
                                    <span class="text-sm text-gray-700 dark:text-gray-300">Status</span>
                                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-brand-green/10 text-brand-green">
                                        <span class="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse"></span>
                                        Active
                                    </span>
                                </div>
                                <div class="flex items-center justify-between mb-3">
                                    <span class="text-sm text-gray-700 dark:text-gray-300">Save Rate</span>
                                    <span class="font-bold text-gray-900 dark:text-white">{{ $autoSaveSettings->auto_save_percentage }}%</span>
                                </div>
                                <div class="flex items-center justify-between mb-3">
                                    <span class="text-sm text-gray-700 dark:text-gray-300">Total Auto-Saved</span>
                                    <span class="font-bold text-cyan-500">UGX {{ number_format($autoSaveSettings->total_auto_saved_ugx) }}</span>
                                </div>
                                <div class="pt-3 border-t border-cyan-500/20">
                                    <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">Saving from:</p>
                                    <div class="flex flex-wrap gap-2">
                                        @if($autoSaveSettings->save_from_song_sales)
                                            <span class="px-2 py-1 rounded text-[10px] bg-gray-100 dark:bg-[#21262D] text-gray-600 dark:text-gray-400">Song Sales</span>
                                        @endif
                                        @if($autoSaveSettings->save_from_streams)
                                            <span class="px-2 py-1 rounded text-[10px] bg-gray-100 dark:bg-[#21262D] text-gray-600 dark:text-gray-400">Streams</span>
                                        @endif
                                        @if($autoSaveSettings->save_from_tips)
                                            <span class="px-2 py-1 rounded text-[10px] bg-gray-100 dark:bg-[#21262D] text-gray-600 dark:text-gray-400">Tips</span>
                                        @endif
                                    </div>
                                </div>
                            </div>
                            <a href="{{ route('sacco.profile') }}" class="block w-full text-center py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-[#30363D] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#21262D] transition-colors">
                                Manage Settings
                            </a>
                        @else
                            <div class="text-center py-4 px-3 rounded-xl bg-gray-50 dark:bg-[#21262D]/50 border border-dashed border-gray-200 dark:border-[#30363D] mb-4">
                                <span class="material-symbols-outlined text-4xl text-gray-400 mb-2">autorenew</span>
                                <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    Automatically save a % of your music earnings
                                </p>
                            </div>
                            <a href="{{ route('sacco.profile') }}" class="block w-full text-center py-2 text-sm font-medium rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 transition-colors">
                                Enable Auto-Save
                            </a>
                        @endif
                    </div>

                    {{-- Dividends Card --}}
                    <div class="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#30363D] rounded-2xl p-5 shadow-sm">
                        <div class="flex items-center gap-3 mb-4">
                            <div class="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                <span class="material-symbols-outlined text-purple-500">trending_up</span>
                            </div>
                            <div>
                                <h4 class="font-bold text-gray-900 dark:text-white">Dividends</h4>
                                <p class="text-xs text-gray-500 dark:text-gray-400">Your earnings on savings</p>
                            </div>
                        </div>
                        
                        <div class="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 mb-4">
                            <div class="flex items-center justify-between mb-1">
                                <span class="text-xs text-gray-500 dark:text-gray-400">Annual Yield</span>
                                <span class="text-2xl font-bold text-purple-500">{{ $stats['dividend_yield'] }}%</span>
                            </div>
                            <p class="text-xs text-gray-400">Based on your savings balance</p>
                        </div>
                        
                        <div class="space-y-3 mb-4">
                            <div class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-[#30363D]">
                                <span class="text-sm text-gray-600 dark:text-gray-400">Total Earned</span>
                                <span class="font-bold text-gray-900 dark:text-white">UGX {{ number_format($stats['total_dividend_earned']) }}</span>
                            </div>
                            <div class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-[#30363D]">
                                <span class="text-sm text-gray-600 dark:text-gray-400">This Year</span>
                                <span class="font-bold text-brand-green">UGX {{ number_format($stats['this_year_dividend']) }}</span>
                            </div>
                            <div class="flex items-center justify-between py-2">
                                <span class="text-sm text-gray-600 dark:text-gray-400">Est. Annual</span>
                                <span class="font-bold text-purple-500">UGX {{ number_format($stats['estimated_annual_dividend']) }}</span>
                            </div>
                        </div>
                        
                        @if($lastDividend)
                            <div class="p-3 rounded-lg bg-gray-50 dark:bg-[#21262D] mb-4">
                                <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Dividend Payment</p>
                                <div class="flex items-center justify-between">
                                    <span class="font-bold text-gray-900 dark:text-white">UGX {{ number_format($lastDividend->net_amount) }}</span>
                                    <span class="text-xs text-gray-500">{{ $lastDividend->paid_at ? $lastDividend->paid_at->format('M d, Y') : 'Pending' }}</span>
                                </div>
                            </div>
                        @endif
                        
                        <a href="{{ route('sacco.dividends') }}" class="block w-full text-center py-2 text-sm font-medium rounded-lg border border-purple-500/30 text-purple-500 hover:bg-purple-500/10 transition-colors">
                            View Dividend History
                        </a>
                    </div>

                    {{-- Credit Score Details --}}
                    <div class="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#30363D] rounded-2xl p-5 shadow-sm">
                        <div class="flex items-center gap-3 mb-4">
                            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                <span class="material-symbols-outlined text-emerald-500">speed</span>
                            </div>
                            <div>
                                <h4 class="font-bold text-gray-900 dark:text-white">Credit Score</h4>
                                <p class="text-xs text-gray-500 dark:text-gray-400">Your creditworthiness</p>
                            </div>
                        </div>
                        
                        {{-- Score Circle --}}
                        <div class="flex items-center justify-center mb-4">
                            <div class="relative w-32 h-32">
                                @php
                                    $scorePercentage = ($stats['credit_score'] / 850) * 100;
                                    $circumference = 2 * 3.14159 * 54;
                                    $dashOffset = $circumference - ($scorePercentage / 100) * $circumference;
                                @endphp
                                <svg class="w-full h-full progress-ring" viewBox="0 0 120 120">
                                    <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" stroke-width="8" class="text-gray-200 dark:text-[#30363D]"/>
                                    <circle cx="60" cy="60" r="54" fill="none" stroke="#10B981" stroke-width="8" 
                                        stroke-dasharray="{{ $circumference }}" 
                                        stroke-dashoffset="{{ $dashOffset }}"
                                        stroke-linecap="round"/>
                                </svg>
                                <div class="absolute inset-0 flex items-center justify-center flex-col">
                                    <span class="text-3xl font-bold text-gray-900 dark:text-white">{{ $stats['credit_score'] }}</span>
                                    <span class="text-xs text-gray-500 dark:text-gray-400">of 850</span>
                                </div>
                            </div>
                        </div>
                        
                        {{-- Score Breakdown --}}
                        <div class="space-y-2">
                            <div class="flex items-center justify-between text-sm">
                                <span class="text-gray-600 dark:text-gray-400">Savings History</span>
                                <div class="w-20 h-1.5 rounded-full bg-gray-200 dark:bg-[#30363D] overflow-hidden">
                                    <div class="h-full bg-brand-green rounded-full" style="width: {{ min(100, ($stats['total_savings'] / 50000) * 100) }}%"></div>
                                </div>
                            </div>
                            <div class="flex items-center justify-between text-sm">
                                <span class="text-gray-600 dark:text-gray-400">Account Tenure</span>
                                <div class="w-20 h-1.5 rounded-full bg-gray-200 dark:bg-[#30363D] overflow-hidden">
                                    <div class="h-full bg-blue-500 rounded-full" style="width: {{ min(100, $stats['membership_months'] * 5) }}%"></div>
                                </div>
                            </div>
                            <div class="flex items-center justify-between text-sm">
                                <span class="text-gray-600 dark:text-gray-400">Transaction Activity</span>
                                <div class="w-20 h-1.5 rounded-full bg-gray-200 dark:bg-[#30363D] overflow-hidden">
                                    <div class="h-full bg-purple-500 rounded-full" style="width: {{ min(100, count($transactions) * 5) }}%"></div>
                                </div>
                            </div>
                        </div>
                        
                        {{-- Tip --}}
                        <div class="mt-4 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                            <p class="text-xs text-emerald-600 dark:text-emerald-400 flex items-start gap-2">
                                <span class="material-symbols-outlined text-sm mt-0.5">lightbulb</span>
                                <span>
                                    @if($stats['credit_score'] < 600)
                                        Keep saving consistently to improve your score and unlock better loan rates.
                                    @elseif($stats['credit_score'] < 750)
                                        Great progress! Continue your savings habit to reach Excellent status.
                                    @else
                                        Excellent score! You qualify for our best loan rates and highest limits.
                                    @endif
                                </span>
                            </p>
                        </div>
                    </div>

                    {{-- Quick Help --}}
                    <div class="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#30363D] rounded-2xl p-5 shadow-sm">
                        <h4 class="font-bold text-gray-900 dark:text-white mb-4">Quick Help</h4>
                        <div class="space-y-2">
                            <a href="{{ route('frontend.sacco.landing') }}" class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#21262D] transition-colors group">
                                <div class="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <span class="material-symbols-outlined text-sm text-blue-500">quiz</span>
                                </div>
                                <span class="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">FAQs & Help Center</span>
                            </a>
                            <a href="{{ route('frontend.sacco.landing') }}#how-it-works" class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#21262D] transition-colors group">
                                <div class="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center">
                                    <span class="material-symbols-outlined text-sm text-brand-green">school</span>
                                </div>
                                <span class="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">How SACCO Works</span>
                            </a>
                            <a href="{{ route('frontend.sacco.landing') }}#contact" class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#21262D] transition-colors group">
                                <div class="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                                    <span class="material-symbols-outlined text-sm text-orange-500">support_agent</span>
                                </div>
                                <span class="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Contact Support</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
</div>
@endsection
