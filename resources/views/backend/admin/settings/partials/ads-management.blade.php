<div class="settings-card">
    <div class="flex justify-between items-start mb-6">
        <div>
            <h2 class="text-xl font-bold text-slate-800 dark:text-navy-50">🎫 Ads Management</h2>
            <p class="text-slate-500 dark:text-navy-300 mt-1">Configure Google AdSense and custom/private ads</p>
        </div>
    </div>

    <div x-data="{ activeTab: 'adsense' }" class="space-y-6">
        <!-- Tab Navigation -->
        <div class="card-nav-tabs flex border-b border-slate-200 dark:border-navy-600">
            <button @click="activeTab = 'adsense'" 
                    class="nav-tab"
                    :class="{ 'active': activeTab === 'adsense' }">
                Google AdSense
            </button>
            <button @click="activeTab = 'custom'" 
                    class="nav-tab"
                    :class="{ 'active': activeTab === 'custom' }">
                Private/Custom Ads
            </button>
            <button @click="activeTab = 'placements'" 
                    class="nav-tab"
                    :class="{ 'active': activeTab === 'placements' }">
                Ad Placements
            </button>
        </div>

        <!-- Google AdSense Tab -->
        <div x-show="activeTab === 'adsense'" x-transition>
            <form @submit.prevent="saveTabSettings('ads-management', 'adsense')" class="space-y-6">
                @csrf

                <!-- AdSense Status -->
                <div class="form-section">
                    <div class="flex items-center justify-between">
                        <div>
                            <label class="block text-sm font-semibold text-slate-700 dark:text-navy-100 mb-1">
                                Enable Google AdSense
                            </label>
                            <p class="text-xs text-slate-500 dark:text-navy-400">
                                Display Google AdSense ads on your platform
                            </p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" name="google_adsense_enabled" value="1"
                                   {{ $adsSettings['google_adsense_enabled'] ?? false ? 'checked' : '' }}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>

                <!-- Publisher ID -->
                <div class="form-section">
                    <label class="block text-sm font-semibold text-slate-700 dark:text-navy-100 mb-2">
                        AdSense Publisher ID
                        <span class="text-red-500">*</span>
                    </label>
                    <input type="text" 
                           name="google_adsense_publisher_id" 
                           value="{{ $adsSettings['google_adsense_publisher_id'] ?? '' }}"
                           placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                           class="form-input w-full">
                    <p class="text-xs text-slate-500 dark:text-navy-400 mt-1">
                        Your Google AdSense Publisher ID (format: ca-pub-XXXXXXXXXXXXXXXX)
                    </p>
                </div>

                <!-- Auto Ads -->
                <div class="form-section">
                    <div class="flex items-center justify-between">
                        <div>
                            <label class="block text-sm font-semibold text-slate-700 dark:text-navy-100 mb-1">
                                Auto Ads
                            </label>
                            <p class="text-xs text-slate-500 dark:text-navy-400">
                                Let Google automatically place ads
                            </p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" name="google_adsense_auto_ads" value="1"
                                   {{ $adsSettings['google_adsense_auto_ads'] ?? false ? 'checked' : '' }}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>

                <!-- Ad Slot IDs -->
                <div class="form-section">
                    <label class="block text-sm font-semibold text-slate-700 dark:text-navy-100 mb-3">
                        Ad Slot Configuration
                    </label>
                    <div class="space-y-3">
                        <div>
                            <label class="text-xs font-medium text-slate-600 dark:text-navy-300">Header Ad Slot</label>
                            <input type="text" name="adsense_header_slot" 
                                   value="{{ $adsSettings['adsense_header_slot'] ?? '' }}"
                                   placeholder="1234567890"
                                   class="form-input w-full mt-1">
                        </div>
                        <div>
                            <label class="text-xs font-medium text-slate-600 dark:text-navy-300">Sidebar Ad Slot</label>
                            <input type="text" name="adsense_sidebar_slot" 
                                   value="{{ $adsSettings['adsense_sidebar_slot'] ?? '' }}"
                                   placeholder="1234567890"
                                   class="form-input w-full mt-1">
                        </div>
                        <div>
                            <label class="text-xs font-medium text-slate-600 dark:text-navy-300">Footer Ad Slot</label>
                            <input type="text" name="adsense_footer_slot" 
                                   value="{{ $adsSettings['adsense_footer_slot'] ?? '' }}"
                                   placeholder="1234567890"
                                   class="form-input w-full mt-1">
                        </div>
                    </div>
                </div>

                <!-- Save Button -->
                <div class="flex justify-end pt-4 border-t border-slate-200 dark:border-navy-600">
                    <button type="submit" 
                            class="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl">
                        Save AdSense Settings
                    </button>
                </div>
            </form>
        </div>

        <!-- Private/Custom Ads Tab -->
        <div x-show="activeTab === 'custom'" x-transition>
            <div class="space-y-4">
                <!-- Add New Ad Button -->
                <div class="flex justify-between items-center mb-4">
                    <p class="text-sm text-slate-600 dark:text-navy-300">
                        Manage your custom advertisement campaigns
                    </p>
                    <button @click="$dispatch('open-ad-modal')" 
                            class="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200">
                        <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                        </svg>
                        Add New Ad
                    </button>
                </div>

                <!-- Custom Ads List -->
                <div class="space-y-3">
                    @forelse($customAds ?? [] as $ad)
                        <div class="bg-slate-50 dark:bg-navy-700 rounded-lg p-4 border border-slate-200 dark:border-navy-600">
                            <div class="flex items-start justify-between">
                                <div class="flex items-start space-x-4">
                                    @if($ad['image_url'] ?? null)
                                        <img src="{{ $ad['image_url'] }}" alt="{{ $ad['title'] }}" class="w-20 h-20 object-cover rounded-lg">
                                    @endif
                                    <div>
                                        <h4 class="font-semibold text-slate-800 dark:text-navy-100">{{ $ad['title'] ?? 'Untitled Ad' }}</h4>
                                        <p class="text-xs text-slate-500 dark:text-navy-400 mt-1">{{ $ad['description'] ?? '' }}</p>
                                        <div class="flex items-center space-x-3 mt-2">
                                            <span class="text-xs px-2 py-1 rounded-full {{ $ad['is_active'] ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' }}">
                                                {{ $ad['is_active'] ? 'Active' : 'Inactive' }}
                                            </span>
                                            <span class="text-xs text-slate-500 dark:text-navy-400">
                                                Placement: {{ ucfirst($ad['placement'] ?? 'header') }}
                                            </span>
                                            <span class="text-xs text-slate-500 dark:text-navy-400">
                                                Clicks: {{ $ad['click_count'] ?? 0 }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div class="flex items-center space-x-2">
                                    <button class="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                        </svg>
                                    </button>
                                    <button class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    @empty
                        <div class="text-center py-12 bg-slate-50 dark:bg-navy-700 rounded-lg border border-slate-200 dark:border-navy-600">
                            <svg class="w-16 h-16 mx-auto text-slate-300 dark:text-navy-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/>
                            </svg>
                            <p class="text-slate-500 dark:text-navy-400">No custom ads created yet</p>
                            <button @click="$dispatch('open-ad-modal')" class="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm">
                                Create your first ad
                            </button>
                        </div>
                    @endforelse
                </div>
            </div>
        </div>

        <!-- Ad Placements Tab -->
        <div x-show="activeTab === 'placements'" x-transition>
            <form @submit.prevent="saveTabSettings('ads-management', 'placements')" class="space-y-6">
                @csrf

                <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                    <p class="text-sm text-blue-700 dark:text-blue-300">
                        Configure where ads appear on your platform. Enable/disable specific placement locations.
                    </p>
                </div>

                <!-- Placement Toggles -->
                <div class="space-y-4">
                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-700 rounded-lg">
                        <div>
                            <h4 class="font-semibold text-slate-800 dark:text-navy-100">Header Banner</h4>
                            <p class="text-xs text-slate-500 dark:text-navy-400">Top of every page (Leaderboard 728x90)</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" name="placement_header" value="1"
                                   {{ $adsSettings['placement_header'] ?? true ? 'checked' : '' }}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-700 rounded-lg">
                        <div>
                            <h4 class="font-semibold text-slate-800 dark:text-navy-100">Sidebar Ads</h4>
                            <p class="text-xs text-slate-500 dark:text-navy-400">Right sidebar (Skyscraper 300x600)</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" name="placement_sidebar" value="1"
                                   {{ $adsSettings['placement_sidebar'] ?? true ? 'checked' : '' }}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-700 rounded-lg">
                        <div>
                            <h4 class="font-semibold text-slate-800 dark:text-navy-100">In-Feed Ads</h4>
                            <p class="text-xs text-slate-500 dark:text-navy-400">Between music listings (Native 300x250)</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" name="placement_infeed" value="1"
                                   {{ $adsSettings['placement_infeed'] ?? true ? 'checked' : '' }}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-700 rounded-lg">
                        <div>
                            <h4 class="font-semibold text-slate-800 dark:text-navy-100">Footer Banner</h4>
                            <p class="text-xs text-slate-500 dark:text-navy-400">Bottom of page (Leaderboard 728x90)</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" name="placement_footer" value="1"
                                   {{ $adsSettings['placement_footer'] ?? true ? 'checked' : '' }}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-700 rounded-lg">
                        <div>
                            <h4 class="font-semibold text-slate-800 dark:text-navy-100">Mobile Interstitial</h4>
                            <p class="text-xs text-slate-500 dark:text-navy-400">Full-screen mobile ads (320x480)</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" name="placement_mobile_interstitial" value="1"
                                   {{ $adsSettings['placement_mobile_interstitial'] ?? false ? 'checked' : '' }}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>

                <!-- Mobile Optimization -->
                <div class="form-section">
                    <div class="flex items-center justify-between">
                        <div>
                            <label class="block text-sm font-semibold text-slate-700 dark:text-navy-100 mb-1">
                                Mobile-Optimized Ads
                            </label>
                            <p class="text-xs text-slate-500 dark:text-navy-400">
                                Show smaller, mobile-friendly ad formats on mobile devices
                            </p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" name="mobile_optimized_ads" value="1"
                                   {{ $adsSettings['mobile_optimized_ads'] ?? true ? 'checked' : '' }}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>

                <!-- Save Button -->
                <div class="flex justify-end pt-4 border-t border-slate-200 dark:border-navy-600">
                    <button type="submit" 
                            class="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl">
                        Save Placement Settings
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
