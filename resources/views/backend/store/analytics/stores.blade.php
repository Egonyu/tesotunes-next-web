@extends('layouts.admin')
@section('title', 'Store Analytics')
@section('content')
<div class="space-y-6">
    <h1 class="text-2xl font-bold">Store Performance</h1>
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border">
        <h2 class="text-lg font-bold mb-4">Top Performing Stores</h2>
        <table class="w-full">
            <thead>
                <tr class="bg-gray-50">
                    <th class="px-4 py-2 text-left">Store</th>
                    <th class="px-4 py-2 text-left">Owner</th>
                    <th class="px-4 py-2 text-left">Products</th>
                    <th class="px-4 py-2 text-left">Sales</th>
                    <th class="px-4 py-2 text-left">Revenue</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data['top_stores'] ?? [] as $store)
                <tr class="border-t">
                    <td class="px-4 py-2">{{ $store->name }}</td>
                    <td class="px-4 py-2">{{ $store->owner->name }}</td>
                    <td class="px-4 py-2">{{ $store->products_count }}</td>
                    <td class="px-4 py-2">{{ $store->total_sales }}</td>
                    <td class="px-4 py-2">UGX {{ number_format($store->revenue) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</div>
@endsection
