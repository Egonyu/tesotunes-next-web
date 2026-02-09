<div class="settings-card" x-data="authenticationSettingsComponent(@js($settings ?? []))" x-init="initSettings()">
    <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-100 mb-4">Authentication Configuration</h3>

    <!-- Card Navigation Tabs -->
    <div class="card-nav-tabs flex space-x-4">
        <button @click="activeTab = 'general'" :class="activeTab === 'general' ? 'active' : ''" class="nav-tab">
            General
        </button>
        <button @click="activeTab = 'user_login'" :class="activeTab === 'user_login' ? 'active' : ''" class="nav-tab">
            User Login
        </button>
        <button @click="activeTab = 'artist_login'" :class="activeTab === 'artist_login' ? 'active' : ''" class="nav-tab">
            Artist Login
        </button>
        <button @click="activeTab = 'social'" :class="activeTab === 'social' ? 'active' : ''" class="nav-tab">
            Social Login
        </button>
    </div>

    <!-- General Tab -->
    <div x-show="activeTab === 'general'" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100">
        <form @submit.prevent="saveTabSettings('authentication', 'general')">
            <div class="space-y-6">
                <!-- Two-Factor Authentication -->
                <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                    <div>
                        <p class="font-medium text-slate-700 dark:text-navy-100">Enable Two-Factor Authentication</p>
                        <p class="text-sm text-slate-500 dark:text-navy-400">Require 2FA for enhanced security</p>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" name="two_factor_enabled" value="1" x-model="settings.general.two_factor_enabled">
                        <span class="toggle-slider"></span>
                    </label>
                </div>

                <!-- Password Requirements -->
                <div class="border-t border-slate-200 dark:border-navy-600 pt-6">
                    <h4 class="text-sm font-semibold text-slate-700 dark:text-navy-100 mb-4">Password Requirements</h4>
                    
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Minimum Password Length</label>
                        <input type="number" name="password_min_length" class="form-input w-full" x-model="settings.general.password_min_length" placeholder="8" min="6" max="32">
                        <p class="mt-1 text-xs text-slate-500 dark:text-navy-400">Minimum characters required (6-32)</p>
                    </div>

                    <div class="space-y-3 mt-4">
                        <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-navy-800 rounded">
                            <label class="text-sm text-slate-700 dark:text-navy-100">Require Special Character</label>
                            <input type="checkbox" name="password_require_special_char" value="1" x-model="settings.general.password_require_special_char" class="form-checkbox">
                        </div>

                        <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-navy-800 rounded">
                            <label class="text-sm text-slate-700 dark:text-navy-100">Require Number</label>
                            <input type="checkbox" name="password_require_number" value="1" x-model="settings.general.password_require_number" class="form-checkbox">
                        </div>

                        <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-navy-800 rounded">
                            <label class="text-sm text-slate-700 dark:text-navy-100">Require Uppercase Letter</label>
                            <input type="checkbox" name="password_require_uppercase" value="1" x-model="settings.general.password_require_uppercase" class="form-checkbox">
                        </div>
                    </div>
                </div>

                <!-- Session Management -->
                <div class="border-t border-slate-200 dark:border-navy-600 pt-6">
                    <h4 class="text-sm font-semibold text-slate-700 dark:text-navy-100 mb-4">Session Management</h4>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Session Lifetime (minutes)</label>
                            <input type="number" name="session_lifetime" class="form-input w-full" x-model="settings.general.session_lifetime" placeholder="120" min="1" max="1440">
                            <p class="mt-1 text-xs text-slate-500 dark:text-navy-400">Session expiry time (1-1440 minutes)</p>
                        </div>
                    </div>

                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg mt-4">
                        <div>
                            <p class="font-medium text-slate-700 dark:text-navy-100">Enable "Remember Me"</p>
                            <p class="text-sm text-slate-500 dark:text-navy-400">Allow users to stay logged in</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" name="remember_me_enabled" value="1" x-model="settings.general.remember_me_enabled">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            </div>

            <div class="flex justify-end mt-6 pt-4 border-t border-slate-200 dark:border-navy-600">
                <button type="submit" class="btn bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90">
                    Save General Settings
                </button>
            </div>
        </form>
    </div>

    <!-- User Login Tab -->
    <div x-show="activeTab === 'user_login'" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100">
        <form @submit.prevent="saveTabSettings('authentication', 'user_login')">
            <div class="space-y-6">
                <!-- Login Methods -->
                <div>
                    <h4 class="text-sm font-semibold text-slate-700 dark:text-navy-100 mb-4">Login Methods</h4>
                    
                    <div class="space-y-3">
                        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                            <div>
                                <p class="font-medium text-slate-700 dark:text-navy-100">Email Login</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400">Allow login with email address</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" name="email_login_enabled" value="1" x-model="settings.user_login.email_login_enabled">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                            <div>
                                <p class="font-medium text-slate-700 dark:text-navy-100">Phone Login</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400">Allow login with phone number</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" name="phone_login_enabled" value="1" x-model="settings.user_login.phone_login_enabled">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Security Settings -->
                <div class="border-t border-slate-200 dark:border-navy-600 pt-6">
                    <h4 class="text-sm font-semibold text-slate-700 dark:text-navy-100 mb-4">Security Settings</h4>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Max Login Attempts</label>
                            <input type="number" name="max_login_attempts" class="form-input w-full" x-model="settings.user_login.max_login_attempts" placeholder="5" min="1" max="20">
                            <p class="mt-1 text-xs text-slate-500 dark:text-navy-400">Failed attempts before lockout (1-20)</p>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Lockout Duration (minutes)</label>
                            <input type="number" name="lockout_duration" class="form-input w-full" x-model="settings.user_login.lockout_duration" placeholder="15" min="1" max="1440">
                            <p class="mt-1 text-xs text-slate-500 dark:text-navy-400">Account lockout duration (1-1440 minutes)</p>
                        </div>
                    </div>
                </div>

                <!-- Email Verification -->
                <div class="border-t border-slate-200 dark:border-navy-600 pt-6">
                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                        <div>
                            <p class="font-medium text-slate-700 dark:text-navy-100">Require Email Verification</p>
                            <p class="text-sm text-slate-500 dark:text-navy-400">Users must verify email before login</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" name="require_email_verification" value="1" x-model="settings.user_login.require_email_verification">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            </div>

            <div class="flex justify-end mt-6 pt-4 border-t border-slate-200 dark:border-navy-600">
                <button type="submit" class="btn bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90">
                    Save User Login Settings
                </button>
            </div>
        </form>
    </div>

    <!-- Artist Login Tab -->
    <div x-show="activeTab === 'artist_login'" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100">
        <form @submit.prevent="saveTabSettings('authentication', 'artist_login')">
            <div class="space-y-6">
                <div class="bg-blue-50 dark:bg-navy-800 border border-blue-200 dark:border-blue-900 rounded-lg p-4 mb-6">
                    <div class="flex items-start">
                        <i class="fas fa-info-circle text-blue-500 mr-3 mt-1"></i>
                        <div>
                            <p class="text-sm font-medium text-blue-900 dark:text-blue-100">Artist Verification</p>
                            <p class="text-xs text-blue-700 dark:text-blue-300 mt-1">Configure requirements for artist account creation and access</p>
                        </div>
                    </div>
                </div>

                <!-- Artist Verification Requirements -->
                <div class="space-y-3">
                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                        <div>
                            <p class="font-medium text-slate-700 dark:text-navy-100">Artist Verification Required</p>
                            <p class="text-sm text-slate-500 dark:text-navy-400">Require phone/email verification for artists</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" name="artist_verification_required" value="1" x-model="settings.artist_login.artist_verification_required">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                        <div>
                            <p class="font-medium text-slate-700 dark:text-navy-100">Admin Approval Required</p>
                            <p class="text-sm text-slate-500 dark:text-navy-400">Artists need admin approval before access</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" name="artist_approval_required" value="1" x-model="settings.artist_login.artist_approval_required">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                        <div>
                            <p class="font-medium text-slate-700 dark:text-navy-100">KYC Verification Required</p>
                            <p class="text-sm text-slate-500 dark:text-navy-400">Require identity verification documents</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" name="artist_kyc_required" value="1" x-model="settings.artist_login.artist_kyc_required">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>

                <!-- Information Panel -->
                <div class="border-t border-slate-200 dark:border-navy-600 pt-6">
                    <div class="bg-slate-50 dark:bg-navy-800 rounded-lg p-4">
                        <h5 class="text-sm font-semibold text-slate-700 dark:text-navy-100 mb-2">Current Requirements:</h5>
                        <ul class="text-xs text-slate-600 dark:text-navy-300 space-y-1">
                            <li x-show="settings.artist_login.artist_verification_required" class="flex items-center">
                                <i class="fas fa-check text-green-500 mr-2"></i> Phone/Email Verification
                            </li>
                            <li x-show="settings.artist_login.artist_approval_required" class="flex items-center">
                                <i class="fas fa-check text-green-500 mr-2"></i> Admin Approval
                            </li>
                            <li x-show="settings.artist_login.artist_kyc_required" class="flex items-center">
                                <i class="fas fa-check text-green-500 mr-2"></i> KYC Documentation
                            </li>
                            <li x-show="!settings.artist_login.artist_verification_required && !settings.artist_login.artist_approval_required && !settings.artist_login.artist_kyc_required" class="flex items-center text-amber-600">
                                <i class="fas fa-exclamation-triangle mr-2"></i> No requirements enabled
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="flex justify-end mt-6 pt-4 border-t border-slate-200 dark:border-navy-600">
                <button type="submit" class="btn bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90">
                    Save Artist Login Settings
                </button>
            </div>
        </form>
    </div>

    <!-- Social Login Tab -->
    <div x-show="activeTab === 'social'" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100">
        <form @submit.prevent="saveTabSettings('authentication', 'social')">
            <div class="space-y-6">
                <div class="bg-blue-50 dark:bg-navy-800 border border-blue-200 dark:border-blue-900 rounded-lg p-4 mb-6">
                    <div class="flex items-start">
                        <i class="fas fa-info-circle text-blue-500 mr-3 mt-1"></i>
                        <div>
                            <p class="text-sm font-medium text-blue-900 dark:text-blue-100">Social Login Integration</p>
                            <p class="text-xs text-blue-700 dark:text-blue-300 mt-1">Configure OAuth providers for social authentication</p>
                        </div>
                    </div>
                </div>

                <!-- Google Login -->
                <div>
                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg mb-4">
                        <div class="flex items-center">
                            <i class="fab fa-google text-2xl text-red-500 mr-3"></i>
                            <div>
                                <p class="font-medium text-slate-700 dark:text-navy-100">Google Login</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400">Allow login with Google accounts</p>
                            </div>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" name="google_login_enabled" value="1" x-model="settings.social.google_login_enabled">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div x-show="settings.social.google_login_enabled" class="pl-4 space-y-3">
                        <div>
                            <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Google Client ID</label>
                            <input type="text" name="google_client_id" class="form-input w-full" x-model="settings.social.google_client_id" placeholder="Your Google Client ID">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Google Client Secret</label>
                            <input type="password" name="google_client_secret" class="form-input w-full" placeholder="Your Google Client Secret">
                        </div>
                    </div>
                </div>

                <!-- Facebook Login -->
                <div class="border-t border-slate-200 dark:border-navy-600 pt-6">
                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg mb-4">
                        <div class="flex items-center">
                            <i class="fab fa-facebook text-2xl text-blue-600 mr-3"></i>
                            <div>
                                <p class="font-medium text-slate-700 dark:text-navy-100">Facebook Login</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400">Allow login with Facebook accounts</p>
                            </div>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" name="facebook_login_enabled" value="1" x-model="settings.social.facebook_login_enabled">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div x-show="settings.social.facebook_login_enabled" class="pl-4 space-y-3">
                        <div>
                            <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Facebook App ID</label>
                            <input type="text" name="facebook_client_id" class="form-input w-full" x-model="settings.social.facebook_client_id" placeholder="Your Facebook App ID">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Facebook App Secret</label>
                            <input type="password" name="facebook_client_secret" class="form-input w-full" placeholder="Your Facebook App Secret">
                        </div>
                    </div>
                </div>

                <!-- Twitter/X Login -->
                <div class="border-t border-slate-200 dark:border-navy-600 pt-6">
                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg mb-4">
                        <div class="flex items-center">
                            <i class="fab fa-twitter text-2xl text-blue-400 mr-3"></i>
                            <div>
                                <p class="font-medium text-slate-700 dark:text-navy-100">Twitter/X Login</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400">Allow login with Twitter/X accounts</p>
                            </div>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" name="twitter_login_enabled" value="1" x-model="settings.social.twitter_login_enabled">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div x-show="settings.social.twitter_login_enabled" class="pl-4 space-y-3">
                        <div>
                            <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Twitter API Key</label>
                            <input type="text" name="twitter_client_id" class="form-input w-full" x-model="settings.social.twitter_client_id" placeholder="Your Twitter API Key">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Twitter API Secret</label>
                            <input type="password" name="twitter_client_secret" class="form-input w-full" placeholder="Your Twitter API Secret">
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex justify-end mt-6 pt-4 border-t border-slate-200 dark:border-navy-600">
                <button type="submit" class="btn bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90">
                    Save Social Login Settings
                </button>
            </div>
        </form>
    </div>
