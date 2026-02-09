@extends('layouts.app')

@section('title', 'Community Forum')

@section('content')
<div class="min-h-screen">
    {{-- Hero Header --}}
    <div class="bg-gradient-to-br from-brand-green via-emerald-600 to-teal-600 dark:from-emerald-900 dark:via-teal-900 dark:to-cyan-900">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 class="text-3xl md:text-4xl font-bold text-white">Community Forum</h1>
                    <p class="text-emerald-100 mt-2">Connect, discuss, and share with the TesoTunes community</p>
                </div>
                
                <div class="flex flex-wrap items-center gap-3">
                    @auth
                        <a href="{{ route('forum.topic.create') }}" 
                           class="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-700 font-semibold rounded-full hover:bg-emerald-50 transition shadow-lg">
                            <span class="material-symbols-outlined text-xl">add</span>
                            New Topic
                        </a>
                        <a href="{{ route('polls.create') }}" 
                           class="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 text-white font-semibold rounded-full hover:bg-white/30 transition border border-white/30">
                            <span class="material-symbols-outlined text-xl">poll</span>
                            Create Poll
                        </a>
                    @else
                        <a href="{{ route('login') }}" 
                           class="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-700 font-semibold rounded-full hover:bg-emerald-50 transition shadow-lg">
                            <span class="material-symbols-outlined text-xl">login</span>
                            Login to Post
                        </a>
                    @endauth
                </div>
            </div>
            
            {{-- Stats --}}
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div class="text-2xl font-bold text-white">{{ number_format($stats['total_topics'] ?? 0) }}</div>
                    <div class="text-sm text-emerald-100">Discussions</div>
                </div>
                <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div class="text-2xl font-bold text-white">{{ number_format($stats['total_replies'] ?? 0) }}</div>
                    <div class="text-sm text-emerald-100">Replies</div>
                </div>
                <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div class="text-2xl font-bold text-white">{{ number_format($stats['active_polls'] ?? 0) }}</div>
                    <div class="text-sm text-emerald-100">Active Polls</div>
                </div>
                <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div class="text-2xl font-bold text-white">{{ number_format($stats['total_members'] ?? 0) }}</div>
                    <div class="text-sm text-emerald-100">Members</div>
                </div>
            </div>
        </div>
    </div>

    {{-- Main Content --}}
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {{-- Categories & Topics (Main Column) --}}
            <div class="lg:col-span-2 space-y-8">
                {{-- Categories --}}
                <section>
                    <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span class="material-symbols-outlined text-brand-green">category</span>
                        Forum Categories
                    </h2>
                    
                    <div class="grid gap-4">
                        @forelse($categories as $category)
                            <a href="{{ route('forum.category', $category->slug) }}" 
                               class="group block bg-white dark:bg-[#161B22] rounded-2xl border border-gray-200 dark:border-[#30363D] p-5 hover:border-brand-green dark:hover:border-brand-green hover:shadow-lg transition-all">
                                <div class="flex items-start gap-4">
                                    {{-- Icon --}}
                                    <div class="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                                         style="background-color: {{ $category->color ?? '#10B981' }}15; color: {{ $category->color ?? '#10B981' }}">
                                        @if($category->icon)
                                            <span class="material-symbols-outlined text-2xl">{{ $category->icon }}</span>
                                        @else
                                            <span class="material-symbols-outlined text-2xl">forum</span>
                                        @endif
                                    </div>
                                    
                                    {{-- Info --}}
                                    <div class="flex-1 min-w-0">
                                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-brand-green transition">
                                            {{ $category->name }}
                                        </h3>
                                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                            {{ $category->description ?? 'Discuss topics related to ' . $category->name }}
                                        </p>
                                        
                                        <div class="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                                            <span class="flex items-center gap-1">
                                                <span class="material-symbols-outlined text-sm">chat</span>
                                                {{ number_format($category->topics_count ?? 0) }} topics
                                            </span>
                                            <span class="flex items-center gap-1">
                                                <span class="material-symbols-outlined text-sm">reply</span>
                                                {{ number_format($category->replies_count ?? 0) }} replies
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {{-- Arrow --}}
                                    <span class="material-symbols-outlined text-gray-400 group-hover:text-brand-green group-hover:translate-x-1 transition-all">
                                        chevron_right
                                    </span>
                                </div>
                            </a>
                        @empty
                            <div class="bg-white dark:bg-[#161B22] rounded-2xl border border-gray-200 dark:border-[#30363D] p-12 text-center">
                                <span class="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-4">forum</span>
                                <p class="text-gray-500 dark:text-gray-400">No categories available yet.</p>
                            </div>
                        @endforelse
                    </div>
                </section>

                {{-- Recent Discussions --}}
                @if(isset($recentTopics) && $recentTopics->count() > 0)
                <section>
                    <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span class="material-symbols-outlined text-brand-green">schedule</span>
                        Recent Discussions
                    </h2>
                    
                    <div class="bg-white dark:bg-[#161B22] rounded-2xl border border-gray-200 dark:border-[#30363D] divide-y divide-gray-200 dark:divide-[#30363D]">
                        @foreach($recentTopics as $topic)
                            <a href="{{ route('forum.topic.show', $topic->slug) }}" 
                               class="block p-4 hover:bg-gray-50 dark:hover:bg-[#21262D] transition first:rounded-t-2xl last:rounded-b-2xl">
                                <div class="flex items-start gap-3">
                                    <img src="{{ $topic->user->avatar_url ?? asset('images/default-avatar.svg') }}" 
                                         alt="{{ $topic->user->name ?? 'User' }}"
                                         class="w-10 h-10 rounded-full object-cover flex-shrink-0">
                                    <div class="flex-1 min-w-0">
                                        <h4 class="font-semibold text-gray-900 dark:text-white truncate">{{ $topic->title }}</h4>
                                        <div class="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            <span>{{ $topic->user->name ?? 'Anonymous' }}</span>
                                            <span>•</span>
                                            <span>{{ $topic->created_at->diffForHumans() }}</span>
                                            <span>•</span>
                                            <span class="flex items-center gap-1">
                                                <span class="material-symbols-outlined text-xs">chat_bubble</span>
                                                {{ $topic->replies_count ?? 0 }}
                                            </span>
                                        </div>
                                    </div>
                                    @if($topic->is_pinned)
                                        <span class="material-symbols-outlined text-amber-500 text-lg">push_pin</span>
                                    @endif
                                </div>
                            </a>
                        @endforeach
                    </div>
                </section>
                @endif
            </div>

            {{-- Sidebar --}}
            <div class="space-y-6">
                {{-- Active Polls --}}
                @if(isset($activePolls) && $activePolls->count() > 0)
                <div class="bg-white dark:bg-[#161B22] rounded-2xl border border-gray-200 dark:border-[#30363D] overflow-hidden">
                    <div class="p-4 border-b border-gray-200 dark:border-[#30363D] bg-gray-50 dark:bg-[#0D1117]">
                        <h3 class="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <span class="material-symbols-outlined text-blue-500">poll</span>
                            Active Polls
                        </h3>
                    </div>
                    <div class="p-4 space-y-3">
                        @foreach($activePolls->take(3) as $poll)
                            <a href="{{ route('polls.show', $poll->id) }}" 
                               class="block p-3 bg-gray-50 dark:bg-[#0D1117] hover:bg-gray-100 dark:hover:bg-[#21262D] rounded-xl transition">
                                <p class="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">{{ $poll->question }}</p>
                                <div class="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    <span>{{ $poll->votes_count ?? 0 }} votes</span>
                                    <span>{{ $poll->ends_at ? $poll->ends_at->diffForHumans() : 'Open' }}</span>
                                </div>
                            </a>
                        @endforeach
                    </div>
                    <div class="p-4 border-t border-gray-200 dark:border-[#30363D]">
                        <a href="{{ route('polls.index') }}" class="text-sm text-brand-green hover:underline flex items-center gap-1">
                            View all polls
                            <span class="material-symbols-outlined text-sm">arrow_forward</span>
                        </a>
                    </div>
                </div>
                @endif

                {{-- Community Guidelines --}}
                <div class="bg-white dark:bg-[#161B22] rounded-2xl border border-gray-200 dark:border-[#30363D] overflow-hidden">
                    <div class="p-4 border-b border-gray-200 dark:border-[#30363D] bg-gray-50 dark:bg-[#0D1117]">
                        <h3 class="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <span class="material-symbols-outlined text-amber-500">gavel</span>
                            Community Guidelines
                        </h3>
                    </div>
                    <div class="p-4 space-y-3 text-sm">
                        <div class="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                            <span class="material-symbols-outlined text-green-500 text-lg flex-shrink-0">check_circle</span>
                            <span>Be respectful and courteous to all members</span>
                        </div>
                        <div class="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                            <span class="material-symbols-outlined text-green-500 text-lg flex-shrink-0">check_circle</span>
                            <span>Stay on topic in discussions</span>
                        </div>
                        <div class="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                            <span class="material-symbols-outlined text-green-500 text-lg flex-shrink-0">check_circle</span>
                            <span>No spam or excessive self-promotion</span>
                        </div>
                        <div class="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                            <span class="material-symbols-outlined text-green-500 text-lg flex-shrink-0">check_circle</span>
                            <span>Search before creating new topics</span>
                        </div>
                    </div>
                </div>

                {{-- Quick Links --}}
                <div class="bg-white dark:bg-[#161B22] rounded-2xl border border-gray-200 dark:border-[#30363D] overflow-hidden">
                    <div class="p-4 border-b border-gray-200 dark:border-[#30363D] bg-gray-50 dark:bg-[#0D1117]">
                        <h3 class="font-semibold text-gray-900 dark:text-white">Quick Links</h3>
                    </div>
                    <div class="p-2">
                        <a href="{{ route('polls.index') }}" class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#0D1117] transition text-gray-700 dark:text-gray-300">
                            <span class="material-symbols-outlined text-blue-500">poll</span>
                            <span>All Polls</span>
                        </a>
                        @auth
                        <a href="{{ route('forum.topic.create') }}" class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#0D1117] transition text-gray-700 dark:text-gray-300">
                            <span class="material-symbols-outlined text-brand-green">add_circle</span>
                            <span>New Discussion</span>
                        </a>
                        @endauth
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
