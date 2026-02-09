@extends('layouts.admin')

@section('title', 'Albums Management')

@section('content')

    @if(isset($filteredArtist) && $filteredArtist)
    <!-- Artist Filter Banner -->
    <div class="mb-6 bg-primary/10 dark:bg-primary/20 border-l-4 border-primary rounded-lg p-4">
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="size-10 rounded-lg bg-primary/20 dark:bg-primary/30 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                <div>
                    <p class="text-sm text-slate-600 dark:text-navy-300">Viewing albums by artist</p>
                    <p class="font-semibold text-slate-800 dark:text-navy-50">{{ $filteredArtist->stage_name }}</p>
                </div>
            </div>
            <div class="flex gap-2">
                <a href="{{ route('admin.music.artists.show', $filteredArtist) }}" 
                   class="btn bg-white dark:bg-navy-700 hover:bg-slate-50 dark:hover:bg-navy-600 text-slate-700 dark:text-navy-100 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Artist
                </a>
                <a href="{{ route('admin.music.albums.index') }}" 
                   class="btn bg-slate-200 dark:bg-navy-600 hover:bg-slate-300 dark:hover:bg-navy-500 text-slate-700 dark:text-navy-100 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear Filter
                </a>
            </div>
        </div>
    </div>
    @endif

    <!-- Header with Stats -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Total Albums</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ number_format($albums->total() ?? 0) }}</p>
                </div>
                <div class="size-11 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Published</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ number_format(\App\Models\Album::where('status', 'published')->count()) }}</p>
                </div>
                <div class="size-11 rounded-full bg-success/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">This Month</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ number_format(\App\Models\Album::whereMonth('created_at', now()->month)->count()) }}</p>
                </div>
                <div class="size-11 rounded-full bg-info/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Total Plays</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ number_format(\App\Models\PlayHistory::count()) }}</p>
                </div>
                <div class="size-11 rounded-full bg-warning/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                </div>
            </div>
        </div>
    </div>

    <!-- Filters & Search -->
    <div class="card mb-6">
        <div class="border-b border-slate-200 p-4 dark:border-navy-500">
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-medium text-slate-700 dark:text-navy-100">Albums Management</h3>
                <a href="{{ route('admin.music.albums.create', request('artist') ? ['artist' => request('artist')] : []) }}" class="btn bg-primary text-white hover:bg-primary-focus">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Album
                </a>
            </div>
        </div>

        <form method="GET" class="p-4">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <!-- Search -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Search</label>
                    <input name="search" type="text" placeholder="Album title, artist..."
                           value="{{ request('search') }}"
                           class="form-input mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent">
                </div>

                <!-- Status Filter -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Status</label>
                    <select name="status" class="form-select mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent">
                        <option value="">All Status</option>
                        <option value="published" {{ request('status') === 'published' ? 'selected' : '' }}>Published</option>
                        <option value="pending" {{ request('status') === 'pending' ? 'selected' : '' }}>Pending Review</option>
                        <option value="draft" {{ request('status') === 'draft' ? 'selected' : '' }}>Draft</option>
                    </select>
                </div>

                <!-- Genre Filter -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Genre</label>
                    <select name="genre" class="form-select mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent">
                        <option value="">All Genres</option>
                        @foreach($genres ?? [] as $genre)
                            <option value="{{ $genre->id }}" {{ request('genre') == $genre->id ? 'selected' : '' }}>
                                {{ $genre->name }}
                            </option>
                        @endforeach
                    </select>
                </div>

                <!-- Release Year -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Release Year</label>
                    <select name="release_year" class="form-select mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent">
                        <option value="">All Years</option>
                        @for($year = date('Y'); $year >= 2000; $year--)
                            <option value="{{ $year }}" {{ request('release_year') == $year ? 'selected' : '' }}>
                                {{ $year }}
                            </option>
                        @endfor
                    </select>
                </div>
            </div>

            <div class="mt-4 flex justify-end space-x-2">
                <a href="{{ route('admin.music.albums.index') }}" class="btn border border-slate-300 font-medium text-slate-700 hover:bg-slate-150 dark:border-navy-450 dark:text-navy-100 dark:hover:bg-navy-500">
                    Clear
                </a>
                <button type="submit" class="btn bg-primary text-white hover:bg-primary-focus">
                    Apply Filters
                </button>
            </div>
        </form>
    </div>

    <!-- Albums Grid -->
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        @forelse($albums ?? [] as $album)
            <div class="card">
                <!-- Album Cover -->
                <div class="relative">
                    <img class="h-48 w-full object-cover rounded-t-lg"
                         src="{{ $album->cover_art ? Storage::url($album->cover_art) : asset('images/album-placeholder.png') }}"
                         alt="{{ $album->title }}" />

                    <!-- Status Badge -->
                    <div class="absolute top-2 right-2">
                        <span class="badge rounded-full
                            {{ $album->status === 'published' ? 'bg-success/10 text-success' :
                               ($album->status === 'pending' ? 'bg-warning/10 text-warning' : 'bg-slate-150 text-slate-800 dark:bg-navy-500 dark:text-navy-100') }}">
                            {{ ucfirst($album->status) }}
                        </span>
                    </div>

                    <!-- Play Button Overlay -->
                    <div class="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity hover:opacity-100">
                        <button class="btn size-12 rounded-full bg-white/90 p-0 hover:bg-white">
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-slate-700" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Album Info -->
                <div class="p-4">
                    <h4 class="text-lg font-semibold text-slate-700 dark:text-navy-100 line-clamp-1">
                        {{ $album->title }}
                    </h4>

                    <div class="mt-1 flex items-center space-x-2">
                        <div class="avatar size-6">
                            <img class="rounded-full" src="{{ $album->artist->avatar ? Storage::url($album->artist->avatar) : asset('images/200x200.png') }}" alt="{{ $album->artist->name }}" />
                        </div>
                        <p class="text-sm text-slate-600 dark:text-navy-100">{{ $album->artist->name }}</p>
                        @if($album->artist->verified)
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 12l2 2 4-4m5.586-4.586L16 8l-4.586 4.586a2 2 0 001.414 3.414L16 12l4.586 4.586A2 2 0 0023.414 15L20 12l3.414-3.414a2 2 0 00-1.414-3.414L16 8z" />
                            </svg>
                        @endif
                    </div>

                    <div class="mt-2 flex items-center justify-between text-xs text-slate-400">
                        <span>{{ $album->songs_count }} {{ Str::plural('song', $album->songs_count) }}</span>
                        <span>{{ $album->release_date?->format('Y') ?? 'TBA' }}</span>
                    </div>

                    @if($album->genre)
                        <div class="mt-2">
                            <span class="badge bg-slate-150 text-slate-800 dark:bg-navy-500 dark:text-navy-100 text-xs">
                                {{ $album->genre->name }}
                            </span>
                        </div>
                    @endif

                    <!-- Stats -->
                    <div class="mt-3 grid grid-cols-3 gap-2 text-center">
                        <div>
                            <p class="text-xs text-slate-400">Plays</p>
                            <p class="font-semibold text-slate-700 dark:text-navy-100">{{ number_format($album->play_count) }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-slate-400">Likes</p>
                            <p class="font-semibold text-slate-700 dark:text-navy-100">{{ number_format($album->likes_count) }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-slate-400">Downloads</p>
                            <p class="font-semibold text-slate-700 dark:text-navy-100">{{ number_format($album->download_count) }}</p>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="mt-4 flex items-center justify-between">
                        <div class="flex items-center space-x-2">
                            <a href="{{ route('admin.music.albums.show', $album) }}" class="btn size-8 rounded-full p-0 hover:bg-slate-300/20 focus:bg-slate-300/20 active:bg-slate-300/25">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </a>

                            <a href="{{ route('admin.music.albums.edit', $album) }}" class="btn size-8 rounded-full p-0 hover:bg-slate-300/20 focus:bg-slate-300/20 active:bg-slate-300/25">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </a>
                        </div>

                        <div class="flex items-center space-x-1">
                            @if($album->status === 'pending')
                                <form method="POST" action="{{ route('admin.music.albums.feature', $album) }}" class="inline">
                                    @csrf
                                    <button type="submit" class="btn size-8 rounded-full p-0 hover:bg-slate-300/20 focus:bg-slate-300/20 active:bg-slate-300/25"
                                            onclick="return confirm('Are you sure you want to approve this album?')">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </button>
                                </form>
                            @endif

                            <form method="POST" action="{{ route('admin.music.albums.destroy', $album) }}" class="inline">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="btn size-8 rounded-full p-0 hover:bg-slate-300/20 focus:bg-slate-300/20 active:bg-slate-300/25"
                                        onclick="return confirm('Are you sure you want to delete this album?')">
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
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <h3 class="mt-4 text-lg font-semibold text-slate-700 dark:text-navy-100">No albums found</h3>
                    <p class="mt-2 text-sm text-slate-400">No albums match your current filters.</p>
                </div>
            </div>
        @endforelse
    </div>

    <!-- Pagination -->
    @if(isset($albums) && $albums->hasPages())
        <div class="mt-6 flex justify-center">
            {{ $albums->links() }}
        </div>
    @endif
@endsection