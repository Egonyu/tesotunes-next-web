@extends('layouts.admin')

@section('title', 'Ads Management')

@section('content')
<div class="p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
        <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Ads Management</h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage advertising campaigns and track performance</p>
        </div>
        <div class="flex gap-3">
            <a href="{{ route('backend.ads.analytics') }}" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <span class="material-icons-round text-sm">analytics</span>
                Analytics
            </a>
            <a href="{{ route('backend.ads.create') }}" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                <span class="material-icons-round text-sm">add</span>
                Create Ad
            </a>
        </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Ads</p>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ $stats['total_ads'] }}</p>
                </div>
                <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <span class="material-icons-round text-blue-600 dark:text-blue-400">campaign</span>
                </div>
            </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Active</p>
                    <p class="text-2xl font-bold text-green-600">{{ $stats['active_ads'] }}</p>
                </div>
                <div class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <span class="material-icons-round text-green-600 dark:text-green-400">check_circle</span>
                </div>
            </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Impressions</p>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ number_format($stats['total_impressions']) }}</p>
                </div>
                <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <span class="material-icons-round text-purple-600 dark:text-purple-400">visibility</span>
                </div>
            </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Clicks</p>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ number_format($stats['total_clicks']) }}</p>
                </div>
                <div class="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                    <span class="material-icons-round text-orange-600 dark:text-orange-400">touch_app</span>
                </div>
            </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Revenue</p>
                    <p class="text-2xl font-bold text-green-600">UGX {{ number_format($stats['total_revenue']) }}</p>
                    <p class="text-xs text-gray-500">≈ ${{ number_format($stats['total_revenue'] / 3700, 2) }}</p>
                </div>
                <div class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <span class="material-icons-round text-green-600 dark:text-green-400">payments</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Ads Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ad</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Placement</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Impressions</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Clicks</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">CTR</th>
                    <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                @forelse($ads as $ad)
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            @if($ad->image_url)
                                <img src="{{ $ad->image_url }}" alt="{{ $ad->name }}" class="w-16 h-16 rounded object-cover">
                            @else
                                <div class="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                                    <span class="material-icons-round text-gray-400">image</span>
                                </div>
                            @endif
                            <div>
                                <p class="font-medium text-gray-900 dark:text-white">{{ $ad->name }}</p>
                                @if($ad->advertiser_name)
                                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ $ad->advertiser_name }}</p>
                                @endif
                                <p class="text-xs text-gray-400">Priority: {{ $ad->priority }}</p>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <span class="px-2 py-1 text-xs font-medium rounded-full
                            {{ $ad->type === 'google_adsense' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : '' }}
                            {{ $ad->type === 'direct' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' : '' }}
                            {{ $ad->type === 'affiliate' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' : '' }}">
                            {{ ucfirst(str_replace('_', ' ', $ad->type)) }}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {{ ucfirst($ad->placement) }}
                    </td>
                    <td class="px-6 py-4 text-right text-sm text-gray-900 dark:text-white">
                        {{ number_format($ad->impressions) }}
                    </td>
                    <td class="px-6 py-4 text-right text-sm text-gray-900 dark:text-white">
                        {{ number_format($ad->clicks) }}
                    </td>
                    <td class="px-6 py-4 text-right text-sm text-gray-900 dark:text-white">
                        {{ number_format($ad->ctr, 2) }}%
                    </td>
                    <td class="px-6 py-4 text-center">
                        <form method="POST" action="{{ route('backend.ads.toggle', $ad) }}" class="inline">
                            @csrf
                            @method('PATCH')
                            <button type="submit" class="px-3 py-1 text-xs font-medium rounded-full transition-colors
                                {{ $ad->is_active ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300' }}">
                                {{ $ad->is_active ? 'Active' : 'Inactive' }}
                            </button>
                        </form>
                    </td>
                    <td class="px-6 py-4 text-right">
                        <div class="flex items-center justify-end gap-2">
                            <a href="{{ route('backend.ads.show', $ad) }}" class="text-blue-600 hover:text-blue-800 dark:text-blue-400" title="View">
                                <span class="material-icons-round text-sm">visibility</span>
                            </a>
                            <a href="{{ route('backend.ads.edit', $ad) }}" class="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400" title="Edit">
                                <span class="material-icons-round text-sm">edit</span>
                            </a>
                            <form method="POST" action="{{ route('backend.ads.destroy', $ad) }}" class="inline" onsubmit="return confirm('Delete this ad?')">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="text-red-600 hover:text-red-800 dark:text-red-400" title="Delete">
                                    <span class="material-icons-round text-sm">delete</span>
                                </button>
                            </form>
                        </div>
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="8" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        <span class="material-icons-round text-4xl mb-2">campaign</span>
                        <p class="text-lg font-medium">No ads yet</p>
                        <p class="text-sm">Create your first ad to start monetizing</p>
                        <a href="{{ route('backend.ads.create') }}" class="inline-block mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                            Create Ad
                        </a>
                    </td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <!-- Pagination -->
    @if($ads->hasPages())
    <div class="mt-6">
        {{ $ads->links() }}
    </div>
    @endif
</div>
@endsection
