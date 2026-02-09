@extends('layouts.admin')

@section('title', 'System Settings')

@section('content')
<div class="p-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-6">
        <div>
            <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">System Settings</h1>
            <p class="text-slate-600 dark:text-navy-300 mt-1">Configure system-wide settings and preferences</p>
        </div>
        <div class="flex space-x-3">
            <form method="POST" action="{{ route('admin.settings.initialize-defaults') }}" class="inline">
                @csrf
                <button type="submit"
                        class="btn bg-slate-600 font-medium text-white hover:bg-slate-700 focus:bg-slate-700 active:bg-slate-700/90"
                        onclick="return confirm('This will initialize default settings. Continue?')">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Initialize Defaults
                </button>
            </form>
        </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="card mb-6">
        <nav class="flex space-x-4 md:space-x-8 p-4 overflow-x-auto" aria-label="Tabs">
            <button type="button" id="tab-general" class="tab-button active whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm" onclick="switchTab('general')">
                General Settings
            </button>
            <button type="button" id="tab-frontend" class="tab-button whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm" onclick="switchTab('frontend')">
                Frontend Design
            </button>
            <button type="button" id="tab-mobile" class="tab-button whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm" onclick="switchTab('mobile')">
                Mobile Verification
            </button>
        </nav>
    </div>

    <!-- General Settings Tab -->
    <div id="general-tab" class="tab-content card p-6">
        <form method="POST" action="{{ route('admin.settings.update') }}">
            @csrf

            <!-- Settings Groups -->
            <div class="space-y-8">
                @foreach($settingGroups as $groupName => $settings)
                    @if($settings->count() > 0)
                        <div class="card">
                            <div class="px-6 py-4 border-b border-slate-200 dark:border-navy-500">
                                <h2 class="text-lg font-medium text-slate-800 dark:text-navy-50 capitalize">{{ str_replace('_', ' ', $groupName) }} Settings</h2>
                            </div>
                            <div class="p-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    @foreach($settings as $setting)
                                        <div class="space-y-2">
                                            <label for="setting_{{ $setting->key }}" class="block text-sm font-medium text-slate-700 dark:text-navy-100">
                                                {{ ucwords(str_replace('_', ' ', $setting->key)) }}
                                            </label>

                                            @if($setting->type === 'boolean')
                                                <div class="flex items-center">
                                                    <input type="hidden" name="settings[{{ $setting->key }}]" value="0">
                                                    <input type="checkbox"
                                                           id="setting_{{ $setting->key }}"
                                                           name="settings[{{ $setting->key }}]"
                                                           value="1"
                                                           {{ $setting->getValue() ? 'checked' : '' }}
                                                           class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-navy-450 rounded">
                                                    <span class="ml-2 text-sm text-slate-600 dark:text-navy-300">
                                                        {{ $setting->getValue() ? 'Enabled' : 'Disabled' }}
                                                    </span>
                                                </div>
                                            @elseif($setting->type === 'number')
                                                <input type="number"
                                                       id="setting_{{ $setting->key }}"
                                                       name="settings[{{ $setting->key }}]"
                                                       value="{{ $setting->getValue() }}"
                                                       class="mt-1 block w-full border-slate-300 dark:border-navy-450 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                            @elseif($setting->type === 'text')
                                                <textarea id="setting_{{ $setting->key }}"
                                                          name="settings[{{ $setting->key }}]"
                                                          rows="3"
                                                          class="mt-1 block w-full border-slate-300 dark:border-navy-450 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">{{ $setting->getValue() }}</textarea>
                                            @elseif($setting->type === 'json')
                                                <textarea id="setting_{{ $setting->key }}"
                                                          name="settings[{{ $setting->key }}]"
                                                          rows="4"
                                                          class="mt-1 block w-full border-slate-300 dark:border-navy-450 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono text-sm">{{ json_encode($setting->getValue(), JSON_PRETTY_PRINT) }}</textarea>
                                            @else
                                                <input type="text"
                                                       id="setting_{{ $setting->key }}"
                                                       name="settings[{{ $setting->key }}]"
                                                       value="{{ $setting->getValue() }}"
                                                       class="mt-1 block w-full border-slate-300 dark:border-navy-450 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                            @endif

                                            @if($setting->description)
                                                <p class="text-xs text-slate-500 dark:text-navy-400">{{ $setting->description }}</p>
                                            @endif
                                        </div>
                                    @endforeach
                                </div>
                            </div>
                        </div>
                    @endif
                @endforeach
            </div>

            <!-- Save Button -->
            <div class="mt-8 flex justify-end">
                <button type="submit"
                        class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Save Settings
                </button>
            </div>
        </form>
    </div>

    <!-- Frontend Design Tab -->
    <div id="frontend-tab" class="tab-content hidden">
        <!-- Desktop & Mobile Tabs -->
        <div class="mb-6">
            <nav class="flex space-x-4" aria-label="Frontend Design Tabs">
                <button type="button" id="frontend-desktop-tab-btn" class="frontend-subtab-button active whitespace-nowrap py-2 px-4 border-b-2 font-medium text-sm" onclick="switchFrontendTab('desktop')">
                    <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    Desktop Design
                </button>
                <button type="button" id="frontend-mobile-tab-btn" class="frontend-subtab-button whitespace-nowrap py-2 px-4 border-b-2 font-medium text-sm" onclick="switchFrontendTab('mobile')">
                    <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                    </svg>
                    Mobile Design
                </button>
            </nav>
        </div>

        <!-- Desktop Design Card -->
        <div id="frontend-desktop-content" class="frontend-subcontent card p-6">
            @include('admin.settings.partials.frontend-design.desktop-settings')
        </div>

        <!-- Mobile Design Card -->
        <div id="frontend-mobile-content" class="frontend-subcontent hidden card p-6">
            @include('admin.settings.partials.frontend-design.mobile-settings')
        </div>
    </div>

    <!-- Mobile Verification Tab -->
    <div id="mobile-tab" class="tab-content hidden">
        @include('admin.settings.partials.mobile-verification')
    </div>
