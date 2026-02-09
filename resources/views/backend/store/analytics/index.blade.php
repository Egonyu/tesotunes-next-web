@extends('layouts.admin')
@section('title', 'Store Analytics')
@section('content')
<div x-data="{period: 'month'}" class="space-y-6">
    <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">Store Analytics</h1>
        <select x-model="period" class="px-4 py-2 rounded-lg bg-gray-100">
            <option value="week">Last 7 Days</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
        </select>
    </div>
    <div class="grid grid-cols-4 gap-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border">
            <p class="text-3xl font-bold">{{ $analytics['total_stores'] ?? 0 }}</p>
            <p class="text-sm text-gray-500">Total Stores</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border">
            <p class="text-3xl font-bold">{{ $analytics['total_products'] ?? 0 }}</p>
            <p class="text-sm text-gray-500">Total Products</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border">
            <p class="text-3xl font-bold">{{ $analytics['total_orders'] ?? 0 }}</p>
            <p class="text-sm text-gray-500">Total Orders</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border">
            <p class="text-2xl font-bold">UGX {{ number_format($analytics['total_revenue'] ?? 0) }}</p>
            <p class="text-sm text-gray-500">Total Revenue</p>
        </div>
    </div>
    <div class="grid grid-cols-3 gap-6">
        <a href="{{ route('admin.store.analytics.revenue') }}" class="bg-blue-600 text-white rounded-lg p-6 hover:bg-blue-700">
            <span class="material-icons-round text-4xl mb-2">account_balance_wallet</span>
            <h3 class="text-lg font-bold">Revenue Analytics</h3>
            <p class="text-sm opacity-90">View detailed revenue reports</p>
        </a>
        <a href="{{ route('admin.store.analytics.products') }}" class="bg-green-600 text-white rounded-lg p-6 hover:bg-green-700">
            <span class="material-icons-round text-4xl mb-2">inventory_2</span>
            <h3 class="text-lg font-bold">Product Analytics</h3>
            <p class="text-sm opacity-90">Top selling products</p>
        </a>
        <a href="{{ route('admin.store.analytics.stores') }}" class="bg-purple-600 text-white rounded-lg p-6 hover:bg-purple-700">
            <span class="material-icons-round text-4xl mb-2">storefront</span>
            <h3 class="text-lg font-bold">Store Analytics</h3>
            <p class="text-sm opacity-90">Store performance metrics</p>
        </a>
    </div>
</div>
@endsection
