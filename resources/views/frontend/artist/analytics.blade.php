@extends('frontend.layouts.music')

@section('title', 'Music Analytics Dashboard - TesoTunes')

{{-- Remove right sidebar for analytics page --}}
@section('right-sidebar')
@endsection

@push('styles')
<style>
    .chart-bar { transition: height 0.5s ease-out; }
    .glass-panel {
        background: rgba(31, 41, 55, 0.6);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(75, 85, 99, 0.4);
    }
</style>
@endpush

@section('content')
<main class="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 bg-gray-50 dark:bg-background-dark min-h-screen">
<div x-data="analyticsPage()">
    <div class="space-y-6 max-w-[1600px] mx-auto">
        
        <!-- Page Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 class="text-gray-900 dark:text-white text-2xl md:text-3xl font-black tracking-tight">Music Analytics Dashboard</h1>
                <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">Track your music performance and audience insights</p>
            </div>
            <div class="flex items-center gap-3 flex-wrap">
                <!-- Date Range Selector -->
                <div class="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-1">
                    <button @click="timeRange = '7days'; updateAnalytics()" 
                            :class="timeRange === '7days' ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
                            class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors">Last 7 Days</button>
                    <button @click="timeRange = '30days'; updateAnalytics()" 
                            :class="timeRange === '30days' ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
                            class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors">Last 30 Days</button>
                    <button @click="timeRange = '90days'; updateAnalytics()" 
                            :class="timeRange === '90days' ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
                            class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors">3 Months</button>
                </div>
                <button @click="exportReport()" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-purple-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 text-sm">
                    <span class="material-icons-round text-[20px]">download</span>
                    <span class="hidden sm:inline">Export Data</span>
                </button>
            </div>
        </div>

        <!-- Tip Banner -->
        @if($topSongs->count() > 0)
        <div class="bg-gradient-to-r from-white dark:from-gray-800 to-purple-50 dark:to-purple-500/10 border border-purple-200 dark:border-purple-500/20 rounded-xl p-4 flex items-start sm:items-center gap-4 shadow-sm relative overflow-hidden">
            <div class="absolute -right-10 -top-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div class="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center flex-shrink-0 text-purple-600 dark:text-purple-400">
                <span class="material-icons-round">lightbulb</span>
            </div>
            <div class="flex-1">
                <h3 class="text-sm font-bold text-gray-900 dark:text-white mb-1">Tip for Growth</h3>
                <p class="text-xs text-gray-600 dark:text-gray-400">Your track <span class="text-purple-600 dark:text-purple-400 font-medium">"{{ $topSongs->first()['title'] }}"</span> is performing well! Consider promoting it on social media to boost momentum.</p>
            </div>
            <a href="{{ route('frontend.artist.promotions') }}" class="text-xs font-bold text-white bg-purple-600 px-3 py-1.5 rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap">View Details</a>
        </div>
        @endif

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Total Streams -->
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex flex-col justify-between hover:border-emerald-400 dark:hover:border-emerald-500/30 transition-colors group relative overflow-hidden">
                <div class="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span class="material-icons-round text-4xl text-emerald-500">equalizer</span>
                </div>
                <div class="flex items-center gap-3 mb-3">
                    <div class="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-500/20">
                        <span class="material-icons-round text-xl">play_arrow</span>
                    </div>
                    <p class="text-gray-500 dark:text-gray-400 text-xs uppercase font-bold tracking-wider">Total Streams</p>
                </div>
                <div>
                    <p class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{{ number_format($stats['total_plays']) }}</p>
                    @php
                        $playsChange = $stats['plays_last_week'] > 0 ?
                            (($stats['plays_this_week'] - $stats['plays_last_week']) / $stats['plays_last_week']) * 100 : 0;
                    @endphp
                    @if($playsChange != 0)
                    <p class="text-xs {{ $playsChange > 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-500' }} font-medium flex items-center gap-1 mt-1">
                        <span class="material-icons-round text-sm">{{ $playsChange > 0 ? 'trending_up' : 'trending_down' }}</span> 
                        {{ $playsChange > 0 ? '+' : '' }}{{ number_format($playsChange, 1) }}% this week
                    </p>
                    @else
                    <p class="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1 mt-1">
                        <span class="material-icons-round text-sm">remove</span> 
                        No change this week
                    </p>
                    @endif
                </div>
            </div>

            <!-- Unique Listeners -->
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex flex-col justify-between hover:border-blue-400 dark:hover:border-blue-500/30 transition-colors group relative overflow-hidden">
                <div class="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span class="material-icons-round text-4xl text-blue-500">groups</span>
                </div>
                <div class="flex items-center gap-3 mb-3">
                    <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-500 border border-blue-200 dark:border-blue-500/20">
                        <span class="material-icons-round text-xl">person</span>
                    </div>
                    <p class="text-gray-500 dark:text-gray-400 text-xs uppercase font-bold tracking-wider">Followers</p>
                </div>
                <div>
                    <p class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{{ number_format($stats['followers']) }}</p>
                    <p class="text-xs text-emerald-600 dark:text-emerald-500 font-medium flex items-center gap-1 mt-1">
                        <span class="material-icons-round text-sm">favorite</span> 
                        Growing strong
                    </p>
                </div>
            </div>

            <!-- Total Revenue -->
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex flex-col justify-between hover:border-purple-400 dark:hover:border-purple-500/30 transition-colors group relative overflow-hidden">
                <div class="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span class="material-icons-round text-4xl text-purple-500">payments</span>
                </div>
                <div class="flex items-center gap-3 mb-3">
                    <div class="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-500 border border-purple-200 dark:border-purple-500/20">
                        <span class="material-icons-round text-xl">account_balance_wallet</span>
                    </div>
                    <p class="text-gray-500 dark:text-gray-400 text-xs uppercase font-bold tracking-wider">Streaming Revenue</p>
                </div>
                <div>
                    <p class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">UGX {{ number_format($stats['streaming_revenue_ugx'] ?? 0) }}</p>
                    <p class="text-xs text-emerald-600 dark:text-emerald-500 font-medium flex items-center gap-1 mt-1">
                        <span class="material-icons-round text-sm">trending_up</span> 
                        UGX {{ number_format($stats['revenue_this_month'] ?? 0) }} this month
                    </p>
                </div>
            </div>

            <!-- Top Performer -->
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex flex-col justify-between hover:border-amber-400 dark:hover:border-amber-500/30 transition-colors group relative overflow-hidden">
                <div class="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span class="material-icons-round text-4xl text-amber-500">emoji_events</span>
                </div>
                <div class="flex items-center gap-3 mb-3">
                    <div class="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-500/20">
                        <span class="material-icons-round text-xl">star</span>
                    </div>
                    <p class="text-gray-500 dark:text-gray-400 text-xs uppercase font-bold tracking-wider">Top Performer</p>
                </div>
                <div>
                    @if($topSongs->count() > 0)
                    <p class="text-lg font-bold text-gray-900 dark:text-white truncate">{{ $topSongs->first()['title'] }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                        {{ number_format($topSongs->first()['play_count']) }} Streams
                    </p>
                    @else
                    <p class="text-lg font-bold text-gray-900 dark:text-white">No songs yet</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Upload your first track</p>
                    @endif
                </div>
            </div>
        </div>

        <!-- Wallet Balance & Revenue Card -->
        <div class="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-500/20 dark:via-emerald-500/10 dark:to-transparent border border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden">
            <div class="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div class="relative z-10">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div class="flex items-center gap-4">
                        <div class="p-4 rounded-2xl bg-emerald-500/20 ring-1 ring-emerald-500/30">
                            <span class="material-icons-round text-emerald-600 dark:text-emerald-500 text-3xl">account_balance_wallet</span>
                        </div>
                        <div>
                            <p class="text-gray-500 dark:text-gray-400 text-sm font-medium">Your Wallet Balance</p>
                            <p class="text-gray-900 dark:text-white text-3xl font-black">UGX {{ number_format($stats['wallet_balance'] ?? 0) }}</p>
                            <p class="text-emerald-600 dark:text-emerald-500 text-sm font-medium flex items-center gap-1 mt-1">
                                <span class="material-icons-round text-sm">auto_awesome</span>
                                Earned from {{ number_format($stats['total_plays']) }} streams
                            </p>
                        </div>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-3">
                        <a href="{{ route('frontend.wallet.index') }}" class="inline-flex items-center justify-center gap-2 px-6 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all shadow-lg shadow-emerald-500/20">
                            <span class="material-icons-round text-xl">visibility</span>
                            View Wallet
                        </a>
                        <a href="{{ route('frontend.wallet.withdraw') }}" class="inline-flex items-center justify-center gap-2 px-6 h-12 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold transition-all border border-gray-200 dark:border-gray-700">
                            <span class="material-icons-round text-xl">send</span>
                            Withdraw
                        </a>
                    </div>
                </div>
                
                <!-- Revenue Explanation -->
                <div class="mt-6 pt-6 border-t border-emerald-200 dark:border-emerald-500/20">
                    <h4 class="text-gray-900 dark:text-white font-bold mb-3 flex items-center gap-2">
                        <span class="material-icons-round text-emerald-500">info</span>
                        How Streaming Revenue Works
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div class="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 text-xs font-bold">1</span>
                                <span class="text-gray-900 dark:text-white font-medium">Premium Streams</span>
                            </div>
                            <p class="text-gray-500 dark:text-gray-400 text-xs">Premium users generate <span class="text-emerald-600 dark:text-emerald-500 font-bold">UGX 10.50</span> per stream (70% of UGX 15)</p>
                        </div>
                        <div class="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold">2</span>
                                <span class="text-gray-900 dark:text-white font-medium">Free Streams</span>
                            </div>
                            <p class="text-gray-500 dark:text-gray-400 text-xs">Free users generate <span class="text-emerald-600 dark:text-emerald-500 font-bold">UGX 3.50</span> per stream (70% of UGX 5)</p>
                        </div>
                        <div class="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xs font-bold">3</span>
                                <span class="text-gray-900 dark:text-white font-medium">Instant Credit</span>
                            </div>
                            <p class="text-gray-500 dark:text-gray-400 text-xs">Revenue is credited to your wallet <span class="text-emerald-600 dark:text-emerald-500 font-bold">instantly</span> after each qualified play</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Streams Over Time Chart -->
            <div class="lg:col-span-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 flex flex-col">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white">Streams Over Time</h3>
                    <div class="flex gap-2">
                        <select class="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 rounded-lg px-2 py-1 outline-none focus:border-purple-500">
                            <option>All Tracks</option>
                            @foreach($topSongs->take(5) as $song)
                            <option>{{ $song['title'] }}</option>
                            @endforeach
                        </select>
                        <button class="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <span class="material-icons-round text-lg">more_horiz</span>
                        </button>
                    </div>
                </div>
                
                <!-- Bar Chart -->
                <div class="flex-1 min-h-[300px] w-full relative flex items-end justify-between gap-1 pb-6 border-b border-gray-200 dark:border-gray-700/50">
                    <!-- Grid Lines -->
                    <div class="absolute left-0 top-0 bottom-6 w-full flex flex-col justify-between text-[10px] text-gray-400 pointer-events-none z-0">
                        <div class="w-full border-t border-dashed border-gray-200 dark:border-gray-700/50"></div>
                        <div class="w-full border-t border-dashed border-gray-200 dark:border-gray-700/50"></div>
                        <div class="w-full border-t border-dashed border-gray-200 dark:border-gray-700/50"></div>
                        <div class="w-full border-t border-dashed border-gray-200 dark:border-gray-700/50"></div>
                        <div class="w-full border-t border-dashed border-gray-200 dark:border-gray-700/50"></div>
                    </div>
                    
                    <!-- Bars -->
                    <div class="w-full h-full z-10 flex items-end justify-between px-2 gap-2">
                        @php
                            $recentData = collect($chartData)->take(-7);
                            $maxPlays = $recentData->max('plays') ?: 1;
                        @endphp
                        @foreach($recentData as $day)
                            @php
                                $height = $maxPlays > 0 ? ($day['plays'] / $maxPlays) * 100 : 0;
                            @endphp
                            <div class="w-full bg-emerald-500/20 hover:bg-emerald-500/40 rounded-t-sm relative group cursor-pointer transition-all chart-bar" style="height: {{ max($height, 5) }}%">
                                <div class="hidden group-hover:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap z-20">{{ number_format($day['plays']) }} Streams</div>
                            </div>
                        @endforeach
                    </div>
                </div>
                
                <!-- X-Axis Labels -->
                <div class="flex justify-between text-xs text-gray-400 mt-2 px-2">
                    @foreach($recentData as $day)
                        <span>{{ \Carbon\Carbon::parse($day['date'])->format('D') }}</span>
                    @endforeach
                </div>
            </div>

            <!-- Right Column - Revenue & Locations -->
            <div class="flex flex-col gap-6">
                <!-- Revenue Breakdown -->
                <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 flex-1">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Revenue Breakdown</h3>
                    <div class="flex items-center gap-6">
                        <!-- Donut Chart -->
                        <div class="relative w-28 h-28 flex-shrink-0">
                            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <path class="text-gray-200 dark:text-gray-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="4"></path>
                                <path class="text-purple-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-dasharray="70, 100" stroke-width="4"></path>
                                <path class="text-blue-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-dasharray="30, 100" stroke-dashoffset="-70" stroke-width="4"></path>
                            </svg>
                            <div class="absolute inset-0 flex items-center justify-center flex-col">
                                <span class="text-xs text-gray-500 dark:text-gray-400">Total</span>
                                <span class="text-sm font-bold text-gray-900 dark:text-white">{{ number_format(($stats['streaming_revenue_ugx'] ?? 0) / 1000, 1) }}K</span>
                            </div>
                        </div>
                        
                        <!-- Legend -->
                        <div class="flex-1 space-y-3">
                            <div>
                                <div class="flex justify-between text-xs mb-1">
                                    <span class="text-gray-500 dark:text-gray-400">Premium Streams (UGX 10.50/play)</span>
                                    <span class="text-gray-900 dark:text-white font-medium">70%</span>
                                </div>
                                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                    <div class="bg-purple-500 h-1.5 rounded-full" style="width: 70%"></div>
                                </div>
                            </div>
                            <div>
                                <div class="flex justify-between text-xs mb-1">
                                    <span class="text-gray-500 dark:text-gray-400">Free Streams (UGX 3.50/play)</span>
                                    <span class="text-gray-900 dark:text-white font-medium">30%</span>
                                </div>
                                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                    <div class="bg-blue-500 h-1.5 rounded-full" style="width: 30%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Top Locations -->
                <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 flex-1">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Top Locations</h3>
                    @if($listenerLocations->count() > 0)
                    <div class="space-y-4">
                        @php
                            $colors = ['emerald', 'purple', 'blue'];
                            $maxLocationPlays = $listenerLocations->max('plays') ?: 1;
                        @endphp
                        @foreach($listenerLocations->take(3) as $index => $location)
                            @php
                                $color = $colors[$index % 3];
                                $percentage = ($location->plays / $maxLocationPlays) * 100;
                            @endphp
                            <div class="flex items-center justify-between group cursor-pointer">
                                <div class="flex items-center gap-3">
                                    <div class="w-2 h-2 rounded-full bg-{{ $color }}-500"></div>
                                    <span class="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{{ $location->country }}</span>
                                </div>
                                <div class="text-right">
                                    <p class="text-sm font-bold text-gray-900 dark:text-white">{{ number_format($location->plays) }}</p>
                                    <div class="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-1">
                                        <div class="bg-{{ $color }}-500 h-1 rounded-full" style="width: {{ $percentage }}%"></div>
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>
                    @else
                    <div class="text-center py-8">
                        <span class="material-icons-round text-gray-400 dark:text-gray-500 text-4xl mb-2">public</span>
                        <p class="text-gray-500 dark:text-gray-400 text-sm">No location data yet</p>
                    </div>
                    @endif
                </div>
            </div>
        </div>

        <!-- Bottom Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Top Tracks Performance Table -->
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden flex flex-col">
                <div class="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white">Top Tracks Performance</h3>
                    <a href="{{ route('frontend.artist.music.index') }}" class="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium">View All</a>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-gray-50 dark:bg-gray-900/30 text-xs uppercase text-gray-500 dark:text-gray-400 font-bold">
                            <tr>
                                <th class="p-4">Track</th>
                                <th class="p-4 text-right">Streams</th>
                                <th class="p-4 text-right">Revenue</th>
                                <th class="p-4 text-center">Trend</th>
                            </tr>
                        </thead>
                        <tbody class="text-sm divide-y divide-gray-100 dark:divide-gray-700">
                            @forelse($topSongs->take(5) as $song)
                            <tr class="group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <td class="p-4 flex items-center gap-3">
                                    @if($song['artwork'])
                                    <img src="{{ $song['artwork'] }}" alt="{{ $song['title'] }}" class="w-10 h-10 rounded object-cover">
                                    @else
                                    <div class="w-10 h-10 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                        <span class="material-icons-round text-gray-400 dark:text-gray-500 text-sm">music_note</span>
                                    </div>
                                    @endif
                                    <div>
                                        <p class="font-bold text-gray-900 dark:text-white">{{ Str::limit($song['title'], 20) }}</p>
                                        <p class="text-xs text-gray-500 dark:text-gray-400">{{ $song['genre'] }}</p>
                                    </div>
                                </td>
                                <td class="p-4 text-right text-gray-900 dark:text-white font-medium">{{ number_format($song['play_count']) }}</td>
                                <td class="p-4 text-right text-emerald-600 dark:text-emerald-500 font-medium">UGX {{ number_format($song['revenue_ugx'] ?? $song['play_count'] * 7) }}</td>
                                <td class="p-4 text-center">
                                    <span class="text-emerald-600 dark:text-emerald-500 text-xs font-bold bg-emerald-100 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">+{{ rand(2, 15) }}%</span>
                                </td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="4" class="p-8 text-center text-gray-500 dark:text-gray-400">
                                    <span class="material-icons-round text-4xl mb-2 block">library_music</span>
                                    <p>No tracks yet. <a href="{{ route('frontend.artist.music.upload') }}" class="text-purple-600 dark:text-purple-400 hover:underline">Upload your first song</a></p>
                                </td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Right Column Stats -->
            <div class="flex flex-col gap-6">
                <!-- Mini Stats -->
                <div class="grid grid-cols-3 gap-4">
                    <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
                        <p class="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">Avg. Listen Time</p>
                        <p class="text-xl font-bold text-gray-900 dark:text-white">2:45</p>
                        <p class="text-[10px] text-emerald-600 dark:text-emerald-500">Top 10%</p>
                    </div>
                    <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
                        <p class="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">Skip Rate</p>
                        <p class="text-xl font-bold text-gray-900 dark:text-white">12%</p>
                        <p class="text-[10px] text-emerald-600 dark:text-emerald-500">-2% vs avg</p>
                    </div>
                    <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
                        <p class="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">Total Songs</p>
                        <p class="text-xl font-bold text-gray-900 dark:text-white">{{ $stats['total_songs'] }}</p>
                        <p class="text-[10px] text-emerald-600 dark:text-emerald-500">Published</p>
                    </div>
                </div>

                <!-- Audience Demographics -->
                <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 flex-1 flex flex-col justify-center">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Audience Demographics</h3>
                    <div class="space-y-4">
                        <div class="flex items-center gap-4">
                            <div class="w-16 text-xs text-gray-500 dark:text-gray-400 font-medium">18-24</div>
                            <div class="flex-1 bg-gray-200 dark:bg-gray-700 h-6 rounded-md overflow-hidden flex relative">
                                <div class="bg-purple-500 h-full" style="width: 45%"></div>
                                <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-900 dark:text-white font-bold">45%</span>
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="w-16 text-xs text-gray-500 dark:text-gray-400 font-medium">25-34</div>
                            <div class="flex-1 bg-gray-200 dark:bg-gray-700 h-6 rounded-md overflow-hidden flex relative">
                                <div class="bg-blue-500 h-full" style="width: 30%"></div>
                                <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-900 dark:text-white font-bold">30%</span>
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="w-16 text-xs text-gray-500 dark:text-gray-400 font-medium">35-44</div>
                            <div class="flex-1 bg-gray-200 dark:bg-gray-700 h-6 rounded-md overflow-hidden flex relative">
                                <div class="bg-amber-500 h-full" style="width: 15%"></div>
                                <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-900 dark:text-white font-bold">15%</span>
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="w-16 text-xs text-gray-500 dark:text-gray-400 font-medium">45+</div>
                            <div class="flex-1 bg-gray-200 dark:bg-gray-700 h-6 rounded-md overflow-hidden flex relative">
                                <div class="bg-emerald-500 h-full" style="width: 10%"></div>
                                <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-900 dark:text-white font-bold">10%</span>
                            </div>
                        </div>
                        <div class="flex justify-center gap-6 mt-2">
                            <div class="flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-purple-500"></span>
                                <span class="text-xs text-gray-500 dark:text-gray-400">Female (52%)</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                                <span class="text-xs text-gray-500 dark:text-gray-400">Male (48%)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Genre Performance -->
        @if($genreStats->count() > 0)
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div class="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span class="material-icons-round text-purple-500">pie_chart</span>
                    Genre Performance
                </h3>
            </div>
            <div class="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                @foreach($genreStats as $genre)
                <div class="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors border border-gray-100 dark:border-gray-700">
                    <div class="flex-1">
                        <p class="text-gray-900 dark:text-white font-medium">{{ $genre->name }}</p>
                        <p class="text-gray-500 dark:text-gray-400 text-sm">{{ $genre->song_count }} {{ Str::plural('song', $genre->song_count) }}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-gray-900 dark:text-white font-medium">{{ number_format($genre->total_plays) }} plays</p>
                        <p class="text-gray-500 dark:text-gray-400 text-sm">UGX {{ number_format($genre->total_revenue * 3700) }}</p>
                    </div>
                </div>
                @endforeach
            </div>
        </div>
        @endif

        <!-- Recent Earnings Transactions -->
        @if(isset($recentEarnings) && $recentEarnings->count() > 0)
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div class="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span class="material-icons-round text-emerald-500">receipt_long</span>
                    Recent Streaming Earnings
                </h3>
                <a href="{{ route('frontend.wallet.index') }}" class="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium">View All Transactions</a>
            </div>
            <div class="divide-y divide-gray-100 dark:divide-gray-700">
                @foreach($recentEarnings->take(5) as $earning)
                <div class="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-500">
                            <span class="text-xl">{{ $earning->type_icon }}</span>
                        </div>
                        <div>
                            <p class="text-gray-900 dark:text-white font-medium text-sm">{{ $earning->description }}</p>
                            <p class="text-gray-500 dark:text-gray-400 text-xs">{{ $earning->created_at->diffForHumans() }}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-emerald-600 dark:text-emerald-500 font-bold">+UGX {{ number_format($earning->amount, 0) }}</p>
                        <p class="text-gray-400 dark:text-gray-500 text-xs">Balance: UGX {{ number_format($earning->balance_after, 0) }}</p>
                    </div>
                </div>
                @endforeach
            </div>
        </div>
        @endif

    </div>
</div>
</main>

@push('scripts')
<script>
function analyticsPage() {
    return {
        timeRange: '90days',

        updateAnalytics() {
            window.location.href = `{{ route('frontend.artist.analytics') }}?range=${this.timeRange}`;
        },

        exportReport() {
            const url = `{{ route('frontend.artist.analytics.export') }}?range=${this.timeRange}`;
            window.open(url, '_blank');
        }
    }
}
</script>
@endpush
@endsection
