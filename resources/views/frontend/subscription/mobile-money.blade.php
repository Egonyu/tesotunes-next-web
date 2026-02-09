@extends('frontend.layouts.music')

@section('title', 'Mobile Money Payment')

@section('content')
<div class="container mx-auto px-6 py-8">
    <div class="max-w-2xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-white mb-2">Mobile Money Payment</h1>
            <p class="text-gray-400">Pay for your subscription using Mobile Money</p>
        </div>

        <!-- Payment Form -->
        <div class="bg-gray-800 rounded-lg p-8">
            <form method="POST" action="{{ route('frontend.subscription.subscribe', 'premium') }}" x-data="mobileMoneyForm()">
                @csrf
                <input type="hidden" name="payment_method" value="mobile_money">

                <!-- Plan Selection -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-300 mb-3">Select Plan</label>
                    <div class="grid gap-3">
                        <label class="flex items-center p-4 border border-gray-600 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                            <input type="radio" name="plan" value="premium-monthly" x-model="selectedPlan" class="text-green-600 focus:ring-green-500">
                            <div class="ml-3 flex-1">
                                <div class="flex justify-between">
                                    <span class="text-white font-medium">Premium Monthly</span>
                                    <span class="text-white font-bold">$9.99/month</span>
                                </div>
                                <p class="text-gray-400 text-sm">Billed monthly</p>
                            </div>
                        </label>

                        <label class="flex items-center p-4 border border-gray-600 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                            <input type="radio" name="plan" value="premium-yearly" x-model="selectedPlan" class="text-green-600 focus:ring-green-500">
                            <div class="ml-3 flex-1">
                                <div class="flex justify-between">
                                    <span class="text-white font-medium">Premium Yearly</span>
                                    <span class="text-white font-bold">$99.99/year</span>
                                </div>
                                <p class="text-gray-400 text-sm">Save $20 annually</p>
                            </div>
                        </label>
                    </div>
                </div>

                <!-- Mobile Money Provider -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-300 mb-3">Mobile Money Provider</label>
                    <div class="grid gap-3">
                        <label class="flex items-center p-4 border border-gray-600 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                            <input type="radio" name="provider" value="mtn" x-model="selectedProvider" class="text-green-600 focus:ring-green-500">
                            <div class="ml-3 flex items-center gap-3">
                                <div class="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                                    <span class="text-black font-bold text-sm">M</span>
                                </div>
                                <span class="text-white font-medium">MTN Mobile Money</span>
                            </div>
                        </label>

                        <label class="flex items-center p-4 border border-gray-600 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                            <input type="radio" name="provider" value="airtel" x-model="selectedProvider" class="text-green-600 focus:ring-green-500">
                            <div class="ml-3 flex items-center gap-3">
                                <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                    <span class="text-white font-bold text-sm">A</span>
                                </div>
                                <span class="text-white font-medium">Airtel Money</span>
                            </div>
                        </label>
                    </div>
                </div>

                <!-- Phone Number -->
                <div class="mb-6">
                    <label for="phone" class="block text-sm font-medium text-gray-300 mb-2">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        x-model="phoneNumber"
                        class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-green-500 focus:outline-none"
                        placeholder="Enter your mobile money number"
                    >
                    <p class="text-gray-500 text-sm mt-1">
                        Make sure this number is registered for mobile money
                    </p>
                </div>

                <!-- Payment Summary -->
                <div class="bg-gray-700 rounded-lg p-4 mb-6">
                    <h3 class="text-lg font-semibold text-white mb-3">Payment Summary</h3>
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span class="text-gray-300">Plan</span>
                            <span class="text-white" x-text="getPlanName()">Select a plan</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-300">Amount</span>
                            <span class="text-white font-bold" x-text="getPlanPrice()">$0.00</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-300">Payment Method</span>
                            <span class="text-white" x-text="getProviderName()">Select provider</span>
                        </div>
                    </div>
                </div>

                <!-- Terms -->
                <div class="mb-6">
                    <label class="flex items-start gap-3">
                        <input
                            type="checkbox"
                            name="terms"
                            required
                            class="w-4 h-4 mt-1 rounded border-gray-600 bg-gray-700 text-green-600 focus:ring-green-500"
                        >
                        <span class="text-gray-300 text-sm">
                            I agree to the subscription terms and authorize automatic renewal of my subscription
                        </span>
                    </label>
                </div>

                <!-- Submit Button -->
                <button
                    type="submit"
                    :disabled="!selectedPlan || !selectedProvider || !phoneNumber"
                    class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                    Pay with Mobile Money
                </button>
            </form>
        </div>

        <!-- How it Works -->
        <div class="mt-8 bg-gray-800 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-white mb-4">How Mobile Money Payment Works</h3>
            <div class="space-y-3 text-gray-300">
                <div class="flex items-start gap-3">
                    <span class="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">1</span>
                    <p>Select your preferred plan and mobile money provider</p>
                </div>
                <div class="flex items-start gap-3">
                    <span class="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">2</span>
                    <p>Enter your mobile money registered phone number</p>
                </div>
                <div class="flex items-start gap-3">
                    <span class="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">3</span>
                    <p>You'll receive a payment prompt on your phone</p>
                </div>
                <div class="flex items-start gap-3">
                    <span class="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">4</span>
                    <p>Enter your PIN to complete the payment</p>
                </div>
                <div class="flex items-start gap-3">
                    <span class="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">5</span>
                    <p>Your subscription will be activated immediately</p>
                </div>
            </div>
        </div>

        <!-- Back Link -->
        <div class="mt-6 text-center">
            <a href="{{ route('frontend.subscription.plans') }}"
               class="text-green-500 hover:text-green-400 font-medium">
                ← Back to Plans
            </a>
        </div>
    </div>
</div>

@push('scripts')
<script>
function mobileMoneyForm() {
    return {
        selectedPlan: '',
        selectedProvider: '',
        phoneNumber: '',

        getPlanName() {
            if (this.selectedPlan === 'premium-monthly') return 'Premium Monthly';
            if (this.selectedPlan === 'premium-yearly') return 'Premium Yearly';
            return 'Select a plan';
        },

        getPlanPrice() {
            if (this.selectedPlan === 'premium-monthly') return '$9.99';
            if (this.selectedPlan === 'premium-yearly') return '$99.99';
            return '$0.00';
        },

        getProviderName() {
            if (this.selectedProvider === 'mtn') return 'MTN Mobile Money';
            if (this.selectedProvider === 'airtel') return 'Airtel Money';
            return 'Select provider';
        }
    }
}
</script>
@endpush
@endsection