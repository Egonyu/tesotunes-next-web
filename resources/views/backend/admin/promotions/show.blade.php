@extends('layouts.admin')

@section('title', 'Promotion Details')

@section('content')
<div class="p-6">
    <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="mb-6">
            <a href="{{ route('admin.promotions.index') }}" class="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center">
                <span class="material-icons-round text-sm mr-1">arrow_back</span>
                Back to Promotions
            </a>
            <div class="flex items-center justify-between mt-2">
                <h1 class="text-2xl font-bold text-gray-900">Promotion Details</h1>
                <div class="flex space-x-2">
                    <a href="{{ route('admin.promotions.edit', $promotion) }}" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Edit
                    </a>
                </div>
            </div>
        </div>

        <!-- Promotion Info -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h2 class="text-xl font-bold mb-4">{{ $promotion['title'] ?? 'Promotion' }}</h2>
            <p class="text-gray-600 mb-4">{{ $promotion['description'] ?? 'No description' }}</p>
            
            <div class="grid grid-cols-4 gap-4">
                <div>
                    <p class="text-sm text-gray-600">Status</p>
                    <p class="font-semibold">{{ ucfirst($promotion['status'] ?? 'Unknown') }}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-600">Budget</p>
                    <p class="font-semibold">UGX {{ number_format($promotion['budget'] ?? 0) }}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-600">Impressions</p>
                    <p class="font-semibold">{{ number_format($promotion['impressions'] ?? 0) }}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-600">Clicks</p>
                    <p class="font-semibold">{{ number_format($promotion['clicks'] ?? 0) }}</p>
                </div>
            </div>
        </div>

        <!-- Performance Chart Placeholder -->
        <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-bold mb-4">Performance Overview</h2>
            <div class="h-64 flex items-center justify-center bg-gray-50 rounded">
                <p class="text-gray-500">Chart visualization will be implemented here</p>
            </div>
        </div>
    </div>
</div>
@endsection
