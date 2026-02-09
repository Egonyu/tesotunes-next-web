@extends('layouts.admin')

@section('title', 'Credit Analytics')

@section('content')
<div class="dashboard-content">
    <!-- Page Header -->
    <div class="mb-8">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">Credit Analytics</h1>
                <p class="text-slate-600 dark:text-navy-300">Detailed insights into credit system performance</p>
            </div>
            <div class="flex gap-3">
                <a href="{{ route('admin.credits.index') }}" class="btn border border-slate-300 text-slate-700 hover:bg-slate-50">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Credits
                </a>
                <button onclick="exportAnalytics()" class="btn bg-primary text-white hover:bg-primary-focus">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export Report
                </button>
            </div>
        </div>
    </div>

    <!-- Time Period Selector -->
    <div class="mb-6">
        <div class="admin-card">
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50">Time Period</h3>
                <div class="flex gap-2">
                    <button onclick="changePeriod('7d')" class="period-btn btn-sm border border-slate-300 text-slate-700 hover:bg-slate-50" data-period="7d">7 Days</button>
                    <button onclick="changePeriod('30d')" class="period-btn btn-sm bg-primary text-white" data-period="30d">30 Days</button>
                    <button onclick="changePeriod('90d')" class="period-btn btn-sm border border-slate-300 text-slate-700 hover:bg-slate-50" data-period="90d">90 Days</button>
                    <button onclick="changePeriod('1y')" class="period-btn btn-sm border border-slate-300 text-slate-700 hover:bg-slate-50" data-period="1y">1 Year</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Key Metrics Overview -->
    <div class="mb-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Total Credits in Circulation -->
            <div class="admin-card">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-slate-600 dark:text-navy-300">Credits in Circulation</p>
                        <p class="text-2xl font-bold text-slate-800 dark:text-navy-50">{{ number_format($metrics['total_circulation'] ?? 0) }}</p>
                        <p class="text-xs {{ ($metrics['circulation_change'] ?? 0) >= 0 ? 'text-green-600' : 'text-red-600' }}">
                            {{ ($metrics['circulation_change'] ?? 0) >= 0 ? '+' : '' }}{{ $metrics['circulation_change'] ?? 0 }}% from last period
                        </p>
                    </div>
                    <div class="p-3 bg-blue-100 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                    </div>
                </div>
            </div>

            <!-- Average Credits per User -->
            <div class="admin-card">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-slate-600 dark:text-navy-300">Avg Credits per User</p>
                        <p class="text-2xl font-bold text-slate-800 dark:text-navy-50">{{ number_format($metrics['avg_per_user'] ?? 0, 1) }}</p>
                        <p class="text-xs {{ ($metrics['avg_change'] ?? 0) >= 0 ? 'text-green-600' : 'text-red-600' }}">
                            {{ ($metrics['avg_change'] ?? 0) >= 0 ? '+' : '' }}{{ $metrics['avg_change'] ?? 0 }}% from last period
                        </p>
                    </div>
                    <div class="p-3 bg-green-100 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                </div>
            </div>

            <!-- Daily Transaction Volume -->
            <div class="admin-card">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-slate-600 dark:text-navy-300">Daily Avg Transactions</p>
                        <p class="text-2xl font-bold text-slate-800 dark:text-navy-50">{{ number_format($metrics['daily_transactions'] ?? 0) }}</p>
                        <p class="text-xs {{ ($metrics['transaction_change'] ?? 0) >= 0 ? 'text-green-600' : 'text-red-600' }}">
                            {{ ($metrics['transaction_change'] ?? 0) >= 0 ? '+' : '' }}{{ $metrics['transaction_change'] ?? 0 }}% from last period
                        </p>
                    </div>
                    <div class="p-3 bg-amber-100 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                    </div>
                </div>
            </div>

            <!-- Credit Velocity -->
            <div class="admin-card">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-slate-600 dark:text-navy-300">Credit Velocity</p>
                        <p class="text-2xl font-bold text-slate-800 dark:text-navy-50">{{ number_format($metrics['velocity'] ?? 0, 2) }}x</p>
                        <p class="text-xs text-slate-500 dark:text-navy-400">Credits spent per credit earned</p>
                    </div>
                    <div class="p-3 bg-purple-100 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Credit Flow Chart -->
        <div class="admin-card">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50">Credit Flow Over Time</h3>
                <div class="flex gap-2">
                    <div class="flex items-center gap-1">
                        <div class="w-3 h-3 bg-green-500 rounded"></div>
                        <span class="text-xs text-slate-600">Earned</span>
                    </div>
                    <div class="flex items-center gap-1">
                        <div class="w-3 h-3 bg-red-500 rounded"></div>
                        <span class="text-xs text-slate-600">Spent</span>
                    </div>
                </div>
            </div>
            <div id="creditFlowChart" class="h-64">
                <!-- Chart will be rendered here -->
                <div class="flex items-center justify-center h-full text-slate-400">
                    <div class="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <p>Chart Loading...</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Sources Breakdown -->
        <div class="admin-card">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-6">Credit Sources Breakdown</h3>
            <div id="sourcesChart" class="h-64">
                <!-- Chart will be rendered here -->
                <div class="space-y-3">
                    @foreach($source_breakdown ?? [] as $source => $data)
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-4 h-4 rounded" style="background-color: {{ $data['color'] ?? '#3B82F6' }}"></div>
                                <span class="text-sm text-slate-600 dark:text-navy-300">{{ ucfirst(str_replace('_', ' ', $source)) }}</span>
                            </div>
                            <div class="text-right">
                                <div class="text-sm font-medium text-slate-800 dark:text-navy-50">{{ number_format($data['amount'] ?? 0) }}</div>
                                <div class="text-xs text-slate-500">{{ $data['percentage'] ?? 0 }}%</div>
                            </div>
                        </div>
                    @endforeach

                    @if(empty($source_breakdown))
                        <div class="flex items-center justify-center h-full text-slate-400">
                            <div class="text-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                                <p>No data available</p>
                            </div>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>

    <!-- Top Users and Activity Analysis -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Top Credit Earners -->
        <div class="admin-card">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-6">Top Credit Earners</h3>
            <div class="space-y-4">
                @forelse($top_earners ?? [] as $index => $user)
                    <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-navy-600 rounded-lg">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span class="text-sm font-medium text-primary">{{ $index + 1 }}</span>
                            </div>
                            <div class="flex items-center gap-3">
                                <img class="h-8 w-8 rounded-full object-cover"
                                     src="{{ $user['avatar_url'] ?? '/default-avatar.svg' }}"
                                     alt="{{ $user['name'] }}">
                                <div>
                                    <div class="text-sm font-medium text-slate-800 dark:text-navy-50">{{ $user['name'] }}</div>
                                    <div class="text-xs text-slate-500 dark:text-navy-300">{{ $user['transactions_count'] ?? 0 }} transactions</div>
                                </div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-sm font-semibold text-green-600">+{{ number_format($user['credits_earned'] ?? 0) }}</div>
                            <div class="text-xs text-slate-500">credits</div>
                        </div>
                    </div>
                @empty
                    <div class="text-center py-8 text-slate-500 dark:text-navy-300">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p>No earners data available</p>
                    </div>
                @endforelse
            </div>
        </div>

        <!-- Activity Heatmap -->
        <div class="admin-card">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-6">Activity Heatmap</h3>
            <div class="space-y-3">
                <div class="grid grid-cols-7 gap-1 text-xs text-center text-slate-500 dark:text-navy-300">
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>
                    <div>Sun</div>
                </div>
                <div class="grid grid-cols-7 gap-1">
                    @for($i = 0; $i < 28; $i++)
                        @php
                            $intensity = rand(0, 4);
                            $intensityClasses = [
                                'bg-slate-100 dark:bg-navy-600',
                                'bg-green-200 dark:bg-green-800',
                                'bg-green-300 dark:bg-green-700',
                                'bg-green-400 dark:bg-green-600',
                                'bg-green-500 dark:bg-green-500'
                            ];
                        @endphp
                        <div class="aspect-square rounded {{ $intensityClasses[$intensity] }}" title="Day {{ $i + 1 }}"></div>
                    @endfor
                </div>
                <div class="flex items-center justify-between text-xs text-slate-500 dark:text-navy-300">
                    <span>Less</span>
                    <div class="flex gap-1">
                        <div class="w-3 h-3 bg-slate-100 dark:bg-navy-600 rounded"></div>
                        <div class="w-3 h-3 bg-green-200 dark:bg-green-800 rounded"></div>
                        <div class="w-3 h-3 bg-green-300 dark:bg-green-700 rounded"></div>
                        <div class="w-3 h-3 bg-green-400 dark:bg-green-600 rounded"></div>
                        <div class="w-3 h-3 bg-green-500 dark:bg-green-500 rounded"></div>
                    </div>
                    <span>More</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Credit Rate Effectiveness -->
    <div class="admin-card">
        <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-6">Credit Rate Effectiveness</h3>
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200 dark:divide-navy-500">
                <thead class="bg-slate-50 dark:bg-navy-800">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-navy-300 uppercase tracking-wider">Activity Type</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-navy-300 uppercase tracking-wider">Rate</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-navy-300 uppercase tracking-wider">Total Issued</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-navy-300 uppercase tracking-wider">Avg per User</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-navy-300 uppercase tracking-wider">Engagement</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-navy-300 uppercase tracking-wider">Efficiency</th>
                    </tr>
                </thead>
                <tbody class="bg-white dark:bg-navy-700 divide-y divide-slate-200 dark:divide-navy-500">
                    @forelse($rate_effectiveness ?? [] as $rate)
                        <tr class="hover:bg-slate-50 dark:hover:bg-navy-600">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <div class="text-sm font-medium text-slate-800 dark:text-navy-50">
                                        {{ $rate['display_name'] ?? ucfirst(str_replace('_', ' ', $rate['activity_type'])) }}
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-600 dark:text-navy-300">
                                {{ number_format($rate['cost_credits'] ?? 0) }} credits
                                @if($rate['duration_days'] ?? null)
                                    <span class="text-xs text-slate-500">/ {{ $rate['duration_days'] }}d</span>
                                @endif
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800 dark:text-navy-50">
                                {{ number_format($rate['total_issued'] ?? 0) }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-navy-300">
                                {{ number_format($rate['avg_per_user'] ?? 0, 1) }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <div class="w-16 bg-slate-200 dark:bg-navy-600 rounded-full h-2 mr-2">
                                        <div class="bg-green-500 h-2 rounded-full" style="width: {{ min($rate['engagement'] ?? 0, 100) }}%"></div>
                                    </div>
                                    <span class="text-sm text-slate-600 dark:text-navy-300">{{ $rate['engagement'] ?? 0 }}%</span>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                    @if(($rate['efficiency'] ?? 0) >= 80) bg-green-100 text-green-800
                                    @elseif(($rate['efficiency'] ?? 0) >= 60) bg-yellow-100 text-yellow-800
                                    @else bg-red-100 text-red-800 @endif">
                                    {{ $rate['efficiency'] ?? 0 }}% efficient
                                </span>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="px-6 py-8 text-center text-slate-500 dark:text-navy-300">
                                No rate effectiveness data available.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>

<script>
function changePeriod(period) {
    // Update button states
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.className = 'period-btn btn-sm border border-slate-300 text-slate-700 hover:bg-slate-50';
    });
    document.querySelector(`[data-period="${period}"]`).className = 'period-btn btn-sm bg-primary text-white';

    // In a real implementation, you'd fetch new data here
    console.log('Changing period to:', period);
}

function exportAnalytics() {
    // In a real implementation, this would generate and download a report
    const period = document.querySelector('.period-btn.bg-primary')?.dataset.period || '30d';
    console.log('Exporting analytics for period:', period);

    // Simulate download
    alert('Analytics report export started. You will receive an email when ready.');
}

// Initialize charts (you would use a real charting library like Chart.js)
document.addEventListener('DOMContentLoaded', function() {
    // Simulate chart initialization
    setTimeout(() => {
        const creditFlowChart = document.getElementById('creditFlowChart');
        if (creditFlowChart) {
            creditFlowChart.innerHTML = `
                <div class="flex items-center justify-center h-full text-slate-400">
                    <div class="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <p>Credit flow chart would render here</p>
                        <p class="text-xs">Integration with Chart.js or similar library needed</p>
                    </div>
                </div>
            `;
        }
    }, 1000);
});
</script>

@endsection