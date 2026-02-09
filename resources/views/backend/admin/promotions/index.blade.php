@extends('layouts.admin')

@section('title', 'Promotions Management')

@section('content')
<div class="p-6">
    <!-- Header -->
    <div class="mb-6">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-bold text-gray-900">Promotions Management</h1>
                <p class="text-gray-600 mt-1">Manage and moderate platform promotions</p>
            </div>
            <a href="{{ route('admin.promotions.create') }}" 
               class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center">
                <span class="material-icons-round text-sm mr-2">add</span>
                Create Promotion
            </a>
        </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="p-3 bg-green-100 rounded-lg">
                    <span class="material-icons-round text-green-600">campaign</span>
                </div>
                <div class="ml-4">
                    <p class="text-sm text-gray-600">Total Promotions</p>
                    <p class="text-2xl font-bold">{{ $stats['total'] ?? 0 }}</p>
                </div>
            </div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="p-3 bg-blue-100 rounded-lg">
                    <span class="material-icons-round text-blue-600">pending_actions</span>
                </div>
                <div class="ml-4">
                    <p class="text-sm text-gray-600">Pending Approval</p>
                    <p class="text-2xl font-bold">{{ $stats['pending'] ?? 0 }}</p>
                </div>
            </div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="p-3 bg-purple-100 rounded-lg">
                    <span class="material-icons-round text-purple-600">play_circle</span>
                </div>
                <div class="ml-4">
                    <p class="text-sm text-gray-600">Active</p>
                    <p class="text-2xl font-bold">{{ $stats['active'] ?? 0 }}</p>
                </div>
            </div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="p-3 bg-orange-100 rounded-lg">
                    <span class="material-icons-round text-orange-600">payments</span>
                </div>
                <div class="ml-4">
                    <p class="text-sm text-gray-600">Revenue (Month)</p>
                    <p class="text-2xl font-bold">UGX {{ number_format($stats['revenue'] ?? 0) }}</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow mb-6 p-4">
        <div class="flex items-center space-x-4">
            <input type="text" 
                   placeholder="Search promotions..."
                   class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <select class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Statuses</option>
                <option>Pending</option>
                <option>Active</option>
                <option>Completed</option>
                <option>Paused</option>
                <option>Rejected</option>
            </select>
            <select class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Types</option>
                <option>Featured</option>
                <option>Banner</option>
                <option>Sponsored</option>
            </select>
            <button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <span class="material-icons-round text-sm">filter_list</span>
            </button>
        </div>
    </div>

    <!-- Promotions Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Promotion
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Artist
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Budget
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Performance
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                    </th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                    </th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                @forelse($promotions ?? [] as $promotion)
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <img class="h-10 w-10 rounded object-cover" 
                                 src="{{ $promotion['content']['artwork'] ?? '/images/default-song-artwork.svg' }}" 
                                 alt="">
                            <div class="ml-4">
                                <div class="text-sm font-medium text-gray-900">{{ $promotion['title'] ?? 'Promotion' }}</div>
                                <div class="text-sm text-gray-500">{{ $promotion['type'] ?? 'Standard' }}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">{{ $promotion['artist']['name'] ?? 'Unknown' }}</div>
                        <div class="text-sm text-gray-500">{{ $promotion['artist']['email'] ?? '' }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">UGX {{ number_format($promotion['budget'] ?? 0) }}</div>
                        <div class="text-sm text-gray-500">Spent: {{ number_format($promotion['spent'] ?? 0) }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">{{ number_format($promotion['impressions'] ?? 0) }} views</div>
                        <div class="text-sm text-gray-500">{{ number_format($promotion['clicks'] ?? 0) }} clicks ({{ $promotion['ctr'] ?? 0 }}%)</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full {{ $promotion['status_class'] ?? 'bg-gray-100 text-gray-800' }}">
                            {{ ucfirst($promotion['status'] ?? 'Unknown') }}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{{ $promotion['start_date'] ?? 'N/A' }}</div>
                        <div>{{ $promotion['end_date'] ?? 'N/A' }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div class="flex items-center justify-end space-x-2">
                            <a href="{{ route('admin.promotions.show', $promotion['id']) }}" 
                               class="text-blue-600 hover:text-blue-900">
                                <span class="material-icons-round text-sm">visibility</span>
                            </a>
                            @if($promotion['status'] === 'pending')
                            <button onclick="approvePromotion({{ $promotion['id'] }})" 
                                    class="text-green-600 hover:text-green-900">
                                <span class="material-icons-round text-sm">check_circle</span>
                            </button>
                            <button onclick="rejectPromotion({{ $promotion['id'] }})" 
                                    class="text-red-600 hover:text-red-900">
                                <span class="material-icons-round text-sm">cancel</span>
                            </button>
                            @endif
                            <a href="{{ route('admin.promotions.edit', $promotion['id']) }}" 
                               class="text-gray-600 hover:text-gray-900">
                                <span class="material-icons-round text-sm">edit</span>
                            </a>
                        </div>
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="7" class="px-6 py-12 text-center">
                        <span class="material-icons-round text-gray-400 text-5xl mb-4">campaign</span>
                        <p class="text-gray-500">No promotions found</p>
                    </td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <!-- Pagination -->
    @if(isset($promotions) && count($promotions) > 0)
    <div class="mt-6">
        <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700">
                Showing <span class="font-medium">1</span> to <span class="font-medium">10</span> of <span class="font-medium">{{ count($promotions) }}</span> results
            </div>
            <nav class="flex items-center space-x-2">
                <button class="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Previous</button>
                <button class="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">1</button>
                <button class="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">2</button>
                <button class="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">3</button>
                <button class="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Next</button>
            </nav>
        </div>
    </div>
    @endif
</div>

@push('scripts')
<script>
function approvePromotion(id) {
    if (confirm('Approve this promotion?')) {
        fetch(`/admin/promotions/${id}/approve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            }
        });
    }
}

function rejectPromotion(id) {
    const reason = prompt('Rejection reason:');
    if (reason) {
        fetch(`/admin/promotions/${id}/reject`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            },
            body: JSON.stringify({ reason })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            }
        });
    }
}
</script>
@endpush
@endsection
