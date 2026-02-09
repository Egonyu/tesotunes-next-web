@extends('frontend.layouts.music')

@section('title', 'Browse Music - Tesotunes')

@push('styles')
<style>
    .song-card {
        background: #181818;
        border-radius: 8px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
    }

    .song-card:hover {
        background: #282828;
        transform: translateY(-2px);
    }

    .play-button {
        background: #1db954;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transform: translateY(8px);
        transition: all 0.3s ease;
        box-shadow: 0 8px 24px rgba(0,0,0,.5);
    }

    .song-card:hover .play-button {
        opacity: 1;
        transform: translateY(0);
    }

    .filter-button {
        @apply px-4 py-2 rounded-full text-sm font-medium transition-all duration-200;
    }

    .filter-button.active {
        @apply bg-green-500 text-white;
    }

    .filter-button:not(.active) {
        @apply bg-gray-800 text-gray-300 hover:bg-gray-700;
    }
</style>
@endpush

@section('content')
<div class="content-container">
    <!-- Header -->
    <div class="page-header">
        <div class="text-center max-w-4xl mx-auto">
                <h1 class="text-4xl md:text-6xl font-bold mb-4">Browse Music</h1>
                <p class="text-xl text-gray-300 mb-8">Discover amazing songs from talented artists</p>
            </div>
        </div>
    </div>

    <!-- Filters and Search -->
    <div class="container mx-auto px-4 mb-8">
        <div class="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
            <form method="GET" class="flex flex-col lg:flex-row gap-4 items-center">
                <!-- Search -->
                <div class="flex-1 min-w-0">
                    <input type="text"
                           name="search"
                           value="{{ request('search') }}"
                           placeholder="Search songs or artists..."
                           class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                </div>

                <!-- Genre Filter -->
                <div class="w-full lg:w-auto">
                    <select name="genre"
                            class="w-full lg:w-auto px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option value="">All Genres</option>
                        @foreach($genres as $genre)
                            <option value="{{ $genre->id }}" {{ request('genre') == $genre->id ? 'selected' : '' }}>
                                {{ $genre->name }} ({{ $genre->songs_count }})
                            </option>
                        @endforeach
                    </select>
                </div>

                <!-- Sort Options -->
                <div class="w-full lg:w-auto">
                    <select name="sort"
                            class="w-full lg:w-auto px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option value="latest" {{ $sortBy === 'latest' ? 'selected' : '' }}>Latest</option>
                        <option value="popular" {{ $sortBy === 'popular' ? 'selected' : '' }}>Most Popular</option>
                        <option value="trending" {{ $sortBy === 'trending' ? 'selected' : '' }}>Trending</option>
                        <option value="oldest" {{ $sortBy === 'oldest' ? 'selected' : '' }}>Oldest</option>
                    </select>
                </div>

                <!-- Submit Button -->
                <button type="submit"
                        class="w-full lg:w-auto px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors duration-200">
                    <span class="material-icons-round text-sm mr-2">search</span>
                    Filter
                </button>
            </form>
        </div>
    </div>

    <!-- Songs Grid -->
    <div class="container mx-auto px-4 pb-12">
        @if($songs->count() > 0)
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                @foreach($songs as $song)
                    <div class="song-card p-4 group">
                        <!-- Artwork - Clickable -->
                        <a href="{{ route('frontend.song.show', $song->slug ?? $song->id) }}" class="block relative mb-4">
                            <div class="aspect-square bg-gray-700 rounded-lg overflow-hidden">
                                @if($song->artwork_url)
                                    <img src="{{ $song->artwork_url }}"
                                         alt="{{ $song->title }}"
                                         class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                                @else
                                    <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
                                        <span class="material-icons-round text-2xl">music_note</span>
                                    </div>
                                @endif
                            </div>

                            <!-- Play Button Overlay -->
                            <div class="absolute bottom-2 right-2" onclick="event.preventDefault(); event.stopPropagation(); playSong({{ $song->id }});">
                                <button class="play-button">
                                    <span class="material-icons-round text-black text-xl">play_arrow</span>
                                </button>
                            </div>
                        </a>

                        <!-- Song Info -->
                        <div class="min-h-0">
                            <a href="{{ route('frontend.song.show', $song->slug ?? $song->id) }}" 
                               class="block hover:underline">
                                <h3 class="font-medium text-white text-sm truncate mb-1" title="{{ $song->title }}">
                                    {{ $song->title }}
                                </h3>
                            </a>
                            <a href="{{ route('frontend.artist.show', $song->artist) }}" 
                               class="block hover:underline">
                                <p class="text-gray-400 hover:text-white text-xs truncate transition-colors" title="{{ $song->artist->stage_name }}">
                                    {{ $song->artist->stage_name }}
                                </p>
                            </a>
                            @if($song->primaryGenre)
                                <p class="text-gray-500 text-xs truncate mt-1">
                                    {{ $song->primaryGenre->name }}
                                </p>
                            @endif
                        </div>

                        <!-- Additional Info -->
                        <div class="flex items-center justify-between mt-3 text-xs text-gray-500">
                            <span class="flex items-center">
                                <span class="material-icons-round text-xs mr-1">play_arrow</span>
                                {{ number_format($song->play_count) }}
                            </span>
                            @if(auth()->check() && $song->user_has_liked)
                                <span class="material-icons-round text-red-500 text-sm">favorite</span>
                            @endif
                        </div>
                    </div>
                @endforeach
            </div>

            <!-- Pagination -->
            <div class="mt-12 flex justify-center">
                {{ $songs->appends(request()->query())->links() }}
            </div>
        @else
            <!-- No Results -->
            <div class="text-center py-16">
                <div class="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span class="material-icons-round text-4xl text-gray-400">search_off</span>
                </div>
                <h3 class="text-2xl font-semibold mb-2">No songs found</h3>
                <p class="text-gray-400 mb-6">
                    @if(request('search') || request('genre'))
                        Try adjusting your search or filter criteria.
                    @else
                        No songs have been published yet.
                    @endif
                </p>
                @if(request('search') || request('genre'))
                    <a href="{{ route('frontend.songs.index') }}"
                       class="inline-flex items-center px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors duration-200">
                        <span class="material-icons-round text-sm mr-2">clear_all</span>
                        Clear Filters
                    </a>
                @endif
            </div>
        @endif
    </div>
</div>

@push('scripts')
<script>
function playSong(songId) {
    // Integration with music player
    if (window.musicPlayer) {
        window.musicPlayer.playSong(songId);
    } else {
        // Fallback: redirect to song page
        window.location.href = `/song/${songId}`;
    }
}

// Auto-submit form when select options change
document.addEventListener('DOMContentLoaded', function() {
    const selects = document.querySelectorAll('select[name="genre"], select[name="sort"]');
    selects.forEach(select => {
        select.addEventListener('change', function() {
            this.form.submit();
        });
    });
});
</script>
@endpush
@endsection