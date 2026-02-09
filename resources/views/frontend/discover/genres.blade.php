@extends('frontend.layouts.music')

@section('title', 'Browse Genres - Tesotunes')

@push('styles')
<style>
    .genre-card {
        @apply rounded-2xl transition-all relative overflow-hidden;
        background: linear-gradient(135deg, var(--start-color), var(--end-color));
    }

    .genre-card:hover {
        @apply -translate-y-1 shadow-2xl scale-[1.02];
    }
    
    .genre-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.4) 100%);
    }
    
    .song-card-hover {
        @apply transition-all duration-200;
    }
    
    .song-card-hover:hover {
        @apply bg-gray-100 dark:bg-white/5;
    }
    
    .play-overlay {
        @apply opacity-0 group-hover:opacity-100 transition-opacity duration-200;
    }
</style>
@endpush

@section('content')
<div class="min-h-screen">
    <!-- Page Header -->
    <div class="mb-8">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">Browse by Genre</h1>
                <p class="text-gray-600 dark:text-gray-400">Explore music by your favorite genres and discover new sounds</p>
            </div>
            <div class="flex items-center gap-3 w-full sm:w-auto">
                <form action="{{ route('frontend.search') }}" method="GET" class="relative flex-1 sm:flex-none">
                    <input
                        type="text"
                        name="q"
                        placeholder="Search genres..."
                        class="w-full sm:w-80 px-4 py-3 pl-11 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    >
                    <span class="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xl">search</span>
                </form>
            </div>
        </div>
    </div>

    <!-- All Genres Grid -->
    <div class="mb-10">
        <div class="bg-white dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/50 shadow-sm">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span class="material-icons-round text-emerald-500">library_music</span>
                    All Genres
                </h2>
                <span class="text-gray-500 dark:text-gray-400 text-sm">{{ $genres->count() }} genres available</span>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                @php
                    $colors = [
                        ['start' => '#ff6b35', 'end' => '#d45087'],
                        ['start' => '#ffc107', 'end' => '#ff8f00'],
                        ['start' => '#dc3545', 'end' => '#8e24aa'],
                        ['start' => '#007bff', 'end' => '#00acc1'],
                        ['start' => '#6f42c1', 'end' => '#5e35b1'],
                        ['start' => '#10b981', 'end' => '#059669'],
                        ['start' => '#fd7e14', 'end' => '#ef5350'],
                        ['start' => '#14b8a6', 'end' => '#0d9488'],
                        ['start' => '#8b5cf6', 'end' => '#7c3aed'],
                        ['start' => '#ec4899', 'end' => '#db2777'],
                    ];
                @endphp
                @forelse($genres as $genre)
                    @php
                        $colorIndex = $loop->index % count($colors);
                        $color = $colors[$colorIndex];
                    @endphp
                    <a href="{{ route('frontend.genres', ['genre' => $genre->slug]) }}" 
                       class="genre-card p-5 cursor-pointer h-28 sm:h-32 flex flex-col justify-end group"
                       style="--start-color: {{ $color['start'] }}; --end-color: {{ $color['end'] }}">
                        <div class="relative z-10">
                            <h3 class="font-bold text-white text-lg sm:text-xl mb-0.5 drop-shadow-md">{{ $genre->name }}</h3>
                            <p class="text-white/80 text-xs sm:text-sm">{{ number_format($genre->songs_count) }} songs</p>
                        </div>
                        <!-- Decorative shapes -->
                        <div class="absolute top-3 right-3 w-12 h-12 bg-white/10 rounded-full blur-sm"></div>
                        <div class="absolute bottom-8 right-6 w-8 h-8 bg-white/5 rounded-lg rotate-12"></div>
                    </a>
                @empty
                    <div class="col-span-full text-center py-16">
                        <span class="material-icons-round text-5xl text-gray-300 dark:text-gray-600 mb-3 block">category</span>
                        <p class="text-gray-500 dark:text-gray-400">No genres available yet</p>
                    </div>
                @endforelse
            </div>
        </div>
    </div>

    <!-- Selected Genre Songs -->
    @if($selectedGenre && $genreSongs->count() > 0)
    <div class="mb-10" x-data="{ songs: @js($genreSongs->items()) }">
        <div class="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden">
            <!-- Genre Header -->
            <div class="p-6 border-b border-gray-100 dark:border-gray-700/50 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-900/20 dark:to-teal-900/20">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                            <span class="material-icons-round text-white text-2xl">music_note</span>
                        </div>
                        <div>
                            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $selectedGenre->name }}</h2>
                            <p class="text-gray-500 dark:text-gray-400 text-sm">{{ $genreSongs->total() }} songs</p>
                        </div>
                    </div>
                    <button @click="playAllGenreSongs()" 
                            class="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/25">
                        <span class="material-icons-round">play_arrow</span>
                        Play All
                    </button>
                </div>
            </div>
            
            <!-- Songs Grid -->
            <div class="p-6">
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    @foreach($genreSongs as $song)
                        <div class="group bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3 song-card-hover cursor-pointer"
                             @click="playSong({{ $song->id }})">
                            <div class="relative mb-3 aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600 shadow-md">
                                @if($song->artwork_url)
                                    <img src="{{ $song->artwork_url }}" alt="{{ $song->title }}" class="w-full h-full object-cover">
                                @else
                                    <div class="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                        <span class="material-icons-round text-white text-3xl">music_note</span>
                                    </div>
                                @endif
                                <!-- Play Overlay -->
                                <div class="absolute inset-0 bg-black/40 play-overlay flex items-center justify-center">
                                    <div class="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                        <span class="material-icons-round text-white text-xl">play_arrow</span>
                                    </div>
                                </div>
                            </div>
                            <h3 class="font-semibold text-gray-900 dark:text-white truncate text-sm">{{ $song->title }}</h3>
                            <a href="{{ route('frontend.artist.show', $song->artist) }}" 
                               class="text-gray-500 dark:text-gray-400 text-xs truncate block hover:text-emerald-500 dark:hover:text-emerald-400"
                               @click.stop>
                                {{ $song->artist->stage_name }}
                            </a>
                        </div>
                    @endforeach
                </div>
                
                <!-- Pagination -->
                <div class="mt-8">
                    {{ $genreSongs->links() }}
                </div>
            </div>
        </div>
    </div>
    @endif

    <!-- Content Grid -->
    <div class="grid lg:grid-cols-3 gap-8">
        <!-- Main Content - Top Genres -->
        <div class="lg:col-span-2 space-y-6">
            @if($genres->count() > 0)
            <div class="bg-white dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/50 shadow-sm">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span class="material-icons-round text-amber-500">trending_up</span>
                        Popular Genres
                    </h2>
                </div>
                <div class="space-y-3">
                    @foreach($genres->take(8) as $index => $genre)
                        <a href="{{ route('frontend.genres', ['genre' => $genre->slug]) }}" 
                           class="flex items-center gap-4 p-4 rounded-xl transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 group border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow">
                                {{ $index + 1 }}
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-gray-900 dark:text-white font-medium group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{{ $genre->name }}</p>
                                <p class="text-gray-500 dark:text-gray-400 text-sm">{{ number_format($genre->songs_count) }} songs</p>
                            </div>
                            <span class="material-icons-round text-gray-300 dark:text-gray-600 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">chevron_right</span>
                        </a>
                    @endforeach
                </div>
            </div>
            @endif
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
            <!-- Genre Stats Card -->
            @if($genres->count() > 0)
            <div class="bg-white dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/50 shadow-sm">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                    <span class="material-icons-round text-blue-500">insights</span>
                    Statistics
                </h3>
                <div class="space-y-4">
                    <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                        <span class="text-gray-600 dark:text-gray-400 text-sm">Total Genres</span>
                        <span class="text-gray-900 dark:text-white font-bold text-lg">{{ $genres->count() }}</span>
                    </div>
                    @if($genres->first())
                    <div class="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                        <span class="text-gray-600 dark:text-gray-400 text-sm">Most Popular</span>
                        <span class="text-emerald-600 dark:text-emerald-400 font-semibold">{{ $genres->first()->name }}</span>
                    </div>
                    @endif
                    @if($selectedGenre)
                    <div class="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                        <span class="text-gray-600 dark:text-gray-400 text-sm">Viewing</span>
                        <span class="text-blue-600 dark:text-blue-400 font-semibold">{{ $selectedGenre->name }}</span>
                    </div>
                    @endif
                </div>
            </div>
            @endif

            <!-- Discovery Tips Card -->
            <div class="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
                    <span class="material-icons-round">explore</span>
                    Genre Discovery
                </h3>
                <div class="space-y-4">
                    <div class="flex items-start gap-3 bg-white/10 rounded-xl p-3">
                        <span class="material-icons-round text-amber-300 mt-0.5">lightbulb</span>
                        <div>
                            <p class="font-medium text-sm">Explore New Sounds</p>
                            <p class="text-white/70 text-xs mt-0.5">Branch out from your favorites</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3 bg-white/10 rounded-xl p-3">
                        <span class="material-icons-round text-pink-300 mt-0.5">radio</span>
                        <div>
                            <p class="font-medium text-sm">Genre Radio</p>
                            <p class="text-white/70 text-xs mt-0.5">Endless music from any genre</p>
                        </div>
                    </div>
                </div>
                @guest
                    <a href="{{ route('register') }}" class="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-full text-sm font-medium transition-colors">
                        Sign up to discover more
                        <span class="material-icons-round text-sm">arrow_forward</span>
                    </a>
                @else
                    <a href="{{ route('frontend.dashboard') }}" class="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-full text-sm font-medium transition-colors">
                        View your music
                        <span class="material-icons-round text-sm">arrow_forward</span>
                    </a>
                @endauth
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
    function playSong(songId) {
        // Find the song in the genre songs
        const songs = @json($genreSongs ?? collect([]));
        const allSongs = Array.isArray(songs) ? songs : (songs.data || []);
        const song = allSongs.find(s => s.id === songId);
        
        if (song && window.TesoTunes) {
            window.TesoTunes.play(song, allSongs, allSongs.findIndex(s => s.id === songId));
        } else if (song) {
            window.dispatchEvent(new CustomEvent('play-track', {
                detail: { track: song, queue: allSongs }
            }));
        }
    }
    
    function playAllGenreSongs() {
        const songs = @json($genreSongs ?? collect([]));
        const allSongs = Array.isArray(songs) ? songs : (songs.data || []);
        
        if (allSongs.length > 0 && window.TesoTunes) {
            window.TesoTunes.setQueue(allSongs, 0, true);
        }
    }
</script>
@endpush
@endsection