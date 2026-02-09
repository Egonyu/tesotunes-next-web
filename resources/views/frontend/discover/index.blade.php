@extends('frontend.layouts.music')

@section('title', 'Discover Music - Tesotunes')

@section('content')
<!-- Discover Content - Using layout's page-content wrapper -->
<div class="content-container">
    <!-- Page Header -->
    <div class="page-header">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 class="page-title">Discover Music</h1>
                <p class="page-description">Explore trending music, discover new artists, and find your next favorite song</p>
            </div>
            <div class="flex items-center gap-3">
                <!-- Search Bar -->
                <div class="relative">
                    <form action="{{ route('frontend.search') }}" method="GET" class="relative">
                        <input
                            type="text"
                            name="q"
                            placeholder="Search artists, songs, albums..."
                            class="input w-full sm:w-80 pr-12"
                        >
                        <button type="submit" class="absolute right-2 top-1/2 transform -translate-y-1/2 text-secondary hover:text-primary">
                            <span class="material-icons-round icon-sm">search</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Browse Categories -->
    <div class="section-spacing">
        <div class="card">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-bold text-primary">Browse All</h2>
                <span class="text-secondary text-sm">Explore by category</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                @forelse($topGenres as $genre)
                    @php
                        $colors = [
                            ['start' => '#ff6b35', 'end' => '#d45087'],
                            ['start' => '#ffc107', 'end' => '#ff8f00'],
                            ['start' => '#dc3545', 'end' => '#8e24aa'],
                            ['start' => '#007bff', 'end' => '#00acc1'],
                            ['start' => '#6f42c1', 'end' => '#5e35b1'],
                            ['start' => '#28a745', 'end' => '#43a047'],
                            ['start' => '#fd7e14', 'end' => '#ef5350'],
                            ['start' => '#20c997', 'end' => '#26a69a'],
                        ];
                        $colorIndex = $loop->index % count($colors);
                        $color = $colors[$colorIndex];
                    @endphp
                    <a href="{{ route('frontend.genres', ['genre' => $genre->slug]) }}" 
                       class="genre-card p-4 cursor-pointer h-24 flex items-end relative active:scale-95"
                       style="--start-color: {{ $color['start'] }}; --end-color: {{ $color['end'] }}">
                        <div class="absolute inset-0 bg-black bg-opacity-20 hover:bg-opacity-0 transition-all duration-300"></div>
                        <h3 class="font-bold text-white text-lg relative z-10">{{ $genre->name }}</h3>
                        <div class="absolute top-2 right-2 w-16 h-16 bg-white bg-opacity-20 rounded-lg transform rotate-12"></div>
                        <div class="absolute bottom-2 left-2 text-xs text-white opacity-75">{{ $genre->songs_count }} songs</div>
                    </a>
                @empty
                    <div class="col-span-6 text-center py-8 text-gray-400">
                        <p>No genres available yet</p>
                    </div>
                @endforelse
            </div>
        </div>
    </div>
    <!-- Content Grid -->
    <div class="grid lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-8">
            <!-- Trending Now -->
            <div class="card">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-bold text-white">Trending Now</h2>
                    <a href="{{ route('frontend.trending') }}" class="text-brand hover:text-green-400 text-sm font-medium">View All</a>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    @forelse($trendingSongs as $song)
                        <div class="spotify-card p-4 cursor-pointer active:scale-95" onclick="goToArtistPage('{{ $song->artist->slug }}', {{ $song->id }})">
                            <div class="relative mb-4">
                                @if($song->artwork_url)
                                    <img src="{{ $song->artwork_url }}" alt="{{ $song->title }}" class="aspect-square rounded-md object-cover" loading="lazy">
                                @else
                                    <div class="aspect-square bg-gradient-to-br from-purple-500 to-pink-500 rounded-md flex items-center justify-center">
                                        <span class="material-icons-round text-white text-2xl">music_note</span>
                                    </div>
                                @endif
                                <button onclick="event.stopPropagation(); playSong({{ $song->id }})" class="play-button absolute bottom-2 right-2">
                                    <span class="material-icons-round text-black">play_arrow</span>
                                </button>
                            </div>
                            <h3 class="font-semibold text-white truncate mb-1">{{ $song->title }}</h3>
                            <p class="text-secondary text-sm truncate">{{ $song->artist->stage_name }}</p>
                            <p class="text-muted text-xs mt-1">{{ number_format($song->play_count) }} plays</p>
                        </div>
                    @empty
                        <div class="col-span-4 text-center py-8 text-gray-400">
                            <span class="material-icons-round text-4xl mb-2">music_note</span>
                            <p>No trending songs at the moment</p>
                        </div>
                    @endforelse
                </div>
            </div>

            <!-- Featured Artists -->
            <div class="card">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-bold text-white">Featured Artists</h2>
                    <a href="{{ route('frontend.artists') }}" class="text-brand hover:text-green-400 text-sm font-medium">View All</a>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    @forelse($featuredArtists as $artist)
                        <a href="{{ route('frontend.artist.show', $artist->slug) }}" class="spotify-card p-4 text-center cursor-pointer block">
                            <div class="relative mb-4">
                                <img src="{{ $artist->avatar_url }}" alt="{{ $artist->stage_name }}" 
                                     class="w-24 h-24 mx-auto rounded-full object-cover">
                                <button onclick="event.preventDefault(); playArtist('{{ $artist->slug }}')" class="play-button absolute bottom-0 right-1/2 transform translate-x-1/2">
                                    <span class="material-icons-round text-black">play_arrow</span>
                                </button>
                            </div>
                            <h3 class="font-semibold text-primary truncate mb-1">{{ $artist->stage_name }}</h3>
                            <p class="text-secondary text-sm">{{ number_format($artist->followers_count ?? 0) }} followers</p>
                        </a>
                    @empty
                        <div class="col-span-4 text-center py-8 text-secondary">
                            <span class="material-icons-round icon-xl mb-2">person</span>
                            <p>No featured artists yet</p>
                        </div>
                    @endforelse
                </div>
            </div>

            <!-- New Releases -->
            <div class="card">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-bold text-white">New Releases</h2>
                    <a href="{{ route('frontend.timeline') }}?sort=recent" class="text-brand hover:text-green-400 text-sm font-medium">View All</a>
                </div>
                <div class="space-y-4">
                    @forelse($newReleases->take(6) as $song)
                        <div class="flex items-center gap-4 p-3 hover:bg-gray-700/50 rounded-lg transition-colors cursor-pointer group" 
                             onclick="goToArtistPage('{{ $song->artist->slug }}', {{ $song->id }})">
                            @if($song->artwork_url)
                                <img src="{{ $song->artwork_url }}" alt="{{ $song->title }}" class="w-16 h-16 rounded-lg object-cover">
                            @else
                                <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                                    <span class="material-icons-round text-white">music_note</span>
                                </div>
                            @endif
                            <div class="flex-1 min-w-0">
                                <p class="text-primary font-medium truncate">{{ $song->title }}</p>
                                <p class="text-secondary text-sm">{{ $song->artist->stage_name }} • Single</p>
                            </div>
                            <div class="text-right">
                                <span class="text-xs text-muted">{{ $song->created_at->diffForHumans() }}</span>
                            </div>
                            <button onclick="event.stopPropagation(); playSong({{ $song->id }})" class="play-button-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                <span class="material-icons-round text-white icon-sm">play_arrow</span>
                            </button>
                        </div>
                    @empty
                        <div class="text-center py-8 text-secondary">
                            <span class="material-icons-round icon-xl mb-2">new_releases</span>
                            <p>No new releases yet</p>
                        </div>
                    @endforelse
                </div>
            </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
            <!-- Quick Browse -->
            <div class="card">
                <h3 class="text-lg font-bold text-white mb-4">Quick Browse</h3>
                <div class="space-y-3">
                    <a href="{{ route('frontend.trending') }}" class="btn-primary justify-start">
                        <span class="material-icons-round">trending_up</span>
                        <span class="font-medium">Trending</span>
                    </a>
                    <a href="{{ route('frontend.timeline') }}?sort=recent" class="btn-secondary justify-start">
                        <span class="material-icons-round">new_releases</span>
                        <span class="font-medium">New Releases</span>
                    </a>
                    <a href="{{ route('frontend.playlists.index') }}" class="btn-secondary justify-start">
                        <span class="material-icons-round">playlist_play</span>
                        <span class="font-medium">Top Playlists</span>
                    </a>
                    <a href="{{ route('frontend.artists') }}" class="btn-secondary justify-start">
                        <span class="material-icons-round text-gray-300">person</span>
                        <span class="text-gray-300 font-medium">Artists</span>
                    </a>
                    <a href="{{ route('frontend.genres') }}" class="flex items-center gap-3 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                        <span class="material-icons-round text-gray-300">category</span>
                        <span class="text-gray-300 font-medium">Genres</span>
                    </a>
                </div>
            </div>

            <!-- Popular Charts -->
            <div class="card">
                <h3 class="text-lg font-bold text-primary mb-4">Popular Charts</h3>
                <div class="space-y-3">
                    @php
                        $charts = [
                            ['name' => 'Global Top 50', 'desc' => 'Most played worldwide', 'color' => 'from-green-500 to-emerald-500'],
                            ['name' => 'Viral 50', 'desc' => 'Trending hits', 'color' => 'from-purple-500 to-pink-500'],
                            ['name' => 'Top Hip-Hop', 'desc' => 'Best rap tracks', 'color' => 'from-orange-500 to-red-500'],
                            ['name' => 'Pop Rising', 'desc' => 'Upcoming pop hits', 'color' => 'from-blue-500 to-cyan-500'],
                        ];
                    @endphp
                    @foreach($charts as $chart)
                        <div class="flex items-center gap-3 p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
                            <div class="w-12 h-12 rounded-lg bg-gradient-to-br {{ $chart['color'] }} flex items-center justify-center">
                                <span class="material-icons-round text-white icon-sm">trending_up</span>
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-primary font-medium text-sm truncate">{{ $chart['name'] }}</p>
                                <p class="text-secondary text-xs truncate">{{ $chart['desc'] }}</p>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>

            <!-- Music Discovery -->
            <div class="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-lg p-6 border border-purple-700/50">
                <h3 class="text-lg font-bold text-primary mb-4">Music Discovery</h3>
                <div class="space-y-3">
                    <div class="flex items-start gap-3">
                        <span class="material-icons-round text-purple-400 icon-sm mt-0.5">auto_awesome</span>
                        <div>
                            <p class="text-primary text-sm font-medium">Personalized Playlists</p>
                            <p class="text-gray-300 text-xs">Curated just for your taste</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3">
                        <span class="material-icons-round text-blue-400 icon-sm mt-0.5">explore</span>
                        <div>
                            <p class="text-primary text-sm font-medium">Genre Explorer</p>
                            <p class="text-gray-300 text-xs">Discover new music styles</p>
                        </div>
                    </div>
                </div>
                @guest
                    <a href="{{ route('register') }}" class="inline-block mt-4 text-purple-400 hover:text-purple-300 text-sm font-medium">
                        Sign up for recommendations →
                    </a>
                @else
                    <a href="{{ route('frontend.dashboard') }}" class="inline-block mt-4 text-purple-400 hover:text-purple-300 text-sm font-medium">
                        View your library →
                    </a>
                @endauth
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
function goToArtistPage(artistSlug, songId) {
    // Store the song ID to auto-play when artist page loads
    sessionStorage.setItem('autoPlaySongId', songId);
    // Navigate to artist page using slug
    window.location.href = `/artist/${artistSlug}`;
}

function playSong(songId) {
    fetch(`/api/v1/tracks/${songId}/stream-url`, {
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.track) {
            window.dispatchEvent(new CustomEvent('play-track', {
                detail: { 
                    track: data.track,
                    autoplay: true
                }
            }));
        }
    })
    .catch(error => console.error('Error playing song:', error));
}

function playArtist(artistSlug) {
    // Navigate to artist page where songs can be played
    window.location.href = `/artist/${artistSlug}`;
}
</script>
@endpush
@endsection
