@extends('frontend.layouts.music')

@section('title', 'TesoTunes - Discover Your Sound')

@section('content')
<div class="space-y-10 pb-8">
    {{-- ========== HERO SECTION ========== --}}
    <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 dark:from-emerald-900 dark:via-teal-900 dark:to-cyan-900">
        <div class="absolute inset-0 bg-black/20"></div>
        <div class="absolute inset-0 bg-[url('/images/pattern-music.svg')] opacity-10"></div>
        <div class="relative px-6 py-12 md:px-10 md:py-16">
            <div class="max-w-3xl">
                <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium mb-4">
                    <span class="material-symbols-outlined text-lg">music_note</span>
                    Africa's #1 Music Platform
                </span>
                <h1 class="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
                    Discover. Stream.<br/>
                    <span class="text-emerald-300">Support Artists.</span>
                </h1>
                <p class="text-white/80 mt-4 text-lg max-w-xl">
                    Stream millions of songs, discover new artists, and support the African music scene. Your sound, your way.
                </p>
                
                <div class="mt-8 flex flex-wrap items-center gap-4">
                    @guest
                        <a class="inline-flex items-center gap-2 bg-white text-emerald-700 font-bold py-3 px-6 rounded-full hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl hover:scale-105" href="{{ route('register') }}">
                            <span class="material-symbols-outlined">play_arrow</span>
                            Start Listening Free
                        </a>
                        <a class="inline-flex items-center gap-2 border-2 border-white/50 text-white font-semibold py-3 px-6 rounded-full hover:bg-white/10 transition-colors" href="{{ route('frontend.trending') }}">
                            <span class="material-symbols-outlined">trending_up</span>
                            Explore Trending
                        </a>
                    @else
                        <a class="inline-flex items-center gap-2 bg-white text-emerald-700 font-bold py-3 px-6 rounded-full hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl hover:scale-105" href="{{ route('frontend.dashboard') }}">
                            <span class="material-symbols-outlined">library_music</span>
                            My Library
                        </a>
                        <a class="inline-flex items-center gap-2 border-2 border-white/50 text-white font-semibold py-3 px-6 rounded-full hover:bg-white/10 transition-colors" href="{{ route('frontend.trending') }}">
                            <span class="material-symbols-outlined">trending_up</span>
                            Explore Trending
                        </a>
                    @endguest
                </div>
            </div>
            
            {{-- Platform Stats --}}
            <div class="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <p class="text-3xl md:text-4xl font-black text-white">{{ number_format($statistics['total_songs']) }}+</p>
                    <p class="text-white/70 text-sm mt-1">Songs</p>
                </div>
                <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <p class="text-3xl md:text-4xl font-black text-white">{{ number_format($statistics['active_artists']) }}+</p>
                    <p class="text-white/70 text-sm mt-1">Artists</p>
                </div>
                <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <p class="text-3xl md:text-4xl font-black text-white">{{ number_format($statistics['total_plays']) }}+</p>
                    <p class="text-white/70 text-sm mt-1">Total Plays</p>
                </div>
                <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <p class="text-3xl md:text-4xl font-black text-white">{{ $statistics['total_genres'] }}+</p>
                    <p class="text-white/70 text-sm mt-1">Genres</p>
                </div>
            </div>
        </div>
    </section>

    {{-- ========== QUICK ACCESS MODULES ========== --}}
    <section class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <a href="{{ route('frontend.trending') }}" class="group flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 dark:from-emerald-500/20 dark:to-emerald-600/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all hover:scale-[1.02]">
            <div class="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span class="material-symbols-outlined text-white text-2xl">trending_up</span>
            </div>
            <div>
                <h3 class="font-bold text-gray-900 dark:text-white">Trending</h3>
                <p class="text-xs text-gray-600 dark:text-gray-400">What's hot now</p>
            </div>
        </a>
        
        <a href="{{ route('podcast.index') }}" class="group flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 dark:from-purple-500/20 dark:to-purple-600/10 border border-purple-500/20 hover:border-purple-500/40 transition-all hover:scale-[1.02]">
            <div class="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span class="material-symbols-outlined text-white text-2xl">podcasts</span>
            </div>
            <div>
                <h3 class="font-bold text-gray-900 dark:text-white">Podcasts</h3>
                <p class="text-xs text-gray-600 dark:text-gray-400">Listen & learn</p>
            </div>
        </a>
        
        <a href="{{ route('frontend.events.index') }}" class="group flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/5 dark:from-orange-500/20 dark:to-orange-600/10 border border-orange-500/20 hover:border-orange-500/40 transition-all hover:scale-[1.02]">
            <div class="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span class="material-symbols-outlined text-white text-2xl">event</span>
            </div>
            <div>
                <h3 class="font-bold text-gray-900 dark:text-white">Events</h3>
                <p class="text-xs text-gray-600 dark:text-gray-400">Live shows</p>
            </div>
        </a>
        
        <a href="{{ route('frontend.store.index') }}" class="group flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 dark:from-blue-500/20 dark:to-blue-600/10 border border-blue-500/20 hover:border-blue-500/40 transition-all hover:scale-[1.02]">
            <div class="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span class="material-symbols-outlined text-white text-2xl">storefront</span>
            </div>
            <div>
                <h3 class="font-bold text-gray-900 dark:text-white">Store</h3>
                <p class="text-xs text-gray-600 dark:text-gray-400">Artist merch</p>
            </div>
        </a>
    </section>

    {{-- ========== TRENDING SONGS - MAIN MUSIC SECTION ========== --}}
    @if($trendingSongs->isNotEmpty())
    <section>
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <span class="material-symbols-outlined text-emerald-500 text-3xl">local_fire_department</span>
                    Trending Now
                </h2>
                <p class="text-gray-600 dark:text-gray-400 mt-1">The hottest tracks on TesoTunes right now</p>
            </div>
            <a href="{{ route('frontend.trending') }}" class="hidden md:flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
                View All <span class="material-symbols-outlined">arrow_forward</span>
            </a>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            @foreach($trendingSongs->take(8) as $index => $song)
            <div class="group bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:shadow-lg cursor-pointer"
                 onclick="playSong({{ $song->id }})"
                 role="button"
                 tabindex="0">
                <div class="flex items-start gap-4">
                    {{-- Rank Number --}}
                    <div class="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
                        <span class="text-emerald-600 dark:text-emerald-400 font-bold text-sm">{{ $index + 1 }}</span>
                    </div>
                    
                    {{-- Song Artwork --}}
                    <div class="relative flex-shrink-0">
                        <img src="{{ $song->artwork_url ?? asset('images/default-song-artwork.svg') }}" 
                             alt="{{ $song->title }}"
                             class="w-14 h-14 rounded-lg object-cover shadow-md group-hover:scale-105 transition-transform">
                        <div class="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <span class="material-symbols-outlined text-white text-xl">play_arrow</span>
                        </div>
                    </div>
                    
                    {{-- Song Info --}}
                    <div class="flex-1 min-w-0">
                        <span class="font-semibold text-gray-900 dark:text-white truncate block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors text-sm">
                            {{ $song->title }}
                        </span>
                        <span class="text-xs text-gray-600 dark:text-gray-400 truncate block">
                            {{ $song->artist->stage_name ?? $song->artist->name ?? 'Unknown Artist' }}
                        </span>
                        <div class="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-500">
                            <span class="inline-flex items-center gap-0.5">
                                <span class="material-symbols-outlined text-xs">play_circle</span>
                                {{ number_format($song->play_count) }}
                            </span>
                            @if($song->is_downloadable)
                            <button onclick="event.stopPropagation(); downloadSong({{ $song->id }})" 
                               class="inline-flex items-center text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded p-0.5"
                               title="Free Download">
                                <span class="material-symbols-outlined text-xs">download</span>
                            </button>
                            @endif
                        </div>
                    </div>
                </div>
            </div>
            @endforeach
        </div>
        
        <a href="{{ route('frontend.trending') }}" class="md:hidden flex items-center justify-center gap-2 mt-4 text-emerald-600 dark:text-emerald-400 font-semibold">
            View All Trending <span class="material-symbols-outlined">arrow_forward</span>
        </a>
    </section>
    @endif

    {{-- ========== TOP ARTISTS WITH PLAY COUNTS ========== --}}
    @if($featuredArtists->isNotEmpty())
    <section>
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <span class="material-symbols-outlined text-purple-500 text-3xl">stars</span>
                    Top Artists
                </h2>
                <p class="text-gray-600 dark:text-gray-400 mt-1">Most played artists this month</p>
            </div>
            <a href="{{ route('frontend.artists') }}" class="hidden md:flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold hover:underline">
                View All <span class="material-symbols-outlined">arrow_forward</span>
            </a>
        </div>
        
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            @foreach($featuredArtists->take(6) as $artist)
            <a href="{{ route('frontend.artist.show', $artist) }}" 
               class="group bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:shadow-lg text-center">
                <div class="relative mx-auto w-24 h-24 md:w-28 md:h-28">
                    <img src="{{ $artist->avatar_url ?? asset('images/default-avatar.svg') }}" 
                         alt="{{ $artist->name }}"
                         class="w-full h-full rounded-full object-cover shadow-lg group-hover:scale-105 transition-transform">
                    @if($artist->status === 'verified')
                    <div class="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                        <span class="material-symbols-outlined text-white text-sm">verified</span>
                    </div>
                    @endif
                </div>
                <h3 class="font-semibold text-gray-900 dark:text-white mt-3 truncate">{{ $artist->name }}</h3>
                <div class="mt-2 space-y-1">
                    <div class="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/10 dark:bg-purple-500/20 rounded-full">
                        <span class="material-symbols-outlined text-purple-500 text-sm">play_circle</span>
                        <span class="text-xs font-bold text-purple-600 dark:text-purple-400">
                            {{ number_format($artist->songs_sum_play_count ?? $artist->total_plays ?? 0) }} plays
                        </span>
                    </div>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                        {{ number_format($artist->follower_count ?? 0) }} followers
                    </p>
                </div>
            </a>
            @endforeach
        </div>
        
        <a href="{{ route('frontend.artists') }}" class="md:hidden flex items-center justify-center gap-2 mt-4 text-purple-600 dark:text-purple-400 font-semibold">
            View All Artists <span class="material-symbols-outlined">arrow_forward</span>
        </a>
    </section>
    @endif

    {{-- ========== NEW RELEASES ========== --}}
    @if($newReleases->isNotEmpty())
    <section>
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <span class="material-symbols-outlined text-blue-500 text-3xl">new_releases</span>
                    New Releases
                </h2>
                <p class="text-gray-600 dark:text-gray-400 mt-1">Fresh tracks just dropped</p>
            </div>
        </div>
        
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            @foreach($newReleases->take(6) as $song)
            <div class="group cursor-pointer" onclick="playSong({{ $song->id }})" role="button" tabindex="0">
                <div class="relative aspect-square rounded-xl overflow-hidden shadow-lg">
                    <img src="{{ $song->artwork_url ?? asset('images/default-song-artwork.svg') }}" 
                         alt="{{ $song->title }}"
                         class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    
                    {{-- Play Overlay --}}
                    <div class="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div class="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                            <span class="material-symbols-outlined text-white text-2xl">play_arrow</span>
                        </div>
                    </div>
                    
                    {{-- Download Badge --}}
                    @if($song->is_downloadable)
                    <div class="absolute top-2 left-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                        <span class="material-symbols-outlined text-white text-xs">download</span>
                    </div>
                    @endif
                    
                    {{-- NEW Badge --}}
                    <div class="absolute top-2 right-2 px-1.5 py-0.5 bg-blue-500 rounded text-[10px] font-bold text-white">
                        NEW
                    </div>
                </div>
                
                <div class="mt-3">
                    <span class="font-semibold text-gray-900 dark:text-white truncate block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {{ $song->title }}
                    </span>
                    <span class="text-sm text-gray-600 dark:text-gray-400 truncate block">
                        {{ $song->artist->stage_name ?? $song->artist->name ?? 'Unknown Artist' }}
                    </span>
                    <div class="flex items-center justify-between mt-1">
                        <span class="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-0.5">
                            <span class="material-symbols-outlined text-xs">play_circle</span>
                            {{ number_format($song->play_count) }}
                        </span>
                        @if($song->is_downloadable)
                        <button onclick="event.stopPropagation(); downloadSong({{ $song->id }})" 
                           class="p-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-full" title="Download">
                            <span class="material-symbols-outlined text-sm">download</span>
                        </button>
                        @endif
                    </div>
                </div>
            </div>
            @endforeach
        </div>
    </section>
    @endif

    {{-- ========== POPULAR GENRES ========== --}}
    @if($popularGenres->isNotEmpty())
    <section>
        <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <span class="material-symbols-outlined text-orange-500 text-3xl">category</span>
                Browse by Genre
            </h2>
            <a href="{{ route('frontend.genres') }}" class="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-semibold hover:underline">
                All Genres <span class="material-symbols-outlined">arrow_forward</span>
            </a>
        </div>
        
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            @php
                $genreColors = [
                    'from-red-500 to-pink-500',
                    'from-orange-500 to-yellow-500',
                    'from-emerald-500 to-teal-500',
                    'from-blue-500 to-cyan-500',
                    'from-purple-500 to-violet-500',
                    'from-pink-500 to-rose-500',
                ];
            @endphp
            @foreach($popularGenres->take(6) as $index => $genre)
            <a href="{{ route('frontend.genres') }}?genre={{ $genre->slug }}" 
               class="relative overflow-hidden rounded-xl p-6 bg-gradient-to-br {{ $genreColors[$index % count($genreColors)] }} hover:scale-105 transition-transform shadow-lg">
                <div class="relative z-10">
                    <h3 class="font-bold text-white text-lg">{{ $genre->name }}</h3>
                    <p class="text-white/80 text-sm mt-1">{{ number_format($genre->songs_count) }} songs</p>
                </div>
                <div class="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full"></div>
            </a>
            @endforeach
        </div>
    </section>
    @endif

    {{-- ========== FEATURED CONTENT GRID ========== --}}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {{-- Main Content - 2 columns --}}
        <div class="lg:col-span-2 space-y-6">
            {{-- Community Poll --}}
            @if(isset($communityPolls) && $communityPolls->isNotEmpty())
            @php $poll = $communityPolls->first(); @endphp
            <section class="bg-white dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/50 shadow-sm">
                <div class="flex items-center gap-3 mb-5">
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                        <span class="material-symbols-outlined text-white text-xl">how_to_vote</span>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">Community Voice</h3>
                </div>
                <div x-data="pollVotingWidget({{ $poll->id }}, {{ json_encode($poll->options->map(fn($o) => ['id' => $o->id, 'text' => $o->option_text, 'votes' => $o->vote_count])) }}, {{ $poll->total_votes }})" 
                     data-poll-id="{{ $poll->id }}">
                    <p class="font-semibold text-gray-900 dark:text-white mb-4">{{ $poll->title }}</p>
                    
                    <!-- Voting Options -->
                    <div class="space-y-3">
                        <template x-for="option in options" :key="option.id">
                            <button @click="vote(option.id)" 
                                    :disabled="loading || hasVoted"
                                    class="relative w-full cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-300 text-left disabled:cursor-not-allowed"
                                    :class="{
                                        'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20': selectedOption === option.id,
                                        'border-gray-200 dark:border-gray-700 hover:border-emerald-400 dark:hover:border-emerald-600': selectedOption !== option.id && !hasVoted,
                                        'border-gray-200 dark:border-gray-700': hasVoted && selectedOption !== option.id
                                    }">
                                <!-- Progress bar -->
                                <div class="absolute inset-0 transition-all duration-500 ease-out"
                                     :class="selectedOption === option.id ? 'bg-emerald-500/20' : 'bg-gray-100 dark:bg-gray-700/30'"
                                     :style="`width: ${getPercentage(option.id)}%`"></div>
                                
                                <!-- Content -->
                                <div class="relative flex justify-between items-center px-4 py-3.5">
                                    <div class="flex items-center gap-3">
                                        <!-- Radio indicator -->
                                        <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                                             :class="selectedOption === option.id ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300 dark:border-gray-600'">
                                            <span x-show="selectedOption === option.id" class="material-symbols-outlined text-white text-sm">check</span>
                                        </div>
                                        <span class="font-medium text-gray-800 dark:text-gray-200" x-text="option.text"></span>
                                    </div>
                                    <span class="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums" x-text="getPercentage(option.id) + '%'"></span>
                                </div>
                            </button>
                        </template>
                    </div>
                    
                    <!-- Vote count and status -->
                    <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                        <div class="flex items-center gap-2">
                            <span class="text-sm text-gray-500 dark:text-gray-400" x-text="totalVotes.toLocaleString() + ' votes'"></span>
                            <span x-show="hasVoted" class="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                                <span class="material-symbols-outlined text-xs">check_circle</span>
                                Voted
                            </span>
                            <span x-show="loading" class="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                                <svg class="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Voting...
                            </span>
                        </div>
                        <a href="{{ route('frontend.edula') }}" class="text-emerald-600 dark:text-emerald-400 font-semibold text-sm hover:underline flex items-center gap-1">
                            View all polls
                            <span class="material-symbols-outlined text-sm">arrow_forward</span>
                        </a>
                    </div>
                    
                    <!-- Error message -->
                    <div x-show="error" x-cloak class="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p class="text-sm text-red-600 dark:text-red-400" x-text="error"></p>
                    </div>
                </div>
            </section>
            @endif
            
            {{-- Upcoming Events --}}
            @if($upcomingEvents->isNotEmpty())
            <section class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined text-orange-500 text-2xl">event</span>
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Upcoming Events</h3>
                    </div>
                    <a href="{{ route('frontend.events.index') }}" class="text-orange-600 dark:text-orange-400 font-semibold text-sm hover:underline">
                        View All
                    </a>
                </div>
                <div class="space-y-4">
                    @foreach($upcomingEvents->take(3) as $event)
                    <a href="{{ route('frontend.events.show', $event) }}" class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                        <img src="{{ $event->image_url ?? asset('images/default-event.png') }}" 
                             alt="{{ $event->title }}"
                             class="w-16 h-16 rounded-lg object-cover shadow">
                        <div class="flex-1 min-w-0">
                            <span class="text-xs text-orange-500 font-semibold">{{ $event->starts_at->format('D, M j - g:i A') }}</span>
                            <h4 class="font-semibold text-gray-900 dark:text-white truncate">{{ $event->title }}</h4>
                            <p class="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <span class="material-symbols-outlined text-sm">location_on</span>
                                {{ $event->venue_name ?? $event->city }}
                            </p>
                        </div>
                        <span class="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">Tickets</span>
                    </a>
                    @endforeach
                </div>
            </section>
            @endif
        </div>
        
        {{-- Sidebar --}}
        <aside class="space-y-6">
            {{-- SACCO Highlights --}}
            <section class="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl p-6 text-white">
                <div class="flex items-center gap-3 mb-4">
                    <span class="material-symbols-outlined text-2xl">account_balance</span>
                    <h3 class="text-lg font-bold">TesoTunes SACCO</h3>
                </div>
                <p class="text-white/80 text-sm mb-4">Save, invest, and grow your music career with our artist-focused financial services.</p>
                <ul class="space-y-2 text-sm">
                    <li class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-emerald-300 text-lg">check_circle</span>
                        12% Annual Dividends
                    </li>
                    <li class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-emerald-300 text-lg">check_circle</span>
                        Low-interest Artist Loans
                    </li>
                    <li class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-emerald-300 text-lg">check_circle</span>
                        Equipment Financing
                    </li>
                </ul>
                <a href="{{ route('frontend.sacco.landing') }}" class="mt-4 inline-flex items-center gap-2 bg-white text-purple-700 font-bold py-2 px-4 rounded-full hover:bg-purple-50 transition-colors text-sm">
                    Learn More <span class="material-symbols-outlined text-lg">arrow_forward</span>
                </a>
            </section>
            
            {{-- Store Spotlight --}}
            @if(isset($featuredProducts) && $featuredProducts->isNotEmpty())
            <section class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined text-blue-500 text-2xl">storefront</span>
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Artist Merch</h3>
                    </div>
                    <a href="{{ route('frontend.store.index') }}" class="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline">Shop</a>
                </div>
                <div class="space-y-3">
                    @foreach($featuredProducts->take(3) as $product)
                    <a href="{{ route('frontend.store.products.show', $product) }}" class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                        <img src="{{ $product->featured_image ?? asset('images/default-product.png') }}" 
                             alt="{{ $product->name }}"
                             class="w-12 h-12 rounded-lg object-cover">
                        <div class="flex-1 min-w-0">
                            <h4 class="font-medium text-sm text-gray-900 dark:text-white truncate">{{ $product->name }}</h4>
                            <p class="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                                UGX {{ number_format($product->price_ugx ?? 0) }}
                            </p>
                        </div>
                    </a>
                    @endforeach
                </div>
            </section>
            @endif
        </aside>
    </div>

    {{-- ========== ARTIST CTA ========== --}}
    <section class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
        <div class="absolute inset-0 bg-[url('/images/pattern-music.svg')] opacity-5"></div>
        <div class="relative px-8 py-12 md:px-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-8">
            <div class="text-center md:text-left">
                <h2 class="text-3xl md:text-4xl font-black text-white">Are You an Artist?</h2>
                <p class="text-gray-400 mt-2 max-w-lg">Join thousands of African artists growing their careers on TesoTunes. Upload music, get paid, and connect with fans.</p>
                <div class="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <a href="{{ route('register') }}" class="inline-flex items-center gap-2 bg-emerald-500 text-white font-bold py-3 px-6 rounded-full hover:bg-emerald-400 transition-colors">
                        <span class="material-symbols-outlined">upload</span>
                        Start Uploading
                    </a>
                    <a href="{{ route('frontend.artists') }}" class="inline-flex items-center gap-2 border border-gray-600 text-white font-semibold py-3 px-6 rounded-full hover:bg-white/10 transition-colors">
                        Learn More
                    </a>
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="text-center px-6 py-4 bg-white/5 rounded-xl">
                    <p class="text-3xl font-black text-emerald-400">70%</p>
                    <p class="text-sm text-gray-400">Revenue Share</p>
                </div>
                <div class="text-center px-6 py-4 bg-white/5 rounded-xl">
                    <p class="text-3xl font-black text-emerald-400">24hr</p>
                    <p class="text-sm text-gray-400">Quick Payouts</p>
                </div>
            </div>
        </div>
    </section>
