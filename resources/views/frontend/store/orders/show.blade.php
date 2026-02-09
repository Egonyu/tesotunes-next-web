@extends('frontend.layouts.store')

@section('title', 'Order #' . ($order->order_number ?? '') . ' - TesoTunes Store')
@section('page_title', 'Order Details')

@section('content')
<div class="space-y-6">
    
    <!-- Back Link -->
    <a href="{{ route('frontend.store.orders.index') }}" class="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-brand-green transition-colors">
        <span class="material-symbols-outlined">arrow_back</span>
        Back to Orders
    </a>
    
    <!-- Order Header -->
    <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 md:p-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <h1 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Order #{{ $order->order_number ?? 'N/A' }}</h1>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Placed on {{ $order->created_at?->format('F d, Y \a\t h:i A') }}</p>
            </div>
            @php
                $statusColors = [
                    'pending' => 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                    'confirmed' => 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                    'processing' => 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
                    'shipped' => 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
                    'delivered' => 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                    'cancelled' => 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                ];
            @endphp
            <span class="self-start px-4 py-2 rounded-full text-sm font-semibold {{ $statusColors[$order->status ?? 'pending'] ?? $statusColors['pending'] }}">
                {{ ucfirst($order->status ?? 'Pending') }}
            </span>
        </div>
        
        <!-- Order Progress -->
        @if(!in_array($order->status ?? '', ['cancelled']))
        <div class="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
            <div class="flex items-center justify-between max-w-2xl mx-auto">
                @php
                    $steps = ['confirmed', 'processing', 'shipped', 'delivered'];
                    $currentIndex = array_search($order->status ?? 'pending', $steps);
                    if ($currentIndex === false) $currentIndex = -1;
                @endphp
                
                @foreach(['Confirmed', 'Processing', 'Shipped', 'Delivered'] as $index => $step)
                <div class="flex flex-col items-center">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                        @if($index <= $currentIndex) bg-brand-green text-white @else bg-gray-200 dark:bg-gray-700 text-gray-500 @endif">
                        @if($index < $currentIndex)
                            <span class="material-symbols-outlined text-sm">check</span>
                        @else
                            {{ $index + 1 }}
                        @endif
                    </div>
                    <span class="mt-1 text-xs font-medium @if($index <= $currentIndex) text-brand-green @else text-gray-500 @endif">{{ $step }}</span>
                </div>
                @if($index < 3)
                <div class="flex-1 h-1 mx-2 @if($index < $currentIndex) bg-brand-green @else bg-gray-200 dark:bg-gray-700 @endif rounded"></div>
                @endif
                @endforeach
            </div>
        </div>
        @endif
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
            
            <!-- Order Items -->
            <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div class="p-4 md:p-6 border-b border-gray-100 dark:border-gray-800">
                    <h2 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span class="material-symbols-outlined text-brand-green">shopping_bag</span>
                        Order Items ({{ $order->items->count() ?? 0 }})
                    </h2>
                </div>
                <div class="divide-y divide-gray-100 dark:divide-gray-800">
                    @foreach($order->items ?? [] as $item)
                    <div class="p-4 flex gap-4">
                        <div class="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                            <img src="{{ $item->product->featured_image_url ?? asset('images/placeholder-product.svg') }}" alt="{{ $item->product->name }}" class="w-full h-full object-cover"/>
                        </div>
                        <div class="flex-1 min-w-0">
                            <a href="{{ route('frontend.store.products.show', $item->product->slug ?? $item->product_id) }}" class="font-semibold text-gray-900 dark:text-white hover:text-brand-green transition-colors">
                                {{ $item->product->name ?? 'Product' }}
                            </a>
                            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                @if($item->variant) Variant: {{ $item->variant }} <br> @endif
                                Quantity: {{ $item->quantity }}
                            </p>
                            <p class="text-sm font-semibold text-gray-900 dark:text-white mt-2">
                                UGX {{ number_format($item->unit_price ?? 0) }} × {{ $item->quantity }} = <span class="text-brand-green">UGX {{ number_format($item->subtotal ?? 0) }}</span>
                            </p>
                        </div>
                        @if($order->status === 'delivered')
                        <div class="flex-shrink-0">
                            @if($item->reviewed)
                            <span class="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-medium">Reviewed</span>
                            @else
                            <button onclick="showReviewModal({{ $item->id }})" class="px-3 py-1.5 bg-brand-green text-white rounded-lg text-xs font-medium hover:bg-green-600 transition-colors">
                                Review
                            </button>
                            @endif
                        </div>
                        @endif
                    </div>
                    @endforeach
                </div>
            </div>
            
            <!-- Shipping Info -->
            <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 md:p-6">
                <h2 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <span class="material-symbols-outlined text-brand-green">local_shipping</span>
                    Shipping Information
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Shipping Address</p>
                        <p class="font-medium text-gray-900 dark:text-white">{{ $order->shipping_name ?? 'N/A' }}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">{{ $order->shipping_address ?? '' }}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">{{ $order->shipping_city ?? '' }}{{ $order->shipping_country ? ', ' . $order->shipping_country : '' }}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">{{ $order->shipping_phone ?? '' }}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Shipping Method</p>
                        <p class="font-medium text-gray-900 dark:text-white">{{ ucfirst($order->shipping_method ?? 'Standard') }} Delivery</p>
                        @if($order->tracking_number)
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-3 mb-1">Tracking Number</p>
                        <div class="flex items-center gap-2">
                            <code class="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">{{ $order->tracking_number }}</code>
                            <button onclick="copyTracking('{{ $order->tracking_number }}')" class="text-brand-green hover:text-green-600">
                                <span class="material-symbols-outlined text-lg">content_copy</span>
                            </button>
                        </div>
                        @endif
                        @if($order->estimated_delivery)
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-3 mb-1">Estimated Delivery</p>
                        <p class="font-medium text-gray-900 dark:text-white">{{ $order->estimated_delivery->format('M d, Y') }}</p>
                        @endif
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Sidebar -->
        <div class="space-y-6">
            <!-- Payment Summary -->
            <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Payment Summary</h3>
                <div class="space-y-3">
                    <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>Subtotal</span>
                        <span class="font-medium text-gray-900 dark:text-white">UGX {{ number_format($order->subtotal ?? 0) }}</span>
                    </div>
                    <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>Shipping</span>
                        <span class="font-medium text-gray-900 dark:text-white">UGX {{ number_format($order->shipping_cost ?? 0) }}</span>
                    </div>
                    @if(($order->discount ?? 0) > 0)
                    <div class="flex justify-between text-sm text-brand-green">
                        <span>Discount</span>
                        <span class="font-medium">-UGX {{ number_format($order->discount) }}</span>
                    </div>
                    @endif
                    <div class="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between">
                        <span class="font-bold text-gray-900 dark:text-white">Total</span>
                        <span class="text-xl font-extrabold text-brand-green">UGX {{ number_format($order->total_amount ?? 0) }}</span>
                    </div>
                </div>
                
                <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Payment Method</p>
                    <div class="flex items-center gap-2">
                        @if(str_contains($order->payment_method ?? '', 'momo') || str_contains($order->payment_method ?? '', 'mobile'))
                        <div class="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center font-bold text-white text-xs">MTN</div>
                        @else
                        <span class="material-symbols-outlined text-brand-green">credit_card</span>
                        @endif
                        <span class="font-medium text-gray-900 dark:text-white">{{ ucfirst(str_replace('_', ' ', $order->payment_method ?? 'N/A')) }}</span>
                    </div>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        @if($order->paid_at)
                        <span class="text-green-600">Paid on {{ $order->paid_at->format('M d, Y') }}</span>
                        @else
                        <span class="text-yellow-600">Payment Pending</span>
                        @endif
                    </p>
                </div>
            </div>
            
            <!-- Actions -->
            <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Actions</h3>
                <div class="space-y-2">
                    @if($order->status === 'pending')
                    <button onclick="cancelOrder('{{ $order->id }}')" class="w-full py-3 px-4 border border-red-200 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined">close</span>
                        Cancel Order
                    </button>
                    @endif
                    @if($order->status === 'delivered')
                    <button onclick="reorder('{{ $order->id }}')" class="w-full py-3 px-4 bg-brand-green hover:bg-green-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined">replay</span>
                        Reorder
                    </button>
                    @endif
                    <button onclick="window.print()" class="w-full py-3 px-4 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined">print</span>
                        Print Order
                    </button>
                    @if(Route::has('frontend.store.support.create'))
                    <a href="{{ route('frontend.store.support.create', ['order_id' => $order->id]) }}" class="w-full py-3 px-4 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined">support_agent</span>
                        Need Help?
                    </a>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
function cancelOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    fetch(`/store/orders/${orderId}/cancel`, {
        method: 'POST', headers: {'Content-Type': 'application/json', 'X-CSRF-TOKEN': '{{ csrf_token() }}', 'Accept': 'application/json'}
    }).then(r => r.json()).then(d => {
        showNotification(d.success ? 'Order cancelled' : (d.message || 'Failed'), d.success ? 'success' : 'error');
        if(d.success) setTimeout(() => location.reload(), 1500);
    }).catch(() => showNotification('Error', 'error'));
}

function reorder(orderId) {
    fetch(`/store/orders/${orderId}/reorder`, {
        method: 'POST', headers: {'Content-Type': 'application/json', 'X-CSRF-TOKEN': '{{ csrf_token() }}', 'Accept': 'application/json'}
    }).then(r => r.json()).then(d => {
        if(d.success) { showNotification('Items added to cart!', 'success'); setTimeout(() => window.location.href = '/store/cart', 1500); }
        else showNotification(d.message || 'Failed', 'error');
    }).catch(() => showNotification('Error', 'error'));
}

function copyTracking(tracking) {
    navigator.clipboard.writeText(tracking);
    showNotification('Tracking number copied!', 'success');
}

function showNotification(message, type) {
    const n = document.createElement('div');
    n.className = 'fixed top-20 right-4 px-6 py-3 rounded-xl text-white z-50 shadow-lg ' + (type === 'success' ? 'bg-brand-green' : 'bg-red-600');
    n.textContent = message;
    document.body.appendChild(n);
    setTimeout(() => { n.style.opacity = '0'; setTimeout(() => n.remove(), 300); }, 3000);
}
</script>
@endpush
@endsection
