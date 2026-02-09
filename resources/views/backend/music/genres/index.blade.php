@extends('layouts.admin')

@section('title', 'Genres Management')

@section('content')
    <!-- Header with Stats -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-slate-600 dark:text-navy-100">Total Genres</p>
                    <p class="text-2xl font-semibold text-slate-800 dark:text-navy-50">{{ \App\Models\Genre::count() }}</p>
                </div>
                <div class="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <svg class="size-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-slate-600 dark:text-navy-100">Active Genres</p>
                    <p class="text-2xl font-semibold text-slate-800 dark:text-navy-50">{{ \App\Models\Genre::where('is_active', true)->count() }}</p>
                </div>
                <div class="flex size-12 items-center justify-center rounded-lg bg-success/10 text-success">
                    <svg class="size-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-slate-600 dark:text-navy-100">Featured Genres</p>
                    <p class="text-2xl font-semibold text-slate-800 dark:text-navy-50">{{ \App\Models\Genre::where('is_featured', true)->count() }}</p>
                </div>
                <div class="flex size-12 items-center justify-center rounded-lg bg-warning/10 text-warning">
                    <svg class="size-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-slate-600 dark:text-navy-100">Songs per Genre</p>
                    <p class="text-2xl font-semibold text-slate-800 dark:text-navy-50">{{ number_format(\App\Models\Song::count() / max(\App\Models\Genre::count(), 1), 1) }}</p>
                </div>
                <div class="flex size-12 items-center justify-center rounded-lg bg-info/10 text-info">
                    <svg class="size-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                </div>
            </div>
        </div>
    </div>

    <!-- Filters & Search -->
    <div class="card mb-6">
        <div class="border-b border-slate-200 p-4 dark:border-navy-500">
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-medium text-slate-700 dark:text-navy-100">Music Genres</h3>
                <a href="{{ route('admin.music.genres.create') }}" class="btn bg-primary text-white hover:bg-primary-focus">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Genre
                </a>
            </div>
        </div>

        <form method="GET" class="p-4">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                <!-- Search -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Search</label>
                    <input name="search" type="text" placeholder="Genre name..."
                           value="{{ request('search') }}"
                           class="form-input mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent">
                </div>

                <!-- Status Filter -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Status</label>
                    <select name="status" class="form-select mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent">
                        <option value="">All Status</option>
                        <option value="active" {{ request('status') === 'active' ? 'selected' : '' }}>Active</option>
                        <option value="inactive" {{ request('status') === 'inactive' ? 'selected' : '' }}>Inactive</option>
                    </select>
                </div>

                <!-- Featured Filter -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Featured</label>
                    <select name="featured" class="form-select mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent">
                        <option value="">All Genres</option>
                        <option value="1" {{ request('featured') === '1' ? 'selected' : '' }}>Featured</option>
                        <option value="0" {{ request('featured') === '0' ? 'selected' : '' }}>Not Featured</option>
                    </select>
                </div>
            </div>

            <div class="mt-4 flex justify-end space-x-2">
                <a href="{{ route('admin.music.genres.index') }}" class="btn border border-slate-300 font-medium text-slate-700 hover:bg-slate-150 dark:border-navy-450 dark:text-navy-100 dark:hover:bg-navy-500">
                    Clear
                </a>
                <button type="submit" class="btn bg-primary text-white hover:bg-primary-focus">
                    Apply Filters
                </button>
            </div>
        </form>
    </div>

    <!-- Genres Table -->
    <div class="card">
        <div class="is-scrollbar-hidden min-w-full overflow-x-auto">
            <table class="is-hoverable w-full text-left">
                <thead>
                    <tr class="border-y border-transparent border-b-slate-200 dark:border-b-navy-500">
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Genre
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Songs Count
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Status
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Featured
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Created
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($genres ?? [] as $genre)
                        <tr class="border-y border-transparent border-b-slate-200 dark:border-b-navy-500">
                            <!-- Genre Info -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <div class="flex items-center space-x-3">
                                    @if($genre->image)
                                        <div class="avatar size-10">
                                            <img class="rounded-full" src="{{ Storage::url($genre->image) }}" alt="{{ $genre->name }}" />
                                        </div>
                                    @else
                                        <div class="flex size-10 items-center justify-center rounded-lg bg-slate-200 text-slate-500 dark:bg-navy-500 dark:text-navy-200">
                                            <svg class="size-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                        </div>
                                    @endif
                                    <div>
                                        <p class="font-medium text-slate-700 dark:text-navy-100">{{ $genre->name }}</p>
                                        @if($genre->description)
                                            <p class="text-xs text-slate-400 line-clamp-1">{{ $genre->description }}</p>
                                        @endif
                                    </div>
                                </div>
                            </td>

                            <!-- Songs Count -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <span class="badge bg-info/10 text-info">{{ $genre->songs_count ?? 0 }} songs</span>
                            </td>

                            <!-- Status -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <span class="badge rounded-full {{ $genre->is_active ? 'bg-success/10 text-success' : 'bg-error/10 text-error' }}">
                                    {{ $genre->is_active ? 'Active' : 'Inactive' }}
                                </span>
                            </td>

                            <!-- Featured -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                @if($genre->is_featured)
                                    <span class="badge bg-warning/10 text-warning">Featured</span>
                                @else
                                    <span class="text-slate-400">-</span>
                                @endif
                            </td>

                            <!-- Created Date -->
                            <td class="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-navy-100 lg:px-5">
                                {{ $genre->created_at->format('M j, Y') }}
                            </td>

                            <!-- Actions -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <div class="flex items-center space-x-2">
                                    <a href="{{ route('admin.music.genres.show', $genre) }}" class="btn size-8 rounded-full p-0 hover:bg-slate-300/20 focus:bg-slate-300/20 active:bg-slate-300/25">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </a>

                                    <a href="{{ route('admin.music.genres.edit', $genre) }}" class="btn size-8 rounded-full p-0 hover:bg-slate-300/20 focus:bg-slate-300/20 active:bg-slate-300/25">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </a>

                                    <form method="POST" action="{{ route('admin.music.genres.destroy', $genre) }}" class="inline">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="btn size-8 rounded-full p-0 hover:bg-slate-300/20 focus:bg-slate-300/20 active:bg-slate-300/25"
                                                onclick="return confirm('Are you sure you want to delete this genre?')">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="px-4 py-8 text-center text-slate-400">
                                No genres found. <a href="{{ route('admin.music.genres.create') }}" class="text-primary hover:underline">Create your first genre</a>.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        @if(isset($genres) && $genres->hasPages())
            <div class="flex items-center justify-between px-4 py-4">
                <div class="text-sm text-slate-400">
                    Showing {{ $genres->firstItem() }}-{{ $genres->lastItem() }} of {{ $genres->total() }} genres
                </div>
                {{ $genres->links() }}
            </div>
        @endif
    </div>
@endsection