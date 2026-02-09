@extends('layouts.admin')

@section('title', 'Nomination Details')

@section('content')
<div class="dashboard-content">
    <!-- Page Header -->
    <div class="mb-8">
        <div class="flex items-center gap-4 mb-4">
            <a href="{{ route('admin.awards.nominations.index') }}" class="btn btn-sm bg-slate-100 text-slate-700 hover:bg-slate-200">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Nominations
            </a>
        </div>
        
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
                <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">Nomination Details</h1>
                <p class="text-slate-600 dark:text-navy-300 mt-1">
                    {{ $nomination->category_name }} - {{ $nomination->season_name }} ({{ $nomination->year }})
                </p>
            </div>
            <div class="flex gap-2">
                @if($nomination->status === 'pending')
                <form action="{{ route('admin.awards.nominations.approve', $nomination->id) }}" method="POST" class="inline">
                    @csrf
                    <button type="submit" class="btn bg-green-600 text-white hover:bg-green-700">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Approve
                    </button>
                </form>
                <button type="button" 
                        onclick="document.getElementById('rejectModal').style.display='block'"
                        class="btn bg-red-600 text-white hover:bg-red-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Reject
                </button>
                @endif
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
            <!-- Nomination Information -->
            <div class="admin-card">
                <h2 class="text-xl font-bold text-slate-800 dark:text-navy-50 mb-4">Nomination Information</h2>
                
                <div class="space-y-4">
                    <!-- Nominee Details -->
                    <div class="flex items-start gap-4 pb-4 border-b border-slate-200 dark:border-navy-600">
                        @if($nomination->nominee_avatar)
                        <img src="{{ Storage::url($nomination->nominee_avatar) }}" 
                             alt="{{ $nomination->nominee_name ?? $nomination->nominee_user_name }}" 
                             class="size-16 rounded-lg object-cover">
                        @else
                        <div class="size-16 bg-primary/10 rounded-lg flex items-center justify-center">
                            <span class="text-2xl font-bold text-primary">
                                {{ substr($nomination->nominee_name ?? $nomination->nominee_user_name ?? 'N', 0, 1) }}
                            </span>
                        </div>
                        @endif
                        <div class="flex-1">
                            <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50">
                                {{ $nomination->nominee_name ?? $nomination->nominee_user_name ?? 'Unknown' }}
                            </h3>
                            @php
                                $typeDisplay = $nomination->nominee_type;
                                if (str_contains($typeDisplay, '\\')) {
                                    $typeDisplay = class_basename($typeDisplay);
                                }
                                $typeMap = [
                                    'User' => 'Artist',
                                    'Song' => 'Song',
                                    'Album' => 'Album',
                                    'track' => 'Song',
                                    'artist' => 'Artist',
                                ];
                                $typeDisplay = $typeMap[$typeDisplay] ?? ucfirst($typeDisplay);
                            @endphp
                            <p class="text-sm text-slate-500">Type: <span class="font-medium">{{ $typeDisplay }}</span></p>
                            
                            @if(isset($nomination->song_title))
                            <p class="text-sm text-slate-600 dark:text-navy-300 mt-1">
                                <strong>Song:</strong> {{ $nomination->song_title }}
                            </p>
                            @endif
                            
                            @if(isset($nomination->album_title))
                            <p class="text-sm text-slate-600 dark:text-navy-300 mt-1">
                                <strong>Album:</strong> {{ $nomination->album_title }}
                            </p>
                            @endif
                        </div>
                    </div>

                    <!-- Category Info -->
                    <div>
                        <h4 class="text-sm font-semibold text-slate-700 dark:text-navy-300 mb-2">Award Category</h4>
                        <p class="text-slate-800 dark:text-navy-50">{{ $nomination->category_name }}</p>
                        <p class="text-sm text-slate-500">{{ $nomination->season_name }} ({{ $nomination->year }})</p>
                    </div>

                    <!-- Nomination Reason -->
                    @if($nomination->reason)
                    <div>
                        <h4 class="text-sm font-semibold text-slate-700 dark:text-navy-300 mb-2">Nomination Reason</h4>
                        <div class="bg-slate-50 dark:bg-navy-800 rounded-lg p-4">
                            <p class="text-slate-700 dark:text-navy-200">{{ $nomination->reason }}</p>
                        </div>
                    </div>
                    @endif

                    <!-- Nominated By -->
                    <div>
                        <h4 class="text-sm font-semibold text-slate-700 dark:text-navy-300 mb-2">Nominated By</h4>
                        <p class="text-slate-800 dark:text-navy-50">{{ $nomination->nominator_name ?? 'Unknown' }}</p>
                        <p class="text-sm text-slate-500">{{ \Carbon\Carbon::parse($nomination->created_at)->format('M d, Y \a\t g:i A') }}</p>
                    </div>
                </div>
            </div>

            <!-- Voting History -->
            <div class="admin-card">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-xl font-bold text-slate-800 dark:text-navy-50">Voting History</h2>
                    <span class="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                        {{ $nomination->vote_count }} Votes
                    </span>
                </div>

                @if($votes->count() > 0)
                <div class="space-y-3">
                    @foreach($votes as $vote)
                    <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-navy-800 rounded-lg">
                        <div class="flex items-center gap-3">
                            <div class="size-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <span class="text-xs font-semibold text-primary">
                                    {{ substr($vote->voter_name ?? 'U', 0, 1) }}
                                </span>
                            </div>
                            <div>
                                <p class="font-medium text-slate-800 dark:text-navy-50">{{ $vote->voter_name ?? 'Anonymous' }}</p>
                                <p class="text-xs text-slate-500">{{ \Carbon\Carbon::parse($vote->voted_at)->diffForHumans() }}</p>
                            </div>
                        </div>
                        @if($vote->is_jury_vote)
                        <span class="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded text-xs font-medium">
                            Jury Vote
                        </span>
                        @endif
                    </div>
                    @endforeach
                </div>

                @if($votes->hasPages())
                <div class="mt-4">
                    {{ $votes->links() }}
                </div>
                @endif
                @else
                <div class="text-center py-8">
                    <div class="size-12 bg-slate-100 dark:bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <p class="text-slate-500">No votes yet</p>
                </div>
                @endif
            </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
            <!-- Status Card -->
            <div class="admin-card">
                <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Status</h3>
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-slate-600 dark:text-navy-300">Current Status</span>
                        <span class="px-3 py-1 text-xs font-medium rounded-full {{ 
                            $nomination->status === 'approved' ? 'bg-green-100 text-green-800' : 
                            ($nomination->status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800')
                        }}">
                            {{ ucfirst($nomination->status) }}
                        </span>
                    </div>
                    
                    @if($nomination->is_finalist)
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-slate-600 dark:text-navy-300">Finalist</span>
                        <span class="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                            Yes
                        </span>
                    </div>
                    @endif

                    <div class="pt-3 border-t border-slate-200 dark:border-navy-600">
                        <div class="text-sm text-slate-600 dark:text-navy-300 mb-1">Vote Count</div>
                        <div class="text-2xl font-bold text-slate-800 dark:text-navy-50">{{ $nomination->vote_count }}</div>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="admin-card">
                <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Quick Actions</h3>
                <div class="space-y-2">
                    <a href="{{ route('admin.awards.categories.show', $nomination->award_category_id) }}" 
                       class="btn w-full bg-slate-100 text-slate-700 hover:bg-slate-200 justify-start">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                        View Category
                    </a>

                    @if($nomination->status === 'pending')
                    <form action="{{ route('admin.awards.nominations.approve', $nomination->id) }}" method="POST">
                        @csrf
                        <button type="submit" class="btn w-full bg-green-100 text-green-700 hover:bg-green-200 justify-start">
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Approve Nomination
                        </button>
                    </form>

                    <button type="button" 
                            onclick="document.getElementById('rejectModal').style.display='block'"
                            class="btn w-full bg-red-100 text-red-700 hover:bg-red-200 justify-start">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Reject Nomination
                    </button>
                    @endif

                    @if($nomination->status === 'approved')
                    <form action="{{ route('admin.awards.nominations.toggle-finalist', $nomination->id) }}" method="POST">
                        @csrf
                        <button type="submit" class="btn w-full bg-purple-100 text-purple-700 hover:bg-purple-200 justify-start">
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            {{ $nomination->is_finalist ? 'Remove from Finalists' : 'Mark as Finalist' }}
                        </button>
                    </form>
                    @endif
                </div>
            </div>

            <!-- Timeline -->
            <div class="admin-card">
                <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Timeline</h3>
                <div class="space-y-4">
                    <div class="flex gap-3">
                        <div class="flex flex-col items-center">
                            <div class="size-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <div class="w-0.5 h-full bg-slate-200 dark:bg-navy-600"></div>
                        </div>
                        <div class="flex-1 pb-4">
                            <p class="font-medium text-slate-800 dark:text-navy-50">Nominated</p>
                            <p class="text-xs text-slate-500">{{ \Carbon\Carbon::parse($nomination->created_at)->format('M d, Y g:i A') }}</p>
                        </div>
                    </div>

                    @if($nomination->status !== 'pending')
                    <div class="flex gap-3">
                        <div class="flex flex-col items-center">
                            <div class="size-8 {{ $nomination->status === 'approved' ? 'bg-green-100' : 'bg-red-100' }} rounded-full flex items-center justify-center">
                                @if($nomination->status === 'approved')
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                </svg>
                                @else
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                @endif
                            </div>
                        </div>
                        <div class="flex-1">
                            <p class="font-medium text-slate-800 dark:text-navy-50">{{ ucfirst($nomination->status) }}</p>
                            <p class="text-xs text-slate-500">{{ \Carbon\Carbon::parse($nomination->updated_at)->format('M d, Y g:i A') }}</p>
                        </div>
                    </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Reject Modal -->
<div id="rejectModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 hidden" onclick="if(event.target === this) this.style.display='none'">
    <div class="bg-white dark:bg-navy-700 rounded-lg shadow-xl max-w-md w-full mx-4" onclick="event.stopPropagation()">
        <form action="{{ route('admin.awards.nominations.reject', $nomination->id) }}" method="POST">
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
                        onclick="document.getElementById('rejectModal').style.display='none'"
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
@endsection
