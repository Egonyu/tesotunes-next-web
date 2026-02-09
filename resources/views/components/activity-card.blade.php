@props(['type', 'activity'])

@php
    $config = [
        // Music activities
        'uploaded_song' => [
            'icon' => 'music_note',
            'color' => 'green',
            'title' => 'uploaded a new song'
        ],
        'song_approved' => [
            'icon' => 'check_circle',
            'color' => 'green',
            'title' => 'song was approved'
        ],
        'distributed_song' => [
            'icon' => 'cloud_upload',
            'color' => 'blue',
            'title' => 'distributed a song'
        ],
        'released_album' => [
            'icon' => 'album',
            'color' => 'blue',
            'title' => 'released a new album'
        ],
        'album_published' => [
            'icon' => 'publish',
            'color' => 'blue',
            'title' => 'published an album'
        ],
        
        // Social activities
        'liked_song' => [
            'icon' => 'favorite',
            'color' => 'red',
            'title' => 'liked a song'
        ],
        'liked_album' => [
            'icon' => 'favorite',
            'color' => 'red',
            'title' => 'liked an album'
        ],
        'liked_playlist' => [
            'icon' => 'favorite',
            'color' => 'red',
            'title' => 'liked a playlist'
        ],
        'commented_song' => [
            'icon' => 'chat_bubble',
            'color' => 'blue',
            'title' => 'commented on a song'
        ],
        'shared_song' => [
            'icon' => 'share',
            'color' => 'green',
            'title' => 'shared a song'
        ],
        'followed_user' => [
            'icon' => 'person_add',
            'color' => 'indigo',
            'title' => 'followed'
        ],
        'followed_artist' => [
            'icon' => 'person_add',
            'color' => 'indigo',
            'title' => 'followed'
        ],
        
        // Event activities
        'created_event' => [
            'icon' => 'event',
            'color' => 'purple',
            'title' => 'created an event'
        ],
        'event_published' => [
            'icon' => 'publish',
            'color' => 'purple',
            'title' => 'published an event'
        ],
        'joined_event' => [
            'icon' => 'event_available',
            'color' => 'purple',
            'title' => 'is attending'
        ],
        
        // Playlist activities
        'created_playlist' => [
            'icon' => 'queue_music',
            'color' => 'pink',
            'title' => 'created a playlist'
        ],
        'playlist_made_public' => [
            'icon' => 'public',
            'color' => 'pink',
            'title' => 'made a playlist public'
        ],
        
        // Award activities
        'voted_award' => [
            'icon' => 'emoji_events',
            'color' => 'yellow',
            'title' => 'voted in the awards'
        ],
        
        // SACCO activities
        'sacco_dividend' => [
            'icon' => 'payments',
            'color' => 'orange',
            'title' => 'dividend distributed'
        ],
        
        // Store activities
        'store_product' => [
            'icon' => 'storefront',
            'color' => 'teal',
            'title' => 'launched a new product'
        ],
        
        // Forum & Polls activities
        'created_forum_topic' => [
            'icon' => 'forum',
            'color' => 'indigo',
            'title' => 'started a discussion'
        ],
        'replied_forum_topic' => [
            'icon' => 'chat_bubble',
            'color' => 'green',
            'title' => 'replied to a discussion'
        ],
        'marked_solution' => [
            'icon' => 'check_circle',
            'color' => 'green',
            'title' => 'marked a solution'
        ],
        'featured_forum_topic' => [
            'icon' => 'star',
            'color' => 'purple',
            'title' => 'featured topic'
        ],
        'created_poll' => [
            'icon' => 'poll',
            'color' => 'blue',
            'title' => 'created a poll'
        ],
        'closed_poll' => [
            'icon' => 'how_to_vote',
            'color' => 'blue',
            'title' => 'closed a poll'
        ],
        
        // Legacy/fallback
        'song_upload' => [
            'icon' => 'music_note',
            'color' => 'green',
            'title' => 'uploaded a new song'
        ],
        'album_release' => [
            'icon' => 'album',
            'color' => 'blue',
            'title' => 'released a new album'
        ],
        'event_created' => [
            'icon' => 'event',
            'color' => 'purple',
            'title' => 'created an event'
        ],
        'award_voting' => [
            'icon' => 'emoji_events',
            'color' => 'yellow',
            'title' => 'voting is now open'
        ],
        'friend_activity' => [
            'icon' => 'people',
            'color' => 'indigo',
            'title' => 'activity'
        ],
    ];
    
    $cardConfig = $config[$type] ?? [
        'icon' => 'notifications',
        'color' => 'gray',
        'title' => 'activity update'
    ];
