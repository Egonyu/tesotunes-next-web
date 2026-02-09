@extends('layouts.app')

@section('title', 'Search: ' . $query . ' - Forum')

@section('content')
<div class="min-h-screen">
    {{-- Header --}}
    <div class="bg-gradient-to-br from-brand-green via-emerald-600 to-teal-600 dark:from-emerald-900 dark:via-teal-900 dark:to-cyan-900">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {{-- Breadcrumb --}}
            <nav class="mb-4 flex items-center gap-2 text-sm">
                <a href="{{ route('forum.index') }}" class="text-white/70 hover:text-white transition flex items-center gap-1">
                    <span class="material-symbols-outlined text-lg">forum</span>
                    Forum
                </a>
                <span class="material-symbols-outlined text-white/50 text-lg">chevron_right</span>
                <span class="text-white font-medium">Search Results</span>
            </nav>

            <h1 class="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <span class="material-symbols-outlined text-3xl">search</span>
                Search Results
            </h1>
            <p class="text-emerald-100 mt-2">
                Results for: "<span class="font-semibold">{{ $query }}</span>"
            </p>
        </div>
    </div>

    {{-- Main Content --}}
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {{-- Search Form --}}
        <div class="mb-6">
            <form action="{{ route('forum.search') }}" method="GET" class="flex gap-2">
                <div class="flex-1 relative">
                    <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                    <input type="text" 
                           name="q" 
                           value="{{ $query }}"
                           placeholder="Search forum discussions..."
                           class="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#30363D] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent">
                </div>
                <button type="submit" 
                        class="px-6 py-3 bg-brand-green hover:bg-emerald-600 text-white font-semibold rounded-xl transition">
                    Search
                </button>
            </form>
        </div>

        @if($topics->count() > 0)
            <div class="bg-white dark:bg-[#161B22] rounded-2xl border border-gray-200 dark:border-[#30363D] overflow-hidden shadow-sm">
                <div class="p-4 sm:p-6 border-b border-gray-200 dark:border-[#30363D] bg-gray-50 dark:bg-[#0D1117]">
                    <div class="flex items-center justify-between">
                        <h2 class="text-lg font-bold text-gray-900 dark:text-white">
                            Found {{ $topics->count() }} {{ Str::plural('result', $topics->count()) }}
                        </h2>
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
                                     class="w-10 h-10 rounded-full object-cover flex-shrink-0">

                                <div class="flex-1 min-w-0">
                                    <div class="flex flex-wrap items-start gap-2 mb-1">
                                        <h3 class="text-base font-semibold text-gray-900 dark:text-white group-hover:text-brand-green transition">
                                            {{ $topic->title }}
                                        </h3>
                                        @if($topic->category)
                                            <span class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full"
                                                  style="background-color: {{ $topic->category->color ?? '#10B981' }}15; color: {{ $topic->category->color ?? '#10B981' }}">
                                                {{ $topic->category->name }}
                                            </span>
                                        @endif
                                    </div>

                                    <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                                        {{ Str::limit(strip_tags($topic->content), 150) }}
                                    </p>

                                    <div class="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
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

                                <span class="material-symbols-outlined text-gray-400 group-hover:text-brand-green group-hover:translate-x-1 transition-all flex-shrink-0">
                                    chevron_right
                                </span>
                            </div>
                        </a>
                    @endforeach
                </div>

                @if($topics->hasPages())
                    <div class="p-4 sm:p-6 border-t border-gray-200 dark:border-[#30363D] bg-gray-50 dark:bg-[#0D1117]">
                        {{ $topics->appends(['q' => $query])->links() }}
                    </div>
                @endif
            </div>
        @else
            <div class="bg-white dark:bg-[#161B22] rounded-2xl border border-gray-200 dark:border-[#30363D] p-12 text-center">
                <span class="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-4">search_off</span>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Results Found</h3>
                <p class="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    We couldn't find any discussions matching "<span class="font-medium">{{ $query }}</span>". Try different keywords or browse our categories.
                </p>
                <a href="{{ route('forum.index') }}"
                   class="inline-flex items-center gap-2 px-6 py-3 bg-brand-green hover:bg-emerald-600 text-white font-semibold rounded-full transition shadow-lg">
                    <span class="material-symbols-outlined">forum</span>
                    Browse Forum
                </a>
            </div>
        @endif

        {{-- Back Link --}}
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
