@extends('frontend.layouts.store')

@section('title', 'Store Dashboard - ' . $store->name)

@push('styles')
<style>
    /* Light mode styles */
    .glass-panel {
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(0, 0, 0, 0.1);
    }
    .glass-card {
        background: rgba(249, 250, 251, 0.8);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(0, 0, 0, 0.05);
    }
    .stat-card {
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid rgba(0, 0, 0, 0.08);
    }
    .stat-card:hover {
        border-color: rgba(16, 185, 129, 0.5);
        transform: translateY(-4px);
    }
    /* Dark mode styles */
    .dark .glass-panel {
        background: rgba(22, 27, 34, 0.7);
        border: 1px solid rgba(48, 54, 61, 0.5);
    }
    .dark .glass-card {
        background: rgba(30, 35, 45, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .dark .stat-card {
        background: rgba(22, 27, 34, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .dark .stat-card:hover {
        border-color: rgba(16, 185, 129, 0.3);
    }
</style>
@endpush

@section('content')
<main class="max-w-[1600px] mx-auto px-4 md:px-8 py-8 w-full space-y-8">
    {{-- Welcome Hero Section --}}
    <div class="glass-panel rounded-2xl p-6 md:p-8 relative overflow-hidden group">
        <div class="absolute -right-20 -top-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700"></div>
        <div class="relative z-10">
            <div class="flex flex-col md:flex-row md:items-end justify-between mb-8">
                <div class="flex items-center gap-4">
                    @if($store->logo)
                    <img src="{{ $store->logo_url }}" alt="{{ $store->name }}" class="size-16 md:size-20 rounded-2xl object-cover border-2 border-[#2c3435] shadow-xl">
                    @else
                    <div class="size-16 md:size-20 rounded-2xl bg-gradient-to-br from-primary to-emerald-900 flex items-center justify-center text-gray-900 dark:text-white text-2xl md:text-3xl font-bold shadow-xl border-2 border-primary/30">
                        {{ strtoupper(substr($store->name, 0, 2)) }}
                    </div>
                    @endif
                    <div>
                        <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                            @php
                                $hour = now()->hour;
                                $greeting = $hour < 12 ? 'Good morning' : ($hour < 17 ? 'Good afternoon' : 'Good evening');
                            @endphp
                            {{ $greeting }}, {{ auth()->user()->name }}! 👋
                        </h2>
                        <p class="text-text-secondary text-sm md:text-base">Here's what's happening in your shop today.</p>
                    </div>
                </div>
                <div class="mt-4 md:mt-0">
                    @if($store->status === 'active')
                    <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                        <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        SHOP LIVE
                    </span>
                    @else
                    <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
                        <span class="w-2 h-2 rounded-full bg-amber-400"></span>
                        {{ strtoupper($store->status) }}
                    </span>
                    @endif
                </div>
            </div>
            
            {{-- Stats Cards Grid --}}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {{-- Total Revenue --}}
                <div class="stat-card rounded-xl p-5 hover:border-primary/30 transition-all duration-300">
                    <div class="flex justify-between items-start mb-4">
                        <div class="p-2 bg-primary/20 rounded-lg text-primary">
                            <span class="material-symbols-outlined">payments</span>
                        </div>
                        @if(($stats['revenue_growth'] ?? 0) > 0)
                        <span class="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded flex items-center">
                            +{{ $stats['revenue_growth'] ?? 0 }}% <span class="material-symbols-outlined text-[12px] ml-1">trending_up</span>
                        </span>
                        @endif
                    </div>
                    <p class="text-text-secondary text-sm font-medium">Total Revenue</p>
                    <h3 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-1">UGX {{ number_format($stats['total_revenue'] ?? 0) }}</h3>
                </div>

                {{-- Today's Sales --}}
                <div class="stat-card rounded-xl p-5 hover:border-primary/30 transition-all duration-300">
                    <div class="flex justify-between items-start mb-4">
                        <div class="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                            <span class="material-symbols-outlined">shopping_cart</span>
                        </div>
                        <span class="text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded flex items-center">
                            {{ $stats['today_orders'] ?? 0 }} orders <span class="material-symbols-outlined text-[12px] ml-1">receipt_long</span>
                        </span>
                    </div>
                    <p class="text-text-secondary text-sm font-medium">Today's Sales</p>
                    <h3 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-1">UGX {{ number_format($stats['today_sales'] ?? 0) }}</h3>
                </div>

                {{-- Pending Orders --}}
                <div class="stat-card rounded-xl p-5 hover:border-primary/30 transition-all duration-300">
                    <div class="flex justify-between items-start mb-4">
                        <div class="p-2 bg-amber-500/20 rounded-lg text-amber-400">
                            <span class="material-symbols-outlined">pending_actions</span>
                        </div>
                        @if(($stats['pending_orders'] ?? 0) > 0)
                        <span class="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded flex items-center border border-amber-500/20">
                            Action Needed
                        </span>
                        @endif
                    </div>
                    <p class="text-text-secondary text-sm font-medium">Pending Orders</p>
                    <h3 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-1">{{ $stats['pending_orders'] ?? 0 }}</h3>
                </div>

                {{-- Total Products --}}
                <div class="stat-card rounded-xl p-5 hover:border-primary/30 transition-all duration-300">
                    <div class="flex justify-between items-start mb-4">
                        <div class="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                            <span class="material-symbols-outlined">inventory_2</span>
                        </div>
                        @if(($stats['low_stock_count'] ?? 0) > 0)
                        <span class="text-xs font-medium text-amber-400 px-2 py-0.5 rounded">
                            {{ $stats['low_stock_count'] }} low stock
                        </span>
                        @else
                        <span class="text-xs font-medium text-text-secondary px-2 py-0.5 rounded">
                            Stock healthy
                        </span>
                        @endif
                    </div>
                    <p class="text-text-secondary text-sm font-medium">Total Products</p>
                    <h3 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-1">{{ $stats['active_products'] ?? 0 }}</h3>
                </div>
            </div>
        </div>
    </div>

    {{-- Quick Action Buttons --}}
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <a href="{{ route('frontend.store.products.create', $store) }}" class="bg-primary hover:bg-green-500 text-white p-4 rounded-xl flex items-center justify-center gap-3 font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
            <span class="material-symbols-outlined">add_circle</span>
            Add New Product
        </a>
        <a href="{{ route('frontend.store.orders.index') }}" class="glass-card hover:bg-card-dark text-gray-900 dark:text-white p-4 rounded-xl flex items-center justify-center gap-3 font-medium transition-all hover:scale-[1.02] border-transparent hover:border-primary/30">
            <span class="material-symbols-outlined text-primary">list_alt</span>
            View All Orders
        </a>
        <a href="{{ route('frontend.store.seller.promotions.index') }}" class="glass-card hover:bg-card-dark text-gray-900 dark:text-white p-4 rounded-xl flex items-center justify-center gap-3 font-medium transition-all hover:scale-[1.02] border-transparent hover:border-primary/30">
            <span class="material-symbols-outlined text-primary">campaign</span>
            Manage Promotions
        </a>
        <a href="{{ route('frontend.store.settings', $store) }}" class="glass-card hover:bg-card-dark text-gray-900 dark:text-white p-4 rounded-xl flex items-center justify-center gap-3 font-medium transition-all hover:scale-[1.02] border-transparent hover:border-primary/30">
            <span class="material-symbols-outlined text-primary">palette</span>
            Customize Shop
        </a>
    </div>

    {{-- Product Catalog & Performance Section --}}
    <div class="glass-panel rounded-2xl p-6 border border-[#30363D] relative overflow-hidden">
        <div class="absolute -right-10 -bottom-20 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div class="flex flex-col lg:flex-row gap-8 relative z-10">
            {{-- Product Catalog List --}}
            <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-5">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary">inventory_2</span>
                        Product Catalog
                    </h3>
                    <a class="text-xs font-medium text-primary hover:text-gray-900 dark:text-white transition-colors flex items-center gap-1" href="{{ route('frontend.store.products.index', $store) }}">
                        Manage Catalog <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </a>
                </div>
                <div class="space-y-3">
                    @forelse(($topProducts ?? collect())->take(3) as $product)
                    <div class="glass-card p-3 rounded-xl flex items-center gap-4 hover:bg-[#1e2424] transition-all group border-transparent hover:border-[#30363D]">
                        <div class="relative w-12 h-12 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                            @if($product->featured_image_url)
                            <img alt="{{ $product->name }}" class="w-full h-full object-cover rounded-lg shadow-md" src="{{ $product->featured_image_url }}">
                            @else
                            <div class="w-full h-full bg-gradient-to-br from-gray-800 to-black rounded-lg flex items-center justify-center border border-white/5">
                                <span class="material-symbols-outlined text-gray-500">image</span>
                            </div>
                            @endif
                            <div class="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span class="material-symbols-outlined text-gray-900 dark:text-white text-lg">visibility</span>
                            </div>
                        </div>
                        <div class="flex-1 min-w-0">
                            <h4 class="text-sm font-bold text-gray-900 dark:text-white truncate">{{ $product->name }}</h4>
                            <p class="text-xs text-text-secondary truncate">{{ ucfirst($product->product_type) }} • UGX {{ number_format($product->pricing?->price_ugx ?? 0) }}</p>
                        </div>
                        <div class="text-right px-2 hidden sm:block">
                            <div class="flex items-center gap-1 justify-end text-gray-900 dark:text-white font-medium text-sm">
                                <span class="material-symbols-outlined text-[14px] text-primary">trending_up</span> {{ $product->order_items_count ?? 0 }}
                            </div>
                            <p class="text-[10px] text-text-secondary">Sales</p>
                        </div>
                        <div class="flex items-center gap-1 pl-2 border-l border-white/5">
                            <a href="{{ route('frontend.store.products.edit', ['store' => $store, 'product' => $product]) }}" class="p-2 text-text-secondary hover:text-primary hover:bg-white/5 rounded-lg transition-colors" title="Edit">
                                <span class="material-symbols-outlined text-[18px]">edit</span>
                            </a>
                            <button class="p-2 text-text-secondary hover:text-gray-900 dark:text-white hover:bg-white/5 rounded-lg transition-colors" title="More">
                                <span class="material-symbols-outlined text-[18px]">more_vert</span>
                            </button>
                        </div>
                    </div>
                    @empty
                    <div class="glass-card p-6 rounded-xl text-center">
                        <span class="material-symbols-outlined text-4xl text-gray-600 mb-2 block">inventory_2</span>
                        <p class="text-gray-500 font-medium">No products yet</p>
                        <p class="text-gray-600 text-xs mt-1">Start by adding your first product</p>
                        <a href="{{ route('frontend.store.products.create', $store) }}" class="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                            <span class="material-symbols-outlined text-sm">add</span>
                            Add Product
                        </a>
                    </div>
                    @endforelse
                </div>
            </div>

            {{-- Performance Sidebar --}}
            <div class="lg:w-80 flex flex-col gap-6">
                {{-- Sales Performance Chart --}}
                <div class="bg-[#1e2424]/60 rounded-xl p-5 border border-white/5 relative overflow-hidden">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <p class="text-xs font-medium text-text-secondary">Sales Performance</p>
                            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ $stats['total_orders'] ?? 0 }}</h3>
                        </div>
                        @if(($stats['order_growth'] ?? 0) > 0)
                        <span class="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg border border-primary/10">+{{ $stats['order_growth'] ?? 0 }}%</span>
                        @endif
                    </div>
                    <div class="h-16 flex items-end gap-1.5 mt-2">
                        @php
                            $chartData = $stats['weekly_sales'] ?? [40, 50, 30, 70, 85, 60, 75];
                            $maxVal = max($chartData) ?: 1;
                        @endphp
                        @foreach($chartData as $index => $val)
                        <div class="w-full {{ $index === array_search(max($chartData), $chartData) ? 'bg-primary shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-white/5 hover:bg-primary/40' }} transition-colors rounded-sm" style="height: {{ ($val / $maxVal) * 100 }}%"></div>
                        @endforeach
                    </div>
                    <p class="text-[10px] text-text-secondary mt-3 text-center">Last 7 Days Activity</p>
                </div>

                {{-- Quick Action Buttons --}}
                <div class="grid grid-cols-1 gap-3">
                    <a href="{{ route('frontend.store.products.create', $store) }}" class="w-full py-3 px-4 bg-primary hover:bg-green-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 group">
                        <span class="material-symbols-outlined group-hover:animate-bounce">add_circle</span>
                        Add New Product
                    </a>
                    <a href="{{ route('frontend.store.seller.promotions.create') }}" class="w-full py-3 px-4 bg-[#1e2424] hover:bg-primary/10 text-primary border border-primary/20 font-bold rounded-xl flex items-center justify-center gap-2 transition-all group">
                        <span class="material-symbols-outlined">campaign</span>
                        Create Promotion
                    </a>
                </div>
            </div>
        </div>
    </div>

    {{-- Main Content Grid --}}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {{-- Left Column --}}
        <div class="lg:col-span-2 space-y-6 md:space-y-8">
            {{-- Sales Trends Chart --}}
            <div class="glass-panel rounded-2xl p-6 border border-[#30363D]">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary">show_chart</span>
                        Sales Trends
                    </h3>
                    <div class="flex bg-[#1e2424] rounded-lg p-1 border border-[#30363D]">
                        <button class="px-3 py-1 text-xs font-medium rounded text-gray-900 dark:text-white bg-primary shadow-sm shadow-primary/20">7D</button>
                        <button class="px-3 py-1 text-xs font-medium rounded text-text-secondary hover:text-gray-900 dark:text-white hover:bg-white/5">1M</button>
                        <button class="px-3 py-1 text-xs font-medium rounded text-text-secondary hover:text-gray-900 dark:text-white hover:bg-white/5">3M</button>
                    </div>
                </div>
                <div class="h-64 w-full flex items-end justify-between gap-2 px-2 pb-2">
                    @php
                        $days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                        $salesData = $stats['daily_sales'] ?? [40, 65, 50, 85, 95, 60, 45];
                        $maxSale = max($salesData) ?: 1;
                    @endphp
                    @foreach($days as $index => $day)
                    <div class="w-full flex flex-col justify-end gap-2 group cursor-pointer">
                        <div class="{{ $salesData[$index] === max($salesData) ? 'bg-primary hover:bg-green-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-[#1e2424] hover:bg-primary/40' }} transition-all rounded-t-sm relative" style="height: {{ ($salesData[$index] / $maxSale) * 100 }}%">
                            <div class="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-gray-900 dark:text-white text-xs py-1 px-2 rounded whitespace-nowrap">UGX {{ number_format($salesData[$index] * 1000) }}</div>
                        </div>
                        <div class="text-[10px] text-center {{ $salesData[$index] === max($salesData) ? 'text-gray-900 dark:text-white font-bold' : 'text-text-secondary' }}">{{ $day }}</div>
                    </div>
                    @endforeach
                </div>
            </div>

            {{-- Top Performing Products --}}
            <div>
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white">Top Performing Products</h3>
                    <a class="text-xs font-medium text-primary hover:text-gray-900 dark:text-white transition-colors" href="{{ route('frontend.store.products.index', $store) }}">View Catalog →</a>
                </div>
                <div class="space-y-4">
                    @forelse(($topProducts ?? collect())->take(2) as $index => $product)
                    <div class="glass-card rounded-xl p-4 flex items-center gap-4 hover:bg-[#1e2424] transition-colors group">
                        <div class="relative w-16 h-16 flex-shrink-0">
                            @if($product->featured_image_url)
                            <img alt="{{ $product->name }}" class="w-full h-full object-cover rounded-lg" src="{{ $product->featured_image_url }}">
                            @else
                            <div class="w-full h-full bg-gradient-to-br from-gray-800 to-black rounded-lg flex items-center justify-center">
                                <span class="material-symbols-outlined text-gray-600">image</span>
                            </div>
                            @endif
                            <div class="absolute -top-2 -right-2 {{ $index === 0 ? 'bg-primary text-black' : 'bg-[#1e2424] text-text-secondary border border-[#30363D]' }} text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md">#{{ $index + 1 }}</div>
                        </div>
                        <div class="flex-1 min-w-0">
                            <h4 class="text-gray-900 dark:text-white font-medium truncate">{{ $product->name }}</h4>
                            <p class="text-text-secondary text-xs mt-0.5">UGX {{ number_format($product->pricing?->price_ugx ?? 0) }} • {{ $product->order_items_count ?? 0 }} Sales</p>
                        </div>
                        <div class="text-right">
                            @php
                                $stock = $product->inventory?->stock_quantity ?? 0;
                                $lowStock = $stock > 0 && $stock <= 10;
                            @endphp
                            @if($stock > 10)
                            <span class="inline-block px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded border border-green-500/20">In Stock ({{ $stock }})</span>
                            @elseif($lowStock)
                            <span class="inline-block px-2 py-1 bg-yellow-500/10 text-yellow-500 text-xs rounded border border-yellow-500/20">Low Stock ({{ $stock }})</span>
                            @else
                            <span class="inline-block px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded border border-red-500/20">Out of Stock</span>
                            @endif
                        </div>
                        <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <a href="{{ route('frontend.store.products.edit', ['store' => $store, 'product' => $product]) }}" class="p-2 hover:bg-white/10 rounded-full text-text-secondary hover:text-gray-900 dark:text-white">
                                <span class="material-symbols-outlined text-[20px]">edit</span>
                            </a>
                            <a href="{{ route('frontend.store.products.show', $product) }}" target="_blank" class="p-2 hover:bg-white/10 rounded-full text-text-secondary hover:text-gray-900 dark:text-white">
                                <span class="material-symbols-outlined text-[20px]">visibility</span>
                            </a>
                        </div>
                    </div>
                    @empty
                    <div class="glass-card rounded-xl p-8 text-center">
                        <span class="material-symbols-outlined text-4xl text-gray-600 mb-2 block">inventory_2</span>
                        <p class="text-gray-500 font-medium">No sales data yet</p>
                        <p class="text-gray-600 text-xs mt-1">Top selling products will appear here</p>
                    </div>
                    @endforelse
                </div>
            </div>

            {{-- Recent Orders --}}
            <div>
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white">Recent Orders</h3>
                    <a class="text-xs font-medium text-primary hover:text-gray-900 dark:text-white transition-colors" href="{{ route('frontend.store.orders.index') }}">See All Orders</a>
                </div>
                <div class="glass-panel rounded-xl overflow-hidden border border-[#30363D]">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-[#1e2424] border-b border-[#30363D] text-text-secondary font-medium text-xs uppercase">
                            <tr>
                                <th class="px-6 py-3">Order ID</th>
                                <th class="px-6 py-3">Customer</th>
                                <th class="px-6 py-3">Items</th>
                                <th class="px-6 py-3">Status</th>
                                <th class="px-6 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-[#30363D]">
                            @forelse($recentOrders ?? [] as $order)
                            <tr class="hover:bg-white/5 transition-colors">
                                <td class="px-6 py-4 text-primary font-mono">#{{ $order->order_number }}</td>
                                <td class="px-6 py-4 text-gray-900 dark:text-white font-medium">{{ $order->buyer->name ?? 'Guest' }}</td>
                                <td class="px-6 py-4 text-text-secondary">{{ $order->items_count ?? $order->items->count() }}x items</td>
                                <td class="px-6 py-4">
                                    @php
                                        $statusColors = [
                                            'pending' => 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20',
                                            'processing' => 'bg-blue-500/20 text-blue-400 border-blue-500/20',
                                            'shipped' => 'bg-purple-500/20 text-purple-400 border-purple-500/20',
                                            'completed' => 'bg-green-500/20 text-green-500 border-green-500/20',
                                            'delivered' => 'bg-green-500/20 text-green-500 border-green-500/20',
                                            'cancelled' => 'bg-red-500/20 text-red-400 border-red-500/20',
                                        ];
                                    @endphp
                                    <span class="px-2 py-1 rounded-full text-[10px] font-bold {{ $statusColors[$order->status] ?? 'bg-gray-700/50 text-gray-400 border-gray-600/30' }} border">{{ strtoupper($order->status) }}</span>
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <a href="{{ route('frontend.store.orders.show', $order) }}" class="text-primary hover:text-gray-900 dark:text-white text-xs underline">Details</a>
                                </td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="5" class="px-6 py-12 text-center">
                                    <span class="material-symbols-outlined text-4xl text-gray-600 mb-2 block">receipt_long</span>
                                    <p class="text-gray-500 font-medium">No orders yet</p>
                                    <p class="text-gray-600 text-xs mt-1">Orders will appear here when customers make purchases</p>
                                </td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {{-- Right Column --}}
        <div class="space-y-6 md:space-y-8">
            {{-- Active Campaigns --}}
            <div class="glass-panel rounded-2xl p-6 border border-primary/20 relative overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-2xl rounded-full pointer-events-none"></div>
                <div class="flex items-center justify-between mb-4 relative z-10">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white">Campaigns</h3>
                    <a href="{{ route('frontend.store.seller.promotions.create') }}" class="p-1 text-primary hover:bg-primary/10 rounded-full transition-colors">
                        <span class="material-symbols-outlined">add</span>
                    </a>
                </div>
                <div class="space-y-3 relative z-10">
                    @forelse(($activePromotions ?? collect())->take(2) as $promo)
                    <div class="bg-[#1e2424]/80 p-4 rounded-xl border-l-4 border-primary">
                        <div class="flex justify-between items-start mb-1">
                            <h4 class="font-bold text-gray-900 dark:text-white text-sm">{{ $promo->name }}</h4>
                            <span class="text-[10px] font-bold uppercase {{ $promo->is_active ? 'text-primary bg-primary/10' : 'text-text-secondary bg-white/5' }} px-1.5 py-0.5 rounded">{{ $promo->is_active ? 'Active' : 'Inactive' }}</span>
                        </div>
                        <p class="text-xs text-text-secondary mb-3">{{ $promo->discount_value }}{{ $promo->discount_type === 'percentage' ? '%' : ' UGX' }} OFF • Code: {{ $promo->code }}</p>
                        @if($promo->usage_limit)
                        <div class="w-full bg-black/40 h-1.5 rounded-full mb-1">
                            <div class="bg-primary h-1.5 rounded-full" style="width: {{ min(100, ($promo->times_used / $promo->usage_limit) * 100) }}%"></div>
                        </div>
                        <div class="flex justify-between text-[10px] text-text-secondary">
                            <span>{{ $promo->times_used }} Used</span>
                            <span>{{ $promo->ends_at ? 'Expires ' . $promo->ends_at->diffForHumans() : 'No expiry' }}</span>
                        </div>
                        @endif
                    </div>
                    @empty
                    <div class="bg-[#1e2424]/60 p-4 rounded-xl border border-[#30363D]">
                        <p class="text-text-secondary text-sm text-center mb-3">No active promotions</p>
                        <a href="{{ route('frontend.store.seller.promotions.create') }}" class="w-full py-2 rounded text-xs font-medium bg-primary/10 hover:bg-primary/20 text-primary transition-colors flex items-center justify-center gap-1">
                            <span class="material-symbols-outlined text-sm">add</span>
                            Create Campaign
                        </a>
                    </div>
                    @endforelse
                </div>
            </div>

            {{-- Store Analytics --}}
            <div class="glass-panel rounded-2xl p-6">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-blue-400">monitoring</span>
                    Store Analytics
                </h3>
                <div class="space-y-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                <span class="material-symbols-outlined text-sm">visibility</span>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-gray-900 dark:text-white">Store Views</p>
                                <p class="text-xs text-text-secondary">This month</p>
                            </div>
                        </div>
                        <span class="text-sm font-bold text-gray-900 dark:text-white">{{ number_format($stats['total_views'] ?? 0) }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                <span class="material-symbols-outlined text-sm">conversion_path</span>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-gray-900 dark:text-white">Conversion Rate</p>
                                <p class="text-xs text-text-secondary">Views to orders</p>
                            </div>
                        </div>
                        <span class="text-sm font-bold text-primary">{{ number_format($stats['conversion_rate'] ?? 0, 1) }}%</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                                <span class="material-symbols-outlined text-sm">star</span>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-gray-900 dark:text-white">Average Rating</p>
                                <p class="text-xs text-text-secondary">From customers</p>
                            </div>
                        </div>
                        <span class="text-sm font-bold text-amber-400 flex items-center gap-1">
                            {{ number_format($stats['average_rating'] ?? 0, 1) }}
                            <span class="material-symbols-outlined text-xs">star</span>
                        </span>
                    </div>
                </div>
            </div>

            {{-- Pro Tip Card --}}
            <div class="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl p-6">
                <div class="flex items-center gap-2 mb-2 text-primary">
                    <span class="material-symbols-outlined">lightbulb</span>
                    <h3 class="font-bold text-sm uppercase tracking-wide">Pro Tip</h3>
                </div>
                <p class="text-sm text-gray-900 dark:text-white mb-3 font-medium">Boost your merch sales by 15%</p>
                <p class="text-xs text-text-secondary mb-4 leading-relaxed">
                    Artists who bundle physical merch with digital products see a significant increase in conversion rates. Try creating a bundle today!
                </p>
                <a href="{{ route('frontend.store.products.create', $store) }}" class="text-xs font-bold text-primary hover:text-gray-900 dark:text-white transition-colors flex items-center gap-1">
                    Create Bundle <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
                </a>
            </div>

            {{-- Help & Support --}}
            <div class="glass-panel rounded-2xl p-6">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-purple-400">help</span>
                    Help & Support
                </h3>
                <div class="space-y-3">
                    <a href="#" class="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group">
                        <div class="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/30">
                            <span class="material-symbols-outlined text-sm">menu_book</span>
                        </div>
                        <div class="flex-1">
                            <p class="text-sm font-medium text-gray-900 dark:text-white">Getting Started Guide</p>
                            <p class="text-xs text-text-secondary">Learn the basics</p>
                        </div>
                        <span class="material-symbols-outlined text-text-secondary text-sm">arrow_forward</span>
                    </a>
                    <a href="#" class="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group">
                        <div class="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/30">
                            <span class="material-symbols-outlined text-sm">support_agent</span>
                        </div>
                        <div class="flex-1">
                            <p class="text-sm font-medium text-gray-900 dark:text-white">Contact Support</p>
                            <p class="text-xs text-text-secondary">Get help from our team</p>
                        </div>
                        <span class="material-symbols-outlined text-text-secondary text-sm">arrow_forward</span>
                    </a>
                </div>
            </div>
        </div>
    </div>
</main>
@endsection
