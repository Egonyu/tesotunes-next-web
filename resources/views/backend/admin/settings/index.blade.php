@extends('layouts.admin')

@section('title', 'System Settings')

@push('head')
<meta name="csrf-token" content="{{ csrf_token() }}">
<style>
    .settings-content {
        margin-top: 1rem;
    }

    .settings-sidebar {
        position: sticky;
        top: 1rem;
        height: fit-content;
    }

    .settings-nav-item {
        transition: all 0.2s ease;
    }

    .settings-nav-item:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .settings-nav-item.active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }

    .settings-card {
        background: white;
        border-radius: 0.75rem;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        border: 1px solid #e2e8f0;
        transition: all 0.2s ease;
    }

    .settings-card:hover {
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        transform: translateY(-2px);
    }

    .dark .settings-card {
        background: #1e293b;
        border-color: #334155;
    }

    .form-section {
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 1.5rem;
        margin-bottom: 1.5rem;
    }

    .form-section:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
    }

    .dark .form-section {
        border-color: #334155;
    }

    /* Card Navigation Tabs */
    .card-nav-tabs {
        border-bottom: 1px solid #e2e8f0;
        margin-bottom: 1.5rem;
    }

    .card-nav-tabs .nav-tab {
        padding: 0.75rem 1rem;
        margin-bottom: -1px;
        border-bottom: 2px solid transparent;
        color: #64748b;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .card-nav-tabs .nav-tab:hover {
        color: #3b82f6;
        border-bottom-color: #bfdbfe;
    }

    .card-nav-tabs .nav-tab.active {
        color: #3b82f6;
        border-bottom-color: #3b82f6;
        background: rgba(59, 130, 246, 0.05);
    }

    .dark .card-nav-tabs {
        border-bottom-color: #334155;
    }

    .dark .card-nav-tabs .nav-tab {
        color: #94a3b8;
    }

    .dark .card-nav-tabs .nav-tab:hover {
        color: #60a5fa;
        border-bottom-color: #1e40af;
    }

    .dark .card-nav-tabs .nav-tab.active {
        color: #60a5fa;
        border-bottom-color: #60a5fa;
        background: rgba(96, 165, 250, 0.1);
    }

    /* Enhanced Form Styling */
    .form-input {
        border: 1.5px solid #d1d5db !important;
        border-radius: 0.5rem !important;
        padding: 0.75rem 1rem !important;
        background: white !important;
        color: #1f2937 !important;
        font-size: 0.875rem !important;
        transition: all 0.2s ease !important;
    }

    .form-input:focus {
        border-color: #3b82f6 !important;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        outline: none !important;
    }

    .form-select {
        border: 1.5px solid #d1d5db !important;
        border-radius: 0.5rem !important;
        padding: 0.75rem 1rem !important;
        background: white !important;
        color: #1f2937 !important;
        font-size: 0.875rem !important;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e") !important;
        background-position: right 0.5rem center !important;
        background-repeat: no-repeat !important;
        background-size: 1.5em 1.5em !important;
        padding-right: 2.5rem !important;
    }

    .form-select:focus {
        border-color: #3b82f6 !important;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        outline: none !important;
    }

    .form-checkbox {
        width: 1.25rem !important;
        height: 1.25rem !important;
        border: 2px solid #d1d5db !important;
        border-radius: 0.375rem !important;
        background: white !important;
        color: #3b82f6 !important;
        transition: all 0.2s ease !important;
    }

    .form-checkbox:checked {
        background: #3b82f6 !important;
        border-color: #3b82f6 !important;
    }

    .form-checkbox:focus {
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        outline: none !important;
    }

    .dark .form-input,
    .dark .form-select {
        background: #334155 !important;
        border-color: #475569 !important;
        color: #f1f5f9 !important;
    }

    .dark .form-input:focus,
    .dark .form-select:focus {
        border-color: #60a5fa !important;
        box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1) !important;
    }

    .dark .form-checkbox {
        background: #334155 !important;
        border-color: #475569 !important;
    }

    .dark .form-checkbox:checked {
        background: #60a5fa !important;
        border-color: #60a5fa !important;
    }

    /* Toggle Switch Styling */
    .toggle-switch {
        position: relative;
        display: inline-block;
        width: 3rem;
        height: 1.75rem;
    }

    .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .toggle-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #cbd5e1;
        transition: 0.3s;
        border-radius: 1.75rem;
    }

    .toggle-slider:before {
        position: absolute;
        content: "";
        height: 1.25rem;
        width: 1.25rem;
        left: 0.25rem;
        bottom: 0.25rem;
        background-color: white;
        transition: 0.3s;
        border-radius: 50%;
    }

    input:checked + .toggle-slider {
        background-color: #3b82f6;
    }

    input:checked + .toggle-slider:before {
        transform: translateX(1.25rem);
    }

    .dark input:checked + .toggle-slider {
        background-color: #60a5fa;
    }
