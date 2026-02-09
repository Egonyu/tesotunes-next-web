@extends('frontend.layouts.music')

@section('title', 'Payment Status - ' . $event->title)

@section('content')
<div class="p-6 max-w-4xl mx-auto">
    <!-- Header -->
    <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-white mb-2">Payment Status</h1>
        <p class="text-gray-400">{{ $event->title }}</p>
    </div>

    <div class="max-w-2xl mx-auto">
        <!-- Payment Status Card -->
        <div class="bg-gray-800 rounded-lg p-8 mb-6">
            <!-- Status Icon & Message -->
            <div class="text-center mb-6" id="status-display">
                @switch($payment->status)
                    @case('pending')
                        <div class="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span class="material-icons-round text-yellow-400 text-4xl">schedule</span>
                        </div>
                        <h2 class="text-2xl font-bold text-yellow-400 mb-2">Payment Pending</h2>
                        <p class="text-gray-300 mb-4">Your payment is being processed. Please wait...</p>
                        @break

                    @case('processing')
                        <div class="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span class="material-icons-round text-blue-400 text-4xl animate-spin">sync</span>
                        </div>
                        <h2 class="text-2xl font-bold text-blue-400 mb-2">Processing Payment</h2>
                        <p class="text-gray-300 mb-4">
                            @if($payment->payment_method === 'mobile_money')
                                Please check your phone for the payment prompt and complete the transaction.
                            @else
                                Your payment is being processed...
                            @endif
                        </p>
                        @break

                    @case('completed')
                        <div class="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span class="material-icons-round text-green-400 text-4xl">check_circle</span>
                        </div>
                        <h2 class="text-2xl font-bold text-green-400 mb-2">Payment Successful!</h2>
                        <p class="text-gray-300 mb-4">Your ticket has been confirmed. You can now access your ticket.</p>
                        @break

                    @case('failed')
                        <div class="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span class="material-icons-round text-red-400 text-4xl">error</span>
                        </div>
                        <h2 class="text-2xl font-bold text-red-400 mb-2">Payment Failed</h2>
                        <p class="text-gray-300 mb-4">
                            @if($payment->failure_reason)
                                {{ $payment->failure_reason }}
                            @else
                                Your payment could not be processed. Please try again.
                            @endif
                        </p>
                        @break

                    @default
                        <div class="w-20 h-20 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span class="material-icons-round text-gray-400 text-4xl">help</span>
                        </div>
                        <h2 class="text-2xl font-bold text-gray-400 mb-2">Unknown Status</h2>
                        <p class="text-gray-300 mb-4">We're checking your payment status...</p>
                @endswitch
            </div>

            <!-- Payment Details -->
            <div class="bg-gray-700 rounded-lg p-6 mb-6">
                <h3 class="text-lg font-semibold text-white mb-4">Payment Details</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span class="text-gray-400">Transaction ID:</span>
                        <p class="text-white font-mono">{{ $payment->transaction_id }}</p>
                    </div>
                    <div>
                        <span class="text-gray-400">Amount:</span>
                        <p class="text-white font-semibold">{{ $payment->formatted_amount }}</p>
                    </div>
                    <div>
                        <span class="text-gray-400">Payment Method:</span>
                        <p class="text-white">
                            @if($payment->payment_method === 'mobile_money')
                                {{ $payment->provider_name }}
                            @else
                                {{ ucfirst(str_replace('_', ' ', $payment->payment_method)) }}
                            @endif
                        </p>
                    </div>
                    <div>
                        <span class="text-gray-400">Status:</span>
                        <p class="text-white {{ $payment->status_color }}">{{ $payment->status_text }}</p>
                    </div>
                    @if($payment->phone_number)
                        <div>
                            <span class="text-gray-400">Phone Number:</span>
                            <p class="text-white">{{ $payment->phone_number }}</p>
                        </div>
                    @endif
                    @if($payment->external_transaction_id)
                        <div>
                            <span class="text-gray-400">Provider Ref:</span>
                            <p class="text-white font-mono text-xs">{{ $payment->external_transaction_id }}</p>
                        </div>
                    @endif
                </div>
            </div>

            <!-- Auto-refresh Notice for Pending/Processing -->
            @if(in_array($payment->status, ['pending', 'processing']))
                <div class="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                    <div class="flex items-center gap-3">
                        <span class="material-icons-round text-blue-400">info</span>
                        <div>
                            <p class="text-white font-medium">Auto-checking payment status</p>
                            <p class="text-gray-300 text-sm">This page will update automatically when your payment is confirmed.</p>
                        </div>
                    </div>
                </div>
            @endif

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-4">
                @if($payment->status === 'completed')
                    <a href="{{ route('frontend.events.ticket', $event) }}"
                       class="flex-1 bg-green-500 text-black font-medium py-3 px-6 rounded-lg hover:bg-green-400 transition-colors text-center">
                        <span class="material-icons-round text-sm mr-2">confirmation_number</span>
                        View Ticket
                    </a>
                    <a href="{{ route('frontend.events.my-tickets') }}"
                       class="flex-1 bg-gray-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-500 transition-colors text-center">
                        My Tickets
                    </a>
                @elseif($payment->status === 'failed')
                    <a href="{{ route('frontend.events.checkout', $event) }}"
                       class="flex-1 bg-yellow-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-yellow-500 transition-colors text-center">
                        Try Again
                    </a>
                    <a href="{{ route('frontend.events.show', $event) }}"
                       class="flex-1 bg-gray-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-500 transition-colors text-center">
                        Back to Event
                    </a>
                @else
                    <button onclick="checkStatus()" id="check-status-btn"
                            class="flex-1 bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-500 transition-colors">
                        <span class="material-icons-round text-sm mr-2">refresh</span>
                        Check Status
                    </button>
                    <a href="{{ route('frontend.events.show', $event) }}"
                       class="flex-1 bg-gray-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-500 transition-colors text-center">
                        Back to Event
                    </a>
                @endif
            </div>
        </div>

        <!-- Mobile Money Instructions -->
        @if($payment->payment_method === 'mobile_money' && in_array($payment->status, ['pending', 'processing']))
            <div class="bg-gray-800 rounded-lg p-6">
                <h3 class="text-lg font-semibold text-white mb-4">
                    <span class="material-icons-round text-green-400 mr-2">phone_android</span>
                    Mobile Money Instructions
                </h3>

                @if($payment->provider === 'mtn')
                    <div class="space-y-3 text-gray-300">
                        <p class="font-medium text-white">To complete your MTN Mobile Money payment:</p>
                        <ol class="list-decimal list-inside space-y-2 text-sm">
                            <li>Check your phone for a payment prompt</li>
                            <li>Or dial <strong class="text-white">*165#</strong> on your MTN line</li>
                            <li>Follow the prompts to complete the payment</li>
                            <li>Enter your Mobile Money PIN when prompted</li>
                        </ol>
                        <p class="text-xs text-gray-400 mt-4">
                            If you don't receive the prompt, please ensure your phone is on and has network coverage.
                        </p>
                    </div>
                @elseif($payment->provider === 'airtel')
                    <div class="space-y-3 text-gray-300">
                        <p class="font-medium text-white">To complete your Airtel Money payment:</p>
                        <ol class="list-decimal list-inside space-y-2 text-sm">
                            <li>Check your phone for a payment prompt</li>
                            <li>Or dial <strong class="text-white">*185#</strong> on your Airtel line</li>
                            <li>Follow the prompts to complete the payment</li>
                            <li>Enter your Airtel Money PIN when prompted</li>
                        </ol>
                        <p class="text-xs text-gray-400 mt-4">
                            If you don't receive the prompt, please ensure your phone is on and has network coverage.
                        </p>
                    </div>
                @endif
            </div>
        @endif
    </div>
