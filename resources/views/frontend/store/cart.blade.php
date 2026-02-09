@extends('frontend.layouts.store')

@section('title', 'Shopping Cart - TesoTunes Store')
@section('page_title', 'Shopping Cart')

@section('content')
<div class="space-y-6">
    
    <!-- Mobile Back Header -->
    <div class="lg:hidden flex items-center justify-between">
        <a href="{{ route('frontend.store.index') }}" class="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-brand-green transition-colors">
            <span class="material-symbols-outlined">arrow_back</span>
            <span class="text-sm font-medium">Continue Shopping</span>
        </a>
        <button onclick="clearCart()" class="text-red-500 hover:text-red-600 text-sm font-medium">Clear Cart</button>
    </div>

    @if(isset($cartItems) && $cartItems->count() > 0)
    <!-- Cart Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Cart Items List -->
        <div class="lg:col-span-2 space-y-4">
            <!-- Cart Header - Desktop -->
            <div class="hidden lg:flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                <h2 class="text-lg font-bold text-gray-900 dark:text-white">
                    Cart Items <span class="text-gray-400 font-normal">({{ $cartItems->count() }})</span>
                </h2>
                <button onclick="clearCart()" class="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-1">
                    <span class="material-symbols-outlined text-lg">delete</span>
                    Clear Cart
                </button>
            </div>
            
            @php
                // Group items by store
                $groupedItems = $cartItems->groupBy(function($item) {
                    return $item->product->store_id ?? 'default';
                });
            @endphp
            
            @foreach($groupedItems as $storeId => $items)
            <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <!-- Store Header -->
                @php
                    $store = $items->first()->product->store ?? null;
                @endphp
                @if($store)
                <div class="px-4 py-3 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                    <img class="w-8 h-8 rounded-full object-cover" src="{{ $store->logo ? Storage::url($store->logo) : asset('images/default-store.png') }}" alt="{{ $store->name }}"/>
                    <a href="{{ route('frontend.store.show', $store) }}" class="font-semibold text-gray-900 dark:text-white hover:text-brand-green transition-colors">{{ $store->name }}</a>
                    @if($store->is_verified)
                    <span class="material-symbols-outlined text-brand-green text-sm">verified</span>
                    @endif
                </div>
                @endif
                
                <!-- Items -->
                <div class="divide-y divide-gray-100 dark:divide-gray-800">
                    @foreach($items as $item)
                    <div class="p-4 cart-item-{{ $item->id }}" data-item-id="{{ $item->id }}">
                        <div class="flex gap-4">
                            <!-- Product Image -->
                            <a href="{{ route('frontend.store.products.show', $item->product_id) }}" class="flex-shrink-0">
                                <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                                    <img src="{{ $item->product->featured_image_url ?? asset('images/placeholder-product.svg') }}" alt="{{ $item->product->name }}" class="w-full h-full object-cover"/>
                                </div>
                            </a>
                            
                            <!-- Product Details -->
                            <div class="flex-1 min-w-0">
                                <div class="flex items-start justify-between gap-2">
                                    <div>
                                        <a href="{{ route('frontend.store.products.show', $item->product_id) }}" class="font-bold text-gray-900 dark:text-white hover:text-brand-green transition-colors line-clamp-2">
                                            {{ $item->product->name }}
                                        </a>
                                        @if($item->product->product_type)
                                        <span class="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded
                                            @if($item->product->product_type === 'digital') bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400
                                            @elseif($item->product->product_type === 'ticket') bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400
                                            @else bg-green-100 dark:bg-green-900/30 text-brand-green @endif">
                                            {{ ucfirst($item->product->product_type) }}
                                        </span>
                                        @endif
                                    </div>
                                    <button onclick="removeItem({{ $item->id }})" class="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                                        <span class="material-symbols-outlined text-xl">close</span>
                                    </button>
                                </div>
                                
                                <!-- Price & Quantity -->
                                <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
                                    <div class="flex items-center bg-gray-100 dark:bg-gray-950 rounded-lg">
                                        <button onclick="updateQuantity({{ $item->id }}, -1)" class="px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-brand-green transition-colors">
                                            <span class="material-symbols-outlined text-lg">remove</span>
                                        </button>
                                        <span class="w-10 text-center text-gray-900 dark:text-white font-bold text-sm" id="qty-{{ $item->id }}">{{ $item->quantity }}</span>
                                        <button onclick="updateQuantity({{ $item->id }}, 1)" class="px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-brand-green transition-colors">
                                            <span class="material-symbols-outlined text-lg">add</span>
                                        </button>
                                    </div>
                                    <p class="text-lg font-bold text-brand-green" id="price-{{ $item->id }}">
                                        UGX {{ number_format($item->product->price_ugx * $item->quantity) }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    @endforeach
                </div>
            </div>
            @endforeach
        </div>
        
        <!-- Order Summary -->
        <div class="lg:col-span-1">
            <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 sticky top-4">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-6">Order Summary</h3>
                
                <div class="space-y-4">
                    <div class="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Subtotal ({{ $cartItems->sum('quantity') }} items)</span>
                        <span id="subtotal" class="font-medium text-gray-900 dark:text-white">UGX {{ number_format($total['ugx'] ?? $cartItems->sum(fn($item) => $item->product->price_ugx * $item->quantity)) }}</span>
                    </div>
                    <div class="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Shipping</span>
                        <span class="font-medium text-gray-900 dark:text-white">Calculated at checkout</span>
                    </div>
                    
                    <!-- Promo Code -->
                    <div class="pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div class="flex gap-2">
                            <input type="text" id="promoCode" placeholder="Promo code" class="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-green focus:border-transparent"/>
                            <button onclick="applyPromoCode()" class="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm">Apply</button>
                        </div>
                    </div>
                    
                    <div class="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between">
                        <span class="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                        <span id="total" class="text-xl font-extrabold text-brand-green">UGX {{ number_format($total['ugx'] ?? $cartItems->sum(fn($item) => $item->product->price_ugx * $item->quantity)) }}</span>
                    </div>
                </div>
                
                <a href="{{ route('esokoni.checkout.shipping') }}" class="mt-6 w-full bg-brand-green hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined">lock</span>
                    Proceed to Checkout
                </a>
                
                <p class="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
                    <span class="material-symbols-outlined text-sm align-middle mr-1">verified_user</span>
                    Secure checkout powered by TesoTunes
                </p>
                
                <!-- Continue Shopping -->
                <a href="{{ route('frontend.store.index') }}" class="mt-4 w-full flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 hover:text-brand-green transition-colors text-sm font-medium">
                    <span class="material-symbols-outlined text-lg">arrow_back</span>
                    Continue Shopping
                </a>
            </div>
        </div>
    </div>
    
    @else
    <!-- Empty Cart State -->
    <div class="py-16 text-center">
        <div class="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <span class="material-symbols-outlined text-5xl text-gray-400">shopping_cart</span>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
        <p class="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">Looks like you haven't added anything yet. Start shopping and discover amazing products from talented artists!</p>
        <a href="{{ route('frontend.store.index') }}" class="inline-flex items-center gap-2 bg-brand-green hover:bg-green-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-green-500/20">
            <span class="material-symbols-outlined">storefront</span>
            Browse Store
        </a>
    </div>
    @endif
    
    <!-- Recently Viewed (Optional) -->
    @if(isset($recentlyViewed) && $recentlyViewed->count() > 0)
    <div class="mt-8">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Recently Viewed</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            @foreach($recentlyViewed->take(4) as $product)
            <a href="{{ route('frontend.store.products.show', $product->id) }}" class="group">
                <div class="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-2">
                    <img src="{{ $product->featured_image_url ?? asset('images/placeholder-product.svg') }}" alt="{{ $product->name }}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                </div>
                <h4 class="font-medium text-gray-900 dark:text-white truncate group-hover:text-brand-green transition-colors">{{ $product->name }}</h4>
                <p class="text-sm font-bold text-brand-green">UGX {{ number_format($product->price_ugx) }}</p>
            </a>
            @endforeach
        </div>
    </div>
    @endif
</div>

<!-- Mobile Fixed Bottom Bar -->
@if(isset($cartItems) && $cartItems->count() > 0)
<div class="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 z-50 safe-area-inset-bottom">
    <div class="flex items-center justify-between mb-3">
        <span class="text-sm text-gray-500 dark:text-gray-400">Total ({{ $cartItems->sum('quantity') }} items)</span>
        <span id="mobile-total" class="text-xl font-extrabold text-brand-green">UGX {{ number_format($total['ugx'] ?? $cartItems->sum(fn($item) => $item->product->price_ugx * $item->quantity)) }}</span>
    </div>
    <a href="{{ route('esokoni.checkout.shipping') }}" class="w-full bg-brand-green hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-500/20">
        <span class="material-symbols-outlined">lock</span>
        Checkout
    </a>
</div>
@endif

@push('scripts')
<script>
// Update quantity
function updateQuantity(itemId, delta) {
    const qtyElement = document.getElementById('qty-' + itemId);
    let newQty = parseInt(qtyElement.textContent) + delta;
    
    if (newQty < 1) {
        removeItem(itemId);
        return;
    }
    
    fetch(`/store/cart/items/${itemId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': '{{ csrf_token() }}',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ quantity: newQty })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            qtyElement.textContent = newQty;
            if (data.item_total) {
                document.getElementById('price-' + itemId).textContent = 'UGX ' + formatNumber(data.item_total);
            }
            if (data.subtotal) {
                document.getElementById('subtotal').textContent = 'UGX ' + formatNumber(data.subtotal);
                document.getElementById('total').textContent = 'UGX ' + formatNumber(data.total || data.subtotal);
                const mobileTotal = document.getElementById('mobile-total');
                if (mobileTotal) mobileTotal.textContent = 'UGX ' + formatNumber(data.total || data.subtotal);
            }
            if (window.cartManager) window.cartManager.updateBadges();
        } else {
            showNotification(data.message || 'Failed to update', 'error');
        }
    })
    .catch(error => showNotification('Error updating cart', 'error'));
}

// Remove item
function removeItem(itemId) {
    if (!confirm('Remove this item from cart?')) return;
    
    fetch(`/store/cart/items/${itemId}`, {
        method: 'DELETE',
        headers: {
            'X-CSRF-TOKEN': '{{ csrf_token() }}',
            'Accept': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.querySelector('.cart-item-' + itemId).remove();
            showNotification('Item removed', 'success');
            if (window.cartManager) window.cartManager.updateBadges();
            if (data.cart_count === 0) {
                location.reload();
            }
        } else {
            showNotification(data.message || 'Failed to remove', 'error');
        }
    })
    .catch(error => showNotification('Error removing item', 'error'));
}

// Clear cart
function clearCart() {
    if (!confirm('Clear all items from your cart?')) return;
    
    fetch('/store/cart/clear', {
        method: 'DELETE',
        headers: {
            'X-CSRF-TOKEN': '{{ csrf_token() }}',
            'Accept': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload();
        }
    })
    .catch(error => showNotification('Error clearing cart', 'error'));
}

// Apply promo code
function applyPromoCode() {
    const code = document.getElementById('promoCode').value.trim();
    if (!code) {
        showNotification('Please enter a promo code', 'info');
        return;
    }
    
    fetch('/store/cart/apply-promo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': '{{ csrf_token() }}',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ code: code })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification(data.message || 'Promo applied!', 'success');
            if (data.total) {
                document.getElementById('total').textContent = 'UGX ' + formatNumber(data.total);
            }
        } else {
            showNotification(data.message || 'Invalid promo code', 'error');
        }
    })
    .catch(error => showNotification('Error applying promo', 'error'));
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-4 px-6 py-3 rounded-xl text-white z-50 shadow-lg transition-opacity duration-300 ' +
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
