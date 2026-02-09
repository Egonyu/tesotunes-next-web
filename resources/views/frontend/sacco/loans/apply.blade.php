@extends('frontend.layouts.sacco')

@section('title', 'Apply for Loan - SACCO')

@section('content')
<div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h2 class="text-3xl font-bold text-white">Apply for Loan</h2>
            <p class="text-gray-400">Choose a loan product and submit your application</p>
        </div>
        <div class="flex gap-3">
            <a href="{{ route('sacco.loans.index') }}" class="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                <span class="material-icons-round text-sm">arrow_back</span>
                Back to Loans
            </a>
        </div>
    </div>

    <!-- Eligibility Check -->
    <div class="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div class="flex items-start gap-4">
            <span class="material-icons-round text-4xl">info</span>
            <div class="flex-1">
                <h3 class="text-xl font-bold mb-2">Your Loan Eligibility</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                        <p class="text-sm opacity-90">Savings Balance</p>
                        <p class="text-2xl font-bold">UGX {{ number_format($savingsBalance) }}</p>
                    </div>
                    <div>
                        <p class="text-sm opacity-90">Maximum Loan Amount</p>
                        <p class="text-2xl font-bold">UGX {{ number_format($maxLoanAmount) }}</p>
                    </div>
                    <div>
                        <p class="text-sm opacity-90">Loan to Savings Ratio</p>
                        <p class="text-2xl font-bold">{{ config('sacco.loans.max_loan_to_savings_ratio', 3) }}:1</p>
                    </div>
                </div>
                @if($savingsBalance < 10000)
                <div class="mt-4 p-4 bg-yellow-600 bg-opacity-50 rounded-lg">
                    <p class="text-sm">⚠️ Your savings balance is low. We recommend having at least UGX 10,000 in savings before applying for a loan.</p>
                </div>
                @endif
            </div>
        </div>
    </div>

    <!-- Loan Products -->
    <div class="space-y-4">
        <h3 class="text-xl font-bold text-white">Available Loan Products</h3>
        
        @forelse($products as $product)
        <div class="bg-gray-800 rounded-xl p-6 border-2 border-gray-700 hover:border-green-600 transition-colors cursor-pointer" 
             onclick="selectProduct({{ $product->id }})">
            <div class="flex items-start justify-between gap-4">
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                        <h4 class="text-xl font-bold text-white">{{ $product->name }}</h4>
                        @if($product->is_featured)
                        <span class="px-2 py-1 bg-green-600 text-white text-xs rounded-full">Popular</span>
                        @endif
                    </div>
                    <p class="text-gray-400 mb-4">{{ $product->description }}</p>
                    
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p class="text-sm text-gray-400">Interest Rate</p>
                            <p class="text-lg font-bold text-white">{{ $product->interest_rate }}% {{ $product->interest_rate_type }}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-400">Max Amount</p>
                            <p class="text-lg font-bold text-white">UGX {{ number_format($product->max_amount) }}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-400">Max Duration</p>
                            <p class="text-lg font-bold text-white">{{ $product->max_duration_months }} months</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-400">Processing Fee</p>
                            <p class="text-lg font-bold text-white">{{ $product->processing_fee_percentage }}%</p>
                        </div>
                    </div>
                </div>
                <button type="button" onclick="selectProduct({{ $product->id }})" 
                        class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap">
                    Select
                </button>
            </div>
        </div>
        @empty
        <div class="bg-gray-800 rounded-xl p-8 text-center">
            <span class="material-icons-round text-6xl text-gray-600 mb-4">sentiment_dissatisfied</span>
            <p class="text-gray-400">No loan products available at this time.</p>
        </div>
        @endforelse
    </div>

    <!-- Application Form (Hidden by default) -->
    <div id="applicationForm" class="hidden bg-gray-800 rounded-xl p-6">
        <h3 class="text-xl font-bold text-white mb-6">Loan Application Form</h3>
        
        <form action="{{ route('sacco.loans.submit') }}" method="POST" class="space-y-6">
            @csrf
            
            <input type="hidden" name="loan_product_id" id="selectedProductId">
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Loan Amount (UGX)</label>
                    <input type="number" name="amount" required min="1000" max="{{ $maxLoanAmount }}" 
                           class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-600"
                           placeholder="Enter amount">
                    <p class="text-xs text-gray-500 mt-1">Maximum: UGX {{ number_format($maxLoanAmount) }}</p>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Loan Duration (months)</label>
                    <select name="duration_months" required 
                            class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-600">
                        <option value="">Select duration</option>
                        <option value="3">3 months</option>
                        <option value="6">6 months</option>
                        <option value="12">12 months</option>
                        <option value="18">18 months</option>
                        <option value="24">24 months</option>
                    </select>
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Purpose of Loan</label>
                <textarea name="purpose" required rows="4" 
                          class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-600"
                          placeholder="Explain why you need this loan..."></textarea>
            </div>

            <div class="bg-gray-700 rounded-lg p-4">
                <h4 class="font-medium text-white mb-2">Terms and Conditions</h4>
                <div class="text-sm text-gray-400 space-y-1">
                    <p>• I understand that this loan will accrue interest as specified in the loan product</p>
                    <p>• I agree to make monthly repayments on time</p>
                    <p>• I understand that late payments may affect my credit score</p>
                    <p>• I authorize SACCO to deduct repayments from my accounts</p>
                </div>
                <label class="flex items-center gap-2 mt-4">
                    <input type="checkbox" name="terms_accepted" required class="rounded">
                    <span class="text-white">I agree to the terms and conditions</span>
                </label>
            </div>

            <div class="flex justify-end gap-3">
                <button type="button" onclick="document.getElementById('applicationForm').classList.add('hidden')" 
                        class="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    Cancel
                </button>
                <button type="submit" 
                        class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    Submit Application
                </button>
            </div>
        </form>
    </div>
</div>

<script>
function selectProduct(productId) {
    document.getElementById('selectedProductId').value = productId;
    document.getElementById('applicationForm').classList.remove('hidden');
    document.getElementById('applicationForm').scrollIntoView({ behavior: 'smooth' });
}
</script>
@endsection
