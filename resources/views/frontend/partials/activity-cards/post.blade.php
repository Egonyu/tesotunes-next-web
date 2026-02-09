<div class="bg-white dark:bg-[#161B22] rounded-lg shadow-md border border-gray-200 dark:border-[#30363D]">
    <div class="p-4">
        <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <img src="{{ $activity->user->avatar_url }}" alt="{{ $activity->user->name }}" class="w-11 h-11 rounded-full object-cover">
                <div>
                    <div class="flex items-center space-x-1">
                        <a href="{{ route('frontend.profile.show', $activity->user->id) }}" class="font-bold hover:underline">
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
                <div x-show="open" @click.away="open = false" class="absolute right-0 mt-2 w-48 bg-white dark:bg-[#161B22] rounded-lg shadow-xl border border-gray-200 dark:border-[#30363D] z-10">
                    <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#0D1117] rounded-t-lg text-gray-700 dark:text-gray-300">Save Post</a>
                    <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">Hide Post</a>
                    <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">Report</a>
                </div>
            </div>
        </div>
        
        <!-- Post Content -->
        <div class="mt-4">
            <p class="text-base whitespace-pre-wrap">{{ $activity->description }}</p>
        </div>

        <!-- Optional: Hashtags -->
        @if(isset($activity->hashtags) && is_array($activity->hashtags) && count($activity->hashtags) > 0)
        <div class="mt-3 flex flex-wrap gap-2">
            @foreach($activity->hashtags as $tag)
            <a href="{{ route('social.hashtag', $tag) }}" class="text-brand-green text-sm hover:underline">
                #{{ $tag }}
            </a>
            @endforeach
        </div>
        @endif

        <!-- Optional: Image Attachments -->
        @if(isset($activity->images) && is_array($activity->images) && count($activity->images) > 0)
        <div class="mt-4 {{ count($activity->images) > 1 ? 'grid grid-cols-2 gap-2' : '' }}">
            @foreach(array_slice($activity->images, 0, 4) as $index => $image)
            <div class="relative {{ count($activity->images) === 1 ? 'max-h-96' : 'aspect-square' }} overflow-hidden rounded-lg">
                <img src="{{ $image }}" 
                     alt="Post image {{ $index + 1 }}" 
                     class="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                     onclick="openImageGallery({{ json_encode($activity->images) }}, {{ $index }})">
                @if($index === 3 && count($activity->images) > 4)
                <div class="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <span class="text-white text-2xl font-bold">+{{ count($activity->images) - 4 }}</span>
                </div>
                @endif
            </div>
            @endforeach
        </div>
        @endif

        <!-- Optional: Video Attachment -->
        @if(isset($activity->video_url))
        <div class="mt-4">
            <video controls class="w-full rounded-lg" preload="metadata">
                <source src="{{ $activity->video_url }}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        </div>
        @endif

        <!-- Optional: Link Preview -->
        @if(isset($activity->link_preview))
        <a href="{{ $activity->link_preview['url'] }}" target="_blank" class="mt-4 block bg-gray-50 dark:bg-[#0D1117] rounded-lg overflow-hidden border border-gray-200 dark:border-[#30363D] hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
            @if(isset($activity->link_preview['image']))
            <img src="{{ $activity->link_preview['image'] }}" alt="Link preview" class="w-full h-48 object-cover">
            @endif
            <div class="p-3">
                <p class="text-xs text-gray-400 uppercase">{{ parse_url($activity->link_preview['url'], PHP_URL_HOST) }}</p>
                <p class="font-semibold mt-1">{{ $activity->link_preview['title'] ?? 'Link' }}</p>
                @if(isset($activity->link_preview['description']))
                <p class="text-sm text-gray-400 mt-1 line-clamp-2">{{ $activity->link_preview['description'] }}</p>
                @endif
            </div>
        </a>
        @endif
    </div>

    @include('frontend.partials.activity-actions', ['activity' => $activity])
</div>

<script>
function openImageGallery(images, startIndex) {
    // Dispatch event to open image gallery modal
    window.dispatchEvent(new CustomEvent('open-image-gallery', { 
        detail: { images: images, startIndex: startIndex } 
    }));
}
</script>
