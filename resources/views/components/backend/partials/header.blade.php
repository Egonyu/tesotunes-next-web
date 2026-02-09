<!-- Enhanced Backend Header -->
<nav class="header print:hidden">
    <div class="header-container relative flex w-full bg-white shadow-lg shadow-slate-700/10 dark:bg-navy-750 dark:shadow-navy-900/20">
        <div class="flex w-full items-center justify-between px-4 lg:px-6">

            <!-- Left: Menu Toggle + Title -->
            <div class="flex items-center gap-4">
                <!-- Mobile Menu Toggle -->
                <button class="menu-toggle flex size-8 flex-col justify-center space-y-1.5 text-primary outline-hidden focus:outline-none dark:text-accent-light lg:hidden"
                    :class="$store.sidebar.isSidebarExpanded && 'active'"
                    @click="$store.sidebar.isSidebarExpanded = !$store.sidebar.isSidebarExpanded">
                    <span class="h-0.5 w-5 bg-current transition-all duration-300"></span>
                    <span class="h-0.5 w-5 bg-current transition-all duration-300"></span>
                    <span class="h-0.5 w-5 bg-current transition-all duration-300"></span>
                </button>

                <!-- Page Title -->
                <div class="hidden h-full flex-col justify-center lg:flex">
                    <h2 class="text-xl font-semibold text-slate-800 dark:text-navy-50">
                        {{ $title ?? 'Admin Dashboard' }}
                    </h2>
                    @if(isset($subtitle))
                        <p class="text-xs text-slate-400 dark:text-navy-300">{{ $subtitle }}</p>
                    @endif
                </div>
            </div>

            <!-- Right: Actions -->
            <div class="flex items-center gap-2">

                <!-- Quick Stats -->
                <div class="hidden items-center gap-3 lg:flex">
                    <!-- Pending Items Badge -->
                    @php
                        $pendingCount = \App\Models\Song::where('status', 'pending')->count() +
                                       \App\Models\Artist::where('is_verified', false)->where('status', 'pending')->count();
                    @endphp
                    @if($pendingCount > 0)
                        <a href="{{ route('admin.music.songs.index', ['status' => 'pending']) }}" 
                           class="flex items-center gap-2 rounded-full bg-warning/10 px-3 py-1.5 text-warning hover:bg-warning/20 transition">
                            <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span class="text-xs font-medium">{{ $pendingCount }} Pending</span>
                        </a>
                    @endif

                    <!-- Active Users -->
                    @php
                        $activeNow = \App\Models\User::where('last_login_at', '>=', now()->subMinutes(15))->count();
                    @endphp
                    <div class="flex items-center gap-2 text-slate-500 dark:text-navy-300">
                        <div class="relative">
                            <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <span class="absolute -top-0.5 -right-0.5 size-2 bg-success rounded-full animate-pulse"></span>
                        </div>
                        <span class="text-xs font-medium">{{ $activeNow }} Online</span>
                    </div>
                </div>

                <div class="h-6 w-px bg-slate-200 dark:bg-navy-600 hidden lg:block"></div>

                <!-- Global Search -->
                <div class="flex" x-data="{ showSearch: false }">
                    <button @click="showSearch = !showSearch" 
                            class="btn size-9 rounded-full p-0 hover:bg-slate-200 dark:hover:bg-navy-600 transition">
                        <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>

                    <!-- Search Modal -->
                    <div x-show="showSearch" 
                         x-transition.opacity 
                         @click.away="showSearch = false"
                         class="fixed inset-0 z-[100] flex items-start justify-center bg-slate-900/60 backdrop-blur-sm pt-20">
                        <div class="w-full max-w-2xl mx-4" @click.stop>
                            <div class="bg-white dark:bg-navy-700 rounded-xl shadow-2xl overflow-hidden">
                                <form action="{{ route('admin.users.index') }}" method="GET" class="p-4">
                                    <div class="flex items-center gap-3">
                                        <svg class="size-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <input name="q" 
                                               type="text" 
                                               placeholder="Search users, artists, tracks..." 
                                               class="flex-1 bg-transparent border-0 text-lg focus:ring-0 text-slate-800 dark:text-navy-50 placeholder-slate-400"
                                               autofocus>
                                        <button type="submit" class="btn bg-primary text-white px-6">Search</button>
                                    </div>
                                </form>
                                <div class="border-t border-slate-200 dark:border-navy-600 p-3">
                                    <p class="text-xs text-slate-400 dark:text-navy-300">
                                        <kbd class="px-2 py-1 bg-slate-100 dark:bg-navy-600 rounded">Ctrl</kbd> + 
                                        <kbd class="px-2 py-1 bg-slate-100 dark:bg-navy-600 rounded">K</kbd> 
                                        for quick search
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Real-time Notifications -->
                @php
                    $notifications = auth()->user()->notifications()->latest()->take(10)->get();
                    $unreadCount = auth()->user()->unreadNotifications->count();
                @endphp
                <div class="flex" x-data="usePopper({ placement: 'bottom-end', offset: 8 })" @click.outside="isShowPopper && (isShowPopper = false)">
                    <button @click="isShowPopper = !isShowPopper" 
                            x-ref="popperRef"
                            class="btn relative size-9 rounded-full p-0 hover:bg-slate-200 dark:hover:bg-navy-600 transition">
                        <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        @if($unreadCount > 0)
                            <span class="absolute -top-1 -right-1 flex items-center justify-center size-5 bg-error text-white text-xs font-bold rounded-full">
                                {{ $unreadCount > 9 ? '9+' : $unreadCount }}
                            </span>
                        @endif
                    </button>

                    <div :class="isShowPopper && 'show'" class="popper-root" x-ref="popperRoot">
                        <div class="popper-box w-96 rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-navy-600 dark:bg-navy-700">
                            <!-- Header -->
                            <div class="flex items-center justify-between border-b border-slate-200 dark:border-navy-600 p-4">
                                <div class="flex items-center gap-2">
                                    <h3 class="font-semibold text-slate-800 dark:text-navy-50">Notifications</h3>
                                    @if($unreadCount > 0)
                                        <span class="flex items-center justify-center size-6 bg-error text-white text-xs font-bold rounded-full">
                                            {{ $unreadCount }}
                                        </span>
                                    @endif
                                </div>
                                @if($unreadCount > 0)
                                    <button onclick="markAllAsRead()" class="text-xs text-primary hover:underline">
                                        Mark all read
                                    </button>
                                @endif
                            </div>

                            <!-- Notifications List -->
                            <div class="max-h-96 overflow-y-auto">
                                @forelse($notifications as $notification)
                                    <a href="{{ $notification->data['url'] ?? '#' }}" 
                                       class="flex gap-3 p-4 hover:bg-slate-50 dark:hover:bg-navy-600 transition border-b border-slate-100 dark:border-navy-700 last:border-0 {{ $notification->read_at ? 'opacity-60' : '' }}">
                                        <div class="flex-shrink-0">
                                            <div class="size-10 rounded-full flex items-center justify-center
                                                @if(isset($notification->data['type']) && $notification->data['type'] === 'success') bg-success/10 text-success
                                                @elseif(isset($notification->data['type']) && $notification->data['type'] === 'warning') bg-warning/10 text-warning
                                                @elseif(isset($notification->data['type']) && $notification->data['type'] === 'error') bg-error/10 text-error
                                                @else bg-info/10 text-info
                                                @endif">
                                                <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <p class="text-sm font-medium text-slate-800 dark:text-navy-50 line-clamp-2">
                                                {{ $notification->data['title'] ?? 'Notification' }}
                                            </p>
                                            <p class="text-xs text-slate-500 dark:text-navy-300 mt-1 line-clamp-2">
                                                {{ $notification->data['message'] ?? '' }}
                                            </p>
                                            <p class="text-xs text-slate-400 dark:text-navy-400 mt-1">
                                                {{ $notification->created_at->diffForHumans() }}
                                            </p>
                                        </div>
                                        @if(!$notification->read_at)
                                            <div class="flex-shrink-0">
                                                <div class="size-2 bg-primary rounded-full"></div>
                                            </div>
                                        @endif
                                    </a>
                                @empty
                                    <div class="flex flex-col items-center justify-center py-12 px-4">
                                        <svg class="size-16 text-slate-300 dark:text-navy-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                        <p class="text-slate-500 dark:text-navy-300 font-medium">No notifications</p>
                                        <p class="text-xs text-slate-400 dark:text-navy-400 mt-1">You're all caught up!</p>
                                    </div>
                                @endforelse
                            </div>

                            <!-- Footer -->
                            @if($notifications->count() > 0)
                                <div class="border-t border-slate-200 dark:border-navy-600 p-3 text-center">
                                    <a href="{{ route('admin.reports.index') }}" class="text-sm text-primary hover:underline font-medium">
                                        View all notifications
                                    </a>
                                </div>
                            @endif
                        </div>
                    </div>
                </div>

                <!-- Dark Mode Toggle -->
                <button @click="$store.global.isDarkModeEnabled = !$store.global.isDarkModeEnabled"
                        class="btn size-9 rounded-full p-0 hover:bg-slate-200 dark:hover:bg-navy-600 transition">
                    <svg x-show="!$store.global.isDarkModeEnabled" x-cloak class="size-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 18a6 6 0 100-12 6 6 0 000 12zM11 1h2v3h-2V1zm0 19h2v3h-2v-3zM3.515 4.929l1.414-1.414L7.05 5.636 5.636 7.05 3.515 4.93v-.001zM16.95 18.364l1.414-1.414 2.121 2.121-1.414 1.414-2.121-2.121zm2.121-14.85l1.414 1.415-2.121 2.121-1.414-1.414 2.121-2.121v-.001zM5.636 16.95l1.414 1.414-2.121 2.121-1.414-1.414 2.121-2.121zM23 11v2h-3v-2h3zM4 11v2H1v-2h3z"/>
                    </svg>
                    <svg x-show="$store.global.isDarkModeEnabled" x-cloak class="size-5 text-amber-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                    </svg>
                </button>

                <div class="h-6 w-px bg-slate-200 dark:bg-navy-600"></div>

                <!-- User Profile Dropdown -->
                <div class="flex" x-data="usePopper({ placement: 'bottom-end', offset: 8 })" @click.outside="isShowPopper && (isShowPopper = false)">
                    <button @click="isShowPopper = !isShowPopper" 
                            x-ref="popperRef"
                            class="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-navy-600 rounded-full pl-2 pr-3 py-1.5 transition">
                        <div class="size-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-sm">
                            {{ strtoupper(substr(auth()->user()->name, 0, 1)) }}
                        </div>
                        <div class="hidden lg:flex flex-col items-start">
                            <span class="text-xs font-semibold text-slate-800 dark:text-navy-50 leading-none">
                                {{ Str::limit(auth()->user()->name, 15) }}
                            </span>
                            <span class="text-xs text-slate-400 dark:text-navy-300 leading-none mt-0.5">
                                {{ ucfirst(auth()->user()->role) }}
                            </span>
                        </div>
                        <svg class="size-4 text-slate-400 hidden lg:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    <div :class="isShowPopper && 'show'" class="popper-root" x-ref="popperRoot">
                        <div class="popper-box w-64 rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-navy-600 dark:bg-navy-700">
                            <!-- User Info -->
                            <div class="p-4 border-b border-slate-200 dark:border-navy-600">
                                <div class="flex items-center gap-3">
                                    <div class="size-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
                                        {{ strtoupper(substr(auth()->user()->name, 0, 1)) }}
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <p class="font-semibold text-slate-800 dark:text-navy-50 truncate">
                                            {{ auth()->user()->name }}
                                        </p>
                                        <p class="text-xs text-slate-500 dark:text-navy-300 truncate">
                                            {{ auth()->user()->email }}
                                        </p>
                                        <span class="inline-block mt-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                                            {{ ucfirst(auth()->user()->role) }}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <!-- Menu Items -->
                            <div class="p-2">
                                <a href="{{ route('admin.dashboard') }}" class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-600 transition">
                                    <svg class="size-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    <span class="text-sm font-medium text-slate-700 dark:text-navy-100">Dashboard</span>
                                </a>

                                <a href="{{ route('frontend.profile.edit') }}" class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-600 transition">
                                    <svg class="size-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span class="text-sm font-medium text-slate-700 dark:text-navy-100">My Profile</span>
                                </a>

                                <a href="{{ route('admin.settings.index') }}" class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-600 transition">
                                    <svg class="size-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span class="text-sm font-medium text-slate-700 dark:text-navy-100">Settings</span>
                                </a>

                                <div class="my-2 h-px bg-slate-200 dark:bg-navy-600"></div>

                                <form method="POST" action="{{ route('admin.logout') }}">
                                    @csrf
                                    <button type="submit" class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-error/10 text-error transition">
                                        <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        <span class="text-sm font-medium">Logout</span>
                                    </button>
                                </form>
                            </div>

                            <!-- Footer -->
                            <div class="border-t border-slate-200 dark:border-navy-600 p-3 text-center">
                                <p class="text-xs text-slate-400 dark:text-navy-400">
                                    LineOne Music v1.0
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</nav>

<script>
    function markAllAsRead() {
        fetch('{{ route("admin.notifications.mark-all-read") }}', {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': '{{ csrf_token() }}',
                'Content-Type': 'application/json'
            }
        }).then(() => window.location.reload());
    }
</script>
