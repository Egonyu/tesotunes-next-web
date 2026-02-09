@extends('layouts.admin')
@section('title', 'Store Orders')
@section('content')
<div class="space-y-6">
    <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Store Orders</h1>
        <div class="flex items-center gap-4">
            <select class="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg">
                <option>All Orders</option>
                <option>Pending</option>
                <option>Processing</option>
                <option>Completed</option>
            </select>
        </div>
    </div>
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                @forelse($orders as $order)
                <tr>
                    <td class="px-6 py-4 text-sm font-medium">#{{ $order->order_number }}</td>
                    <td class="px-6 py-4 text-sm">{{ $order->customer_name }}</td>
                    <td class="px-6 py-4 text-sm">UGX {{ number_format($order->total_amount) }}</td>
                    <td class="px-6 py-4"><span class="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">{{ ucfirst($order->status) }}</span></td>
                    <td class="px-6 py-4 text-sm">{{ $order->created_at->format('M d, Y') }}</td>
                    <td class="px-6 py-4"><a href="{{ route('admin.store.orders.show', $order) }}" class="text-blue-600 hover:text-blue-800">View</a></td>
                </tr>
                @empty
                <tr><td colspan="6" class="px-6 py-12 text-center text-gray-500">No orders found</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
@endsection
