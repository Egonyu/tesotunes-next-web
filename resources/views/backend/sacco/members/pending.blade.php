@extends('layouts.admin')

@section('title', 'Pending Member Applications')

@section('content')
<div class="dashboard-content">
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
            <a href="{{ route('admin.sacco.members.index') }}" 
               class="inline-flex items-center justify-center size-10 bg-slate-200 dark:bg-navy-600 text-slate-700 dark:text-navy-100 rounded-lg hover:bg-slate-300 transition">
                <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
            </a>
            <div>
                <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">Pending Applications</h1>
                <p class="text-slate-600 dark:text-navy-300 mt-1">Review and approve member applications</p>
            </div>
        </div>
        <div class="flex items-center gap-2">
            <span class="px-3 py-1.5 bg-warning/10 text-warning rounded-lg text-sm font-medium">
                {{ $members->total() }} Pending
            </span>
        </div>
    </div>

    <!-- Pending Members List -->
    <div class="space-y-4">
        @forelse($members as $member)
            <div class="card p-5">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center gap-3 mb-3">
                            <div class="size-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                                {{ substr($member->user->display_name ?? $member->user->username, 0, 1) }}
                            </div>
                            <div>
                                <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50">{{ $member->user->display_name ?? $member->user->username }}</h3>
                                <p class="text-sm text-slate-500 dark:text-navy-400">{{ $member->membership_number }}</p>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <p class="text-xs text-slate-500 dark:text-navy-400 mb-1">Email</p>
                                <p class="text-sm font-medium text-slate-800 dark:text-navy-50">{{ $member->user->email }}</p>
                            </div>
                            <div>
                                <p class="text-xs text-slate-500 dark:text-navy-400 mb-1">Phone</p>
                                <p class="text-sm font-medium text-slate-800 dark:text-navy-50">{{ $member->user->phone ?? 'N/A' }}</p>
                            </div>
                            <div>
                                <p class="text-xs text-slate-500 dark:text-navy-400 mb-1">Member Type</p>
                                <span class="inline-block px-2 py-1 text-xs font-medium rounded-full bg-info/10 text-info">
                                    {{ ucfirst($member->member_type) }}
                                </span>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p class="text-xs text-slate-500 dark:text-navy-400 mb-1">Application Date</p>
                                <p class="text-sm font-medium text-slate-800 dark:text-navy-50">{{ $member->created_at->format('M d, Y') }}</p>
                            </div>
                            <div>
                                <p class="text-xs text-slate-500 dark:text-navy-400 mb-1">Credit Score</p>
                                <div class="flex items-center gap-2">
                                    <p class="text-sm font-bold text-slate-800 dark:text-navy-50">{{ $member->credit_score }}</p>
                                    <div class="flex-1 h-2 bg-slate-200 dark:bg-navy-500 rounded-full overflow-hidden">
                                        <div class="h-full bg-gradient-to-r from-blue-500 to-green-500" style="width: {{ ($member->credit_score / 900) * 100 }}%"></div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p class="text-xs text-slate-500 dark:text-navy-400 mb-1">Time Pending</p>
                                <p class="text-sm font-medium text-slate-800 dark:text-navy-50">{{ $member->created_at->diffForHumans() }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="flex flex-col gap-2 ml-4">
                        <a href="{{ route('admin.sacco.members.show', $member) }}" 
                           class="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition">
                            <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Details
                        </a>
                        <form action="{{ route('admin.sacco.members.approve', $member) }}" method="POST">
                            @csrf
                            <button type="submit" 
                                    class="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-success text-white hover:bg-success-dark rounded-lg transition"
                                    onclick="return confirm('Approve this member?')">
                                <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Approve
                            </button>
                        </form>
                        <button onclick="openRejectModal('{{ $member->id }}', '{{ $member->user->display_name ?? $member->user->username }}')" 
                                class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition">
                            <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Reject
                        </button>
                    </div>
                </div>
            </div>
        @empty
            <div class="card p-12 text-center">
                <svg class="size-16 text-slate-400 dark:text-navy-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-2">No Pending Applications</h3>
                <p class="text-slate-500 dark:text-navy-400">All member applications have been reviewed</p>
            </div>
        @endforelse
    </div>

    <!-- Pagination -->
    @if($members->hasPages())
        <div class="mt-6">
            {{ $members->links() }}
        </div>
    @endif
</div>

<!-- Reject Modal -->
<div id="rejectModal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-navy-700 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-bold text-slate-800 dark:text-navy-50 mb-2">Reject Member Application</h3>
        <p id="rejectMemberName" class="text-sm text-slate-600 dark:text-navy-300 mb-4"></p>
        <form id="rejectForm" method="POST">
            @csrf
            <div class="mb-4">
                <label class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">Reason for Rejection</label>
                <textarea name="reason" rows="4" required 
                          class="w-full px-3 py-2 border border-slate-300 dark:border-navy-400 rounded-lg focus:ring-2 focus:ring-primary"
                          placeholder="Provide a detailed reason for rejecting this application..."></textarea>
            </div>
            <div class="flex gap-2">
                <button type="button" onclick="closeRejectModal()" 
                        class="flex-1 px-4 py-2 bg-slate-200 dark:bg-navy-600 rounded-lg hover:bg-slate-300 transition">
                    Cancel
                </button>
                <button type="submit" class="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                    Reject Application
                </button>
            </div>
        </form>
    </div>
</div>

@push('scripts')
<script>
function openRejectModal(memberId, memberName) {
    document.getElementById('rejectModal').classList.remove('hidden');
    document.getElementById('rejectMemberName').textContent = 'Rejecting application for: ' + memberName;
    document.getElementById('rejectForm').action = `/admin/sacco/members/${memberId}/reject`;
}

function closeRejectModal() {
    document.getElementById('rejectModal').classList.add('hidden');
    document.getElementById('rejectForm').reset();
}

// Close modal on Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeRejectModal();
    }
});
</script>
@endpush
@endsection
