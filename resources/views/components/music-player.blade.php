{{-- 
    TesoTunes Music Player v5.0
    Clean, persistent, theme-aware player with all features
    
    Features:
    - Survives page navigation (no interruption)
    - Light/dark theme support
    - Download button
    - Like button
    - Add to playlist button
    - Cross-tab sync
    - Minimize/expand toggle
--}}

<div x-data="musicPlayer()" 
     x-show="currentTrack !== null" 
     x-cloak
     x-transition:enter="transition ease-out duration-300"
     x-transition:enter-start="translate-y-full opacity-0"
     x-transition:enter-end="translate-y-0 opacity-100"
     x-transition:leave="transition ease-in duration-200"
     x-transition:leave-start="translate-y-0 opacity-100"
     x-transition:leave-end="translate-y-full opacity-0"
     class="fixed left-0 right-0 z-50 
            bg-white dark:bg-gray-900
            border-t border-gray-200 dark:border-gray-800
            shadow-[0_-4px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.5)]"
     style="bottom: 64px; padding-bottom: env(safe-area-inset-bottom);"
     :style="{ bottom: window.innerWidth >= 1024 ? '0px' : '64px' }">
    
    {{-- ============== MINIMIZED VIEW ============== --}}
    <template x-if="minimized">
        <div class="relative">
            {{-- Mini Progress Bar --}}
            <div class="absolute top-0 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-800">
                <div class="h-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-100"
                     :style="`width: ${progress}%`"></div>
            </div>
            
            <div class="flex items-center justify-between px-3 py-2">
                {{-- Mini Track Info --}}
                <div class="flex items-center gap-2 min-w-0 flex-1">
                    {{-- Mini Artwork --}}
                    <div class="w-8 h-8 rounded overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                        <img :src="currentTrack?.artwork_url || '{{ asset('images/default-song-artwork.svg') }}'"
                             :alt="currentTrack?.title"
                             class="w-full h-full object-cover"
                             loading="eager">
                    </div>
                    
                    {{-- Track Title --}}
                    <div class="min-w-0 flex-1">
                        <p class="text-sm font-medium text-gray-900 dark:text-white truncate" 
                           x-text="currentTrack?.title || 'Unknown Track'"></p>
                    </div>
                </div>
                
                {{-- Mini Controls --}}
                <div class="flex items-center gap-1">
                    {{-- Play/Pause --}}
                    <button @click="togglePlay()"
                            :disabled="isLoading"
                            class="w-8 h-8 rounded-full flex items-center justify-center transition-all
                                   bg-emerald-500 hover:bg-emerald-600 text-white
                                   disabled:opacity-50 disabled:cursor-not-allowed">
                        <svg x-show="isLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <svg x-show="!isLoading && !isPlaying" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                        <svg x-show="!isLoading && isPlaying" x-cloak class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                        </svg>
                    </button>
                    
                    {{-- Expand Button --}}
                    <button @click="toggleMinimize()"
                            class="w-8 h-8 rounded-full flex items-center justify-center transition-all
                                   text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white
                                   hover:bg-gray-100 dark:hover:bg-gray-800"
                            title="Expand player">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </template>
    
    {{-- ============== EXPANDED VIEW ============== --}}
    <template x-if="!minimized">
        <div>
            {{-- Progress Bar (Top) --}}
            <div class="w-full h-1 bg-gray-200 dark:bg-gray-800 cursor-pointer group"
                 @click="seekTo(($event.offsetX / $event.target.offsetWidth) * 100)">
                <div class="h-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-100 relative"
                     :style="`width: ${progress}%`">
                    {{-- Seek Handle --}}
                    <div class="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-emerald-500 dark:bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg scale-0 group-hover:scale-100"></div>
                </div>
            </div>

    {{-- ============== MOBILE LAYOUT ============== --}}
    <div class="md:hidden px-3 py-2.5">
        <div class="flex items-center gap-3">
            {{-- Artwork --}}
            <div class="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 shadow-md bg-gray-100 dark:bg-gray-800">
                <img :src="currentTrack?.artwork_url || '{{ asset('images/default-song-artwork.svg') }}'"
                     :alt="currentTrack?.title"
                     class="w-full h-full object-cover"
                     loading="eager">
            </div>
            
            {{-- Track Info --}}
            <div class="flex-1 min-w-0">
                <h4 class="text-gray-900 dark:text-white font-medium text-sm truncate" 
                    x-text="currentTrack?.title || 'Unknown Track'"></h4>
                <p class="text-gray-500 dark:text-gray-400 text-xs truncate" 
                   x-text="currentTrack?.artist_name || 'Unknown Artist'"></p>
            </div>

            {{-- Mobile Controls --}}
            <div class="flex items-center gap-1">
                {{-- Like Button --}}
                <button @click="toggleLike()"
                        class="w-9 h-9 flex items-center justify-center rounded-full transition-colors"
                        :class="isLiked ? 'text-red-500' : 'text-gray-400 dark:text-gray-500 hover:text-red-500'">
                    <svg class="w-5 h-5" :fill="isLiked ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                </button>

                {{-- Download Button (Mobile) --}}
                <button @click="downloadTrack()"
                        class="w-9 h-9 flex items-center justify-center rounded-full transition-colors
                               text-gray-400 dark:text-gray-500 hover:text-emerald-500"
                        title="Download">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                    </svg>
                </button>

                {{-- Play/Pause --}}
                <button @click="togglePlay()"
                        :disabled="isLoading"
                        class="w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-md
                               bg-emerald-500 hover:bg-emerald-600 text-white
                               dark:bg-emerald-500 dark:hover:bg-emerald-400
                               disabled:opacity-50 disabled:cursor-not-allowed">
                    {{-- Loading --}}
                    <svg x-show="isLoading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{-- Play --}}
                    <svg x-show="!isLoading && !isPlaying" class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                    {{-- Pause --}}
                    <svg x-show="!isLoading && isPlaying" x-cloak class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                </button>

                {{-- Next --}}
                <button @click="nextTrack()"
                        :disabled="!hasNext"
                        class="w-9 h-9 rounded-full flex items-center justify-center transition-colors
                               text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white
                               disabled:opacity-40 disabled:cursor-not-allowed">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                    </svg>
                </button>
                
                {{-- Minimize Button --}}
                <button @click="toggleMinimize()"
                        class="w-9 h-9 rounded-full flex items-center justify-center transition-colors
                               text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white
                               hover:bg-gray-100 dark:hover:bg-gray-800"
                        title="Minimize player">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                </button>
            </div>
        </div>

        {{-- Time Display --}}
        <div class="flex items-center justify-between mt-1.5 text-[10px] text-gray-500 dark:text-gray-400 font-mono">
            <span x-text="formatTime(currentTime)">0:00</span>
            <span x-text="formatTime(duration)">0:00</span>
        </div>

        {{-- Error Display --}}
        <div x-show="error" x-cloak class="mt-1 text-xs text-red-500 dark:text-red-400 text-center">
            <span x-text="error"></span>
        </div>
    </div>

    {{-- ============== DESKTOP LAYOUT ============== --}}
    <div class="hidden md:flex items-center px-4 lg:px-6 py-3 gap-4">
        
        {{-- Left: Track Info --}}
        <div class="flex items-center gap-3 flex-1 min-w-0 max-w-xs">
            {{-- Artwork --}}
            <div class="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 shadow-lg bg-gray-100 dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700">
                <img :src="currentTrack?.artwork_url || '{{ asset('images/default-song-artwork.svg') }}'"
                     :alt="currentTrack?.title"
                     class="w-full h-full object-cover"
                     loading="eager">
            </div>
            
            {{-- Info --}}
            <div class="flex-1 min-w-0">
                <h4 class="text-gray-900 dark:text-white font-semibold text-sm truncate mb-0.5" 
                    x-text="currentTrack?.title || 'Unknown Track'"></h4>
                <p class="text-gray-500 dark:text-gray-400 text-xs truncate" 
                   x-text="currentTrack?.artist_name || 'Unknown Artist'"></p>
            </div>
        </div>

        {{-- Center: Playback Controls --}}
        <div class="flex flex-col items-center gap-2 flex-1 max-w-2xl">
            {{-- Control Buttons --}}
            <div class="flex items-center gap-3">
                {{-- Shuffle --}}
                <button @click="toggleShuffle()"
                        class="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
                        :class="shuffle ? 'text-emerald-500 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
                    </svg>
                </button>

                {{-- Previous --}}
                <button @click="previousTrack()"
                        class="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-gray-100 dark:hover:bg-gray-800
                               text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                    </svg>
                </button>

                {{-- Play/Pause --}}
                <button @click="togglePlay()"
                        :disabled="isLoading"
                        class="w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg
                               bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100
                               text-white dark:text-gray-900
                               disabled:opacity-50 disabled:cursor-not-allowed">
                    {{-- Loading --}}
                    <svg x-show="isLoading" class="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{-- Play --}}
                    <svg x-show="!isLoading && !isPlaying" class="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                    {{-- Pause --}}
                    <svg x-show="!isLoading && isPlaying" x-cloak class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                </button>

                {{-- Next --}}
                <button @click="nextTrack()"
                        :disabled="!hasNext"
                        class="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-gray-100 dark:hover:bg-gray-800
                               text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white
                               disabled:opacity-40 disabled:cursor-not-allowed">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                    </svg>
                </button>

                {{-- Repeat --}}
                <button @click="toggleRepeat()"
                        class="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-gray-100 dark:hover:bg-gray-800 relative"
                        :class="repeat !== 'off' ? 'text-emerald-500 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
                    </svg>
                    <span x-show="repeat === 'one'" x-cloak class="absolute -bottom-0.5 right-1 text-[8px] font-bold">1</span>
                </button>
            </div>

            {{-- Progress Bar + Time --}}
            <div class="flex items-center gap-2 w-full max-w-xl">
                <span class="text-[10px] font-mono text-gray-500 dark:text-gray-400 w-10 text-right tabular-nums" x-text="formatTime(currentTime)">0:00</span>
                
                <div class="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer group relative"
                     @click="seekTo(($event.offsetX / $event.target.offsetWidth) * 100)">
                    <div class="h-full bg-gray-800 dark:bg-white rounded-full transition-all duration-100"
                         :style="`width: ${progress}%`"></div>
                    {{-- Hover handle --}}
                    <div class="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-gray-800 dark:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                         :style="`left: calc(${progress}% - 6px)`"></div>
                </div>
                
                <span class="text-[10px] font-mono text-gray-500 dark:text-gray-400 w-10 tabular-nums" x-text="formatTime(duration)">0:00</span>
            </div>
        </div>

        {{-- Right: Action Buttons --}}
        <div class="flex items-center gap-1 flex-1 max-w-xs justify-end">
            {{-- Like --}}
            <button @click="toggleLike()"
                    class="w-9 h-9 flex items-center justify-center rounded-full transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
                    :class="isLiked ? 'text-red-500' : 'text-gray-400 dark:text-gray-500 hover:text-red-500'"
                    title="Like">
                <svg class="w-5 h-5" :fill="isLiked ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
            </button>
            
            {{-- Add to Playlist --}}
            <button @click="addToPlaylist()"
                    class="w-9 h-9 flex items-center justify-center rounded-full transition-all hover:bg-gray-100 dark:hover:bg-gray-800
                           text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                    title="Add to Playlist">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
            </button>
            
            {{-- Download --}}
            <button @click="downloadTrack()"
                    class="w-9 h-9 flex items-center justify-center rounded-full transition-all hover:bg-gray-100 dark:hover:bg-gray-800
                           text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                    title="Download">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
            </button>

            {{-- Volume --}}
            <div class="flex items-center gap-1 ml-2">
                <button @click="toggleMute()" 
                        class="w-9 h-9 flex items-center justify-center rounded-full transition-all hover:bg-gray-100 dark:hover:bg-gray-800
                               text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white">
                    {{-- Volume High --}}
                    <svg x-show="!muted && volume > 0.5" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                    </svg>
                    {{-- Volume Low --}}
                    <svg x-show="!muted && volume > 0 && volume <= 0.5" x-cloak class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
                    </svg>
                    {{-- Muted --}}
                    <svg x-show="muted || volume === 0" x-cloak class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                    </svg>
                </button>
                
                <input type="range" min="0" max="100" 
                       :value="volume * 100" 
                       @input="setVolume($event.target.value)"
                       class="w-20 h-1 rounded-lg appearance-none cursor-pointer
                              bg-gray-200 dark:bg-gray-700
                              accent-gray-800 dark:accent-white">
            </div>
            
            {{-- Minimize Button --}}
            <button @click="toggleMinimize()"
                    class="w-9 h-9 flex items-center justify-center rounded-full transition-all hover:bg-gray-100 dark:hover:bg-gray-800
                           text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white ml-2"
                    title="Minimize player">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
            </button>
        </div>
    </div>
    </template>
    
    {{-- Error Toast --}}
    <div x-show="error" 
         x-cloak 
         x-transition
         class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 px-4 py-2 bg-red-500 text-white text-sm rounded-lg shadow-lg">
        <span x-text="error"></span>
    </div>
