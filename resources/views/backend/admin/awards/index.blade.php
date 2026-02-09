@extends('layouts.admin')

@section('title', 'Awards Management')

@section('content')
<div class="dashboard-content">
    <!-- Page Header -->
    <div class="mb-8">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">Awards Management</h1>
                <p class="text-slate-600 dark:text-navy-300">Manage award seasons, categories, nominations and voting</p>
            </div>
            <div class="flex gap-2">
                <a href="{{ route('admin.awards.seasons.create') }}"
                   class="btn bg-primary text-white hover:bg-primary-focus">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    New Season
                </a>
            </div>
        </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div class="admin-card">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-slate-600 dark:text-navy-300">Total Seasons</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50">{{ $seasons->total() }}</p>
                </div>
                <div class="flex size-12 items-center justify-center rounded-lg bg-info/10 text-info">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="admin-card">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-slate-600 dark:text-navy-300">Active Categories</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50">
                        {{ DB::table('award_categories')->where('is_active', true)->count() }}
                    </p>
                </div>
                <div class="flex size-12 items-center justify-center rounded-lg bg-warning/10 text-warning">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="admin-card">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-slate-600 dark:text-navy-300">Total Nominations</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50">
                        {{ DB::table('award_nominations')->count() }}
                    </p>
                </div>
                <div class="flex size-12 items-center justify-center rounded-lg bg-success/10 text-success">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="admin-card">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-slate-600 dark:text-navy-300">Total Votes</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50">
                        {{ DB::table('award_votes')->count() }}
                    </p>
                </div>
                <div class="flex size-12 items-center justify-center rounded-lg bg-error/10 text-error">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                </div>
            </div>
        </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div class="admin-card">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Award Seasons</h3>
            <p class="text-sm text-slate-600 dark:text-navy-300 mb-4">Manage award seasons and their timelines</p>
            <a href="{{ route('admin.awards.seasons.index') }}"
               class="btn bg-info text-white hover:bg-info-focus w-full">
                Manage Seasons
            </a>
        </div>

        <div class="admin-card">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Categories</h3>
            <p class="text-sm text-slate-600 dark:text-navy-300 mb-4">Configure award categories and voting rules</p>
            <a href="{{ route('admin.awards.categories.index') }}"
               class="btn bg-warning text-white hover:bg-warning-focus w-full">
                Manage Categories
            </a>
        </div>

        <div class="admin-card">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Nominations</h3>
            <p class="text-sm text-slate-600 dark:text-navy-300 mb-4">Review and moderate nominations</p>
            <a href="{{ route('admin.awards.nominations.index') }}"
               class="btn bg-success text-white hover:bg-success-focus w-full">
                Review Nominations
            </a>
        </div>
    </div>

    <!-- Recent Seasons -->
    <div class="admin-card">
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-slate-800 dark:text-navy-50">Recent Award Seasons</h3>
            <a href="{{ route('admin.awards.seasons.index') }}"
               class="text-primary hover:text-primary-focus text-sm font-medium">
                View All
            </a>
        </div>

        @if($seasons->count() > 0)
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead>
                        <tr class="border-b border-slate-200 dark:border-navy-500">
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Season</th>
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Year</th>
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Status</th>
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Nominations</th>
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Votes</th>
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($seasons->take(5) as $season)
                            <tr class="border-b border-slate-100 dark:border-navy-600">
                                <td class="px-4 py-3">
                                    <div class="font-medium text-slate-800 dark:text-navy-50">{{ $season->name }}</div>
                                    <div class="text-sm text-slate-500 dark:text-navy-400">{{ Str::limit($season->description, 50) }}</div>
                                </td>
                                <td class="px-4 py-3 text-slate-800 dark:text-navy-50">{{ $season->year }}</td>
                                <td class="px-4 py-3">
                                    <span class="px-2 py-1 text-xs font-medium rounded-full
                                        @if($season->status === 'upcoming') bg-slate-100 text-slate-800
                                        @elseif($season->status === 'nominations_open') bg-info-light text-info
                                        @elseif($season->status === 'voting_open') bg-success-light text-success
                                        @else bg-slate-100 text-slate-600
                                        @endif">
                                        {{ ucwords(str_replace('_', ' ', $season->status)) }}
                                    </span>
                                </td>
                                <td class="px-4 py-3 text-slate-800 dark:text-navy-50">
                                    {{ DB::table('award_nominations')->whereIn('award_category_id',
                                        DB::table('award_categories')->where('award_season_id', $season->id)->pluck('id')
                                    )->count() }}
                                </td>
                                <td class="px-4 py-3 text-slate-800 dark:text-navy-50">
                                    {{ DB::table('award_votes')->whereIn('award_nomination_id',
                                        DB::table('award_nominations')->whereIn('award_category_id',
                                            DB::table('award_categories')->where('award_season_id', $season->id)->pluck('id')
                                        )->pluck('id')
                                    )->count() }}
                                </td>
                                <td class="px-4 py-3">
                                    <div class="flex gap-2">
                                        <a href="{{ route('admin.awards.seasons.show', $season->id) }}"
                                           class="btn size-8 rounded-full p-0 hover:bg-slate-300/20">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @else
            <div class="text-center py-12">
                <div class="flex size-16 items-center justify-center rounded-full bg-slate-100 dark:bg-navy-600 mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                </div>
                <h3 class="text-lg font-medium text-slate-800 dark:text-navy-50 mb-2">No Award Seasons</h3>
                <p class="text-slate-600 dark:text-navy-300 mb-4">Get started by creating your first award season</p>
                <a href="{{ route('admin.awards.seasons.create') }}"
                   class="btn bg-primary text-white hover:bg-primary-focus">
                    Create Award Season
                </a>
            </div>
        @endif
    </div>
</div>
@endsection