@php
    // Generate activity description and content
    $activityType = $activity->activity_type ?? $activity->type ?? 'update';
    $data = is_string($activity->data) ? json_decode($activity->data, true) : ($activity->data ?? []);
    
    // Build rich description based on activity type
    $actionText = match($activityType) {
        'song_released' => 'released a new song',
        'featured_song' => 'got featured',
        'released_album' => 'dropped a new album',
        'poll' => 'started a poll',
        'text_post' => 'shared an update',
        'spotlight' => 'is in the spotlight',
        'user_joined' => 'joined TesoTunes',
        'milestone_reached' => 'reached a milestone',
        'achievement_unlocked' => 'unlocked an achievement',
        'playlist_created' => 'created a playlist',
        default => 'shared an update'
    };

    // Get subject details for richer content
    $subject = $activity->subject;
    $subjectTitle = $subject->title ?? $subject->name ?? null;
    $subjectDesc = $subject->description ?? $subject->bio ?? null;
    $subjectImage = null;
    
    if ($subject) {
        if (method_exists($subject, 'getArtworkUrlAttribute') || isset($subject->artwork_url)) {
            $subjectImage = $subject->artwork_url;
        } elseif (method_exists($subject, 'getAvatarUrlAttribute') || isset($subject->avatar_url)) {
            $subjectImage = $subject->avatar_url;
        } elseif (isset($subject->image_url)) {
            $subjectImage = $subject->image_url;
        }
    }
    
    // Get contextual icon
    $contextIcon = match($activityType) {
        'song_released', 'featured_song' => 'music_note',
        'released_album' => 'album',
        'poll' => 'poll',
        'milestone_reached' => 'emoji_events',
        'achievement_unlocked' => 'workspace_premium',
        'playlist_created' => 'playlist_play',
        'user_joined' => 'waving_hand',
        default => 'auto_awesome'
    };
@endphp

