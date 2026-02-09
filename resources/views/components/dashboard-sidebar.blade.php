@props(['stats' => [], 'upcomingEvents' => [], 'trendingNow' => []])

<div class="space-y-6">
    <!-- Mini Stats -->
    <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 class="text-lg font-semibold text-white mb-4">Your Stats</h3>
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                    <span class="material-icons-round text-green-500 text-sm">play_circle</span>
                    <span class="text-gray-400 text-sm">Plays Today</span>
                </div>
                <span class="text-white font-bold">{{ $stats['plays_today'] ?? 0 }}</span>
            </div>
            
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                    <span class="material-icons-round text-blue-500 text-sm">schedule</span>
                    <span class="text-gray-400 text-sm">Time Today</span>
                </div>
                <span class="text-white font-bold">{{ gmdate('H:i', $stats['time_today'] ?? 0) }}</span>
            </div>
            
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                    <span class="material-icons-round text-purple-500 text-sm">people</span>
                    <span class="text-gray-400 text-sm">Following</span>
                </div>
                <span class="text-white font-bold">{{ $stats['following_count'] ?? 0 }}</span>
            </div>
        </div>
    </div>
    
    <!-- Trending Now -->
    @if(!empty($trendingNow))
    <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-white">Trending Now</h3>
            <a href="{{ route('frontend.trending') }}" class="text-green-500 hover:text-green-400 text-xs font-medium">
                View All
            </a>
        </div>
        <div class="space-y-3">
            @foreach($trendingNow as $index => $song)
            <div class="flex items-center space-x-3 cursor-pointer hover:bg-gray-700/50 p-2 rounded-lg transition-colors group"
                 onclick="window.dispatchEvent(new CustomEvent('play-track', { detail: { trackId: {{ $song->id }} } }))">
                <!-- Rank Number -->
                <span class="text-gray-500 font-bold text-sm w-5">{{ $index + 1 }}</span>
                
                <!-- Artwork -->
                <div class="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 relative">
                    <img src="{{ $song->artwork_url }}" 
                         alt="{{ $song->title }}"
                         class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span class="material-icons-round text-white text-sm">play_arrow</span>
                    </div>
                </div>
                
                <!-- Song Info -->
                <div class="flex-1 min-w-0">
                    <p class="text-white text-xs font-medium truncate">{{ $song->title }}</p>
                    <p class="text-gray-400 text-xs truncate">{{ $song->artist->stage_name ?? 'Unknown' }}</p>
                </div>
                
                <!-- Play Count -->
                <span class="material-icons-round text-green-500 text-sm">trending_up</span>
            </div>
            @endforeach
        </div>
    </div>
    @endif
    
    <!-- Upcoming Events -->
    @if(!empty($upcomingEvents))
    <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-white">Upcoming Events</h3>
            <a href="{{ route('frontend.events.index') }}" class="text-green-500 hover:text-green-400 text-xs font-medium">
                View All
            </a>
        </div>
        <div class="space-y-4">
            @foreach($upcomingEvents as $event)
            <div class="group cursor-pointer" onclick="window.location='{{ route('frontend.events.show', $event->id) }}'">
                <!-- Event Date -->
                <div class="flex items-start space-x-3">
                    <div class="flex-shrink-0 text-center">
                        <div class="bg-green-500/20 rounded-lg p-2 border border-green-500/30">
                            <div class="text-green-500 font-bold text-lg leading-none">{{ $event->starts_at?->format('d') }}</div>
                            <div class="text-green-500 text-xs uppercase leading-none mt-1">{{ $event->starts_at?->format('M') }}</div>
                        </div>
                    </div>
                    
                    <div class="flex-1 min-w-0">
                        <h4 class="text-white text-sm font-medium group-hover:text-green-500 transition-colors truncate">
                            {{ $event->title }}
                        </h4>
                        <p class="text-gray-400 text-xs truncate">{{ $event->venue_name ?? 'Venue TBA' }}</p>

                        @if($event->starts_at)
                        <div class="flex items-center space-x-1 mt-1">
                            <span class="material-icons-round text-gray-500 text-xs">schedule</span>
                            <span class="text-gray-500 text-xs">{{ $event->starts_at->format('g:i A') }}</span>
                        </div>
                        @endif
                    </div>
                </div>
                
                <!-- Countdown -->
                @if($event->starts_at && $event->starts_at->isFuture())
                <div class="mt-2 text-xs text-gray-500 pl-14">
                    <span class="material-icons-round text-xs align-middle">access_time</span>
                    {{ $event->starts_at->diffForHumans() }}
                </div>
                @endif
            </div>
            @endforeach
        </div>
    </div>
    @endif
    
    <!-- Quick Actions -->
    <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 class="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div class="space-y-3">
            <a href="{{ route('frontend.edula') }}" class="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group">
                <span class="material-icons-round text-sm group-hover:text-green-500">explore</span>
                Discover Music
            </a>
            <a href="{{ route('frontend.playlists.index') }}" class="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group">
                <span class="material-icons-round text-sm group-hover:text-blue-500">queue_music</span>
                My Playlists
            </a>
            <a href="{{ route('frontend.player.library') }}" class="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group">
                <span class="material-icons-round text-sm group-hover:text-purple-500">library_music</span>
                My Library
            </a>
            <a href="{{ route('frontend.events.index') }}" class="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group">
                <span class="material-icons-round text-sm group-hover:text-orange-500">event</span>
                Browse Events
            </a>
            
            @auth
            @if(auth()->user()->hasRole('artist') || auth()->user()->artist)
            <div class="pt-3 border-t border-gray-700">
                <a href="{{ route('frontend.artist.dashboard') }}" class="flex items-center gap-3 text-green-400 hover:text-green-300 transition-colors group">
                    <span class="material-icons-round text-sm">dashboard</span>
                    <span class="font-medium">Artist Dashboard</span>
                </a>
            </div>
            @endif
            @endauth
        </div>
    </div>
    
    <!-- My Activity Summary -->
    <div class="bg-gradient-to-br from-green-900/30 to-blue-900/30 rounded-lg p-6 border border-green-500/30">
        <div class="flex items-center space-x-2 mb-3">
            <span class="material-icons-round text-green-500">insights</span>
            <h3 class="text-lg font-semibold text-white">This Week</h3>
        </div>
        <div class="space-y-2">
            <div class="flex justify-between text-sm">
                <span class="text-gray-400">New Songs Played</span>
                <span class="text-white font-medium">{{ $stats['new_songs_week'] ?? 0 }}</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-gray-400">Artists Discovered</span>
                <span class="text-white font-medium">{{ $stats['new_artists_week'] ?? 0 }}</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-gray-400">Listening Time</span>
                <span class="text-white font-medium">{{ gmdate('H:i', $stats['total_time_week'] ?? 0) }}</span>
            </div>
        </div>
    </div>
</div>
