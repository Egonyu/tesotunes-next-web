<!-- Create Post Box -->
@auth
<div class="bg-white dark:bg-[#161B22] rounded-xl p-4 border border-gray-200 dark:border-[#30363D]">
    <div class="flex items-start space-x-4">
        <img src="{{ auth()->user()->avatar_url ?? asset('images/default-avatar.svg') }}" 
             alt="{{ auth()->user()->name }}" 
             class="w-10 h-10 rounded-full object-cover">
        <div class="flex-grow">
            <textarea 
                placeholder="What's on your mind?" 
                rows="1"
                class="bg-transparent w-full text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-0 border-0 p-0 resize-none"
                onclick="openCreatePostModal()"
                readonly
            ></textarea>
            <div class="flex justify-between items-center mt-3 pt-3 border-t border-gray-200 dark:border-[#30363D]">
                <div class="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                    <button type="button" onclick="openCreatePostModal('image')" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors" title="Add Photo">
                        <span class="material-symbols-outlined">image</span>
                    </button>
                    <button type="button" onclick="openCreatePostModal('video')" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors" title="Add Video">
                        <span class="material-symbols-outlined">videocam</span>
                    </button>
                    <button type="button" onclick="openCreatePostModal('music')" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors" title="Share Music">
                        <span class="material-symbols-outlined">music_note</span>
                    </button>
                    <button type="button" onclick="openCreatePostModal('poll')" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors" title="Create Poll">
                        <span class="material-symbols-outlined">poll</span>
                    </button>
                </div>
                <button type="button" onclick="openCreatePostModal()" class="bg-brand-green text-white font-semibold py-2 px-5 rounded-full hover:bg-green-500 transition-colors">
                    Post
                </button>
            </div>
        </div>
    </div>
</div>

<script>
function openCreatePostModal(type = 'text') {
    // TODO: Implement modal in Phase 9
    alert('Create post modal - Coming in Phase 9!\nPost type: ' + type);
}
</script>
@endauth
