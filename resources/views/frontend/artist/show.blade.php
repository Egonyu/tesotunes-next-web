@extends('frontend.layouts.music')

@section('title', $artist->stage_name ?? $artist->name)

{{-- Remove right sidebar for full-width artist page --}}
@section('custom-right-sidebar')
@endsection

@section('content')
<div x-data="artistPage()" x-cloak class="min-h-screen">
    
    {{-- ========== HERO SECTION ========== --}}
    <div class="relative">
        {{-- Background with gradient overlay --}}
        <div class="absolute inset-0 h-96 overflow-hidden">
            @if($artist->cover_image)
                <img src="{{ Storage::url($artist->cover_image) }}" 
                     alt="{{ $artist->stage_name ?? $artist->name }}"
                     class="w-full h-full object-cover">
            @else
                <div class="w-full h-full bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700"></div>
            @endif
            <div class="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-gray-50 dark:to-gray-900"></div>
        </div>
        
        {{-- Hero Content --}}
        <div class="relative pt-16 pb-8 px-4 sm:px-6 lg:px-8">
            <div class="max-w-7xl mx-auto">
                <div class="flex flex-col md:flex-row items-center md:items-end gap-6">
                    {{-- Artist Avatar --}}
                    <div class="relative group">
                        <div class="w-36 h-36 md:w-48 md:h-48 rounded-full overflow-hidden ring-4 ring-white/20 shadow-2xl bg-gray-200 dark:bg-gray-700">
                            <img src="{{ $artist->avatar_url }}" 
                                 alt="{{ $artist->stage_name ?? $artist->name }}"
                                 class="w-full h-full object-cover"
                                 onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name={{ urlencode($artist->stage_name ?? $artist->name) }}&size=200&background=10b981&color=fff'">
                        </div>
                        @if($artist->status === 'verified' || $artist->verification_status === 'approved')
                            <div class="absolute -bottom-1 -right-1 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-gray-900">
                                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                </svg>
                            </div>
                        @endif
                    </div>
                    
                    {{-- Artist Info --}}
                    <div class="text-center md:text-left flex-1">
                        <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white text-xs font-medium mb-3">
                            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                            </svg>
                            Artist
                        </span>
                        
                        <h1 class="text-4xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-lg">
                            {{ $artist->stage_name ?? $artist->name }}
                        </h1>
                        
                        <div class="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4 text-white/80 text-sm">
                            <span class="flex items-center gap-1.5">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                                </svg>
                                <span class="follower-count font-semibold">{{ number_format($artist->followers_count ?? 0) }}</span> followers
                            </span>
                            <span class="w-1 h-1 rounded-full bg-white/50"></span>
                            <span class="flex items-center gap-1.5">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"/>
                                </svg>
                                <span class="font-semibold">{{ number_format($artist->songs_count ?? 0) }}</span> tracks
                            </span>
                            @if($artist->songs()->published()->sum('play_count') > 0)
                                <span class="w-1 h-1 rounded-full bg-white/50"></span>
                                <span class="flex items-center gap-1.5">
                                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/>
                                    </svg>
                                    <span class="font-semibold">{{ number_format($artist->songs()->published()->sum('play_count')) }}</span> plays
                                </span>
                            @endif
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    {{-- ========== ACTION BAR ========== --}}
    <div class="sticky top-0 z-30 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div class="flex items-center justify-between gap-4 flex-wrap">
                <div class="flex items-center gap-3">
                    {{-- Play All Button --}}
                    <button @click="playAll()"
                            class="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95">
                        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/>
                        </svg>
                        <span>Play All</span>
                    </button>
                    
                    {{-- Follow Button --}}
                    <button @click="toggleFollow()"
                            class="inline-flex items-center gap-2 px-5 py-3 rounded-full font-semibold transition-all"
                            :class="isFollowing 
                                ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600' 
                                : 'border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white'">
                        <svg class="w-5 h-5" :class="isFollowing ? 'hidden' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                        </svg>
                        <svg class="w-5 h-5" :class="!isFollowing ? 'hidden' : ''" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                        </svg>
                        <span x-text="isFollowing ? 'Following' : 'Follow'"></span>
                    </button>
                    
                    {{-- Share Button --}}
                    <button @click="shareArtist()"
                            class="w-11 h-11 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors text-gray-700 dark:text-gray-300">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                        </svg>
                    </button>
                    
                    {{-- More Menu --}}
                    <div class="relative" x-data="{ open: false }">
                        <button @click="open = !open"
                                class="w-11 h-11 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors text-gray-700 dark:text-gray-300">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"/>
                            </svg>
                        </button>
                        
                        <div x-show="open" @click.outside="open = false" x-transition
                             class="absolute right-0 top-12 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                             style="display: none;">
                            <button @click="copyArtistLink(); open = false"
                                    class="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                                </svg>
                                Copy Link
                            </button>
                            <button @click="reportArtist(); open = false"
                                    class="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                </svg>
                                Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    {{-- ========== MAIN CONTENT ========== --}}
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {{-- LEFT COLUMN: Songs --}}
            <div class="lg:col-span-2 space-y-8">
                
                {{-- Popular Songs Section --}}
                <section>
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Popular Songs</h2>
                        @if($artist->songs()->published()->count() > 5)
                            <a href="{{ route('frontend.artist.tracks', $artist) }}"
                               class="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                                View all
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                </svg>
                            </a>
                        @endif
                    </div>
                    
                    <div class="bg-white dark:bg-gray-800/50 rounded-2xl overflow-hidden shadow-sm">
                        @forelse($artist->songs()->published()->orderBy('play_count', 'desc')->limit(10)->get() as $index => $track)
                            <div class="group flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700/50 last:border-b-0 cursor-pointer"
                                 :class="currentPlayingTrackId === {{ $track->id }} ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''"
                                 @click="playTrack({{ $track->id }})">
                                
                                {{-- Track Number/Playing Indicator --}}
                                <div class="w-8 flex-shrink-0 text-center">
                                    <span class="text-gray-400 dark:text-gray-500 text-sm font-medium group-hover:hidden"
                                          x-show="currentPlayingTrackId !== {{ $track->id }}"
                                          :class="currentPlayingTrackId === {{ $track->id }} ? 'hidden' : ''">
                                        {{ $index + 1 }}
                                    </span>
                                    
                                    {{-- Equalizer animation when playing --}}
                                    <div x-show="currentPlayingTrackId === {{ $track->id }} && isTrackPlaying"
                                         class="flex items-center justify-center gap-0.5 h-4" style="display: none;">
                                        <div class="w-1 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 0s; height: 40%;"></div>
                                        <div class="w-1 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 0.1s; height: 80%;"></div>
                                        <div class="w-1 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 0.2s; height: 60%;"></div>
                                    </div>
                                    
                                    {{-- Play/Pause button --}}
                                    <div class="hidden group-hover:flex items-center justify-center"
                                         :class="currentPlayingTrackId === {{ $track->id }} ? 'flex' : ''">
                                        <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20"
                                             x-show="!(currentPlayingTrackId === {{ $track->id }} && isTrackPlaying)">
                                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/>
                                        </svg>
                                        <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20"
                                             x-show="currentPlayingTrackId === {{ $track->id }} && isTrackPlaying" style="display: none;">
                                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
                                        </svg>
                                    </div>
                                </div>
                                
                                {{-- Artwork --}}
                                <div class="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700 shadow">
                                    <img src="{{ $track->artwork_url ?? asset('images/default-song-artwork.svg') }}" 
                                         alt="{{ $track->title }}"
                                         class="w-full h-full object-cover"
                                         onerror="this.onerror=null; this.src='{{ asset('images/default-song-artwork.svg') }}'">
                                </div>
                                
                                {{-- Track Info --}}
                                <div class="flex-1 min-w-0">
                                    <span class="font-medium text-gray-900 dark:text-white truncate block"
                                          :class="currentPlayingTrackId === {{ $track->id }} ? 'text-emerald-600 dark:text-emerald-400' : ''">
                                        {{ $track->title }}
                                        @if($track->is_explicit)
                                            <span class="inline-flex items-center justify-center w-4 h-4 bg-gray-200 dark:bg-gray-600 rounded text-[10px] font-bold text-gray-600 dark:text-gray-300 ml-1">E</span>
                                        @endif
                                    </span>
                                    <p class="text-sm text-gray-500 dark:text-gray-400 truncate">
                                        {{ number_format($track->play_count ?? 0) }} plays
                                    </p>
                                </div>
                                
                                {{-- Price/Buy Button or Free Badge --}}
                                <div class="flex-shrink-0">
                                    @if(!$track->is_free && $track->price > 0)
                                        <button @click.stop="openPurchaseModal({{ $track->id }}, '{{ addslashes($track->title) }}', {{ $track->price }}, '{{ $track->currency ?? 'UGX' }}', '{{ $track->artwork_url ?? asset('images/default-song-artwork.svg') }}')"
                                                class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-full transition-colors">
                                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                                            </svg>
                                            {{ number_format($track->price) }} {{ $track->currency ?? 'UGX' }}
                                        </button>
                                    @else
                                        <span class="inline-flex items-center px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-full">
                                            Free
                                        </span>
                                    @endif
                                </div>
                                
                                {{-- Like Button --}}
                                <button @click.stop="toggleLike({{ $track->id }})"
                                        class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        :class="likedTracks.has({{ $track->id }}) ? 'text-red-500 opacity-100' : ''">
                                    <svg class="w-5 h-5" :fill="likedTracks.has({{ $track->id }}) ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                                    </svg>
                                </button>
                                
                                {{-- More Options (song details) --}}
                                <a href="{{ route('frontend.song.show', $track) }}" 
                                   @click.stop
                                   class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors opacity-0 group-hover:opacity-100">
                                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"/>
                                    </svg>
                                </a>
                                
                                {{-- Duration --}}
                                <span class="text-sm text-gray-500 dark:text-gray-400 w-12 text-right flex-shrink-0">
                                    {{ $track->duration_seconds ? gmdate('i:s', $track->duration_seconds) : '--:--' }}
                                </span>
                            </div>
                        @empty
                            <div class="text-center py-16">
                                <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                                </svg>
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No songs yet</h3>
                                <p class="text-gray-500 dark:text-gray-400">This artist hasn't released any music yet.</p>
                            </div>
                        @endforelse
                    </div>
                </section>
                
                {{-- Albums Section --}}
                @if($artist->albums && $artist->albums->where('status', 'published')->count() > 0)
                    <section>
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Albums</h2>
                            @if($artist->albums->where('status', 'published')->count() > 4)
                                <a href="{{ route('frontend.artist.albums', $artist) }}"
                                   class="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                                    View all
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                    </svg>
                                </a>
                            @endif
                        </div>
                        
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            @foreach($artist->albums->where('status', 'published')->take(4) as $album)
                                <a href="#" 
                                   class="group bg-white dark:bg-gray-800/50 rounded-xl p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all hover:shadow-lg">
                                    <div class="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 mb-3 shadow-md group-hover:shadow-xl transition-shadow">
                                        <img src="{{ $album->artwork_url ?? asset('images/default-album-artwork.svg') }}" 
                                             alt="{{ $album->title }}"
                                             class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                                    </div>
                                    <h3 class="font-semibold text-gray-900 dark:text-white truncate text-sm">{{ $album->title }}</h3>
                                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ $album->release_year ?? 'Album' }}</p>
                                </a>
                            @endforeach
                        </div>
                    </section>
                @endif
            </div>
            
            {{-- RIGHT COLUMN: About & Stats --}}
            <div class="space-y-6">
                
                {{-- About Section --}}
                <div class="bg-white dark:bg-gray-800/50 rounded-2xl p-6 shadow-sm">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">About</h3>
                    
                    @if($artist->bio)
                        <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                            {{ Str::limit($artist->bio, 300) }}
                        </p>
                    @else
                        <p class="text-gray-500 dark:text-gray-400 text-sm italic">
                            No bio available yet.
                        </p>
                    @endif
                    
                    {{-- Location --}}
                    @if($artist->location || $artist->country)
                        <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-4">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                            <span>{{ $artist->location ?? '' }}{{ $artist->location && $artist->country ? ', ' : '' }}{{ $artist->country ?? '' }}</span>
                        </div>
                    @endif
                    
                    {{-- Genres --}}
                    @if($artist->genres && $artist->genres->count() > 0)
                        <div class="mt-4">
                            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Genres</p>
                            <div class="flex flex-wrap gap-2">
                                @foreach($artist->genres->take(5) as $genre)
                                    <span class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full">
                                        {{ $genre->name }}
                                    </span>
                                @endforeach
                            </div>
                        </div>
                    @endif
                    
                    {{-- Social Links --}}
                    @if($artist->instagram_url || $artist->twitter_url || $artist->youtube_url || $artist->tiktok_url || $artist->facebook_url)
                        <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Connect</p>
                            <div class="flex items-center gap-3">
                                @if($artist->instagram_url)
                                    <a href="https://instagram.com/{{ $artist->instagram_url }}" target="_blank" rel="noopener"
                                       class="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center text-white hover:scale-110 transition-transform">
                                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                                    </a>
                                @endif
                                @if($artist->twitter_url)
                                    <a href="https://twitter.com/{{ $artist->twitter_url }}" target="_blank" rel="noopener"
                                       class="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white hover:scale-110 transition-transform">
                                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                    </a>
                                @endif
                                @if($artist->youtube_url)
                                    <a href="{{ $artist->youtube_url }}" target="_blank" rel="noopener"
                                       class="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-white hover:scale-110 transition-transform">
                                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                                    </a>
                                @endif
                                @if($artist->tiktok_url)
                                    <a href="https://tiktok.com/@{{ $artist->tiktok_url }}" target="_blank" rel="noopener"
                                       class="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white hover:scale-110 transition-transform">
                                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                                    </a>
                                @endif
                            </div>
                        </div>
                    @endif
                </div>
                
                {{-- Stats Card --}}
                <div class="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
                    <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                        </svg>
                        Statistics
                    </h3>
                    <div class="space-y-4">
                        <div class="flex justify-between items-center">
                            <span class="text-white/80 text-sm">Total Plays</span>
                            <span class="font-bold text-lg">{{ number_format($artist->songs()->published()->sum('play_count')) }}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-white/80 text-sm">Total Songs</span>
                            <span class="font-bold text-lg">{{ number_format($artist->songs_count ?? 0) }}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-white/80 text-sm">Followers</span>
                            <span class="font-bold text-lg follower-count">{{ number_format($artist->followers_count ?? 0) }}</span>
                        </div>
                        @if($artist->albums)
                            <div class="flex justify-between items-center">
                                <span class="text-white/80 text-sm">Albums</span>
                                <span class="font-bold text-lg">{{ number_format($artist->albums->count()) }}</span>
                            </div>
                        @endif
                    </div>
                </div>
                
                {{-- Support/Tip Card --}}
                @if($artist->campaigns && $artist->campaigns->where('status', 'active')->count() > 0)
                    <div class="bg-white dark:bg-gray-800/50 rounded-2xl p-6 shadow-sm border border-amber-200 dark:border-amber-900/50">
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <svg class="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
                            </svg>
                            Support {{ $artist->stage_name ?? $artist->name }}
                        </h3>
                        <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">
                            Show your appreciation by supporting this artist's work.
                        </p>
                        <a href="{{ route('ojokotau.index', ['artist' => $artist->id]) }}"
                           class="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            View Campaigns
                        </a>
                    </div>
                @endif
            </div>
        </div>
    </div>
    
    {{-- ========== PURCHASE MODAL ========== --}}
    <div x-show="showPurchaseModal" 
         x-transition:enter="transition ease-out duration-300"
         x-transition:enter-start="opacity-0"
         x-transition:enter-end="opacity-100"
         x-transition:leave="transition ease-in duration-200"
         x-transition:leave-start="opacity-100"
         x-transition:leave-end="opacity-0"
         @keydown.escape.window="showPurchaseModal = false"
         class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
         style="display: none;">
        
        <div @click.outside="showPurchaseModal = false"
             x-transition:enter="transition ease-out duration-300"
             x-transition:enter-start="opacity-0 scale-95 translate-y-4"
             x-transition:enter-end="opacity-100 scale-100 translate-y-0"
             x-transition:leave="transition ease-in duration-200"
             x-transition:leave-start="opacity-100 scale-100 translate-y-0"
             x-transition:leave-end="opacity-0 scale-95 translate-y-4"
             class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            
            {{-- Modal Header --}}
            <div class="relative bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
                <button @click="showPurchaseModal = false"
                        class="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
                <div class="flex items-center gap-4">
                    <img :src="purchaseData.artwork" 
                         class="w-20 h-20 rounded-xl shadow-lg object-cover"
                         alt="Song artwork">
                    <div>
                        <p class="text-white/80 text-sm">Purchase Song</p>
                        <h3 class="text-xl font-bold" x-text="purchaseData.title"></h3>
                        <p class="text-white/90 mt-1">by {{ $artist->stage_name ?? $artist->name }}</p>
                    </div>
                </div>
            </div>
            
            {{-- Modal Body --}}
            <div class="p-6">
                {{-- Price Display --}}
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
                    <div class="flex items-center justify-between">
                        <span class="text-gray-600 dark:text-gray-400">Price</span>
                        <span class="text-2xl font-bold text-gray-900 dark:text-white">
                            <span x-text="purchaseData.currency"></span> <span x-text="Number(purchaseData.price).toLocaleString()"></span>
                        </span>
                    </div>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Includes unlimited downloads in high quality (320kbps MP3)
                    </p>
                </div>
                
                {{-- Payment Method Selection --}}
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Payment Method</label>
                    <div class="space-y-3">
                        <label class="flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-colors"
                               :class="paymentMethod === 'mobile_money' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'">
                            <input type="radio" x-model="paymentMethod" value="mobile_money" class="sr-only">
                            <div class="w-10 h-10 rounded-lg bg-yellow-400 flex items-center justify-center">
                                <svg class="w-6 h-6 text-yellow-800" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                                </svg>
                            </div>
                            <div class="flex-1">
                                <p class="font-medium text-gray-900 dark:text-white">Mobile Money</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">MTN MoMo, Airtel Money</p>
                            </div>
                            <div x-show="paymentMethod === 'mobile_money'" class="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                                <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                </svg>
                            </div>
                        </label>
                        
                        <label class="flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-colors"
                               :class="paymentMethod === 'credits' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'">
                            <input type="radio" x-model="paymentMethod" value="credits" class="sr-only">
                            <div class="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
                                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                                    <path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd"/>
                                </svg>
                            </div>
                            <div class="flex-1">
                                <p class="font-medium text-gray-900 dark:text-white">TesoTunes Credits</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">Use your account balance</p>
                            </div>
                            <div x-show="paymentMethod === 'credits'" class="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                                <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                </svg>
                            </div>
                        </label>
                    </div>
                </div>
                
                {{-- Mobile Money Phone Input --}}
                <div x-show="paymentMethod === 'mobile_money'" class="mb-6" x-transition>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                    <div class="flex gap-2">
                        <select x-model="mobileProvider" class="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                            <option value="mtn">MTN</option>
                            <option value="airtel">Airtel</option>
                        </select>
                        <input type="tel" x-model="phoneNumber" 
                               placeholder="07XX XXX XXX"
                               class="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                    </div>
                </div>
                
                {{-- Error Message --}}
                <div x-show="purchaseError" x-transition
                     class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <p class="text-sm text-red-600 dark:text-red-400" x-text="purchaseError"></p>
                </div>
                
                {{-- Purchase Button --}}
                <button @click="processPurchase()"
                        :disabled="purchaseLoading || (paymentMethod === 'mobile_money' && !phoneNumber)"
                        class="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                    <svg x-show="purchaseLoading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span x-text="purchaseLoading ? 'Processing...' : 'Complete Purchase'"></span>
                </button>
                
                {{-- Terms --}}
                <p class="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                    By purchasing, you agree to our <a href="#" class="text-emerald-600 hover:underline">Terms of Service</a>
                </p>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
