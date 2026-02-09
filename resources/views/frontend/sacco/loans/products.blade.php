@extends('frontend.layouts.sacco')

@section('title', 'Loan Products - SACCO')

@section('content')
<div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h2 class="text-3xl font-bold text-white">Loan Products</h2>
            <p class="text-gray-400">Choose the perfect loan for your needs</p>
        </div>
        <div class="flex gap-3">
            <a href="{{ route('sacco.loans.index') }}" class="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                <span class="material-icons-round text-sm">arrow_back</span>
                My Loans
            </a>
        </div>
    </div>

    <!-- Eligibility Info -->
    @if(auth()->user()->saccoMember)
    <div class="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div class="flex items-start gap-4">
            <span class="material-icons-round text-4xl">verified_user</span>
            <div class="flex-1">
                <h3 class="text-xl font-bold mb-2">Your Loan Eligibility</h3>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <p class="text-sm opacity-90">Credit Score</p>
                        <p class="text-2xl font-bold">{{ auth()->user()->saccoMember->credit_score ?? 0 }}/100</p>
                    </div>
                    <div>
                        <p class="text-sm opacity-90">Savings Balance</p>
                        <p class="text-2xl font-bold">UGX {{ number_format(auth()->user()->saccoMember->total_savings) }}</p>
                    </div>
                    <div>
                        <p class="text-sm opacity-90">Membership Tier</p>
                        <p class="text-2xl font-bold">{{ ucfirst(auth()->user()->saccoMember->membership_tier ?? 'basic') }}</p>
                    </div>
                    <div>
                        <p class="text-sm opacity-90">Loan Access</p>
                        <p class="text-2xl font-bold">
                            @if(auth()->user()->saccoMember->loan_access_enabled)
                                <span class="text-green-300">✓ Enabled</span>
                            @else
                                <span class="text-yellow-300">Pending</span>
                            @endif
                        </p>
                    </div>
                </div>
                
                @if(!auth()->user()->saccoMember->loan_access_enabled)
                <div class="mt-4 p-3 bg-yellow-600 bg-opacity-50 rounded-lg text-sm">
                    ⚠️ Loan access will be enabled {{ auth()->user()->saccoMember->loan_eligible_at ? 'on ' . auth()->user()->saccoMember->loan_eligible_at->format('M d, Y') : 'after meeting eligibility requirements' }}.
                </div>
                @endif
            </div>
        </div>
    </div>
    @endif

    <!-- Loan Products Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        @forelse($products as $product)
        <div class="bg-gray-800 rounded-xl overflow-hidden border-2 {{ $product->is_featured ? 'border-green-600' : 'border-gray-700' }} hover:border-green-600 transition-colors">
            <!-- Product Header -->
            <div class="bg-gradient-to-r {{ $product->is_featured ? 'from-green-600 to-green-700' : 'from-gray-700 to-gray-800' }} p-6 text-white">
                <div class="flex items-start justify-between mb-3">
                    <div>
                        <h3 class="text-2xl font-bold mb-1">{{ $product->name }}</h3>
                        <p class="opacity-90">{{ $product->description }}</p>
                    </div>
                    @if($product->is_featured)
                    <span class="px-3 py-1 bg-yellow-500 text-gray-900 text-xs rounded-full font-bold">
                        POPULAR
                    </span>
                    @endif
                </div>
                
                <div class="text-3xl font-bold mt-4">
                    {{ $product->interest_rate }}% {{ $product->interest_rate_type }}
                </div>
                <p class="text-sm opacity-75">Interest Rate</p>
            </div>

            <!-- Product Details -->
            <div class="p-6">
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <p class="text-sm text-gray-400 mb-1">Minimum Amount</p>
                        <p class="text-lg font-bold text-white">UGX {{ number_format($product->min_amount) }}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-400 mb-1">Maximum Amount</p>
                        <p class="text-lg font-bold text-white">UGX {{ number_format($product->max_amount) }}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-400 mb-1">Min Duration</p>
                        <p class="text-lg font-bold text-white">{{ $product->min_duration_months }} months</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-400 mb-1">Max Duration</p>
                        <p class="text-lg font-bold text-white">{{ $product->max_duration_months }} months</p>
                    </div>
                </div>

                <!-- Fees -->
                <div class="bg-gray-700 rounded-lg p-4 mb-6">
                    <h4 class="font-semibold text-white mb-3">Fees & Charges</h4>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-400">Processing Fee</span>
                            <span class="text-white font-medium">{{ $product->processing_fee_percentage }}%</span>
                        </div>
                        @if($product->late_payment_penalty_percentage > 0)
                        <div class="flex justify-between">
                            <span class="text-gray-400">Late Payment Penalty</span>
                            <span class="text-white font-medium">{{ $product->late_payment_penalty_percentage }}%</span>
                        </div>
                        @endif
                        @if($product->insurance_fee_percentage > 0)
                        <div class="flex justify-between">
                            <span class="text-gray-400">Insurance Fee</span>
                            <span class="text-white font-medium">{{ $product->insurance_fee_percentage }}%</span>
                        </div>
                        @endif
                    </div>
                </div>

                <!-- Requirements -->
                <div class="mb-6">
                    <h4 class="font-semibold text-white mb-3">Requirements</h4>
                    <ul class="space-y-2 text-sm text-gray-300">
                        @if($product->min_credit_score > 0)
                        <li class="flex items-center gap-2">
                            <span class="material-icons-round text-sm text-green-500">check_circle</span>
                            Credit score: {{ $product->min_credit_score }}+
                        </li>
                        @endif
                        @if($product->min_savings_balance > 0)
                        <li class="flex items-center gap-2">
                            <span class="material-icons-round text-sm text-green-500">check_circle</span>
                            Savings balance: UGX {{ number_format($product->min_savings_balance) }}+
                        </li>
                        @endif
                        @if($product->min_membership_months > 0)
                        <li class="flex items-center gap-2">
                            <span class="material-icons-round text-sm text-green-500">check_circle</span>
                            Member for {{ $product->min_membership_months }}+ months
                        </li>
                        @endif
                        @if($product->requires_guarantor)
                        <li class="flex items-center gap-2">
                            <span class="material-icons-round text-sm text-green-500">check_circle</span>
                            {{ $product->guarantor_count }} guarantor(s) required
                        </li>
                        @endif
                        @if($product->requires_collateral)
                        <li class="flex items-center gap-2">
                            <span class="material-icons-round text-sm text-green-500">check_circle</span>
                            Collateral required
                        </li>
                        @endif
                    </ul>
                </div>

                <!-- Example Calculation -->
                @php
                    $exampleAmount = ($product->min_amount + $product->max_amount) / 2;
                    $exampleDuration = $product->max_duration_months;
                    $monthlyInterest = $product->interest_rate / 12 / 100;
                    $monthlyPayment = $exampleAmount * ($monthlyInterest * pow(1 + $monthlyInterest, $exampleDuration)) / (pow(1 + $monthlyInterest, $exampleDuration) - 1);
                    $totalPayment = $monthlyPayment * $exampleDuration;
                @endphp
                <div class="bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg p-4 mb-6">
                    <h4 class="font-semibold text-white mb-3">Example Calculation</h4>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-300">Loan Amount</span>
                            <span class="text-white font-medium">UGX {{ number_format($exampleAmount) }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-300">Duration</span>
                            <span class="text-white font-medium">{{ $exampleDuration }} months</span>
                        </div>
                        <div class="h-px bg-blue-700"></div>
                        <div class="flex justify-between">
                            <span class="text-gray-300">Monthly Payment</span>
                            <span class="text-white font-bold">UGX {{ number_format($monthlyPayment) }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-300">Total Repayment</span>
                            <span class="text-white font-bold">UGX {{ number_format($totalPayment) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Apply Button -->
                <a href="{{ route('sacco.loans.apply') }}" 
                   class="block w-full bg-green-600 hover:bg-green-700 text-white text-center px-6 py-3 rounded-lg font-medium transition-colors">
                    Apply for This Loan
                </a>
            </div>
        </div>
        @empty
        <div class="col-span-2 bg-gray-800 rounded-xl p-12 text-center">
            <span class="material-icons-round text-6xl text-gray-600 mb-4">credit_card_off</span>
            <h3 class="text-xl font-bold text-white mb-2">No Loan Products Available</h3>
            <p class="text-gray-400">Check back later for new loan products.</p>
        </div>
        @endforelse
    </div>

    <!-- Information Section -->
    <div class="bg-gray-800 rounded-xl p-6">
        <h3 class="text-xl font-bold text-white mb-4">How Loans Work</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
                <div class="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-3">
                    <span class="material-icons-round text-white">request_quote</span>
                </div>
                <h4 class="font-semibold text-white mb-2">1. Apply</h4>
                <p class="text-sm text-gray-400">Choose a loan product and submit your application with required details.</p>
            </div>
            <div>
                <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-3">
                    <span class="material-icons-round text-white">fact_check</span>
                </div>
                <h4 class="font-semibold text-white mb-2">2. Review</h4>
                <p class="text-sm text-gray-400">Our team reviews your application and credit profile within 48 hours.</p>
            </div>
            <div>
                <div class="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mb-3">
                    <span class="material-icons-round text-white">account_balance_wallet</span>
                </div>
                <h4 class="font-semibold text-white mb-2">3. Receive Funds</h4>
                <p class="text-sm text-gray-400">Once approved, funds are disbursed directly to your SACCO account.</p>
            </div>
        </div>
    </div>
</div>
@endsection
