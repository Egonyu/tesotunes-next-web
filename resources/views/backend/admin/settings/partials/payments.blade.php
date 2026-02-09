{{-- Payment Settings Partial --}}
<div x-show="activeSection === 'payments'" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 transform translate-y-4" x-transition:enter-end="opacity-100 transform translate-y-0">
    <div class="settings-card">
        <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-100 mb-4">Payment Gateway Configuration</h3>

        <form @submit.prevent="saveSettings('payments')">
            <div class="form-section">
                <h4 class="text-md font-medium text-slate-700 dark:text-navy-200 mb-3">Mobile Money Settings</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">MTN API Key</label>
                        <input type="password" name="mtn_api_key" class="form-input w-full" 
                               value="{{ $paymentSettings['mtn_api_key'] ?? '' }}" 
                               placeholder="MTN Mobile Money API Key">
                        <p class="text-xs text-slate-500 dark:text-navy-400 mt-1">Enter your MTN Mobile Money API key for payment processing</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Airtel API Key</label>
                        <input type="password" name="airtel_api_key" class="form-input w-full" 
                               value="{{ $paymentSettings['airtel_api_key'] ?? '' }}" 
                               placeholder="Airtel Money API Key">
                        <p class="text-xs text-slate-500 dark:text-navy-400 mt-1">Enter your Airtel Money API key for payment processing</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Transaction Fee (%)</label>
                        <input type="number" name="transaction_fee_percentage" class="form-input w-full" 
                               value="{{ $paymentSettings['transaction_fee_percentage'] ?? 2.5 }}" 
                               step="0.1" min="0" max="10" 
                               placeholder="Transaction fee percentage">
                        <p class="text-xs text-slate-500 dark:text-navy-400 mt-1">Platform transaction fee (0-10%)</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Minimum Payout (UGX)</label>
                        <input type="number" name="minimum_payout" class="form-input w-full" 
                               value="{{ $paymentSettings['minimum_payout'] ?? 50000 }}" 
                               min="1000" step="1000" 
                               placeholder="Minimum payout amount">
                        <p class="text-xs text-slate-500 dark:text-navy-400 mt-1">Minimum amount artists can withdraw</p>
                    </div>
                </div>

                <div class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div class="flex items-start space-x-2">
                        <svg class="size-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                        </svg>
                        <div>
                            <p class="text-sm font-medium text-blue-800 dark:text-blue-200">Mobile Money Configuration</p>
                            <p class="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                To enable mobile money payments, you need to register with MTN and Airtel Money and obtain API credentials. 
                                Visit their developer portals to get your API keys. Keep these credentials secure.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="form-section">
                <h4 class="text-md font-medium text-slate-700 dark:text-navy-200 mb-3">Payment Options</h4>
                <div class="space-y-4">
                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                        <div>
                            <p class="font-medium text-slate-700 dark:text-navy-100">MTN Mobile Money</p>
                            <p class="text-sm text-slate-500 dark:text-navy-400">Enable MTN Mobile Money payments for users</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" name="mtn_money_enabled" value="1" 
                                   {{ ($paymentSettings['mtn_money_enabled'] ?? true) ? 'checked' : '' }}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                        <div>
                            <p class="font-medium text-slate-700 dark:text-navy-100">Airtel Money</p>
                            <p class="text-sm text-slate-500 dark:text-navy-400">Enable Airtel Money payments for users</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" name="airtel_money_enabled" value="1" 
                                   {{ ($paymentSettings['airtel_money_enabled'] ?? true) ? 'checked' : '' }}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                        <div>
                            <p class="font-medium text-slate-700 dark:text-navy-100">PayPal</p>
                            <p class="text-sm text-slate-500 dark:text-navy-400">Enable PayPal payments for international users</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" name="paypal_enabled" value="1" 
                                   {{ ($paymentSettings['paypal_enabled'] ?? false) ? 'checked' : '' }}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                        <div>
                            <p class="font-medium text-slate-700 dark:text-navy-100">Bank Transfers</p>
                            <p class="text-sm text-slate-500 dark:text-navy-400">Enable direct bank transfer for payouts</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" name="bank_transfer_enabled" value="1" 
                                   {{ ($paymentSettings['bank_transfer_enabled'] ?? false) ? 'checked' : '' }}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>

                <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div class="flex items-center space-x-2">
                            <svg class="size-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                            </svg>
                            <div>
                                <p class="text-sm font-medium text-green-800 dark:text-green-200">
                                    {{ ($paymentSettings['mtn_money_enabled'] ?? true) ? 'Active' : 'Inactive' }}
                                </p>
                                <p class="text-xs text-green-700 dark:text-green-300">MTN Money</p>
                            </div>
                        </div>
                    </div>

                    <div class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div class="flex items-center space-x-2">
                            <svg class="size-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                            </svg>
                            <div>
                                <p class="text-sm font-medium text-green-800 dark:text-green-200">
                                    {{ ($paymentSettings['airtel_money_enabled'] ?? true) ? 'Active' : 'Inactive' }}
                                </p>
                                <p class="text-xs text-green-700 dark:text-green-300">Airtel Money</p>
                            </div>
                        </div>
                    </div>

                    <div class="p-4 bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-600 rounded-lg">
                        <div class="flex items-center space-x-2">
                            <svg class="size-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd"></path>
                            </svg>
                            <div>
                                <p class="text-sm font-medium text-slate-600 dark:text-navy-300">
                                    {{ count(array_filter([$paymentSettings['mtn_money_enabled'] ?? true, $paymentSettings['airtel_money_enabled'] ?? true, $paymentSettings['paypal_enabled'] ?? false, $paymentSettings['bank_transfer_enabled'] ?? false])) }} / 4
                                </p>
                                <p class="text-xs text-slate-500 dark:text-navy-400">Methods Active</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex justify-end mt-6 pt-4 border-t border-slate-200 dark:border-navy-600">
                <button type="submit" class="btn bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                    <span class="flex items-center space-x-2">
                        <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span>Save Payment Settings</span>
                    </span>
                </button>
            </div>
        </form>
    </div>
</div>
