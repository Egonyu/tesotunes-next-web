@extends('frontend.layouts.music')

@section('title', $artist->stage_name . ' - All Tracks')

@section('content')
<div x-data="artistTracks()">
    <!-- Artist Header -->
    <div class="relative h-40 bg-gradient-to-b from-green-900/50 to-black">
        @if($artist->cover_image)
            <img
                src="{{ $artist->cover_image }}"
                alt="{{ $artist->stage_name ?? $artist->name }}"
                class="absolute inset-0 w-full h-full object-cover opacity-30"
            >
        @endif
        <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

        <div class="absolute bottom-0 left-0 right-0 p-6">
            <div class="flex items-center gap-4">
                <div class="w-16 h-16 bg-gray-600 rounded-full overflow-hidden border-2 border-white/20">
                    <img
                        src="{{ $artist->avatar_url }}"
                        alt="{{ $artist->stage_name ?? $artist->name }}"
                        class="w-full h-full object-cover"
                    >
                </div>
                <div>
                    <h1 class="text-2xl font-bold text-white">{{ $artist->stage_name ?? $artist->name }}</h1>
                    <p class="text-gray-300">{{ number_format($tracks->total()) }} tracks</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Controls Bar -->
    <div class="bg-black/20 backdrop-blur-sm p-4 border-b border-gray-800">
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
                <button
                    @click="playAll()"
                    class="w-12 h-12 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center transition-colors"
                >
                    <span class="material-icons-round text-white">play_arrow</span>
                </button>

                <button
                    @click="shuffleAll()"
                    class="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                    <span class="material-icons-round">shuffle</span>
                </button>
            </div>

            <!-- Sort Options -->
            <div class="flex items-center gap-2">
                <select
                    x-model="sortBy"
                    @change="updateSort()"
                    class="bg-gray-800 text-white border border-gray-700 rounded px-3 py-1 text-sm"
                >
                    <option value="play_count">Most Popular</option>
                    <option value="created_at">Recently Added</option>
                    <option value="title">Title A-Z</option>
                    <option value="release_date">Release Date</option>
                </select>
            </div>
        </div>
    </div>

    <!-- Tracks List -->
    <div class="p-6">
        <div class="space-y-2">
            @forelse($tracks as $index => $track)
                <div class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-800/50 transition-colors group">
                    <!-- Track Number -->
                    <span class="text-gray-400 font-medium text-sm w-8">
                        {{ ($tracks->currentPage() - 1) * $tracks->perPage() + $index + 1 }}
                    </span>

                    <!-- Play Button -->
                    <button
                        @click="playTrack({{ $track->id }})"
                        class="relative w-12 h-12 bg-gray-600 rounded overflow-hidden group-hover:opacity-80 flex-shrink-0"
                    >
                        @if($track->artwork_url)
                            <img src="{{ $track->artwork_url }}" alt="{{ $track->title }}" class="w-full h-full object-cover">
                        @else
                            <div class="w-full h-full flex items-center justify-center">
                                <span class="material-icons-round text-gray-400">music_note</span>
                            </div>
                        @endif
                        <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span class="material-icons-round text-white">play_arrow</span>
                        </div>
                    </button>

                    <!-- Track Info -->
                    <div class="flex-1 min-w-0">
                        <p class="text-white font-medium truncate">{{ $track->title }}</p>
                        <div class="flex items-center gap-2 text-gray-400 text-sm">
                            @if($track->genres && $track->genres->count() > 0)
                                <span>{{ $track->genres->first()->name }}</span>
                                <span>•</span>
                            @endif
                            <span>{{ number_format($track->play_count ?? 0) }} plays</span>
                            @if($track->created_at)
                                <span>•</span>
                                <span>{{ $track->created_at->format('M Y') }}</span>
                            @endif
                        </div>
                    </div>

                    <!-- Track Duration -->
                    @if($track->duration)
                        <span class="text-gray-400 text-sm">
                            {{ $track->duration_formatted }}
                        </span>
                    @endif

                    <!-- Track Actions -->
                    <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            @click="toggleLike({{ $track->id }})"
                            class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <span class="material-icons-round text-sm">
                                {{ $track->is_liked_by_user ?? false ? 'favorite' : 'favorite_border' }}
                            </span>
                        </button>

                        <div class="relative" x-data="{ open: false }">
                            <button
                                @click="open = !open"
                                class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                            >
                                <span class="material-icons-round text-sm">more_horiz</span>
                            </button>

                            <!-- Dropdown Menu -->
                            <div
                                x-show="open"
                                @click.outside="open = false"
                                x-transition:enter="transition ease-out duration-200"
                                x-transition:enter-start="opacity-0 scale-95"
                                x-transition:enter-end="opacity-100 scale-100"
                                x-transition:leave="transition ease-in duration-150"
                                x-transition:leave-start="opacity-100 scale-100"
                                x-transition:leave-end="opacity-0 scale-95"
                                class="absolute right-0 top-10 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50"
                                style="display: none;"
                            >
                                <div class="py-2">
                                    <button
                                        @click="playTrack({{ $track->id }}); open = false"
                                        class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700"
                                    >
                                        <span class="material-icons-round text-sm">play_arrow</span>
                                        Play
                                    </button>
                                    <button
                                        @click="addToQueue({{ $track->id }}); open = false"
                                        class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700"
                                    >
                                        <span class="material-icons-round text-sm">queue_music</span>
                                        Add to Queue
                                    </button>
                                    <button
                                        @click="addToPlaylist({{ $track->id }}); open = false"
                                        class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700"
                                    >
                                        <span class="material-icons-round text-sm">playlist_add</span>
                                        Add to Playlist
                                    </button>
                                    <button
                                        @click="shareTrack({{ $track->id }}); open = false"
                                        class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700"
                                    >
                                        <span class="material-icons-round text-sm">share</span>
                                        Share
                                    </button>
                                    @if($track->is_free || auth()->user()?->hasPurchased($track))
                                        <button
                                            @click="downloadTrack({{ $track->id }}); open = false"
                                            class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700"
                                        >
                                            <span class="material-icons-round text-sm">download</span>
                                            Download
                                        </button>
                                    @endif
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            @empty
                <div class="text-center py-16">
                    <span class="material-icons-round text-gray-500 text-6xl mb-4">library_music</span>
                    <h3 class="text-xl font-semibold text-white mb-2">No tracks yet</h3>
                    <p class="text-gray-400">{{ $artist->stage_name ?? $artist->name }} hasn't released any tracks yet.</p>
                </div>
            @endforelse
        </div>

        <!-- Pagination -->
        @if($tracks->hasPages())
            <div class="mt-8">
                {{ $tracks->links() }}
            </div>
        @endif
    </div>
