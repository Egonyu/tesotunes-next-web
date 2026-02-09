{{-- Events & Tickets Settings Partial --}}
<div x-show="activeSection === 'events'" 
     x-transition:enter="transition ease-out duration-300" 
     x-transition:enter-start="opacity-0 transform translate-y-4" 
     x-transition:enter-end="opacity-100 transform translate-y-0">
    
    <div class="settings-card" x-data="{ activeTab: 'general' }">
        {{-- Header --}}
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
                <div class="p-2 bg-primary/10 rounded-lg">
                    <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-100">Events & Tickets Configuration</h3>
                    <p class="text-sm text-slate-500 dark:text-navy-400">Manage event creation, ticketing, and fee structures</p>
                </div>
            </div>
            
            {{-- Status Badge --}}
            <div class="flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium
                        {{ ($eventsSettings['events_enabled'] ?? true) 
                            ? 'bg-success/10 text-success' 
                            : 'bg-error/10 text-error' }}">
                <span class="w-2 h-2 rounded-full {{ ($eventsSettings['events_enabled'] ?? true) ? 'bg-success' : 'bg-error' }}"></span>
                <span>{{ ($eventsSettings['events_enabled'] ?? true) ? 'Active' : 'Disabled' }}</span>
            </div>
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
                <button @click="activeTab = 'ticketing'" 
                        :class="activeTab === 'ticketing' ? 'active' : ''" 
                        class="nav-tab flex items-center space-x-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
                    </svg>
                    <span>Ticketing</span>
                </button>
                <button @click="activeTab = 'fees'" 
                        :class="activeTab === 'fees' ? 'active' : ''" 
                        class="nav-tab flex items-center space-x-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span>Fees & Commission</span>
                </button>
            </div>
        </div>

        {{-- General Tab --}}
        <div x-show="activeTab === 'general'" 
             x-transition:enter="transition ease-out duration-200" 
             x-transition:enter-start="opacity-0" 
             x-transition:enter-end="opacity-100">
            <form @submit.prevent="saveTabSettings('events', 'general')">
                <div class="space-y-6">
                    
                    {{-- Enable Events Toggle --}}
                    <div class="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-navy-800 dark:to-navy-900 rounded-lg border border-slate-200 dark:border-navy-700">
                        <div class="flex-1">
                            <div class="flex items-center space-x-2">
                                <p class="font-semibold text-slate-800 dark:text-navy-100">Enable Events System</p>
                                <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">Core Feature</span>
                            </div>
                            <p class="text-sm text-slate-600 dark:text-navy-300 mt-1">Allow artists to create and manage live events and concerts</p>
                        </div>
                        <label class="toggle-switch ml-4">
                            <input type="checkbox" 
                                   name="events_enabled" 
                                   value="1" 
                                   {{ ($eventsSettings['events_enabled'] ?? true) ? 'checked' : '' }}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    {{-- Require Event Approval Toggle --}}
                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700">
                        <div class="flex-1">
                            <div class="flex items-center space-x-2">
                                <p class="font-medium text-slate-700 dark:text-navy-100">Require Admin Approval</p>
                                <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-warning/10 text-warning">Security</span>
                            </div>
                            <p class="text-sm text-slate-500 dark:text-navy-400 mt-1">Events must be reviewed and approved by admins before going live</p>
                        </div>
                        <label class="toggle-switch ml-4">
                            <input type="checkbox" 
                                   name="events_require_approval" 
                                   value="1"
                                   {{ ($eventsSettings['events_require_approval'] ?? true) ? 'checked' : '' }}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    {{-- Event Limits --}}
                    <div class="space-y-4">
                        <h4 class="text-sm font-semibold text-slate-700 dark:text-navy-200 uppercase tracking-wider">Event Limits & Restrictions</h4>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="space-y-2">
                                <label class="flex items-center space-x-2 text-sm font-medium text-slate-600 dark:text-navy-300">
                                    <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                    </svg>
                                    <span>Max Events per Artist (monthly)</span>
                                </label>
                                <input type="number" 
                                       name="max_events_per_artist" 
                                       class="form-input w-full rounded-lg" 
                                       value="{{ $eventsSettings['max_events_per_artist'] ?? 5 }}" 
                                       min="1" 
                                       max="100"
                                       placeholder="e.g., 5">
                                <p class="text-xs text-slate-500 dark:text-navy-400">
                                    <span class="inline-flex items-center space-x-1">
                                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                                        </svg>
                                        <span>Prevents spam and maintains quality standards</span>
                                    </span>
                                </p>
                            </div>
                            
                            <div class="space-y-2">
                                <label class="flex items-center space-x-2 text-sm font-medium text-slate-600 dark:text-navy-300">
                                    <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    <span>Event Creation Lead Time (days)</span>
                                </label>
                                <input type="number" 
                                       name="event_lead_time" 
                                       class="form-input w-full rounded-lg" 
                                       value="{{ $eventsSettings['event_lead_time'] ?? 7 }}" 
                                       min="0" 
                                       max="365"
                                       placeholder="e.g., 7">
                                <p class="text-xs text-slate-500 dark:text-navy-400">
                                    <span class="inline-flex items-center space-x-1">
                                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                                        </svg>
                                        <span>Minimum days before event date that it must be created</span>
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                    
                </div>
                
                {{-- Save Button --}}
                <div class="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-slate-200 dark:border-navy-600">
                    <button type="button" 
                            @click="activeTab = 'general'; $el.closest('form').reset()"
                            class="btn border border-slate-300 dark:border-navy-600 text-slate-700 dark:text-navy-100 px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors">
                        Reset
                    </button>
                    <button type="submit" 
                            class="btn bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-all transform hover:scale-105 shadow-lg">
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

        {{-- Ticketing Tab --}}
        <div x-show="activeTab === 'ticketing'" 
             x-transition:enter="transition ease-out duration-200" 
             x-transition:enter-start="opacity-0" 
             x-transition:enter-end="opacity-100">
            <form @submit.prevent="saveTabSettings('events', 'ticketing')">
                <div class="space-y-6">
                    
                    {{-- Enable Paid Tickets --}}
                    <div class="flex items-center justify-between p-4 bg-gradient-to-r from-success/5 to-success/10 dark:from-success/10 dark:to-success/20 rounded-lg border border-success/20">
                        <div class="flex-1">
                            <div class="flex items-center space-x-2">
                                <p class="font-semibold text-slate-800 dark:text-navy-100">Enable Paid Tickets</p>
                                <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-success/20 text-success">Revenue</span>
                            </div>
                            <p class="text-sm text-slate-600 dark:text-navy-300 mt-1">Allow artists to sell paid event tickets through the platform</p>
                        </div>
                        <label class="toggle-switch ml-4">
                            <input type="checkbox" 
                                   name="paid_tickets_enabled" 
                                   value="1" 
                                   {{ ($eventsSettings['paid_tickets_enabled'] ?? true) ? 'checked' : '' }}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    {{-- Ticket Price Limits --}}
                    <div class="space-y-4">
                        <h4 class="text-sm font-semibold text-slate-700 dark:text-navy-200 uppercase tracking-wider">Price Limits</h4>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="space-y-2">
                                <label class="flex items-center space-x-2 text-sm font-medium text-slate-600 dark:text-navy-300">
                                    <span>Min Ticket Price (UGX)</span>
                                </label>
                                <div class="relative">
                                    <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 font-medium">UGX</span>
                                    <input type="number" 
                                           name="min_ticket_price" 
                                           class="form-input w-full pl-14 rounded-lg" 
                                           value="{{ $eventsSettings['min_ticket_price'] ?? 5000 }}" 
                                           min="0"
                                           step="1000"
                                           placeholder="5,000">
                                </div>
                                <p class="text-xs text-slate-500 dark:text-navy-400">Minimum allowed ticket price to maintain quality</p>
                            </div>
                            
                            <div class="space-y-2">
                                <label class="flex items-center space-x-2 text-sm font-medium text-slate-600 dark:text-navy-300">
                                    <span>Max Ticket Price (UGX)</span>
                                </label>
                                <div class="relative">
                                    <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 font-medium">UGX</span>
                                    <input type="number" 
                                           name="max_ticket_price" 
                                           class="form-input w-full pl-14 rounded-lg" 
                                           value="{{ $eventsSettings['max_ticket_price'] ?? 500000 }}" 
                                           min="0"
                                           step="1000"
                                           placeholder="500,000">
                                </div>
                                <p class="text-xs text-slate-500 dark:text-navy-400">Maximum allowed ticket price</p>
                            </div>
                        </div>
                    </div>

                    {{-- Ticket Verification --}}
                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700">
                        <div class="flex-1">
                            <div class="flex items-center space-x-2">
                                <p class="font-medium text-slate-700 dark:text-navy-100">QR Code Verification</p>
                                <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-info/10 text-info">Recommended</span>
                            </div>
                            <p class="text-sm text-slate-500 dark:text-navy-400 mt-1">Require QR code scanning for ticket validation at event entry</p>
                        </div>
                        <label class="toggle-switch ml-4">
                            <input type="checkbox" 
                                   name="ticket_verification" 
                                   value="1" 
                                   {{ ($eventsSettings['ticket_verification'] ?? true) ? 'checked' : '' }}>
                            <span class="toggle-slider"></span>
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
                            class="btn bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-all transform hover:scale-105 shadow-lg">
                        <span class="flex items-center space-x-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span>Save Ticketing Settings</span>
                        </span>
                    </button>
                </div>
            </form>
        </div>

        {{-- Fees & Commission Tab --}}
        <div x-show="activeTab === 'fees'" 
             x-transition:enter="transition ease-out duration-200" 
             x-transition:enter-start="opacity-0" 
             x-transition:enter-end="opacity-100">
            <form @submit.prevent="saveTabSettings('events', 'fees')">
                <div class="space-y-6">
                    
                    {{-- Platform Fees --}}
                    <div class="space-y-4">
                        <h4 class="text-sm font-semibold text-slate-700 dark:text-navy-200 uppercase tracking-wider">Platform Fees</h4>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="space-y-2">
                                <label class="flex items-center space-x-2 text-sm font-medium text-slate-600 dark:text-navy-300">
                                    <span>Platform Commission (%)</span>
                                </label>
                                <div class="relative">
                                    <input type="number" 
                                           name="platform_commission" 
                                           class="form-input w-full pr-10 rounded-lg" 
                                           value="{{ $eventsSettings['platform_commission'] ?? 10 }}" 
                                           min="0" 
                                           max="50"
                                           step="0.1" 
                                           placeholder="10">
                                    <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 font-medium">%</span>
                                </div>
                                <p class="text-xs text-slate-500 dark:text-navy-400">Platform's share of ticket sales revenue</p>
                            </div>
                            
                            <div class="space-y-2">
                                <label class="flex items-center space-x-2 text-sm font-medium text-slate-600 dark:text-navy-300">
                                    <span>Payment Processing Fee (%)</span>
                                </label>
                                <div class="relative">
                                    <input type="number" 
                                           name="processing_fee" 
                                           class="form-input w-full pr-10 rounded-lg" 
                                           value="{{ $eventsSettings['processing_fee'] ?? 2.9 }}" 
                                           min="0" 
                                           max="10"
                                           step="0.1" 
                                           placeholder="2.9">
                                    <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 font-medium">%</span>
                                </div>
                                <p class="text-xs text-slate-500 dark:text-navy-400">Payment gateway processing fee (MTN/Airtel Money)</p>
                            </div>
                        </div>
                    </div>

                    {{-- Auto Calculate Total --}}
                    <div class="flex items-center justify-between p-4 bg-info/5 dark:bg-info/10 rounded-lg border border-info/20">
                        <div class="flex-1">
                            <div class="flex items-center space-x-2">
                                <p class="font-medium text-slate-700 dark:text-navy-100">Auto-Calculate Total Price</p>
                                <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-info/20 text-info">Transparency</span>
                            </div>
                            <p class="text-sm text-slate-500 dark:text-navy-400 mt-1">Include all fees in the displayed ticket price (recommended for better UX)</p>
                        </div>
                        <label class="toggle-switch ml-4">
                            <input type="checkbox" 
                                   name="auto_calculate_total" 
                                   value="1" 
                                   {{ ($eventsSettings['auto_calculate_total'] ?? true) ? 'checked' : '' }}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    {{-- Refund & Cancellation --}}
                    <div class="space-y-4">
                        <h4 class="text-sm font-semibold text-slate-700 dark:text-navy-200 uppercase tracking-wider">Refund Policy</h4>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="space-y-2">
                                <label class="flex items-center space-x-2 text-sm font-medium text-slate-600 dark:text-navy-300">
                                    <span>Refund Fee (%)</span>
                                </label>
                                <div class="relative">
                                    <input type="number" 
                                           name="refund_fee" 
                                           class="form-input w-full pr-10 rounded-lg" 
                                           value="{{ $eventsSettings['refund_fee'] ?? 5 }}" 
                                           min="0" 
                                           max="100"
                                           step="0.1" 
                                           placeholder="5">
                                    <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 font-medium">%</span>
                                </div>
                                <p class="text-xs text-slate-500 dark:text-navy-400">Fee charged for processing ticket refunds</p>
                            </div>
                            
                            <div class="space-y-2">
                                <label class="flex items-center space-x-2 text-sm font-medium text-slate-600 dark:text-navy-300">
                                    <span>Cancellation Period (hours)</span>
                                </label>
                                <div class="relative">
                                    <input type="number" 
                                           name="cancellation_period" 
                                           class="form-input w-full pr-14 rounded-lg" 
                                           value="{{ $eventsSettings['cancellation_period'] ?? 24 }}" 
                                           min="0"
                                           placeholder="24">
                                    <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm">hours</span>
                                </div>
                                <p class="text-xs text-slate-500 dark:text-navy-400">Minimum hours before event to allow ticket cancellations</p>
                            </div>
                        </div>
                    </div>

                    {{-- Fee Calculation Example --}}
                    <div class="p-5 bg-gradient-to-br from-primary/5 via-info/5 to-success/5 dark:from-primary/10 dark:via-info/10 dark:to-success/10 border-2 border-dashed border-primary/20 rounded-xl">
                        <div class="flex items-start space-x-3">
                            <div class="p-2 bg-primary/10 rounded-lg">
                                <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                                </svg>
                            </div>
                            <div class="flex-1">
                                <h4 class="text-sm font-bold text-primary mb-3">Fee Calculation Example</h4>
                                <div class="space-y-2 text-sm">
                                    <div class="flex justify-between py-2 border-b border-primary/10">
                                        <span class="text-slate-600 dark:text-navy-300">Base Ticket Price:</span>
                                        <span class="font-semibold text-slate-800 dark:text-navy-100">UGX 50,000</span>
                                    </div>
                                    <div class="flex justify-between py-2 border-b border-primary/10">
                                        <span class="text-slate-600 dark:text-navy-300">Platform Commission ({{ $eventsSettings['platform_commission'] ?? 10 }}%):</span>
                                        <span class="font-medium text-slate-700 dark:text-navy-200">UGX {{ number_format(50000 * (($eventsSettings['platform_commission'] ?? 10) / 100)) }}</span>
                                    </div>
                                    <div class="flex justify-between py-2 border-b border-primary/10">
                                        <span class="text-slate-600 dark:text-navy-300">Processing Fee ({{ $eventsSettings['processing_fee'] ?? 2.9 }}%):</span>
                                        <span class="font-medium text-slate-700 dark:text-navy-200">UGX {{ number_format(50000 * (($eventsSettings['processing_fee'] ?? 2.9) / 100)) }}</span>
                                    </div>
                                    <div class="flex justify-between py-3 bg-primary/10 dark:bg-primary/20 rounded-lg px-3 mt-2">
                                        <span class="font-bold text-primary">Total Customer Pays:</span>
                                        <span class="font-bold text-primary text-lg">UGX {{ number_format(50000 + (50000 * (($eventsSettings['platform_commission'] ?? 10) / 100)) + (50000 * (($eventsSettings['processing_fee'] ?? 2.9) / 100))) }}</span>
                                    </div>
                                    <div class="flex justify-between py-2 bg-success/10 dark:bg-success/20 rounded-lg px-3">
                                        <span class="font-semibold text-success">Artist Receives:</span>
                                        <span class="font-bold text-success">UGX {{ number_format(50000) }}</span>
                                    </div>
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
                            class="btn bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-all transform hover:scale-105 shadow-lg">
                        <span class="flex items-center space-x-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span>Save Fee Settings</span>
                        </span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
