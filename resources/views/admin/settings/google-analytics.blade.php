@extends('layouts.admin')

@section('title', 'Google Analytics Settings')

@section('content')
<div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-8">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Google Analytics Settings</h1>
                <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Configure Google Analytics tracking for your platform</p>
            </div>
            <a href="{{ route('admin.settings.index') }}" class="inline-flex items-center px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                Back to Settings
            </a>
        </div>
    </div>

    @if(session('success'))
        <div class="mb-6 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-200 px-4 py-3 rounded relative" role="alert">
            <span class="block sm:inline">{{ session('success') }}</span>
        </div>
    @endif

    @if(session('error'))
        <div class="mb-6 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded relative" role="alert">
            <span class="block sm:inline">{{ session('error') }}</span>
        </div>
    @endif

    <!-- Google Analytics Configuration -->
    <form method="POST" action="{{ route('admin.settings.google-analytics.update') }}">
        @csrf
        
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
            <!-- Enable/Disable Section -->
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-lg font-medium text-gray-900 dark:text-white">Google Analytics Status</h2>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Enable or disable Google Analytics tracking</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="google_analytics_enabled" value="1" 
                               {{ $settings['google_analytics_enabled'] ? 'checked' : '' }}
                               class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                            {{ $settings['google_analytics_enabled'] ? 'Enabled' : 'Disabled' }}
                        </span>
                    </label>
                </div>
            </div>

            <!-- Configuration Fields -->
            <div class="p-6">
                <div class="space-y-6">
                    <!-- Tracking ID (GA3) -->
                    <div>
                        <label for="google_analytics_tracking_id" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Tracking ID (Universal Analytics - GA3)
                            <span class="text-gray-500 text-xs">(Format: UA-XXXXXXXXX-X)</span>
                        </label>
                        <input type="text" 
                               id="google_analytics_tracking_id" 
                               name="google_analytics_tracking_id" 
                               value="{{ $settings['google_analytics_tracking_id'] }}"
                               placeholder="UA-XXXXXXXXX-X"
                               class="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Legacy Universal Analytics tracking ID (being phased out)</p>
                    </div>

                    <!-- Measurement ID (GA4) -->
                    <div>
                        <label for="google_analytics_measurement_id" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Measurement ID (GA4) <span class="text-red-500">*</span>
                            <span class="text-gray-500 text-xs">(Format: G-XXXXXXXXXX)</span>
                        </label>
                        <input type="text" 
                               id="google_analytics_measurement_id" 
                               name="google_analytics_measurement_id" 
                               value="{{ $settings['google_analytics_measurement_id'] }}"
                               placeholder="G-XXXXXXXXXX"
                               class="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Google Analytics 4 measurement ID (recommended)</p>
                    </div>

                    <!-- Divider -->
                    <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <h3 class="text-md font-medium text-gray-900 dark:text-white mb-4">Tracking Options</h3>
                    </div>

                    <!-- Track Events -->
                    <div class="flex items-center justify-between">
                        <div class="flex-1">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Track User Events</label>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Track song plays, downloads, likes, and other user interactions</p>
                        </div>
                        <input type="checkbox" 
                               name="google_analytics_track_events" 
                               value="1"
                               {{ $settings['google_analytics_track_events'] ? 'checked' : '' }}
                               class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                    </div>

                    <!-- Track E-commerce -->
                    <div class="flex items-center justify-between">
                        <div class="flex-1">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Track E-commerce</label>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Track subscription purchases and payment transactions</p>
                        </div>
                        <input type="checkbox" 
                               name="google_analytics_track_ecommerce" 
                               value="1"
                               {{ $settings['google_analytics_track_ecommerce'] ? 'checked' : '' }}
                               class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                    </div>

                    <!-- Anonymize IP -->
                    <div class="flex items-center justify-between">
                        <div class="flex-1">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Anonymize IP Addresses</label>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Comply with GDPR by anonymizing user IP addresses</p>
                        </div>
                        <input type="checkbox" 
                               name="google_analytics_anonymize_ip" 
                               value="1"
                               {{ $settings['google_analytics_anonymize_ip'] ? 'checked' : '' }}
                               class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                    </div>
                </div>
            </div>

            <!-- Help Section -->
            <div class="px-6 py-4 bg-blue-50 dark:bg-blue-900/20 border-t border-gray-200 dark:border-gray-700">
                <h3 class="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">📖 Setup Instructions</h3>
                <ol class="text-xs text-blue-800 dark:text-blue-300 space-y-1 list-decimal list-inside">
                    <li>Create a Google Analytics 4 property at <a href="https://analytics.google.com" target="_blank" class="underline">analytics.google.com</a></li>
                    <li>Copy your Measurement ID (format: G-XXXXXXXXXX) from the property settings</li>
                    <li>Paste the Measurement ID above and enable tracking</li>
                    <li>Save settings and verify tracking in your GA4 real-time reports</li>
                </ol>
            </div>

            <!-- Save Button -->
            <div class="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <button type="submit"
                        class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Save Analytics Settings
                </button>
            </div>
        </div>
    </form>
</div>

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Toggle switch visual update
    const checkbox = document.querySelector('input[name="google_analytics_enabled"]');
    const statusText = checkbox.closest('label').querySelector('span');
    
    checkbox.addEventListener('change', function() {
        statusText.textContent = this.checked ? 'Enabled' : 'Disabled';
    });
});
</script>
@endpush
@endsection
