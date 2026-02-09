@extends('frontend.layouts.artist')

@section('title', 'Business Dashboard')

@section('artist-content')
<div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h2 class="text-3xl font-bold text-white">Business Dashboard</h2>
            <p class="text-gray-400">Your financial overview and performance metrics</p>
        </div>
        <div class="flex gap-3">
            <a href="{{ route('artist.business.analytics') }}" class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                <span class="material-icons-round text-sm">insights</span>
                Detailed Analytics
            </a>
            <a href="{{ route('artist.business.payouts') }}" class="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                <span class="material-icons-round text-sm">payments</span>
                Payouts
            </a>
        </div>
    </div>

    <!-- Revenue Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white">
            <div class="flex items-center justify-between mb-4">
                <span class="text-sm font-medium opacity-90">Total Revenue</span>
                <span class="material-icons-round text-2xl opacity-75">attach_money</span>
            </div>
            <h3 class="text-3xl font-bold mb-1">UGX {{ number_format($totalRevenue ?? 0) }}</h3>
            <p class="text-sm opacity-75">All time earnings</p>
        </div>

        <div class="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
            <div class="flex items-center justify-between mb-4">
                <span class="text-sm font-medium opacity-90">This Month</span>
                <span class="material-icons-round text-2xl opacity-75">calendar_today</span>
            </div>
            <h3 class="text-3xl font-bold mb-1">UGX {{ number_format($monthlyRevenue ?? 0) }}</h3>
            <p class="text-sm opacity-75">{{ date('F Y') }}</p>
        </div>

        <div class="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white">
            <div class="flex items-center justify-between mb-4">
                <span class="text-sm font-medium opacity-90">Pending Payout</span>
                <span class="material-icons-round text-2xl opacity-75">pending</span>
            </div>
            <h3 class="text-3xl font-bold mb-1">UGX {{ number_format($pendingPayout ?? 0) }}</h3>
            <p class="text-sm opacity-75">Available to withdraw</p>
        </div>

        <div class="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-6 text-white">
            <div class="flex items-center justify-between mb-4">
                <span class="text-sm font-medium opacity-90">Total Streams</span>
                <span class="material-icons-round text-2xl opacity-75">play_circle</span>
            </div>
            <h3 class="text-3xl font-bold mb-1">{{ number_format($totalStreams ?? 0) }}</h3>
            <p class="text-sm opacity-75">Across all platforms</p>
        </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Revenue Trend -->
        <div class="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 class="text-xl font-semibold text-white mb-4">Revenue Trend (Last 6 Months)</h3>
            <div id="revenueTrendChart" class="h-64"></div>
        </div>

        <!-- Streams Trend -->
        <div class="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 class="text-xl font-semibold text-white mb-4">Stream Count (Last 6 Months)</h3>
            <div id="streamsTrendChart" class="h-64"></div>
        </div>
    </div>

    <!-- Top Performing Content -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top Songs -->
        <div class="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 class="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <span class="material-icons-round text-green-500">music_note</span>
                Top Earning Songs
            </h3>
            <div class="space-y-3">
                @forelse($topSongs ?? [] as $index => $song)
                <div class="flex items-center gap-4 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                    <span class="text-2xl font-bold text-gray-600">{{ $index + 1 }}</span>
                    <img src="{{ $song['artwork'] ?? asset('images/default-song-artwork.svg') }}" 
                         alt="{{ $song['title'] }}" 
                         class="w-12 h-12 rounded object-cover">
                    <div class="flex-1 min-w-0">
                        <p class="text-white font-medium truncate">{{ $song['title'] }}</p>
                        <p class="text-sm text-gray-400">{{ number_format($song['streams']) }} streams</p>
                    </div>
                    <div class="text-right">
                        <p class="text-green-500 font-semibold">UGX {{ number_format($song['revenue']) }}</p>
                    </div>
                </div>
                @empty
                <p class="text-gray-400 text-center py-8">No data available</p>
                @endforelse
            </div>
        </div>

        <!-- Platform Distribution -->
        <div class="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 class="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <span class="material-icons-round text-blue-500">devices</span>
                Revenue by Platform
            </h3>
            <div id="platformDistributionChart" class="h-64"></div>
        </div>
    </div>

    <!-- Recent Transactions -->
    <div class="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold text-white">Recent Transactions</h3>
            <a href="{{ route('artist.business.payouts') }}" class="text-green-500 hover:text-green-400 text-sm font-medium">
                View All →
            </a>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead>
                    <tr class="text-left border-b border-gray-700">
                        <th class="pb-3 text-gray-400 font-medium">Date</th>
                        <th class="pb-3 text-gray-400 font-medium">Description</th>
                        <th class="pb-3 text-gray-400 font-medium">Type</th>
                        <th class="pb-3 text-gray-400 font-medium text-right">Amount</th>
                        <th class="pb-3 text-gray-400 font-medium text-right">Status</th>
                    </tr>
                </thead>
                <tbody class="text-white">
                    @forelse($recentTransactions ?? [] as $transaction)
                    <tr class="border-b border-gray-750">
                        <td class="py-3">{{ $transaction['date'] }}</td>
                        <td class="py-3">{{ $transaction['description'] }}</td>
                        <td class="py-3">
                            <span class="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded">
                                {{ $transaction['type'] }}
                            </span>
                        </td>
                        <td class="py-3 text-right font-semibold">UGX {{ number_format($transaction['amount']) }}</td>
                        <td class="py-3 text-right">
                            <span class="px-2 py-1 rounded text-xs font-medium
                                @if($transaction['status'] === 'completed') bg-green-600/20 text-green-400
                                @elseif($transaction['status'] === 'pending') bg-yellow-600/20 text-yellow-400
                                @else bg-gray-600/20 text-gray-400 @endif">
                                {{ ucfirst($transaction['status']) }}
                            </span>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="5" class="text-center text-gray-400 py-8">No transactions yet</td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
