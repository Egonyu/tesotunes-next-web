@extends('layouts.app')

@section('left-sidebar')
    @include('frontend.partials.modern-left-sidebar')
@endsection

@section('title', 'Top Charts & Trending')

@section('main-class', 'p-0 bg-gray-50 dark:bg-black')

@push('styles')
<link href="https://fonts.googleapis.com/css2?family=Epilogue:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
<style>
    .glass {
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(20px);
    }
    .dark .glass {
        background: rgba(0, 0, 0, 0.7);
    }
    .glass-card {
        background: rgba(0, 0, 0, 0.03);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(0, 0, 0, 0.08);
    }
    .dark .glass-card {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .hide-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
    .song-row:hover .row-play {
        display: flex;
    }
    .song-row .row-play {
        display: none;
    }
    .sticky-table-header {
        top: 0;
        position: sticky;
        z-index: 10;
    }
    .gold-gradient {
        background: linear-gradient(135deg, #FFD700 0%, #B8860B 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    .silver-gradient {
        background: linear-gradient(135deg, #C0C0C0 0%, #708090 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    .bronze-gradient {
        background: linear-gradient(135deg, #CD7F32 0%, #8B4513 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
</style>
@endpush

@section('content')
<div class="font-[Epilogue] text-gray-900 dark:text-white min-h-screen bg-gray-50 dark:bg-black -m-4 sm:-m-6 lg:-m-8 overflow-x-hidden">
    <!-- Hero Section -->
    <section class="relative pt-6 sm:pt-8 pb-8 sm:pb-12 px-4 sm:px-8 bg-gradient-to-b from-brand-green/20 via-gray-50 dark:via-black to-gray-50 dark:to-black min-h-[300px] sm:min-h-[400px] flex items-center">
        <div class="absolute top-0 left-0 w-full h-full opacity-30 mix-blend-overlay pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div class="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12 w-full">
            <div class="flex-1 text-center md:text-left">
                <div class="flex items-center justify-center md:justify-start gap-2 text-brand-green mb-4">
                    <span class="material-symbols-outlined font-fill text-sm">local_fire_department</span>
                    <span class="text-xs font-black uppercase tracking-[0.2em]">Trending Now</span>
                </div>
                <h2 class="text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter mb-4 text-gray-900 dark:text-white leading-[0.9]">Teso<br/><span class="text-brand-green">Global</span> Hits</h2>
                <p class="text-gray-600 dark:text-gray-400 text-base sm:text-lg max-w-xl mx-auto md:mx-0 mb-6 sm:mb-8">Soroti's finest are taking over. Experience the tracks that are defining the African soundscape this week.</p>
                <div class="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4">
                    @if($featuredSong)
                    <button onclick="playSong({{ $featuredSong->id }})" class="bg-brand-green text-black px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-2 text-sm sm:text-base">
                        <span class="material-symbols-outlined font-fill">play_arrow</span> Listen Now
                    </button>
                    @endif
                    <a href="#chart" class="bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-900 dark:text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold transition-all border border-gray-300 dark:border-white/10 text-sm sm:text-base">
                        View Full Chart
                    </a>
                </div>
            </div>
            @if($featuredSong)
            <div class="relative group hidden sm:block">
                <div class="absolute -inset-4 bg-brand-green/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div class="w-48 h-48 sm:w-56 sm:h-56 md:w-72 md:h-72 rounded-2xl overflow-hidden shadow-2xl relative border border-gray-200 dark:border-white/10">
                    <img alt="{{ $featuredSong->title }}" class="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700" src="{{ $featuredSong->artwork_url }}"/>
                    <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4 sm:p-6">
                        <p class="text-xs font-bold text-brand-green mb-1 uppercase tracking-wider">Top Viral Track</p>
                        <h3 class="text-xl sm:text-2xl font-bold text-white">{{ $featuredSong->title }}</h3>
                        <p class="text-white/80 text-sm">{{ $featuredSong->artist->stage_name ?? 'Unknown Artist' }}</p>
                    </div>
                </div>
            </div>
            @endif
        </div>
    </section>

    <!-- Sticky Filter Tabs -->
    <section class="px-4 sm:px-8 mb-8 sm:mb-12 sticky top-0 z-20 bg-white/80 dark:bg-black/80 backdrop-blur-xl py-3 sm:py-4 border-b border-gray-200 dark:border-white/5 overflow-x-auto">
        <div class="flex items-center gap-1.5 sm:gap-2 glass-card p-1 sm:p-1.5 rounded-full w-max min-w-full sm:min-w-0 sm:w-fit">
            <a href="{{ route('frontend.trending', ['period' => 'daily']) }}" class="px-4 sm:px-6 py-1.5 sm:py-2 rounded-full {{ $period == 'daily' ? 'bg-brand-green text-black' : 'text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white' }} font-bold text-xs sm:text-sm transition-all whitespace-nowrap">Daily Top 50</a>
            <a href="{{ route('frontend.trending', ['period' => 'weekly']) }}" class="px-4 sm:px-6 py-1.5 sm:py-2 rounded-full {{ $period == 'weekly' ? 'bg-brand-green text-black' : 'text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white' }} font-bold text-xs sm:text-sm transition-all whitespace-nowrap">Weekly Charts</a>
            <a href="{{ route('frontend.trending', ['period' => 'monthly']) }}" class="px-4 sm:px-6 py-1.5 sm:py-2 rounded-full {{ $period == 'monthly' ? 'bg-brand-green text-black' : 'text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white' }} font-bold text-xs sm:text-sm transition-all whitespace-nowrap">Monthly Hits</a>
            <a href="{{ route('frontend.trending', ['period' => 'viral']) }}" class="px-4 sm:px-6 py-1.5 sm:py-2 rounded-full {{ $period == 'viral' ? 'bg-brand-green text-black' : 'text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white' }} font-bold text-xs sm:text-sm transition-all whitespace-nowrap">Viral Teso</a>
        </div>
    </section>

    <!-- Top 3 Podium Section -->
    @if($topThree->count() >= 3)
    <section class="px-4 sm:px-8 mb-12 sm:mb-16 pt-4 sm:pt-8">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 items-center">
            <!-- #2 Position (LEFT on desktop, second on mobile) -->
            @php $song2 = $topThree[1]; @endphp
            <div class="glass-card p-4 sm:p-6 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors group relative flex flex-col items-center text-center cursor-pointer order-2 sm:order-1" onclick="playSong({{ $song2->id }})">
                <div class="absolute top-2 sm:top-3 right-3 sm:right-4 silver-gradient text-4xl sm:text-5xl font-black italic opacity-40">#2</div>
                <div class="relative mb-3 sm:mb-4 mt-2">
                    <div class="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-white/10 shadow-xl group-hover:border-gray-300 dark:group-hover:border-white/20 transition-all">
                        <img alt="{{ $song2->title }}" class="w-full h-full object-cover" src="{{ $song2->artwork_url }}"/>
                    </div>
                    <div class="absolute bottom-1.5 sm:bottom-2 right-1.5 sm:right-2 bg-white dark:bg-white/20 backdrop-blur-md rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shadow-lg">
                        <span class="material-symbols-outlined text-brand-green text-sm sm:text-base">trending_up</span>
                    </div>
                </div>
                <h3 class="text-lg sm:text-xl font-bold mb-1 text-gray-900 dark:text-white group-hover:text-brand-green transition-colors truncate max-w-full">{{ $song2->title }}</h3>
                <p class="text-gray-600 dark:text-white/60 text-xs sm:text-sm mb-3 sm:mb-4 truncate max-w-full">{{ $song2->artist->stage_name ?? 'Unknown Artist' }}</p>
                <div class="flex items-center gap-3 sm:gap-4 w-full justify-center">
                    <div class="text-center">
                        <p class="text-[9px] sm:text-[10px] text-gray-500 dark:text-white/40 uppercase font-bold tracking-widest">Plays</p>
                        <p class="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">{{ number_format($song2->play_count) }}</p>
                    </div>
                    <div class="w-px h-6 sm:h-8 bg-gray-200 dark:bg-white/10"></div>
                    <div class="text-center">
                        <p class="text-[9px] sm:text-[10px] text-gray-500 dark:text-white/40 uppercase font-bold tracking-widest">Peak</p>
                        <p class="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">2</p>
                    </div>
                </div>
            </div>

            <!-- #1 Position (MIDDLE - Slightly Larger) -->
            @php $song1 = $topThree[0]; @endphp
            <div class="glass-card p-5 sm:p-7 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all group relative flex flex-col items-center text-center border-brand-green/20 shadow-[0_0_50px_rgba(16,185,129,0.1)] cursor-pointer order-1 sm:order-2" onclick="playSong({{ $song1->id }})">
                <div class="absolute top-1 sm:top-2 right-3 sm:right-4 gold-gradient text-5xl sm:text-6xl font-black italic opacity-50">#1</div>
                <div class="relative mb-4 sm:mb-5 mt-2">
                    <div class="w-32 h-32 sm:w-44 sm:h-44 rounded-2xl overflow-hidden border-4 border-brand-green/30 shadow-2xl group-hover:border-brand-green/50 transition-all">
                        <img alt="{{ $song1->title }}" class="w-full h-full object-cover" src="{{ $song1->artwork_url }}"/>
                    </div>
                    <div class="absolute bottom-1.5 sm:bottom-2 right-1.5 sm:right-2 bg-brand-green rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shadow-lg">
                        <span class="material-symbols-outlined text-black font-bold text-lg sm:text-xl">trending_up</span>
                    </div>
                </div>
                <h3 class="text-xl sm:text-2xl font-black mb-1 text-brand-green truncate max-w-full">{{ $song1->title }}</h3>
                <p class="text-gray-600 dark:text-white/60 text-sm sm:text-base mb-4 sm:mb-5 truncate max-w-full">{{ $song1->artist->stage_name ?? 'Unknown Artist' }}</p>
                <div class="flex items-center gap-4 sm:gap-6 w-full justify-center">
                    <div class="text-center">
                        <p class="text-[9px] sm:text-[10px] text-gray-500 dark:text-white/40 uppercase font-bold tracking-widest">Plays</p>
                        <p class="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{{ number_format($song1->play_count) }}</p>
                    </div>
                    <div class="w-px h-8 sm:h-10 bg-gray-200 dark:bg-white/10"></div>
                    <div class="text-center">
                        <p class="text-[9px] sm:text-[10px] text-gray-500 dark:text-white/40 uppercase font-bold tracking-widest">Peak</p>
                        <p class="text-sm sm:text-base font-bold text-gray-900 dark:text-white">1</p>
                    </div>
                </div>
            </div>

            <!-- #3 Position (RIGHT on desktop, third on mobile) -->
            @php $song3 = $topThree[2]; @endphp
            <div class="glass-card p-4 sm:p-6 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors group relative flex flex-col items-center text-center cursor-pointer order-3" onclick="playSong({{ $song3->id }})">
                <div class="absolute top-2 sm:top-3 right-3 sm:right-4 bronze-gradient text-4xl sm:text-5xl font-black italic opacity-40">#3</div>
                <div class="relative mb-3 sm:mb-4 mt-2">
                    <div class="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-white/10 shadow-xl group-hover:border-gray-300 dark:group-hover:border-white/20 transition-all">
                        <img alt="{{ $song3->title }}" class="w-full h-full object-cover" src="{{ $song3->artwork_url }}"/>
                    </div>
                    <div class="absolute bottom-1.5 sm:bottom-2 right-1.5 sm:right-2 bg-white dark:bg-white/20 backdrop-blur-md rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shadow-lg">
                        <span class="material-symbols-outlined text-brand-green text-sm sm:text-base">trending_up</span>
                    </div>
                </div>
                <h3 class="text-lg sm:text-xl font-bold mb-1 text-gray-900 dark:text-white group-hover:text-brand-green transition-colors truncate max-w-full">{{ $song3->title }}</h3>
                <p class="text-gray-600 dark:text-white/60 text-xs sm:text-sm mb-3 sm:mb-4 truncate max-w-full">{{ $song3->artist->stage_name ?? 'Unknown Artist' }}</p>
                <div class="flex items-center gap-3 sm:gap-4 w-full justify-center">
                    <div class="text-center">
                        <p class="text-[9px] sm:text-[10px] text-gray-500 dark:text-white/40 uppercase font-bold tracking-widest">Plays</p>
                        <p class="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">{{ number_format($song3->play_count) }}</p>
                    </div>
                    <div class="w-px h-6 sm:h-8 bg-gray-200 dark:bg-white/10"></div>
                    <div class="text-center">
                        <p class="text-[9px] sm:text-[10px] text-gray-500 dark:text-white/40 uppercase font-bold tracking-widest">Peak</p>
                        <p class="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">3</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
    @endif

    <!-- Full Chart Table -->
    <section id="chart" class="px-4 sm:px-8 bg-gray-50 dark:bg-black pb-32">
        <div class="overflow-x-auto -mx-4 sm:mx-0">
            <table class="w-full text-left border-collapse min-w-[500px]">
                <thead class="sticky-table-header bg-white/90 dark:bg-black/90 border-b border-gray-200 dark:border-white/10">
                    <tr class="text-gray-500 dark:text-white/40 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em]">
                        <th class="py-3 sm:py-4 px-2 sm:px-4 w-12 sm:w-16 text-center">Rank</th>
                        <th class="py-3 sm:py-4 px-2 sm:px-4">Track</th>
                        <th class="py-3 sm:py-4 px-2 sm:px-4 text-center">Trend</th>
                        <th class="py-3 sm:py-4 px-2 sm:px-4 text-center hidden sm:table-cell">Likes</th>
                        <th class="py-3 sm:py-4 px-2 sm:px-4 text-right">Plays</th>
                        <th class="py-3 sm:py-4 px-2 sm:px-4 text-right pr-4 sm:pr-12 hidden sm:table-cell"><span class="material-symbols-outlined text-sm">schedule</span></th>
                    </tr>
                </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                @forelse($trendingSongs as $index => $song)
                @php
                    $rank = $trendingSongs->firstItem() + $index;
                    // Simulate trend (in real app, compare with previous period)
                    $trend = $index % 3 === 0 ? 'up' : ($index % 3 === 1 ? 'down' : 'same');
                @endphp
                <tr class="song-row group hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer text-xs sm:text-sm" onclick="playSong({{ $song->id }})">
                    <td class="py-3 sm:py-4 px-2 sm:px-4 text-center font-bold text-gray-400 dark:text-white/40 group-hover:text-gray-900 dark:group-hover:text-white">{{ $rank }}</td>
                    <td class="py-3 sm:py-4 px-2 sm:px-4">
                        <div class="flex items-center gap-2 sm:gap-4">
                            <div class="w-8 h-8 sm:w-10 sm:h-10 rounded bg-cover flex-shrink-0 bg-gray-200 dark:bg-gray-800" style="background-image: url('{{ $song->artwork_url }}')"></div>
                            <div class="min-w-0 max-w-[120px] sm:max-w-none">
                                <div class="font-bold text-gray-900 dark:text-white group-hover:text-brand-green transition-colors truncate text-xs sm:text-sm">{{ $song->title }}</div>
                                <div class="text-[10px] sm:text-xs text-gray-500 dark:text-white/40 truncate">{{ $song->artist->stage_name ?? 'Unknown Artist' }}</div>
                            </div>
                        </div>
                    </td>
                    <td class="py-3 sm:py-4 px-2 sm:px-4 text-center">
                        @if($trend === 'up')
                        <span class="material-symbols-outlined text-brand-green text-lg sm:text-xl">trending_up</span>
                        @elseif($trend === 'down')
                        <span class="material-symbols-outlined text-red-500 text-lg sm:text-xl">trending_down</span>
                        @else
                        <span class="material-symbols-outlined text-gray-300 dark:text-white/20 text-lg sm:text-xl">horizontal_rule</span>
                        @endif
                    </td>
                    <td class="py-3 sm:py-4 px-2 sm:px-4 text-center text-gray-600 dark:text-white/60 hidden sm:table-cell">{{ number_format($song->like_count ?? 0) }}</td>
                    <td class="py-3 sm:py-4 px-2 sm:px-4 text-right text-gray-600 dark:text-white/60 font-mono text-xs sm:text-sm">{{ number_format($song->play_count) }}</td>
                    <td class="py-3 sm:py-4 px-2 sm:px-4 text-right pr-2 sm:pr-4 hidden sm:table-cell">
                        <div class="flex items-center justify-end gap-2 sm:gap-4">
                            <span class="material-symbols-outlined text-gray-300 dark:text-white/20 text-base sm:text-lg opacity-0 group-hover:opacity-100 hover:text-brand-green transition-all cursor-pointer">favorite</span>
                            <span class="text-gray-500 dark:text-white/40 w-10 sm:w-12 text-xs sm:text-sm">{{ gmdate('i:s', $song->duration_seconds ?? 0) }}</span>
                        </div>
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="6" class="py-12 sm:py-16 text-center text-gray-500 dark:text-white/40">
                        <span class="material-symbols-outlined text-3xl sm:text-4xl mb-2 block">music_off</span>
                        <p>No trending songs found for this period.</p>
                    </td>
                </tr>
                @endforelse
            </tbody>
            </table>
        </div>

        <!-- Pagination -->
        @if($trendingSongs->hasPages())
        <div class="flex justify-center py-12">
            {{ $trendingSongs->withQueryString()->links() }}
        </div>
        @endif
    </section>
</div>
@endsection
