@extends('layouts.app')

@section('title', 'Artist Hub Dashboard')

@section('left-sidebar')
    @include('frontend.partials.artist-left-sidebar')
@endsection

@push('styles')
<style>
    /* Light mode styles */
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
    /* Dark mode styles */
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
<!-- Main Dashboard Content -->
<div class="max-w-[1600px] mx-auto space-y-8">
<div class="glass-panel rounded-2xl p-8 relative overflow-hidden group">
<div class="absolute -right-20 -top-20 w-96 h-96 bg-brand-green/10 rounded-full blur-3xl group-hover:bg-brand-green/20 transition-all duration-700"></div>
<div class="relative z-10">
<div class="flex flex-col md:flex-row md:items-end justify-between mb-6">
<div>
<h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-1">Artist Hub Overview</h2>
<p class="text-gray-500 dark:text-text-secondary">Monetization, events, and music performance at a glance.</p>
</div>
<div class="mt-4 md:mt-0 flex gap-2">
@if($storeStats['has_store'])
<span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/10 text-brand-green text-xs font-bold border border-brand-green/20">
<span class="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span>
                                STORE LIVE
                            </span>
@endif

@if(isset($musicStats['upcoming_events']) && $musicStats['upcoming_events'] > 0)
<span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/10 text-brand-purple text-xs font-bold border border-brand-purple/20">
<span class="material-symbols-outlined text-[14px]">confirmation_number</span>
                                {{ $musicStats['upcoming_events'] }} EVENTS ACTIVE
                            </span>
@endif

<span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-bold border border-brand-blue/20">
<span class="material-symbols-outlined text-[14px]">library_music</span>
                                {{ $musicStats['published_tracks'] }} TRACKS
                            </span>
</div>
</div>

<!-- Quick Action Buttons -->
<div class="flex flex-wrap gap-3 mb-6">
    <a href="{{ route('frontend.artist.upload.index') }}" class="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-green hover:bg-green-600 text-white font-semibold rounded-lg transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/30">
        <span class="material-symbols-outlined text-lg">cloud_upload</span>
        Upload Music
    </a>
    <a href="{{ route('frontend.artist.music.upload') }}" class="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all">
        <span class="material-symbols-outlined text-lg">album</span>
        Create Album
    </a>
    <a href="{{ route('artist.loyalty.index') }}" class="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all">
        <span class="material-symbols-outlined text-lg">loyalty</span>
        Fan Cards
    </a>
    <a href="{{ route('frontend.artist.business.dashboard') }}" class="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg transition-all border border-gray-200 dark:border-gray-600">
        <span class="material-symbols-outlined text-lg">payments</span>
        Business Hub
    </a>
    <a href="{{ route('frontend.artist.analytics') }}" class="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg transition-all border border-gray-200 dark:border-gray-600">
        <span class="material-symbols-outlined text-lg">trending_up</span>
        View Analytics
    </a>
</div>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
<!-- Music Royalties Card -->
<div class="bg-white/80 dark:bg-card-dark/50 rounded-xl p-5 border border-gray-200 dark:border-white/5 hover:border-brand-green/30 transition-all hover:-translate-y-1 duration-300 relative overflow-hidden">
<div class="absolute top-0 right-0 p-3 opacity-10">
<span class="material-symbols-outlined text-6xl text-brand-green">payments</span>
</div>
<div class="flex justify-between items-start mb-4 relative z-10">
<div class="p-2 bg-brand-green/20 rounded-lg text-brand-green">
<span class="material-symbols-outlined">music_note</span>
</div>
<span class="text-xs font-medium text-brand-green bg-brand-green/10 px-2 py-0.5 rounded flex items-center">
                                    {{ $revenueData['music_growth'] > 0 ? '+' : '' }}{{ number_format($revenueData['music_growth'], 1) }}% 
                                    <span class="material-symbols-outlined text-[12px] ml-1">
                                        {{ $revenueData['music_growth'] >= 0 ? 'trending_up' : 'trending_down' }}
                                    </span>
</span>
</div>
<p class="text-gray-500 dark:text-text-secondary text-sm font-medium">Music Royalties</p>
<h3 class="text-2xl font-bold text-gray-900 dark:text-white mt-1">UGX {{ number_format($revenueData['music_royalties'], 0) }}</h3>
<p class="text-[10px] text-gray-400 dark:text-text-secondary mt-2">Driven by {{ number_format($musicStats['total_streams']) }} streams</p>
</div>

<!-- Merch Sales Card -->
<div class="bg-white/80 dark:bg-card-dark/50 rounded-xl p-5 border border-gray-200 dark:border-white/5 hover:border-brand-blue/30 transition-all hover:-translate-y-1 duration-300 relative overflow-hidden">
<div class="absolute top-0 right-0 p-3 opacity-10">
<span class="material-symbols-outlined text-6xl text-brand-blue">shopping_cart</span>
</div>
<div class="flex justify-between items-start mb-4 relative z-10">
<div class="p-2 bg-brand-blue/20 rounded-lg text-brand-blue">
<span class="material-symbols-outlined">storefront</span>
</div>
<span class="text-xs font-medium text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded flex items-center">
                                    {{ $revenueData['merch_growth'] > 0 ? '+' : '' }}{{ number_format($revenueData['merch_growth'], 1) }}% 
                                    <span class="material-symbols-outlined text-[12px] ml-1">
                                        {{ $revenueData['merch_growth'] >= 0 ? 'trending_up' : 'trending_down' }}
                                    </span>
