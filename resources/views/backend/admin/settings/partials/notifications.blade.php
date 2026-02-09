{{-- Notification Settings --}}
<div x-show="activeSection === 'notifications'" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 transform translate-y-4" x-transition:enter-end="opacity-100 transform translate-y-0">
    <div class="settings-card">
        <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-100 mb-4">Notification Settings</h3>

        <form @submit.prevent="saveSettings('notifications')">
            <div class="form-section">
                <h4 class="text-md font-medium text-slate-700 dark:text-navy-200 mb-3">Email Notifications</h4>
                <div class="space-y-4">
                    <label class="flex items-center space-x-3">
                        <input type="checkbox" name="notify_new_registrations" value="1" class="form-checkbox" {{ ($notificationSettings['notify_new_registrations'] ?? true) ? 'checked' : '' }}>
                        <span class="text-sm text-slate-600 dark:text-navy-300">New user registrations</span>
                    </label>
                    <label class="flex items-center space-x-3">
                        <input type="checkbox" name="notify_new_uploads" value="1" class="form-checkbox" {{ ($notificationSettings['notify_new_uploads'] ?? true) ? 'checked' : '' }}>
                        <span class="text-sm text-slate-600 dark:text-navy-300">New song uploads</span>
                    </label>
                    <label class="flex items-center space-x-3">
                        <input type="checkbox" name="notify_payout_requests" value="1" class="form-checkbox" {{ ($notificationSettings['notify_payout_requests'] ?? true) ? 'checked' : '' }}>
                        <span class="text-sm text-slate-600 dark:text-navy-300">Payout requests</span>
                    </label>
                    <label class="flex items-center space-x-3">
                        <input type="checkbox" name="notify_content_reports" value="1" class="form-checkbox" {{ ($notificationSettings['notify_content_reports'] ?? false) ? 'checked' : '' }}>
                        <span class="text-sm text-slate-600 dark:text-navy-300">Content reports</span>
                    </label>
                </div>
            </div>

            <div class="form-section">
                <h4 class="text-md font-medium text-slate-700 dark:text-navy-200 mb-3">SMTP Configuration</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">SMTP Host</label>
                        <input type="text" name="smtp_host" class="form-input w-full" value="{{ $notificationSettings['smtp_host'] ?? '' }}" placeholder="smtp.gmail.com">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">SMTP Port</label>
                        <input type="number" name="smtp_port" class="form-input w-full" value="{{ $notificationSettings['smtp_port'] ?? 587 }}" placeholder="SMTP Port">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">SMTP Username</label>
                        <input type="email" name="smtp_username" class="form-input w-full" value="{{ $notificationSettings['smtp_username'] ?? '' }}" placeholder="your-email@gmail.com">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">SMTP Password</label>
                        <input type="password" name="smtp_password" class="form-input w-full" value="{{ $notificationSettings['smtp_password'] ?? '' }}" placeholder="App Password">
                    </div>
                </div>
            </div>

            <div class="flex justify-end">
                <button type="submit" class="btn bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90">
                    Save Changes
                </button>
            </div>
        </form>
    </div>
</div>
