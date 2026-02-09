@extends('frontend.layouts.music')

@section('title', 'My Podcasts')

@section('content')
<div class="min-h-screen bg-white dark:bg-black">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="mb-8">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-3xl font-bold text-white mb-2">My Podcasts</h1>
                    <p class="text-gray-400">Manage your podcast library</p>
                </div>
                <a href="{{ route('podcast.create') }}" 
                   class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors inline-flex items-center">
                    <span class="material-icons-round mr-2">add</span>
                    Create Podcast
                </a>
            </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div class="flex items-center">
                    <span class="material-icons-round text-green-500 text-3xl">podcasts</span>
                    <div class="ml-4">
                        <p class="text-sm text-gray-400">Total Podcasts</p>
                        <p class="text-2xl font-bold text-white">{{ $podcasts->total() }}</p>
                    </div>
                </div>
            </div>
            <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div class="flex items-center">
                    <span class="material-icons-round text-blue-500 text-3xl">mic</span>
                    <div class="ml-4">
                        <p class="text-sm text-gray-400">Total Episodes</p>
                        <p class="text-2xl font-bold text-white">{{ $totalEpisodes ?? 0 }}</p>
                    </div>
                </div>
            </div>
            <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div class="flex items-center">
                    <span class="material-icons-round text-purple-500 text-3xl">people</span>
                    <div class="ml-4">
                        <p class="text-sm text-gray-400">Total Subscribers</p>
                        <p class="text-2xl font-bold text-white">{{ $totalSubscribers ?? 0 }}</p>
                    </div>
                </div>
            </div>
            <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div class="flex items-center">
                    <span class="material-icons-round text-orange-500 text-3xl">play_circle</span>
                    <div class="ml-4">
                        <p class="text-sm text-gray-400">Total Plays</p>
                        <p class="text-2xl font-bold text-white">{{ $totalPlays ?? 0 }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Podcasts List -->
        @if($podcasts->count() > 0)
        <div class="space-y-4">
            @foreach($podcasts as $podcast)
            <div class="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-green-500 transition-colors">
                <div class="flex items-start space-x-6">
                    <!-- Cover Image -->
                    <div class="flex-shrink-0">
                        <img src="{{ $podcast->cover_image ?? '/images/default-podcast.png' }}" 
                             alt="{{ $podcast->title }}"
                             class="w-32 h-32 rounded-lg object-cover">
                    </div>

                    <!-- Podcast Info -->
                    <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between mb-3">
                            <div class="flex-1">
                                <a href="{{ route('podcast.show', $podcast->slug) }}">
                                    <h3 class="text-xl font-semibold text-white hover:text-green-500 transition-colors mb-2">
                                        {{ $podcast->title }}
                                    </h3>
                                </a>
                                @if($podcast->category)
                                <span class="inline-flex items-center px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded mr-2">
                                    {{ $podcast->category->name }}
                                </span>
                                @endif
                                @if($podcast->status === 'draft')
                                <span class="inline-flex items-center px-2 py-1 bg-yellow-900 text-yellow-300 text-xs rounded">
                                    Draft
                                </span>
                                @elseif($podcast->status === 'published')
                                <span class="inline-flex items-center px-2 py-1 bg-green-900 text-green-300 text-xs rounded">
                                    Published
                                </span>
                                @endif
                            </div>
                        </div>

                        <p class="text-gray-400 text-sm mb-4 line-clamp-2">
                            {{ $podcast->description }}
                        </p>

                        <!-- Stats -->
                        <div class="flex items-center space-x-6 text-sm text-gray-400 mb-4">
                            <span>
                                <span class="material-icons-round text-xs align-middle">mic</span>
                                {{ $podcast->episodes_count }} episodes
                            </span>
                            <span>
                                <span class="material-icons-round text-xs align-middle">people</span>
                                {{ $podcast->subscribers_count ?? 0 }} subscribers
                            </span>
                            <span>
                                <span class="material-icons-round text-xs align-middle">play_circle</span>
                                {{ $podcast->total_plays ?? 0 }} plays
                            </span>
                            <span class="text-xs">
                                Updated {{ $podcast->updated_at->diffForHumans() }}
                            </span>
                        </div>

                        <!-- Actions -->
                        <div class="flex items-center space-x-3">
                            <a href="{{ route('podcast.show', $podcast->slug) }}" 
                               class="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-500 transition-colors inline-flex items-center">
                                <span class="material-icons-round text-sm mr-1">visibility</span>
                                View
                            </a>
                            <a href="{{ route('podcast.edit', $podcast->slug) }}" 
                               class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500 transition-colors inline-flex items-center">
                                <span class="material-icons-round text-sm mr-1">edit</span>
                                Edit
                            </a>
                            <a href="{{ route('podcast.episode.create', $podcast->slug) }}" 
                               class="px-4 py-2 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors inline-flex items-center">
                                <span class="material-icons-round text-sm mr-1">add</span>
                                Add Episode
                            </a>
                            <a href="#" 
                               class="px-4 py-2 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors inline-flex items-center">
                                <span class="material-icons-round text-sm mr-1">analytics</span>
                                Analytics
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            @endforeach
        </div>

        <!-- Pagination -->
        <div class="mt-8">
            {{ $podcasts->links() }}
        </div>
        @else
        <!-- Empty State -->
        <div class="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
            <span class="material-icons-round text-gray-600 text-6xl mb-4">podcasts</span>
            <h3 class="text-xl font-semibold text-white mb-2">No Podcasts Yet</h3>
            <p class="text-gray-400 mb-6">Start creating your first podcast and share your voice with the world</p>
            <a href="{{ route('podcast.create') }}" 
               class="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors">
                <span class="material-icons-round mr-2">add</span>
                Create Your First Podcast
            </a>
        </div>
        @endif
    </div>
</div>
@endsection