</span>
</div>
<p class="text-gray-500 dark:text-text-secondary text-sm font-medium">Merch Sales</p>
<h3 class="text-2xl font-bold text-gray-900 dark:text-white mt-1">UGX {{ number_format($revenueData['merch_sales'], 0) }}</h3>
<p class="text-[10px] text-gray-400 dark:text-text-secondary mt-2">
                    @if($storeStats['has_store'])
                        {{ $storeStats['total_orders'] }} orders
                    @else
                        No store yet
                    @endif
                </p>
</div>

<!-- Ticket Sales Card -->
<div class="bg-white/80 dark:bg-card-dark/50 rounded-xl p-5 border border-gray-200 dark:border-white/5 hover:border-brand-purple/30 transition-all hover:-translate-y-1 duration-300 relative overflow-hidden">
<div class="absolute top-0 right-0 p-3 opacity-10">
<span class="material-symbols-outlined text-6xl text-brand-purple">local_activity</span>
</div>
<div class="flex justify-between items-start mb-4 relative z-10">
<div class="p-2 bg-brand-purple/20 rounded-lg text-brand-purple">
<span class="material-symbols-outlined">confirmation_number</span>
</div>
<span class="text-xs font-medium text-brand-purple bg-brand-purple/10 px-2 py-0.5 rounded flex items-center">
                                    @if($revenueData['ticket_growth'] == 0)
                                        New
                                    @else
                                        {{ $revenueData['ticket_growth'] > 0 ? '+' : '' }}{{ number_format($revenueData['ticket_growth'], 1) }}%
                                    @endif
</span>
</div>
<p class="text-gray-500 dark:text-text-secondary text-sm font-medium">Ticket Sales</p>
<h3 class="text-2xl font-bold text-gray-900 dark:text-white mt-1">UGX {{ number_format($revenueData['ticket_sales'], 0) }}</h3>
<p class="text-[10px] text-gray-400 dark:text-text-secondary mt-2">
                    @if($musicStats['upcoming_events'] > 0)
                        {{ $musicStats['upcoming_events'] }} upcoming events
                    @else
                        No upcoming events
                    @endif
                </p>
</div>

<!-- Wallet Balance Card (Primary Earnings Focus) -->
<div class="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-500/20 dark:via-emerald-500/10 dark:to-card-dark/50 rounded-xl p-5 border border-emerald-200 dark:border-emerald-500/20 hover:border-emerald-400/50 transition-all hover:-translate-y-1 duration-300 relative overflow-hidden">
<div class="absolute top-0 right-0 p-3 opacity-10">
<span class="material-symbols-outlined text-6xl text-emerald-500">account_balance_wallet</span>
</div>
<div class="flex justify-between items-start mb-4 relative z-10">
<div class="p-2 bg-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400">
<span class="material-symbols-outlined">wallet</span>
</div>
<a href="{{ route('frontend.wallet.index') }}" class="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded hover:bg-emerald-500/20 transition-colors flex items-center gap-1">
    VIEW <span class="material-symbols-outlined text-[12px]">arrow_forward</span>
</a>
</div>
<p class="text-gray-500 dark:text-text-secondary text-sm font-medium">Wallet Balance</p>
<h3 class="text-2xl font-bold text-gray-900 dark:text-white mt-1">UGX {{ number_format($walletData['wallet_balance'] ?? 0, 0) }}</h3>
<div class="flex items-center gap-2 mt-2">
    <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
        +UGX {{ number_format($walletData['revenue_this_month'] ?? 0, 0) }} this month
    </span>
    @if(($walletData['monthly_growth'] ?? 0) != 0)
    <span class="text-[10px] {{ ($walletData['monthly_growth'] ?? 0) > 0 ? 'text-emerald-500' : 'text-red-500' }}">
        ({{ ($walletData['monthly_growth'] ?? 0) > 0 ? '+' : '' }}{{ $walletData['monthly_growth'] ?? 0 }}%)
    </span>
    @endif
</div>
</div>
</div>
</div>
</div>

