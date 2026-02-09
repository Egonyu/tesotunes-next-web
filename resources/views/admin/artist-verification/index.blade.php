@extends('layouts.admin')

@section('title', 'Artist Verification')

@section('content')
<div class="flex flex-col space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Artist Verification</h1>
            <p class="text-slate-600 dark:text-slate-300">Review and approve artist applications</p>
        </div>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg p-6 shadow-sm dark:bg-navy-800">
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-slate-600 dark:text-slate-300">Pending Review</p>
                    <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ $statistics['pending'] }}</p>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-sm dark:bg-navy-800">
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-slate-600 dark:text-slate-300">Verified</p>
                    <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ $statistics['verified'] }}</p>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-sm dark:bg-navy-800">
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-error/10 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </div>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-slate-600 dark:text-slate-300">Rejected</p>
                    <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ $statistics['rejected'] }}</p>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-sm dark:bg-navy-800">
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                    </div>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-slate-600 dark:text-slate-300">Total Artists</p>
                    <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ $statistics['total'] }}</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Filters and Search -->
    <div class="bg-white rounded-lg p-6 shadow-sm dark:bg-navy-800">
        <form method="GET" action="{{ route('admin.artist-verification.index') }}" class="flex flex-col md:flex-row gap-4">
            <!-- Search -->
            <div class="flex-1">
                <input
                    type="text"
                    name="search"
                    value="{{ $search }}"
                    placeholder="Search by stage name or email..."
                    class="form-input w-full"
                >
            </div>

            <!-- Status Filter -->
            <select
                name="status"
                class="form-select"
                onchange="this.form.submit()"
            >
                <option value="all" {{ $currentStatus === 'all' ? 'selected' : '' }}>All Status</option>
                <option value="pending" {{ $currentStatus === 'pending' ? 'selected' : '' }}>Pending</option>
                <option value="verified" {{ $currentStatus === 'verified' ? 'selected' : '' }}>Verified</option>
                <option value="rejected" {{ $currentStatus === 'rejected' ? 'selected' : '' }}>Rejected</option>
                <option value="more_info_required" {{ $currentStatus === 'more_info_required' ? 'selected' : '' }}>More Info Required</option>
            </select>

            <button
                type="submit"
                class="btn bg-primary text-white hover:bg-primary-focus"
            >
                <svg class="size-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                Search
            </button>
        </form>
    </div>

    <!-- Applications Table -->
    <div class="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm dark:bg-navy-800 dark:border-navy-600">
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead class="bg-slate-50 border-b border-slate-200 dark:bg-navy-700 dark:border-navy-600">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider dark:text-slate-300">
                            <input type="checkbox" class="rounded border-slate-300 text-primary dark:border-slate-600 dark:bg-slate-700" id="select-all">
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider dark:text-slate-300">
                            Artist
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider dark:text-slate-300">
                            Genre
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider dark:text-slate-300">
                            Documents
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider dark:text-slate-300">
                            Status
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider dark:text-slate-300">
                            Submitted
                        </th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider dark:text-slate-300">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 dark:divide-navy-600">
                    @forelse($applications as $artist)
                        <tr class="hover:bg-slate-50 transition-colors dark:hover:bg-navy-700/50">
                            <td class="px-6 py-4">
                                <input type="checkbox" name="artist_ids[]" value="{{ $artist->id }}" class="rounded border-slate-300 text-primary dark:border-slate-600 dark:bg-slate-700">
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center dark:bg-slate-700">
                                        @if($artist->user->avatar)
                                            <img src="{{ $artist->user->avatar }}" class="w-full h-full rounded-full object-cover" alt="{{ $artist->stage_name }}">
                                        @else
                                            <span class="material-icons-round text-slate-400">person</span>
                                        @endif
                                    </div>
                                    <div>
                                        <p class="text-slate-900 font-medium dark:text-white">{{ $artist->stage_name }}</p>
                                        <p class="text-slate-500 text-sm dark:text-slate-400">{{ $artist->user->email }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <span class="text-slate-700 dark:text-slate-300">{{ $artist->primaryGenre->name ?? 'N/A' }}</span>
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-2">
                                    @php
                                        $verifiedDocs = $artist->user->kycDocuments->where('status', 'verified')->count();
                                        $totalDocs = $artist->user->kycDocuments->count();
                                    @endphp
                                    <span class="text-slate-900 font-medium dark:text-white">{{ $verifiedDocs }}/{{ $totalDocs }}</span>
                                    <span class="material-icons-round text-sm {{ $verifiedDocs === $totalDocs && $totalDocs > 0 ? 'text-green-500' : 'text-slate-500' }}">
                                        {{ $verifiedDocs === $totalDocs && $totalDocs > 0 ? 'check_circle' : 'pending' }}
                                    </span>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                @if($artist->verification_status === 'pending')
                                    <span class="inline-flex items-center gap-1 bg-warning/10 border border-warning text-warning px-3 py-1 rounded-full text-xs font-medium">
                                        <span class="w-2 h-2 bg-warning rounded-full"></span>
                                        Pending
                                    </span>
                                @elseif($artist->verification_status === 'verified')
                                    <span class="inline-flex items-center gap-1 bg-success/10 border border-success text-success px-3 py-1 rounded-full text-xs font-medium">
                                        <span class="w-2 h-2 bg-success rounded-full"></span>
                                        Verified
                                    </span>
                                @elseif($artist->verification_status === 'rejected')
                                    <span class="inline-flex items-center gap-1 bg-error/10 border border-error text-error px-3 py-1 rounded-full text-xs font-medium">
                                        <span class="w-2 h-2 bg-error rounded-full"></span>
                                        Rejected
                                    </span>
                                @elseif($artist->verification_status === 'more_info_required')
                                    <span class="inline-flex items-center gap-1 bg-orange-500/10 border border-orange-500 text-orange-600 px-3 py-1 rounded-full text-xs font-medium">
                                        <span class="w-2 h-2 bg-orange-500 rounded-full"></span>
                                        More Info
                                    </span>
                                @endif
                            </td>
                            <td class="px-6 py-4">
                                <p class="text-slate-700 text-sm dark:text-slate-300">{{ $artist->created_at->format('M j, Y') }}</p>
                                <p class="text-slate-500 text-xs dark:text-slate-400">{{ $artist->created_at->diffForHumans() }}</p>
                            </td>
                            <td class="px-6 py-4 text-right">
                                <a href="{{ route('admin.artist-verification.show', $artist) }}"
                                   class="inline-flex items-center gap-1 text-primary hover:text-primary-focus font-medium">
                                    Review
                                    <span class="material-icons-round text-sm">arrow_forward</span>
                                </a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="px-6 py-12 text-center">
                                <div class="flex flex-col items-center gap-3">
                                    <span class="material-icons-round text-5xl text-slate-400">inbox</span>
                                    <p class="text-slate-500 dark:text-slate-400">No applications found</p>
                                </div>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        @if($applications->hasPages())
            <div class="bg-slate-50 px-6 py-4 border-t border-slate-200 dark:bg-navy-700 dark:border-navy-600">
                {{ $applications->links() }}
            </div>
        @endif
    </div>

    <!-- Bulk Actions (shown when items selected) -->
    <div x-data="{ selectedCount: 0 }" x-show="selectedCount > 0" x-cloak class="fixed bottom-6 right-6 bg-white border border-slate-200 rounded-lg shadow-xl p-4 dark:bg-navy-800 dark:border-navy-600">
        <div class="flex items-center gap-4">
            <p class="text-slate-900 font-medium dark:text-white">
                <span x-text="selectedCount"></span> selected
            </p>
            <div class="flex gap-2">
                <button class="px-4 py-2 bg-success hover:bg-success-focus text-white rounded-lg text-sm font-medium transition-colors">
                    Approve All
                </button>
                <button class="px-4 py-2 bg-error hover:bg-error-focus text-white rounded-lg text-sm font-medium transition-colors">
                    Reject All
                </button>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
// Select all checkbox functionality
document.getElementById('select-all')?.addEventListener('change', function(e) {
    const checkboxes = document.querySelectorAll('input[name="artist_ids[]"]');
    checkboxes.forEach(cb => cb.checked = e.target.checked);
});
</script>
@endpush