<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-5">
    <!-- Header -->
    <div class="p-5">
        <div class="flex items-start justify-between">
            <div class="flex items-center space-x-3">
                <a href="{{ route('frontend.artist.show', $activity->user->id) }}" class="relative">
                    <img src="{{ $activity->user->avatar_url ?? asset('images/default-avatar.svg') }}" 
                         alt="{{ $activity->user->name }}" 
                         class="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700">
                    @if($activity->user->is_verified ?? false)
                    <span class="absolute -bottom-0.5 -right-0.5 bg-white dark:bg-gray-800 rounded-full p-0.5">
                        <span class="material-symbols-outlined text-blue-500 text-sm" style="font-variation-settings: 'FILL' 1">verified</span>
                    </span>
                    @endif
                </a>
                <div>
                    <div class="flex items-center flex-wrap gap-1">
                        <a href="{{ route('frontend.artist.show', $activity->user->id) }}" 
                           class="font-bold text-gray-900 dark:text-white hover:text-brand-green transition-colors">
                            {{ $activity->user->name }}
                        </a>
                        <span class="text-gray-500 dark:text-gray-400 text-sm">{{ $actionText }}</span>
                    </div>
                    <p class="text-xs text-gray-500 dark:text-gray-500">{{ $activity->created_at->diffForHumans() }}</p>
                </div>
            </div>
            <button class="p-2 -mt-1 -mr-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
                <span class="material-symbols-outlined text-xl">more_horiz</span>
            </button>
        </div>
        
        <!-- Activity Content/Description -->
        @if($activity->description || isset($data['message']) || isset($data['content']))
        <div class="mt-4">
            <p class="text-gray-800 dark:text-gray-200 text-base leading-relaxed">
                {{ $activity->description ?? $data['message'] ?? $data['content'] ?? '' }}
            </p>
        </div>
        @endif
        
        <!-- Subject Card (enhanced display) -->
        @if($subject)
        <div class="mt-4">
            <div class="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-750 rounded-xl p-4 border border-gray-200 dark:border-gray-600 hover:border-brand-green/50 transition-all group cursor-pointer">
                <div class="flex items-start gap-4">
                    @if($subjectImage)
                    <div class="relative flex-shrink-0">
                        <img src="{{ $subjectImage }}" 
                             alt="{{ $subjectTitle }}"
                             class="w-20 h-20 rounded-lg object-cover shadow-md group-hover:shadow-lg transition-shadow">
                        <div class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                            <span class="material-symbols-outlined text-white text-3xl">play_arrow</span>
                        </div>
                    </div>
                    @else
                    <div class="w-20 h-20 rounded-lg bg-gradient-to-br from-brand-green/20 to-brand-green/30 flex items-center justify-center flex-shrink-0">
                        <span class="material-symbols-outlined text-brand-green text-3xl">{{ $contextIcon }}</span>
                    </div>
                    @endif
                    <div class="flex-1 min-w-0">
                        <p class="font-bold text-gray-900 dark:text-white text-lg truncate group-hover:text-brand-green transition-colors">
                            {{ $subjectTitle ?? 'Activity Update' }}
                        </p>
                        @if($subjectDesc)
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {{ Str::limit($subjectDesc, 120) }}
                        </p>
                        @endif
                        
                        {{-- Show additional metadata if available --}}
                        @if(isset($subject->artist))
                        <p class="text-xs text-gray-500 dark:text-gray-500 mt-2 flex items-center gap-1">
                            <span class="material-symbols-outlined text-sm">person</span>
                            {{ $subject->artist->stage_name ?? $subject->artist->name ?? 'Unknown Artist' }}
                        </p>
                        @endif
                        
                        {{-- Stats row --}}
                        @if(isset($subject->play_count) || isset($subject->likes_count))
                        <div class="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-500">
                            @if(isset($subject->play_count))
                            <span class="flex items-center gap-1">
                                <span class="material-symbols-outlined text-sm">play_circle</span>
                                {{ number_format($subject->play_count) }} plays
                            </span>
                            @endif
                            @if(isset($subject->likes_count) && $subject->likes_count > 0)
                            <span class="flex items-center gap-1">
                                <span class="material-symbols-outlined text-sm">favorite</span>
                                {{ number_format($subject->likes_count) }}
                            </span>
                            @endif
                        </div>
                        @endif
                    </div>
                </div>
            </div>
        </div>
        @elseif(!$activity->description && !isset($data['message']))
        {{-- No subject and no description - show a contextual placeholder --}}
        <div class="mt-4 p-4 bg-gradient-to-r from-brand-green/10 to-brand-green/5 dark:from-brand-green/20 dark:to-brand-green/10 rounded-xl border border-brand-green/20">
            <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-brand-green/20 flex items-center justify-center">
                    <span class="material-symbols-outlined text-brand-green text-2xl">{{ $contextIcon }}</span>
                </div>
                <div>
                    <p class="font-semibold text-gray-900 dark:text-white">{{ $activity->user->name }}</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ $actionText }}</p>
                </div>
            </div>
        </div>
        @endif
    </div>

    <!-- Interaction Buttons -->
    <div class="flex justify-between items-center px-4 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <!-- Like Button -->
        <button class="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-all group" 
                onclick="toggleLike({{ $activity->id }})" 
                id="like-btn-{{ $activity->id }}">
            <span class="material-symbols-outlined text-gray-500 dark:text-gray-400 group-hover:text-red-500 transition-colors {{ ($activity->user_has_liked ?? false) ? 'text-red-500' : '' }}" style="{{ ($activity->user_has_liked ?? false) ? "font-variation-settings: 'FILL' 1" : '' }}">
                favorite
            </span>
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400" id="like-count-{{ $activity->id }}">{{ number_format($activity->likes_count ?? 0) }}</span>
        </button>
        
        <!-- Comment Button -->
        <button class="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-all group" 
                onclick="openComments({{ $activity->id }})">
            <span class="material-symbols-outlined text-gray-500 dark:text-gray-400 group-hover:text-blue-500 transition-colors">chat_bubble</span>
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ number_format($activity->comments_count ?? 0) }}</span>
        </button>
        
        <!-- Share Button -->
        <button class="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-all group" 
                onclick="shareActivity({{ $activity->id }})">
            <span class="material-symbols-outlined text-gray-500 dark:text-gray-400 group-hover:text-green-500 transition-colors">share</span>
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ number_format($activity->shares_count ?? 0) }}</span>
        </button>
        
        <!-- Bookmark Button -->
        <button class="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-all group" 
                onclick="toggleSave({{ $activity->id }})" 
                id="save-btn-{{ $activity->id }}">
            <span class="material-symbols-outlined text-gray-500 dark:text-gray-400 group-hover:text-brand-green transition-colors">bookmark</span>
        </button>
    </div>
</div>
