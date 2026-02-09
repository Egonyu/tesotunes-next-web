@extends('frontend.layouts.sacco')

@section('title', 'Loan Details - SACCO')

@section('content')
<div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h2 class="text-3xl font-bold text-white">Loan #{{ $loan->loan_number }}</h2>
            <p class="text-gray-400">{{ $loan->loanProduct->name }}</p>
        </div>
        <div class="flex gap-3">
            <a href="{{ route('sacco.loans.index') }}" class="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                <span class="material-icons-round text-sm">arrow_back</span>
                My Loans
            </a>
            @if($loan->status === 'active' || $loan->status === 'disbursed')
            <a href="{{ route('sacco.loans.payment', $loan) }}" 
                    class="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                <span class="material-icons-round text-sm">payment</span>
                Make Payment
            </a>
            @endif
        </div>
    </div>

    <!-- Status Banner -->
    <div class="bg-{{ $loan->status === 'active' || $loan->status === 'disbursed' ? 'green' : ($loan->status === 'pending' ? 'yellow' : 'gray') }}-800 rounded-xl p-6">
        <div class="flex items-center gap-4">
            <span class="material-icons-round text-5xl text-white">
                {{ $loan->status === 'active' ? 'check_circle' : ($loan->status === 'pending' ? 'pending' : 'done_all') }}
            </span>
            <div>
                <h3 class="text-2xl font-bold text-white mb-1">{{ ucfirst($loan->status) }}</h3>
                <p class="text-gray-300">
                    @if($loan->status === 'pending')
                        Your application is under review. We'll notify you once it's processed.
                    @elseif($loan->status === 'active' || $loan->status === 'disbursed')
                        Your loan is active. Make regular payments to maintain a good credit score.
                    @elseif($loan->status === 'completed' || $loan->status === 'cleared')
                        Congratulations! You've successfully repaid this loan.
                    @else
                        {{ $loan->status }}
                    @endif
                </p>
            </div>
        </div>
    </div>

    <!-- Loan Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-gray-800 rounded-xl p-6">
            <p class="text-sm text-gray-400 mb-2">Principal Amount</p>
            <p class="text-2xl font-bold text-white">UGX {{ number_format($loan->principal_amount) }}</p>
        </div>

        <div class="bg-gray-800 rounded-xl p-6">
            <p class="text-sm text-gray-400 mb-2">Interest Rate</p>
            <p class="text-2xl font-bold text-white">{{ $loan->interest_rate }}%</p>
            <p class="text-xs text-gray-500">{{ $loan->loanProduct->interest_rate_type }}</p>
        </div>

        <div class="bg-gray-800 rounded-xl p-6">
            <p class="text-sm text-gray-400 mb-2">Duration</p>
            <p class="text-2xl font-bold text-white">{{ $loan->duration_months }} months</p>
        </div>

        <div class="bg-gray-800 rounded-xl p-6">
            <p class="text-sm text-gray-400 mb-2">Monthly Payment</p>
            <p class="text-2xl font-bold text-white">UGX {{ number_format($loan->monthly_payment) }}</p>
        </div>
    </div>

    <!-- Repayment Progress -->
    <div class="bg-gray-800 rounded-xl p-6">
        <h3 class="text-xl font-bold text-white mb-6">Repayment Progress</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
                <p class="text-sm text-gray-400 mb-2">Total Amount Due</p>
                <p class="text-3xl font-bold text-white">UGX {{ number_format($loan->total_amount) }}</p>
            </div>
            <div>
                <p class="text-sm text-gray-400 mb-2">Amount Repaid</p>
                <p class="text-3xl font-bold text-green-500">UGX {{ number_format($loan->total_repaid) }}</p>
            </div>
            <div>
                <p class="text-sm text-gray-400 mb-2">Outstanding Balance</p>
                <p class="text-3xl font-bold text-red-500">UGX {{ number_format($loan->outstanding_balance) }}</p>
            </div>
        </div>

        @php
            $progress = $loan->total_amount > 0 ? ($loan->total_repaid / $loan->total_amount) * 100 : 0;
        @endphp
        <div>
            <div class="flex justify-between text-sm text-gray-400 mb-2">
                <span>Repayment Progress</span>
                <span>{{ number_format($progress, 1) }}%</span>
            </div>
            <div class="w-full bg-gray-700 rounded-full h-4">
                <div class="bg-green-600 h-4 rounded-full transition-all" style="width: {{ $progress }}%"></div>
            </div>
        </div>
    </div>

    <!-- Loan Details -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-gray-800 rounded-xl p-6">
            <h3 class="text-xl font-bold text-white mb-4">Loan Details</h3>
            <div class="space-y-3">
                <div class="flex justify-between">
                    <span class="text-gray-400">Application Date</span>
                    <span class="text-white font-medium">{{ $loan->created_at->format('M d, Y') }}</span>
                </div>
                @if($loan->approved_at)
                <div class="flex justify-between">
                    <span class="text-gray-400">Approved Date</span>
                    <span class="text-white font-medium">{{ $loan->approved_at->format('M d, Y') }}</span>
                </div>
                @endif
                @if($loan->disbursed_at)
                <div class="flex justify-between">
                    <span class="text-gray-400">Disbursed Date</span>
                    <span class="text-white font-medium">{{ $loan->disbursed_at->format('M d, Y') }}</span>
                </div>
                @endif
                <div class="flex justify-between">
                    <span class="text-gray-400">Start Date</span>
                    <span class="text-white font-medium">{{ $loan->start_date?->format('M d, Y') ?? 'Pending' }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-400">End Date</span>
                    <span class="text-white font-medium">{{ $loan->end_date?->format('M d, Y') ?? 'Pending' }}</span>
                </div>
                @if($loan->cleared_at)
                <div class="flex justify-between">
                    <span class="text-gray-400">Cleared Date</span>
                    <span class="text-white font-medium">{{ $loan->cleared_at->format('M d, Y') }}</span>
                </div>
                @endif
            </div>
        </div>

        <div class="bg-gray-800 rounded-xl p-6">
            <h3 class="text-xl font-bold text-white mb-4">Fees & Charges</h3>
            <div class="space-y-3">
                <div class="flex justify-between">
                    <span class="text-gray-400">Processing Fee</span>
                    <span class="text-white font-medium">UGX {{ number_format($loan->processing_fee) }}</span>
                </div>
                @if($loan->insurance_fee > 0)
                <div class="flex justify-between">
                    <span class="text-gray-400">Insurance Fee</span>
                    <span class="text-white font-medium">UGX {{ number_format($loan->insurance_fee) }}</span>
                </div>
                @endif
                <div class="flex justify-between">
                    <span class="text-gray-400">Total Interest</span>
                    <span class="text-white font-medium">UGX {{ number_format($loan->total_interest) }}</span>
                </div>
                @if($loan->late_payment_penalties > 0)
                <div class="flex justify-between">
                    <span class="text-gray-400">Late Payment Penalties</span>
                    <span class="text-red-500 font-medium">UGX {{ number_format($loan->late_payment_penalties) }}</span>
                </div>
                @endif
            </div>
        </div>
    </div>

    <!-- Repayment History -->
    @if($repayments->count() > 0)
    <div class="bg-gray-800 rounded-xl p-6">
        <h3 class="text-xl font-bold text-white mb-6">Repayment History</h3>
        
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead>
                    <tr class="border-b border-gray-700">
                        <th class="text-left text-sm font-medium text-gray-400 pb-3">Date</th>
                        <th class="text-left text-sm font-medium text-gray-400 pb-3">Amount</th>
                        <th class="text-left text-sm font-medium text-gray-400 pb-3">Principal</th>
                        <th class="text-left text-sm font-medium text-gray-400 pb-3">Interest</th>
                        <th class="text-left text-sm font-medium text-gray-400 pb-3">Balance After</th>
                        <th class="text-left text-sm font-medium text-gray-400 pb-3">Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-700">
                    @foreach($repayments as $repayment)
                    <tr>
                        <td class="py-3 text-white">{{ $repayment->created_at->format('M d, Y') }}</td>
                        <td class="py-3 text-white font-medium">UGX {{ number_format($repayment->amount) }}</td>
                        <td class="py-3 text-gray-300">UGX {{ number_format($repayment->principal_amount ?? 0) }}</td>
                        <td class="py-3 text-gray-300">UGX {{ number_format($repayment->interest_amount ?? 0) }}</td>
                        <td class="py-3 text-gray-300">UGX {{ number_format($repayment->balance_after) }}</td>
                        <td class="py-3">
                            <span class="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                                {{ ucfirst($repayment->status) }}
                            </span>
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <div class="mt-4">
            {{ $repayments->links() }}
        </div>
    </div>
    @endif
</div>
@endsection
