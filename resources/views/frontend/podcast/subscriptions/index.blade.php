@extends('frontend.layouts.music')

@section('title', 'My Subscriptions')

@section('content')
<div class="min-h-screen bg-white dark:bg-black">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-white mb-2">My Subscriptions</h1>
            <p class="text-gray-400">Manage your podcast subscriptions</p>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div class="flex items-center">
                    <span class="material-icons-round text-green-500 text-3xl">podcasts</span>
                    <div class="ml-4">
                        <p class="text-sm text-gray-400">Total Subscriptions</p>
                        <p class="text-2xl font-bold text-white">{{ $subscriptions->total() }}</p>
                    </div>
                </div>
            </div>
            <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div class="flex items-center">
                    <span class="material-icons-round text-blue-500 text-3xl">fiber_new</span>
                    <div class="ml-4">
                        <p class="text-sm text-gray-400">New Episodes</p>
                        <p class="text-2xl font-bold text-white">{{ $newEpisodesCount ?? 0 }}</p>
                    </div>
                </div>
            </div>
            <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div class="flex items-center">
                    <span class="material-icons-round text-purple-500 text-3xl">schedule</span>
                    <div class="ml-4">
                        <p class="text-sm text-gray-400">Hours Listened</p>
                        <p class="text-2xl font-bold text-white">{{ $hoursListened ?? 0 }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Filter/Sort -->
        <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-4">
                <button class="px-4 py-2 bg-green-600 text-white text-sm rounded-lg">All</button>
                <button class="px-4 py-2 bg-gray-800 text-gray-400 text-sm rounded-lg hover:bg-gray-700">
                    With New Episodes
                </button>
            </div>
            <select class="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
                <option>Recently Added</option>
                <option>Alphabetical</option>
                <option>Most Episodes</option>
                <option>Recently Updated</option>
            </select>
        </div>

        <!-- Subscriptions Grid -->
        @if($subscriptions->count() > 0)
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @foreach($subscriptions as $podcast)
            <div class="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-green-500 transition-all group">
                <a href="{{ route('podcast.show', $podcast->slug) }}">
                    <div class="aspect-square relative overflow-hidden">
                        <img src="{{ $podcast->cover_image ?? '/images/default-podcast.png' }}" 
                             alt="{{ $podcast->title }}"
                             class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                        @if($podcast->hasNewEpisodes ?? false)
                        <div class="absolute top-3 right-3">
                            <span class="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                                NEW
                            </span>
                        </div>
                        @endif
                    </div>
                </a>
                
                <div class="p-4">
                    <a href="{{ route('podcast.show', $podcast->slug) }}">
                        <h3 class="font-semibold text-white text-lg mb-1 hover:text-green-500 transition-colors line-clamp-1">
                            {{ $podcast->title }}
                        </h3>
                    </a>
                    <p class="text-gray-400 text-sm mb-3">
                        by {{ $podcast->user->name ?? 'Unknown' }}
                    </p>
                    
                    <div class="flex items-center justify-between text-sm text-gray-400 mb-4">
                        <span>
                            <span class="material-icons-round text-xs align-middle">mic</span>
                            {{ $podcast->episodes_count }} episodes
                        </span>
                        @if(isset($podcast->last_episode_at))
                        <span class="text-xs">
                            Updated {{ $podcast->last_episode_at->diffForHumans() }}
                        </span>
                        @endif
                    </div>

                    <div class="flex items-center space-x-2">
                        <a href="{{ route('podcast.show', $podcast->slug) }}" 
                           class="flex-1 px-4 py-2 bg-green-600 text-white text-sm text-center rounded-lg hover:bg-green-500 transition-colors">
                            View Podcast
                        </a>
                        <form action="{{ route('podcast.unsubscribe', $podcast->id) }}" method="POST">
                            @csrf
                            @method('DELETE')
                            <button type="submit" 
                                    class="p-2 bg-gray-700 text-white rounded-lg hover:bg-red-600 transition-colors"
                                    title="Unsubscribe">
                                <span class="material-icons-round text-sm">notifications_off</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            @endforeach
        </div>

        <!-- Pagination -->
        <div class="mt-8">
            {{ $subscriptions->links() }}
        </div>
        @else
        <!-- Empty State -->
        <div class="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
            <span class="material-icons-round text-gray-600 text-6xl mb-4">podcasts</span>
            <h3 class="text-xl font-semibold text-white mb-2">No Subscriptions Yet</h3>
            <p class="text-gray-400 mb-6">Start exploring and subscribe to your favorite podcasts</p>
            <a href="{{ route('podcast.discover') }}" 
               class="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors">
                <span class="material-icons-round mr-2">explore</span>
                Discover Podcasts
            </a>
        </div>
        @endif
    </div>
</div>
@endsection