</div>

@push('scripts')
<script>
    function playSong(songId) {
        console.log('🎵 HomePage playSong called:', songId);
        
        // Dispatch play-track event to music player
        const event = new CustomEvent('play-track', {
            detail: {
                track: {
                    id: songId
                }
            }
        });
        
        console.log('🎵 HomePage dispatching event:', event.detail);
        window.dispatchEvent(event);
        console.log('🎵 HomePage event dispatched');
    }

    function downloadSong(songId) {
        @auth
        // Use the API endpoint for downloads
        fetch(`/api/v1/songs/${songId}/download`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                'Accept': 'application/json',
            },
            credentials: 'same-origin'
        })
        .then(response => response.json())
        .then(data => {
            if (data.download_url) {
                window.location.href = data.download_url;
            } else if (data.message) {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Download error:', error);
            alert('Download failed. Please try again.');
        });
        @else
        window.location.href = '{{ route("login") }}?redirect=' + encodeURIComponent(window.location.pathname);
        @endauth
    }

    // Poll voting widget - inline voting without page reload
    function pollVotingWidget(pollId, initialOptions, initialTotalVotes) {
        return {
            pollId: pollId,
            options: initialOptions,
            totalVotes: initialTotalVotes,
            selectedOption: null,
            hasVoted: false,
            loading: false,
            error: null,
            
            getPercentage(optionId) {
                const option = this.options.find(o => o.id === optionId);
                if (!option || this.totalVotes === 0) return 0;
                return Math.round((option.votes / this.totalVotes) * 100);
            },
            
            async vote(optionId) {
                @auth
                if (this.loading || this.hasVoted) return;
                
                this.loading = true;
                this.error = null;
                this.selectedOption = optionId;
                
                try {
                    const response = await fetch(`/api/polls/${this.pollId}/vote`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                            'Accept': 'application/json',
                        },
                        body: JSON.stringify({ option_id: optionId }),
                        credentials: 'same-origin'
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        this.hasVoted = true;
                        
                        // Use the results from the API response
                        if (data.total_votes !== undefined) {
                            this.totalVotes = data.total_votes;
                        }
                        if (data.results && Array.isArray(data.results)) {
                            data.results.forEach(apiOption => {
                                const localOption = this.options.find(o => o.id === apiOption.id);
                                if (localOption) {
                                    localOption.votes = apiOption.votes;
                                }
                            });
                        }
                    } else {
                        this.error = data.message || 'Failed to submit vote. Please try again.';
                        this.selectedOption = null;
                    }
                } catch (error) {
                    console.error('Vote error:', error);
                    this.error = 'Network error. Please check your connection and try again.';
                    this.selectedOption = null;
                }
                
                this.loading = false;
                @else
                window.location.href = '{{ route("login") }}?redirect=' + encodeURIComponent(window.location.pathname);
                @endauth
            }
        };
    }
</script>
@endpush
@endsection
