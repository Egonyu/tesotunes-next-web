@extends('frontend.layouts.music')

@section('title', $song->title . ' - ' . $song->artist->stage_name)

@section('content')
<div class="min-h-screen" x-data="songPage()">
    <!-- Song Header -->
    <div class="relative bg-gradient-to-b from-purple-100/50 to-transparent dark:from-purple-900/20 dark:to-transparent">
        <div class="container mx-auto px-4 py-12">
            <div class="flex flex-col md:flex-row gap-8 items-start">
                <!-- Album Artwork -->
                <div class="flex-shrink-0">
                    @if($song->artwork_url)
                        <img src="{{ $song->artwork_url }}" alt="{{ $song->title }}" 
                             class="w-64 h-64 rounded-xl shadow-2xl object-cover ring-4 ring-gray-300 dark:ring-gray-700"
                             onerror="this.onerror=null; this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22256%22 height=%22256%22><rect fill=%22%236366f1%22 width=%22256%22 height=%22256%22/><text x=%2250%%22 y=%2250%%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2296%22 fill=%22white%22>♪</text></svg>';">
                    @else
                        <div class="w-64 h-64 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-2xl flex items-center justify-center ring-4 ring-gray-300 dark:ring-gray-700">
                            <span class="material-icons-round text-white" style="font-size: 96px;">music_note</span>
                        </div>
                    @endif
                </div>

                <!-- Song Info -->
                <div class="flex-1">
                    <p class="text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wide mb-2">Song</p>
                    <h1 class="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">{{ $song->title }}</h1>
                    
                    <!-- Artist Info -->
                    <div class="flex items-center gap-3 mb-6">
                        @if($song->artist->avatar)
                            <img src="{{ asset('storage/' . $song->artist->avatar) }}" alt="{{ $song->artist->stage_name }}" 
                                 class="w-8 h-8 rounded-full object-cover"
                                 onerror="this.onerror=null; this.style.display='none';">
                        @endif
                        <a href="{{ route('frontend.artist.show', $song->artist) }}" 
                           class="text-gray-900 dark:text-white font-semibold hover:underline">
                            {{ $song->artist->stage_name ?? $song->artist->name }}
                        </a>
                        @if($song->artist->is_verified || $song->artist->verification_status === 'approved')
                            <span class="material-icons-round text-blue-500 text-sm">verified</span>
                        @endif
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex flex-wrap items-center gap-4">
                        <button 
                            @click="playSong()"
                            class="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-semibold flex items-center gap-2 transition-colors">
                            <span class="material-icons-round">play_arrow</span>
                            Play
                        </button>

                        <button 
                            @click="toggleLike()"
                            class="w-12 h-12 rounded-full transition-colors flex items-center justify-center"
                            :class="isLiked ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'">
                            <span class="material-icons-round" x-text="isLiked ? 'favorite' : 'favorite_border'"></span>
                        </button>

                        <button 
                            @click="addToPlaylist()"
                            class="w-12 h-12 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-white rounded-full transition-colors flex items-center justify-center">
                            <span class="material-icons-round">playlist_add</span>
                        </button>

                        <button 
                            @click="shareSong()"
                            class="w-12 h-12 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-white rounded-full transition-colors flex items-center justify-center">
                            <span class="material-icons-round">share</span>
                        </button>

                        <div class="relative" x-data="{ open: false }">
                            <button 
                                @click="open = !open"
                                class="w-12 h-12 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-white rounded-full transition-colors flex items-center justify-center">
                                <span class="material-icons-round">more_horiz</span>
                            </button>

                            <!-- Dropdown Menu -->
                            <div
                                x-show="open"
                                @click.outside="open = false"
                                x-transition
                                class="absolute right-0 top-14 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50"
                                style="display: none;">
                                <div class="py-2">
                                    <button
                                        @click="downloadSong(); open = false"
                                        class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <span class="material-icons-round text-sm">download</span>
                                        Download
                                    </button>
                                    <button
                                        @click="reportSong(); open = false"
                                        class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <span class="material-icons-round text-sm">report</span>
                                        Report
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Song Stats -->
                    <div class="flex flex-wrap gap-6 mt-6 text-sm text-gray-500 dark:text-gray-400">
                        <div class="flex items-center gap-2">
                            <span class="material-icons-round text-sm">play_circle</span>
                            <span x-text="formatNumber({{ $song->play_count ?? 0 }})"></span> plays
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="material-icons-round text-sm">favorite</span>
                            <span x-text="formatNumber(likesCount)"></span> likes
                        </div>
                        @if($song->duration)
                            <div class="flex items-center gap-2">
                                <span class="material-icons-round text-sm">schedule</span>
                                {{ gmdate('i:s', $song->duration) }}
                            </div>
                        @endif
                        @if($song->created_at)
                            <div class="flex items-center gap-2">
                                <span class="material-icons-round text-sm">calendar_today</span>
                                {{ $song->created_at->format('M d, Y') }}
                            </div>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Content Sections -->
    <div class="container mx-auto px-4 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Main Content -->
            <div class="lg:col-span-2 space-y-8">
                <!-- Song Details -->
                <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                    <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Song Details</h2>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        @if($song->primaryGenre)
                            <div>
                                <p class="text-gray-500 dark:text-gray-400 mb-1">Genre</p>
                                <p class="text-gray-900 dark:text-white font-medium">{{ $song->primaryGenre->name }}</p>
                            </div>
                        @endif
                        @if($song->album)
                            <div>
                                <p class="text-gray-500 dark:text-gray-400 mb-1">Album</p>
                                <a href="#" class="text-gray-900 dark:text-white font-medium hover:underline">{{ $song->album->title }}</a>
                            </div>
                        @endif
                        @if($song->language)
                            <div>
                                <p class="text-gray-500 dark:text-gray-400 mb-1">Language</p>
                                <p class="text-gray-900 dark:text-white font-medium">{{ strtoupper($song->language) }}</p>
                            </div>
                        @endif
                        @if($song->is_explicit)
                            <div>
                                <p class="text-gray-500 dark:text-gray-400 mb-1">Content</p>
                                <span class="inline-flex items-center gap-1 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-500 text-red-600 dark:text-red-400 px-2 py-1 rounded text-xs">
                                    <span class="material-icons-round text-xs">warning</span>
                                    Explicit
                                </span>
                            </div>
                        @endif
                    </div>
                </div>

                <!-- Related Songs -->
                @if($relatedSongs->count() > 0)
                    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">You Might Also Like</h2>
                        <div class="space-y-2">
                            @foreach($relatedSongs as $relatedSong)
                                <div class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group">
                                    <button 
                                        onclick="window.location.href='{{ route('frontend.song.show', $relatedSong) }}'"
                                        class="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                                        @if($relatedSong->artwork_url)
                                            <img src="{{ $relatedSong->artwork_url }}" alt="{{ $relatedSong->title }}" 
                                                 class="w-full h-full object-cover"
                                                 onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\'w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center\'><span class=\'material-icons-round text-gray-400\'>music_note</span></div>';">
                                        @else
                                            <div class="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                                <span class="material-icons-round text-gray-400">music_note</span>
                                            </div>
                                        @endif
                                        <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <span class="material-icons-round text-white">play_arrow</span>
                                        </div>
                                    </button>
                                    <div class="flex-1 min-w-0">
                                        <a href="{{ route('frontend.song.show', $relatedSong) }}" 
                                           class="text-gray-900 dark:text-white font-medium hover:underline block truncate">
                                            {{ $relatedSong->title }}
                                        </a>
                                        <a href="{{ route('frontend.artist.show', $relatedSong->artist) }}" 
                                           class="text-gray-500 dark:text-gray-400 text-sm hover:underline block truncate">
                                            {{ $relatedSong->artist->stage_name }}
                                        </a>
                                    </div>
                                    @if($relatedSong->duration)
                                        <span class="text-gray-500 dark:text-gray-400 text-sm">
                                            {{ gmdate('i:s', $relatedSong->duration) }}
                                        </span>
                                    @endif
                                </div>
                            @endforeach
                        </div>
                    </div>
                @endif
            </div>

            <!-- Sidebar -->
            <div class="space-y-6">
                <!-- Artist Info -->
                <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">About the Artist</h3>
                    <div class="flex items-center gap-4 mb-4">
                        @if($song->artist->avatar)
                            <img src="{{ asset('storage/' . $song->artist->avatar) }}" alt="{{ $song->artist->stage_name }}" 
                                 class="w-16 h-16 rounded-full object-cover"
                                 onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\'w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center\'><span class=\'material-icons-round text-white\'>person</span></div>';">
                        @else
                            <div class="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                                <span class="material-icons-round text-white">person</span>
                            </div>
                        @endif
                        <div>
                            <a href="{{ route('frontend.artist.show', $song->artist) }}" 
                               class="text-gray-900 dark:text-white font-bold hover:underline">
                                {{ $song->artist->stage_name }}
                            </a>
                            <p class="text-gray-500 dark:text-gray-400 text-sm">{{ number_format($song->artist->followers_count ?? 0) }} followers</p>
                        </div>
                    </div>
                    <a href="{{ route('frontend.artist.show', $song->artist) }}" 
                       class="block w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-center py-2 rounded-lg transition-colors">
                        View Profile
                    </a>
                </div>

                <!-- Quick Stats -->
                <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Statistics</h3>
                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                            <span class="text-gray-500 dark:text-gray-400">Plays</span>
                            <span class="text-gray-900 dark:text-white font-semibold" x-text="formatNumber({{ $song->play_count ?? 0 }})"></span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-gray-500 dark:text-gray-400">Likes</span>
                            <span class="text-gray-900 dark:text-white font-semibold" x-text="formatNumber(likesCount)"></span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-gray-500 dark:text-gray-400">Downloads</span>
                            <span class="text-gray-900 dark:text-white font-semibold">{{ number_format($song->download_count ?? 0) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
function songPage() {
    return {
        isLiked: {{ $isLiked ? 'true' : 'false' }},
        likesCount: {{ $song->likes_count ?? 0 }},

        formatNumber(num) {
            if (num >= 1000000) {
                return (num / 1000000).toFixed(1) + 'M';
            }
            if (num >= 1000) {
                return (num / 1000).toFixed(1) + 'K';
            }
            return num.toString();
        },

        playSong() {
            console.log('Playing song: {{ $song->title }}');
            
            // Dispatch custom event that the global music player listens for
            window.dispatchEvent(new CustomEvent('play-track', {
                detail: {
                    track: {
                        id: {{ $song->id }},
                        title: '{{ addslashes($song->title) }}',
                        artist: '{{ addslashes($song->artist->stage_name ?? $song->artist->name) }}',
                        artwork: '{{ $song->artwork_url }}'
                    },
                    queue: [] // Can add related songs here later
                }
            }));
        },

        toggleLike() {
            @auth
                fetch('/api/v1/tracks/{{ $song->id }}/like', {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                        'Accept': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        this.isLiked = data.is_liked;
                        this.likesCount = data.is_liked ? this.likesCount + 1 : this.likesCount - 1;
                        this.showNotification('success', data.message || (data.is_liked ? 'Added to liked songs' : 'Removed from liked songs'));
                    }
                })
                .catch(error => {
                    console.error('Like error:', error);
                    this.showNotification('error', 'Failed to update like status');
                });
            @else
                window.location.href = '{{ route("login") }}';
            @endauth
        },

        addToPlaylist() {
            @auth
                // Fetch user's playlists and show modal
                this.fetchPlaylists();
            @else
                window.location.href = '{{ route("login") }}';
            @endauth
        },

        async fetchPlaylists() {
            try {
                const response = await fetch('/api/v1/my/playlists', {
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                        'Accept': 'application/json'
                    }
                });

                const data = await response.json();
                
                if (data.success) {
                    this.showPlaylistModal(data.data.data || data.data);
                } else {
                    this.showNotification('error', 'Failed to load playlists');
                }
            } catch (error) {
                console.error('Fetch playlists error:', error);
                this.showNotification('error', 'Failed to load playlists');
            }
        },

        showPlaylistModal(playlists) {
            // Create modal HTML
            const modalHtml = `
                <div id="playlist-modal" class="fixed inset-0 z-[9999] overflow-y-auto" style="display: block;">
                    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <!-- Backdrop -->
                        <div class="fixed inset-0 transition-opacity bg-black bg-opacity-75" 
                             onclick="document.getElementById('playlist-modal').remove()" 
                             style="z-index: 9998;"></div>
                        
                        <!-- Modal content -->
                        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        
                        <div class="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-gray-800 shadow-xl rounded-2xl relative" 
                             style="z-index: 9999;">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-lg font-bold text-white">Add to Playlist</h3>
                                <button type="button" onclick="document.getElementById('playlist-modal').remove()" 
                                        class="text-gray-400 hover:text-white transition-colors">
                                    <span class="material-icons-round">close</span>
                                </button>
                            </div>

                            <div class="mb-4">
                                <button type="button" onclick="showCreatePlaylistForm()" 
                                        class="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors">
                                    <span class="material-icons-round">add</span>
                                    Create New Playlist
                                </button>
                            </div>

                            ${playlists.length > 0 ? `
                                <div class="space-y-2 max-h-96 overflow-y-auto">
                                    ${playlists.map(playlist => {
                                        const playlistName = (playlist.title || playlist.name || 'Untitled').replace(/'/g, "\\'");
                                        return `
                                        <button type="button" onclick="addToPlaylistAction(${playlist.id}, '${playlistName}')" 
                                                class="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-left">
                                            <div class="w-12 h-12 bg-gray-600 rounded flex items-center justify-center flex-shrink-0">
                                                <span class="material-icons-round text-gray-300">queue_music</span>
                                            </div>
                                            <div class="flex-1 min-w-0">
                                                <p class="text-white font-medium truncate">${playlist.title || playlist.name || 'Untitled'}</p>
                                                <p class="text-gray-400 text-sm">${playlist.songs_count || 0} songs</p>
                                            </div>
                                        </button>
                                    `;}).join('')}
                                </div>
                            ` : `
                                <div class="text-center py-8">
                                    <span class="material-icons-round text-gray-500 text-5xl mb-2">music_note</span>
                                    <p class="text-gray-400">You don't have any playlists yet</p>
                                    <p class="text-gray-500 text-sm mt-1">Create one to get started!</p>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHtml);
        },

        shareSong() {
            if (navigator.share) {
                navigator.share({
                    title: '{{ $song->title }} by {{ $song->artist->stage_name }}',
                    text: 'Listen to {{ $song->title }} by {{ $song->artist->stage_name }} on Tesotunes',
                    url: window.location.href
                }).catch(err => console.log('Share cancelled'));
            } else {
                this.copySongLink();
            }
        },

        copySongLink() {
            const url = window.location.href;
            
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url)
                    .then(() => this.showNotification('success', 'Song link copied!'))
                    .catch(err => this.fallbackCopy(url));
            } else {
                this.fallbackCopy(url);
            }
        },

        fallbackCopy(text) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            
            try {
                document.execCommand('copy');
                this.showNotification('success', 'Song link copied!');
            } catch (err) {
                this.showNotification('error', 'Failed to copy link');
            }
            
            document.body.removeChild(textarea);
        },

        downloadSong() {
            @auth
                window.location.href = '/api/v1/tracks/{{ $song->id }}/download';
            @else
                window.location.href = '{{ route("login") }}';
            @endauth
        },

        reportSong() {
            @auth
                if (confirm('Report this song for inappropriate content?')) {
                    fetch('/api/report/song/{{ $song->id }}', {
                        method: 'POST',
                        headers: {
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            reason: 'User report from song page',
                            type: 'song'
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            this.showNotification('success', 'Report submitted successfully');
                        }
                    })
                    .catch(error => {
                        this.showNotification('error', 'Failed to submit report');
                    });
                }
            @else
                window.location.href = '{{ route("login") }}';
            @endauth
        },

        showNotification(type, message) {
            window.dispatchEvent(new CustomEvent('show-notification', {
                detail: { type: type, message: message }
            }));
        }
    }
}