<!-- Wallet & Earnings Summary Section -->
@if(isset($walletData))
<div class="glass-panel rounded-2xl p-6 relative overflow-hidden">
    <div class="absolute -left-20 -bottom-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
    <div class="relative z-10">
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span class="material-symbols-outlined text-emerald-500">account_balance</span>
                Earnings Overview
            </h3>
            <div class="flex gap-2">
                <a href="{{ route('frontend.wallet.index') }}" class="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium">View Wallet →</a>
            </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <!-- Streaming Revenue -->
            <div class="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                <div class="flex items-center gap-2 mb-2">
                    <span class="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <span class="material-symbols-outlined text-lg">play_circle</span>
                    </span>
                    <span class="text-gray-500 dark:text-gray-400 text-sm">Streaming Revenue</span>
                </div>
                <p class="text-xl font-bold text-gray-900 dark:text-white">UGX {{ number_format($walletData['streaming_revenue_total'] ?? 0, 0) }}</p>
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">{{ number_format($walletData['total_plays'] ?? 0) }} total plays</p>
            </div>
            
            <!-- This Month -->
            <div class="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                <div class="flex items-center gap-2 mb-2">
                    <span class="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <span class="material-symbols-outlined text-lg">calendar_month</span>
                    </span>
                    <span class="text-gray-500 dark:text-gray-400 text-sm">This Month</span>
                </div>
                <p class="text-xl font-bold text-gray-900 dark:text-white">UGX {{ number_format($walletData['revenue_this_month'] ?? 0, 0) }}</p>
                <p class="text-xs {{ ($walletData['monthly_growth'] ?? 0) >= 0 ? 'text-emerald-500' : 'text-red-500' }} mt-1">
                    {{ ($walletData['monthly_growth'] ?? 0) >= 0 ? '↑' : '↓' }} {{ abs($walletData['monthly_growth'] ?? 0) }}% vs last month
                </p>
            </div>
            
            <!-- Available for Withdrawal -->
            <div class="bg-gradient-to-br from-emerald-50 to-transparent dark:from-emerald-500/10 dark:to-transparent rounded-xl p-4 border border-emerald-200 dark:border-emerald-500/20">
                <div class="flex items-center gap-2 mb-2">
                    <span class="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <span class="material-symbols-outlined text-lg">savings</span>
                    </span>
                    <span class="text-gray-500 dark:text-gray-400 text-sm">Available to Withdraw</span>
                </div>
                <p class="text-xl font-bold text-emerald-600 dark:text-emerald-400">UGX {{ number_format($walletData['pending_payout'] ?? 0, 0) }}</p>
                <a href="{{ route('frontend.wallet.withdraw') }}" class="text-xs text-emerald-600 dark:text-emerald-400 hover:underline mt-1 inline-block">Withdraw now →</a>
            </div>
        </div>
        
        <!-- Recent Earnings -->
        @if(isset($walletData['recent_earnings']) && $walletData['recent_earnings']->count() > 0)
        <div class="border-t border-gray-100 dark:border-gray-700 pt-4">
            <h4 class="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Recent Earnings</h4>
            <div class="space-y-2">
                @foreach($walletData['recent_earnings']->take(3) as $earning)
                <div class="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-gray-800/30 hover:bg-white dark:hover:bg-gray-800/50 transition-colors">
                    <div class="flex items-center gap-3">
                        <span class="text-lg">🎵</span>
                        <div>
                            <p class="text-sm text-gray-700 dark:text-gray-300">{{ Str::limit($earning->description, 30) }}</p>
                            <p class="text-xs text-gray-400 dark:text-gray-500">{{ $earning->created_at->diffForHumans() }}</p>
                        </div>
                    </div>
                    <span class="text-emerald-600 dark:text-emerald-400 font-bold text-sm">+UGX {{ number_format($earning->amount, 0) }}</span>
                </div>
                @endforeach
            </div>
        </div>
        @endif
        
        <!-- How Revenue Works -->
        <div class="mt-4 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-700">
            <div class="flex items-start gap-3">
                <span class="material-symbols-outlined text-blue-500">info</span>
                <div>
                    <h4 class="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">How Streaming Revenue Works</h4>
                    <p class="text-xs text-gray-500 dark:text-gray-400">You earn <span class="text-emerald-600 dark:text-emerald-400 font-bold">UGX 10.50</span> per premium stream and <span class="text-emerald-600 dark:text-emerald-400 font-bold">UGX 3.50</span> per free stream (70% of platform revenue). Revenue is credited to your wallet instantly after each qualified play.</p>
                </div>
            </div>
        </div>
    </div>
</div>
@endif

<div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
<div class="xl:col-span-2 space-y-8">
<div class="glass-panel rounded-2xl p-6 border border-gray-200 dark:border-border-dark relative overflow-hidden">
<div class="absolute -right-10 -bottom-20 w-80 h-80 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none"></div>
<div class="flex flex-col lg:flex-row gap-8 relative z-10">
<div class="flex-1 min-w-0">
<div class="flex items-center justify-between mb-5">
<h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
<span class="material-symbols-outlined text-brand-green">library_music</span>
                                        Music Performance
                                    </h3>
<div class="flex gap-2">
<a href="{{ route('frontend.artist.music.upload') }}" class="bg-brand-green/10 hover:bg-brand-green/20 text-brand-green text-xs font-bold py-2 px-3 rounded-lg border border-brand-green/20 flex items-center gap-1 transition-colors">
<span class="material-symbols-outlined text-[16px]">add</span> Upload
                                        </a>
<a class="text-xs font-medium text-gray-500 dark:text-text-secondary hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1 px-2 py-2" href="{{ route('frontend.artist.music.index') }}">
                                            Library <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
