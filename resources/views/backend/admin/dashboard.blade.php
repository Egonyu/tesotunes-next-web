@extends('layouts.admin')

@section('title', 'Admin Dashboard')

@section('content')
<div class="dashboard-content">
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-6">
        <div>
            <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">Dashboard Overview</h1>
            <p class="text-slate-600 dark:text-navy-300 mt-1">Welcome back! Here's what's happening with your platform.</p>
        </div>
        <div class="flex items-center gap-3">
            <div class="flex items-center gap-2 px-3 py-2 bg-success/10 text-success rounded-lg">
                <div class="size-2 bg-success rounded-full animate-pulse"></div>
                <span class="text-sm font-medium">System Online</span>
            </div>
            <span class="text-sm text-slate-400 dark:text-navy-400">{{ now()->format('l, M j, Y H:i') }}</span>
        </div>
    </div>

    <!-- Main Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        <!-- Total Users Card -->
        <div class="card bg-gradient-to-br from-blue-500 to-blue-600 text-white p-5">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <p class="text-blue-100 text-sm font-medium">Total Users</p>
                    <h3 class="text-3xl font-bold mt-1">{{ number_format($stats['users']['total']) }}</h3>
                </div>
                <div class="p-3 bg-white/20 rounded-xl">
                    <svg class="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                </div>
            </div>
            <div class="flex items-center justify-between text-sm">
                <span class="text-blue-100">{{ $stats['users']['new_today'] }} new today</span>
                @if($growth['users']['direction'] === 'up')
                    <span class="flex items-center gap-1 text-green-200 font-medium">
                        <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        {{ $growth['users']['percentage'] }}%
                    </span>
                @else
                    <span class="text-blue-100">No change</span>
                @endif
            </div>
        </div>

        <!-- Total Tracks Card -->
        <div class="card bg-gradient-to-br from-green-500 to-green-600 text-white p-5">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <p class="text-green-100 text-sm font-medium">Total Tracks</p>
                    <h3 class="text-3xl font-bold mt-1">{{ number_format($stats['content']['total_tracks']) }}</h3>
                </div>
                <div class="p-3 bg-white/20 rounded-xl">
                    <svg class="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                </div>
            </div>
            <div class="flex items-center justify-between text-sm">
                <span class="text-green-100">{{ $stats['content']['new_today'] }} uploaded today</span>
                @if($growth['tracks']['direction'] === 'up')
                    <span class="flex items-center gap-1 text-green-200 font-medium">
                        <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        {{ $growth['tracks']['percentage'] }}%
                    </span>
                @else
                    <span class="text-green-100">No change</span>
                @endif
            </div>
        </div>

        <!-- Total Revenue Card -->
        <div class="card bg-gradient-to-br from-purple-500 to-purple-600 text-white p-5">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <p class="text-purple-100 text-sm font-medium">Total Revenue</p>
                    <h3 class="text-3xl font-bold mt-1">{{ number_format($stats['revenue']['total_earned']) }}</h3>
                </div>
                <div class="p-3 bg-white/20 rounded-xl">
                    <svg class="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
            <div class="flex items-center justify-between text-sm">
                <span class="text-purple-100">UGX {{ number_format($stats['revenue']['today']) }} today</span>
                @if($growth['revenue']['direction'] === 'up')
                    <span class="flex items-center gap-1 text-green-200 font-medium">
                        <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        {{ $growth['revenue']['percentage'] }}%
                    </span>
                @else
                    <span class="text-purple-100">No change</span>
                @endif
            </div>
        </div>

        <!-- Total Streams Card -->
        <div class="card bg-gradient-to-br from-orange-500 to-orange-600 text-white p-5">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <p class="text-orange-100 text-sm font-medium">Total Streams</p>
                    <h3 class="text-3xl font-bold mt-1">{{ number_format($stats['engagement']['total_streams']) }}</h3>
                </div>
                <div class="p-3 bg-white/20 rounded-xl">
                    <svg class="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
            <div class="flex items-center justify-between text-sm">
                <span class="text-orange-100">{{ number_format($stats['engagement']['streams_today']) }} today</span>
                @if($growth['streams']['direction'] === 'up')
                    <span class="flex items-center gap-1 text-green-200 font-medium">
                        <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        {{ $growth['streams']['percentage'] }}%
                    </span>
                @else
                    <span class="text-orange-100">No change</span>
                @endif
            </div>
        </div>
    </div>

    <!-- Secondary Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-6">
        <div class="card p-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-slate-600 dark:text-navy-300 text-sm">Artists</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50 mt-1">{{ number_format($stats['users']['total_artists']) }}</p>
                </div>
                <div class="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                    <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
            </div>
            <div class="mt-2 text-xs text-slate-500 dark:text-navy-400">
                {{ $stats['users']['verification_rate'] }}% verified
            </div>
        </div>

        <div class="card p-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-slate-600 dark:text-navy-300 text-sm">Albums</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50 mt-1">{{ number_format($stats['content']['total_albums']) }}</p>
                </div>
                <div class="p-2 bg-green-500/10 text-green-500 rounded-lg">
                    <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                </div>
            </div>
            <div class="mt-2 text-xs text-slate-500 dark:text-navy-400">
                Published content
            </div>
        </div>

        <div class="card p-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-slate-600 dark:text-navy-300 text-sm">Playlists</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50 mt-1">{{ number_format($stats['content']['total_playlists']) }}</p>
                </div>
                <div class="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                    <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                </div>
            </div>
            <div class="mt-2 text-xs text-slate-500 dark:text-navy-400">
                User collections
            </div>
        </div>

        <div class="card p-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-slate-600 dark:text-navy-300 text-sm">Pending</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50 mt-1">{{ $stats['content']['pending_review'] }}</p>
                </div>
                <div class="p-2 bg-warning/10 text-warning rounded-lg">
                    <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
            <div class="mt-2 text-xs text-slate-500 dark:text-navy-400">
                Awaiting review
            </div>
        </div>

        <div class="card p-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-slate-600 dark:text-navy-300 text-sm">Payouts</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50 mt-1">{{ $stats['payouts']['pending_count'] }}</p>
                </div>
                <div class="p-2 bg-info/10 text-info rounded-lg">
                    <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
            </div>
            <div class="mt-2 text-xs text-slate-500 dark:text-navy-400">
                UGX {{ number_format($stats['payouts']['pending_amount']) }}
            </div>
        </div>
    </div>

    <!-- Events & Awards Stats Row -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        <!-- Events -->
        <div class="card p-5">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <p class="text-slate-600 dark:text-navy-300 text-sm font-medium">Events</p>
                    <p class="text-3xl font-bold text-slate-800 dark:text-navy-50 mt-2">{{ $stats['events']['total'] }}</p>
                </div>
                <div class="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
                    <svg class="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
            </div>
            <div class="flex items-center justify-between">
                <span class="text-xs text-slate-500 dark:text-navy-400">{{ $stats['events']['upcoming'] }} upcoming</span>
                <a href="{{ route('admin.events.index') }}" class="text-xs text-primary hover:underline">View all →</a>
            </div>
        </div>

        <!-- Award Seasons -->
        <div class="card p-5">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <p class="text-slate-600 dark:text-navy-300 text-sm font-medium">Award Seasons</p>
                    <p class="text-3xl font-bold text-slate-800 dark:text-navy-50 mt-2">{{ $stats['awards']['total_seasons'] }}</p>
                </div>
                <div class="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                    <svg class="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                </div>
            </div>
            <div class="flex items-center justify-between">
                <span class="text-xs text-slate-500 dark:text-navy-400">
                    @if($stats['awards']['active_season'])
                        {{ $stats['awards']['active_season']->name }}
                    @else
                        No active season
                    @endif
                </span>
                <a href="{{ route('admin.awards.seasons.index') }}" class="text-xs text-primary hover:underline">Manage →</a>
            </div>
        </div>

        <!-- Nominations -->
        <div class="card p-5">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <p class="text-slate-600 dark:text-navy-300 text-sm font-medium">Nominations</p>
                    <p class="text-3xl font-bold text-slate-800 dark:text-navy-50 mt-2">{{ number_format($stats['awards']['total_nominations']) }}</p>
                </div>
                <div class="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
                    <svg class="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                </div>
            </div>
            <div class="flex items-center justify-between">
                <span class="text-xs text-slate-500 dark:text-navy-400">Active categories</span>
                <a href="{{ route('admin.awards.nominations.index') }}" class="text-xs text-primary hover:underline">Review →</a>
            </div>
        </div>

        <!-- Votes -->
        <div class="card p-5">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <p class="text-slate-600 dark:text-navy-300 text-sm font-medium">Award Votes</p>
                    <p class="text-3xl font-bold text-slate-800 dark:text-navy-50 mt-2">{{ number_format($stats['awards']['total_votes']) }}</p>
                </div>
                <div class="p-3 bg-cyan-500/10 text-cyan-500 rounded-xl">
                    <svg class="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
            <div class="flex items-center justify-between">
                <span class="text-xs text-slate-500 dark:text-navy-400">{{ number_format($stats['awards']['votes_this_month']) }} this month</span>
                <a href="{{ route('admin.awards.votes.analytics') }}" class="text-xs text-primary hover:underline">Analytics →</a>
            </div>
        </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
        <!-- Streams Chart -->
        <div class="card p-5">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-slate-800 dark:text-navy-50">Daily Streams</h2>
                <span class="text-xs text-slate-500 dark:text-navy-400">Last 7 days</span>
            </div>
            <div class="h-64" x-data="streamsChart(@js($chartData['daily_streams']))">
                <canvas x-ref="chart"></canvas>
            </div>
        </div>

        <!-- Revenue Chart -->
        <div class="card p-5">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-slate-800 dark:text-navy-50">Daily Revenue</h2>
                <span class="text-xs text-slate-500 dark:text-navy-400">Last 7 days</span>
            </div>
            <div class="h-64" x-data="revenueChart(@js($chartData['daily_revenue']))">
                <canvas x-ref="chart"></canvas>
            </div>
        </div>
    </div>

    <!-- Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
        <!-- Top Songs -->
        <div class="card p-5">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-slate-800 dark:text-navy-50">Top Tracks</h2>
                <a href="{{ route('admin.music.songs.index') }}" class="text-sm text-primary hover:underline">View All</a>
            </div>
            <div class="space-y-3">
                @forelse($topPerformers['songs']->take(5) as $song)
                    <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-navy-600 transition">
                        <div class="size-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded flex items-center justify-center text-white font-bold">
                            {{ $loop->iteration }}
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="font-medium text-slate-800 dark:text-navy-50 truncate">{{ $song->title }}</p>
                            <p class="text-sm text-slate-500 dark:text-navy-400 truncate">
                                {{ $song->artist->name ?? 'Unknown' }}
                            </p>
                        </div>
                        <div class="text-right">
                            <p class="text-sm font-medium text-slate-800 dark:text-navy-50">
                                {{ number_format($song->play_count) }}
                            </p>
                            <p class="text-xs text-slate-500 dark:text-navy-400">plays</p>
                        </div>
                    </div>
                @empty
                    <p class="text-center py-8 text-slate-400 dark:text-navy-400">No tracks yet</p>
                @endforelse
            </div>
        </div>

        <!-- Top Artists -->
        <div class="card p-5">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-slate-800 dark:text-navy-50">Top Artists</h2>
                <a href="{{ route('admin.music.artists.index') }}" class="text-sm text-primary hover:underline">View All</a>
            </div>
            <div class="space-y-3">
                @forelse($topPerformers['artists']->take(5) as $artist)
                    <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-navy-600 transition">
                        <div class="size-12 rounded-full overflow-hidden bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white font-bold">
                            {{ substr($artist->name ?? 'U', 0, 1) }}
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="font-medium text-slate-800 dark:text-navy-50 truncate">{{ $artist->name ?? 'Unknown' }}</p>
                            <p class="text-sm text-slate-500 dark:text-navy-400">
                                {{ $artist->songs_count }} tracks
                            </p>
                        </div>
                        <div class="text-right">
                            <p class="text-sm font-medium text-slate-800 dark:text-navy-50">
                                {{ number_format($artist->follower_count ?? 0) }}
                            </p>
                            <p class="text-xs text-slate-500 dark:text-navy-400">followers</p>
                        </div>
                    </div>
                @empty
                    <p class="text-center py-8 text-slate-400 dark:text-navy-400">No artists yet</p>
                @endforelse
            </div>
        </div>

        <!-- Recent Activity -->
        <div class="card p-5">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-slate-800 dark:text-navy-50">Recent Activity</h2>
            </div>
            <div class="space-y-3">
                @forelse($recentActivity as $activity)
                    <div class="flex gap-3 p-2">
                        <div class="flex-shrink-0 size-10 rounded-lg flex items-center justify-center
                            @if($activity['type'] === 'artist_registered') bg-success/10 text-success
                            @elseif($activity['type'] === 'track_uploaded') bg-info/10 text-info
                            @else bg-warning/10 text-warning
                            @endif
                        ">
                            @if($activity['type'] === 'artist_registered')
                                <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            @elseif($activity['type'] === 'track_uploaded')
                                <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                </svg>
                            @else
                                <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            @endif
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-slate-800 dark:text-navy-50">{{ $activity['title'] }}</p>
                            <p class="text-xs text-slate-500 dark:text-navy-400 truncate">{{ $activity['description'] }}</p>
                            <p class="text-xs text-slate-400 dark:text-navy-500 mt-1">
                                {{ $activity['timestamp']->diffForHumans() }}
                            </p>
                        </div>
                    </div>
                @empty
                    <p class="text-center py-8 text-slate-400 dark:text-navy-400">No recent activity</p>
                @endforelse
            </div>
        </div>
    </div>

    <!-- Pending Actions -->
    @if($pendingActions['songs']->count() > 0 || $pendingActions['verifications']->count() > 0 || $pendingActions['payouts']->count() > 0)
        <div class="card p-5 mb-6">
            <h2 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Pending Actions</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- Pending Songs -->
                @if($pendingActions['songs']->count() > 0)
                    <div>
                        <h3 class="text-sm font-medium text-slate-600 dark:text-navy-300 mb-3">Song Reviews</h3>
                        <div class="space-y-2">
                            @foreach($pendingActions['songs'] as $song)
                                <div class="p-3 bg-slate-50 dark:bg-navy-600 rounded-lg">
                                    <p class="text-sm font-medium text-slate-800 dark:text-navy-50 truncate">{{ $song->title }}</p>
                                    <p class="text-xs text-slate-500 dark:text-navy-400">{{ $song->artist->name ?? 'Unknown' }}</p>
                                    <a href="{{ route('admin.music.songs.show', $song) }}" class="text-xs text-primary hover:underline mt-1 inline-block">
                                        Review →
                                    </a>
                                </div>
                            @endforeach
                        </div>
                    </div>
                @endif

                <!-- Pending Verifications -->
                @if($pendingActions['verifications']->count() > 0)
                    <div>
                        <h3 class="text-sm font-medium text-slate-600 dark:text-navy-300 mb-3">Artist Verifications</h3>
                        <div class="space-y-2">
                            @foreach($pendingActions['verifications'] as $artist)
                                <div class="p-3 bg-slate-50 dark:bg-navy-600 rounded-lg">
                                    <p class="text-sm font-medium text-slate-800 dark:text-navy-50 truncate">{{ $artist->name ?? 'Unknown' }}</p>
                                    <p class="text-xs text-slate-500 dark:text-navy-400">Verification request</p>
                                    <a href="{{ route('admin.music.artists.show', $artist) }}" class="text-xs text-primary hover:underline mt-1 inline-block">
                                        Review →
                                    </a>
                                </div>
                            @endforeach
                        </div>
                    </div>
                @endif

                <!-- Pending Payouts -->
                @if($pendingActions['payouts']->count() > 0)
                    <div>
                        <h3 class="text-sm font-medium text-slate-600 dark:text-navy-300 mb-3">Payout Requests</h3>
                        <div class="space-y-2">
                            @foreach($pendingActions['payouts'] as $payout)
                                <div class="p-3 bg-slate-50 dark:bg-navy-600 rounded-lg">
                                    <p class="text-sm font-medium text-slate-800 dark:text-navy-50">UGX {{ number_format($payout->amount) }}</p>
                                    <p class="text-xs text-slate-500 dark:text-navy-400">{{ $payout->created_at->diffForHumans() }}</p>
                                    <a href="{{ route('admin.payments.index') }}" class="text-xs text-primary hover:underline mt-1 inline-block">
                                        Process →
                                    </a>
                                </div>
                            @endforeach
                        </div>
                    </div>
                @endif
            </div>
        </div>
    @endif

    <!-- System Health -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div class="card p-4">
            <div class="flex items-center gap-3">
                <div class="size-2 bg-success rounded-full"></div>
                <div class="flex-1">
                    <p class="text-sm font-medium text-slate-800 dark:text-navy-50">Database</p>
                    <p class="text-xs text-slate-500 dark:text-navy-400">{{ $systemHealth['database_size'] }}</p>
                </div>
                <span class="text-xs font-medium text-success">Online</span>
            </div>
        </div>

        <div class="card p-4">
            <div class="flex items-center gap-3">
                <div class="size-2 bg-success rounded-full"></div>
                <div class="flex-1">
                    <p class="text-sm font-medium text-slate-800 dark:text-navy-50">Storage</p>
                    <p class="text-xs text-slate-500 dark:text-navy-400">{{ $systemHealth['storage_used'] }}</p>
                </div>
                <span class="text-xs font-medium text-success">Online</span>
            </div>
        </div>

        <div class="card p-4">
            <div class="flex items-center gap-3">
                <div class="size-2 bg-success rounded-full"></div>
                <div class="flex-1">
                    <p class="text-sm font-medium text-slate-800 dark:text-navy-50">Cache</p>
                    <p class="text-xs text-slate-500 dark:text-navy-400">{{ ucfirst($systemHealth['cache_status']) }}</p>
                </div>
                <span class="text-xs font-medium text-success">Active</span>
            </div>
        </div>

        <div class="card p-4">
            <div class="flex items-center gap-3">
                <div class="size-2 bg-success rounded-full"></div>
                <div class="flex-1">
                    <p class="text-sm font-medium text-slate-800 dark:text-navy-50">Environment</p>
                    <p class="text-xs text-slate-500 dark:text-navy-400">{{ ucfirst(config('app.env')) }}</p>
                </div>
                <span class="text-xs font-medium text-success">{{ phpversion() }}</span>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<script>
    // Streams Chart Component
    document.addEventListener('alpine:init', () => {
        Alpine.data('streamsChart', (data) => ({
            init() {
                const ctx = this.$refs.chart.getContext('2d');
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: data.map(d => d.date),
                        datasets: [{
                            label: 'Streams',
                            data: data.map(d => d.count),
                            borderColor: 'rgb(59, 130, 246)',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            y: { beginAtZero: true }
                        }
                    }
                });
            }
        }));

        // Revenue Chart Component
        Alpine.data('revenueChart', (data) => ({
            init() {
                const ctx = this.$refs.chart.getContext('2d');
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: data.map(d => d.date),
                        datasets: [{
                            label: 'Revenue (UGX)',
                            data: data.map(d => d.amount),
                            backgroundColor: 'rgba(168, 85, 247, 0.8)',
                            borderRadius: 6
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            y: { beginAtZero: true }
                        }
                    }
                });
            }
        }));
    });
</script>
@endpush
@endsection
