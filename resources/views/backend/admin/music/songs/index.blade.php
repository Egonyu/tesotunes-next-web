@extends('layouts.admin')

@section('title', 'Songs Management')

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
                <p class="text-sm text-slate-600 dark:text-navy-300">Viewing songs by artist</p>
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
            <a href="{{ route('admin.music.songs.index') }}" 
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
                <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Total Songs</p>
                <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ number_format($totalSongs) }}</p>
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
                <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Published</p>
                <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ number_format($publishedSongs) }}</p>
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
                <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Pending Review</p>
                <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ number_format($pendingSongs) }}</p>
            </div>
            <div class="size-11 rounded-full bg-warning/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
        </div>
    </div>

    <div class="card px-4 py-4">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Rejected</p>
                <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ number_format($rejectedSongs) }}</p>
            </div>
            <div class="size-11 rounded-full bg-error/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </div>
        </div>
    </div>
</div>

<!-- Filters and Search -->
<div class="card p-4 mb-6">
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div class="flex flex-col sm:flex-row gap-4 flex-1">
            <!-- Search -->
            <div class="flex-1">
                <form method="GET" action="{{ route('admin.music.songs.index') }}">
                    <div class="relative">
                        <input type="text" name="search" value="{{ request('search') }}"
                               placeholder="Search songs, artists..."
                               class="form-input peer w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 pl-9 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent">
                        <div class="pointer-events-none absolute flex h-full w-10 items-center justify-center text-slate-400 peer-focus:text-primary dark:text-navy-300 dark:peer-focus:text-accent">
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                    <input type="hidden" name="status" value="{{ request('status') }}">
                    <input type="hidden" name="genre" value="{{ request('genre') }}">
                    @if(request('artist'))
                    <input type="hidden" name="artist" value="{{ request('artist') }}">
                    @endif
                </form>
            </div>

            <!-- Status Filter -->
            <div class="min-w-[150px]">
                <select onchange="window.location.href=updateUrlParameter('status', this.value)"
                        class="form-select w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent">
                    <option value="">All Status</option>
                    <option value="published" {{ request('status') === 'published' ? 'selected' : '' }}>Published</option>
                    <option value="pending" {{ request('status') === 'pending' ? 'selected' : '' }}>Pending</option>
                    <option value="draft" {{ request('status') === 'draft' ? 'selected' : '' }}>Draft</option>
                    <option value="rejected" {{ request('status') === 'rejected' ? 'selected' : '' }}>Rejected</option>
                </select>
            </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2">
            <a href="{{ route('admin.music.songs.create', request('artist') ? ['artist' => request('artist')] : []) }}" class="btn bg-primary hover:bg-primary-focus text-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Song
            </a>
        </div>
    </div>
</div>