</div>

{{-- Add to Playlist Modal --}}
<div x-data="playlistModal()"
     x-show="open"
     x-cloak
     @tesotunes:add-to-playlist.window="open = true; fetchPlaylists()"
     @keydown.escape.window="open = false"
     class="fixed inset-0 z-[60] flex items-center justify-center p-4">
    
    {{-- Backdrop --}}
    <div class="absolute inset-0 bg-black/50" @click="open = false"></div>
    
    {{-- Modal --}}
    <div class="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
         x-transition:enter="transition ease-out duration-200"
         x-transition:enter-start="opacity-0 scale-95"
         x-transition:enter-end="opacity-100 scale-100">
        
        {{-- Header --}}
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Add to Playlist</h3>
            <button @click="open = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>
        
        {{-- Content --}}
        <div class="p-5 max-h-80 overflow-y-auto">
            {{-- Loading --}}
            <div x-show="loading" class="flex items-center justify-center py-8">
                <svg class="w-8 h-8 animate-spin text-emerald-500" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
            </div>
            
            {{-- Create New Playlist --}}
            <div x-show="!loading" class="mb-4">
                <template x-if="!creating">
                    <button @click="creating = true" 
                            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                        </svg>
                        <span>Create New Playlist</span>
                    </button>
                </template>
                
                <template x-if="creating">
                    <div class="flex gap-2">
                        <input type="text" 
                               x-model="newPlaylistName" 
                               placeholder="Playlist name..."
                               @keydown.enter="createPlaylist()"
                               class="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                        <button @click="createPlaylist()" 
                                :disabled="!newPlaylistName.trim()"
                                class="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed">
                            Create
                        </button>
                        <button @click="creating = false; newPlaylistName = ''" 
                                class="px-3 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                            Cancel
                        </button>
                    </div>
                </template>
            </div>
            
            {{-- Playlist List --}}
            <div x-show="!loading && playlists.length > 0" class="space-y-2">
                <template x-for="playlist in playlists" :key="playlist.id">
                    <button @click="addToSelectedPlaylist(playlist.id)"
                            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left">
                        <div class="w-10 h-10 rounded bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
                            </svg>
                        </div>
                        <div class="flex-1 min-w-0">
                            <h4 class="font-medium text-gray-900 dark:text-white truncate" x-text="playlist.name || playlist.title"></h4>
                            <p class="text-xs text-gray-500 dark:text-gray-400" x-text="`${playlist.songs_count || playlist.tracks_count || 0} tracks`"></p>
                        </div>
                    </button>
                </template>
            </div>
            
            {{-- No Playlists --}}
            <div x-show="!loading && playlists.length === 0 && !creating" class="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No playlists yet. Create one above!</p>
            </div>
        </div>
    </div>
