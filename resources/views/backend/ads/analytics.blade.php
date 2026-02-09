@extends('layouts.admin')

@section('title', 'Ads Analytics')

@push('styles')
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/apexcharts@latest/dist/apexcharts.css">
@endpush

@section('content')
<div class="p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
        <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Ads Analytics</h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Track revenue and performance metrics</p>
        </div>
        <div class="flex gap-3">
            <a href="{{ route('backend.ads.index') }}" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white flex items-center gap-2">
                <span class="material-icons-round text-sm">arrow_back</span>
                Back to Ads
            </a>
        </div>
    </div>

    <!-- Key Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm opacity-90 mb-1">Total Revenue</p>
                    <p class="text-3xl font-bold">UGX {{ number_format($totalRevenue) }}</p>
                    <p class="text-xs opacity-75 mt-1">≈ ${{ number_format($totalRevenue / 3700, 2) }} USD</p>
                </div>
                <div class="w-16 h-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <span class="material-icons-round text-3xl">payments</span>
                </div>
            </div>
        </div>

        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm opacity-90 mb-1">Total Impressions</p>
                    <p class="text-3xl font-bold">{{ number_format($totalImpressions) }}</p>
                    <p class="text-xs opacity-75 mt-1">Last 30 days</p>
                </div>
                <div class="w-16 h-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <span class="material-icons-round text-3xl">visibility</span>
                </div>
            </div>
        </div>

        <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm opacity-90 mb-1">Total Clicks</p>
                    <p class="text-3xl font-bold">{{ number_format($totalClicks) }}</p>
                    <p class="text-xs opacity-75 mt-1">Last 30 days</p>
                </div>
                <div class="w-16 h-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <span class="material-icons-round text-3xl">touch_app</span>
                </div>
            </div>
        </div>

        <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow p-6 text-white">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm opacity-90 mb-1">Average CTR</p>
                    <p class="text-3xl font-bold">{{ number_format($avgCTR, 2) }}%</p>
                    <p class="text-xs opacity-75 mt-1">Industry: 0.5-2%</p>
                </div>
                <div class="w-16 h-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <span class="material-icons-round text-3xl">trending_up</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Revenue Chart -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Revenue Trend (30 Days)</h2>
            <div id="revenueChart"></div>
        </div>

        <!-- Device Breakdown -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Performance by Device</h2>
            <div id="deviceChart"></div>
        </div>
    </div>

    <!-- Top Performing Ads -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">Top Performing Ads</h2>
        </div>
        <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ad Name</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Impressions</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Clicks</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">CTR</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Revenue</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                @forelse($ads as $ad)
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            @if($ad->image_url)
                                <img src="{{ $ad->image_url }}" alt="{{ $ad->name }}" class="w-12 h-12 rounded object-cover">
                            @else
                                <div class="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                                    <span class="material-icons-round text-gray-400 text-sm">image</span>
                                </div>
                            @endif
                            <div>
                                <p class="font-medium text-gray-900 dark:text-white">{{ $ad->name }}</p>
                                <p class="text-xs text-gray-500">{{ ucfirst($ad->placement) }}</p>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-right text-sm text-gray-900 dark:text-white">
                        {{ number_format($ad->impressions) }}
                    </td>
                    <td class="px-6 py-4 text-right text-sm text-gray-900 dark:text-white">
                        {{ number_format($ad->clicks) }}
                    </td>
                    <td class="px-6 py-4 text-right">
                        <span class="px-2 py-1 text-xs font-medium rounded-full
                            {{ $ad->ctr >= 2 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : '' }}
                            {{ $ad->ctr >= 1 && $ad->ctr < 2 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : '' }}
                            {{ $ad->ctr < 1 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : '' }}">
                            {{ number_format($ad->ctr, 2) }}%
                        </span>
                    </td>
                    <td class="px-6 py-4 text-right text-sm font-medium text-green-600">
                        UGX {{ number_format($ad->revenue) }}
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="5" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        <p>No ad data available</p>
                    </td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
@endsection

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/apexcharts@latest"></script>
<script>
// Revenue Chart
const revenueData = @json($revenueByDay);
const revenueChart = new ApexCharts(document.querySelector("#revenueChart"), {
    series: [{
        name: 'Revenue (UGX)',
        data: revenueData.map(d => d.total)
    }],
    chart: {
        height: 350,
        type: 'area',
        toolbar: { show: false }
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: {
        categories: revenueData.map(d => d.date),
        labels: { 
            style: { colors: '#9ca3af' }
        }
    },
    yaxis: {
        labels: { 
            style: { colors: '#9ca3af' },
            formatter: function (val) {
                return 'UGX ' + Math.round(val).toLocaleString();
            }
        }
    },
    colors: ['#10b981'],
    fill: {
        type: 'gradient',
        gradient: {
            opacityFrom: 0.6,
            opacityTo: 0.1
        }
    },
    theme: { mode: document.documentElement.classList.contains('dark') ? 'dark' : 'light' }
});
revenueChart.render();

// Device Chart
const deviceData = @json($deviceStats);
const deviceChart = new ApexCharts(document.querySelector("#deviceChart"), {
    series: deviceData.map(d => d.impressions),
    chart: {
        type: 'donut',
        height: 350
    },
    labels: deviceData.map(d => d.device_type.charAt(0).toUpperCase() + d.device_type.slice(1)),
    colors: ['#3b82f6', '#10b981', '#f59e0b'],
    legend: {
        position: 'bottom',
        labels: { colors: '#9ca3af' }
    },
    dataLabels: {
        formatter: function (val) {
            return val.toFixed(1) + '%';
        }
    },
    theme: { mode: document.documentElement.classList.contains('dark') ? 'dark' : 'light' }
});
deviceChart.render();
</script>
@endpush
