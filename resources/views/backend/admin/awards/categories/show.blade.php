@extends('layouts.admin')

@section('title', $category->name)

@section('content')
<div class="dashboard-content">
    <!-- Page Header -->
    <div class="mb-8">
        <div class="flex items-center gap-4 mb-4">
            <a href="{{ route('admin.awards.categories.index') }}" class="btn btn-sm bg-slate-100 text-slate-700 hover:bg-slate-200">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Categories
            </a>
        </div>
        
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">{{ $category->name }}</h1>
                <p class="text-slate-600 dark:text-navy-300">{{ $category->description }}</p>
                <div class="flex items-center gap-4 mt-2">
                    <span class="text-sm text-slate-500">Season: <strong>{{ $category->season_name }} ({{ $category->year }})</strong></span>
                    <span class="text-sm text-slate-500">Type: <strong class="capitalize">{{ $category->nominee_type }}</strong></span>
                </div>
            </div>
            <div class="flex gap-2">
                <a href="{{ route('admin.awards.categories.edit', $category->id) }}" class="btn bg-primary text-white hover:bg-primary-focus">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Category
                </a>
            </div>
        </div>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="admin-card">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-slate-600 dark:text-navy-300">Total Nominations</p>
                    <p class="text-3xl font-bold text-slate-800 dark:text-navy-50 mt-1">{{ $stats['total_nominations'] }}</p>
                </div>
                <div class="p-3 bg-primary/10 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="admin-card">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-slate-600 dark:text-navy-300">Pending Review</p>
                    <p class="text-3xl font-bold text-yellow-600 mt-1">{{ $stats['pending_nominations'] }}</p>
                </div>
                <div class="p-3 bg-yellow-500/10 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="admin-card">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-slate-600 dark:text-navy-300">Approved</p>
                    <p class="text-3xl font-bold text-green-600 mt-1">{{ $stats['approved_nominations'] }}</p>
                </div>
                <div class="p-3 bg-green-500/10 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="admin-card">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-slate-600 dark:text-navy-300">Total Votes</p>
                    <p class="text-3xl font-bold text-purple-600 mt-1">{{ number_format($stats['total_votes']) }}</p>
                </div>
                <div class="p-3 bg-purple-500/10 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                </div>
            </div>
        </div>
    </div>

    <!-- Category Details -->
    <div class="admin-card mb-8">
        <h2 class="text-xl font-bold text-slate-800 dark:text-navy-50 mb-4">Category Settings</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
                <p class="text-sm text-slate-500 dark:text-navy-400">Max Nominations per User</p>
                <p class="text-lg font-semibold text-slate-800 dark:text-navy-50">{{ $category->max_nominations_per_user }}</p>
            </div>
            <div>
                <p class="text-sm text-slate-500 dark:text-navy-400">Max Votes per User</p>
                <p class="text-lg font-semibold text-slate-800 dark:text-navy-50">{{ $category->max_votes_per_user }}</p>
            </div>
            <div>
                <p class="text-sm text-slate-500 dark:text-navy-400">Sort Order</p>
                <p class="text-lg font-semibold text-slate-800 dark:text-navy-50">{{ $category->sort_order }}</p>
            </div>
            <div>
                <p class="text-sm text-slate-500 dark:text-navy-400">Jury Category</p>
                <p class="text-lg font-semibold text-slate-800 dark:text-navy-50">
                    {{ $category->is_jury_category ? 'Yes' : 'No' }}
                </p>
            </div>
            @if($category->is_jury_category)
            <div>
                <p class="text-sm text-slate-500 dark:text-navy-400">Jury Weight</p>
                <p class="text-lg font-semibold text-slate-800 dark:text-navy-50">{{ $category->jury_weight_percentage }}%</p>
            </div>
            @endif
            <div>
                <p class="text-sm text-slate-500 dark:text-navy-400">Status</p>
                <span class="inline-block px-3 py-1 text-sm font-medium rounded-full {{ $category->is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800' }}">
                    {{ $category->is_active ? 'Active' : 'Inactive' }}
                </span>
            </div>
        </div>
    </div>

    <!-- Nominations List -->
    <div class="admin-card">
        <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-slate-800 dark:text-navy-50">Nominations</h2>
            <div class="flex gap-2">
                <select class="form-select text-sm" onchange="window.location.href='?status='+this.value">
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>
        </div>

        @if($nominations->count() > 0)
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead class="bg-slate-50 dark:bg-navy-800 border-b border-slate-200 dark:border-navy-700">
                        <tr>
                            <th class="px-4 py-3 text-xs font-medium text-slate-600 dark:text-navy-300 uppercase">Nominee</th>
                            <th class="px-4 py-3 text-xs font-medium text-slate-600 dark:text-navy-300 uppercase">Type</th>
                            <th class="px-4 py-3 text-xs font-medium text-slate-600 dark:text-navy-300 uppercase">Nominated By</th>
                            <th class="px-4 py-3 text-xs font-medium text-slate-600 dark:text-navy-300 uppercase">Status</th>
                            <th class="px-4 py-3 text-xs font-medium text-slate-600 dark:text-navy-300 uppercase">Date</th>
                            <th class="px-4 py-3 text-xs font-medium text-slate-600 dark:text-navy-300 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-200 dark:divide-navy-700">
                        @foreach($nominations as $nomination)
                        <tr class="hover:bg-slate-50 dark:hover:bg-navy-900">
                            <td class="px-4 py-4">
                                <div class="flex items-center gap-3">
                                    @if($nomination->nominee_avatar)
                                    <img src="{{ Storage::url($nomination->nominee_avatar) }}" alt="{{ $nomination->nominee_name ?? $nomination->nominee_user_name ?? 'Nominee' }}" class="size-10 rounded-full">
                                    @else
                                    <div class="size-10 bg-primary/10 rounded-full flex items-center justify-center">
                                        <span class="text-primary font-semibold">{{ substr($nomination->nominee_name ?? $nomination->nominee_user_name ?? 'N', 0, 1) }}</span>
                                    </div>
                                    @endif
                                    <div>
                                        <p class="font-medium text-slate-800 dark:text-navy-50">
                                            {{ $nomination->nominee_name ?? $nomination->nominee_user_name ?? 'Unknown' }}
                                        </p>
                                        @if(isset($nomination->song_title))
                                        <p class="text-xs text-slate-500">Song: {{ $nomination->song_title }}</p>
                                        @endif
                                        @if(isset($nomination->album_title))
                                        <p class="text-xs text-slate-500">Album: {{ $nomination->album_title }}</p>
                                        @endif
                                    </div>
                                </div>
                            </td>
                            <td class="px-4 py-4">
                                @php
                                    // Convert nominee_type to human-readable format
                                    $typeDisplay = $nomination->nominee_type;
                                    
                                    // Handle full class names
                                    if (str_contains($typeDisplay, '\\')) {
                                        $typeDisplay = class_basename($typeDisplay);
                                    }
                                    
                                    // Normalize common types
                                    $typeMap = [
                                        'User' => 'Artist',
                                        'Song' => 'Song',
                                        'Album' => 'Album',
                                        'track' => 'Song',
                                        'artist' => 'Artist',
                                    ];
                                    
                                    $typeDisplay = $typeMap[$typeDisplay] ?? ucfirst($typeDisplay);
                                @endphp
                                <span class="inline-block px-2 py-1 text-xs font-semibold rounded-full {{ 
                                    strtolower($typeDisplay) === 'artist' ? 'bg-blue-100 text-blue-800' : 
                                    (strtolower($typeDisplay) === 'song' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800')
                                }}">
                                    {{ $typeDisplay }}
                                </span>
                            </td>
                            <td class="px-4 py-4">
                                <span class="text-sm text-slate-600 dark:text-navy-300">{{ $nomination->nominator_name ?? 'Unknown' }}</span>
                            </td>
                            <td class="px-4 py-4">
                                <span class="inline-block px-2 py-1 text-xs font-medium rounded-full {{ 
                                    $nomination->status === 'approved' ? 'bg-green-100 text-green-800' : 
                                    ($nomination->status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800') 
                                }}">
                                    {{ ucfirst($nomination->status) }}
                                </span>
                            </td>
                            <td class="px-4 py-4">
                                <span class="text-sm text-slate-600 dark:text-navy-300">{{ \Carbon\Carbon::parse($nomination->created_at)->format('M j, Y') }}</span>
                            </td>
                            <td class="px-4 py-4">
                                <div class="flex items-center gap-2">
                                    @if($nomination->status === 'pending')
                                    <form action="{{ route('admin.awards.nominations.approve', $nomination->id) }}" method="POST" class="inline">
                                        @csrf
                                        <button type="submit" class="text-green-600 hover:text-green-800" title="Approve">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </button>
                                    </form>
                                    <button onclick="showRejectModal({{ $nomination->id }})" class="text-red-600 hover:text-red-800" title="Reject">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                    @endif
                                    <a href="{{ route('admin.awards.nominations.show', $nomination->id) }}" class="text-primary hover:text-primary-focus" title="View Details">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

            <div class="mt-6">
                {{ $nominations->links() }}
            </div>
        @else
            <div class="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-16 mx-auto text-slate-300 dark:text-navy-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 class="text-xl font-medium text-slate-700 dark:text-navy-300 mb-2">No Nominations Yet</h3>
                <p class="text-slate-500 dark:text-navy-400">Nominations will appear here once users start submitting.</p>
            </div>
        @endif
    </div>
