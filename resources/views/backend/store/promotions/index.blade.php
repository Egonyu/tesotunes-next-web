@extends('layouts.admin')
@section('title', 'Store Promotions')
@section('content')
<div class="space-y-6">
    <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Store Promotions</h1>
        <a href="{{ route('admin.store.promotions.create') }}" 
           class="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <span class="material-icons-round">add</span>
            Create Promotion
        </a>
    </div>
    
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg border p-4">
            <p class="text-sm text-gray-600 dark:text-gray-400">Total Promotions</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ $stats['total_promotions'] ?? 0 }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg border p-4">
            <p class="text-sm text-gray-600 dark:text-gray-400">Active Now</p>
            <p class="text-2xl font-bold text-green-600">{{ $stats['active_promotions'] ?? 0 }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg border p-4">
            <p class="text-sm text-gray-600 dark:text-gray-400">Pending Approval</p>
            <p class="text-2xl font-bold text-yellow-600">{{ $stats['pending_approval'] ?? 0 }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg border p-4">
            <p class="text-sm text-gray-600 dark:text-gray-400">Total Redemptions</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ $stats['total_redemptions'] ?? 0 }}</p>
        </div>
    </div>
    
    <div class="bg-white dark:bg-gray-800 rounded-lg border p-6">
        <table class="w-full">
            <thead>
                <tr class="bg-gray-50 dark:bg-gray-700">
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase">Promotion</th>
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase">Store</th>
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase">Discount</th>
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase">Status</th>
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase">Actions</th>
                </tr>
            </thead>
            <tbody>
                @forelse($promotions as $promo)
                <tr class="border-t">
                    <td class="px-4 py-3">{{ $promo->name }}</td>
                    <td class="px-4 py-3">{{ $promo->store->name ?? 'Platform-wide' }}</td>
                    <td class="px-4 py-3">{{ $promo->discount_value ?? 0 }}{{ $promo->discount_type === 'percentage' ? '%' : ' UGX' }}</td>
                    <td class="px-4 py-3">
                        <span class="px-2 py-1 rounded text-xs 
                            {{ $promo->status === 'active' ? 'bg-green-100 text-green-800' : '' }}
                            {{ $promo->status === 'pending' ? 'bg-yellow-100 text-yellow-800' : '' }}
                            {{ $promo->status === 'inactive' ? 'bg-gray-100 text-gray-800' : '' }}">
                            {{ ucfirst($promo->status) }}
                        </span>
                    </td>
                    <td class="px-4 py-3 space-x-2">
                        <a href="{{ route('admin.store.promotions.show', $promo) }}" class="text-blue-600 hover:underline">View</a>
                        <a href="{{ route('admin.store.promotions.edit', $promo) }}" class="text-green-600 hover:underline">Edit</a>
                    </td>
                </tr>
                @empty
                <tr><td colspan="5" class="px-4 py-12 text-center text-gray-500">No promotions yet. Create your first one!</td></tr>
                @endforelse
            </tbody>
        </table>
        
        @if($promotions->hasPages())
        <div class="mt-6">
            {{ $promotions->links() }}
        </div>
        @endif
    </div>
</div>
@endsection
