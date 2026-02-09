@extends('layouts.admin')

@section('title', 'Store Products - ' . $store->name)

@section('content')
<div class="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    <!-- Page Header -->
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span class="material-icons-round text-purple-600 dark:text-purple-400">inventory_2</span>
                Products for {{ $store->name }}
            </h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1">Manage products for this store</p>
        </div>
        <div class="flex gap-3">
            <a href="{{ route('admin.store.products.create', $store) }}"
               class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm hover:shadow-md">
                <span class="material-icons-round text-lg">add</span>
                Add Product
            </a>
            <a href="{{ route('admin.store.show', $store) }}"
               class="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                <span class="material-icons-round text-lg">arrow_back</span>
                Back to Store
            </a>
        </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <!-- Total Products -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Products</p>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ $products->total() }}</p>
                </div>
                <span class="material-icons-round text-3xl text-purple-600 dark:text-purple-400">inventory_2</span>
            </div>
        </div>

        <!-- Active Products -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ $products->where('status', 'active')->count() }}</p>
                </div>
                <span class="material-icons-round text-3xl text-green-600 dark:text-green-400">check_circle</span>
            </div>
        </div>

        <!-- Draft Products -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Draft</p>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ $products->where('status', 'draft')->count() }}</p>
                </div>
                <span class="material-icons-round text-3xl text-yellow-600 dark:text-yellow-400">edit</span>
            </div>
        </div>

        <!-- Low Stock -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Low Stock</p>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ $products->where('stock_quantity', '<=', 10)->count() }}</p>
                </div>
                <span class="material-icons-round text-3xl text-red-600 dark:text-red-400">warning</span>
            </div>
        </div>
    </div>

    <!-- Products Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        @if($products->count() > 0)
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                        @foreach($products as $product)
                            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-3">
                                        <img src="{{ $product->featured_image ?? '/images/placeholder-product.jpg' }}" alt="{{ $product->name }}" class="w-12 h-12 rounded-lg object-cover">
                                        <div>
                                            <p class="text-sm font-medium text-gray-900 dark:text-white">{{ $product->name }}</p>
                                            <p class="text-xs text-gray-500 dark:text-gray-400">{{ $product->sku ?? 'No SKU' }}</p>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <span class="text-sm text-gray-900 dark:text-white">{{ $product->category->name ?? 'Uncategorized' }}</span>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="text-sm text-gray-900 dark:text-white">
                                        <div>UGX {{ number_format($product->price ?? 0) }}</div>
                                        @if($product->price_credits > 0)
                                            <div class="text-xs text-gray-500">{{ $product->price_credits }} credits</div>
                                        @endif
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-2">
                                        <span class="text-sm text-gray-900 dark:text-white">{{ $product->stock_quantity ?? 0 }}</span>
                                        @if(($product->stock_quantity ?? 0) <= 10)
                                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                                Low
                                            </span>
                                        @endif
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                        @if($product->status === 'active') bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400
                                        @elseif($product->status === 'draft') bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400
                                        @else bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400 @endif">
                                        {{ ucfirst($product->status) }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <div class="flex items-center justify-end gap-2">
                                        <a href="{{ route('admin.store.products.show', [$store, $product]) }}"
                                           class="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 text-sm font-medium">
                                            View
                                        </a>
                                        <a href="{{ route('admin.store.products.edit', [$store, $product]) }}"
                                           class="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 text-sm font-medium">
                                            Edit
                                        </a>
                                        <form action="{{ route('admin.store.products.destroy', [$store, $product]) }}" method="POST" class="inline"
                                              onsubmit="return confirm('Are you sure you want to delete this product?')">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 text-sm font-medium">
                                                Delete
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            @if($products->hasPages())
                <div class="p-6 border-t border-gray-200 dark:border-gray-700">
                    {{ $products->links() }}
                </div>
            @endif
        @else
            <div class="p-12 text-center">
                <span class="material-icons-round text-6xl text-gray-400 dark:text-gray-600 mb-4 block">inventory_2</span>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No products yet</h3>
                <p class="text-gray-600 dark:text-gray-400 mb-6">This store doesn't have any products. Create the first one!</p>
                <a href="{{ route('admin.store.products.create', $store) }}"
                   class="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <span class="material-icons-round text-lg">add</span>
                    Add First Product
                </a>
            </div>
        @endif
    </div>

</div>
@endsection