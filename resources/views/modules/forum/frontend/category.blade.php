@extends('layouts.app')

@section('title', $category->name . ' - Forum')

@section('content')
<div class="min-h-screen">
    {{-- Category Header --}}
    <div class="bg-gradient-to-br from-brand-green via-emerald-600 to-teal-600 dark:from-emerald-900 dark:via-teal-900 dark:to-cyan-900"
         style="--category-color: {{ $category->color ?? '#10B981' }};">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {{-- Breadcrumb --}}
            <nav class="mb-6 flex items-center gap-2 text-sm">
                <a href="{{ route('forum.index') }}" class="text-white/70 hover:text-white transition flex items-center gap-1">
                    <span class="material-symbols-outlined text-lg">forum</span>
                    Forum
                </a>
                <span class="material-symbols-outlined text-white/50 text-lg">chevron_right</span>
                <span class="text-white font-medium">{{ $category->name }}</span>
            </nav>

            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div class="flex items-center gap-4">
                    {{-- Category Icon --}}
                    <div class="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl flex-shrink-0">
                        @if($category->icon)
                            <span class="material-symbols-outlined text-white text-3xl">{{ $category->icon }}</span>
                        @else
                            <span class="material-symbols-outlined text-white text-3xl">folder</span>
                        @endif
                    </div>
                    
                    <div>
                        <h1 class="text-2xl md:text-3xl font-bold text-white">{{ $category->name }}</h1>
                        <p class="text-emerald-100 mt-1">{{ $category->description }}</p>
                        <div class="flex items-center gap-4 mt-3 text-sm text-emerald-100">
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
                </div>

                <div class="flex items-center gap-3">
                    @auth
                        <a href="{{ route('forum.topic.create', ['category_id' => $category->id]) }}" 
                           class="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-700 font-semibold rounded-full hover:bg-emerald-50 transition shadow-lg">
                            <span class="material-symbols-outlined text-xl">add</span>
                            New Topic
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
        </div>
    </div>

    {{-- Main Content --}}
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        @if($topics->count() > 0)
            {{-- Topics List --}}
            <div class="bg-white dark:bg-[#161B22] rounded-2xl border border-gray-200 dark:border-[#30363D] overflow-hidden shadow-sm">
                <div class="p-4 sm:p-6 border-b border-gray-200 dark:border-[#30363D] bg-gray-50 dark:bg-[#0D1117]">
                    <div class="flex items-center justify-between">
                        <h2 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span class="material-symbols-outlined text-brand-green">forum</span>
                            Topics
                        </h2>
                        <span class="text-sm text-gray-500 dark:text-gray-400">
                            {{ $topics->total() }} {{ Str::plural('topic', $topics->total()) }}
                        </span>
                    </div>
                </div>

                <div class="divide-y divide-gray-200 dark:divide-[#30363D]">
                    @foreach($topics as $topic)
                        <a href="{{ route('forum.topic.show', $topic->slug) }}" 
                           class="block p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-[#21262D] transition group">
                            <div class="flex items-start gap-4">
                                {{-- Author Avatar --}}
                                <img src="{{ $topic->user->avatar_url ?? asset('images/default-avatar.svg') }}"
                                     alt="{{ $topic->user->name ?? 'User' }}"
                                     class="w-12 h-12 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-100 dark:ring-[#30363D]">

                                <div class="flex-1 min-w-0">
                                    {{-- Title & Badges --}}
                                    <div class="flex flex-wrap items-start gap-2 mb-2">
                                        <h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white group-hover:text-brand-green transition line-clamp-2">
                                            {{ $topic->title }}
                                        </h3>
                                        
                                        <div class="flex items-center gap-1.5 flex-shrink-0">
                                            @if($topic->is_pinned)
                                                <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full">
                                                    <span class="material-symbols-outlined text-xs">push_pin</span>
                                                    Pinned
                                                </span>
                                            @endif
                                            @if($topic->is_locked)
                                                <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded-full">
                                                    <span class="material-symbols-outlined text-xs">lock</span>
                                                    Locked
                                                </span>
                                            @endif
                                            @if($topic->is_featured)
                                                <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-medium rounded-full">
                                                    <span class="material-symbols-outlined text-xs">star</span>
                                                    Featured
                                                </span>
                                            @endif
                                        </div>
                                    </div>

                                    {{-- Meta Info --}}
                                    <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                                        <span class="flex items-center gap-1">
                                            <span class="font-medium text-gray-700 dark:text-gray-300">{{ $topic->user->name ?? 'Anonymous' }}</span>
                                        </span>
                                        <span class="flex items-center gap-1">
                                            <span class="material-symbols-outlined text-sm">schedule</span>
                                            {{ $topic->created_at->diffForHumans() }}
                                        </span>
                                        <span class="flex items-center gap-1">
                                            <span class="material-symbols-outlined text-sm">chat_bubble</span>
                                            {{ $topic->replies_count ?? 0 }} {{ Str::plural('reply', $topic->replies_count ?? 0) }}
                                        </span>
                                        <span class="flex items-center gap-1">
                                            <span class="material-symbols-outlined text-sm">visibility</span>
                                            {{ number_format($topic->views_count ?? 0) }} views
                                        </span>
                                        @if(($topic->likes_count ?? 0) > 0)
                                            <span class="flex items-center gap-1 text-red-500">
                                                <span class="material-symbols-outlined text-sm">favorite</span>
                                                {{ $topic->likes_count }}
                                            </span>
                                        @endif
                                    </div>
                                </div>

                                {{-- Chevron --}}
                                <span class="material-symbols-outlined text-gray-400 dark:text-gray-600 group-hover:text-brand-green group-hover:translate-x-1 transition-all flex-shrink-0">
                                    chevron_right
                                </span>
                            </div>
                        </a>
                    @endforeach
                </div>

                {{-- Pagination --}}
                @if($topics->hasPages())
                    <div class="p-4 sm:p-6 border-t border-gray-200 dark:border-[#30363D] bg-gray-50 dark:bg-[#0D1117]">
                        {{ $topics->links() }}
                    </div>
                @endif
            </div>
        @else
            {{-- Empty State --}}
            <div class="bg-white dark:bg-[#161B22] rounded-2xl border border-gray-200 dark:border-[#30363D] p-12 text-center">
                <div class="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center text-4xl"
                     style="background-color: {{ $category->color ?? '#10B981' }}15; color: {{ $category->color ?? '#10B981' }}">
                    @if($category->icon)
                        <span class="material-symbols-outlined text-4xl">{{ $category->icon }}</span>
                    @else
                        <span class="material-symbols-outlined text-4xl">forum</span>
                    @endif
                </div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Topics Yet</h3>
                <p class="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    Be the first to start a discussion in {{ $category->name }}!
                </p>
                @auth
                    <a href="{{ route('forum.topic.create', ['category_id' => $category->id]) }}"
                       class="inline-flex items-center gap-2 px-6 py-3 bg-brand-green hover:bg-emerald-600 text-white font-semibold rounded-full transition shadow-lg">
                        <span class="material-symbols-outlined text-xl">add</span>
                        Start First Topic
                    </a>
                @else
                    <a href="{{ route('login') }}"
                       class="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-[#21262D] hover:bg-gray-300 dark:hover:bg-[#30363D] text-gray-700 dark:text-gray-300 font-semibold rounded-full transition">
                        <span class="material-symbols-outlined text-xl">login</span>
                        Login to Start Discussion
                    </a>
                @endauth
            </div>
        @endif

        {{-- Back to Forum --}}
        <div class="mt-6">
            <a href="{{ route('forum.index') }}" 
               class="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-brand-green dark:hover:text-brand-green transition">
                <span class="material-symbols-outlined">arrow_back</span>
                Back to Forum
            </a>
        </div>
    </div>
</div>
@endsection
