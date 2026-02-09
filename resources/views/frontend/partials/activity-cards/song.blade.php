<div class="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
    <!-- Header -->
    <div class="p-4">
        <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <a href="{{ route('frontend.artist.show', $activity->user->id) }}">
                    <img src="{{ $activity->user->avatar_url ?? asset('images/default-avatar.svg') }}" 
                         alt="{{ $activity->user->name }}" 
                         class="w-11 h-11 rounded-full object-cover">
                </a>
                <div>
                    <div class="flex items-center space-x-1">
                        <a href="{{ route('frontend.artist.show', $activity->user->id) }}" 
                           class="font-bold text-gray-900 dark:text-white hover:underline">
                            {{ $activity->user->name }}
                        </a>
                        @if($activity->user->is_verified ?? false)
                        <span class="material-symbols-outlined text-blue-500 text-base" style="font-variation-settings: 'FILL' 1">verified</span>
                        @endif
                    </div>
                    <p class="text-xs text-gray-600 dark:text-gray-400">{{ $activity->created_at->diffForHumans() }}</p>
                </div>
            </div>
            <div class="relative" x-data="{ open: false }">
                <button @click="open = !open" class="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400">
                    <span class="material-symbols-outlined">more_horiz</span>
                </button>
                <div x-show="open" @click.away="open = false" 
                     x-transition
                     class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-10"
                     style="display: none;">
                    <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-t-lg text-gray-900 dark:text-white text-sm">
                        <span class="material-symbols-outlined text-sm mr-2 align-middle">bookmark</span>
                        Save Post
                    </a>
                    <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white text-sm">
                        <span class="material-symbols-outlined text-sm mr-2 align-middle">visibility_off</span>
                        Hide Post
                    </a>
                    <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-b-lg text-red-500 text-sm">
                        <span class="material-symbols-outlined text-sm mr-2 align-middle">flag</span>
                        Report
                    </a>
                </div>
            </div>
        </div>
        <p class="mt-4 text-gray-900 dark:text-white">{{ $activity->description }}</p>
    </div>

    <!-- Song Player Card -->
    @if($activity->subject)
    <div class="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex space-x-4">
        <img src="{{ $activity->subject->artwork_url ?? asset('images/default-song-artwork.svg') }}" 
             alt="{{ $activity->subject->title }}" 
             class="w-24 h-24 rounded-lg object-cover">
        <div class="flex flex-col justify-center flex-grow">
            <h3 class="font-semibold text-lg text-gray-900 dark:text-white">{{ $activity->subject->title }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ $activity->subject->artist->name ?? 'Unknown Artist' }}</p>
            <div class="mt-2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full w-full">
                <div class="h-1 bg-brand-green rounded-full w-1/4"></div>
            </div>
        </div>
        <button 
            class="bg-brand-green text-white p-4 rounded-full self-center hover:scale-110 transition-transform"
            onclick="playSong({{ $activity->subject->id }})"
        >
            <span class="material-symbols-outlined text-3xl">play_arrow</span>
        </button>
    </div>
    @endif

    <!-- Interaction Buttons -->
    <div class="flex justify-around p-2 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
        <button class="flex items-center space-x-2 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 {{ ($activity->user_has_liked ?? false) ? 'text-red-500' : '' }}">
            <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' {{ ($activity->user_has_liked ?? false) ? 1 : 0 }}">favorite</span>
            <span class="text-sm font-semibold">{{ number_format($activity->likes_count ?? 0) }}</span>
        </button>
        <button class="flex items-center space-x-2 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
            <span class="material-symbols-outlined">chat_bubble</span>
            <span class="text-sm font-semibold">{{ number_format($activity->comments_count ?? 0) }}</span>
        </button>
        <button class="flex items-center space-x-2 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
            <span class="material-symbols-outlined">share</span>
            <span class="text-sm font-semibold">{{ number_format($activity->shares_count ?? 0) }}</span>
        </button>
        <button class="flex items-center space-x-2 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
            <span class="material-symbols-outlined">bookmark</span>
        </button>
    </div>
</div>

<script>
function playSong(songId) {
    console.log('Playing song:', songId);
    // TODO: Integrate with global music player
    alert('Music player integration - Coming soon!\nSong ID: ' + songId);
}
</script>
