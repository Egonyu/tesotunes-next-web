@extends('frontend.layouts.store')

@section('title', 'TesoTunes Store Marketplace')
@section('page_title', 'Marketplace')

@section('content')
<div class="space-y-8">
    
    <!-- Welcome Hero Section -->
    <div class="w-full bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-64 h-64 bg-brand-green/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="relative z-10">
            <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
                @auth
                    Good {{ now()->hour < 12 ? 'morning' : (now()->hour < 17 ? 'afternoon' : 'evening') }}, {{ auth()->user()->first_name ?? 'there' }}!
                @else
                    Welcome to the Store!
                @endauth
            </h1>
            <p class="text-gray-500 dark:text-gray-400 mb-8 max-w-xl">Discover exclusive artist merchandise, limited vinyl drops, and support your favorite creators directly.</p>
            
            <div class="flex flex-wrap items-center gap-4 mb-10">
                <a href="#products" class="bg-brand-green hover:bg-green-600 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg shadow-green-500/20">
                    <span class="material-symbols-outlined">shopping_cart</span>
                    Start Shopping
                </a>
                <a href="#categories" class="bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-6 py-3 rounded-full font-semibold border border-gray-200 dark:border-gray-600 transition-all flex items-center gap-2">
                    <span class="material-symbols-outlined">category</span>
                    Browse Categories
                </a>
                @guest
                <a href="{{ route('login') }}" class="text-gray-600 dark:text-gray-300 font-semibold px-4 flex items-center gap-2 hover:text-brand-green transition-colors">
                    <span class="material-symbols-outlined">person_add</span>
                    Sign Up
                </a>
                @endguest
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div>
                    <div class="text-3xl font-bold text-brand-green">{{ number_format($products->total() ?? $products->count()) }}+</div>
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Products</div>
                </div>
                <div>
                    <div class="text-3xl font-bold text-brand-green">{{ $featuredStores->count() ?? 0 }}+</div>
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Verified Sellers</div>
                </div>
                <div>
                    <div class="text-3xl font-bold text-brand-green">12,500+</div>
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Orders</div>
                </div>
                <div>
                    <div class="text-3xl font-bold text-brand-green">24h</div>
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Dispatch Time</div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Category Cards -->
    <div id="categories" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <a href="{{ route('frontend.store.index', ['category' => 'merch']) }}" class="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-brand-green/50 dark:hover:border-brand-green/50 transition-all group shadow-sm hover:shadow-md">
            <div class="flex items-start justify-between mb-4">
                <div class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-brand-green">
                    <span class="material-symbols-outlined">checkroom</span>
                </div>
                <span class="material-symbols-outlined text-gray-300 dark:text-gray-600 group-hover:text-brand-green transition-colors">arrow_outward</span>
            </div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-1">Apparel</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">Official hoodies, tees & caps</p>
        </a>
        
        <a href="{{ route('frontend.store.index', ['category' => 'music']) }}" class="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all group shadow-sm hover:shadow-md">
            <div class="flex items-start justify-between mb-4">
                <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-500">
                    <span class="material-symbols-outlined">album</span>
                </div>
                <span class="material-symbols-outlined text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors">arrow_outward</span>
            </div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-1">Physical Music</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">Vinyls, CDs & Cassettes</p>
        </a>
        
        <a href="{{ route('frontend.store.index', ['category' => 'tickets']) }}" class="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-all group shadow-sm hover:shadow-md">
            <div class="flex items-start justify-between mb-4">
                <div class="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-500">
                    <span class="material-symbols-outlined">confirmation_number</span>
                </div>
                <span class="material-symbols-outlined text-gray-300 dark:text-gray-600 group-hover:text-purple-500 transition-colors">arrow_outward</span>
            </div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-1">Event Tickets</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">Concerts & Meet-ups</p>
        </a>
        
        <a href="{{ route('frontend.store.index', ['category' => 'digital']) }}" class="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-orange-500/50 dark:hover:border-orange-500/50 transition-all group shadow-sm hover:shadow-md">
            <div class="flex items-start justify-between mb-4">
                <div class="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-500">
                    <span class="material-symbols-outlined">diamond</span>
                </div>
                <span class="material-symbols-outlined text-gray-300 dark:text-gray-600 group-hover:text-orange-500 transition-colors">arrow_outward</span>
            </div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-1">Digital Goods</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">Sample packs & presets</p>
        </a>
    </div>

    <!-- Featured Stores Section -->
    @if($featuredStores->count() > 0)
    <div class="mb-2">
        <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">Featured Stores</h2>
            <a href="{{ route('frontend.store.index') }}" class="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-brand-green flex items-center gap-1 transition-colors">
                View All
                <span class="material-symbols-outlined text-lg">arrow_forward</span>
            </a>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @foreach($featuredStores->take(3) as $store)
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex gap-4 hover:shadow-md transition-shadow group">
                <div class="w-24 h-24 rounded-lg bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                    @if($store->logo)
                    <img alt="{{ $store->name }}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src="{{ Storage::url($store->logo) }}"/>
                    @else
                    <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-green to-teal-600">
                        <span class="material-symbols-outlined text-white text-3xl">storefront</span>
                    </div>
                    @endif
                </div>
                <div class="flex flex-col justify-center flex-1 min-w-0">
                    @if($store->is_featured)
                    <span class="text-xs font-bold text-brand-green uppercase mb-1">Featured</span>
                    @endif
                    <h3 class="font-bold text-gray-900 dark:text-white mb-1 truncate">{{ $store->name }}</h3>
                    @if($store->artist && $store->artist->user)
                    <p class="text-sm text-gray-500 dark:text-gray-400 mb-2 truncate">By {{ $store->artist->user->name }}</p>
                    @endif
                    <a href="{{ route('frontend.store.show', $store->slug) }}" class="text-sm font-bold text-brand-green hover:text-green-600 transition-colors">Visit Store →</a>
                </div>
            </div>
            @endforeach
        </div>
    </div>
    @endif

    <!-- Products Section -->
    <div id="products">
        <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                @if(request('category'))
                    {{ ucfirst(request('category')) }} Products
                @else
                    Fan Favorites
                @endif
            </h2>
            <div class="flex items-center gap-4">
                <!-- Sort Dropdown -->
                <select id="sortBy" class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white py-2 px-3 focus:ring-2 focus:ring-brand-green focus:border-brand-green">
                    <option value="newest" {{ request('sort') == 'newest' ? 'selected' : '' }}>Newest</option>
                    <option value="popular" {{ request('sort') == 'popular' ? 'selected' : '' }}>Popular</option>
                    <option value="price_low" {{ request('sort') == 'price_low' ? 'selected' : '' }}>Price: Low to High</option>
                    <option value="price_high" {{ request('sort') == 'price_high' ? 'selected' : '' }}>Price: High to Low</option>
                </select>
            </div>
        </div>
        
        @if($products->count() > 0)
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6" id="productsGrid">
            @foreach($products as $product)
            <div class="group cursor-pointer">
                <div class="bg-gray-100 dark:bg-gray-800 rounded-xl aspect-square mb-3 overflow-hidden relative">
                    <img alt="{{ $product->name }}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="{{ $product->featured_image_url ?? asset('images/placeholder-product.svg') }}"/>
                    
                    <!-- Price Badge -->
                    <div class="absolute top-2 right-2 bg-white dark:bg-black/50 text-xs font-bold px-2 py-1 rounded text-gray-900 dark:text-white shadow-sm backdrop-blur-md">
                        UGX {{ number_format($product->price_ugx) }}
                    </div>
                    
                    <!-- Discount Badge -->
                    @if($product->discount_percentage > 0)
                    <div class="absolute top-2 left-2 bg-brand-orange text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                        -{{ $product->discount_percentage }}%
                    </div>
                    @endif
                    
                    <!-- Quick Actions (Show on hover) -->
                    <div class="absolute bottom-2 left-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <a href="{{ route('frontend.store.products.show', $product->id) }}" class="flex-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs font-semibold py-2 rounded-lg text-center hover:bg-brand-green hover:text-white transition-colors">
                            View
                        </a>
                        <button onclick="addToCart({{ $product->id }})" class="flex-1 bg-brand-green text-white text-xs font-semibold py-2 rounded-lg hover:bg-green-600 transition-colors" @if($product->inventory_quantity === 0) disabled @endif>
                            Add to Cart
                        </button>
                    </div>
                </div>
                
                <a href="{{ route('frontend.store.products.show', $product->id) }}">
                    <h3 class="font-bold text-gray-900 dark:text-white truncate group-hover:text-brand-green transition-colors">{{ $product->name }}</h3>
                </a>
                
                @if($product->store && $product->store->user)
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ $product->store->user->name }}</p>
                @endif
                
                <!-- Rating -->
                @if(($product->rating_average ?? 0) > 0)
                <div class="flex items-center gap-1 mt-1">
                    <span class="material-symbols-outlined text-brand-orange text-sm">star</span>
                    <span class="text-xs text-gray-900 dark:text-white font-semibold">{{ number_format($product->rating_average ?? 0, 1) }}</span>
                    <span class="text-xs text-gray-400">({{ $product->reviews_count ?? 0 }})</span>
                </div>
                @endif
            </div>
            @endforeach
        </div>
        
        <!-- Load More / Pagination -->
        @if($products->hasMorePages())
        <div class="mt-10 flex justify-center">
            <a href="{{ $products->nextPageUrl() }}" class="px-8 py-3 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-white hover:bg-brand-green hover:border-brand-green hover:shadow-lg hover:shadow-green-500/20 transition-all text-sm font-bold flex items-center gap-2 group">
                Load More Products 
                <span class="material-symbols-outlined text-lg group-hover:translate-y-0.5 transition-transform">expand_more</span>
            </a>
        </div>
        @endif
        
        @else
        <!-- Empty State -->
        <div class="text-center py-20 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
            <span class="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-500 mb-4 block">inventory_2</span>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Products Found</h3>
            <p class="text-gray-500 dark:text-gray-400 mb-6">Try adjusting your filters or search query</p>
            @auth
                @if(auth()->user()->hasAnyRole(['artist', 'super_admin', 'admin']))
                <a href="{{ route('frontend.store.my-stores') }}" class="inline-flex items-center gap-2 bg-brand-green hover:bg-green-600 px-6 py-3 rounded-lg font-medium text-white transition-colors">
                    <span class="material-symbols-outlined">add</span>
                    Create Your Store
                </a>
                @endif
            @endauth
        </div>
        @endif
    </div>
    
