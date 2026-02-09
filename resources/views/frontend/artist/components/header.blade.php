<header class="flex items-center justify-between p-6 bg-white/50 dark:bg-black/50 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
    <!-- Navigation & Search -->
    <div class="flex items-center gap-4">
        <!-- Back/Forward Navigation -->
        <div class="flex items-center gap-2">
            <button
                onclick="history.back()"
                class="w-8 h-8 bg-gray-100 dark:bg-black/70 hover:bg-gray-200 dark:hover:bg-black rounded-full flex items-center justify-center transition-colors"
            >
                <span class="material-icons-round text-gray-600 dark:text-gray-300 text-sm">chevron_left</span>
            </button>
            <button
                onclick="history.forward()"
                class="w-8 h-8 bg-gray-100 dark:bg-black/70 hover:bg-gray-200 dark:hover:bg-black rounded-full flex items-center justify-center transition-colors"
            >
                <span class="material-icons-round text-gray-600 dark:text-gray-300 text-sm">chevron_right</span>
            </button>
        </div>

        <!-- Search -->
        <div class="relative">
            <div class="flex items-center">
                <span class="material-icons-round absolute left-3 text-gray-400 text-sm">search</span>
                <input
                    type="text"
                    placeholder="Search your music..."
                    class="w-80 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-gray-50 dark:focus:bg-gray-700 transition-colors"
                    x-data="{ query: '' }"
                    x-model="query"
                    @keyup.enter="if(query.trim()) { window.location.href = '{{ route('frontend.artist.music.index') }}?search=' + encodeURIComponent(query); }"
                >
            </div>
        </div>
    </div>

    <!-- User Menu -->
    <div class="flex items-center gap-4">
        <!-- Notifications -->
        <div class="relative" x-data="{ open: false }">
            <button
                @click="open = !open"
                class="relative w-8 h-8 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
                <span class="material-icons-round text-sm">notifications</span>
                <!-- Notification Badge -->
                @if(auth()->user()->unreadNotifications->count() > 0)
                    <span class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                        {{ auth()->user()->unreadNotifications->count() }}
                    </span>
                @endif
            </button>

            <!-- Notifications Dropdown -->
            <div
                x-show="open"
                @click.outside="open = false"
                x-transition:enter="transition ease-out duration-200"
                x-transition:enter-start="opacity-0 scale-95"
                x-transition:enter-end="opacity-100 scale-100"
                x-transition:leave="transition ease-in duration-150"
                x-transition:leave-start="opacity-100 scale-100"
                x-transition:leave-end="opacity-0 scale-95"
                class="absolute right-0 top-10 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                style="display: none;"
            >
                <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                </div>
                <div class="max-h-64 overflow-y-auto">
                    @forelse(auth()->user()->notifications()->latest()->limit(5)->get() as $notification)
                        <div class="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <p class="text-sm text-gray-900 dark:text-white">{{ $notification->data['message'] ?? 'New notification' }}</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ $notification->created_at->diffForHumans() }}</p>
                        </div>
                    @empty
                        <div class="p-4 text-center">
                            <p class="text-sm text-gray-500 dark:text-gray-400">No notifications yet</p>
                        </div>
                    @endforelse
                </div>
                <div class="p-4 border-t border-gray-200 dark:border-gray-700">
                    <a href="#" class="text-sm text-green-500 hover:text-green-400">View all notifications</a>
                </div>
            </div>
        </div>

        <!-- Upload Progress Indicator -->
        <div x-data="{ uploading: false, progress: 0 }" x-show="uploading" class="flex items-center gap-2">
            <div class="w-24 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div class="h-full bg-green-500 transition-all duration-300" :style="`width: ${progress}%`"></div>
            </div>
            <span class="text-xs text-gray-500 dark:text-gray-400" x-text="`${progress}%`"></span>
        </div>

        <!-- Dark Mode Toggle -->
        <button
            x-data="{ darkMode: localStorage.getItem('_x_darkMode_on') === 'true' }"
            @click="darkMode = !darkMode; localStorage.setItem('_x_darkMode_on', darkMode); document.documentElement.classList.toggle('dark', darkMode)"
            class="w-8 h-8 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Toggle dark mode"
        >
            <span class="material-icons-round text-sm" x-show="!darkMode">dark_mode</span>
            <span class="material-icons-round text-sm" x-show="darkMode" style="display: none;">light_mode</span>
        </button>

        <!-- Artist Profile Menu -->
        <div class="relative" x-data="{ open: false }">
            <button
                @click="open = !open"
                class="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
                <div class="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
                    @if(auth()->user()->avatar)
                        <img src="{{ auth()->user()->avatar }}" alt="Profile" class="w-full h-full object-cover">
                    @else
                        <div class="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                            <span class="material-icons-round text-sm">person</span>
                        </div>
                    @endif
                </div>
                <div class="text-left">
                    <p class="text-sm font-medium text-gray-900 dark:text-white">{{ auth()->user()->stage_name ?? auth()->user()->name }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 capitalize">{{ auth()->user()->role }}</p>
                </div>
                <span class="material-icons-round text-gray-400 text-sm">expand_more</span>
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
                class="absolute right-0 top-14 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                style="display: none;"
            >
                <div class="py-2">
                    <a
                        href="{{ route('frontend.artist.upload.create') }}"
                        class="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        <span class="material-icons-round text-sm">upload</span>
                        Quick Upload
                    </a>
                    <div class="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                    <a
                        href="{{ route('frontend.artist.dashboard') }}"
                        class="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        <span class="material-icons-round text-sm">dashboard</span>
                        Artist Dashboard
                    </a>
                    <a
                        href="{{ route('frontend.artist.profile') }}"
                        class="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        <span class="material-icons-round text-sm">person</span>
                        Profile Settings
                    </a>
                    <a
                        href="{{ route('frontend.artist.analytics') }}"
                        class="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        <span class="material-icons-round text-sm">analytics</span>
                        Analytics
                    </a>
                    <a
                        href="#"
                        class="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        <span class="material-icons-round text-sm">help</span>
                        Help Center
                    </a>
                    <div class="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                    <a
                        href="{{ route('frontend.timeline') }}"
                        class="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        <span class="material-icons-round text-sm">timeline</span>
                        Timeline
                    </a>
                    <form method="POST" action="{{ route('logout') }}">
                        @csrf
                        <button
                            type="submit"
                            class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            <span class="material-icons-round text-sm">logout</span>
                            Sign Out
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</header>