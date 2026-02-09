@extends('layouts.admin')

@section('title', 'Store Settings')

@section('content')
<div x-data="storeSettings()" class="space-y-6">
    
    <!-- Page Header -->
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Store Module Settings</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1">Configure store module and ecommerce settings</p>
        </div>
        <a href="{{ route('admin.store.index') }}" 
           class="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            <span class="material-icons-round text-sm">arrow_back</span>
            Back to Store
        </a>
    </div>

    <!-- Settings Form -->
    <form @submit.prevent="saveSettings" class="space-y-6">
        
        <!-- Module Status -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <span class="material-icons-round text-green-500">toggle_on</span>
                Module Control
            </h2>

            <div class="space-y-4">
                <!-- Enable Store Module -->
                <label class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                    <div class="flex items-center gap-3">
                        <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <span class="material-icons-round text-green-600 dark:text-green-400">storefront</span>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">Enable Store Module</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Allow artists to create shops and sell products</p>
                        </div>
                    </div>
                    <input 
                        type="checkbox" 
                        x-model="settings.store_enabled"
                        class="w-5 h-5 rounded border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-green-600 focus:ring-green-500 focus:ring-offset-0"
                    >
                </label>

                <!-- Maintenance Mode -->
                <label class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                    <div class="flex items-center gap-3">
                        <div class="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                            <span class="material-icons-round text-yellow-600 dark:text-yellow-400">construction</span>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">Maintenance Mode</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Temporarily disable store for maintenance</p>
                        </div>
                    </div>
                    <input 
                        type="checkbox" 
                        x-model="settings.maintenance_mode"
                        class="w-5 h-5 rounded border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-yellow-600 focus:ring-yellow-500 focus:ring-offset-0"
                    >
                </label>

                <!-- Public Access -->
                <label class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                    <div class="flex items-center gap-3">
                        <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <span class="material-icons-round text-blue-600 dark:text-blue-400">public</span>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">Allow Guest Browsing</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Let non-logged-in users browse products</p>
                        </div>
                    </div>
                    <input 
                        type="checkbox" 
                        x-model="settings.allow_guest_browsing"
                        class="w-5 h-5 rounded border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                    >
                </label>
            </div>
        </div>

        <!-- Shop Settings -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <span class="material-icons-round text-green-500">store</span>
                Shop Configuration
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Require Artist Verification -->
                <label class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                    <div class="flex items-center gap-3">
                        <span class="material-icons-round text-blue-600 dark:text-blue-400">verified</span>
                        <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">Require Verification</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Artists must be verified to sell</p>
                        </div>
                    </div>
                    <input 
                        type="checkbox" 
                        x-model="settings.require_artist_verification"
                        class="w-5 h-5 rounded border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-green-600 focus:ring-green-500 focus:ring-offset-0"
                    >
                </label>

                <!-- Allow User Shops -->
                <label class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                    <div class="flex items-center gap-3">
                        <span class="material-icons-round text-purple-600 dark:text-purple-400">person</span>
                        <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">Allow User Shops</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Non-artists can sell too</p>
                        </div>
                    </div>
                    <input 
                        type="checkbox" 
                        x-model="settings.allow_user_shops"
                        class="w-5 h-5 rounded border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                    >
                </label>

                <!-- Shop Setup Fee -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Shop Setup Fee (UGX)
                    </label>
                    <input 
                        type="number" 
                        x-model="settings.shop_setup_fee"
                        min="0"
                        step="1000"
                        class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    >
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">One-time fee to create a shop (0 = free)</p>
                </div>

                <!-- Monthly Shop Fee -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Monthly Shop Fee (UGX)
                    </label>
                    <input 
                        type="number" 
                        x-model="settings.monthly_shop_fee"
                        min="0"
                        step="1000"
                        class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    >
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Recurring monthly fee (0 = free)</p>
                </div>
            </div>
        </div>

        <!-- Commission & Fees -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <span class="material-icons-round text-green-500">monetization_on</span>
                Commission & Transaction Fees
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Platform Commission -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Platform Commission (%)
                    </label>
                    <input 
                        type="number" 
                        x-model="settings.platform_commission_percentage"
                        min="0"
                        max="100"
                        step="0.5"
                        class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    >
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Platform takes this % from each sale</p>
                </div>

                <!-- Transaction Fee -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Transaction Fee (UGX)
                    </label>
                    <input 
                        type="number" 
                        x-model="settings.transaction_fee_ugx"
                        min="0"
                        step="100"
                        class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    >
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Fixed fee per transaction</p>
                </div>

                <!-- Credit Fee -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Credit Transaction Fee (%)
                    </label>
                    <input 
                        type="number" 
                        x-model="settings.credit_transaction_fee_percentage"
                        min="0"
                        max="100"
                        step="0.5"
                        class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    >
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Fee for credit-based purchases</p>
                </div>

                <!-- Minimum Payout -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Minimum Payout (UGX)
                    </label>
                    <input 
                        type="number" 
                        x-model="settings.minimum_payout_ugx"
                        min="0"
                        step="1000"
                        class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    >
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Minimum balance to request payout</p>
                </div>
            </div>
        </div>

        <!-- Payment Methods -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <span class="material-icons-round text-green-500">payment</span>
                Payment Methods
            </h2>

            <div class="space-y-4">
                <!-- Mobile Money -->
                <label class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                    <div class="flex items-center gap-3">
                        <span class="material-icons-round text-green-600 dark:text-green-400">phone_android</span>
                        <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">Mobile Money</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400">MTN & Airtel Money</p>
                        </div>
                    </div>
                    <input 
                        type="checkbox" 
                        x-model="settings.enable_mobile_money"
                        class="w-5 h-5 rounded border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-green-600 focus:ring-green-500 focus:ring-offset-0"
                    >
                </label>

                <!-- Platform Credits -->
                <label class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                    <div class="flex items-center gap-3">
                        <span class="material-icons-round text-yellow-600 dark:text-yellow-400">stars</span>
                        <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">Platform Credits</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Allow credit purchases</p>
                        </div>
                    </div>
                    <input 
                        type="checkbox" 
                        x-model="settings.enable_credits"
                        class="w-5 h-5 rounded border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-yellow-600 focus:ring-yellow-500 focus:ring-offset-0"
                    >
                </label>

                <!-- Dual Currency -->
                <label class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                    <div class="flex items-center gap-3">
                        <span class="material-icons-round text-blue-600 dark:text-blue-400">currency_exchange</span>
                        <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">Dual Currency Pricing</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Show both UGX and credits</p>
                        </div>
                    </div>
                    <input 
                        type="checkbox" 
                        x-model="settings.enable_dual_currency"
                        class="w-5 h-5 rounded border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                    >
                </label>
            </div>
        </div>

        <!-- Order Settings -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <span class="material-icons-round text-green-500">shopping_cart</span>
                Order Management
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Auto Cancel Hours -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Auto Cancel Pending Orders (Hours)
                    </label>
                    <input 
                        type="number" 
                        x-model="settings.auto_cancel_pending_hours"
                        min="1"
                        max="168"
                        class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    >
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Cancel unpaid orders after X hours</p>
                </div>

                <!-- Delivery Days -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Expected Delivery Days
                    </label>
                    <input 
                        type="number" 
                        x-model="settings.expected_delivery_days"
                        min="1"
                        max="90"
                        class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    >
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Standard delivery timeframe</p>
                </div>

                <!-- Allow Cancellation -->
                <label class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer col-span-2">
                    <div class="flex items-center gap-3">
                        <span class="material-icons-round text-red-600 dark:text-red-400">cancel</span>
                        <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">Allow Order Cancellation</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Buyers can cancel before shipping</p>
                        </div>
                    </div>
                    <input 
                        type="checkbox" 
                        x-model="settings.allow_order_cancellation"
                        class="w-5 h-5 rounded border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-red-600 focus:ring-red-500 focus:ring-offset-0"
                    >
                </label>
            </div>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end gap-4">
            <button 
                type="button"
                @click="window.location.reload()"
                class="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            >
                Cancel
            </button>
            <button 
                type="submit"
                :disabled="saving"
                class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
            >
                <span x-show="!saving">Save Settings</span>
                <span x-show="saving">Saving...</span>
                <span x-show="!saving" class="material-icons-round">check</span>
            </button>
        </div>

    </form>

