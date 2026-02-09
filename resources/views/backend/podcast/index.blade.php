@extends('layouts.admin')

@section('title', 'Podcast Management')

@section('content')
<div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">Podcast Management</h1>
            <p class="mt-1 text-sm text-slate-500 dark:text-navy-300">Manage and moderate all podcasts on the platform</p>
        </div>
        <div class="flex gap-3">
            <a href="{{ route('admin.podcasts.import.form') }}" 
               class="btn bg-slate-150 font-medium text-slate-800 hover:bg-slate-200 focus:bg-slate-200 active:bg-slate-200/80 dark:bg-navy-500 dark:text-navy-50 dark:hover:bg-navy-450 dark:focus:bg-navy-450 dark:active:bg-navy-450/90">
                <svg class="size-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Import from RSS
            </a>
            <a href="{{ route('admin.settings.index') }}?tab=podcasts" 
               class="btn bg-primary font-medium text-white hover:bg-primary-focus focus:bg-primary-focus active:bg-primary-focus/90 dark:bg-accent dark:hover:bg-accent-focus dark:focus:bg-accent-focus dark:active:bg-accent/90">
                <svg class="size-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                Settings
            </a>
        </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div class="card p-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ uppercase text-slate-400 dark:text-navy-300">Total</p>
                    <p class="mt-1 text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ $stats['total'] }}</p>
                </div>
                <div class="flex size-10 items-center justify-center rounded-full bg-primary/10 dark:bg-accent-light/15">
                    <svg class="size-5 text-primary dark:text-accent-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
                    </svg>
                </div>
            </div>
        </div>

        <div class="card p-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ uppercase text-slate-400 dark:text-navy-300">Draft</p>
                    <p class="mt-1 text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ $stats['draft'] }}</p>
                </div>
                <div class="flex size-10 items-center justify-center rounded-full bg-slate-150 dark:bg-navy-500">
                    <svg class="size-5 text-slate-500 dark:text-navy-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                    </svg>
                </div>
            </div>
        </div>

        <div class="card p-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ uppercase text-slate-400 dark:text-navy-300">Pending</p>
                    <p class="mt-1 text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ $stats['pending'] }}</p>
                </div>
                <div class="flex size-10 items-center justify-center rounded-full bg-warning/10 dark:bg-warning/15">
                    <svg class="size-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                </div>
            </div>
        </div>

        <div class="card p-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ uppercase text-slate-400 dark:text-navy-300">Published</p>
                    <p class="mt-1 text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ $stats['published'] }}</p>
                </div>
                <div class="flex size-10 items-center justify-center rounded-full bg-success/10 dark:bg-success/15">
                    <svg class="size-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                </div>
            </div>
        </div>

        <div class="card p-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ uppercase text-slate-400 dark:text-navy-300">Suspended</p>
                    <p class="mt-1 text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ $stats['suspended'] }}</p>
                </div>
                <div class="flex size-10 items-center justify-center rounded-full bg-error/10 dark:bg-error/15">
                    <svg class="size-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                    </svg>
                </div>
            </div>
        </div>
    </div>

    <!-- Filters -->
    <div class="card p-4">
        <form method="GET" action="{{ route('admin.podcasts.index') }}" class="flex flex-wrap items-end gap-4">
            <div class="flex-1 min-w-[200px]">
                <label class="block text-xs+ font-medium text-slate-700 dark:text-navy-100">Search</label>
                <input type="text" name="search" value="{{ request('search') }}" 
                       placeholder="Search by title or description..."
                       class="form-input mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent"/>
            </div>

            <div class="w-48">
                <label class="block text-xs+ font-medium text-slate-700 dark:text-navy-100">Status</label>
                <select name="status" class="form-select mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent">
                    <option value="all" {{ request('status') == 'all' ? 'selected' : '' }}>All Status</option>
                    <option value="draft" {{ request('status') == 'draft' ? 'selected' : '' }}>Draft</option>
                    <option value="pending" {{ request('status') == 'pending' ? 'selected' : '' }}>Pending</option>
                    <option value="published" {{ request('status') == 'published' ? 'selected' : '' }}>Published</option>
                    <option value="suspended" {{ request('status') == 'suspended' ? 'selected' : '' }}>Suspended</option>
                </select>
            </div>

            <div class="flex gap-2">
                <button type="submit" class="btn bg-primary font-medium text-white hover:bg-primary-focus focus:bg-primary-focus active:bg-primary-focus/90">
                    Filter
                </button>
                <a href="{{ route('admin.podcasts.index') }}" class="btn bg-slate-150 font-medium text-slate-800 hover:bg-slate-200">
                    Reset
                </a>
            </div>
        </form>
    </div>

    <!-- Podcasts Table -->
    <div class="card">
        <div class="is-scrollbar-hidden min-w-full overflow-x-auto">
            <table class="is-hoverable w-full text-left">
                <thead>
                    <tr>
                        <th class="whitespace-nowrap rounded-tl-lg bg-slate-200 px-4 py-3 font-semibold uppercase text-slate-800 dark:bg-navy-800 dark:text-navy-100 lg:px-5">
                            Podcast
                        </th>
                        <th class="whitespace-nowrap bg-slate-200 px-4 py-3 font-semibold uppercase text-slate-800 dark:bg-navy-800 dark:text-navy-100 lg:px-5">
                            Creator
                        </th>
                        <th class="whitespace-nowrap bg-slate-200 px-4 py-3 font-semibold uppercase text-slate-800 dark:bg-navy-800 dark:text-navy-100 lg:px-5">
                            Episodes
                        </th>
                        <th class="whitespace-nowrap bg-slate-200 px-4 py-3 font-semibold uppercase text-slate-800 dark:bg-navy-800 dark:text-navy-100 lg:px-5">
                            Status
                        </th>
                        <th class="whitespace-nowrap bg-slate-200 px-4 py-3 font-semibold uppercase text-slate-800 dark:bg-navy-800 dark:text-navy-100 lg:px-5">
                            Created
                        </th>
                        <th class="whitespace-nowrap rounded-tr-lg bg-slate-200 px-4 py-3 font-semibold uppercase text-slate-800 dark:bg-navy-800 dark:text-navy-100 lg:px-5">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($podcasts as $podcast)
                    <tr class="border-y border-transparent border-b-slate-200 dark:border-b-navy-500">
                        <td class="whitespace-nowrap px-4 py-3 sm:px-5">
                            <div class="flex items-center gap-3">
                                <div class="avatar size-10">
                                    <img class="rounded-lg" src="{{ $podcast->cover_image ? Storage::url($podcast->cover_image) : asset('images/podcast-default.jpg') }}" alt="{{ $podcast->title }}"/>
                                </div>
                                <div>
                                    <p class="font-medium text-slate-700 dark:text-navy-100">{{ $podcast->title }}</p>
                                    <p class="text-xs text-slate-400">{{ Str::limit($podcast->description, 50) }}</p>
                                </div>
                            </div>
                        </td>
                        <td class="whitespace-nowrap px-4 py-3 sm:px-5">
                            <p class="font-medium">{{ $podcast->user->name }}</p>
                            <p class="text-xs text-slate-400">{{ $podcast->user->email }}</p>
                        </td>
                        <td class="whitespace-nowrap px-4 py-3 sm:px-5">
                            <span class="badge bg-slate-150 text-slate-800 dark:bg-navy-500 dark:text-navy-100">
                                {{ $podcast->episodes_count }} episodes
                            </span>
                        </td>
                        <td class="whitespace-nowrap px-4 py-3 sm:px-5">
                            @if($podcast->status === 'published')
                                <span class="badge bg-success/10 text-success dark:bg-success/15">Published</span>
                            @elseif($podcast->status === 'pending')
                                <span class="badge bg-warning/10 text-warning dark:bg-warning/15">Pending</span>
                            @elseif($podcast->status === 'draft')
                                <span class="badge bg-slate-150 text-slate-800 dark:bg-navy-500 dark:text-navy-100">Draft</span>
                            @elseif($podcast->status === 'suspended')
                                <span class="badge bg-error/10 text-error dark:bg-error/15">Suspended</span>
                            @endif
                        </td>
                        <td class="whitespace-nowrap px-4 py-3 text-xs+ sm:px-5">
                            {{ $podcast->created_at->format('M d, Y') }}
                        </td>
                        <td class="whitespace-nowrap px-4 py-3 sm:px-5">
                            <div class="flex items-center gap-2">
                                <a href="{{ route('admin.podcasts.show', $podcast) }}" 
                                   class="btn size-8 rounded-full p-0 hover:bg-slate-300/20 focus:bg-slate-300/20 active:bg-slate-300/25 dark:hover:bg-navy-300/20 dark:focus:bg-navy-300/20 dark:active:bg-navy-300/25"
                                   title="View Details">
                                    <svg class="size-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                    </svg>
                                </a>

                                @if($podcast->status === 'pending')
                                <form method="POST" action="{{ route('admin.podcasts.approve', $podcast) }}" class="inline">
                                    @csrf
                                    <button type="submit" 
                                            class="btn size-8 rounded-full p-0 hover:bg-success/20 focus:bg-success/20 active:bg-success/25"
                                            title="Approve">
                                        <svg class="size-4.5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                        </svg>
                                    </button>
                                </form>
                                @endif

                                <form method="POST" action="{{ route('admin.podcasts.destroy', $podcast) }}" class="inline" onsubmit="return confirm('Are you sure you want to delete this podcast? This action cannot be undone.')">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" 
                                            class="btn size-8 rounded-full p-0 hover:bg-error/20 focus:bg-error/20 active:bg-error/25"
                                            title="Delete">
                                        <svg class="size-4.5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                        </svg>
                                    </button>
                                </form>
                            </div>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="6" class="px-4 py-8 text-center">
                            <div class="flex flex-col items-center justify-center">
                                <svg class="size-16 text-slate-300 dark:text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
                                </svg>
                                <p class="mt-2 text-slate-400 dark:text-navy-300">No podcasts found</p>
                            </div>
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <div class="px-4 py-4">
            {{ $podcasts->links() }}
        </div>
    </div>
</div>
@endsection