</div>

<!-- Reject Modal -->
<div id="rejectModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 hidden" onclick="if(event.target === this) closeRejectModal()">
    <div class="bg-white dark:bg-navy-700 rounded-lg shadow-xl max-w-md w-full mx-4" onclick="event.stopPropagation()">
        <form id="rejectForm" method="POST">
            @csrf
            <div class="p-6">
                <h3 class="text-xl font-bold text-slate-800 dark:text-navy-50 mb-4">Reject Nomination</h3>
                <p class="text-slate-600 dark:text-navy-300 mb-4">
                    Please provide a reason for rejecting this nomination.
                </p>
                <div>
                    <label for="rejection_reason" class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">
                        Rejection Reason <span class="text-red-500">*</span>
                    </label>
                    <textarea id="rejection_reason"
                              name="rejection_reason"
                              rows="4"
                              class="form-input w-full"
                              placeholder="Explain why this nomination is being rejected..."
                              required></textarea>
                </div>
            </div>
            <div class="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-navy-800 rounded-b-lg">
                <button type="button"
                        onclick="closeRejectModal()"
                        class="btn bg-slate-200 text-slate-700 hover:bg-slate-300">
                    Cancel
                </button>
                <button type="submit"
                        class="btn bg-red-600 text-white hover:bg-red-700">
                    Reject Nomination
                </button>
            </div>
        </form>
    </div>
</div>

<script>
function showRejectModal(nominationId) {
    const modal = document.getElementById('rejectModal');
    const form = document.getElementById('rejectForm');
    form.action = `/admin/awards/nominations/${nominationId}/reject`;
    modal.classList.remove('hidden');
}

function closeRejectModal() {
    const modal = document.getElementById('rejectModal');
    modal.classList.add('hidden');
    document.getElementById('rejection_reason').value = '';
}
</script>
@endsection
