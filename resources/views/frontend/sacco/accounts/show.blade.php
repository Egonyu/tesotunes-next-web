@extends('frontend.layouts.sacco')

@section('title', 'Account Details - ' . $account->account_number)

@section('content')
<div class="p-6 space-y-6">
    <!-- Header with Back Button -->
    <div class="flex items-center gap-4 mb-6">
        <a href="{{ route('sacco.accounts.index') }}" class="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white transition-colors">
            <span class="material-icons-round">arrow_back</span>
        </a>
        <div class="flex-1">
            <h2 class="text-3xl font-bold text-white">Account Details</h2>
            <p class="text-gray-400">{{ $account->type_name }} - {{ $account->account_number }}</p>
        </div>
        <div class="flex gap-2">
            <a href="{{ route('sacco.accounts.statement', $account->id) }}?format=pdf" target="_blank" class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                <span class="material-icons-round text-sm">description</span>
                <span class="hidden md:inline">Download Statement</span>
            </a>
        </div>
    </div>

    <!-- Account Overview Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Balance Card -->
        <div class="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white">
            <div class="flex items-start justify-between mb-4">
                <div>
                    <p class="text-green-100 text-sm mb-1">Current Balance</p>
                    <h3 class="text-3xl font-bold">{{ $account->formatted_balance }}</h3>
                </div>
                <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <span class="material-icons-round text-2xl">account_balance_wallet</span>
                </div>
            </div>
            <div class="flex items-center justify-between text-sm">
                <span class="text-green-100">Available Balance</span>
                <span class="font-semibold">{{ $account->formatted_available_balance }}</span>
            </div>
        </div>

        <!-- Account Info Card -->
        <div class="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div class="space-y-4">
                <div>
                    <p class="text-gray-400 text-xs mb-1">Account Number</p>
                    <p class="text-white font-semibold">{{ $account->account_number }}</p>
                </div>
                <div>
                    <p class="text-gray-400 text-xs mb-1">Account Type</p>
                    <p class="text-white font-semibold">{{ $account->type_name }}</p>
                </div>
                <div>
                    <p class="text-gray-400 text-xs mb-1">Status</p>
                    <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium {{ $account->status === 'active' ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300' }}">
                        {{ ucfirst($account->status) }}
                    </span>
                </div>
                <div>
                    <p class="text-gray-400 text-xs mb-1">Opened On</p>
                    <p class="text-white font-semibold">{{ $account->created_at->format('M d, Y') }}</p>
                </div>
            </div>
        </div>

        <!-- Interest Info Card (for Savings & Fixed Deposit) -->
        @if(in_array($account->account_type, ['savings', 'fixed_deposit']))
        <div class="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div class="space-y-4">
                <div>
                    <p class="text-gray-400 text-xs mb-1">Interest Rate</p>
                    <p class="text-white font-semibold text-2xl">{{ $account->interest_rate }}% <span class="text-sm text-gray-400">p.a.</span></p>
                </div>
                <div>
                    <p class="text-gray-400 text-xs mb-1">Interest Earned (This Year)</p>
                    <p class="text-green-500 font-semibold text-xl">UGX {{ number_format($interestEarned) }}</p>
                </div>
                @if($account->account_type === 'fixed_deposit' && $account->maturity_date)
                <div>
                    <p class="text-gray-400 text-xs mb-1">Maturity Date</p>
                    <p class="text-white font-semibold">{{ $account->maturity_date->format('M d, Y') }}</p>
                    @if($account->maturity_date->isFuture())
                        <p class="text-yellow-500 text-xs mt-1">{{ $account->maturity_date->diffForHumans() }}</p>
                    @endif
                </div>
                @endif
            </div>
        </div>
        @else
        <!-- Quick Actions for Shares -->
        <div class="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h5 class="text-white font-semibold mb-4">Quick Actions</h5>
            <div class="space-y-2">
                @if($account->account_type === 'savings')
                <a href="{{ route('sacco.deposits.create', ['account' => $account->id]) }}" class="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full">
                    <span class="material-icons-round text-sm">add_circle</span>
                    Make Deposit
                </a>
                <a href="{{ route('sacco.withdrawals.create', ['account' => $account->id]) }}" class="flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full">
                    <span class="material-icons-round text-sm">remove_circle</span>
                    Request Withdrawal
                </a>
                @elseif($account->account_type === 'shares')
                <a href="{{ route('sacco.deposits.create', ['account' => $account->id, 'type' => 'shares']) }}" class="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full">
                    <span class="material-icons-round text-sm">trending_up</span>
                    Buy Shares
                </a>
                @endif
            </div>
        </div>
        @endif
    </div>

    <!-- Transaction Filter and Search -->
    <div class="bg-gray-800 border border-gray-700 rounded-xl p-4">
        <form method="GET" action="{{ route('sacco.accounts.show', $account->id) }}" class="flex flex-col md:flex-row gap-4">
            <div class="flex-1">
                <input type="text" name="search" value="{{ request('search') }}" placeholder="Search transactions..." class="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:ring-1 focus:ring-green-500">
            </div>
            <div class="flex gap-2">
                <select name="type" class="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:ring-1 focus:ring-green-500">
                    <option value="">All Types</option>
                    <option value="deposit" {{ request('type') === 'deposit' ? 'selected' : '' }}>Deposits</option>
                    <option value="withdrawal" {{ request('type') === 'withdrawal' ? 'selected' : '' }}>Withdrawals</option>
                    <option value="interest" {{ request('type') === 'interest' ? 'selected' : '' }}>Interest</option>
                    <option value="transfer" {{ request('type') === 'transfer' ? 'selected' : '' }}>Transfers</option>
                </select>
                <input type="date" name="from_date" value="{{ request('from_date') }}" class="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:ring-1 focus:ring-green-500">
                <input type="date" name="to_date" value="{{ request('to_date') }}" class="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:ring-1 focus:ring-green-500">
                <button type="submit" class="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    <span class="material-icons-round text-sm">search</span>
                    Filter
                </button>
                @if(request()->hasAny(['search', 'type', 'from_date', 'to_date']))
                <a href="{{ route('sacco.accounts.show', $account->id) }}" class="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    <span class="material-icons-round text-sm">clear</span>
                    Clear
                </a>
                @endif
            </div>
        </form>
    </div>

    <!-- Transaction History -->
    <div class="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <div class="p-6 border-b border-gray-700">
            <h5 class="text-xl font-semibold text-white">Transaction History</h5>
        </div>

        @if($transactions->isNotEmpty())
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead class="bg-gray-100 dark:bg-gray-900">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Reference</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Balance</th>
                        <th class="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-700">
                    @foreach($transactions as $transaction)
                    <tr class="hover:bg-gray-900">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {{ $transaction->created_at->format('M d, Y') }}<br>
                            <span class="text-xs text-gray-500">{{ $transaction->created_at->format('h:i A') }}</span>
                        </td>
                        <td class="px-6 py-4 text-sm text-white">
                            <div class="flex items-start gap-2">
                                <span class="material-icons-round text-{{ $transaction->type_color }}-500 text-lg">
                                    {{ $transaction->type_icon }}
                                </span>
                                <div>
                                    <p class="font-medium">{{ $transaction->description }}</p>
                                    @if($transaction->notes)
                                    <p class="text-gray-500 text-xs mt-1">{{ $transaction->notes }}</p>
                                    @endif
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-{{ $transaction->type_color }}-600 text-white">
                                {{ ucfirst(str_replace('_', ' ', $transaction->transaction_type)) }}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {{ $transaction->reference }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right">
                            <span class="text-sm font-semibold {{ $transaction->is_credit ? 'text-green-500' : 'text-red-500' }}">
                                {{ $transaction->is_credit ? '+' : '-' }} {{ $transaction->formatted_amount }}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-white font-medium">
                            {{ $transaction->formatted_balance_after }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-center">
                            <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-{{ $transaction->status_color }}-600 text-white">
                                {{ ucfirst($transaction->status) }}
                            </span>
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div class="p-6 border-t border-gray-700">
            {{ $transactions->links() }}
        </div>
        @else
        <div class="p-12 text-center">
            <span class="material-icons-round text-6xl text-gray-700 mb-3">receipt_long</span>
            <p class="text-gray-500">No transactions found</p>
            @if(request()->hasAny(['search', 'type', 'from_date', 'to_date']))
            <p class="text-gray-600 text-sm mt-2">Try adjusting your filters</p>
            @endif
        </div>
        @endif
    </div>

    <!-- Transaction Summary (if filtered by date) -->
    @if(request('from_date') || request('to_date'))
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <p class="text-gray-400 text-sm mb-1">Total Deposits</p>
            <h4 class="text-2xl font-bold text-green-500">UGX {{ number_format($summary['total_deposits'] ?? 0) }}</h4>
            <p class="text-gray-500 text-xs mt-1">{{ $summary['deposit_count'] ?? 0 }} transactions</p>
        </div>
        <div class="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <p class="text-gray-400 text-sm mb-1">Total Withdrawals</p>
            <h4 class="text-2xl font-bold text-red-500">UGX {{ number_format($summary['total_withdrawals'] ?? 0) }}</h4>
            <p class="text-gray-500 text-xs mt-1">{{ $summary['withdrawal_count'] ?? 0 }} transactions</p>
        </div>
        <div class="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <p class="text-gray-400 text-sm mb-1">Net Change</p>
            <h4 class="text-2xl font-bold {{ ($summary['net_change'] ?? 0) >= 0 ? 'text-green-500' : 'text-red-500' }}">
                UGX {{ number_format(abs($summary['net_change'] ?? 0)) }}
            </h4>
            <p class="text-gray-500 text-xs mt-1">{{ ($summary['net_change'] ?? 0) >= 0 ? 'Increase' : 'Decrease' }}</p>
        </div>
    </div>
    @endif
</div>

@push('scripts')
<script>
    // Auto-submit form on date change for better UX
    document.querySelectorAll('input[type="date"]').forEach(input => {
        input.addEventListener('change', function() {
            this.form.submit();
        });
    });
</script>
@endpush
@endsection
