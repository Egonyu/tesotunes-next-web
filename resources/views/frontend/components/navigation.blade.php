<nav class="bg-surface-primary border-b border-default sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
    <div class="w-full px-4 md:px-6">
        <div class="flex items-center justify-between h-16">
            <!-- Mobile: Hamburger + Logo -->
            <div class="flex items-center gap-3 md:gap-4">
                <!-- Mobile Hamburger (Left Side) -->
                <button
                    class="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    @click="sidebarOpen = true"
                    aria-label="Open navigation menu"
                >
                    <span class="material-icons-round icon-md text-primary">menu</span>
                </button>
                
                <!-- Logo - visible on mobile, hidden on desktop (shown in sidebar) -->
                @php
                    $siteLogo = \App\Models\Setting::get('site_logo', '/images/app-logo.svg');
                    $platformName = \App\Models\Setting::get('platform_name', 'TesoTunes');
                @endphp
                <a href="{{ route('frontend.home') }}" class="flex lg:hidden items-center">
                    <img src="{{ asset($siteLogo) }}" alt="{{ $platformName }}" class="w-10 h-10 rounded-lg object-cover shadow-lg">
                </a>
            </div>

            <!-- Search Bar -->
            <div class="hidden md:block flex-1 max-w-lg mx-8" x-data="searchBox()">
                <div class="relative">
                    <span class="material-icons-round absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary icon-sm">search</span>
                    <input
                        type="text"
                        placeholder="Search artists, songs, or genres..."
                        class="input input-search"
                        x-model="query"
                        @input.debounce.300ms="search()"
                        @focus="showResults = true"
                        @keydown.escape="showResults = false"
                    >

                    <!-- Search Results Dropdown -->
                    <div x-show="showResults && (results.songs.length > 0 || results.artists.length > 0 || query.length > 0)"
                         @click.outside="showResults = false"
                         x-transition
                         class="dropdown left-0 right-0 scrollbar-thin"
                         style="display: none;"
                         data-search-results>
                        <div x-show="loading" class="p-4 text-center text-secondary">
                            <span class="material-icons-round animate-spin">refresh</span>
                        </div>

                        <div x-show="!loading && query.length > 0">
                            <!-- Songs -->
                            <div x-show="results.songs.length > 0" class="p-2">
                                <div class="px-3 py-2 text-xs text-gray-400 font-semibold uppercase">Songs</div>
                                <template x-for="song in results.songs.slice(0, 5)" :key="song.id">
                                    <a :href="`/song/${song.id}`" class="flex items-center gap-3 p-3 hover:bg-gray-700 rounded-lg transition-colors">
                                        <div class="w-10 h-10 bg-gray-600 rounded flex items-center justify-center flex-shrink-0">
                                            <span class="material-icons-round text-gray-400 text-sm">music_note</span>
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <p class="text-white text-sm font-medium truncate" x-text="song.title"></p>
                                            <p class="text-gray-400 text-xs truncate" x-text="song.artist_name"></p>
                                        </div>
                                    </a>
                                </template>
                            </div>

                            <!-- Artists -->
                            <div x-show="results.artists.length > 0" class="p-2">
                                <div class="px-3 py-2 text-xs text-gray-400 font-semibold uppercase">Artists</div>
                                <template x-for="artist in results.artists.slice(0, 5)" :key="artist.id">
                                    <a :href="`/artist/${artist.id}`" class="flex items-center gap-3 p-3 hover:bg-gray-700 rounded-lg transition-colors">
                                        <div class="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span class="material-icons-round text-gray-400 text-sm">person</span>
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <p class="text-white text-sm font-medium truncate" x-text="artist.name"></p>
                                            <p class="text-gray-400 text-xs" x-text="`${artist.songs_count || 0} songs`"></p>
                                        </div>
                                    </a>
                                </template>
                            </div>

                            <!-- No Results -->
                            <div x-show="!loading && query.length > 2 && results.songs.length === 0 && results.artists.length === 0" class="p-6 text-center text-gray-400">
                                <span class="material-icons-round text-3xl mb-2">search_off</span>
                                <p class="text-sm">No results found for "<span x-text="query"></span>"</p>
                            </div>

                            <!-- View All Link -->
                            <div x-show="(results.songs.length > 5 || results.artists.length > 5)" class="border-t border-gray-700 p-3">
                                <a :href="`/search?q=${encodeURIComponent(query)}`" class="block text-center text-green-500 hover:text-green-400 text-sm font-medium">
                                    View all results
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Navigation Links -->
            <div class="hidden lg:flex items-center space-x-6">
                <a href="{{ route('frontend.discover') }}" class="nav-item !p-2 {{ request()->routeIs('frontend.discover') ? '!bg-transparent !text-primary font-semibold' : '' }}">
                    <span class="material-icons-round text-sm mr-1 align-middle">explore</span>
                    Discover
                </a>
                <a href="{{ route('frontend.trending') }}" class="nav-item !p-2 {{ request()->routeIs('frontend.trending') ? '!bg-transparent !text-primary font-semibold' : '' }}">
                    <span class="material-icons-round text-sm mr-1 align-middle">whatshot</span>
                    Trending
                </a>
                <a href="{{ route('frontend.timeline') }}" class="nav-item !p-2 {{ request()->routeIs('frontend.timeline') ? '!bg-transparent !text-primary font-semibold' : '' }}">
                    <span class="material-icons-round text-sm mr-1 align-middle">dynamic_feed</span>
                    Timeline
                </a>
                <a href="{{ route('frontend.artists') }}" class="nav-item !p-2 {{ request()->routeIs('frontend.artists') ? '!bg-transparent !text-primary font-semibold' : '' }}">
                    <span class="material-icons-round text-sm mr-1 align-middle">mic</span>
                    Artists
                </a>
                <a href="{{ route('frontend.genres') }}" class="nav-item !p-2 {{ request()->routeIs('frontend.genres') ? '!bg-transparent !text-primary font-semibold' : '' }}">
                    <span class="material-icons-round text-sm mr-1 align-middle">library_music</span>
                    Genres
                </a>
            </div>

            <!-- User Menu -->
            <div class="flex items-center gap-2 md:gap-3">
                <!-- Theme Toggle -->
                @include('frontend.components.theme-toggle')
                
                @auth
                    <!-- Shopping Cart Icon - Hidden on Mobile -->
                    <div class="relative hidden md:block"
                         x-data="{ cartCount: 0 }"
                         x-init="
                             // Load cart count on init
                             fetch('/api/store/cart')
                                 .then(response => response.json())
                                 .then(data => cartCount = data.count || 0)
                                 .catch(() => cartCount = 0);
                         "
                         @cart-updated.window="cartCount = $event.detail">
                        <a href="{{ route('frontend.store.cart') }}"
                           class="relative p-2 text-gray-300 hover:text-white transition-colors hover:bg-white/10 rounded-full active:scale-95">
                            <span class="material-icons-round">shopping_cart</span>
                            <span x-show="cartCount > 0"
                                  x-text="cartCount"
                                  class="absolute -top-1 -right-1 bg-green-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                            </span>
                        </a>
                    </div>

                    <!-- User is logged in -->
                    <div class="flex items-center gap-2 md:gap-3">
                        @if(auth()->user()?->role === 'artist')
                            <a
                                href="{{ route('frontend.artist.dashboard') }}"
                                class="hidden md:block text-gray-300 hover:text-white transition-colors text-sm font-medium"
                            >
                                Artist Dashboard
                            </a>
                        @endif

                        <!-- User Profile Menu -->
                        <div class="relative" x-data="{ open: false }">
                            <button
                                @click="open = !open"
                                class="flex items-center gap-1.5 md:gap-2 p-1.5 md:p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors active:scale-95"
                            >
                                <div class="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-gray-400 to-gray-600 dark:from-gray-600 dark:to-gray-800 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-brand/30 transition-all">
                                    @if(auth()->user()?->avatar)
                                        <img src="{{ Storage::url(auth()->user()->avatar) }}" alt="Profile" class="w-full h-full object-cover">
                                    @else
                                        <div class="w-full h-full flex items-center justify-center text-gray-200 dark:text-gray-300">
                                            <span class="material-icons-round text-lg">person</span>
                                        </div>
                                    @endif
                                </div>
                                <span class="hidden md:block text-primary text-sm font-medium max-w-[100px] truncate">{{ auth()->user()?->stage_name ?? auth()->user()?->name ?? 'User' }}</span>
                                <span class="hidden md:block material-icons-round text-secondary text-lg">expand_more</span>
                            </button>

                            <!-- Profile Dropdown -->
                            <div
                                x-show="open"
                                @click.outside="open = false"
                                x-transition:enter="transition ease-out duration-200"
                                x-transition:enter-start="opacity-0 scale-95"
                                x-transition:enter-end="opacity-100 scale-100"
                                x-transition:leave="transition ease-in duration-150"
                                x-transition:leave-start="opacity-100 scale-100"
                                x-transition:leave-end="opacity-0 scale-95"
                                class="absolute right-0 top-12 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50"
                                style="display: none;"
                            >
                                <div class="py-2">
                                    @if(auth()->user()?->role === 'artist')
                                        @if(auth()->user()->artist)
                                            <a
                                                href="{{ route('frontend.artist.show', auth()->user()->artist) }}"
                                                class="flex items-center gap-3 px-4 py-2 text-sm text-secondary hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <span class="material-icons-round text-sm">person</span>
                                                View Public Profile
                                            </a>
                                        @endif
                                        <a
                                            href="{{ route('frontend.artist.dashboard') }}"
                                            class="flex items-center gap-3 px-4 py-2 text-sm text-secondary hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <span class="material-icons-round text-sm">dashboard</span>
                                            Artist Dashboard
                                        </a>
                                        <div class="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                                    @endif
                                    <a
                                        href="{{ route('frontend.playlists.index') }}"
                                        class="flex items-center gap-3 px-4 py-2 text-sm text-secondary hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <span class="material-icons-round text-sm">library_music</span>
                                        My Library
                                    </a>
                                    <a
                                        href="{{ route('frontend.timeline') }}"
                                        class="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700"
                                    >
                                        <span class="material-icons-round text-sm">dynamic_feed</span>
                                        Timeline
                                    </a>
                                    <a
                                        href="{{ route('frontend.store.cart') }}"
                                        class="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700"
                                        x-data="{ cartCount: 0 }"
                                        x-init="
                                            // Load cart count on init
                                            fetch('/api/store/cart')
                                                .then(response => response.json())
                                                .then(data => cartCount = data.count || 0)
                                                .catch(() => cartCount = 0);

                                            // Listen for cart updates
                                            $watch('$store.cart.count', value => cartCount = value);
                                        "
                                        @cart-updated.window="cartCount = $event.detail"
                                    >
                                        <span class="material-icons-round text-sm">shopping_cart</span>
                                        <span>Shopping Cart</span>
                                        <span x-show="cartCount > 0"
                                              x-text="cartCount"
                                              class="ml-auto bg-green-500 text-black text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                                        </span>
                                    </a>
                                    <a
                                        href="{{ route('frontend.store.index') }}"
                                        class="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700"
                                    >
                                        <span class="material-icons-round text-sm">storefront</span>
                                        Browse Store
                                    </a>
                                    <a
                                        href="{{ route('frontend.profile.edit') }}"
                                        class="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700"
                                    >
                                        <span class="material-icons-round text-sm">settings</span>
                                        Settings
                                    </a>
                                    <div class="border-t border-gray-700 my-2"></div>
                                    <form method="POST" action="{{ route('logout') }}">
                                        @csrf
                                        <button
                                            type="submit"
                                            class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700"
                                        >
                                            <span class="material-icons-round text-sm">logout</span>
                                            Sign Out
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                @else
                    <!-- User is not logged in - Mobile Optimized -->
                    <div class="flex items-center gap-2 md:gap-3">
                        <a
                            href="{{ route('register') }}"
                            class="hidden sm:inline-flex items-center text-sm md:text-base font-semibold transition-all px-3 md:px-5 py-2 md:py-2.5 rounded-full border-2 border-gray-300 dark:border-gray-600 text-primary hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95"
                        >
                            Sign up
                        </a>
                        <a
                            href="{{ route('login') }}"
                            class="inline-flex items-center font-semibold text-sm md:text-base py-2 md:py-2.5 px-4 md:px-6 rounded-full transition-all shadow-lg active:scale-95 bg-brand text-white hover:opacity-90"
                        >
                            Log in
                        </a>
                    </div>
                @endauth

                <!-- Mobile Menu Button (removed as we have left hamburger) -->
            </div>
        </div>
    </div>

    <!-- Mobile Search - Improved Spotify Style -->
    <div class="md:hidden px-4 pb-3">
        <div class="relative" x-data="mobileSearchBox()">
            <span class="material-icons-round absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg pointer-events-none">search</span>
            <input
                type="text"
                placeholder="Artists, songs, or podcasts"
                class="w-full bg-gray-800/80 backdrop-blur-sm text-white rounded-md py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 focus:bg-gray-800 border border-gray-700/50 placeholder-gray-400"
                x-model="query"
                @input.debounce.300ms="search()"
                @focus="showResults = true"
            >
            
            <!-- Mobile Search Results -->
            <div x-show="showResults && query.length > 0"
                 @click.outside="showResults = false"
                 x-transition
                 class="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 max-h-80 overflow-y-auto z-50"
                 style="display: none;">
                <div x-show="loading" class="p-6 text-center text-gray-400">
                    <span class="material-icons-round animate-spin text-2xl">refresh</span>
                </div>
                
                <div x-show="!loading && query.length > 0">
                    <!-- Quick Results -->
                    <template x-if="results.songs.length > 0 || results.artists.length > 0">
                        <div class="p-2">
                            <template x-for="song in results.songs.slice(0, 3)" :key="song.id">
                                <a :href="`/song/${song.id}`" class="flex items-center gap-3 p-3 hover:bg-gray-700 rounded-md transition-colors active:scale-98">
                                    <div class="w-12 h-12 bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                                        <span class="material-icons-round text-gray-400">music_note</span>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-white text-sm font-medium truncate" x-text="song.title"></p>
                                        <p class="text-gray-400 text-xs truncate" x-text="song.artist_name"></p>
                                    </div>
                                </a>
                            </template>
                        </div>
                    </template>
                    
                    <!-- No Results -->
                    <div x-show="!loading && query.length > 2 && results.songs.length === 0 && results.artists.length === 0" class="p-8 text-center text-gray-400">
                        <span class="material-icons-round text-4xl mb-2 opacity-50">search_off</span>
                        <p class="text-sm">No results found</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</nav>

<script>
function searchBox() {
    return {
        query: '',
        results: {
            songs: [],
            artists: []
        },
        showResults: false,
        loading: false,

        async search() {
            if (this.query.length < 2) {
                this.results = { songs: [], artists: [] };
                return;
            }

            this.loading = true;

            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(this.query)}`, {
                    headers: {
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    this.results = {
                        songs: data.songs || [],
                        artists: data.artists || []
                    };
                }
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                this.loading = false;
            }
        }
    }
}

function mobileSearchBox() {
    return {
        query: '',
        results: {
            songs: [],
            artists: []
        },
        showResults: false,
        loading: false,

        async search() {
            if (this.query.length < 2) {
                this.results = { songs: [], artists: [] };
                return;
            }

            this.loading = true;

            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(this.query)}`, {
                    headers: {
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    this.results = {
                        songs: data.songs || [],
                        artists: data.artists || []
                    };
                }
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                this.loading = false;
            }
        }
    }
}
</script>