</a>
</div>
</div>
<div class="space-y-3">
@forelse($recentTracks as $track)
<div class="glass-card p-3 rounded-xl flex items-center gap-4 hover:bg-gray-100 dark:hover:bg-card-dark transition-all group border-transparent hover:border-gray-200 dark:hover:border-border-dark">
<div class="relative w-12 h-12 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
@if($track['artwork_url'])
<img alt="{{ $track['title'] }}" class="w-full h-full object-cover rounded-lg shadow-md" src="{{ $track['artwork_url'] }}"/>
@else
<div class="w-full h-full bg-gradient-to-br from-brand-green to-emerald-900 rounded-lg flex items-center justify-center">
<span class="material-symbols-outlined text-white">music_note</span>
</div>
@endif
<div class="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
<span class="material-symbols-outlined text-white text-lg">play_arrow</span>
</div>
</div>
<div class="flex-1 min-w-0">
<h4 class="text-sm font-bold text-gray-900 dark:text-white truncate">{{ $track['title'] }}</h4>
<p class="text-xs text-gray-500 dark:text-text-secondary truncate">{{ $track['type'] }} • Released {{ $track['created_at']->diffForHumans() }}</p>
</div>
<div class="text-right px-2 hidden sm:block">
<div class="flex items-center gap-1 justify-end text-gray-900 dark:text-white font-medium text-sm">
<span class="material-symbols-outlined text-[14px] text-brand-green">trending_up</span> 
                                                {{ $track['streams_this_month'] > 1000 ? number_format($track['streams_this_month']/1000, 1) . 'k' : $track['streams_this_month'] }}
</div>
<p class="text-[10px] text-gray-500 dark:text-text-secondary">This Month</p>
</div>
<div class="flex items-center gap-1 pl-2 border-l border-gray-200 dark:border-white/5">
<a href="{{ route('frontend.artist.music.show', $track['slug']) }}" class="p-2 text-gray-500 dark:text-text-secondary hover:text-brand-green hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors" title="View Details">
<span class="material-symbols-outlined text-[18px]">bar_chart</span>
</a>
</div>
</div>
@empty
<div class="text-center py-8 text-gray-500 dark:text-text-secondary">
<span class="material-symbols-outlined text-4xl mb-2 block opacity-50">music_note</span>
<p class="mb-2">No tracks yet. Upload your first song!</p>
<a href="{{ route('frontend.artist.music.upload') }}" class="inline-flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium">
<span class="material-symbols-outlined text-[16px]">add</span>
                                            Upload Track
                                        </a>
</div>
@endforelse
</div>
</div>
<div class="lg:w-72 flex flex-col gap-4">
<div class="bg-white/80 dark:bg-card-dark/60 rounded-xl p-5 border border-gray-200 dark:border-white/5 relative overflow-hidden flex-1">
<div class="flex justify-between items-start mb-2">
<div>
<p class="text-xs font-medium text-gray-500 dark:text-text-secondary">Total Streams</p>
<h3 class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                        {{ $musicStats['total_streams'] > 1000 ? number_format($musicStats['total_streams']/1000, 1) . 'k' : number_format($musicStats['total_streams']) }}
</h3>
</div>
<span class="text-xs font-bold text-brand-green bg-brand-green/10 px-2 py-1 rounded-lg border border-brand-green/10">
                                    {{ $musicStats['streams_growth'] > 0 ? '+' : '' }}{{ number_format($musicStats['streams_growth'], 0) }}%
</span>
</div>
<div class="h-20 flex items-end gap-1.5 mt-2">
@php
                                    // Use dynamic chart data from controller
                                    $heights = $chartData['stream_heights'] ?? [];
                                    // Ensure we have at least 7 bars for display
                                    while (count($heights) < 7) {
                                        array_unshift($heights, 0);
                                    }
                                    // Take only the last 7 days
                                    $heights = array_slice($heights, -7);
                                @endphp
@foreach($heights as $index => $height)
<div class="w-full {{ $index == count($heights) - 1 ? 'bg-brand-green shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-gray-200 dark:bg-white/5 hover:bg-brand-green/40' }} transition-colors rounded-sm" style="height: {{ max($height, 5) }}%"></div>
@endforeach
</div>
<a href="{{ route('frontend.artist.promotions') }}" class="w-full mt-4 py-2 bg-white dark:bg-card-dark hover:bg-brand-purple/10 text-brand-purple border border-brand-purple/20 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all">
<span class="material-symbols-outlined text-[16px]">campaign</span>
                                        Promote Your Music
                                    </a>
</div>
</div>
</div>
</div>
<div class="glass-panel rounded-2xl p-6 border border-gray-200 dark:border-border-dark">
<div class="flex items-center justify-between mb-6">
<h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
<span class="material-symbols-outlined text-brand-purple">event_note</span>
                                Event Management
                            </h3>
<a href="{{ route('frontend.events.index') }}" class="bg-brand-purple hover:bg-purple-600 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center gap-1 transition-colors shadow-lg shadow-brand-purple/20">
<span class="material-symbols-outlined text-[16px]">visibility</span> View Events
                            </a>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
