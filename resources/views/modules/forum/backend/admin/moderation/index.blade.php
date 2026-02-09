@extends('layouts.admin')

@section('title', 'Forum Moderation')

@section('page-header')
<div class="flex items-center justify-between">
    <div>
        <h2 class="text-2xl font-bold text-slate-800 dark:text-navy-50">
            Forum Moderation Queue
        </h2>
        <p class="text-xs+ text-slate-400 dark:text-navy-300">
            Review and moderate pending forum topics and replies
        </p>
    </div>
    <div class="flex space-x-2">
        <a href="{{ route('admin.modules.forum.dashboard') }}" 
           class="btn bg-slate-150 font-medium text-slate-800 hover:bg-slate-200 focus:bg-slate-200 active:bg-slate-200/80 dark:bg-navy-500 dark:text-navy-50 dark:hover:bg-navy-450 dark:focus:bg-navy-450 dark:active:bg-navy-450/90">
            <svg class="size-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
        </a>
    </div>
</div>
@endsection

@section('content')
<div class="grid grid-cols-1 gap-4 sm:gap-5 lg:gap-6">
    <!-- Filter Tabs -->
    <div class="card">
        <div class="tabs flex flex-col">
            <div class="is-scrollbar-hidden overflow-x-auto">
                <div class="border-b-2 border-slate-150 dark:border-navy-500">
                    <div class="tabs-list flex">
                        <a href="?status=pending" class="btn h-14 shrink-0 space-x-2 rounded-none border-b-2 px-4 {{ request('status', 'pending') === 'pending' ? 'border-primary text-primary dark:border-accent dark:text-accent' : 'border-transparent hover:text-slate-800 focus:text-slate-800 dark:hover:text-navy-100 dark:focus:text-navy-100' }}">
                            <span>Pending</span>
                            @if(isset($stats['pending_topics']) && $stats['pending_topics'] > 0)
                            <span class="badge rounded-full bg-warning/10 px-2 py-1 text-xs text-warning">
                                {{ $stats['pending_topics'] }}
                            </span>
                            @endif
                        </a>
                        <a href="?status=approved" class="btn h-14 shrink-0 space-x-2 rounded-none border-b-2 px-4 {{ request('status') === 'approved' ? 'border-primary text-primary dark:border-accent dark:text-accent' : 'border-transparent hover:text-slate-800 focus:text-slate-800 dark:hover:text-navy-100 dark:focus:text-navy-100' }}">
                            <span>Approved</span>
                        </a>
                        <a href="?status=rejected" class="btn h-14 shrink-0 space-x-2 rounded-none border-b-2 px-4 {{ request('status') === 'rejected' ? 'border-primary text-primary dark:border-accent dark:text-accent' : 'border-transparent hover:text-slate-800 focus:text-slate-800 dark:hover:text-navy-100 dark:focus:text-navy-100' }}">
                            <span>Rejected</span>
                        </a>
                        <a href="?status=flagged" class="btn h-14 shrink-0 space-x-2 rounded-none border-b-2 px-4 {{ request('status') === 'flagged' ? 'border-primary text-primary dark:border-accent dark:text-accent' : 'border-transparent hover:text-slate-800 focus:text-slate-800 dark:hover:text-navy-100 dark:focus:text-navy-100' }}">
                            <span>Flagged</span>
                            @if(isset($stats['flagged_topics']) && $stats['flagged_topics'] > 0)
                            <span class="badge rounded-full bg-error/10 px-2 py-1 text-xs text-error">
                                {{ $stats['flagged_topics'] }}
                            </span>
                            @endif
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Topics List -->
    <div class="card">
        <div class="space-y-4 p-4 sm:p-5">
            @forelse($topics as $topic)
            <div class="flex items-start space-x-4 rounded-lg border border-slate-150 p-4 dark:border-navy-600">
                <!-- User Avatar -->
                <div class="avatar size-12 shrink-0">
                    @if($topic->user->profile_image)
                    <img src="{{ $topic->user->profile_image }}" alt="{{ $topic->user->name }}" class="rounded-full">
                    @else
                    <div class="is-initial rounded-full bg-info text-xs+ uppercase text-white">
                        {{ substr($topic->user->name, 0, 2) }}
                    </div>
                    @endif
                </div>

                <!-- Content -->
                <div class="flex-1">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <h4 class="text-base font-medium text-slate-700 hover:text-primary dark:text-navy-100 dark:hover:text-accent">
                                <a href="{{ route('forum.topic.show', $topic->slug) }}" target="_blank">
                                    {{ $topic->title }}
                                </a>
                            </h4>
                            <div class="mt-1 flex items-center space-x-2 text-xs text-slate-400 dark:text-navy-300">
                                <span>{{ $topic->category->name ?? 'General' }}</span>
                                <span>•</span>
                                <span>by {{ $topic->user->name }}</span>
                                <span>•</span>
                                <span>{{ $topic->created_at->diffForHumans() }}</span>
                                @if($topic->replies_count > 0)
                                <span>•</span>
                                <span>{{ $topic->replies_count }} replies</span>
                                @endif
                            </div>
                            
                            @if($topic->content)
                            <p class="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-navy-200">
                                {{ strip_tags($topic->content) }}
                            </p>
                            @endif

                            @if(isset($topic->is_flagged) && $topic->is_flagged)
                            <div class="mt-2 flex items-center space-x-1 text-xs text-error">
                                <svg class="size-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clip-rule="evenodd"/>
                                </svg>
                                <span>Flagged by moderators</span>
                            </div>
                            @endif
                        </div>

                        <!-- Status Badge -->
                        @if($topic->status === 'pending')
                        <span class="badge rounded-full bg-warning/10 text-warning">Pending</span>
                        @elseif($topic->status === 'approved')
                        <span class="badge rounded-full bg-success/10 text-success">Approved</span>
                        @elseif($topic->status === 'rejected')
                        <span class="badge rounded-full bg-error/10 text-error">Rejected</span>
                        @elseif($topic->status === 'flagged')
                        <span class="badge rounded-full bg-error/10 text-error">Flagged</span>
                        @endif
                    </div>

                    <!-- Action Buttons -->
                    @if($topic->status === 'pending' || $topic->status === 'flagged')
                    <div class="mt-4 flex space-x-2">
                        <form method="POST" action="{{ route('admin.modules.forum.moderation.approve', $topic->id) }}" class="inline">
                            @csrf
                            <button type="submit" class="btn size-8 rounded-full bg-success/10 p-0 text-success hover:bg-success/20 focus:bg-success/20 active:bg-success/25">
                                <svg class="size-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                </svg>
                            </button>
                        </form>

                        <form method="POST" action="{{ route('admin.modules.forum.moderation.reject', $topic->id) }}" class="inline">
                            @csrf
                            <button type="submit" class="btn size-8 rounded-full bg-error/10 p-0 text-error hover:bg-error/20 focus:bg-error/20 active:bg-error/25">
                                <svg class="size-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </form>

                        <a href="{{ route('forum.topic.show', $topic->slug) }}" target="_blank" class="btn size-8 rounded-full bg-slate-150 p-0 text-slate-800 hover:bg-slate-200 focus:bg-slate-200 active:bg-slate-200/80 dark:bg-navy-500 dark:text-navy-50 dark:hover:bg-navy-450 dark:focus:bg-navy-450 dark:active:bg-navy-450/90">
                            <svg class="size-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                            </svg>
                        </a>
                    </div>
                    @endif
                </div>
            </div>
            @empty
            <div class="py-12 text-center">
                <svg class="mx-auto size-16 text-slate-300 dark:text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                </svg>
                <p class="mt-4 text-slate-400 dark:text-navy-300">
                    No topics found for this filter
                </p>
            </div>
            @endforelse
        </div>

        <!-- Pagination -->
        @if($topics->hasPages())
        <div class="border-t border-slate-150 p-4 dark:border-navy-600">
            {{ $topics->links() }}
        </div>
        @endif
    </div>
</div>
@endsection
