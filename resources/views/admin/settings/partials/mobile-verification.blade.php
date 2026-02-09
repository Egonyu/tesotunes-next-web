<!-- Mobile Verification Stats Cards -->
<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <div class="bg-white rounded-lg p-6 shadow">
        <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
            </div>
            <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Users</p>
                <p class="text-2xl font-bold text-gray-900">{{ number_format(\App\Models\User::count()) }}</p>
            </div>
        </div>
    </div>

    <div class="bg-white rounded-lg p-6 shadow">
        <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>
            <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Verified</p>
                <p class="text-2xl font-bold text-gray-900">{{ number_format(\App\Models\User::whereNotNull('phone_verified_at')->count()) }}</p>
            </div>
        </div>
    </div>

    <div class="bg-white rounded-lg p-6 shadow">
        <div class="flex items-center">
            <div class="p-2 bg-yellow-100 rounded-lg">
                <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>
            <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Pending</p>
                <p class="text-2xl font-bold text-gray-900">{{ number_format(\App\Models\User::whereNotNull('phone_number')->whereNull('phone_verified_at')->count()) }}</p>
            </div>
        </div>
    </div>

    <div class="bg-white rounded-lg p-6 shadow">
        <div class="flex items-center">
            <div class="p-2 bg-purple-100 rounded-lg">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
            </div>
            <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Verification Rate</p>
                @php
                    $totalUsers = \App\Models\User::count();
                    $verifiedUsers = \App\Models\User::whereNotNull('phone_verified_at')->count();
                    $rate = $totalUsers > 0 ? round(($verifiedUsers / $totalUsers) * 100, 1) : 0;
                @endphp
                <p class="text-2xl font-bold text-gray-900">{{ $rate }}%</p>
            </div>
        </div>
    </div>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <!-- Settings Panel -->
    <div class="lg:col-span-1">
        <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Verification Settings</h2>

            <form method="POST" action="{{ route('admin.settings.mobile-verification.update') }}">
                @csrf

                <div class="space-y-4">
                    <div>
                        <label class="flex items-center">
                            <input type="checkbox"
                                   name="mobile_verification_enabled"
                                   value="1"
                                   {{ \App\Models\Setting::isMobileVerificationEnabled() ? 'checked' : '' }}
                                   class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                            <span class="ml-2 text-sm text-gray-700">Enable Mobile Verification</span>
                        </label>
                        <p class="text-xs text-gray-500 mt-1">Allow users to verify their mobile numbers</p>
                    </div>

                    <div>
                        <label class="flex items-center">
                            <input type="checkbox"
                                   name="mobile_verification_required_for_events"
                                   value="1"
                                   {{ \App\Models\Setting::isMobileVerificationRequiredForEvents() ? 'checked' : '' }}
                                   class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                            <span class="ml-2 text-sm text-gray-700">Required for Event Tickets</span>
                        </label>
                        <p class="text-xs text-gray-500 mt-1">Require verification to purchase event tickets</p>
                    </div>

                    <div>
                        <label class="flex items-center">
                            <input type="checkbox"
                                   name="mobile_verification_required_for_artists"
                                   value="1"
                                   {{ \App\Models\Setting::isMobileVerificationRequiredForArtists() ? 'checked' : '' }}
                                   class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                            <span class="ml-2 text-sm text-gray-700">Required for Artists</span>
                        </label>
                        <p class="text-xs text-gray-500 mt-1">Require verification for artist registration</p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">SMS Provider</label>
                        <select name="mobile_verification_sms_provider"
                                class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                            <option value="local" {{ \App\Models\Setting::getSmsProvider() === 'local' ? 'selected' : '' }}>Local (Log Only)</option>
                            <option value="twilio" {{ \App\Models\Setting::getSmsProvider() === 'twilio' ? 'selected' : '' }}>Twilio</option>
                            <option value="africastalking" {{ \App\Models\Setting::getSmsProvider() === 'africastalking' ? 'selected' : '' }}>Africa's Talking</option>
                        </select>
                    </div>
                </div>

                <div class="mt-6">
                    <button type="submit"
                            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Save Settings
                    </button>
                </div>
            </form>
        </div>

        <!-- User Search -->
        <div class="bg-white rounded-lg shadow p-6 mt-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Search Users</h3>
            <div class="relative">
                <input type="text" id="user-search" placeholder="Search by name, email, or phone..."
                       class="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
            </div>
            <div id="search-results" class="mt-4 hidden">
                <!-- Search results will be populated here -->
            </div>
        </div>
    </div>

    <!-- Main Content -->
    <div class="lg:col-span-2 space-y-6">
        <!-- Recent Verifications -->
        <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-lg font-medium text-gray-900">Recent Verifications</h2>
            </div>
            <div class="divide-y divide-gray-200">
                @php
                    $recentVerifications = \App\Models\User::whereNotNull('phone_verified_at')
                        ->orderBy('phone_verified_at', 'desc')
                        ->limit(10)
                        ->get();
                @endphp
                @forelse($recentVerifications as $user)
                    <div class="px-6 py-4 flex items-center justify-between">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                    </svg>
                                </div>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm font-medium text-gray-900">{{ $user->name }}</p>
                                <p class="text-sm text-gray-500">{{ $user->phone_number }} • {{ $user->role }}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="text-sm text-gray-900">{{ $user->phone_verified_at->format('M j, Y') }}</p>
                            <p class="text-sm text-gray-500">{{ $user->phone_verified_at->format('g:i A') }}</p>
                        </div>
                    </div>
                @empty
                    <div class="px-6 py-4 text-center text-gray-500">
                        <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                        </svg>
                        <p>No recent verifications</p>
                    </div>
                @endforelse
            </div>
        </div>

        <!-- Pending Verifications -->
        <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-lg font-medium text-gray-900">Users Pending Verification</h2>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        @php
                            $pendingUsers = \App\Models\User::whereNotNull('phone_number')
                                ->whereNull('phone_verified_at')
                                ->orderBy('created_at', 'desc')
                                ->limit(20)
                                ->get();
                        @endphp
                        @forelse($pendingUsers as $user)
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="flex items-center">
                                        <div class="flex-shrink-0 h-10 w-10">
                                            <div class="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                                                <span class="text-sm font-medium text-gray-700">
                                                    {{ substr($user->name, 0, 1) }}
                                                </span>
                                            </div>
                                        </div>
                                        <div class="ml-4">
                                            <div class="text-sm font-medium text-gray-900">{{ $user->name }}</div>
                                            <div class="text-sm text-gray-500">{{ $user->email }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {{ $user->phone_number ?: 'Not provided' }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                        {{ $user->role === 'artist' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800' }}">
                                        {{ ucfirst($user->role) }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {{ $user->created_at->format('M j, Y') }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div class="flex justify-end space-x-2">
                                        @if($user->phone_number)
                                            <form method="POST" action="{{ route('admin.settings.mobile-verification.send-verification-code', $user) }}" class="inline">
                                                @csrf
                                                <button type="submit"
                                                        class="text-blue-600 hover:text-blue-900"
                                                        onclick="return confirm('Send verification code to {{ $user->phone_number }}?')">
                                                    Send Code
                                                </button>
                                            </form>
                                            <form method="POST" action="{{ route('admin.settings.mobile-verification.verify-user', $user) }}" class="inline">
                                                @csrf
                                                <input type="hidden" name="action" value="verify">
                                                <button type="submit"
                                                        class="text-green-600 hover:text-green-900"
                                                        onclick="return confirm('Manually verify {{ $user->name }}?')">
                                                    Verify
                                                </button>
                                            </form>
                                        @else
                                            <span class="text-gray-400">No phone number</span>
                                        @endif
                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="5" class="px-6 py-4 text-center text-gray-500">
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

<script>
let searchTimeout;

// Mobile verification search functionality
const searchInput = document.getElementById('user-search');
const searchResults = document.getElementById('search-results');

if (searchInput) {
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const query = this.value.trim();

        if (query.length >= 2) {
            searchTimeout = setTimeout(() => {
                performSearch(query);
            }, 300);
        } else {
            hideSearchResults();
        }
    });
}

function performSearch(query) {
    fetch(`{{ route('admin.settings.mobile-verification.search-users') }}?q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.users.length > 0) {
                displaySearchResults(data.users);
            } else {
                displayNoResults();
            }
        })
        .catch(error => {
            console.error('Search error:', error);
            hideSearchResults();
        });
}

function displaySearchResults(users) {
    let html = '<div class="border border-gray-200 rounded-md divide-y divide-gray-200">';

    users.forEach(user => {
        const verificationStatus = user.is_phone_verified
            ? '<span class="text-green-600 text-xs">✓ Verified</span>'
            : '<span class="text-yellow-600 text-xs">⏳ Pending</span>';

        html += `
            <div class="p-3 hover:bg-gray-50">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-gray-900">${user.name}</p>
                        <p class="text-xs text-gray-500">${user.email}</p>
                        <p class="text-xs text-gray-500">${user.phone_number || 'No phone'} • ${user.role}</p>
                    </div>
                    <div class="text-right">
                        ${verificationStatus}
                        <div class="mt-1">
                            ${user.phone_number && !user.is_phone_verified ? `
                                <button onclick="sendVerificationCode(${user.id})"
                                        class="text-xs text-blue-600 hover:text-blue-900 mr-2">
                                    Send Code
                                </button>
                                <button onclick="manualVerify(${user.id})"
                                        class="text-xs text-green-600 hover:text-green-900">
                                    Verify
                                </button>
                            ` : ''}
                            ${user.is_phone_verified ? `
                                <button onclick="removeVerification(${user.id})"
                                        class="text-xs text-red-600 hover:text-red-900">
                                    Remove
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    searchResults.innerHTML = html;
    searchResults.classList.remove('hidden');
}

function displayNoResults() {
    searchResults.innerHTML = `
        <div class="border border-gray-200 rounded-md p-4 text-center text-gray-500">
            <p class="text-sm">No users found matching your search</p>
        </div>
    `;
    searchResults.classList.remove('hidden');
}

function hideSearchResults() {
    if (searchResults) {
        searchResults.classList.add('hidden');
    }
}

// Global functions for buttons
window.sendVerificationCode = function(userId) {
    if (confirm('Send verification code to this user?')) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/admin/settings/mobile-verification/users/${userId}/send-code`;
        form.innerHTML = '@csrf';
        document.body.appendChild(form);
        form.submit();
    }
};

window.manualVerify = function(userId) {
    if (confirm('Manually verify this user\'s phone number?')) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/admin/settings/mobile-verification/users/${userId}/verify`;
        form.innerHTML = '@csrf<input type="hidden" name="action" value="verify">';
        document.body.appendChild(form);
        form.submit();
    }
};

window.removeVerification = function(userId) {
    if (confirm('Remove verification for this user?')) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/admin/settings/mobile-verification/users/${userId}/verify`;
        form.innerHTML = '@csrf<input type="hidden" name="action" value="unverify">';
        document.body.appendChild(form);
        form.submit();
    }
};
</script>