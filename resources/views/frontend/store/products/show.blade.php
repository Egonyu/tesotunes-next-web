@extends('frontend.layouts.store')

@section('title', $product->name . ' - TesoTunes Store')
@section('page_title', $product->name)

@section('right-sidebar')
{{-- No right sidebar on product detail page --}}
@endsection

@section('content')
<div class="space-y-6">
    
    <!-- Breadcrumbs - Mobile Friendly -->
    <nav class="flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400 items-center overflow-x-auto pb-2">
        <a class="hover:text-brand-green transition-colors whitespace-nowrap" href="{{ route('frontend.home') }}">Home</a>
        <span class="material-symbols-outlined text-xs">chevron_right</span>
        <a class="hover:text-brand-green transition-colors whitespace-nowrap" href="{{ route('frontend.store.index') }}">Store</a>
        @if($product->store)
        <span class="material-symbols-outlined text-xs">chevron_right</span>
        <a class="hover:text-brand-green transition-colors whitespace-nowrap" href="{{ route('frontend.store.show', $product->store) }}">{{ Str::limit($product->store->name, 20) }}</a>
        @endif
        <span class="material-symbols-outlined text-xs">chevron_right</span>
        <span class="text-gray-900 dark:text-white font-medium truncate max-w-[150px]">{{ $product->name }}</span>
    </nav>

    <!-- Product Grid - Mobile First -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
        
        <!-- Left: Image Gallery -->
        <div class="space-y-4">
            <!-- Main Image -->
            <div class="relative w-full aspect-square bg-gray-100 dark:bg-gray-900 rounded-2xl overflow-hidden group border border-gray-200 dark:border-gray-700">
                @php
                    $mainImage = $product->featured_image_url ?? ($product->images[0] ?? null);
                    if ($mainImage && !str_starts_with($mainImage, 'http')) {
                        $mainImage = Storage::url($mainImage);
                    }
                @endphp
                
                @if($mainImage)
                <img id="mainProductImage" src="{{ $mainImage }}" alt="{{ $product->name }}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                @else
                <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-green/10 to-teal-500/10">
                    <span class="material-symbols-outlined text-8xl text-gray-300 dark:text-gray-600">
                        @if($product->product_type === 'digital') album @elseif($product->product_type === 'ticket') confirmation_number @else shopping_bag @endif
                    </span>
                </div>
                @endif
                
                <!-- Mobile Back Button -->
                <button onclick="window.history.back()" class="lg:hidden absolute top-4 left-4 p-2 bg-white/90 dark:bg-black/50 backdrop-blur-md rounded-full text-gray-900 dark:text-white shadow-lg">
                    <span class="material-symbols-outlined">arrow_back</span>
                </button>
                
                <!-- Action Buttons -->
                <div class="absolute top-4 right-4 flex gap-2">
                    <button id="shareBtn" class="p-2 bg-white/90 dark:bg-black/50 backdrop-blur-md rounded-full text-gray-900 dark:text-white shadow-lg hover:bg-brand-green hover:text-white transition-colors">
                        <span class="material-symbols-outlined">share</span>
                    </button>
                    <button id="wishlistBtn" class="p-2 bg-white/90 dark:bg-black/50 backdrop-blur-md rounded-full text-gray-900 dark:text-white shadow-lg hover:bg-pink-500 transition-colors">
                        <span class="material-symbols-outlined">favorite</span>
                    </button>
                </div>
                
                <!-- Discount Badge -->
                @if($product->discount_percentage > 0)
                <div class="absolute bottom-4 left-4 px-3 py-1 bg-brand-orange text-white text-sm font-bold rounded-full shadow-lg">
                    -{{ $product->discount_percentage }}% OFF
                </div>
                @endif
            </div>
            
            <!-- Thumbnail Gallery -->
            @if($product->images && count($product->images) > 1)
            <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                @foreach($product->images as $index => $image)
                <button onclick="changeMainImage('{{ Storage::url($image) }}')" class="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 {{ $index === 0 ? 'border-brand-green' : 'border-transparent' }} hover:border-brand-green transition-colors">
                    <img src="{{ Storage::url($image) }}" alt="{{ $product->name }} {{ $index + 1 }}" class="w-full h-full object-cover"/>
                </button>
                @endforeach
            </div>
            @endif
        </div>

        <!-- Right: Product Details -->
        <div class="space-y-6">
            <!-- Product Type Badge -->
            <div class="flex items-center gap-2 flex-wrap">
                <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                    @if($product->product_type === 'digital') bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400
                    @elseif($product->product_type === 'ticket') bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400
                    @else bg-green-100 dark:bg-green-900/30 text-brand-green @endif">
                    {{ ucfirst($product->product_type ?? 'Physical') }}
                </span>
                @if($product->inventory_quantity <= 5 && $product->inventory_quantity > 0)
                <span class="px-3 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                    Only {{ $product->inventory_quantity }} left!
                </span>
                @endif
            </div>
            
            <!-- Product Title -->
            <div>
                <h1 class="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">{{ $product->name }}</h1>
                @if($product->store && $product->store->user)
                <a href="{{ route('frontend.store.show', $product->store) }}" class="inline-flex items-center gap-2 mt-2 text-gray-500 dark:text-gray-400 hover:text-brand-green transition-colors">
                    <img class="w-6 h-6 rounded-full object-cover" src="{{ $product->store->user->avatar_url ?? asset('images/default-avatar.svg') }}" alt="{{ $product->store->user->name }}"/>
                    <span class="text-sm font-medium">{{ $product->store->name }}</span>
                    @if($product->store->is_verified)
                    <span class="material-symbols-outlined text-brand-green text-sm">verified</span>
                    @endif
                </a>
                @endif
            </div>
            
            <!-- Rating -->
            @if(($product->rating_average ?? 0) > 0)
            <div class="flex items-center gap-2">
                <div class="flex items-center gap-1">
                    @for($i = 1; $i <= 5; $i++)
                    <span class="material-symbols-outlined text-lg {{ $i <= round($product->rating_average) ? 'text-brand-orange' : 'text-gray-300 dark:text-gray-600' }}">star</span>
                    @endfor
                </div>
                <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ number_format($product->rating_average, 1) }}</span>
                <span class="text-sm text-gray-500 dark:text-gray-400">({{ $product->reviews_count ?? 0 }} reviews)</span>
            </div>
            @endif
            
            <!-- Price Section -->
            <div class="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div class="flex items-end gap-3 flex-wrap">
                    <span class="text-3xl md:text-4xl font-extrabold text-brand-green">UGX {{ number_format($product->price_ugx) }}</span>
                    @if($product->original_price_ugx && $product->original_price_ugx > $product->price_ugx)
                    <span class="text-lg text-gray-400 line-through">UGX {{ number_format($product->original_price_ugx) }}</span>
                    @endif
                </div>
                @if($product->price_credits > 0)
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Or pay with <span class="text-brand-green font-bold">{{ number_format($product->price_credits) }} Credits</span>
                </p>
                @endif
            </div>
            
            <!-- Quantity & Add to Cart -->
            <div class="space-y-4">
                <!-- Quantity Selector -->
                <div class="flex items-center gap-4">
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity:</label>
                    <div class="flex items-center bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                        <button onclick="updateQuantity(-1)" class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-brand-green transition-colors">
                            <span class="material-symbols-outlined">remove</span>
                        </button>
                        <input type="number" id="quantity" value="1" min="1" max="{{ $product->inventory_quantity ?? 99 }}" class="w-16 text-center bg-transparent border-0 text-gray-900 dark:text-white font-bold focus:ring-0"/>
                        <button onclick="updateQuantity(1)" class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-brand-green transition-colors">
                            <span class="material-symbols-outlined">add</span>
                        </button>
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="flex flex-col sm:flex-row gap-3">
                    <button onclick="addToCart({{ $product->id }})" class="flex-1 bg-brand-green hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" @if($product->inventory_quantity === 0) disabled @endif>
                        <span class="material-symbols-outlined">shopping_cart</span>
                        {{ $product->inventory_quantity === 0 ? 'Out of Stock' : 'Add to Cart' }}
                    </button>
                    <button onclick="buyNow({{ $product->id }})" class="flex-1 sm:flex-none bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-900 dark:text-white font-bold py-4 px-6 rounded-xl border border-gray-200 dark:border-gray-700 transition-all flex items-center justify-center gap-2" @if($product->inventory_quantity === 0) disabled @endif>
                        <span class="material-symbols-outlined">bolt</span>
                        Buy Now
                    </button>
                </div>
            </div>
            
            <!-- Product Info Cards -->
            <div class="grid grid-cols-2 gap-3">
                <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <span class="material-symbols-outlined text-brand-green text-xl mb-1">local_shipping</span>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Free shipping on orders over UGX 100,000</p>
                </div>
                <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <span class="material-symbols-outlined text-brand-green text-xl mb-1">verified_user</span>
                    <p class="text-xs text-gray-500 dark:text-gray-400">100% Authentic guaranteed</p>
                </div>
                <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <span class="material-symbols-outlined text-brand-green text-xl mb-1">autorenew</span>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Easy returns within 7 days</p>
                </div>
                <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <span class="material-symbols-outlined text-brand-green text-xl mb-1">support_agent</span>
                    <p class="text-xs text-gray-500 dark:text-gray-400">24/7 customer support</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Product Description & Details Tabs -->
    <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <!-- Tab Headers -->
        <div class="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            <button onclick="showTab('description')" id="tab-description" class="px-6 py-4 text-sm font-semibold text-brand-green border-b-2 border-brand-green whitespace-nowrap">Description</button>
            <button onclick="showTab('specifications')" id="tab-specifications" class="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent whitespace-nowrap">Specifications</button>
            <button onclick="showTab('reviews')" id="tab-reviews" class="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent whitespace-nowrap">Reviews ({{ $product->reviews_count ?? 0 }})</button>
            <button onclick="showTab('shipping')" id="tab-shipping" class="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent whitespace-nowrap">Shipping</button>
        </div>
        
        <!-- Tab Content -->
        <div class="p-6">
            <!-- Description Tab -->
            <div id="content-description" class="prose dark:prose-invert max-w-none">
                {!! nl2br(e($product->description ?? 'No description available.')) !!}
            </div>
            
            <!-- Specifications Tab -->
            <div id="content-specifications" class="hidden">
                @if($product->specifications)
                <dl class="space-y-3">
                    @foreach($product->specifications as $key => $value)
                    <div class="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ $key }}</dt>
                        <dd class="text-sm text-gray-900 dark:text-white">{{ $value }}</dd>
                    </div>
                    @endforeach
                </dl>
                @else
                <p class="text-gray-500 dark:text-gray-400">No specifications available.</p>
                @endif
            </div>
            
            <!-- Reviews Tab -->
            <div id="content-reviews" class="hidden">
                @if(isset($product->reviews) && $product->reviews->count() > 0)
                <div class="space-y-4">
                    @foreach($product->reviews as $review)
                    <div class="p-4 bg-gray-50 dark:bg-gray-950 rounded-lg">
                        <div class="flex items-start justify-between mb-2">
                            <div class="flex items-center gap-2">
                                <img class="w-8 h-8 rounded-full" src="{{ $review->user->avatar_url ?? asset('images/default-avatar.svg') }}" alt="{{ $review->user->name }}"/>
                                <div>
                                    <p class="font-semibold text-gray-900 dark:text-white text-sm">{{ $review->user->name }}</p>
                                    <p class="text-xs text-gray-500">{{ $review->created_at->diffForHumans() }}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-1">
                                @for($i = 1; $i <= 5; $i++)
                                <span class="material-symbols-outlined text-sm {{ $i <= $review->rating ? 'text-brand-orange' : 'text-gray-300' }}">star</span>
                                @endfor
                            </div>
                        </div>
                        <p class="text-gray-700 dark:text-gray-300 text-sm">{{ $review->comment }}</p>
                    </div>
                    @endforeach
                </div>
                @else
                <p class="text-gray-500 dark:text-gray-400">No reviews yet. Be the first to review!</p>
                @endif
            </div>
            
            <!-- Shipping Tab -->
            <div id="content-shipping" class="hidden space-y-4">
                <div class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-950 rounded-lg">
                    <span class="material-symbols-outlined text-brand-green">schedule</span>
                    <div>
                        <p class="font-semibold text-gray-900 dark:text-white text-sm">Processing Time</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">1-2 business days</p>
                    </div>
                </div>
                <div class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-950 rounded-lg">
                    <span class="material-symbols-outlined text-brand-green">local_shipping</span>
                    <div>
                        <p class="font-semibold text-gray-900 dark:text-white text-sm">Standard Delivery</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">3-5 business days within Kampala, 5-7 days nationwide</p>
                    </div>
                </div>
                <div class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-950 rounded-lg">
                    <span class="material-symbols-outlined text-brand-green">payments</span>
                    <div>
                        <p class="font-semibold text-gray-900 dark:text-white text-sm">Free Shipping</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">On orders over UGX 100,000</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Related Products -->
    @if(isset($relatedProducts) && $relatedProducts->count() > 0)
    <div>
        <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">You May Also Like</h2>
            <a href="{{ route('frontend.store.index') }}" class="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-brand-green flex items-center gap-1">
                View All <span class="material-symbols-outlined text-lg">arrow_forward</span>
            </a>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            @foreach($relatedProducts->take(4) as $related)
            <a href="{{ route('frontend.store.products.show', $related->id) }}" class="group">
                <div class="bg-gray-100 dark:bg-gray-800 rounded-xl aspect-square mb-3 overflow-hidden relative">
                    <img alt="{{ $related->name }}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="{{ $related->featured_image_url ?? asset('images/placeholder-product.svg') }}"/>
                    <div class="absolute top-2 right-2 bg-white dark:bg-black/50 text-xs font-bold px-2 py-1 rounded text-gray-900 dark:text-white shadow-sm backdrop-blur-md">
                        UGX {{ number_format($related->price_ugx) }}
                    </div>
                </div>
                <h3 class="font-bold text-gray-900 dark:text-white truncate group-hover:text-brand-green transition-colors">{{ $related->name }}</h3>
                @if($related->store && $related->store->user)
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ $related->store->user->name }}</p>
                @endif
            </a>
            @endforeach
        </div>
    </div>
    @endif
