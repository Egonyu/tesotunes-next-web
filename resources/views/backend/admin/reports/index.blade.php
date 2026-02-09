@extends('layouts.admin')

@section('title', 'Reports & Analytics')

@section('content')
<div class="dashboard-content">
    <!-- Page Header -->
    <div class="mb-8">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">Reports & Analytics</h1>
                <p class="text-slate-600 dark:text-navy-300">Platform insights and performance metrics</p>
            </div>
            <div class="flex gap-2">
                <button class="btn bg-secondary text-white hover:bg-secondary-focus">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export Report
                </button>
            </div>
        </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="admin-card">
            <div class="flex items-center gap-4">
                <div class="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
                <div>
                    <div class="text-2xl font-bold text-slate-800 dark:text-navy-50">{{ $totalUsers ?? '0' }}</div>
                    <div class="text-sm text-slate-600 dark:text-navy-300">Total Users</div>
                </div>
            </div>
        </div>

        <div class="admin-card">
            <div class="flex items-center gap-4">
                <div class="flex size-12 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                </div>
                <div>
                    <div class="text-2xl font-bold text-slate-800 dark:text-navy-50">{{ $totalSongs ?? '0' }}</div>
                    <div class="text-sm text-slate-600 dark:text-navy-300">Total Songs</div>
                </div>
            </div>
        </div>

        <div class="admin-card">
            <div class="flex items-center gap-4">
                <div class="flex size-12 items-center justify-center rounded-lg bg-success/10 text-success">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a1.5 1.5 0 000-3H9c-.621 0-1.125.504-1.125 1.125v0c0 .621.504 1.125 1.125 1.125z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM8.5 15.5h.01" />
                    </svg>
                </div>
                <div>
                    <div class="text-2xl font-bold text-slate-800 dark:text-navy-50">{{ $totalArtists ?? '0' }}</div>
                    <div class="text-sm text-slate-600 dark:text-navy-300">Total Artists</div>
                </div>
            </div>
        </div>

        <div class="admin-card">
            <div class="flex items-center gap-4">
                <div class="flex size-12 items-center justify-center rounded-lg bg-warning/10 text-warning">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                </div>
                <div>
                    <div class="text-2xl font-bold text-slate-800 dark:text-navy-50">{{ number_format($totalPlays ?? 0) }}</div>
                    <div class="text-sm text-slate-600 dark:text-navy-300">Total Plays</div>
                </div>
            </div>
        </div>
    </div>

    <!-- Report Categories -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- User Analytics -->
        <div class="admin-card">
            <div class="flex items-center gap-3 mb-4">
                <div class="flex size-8 items-center justify-center rounded bg-primary/10 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
                <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50">User Analytics</h3>
            </div>

            <div class="space-y-3">
                <a href="#" class="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-navy-600 transition-colors">
                    <div>
                        <div class="font-medium text-slate-800 dark:text-navy-50">User Registration Report</div>
                        <div class="text-sm text-slate-600 dark:text-navy-300">New user signups and trends</div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                </a>

                <a href="#" class="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-navy-600 transition-colors">
                    <div>
                        <div class="font-medium text-slate-800 dark:text-navy-50">User Activity Report</div>
                        <div class="text-sm text-slate-600 dark:text-navy-300">Login patterns and engagement</div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                </a>

                <a href="#" class="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-navy-600 transition-colors">
                    <div>
                        <div class="font-medium text-slate-800 dark:text-navy-50">Credit Usage Report</div>
                        <div class="text-sm text-slate-600 dark:text-navy-300">Credits earned and spent</div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                </a>
            </div>
        </div>

        <!-- Content Analytics -->
        <div class="admin-card">
            <div class="flex items-center gap-3 mb-4">
                <div class="flex size-8 items-center justify-center rounded bg-secondary/10 text-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                </div>
                <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50">Content Analytics</h3>
            </div>

            <div class="space-y-3">
                <a href="#" class="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-navy-600 transition-colors">
                    <div>
                        <div class="font-medium text-slate-800 dark:text-navy-50">Song Performance Report</div>
                        <div class="text-sm text-slate-600 dark:text-navy-300">Most played songs and trends</div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                </a>

                <a href="#" class="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-navy-600 transition-colors">
                    <div>
                        <div class="font-medium text-slate-800 dark:text-navy-50">Artist Analytics</div>
                        <div class="text-sm text-slate-600 dark:text-navy-300">Artist popularity and engagement</div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                </a>

                <a href="#" class="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-navy-600 transition-colors">
                    <div>
                        <div class="font-medium text-slate-800 dark:text-navy-50">Upload Statistics</div>
                        <div class="text-sm text-slate-600 dark:text-navy-300">Content upload trends</div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                </a>
            </div>
        </div>

        <!-- Revenue Analytics -->
        <div class="admin-card">
            <div class="flex items-center gap-3 mb-4">
                <div class="flex size-8 items-center justify-center rounded bg-success/10 text-success">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                </div>
                <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50">Revenue Analytics</h3>
            </div>

            <div class="space-y-3">
                <a href="#" class="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-navy-600 transition-colors">
                    <div>
                        <div class="font-medium text-slate-800 dark:text-navy-50">Revenue Report</div>
                        <div class="text-sm text-slate-600 dark:text-navy-300">Platform revenue and trends</div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                </a>

                <a href="#" class="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-navy-600 transition-colors">
                    <div>
                        <div class="font-medium text-slate-800 dark:text-navy-50">Artist Payouts</div>
                        <div class="text-sm text-slate-600 dark:text-navy-300">Artist earnings and payments</div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                </a>

                <a href="#" class="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-navy-600 transition-colors">
                    <div>
                        <div class="font-medium text-slate-800 dark:text-navy-50">Transaction Report</div>
                        <div class="text-sm text-slate-600 dark:text-navy-300">All financial transactions</div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                </a>
            </div>
        </div>

        <!-- Platform Analytics -->
        <div class="admin-card">
            <div class="flex items-center gap-3 mb-4">
                <div class="flex size-8 items-center justify-center rounded bg-info/10 text-info">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50">Platform Analytics</h3>
            </div>

            <div class="space-y-3">
                <a href="#" class="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-navy-600 transition-colors">
                    <div>
                        <div class="font-medium text-slate-800 dark:text-navy-50">Performance Report</div>
                        <div class="text-sm text-slate-600 dark:text-navy-300">Platform performance metrics</div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                </a>

                <a href="#" class="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-navy-600 transition-colors">
                    <div>
                        <div class="font-medium text-slate-800 dark:text-navy-50">Error Log Report</div>
                        <div class="text-sm text-slate-600 dark:text-navy-300">System errors and issues</div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                </a>

                <a href="#" class="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-navy-600 transition-colors">
                    <div>
                        <div class="font-medium text-slate-800 dark:text-navy-50">Storage Report</div>
                        <div class="text-sm text-slate-600 dark:text-navy-300">Storage usage and optimization</div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                </a>
            </div>
        </div>
    </div>
</div>
@endsection