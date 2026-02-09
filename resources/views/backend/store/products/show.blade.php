@extends('layouts.admin')

@section('title', $product->name . ' - ' . $store->name)

@section('content')
<div class="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

    <!-- Page Header -->
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $product->name }}</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1">Product in {{ $store->name }}</p>
        </div>
        <div class="flex gap-3">
            <a href="{{ route('admin.store.products.edit', [$store, $product]) }}"
               class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <span class="material-icons-round text-lg">edit</span>
                Edit Product
            </a>
            <a href="{{ route('admin.store.products.index', $store) }}"
               class="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                <span class="material-icons-round text-lg">arrow_back</span>
                Back to Products
            </a>
        </div>
    </div>

    <!-- Product Details -->
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Left Column -->
            <div class="space-y-4">
                <div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Basic Information</h3>
                    <div class="space-y-2">
                        <div><span class="font-medium">Name:</span> {{ $product->name }}</div>
                        <div><span class="font-medium">SKU:</span> {{ $product->sku ?? 'Not set' }}</div>
                        <div><span class="font-medium">Category:</span> {{ $product->category->name ?? 'Uncategorized' }}</div>
                        <div><span class="font-medium">Status:</span>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                @if($product->status === 'active') bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400
                                @elseif($product->status === 'draft') bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400
                                @else bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400 @endif">
                                {{ ucfirst($product->status) }}
                            </span>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                    <p class="text-gray-600 dark:text-gray-400">{{ $product->description }}</p>
                </div>
            </div>

            <!-- Right Column -->
            <div class="space-y-4">
                <div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Pricing</h3>
                    <div class="space-y-2">
                        <div><span class="font-medium">Price (UGX):</span> UGX {{ number_format($product->price ?? 0) }}</div>
                        @if($product->price_credits > 0)
                            <div><span class="font-medium">Price (Credits):</span> {{ $product->price_credits }} credits</div>
                        @endif
                        @if($product->compare_at_price)
                            <div><span class="font-medium">Compare at Price:</span> UGX {{ number_format($product->compare_at_price) }}</div>
                        @endif
                        <div><span class="font-medium">Allow Credit Payment:</span> {{ $product->allow_credit_payment ? 'Yes' : 'No' }}</div>
                    </div>
                </div>

                <div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Inventory</h3>
                    <div class="space-y-2">
                        <div class="flex items-center gap-2">
                            <span class="font-medium">Stock Quantity:</span>
                            <span class="text-lg font-bold">{{ $product->stock_quantity ?? 0 }}</span>
                            @if(($product->stock_quantity ?? 0) <= 10)
                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                    Low Stock
                                </span>
                            @endif
                        </div>
                        <div><span class="font-medium">Track Inventory:</span> {{ $product->track_inventory ? 'Yes' : 'No' }}</div>
                        <div><span class="font-medium">Allow Backorders:</span> {{ $product->allow_backorders ? 'Yes' : 'No' }}</div>
                        <div><span class="font-medium">Requires Shipping:</span> {{ $product->requires_shipping ? 'Yes' : 'No' }}</div>
                        @if($product->weight)
                            <div><span class="font-medium">Weight:</span> {{ $product->weight }} kg</div>
                        @endif
                    </div>
                </div>

                <div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Attributes</h3>
                    <div class="space-y-2">
                        <div><span class="font-medium">Digital Product:</span> {{ $product->is_digital ? 'Yes' : 'No' }}</div>
                        <div><span class="font-medium">Featured:</span> {{ $product->is_featured ? 'Yes' : 'No' }}</div>
                        @if($product->published_at)
                            <div><span class="font-medium">Published:</span> {{ $product->published_at->format('M d, Y H:i') }}</div>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Quick Stock Update -->
    @if($product->track_inventory)
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Stock Update</h3>
            <form action="{{ route('admin.store.products.update-stock', [$store, $product]) }}" method="POST" class="flex items-end gap-4">
                @csrf
                @method('PATCH')

                <div class="flex-1">
                    <label for="stock_quantity" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        New Stock Quantity
                    </label>
                    <input type="number" name="stock_quantity" id="stock_quantity" value="{{ $product->stock_quantity ?? 0 }}" min="0" required
                           class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500">
                </div>

                <div class="flex-1">
                    <label for="reason" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Reason (Optional)
                    </label>
                    <input type="text" name="reason" id="reason" placeholder="e.g., Inventory adjustment"
                           class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500">
                </div>

                <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Update Stock
                </button>
            </form>
        </div>
    @endif

    <!-- Danger Zone -->
    <div class="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-6">
        <h3 class="text-lg font-semibold text-red-900 dark:text-red-300 mb-4">Danger Zone</h3>
        <p class="text-red-700 dark:text-red-400 mb-4">Deleting this product is permanent and cannot be undone.</p>
        <form action="{{ route('admin.store.products.destroy', [$store, $product]) }}" method="POST" class="inline"
              onsubmit="return confirm('Are you sure you want to permanently delete this product? This action cannot be undone.')">
            @csrf
            @method('DELETE')
            <button type="submit" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Delete Product
            </button>
        </form>
    </div>

</div>
@endsection