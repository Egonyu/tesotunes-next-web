<!-- Infinite Scroll Timeline Feed Component -->
<div 
    x-data="timelineFeed()"
    x-init="init()"
    class="space-y-6"
>
    <!-- Create Post Box -->
    @auth
    @include('frontend.partials.create-post-box')
    @endauth

    <!-- New Posts Alert -->
    <div 
        x-show="newPostsCount > 0"
        x-transition
        @click="loadNewPosts()"
        class="text-center py-3 bg-gray-100 dark:bg-[#161B22] border-y border-gray-200 dark:border-[#30363D] text-brand-green font-semibold cursor-pointer hover:bg-gray-200 dark:hover:bg-[#21262D] transition-colors rounded-lg"
    >
        Show <span x-text="newPostsCount"></span> new <span x-text="newPostsCount === 1 ? 'post' : 'posts'"></span>
    </div>

    <!-- Feed Container -->
    <div id="timeline-feed-container">
        @foreach($activities as $activity)
            @php
                $cardType = match($activity->subject_type) {
                    'App\\Models\\Song' => 'song',
                    'App\\Models\\Album' => 'album',
                    'App\\Models\\Event' => 'event',
                    'App\\Modules\\Store\\Models\\Product' => 'product',
                    'App\\Models\\Podcast' => 'podcast',
                    'App\\Models\\PodcastEpisode' => 'podcast',
                    'App\\Models\\Poll' => 'poll',
                    'App\\Models\\LiveStream' => 'livestream',
                    'App\\Models\\Post' => 'post',
                    null => 'post',
                    default => 'default'
                };
                
                $cardView = 'frontend.partials.activity-cards.' . $cardType;
            @endphp
            
            @if(view()->exists($cardView))
                @include($cardView, ['activity' => $activity])
            @else
                @include('frontend.partials.activity-cards.default', ['activity' => $activity])
            @endif
        @endforeach
    </div>

    <!-- Loading Indicator -->
    <div 
        x-show="loading" 
        class="text-center py-8"
        x-transition
    >
        <div class="inline-flex items-center gap-3">
            <svg class="animate-spin h-8 w-8 text-brand-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-gray-400">Loading more posts...</span>
        </div>
    </div>

    <!-- Load More Button (Fallback) -->
    <div 
        x-show="hasMore && !loading" 
        class="text-center py-4"
        x-transition
    >
        <button 
            @click="loadMore()"
            class="bg-gray-100 dark:bg-[#161B22] hover:bg-gray-200 dark:hover:bg-[#21262D] text-gray-900 dark:text-white font-semibold py-3 px-8 rounded-lg border border-gray-200 dark:border-[#30363D] transition-colors"
        >
            Load More Posts
        </button>
    </div>

    <!-- End of Feed -->
    <div 
        x-show="!hasMore && !loading && page > 1" 
        class="text-center py-8 text-gray-400"
        x-transition
    >
        <span class="material-icons-round text-4xl mb-2 block opacity-50">check_circle</span>
        <p>You're all caught up!</p>
    </div>

    <!-- Infinite Scroll Trigger -->
    <div 
        x-intersect="onIntersect"
        class="h-10"
    ></div>
</div>

<script>
function timelineFeed() {
    return {
        page: 1,
        loading: false,
        hasMore: {{ $activities->hasMorePages() ? 'true' : 'false' }},
        newPostsCount: 0,
        latestActivityId: {{ $activities->first()?->id ?? 0 }},
        checkInterval: null,

        init() {
            // Check for new posts every 30 seconds
            this.checkInterval = setInterval(() => {
                this.checkForNewPosts();
            }, 30000);

            // Listen for custom events
            window.addEventListener('activity-updated', () => {
                this.checkForNewPosts();
            });
        },

        async loadMore() {
            if (this.loading || !this.hasMore) return;

            this.loading = true;
            this.page++;

            try {
                const response = await fetch(`{{ route('frontend.social.feed') }}?page=${this.page}`, {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json'
                    }
                });

                const data = await response.json();

                if (data.html) {
                    // Append new content
                    const container = document.getElementById('timeline-feed-container');
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = data.html;
                    
                    while (tempDiv.firstChild) {
                        container.appendChild(tempDiv.firstChild);
                    }

                    this.hasMore = data.hasMore;
                }
            } catch (error) {
                console.error('Error loading more posts:', error);
                this.page--; // Revert page increment on error
            } finally {
                this.loading = false;
            }
        },

        onIntersect(entries) {
            // Trigger load more when scroll trigger is visible
            const entry = entries[0];
            if (entry.isIntersecting && this.hasMore && !this.loading) {
                this.loadMore();
            }
        },

        async checkForNewPosts() {
            try {
                const response = await fetch(`{{ route('frontend.social.feed.check-new') }}?since=${this.latestActivityId}`, {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json'
                    }
                });

                const data = await response.json();
                
                if (data.count > 0) {
                    this.newPostsCount = data.count;
                }
            } catch (error) {
                console.error('Error checking for new posts:', error);
            }
        },

        async loadNewPosts() {
            this.loading = true;

            try {
                const response = await fetch(`{{ route('frontend.social.feed') }}?latest=1`, {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json'
                    }
                });

                const data = await response.json();

                if (data.html) {
                    const container = document.getElementById('timeline-feed-container');
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = data.html;
                    
                    // Prepend new content
                    while (tempDiv.lastChild) {
                        container.insertBefore(tempDiv.lastChild, container.firstChild);
                    }

                    this.latestActivityId = data.latestId;
                    this.newPostsCount = 0;

                    // Scroll to top smoothly
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            } catch (error) {
                console.error('Error loading new posts:', error);
            } finally {
                this.loading = false;
            }
        },

        destroy() {
            if (this.checkInterval) {
                clearInterval(this.checkInterval);
            }
        }
    }
}
</script>
