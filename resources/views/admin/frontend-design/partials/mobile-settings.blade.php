<!-- Mobile Settings -->

<!-- Layout Section -->
<div class="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
    <h3 class="text-lg font-medium text-gray-900 dark:text-white dark:text-white mb-4">Layout Settings</h3>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Bottom Navigation -->
        <div>
            <label class="flex items-center">
                <input type="checkbox" name="layout.enable_bottom_nav" value="1" 
                       {{ ($settingsArray['layout.enable_bottom_nav'] ?? true) ? 'checked' : '' }}
                       class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                <span class="ml-2 text-sm text-gray-700">Enable Bottom Navigation</span>
            </label>
            <p class="mt-1 text-xs text-gray-500">Show navigation menu at the bottom of the screen</p>
        </div>

        <!-- Sticky Player -->
        <div>
            <label class="flex items-center">
                <input type="checkbox" name="layout.enable_sticky_player" value="1" 
                       {{ ($settingsArray['layout.enable_sticky_player'] ?? true) ? 'checked' : '' }}
                       class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                <span class="ml-2 text-sm text-gray-700">Enable Sticky Mini Player</span>
            </label>
            <p class="mt-1 text-xs text-gray-500">Show persistent mini player at the bottom</p>
        </div>

        <!-- Header Style -->
        <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Header Style</label>
            <select name="layout.header_style" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                <option value="simple" {{ ($settingsArray['layout.header_style'] ?? 'simple') == 'simple' ? 'selected' : '' }}>Simple (Logo Only)</option>
                <option value="full" {{ ($settingsArray['layout.header_style'] ?? 'simple') == 'full' ? 'selected' : '' }}>Full (Logo + Menu)</option>
            </select>
        </div>
    </div>
</div>

<!-- Home Page Sections -->
<div class="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
    <h3 class="text-lg font-medium text-gray-900 dark:text-white dark:text-white mb-4">Home Page Sections</h3>
    
    <div class="space-y-4">
        <!-- Trending Songs -->
        <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div class="flex items-center">
                <svg class="w-6 h-6 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
                <div>
                    <label class="text-sm font-medium text-gray-900">Trending Songs</label>
                    <p class="text-xs text-gray-500">Top trending tracks in the last 30 days</p>
                </div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="sections.show_trending_songs" value="1" 
                       {{ ($settingsArray['sections.show_trending_songs'] ?? true) ? 'checked' : '' }}
                       class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
        </div>

        <!-- Popular Artists -->
        <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div class="flex items-center">
                <svg class="w-6 h-6 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <div>
                    <label class="text-sm font-medium text-gray-900">Popular Artists</label>
                    <p class="text-xs text-gray-500">Top artists by followers and songs</p>
                </div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="sections.show_popular_artists" value="1" 
                       {{ ($settingsArray['sections.show_popular_artists'] ?? true) ? 'checked' : '' }}
                       class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
        </div>

        <!-- Popular Albums -->
        <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div class="flex items-center">
                <svg class="w-6 h-6 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                </svg>
                <div>
                    <label class="text-sm font-medium text-gray-900">Popular Albums</label>
                    <p class="text-xs text-gray-500">Top albums by plays and downloads</p>
                </div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="sections.show_popular_albums" value="1" 
                       {{ ($settingsArray['sections.show_popular_albums'] ?? true) ? 'checked' : '' }}
                       class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
        </div>

        <!-- Radio Stations -->
        <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div class="flex items-center">
                <svg class="w-6 h-6 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/>
                </svg>
                <div>
                    <label class="text-sm font-medium text-gray-900">Radio Stations</label>
                    <p class="text-xs text-gray-500">Curated playlists and radio</p>
                </div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="sections.show_radio_stations" value="1" 
                       {{ ($settingsArray['sections.show_radio_stations'] ?? true) ? 'checked' : '' }}
                       class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
        </div>

        <!-- Featured Charts -->
        <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div class="flex items-center">
                <svg class="w-6 h-6 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                <div>
                    <label class="text-sm font-medium text-gray-900">Featured Charts</label>
                    <p class="text-xs text-gray-500">Genre-based music charts</p>
                </div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="sections.show_featured_charts" value="1" 
                       {{ ($settingsArray['sections.show_featured_charts'] ?? true) ? 'checked' : '' }}
                       class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
        </div>
    </div>
</div>

<!-- Player Settings -->
<div class="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
    <h3 class="text-lg font-medium text-gray-900 dark:text-white dark:text-white mb-4">Player Settings</h3>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Fullscreen Mode -->
        <div>
            <label class="flex items-center">
                <input type="checkbox" name="player.fullscreen_mode" value="1" 
                       {{ ($settingsArray['player.fullscreen_mode'] ?? true) ? 'checked' : '' }}
                       class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                <span class="ml-2 text-sm text-gray-700">Fullscreen Player on Play</span>
            </label>
            <p class="mt-1 text-xs text-gray-500">Expand player to fullscreen when song is clicked</p>
        </div>

        <!-- Show Artwork -->
        <div>
            <label class="flex items-center">
                <input type="checkbox" name="player.show_artwork" value="1" 
                       {{ ($settingsArray['player.show_artwork'] ?? true) ? 'checked' : '' }}
                       class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                <span class="ml-2 text-sm text-gray-700">Show Album Artwork</span>
            </label>
            <p class="mt-1 text-xs text-gray-500">Display artwork in player</p>
        </div>

        <!-- Show Lyrics -->
        <div>
            <label class="flex items-center">
                <input type="checkbox" name="player.show_lyrics" value="1" 
                       {{ ($settingsArray['player.show_lyrics'] ?? false) ? 'checked' : '' }}
                       class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                <span class="ml-2 text-sm text-gray-700">Show Lyrics</span>
            </label>
            <p class="mt-1 text-xs text-gray-500">Display lyrics tab in player</p>
        </div>
    </div>
</div>

<!-- Theme Settings -->
<div>
    <h3 class="text-lg font-medium text-gray-900 dark:text-white dark:text-white mb-4">Theme Settings</h3>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Primary Color -->
        <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Color</label>
            <input type="color" name="theme.primary_color" 
                   value="{{ $settingsArray['theme.primary_color'] ?? '#1DB954' }}"
                   class="h-10 w-full rounded border-gray-300 cursor-pointer">
            <p class="mt-1 text-xs text-gray-500">Main accent color</p>
        </div>

        <!-- Background Color -->
        <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Background Color</label>
            <input type="color" name="theme.background_color" 
                   value="{{ $settingsArray['theme.background_color'] ?? '#121212' }}"
                   class="h-10 w-full rounded border-gray-300 cursor-pointer">
            <p class="mt-1 text-xs text-gray-500">Main background color</p>
        </div>

        <!-- Text Color -->
        <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Text Color</label>
            <input type="color" name="theme.text_color" 
                   value="{{ $settingsArray['theme.text_color'] ?? '#FFFFFF' }}"
                   class="h-10 w-full rounded border-gray-300 cursor-pointer">
            <p class="mt-1 text-xs text-gray-500">Main text color</p>
        </div>
    </div>
</div>
