{{-- Artist Management Settings Partial --}}
<div x-show="activeSection === 'artists'" 
     x-transition:enter="transition ease-out duration-300" 
     x-transition:enter-start="opacity-0 transform translate-y-4" 
     x-transition:enter-end="opacity-100 transform translate-y-0">
    
    <div class="settings-card" x-data="{ activeTab: 'verification' }">
        {{-- Header --}}
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
                <div class="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <svg class="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                    </svg>
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-100">Artist Management Configuration</h3>
                    <p class="text-sm text-slate-500 dark:text-navy-400">Manage artist verification, monetization, and restrictions</p>
                </div>
            </div>
            
            {{-- Artist Status Badge --}}
            @if($artistSettings['monetization_enabled'] ?? true)
                <div class="flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium bg-success/10 text-success">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span>Monetization Active</span>
                </div>
            @else
                <div class="flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium bg-slate-100 dark:bg-navy-700 text-slate-600 dark:text-navy-300">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span>Monetization Disabled</span>
                </div>
            @endif
        </div>

        {{-- Card Navigation Tabs --}}
        <div class="card-nav-tabs">
            <div class="flex space-x-0 border-b border-slate-200 dark:border-navy-600">
                <button @click="activeTab = 'verification'" 
                        :class="activeTab === 'verification' ? 'active' : ''" 
                        class="nav-tab flex items-center space-x-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span>Verification</span>
                </button>
                <button @click="activeTab = 'monetization'" 
                        :class="activeTab === 'monetization' ? 'active' : ''" 
                        class="nav-tab flex items-center space-x-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span>Monetization</span>
                </button>
                <button @click="activeTab = 'restrictions'" 
                        :class="activeTab === 'restrictions' ? 'active' : ''" 
                        class="nav-tab flex items-center space-x-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                    <span>Restrictions</span>
                </button>
            </div>
        </div>

        {{-- Verification Tab --}}
        <div x-show="activeTab === 'verification'" 
             x-transition:enter="transition ease-out duration-200" 
             x-transition:enter-start="opacity-0" 
             x-transition:enter-end="opacity-100">
            <form @submit.prevent="saveTabSettings('artists', 'verification')">
                <div class="space-y-6">
                    
                    {{-- Require Artist Verification --}}
                    <div class="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-900/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        <div class="flex-1">
                            <div class="flex items-center space-x-2">
                                <p class="font-semibold text-slate-800 dark:text-navy-100">Require Artist Verification</p>
                                <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300">Recommended</span>
                            </div>
                            <p class="text-sm text-slate-600 dark:text-navy-300 mt-1">Artists must be verified before uploading music</p>
                        </div>
                        <label class="toggle-switch ml-4">
                            <input type="checkbox" 
                                   name="artist_verification_required" 
                                   value="1" 
                                   {{ ($artistSettings['artist_verification_required'] ?? true) ? 'checked' : '' }}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    {{-- Auto-approve Artists --}}
                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700">
                        <div class="flex-1">
                            <p class="font-medium text-slate-700 dark:text-navy-100">Auto-approve Artists</p>
                            <p class="text-sm text-slate-500 dark:text-navy-400 mt-1">Automatically approve artist applications</p>
                        </div>
                        <label class="toggle-switch ml-4">
                            <input type="checkbox" 
                                   name="artist_auto_approval" 
                                   value="1"
                                   {{ ($artistSettings['artist_auto_approval'] ?? false) ? 'checked' : '' }}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    {{-- Require Government ID --}}
                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700">
                        <div class="flex-1">
                            <p class="font-medium text-slate-700 dark:text-navy-100">Require Government ID</p>
                            <p class="text-sm text-slate-500 dark:text-navy-400 mt-1">Artists must upload government-issued ID for verification</p>
                        </div>
                        <label class="toggle-switch ml-4">
                            <input type="checkbox" 
                                   name="require_government_id" 
                                   value="1"
                                   {{ ($artistSettings['require_government_id'] ?? true) ? 'checked' : '' }}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    {{-- Verification Configuration --}}
                    <div class="space-y-4">
                        <h4 class="text-sm font-semibold text-slate-700 dark:text-navy-200 uppercase tracking-wider">Verification Configuration</h4>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="space-y-2">
                                <label class="flex items-center space-x-2 text-sm font-medium text-slate-600 dark:text-navy-300">
                                    <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                                    </svg>
                                    <span>Max Uploads per Month</span>
                                </label>
                                <input type="number" 
                                       name="artist_max_uploads" 
                                       class="form-input w-full rounded-lg" 
                                       value="{{ $artistSettings['artist_max_uploads'] ?? 20 }}" 
                                       min="1" 
                                       max="1000"
                                       placeholder="20">
                                <p class="text-xs text-slate-500 dark:text-navy-400">Maximum number of uploads per artist per month</p>
                            </div>
                            
                            <div class="space-y-2">
                                <label class="flex items-center space-x-2 text-sm font-medium text-slate-600 dark:text-navy-300">
                                    <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                    </svg>
                                    <span>Verification Review Period (days)</span>
                                </label>
                                <input type="number" 
                                       name="verification_review_period" 
                                       class="form-input w-full rounded-lg" 
                                       value="{{ $artistSettings['verification_review_period'] ?? 3 }}" 
                                       min="1" 
                                       max="30"
                                       placeholder="3">
                                <p class="text-xs text-slate-500 dark:text-navy-400">Days to review and approve artist applications</p>
                            </div>
                        </div>
                    </div>
                    
                </div>
                
                {{-- Save Button --}}
                <div class="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-slate-200 dark:border-navy-600">
                    <button type="button" 
                            @click="$el.closest('form').reset()"
                            class="btn border border-slate-300 dark:border-navy-600 text-slate-700 dark:text-navy-100 px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors">
                        Reset
                    </button>
                    <button type="submit" 
                            class="btn bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-all transform hover:scale-105 shadow-lg">
                        <span class="flex items-center space-x-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span>Save Verification Settings</span>
                        </span>
                    </button>
                </div>
            </form>
        </div>

        {{-- Monetization Tab --}}
        <div x-show="activeTab === 'monetization'" 
             x-transition:enter="transition ease-out duration-200" 
             x-transition:enter-start="opacity-0" 
             x-transition:enter-end="opacity-100">
            <form @submit.prevent="saveTabSettings('artists', 'monetization')">
                <div class="space-y-6">
                    
                    {{-- Enable Artist Monetization --}}
                    <div class="flex items-center justify-between p-4 bg-gradient-to-r from-success/5 to-success/10 dark:from-success/10 dark:to-success/20 rounded-lg border border-success/20">
                        <div class="flex-1">
                            <div class="flex items-center space-x-2">
                                <p class="font-semibold text-slate-800 dark:text-navy-100">Enable Artist Monetization</p>
                                <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-success/20 text-success">Core Feature</span>
                            </div>
                            <p class="text-sm text-slate-600 dark:text-navy-300 mt-1">Allow artists to earn revenue from their music</p>
                        </div>
                        <label class="toggle-switch ml-4">
                            <input type="checkbox" 
                                   name="monetization_enabled" 
                                   value="1" 
                                   {{ ($artistSettings['monetization_enabled'] ?? true) ? 'checked' : '' }}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    {{-- Revenue Configuration --}}
                    <div class="space-y-4">
                        <h4 class="text-sm font-semibold text-slate-700 dark:text-navy-200 uppercase tracking-wider">Revenue Configuration</h4>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-slate-600 dark:text-navy-300">Artist Revenue Share (%)</label>
                                <div class="relative">
                                    <input type="number" 
                                           name="artist_revenue_share" 
                                           class="form-input w-full rounded-lg pr-12" 
                                           value="{{ $artistSettings['artist_revenue_share'] ?? 70 }}" 
                                           min="0" 
                                           max="100"
                                           step="0.01"
                                           placeholder="70">
                                    <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span class="text-slate-500 dark:text-navy-400">%</span>
                                    </div>
                                </div>
                                <p class="text-xs text-slate-500 dark:text-navy-400">Percentage of revenue artists receive</p>
                            </div>
                            
                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-slate-600 dark:text-navy-300">Minimum Payout Amount (UGX)</label>
                                <input type="number" 
                                       name="min_payout" 
                                       class="form-input w-full rounded-lg" 
                                       value="{{ $artistSettings['min_payout'] ?? 50 }}" 
                                       min="0"
                                       placeholder="50">
                                <p class="text-xs text-slate-500 dark:text-navy-400">Minimum earnings required for payout</p>
                            </div>
                        </div>

                        <div class="space-y-2">
                            <label class="block text-sm font-medium text-slate-600 dark:text-navy-300">Payout Frequency</label>
                            <select name="payout_frequency" class="form-select w-full max-w-xs rounded-lg">
                                <option value="weekly" {{ ($artistSettings['payout_frequency'] ?? 'monthly') === 'weekly' ? 'selected' : '' }}>Weekly</option>
                                <option value="bi-weekly" {{ ($artistSettings['payout_frequency'] ?? 'monthly') === 'bi-weekly' ? 'selected' : '' }}>Bi-Weekly</option>
                                <option value="monthly" {{ ($artistSettings['payout_frequency'] ?? 'monthly') === 'monthly' ? 'selected' : '' }}>Monthly</option>
                                <option value="quarterly" {{ ($artistSettings['payout_frequency'] ?? 'monthly') === 'quarterly' ? 'selected' : '' }}>Quarterly</option>
                            </select>
                            <p class="text-xs text-slate-500 dark:text-navy-400">How often artists receive payments</p>
                        </div>
                    </div>

                    {{-- Payout Options --}}
                    <div class="space-y-3">
                        <h4 class="text-sm font-semibold text-slate-700 dark:text-navy-200 uppercase tracking-wider">Payout Options</h4>
                        
                        <label class="flex items-center justify-between p-3 bg-slate-50 dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700 hover:border-primary/30 transition-colors cursor-pointer">
                            <div class="flex-1">
                                <p class="font-medium text-slate-700 dark:text-navy-100">Auto-Payout</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400 mt-1">Automatically process payments on schedule</p>
                            </div>
                            <input type="checkbox" 
                                   name="auto_payout" 
                                   value="1" 
                                   class="form-checkbox"
                                   {{ ($artistSettings['auto_payout'] ?? false) ? 'checked' : '' }}>
                        </label>

                        <label class="flex items-center justify-between p-3 bg-slate-50 dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700 hover:border-primary/30 transition-colors cursor-pointer">
                            <div class="flex-1">
                                <p class="font-medium text-slate-700 dark:text-navy-100">Require Tax Information</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400 mt-1">Artists must provide tax details for payouts</p>
                            </div>
                            <input type="checkbox" 
                                   name="require_tax_info" 
                                   value="1" 
                                   class="form-checkbox"
                                   {{ ($artistSettings['require_tax_info'] ?? false) ? 'checked' : '' }}>
                        </label>
                    </div>

                    {{-- Revenue Info --}}
                    <div class="p-4 bg-info/10 border border-info/20 rounded-lg">
                        <div class="flex items-start space-x-2">
                            <svg class="w-5 h-5 text-info mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                            </svg>
                            <div class="text-sm text-slate-700 dark:text-navy-200">
                                <p class="font-semibold text-info mb-1">Revenue Share Information</p>
                                <p>Artists receive their specified percentage from all revenue generated by their music, including streams, downloads, and distribution earnings. Platform fees are deducted before calculating artist share.</p>
                            </div>
                        </div>
                    </div>
                    
                </div>
                
                {{-- Save Button --}}
                <div class="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-slate-200 dark:border-navy-600">
                    <button type="button" 
                            @click="$el.closest('form').reset()"
                            class="btn border border-slate-300 dark:border-navy-600 text-slate-700 dark:text-navy-100 px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors">
                        Reset
                    </button>
                    <button type="submit" 
                            class="btn bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-all transform hover:scale-105 shadow-lg">
                        <span class="flex items-center space-x-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span>Save Monetization Settings</span>
                        </span>
                    </button>
                </div>
            </form>
        </div>

        {{-- Restrictions Tab --}}
        <div x-show="activeTab === 'restrictions'" 
             x-transition:enter="transition ease-out duration-200" 
             x-transition:enter-start="opacity-0" 
             x-transition:enter-end="opacity-100">
            <form @submit.prevent="saveTabSettings('artists', 'restrictions')">
                <div class="space-y-6">
                    
                    {{-- Upload Restrictions --}}
                    <div class="space-y-4">
                        <h4 class="text-sm font-semibold text-slate-700 dark:text-navy-200 uppercase tracking-wider">Upload Restrictions</h4>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-slate-600 dark:text-navy-300">Max Pending Uploads</label>
                                <input type="number" 
                                       name="max_pending_uploads" 
                                       class="form-input w-full rounded-lg" 
                                       value="{{ $artistSettings['max_pending_uploads'] ?? 10 }}" 
                                       min="1" 
                                       max="100"
                                       placeholder="10">
                                <p class="text-xs text-slate-500 dark:text-navy-400">Maximum uploads awaiting approval</p>
                            </div>
                            
                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-slate-600 dark:text-navy-300">Upload Cooldown (hours)</label>
                                <input type="number" 
                                       name="upload_cooldown_hours" 
                                       class="form-input w-full rounded-lg" 
                                       value="{{ $artistSettings['upload_cooldown_hours'] ?? 0 }}" 
                                       min="0" 
                                       max="168"
                                       placeholder="0">
                                <p class="text-xs text-slate-500 dark:text-navy-400">Hours between uploads (0 = no limit)</p>
                            </div>
                            
                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-slate-600 dark:text-navy-300">Max Collaborators per Song</label>
                                <input type="number" 
                                       name="max_collaborators_per_song" 
                                       class="form-input w-full rounded-lg" 
                                       value="{{ $artistSettings['max_collaborators_per_song'] ?? 5 }}" 
                                       min="1" 
                                       max="20"
                                       placeholder="5">
                                <p class="text-xs text-slate-500 dark:text-navy-400">Maximum featured artists per song</p>
                            </div>
                        </div>
                    </div>

                    {{-- Review Options --}}
                    <div class="space-y-3">
                        <h4 class="text-sm font-semibold text-slate-700 dark:text-navy-200 uppercase tracking-wider">Review & Approval</h4>
                        
                        <label class="flex items-center justify-between p-3 bg-slate-50 dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700 hover:border-primary/30 transition-colors cursor-pointer">
                            <div class="flex-1">
                                <p class="font-medium text-slate-700 dark:text-navy-100">Require Admin Review</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400 mt-1">All uploads must be reviewed before publishing</p>
                            </div>
                            <input type="checkbox" 
                                   name="require_admin_review" 
                                   value="1" 
                                   class="form-checkbox"
                                   {{ ($artistSettings['require_admin_review'] ?? true) ? 'checked' : '' }}>
                        </label>

                        <label class="flex items-center justify-between p-3 bg-slate-50 dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700 hover:border-primary/30 transition-colors cursor-pointer">
                            <div class="flex-1">
                                <p class="font-medium text-slate-700 dark:text-navy-100">Auto-Publish After Review</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400 mt-1">Automatically publish approved content</p>
                            </div>
                            <input type="checkbox" 
                                   name="auto_publish_after_review" 
                                   value="1" 
                                   class="form-checkbox"
                                   {{ ($artistSettings['auto_publish_after_review'] ?? true) ? 'checked' : '' }}>
                        </label>
                    </div>

                    {{-- Warning Notice --}}
                    <div class="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                        <div class="flex items-start space-x-2">
                            <svg class="w-5 h-5 text-warning mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                            </svg>
                            <div class="text-sm text-slate-700 dark:text-navy-200">
                                <p class="font-semibold text-warning mb-1">Important</p>
                                <p>Restrictions help maintain platform quality and prevent abuse. Setting too many restrictions may discourage artists from using your platform.</p>
                            </div>
                        </div>
                    </div>
                    
                </div>
                
                {{-- Save Button --}}
                <div class="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-slate-200 dark:border-navy-600">
                    <button type="button" 
                            @click="$el.closest('form').reset()"
                            class="btn border border-slate-300 dark:border-navy-600 text-slate-700 dark:text-navy-100 px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors">
                        Reset
                    </button>
                    <button type="submit" 
                            class="btn bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-all transform hover:scale-105 shadow-lg">
                        <span class="flex items-center space-x-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span>Save Restriction Settings</span>
                        </span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
