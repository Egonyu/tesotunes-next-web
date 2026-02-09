@extends('layouts.admin')

@section('title', 'Music Dashboard')

@section('content')

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <!-- Total Songs -->
        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Total Songs</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ number_format($stats['total_songs'] ?? \App\Models\Song::count()) }}</p>
                </div>
                <div class="size-11 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                </div>
            </div>
        </div>

        <!-- Total Artists -->
        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Total Artists</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ number_format($stats['total_artists'] ?? \App\Models\Artist::count()) }}</p>
                </div>
                <div class="size-11 rounded-full bg-info/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
            </div>
        </div>

        <!-- Total Albums -->
        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Total Albums</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ number_format($stats['total_albums'] ?? \App\Models\Album::count()) }}</p>
                </div>
                <div class="size-11 rounded-full bg-secondary/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                </div>
            </div>
        </div>

        <!-- Pending Content -->
        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Pending Review</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ number_format($stats['pending_content']) }}</p>
                </div>
                <div class="size-11 rounded-full bg-warning/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
        </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <a href="{{ route('admin.music.songs.index') }}" class="card px-4 py-4 hover:bg-slate-50 dark:hover:bg-navy-600 transition-colors">
            <div class="flex items-center space-x-3">
                <div class="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                </div>
                <div>
                    <p class="font-medium text-slate-700 dark:text-navy-100">Manage Songs</p>
                    <p class="text-xs text-slate-400 dark:text-navy-300">{{ number_format($stats['published_songs']) }} published</p>
                </div>
            </div>
        </a>

        <a href="{{ route('admin.music.artists.index') }}" class="card px-4 py-4 hover:bg-slate-50 dark:hover:bg-navy-600 transition-colors">
            <div class="flex items-center space-x-3">
                <div class="size-10 rounded-full bg-info/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                <div>
                    <p class="font-medium text-slate-700 dark:text-navy-100">Manage Artists</p>
                    <p class="text-xs text-slate-400 dark:text-navy-300">{{ number_format($stats['verified_artists']) }} verified</p>
                </div>
            </div>
        </a>

        <a href="{{ route('admin.music.albums.index') }}" class="card px-4 py-4 hover:bg-slate-50 dark:hover:bg-navy-600 transition-colors">
            <div class="flex items-center space-x-3">
                <div class="size-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                </div>
                <div>
                    <p class="font-medium text-slate-700 dark:text-navy-100">Manage Albums</p>
                    <p class="text-xs text-slate-400 dark:text-navy-300">{{ number_format($stats['published_albums']) }} published</p>
                </div>
            </div>
        </a>

        <a href="{{ route('admin.music.playlists.index') }}" class="card px-4 py-4 hover:bg-slate-50 dark:hover:bg-navy-600 transition-colors">
            <div class="flex items-center space-x-3">
                <div class="size-10 rounded-full bg-success/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                </div>
                <div>
                    <p class="font-medium text-slate-700 dark:text-navy-100">Manage Playlists</p>
                    <p class="text-xs text-slate-400 dark:text-navy-300">{{ number_format($stats['public_playlists']) }} public</p>
                </div>
            </div>
        </a>
    </div>

    <!-- Recent Content -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Recent Songs -->
        <div class="card">
            <div class="flex items-center justify-between p-4 border-b border-slate-200 dark:border-navy-500">
                <div>
                    <h3 class="text-base font-medium text-slate-700 dark:text-navy-100">Recent Songs</h3>
                    <p class="text-xs text-slate-400 dark:text-navy-300">Quick approve pending songs</p>
                </div>
                <a href="{{ route('admin.music.songs.index') }}" class="btn size-8 rounded-full p-0 hover:bg-slate-300/20 focus:bg-slate-300/20 active:bg-slate-300/25 dark:hover:bg-navy-300/20 dark:focus:bg-navy-300/20 dark:active:bg-navy-300/25">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                </a>
            </div>
            <div class="p-4 space-y-2">
                @forelse($recentSongs ?? [] as $song)
                    <div class="song-item flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-navy-600 transition-all" data-song-id="{{ $song->id }}">
                        <div class="size-12 rounded-lg bg-slate-100 dark:bg-navy-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                            @if($song->cover_image || $song->artwork)
                                <img src="{{ asset('storage/' . ($song->cover_image ?? $song->artwork)) }}" alt="{{ $song->title }}" class="size-12 rounded-lg object-cover" 
                                     onerror="this.onerror=null; this.style.display='none'; this.parentElement.innerHTML='<svg xmlns=\'http://www.w3.org/2000/svg\' class=\'size-5 text-slate-400\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'><path stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3\' /></svg>';">
                            @else
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                </svg>
                            @endif
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="font-medium text-slate-700 dark:text-navy-100 truncate">{{ $song->title }}</p>
                            <p class="text-xs text-slate-400 dark:text-navy-300">{{ $song->artist->stage_name ?? $song->artist->name ?? 'Unknown Artist' }}</p>
                            <p class="text-xs text-slate-500 dark:text-navy-400">{{ $song->created_at->diffForHumans() }}</p>
                        </div>
                        <div class="flex items-center space-x-2 flex-shrink-0">
                            @if($song->status !== 'published')
                                <button type="button"
                                        onclick="approveSong({{ $song->id }})"
                                        class="approve-btn btn size-9 rounded-full p-0 hover:bg-success/20 focus:bg-success/20 active:bg-success/25 text-success border border-success/30"
                                        title="Approve & Publish">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </button>
                                <a href="{{ route('admin.music.songs.show', $song) }}"
                                   class="btn size-9 rounded-full p-0 hover:bg-info/10 focus:bg-info/10 active:bg-info/15 text-info"
                                   title="View Details">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </a>
                            @else
                                <a href="{{ route('admin.music.songs.show', $song) }}"
                                   class="btn size-9 rounded-full p-0 hover:bg-primary/10 focus:bg-primary/10 active:bg-primary/15 text-primary"
                                   title="View Details">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </a>
                            @endif
                            <span class="status-badge px-2.5 py-1 text-xs font-medium rounded-full {{ $song->status === 'published' ? 'bg-success/10 text-success' : ($song->status === 'pending_review' || $song->status === 'pending' ? 'bg-warning/10 text-warning' : 'bg-slate-100 text-slate-600 dark:bg-navy-500 dark:text-navy-100') }}">
                                {{ ucfirst(str_replace('_', ' ', $song->status)) }}
                            </span>
                        </div>
                    </div>
                @empty
                    <div class="text-center py-8">
                        <svg class="size-12 text-slate-300 dark:text-navy-400 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                        <p class="text-slate-400 dark:text-navy-300">No songs found</p>
                        <p class="text-xs text-slate-500 dark:text-navy-400 mt-1">Recent uploads will appear here</p>
                    </div>
                @endforelse
            </div>
        </div>

        <script>
            function approveSong(songId) {
                const songItem = document.querySelector(`.song-item[data-song-id="${songId}"]`);
                const approveBtn = songItem.querySelector('.approve-btn');
                const statusBadge = songItem.querySelector('.status-badge');

                // Disable button and show loading state
                approveBtn.disabled = true;
                approveBtn.innerHTML = '<svg class="animate-spin size-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>';

                // Send AJAX request
                fetch(`/admin/music/songs/${songId}/approve`, {
                    method: 'PATCH',
                    headers: {
                        'X-CSRF-TOKEN': '{{ csrf_token() }}',
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    // Success! Update UI
                    songItem.style.transition = 'all 0.3s ease';
                    songItem.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';

                    // Update status badge
                    statusBadge.className = 'status-badge px-2.5 py-1 text-xs font-medium rounded-full bg-success/10 text-success';
                    statusBadge.textContent = 'Published';

                    // Replace approve button with view button
                    approveBtn.outerHTML = `
                        <a href="/admin/music/songs/${songId}"
                           class="btn size-9 rounded-full p-0 hover:bg-primary/10 focus:bg-primary/10 active:bg-primary/15 text-primary"
                           title="View Details">
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </a>
                    `;

                    // Show success message
                    setTimeout(() => {
                        songItem.style.backgroundColor = '';
                    }, 2000);
                })
                .catch(error => {
                    // Error! Restore button
                    approveBtn.disabled = false;
                    approveBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="size-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>';
                    alert('Failed to approve song. Please try again.');
                    console.error('Error:', error);
                });
            }
        </script>

        <!-- Recent Artists -->
        <div class="card">
            <div class="flex items-center justify-between p-4 border-b border-slate-200 dark:border-navy-500">
                <h3 class="text-base font-medium text-slate-700 dark:text-navy-100">Recent Artists</h3>
                <a href="{{ route('admin.music.artists.index') }}" class="btn size-8 rounded-full p-0 hover:bg-slate-300/20 focus:bg-slate-300/20 active:bg-slate-300/25 dark:hover:bg-navy-300/20 dark:focus:bg-navy-300/20 dark:active:bg-navy-300/25">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                </a>
            </div>
            <div class="p-4 space-y-3">
                @forelse($recentArtists ?? [] as $artist)
                    <a href="{{ route('admin.music.artists.show', $artist) }}" class="flex items-center space-x-3 hover:bg-slate-50 dark:hover:bg-navy-600 rounded-lg p-2 -m-2 transition-colors">
                        <div class="size-10 rounded-full bg-slate-100 dark:bg-navy-600 flex items-center justify-center overflow-hidden">
                            <img src="{{ $artist->avatar_url }}" alt="{{ $artist->name }}" class="size-10 rounded-full object-cover">
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="font-medium text-slate-700 dark:text-navy-100 truncate">{{ $artist->name }}</p>
                            <p class="text-xs text-slate-400 dark:text-navy-300">{{ $artist->email }}</p>
                        </div>
                        @if($artist->is_verified)
                            <span class="size-5 text-info">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path fill-rule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.491 4.491 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
                                </svg>
                            </span>
                        @endif
                    </a>
                @empty
                    <div class="text-center py-8">
                        <p class="text-slate-400 dark:text-navy-300">No artists found</p>
                    </div>
                @endforelse
            </div>
        </div>
    </div>
@endsection