@extends('layouts.admin')

@section('title', 'Store Management')

@section('content')
<div x-data="storeManagement()" class="dashboard-content">

    <!-- Page Header -->
    <div class="flex items-center justify-between mb-6">
        <div>
            <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">Store Management</h1>
            <p class="text-slate-600 dark:text-navy-300 mt-1">Manage platform store, products, orders, and shops</p>
        </div>
        <div class="flex items-center gap-3">
            <div class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
                 :class="storeEnabled ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'">
                <div class="size-2 rounded-full animate-pulse"
                     :class="storeEnabled ? 'bg-success' : 'bg-warning'"></div>
                <span x-text="storeEnabled ? 'Store Active' : 'Store Disabled'"></span>
            </div>
        </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        <!-- Total Products -->
        <div class="card bg-gradient-to-br from-blue-500 to-blue-600 text-white p-5">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <p class="text-blue-100 text-sm font-medium">Total Products</p>
                    <h3 class="text-3xl font-bold mt-1" x-text="stats.total_products"></h3>
                </div>
                <div class="p-3 bg-white/20 rounded-xl">
                    <svg class="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                </div>
            </div>
            <div class="flex items-center justify-between text-sm">
                <span class="text-blue-100"><span x-text="stats.active_products"></span> active</span>
                <span class="text-blue-100"><span x-text="stats.pending_products"></span> pending</span>
            </div>
        </div>

        <!-- Total Orders -->
        <div class="card bg-gradient-to-br from-green-500 to-green-600 text-white p-5">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <p class="text-green-100 text-sm font-medium">Total Orders</p>
                    <h3 class="text-3xl font-bold mt-1" x-text="stats.total_orders"></h3>
                </div>
                <div class="p-3 bg-white/20 rounded-xl">
                    <svg class="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                </div>
            </div>
            <div class="flex items-center justify-between text-sm">
                <span class="text-green-100"><span x-text="stats.pending_orders"></span> pending</span>
                <span class="text-green-100"><span x-text="stats.completed_orders"></span> completed</span>
            </div>
        </div>

        <!-- Total Revenue -->
        <div class="card bg-gradient-to-br from-purple-500 to-purple-600 text-white p-5">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <p class="text-purple-100 text-sm font-medium">Total Revenue</p>
                    <h3 class="text-3xl font-bold mt-1">
                        <span x-text="formatCurrency(stats.total_revenue)"></span>
                    </h3>
                </div>
                <div class="p-3 bg-white/20 rounded-xl">
                    <svg class="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
            <div class="flex items-center justify-between text-sm">
                <span class="text-purple-100">UGX <span x-text="formatCurrency(stats.monthly_revenue)"></span> this month</span>
            </div>
        </div>

        <!-- Active Shops -->
        <div class="card bg-gradient-to-br from-orange-500 to-orange-600 text-white p-5">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <p class="text-orange-100 text-sm font-medium">Active Shops</p>
                    <h3 class="text-3xl font-bold mt-1" x-text="stats.active_shops"></h3>
                </div>
                <div class="p-3 bg-white/20 rounded-xl">
                    <svg class="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
            </div>
            <div class="flex items-center justify-between text-sm">
                <span class="text-orange-100"><span x-text="stats.total_shops"></span> total</span>
                <span class="text-orange-100"><span x-text="stats.pending_shops"></span> pending</span>
            </div>
        </div>
    </div>

    <!-- Tabs -->
    <div class="card p-0 mb-6">
        <div class="flex border-b border-slate-200 dark:border-navy-600">
            <button
                @click="activeTab = 'products'"
                :class="activeTab === 'products' ? 'border-primary text-primary' : 'border-transparent text-slate-600 dark:text-navy-300'"
                class="px-6 py-4 font-medium border-b-2 transition-colors hover:text-primary"
            >
                Products
            </button>
            <button
                @click="activeTab = 'orders'"
                :class="activeTab === 'orders' ? 'border-primary text-primary' : 'border-transparent text-slate-600 dark:text-navy-300'"
                class="px-6 py-4 font-medium border-b-2 transition-colors hover:text-primary"
            >
                Orders
            </button>
            <button
                @click="activeTab = 'shops'"
                :class="activeTab === 'shops' ? 'border-primary text-primary' : 'border-transparent text-slate-600 dark:text-navy-300'"
                class="px-6 py-4 font-medium border-b-2 transition-colors hover:text-primary"
            >
                Shops
            </button>
            <button
                @click="activeTab = 'analytics'"
                :class="activeTab === 'analytics' ? 'border-primary text-primary' : 'border-transparent text-slate-600 dark:text-navy-300'"
                class="px-6 py-4 font-medium border-b-2 transition-colors hover:text-primary"
            >
                Analytics
            </button>
        </div>

        <!-- Tab Content -->
        <div class="p-6">
            <!-- Products Tab -->
            <div x-show="activeTab === 'products'">
                <div class="flex items-center justify-between mb-6">
                    <div class="relative flex-1 max-w-md">
                        <input
                            type="text"
                            x-model="filters.search"
                            @input.debounce.300ms="loadProducts()"
                            placeholder="Search products..."
                            class="form-input w-full pl-10"
                        >
                        <svg class="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <div class="flex items-center gap-3">
                        <select
                            x-model="filters.status"
                            @change="loadProducts()"
                            class="form-select"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="pending">Pending</option>
                        </select>

                        <select
                            x-model="filters.category"
                            @change="loadProducts()"
                            class="form-select"
                        >
                            <option value="">All Categories</option>
                            <option value="merchandise">Merchandise</option>
                            <option value="services">Services</option>
                            <option value="experiences">Experiences</option>
                            <option value="digital">Digital</option>
                            <option value="tickets">Tickets</option>
                        </select>
                    </div>
                </div>

                <!-- Products Table -->
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead class="bg-slate-100 dark:bg-navy-800">
                            <tr>
                                <th class="px-4 py-3 font-semibold text-slate-800 dark:text-navy-50">Product</th>
                                <th class="px-4 py-3 font-semibold text-slate-800 dark:text-navy-50">Shop</th>
                                <th class="px-4 py-3 font-semibold text-slate-800 dark:text-navy-50">Category</th>
                                <th class="px-4 py-3 font-semibold text-slate-800 dark:text-navy-50">Price</th>
                                <th class="px-4 py-3 font-semibold text-slate-800 dark:text-navy-50">Stock</th>
                                <th class="px-4 py-3 font-semibold text-slate-800 dark:text-navy-50">Sales</th>
                                <th class="px-4 py-3 font-semibold text-slate-800 dark:text-navy-50">Status</th>
                                <th class="px-4 py-3 font-semibold text-slate-800 dark:text-navy-50">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template x-for="product in products" :key="product.id">
                                <tr class="border-b border-slate-200 dark:border-navy-600 hover:bg-slate-50 dark:hover:bg-navy-700">
                                    <td class="px-4 py-3">
                                        <div class="flex items-center gap-3">
                                            <img
                                                :src="product.image_url || '/images/placeholder-product.jpg'"
                                                :alt="product.name"
                                                class="size-12 rounded-lg object-cover"
                                            >
                                            <div>
                                                <p class="font-medium text-slate-800 dark:text-navy-50 line-clamp-1" x-text="product.name"></p>
                                                <p class="text-xs text-slate-500 dark:text-navy-400" x-text="'#' + product.id"></p>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-4 py-3">
                                        <p class="text-sm text-slate-600 dark:text-navy-300" x-text="product.shop?.name"></p>
                                    </td>
                                    <td class="px-4 py-3">
                                        <span class="badge badge-info capitalize" x-text="product.category"></span>
                                    </td>
                                    <td class="px-4 py-3">
                                        <p class="font-medium text-slate-800 dark:text-navy-50">
                                            UGX <span x-text="Number(product.price_ugx).toLocaleString()"></span>
                                        </p>
                                        <p x-show="product.price_credits > 0" class="text-xs text-yellow-600">
                                            <span x-text="product.price_credits"></span> credits
                                        </p>
                                    </td>
                                    <td class="px-4 py-3">
                                        <span
                                            :class="product.stock_quantity === 0 ? 'text-error' : (product.stock_quantity <= 5 ? 'text-warning' : 'text-success')"
                                            class="font-medium"
                                            x-text="product.stock_quantity"
                                        ></span>
                                    </td>
                                    <td class="px-4 py-3">
                                        <span class="text-slate-600 dark:text-navy-300" x-text="product.total_sales || 0"></span>
                                    </td>
                                    <td class="px-4 py-3">
                                        <span
                                            :class="{
                                                'badge-success': product.is_active,
                                                'badge-warning': !product.is_active
                                            }"
                                            class="badge"
                                            x-text="product.is_active ? 'Active' : 'Inactive'"
                                        ></span>
                                    </td>
                                    <td class="px-4 py-3">
                                        <div class="flex items-center gap-2">
                                            <button
                                                @click="viewProduct(product)"
                                                class="btn btn-sm btn-info"
                                                title="View"
                                            >
                                                <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>
                                            <button
                                                @click="toggleProductStatus(product)"
                                                :class="product.is_active ? 'btn-warning' : 'btn-success'"
                                                class="btn btn-sm"
                                                :title="product.is_active ? 'Deactivate' : 'Activate'"
                                            >
                                                <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            </button>
                                            <button
                                                @click="deleteProduct(product)"
                                                class="btn btn-sm btn-error"
                                                title="Delete"
                                            >
                                                <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Orders Tab -->
            <div x-show="activeTab === 'orders'">
                @include('backend.admin.store.orders')
            </div>

            <!-- Shops Tab -->
            <div x-show="activeTab === 'shops'">
                @include('backend.admin.store.shops')
            </div>

            <!-- Analytics Tab -->
            <div x-show="activeTab === 'analytics'">
                @include('backend.admin.store.analytics')
            </div>
        </div>
    </div>

