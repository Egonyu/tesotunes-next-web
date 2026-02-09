{{-- Security & Authentication Settings Partial --}}
<div x-show="activeSection === 'security'" 
     x-transition:enter="transition ease-out duration-300" 
     x-transition:enter-start="opacity-0 transform translate-y-4" 
     x-transition:enter-end="opacity-100 transform translate-y-0">
    
    <div class="settings-card" x-data="{ activeTab: 'authentication' }">
        {{-- Header --}}
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
                <div class="p-2 bg-error/10 rounded-lg">
                    <svg class="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-100">Security & Authentication</h3>
                    <p class="text-sm text-slate-500 dark:text-navy-400">Manage authentication, security, logging, and access control</p>
                </div>
            </div>
            
            {{-- Security Level Badge --}}
            @php
                $securityScore = 0;
                if($securitySettings['require_2fa_admins'] ?? false) $securityScore += 25;
                if($securitySettings['enable_session_timeout'] ?? true) $securityScore += 20;
                if($securitySettings['log_security_events'] ?? true) $securityScore += 15;
                if($securitySettings['password_require_symbols'] ?? false) $securityScore += 20;
                if($securitySettings['rate_limit_enabled'] ?? true) $securityScore += 20;
                
                $securityLevel = $securityScore >= 80 ? 'High' : ($securityScore >= 50 ? 'Medium' : 'Low');
                $badgeColor = $securityScore >= 80 ? 'success' : ($securityScore >= 50 ? 'warning' : 'error');
            @endphp
            
            <div class="flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium bg-{{ $badgeColor }}/10 text-{{ $badgeColor }}">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
                <span>{{ $securityLevel }} Security ({{ $securityScore }}%)</span>
            </div>
        </div>

        {{-- Card Navigation Tabs --}}
        <div class="card-nav-tabs">
            <div class="flex space-x-0 border-b border-slate-200 dark:border-navy-600 overflow-x-auto">
                <button @click="activeTab = 'authentication'" 
                        :class="activeTab === 'authentication' ? 'active' : ''" 
                        class="nav-tab flex items-center space-x-2 whitespace-nowrap">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                    </svg>
                    <span>2FA & Sessions</span>
                </button>
                <button @click="activeTab = 'password'" 
                        :class="activeTab === 'password' ? 'active' : ''" 
                        class="nav-tab flex items-center space-x-2 whitespace-nowrap">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"/>
                    </svg>
                    <span>Password Policy</span>
                </button>
                <button @click="activeTab = 'access'" 
                        :class="activeTab === 'access' ? 'active' : ''" 
                        class="nav-tab flex items-center space-x-2 whitespace-nowrap">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                    <span>Access Control</span>
                </button>
                <button @click="activeTab = 'social'" 
                        :class="activeTab === 'social' ? 'active' : ''" 
                        class="nav-tab flex items-center space-x-2 whitespace-nowrap">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                    <span>Social Login</span>
                </button>
            </div>
        </div>

        {{-- Authentication Tab --}}
        <div x-show="activeTab === 'authentication'" 
             x-transition:enter="transition ease-out duration-200" 
             x-transition:enter-start="opacity-0" 
             x-transition:enter-end="opacity-100">
            <form @submit.prevent="saveTabSettings('security', 'authentication')">
                <div class="space-y-6">
                    
                    {{-- 2FA for Admins --}}
                    <div class="flex items-center justify-between p-4 bg-gradient-to-r from-error/5 to-error/10 dark:from-error/10 dark:to-error/20 rounded-lg border border-error/20">
                        <div class="flex-1">
                            <div class="flex items-center space-x-2">
                                <p class="font-semibold text-slate-800 dark:text-navy-100">Two-Factor Authentication for Admins</p>
                                <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-error/20 text-error">Critical</span>
                            </div>
                            <p class="text-sm text-slate-600 dark:text-navy-300 mt-1">Require admin users to use 2FA for enhanced security</p>
                        </div>
                        <label class="toggle-switch ml-4">
                            <input type="checkbox" 
                                   name="require_2fa_admins" 
                                   value="1" 
                                   {{ ($securitySettings['require_2fa_admins'] ?? false) ? 'checked' : '' }}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    {{-- Session Management --}}
                    <div class="space-y-4">
                        <h4 class="text-sm font-semibold text-slate-700 dark:text-navy-200 uppercase tracking-wider">Session Management</h4>
                        
                        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700">
                            <div class="flex-1">
                                <p class="font-medium text-slate-700 dark:text-navy-100">Enable Session Timeout</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400 mt-1">Automatically log out inactive users</p>
                            </div>
                            <label class="toggle-switch ml-4">
                                <input type="checkbox" 
                                       name="enable_session_timeout" 
                                       value="1"
                                       {{ ($securitySettings['enable_session_timeout'] ?? true) ? 'checked' : '' }}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="space-y-2">
                                <label class="flex items-center space-x-2 text-sm font-medium text-slate-600 dark:text-navy-300">
                                    <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    <span>Session Timeout (minutes)</span>
                                </label>
                                <input type="number" 
                                       name="session_timeout_minutes" 
                                       class="form-input w-full rounded-lg" 
                                       value="{{ $securitySettings['session_timeout_minutes'] ?? 30 }}" 
                                       min="5" 
                                       max="480"
                                       placeholder="30">
                                <p class="text-xs text-slate-500 dark:text-navy-400">Users will be logged out after this period of inactivity</p>
                            </div>
                            
                            <div class="space-y-2">
                                <label class="flex items-center space-x-2 text-sm font-medium text-slate-600 dark:text-navy-300">
                                    <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                                    </svg>
                                    <span>Max Login Attempts</span>
                                </label>
                                <input type="number" 
                                       name="max_login_attempts" 
                                       class="form-input w-full rounded-lg" 
                                       value="{{ $securitySettings['max_login_attempts'] ?? 5 }}" 
                                       min="1" 
                                       max="20"
                                       placeholder="5">
                                <p class="text-xs text-slate-500 dark:text-navy-400">Account will be locked after this many failed attempts</p>
                            </div>
                        </div>
                    </div>

                    {{-- Security Logging --}}
                    <div class="space-y-4">
                        <h4 class="text-sm font-semibold text-slate-700 dark:text-navy-200 uppercase tracking-wider">Security Logging</h4>
                        
                        <div class="grid grid-cols-1 gap-3">
                            <label class="flex items-center justify-between p-3 bg-slate-50 dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700 hover:border-primary/30 transition-colors cursor-pointer">
                                <div class="flex items-center space-x-3">
                                    <div class="p-1.5 bg-primary/10 rounded">
                                        <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                        </svg>
                                    </div>
                                    <span class="text-sm font-medium text-slate-700 dark:text-navy-100">Log all security events</span>
                                </div>
                                <input type="checkbox" 
                                       name="log_security_events" 
                                       value="1" 
                                       class="form-checkbox"
                                       {{ ($securitySettings['log_security_events'] ?? true) ? 'checked' : '' }}>
                            </label>

                            <label class="flex items-center justify-between p-3 bg-slate-50 dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700 hover:border-primary/30 transition-colors cursor-pointer">
                                <div class="flex items-center space-x-3">
                                    <div class="p-1.5 bg-warning/10 rounded">
                                        <svg class="w-4 h-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                        </svg>
                                    </div>
                                    <span class="text-sm font-medium text-slate-700 dark:text-navy-100">Log failed login attempts</span>
                                </div>
                                <input type="checkbox" 
                                       name="log_failed_logins" 
                                       value="1" 
                                       class="form-checkbox"
                                       {{ ($securitySettings['log_failed_logins'] ?? true) ? 'checked' : '' }}>
                            </label>

                            <label class="flex items-center justify-between p-3 bg-slate-50 dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700 hover:border-primary/30 transition-colors cursor-pointer">
                                <div class="flex items-center space-x-3">
                                    <div class="p-1.5 bg-info/10 rounded">
                                        <svg class="w-4 h-4 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                                        </svg>
                                    </div>
                                    <span class="text-sm font-medium text-slate-700 dark:text-navy-100">Log password changes</span>
                                </div>
                                <input type="checkbox" 
                                       name="log_password_changes" 
                                       value="1" 
                                       class="form-checkbox"
                                       {{ ($securitySettings['log_password_changes'] ?? true) ? 'checked' : '' }}>
                            </label>
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
                            class="btn bg-error text-white px-6 py-2 rounded-lg hover:bg-error/90 transition-all transform hover:scale-105 shadow-lg">
                        <span class="flex items-center space-x-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span>Save Authentication Settings</span>
                        </span>
                    </button>
                </div>
            </form>
        </div>

        {{-- Password Policy Tab --}}
        <div x-show="activeTab === 'password'" 
             x-transition:enter="transition ease-out duration-200" 
             x-transition:enter-start="opacity-0" 
             x-transition:enter-end="opacity-100">
            <form @submit.prevent="saveTabSettings('security', 'password')">
                <div class="space-y-6">
                    
                    {{-- Password Requirements --}}
                    <div class="space-y-4">
                        <h4 class="text-sm font-semibold text-slate-700 dark:text-navy-200 uppercase tracking-wider">Password Requirements</h4>
                        
                        <div class="space-y-2">
                            <label class="block text-sm font-medium text-slate-600 dark:text-navy-300">Minimum Password Length</label>
                            <input type="number" 
                                   name="password_min_length" 
                                   class="form-input w-full max-w-xs rounded-lg" 
                                   value="{{ $securitySettings['password_min_length'] ?? 8 }}" 
                                   min="6" 
                                   max="128">
                            <p class="text-xs text-slate-500 dark:text-navy-400">Recommended: 8 or more characters</p>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <label class="flex items-center justify-between p-3 bg-slate-50 dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700 hover:border-primary/30 transition-colors cursor-pointer">
                                <span class="text-sm font-medium text-slate-700 dark:text-navy-100">Require uppercase letters (A-Z)</span>
                                <input type="checkbox" 
                                       name="password_require_uppercase" 
                                       value="1" 
                                       class="form-checkbox"
                                       {{ ($securitySettings['password_require_uppercase'] ?? true) ? 'checked' : '' }}>
                            </label>

                            <label class="flex items-center justify-between p-3 bg-slate-50 dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700 hover:border-primary/30 transition-colors cursor-pointer">
                                <span class="text-sm font-medium text-slate-700 dark:text-navy-100">Require lowercase letters (a-z)</span>
                                <input type="checkbox" 
                                       name="password_require_lowercase" 
                                       value="1" 
                                       class="form-checkbox"
                                       {{ ($securitySettings['password_require_lowercase'] ?? true) ? 'checked' : '' }}>
                            </label>

                            <label class="flex items-center justify-between p-3 bg-slate-50 dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700 hover:border-primary/30 transition-colors cursor-pointer">
                                <span class="text-sm font-medium text-slate-700 dark:text-navy-100">Require numbers (0-9)</span>
                                <input type="checkbox" 
                                       name="password_require_numbers" 
                                       value="1" 
                                       class="form-checkbox"
                                       {{ ($securitySettings['password_require_numbers'] ?? true) ? 'checked' : '' }}>
                            </label>

                            <label class="flex items-center justify-between p-3 bg-slate-50 dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700 hover:border-primary/30 transition-colors cursor-pointer">
                                <span class="text-sm font-medium text-slate-700 dark:text-navy-100">Require symbols (!@#$%)</span>
                                <input type="checkbox" 
                                       name="password_require_symbols" 
                                       value="1" 
                                       class="form-checkbox"
                                       {{ ($securitySettings['password_require_symbols'] ?? false) ? 'checked' : '' }}>
                            </label>
                        </div>
                    </div>

                    {{-- Password Example --}}
                    <div class="p-5 bg-gradient-to-br from-success/5 via-info/5 to-primary/5 dark:from-success/10 dark:via-info/10 dark:to-primary/10 border-2 border-dashed border-success/20 rounded-xl">
                        <div class="flex items-start space-x-3">
                            <div class="p-2 bg-success/10 rounded-lg">
                                <svg class="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <div class="flex-1">
                                <h4 class="text-sm font-bold text-success mb-2">Example Strong Password</h4>
                                <div class="font-mono text-sm text-slate-700 dark:text-navy-200 bg-white/50 dark:bg-navy-900/50 px-3 py-2 rounded">
                                    MyMusic@Platform2024!
                                </div>
                                <ul class="mt-3 space-y-1 text-xs text-slate-600 dark:text-navy-300">
                                    <li class="flex items-center space-x-2">
                                        <svg class="w-3 h-3 text-success" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                                        </svg>
                                        <span>Contains uppercase & lowercase letters</span>
                                    </li>
                                    <li class="flex items-center space-x-2">
                                        <svg class="w-3 h-3 text-success" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                                        </svg>
                                        <span>Contains numbers and special characters</span>
                                    </li>
                                    <li class="flex items-center space-x-2">
                                        <svg class="w-3 h-3 text-success" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                                        </svg>
                                        <span>20 characters long (very secure)</span>
                                    </li>
                                </ul>
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
                            class="btn bg-error text-white px-6 py-2 rounded-lg hover:bg-error/90 transition-all transform hover:scale-105 shadow-lg">
                        <span class="flex items-center space-x-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span>Save Password Policy</span>
                        </span>
                    </button>
                </div>
            </form>
        </div>

        {{-- Access Control Tab --}}
        <div x-show="activeTab === 'access'" 
             x-transition:enter="transition ease-out duration-200" 
             x-transition:enter-start="opacity-0" 
             x-transition:enter-end="opacity-100">
            <form @submit.prevent="saveTabSettings('security', 'access')">
                <div class="space-y-6">
                    
                    {{-- IP Management --}}
                    <div class="space-y-4">
                        <h4 class="text-sm font-semibold text-slate-700 dark:text-navy-200 uppercase tracking-wider">IP Management</h4>
                        
                        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700">
                            <div class="flex-1">
                                <p class="font-medium text-slate-700 dark:text-navy-100">Enable IP Whitelist</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400 mt-1">Only allow specific IP addresses to access admin panel</p>
                            </div>
                            <label class="toggle-switch ml-4">
                                <input type="checkbox" 
                                       name="enable_ip_whitelist" 
                                       value="1"
                                       {{ ($securitySettings['enable_ip_whitelist'] ?? false) ? 'checked' : '' }}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700">
                            <div class="flex-1">
                                <p class="font-medium text-slate-700 dark:text-navy-100">Enable IP Blacklist</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400 mt-1">Block specific IP addresses from accessing the platform</p>
                            </div>
                            <label class="toggle-switch ml-4">
                                <input type="checkbox" 
                                       name="enable_ip_blacklist" 
                                       value="1"
                                       {{ ($securitySettings['enable_ip_blacklist'] ?? true) ? 'checked' : '' }}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>

                    {{-- Rate Limiting --}}
                    <div class="space-y-4">
                        <h4 class="text-sm font-semibold text-slate-700 dark:text-navy-200 uppercase tracking-wider">Rate Limiting</h4>
                        
                        <div class="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-lg border border-primary/20">
                            <div class="flex-1">
                                <div class="flex items-center space-x-2">
                                    <p class="font-semibold text-slate-800 dark:text-navy-100">Enable Rate Limiting</p>
                                    <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/20 text-primary">DDoS Protection</span>
                                </div>
                                <p class="text-sm text-slate-600 dark:text-navy-300 mt-1">Limit number of requests per user to prevent abuse</p>
                            </div>
                            <label class="toggle-switch ml-4">
                                <input type="checkbox" 
                                       name="rate_limit_enabled" 
                                       value="1"
                                       {{ ($securitySettings['rate_limit_enabled'] ?? true) ? 'checked' : '' }}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-slate-600 dark:text-navy-300">Max Requests</label>
                                <input type="number" 
                                       name="rate_limit_requests" 
                                       class="form-input w-full rounded-lg" 
                                       value="{{ $securitySettings['rate_limit_requests'] ?? 60 }}" 
                                       min="1" 
                                       max="1000">
                                <p class="text-xs text-slate-500 dark:text-navy-400">Maximum requests allowed per period</p>
                            </div>
                            
                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-slate-600 dark:text-navy-300">Period (minutes)</label>
                                <input type="number" 
                                       name="rate_limit_period" 
                                       class="form-input w-full rounded-lg" 
                                       value="{{ $securitySettings['rate_limit_period'] ?? 1 }}" 
                                       min="1" 
                                       max="60">
                                <p class="text-xs text-slate-500 dark:text-navy-400">Time window for rate limiting</p>
                            </div>
                        </div>
                    </div>

                    {{-- Rate Limit Example --}}
                    <div class="p-4 bg-info/10 border border-info/20 rounded-lg">
                        <div class="flex items-start space-x-2">
                            <svg class="w-5 h-5 text-info mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                            </svg>
                            <div class="text-sm text-slate-700 dark:text-navy-200">
                                <p class="font-semibold text-info mb-1">Current Configuration</p>
                                <p>Users can make up to <strong>{{ $securitySettings['rate_limit_requests'] ?? 60 }} requests</strong> every <strong>{{ $securitySettings['rate_limit_period'] ?? 1 }} minute(s)</strong>. Exceeding this limit will result in temporary access restriction.</p>
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
                            class="btn bg-error text-white px-6 py-2 rounded-lg hover:bg-error/90 transition-all transform hover:scale-105 shadow-lg">
                        <span class="flex items-center space-x-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span>Save Access Control Settings</span>
                        </span>
                    </button>
                </div>
            </form>
        </div>

        {{-- Social Login Tab --}}
        <div x-show="activeTab === 'social'" 
             x-transition:enter="transition ease-out duration-200" 
             x-transition:enter-start="opacity-0" 
             x-transition:enter-end="opacity-100">
            <form @submit.prevent="saveTabSettings('security', 'social')">
                <div class="space-y-6">
                    
                    {{-- Social Login Header --}}
                    <div class="p-4 bg-gradient-to-r from-primary/5 to-info/5 dark:from-primary/10 dark:to-info/10 border border-primary/20 rounded-lg">
                        <div class="flex items-start space-x-3">
                            <svg class="w-5 h-5 text-primary mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                            </svg>
                            <div class="flex-1">
                                <p class="font-semibold text-primary mb-1">Social Login Integration</p>
                                <p class="text-sm text-slate-600 dark:text-navy-300">Configure OAuth providers to allow users to sign in with their social media accounts</p>
                            </div>
                        </div>
                    </div>

                    {{-- Google Login --}}
                    <div class="space-y-4">
                        <div class="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-50/50 dark:from-red-900/20 dark:to-red-900/10 rounded-lg border border-red-200 dark:border-red-900/30">
                            <div class="flex items-center space-x-3">
                                <div class="p-2 bg-white dark:bg-navy-900 rounded-lg shadow-sm">
                                    <svg class="w-6 h-6" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                    </svg>
                                </div>
                                <div>
                                    <p class="font-semibold text-slate-800 dark:text-navy-100">Google Login</p>
                                    <p class="text-sm text-slate-600 dark:text-navy-300">OAuth 2.0 authentication</p>
                                </div>
                            </div>
                            <label class="toggle-switch ml-4">
                                <input type="checkbox" name="google_login_enabled" value="1" {{ ($securitySettings['google_login_enabled'] ?? false) ? 'checked' : '' }}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="pl-4 space-y-3">
                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-slate-600 dark:text-navy-300">Google Client ID</label>
                                <input type="text" name="google_client_id" class="form-input w-full rounded-lg" value="{{ $securitySettings['google_client_id'] ?? '' }}" placeholder="Your Google OAuth Client ID">
                            </div>
                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-slate-600 dark:text-navy-300">Google Client Secret</label>
                                <input type="password" name="google_client_secret" class="form-input w-full rounded-lg" placeholder="Enter to update">
                                <p class="text-xs text-slate-500 dark:text-navy-400">Leave blank to keep existing secret</p>
                            </div>
                        </div>
                    </div>

                    {{-- Facebook Login --}}
                    <div class="space-y-4 border-t border-slate-200 dark:border-navy-600 pt-6">
                        <div class="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-50/50 dark:from-blue-900/20 dark:to-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-900/30">
                            <div class="flex items-center space-x-3">
                                <div class="p-2 bg-white dark:bg-navy-900 rounded-lg shadow-sm">
                                    <svg class="w-6 h-6" fill="#1877F2" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                </div>
                                <div>
                                    <p class="font-semibold text-slate-800 dark:text-navy-100">Facebook Login</p>
                                    <p class="text-sm text-slate-600 dark:text-navy-300">Facebook OAuth authentication</p>
                                </div>
                            </div>
                            <label class="toggle-switch ml-4">
                                <input type="checkbox" name="facebook_login_enabled" value="1" {{ ($securitySettings['facebook_login_enabled'] ?? false) ? 'checked' : '' }}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="pl-4 space-y-3">
                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-slate-600 dark:text-navy-300">Facebook App ID</label>
                                <input type="text" name="facebook_client_id" class="form-input w-full rounded-lg" value="{{ $securitySettings['facebook_client_id'] ?? '' }}" placeholder="Your Facebook App ID">
                            </div>
                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-slate-600 dark:text-navy-300">Facebook App Secret</label>
                                <input type="password" name="facebook_client_secret" class="form-input w-full rounded-lg" placeholder="Enter to update">
                                <p class="text-xs text-slate-500 dark:text-navy-400">Leave blank to keep existing secret</p>
                            </div>
                        </div>
                    </div>

                    {{-- Twitter/X Login --}}
                    <div class="space-y-4 border-t border-slate-200 dark:border-navy-600 pt-6">
                        <div class="flex items-center justify-between p-4 bg-gradient-to-r from-sky-50 to-sky-50/50 dark:from-sky-900/20 dark:to-sky-900/10 rounded-lg border border-sky-200 dark:border-sky-900/30">
                            <div class="flex items-center space-x-3">
                                <div class="p-2 bg-white dark:bg-navy-900 rounded-lg shadow-sm">
                                    <svg class="w-6 h-6" fill="#1DA1F2" viewBox="0 0 24 24">
                                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                    </svg>
                                </div>
                                <div>
                                    <p class="font-semibold text-slate-800 dark:text-navy-100">Twitter/X Login</p>
                                    <p class="text-sm text-slate-600 dark:text-navy-300">Twitter OAuth authentication</p>
                                </div>
                            </div>
                            <label class="toggle-switch ml-4">
                                <input type="checkbox" name="twitter_login_enabled" value="1" {{ ($securitySettings['twitter_login_enabled'] ?? false) ? 'checked' : '' }}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="pl-4 space-y-3">
                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-slate-600 dark:text-navy-300">Twitter API Key</label>
                                <input type="text" name="twitter_client_id" class="form-input w-full rounded-lg" value="{{ $securitySettings['twitter_client_id'] ?? '' }}" placeholder="Your Twitter API Key">
                            </div>
                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-slate-600 dark:text-navy-300">Twitter API Secret</label>
                                <input type="password" name="twitter_client_secret" class="form-input w-full rounded-lg" placeholder="Enter to update">
                                <p class="text-xs text-slate-500 dark:text-navy-400">Leave blank to keep existing secret</p>
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
                            class="btn bg-error text-white px-6 py-2 rounded-lg hover:bg-error/90 transition-all transform hover:scale-105 shadow-lg">
                        <span class="flex items-center space-x-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span>Save Social Login Settings</span>
                        </span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
