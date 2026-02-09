@extends('frontend.layouts.sacco')

@section('title', 'My Accounts - SACCO')

@section('content')
<div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h2 class="text-3xl font-bold text-white">My Accounts</h2>
            <p class="text-gray-400">Manage your SACCO accounts</p>
        </div>
        <div class="flex gap-3">
            <a href="{{ route('sacco.dashboard') }}" class="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                <span class="material-icons-round text-sm">arrow_back</span>
                Dashboard
            </a>
        </div>
    </div>

    <!-- Accounts Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white">
            <div class="flex items-center justify-between mb-4">
                <span class="text-sm font-medium opacity-90">Total Balance</span>
                <span class="material-icons-round text-2xl opacity-75">account_balance_wallet</span>
            </div>
            <h3 class="text-3xl font-bold mb-1">UGX {{ number_format($totalBalance) }}</h3>
            <p class="text-sm opacity-75">Across all accounts</p>
        </div>

        <div class="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
            <div class="flex items-center justify-between mb-4">
                <span class="text-sm font-medium opacity-90">Active Accounts</span>
                <span class="material-icons-round text-2xl opacity-75">check_circle</span>
            </div>
            <h3 class="text-3xl font-bold mb-1">{{ $activeAccounts }}</h3>
            <p class="text-sm opacity-75">Out of {{ $accounts->count() }} total</p>
        </div>

        <div class="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white">
            <div class="flex items-center justify-between mb-4">
                <span class="text-sm font-medium opacity-90">Interest Earned (YTD)</span>
                <span class="material-icons-round text-2xl opacity-75">trending_up</span>
            </div>
            <h3 class="text-3xl font-bold mb-1">UGX {{ number_format($interestEarned) }}</h3>
            <p class="text-sm opacity-75">This year</p>
        </div>
    </div>

    <!-- Accounts List -->
    <div class="space-y-4">
        @forelse($accounts as $account)
        <div class="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:border-green-500 transition-colors">
            <div class="p-6">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <!-- Account Info -->
                    <div class="flex items-start gap-4 flex-1">
                        <div class="w-14 h-14 bg-{{ $account->type_color }}-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <span class="material-icons-round text-2xl text-{{ $account->type_color }}-500">
                                {{ $account->type_icon }}
                            </span>
                        </div>
                        <div class="flex-1">
                            <h5 class="text-xl font-semibold text-white mb-1">{{ $account->type_name }}</h5>
                            <p class="text-sm text-gray-400 mb-2">{{ $account->account_number }}</p>
                            <div class="flex flex-wrap items-center gap-2">
                                <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium {{ $account->status === 'active' ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300' }}">
                                    {{ ucfirst($account->status) }}
                                </span>
                                @if($account->interest_rate > 0)
                                <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-600/20 text-blue-400">
                                    {{ $account->interest_rate }}% Interest
                                </span>
                                @endif
                            </div>
                        </div>
                    </div>

                    <!-- Balance & Actions -->
                    <div class="flex flex-col md:items-end gap-3">
                        <div class="text-left md:text-right">
                            <p class="text-sm text-gray-400 mb-1">Current Balance</p>
                            <h4 class="text-2xl font-bold text-white">{{ $account->formatted_balance }}</h4>
                            @if($account->minimum_balance_ugx > 0 && $account->available_balance < $account->balance_ugx)
                            <p class="text-xs text-gray-500 mt-1">Available: {{ $account->formatted_available_balance }}</p>
                            @endif
                        </div>
                        <div class="flex flex-wrap gap-2">
                            <a href="{{ route('sacco.accounts.show', $account->id) }}" class="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                <span class="material-icons-round text-sm">visibility</span>
                                View Details
                            </a>
                            @if($account->can_deposit)
                            <a href="{{ route('sacco.deposits.create', ['account' => $account->id]) }}" class="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                <span class="material-icons-round text-sm">add</span>
                                Deposit
                            </a>
                            @endif
                            @if($account->can_withdraw)
                            <a href="{{ route('sacco.withdrawals.create', ['account' => $account->id]) }}" class="inline-flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                <span class="material-icons-round text-sm">remove</span>
                                Withdraw
                            </a>
                            @endif
                        </div>
                    </div>
                </div>

                <!-- Account Details (Collapsible) -->
                <details class="mt-4 pt-4 border-t border-gray-700">
                    <summary class="cursor-pointer text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                        <span class="material-icons-round text-sm">info</span>
                        Account Details
                    </summary>
                    <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <p class="text-gray-500 mb-1">Opened On</p>
                            <p class="text-white">{{ $account->created_at->format('M d, Y') }}</p>
                        </div>
                        @if($account->last_transaction_at)
                        <div>
                            <p class="text-gray-500 mb-1">Last Transaction</p>
                            <p class="text-white">{{ $account->last_transaction_at->diffForHumans() }}</p>
                        </div>
                        @endif
                        <div>
                            <p class="text-gray-500 mb-1">Minimum Balance</p>
                            <p class="text-white">UGX {{ number_format($account->minimum_balance) }}</p>
                        </div>
                        @if($account->interest_rate > 0)
                        <div>
                            <p class="text-gray-500 mb-1">Interest Rate</p>
                            <p class="text-white">{{ $account->interest_rate }}% p.a.</p>
                        </div>
                        @endif
                    </div>
                </details>
            </div>
        </div>
        @empty
        <div class="bg-gray-800 border border-gray-700 rounded-xl p-12 text-center">
            <span class="material-icons-round text-6xl text-gray-700 mb-4">account_balance_wallet</span>
            <p class="text-gray-400 mb-4">No accounts found</p>
            <a href="{{ route('sacco.dashboard') }}" class="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                <span class="material-icons-round text-sm">arrow_back</span>
                Back to Dashboard
            </a>
        </div>
        @endforelse
    </div>

    <!-- Account Types Info -->
    <div class="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h5 class="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <span class="material-icons-round text-green-500">info</span>
            Understanding Your Accounts
        </h5>
        <div class="grid md:grid-cols-3 gap-6">
            <div>
                <div class="flex items-center gap-2 mb-2">
                    <span class="material-icons-round text-green-500">savings</span>
                    <h6 class="font-semibold text-white">Savings Account</h6>
                </div>
                <p class="text-sm text-gray-400">For regular deposits and withdrawals. Earns interest and can be used for daily transactions.</p>
            </div>
            <div>
                <div class="flex items-center gap-2 mb-2">
                    <span class="material-icons-round text-blue-500">pie_chart</span>
                    <h6 class="font-semibold text-white">Shares Account</h6>
                </div>
                <p class="text-sm text-gray-400">Your ownership stake in the SACCO. Determines borrowing capacity and dividend eligibility.</p>
            </div>
            <div>
                <div class="flex items-center gap-2 mb-2">
                    <span class="material-icons-round text-purple-500">lock</span>
                    <h6 class="font-semibold text-white">Fixed Deposit</h6>
                </div>
                <p class="text-sm text-gray-400">Lock funds for a fixed period to earn higher interest rates. Cannot be withdrawn before maturity.</p>
            </div>
        </div>
    </div>
</div>
@endsection
