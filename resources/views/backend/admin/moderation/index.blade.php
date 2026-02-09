@extends('layouts.admin')

@section('title', 'Content Moderation')

@section('content')
<div class="dashboard-content">
    <!-- Page Header -->
    <div class="mb-8">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">Content Moderation</h1>
                <p class="text-slate-600 dark:text-navy-300">Review and moderate platform content</p>
            </div>
        </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5 mb-8">
        <div class="admin-card">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-slate-600 dark:text-navy-300">Pending Songs</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50">{{ $stats['pending_songs'] }}</p>
                </div>
                <div class="flex size-12 items-center justify-center rounded-lg bg-warning/10 text-warning">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="admin-card">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-slate-600 dark:text-navy-300">Pending Albums</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50">{{ $stats['pending_albums'] }}</p>
                </div>
                <div class="flex size-12 items-center justify-center rounded-lg bg-info/10 text-info">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="admin-card">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-slate-600 dark:text-navy-300">Pending Artists</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50">{{ $stats['pending_artists'] }}</p>
                </div>
                <div class="flex size-12 items-center justify-center rounded-lg bg-success/10 text-success">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="admin-card">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-slate-600 dark:text-navy-300">Flagged Content</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50">{{ $stats['flagged_content'] }}</p>
                </div>
                <div class="flex size-12 items-center justify-center rounded-lg bg-error/10 text-error">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="admin-card">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-slate-600 dark:text-navy-300">Processed Today</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50">{{ $stats['total_processed_today'] }}</p>
                </div>
                <div class="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                </div>
            </div>
        </div>
    </div>

    <!-- Filters -->
    <div class="admin-card mb-6">
        <form method="GET" class="flex gap-4 items-end">
            <div class="flex-1">
                <label for="filter" class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">
                    Status Filter
                </label>
                <select id="filter" name="filter" class="form-select">
                    <option value="all" {{ $filter === 'all' ? 'selected' : '' }}>All Content</option>
                    <option value="pending" {{ $filter === 'pending' ? 'selected' : '' }}>Pending</option>
                    <option value="flagged" {{ $filter === 'flagged' ? 'selected' : '' }}>Flagged</option>
                    <option value="reported" {{ $filter === 'reported' ? 'selected' : '' }}>Reported</option>
                </select>
            </div>

            <div class="flex-1">
                <label for="type" class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">
                    Content Type
                </label>
                <select id="type" name="type" class="form-select">
                    <option value="all" {{ $type === 'all' ? 'selected' : '' }}>All Types</option>
                    <option value="songs" {{ $type === 'songs' ? 'selected' : '' }}>Songs</option>
                    <option value="albums" {{ $type === 'albums' ? 'selected' : '' }}>Albums</option>
                    <option value="artists" {{ $type === 'artists' ? 'selected' : '' }}>Artists</option>
                </select>
            </div>

            <button type="submit" class="btn bg-primary text-white hover:bg-primary-focus">
                Apply Filters
            </button>
        </form>
    </div>

    <!-- Content Lists -->
    @if(isset($moderationData['songs']) && count($moderationData['songs']) > 0)
        <div class="admin-card mb-6">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Songs</h3>
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead>
                        <tr class="border-b border-slate-200 dark:border-navy-500">
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Title</th>
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Artist</th>
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Status</th>
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Duration</th>
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Uploaded</th>
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($moderationData['songs'] as $song)
                            <tr class="border-b border-slate-100 dark:border-navy-600">
                                <td class="px-4 py-3">
                                    <div class="font-medium text-slate-800 dark:text-navy-50">{{ $song['title'] }}</div>
                                    @if(isset($song['flagged_reason']))
                                        <div class="text-sm text-red-600">{{ $song['flagged_reason'] }}</div>
                                    @endif
                                </td>
                                <td class="px-4 py-3 text-slate-800 dark:text-navy-50">{{ $song['artist'] }}</td>
                                <td class="px-4 py-3">
                                    <span class="px-2 py-1 text-xs font-medium rounded-full
                                        {{ $song['status'] === 'pending' ? 'bg-warning-light text-warning' :
                                           ($song['status'] === 'published' ? 'bg-success-light text-success' : 'bg-error-light text-error') }}">
                                        {{ ucfirst($song['status']) }}
                                    </span>
                                </td>
                                <td class="px-4 py-3 text-slate-800 dark:text-navy-50">{{ $song['duration'] ?? 'N/A' }}</td>
                                <td class="px-4 py-3 text-slate-800 dark:text-navy-50">{{ $song['uploaded_at']->diffForHumans() }}</td>
                                <td class="px-4 py-3">
                                    <div class="flex gap-2">
                                        @if($song['status'] === 'pending_review' || $song['status'] === 'pending')
                                            <!-- Pending: Show Approve & Reject -->
                                            <button onclick="moderateContent('song', {{ $song['id'] }}, 'approve')"
                                                    class="btn size-8 rounded-full p-0 hover:bg-success/20 text-success"
                                                    title="Approve & Publish">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </button>
                                            <button onclick="showRejectModal('song', {{ $song['id'] }})"
                                                    class="btn size-8 rounded-full p-0 hover:bg-error/20 text-error"
                                                    title="Reject">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        @elseif($song['status'] === 'published')
                                            <!-- Published: Show Unpublish & View -->
                                            <button onclick="showUnpublishModal('song', {{ $song['id'] }})"
                                                    class="btn size-8 rounded-full p-0 hover:bg-warning/20 text-warning"
                                                    title="Unpublish">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                </svg>
                                            </button>
                                            <a href="{{ route('admin.music.songs.show', $song['id']) }}"
                                               class="btn size-8 rounded-full p-0 hover:bg-info/20 text-info"
                                               title="View Details">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </a>
                                        @elseif($song['status'] === 'rejected')
                                            <!-- Rejected: Show Re-approve & View -->
                                            <button onclick="moderateContent('song', {{ $song['id'] }}, 'approve')"
                                                    class="btn size-8 rounded-full p-0 hover:bg-success/20 text-success"
                                                    title="Re-approve">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                            </button>
                                            <a href="{{ route('admin.music.songs.show', $song['id']) }}"
                                               class="btn size-8 rounded-full p-0 hover:bg-info/20 text-info"
                                               title="View Details">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </a>
                                        @endif
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    @endif

    <!-- Albums Moderation Table -->
    @if(isset($moderationData['albums']) && count($moderationData['albums']) > 0)
        <div class="admin-card mb-6">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Albums</h3>
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead>
                        <tr class="border-b border-slate-200 dark:border-navy-500">
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Title</th>
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Artist</th>
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Status</th>
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Tracks</th>
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Uploaded</th>
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($moderationData['albums'] as $album)
                            <tr class="border-b border-slate-100 dark:border-navy-600">
                                <td class="px-4 py-3">
                                    <div class="font-medium text-slate-800 dark:text-navy-50">{{ $album['title'] }}</div>
                                    @if(isset($album['flagged_reason']))
                                        <div class="text-sm text-red-600">{{ $album['flagged_reason'] }}</div>
                                    @endif
                                </td>
                                <td class="px-4 py-3 text-slate-800 dark:text-navy-50">{{ $album['artist'] }}</td>
                                <td class="px-4 py-3">
                                    <span class="px-2 py-1 text-xs font-medium rounded-full
                                        {{ $album['status'] === 'pending' ? 'bg-warning-light text-warning' :
                                           ($album['status'] === 'published' ? 'bg-success-light text-success' : 'bg-error-light text-error') }}">
                                        {{ ucfirst($album['status']) }}
                                    </span>
                                </td>
                                <td class="px-4 py-3 text-slate-800 dark:text-navy-50">{{ $album['track_count'] ?? 0 }}</td>
                                <td class="px-4 py-3 text-slate-800 dark:text-navy-50">{{ $album['uploaded_at']->diffForHumans() }}</td>
                                <td class="px-4 py-3">
                                    <div class="flex gap-2">
                                        @if($album['status'] === 'pending' || $album['status'] === 'pending_review')
                                            <!-- Pending: Show Approve & Reject -->
                                            <button onclick="moderateContent('album', {{ $album['id'] }}, 'approve')"
                                                    class="btn size-8 rounded-full p-0 hover:bg-success/20 text-success"
                                                    title="Approve & Publish">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </button>
                                            <button onclick="showRejectModal('album', {{ $album['id'] }})"
                                                    class="btn size-8 rounded-full p-0 hover:bg-error/20 text-error"
                                                    title="Reject">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        @elseif($album['status'] === 'published')
                                            <!-- Published: Show Unpublish & View -->
                                            <button onclick="showUnpublishModal('album', {{ $album['id'] }})"
                                                    class="btn size-8 rounded-full p-0 hover:bg-warning/20 text-warning"
                                                    title="Unpublish">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                </svg>
                                            </button>
                                            <a href="{{ route('admin.music.albums.show', $album['id']) }}"
                                               class="btn size-8 rounded-full p-0 hover:bg-info/20 text-info"
                                               title="View Details">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </a>
                                        @elseif($album['status'] === 'rejected')
                                            <!-- Rejected: Show Re-approve & View -->
                                            <button onclick="moderateContent('album', {{ $album['id'] }}, 'approve')"
                                                    class="btn size-8 rounded-full p-0 hover:bg-success/20 text-success"
                                                    title="Re-approve">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                            </button>
                                            <a href="{{ route('admin.music.albums.show', $album['id']) }}"
                                               class="btn size-8 rounded-full p-0 hover:bg-info/20 text-info"
                                               title="View Details">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </a>
                                        @endif
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    @endif

    <!-- Artists Moderation Table -->
    @if(isset($moderationData['artists']) && count($moderationData['artists']) > 0)
        <div class="admin-card mb-6">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Artists</h3>
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead>
                        <tr class="border-b border-slate-200 dark:border-navy-500">
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Name</th>
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Email</th>
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Status</th>
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Songs</th>
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Joined</th>
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($moderationData['artists'] as $artist)
                            <tr class="border-b border-slate-100 dark:border-navy-600">
                                <td class="px-4 py-3">
                                    <div class="flex items-center gap-2">
                                        <div class="font-medium text-slate-800 dark:text-navy-50">{{ $artist['name'] }}</div>
                                        @if($artist['is_verified'])
                                            <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M9 12l2 2 4-4m5.586-4.586L16 8l-4.586 4.586a2 2 0 001.414 3.414L16 12l4.586 4.586A2 2 0 0023.414 15L20 12l3.414-3.414a2 2 0 00-1.414-3.414L16 8z" />
                                            </svg>
                                        @endif
                                    </div>
                                    @if(isset($artist['flagged_reason']))
                                        <div class="text-sm text-red-600">{{ $artist['flagged_reason'] }}</div>
                                    @endif
                                </td>
                                <td class="px-4 py-3 text-slate-800 dark:text-navy-50">{{ $artist['email'] }}</td>
                                <td class="px-4 py-3">
                                    <span class="px-2 py-1 text-xs font-medium rounded-full
                                        {{ $artist['verification_status'] === 'pending' ? 'bg-warning-light text-warning' :
                                           ($artist['verification_status'] === 'approved' ? 'bg-success-light text-success' : 'bg-error-light text-error') }}">
                                        {{ ucfirst($artist['verification_status']) }}
                                    </span>
                                </td>
                                <td class="px-4 py-3 text-slate-800 dark:text-navy-50">{{ $artist['songs_count'] ?? 0 }}</td>
                                <td class="px-4 py-3 text-slate-800 dark:text-navy-50">{{ $artist['created_at']->diffForHumans() }}</td>
                                <td class="px-4 py-3">
                                    <div class="flex gap-2">
                                        @if($artist['verification_status'] === 'pending')
                                            <!-- Pending: Show Verify & Reject -->
                                            <button onclick="moderateContent('artist', {{ $artist['id'] }}, 'approve')"
                                                    class="btn size-8 rounded-full p-0 hover:bg-success/20 text-success"
                                                    title="Verify Artist">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </button>
                                            <button onclick="showRejectModal('artist', {{ $artist['id'] }})"
                                                    class="btn size-8 rounded-full p-0 hover:bg-error/20 text-error"
                                                    title="Reject Verification">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </button>
                                        @elseif($artist['verification_status'] === 'approved')
                                            <!-- Approved: Show Unverify & View -->
                                            <button onclick="showUnpublishModal('artist', {{ $artist['id'] }})"
                                                    class="btn size-8 rounded-full p-0 hover:bg-warning/20 text-warning"
                                                    title="Unverify Artist">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                </svg>
                                            </button>
                                            <a href="{{ route('admin.artists.show', $artist['id']) }}"
                                               class="btn size-8 rounded-full p-0 hover:bg-info/20 text-info"
                                               title="View Artist">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </a>
                                        @elseif($artist['verification_status'] === 'rejected')
                                            <!-- Rejected: Show Re-verify & View -->
                                            <button onclick="moderateContent('artist', {{ $artist['id'] }}, 'approve')"
                                                    class="btn size-8 rounded-full p-0 hover:bg-success/20 text-success"
                                                    title="Re-verify Artist">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                            </button>
                                            <a href="{{ route('admin.artists.show', $artist['id']) }}"
                                               class="btn size-8 rounded-full p-0 hover:bg-info/20 text-info"
                                               title="View Artist">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </a>
                                        @endif
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    @endif

    @if((!isset($moderationData['songs']) || count($moderationData['songs']) === 0) &&
        (!isset($moderationData['albums']) || count($moderationData['albums']) === 0) &&
        (!isset($moderationData['artists']) || count($moderationData['artists']) === 0))
        <div class="admin-card">
            <div class="text-center py-12">
                <div class="flex size-16 items-center justify-center rounded-full bg-slate-100 dark:bg-navy-600 mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>
                <h3 class="text-lg font-medium text-slate-800 dark:text-navy-50 mb-2">No Content to Moderate</h3>
                <p class="text-slate-600 dark:text-navy-300">All content has been reviewed or no content matches your filters</p>
            </div>
        </div>
    @endif
