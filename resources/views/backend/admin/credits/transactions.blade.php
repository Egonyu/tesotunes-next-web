@extends('layouts.admin')

@section('title', 'Credit Transactions')

@section('content')
<div class="dashboard-content">
    <!-- Page Header -->
    <div class="mb-8">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">Credit Transactions</h1>
                <p class="text-slate-600 dark:text-navy-300">View and analyze all credit transactions</p>
            </div>
            <div class="flex gap-3">
                <a href="{{ route('admin.credits.index') }}" class="btn border border-slate-300 text-slate-700 hover:bg-slate-50">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Credits
                </a>
                <button onclick="exportTransactions()" class="btn bg-primary text-white hover:bg-primary-focus">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export CSV
                </button>
            </div>
        </div>
    </div>

    <!-- Filters -->
    <div class="admin-card mb-6">
        <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Filters</h3>
        <form method="GET" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">Search User</label>
                <input type="text" name="search" value="{{ request('search') }}"
                       class="form-input w-full" placeholder="Name, email, or ID">
            </div>

            <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">Transaction Type</label>
                <select name="type" class="form-select w-full">
                    <option value="">All Types</option>
                    <option value="earned" {{ request('type') === 'earned' ? 'selected' : '' }}>Earned</option>
                    <option value="spent" {{ request('type') === 'spent' ? 'selected' : '' }}>Spent</option>
                    <option value="transferred" {{ request('type') === 'transferred' ? 'selected' : '' }}>Transferred</option>
                    <option value="bonus" {{ request('type') === 'bonus' ? 'selected' : '' }}>Bonus</option>
                    <option value="penalty" {{ request('type') === 'penalty' ? 'selected' : '' }}>Penalty</option>
                </select>
            </div>

            <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">Source</label>
                <select name="source" class="form-select w-full">
                    <option value="">All Sources</option>
                    <option value="listening" {{ request('source') === 'listening' ? 'selected' : '' }}>Music Listening</option>
                    <option value="daily_login" {{ request('source') === 'daily_login' ? 'selected' : '' }}>Daily Login</option>
                    <option value="referral" {{ request('source') === 'referral' ? 'selected' : '' }}>Referral</option>
                    <option value="social_interaction" {{ request('source') === 'social_interaction' ? 'selected' : '' }}>Social Activity</option>
                    <option value="artist_support" {{ request('source') === 'artist_support' ? 'selected' : '' }}>Artist Support</option>
                    <option value="transfer_in" {{ request('source') === 'transfer_in' ? 'selected' : '' }}>Received Transfer</option>
                    <option value="transfer_out" {{ request('source') === 'transfer_out' ? 'selected' : '' }}>Sent Transfer</option>
                </select>
            </div>

            <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">Date Range</label>
                <select name="date_range" class="form-select w-full">
                    <option value="">All Time</option>
                    <option value="today" {{ request('date_range') === 'today' ? 'selected' : '' }}>Today</option>
                    <option value="yesterday" {{ request('date_range') === 'yesterday' ? 'selected' : '' }}>Yesterday</option>
                    <option value="this_week" {{ request('date_range') === 'this_week' ? 'selected' : '' }}>This Week</option>
                    <option value="last_week" {{ request('date_range') === 'last_week' ? 'selected' : '' }}>Last Week</option>
                    <option value="this_month" {{ request('date_range') === 'this_month' ? 'selected' : '' }}>This Month</option>
                    <option value="last_month" {{ request('date_range') === 'last_month' ? 'selected' : '' }}>Last Month</option>
                </select>
            </div>

            <div class="lg:col-span-4 flex gap-3">
                <button type="submit" class="btn bg-primary text-white hover:bg-primary-focus">
                    Apply Filters
                </button>
                <a href="{{ route('admin.credits.transactions') }}" class="btn border border-slate-300 text-slate-700 hover:bg-slate-50">
                    Clear Filters
                </a>
            </div>
        </form>
    </div>

    <!-- Summary Stats -->
    <div class="mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="admin-card">
                <div class="text-center">
                    <p class="text-sm text-slate-600 dark:text-navy-300">Total Transactions</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50">{{ number_format($summary['total_transactions'] ?? 0) }}</p>
                </div>
            </div>
            <div class="admin-card">
                <div class="text-center">
                    <p class="text-sm text-slate-600 dark:text-navy-300">Credits Earned</p>
                    <p class="text-2xl font-bold text-green-600">+{{ number_format($summary['total_earned'] ?? 0) }}</p>
                </div>
            </div>
            <div class="admin-card">
                <div class="text-center">
                    <p class="text-sm text-slate-600 dark:text-navy-300">Credits Spent</p>
                    <p class="text-2xl font-bold text-red-600">-{{ number_format($summary['total_spent'] ?? 0) }}</p>
                </div>
            </div>
            <div class="admin-card">
                <div class="text-center">
                    <p class="text-sm text-slate-600 dark:text-navy-300">Net Change</p>
                    <p class="text-2xl font-bold {{ ($summary['net_change'] ?? 0) >= 0 ? 'text-green-600' : 'text-red-600' }}">
                        {{ ($summary['net_change'] ?? 0) >= 0 ? '+' : '' }}{{ number_format($summary['net_change'] ?? 0) }}
                    </p>
                </div>
            </div>
        </div>
    </div>

    <!-- Transactions Table -->
    <div class="admin-card">
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50">
                Transactions
                @if(isset($transactions) && $transactions->total() > 0)
                    <span class="text-sm font-normal text-slate-500">
                        ({{ number_format($transactions->total()) }} total)
                    </span>
                @endif
            </h3>
        </div>

        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200 dark:divide-navy-500">
                <thead class="bg-slate-50 dark:bg-navy-800">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-navy-300 uppercase tracking-wider">
                            <a href="{{ request()->fullUrlWithQuery(['sort' => 'id', 'order' => request('order') === 'asc' ? 'desc' : 'asc']) }}"
                               class="flex items-center gap-1 hover:text-slate-700">
                                ID
                                <svg class="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
                                </svg>
                            </a>
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-navy-300 uppercase tracking-wider">User</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-navy-300 uppercase tracking-wider">Type</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-navy-300 uppercase tracking-wider">
                            <a href="{{ request()->fullUrlWithQuery(['sort' => 'amount', 'order' => request('order') === 'asc' ? 'desc' : 'asc']) }}"
                               class="flex items-center gap-1 hover:text-slate-700">
                                Amount
                                <svg class="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
                                </svg>
                            </a>
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-navy-300 uppercase tracking-wider">Source</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-navy-300 uppercase tracking-wider">Description</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-navy-300 uppercase tracking-wider">
                            <a href="{{ request()->fullUrlWithQuery(['sort' => 'processed_at', 'order' => request('order') === 'asc' ? 'desc' : 'asc']) }}"
                               class="flex items-center gap-1 hover:text-slate-700">
                                Date
                                <svg class="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
                                </svg>
                            </a>
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-navy-300 uppercase tracking-wider">Balance After</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-navy-300 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="bg-white dark:bg-navy-700 divide-y divide-slate-200 dark:divide-navy-500">
                    @forelse($transactions ?? [] as $transaction)
                        <tr class="hover:bg-slate-50 dark:hover:bg-navy-600">
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500 dark:text-navy-300">
                                #{{ $transaction->id }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <div class="flex-shrink-0 h-8 w-8">
                                        <img class="h-8 w-8 rounded-full object-cover"
                                             src="{{ $transaction->user->avatar_url ?? '/default-avatar.svg' }}"
                                             alt="{{ $transaction->user->name }}">
                                    </div>
                                    <div class="ml-3">
                                        <div class="text-sm font-medium text-slate-900 dark:text-navy-50">
                                            {{ $transaction->user->name }}
                                        </div>
                                        <div class="text-xs text-slate-500 dark:text-navy-300">
                                            ID: {{ $transaction->user->id }}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                    @if($transaction->type === 'earned') bg-green-100 text-green-800
                                    @elseif($transaction->type === 'spent') bg-red-100 text-red-800
                                    @elseif($transaction->type === 'transferred') bg-blue-100 text-blue-800
                                    @elseif($transaction->type === 'bonus') bg-purple-100 text-purple-800
                                    @elseif($transaction->type === 'penalty') bg-orange-100 text-orange-800
                                    @else bg-gray-100 text-gray-800 @endif">
                                    {{ $transaction->type_icon }} {{ ucfirst($transaction->type) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="text-sm font-mono font-semibold
                                    @if($transaction->amount > 0) text-green-600 @else text-red-600 @endif">
                                    {{ $transaction->formatted_amount }}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-navy-300">
                                {{ $transaction->source_description }}
                            </td>
                            <td class="px-6 py-4 text-sm text-slate-500 dark:text-navy-300 max-w-xs truncate">
                                {{ $transaction->description ?: 'No description' }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-navy-300">
                                <div>{{ $transaction->processed_at?->format('M j, Y') ?? $transaction->created_at->format('M j, Y') }}</div>
                                <div class="text-xs">{{ $transaction->processed_at?->format('g:i A') ?? $transaction->created_at->format('g:i A') }}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-900 dark:text-navy-50">
                                {{ number_format($transaction->balance_after, 0) }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-navy-300">
                                <button onclick="viewTransactionDetails({{ $transaction->id }})"
                                        class="text-primary hover:text-primary-focus">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="9" class="px-6 py-12 text-center text-slate-500 dark:text-navy-300">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-12 text-slate-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <p class="text-lg font-medium mb-2">No transactions found</p>
                                <p>Try adjusting your filters or check back later.</p>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        @if(isset($transactions) && $transactions->hasPages())
            <div class="px-6 py-4 border-t border-slate-200 dark:border-navy-500">
                {{ $transactions->links() }}
            </div>
        @endif
    </div>
</div>

<!-- Transaction Details Modal -->
<div id="transactionModal" class="fixed inset-0 z-50 hidden overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-50"></div>
        <div class="relative bg-white dark:bg-navy-700 rounded-lg max-w-lg w-full p-6">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50">Transaction Details</h3>
                <button onclick="closeTransactionModal()" class="text-slate-400 hover:text-slate-600">
                    <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>

            <div id="transactionDetails" class="space-y-4">
                <!-- Transaction details will be loaded here -->
            </div>
        </div>
    </div>
</div>

<script>
function viewTransactionDetails(transactionId) {
    // In a real implementation, you'd fetch transaction details via AJAX
    document.getElementById('transactionDetails').innerHTML = `
        <div class="text-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p class="mt-2 text-slate-500">Loading transaction details...</p>
        </div>
    `;
    document.getElementById('transactionModal').classList.remove('hidden');

    // Simulate API call
    setTimeout(() => {
        document.getElementById('transactionDetails').innerHTML = `
            <div class="space-y-3">
                <div class="flex justify-between">
                    <span class="text-slate-600">Transaction ID:</span>
                    <span class="font-mono">#${transactionId}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-slate-600">Status:</span>
                    <span class="text-green-600 font-medium">Processed</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-slate-600">Reference:</span>
                    <span class="font-mono text-sm">REF-${transactionId}-${Date.now()}</span>
                </div>
            </div>
        `;
    }, 500);
}

function closeTransactionModal() {
    document.getElementById('transactionModal').classList.add('hidden');
}

function exportTransactions() {
    const params = new URLSearchParams(window.location.search);
    params.set('export', 'csv');
    window.location.href = `${window.location.pathname}?${params.toString()}`;
}
</script>

@endsection