</style>
@endpush

@section('page-header')
    <div class="flex items-center justify-between py-6">
        <div>
            <h1 class="text-2xl font-bold text-slate-800 dark:text-navy-50">System Settings</h1>
            <p class="text-slate-500 dark:text-navy-300">Configure and manage your music platform settings</p>
        </div>
        <div class="flex items-center space-x-3">
            <div class="flex items-center space-x-2 rounded-lg bg-info/10 px-3 py-2 text-info">
                <svg class="size-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-sm font-medium">Auto-Save Enabled</span>
            </div>
        </div>
    </div>
@endsection

@section('content')
<div class="p-6">
    <!-- Page Header -->
    <div class="mb-6">
        <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">System Settings</h1>
        <p class="text-slate-600 dark:text-navy-300 mt-1">Configure system-wide settings and preferences</p>
    </div>

<div class="settings-content grid grid-cols-12 gap-6" x-data="settingsManager()">

    <!-- Mini Sidebar Navigation -->
    <div class="col-span-12 lg:col-span-3">
        <div class="settings-sidebar">
            <div class="space-y-3">

                <!-- General Settings -->
                <div @click="setActiveSection('general')"
                     class="settings-nav-item cursor-pointer rounded-xl p-4 border border-slate-200 dark:border-navy-600"
                     :class="activeSection === 'general' ? 'active' : 'bg-white dark:bg-navy-800 hover:bg-slate-50 dark:hover:bg-navy-700'">
                    <div class="flex items-center space-x-3">
                        <div class="flex size-10 items-center justify-center rounded-lg"
                             :class="activeSection === 'general' ? 'bg-white/20' : 'bg-blue-100 dark:bg-blue-900/30'">
                            <svg class="size-5" :class="activeSection === 'general' ? 'text-white' : 'text-blue-600 dark:text-blue-400'"
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <p class="font-semibold" :class="activeSection === 'general' ? 'text-white' : 'text-slate-800 dark:text-navy-100'">
                                General Settings
                            </p>
                            <p class="text-xs" :class="activeSection === 'general' ? 'text-white/80' : 'text-slate-500 dark:text-navy-400'">
                                Basic configuration
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Frontend Design -->
                <div @click="setActiveSection('frontend')"
                     class="settings-nav-item cursor-pointer rounded-xl p-4 border border-slate-200 dark:border-navy-600"
                     :class="activeSection === 'frontend' ? 'active' : 'bg-white dark:bg-navy-800 hover:bg-slate-50 dark:hover:bg-navy-700'">
                    <div class="flex items-center space-x-3">
                        <div class="flex size-10 items-center justify-center rounded-lg"
                             :class="activeSection === 'frontend' ? 'bg-white/20' : 'bg-purple-100 dark:bg-purple-900/30'">
                            <svg class="size-5" :class="activeSection === 'frontend' ? 'text-white' : 'text-purple-600 dark:text-purple-400'"
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                            </svg>
                        </div>
                        <div>
                            <p class="font-semibold" :class="activeSection === 'frontend' ? 'text-white' : 'text-slate-800 dark:text-navy-100'">
                                Frontend Design
                            </p>
                            <p class="text-xs" :class="activeSection === 'frontend' ? 'text-white/80' : 'text-slate-500 dark:text-navy-400'">
                                Mobile & desktop layout
                            </p>
                        </div>
                    </div>
                </div>

                <!-- User Management -->
                <div @click="setActiveSection('users')"
                     class="settings-nav-item cursor-pointer rounded-xl p-4 border border-slate-200 dark:border-navy-600"
                     :class="activeSection === 'users' ? 'active' : 'bg-white dark:bg-navy-800 hover:bg-slate-50 dark:hover:bg-navy-700'">
                    <div class="flex items-center space-x-3">
                        <div class="flex size-10 items-center justify-center rounded-lg"
                             :class="activeSection === 'users' ? 'bg-white/20' : 'bg-green-100 dark:bg-green-900/30'">
                            <svg class="size-5" :class="activeSection === 'users' ? 'text-white' : 'text-green-600 dark:text-green-400'"
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div>
                            <p class="font-semibold" :class="activeSection === 'users' ? 'text-white' : 'text-slate-800 dark:text-navy-100'">
                                User Management
                            </p>
                            <p class="text-xs" :class="activeSection === 'users' ? 'text-white/80' : 'text-slate-500 dark:text-navy-400'">
                                User roles & permissions
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Credit System -->
                <div @click="setActiveSection('credits')"
                     class="settings-nav-item cursor-pointer rounded-xl p-4 border border-slate-200 dark:border-navy-600"
                     :class="activeSection === 'credits' ? 'active' : 'bg-white dark:bg-navy-800 hover:bg-slate-50 dark:hover:bg-navy-700'">
                    <div class="flex items-center space-x-3">
                        <div class="flex size-10 items-center justify-center rounded-lg"
                             :class="activeSection === 'credits' ? 'bg-white/20' : 'bg-yellow-100 dark:bg-yellow-900/30'">
                            <svg class="size-5" :class="activeSection === 'credits' ? 'text-white' : 'text-yellow-600 dark:text-yellow-400'"
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                        <div>
                            <p class="font-semibold" :class="activeSection === 'credits' ? 'text-white' : 'text-slate-800 dark:text-navy-100'">
                                Credit System
                            </p>
                            <p class="text-xs" :class="activeSection === 'credits' ? 'text-white/80' : 'text-slate-500 dark:text-navy-400'">
                                Rates & transactions
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Payment Settings -->
                <div @click="setActiveSection('payments')"
                     class="settings-nav-item cursor-pointer rounded-xl p-4 border border-slate-200 dark:border-navy-600"
                     :class="activeSection === 'payments' ? 'active' : 'bg-white dark:bg-navy-800 hover:bg-slate-50 dark:hover:bg-navy-700'">
                    <div class="flex items-center space-x-3">
                        <div class="flex size-10 items-center justify-center rounded-lg"
                             :class="activeSection === 'payments' ? 'bg-white/20' : 'bg-purple-100 dark:bg-purple-900/30'">
                            <svg class="size-5" :class="activeSection === 'payments' ? 'text-white' : 'text-purple-600 dark:text-purple-400'"
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                        <div>
                            <p class="font-semibold" :class="activeSection === 'payments' ? 'text-white' : 'text-slate-800 dark:text-navy-100'">
                                Payment Settings
                            </p>
                            <p class="text-xs" :class="activeSection === 'payments' ? 'text-white/80' : 'text-slate-500 dark:text-navy-400'">
                                Mobile Money & API
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Notification Settings -->
                <div @click="setActiveSection('notifications')"
                     class="settings-nav-item cursor-pointer rounded-xl p-4 border border-slate-200 dark:border-navy-600"
                     :class="activeSection === 'notifications' ? 'active' : 'bg-white dark:bg-navy-800 hover:bg-slate-50 dark:hover:bg-navy-700'">
                    <div class="flex items-center space-x-3">
                        <div class="flex size-10 items-center justify-center rounded-lg"
                             :class="activeSection === 'notifications' ? 'bg-white/20' : 'bg-red-100 dark:bg-red-900/30'">
                            <svg class="size-5" :class="activeSection === 'notifications' ? 'text-white' : 'text-red-600 dark:text-red-400'"
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <div>
                            <p class="font-semibold" :class="activeSection === 'notifications' ? 'text-white' : 'text-slate-800 dark:text-navy-100'">
                                Notifications
                            </p>
                            <p class="text-xs" :class="activeSection === 'notifications' ? 'text-white/80' : 'text-slate-500 dark:text-navy-400'">
                                Email & SMS alerts
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Mobile Verification -->
                <div @click="setActiveSection('mobile')"
                     class="settings-nav-item cursor-pointer rounded-xl p-4 border border-slate-200 dark:border-navy-600"
                     :class="activeSection === 'mobile' ? 'active' : 'bg-white dark:bg-navy-800 hover:bg-slate-50 dark:hover:bg-navy-700'">
                    <div class="flex items-center space-x-3">
                        <div class="flex size-10 items-center justify-center rounded-lg"
                             :class="activeSection === 'mobile' ? 'bg-white/20' : 'bg-indigo-100 dark:bg-indigo-900/30'">
                            <svg class="size-5" :class="activeSection === 'mobile' ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'"
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <p class="font-semibold" :class="activeSection === 'mobile' ? 'text-white' : 'text-slate-800 dark:text-navy-100'">
                                Mobile Verification
                            </p>
                            <p class="text-xs" :class="activeSection === 'mobile' ? 'text-white/80' : 'text-slate-500 dark:text-navy-400'">
                                SMS verification
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Security Settings -->
                <div @click="setActiveSection('security')"
                     class="settings-nav-item cursor-pointer rounded-xl p-4 border border-slate-200 dark:border-navy-600"
                     :class="activeSection === 'security' ? 'active' : 'bg-white dark:bg-navy-800 hover:bg-slate-50 dark:hover:bg-navy-700'">
                    <div class="flex items-center space-x-3">
                        <div class="flex size-10 items-center justify-center rounded-lg"
                             :class="activeSection === 'security' ? 'bg-white/20' : 'bg-red-100 dark:bg-red-900/30'">
                            <svg class="size-5" :class="activeSection === 'security' ? 'text-white' : 'text-red-600 dark:text-red-400'"
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <p class="font-semibold" :class="activeSection === 'security' ? 'text-white' : 'text-slate-800 dark:text-navy-100'">
                                Security & Auth
                            </p>
                            <p class="text-xs" :class="activeSection === 'security' ? 'text-white/80' : 'text-slate-500 dark:text-navy-400'">
                                Security, authentication & social login
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Awards System -->
                <div @click="setActiveSection('awards')"
                     class="settings-nav-item cursor-pointer rounded-xl p-4 border border-slate-200 dark:border-navy-600"
                     :class="activeSection === 'awards' ? 'active' : 'bg-white dark:bg-navy-800 hover:bg-slate-50 dark:hover:bg-navy-700'">
                    <div class="flex items-center space-x-3">
                        <div class="flex size-10 items-center justify-center rounded-lg"
                             :class="activeSection === 'awards' ? 'bg-white/20' : 'bg-amber-100 dark:bg-amber-900/30'">
                            <svg class="size-5" :class="activeSection === 'awards' ? 'text-white' : 'text-amber-600 dark:text-amber-400'"
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                        </div>
                        <div>
                            <p class="font-semibold" :class="activeSection === 'awards' ? 'text-white' : 'text-slate-800 dark:text-navy-100'">
                                Awards System
                            </p>
                            <p class="text-xs" :class="activeSection === 'awards' ? 'text-white/80' : 'text-slate-500 dark:text-navy-400'">
                                Achievements & badges
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Events & Tickets -->
                <div @click="setActiveSection('events')"
                     class="settings-nav-item cursor-pointer rounded-xl p-4 border border-slate-200 dark:border-navy-600"
                     :class="activeSection === 'events' ? 'active' : 'bg-white dark:bg-navy-800 hover:bg-slate-50 dark:hover:bg-navy-700'">
                    <div class="flex items-center space-x-3">
                        <div class="flex size-10 items-center justify-center rounded-lg"
                             :class="activeSection === 'events' ? 'bg-white/20' : 'bg-pink-100 dark:bg-pink-900/30'">
                            <svg class="size-5" :class="activeSection === 'events' ? 'text-white' : 'text-pink-600 dark:text-pink-400'"
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <p class="font-semibold" :class="activeSection === 'events' ? 'text-white' : 'text-slate-800 dark:text-navy-100'">
                                Events & Tickets
                            </p>
                            <p class="text-xs" :class="activeSection === 'events' ? 'text-white/80' : 'text-slate-500 dark:text-navy-400'">
                                Event management
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Artist Management -->
                <div @click="setActiveSection('artists')"
                     class="settings-nav-item cursor-pointer rounded-xl p-4 border border-slate-200 dark:border-navy-600"
                     :class="activeSection === 'artists' ? 'active' : 'bg-white dark:bg-navy-800 hover:bg-slate-50 dark:hover:bg-navy-700'">
                    <div class="flex items-center space-x-3">
                        <div class="flex size-10 items-center justify-center rounded-lg"
                             :class="activeSection === 'artists' ? 'bg-white/20' : 'bg-cyan-100 dark:bg-cyan-900/30'">
                            <svg class="size-5" :class="activeSection === 'artists' ? 'text-white' : 'text-cyan-600 dark:text-cyan-400'"
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                        </div>
                        <div>
                            <p class="font-semibold" :class="activeSection === 'artists' ? 'text-white' : 'text-slate-800 dark:text-navy-100'">
                                Artist Management
                            </p>
                            <p class="text-xs" :class="activeSection === 'artists' ? 'text-white/80' : 'text-slate-500 dark:text-navy-400'">
                                Artist settings
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Storage Settings -->
                <div @click="setActiveSection('storage')"
                     class="settings-nav-item cursor-pointer rounded-xl p-4 border border-slate-200 dark:border-navy-600"
                     :class="activeSection === 'storage' ? 'active' : 'bg-white dark:bg-navy-800 hover:bg-slate-50 dark:hover:bg-navy-700'">
                    <div class="flex items-center space-x-3">
                        <div class="flex size-10 items-center justify-center rounded-lg"
                             :class="activeSection === 'storage' ? 'bg-white/20' : 'bg-teal-100 dark:bg-teal-900/30'">
                            <svg class="size-5" :class="activeSection === 'storage' ? 'text-white' : 'text-teal-600 dark:text-teal-400'"
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <p class="font-semibold" :class="activeSection === 'storage' ? 'text-white' : 'text-slate-800 dark:text-navy-100'">
                                Storage Settings
                            </p>
                            <p class="text-xs" :class="activeSection === 'storage' ? 'text-white/80' : 'text-slate-500 dark:text-navy-400'">
                                File storage config
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Google Analytics -->
                <div @click="setActiveSection('google-analytics')"
                     class="settings-nav-item cursor-pointer rounded-xl p-4 border border-slate-200 dark:border-navy-600"
                     :class="activeSection === 'google-analytics' ? 'active' : 'bg-white dark:bg-navy-800 hover:bg-slate-50 dark:hover:bg-navy-700'">
                    <div class="flex items-center space-x-3">
                        <div class="flex size-10 items-center justify-center rounded-lg"
                             :class="activeSection === 'google-analytics' ? 'bg-white/20' : 'bg-blue-100 dark:bg-blue-900/30'">
                            <svg class="size-5" :class="activeSection === 'google-analytics' ? 'text-white' : 'text-blue-600 dark:text-blue-400'"
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div>
                            <p class="font-semibold" :class="activeSection === 'google-analytics' ? 'text-white' : 'text-slate-800 dark:text-navy-100'">
                                Google Analytics
                            </p>
                            <p class="text-xs" :class="activeSection === 'google-analytics' ? 'text-white/80' : 'text-slate-500 dark:text-navy-400'">
                                GA4 tracking & events
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Ads Management -->
                <div @click="setActiveSection('ads-management')"
                     class="settings-nav-item cursor-pointer rounded-xl p-4 border border-slate-200 dark:border-navy-600"
                     :class="activeSection === 'ads-management' ? 'active' : 'bg-white dark:bg-navy-800 hover:bg-slate-50 dark:hover:bg-navy-700'">
                    <div class="flex items-center space-x-3">
                        <div class="flex size-10 items-center justify-center rounded-lg"
                             :class="activeSection === 'ads-management' ? 'bg-white/20' : 'bg-emerald-100 dark:bg-emerald-900/30'">
                            <svg class="size-5" :class="activeSection === 'ads-management' ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'"
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                            </svg>
                        </div>
                        <div>
                            <p class="font-semibold" :class="activeSection === 'ads-management' ? 'text-white' : 'text-slate-800 dark:text-navy-100'">
                                Ads Management
                            </p>
                            <p class="text-xs" :class="activeSection === 'ads-management' ? 'text-white/80' : 'text-slate-500 dark:text-navy-400'">
                                AdSense & custom ads
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Podcast Settings -->
                <div @click="setActiveSection('podcasts')"
                     class="settings-nav-item cursor-pointer rounded-xl p-4 border border-slate-200 dark:border-navy-600"
                     :class="activeSection === 'podcasts' ? 'active' : 'bg-white dark:bg-navy-800 hover:bg-slate-50 dark:hover:bg-navy-700'">
                    <div class="flex items-center space-x-3">
                        <div class="flex size-10 items-center justify-center rounded-lg"
                             :class="activeSection === 'podcasts' ? 'bg-white/20' : 'bg-orange-100 dark:bg-orange-900/30'">
                            <svg class="size-5" :class="activeSection === 'podcasts' ? 'text-white' : 'text-orange-600 dark:text-orange-400'"
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                        </div>
                        <div>
                            <p class="font-semibold" :class="activeSection === 'podcasts' ? 'text-white' : 'text-slate-800 dark:text-navy-100'">
                                Podcast Settings
                            </p>
                            <p class="text-xs" :class="activeSection === 'podcasts' ? 'text-white/80' : 'text-slate-500 dark:text-navy-400'">
                                Podcast module config
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <!-- Main Content Area -->
    <div class="col-span-12 lg:col-span-9">
        <div class="settings-content-area">

            <!-- General Settings -->
            <div x-show="activeSection === 'general'" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 transform translate-y-4" x-transition:enter-end="opacity-100 transform translate-y-0">
                @include('backend.admin.settings.partials.general', ['generalSettings' => $generalSettings])
            </div>

            <!-- Frontend Design Settings -->
            <div x-show="activeSection === 'frontend'" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 transform translate-y-4" x-transition:enter-end="opacity-100 transform translate-y-0" x-data="{ frontendTab: 'desktop' }">
                <div class="card bg-white dark:bg-navy-800 rounded-xl shadow-lg p-6">
                    <div class="mb-6">
                        <h3 class="text-xl font-semibold text-slate-800 dark:text-navy-100">Frontend Design</h3>
                        <p class="text-sm text-slate-500 dark:text-navy-400 mt-1">Customize mobile and desktop layouts</p>
                    </div>

                    <!-- Desktop/Mobile Tabs -->
                    <div class="border-b border-slate-200 dark:border-navy-600 mb-6">
                        <nav class="flex space-x-8" aria-label="Frontend Tabs">
                            <button @click="frontendTab = 'desktop'" type="button"
                                    class="py-4 px-1 inline-flex items-center gap-2 border-b-2 font-medium text-sm whitespace-nowrap"
                                    :class="frontendTab === 'desktop' ? 'border-primary text-primary dark:border-accent dark:text-accent-light' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-navy-400 dark:hover:text-navy-100'">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                </svg>
                                Desktop Design
                            </button>
                            <button @click="frontendTab = 'mobile'" type="button"
                                    class="py-4 px-1 inline-flex items-center gap-2 border-b-2 font-medium text-sm whitespace-nowrap"
                                    :class="frontendTab === 'mobile' ? 'border-primary text-primary dark:border-accent dark:text-accent-light' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-navy-400 dark:hover:text-navy-100'">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                                </svg>
                                Mobile Design
                            </button>
                        </nav>
                    </div>

                    <!-- Desktop Settings Content -->
                    <div x-show="frontendTab === 'desktop'" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100">
                        @include('backend.admin.settings.partials.frontend-design.desktop-settings', ['frontendDesktopSettings' => $frontendDesktopSettings ?? []])
                    </div>

                    <!-- Mobile Settings Content -->
                    <div x-show="frontendTab === 'mobile'" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100">
                        @include('backend.admin.settings.partials.frontend-design.mobile-settings', ['frontendMobileSettings' => $frontendMobileSettings ?? []])
                    </div>
                </div>
            </div>

            <!-- User Management Settings -->
            <div x-show="activeSection === 'users'" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 transform translate-y-4" x-transition:enter-end="opacity-100 transform translate-y-0">
                @include('backend.admin.settings.partials.users', ['userSettings' => $userSettings ?? []])
            </div>

            <!-- Credit System Settings -->
            <div x-show="activeSection === 'credits'" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 transform translate-y-4" x-transition:enter-end="opacity-100 transform translate-y-0">
                @include('backend.admin.settings.partials.credits', ['creditSettings' => $creditSettings ?? []])
            </div>

            <!-- Payment Settings -->
            <div x-show="activeSection === 'payments'" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 transform translate-y-4" x-transition:enter-end="opacity-100 transform translate-y-0">
                @include('backend.admin.settings.partials.payments', ['paymentSettings' => $paymentSettings])
            </div>

            <!-- Notification Settings -->
            <div x-show="activeSection === 'notifications'" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 transform translate-y-4" x-transition:enter-end="opacity-100 transform translate-y-0">
                @include('backend.admin.settings.partials.notifications', ['notificationSettings' => $notificationSettings ?? []])
            </div>

            <!-- Mobile Verification Settings -->
            <div x-show="activeSection === 'mobile'" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 transform translate-y-4" x-transition:enter-end="opacity-100 transform translate-y-0">
                @include('backend.admin.settings.partials.mobile', [
                    'mobileSettings' => $mobileSettings ?? [],
                    'mobileStats' => $mobileStats ?? [],
                    'pendingUsers' => $pendingUsers ?? []
                ])
            </div>

            <!-- Security Settings -->
            <div x-show="activeSection === 'security'" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 transform translate-y-4" x-transition:enter-end="opacity-100 transform translate-y-0">
                @include('backend.admin.settings.partials.security', ['securitySettings' => $securitySettings])
            </div>

            <!-- Awards System Settings -->
            <div x-show="activeSection === 'awards'" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 transform translate-y-4" x-transition:enter-end="opacity-100 transform translate-y-0">
                @include('backend.admin.settings.partials.awards', ['awardsSettings' => $awardsSettings])
            </div>

            <!-- Events & Tickets Settings -->
            <div x-show="activeSection === 'events'" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 transform translate-y-4" x-transition:enter-end="opacity-100 transform translate-y-0">
                @include('backend.admin.settings.partials.events', ['eventsSettings' => $eventsSettings])
            </div>

            <!-- Artist Management Settings -->
            <div x-show="activeSection === 'artists'" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 transform translate-y-4" x-transition:enter-end="opacity-100 transform translate-y-0">
                @include('backend.admin.settings.partials.artists', ['artistSettings' => $artistSettings])
            </div>

            <!-- Storage Settings -->
            <div x-show="activeSection === 'storage'" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 transform translate-y-4" x-transition:enter-end="opacity-100 transform translate-y-0">
                @include('backend.admin.settings.partials.storage', ['settings' => $storageSettings, 'stats' => $storageStats])
            </div>

            <!-- Google Analytics Settings -->
            <div x-show="activeSection === 'google-analytics'" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 transform translate-y-4" x-transition:enter-end="opacity-100 transform translate-y-0">
                @include('backend.admin.settings.partials.google-analytics', ['googleAnalyticsSettings' => $googleAnalyticsSettings ?? []])
            </div>

            <!-- Ads Management Settings -->
            <div x-show="activeSection === 'ads-management'" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 transform translate-y-4" x-transition:enter-end="opacity-100 transform translate-y-0">
                @include('backend.admin.settings.partials.ads-management', ['adsSettings' => $adsSettings ?? [], 'customAds' => $customAds ?? []])
            </div>

            <!-- Podcast Settings -->
            <div x-show="activeSection === 'podcasts'" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 transform translate-y-4" x-transition:enter-end="opacity-100 transform translate-y-0">
                @include('backend.admin.settings.partials.podcasts', ['podcastSettings' => $podcastSettings ?? []])
            </div>

        </div>
    </div>

