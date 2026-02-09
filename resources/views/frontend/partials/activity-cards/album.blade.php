<div class="bg-gray-800 rounded-lg shadow-md border border-gray-700">
    <div class="p-4">
        <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <img src="{{ $activity->user->avatar_url }}" alt="{{ $activity->user->name }}" class="w-11 h-11 rounded-full object-cover">
                <div>
                    <div class="flex items-center space-x-1">
                        <a href="{{ route('frontend.artist.show', $activity->user->id) }}" class="font-bold hover:underline">
                            {{ $activity->user->name }}
                        </a>
                        @if($activity->user->is_verified ?? false)
                        <span class="material-icons-round text-blue-500 text-base" style="font-variation-settings: 'FILL' 1">verified</span>
                        @endif
                    </div>
                    <p class="text-xs text-gray-400">{{ $activity->created_at->diffForHumans() }}</p>
                </div>
            </div>
            <div class="relative" x-data="{ open: false }">
                <button @click="open = !open" class="p-2 rounded-full hover:bg-white/10">
                    <span class="material-icons-round">more_horiz</span>
                </button>
                <div x-show="open" @click.away="open = false" class="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-xl border border-gray-700 z-10">
                    <a href="#" class="block px-4 py-2 hover:bg-gray-800 rounded-t-lg">Save Post</a>
                    <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">Hide Post</a>
                    <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">Report</a>
                </div>
            </div>
        </div>
        <p class="mt-4">{{ $activity->description }}</p>
    </div>

    <!-- Album Display -->
    @if($activity->subject)
    <div class="px-4 pb-4">
        <div class="bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
            <!-- Album Cover -->
            <img src="{{ $activity->subject->artwork_url ?? $activity->subject->cover_url }}" 
                 alt="{{ $activity->subject->title }}" 
                 class="w-full h-64 object-cover">
            
            <!-- Album Info -->
            <div class="p-4">
                <div class="flex items-start justify-between gap-3">
                    <div class="flex-1">
                        <h3 class="font-bold text-xl">{{ $activity->subject->title }}</h3>
                        <p class="text-sm text-gray-400 mt-1">{{ $activity->subject->artist->name ?? $activity->user->name }}</p>
                        <div class="flex items-center gap-4 mt-2 text-xs text-gray-400">
                            <span>{{ $activity->subject->release_year ?? now()->year }}</span>
                            <span>•</span>
                            <span>{{ $activity->subject->songs_count ?? count($activity->subject->songs ?? []) }} tracks</span>
                        </div>
                    </div>
                    <button 
                        class="bg-brand-green text-white p-3 rounded-full hover:scale-110 transition-transform"
                        onclick="playAlbum({{ $activity->subject->id }})"
                    >
                        <span class="material-icons-round text-2xl">play_arrow</span>
                    </button>
                </div>

                <!-- Track Preview (First 3 songs) -->
                @if(isset($activity->subject->songs) && count($activity->subject->songs) > 0)
                <div class="mt-4 pt-4 border-t border-gray-700 space-y-2">
                    @foreach($activity->subject->songs->take(3) as $index => $song)
                    <div class="flex items-center gap-3 p-2 rounded hover:bg-gray-800 cursor-pointer" onclick="playSong({{ $song->id }})">
                        <span class="text-xs text-gray-400 w-4">{{ $index + 1 }}</span>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium truncate">{{ $song->title }}</p>
                            @if(isset($song->duration))
                            <p class="text-xs text-gray-400">{{ gmdate('i:s', $song->duration) }}</p>
                            @endif
                        </div>
                        <span class="material-icons-round text-gray-400 text-sm opacity-0 group-hover:opacity-100">play_arrow</span>
                    </div>
                    @endforeach
                    @if(count($activity->subject->songs) > 3)
                    <a href="{{ route('frontend.albums.show', $activity->subject->id) }}" class="text-xs text-brand-green hover:underline block mt-2">
                        Show all {{ count($activity->subject->songs) }} tracks →
                    </a>
                    @endif
                </div>
                @endif
            </div>
        </div>
    </div>
    @endif

    @include('frontend.partials.activity-actions', ['activity' => $activity])
</div>

<script>
function playAlbum(albumId) {
    window.dispatchEvent(new CustomEvent('play-album', { detail: { albumId: albumId } }));
}
</script>
