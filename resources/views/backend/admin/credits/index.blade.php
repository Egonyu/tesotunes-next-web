@extends('layouts.admin')

@section('title', 'Credit Management')

@section('content')
<div class="dashboard-content">
    <!-- Page Header -->
    <div class="mb-8">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">Credit Management</h1>
                <p class="text-slate-600 dark:text-navy-300">Manage user credits, rates, and transactions</p>
            </div>
            <div class="flex gap-3">
                <a href="{{ route('admin.credits.rates') }}" class="btn bg-primary text-white hover:bg-primary-focus">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                    Manage Rates
                </a>
                <a href="{{ route('admin.credits.analytics') }}" class="btn border border-slate-300 text-slate-700 hover:bg-slate-50">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Analytics
                </a>
            </div>
        </div>
    </div>

    <!-- Statistics Cards -->
    <div class="mb-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Total Credits in System -->
            <div class="admin-card">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-slate-600 dark:text-navy-300">Total Credits</p>
                        <p class="text-2xl font-bold text-slate-800 dark:text-navy-50">{{ number_format($stats['total_credits'] ?? 0) }}</p>
                        <p class="text-xs text-green-600">{{ $stats['total_credits_change'] ?? '+0%' }} from last month</p>
                    </div>
                    <div class="p-3 bg-primary/10 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                    </div>
                </div>
            </div>

            <!-- Active Users -->
            <div class="admin-card">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-slate-600 dark:text-navy-300">Active Credit Users</p>
                        <p class="text-2xl font-bold text-slate-800 dark:text-navy-50">{{ number_format($stats['active_users'] ?? 0) }}</p>
                        <p class="text-xs text-blue-600">{{ $stats['active_users_change'] ?? '+0%' }} from last month</p>
                    </div>
                    <div class="p-3 bg-blue-100 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            <!-- Today's Transactions -->
            <div class="admin-card">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-slate-600 dark:text-navy-300">Today's Transactions</p>
                        <p class="text-2xl font-bold text-slate-800 dark:text-navy-50">{{ number_format($stats['daily_transactions'] ?? 0) }}</p>
                        <p class="text-xs text-amber-600">{{ number_format($stats['daily_credit_volume'] ?? 0) }} credits</p>
                    </div>
                    <div class="p-3 bg-amber-100 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                    </div>
                </div>
            </div>

            <!-- Pending Credits -->
            <div class="admin-card">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-slate-600 dark:text-navy-300">Pending Credits</p>
                        <p class="text-2xl font-bold text-slate-800 dark:text-navy-50">{{ number_format($stats['pending_credits'] ?? 0) }}</p>
                        <p class="text-xs text-orange-600">Awaiting processing</p>
                    </div>
                    <div class="p-3 bg-orange-100 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Quick Actions -->
    <div class="mb-8">
        <div class="admin-card">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-6">Quick Actions</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button onclick="openAwardCreditsModal()" class="p-4 border-2 border-dashed border-green-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors">
                    <div class="text-center">
                        <div class="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <h4 class="font-medium text-slate-800 dark:text-navy-50">Award Credits</h4>
                        <p class="text-sm text-slate-600 dark:text-navy-300">Give credits to users</p>
                    </div>
                </button>

                <button onclick="openDeductCreditsModal()" class="p-4 border-2 border-dashed border-red-300 rounded-lg hover:border-red-400 hover:bg-red-50 transition-colors">
                    <div class="text-center">
                        <div class="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                            </svg>
                        </div>
                        <h4 class="font-medium text-slate-800 dark:text-navy-50">Deduct Credits</h4>
                        <p class="text-sm text-slate-600 dark:text-navy-300">Remove credits from users</p>
                    </div>
                </button>

                <a href="{{ route('admin.credits.transactions') }}" class="p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    <div class="text-center">
                        <div class="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h4 class="font-medium text-slate-800 dark:text-navy-50">View Transactions</h4>
                        <p class="text-sm text-slate-600 dark:text-navy-300">Browse credit history</p>
                    </div>
                </a>
            </div>
        </div>
    </div>

    <!-- Recent Transactions -->
    <div class="admin-card">
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50">Recent Transactions</h3>
            <a href="{{ route('admin.credits.transactions') }}" class="text-sm text-primary hover:text-primary-focus">View all</a>
        </div>

        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200 dark:divide-navy-500">
                <thead class="bg-slate-50 dark:bg-navy-800">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-navy-300 uppercase tracking-wider">User</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-navy-300 uppercase tracking-wider">Type</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-navy-300 uppercase tracking-wider">Amount</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-navy-300 uppercase tracking-wider">Source</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-navy-300 uppercase tracking-wider">Date</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-navy-300 uppercase tracking-wider">Balance After</th>
                    </tr>
                </thead>
                <tbody class="bg-white dark:bg-navy-700 divide-y divide-slate-200 dark:divide-navy-500">
                    @forelse($recent_transactions ?? [] as $transaction)
                        <tr class="hover:bg-slate-50 dark:hover:bg-navy-600">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <div class="flex-shrink-0 h-10 w-10">
                                        <img class="h-10 w-10 rounded-full object-cover"
                                             src="{{ $transaction->user->avatar_url ?? '/default-avatar.svg' }}"
                                             alt="{{ $transaction->user->name }}">
                                    </div>
                                    <div class="ml-4">
                                        <div class="text-sm font-medium text-slate-900 dark:text-navy-50">
                                            {{ $transaction->user->name }}
                                        </div>
                                        <div class="text-sm text-slate-500 dark:text-navy-300">
                                            {{ $transaction->user->email }}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                    @if($transaction->type === 'earned') bg-green-100 text-green-800
                                    @elseif($transaction->type === 'spent') bg-red-100 text-red-800
                                    @elseif($transaction->type === 'transferred') bg-blue-100 text-blue-800
                                    @else bg-gray-100 text-gray-800 @endif">
                                    {{ $transaction->type_icon }} {{ ucfirst($transaction->type) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-mono
                                @if($transaction->amount > 0) text-green-600 @else text-red-600 @endif">
                                {{ $transaction->formatted_amount }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-navy-300">
                                {{ $transaction->source_description }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-navy-300">
                                {{ $transaction->processed_at?->format('M j, Y g:i A') ?? $transaction->created_at->format('M j, Y g:i A') }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-900 dark:text-navy-50">
                                {{ number_format($transaction->balance_after, 0) }} credits
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="px-6 py-4 text-center text-slate-500 dark:text-navy-300">
                                No recent transactions found.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Award Credits Modal -->
<div id="awardCreditsModal" class="fixed inset-0 z-50 hidden overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-50"></div>
        <div class="relative bg-white dark:bg-navy-700 rounded-lg max-w-md w-full p-6">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50">Award Credits</h3>
                <button onclick="closeAwardCreditsModal()" class="text-slate-400 hover:text-slate-600">
                    <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>

            <form id="awardCreditsForm" class="space-y-4">
                @csrf
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">User ID or Email</label>
                    <input type="text" name="user_identifier" required
                           class="form-input w-full" placeholder="Enter user ID or email">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">Amount</label>
                    <input type="number" name="amount" min="1" required
                           class="form-input w-full" placeholder="Enter credit amount">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">Reason</label>
                    <textarea name="description" rows="3" required
                              class="form-input w-full" placeholder="Reason for awarding credits"></textarea>
                </div>
                <div class="flex gap-3 pt-4">
                    <button type="submit" class="btn bg-primary text-white hover:bg-primary-focus flex-1">
                        Award Credits
                    </button>
                    <button type="button" onclick="closeAwardCreditsModal()"
                            class="btn border border-slate-300 text-slate-700 hover:bg-slate-50">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Deduct Credits Modal -->
<div id="deductCreditsModal" class="fixed inset-0 z-50 hidden overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-50"></div>
        <div class="relative bg-white dark:bg-navy-700 rounded-lg max-w-md w-full p-6">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50">Deduct Credits</h3>
                <button onclick="closeDeductCreditsModal()" class="text-slate-400 hover:text-slate-600">
                    <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>

            <form id="deductCreditsForm" class="space-y-4">
                @csrf
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">User ID or Email</label>
                    <input type="text" name="user_identifier" required
                           class="form-input w-full" placeholder="Enter user ID or email">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">Amount</label>
                    <input type="number" name="amount" min="1" required
                           class="form-input w-full" placeholder="Enter credit amount">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">Reason</label>
                    <textarea name="description" rows="3" required
                              class="form-input w-full" placeholder="Reason for deducting credits"></textarea>
                </div>
                <div class="flex gap-3 pt-4">
                    <button type="submit" class="btn bg-red-600 text-white hover:bg-red-700 flex-1">
                        Deduct Credits
                    </button>
                    <button type="button" onclick="closeDeductCreditsModal()"
                            class="btn border border-slate-300 text-slate-700 hover:bg-slate-50">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
function openAwardCreditsModal() {
    document.getElementById('awardCreditsModal').classList.remove('hidden');
}

function closeAwardCreditsModal() {
    document.getElementById('awardCreditsModal').classList.add('hidden');
    document.getElementById('awardCreditsForm').reset();
}

function openDeductCreditsModal() {
    document.getElementById('deductCreditsModal').classList.remove('hidden');
}

function closeDeductCreditsModal() {
    document.getElementById('deductCreditsModal').classList.add('hidden');
    document.getElementById('deductCreditsForm').reset();
}

// Award credits form submission
document.getElementById('awardCreditsForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    try {
        const response = await fetch('{{ route("admin.credits.award") }}', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            }
        });

        const result = await response.json();
        if (result.success) {
            closeAwardCreditsModal();
            showNotification('Credits awarded successfully!', 'success');
            setTimeout(() => location.reload(), 1000);
        } else {
            showNotification(result.message || 'Error awarding credits', 'error');
        }
    } catch (error) {
        showNotification('Error awarding credits', 'error');
    }
});

// Deduct credits form submission
document.getElementById('deductCreditsForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    try {
        const response = await fetch('{{ route("admin.credits.deduct") }}', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            }
        });

        const result = await response.json();
        if (result.success) {
            closeDeductCreditsModal();
            showNotification('Credits deducted successfully!', 'success');
            setTimeout(() => location.reload(), 1000);
        } else {
            showNotification(result.message || 'Error deducting credits', 'error');
        }
    } catch (error) {
        showNotification('Error deducting credits', 'error');
    }
});

function showNotification(message, type) {
    // Add your notification system here
    alert(message);
}
</script>

@endsection