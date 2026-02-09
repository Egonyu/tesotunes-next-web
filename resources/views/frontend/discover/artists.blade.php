@extends('layouts.app')

@section('left-sidebar')
    @include('frontend.partials.modern-left-sidebar')
@endsection

@section('title', 'Discover Artists - TesoTunes')

@push('styles')
<style>
    /* Light mode styles */
    .glass-panel {
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(0, 0, 0, 0.08);
    }
    .glass-card {
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(8px);
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
<div class="max-w-[1600px] mx-auto space-y-8">
    <!-- Hero Section -->
    <div class="glass-panel rounded-2xl p-8 relative overflow-hidden group">
        <div class="absolute -right-20 -top-20 w-96 h-96 bg-brand-green/10 rounded-full blur-3xl group-hover:bg-brand-green/20 transition-all duration-700"></div>
        <div class="relative z-10">
            <div class="flex flex-col md:flex-row md:items-end justify-between mb-8">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-1">Discover Artists</h1>
                    <p class="text-gray-500 dark:text-text-secondary">Find your next favorite artist and explore their music</p>
                </div>
                <div class="mt-4 md:mt-0 flex gap-2 flex-wrap">
                    <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/10 text-brand-green text-xs font-bold border border-brand-green/20">
                        <span class="material-symbols-outlined text-[14px]">groups</span>
                        {{ number_format($totalArtists) }} ARTISTS
                    </span>
                    <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/10 text-brand-purple text-xs font-bold border border-brand-purple/20">
                        <span class="w-2 h-2 rounded-full bg-brand-purple animate-pulse"></span>
                        +{{ number_format($newThisWeek) }} THIS WEEK
                    </span>
                </div>
            </div>
            
            <!-- Search Bar -->
            <form action="{{ route('frontend.search') }}" method="GET" class="max-w-2xl">
                <div class="relative">
                    <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                    <input type="text" name="q" placeholder="Search artists by name, genre, or location..."
                           class="w-full bg-white dark:bg-card-dark/50 border border-gray-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-green focus:border-transparent placeholder-gray-400 dark:placeholder-text-secondary text-sm transition-all">
                    <button type="submit" class="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-green hover:bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">
                        Search
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Quick Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white/80 dark:bg-card-dark/50 rounded-xl p-5 border border-gray-200 dark:border-white/5 hover:border-brand-green/30 transition-all hover:-translate-y-1 duration-300 relative overflow-hidden group">
            <div class="absolute top-0 right-0 p-3 opacity-10">
                <span class="material-symbols-outlined text-6xl text-brand-green">groups</span>
            </div>
            <div class="flex justify-between items-start mb-4 relative z-10">
                <div class="p-2 bg-brand-green/20 rounded-lg text-brand-green group-hover:bg-brand-green group-hover:text-white transition-colors">
                    <span class="material-symbols-outlined">groups</span>
                </div>
                <span class="text-xs font-medium text-brand-green bg-brand-green/10 px-2 py-0.5 rounded flex items-center">
                    Live <span class="w-1.5 h-1.5 rounded-full bg-brand-green ml-1 animate-pulse"></span>
                </span>
            </div>
            <p class="text-gray-500 dark:text-text-secondary text-sm font-medium">Total Artists</p>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ number_format($totalArtists) }}</h3>
        </div>

        <div class="bg-white/80 dark:bg-card-dark/50 rounded-xl p-5 border border-gray-200 dark:border-white/5 hover:border-brand-purple/30 transition-all hover:-translate-y-1 duration-300 relative overflow-hidden group">
            <div class="absolute top-0 right-0 p-3 opacity-10">
                <span class="material-symbols-outlined text-6xl text-brand-purple">trending_up</span>
            </div>
            <div class="flex justify-between items-start mb-4 relative z-10">
                <div class="p-2 bg-brand-purple/20 rounded-lg text-brand-purple group-hover:bg-brand-purple group-hover:text-white transition-colors">
                    <span class="material-symbols-outlined">trending_up</span>
                </div>
                <span class="text-xs font-medium text-brand-green bg-brand-green/10 px-2 py-0.5 rounded flex items-center">
                    +{{ number_format($newThisWeek) }} <span class="material-symbols-outlined text-[12px] ml-1">arrow_upward</span>
                </span>
            </div>
            <p class="text-gray-500 dark:text-text-secondary text-sm font-medium">New This Week</p>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ number_format($newThisWeek) }}</h3>
        </div>

        <div class="bg-white/80 dark:bg-card-dark/50 rounded-xl p-5 border border-gray-200 dark:border-white/5 hover:border-brand-blue/30 transition-all hover:-translate-y-1 duration-300 relative overflow-hidden group">
            <div class="absolute top-0 right-0 p-3 opacity-10">
                <span class="material-symbols-outlined text-6xl text-brand-blue">verified</span>
            </div>
            <div class="flex justify-between items-start mb-4 relative z-10">
                <div class="p-2 bg-brand-blue/20 rounded-lg text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
                    <span class="material-symbols-outlined">verified</span>
                </div>
            </div>
            <p class="text-gray-500 dark:text-text-secondary text-sm font-medium">Verified Artists</p>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ $featuredArtists->count() }}</h3>
        </div>

        <div class="bg-white/80 dark:bg-card-dark/50 rounded-xl p-5 border border-gray-200 dark:border-white/5 hover:border-brand-orange/30 transition-all hover:-translate-y-1 duration-300 relative overflow-hidden group">
            <div class="absolute top-0 right-0 p-3 opacity-10">
                <span class="material-symbols-outlined text-6xl text-brand-orange">local_activity</span>
            </div>
            <div class="flex justify-between items-start mb-4 relative z-10">
                <div class="p-2 bg-brand-orange/20 rounded-lg text-brand-orange group-hover:bg-brand-orange group-hover:text-white transition-colors">
                    <span class="material-symbols-outlined">local_activity</span>
                </div>
            </div>
            <p class="text-gray-500 dark:text-text-secondary text-sm font-medium">Active Monthly</p>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ number_format($activeMonthly) }}</h3>
        </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="xl:col-span-2 space-y-8">
            <!-- Featured Artists -->
            <div class="glass-panel rounded-2xl p-6 border border-gray-200 dark:border-border-dark">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span class="material-symbols-outlined text-brand-green">star</span>
                        Featured Artists
                    </h2>
                    <span class="text-xs font-medium text-brand-green bg-brand-green/10 px-2 py-1 rounded border border-brand-green/20">
                        Verified
                    </span>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    @forelse($featuredArtists as $artist)
                        <a href="{{ route('frontend.artist.show', $artist) }}" class="glass-card p-4 rounded-xl text-center hover:bg-gray-100 dark:hover:bg-card-dark transition-all group cursor-pointer">
                            <div class="relative mb-3">
                                <div class="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-brand-green to-emerald-600 flex items-center justify-center overflow-hidden ring-2 ring-brand-green/30 group-hover:ring-brand-green/60 transition-all">
                                    <img src="{{ $artist->avatar_url }}" alt="{{ $artist->stage_name }}" class="w-full h-full object-cover rounded-full">
                                </div>
                                @if($artist->is_verified)
                                <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-brand-green text-white p-0.5 rounded-full">
                                    <span class="material-symbols-outlined text-[12px]">verified</span>
                                </div>
                                @endif
                            </div>
                            <h3 class="font-bold text-gray-900 dark:text-white text-sm truncate">{{ $artist->stage_name }}</h3>
                            <p class="text-gray-500 dark:text-text-secondary text-xs">{{ number_format($artist->follower_count ?? 0) }} followers</p>
                            <p class="text-gray-400 dark:text-text-secondary/70 text-[10px] mt-1">{{ number_format($artist->songs_sum_play_count ?? $artist->total_plays ?? 0) }} plays</p>
                        </a>
                    @empty
                        <div class="col-span-full text-center py-8 text-gray-500 dark:text-text-secondary">
                            <span class="material-symbols-outlined text-4xl mb-2 block opacity-50">groups</span>
                            <p>No featured artists available</p>
                        </div>
                    @endforelse
                </div>
            </div>

            <!-- Rising Artists -->
            <div class="glass-panel rounded-2xl p-6 border border-brand-purple/20">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span class="material-symbols-outlined text-brand-purple">rocket_launch</span>
                        Rising Artists
                    </h2>
                    <span class="text-xs font-medium text-brand-purple bg-brand-purple/10 px-2 py-1 rounded border border-brand-purple/20 flex items-center gap-1">
                        <span class="material-symbols-outlined text-[12px]">local_fire_department</span> Hot
                    </span>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    @forelse($risingArtists as $artist)
                        <a href="{{ route('frontend.artist.show', $artist) }}" class="glass-card p-4 rounded-xl text-center hover:bg-gray-100 dark:hover:bg-card-dark transition-all group cursor-pointer border-transparent hover:border-brand-purple/30">
                            <div class="relative mb-3">
                                <div class="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-brand-purple to-pink-600 flex items-center justify-center overflow-hidden">
                                    <img src="{{ $artist->avatar_url }}" alt="{{ $artist->stage_name }}" class="w-full h-full object-cover rounded-full">
                                </div>
                                <div class="absolute -top-1 -right-1 bg-brand-purple text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                    NEW
                                </div>
                            </div>
                            <h3 class="font-bold text-gray-900 dark:text-white text-sm truncate">{{ $artist->stage_name }}</h3>
                            <p class="text-gray-500 dark:text-text-secondary text-xs">{{ number_format($artist->follower_count ?? 0) }} followers</p>
                            <p class="text-gray-400 dark:text-text-secondary/70 text-[10px] mt-1">{{ number_format($artist->songs_sum_play_count ?? $artist->total_plays ?? 0) }} plays</p>
                        </a>
                    @empty
                        <div class="col-span-full text-center py-8 text-gray-500 dark:text-text-secondary">
                            <span class="material-symbols-outlined text-4xl mb-2 block opacity-50">groups</span>
                            <p>No rising artists available</p>
                        </div>
                    @endforelse
                </div>
            </div>

            <!-- All Artists -->
            <div class="glass-panel rounded-2xl p-6 border border-gray-200 dark:border-border-dark">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span class="material-symbols-outlined text-brand-blue">library_music</span>
                        All Artists
                    </h2>
                    <span class="text-xs text-gray-500 dark:text-text-secondary">
                        {{ $allArtists->total() }} total
                    </span>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    @forelse($allArtists as $artist)
                        <a href="{{ route('frontend.artist.show', $artist) }}" class="glass-card p-4 rounded-xl text-center hover:bg-gray-100 dark:hover:bg-card-dark transition-all group cursor-pointer">
                            <div class="relative mb-3">
                                <div class="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-gray-400 to-gray-600 dark:from-gray-600 dark:to-gray-800 flex items-center justify-center overflow-hidden group-hover:from-brand-blue group-hover:to-blue-600 transition-all">
                                    <img src="{{ $artist->avatar_url }}" alt="{{ $artist->stage_name }}" class="w-full h-full object-cover rounded-full">
                                </div>
                            </div>
                            <h3 class="font-bold text-gray-900 dark:text-white text-sm truncate">{{ $artist->stage_name }}</h3>
                            <p class="text-gray-500 dark:text-text-secondary text-xs">{{ number_format($artist->follower_count ?? 0) }} followers</p>
                            <p class="text-gray-400 dark:text-text-secondary/70 text-[10px] mt-1">{{ number_format($artist->songs_sum_play_count ?? $artist->total_plays ?? 0) }} plays</p>
                        </a>
                    @empty
                        <div class="col-span-full text-center py-8 text-gray-500 dark:text-text-secondary">
                            <span class="material-symbols-outlined text-4xl mb-2 block opacity-50">groups</span>
                            <p>No artists available</p>
                        </div>
                    @endforelse
                </div>

                <!-- Pagination -->
                @if($allArtists->hasPages())
                    <div class="flex justify-center mt-8 pt-6 border-t border-gray-200 dark:border-white/10">
                        {{ $allArtists->links() }}
                    </div>
                @endif
            </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-8">
            <!-- Browse by Genre -->
            <div class="glass-panel rounded-2xl p-6 border border-gray-200 dark:border-border-dark">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span class="material-symbols-outlined text-brand-orange">category</span>
                        Browse by Genre
                    </h3>
                </div>
                <div class="space-y-3">
                    @php
                        $genreColors = [
                            'from-pink-500 to-purple-500',
                            'from-yellow-500 to-red-500',
                            'from-red-500 to-orange-500',
                            'from-blue-500 to-cyan-500',
                            'from-purple-500 to-indigo-500',
                        ];
                    @endphp
                    @forelse($genreStats as $index => $genre)
                        <a href="{{ route('frontend.genres') }}" class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-card-dark/50 hover:bg-gray-100 dark:hover:bg-card-dark rounded-xl transition-colors border border-transparent hover:border-gray-200 dark:hover:border-white/10">
                            <div class="w-10 h-10 rounded-lg bg-gradient-to-br {{ $genreColors[$index % count($genreColors)] }} flex items-center justify-center flex-shrink-0">
                                <span class="material-symbols-outlined text-white text-sm">music_note</span>
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-gray-900 dark:text-white font-medium text-sm truncate">{{ $genre->genre ?: 'Other' }}</p>
                                <p class="text-gray-500 dark:text-text-secondary text-xs">{{ $genre->artist_count }} artists</p>
                            </div>
                            <span class="material-symbols-outlined text-gray-400 dark:text-text-secondary text-[16px]">chevron_right</span>
                        </a>
                    @empty
                        <p class="text-gray-500 dark:text-text-secondary text-sm text-center py-4">No genre data available</p>
                    @endforelse
                </div>
            </div>

            <!-- Platform Stats -->
            <div class="glass-panel rounded-2xl p-6 border border-brand-green/20 bg-gradient-to-br from-white dark:from-card-dark to-brand-green/5">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-brand-green">insights</span>
                    Platform Stats
                </h3>
                <div class="space-y-4">
                    <div class="flex items-center justify-between p-3 bg-white/50 dark:bg-white/5 rounded-lg">
                        <span class="text-gray-500 dark:text-text-secondary text-sm">Total Artists</span>
                        <span class="text-gray-900 dark:text-white font-bold">{{ number_format($totalArtists) }}</span>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-white/50 dark:bg-white/5 rounded-lg">
                        <span class="text-gray-500 dark:text-text-secondary text-sm">New This Week</span>
                        <span class="text-brand-green font-bold">+{{ number_format($newThisWeek) }}</span>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-white/50 dark:bg-white/5 rounded-lg">
                        <span class="text-gray-500 dark:text-text-secondary text-sm">Active Monthly</span>
                        <span class="text-gray-900 dark:text-white font-bold">{{ number_format($activeMonthly) }}</span>
                    </div>
                </div>
            </div>

            <!-- Discover More -->
            <div class="bg-gradient-to-br from-brand-purple/10 to-brand-blue/10 dark:from-brand-purple/20 dark:to-brand-blue/20 rounded-2xl p-6 border border-brand-purple/20">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-brand-purple">auto_awesome</span>
                    Discover More
                </h3>
                <div class="space-y-4">
                    <div class="flex items-start gap-3">
                        <span class="material-symbols-outlined text-brand-purple text-sm mt-0.5">favorite</span>
                        <div>
                            <p class="text-gray-900 dark:text-white text-sm font-medium">Follow Artists</p>
                            <p class="text-gray-500 dark:text-text-secondary text-xs">Get notified of new releases</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3">
                        <span class="material-symbols-outlined text-brand-blue text-sm mt-0.5">radio</span>
                        <div>
                            <p class="text-gray-900 dark:text-white text-sm font-medium">Artist Radio</p>
                            <p class="text-gray-500 dark:text-text-secondary text-xs">Stations based on your favorites</p>
                        </div>
                    </div>
                </div>
                @guest
                    <a href="{{ route('register') }}" class="inline-flex items-center gap-2 mt-4 text-brand-purple hover:text-purple-400 text-sm font-medium transition-colors">
                        Sign up to follow artists <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </a>
                @else
                    <a href="{{ route('frontend.dashboard') }}" class="inline-flex items-center gap-2 mt-4 text-brand-purple hover:text-purple-400 text-sm font-medium transition-colors">
                        View your library <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </a>
                @endauth
            </div>
        </div>
    </div>
</div>
@endsection
