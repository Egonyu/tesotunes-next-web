@php
    $currentRoute = request()->route()->getName();
    $routePrefix = explode('.', $currentRoute)[0] ?? '';
@endphp

<div class="main-sidebar">
    <div class="flex h-full w-full flex-col border-r border-slate-150 bg-white dark:border-navy-700 dark:bg-navy-800" style="min-width: 240px; width: 240px;">

        <!-- Application Logo -->
        <div class="flex items-center justify-center pt-6 pb-4">
            <a href="{{ route('admin.dashboard') }}" class="flex items-center space-x-3">
                <img class="size-10 transition-transform duration-500 ease-in-out hover:rotate-[360deg]" src="{{ asset('images/app-logo.svg') }}" alt="Music Platform Admin" />
                <span class="text-xl font-bold text-slate-700 dark:text-white">Admin Panel</span>
            </a>
        </div>

        <!-- Main Sections Links -->
        <div class="is-scrollbar-hidden flex grow flex-col space-y-2 overflow-y-auto px-4 pb-6">

            <!-- Dashboard -->
            <a href="{{ route('admin.dashboard') }}"
                class="flex items-center space-x-3 rounded-lg px-3 py-2.5 transition-colors duration-200 {{ str_starts_with($currentRoute, 'admin.dashboard') ? 'text-primary bg-primary/10 hover:bg-primary/20 focus:bg-primary/20 active:bg-primary/25 dark:bg-navy-600 dark:text-accent-light dark:hover:bg-navy-450 dark:focus:bg-navy-450 dark:active:bg-navy-450/90' : 'text-slate-600 hover:text-primary hover:bg-primary/10 focus:bg-primary/10 active:bg-primary/15 dark:text-navy-200 dark:hover:text-accent-light dark:hover:bg-navy-600 dark:focus:bg-navy-600 dark:active:bg-navy-600/90' }}">
                <svg class="size-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path fill="currentColor" fill-opacity=".3" d="M5 14.059c0-1.01 0-1.514.222-1.945.221-.43.632-.724 1.453-1.31l4.163-2.974c.56-.4.842-.601 1.162-.601.32 0 .601.2 1.162.601l4.163 2.974c.821.586 1.232.88 1.453 1.31.222.43.222.935.222 1.945V19c0 .943 0 1.414-.293 1.707C18.414 21 17.943 21 17 21H7c-.943 0-1.414 0-1.707-.293C5 20.414 5 19.943 5 19v-4.94Z" />
                    <path fill="currentColor" d="M3 12.387c0 .267 0 .4.084.441.084.041.19-.04.4-.204l7.288-5.669c.59-.459.885-.688 1.228-.688.343 0 .638.23 1.228.688l7.288 5.669c.21.163.316.245.4.204.084-.04.084-.174.084-.441v-.409c0-.48 0-.72-.102-.928-.101-.208-.291-.355-.67-.65l-7-5.445c-.59-.459-.885-.688-1.228-.688-.343 0-.638.23-1.228.688l-7 5.445c-.379.295-.569.442-.67.65-.102.208-.102.448-.102.928v.409Z" />
                    <path fill="currentColor" d="M11.5 15.5h1A1.5 1.5 0 0 1 14 17v3.5h-4V17a1.5 1.5 0 0 1 1.5-1.5Z" />
                </svg>
                <span class="font-medium">Dashboard</span>
            </a>

            <!-- APPROVALS SECTION -->
            @php
                // Calculate pending approvals count
                // Use artists table which has proper status tracking
                $pendingArtists = \App\Models\Artist::where('status', 'pending')->count();

                $pendingStores = 0;
                if (config('store.enabled', false) && class_exists('\App\Modules\Store\Models\Store')) {
                    try {
                        $pendingStores = \App\Modules\Store\Models\Store::where('status', 'pending')->count();
                    } catch (\Exception $e) {
                        $pendingStores = 0;
                    }
                }

                $pendingSaccoMembers = 0;
                if (config('sacco.enabled', false) && class_exists('\App\Models\SaccoMember')) {
                    try {
                        $pendingSaccoMembers = \App\Models\SaccoMember::where('status', 'pending')->count();
                    } catch (\Exception $e) {
                        $pendingSaccoMembers = 0;
                    }
                }

                $totalPendingApprovals = $pendingArtists + $pendingStores + $pendingSaccoMembers;
            @endphp

            @if($totalPendingApprovals > 0)
            <!-- Approvals Dashboard - PRIORITY SECTION -->
            <div class="relative">
                <div class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-navy-300 mb-2">
                    Pending Approvals
                </div>

                <a href="{{ route('admin.approvals.index') }}"
                    class="flex items-center space-x-3 rounded-lg px-3 py-2.5 transition-colors duration-200 {{ str_starts_with($currentRoute, 'admin.approvals') ? 'text-primary bg-primary/10 hover:bg-primary/20 focus:bg-primary/20 active:bg-primary/25 dark:bg-navy-600 dark:text-accent-light dark:hover:bg-navy-450 dark:focus:bg-navy-450 dark:active:bg-navy-450/90' : 'text-slate-600 hover:text-primary hover:bg-primary/10 focus:bg-primary/10 active:bg-primary/15 dark:text-navy-200 dark:hover:text-accent-light dark:hover:bg-navy-600 dark:focus:bg-navy-600 dark:active:bg-navy-600/90' }}">
                    <svg class="size-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="font-medium">All Approvals</span>
                    <span class="flex items-center justify-center rounded-full bg-warning text-white text-xs font-semibold px-2 py-0.5 min-w-[1.25rem]">
                        {{ $totalPendingApprovals }}
                    </span>
                </a>
            </div>

            <!-- Divider -->
            <div class="border-t border-slate-150 dark:border-navy-500 my-3"></div>
            @endif

            <!-- USER MANAGEMENT SECTION -->
            <div class="relative">
                <div class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-navy-300 mb-2">
                    User Management
                </div>

                <!-- Regular Users -->
                <a href="{{ route('admin.users.index') }}"
                    class="flex items-center space-x-3 rounded-lg px-3 py-2.5 transition-colors duration-200 {{ str_starts_with($currentRoute, 'admin.users') ? 'text-primary bg-primary/10 hover:bg-primary/20 focus:bg-primary/20 active:bg-primary/25 dark:bg-navy-600 dark:text-accent-light dark:hover:bg-navy-450 dark:focus:bg-navy-450 dark:active:bg-navy-450/90' : 'text-slate-600 hover:text-primary hover:bg-primary/10 focus:bg-primary/10 active:bg-primary/15 dark:text-navy-200 dark:hover:text-accent-light dark:hover:bg-navy-600 dark:focus:bg-navy-600 dark:active:bg-navy-600/90' }}">
                    <svg class="size-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197a4 4 0 11-3-6.18" />
                    </svg>
                    <span class="font-medium">Users</span>
                </a>

                <!-- Artists -->
                <a href="{{ route('admin.artists.index') }}"
                    class="flex items-center space-x-3 rounded-lg px-3 py-2.5 transition-colors duration-200 {{ str_starts_with($currentRoute, 'admin.artists') ? 'text-primary bg-primary/10 hover:bg-primary/20 focus:bg-primary/20 active:bg-primary/25 dark:bg-navy-600 dark:text-accent-light dark:hover:bg-navy-450 dark:focus:bg-navy-450 dark:active:bg-navy-450/90' : 'text-slate-600 hover:text-primary hover:bg-primary/10 focus:bg-primary/10 active:bg-primary/15 dark:text-navy-200 dark:hover:text-accent-light dark:hover:bg-navy-600 dark:focus:bg-navy-600 dark:active:bg-navy-600/90' }}">
                    <svg class="size-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span class="font-medium">Artists</span>
                    @if($pendingArtists > 0)
                    <span class="flex items-center justify-center rounded-full bg-warning text-white text-xs font-semibold px-2 py-0.5 min-w-[1.25rem]">
                        {{ $pendingArtists }}
                    </span>
                    @endif
                </a>

                <!-- Artist Verification -->
                <a href="{{ route('admin.artist-verification.index') }}"
                    class="flex items-center space-x-3 rounded-lg px-3 py-2.5 ml-4 transition-colors duration-200 {{ str_starts_with($currentRoute, 'admin.artist-verification') ? 'text-primary bg-primary/10 hover:bg-primary/20 focus:bg-primary/20 active:bg-primary/25 dark:bg-navy-600 dark:text-accent-light dark:hover:bg-navy-450 dark:focus:bg-navy-450 dark:active:bg-navy-450/90' : 'text-slate-500 hover:text-primary hover:bg-primary/10 focus:bg-primary/10 active:bg-primary/15 dark:text-navy-300 dark:hover:text-accent-light dark:hover:bg-navy-600 dark:focus:bg-navy-600 dark:active:bg-navy-600/90' }}">
                    <svg class="size-4 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="font-medium text-sm">Verification</span>
                    @if($pendingArtists > 0)
                    <span class="flex items-center justify-center rounded-full bg-warning text-white text-xs font-semibold px-2 py-0.5 min-w-[1.25rem]">
                        {{ $pendingArtists }}
                    </span>
                    @endif
                </a>

                <!-- Label Applications -->
                <a href="{{ route('admin.labels.applications.index') }}"
                    class="flex items-center space-x-3 rounded-lg px-3 py-2.5 transition-colors duration-200 {{ str_starts_with($currentRoute, 'admin.labels') ? 'text-primary bg-primary/10 hover:bg-primary/20 focus:bg-primary/20 active:bg-primary/25 dark:bg-navy-600 dark:text-accent-light dark:hover:bg-navy-450 dark:focus:bg-navy-450 dark:active:bg-navy-450/90' : 'text-slate-600 hover:text-primary hover:bg-primary/10 focus:bg-primary/10 active:bg-primary/15 dark:text-navy-200 dark:hover:text-accent-light dark:hover:bg-navy-600 dark:focus:bg-navy-600 dark:active:bg-navy-600/90' }}">
                    <svg class="size-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span class="font-medium">Labels</span>
                    @if(isset($pendingLabelApplications) && $pendingLabelApplications > 0)
                    <span class="flex items-center justify-center rounded-full bg-warning text-white text-xs font-semibold px-2 py-0.5 min-w-[1.25rem]">
                        {{ $pendingLabelApplications }}
                    </span>
                    @endif
                </a>
            </div>

            <!-- Divider -->
            <div class="border-t border-slate-150 dark:border-navy-500 my-3"></div>

            <!-- CONTENT MANAGEMENT SECTION -->
            <div class="relative">
                <div class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-navy-300 mb-2">
                    Content Management
                </div>

                <!-- Music & Songs (Combined) -->
                <a href="{{ route('admin.music.index') }}"
                    class="flex items-center space-x-3 rounded-lg px-3 py-2.5 transition-colors duration-200 {{ str_starts_with($currentRoute, 'admin.music') ? 'text-primary bg-primary/10 hover:bg-primary/20 focus:bg-primary/20 active:bg-primary/25 dark:bg-navy-600 dark:text-accent-light dark:hover:bg-navy-450 dark:focus:bg-navy-450 dark:active:bg-navy-450/90' : 'text-slate-600 hover:text-primary hover:bg-primary/10 focus:bg-primary/10 active:bg-primary/15 dark:text-navy-200 dark:hover:text-accent-light dark:hover:bg-navy-600 dark:focus:bg-navy-600 dark:active:bg-navy-600/90' }}">
                    <svg class="size-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    <span class="font-medium">Music & Songs</span>
                </a>

                <!-- Genres -->
                <a href="{{ route('admin.genres.index') }}"
                    class="flex items-center space-x-3 rounded-lg px-3 py-2.5 transition-colors duration-200 {{ str_starts_with($currentRoute, 'admin.genres') ? 'text-primary bg-primary/10 hover:bg-primary/20 focus:bg-primary/20 active:bg-primary/25 dark:bg-navy-600 dark:text-accent-light dark:hover:bg-navy-450 dark:focus:bg-navy-450 dark:active:bg-navy-450/90' : 'text-slate-600 hover:text-primary hover:bg-primary/10 focus:bg-primary/10 active:bg-primary/15 dark:text-navy-200 dark:hover:text-accent-light dark:hover:bg-navy-600 dark:focus:bg-navy-600 dark:active:bg-navy-600/90' }}">
                    <svg class="size-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span class="font-medium">Genres</span>
                </a>

                <!-- Moods -->
                <a href="{{ route('admin.moods.index') }}"
                    class="flex items-center space-x-3 rounded-lg px-3 py-2.5 transition-colors duration-200 {{ str_starts_with($currentRoute, 'admin.moods') ? 'text-primary bg-primary/10 hover:bg-primary/20 focus:bg-primary/20 active:bg-primary/25 dark:bg-navy-600 dark:text-accent-light dark:hover:bg-navy-450 dark:focus:bg-navy-450 dark:active:bg-navy-450/90' : 'text-slate-600 hover:text-primary hover:bg-primary/10 focus:bg-primary/10 active:bg-primary/15 dark:text-navy-200 dark:hover:text-accent-light dark:hover:bg-navy-600 dark:focus:bg-navy-600 dark:active:bg-navy-600/90' }}">
                    <svg class="size-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="font-medium">Moods</span>
                </a>

                <!-- Slideshow -->
                <a href="{{ route('admin.slideshow.overview') }}"
                    class="flex items-center space-x-3 rounded-lg px-3 py-2.5 transition-colors duration-200 {{ str_starts_with($currentRoute, 'admin.slideshow') ? 'text-primary bg-primary/10 hover:bg-primary/20 focus:bg-primary/20 active:bg-primary/25 dark:bg-navy-600 dark:text-accent-light dark:hover:bg-navy-450 dark:focus:bg-navy-450 dark:active:bg-navy-450/90' : 'text-slate-600 hover:text-primary hover:bg-primary/10 focus:bg-primary/10 active:bg-primary/15 dark:text-navy-200 dark:hover:text-accent-light dark:hover:bg-navy-600 dark:focus:bg-navy-600 dark:active:bg-navy-600/90' }}">
                    <svg class="size-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="font-medium">Slideshow</span>
                </a>

                <!-- Playlists -->
                <a href="{{ route('admin.content.playlists.index') }}"
                    class="flex items-center space-x-3 rounded-lg px-3 py-2.5 transition-colors duration-200 {{ str_starts_with($currentRoute, 'admin.content.playlists') ? 'text-primary bg-primary/10 hover:bg-primary/20 focus:bg-primary/20 active:bg-primary/25 dark:bg-navy-600 dark:text-accent-light dark:hover:bg-navy-450 dark:focus:bg-navy-450 dark:active:bg-navy-450/90' : 'text-slate-600 hover:text-primary hover:bg-primary/10 focus:bg-primary/10 active:bg-primary/15 dark:text-navy-200 dark:hover:text-accent-light dark:hover:bg-navy-600 dark:focus:bg-navy-600 dark:active:bg-navy-600/90' }}">
                    <svg class="size-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    <span class="font-medium">Playlists</span>
                </a>

                <!-- Events Management -->
                <a href="{{ route('admin.events.index') }}"
                    class="flex items-center space-x-3 rounded-lg px-3 py-2.5 transition-colors duration-200 {{ str_starts_with($currentRoute, 'admin.events') ? 'text-primary bg-primary/10 hover:bg-primary/20 focus:bg-primary/20 active:bg-primary/25 dark:bg-navy-600 dark:text-accent-light dark:hover:bg-navy-450 dark:focus:bg-navy-450 dark:active:bg-navy-450/90' : 'text-slate-600 hover:text-primary hover:bg-primary/10 focus:bg-primary/10 active:bg-primary/15 dark:text-navy-200 dark:hover:text-accent-light dark:hover:bg-navy-600 dark:focus:bg-navy-600 dark:active:bg-navy-600/90' }}">
                    <svg class="size-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="font-medium">Events</span>
                </a>

                <!-- Content Moderation -->
                <a href="{{ route('admin.music.moderation.index') }}"
                    class="flex items-center space-x-3 rounded-lg px-3 py-2.5 transition-colors duration-200 {{ str_starts_with($currentRoute, 'admin.music.moderation') ? 'text-primary bg-primary/10 hover:bg-primary/20 focus:bg-primary/20 active:bg-primary/25 dark:bg-navy-600 dark:text-accent-light dark:hover:bg-navy-450 dark:focus:bg-navy-450 dark:active:bg-navy-450/90' : 'text-slate-600 hover:text-primary hover:bg-primary/10 focus:bg-primary/10 active:bg-primary/15 dark:text-navy-200 dark:hover:text-accent-light dark:hover:bg-navy-600 dark:focus:bg-navy-600 dark:active:bg-navy-600/90' }}">
                    <svg class="size-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span class="font-medium">Moderation</span>
                </a>

                <!-- Awards Management -->
                <a href="{{ route('admin.awards.index') }}"
                    class="flex items-center space-x-3 rounded-lg px-3 py-2.5 transition-colors duration-200 {{ str_starts_with($currentRoute, 'admin.awards') ? 'text-primary bg-primary/10 hover:bg-primary/20 focus:bg-primary/20 active:bg-primary/25 dark:bg-navy-600 dark:text-accent-light dark:hover:bg-navy-450 dark:focus:bg-navy-450 dark:active:bg-navy-450/90' : 'text-slate-600 hover:text-primary hover:bg-primary/10 focus:bg-primary/10 active:bg-primary/15 dark:text-navy-200 dark:hover:text-accent-light dark:hover:bg-navy-600 dark:focus:bg-navy-600 dark:active:bg-navy-600/90' }}">
                    <svg class="size-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <span class="font-medium">Awards</span>
                </a>

                <!-- Ojokotau - Community Support Campaigns -->
                @php
                    $pendingCampaigns = 0;
                    if (class_exists('\App\Modules\Ojokotau\Models\Campaign')) {
                        try {
                            $pendingCampaigns = \App\Modules\Ojokotau\Models\Campaign::where('status', 'pending')->count();
                        } catch (\Exception $e) {
                            $pendingCampaigns = 0;
                        }
                    }
                @endphp
                <a href="{{ route('admin.ojokotau.campaigns.index') }}"
                    class="flex items-center space-x-3 rounded-lg px-3 py-2.5 transition-colors duration-200 {{ str_starts_with($currentRoute, 'admin.ojokotau') ? 'text-primary bg-primary/10 hover:bg-primary/20 focus:bg-primary/20 active:bg-primary/25 dark:bg-navy-600 dark:text-accent-light dark:hover:bg-navy-450 dark:focus:bg-navy-450 dark:active:bg-navy-450/90' : 'text-slate-600 hover:text-primary hover:bg-primary/10 focus:bg-primary/10 active:bg-primary/15 dark:text-navy-200 dark:hover:text-accent-light dark:hover:bg-navy-600 dark:focus:bg-navy-600 dark:active:bg-navy-600/90' }}">
                    <svg class="size-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span class="font-medium">Ojokotau</span>
                    @if($pendingCampaigns > 0)
                    <span class="flex items-center justify-center rounded-full bg-warning text-white text-xs font-semibold px-2 py-0.5 min-w-[1.25rem]">
                        {{ $pendingCampaigns }}
                    </span>
                    @endif
                </a>

                <!-- Podcast Management -->
                @if(config('modules.podcast.enabled', true))
                <a href="{{ route('admin.podcasts.index') }}"
                    class="flex items-center space-x-3 rounded-lg px-3 py-2.5 transition-colors duration-200 {{ str_starts_with($currentRoute, 'admin.podcasts') ? 'text-primary bg-primary/10 hover:bg-primary/20 focus:bg-primary/20 active:bg-primary/25 dark:bg-navy-600 dark:text-accent-light dark:hover:bg-navy-450 dark:focus:bg-navy-450 dark:active:bg-navy-450/90' : 'text-slate-600 hover:text-primary hover:bg-primary/10 focus:bg-primary/10 active:bg-primary/15 dark:text-navy-200 dark:hover:text-accent-light dark:hover:bg-navy-600 dark:focus:bg-navy-600 dark:active:bg-navy-600/90' }}">
                    <svg class="size-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    <span class="font-medium">Podcasts</span>
                </a>
                @endif

                <!-- Forum Management -->
                @if(config('modules.forum.enabled', false))
                <a href="{{ route('admin.modules.forum.dashboard') }}"
                    class="flex items-center space-x-3 rounded-lg px-3 py-2.5 transition-colors duration-200 {{ str_starts_with($currentRoute, 'admin.modules.forum') ? 'text-primary bg-primary/10 hover:bg-primary/20 focus:bg-primary/20 active:bg-primary/25 dark:bg-navy-600 dark:text-accent-light dark:hover:bg-navy-450 dark:focus:bg-navy-450 dark:active:bg-navy-450/90' : 'text-slate-600 hover:text-primary hover:bg-primary/10 focus:bg-primary/10 active:bg-primary/15 dark:text-navy-200 dark:hover:text-accent-light dark:hover:bg-navy-600 dark:focus:bg-navy-600 dark:active:bg-navy-600/90' }}">
                    <svg class="size-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                    <span class="font-medium">Forum</span>
                    @if(isset($pendingTopicsCount) && $pendingTopicsCount > 0)
                    <span class="flex items-center justify-center rounded-full bg-warning text-white text-xs font-semibold px-2 py-0.5 min-w-[1.25rem]">
                        {{ $pendingTopicsCount }}
                    </span>
                    @endif
                </a>
                @endif
            </div>

            <!-- Divider -->
            <div class="border-t border-slate-150 dark:border-navy-500 my-3"></div>

            <!-- BUSINESS OPERATIONS SECTION -->
            <div class="relative">
                <div class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-navy-300 mb-2">
                    Business Operations
                </div>

                <!-- Payments & Revenue -->
                <a href="{{ route('admin.payments.index') }}"
                    class="flex items-center space-x-3 rounded-lg px-3 py-2.5 transition-colors duration-200 {{ str_starts_with($currentRoute, 'admin.payments') ? 'text-primary bg-primary/10 hover:bg-primary/20 focus:bg-primary/20 active:bg-primary/25 dark:bg-navy-600 dark:text-accent-light dark:hover:bg-navy-450 dark:focus:bg-navy-450 dark:active:bg-navy-450/90' : 'text-slate-600 hover:text-primary hover:bg-primary/10 focus:bg-primary/10 active:bg-primary/15 dark:text-navy-200 dark:hover:text-accent-light dark:hover:bg-navy-600 dark:focus:bg-navy-600 dark:active:bg-navy-600/90' }}">
                    <svg class="size-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span class="font-medium">Payments & Revenue</span>
                </a>

                <!-- Store/E-commerce Management -->
                @if(config('store.enabled', false))
                <a href="{{ route('admin.store.index') }}"
                    class="flex items-center space-x-3 rounded-lg px-3 py-2.5 transition-colors duration-200 {{ str_starts_with($currentRoute, 'admin.store') ? 'text-primary bg-primary/10 hover:bg-primary/20 focus:bg-primary/20 active:bg-primary/25 dark:bg-navy-600 dark:text-accent-light dark:hover:bg-navy-450 dark:focus:bg-navy-450 dark:active:bg-navy-450/90' : 'text-slate-600 hover:text-primary hover:bg-primary/10 focus:bg-primary/10 active:bg-primary/15 dark:text-navy-200 dark:hover:text-accent-light dark:hover:bg-navy-600 dark:focus:bg-navy-600 dark:active:bg-navy-600/90' }}">
                    <svg class="size-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span class="font-medium">Store Management</span>
                    @if($pendingStores > 0)
                    <span class="flex items-center justify-center rounded-full bg-success text-white text-xs font-semibold px-2 py-0.5 min-w-[1.25rem]">
                        {{ $pendingStores }}
                    </span>
                    @endif
                </a>
                @endif

                <!-- SACCO Management -->
                @if(config('sacco.enabled', false))
                <a href="{{ route('admin.sacco.dashboard') }}"
                    class="flex items-center space-x-3 rounded-lg px-3 py-2.5 transition-colors duration-200 {{ str_starts_with($currentRoute, 'admin.sacco') ? 'text-primary bg-primary/10 hover:bg-primary/20 focus:bg-primary/20 active:bg-primary/25 dark:bg-navy-600 dark:text-accent-light dark:hover:bg-navy-450 dark:focus:bg-navy-450 dark:active:bg-navy-450/90' : 'text-slate-600 hover:text-primary hover:bg-primary/10 focus:bg-primary/10 active:bg-primary/15 dark:text-navy-200 dark:hover:text-accent-light dark:hover:bg-navy-600 dark:focus:bg-navy-600 dark:active:bg-navy-600/90' }}">
                    <svg class="size-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span class="font-medium">SACCO</span>
                    @if($pendingSaccoMembers > 0)
                    <span class="flex items-center justify-center rounded-full bg-warning text-white text-xs font-semibold px-2 py-0.5 min-w-[1.25rem]">
                        {{ $pendingSaccoMembers }}
                    </span>
                    @endif
                </a>
                @endif

                <!-- Credits Management -->
                <a href="{{ route('admin.credits.index') }}"
                    class="flex items-center space-x-3 rounded-lg px-3 py-2.5 transition-colors duration-200 {{ str_starts_with($currentRoute, 'admin.credits') ? 'text-primary bg-primary/10 hover:bg-primary/20 focus:bg-primary/20 active:bg-primary/25 dark:bg-navy-600 dark:text-accent-light dark:hover:bg-navy-450 dark:focus:bg-navy-450 dark:active:bg-navy-450/90' : 'text-slate-600 hover:text-primary hover:bg-primary/10 focus:bg-primary/10 active:bg-primary/15 dark:text-navy-200 dark:hover:text-accent-light dark:hover:bg-navy-600 dark:focus:bg-navy-600 dark:active:bg-navy-600/90' }}">
                    <svg class="size-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="font-medium">Credits</span>
                </a>
            </div>

            <!-- Divider -->
            <div class="border-t border-slate-150 dark:border-navy-500 my-3"></div>

            <!-- ANALYTICS & REPORTS SECTION -->
            <div class="relative">
                <div class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-navy-300 mb-2">
                    Analytics & Reports
                </div>

                <!-- Analytics Dashboard -->
                <a href="{{ route('admin.reports.index') }}"
                    class="flex items-center space-x-3 rounded-lg px-3 py-2.5 transition-colors duration-200 {{ str_starts_with($currentRoute, 'admin.reports') ? 'text-primary bg-primary/10 hover:bg-primary/20 focus:bg-primary/20 active:bg-primary/25 dark:bg-navy-600 dark:text-accent-light dark:hover:bg-navy-450 dark:focus:bg-navy-450 dark:active:bg-navy-450/90' : 'text-slate-600 hover:text-primary hover:bg-primary/10 focus:bg-primary/10 active:bg-primary/15 dark:text-navy-200 dark:hover:text-accent-light dark:hover:bg-navy-600 dark:focus:bg-navy-600 dark:active:bg-navy-600/90' }}">
                    <svg class="size-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span class="font-medium">Analytics & Reports</span>
                </a>
            </div>

            <!-- Divider -->
            <div class="border-t border-slate-150 dark:border-navy-500 my-3"></div>

            <!-- SYSTEM MANAGEMENT SECTION -->
            <div class="relative">
                <div class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-navy-300 mb-2">
                    System Management
                </div>

                <!-- Role Management -->
                <a href="{{ route('admin.roles.index') }}"
                    class="flex items-center space-x-3 rounded-lg px-3 py-2.5 transition-colors duration-200 {{ str_starts_with($currentRoute, 'admin.roles') ? 'text-primary bg-primary/10 hover:bg-primary/20 focus:bg-primary/20 active:bg-primary/25 dark:bg-navy-600 dark:text-accent-light dark:hover:bg-navy-450 dark:focus:bg-navy-450 dark:active:bg-navy-450/90' : 'text-slate-600 hover:text-primary hover:bg-primary/10 focus:bg-primary/10 active:bg-primary/15 dark:text-navy-200 dark:hover:text-accent-light dark:hover:bg-navy-600 dark:focus:bg-navy-600 dark:active:bg-navy-600/90' }}">
                    <svg class="size-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span class="font-medium">Roles & Permissions</span>
                </a>

                <!-- System Health & Monitoring (Super Admin Only) -->
                @if(auth()->user()->hasRole('super_admin'))
                <a href="{{ route('admin.system.index') }}"
                    class="flex items-center space-x-3 rounded-lg px-3 py-2.5 transition-colors duration-200 {{ str_starts_with($currentRoute, 'admin.system') ? 'text-primary bg-primary/10 hover:bg-primary/20 focus:bg-primary/20 active:bg-primary/25 dark:bg-navy-600 dark:text-accent-light dark:hover:bg-navy-450 dark:focus:bg-navy-450 dark:active:bg-navy-450/90' : 'text-slate-600 hover:text-primary hover:bg-primary/10 focus:bg-primary/10 active:bg-primary/15 dark:text-navy-200 dark:hover:text-accent-light dark:hover:bg-navy-600 dark:focus:bg-navy-600 dark:active:bg-navy-600/90' }}">
                    <svg class="size-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                    <span class="font-medium">System Health</span>
                    @if(isset($systemHealthScore) && $systemHealthScore > 0)
                    <span class="flex items-center justify-center rounded-full text-white text-xs font-semibold px-2 py-0.5 min-w-[1.25rem]"
                        style="background-color: {{ $systemHealthScore >= 90 ? '#10b981' : ($systemHealthScore >= 70 ? '#f59e0b' : '#ef4444') }}">
                        {{ $systemHealthScore }}
                    </span>
                    @endif
                </a>
                @endif

                <!-- Frontend Sections -->
                <a href="{{ route('admin.frontend-sections.index') }}"
                    class="flex items-center space-x-3 rounded-lg px-3 py-2.5 transition-colors duration-200 {{ str_starts_with($currentRoute, 'admin.frontend-sections') ? 'text-primary bg-primary/10 hover:bg-primary/20 focus:bg-primary/20 active:bg-primary/25 dark:bg-navy-600 dark:text-accent-light dark:hover:bg-navy-450 dark:focus:bg-navy-450 dark:active:bg-navy-450/90' : 'text-slate-600 hover:text-primary hover:bg-primary/10 focus:bg-primary/10 active:bg-primary/15 dark:text-navy-200 dark:hover:text-accent-light dark:hover:bg-navy-600 dark:focus:bg-navy-600 dark:active:bg-navy-600/90' }}">
                    <svg class="size-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                    </svg>
                    <span class="font-medium">Frontend Sections</span>
                </a>

                <!-- System Settings -->
                <a href="{{ route('admin.settings.index') }}"
                    class="flex items-center space-x-3 rounded-lg px-3 py-2.5 transition-colors duration-200 {{ str_starts_with($currentRoute, 'admin.settings') ? 'text-primary bg-primary/10 hover:bg-primary/20 focus:bg-primary/20 active:bg-primary/25 dark:bg-navy-600 dark:text-accent-light dark:hover:bg-navy-450 dark:focus:bg-navy-450 dark:active:bg-navy-450/90' : 'text-slate-600 hover:text-primary hover:bg-primary/10 focus:bg-primary/10 active:bg-primary/15 dark:text-navy-200 dark:hover:text-accent-light dark:hover:bg-navy-600 dark:focus:bg-navy-600 dark:active:bg-navy-600/90' }}">
                    <svg class="size-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span class="font-medium">Settings</span>
                </a>

                <!-- Audit Logs -->
                <a href="{{ route('admin.logs.index') }}"
                    class="flex items-center space-x-3 rounded-lg px-3 py-2.5 transition-colors duration-200 {{ str_starts_with($currentRoute, 'admin.logs') ? 'text-primary bg-primary/10 hover:bg-primary/20 focus:bg-primary/20 active:bg-primary/25 dark:bg-navy-600 dark:text-accent-light dark:hover:bg-navy-450 dark:focus:bg-navy-450 dark:active:bg-navy-450/90' : 'text-slate-600 hover:text-primary hover:bg-primary/10 focus:bg-primary/10 active:bg-primary/15 dark:text-navy-200 dark:hover:text-accent-light dark:hover:bg-navy-600 dark:focus:bg-navy-600 dark:active:bg-navy-600/90' }}">
                    <svg class="size-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span class="font-medium">Audit Logs</span>
                </a>
            </div>

        </div>

        <!-- Bottom Links -->
        <div class="flex flex-col space-y-3 px-4 py-3">

            <!-- Back to Frontend -->
            <a href="{{ route('frontend.home') }}"
                class="flex items-center space-x-3 rounded-lg px-3 py-2.5 transition-colors duration-200 text-slate-600 hover:text-primary hover:bg-primary/10 focus:bg-primary/10 active:bg-primary/15 dark:text-navy-200 dark:hover:text-accent-light dark:hover:bg-navy-600 dark:focus:bg-navy-600 dark:active:bg-navy-600/90">
                <svg class="size-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span class="font-medium">View Frontend</span>
            </a>

            <!-- Admin Profile -->
            <div x-data="usePopper({ placement: 'right-end', offset: 12 })" @click.outside="if(isShowPopper) isShowPopper = false" class="flex w-full">
                <button @click="isShowPopper = !isShowPopper" x-ref="popperRef" class="flex items-center space-x-3 rounded-lg px-3 py-2.5 transition-colors duration-200 text-slate-600 hover:text-primary hover:bg-primary/10 focus:bg-primary/10 active:bg-primary/15 dark:text-navy-200 dark:hover:text-accent-light dark:hover:bg-navy-600 dark:focus:bg-navy-600 dark:active:bg-navy-600/90 w-full">
                    <div class="relative">
                        <img class="size-8 rounded-full" src="{{ auth()->user()->avatar ? Storage::url(auth()->user()->avatar) : asset('images/200x200.png') }}" alt="{{ auth()->user()->name }}" />
                        <span class="absolute -right-1 -top-1 size-3 rounded-full border-2 border-white bg-success dark:border-navy-700"></span>
                    </div>
                    <div class="flex-1 text-left">
                        <div class="font-medium text-sm">{{ auth()->user()->name }}</div>
                        <div class="text-xs text-slate-400 dark:text-navy-300">{{ ucfirst(auth()->user()->role) }}</div>
                    </div>
                </button>

                <div :class="isShowPopper && 'show'" class="popper-root fixed" x-ref="popperRoot">
                    <div class="popper-box w-64 rounded-lg border border-slate-150 bg-white shadow-soft dark:border-navy-600 dark:bg-navy-700">
                        <div class="flex items-center space-x-4 rounded-t-lg bg-slate-100 py-5 px-4 dark:bg-navy-800">
                            <div class="avatar size-14">
                                <img class="rounded-full" src="{{ auth()->user()->avatar ? Storage::url(auth()->user()->avatar) : asset('images/200x200.png') }}" alt="{{ auth()->user()->name }}" />
                            </div>
                            <div>
                                <a href="#" class="text-base font-medium text-slate-700 hover:text-primary focus:text-primary dark:text-navy-100 dark:hover:text-accent-light dark:focus:text-accent-light">
                                    {{ auth()->user()->name }}
                                </a>
                                <p class="text-xs text-slate-400 dark:text-navy-300">
                                    {{ ucfirst(auth()->user()->role) }} Admin
                                </p>
                            </div>
                        </div>

                        <div class="flex flex-col pt-2 pb-5">
                            <a href="{{ route('admin.users.show', auth()->user()) }}" class="group flex items-center space-x-3 py-2 px-4 tracking-wide outline-hidden transition-all hover:bg-slate-100 focus:bg-slate-100 dark:hover:bg-navy-600 dark:focus:bg-navy-600">
                                <div class="flex size-8 items-center justify-center rounded-lg bg-warning text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 class="font-medium text-slate-700 transition-colors group-hover:text-primary group-focus:text-primary dark:text-navy-100 dark:group-hover:text-accent-light dark:group-focus:text-accent-light">
                                        My Profile
                                    </h2>
                                    <div class="text-xs text-slate-400 line-clamp-1 dark:text-navy-300">
                                        View your profile
                                    </div>
                                </div>
                            </a>

                            <div class="mt-3 px-4">
                                <form method="POST" action="{{ route('admin.logout') }}">
                                    @csrf
                                    <button type="submit" class="btn h-9 w-full space-x-2 bg-primary text-white hover:bg-primary-focus focus:bg-primary-focus active:bg-primary-focus/90 dark:bg-accent dark:hover:bg-accent-focus dark:focus:bg-accent-focus dark:active:bg-accent/90">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        <span>Logout</span>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</div>