</div>

<!-- Mobile Fixed Bottom Bar -->
<div class="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 z-50 safe-area-inset-bottom">
    <div class="flex items-center gap-3">
        <div class="flex-1">
            <p class="text-xs text-gray-500 dark:text-gray-400">Price</p>
            <p class="text-xl font-extrabold text-brand-green">UGX {{ number_format($product->price_ugx) }}</p>
        </div>
        <button onclick="addToCart({{ $product->id }})" class="flex-1 bg-brand-green hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2" @if($product->inventory_quantity === 0) disabled @endif>
            <span class="material-symbols-outlined">shopping_cart</span>
            Add to Cart
        </button>
    </div>
</div>

@push('scripts')
<script>
// Tab functionality
function showTab(tabName) {
    ['description', 'specifications', 'reviews', 'shipping'].forEach(tab => {
        document.getElementById('tab-' + tab).classList.remove('text-brand-green', 'border-brand-green');
        document.getElementById('tab-' + tab).classList.add('text-gray-500', 'dark:text-gray-400', 'border-transparent');
        document.getElementById('content-' + tab).classList.add('hidden');
    });
    document.getElementById('tab-' + tabName).classList.add('text-brand-green', 'border-brand-green');
    document.getElementById('tab-' + tabName).classList.remove('text-gray-500', 'dark:text-gray-400', 'border-transparent');
    document.getElementById('content-' + tabName).classList.remove('hidden');
}