</div>

<script>
function authenticationSettingsComponent(initialSettings) {
    return {
        activeTab: 'general',
        settings: initialSettings,
        
        initSettings() {
            // Ensure all boolean values are properly cast
            if (this.settings.general) {
                this.settings.general.two_factor_enabled = Boolean(this.settings.general.two_factor_enabled);
                this.settings.general.password_require_special_char = Boolean(this.settings.general.password_require_special_char);
                this.settings.general.password_require_number = Boolean(this.settings.general.password_require_number);
                this.settings.general.password_require_uppercase = Boolean(this.settings.general.password_require_uppercase);
                this.settings.general.remember_me_enabled = Boolean(this.settings.general.remember_me_enabled);
            }
            
            if (this.settings.user_login) {
                this.settings.user_login.email_login_enabled = Boolean(this.settings.user_login.email_login_enabled);
                this.settings.user_login.phone_login_enabled = Boolean(this.settings.user_login.phone_login_enabled);
                this.settings.user_login.require_email_verification = Boolean(this.settings.user_login.require_email_verification);
            }
            
            if (this.settings.artist_login) {
                this.settings.artist_login.artist_verification_required = Boolean(this.settings.artist_login.artist_verification_required);
                this.settings.artist_login.artist_approval_required = Boolean(this.settings.artist_login.artist_approval_required);
                this.settings.artist_login.artist_kyc_required = Boolean(this.settings.artist_login.artist_kyc_required);
            }
            
            if (this.settings.social) {
                this.settings.social.google_login_enabled = Boolean(this.settings.social.google_login_enabled);
                this.settings.social.facebook_login_enabled = Boolean(this.settings.social.facebook_login_enabled);
                this.settings.social.twitter_login_enabled = Boolean(this.settings.social.twitter_login_enabled);
            }
            
            console.log('Authentication Settings Initialized:', this.settings);
        }
    }
}
</script>
