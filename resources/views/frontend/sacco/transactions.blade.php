@extends('layouts.app')

@section('title', 'Transaction History - SACCO')

@section('left-sidebar')
    @include('frontend.partials.sacco-left-sidebar')
@endsection

@section('content')
<div class="min-h-screen bg-gray-50 dark:bg-[#0D1117]">
    <main class="p-4 md:p-6">
        <!-- Header with Back Button -->
        <div class="flex items-center gap-4 mb-6">
            <a href="{{ route('sacco.dashboard') }}" class="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-[#161B22] hover:bg-gray-100 dark:hover:bg-[#21262D] border border-gray-200 dark:border-[#30363D] text-gray-700 dark:text-white transition-colors">
                <span class="material-symbols-outlined">arrow_back</span>
            </a>
            <div>
                <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Transaction History</h2>
                <p class="text-gray-500 dark:text-[#7D8590]">Complete record of all your SACCO transactions</p>
            </div>
        </div>

        <!-- Success/Error Messages -->
        @if(session('success'))
            <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-start gap-3 mb-6">
                <span class="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span>
                <div>
                    <p class="text-green-800 dark:text-green-200 text-sm font-medium">{{ session('success') }}</p>
                </div>
            </div>
        @endif

        @if(session('error'))
            <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3 mb-6">
                <span class="material-symbols-outlined text-red-600 dark:text-red-400">error</span>
                <div>
                    <p class="text-red-800 dark:text-red-200 text-sm font-medium">{{ session('error') }}</p>
                </div>
            </div>
        @endif

        <!-- Summary Stats Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <!-- Total Deposits -->
            <div class="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#30363D] rounded-xl p-4 shadow-sm">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#7D8590]">Deposits</span>
                    <span class="material-symbols-outlined text-brand-green text-lg">arrow_downward</span>
                </div>
                <p class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">UGX {{ number_format($stats['total_deposits'] ?? 0) }}</p>
                <p class="text-xs text-gray-500 dark:text-[#7D8590] mt-1">{{ $stats['deposit_count'] ?? 0 }} transactions</p>
            </div>

            <!-- Total Withdrawals -->
            <div class="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#30363D] rounded-xl p-4 shadow-sm">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#7D8590]">Withdrawals</span>
                    <span class="material-symbols-outlined text-red-500 text-lg">arrow_upward</span>
                </div>
                <p class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">UGX {{ number_format($stats['total_withdrawals'] ?? 0) }}</p>
                <p class="text-xs text-gray-500 dark:text-[#7D8590] mt-1">{{ $stats['withdrawal_count'] ?? 0 }} transactions</p>
            </div>

            <!-- Interest Earned -->
            <div class="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#30363D] rounded-xl p-4 shadow-sm">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#7D8590]">Interest</span>
                    <span class="material-symbols-outlined text-purple-500 text-lg">trending_up</span>
                </div>
                <p class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">UGX {{ number_format($stats['total_interest'] ?? 0) }}</p>
                <p class="text-xs text-gray-500 dark:text-[#7D8590] mt-1">{{ $stats['interest_count'] ?? 0 }} credits</p>
            </div>

            <!-- Fees -->
            <div class="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#30363D] rounded-xl p-4 shadow-sm">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#7D8590]">Fees</span>
                    <span class="material-symbols-outlined text-amber-500 text-lg">receipt_long</span>
                </div>
                <p class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">UGX {{ number_format($stats['total_fees'] ?? 0) }}</p>
                <p class="text-xs text-gray-500 dark:text-[#7D8590] mt-1">{{ $stats['fee_count'] ?? 0 }} charges</p>
            </div>
        </div>

        <!-- Filters -->
        <div class="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#30363D] rounded-xl p-4 mb-6 shadow-sm">
            <form method="GET" action="{{ route('sacco.transactions') }}" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <!-- Transaction Type -->
                <div>
                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                    <select name="type" class="w-full px-3 py-2 bg-gray-50 dark:bg-[#0D1117] border border-gray-300 dark:border-[#30363D] rounded-lg text-sm text-gray-900 dark:text-white focus:border-brand-green focus:ring-1 focus:ring-brand-green">
                        <option value="">All Types</option>
                        <option value="deposit" {{ request('type') == 'deposit' ? 'selected' : '' }}>Deposits</option>
                        <option value="withdrawal" {{ request('type') == 'withdrawal' ? 'selected' : '' }}>Withdrawals</option>
                        <option value="interest" {{ request('type') == 'interest' ? 'selected' : '' }}>Interest</option>
                        <option value="fee" {{ request('type') == 'fee' ? 'selected' : '' }}>Fees</option>
                        <option value="transfer_in" {{ request('type') == 'transfer_in' ? 'selected' : '' }}>Transfers In</option>
                        <option value="transfer_out" {{ request('type') == 'transfer_out' ? 'selected' : '' }}>Transfers Out</option>
                    </select>
                </div>

                <!-- Account Filter -->
                <div>
                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Account</label>
                    <select name="account" class="w-full px-3 py-2 bg-gray-50 dark:bg-[#0D1117] border border-gray-300 dark:border-[#30363D] rounded-lg text-sm text-gray-900 dark:text-white focus:border-brand-green focus:ring-1 focus:ring-brand-green">
                        <option value="">All Accounts</option>
                        @foreach($accounts as $account)
                            <option value="{{ $account->id }}" {{ request('account') == $account->id ? 'selected' : '' }}>
                                {{ $account->account_name ?? ucfirst($account->account_type ?? 'Account') }} - {{ $account->account_number }}
                            </option>
                        @endforeach
                    </select>
                </div>

                <!-- Status -->
                <div>
                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select name="status" class="w-full px-3 py-2 bg-gray-50 dark:bg-[#0D1117] border border-gray-300 dark:border-[#30363D] rounded-lg text-sm text-gray-900 dark:text-white focus:border-brand-green focus:ring-1 focus:ring-brand-green">
                        <option value="">All Statuses</option>
                        <option value="completed" {{ request('status') == 'completed' ? 'selected' : '' }}>Completed</option>
                        <option value="pending" {{ request('status') == 'pending' ? 'selected' : '' }}>Pending</option>
                        <option value="failed" {{ request('status') == 'failed' ? 'selected' : '' }}>Failed</option>
                        <option value="reversed" {{ request('status') == 'reversed' ? 'selected' : '' }}>Reversed</option>
                    </select>
                </div>

                <!-- Date Range -->
                <div>
                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">From Date</label>
                    <input type="date" name="from_date" value="{{ request('from_date') }}" 
                           class="w-full px-3 py-2 bg-gray-50 dark:bg-[#0D1117] border border-gray-300 dark:border-[#30363D] rounded-lg text-sm text-gray-900 dark:text-white focus:border-brand-green focus:ring-1 focus:ring-brand-green">
                </div>

                <div class="flex items-end gap-2">
                    <div class="flex-1">
                        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">To Date</label>
                        <input type="date" name="to_date" value="{{ request('to_date') }}" 
                               class="w-full px-3 py-2 bg-gray-50 dark:bg-[#0D1117] border border-gray-300 dark:border-[#30363D] rounded-lg text-sm text-gray-900 dark:text-white focus:border-brand-green focus:ring-1 focus:ring-brand-green">
                    </div>
                    <button type="submit" class="px-4 py-2 bg-brand-green hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors">
                        <span class="material-symbols-outlined text-lg">filter_list</span>
                    </button>
                    <a href="{{ route('sacco.transactions') }}" class="px-4 py-2 bg-gray-100 dark:bg-[#21262D] hover:bg-gray-200 dark:hover:bg-[#30363D] text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors border border-gray-200 dark:border-[#30363D]">
                        <span class="material-symbols-outlined text-lg">refresh</span>
                    </a>
                </div>
            </form>
        </div>

        <!-- Transactions List -->
        <div class="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#30363D] rounded-xl shadow-sm overflow-hidden">
            <!-- Desktop Table -->
            <div class="hidden md:block overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50 dark:bg-[#161B22] border-b border-gray-200 dark:border-[#30363D]">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-[#7D8590] uppercase tracking-wider">Date/Time</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-[#7D8590] uppercase tracking-wider">Type</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-[#7D8590] uppercase tracking-wider">Account</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-[#7D8590] uppercase tracking-wider">Reference</th>
                            <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-[#7D8590] uppercase tracking-wider">Amount</th>
                            <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-[#7D8590] uppercase tracking-wider">Balance After</th>
                            <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-[#7D8590] uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-[#21262D]">
                        @forelse($transactions as $transaction)
                            @php
                                $isCredit = in_array($transaction->type, ['deposit', 'interest', 'transfer_in', 'dividend']);
                                $typeColors = [
                                    'deposit' => 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
                                    'withdrawal' => 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
                                    'interest' => 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
                                    'fee' => 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
                                    'transfer_in' => 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
                                    'transfer_out' => 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
                                ];
                                $typeIcons = [
                                    'deposit' => 'arrow_downward',
                                    'withdrawal' => 'arrow_upward',
                                    'interest' => 'trending_up',
                                    'fee' => 'receipt_long',
                                    'transfer_in' => 'call_received',
                                    'transfer_out' => 'call_made',
                                ];
                                $statusColors = [
                                    'completed' => 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
                                    'pending' => 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
                                    'failed' => 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
                                    'reversed' => 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400',
                                ];
                            @endphp
                            <tr class="hover:bg-gray-50 dark:hover:bg-[#21262D]/50 transition-colors">
                                <td class="px-4 py-3">
                                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                                        {{ $transaction->created_at->format('M d, Y') }}
                                    </div>
                                    <div class="text-xs text-gray-500 dark:text-[#7D8590]">
                                        {{ $transaction->created_at->format('h:i A') }}
                                    </div>
                                </td>
                                <td class="px-4 py-3">
                                    <div class="flex items-center gap-2">
                                        <span class="inline-flex items-center justify-center w-7 h-7 rounded-lg {{ $typeColors[$transaction->type] ?? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' }}">
                                            <span class="material-symbols-outlined text-sm">{{ $typeIcons[$transaction->type] ?? 'swap_horiz' }}</span>
                                        </span>
                                        <span class="text-sm font-medium text-gray-900 dark:text-white capitalize">{{ str_replace('_', ' ', $transaction->type) }}</span>
                                    </div>
                                </td>
                                <td class="px-4 py-3">
                                    <div class="text-sm text-gray-900 dark:text-white">{{ $transaction->account->account_name ?? ucfirst($transaction->account->account_type ?? 'Account') }}</div>
                                    <div class="text-xs text-gray-500 dark:text-[#7D8590]">{{ $transaction->account->account_number ?? '-' }}</div>
                                </td>
                                <td class="px-4 py-3">
                                    <span class="text-sm text-gray-500 dark:text-[#7D8590] font-mono">{{ $transaction->transaction_code ?? $transaction->reference_number ?? '-' }}</span>
                                </td>
                                <td class="px-4 py-3 text-right">
                                    <span class="text-sm font-bold {{ $isCredit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400' }}">
                                        {{ $isCredit ? '+' : '-' }}UGX {{ number_format($transaction->amount_ugx ?? 0) }}
                                    </span>
                                </td>
                                <td class="px-4 py-3 text-right">
                                    <span class="text-sm font-medium text-gray-900 dark:text-white">UGX {{ number_format($transaction->balance_after_ugx ?? 0) }}</span>
                                </td>
                                <td class="px-4 py-3 text-center">
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {{ $statusColors[$transaction->status] ?? 'bg-gray-100 text-gray-800' }}">
                                        {{ ucfirst($transaction->status ?? 'unknown') }}
                                    </span>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="7" class="px-4 py-12 text-center">
                                    <div class="flex flex-col items-center">
                                        <span class="material-symbols-outlined text-5xl text-gray-300 dark:text-[#30363D] mb-4">receipt_long</span>
                                        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-1">No Transactions Found</h3>
                                        <p class="text-sm text-gray-500 dark:text-[#7D8590]">Your transaction history will appear here</p>
                                        <a href="{{ route('sacco.deposits.create') }}" class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-brand-green hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors">
                                            <span class="material-symbols-outlined text-lg">add</span>
                                            Make Your First Deposit
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            <!-- Mobile Cards -->
            <div class="md:hidden divide-y divide-gray-100 dark:divide-[#21262D]">
                @forelse($transactions as $transaction)
                    @php
                        $isCredit = in_array($transaction->type, ['deposit', 'interest', 'transfer_in', 'dividend']);
                        $typeColors = [
                            'deposit' => 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
                            'withdrawal' => 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
                            'interest' => 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
                            'fee' => 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
                            'transfer_in' => 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
                            'transfer_out' => 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
                        ];
                        $typeIcons = [
                            'deposit' => 'arrow_downward',
                            'withdrawal' => 'arrow_upward',
                            'interest' => 'trending_up',
                            'fee' => 'receipt_long',
                            'transfer_in' => 'call_received',
                            'transfer_out' => 'call_made',
                        ];
                        $statusColors = [
                            'completed' => 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
                            'pending' => 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
                            'failed' => 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
                            'reversed' => 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400',
                        ];
                    @endphp
                    <div class="p-4">
                        <div class="flex items-start justify-between mb-3">
                            <div class="flex items-center gap-3">
                                <span class="inline-flex items-center justify-center w-10 h-10 rounded-lg {{ $typeColors[$transaction->type] ?? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' }}">
                                    <span class="material-symbols-outlined">{{ $typeIcons[$transaction->type] ?? 'swap_horiz' }}</span>
                                </span>
                                <div>
                                    <p class="text-sm font-medium text-gray-900 dark:text-white capitalize">{{ str_replace('_', ' ', $transaction->type) }}</p>
                                    <p class="text-xs text-gray-500 dark:text-[#7D8590]">{{ $transaction->created_at->format('M d, Y • h:i A') }}</p>
                                </div>
                            </div>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {{ $statusColors[$transaction->status] ?? 'bg-gray-100 text-gray-800' }}">
                                {{ ucfirst($transaction->status ?? 'unknown') }}
                            </span>
                        </div>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span class="text-gray-500 dark:text-[#7D8590]">Amount</span>
                                <span class="font-bold {{ $isCredit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400' }}">
                                    {{ $isCredit ? '+' : '-' }}UGX {{ number_format($transaction->amount_ugx ?? 0) }}
                                </span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-500 dark:text-[#7D8590]">Balance After</span>
                                <span class="font-medium text-gray-900 dark:text-white">UGX {{ number_format($transaction->balance_after_ugx ?? 0) }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-500 dark:text-[#7D8590]">Account</span>
                                <span class="text-gray-900 dark:text-white">{{ $transaction->account->account_number ?? '-' }}</span>
                            </div>
                            @if($transaction->transaction_code || $transaction->reference_number)
                            <div class="flex justify-between">
                                <span class="text-gray-500 dark:text-[#7D8590]">Reference</span>
                                <span class="text-gray-500 dark:text-[#7D8590] font-mono text-xs">{{ $transaction->transaction_code ?? $transaction->reference_number }}</span>
                            </div>
                            @endif
                        </div>
                    </div>
                @empty
                    <div class="p-8 text-center">
                        <span class="material-symbols-outlined text-5xl text-gray-300 dark:text-[#30363D] mb-4">receipt_long</span>
                        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-1">No Transactions Found</h3>
                        <p class="text-sm text-gray-500 dark:text-[#7D8590]">Your transaction history will appear here</p>
                        <a href="{{ route('sacco.deposits.create') }}" class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-brand-green hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors">
                            <span class="material-symbols-outlined text-lg">add</span>
                            Make Your First Deposit
                        </a>
                    </div>
                @endforelse
            </div>

            <!-- Pagination -->
            @if($transactions->hasPages())
                <div class="px-4 py-4 bg-gray-50 dark:bg-[#161B22] border-t border-gray-200 dark:border-[#30363D]">
                    <div class="flex items-center justify-between">
                        <p class="text-sm text-gray-500 dark:text-[#7D8590]">
                            Showing {{ $transactions->firstItem() ?? 0 }} to {{ $transactions->lastItem() ?? 0 }} of {{ $transactions->total() }} transactions
                        </p>
                        <div class="flex gap-2">
                            @if($transactions->onFirstPage())
                                <span class="px-3 py-1.5 text-sm text-gray-400 dark:text-[#484F58] bg-gray-100 dark:bg-[#21262D] border border-gray-200 dark:border-[#30363D] rounded-lg cursor-not-allowed">Previous</span>
                            @else
                                <a href="{{ $transactions->previousPageUrl() }}" class="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-[#21262D] border border-gray-200 dark:border-[#30363D] rounded-lg hover:bg-gray-50 dark:hover:bg-[#30363D] transition-colors">Previous</a>
                            @endif

                            @if($transactions->hasMorePages())
                                <a href="{{ $transactions->nextPageUrl() }}" class="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-[#21262D] border border-gray-200 dark:border-[#30363D] rounded-lg hover:bg-gray-50 dark:hover:bg-[#30363D] transition-colors">Next</a>
                            @else
                                <span class="px-3 py-1.5 text-sm text-gray-400 dark:text-[#484F58] bg-gray-100 dark:bg-[#21262D] border border-gray-200 dark:border-[#30363D] rounded-lg cursor-not-allowed">Next</span>
                            @endif
                        </div>
                    </div>
                </div>
            @endif
        </div>

        <!-- Quick Actions -->
        <div class="mt-6 flex flex-wrap gap-3">
            <a href="{{ route('sacco.deposits.create') }}" class="inline-flex items-center gap-2 px-4 py-2 bg-brand-green hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
                <span class="material-symbols-outlined text-lg">add</span>
                Make Deposit
            </a>
            <a href="{{ route('sacco.withdrawals.create') }}" class="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#21262D] hover:bg-gray-50 dark:hover:bg-[#30363D] text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors border border-gray-200 dark:border-[#30363D] shadow-sm">
                <span class="material-symbols-outlined text-lg">payments</span>
                Request Withdrawal
            </a>
            <a href="{{ route('sacco.accounts.index') }}" class="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#21262D] hover:bg-gray-50 dark:hover:bg-[#30363D] text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors border border-gray-200 dark:border-[#30363D] shadow-sm">
                <span class="material-symbols-outlined text-lg">account_balance_wallet</span>
                View Accounts
            </a>
        </div>
    </main>
</div>
@endsection
