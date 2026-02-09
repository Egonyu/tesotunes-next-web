@extends('layouts.admin')

@section('title', $playlist->name)

@section('content')
<div class="flex flex-col gap-4 sm:gap-6">
    <!-- Breadcrumb -->
    <div class="flex items-center gap-x-2">
        <a href="{{ route('admin.music.playlists.index') }}" class="text-slate-600 hover:text-slate-900 dark:text-navy-300 dark:hover:text-navy-100">
            Playlists
        </a>
        <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <span class="text-slate-600 dark:text-navy-300">{{ $playlist->name }}</span>
    </div>

    <!-- Page Header -->
    <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ $playlist->name }}</h1>
        <div class="flex gap-2">
            <a href="{{ route('admin.music.playlists.edit', $playlist) }}" class="btn bg-info text-white hover:bg-info-focus">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
            </a>
            <form action="{{ route('admin.music.playlists.destroy', $playlist) }}" method="POST" class="inline" onsubmit="return confirm('Are you sure you want to delete this playlist?')">
                @csrf
                @method('DELETE')
                <button type="submit" class="btn bg-error text-white hover:bg-error-focus">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                </button>
            </form>
        </div>
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <!-- Playlist Details -->
        <div class="lg:col-span-2">
            <div class="card">
                <div class="border-b border-slate-200 p-4 dark:border-navy-500 sm:px-5">
                    <h3 class="text-lg font-medium text-slate-700 dark:text-navy-100">Playlist Details</h3>
                </div>
                <div class="p-4 sm:p-5">
                    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Name</label>
                            <p class="mt-1 text-slate-700 dark:text-navy-100">{{ $playlist->name }}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Owner</label>
                            <p class="mt-1 text-slate-700 dark:text-navy-100">{{ $playlist->owner->name }}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Privacy</label>
                            <p class="mt-1 text-slate-700 dark:text-navy-100">{{ ucfirst($playlist->privacy) }}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Type</label>
                            <div class="mt-1">
                                @if($playlist->is_collaborative)
                                    <span class="badge bg-info text-white">Collaborative</span>
                                @else
                                    <span class="badge bg-slate-500 text-white">Personal</span>
                                @endif
                            </div>
                        </div>
                        @if($playlist->description)
                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Description</label>
                                <p class="mt-1 text-slate-700 dark:text-navy-100">{{ $playlist->description }}</p>
                            </div>
                        @endif
                    </div>
                </div>
            </div>

            <!-- Songs -->
            @if($playlist->songs->count() > 0)
                <div class="card mt-4">
                    <div class="border-b border-slate-200 p-4 dark:border-navy-500 sm:px-5">
                        <h3 class="text-lg font-medium text-slate-700 dark:text-navy-100">
                            Songs ({{ $playlist->songs->count() }})
                        </h3>
                    </div>
                    <div class="is-scrollbar-hidden min-w-full overflow-x-auto">
                        <table class="w-full text-left">
                            <thead>
                                <tr class="border-b border-slate-200 dark:border-navy-500">
                                    <th class="whitespace-nowrap bg-slate-200 px-4 py-3 font-semibold uppercase text-slate-800 dark:bg-navy-800 dark:text-navy-100">
                                        Track
                                    </th>
                                    <th class="whitespace-nowrap bg-slate-200 px-4 py-3 font-semibold uppercase text-slate-800 dark:bg-navy-800 dark:text-navy-100">
                                        Artist
                                    </th>
                                    <th class="whitespace-nowrap bg-slate-200 px-4 py-3 font-semibold uppercase text-slate-800 dark:bg-navy-800 dark:text-navy-100">
                                        Duration
                                    </th>
                                    <th class="whitespace-nowrap bg-slate-200 px-4 py-3 font-semibold uppercase text-slate-800 dark:bg-navy-800 dark:text-navy-100">
                                        Added
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($playlist->songs as $song)
                                    <tr class="border-b border-slate-200 dark:border-navy-500">
                                        <td class="whitespace-nowrap px-4 py-3">
                                            <div class="flex items-center space-x-3">
                                                <div class="size-10 rounded overflow-hidden bg-slate-200 dark:bg-navy-700">
                                                    @if($song->artwork_url)
                                                        <img src="{{ $song->artwork_url }}" alt="{{ $song->title }}" class="w-full h-full object-cover">
                                                    @else
                                                        <div class="w-full h-full flex items-center justify-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                                            </svg>
                                                        </div>
                                                    @endif
                                                </div>
                                                <div>
                                                    <a href="{{ route('admin.music.songs.show', $song) }}" class="font-medium text-primary hover:text-primary-focus">
                                                        {{ $song->title }}
                                                    </a>
                                                    @if($song->album)
                                                        <p class="text-xs text-slate-400">{{ $song->album->title }}</p>
                                                    @endif
                                                </div>
                                            </div>
                                        </td>
                                        <td class="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-navy-100">
                                            {{ $song->artist->stage_name ?? 'Unknown' }}
                                        </td>
                                        <td class="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-navy-100">
                                            {{ $song->duration_seconds ? gmdate('i:s', $song->duration_seconds) : 'N/A' }}
                                        </td>
                                        <td class="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-navy-100">
                                            {{ $song->pivot->created_at ?? $song->created_at->format('M j, Y') }}
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            @else
                <div class="card mt-4">
                    <div class="p-4 text-center sm:p-5">
                        <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto size-16 text-slate-300 dark:text-navy-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                        <h3 class="mt-4 text-lg font-medium text-slate-700 dark:text-navy-100">No songs yet</h3>
                        <p class="mt-2 text-slate-600 dark:text-navy-200">This playlist doesn't have any songs yet.</p>
                    </div>
                </div>
            @endif
        </div>

        <!-- Sidebar -->
        <div class="space-y-4">
            <!-- Playlist Stats -->
            <div class="card">
                <div class="border-b border-slate-200 p-4 dark:border-navy-500 sm:px-5">
                    <h3 class="text-lg font-medium text-slate-700 dark:text-navy-100">Statistics</h3>
                </div>
                <div class="p-4 sm:p-5">
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-slate-600 dark:text-navy-300">Total Songs</span>
                            <span class="font-medium text-slate-700 dark:text-navy-100">{{ $playlist->songs->count() }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-600 dark:text-navy-300">Followers</span>
                            <span class="font-medium text-slate-700 dark:text-navy-100">{{ $playlist->followers_count ?? 0 }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-600 dark:text-navy-300">Created</span>
                            <span class="font-medium text-slate-700 dark:text-navy-100">{{ $playlist->created_at->format('M j, Y') }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-600 dark:text-navy-300">Last Updated</span>
                            <span class="font-medium text-slate-700 dark:text-navy-100">{{ $playlist->updated_at->format('M j, Y') }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection