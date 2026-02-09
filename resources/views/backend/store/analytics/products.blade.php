@extends('layouts.admin')
@section('title', 'Product Analytics')
@section('content')
<div class="space-y-6">
    <h1 class="text-2xl font-bold">Product Analytics</h1>
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border">
        <h2 class="text-lg font-bold mb-4">Top Selling Products</h2>
        <table class="w-full">
            <thead>
                <tr class="bg-gray-50">
                    <th class="px-4 py-2 text-left">Product</th>
                    <th class="px-4 py-2 text-left">Store</th>
                    <th class="px-4 py-2 text-left">Sales</th>
                    <th class="px-4 py-2 text-left">Revenue</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data['top_products'] ?? [] as $product)
                <tr class="border-t">
                    <td class="px-4 py-2">{{ $product->name }}</td>
                    <td class="px-4 py-2">{{ $product->store->name }}</td>
                    <td class="px-4 py-2">{{ $product->total_sales }}</td>
                    <td class="px-4 py-2">UGX {{ number_format($product->revenue) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</div>
@endsection
