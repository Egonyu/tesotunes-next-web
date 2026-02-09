<div class="bg-gray-800 rounded-lg shadow-md border border-gray-700">
    <div class="p-4">
        <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
                @php
                    $podcast = $activity->subject->podcast ?? null;
                @endphp
                <img src="{{ $podcast?->cover_url ?? $activity->user->avatar_url }}" 
                     alt="{{ $podcast?->title ?? $activity->user->name }}" 
                     class="w-11 h-11 rounded-lg object-cover">
                <div>
                    <p class="font-bold">{{ $podcast?->title ?? $activity->user->name }}</p>
                    <p class="text-xs text-gray-400">New Episode • {{ $activity->created_at->diffForHumans() }}</p>
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
        <h3 class="mt-4 font-bold text-lg">{{ $activity->subject->title }}</h3>
        <p class="mt-2 text-gray-400">{{ Str::limit($activity->subject->description ?? $activity->description ?? '', 150) }}</p>
    </div>
    
    <!-- Podcast Player Preview -->
    <div class="px-4 pb-4 flex items-center gap-3 bg-gray-900 border-t border-gray-700 py-3">
        <button 
            class="bg-brand-green text-white p-3 rounded-full hover:scale-110 transition-transform"
            onclick="playPodcast({{ $activity->subject->id }})"
        >
            <span class="material-icons-round">play_arrow</span>
        </button>
        <div class="flex-1">
            <div class="h-1 bg-gray-700 rounded-full">
                <div class="h-1 bg-brand-green rounded-full w-0" data-podcast-progress="{{ $activity->subject->id }}"></div>
            </div>
            <p class="text-xs text-gray-400 mt-1">
                {{ isset($activity->subject->duration) ? gmdate('H:i:s', $activity->subject->duration) : '00:00' }}
            </p>
        </div>
        @if(isset($activity->subject->slug))
        <a href="{{ route('podcast.episodes.show', $activity->subject->slug) }}" class="text-brand-green text-sm font-semibold hover:underline">
            Full Episode
        </a>
        @endif
    </div>
    
    @include('frontend.partials.activity-actions', ['activity' => $activity])
</div>

<script>
function playPodcast(podcastId) {
    // Dispatch event to global podcast player
    window.dispatchEvent(new CustomEvent('play-podcast', { detail: { podcastId: podcastId } }));
}
</script>
