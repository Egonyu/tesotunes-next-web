{{-- User Management Settings --}}
<div x-show="activeSection === 'users'" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 transform translate-y-4" x-transition:enter-end="opacity-100 transform translate-y-0">
    <div class="settings-card" x-data="{ activeTab: 'registration' }">
        <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-100 mb-4">User Management Settings</h3>

        <!-- Card Navigation Tabs -->
        <div class="card-nav-tabs">
            <div class="flex space-x-0 border-b border-slate-200 dark:border-navy-600">
                <button @click="activeTab = 'registration'" :class="activeTab === 'registration' ? 'active' : ''" class="nav-tab">
                    Registration
                </button>
                <button @click="activeTab = 'permissions'" :class="activeTab === 'permissions' ? 'active' : ''" class="nav-tab">
                    Permissions
                </button>
                <button @click="activeTab = 'restrictions'" :class="activeTab === 'restrictions' ? 'active' : ''" class="nav-tab">
                    Restrictions
                </button>
                <button @click="activeTab = 'moderation'" :class="activeTab === 'moderation' ? 'active' : ''" class="nav-tab">
                    Moderation
                </button>
            </div>
        </div>

        <form @submit.prevent="saveSettings('users')">
            <!-- Registration Tab -->
            <div x-show="activeTab === 'registration'" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100">
                <div class="space-y-6">
                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                        <div>
                            <p class="font-medium text-slate-700 dark:text-navy-100">User Registration</p>
                            <p class="text-sm text-slate-500 dark:text-navy-400">Allow new users to register accounts</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" name="user_registration_enabled" value="1" {{ ($userSettings['user_registration_enabled'] ?? true) ? 'checked' : '' }}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                        <div>
                            <p class="font-medium text-slate-700 dark:text-navy-100">Email Verification</p>
                            <p class="text-sm text-slate-500 dark:text-navy-400">Require email verification before activation</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" name="email_verification_required" value="1" {{ ($userSettings['email_verification_required'] ?? true) ? 'checked' : '' }}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                        <div>
                            <p class="font-medium text-slate-700 dark:text-navy-100">Admin Approval for Artists</p>
                            <p class="text-sm text-slate-500 dark:text-navy-400">Require admin approval for artist accounts</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" name="artist_approval_required" value="1" {{ ($userSettings['artist_approval_required'] ?? false) ? 'checked' : '' }}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                        <div>
                            <p class="font-medium text-slate-700 dark:text-navy-100">Social Login</p>
                            <p class="text-sm text-slate-500 dark:text-navy-400">Enable Google/Facebook login</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" name="social_login_enabled" value="1" {{ ($userSettings['social_login_enabled'] ?? false) ? 'checked' : '' }}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Default User Role</label>
                            <select name="default_user_role" class="form-select w-full">
                                <option value="user" {{ ($userSettings['default_user_role'] ?? 'user') === 'user' ? 'selected' : '' }}>User</option>
                                <option value="artist" {{ ($userSettings['default_user_role'] ?? 'user') === 'artist' ? 'selected' : '' }}>Artist</option>
                                <option value="moderator" {{ ($userSettings['default_user_role'] ?? 'user') === 'moderator' ? 'selected' : '' }}>Moderator</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Registration Limit (per IP/day)</label>
                            <input type="number" name="registration_limit_per_ip" class="form-input w-full" value="{{ $userSettings['registration_limit_per_ip'] ?? 5 }}" placeholder="Registration limit">
                        </div>
                    </div>
                </div>
            </div>

            <!-- Permissions Tab -->
            <div x-show="activeTab === 'permissions'" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-4">
                        <h4 class="text-md font-medium text-slate-700 dark:text-navy-200">User Permissions</h4>

                        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                            <div>
                                <p class="font-medium text-slate-700 dark:text-navy-100">Upload Music</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400">Allow users to upload tracks</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" name="user_can_upload_music" value="1" {{ ($userSettings['user_can_upload_music'] ?? true) ? 'checked' : '' }}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                            <div>
                                <p class="font-medium text-slate-700 dark:text-navy-100">Create Playlists</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400">Allow playlist creation</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" name="user_can_create_playlists" value="1" {{ ($userSettings['user_can_create_playlists'] ?? true) ? 'checked' : '' }}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                            <div>
                                <p class="font-medium text-slate-700 dark:text-navy-100">Post Comments</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400">Allow commenting on tracks</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" name="user_can_comment" value="1" {{ ($userSettings['user_can_comment'] ?? true) ? 'checked' : '' }}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                            <div>
                                <p class="font-medium text-slate-700 dark:text-navy-100">Download Music</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400">Allow track downloads</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" name="user_can_download" value="1" {{ ($userSettings['user_can_download'] ?? false) ? 'checked' : '' }}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <h4 class="text-md font-medium text-slate-700 dark:text-navy-200">Artist Permissions</h4>

                        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                            <div>
                                <p class="font-medium text-slate-700 dark:text-navy-100">Create Events</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400">Allow artists to create events</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" name="artist_can_create_events" value="1" {{ ($userSettings['artist_can_create_events'] ?? true) ? 'checked' : '' }}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                            <div>
                                <p class="font-medium text-slate-700 dark:text-navy-100">Sell Tickets</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400">Enable ticket sales for events</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" name="artist_can_sell_tickets" value="1" {{ ($userSettings['artist_can_sell_tickets'] ?? true) ? 'checked' : '' }}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                            <div>
                                <p class="font-medium text-slate-700 dark:text-navy-100">Monetize Content</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400">Enable revenue from streams</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" name="artist_can_monetize" value="1" {{ ($userSettings['artist_can_monetize'] ?? false) ? 'checked' : '' }}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                            <div>
                                <p class="font-medium text-slate-700 dark:text-navy-100">Analytics Access</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400">View detailed analytics</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" name="artist_has_analytics" value="1" {{ ($userSettings['artist_has_analytics'] ?? true) ? 'checked' : '' }}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Restrictions Tab -->
            <div x-show="activeTab === 'restrictions'" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Max Upload Size (MB)</label>
                        <input type="number" name="max_upload_size_mb" class="form-input w-full" value="{{ $userSettings['max_upload_size_mb'] ?? 100 }}" placeholder="Max upload size">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Daily Upload Limit</label>
                        <input type="number" name="daily_upload_limit" class="form-input w-full" value="{{ $userSettings['daily_upload_limit'] ?? 10 }}" placeholder="Daily upload limit">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Max Playlists per User</label>
                        <input type="number" name="max_playlists_per_user" class="form-input w-full" value="{{ $userSettings['max_playlists_per_user'] ?? 50 }}" placeholder="Max playlists">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Max Events per Artist (monthly)</label>
                        <input type="number" name="max_events_per_artist_monthly" class="form-input w-full" value="{{ $userSettings['max_events_per_artist_monthly'] ?? 5 }}" placeholder="Max events">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Comment Character Limit</label>
                        <input type="number" name="comment_character_limit" class="form-input w-full" value="{{ $userSettings['comment_character_limit'] ?? 500 }}" placeholder="Character limit">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Session Timeout (minutes)</label>
                        <input type="number" name="session_timeout_minutes" class="form-input w-full" value="{{ $userSettings['session_timeout_minutes'] ?? 120 }}" placeholder="Session timeout">
                    </div>
                </div>

                <div class="mt-6 space-y-4">
                    <h4 class="text-md font-medium text-slate-700 dark:text-navy-200">Content Restrictions</h4>

                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                        <div>
                            <p class="font-medium text-slate-700 dark:text-navy-100">Profanity Filter</p>
                            <p class="text-sm text-slate-500 dark:text-navy-400">Auto-filter explicit content</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" name="profanity_filter_enabled" value="1" {{ ($userSettings['profanity_filter_enabled'] ?? true) ? 'checked' : '' }}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                        <div>
                            <p class="font-medium text-slate-700 dark:text-navy-100">Auto-Moderate Comments</p>
                            <p class="text-sm text-slate-500 dark:text-navy-400">Automatically moderate user comments</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" name="auto_moderate_comments" value="1" {{ ($userSettings['auto_moderate_comments'] ?? false) ? 'checked' : '' }}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            </div>

            <!-- Moderation Tab -->
            <div x-show="activeTab === 'moderation'" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100">
                <div class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Auto-Ban After (violations)</label>
                            <input type="number" name="auto_ban_after_violations" class="form-input w-full" value="{{ $userSettings['auto_ban_after_violations'] ?? 3 }}" placeholder="Violation count">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Warning Before Ban</label>
                            <select name="warnings_before_ban" class="form-select w-full">
                                <option value="1" {{ ($userSettings['warnings_before_ban'] ?? 2) == 1 ? 'selected' : '' }}>1 Warning</option>
                                <option value="2" {{ ($userSettings['warnings_before_ban'] ?? 2) == 2 ? 'selected' : '' }}>2 Warnings</option>
                                <option value="3" {{ ($userSettings['warnings_before_ban'] ?? 2) == 3 ? 'selected' : '' }}>3 Warnings</option>
                                <option value="0" {{ ($userSettings['warnings_before_ban'] ?? 2) == 0 ? 'selected' : '' }}>No Warnings</option>
                            </select>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <h4 class="text-md font-medium text-slate-700 dark:text-navy-200">Auto-Moderation Features</h4>

                        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                            <div>
                                <p class="font-medium text-slate-700 dark:text-navy-100">Spam Detection</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400">Automatically detect and remove spam</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" name="spam_detection_enabled" value="1" {{ ($userSettings['spam_detection_enabled'] ?? true) ? 'checked' : '' }}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                            <div>
                                <p class="font-medium text-slate-700 dark:text-navy-100">Rate Limiting</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400">Limit rapid consecutive actions</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" name="rate_limiting_enabled" value="1" {{ ($userSettings['rate_limiting_enabled'] ?? true) ? 'checked' : '' }}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                            <div>
                                <p class="font-medium text-slate-700 dark:text-navy-100">IP Blocking</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400">Block suspicious IP addresses</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" name="ip_blocking_enabled" value="1" {{ ($userSettings['ip_blocking_enabled'] ?? false) ? 'checked' : '' }}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                            <div>
                                <p class="font-medium text-slate-700 dark:text-navy-100">Email Notifications</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400">Notify admins of violations</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" name="moderation_email_notifications" value="1" {{ ($userSettings['moderation_email_notifications'] ?? true) ? 'checked' : '' }}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex justify-end mt-6 pt-4 border-t border-slate-200 dark:border-navy-600">
                <button type="submit" class="btn bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90">
                    Save Changes
                </button>
            </div>
        </form>
    </div>
</div>
