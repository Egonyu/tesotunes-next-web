{{-- Awards Settings Partial --}}
<div x-show="activeSection === 'awards'" 
     x-transition:enter="transition ease-out duration-300" 
     x-transition:enter-start="opacity-0 transform translate-y-4" 
     x-transition:enter-end="opacity-100 transform translate-y-0">
    
    <div class="settings-card" x-data="{ activeTab: 'general' }">
        {{-- Header --}}
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
                <div class="p-2 bg-warning/10 rounded-lg">
                    <svg class="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                    </svg>
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-100">Awards System Configuration</h3>
                    <p class="text-sm text-slate-500 dark:text-navy-400">Manage awards, nominations, voting, and prizes</p>
                </div>
            </div>
            
            {{-- Awards Status Badge --}}
            @if($awardsSettings['awards_enabled'] ?? true)
                <div class="flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium bg-success/10 text-success">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span>System Active</span>
                </div>
            @else
                <div class="flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium bg-slate-100 dark:bg-navy-700 text-slate-600 dark:text-navy-300">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span>System Disabled</span>
                </div>
            @endif
        </div>

        {{-- Card Navigation Tabs --}}
        <div class="card-nav-tabs">
            <div class="flex space-x-0 border-b border-slate-200 dark:border-navy-600">
                <button @click="activeTab = 'general'" 
                        :class="activeTab === 'general' ? 'active' : ''" 
                        class="nav-tab flex items-center space-x-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    <span>General</span>
                </button>
                <button @click="activeTab = 'categories'" 
                        :class="activeTab === 'categories' ? 'active' : ''" 
                        class="nav-tab flex items-center space-x-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                    </svg>
                    <span>Categories</span>
                </button>
                <button @click="activeTab = 'voting'" 
                        :class="activeTab === 'voting' ? 'active' : ''" 
                        class="nav-tab flex items-center space-x-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                    </svg>
                    <span>Voting</span>
                </button>
                <button @click="activeTab = 'prizes'" 
                        :class="activeTab === 'prizes' ? 'active' : ''" 
                        class="nav-tab flex items-center space-x-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span>Prizes</span>
                </button>
            </div>
        </div>

        {{-- General Tab --}}
        <div x-show="activeTab === 'general'" 
             x-transition:enter="transition ease-out duration-200" 
             x-transition:enter-start="opacity-0" 
             x-transition:enter-end="opacity-100">
            <form @submit.prevent="saveTabSettings('awards', 'general')">
                <div class="space-y-6">
                    
                    {{-- Enable Awards System --}}
                    <div class="flex items-center justify-between p-4 bg-gradient-to-r from-warning/5 to-warning/10 dark:from-warning/10 dark:to-warning/20 rounded-lg border border-warning/20">
                        <div class="flex-1">
                            <div class="flex items-center space-x-2">
                                <p class="font-semibold text-slate-800 dark:text-navy-100">Enable Awards System</p>
                                <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-warning/20 text-warning">Core Feature</span>
                            </div>
                            <p class="text-sm text-slate-600 dark:text-navy-300 mt-1">Activate music awards and voting functionality</p>
                        </div>
                        <label class="toggle-switch ml-4">
                            <input type="checkbox" 
                                   name="awards_enabled" 
                                   value="1" 
                                   {{ ($awardsSettings['awards_enabled'] ?? true) ? 'checked' : '' }}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    {{-- Public Voting --}}
                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700">
                        <div class="flex-1">
                            <p class="font-medium text-slate-700 dark:text-navy-100">Public Voting</p>
                            <p class="text-sm text-slate-500 dark:text-navy-400 mt-1">Allow public to vote for awards</p>
                        </div>
                        <label class="toggle-switch ml-4">
                            <input type="checkbox" 
                                   name="public_voting_enabled" 
                                   value="1"
                                   {{ ($awardsSettings['public_voting_enabled'] ?? true) ? 'checked' : '' }}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    {{-- Season Configuration --}}
                    <div class="space-y-4">
                        <h4 class="text-sm font-semibold text-slate-700 dark:text-navy-200 uppercase tracking-wider">Season Configuration</h4>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="space-y-2">
                                <label class="flex items-center space-x-2 text-sm font-medium text-slate-600 dark:text-navy-300">
                                    <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                    </svg>
                                    <span>Season Duration (days)</span>
                                </label>
                                <input type="number" 
                                       name="season_duration" 
                                       class="form-input w-full rounded-lg" 
                                       value="{{ $awardsSettings['season_duration'] ?? 30 }}" 
                                       min="7" 
                                       max="365"
                                       placeholder="30">
                                <p class="text-xs text-slate-500 dark:text-navy-400">Total duration of awards season</p>
                            </div>
                            
                            <div class="space-y-2">
                                <label class="flex items-center space-x-2 text-sm font-medium text-slate-600 dark:text-navy-300">
                                    <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                    </svg>
                                    <span>Nomination Period (days)</span>
                                </label>
                                <input type="number" 
                                       name="nomination_period" 
                                       class="form-input w-full rounded-lg" 
                                       value="{{ $awardsSettings['nomination_period'] ?? 14 }}" 
                                       min="1" 
                                       max="90"
                                       placeholder="14">
                                <p class="text-xs text-slate-500 dark:text-navy-400">Duration for submitting nominations</p>
                            </div>
                            
                            <div class="space-y-2">
                                <label class="flex items-center space-x-2 text-sm font-medium text-slate-600 dark:text-navy-300">
                                    <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                                    </svg>
                                    <span>Voting Period (days)</span>
                                </label>
                                <input type="number" 
                                       name="voting_period" 
                                       class="form-input w-full rounded-lg" 
                                       value="{{ $awardsSettings['voting_period'] ?? 21 }}" 
                                       min="1" 
                                       max="90"
                                       placeholder="21">
                                <p class="text-xs text-slate-500 dark:text-navy-400">Duration for public voting</p>
                            </div>
                        </div>
                    </div>

                    {{-- Timeline Visual --}}
                    <div class="p-5 bg-gradient-to-br from-info/5 via-primary/5 to-warning/5 dark:from-info/10 dark:via-primary/10 dark:to-warning/10 border-2 border-dashed border-info/20 rounded-xl">
                        <h4 class="text-sm font-bold text-info mb-4">Awards Season Timeline</h4>
                        <div class="flex items-center justify-between">
                            <div class="text-center flex-1">
                                <div class="w-12 h-12 mx-auto mb-2 bg-info/20 rounded-full flex items-center justify-center">
                                    <svg class="w-6 h-6 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                    </svg>
                                </div>
                                <p class="text-xs font-semibold text-slate-700 dark:text-navy-200">Nominations</p>
                                <p class="text-xs text-slate-500 dark:text-navy-400">{{ $awardsSettings['nomination_period'] ?? 14 }} days</p>
                            </div>
                            <div class="flex-shrink-0 w-8 h-0.5 bg-slate-300 dark:bg-navy-600"></div>
                            <div class="text-center flex-1">
                                <div class="w-12 h-12 mx-auto mb-2 bg-primary/20 rounded-full flex items-center justify-center">
                                    <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                                    </svg>
                                </div>
                                <p class="text-xs font-semibold text-slate-700 dark:text-navy-200">Voting</p>
                                <p class="text-xs text-slate-500 dark:text-navy-400">{{ $awardsSettings['voting_period'] ?? 21 }} days</p>
                            </div>
                            <div class="flex-shrink-0 w-8 h-0.5 bg-slate-300 dark:bg-navy-600"></div>
                            <div class="text-center flex-1">
                                <div class="w-12 h-12 mx-auto mb-2 bg-warning/20 rounded-full flex items-center justify-center">
                                    <svg class="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                                    </svg>
                                </div>
                                <p class="text-xs font-semibold text-slate-700 dark:text-navy-200">Winners</p>
                                <p class="text-xs text-slate-500 dark:text-navy-400">Announced</p>
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
                            class="btn bg-warning text-white px-6 py-2 rounded-lg hover:bg-warning/90 transition-all transform hover:scale-105 shadow-lg">
                        <span class="flex items-center space-x-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span>Save General Settings</span>
                        </span>
                    </button>
                </div>
            </form>
        </div>

        {{-- Categories Tab --}}
        <div x-show="activeTab === 'categories'" 
             x-transition:enter="transition ease-out duration-200" 
             x-transition:enter-start="opacity-0" 
             x-transition:enter-end="opacity-100">
            <form @submit.prevent="saveTabSettings('awards', 'categories')">
                <div class="space-y-6">
                    
                    {{-- Auto-Generate Categories --}}
                    <div class="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-lg border border-primary/20">
                        <div class="flex-1">
                            <div class="flex items-center space-x-2">
                                <p class="font-semibold text-slate-800 dark:text-navy-100">Auto-Generate Categories</p>
                                <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/20 text-primary">Automatic</span>
                            </div>
                            <p class="text-sm text-slate-600 dark:text-navy-300 mt-1">Automatically create categories based on music genres</p>
                        </div>
                        <label class="toggle-switch ml-4">
                            <input type="checkbox" 
                                   name="auto_generate_categories" 
                                   value="1"
                                   {{ ($awardsSettings['auto_generate_categories'] ?? true) ? 'checked' : '' }}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    {{-- Category Configuration --}}
                    <div class="space-y-4">
                        <h4 class="text-sm font-semibold text-slate-700 dark:text-navy-200 uppercase tracking-wider">Category Configuration</h4>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-slate-600 dark:text-navy-300">Max Categories per Award</label>
                                <input type="number" 
                                       name="max_categories" 
                                       class="form-input w-full rounded-lg" 
                                       value="{{ $awardsSettings['max_categories'] ?? 10 }}" 
                                       min="1" 
                                       max="50"
                                       placeholder="10">
                                <p class="text-xs text-slate-500 dark:text-navy-400">Maximum number of categories allowed</p>
                            </div>
                            
                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-slate-600 dark:text-navy-300">Category Weight System</label>
                                <select name="category_weight" class="form-select w-full rounded-lg">
                                    <option value="equal" {{ ($awardsSettings['category_weight'] ?? 'equal') === 'equal' ? 'selected' : '' }}>Equal Weight</option>
                                    <option value="popularity" {{ ($awardsSettings['category_weight'] ?? 'equal') === 'popularity' ? 'selected' : '' }}>Popularity Based</option>
                                    <option value="custom" {{ ($awardsSettings['category_weight'] ?? 'equal') === 'custom' ? 'selected' : '' }}>Custom Weight</option>
                                </select>
                                <p class="text-xs text-slate-500 dark:text-navy-400">How to calculate category importance</p>
                            </div>
                        </div>
                    </div>

                    {{-- Weight System Explanation --}}
                    <div class="p-4 bg-info/10 border border-info/20 rounded-lg">
                        <div class="flex items-start space-x-2">
                            <svg class="w-5 h-5 text-info mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                            </svg>
                            <div class="text-sm text-slate-700 dark:text-navy-200">
                                <p class="font-semibold text-info mb-1">Weight System Options</p>
                                <ul class="space-y-1 mt-2">
                                    <li><strong>Equal Weight:</strong> All categories have equal importance</li>
                                    <li><strong>Popularity Based:</strong> More popular genres get higher weight</li>
                                    <li><strong>Custom Weight:</strong> Manually assign weight to each category</li>
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
                            class="btn bg-warning text-white px-6 py-2 rounded-lg hover:bg-warning/90 transition-all transform hover:scale-105 shadow-lg">
                        <span class="flex items-center space-x-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span>Save Category Settings</span>
                        </span>
                    </button>
                </div>
            </form>
        </div>

        {{-- Voting Tab --}}
        <div x-show="activeTab === 'voting'" 
             x-transition:enter="transition ease-out duration-200" 
             x-transition:enter-start="opacity-0" 
             x-transition:enter-end="opacity-100">
            <form @submit.prevent="saveTabSettings('awards', 'voting')">
                <div class="space-y-6">
                    
                    {{-- Voting Rules --}}
                    <div class="space-y-4">
                        <h4 class="text-sm font-semibold text-slate-700 dark:text-navy-200 uppercase tracking-wider">Voting Rules</h4>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-slate-600 dark:text-navy-300">Max Votes per User</label>
                                <input type="number" 
                                       name="max_votes_per_user" 
                                       class="form-input w-full rounded-lg" 
                                       value="{{ $awardsSettings['max_votes_per_user'] ?? 5 }}" 
                                       min="1" 
                                       max="100"
                                       placeholder="5">
                                <p class="text-xs text-slate-500 dark:text-navy-400">Total votes a user can cast across all categories</p>
                            </div>
                            
                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-slate-600 dark:text-navy-300">Voting Period</label>
                                <div class="flex items-center space-x-2">
                                    <input type="number" 
                                           name="voting_period" 
                                           class="form-input flex-1 rounded-lg" 
                                           value="{{ $awardsSettings['voting_period'] ?? 21 }}" 
                                           min="1" 
                                           max="90"
                                           placeholder="21">
                                    <span class="text-sm text-slate-600 dark:text-navy-300">days</span>
                                </div>
                                <p class="text-xs text-slate-500 dark:text-navy-400">Duration of public voting</p>
                            </div>
                        </div>
                    </div>

                    {{-- Voting Options --}}
                    <div class="space-y-3">
                        <h4 class="text-sm font-semibold text-slate-700 dark:text-navy-200 uppercase tracking-wider">Voting Options</h4>
                        
                        <label class="flex items-center justify-between p-3 bg-slate-50 dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700 hover:border-primary/30 transition-colors cursor-pointer">
                            <div class="flex-1">
                                <p class="font-medium text-slate-700 dark:text-navy-100">Require Registration to Vote</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400 mt-1">Only registered users can vote</p>
                            </div>
                            <input type="checkbox" 
                                   name="require_registration" 
                                   value="1" 
                                   class="form-checkbox"
                                   {{ ($awardsSettings['require_registration'] ?? true) ? 'checked' : '' }}>
                        </label>

                        <label class="flex items-center justify-between p-3 bg-slate-50 dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700 hover:border-primary/30 transition-colors cursor-pointer">
                            <div class="flex-1">
                                <p class="font-medium text-slate-700 dark:text-navy-100">Real-time Vote Display</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400 mt-1">Show live vote counts to users</p>
                            </div>
                            <input type="checkbox" 
                                   name="realtime_votes" 
                                   value="1" 
                                   class="form-checkbox"
                                   {{ ($awardsSettings['realtime_votes'] ?? false) ? 'checked' : '' }}>
                        </label>

                        <label class="flex items-center justify-between p-3 bg-slate-50 dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700 hover:border-primary/30 transition-colors cursor-pointer">
                            <div class="flex-1">
                                <p class="font-medium text-slate-700 dark:text-navy-100">Vote Verification Required</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400 mt-1">Verify user identity before voting</p>
                            </div>
                            <input type="checkbox" 
                                   name="vote_verification_required" 
                                   value="1" 
                                   class="form-checkbox"
                                   {{ ($awardsSettings['vote_verification_required'] ?? false) ? 'checked' : '' }}>
                        </label>

                        <label class="flex items-center justify-between p-3 bg-slate-50 dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700 hover:border-primary/30 transition-colors cursor-pointer">
                            <div class="flex-1">
                                <p class="font-medium text-slate-700 dark:text-navy-100">Multiple Votes per Category</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400 mt-1">Allow users to vote for multiple nominees in same category</p>
                            </div>
                            <input type="checkbox" 
                                   name="multiple_votes_per_category" 
                                   value="1" 
                                   class="form-checkbox"
                                   {{ ($awardsSettings['multiple_votes_per_category'] ?? false) ? 'checked' : '' }}>
                        </label>
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
                            class="btn bg-warning text-white px-6 py-2 rounded-lg hover:bg-warning/90 transition-all transform hover:scale-105 shadow-lg">
                        <span class="flex items-center space-x-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span>Save Voting Settings</span>
                        </span>
                    </button>
                </div>
            </form>
        </div>

        {{-- Prizes Tab --}}
        <div x-show="activeTab === 'prizes'" 
             x-transition:enter="transition ease-out duration-200" 
             x-transition:enter-start="opacity-0" 
             x-transition:enter-end="opacity-100">
            <form @submit.prevent="saveTabSettings('awards', 'prizes')">
                <div class="space-y-6">
                    
                    {{-- Prize Configuration --}}
                    <div class="space-y-4">
                        <h4 class="text-sm font-semibold text-slate-700 dark:text-navy-200 uppercase tracking-wider">Prize Configuration</h4>
                        
                        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700">
                            <div class="flex-1">
                                <p class="font-medium text-slate-700 dark:text-navy-100">Enable Prizes</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400 mt-1">Award prizes to winners</p>
                            </div>
                            <label class="toggle-switch ml-4">
                                <input type="checkbox" 
                                       name="prizes_enabled" 
                                       value="1"
                                       {{ ($awardsSettings['prizes_enabled'] ?? true) ? 'checked' : '' }}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="flex items-center justify-between p-4 bg-gradient-to-r from-success/5 to-success/10 dark:from-success/10 dark:to-success/20 rounded-lg border border-success/20">
                            <div class="flex-1">
                                <div class="flex items-center space-x-2">
                                    <p class="font-semibold text-slate-800 dark:text-navy-100">Cash Prizes Enabled</p>
                                    <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-success/20 text-success">Monetary</span>
                                </div>
                                <p class="text-sm text-slate-600 dark:text-navy-300 mt-1">Include cash prizes for winners</p>
                            </div>
                            <label class="toggle-switch ml-4">
                                <input type="checkbox" 
                                       name="cash_prizes_enabled" 
                                       value="1"
                                       {{ ($awardsSettings['cash_prizes_enabled'] ?? true) ? 'checked' : '' }}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>

                    {{-- Winner Selection --}}
                    <div class="space-y-4">
                        <h4 class="text-sm font-semibold text-slate-700 dark:text-navy-200 uppercase tracking-wider">Winner Selection</h4>
                        
                        <div class="space-y-2">
                            <label class="block text-sm font-medium text-slate-600 dark:text-navy-300">Winner Announcement Delay (days)</label>
                            <input type="number" 
                                   name="winner_announcement_delay" 
                                   class="form-input w-full max-w-xs rounded-lg" 
                                   value="{{ $awardsSettings['winner_announcement_delay'] ?? 7 }}" 
                                   min="0" 
                                   max="90"
                                   placeholder="7">
                            <p class="text-xs text-slate-500 dark:text-navy-400">Days to wait after voting ends before announcing winners</p>
                        </div>

                        <label class="flex items-center justify-between p-3 bg-slate-50 dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700 hover:border-primary/30 transition-colors cursor-pointer">
                            <div class="flex-1">
                                <p class="font-medium text-slate-700 dark:text-navy-100">Automatic Winner Selection</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400 mt-1">Automatically select winners based on vote counts</p>
                            </div>
                            <input type="checkbox" 
                                   name="automatic_winner_selection" 
                                   value="1" 
                                   class="form-checkbox"
                                   {{ ($awardsSettings['automatic_winner_selection'] ?? true) ? 'checked' : '' }}>
                        </label>
                    </div>

                    {{-- Prize Info --}}
                    <div class="p-5 bg-gradient-to-br from-warning/5 via-success/5 to-primary/5 dark:from-warning/10 dark:via-success/10 dark:to-primary/10 border-2 border-dashed border-warning/20 rounded-xl">
                        <div class="flex items-start space-x-3">
                            <div class="p-2 bg-warning/10 rounded-lg">
                                <svg class="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <div class="flex-1">
                                <h4 class="text-sm font-bold text-warning mb-2">Prize Management</h4>
                                <p class="text-sm text-slate-700 dark:text-navy-200 mb-3">
                                    Prizes can include cash awards, recording contracts, promotional packages, or physical trophies. 
                                    Configure specific prizes for each award category in the Awards Management section.
                                </p>
                                <div class="flex items-center space-x-2 text-xs text-slate-600 dark:text-navy-300">
                                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                                    </svg>
                                    <span>Prizes are managed per award in the Awards section</span>
                                </div>
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
                            class="btn bg-warning text-white px-6 py-2 rounded-lg hover:bg-warning/90 transition-all transform hover:scale-105 shadow-lg">
                        <span class="flex items-center space-x-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span>Save Prize Settings</span>
                        </span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
