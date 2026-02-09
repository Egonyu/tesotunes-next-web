<aside
    x-data="{ collapsed: false }"
    :class="collapsed ? 'w-20' : 'w-72'"
    class="bg-white dark:bg-gray-900 transition-all duration-300 flex-shrink-0 border-r border-gray-200 dark:border-gray-800"
>
    <div class="p-6 h-full flex flex-col">
        <!-- Brand Logo -->
        <div class="flex items-center mb-8" :class="collapsed ? 'justify-center' : 'justify-between'">
            @php
                $siteLogo = \App\Models\Setting::get('site_logo', '/images/app-logo.svg');
                $platformName = \App\Models\Setting::get('platform_name', 'TesoTunes');
            @endphp
            <a href="{{ route('frontend.home') }}">
                <img src="{{ asset($siteLogo) }}" alt="{{ $platformName }}" class="w-10 h-10 rounded-lg">
            </a>
            <button
                @click="collapsed = !collapsed"
                class="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                x-show="!collapsed"
            >
                <span class="material-icons-round">menu</span>
            </button>
        </div>

        <!-- Navigation Menu -->
        <nav class="flex-1 space-y-2">
            <!-- Main Navigation -->
            <div class="space-y-1">
                <a
                    href="{{ route('frontend.artist.dashboard') }}"
                    class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                           {{ request()->routeIs('frontend.artist.dashboard*') ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800' }}"
                >
                    <span class="material-icons-round">dashboard</span>
                    <span x-show="!collapsed">Dashboard</span>
                </a>

                <a
                    href="{{ route('frontend.artist.music.index') }}"
                    class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                           {{ request()->routeIs('frontend.artist.music*') ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800' }}"
                >
                    <span class="material-icons-round">library_music</span>
                    <span x-show="!collapsed">My Music</span>
                </a>

                <a
                    href="{{ route('frontend.artist.analytics') }}"
                    class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                           {{ request()->routeIs('frontend.artist.analytics*') ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800' }}"
                >
                    <span class="material-icons-round">analytics</span>
                    <span x-show="!collapsed">Analytics</span>
                </a>

                <a
                    href="{{ route('frontend.artist.profile') }}"
                    class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                           {{ request()->routeIs('frontend.artist.profile*') ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800' }}"
                >
                    <span class="material-icons-round">person</span>
                    <span x-show="!collapsed">Profile</span>
                </a>
            </div>

            <!-- Library Section -->
            <div x-show="!collapsed" class="pt-6">
                <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
                    </div>

                    <div class="space-y-2">
                        <a
                            href="{{ route('frontend.artist.upload.index') }}"
                            class="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium text-white transition-colors"
                        >
                            <span class="material-icons-round text-sm">cloud_upload</span>
                            Upload Music
                        </a>

                        <a
                            href="{{ route('frontend.artist.music.upload') }}"
                            class="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white transition-colors"
                        >
                            <span class="material-icons-round text-sm">album</span>
                            Create Album
                        </a>

                        <a
                            href="{{ route('frontend.artist.business.dashboard') }}"
                            class="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors"
                        >
                            <span class="material-icons-round text-sm">payments</span>
                            Business Hub
                        </a>

                        <a
                            href="{{ route('frontend.artist.rights.index') }}"
                            class="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors"
                        >
                            <span class="material-icons-round text-sm">shield</span>
                            Rights & Royalties
                        </a>
                    </div>
                </div>

                <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                    <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">Recent Uploads</h3>
                    <div class="space-y-2">
                        @forelse(auth()->user()->songs()->latest()->limit(3)->get() as $track)
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                                    <span class="material-icons-round text-xs text-gray-500 dark:text-gray-400">music_note</span>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="text-xs font-medium text-gray-900 dark:text-white truncate">{{ $track->title }}</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ $track->created_at->diffForHumans() }}</p>
                                </div>
                            </div>
                        @empty
                            <p class="text-xs text-gray-500 dark:text-gray-400">No tracks uploaded yet</p>
                        @endforelse
                    </div>
                </div>
            </div>
        </nav>

        <!-- Bottom Actions -->
        <div class="pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
                @click="collapsed = !collapsed"
                x-show="collapsed"
                class="w-full flex items-center justify-center p-3 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
                <span class="material-icons-round">menu_open</span>
            </button>

            <div x-show="!collapsed" class="space-y-2">
                <a
                    href="{{ route('frontend.dashboard') }}"
                    class="flex items-center gap-3 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <span class="material-icons-round text-sm">home</span>
                    Back to Home
                </a>

                <form method="POST" action="{{ route('logout') }}">
                    @csrf
                    <button
                        type="submit"
                        class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <span class="material-icons-round text-sm">logout</span>
                        Sign Out
                    </button>
                </form>
            </div>
        </div>
    </div>
</aside>