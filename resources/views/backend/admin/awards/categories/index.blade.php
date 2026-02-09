@extends('layouts.admin')

@section('title', 'Award Categories')

@section('content')
<div class="dashboard-content">
    <!-- Page Header -->
    <div class="mb-8">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">Award Categories</h1>
                <p class="text-slate-600 dark:text-navy-300">Manage award categories and voting configurations</p>
            </div>
            <div class="flex gap-2">
                <a href="{{ route('admin.awards.categories.create') }}"
                   class="btn bg-primary text-white hover:bg-primary-focus">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    New Category
                </a>
            </div>
        </div>
    </div>

    <!-- Stats Cards -->
    @php
        $totalCategories = $categories->total();
        $activeCategories = DB::table('award_categories')->where('is_active', true)->count();
        $totalNominations = DB::table('award_nominations')->count();
        $pendingNominations = DB::table('award_nominations')->where('status', 'pending')->count();
    @endphp
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div class="admin-card">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-slate-600 dark:text-navy-300">Total Categories</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50">{{ $totalCategories }}</p>
                </div>
                <div class="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="admin-card">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-slate-600 dark:text-navy-300">Active Categories</p>
                    <p class="text-2xl font-bold text-green-600">{{ $activeCategories }}</p>
                </div>
                <div class="flex size-12 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="admin-card">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-slate-600 dark:text-navy-300">Total Nominations</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50">{{ $totalNominations }}</p>
                </div>
                <div class="flex size-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="admin-card">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-slate-600 dark:text-navy-300">Pending Review</p>
                    <p class="text-2xl font-bold text-yellow-600">{{ $pendingNominations }}</p>
                </div>
                <div class="flex size-12 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
        </div>
    </div>

    <!-- Filters -->
    <div class="admin-card mb-6">
        <form method="GET" action="{{ route('admin.awards.categories.index') }}" class="flex flex-wrap gap-4">
            <div class="flex-1 min-w-[200px]">
                <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-1">Status</label>
                <select name="status" class="form-select w-full" onchange="this.form.submit()">
                    <option value="">All Status</option>
                    <option value="active" {{ request('status') === 'active' ? 'selected' : '' }}>Active</option>
                    <option value="inactive" {{ request('status') === 'inactive' ? 'selected' : '' }}>Inactive</option>
                </select>
            </div>
            <div class="flex-1 min-w-[200px]">
                <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-1">Nominee Type</label>
                <select name="type" class="form-select w-full" onchange="this.form.submit()">
                    <option value="">All Types</option>
                    <option value="artist" {{ request('type') === 'artist' ? 'selected' : '' }}>Artist</option>
                    <option value="track" {{ request('type') === 'track' ? 'selected' : '' }}>Track</option>
                    <option value="album" {{ request('type') === 'album' ? 'selected' : '' }}>Album</option>
                </select>
            </div>
            <div class="flex-1 min-w-[200px]">
                <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-1">Season</label>
                <select name="season" class="form-select w-full" onchange="this.form.submit()">
                    <option value="">All Seasons</option>
                    @foreach(DB::table('award_seasons')->orderBy('year', 'desc')->get() as $season)
                        <option value="{{ $season->id }}" {{ request('season') == $season->id ? 'selected' : '' }}>
                            {{ $season->name }} ({{ $season->year }})
                        </option>
                    @endforeach
                </select>
            </div>
            @if(request()->hasAny(['status', 'type', 'season']))
            <div class="flex items-end">
                <a href="{{ route('admin.awards.categories.index') }}" class="btn bg-slate-200 text-slate-700 hover:bg-slate-300">
                    Clear Filters
                </a>
            </div>
            @endif
        </form>
    </div>

    <!-- Categories List -->
    <div class="admin-card">
        @if($categories->count() > 0)
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead>
                        <tr class="border-b border-slate-200 dark:border-navy-500">
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Category</th>
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Season</th>
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Type</th>
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Voting Limits</th>
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Status</th>
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Nominations</th>
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($categories as $category)
                            <tr class="border-b border-slate-100 dark:border-navy-600 hover:bg-slate-50 dark:hover:bg-navy-900">
                                <td class="px-4 py-3">
                                    <div class="flex items-center gap-3">
                                        @if($category->icon)
                                            <div class="flex size-8 items-center justify-center rounded bg-primary/10 text-primary text-sm">
                                                {{ $category->icon }}
                                            </div>
                                        @endif
                                        <div>
                                            <div class="font-medium text-slate-800 dark:text-navy-50">{{ $category->name }}</div>
                                            @if($category->description)
                                                <div class="text-sm text-slate-500 dark:text-navy-400">{{ Str::limit($category->description, 50) }}</div>
                                            @endif
                                        </div>
                                    </div>
                                </td>
                                <td class="px-4 py-3">
                                    <div class="text-slate-800 dark:text-navy-50">{{ $category->season_name ?? 'N/A' }}</div>
                                    <div class="text-sm text-slate-500 dark:text-navy-400">{{ $category->year ?? '' }}</div>
                                </td>
                                <td class="px-4 py-3">
                                    <span class="px-2 py-1 text-xs font-medium rounded-full bg-info-light text-info">
                                        {{ ucfirst($category->nominee_type) }}
                                    </span>
                                </td>
                                <td class="px-4 py-3">
                                    <div class="text-sm text-slate-800 dark:text-navy-50">
                                        <div>Nominations: {{ $category->max_nominations_per_user }}</div>
                                        <div>Votes: {{ $category->max_votes_per_user }}</div>
                                    </div>
                                </td>
                                <td class="px-4 py-3">
                                    <div class="flex flex-col gap-1">
                                        <span class="px-2 py-1 text-xs font-medium rounded-full {{ $category->is_active ? 'bg-success-light text-success' : 'bg-slate-100 text-slate-600' }}">
                                            {{ $category->is_active ? 'Active' : 'Inactive' }}
                                        </span>
                                        @if($category->is_jury_category)
                                            <span class="px-2 py-1 text-xs font-medium rounded-full bg-warning-light text-warning">
                                                Jury {{ $category->jury_weight_percentage }}%
                                            </span>
                                        @endif
                                    </div>
                                </td>
                                <td class="px-4 py-3 text-slate-800 dark:text-navy-50">
                                    {{ DB::table('award_nominations')->where('award_category_id', $category->id)->count() }}
                                </td>
                                <td class="px-4 py-3">
                                    <div class="flex gap-2">
                                        <a href="{{ route('admin.awards.categories.show', $category->id) }}" 
                                           class="btn size-8 rounded-full p-0 hover:bg-slate-300/20"
                                           title="View Details">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </a>
                                        <a href="{{ route('admin.awards.categories.edit', $category->id) }}" 
                                           class="btn size-8 rounded-full p-0 hover:bg-primary/20 text-primary"
                                           title="Edit Category">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            @if($categories->hasPages())
                <div class="mt-6">
                    {{ $categories->links() }}
                </div>
            @endif
        @else
            <div class="text-center py-12">
                <div class="flex size-16 items-center justify-center rounded-full bg-slate-100 dark:bg-navy-600 mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                </div>
                <h3 class="text-lg font-medium text-slate-800 dark:text-navy-50 mb-2">No Award Categories</h3>
                <p class="text-slate-600 dark:text-navy-300 mb-4">Create categories for your award seasons</p>
                <a href="{{ route('admin.awards.categories.create') }}"
                   class="btn bg-primary text-white hover:bg-primary-focus">
                    Create Category
                </a>
            </div>
        @endif
    </div>
</div>
@endsection