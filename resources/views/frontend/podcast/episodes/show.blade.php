@extends('frontend.layouts.music')

@section('title', $episode->title . ' - ' . $podcast->title)

@section('content')
<div class="min-h-screen bg-white dark:bg-black">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Breadcrumb -->
        <nav class="mb-6">
            <ol class="flex items-center space-x-2 text-sm">
                <li><a href="{{ route('podcast.index') }}" class="text-gray-400 hover:text-white">Podcasts</a></li>
                <li><span class="text-gray-600">/</span></li>
                <li><a href="{{ route('podcast.show', $podcast->slug) }}" class="text-gray-400 hover:text-white">{{ $podcast->title }}</a></li>
                <li><span class="text-gray-600">/</span></li>
                <li><span class="text-white">{{ $episode->title }}</span></li>
            </ol>
        </nav>

        <!-- Episode Header -->
        <div class="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden mb-8">
            <div class="p-8">
                <div class="flex items-start space-x-6">
                    <!-- Episode Artwork -->
                    <div class="flex-shrink-0">
                        <img src="{{ $episode->artwork ?? $podcast->cover_image ?? '/images/default-podcast.png' }}" 
                             alt="{{ $episode->title }}"
                             class="w-48 h-48 rounded-lg object-cover shadow-lg">
                    </div>

                    <!-- Episode Info -->
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center space-x-2 mb-3">
                            @if($episode->explicit_content)
                            <span class="px-2 py-1 bg-red-900 text-red-300 text-xs rounded">EXPLICIT</span>
                            @endif
                            @if($episode->is_premium)
                            <span class="px-2 py-1 bg-yellow-900 text-yellow-300 text-xs rounded">PREMIUM</span>
                            @endif
                            @if($episode->season_number)
                            <span class="text-gray-400 text-sm">Season {{ $episode->season_number }}</span>
                            @endif
                            @if($episode->episode_number)
                            <span class="text-gray-400 text-sm">• Episode {{ $episode->episode_number }}</span>
                            @endif
                        </div>

                        <h1 class="text-3xl font-bold text-white mb-3">{{ $episode->title }}</h1>

                        <a href="{{ route('podcast.show', $podcast->slug) }}" 
                           class="text-green-500 hover:text-green-400 mb-4 inline-block">
                            {{ $podcast->title }}
                        </a>

                        <div class="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                            <span>
                                <span class="material-icons-round text-xs align-middle">schedule</span>
                                {{ $episode->duration ?? '0:00' }}
                            </span>
                            <span>
                                <span class="material-icons-round text-xs align-middle">calendar_today</span>
                                {{ $episode->published_at?->format('M d, Y') ?? 'Draft' }}
                            </span>
                            <span>
                                <span class="material-icons-round text-xs align-middle">play_circle</span>
                                {{ $episode->play_count ?? 0 }} plays
                            </span>
                        </div>

                        <!-- Player Controls -->
                        @if($canAccess ?? true)
                        <div class="flex items-center space-x-3">
                            <button class="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-500 transition-colors inline-flex items-center">
                                <span class="material-icons-round mr-2">play_arrow</span>
                                Play Episode
                            </button>
                            <button class="p-3 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors">
                                <span class="material-icons-round">download</span>
                            </button>
                            <button class="p-3 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors">
                                <span class="material-icons-round">share</span>
                            </button>
                            @can('update', $episode)
                            <a href="{{ route('podcast.episode.edit', [$podcast->slug, $episode->slug]) }}" 
                               class="p-3 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors">
                                <span class="material-icons-round">edit</span>
                            </a>
                            @endcan
                        </div>
                        @else
                        <div class="p-4 bg-yellow-900 border border-yellow-700 rounded-lg">
                            <p class="text-yellow-300 text-sm">
                                <span class="material-icons-round text-sm align-middle">lock</span>
                                This is a premium episode. Subscribe to access.
                            </p>
                        </div>
                        @endif
                    </div>
                </div>
            </div>
        </div>

        <!-- Episode Description -->
        <div class="bg-gray-800 rounded-lg border border-gray-700 p-8 mb-8">
            <h2 class="text-xl font-bold text-white mb-4">About This Episode</h2>
            <div class="text-gray-300 leading-relaxed prose prose-invert max-w-none">
                {!! nl2br(e($episode->description)) !!}
            </div>
        </div>

        <!-- Navigation -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            @if($previousEpisode ?? false)
            <a href="{{ route('podcast.episode.show', [$podcast->slug, $previousEpisode->slug]) }}" 
               class="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-green-500 transition-colors">
                <p class="text-gray-400 text-sm mb-2">
                    <span class="material-icons-round text-xs align-middle">navigate_before</span>
                    Previous Episode
                </p>
                <p class="text-white font-semibold line-clamp-1">{{ $previousEpisode->title }}</p>
            </a>
            @else
            <div></div>
            @endif

            @if($nextEpisode ?? false)
            <a href="{{ route('podcast.episode.show', [$podcast->slug, $nextEpisode->slug]) }}" 
               class="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-green-500 transition-colors text-right">
                <p class="text-gray-400 text-sm mb-2">
                    Next Episode
                    <span class="material-icons-round text-xs align-middle">navigate_next</span>
                </p>
                <p class="text-white font-semibold line-clamp-1">{{ $nextEpisode->title }}</p>
            </a>
            @endif
        </div>

        <!-- More Episodes -->
        <div class="bg-gray-800 rounded-lg border border-gray-700 p-8">
            <h2 class="text-xl font-bold text-white mb-6">More from {{ $podcast->title }}</h2>
            <div class="space-y-4">
                @forelse($moreEpisodes ?? [] as $moreEpisode)
                <a href="{{ route('podcast.episode.show', [$podcast->slug, $moreEpisode->slug]) }}" 
                   class="flex items-center space-x-4 p-4 bg-gray-900 rounded-lg hover:bg-gray-700 transition-colors">
                    <img src="{{ $moreEpisode->artwork ?? $podcast->cover_image ?? '/images/default-podcast.png' }}" 
                         alt="{{ $moreEpisode->title }}"
                         class="w-16 h-16 rounded object-cover">
                    <div class="flex-1 min-w-0">
                        <h3 class="text-white font-semibold mb-1 line-clamp-1">{{ $moreEpisode->title }}</h3>
                        <p class="text-gray-400 text-sm">
                            {{ $moreEpisode->duration ?? '0:00' }} • 
                            {{ $moreEpisode->published_at?->format('M d, Y') }}
                        </p>
                    </div>
                    <button class="p-2 bg-green-600 text-white rounded-full hover:bg-green-500 transition-colors">
                        <span class="material-icons-round text-sm">play_arrow</span>
                    </button>
                </a>
                @empty
                <p class="text-gray-400 text-center py-4">No more episodes available</p>
                @endforelse
            </div>
        </div>
    </div>
</div>
@endsection
