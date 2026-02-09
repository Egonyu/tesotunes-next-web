@extends('layouts.admin')

@section('title', 'Award Seasons')

@section('content')
<div class="dashboard-content">
    <!-- Page Header -->
    <div class="mb-8">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">Award Seasons</h1>
                <p class="text-slate-600 dark:text-navy-300">Manage award seasons and their timelines</p>
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

    <!-- Seasons List -->
    <div class="admin-card">
        @if($seasons->count() > 0)
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead>
                        <tr class="border-b border-slate-200 dark:border-navy-500">
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Season</th>
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Year</th>
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Timeline</th>
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Status</th>
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Categories</th>
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($seasons as $season)
                            <tr class="border-b border-slate-100 dark:border-navy-600">
                                <td class="px-4 py-3">
                                    <div class="font-medium text-slate-800 dark:text-navy-50">{{ $season->name }}</div>
                                    @if($season->description)
                                        <div class="text-sm text-slate-500 dark:text-navy-400">{{ Str::limit($season->description, 60) }}</div>
                                    @endif
                                </td>
                                <td class="px-4 py-3 text-slate-800 dark:text-navy-50">{{ $season->year }}</td>
                                <td class="px-4 py-3">
                                    <div class="text-sm">
                                        <div class="text-slate-600 dark:text-navy-300">
                                            @php
                                                $nomStart = is_string($season->nominations_start_at) ? \Carbon\Carbon::parse($season->nominations_start_at) : $season->nominations_start_at;
                                                $nomEnd = is_string($season->nominations_end_at) ? \Carbon\Carbon::parse($season->nominations_end_at) : $season->nominations_end_at;
                                            @endphp
                                            Nominations: {{ $nomStart->format('M j') }} - {{ $nomEnd->format('M j') }}
                                        </div>
                                        <div class="text-slate-600 dark:text-navy-300">
                                            @php
                                                $voteStart = is_string($season->voting_start_at) ? \Carbon\Carbon::parse($season->voting_start_at) : $season->voting_start_at;
                                                $voteEnd = is_string($season->voting_end_at) ? \Carbon\Carbon::parse($season->voting_end_at) : $season->voting_end_at;
                                            @endphp
                                            Voting: {{ $voteStart->format('M j') }} - {{ $voteEnd->format('M j') }}
                                        </div>
                                    </div>
                                </td>
                                <td class="px-4 py-3">
                                    @php
                                        $now = now();
                                        $nomStart = is_string($season->nominations_start_at) ? \Carbon\Carbon::parse($season->nominations_start_at) : $season->nominations_start_at;
                                        $nomEnd = is_string($season->nominations_end_at) ? \Carbon\Carbon::parse($season->nominations_end_at) : $season->nominations_end_at;
                                        $voteStart = is_string($season->voting_start_at) ? \Carbon\Carbon::parse($season->voting_start_at) : $season->voting_start_at;
                                        $voteEnd = is_string($season->voting_end_at) ? \Carbon\Carbon::parse($season->voting_end_at) : $season->voting_end_at;
                                        
                                        if ($now->isBefore($nomStart)) {
                                            $status = 'Upcoming';
                                            $statusClass = 'bg-slate-100 text-slate-800';
                                        } elseif ($now->between($nomStart, $nomEnd)) {
                                            $status = 'Nominations Open';
                                            $statusClass = 'bg-info-light text-info';
                                        } elseif ($now->between($voteStart, $voteEnd)) {
                                            $status = 'Voting Open';
                                            $statusClass = 'bg-success-light text-success';
                                        } else {
                                            $status = 'Completed';
                                            $statusClass = 'bg-slate-100 text-slate-600';
                                        }
                                    @endphp
                                    <span class="px-2 py-1 text-xs font-medium rounded-full {{ $statusClass }}">
                                        {{ $status }}
                                    </span>
                                </td>
                                <td class="px-4 py-3 text-slate-800 dark:text-navy-50">
                                    {{ DB::table('award_categories')->where('award_season_id', $season->id)->count() }}
                                </td>
                                <td class="px-4 py-3">
                                    <div class="flex gap-2">
                                        <a href="{{ route('admin.awards.seasons.show', $season->id) }}"
                                           class="btn size-8 rounded-full p-0 hover:bg-slate-300/20"
                                           title="View Details">
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

            <!-- Pagination -->
            @if($seasons->hasPages())
                <div class="mt-6">
                    {{ $seasons->links() }}
                </div>
            @endif
        @else
            <div class="text-center py-12">
                <div class="flex size-16 items-center justify-center rounded-full bg-slate-100 dark:bg-navy-600 mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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