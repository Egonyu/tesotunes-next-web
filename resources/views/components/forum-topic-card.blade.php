@props(['topic'])

<a href="{{ route('forum.topic.show', $topic->slug) }}" 
   class="block p-6 hover:bg-gray-700/50 transition group">
    <div class="flex items-start space-x-4">
        {{-- Avatar --}}
        <img src="{{ $topic->user->avatar_url }}" 
             alt="{{ $topic->user->name }}" 
             class="w-12 h-12 rounded-full flex-shrink-0">
        
        <div class="flex-1 min-w-0">
            {{-- Header --}}
            <div class="flex items-center space-x-2 mb-2">
                <span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded"
                      style="background-color: {{ $topic->category->color }}20; color: {{ $topic->category->color }}">
                    {{ $topic->category->icon }} {{ $topic->category->name }}
                </span>
                @if($topic->is_pinned)
                    <span class="text-yellow-500 text-xs">📌</span>
                @endif
                @if($topic->is_locked)
                    <span class="text-red-500 text-xs">🔒</span>
                @endif
                @if($topic->is_featured)
                    <span class="text-purple-500 text-xs">⭐</span>
                @endif
            </div>

            {{-- Title --}}
            <h3 class="text-lg font-semibold text-white group-hover:text-indigo-400 transition mb-1">
                {{ $topic->title }}
            </h3>

            {{-- Excerpt --}}
            <p class="text-sm text-gray-400 line-clamp-2 mb-3">
                {{ Str::limit(strip_tags($topic->content), 150) }}
            </p>

            {{-- Meta --}}
            <div class="flex items-center space-x-4 text-xs text-gray-500">
                <span class="flex items-center">
                    <span class="material-icons-round text-xs mr-1">person</span>
                    {{ $topic->user->name }}
                </span>
                <span class="flex items-center">
                    <span class="material-icons-round text-xs mr-1">chat_bubble</span>
                    {{ $topic->replies_count ?? 0 }}
                </span>
                <span class="flex items-center">
                    <span class="material-icons-round text-xs mr-1">visibility</span>
                    {{ $topic->views_count ?? 0 }}
                </span>
                <span class="flex items-center">
                    <span class="material-icons-round text-xs mr-1">schedule</span>
                    {{ $topic->created_at->diffForHumans() }}
                </span>
            </div>
        </div>

        {{-- Last Reply Info --}}
        @if($topic->lastReplyUser)
        <div class="hidden md:block text-right flex-shrink-0">
            <div class="text-xs text-gray-400">Last reply by</div>
            <div class="text-sm text-white">{{ $topic->lastReplyUser->name }}</div>
            <div class="text-xs text-gray-500">{{ $topic->last_reply_at?->diffForHumans() }}</div>
        </div>
        @endif
    </div>
</a>