<div class="space-y-4">
<h4 class="text-xs uppercase font-bold text-gray-500 dark:text-text-secondary tracking-widest mb-2">Upcoming Events</h4>
@forelse($upcomingEvents ?? collect() as $event)
<a href="{{ route('frontend.events.show', $event['id']) }}" class="glass-card p-4 rounded-xl border-l-4 {{ $event['status_label'] === 'SELLING FAST' ? 'border-l-brand-purple' : 'border-l-gray-400 dark:border-l-gray-600' }} flex items-center justify-between hover:bg-gray-100 dark:hover:bg-card-dark transition-colors cursor-pointer block">
<div>
<div class="{{ $event['status_label'] === 'SELLING FAST' ? 'text-brand-purple' : 'text-gray-500 dark:text-text-secondary' }} text-[10px] font-bold uppercase mb-1">{{ $event['formatted_date'] }} • {{ $event['formatted_time'] }}</div>
<h4 class="text-gray-900 dark:text-white font-bold text-sm">{{ $event['title'] }}</h4>
<p class="text-xs text-gray-500 dark:text-text-secondary mt-1">{{ $event['venue'] ?? $event['city'] ?? 'TBD' }}</p>
</div>
<div class="text-right">
<span class="inline-block px-2 py-1 {{ $event['status_label'] === 'SELLING FAST' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-text-secondary border-gray-200 dark:border-white/10' }} text-[10px] font-bold rounded border">{{ $event['status_label'] }}</span>
<div class="mt-2 text-xs text-gray-900 dark:text-white">{{ number_format($event['sold_tickets']) }}/{{ number_format($event['total_tickets']) }} Sold</div>
</div>
</a>
@empty
<div class="text-center py-8 text-gray-500 dark:text-text-secondary">
    <span class="material-symbols-outlined text-4xl mb-2 block opacity-50">event_busy</span>
    <p class="mb-2">No upcoming events</p>
    <a href="{{ route('frontend.events.index') }}" class="inline-flex items-center gap-2 px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium">
        <span class="material-symbols-outlined text-[16px]">search</span>
        Browse Events
    </a>
</div>
@endforelse
</div>
<div class="bg-white/80 dark:bg-card-dark/40 rounded-xl p-5 border border-gray-200 dark:border-white/5 flex flex-col justify-between">
<div>
<div class="flex justify-between items-start">
<h4 class="text-sm font-bold text-gray-900 dark:text-white">Ticket Sales Summary</h4>
</div>
@php
    $totalTicketsSold = collect($upcomingEvents ?? [])->sum('sold_tickets');
    $totalTicketsAvailable = collect($upcomingEvents ?? [])->sum('total_tickets');
@endphp
<h2 class="text-2xl font-bold text-gray-900 dark:text-white mt-2">{{ number_format($totalTicketsSold) }} <span class="text-sm font-normal text-gray-500 dark:text-text-secondary">tickets sold</span></h2>
<p class="text-xs text-gray-500 dark:text-text-secondary">of {{ number_format($totalTicketsAvailable) }} available</p>
</div>
@if($totalTicketsAvailable > 0)
<div class="h-32 w-full flex items-end justify-between gap-2 mt-4">
@php
    // Calculate bar heights based on actual event ticket sales
    $eventHeights = collect($upcomingEvents ?? [])->map(function($event) use ($totalTicketsAvailable) {
        if ($totalTicketsAvailable == 0) return 10;
        return max(10, round(($event['sold_tickets'] / max($event['total_tickets'], 1)) * 100));
    })->toArray();
    // Ensure we have at least 7 bars
    while (count($eventHeights) < 7) {
        $eventHeights[] = 10;
    }
@endphp
@foreach(array_slice($eventHeights, 0, 7) as $index => $height)
<div class="w-full {{ $index === count(array_slice($eventHeights, 0, 7)) - 1 ? 'bg-brand-purple shadow-[0_0_10px_rgba(138,43,226,0.3)]' : 'bg-brand-purple/' . (20 + ($index * 10)) }} rounded-t-sm" style="height: {{ $height }}%"></div>
@endforeach
</div>
@else
<div class="h-32 w-full flex items-center justify-center text-gray-400 dark:text-gray-600">
    <span class="text-sm">No ticket data yet</span>
