@extends('frontend.layouts.artist')

@section('title', 'Analytics')

@section('artist-content')
<div class="p-6 space-y-6">
    <!-- Header with Date Range Filter -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h2 class="text-3xl font-bold text-white">Detailed Analytics</h2>
            <p class="text-gray-400">Deep dive into your performance metrics</p>
        </div>
        <div class="flex gap-3">
            <select class="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none">
                <option value="7">Last 7 Days</option>
                <option value="30" selected>Last 30 Days</option>
                <option value="90">Last 90 Days</option>
                <option value="365">Last Year</option>
                <option value="all">All Time</option>
            </select>
            <a href="{{ route('artist.business.dashboard') }}" class="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                <span class="material-icons-round text-sm">dashboard</span>
                Dashboard
            </a>
        </div>
    </div>

    <!-- Key Metrics Grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <p class="text-gray-400 text-sm mb-1">Total Plays</p>
            <p class="text-white text-2xl font-bold">{{ number_format($stats['total_plays'] ?? 0) }}</p>
            <p class="text-green-500 text-xs mt-1">+12% vs last period</p>
        </div>
        <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <p class="text-gray-400 text-sm mb-1">Unique Listeners</p>
            <p class="text-white text-2xl font-bold">{{ number_format($stats['unique_listeners'] ?? 0) }}</p>
            <p class="text-green-500 text-xs mt-1">+8% vs last period</p>
        </div>
        <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <p class="text-gray-400 text-sm mb-1">Avg. Listen Time</p>
            <p class="text-white text-2xl font-bold">{{ $stats['avg_listen_time'] ?? '0:00' }}</p>
            <p class="text-green-500 text-xs mt-1">+5% vs last period</p>
        </div>
        <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <p class="text-gray-400 text-sm mb-1">Completion Rate</p>
            <p class="text-white text-2xl font-bold">{{ $stats['completion_rate'] ?? 0 }}%</p>
            <p class="text-green-500 text-xs mt-1">+3% vs last period</p>
        </div>
        <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <p class="text-gray-400 text-sm mb-1">Downloads</p>
            <p class="text-white text-2xl font-bold">{{ number_format($stats['downloads'] ?? 0) }}</p>
            <p class="text-red-500 text-xs mt-1">-2% vs last period</p>
        </div>
        <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <p class="text-gray-400 text-sm mb-1">Likes</p>
            <p class="text-white text-2xl font-bold">{{ number_format($stats['likes'] ?? 0) }}</p>
            <p class="text-green-500 text-xs mt-1">+15% vs last period</p>
        </div>
    </div>

    <!-- Engagement Metrics -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 class="text-xl font-semibold text-white mb-4">Play Activity (Last 30 Days)</h3>
            <div id="playActivityChart" class="h-80"></div>
        </div>
        <div class="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 class="text-xl font-semibold text-white mb-4">Listener Demographics</h3>
            <div id="demographicsChart" class="h-80"></div>
        </div>
    </div>

    <!-- Song Performance Table -->
    <div class="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h3 class="text-xl font-semibold text-white mb-4">Song Performance</h3>
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead>
                    <tr class="text-left border-b border-gray-700">
                        <th class="pb-3 text-gray-400 font-medium">Song</th>
                        <th class="pb-3 text-gray-400 font-medium text-right">Plays</th>
                        <th class="pb-3 text-gray-400 font-medium text-right">Listeners</th>
                        <th class="pb-3 text-gray-400 font-medium text-right">Completion %</th>
                        <th class="pb-3 text-gray-400 font-medium text-right">Avg. Listen Time</th>
                        <th class="pb-3 text-gray-400 font-medium text-right">Revenue</th>
                    </tr>
                </thead>
                <tbody class="text-white">
                    @forelse($songPerformance ?? [] as $song)
                    <tr class="border-b border-gray-700 hover:bg-gray-700 transition-colors">
                        <td class="py-3">
                            <div class="flex items-center gap-3">
                                <img src="{{ $song['artwork'] }}" alt="{{ $song['title'] }}" class="w-10 h-10 rounded object-cover">
                                <div>
                                    <p class="font-medium">{{ $song['title'] }}</p>
                                    <p class="text-sm text-gray-400">{{ $song['album'] ?? 'Single' }}</p>
                                </div>
                            </div>
                        </td>
                        <td class="py-3 text-right">{{ number_format($song['plays']) }}</td>
                        <td class="py-3 text-right">{{ number_format($song['listeners']) }}</td>
                        <td class="py-3 text-right">
                            <span class="px-2 py-1 rounded text-xs font-medium
                                @if($song['completion_rate'] >= 80) bg-green-600/20 text-green-400
                                @elseif($song['completion_rate'] >= 50) bg-yellow-600/20 text-yellow-400
                                @else bg-red-600/20 text-red-400 @endif">
                                {{ $song['completion_rate'] }}%
                            </span>
                        </td>
                        <td class="py-3 text-right">{{ $song['avg_listen_time'] }}</td>
                        <td class="py-3 text-right font-semibold text-green-500">UGX {{ number_format($song['revenue']) }}</td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="6" class="text-center text-gray-400 py-8">No data available</td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    <!-- Geographic & Platform Distribution -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 class="text-xl font-semibold text-white mb-4">Top Countries</h3>
            <div class="space-y-3">
                @foreach($topCountries ?? [] as $country)
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <span class="text-2xl">{{ $country['flag'] }}</span>
                        <span class="text-white">{{ $country['name'] }}</span>
                    </div>
                    <div class="flex items-center gap-4">
                        <span class="text-gray-400">{{ number_format($country['plays']) }} plays</span>
                        <div class="w-32 bg-gray-700 rounded-full h-2">
                            <div class="bg-green-500 h-2 rounded-full" style="width: {{ $country['percentage'] }}%"></div>
                        </div>
                        <span class="text-white font-semibold w-12 text-right">{{ $country['percentage'] }}%</span>
                    </div>
                </div>
                @endforeach
            </div>
        </div>

        <div class="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 class="text-xl font-semibold text-white mb-4">Platform Breakdown</h3>
            <div class="space-y-3">
                @foreach($platformBreakdown ?? [] as $platform)
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <span class="material-icons-round text-2xl" style="color: {{ $platform['color'] }}">{{ $platform['icon'] }}</span>
                        <span class="text-white">{{ $platform['name'] }}</span>
                    </div>
                    <div class="flex items-center gap-4">
                        <span class="text-gray-400">{{ number_format($platform['plays']) }} plays</span>
                        <div class="w-32 bg-gray-700 rounded-full h-2">
                            <div class="h-2 rounded-full" style="background-color: {{ $platform['color'] }}; width: {{ $platform['percentage'] }}%"></div>
                        </div>
                        <span class="text-white font-semibold w-12 text-right">{{ $platform['percentage'] }}%</span>
                    </div>
                </div>
                @endforeach
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
<script>
// Play Activity Chart
const playActivityOptions = {
    series: [{
        name: 'Plays',
        data: @json($playActivityData ?? array_fill(0, 30, 0))
    }],
    chart: {
        type: 'area',
        height: 320,
        background: 'transparent',
        toolbar: { show: false }
    },
    colors: ['#10b981'],
    stroke: { curve: 'smooth', width: 2 },
    fill: {
        type: 'gradient',
        gradient: { opacityFrom: 0.6, opacityTo: 0.1 }
    },
    xaxis: {
        categories: @json($playActivityLabels ?? array_map(fn($i) => date('M j', strtotime("-$i days")), range(29, 0))),
        labels: { style: { colors: '#9ca3af' } }
    },
    yaxis: { labels: { style: { colors: '#9ca3af' } } },
    grid: { borderColor: '#374151' },
    theme: { mode: 'dark' },
    dataLabels: { enabled: false }
};
new ApexCharts(document.querySelector("#playActivityChart"), playActivityOptions).render();

// Demographics Chart
const demographicsOptions = {
    series: @json($demographicsData ?? [30, 25, 20, 15, 10]),
    chart: {
        type: 'donut',
        height: 320,
        background: 'transparent'
    },
    labels: @json($demographicsLabels ?? ['18-24', '25-34', '35-44', '45-54', '55+']),
    colors: ['#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b'],
    legend: {
        position: 'bottom',
        labels: { colors: '#9ca3af' }
    },
    theme: { mode: 'dark' }
};
new ApexCharts(document.querySelector("#demographicsChart"), demographicsOptions).render();
</script>
@endpush
@endsection