</div>

<script>
document.addEventListener('alpine:init', () => {
    Alpine.data('playlistModal', () => ({
        open: false,
        playlists: [],
        loading: false,
        creating: false,
        newPlaylistName: '',
        
        fetchPlaylists() {
            this.loading = true;
            // Correct endpoint: /api/v1/my/playlists
            fetch('/api/v1/my/playlists', {
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
                }
            })
            .then(r => {
                if (!r.ok) throw new Error('Failed to fetch playlists');
                return r.json();
            })
            .then(data => {
                // Handle paginated response - data is in data.data for paginated results
                this.playlists = data.data?.data || data.data || data.playlists || [];
                this.loading = false;
            })
            .catch((err) => {
                console.error('[Playlist Modal] Fetch error:', err);
                this.playlists = [];
                this.loading = false;
            });
        },
        
        createPlaylist() {
            if (!this.newPlaylistName.trim()) return;
            
            // API expects 'title' not 'name'
            fetch('/api/v1/playlists', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
                },
                body: JSON.stringify({ 
                    title: this.newPlaylistName,
                    is_public: true 
                })
            })
            .then(r => {
                if (!r.ok) throw new Error('Failed to create playlist');
                return r.json();
            })
            .then(data => {
                console.log('[Playlist Modal] Create response:', data);
                if (data.success && data.data) {
                    const newPlaylist = data.data;
                    this.playlists.unshift(newPlaylist);
                    this.addToSelectedPlaylist(newPlaylist.id);
                } else if (data.playlist || data.id) {
                    const newPlaylist = data.playlist || data;
                    this.playlists.unshift(newPlaylist);
                    this.addToSelectedPlaylist(newPlaylist.id);
                } else {
                    console.error('[Playlist Modal] Unexpected response:', data);
                    if (Alpine.store('global')?.showNotification) {
                        Alpine.store('global').showNotification(data.message || 'Failed to create playlist', 'error');
                    }
                }
                this.creating = false;
                this.newPlaylistName = '';
            })
            .catch((err) => {
                console.error('[Playlist Modal] Create error:', err);
                this.creating = false;
                if (Alpine.store('global')?.showNotification) {
                    Alpine.store('global').showNotification('Failed to create playlist', 'error');
                }
            });
        },
        
        addToSelectedPlaylist(playlistId) {
            const track = window.TesoTunes?.state?.currentTrack;
            if (!track) {
                console.error('[Playlist Modal] No current track to add');
                if (Alpine.store('global')?.showNotification) {
                    Alpine.store('global').showNotification('No track selected', 'error');
                }
                return;
            }
            
            console.log('[Playlist Modal] Adding track', track.id, 'to playlist', playlistId);
            
            // Correct endpoint: /api/v1/playlists/{playlist}/songs/{song}
            fetch(`/api/v1/playlists/${playlistId}/songs/${track.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
                }
            })
            .then(r => {
                if (!r.ok) {
                    return r.json().then(err => { throw err; });
                }
                return r.json();
            })
            .then(data => {
                console.log('[Playlist Modal] Add song response:', data);
                this.open = false;
                // Show success notification
                if (Alpine.store('global')?.showNotification) {
                    Alpine.store('global').showNotification('Added to playlist!', 'success');
                } else {
                    // Fallback notification
                    window.dispatchEvent(new CustomEvent('show-notification', {
                        detail: { type: 'success', message: 'Added to playlist!' }
                    }));
                }
            })
            .catch((err) => {
                console.error('[Playlist Modal] Add song error:', err);
                const message = err.message || 'Failed to add to playlist';
                if (Alpine.store('global')?.showNotification) {
                    Alpine.store('global').showNotification(message, 'error');
                } else {
                    window.dispatchEvent(new CustomEvent('show-notification', {
                        detail: { type: 'error', message: message }
                    }));
                }
            });
        }
    }));
});
</script>
