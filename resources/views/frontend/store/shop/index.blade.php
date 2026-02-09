@extends('frontend.layouts.store')

@section('title', 'My Shop - Manage Store')

@section('content')
<div x-data="myShop()" class="min-h-screen bg-black text-white py-8">

    <div class="max-w-7xl mx-auto px-4">

        <!-- Shop Header -->
        <div class="bg-gray-900 rounded-2xl p-8 mb-8 border border-gray-800">
            <div class="flex items-start justify-between mb-6">
                <div class="flex items-start gap-6">
                    <!-- Shop Logo -->
                    <div class="relative">
                        <img
                            :src="shop.logo_url || '/images/default-shop.png'"
                            alt="Shop Logo"
                            class="w-32 h-32 rounded-xl object-cover ring-4 ring-gray-800"
                        >
                        <button
                            @click="$refs.logoUpload.click()"
                            class="absolute bottom-2 right-2 bg-green-600 hover:bg-green-700 p-2 rounded-lg transition-colors"
                        >
                            <span class="material-icons-round text-sm">camera_alt</span>
                        </button>
                        <input
                            type="file"
                            x-ref="logoUpload"
                            @change="uploadLogo($event)"
                            accept="image/*"
                            class="hidden"
                        >
                    </div>

                    <!-- Shop Info -->
                    <div class="flex-1">
                        <h1 class="text-3xl font-bold text-white mb-2" x-text="shop.name || 'My Shop'"></h1>
                        <p class="text-gray-400 mb-4" x-text="shop.description || 'No description yet'"></p>

                        <!-- Quick Stats -->
                        <div class="flex items-center gap-6 text-sm">
                            <div>
                                <span class="text-gray-400">Products:</span>
                                <span class="text-white font-semibold ml-2" x-text="stats.total_products"></span>
                            </div>
                            <div>
                                <span class="text-gray-400">Total Sales:</span>
                                <span class="text-white font-semibold ml-2" x-text="stats.total_sales"></span>
                            </div>
                            <div>
                                <span class="text-gray-400">Revenue:</span>
                                <span class="text-white font-semibold ml-2">UGX <span x-text="stats.total_revenue?.toLocaleString()"></span></span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-3">
                    <a :href="`/store/stores/${shop.slug}`"
                       target="_blank"
                       class="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors">
                        <span class="material-icons-round text-sm">open_in_new</span>
                        View Shop
                    </a>
                    <button
                        @click="showEditModal = true"
                        class="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors">
                        <span class="material-icons-round text-sm">edit</span>
                        Edit Shop
                    </button>
                </div>
            </div>

            <!-- Shop Status Toggle -->
            <div class="flex items-center justify-between pt-6 border-t border-gray-800">
                <div>
                    <p class="text-white font-semibold mb-1">Shop Status</p>
                    <p class="text-sm text-gray-400">
                        <span x-show="shop.is_active">Your shop is visible to customers</span>
                        <span x-show="!shop.is_active">Your shop is currently hidden</span>
                    </p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        x-model="shop.is_active"
                        @change="toggleShopStatus()"
                        class="sr-only peer"
                    >
                    <div class="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                </label>
            </div>
        </div>

        <!-- Tabs -->
        <div class="mb-6">
            <div class="flex gap-4 border-b border-gray-800">
                <button
                    @click="activeTab = 'products'"
                    :class="activeTab === 'products' ? 'border-green-500 text-white' : 'border-transparent text-gray-400'"
                    class="px-4 py-3 font-medium border-b-2 transition-colors"
                >
                    Products
                </button>
                <button
                    @click="activeTab = 'orders'"
                    :class="activeTab === 'orders' ? 'border-green-500 text-white' : 'border-transparent text-gray-400'"
                    class="px-4 py-3 font-medium border-b-2 transition-colors"
                >
                    Orders
                </button>
                <button
                    @click="activeTab = 'analytics'"
                    :class="activeTab === 'analytics' ? 'border-green-500 text-white' : 'border-transparent text-gray-400'"
                    class="px-4 py-3 font-medium border-b-2 transition-colors"
                >
                    Analytics
                </button>
                <button
                    @click="activeTab = 'settings'"
                    :class="activeTab === 'settings' ? 'border-green-500 text-white' : 'border-transparent text-gray-400'"
                    class="px-4 py-3 font-medium border-b-2 transition-colors"
                >
                    Settings
                </button>
            </div>
        </div>

        <!-- Tab Content -->
        <div>
            <!-- Products Tab -->
            <div x-show="activeTab === 'products'">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold text-white">My Products</h2>
                    <a href="{{ route('frontend.store.shop.products.create') }}"
                       class="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-medium text-white transition-colors">
                        <span class="material-icons-round">add</span>
                        Add Product
                    </a>
                </div>

                <!-- Products Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <template x-for="product in products" :key="product.id">
                        <div class="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 group">
                            <div class="relative aspect-square overflow-hidden">
                                <img
                                    :src="product.image_url || '/images/placeholder-product.svg'"
                                    :alt="product.name"
                                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                >
                                <div class="absolute top-3 right-3">
                                    <span
                                        x-show="!product.is_active"
                                        class="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-bold"
                                    >
                                        Inactive
                                    </span>
                                    <span
                                        x-show="product.stock_quantity === 0"
                                        class="bg-orange-500 text-white px-3 py-1 rounded-lg text-xs font-bold"
                                    >
                                        Out of Stock
                                    </span>
                                </div>
                            </div>

                            <div class="p-4">
                                <h3 class="text-white font-semibold mb-2 line-clamp-2" x-text="product.name"></h3>
                                <p class="text-gray-400 text-sm mb-3 capitalize" x-text="product.category"></p>

                                <div class="flex items-center justify-between mb-4">
                                    <div>
                                        <p class="text-white font-bold">
                                            UGX <span x-text="Number(product.price_ugx).toLocaleString()"></span>
                                        </p>
                                        <p class="text-xs text-gray-500">
                                            Stock: <span x-text="product.stock_quantity"></span>
                                        </p>
                                    </div>
                                    <div class="text-right text-xs text-gray-500">
                                        <p><span x-text="product.total_sales || 0"></span> sold</p>
                                        <p><span x-text="product.views || 0"></span> views</p>
                                    </div>
                                </div>

                                <div class="flex gap-2">
                                    <a
                                        :href="`/store/products/${product.slug}/edit`"
                                        class="flex-1 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-center transition-colors flex items-center justify-center gap-1"
                                    >
                                        <span class="material-icons-round text-sm">edit</span>
                                        <span class="text-sm">Edit</span>
                                    </a>
                                    <button
                                        @click="deleteProduct(product.id)"
                                        class="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2 rounded-lg transition-colors"
                                    >
                                        <span class="material-icons-round text-sm">delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>

                <!-- Empty State -->
                <div x-show="products.length === 0" class="text-center py-20 bg-gray-900 rounded-xl">
                    <span class="material-icons-round text-6xl text-gray-600 mb-4">inventory_2</span>
                    <h3 class="text-xl font-semibold text-white mb-2">No Products Yet</h3>
                    <p class="text-gray-400 mb-6">Start selling by adding your first product</p>
                    <a href="{{ route('frontend.store.shop.products.create') }}"
                       class="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-medium text-white transition-colors">
                        <span class="material-icons-round">add</span>
                        Add Product
                    </a>
                </div>
            </div>

            <!-- Orders Tab -->
            <div x-show="activeTab === 'orders'">
                @include('frontend.store.shop.orders')
            </div>

            <!-- Analytics Tab -->
            <div x-show="activeTab === 'analytics'">
                @include('frontend.store.shop.analytics')
            </div>

            <!-- Settings Tab -->
            <div x-show="activeTab === 'settings'">
                @include('frontend.store.shop.settings')
            </div>
        </div>

    </div>

