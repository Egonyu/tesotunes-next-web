@extends('layouts.admin')
@section('title', 'Order Details')
@section('content')
<div class="space-y-6">
    <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">Order #{{ $order->order_number }}</h1>
        <a href="{{ route('admin.store.orders.index') }}" class="px-4 py-2 bg-gray-200 rounded-lg">Back to Orders</a>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border">
                <h2 class="text-lg font-bold mb-4">Order Items</h2>
                @foreach($order->items as $item)
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <img src="{{ $item->product->image_url }}" class="w-16 h-16 rounded object-cover">
                        <div>
                            <p class="font-medium">{{ $item->product->name }}</p>
                            <p class="text-sm text-gray-500">Qty: {{ $item->quantity }}</p>
                        </div>
                    </div>
                    <p class="font-bold">UGX {{ number_format($item->price_ugx * $item->quantity) }}</p>
                </div>
                @endforeach
            </div>
        </div>
        <div>
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border">
                <h2 class="text-lg font-bold mb-4">Order Summary</h2>
                <div class="space-y-2 mb-4">
                    <div class="flex justify-between"><span>Subtotal</span><span>UGX {{ number_format($order->subtotal) }}</span></div>
                    <div class="flex justify-between"><span>Shipping</span><span>UGX {{ number_format($order->shipping_cost) }}</span></div>
                    <div class="flex justify-between font-bold text-lg pt-2 border-t"><span>Total</span><span>UGX {{ number_format($order->total_amount) }}</span></div>
                </div>
                <form action="{{ route('admin.store.orders.update-status', $order) }}" method="POST">
                    @csrf
                    @method('PATCH')
                    <select name="status" class="w-full mb-2 px-4 py-2 rounded-lg bg-gray-100">
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                    </select>
                    <button type="submit" class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg">Update Status</button>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection
