@extends('layouts.admin')

@section('title', 'Forum Settings')

@section('page-header')
<div class="flex items-center justify-between">
    <div>
        <h2 class="text-2xl font-bold text-slate-800 dark:text-navy-50">
            Forum & Polls Settings
        </h2>
        <p class="text-xs+ text-slate-400 dark:text-navy-300">
            Configure forum and polls module settings
        </p>
    </div>
    <div class="flex space-x-2">
        <a href="{{ route('admin.modules.forum.dashboard') }}"
           class="btn bg-slate-150 font-medium text-slate-800 hover:bg-slate-200 focus:bg-slate-200 active:bg-slate-200/80 dark:bg-navy-500 dark:text-navy-50 dark:hover:bg-navy-450 dark:focus:bg-navy-450 dark:active:bg-navy-450/90">
            <svg class="size-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
        </a>
    </div>
</div>
@endsection

@section('content')
<form method="POST" action="{{ route('admin.modules.forum.settings.update') }}">
    @csrf

    <div class="grid grid-cols-1 gap-4 sm:gap-5 lg:gap-6">
        <!-- Forum Settings -->
        <div class="card">
            <div class="border-b border-slate-200 p-4 dark:border-navy-500">
                <h3 class="text-lg font-medium text-slate-700 dark:text-navy-100">
                    Forum Settings
                </h3>
            </div>
            <div class="p-4 sm:p-5">
                <div class="space-y-4">
                    <!-- Module Enabled -->
                    <div class="flex items-center justify-between">
                        <div>
                            <label class="text-base font-medium text-slate-700 dark:text-navy-100">
                                Enable Forum Module
                            </label>
                            <p class="text-xs text-slate-400 dark:text-navy-300">
                                Allow users to create and participate in forum discussions
                            </p>
                        </div>
                        <label class="inline-flex items-center">
                            <input type="checkbox"
                                   name="forum_enabled"
                                   value="1"
                                   {{ ($forumSettings->is_enabled ?? false) ? 'checked' : '' }}
                                   class="form-checkbox is-basic size-5 rounded border-slate-400/70 checked:bg-primary checked:border-primary hover:border-primary focus:border-primary dark:border-navy-400">
                        </label>
                    </div>

                    <!-- Guest Viewing -->
                    <div class="flex items-center justify-between">
                        <div>
                            <label class="text-base font-medium text-slate-700 dark:text-navy-100">
                                Allow Guest Viewing
                            </label>
                            <p class="text-xs text-slate-400 dark:text-navy-300">
                                Let non-registered users view forum topics
                            </p>
                        </div>
                        <label class="inline-flex items-center">
                            <input type="checkbox"
                                   name="allow_guest_viewing"
                                   value="1"
                                   {{ ($forumSettings->settings['allow_guest_viewing'] ?? true) ? 'checked' : '' }}
                                   class="form-checkbox is-basic size-5 rounded border-slate-400/70 checked:bg-primary checked:border-primary hover:border-primary focus:border-primary dark:border-navy-400">
                        </label>
                    </div>

                    <!-- Require Approval -->
                    <div class="flex items-center justify-between">
                        <div>
                            <label class="text-base font-medium text-slate-700 dark:text-navy-100">
                                Require Topic Approval
                            </label>
                            <p class="text-xs text-slate-400 dark:text-navy-300">
                                New topics must be approved by moderators
                            </p>
                        </div>
                        <label class="inline-flex items-center">
                            <input type="checkbox"
                                   name="require_approval"
                                   value="1"
                                   {{ ($forumSettings->settings['require_approval'] ?? false) ? 'checked' : '' }}
                                   class="form-checkbox is-basic size-5 rounded border-slate-400/70 checked:bg-primary checked:border-primary hover:border-primary focus:border-primary dark:border-navy-400">
                        </label>
                    </div>

                    <!-- Min Reputation -->
                    <div>
                        <label class="block">
                            <span class="text-base font-medium text-slate-700 dark:text-navy-100">Minimum Reputation to Post</span>
                            <span class="text-xs text-slate-400 dark:text-navy-300">Set to 0 to allow all users</span>
                        </label>
                        <input type="number"
                               name="min_reputation_to_post"
                               value="{{ $forumSettings->settings['min_reputation_to_post'] ?? 0 }}"
                               min="0"
                               class="form-input mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent">
                    </div>
                </div>
            </div>
        </div>

        <!-- Polls Settings -->
        <div class="card">
            <div class="border-b border-slate-200 p-4 dark:border-navy-500">
                <h3 class="text-lg font-medium text-slate-700 dark:text-navy-100">
                    Polls Settings
                </h3>
            </div>
            <div class="p-4 sm:p-5">
                <div class="space-y-4">
                    <!-- Polls Enabled -->
                    <div class="flex items-center justify-between">
                        <div>
                            <label class="text-base font-medium text-slate-700 dark:text-navy-100">
                                Enable Polls Module
                            </label>
                            <p class="text-xs text-slate-400 dark:text-navy-300">
                                Allow users to create and vote in polls
                            </p>
                        </div>
                        <label class="inline-flex items-center">
                            <input type="checkbox"
                                   name="polls_enabled"
                                   value="1"
                                   {{ ($pollsSettings->is_enabled ?? false) ? 'checked' : '' }}
                                   class="form-checkbox is-basic size-5 rounded border-slate-400/70 checked:bg-primary checked:border-primary hover:border-primary focus:border-primary dark:border-navy-400">
                        </label>
                    </div>

                    <!-- Max Polls Per Day -->
                    <div>
                        <label class="block">
                            <span class="text-base font-medium text-slate-700 dark:text-navy-100">Max Polls Per Day</span>
                            <span class="text-xs text-slate-400 dark:text-navy-300">Limit polls per user per day (0 = unlimited)</span>
                        </label>
                        <input type="number"
                               name="max_polls_per_day"
                               value="{{ $pollsSettings->settings['max_polls_per_day'] ?? 5 }}"
                               min="0"
                               class="form-input mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent">
                    </div>

                    <!-- Auto Close -->
                    <div>
                        <label class="block">
                            <span class="text-base font-medium text-slate-700 dark:text-navy-100">Auto-Close Polls After (Days)</span>
                            <span class="text-xs text-slate-400 dark:text-navy-300">Automatically close polls after X days (0 = never)</span>
                        </label>
                        <input type="number"
                               name="auto_close_polls_days"
                               value="{{ $pollsSettings->settings['auto_close_polls_days'] ?? 30 }}"
                               min="0"
                               class="form-input mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent">
                    </div>
                </div>
            </div>
        </div>

        <!-- Save Button -->
        <div class="flex justify-end">
            <button type="submit"
                    class="btn bg-primary font-medium text-white hover:bg-primary-focus focus:bg-primary-focus active:bg-primary-focus/90">
                Save All Settings
            </button>
        </div>
    </div>
</form>

    <!-- Statistics -->
    <div class="card">
        <div class="border-b border-slate-200 p-4 dark:border-navy-500">
            <h3 class="text-lg font-medium text-slate-700 dark:text-navy-100">
                Forum Statistics
            </h3>
        </div>
        <div class="p-4 sm:p-5">
            <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                    <p class="text-xs+ text-slate-400 dark:text-navy-300">Total Topics</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">
                        {{ $stats['total_topics'] ?? 0 }}
                    </p>
                </div>
                <div>
                    <p class="text-xs+ text-slate-400 dark:text-navy-300">Total Replies</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">
                        {{ $stats['total_replies'] ?? 0 }}
                    </p>
                </div>
                <div>
                    <p class="text-xs+ text-slate-400 dark:text-navy-300">Total Polls</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">
                        {{ $stats['total_polls'] ?? 0 }}
                    </p>
                </div>
                <div>
                    <p class="text-xs+ text-slate-400 dark:text-navy-300">Pending Topics</p>
                    <p class="text-2xl font-semibold text-warning">
                        {{ $stats['pending_topics'] ?? 0 }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