</div>

@push('scripts')
<script>
function myShop() {
    return {
        activeTab: 'products',
        showEditModal: false,
        shop: {},
        stats: {},
        products: [],

        init() {
            this.loadShop();
            this.loadProducts();
        },

        async loadShop() {
            try {
                const response = await fetch('/api/store/shop/my-shop');
                const data = await response.json();
                this.shop = data.shop;
                this.stats = data.stats;
            } catch (error) {
                console.error('Error loading shop:', error);
            }
        },

        async loadProducts() {
            try {
                const response = await fetch('/api/store/shop/products');
                const data = await response.json();
                this.products = data.data;
            } catch (error) {
                console.error('Error loading products:', error);
            }
        },

        async toggleShopStatus() {
            try {
                const response = await fetch('/api/store/shop/toggle-status', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                    },
                    body: JSON.stringify({
                        is_active: this.shop.is_active
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to update shop status');
                }
            } catch (error) {
                console.error('Error toggling shop status:', error);
                this.shop.is_active = !this.shop.is_active; // Revert
            }
        },

        async uploadLogo(event) {
            const file = event.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('logo', file);

            try {
                const response = await fetch('/api/store/shop/upload-logo', {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                    },
                    body: formData
                });

                const data = await response.json();
                if (response.ok) {
                    this.shop.logo_url = data.logo_url;
                }
            } catch (error) {
                console.error('Error uploading logo:', error);
            }
        },

        async deleteProduct(productId) {
            if (!confirm('Are you sure you want to delete this product?')) return;

            try {
                const response = await fetch(`/api/store/shop/products/${productId}`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                    }
                });

                if (response.ok) {
                    await this.loadProducts();
                    await this.loadShop(); // Refresh stats
                }
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    }
}
</script>
@endpush
@endsection
