@extends('layouts.app')

@section('title', 'Account Settings')

@section('left-sidebar')
    @include('frontend.partials.user-left-sidebar')
@endsection

@push('styles')
<style>
    /* Light mode glass styles */
    .glass-panel {
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 0, 0, 0.08);
    }
    .glass-card {
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 0, 0, 0.06);
    }
    /* Dark mode glass styles */
    .dark .glass-panel {
        background: rgba(22, 27, 34, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .dark .glass-card {
        background: rgba(30, 35, 45, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.05);
    }
    /* Custom toggle switch */
    .toggle-switch {
        @apply relative inline-flex items-center cursor-pointer;
    }
    .toggle-switch input {
        @apply sr-only peer;
    }
    .toggle-switch .toggle-bg {
        @apply w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-green;
    }
</style>
@endpush

@php
    $notificationPrefs = $user->notification_preferences ?? [];
@endphp

@section('content')
<!-- Main Settings Content -->
<div class="max-w-[1200px] mx-auto space-y-8">
    <!-- Header Section -->
    <div class="glass-panel rounded-2xl p-8 relative overflow-hidden">
        <div class="absolute -right-20 -top-20 w-96 h-96 bg-brand-purple/10 rounded-full blur-3xl"></div>
        <div class="relative z-10">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-1">Account Settings</h1>
                    <p class="text-gray-500 dark:text-text-secondary">Manage your account preferences and notifications</p>
                </div>
                <a href="{{ route('frontend.profile.show') }}" class="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg transition-all border border-gray-200 dark:border-gray-600">
                    <span class="material-symbols-outlined text-lg">arrow_back</span>
                    Back to Profile
                </a>
            </div>
        </div>
    </div>

    <form action="{{ route('frontend.profile.settings.update') }}" method="POST">
        @csrf

        <div class="grid lg:grid-cols-3 gap-8">
            <!-- Left Column - Navigation -->
            <div class="lg:col-span-1 space-y-6">
                <!-- Settings Navigation -->
                <div class="glass-panel rounded-2xl p-6 sticky top-24">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span class="material-symbols-outlined text-brand-purple">settings</span>
                        Settings Menu
                    </h3>
                    <nav class="space-y-2">
                        <a href="#privacy" class="flex items-center gap-3 p-3 bg-brand-green/10 dark:bg-brand-green/20 text-brand-green rounded-xl font-medium">
                            <span class="material-symbols-outlined">lock</span>
                            Privacy
                        </a>
                        <a href="#notifications" class="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-xl transition-colors">
                            <span class="material-symbols-outlined">notifications</span>
                            Notifications
                        </a>
                        <a href="#security" class="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-xl transition-colors">
                            <span class="material-symbols-outlined">security</span>
                            Security
                        </a>
                    </nav>
                </div>

                <!-- Quick Links Card -->
                <div class="glass-panel rounded-2xl p-6">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span class="material-symbols-outlined text-brand-blue">link</span>
                        Quick Links
                    </h3>
                    <div class="space-y-3">
                        <a href="{{ route('frontend.profile.payments') }}" class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-colors group">
                            <div class="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                                <span class="material-symbols-outlined text-green-500">receipt_long</span>
                            </div>
                            <span class="text-gray-700 dark:text-gray-300 font-medium">Payment History</span>
                        </a>
                        <a href="{{ route('frontend.subscription.index') }}" class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-colors group">
                            <div class="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                                <span class="material-symbols-outlined text-purple-500">card_membership</span>
                            </div>
                            <span class="text-gray-700 dark:text-gray-300 font-medium">Subscription</span>
                        </a>
                    </div>
                </div>
            </div>

            <!-- Right Column - Settings Content -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Privacy Settings -->
                <div id="privacy" class="glass-panel rounded-2xl p-6">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="p-2 bg-brand-green/20 rounded-lg">
                            <span class="material-symbols-outlined text-brand-green">lock</span>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Privacy Settings</h3>
                            <p class="text-gray-500 dark:text-text-secondary text-sm">Control who can see your profile and activity</p>
                        </div>
                    </div>

                    <div class="space-y-6">
                        <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                            <div>
                                <h4 class="font-semibold text-gray-900 dark:text-white">Public Profile</h4>
                                <p class="text-gray-500 dark:text-text-secondary text-sm">Allow others to find and view your profile</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" name="settings[public_profile]" value="1"
                                       {{ ($user->settings['public_profile'] ?? false) ? 'checked' : '' }}>
                                <div class="toggle-bg"></div>
                            </label>
                        </div>

                        <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                            <div>
                                <h4 class="font-semibold text-gray-900 dark:text-white">Show Listening Activity</h4>
                                <p class="text-gray-500 dark:text-text-secondary text-sm">Display what you're listening to on your profile</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" name="settings[show_activity]" value="1"
                                       {{ ($user->settings['show_activity'] ?? true) ? 'checked' : '' }}>
                                <div class="toggle-bg"></div>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Notification Preferences -->
                <div id="notifications" class="glass-panel rounded-2xl p-6">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="p-2 bg-brand-blue/20 rounded-lg">
                            <span class="material-symbols-outlined text-brand-blue">notifications</span>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Notification Preferences</h3>
                            <p class="text-gray-500 dark:text-text-secondary text-sm">Choose what notifications you want to receive</p>
                        </div>
                    </div>

                    <!-- Payment Notifications -->
                    <div class="mb-8">
                        <h4 class="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span class="material-symbols-outlined text-green-500 text-lg">payments</span>
                            Payment Notifications
                        </h4>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                <div>
                                    <p class="font-medium text-gray-900 dark:text-white">Payment Received</p>
                                    <p class="text-gray-500 dark:text-text-secondary text-sm">When you receive payment confirmations</p>
                                </div>
                                <div class="flex items-center gap-6">
                                    <label class="flex items-center gap-2 text-sm">
                                        <input type="checkbox" name="notification_preferences[payment_received][email]" value="1"
                                               class="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-brand-green focus:ring-brand-green"
                                               {{ ($notificationPrefs['payment_received']['email'] ?? true) ? 'checked' : '' }}>
                                        <span class="text-gray-600 dark:text-gray-300">Email</span>
                                    </label>
                                    <label class="flex items-center gap-2 text-sm">
                                        <input type="checkbox" name="notification_preferences[payment_received][push]" value="1"
                                               class="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-brand-green focus:ring-brand-green"
                                               {{ ($notificationPrefs['payment_received']['push'] ?? true) ? 'checked' : '' }}>
                                        <span class="text-gray-600 dark:text-gray-300">Push</span>
                                    </label>
                                </div>
                            </div>

                            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                <div>
                                    <p class="font-medium text-gray-900 dark:text-white">Payment Failed</p>
                                    <p class="text-gray-500 dark:text-text-secondary text-sm">When a payment fails or needs attention</p>
                                </div>
                                <div class="flex items-center gap-6">
                                    <label class="flex items-center gap-2 text-sm">
                                        <input type="checkbox" name="notification_preferences[payment_failed][email]" value="1"
                                               class="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-brand-green focus:ring-brand-green"
                                               {{ ($notificationPrefs['payment_failed']['email'] ?? true) ? 'checked' : '' }}>
                                        <span class="text-gray-600 dark:text-gray-300">Email</span>
                                    </label>
                                    <label class="flex items-center gap-2 text-sm">
                                        <input type="checkbox" name="notification_preferences[payment_failed][push]" value="1"
                                               class="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-brand-green focus:ring-brand-green"
                                               {{ ($notificationPrefs['payment_failed']['push'] ?? true) ? 'checked' : '' }}>
                                        <span class="text-gray-600 dark:text-gray-300">Push</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Social Notifications -->
                    <div class="mb-8">
                        <h4 class="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span class="material-symbols-outlined text-blue-500 text-lg">group</span>
                            Social Notifications
                        </h4>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                <div>
                                    <p class="font-medium text-gray-900 dark:text-white">New Followers</p>
                                    <p class="text-gray-500 dark:text-text-secondary text-sm">When someone follows you</p>
                                </div>
                                <div class="flex items-center gap-6">
                                    <label class="flex items-center gap-2 text-sm">
                                        <input type="checkbox" name="notification_preferences[new_follower][email]" value="1"
                                               class="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-brand-green focus:ring-brand-green"
                                               {{ ($notificationPrefs['new_follower']['email'] ?? true) ? 'checked' : '' }}>
                                        <span class="text-gray-600 dark:text-gray-300">Email</span>
                                    </label>
                                    <label class="flex items-center gap-2 text-sm">
                                        <input type="checkbox" name="notification_preferences[new_follower][push]" value="1"
                                               class="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-brand-green focus:ring-brand-green"
                                               {{ ($notificationPrefs['new_follower']['push'] ?? true) ? 'checked' : '' }}>
                                        <span class="text-gray-600 dark:text-gray-300">Push</span>
                                    </label>
                                </div>
                            </div>

                            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                <div>
                                    <p class="font-medium text-gray-900 dark:text-white">Likes & Comments</p>
                                    <p class="text-gray-500 dark:text-text-secondary text-sm">When someone interacts with your content</p>
                                </div>
                                <div class="flex items-center gap-6">
                                    <label class="flex items-center gap-2 text-sm">
                                        <input type="checkbox" name="notification_preferences[new_like][email]" value="1"
                                               class="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-brand-green focus:ring-brand-green"
                                               {{ ($notificationPrefs['new_like']['email'] ?? false) ? 'checked' : '' }}>
                                        <span class="text-gray-600 dark:text-gray-300">Email</span>
                                    </label>
                                    <label class="flex items-center gap-2 text-sm">
                                        <input type="checkbox" name="notification_preferences[new_like][push]" value="1"
                                               class="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-brand-green focus:ring-brand-green"
                                               {{ ($notificationPrefs['new_like']['push'] ?? true) ? 'checked' : '' }}>
                                        <span class="text-gray-600 dark:text-gray-300">Push</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Music & Content Notifications -->
                    <div class="mb-8">
                        <h4 class="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span class="material-symbols-outlined text-purple-500 text-lg">music_note</span>
                            Music & Content
                        </h4>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                <div>
                                    <p class="font-medium text-gray-900 dark:text-white">Artist Releases</p>
                                    <p class="text-gray-500 dark:text-text-secondary text-sm">New music from artists you follow</p>
                                </div>
                                <div class="flex items-center gap-6">
                                    <label class="flex items-center gap-2 text-sm">
                                        <input type="checkbox" name="notification_preferences[artist_release][email]" value="1"
                                               class="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-brand-green focus:ring-brand-green"
                                               {{ ($notificationPrefs['artist_release']['email'] ?? true) ? 'checked' : '' }}>
                                        <span class="text-gray-600 dark:text-gray-300">Email</span>
                                    </label>
                                    <label class="flex items-center gap-2 text-sm">
                                        <input type="checkbox" name="notification_preferences[artist_release][push]" value="1"
                                               class="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-brand-green focus:ring-brand-green"
                                               {{ ($notificationPrefs['artist_release']['push'] ?? true) ? 'checked' : '' }}>
                                        <span class="text-gray-600 dark:text-gray-300">Push</span>
                                    </label>
                                </div>
                            </div>

                            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                <div>
                                    <p class="font-medium text-gray-900 dark:text-white">Event Reminders</p>
                                    <p class="text-gray-500 dark:text-text-secondary text-sm">Reminders for events you're attending</p>
                                </div>
                                <div class="flex items-center gap-6">
                                    <label class="flex items-center gap-2 text-sm">
                                        <input type="checkbox" name="notification_preferences[event_reminder][email]" value="1"
                                               class="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-brand-green focus:ring-brand-green"
                                               {{ ($notificationPrefs['event_reminder']['email'] ?? true) ? 'checked' : '' }}>
                                        <span class="text-gray-600 dark:text-gray-300">Email</span>
                                    </label>
                                    <label class="flex items-center gap-2 text-sm">
                                        <input type="checkbox" name="notification_preferences[event_reminder][push]" value="1"
                                               class="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-brand-green focus:ring-brand-green"
                                               {{ ($notificationPrefs['event_reminder']['push'] ?? true) ? 'checked' : '' }}>
                                        <span class="text-gray-600 dark:text-gray-300">Push</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Marketing & Updates -->
                    <div>
                        <h4 class="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span class="material-symbols-outlined text-yellow-500 text-lg">campaign</span>
                            Marketing & Updates
                        </h4>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                <div>
                                    <p class="font-medium text-gray-900 dark:text-white">Weekly Stats</p>
                                    <p class="text-gray-500 dark:text-text-secondary text-sm">Weekly summary of your listening activity</p>
                                </div>
                                <div class="flex items-center gap-6">
                                    <label class="flex items-center gap-2 text-sm">
                                        <input type="checkbox" name="notification_preferences[weekly_stats][email]" value="1"
                                               class="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-brand-green focus:ring-brand-green"
                                               {{ ($notificationPrefs['weekly_stats']['email'] ?? true) ? 'checked' : '' }}>
                                        <span class="text-gray-600 dark:text-gray-300">Email</span>
                                    </label>
                                </div>
                            </div>

                            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                <div>
                                    <p class="font-medium text-gray-900 dark:text-white">System Announcements</p>
                                    <p class="text-gray-500 dark:text-text-secondary text-sm">Important updates and announcements</p>
                                </div>
                                <div class="flex items-center gap-6">
                                    <label class="flex items-center gap-2 text-sm">
                                        <input type="checkbox" name="notification_preferences[system_announcement][email]" value="1"
                                               class="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-brand-green focus:ring-brand-green"
                                               {{ ($notificationPrefs['system_announcement']['email'] ?? true) ? 'checked' : '' }}>
                                        <span class="text-gray-600 dark:text-gray-300">Email</span>
                                    </label>
                                    <label class="flex items-center gap-2 text-sm">
                                        <input type="checkbox" name="notification_preferences[system_announcement][push]" value="1"
                                               class="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-brand-green focus:ring-brand-green"
                                               {{ ($notificationPrefs['system_announcement']['push'] ?? true) ? 'checked' : '' }}>
                                        <span class="text-gray-600 dark:text-gray-300">Push</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Security Section -->
                <div id="security" class="glass-panel rounded-2xl p-6">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="p-2 bg-red-500/20 rounded-lg">
                            <span class="material-symbols-outlined text-red-500">security</span>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Security</h3>
                            <p class="text-gray-500 dark:text-text-secondary text-sm">Manage your account security settings</p>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                            <div class="flex items-center gap-3">
                                <div class="p-2 bg-green-500/20 rounded-lg">
                                    <span class="material-symbols-outlined text-green-500">verified_user</span>
                                </div>
                                <div>
                                    <p class="font-medium text-gray-900 dark:text-white">Email Verified</p>
                                    <p class="text-gray-500 dark:text-text-secondary text-sm">{{ $user->email }}</p>
                                </div>
                            </div>
                            <span class="px-3 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded-full">Verified</span>
                        </div>

                        <a href="#" class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors group">
                            <div class="flex items-center gap-3">
                                <div class="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                                    <span class="material-symbols-outlined text-blue-500">key</span>
                                </div>
                                <div>
                                    <p class="font-medium text-gray-900 dark:text-white">Change Password</p>
                                    <p class="text-gray-500 dark:text-text-secondary text-sm">Update your account password</p>
                                </div>
                            </div>
                            <span class="material-symbols-outlined text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">chevron_right</span>
                        </a>

                        <a href="#" class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors group">
                            <div class="flex items-center gap-3">
                                <div class="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                                    <span class="material-symbols-outlined text-purple-500">devices</span>
                                </div>
                                <div>
                                    <p class="font-medium text-gray-900 dark:text-white">Active Sessions</p>
                                    <p class="text-gray-500 dark:text-text-secondary text-sm">Manage your active devices</p>
                                </div>
                            </div>
                            <span class="material-symbols-outlined text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">chevron_right</span>
                        </a>
                    </div>
                </div>

                <!-- Save Button -->
                <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
                    <a href="{{ route('frontend.profile.show') }}"
                       class="w-full sm:w-auto px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-semibold text-gray-700 dark:text-gray-300 transition-colors text-center">
                        Cancel
                    </a>
                    
                    <button type="submit"
                            class="w-full sm:w-auto px-8 py-3 bg-brand-green hover:bg-green-600 rounded-xl font-semibold text-white transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/30 flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined text-lg">save</span>
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    </form>
</div>
@endsection
