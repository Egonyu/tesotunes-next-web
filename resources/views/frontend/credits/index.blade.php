@extends('layouts.app')

@section('title', 'My Credits')

@section('left-sidebar')
    @include('frontend.partials.user-left-sidebar')
@endsection

@push('styles')
<style>
    /* Light mode glass styles */
    .glass-panel {
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 0, 0, 0.08);
    }
    .glass-card {
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 0, 0, 0.06);
    }
    /* Dark mode glass styles */
    .dark .glass-panel {
        background: rgba(22, 27, 34, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .dark .glass-card {
        background: rgba(30, 35, 45, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.05);
    }
</style>
@endpush

@section('content')
<!-- Main Credits Content -->
<div class="max-w-[1600px] mx-auto space-y-8">
    <!-- Header Section with Balance -->
    <div class="glass-panel rounded-2xl p-8 relative overflow-hidden group">
        <div class="absolute -right-20 -top-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-700"></div>
        <div class="absolute -left-10 -bottom-10 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl"></div>
        
        <div class="relative z-10">
            <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-1">My Credits</h1>
                    <p class="text-gray-500 dark:text-text-secondary">Manage your platform credits and rewards</p>
                </div>
                
                <!-- Balance Card -->
                <div class="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 text-white min-w-[280px]">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm opacity-90 mb-1">Available Balance</p>
                            <h3 class="text-4xl font-bold">{{ number_format(auth()->user()->credits_balance ?? 0) }}</h3>
                            <p class="text-sm opacity-75 mt-1">credits</p>
                        </div>
                        <div class="p-3 bg-white/20 rounded-xl">
                            <span class="material-symbols-outlined text-3xl">account_balance_wallet</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a href="{{ route('credits.earn') }}" class="glass-card rounded-2xl p-6 hover:border-green-500/30 transition-all hover:-translate-y-1 duration-300 group">
            <div class="flex items-center gap-4">
                <div class="p-3 bg-green-500/20 rounded-xl group-hover:bg-green-500/30 transition-colors">
                    <span class="material-symbols-outlined text-2xl text-green-500">add_circle</span>
                </div>
                <div>
                    <h4 class="font-bold text-gray-900 dark:text-white">Earn Credits</h4>
                    <p class="text-sm text-gray-500 dark:text-text-secondary">Ways to earn</p>
                </div>
                <span class="material-symbols-outlined text-gray-400 ml-auto group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </div>
        </a>

        <a href="{{ route('credits.spend') }}" class="glass-card rounded-2xl p-6 hover:border-blue-500/30 transition-all hover:-translate-y-1 duration-300 group">
            <div class="flex items-center gap-4">
                <div class="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
                    <span class="material-symbols-outlined text-2xl text-blue-500">shopping_cart</span>
                </div>
                <div>
                    <h4 class="font-bold text-gray-900 dark:text-white">Spend Credits</h4>
                    <p class="text-sm text-gray-500 dark:text-text-secondary">Redeem rewards</p>
                </div>
                <span class="material-symbols-outlined text-gray-400 ml-auto group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </div>
        </a>

        <a href="{{ route('credits.history') }}" class="glass-card rounded-2xl p-6 hover:border-purple-500/30 transition-all hover:-translate-y-1 duration-300 group">
            <div class="flex items-center gap-4">
                <div class="p-3 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors">
                    <span class="material-symbols-outlined text-2xl text-purple-500">history</span>
                </div>
                <div>
                    <h4 class="font-bold text-gray-900 dark:text-white">History</h4>
                    <p class="text-sm text-gray-500 dark:text-text-secondary">View transactions</p>
                </div>
                <span class="material-symbols-outlined text-gray-400 ml-auto group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </div>
        </a>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Total Earned -->
        <div class="glass-card rounded-xl p-5 hover:border-green-500/30 transition-all hover:-translate-y-1 duration-300 relative overflow-hidden">
            <div class="absolute top-0 right-0 p-3 opacity-10">
                <span class="material-symbols-outlined text-6xl text-green-500">trending_up</span>
            </div>
            <div class="flex justify-between items-start mb-4 relative z-10">
                <div class="p-2 bg-green-500/20 rounded-lg text-green-500">
                    <span class="material-symbols-outlined">arrow_upward</span>
                </div>
            </div>
            <p class="text-gray-500 dark:text-text-secondary text-sm font-medium">Total Earned</p>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ number_format($totalEarned ?? 0) }}</h3>
        </div>

        <!-- Total Spent -->
        <div class="glass-card rounded-xl p-5 hover:border-red-500/30 transition-all hover:-translate-y-1 duration-300 relative overflow-hidden">
            <div class="absolute top-0 right-0 p-3 opacity-10">
                <span class="material-symbols-outlined text-6xl text-red-500">trending_down</span>
            </div>
            <div class="flex justify-between items-start mb-4 relative z-10">
                <div class="p-2 bg-red-500/20 rounded-lg text-red-500">
                    <span class="material-symbols-outlined">arrow_downward</span>
                </div>
            </div>
            <p class="text-gray-500 dark:text-text-secondary text-sm font-medium">Total Spent</p>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ number_format($totalSpent ?? 0) }}</h3>
        </div>

        <!-- This Month -->
        <div class="glass-card rounded-xl p-5 hover:border-blue-500/30 transition-all hover:-translate-y-1 duration-300 relative overflow-hidden">
            <div class="absolute top-0 right-0 p-3 opacity-10">
                <span class="material-symbols-outlined text-6xl text-blue-500">calendar_month</span>
            </div>
            <div class="flex justify-between items-start mb-4 relative z-10">
                <div class="p-2 bg-blue-500/20 rounded-lg text-blue-500">
                    <span class="material-symbols-outlined">date_range</span>
                </div>
            </div>
            <p class="text-gray-500 dark:text-text-secondary text-sm font-medium">This Month</p>
            <h3 class="text-2xl font-bold text-green-500 mt-1">+{{ number_format($thisMonth ?? 0) }}</h3>
        </div>

        <!-- Available -->
        <div class="glass-card rounded-xl p-5 hover:border-purple-500/30 transition-all hover:-translate-y-1 duration-300 relative overflow-hidden">
            <div class="absolute top-0 right-0 p-3 opacity-10">
                <span class="material-symbols-outlined text-6xl text-purple-500">wallet</span>
            </div>
            <div class="flex justify-between items-start mb-4 relative z-10">
                <div class="p-2 bg-purple-500/20 rounded-lg text-purple-500">
                    <span class="material-symbols-outlined">account_balance</span>
                </div>
            </div>
            <p class="text-gray-500 dark:text-text-secondary text-sm font-medium">Available</p>
            <h3 class="text-2xl font-bold text-purple-500 mt-1">{{ number_format(auth()->user()->credits_balance ?? 0) }}</h3>
        </div>
    </div>

    <!-- Recent Transactions -->
    <div class="glass-panel rounded-2xl p-6">
        <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span class="material-symbols-outlined text-brand-purple">receipt_long</span>
                Recent Activity
            </h3>
            <a href="{{ route('credits.history') }}" class="text-brand-green hover:text-green-600 text-sm font-bold flex items-center gap-1">
                View All <span class="material-symbols-outlined text-xs">arrow_forward</span>
            </a>
        </div>

        @if(isset($recentTransactions) && $recentTransactions->count() > 0)
        <div class="space-y-3">
            @foreach($recentTransactions as $transaction)
            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                <div class="flex items-center gap-4">
                    <div class="p-2 {{ $transaction->type === 'earn' ? 'bg-green-500/20' : 'bg-red-500/20' }} rounded-lg">
                        <span class="material-symbols-outlined {{ $transaction->type === 'earn' ? 'text-green-500' : 'text-red-500' }}">
                            {{ $transaction->type === 'earn' ? 'add' : 'remove' }}
                        </span>
                    </div>
                    <div>
                        <p class="font-medium text-gray-900 dark:text-white">{{ $transaction->description }}</p>
                        <p class="text-sm text-gray-500 dark:text-text-secondary">{{ $transaction->created_at->diffForHumans() }}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-lg font-bold {{ $transaction->type === 'earn' ? 'text-green-500' : 'text-red-500' }}">
                        {{ $transaction->type === 'earn' ? '+' : '-' }}{{ number_format($transaction->amount) }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-text-secondary">credits</p>
                </div>
            </div>
            @endforeach
        </div>
        @else
        <div class="text-center py-12">
            <div class="p-4 bg-gray-100 dark:bg-gray-800/50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <span class="material-symbols-outlined text-4xl text-gray-400">receipt_long</span>
            </div>
            <p class="text-gray-500 dark:text-text-secondary mb-4">No transactions yet</p>
            <a href="{{ route('credits.earn') }}" class="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-green hover:bg-green-600 text-white font-semibold rounded-lg transition-all">
                <span class="material-symbols-outlined text-lg">add_circle</span>
                Start Earning Credits
            </a>
        </div>
        @endif
    </div>

    <!-- SACCO Integration -->
    @if(config('sacco.enabled') && auth()->user()->saccoMember)
    <div class="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-blue-500/20 via-blue-600/20 to-blue-700/20 dark:from-blue-500/30 dark:via-blue-600/30 dark:to-blue-700/30 border border-blue-500/20">
        <div class="absolute -right-8 -bottom-8 opacity-10">
            <span class="material-symbols-outlined text-[120px] text-blue-500">account_balance</span>
        </div>
        <div class="relative z-10 flex flex-col lg:flex-row lg:items-center gap-6">
            <div class="p-4 bg-blue-500/20 rounded-2xl">
                <span class="material-symbols-outlined text-4xl text-blue-500">account_balance</span>
            </div>
            <div class="flex-1">
                <h4 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Convert to SACCO Savings</h4>
                <p class="text-gray-600 dark:text-gray-300 mb-4">
                    Convert your credits to cash in your SACCO account. Exchange rate: <strong class="text-gray-900 dark:text-white">{{ config('sacco.credit_exchange.rate') }} credits = UGX 1</strong>
                </p>
                <a href="{{ route('sacco.credits.convert') }}" class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20">
                    <span class="material-symbols-outlined">swap_horiz</span>
                    Convert Credits
                </a>
            </div>
        </div>
    </div>
    @endif
</div>
@endsection
