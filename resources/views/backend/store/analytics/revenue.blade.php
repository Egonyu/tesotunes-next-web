@extends('layouts.admin')
@section('title', 'Revenue Analytics')
@section('content')
<div class="space-y-6">
    <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">Revenue Analytics</h1>
        <a href="{{ route('admin.store.analytics.index') }}" class="px-4 py-2 bg-gray-200 rounded-lg">Back</a>
    </div>
    <div class="grid grid-cols-3 gap-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border">
            <p class="text-2xl font-bold">UGX {{ number_format($data['total_revenue'] ?? 0) }}</p>
            <p class="text-sm text-gray-500">Total Revenue</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border">
            <p class="text-2xl font-bold">UGX {{ number_format($data['platform_commission'] ?? 0) }}</p>
            <p class="text-sm text-gray-500">Platform Commission</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border">
            <p class="text-2xl font-bold">UGX {{ number_format($data['seller_earnings'] ?? 0) }}</p>
            <p class="text-sm text-gray-500">Seller Earnings</p>
        </div>
    </div>
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border">
        <h2 class="text-lg font-bold mb-4">Revenue Chart</h2>
        <canvas id="revenueChart" height="100"></canvas>
    </div>
</div>
@endsection
