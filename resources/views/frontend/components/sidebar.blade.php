<!-- Spotify-like Sidebar -->
<div class="w-full h-full flex flex-col bg-surface-primary">
    <!-- Logo Section - Hidden on mobile (shown in nav), visible on desktop -->
    <div class="hidden lg:flex items-center p-6 border-b border-default">
        @php
            $siteLogo = \App\Models\Setting::get('site_logo', '/images/app-logo.svg');
            $platformName = \App\Models\Setting::get('platform_name', 'TesoTunes');
        @endphp
        <a href="{{ route('frontend.home') }}">
            <img src="{{ asset($siteLogo) }}" alt="{{ $platformName }}" class="w-10 h-10 rounded-lg object-cover shadow-lg">
        </a>
    </div>

    <!-- Main Navigation -->
    <nav class="flex-1 px-2 lg:px-3 py-4 overflow-y-auto scrollbar-thin">
        <div class="space-y-1">
            <!-- Home -->
            <a href="{{ route('frontend.home') }}"
               class="nav-item {{ request()->routeIs('frontend.home') ? 'active' : '' }}">
                <span class="material-icons-round icon-md">home</span>
                <span class="font-medium">Home</span>
            </a>

            <!-- Search -->
            <a href="{{ route('frontend.search') }}"
               class="nav-item {{ request()->routeIs('frontend.search') ? 'active' : '' }}">
                <span class="material-icons-round icon-md">search</span>
                <span class="font-medium">Search</span>
            </a>

            <!-- Browse Music -->
            <a href="{{ route('frontend.discover') }}"
               class="nav-item {{ request()->routeIs('frontend.discover') ? 'active' : '' }}">
                <span class="material-icons-round icon-md">explore</span>
                <span class="font-medium">Discover</span>
            </a>

            <!-- Trending Charts -->
            <a href="{{ route('frontend.trending') }}"
               class="nav-item {{ request()->routeIs('frontend.trending') ? 'active' : '' }}">
                <span class="material-icons-round icon-md">whatshot</span>
                <span class="font-medium">Trending</span>
            </a>

            <!-- Edula / Community Hub (Public - All Users) -->
            <a href="{{ route('frontend.edula') }}"
               class="nav-item {{ request()->routeIs('frontend.edula') ? 'active' : '' }}">
                <span class="material-icons-round icon-md">hub</span>
                <span class="font-medium">Edula</span>
            </a>

            <!-- Community Forum -->
            @if(\App\Models\Setting::get('forums_enabled', false))
            <a href="{{ route('forum.index') }}"
               class="nav-item {{ request()->routeIs('forum.*') ? 'active' : '' }}">
                <span class="material-icons-round icon-md">forum</span>
                <span class="font-medium">Forum</span>
            </a>
            @endif

            <!-- Polls -->
            @if(\App\Models\Setting::get('polls_enabled', false))
            <a href="{{ route('polls.index') }}"
               class="nav-item {{ request()->routeIs('polls.*') ? 'active' : '' }}">
                <span class="material-icons-round icon-md">poll</span>
                <span class="font-medium">Polls</span>
            </a>
            @endif

            <!-- SACCO -->
            @if(config('sacco.enabled', false))
            <a href="{{ auth()->check() && auth()->user()->isSaccoMember() ? route('sacco.dashboard') : route('frontend.sacco.landing') }}"
               class="nav-item {{ request()->routeIs('sacco.*') ? 'active' : '' }}">
                <span class="material-icons-round icon-md">account_balance</span>
                <span class="font-medium">SACCO</span>
                @auth
                    @if(!auth()->user()->isSaccoMember())
                        <span class="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Join</span>
                    @endif
                @endauth
            </a>
            @endif

            <!-- Marketplace -->
            @if(\App\Models\Setting::get('store_enabled', true))
            <a href="{{ route('frontend.store.index') }}"
               class="nav-item {{ request()->routeIs('frontend.store.*') ? 'active' : '' }}">
                <span class="material-icons-round icon-md">store</span>
                <span class="font-medium">Marketplace</span>
            </a>
            @endif

            <!-- Ojokotau / Community Support -->
            @if(config('ojokotau.enabled', true))
            <a href="{{ route('ojokotau.index') }}"
               class="nav-item {{ request()->routeIs('ojokotau.*') ? 'active' : '' }}">
                <span class="material-icons-round icon-md">volunteer_activism</span>
                <span class="font-medium">Ojokotau</span>
                @php
                    $urgentCampaignsCount = \App\Modules\Ojokotau\Models\Campaign::active()->where('urgency', 'critical')->count();
                @endphp
                @if($urgentCampaignsCount > 0)
                    <span class="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">{{ $urgentCampaignsCount }}</span>
                @endif
            </a>
            @endif
        </div>

        @auth
        <!-- Library Section -->
        <div class="mt-8">
            <div class="flex items-center justify-between px-3 mb-3">
                <h3 class="text-gray-400 text-sm font-semibold uppercase tracking-wider">Your Library</h3>
                <button class="text-gray-400 hover:text-white transition-colors p-1" aria-label="Add to library">
                    <span class="material-icons-round text-lg">add</span>
                </button>
            </div>

            <div class="space-y-1">
                <!-- Playlists -->
                @playlistsEnabled
                <a href="{{ route('frontend.playlists.index') }}"
                   class="nav-item {{ request()->routeIs('frontend.playlists.*') ? 'active' : '' }}">
                    <span class="material-icons-round icon-md">queue_music</span>
                    <span class="font-medium">Playlists</span>
                </a>
                @endplaylistsEnabled

                <!-- Liked Songs -->
                @musicStreamingEnabled
                <a href="{{ route('frontend.player.library') }}"
                   class="nav-item {{ request()->routeIs('frontend.player.library') ? 'active' : '' }}">
                    <div class="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center">
                        <span class="material-icons-round text-white text-sm">favorite</span>
                    </div>
                    <span class="font-medium">Liked Songs</span>
                </a>
                @endmusicStreamingEnabled

                <!-- Recently Played -->
                @musicStreamingEnabled
                <a href="{{ route('frontend.player.history') }}"
                   class="nav-item {{ request()->routeIs('frontend.player.history') ? 'active' : '' }}">
                    <span class="material-icons-round icon-md">history</span>
                    <span class="font-medium">Recently Played</span>
                </a>
                @endmusicStreamingEnabled

                <!-- Downloads -->
                @musicDownloadsEnabled
                <a href="{{ route('frontend.player.downloads') }}"
                   class="nav-item {{ request()->routeIs('frontend.player.downloads') ? 'active' : '' }}">
                    <span class="material-icons-round icon-md">download</span>
                    <span class="font-medium">Downloaded</span>
                </a>
                @endmusicDownloadsEnabled

                <!-- My Tickets -->
                @eventsEnabled
                @ticketsEnabled
                <a href="{{ route('frontend.events.my-tickets') }}"
                   class="nav-item {{ request()->routeIs('frontend.events.my-tickets') ? 'active' : '' }}">
                    <span class="material-icons-round icon-md">confirmation_number</span>
                    <span class="font-medium">My Tickets</span>
                </a>
                @endticketsEnabled
                @endeventsEnabled

                <!-- My Podcasts -->
                @if(config('modules.podcast.enabled', true))
                <a href="{{ route('podcast.my.index') }}"
                   class="nav-item {{ request()->routeIs('podcast.my.*') ? 'active' : '' }}">
                    <span class="material-icons-round icon-md">podcasts</span>
                    <span class="font-medium">My Podcasts</span>
                </a>
                @endif

                <!-- My Store (Artists Only) -->
                @if(\App\Models\Setting::get('store_enabled', true) && auth()->user()?->role === 'artist')
                <a href="{{ route('frontend.store.my-stores') }}"
                   class="nav-item {{ request()->routeIs('frontend.store.my-stores') || request()->routeIs('frontend.store.dashboard') ? 'active' : '' }}">
                    <span class="material-icons-round icon-md">storefront</span>
                    <span class="font-medium">My Store</span>
                    @php
                        $hasStore = auth()->user()?->hasStore() ?? false;
                    @endphp
                    @if(!$hasStore)
                        <span class="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">New</span>
                    @endif
                </a>
                @endif
            </div>
        </div>

        <!-- More Section -->
        <div class="mt-8">
            <div class="px-3 mb-3">
                <h3 class="text-gray-400 text-sm font-semibold uppercase tracking-wider">More</h3>
            </div>

            <div class="space-y-1">
                <!-- Artists -->
                <a href="{{ route('frontend.artists') }}"
                   class="nav-item {{ request()->routeIs('frontend.artists') ? 'active' : '' }}">
                    <span class="material-icons-round icon-md">person</span>
                    <span class="font-medium">Artists</span>
                </a>

                <!-- Genres -->
                <a href="{{ route('frontend.genres') }}"
                   class="nav-item {{ request()->routeIs('frontend.genres') ? 'active' : '' }}">
                    <span class="material-icons-round icon-md">library_music</span>
                    <span class="font-medium">Genres</span>
                </a>

                <!-- Events -->
                @eventsEnabled
                <a href="{{ route('frontend.events.index') }}"
                   class="nav-item {{ request()->routeIs('frontend.events.*') ? 'active' : '' }}">
                    <span class="material-icons-round icon-md">event</span>
                    <span class="font-medium">Events</span>
                </a>
                @endeventsEnabled

                <!-- Awards -->
                @awardsEnabled
                <a href="{{ route('frontend.awards.index') }}"
                   class="nav-item {{ request()->routeIs('frontend.awards.*') ? 'active' : '' }}">
                    <span class="material-icons-round icon-md">emoji_events</span>
                    <span class="font-medium">Awards</span>
                </a>
                @endawardsEnabled

                <!-- Marketplace -->
                @if(\App\Models\Setting::get('store_enabled', true))
                <a href="{{ route('frontend.store.index') }}"
                   class="nav-item {{ request()->routeIs('frontend.store.index') || request()->routeIs('frontend.store.show') || request()->routeIs('frontend.store.products.*') ? 'active' : '' }}">
                    <span class="material-icons-round text-xl group-hover:scale-110 transition-transform duration-200">store</span>
                    <span class="font-medium">Marketplace</span>
                    <span class="ml-auto text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">NEW</span>
                </a>
                @endif
            </div>
        </div>

        @if(auth()->user()?->role === 'artist')
        <!-- Artist Tools -->
        <div class="mt-8">
            <div class="px-3 mb-3">
                <h3 class="text-gray-400 text-sm font-semibold uppercase tracking-wider">Artist</h3>
            </div>

            <div class="space-y-1">
                <!-- Artist Dashboard -->
                <a href="{{ route('frontend.artist.dashboard') }}"
                   class="nav-item {{ request()->routeIs('frontend.artist.dashboard') ? 'active' : '' }}">
                    <span class="material-icons-round icon-md">dashboard</span>
                    <span class="font-medium">Dashboard</span>
                </a>

                <!-- Upload Music -->
                <a href="{{ route('frontend.artist.upload.index') }}"
                   class="nav-item {{ request()->routeIs('frontend.artist.upload.*') ? 'active' : '' }}">
                    <span class="material-icons-round icon-md">cloud_upload</span>
                    <span class="font-medium">Upload</span>
                </a>

                <!-- Analytics -->
                <a href="{{ route('frontend.artist.analytics') }}"
                   class="nav-item {{ request()->routeIs('frontend.artist.analytics') ? 'active' : '' }}">
                    <span class="material-icons-round icon-md">analytics</span>
                    <span class="font-medium">Analytics</span>
                </a>
            </div>
        </div>
        @endif
        @endauth
    </nav>

    <!-- Footer Content Section -->
    <div class="mt-auto border-t border-gray-800">
        <!-- Footer Links -->
        <div class="p-3 space-y-3">
            <div class="grid grid-cols-2 gap-2 text-xs">
                <div class="space-y-2">
                    <a href="#" class="block text-gray-400 hover:text-white transition-colors">Legal</a>
                    <a href="#" class="block text-gray-400 hover:text-white transition-colors">Privacy Center</a>
                    <a href="#" class="block text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
                </div>
                <div class="space-y-2">
                    <a href="#" class="block text-gray-400 hover:text-white transition-colors">Cookies</a>
                    <a href="#" class="block text-gray-400 hover:text-white transition-colors">About Ads</a>
                    <a href="#" class="block text-gray-400 hover:text-white transition-colors">Accessibility</a>
                </div>
            </div>

            <!-- Social Links -->
            <div class="flex items-center gap-3 pt-2">
                <a href="#" class="text-gray-400 hover:text-white transition-colors">
                    <span class="material-icons-round text-sm">facebook</span>
                </a>
                <a href="#" class="text-gray-400 hover:text-white transition-colors">
                    <span class="text-sm">𝕏</span>
                </a>
                <a href="#" class="text-gray-400 hover:text-white transition-colors">
                    <span class="material-icons-round text-sm">video_library</span>
                </a>
                <a href="#" class="text-gray-400 hover:text-white transition-colors">
                    <span class="material-icons-round text-sm">camera_alt</span>
                </a>
            </div>

            <!-- Language -->
            <div class="flex items-center gap-2 text-xs text-gray-400 pt-2">
                <span class="material-icons-round text-sm">language</span>
                <span>English</span>
            </div>
        </div>

        @auth
        <!-- User Profile Section -->
        <div class="p-3 border-t border-gray-800">
            <div x-data="{ open: false }" class="relative">
                <button @click="open = !open"
                        class="flex items-center gap-3 p-3 w-full hover:bg-gray-800 rounded-md transition-colors group">
                    <div class="w-8 h-8 bg-gray-600 rounded-full overflow-hidden flex-shrink-0">
                        @if(auth()->user()?->avatar)
                            <img src="{{ Storage::url(auth()->user()->avatar) }}" alt="Profile" class="w-full h-full object-cover">
                        @else
                            <div class="w-full h-full flex items-center justify-center text-gray-400">
                                <span class="material-icons-round text-sm">person</span>
                            </div>
                        @endif
                    </div>
                    <div class="flex-1 text-left">
                        <div class="text-white text-sm font-medium truncate">{{ auth()->user()?->stage_name ?? auth()->user()?->name ?? 'User' }}</div>
                        <div class="text-gray-400 text-xs truncate">{{ auth()->user()?->email }}</div>
                    </div>
                    <span class="material-icons-round text-gray-400 text-sm group-hover:text-white">expand_more</span>
                </button>

                <!-- Profile Dropdown -->
                <div x-show="open"
                     @click.outside="open = false"
                     x-transition:enter="transition ease-out duration-200"
                     x-transition:enter-start="opacity-0 scale-95"
                     x-transition:enter-end="opacity-100 scale-100"
                     x-transition:leave="transition ease-in duration-150"
                     x-transition:leave-start="opacity-100 scale-100"
                     x-transition:leave-end="opacity-0 scale-95"
                     class="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50"
                     style="display: none;">
                    <div class="py-2">
                        <a href="{{ route('frontend.profile.show') }}"
                           class="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700">
                            <span class="material-icons-round text-sm">person</span>
                            Profile
                        </a>
                        <a href="{{ route('frontend.profile.settings') }}"
                           class="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700">
                            <span class="material-icons-round text-sm">settings</span>
                            Settings
                        </a>
                        <div class="border-t border-gray-700 my-2"></div>
                        <form method="POST" action="{{ route('logout') }}">
                            @csrf
                            <button type="submit"
                                    class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700">
                                <span class="material-icons-round text-sm">logout</span>
                                Sign Out
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        @else
        <!-- Guest User Section -->
        <div class="p-3 border-t border-gray-800 space-y-2">
            <a href="{{ route('login') }}"
               class="block w-full text-center bg-white text-black font-medium py-2 px-4 rounded-full hover:bg-gray-100 transition-colors">
                Log in
            </a>
            <a href="{{ route('register') }}"
               class="block w-full text-center border border-gray-600 text-white font-medium py-2 px-4 rounded-full hover:bg-gray-800 transition-colors">
                Sign up
            </a>
        </div>
        @endauth
    </div>
