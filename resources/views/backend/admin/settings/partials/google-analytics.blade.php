<div class="settings-card">
    <div class="flex justify-between items-start mb-6">
        <div>
            <h2 class="text-xl font-bold text-slate-800 dark:text-navy-50">📊 Google Analytics</h2>
            <p class="text-slate-500 dark:text-navy-300 mt-1">Configure Google Analytics GA4 tracking for your platform</p>
        </div>
    </div>

    <form @submit.prevent="saveSettings('google-analytics')" class="space-y-6">
        @csrf

        <!-- Google Analytics Status -->
        <div class="form-section">
            <div class="flex items-center justify-between">
                <div>
                    <label class="block text-sm font-semibold text-slate-700 dark:text-navy-100 mb-1">
                        Enable Google Analytics
                    </label>
                    <p class="text-xs text-slate-500 dark:text-navy-400">
                        Turn on/off Google Analytics tracking site-wide
                    </p>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" name="google_analytics_enabled" value="1" 
                           {{ $googleAnalyticsSettings['google_analytics_enabled'] ?? false ? 'checked' : '' }}>
                    <span class="toggle-slider"></span>
                </label>
            </div>
        </div>

        <!-- Measurement ID -->
        <div class="form-section">
            <label class="block text-sm font-semibold text-slate-700 dark:text-navy-100 mb-2">
                GA4 Measurement ID
                <span class="text-red-500">*</span>
            </label>
            <input type="text" 
                   name="google_analytics_measurement_id" 
                   value="{{ $googleAnalyticsSettings['google_analytics_measurement_id'] ?? '' }}"
                   placeholder="G-XXXXXXXXXX"
                   class="form-input w-full"
                   required>
            <p class="text-xs text-slate-500 dark:text-navy-400 mt-1">
                Your Google Analytics 4 Measurement ID (e.g., G-XXXXXXXXXX)
            </p>
        </div>

        <!-- Event Tracking -->
        <div class="form-section">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <label class="block text-sm font-semibold text-slate-700 dark:text-navy-100 mb-1">
                        Event Tracking
                    </label>
                    <p class="text-xs text-slate-500 dark:text-navy-400">
                        Track user interactions like song plays, downloads, etc.
                    </p>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" name="google_analytics_event_tracking" value="1"
                           {{ $googleAnalyticsSettings['google_analytics_event_tracking'] ?? true ? 'checked' : '' }}>
                    <span class="toggle-slider"></span>
                </label>
            </div>
        </div>

        <!-- E-commerce Tracking -->
        <div class="form-section">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <label class="block text-sm font-semibold text-slate-700 dark:text-navy-100 mb-1">
                        E-commerce Tracking
                    </label>
                    <p class="text-xs text-slate-500 dark:text-navy-400">
                        Track premium subscriptions and credit purchases
                    </p>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" name="google_analytics_ecommerce_tracking" value="1"
                           {{ $googleAnalyticsSettings['google_analytics_ecommerce_tracking'] ?? true ? 'checked' : '' }}>
                    <span class="toggle-slider"></span>
                </label>
            </div>
        </div>

        <!-- IP Anonymization (GDPR) -->
        <div class="form-section">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <label class="block text-sm font-semibold text-slate-700 dark:text-navy-100 mb-1">
                        IP Anonymization (GDPR)
                    </label>
                    <p class="text-xs text-slate-500 dark:text-navy-400">
                        Anonymize IP addresses for privacy compliance
                    </p>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" name="google_analytics_ip_anonymization" value="1"
                           {{ $googleAnalyticsSettings['google_analytics_ip_anonymization'] ?? true ? 'checked' : '' }}>
                    <span class="toggle-slider"></span>
                </label>
            </div>
        </div>

        <!-- Custom Events Configuration -->
        <div class="form-section">
            <label class="block text-sm font-semibold text-slate-700 dark:text-navy-100 mb-2">
                Custom Events (JSON)
            </label>
            <textarea name="google_analytics_custom_events" 
                      rows="6"
                      class="form-input w-full font-mono text-xs"
                      placeholder='{"song_play": true, "song_download": true, "subscription_purchase": true}'
            >{{ $googleAnalyticsSettings['google_analytics_custom_events'] ?? '' }}</textarea>
            <p class="text-xs text-slate-500 dark:text-navy-400 mt-1">
                Configure custom events to track (JSON format)
            </p>
        </div>

        <!-- Setup Instructions -->
        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div class="flex items-start space-x-3">
                <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                </svg>
                <div class="flex-1">
                    <h4 class="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">Setup Instructions</h4>
                    <ol class="text-xs text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
                        <li>Go to <a href="https://analytics.google.com" target="_blank" class="underline">Google Analytics</a></li>
                        <li>Create a new GA4 property or select existing one</li>
                        <li>Copy your Measurement ID (format: G-XXXXXXXXXX)</li>
                        <li>Paste it above and save settings</li>
                        <li>Analytics will start tracking within 24-48 hours</li>
                    </ol>
                </div>
            </div>
        </div>

        <!-- Save Button -->
        <div class="flex justify-end pt-4 border-t border-slate-200 dark:border-navy-600">
            <button type="submit" 
                    class="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl">
                Save Google Analytics Settings
            </button>
        </div>
    </form>
</div>
