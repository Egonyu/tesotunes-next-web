@extends('layouts.app')

@section('title', 'My Dashboard')

@section('left-sidebar')
    @include('frontend.partials.user-left-sidebar')
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

    {{-- Welcome Header Section --}}
    <div class="glass-panel rounded-2xl p-8 relative overflow-hidden group">
        <div class="absolute -right-20 -top-20 w-96 h-96 bg-brand-green/10 rounded-full blur-3xl group-hover:bg-brand-green/20 transition-all duration-700"></div>
        <div class="relative z-10">
            <div class="flex flex-col md:flex-row md:items-end justify-between mb-6">
                <div>
                    <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        Welcome back, {{ auth()->user()->name }}! 👋
                    </h2>
                    <p class="text-gray-500 dark:text-text-secondary">Your personalized music experience awaits. Let's discover something new today.</p>
                </div>
                <div class="mt-4 md:mt-0 flex gap-2">
                    @if(($listeningStats['total_plays'] ?? 0) > 100)
                    <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/10 text-brand-green text-xs font-bold border border-brand-green/20">
                        <span class="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span>
                        ACTIVE LISTENER
                    </span>
                    @endif
                    
                    <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-bold border border-brand-blue/20">
                        <span class="material-symbols-outlined text-[14px]">library_music</span>
                        {{ $listeningStats['total_unique_songs'] ?? 0 }} SONGS
                    </span>
                </div>
            </div>

            <!-- Quick Action Buttons -->
            <div class="flex flex-wrap gap-3 mb-6">
                <a href="{{ route('frontend.timeline') }}" class="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-green hover:bg-green-600 text-white font-semibold rounded-lg transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/30">
                    <span class="material-symbols-outlined text-lg">explore</span>
                    Discover Music
                </a>
                <a href="{{ route('frontend.playlists.index') }}" class="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all">
                    <span class="material-symbols-outlined text-lg">queue_music</span>
                    My Playlists
                </a>
                <a href="{{ route('frontend.player.downloads') }}" class="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all">
                    <span class="material-symbols-outlined text-lg">download</span>
                    Downloads
                </a>
                <a href="{{ route('frontend.events.index') }}" class="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg transition-all border border-gray-200 dark:border-gray-600">
                    <span class="material-symbols-outlined text-lg">confirmation_number</span>
                    Events
                </a>
                <a href="{{ route('frontend.store.products.index') }}" class="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg transition-all border border-gray-200 dark:border-gray-600">
                    <span class="material-symbols-outlined text-lg">storefront</span>
                    Shop
                </a>
            </div>

            {{-- Quick Stats Cards --}}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Total Plays Card -->
                <div class="bg-white/80 dark:bg-card-dark/50 rounded-xl p-5 border border-gray-200 dark:border-white/5 hover:border-brand-green/30 transition-all hover:-translate-y-1 duration-300 relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-3 opacity-10">
                        <span class="material-symbols-outlined text-6xl text-brand-green">play_circle</span>
                    </div>
                    <div class="flex justify-between items-start mb-4 relative z-10">
                        <div class="p-2 bg-brand-green/20 rounded-lg text-brand-green">
                            <span class="material-symbols-outlined">play_circle</span>
                        </div>
                        <span class="text-xs font-medium text-brand-green bg-brand-green/10 px-2 py-0.5 rounded flex items-center">
                            {{ ($listeningStats['play_growth'] ?? 0) > 0 ? '+' : '' }}{{ number_format($listeningStats['play_growth'] ?? 0, 1) }}% 
                            <span class="material-symbols-outlined text-[12px] ml-1">
                                {{ ($listeningStats['play_growth'] ?? 0) >= 0 ? 'trending_up' : 'trending_down' }}
                            </span>
                        </span>
                    </div>
                    <p class="text-gray-500 dark:text-text-secondary text-sm font-medium">Total Plays</p>
                    <h3 class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ number_format($listeningStats['total_plays'] ?? 0) }}</h3>
                    <p class="text-[10px] text-gray-400 dark:text-text-secondary mt-2">{{ $listeningStats['plays_this_month'] ?? 0 }} this month</p>
                </div>

                <!-- Listening Time Card -->
                <div class="bg-white/80 dark:bg-card-dark/50 rounded-xl p-5 border border-gray-200 dark:border-white/5 hover:border-brand-blue/30 transition-all hover:-translate-y-1 duration-300 relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-3 opacity-10">
                        <span class="material-symbols-outlined text-6xl text-brand-blue">schedule</span>
                    </div>
                    <div class="flex justify-between items-start mb-4 relative z-10">
                        <div class="p-2 bg-brand-blue/20 rounded-lg text-brand-blue">
                            <span class="material-symbols-outlined">schedule</span>
                        </div>
                    </div>
                    <p class="text-gray-500 dark:text-text-secondary text-sm font-medium">Listening Time</p>
                    @php
                        $totalSeconds = $listeningStats['total_time_seconds'] ?? 0;
                        $hours = floor($totalSeconds / 3600);
                        $minutes = floor(($totalSeconds % 3600) / 60);
                    @endphp
                    <h3 class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ $hours }}h {{ $minutes }}m</h3>
                    <p class="text-[10px] text-gray-400 dark:text-text-secondary mt-2">{{ $listeningStats['unique_artists'] ?? 0 }} unique artists</p>
                </div>

                <!-- Liked Songs Card -->
                <div class="bg-white/80 dark:bg-card-dark/50 rounded-xl p-5 border border-gray-200 dark:border-white/5 hover:border-brand-purple/30 transition-all hover:-translate-y-1 duration-300 relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-3 opacity-10">
                        <span class="material-symbols-outlined text-6xl text-brand-purple">favorite</span>
                    </div>
                    <div class="flex justify-between items-start mb-4 relative z-10">
                        <div class="p-2 bg-brand-purple/20 rounded-lg text-brand-purple">
                            <span class="material-symbols-outlined">favorite</span>
                        </div>
                    </div>
                    <p class="text-gray-500 dark:text-text-secondary text-sm font-medium">Liked Songs</p>
                    <h3 class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ number_format($socialStats['liked_songs'] ?? 0) }}</h3>
                    <p class="text-[10px] text-gray-400 dark:text-text-secondary mt-2">{{ $socialStats['playlists'] ?? 0 }} playlists created</p>
                </div>

                <!-- Wallet Balance Card -->
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
                    <h3 class="text-2xl font-bold text-gray-900 dark:text-white mt-1">UGX {{ number_format($walletStats['balance'] ?? 0, 0) }}</h3>
                    <p class="text-[10px] text-emerald-600 dark:text-emerald-400 mt-2">{{ $walletStats['credits'] ?? 0 }} credits available</p>
                </div>
            </div>
        </div>
    </div>

    {{-- Main Content Grid --}}
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {{-- Left Column (2/3 width) --}}
        <div class="xl:col-span-2 space-y-8">
            
            {{-- Recently Played Section --}}
            <div class="glass-panel rounded-2xl p-6 border border-gray-200 dark:border-border-dark relative overflow-hidden">
                <div class="absolute -right-10 -bottom-20 w-80 h-80 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none"></div>
                <div class="flex flex-col lg:flex-row gap-8 relative z-10">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between mb-5">
                            <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span class="material-symbols-outlined text-brand-green">history</span>
                                Recently Played
                            </h3>
                            <div class="flex gap-2">
                                <a href="{{ route('frontend.player.history') }}" class="text-xs font-medium text-gray-500 dark:text-text-secondary hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1 px-2 py-2">
                                    View All <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
                                </a>
                            </div>
                        </div>
                        <div class="space-y-3">
                            @forelse($recentlyPlayed ?? [] as $track)
                            <div class="glass-card p-3 rounded-xl flex items-center gap-4 hover:bg-gray-100 dark:hover:bg-card-dark transition-all group border-transparent hover:border-gray-200 dark:hover:border-border-dark cursor-pointer"
                                 onclick="window.dispatchEvent(new CustomEvent('play-track', { detail: { track: {{ json_encode($track) }} } }))">
                                <div class="relative w-12 h-12 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                                    @if($track['artwork_url'] ?? null)
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
                                    <p class="text-xs text-gray-500 dark:text-text-secondary truncate">{{ $track['artist_name'] ?? 'Unknown Artist' }}</p>
                                </div>
                                <div class="text-right px-2 hidden sm:block">
                                    <p class="text-xs text-gray-500 dark:text-text-secondary">{{ $track['duration_formatted'] ?? '--:--' }}</p>
                                    <p class="text-[10px] text-gray-400 dark:text-text-secondary">{{ $track['last_played'] ?? '' }}</p>
                                </div>
                            </div>
                            @empty
                            <div class="text-center py-8 text-gray-500 dark:text-text-secondary">
                                <span class="material-symbols-outlined text-4xl mb-2 block opacity-50">music_note</span>
                                <p class="mb-2">No recently played tracks</p>
                                <a href="{{ route('frontend.timeline') }}" class="inline-flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium">
                                    <span class="material-symbols-outlined text-[16px]">explore</span>
                                    Discover Music
                                </a>
                            </div>
                            @endforelse
                        </div>
                    </div>
                    
                    {{-- Listening Stats Panel --}}
                    <div class="lg:w-72 flex flex-col gap-4">
                        <div class="bg-white/80 dark:bg-card-dark/60 rounded-xl p-5 border border-gray-200 dark:border-white/5 relative overflow-hidden flex-1">
                            <div class="flex justify-between items-start mb-2">
                                <div>
                                    <p class="text-xs font-medium text-gray-500 dark:text-text-secondary">This Week</p>
                                    <h3 class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                        {{ number_format($listeningStats['plays_this_week'] ?? 0) }}
                                    </h3>
                                </div>
                                <span class="text-xs font-bold text-brand-green bg-brand-green/10 px-2 py-1 rounded-lg border border-brand-green/10">
                                    plays
                                </span>
                            </div>
                            <div class="h-20 flex items-end gap-1.5 mt-2">
                                @php
                                    // Generate bar chart heights from listening timeline data
                                    $timelineData = $listeningTimeline ?? [];
                                    $maxPlays = max(1, collect($timelineData)->max('plays'));
                                    $heights = collect($timelineData)->map(function($day) use ($maxPlays) {
                                        // Scale to 10-100% height
                                        return $maxPlays > 0 ? max(10, round(($day['plays'] / $maxPlays) * 100)) : 10;
                                    })->toArray();
                                    // Find the peak day index
                                    $peakIndex = collect($timelineData)->pluck('plays')->search(collect($timelineData)->max('plays'));
                                @endphp
                                @foreach($heights as $index => $height)
                                <div class="w-full {{ $index == $peakIndex ? 'bg-brand-green shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-gray-200 dark:bg-white/5 hover:bg-brand-green/40' }} transition-colors rounded-sm" style="height: {{ $height }}%"></div>
                                @endforeach
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {{-- Top Artists & Favorite Songs --}}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                {{-- Top Artists --}}
                <div class="glass-panel rounded-2xl p-6 border border-gray-200 dark:border-border-dark">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span class="material-symbols-outlined text-brand-purple">person</span>
                            Your Top Artists
                        </h3>
                        <a href="{{ route('frontend.artists') }}" class="text-xs font-medium text-gray-500 dark:text-text-secondary hover:text-gray-900 dark:hover:text-white transition-colors">
                            Browse All
                        </a>
                    </div>
                    <div class="space-y-3">
                        @forelse($topArtists ?? [] as $index => $artist)
                        <a href="{{ route('frontend.artist.show', $artist['slug'] ?? $artist['id']) }}" class="glass-card rounded-xl p-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-card-dark transition-colors group cursor-pointer block">
                            <span class="text-lg font-bold text-gray-400 dark:text-gray-600 w-6">{{ $index + 1 }}</span>
                            <div class="relative w-10 h-10 flex-shrink-0">
                                @if($artist['avatar'] ?? null)
                                <img alt="{{ $artist['name'] }}" class="w-full h-full object-cover rounded-full" src="{{ $artist['avatar'] }}"/>
                                @else
                                <div class="w-full h-full bg-gradient-to-br from-brand-purple to-purple-900 rounded-full flex items-center justify-center">
                                    <span class="material-symbols-outlined text-white text-sm">person</span>
                                </div>
                                @endif
                            </div>
                            <div class="flex-1 min-w-0">
                                <h4 class="text-sm font-bold text-gray-900 dark:text-white truncate">{{ $artist['name'] }}</h4>
                                <p class="text-xs text-gray-500 dark:text-text-secondary">{{ $artist['plays'] ?? 0 }} plays</p>
                            </div>
                        </a>
                        @empty
                        <div class="text-center py-6 text-gray-500 dark:text-text-secondary text-sm">
                            <span class="material-symbols-outlined text-3xl mb-2 block opacity-50">person_off</span>
                            Listen to music to see your top artists
                        </div>
                        @endforelse
                    </div>
                </div>

                {{-- Favorite Songs --}}
                <div class="glass-panel rounded-2xl p-6 border border-gray-200 dark:border-border-dark">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span class="material-symbols-outlined text-red-500">favorite</span>
                            Favorite Songs
                        </h3>
                        <a href="{{ route('frontend.player.library') }}" class="text-xs font-medium text-gray-500 dark:text-text-secondary hover:text-gray-900 dark:hover:text-white transition-colors">
                            My Library
                        </a>
                    </div>
                    <div class="space-y-3">
                        @forelse($favoriteSongs ?? [] as $song)
                        <div class="glass-card rounded-xl p-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-card-dark transition-colors group cursor-pointer"
                             onclick="window.dispatchEvent(new CustomEvent('play-track', { detail: { track: {{ json_encode($song) }} } }))">
                            <div class="relative w-10 h-10 flex-shrink-0">
                                @if($song['artwork_url'] ?? null)
                                <img alt="{{ $song['title'] }}" class="w-full h-full object-cover rounded-lg" src="{{ $song['artwork_url'] }}"/>
                                @else
                                <div class="w-full h-full bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                                    <span class="material-symbols-outlined text-white text-sm">music_note</span>
                                </div>
                                @endif
                                <div class="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span class="material-symbols-outlined text-white">play_arrow</span>
                                </div>
                            </div>
                            <div class="flex-1 min-w-0">
                                <h4 class="text-sm font-bold text-gray-900 dark:text-white truncate">{{ $song['title'] }}</h4>
                                <p class="text-xs text-gray-500 dark:text-text-secondary truncate">{{ $song['artist_name'] ?? 'Unknown' }}</p>
                            </div>
                            <span class="material-symbols-outlined text-red-500 text-[20px]">favorite</span>
                        </div>
                        @empty
                        <div class="text-center py-6 text-gray-500 dark:text-text-secondary text-sm">
                            <span class="material-symbols-outlined text-3xl mb-2 block opacity-50">heart_broken</span>
                            No liked songs yet
                        </div>
                        @endforelse
                    </div>
                </div>
            </div>

            {{-- Purchased & Downloaded Music Section --}}
            @if(isset($purchasedSongs) && (is_array($purchasedSongs) ? count($purchasedSongs) : $purchasedSongs->count()) > 0)
            <div class="glass-panel rounded-2xl p-6 border border-gray-200 dark:border-border-dark">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span class="material-symbols-outlined text-brand-green">shopping_bag</span>
                        Your Purchased Music
                    </h3>
                    <a href="{{ route('frontend.player.downloads') }}" class="text-xs font-medium text-gray-500 dark:text-text-secondary hover:text-gray-900 dark:hover:text-white transition-colors">
                        View All
                    </a>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    @foreach((is_array($purchasedSongs) ? array_slice($purchasedSongs, 0, 5) : $purchasedSongs->take(5)) as $song)
                    <div class="group cursor-pointer" onclick="window.dispatchEvent(new CustomEvent('play-track', { detail: { track: {{ json_encode($song) }} } }))">
                        <div class="relative aspect-square rounded-xl overflow-hidden mb-2">
                            <img src="{{ $song['artwork_url'] ?? $song->artwork_url ?? asset('images/default-song-artwork.svg') }}" 
                                 alt="{{ $song['title'] ?? $song->title }}"
                                 class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span class="material-symbols-outlined text-white text-3xl">play_circle</span>
                            </div>
                            <div class="absolute top-2 right-2">
                                <span class="material-symbols-outlined text-brand-green bg-black/50 rounded-full p-1 text-sm">download_done</span>
                            </div>
                        </div>
                        <h4 class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ $song['title'] ?? $song->title }}</h4>
                        <p class="text-xs text-gray-500 dark:text-text-secondary truncate">{{ $song['artist_name'] ?? ($song->artist->stage_name ?? 'Unknown') }}</p>
                    </div>
                    @endforeach
                </div>
            </div>
            @endif
        </div>

        {{-- Right Sidebar Column --}}
        <div class="space-y-8">
            {{-- User Profile Card --}}
            <div class="glass-panel rounded-2xl p-6 border border-primary/30 relative overflow-hidden bg-gradient-to-br from-white dark:from-card-dark to-primary/5">
                <div class="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
                <div class="relative z-10">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-brand-green/30">
                            <img src="{{ auth()->user()->avatar_url ?? asset('images/default-avatar.svg') }}" 
                                 alt="{{ auth()->user()->name }}"
                                 class="w-full h-full object-cover">
                        </div>
                        <div class="flex-1 min-w-0">
                            <h3 class="text-lg font-bold text-gray-900 dark:text-white truncate">{{ auth()->user()->name }}</h3>
                            <p class="text-sm text-gray-500 dark:text-text-secondary truncate">{{ '@' . auth()->user()->username }}</p>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-3 gap-3 py-4 border-t border-b border-gray-200 dark:border-gray-700 mb-4">
                        <div class="text-center">
                            <p class="text-xl font-bold text-gray-900 dark:text-white">{{ number_format($socialStats['following'] ?? 0) }}</p>
                            <p class="text-xs text-gray-500 dark:text-text-secondary">Following</p>
                        </div>
                        <div class="text-center">
                            <p class="text-xl font-bold text-gray-900 dark:text-white">{{ number_format($socialStats['followers'] ?? 0) }}</p>
                            <p class="text-xs text-gray-500 dark:text-text-secondary">Followers</p>
                        </div>
                        <div class="text-center">
                            <p class="text-xl font-bold text-gray-900 dark:text-white">{{ number_format($socialStats['artists_followed'] ?? 0) }}</p>
                            <p class="text-xs text-gray-500 dark:text-text-secondary">Artists</p>
                        </div>
                    </div>
                    
                    <a href="{{ route('frontend.profile.edit') }}" class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-white text-sm font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 transition-all">
                        <span class="material-symbols-outlined text-[18px]">edit</span>
                        Edit Profile
                    </a>
                </div>
            </div>

            {{-- Wallet Summary --}}
            <div class="glass-panel rounded-2xl p-6 border border-emerald-200 dark:border-emerald-500/30 relative overflow-hidden bg-gradient-to-br from-white dark:from-card-dark to-emerald-500/5">
                <div class="absolute -left-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div class="relative z-10">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span class="material-symbols-outlined text-emerald-500">account_balance_wallet</span>
                            My Wallet
                        </h3>
                        <a href="{{ route('frontend.wallet.index') }}" class="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                            View All <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </a>
                    </div>
                    
                    <div class="space-y-3 mb-4">
                        <!-- UGX Balance -->
                        <div class="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                            <div class="flex justify-between items-start mb-1">
                                <span class="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">UGX Balance</span>
                                <span class="material-symbols-outlined text-emerald-500 text-lg">payments</span>
                            </div>
                            <h3 class="text-2xl font-bold text-gray-900 dark:text-white">UGX {{ number_format(auth()->user()->ugx_balance ?? 0) }}</h3>
                        </div>
                        
                        <!-- Credits Balance -->
                        <div class="bg-primary/10 p-4 rounded-xl border border-primary/20">
                            <div class="flex justify-between items-start mb-1">
                                <span class="text-xs font-medium text-primary uppercase tracking-wider">Credits</span>
                                <span class="material-symbols-outlined text-primary text-lg">token</span>
                            </div>
                            <h3 class="text-2xl font-bold text-gray-900 dark:text-white">{{ number_format(auth()->user()->credits ?? 0) }}</h3>
                            <p class="text-[10px] text-gray-500 dark:text-text-secondary mt-1">1 Credit = UGX 1,000</p>
                        </div>
                    </div>
                    
                    <a href="{{ route('frontend.wallet.topup') }}" class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 text-white text-sm font-bold rounded-lg hover:bg-emerald-600 transition-all">
                        <span class="material-symbols-outlined text-[18px]">add</span>
                        Top Up
                    </a>
                </div>
            </div>

            {{-- Your Playlists --}}
            <div class="glass-panel rounded-2xl p-6 border border-gray-200 dark:border-border-dark">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span class="material-symbols-outlined text-brand-blue">queue_music</span>
                        Your Playlists
                    </h3>
                    <a href="{{ route('frontend.playlists.create') }}" class="text-xs bg-brand-green/10 text-brand-green px-2 py-1 rounded hover:bg-brand-green/20 transition-colors font-bold flex items-center gap-1">
                        <span class="material-symbols-outlined text-[14px]">add</span> New
                    </a>
                </div>
                <div class="space-y-3">
                    @forelse($playlists ?? [] as $playlist)
                    <a href="{{ route('frontend.playlists.show', $playlist->id ?? $playlist['id']) }}" class="glass-card rounded-xl p-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-card-dark transition-colors group block">
                        <div class="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                            @if($playlist->cover_image ?? $playlist['cover_image'] ?? null)
                            <img src="{{ $playlist->cover_image ?? $playlist['cover_image'] }}" alt="{{ $playlist->name ?? $playlist['name'] }}" class="w-full h-full object-cover">
                            @else
                            <div class="w-full h-full bg-gradient-to-br from-brand-blue to-purple-600 flex items-center justify-center">
                                <span class="material-symbols-outlined text-white text-sm">queue_music</span>
                            </div>
                            @endif
                        </div>
                        <div class="flex-1 min-w-0">
                            <h4 class="text-sm font-bold text-gray-900 dark:text-white truncate">{{ $playlist->name ?? $playlist['name'] }}</h4>
                            <p class="text-xs text-gray-500 dark:text-text-secondary">{{ $playlist->songs_count ?? $playlist['songs_count'] ?? 0 }} songs</p>
                        </div>
                        @if($playlist->is_public ?? $playlist['is_public'] ?? false)
                        <span class="material-symbols-outlined text-gray-400 text-[16px]">public</span>
                        @else
                        <span class="material-symbols-outlined text-gray-400 text-[16px]">lock</span>
                        @endif
                    </a>
                    @empty
                    <div class="text-center py-6 text-gray-500 dark:text-text-secondary text-sm">
                        <span class="material-symbols-outlined text-3xl mb-2 block opacity-50">playlist_add</span>
                        <p class="mb-3">No playlists yet</p>
                        <a href="{{ route('frontend.playlists.create') }}" class="inline-flex items-center gap-1 text-brand-green hover:underline text-xs font-bold">
                            <span class="material-symbols-outlined text-[14px]">add</span> Create your first playlist
                        </a>
                    </div>
                    @endforelse
                </div>
            </div>

            {{-- Upcoming Events --}}
            <div class="glass-panel rounded-2xl p-6 border border-gray-200 dark:border-border-dark">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span class="material-symbols-outlined text-brand-purple">confirmation_number</span>
                        Upcoming Events
                    </h3>
                    <a href="{{ route('frontend.events.index') }}" class="text-xs font-medium text-gray-500 dark:text-text-secondary hover:text-gray-900 dark:hover:text-white transition-colors">
                        View All
                    </a>
                </div>
                <div class="space-y-3">
                    @forelse($upcomingEvents ?? [] as $event)
                    <a href="{{ route('frontend.events.show', $event->id ?? $event['id']) }}" class="glass-card rounded-xl p-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-card-dark transition-colors group block">
                        <div class="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                            <img src="{{ $event->cover_image ?? $event['cover_image'] ?? asset('images/default-event.jpg') }}" 
                                 alt="{{ $event->title ?? $event['title'] }}"
                                 class="w-full h-full object-cover">
                        </div>
                        <div class="flex-1 min-w-0">
                            <h4 class="text-sm font-bold text-gray-900 dark:text-white truncate">{{ $event->title ?? $event['title'] }}</h4>
                            <p class="text-xs text-gray-500 dark:text-text-secondary flex items-center gap-1">
                                <span class="material-symbols-outlined text-[12px]">calendar_today</span>
                                {{ isset($event->starts_at) ? $event->starts_at->format('M d, Y') : ($event['starts_at'] ?? 'TBA') }}
                            </p>
                        </div>
                    </a>
                    @empty
                    <div class="text-center py-6 text-gray-500 dark:text-text-secondary text-sm">
                        <span class="material-symbols-outlined text-3xl mb-2 block opacity-50">event_busy</span>
                        No upcoming events
                    </div>
                    @endforelse
                </div>
            </div>

            {{-- Become an Artist Promotion --}}
            @if(!auth()->user()->hasRole('artist') && !auth()->user()->artist)
            <div class="glass-panel rounded-2xl p-6 border border-brand-green/30 relative overflow-hidden bg-gradient-to-br from-brand-green/10 to-transparent dark:from-brand-green/20 dark:to-card-dark">
                <div class="absolute -right-10 -bottom-10 w-32 h-32 bg-brand-green/20 rounded-full blur-2xl pointer-events-none"></div>
                <div class="relative z-10 text-center">
                    <div class="w-16 h-16 mx-auto bg-brand-green/20 rounded-full flex items-center justify-center mb-4">
                        <span class="material-symbols-outlined text-brand-green text-3xl">mic</span>
                    </div>
                    <h4 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Are You an Artist?</h4>
                    <p class="text-sm text-gray-500 dark:text-text-secondary mb-4">Join TesoTunes as an artist and share your music with the world.</p>
                    <a href="{{ route('artist.application.create') }}" class="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-green text-white font-semibold rounded-lg hover:bg-green-600 transition-all">
                        <span class="material-symbols-outlined text-lg">add</span>
                        Become an Artist
                    </a>
                </div>
            </div>
            @endif
        </div>
    </div>

    {{-- Trending Music Section --}}
    @if(isset($trendingSongs) && count($trendingSongs) > 0)
    <div class="glass-panel rounded-2xl p-6 border border-gray-200 dark:border-border-dark">
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span class="material-symbols-outlined text-orange-500">trending_up</span>
                Trending Now
            </h3>
            <a href="{{ route('frontend.trending') }}" class="text-xs font-medium text-gray-500 dark:text-text-secondary hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1">
                View All <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
            </a>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            @foreach($trendingSongs as $song)
            <div class="group cursor-pointer" onclick="window.dispatchEvent(new CustomEvent('play-track', { detail: { track: {{ json_encode($song) }} } }))">
                <div class="relative aspect-square rounded-xl overflow-hidden mb-2">
                    <img src="{{ $song['artwork_url'] ?? asset('images/default-song-artwork.svg') }}" 
                         alt="{{ $song['title'] }}"
                         class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span class="material-symbols-outlined text-white text-3xl">play_circle</span>
                    </div>
                </div>
                <h4 class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ $song['title'] }}</h4>
                <p class="text-xs text-gray-500 dark:text-text-secondary truncate">{{ $song['artist_name'] ?? 'Unknown' }}</p>
            </div>
            @endforeach
        </div>
    </div>
    @endif

    {{-- Recent Activity Section --}}
    @if(isset($recentActivities) && count($recentActivities) > 0)
    <div class="glass-panel rounded-2xl p-6 border border-gray-200 dark:border-border-dark">
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span class="material-symbols-outlined text-brand-blue">history</span>
                Recent Activity
            </h3>
        </div>
        <div class="space-y-3">
            @foreach($recentActivities as $activity)
            <div class="flex items-center gap-3 p-3 glass-card rounded-xl">
                <div class="w-10 h-10 rounded-full bg-{{ $activity['color'] ?? 'gray' }}-500/20 flex items-center justify-center text-{{ $activity['color'] ?? 'gray' }}-500">
                    <span class="material-symbols-outlined text-[18px]">{{ $activity['icon'] ?? 'info' }}</span>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm text-gray-900 dark:text-white">{{ $activity['description'] }}</p>
                    <p class="text-xs text-gray-500 dark:text-text-secondary">{{ $activity['time'] }}</p>
                </div>
            </div>
            @endforeach
        </div>
    </div>
    @endif
</div>
@endsection
