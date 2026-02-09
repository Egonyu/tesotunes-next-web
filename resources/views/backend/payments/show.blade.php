@extends('layouts.admin')

@section('title', 'Payment Details')

@section('content')
<div class="dashboard-content">
    <!-- Page Header -->
    <div class="mb-8">
        <div class="flex items-center gap-4 mb-4">
            <a href="{{ route('admin.payments.index') }}" class="btn btn-sm bg-slate-100 text-slate-700 hover:bg-slate-200">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Payments
            </a>
        </div>
        
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">Payment #{{ $payment->id }}</h1>
                <p class="text-slate-600 dark:text-navy-300">{{ $payment->payment_reference ?? 'N/A' }}</p>
            </div>
            <div class="flex gap-2">
                <span class="inline-block px-3 py-1 text-sm font-medium rounded-full {{
                    $payment->status === 'completed' ? 'bg-green-100 text-green-800' :
                    ($payment->status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    ($payment->status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'))
                }}">
                    {{ ucfirst($payment->status) }}
                </span>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Payment Details -->
        <div class="lg:col-span-2 space-y-6">
            <!-- Payment Information -->
            <div class="admin-card">
                <div class="p-6 border-b border-slate-200 dark:border-navy-500">
                    <h3 class="text-lg font-medium text-slate-800 dark:text-navy-50">Payment Information</h3>
                </div>
                <div class="p-6 space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm text-slate-600 dark:text-navy-300">Amount</p>
                            <p class="text-xl font-bold text-slate-800 dark:text-navy-50">
                                {{ $payment->currency ?? 'UGX' }} {{ number_format($payment->amount, 2) }}
                            </p>
                        </div>
                        <div>
                            <p class="text-sm text-slate-600 dark:text-navy-300">Payment Method</p>
                            <p class="text-lg font-medium text-slate-800 dark:text-navy-50">
                                {{ ucwords(str_replace('_', ' ', $payment->payment_method ?? 'N/A')) }}
                            </p>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-navy-500">
                        <div>
                            <p class="text-sm text-slate-600 dark:text-navy-300">Transaction ID</p>
                            <p class="text-sm font-mono text-slate-800 dark:text-navy-50">
                                {{ $payment->transaction_id ?? 'N/A' }}
                            </p>
                        </div>
                        <div>
                            <p class="text-sm text-slate-600 dark:text-navy-300">Payment Reference</p>
                            <p class="text-sm font-mono text-slate-800 dark:text-navy-50">
                                {{ $payment->payment_reference ?? 'N/A' }}
                            </p>
                        </div>
                    </div>

                    @if($payment->description)
                    <div class="pt-4 border-t border-slate-200 dark:border-navy-500">
                        <p class="text-sm text-slate-600 dark:text-navy-300">Description</p>
                        <p class="text-sm text-slate-800 dark:text-navy-50">{{ $payment->description }}</p>
                    </div>
                    @endif

                    @if($payment->metadata)
                    <div class="pt-4 border-t border-slate-200 dark:border-navy-500">
                        <p class="text-sm text-slate-600 dark:text-navy-300 mb-2">Metadata</p>
                        <pre class="text-xs bg-slate-100 dark:bg-navy-900 p-3 rounded overflow-auto">{{ json_encode($payment->metadata, JSON_PRETTY_PRINT) }}</pre>
                    </div>
                    @endif
                </div>
            </div>

            <!-- Payment Timeline -->
            <div class="admin-card">
                <div class="p-6 border-b border-slate-200 dark:border-navy-500">
                    <h3 class="text-lg font-medium text-slate-800 dark:text-navy-50">Payment Timeline</h3>
                </div>
                <div class="p-6">
                    <ol class="relative border-l border-slate-200 dark:border-navy-500 ml-3">
                        <!-- Payment Created -->
                        <li class="mb-6 ml-6">
                            <span class="absolute flex items-center justify-center size-6 bg-primary/10 rounded-full -left-3 ring-4 ring-white dark:ring-navy-700">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </span>
                            <div class="flex items-center justify-between">
                                <h3 class="text-sm font-medium text-slate-800 dark:text-navy-50">Payment Initiated</h3>
                                <time class="text-xs text-slate-500 dark:text-navy-300">{{ $payment->created_at->format('M d, Y h:i:s A') }}</time>
                            </div>
                            <p class="text-xs text-slate-600 dark:text-navy-300 mt-1">
                                Amount: {{ $payment->currency ?? 'UGX' }} {{ number_format($payment->amount, 2) }}
                                @if($payment->phone_number)
                                    · Phone: {{ $payment->phone_number }}
                                @endif
                            </p>
                        </li>

                        @if($payment->initiated_at && $payment->initiated_at != $payment->created_at)
                        <!-- Payment Sent to Provider -->
                        <li class="mb-6 ml-6">
                            <span class="absolute flex items-center justify-center size-6 bg-info/10 rounded-full -left-3 ring-4 ring-white dark:ring-navy-700">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-3 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </span>
                            <div class="flex items-center justify-between">
                                <h3 class="text-sm font-medium text-slate-800 dark:text-navy-50">Sent to Provider</h3>
                                <time class="text-xs text-slate-500 dark:text-navy-300">{{ $payment->initiated_at->format('M d, Y h:i:s A') }}</time>
                            </div>
                            <p class="text-xs text-slate-600 dark:text-navy-300 mt-1">
                                Provider: {{ ucwords(str_replace('_', ' ', $payment->payment_provider ?? 'Unknown')) }}
                            </p>
                        </li>
                        @endif

                        @if($payment->provider_response)
                            @php
                                $providerResponse = is_array($payment->provider_response) ? $payment->provider_response : json_decode($payment->provider_response, true);
                            @endphp
                            @if(is_array($providerResponse) && !empty($providerResponse))
                            <!-- Provider Response -->
                            <li class="mb-6 ml-6">
                                <span class="absolute flex items-center justify-center size-6 bg-secondary/10 rounded-full -left-3 ring-4 ring-white dark:ring-navy-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="size-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </span>
                                <div class="flex items-center justify-between">
                                    <h3 class="text-sm font-medium text-slate-800 dark:text-navy-50">Provider Response</h3>
                                    @if(isset($providerResponse['timestamp']))
                                        <time class="text-xs text-slate-500 dark:text-navy-300">{{ \Carbon\Carbon::parse($providerResponse['timestamp'])->format('M d, Y h:i:s A') }}</time>
                                    @endif
                                </div>
                                <details class="mt-2">
                                    <summary class="text-xs text-primary cursor-pointer hover:underline">View response details</summary>
                                    <pre class="text-xs bg-slate-100 dark:bg-navy-900 p-3 rounded mt-2 overflow-auto max-h-48">{{ json_encode($providerResponse, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) }}</pre>
                                </details>
                            </li>
                            @endif
                        @endif

                        @if($payment->completed_at)
                        <!-- Payment Completed -->
                        <li class="mb-6 ml-6">
                            <span class="absolute flex items-center justify-center size-6 bg-success/10 rounded-full -left-3 ring-4 ring-white dark:ring-navy-700">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-3 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </span>
                            <div class="flex items-center justify-between">
                                <h3 class="text-sm font-medium text-success">Payment Completed</h3>
                                <time class="text-xs text-slate-500 dark:text-navy-300">{{ $payment->completed_at->format('M d, Y h:i:s A') }}</time>
                            </div>
                            @if($payment->initiated_at && $payment->completed_at)
                                <p class="text-xs text-slate-600 dark:text-navy-300 mt-1">
                                    Completed in {{ $payment->initiated_at->diffInSeconds($payment->completed_at) }} seconds
                                </p>
                            @endif
                        </li>
                        @endif

                        @if($payment->failed_at)
                        <!-- Payment Failed -->
                        <li class="mb-6 ml-6">
                            <span class="absolute flex items-center justify-center size-6 bg-error/10 rounded-full -left-3 ring-4 ring-white dark:ring-navy-700">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-3 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </span>
                            <div class="flex items-center justify-between">
                                <h3 class="text-sm font-medium text-error">Payment Failed</h3>
                                <time class="text-xs text-slate-500 dark:text-navy-300">{{ $payment->failed_at->format('M d, Y h:i:s A') }}</time>
                            </div>
                            @if($payment->failure_reason)
                                <div class="mt-2 p-2 bg-error/10 rounded-lg">
                                    <p class="text-xs text-error">{{ $payment->failure_reason }}</p>
                                </div>
                            @endif
                        </li>
                        @endif

                        @if($payment->refunded_at)
                        <!-- Payment Refunded -->
                        <li class="mb-6 ml-6">
                            <span class="absolute flex items-center justify-center size-6 bg-warning/10 rounded-full -left-3 ring-4 ring-white dark:ring-navy-700">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-3 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                </svg>
                            </span>
                            <div class="flex items-center justify-between">
                                <h3 class="text-sm font-medium text-warning">Payment Refunded</h3>
                                <time class="text-xs text-slate-500 dark:text-navy-300">{{ $payment->refunded_at->format('M d, Y h:i:s A') }}</time>
                            </div>
                            @if($payment->refund_amount)
                                <p class="text-xs text-slate-600 dark:text-navy-300 mt-1">
                                    Amount: {{ $payment->currency ?? 'UGX' }} {{ number_format($payment->refund_amount, 2) }}
                                </p>
                            @endif
                            @if($payment->refund_reason)
                                <div class="mt-2 p-2 bg-warning/10 rounded-lg">
                                    <p class="text-xs text-warning">{{ $payment->refund_reason }}</p>
                                </div>
                            @endif
                        </li>
                        @endif

                        <!-- Current Status -->
                        @if($payment->status === 'pending')
                        <li class="ml-6">
                            <span class="absolute flex items-center justify-center size-6 bg-amber-500/10 rounded-full -left-3 ring-4 ring-white dark:ring-navy-700">
                                <span class="animate-ping absolute inline-flex size-full rounded-full bg-amber-400 opacity-50"></span>
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-3 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </span>
                            <h3 class="text-sm font-medium text-amber-600">Awaiting confirmation...</h3>
                            <p class="text-xs text-slate-500 mt-1">Payment is being processed by the provider</p>
                        </li>
                        @endif
                    </ol>
                </div>
            </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
            <!-- User Information -->
            @if($payment->user)
            <div class="admin-card">
                <div class="p-6 border-b border-slate-200 dark:border-navy-500">
                    <h3 class="text-lg font-medium text-slate-800 dark:text-navy-50">User Information</h3>
                </div>
                <div class="p-6 space-y-3">
                    <div class="flex items-center gap-3">
                        @if($payment->user->avatar)
                        <img src="{{ $payment->user->avatar }}" alt="{{ $payment->user->name }}" class="size-12 rounded-full">
                        @else
                        <div class="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <span class="text-lg font-bold text-primary">{{ substr($payment->user->name, 0, 1) }}</span>
                        </div>
                        @endif
                        <div>
                            <p class="font-medium text-slate-800 dark:text-navy-50">{{ $payment->user->name }}</p>
                            <p class="text-sm text-slate-600 dark:text-navy-300">{{ $payment->user->email }}</p>
                        </div>
                    </div>
                    <a href="{{ route('admin.users.show', $payment->user->id) }}" class="btn btn-sm bg-primary text-white w-full mt-4">
                        View User Profile
                    </a>
                </div>
            </div>
            @endif

            <!-- Subscription Information -->
            @if($payment->subscriptionPlan)
            <div class="admin-card">
                <div class="p-6 border-b border-slate-200 dark:border-navy-500">
                    <h3 class="text-lg font-medium text-slate-800 dark:text-navy-50">Subscription</h3>
                </div>
                <div class="p-6">
                    <p class="font-medium text-slate-800 dark:text-navy-50">{{ $payment->subscriptionPlan->name }}</p>
                    <p class="text-sm text-slate-600 dark:text-navy-300 mt-1">{{ $payment->subscriptionPlan->description }}</p>
                </div>
            </div>
            @endif

            <!-- Actions -->
            <div class="admin-card">
                <div class="p-6 border-b border-slate-200 dark:border-navy-500">
                    <h3 class="text-lg font-medium text-slate-800 dark:text-navy-50">Actions</h3>
                </div>
                <div class="p-6 space-y-2">
                    @if($payment->status === 'pending')
                    <form method="POST" action="{{ route('admin.payments.process', $payment) }}">
                        @csrf
                        <button type="submit" class="btn bg-success text-white w-full" onclick="return confirm('Process this payment?')">
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Process Payment
                        </button>
                    </form>
                    @endif

                    @if($payment->status === 'failed')
                    <form method="POST" action="{{ route('admin.payments.retry', $payment) }}">
                        @csrf
                        <button type="submit" class="btn bg-warning text-white w-full" onclick="return confirm('Retry this payment?')">
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Retry Payment
                        </button>
                    </form>
                    @endif

                    @if($payment->status === 'completed' && !$payment->refunded_at)
                    <button onclick="showRefundModal()" class="btn bg-error text-white w-full">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        Refund Payment
                    </button>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Refund Modal -->
