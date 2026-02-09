@extends('frontend.layouts.music')

@section('title', $artist->stage_name . ' - About')

@section('content')
<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Back Button -->
    <div class="mb-6">
        <a href="{{ route('frontend.artist.show', $artist) }}" class="btn-secondary inline-flex items-center gap-2">
            <span class="material-icons-round icon-sm">arrow_back</span>
            <span>Back to Artist</span>
        </a>
    </div>

    <!-- Artist Header -->
    <div class="card mb-6">
        <div class="flex flex-col md:flex-row gap-8">
            <!-- Avatar -->
            <div class="flex-shrink-0">
                <img src="{{ $artist->avatar_url }}" 
                     alt="{{ $artist->stage_name }}" 
                     class="w-32 h-32 rounded-full object-cover border-4 border-gray-700">
            </div>

            <!-- Info -->
            <div class="flex-1">
                <div class="flex items-start justify-between mb-4">
                    <div>
                        <h1 class="text-3xl font-bold text-primary mb-2">{{ $artist->stage_name }}</h1>
                        @if($artist->real_name && $artist->real_name !== $artist->stage_name)
                        <p class="text-secondary mb-2">{{ $artist->real_name }}</p>
                        @endif
                        @if($artist->is_verified)
                        <span class="inline-flex items-center gap-1 text-brand text-sm">
                            <span class="material-icons-round icon-sm">verified</span>
                            Verified Artist
                        </span>
                        @endif
                    </div>
                </div>

                <!-- Quick Stats -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p class="text-secondary text-sm">Tracks</p>
                        <p class="text-primary font-semibold text-lg">{{ number_format($artist->songs_count ?? 0) }}</p>
                    </div>
                    <div>
                        <p class="text-secondary text-sm">Albums</p>
                        <p class="text-primary font-semibold text-lg">{{ number_format($artist->albums_count ?? 0) }}</p>
                    </div>
                    <div>
                        <p class="text-secondary text-sm">Plays</p>
                        <p class="text-primary font-semibold text-lg">{{ number_format($artist->total_plays ?? 0) }}</p>
                    </div>
                    <div>
                        <p class="text-secondary text-sm">Followers</p>
                        <p class="text-primary font-semibold text-lg">{{ number_format($artist->followers_count ?? 0) }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Biography -->
    @if($artist->bio)
    <div class="card mb-6">
        <h2 class="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
            <span class="material-icons-round text-brand icon-md">person</span>
            Biography
        </h2>
        <div class="text-secondary leading-relaxed whitespace-pre-line">
            {{ $artist->bio }}
        </div>
    </div>
    @endif

    <!-- Career Info -->
    <div class="card mb-6">
        <h2 class="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
            <span class="material-icons-round text-brand icon-md">info</span>
            Career Information
        </h2>
        <div class="grid md:grid-cols-2 gap-6">
            @if($artist->genre)
            <div>
                <p class="text-secondary text-sm mb-1">Primary Genre</p>
                <p class="text-primary font-medium">{{ $artist->genre }}</p>
            </div>
            @endif

            @if($artist->location)
            <div>
                <p class="text-secondary text-sm mb-1">Location</p>
                <p class="text-primary font-medium">{{ $artist->location }}</p>
            </div>
            @endif

            @if($artist->record_label)
            <div>
                <p class="text-secondary text-sm mb-1">Record Label</p>
                <p class="text-primary font-medium">{{ $artist->record_label }}</p>
            </div>
            @endif

            @if($artist->created_at)
            <div>
                <p class="text-secondary text-sm mb-1">Joined LineOne</p>
                <p class="text-primary font-medium">{{ $artist->created_at->format('F Y') }}</p>
            </div>
            @endif
        </div>
    </div>

    <!-- Social Links -->
    @if($artist->instagram_url || $artist->twitter_url || $artist->facebook_url || $artist->youtube_url || $artist->tiktok_url)
    <div class="card">
        <h2 class="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
            <span class="material-icons-round text-brand icon-md">link</span>
            Social Media
        </h2>
        <div class="flex flex-wrap gap-3">
            @if($artist->instagram_url)
            <a href="{{ $artist->instagram_url }}" target="_blank" rel="noopener noreferrer" 
               class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity">
                <span class="material-icons-round icon-sm">link</span>
                Instagram
            </a>
            @endif

            @if($artist->twitter_url)
            <a href="{{ $artist->twitter_url }}" target="_blank" rel="noopener noreferrer" 
               class="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:opacity-90 transition-opacity">
                <span class="material-icons-round icon-sm">link</span>
                Twitter
            </a>
            @endif

            @if($artist->facebook_url)
            <a href="{{ $artist->facebook_url }}" target="_blank" rel="noopener noreferrer" 
               class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity">
                <span class="material-icons-round icon-sm">link</span>
                Facebook
            </a>
            @endif

            @if($artist->youtube_url)
            <a href="{{ $artist->youtube_url }}" target="_blank" rel="noopener noreferrer" 
               class="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:opacity-90 transition-opacity">
                <span class="material-icons-round icon-sm">link</span>
                YouTube
            </a>
            @endif

            @if($artist->tiktok_url)
            <a href="{{ $artist->tiktok_url }}" target="_blank" rel="noopener noreferrer" 
               class="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:opacity-90 transition-opacity">
                <span class="material-icons-round icon-sm">link</span>
                TikTok
            </a>
            @endif
        </div>
    </div>
    @endif
</div>
@endsection