// Global functions for playlist modal
function showCreatePlaylistForm() {
    const modal = document.getElementById('playlist-modal');
    if (!modal) return;

    const content = modal.querySelector('.inline-block');
    if (!content) return;
    
    content.innerHTML = `
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-white">Create Playlist</h3>
            <button type="button" onclick="document.getElementById('playlist-modal').remove()" 
                    class="text-gray-400 hover:text-white transition-colors">
                <span class="material-icons-round">close</span>
            </button>
        </div>

        <form onsubmit="createPlaylist(event)" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Playlist Name</label>
                <input type="text" id="playlist-title" required
                       class="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500"
                       placeholder="My Awesome Playlist" autocomplete="off">
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
                <textarea id="playlist-description" rows="3"
                          class="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500"
                          placeholder="Add a description..."></textarea>
            </div>

            <div class="flex items-center gap-3">
                <label class="flex items-center cursor-pointer">
                    <input type="checkbox" id="playlist-public" checked
                           class="form-checkbox h-5 w-5 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2">
                    <span class="ml-2 text-sm text-gray-300">Public playlist</span>
                </label>
            </div>

            <div class="flex gap-3 pt-2">
                <button type="button" onclick="document.getElementById('playlist-modal').remove()"
                        class="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Cancel
                </button>
                <button type="submit"
                        class="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Create & Add Song
                </button>
            </div>
        </form>
    `;
    
    // Focus the title input
    setTimeout(() => {
        document.getElementById('playlist-title')?.focus();
    }, 100);
}

