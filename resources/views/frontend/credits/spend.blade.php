@extends('layouts.app')

@section('title', 'Spend Credits')

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
<!-- Main Spend Credits Content -->
<div class="max-w-[1600px] mx-auto space-y-8">
    <!-- Header Section -->
    <div class="glass-panel rounded-2xl p-8 relative overflow-hidden group">
        <div class="absolute -right-20 -top-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700"></div>
        
        <div class="relative z-10">
            <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <a href="{{ route('credits.index') }}" class="inline-flex items-center gap-2 text-gray-500 dark:text-text-secondary hover:text-brand-green mb-4 transition-colors">
                        <span class="material-symbols-outlined text-sm">arrow_back</span>
                        Back to Credits
                    </a>
                    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-1">Spend Credits</h1>
                    <p class="text-gray-500 dark:text-text-secondary">Redeem your credits for rewards and benefits</p>
                </div>
                
                <!-- Balance Card -->
                <div class="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white min-w-[280px]">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm opacity-90 mb-1">Available to Spend</p>
                            <h3 class="text-4xl font-bold">{{ number_format(auth()->user()->credits_balance ?? 0) }}</h3>
                            <p class="text-sm opacity-75 mt-1">credits</p>
                        </div>
                        <div class="p-3 bg-white/20 rounded-xl">
                            <span class="material-symbols-outlined text-3xl">shopping_bag</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- SACCO Conversion (if enabled) -->
    @if(config('sacco.enabled') && auth()->user()->saccoMember)
    <div class="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-green-500/20 via-green-600/20 to-emerald-500/20 dark:from-green-500/30 dark:via-green-600/30 dark:to-emerald-500/30 border-2 border-green-500/30">
        <div class="absolute -right-8 -bottom-8 opacity-10">
            <span class="material-symbols-outlined text-[120px] text-green-500">account_balance</span>
        </div>
        <div class="relative z-10 flex flex-col lg:flex-row lg:items-start gap-6">
            <div class="p-4 bg-green-500/20 rounded-2xl">
                <span class="material-symbols-outlined text-4xl text-green-500">account_balance</span>
            </div>
            <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">Convert to Cash</h3>
                    <span class="px-3 py-1 bg-green-500/20 text-green-500 text-sm font-bold rounded-full">Recommended</span>
                </div>
                <p class="text-gray-600 dark:text-gray-300 mb-4">
                    Convert your credits to cash in your SACCO savings account. Current rate: <strong class="text-green-600 dark:text-green-400">{{ config('sacco.credit_exchange.rate') }} credits = UGX 1</strong>
                </p>
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div class="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4">
                        <p class="text-sm text-gray-500 dark:text-text-secondary mb-1">Your Credits</p>
                        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ number_format(auth()->user()->credits_balance ?? 0) }}</p>
                    </div>
                    <div class="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4">
                        <p class="text-sm text-gray-500 dark:text-text-secondary mb-1">Cash Value</p>
                        <p class="text-2xl font-bold text-green-600 dark:text-green-400">UGX {{ number_format((auth()->user()->credits_balance ?? 0) / config('sacco.credit_exchange.rate')) }}</p>
                    </div>
                </div>
                <a href="{{ route('sacco.credits.convert') }}" class="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-green-500/20">
                    <span class="material-symbols-outlined">swap_horiz</span>
                    Convert Now
                </a>
            </div>
        </div>
    </div>
    @endif

    <!-- Premium Subscriptions -->
    <div class="glass-panel rounded-2xl p-6">
        <div class="flex items-center gap-3 mb-6">
            <div class="p-2 bg-purple-500/20 rounded-lg">
                <span class="material-symbols-outlined text-purple-500">workspace_premium</span>
            </div>
            <div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">Premium Subscriptions</h3>
                <p class="text-gray-500 dark:text-text-secondary text-sm">Unlock premium features with your credits</p>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- 1 Month Premium -->
            <div class="glass-card rounded-xl overflow-hidden hover:border-purple-500/30 transition-all hover:-translate-y-1 duration-300">
                <div class="bg-gradient-to-br from-purple-500 to-purple-600 p-6">
                    <span class="material-symbols-outlined text-5xl text-white/75 mb-3 block">workspace_premium</span>
                    <h4 class="text-xl font-bold text-white">1 Month Premium</h4>
                </div>
                <div class="p-6">
                    <ul class="space-y-2 text-sm mb-6">
                        <li class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <span class="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                            Unlimited downloads
                        </li>
                        <li class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <span class="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                            HD audio quality
                        </li>
                        <li class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <span class="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                            No ads
                        </li>
                        <li class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <span class="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                            Offline mode
                        </li>
                    </ul>
                    <div class="flex items-center justify-between mb-4">
                        <span class="text-3xl font-bold text-gray-900 dark:text-white">15,000</span>
                        <span class="text-gray-500 dark:text-text-secondary">credits</span>
                    </div>
                    <button onclick="redeemReward('premium_1m', 15000)" class="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/20 {{ (auth()->user()->credits_balance ?? 0) < 15000 ? 'opacity-50 cursor-not-allowed' : '' }}" {{ (auth()->user()->credits_balance ?? 0) < 15000 ? 'disabled' : '' }}>
                        Redeem
                    </button>
                </div>
            </div>

            <!-- 3 Months Premium -->
            <div class="glass-card rounded-xl overflow-hidden hover:border-indigo-500/30 transition-all hover:-translate-y-1 duration-300 relative">
                <div class="absolute top-4 right-4 px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">SAVE 20%</div>
                <div class="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6">
                    <span class="material-symbols-outlined text-5xl text-white/75 mb-3 block">workspace_premium</span>
                    <h4 class="text-xl font-bold text-white">3 Months Premium</h4>
                </div>
                <div class="p-6">
                    <ul class="space-y-2 text-sm mb-6">
                        <li class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <span class="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                            All 1 month features
                        </li>
                        <li class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <span class="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                            20% discount
                        </li>
                        <li class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <span class="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                            Priority support
                        </li>
                        <li class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <span class="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                            Early access to features
                        </li>
                    </ul>
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <span class="text-3xl font-bold text-gray-900 dark:text-white">36,000</span>
                            <span class="text-sm text-gray-400 line-through ml-2">45,000</span>
                        </div>
                        <span class="text-gray-500 dark:text-text-secondary">credits</span>
                    </div>
                    <button onclick="redeemReward('premium_3m', 36000)" class="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20 {{ (auth()->user()->credits_balance ?? 0) < 36000 ? 'opacity-50 cursor-not-allowed' : '' }}" {{ (auth()->user()->credits_balance ?? 0) < 36000 ? 'disabled' : '' }}>
                        Redeem
                    </button>
                </div>
            </div>

            <!-- 1 Year Premium -->
            <div class="glass-card rounded-xl overflow-hidden hover:border-amber-500/30 transition-all hover:-translate-y-1 duration-300 relative">
                <div class="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs font-bold rounded-full">BEST VALUE</div>
                <div class="bg-gradient-to-br from-amber-500 to-orange-500 p-6">
                    <span class="material-symbols-outlined text-5xl text-white/75 mb-3 block">diamond</span>
                    <h4 class="text-xl font-bold text-white">1 Year Premium</h4>
                </div>
                <div class="p-6">
                    <ul class="space-y-2 text-sm mb-6">
                        <li class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <span class="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                            All premium features
                        </li>
                        <li class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <span class="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                            40% discount
                        </li>
                        <li class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <span class="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                            VIP support
                        </li>
                        <li class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <span class="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                            Exclusive badge
                        </li>
                    </ul>
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <span class="text-3xl font-bold text-gray-900 dark:text-white">108,000</span>
                            <span class="text-sm text-gray-400 line-through ml-2">180,000</span>
                        </div>
                        <span class="text-gray-500 dark:text-text-secondary">credits</span>
                    </div>
                    <button onclick="redeemReward('premium_1y', 108000)" class="w-full px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/20 {{ (auth()->user()->credits_balance ?? 0) < 108000 ? 'opacity-50 cursor-not-allowed' : '' }}" {{ (auth()->user()->credits_balance ?? 0) < 108000 ? 'disabled' : '' }}>
                        Redeem
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Other Rewards -->
    <div class="glass-panel rounded-2xl p-6">
        <div class="flex items-center gap-3 mb-6">
            <div class="p-2 bg-blue-500/20 rounded-lg">
                <span class="material-symbols-outlined text-blue-500">redeem</span>
            </div>
            <div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">Other Rewards</h3>
                <p class="text-gray-500 dark:text-text-secondary text-sm">Boost your profile and unlock exclusive content</p>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Profile Boost -->
            <div class="glass-card rounded-xl p-6 hover:border-blue-500/30 transition-all">
                <div class="flex items-start justify-between mb-4">
                    <div class="p-3 bg-blue-500/20 rounded-xl">
                        <span class="material-symbols-outlined text-2xl text-blue-500">trending_up</span>
                    </div>
                    <span class="px-3 py-1 bg-blue-500/10 text-blue-500 text-sm font-bold rounded-full">500 credits</span>
                </div>
                <h4 class="font-bold text-gray-900 dark:text-white mb-2">Profile Boost</h4>
                <p class="text-sm text-gray-500 dark:text-text-secondary mb-4">Boost your profile visibility for 24 hours. Get more followers and plays!</p>
                <button onclick="redeemReward('profile_boost', 500)" class="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all {{ (auth()->user()->credits_balance ?? 0) < 500 ? 'opacity-50 cursor-not-allowed' : '' }}" {{ (auth()->user()->credits_balance ?? 0) < 500 ? 'disabled' : '' }}>
                    Redeem
                </button>
            </div>

            <!-- Exclusive Content -->
            <div class="glass-card rounded-xl p-6 hover:border-yellow-500/30 transition-all">
                <div class="flex items-start justify-between mb-4">
                    <div class="p-3 bg-yellow-500/20 rounded-xl">
                        <span class="material-symbols-outlined text-2xl text-yellow-500">star</span>
                    </div>
                    <span class="px-3 py-1 bg-yellow-500/10 text-yellow-500 text-sm font-bold rounded-full">1,000 credits</span>
                </div>
                <h4 class="font-bold text-gray-900 dark:text-white mb-2">Exclusive Content</h4>
                <p class="text-sm text-gray-500 dark:text-text-secondary mb-4">Unlock exclusive artist content, behind-the-scenes, and unreleased tracks.</p>
                <button onclick="redeemReward('exclusive_content', 1000)" class="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-xl transition-all {{ (auth()->user()->credits_balance ?? 0) < 1000 ? 'opacity-50 cursor-not-allowed' : '' }}" {{ (auth()->user()->credits_balance ?? 0) < 1000 ? 'disabled' : '' }}>
                    Redeem
                </button>
            </div>

            <!-- Custom Badge -->
            <div class="glass-card rounded-xl p-6 hover:border-pink-500/30 transition-all">
                <div class="flex items-start justify-between mb-4">
                    <div class="p-3 bg-pink-500/20 rounded-xl">
                        <span class="material-symbols-outlined text-2xl text-pink-500">military_tech</span>
                    </div>
                    <span class="px-3 py-1 bg-pink-500/10 text-pink-500 text-sm font-bold rounded-full">2,500 credits</span>
                </div>
                <h4 class="font-bold text-gray-900 dark:text-white mb-2">Custom Badge</h4>
                <p class="text-sm text-gray-500 dark:text-text-secondary mb-4">Get a unique badge on your profile to stand out from the crowd.</p>
                <button onclick="redeemReward('custom_badge', 2500)" class="w-full px-4 py-3 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-xl transition-all {{ (auth()->user()->credits_balance ?? 0) < 2500 ? 'opacity-50 cursor-not-allowed' : '' }}" {{ (auth()->user()->credits_balance ?? 0) < 2500 ? 'disabled' : '' }}>
                    Redeem
                </button>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
function redeemReward(rewardId, cost) {
    if (confirm(`Are you sure you want to redeem this reward for ${cost.toLocaleString()} credits?`)) {
        // This would typically call an API endpoint
        alert('Redeem feature coming soon!');
    }
}
</script>
@endpush
@endsection
