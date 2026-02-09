<aside class="hidden lg:block col-span-2 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto scrollbar-hide py-8 pr-4">
    <nav class="space-y-1">
        <a class="flex items-center space-x-3 px-3 py-2.5 rounded-lg {{ request()->routeIs('frontend.timeline') ? 'bg-green-100 dark:bg-green-900/30 text-brand-green' : 'hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors' }}" href="{{ route('frontend.timeline') }}">
            <span class="material-symbols-outlined {{ request()->routeIs('frontend.timeline') ? 'text-brand-green' : 'text-gray-500 dark:text-gray-400' }}">home</span>
            <span class="{{ request()->routeIs('frontend.timeline') ? 'font-semibold' : '' }}">Home</span>
        </a>
        <a class="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" href="{{ route('frontend.search') }}">
            <span class="material-symbols-outlined text-gray-500 dark:text-gray-400">search</span>
            <span>Search</span>
        </a>
        <a class="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" href="{{ route('frontend.artists') }}">
            <span class="material-symbols-outlined text-gray-500 dark:text-gray-400">grid_view</span>
            <span>Browse</span>
        </a>
        <a class="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" href="{{ route('frontend.trending') }}">
            <span class="material-symbols-outlined text-gray-500 dark:text-gray-400">trending_up</span>
            <span>Trending</span>
        </a>
        <a class="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" href="{{ route('frontend.timeline') }}">
            <span class="material-symbols-outlined text-gray-500 dark:text-gray-400">schedule</span>
            <span>Timeline</span>
        </a>
        <a class="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" href="{{ route('podcast.index') }}">
            <span class="material-symbols-outlined text-gray-500 dark:text-gray-400">podcasts</span>
            <span>Podcasts</span>
        </a>
        @if(config('modules.sacco.enabled', false))
        <a class="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" href="{{ route('frontend.sacco.landing') }}">
            <span class="material-symbols-outlined text-gray-500 dark:text-gray-400">savings</span>
            <span>SACCO</span>
        </a>
        @endif
        <a class="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" href="{{ route('frontend.store.index') }}">
            <span class="material-symbols-outlined text-gray-500 dark:text-gray-400">storefront</span>
            <span>Marketplace</span>
        </a>
    </nav>
    
    <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div class="flex justify-between items-center px-3 mb-2">
            <h3 class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Your Library</h3>
            @auth
            <button class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <span class="material-symbols-outlined text-xl">add</span>
            </button>
            @endauth
        </div>
        <div class="mt-3 space-y-1">
            <a class="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" href="{{ route('frontend.playlists.index') }}">
                <span class="material-symbols-outlined text-gray-500 dark:text-gray-400">queue_music</span>
                <span class="text-sm font-medium">Playlists</span>
            </a>
            @auth
            <a class="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" href="#">
                <span class="material-symbols-outlined text-gray-500 dark:text-gray-400" style="font-variation-settings: 'FILL' 1">favorite</span>
                <span class="text-sm font-medium">Liked Songs</span>
            </a>
            <a class="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" href="#">
                <span class="material-symbols-outlined text-gray-500 dark:text-gray-400">history</span>
                <span class="text-sm font-medium">Recently Played</span>
            </a>
            @endauth
        </div>
    </div>
</aside>