</div>
@endif
</div>
</div>
</div>
</div>
<div class="space-y-8">
<!-- Wallet Summary Card -->
<div class="glass-panel rounded-2xl p-6 border border-primary/30 relative overflow-hidden bg-gradient-to-br from-white dark:from-card-dark to-primary/5">
    <div class="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="relative z-10">
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span class="material-symbols-outlined text-primary">account_balance_wallet</span>
                My Wallet
            </h3>
            <a href="{{ route('frontend.wallet.index') }}" class="text-xs text-primary hover:text-white flex items-center gap-1 transition-colors">
                View All <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
            </a>
        </div>
        
        <!-- Balance Cards -->
        <div class="space-y-3 mb-4">
            <!-- UGX Balance -->
            <div class="bg-green-500/10 p-4 rounded-xl border border-green-500/20">
                <div class="flex justify-between items-start mb-1">
                    <span class="text-xs font-medium text-green-400 uppercase tracking-wider">UGX Balance</span>
                    <span class="material-symbols-outlined text-green-500 text-lg">payments</span>
                </div>
                <h3 class="text-2xl font-bold text-white">UGX {{ number_format(auth()->user()->ugx_balance ?? 0) }}</h3>
                <p class="text-[10px] text-text-secondary mt-1">Available for withdrawal</p>
            </div>
            
            <!-- Credits Balance -->
            <div class="bg-primary/10 p-4 rounded-xl border border-primary/20">
                <div class="flex justify-between items-start mb-1">
                    <span class="text-xs font-medium text-primary uppercase tracking-wider">Credits</span>
                    <span class="material-symbols-outlined text-primary text-lg">token</span>
                </div>
                <h3 class="text-2xl font-bold text-white">{{ number_format(auth()->user()->credits ?? 0) }}</h3>
                <p class="text-[10px] text-text-secondary mt-1">1 Credit = UGX 1,000</p>
            </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="flex gap-2">
            <a href="{{ route('frontend.wallet.topup') }}" class="flex-1 bg-brand-green text-black text-xs font-bold py-2.5 rounded-lg hover:bg-green-400 transition-colors text-center flex items-center justify-center gap-1">
                <span class="material-symbols-outlined text-[16px]">add</span> Top Up
            </a>
            <a href="{{ route('frontend.wallet.withdraw') }}" class="flex-1 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white text-xs font-bold py-2.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 transition-colors text-center flex items-center justify-center gap-1">
                <span class="material-symbols-outlined text-[16px]">payments</span> Withdraw
            </a>
        </div>
    </div>
</div>

<div class="glass-panel rounded-2xl p-6 border border-brand-green/30 relative overflow-hidden bg-gradient-to-br from-white dark:from-card-dark to-brand-green/5">
<div class="flex items-center justify-between mb-6">
<h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
<span class="material-symbols-outlined text-brand-green">account_balance</span>
                                Financial Services
                            </h3>
<button class="p-1 text-gray-500 dark:text-text-secondary hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
<span class="material-symbols-outlined text-[20px]">more_horiz</span>
</button>
</div>
@if($saccoStats['enabled'] && ($saccoStats['is_member'] ?? false))
<!-- SACCO Member View -->
<div class="bg-gradient-to-br from-emerald-900/40 to-black p-5 rounded-xl border border-brand-green/20 mb-4 shadow-lg">
<div class="flex justify-between items-center mb-2">
<span class="text-xs font-medium text-brand-green uppercase tracking-wider">Artist Savings</span>
<span class="inline-flex items-center gap-1 text-xs text-brand-green">
<span class="material-symbols-outlined text-[14px]">verified</span>
                                    Member
                                </span>
</div>
<h2 class="text-3xl font-bold text-white tracking-tight">UGX {{ number_format($saccoStats['total_contributions'] ?? 0) }}</h2>
<p class="text-xs text-text-secondary mt-1">{{ $saccoStats['shares_owned'] ?? 0 }} shares owned</p>
<div class="mt-4 flex gap-2">
<button class="flex-1 bg-brand-green text-black text-xs font-bold py-2 rounded hover:bg-green-400 transition-colors">Top Up</button>
<button class="flex-1 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white text-xs font-bold py-2 rounded hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 transition-colors">Withdraw</button>
</div>
</div>
@if($saccoStats['has_active_loan'] ?? false)
<div class="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 mb-4">
<div class="flex justify-between items-center mb-2">
<span class="text-xs font-bold text-amber-400">Active Loan</span>
<span class="text-xs font-bold text-amber-400">{{ number_format(($saccoStats['loan_balance'] / ($saccoStats['loan_balance'] + 1)) * 100) }}% remaining</span>
</div>
<div class="flex justify-between items-end">
<div>
<h3 class="text-gray-900 dark:text-white font-bold text-lg">UGX {{ number_format($saccoStats['loan_balance'] ?? 0) }}</h3>
<p class="text-[10px] text-gray-500 dark:text-text-secondary">Monthly: UGX {{ number_format($saccoStats['monthly_payment'] ?? 0) }}</p>
</div>
<button class="text-xs font-bold text-amber-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 transition-colors">
                                    Pay Now <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
</button>
</div>
</div>
@else
<div class="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-border-dark mb-4">
<div class="flex justify-between items-center mb-2">
<span class="text-xs font-bold text-gray-500 dark:text-text-secondary">Available Credit</span>
<span class="text-xs font-bold text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded">Pre-Approved</span>
</div>
<div class="flex justify-between items-end">
<div>
<h3 class="text-gray-900 dark:text-white font-bold text-lg">Up to UGX 5,000,000</h3>
<p class="text-[10px] text-gray-500 dark:text-text-secondary">Low interest artist loans</p>
</div>
<button class="text-xs font-bold text-brand-blue hover:text-gray-900 dark:hover:text-white flex items-center gap-1 transition-colors">
                                    Apply <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
