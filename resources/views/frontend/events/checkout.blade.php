@extends('frontend.layouts.events')

@section('title', 'Checkout - ' . $event->title)

@section('content')
<div class="p-6 max-w-4xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">Checkout</h1>
        <p class="text-gray-400">Complete your registration for {{ $event->title }}</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Checkout Form -->
        <div class="space-y-6">
            <!-- Event Summary -->
            <div class="bg-gray-800 rounded-lg p-6">
                <h2 class="text-xl font-semibold text-white mb-4">Event Details</h2>

                <div class="flex gap-4 mb-4">
                    @if($event->banner_image)
                        <img src="{{ asset('storage/' . $event->banner_image) }}" alt="{{ $event->title }}"
                             class="w-20 h-20 object-cover rounded-lg">
                    @else
                        <div class="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center">
                            <span class="material-icons-round text-gray-500">event</span>
                        </div>
                    @endif

                    <div>
                        <h3 class="text-white font-medium text-lg">{{ $event->title }}</h3>
                        <p class="text-gray-400 text-sm">{{ $event->formatted_date }}</p>
                        <p class="text-gray-400 text-sm">{{ $event->venue_name }}</p>
                    </div>
                </div>

                <!-- Ticket Details -->
                <div class="border-t border-gray-700 pt-4">
                    <h4 class="text-white font-medium mb-3">Ticket Information</h4>
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span class="text-gray-300">Ticket Type:</span>
                            <span class="text-white">{{ $attendee->eventTicket->ticket_type }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-300">Quantity:</span>
                            <span class="text-white">{{ $attendee->quantity }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-300">Price per ticket:</span>
                            <span class="text-white">UGX {{ number_format($attendee->eventTicket->price) }}</span>
                        </div>
                        <div class="flex justify-between font-semibold text-lg border-t border-gray-700 pt-2 mt-3">
                            <span class="text-white">Total:</span>
                            <span class="text-green-400">UGX {{ number_format($attendee->amount_paid) }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Payment Method -->
            <div class="bg-gray-800 rounded-lg p-6">
                <h2 class="text-xl font-semibold text-white mb-4">Payment Method</h2>

                <form action="{{ route('frontend.events.payment', $event) }}" method="POST">
                    @csrf

                    <!-- Payment Options -->
                    <div class="space-y-4 mb-6">
                        <!-- Mobile Money -->
                        <label class="flex items-center p-4 border border-gray-600 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                            <input type="radio" name="payment_method" value="mobile_money" checked
                                   class="w-4 h-4 text-green-500 border-gray-600 bg-gray-700 focus:ring-green-500 focus:ring-2">
                            <div class="ml-3 flex-1">
                                <div class="flex items-center gap-3">
                                    <span class="material-icons-round text-green-400">phone_android</span>
                                    <div>
                                        <p class="text-white font-medium">Mobile Money</p>
                                        <p class="text-gray-400 text-sm">Pay with MTN MoMo or Airtel Money</p>
                                    </div>
                                </div>
                            </div>
                        </label>

                        <!-- Card Payment -->
                        <label class="flex items-center p-4 border border-gray-600 rounded-lg cursor-pointer hover:border-green-500 transition-colors opacity-50">
                            <input type="radio" name="payment_method" value="card" disabled
                                   class="w-4 h-4 text-green-500 border-gray-600 bg-gray-700 focus:ring-green-500 focus:ring-2">
                            <div class="ml-3 flex-1">
                                <div class="flex items-center gap-3">
                                    <span class="material-icons-round text-gray-500">credit_card</span>
                                    <div>
                                        <p class="text-gray-500 font-medium">Credit/Debit Card</p>
                                        <p class="text-gray-500 text-sm">Coming soon</p>
                                    </div>
                                </div>
                            </div>
                        </label>

                        <!-- Bank Transfer -->
                        <label class="flex items-center p-4 border border-gray-600 rounded-lg cursor-pointer hover:border-green-500 transition-colors opacity-50">
                            <input type="radio" name="payment_method" value="bank_transfer" disabled
                                   class="w-4 h-4 text-green-500 border-gray-600 bg-gray-700 focus:ring-green-500 focus:ring-2">
                            <div class="ml-3 flex-1">
                                <div class="flex items-center gap-3">
                                    <span class="material-icons-round text-gray-500">account_balance</span>
                                    <div>
                                        <p class="text-gray-500 font-medium">Bank Transfer</p>
                                        <p class="text-gray-500 text-sm">Coming soon</p>
                                    </div>
                                </div>
                            </div>
                        </label>
                    </div>

                    <!-- Mobile Money Details -->
                    <div id="mobile-money-details" class="space-y-4 mb-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                            <input type="tel" name="phone_number" placeholder="256xxxxxxxxx" required
                                   class="w-full bg-gray-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-600">
                            <p class="text-gray-400 text-sm mt-1">Enter the phone number registered with your mobile money account</p>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">Provider</label>
                            <select name="provider" required
                                    class="w-full bg-gray-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-600">
                                <option value="">Select Provider</option>
                                <option value="mtn">MTN Mobile Money</option>
                                <option value="airtel">Airtel Money</option>
                            </select>
                        </div>
                    </div>

                    <!-- Terms & Conditions -->
                    <div class="mb-6">
                        <label class="flex items-start gap-3">
                            <input type="checkbox" name="agree_terms" required
                                   class="w-4 h-4 text-green-500 border-gray-600 bg-gray-700 rounded focus:ring-green-500 focus:ring-2 mt-1">
                            <div class="text-sm text-gray-300">
                                I agree to the <a href="#" class="text-green-400 hover:underline">Terms & Conditions</a>
                                and <a href="#" class="text-green-400 hover:underline">Privacy Policy</a>
                            </div>
                        </label>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex flex-col sm:flex-row gap-3">
                        <button type="submit"
                                class="flex-1 bg-green-500 text-black font-medium py-3 px-6 rounded-lg hover:bg-green-400 transition-colors">
                            Complete Payment
                        </button>
                        <a href="{{ route('frontend.events.show', $event) }}"
                           class="flex-1 bg-gray-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-500 transition-colors text-center">
                            Cancel
                        </a>
                    </div>
                </form>
            </div>
        </div>

        <!-- Order Summary -->
        <div class="space-y-6">
            <!-- Security Notice -->
            <div class="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
                <div class="flex items-center gap-3 mb-3">
                    <span class="material-icons-round text-blue-400">security</span>
                    <h3 class="text-lg font-medium text-white">Secure Payment</h3>
                </div>
                <p class="text-gray-300 text-sm">
                    Your payment information is protected with industry-standard encryption.
                    We never store your payment details.
                </p>
            </div>

            <!-- Event Policies -->
            @if($event->cancellation_policy || $event->refund_policy)
                <div class="bg-gray-800 rounded-lg p-6">
                    <h3 class="text-lg font-medium text-white mb-4">Event Policies</h3>

                    @if($event->cancellation_policy)
                        <div class="mb-4">
                            <h4 class="text-white font-medium mb-2">Cancellation Policy</h4>
                            <p class="text-gray-300 text-sm">{{ $event->cancellation_policy }}</p>
                        </div>
                    @endif

                    @if($event->refund_policy)
                        <div>
                            <h4 class="text-white font-medium mb-2">Refund Policy</h4>
                            <p class="text-gray-300 text-sm">{{ $event->refund_policy }}</p>
                        </div>
                    @endif
                </div>
            @endif

            <!-- Customer Support -->
            <div class="bg-gray-800 rounded-lg p-6">
                <h3 class="text-lg font-medium text-white mb-4">Need Help?</h3>
                <div class="space-y-3">
                    <div class="flex items-center gap-3">
                        <span class="material-icons-round text-green-400 text-sm">email</span>
                        <span class="text-gray-300 text-sm">support@tesotunes.com</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="material-icons-round text-green-400 text-sm">phone</span>
                        <span class="text-gray-300 text-sm">+256 700 000 000</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="material-icons-round text-green-400 text-sm">schedule</span>
                        <span class="text-gray-300 text-sm">24/7 Support Available</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    const paymentMethodRadios = document.querySelectorAll('input[name="payment_method"]');
    const mobileMoneyDetails = document.getElementById('mobile-money-details');

    paymentMethodRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'mobile_money') {
                mobileMoneyDetails.style.display = 'block';
            } else {
                mobileMoneyDetails.style.display = 'none';
            }
        });
    });

    // Form validation
    const form = document.querySelector('form');
    form.addEventListener('submit', function(e) {
        const agreeTerms = document.querySelector('input[name="agree_terms"]');
        if (!agreeTerms.checked) {
            e.preventDefault();
            alert('Please agree to the Terms & Conditions to continue.');
            return;
        }

        const paymentMethod = document.querySelector('input[name="payment_method"]:checked');
        if (!paymentMethod) {
            e.preventDefault();
            alert('Please select a payment method.');
            return;
        }

        if (paymentMethod.value === 'mobile_money') {
            const phoneNumber = document.querySelector('input[name="phone_number"]').value;
            const provider = document.querySelector('select[name="provider"]').value;

            if (!phoneNumber || !provider) {
                e.preventDefault();
                alert('Please complete all mobile money details.');
                return;
            }
        }

        // Show loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Processing...';
    });
});
</script>
@endpush
@endsection