</div>

@push('scripts')
<script>
function storeManagement() {
    return {
        activeTab: 'products',
        storeEnabled: {{ config('store.enabled', false) ? 'true' : 'false' }},
        stats: {
            total_products: 0,
            active_products: 0,
            pending_products: 0,
            total_orders: 0,
            pending_orders: 0,
            completed_orders: 0,
            total_revenue: 0,
            monthly_revenue: 0,
            active_shops: 0,
            total_shops: 0,
            pending_shops: 0
        },
        filters: {
            search: '',
            status: '',
            category: ''
        },
        products: [],

        init() {
            this.loadStats();
            this.loadProducts();
        },

        async loadStats() {
            try {
                const response = await fetch('/api/admin/store/stats');
                const data = await response.json();
                this.stats = data;
            } catch (error) {
                console.error('Error loading stats:', error);
            }
        },

        async loadProducts() {
            try {
                const params = new URLSearchParams({
                    search: this.filters.search,
                    status: this.filters.status,
                    category: this.filters.category
                });

                const response = await fetch(`/api/admin/store/products?${params}`);
                const data = await response.json();
                this.products = data.data;
            } catch (error) {
                console.error('Error loading products:', error);
            }
        },

        viewProduct(product) {
            window.open(`/store/products/${product.slug}`, '_blank');
        },

        async toggleProductStatus(product) {
            try {
                const response = await fetch(`/api/admin/store/products/${product.id}/toggle-status`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                    }
                });

                if (response.ok) {
                    await this.loadProducts();
                    await this.loadStats();
                }
            } catch (error) {
                console.error('Error toggling product status:', error);
            }
        },

        async deleteProduct(product) {
            if (!confirm(`Delete "${product.name}"? This action cannot be undone.`)) return;

            try {
                const response = await fetch(`/api/admin/store/products/${product.id}`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                    }
                });

                if (response.ok) {
                    await this.loadProducts();
                    await this.loadStats();
                }
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        },

        formatCurrency(amount) {
            return Number(amount || 0).toLocaleString();
        }
    }
}
</script>
@endpush
@endsection
