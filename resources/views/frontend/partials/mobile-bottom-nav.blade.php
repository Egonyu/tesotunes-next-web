<!-- Mobile Bottom Navigation Bar (Shows on mobile/tablet only) -->
<!-- Hides when music player is visible -->
<nav x-data="{ 
        playerVisible: false,
        moreMenuOpen: false 
     }" 
     @player-visible.window="playerVisible = true"
     @player-hidden.window="playerVisible = false"
     @keydown.escape.window="moreMenuOpen = false"
     :class="{ 'translate-y-full': playerVisible }"
     class="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-30 safe-area-bottom transition-transform duration-300">
    
    <!-- More Menu Drawer -->
    <div x-show="moreMenuOpen" 
         x-transition:enter="transition ease-out duration-200"
         x-transition:enter-start="opacity-0 translate-y-4"
         x-transition:enter-end="opacity-100 translate-y-0"
         x-transition:leave="transition ease-in duration-150"
         x-transition:leave-start="opacity-100 translate-y-0"
         x-transition:leave-end="opacity-0 translate-y-4"
         @click.away="moreMenuOpen = false"
         class="absolute bottom-full left-0 right-0 bg-white dark:bg-gray-900 border-t border-x border-gray-200 dark:border-gray-700 rounded-t-2xl shadow-2xl max-h-[70vh] overflow-y-auto">
        
        <!-- Drawer Handle -->
        <div class="flex justify-center py-2">
            <div class="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>
        
        <!-- User Profile Section -->
        @auth
        <div class="px-4 pb-3 border-b border-gray-100 dark:border-gray-800">
            <a href="{{ route('frontend.profile.show', auth()->user()->username) }}" 
               @click="moreMenuOpen = false"
               class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <img src="{{ auth()->user()->avatar_url }}" alt="Profile" class="w-12 h-12 rounded-full object-cover ring-2 ring-brand-green/30">
                <div class="flex-1 min-w-0">
                    <p class="font-bold text-gray-900 dark:text-white truncate">{{ auth()->user()->display_name }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400 truncate">{{ '@' . auth()->user()->username }}</p>
                </div>
                <span class="material-symbols-outlined text-gray-400">chevron_right</span>
            </a>
        </div>
        @endauth
        
        <!-- Quick Links Grid -->
        <div class="p-4">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Discover</p>
            <div class="grid grid-cols-4 gap-2">
                <a href="{{ route('ojokotau.index') }}" @click="moreMenuOpen = false" class="flex flex-col items-center p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <span class="material-symbols-outlined text-2xl text-pink-500">volunteer_activism</span>
                    <span class="text-xs mt-1 text-gray-700 dark:text-gray-300 font-medium">Ojokotau</span>
                </a>
                <a href="{{ route('forum.index') }}" @click="moreMenuOpen = false" class="flex flex-col items-center p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <span class="material-symbols-outlined text-2xl text-blue-500">forum</span>
                    <span class="text-xs mt-1 text-gray-700 dark:text-gray-300 font-medium">Forum</span>
                </a>
                <a href="{{ route('frontend.awards.index') }}" @click="moreMenuOpen = false" class="flex flex-col items-center p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <span class="material-symbols-outlined text-2xl text-yellow-500">emoji_events</span>
                    <span class="text-xs mt-1 text-gray-700 dark:text-gray-300 font-medium">Awards</span>
                </a>
                <a href="{{ route('podcast.index') }}" @click="moreMenuOpen = false" class="flex flex-col items-center p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <span class="material-symbols-outlined text-2xl text-purple-500">podcasts</span>
                    <span class="text-xs mt-1 text-gray-700 dark:text-gray-300 font-medium">Podcasts</span>
                </a>
            </div>
        </div>
        
        <!-- Features List -->
        <div class="px-4 pb-4">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Features</p>
            <div class="space-y-1">
                <a href="{{ route('frontend.events.index') }}" @click="moreMenuOpen = false" class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <span class="material-symbols-outlined text-xl text-orange-500">event</span>
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Events</span>
                </a>
                <a href="{{ route('frontend.sacco.landing') }}" @click="moreMenuOpen = false" class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <span class="material-symbols-outlined text-xl text-green-500">savings</span>
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">SACCO</span>
                </a>
                <a href="{{ route('frontend.trending') }}" @click="moreMenuOpen = false" class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <span class="material-symbols-outlined text-xl text-red-500">leaderboard</span>
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Trending</span>
                </a>
                <a href="{{ route('frontend.genres') }}" @click="moreMenuOpen = false" class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <span class="material-symbols-outlined text-xl text-indigo-500">category</span>
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Genres</span>
                </a>
            </div>
        </div>
        
        @auth
        <!-- Account Section -->
        <div class="px-4 pb-4 border-t border-gray-100 dark:border-gray-800 pt-4">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Account</p>
            <div class="space-y-1">
                <a href="{{ route('frontend.dashboard') }}" @click="moreMenuOpen = false" class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <span class="material-symbols-outlined text-xl text-gray-500">dashboard</span>
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Dashboard</span>
                </a>
                <a href="{{ route('frontend.credits.index') }}" @click="moreMenuOpen = false" class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <span class="material-symbols-outlined text-xl text-amber-500">monetization_on</span>
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Credits</span>
                    <span class="ml-auto text-xs font-bold text-brand-green">{{ number_format(auth()->user()->credits_balance ?? 0) }}</span>
                </a>
                <a href="{{ route('frontend.notifications.index') }}" @click="moreMenuOpen = false" class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <span class="material-symbols-outlined text-xl text-blue-500">notifications</span>
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Notifications</span>
                </a>
                <a href="{{ route('frontend.profile.settings') }}" @click="moreMenuOpen = false" class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <span class="material-symbols-outlined text-xl text-gray-500">settings</span>
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Settings</span>
                </a>
            </div>
        </div>
        @else
        <!-- Guest Actions -->
        <div class="px-4 pb-4 border-t border-gray-100 dark:border-gray-800 pt-4">
            <div class="flex gap-3">
                <a href="{{ route('login') }}" class="flex-1 py-3 text-center font-bold text-brand-green border border-brand-green rounded-xl hover:bg-brand-green/10 transition-colors">
                    Sign In
                </a>
                <a href="{{ route('register') }}" class="flex-1 py-3 text-center font-bold text-white bg-brand-green rounded-xl hover:bg-green-600 transition-colors">
                    Sign Up
                </a>
            </div>
        </div>
        @endauth
    </div>
    
    <div class="flex justify-around items-center h-16 px-2">
        <!-- Home -->
        <a href="https://tesotunes.com" 
           class="flex flex-col items-center justify-center flex-1 py-2 {{ request()->is('/') || request()->routeIs('frontend.home') ? 'text-brand-green' : 'text-gray-600 dark:text-gray-400' }} transition-colors">
            <span class="material-symbols-outlined text-2xl">home</span>
            <span class="text-xs mt-0.5 font-medium">Home</span>
        </a>
        
        <!-- Explore/Music -->
        <a href="{{ route('frontend.edula') }}" 
           class="flex flex-col items-center justify-center flex-1 py-2 {{ request()->routeIs('frontend.edula') ? 'text-brand-green' : 'text-gray-600 dark:text-gray-400' }} transition-colors">
            <span class="material-symbols-outlined text-2xl">explore</span>
            <span class="text-xs mt-0.5 font-medium">Explore</span>
        </a>
        
        <!-- Artists -->
        <a href="{{ route('frontend.artists') }}" 
           class="flex flex-col items-center justify-center flex-1 py-2 {{ request()->routeIs('frontend.artists*') ? 'text-brand-green' : 'text-gray-600 dark:text-gray-400' }} transition-colors">
            <span class="material-symbols-outlined text-2xl">mic_external_on</span>
            <span class="text-xs mt-0.5 font-medium">Artists</span>
        </a>
        
        <!-- Store -->
        <a href="{{ route('frontend.store.index') }}" 
           class="flex flex-col items-center justify-center flex-1 py-2 {{ request()->routeIs('frontend.store*') ? 'text-brand-green' : 'text-gray-600 dark:text-gray-400' }} transition-colors">
            <span class="material-symbols-outlined text-2xl">storefront</span>
            <span class="text-xs mt-0.5 font-medium">Store</span>
        </a>
        
        <!-- More Menu -->
        <button @click="moreMenuOpen = !moreMenuOpen" 
                :class="moreMenuOpen ? 'text-brand-green' : 'text-gray-600 dark:text-gray-400'"
                class="flex flex-col items-center justify-center flex-1 py-2 transition-colors">
            <span class="material-symbols-outlined text-2xl" x-text="moreMenuOpen ? 'close' : 'menu'">menu</span>
            <span class="text-xs mt-0.5 font-medium">More</span>
        </button>
    </div>
</nav>

<!-- Bottom spacing for mobile (prevents content from being hidden behind nav) -->
<div class="lg:hidden h-16"></div>

<style>
/* Safe area for devices with notches/home indicators */
.safe-area-bottom {
    padding-bottom: env(safe-area-inset-bottom);
}

/* Prevent tap highlight on mobile */
nav a, nav button {
    -webkit-tap-highlight-color: transparent;
}

/* Smooth transitions */
nav a span, nav button span {
    transition: all 0.2s ease;
}

/* Active state animation */
nav a.text-brand-green span.material-symbols-outlined {
    font-variation-settings: 'FILL' 1;
}
</style>
