{{-- Credit System Settings --}}
<div x-show="activeSection === 'credits'" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 transform translate-y-4" x-transition:enter-end="opacity-100 transform translate-y-0">
    <div class="settings-card" x-data="{ activeTab: 'rates' }">
        <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-100 mb-4">Credit System Configuration</h3>

        <!-- Card Navigation Tabs -->
        <div class="card-nav-tabs">
            <div class="flex space-x-0 border-b border-slate-200 dark:border-navy-600">
                <button @click="activeTab = 'rates'" :class="activeTab === 'rates' ? 'active' : ''" class="nav-tab">
                    Credit Rates
                </button>
                <button @click="activeTab = 'settings'" :class="activeTab === 'settings' ? 'active' : ''" class="nav-tab">
                    System Settings
                </button>
                <button @click="activeTab = 'bonuses'" :class="activeTab === 'bonuses' ? 'active' : ''" class="nav-tab">
                    Bonuses & Rewards
                </button>
                <button @click="activeTab = 'packages'" :class="activeTab === 'packages' ? 'active' : ''" class="nav-tab">
                    Credit Packages
                </button>
            </div>
        </div>

        <form @submit.prevent="saveSettings('credits')">
            <!-- Credit Rates Tab -->
            <div x-show="activeTab === 'rates'" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Stream Rate (credits)</label>
                        <input type="number" name="stream_rate" class="form-input w-full" value="{{ $creditSettings['credit_stream_rate'] ?? 1 }}" placeholder="Credits per stream">
                        <p class="text-xs text-slate-500 dark:text-navy-400 mt-1">Credits users earn per song stream</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Download Rate (credits)</label>
                        <input type="number" name="download_rate" class="form-input w-full" value="{{ $creditSettings['credit_download_rate'] ?? 5 }}" placeholder="Credits per download">
                        <p class="text-xs text-slate-500 dark:text-navy-400 mt-1">Credits required to download a song</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Upload Reward (credits)</label>
                        <input type="number" name="upload_reward" class="form-input w-full" value="{{ $creditSettings['credit_upload_reward'] ?? 20 }}" placeholder="Credits for upload">
                        <p class="text-xs text-slate-500 dark:text-navy-400 mt-1">Credits artists earn for uploading</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Comment Rate (credits)</label>
                        <input type="number" name="comment_rate" class="form-input w-full" value="{{ $creditSettings['credit_comment_rate'] ?? 2 }}" placeholder="Credits per comment">
                        <p class="text-xs text-slate-500 dark:text-navy-400 mt-1">Credits earned for commenting</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Share Rate (credits)</label>
                        <input type="number" name="share_rate" class="form-input w-full" value="{{ $creditSettings['credit_share_rate'] ?? 3 }}" placeholder="Credits per share">
                        <p class="text-xs text-slate-500 dark:text-navy-400 mt-1">Credits earned for sharing songs</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Playlist Create (credits)</label>
                        <input type="number" name="playlist_create_reward" class="form-input w-full" value="{{ $creditSettings['credit_playlist_reward'] ?? 15 }}" placeholder="Credits for playlist">
                        <p class="text-xs text-slate-500 dark:text-navy-400 mt-1">Credits earned for creating playlists</p>
                    </div>
                </div>
            </div>

            <!-- System Settings Tab -->
            <div x-show="activeTab === 'settings'" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100">
                <div class="space-y-6">
                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                        <div>
                            <p class="font-medium text-slate-700 dark:text-navy-100">Enable Credit System</p>
                            <p class="text-sm text-slate-500 dark:text-navy-400">Activate the credit/points system</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" name="credit_system_enabled" value="1" {{ ($creditSettings['credit_system_enabled'] ?? true) ? 'checked' : '' }}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                        <div>
                            <p class="font-medium text-slate-700 dark:text-navy-100">Credit Transfers</p>
                            <p class="text-sm text-slate-500 dark:text-navy-400">Allow users to transfer credits to each other</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" name="allow_credit_transfers" value="1" {{ ($creditSettings['credit_allow_transfers'] ?? true) ? 'checked' : '' }}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                        <div>
                            <p class="font-medium text-slate-700 dark:text-navy-100">Credit Expiration</p>
                            <p class="text-sm text-slate-500 dark:text-navy-400">Credits expire after a certain period</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" name="enable_credit_expiration" value="1" {{ ($creditSettings['credit_expiration_enabled'] ?? false) ? 'checked' : '' }}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Credit Expiry (days)</label>
                            <input type="number" name="credit_expiry_days" class="form-input w-full" value="{{ $creditSettings['credit_expiry_days'] ?? 365 }}" placeholder="Days until expiry">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Transfer Fee (%)</label>
                            <input type="number" name="credit_transfer_fee" class="form-input w-full" value="{{ $creditSettings['credit_transfer_fee'] ?? 5 }}" step="0.1" placeholder="Transfer fee percentage">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Minimum Transfer</label>
                            <input type="number" name="credit_min_transfer" class="form-input w-full" value="{{ $creditSettings['credit_min_transfer'] ?? 10 }}" placeholder="Minimum credits">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Maximum Transfer</label>
                            <input type="number" name="credit_max_transfer" class="form-input w-full" value="{{ $creditSettings['credit_max_transfer'] ?? 1000 }}" placeholder="Maximum credits">
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bonuses & Rewards Tab -->
            <div x-show="activeTab === 'bonuses'" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Registration Bonus</label>
                        <input type="number" name="registration_bonus" class="form-input w-full" value="{{ $creditSettings['credit_registration_bonus'] ?? 50 }}" placeholder="Registration bonus">
                        <p class="text-xs text-slate-500 dark:text-navy-400 mt-1">Credits given for new account</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Daily Login Bonus</label>
                        <input type="number" name="daily_bonus" class="form-input w-full" value="{{ $creditSettings['credit_daily_bonus'] ?? 10 }}" placeholder="Daily bonus">
                        <p class="text-xs text-slate-500 dark:text-navy-400 mt-1">Credits for daily login</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Email Verification Bonus</label>
                        <input type="number" name="email_verification_bonus" class="form-input w-full" value="{{ $creditSettings['credit_email_verification_bonus'] ?? 25 }}" placeholder="Email verification bonus">
                        <p class="text-xs text-slate-500 dark:text-navy-400 mt-1">Credits for email verification</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Referral Bonus</label>
                        <input type="number" name="referral_bonus" class="form-input w-full" value="{{ $creditSettings['credit_referral_bonus'] ?? 100 }}" placeholder="Referral bonus">
                        <p class="text-xs text-slate-500 dark:text-navy-400 mt-1">Credits for successful referrals</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Weekly Streak Bonus</label>
                        <input type="number" name="weekly_streak_bonus" class="form-input w-full" value="{{ $creditSettings['credit_weekly_streak_bonus'] ?? 50 }}" placeholder="Weekly streak bonus">
                        <p class="text-xs text-slate-500 dark:text-navy-400 mt-1">Credits for 7-day login streak</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Contest Winner Bonus</label>
                        <input type="number" name="contest_bonus" class="form-input w-full" value="{{ $creditSettings['credit_contest_bonus'] ?? 500 }}" placeholder="Contest bonus">
                        <p class="text-xs text-slate-500 dark:text-navy-400 mt-1">Credits for winning contests</p>
                    </div>
                </div>
            </div>

            <!-- Credit Packages Tab -->
            <div x-show="activeTab === 'packages'" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100">
                <div class="space-y-6">
                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                        <div>
                            <p class="font-medium text-slate-700 dark:text-navy-100">Enable Credit Purchases</p>
                            <p class="text-sm text-slate-500 dark:text-navy-400">Allow users to buy credit packages</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" name="credit_purchase_enabled" value="1" {{ ($creditSettings['credit_purchase_enabled'] ?? true) ? 'checked' : '' }}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <!-- Exchange Rate Setting -->
                    <div class="p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Credit to UGX Exchange Rate</label>
                        <div class="flex items-center gap-3">
                            <span class="text-slate-600 dark:text-navy-300">1 Credit =</span>
                            <input type="number" name="credit_to_ugx_rate" class="form-input w-32" value="{{ $creditSettings['credit_to_ugx_rate'] ?? 100 }}" min="1">
                            <span class="text-slate-600 dark:text-navy-300">UGX</span>
                        </div>
                        <p class="text-xs text-slate-500 dark:text-navy-400 mt-2">This rate is used for custom credit purchases on the top-up page</p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <!-- Package 1 -->
                        <div class="p-4 border border-slate-200 dark:border-navy-600 rounded-lg">
                            <h4 class="font-medium text-slate-700 dark:text-navy-100 mb-3">Starter Package</h4>
                            <div class="space-y-3">
                                <div>
                                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-1">Credits</label>
                                    <input type="number" name="package_1_credits" class="form-input w-full" value="{{ $creditSettings['package_1_credits'] ?? 100 }}">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-1">Price (UGX)</label>
                                    <input type="number" name="package_1_price" class="form-input w-full" value="{{ $creditSettings['package_1_price'] ?? 10000 }}">
                                </div>
                                <div class="flex items-center space-x-2">
                                    <input type="checkbox" name="package_1_active" value="1" class="form-checkbox" {{ ($creditSettings['package_1_active'] ?? true) ? 'checked' : '' }}>
                                    <span class="text-sm text-slate-600 dark:text-navy-300">Active</span>
                                </div>
                            </div>
                        </div>

                        <!-- Package 2 -->
                        <div class="p-4 border border-slate-200 dark:border-navy-600 rounded-lg">
                            <h4 class="font-medium text-slate-700 dark:text-navy-100 mb-3">Popular Package</h4>
                            <div class="space-y-3">
                                <div>
                                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-1">Credits</label>
                                    <input type="number" name="package_2_credits" class="form-input w-full" value="{{ $creditSettings['package_2_credits'] ?? 500 }}">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-1">Price (UGX)</label>
                                    <input type="number" name="package_2_price" class="form-input w-full" value="{{ $creditSettings['package_2_price'] ?? 20000 }}">
                                </div>
                                <div class="flex items-center space-x-2">
                                    <input type="checkbox" name="package_2_active" value="1" class="form-checkbox" {{ ($creditSettings['package_2_active'] ?? true) ? 'checked' : '' }}>
                                    <span class="text-sm text-slate-600 dark:text-navy-300">Active</span>
                                </div>
                            </div>
                        </div>

                        <!-- Package 3 -->
                        <div class="p-4 border border-slate-200 dark:border-navy-600 rounded-lg">
                            <h4 class="font-medium text-slate-700 dark:text-navy-100 mb-3">Premium Package</h4>
                            <div class="space-y-3">
                                <div>
                                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-1">Credits</label>
                                    <input type="number" name="package_3_credits" class="form-input w-full" value="{{ $creditSettings['package_3_credits'] ?? 1200 }}">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-1">Price (UGX)</label>
                                    <input type="number" name="package_3_price" class="form-input w-full" value="{{ $creditSettings['package_3_price'] ?? 40000 }}">
                                </div>
                                <div class="flex items-center space-x-2">
                                    <input type="checkbox" name="package_3_active" value="1" class="form-checkbox" {{ ($creditSettings['package_3_active'] ?? true) ? 'checked' : '' }}>
                                    <span class="text-sm text-slate-600 dark:text-navy-300">Active</span>
                                </div>
                            </div>
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
