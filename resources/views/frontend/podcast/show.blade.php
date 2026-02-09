@extends('frontend.layouts.music')

@section('title', $podcast->title . ' - Tesotunes')

@section('content')
<div class="min-h-screen bg-black text-white">
    <!-- Podcast Header -->
    <div class="bg-gradient-to-b from-[#1db954]/20 to-black">
        <div class="max-w-7xl mx-auto px-4 pt-20 pb-10">
            <div class="flex flex-col md:flex-row items-start md:items-end space-y-6 md:space-y-0 md:space-x-6">
                <!-- Cover Art -->
                <div class="w-56 h-56 bg-[#282828] rounded-lg shadow-2xl overflow-hidden flex-shrink-0">
                    @if($podcast->cover_image)
                        <img src="{{ $podcast->cover_image }}" alt="{{ $podcast->title }}" class="w-full h-full object-cover">
                    @else
                        <div class="w-full h-full flex items-center justify-center">
                            <svg class="w-20 h-20 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.369 4.369 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"/>
                            </svg>
                        </div>
                    @endif
                </div>

                <!-- Podcast Info -->
                <div class="flex-1">
                    <p class="text-sm font-bold text-white uppercase mb-2">Podcast</p>
                    <h1 class="text-4xl md:text-6xl font-bold text-white mb-4">{{ $podcast->title }}</h1>
                    <div class="flex items-center space-x-4 text-sm text-gray-300">
                        <span>{{ $podcast->creator->name }}</span>
                        <span>•</span>
                        <span>{{ $podcast->episodes_count ?? $podcast->episodes->count() }} Episodes</span>
                        <span>•</span>
                        <span>{{ number_format($podcast->total_subscribers ?? 0) }} Subscribers</span>
                    </div>
                </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center space-x-4 mt-8">
                @auth
                    @if($isSubscribed)
                        <form action="{{ route('podcast.unsubscribe', $podcast) }}" method="POST">
                            @csrf
                            @method('DELETE')
                            <button type="submit" class="px-8 py-3 bg-white text-black rounded-full font-bold hover:scale-105 transition">
                                Subscribed
                            </button>
                        </form>
                    @else
                        <form action="{{ route('podcast.subscribe', $podcast) }}" method="POST">
                            @csrf
                            <button type="submit" class="px-8 py-3 bg-green-600 text-white rounded-full font-bold hover:bg-green-500 hover:scale-105 transition">
                                Subscribe
                            </button>
                        </form>
                    @endif

                    @can('update', $podcast)
                        <a href="{{ route('podcast.edit', $podcast->slug) }}" class="px-6 py-3 border border-gray-600 text-white rounded-full font-medium hover:border-white transition">
                            Edit Podcast
                        </a>
                    @endcan
                @else
                    <a href="{{ route('auth.login') }}" class="px-8 py-3 bg-green-600 text-white rounded-full font-bold hover:bg-green-500 hover:scale-105 transition">
                        Subscribe
                    </a>
                @endauth
            </div>
        </div>
    </div>

    <!-- Content Area -->
    <div class="max-w-7xl mx-auto px-4 py-8">
        <!-- Description -->
        <div class="mb-8">
            <h2 class="text-2xl font-bold text-white mb-4">About</h2>
            <p class="text-gray-300 leading-relaxed">{{ $podcast->description }}</p>
        </div>

        <!-- Episodes -->
        <div>
            <h2 class="text-2xl font-bold text-white mb-4">Episodes</h2>
            
            @if($podcast->episodes->count() > 0)
                <div class="space-y-4">
                    @foreach($podcast->episodes as $episode)
                        <div class="bg-[#181818] rounded-lg p-4 hover:bg-[#282828] transition group">
                            <div class="flex items-center space-x-4">
                                <!-- Play Button -->
                                <button class="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                    <svg class="w-6 h-6 text-black ml-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                                    </svg>
                                </button>

                                <!-- Episode Info -->
                                <div class="flex-1">
                                    <a href="{{ route('podcast.episode.show', [$podcast->slug, $episode->slug]) }}" class="text-white font-medium hover:underline">
                                        {{ $episode->title }}
                                    </a>
                                    <p class="text-sm text-gray-400 mt-1">{{ Str::limit($episode->description, 100) }}</p>
                                    <div class="flex items-center space-x-3 text-xs text-gray-500 mt-2">
                                        <span>{{ $episode->published_at?->diffForHumans() }}</span>
                                        <span>•</span>
                                        <span>{{ gmdate('H:i:s', $episode->duration ?? 0) }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    @endforeach
                </div>
            @else
                <div class="bg-[#181818] rounded-lg p-8 text-center">
                    <svg class="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
                    </svg>
                    <p class="text-gray-400">No episodes yet. Check back soon!</p>
                </div>
            @endif
        </div>
    </div>
</div>
@endsection
