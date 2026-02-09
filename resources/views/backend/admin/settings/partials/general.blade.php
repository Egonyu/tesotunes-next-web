{{-- General Settings Partial --}}
<div x-show="activeSection === 'general'" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 transform translate-y-4" x-transition:enter-end="opacity-100 transform translate-y-0">
    <div class="settings-card" x-data="{ activeTab: 'platform' }">
        <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-100 mb-4">General Settings</h3>

        <!-- Card Navigation Tabs -->
        <div class="card-nav-tabs">
            <div class="flex space-x-0 border-b border-slate-200 dark:border-navy-600">
                <button @click="activeTab = 'platform'" :class="activeTab === 'platform' ? 'active' : ''" class="nav-tab">
                    Platform Info
                </button>
                <button @click="activeTab = 'features'" :class="activeTab === 'features' ? 'active' : ''" class="nav-tab">
                    Features
                </button>
                <button @click="activeTab = 'localization'" :class="activeTab === 'localization' ? 'active' : ''" class="nav-tab">
                    Localization
                </button>
                <button @click="activeTab = 'maintenance'" :class="activeTab === 'maintenance' ? 'active' : ''" class="nav-tab">
                    Maintenance
                </button>
            </div>
        </div>

        <!-- Platform Information Tab -->
        <div x-show="activeTab === 'platform'" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100">
            <form @submit.prevent="saveTabSettings('general', 'platform')" id="platform-form" enctype="multipart/form-data">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Logo Management Section -->
                    <div class="md:col-span-2 p-4 bg-slate-50 dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-600">
                        <h4 class="text-md font-medium text-slate-700 dark:text-navy-200 mb-4 flex items-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                            Platform Logo
                        </h4>
                        <div class="flex flex-col sm:flex-row items-start gap-6" x-data="logoUploader()">
                            <!-- Current Logo Preview -->
                            <div class="flex flex-col items-center">
                                <div class="w-24 h-24 rounded-lg border-2 border-dashed border-slate-300 dark:border-navy-500 flex items-center justify-center bg-white dark:bg-navy-700 overflow-hidden">
                                    @php
                                        $currentLogo = $generalSettings['site_logo'] ?? '/images/app-logo.svg';
                                    @endphp
                                    <img x-ref="logoPreview" 
                                         src="{{ asset($currentLogo) }}" 
                                         alt="Platform Logo" 
                                         class="max-w-full max-h-full object-contain">
                                </div>
                                <span class="text-xs text-slate-500 dark:text-navy-400 mt-2">Current Logo</span>
                            </div>
                            
                            <!-- Upload Controls -->
                            <div class="flex-1 space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Upload New Logo</label>
                                    <div class="flex items-center gap-3">
                                        <input type="file" 
                                               name="site_logo" 
                                               accept="image/png,image/jpeg,image/svg+xml,image/webp"
                                               @change="previewLogo($event)"
                                               class="hidden" 
                                               x-ref="logoInput"
                                               id="logo-upload-input">
                                        <label for="logo-upload-input" 
                                               class="btn bg-slate-200 dark:bg-navy-600 text-slate-700 dark:text-navy-100 px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-navy-500 cursor-pointer inline-flex items-center gap-2">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                                            </svg>
                                            Choose File
                                        </label>
                                        <button type="button" 
                                                @click="removeLogo()"
                                                x-show="hasNewLogo || '{{ $currentLogo }}' !== '/images/app-logo.svg'"
                                                class="btn bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 inline-flex items-center gap-2">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                            </svg>
                                            Remove
                                        </button>
                                    </div>
                                    <input type="hidden" name="remove_logo" x-ref="removeLogoInput" value="0">
                                </div>
                                <p class="text-xs text-slate-500 dark:text-navy-400">
                                    Supported formats: PNG, JPG, SVG, WebP. Maximum size: 2MB. Recommended: 200x200px
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Platform Name</label>
                        <input type="text" name="platform_name" class="form-input w-full"
                               value="{{ $generalSettings['platform_name'] ?? 'LineOne Music' }}"
                               placeholder="Platform Name">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Platform URL</label>
                        <input type="url" name="platform_url" class="form-input w-full"
                               value="{{ $generalSettings['platform_url'] ?? config('app.url') }}"
                               placeholder="Platform URL">
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Platform Description</label>
                        <textarea name="platform_description" class="form-input w-full h-24"
                                  placeholder="Platform Description">{{ $generalSettings['platform_description'] ?? 'Your premier music platform for discovering and sharing amazing music.' }}</textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Support Email</label>
                        <input type="email" name="support_email" class="form-input w-full"
                               value="{{ $generalSettings['support_email'] ?? 'support@lineonemusic.com' }}"
                               placeholder="Support Email">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Admin Contact</label>
                        <input type="email" name="admin_contact" class="form-input w-full"
                               value="{{ $generalSettings['admin_contact'] ?? 'admin@lineonemusic.com' }}"
                               placeholder="Admin Contact">
                    </div>
                    <div class="md:col-span-2">
                        <div class="flex items-center justify-between mb-2">
                            <label class="block text-sm font-medium text-slate-600 dark:text-navy-300">Environment Mode</label>
                            @php
                                $currentEnv = $generalSettings['app_environment'] ?? config('app.env');
                                $isProd = $currentEnv === 'production';
                            @endphp
                            <span class="px-3 py-1 text-xs font-semibold rounded-full {{ $isProd ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' }}">
                                Currently: {{ strtoupper($currentEnv) }}
                            </span>
                        </div>
                        <div class="flex items-center space-x-4 p-4 bg-slate-50 dark:bg-navy-800 rounded-lg border-2 {{ $isProd ? 'border-green-200 dark:border-green-800' : 'border-blue-200 dark:border-blue-800' }}">
                            <div class="flex-1">
                                <p class="font-medium text-slate-700 dark:text-navy-100">Application Environment</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400">
                                    {{ $isProd ? 'Production mode enables caching and disables debug tools' : 'Development mode enables debugging and disables caching' }}
                                </p>
                            </div>
                            <div class="flex items-center space-x-3" x-data="{ envChecked: {{ $isProd ? 'true' : 'false' }} }">
                                <span class="text-sm font-medium" :class="!envChecked ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-600 dark:text-navy-300'">Development</span>
                                <label class="toggle-switch">
                                    <input type="checkbox" name="app_environment" value="production"
                                           x-model="envChecked"
                                           {{ $isProd ? 'checked' : '' }}>
                                    <span class="toggle-slider"></span>
                                </label>
                                <span class="text-sm font-medium" :class="envChecked ? 'text-green-600 dark:text-green-400 font-bold' : 'text-slate-600 dark:text-navy-300'">Production</span>
                            </div>
                        </div>
                        <div class="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <div class="flex items-start space-x-2">
                                <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                                </svg>
                                <p class="text-xs text-yellow-800 dark:text-yellow-300">
                                    <strong>Warning:</strong> Changing the environment will clear all caches and update the .env file. Production mode should only be enabled on live servers.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex justify-end mt-6 pt-4 border-t border-slate-200 dark:border-navy-600">
                    <button type="submit" class="btn bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90">
                        Save Platform Settings
                    </button>
                </div>
            </form>
        </div>

        <!-- Features Tab -->
        <div x-show="activeTab === 'features'" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100">
            <form @submit.prevent="saveTabSettings('general', 'features')" id="features-form">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-4">
                        <h4 class="text-md font-medium text-slate-700 dark:text-navy-200">Frontend Features</h4>

                        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                            <div>
                                <p class="font-medium text-slate-700 dark:text-navy-100">Music Streaming</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400">Enable music streaming functionality</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" name="music_streaming_enabled" value="1"
                                       {{ ($generalSettings['music_streaming_enabled'] ?? true) ? 'checked' : '' }}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                            <div>
                                <p class="font-medium text-slate-700 dark:text-navy-100">Music Downloads</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400">Allow users to download tracks</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" name="music_downloads_enabled" value="1"
                                       {{ ($generalSettings['music_downloads_enabled'] ?? true) ? 'checked' : '' }}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                            <div>
                                <p class="font-medium text-slate-700 dark:text-navy-100">Events & Tickets</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400">Enable event management and ticket sales</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" name="events_tickets_enabled" value="1"
                                       {{ ($generalSettings['events_tickets_enabled'] ?? true) ? 'checked' : '' }}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                            <div>
                                <p class="font-medium text-slate-700 dark:text-navy-100">Awards System</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400">Enable music awards and voting</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" name="awards_system_enabled" value="1"
                                       {{ ($generalSettings['awards_system_enabled'] ?? false) ? 'checked' : '' }}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <h4 class="text-md font-medium text-slate-700 dark:text-navy-200">Community Features</h4>

                        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                            <div>
                                <p class="font-medium text-slate-700 dark:text-navy-100">User Comments</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400">Allow comments on tracks and albums</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" name="user_comments_enabled" value="1"
                                       {{ ($generalSettings['user_comments_enabled'] ?? true) ? 'checked' : '' }}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                            <div>
                                <p class="font-medium text-slate-700 dark:text-navy-100">Artist Following</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400">Allow users to follow artists</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" name="artist_following_enabled" value="1"
                                       {{ ($generalSettings['artist_following_enabled'] ?? true) ? 'checked' : '' }}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                            <div>
                                <p class="font-medium text-slate-700 dark:text-navy-100">Playlists</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400">Enable user-created playlists</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" name="playlists_enabled" value="1"
                                       {{ ($generalSettings['playlists_enabled'] ?? true) ? 'checked' : '' }}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                            <div>
                                <p class="font-medium text-slate-700 dark:text-navy-100">Social Sharing</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400">Share music on social platforms</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" name="social_sharing_enabled" value="1"
                                       {{ ($generalSettings['social_sharing_enabled'] ?? false) ? 'checked' : '' }}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                            <div>
                                <p class="font-medium text-slate-700 dark:text-navy-100">Store Module</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400">Enable the online store and marketplace</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" name="store_enabled" value="1"
                                       {{ ($generalSettings['store_enabled'] ?? true) ? 'checked' : '' }}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                            <div>
                                <p class="font-medium text-slate-700 dark:text-navy-100">Forums</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400">Enable community forums and discussions</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" name="forums_enabled" value="1"
                                       {{ ($generalSettings['forums_enabled'] ?? false) ? 'checked' : '' }}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                            <div>
                                <p class="font-medium text-slate-700 dark:text-navy-100">Polls & Voting</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400">Enable polls and community voting</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" name="polls_enabled" value="1"
                                       {{ ($generalSettings['polls_enabled'] ?? false) ? 'checked' : '' }}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                            <div>
                                <p class="font-medium text-slate-700 dark:text-navy-100">Credits System</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400">Enable credit-based transactions and rewards</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" name="credits_enabled" value="1"
                                       {{ ($generalSettings['credits_enabled'] ?? true) ? 'checked' : '' }}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
                <div class="flex justify-end mt-6 pt-4 border-t border-slate-200 dark:border-navy-600">
                    <button type="submit" class="btn bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90">
                        Save Feature Settings
                    </button>
                </div>
            </form>
        </div>

        <!-- Localization Tab -->
        <div x-show="activeTab === 'localization'" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100">
            <form @submit.prevent="saveTabSettings('general', 'localization')">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Default Language</label>
                        <select name="default_language" class="form-select w-full">
                            <option value="en" {{ ($generalSettings['default_language'] ?? 'en') == 'en' ? 'selected' : '' }}>English</option>
                            <option value="sw" {{ ($generalSettings['default_language'] ?? 'en') == 'sw' ? 'selected' : '' }}>Swahili</option>
                            <option value="lg" {{ ($generalSettings['default_language'] ?? 'en') == 'lg' ? 'selected' : '' }}>Luganda</option>
                            <option value="fr" {{ ($generalSettings['default_language'] ?? 'en') == 'fr' ? 'selected' : '' }}>French</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Default Currency</label>
                        <select name="default_currency" class="form-select w-full">
                            <option value="UGX" {{ ($generalSettings['default_currency'] ?? 'UGX') == 'UGX' ? 'selected' : '' }}>Ugandan Shilling (UGX)</option>
                            <option value="USD" {{ ($generalSettings['default_currency'] ?? 'UGX') == 'USD' ? 'selected' : '' }}>US Dollar (USD)</option>
                            <option value="EUR" {{ ($generalSettings['default_currency'] ?? 'UGX') == 'EUR' ? 'selected' : '' }}>Euro (EUR)</option>
                            <option value="GBP" {{ ($generalSettings['default_currency'] ?? 'UGX') == 'GBP' ? 'selected' : '' }}>British Pound (GBP)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Timezone</label>
                        <select name="timezone" class="form-select w-full">
                            <option value="Africa/Kampala" {{ ($generalSettings['timezone'] ?? 'Africa/Kampala') == 'Africa/Kampala' ? 'selected' : '' }}>Africa/Kampala (EAT)</option>
                            <option value="UTC" {{ ($generalSettings['timezone'] ?? 'Africa/Kampala') == 'UTC' ? 'selected' : '' }}>UTC</option>
                            <option value="America/New_York" {{ ($generalSettings['timezone'] ?? 'Africa/Kampala') == 'America/New_York' ? 'selected' : '' }}>America/New_York (EST)</option>
                            <option value="Europe/London" {{ ($generalSettings['timezone'] ?? 'Africa/Kampala') == 'Europe/London' ? 'selected' : '' }}>Europe/London (GMT)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Date Format</label>
                        <select name="date_format" class="form-select w-full">
                            <option value="d/m/Y" {{ ($generalSettings['date_format'] ?? 'd/m/Y') == 'd/m/Y' ? 'selected' : '' }}>DD/MM/YYYY</option>
                            <option value="m/d/Y" {{ ($generalSettings['date_format'] ?? 'd/m/Y') == 'm/d/Y' ? 'selected' : '' }}>MM/DD/YYYY</option>
                            <option value="Y-m-d" {{ ($generalSettings['date_format'] ?? 'd/m/Y') == 'Y-m-d' ? 'selected' : '' }}>YYYY-MM-DD</option>
                            <option value="d-M-Y" {{ ($generalSettings['date_format'] ?? 'd/m/Y') == 'd-M-Y' ? 'selected' : '' }}>DD-MMM-YYYY</option>
                        </select>
                    </div>
                </div>
                <div class="flex justify-end mt-6 pt-4 border-t border-slate-200 dark:border-navy-600">
                    <button type="submit" class="btn bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90">
                        Save Localization Settings
                    </button>
                </div>
            </form>
        </div>

        <!-- Maintenance Tab -->
        <div x-show="activeTab === 'maintenance'" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100">
            <form @submit.prevent="saveTabSettings('general', 'maintenance')">
                <div class="space-y-6">
                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                        <div>
                            <p class="font-medium text-slate-700 dark:text-navy-100">Maintenance Mode</p>
                            <p class="text-sm text-slate-500 dark:text-navy-400">Put the platform in maintenance mode</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" name="maintenance_mode" value="1"
                                   {{ ($generalSettings['maintenance_mode'] ?? false) ? 'checked' : '' }}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Maintenance Message</label>
                        <textarea name="maintenance_message" class="form-input w-full h-24"
                                  placeholder="Message to display during maintenance">{{ $generalSettings['maintenance_message'] ?? "We're currently performing scheduled maintenance. Please check back in a few minutes." }}</textarea>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Expected Downtime</label>
                            <input type="text" name="expected_downtime" class="form-input w-full"
                                   value="{{ $generalSettings['expected_downtime'] ?? '' }}"
                                   placeholder="e.g., 30 minutes">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Contact Email</label>
                            <input type="email" name="maintenance_contact_email" class="form-input w-full"
                                   value="{{ $generalSettings['maintenance_contact_email'] ?? $generalSettings['support_email'] ?? 'support@lineonemusic.com' }}">
                        </div>
                    </div>
                </div>
                <div class="flex justify-end mt-6 pt-4 border-t border-slate-200 dark:border-navy-600">
                    <button type="submit" class="btn bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90">
                        Save Maintenance Settings
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
function logoUploader() {
    return {
        hasNewLogo: false,
        previewLogo(event) {
            const file = event.target.files[0];
            if (file) {
                // Validate file size (2MB max)
                if (file.size > 2 * 1024 * 1024) {
                    alert('File size must be less than 2MB');
                    event.target.value = '';
                    return;
                }
                
                // Validate file type
                const validTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
                if (!validTypes.includes(file.type)) {
                    alert('Invalid file type. Please upload PNG, JPG, SVG, or WebP');
                    event.target.value = '';
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.$refs.logoPreview.src = e.target.result;
                    this.hasNewLogo = true;
                    this.$refs.removeLogoInput.value = '0';
                };
                reader.readAsDataURL(file);
            }
        },
        removeLogo() {
            this.$refs.logoPreview.src = '{{ asset("/images/app-logo.svg") }}';
            this.$refs.logoInput.value = '';
            this.$refs.removeLogoInput.value = '1';
            this.hasNewLogo = false;
        }
    }
}
</script>