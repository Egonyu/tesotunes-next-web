@extends('layouts.app')

@section('title', $poll->question . ' - Poll')

@section('content')
<div class="min-h-screen">
    {{-- Header --}}
    <div class="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 dark:from-blue-900 dark:via-blue-900 dark:to-indigo-900">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {{-- Breadcrumb --}}
            <nav class="mb-4 flex items-center gap-2 text-sm">
                <a href="{{ route('polls.index') }}" class="text-white/70 hover:text-white transition flex items-center gap-1">
                    <span class="material-symbols-outlined text-lg">poll</span>
                    Polls
                </a>
                <span class="material-symbols-outlined text-white/50 text-lg">chevron_right</span>
                <span class="text-white font-medium truncate max-w-[200px]">{{ $poll->question }}</span>
            </nav>

            <div class="flex items-center gap-2 mb-3">
                <span class="inline-flex items-center gap-1 px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-full">
                    <span class="material-symbols-outlined text-sm">poll</span>
                    Poll
                </span>
                @if($poll->allow_multiple_choices)
                    <span class="inline-flex items-center px-2 py-1 bg-white/10 text-white/80 text-xs font-medium rounded-full">
                        Multiple choices
                    </span>
                @endif
                @if($poll->anonymous_voting)
                    <span class="inline-flex items-center px-2 py-1 bg-purple-500/20 text-purple-200 text-xs font-medium rounded-full">
                        Anonymous
                    </span>
                @endif
            </div>

            <h1 class="text-xl md:text-2xl font-bold text-white">{{ $poll->question }}</h1>
            
            <div class="flex flex-wrap items-center gap-3 mt-3 text-sm text-blue-100">
                <span class="flex items-center gap-1">
                    Created by
                    <a href="{{ route('frontend.profile.user', $poll->user) }}" class="font-semibold text-white hover:underline">
                        {{ $poll->user->name }}
                    </a>
                </span>
                <span>•</span>
                <span>{{ $poll->created_at->diffForHumans() }}</span>
                @if($poll->ends_at)
                    <span>•</span>
                    <span class="{{ $poll->status === 'active' ? 'text-green-300' : 'text-red-300' }}">
                        {{ $poll->status === 'active' ? 'Ends ' . $poll->ends_at->diffForHumans() : 'Ended' }}
                    </span>
                @endif
            </div>
        </div>
    </div>

    {{-- Main Content --}}
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-white dark:bg-[#161B22] rounded-2xl border border-gray-200 dark:border-[#30363D] overflow-hidden shadow-sm">
            {{-- Poll Description & Image --}}
            @if($poll->description || $poll->image_path)
                <div class="p-4 sm:p-6 border-b border-gray-200 dark:border-[#30363D]">
                    @if($poll->description)
                        <p class="text-gray-600 dark:text-gray-400 mb-4">{{ $poll->description }}</p>
                    @endif
                    @if($poll->image_path)
                        <img src="{{ $poll->image_url }}"
                             alt="Poll image"
                             class="rounded-xl max-w-full h-auto max-h-64 mx-auto shadow-lg">
                    @endif
                </div>
            @endif

            {{-- Stats Bar --}}
            <div class="p-4 bg-gray-50 dark:bg-[#0D1117] border-b border-gray-200 dark:border-[#30363D]">
                <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span class="flex items-center gap-1">
                        <span class="material-symbols-outlined text-lg">how_to_vote</span>
                        {{ $totalVotes }} {{ Str::plural('vote', $totalVotes) }}
                    </span>
                </div>
            </div>

            {{-- Poll Options --}}
            <div class="p-4 sm:p-6">
                @if($poll->status === 'active' && !$hasVoted && auth()->check())
                    {{-- Voting Form --}}
                    <form action="{{ route('polls.vote', $poll->id) }}" method="POST" class="space-y-3">
                        @csrf
                        @foreach($poll->options as $option)
                            @php $isComparison = $option->isComparison(); @endphp

                            @if($isComparison)
                                {{-- Comparison Option --}}
                                <label class="block p-4 bg-gray-50 dark:bg-[#0D1117] hover:bg-gray-100 dark:hover:bg-[#21262D] rounded-xl border-2 border-gray-200 dark:border-[#30363D] hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition">
                                    <div class="flex gap-4">
                                        <div class="flex-shrink-0 flex items-center">
                                            <input type="{{ $poll->allow_multiple_choices ? 'checkbox' : 'radio' }}"
                                                   name="{{ $poll->allow_multiple_choices ? 'options[]' : 'option' }}"
                                                   value="{{ $option->id }}"
                                                   class="w-5 h-5 text-blue-600 focus:ring-blue-500 {{ $poll->allow_multiple_choices ? 'rounded' : 'rounded-full' }}">
                                        </div>

                                        @if($option->image_url)
                                            <img src="{{ $option->image_url }}"
                                                 alt="{{ $option->display_name }}"
                                                 class="w-16 h-16 rounded-lg object-cover">
                                        @endif

                                        <div class="flex-1 min-w-0">
                                            <h4 class="font-semibold text-gray-900 dark:text-white">{{ $option->display_name }}</h4>
                                            @if($option->subtitle)
                                                <p class="text-sm text-gray-500 dark:text-gray-400">{{ $option->subtitle }}</p>
                                            @endif
                                            @if($option->description)
                                                <p class="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-2">{{ $option->description }}</p>
                                            @endif
                                            <div class="flex flex-wrap gap-2 mt-2">
                                                @if($option->location)
                                                    <span class="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-200 dark:bg-[#21262D] rounded">{{ $option->location }}</span>
                                                @endif
                                                @if($option->formatted_price)
                                                    <span class="text-xs text-green-600 dark:text-green-400 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded">{{ $option->formatted_price }}</span>
                                                @endif
                                            </div>
                                        </div>
                                    </div>
                                </label>
                            @else
                                {{-- Simple Option --}}
                                <label class="block p-4 bg-gray-50 dark:bg-[#0D1117] hover:bg-gray-100 dark:hover:bg-[#21262D] rounded-xl border-2 border-gray-200 dark:border-[#30363D] hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition">
                                    <div class="flex items-center">
                                        <input type="{{ $poll->allow_multiple_choices ? 'checkbox' : 'radio' }}"
                                               name="{{ $poll->allow_multiple_choices ? 'options[]' : 'option' }}"
                                               value="{{ $option->id }}"
                                               class="w-5 h-5 text-blue-600 focus:ring-blue-500 {{ $poll->allow_multiple_choices ? 'rounded' : 'rounded-full' }}">
                                        <span class="ml-3 font-medium text-gray-900 dark:text-white">{{ $option->option_text }}</span>
                                    </div>
                                </label>
                            @endif
                        @endforeach

                        <button type="submit"
                                class="w-full mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-lg">
                            <span class="material-symbols-outlined text-lg mr-2 align-middle">how_to_vote</span>
                            Submit Vote
                        </button>
                    </form>
                @else
                    {{-- Results View --}}
                    <div class="space-y-4">
                        @foreach($poll->options as $option)
                            @php
                                $percentage = $totalVotes > 0 ? round(($option->votes_count / $totalVotes) * 100, 1) : 0;
                                $isTopChoice = $option->votes_count === $poll->options->max('votes_count') && $option->votes_count > 0;
                                $isComparison = $option->isComparison();
                            @endphp

                            @if($isComparison)
                                {{-- Comparison Result --}}
                                <div class="relative bg-gray-50 dark:bg-[#0D1117] rounded-xl p-4 border {{ $isTopChoice ? 'border-green-400 dark:border-green-500' : 'border-gray-200 dark:border-[#30363D]' }}">
                                    <div class="flex flex-col lg:flex-row gap-4">
                                        @if($option->image_url)
                                            <div class="flex-shrink-0">
                                                <img src="{{ $option->image_url }}"
                                                     alt="{{ $option->display_name }}"
                                                     class="w-20 h-20 lg:w-24 lg:h-24 rounded-lg object-cover">
                                            </div>
                                        @endif

                                        <div class="flex-1 min-w-0">
                                            <div class="flex items-start justify-between mb-2">
                                                <div>
                                                    <h4 class="text-lg font-semibold text-gray-900 dark:text-white">{{ $option->display_name }}</h4>
                                                    @if($option->subtitle)
                                                        <p class="text-sm text-gray-500 dark:text-gray-400">{{ $option->subtitle }}</p>
                                                    @endif
                                                </div>
                                                <div class="text-right">
                                                    <span class="text-sm text-gray-500 dark:text-gray-400">{{ $option->votes_count }} votes</span>
                                                    <span class="block text-xl font-bold {{ $isTopChoice ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300' }}">
                                                        {{ $percentage }}%
                                                    </span>
                                                </div>
                                            </div>

                                            @if($option->description)
                                                <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">{{ $option->description }}</p>
                                            @endif

                                            <div class="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div class="absolute h-full rounded-full transition-all duration-500 {{ $isTopChoice ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500' }}"
                                                     style="width: {{ $percentage }}%"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            @else
                                {{-- Simple Result --}}
                                <div class="relative">
                                    <div class="flex items-center justify-between mb-2">
                                        <span class="font-medium text-gray-900 dark:text-white">{{ $option->option_text }}</span>
                                        <div class="flex items-center gap-2">
                                            <span class="text-sm text-gray-500 dark:text-gray-400">{{ $option->votes_count }} votes</span>
                                            <span class="text-lg font-bold {{ $isTopChoice ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300' }}">
                                                {{ $percentage }}%
                                            </span>
                                        </div>
                                    </div>
                                    <div class="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div class="absolute h-full rounded-full transition-all duration-500 {{ $isTopChoice ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500' }}"
                                             style="width: {{ $percentage }}%"></div>
                                    </div>
                                </div>
                            @endif
                        @endforeach
                    </div>

                    @if($poll->status === 'active' && !auth()->check())
                        <div class="mt-6 p-4 bg-gray-50 dark:bg-[#0D1117] rounded-xl text-center border border-gray-200 dark:border-[#30363D]">
                            <p class="text-gray-500 dark:text-gray-400 mb-3">Login to vote in this poll</p>
                            <a href="{{ route('login') }}" 
                               class="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition">
                                <span class="material-symbols-outlined">login</span>
                                Login to Vote
                            </a>
                        </div>
                    @endif

                    @if($hasVoted)
                        <div class="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                            <div class="flex items-center gap-2 text-green-700 dark:text-green-400">
                                <span class="material-symbols-outlined">check_circle</span>
                                <span class="font-medium">You've already voted in this poll</span>
                            </div>
                        </div>
                    @endif

                    @if($poll->status === 'closed')
                        <div class="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                            <div class="flex items-center gap-2 text-red-700 dark:text-red-400">
                                <span class="material-symbols-outlined">lock</span>
                                <span class="font-medium">This poll has ended</span>
                            </div>
                        </div>
                    @endif
                @endif
            </div>

            {{-- Poll Footer --}}
            <div class="p-4 sm:p-6 border-t border-gray-200 dark:border-[#30363D] bg-gray-50 dark:bg-[#0D1117] flex flex-wrap items-center justify-between gap-3">
                <a href="{{ route('polls.index') }}" class="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center gap-1">
                    <span class="material-symbols-outlined">arrow_back</span>
                    Back to Polls
                </a>
                <div class="flex items-center gap-2">
                    <button onclick="navigator.share({title: '{{ $poll->question }}', url: window.location.href})" 
                            class="inline-flex items-center justify-center w-10 h-10 bg-gray-200 dark:bg-[#21262D] hover:bg-gray-300 dark:hover:bg-[#30363D] text-gray-600 dark:text-gray-400 rounded-full transition">
                        <span class="material-symbols-outlined">share</span>
                    </button>
                    @can('update', $poll)
                        <a href="{{ route('polls.edit', $poll->id) }}" 
                           class="inline-flex items-center justify-center w-10 h-10 bg-gray-200 dark:bg-[#21262D] hover:bg-gray-300 dark:hover:bg-[#30363D] text-gray-600 dark:text-gray-400 rounded-full transition">
                            <span class="material-symbols-outlined">edit</span>
                        </a>
                    @endcan
                </div>
            </div>
        </div>

        {{-- Related Topic --}}
        @if($poll->pollable_type === 'App\Models\Modules\Forum\ForumTopic' && $poll->pollable)
            <div class="mt-6 bg-white dark:bg-[#161B22] rounded-2xl border border-gray-200 dark:border-[#30363D] p-5 shadow-sm">
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Related Discussion</h3>
                <a href="{{ route('forum.topic.show', $poll->pollable->slug) }}" 
                   class="block p-4 bg-gray-50 dark:bg-[#0D1117] hover:bg-gray-100 dark:hover:bg-[#21262D] rounded-xl transition border border-gray-200 dark:border-[#30363D]">
                    <h4 class="font-semibold text-gray-900 dark:text-white mb-1">{{ $poll->pollable->title }}</h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        {{ $poll->pollable->replies_count ?? 0 }} replies • {{ number_format($poll->pollable->views_count ?? 0) }} views
                    </p>
                </a>
            </div>
        @endif
    </div>
</div>
@endsection