</button>
</div>
</div>
@endif
@else
<!-- Non-member View -->
<div class="bg-gradient-to-br from-emerald-900/40 to-black p-5 rounded-xl border border-brand-green/20 mb-4 shadow-lg text-center">
<div class="w-14 h-14 mx-auto bg-brand-green/20 rounded-full flex items-center justify-center mb-3">
<span class="material-symbols-outlined text-brand-green text-2xl">savings</span>
</div>
<h4 class="text-white font-bold mb-1">Join Artist SACCO</h4>
<p class="text-xs text-text-secondary mb-4">Save together, grow together. Access low-interest loans for equipment and projects.</p>
<a href="{{ route('frontend.sacco.landing') }}" class="inline-flex items-center gap-2 px-4 py-2 bg-brand-green text-black rounded-lg hover:bg-green-400 transition-colors text-xs font-bold">
<span class="material-symbols-outlined text-[16px]">add</span>
                                    Join Now
                                </a>
</div>
<div class="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-border-dark mb-4">
<div class="flex justify-between items-center mb-2">
<span class="text-xs font-bold text-gray-500 dark:text-text-secondary">Member Benefits</span>
</div>
<div class="space-y-2 text-xs text-gray-500 dark:text-text-secondary">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-brand-green text-[14px]">check_circle</span>
                                    Low interest equipment loans
                                </div>
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-brand-green text-[14px]">check_circle</span>
                                    Save with fellow artists
                                </div>
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-brand-green text-[14px]">check_circle</span>
                                    Earn dividends on savings
                                </div>
</div>
</div>
@endif
<div>
<h4 class="text-xs font-bold text-gray-500 dark:text-text-secondary mb-3 uppercase tracking-wider">Recent Transactions</h4>
<div class="space-y-3">
@if($revenueData['music_royalties'] > 0)
<div class="flex items-center justify-between text-sm">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-green-400">
<span class="material-symbols-outlined text-[16px]">arrow_downward</span>
</div>
<div>
<p class="text-gray-900 dark:text-white font-medium">Royalty Payout</p>
<p class="text-[10px] text-gray-500 dark:text-text-secondary">TesoTunes Streaming</p>
</div>
</div>
<span class="text-green-400 font-medium">+UGX {{ number_format($revenueData['music_royalties']) }}</span>
</div>
@endif
@if($revenueData['merch_sales'] > 0)
<div class="flex items-center justify-between text-sm">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-green-400">
<span class="material-symbols-outlined text-[16px]">arrow_downward</span>
</div>
<div>
<p class="text-gray-900 dark:text-white font-medium">Store Sales</p>
<p class="text-[10px] text-gray-500 dark:text-text-secondary">Merchandise & Products</p>
</div>
</div>
<span class="text-green-400 font-medium">+UGX {{ number_format($revenueData['merch_sales']) }}</span>
</div>
@endif
@if($revenueData['music_royalties'] == 0 && $revenueData['merch_sales'] == 0)
<div class="text-center py-4 text-gray-500 dark:text-text-secondary text-xs">
<span class="material-symbols-outlined text-2xl mb-2 block opacity-50">receipt_long</span>
                                    No transactions yet
                                </div>
@endif
</div>
@if($saccoStats['is_member'] ?? false)
<button class="w-full mt-4 text-xs font-medium text-gray-500 dark:text-text-secondary hover:text-brand-green py-2 border border-gray-200 dark:border-border-dark rounded-lg hover:border-brand-green/30 transition-all">
                                 Manage SACCO Account
                             </button>
@endif
</div>
</div>
<div class="glass-panel rounded-2xl p-6 border border-gray-200 dark:border-border-dark">
<div class="flex items-center justify-between mb-4">
<h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
<span class="material-symbols-outlined text-brand-blue">inventory_2</span>
                                Top Products
                            </h3>
@if($storeStats['has_store'])
<a class="text-xs font-medium text-brand-green hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1" href="{{ route('frontend.store.show', $storeStats['store']->slug) }}">
                                View Shop <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
</a>
@endif
</div>
@if($storeStats['has_store'] && $storeStats['top_products']->count() > 0)
<div class="space-y-3">
@foreach($storeStats['top_products']->take(4) as $product)
<div class="glass-card rounded-xl p-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-card-dark transition-colors group cursor-pointer">
<div class="relative w-12 h-12 flex-shrink-0">
@if($product->featured_image)
<img alt="{{ $product->name }}" class="w-full h-full object-cover rounded-lg" src="{{ $product->featured_image }}"/>
@else
<div class="w-full h-full bg-gradient-to-br from-brand-blue to-indigo-900 rounded-lg flex items-center justify-center">
<span class="material-symbols-outlined text-white text-lg">
                                                    @if($product->product_type == 'physical') checkroom
                                                    @elseif($product->product_type == 'digital') download
                                                    @elseif($product->product_type == 'ticket') confirmation_number
                                                    @else shopping_bag
                                                    @endif
                                                </span>