<!-- Songs Table -->
<div class="card">
    <div class="is-scrollbar-hidden min-w-full overflow-x-auto">
        <table class="w-full text-left">
            <thead>
                <tr class="border-b border-slate-200 dark:border-navy-500">
                    <th class="whitespace-nowrap bg-slate-200 px-4 py-3 font-semibold uppercase text-slate-800 dark:bg-navy-800 dark:text-navy-100 lg:px-5">
                        Song
                    </th>
                    <th class="whitespace-nowrap bg-slate-200 px-4 py-3 font-semibold uppercase text-slate-800 dark:bg-navy-800 dark:text-navy-100 lg:px-5">
                        Artist
                    </th>
                    <th class="whitespace-nowrap bg-slate-200 px-4 py-3 font-semibold uppercase text-slate-800 dark:bg-navy-800 dark:text-navy-100 lg:px-5">
                        Genre
                    </th>
                    <th class="whitespace-nowrap bg-slate-200 px-4 py-3 font-semibold uppercase text-slate-800 dark:bg-navy-800 dark:text-navy-100 lg:px-5">
                        Status
                    </th>
                    <th class="whitespace-nowrap bg-slate-200 px-4 py-3 font-semibold uppercase text-slate-800 dark:bg-navy-800 dark:text-navy-100 lg:px-5">
                        Plays
                    </th>
                    <th class="whitespace-nowrap bg-slate-200 px-4 py-3 font-semibold uppercase text-slate-800 dark:bg-navy-800 dark:text-navy-100 lg:px-5">
                        Created
                    </th>
                    <th class="whitespace-nowrap bg-slate-200 px-4 py-3 font-semibold uppercase text-slate-800 dark:bg-navy-800 dark:text-navy-100 lg:px-5">
                        Actions
                    </th>
                </tr>
            </thead>
            <tbody>
                @forelse($songs as $song)
                <tr class="border-b border-slate-200 dark:border-navy-500 hover:bg-slate-50 dark:hover:bg-navy-600 transition-colors">
                    <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                        <div class="flex items-center space-x-3">
                            <!-- Artwork with Play Button -->
                            <div class="relative size-12 rounded-lg overflow-hidden bg-slate-200 dark:bg-navy-700 flex-shrink-0 group">
                                @if($song->artwork_url)
                                    <img src="{{ $song->artwork_url }}" alt="{{ $song->title }}" class="w-full h-full object-cover" onerror="this.src='/images/default-track.svg'">
                                @else
                                    <div class="w-full h-full flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-slate-400 dark:text-navy-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                        </svg>
                                    </div>
                                @endif
                                <!-- Play Icon Overlay -->
                                <a href="{{ route('frontend.song.show', $song) }}" target="_blank" 
                                   class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z"/>
                                    </svg>
                                </a>
                            </div>
                            
                            <!-- Song Info -->
                            <div class="min-w-0 flex-1">
                                <a href="{{ route('admin.music.songs.show', $song) }}" 
                                   class="font-medium text-slate-700 dark:text-navy-100 hover:text-primary dark:hover:text-accent block truncate">
                                    {{ $song->title }}
                                </a>
                                <div class="flex items-center gap-2 text-xs text-slate-400 dark:text-navy-300">
                                    <span>{{ $song->duration_formatted ?: '--:--' }}</span>
                                    @if($song->is_explicit)
                                        <span class="inline-flex items-center gap-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="size-2.5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                                            </svg>
                                            EXPLICIT
                                        </span>
                                    @endif
                                </div>
                            </div>
                        </div>
                    </td>
                    
                    <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                        <div class="flex items-center gap-2">
                            @if($song->artist->avatar)
                                <img src="{{ Storage::url($song->artist->avatar) }}" alt="{{ $song->artist->stage_name }}" 
                                     class="size-8 rounded-full object-cover">
                            @else
                                <div class="size-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-semibold">
                                    {{ strtoupper(substr($song->artist->stage_name ?? $song->artist->name, 0, 1)) }}
                                </div>
                            @endif
                            <div class="min-w-0">
                                <a href="{{ route('admin.music.artists.show', $song->artist) }}" 
                                   class="font-medium text-slate-700 dark:text-navy-100 hover:text-primary dark:hover:text-accent block truncate">
                                    {{ $song->artist->stage_name ?? $song->artist->name ?? 'Unknown' }}
                                </a>
                                @if($song->artist->is_verified)
                                    <span class="inline-flex items-center gap-0.5 text-[10px] text-blue-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="size-3" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                        </svg>
                                        Verified
                                    </span>
                                @endif
                            </div>
                        </div>
                    </td>
                    
                    <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                        @if($song->genres && $song->genres->count() > 0)
                            <div class="flex flex-wrap gap-1">
                                @foreach($song->genres->take(2) as $genre)
                                    <span class="badge bg-info/10 text-info text-xs">{{ $genre->name }}</span>
                                @endforeach
                                @if($song->genres->count() > 2)
                                    <span class="badge bg-slate-200 dark:bg-navy-700 text-slate-600 dark:text-navy-200 text-xs">
                                        +{{ $song->genres->count() - 2 }}
                                    </span>
                                @endif
                            </div>
                        @else
                            <span class="text-xs text-slate-400 dark:text-navy-300">No genre</span>
                        @endif
                    </td>
                    
                    <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                        <span class="inline-flex items-center gap-1 badge
                            @if($song->status === 'published') text-success bg-success/10
                            @elseif($song->status === 'pending' || $song->status === 'pending_review') text-warning bg-warning/10
                            @elseif($song->status === 'rejected') text-error bg-error/10
                            @else text-info bg-info/10 @endif">
                            @if($song->status === 'published')
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-3" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                </svg>
                            @elseif($song->status === 'pending' || $song->status === 'pending_review')
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-3" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                                </svg>
                            @elseif($song->status === 'rejected')
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-3" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                </svg>
                            @endif
                            {{ ucfirst($song->status) }}
                        </span>
                    </td>
                    
                    <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                        <div class="flex flex-col">
                            <p class="font-medium text-slate-700 dark:text-navy-100">{{ number_format($song->play_count) }}</p>
                            @if($song->likes_count > 0)
                                <p class="text-xs text-slate-400 dark:text-navy-300">{{ number_format($song->likes_count) }} likes</p>
                            @endif
                        </div>
                    </td>
                    
                    <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                        <p class="text-slate-700 dark:text-navy-100">{{ $song->created_at->format('M d, Y') }}</p>
                        <p class="text-xs text-slate-400 dark:text-navy-300">{{ $song->created_at->diffForHumans() }}</p>
                    </td>
                    
                    <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                        <div class="flex items-center space-x-1" x-data="{ open: false }">
                            <!-- View on Frontend -->
                            <a href="{{ route('frontend.song.show', $song) }}" target="_blank"
                               title="View on Frontend"
                               class="btn size-8 rounded-full p-0 hover:bg-primary/10 dark:hover:bg-accent/10 text-primary dark:text-accent">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                            
                            <!-- View Details -->
                            <a href="{{ route('admin.music.songs.show', $song) }}" 
                               title="View Details"
                               class="btn size-8 rounded-full p-0 hover:bg-info/10 text-info">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </a>
                            
                            <!-- Edit -->
                            <a href="{{ route('admin.music.songs.edit', $song) }}" 
                               title="Edit Song"
                               class="btn size-8 rounded-full p-0 hover:bg-warning/10 text-warning">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </a>
                            
                            <!-- More Actions Dropdown -->
                            <div class="relative">
                                <button @click="open = !open" 
                                        title="More Actions"
                                        class="btn size-8 rounded-full p-0 hover:bg-slate-300/20">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                    </svg>
                                </button>
                                
                                <!-- Dropdown Menu -->
                                <div x-show="open" 
                                     @click.outside="open = false"
                                     x-transition
                                     class="absolute right-0 mt-2 w-48 bg-white dark:bg-navy-700 rounded-lg shadow-lg border border-slate-200 dark:border-navy-500 z-50"
                                     style="display: none;">
                                    <div class="py-2">
                                        @if($song->status !== 'published')
                                            <form action="{{ route('admin.music.songs.approve', $song) }}" method="POST" class="inline w-full">
                                                @csrf
                                                <button type="submit" class="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-navy-100 hover:bg-slate-100 dark:hover:bg-navy-600 flex items-center gap-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Approve & Publish
                                                </button>
                                            </form>
                                        @endif
                                        
                                        <a href="{{ route('frontend.artist.show', $song->artist) }}" target="_blank"
                                           class="block px-4 py-2 text-sm text-slate-700 dark:text-navy-100 hover:bg-slate-100 dark:hover:bg-navy-600">
                                            <div class="flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                View Artist
                                            </div>
                                        </a>
                                        
                                        <button onclick="navigator.clipboard.writeText('{{ route('frontend.song.show', $song) }}'); alert('Link copied!')"
                                                class="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-navy-100 hover:bg-slate-100 dark:hover:bg-navy-600 flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                            </svg>
                                            Copy Link
                                        </button>
                                        
                                        <hr class="my-2 border-slate-200 dark:border-navy-500">
                                        
                                        <form action="{{ route('admin.music.songs.destroy', $song) }}" method="POST" 
                                              onsubmit="return confirm('Are you sure you want to delete this song? This action cannot be undone.')"
                                              class="inline w-full">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/10 flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Delete Song
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="7" class="px-4 py-8 text-center">
                        <div class="flex flex-col items-center justify-center space-y-3">
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-16 text-slate-300 dark:text-navy-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                            <p class="text-slate-400 dark:text-navy-300">No songs found</p>
                        </div>
                    </td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    @if($songs->hasPages())
    <div class="flex items-center justify-between border-t border-slate-200 px-4 py-4 dark:border-navy-500 sm:px-5">
        <div class="flex flex-1 justify-between sm:hidden">
            @if($songs->onFirstPage())
                <span class="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-500">Previous</span>
            @else
                <a href="{{ $songs->previousPageUrl() }}" class="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Previous</a>
            @endif

            @if($songs->hasMorePages())
                <a href="{{ $songs->nextPageUrl() }}" class="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Next</a>
            @else
                <span class="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-500">Next</span>
            @endif
        </div>

        <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
                <p class="text-sm text-slate-700 dark:text-navy-100">
                    Showing <span class="font-medium">{{ $songs->firstItem() }}</span> to <span class="font-medium">{{ $songs->lastItem() }}</span> of <span class="font-medium">{{ $songs->total() }}</span> results
                </p>
            </div>
            <div>
                {{ $songs->links() }}
            </div>
        </div>
    </div>
    @endif
</div>

<script>
function updateUrlParameter(param, value) {
    const url = new URL(window.location);
    if (value) {
        url.searchParams.set(param, value);
    } else {
        url.searchParams.delete(param);
    }
    return url.toString();
}
</script>

@endsection