<div class="bg-gray-800 rounded-lg shadow-md border border-gray-700">
    <div class="p-4">
        <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <img src="{{ $activity->user->avatar_url }}" alt="{{ $activity->user->name }}" class="w-11 h-11 rounded-full object-cover ring-2 ring-red-500">
                <div>
                    <div class="flex items-center gap-2">
                        <div class="flex items-center space-x-1">
                            <p class="font-bold">{{ $activity->user->name }}</p>
                            @if($activity->user->is_verified ?? false)
                            <span class="material-icons-round text-blue-500 text-base" style="font-variation-settings: 'FILL' 1">verified</span>
                            @endif
                        </div>
                        <div class="flex items-center space-x-1 text-red-500 font-semibold text-xs">
                            <div class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                            <span>LIVE</span>
                        </div>
                    </div>
                    <p class="text-xs text-gray-400">Started {{ $activity->created_at->diffForHumans() }}</p>
                </div>
            </div>
            @guest
            <a href="{{ route('login') }}" class="text-sm font-semibold py-1.5 px-4 bg-brand-green text-white rounded-full hover:bg-green-500 transition-colors">
                Follow
            </a>
            @else
                @if(!$activity->user->isFollowedBy(auth()->user()))
                <button 
                    onclick="followUser({{ $activity->user->id }})"
                    class="text-sm font-semibold py-1.5 px-4 border border-gray-700 rounded-full hover:border-white transition-colors"
                >
                    Follow
                </button>
                @else
                <button 
                    onclick="unfollowUser({{ $activity->user->id }})"
                    class="text-sm font-semibold py-1.5 px-4 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
                >
                    Following
                </button>
                @endif
            @endguest
        </div>
        <p class="mt-4">{{ $activity->description }}</p>
        
        <!-- Live Stream Thumbnail -->
        @if(isset($activity->subject->thumbnail_url))
        <div class="mt-4 relative cursor-pointer group" onclick="openLiveStream({{ $activity->subject->id }})">
            <img src="{{ $activity->subject->thumbnail_url }}" 
                 alt="Live stream" 
                 class="w-full h-64 object-cover rounded-lg">
            <!-- Overlay with viewer count -->
            <div class="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                <span class="material-icons-round text-sm">visibility</span>
                <span>{{ $activity->subject->viewer_count ?? rand(100, 5000) }} watching</span>
            </div>
            <!-- Play Overlay -->
            <div class="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div class="bg-white/20 backdrop-blur-sm rounded-full p-4">
                    <span class="material-icons-round text-white text-5xl">play_arrow</span>
                </div>
            </div>
        </div>
        @else
        <div class="mt-4 bg-gray-900 rounded-lg p-8 text-center">
            <span class="material-icons-round text-red-500 text-5xl">videocam</span>
            <p class="mt-2 text-sm text-gray-400">Live stream starting soon...</p>
        </div>
        @endif
    </div>
    
    @include('frontend.partials.activity-actions', ['activity' => $activity])
</div>

<script>
function openLiveStream(streamId) {
    // Open livestream in modal or redirect to livestream page
    window.location.href = `/livestream/${streamId}`;
}

function followUser(userId) {
    fetch(`/api/users/${userId}/follow`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.reload();
        }
    })
    .catch(error => console.error('Error following:', error));
}

function unfollowUser(userId) {
    fetch(`/api/users/${userId}/unfollow`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.reload();
        }
    })
    .catch(error => console.error('Error unfollowing:', error));
}
</script>
