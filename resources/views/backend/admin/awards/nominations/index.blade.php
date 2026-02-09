@extends('layouts.admin')

@section('title', 'Award Nominations')

@section('content')
<div class="dashboard-content">
    <!-- Page Header -->
    <div class="mb-8">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">Award Nominations</h1>
                <p class="text-slate-600 dark:text-navy-300">Manage all award nominations and approvals</p>
            </div>

            <div class="flex gap-3">
                <a href="{{ route('admin.awards.index') }}"
                   class="btn border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-navy-500 dark:text-navy-100 dark:hover:bg-navy-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Awards
                </a>
            </div>
        </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div class="admin-card">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-slate-600 dark:text-navy-300">Total Nominations</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50">{{ $nominations->total() }}</p>
                </div>
                <div class="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="admin-card">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-slate-600 dark:text-navy-300">Pending</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50">
                        {{ $nominations->where('status', 'pending')->count() }}
                    </p>
                </div>
                <div class="flex size-12 items-center justify-center rounded-lg bg-warning/10 text-warning">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="admin-card">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-slate-600 dark:text-navy-300">Approved</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50">
                        {{ $nominations->where('status', 'approved')->count() }}
                    </p>
                </div>
                <div class="flex size-12 items-center justify-center rounded-lg bg-success/10 text-success">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="admin-card">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-slate-600 dark:text-navy-300">Rejected</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50">
                        {{ $nominations->where('status', 'rejected')->count() }}
                    </p>
                </div>
                <div class="flex size-12 items-center justify-center rounded-lg bg-error/10 text-error">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
            </div>
        </div>
    </div>

    <!-- Nominations Table -->
    <div class="admin-card">
        <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-slate-800 dark:text-navy-50">All Nominations</h2>
        </div>

        @if($nominations->count() > 0)
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead>
                        <tr class="border-b border-slate-200 dark:border-navy-500">
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Nominee</th>
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Category</th>
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Season</th>
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Nominated By</th>
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Status</th>
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Date</th>
                            <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($nominations as $nomination)
                            <tr class="border-b border-slate-100 dark:border-navy-600">
                                <td class="px-4 py-3">
                                    <div class="font-medium text-slate-800 dark:text-navy-50">
                                        {{ $nomination->nominee_name }}
                                    </div>
                                    @if($nomination->nominee_type)
                                        <div class="text-sm text-slate-500 dark:text-navy-400">
                                            {{ ucfirst($nomination->nominee_type) }}
                                        </div>
                                    @endif
                                </td>
                                <td class="px-4 py-3 text-slate-800 dark:text-navy-50">
                                    {{ $nomination->category_name }}
                                </td>
                                <td class="px-4 py-3 text-slate-800 dark:text-navy-50">
                                    {{ $nomination->season_name }} ({{ $nomination->year }})
                                </td>
                                <td class="px-4 py-3 text-slate-800 dark:text-navy-50">
                                    {{ $nomination->nominated_by_name ?? 'System' }}
                                </td>
                                <td class="px-4 py-3">
                                    <span class="px-2 py-1 text-xs font-medium rounded-full
                                        {{ $nomination->status === 'pending' ? 'bg-warning-light text-warning' :
                                           ($nomination->status === 'approved' ? 'bg-success-light text-success' : 'bg-error-light text-error') }}">
                                        {{ ucfirst($nomination->status) }}
                                    </span>
                                </td>
                                <td class="px-4 py-3 text-slate-800 dark:text-navy-50">
                                    {{ \Carbon\Carbon::parse($nomination->created_at)->format('M j, Y') }}
                                </td>
                                <td class="px-4 py-3">
                                    <div class="flex gap-2">
                                        @if($nomination->status === 'pending')
                                            <form action="{{ route('admin.awards.nominations.approve', $nomination->id) }}" method="POST" class="inline">
                                                @csrf
                                                <button type="submit"
                                                        class="btn size-8 rounded-full p-0 hover:bg-success/20 text-success"
                                                        title="Approve"
                                                        onclick="return confirm('Are you sure you want to approve this nomination?')">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </button>
                                            </form>
                                            <button onclick="showRejectModal({{ $nomination->id }})"
                                                    class="btn size-8 rounded-full p-0 hover:bg-error/20 text-error"
                                                    title="Reject">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        @endif
                                        <a href="{{ route('admin.awards.nominations.show', $nomination->id) }}"
                                           class="btn size-8 rounded-full p-0 hover:bg-primary/20 text-primary"
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
            <div class="mt-6">
                {{ $nominations->links() }}
            </div>
        @else
            <div class="text-center py-12">
                <div class="flex size-16 items-center justify-center rounded-full bg-slate-100 dark:bg-navy-600 mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                </div>
                <h3 class="text-lg font-medium text-slate-800 dark:text-navy-50 mb-2">No Nominations Found</h3>
                <p class="text-slate-600 dark:text-navy-300">There are no award nominations in the system yet.</p>
            </div>
        @endif
    </div>
</div>

<!-- Reject Modal -->
<div id="rejectModal" class="fixed inset-0 z-50 hidden bg-slate-900/50">
    <div class="flex min-h-screen items-center justify-center p-4">
        <div class="w-full max-w-md rounded-lg bg-white p-6 dark:bg-navy-700">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Reject Nomination</h3>
            <form id="rejectForm" method="POST">
                @csrf
                <input type="hidden" id="rejectNominationId">
                <div class="mb-4">
                    <label for="rejection_reason" class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">
                        Reason for rejection <span class="text-red-500">*</span>
                    </label>
                    <textarea id="rejection_reason" name="rejection_reason" rows="3" class="form-input w-full" required
                              placeholder="Please provide a reason for rejecting this nomination..."></textarea>
                </div>
                <div class="flex gap-3">
                    <button type="submit" class="btn bg-error text-white hover:bg-error-focus">
                        Reject Nomination
                    </button>
                    <button type="button" onclick="closeRejectModal()" class="btn border border-slate-300 text-slate-700 hover:bg-slate-50">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
function showRejectModal(nominationId) {
    document.getElementById('rejectNominationId').value = nominationId;
    document.getElementById('rejectForm').action = `/admin/awards/nominations/${nominationId}/reject`;
    document.getElementById('rejectModal').classList.remove('hidden');
}

function closeRejectModal() {
    document.getElementById('rejectModal').classList.add('hidden');
    document.getElementById('rejection_reason').value = '';
}
</script>
@endsection