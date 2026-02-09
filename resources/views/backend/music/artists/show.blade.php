@extends('layouts.admin')

@section('title', $artist->stage_name . ' - Artist Details')

@section('content')
<div class="p-6">
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
        <div>
            <div class="flex items-center gap-3 mb-2">
                <a href="{{ route('admin.music.artists.index') }}" 
                   class="text-gray-400 hover:text-white">
                    <span class="material-icons-round">arrow_back</span>
                </a>
                <h1 class="text-2xl font-bold text-white">{{ $artist->stage_name }}</h1>
                @if($artist->is_verified)
                    <span class="material-icons-round text-blue-500" title="Verified Artist">verified</span>
                @endif
            </div>
            <p class="text-gray-400">Artist Profile & Analytics</p>
        </div>
        <div class="flex gap-3">
            <a href="{{ route('admin.music.artists.edit', $artist) }}" 
               class="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                <span class="material-icons-round text-sm">edit</span>
                Edit Artist
            </a>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Profile Info -->
        <div class="lg:col-span-2 space-y-6">
            <!-- Profile Card -->
            <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div class="flex items-start gap-6">
                    <!-- Avatar -->
                    <div class="flex-shrink-0">
                        <img src="{{ $artist->avatar_url }}" alt="{{ $artist->stage_name }}" 
                             class="w-32 h-32 rounded-full object-cover">
                    </div>

                    <!-- Info -->
                    <div class="flex-1">
                        <h2 class="text-2xl font-bold text-white mb-2">{{ $artist->stage_name }}</h2>
                        
                        <div class="flex flex-wrap gap-4 mb-4">
                            <div class="flex items-center gap-2 text-gray-300">
                                <span class="material-icons-round text-sm">person</span>
                                <span>{{ $artist->user->name }}</span>
                            </div>
                            <div class="flex items-center gap-2 text-gray-300">
                                <span class="material-icons-round text-sm">email</span>
                                <span>{{ $artist->user->email }}</span>
                            </div>
                            @if($artist->user->country)
                                <div class="flex items-center gap-2 text-gray-300">
                                    <span class="material-icons-round text-sm">location_on</span>
                                    <span>{{ $artist->user->country }}</span>
                                </div>
                            @endif
                        </div>

                        @if($artist->bio)
                            <p class="text-gray-400 mb-4">{{ $artist->bio }}</p>
                        @endif

                        <!-- Status Badges -->
                        <div class="flex flex-wrap gap-2">
                            @if($artist->verification_status === 'verified')
                                <span class="inline-flex items-center gap-1 bg-green-900/50 border border-green-500 text-green-400 px-3 py-1 rounded-full text-sm">
                                    <span class="material-icons-round text-xs">check_circle</span>
                                    Verified
                                </span>
                            @elseif($artist->verification_status === 'pending')
                                <span class="inline-flex items-center gap-1 bg-yellow-900/50 border border-yellow-500 text-yellow-400 px-3 py-1 rounded-full text-sm">
                                    <span class="material-icons-round text-xs">schedule</span>
                                    Pending
                                </span>
                            @endif

                            @if($artist->is_trusted)
                                <span class="inline-flex items-center gap-1 bg-blue-900/50 border border-blue-500 text-blue-400 px-3 py-1 rounded-full text-sm">
                                    <span class="material-icons-round text-xs">stars</span>
                                    Trusted
                                </span>
                            @endif

                            <span class="inline-flex items-center gap-1 bg-gray-700 border border-gray-600 text-gray-300 px-3 py-1 rounded-full text-sm">
                                {{ ucfirst($artist->status) }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Analytics Card -->
            <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 class="text-lg font-semibold text-white mb-4">Analytics</h3>
                
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div class="bg-gray-700 rounded-lg p-4">
                        <p class="text-gray-400 text-sm mb-1">Total Songs</p>
                        <p class="text-2xl font-bold text-white">{{ number_format($analytics['total_songs'] ?? 0) }}</p>
                    </div>
                    <div class="bg-gray-700 rounded-lg p-4">
                        <p class="text-gray-400 text-sm mb-1">Total Albums</p>
                        <p class="text-2xl font-bold text-white">{{ number_format($analytics['total_albums'] ?? 0) }}</p>
                    </div>
                    <div class="bg-gray-700 rounded-lg p-4">
                        <p class="text-gray-400 text-sm mb-1">Total Plays</p>
                        <p class="text-2xl font-bold text-white">{{ number_format($analytics['total_plays'] ?? 0) }}</p>
                    </div>
                    <div class="bg-gray-700 rounded-lg p-4">
                        <p class="text-gray-400 text-sm mb-1">Followers</p>
                        <p class="text-2xl font-bold text-white">{{ number_format($analytics['total_followers'] ?? 0) }}</p>
                    </div>
                    <div class="bg-gray-700 rounded-lg p-4">
                        <p class="text-gray-400 text-sm mb-1">Monthly Listeners</p>
                        <p class="text-2xl font-bold text-white">{{ number_format($analytics['monthly_listeners'] ?? 0) }}</p>
                    </div>
                    <div class="bg-gray-700 rounded-lg p-4">
                        <p class="text-gray-400 text-sm mb-1">Total Revenue</p>
                        <p class="text-2xl font-bold text-white">UGX {{ number_format($analytics['revenue'] ?? 0) }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Right Column: Quick Info -->
        <div class="space-y-6">
            <!-- Upload Settings -->
            <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 class="text-lg font-semibold text-white mb-4">Upload Settings</h3>
                
                <div class="space-y-3 text-sm">
                    <div class="flex justify-between">
                        <span class="text-gray-400">Can Upload:</span>
                        <span class="text-white font-medium">{{ $artist->can_upload ? 'Yes' : 'No' }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">Monthly Limit:</span>
                        <span class="text-white font-medium">{{ $artist->monthly_upload_limit ?? 'Unlimited' }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">Commission Rate:</span>
                        <span class="text-white font-medium">{{ $artist->commission_rate ?? 30 }}%</span>
                    </div>
                </div>
            </div>

            <!-- Timestamps -->
            <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 class="text-lg font-semibold text-white mb-4">Timestamps</h3>
                
                <div class="space-y-3 text-sm">
                    <div>
                        <span class="text-gray-400 block mb-1">Created:</span>
                        <span class="text-white">{{ $artist->created_at->format('M j, Y g:i A') }}</span>
                    </div>
                    <div>
                        <span class="text-gray-400 block mb-1">Last Updated:</span>
                        <span class="text-white">{{ $artist->updated_at->format('M j, Y g:i A') }}</span>
                    </div>
                    @if($artist->verified_at)
                        <div>
                            <span class="text-gray-400 block mb-1">Verified:</span>
                            <span class="text-white">{{ $artist->verified_at->format('M j, Y g:i A') }}</span>
                        </div>
                    @endif
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 class="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                
                <div class="space-y-2">
                    <a href="{{ route('frontend.artist.show', $artist) }}" target="_blank"
                       class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-center block">
                        View Public Profile
                    </a>
                    <a href="{{ route('admin.music.songs.index', ['artist' => $artist->id]) }}"
                       class="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-center block">
                        View Songs
                    </a>
                    <a href="{{ route('admin.music.albums.index', ['artist' => $artist->id]) }}"
                       class="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-center block">
                        View Albums
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
