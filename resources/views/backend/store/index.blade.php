@extends('layouts.admin')

@section('title', 'Store Management')

@section('content')
<div class="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span class="material-icons-round text-green-600 dark:text-green-400">storefront</span>
                Store Management
            </h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1">Manage all stores and products</p>
        </div>
        <div class="flex gap-3">
            <a href="{{ route('admin.store.create') }}"
               class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md">
                <span class="material-icons-round text-lg">add</span>
                Create Store
            </a>
        </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Total Stores -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all shadow-sm hover:shadow-md">
            <div class="flex items-center justify-between mb-4">
                <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <span class="material-icons-round text-2xl text-blue-600 dark:text-blue-400">storefront</span>
                </div>
                <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">Total</span>
            </div>
            <h3 class="text-3xl font-bold text-gray-900 dark:text-white mb-1">{{ $stats['total_stores'] ?? 0 }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Stores</p>
        </div>

        <!-- Active Stores -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-all shadow-sm hover:shadow-md">
            <div class="flex items-center justify-between mb-4">
                <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <span class="material-icons-round text-2xl text-green-600 dark:text-green-400">check_circle</span>
                </div>
                <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">Active</span>
            </div>
            <h3 class="text-3xl font-bold text-gray-900 dark:text-white mb-1">{{ $stats['active_stores'] ?? 0 }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Active Stores</p>
        </div>

        <!-- Total Products -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all shadow-sm hover:shadow-md">
            <div class="flex items-center justify-between mb-4">
                <div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <span class="material-icons-round text-2xl text-purple-600 dark:text-purple-400">inventory_2</span>
                </div>
                <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">Total</span>
            </div>
            <h3 class="text-3xl font-bold text-gray-900 dark:text-white mb-1">{{ $stats['total_products'] ?? 0 }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Products</p>
        </div>

        <!-- Total Orders -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-yellow-300 dark:hover:border-yellow-600 transition-all shadow-sm hover:shadow-md">
            <div class="flex items-center justify-between mb-4">
                <div class="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <span class="material-icons-round text-2xl text-yellow-600 dark:text-yellow-400">shopping_cart</span>
                </div>
                <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">Total</span>
            </div>
            <h3 class="text-3xl font-bold text-gray-900 dark:text-white mb-1">{{ $stats['total_orders'] ?? 0 }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Orders</p>
        </div>
    </div>

    <!-- Filters & Search -->
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <form method="GET" action="{{ route('admin.store.index') }}" class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- Search -->
            <div class="md:col-span-2 relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="material-icons-round text-gray-400">search</span>
                </div>
                <input type="text" name="search" value="{{ request('search') }}" placeholder="Search stores or owners..."
                       class="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500">
            </div>

            <!-- Status Filter -->
            <div>
                <select name="status" class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500">
                    <option value="">All Status</option>
                    <option value="active" {{ request('status') === 'active' ? 'selected' : '' }}>Active</option>
                    <option value="inactive" {{ request('status') === 'inactive' ? 'selected' : '' }}>Inactive</option>
                    <option value="suspended" {{ request('status') === 'suspended' ? 'selected' : '' }}>Suspended</option>
                </select>
            </div>

            <!-- Filter Button -->
            <div>
                <button type="submit" class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <span class="material-icons-round text-lg">filter_list</span>
                    Filter
                </button>
            </div>
        </form>
    </div>

    <!-- Stores List -->
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        @if($stores->count() > 0)
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Store</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Owner</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Products</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Orders</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                        @foreach($stores as $store)
                            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-3">
                                        <img src="{{ $store->logo_url ?? '/images/default-shop.png' }}" alt="{{ $store->name }}" class="w-12 h-12 rounded-lg object-cover">
                                        <div>
                                            <p class="text-sm font-medium text-gray-900 dark:text-white">{{ $store->name }}</p>
                                            <p class="text-xs text-gray-500 dark:text-gray-400">Created {{ $store->created_at->format('M d, Y') }}</p>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-2">
                                        <img src="{{ $store->user->avatar ?? '/images/default-avatar.svg' }}" alt="{{ $store->user->name }}" class="w-8 h-8 rounded-full">
                                        <span class="text-sm text-gray-900 dark:text-white">{{ $store->user->name }}</span>
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <span class="text-sm text-gray-900 dark:text-white">{{ $store->products_count ?? 0 }}</span>
                                </td>
                                <td class="px-6 py-4">
                                    <span class="text-sm text-gray-900 dark:text-white">{{ $store->orders_count ?? 0 }}</span>
                                </td>
                                <td class="px-6 py-4">
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                        @if($store->status === 'active') bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400
                                        @elseif($store->status === 'draft') bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400
                                        @elseif($store->status === 'suspended') bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400
                                        @else bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 @endif">
                                        {{ ucfirst($store->status) }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <div class="flex items-center justify-end gap-2">
                                        <a href="{{ route('admin.store.show', $store->slug) }}"
                                           class="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 text-sm font-medium">
                                            View
                                        </a>
                                        <a href="{{ route('admin.store.edit', $store->slug) }}"
                                           class="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 text-sm font-medium">
                                            Edit
                                        </a>
                                        <a href="{{ route('admin.store.products.index', $store->slug) }}"
                                           class="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 text-sm font-medium">
                                            Products
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            @if($stores->hasPages())
                <div class="p-6 border-t border-gray-200 dark:border-gray-700">
                    {{ $stores->links() }}
                </div>
            @endif
        @else
            <div class="p-12 text-center">
                <span class="material-icons-round text-6xl text-gray-400 dark:text-gray-600 mb-4 block">storefront</span>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No stores found</h3>
                @if(request()->hasAny(['search', 'status']))
                    <p class="text-gray-600 dark:text-gray-400 mb-6">Try adjusting your search or filters.</p>
                    <a href="{{ route('admin.store.index') }}"
                       class="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors mr-3">
                        <span class="material-icons-round text-lg">clear</span>
                        Clear Filters
                    </a>
                @else
                    <p class="text-gray-600 dark:text-gray-400 mb-6">Create the first store to get started.</p>
                @endif
                <a href="{{ route('admin.store.create') }}"
                   class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <span class="material-icons-round text-lg">add</span>
                    Create Store
                </a>
            </div>
        @endif
    </div>

</div>
@endsection