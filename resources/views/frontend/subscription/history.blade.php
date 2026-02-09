@extends('frontend.layouts.music')

@section('title', 'Billing History')

@section('content')
<div class="container mx-auto px-6 py-8">
    <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-8">
            <div>
                <h1 class="text-3xl font-bold text-white mb-2">Billing History</h1>
                <p class="text-gray-400">View your subscription payment history</p>
            </div>
            <a href="{{ route('frontend.subscription.index') }}"
               class="text-green-500 hover:text-green-400 font-medium">
                ← Back to Subscription
            </a>
        </div>

        <!-- Current Subscription Info -->
        @if(auth()->user()->subscription)
        <div class="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 class="text-xl font-semibold text-white mb-4">Current Subscription</h2>
            <div class="grid md:grid-cols-3 gap-4">
                <div>
                    <p class="text-gray-400 text-sm">Plan</p>
                    <p class="text-white font-semibold">{{ auth()->user()->subscription->plan_name }}</p>
                </div>
                <div>
                    <p class="text-gray-400 text-sm">Status</p>
                    <p class="text-green-500 font-semibold">{{ ucfirst(auth()->user()->subscription->status) }}</p>
                </div>
                <div>
                    <p class="text-gray-400 text-sm">Next Billing</p>
                    <p class="text-white font-semibold">
                        @if(auth()->user()->subscription->ends_at)
                            {{ auth()->user()->subscription->ends_at->format('M j, Y') }}
                        @else
                            N/A
                        @endif
                    </p>
                </div>
            </div>
        </div>
        @endif

        <!-- Billing History Table -->
        <div class="bg-gray-800 rounded-lg overflow-hidden">
            <div class="p-6 border-b border-gray-700">
                <h2 class="text-xl font-semibold text-white">Payment History</h2>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-700">
                        <tr>
                            <th class="text-left p-4 text-white font-semibold">Date</th>
                            <th class="text-left p-4 text-white font-semibold">Description</th>
                            <th class="text-left p-4 text-white font-semibold">Amount</th>
                            <th class="text-left p-4 text-white font-semibold">Status</th>
                            <th class="text-left p-4 text-white font-semibold">Invoice</th>
                        </tr>
                    </thead>
                    <tbody class="text-gray-300">
                        <!-- Sample billing records - replace with actual data -->
                        <tr class="border-t border-gray-700">
                            <td class="p-4">Dec 1, 2024</td>
                            <td class="p-4">Premium Monthly Subscription</td>
                            <td class="p-4 font-semibold">$9.99</td>
                            <td class="p-4">
                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900 text-green-300">
                                    Paid
                                </span>
                            </td>
                            <td class="p-4">
                                <a href="#" class="text-green-500 hover:text-green-400 text-sm">
                                    Download
                                </a>
                            </td>
                        </tr>
                        <tr class="border-t border-gray-700">
                            <td class="p-4">Nov 1, 2024</td>
                            <td class="p-4">Premium Monthly Subscription</td>
                            <td class="p-4 font-semibold">$9.99</td>
                            <td class="p-4">
                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900 text-green-300">
                                    Paid
                                </span>
                            </td>
                            <td class="p-4">
                                <a href="#" class="text-green-500 hover:text-green-400 text-sm">
                                    Download
                                </a>
                            </td>
                        </tr>
                        <tr class="border-t border-gray-700">
                            <td class="p-4">Oct 1, 2024</td>
                            <td class="p-4">Premium Monthly Subscription</td>
                            <td class="p-4 font-semibold">$9.99</td>
                            <td class="p-4">
                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900 text-green-300">
                                    Paid
                                </span>
                            </td>
                            <td class="p-4">
                                <a href="#" class="text-green-500 hover:text-green-400 text-sm">
                                    Download
                                </a>
                            </td>
                        </tr>
                        <!-- Add more rows as needed -->
                    </tbody>
                </table>
            </div>

            <!-- Empty State -->
            <div class="p-8 text-center text-gray-400" style="display: none;" id="empty-state">
                <span class="material-icons-round text-4xl mb-4 block">receipt_long</span>
                <h3 class="text-lg font-semibold mb-2">No billing history yet</h3>
                <p>Your payment history will appear here once you start a subscription.</p>
            </div>
        </div>

        <!-- Summary Card -->
        <div class="grid md:grid-cols-2 gap-6 mt-8">
            <div class="bg-gray-800 rounded-lg p-6">
                <h3 class="text-lg font-semibold text-white mb-4">Payment Summary</h3>
                <div class="space-y-3">
                    <div class="flex justify-between">
                        <span class="text-gray-400">Total Paid This Year</span>
                        <span class="text-white font-semibold">$119.88</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">Average Monthly</span>
                        <span class="text-white font-semibold">$9.99</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">Total Transactions</span>
                        <span class="text-white font-semibold">12</span>
                    </div>
                </div>
            </div>

            <div class="bg-gray-800 rounded-lg p-6">
                <h3 class="text-lg font-semibold text-white mb-4">Payment Methods</h3>
                <div class="space-y-3">
                    <div class="flex items-center gap-3">
                        <span class="material-icons-round text-blue-500">credit_card</span>
                        <div>
                            <p class="text-white">•••• •••• •••• 1234</p>
                            <p class="text-gray-400 text-sm">Expires 12/25</p>
                        </div>
                    </div>
                    <a href="#" class="text-green-500 hover:text-green-400 text-sm">
                        Update payment method →
                    </a>
                </div>
            </div>
        </div>

        <!-- Actions -->
        <div class="mt-8 flex gap-4">
            <a href="{{ route('frontend.subscription.plans') }}"
               class="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                Change Plan
            </a>
            <button onclick="window.print()"
                    class="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                Print History
            </button>
        </div>
    </div>
</div>
@endsection