</div>

@push('scripts')
<script>
function storeSettings() {
    return {
        saving: false,
        settings: {
            // Module Control
            store_enabled: {{ config('store.enabled', true) ? 'true' : 'false' }},
            maintenance_mode: false,
            allow_guest_browsing: true,
            
            // Shop Configuration
            require_artist_verification: true,
            allow_user_shops: true,
            shop_setup_fee: 0,
            monthly_shop_fee: 0,
            
            // Commission & Fees
            platform_commission_percentage: 10,
            transaction_fee_ugx: 500,
            credit_transaction_fee_percentage: 5,
            minimum_payout_ugx: 50000,
            
            // Payment Methods
            enable_mobile_money: true,
            enable_credits: true,
            enable_dual_currency: true,
            
            // Order Management
            auto_cancel_pending_hours: 48,
            expected_delivery_days: 7,
            allow_order_cancellation: true
        },

        async init() {
            await this.loadSettings();
        },

        async loadSettings() {
            try {
                const response = await fetch('/api/backend/store/settings');
                const data = await response.json();
                if (data) {
                    this.settings = { ...this.settings, ...data };
                }
            } catch (error) {
                console.error('Error loading settings:', error);
            }
        },

        async saveSettings() {
            if (this.saving) return;
            
            this.saving = true;

            try {
                const response = await fetch('/api/backend/store/settings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                    },
                    body: JSON.stringify(this.settings)
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Settings saved successfully!');
                } else {
                    alert(data.message || 'Failed to save settings');
                }
            } catch (error) {
                console.error('Error saving settings:', error);
                alert('An error occurred. Please try again.');
            } finally {
                this.saving = false;
            }
        }
    }
}
</script>
@endpush
@endsection
