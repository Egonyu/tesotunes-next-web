@extends('layouts.admin')

@section('title', 'Performance Dashboard')

@section('content')
<div class="container-fluid px-4 py-6">
    <!-- Header -->
    <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Performance Dashboard
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
            Monitor and optimize application performance
        </p>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <button onclick="warmCaches()" class="btn btn-primary">
            <i class="fas fa-fire mr-2"></i>
            Warm Caches
        </button>
        <button onclick="clearCaches()" class="btn btn-warning">
            <i class="fas fa-broom mr-2"></i>
            Clear Caches
        </button>
        <button onclick="optimizeTables()" class="btn btn-success">
            <i class="fas fa-database mr-2"></i>
            Optimize DB
        </button>
        <button onclick="runGarbageCollection()" class="btn btn-info">
            <i class="fas fa-trash-alt mr-2"></i>
            Run GC
        </button>
    </div>

    <!-- System Health Status -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <!-- Database Health -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    Database
                </h3>
                <span id="db-status" class="health-indicator"></span>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
                <div class="mb-2">
                    <strong>Driver:</strong> {{ $dbStats['driver'] ?? 'N/A' }}
                </div>
                <div>
                    <strong>Database:</strong> {{ $dbStats['database'] ?? 'N/A' }}
                </div>
            </div>
        </div>

        <!-- Cache Health -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    Cache
                </h3>
                <span id="cache-status" class="health-indicator"></span>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
                <div class="mb-2">
                    <strong>Driver:</strong> {{ $cacheStats['cache_driver'] ?? 'N/A' }}
                </div>
                <div>
                    <strong>Tags:</strong> {{ $cacheStats['tags_support'] ? 'Supported' : 'Not Supported' }}
                </div>
            </div>
        </div>

        <!-- Queue Health -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    Queue
                </h3>
                <span id="queue-status" class="health-indicator"></span>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
                <div class="mb-2">
                    <strong>Driver:</strong> {{ config('queue.default') }}
                </div>
                <div id="failed-jobs-count">
                    <strong>Failed:</strong> Loading...
                </div>
            </div>
        </div>

        <!-- Storage Health -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    Storage
                </h3>
                <span id="storage-status" class="health-indicator"></span>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
                <div class="mb-2">
                    <strong>Driver:</strong> {{ config('filesystems.default') }}
                </div>
            </div>
        </div>
    </div>

    <!-- Performance Metrics -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Memory Usage -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Memory Usage
            </h3>
            <div class="space-y-4">
                <div>
                    <div class="flex justify-between text-sm mb-2">
                        <span class="text-gray-600 dark:text-gray-400">Current</span>
                        <span id="memory-current" class="font-semibold">
                            {{ $memoryReport['current_mb'] ?? 0 }} MB
                        </span>
                    </div>
                    <div class="progress-bar">
                        <div id="memory-current-bar" class="progress-bar-fill bg-blue-500" style="width: {{ $memoryReport['usage_percent'] ?? 0 }}%"></div>
                    </div>
                </div>
                <div>
                    <div class="flex justify-between text-sm mb-2">
                        <span class="text-gray-600 dark:text-gray-400">Peak</span>
                        <span id="memory-peak" class="font-semibold">
                            {{ $memoryReport['peak_mb'] ?? 0 }} MB
                        </span>
                    </div>
                </div>
                <div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600 dark:text-gray-400">Limit</span>
                        <span id="memory-limit" class="font-semibold">
                            {{ $memoryReport['limit_mb'] ?? 'Unlimited' }} MB
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Feed Performance -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Feed Performance
            </h3>
            <div class="space-y-4">
                <div class="flex justify-between text-sm">
                    <span class="text-gray-600 dark:text-gray-400">Total Activities</span>
                    <span class="font-semibold">{{ number_format($feedStats['total_activities'] ?? 0) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-600 dark:text-gray-400">Avg Load Time</span>
                    <span id="avg-load-time" class="font-semibold">
                        {{ $feedStats['avg_feed_load_time'] ?? 'N/A' }}
                    </span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-600 dark:text-gray-400">Cache Hit Rate</span>
                    <span id="cache-hit-rate" class="font-semibold">
                        {{ $feedStats['cache_hit_rate'] ?? 'N/A' }}
                    </span>
                </div>
            </div>
        </div>
    </div>

    <!-- Performance Recommendations -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Performance Recommendations
        </h3>
        <div id="recommendations-container" class="space-y-3">
            <div class="text-gray-600 dark:text-gray-400 text-sm">
                Loading recommendations...
            </div>
        </div>
    </div>
</div>

@push('styles')
<style>
    .health-indicator {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        display: inline-block;
        animation: pulse 2s infinite;
    }
    
    .health-indicator.healthy {
        background-color: #10b981;
    }
    
    .health-indicator.degraded {
        background-color: #f59e0b;
    }
    
    .health-indicator.unhealthy {
        background-color: #ef4444;
    }
    
    .progress-bar {
        width: 100%;
        height: 8px;
        background-color: #e5e7eb;
        border-radius: 4px;
        overflow: hidden;
    }
    
    .progress-bar-fill {
        height: 100%;
        transition: width 0.3s ease;
    }
    
    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.5;
        }
    }
</style>
@endpush
@endsection
