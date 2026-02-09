@extends('layouts.admin')

@section('title', 'Manage Genres')

@section('content')
<div class="p-6">
    <!-- Header -->
    <div class="mb-6">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-2xl font-bold text-slate-800 dark:text-navy-50">Manage Genres</h1>
                <p class="mt-1 text-sm text-slate-600 dark:text-navy-300">Organize music by genre categories</p>
            </div>
            <div>
                <a href="{{ route('admin.genres.create') }}"
                   class="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-focus dark:bg-accent dark:hover:bg-accent-focus text-white font-medium rounded-lg transition-colors shadow-sm">
                    <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    Add New Genre
                </a>
            </div>
        </div>
    </div>

    <!-- Success Message -->
    @if(session('success'))
        <div class="mb-6 bg-success/10 dark:bg-success/20 border border-success/50 text-success dark:text-success-light px-4 py-3 rounded-lg flex items-center gap-3">
            <svg class="size-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {{ session('success') }}
        </div>
    @endif

    <!-- Genres Table -->
    <div class="card">
        @if($genres->count() > 0)
            <div class="is-scrollbar-hidden min-w-full overflow-x-auto">
            <table class="w-full text-left">
                <thead>
                    <tr class="border-b border-slate-200 dark:border-navy-500">
                        <th scope="col" class="whitespace-nowrap bg-slate-200 dark:bg-navy-800 px-4 py-3 font-semibold uppercase text-slate-800 dark:text-navy-100 lg:px-5">
                            Genre
                        </th>
                        <th scope="col" class="whitespace-nowrap bg-slate-200 dark:bg-navy-800 px-4 py-3 font-semibold uppercase text-slate-800 dark:text-navy-100 lg:px-5">
                            Color/Icon
                        </th>
                        <th scope="col" class="whitespace-nowrap bg-slate-200 dark:bg-navy-800 px-4 py-3 font-semibold uppercase text-slate-800 dark:text-navy-100 lg:px-5">
                            Slug
                        </th>
                        <th scope="col" class="whitespace-nowrap bg-slate-200 dark:bg-navy-800 px-4 py-3 font-semibold uppercase text-slate-800 dark:text-navy-100 lg:px-5">
                            Songs
                        </th>
                        <th scope="col" class="whitespace-nowrap bg-slate-200 dark:bg-navy-800 px-4 py-3 font-semibold uppercase text-slate-800 dark:text-navy-100 lg:px-5">
                            Status
                        </th>
                        <th scope="col" class="whitespace-nowrap bg-slate-200 dark:bg-navy-800 px-4 py-3 text-right font-semibold uppercase text-slate-800 dark:text-navy-100 lg:px-5">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($genres as $genre)
                        <tr class="border-b border-slate-200 dark:border-navy-500">
                            <td class="px-4 py-3 lg:px-5">
                                <div class="flex items-center gap-3">
                                    <div class="size-10 rounded-lg flex items-center justify-center text-white font-bold"
                                         style="background: {{ $genre->color ?? '#6366f1' }}">
                                        @if($genre->icon)
                                            <span class="material-icons-round text-xl">{{ $genre->icon }}</span>
                                        @else
                                            {{ strtoupper(substr($genre->name, 0, 1)) }}
                                        @endif
                                    </div>
                                    <div>
                                        <div class="font-medium text-slate-700 dark:text-navy-100">
                                            {{ $genre->name }}
                                        </div>
                                        @if($genre->description)
                                            <div class="text-xs text-slate-500 dark:text-navy-400">
                                                {{ Str::limit($genre->description, 40) }}
                                            </div>
                                        @endif
                                    </div>
                                </div>
                            </td>
                            <td class="px-4 py-3 lg:px-5">
                                <div class="flex items-center gap-2">
                                    @if($genre->color)
                                        <div class="size-6 rounded border border-slate-200 dark:border-navy-600" style="background: {{ $genre->color }}"></div>
                                    @endif
                                    @if($genre->icon)
                                        <span class="text-slate-600 dark:text-navy-300 text-sm">{{ $genre->icon }}</span>
                                    @endif
                                </div>
                            </td>
                            <td class="px-4 py-3 lg:px-5">
                                <code class="text-xs text-slate-700 dark:text-navy-100 bg-slate-100 dark:bg-navy-700 px-2 py-1 rounded">{{ $genre->slug }}</code>
                            </td>
                            <td class="px-4 py-3 lg:px-5">
                                <span class="text-slate-700 dark:text-navy-100">{{ $genre->songs_count ?? 0 }}</span>
                            </td>
                            <td class="px-4 py-3 lg:px-5">
                                @if($genre->is_active)
                                    <span class="badge bg-success/10 text-success dark:bg-success/15">
                                        Active
                                    </span>
                                @else
                                    <span class="badge bg-slate-150 text-slate-800 dark:bg-navy-500 dark:text-navy-100">
                                        Inactive
                                    </span>
                                @endif
                            </td>
                            <td class="px-4 py-3 text-right lg:px-5">
                                <div class="flex items-center justify-end gap-3">
                                    <a href="{{ route('admin.genres.edit', $genre) }}" 
                                       class="text-primary hover:text-primary-focus dark:text-accent-light dark:hover:text-accent font-medium">
                                        Edit
                                    </a>
                                    <form action="{{ route('admin.genres.destroy', $genre) }}" method="POST" class="inline" onsubmit="return confirm('Are you sure? This will affect {{ $genre->songs_count }} songs.')">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="text-error hover:text-error-focus font-medium">
                                            Delete
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
            </div>

            <!-- Pagination -->
            <div class="flex items-center justify-between border-t border-slate-200 dark:border-navy-500 px-4 py-3 sm:px-6">
                {{ $genres->links() }}
            </div>
        @else
            <div class="text-center py-12">
                <svg class="mx-auto size-12 text-slate-400 dark:text-navy-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                </svg>
                <h3 class="mt-2 text-sm font-medium text-slate-700 dark:text-navy-100">No genres</h3>
                <p class="mt-1 text-sm text-slate-500 dark:text-navy-400">Get started by creating a new genre.</p>
                <div class="mt-6">
                    <a href="{{ route('admin.genres.create') }}"
                       class="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-focus dark:bg-accent dark:hover:bg-accent-focus text-white font-medium rounded-lg transition-colors shadow-sm">
                        <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        Add New Genre
                    </a>
                </div>
            </div>
        @endif
    </div>
</div>
@endsection
