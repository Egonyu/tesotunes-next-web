@extends('layouts.admin')

@section('title', 'Store Settings')

@section('content')
<div class="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    
    <!-- Page Header -->
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Store Module Settings</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1">Configure store module settings and options</p>
        </div>
        <div class="flex gap-3">
            <a href="{{ route('admin.store.index') }}" 
               class="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                <span class="material-icons-round text-sm">arrow_back</span>
                Back to Stores
            </a>
            <form method="POST" action="{{ route('admin.store.settings.reset') }}" class="inline" onsubmit="return confirm('Are you sure you want to reset all settings to defaults?')">
                @csrf
                <button type="submit" class="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                    <span class="material-icons-round text-sm">refresh</span>
                    Reset to Defaults
                </button>
            </form>
        </div>
    </div>

    <!-- Success Message -->
    @if(session('success'))
        <div class="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4 flex items-center gap-3">
            <span class="material-icons-round text-green-600 dark:text-green-400">check_circle</span>
            <span class="text-green-800 dark:text-green-200">{{ session('success') }}</span>
        </div>
    @endif

    <!-- Settings Form -->
    <form method="POST" action="{{ route('admin.store.settings.update') }}" class="space-y-6">
        @csrf

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <!-- General Settings Card -->
            <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                    <span class="material-icons-round text-blue-600 dark:text-blue-400">settings</span>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">General Settings</h3>
                </div>
                <div class="p-6 space-y-4">
                    <!-- Module Enabled -->
                    <label class="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" name="module_enabled" value="1" {{ $settings['module_enabled'] ? 'checked' : '' }}
                               class="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                        <span class="text-sm font-medium text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">Enable Store Module</span>
                    </label>

                    <!-- Commission Rate -->
                    <div>
                        <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                            <span class="flex items-center gap-2">
                                <span class="material-icons-round text-sm">percent</span>
                                Commission Rate (%)
                            </span>
                        </label>
                        <input type="number" name="commission_rate" value="{{ $settings['commission_rate'] }}" 
                               min="0" max="100" step="0.1"
                               class="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500">
                    </div>

                    <!-- Currency -->
                    <div>
                        <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                            <span class="flex items-center gap-2">
                                <span class="material-icons-round text-sm">attach_money</span>
                                Primary Currency
                            </span>
                        </label>
                        <select name="currency" class="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500">
                            <option value="UGX" {{ $settings['currency'] === 'UGX' ? 'selected' : '' }}>UGX (Uganda Shillings)</option>
                            <option value="USD" {{ $settings['currency'] === 'USD' ? 'selected' : '' }}>USD (US Dollars)</option>
                        </select>
                    </div>

                    <!-- Payment Methods -->
                    <div>
                        <label class="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                            <span class="flex items-center gap-2">
                                <span class="material-icons-round text-sm">payment</span>
                                Payment Methods
                            </span>
                        </label>
                        <div class="space-y-2">
                            <label class="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" name="payment_methods[]" value="mobile_money" 
                                       {{ in_array('mobile_money', $settings['payment_methods'] ?? []) ? 'checked' : '' }}
                                       class="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                                <span class="text-sm text-gray-900 dark:text-white">Mobile Money</span>
                            </label>
                            <label class="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" name="payment_methods[]" value="bank_transfer" 
                                       {{ in_array('bank_transfer', $settings['payment_methods'] ?? []) ? 'checked' : '' }}
                                       class="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                                <span class="text-sm text-gray-900 dark:text-white">Bank Transfer</span>
                            </label>
                            <label class="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" name="payment_methods[]" value="credit_card" 
                                       {{ in_array('credit_card', $settings['payment_methods'] ?? []) ? 'checked' : '' }}
                                       class="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                                <span class="text-sm text-gray-900 dark:text-white">Credit Card</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Auto-Approval Settings Card -->
            <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                    <span class="material-icons-round text-purple-600 dark:text-purple-400">check_circle</span>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Auto-Approval Settings</h3>
                </div>
                <div class="p-6 space-y-4">
                    <!-- Auto-approve Stores -->
                    <label class="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" name="auto_approve_stores" value="1" {{ $settings['auto_approve_stores'] ? 'checked' : '' }}
                               class="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                        <span class="text-sm font-medium text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">Auto-approve Stores</span>
                    </label>

                    <!-- Auto-approve Products -->
                    <label class="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" name="auto_approve_products" value="1" {{ $settings['auto_approve_products'] ? 'checked' : '' }}
                               class="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                        <span class="text-sm font-medium text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">Auto-approve Products</span>
                    </label>

                    <!-- Auto-approve Promotions -->
                    <label class="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" name="auto_approve_promotions" value="1" {{ $settings['auto_approve_promotions'] ? 'checked' : '' }}
                               class="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                        <span class="text-sm font-medium text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">Auto-approve Promotions</span>
                    </label>

                    <!-- Max File Size -->
                    <div>
                        <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                            <span class="flex items-center gap-2">
                                <span class="material-icons-round text-sm">cloud_upload</span>
                                Maximum File Size
                            </span>
                        </label>
                        <input type="number" name="max_file_size" value="{{ $settings['max_file_size'] }}" 
                               min="1048576" max="52428800"
                               class="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500">
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Current: {{ number_format($settings['max_file_size'] / 1048576, 1) }}MB</p>
                    </div>
                </div>
            </div>

            <!-- Notification Settings Card -->
            <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                    <span class="material-icons-round text-yellow-600 dark:text-yellow-400">notifications</span>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Notification Settings</h3>
                </div>
                <div class="p-6 space-y-4">
                    <!-- Email Notifications -->
                    <label class="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" name="email_notifications" value="1" {{ $settings['email_notifications'] ? 'checked' : '' }}
                               class="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                        <span class="text-sm font-medium text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                            <span class="flex items-center gap-2">
                                <span class="material-icons-round text-sm">email</span>
                                Email Notifications
                            </span>
                        </span>
                    </label>

                    <!-- SMS Notifications -->
                    <label class="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" name="sms_notifications" value="1" {{ $settings['sms_notifications'] ? 'checked' : '' }}
                               class="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                        <span class="text-sm font-medium text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                            <span class="flex items-center gap-2">
                                <span class="material-icons-round text-sm">sms</span>
                                SMS Notifications
                            </span>
                        </span>
                    </label>
                </div>
            </div>

            <!-- Payout Settings Card -->
            <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                    <span class="material-icons-round text-green-600 dark:text-green-400">account_balance_wallet</span>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Payout Settings</h3>
                </div>
                <div class="p-6 space-y-4">
                    <!-- Minimum Payout -->
                    <div>
                        <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                            <span class="flex items-center gap-2">
                                <span class="material-icons-round text-sm">money</span>
                                Minimum Payout Amount (UGX)
                            </span>
                        </label>
                        <input type="number" name="minimum_payout_amount" value="{{ $settings['minimum_payout_amount'] }}" 
                               min="10000"
                               class="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500">
                    </div>

                    <!-- Payout Schedule -->
                    <div>
                        <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                            <span class="flex items-center gap-2">
                                <span class="material-icons-round text-sm">schedule</span>
                                Payout Schedule
                            </span>
                        </label>
                        <select name="payout_schedule" class="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500">
                            <option value="weekly" {{ $settings['payout_schedule'] === 'weekly' ? 'selected' : '' }}>Weekly</option>
                            <option value="monthly" {{ $settings['payout_schedule'] === 'monthly' ? 'selected' : '' }}>Monthly</option>
                            <option value="quarterly" {{ $settings['payout_schedule'] === 'quarterly' ? 'selected' : '' }}>Quarterly</option>
                        </select>
                    </div>
                </div>
            </div>

        </div>

        <!-- Form Actions -->
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-end gap-3">
            <a href="{{ route('admin.store.index') }}" class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Cancel
            </a>
            <button type="submit" class="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <span class="material-icons-round text-sm">save</span>
                Save Settings
            </button>
        </div>
    </form>

</div>
@endsection