// Change main image
function changeMainImage(src) {
    document.getElementById('mainProductImage').src = src;
}

// Quantity controls
function updateQuantity(delta) {
    const input = document.getElementById('quantity');
    let newVal = parseInt(input.value) + delta;
    const max = parseInt(input.max);
    const min = parseInt(input.min);
    if (newVal >= min && newVal <= max) {
        input.value = newVal;
    }
}

// Add to cart
function addToCart(productId) {
    const quantity = document.getElementById('quantity').value;
    
    @guest
    showNotification('Please login to add items to cart', 'info');
    setTimeout(() => window.location.href = '{{ route('login') }}', 1500);
    return;
    @endguest
    
    fetch(`/store/cart/add/${productId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': '{{ csrf_token() }}',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ quantity: parseInt(quantity), payment_method: 'ugx' })
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

// Buy now
function buyNow(productId) {
    const quantity = document.getElementById('quantity').value;
    addToCart(productId);
    setTimeout(() => window.location.href = '{{ route('frontend.store.cart') }}', 500);
}

// Share product
document.getElementById('shareBtn')?.addEventListener('click', () => {
    if (navigator.share) {
        navigator.share({
            title: '{{ $product->name }}',
            text: 'Check out this product on TesoTunes!',
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(window.location.href);
        showNotification('Link copied!', 'success');
    }
});

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 px-6 py-3 rounded-xl text-white z-50 shadow-lg ${
        type === 'success' ? 'bg-brand-green' : type === 'error' ? 'bg-red-600' : 'bg-blue-500'
    }`;
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
