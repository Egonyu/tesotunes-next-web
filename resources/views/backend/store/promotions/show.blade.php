@extends('layouts.admin')
@section('title', 'Promotion Details')
@section('content')
<div class="space-y-6">
    <h1 class="text-2xl font-bold">{{ $promotion->name }}</h1>
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border">
        <div class="grid grid-cols-2 gap-4">
            <div><label class="font-medium">Store</label><p>{{ $promotion->store->name }}</p></div>
            <div><label class="font-medium">Discount</label><p>{{ $promotion->discount_value }}{{ $promotion->discount_type === 'percentage' ? '%' : ' UGX' }}</p></div>
            <div><label class="font-medium">Valid From</label><p>{{ $promotion->starts_at->format('M d, Y') }}</p></div>
            <div><label class="font-medium">Valid Until</label><p>{{ $promotion->ends_at->format('M d, Y') }}</p></div>
        </div>
        <div class="flex gap-2 mt-6">
            <form action="{{ route('admin.store.promotions.approve', $promotion) }}" method="POST">
                @csrf @method('PATCH')
                <button class="px-4 py-2 bg-green-600 text-white rounded-lg">Approve</button>
            </form>
            <form action="{{ route('admin.store.promotions.reject', $promotion) }}" method="POST">
                @csrf @method('PATCH')
                <button class="px-4 py-2 bg-red-600 text-white rounded-lg">Reject</button>
            </form>
        </div>
    </div>
</div>
@endsection