</div>

<!-- Reject Modal -->
<div id="rejectModal" class="fixed inset-0 z-50 hidden bg-slate-900/50">
    <div class="flex min-h-screen items-center justify-center p-4">
        <div class="w-full max-w-md rounded-lg bg-white p-6 dark:bg-navy-700">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Reject Content</h3>
            <form id="rejectForm">
                <input type="hidden" id="rejectType">
                <input type="hidden" id="rejectId">
                <div class="mb-4">
                    <label for="reason" class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">
                        Reason for rejection <span class="text-red-500">*</span>
                    </label>
                    <textarea id="reason" name="reason" rows="3" class="form-input w-full" required
                              placeholder="Please provide a reason for rejecting this content..."></textarea>
                </div>
                <div class="flex gap-3">
                    <button type="button" onclick="submitReject()" class="btn bg-error text-white hover:bg-error-focus">
                        Reject
                    </button>
                    <button type="button" onclick="closeRejectModal()" class="btn border border-slate-300 text-slate-700 hover:bg-slate-50">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Unpublish Modal -->
<div id="unpublishModal" class="fixed inset-0 z-50 hidden bg-slate-900/50">
    <div class="flex min-h-screen items-center justify-center p-4">
        <div class="w-full max-w-md rounded-lg bg-white p-6 dark:bg-navy-700">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Unpublish Content</h3>
            <form id="unpublishForm">
                <input type="hidden" id="unpublishType">
                <input type="hidden" id="unpublishId">
                <div class="mb-4">
                    <label for="unpublishReason" class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">
                        Reason for unpublishing <span class="text-red-500">*</span>
                    </label>
                    <textarea id="unpublishReason" name="reason" rows="3" class="form-input w-full" required
                              placeholder="Please provide a reason for unpublishing this content..."></textarea>
                </div>
                <div class="flex gap-3">
                    <button type="button" onclick="submitUnpublish()" class="btn bg-warning text-white hover:bg-warning-focus">
                        Unpublish
                    </button>
                    <button type="button" onclick="closeUnpublishModal()" class="btn border border-slate-300 text-slate-700 hover:bg-slate-50">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