</div>

@push('styles')
<style>
.tab-button {
    border-bottom: 2px solid transparent;
    transition: all 0.2s ease-in-out;
}

.tab-button.active {
    border-color: #3b82f6;
    color: #3b82f6;
}

.tab-button:not(.active) {
    color: #6b7280;
    border-color: transparent;
}

.tab-button:not(.active):hover {
    color: #374151;
    border-color: #d1d5db;
}

.frontend-subtab-button {
    border-bottom: 2px solid transparent;
    transition: all 0.2s ease-in-out;
}

.frontend-subtab-button.active {
    border-color: #3b82f6;
    color: #3b82f6;
}

.frontend-subtab-button:not(.active) {
    color: #6b7280;
    border-color: transparent;
}

.frontend-subtab-button:not(.active):hover {
    color: #374151;
    border-color: #d1d5db;
}

.tab-content {
    animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
</style>
@endpush

@push('scripts')
<script>
// Tab switching functionality
function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });

    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active', 'border-blue-500', 'text-blue-600');
        button.classList.add('border-transparent', 'text-slate-500 dark:text-navy-400', 'hover:text-slate-700 dark:text-navy-100', 'hover:border-slate-300 dark:border-navy-450');
    });

    // Show selected tab content
    document.getElementById(tabName + '-tab').classList.remove('hidden');

    // Add active class to selected tab button
    const activeButton = document.getElementById('tab-' + tabName);
    activeButton.classList.add('active', 'border-blue-500', 'text-blue-600');
    activeButton.classList.remove('border-transparent', 'text-slate-500 dark:text-navy-400', 'hover:text-slate-700 dark:text-navy-100', 'hover:border-slate-300 dark:border-navy-450');
}

document.addEventListener('DOMContentLoaded', function() {
    // Check for tab parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const activeTab = urlParams.get('tab') || 'general';

    // Initialize tabs styling
    switchTab(activeTab);

    // Toggle boolean setting display text
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        const span = checkbox.nextElementSibling;
        if (span && span.tagName === 'SPAN') {
            checkbox.addEventListener('change', function() {
                span.textContent = this.checked ? 'Enabled' : 'Disabled';
            });
        }
    });

    // JSON validation
    const jsonTextareas = document.querySelectorAll('textarea[name*="settings"]:has([id*="json"])');
    jsonTextareas.forEach(textarea => {
        if (textarea.name.includes('json') || textarea.value.startsWith('{') || textarea.value.startsWith('[')) {
            textarea.addEventListener('blur', function() {
                try {
                    JSON.parse(this.value);
                    this.classList.remove('border-red-300');
                    this.classList.add('border-slate-300 dark:border-navy-450');
                } catch (e) {
                    this.classList.remove('border-slate-300 dark:border-navy-450');
                    this.classList.add('border-red-300');
                    alert('Invalid JSON format');
                }
            });
        }
    });
});

// Frontend Design subtab switching
function switchFrontendTab(tabName) {
    document.querySelectorAll('.frontend-subcontent').forEach(content => {
        content.classList.add('hidden');
    });
    
    document.querySelectorAll('.frontend-subtab-button').forEach(button => {
        button.classList.remove('active', 'border-blue-500', 'text-blue-600');
        button.classList.add('border-transparent', 'text-slate-500 dark:text-navy-400');
    });
    
    document.getElementById('frontend-' + tabName + '-content').classList.remove('hidden');
    
    const activeButton = document.getElementById('frontend-' + tabName + '-tab-btn');
    activeButton.classList.add('active', 'border-blue-500', 'text-blue-600');
    activeButton.classList.remove('border-transparent', 'text-slate-500 dark:text-navy-400');
}

// Handle frontend design form submissions
document.addEventListener('DOMContentLoaded', function() {
    // Mobile frontend form
    const mobileForm = document.getElementById('mobile-frontend-form');
    if (mobileForm) {
        mobileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveFrontendDesign('mobile', new FormData(this));
        });
    }

    // Desktop frontend form
    const desktopForm = document.getElementById('desktop-frontend-form');
    if (desktopForm) {
        desktopForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveFrontendDesign('desktop', new FormData(this));
        });
    }
});

function saveFrontendDesign(type, formData) {
    const settings = {};
    
    for (let [key, value] of formData.entries()) {
        if (key.startsWith('settings[')) {
            const settingKey = key.replace('settings[', '').replace(']', '');
            if (value === 'on' || value === '1') {
                settings[settingKey] = true;
            } else {
                settings[settingKey] = value;
            }
        }
    }

    fetch('{{ route('admin.settings.frontend-design') }}', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
        },
        body: JSON.stringify({
            type: type,
            settings: settings
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification(data.message, 'success');
        } else {
            showNotification(data.message || 'Failed to save settings', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('An error occurred while saving settings', 'error');
    });
}

function resetFrontendDesign(type) {
    if (!confirm('Are you sure you want to reset ' + type + ' settings to defaults? This cannot be undone.')) {
        return;
    }

    fetch('{{ route('admin.settings.frontend-design.reset') }}', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
        },
        body: JSON.stringify({ type: type })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification(data.message, 'success');
            setTimeout(() => window.location.reload(), 1500);
        } else {
            showNotification(data.message || 'Failed to reset settings', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('An error occurred while resetting settings', 'error');
    });
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
</script>
@endpush
@endsection