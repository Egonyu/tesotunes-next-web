@extends('frontend.layouts.store')

@section('title', $store->name . ' - Artist Store')
@section('page_title', $store->name)

@section('content')
<div class="space-y-6">
    
    <!-- Artist Store Hero - Mobile Optimized -->
    <div class="relative rounded-2xl overflow-hidden">
        <!-- Banner -->
        <div class="h-32 sm:h-48 md:h-56 w-full">
            @if($store->banner)
            <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('{{ Storage::url($store->banner) }}');"></div>
            @else
            <div class="absolute inset-0 bg-gradient-to-br from-brand-green/30 via-teal-600/30 to-purple-600/30"></div>
            @endif
            <div class="absolute inset-0 bg-gradient-to-t from-[#0D1117] via-[#0D1117]/60 to-transparent"></div>
        </div>
        
        <!-- Store Info Overlay -->
        <div class="relative -mt-16 sm:-mt-20 px-4 sm:px-6 pb-4">
            <div class="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                <!-- Store Logo -->
                <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-[#0D1117] overflow-hidden shadow-xl bg-gray-800 flex-shrink-0">
                    @if($store->logo)
                    <img src="{{ Storage::url($store->logo) }}" alt="{{ $store->name }}" class="w-full h-full object-cover"/>
                    @else
                    <div class="w-full h-full bg-gradient-to-br from-brand-green to-teal-500 flex items-center justify-center">
                        <span class="text-3xl font-black text-white">{{ substr($store->name, 0, 1) }}</span>
                    </div>
                    @endif
                </div>
                
                <!-- Store Details -->
                <div class="flex-1 min-w-0">
                    <div class="flex flex-wrap items-center gap-2 mb-1">
                        @if($store->is_verified)
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-green text-white text-xs font-bold rounded-full">
                            <span class="material-symbols-outlined text-sm">verified</span>
                            Verified
                        </span>
                        @endif
                        @if($store->user && $store->user->artist)
                        <span class="px-2 py-0.5 bg-purple-600/20 text-purple-400 text-xs font-bold rounded-full">Artist Store</span>
                        @endif
                    </div>
                    <h1 class="text-2xl sm:text-3xl font-extrabold text-white truncate">{{ $store->name }}</h1>
                    <p class="text-sm text-gray-400 mt-1">{{ $store->tagline ?? 'Official Store' }}</p>
                    
                    <!-- Stats -->
                    <div class="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-400">
                        <span class="flex items-center gap-1">
                            <span class="material-symbols-outlined text-lg text-brand-green">inventory_2</span>
                            {{ $store->products_count ?? $store->products->count() }} Products
                        </span>
                        <span class="flex items-center gap-1">
                            <span class="material-symbols-outlined text-lg text-brand-orange">star</span>
                            {{ number_format($store->rating_average ?? 4.8, 1) }} Rating
                        </span>
                        @if($store->sales_count)
                        <span class="flex items-center gap-1">
                            <span class="material-symbols-outlined text-lg text-pink-500">shopping_bag</span>
                            {{ number_format($store->sales_count) }} Sales
                        </span>
                        @endif
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="flex gap-2 w-full sm:w-auto">
                    @auth
                        @if($store->user && $store->user->artist)
                        <button onclick="followArtist({{ $store->user->artist->id }})" 
                                class="flex-1 sm:flex-none px-6 py-2.5 bg-brand-green hover:bg-green-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                            <span class="material-symbols-outlined">person_add</span>
                            <span>Follow</span>
                        </button>
                        @endif
                    @else
                    <a href="{{ route('login') }}" 
                       class="flex-1 sm:flex-none px-6 py-2.5 bg-brand-green hover:bg-green-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined">person_add</span>
                        <span>Follow</span>
                    </a>
                    @endauth
                    <button onclick="shareStore()" 
                            class="p-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all">
                        <span class="material-symbols-outlined">share</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Tab Navigation - Mobile Scrollable -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="flex overflow-x-auto scrollbar-hide border-b border-gray-200 dark:border-gray-700">
            <button onclick="showStoreTab('products')" id="tab-products" 
                    class="px-6 py-3.5 text-sm font-semibold text-brand-green border-b-2 border-brand-green whitespace-nowrap flex items-center gap-2">
                <span class="material-symbols-outlined text-lg">storefront</span>
                Products
            </button>
            <button onclick="showStoreTab('about')" id="tab-about" 
                    class="px-6 py-3.5 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent whitespace-nowrap flex items-center gap-2">
                <span class="material-symbols-outlined text-lg">info</span>
                About
            </button>
            @if($store->user && $store->user->artist)
            <a href="{{ route('frontend.artist.show', $store->user->artist->slug) }}" 
               class="px-6 py-3.5 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent whitespace-nowrap flex items-center gap-2">
                <span class="material-symbols-outlined text-lg">person</span>
                Artist Profile
            </a>
            <a href="{{ route('frontend.artist.show', $store->user->artist->slug) }}#music" 
               class="px-6 py-3.5 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent whitespace-nowrap flex items-center gap-2">
                <span class="material-symbols-outlined text-lg">music_note</span>
                Music
            </a>
            @endif
            <button onclick="showStoreTab('reviews')" id="tab-reviews" 
                    class="px-6 py-3.5 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent whitespace-nowrap flex items-center gap-2">
                <span class="material-symbols-outlined text-lg">reviews</span>
                Reviews
            </button>
        </div>
    </div>
    
    <!-- Products Tab Content -->
    <div id="content-products">
        <!-- Filter & Sort Bar - Mobile Optimized -->
        <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
            <!-- Category Filters - Horizontal Scroll on Mobile -->
            <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide w-full sm:w-auto">
                <button onclick="filterProducts('all')" data-filter="all"
                        class="filter-btn active px-4 py-2 rounded-full bg-brand-green text-white font-bold text-sm whitespace-nowrap transition-all">
                    All Products
                </button>
                <button onclick="filterProducts('physical')" data-filter="physical"
                        class="filter-btn px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium text-sm whitespace-nowrap transition-all">
                    Physical
                </button>
                <button onclick="filterProducts('digital')" data-filter="digital"
                        class="filter-btn px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium text-sm whitespace-nowrap transition-all">
                    Digital
                </button>
                <button onclick="filterProducts('ticket')" data-filter="ticket"
                        class="filter-btn px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium text-sm whitespace-nowrap transition-all">
                    Tickets
                </button>
            </div>
            
            <!-- Sort Dropdown -->
            <select id="sortSelect" onchange="sortProducts(this.value)"
                    class="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-green">
                <option value="best_selling">Best Selling</option>
                <option value="newest">Newest</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
            </select>
        </div>
        
        <!-- Products Grid - Mobile 2 columns, Desktop 3-4 columns -->
        @if($products && $products->count() > 0)
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" id="products-grid">
            @foreach($products as $product)
            <div class="product-item group" data-type="{{ $product->product_type ?? 'physical' }}" data-price="{{ $product->price_ugx }}" data-date="{{ $product->created_at }}">
                <a href="{{ route('frontend.store.products.show', $product->id) }}" class="block">
                    <!-- Product Image -->
                    <div class="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-3">
                        <img src="{{ $product->featured_image_url ?? asset('images/placeholder-product.svg') }}" 
                             alt="{{ $product->name }}" 
                             class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                        
                        <!-- Quick Actions -->
                        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <button onclick="event.preventDefault(); quickAddToCart({{ $product->id }})" 
                                    class="p-3 bg-white dark:bg-gray-900 rounded-full text-gray-900 dark:text-white shadow-lg hover:bg-brand-green hover:text-white transition-all transform scale-90 group-hover:scale-100">
                                <span class="material-symbols-outlined">add_shopping_cart</span>
                            </button>
                        </div>
                        
                        <!-- Badges -->
                        <div class="absolute top-2 left-2 flex flex-col gap-1">
                            @if($product->is_new)
                            <span class="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded">NEW</span>
                            @endif
                            @if($product->discount_percentage > 0)
                            <span class="px-2 py-0.5 bg-brand-orange text-white text-xs font-bold rounded">-{{ $product->discount_percentage }}%</span>
                            @endif
                        </div>
                        
                        <!-- Product Type Badge -->
                        <div class="absolute top-2 right-2">
                            <span class="px-2 py-0.5 text-xs font-bold rounded backdrop-blur-md
                                @if($product->product_type === 'digital') bg-blue-500/80 text-white
                                @elseif($product->product_type === 'ticket') bg-purple-500/80 text-white
                                @else bg-white/80 dark:bg-black/50 text-gray-900 dark:text-white @endif">
                                {{ ucfirst($product->product_type ?? 'Physical') }}
                            </span>
                        </div>
                        
                        <!-- Price Tag -->
                        <div class="absolute bottom-2 right-2 px-2 py-1 bg-white dark:bg-black/70 backdrop-blur-md rounded-lg shadow-sm">
                            <span class="text-sm font-bold text-brand-green">UGX {{ number_format($product->price_ugx) }}</span>
                        </div>
                    </div>
                    
                    <!-- Product Info -->
                    <h3 class="font-bold text-gray-900 dark:text-white text-sm line-clamp-2 group-hover:text-brand-green transition-colors">{{ $product->name }}</h3>
                    
                    @if($product->rating_average > 0)
                    <div class="flex items-center gap-1 mt-1">
                        <span class="material-symbols-outlined text-brand-orange text-sm">star</span>
                        <span class="text-xs text-gray-500 dark:text-gray-400">{{ number_format($product->rating_average, 1) }}</span>
                    </div>
                    @endif
                </a>
            </div>
            @endforeach
        </div>
        
        <!-- Pagination -->
        @if($products->hasPages())
        <div class="mt-8">
            {{ $products->links() }}
        </div>
        @endif
        
        @else
        <!-- Empty State -->
        <div class="py-16 text-center">
            <div class="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <span class="material-symbols-outlined text-4xl text-gray-400">inventory_2</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">No products yet</h3>
            <p class="text-gray-500 dark:text-gray-400">This store hasn't added any products yet. Check back soon!</p>
        </div>
        @endif
    </div>
    
    <!-- About Tab Content (Hidden by default) -->
    <div id="content-about" class="hidden">
        <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">About {{ $store->name }}</h2>
            
            @if($store->description)
            <div class="prose dark:prose-invert max-w-none mb-6">
                {!! nl2br(e($store->description)) !!}
            </div>
            @else
            <p class="text-gray-500 dark:text-gray-400 mb-6">No description available.</p>
            @endif
            
            <!-- Store Info Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                @if($store->location)
                <div class="p-4 bg-gray-50 dark:bg-gray-950 rounded-xl">
                    <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined text-brand-green">location_on</span>
                        <div>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Location</p>
                            <p class="font-medium text-gray-900 dark:text-white">{{ $store->location }}</p>
                        </div>
                    </div>
                </div>
                @endif
                
                <div class="p-4 bg-gray-50 dark:bg-gray-950 rounded-xl">
                    <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined text-brand-green">calendar_month</span>
                        <div>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Joined</p>
                            <p class="font-medium text-gray-900 dark:text-white">{{ $store->created_at->format('M Y') }}</p>
                        </div>
                    </div>
                </div>
                
                @if($store->shipping_info)
                <div class="p-4 bg-gray-50 dark:bg-gray-950 rounded-xl sm:col-span-2">
                    <div class="flex items-start gap-3">
                        <span class="material-symbols-outlined text-brand-green">local_shipping</span>
                        <div>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Shipping Info</p>
                            <p class="font-medium text-gray-900 dark:text-white">{{ $store->shipping_info }}</p>
                        </div>
                    </div>
                </div>
                @endif
            </div>
        </div>
    </div>
    
    <!-- Reviews Tab Content (Hidden by default) -->
    <div id="content-reviews" class="hidden">
        <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Store Reviews</h2>
            
            @if(isset($reviews) && $reviews->count() > 0)
            <div class="space-y-4">
                @foreach($reviews as $review)
                <div class="p-4 bg-gray-50 dark:bg-gray-950 rounded-xl">
                    <div class="flex items-start justify-between mb-2">
                        <div class="flex items-center gap-3">
                            <img class="w-10 h-10 rounded-full" 
                                 src="{{ $review->user->avatar_url ?? asset('images/default-avatar.svg') }}" 
                                 alt="{{ $review->user->name }}"/>
                            <div>
                                <p class="font-semibold text-gray-900 dark:text-white">{{ $review->user->name }}</p>
                                <p class="text-xs text-gray-500">{{ $review->created_at->diffForHumans() }}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-1">
                            @for($i = 1; $i <= 5; $i++)
                            <span class="material-symbols-outlined text-sm {{ $i <= $review->rating ? 'text-brand-orange' : 'text-gray-300 dark:text-gray-600' }}">star</span>
                            @endfor
                        </div>
                    </div>
                    <p class="text-gray-700 dark:text-gray-300">{{ $review->comment }}</p>
                </div>
                @endforeach
            </div>
            @else
            <p class="text-gray-500 dark:text-gray-400 text-center py-8">No reviews yet. Be the first to review!</p>
            @endif
        </div>
    </div>
</div>

@push('scripts')
<script>
// Tab switching
function showStoreTab(tabName) {
    ['products', 'about', 'reviews'].forEach(tab => {
        const tabBtn = document.getElementById('tab-' + tab);
        const content = document.getElementById('content-' + tab);
        if (tabBtn && content) {
            if (tab === tabName) {
                tabBtn.classList.add('text-brand-green', 'border-brand-green');
                tabBtn.classList.remove('text-gray-500', 'dark:text-gray-400', 'border-transparent');
                content.classList.remove('hidden');
            } else {
                tabBtn.classList.remove('text-brand-green', 'border-brand-green');
                tabBtn.classList.add('text-gray-500', 'dark:text-gray-400', 'border-transparent');
                content.classList.add('hidden');
            }
        }
    });
}

// Filter products
function filterProducts(type) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-brand-green', 'text-white');
        btn.classList.add('bg-gray-100', 'dark:bg-gray-800', 'text-gray-600', 'dark:text-gray-400');
    });
    
    const activeBtn = document.querySelector(`[data-filter="${type}"]`);
    activeBtn.classList.add('active', 'bg-brand-green', 'text-white');
    activeBtn.classList.remove('bg-gray-100', 'dark:bg-gray-800', 'text-gray-600', 'dark:text-gray-400');
    
    document.querySelectorAll('.product-item').forEach(item => {
        if (type === 'all' || item.dataset.type === type) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

// Sort products
function sortProducts(sortBy) {
    const grid = document.getElementById('products-grid');
    const items = Array.from(grid.querySelectorAll('.product-item'));
    
    items.sort((a, b) => {
        switch(sortBy) {
            case 'price_low':
                return parseInt(a.dataset.price) - parseInt(b.dataset.price);
            case 'price_high':
                return parseInt(b.dataset.price) - parseInt(a.dataset.price);
            case 'newest':
                return new Date(b.dataset.date) - new Date(a.dataset.date);
            default:
                return 0;
        }
    });
    
    items.forEach(item => grid.appendChild(item));
}

// Quick add to cart
function quickAddToCart(productId) {
    @guest
    showNotification('Please login to add items to cart', 'info');
    return;
    @endguest
    
    fetch(`/store/cart/add/${productId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': '{{ csrf_token() }}',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ quantity: 1, payment_method: 'ugx' })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('✓ Added to cart!', 'success');
            if (window.cartManager) window.cartManager.updateBadges();
        } else {
            showNotification(data.message || 'Failed to add to cart', 'error');
        }
    })
    .catch(error => showNotification('Error adding to cart', 'error'));
}

// Share store
function shareStore() {
    if (navigator.share) {
        navigator.share({
            title: '{{ $store->name }} - TesoTunes Store',
            text: 'Check out {{ $store->name }} on TesoTunes!',
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(window.location.href);
        showNotification('Link copied!', 'success');
    }
}

// Follow artist
function followArtist(artistId) {
    fetch(`/artist/${artistId}/follow`, {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': '{{ csrf_token() }}',
            'Accept': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        showNotification(data.message || 'Following!', 'success');
    })
    .catch(error => showNotification('Error following artist', 'error'));
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-4 px-6 py-3 rounded-xl text-white z-50 shadow-lg ' +
        (type === 'success' ? 'bg-brand-green' : type === 'error' ? 'bg-red-600' : 'bg-blue-500');
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
</script>
@endpush
@endsection
