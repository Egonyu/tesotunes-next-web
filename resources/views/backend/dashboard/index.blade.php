@extends('layouts.admin')

@section('title', 'Dashboard')

@section('content')

    <!-- Overview Stats Cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <!-- Total Users -->
        <div class="card px-4 pb-5 sm:px-5">
            <div class="flex items-center justify-between py-3">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">
                        Total Users
                    </p>
                    <div class="flex items-end space-x-2">
                        <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">
                            {{ number_format($stats['total_users']) }}
                        </p>
                        @if($growth['users']['direction'] === 'up')
                            <div class="flex items-center space-x-1 text-success">
                                <svg class="size-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L10 4.414 4.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                                </svg>
                                <span class="text-xs font-medium">{{ $growth['users']['percentage'] }}%</span>
                            </div>
                        @elseif($growth['users']['direction'] === 'down')
                            <div class="flex items-center space-x-1 text-error">
                                <svg class="size-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L10 15.586l5.293-5.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                </svg>
                                <span class="text-xs font-medium">{{ $growth['users']['percentage'] }}%</span>
                            </div>
                        @endif
                    </div>
                </div>
                <div class="mask is-squircle flex size-10 shrink-0 items-center justify-center bg-warning/10 text-warning">
                    <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197a4 4 0 11-3-6.18"></path>
                    </svg>
                </div>
            </div>
            <div class="ax-transparent-gridline">
                <div x-init="$nextTick(() => { $el._x_chart = new ApexCharts($el, {
                    chart: { type: 'area', height: 50, sparkline: { enabled: true } },
                    series: [{ data: [23, 45, 56, 78, 89, 90, {{ $growth['users']['value'] }}] }],
                    stroke: { curve: 'smooth', width: 2 },
                    fill: { type: 'gradient' },
                    colors: ['#f59e0b']
                }); $el._x_chart.render() })"></div>
            </div>
        </div>

        <!-- Active Subscriptions -->
        <div class="card px-4 pb-5 sm:px-5">
            <div class="flex items-center justify-between py-3">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">
                        Active Subscriptions
                    </p>
                    <div class="flex items-end space-x-2">
                        <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">
                            {{ number_format($stats['active_subscriptions']) }}
                        </p>
                        @if($growth['subscriptions']['direction'] === 'up')
                            <div class="flex items-center space-x-1 text-success">
                                <svg class="size-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L10 4.414 4.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                                </svg>
                                <span class="text-xs font-medium">{{ $growth['subscriptions']['percentage'] }}%</span>
                            </div>
                        @endif
                    </div>
                </div>
                <div class="mask is-squircle flex size-10 shrink-0 items-center justify-center bg-info/10 text-info">
                    <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                    </svg>
                </div>
            </div>
        </div>

        <!-- Monthly Revenue -->
        <div class="card px-4 pb-5 sm:px-5">
            <div class="flex items-center justify-between py-3">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">
                        Monthly Revenue
                    </p>
                    <div class="flex items-end space-x-2">
                        <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">
                            ${{ number_format($stats['total_revenue'] / 100, 2) }}
                        </p>
                        @if($growth['revenue']['direction'] === 'up')
                            <div class="flex items-center space-x-1 text-success">
                                <svg class="size-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L10 4.414 4.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                                </svg>
                                <span class="text-xs font-medium">{{ $growth['revenue']['percentage'] }}%</span>
                            </div>
                        @endif
                    </div>
                </div>
                <div class="mask is-squircle flex size-10 shrink-0 items-center justify-center bg-success/10 text-success">
                    <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                    </svg>
                </div>
            </div>
        </div>

        <!-- Monthly Plays -->
        <div class="card px-4 pb-5 sm:px-5">
            <div class="flex items-center justify-between py-3">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">
                        Monthly Plays
                    </p>
                    <div class="flex items-end space-x-2">
                        <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">
                            {{ number_format($stats['monthly_plays']) }}
                        </p>
                        @if($growth['plays']['direction'] === 'up')
                            <div class="flex items-center space-x-1 text-success">
                                <svg class="size-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L10 4.414 4.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                                </svg>
                                <span class="text-xs font-medium">{{ $growth['plays']['percentage'] }}%</span>
                            </div>
                        @endif
                    </div>
                </div>
                <div class="mask is-squircle flex size-10 shrink-0 items-center justify-center bg-secondary/10 text-secondary">
                    <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                    </svg>
                </div>
            </div>
        </div>
    </div>

    <!-- Charts Section -->
    <div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <!-- Revenue Chart -->
        <div class="card">
            <div class="flex items-center justify-between py-3 px-4">
                <h3 class="text-base font-medium text-slate-700 dark:text-navy-100">
                    Revenue Overview
                </h3>
                <div class="flex space-x-2">
                    <div class="flex items-center space-x-1">
                        <div class="size-2 rounded-full bg-primary"></div>
                        <span class="text-xs text-slate-400">Revenue</span>
                    </div>
                </div>
            </div>
            <div class="px-4 pb-4">
                <div id="revenueChart" class="h-80"></div>
            </div>
        </div>

        <!-- User Growth Chart -->
        <div class="card">
            <div class="flex items-center justify-between py-3 px-4">
                <h3 class="text-base font-medium text-slate-700 dark:text-navy-100">
                    User Growth
                </h3>
                <div class="flex space-x-2">
                    <div class="flex items-center space-x-1">
                        <div class="size-2 rounded-full bg-warning"></div>
                        <span class="text-xs text-slate-400">New Users</span>
                    </div>
                </div>
            </div>
            <div class="px-4 pb-4">
                <div id="userGrowthChart" class="h-80"></div>
            </div>
        </div>
    </div>

    <!-- Recent Activity & Content -->
    <div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Recent Users -->
        <div class="card">
            <div class="flex items-center justify-between p-4">
                <h3 class="text-base font-medium text-slate-700 dark:text-navy-100">Recent Users</h3>
                <a href="{{ route('admin.users.index') }}" class="text-xs+ text-primary hover:text-primary-focus">View All</a>
            </div>
            <div class="space-y-3 px-4 pb-4">
                @foreach($recentUsers as $user)
                    <div class="flex items-center space-x-3">
                        <div class="avatar size-8">
                            <img class="rounded-full" src="{{ $user->avatar ? Storage::url($user->avatar) : asset('images/200x200.png') }}" alt="{{ $user->name }}" />
                        </div>
                        <div class="flex-1">
                            <p class="text-sm font-medium text-slate-700 dark:text-navy-100">{{ $user->name }}</p>
                            <p class="text-xs text-slate-400">{{ $user->created_at->diffForHumans() }}</p>
                        </div>
                        <div class="flex items-center">
                            @if($user->subscription)
                                <span class="badge bg-success/10 text-success">Premium</span>
                            @else
                                <span class="badge bg-slate-150 text-slate-800 dark:bg-navy-500 dark:text-navy-100">Free</span>
                            @endif
                        </div>
                    </div>
                @endforeach
            </div>
        </div>

        <!-- Top Songs -->
        <div class="card">
            <div class="flex items-center justify-between p-4">
                <h3 class="text-base font-medium text-slate-700 dark:text-navy-100">Top Songs</h3>
                <a href="{{ route('backend.music.songs.index') }}" class="text-xs+ text-primary hover:text-primary-focus">View All</a>
            </div>
            <div class="space-y-3 px-4 pb-4">
                @foreach($topSongs->take(5) as $song)
                    <div class="flex items-center space-x-3">
                        <div class="mask is-squircle size-8 bg-slate-200 dark:bg-navy-500">
                            @if($song->cover_image)
                                <img src="{{ Storage::url($song->cover_image) }}" alt="{{ $song->title }}" class="size-full object-cover" />
                            @else
                                <div class="flex size-full items-center justify-center text-slate-400">
                                    <svg class="size-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"/>
                                    </svg>
                                </div>
                            @endif
                        </div>
                        <div class="flex-1">
                            <p class="text-sm font-medium text-slate-700 dark:text-navy-100">{{ $song->title }}</p>
                            <p class="text-xs text-slate-400">{{ $song->artist->name }}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-xs font-medium text-slate-700 dark:text-navy-100">{{ number_format($song->play_count) }}</p>
                            <p class="text-xs text-slate-400">plays</p>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>

        <!-- Recent Payments -->
        <div class="card">
            <div class="flex items-center justify-between p-4">
                <h3 class="text-base font-medium text-slate-700 dark:text-navy-100">Recent Payments</h3>
                <a href="{{ route('backend.payments.index') }}" class="text-xs+ text-primary hover:text-primary-focus">View All</a>
            </div>
            <div class="space-y-3 px-4 pb-4">
                @foreach($recentPayments->take(5) as $payment)
                    <div class="flex items-center space-x-3">
                        <div class="mask is-squircle flex size-8 items-center justify-center {{ $payment->status === 'completed' ? 'bg-success/10 text-success' : ($payment->status === 'pending' ? 'bg-warning/10 text-warning' : 'bg-error/10 text-error') }}">
                            <svg class="size-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"/>
                            </svg>
                        </div>
                        <div class="flex-1">
                            <p class="text-sm font-medium text-slate-700 dark:text-navy-100">{{ $payment->user->name }}</p>
                            <p class="text-xs text-slate-400">{{ $payment->payment_method }}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-xs font-medium text-slate-700 dark:text-navy-100">{{ $payment->currency }} {{ number_format($payment->amount) }}</p>
                            <p class="text-xs text-slate-400">{{ $payment->created_at->format('M j') }}</p>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>
    </div>

    <x-slot name="script">
        <script>
            // Revenue Chart
            const revenueChart = new Chart(document.getElementById('revenueChart'), {
                type: 'line',
                data: {
                    labels: @json($revenueData->pluck('month')),
                    datasets: [{
                        label: 'Revenue',
                        data: @json($revenueData->pluck('total')),
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '$' + value.toLocaleString();
                                }
                            }
                        }
                    }
                }
            });

            // User Growth Chart
            const userChart = new Chart(document.getElementById('userGrowthChart'), {
                type: 'bar',
                data: {
                    labels: @json($userGrowthData->pluck('month')),
                    datasets: [{
                        label: 'New Users',
                        data: @json($userGrowthData->pluck('total')),
                        backgroundColor: 'rgba(245, 158, 11, 0.8)',
                        borderColor: 'rgb(245, 158, 11)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        </script>
    </x-slot>
@endsection