<script>
// Revenue Trend Chart
const revenueOptions = {
    series: [{
        name: 'Revenue',
        data: @json($revenueChartData ?? [0,0,0,0,0,0])
    }],
    chart: {
        type: 'area',
        height: 256,
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
        categories: @json($revenueChartLabels ?? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']),
        labels: { style: { colors: '#9ca3af' } }
    },
    yaxis: { labels: { style: { colors: '#9ca3af' } } },
    grid: { borderColor: '#374151' },
    theme: { mode: 'dark' }
};
new ApexCharts(document.querySelector("#revenueTrendChart"), revenueOptions).render();

// Streams Trend Chart
const streamsOptions = {
    series: [{
        name: 'Streams',
        data: @json($streamsChartData ?? [0,0,0,0,0,0])
    }],
    chart: {
        type: 'bar',
        height: 256,
        background: 'transparent',
        toolbar: { show: false }
    },
    colors: ['#3b82f6'],
    xaxis: {
        categories: @json($streamsChartLabels ?? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']),
        labels: { style: { colors: '#9ca3af' } }
    },
    yaxis: { labels: { style: { colors: '#9ca3af' } } },
    grid: { borderColor: '#374151' },
    theme: { mode: 'dark' }
};
new ApexCharts(document.querySelector("#streamsTrendChart"), streamsOptions).render();

// Platform Distribution Chart
const platformOptions = {
    series: @json($platformChartData ?? [25, 25, 25, 25]),
    chart: {
        type: 'donut',
        height: 256,
        background: 'transparent'
    },
    labels: @json($platformChartLabels ?? ['Spotify', 'Apple Music', 'YouTube Music', 'Others']),
    colors: ['#1DB954', '#FC3C44', '#FF0000', '#9ca3af'],
    legend: {
        position: 'bottom',
        labels: { colors: '#9ca3af' }
    },
    theme: { mode: 'dark' }
};
new ApexCharts(document.querySelector("#platformDistributionChart"), platformOptions).render();
</script>
@endpush
@endsection
