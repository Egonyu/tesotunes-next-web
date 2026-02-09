@extends('layouts.admin')

@section('title', 'Podcast Details - ' . $podcast->title)

@section('content')
<div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
            <a href="{{ route('admin.podcasts.index') }}" 
               class="btn size-10 rounded-full p-0 hover:bg-slate-300/20 focus:bg-slate-300/20 active:bg-slate-300/25 dark:hover:bg-navy-300/20 dark:focus:bg-navy-300/20 dark:active:bg-navy-300/25">
                <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
            </a>
            <div>
                <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">{{ $podcast->title }}</h1>
                <p class="mt-1 text-sm text-slate-500 dark:text-navy-300">Podcast Details & Management</p>
            </div>
        </div>
        
        <div class="flex gap-2">
            @if($podcast->status === 'pending')
                <form action="{{ route('admin.podcasts.approve', $podcast) }}" method="POST" class="inline">
                    @csrf
                    <button type="submit" class="btn bg-success font-medium text-white hover:bg-success-focus focus:bg-success-focus active:bg-success-focus/90">
                        <svg class="size-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        Approve
                    </button>
                </form>
                
                <button onclick="document.getElementById('rejectModal').classList.remove('hidden')" 
                        class="btn bg-error font-medium text-white hover:bg-error-focus focus:bg-error-focus active:bg-error-focus/90">
                    <svg class="size-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    Reject
                </button>
            @endif
            
            @if($podcast->status === 'published')
                <button onclick="document.getElementById('suspendModal').classList.remove('hidden')" 
                        class="btn bg-warning font-medium text-white hover:bg-warning-focus focus:bg-warning-focus active:bg-warning-focus/90">
                    <svg class="size-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Suspend
                </button>
            @endif
            
            @if($podcast->status === 'suspended')
                <form action="{{ route('admin.podcasts.restore', $podcast) }}" method="POST" class="inline">
                    @csrf
                    <button type="submit" class="btn bg-info font-medium text-white hover:bg-info-focus focus:bg-info-focus active:bg-info-focus/90">
                        <svg class="size-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                        </svg>
                        Restore
                    </button>
                </form>
            @endif
            
            <form action="{{ route('admin.podcasts.destroy', $podcast) }}" method="POST" class="inline" 
                  onsubmit="return confirm('Are you sure you want to delete this podcast? This action cannot be undone.')">
                @csrf
                @method('DELETE')
                <button type="submit" class="btn bg-error font-medium text-white hover:bg-error-focus focus:bg-error-focus active:bg-error-focus/90">
                    <svg class="size-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                    Delete
                </button>
            </form>
        </div>
    </div>

    <!-- Alerts -->
    @if(session('success'))
        <div class="alert flex rounded-lg border border-success px-4 py-4 text-success sm:px-5" role="alert">
            <svg class="size-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <div>{{ session('success') }}</div>
        </div>
    @endif

    <!-- Status Banner -->
    <div class="card p-4">
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
                <div class="flex size-12 items-center justify-center rounded-full 
                    @if($podcast->status === 'published') bg-success/10
                    @elseif($podcast->status === 'pending') bg-warning/10
                    @elseif($podcast->status === 'suspended') bg-error/10
                    @else bg-slate-150 dark:bg-navy-500
                    @endif">
                    <svg class="size-6 
                        @if($podcast->status === 'published') text-success
                        @elseif($podcast->status === 'pending') text-warning
                        @elseif($podcast->status === 'suspended') text-error
                        @else text-slate-500
                        @endif" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
                    </svg>
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-slate-700 dark:text-navy-100">Status: 
                        <span class="badge 
                            @if($podcast->status === 'published') bg-success/10 text-success
                            @elseif($podcast->status === 'pending') bg-warning/10 text-warning
                            @elseif($podcast->status === 'suspended') bg-error/10 text-error
                            @elseif($podcast->status === 'draft') bg-info/10 text-info
                            @else bg-slate-150 text-slate-800 dark:bg-navy-500 dark:text-navy-100
                            @endif">
                            {{ ucfirst($podcast->status) }}
                        </span>
                    </h3>
                    <p class="text-sm text-slate-500 dark:text-navy-300">
                        Created {{ $podcast->created_at->diffForHumans() }}
                        @if($podcast->published_at)
                            • Published {{ $podcast->published_at->diffForHumans() }}
                        @endif
                    </p>
                </div>
            </div>
            
            @if($podcast->is_explicit)
                <span class="badge bg-error/10 text-error">
                    <svg class="size-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                    Explicit Content
                </span>
            @endif
        </div>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
            <!-- Podcast Details -->
            <div class="card p-6">
                <h2 class="text-xl font-semibold text-slate-800 dark:text-navy-50 mb-4">Podcast Information</h2>
                
                <div class="flex gap-6">
                    @if($podcast->artwork)
                        <img src="{{ asset('storage/' . $podcast->artwork) }}" 
                             alt="{{ $podcast->title }}" 
                             class="size-32 rounded-lg object-cover">
                    @else
                        <div class="flex size-32 items-center justify-center rounded-lg bg-slate-150 dark:bg-navy-600">
                            <svg class="size-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
                            </svg>
                        </div>
                    @endif
                    
                    <div class="flex-1 space-y-4">
                        <div>
                            <label class="text-xs+ font-medium text-slate-400">Title</label>
                            <p class="text-slate-700 dark:text-navy-100">{{ $podcast->title }}</p>
                        </div>
                        
                        <div>
                            <label class="text-xs+ font-medium text-slate-400">Description</label>
                            <p class="text-sm text-slate-600 dark:text-navy-200">{{ $podcast->description ?? 'No description provided' }}</p>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="text-xs+ font-medium text-slate-400">Category</label>
                                <p class="text-slate-700 dark:text-navy-100">{{ $podcast->category->name ?? 'Uncategorized' }}</p>
                            </div>
                            
                            <div>
                                <label class="text-xs+ font-medium text-slate-400">Language</label>
                                <p class="text-slate-700 dark:text-navy-100">{{ strtoupper($podcast->language ?? 'en') }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Episodes -->
            <div class="card p-6">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-xl font-semibold text-slate-800 dark:text-navy-50">Recent Episodes</h2>
                    <span class="badge bg-slate-150 text-slate-800 dark:bg-navy-500 dark:text-navy-100">
                        {{ $podcast->episodes_count ?? $podcast->episodes->count() }} Total
                    </span>
                </div>

                @if($podcast->episodes && $podcast->episodes->count() > 0)
                    <div class="space-y-3">
                        @foreach($podcast->episodes as $episode)
                            <div class="rounded-lg border border-slate-200 p-4 dark:border-navy-500">
                                <div class="flex items-start justify-between">
                                    <div class="flex-1">
                                        <h4 class="font-medium text-slate-700 dark:text-navy-100">{{ $episode->title }}</h4>
                                        <p class="mt-1 text-xs text-slate-500 dark:text-navy-300">
                                            Episode {{ $episode->episode_number }}
                                            @if($episode->season_number)
                                                • Season {{ $episode->season_number }}
                                            @endif
                                            • {{ $episode->duration ? gmdate('H:i:s', $episode->duration) : 'Duration not set' }}
                                        </p>
                                        @if($episode->description)
                                            <p class="mt-2 text-sm text-slate-600 dark:text-navy-200 line-clamp-2">
                                                {{ $episode->description }}
                                            </p>
                                        @endif
                                    </div>
                                    <span class="badge 
                                        @if($episode->status === 'published') bg-success/10 text-success
                                        @elseif($episode->status === 'scheduled') bg-info/10 text-info
                                        @else bg-slate-150 text-slate-800 dark:bg-navy-500 dark:text-navy-100
                                        @endif ml-3">
                                        {{ ucfirst($episode->status) }}
                                    </span>
                                </div>
                            </div>
                        @endforeach
                    </div>
                @else
                    <div class="py-12 text-center">
                        <svg class="mx-auto size-16 text-slate-300 dark:text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        <p class="mt-3 text-slate-500 dark:text-navy-300">No episodes yet</p>
                    </div>
                @endif
            </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
            <!-- Creator Info -->
            <div class="card p-6">
                <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Creator</h3>
                <div class="flex items-center gap-3">
                    <img src="{{ $podcast->user->avatar_url ?? 'https://ui-avatars.com/api/?name=' . urlencode($podcast->user->name) }}" 
                         alt="{{ $podcast->user->name }}" 
                         class="size-12 rounded-full">
                    <div>
                        <p class="font-medium text-slate-700 dark:text-navy-100">{{ $podcast->user->name }}</p>
                        <p class="text-xs text-slate-500 dark:text-navy-300">{{ $podcast->user->email }}</p>
                    </div>
                </div>
                <div class="mt-4">
                    <a href="{{ route('admin.users.show', $podcast->user->id) }}" 
                       class="btn w-full bg-slate-150 font-medium text-slate-800 hover:bg-slate-200 dark:bg-navy-500 dark:text-navy-50 dark:hover:bg-navy-450">
                        View Profile
                    </a>
                </div>
            </div>

            <!-- Stats -->
            <div class="card p-6">
                <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Statistics</h3>
                <div class="space-y-4">
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-slate-500 dark:text-navy-300">Episodes</span>
                        <span class="font-semibold text-slate-700 dark:text-navy-100">{{ $podcast->total_episodes ?? $podcast->episodes->count() }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-slate-500 dark:text-navy-300">Subscribers</span>
                        <span class="font-semibold text-slate-700 dark:text-navy-100">{{ number_format($podcast->subscriber_count ?? 0) }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-slate-500 dark:text-navy-300">Total Listens</span>
                        <span class="font-semibold text-slate-700 dark:text-navy-100">{{ number_format($podcast->total_listen_count ?? 0) }}</span>
                    </div>
                </div>
            </div>

            <!-- RSS Feed -->
            @if($podcast->rss_feed_url)
            <div class="card p-6">
                <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">RSS Feed</h3>
                <div class="rounded-lg bg-slate-100 p-3 dark:bg-navy-600">
                    <code class="text-xs text-slate-600 dark:text-navy-200 break-all">{{ $podcast->rss_feed_url }}</code>
                </div>
                <a href="{{ $podcast->rss_feed_url }}" target="_blank" 
                   class="btn mt-3 w-full bg-slate-150 font-medium text-slate-800 hover:bg-slate-200 dark:bg-navy-500 dark:text-navy-50 dark:hover:bg-navy-450">
                    View RSS Feed
                </a>
            </div>
            @endif

            <!-- Additional Info -->
            <div class="card p-6">
                <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Details</h3>
                <div class="space-y-3 text-sm">
                    <div class="flex justify-between">
                        <span class="text-slate-500 dark:text-navy-300">ID</span>
                        <span class="text-slate-700 dark:text-navy-100">{{ $podcast->id }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-500 dark:text-navy-300">Slug</span>
                        <span class="text-slate-700 dark:text-navy-100">{{ $podcast->slug }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-500 dark:text-navy-300">Created</span>
                        <span class="text-slate-700 dark:text-navy-100">{{ $podcast->created_at->format('M j, Y') }}</span>
                    </div>
                    @if($podcast->published_at)
                    <div class="flex justify-between">
                        <span class="text-slate-500 dark:text-navy-300">Published</span>
                        <span class="text-slate-700 dark:text-navy-100">{{ $podcast->published_at->format('M j, Y') }}</span>
                    </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Reject Modal -->
<div id="rejectModal" class="fixed inset-0 z-50 hidden bg-slate-900/60 transition-all duration-300" x-data="{ show: false }">
    <div class="flex h-full items-center justify-center p-4">
        <div class="w-full max-w-md rounded-lg bg-white p-6 dark:bg-navy-700">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Reject Podcast</h3>
            <form action="{{ route('admin.podcasts.reject', $podcast) }}" method="POST">
                @csrf
                <div class="mb-4">
                    <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">Rejection Reason</label>
                    <textarea name="reason" rows="4" required 
                              class="form-textarea w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent"
                              placeholder="Please provide a reason for rejecting this podcast..."></textarea>
                </div>
                <div class="flex justify-end gap-2">
                    <button type="button" onclick="document.getElementById('rejectModal').classList.add('hidden')" 
                            class="btn bg-slate-150 font-medium text-slate-800 hover:bg-slate-200 dark:bg-navy-500 dark:text-navy-50 dark:hover:bg-navy-450">
                        Cancel
                    </button>
                    <button type="submit" class="btn bg-error font-medium text-white hover:bg-error-focus">
                        Reject Podcast
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Suspend Modal -->
<div id="suspendModal" class="fixed inset-0 z-50 hidden bg-slate-900/60 transition-all duration-300" x-data="{ show: false }">
    <div class="flex h-full items-center justify-center p-4">
        <div class="w-full max-w-md rounded-lg bg-white p-6 dark:bg-navy-700">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Suspend Podcast</h3>
            <form action="{{ route('admin.podcasts.suspend', $podcast) }}" method="POST">
                @csrf
                <div class="mb-4">
                    <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">Suspension Reason</label>
                    <textarea name="reason" rows="4" required 
                              class="form-textarea w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent"
                              placeholder="Please provide a reason for suspending this podcast..."></textarea>
                </div>
                <div class="flex justify-end gap-2">
                    <button type="button" onclick="document.getElementById('suspendModal').classList.add('hidden')" 
                            class="btn bg-slate-150 font-medium text-slate-800 hover:bg-slate-200 dark:bg-navy-500 dark:text-navy-50 dark:hover:bg-navy-450">
                        Cancel
                    </button>
                    <button type="submit" class="btn bg-warning font-medium text-white hover:bg-warning-focus">
                        Suspend Podcast
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