</div>
@endif
<div class="absolute -top-1 -right-1 w-4 h-4 bg-white dark:bg-card-dark rounded-full flex items-center justify-center">
<span class="material-symbols-outlined text-[10px] text-brand-green">visibility</span>
</div>
</div>
<div class="flex-1 min-w-0">
<h4 class="text-gray-900 dark:text-white text-sm font-medium truncate">{{ Str::limit($product->name, 20) }}</h4>
<p class="text-gray-500 dark:text-text-secondary text-xs">
                                        UGX {{ number_format($product->pricing?->price_ugx ?? 0) }}
                                        <span class="inline-flex items-center ml-1 px-1.5 py-0.5 rounded text-[9px] font-medium
                                            @if($product->product_type == 'physical') bg-blue-500/10 text-blue-400
                                            @elseif($product->product_type == 'digital') bg-purple-500/10 text-purple-400
                                            @elseif($product->product_type == 'ticket') bg-amber-500/10 text-amber-400
                                            @elseif($product->product_type == 'experience') bg-pink-500/10 text-pink-400
                                            @else bg-white/10 text-text-secondary
                                            @endif">
                                            {{ ucfirst($product->product_type) }}
                                        </span>
</p>
</div>
<div class="text-right">
<span class="block text-brand-green text-sm font-bold">{{ number_format($product->view_count ?? 0) }}</span>
<span class="text-[10px] text-gray-500 dark:text-text-secondary">Views</span>
</div>
</div>
@endforeach
</div>
<a href="{{ route('frontend.store.dashboard', $storeStats['store']->slug) }}" class="w-full mt-4 py-2.5 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue border border-brand-blue/20 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all">
<span class="material-symbols-outlined text-[16px]">storefront</span>
                                Manage Store
                            </a>
@else
<div class="text-center py-8">
<div class="w-16 h-16 mx-auto bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-3">
<span class="material-symbols-outlined text-3xl text-gray-500 dark:text-text-secondary">storefront</span>
</div>
<p class="text-gray-500 dark:text-text-secondary text-sm mb-4">No products yet</p>
<a href="{{ route('frontend.store.create') }}" class="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
<span class="material-symbols-outlined text-[16px]">add</span>
                                    Create Store
                                </a>
</div>
@endif
</div>
</div>
</div>
<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
<div class="lg:col-span-2 glass-panel rounded-2xl p-6 border border-brand-purple/20 relative overflow-hidden">
<div class="absolute top-0 right-0 w-32 h-32 bg-brand-purple/10 blur-2xl rounded-full pointer-events-none"></div>
<div class="flex items-center justify-between mb-4 relative z-10">
<h3 class="text-lg font-bold text-gray-900 dark:text-white">Active Campaigns</h3>
<a class="text-xs text-brand-purple hover:text-gray-900 dark:hover:text-white font-medium" href="#">View All Campaigns</a>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
<div class="bg-white/80 dark:bg-card-dark/80 p-4 rounded-xl border-l-4 border-brand-purple">
<div class="flex justify-between items-start mb-1">
<h4 class="font-bold text-gray-900 dark:text-white text-sm">New Album Launch</h4>
<span class="text-[10px] font-bold uppercase text-brand-purple bg-brand-purple/10 px-1.5 py-0.5 rounded">Active</span>
</div>
<p class="text-xs text-gray-500 dark:text-text-secondary mb-3">20% OFF • Code: NEWALBUM24</p>
<div class="w-full bg-gray-200 dark:bg-black/40 h-1.5 rounded-full mb-1">
<div class="bg-brand-purple h-1.5 rounded-full" style="width: 70%"></div>
</div>
<div class="flex justify-between text-[10px] text-gray-500 dark:text-text-secondary">
<span>358 Used</span>
<span>Expires in 2d</span>
</div>
</div>
<div class="bg-white/60 dark:bg-card-dark/60 p-4 rounded-xl border border-gray-200 dark:border-border-dark flex flex-col justify-center items-center text-center hover:bg-gray-100 dark:hover:bg-card-dark transition-colors cursor-pointer group">
<div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-2 group-hover:bg-brand-purple/20 group-hover:text-brand-purple transition-all text-gray-500 dark:text-text-secondary">
<span class="material-symbols-outlined">add</span>
</div>
<h4 class="font-bold text-gray-900 dark:text-white text-sm">Create New Campaign</h4>
<p class="text-xs text-gray-500 dark:text-text-secondary">Boost sales or streams</p>
</div>
</div>
</div>
<div class="bg-gradient-to-br from-brand-orange/10 to-transparent border border-brand-orange/20 rounded-2xl p-6">
<div class="flex items-center gap-2 mb-2 text-brand-orange">
<span class="material-symbols-outlined">lightbulb</span>
<h3 class="font-bold text-sm uppercase tracking-wide">Monetization Tip</h3>
</div>
<p class="text-sm text-gray-900 dark:text-white mb-3 font-medium">Unlock SACCO Loans</p>
<p class="text-xs text-gray-500 dark:text-text-secondary mb-4 leading-relaxed">
                        Consistent weekly savings into your Artist SACCO account can qualify you for low-interest equipment loans up to $10,000.
                    </p>
<button class="text-xs font-bold text-brand-orange hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1">
                        Start Saving <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
</button>
</div>
</div>
</div>

@endsection
