@extends('frontend.layouts.music')

@section('title', 'My Orders - TesoTunes')

{{-- Hide right sidebar for this page --}}
@section('custom-right-sidebar')
@endsection

@push('styles')
<style>
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
@endpush

@section('content')
<div class="flex-1 overflow-y-auto px-4 md:px-8 py-8 scrollbar-hide">
    <div class="max-w-5xl mx-auto flex flex-col gap-8 pb-10">
        
        {{-- Page Header --}}
        <div class="flex flex-wrap items-end justify-between gap-4">
            <div>
                <h2 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">My Orders</h2>
                <p class="text-gray-500 dark:text-gray-400 mt-1">View and manage all your purchases and service requests.</p>
            </div>
            <div class="relative min-w-[200px]">
                <label class="sr-only" for="order-filter">Filter orders</label>
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="material-symbols-outlined text-gray-400 dark:text-gray-500 text-[20px]">filter_list</span>
                </div>
                <select id="order-filter" onchange="filterByStatus(this.value)" class="block w-full pl-10 pr-10 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:ring-brand-green focus:border-brand-green appearance-none cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                    <option value="all" {{ request('status') == 'all' || !request('status') ? 'selected' : '' }}>All Orders</option>
                    <option value="pending" {{ request('status') == 'pending' ? 'selected' : '' }}>Pending</option>
                    <option value="processing" {{ request('status') == 'processing' ? 'selected' : '' }}>Processing</option>
                    <option value="shipped" {{ request('status') == 'shipped' ? 'selected' : '' }}>Shipped</option>
                    <option value="delivered" {{ request('status') == 'delivered' ? 'selected' : '' }}>Delivered</option>
                    <option value="cancelled" {{ request('status') == 'cancelled' ? 'selected' : '' }}>Cancelled</option>
                </select>
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span class="material-symbols-outlined text-gray-400 dark:text-gray-500 text-[20px]">expand_more</span>
                </div>
            </div>
        </div>
        
        {{-- Order Type Tabs --}}
        <div class="border-b border-gray-200 dark:border-gray-700">
            <nav aria-label="Order Categories" class="flex gap-8 overflow-x-auto pb-px scrollbar-hide">
                <a href="{{ route('frontend.store.orders.index') }}" class="border-b-2 {{ !request('type') || request('type') == 'all' ? 'border-brand-green text-gray-900 dark:text-white font-bold' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600' }} pb-3 px-1 text-sm whitespace-nowrap transition-colors">
                    All Orders
                </a>
                <a href="{{ route('frontend.store.orders.index', ['type' => 'physical']) }}" class="border-b-2 {{ request('type') == 'physical' ? 'border-brand-green text-gray-900 dark:text-white font-bold' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600' }} pb-3 px-1 text-sm font-medium whitespace-nowrap transition-colors">
                    Physical Products
                </a>
                <a href="{{ route('frontend.store.orders.index', ['type' => 'digital']) }}" class="border-b-2 {{ request('type') == 'digital' ? 'border-brand-green text-gray-900 dark:text-white font-bold' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600' }} pb-3 px-1 text-sm font-medium whitespace-nowrap transition-colors">
                    Digital Products
                </a>
                <a href="{{ route('frontend.store.promotions.my-promotions') }}" class="border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 pb-3 px-1 text-sm font-medium whitespace-nowrap transition-colors">
                    Promotions
                </a>
            </nav>
        </div>
        
        {{-- Orders List --}}
        <div class="flex flex-col gap-5">
            @forelse($orders ?? [] as $order)
            @php
                $statusConfig = [
                    'pending' => ['bg' => 'bg-amber-500/10', 'text' => 'text-amber-600 dark:text-amber-400', 'border' => 'border-amber-500/20', 'icon' => 'hourglass_top'],
                    'confirmed' => ['bg' => 'bg-blue-500/10', 'text' => 'text-blue-600 dark:text-blue-400', 'border' => 'border-blue-500/20', 'icon' => 'check'],
                    'processing' => ['bg' => 'bg-purple-500/10', 'text' => 'text-purple-600 dark:text-purple-400', 'border' => 'border-purple-500/20', 'icon' => 'pending'],
                    'shipped' => ['bg' => 'bg-blue-500/10', 'text' => 'text-blue-600 dark:text-blue-400', 'border' => 'border-blue-500/20', 'icon' => 'local_shipping'],
                    'delivered' => ['bg' => 'bg-green-500/10', 'text' => 'text-green-600 dark:text-green-400', 'border' => 'border-green-500/20', 'icon' => 'check_circle'],
                    'cancelled' => ['bg' => 'bg-red-500/10', 'text' => 'text-red-600 dark:text-red-400', 'border' => 'border-red-500/20', 'icon' => 'cancel'],
                ];
                $config = $statusConfig[$order->status] ?? $statusConfig['pending'];
            @endphp
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 md:p-6 shadow-sm group hover:border-brand-green/30 dark:hover:border-purple-500/30 transition-all duration-200">
                {{-- Order Header --}}
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-700 mb-4">
                    <div class="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                        <div>
                            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Order ID</p>
                            <p class="text-sm font-mono text-gray-900 dark:text-white mt-0.5">#{{ $order->order_number }}</p>
                        </div>
                        <div class="hidden md:block w-px h-8 bg-gray-200 dark:bg-gray-700/50"></div>
                        <div>
                            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Date Placed</p>
                            <p class="text-sm text-gray-900 dark:text-white mt-0.5">{{ $order->created_at->format('M d, Y') }}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        @if($order->status === 'shipped' && $order->tracking_number)
                        <a href="{{ route('frontend.store.orders.track', $order->id) }}" class="text-sm text-brand-green hover:text-green-600 flex items-center gap-1 font-medium group-hover:underline">
                            Track package
                            <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </a>
                        @endif
                        <div class="inline-flex items-center gap-1.5 rounded-full {{ $config['bg'] }} px-3 py-1 text-xs font-bold {{ $config['text'] }} border {{ $config['border'] }}">
                            <span class="material-symbols-outlined text-[14px]">{{ $config['icon'] }}</span>
                            {{ ucfirst($order->status) }}
                        </div>
                    </div>
                </div>
                
                {{-- Order Content --}}
                <div class="flex flex-col md:flex-row gap-6">
                    <div class="flex-1">
                        {{-- Store Info --}}
                        <div class="flex items-center gap-2 mb-3">
                            <span class="material-symbols-outlined text-gray-400 dark:text-gray-500 text-[18px]">storefront</span>
                            <span class="text-sm font-medium text-gray-900 dark:text-white">{{ $order->store->name ?? 'TesoTunes Store' }}</span>
                        </div>
                        
                        {{-- Order Items Preview --}}
                        <div class="flex items-start gap-4">
                            <div class="flex -space-x-3">
                                @foreach($order->items->take(2) as $item)
                                <div class="size-16 rounded-lg border-2 border-white dark:border-[#1E2530] bg-gray-100 dark:bg-gray-800 bg-cover bg-center flex-shrink-0" 
                                     style="background-image: url('{{ $item->product->featured_image_url ?? asset('images/placeholder-product.svg') }}');" 
                                     title="{{ $item->product->name }}"></div>
                                @endforeach
                                @if($order->items->count() > 2)
                                <div class="size-16 rounded-lg border-2 border-white dark:border-[#1E2530] bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400 flex-shrink-0">
                                    +{{ $order->items->count() - 2 }}
                                </div>
                                @endif
                            </div>
                            <div class="flex flex-col justify-center h-16">
                                <p class="text-sm text-gray-900 dark:text-white font-medium">
                                    {{ $order->items->first()->product->name ?? 'Product' }}
                                    @if($order->items->count() > 1)
                                    & {{ $order->items->count() - 1 }} other item{{ $order->items->count() > 2 ? 's' : '' }}
                                    @endif
                                </p>
                                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    @if($order->status === 'shipped')
                                    Estimated Delivery: <span class="text-gray-900 dark:text-white">{{ $order->estimated_delivery ?? 'Soon' }}</span>
                                    @elseif($order->status === 'delivered')
                                    <span class="text-green-600 dark:text-green-400 flex items-center gap-1">
                                        <span class="material-symbols-outlined text-[14px]">check_circle</span>
                                        Delivered on {{ $order->delivered_at?->format('M d, Y') ?? 'completed' }}
                                    </span>
                                    @elseif($order->items->first()->product->is_digital ?? false)
                                    <span class="flex items-center gap-1">
                                        <span class="material-symbols-outlined text-[14px]">file_download</span>
                                        Instant Delivery
                                    </span>
                                    @else
                                    Processing your order
                                    @endif
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {{-- Order Actions --}}
                    <div class="md:text-right flex flex-col justify-between gap-4 min-w-[200px]">
                        <div>
                            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Total Amount</p>
                            @if($order->payment_method === 'credits')
                            <p class="text-lg font-bold text-gray-900 dark:text-white mt-1 flex items-center md:justify-end gap-1">
                                {{ number_format($order->credits_used ?? 0) }} <span class="text-xs font-normal text-gray-500 dark:text-gray-400">Credits</span>
                            </p>
                            @else
                            <p class="text-lg font-bold text-gray-900 dark:text-white mt-1">UGX {{ number_format($order->total_amount) }}</p>
                            @endif
                        </div>
                        <div class="flex gap-3 md:justify-end">
                            <a href="{{ route('frontend.store.orders.show', $order->id) }}" class="flex-1 md:flex-none px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center">
                                View Details
                            </a>
                            @if($order->status === 'shipped')
                            <a href="{{ route('frontend.store.orders.track', $order->id) }}" class="flex-1 md:flex-none px-4 py-2 rounded-lg bg-brand-green text-sm font-semibold text-white hover:bg-green-600 shadow-lg shadow-green-500/20 transition-colors text-center">
                                Track Package
                            </a>
                            @elseif($order->status === 'delivered' && ($order->items->first()->product->is_digital ?? false))
                            <a href="{{ route('frontend.store.orders.show', $order->id) }}" class="flex-1 md:flex-none px-4 py-2 rounded-lg bg-brand-green text-sm font-semibold text-white hover:bg-green-600 shadow-lg shadow-green-500/20 transition-colors flex items-center justify-center gap-2">
                                <span class="material-symbols-outlined text-[18px]">download</span>
                                Download
                            </a>
                            @elseif($order->status === 'pending')
                            <button onclick="cancelOrder('{{ $order->id }}')" class="flex-1 md:flex-none px-4 py-2 rounded-lg border border-red-200 dark:border-red-900/50 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-center">
                                Cancel
                            </button>
                            @endif
                        </div>
                    </div>
                </div>
            </div>
            @empty
            {{-- Empty State --}}
            <div class="text-center py-16 bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                <div class="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span class="material-symbols-outlined text-4xl text-gray-400">shopping_bag</span>
                </div>
                <h3 class="text-gray-900 dark:text-white text-xl font-bold mb-2">No Orders Yet</h3>
                <p class="text-gray-500 dark:text-gray-400 mb-6">When you place an order, it will appear here</p>
                <div class="flex flex-wrap gap-3 justify-center">
                    <a href="{{ route('frontend.store.index') }}" class="inline-flex items-center gap-2 bg-brand-green hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold transition-colors shadow-lg shadow-green-500/20">
                        <span class="material-symbols-outlined">shopping_cart</span>
                        Shop Now
                    </a>
                    <a href="{{ route('frontend.store.promotions.index') }}" class="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-bold transition-colors shadow-lg shadow-purple-500/20">
                        <span class="material-symbols-outlined">campaign</span>
                        Browse Promotions
                    </a>
                </div>
            </div>
            @endforelse
        </div>
        
        {{-- Pagination --}}
        @if(isset($orders) && $orders->hasPages())
        <div class="flex justify-center mt-6">
            {{ $orders->withQueryString()->links() }}
        </div>
        @endif
    </div>
</div>

@push('scripts')
<script>
function filterByStatus(status) {
    const url = new URL(window.location.href);
    if (status === 'all') {
        url.searchParams.delete('status');
    } else {
        url.searchParams.set('status', status);
    }
    window.location.href = url.toString();
}

function cancelOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    
    fetch(`/store/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': '{{ csrf_token() }}',
            'Accept': 'application/json'
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showNotification('Order cancelled successfully', 'success');
            setTimeout(() => location.reload(), 1500);
        } else {
            showNotification(data.message || 'Failed to cancel order', 'error');
        }
    })
    .catch(() => showNotification('Error cancelling order', 'error'));
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-4 px-6 py-3 rounded-xl text-white z-50 shadow-lg transition-opacity duration-300 ' +
        (type === 'success' ? 'bg-brand-green' : 'bg-red-600');
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