</div>

@push('scripts')
<script>
let statusCheckInterval;
let checkCount = 0;
const maxChecks = 30; // Stop after 5 minutes (30 checks × 10 seconds)

document.addEventListener('DOMContentLoaded', function() {
    // Auto-check status for pending/processing payments
    @if(in_array($payment->status, ['pending', 'processing']))
        startStatusChecking();
    @endif
});

function startStatusChecking() {
    statusCheckInterval = setInterval(function() {
        checkCount++;
        if (checkCount >= maxChecks) {
            clearInterval(statusCheckInterval);
            showMaxAttemptsMessage();
            return;
        }
        checkStatus(false); // Don't show loading for auto-checks
    }, 10000); // Check every 10 seconds
}

function checkStatus(showLoading = true) {
    if (showLoading) {
        const btn = document.getElementById('check-status-btn');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<span class="material-icons-round text-sm mr-2 animate-spin">sync</span>Checking...';
        }
    }

    fetch(`{{ route('frontend.payments.check-status', [$event, $payment]) }}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': '{{ csrf_token() }}'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.payment_status === 'completed') {
            // Payment completed - reload page to show success state
            window.location.reload();
        } else if (data.payment_status === 'failed') {
            // Payment failed - reload page to show failure state
            window.location.reload();
        } else {
            // Still pending/processing - update status text if needed
            updateStatusDisplay(data);
        }
    })
    .catch(error => {
        console.error('Status check failed:', error);
    })
    .finally(() => {
        if (showLoading) {
            const btn = document.getElementById('check-status-btn');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<span class="material-icons-round text-sm mr-2">refresh</span>Check Status';
            }
        }
    });
}

function updateStatusDisplay(data) {
    // Update any dynamic status information if needed
    // This could update timestamps, status messages, etc.
}

function showMaxAttemptsMessage() {
    const statusDisplay = document.getElementById('status-display');
    const notice = document.createElement('div');
    notice.className = 'bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mt-4';
    notice.innerHTML = `
        <div class="flex items-center gap-3">
            <span class="material-icons-round text-yellow-400">schedule</span>
            <div>
                <p class="text-white font-medium">Still processing...</p>
                <p class="text-gray-300 text-sm">Your payment is taking longer than usual. Please check back in a few minutes or contact support if you need assistance.</p>
            </div>
        </div>
    `;
    statusDisplay.appendChild(notice);
}

// Clear interval when leaving page
window.addEventListener('beforeunload', function() {
    if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
    }
});
</script>
@endpush
@endsection