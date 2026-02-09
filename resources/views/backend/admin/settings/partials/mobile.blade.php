{{-- Mobile Verification Settings --}}
<div x-show="activeSection === 'mobile'" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 transform translate-y-4" x-transition:enter-end="opacity-100 transform translate-y-0">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="settings-card p-4">
            <div class="flex items-center">
                <div class="flex size-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <svg class="size-5 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
                <div class="ml-3">
                    <p class="text-sm font-medium text-slate-600 dark:text-navy-300">Total Users</p>
                    <p class="text-xl font-bold text-slate-800 dark:text-navy-100">{{ number_format($mobileStats['total_users'] ?? 0) }}</p>
                </div>
            </div>
        </div>

        <div class="settings-card p-4">
            <div class="flex items-center">
                <div class="flex size-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                    <svg class="size-5 text-green-600 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div class="ml-3">
                    <p class="text-sm font-medium text-slate-600 dark:text-navy-300">Verified</p>
                    <p class="text-xl font-bold text-slate-800 dark:text-navy-100">{{ number_format($mobileStats['verified_users'] ?? 0) }}</p>
                </div>
            </div>
        </div>

        <div class="settings-card p-4">
            <div class="flex items-center">
                <div class="flex size-10 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                    <svg class="size-5 text-yellow-600 dark:text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div class="ml-3">
                    <p class="text-sm font-medium text-slate-600 dark:text-navy-300">Pending</p>
                    <p class="text-xl font-bold text-slate-800 dark:text-navy-100">{{ number_format($mobileStats['pending_verification'] ?? 0) }}</p>
                </div>
            </div>
        </div>

        <div class="settings-card p-4">
            <div class="flex items-center">
                <div class="flex size-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <svg class="size-5 text-purple-600 dark:text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <div class="ml-3">
                    <p class="text-sm font-medium text-slate-600 dark:text-navy-300">Rate</p>
                    <p class="text-xl font-bold text-slate-800 dark:text-navy-100">{{ $mobileStats['verification_rate'] ?? 0 }}%</p>
                </div>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Settings Panel -->
        <div class="lg:col-span-1">
            <div class="settings-card">
                <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-100 mb-4">Verification Settings</h3>

                <form @submit.prevent="saveSettings('mobile')">
                    <div class="space-y-4">
                        <label class="flex items-center space-x-3">
                            <input type="checkbox" name="phone_verification_enabled" value="1" class="form-checkbox" {{ ($mobileSettings['phone_verification_enabled'] ?? true) ? 'checked' : '' }}>
                            <span class="text-sm text-slate-600 dark:text-navy-300">Enable Mobile Verification</span>
                        </label>
                        <p class="text-xs text-slate-500 dark:text-navy-400 ml-6">Allow users to verify their mobile numbers</p>

                        <label class="flex items-center space-x-3">
                            <input type="checkbox" name="verification_required_for_tickets" value="1" class="form-checkbox" {{ ($mobileSettings['verification_required_for_tickets'] ?? true) ? 'checked' : '' }}>
                            <span class="text-sm text-slate-600 dark:text-navy-300">Required for Event Tickets</span>
                        </label>
                        <p class="text-xs text-slate-500 dark:text-navy-400 ml-6">Require verification to purchase event tickets</p>

                        <label class="flex items-center space-x-3">
                            <input type="checkbox" name="verification_required_for_artists" value="1" class="form-checkbox" {{ ($mobileSettings['verification_required_for_artists'] ?? false) ? 'checked' : '' }}>
                            <span class="text-sm text-slate-600 dark:text-navy-300">Required for Artists</span>
                        </label>
                        <p class="text-xs text-slate-500 dark:text-navy-400 ml-6">Require verification for artist registration</p>

                        <div>
                            <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">SMS Provider</label>
                            <select name="sms_provider" class="form-select w-full">
                                <option value="local" {{ ($mobileSettings['sms_provider'] ?? 'africastalking') === 'local' ? 'selected' : '' }}>Local (Log Only)</option>
                                <option value="twilio" {{ ($mobileSettings['sms_provider'] ?? 'africastalking') === 'twilio' ? 'selected' : '' }}>Twilio</option>
                                <option value="africastalking" {{ ($mobileSettings['sms_provider'] ?? 'africastalking') === 'africastalking' ? 'selected' : '' }}>Africa's Talking</option>
                            </select>
                        </div>
                    </div>

                    <div class="mt-6">
                        <button type="submit" class="btn bg-primary text-white w-full">
                            Save Settings
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- User Search & Management -->
        <div class="lg:col-span-2">
            <div class="settings-card">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-100">User Verification Management</h3>
                    <div class="relative" x-data="{ search: '', results: [] }">
                        <input type="text"
                               x-model="search"
                               @input.debounce.300ms="searchUsers()"
                               placeholder="Search users..."
                               class="form-input w-64 pl-10">
                        <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>

                        <!-- Search Results Dropdown -->
                        <div x-show="results.length > 0"
                             x-transition:enter="transition ease-out duration-200"
                             x-transition:enter-start="opacity-0 transform scale-95"
                             x-transition:enter-end="opacity-100 transform scale-100"
                             class="absolute z-50 w-full mt-1 bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-600 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                            <template x-for="user in results" :key="user.id">
                                <div class="p-3 hover:bg-slate-50 dark:hover:bg-navy-700 border-b border-slate-100 dark:border-navy-600 last:border-b-0">
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <p class="font-medium text-slate-800 dark:text-navy-100" x-text="user.name"></p>
                                            <p class="text-sm text-slate-500 dark:text-navy-400" x-text="user.email"></p>
                                            <p class="text-xs text-slate-400 dark:text-navy-500" x-text="user.phone_number || 'No phone number'"></p>
                                        </div>
                                        <div class="text-right">
                                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                                  :class="user.is_phone_verified ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'"
                                                  x-text="user.is_phone_verified ? 'Verified' : 'Pending'"></span>
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>

                <!-- Pending Verification Users Table -->
                <div class="overflow-hidden">
                    <h4 class="text-md font-medium text-slate-700 dark:text-navy-200 mb-3">Pending Verification (20 most recent)</h4>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-slate-200 dark:divide-navy-600">
                            <thead class="bg-slate-50 dark:bg-navy-800">
                                <tr>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-navy-300 uppercase tracking-wider">User</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-navy-300 uppercase tracking-wider">Phone</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-navy-300 uppercase tracking-wider">Role</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-navy-300 uppercase tracking-wider">Joined</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-navy-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white dark:bg-navy-900 divide-y divide-slate-200 dark:divide-navy-600">
                                @forelse ($pendingUsers ?? [] as $user)
                                    <tr>
                                        <td class="px-4 py-3 whitespace-nowrap">
                                            <div class="flex items-center">
                                                <div class="flex-shrink-0 h-8 w-8">
                                                    <div class="h-8 w-8 rounded-full bg-slate-200 dark:bg-navy-600 flex items-center justify-center">
                                                        <span class="text-xs font-medium text-slate-600 dark:text-navy-300">{{ strtoupper(substr($user->name, 0, 2)) }}</span>
                                                    </div>
                                                </div>
                                                <div class="ml-3">
                                                    <p class="text-sm font-medium text-slate-800 dark:text-navy-100">{{ $user->name }}</p>
                                                    <p class="text-sm text-slate-500 dark:text-navy-400">{{ $user->email }}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-navy-300">{{ $user->phone_number ?? 'N/A' }}</td>
                                        <td class="px-4 py-3 whitespace-nowrap">
                                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">{{ ucfirst($user->role ?? 'user') }}</span>
                                        </td>
                                        <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-500 dark:text-navy-400">{{ $user->created_at->diffForHumans() }}</td>
                                        <td class="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button class="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300">Verify</button>
                                            <button class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Send Code</button>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="5" class="px-4 py-8 text-center text-slate-500 dark:text-navy-400">
                                            No users pending verification
                                        </td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
