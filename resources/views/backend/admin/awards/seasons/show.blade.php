@extends('layouts.admin')

@section('title', $season->name)

@section('content')
<div class="dashboard-content">
    <!-- Page Header -->
    <div class="mb-8">
        <div class="flex items-center gap-4 mb-4">
            <a href="{{ route('admin.awards.seasons.index') }}" class="btn btn-sm bg-slate-100 text-slate-700 hover:bg-slate-200">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Seasons
            </a>
        </div>
        
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">{{ $season->name }}</h1>
                <p class="text-slate-600 dark:text-navy-300">{{ $season->description }}</p>
            </div>
            <div class="flex gap-2">
                <a href="{{ route('admin.awards.seasons.edit', $season->id) }}" class="btn bg-primary text-white hover:bg-primary-focus">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Season
                </a>
            </div>
        </div>
    </div>

    <!-- Season Overview -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Status Card -->
        <div class="admin-card">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Status</h3>
            <div class="space-y-2">
                @php
                    $now = now();
                    $nominationStart = \Carbon\Carbon::parse($season->nominations_start_at);
                    $nominationEnd = \Carbon\Carbon::parse($season->nominations_end_at);
                    $votingStart = \Carbon\Carbon::parse($season->voting_start_at);
                    $votingEnd = \Carbon\Carbon::parse($season->voting_end_at);
                    
                    if ($now->isBefore($nominationStart)) {
                        $status = 'Upcoming';
                        $statusClass = 'bg-slate-100 text-slate-800';
                    } elseif ($now->between($nominationStart, $nominationEnd)) {
                        $status = 'Nominations Open';
                        $statusClass = 'bg-info-light text-info';
                    } elseif ($now->between($votingStart, $votingEnd)) {
                        $status = 'Voting Open';
                        $statusClass = 'bg-success-light text-success';
                    } else {
                        $status = 'Completed';
                        $statusClass = 'bg-slate-100 text-slate-600';
                    }
                @endphp
                <span class="inline-block px-3 py-1 text-sm font-medium rounded-full {{ $statusClass }}">
                    {{ $status }}
                </span>
                <p class="text-sm text-slate-600 dark:text-navy-300 mt-2">
                    Year: <strong>{{ $season->year }}</strong>
                </p>
            </div>
        </div>

        <!-- Timeline Card -->
        <div class="admin-card">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Timeline</h3>
            <div class="space-y-3 text-sm">
                <div>
                    <p class="text-slate-500 dark:text-navy-400">Nominations</p>
                    <p class="font-medium text-slate-800 dark:text-navy-50">
                        {{ \Carbon\Carbon::parse($season->nominations_start_at)->format('M j, Y') }} - {{ \Carbon\Carbon::parse($season->nominations_end_at)->format('M j, Y') }}
                    </p>
                </div>
                <div>
                    <p class="text-slate-500 dark:text-navy-400">Voting</p>
                    <p class="font-medium text-slate-800 dark:text-navy-50">
                        {{ \Carbon\Carbon::parse($season->voting_start_at)->format('M j, Y') }} - {{ \Carbon\Carbon::parse($season->voting_end_at)->format('M j, Y') }}
                    </p>
                </div>
                @if($season->ceremony_at)
                <div>
                    <p class="text-slate-500 dark:text-navy-400">Ceremony</p>
                    <p class="font-medium text-slate-800 dark:text-navy-50">
                        {{ \Carbon\Carbon::parse($season->ceremony_at)->format('M j, Y') }}
                    </p>
                </div>
                @endif
            </div>
        </div>

        <!-- Statistics Card -->
        <div class="admin-card">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Statistics</h3>
            <div class="space-y-3">
                <div class="flex justify-between items-center">
                    <span class="text-slate-600 dark:text-navy-300">Categories</span>
                    <span class="font-bold text-primary">{{ $stats['total_categories'] }}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-slate-600 dark:text-navy-300">Nominations</span>
                    <span class="font-bold text-primary">{{ $stats['total_nominations'] }}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-slate-600 dark:text-navy-300">Total Votes</span>
                    <span class="font-bold text-primary">{{ number_format($stats['total_votes']) }}</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Categories -->
    <div class="admin-card">
        <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-slate-800 dark:text-navy-50">Award Categories</h2>
            <a href="{{ route('admin.awards.categories.create', ['season' => $season->id]) }}" class="btn btn-sm bg-primary text-white">
                Add Category
            </a>
        </div>

        @if($categories->count() > 0)
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                @foreach($categories as $category)
                    <div class="p-4 border border-slate-200 dark:border-navy-500 rounded-lg">
                        <h3 class="font-semibold text-slate-800 dark:text-navy-50 mb-2">{{ $category->name }}</h3>
                        <p class="text-sm text-slate-600 dark:text-navy-300 mb-3">{{ $category->description }}</p>
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-slate-500">Nominations</span>
                            <a href="{{ route('admin.awards.categories.show', $category->id) }}" class="text-primary hover:underline">
                                View Details →
                            </a>
                        </div>
                    </div>
                @endforeach
            </div>
        @else
            <div class="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-16 mx-auto text-slate-300 dark:text-navy-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 class="text-xl font-medium text-slate-700 dark:text-navy-300 mb-2">No Categories Yet</h3>
                <p class="text-slate-500 dark:text-navy-400 mb-4">Start by adding award categories for this season.</p>
                <a href="{{ route('admin.awards.categories.create', ['season' => $season->id]) }}" class="btn bg-primary text-white">
                    Add First Category
                </a>
            </div>
        @endif
    </div>
</div>
@endsection
