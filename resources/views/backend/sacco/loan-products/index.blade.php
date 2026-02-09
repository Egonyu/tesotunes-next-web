@extends('layouts.admin')

@section('title', 'Loan Products')

@section('content')
<div class="dashboard-content">
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-6">
        <div>
            <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">Loan Products</h1>
            <p class="text-slate-600 dark:text-navy-300 mt-1">Manage loan product types and configurations</p>
        </div>
        <div>
            <a href="{{ route('admin.sacco.loan-products.create') }}" 
               class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition">
                <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Create Loan Product
            </a>
        </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6 mb-6">
        <div class="card p-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-slate-600 dark:text-navy-300 text-sm">Total Products</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50 mt-1">{{ $products->total() }}</p>
                </div>
                <div class="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
                    <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="card p-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-slate-600 dark:text-navy-300 text-sm">Active Products</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50 mt-1">{{ $products->where('is_active', true)->count() }}</p>
                </div>
                <div class="p-2 bg-success/10 text-success rounded-lg">
                    <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="card p-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-slate-600 dark:text-navy-300 text-sm">Inactive Products</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50 mt-1">{{ $products->where('is_active', false)->count() }}</p>
                </div>
                <div class="p-2 bg-slate-500/10 text-slate-500 rounded-lg">
                    <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="card p-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-slate-600 dark:text-navy-300 text-sm">Total Loans</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50 mt-1">{{ $products->sum('loans_count') }}</p>
                </div>
                <div class="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                    <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
        </div>
    </div>

    <!-- Products Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        @forelse($products as $product)
            <div class="card p-5 {{ !$product->is_active ? 'opacity-60' : '' }}">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50">{{ $product->name }}</h3>
                            <span class="px-2 py-0.5 text-xs font-medium rounded-full {{ $product->is_active ? 'bg-success/10 text-success' : 'bg-slate-500/10 text-slate-500' }}">
                                {{ $product->is_active ? 'Active' : 'Inactive' }}
                            </span>
                        </div>
                        @if($product->description)
                            <p class="text-sm text-slate-600 dark:text-navy-300 mb-3">{{ $product->description }}</p>
                        @endif
                    </div>
                </div>

                <!-- Product Details Grid -->
                <div class="grid grid-cols-2 gap-3 mb-4">
                    <div class="p-3 bg-slate-50 dark:bg-navy-600 rounded-lg">
                        <p class="text-xs text-slate-500 dark:text-navy-400 mb-1">Amount Range</p>
                        <p class="text-sm font-medium text-slate-800 dark:text-navy-50">
                            UGX {{ number_format($product->min_amount) }} - {{ number_format($product->max_amount) }}
                        </p>
                    </div>
                    <div class="p-3 bg-slate-50 dark:bg-navy-600 rounded-lg">
                        <p class="text-xs text-slate-500 dark:text-navy-400 mb-1">Interest Rate</p>
                        <p class="text-sm font-medium text-slate-800 dark:text-navy-50">
                            {{ $product->interest_rate }}% per {{ $product->interest_type === 'monthly' ? 'month' : 'year' }}
                        </p>
                    </div>
                    <div class="p-3 bg-slate-50 dark:bg-navy-600 rounded-lg">
                        <p class="text-xs text-slate-500 dark:text-navy-400 mb-1">Duration</p>
                        <p class="text-sm font-medium text-slate-800 dark:text-navy-50">
                            {{ $product->min_duration_months }} - {{ $product->max_duration_months }} months
                        </p>
                    </div>
                    <div class="p-3 bg-slate-50 dark:bg-navy-600 rounded-lg">
                        <p class="text-xs text-slate-500 dark:text-navy-400 mb-1">Guarantors</p>
                        <p class="text-sm font-medium text-slate-800 dark:text-navy-50">
                            {{ $product->min_guarantors }} required
                        </p>
                    </div>
                </div>

                <!-- Additional Info -->
                <div class="flex items-center justify-between p-3 bg-indigo-500/10 rounded-lg mb-4">
                    <div>
                        <p class="text-xs text-slate-600 dark:text-navy-300">Processing Fee</p>
                        <p class="text-sm font-bold text-slate-800 dark:text-navy-50">{{ $product->processing_fee_percentage }}%</p>
                    </div>
                    <div>
                        <p class="text-xs text-slate-600 dark:text-navy-300">Penalty Rate</p>
                        <p class="text-sm font-bold text-slate-800 dark:text-navy-50">{{ $product->penalty_rate }}%</p>
                    </div>
                    <div>
                        <p class="text-xs text-slate-600 dark:text-navy-300">Loans Issued</p>
                        <p class="text-sm font-bold text-slate-800 dark:text-navy-50">{{ $product->loans_count }}</p>
                    </div>
                    <div>
                        <p class="text-xs text-slate-600 dark:text-navy-300">Collateral</p>
                        <p class="text-sm font-bold text-slate-800 dark:text-navy-50">
                            {{ $product->collateral_required ? $product->collateral_percentage . '%' : 'No' }}
                        </p>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex items-center gap-2">
                    <a href="{{ route('admin.sacco.loan-products.edit', $product) }}" 
                       class="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition">
                        <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                    </a>
                    <form action="{{ route('admin.sacco.loan-products.toggle', $product) }}" method="POST" class="flex-1">
                        @csrf
                        <button type="submit" 
                                class="w-full inline-flex items-center justify-center gap-2 px-3 py-2 {{ $product->is_active ? 'bg-warning/10 text-warning hover:bg-warning/20' : 'bg-success/10 text-success hover:bg-success/20' }} rounded-lg transition">
                            @if($product->is_active)
                                <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                                Deactivate
                            @else
                                <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Activate
                            @endif
                        </button>
                    </form>
                    @if($product->loans_count == 0)
                        <button onclick="confirmDelete('{{ $product->id }}', '{{ $product->name }}')" 
                                class="inline-flex items-center justify-center p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition">
                            <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    @endif
                </div>
            </div>
        @empty
            <div class="col-span-2 card p-12 text-center">
                <svg class="size-16 text-slate-400 dark:text-navy-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-2">No Loan Products</h3>
                <p class="text-slate-500 dark:text-navy-400 mb-4">Create your first loan product to get started</p>
                <a href="{{ route('admin.sacco.loan-products.create') }}" 
                   class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition">
                    <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Create Loan Product
                </a>
            </div>
        @endforelse
    </div>

    <!-- Pagination -->
    @if($products->hasPages())
        <div class="mt-6">
            {{ $products->links() }}
        </div>
    @endif
