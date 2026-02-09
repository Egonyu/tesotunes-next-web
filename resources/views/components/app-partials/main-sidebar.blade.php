@php
    $user = auth()->user();
    $isAdmin = $user && $user->hasAnyRole(['admin', 'super_admin']);
    $isModerator = $user && $user->hasRole('moderator');
    $isArtist = $user && $user->hasRole('artist');
    $currentRoute = request()->route()->getName() ?? '';
@endphp

<div class="main-sidebar">
    <div class="flex h-full w-full flex-col items-center border-r border-slate-150 bg-white dark:border-navy-700 dark:bg-navy-800">
        
        <!-- Main Navigation -->
        <div class="is-scrollbar-hidden flex grow flex-col space-y-4 overflow-y-auto pt-6">
            
            <!-- Dashboard / Home -->
            <a href="{{ $isArtist ? route('frontend.artist.dashboard') : route('frontend.home') }}"
               class="flex size-11 items-center justify-center rounded-lg outline-hidden transition-colors duration-200 
                      {{ str_starts_with($currentRoute, 'frontend.artist.dashboard') || $currentRoute === 'frontend.home' ? 'bg-primary/10 text-primary dark:bg-navy-600 dark:text-accent-light' : 'hover:bg-primary/20 focus:bg-primary/20' }}"
               x-tooltip.placement.right="'{{ $isArtist ? 'Dashboard' : 'Home' }}'">
                <svg class="size-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path fill="currentColor" fill-opacity=".3"
                          d="M5 14.059c0-1.01 0-1.514.222-1.945.221-.43.632-.724 1.453-1.31l4.163-2.974c.56-.4.842-.601 1.162-.601.32 0 .601.2 1.162.601l4.163 2.974c.821.586 1.232.88 1.453 1.31.222.43.222.935.222 1.945V19c0 .943 0 1.414-.293 1.707C18.414 21 17.943 21 17 21H7c-.943 0-1.414 0-1.707-.293C5 20.414 5 19.943 5 19v-4.94Z" />
                    <path fill="currentColor"
                          d="M3 12.387c0 .267 0 .4.084.441.084.041.19-.04.4-.204l7.288-5.669c.59-.459.885-.688 1.228-.688.343 0 .638.23 1.228.688l7.288 5.669c.21.163.316.245.4.204.084-.04.084-.174.084-.441v-.409c0-.48 0-.72-.102-.928-.101-.208-.291-.355-.67-.65l-7-5.445c-.59-.459-.885-.688-1.228-.688-.343 0-.638.23-1.228.688l-7 5.445c-.379.295-.569.442-.67.65-.102.208-.102.448-.102.928v.409Z" />
                </svg>
            </a>

            <!-- Browse (Songs & Albums) -->
            <a href="{{ route('frontend.songs.index') }}"
               class="flex size-11 items-center justify-center rounded-lg outline-hidden transition-colors duration-200 
                      {{ str_starts_with($currentRoute, 'frontend.songs') || str_starts_with($currentRoute, 'frontend.album') ? 'bg-primary/10 text-primary dark:bg-navy-600 dark:text-accent-light' : 'hover:bg-primary/20 focus:bg-primary/20' }}"
               x-tooltip.placement.right="'Browse Music'">
                <svg class="size-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill="currentColor" fill-opacity="0.3"
                          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5z"/>
                    <circle fill="currentColor" cx="12" cy="12" r="2.5"/>
                </svg>
            </a>

            <!-- Artists -->
            <a href="{{ route('frontend.artists') }}"
               class="flex size-11 items-center justify-center rounded-lg outline-hidden transition-colors duration-200 
                      {{ str_starts_with($currentRoute, 'frontend.artists') || str_starts_with($currentRoute, 'frontend.artist.show') || str_starts_with($currentRoute, 'frontend.artists.show') ? 'bg-primary/10 text-primary dark:bg-navy-600 dark:text-accent-light' : 'hover:bg-primary/20 focus:bg-primary/20' }}"
               x-tooltip.placement.right="'Artists'">
                <svg class="size-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill="currentColor" fill-opacity="0.3"
                          d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
            </a>

            <!-- Playlists -->
            <a href="{{ route('frontend.playlists.index') }}"
               class="flex size-11 items-center justify-center rounded-lg outline-hidden transition-colors duration-200 
                      {{ str_starts_with($currentRoute, 'frontend.playlists') ? 'bg-primary/10 text-primary dark:bg-navy-600 dark:text-accent-light' : 'hover:bg-primary/20 focus:bg-primary/20' }}"
               x-tooltip.placement.right="'Playlists'">
                <svg class="size-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill="currentColor" fill-opacity="0.3"
                          d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
                </svg>
            </a>

            <!-- Forum & Community -->
            <a href="{{ route('forum.index') }}"
               class="flex size-11 items-center justify-center rounded-lg outline-hidden transition-colors duration-200 
                      {{ str_starts_with($currentRoute, 'forum') || str_starts_with($currentRoute, 'polls') ? 'bg-primary/10 text-primary dark:bg-navy-600 dark:text-accent-light' : 'hover:bg-primary/20 focus:bg-primary/20' }}"
               x-tooltip.placement.right="'Community'">
                <svg class="size-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill="currentColor" fill-opacity="0.3"
                          d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
            </a>

            <!-- Store -->
            <a href="{{ route('frontend.store.index') }}"
               class="flex size-11 items-center justify-center rounded-lg outline-hidden transition-colors duration-200 
                      {{ str_starts_with($currentRoute, 'frontend.store') ? 'bg-primary/10 text-primary dark:bg-navy-600 dark:text-accent-light' : 'hover:bg-primary/20 focus:bg-primary/20' }}"
               x-tooltip.placement.right="'Store'">
                <svg class="size-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill="currentColor" fill-opacity="0.3"
                          d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
            </a>

            @if($isArtist)
            <!-- My Music (Artists Only) -->
            <a href="{{ route('frontend.artist.music.index') }}"
               class="flex size-11 items-center justify-center rounded-lg outline-hidden transition-colors duration-200 
                      {{ str_starts_with($currentRoute, 'frontend.artist.music') || str_starts_with($currentRoute, 'frontend.artist.upload') ? 'bg-success/10 text-success dark:bg-navy-600 dark:text-success' : 'hover:bg-success/20 focus:bg-success/20' }}"
               x-tooltip.placement.right="'My Music'">
                <svg class="size-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill="currentColor" fill-opacity="0.3"
                          d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
            </a>
            @endif

            @if($isAdmin || $isModerator)
            <!-- Admin Panel -->
            <a href="{{ route('admin.dashboard') }}"
               class="flex size-11 items-center justify-center rounded-lg outline-hidden transition-colors duration-200 
                      {{ str_starts_with($currentRoute, 'admin') ? 'bg-error/10 text-error dark:bg-navy-600 dark:text-error' : 'hover:bg-error/20 focus:bg-error/20' }}"
               x-tooltip.placement.right="'Admin Panel'">
                <svg class="size-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill="currentColor" fill-opacity="0.3"
                          d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                </svg>
            </a>
            @endif

        </div>

        <!-- Bottom: Settings & Profile -->
        <div class="flex flex-col items-center space-y-3 py-3">
            
            <!-- Settings -->
            <a href="{{ route('frontend.profile.settings') }}"
               class="flex size-11 items-center justify-center rounded-lg outline-hidden transition-colors duration-200 hover:bg-primary/20 focus:bg-primary/20"
               x-tooltip.placement.right="'Settings'">
                <svg class="size-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-opacity="0.3" fill="currentColor"
                          d="M2 12.947v-1.771c0-1.047.85-1.913 1.899-1.913 1.81 0 2.549-1.288 1.64-2.868a1.919 1.919 0 0 1 .699-2.607l1.729-.996c.79-.474 1.81-.192 2.279.603l.11.192c.9 1.58 2.379 1.58 3.288 0l.11-.192c.47-.795 1.49-1.077 2.279-.603l1.73.996a1.92 1.92 0 0 1 .699 2.607c-.91 1.58-.17 2.868 1.639 2.868 1.04 0 1.899.856 1.899 1.912v1.772c0 1.047-.85 1.912-1.9 1.912-1.808 0-2.548 1.288-1.638 2.869.52.915.21 2.083-.7 2.606l-1.729.997c-.79.473-1.81.191-2.279-.604l-.11-.191c-.9-1.58-2.379-1.58-3.288 0l-.11.19c-.47.796-1.49 1.078-2.279.605l-1.73-.997a1.919 1.919 0 0 1-.699-2.606c.91-1.58.17-2.869-1.639-2.869A1.911 1.911 0 0 1 2 12.947Z" />
                    <path fill="currentColor"
                          d="M11.995 15.332c1.794 0 3.248-1.464 3.248-3.27 0-1.807-1.454-3.272-3.248-3.272-1.794 0-3.248 1.465-3.248 3.271 0 1.807 1.454 3.271 3.248 3.271Z" />
                </svg>
            </a>

            <!-- Profile Dropdown -->
            <div x-data="usePopper({ placement: 'right-end', offset: 12 })" @click.outside="if(isShowPopper) isShowPopper = false" class="flex">
                <button @click="isShowPopper = !isShowPopper" x-ref="popperRef" class="avatar size-12 cursor-pointer">
                    <img class="rounded-full" src="{{ $user && $user->profile_image ? asset('storage/' . $user->profile_image) : asset('images/200x200.png') }}" alt="avatar" />
                    <span class="absolute right-0 size-3.5 rounded-full border-2 border-white bg-success dark:border-navy-700"></span>
                </button>
                
                <div :class="isShowPopper && 'show'" class="popper-root fixed" x-ref="popperRoot">
                    <div class="popper-box w-64 rounded-lg border border-slate-150 bg-white shadow-soft dark:border-navy-600 dark:bg-navy-700">
                        <div class="flex items-center space-x-4 rounded-t-lg bg-slate-100 py-5 px-4 dark:bg-navy-800">
                            <div class="avatar size-14">
                                <img class="rounded-full" src="{{ $user && $user->profile_image ? asset('storage/' . $user->profile_image) : asset('images/200x200.png') }}" alt="avatar" />
                            </div>
                            <div>
                                <a href="{{ route('frontend.profile.show') }}"
                                   class="text-base font-medium text-slate-700 hover:text-primary focus:text-primary dark:text-navy-100">
                                    {{ $user ? $user->name : 'Guest' }}
                                </a>
                                <p class="text-xs text-slate-400 dark:text-navy-300">
                                    {{ $user ? ucfirst($user->role) : 'Visitor' }}
                                </p>
                            </div>
                        </div>
                        <div class="flex flex-col pt-2 pb-5">
                            <a href="{{ route('frontend.profile.show') }}"
                               class="group flex items-center space-x-3 py-2 px-4 tracking-wide outline-hidden transition-all hover:bg-slate-100 dark:hover:bg-navy-600">
                                <span>Profile</span>
                            </a>
                            <a href="{{ route('frontend.profile.settings') }}"
                               class="group flex items-center space-x-3 py-2 px-4 tracking-wide outline-hidden transition-all hover:bg-slate-100 dark:hover:bg-navy-600">
                                <span>Settings</span>
                            </a>
                            <div class="mt-3 px-4">
                                <form method="POST" action="{{ route('logout') }}">
                                    @csrf
                                    <button type="submit"
                                            class="btn h-9 w-full space-x-2 bg-primary font-medium text-white hover:bg-primary-focus">
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
