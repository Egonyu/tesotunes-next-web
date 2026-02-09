@extends('layouts.app')

@section('title', 'Earn Credits')

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
<!-- Main Earn Credits Content -->
<div class="max-w-[1600px] mx-auto space-y-8">
    <!-- Header Section -->
    <div class="glass-panel rounded-2xl p-8 relative overflow-hidden group">
        <div class="absolute -right-20 -top-20 w-96 h-96 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-all duration-700"></div>
        
        <div class="relative z-10">
            <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <a href="{{ route('credits.index') }}" class="inline-flex items-center gap-2 text-gray-500 dark:text-text-secondary hover:text-brand-green mb-4 transition-colors">
                        <span class="material-symbols-outlined text-sm">arrow_back</span>
                        Back to Credits
                    </a>
                    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-1">Earn Credits</h1>
                    <p class="text-gray-500 dark:text-text-secondary">Complete activities to earn platform credits</p>
                </div>
                
                <!-- Balance Card -->
                <div class="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white min-w-[280px]">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm opacity-90 mb-1">Your Balance</p>
                            <h3 class="text-4xl font-bold">{{ number_format(auth()->user()->credits_balance ?? 0) }}</h3>
                            <p class="text-sm opacity-75 mt-1">credits</p>
                        </div>
                        <div class="p-3 bg-white/20 rounded-xl">
                            <span class="material-symbols-outlined text-3xl">paid</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Daily Activities -->
    <div class="glass-panel rounded-2xl p-6">
        <div class="flex items-center gap-3 mb-6">
            <div class="p-2 bg-green-500/20 rounded-lg">
                <span class="material-symbols-outlined text-green-500">today</span>
            </div>
            <div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">Daily Activities</h3>
                <p class="text-gray-500 dark:text-text-secondary text-sm">Complete these every day for bonus credits</p>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Daily Login -->
            <div class="glass-card rounded-xl p-6 hover:border-green-500/30 transition-all">
                <div class="flex items-start justify-between mb-4">
                    <div class="p-3 bg-green-500/20 rounded-xl">
                        <span class="material-symbols-outlined text-2xl text-green-500">login</span>
                    </div>
                    <span class="px-3 py-1 bg-green-500/10 text-green-500 text-sm font-bold rounded-full">+10</span>
                </div>
                <h4 class="font-bold text-gray-900 dark:text-white mb-2">Daily Login</h4>
                <p class="text-sm text-gray-500 dark:text-text-secondary mb-4">Log in every day to earn bonus credits. Build a streak for extra rewards!</p>
                @if(session('daily_login_claimed'))
                    <button disabled class="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-semibold rounded-xl cursor-not-allowed flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined text-green-500">check_circle</span>
                        Claimed Today
                    </button>
                @else
                    <button onclick="claimDailyBonus()" class="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/30 flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined">redeem</span>
                        Claim Bonus
                    </button>
                @endif
            </div>

            <!-- Listen to Music -->
            <div class="glass-card rounded-xl p-6 hover:border-blue-500/30 transition-all">
                <div class="flex items-start justify-between mb-4">
                    <div class="p-3 bg-blue-500/20 rounded-xl">
                        <span class="material-symbols-outlined text-2xl text-blue-500">play_circle</span>
                    </div>
                    <span class="px-3 py-1 bg-blue-500/10 text-blue-500 text-sm font-bold rounded-full">+1 per song</span>
                </div>
                <h4 class="font-bold text-gray-900 dark:text-white mb-2">Listen to Music</h4>
                <p class="text-sm text-gray-500 dark:text-text-secondary mb-4">Earn 1 credit for each song you listen to for at least 2 minutes.</p>
                <a href="{{ route('frontend.timeline') }}" class="block w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-center transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30">
                    <span class="material-symbols-outlined align-middle mr-2">headphones</span>
                    Start Listening
                </a>
            </div>
        </div>
    </div>

    <!-- Engagement Activities -->
    <div class="glass-panel rounded-2xl p-6">
        <div class="flex items-center gap-3 mb-6">
            <div class="p-2 bg-purple-500/20 rounded-lg">
                <span class="material-symbols-outlined text-purple-500">favorite</span>
            </div>
            <div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">Engagement Activities</h3>
                <p class="text-gray-500 dark:text-text-secondary text-sm">Earn credits by engaging with content</p>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Share Songs -->
            <div class="glass-card rounded-xl p-5 text-center hover:border-purple-500/30 transition-all hover:-translate-y-1 duration-300">
                <div class="p-3 bg-purple-500/20 rounded-xl w-fit mx-auto mb-3">
                    <span class="material-symbols-outlined text-xl text-purple-500">share</span>
                </div>
                <h4 class="font-bold text-gray-900 dark:text-white mb-1">Share Songs</h4>
                <p class="text-xs text-gray-500 dark:text-text-secondary mb-3">Share music on social media</p>
                <span class="inline-block px-4 py-1 bg-purple-500/10 text-purple-500 text-sm font-bold rounded-full">+5 credits</span>
            </div>

            <!-- Like Songs -->
            <div class="glass-card rounded-xl p-5 text-center hover:border-pink-500/30 transition-all hover:-translate-y-1 duration-300">
                <div class="p-3 bg-pink-500/20 rounded-xl w-fit mx-auto mb-3">
                    <span class="material-symbols-outlined text-xl text-pink-500">favorite</span>
                </div>
                <h4 class="font-bold text-gray-900 dark:text-white mb-1">Like Songs</h4>
                <p class="text-xs text-gray-500 dark:text-text-secondary mb-3">Like your favorite songs</p>
                <span class="inline-block px-4 py-1 bg-pink-500/10 text-pink-500 text-sm font-bold rounded-full">+2 credits</span>
            </div>

            <!-- Follow Artists -->
            <div class="glass-card rounded-xl p-5 text-center hover:border-indigo-500/30 transition-all hover:-translate-y-1 duration-300">
                <div class="p-3 bg-indigo-500/20 rounded-xl w-fit mx-auto mb-3">
                    <span class="material-symbols-outlined text-xl text-indigo-500">person_add</span>
                </div>
                <h4 class="font-bold text-gray-900 dark:text-white mb-1">Follow Artists</h4>
                <p class="text-xs text-gray-500 dark:text-text-secondary mb-3">Follow artists you love</p>
                <span class="inline-block px-4 py-1 bg-indigo-500/10 text-indigo-500 text-sm font-bold rounded-full">+3 credits</span>
            </div>

            <!-- Create Playlists -->
            <div class="glass-card rounded-xl p-5 text-center hover:border-teal-500/30 transition-all hover:-translate-y-1 duration-300">
                <div class="p-3 bg-teal-500/20 rounded-xl w-fit mx-auto mb-3">
                    <span class="material-symbols-outlined text-xl text-teal-500">playlist_add</span>
                </div>
                <h4 class="font-bold text-gray-900 dark:text-white mb-1">Create Playlists</h4>
                <p class="text-xs text-gray-500 dark:text-text-secondary mb-3">Create and share playlists</p>
                <span class="inline-block px-4 py-1 bg-teal-500/10 text-teal-500 text-sm font-bold rounded-full">+10 credits</span>
            </div>
        </div>
    </div>

    <!-- Referral Program -->
    <div class="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-orange-500/20 via-orange-600/20 to-red-500/20 dark:from-orange-500/30 dark:via-orange-600/30 dark:to-red-500/30 border border-orange-500/20">
        <div class="absolute -right-8 -bottom-8 opacity-10">
            <span class="material-symbols-outlined text-[120px] text-orange-500">group_add</span>
        </div>
        <div class="relative z-10 flex flex-col lg:flex-row lg:items-center gap-6">
            <div class="p-4 bg-orange-500/20 rounded-2xl">
                <span class="material-symbols-outlined text-4xl text-orange-500">group_add</span>
            </div>
            <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">Invite Friends</h3>
                    <span class="px-3 py-1 bg-orange-500/20 text-orange-500 text-sm font-bold rounded-full">+50 credits</span>
                </div>
                <p class="text-gray-600 dark:text-gray-300 mb-4">
                    Invite friends to join TesoTunes and earn <strong class="text-orange-500">50 credits</strong> for each friend who signs up. Your friends also get <strong class="text-orange-500">25 bonus credits</strong>!
                </p>
                <div class="flex flex-col sm:flex-row gap-4">
                    <div class="flex-1 bg-white/50 dark:bg-gray-800/50 rounded-xl p-3">
                        <p class="text-xs text-gray-500 dark:text-text-secondary mb-1">Your Referral Link</p>
                        <div class="flex items-center gap-2">
                            <input type="text" readonly value="{{ url('/register?ref=' . auth()->user()->referral_code ?? auth()->id()) }}" 
                                   class="flex-1 bg-transparent text-gray-900 dark:text-white text-sm font-medium truncate">
                            <button onclick="copyReferralLink()" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                <span class="material-symbols-outlined text-gray-500 text-sm">content_copy</span>
                            </button>
                        </div>
                    </div>
                    <button onclick="shareReferral()" class="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined">share</span>
                        Share
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- How It Works -->
    <div class="glass-panel rounded-2xl p-6">
        <div class="flex items-center gap-3 mb-6">
            <div class="p-2 bg-blue-500/20 rounded-lg">
                <span class="material-symbols-outlined text-blue-500">help</span>
            </div>
            <div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">How It Works</h3>
                <p class="text-gray-500 dark:text-text-secondary text-sm">Understanding the credit system</p>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center">
                <div class="p-4 bg-green-500/20 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <span class="material-symbols-outlined text-3xl text-green-500">emoji_events</span>
                </div>
                <h4 class="font-bold text-gray-900 dark:text-white mb-2">Earn</h4>
                <p class="text-sm text-gray-500 dark:text-text-secondary">Complete activities like listening, sharing, and inviting friends to earn credits.</p>
            </div>

            <div class="text-center">
                <div class="p-4 bg-blue-500/20 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <span class="material-symbols-outlined text-3xl text-blue-500">savings</span>
                </div>
                <h4 class="font-bold text-gray-900 dark:text-white mb-2">Accumulate</h4>
                <p class="text-sm text-gray-500 dark:text-text-secondary">Build up your credits balance. There's no expiry, so save up for bigger rewards!</p>
            </div>

            <div class="text-center">
                <div class="p-4 bg-purple-500/20 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <span class="material-symbols-outlined text-3xl text-purple-500">redeem</span>
                </div>
                <h4 class="font-bold text-gray-900 dark:text-white mb-2">Redeem</h4>
                <p class="text-sm text-gray-500 dark:text-text-secondary">Use credits for premium subscriptions, exclusive content, and more!</p>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
function claimDailyBonus() {
    fetch('{{ route('credits.claim-daily') }}', {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': '{{ csrf_token() }}',
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(`🎉 You earned ${data.credits_earned} credits! New balance: ${data.new_balance}`);
            location.reload();
        } else {
            alert(data.message || 'Could not claim bonus');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
}

function copyReferralLink() {
    const input = document.querySelector('input[readonly]');
    navigator.clipboard.writeText(input.value);
    alert('Referral link copied to clipboard!');
}

function shareReferral() {
    const url = document.querySelector('input[readonly]').value;
    if (navigator.share) {
        navigator.share({
            title: 'Join TesoTunes!',
            text: 'Join me on TesoTunes and get 25 bonus credits!',
            url: url
        });
    } else {
        copyReferralLink();
    }
}
</script>
@endpush
@endsection
