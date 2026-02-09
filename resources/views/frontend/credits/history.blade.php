@extends('layouts.app')

@section('title', 'Credits History')

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
<!-- Main Credits History Content -->
<div class="max-w-[1600px] mx-auto space-y-8">
    <!-- Header Section -->
    <div class="glass-panel rounded-2xl p-8 relative overflow-hidden">
        <div class="absolute -right-20 -top-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        
        <div class="relative z-10">
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <a href="{{ route('credits.index') }}" class="inline-flex items-center gap-2 text-gray-500 dark:text-text-secondary hover:text-brand-green mb-4 transition-colors">
                        <span class="material-symbols-outlined text-sm">arrow_back</span>
                        Back to Credits
                    </a>
                    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-1">Credits History</h1>
                    <p class="text-gray-500 dark:text-text-secondary">View all your credit transactions</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Current Balance -->
        <div class="glass-card rounded-xl p-5 hover:border-purple-500/30 transition-all relative overflow-hidden">
            <div class="absolute top-0 right-0 p-3 opacity-10">
                <span class="material-symbols-outlined text-6xl text-purple-500">account_balance_wallet</span>
            </div>
            <div class="flex justify-between items-start mb-4 relative z-10">
                <div class="p-2 bg-purple-500/20 rounded-lg text-purple-500">
                    <span class="material-symbols-outlined">wallet</span>
                </div>
            </div>
            <p class="text-gray-500 dark:text-text-secondary text-sm font-medium">Current Balance</p>
            <h3 class="text-3xl font-bold text-gray-900 dark:text-white mt-1">{{ number_format(auth()->user()->credits_balance ?? 0) }}</h3>
        </div>

        <!-- Total Earned -->
        <div class="glass-card rounded-xl p-5 hover:border-green-500/30 transition-all relative overflow-hidden">
            <div class="absolute top-0 right-0 p-3 opacity-10">
                <span class="material-symbols-outlined text-6xl text-green-500">trending_up</span>
            </div>
            <div class="flex justify-between items-start mb-4 relative z-10">
                <div class="p-2 bg-green-500/20 rounded-lg text-green-500">
                    <span class="material-symbols-outlined">arrow_upward</span>
                </div>
            </div>
            <p class="text-gray-500 dark:text-text-secondary text-sm font-medium">Total Earned</p>
            <h3 class="text-3xl font-bold text-green-500 mt-1">{{ number_format($totalEarned ?? 0) }}</h3>
        </div>

        <!-- Total Spent -->
        <div class="glass-card rounded-xl p-5 hover:border-red-500/30 transition-all relative overflow-hidden">
            <div class="absolute top-0 right-0 p-3 opacity-10">
                <span class="material-symbols-outlined text-6xl text-red-500">trending_down</span>
            </div>
            <div class="flex justify-between items-start mb-4 relative z-10">
                <div class="p-2 bg-red-500/20 rounded-lg text-red-500">
                    <span class="material-symbols-outlined">arrow_downward</span>
                </div>
            </div>
            <p class="text-gray-500 dark:text-text-secondary text-sm font-medium">Total Spent</p>
            <h3 class="text-3xl font-bold text-red-500 mt-1">{{ number_format($totalSpent ?? 0) }}</h3>
        </div>

        <!-- This Month -->
        <div class="glass-card rounded-xl p-5 hover:border-blue-500/30 transition-all relative overflow-hidden">
            <div class="absolute top-0 right-0 p-3 opacity-10">
                <span class="material-symbols-outlined text-6xl text-blue-500">calendar_month</span>
            </div>
            <div class="flex justify-between items-start mb-4 relative z-10">
                <div class="p-2 bg-blue-500/20 rounded-lg text-blue-500">
                    <span class="material-symbols-outlined">date_range</span>
                </div>
            </div>
            <p class="text-gray-500 dark:text-text-secondary text-sm font-medium">This Month</p>
            <h3 class="text-3xl font-bold text-blue-500 mt-1">{{ number_format($thisMonth ?? 0) }}</h3>
        </div>
    </div>

    <!-- Filters -->
    <div class="glass-panel rounded-2xl p-4">
        <form method="GET" class="flex flex-wrap gap-4">
            <div class="flex-1 min-w-[200px]">
                <select name="type" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all">
                    <option value="">All Types</option>
                    <option value="earn" {{ request('type') === 'earn' ? 'selected' : '' }}>Earned</option>
                    <option value="spend" {{ request('type') === 'spend' ? 'selected' : '' }}>Spent</option>
                </select>
            </div>

            <div class="flex-1 min-w-[200px]">
                <select name="category" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all">
                    <option value="">All Categories</option>
                    <option value="daily_login" {{ request('category') === 'daily_login' ? 'selected' : '' }}>Daily Login</option>
                    <option value="listening" {{ request('category') === 'listening' ? 'selected' : '' }}>Listening</option>
                    <option value="social_interaction" {{ request('category') === 'social_interaction' ? 'selected' : '' }}>Social</option>
                    <option value="referral" {{ request('category') === 'referral' ? 'selected' : '' }}>Referrals</option>
                    <option value="bonus" {{ request('category') === 'bonus' ? 'selected' : '' }}>Bonuses</option>
                </select>
            </div>

            <div class="flex-1 min-w-[200px]">
                <input type="date" name="date" value="{{ request('date') }}"
                       class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all">
            </div>

            <button type="submit" class="px-6 py-3 bg-brand-green hover:bg-green-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-green-500/20">
                <span class="material-symbols-outlined align-middle mr-1">filter_list</span>
                Filter
            </button>

            @if(request()->hasAny(['type', 'category', 'date']))
            <a href="{{ route('credits.history') }}" class="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-colors">
                Clear
            </a>
            @endif
        </form>
    </div>

    <!-- Transactions List -->
    <div class="glass-panel rounded-2xl overflow-hidden">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span class="material-symbols-outlined text-brand-purple">receipt_long</span>
                Transactions
            </h3>
        </div>

        @if(isset($transactions) && $transactions->count() > 0)
        <div class="divide-y divide-gray-200 dark:divide-gray-700">
            @foreach($transactions as $transaction)
            <div class="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                <div class="flex items-center justify-between gap-4">
                    <div class="flex items-center gap-4">
                        <div class="p-3 {{ $transaction->type === 'earn' ? 'bg-green-500/20' : 'bg-red-500/20' }} rounded-xl">
                            <span class="material-symbols-outlined text-xl {{ $transaction->type === 'earn' ? 'text-green-500' : 'text-red-500' }}">
                                {{ $transaction->type === 'earn' ? 'add' : 'remove' }}
                            </span>
                        </div>
                        <div>
                            <p class="font-semibold text-gray-900 dark:text-white">{{ $transaction->description }}</p>
                            <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-text-secondary">
                                <span>{{ $transaction->created_at->format('M d, Y') }}</span>
                                <span>•</span>
                                <span>{{ $transaction->created_at->format('h:i A') }}</span>
                                @if($transaction->source)
                                <span>•</span>
                                <span class="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">{{ ucfirst(str_replace('_', ' ', $transaction->source)) }}</span>
                                @endif
                            </div>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-xl font-bold {{ $transaction->type === 'earn' ? 'text-green-500' : 'text-red-500' }}">
                            {{ $transaction->type === 'earn' ? '+' : '-' }}{{ number_format($transaction->amount) }}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-text-secondary">credits</p>
                    </div>
                </div>
            </div>
            @endforeach
        </div>

        <!-- Pagination -->
        @if($transactions->hasPages())
        <div class="p-6 border-t border-gray-200 dark:border-gray-700">
            {{ $transactions->withQueryString()->links() }}
        </div>
        @endif
        @else
        <div class="text-center py-16">
            <div class="p-4 bg-gray-100 dark:bg-gray-800/50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <span class="material-symbols-outlined text-4xl text-gray-400">receipt_long</span>
            </div>
            <p class="text-gray-500 dark:text-text-secondary text-lg mb-2">No transactions found</p>
            <p class="text-gray-400 dark:text-gray-500 text-sm mb-6">Start earning credits by completing activities!</p>
            <a href="{{ route('credits.earn') }}" class="inline-flex items-center gap-2 px-6 py-3 bg-brand-green hover:bg-green-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-green-500/20">
                <span class="material-symbols-outlined">add_circle</span>
                Start Earning
            </a>
        </div>
        @endif
    </div>
</div>
@endsection