</div>

@push('scripts')
<script>
function artistTracks() {
    return {
        sortBy: 'play_count',

        playAll() {
            // Implement play all functionality
            console.log('Playing all tracks');
        },

        shuffleAll() {
            // Implement shuffle functionality
            console.log('Shuffling all tracks');
        },

        playTrack(trackId) {
            // Implement play track functionality
            console.log('Playing track:', trackId);
        },

        toggleLike(trackId) {
            @auth
                fetch(`/api/songs/${trackId}/like`, {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                        'Accept': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Find and update the like button
                        const likeButtons = document.querySelectorAll(`[onclick*="toggleLike(${trackId})"]`);
                        likeButtons.forEach(button => {
                            const icon = button.querySelector('.material-icons-round');
                            if (icon) {
                                icon.textContent = data.is_liked ? 'favorite' : 'favorite_border';
                                button.style.color = data.is_liked ? '#ef4444' : '';
                            }
                        });

                        // Show notification
                        window.dispatchEvent(new CustomEvent('show-notification', {
                            detail: {
                                type: 'success',
                                message: data.message
                            }
                        }));
                    }
                })
                .catch(error => {
                    console.error('Like error:', error);
                    window.dispatchEvent(new CustomEvent('show-notification', {
                        detail: {
                            type: 'error',
                            message: 'Failed to update like status'
                        }
                    }));
                });
            @else
                window.location.href = '{{ route("login") }}';
            @endauth
        },

        addToQueue(trackId) {
            console.log('Adding to queue:', trackId);
        },

        addToPlaylist(trackId) {
            console.log('Adding to playlist:', trackId);
        },

        shareTrack(trackId) {
            if (navigator.share) {
                navigator.share({
                    title: 'Check out this track',
                    url: `${window.location.origin}/song/${trackId}`
                });
            } else {
                navigator.clipboard.writeText(`${window.location.origin}/song/${trackId}`);
                window.dispatchEvent(new CustomEvent('show-notification', {
                    detail: { type: 'success', message: 'Track URL copied to clipboard!' }
                }));
            }
        },

        downloadTrack(trackId) {
            window.location.href = `/music/download?song=${trackId}`;
        },

        updateSort() {
            const url = new URL(window.location);
            url.searchParams.set('sort', this.sortBy);
            window.location.href = url.toString();
        }
    }
}
</script>
@endpush
@endsection
