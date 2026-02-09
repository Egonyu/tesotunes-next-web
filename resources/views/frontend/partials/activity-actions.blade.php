<div class="flex justify-around p-2 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
    <!-- Like Button -->
    <button 
        class="flex items-center space-x-2 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors group"
        onclick="toggleLike({{ $activity->id }})"
        id="like-btn-{{ $activity->id }}"
    >
        <span class="material-symbols-outlined group-hover:text-red-500">favorite</span>
        <span class="text-sm font-semibold" id="like-count-{{ $activity->id }}">{{ number_format($activity->likes_count ?? 0) }}</span>
    </button>
    
    <!-- Comment Button -->
    <button 
        class="flex items-center space-x-2 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors group"
        onclick="openComments({{ $activity->id }})"
    >
        <span class="material-symbols-outlined group-hover:text-blue-500">chat_bubble</span>
        <span class="text-sm font-semibold">{{ number_format($activity->comments_count ?? 0) }}</span>
    </button>
    
    <!-- Share Button -->
    <button 
        class="flex items-center space-x-2 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors group"
        onclick="shareActivity({{ $activity->id }})"
    >
        <span class="material-symbols-outlined group-hover:text-green-500">share</span>
        <span class="text-sm font-semibold">{{ number_format($activity->shares_count ?? 0) }}</span>
    </button>
    
    <!-- Save/Bookmark Button -->
    <button 
        class="flex items-center space-x-2 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors group"
        onclick="toggleSave({{ $activity->id }})"
        id="save-btn-{{ $activity->id }}"
    >
        <span class="material-symbols-outlined group-hover:text-brand-green">bookmark</span>
    </button>
</div>
