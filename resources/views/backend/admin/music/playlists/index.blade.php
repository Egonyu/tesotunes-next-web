@extends('layouts.admin')

@section('title', 'Playlists Management')

@section('content')

    <!-- Header with Stats -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Total Playlists</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ number_format($playlists->total() ?? \App\Models\Playlist::count()) }}</p>
                </div>
                <div class="size-11 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Public Playlists</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ number_format($publicPlaylists) }}</p>
                </div>
                <div class="size-11 rounded-full bg-success/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Collaborative</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ number_format($collaborativePlaylists) }}</p>
                </div>
                <div class="size-11 rounded-full bg-info/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Total Followers</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ number_format($totalFollowers) }}</p>
                </div>
                <div class="size-11 rounded-full bg-warning/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </div>
            </div>
        </div>
    </div>

    <!-- Filters & Search -->
    <div class="card mb-6">
        <div class="border-b border-slate-200 p-4 dark:border-navy-500">
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-medium text-slate-700 dark:text-navy-100">Playlists Management</h3>
                <a href="{{ route('admin.music.playlists.create') }}" class="btn bg-primary text-white hover:bg-primary-focus">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Playlist
                </a>
            </div>
        </div>

        <form method="GET" class="p-4">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <!-- Search -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Search</label>
                    <input name="search" type="text" placeholder="Playlist name, creator..."
                           value="{{ request('search') }}"
                           class="form-input mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent">
                </div>

                <!-- Type Filter -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Type</label>
                    <select name="type" class="form-select mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent">
                        <option value="">All Types</option>
                        <option value="user" {{ request('type') === 'user' ? 'selected' : '' }}>User Created</option>
                        <option value="editorial" {{ request('type') === 'editorial' ? 'selected' : '' }}>Editorial</option>
                        <option value="artist" {{ request('type') === 'artist' ? 'selected' : '' }}>Artist</option>
                    </select>
                </div>

                <!-- Privacy Filter -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Privacy</label>
                    <select name="privacy" class="form-select mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent">
                        <option value="">All</option>
                        <option value="public" {{ request('privacy') === 'public' ? 'selected' : '' }}>Public</option>
                        <option value="private" {{ request('privacy') === 'private' ? 'selected' : '' }}>Private</option>
                        <option value="collaborative" {{ request('privacy') === 'collaborative' ? 'selected' : '' }}>Collaborative</option>
                    </select>
                </div>

                <!-- Sort By -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Sort By</label>
                    <select name="sort" class="form-select mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent">
                        <option value="created_at" {{ request('sort') === 'created_at' ? 'selected' : '' }}>Latest</option>
                        <option value="followers_count" {{ request('sort') === 'followers_count' ? 'selected' : '' }}>Most Followed</option>
                        <option value="songs_count" {{ request('sort') === 'songs_count' ? 'selected' : '' }}>Most Songs</option>
                        <option value="play_count" {{ request('sort') === 'play_count' ? 'selected' : '' }}>Most Played</option>
                    </select>
                </div>
            </div>

            <div class="mt-4 flex justify-end space-x-2">
                <a href="{{ route('admin.music.playlists.index') }}" class="btn border border-slate-300 font-medium text-slate-700 hover:bg-slate-150 dark:border-navy-450 dark:text-navy-100 dark:hover:bg-navy-500">
                    Clear
                </a>
                <button type="submit" class="btn bg-primary text-white hover:bg-primary-focus">
                    Apply Filters
                </button>
            </div>
        </form>
    </div>

    <!-- Playlists Grid -->
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        @forelse($playlists ?? [] as $playlist)
            <div class="card">
                <!-- Playlist Cover -->
                <div class="relative">
                    <div class="h-48 w-full rounded-t-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        @if($playlist->cover_art)
                            <img class="h-full w-full object-cover rounded-t-lg" src="{{ Storage::url($playlist->cover_art) }}" alt="{{ $playlist->name }}" />
                        @else
                            <!-- Mosaic of first 4 songs covers -->
                            @if($playlist->songs->count() >= 4)
                                <div class="grid grid-cols-2 gap-0.5 h-full w-full">
                                    @foreach($playlist->songs->take(4) as $song)
                                        <img class="h-full w-full object-cover {{ $loop->first ? 'rounded-tl-lg' : '' }} {{ $loop->iteration === 2 ? 'rounded-tr-lg' : '' }}"
                                             src="{{ $song->cover_art ? Storage::url($song->cover_art) : asset('images/music-placeholder.png') }}"
                                             alt="{{ $song->title }}" />
                                    @endforeach
                                </div>
                            @elseif($playlist->songs->count() > 0)
                                <img class="h-full w-full object-cover rounded-t-lg"
                                     src="{{ $playlist->songs->first()->cover_art ? Storage::url($playlist->songs->first()->cover_art) : asset('images/music-placeholder.png') }}"
                                     alt="{{ $playlist->songs->first()->title }}" />
                            @else
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                </svg>
                            @endif
                        @endif
                    </div>

                    <!-- Privacy Badge -->
                    <div class="absolute top-2 right-2">
                        @if($playlist->is_collaborative)
                            <span class="badge bg-info/10 text-info rounded-full text-xs">Collaborative</span>
                        @elseif($playlist->is_public)
                            <span class="badge bg-success/10 text-success rounded-full text-xs">Public</span>
                        @else
                            <span class="badge bg-slate-150 text-slate-800 dark:bg-navy-500 dark:text-navy-100 rounded-full text-xs">Private</span>
                        @endif
                    </div>

                    <!-- Type Badge -->
                    @if($playlist->type !== 'user')
                        <div class="absolute top-2 left-2">
                            <span class="badge bg-primary/10 text-primary rounded-full text-xs">{{ ucfirst($playlist->type) }}</span>
                        </div>
                    @endif

                    <!-- Play Button Overlay -->
                    <div class="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity hover:opacity-100">
                        <button class="btn size-12 rounded-full bg-white/90 p-0 hover:bg-white">
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-slate-700" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Playlist Info -->
                <div class="p-4">
                    <h4 class="text-lg font-semibold text-slate-700 dark:text-navy-100 line-clamp-1">
                        {{ $playlist->name }}
                    </h4>

                    <div class="mt-1 flex items-center space-x-2">
                        <div class="avatar size-6">
                            <img class="rounded-full"
                                 src="{{ $playlist->user->avatar ? Storage::url($playlist->user->avatar) : asset('images/200x200.png') }}"
                                 alt="{{ $playlist->user->name }}" />
                        </div>
                        <p class="text-sm text-slate-600 dark:text-navy-100">{{ $playlist->user->name }}</p>
                    </div>

                    @if($playlist->description)
                        <p class="mt-2 text-xs text-slate-400 line-clamp-2">{{ $playlist->description }}</p>
                    @endif

                    <div class="mt-2 flex items-center justify-between text-xs text-slate-400">
                        <span>{{ $playlist->songs_count }} {{ Str::plural('song', $playlist->songs_count) }}</span>
                        <span>{{ $playlist->created_at->diffForHumans() }}</span>
                    </div>

                    <!-- Stats -->
                    <div class="mt-3 grid grid-cols-3 gap-2 text-center">
                        <div>
                            <p class="text-xs text-slate-400">Plays</p>
                            <p class="font-semibold text-slate-700 dark:text-navy-100">{{ number_format($playlist->play_count) }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-slate-400">Followers</p>
                            <p class="font-semibold text-slate-700 dark:text-navy-100">{{ number_format($playlist->followers_count) }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-slate-400">Duration</p>
                            <p class="font-semibold text-slate-700 dark:text-navy-100">{{ gmdate("H:i", $playlist->total_duration) }}</p>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="mt-4 flex items-center justify-between">
                        <div class="flex items-center space-x-2">
                            <a href="{{ route('admin.music.playlists.show', $playlist) }}" class="btn size-8 rounded-full p-0 hover:bg-slate-300/20 focus:bg-slate-300/20 active:bg-slate-300/25">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </a>

                            <a href="{{ route('admin.music.playlists.edit', $playlist) }}" class="btn size-8 rounded-full p-0 hover:bg-slate-300/20 focus:bg-slate-300/20 active:bg-slate-300/25">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </a>
                        </div>

                        <div class="flex items-center space-x-1">
                            @if($playlist->type === 'user')
                                <form method="POST" action="{{ route('admin.music.playlists.feature', $playlist) }}" class="inline">
                                    @csrf
                                    <button type="submit" class="btn size-8 rounded-full p-0 hover:bg-slate-300/20 focus:bg-slate-300/20 active:bg-slate-300/25"
                                            title="{{ $playlist->is_featured ? 'Remove from featured' : 'Add to featured' }}">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4 {{ $playlist->is_featured ? 'text-warning' : 'text-slate-400' }}" fill="{{ $playlist->is_featured ? 'currentColor' : 'none' }}" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                        </svg>
                                    </button>
                                </form>
                            @endif

                            <form method="POST" action="{{ route('admin.music.playlists.destroy', $playlist) }}" class="inline">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="btn size-8 rounded-full p-0 hover:bg-slate-300/20 focus:bg-slate-300/20 active:bg-slate-300/25"
                                        onclick="return confirm('Are you sure you want to delete this playlist?')">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        @empty
            <div class="col-span-full">
                <div class="card p-8 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto size-16 text-slate-300 dark:text-navy-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    <h3 class="mt-4 text-lg font-semibold text-slate-700 dark:text-navy-100">No playlists found</h3>
                    <p class="mt-2 text-sm text-slate-400">No playlists match your current filters.</p>
                </div>
            </div>
        @endforelse
    </div>

    <!-- Pagination -->
    @if(isset($playlists) && $playlists->hasPages())
        <div class="mt-6 flex justify-center">
            {{ $playlists->links() }}
        </div>
    @endif
@endsection