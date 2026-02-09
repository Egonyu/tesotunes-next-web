@extends('layouts.app')

@section('title', 'Community Polls')

@section('content')
<div class="min-h-screen">
    {{-- Header --}}
    <div class="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 dark:from-blue-900 dark:via-blue-900 dark:to-indigo-900">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 class="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                        <span class="material-symbols-outlined text-3xl">poll</span>
                        Community Polls
                    </h1>
                    <p class="text-blue-200 mt-1">Vote on community topics and share your opinions</p>
                </div>

                <div class="flex items-center gap-3">
                    @auth
                        <a href="{{ route('polls.create') }}"
                           class="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 font-semibold rounded-full hover:bg-blue-50 transition shadow-lg">
                            <span class="material-symbols-outlined">add</span>
                            Create Poll
                        </a>
                    @else
                        <a href="{{ route('login') }}"
                           class="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 text-white font-semibold rounded-full hover:bg-white/30 transition">
                            Login to Create
                        </a>
                    @endauth
                    <a href="{{ route('forum.index') }}"
                       class="inline-flex items-center gap-2 px-4 py-2.5 bg-white/20 text-white font-medium rounded-full hover:bg-white/30 transition">
                        <span class="material-symbols-outlined">forum</span>
                        Forum
                    </a>
                </div>
            </div>
        </div>
    </div>

    {{-- Main Content --}}
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        @if($polls->count() > 0)
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                @foreach($polls as $poll)
                    <div class="bg-white dark:bg-[#161B22] rounded-2xl border border-gray-200 dark:border-[#30363D] overflow-hidden hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all group">
                        {{-- Poll Image --}}
                        @if($poll->image_path)
                            <div class="aspect-video overflow-hidden">
                                <img src="{{ $poll->image_url }}"
                                     alt="Poll image"
                                     class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                            </div>
                        @endif

                        <div class="p-5">
                            {{-- Poll Header --}}
                            <div class="flex items-center justify-between mb-3">
                                <span class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full">
                                    <span class="material-symbols-outlined text-xs">poll</span>
                                    Poll
                                </span>
                                <span class="text-xs text-gray-500 dark:text-gray-400">
                                    {{ $poll->created_at->diffForHumans() }}
                                </span>
                            </div>

                            {{-- Poll Question --}}
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                                {{ $poll->question }}
                            </h3>

                            {{-- Poll Description --}}
                            @if($poll->description)
                                <p class="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                                    {{ $poll->description }}
                                </p>
                            @endif

                            {{-- Poll Stats --}}
                            <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                                <span class="flex items-center gap-1">
                                    <span class="material-symbols-outlined text-sm">how_to_vote</span>
                                    {{ $poll->total_votes ?? 0 }} votes
                                </span>
                                @if($poll->ends_at)
                                    <span class="flex items-center gap-1">
                                        <span class="material-symbols-outlined text-sm">schedule</span>
                                        {{ $poll->ends_at->diffForHumans() }}
                                    </span>
                                @endif
                            </div>

                            {{-- Poll Meta --}}
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-1.5">
                                    @if($poll->allow_multiple_choices)
                                        <span class="inline-flex items-center px-2 py-0.5 bg-gray-100 dark:bg-[#21262D] text-gray-600 dark:text-gray-400 text-xs rounded-full">
                                            Multiple
                                        </span>
                                    @endif
                                    @if($poll->is_anonymous)
                                        <span class="inline-flex items-center px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded-full">
                                            Anonymous
                                        </span>
                                    @endif
                                </div>
                                <a href="{{ route('polls.show', $poll) }}"
                                   class="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-full transition">
                                    Vote
                                    <span class="material-symbols-outlined text-sm">arrow_forward</span>
                                </a>
                            </div>
                        </div>
                    </div>
                @endforeach
            </div>

            {{-- Pagination --}}
            @if($polls->hasPages())
                <div class="mt-8">
                    {{ $polls->links() }}
                </div>
            @endif
        @else
            {{-- Empty State --}}
            <div class="bg-white dark:bg-[#161B22] rounded-2xl border border-gray-200 dark:border-[#30363D] p-12 text-center">
                <div class="w-20 h-20 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                    <span class="material-symbols-outlined text-4xl text-blue-500">poll</span>
                </div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Polls Yet</h3>
                <p class="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    Be the first to create a poll and get the community talking!
                </p>
                @auth
                    <a href="{{ route('polls.create') }}"
                       class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition shadow-lg">
                        <span class="material-symbols-outlined">add</span>
                        Create First Poll
                    </a>
                @else
                    <a href="{{ route('login') }}"
                       class="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-[#21262D] hover:bg-gray-300 dark:hover:bg-[#30363D] text-gray-700 dark:text-gray-300 font-semibold rounded-full transition">
                        Login to Create Polls
                    </a>
                @endauth
            </div>
        @endif

        {{-- Back to Forum --}}
        <div class="mt-6">
            <a href="{{ route('forum.index') }}" 
               class="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
                <span class="material-symbols-outlined">arrow_back</span>
                Back to Forum
            </a>
        </div>
    </div>
</div>
@endsection