</div>

<!-- Delete Confirmation Modal -->
<div id="deleteModal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-navy-700 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-bold text-slate-800 dark:text-navy-50 mb-2">Delete Loan Product</h3>
        <p id="deleteProductName" class="text-sm text-slate-600 dark:text-navy-300 mb-4"></p>
        <p class="text-sm text-red-500 mb-4">⚠️ This action cannot be undone!</p>
        <form id="deleteForm" method="POST">
            @csrf
            @method('DELETE')
            <div class="flex gap-2">
                <button type="button" onclick="closeDeleteModal()" 
                        class="flex-1 px-4 py-2 bg-slate-200 dark:bg-navy-600 rounded-lg hover:bg-slate-300 transition">
                    Cancel
                </button>
                <button type="submit" class="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                    Delete Product
                </button>
            </div>
        </form>
    </div>
</div>

@push('scripts')
<script>
function confirmDelete(productId, productName) {
    document.getElementById('deleteModal').classList.remove('hidden');
    document.getElementById('deleteProductName').textContent = 'Are you sure you want to delete "' + productName + '"?';
    document.getElementById('deleteForm').action = `/admin/sacco/loan-products/${productId}`;
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.add('hidden');
}

// Close modal on Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeDeleteModal();
    }
});
</script>
@endpush
@endsection
