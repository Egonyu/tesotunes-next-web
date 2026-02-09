@extends('layouts.admin')

@section('title', 'Forum Dashboard')

@section('page-header')
<div class="flex items-center justify-between">
    <div>
        <h2 class="text-2xl font-bold text-slate-800 dark:text-navy-50">
            Forum & Polls Dashboard
        </h2>
        <p class="text-xs+ text-slate-400 dark:text-navy-300">
            Community engagement statistics and recent activity
        </p>
    </div>
    <div class="flex space-x-2">
        <a href="{{ route('admin.modules.forum.moderation.index') }}" 
           class="btn bg-primary font-medium text-white hover:bg-primary-focus focus:bg-primary-focus active:bg-primary-focus/90">
            <span class="material-icons-round text-base mr-1">gavel</span>
            Moderation Queue
        </a>
        <a href="{{ route('admin.modules.forum.settings') }}" 
           class="btn bg-slate-150 font-medium text-slate-800 hover:bg-slate-200 focus:bg-slate-200 active:bg-slate-200/80 dark:bg-navy-500 dark:text-navy-50 dark:hover:bg-navy-450 dark:focus:bg-navy-450 dark:active:bg-navy-450/90">
            <span class="material-icons-round text-base mr-1">settings</span>
            Settings
        </a>
    </div>
</div>
@endsection

@section('content')
<!-- Stats Grid -->
<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6 mb-6">
    <!-- Total Topics -->
    <div class="admin-card rounded-lg bg-white p-4 dark:bg-navy-700">
        <div class="flex justify-between space-x-1">
            <p class="text-xl font-semibold text-slate-700 dark:text-navy-100">
                {{ $stats['total_topics'] ?? 0 }}
            </p>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
        </div>
        <p class="mt-1 text-xs+">Total Topics</p>
    </div>

    <!-- Pending Topics -->
    <div class="admin-card rounded-lg bg-white p-4 dark:bg-navy-700">
        <div class="flex justify-between">
            <p class="text-xl font-semibold text-slate-700 dark:text-navy-100">
                {{ $stats['pending_topics'] ?? 0 }}
            </p>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
        <p class="mt-1 text-xs+">Pending Approval</p>
    </div>

    <!-- Total Polls -->
    <div class="admin-card rounded-lg bg-white p-4 dark:bg-navy-700">
        <div class="flex justify-between">
            <p class="text-xl font-semibold text-slate-700 dark:text-navy-100">
                {{ $stats['total_polls'] ?? 0 }}
            </p>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        </div>
        <p class="mt-1 text-xs+">Total Polls</p>
    </div>

    <!-- Total Replies -->
    <div class="admin-card rounded-lg bg-white p-4 dark:bg-navy-700">
        <div class="flex justify-between">
            <p class="text-xl font-semibold text-slate-700 dark:text-navy-100">
                {{ $stats['total_replies'] ?? 0 }}
            </p>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
        </div>
        <p class="mt-1 text-xs+">Total Replies</p>
    </div>
</div>

<div class="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2 lg:gap-6">
    <!-- Recent Topics -->
    <div class="admin-card rounded-lg bg-white p-4 dark:bg-navy-700">
        <div class="flex items-center justify-between">
            <h2 class="font-medium tracking-wide text-slate-700 line-clamp-1 dark:text-navy-100 lg:text-base">
                Recent Topics
            </h2>
            <a href="{{ route('admin.modules.forum.moderation.index') }}" 
               class="border-b border-dotted border-current pb-px font-medium text-primary outline-none transition-colors duration-300 hover:text-primary/70 focus:text-primary/70">
                View All
            </a>
        </div>
        <div class="mt-4 space-y-4">
            @forelse($recentTopics as $topic)
            <div class="flex items-start space-x-3">
                <div class="flex-1">
                    <a href="{{ route('forum.topic.show', $topic->slug) }}" 
                       class="font-medium text-slate-700 hover:text-primary dark:text-navy-100 dark:hover:text-accent-light">
                        {{ $topic->title }}
                    </a>
                    <div class="flex items-center space-x-2 text-xs text-slate-400 dark:text-navy-300 mt-1">
                        <span>{{ $topic->category->name ?? 'General' }}</span>
                        <span>•</span>
                        <span>{{ $topic->user->name ?? 'Unknown' }}</span>
                        <span>•</span>
                        <span>{{ $topic->created_at->diffForHumans() }}</span>
                    </div>
                </div>
                @if($topic->status === 'pending')
                <span class="badge rounded-full bg-warning/10 text-warning">Pending</span>
                @endif
            </div>
            @empty
            <p class="text-center text-slate-400 dark:text-navy-300 py-4">No recent topics</p>
            @endforelse
        </div>
    </div>

    <!-- Recent Polls -->
    <div class="admin-card rounded-lg bg-white p-4 dark:bg-navy-700">
        <div class="flex items-center justify-between">
            <h2 class="font-medium tracking-wide text-slate-700 line-clamp-1 dark:text-navy-100 lg:text-base">
                Recent Polls
            </h2>
            <a href="{{ route('polls.index') }}" 
               class="border-b border-dotted border-current pb-px font-medium text-primary outline-none transition-colors duration-300 hover:text-primary/70 focus:text-primary/70">
                View All
            </a>
        </div>
        <div class="mt-4 space-y-4">
            @forelse($recentPolls as $poll)
            <div class="flex items-start space-x-3">
                <div class="flex-1">
                    <a href="{{ route('polls.show', $poll->id) }}" 
                       class="font-medium text-slate-700 hover:text-primary dark:text-navy-100 dark:hover:text-accent-light">
                        {{ $poll->question }}
                    </a>
                    <div class="flex items-center space-x-2 text-xs text-slate-400 dark:text-navy-300 mt-1">
                        <span>{{ $poll->user->name ?? 'Unknown' }}</span>
                        <span>•</span>
                        <span>{{ $poll->votes_count ?? 0 }} votes</span>
                        <span>•</span>
                        <span>{{ $poll->created_at->diffForHumans() }}</span>
                    </div>
                </div>
                @if($poll->is_active)
                <span class="badge rounded-full bg-success/10 text-success">Active</span>
                @else
                <span class="badge rounded-full bg-slate-150 text-slate-800 dark:bg-navy-500 dark:text-navy-100">Closed</span>
                @endif
            </div>
            @empty
            <p class="text-center text-slate-400 dark:text-navy-300 py-4">No recent polls</p>
            @endforelse
        </div>
    </div>
</div>
@endsection
