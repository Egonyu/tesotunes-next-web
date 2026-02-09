@extends('frontend.layouts.store')

@section('title', 'My Product Catalog')

@section('content')
<main class="max-w-[1440px] mx-auto px-4 md:px-8 py-8 w-full">
    {{-- Breadcrumbs --}}
    <nav class="flex flex-wrap gap-2 mb-6 text-sm text-gray-400 items-center">
        <a class="hover:text-primary transition-colors" href="{{ route('frontend.home') }}">Home</a>
        <span>/</span>
        <a class="hover:text-primary transition-colors" href="{{ route('frontend.store.index') }}">Store</a>
        <span>/</span>
        <span class="text-white font-medium">My Products</span>
    </nav>

    {{-- Page Header --}}
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
            <h1 class="text-3xl font-bold text-white mb-1">My Product Catalog</h1>
            <p class="text-gray-400 text-sm">Manage your products, track inventory, and view sales performance.</p>
        </div>
        @can('create', \App\Models\Product::class)
        <a class="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/25 transition-colors text-sm" href="{{ route('frontend.store.products.create') }}">
            <span class="material-symbols-outlined">add</span>
            Add New Product
        </a>
        @endcan
    </div>

    {{-- Filter Bar --}}
    <div class="bg-[#1e2424] border border-[#2c3435] rounded-xl p-4 mb-6">
        <form method="GET" action="{{ route('frontend.store.products.index') }}" id="filterForm">
            <div class="flex flex-col lg:flex-row gap-4 justify-between">
                <div class="flex flex-col md:flex-row gap-4 flex-1">
                    {{-- Search --}}
                    <div class="relative w-full md:w-80">
                        <span class="material-symbols-outlined absolute left-3 top-2.5 text-gray-500">search</span>
                        <input 
                            name="search"
                            value="{{ request('search') }}"
                            class="w-full bg-[#121616] border border-[#2c3435] rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-gray-600" 
                            placeholder="Search products..." 
                            type="text"
                        />
                    </div>
                    
                    {{-- Filters --}}
                    <div class="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        <select name="type" class="bg-[#121616] border border-[#2c3435] rounded-lg px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-primary outline-none" onchange="document.getElementById('filterForm').submit()">
                            <option value="all">All Types</option>
                            <option value="physical" {{ request('type') === 'physical' ? 'selected' : '' }}>Physical</option>
                            <option value="digital" {{ request('type') === 'digital' ? 'selected' : '' }}>Digital</option>
                            <option value="promotion" {{ request('type') === 'promotion' ? 'selected' : '' }}>Promotion</option>
                        </select>
                        
                        <select name="status" class="bg-[#121616] border border-[#2c3435] rounded-lg px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-primary outline-none" onchange="document.getElementById('filterForm').submit()">
                            <option value="all">All Status</option>
                            <option value="active" {{ request('status') === 'active' ? 'selected' : '' }}>Active</option>
                            <option value="draft" {{ request('status') === 'draft' ? 'selected' : '' }}>Draft</option>
                            <option value="out_of_stock" {{ request('status') === 'out_of_stock' ? 'selected' : '' }}>Out of Stock</option>
                            <option value="archived" {{ request('status') === 'archived' ? 'selected' : '' }}>Archived</option>
                        </select>
                        
                        <select name="category" class="bg-[#121616] border border-[#2c3435] rounded-lg px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-primary outline-none" onchange="document.getElementById('filterForm').submit()">
                            <option value="all">All Categories</option>
                            @foreach($categories ?? [] as $category)
                            <option value="{{ $category->slug }}" {{ request('category') === $category->slug ? 'selected' : '' }}>{{ $category->name }}</option>
                            @endforeach
                        </select>
                    </div>
                </div>
                
                {{-- Sort --}}
                <div class="flex items-center gap-2 md:w-auto w-full">
                    <span class="text-sm text-gray-400 whitespace-nowrap">Sort by:</span>
                    <select name="sort" class="w-full md:w-auto bg-[#121616] border border-[#2c3435] rounded-lg px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-primary outline-none" onchange="document.getElementById('filterForm').submit()">
                        <option value="newest" {{ request('sort') === 'newest' ? 'selected' : '' }}>Newest Added</option>
                        <option value="price_asc" {{ request('sort') === 'price_asc' ? 'selected' : '' }}>Price: Low to High</option>
                        <option value="price_desc" {{ request('sort') === 'price_desc' ? 'selected' : '' }}>Price: High to Low</option>
                        <option value="stock" {{ request('sort') === 'stock' ? 'selected' : '' }}>Stock Quantity</option>
                        <option value="sales" {{ request('sort') === 'sales' ? 'selected' : '' }}>Top Selling</option>
                    </select>
                </div>
            </div>
        </form>
    </div>

    {{-- Products Table --}}
    <div class="bg-[#1e2424] border border-[#2c3435] rounded-xl shadow-xl overflow-hidden">
        {{-- Bulk Actions Bar (Hidden by default) --}}
        <div id="bulkActionsBar" class="hidden bg-[#2b3d40] px-6 py-3 border-b border-[#2c3435] flex items-center gap-4">
            <span class="text-white text-sm font-medium"><span id="selectedCount">0</span> items selected</span>
            <div class="h-4 w-px bg-gray-600"></div>
            <button onclick="bulkAction('delete')" class="text-xs text-gray-300 hover:text-white flex items-center gap-1">
                <span class="material-symbols-outlined text-base">delete</span> Delete
            </button>
            <button onclick="bulkAction('archive')" class="text-xs text-gray-300 hover:text-white flex items-center gap-1">
                <span class="material-symbols-outlined text-base">archive</span> Archive
            </button>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-[#121616] border-b border-[#2c3435] text-xs uppercase text-gray-400">
                        <th class="px-6 py-4 w-10">
                            <input id="selectAll" type="checkbox" class="rounded border-gray-600 bg-transparent text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer" onchange="toggleSelectAll(this)"/>
                        </th>
                        <th class="px-6 py-4 font-semibold tracking-wider">Product</th>
                        <th class="px-6 py-4 font-semibold tracking-wider">Type</th>
                        <th class="px-6 py-4 font-semibold tracking-wider">Price</th>
                        <th class="px-6 py-4 font-semibold tracking-wider">Stock</th>
                        <th class="px-6 py-4 font-semibold tracking-wider">Status</th>
                        <th class="px-6 py-4 font-semibold tracking-wider">Total Sales</th>
                        <th class="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[#2c3435]">
                    @forelse($products as $product)
                    <tr class="group hover:bg-white/[0.02] transition-colors">
                        <td class="px-6 py-4">
                            <input type="checkbox" class="product-checkbox rounded border-gray-600 bg-transparent text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer" value="{{ $product->id }}" onchange="updateBulkActions()"/>
                        </td>
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-4">
                                <div class="size-12 rounded-lg bg-gray-700 overflow-hidden flex-shrink-0 border border-[#2c3435]">
                                    @if($product->featured_image_url)
                                    <img alt="{{ $product->name }}" class="w-full h-full object-cover" src="{{ $product->featured_image_url }}"/>
                                    @else
                                    <div class="w-full h-full flex items-center justify-center">
                                        <span class="material-symbols-outlined text-gray-500">inventory_2</span>
                                    </div>
                                    @endif
                                </div>
                                <div>
                                    <a class="font-medium text-white hover:text-primary transition-colors block" href="{{ route('frontend.store.products.show', $product) }}">
                                        {{ $product->name }}
                                    </a>
                                    <span class="text-xs text-gray-500">SKU: {{ $product->sku ?? 'N/A' }}</span>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4">
                            @php
                                $typeColors = [
                                    'physical' => 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                                    'digital' => 'bg-purple-500/10 text-primary border-purple-500/20',
                                    'promotion' => 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                                ];
                            @endphp
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {{ $typeColors[$product->product_type] ?? 'bg-gray-500/10 text-gray-400 border-gray-500/20' }} border">
                                {{ ucfirst($product->product_type) }}
                            </span>
                        </td>
                        <td class="px-6 py-4">
                            <div class="flex flex-col">
                                <span class="text-white text-sm font-medium">UGX {{ number_format($product->price_ugx ?? 0) }}</span>
                                @if($product->price_credits)
                                <span class="text-xs text-gray-500 flex items-center gap-1">
                                    <span class="text-[10px]">💎</span> {{ number_format($product->price_credits) }} Credits
                                </span>
                                @endif
                            </div>
                        </td>
                        <td class="px-6 py-4">
                            @if($product->product_type === 'digital')
                                <span class="text-gray-500 text-sm italic">Unlimited</span>
                            @elseif($product->stock_quantity <= 0)
                                <div class="flex items-center gap-2 text-red-400 font-medium text-sm">
                                    <span class="material-symbols-outlined text-base">warning</span>
                                    0 left
                                </div>
                            @elseif($product->stock_quantity <= 5)
                                <div class="flex items-center gap-2 text-warning font-medium text-sm">
                                    <span class="material-symbols-outlined text-base">warning</span>
                                    {{ $product->stock_quantity }} left
                                </div>
                            @else
                                <span class="text-white text-sm">{{ $product->stock_quantity }}</span>
                            @endif
                        </td>
                        <td class="px-6 py-4">
                            @php
                                $statusClasses = [
                                    'active' => 'bg-success/10 text-success border-success/20',
                                    'in_stock' => 'bg-success/10 text-success border-success/20',
                                    'draft' => 'bg-gray-700 text-gray-300 border-gray-600',
                                    'out_of_stock' => 'bg-red-500/10 text-red-400 border-red-500/20',
                                    'archived' => 'bg-gray-700 text-gray-400 border-gray-600',
                                ];
                                $displayStatus = $product->status;
                                if ($product->stock_quantity <= 0 && $product->product_type === 'physical') {
                                    $displayStatus = 'out_of_stock';
                                }
                            @endphp
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {{ $statusClasses[$displayStatus] ?? 'bg-gray-700 text-gray-300 border-gray-600' }} border">
                                {{ ucwords(str_replace('_', ' ', $displayStatus)) }}
                            </span>
                        </td>
                        <td class="px-6 py-4">
                            <div class="text-sm text-gray-300">UGX {{ number_format($product->total_sales ?? 0) }}</div>
                            <div class="text-xs text-gray-500">{{ $product->sales_count ?? 0 }} sales</div>
                        </td>
                        <td class="px-6 py-4 text-right">
                            <div class="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                <a href="{{ route('esokoni.my-store.products.edit', $product) }}" class="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors" title="Edit">
                                    <span class="material-symbols-outlined text-[1.2rem]">edit</span>
                                </a>
                                <a href="{{ route('frontend.store.products.show', $product) }}" target="_blank" class="p-1.5 text-gray-400 hover:text-primary hover:bg-white/10 rounded transition-colors" title="View Public Listing">
                                    <span class="material-symbols-outlined text-[1.2rem]">visibility</span>
                                </a>
                                <button onclick="toggleProductStatus({{ $product->id }})" class="p-1.5 text-gray-400 hover:text-warning hover:bg-white/10 rounded transition-colors" title="Pause/Resume">
                                    <span class="material-symbols-outlined text-[1.2rem]">{{ $product->status === 'active' ? 'pause' : 'play_arrow' }}</span>
                                </button>
                                <button onclick="deleteProduct({{ $product->id }})" class="p-1.5 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded transition-colors" title="Delete">
                                    <span class="material-symbols-outlined text-[1.2rem]">delete</span>
                                </button>
                            </div>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="8" class="px-6 py-20 text-center">
                            <div class="flex flex-col items-center justify-center">
                                <span class="material-symbols-outlined text-6xl text-gray-500 mb-4">inventory_2</span>
                                <h3 class="text-xl font-semibold text-white mb-2">No Products Yet</h3>
                                <p class="text-gray-400 mb-6">Start building your store by adding your first product.</p>
                                @can('create', \App\Models\Product::class)
                                <a href="{{ route('frontend.store.products.create') }}" class="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 px-6 py-3 rounded-lg font-medium text-white transition-colors">
                                    <span class="material-symbols-outlined">add</span>
                                    Add Your First Product
                                </a>
                                @endcan
                            </div>
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        {{-- Pagination --}}
        @if($products->hasPages())
        <div class="px-6 py-4 border-t border-[#2c3435] flex items-center justify-between bg-[#1e2424]">
            <span class="text-sm text-gray-400">
                Showing <span class="text-white font-medium">{{ $products->firstItem() }}</span>-<span class="text-white font-medium">{{ $products->lastItem() }}</span> 
                of <span class="text-white font-medium">{{ $products->total() }}</span> products
            </span>
            <div class="flex items-center gap-2">
                {{-- Previous --}}
                @if($products->onFirstPage())
                    <button class="p-2 rounded-lg border border-[#2c3435] text-gray-400 opacity-50 cursor-not-allowed" disabled>
                        <span class="material-symbols-outlined text-lg">chevron_left</span>
                    </button>
                @else
                    <a href="{{ $products->previousPageUrl() }}" class="p-2 rounded-lg border border-[#2c3435] text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
                        <span class="material-symbols-outlined text-lg">chevron_left</span>
                    </a>
                @endif

                {{-- Page Numbers --}}
                @foreach($products->getUrlRange(1, $products->lastPage()) as $page => $url)
                    @if($page == $products->currentPage())
                        <button class="px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium">{{ $page }}</button>
                    @elseif($page == 1 || $page == $products->lastPage() || abs($page - $products->currentPage()) <= 2)
                        <a href="{{ $url }}" class="px-3 py-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white text-sm font-medium transition-colors">{{ $page }}</a>
                    @elseif(abs($page - $products->currentPage()) == 3)
                        <span class="text-gray-600 px-1">...</span>
                    @endif
                @endforeach

                {{-- Next --}}
                @if($products->hasMorePages())
                    <a href="{{ $products->nextPageUrl() }}" class="p-2 rounded-lg border border-[#2c3435] text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
                        <span class="material-symbols-outlined text-lg">chevron_right</span>
                    </a>
                @else
                    <button class="p-2 rounded-lg border border-[#2c3435] text-gray-400 opacity-50 cursor-not-allowed" disabled>
                        <span class="material-symbols-outlined text-lg">chevron_right</span>
                    </button>
                @endif
            </div>
        </div>
        @endif
    </div>
</main>

@push('scripts')
<script>
// Select All Functionality
function toggleSelectAll(checkbox) {
    const checkboxes = document.querySelectorAll('.product-checkbox');
    checkboxes.forEach(cb => cb.checked = checkbox.checked);
    updateBulkActions();
}

// Update Bulk Actions Bar
function updateBulkActions() {
    const checkboxes = document.querySelectorAll('.product-checkbox:checked');
    const count = checkboxes.length;
    const bulkBar = document.getElementById('bulkActionsBar');
    const countSpan = document.getElementById('selectedCount');
    
    if (count > 0) {
        bulkBar.classList.remove('hidden');
        bulkBar.classList.add('flex');
        countSpan.textContent = count;
    } else {
        bulkBar.classList.add('hidden');
        bulkBar.classList.remove('flex');
    }
}

// Bulk Actions
function bulkAction(action) {
    // TODO: Implement bulk actions functionality
    alert('Bulk actions coming soon! For now, please use individual product actions.');
    return;
    
    const checkboxes = document.querySelectorAll('.product-checkbox:checked');
    const ids = Array.from(checkboxes).map(cb => cb.value);
    
    if (ids.length === 0) return;
    
    if (!confirm(`Are you sure you want to ${action} ${ids.length} product(s)?`)) return;
    
    // Send request
    fetch(`#`, { // TODO: Implement bulk actions route
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
        },
        body: JSON.stringify({ action, ids })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.reload();
        } else {
            alert(data.message || 'Action failed');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred');
    });
}

// Toggle Product Status
function toggleProductStatus(productId) {
    fetch(`/store/products/${productId}/toggle-status`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.reload();
        } else {
            alert(data.message || 'Failed to update status');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred');
    });
}

// Delete Product
function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    
    fetch(`/store/products/${productId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.reload();
        } else {
            alert(data.message || 'Failed to delete product');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred');
    });
}
</script>
@endpush
@endsection
