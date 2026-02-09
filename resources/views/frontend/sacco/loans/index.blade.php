@extends('frontend.layouts.sacco')

@section('title', 'My Loans - SACCO')

@section('content')
<div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h2 class="text-3xl font-bold text-white">My Loans</h2>
            <p class="text-gray-400">Manage your SACCO loans and applications</p>
        </div>
        <div class="flex gap-3">
            <a href="{{ route('sacco.loans.products') }}" class="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                <span class="material-icons-round text-sm">view_list</span>
                Loan Products
            </a>
            <a href="{{ route('sacco.loans.apply') }}" class="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                <span class="material-icons-round text-sm">add</span>
                Apply for Loan
            </a>
        </div>
    </div>

    <!-- Loan Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
            <div class="flex items-center justify-between mb-4">
                <span class="text-sm font-medium opacity-90">Active Loans</span>
                <span class="material-icons-round text-2xl opacity-75">account_balance</span>
            </div>
            <h3 class="text-3xl font-bold mb-1">{{ $loans->whereIn('status', ['active', 'disbursed'])->count() }}</h3>
            <p class="text-sm opacity-75">Total borrowed</p>
        </div>

        <div class="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white">
            <div class="flex items-center justify-between mb-4">
                <span class="text-sm font-medium opacity-90">Total Borrowed</span>
                <span class="material-icons-round text-2xl opacity-75">payments</span>
            </div>
            <h3 class="text-3xl font-bold mb-1">UGX {{ number_format($loans->whereIn('status', ['active', 'disbursed'])->sum('principal_amount')) }}</h3>
            <p class="text-sm opacity-75">Principal amount</p>
        </div>

        <div class="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl p-6 text-white">
            <div class="flex items-center justify-between mb-4">
                <span class="text-sm font-medium opacity-90">Amount Repaid</span>
                <span class="material-icons-round text-2xl opacity-75">trending_up</span>
            </div>
            <h3 class="text-3xl font-bold mb-1">UGX {{ number_format($loans->sum('total_repaid')) }}</h3>
            <p class="text-sm opacity-75">All time</p>
        </div>

        <div class="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white">
            <div class="flex items-center justify-between mb-4">
                <span class="text-sm font-medium opacity-90">Outstanding Balance</span>
                <span class="material-icons-round text-2xl opacity-75">account_balance_wallet</span>
            </div>
            <h3 class="text-3xl font-bold mb-1">UGX {{ number_format($loans->whereIn('status', ['active', 'disbursed'])->sum('outstanding_balance')) }}</h3>
            <p class="text-sm opacity-75">To be paid</p>
        </div>
    </div>

    <!-- Active Loans -->
    @if($loans->whereIn('status', ['active', 'disbursed'])->count() > 0)
    <div class="space-y-4">
        <h3 class="text-xl font-bold text-white">Active Loans</h3>
        
        @foreach($loans->whereIn('status', ['active', 'disbursed']) as $loan)
        <div class="bg-gray-800 rounded-xl p-6 border-2 border-gray-700 hover:border-green-600 transition-colors">
            <div class="flex items-start justify-between gap-4 mb-4">
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                        <h4 class="text-xl font-bold text-white">{{ $loan->loanProduct->name }}</h4>
                        <span class="px-3 py-1 bg-green-600 text-white text-xs rounded-full">
                            {{ ucfirst($loan->status) }}
                        </span>
                    </div>
                    <p class="text-gray-400">Loan #{{ $loan->loan_number }}</p>
                    <p class="text-sm text-gray-500">Disbursed: {{ $loan->disbursed_at?->format('M d, Y') ?? 'Pending' }}</p>
                </div>
                <a href="{{ route('sacco.loans.show', $loan) }}" 
                   class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                    View Details
                </a>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                    <p class="text-sm text-gray-400">Principal</p>
                    <p class="text-lg font-bold text-white">UGX {{ number_format($loan->principal_amount) }}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-400">Interest Rate</p>
                    <p class="text-lg font-bold text-white">{{ $loan->interest_rate }}%</p>
                </div>
                <div>
                    <p class="text-sm text-gray-400">Duration</p>
                    <p class="text-lg font-bold text-white">{{ $loan->duration_months }} months</p>
                </div>
                <div>
                    <p class="text-sm text-gray-400">Repaid</p>
                    <p class="text-lg font-bold text-green-500">UGX {{ number_format($loan->total_repaid) }}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-400">Outstanding</p>
                    <p class="text-lg font-bold text-red-500">UGX {{ number_format($loan->outstanding_balance) }}</p>
                </div>
            </div>

            <!-- Progress Bar -->
            @php
                $progress = $loan->total_amount > 0 ? ($loan->total_repaid / $loan->total_amount) * 100 : 0;
            @endphp
            <div class="mt-4">
                <div class="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Repayment Progress</span>
                    <span>{{ number_format($progress, 1) }}%</span>
                </div>
                <div class="w-full bg-gray-700 rounded-full h-2">
                    <div class="bg-green-600 h-2 rounded-full transition-all" style="width: {{ $progress }}%"></div>
                </div>
            </div>
        </div>
        @endforeach
    </div>
    @endif

    <!-- Pending Applications -->
    @if($loans->where('status', 'pending')->count() > 0)
    <div class="space-y-4">
        <h3 class="text-xl font-bold text-white">Pending Applications</h3>
        
        @foreach($loans->where('status', 'pending') as $loan)
        <div class="bg-gray-800 rounded-xl p-6 border-2 border-yellow-600">
            <div class="flex items-start justify-between gap-4">
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                        <h4 class="text-xl font-bold text-white">{{ $loan->loanProduct->name }}</h4>
                        <span class="px-3 py-1 bg-yellow-600 text-white text-xs rounded-full">
                            Under Review
                        </span>
                    </div>
                    <p class="text-gray-400">Loan #{{ $loan->loan_number }}</p>
                    <p class="text-sm text-gray-500">Applied: {{ $loan->created_at->format('M d, Y') }}</p>
                </div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                    <p class="text-sm text-gray-400">Requested Amount</p>
                    <p class="text-lg font-bold text-white">UGX {{ number_format($loan->principal_amount) }}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-400">Duration</p>
                    <p class="text-lg font-bold text-white">{{ $loan->duration_months }} months</p>
                </div>
                <div>
                    <p class="text-sm text-gray-400">Interest Rate</p>
                    <p class="text-lg font-bold text-white">{{ $loan->interest_rate }}%</p>
                </div>
                <div>
                    <p class="text-sm text-gray-400">Status</p>
                    <p class="text-sm text-yellow-500">Awaiting approval</p>
                </div>
            </div>
        </div>
        @endforeach
    </div>
    @endif

    <!-- Completed/Cleared Loans -->
    @if($loans->whereIn('status', ['completed', 'cleared'])->count() > 0)
    <div class="space-y-4">
        <h3 class="text-xl font-bold text-white">Completed Loans</h3>
        
        @foreach($loans->whereIn('status', ['completed', 'cleared']) as $loan)
        <div class="bg-gray-800 rounded-xl p-6 opacity-75">
            <div class="flex items-start justify-between gap-4">
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                        <h4 class="text-lg font-bold text-white">{{ $loan->loanProduct->name }}</h4>
                        <span class="px-3 py-1 bg-gray-600 text-white text-xs rounded-full">
                            Completed
                        </span>
                    </div>
                    <p class="text-gray-400">Loan #{{ $loan->loan_number }}</p>
                </div>
                <a href="{{ route('sacco.loans.show', $loan) }}" 
                   class="text-green-500 hover:text-green-400 text-sm">
                    View History →
                </a>
            </div>

            <div class="grid grid-cols-3 gap-4 mt-4">
                <div>
                    <p class="text-sm text-gray-400">Principal</p>
                    <p class="text-white">UGX {{ number_format($loan->principal_amount) }}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-400">Total Paid</p>
                    <p class="text-green-500">UGX {{ number_format($loan->total_repaid) }}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-400">Cleared On</p>
                    <p class="text-white">{{ $loan->cleared_at?->format('M d, Y') ?? 'N/A' }}</p>
                </div>
            </div>
        </div>
        @endforeach
    </div>
    @endif

    <!-- No Loans Message -->
    @if($loans->count() === 0)
    <div class="bg-gray-800 rounded-xl p-12 text-center">
        <span class="material-icons-round text-6xl text-gray-600 mb-4">account_balance</span>
        <h3 class="text-xl font-bold text-white mb-2">No Loans Yet</h3>
        <p class="text-gray-400 mb-6">You haven't applied for any loans. Explore our loan products to get started.</p>
        <div class="flex justify-center gap-3">
            <a href="{{ route('sacco.loans.products') }}" 
               class="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                View Loan Products
            </a>
            <a href="{{ route('sacco.loans.apply') }}" 
               class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Apply for Loan
            </a>
        </div>
    </div>
    @endif
</div>
@endsection
