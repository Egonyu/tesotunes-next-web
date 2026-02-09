@extends('frontend.layouts.music')

@section('title', $playlist->name ?? 'Playlist')

@push('styles')
<style>
    .song-row:hover .row-index { display: none; }
    .song-row:hover .row-play { display: flex; }
    .song-row .row-play { display: none; }
</style>
@endpush

@section('content')
<div x-data="playlistPage()">
    <!-- Sticky Header -->
    <header class="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl h-16 flex items-center justify-between px-6 rounded-xl mb-6 border border-gray-200 dark:border-gray-700/50">
        <div class="flex items-center gap-4">
            <div class="flex gap-2 mr-4">
                <button onclick="history.back()" class="w-8 h-8 rounded-full bg-gray-100 dark:bg-black/40 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-black/60 text-gray-700 dark:text-white transition-colors">
                    <span class="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <button onclick="history.forward()" class="w-8 h-8 rounded-full bg-gray-100 dark:bg-black/40 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-black/60 text-gray-700 dark:text-white transition-colors">
                    <span class="material-symbols-outlined text-sm">chevron_right</span>
                </button>
            </div>
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">Playlist</h1>
        </div>
    </header>

    <!-- Playlist Banner / Hero Section -->
    <div class="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-r from-brand-green/20 via-brand-purple/20 to-brand-blue/20 dark:from-brand-green/10 dark:via-brand-purple/10 dark:to-brand-blue/10">
        <div class="absolute inset-0 bg-gradient-to-t from-white/80 dark:from-gray-900/80 to-transparent"></div>
        <div class="relative p-8 flex flex-col md:flex-row items-end gap-6">
            <!-- Playlist Cover -->
            <div class="w-48 h-48 md:w-56 md:h-56 flex-shrink-0 shadow-2xl rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                @if($playlist->artwork)
                    <img alt="{{ $playlist->name }}" class="w-full h-full object-cover" src="{{ asset('storage/' . $playlist->artwork) }}"/>
                @elseif($playlist->cover_image)
                    <img alt="{{ $playlist->name }}" class="w-full h-full object-cover" src="{{ asset('storage/' . $playlist->cover_image) }}"/>
                @else
                    <div class="w-full h-full bg-gradient-to-br from-brand-green/50 to-brand-purple/50 flex items-center justify-center">
                        <span class="material-symbols-outlined text-6xl text-white/70">queue_music</span>
                    </div>
                @endif
            </div>
            
            <!-- Playlist Info -->
            <div class="flex-1">
                <span class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 block">
                    {{ ucfirst($playlist->visibility ?? 'Public') }} Playlist
                </span>
                <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">{{ $playlist->name }}</h2>
                @if($playlist->description)
                    <p class="text-gray-600 dark:text-gray-400 text-sm mb-4 max-w-2xl">{{ $playlist->description }}</p>
                @endif
                <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    @if($playlist->owner)
                        <a class="font-semibold text-gray-900 dark:text-white hover:underline" href="{{ route('frontend.profile.show', $playlist->owner->username ?? $playlist->owner->id) }}">
                            {{ $playlist->owner->name ?? 'TesoTunes' }}
                        </a>
                        <span>•</span>
                    @endif
                    <span>{{ number_format($playlist->follower_count ?? 0) }} followers</span>
                    <span>•</span>
                    <span>{{ $playlist->songs_count ?? $playlist->songs->count() }} songs</span>
                    <span>•</span>
                    <span>
                        @php
                            $totalSeconds = $playlist->songs->sum('duration_seconds') ?? $playlist->songs->sum('duration') ?? 0;
                            $hours = floor($totalSeconds / 3600);
                            $minutes = floor(($totalSeconds % 3600) / 60);
                        @endphp
                        @if($hours > 0)
                            {{ $hours }} hr {{ $minutes }} min
                        @else
                            {{ $minutes }} min
                        @endif
                    </span>
                </div>
            </div>
        </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex items-center gap-4 mb-8">
        <button @click="playAll()" class="w-14 h-14 rounded-full bg-brand-green hover:bg-green-600 flex items-center justify-center shadow-lg shadow-green-500/20 hover:shadow-green-500/30 transition-all hover:scale-105">
            <span class="material-symbols-outlined text-white text-3xl">play_arrow</span>
        </button>
        
        <button @click="toggleFollow()" class="w-12 h-12 rounded-full flex items-center justify-center transition-colors" :class="isFollowing ? 'bg-brand-green/10 text-brand-green' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-brand-green'">
            <span class="material-symbols-outlined text-2xl" x-text="isFollowing ? 'favorite' : 'favorite_border'"></span>
        </button>
        
        <button @click="shuffle()" class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <span class="material-symbols-outlined text-xl">shuffle</span>
        </button>
        
        <div class="relative" x-data="{ open: false }">
            <button @click="open = !open" class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <span class="material-symbols-outlined text-xl">more_horiz</span>
            </button>
            <div x-show="open" @click.outside="open = false" x-transition class="absolute left-0 top-14 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50" style="display: none;">
                <div class="py-2">
                    <button @click="addToQueue(); open = false" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <span class="material-symbols-outlined text-sm">queue_music</span>
                        Add to Queue
                    </button>
                    <button @click="sharePlaylist(); open = false" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <span class="material-symbols-outlined text-sm">share</span>
                        Share
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Songs List -->
    <div class="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 overflow-hidden">
        <!-- Table Header -->
        <div class="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700/50">
            <div class="col-span-1 text-center">#</div>
            <div class="col-span-5 md:col-span-4">Title</div>
            <div class="col-span-3 hidden md:block">Album</div>
            <div class="col-span-2 hidden lg:block">Added</div>
            <div class="col-span-6 md:col-span-2 text-right">
                <span class="material-symbols-outlined text-sm">schedule</span>
            </div>
        </div>
        
        <!-- Songs -->
        @forelse($playlist->songs as $index => $song)
        <div class="song-row group grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer border-b border-gray-100 dark:border-gray-700/30 last:border-0" @click="playSong({{ $song->id }})">
            <div class="col-span-1 text-center text-gray-500 dark:text-gray-400">
                <span class="row-index text-sm">{{ $index + 1 }}</span>
                <span class="row-play material-symbols-outlined text-brand-green text-lg justify-center">play_arrow</span>
            </div>
            <div class="col-span-5 md:col-span-4 flex items-center gap-3">
                <div class="w-10 h-10 rounded bg-gray-100 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
                    @if($song->artwork_url)
                        <img src="{{ $song->artwork_url }}" alt="{{ $song->title }}" class="w-full h-full object-cover">
                    @else
                        <div class="w-full h-full flex items-center justify-center">
                            <span class="material-symbols-outlined text-gray-400 text-sm">music_note</span>
                        </div>
                    @endif
                </div>
                <div class="min-w-0">
                    <a href="{{ route('frontend.songs.show', $song) }}" class="font-medium text-gray-900 dark:text-white hover:underline truncate block" @click.stop>
                        {{ $song->title }}
                    </a>
                    <a href="{{ route('frontend.artist.show', $song->artist) }}" class="text-xs text-gray-500 dark:text-gray-400 hover:underline truncate block" @click.stop>
                        {{ $song->artist->stage_name ?? $song->artist->name ?? 'Unknown Artist' }}
                    </a>
                </div>
            </div>
            <div class="col-span-3 hidden md:block text-sm text-gray-500 dark:text-gray-400 truncate">
                {{ $song->album->title ?? 'Single' }}
            </div>
            <div class="col-span-2 hidden lg:block text-sm text-gray-500 dark:text-gray-400">
                {{ $song->pivot->added_at ? \Carbon\Carbon::parse($song->pivot->added_at)->diffForHumans() : ($song->pivot->created_at ? $song->pivot->created_at->diffForHumans() : 'Recently') }}
            </div>
            <div class="col-span-6 md:col-span-2 flex items-center justify-end gap-3">
                <button @click.stop="likeSong({{ $song->id }})" class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-brand-green transition-all">
                    <span class="material-symbols-outlined text-lg">favorite_border</span>
                </button>
                <span class="text-sm text-gray-500 dark:text-gray-400 w-12 text-right">
                    @php
                        $duration = $song->duration_seconds ?? $song->duration ?? 0;
                        $mins = floor($duration / 60);
                        $secs = $duration % 60;
                    @endphp
                    {{ $mins }}:{{ str_pad($secs, 2, '0', STR_PAD_LEFT) }}
                </span>
            </div>
        </div>
        @empty
        <div class="py-16 text-center">
            <span class="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-4 block">queue_music</span>
            <p class="text-lg font-semibold text-gray-900 dark:text-white mb-2">This playlist is empty</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Add some songs to get started!</p>
        </div>
        @endforelse
    </div>
</div>

@push('scripts')
<script>
function playlistPage() {
    return {
        isFollowing: {{ $isFollowing ? 'true' : 'false' }},
        
        playAll() {
            console.log('Playing all songs in playlist');
            window.dispatchEvent(new CustomEvent('play-playlist', {
                detail: { playlistId: {{ $playlist->id }} }
            }));
        },
        
        playSong(songId) {
            console.log('Playing song:', songId);
            window.dispatchEvent(new CustomEvent('play-song', {
                detail: { songId: songId }
            }));
        },
        
        toggleFollow() {
            fetch(`/playlists/{{ $playlist->id }}/follow`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    'Accept': 'application/json'
                }
            }).then(response => response.json())
            .then(data => {
                this.isFollowing = !this.isFollowing;
            });
        },
        
        shuffle() {
            console.log('Shuffle playlist');
        },
        
        addToQueue() {
            console.log('Adding playlist to queue');
        },
        
        sharePlaylist() {
            if (navigator.share) {
                navigator.share({
                    title: '{{ $playlist->name }}',
                    url: window.location.href
                });
            }
        },
        
        likeSong(songId) {
            console.log('Liking song:', songId);
        }
    }
}
</script>
@endpush
@endsection