function moderateContent(type, id, action) {
    fetch(`{{ route('admin.music.moderation.moderate') }}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': '{{ csrf_token() }}'
        },
        body: JSON.stringify({
            type: type,
            id: id,
            action: action
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload();
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred');
    });
}

function showRejectModal(type, id) {
    document.getElementById('rejectType').value = type;
    document.getElementById('rejectId').value = id;
    document.getElementById('rejectModal').classList.remove('hidden');
}

function closeRejectModal() {
    document.getElementById('rejectModal').classList.add('hidden');
    document.getElementById('reason').value = '';
}

function submitReject() {
    const type = document.getElementById('rejectType').value;
    const id = document.getElementById('rejectId').value;
    const reason = document.getElementById('reason').value;

    if (!reason.trim()) {
        alert('Please provide a reason for rejection');
        return;
    }

    fetch(`{{ route('admin.music.moderation.moderate') }}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': '{{ csrf_token() }}'
        },
        body: JSON.stringify({
            type: type,
            id: id,
            action: 'reject',
            reason: reason
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeRejectModal();
            location.reload();
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred');
    });
}

function showUnpublishModal(type, id) {
    document.getElementById('unpublishType').value = type;
    document.getElementById('unpublishId').value = id;
    document.getElementById('unpublishModal').classList.remove('hidden');
}

function closeUnpublishModal() {
    document.getElementById('unpublishModal').classList.add('hidden');
    document.getElementById('unpublishReason').value = '';
}

function submitUnpublish() {
    const type = document.getElementById('unpublishType').value;
    const id = document.getElementById('unpublishId').value;
    const reason = document.getElementById('unpublishReason').value;

    if (!reason.trim()) {
        alert('Please provide a reason for unpublishing');
        return;
    }

    fetch(`{{ route('admin.music.moderation.moderate') }}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': '{{ csrf_token() }}'
        },
        body: JSON.stringify({
            type: type,
            id: id,
            action: 'unpublish',
            reason: reason
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeUnpublishModal();
            location.reload();
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred');
    });
}
</script>

@endsection