async function createPlaylist(event) {
    event.preventDefault();

    const title = document.getElementById('playlist-title').value;
    const description = document.getElementById('playlist-description').value;
    const isPublic = document.getElementById('playlist-public').checked;

    try {
        const response = await fetch('/api/v1/playlists', {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: title,
                description: description,
                is_public: isPublic
            })
        });

        const data = await response.json();

        if (data.success) {
            // Now add the song to the newly created playlist
            addToPlaylistAction(data.data.id, data.data.title);
        } else {
            window.dispatchEvent(new CustomEvent('show-notification', {
                detail: { type: 'error', message: data.message || 'Failed to create playlist' }
            }));
        }
    } catch (error) {
        console.error('Create playlist error:', error);
        window.dispatchEvent(new CustomEvent('show-notification', {
            detail: { type: 'error', message: 'Failed to create playlist' }
        }));
    }
}

async function addToPlaylistAction(playlistId, playlistTitle) {
    const songId = {{ $song->id }};

    try {
        const response = await fetch(`/api/v1/playlists/${playlistId}/songs/${songId}`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                'Accept': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('playlist-modal')?.remove();
            window.dispatchEvent(new CustomEvent('show-notification', {
                detail: { type: 'success', message: `Added to ${playlistTitle}` }
            }));
        } else {
            window.dispatchEvent(new CustomEvent('show-notification', {
                detail: { type: 'error', message: data.message || 'Failed to add song' }
            }));
        }
    } catch (error) {
        console.error('Add to playlist error:', error);
        window.dispatchEvent(new CustomEvent('show-notification', {
            detail: { type: 'error', message: 'Failed to add song to playlist' }
        }));
    }
}
</script>
@endpush
@endsection
