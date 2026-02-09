@props([
    'track',
    'showMenu' => true,
    'showStats' => false,
    'showArtist' => true,
    'size' => 'medium' // small, medium, large
])

@php
$sizeClasses = [
    'small' => 'w-32',
    'medium' => 'w-48',
    'large' => 'w-64'
];

$imageSizes = [
    'small' => 'h-32',
    'medium' => 'h-48',
    'large' => 'h-64'
];
@endphp

<div
    class="bg-gray-800 dark:bg-gray-800 rounded-lg p-4 hover:bg-gray-700 dark:hover:bg-gray-700 transition-all duration-300 group {{ $sizeClasses[$size] }}"
    x-data="trackCard({{ json_encode($track) }})"
>
    <!-- Track Artwork - Clickable -->
    <a href="{{ route('frontend.song.show', $track->slug ?? $track->id) }}" class="block relative mb-4">
        <div class="aspect-square bg-gray-600 dark:bg-gray-700 rounded-lg overflow-hidden {{ $imageSizes[$size] }}">
            <img
                src="{{ $track->artwork_url ?? $track->artwork ?? '/images/default-track.svg' }}"
                alt="{{ $track->title }}"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                onerror="this.src='/images/default-track.svg'"
            >
        </div>

        <!-- Overlay Play Button -->
        <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
             onclick="event.preventDefault(); event.stopPropagation();">
            <button
                @click="playTrack()"
                class="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700 transition-colors transform hover:scale-110"
            >
                <span class="material-icons-round text-white">play_arrow</span>
            </button>
        </div>

        <!-- Status Badge -->
        @if($track->status)
            <div class="absolute top-2 left-2">
                <span class="text-xs px-2 py-1 rounded-full font-medium
                    {{ $track->status === 'published' ? 'bg-green-600/80 text-green-100' : '' }}
                    {{ $track->status === 'pending' ? 'bg-yellow-600/80 text-yellow-100' : '' }}
                    {{ $track->status === 'rejected' ? 'bg-red-600/80 text-red-100' : '' }}
                    {{ $track->status === 'draft' ? 'bg-gray-600/80 text-gray-100' : '' }}
                ">
                    {{ ucfirst($track->status) }}
                </span>
            </div>
        @endif

        <!-- Duration -->
        @if($track->duration)
            <div class="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {{ gmdate('i:s', $track->duration) }}
            </div>
        @endif

        <!-- Menu Button -->
        @if($showMenu)
            <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div class="relative" x-data="{ open: false }">
                    <button
                        @click.stop="open = !open"
                        class="w-8 h-8 bg-black/70 rounded-full flex items-center justify-center hover:bg-black/90 transition-colors"
                    >
                        <span class="material-icons-round text-white text-sm">more_vert</span>
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
                                @click="playTrack(); open = false"
                                class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700"
                            >
                                <span class="material-icons-round text-sm">play_arrow</span>
                                Play Track
                            </button>
                            <button
                                @click="editTrack(); open = false"
                                class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700"
                            >
                                <span class="material-icons-round text-sm">edit</span>
                                Edit Details
                            </button>
                            <button
                                @click="downloadTrack(); open = false"
                                class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700"
                            >
                                <span class="material-icons-round text-sm">download</span>
                                Download
                            </button>
                            <button
                                @click="shareTrack(); open = false"
                                class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700"
                            >
                                <span class="material-icons-round text-sm">share</span>
                                Share
                            </button>
                            <div class="border-t border-gray-700 my-1"></div>
                            <button
                                @click="deleteTrack(); open = false"
                                class="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-gray-700"
                            >
                                <span class="material-icons-round text-sm">delete</span>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        @endif
    </div>

    <!-- Track Info -->
    <div class="space-y-1">
        <a href="{{ route('frontend.song.show', $track->slug ?? $track->id) }}" 
           class="block hover:underline">
            <h3 class="text-white font-medium text-sm truncate">{{ $track->title }}</h3>
        </a>
        
        @if($showArtist && isset($track->artist))
            <a href="{{ route('frontend.artist.show', $track->artist) }}" 
               class="block hover:underline">
                <p class="text-gray-400 hover:text-white text-xs truncate transition-colors">
                    {{ $track->artist->stage_name ?? $track->artist->name }}
                </p>
            </a>
        @elseif(isset($track->genre))
            <p class="text-gray-400 text-xs truncate">
                {{ $track->genre->name ?? 'Unknown Genre' }}
            </p>
        @endif

        @if($showStats && isset($track->play_count))
            <div class="flex items-center gap-2 text-xs text-gray-400">
                <span class="material-icons-round text-xs">play_arrow</span>
                <span>{{ number_format($track->play_count) }} plays</span>
            </div>
        @endif

        @if($track->price)
            <p class="text-green-500 text-xs font-medium">
                UGX {{ number_format($track->price) }}
            </p>
        @elseif($track->is_free)
            <p class="text-blue-500 text-xs font-medium">Free</p>
        @endif
    </div>
</div>

@pushOnce('scripts')
<script>
function trackCard(track) {
    return {
        track: track,

        playTrack() {
            // Emit play event for global music player
            window.dispatchEvent(new CustomEvent('play-track', {
                detail: {
                    track: {
                        id: this.track.id,
                        title: this.track.title,
                        artist_name: this.track.artist?.stage_name || this.track.artist?.name || 'Unknown Artist',
                        artwork: this.track.artwork || '/images/default-track.svg',
                        duration_seconds: this.track.duration || this.track.duration_seconds || 0,
                        file_path: this.track.file_path,
                        storage_disk: this.track.storage_disk || 'local'
                    }
                }
            }));
        },

        editTrack() {
            window.location.href = `/artist/music/${this.track.id}/edit`;
        },

        downloadTrack() {
            // Handle download
            if (this.track.file_path) {
                const encryptedFile = btoa(this.track.file_path);
                const encryptedDisk = btoa(this.track.storage_disk || 'local');
                const link = document.createElement('a');
                link.href = `/music/download?file=${encryptedFile}&disk=${encryptedDisk}`;
                link.download = `${this.track.title}.mp3`;
                link.click();
            } else {
                window.dispatchEvent(new CustomEvent('show-notification', {
                    detail: { type: 'error', message: 'Download not available for this track.' }
                }));
            }
        },

        shareTrack() {
            // Handle share functionality
            if (navigator.share) {
                navigator.share({
                    title: this.track.title,
                    text: `Check out "${this.track.title}" on Tesotunes`,
                    url: `/tracks/${this.track.id}`
                });
            } else {
                // Fallback to copy URL
                navigator.clipboard.writeText(`${window.location.origin}/tracks/${this.track.id}`);
                window.dispatchEvent(new CustomEvent('show-notification', {
                    detail: { type: 'success', message: 'Track URL copied to clipboard!' }
                }));
            }
        },

        deleteTrack() {
            if (confirm(`Are you sure you want to delete "${this.track.title}"?`)) {
                // Handle delete API call
                fetch(`/artist/music/${this.track.id}`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                        'Accept': 'application/json'
                    }
                })
                .then(response => {
                    if (response.ok) {
                        // Remove from UI or reload
                        this.$el.remove();
                        window.dispatchEvent(new CustomEvent('show-notification', {
                            detail: { type: 'success', message: 'Track deleted successfully!' }
                        }));
                    } else {
                        throw new Error('Delete failed');
                    }
                })
                .catch(error => {
                    window.dispatchEvent(new CustomEvent('show-notification', {
                        detail: { type: 'error', message: 'Failed to delete track. Please try again.' }
                    }));
                });
            }
        }
    }
}
</script>
@endpushOnce