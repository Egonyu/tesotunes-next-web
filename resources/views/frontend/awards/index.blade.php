@extends('frontend.layouts.awards')

@section('title', 'TesoTunes Awards Dashboard')

@push('styles')
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
<style>
    body { font-family: 'Sora', sans-serif; }
    .material-symbols-outlined { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
    
    /* Light mode scrollbar */
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: #f1f1f1; }
    ::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #FFD700; }
    
    /* Dark mode scrollbar */
    .dark ::-webkit-scrollbar-track { background: #0D1117; }
    .dark ::-webkit-scrollbar-thumb { background: #30363D; }
    .dark ::-webkit-scrollbar-thumb:hover { background: #10B981; }
    
    /* Light mode glass panel */
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
    
    /* Dark mode glass panel */
    .dark .glass-panel {
        background: rgba(22, 27, 34, 0.7);
        border: 1px solid rgba(48, 54, 61, 0.5);
    }
    .dark .glass-card {
        background: rgba(30, 35, 45, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .gold-glow {
        box-shadow: 0 0 15px rgba(255, 215, 0, 0.15);
    }
    .ticker-wrap {
        width: 100%;
        overflow: hidden;
        height: 3rem;
        padding-left: 100%;
        box-sizing: content-box;
    }
    .ticker {
        display: inline-block;
        height: 3rem;
        line-height: 3rem;
        white-space: nowrap;
        padding-right: 100%;
        box-sizing: content-box;
        animation: ticker 30s linear infinite;
    }
    @keyframes ticker {
        0% { transform: translate3d(0, 0, 0); }
        100% { transform: translate3d(-100%, 0, 0); }
    }
</style>
@endpush

@section('content')
<div class="max-w-[1600px] mx-auto space-y-8">
    <!-- Hero Banner -->
    <div class="glass-panel rounded-2xl p-0 relative overflow-hidden group border-[#FFD700]/30">
        <div class="absolute inset-0 bg-gradient-to-r from-white dark:from-black via-white/80 dark:via-black/80 to-transparent z-10"></div>
        <img alt="Awards Background" class="absolute inset-0 w-full h-full object-cover opacity-40 dark:opacity-60 mix-blend-overlay group-hover:scale-105 transition-transform duration-1000" src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1600&h=400&fit=crop"/>
        <div class="relative z-20 p-8 md:p-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
            <div class="max-w-xl">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD700] text-black text-xs font-bold mb-4 shadow-[0_0_15px_rgba(255,215,0,0.4)]">
                    <span class="material-symbols-outlined text-[16px]">stars</span>
                    OFFICIAL {{ date('Y') }} AWARDS
                </div>
                <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">TesoTunes <span class="text-[#FFD700]">Music Awards</span></h1>
                <p class="text-lg text-gray-600 dark:text-gray-300 mb-6">Celebrating the rhythm of Africa. The biggest night in music is approaching fast.</p>
                <div class="flex gap-4">
                    @if($currentSeasons->count() > 0)
                        <a href="{{ route('frontend.awards.season', $currentSeasons->first()->id) }}" class="bg-[#10B981] hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-[#10B981]/20 transition-all hover:scale-105">
                            <span class="material-symbols-outlined">how_to_vote</span>
                            Cast Your Vote
                        </a>
                    @endif
                    <a href="{{ route('frontend.awards.categories') }}" class="glass-card hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 border border-gray-200 dark:border-white/20 transition-all">
                        <span class="material-symbols-outlined">info</span>
                        Event Details
                    </a>
                </div>
            </div>
            @if($currentSeasons->count() > 0 && $currentSeasons->first()->voting_end_at)
            <div class="bg-white/70 dark:bg-black/40 backdrop-blur-md border border-gray-200 dark:border-white/10 p-6 rounded-2xl min-w-[300px]">
                <p class="text-xs text-[#FFD700] font-bold uppercase tracking-wider mb-2 text-center">Voting Ends In</p>
                <div class="flex justify-center gap-4 text-center" x-data="countdown('{{ $currentSeasons->first()->voting_end_at->toIso8601String() }}')" x-init="startCountdown()">
                    <div>
                        <div class="text-3xl font-bold text-gray-900 dark:text-white font-mono bg-gray-100 dark:bg-white/5 rounded-lg p-2 min-w-[50px]" x-text="days">00</div>
                        <div class="text-[10px] text-gray-500 dark:text-gray-400 mt-1 uppercase">Days</div>
                    </div>
                    <div class="text-2xl font-bold text-gray-400 dark:text-white/30 pt-2">:</div>
                    <div>
                        <div class="text-3xl font-bold text-gray-900 dark:text-white font-mono bg-gray-100 dark:bg-white/5 rounded-lg p-2 min-w-[50px]" x-text="hours">00</div>
                        <div class="text-[10px] text-gray-500 dark:text-gray-400 mt-1 uppercase">Hrs</div>
                    </div>
                    <div class="text-2xl font-bold text-gray-400 dark:text-white/30 pt-2">:</div>
                    <div>
                        <div class="text-3xl font-bold text-gray-900 dark:text-white font-mono bg-gray-100 dark:bg-white/5 rounded-lg p-2 min-w-[50px]" x-text="minutes">00</div>
                        <div class="text-[10px] text-gray-500 dark:text-gray-400 mt-1 uppercase">Mins</div>
                    </div>
                </div>
            </div>
            @endif
        </div>
    </div>

    <!-- Live Activity Ticker -->
    @if($currentSeasons->count() > 0)
    <div class="glass-panel rounded-full py-2 px-4 border border-gray-200 dark:border-[#30363D] flex items-center overflow-hidden">
        <span class="bg-[#10B981]/20 text-[#10B981] text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap mr-4 flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span> LIVE
        </span>
        <div class="ticker-wrap">
            <div class="ticker text-sm text-gray-500 dark:text-[#7D8590]">
                <span class="mr-12"><strong class="text-gray-900 dark:text-white">@AfroBeatKing</strong> just voted in <span class="text-[#10B981]">Artist of the Year</span></span>
                <span class="mr-12"><strong class="text-gray-900 dark:text-white">@NaijaGroove</strong> just voted in <span class="text-[#10B981]">Best Female Artist</span></span>
                <span class="mr-12"><strong class="text-gray-900 dark:text-white">@MusicLover99</strong> just voted in <span class="text-[#10B981]">Song of the Year</span></span>
                <span class="mr-12"><strong class="text-gray-900 dark:text-white">@KampalaSound</strong> just voted in <span class="text-[#10B981]">Best East African Act</span></span>
                <span class="mr-12"><strong class="text-gray-900 dark:text-white">@SowetoVibes</strong> just voted in <span class="text-[#10B981]">Best Hip Hop</span></span>
            </div>
        </div>
    </div>
    @endif

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white/80 dark:bg-[#161B22]/50 rounded-xl p-5 border border-gray-200 dark:border-white/5 hover:border-[#FFD700]/30 transition-all hover:-translate-y-1 duration-300 group">
            <div class="flex justify-between items-start mb-4">
                <div class="p-2 bg-[#FFD700]/20 rounded-lg text-[#FFD700] group-hover:bg-[#FFD700] group-hover:text-black transition-colors">
                    <span class="material-symbols-outlined">how_to_vote</span>
                </div>
                <span class="text-xs font-medium text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded flex items-center">
                    +12.5k <span class="material-symbols-outlined text-[12px] ml-1">trending_up</span>
                </span>
            </div>
            <p class="text-gray-500 dark:text-[#7D8590] text-sm font-medium">Total Votes Cast</p>
            <h3 class="text-3xl font-bold text-gray-900 dark:text-white mt-1">{{ number_format($currentSeasons->sum('categories.nominations.votes_count') ?? 0) }}</h3>
        </div>

        <div class="bg-white/80 dark:bg-[#161B22]/50 rounded-xl p-5 border border-gray-200 dark:border-white/5 hover:border-[#10B981]/30 transition-all hover:-translate-y-1 duration-300 group">
            <div class="flex justify-between items-start mb-4">
                <div class="p-2 bg-[#10B981]/20 rounded-lg text-[#10B981] group-hover:bg-[#10B981] group-hover:text-white transition-colors">
                    <span class="material-symbols-outlined">groups</span>
                </div>
                <span class="text-xs font-medium text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded flex items-center">
                    +850 <span class="material-symbols-outlined text-[12px] ml-1">person_add</span>
                </span>
            </div>
            <p class="text-gray-500 dark:text-[#7D8590] text-sm font-medium">Active Participants</p>
            <h3 class="text-3xl font-bold text-gray-900 dark:text-white mt-1">845k</h3>
        </div>

        <div class="bg-white/80 dark:bg-[#161B22]/50 rounded-xl p-5 border border-gray-200 dark:border-white/5 hover:border-[#8A2BE2]/30 transition-all hover:-translate-y-1 duration-300 group">
            <div class="flex justify-between items-start mb-4">
                <div class="p-2 bg-[#8A2BE2]/20 rounded-lg text-[#8A2BE2] group-hover:bg-[#8A2BE2] group-hover:text-white transition-colors">
                    <span class="material-symbols-outlined">category</span>
                </div>
            </div>
            <p class="text-gray-500 dark:text-[#7D8590] text-sm font-medium">Award Categories</p>
            <h3 class="text-3xl font-bold text-gray-900 dark:text-white mt-1">{{ $currentSeasons->sum('categories_count') }}</h3>
        </div>

        <div class="bg-white/80 dark:bg-[#161B22]/50 rounded-xl p-5 border border-gray-200 dark:border-white/5 hover:border-blue-500/30 transition-all hover:-translate-y-1 duration-300 group">
            <div class="flex justify-between items-start mb-4">
                <div class="p-2 bg-blue-500/20 rounded-lg text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <span class="material-symbols-outlined">music_note</span>
                </div>
            </div>
            <p class="text-gray-500 dark:text-[#7D8590] text-sm font-medium">Nominated Artists</p>
            <h3 class="text-3xl font-bold text-gray-900 dark:text-white mt-1">{{ $currentSeasons->sum(fn($s) => $s->categories->sum(fn($c) => $c->nominations->count())) }}</h3>
        </div>
    </div>

    <!-- Current/Active Seasons - Featured Categories -->
    @if($currentSeasons->count() > 0)
    <div>
        <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span class="w-1 h-6 bg-[#FFD700] rounded-full"></span>
                Vote Now - Featured Categories
            </h2>
            <a class="text-sm text-[#10B981] hover:text-[#0d9668] dark:hover:text-white font-medium flex items-center gap-1 transition-colors" href="{{ route('frontend.awards.categories') }}">
                View All Categories <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
            </a>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @foreach($currentSeasons->first()->categories->take(6) as $category)
                <div class="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:border-[#FFD700]/50 transition-all">
                    <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span class="material-symbols-outlined text-8xl text-[#FFD700]">{{ $category->icon ?? 'emoji_events' }}</span>
                    </div>
                    <div class="relative z-10">
                        <div class="flex justify-between items-start mb-4">
                            <span class="px-2 py-1 bg-[#FFD700] text-black text-[10px] font-bold uppercase rounded">Top Tier</span>
                            <span class="text-[#10B981] text-xs font-bold flex items-center gap-1">
                                <span class="material-symbols-outlined text-[14px]">local_fire_department</span> Hot
                            </span>
                        </div>
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{{ $category->name }}</h3>
                        <p class="text-gray-500 dark:text-[#7D8590] text-xs mb-6">{{ Str::limit($category->description, 60) }}</p>
                        
                        @if($category->nominations->first())
                        <div class="bg-gray-100/50 dark:bg-black/30 rounded-xl p-3 mb-6 border border-gray-200 dark:border-white/5">
                            <p class="text-[10px] text-gray-500 dark:text-[#7D8590] uppercase mb-2">Current Leader</p>
                            <div class="flex items-center gap-3">
                                @if($category->nominations->first()->artist)
                                <img alt="Leader" class="w-10 h-10 rounded-full border-2 border-[#FFD700] object-cover" src="{{ $category->nominations->first()->artist->avatar_url ?? asset('images/default-avatar.svg') }}"/>
                                <div>
                                    <p class="text-sm font-bold text-gray-900 dark:text-white">{{ $category->nominations->first()->artist->name }}</p>
                                    <p class="text-[10px] text-[#FFD700]">{{ number_format($category->nominations->first()->votes_count ?? 0) }} Votes</p>
                                </div>
                                @elseif($category->nominations->first()->song)
                                <img alt="Leader" class="w-10 h-10 rounded-lg border border-gray-200 dark:border-white/10 object-cover" src="{{ $category->nominations->first()->song->cover_url ?? asset('images/default-song-artwork.svg') }}"/>
                                <div>
                                    <p class="text-sm font-bold text-gray-900 dark:text-white">{{ $category->nominations->first()->song->title }}</p>
                                    <p class="text-[10px] text-[#FFD700]">{{ number_format($category->nominations->first()->votes_count ?? 0) }} Votes</p>
                                </div>
                                @endif
                            </div>
                        </div>
                        @endif
                        
                        <a href="{{ route('frontend.awards.category', $category->slug) }}" class="block w-full py-3 rounded-xl bg-[#10B981] hover:bg-emerald-500 text-white font-bold text-sm transition-colors shadow-lg shadow-[#10B981]/10 text-center">
                            Vote Now
                        </a>
                    </div>
                </div>
            @endforeach
        </div>
    </div>
    @endif

    <!-- Past Winners & Live Trends Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 glass-panel rounded-2xl p-6 border border-gray-200 dark:border-[#30363D]">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span class="material-symbols-outlined text-[#10B981]">insights</span>
                    Live Voting Trends
                </h3>
                <div class="flex gap-2">
                    <span class="flex h-3 w-3">
                        <span class="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-[#10B981] opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-3 w-3 bg-[#10B981]"></span>
                    </span>
                    <span class="text-xs text-[#10B981] font-medium">Updating live</span>
                </div>
            </div>
            <div class="h-48 w-full flex items-end justify-between gap-3 px-2 pb-2 mb-6 border-b border-gray-200 dark:border-[#30363D]/50">
                <div class="w-full bg-gray-100 dark:bg-[#161B22] rounded-t-sm h-[30%] hover:bg-[#10B981]/30 transition-colors relative group">
                    <div class="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-black text-white text-[10px] py-1 px-2 rounded whitespace-nowrap">2k Votes</div>
                </div>
                <div class="w-full bg-gray-100 dark:bg-[#161B22] rounded-t-sm h-[45%] hover:bg-[#10B981]/30 transition-colors relative group">
                    <div class="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-black text-white text-[10px] py-1 px-2 rounded whitespace-nowrap">3.5k Votes</div>
                </div>
                <div class="w-full bg-gray-100 dark:bg-[#161B22] rounded-t-sm h-[35%] hover:bg-[#10B981]/30 transition-colors relative group">
                    <div class="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-black text-white text-[10px] py-1 px-2 rounded whitespace-nowrap">2.8k Votes</div>
                </div>
                <div class="w-full bg-gray-100 dark:bg-[#161B22] rounded-t-sm h-[60%] hover:bg-[#10B981]/30 transition-colors relative group">
                    <div class="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-black text-white text-[10px] py-1 px-2 rounded whitespace-nowrap">5.2k Votes</div>
                </div>
                <div class="w-full bg-gray-100 dark:bg-[#161B22] rounded-t-sm h-[50%] hover:bg-[#10B981]/30 transition-colors relative group">
                    <div class="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-black text-white text-[10px] py-1 px-2 rounded whitespace-nowrap">4.1k Votes</div>
                </div>
                <div class="w-full bg-gray-100 dark:bg-[#161B22] rounded-t-sm h-[75%] hover:bg-[#10B981]/30 transition-colors relative group">
                    <div class="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-black text-white text-[10px] py-1 px-2 rounded whitespace-nowrap">6.8k Votes</div>
                </div>
                <div class="w-full bg-gradient-to-t from-[#10B981] to-emerald-400 rounded-t-sm h-[90%] shadow-[0_0_10px_rgba(16,185,129,0.3)] relative group">
                    <div class="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-black text-white text-[10px] py-1 px-2 rounded whitespace-nowrap">8.5k Votes (Now)</div>
                </div>
            </div>
            <div class="space-y-3">
                @if($currentSeasons->count() > 0)
                    @foreach($currentSeasons->first()->categories->take(2) as $category)
                    <div class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-[#161B22]/50 border border-gray-200 dark:border-white/5">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700]">
                                <span class="material-symbols-outlined text-sm">emoji_events</span>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ $category->name }}</p>
                                <p class="text-xs text-gray-500 dark:text-[#7D8590]">Highest engagement in last hour</p>
                            </div>
                        </div>
                        <span class="text-[#10B981] font-bold text-sm">+24%</span>
                    </div>
                    @endforeach
                @endif
            </div>
        </div>

        <div class="glass-panel rounded-2xl p-6 border border-[#FFD700]/20 relative overflow-hidden">
            <div class="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/5 blur-3xl rounded-full pointer-events-none"></div>
            <div class="flex items-center justify-between mb-6 relative z-10">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">Hall of Fame</h3>
                <a href="{{ route('frontend.awards.winners') }}" class="p-1 text-[#FFD700] hover:bg-[#FFD700]/10 rounded-full transition-colors">
                    <span class="material-symbols-outlined">history</span>
                </a>
            </div>
            <div class="space-y-4 relative z-10">
                @foreach($pastSeasons->take(3) as $index => $season)
                    @php
                        $winner = $season->categories->first()?->nominations->sortByDesc('votes_count')->first();
                    @endphp
                    <div class="flex gap-4 items-center p-3 rounded-xl {{ $index === 0 ? 'bg-gradient-to-r from-[#FFD700]/10 to-transparent border border-[#FFD700]/10' : 'hover:bg-gray-100 dark:hover:bg-white/5 transition-colors' }}">
                        <div class="relative w-12 h-12 flex-shrink-0">
                            <div class="w-full h-full rounded-full {{ $index === 0 ? 'bg-white dark:bg-black border border-[#FFD700]/50' : 'bg-gray-100 dark:bg-[#161B22] border border-gray-200 dark:border-white/10' }} flex items-center justify-center">
                                <span class="material-symbols-outlined {{ $index === 0 ? 'text-[#FFD700] text-2xl' : 'text-gray-400 dark:text-[#7D8590] text-xl' }}">trophy</span>
                            </div>
                        </div>
                        <div>
                            <p class="text-xs {{ $index === 0 ? 'text-[#FFD700]' : 'text-gray-500 dark:text-[#7D8590]' }} font-bold uppercase mb-0.5">{{ $season->year }} Winner</p>
                            <h4 class="text-gray-900 dark:text-white font-bold text-sm">{{ $winner?->artist?->name ?? $winner?->song?->title ?? 'TBA' }}</h4>
                            <p class="text-[10px] text-gray-500 dark:text-[#7D8590]">{{ $season->categories->first()?->name ?? 'Artist of the Year' }}</p>
                        </div>
                    </div>
                @endforeach
                <a href="{{ route('frontend.awards.winners') }}" class="block w-full mt-2 py-2 text-xs font-bold text-[#FFD700] border border-[#FFD700]/30 rounded-lg hover:bg-[#FFD700] hover:text-black transition-colors text-center">
                    View Full History
                </a>
            </div>
        </div>
    </div>
    </div>

    <!-- Past Seasons -->
    @if($pastSeasons->count() > 0)
        <div class="mb-12">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <span class="material-symbols-outlined text-blue-400">verified</span>
                Past Winners
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                @foreach($pastSeasons as $season)
                    <a href="{{ route('frontend.awards.season', $season->id) }}" class="award-card group">
                        <div class="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-blue-500/50 h-full flex-col">
                            <div class="p-6 flex-1">
                                <div class="flex items-start justify-between mb-4">
                                    <div class="flex-1">
                                        <span class="inline-block px-3 py-1 bg-blue-600 rounded-full text-xs font-bold text-white mb-3">
                                            COMPLETED
                                        </span>
                                        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-400 transition-colors">
                                            {{ $season->name }}
                                        </h3>
                                        @if($season->year)
                                            <p class="text-blue-400 font-medium mb-2">{{ $season->year }}</p>
                                        @endif
                                    </div>
                                    <span class="material-symbols-outlined text-blue-400 text-3xl">verified</span>
                                </div>

                                <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                                    <span class="material-symbols-outlined text-[16px]">category</span>
                                    <span>{{ $season->categories_count }} Categories</span>
                                </div>
                            </div>

                            <div class="px-6 py-4 bg-gray-50 dark:bg-black/30 border-t border-gray-200 dark:border-gray-800">
                                <div class="flex items-center justify-between text-blue-400 group-hover:text-blue-300">
                                    <span class="text-sm font-medium">View Winners</span>
                                    <span class="material-symbols-outlined text-[20px]">arrow_forward</span>
                                </div>
                            </div>
                        </div>
                    </a>
                @endforeach
            </div>
        </div>
    @endif

    <!-- Upcoming Seasons -->
    @if($upcomingSeasons->count() > 0)
        <div class="mb-12">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <span class="material-symbols-outlined text-green-400">schedule</span>
                Coming Soon
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                @foreach($upcomingSeasons as $season)
                    <div class="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 p-6">
                        <span class="inline-block px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-xs font-bold text-gray-600 dark:text-gray-300 mb-3">
                            UPCOMING
                        </span>
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{{ $season->name }}</h3>
                        @if($season->year)
                            <p class="text-gray-500 dark:text-gray-400 mb-4">{{ $season->year }}</p>
                        @endif
                        <div class="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-sm">
                            <span class="material-symbols-outlined text-[16px]">schedule</span>
                            <span>Opens {{ $season->nominations_start_at ? $season->nominations_start_at->format('M j, Y') : 'TBA' }}</span>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>
    @endif

    <!-- Empty State -->
    @if($currentSeasons->count() == 0 && $pastSeasons->count() == 0 && $upcomingSeasons->count() == 0)
        <div class="text-center py-20">
            <div class="w-32 h-32 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-900 border-4 border-gray-200 dark:border-gray-800 flex items-center justify-center">
                <span class="material-symbols-outlined text-gray-400 dark:text-gray-600 text-6xl">emoji_events</span>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Award Seasons Yet</h3>
            <p class="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Award seasons will appear here once they're announced. Check back soon!
            </p>
        </div>
    @endif
</div>

@push('scripts')
<script>
    function countdown(endDate) {
        return {
            days: '00',
            hours: '00',
            minutes: '00',
            seconds: '00',
            
            startCountdown() {
                const end = new Date(endDate).getTime();
                
                const updateCountdown = () => {
                    const now = new Date().getTime();
                    const distance = end - now;
                    
                    if (distance < 0) {
                        this.days = '00';
                        this.hours = '00';
                        this.minutes = '00';
                        this.seconds = '00';
                        return;
                    }
                    
                    this.days = String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0');
                    this.hours = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
                    this.minutes = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
                    this.seconds = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0');
                };
                
                updateCountdown();
                setInterval(updateCountdown, 1000);
            }
        };
    }
</script>
@endpush
@endsection