</div>
@endsection

@push('scripts')
<script>
function settingsManager() {
    return {
        activeSection: 'general',

        setActiveSection(section) {
            this.activeSection = section;
        },

        saveSettings(section) {
            // Get the form element
            const form = event.target;
            const formData = new FormData(form);
            
            // Convert FormData to object, handling checkboxes properly
            const data = {};
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                if (input.type === 'checkbox') {
                    data[input.name] = input.checked ? 1 : 0;
                } else if (input.type !== 'submit' && input.name) {
                    data[input.name] = formData.get(input.name);
                }
            });
            
            // Find submit button
            const button = form.querySelector('button[type="submit"]');
            const originalText = button.textContent;
            button.textContent = 'Saving...';
            button.disabled = true;

            // Log the data being sent (for debugging)
            console.log(`Saving ${section}:`, data);

            // Map section names to backend routes
            const routeMap = {
                'general': 'general',
                'users': 'users',
                'credits': 'credit-system',
                'payments': 'mobile-money',
                'notifications': 'notifications',
                'mobile': 'mobile-verification',
                'security': 'security',
                'awards': 'awards',
                'events': 'events',
                'artists': 'artists',
                'storage': 'storage',
                'google-analytics': 'google-analytics',
                'ads-management': 'ads'
            };

            const endpoint = `/admin/settings/${routeMap[section] || section}`;

            fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        console.error('Response not OK:', response.status, text);
                        throw new Error(`HTTP error! status: ${response.status}`);
                    });
                }
                return response.json();
            })
            .then(result => {
                button.textContent = originalText;
                button.disabled = false;

                if (result.success) {
                    this.showNotification(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully!`, 'success');
                } else {
                    this.showNotification(result.message || 'Error saving settings', 'error');
                }
            })
            .catch(error => {
                console.error('Error saving settings:', error);
                button.textContent = originalText;
                button.disabled = false;
                this.showNotification('Error saving settings. Please try again.', 'error');
            });
        },

        saveTabSettings(section, tab) {
            // Get form data from the specific tab form
            const form = event.target;
            const formData = new FormData(form);
            
            // Check if form has file inputs with files selected
            const fileInputs = form.querySelectorAll('input[type="file"]');
            let hasFiles = false;
            fileInputs.forEach(input => {
                if (input.files && input.files.length > 0) {
                    hasFiles = true;
                }
            });

            const button = form.querySelector('button[type="submit"]');
            const originalText = button.textContent;

            button.textContent = 'Saving...';
            button.disabled = true;

            // API call to the correct endpoint
            const endpoint = `/admin/settings/${section}`;
            
            // Add tab to formData
            formData.append('tab', tab);
            
            // Handle checkboxes - ensure unchecked ones are sent as 0
            const inputs = form.querySelectorAll('input[type="checkbox"]');
            inputs.forEach(input => {
                if (!input.checked) {
                    formData.set(input.name, '0');
                }
            });

            // Log the data being sent (for debugging)
            console.log(`Saving ${section} - ${tab}:`, Object.fromEntries(formData));

            // If has files, use FormData, otherwise use JSON
            let fetchOptions;
            if (hasFiles) {
                fetchOptions = {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                        'Accept': 'application/json'
                    },
                    body: formData
                };
            } else {
                // Convert FormData to object for JSON
                const data = {};
                for (let [key, value] of formData.entries()) {
                    data[key] = value;
                }
                fetchOptions = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(data)
                };
            }

            fetch(endpoint, fetchOptions)
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        console.error('Response not OK:', response.status, text);
                        throw new Error(`HTTP error! status: ${response.status}`);
                    });
                }
                return response.json();
            })
            .then(result => {
                button.textContent = originalText;
                button.disabled = false;

                if (result.success) {
                    this.showNotification(`${tab.charAt(0).toUpperCase() + tab.slice(1)} settings saved successfully!`);
                } else {
                    this.showNotification(result.message || 'Error saving settings', 'error');
                }
            })
            .catch(error => {
                console.error('Error saving settings:', error);
                button.textContent = originalText;
                button.disabled = false;
                this.showNotification('Error saving settings. Please try again.', 'error');
            });
        },

        showNotification(message, type = 'success') {
            // Create notification element
            const notification = document.createElement('div');
            notification.className = `fixed top-4 right-4 max-w-sm p-4 rounded-lg shadow-lg transition-all duration-300 transform ${
                type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`;
            notification.style.zIndex = '9999';
            notification.style.transform = 'translateX(400px)';
            notification.innerHTML = `
                <div class="flex items-center space-x-2">
                    <svg class="size-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                    </svg>
                    <span>${message}</span>
                </div>
            `;

            document.body.appendChild(notification);

            // Animate in
            setTimeout(() => {
                notification.style.transform = 'translateX(0)';
            }, 100);

            // Remove after 3 seconds
            setTimeout(() => {
                notification.style.transform = 'translateX(400px)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        },

        searchUsers() {
            if (this.search.length < 2) {
                this.results = [];
                return;
            }

            // Simulate API call - replace with actual endpoint
            this.results = [
                {
                    id: 1,
                    name: 'John Doe',
                    email: 'john@example.com',
                    phone_number: '+256 700 123456',
                    is_phone_verified: false
                },
                {
                    id: 2,
                    name: 'Jane Smith',
                    email: 'jane@example.com',
                    phone_number: '+256 701 654321',
                    is_phone_verified: true
                }
            ].filter(user =>
                user.name.toLowerCase().includes(this.search.toLowerCase()) ||
                user.email.toLowerCase().includes(this.search.toLowerCase()) ||
                (user.phone_number && user.phone_number.includes(this.search))
            );
        }
    }
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
