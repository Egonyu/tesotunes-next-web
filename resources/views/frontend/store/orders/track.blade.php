@extends('frontend.layouts.store')
@section('title', 'Track Order')
@section('content')
<div class="min-h-screen bg-black text-white py-8">
    <div class="max-w-4xl mx-auto px-4">
        <h1 class="text-3xl font-bold mb-8">Track Order #{{ $order->order_number }}</h1>
        
        <div class="bg-gray-900 rounded-xl p-8 border border-gray-800">
            <div class="space-y-8">
                <div class="flex items-center">
                    <div class="flex-shrink-0 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                        <span class="material-icons-round">check</span>
                    </div>
                    <div class="ml-4 flex-1">
                        <h3 class="font-bold">Order Placed</h3>
                        <p class="text-sm text-gray-400">{{ $order->created_at->format('M d, Y H:i') }}</p>
                    </div>
                </div>

                <div class="flex items-center">
                    <div class="flex-shrink-0 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                        <span class="material-icons-round">inventory</span>
                    </div>
                    <div class="ml-4 flex-1">
                        <h3 class="font-bold">Processing</h3>
                        <p class="text-sm text-gray-400">Order is being prepared</p>
                    </div>
                </div>

                <div class="flex items-center">
                    <div class="flex-shrink-0 w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                        <span class="material-icons-round">local_shipping</span>
                    </div>
                    <div class="ml-4 flex-1">
                        <h3 class="font-bold text-gray-400">Shipped</h3>
                        <p class="text-sm text-gray-500">Pending</p>
                    </div>
                </div>

                <div class="flex items-center">
                    <div class="flex-shrink-0 w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                        <span class="material-icons-round">home</span>
                    </div>
                    <div class="ml-4 flex-1">
                        <h3 class="font-bold text-gray-400">Delivered</h3>
                        <p class="text-sm text-gray-500">Pending</p>
                    </div>
                </div>
            </div>

            <div class="mt-8 pt-8 border-t border-gray-800">
                <a href="{{ route('frontend.store.orders.show', $order) }}" 
                   class="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-medium">
                    <span class="material-icons-round">arrow_back</span>
                    Back to Order Details
                </a>
            </div>
        </div>
    </div>
</div>
@endsection