<div id="refundModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 hidden" onclick="if(event.target === this) closeRefundModal()">
    <div class="bg-white dark:bg-navy-700 rounded-lg shadow-xl max-w-md w-full mx-4" onclick="event.stopPropagation()">
        <form action="{{ route('admin.payments.refund', $payment) }}" method="POST">
            @csrf
            <div class="p-6">
                <h3 class="text-xl font-bold text-slate-800 dark:text-navy-50 mb-4">Refund Payment</h3>
                <div class="space-y-4">
                    <div>
                        <label for="amount" class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">
                            Refund Amount
                        </label>
                        <input type="number" step="0.01" max="{{ $payment->amount }}" 
                               id="amount" name="amount" value="{{ $payment->amount }}"
                               class="form-input w-full" required>
                        <p class="text-xs text-slate-500 mt-1">Max: {{ $payment->currency ?? 'UGX' }} {{ number_format($payment->amount, 2) }}</p>
                    </div>
                    <div>
                        <label for="reason" class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">
                            Reason <span class="text-red-500">*</span>
                        </label>
                        <textarea id="reason" name="reason" rows="3" class="form-input w-full" 
                                  placeholder="Explain why this payment is being refunded..." required></textarea>
                    </div>
                </div>
            </div>
            <div class="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-navy-800 rounded-b-lg">
                <button type="button" onclick="closeRefundModal()" class="btn bg-slate-200 text-slate-700 hover:bg-slate-300">
                    Cancel
                </button>
                <button type="submit" class="btn bg-red-600 text-white hover:bg-red-700" onclick="return confirm('Are you sure you want to refund this payment?')">
                    Process Refund
                </button>
            </div>
        </form>
    </div>
</div>

<script>
function showRefundModal() {
    document.getElementById('refundModal').classList.remove('hidden');
}

function closeRefundModal() {
    document.getElementById('refundModal').classList.add('hidden');
}
</script>
@endsection
