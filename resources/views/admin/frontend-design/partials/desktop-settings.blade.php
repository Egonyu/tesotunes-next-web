<!-- Desktop Settings -->

<!-- Layout Section -->
<div class="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
    <h3 class="text-lg font-medium text-gray-900 dark:text-white dark:text-white mb-4">Layout Settings</h3>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Sidebar Position -->
        <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sidebar Position</label>
            <select name="layout.sidebar_position" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                <option value="left" {{ ($settingsArray['layout.sidebar_position'] ?? 'left') == 'left' ? 'selected' : '' }}>Left</option>
                <option value="right" {{ ($settingsArray['layout.sidebar_position'] ?? 'left') == 'right' ? 'selected' : '' }}>Right</option>
            </select>
        </div>

        <!-- Content Width -->
        <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content Width</label>
            <select name="layout.content_width" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                <option value="full" {{ ($settingsArray['layout.content_width'] ?? 'full') == 'full' ? 'selected' : '' }}>Full Width</option>
                <option value="boxed" {{ ($settingsArray['layout.content_width'] ?? 'full') == 'boxed' ? 'selected' : '' }}>Boxed (1200px)</option>
                <option value="wide" {{ ($settingsArray['layout.content_width'] ?? 'full') == 'wide' ? 'selected' : '' }}>Wide (1400px)</option>
            </select>
        </div>

        <!-- Sticky Header -->
        <div>
            <label class="flex items-center">
                <input type="checkbox" name="layout.enable_sticky_header" value="1" 
                       {{ ($settingsArray['layout.enable_sticky_header'] ?? true) ? 'checked' : '' }}
                       class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                <span class="ml-2 text-sm text-gray-700">Enable Sticky Header</span>
            </label>
            <p class="mt-1 text-xs text-gray-500">Keep header visible when scrolling</p>
        </div>
    </div>
</div>

<!-- Home Page Sections -->
<div class="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
    <h3 class="text-lg font-medium text-gray-900 dark:text-white dark:text-white mb-4">Home Page Sections</h3>
    
    <div class="space-y-4">
        <!-- Hero Banner -->
        <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div class="flex items-center">
                <svg class="w-6 h-6 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <div>
                    <label class="text-sm font-medium text-gray-900">Hero Banner</label>
                    <p class="text-xs text-gray-500">Large banner at the top of the page</p>
                </div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="sections.show_hero_banner" value="1" 
                       {{ ($settingsArray['sections.show_hero_banner'] ?? true) ? 'checked' : '' }}
                       class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
        </div>

        <!-- Featured Playlists -->
        <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div class="flex items-center">
                <svg class="w-6 h-6 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                <div>
                    <label class="text-sm font-medium text-gray-900">Featured Playlists</label>
                    <p class="text-xs text-gray-500">Curated and recommended playlists</p>
                </div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="sections.show_featured_playlists" value="1" 
                       {{ ($settingsArray['sections.show_featured_playlists'] ?? true) ? 'checked' : '' }}
                       class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
        </div>

        <!-- New Releases -->
        <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div class="flex items-center">
                <svg class="w-6 h-6 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div>
                    <label class="text-sm font-medium text-gray-900">New Releases</label>
                    <p class="text-xs text-gray-500">Recently added music</p>
                </div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="sections.show_new_releases" value="1" 
                       {{ ($settingsArray['sections.show_new_releases'] ?? false) ? 'checked' : '' }}
                       class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
        </div>

        <!-- Top Charts -->
        <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div class="flex items-center">
                <svg class="w-6 h-6 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
                <div>
                    <label class="text-sm font-medium text-gray-900">Top Charts</label>
                    <p class="text-xs text-gray-500">Popular music charts</p>
                </div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="sections.show_top_charts" value="1" 
                       {{ ($settingsArray['sections.show_top_charts'] ?? false) ? 'checked' : '' }}
                       class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
        </div>
    </div>
</div>

<!-- Theme Settings -->
<div>
    <h3 class="text-lg font-medium text-gray-900 dark:text-white dark:text-white mb-4">Theme Settings</h3>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    </div>
</div>