function artistPage() {
    return {
        isFollowing: {{ $isFollowing ? 'true' : 'false' }},
        likedTracks: new Set(),
        currentPlayingTrackId: null,
        isTrackPlaying: false,
        
        // Purchase modal state
        showPurchaseModal: false,
        purchaseData: {
            songId: null,
            title: '',
            price: 0,
            currency: 'UGX',
            artwork: ''
        },
        paymentMethod: 'mobile_money',
        mobileProvider: 'mtn',
        phoneNumber: '',
        purchaseLoading: false,
        purchaseError: '',
        pendingPaymentRef: null,
        paymentPolling: false,
        pollInterval: null,
        pollAttempts: 0,
        
        initialized: false,
        
        init() {
            if (this.initialized) return;
            this.initialized = true;
            
            // Ensure DOM is ready
            this.$nextTick(() => {
                this.listenToPlayerEvents();
                @auth
                    this.loadLikedTracks();
                @endauth
            });
        },
        
        listenToPlayerEvents() {
            window.addEventListener('tesotunes:track-changed', (e) => {
                if (e.detail && e.detail.track) {
                    this.currentPlayingTrackId = e.detail.track.id;
                    this.isTrackPlaying = true;
                }
            });
            
            window.addEventListener('tesotunes:play-state', (e) => {
                if (e.detail) {
                    this.isTrackPlaying = e.detail.isPlaying;
                }
            });
            
            if (window.TesoTunes && window.TesoTunes.state.currentTrack) {
                this.currentPlayingTrackId = window.TesoTunes.state.currentTrack.id;
                this.isTrackPlaying = window.TesoTunes.state.isPlaying;
            }
        },
        
        loadLikedTracks() {
            fetch('/api/v1/my/liked-songs', {
                headers: { 'Accept': 'application/json' }
            })
            .then(r => r.json())
            .then(data => {
                if (data.data) {
                    data.data.forEach(song => this.likedTracks.add(song.id));
                }
            })
            .catch(e => console.log('Could not load liked tracks'));
        },
        
        playAll() {
            const allTracks = @json($allSongs ?? []);
            if (!allTracks || allTracks.length === 0) {
                this.showNotification('error', 'No tracks available to play');
                return;
            }
            
            if (typeof window.playPlaylist === 'function') {
                window.playPlaylist(allTracks, 0);
            } else if (window.TesoTunes) {
                window.TesoTunes.playQueue(allTracks, 0);
            }
        },
        
        playTrack(trackId) {
            if (this.currentPlayingTrackId === trackId) {
                if (window.TesoTunes) {
                    this.isTrackPlaying ? window.TesoTunes.pause() : window.TesoTunes.play();
                    this.isTrackPlaying = !this.isTrackPlaying;
                }
                return;
            }
            
            const allTracks = @json($allSongs ?? []);
            const track = allTracks.find(t => t.id === trackId);
            
            if (track && window.TesoTunes) {
                window.TesoTunes.playTrack(track);
                this.currentPlayingTrackId = trackId;
                this.isTrackPlaying = true;
            }
        },
        
        toggleFollow() {
            @auth
                const url = this.isFollowing 
                    ? `/artist/{{ $artist->slug }}/unfollow`
                    : `/artist/{{ $artist->slug }}/follow`;
                    
                fetch(url, {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                        'Accept': 'application/json'
                    }
                })
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        this.isFollowing = data.is_following;
                        document.querySelectorAll('.follower-count').forEach(el => {
                            el.textContent = data.follower_count.toLocaleString();
                        });
                        this.showNotification('success', data.message);
                    }
                })
                .catch(e => this.showNotification('error', 'Failed to update follow status'));
            @else
                window.location.href = '{{ route("login") }}';
            @endauth
        },
        
        toggleLike(trackId) {
            @auth
                fetch(`/api/v1/tracks/${trackId}/like`, {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                        'Accept': 'application/json'
                    }
                })
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        data.is_liked ? this.likedTracks.add(trackId) : this.likedTracks.delete(trackId);
                        this.showNotification('success', data.is_liked ? 'Added to liked songs' : 'Removed from liked songs');
                    }
                })
                .catch(e => this.showNotification('error', 'Failed to update like'));
            @else
                window.location.href = '{{ route("login") }}';
            @endauth
        },
        
        openPurchaseModal(songId, title, price, currency, artwork) {
            @auth
                this.purchaseData = { songId, title, price, currency, artwork };
                this.purchaseError = '';
                this.pendingPaymentRef = null;
                this.paymentPolling = false;
                this.showPurchaseModal = true;
            @else
                window.location.href = '{{ route("login") }}?redirect=' + encodeURIComponent(window.location.href);
            @endauth
        },
        
        stopPaymentPolling() {
            if (this.pollInterval) {
                clearInterval(this.pollInterval);
                this.pollInterval = null;
            }
            this.paymentPolling = false;
        },
        
        async pollPaymentStatus(paymentReference) {
            this.paymentPolling = true;
            this.pollAttempts = 0;
            const maxAttempts = 60; // 5 minutes max (60 * 5 seconds)
            
            this.pollInterval = setInterval(async () => {
                this.pollAttempts++;
                
                try {
                    const response = await fetch('/song/' + this.purchaseData.songId + '/purchase/status/' + paymentReference, {
                        method: 'GET',
                        credentials: 'same-origin',
                        headers: {
                            'Accept': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                        }
                    });
                    
                    const data = await response.json();
                    console.log('Payment status check:', data);
                    
                    if (data.status === 'completed') {
                        this.stopPaymentPolling();
                        this.showPurchaseModal = false;
                        this.purchaseLoading = false;
                        
                        alert('Payment successful! You can now download your song.');
                        this.showNotification('success', 'Payment completed! Song purchased successfully.');
                        
                        if (data.download_url) {
                            setTimeout(() => {
                                window.open(data.download_url, '_blank');
                            }, 500);
                        }
                        
                        // Refresh to show "purchased" status
                        window.location.reload();
                        return;
                    }
                    
                    if (data.status === 'failed') {
                        this.stopPaymentPolling();
                        this.purchaseLoading = false;
                        this.purchaseError = data.message || 'Payment failed. Please try again.';
                        this.showNotification('error', 'Payment failed');
                        return;
                    }
                    
                    // Still pending - update UI
                    if (this.pollAttempts >= maxAttempts) {
                        this.stopPaymentPolling();
                        this.purchaseLoading = false;
                        this.purchaseError = 'Payment verification timed out. If you approved the payment, it will be processed soon and you can find it in your purchases.';
                        this.showNotification('warning', 'Verification timed out - check your purchases later');
                        return;
                    }
                    
                    // Update the remaining time display
                    const remainingMins = Math.ceil((maxAttempts - this.pollAttempts) * 5 / 60);
                    this.purchaseError = `Waiting for payment confirmation... (${remainingMins} min remaining). Check your phone!`;
                    
                } catch (error) {
                    console.error('Payment status poll error:', error);
                    if (this.pollAttempts >= maxAttempts) {
                        this.stopPaymentPolling();
                        this.purchaseLoading = false;
                        this.purchaseError = 'Could not verify payment. Check your purchases later.';
                    }
                }
            }, 5000); // Poll every 5 seconds
        },
        
        async processPurchase() {
            this.purchaseLoading = true;
            this.purchaseError = '';
            this.stopPaymentPolling(); // Clear any existing poll
            
            try {
                const response = await fetch('/song/' + this.purchaseData.songId + '/purchase', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify({
                        payment_method: this.paymentMethod,
                        provider: this.mobileProvider,
                        phone_number: this.phoneNumber
                    })
                });
                
                const data = await response.json();
                console.log('Purchase response:', data);
                
                if (data.success) {
                    // Check if it's a pending mobile money payment or completed credits payment
                    if (data.status === 'pending' || data.status === 'processing') {
                        // Mobile Money - payment initiated, user needs to approve on phone
                        // Keep modal open to show polling status
                        this.purchaseError = 'Payment initiated! Check your phone and approve the payment...';
                        this.showNotification('info', 'Check your phone to approve the payment');
                        
                        // Start polling for payment status
                        if (data.payment_reference) {
                            this.pendingPaymentRef = data.payment_reference;
                            this.pollPaymentStatus(data.payment_reference);
                        } else {
                            // No reference to poll - fall back to old behavior
                            this.showPurchaseModal = false;
                            alert(data.message || 'Payment initiated! Check your phone.');
                            this.purchaseLoading = false;
                        }
                    } else {
                        // Credits payment - completed immediately
                        this.showPurchaseModal = false;
                        this.purchaseLoading = false;
                        alert(data.message || 'Purchase successful! You can now download this song.');
                        this.showNotification('success', data.message || 'Purchase successful!');
                        
                        if (data.download_url) {
                            // Trigger download after a short delay
                            setTimeout(() => {
                                window.open(data.download_url, '_blank');
                            }, 500);
                        }
                        
                        // Refresh to show purchased status
                        window.location.reload();
                    }
                } else {
                    this.purchaseError = data.message || 'Purchase failed. Please try again.';
                    this.purchaseLoading = false;
                }
            } catch (error) {
                console.error('Purchase error:', error);
                this.purchaseError = 'An error occurred. Please try again.';
                this.purchaseLoading = false;
            }
        },
        
        shareArtist() {
            if (navigator.share) {
                navigator.share({
                    title: '{{ $artist->stage_name ?? $artist->name }} on TesoTunes',
                    url: window.location.href
                }).catch(() => {});
            } else {
                this.copyArtistLink();
            }
        },
        
        copyArtistLink() {
            navigator.clipboard.writeText(window.location.href)
                .then(() => this.showNotification('success', 'Link copied!'))
                .catch(() => this.showNotification('error', 'Failed to copy link'));
        },
        
        reportArtist() {
            @auth
                if (confirm('Report this artist for inappropriate content?')) {
                    this.showNotification('success', 'Report submitted. Our team will review it.');
                }
            @else
                window.location.href = '{{ route("login") }}';
            @endauth
        },
        
        showNotification(type, message) {
            window.dispatchEvent(new CustomEvent('show-notification', {
                detail: { type, message }
            }));
        }
    }
}
</script>
@endpush
@endsection