</div>

@push('scripts')
<script>
// Enhanced cart functionality
function addToCart(productId, quantity = 1) {
    // Check if user is authenticated
    @guest
    showNotification('Please login to add items to cart', 'info');
    setTimeout(() => window.location.href = '{{ route('login') }}', 1500);
    return;
    @endguest

    // Verify CSRF token exists
    if (!window.StoreConfig?.csrfToken) {
        console.error('CSRF token not found in window.StoreConfig');
        showNotification('Error: Page configuration missing. Please refresh the page.', 'error');
        return;
    }

    const url = `/store/cart/add/${productId}`;
    
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': window.StoreConfig.csrfToken,
            'Accept': 'application/json'
        },
        body: JSON.stringify({ 
            quantity: quantity,
            payment_method: 'ugx'
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            showNotification('✓ Product added to cart!', 'success');
            updateCartCount();
            window.dispatchEvent(new CustomEvent('cartUpdated', { detail: data.cart }));
        } else {
            showNotification(data.message || 'Failed to add product to cart', 'error');
        }
    })
    .catch(error => {
        console.error('Error adding to cart:', error);
        showNotification(error.message || 'Failed to add product to cart. Please try again.', 'error');
    });
}

function updateCartCount() {
    @auth
    fetch('/store/cart/count')
        .then(response => response.json())
        .then(data => {
            document.querySelectorAll('.cart-count-badge').forEach(badge => {
                badge.textContent = data.count;
                badge.classList.toggle('hidden', data.count === 0);
            });
            
            if (window.cartManager) {
                window.cartManager.cartCount = data.count;
                window.cartManager.updateBadges();
            }
        })
        .catch(error => console.error('Error updating cart count:', error));
    @endauth
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-24 right-4 px-6 py-3 rounded-xl text-white z-50 transform transition-all duration-300 shadow-lg ${
        type === 'success' ? 'bg-brand-green' :
        type === 'error' ? 'bg-red-600' : 
        'bg-brand-blue'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('translate-x-0'), 10);
    
    setTimeout(() => {
        notification.classList.add('opacity-0', 'translate-x-full');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Sort functionality
document.addEventListener('DOMContentLoaded', function() {
    const sortBy = document.getElementById('sortBy');
    
    if (sortBy) {
        sortBy.addEventListener('change', function() {
            const params = new URLSearchParams(window.location.search);
            
            if (this.value !== 'newest') {
                params.set('sort', this.value);
            } else {
                params.delete('sort');
            }
            
            params.delete('page');
            
            const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
            window.location.href = newUrl;
        });
    }
});

// Initialize cart count on page load
updateCartCount();
</script>
@endpush

@endsection