@endphp

<div class="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-{{ $cardConfig['color'] }}-500 transition-all" 
     x-data="{ 
         showMenu: false, 
         removing: false,
         handleNotInterested(reason) {
             this.removing = true;
             fetch('{{ route('frontend.timeline.not-interested') }}', {
                 method: 'POST',
                 headers: {
                     'Content-Type': 'application/json',
                     'X-CSRF-TOKEN': '{{ csrf_token() }}'
                 },
                 body: JSON.stringify({
                     activity_id: {{ $activity->id }},
                     reason: reason
                 })
             })
             .then(response => response.json())
             .then(data => {
                 if (data.success) {
                     this.$el.style.opacity = '0';
                     setTimeout(() => this.$el.remove(), 300);
                 }
             })
             .catch(error => {
                 console.error('Error:', error);
                 this.removing = false;
             });
         }
     }"
     x-show="!removing"
     x-transition>
    <div class="flex items-start space-x-3">
        <!-- Icon -->
        <div class="flex-shrink-0">
            <span class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-{{ $cardConfig['color'] }}-500/20 text-{{ $cardConfig['color'] }}-500">
                <span class="material-icons-round text-lg">{{ $cardConfig['icon'] }}</span>
            </span>
        </div>
        
        <!-- Content -->
        <div class="flex-1 min-w-0">
            <!-- Actor Info -->
            <div class="flex items-center space-x-2 mb-1">
                @if($activity->actor)
                <img src="{{ $activity->actor->avatar_url ?? 'https://ui-avatars.com/api/?name=' . urlencode($activity->actor->name) }}" 
                     alt="{{ $activity->actor->name }}" 
                     class="w-6 h-6 rounded-full">
                <span class="text-sm font-medium text-white">{{ $activity->actor->name }}</span>
                @endif
                <span class="text-xs text-gray-400">{{ $cardConfig['title'] }}</span>
                <span class="text-xs text-gray-500">• {{ $activity->created_at->diffForHumans() }}</span>
            </div>
            
            <!-- Activity Content -->
            <div class="mt-2">
                @if($type === 'song_upload' && $activity->subject)
                    <div class="flex items-center space-x-3 p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors group cursor-pointer"
                         onclick="window.dispatchEvent(new CustomEvent('play-track', { detail: { trackId: {{ $activity->subject->id }} } }))">
                        <img src="{{ $activity->subject->artwork_url }}" 
                             alt="{{ $activity->subject->title }}"
                             class="w-12 h-12 rounded-lg object-cover">
                        <div class="flex-1 min-w-0">
                            <h4 class="text-white font-medium text-sm truncate">{{ $activity->subject->title }}</h4>
                            <p class="text-gray-400 text-xs truncate">{{ $activity->subject->artist->name ?? 'Unknown Artist' }}</p>
                        </div>
                        <button class="opacity-0 group-hover:opacity-100 transition-opacity">
                            <span class="material-icons-round text-white">play_circle</span>
                        </button>
                    </div>
                @elseif($type === 'event_created' && $activity->subject)
                    <div class="p-3 rounded-lg bg-gray-700/50">
                        <h4 class="text-white font-medium text-sm mb-1">{{ $activity->subject->title }}</h4>
                        <p class="text-gray-400 text-xs mb-2">{{ $activity->subject->venue ?? 'Venue TBA' }} • {{ $activity->subject->start_date?->format('M d, Y') }}</p>
                        <a href="{{ route('frontend.events.show', $activity->subject->id) }}" 
                           class="inline-flex items-center text-xs text-{{ $cardConfig['color'] }}-500 hover:text-{{ $cardConfig['color'] }}-400 font-medium">
                            View Event <span class="material-icons-round text-sm ml-1">arrow_forward</span>
                        </a>
                    </div>
                @elseif($type === 'album_release' && $activity->subject)
                    <div class="p-3 rounded-lg bg-gray-700/50">
                        <div class="flex items-center space-x-3">
                            <img src="{{ $activity->subject->artwork_url }}" 
                                 alt="{{ $activity->subject->title }}"
                                 class="w-16 h-16 rounded-lg object-cover">
                            <div class="flex-1 min-w-0">
                                <h4 class="text-white font-medium text-sm truncate">{{ $activity->subject->title }}</h4>
                                <p class="text-gray-400 text-xs">{{ $activity->subject->songs_count ?? 0 }} tracks</p>
                            </div>
                        </div>
                    </div>
                @elseif($type === 'sacco_dividend' && $activity->metadata)
                    <div class="p-3 rounded-lg bg-gray-700/50">
                        <p class="text-white text-sm mb-1">Dividend Payment Available</p>
                        <p class="text-{{ $cardConfig['color'] }}-500 font-bold text-lg">
                            UGX {{ number_format($activity->metadata['amount'] ?? 0) }}
                        </p>
                        <a href="{{ route('sacco.dashboard') }}" 
                           class="inline-flex items-center text-xs text-{{ $cardConfig['color'] }}-500 hover:text-{{ $cardConfig['color'] }}-400 font-medium mt-2">
                            View Details <span class="material-icons-round text-sm ml-1">arrow_forward</span>
                        </a>
                    </div>
                @elseif(in_array($type, ['created_forum_topic', 'featured_forum_topic']) && $activity->subject)
                    <div class="p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors">
                        @if($activity->subject->category)
                        <div class="flex items-center space-x-2 mb-2">
                            <span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md" 
                                  style="background-color: {{ $activity->subject->category->color }}20; color: {{ $activity->subject->category->color }}">
                                <span class="mr-1">{{ $activity->subject->category->icon }}</span>
                                {{ $activity->subject->category->name }}
                            </span>
                            @if($activity->subject->is_pinned)
                                <span class="text-xs text-gray-400">📌 Pinned</span>
                            @endif
                        </div>
                        @endif
                        <h4 class="text-white font-medium text-sm mb-1">{{ $activity->subject->title }}</h4>
                        <p class="text-gray-400 text-xs line-clamp-2 mb-2">
                            {{ Str::limit(strip_tags($activity->subject->content), 100) }}
                        </p>
                        <div class="flex items-center space-x-4 text-xs text-gray-400 mb-2">
                            <span>💬 {{ $activity->subject->replies_count ?? 0 }} replies</span>
                            <span>👁️ {{ $activity->subject->views_count ?? 0 }} views</span>
                        </div>
                        <a href="{{ route('forum.topic.show', $activity->subject->slug) }}" 
                           class="inline-flex items-center text-xs text-{{ $cardConfig['color'] }}-500 hover:text-{{ $cardConfig['color'] }}-400 font-medium">
                            View Discussion <span class="material-icons-round text-sm ml-1">arrow_forward</span>
                        </a>
                    </div>
                @elseif(in_array($type, ['replied_forum_topic', 'marked_solution']) && $activity->subject)
                    <div class="p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors border-l-4 border-{{ $cardConfig['color'] }}-500">
                        @if($type === 'marked_solution')
                            <div class="flex items-center space-x-2 mb-2">
                                <span class="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                                    ✓ Solution
                                </span>
                            </div>
                        @endif
                        <p class="text-gray-300 text-sm line-clamp-3 mb-2">
                            {{ Str::limit(strip_tags($activity->subject->content), 150) }}
                        </p>
                        @if($activity->subject->topic)
                        <a href="{{ route('forum.topic.show', [$activity->subject->topic->slug, '#reply-' . $activity->subject->id]) }}" 
                           class="inline-flex items-center text-xs text-{{ $cardConfig['color'] }}-500 hover:text-{{ $cardConfig['color'] }}-400 font-medium">
                            View Reply <span class="material-icons-round text-sm ml-1">arrow_forward</span>
                        </a>
                        @endif
                    </div>
                @elseif(in_array($type, ['created_poll', 'closed_poll']) && $activity->subject)
                    <div class="p-3 rounded-lg bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-800/50">
                        <h4 class="text-white font-medium text-sm mb-3">{{ $activity->subject->question }}</h4>
                        @if($activity->subject->options && $activity->subject->options->count() > 0)
                        <div class="space-y-2 mb-3">
                            @foreach($activity->subject->options->take(2) as $option)
                            <div class="bg-gray-700/50 rounded-md p-2 flex items-center justify-between">
                                <span class="text-sm text-gray-300">{{ $option->option_text }}</span>
                                @if($type === 'closed_poll')
                                    <span class="text-xs text-gray-400">{{ $option->votes_count ?? 0 }} votes</span>
                                @endif
                            </div>
                            @endforeach
                            @if($activity->subject->options->count() > 2)
                                <p class="text-xs text-gray-500 text-center">
                                    +{{ $activity->subject->options->count() - 2 }} more options
                                </p>
                            @endif
                        </div>
                        @endif
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-3 text-xs text-gray-400">
                                @if($activity->metadata['is_multiple_choice'] ?? false)
                                    <span>☑️ Multiple choice</span>
                                @endif
                                @if($activity->metadata['is_anonymous'] ?? false)
                                    <span>🔒 Anonymous</span>
                                @endif
                            </div>
                            @if($activity->subject->status === 'active')
                                <a href="{{ route('polls.show', $activity->subject->id) }}" 
                                   class="inline-flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition">
                                    Vote Now
                                </a>
                            @else
                                <span class="text-xs text-gray-400">
                                    {{ $activity->metadata['total_votes'] ?? 0 }} votes
                                </span>
                            @endif
                        </div>
                    </div>
                @else
                    <p class="text-gray-300 text-sm">{{ $activity->metadata['message'] ?? 'Activity update' }}</p>
                @endif
            </div>
            
            <!-- Engagement Actions -->
            <div class="mt-3 flex items-center justify-between">
                <div class="flex items-center space-x-4 text-xs">
                    @auth
                    <!-- Like Button -->
                    <button @click="toggleLike({{ $activity->id }})" 
                            :class="liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'"
                            x-data="{ 
                                liked: {{ $activity->user_has_liked ?? 'false' }},
                                likeCount: {{ $activity->likes_count ?? 0 }}
                            }"
                            class="flex items-center space-x-1 transition-colors">
                        <span class="material-icons-round text-sm" x-text="liked ? 'favorite' : 'favorite_border'"></span>
                        <span x-text="likeCount"></span>
                    </button>
                    
                    <!-- Comment Button -->
                    <button @click="$dispatch('open-comments', { activityId: {{ $activity->id }} })"
                            class="flex items-center space-x-1 text-gray-400 hover:text-blue-500 transition-colors">
                        <span class="material-icons-round text-sm">chat_bubble_outline</span>
                        <span>{{ $activity->comments_count ?? 0 }}</span>
                    </button>
                    
                    <!-- Share Button -->
                    <button @click="shareActivity({{ $activity->id }})"
                            class="flex items-center space-x-1 text-gray-400 hover:text-green-500 transition-colors">
                        <span class="material-icons-round text-sm">share</span>
                    </button>
                    @else
                    <!-- Guest View - Show counts only -->
                    <span class="flex items-center space-x-1 text-gray-400">
                        <span class="material-icons-round text-sm">favorite_border</span>
                        <span>{{ $activity->likes_count ?? 0 }}</span>
                    </span>
                    <span class="flex items-center space-x-1 text-gray-400">
                        <span class="material-icons-round text-sm">chat_bubble_outline</span>
                        <span>{{ $activity->comments_count ?? 0 }}</span>
                    </span>
                    @endauth
                </div>
                
                <!-- Not Interested Button -->
                <div class="relative" @click.away="showMenu = false">
                    <button @click="showMenu = !showMenu" 
                            class="flex items-center space-x-1 text-xs text-gray-400 hover:text-white transition-colors">
                        <span class="material-icons-round text-sm">more_horiz</span>
                    </button>
                    
                    <!-- Dropdown Menu -->
                    <div x-show="showMenu" 
                         x-transition
                         class="absolute right-0 bottom-full mb-2 w-56 bg-gray-700 rounded-lg shadow-xl border border-gray-600 z-10">
                        <div class="py-1">
                            <button @click="handleNotInterested('not_relevant'); showMenu = false"
                                    class="w-full text-left px-4 py-2 text-xs text-white hover:bg-gray-600 transition-colors">
                                <span class="material-icons-round text-sm mr-2 align-middle">block</span>
                                Not relevant to me
                            </button>
                            <button @click="handleNotInterested('seen_already'); showMenu = false"
                                    class="w-full text-left px-4 py-2 text-xs text-white hover:bg-gray-600 transition-colors">
                                <span class="material-icons-round text-sm mr-2 align-middle">visibility_off</span>
                                Already seen this
                            </button>
                            <button @click="handleNotInterested('not_this_genre'); showMenu = false"
                                    class="w-full text-left px-4 py-2 text-xs text-white hover:bg-gray-600 transition-colors">
                                <span class="material-icons-round text-sm mr-2 align-middle">music_off</span>
                                Don't like this genre
                            </button>
                            <button @click="handleNotInterested('too_much'); showMenu = false"
                                    class="w-full text-left px-4 py-2 text-xs text-white hover:bg-gray-600 transition-colors">
                                <span class="material-icons-round text-sm mr-2 align-middle">remove_circle</span>
                                Seeing too much of this
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
