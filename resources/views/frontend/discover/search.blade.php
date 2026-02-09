@extends('frontend.layouts.music')

@section('title', 'Search Results - Tesotunes')

@push('styles')
<style>
    .search-filter {
        @apply bg-gray-700 border border-gray-600 rounded-full px-4 py-2 text-white transition-all;
    }

    .search-filter.active {
        @apply bg-brand border-brand;
    }

    .search-filter:hover {
        @apply bg-gray-600 border-gray-500;
    }

    .search-filter.active:hover {
        @apply bg-green-500;
    }
</style>
@endpush

@section('content')
<div class="min-h-screen bg-black text-white">
    <!-- Search Header -->
    <div class="mb-8">
        <div class="flex items-center justify-between">
            <div>
                @if(request('q'))
                    <h1 class="text-3xl font-bold text-white mb-2">Search results for "{{ request('q') }}"</h1>
                    <p class="text-gray-400">Found {{ rand(50, 500) }} results</p>
                @else
                    <h1 class="text-3xl font-bold text-white mb-2">Search Music</h1>
                    <p class="text-gray-400">Find songs, artists, albums, and playlists</p>
                @endif
            </div>
        </div>
    </div>

    <!-- Search Bar -->
    <div class="mb-8">
        <div class="max-w-2xl">
            <form action="{{ route('frontend.search') }}" method="GET" class="relative">
                <input
                    type="text"
                    name="q"
                    value="{{ request('q') }}"
                    placeholder="What do you want to listen to?"
                    class="input w-full text-lg pr-16"
                >
                <button type="submit" class="absolute right-2 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-brand hover:bg-green-500 rounded-lg flex items-center justify-center transition-colors">
                    <span class="material-icons-round text-white icon-md">search</span>
                </button>
            </form>
        </div>
    </div>

    @if(request('q'))
        <!-- Search Filters -->
        <div class="mb-8">
            <div class="flex items-center gap-3 flex-wrap">
                <a href="{{ route('frontend.search', ['q' => $query, 'type' => 'all']) }}" class="search-filter {{ $type === 'all' ? 'active' : '' }}">All</a>
                <a href="{{ route('frontend.search', ['q' => $query, 'type' => 'songs']) }}" class="search-filter {{ $type === 'songs' ? 'active' : '' }}">Songs</a>
                <a href="{{ route('frontend.search', ['q' => $query, 'type' => 'artists']) }}" class="search-filter {{ $type === 'artists' ? 'active' : '' }}">Artists</a>
                <a href="{{ route('frontend.search', ['q' => $query, 'type' => 'users']) }}" class="search-filter {{ $type === 'users' ? 'active' : '' }}">Users</a>
                <a href="{{ route('frontend.search', ['q' => $query, 'type' => 'playlists']) }}" class="search-filter {{ $type === 'playlists' ? 'active' : '' }}">Playlists</a>
            </div>
        </div>

        <!-- Content Grid -->
        <div class="grid lg:grid-cols-3 gap-8">
            <!-- Main Content -->
            <div class="lg:col-span-2 space-y-8">
                <!-- Top Result -->
                <div class="card">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-xl font-bold text-primary">Top Result</h2>
                    </div>
                    <div class="card-hover p-6 cursor-pointer">
                        <div class="flex items-center gap-6">
                            <div class="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                <span class="material-icons-round text-white text-3xl">music_note</span>
                            </div>
                            <div class="flex-1">
                                <h3 class="text-2xl font-bold text-white mb-2">{{ request('q') }}</h3>
                                <p class="text-gray-400 mb-1">Song • Artist Name</p>
                                <p class="text-gray-500 text-sm">{{ number_format(rand(1000000, 50000000)) }} plays</p>
                            </div>
                            <button class="play-button-lg">
                                <span class="material-icons-round text-black icon-lg">play_arrow</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Songs -->
                <div class="card">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-xl font-bold text-primary">Songs</h2>
                        <a href="#" class="text-brand hover:text-green-400 text-sm font-medium">See all</a>
                    </div>
                    <div class="space-y-3">
                        @php
                            $searchQuery = request('q', 'music');
                            $songs = [
                                ['title' => $searchQuery . ' Box', 'artist' => 'Artist One', 'duration' => '3:24', 'plays' => rand(1000000, 10000000)],
                                ['title' => 'Best of ' . $searchQuery, 'artist' => 'Artist Two', 'duration' => '4:15', 'plays' => rand(500000, 5000000)],
                                ['title' => $searchQuery . ' Nights', 'artist' => 'Artist Three', 'duration' => '3:52', 'plays' => rand(800000, 8000000)],
                                ['title' => $searchQuery . ' Dreams', 'artist' => 'Artist Four', 'duration' => '2:58', 'plays' => rand(600000, 6000000)],
                                ['title' => 'When ' . $searchQuery . ' Calls', 'artist' => 'Artist Five', 'duration' => '4:33', 'plays' => rand(700000, 7000000)]
                            ];
                            $colors = ['from-purple-500 to-pink-500', 'from-blue-500 to-cyan-500', 'from-green-500 to-emerald-500', 'from-yellow-500 to-orange-500', 'from-red-500 to-rose-500'];
                        @endphp
                        @foreach($songs as $index => $song)
                            <div class="flex items-center gap-4 p-3 hover:bg-gray-700/50 rounded-lg transition-colors cursor-pointer group">
                                <div class="w-12 h-12 bg-gradient-to-br {{ $colors[$index] }} rounded flex items-center justify-center">
                                    <span class="material-icons-round text-white text-sm">music_note</span>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="text-white font-medium truncate">{{ $song['title'] }}</p>
                                    <p class="text-gray-400 text-sm truncate">{{ $song['artist'] }}</p>
                                </div>
                                <div class="text-right">
                                    <p class="text-white text-sm">{{ $song['duration'] }}</p>
                                    <p class="text-gray-500 text-xs">{{ number_format($song['plays']) }} plays</p>
                                </div>
                                <button class="play-button-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span class="material-icons-round text-black icon-sm">play_arrow</span>
                                </button>
                            </div>
                        @endforeach
                    </div>
                </div>

                <!-- Artists -->
                @if($results['artists']->count() > 0)
                <div class="card">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-xl font-bold text-primary">Artists</h2>
                        <a href="{{ route('frontend.search', ['q' => $query, 'type' => 'artists']) }}" class="text-brand hover:text-green-400 text-sm font-medium">See all</a>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        @foreach($results['artists'] as $artist)
                            <a href="{{ route('frontend.artist.show', $artist) }}" class="card-hover p-4 text-center cursor-pointer">
                                <div class="relative mb-4">
                                    <img src="{{ $artist->avatar_url }}" alt="{{ $artist->stage_name }}" class="w-24 h-24 mx-auto rounded-full object-cover">
                                    <button class="play-button absolute bottom-0 right-1/2 transform translate-x-1/2">
                                        <span class="material-icons-round text-black">play_arrow</span>
                                    </button>
                                </div>
                                <h3 class="font-semibold text-white truncate mb-1">{{ $artist->stage_name }}</h3>
                                <p class="text-gray-400 text-sm">{{ number_format($artist->followers_count ?? 0) }} followers</p>
                            </a>
                        @endforeach
                    </div>
                </div>
                @endif

                <!-- Users -->
                @if($results['users']->count() > 0)
                <div class="card">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-xl font-bold text-primary">Users</h2>
                        <a href="{{ route('frontend.search', ['q' => $query, 'type' => 'users']) }}" class="text-brand hover:text-green-400 text-sm font-medium">See all</a>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        @foreach($results['users'] as $user)
                            <div class="card-hover p-4 text-center cursor-pointer">
                                <div class="relative mb-4">
                                    @if($user->avatar)
                                        <img src="{{ $user->avatar }}" alt="{{ $user->name }}" class="w-24 h-24 mx-auto rounded-full object-cover">
                                    @else
                                        <div class="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                                            <span class="material-icons-round text-white text-2xl">person</span>
                                        </div>
                                    @endif
                                </div>
                                <h3 class="font-semibold text-white truncate mb-1">{{ $user->name }}</h3>
                                <p class="text-gray-400 text-sm">@if($user->username){{ '@'.$user->username }}@else{{ 'User' }}@endif</p>
                            </div>
                        @endforeach
                    </div>
                </div>
                @endif

                <!-- Albums -->
                <div class="card">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-xl font-bold text-primary">Albums</h2>
                        <a href="#" class="text-brand hover:text-green-400 text-sm font-medium">See all</a>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        @php
                            $albums = [
                                ['title' => 'The Best of ' . $searchQuery, 'artist' => 'Various Artists', 'year' => 2023, 'color' => 'from-purple-500 to-blue-500'],
                                ['title' => $searchQuery . ' Collection', 'artist' => 'Greatest Hits', 'year' => 2022, 'color' => 'from-green-500 to-cyan-500'],
                                ['title' => $searchQuery . ' Anthology', 'artist' => 'Classic Albums', 'year' => 2021, 'color' => 'from-red-500 to-orange-500'],
                                ['title' => 'Ultimate ' . $searchQuery, 'artist' => 'Hit Singles', 'year' => 2023, 'color' => 'from-yellow-500 to-pink-500']
                            ];
                        @endphp
                        @foreach($albums as $album)
                            <div class="card-hover p-4 cursor-pointer">
                                <div class="relative mb-4">
                                    <div class="aspect-square bg-gradient-to-br {{ $album['color'] }} rounded-md flex items-center justify-center">
                                        <span class="material-icons-round text-white text-2xl">album</span>
                                    </div>
                                    <button class="play-button absolute bottom-2 right-2">
                                        <span class="material-icons-round text-black">play_arrow</span>
                                    </button>
                                </div>
                                <h3 class="font-semibold text-white truncate mb-1">{{ $album['title'] }}</h3>
                                <p class="text-gray-400 text-sm truncate">{{ $album['artist'] }}</p>
                                <p class="text-gray-500 text-xs">{{ $album['year'] }}</p>
                            </div>
                        @endforeach
                    </div>
                </div>
            </div>

            <!-- Sidebar -->
            <div class="space-y-6">
                <!-- Search Suggestions -->
                <div class="card">
                    <h3 class="text-lg font-bold text-primary mb-4">Related Searches</h3>
                    <div class="space-y-2">
                        @php
                            $relatedSearches = [
                                $searchQuery . ' hits',
                                $searchQuery . ' 2023',
                                'best ' . $searchQuery,
                                $searchQuery . ' playlist',
                                $searchQuery . ' radio'
                            ];
                        @endphp
                        @foreach($relatedSearches as $search)
                            <a href="{{ route('frontend.search', ['q' => $search]) }}" class="block p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors">
                                <span class="material-icons-round text-sm mr-2">search</span>
                                {{ $search }}
                            </a>
                        @endforeach
                    </div>
                </div>

                <!-- Popular Searches -->
                <div class="card">
                    <h3 class="text-lg font-bold text-primary mb-4">Popular Searches</h3>
                    <div class="space-y-2">
                        @php
                            $popularSearches = [
                                'Taylor Swift',
                                'Drake',
                                'Pop music',
                                'Hip hop',
                                'Rock classics',
                                'Chill playlist'
                            ];
                        @endphp
                        @foreach($popularSearches as $search)
                            <a href="{{ route('frontend.search', ['q' => $search]) }}" class="block p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors">
                                <span class="material-icons-round text-sm mr-2">trending_up</span>
                                {{ $search }}
                            </a>
                        @endforeach
                    </div>
                </div>

                <!-- Search Tips -->
                <div class="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-lg p-6 border border-purple-700/50">
                    <h3 class="text-lg font-bold text-white mb-4">Search Tips</h3>
                    <div class="space-y-3">
                        <div class="flex items-start gap-3">
                            <span class="material-icons-round text-purple-400 text-sm mt-0.5">lightbulb</span>
                            <div>
                                <p class="text-white text-sm font-medium">Use quotes</p>
                                <p class="text-gray-300 text-xs">Search for exact phrases</p>
                            </div>
                        </div>
                        <div class="flex items-start gap-3">
                            <span class="material-icons-round text-blue-400 text-sm mt-0.5">filter_list</span>
                            <div>
                                <p class="text-white text-sm font-medium">Use filters</p>
                                <p class="text-gray-300 text-xs">Narrow down by type</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    @else
        <!-- Browse All Categories -->
        <div class="card">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-bold text-primary">Browse All</h2>
                <span class="text-secondary text-sm">Explore by category</span>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                @php
                    $browseCategories = [
                        ['name' => 'Pop', 'color' => '#ff6b35', 'bg_color' => '#d45087'],
                        ['name' => 'Hip-Hop', 'color' => '#ffc107', 'bg_color' => '#ff8f00'],
                        ['name' => 'Rock', 'color' => '#dc3545', 'bg_color' => '#8e24aa'],
                        ['name' => 'Electronic', 'color' => '#007bff', 'bg_color' => '#00acc1'],
                        ['name' => 'Jazz', 'color' => '#6f42c1', 'bg_color' => '#5e35b1'],
                        ['name' => 'Classical', 'color' => '#28a745', 'bg_color' => '#43a047'],
                        ['name' => 'Country', 'color' => '#20c997', 'bg_color' => '#26a69a'],
                        ['name' => 'R&B', 'color' => '#fd7e14', 'bg_color' => '#ef5350'],
                        ['name' => 'Indie', 'color' => '#e83e8c', 'bg_color' => '#ab47bc'],
                        ['name' => 'Alternative', 'color' => '#6610f2', 'bg_color' => '#7e57c2'],
                        ['name' => 'Reggae', 'color' => '#198754', 'bg_color' => '#66bb6a'],
                        ['name' => 'Folk', 'color' => '#795548', 'bg_color' => '#8d6e63']
                    ];
                @endphp
                @foreach($browseCategories as $category)
                    <a href="{{ route('frontend.search', ['q' => $category['name']]) }}" class="block p-4 rounded-lg cursor-pointer h-24 flex items-end relative transition-transform hover:scale-105"
                       style="background: linear-gradient(135deg, {{ $category['color'] }}, {{ $category['bg_color'] }});">
                        <div class="absolute inset-0 bg-black bg-opacity-20 hover:bg-opacity-0 transition-all duration-300 rounded-lg"></div>
                        <h3 class="font-bold text-white text-lg relative z-10">{{ $category['name'] }}</h3>
                        <div class="absolute top-2 right-2 w-16 h-16 bg-white bg-opacity-20 rounded-lg transform rotate-12"></div>
                    </a>
                @endforeach
            </div>
        </div>
    @endif
</div>
@endsection