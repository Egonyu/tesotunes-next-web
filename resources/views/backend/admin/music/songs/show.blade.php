@extends('layouts.admin')

@section('title', 'Song Details - ' . $song->title)

@section('content')
<div class="flex items-center justify-between mb-5">
    <h1 class="text-2xl font-semibold text-slate-700 dark:text-navy-100">Song Details</h1>
    <div class="flex space-x-2">
        <a href="{{ route('admin.music.songs.edit', $song) }}" class="btn bg-primary hover:bg-primary-focus text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Song
        </a>
        <a href="{{ route('admin.music.songs.index') }}" class="btn bg-slate-150 hover:bg-slate-200 text-slate-800 dark:bg-navy-500 dark:hover:bg-navy-450 dark:text-navy-50">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Songs
        </a>
    </div>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Song Details -->
    <div class="lg:col-span-2 space-y-6">
        <!-- Basic Information -->
        <div class="card p-6">
            <h2 class="text-lg font-semibold text-slate-700 dark:text-navy-100 mb-4">Basic Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-1">Title</label>
                    <p class="text-slate-700 dark:text-navy-100 font-medium">{{ $song->title }}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-1">Artist</label>
                    <p class="text-slate-700 dark:text-navy-100">{{ $song->artist->stage_name ?? $song->artist->name ?? 'Unknown Artist' }}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-1">Genre</label>
                    <p class="text-slate-700 dark:text-navy-100">{{ $song->genres->pluck('name')->join(', ') ?: 'No genre specified' }}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-1">Status</label>
                    <span class="badge
                        @if($song->status === 'published') text-success bg-success/10
                        @elseif($song->status === 'pending') text-warning bg-warning/10
                        @elseif($song->status === 'rejected') text-error bg-error/10
                        @else text-info bg-info/10 @endif">
                        {{ ucfirst($song->status) }}
                    </span>
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-1">Duration</label>
                    <p class="text-slate-700 dark:text-navy-100">{{ $song->duration_formatted ?: 'Unknown' }}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-1">Price</label>
                    <p class="text-slate-700 dark:text-navy-100">
                        @if($song->is_free)
                            <span class="text-success">Free</span>
                        @else
                            UGX {{ number_format($song->price, 2) }}
                        @endif
                    </p>
                </div>
            </div>

            @if($song->description)
            <div class="mt-4">
                <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-1">Description</label>
                <p class="text-slate-700 dark:text-navy-100">{{ $song->description }}</p>
            </div>
            @endif
        </div>

        <!-- Stats -->
        <div class="card p-6">
            <h2 class="text-lg font-semibold text-slate-700 dark:text-navy-100 mb-4">Statistics</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="text-center">
                    <p class="text-2xl font-bold text-primary">{{ number_format($song->play_count) }}</p>
                    <p class="text-sm text-slate-500 dark:text-navy-300">Plays</p>
                </div>
                <div class="text-center">
                    <p class="text-2xl font-bold text-success">{{ number_format($song->download_count) }}</p>
                    <p class="text-sm text-slate-500 dark:text-navy-300">Downloads</p>
                </div>
                <div class="text-center">
                    <p class="text-2xl font-bold text-warning">{{ number_format($song->like_count) }}</p>
                    <p class="text-sm text-slate-500 dark:text-navy-300">Likes</p>
                </div>
                <div class="text-center">
                    <p class="text-2xl font-bold text-info">{{ number_format($song->share_count) }}</p>
                    <p class="text-sm text-slate-500 dark:text-navy-300">Shares</p>
                </div>
            </div>
        </div>

        <!-- File Information -->
        <div class="card p-6">
            <h2 class="text-lg font-semibold text-slate-700 dark:text-navy-100 mb-4">File Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-1">Original Filename</label>
                    <p class="text-slate-700 dark:text-navy-100">{{ $song->original_filename ?: 'N/A' }}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-1">File Format</label>
                    <p class="text-slate-700 dark:text-navy-100">{{ strtoupper($song->file_format ?: 'N/A') }}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-1">File Size</label>
                    <p class="text-slate-700 dark:text-navy-100">{{ $song->file_size_bytes ? number_format($song->file_size_bytes / 1024 / 1024, 2) . ' MB' : 'N/A' }}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-1">MIME Type</label>
                    <p class="text-slate-700 dark:text-navy-100">{{ $song->mime_type ?: 'N/A' }}</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Sidebar -->
    <div class="space-y-6">
        <!-- Artwork -->
        <div class="card p-6">
            <h3 class="text-lg font-semibold text-slate-700 dark:text-navy-100 mb-4">Artwork</h3>
            <div class="aspect-square bg-slate-150 dark:bg-navy-800 rounded-lg overflow-hidden">
                @if($song->artwork_url)
                    <img src="{{ $song->artwork_url }}" alt="{{ $song->title }}" class="w-full h-full object-cover" onerror="this.src='/images/default-track.svg'">
                @else
                    <div class="w-full h-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-16 text-slate-400 dark:text-navy-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                    </div>
                @endif
            </div>
        </div>

        <!-- Actions -->
        <div class="card p-6">
            <h3 class="text-lg font-semibold text-slate-700 dark:text-navy-100 mb-4">Actions</h3>
            <div class="space-y-3">
                @if(in_array($song->status, ['pending', 'pending_review']))
                    <form action="{{ route('admin.music.songs.approve', $song) }}" method="POST" class="w-full">
                        @csrf
                        <button type="submit" class="btn w-full bg-success hover:bg-success-focus text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Approve Song
                        </button>
                    </form>
                    <form action="{{ route('admin.music.songs.reject', $song) }}" method="POST" class="w-full">
                        @csrf
                        <button type="submit" class="btn w-full bg-error hover:bg-error-focus text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Reject Song
                        </button>
                    </form>
                @endif

                @if($song->status === 'published')
                    <form action="{{ route('admin.music.songs.feature', $song) }}" method="POST" class="w-full">
                        @csrf
                        <button type="submit" class="btn w-full bg-warning hover:bg-warning-focus text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            Feature Song
                        </button>
                    </form>
                @endif

                <form action="{{ route('admin.music.songs.destroy', $song) }}" method="POST" class="w-full" onsubmit="return confirm('Are you sure you want to delete this song?')">
                    @csrf
                    @method('DELETE')
                    <button type="submit" class="btn w-full bg-error hover:bg-error-focus text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Song
                    </button>
                </form>
            </div>
        </div>

        <!-- Timestamps -->
        <div class="card p-6">
            <h3 class="text-lg font-semibold text-slate-700 dark:text-navy-100 mb-4">Timestamps</h3>
            <div class="space-y-2">
                <div>
                    <label class="block text-xs font-medium text-slate-500 dark:text-navy-300">Created</label>
                    <p class="text-sm text-slate-700 dark:text-navy-100">{{ $song->created_at->format('M d, Y H:i') }}</p>
                </div>
                <div>
                    <label class="block text-xs font-medium text-slate-500 dark:text-navy-300">Updated</label>
                    <p class="text-sm text-slate-700 dark:text-navy-100">{{ $song->updated_at->format('M d, Y H:i') }}</p>
                </div>
                @if($song->release_date)
                <div>
                    <label class="block text-xs font-medium text-slate-500 dark:text-navy-300">Release Date</label>
                    <p class="text-sm text-slate-700 dark:text-navy-100">{{ $song->release_date->format('M d, Y') }}</p>
                </div>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection