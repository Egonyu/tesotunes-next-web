@extends('layouts.admin')

@section('title', 'Enroll User - SACCO Management')

@section('content')
<div class="dashboard-content">
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-6">
        <div>
            <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">Enroll User</h1>
            <p class="text-slate-600 dark:text-navy-300 mt-1">Add a new member to the SACCO</p>
        </div>
        <div class="flex items-center gap-3">
            <a href="{{ route('admin.sacco.dashboard') }}" class="btn btn-secondary">
                <svg class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
            </a>
        </div>
    </div>

    <!-- Enrollment Form -->
    <div class="max-w-6xl mx-auto">
        <div class="card p-6">
            <div class="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-navy-600">
                <div class="p-3 bg-blue-500/10 text-blue-500 rounded-lg">
                    <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                </div>
                <div>
                    <h2 class="text-xl font-semibold text-slate-800 dark:text-navy-50">Member Enrollment</h2>
                    <p class="text-slate-600 dark:text-navy-300">Select a user and configure their SACCO membership</p>
                </div>
            </div>

            <form action="{{ route('admin.sacco.members.enroll.store') }}" method="POST">
                @csrf

                @if($eligibleUsers->isEmpty())
                    <!-- No Users Available -->
                    <div class="text-center py-12">
                        <div class="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 inline-block">
                            <svg class="size-12 text-yellow-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <h3 class="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">No Eligible Users</h3>
                            <p class="text-yellow-700 dark:text-yellow-300 mb-4">All active users are already SACCO members.</p>
                            <a href="{{ route('admin.sacco.members.index') }}" class="btn btn-primary">
                                View Existing Members
                            </a>
                        </div>
                    </div>
                @else
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <!-- User Selection Section -->
                        <div class="space-y-6">
                            <div class="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-navy-600">
                                <div class="p-2 bg-green-500/10 text-green-500 rounded-lg">
                                    <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <h3 class="text-lg font-medium text-slate-800 dark:text-navy-50">User Selection</h3>
                            </div>

                            <!-- User Dropdown -->
                            <div>
                                <label for="user_id" class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">
                                    Select User <span class="text-red-500">*</span>
                                </label>
                                <select name="user_id" id="user_id" required
                                    class="form-select w-full @error('user_id') border-red-500 @enderror">
                                    <option value="">Choose a user to enroll...</option>
                                    @foreach($eligibleUsers as $user)
                                        <option value="{{ $user->id }}" {{ old('user_id') == $user->id ? 'selected' : '' }}>
                                            {{ $user->display_name ?? $user->username }} ({{ $user->email }})
                                        </option>
                                    @endforeach
                                </select>
                                @error('user_id')
                                    <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                                @enderror
                                <p class="text-xs text-slate-500 dark:text-navy-400 mt-1">
                                    {{ $eligibleUsers->count() }} eligible user(s) available for enrollment
                                </p>
                            </div>

                            <!-- Membership Type -->
                            <div>
                                <label for="membership_type" class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">
                                    Membership Type <span class="text-red-500">*</span>
                                </label>
                                <select name="membership_type" id="membership_type" required class="form-select w-full">
                                    <option value="regular" {{ old('membership_type') == 'regular' ? 'selected' : '' }}>
                                        Regular Member - Standard benefits
                                    </option>
                                    <option value="associate" {{ old('membership_type') == 'associate' ? 'selected' : '' }}>
                                        Associate Member - Limited benefits
                                    </option>
                                    <option value="premium" {{ old('membership_type') == 'premium' ? 'selected' : '' }}>
                                        Premium Member - Enhanced benefits
                                    </option>
                                </select>
                                @error('membership_type')
                                    <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                                @enderror
                            </div>

                            <!-- Auto Approve -->
                            <div class="p-4 bg-slate-50 dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-600">
                                <label class="flex items-center cursor-pointer">
                                    <input type="hidden" name="auto_approve" value="0">
                                    <input type="checkbox" name="auto_approve" value="1"
                                        {{ old('auto_approve') ? 'checked' : '' }}
                                        class="h-5 w-5 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50">
                                    <span class="ml-3 text-sm font-medium text-slate-700 dark:text-navy-200">
                                        Auto-approve membership
                                    </span>
                                </label>
                                <p class="text-xs text-slate-500 dark:text-navy-400 mt-2 ml-8">
                                    If unchecked, the membership will require manual approval through the pending members queue
                                </p>
                            </div>
                        </div>

                        <!-- Initial Account Setup Section -->
                        <div class="space-y-6">
                            <div class="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-navy-600">
                                <div class="p-2 bg-orange-500/10 text-orange-500 rounded-lg">
                                    <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h3 class="text-lg font-medium text-slate-800 dark:text-navy-50">Initial Account Setup</h3>
                            </div>

                            <!-- Initial Savings -->
                            <div>
                                <label for="initial_savings" class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">
                                    Initial Savings Amount (UGX)
                                </label>
                                <div class="relative">
                                    <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-navy-400 text-sm">UGX</span>
                                    <input type="number" name="initial_savings" id="initial_savings"
                                        value="{{ old('initial_savings') }}" step="1000" min="0"
                                        class="form-input w-full pl-12 @error('initial_savings') border-red-500 @enderror"
                                        placeholder="0">
                                </div>
                                @error('initial_savings')
                                    <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                                @enderror
                                <p class="text-xs text-slate-500 dark:text-navy-400 mt-1">
                                    Optional: Create initial savings account with this amount
                                </p>
                            </div>

                            <!-- Initial Shares -->
                            <div>
                                <label for="initial_shares" class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">
                                    Initial Shares Amount (UGX)
                                </label>
                                <div class="relative">
                                    <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-navy-400 text-sm">UGX</span>
                                    <input type="number" name="initial_shares" id="initial_shares"
                                        value="{{ old('initial_shares') }}" step="1000" min="0"
                                        class="form-input w-full pl-12 @error('initial_shares') border-red-500 @enderror"
                                        placeholder="0">
                                </div>
                                @error('initial_shares')
                                    <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                                @enderror
                                <p class="text-xs text-slate-500 dark:text-navy-400 mt-1">
                                    Optional: Create initial shares account with this amount
                                </p>
                            </div>

                            <!-- Administrative Notes -->
                            <div>
                                <label for="notes" class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">
                                    Administrative Notes
                                </label>
                                <textarea name="notes" id="notes" rows="4"
                                    class="form-textarea w-full @error('notes') border-red-500 @enderror"
                                    placeholder="Optional notes about this enrollment (e.g., special circumstances, admin approval reasons, etc.)">{{ old('notes') }}</textarea>
                                @error('notes')
                                    <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                                @enderror
                            </div>
                        </div>
                    </div>
                @endif

                @if(!$eligibleUsers->isEmpty())
                    <!-- Member Benefits Info -->
                    <div class="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div class="flex items-center gap-3 mb-4">
                            <div class="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                                <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h4 class="text-lg font-medium text-blue-800 dark:text-blue-200">SACCO Membership Benefits</h4>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            <div class="flex items-center gap-3 p-3 bg-white dark:bg-navy-800 rounded-lg border border-blue-100 dark:border-blue-800">
                                <svg class="size-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span class="text-slate-700 dark:text-navy-200">Savings accounts with competitive interest rates</span>
                            </div>
                            <div class="flex items-center gap-3 p-3 bg-white dark:bg-navy-800 rounded-lg border border-blue-100 dark:border-blue-800">
                                <svg class="size-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span class="text-slate-700 dark:text-navy-200">Access to affordable loan products</span>
                            </div>
                            <div class="flex items-center gap-3 p-3 bg-white dark:bg-navy-800 rounded-lg border border-blue-100 dark:border-blue-800">
                                <svg class="size-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span class="text-slate-700 dark:text-navy-200">Annual dividend distributions</span>
                            </div>
                            <div class="flex items-center gap-3 p-3 bg-white dark:bg-navy-800 rounded-lg border border-blue-100 dark:border-blue-800">
                                <svg class="size-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span class="text-slate-700 dark:text-navy-200">Share ownership and voting rights</span>
                            </div>
                            <div class="flex items-center gap-3 p-3 bg-white dark:bg-navy-800 rounded-lg border border-blue-100 dark:border-blue-800">
                                <svg class="size-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span class="text-slate-700 dark:text-navy-200">Financial education and support</span>
                            </div>
                            <div class="flex items-center gap-3 p-3 bg-white dark:bg-navy-800 rounded-lg border border-blue-100 dark:border-blue-800">
                                <svg class="size-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span class="text-slate-700 dark:text-navy-200">Community investment opportunities</span>
                            </div>
                        </div>
                    </div>

                    <!-- Form Actions -->
                    <div class="flex items-center justify-between mt-8 pt-6 border-t border-slate-200 dark:border-navy-600">
                        <div class="text-sm text-slate-500 dark:text-navy-400">
                            <svg class="size-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            All enrollment actions are logged for audit purposes
                        </div>
                        <div class="flex items-center gap-4">
                            <a href="{{ route('admin.sacco.members.index') }}" class="btn btn-secondary">
                                <svg class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Cancel
                            </a>
                            <button type="submit" class="btn btn-primary">
                                <svg class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                                Enroll Member
                            </button>
                        </div>
                    </div>
                @endif
            </form>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Form submission handling
    const form = document.querySelector('form');
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', function(e) {
        // Show loading state
        const originalHtml = submitBtn.innerHTML;
        submitBtn.innerHTML = '<svg class="size-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>Enrolling...';
        submitBtn.disabled = true;
    });

    // User selection change handler
    const userSelect = document.getElementById('user_id');
    if (userSelect) {
        userSelect.addEventListener('change', function() {
            if (this.value) {
                // Show selected user info (could be enhanced with AJAX to get user details)
                console.log('Selected user ID:', this.value);
            }
        });
    }

    // Amount input formatting
    const amountInputs = document.querySelectorAll('#initial_savings, #initial_shares');
    amountInputs.forEach(input => {
        input.addEventListener('input', function() {
            // Remove any non-digit characters except decimal
            let value = this.value.replace(/[^\d]/g, '');

            // Format as currency (add commas)
            if (value.length > 0) {
                value = parseInt(value).toLocaleString();
                // Remove commas for the actual input value
                this.value = value.replace(/,/g, '');
            }
        });

        input.addEventListener('blur', function() {
            // Format display value with commas on blur
            if (this.value) {
                const formatted = parseInt(this.value).toLocaleString();
                this.setAttribute('data-formatted', formatted);
            }
        });
    });

    // Auto-approve checkbox handler
    const autoApproveCheckbox = document.getElementById('auto_approve');
    if (autoApproveCheckbox) {
        autoApproveCheckbox.addEventListener('change', function() {
            const helpText = this.closest('div').querySelector('p');
            if (this.checked) {
                helpText.textContent = 'Member will be automatically approved and activated upon enrollment';
                helpText.className = 'text-xs text-green-600 dark:text-green-400 mt-2 ml-6';
            } else {
                helpText.textContent = 'If unchecked, the membership will require manual approval through the pending members queue';
                helpText.className = 'text-xs text-slate-500 dark:text-navy-400 mt-2 ml-6';
            }
        });
    }
});
</script>
@endpush