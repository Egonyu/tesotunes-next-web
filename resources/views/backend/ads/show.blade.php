@extends('layouts.admin')

@section('title', 'View Ad - ' . $ad->name)

@section('content')
<div class="p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
        <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $ad->name }}</h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                <span class="px-2 py-1 text-xs font-medium rounded-full
                    {{ $ad->is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' }}">
                    {{ $ad->is_active ? 'Active' : 'Inactive' }}
                </span>
                <span class="ml-2">{{ ucfirst($ad->type) }} · {{ ucfirst($ad->placement) }}</span>
            </p>
        </div>
        <div class="flex gap-3">
            <a href="{{ route('backend.ads.edit', $ad) }}" class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2">
                <span class="material-icons-round text-sm">edit</span>
                Edit
            </a>
            <form method="POST" action="{{ route('backend.ads.destroy', $ad) }}" class="inline" onsubmit="return confirm('Delete this ad?')">
                @csrf
                @method('DELETE')
                <button type="submit" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
                    <span class="material-icons-round text-sm">delete</span>
                    Delete
                </button>
            </form>
            <a href="{{ route('backend.ads.index') }}" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white flex items-center gap-2">
                <span class="material-icons-round text-sm">arrow_back</span>
                Back
            </a>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Ad Preview -->
        <div class="lg:col-span-2 space-y-6">
            <!-- Preview Card -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Preview</h2>
                
                @if($ad->image_url)
                    <img src="{{ $ad->image_url }}" alt="{{ $ad->name }}" class="w-full rounded-lg border border-gray-300 dark:border-gray-600">
                @elseif($ad->html_code)
                    <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-600">
                        <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">HTML Code:</p>
                        <pre class="text-xs font-mono overflow-x-auto">{{ $ad->html_code }}</pre>
                    </div>
                @elseif($ad->adsense_slot_id)
                    <div class="p-8 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-600 text-center">
                        <span class="material-icons-round text-4xl text-gray-400 mb-2">campaign</span>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Google AdSense</p>
                        <p class="text-xs text-gray-500">Slot: {{ $ad->adsense_slot_id }}</p>
                    </div>
                @endif
            </div>

            <!-- Performance Stats -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Performance (30 Days)</h2>
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Impressions</p>
                        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ number_format($stats['total_impressions']) }}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Clicks</p>
                        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ number_format($stats['total_clicks']) }}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">CTR</p>
                        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ number_format($stats['ctr'], 2) }}%</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Revenue</p>
                        <p class="text-2xl font-bold text-green-600">UGX {{ number_format($ad->revenue) }}</p>
                    </div>
                </div>
            </div>

            <!-- Device Breakdown -->
            @if(isset($stats['by_device']) && $stats['by_device']->count() > 0)
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Device Breakdown</h2>
                
                <div class="space-y-3">
                    @foreach($stats['by_device'] as $device => $count)
                    <div>
                        <div class="flex items-center justify-between mb-1">
                            <span class="text-sm text-gray-700 dark:text-gray-300">{{ ucfirst($device) }}</span>
                            <span class="text-sm font-medium text-gray-900 dark:text-white">{{ number_format($count) }}</span>
                        </div>
                        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div class="bg-blue-600 h-2 rounded-full" style="width: {{ ($count / $stats['total_impressions']) * 100 }}%"></div>
                        </div>
                    </div>
                    @endforeach
                </div>
            </div>
            @endif
        </div>

        <!-- Ad Details Sidebar -->
        <div class="space-y-6">
            <!-- Basic Details -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Details</h2>
                
                <div class="space-y-3 text-sm">
                    <div>
                        <p class="text-gray-600 dark:text-gray-400">Type</p>
                        <p class="font-medium text-gray-900 dark:text-white">{{ ucfirst(str_replace('_', ' ', $ad->type)) }}</p>
                    </div>
                    <div>
                        <p class="text-gray-600 dark:text-gray-400">Placement</p>
                        <p class="font-medium text-gray-900 dark:text-white">{{ ucfirst($ad->placement) }}</p>
                    </div>
                    <div>
                        <p class="text-gray-600 dark:text-gray-400">Format</p>
                        <p class="font-medium text-gray-900 dark:text-white">{{ ucfirst($ad->format) }}</p>
                    </div>
                    <div>
                        <p class="text-gray-600 dark:text-gray-400">Priority</p>
                        <p class="font-medium text-gray-900 dark:text-white">{{ $ad->priority }}</p>
                    </div>
                    @if($ad->advertiser_name)
                    <div>
                        <p class="text-gray-600 dark:text-gray-400">Advertiser</p>
                        <p class="font-medium text-gray-900 dark:text-white">{{ $ad->advertiser_name }}</p>
                    </div>
                    @endif
                </div>
            </div>

            <!-- Targeting -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Targeting</h2>
                
                <div class="space-y-3 text-sm">
                    <div>
                        <p class="text-gray-600 dark:text-gray-400 mb-1">Pages</p>
                        @if($ad->pages && count($ad->pages) > 0)
                            <div class="flex flex-wrap gap-1">
                                @foreach($ad->pages as $page)
                                    <span class="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded text-xs">{{ ucfirst($page) }}</span>
                                @endforeach
                            </div>
                        @else
                            <p class="text-gray-500">All pages</p>
                        @endif
                    </div>
                    <div>
                        <p class="text-gray-600 dark:text-gray-400 mb-1">Device</p>
                        <p class="text-gray-900 dark:text-white">
                            @if($ad->mobile_only)
                                Mobile Only
                            @elseif($ad->desktop_only)
                                Desktop Only
                            @else
                                All Devices
                            @endif
                        </p>
                    </div>
                </div>
            </div>

            <!-- Schedule -->
            @if($ad->start_date || $ad->end_date)
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Schedule</h2>
                
                <div class="space-y-3 text-sm">
                    @if($ad->start_date)
                    <div>
                        <p class="text-gray-600 dark:text-gray-400">Start Date</p>
                        <p class="font-medium text-gray-900 dark:text-white">{{ $ad->start_date->format('M d, Y') }}</p>
                    </div>
                    @endif
                    @if($ad->end_date)
                    <div>
                        <p class="text-gray-600 dark:text-gray-400">End Date</p>
                        <p class="font-medium text-gray-900 dark:text-white">{{ $ad->end_date->format('M d, Y') }}</p>
                    </div>
                    @endif
                </div>
            </div>
            @endif

            <!-- Timestamps -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Timestamps</h2>
                
                <div class="space-y-3 text-sm">
                    <div>
                        <p class="text-gray-600 dark:text-gray-400">Created</p>
                        <p class="text-gray-900 dark:text-white">{{ $ad->created_at->format('M d, Y H:i') }}</p>
                    </div>
                    <div>
                        <p class="text-gray-600 dark:text-gray-400">Updated</p>
                        <p class="text-gray-900 dark:text-white">{{ $ad->updated_at->format('M d, Y H:i') }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
