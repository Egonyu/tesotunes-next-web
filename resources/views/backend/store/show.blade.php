@extends('layouts.admin')

@section('title', 'Store Details')

@section('content')
<div class="container mx-auto px-4 py-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
        <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $store->name }}</h1>
            <p class="text-gray-600 dark:text-gray-400">Store ID: {{ $store->id }}</p>
        </div>
        <div class="flex space-x-2">
            <a href="{{ route('admin.store.products.index', $store) }}" class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-2">
                <span class="material-icons-round text-lg">inventory_2</span>
                Manage Products
            </a>

            <a href="{{ route('admin.store.edit', $store) }}" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
                <span class="material-icons-round text-lg">edit</span>
                Edit Store
            </a>

            @if($store->status === 'pending')
                <form action="{{ route('admin.store.approve', $store) }}" method="POST" class="inline">
                    @csrf
                    <input type="hidden" name="_method" value="PATCH">
                    <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2">
                        <span class="material-icons-round text-lg">check_circle</span>
                        Approve Store
                    </button>
                </form>
            @endif

            @if($store->status === 'active')
                <button onclick="confirmSuspend({{ $store->id }})" class="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">
                    Suspend Store
                </button>
            @elseif($store->status === 'suspended')
                <form action="{{ route('admin.store.reactivate', $store) }}" method="POST" class="inline">
                    @csrf
                    <input type="hidden" name="_method" value="PATCH">
                    <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
                        <span class="material-icons-round text-lg">refresh</span>
                        Reactivate Store
                    </button>
                </form>
            @endif

            <button onclick="confirmDelete({{ $store->id }})" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                Delete Store
            </button>
        </div>
    </div>

    <!-- Store Status Badge -->
    <div class="mb-6">
        <span class="px-3 py-1 rounded-full text-sm font-semibold
            @if($store->status === 'active') bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100
            @elseif($store->status === 'pending') bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100
            @elseif($store->status === 'suspended') bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100
            @else bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100
            @endif">
            {{ ucfirst($store->status) }}
        </span>
        @if($store->suspension_reason)
            <span class="ml-2 text-sm text-red-600 dark:text-red-400">
                Reason: {{ $store->suspension_reason }}
            </span>
        @endif
    </div>

    <!-- Statistics Grid -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Products</div>
            <div class="text-3xl font-bold text-gray-900 dark:text-white">{{ $stats['total_products'] ?? 0 }}</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</div>
            <div class="text-3xl font-bold text-gray-900 dark:text-white">{{ $stats['total_orders'] ?? 0 }}</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div class="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</div>
            <div class="text-3xl font-bold text-gray-900 dark:text-white">UGX {{ number_format($stats['total_revenue'] ?? 0) }}</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div class="text-sm font-medium text-gray-600 dark:text-gray-400">Average Rating</div>
            <div class="text-3xl font-bold text-gray-900 dark:text-white">{{ number_format($stats['average_rating'] ?? 0, 1) }}</div>
        </div>
    </div>

    <!-- Store Information -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Basic Info -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Store Information</h2>
            <div class="space-y-3">
                <div>
                    <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Owner:</span>
                    <span class="text-sm text-gray-900 dark:text-white ml-2">{{ $store->owner->name ?? 'N/A' }}</span>
                </div>
                <div>
                    <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Owner Type:</span>
                    <span class="text-sm text-gray-900 dark:text-white ml-2">{{ ucfirst($store->user->role ?? 'N/A') }}</span>
                </div>
                <div>
                    <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Category:</span>
                    <span class="text-sm text-gray-900 dark:text-white ml-2">{{ $store->category ?? 'N/A' }}</span>
                </div>
                <div>
                    <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Created:</span>
                    <span class="text-sm text-gray-900 dark:text-white ml-2">{{ $store->created_at->format('M d, Y') }}</span>
                </div>
            </div>
        </div>

        <!-- Contact Info -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Contact Information</h2>
            <div class="space-y-3">
                @if($store->contact_email)
                <div>
                    <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Email:</span>
                    <span class="text-sm text-gray-900 dark:text-white ml-2">{{ $store->contact_email }}</span>
                </div>
                @endif
                @if($store->contact_phone)
                <div>
                    <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Phone:</span>
                    <span class="text-sm text-gray-900 dark:text-white ml-2">{{ $store->contact_phone }}</span>
                </div>
                @endif
                @if($store->address)
                <div>
                    <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Address:</span>
                    <span class="text-sm text-gray-900 dark:text-white ml-2">{{ $store->address }}</span>
                </div>
                @endif
            </div>
        </div>
    </div>

    <!-- Description -->
    @if($store->description)
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Description</h2>
        <p class="text-gray-700 dark:text-gray-300">{{ $store->description }}</p>
    </div>
    @endif

    <!-- Recent Products -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Products</h2>
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-900">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Product</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Price</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Stock</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                    </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    @forelse($store->products->take(5) as $product)
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {{ $product->name }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            UGX {{ number_format($product->price) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {{ $product->stock_quantity ?? 'N/A' }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="px-2 py-1 text-xs rounded-full {{ $product->is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800' }}">
                                {{ $product->is_active ? 'Active' : 'Inactive' }}
                            </span>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                            No products yet
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    <!-- Recent Orders -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Orders</h2>
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-900">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Order #</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Customer</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                    </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    @forelse($store->orders->take(5) as $order)
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <a href="{{ route('admin.store.orders.show', $order) }}" class="text-blue-600 hover:underline">
                                {{ $order->order_number }}
                            </a>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {{ $order->buyer->name ?? 'N/A' }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            UGX {{ number_format($order->total_amount) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="px-2 py-1 text-xs rounded-full
                                @if($order->status === 'completed') bg-green-100 text-green-800
                                @elseif($order->status === 'pending') bg-yellow-100 text-yellow-800
                                @else bg-gray-100 text-gray-800
                                @endif">
                                {{ ucfirst($order->status) }}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {{ $order->created_at->format('M d, Y') }}
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                            No orders yet
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Suspension Modal -->
<div id="suspendModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Suspend Store</h3>
        <form id="suspendForm" method="POST">
            @csrf
            @method('PATCH')
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason</label>
                <textarea name="reason" rows="3" required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"></textarea>
            </div>
            <div class="flex justify-end space-x-2">
                <button type="button" onclick="closeSuspendModal()" class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Cancel</button>
                <button type="submit" class="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">Suspend</button>
            </div>
        </form>
    </div>
</div>

<!-- Delete Confirmation Modal -->
<div id="deleteModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Delete Store</h3>
        <p class="text-gray-700 dark:text-gray-300 mb-4">Are you sure you want to delete this store? This action cannot be undone.</p>
        <form id="deleteForm" method="POST">
            @csrf
            @method('DELETE')
            <div class="flex justify-end space-x-2">
                <button type="button" onclick="closeDeleteModal()" class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Cancel</button>
                <button type="submit" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
            </div>
        </form>
    </div>
</div>

@push('scripts')
<script>
function confirmSuspend(storeId) {
    document.getElementById('suspendForm').action = `/backend/store/${storeId}/suspend`;
    document.getElementById('suspendModal').classList.remove('hidden');
}

function closeSuspendModal() {
    document.getElementById('suspendModal').classList.add('hidden');
}

function confirmDelete(storeId) {
    document.getElementById('deleteForm').action = `/backend/store/${storeId}`;
    document.getElementById('deleteModal').classList.remove('hidden');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.add('hidden');
}
</script>
@endpush
@endsection
