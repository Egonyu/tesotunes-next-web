@extends('frontend.layouts.music')

@section('title', 'Moderator Dashboard')

@section('content')
<div class="min-h-screen bg-white dark:bg-black">
    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-white mb-2">
                Moderator Dashboard
            </h1>
            <p class="text-gray-400">
                Review and moderate content across the platform
            </p>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <span class="material-icons-round text-yellow-500 text-3xl">pending</span>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm font-medium text-gray-400">Pending Review</p>
                        <p class="text-2xl font-bold text-white">{{ $stats['pending_count'] ?? 0 }}</p>
                    </div>
                </div>
            </div>

            <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <span class="material-icons-round text-green-500 text-3xl">check_circle</span>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm font-medium text-gray-400">Approved Today</p>
                        <p class="text-2xl font-bold text-white">{{ $stats['approved_today'] ?? 0 }}</p>
                    </div>
                </div>
            </div>

            <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <span class="material-icons-round text-red-500 text-3xl">flag</span>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm font-medium text-gray-400">Open Reports</p>
                        <p class="text-2xl font-bold text-white">{{ $stats['open_reports'] ?? 0 }}</p>
                    </div>
                </div>
            </div>

            <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <span class="material-icons-round text-blue-500 text-3xl">access_time</span>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm font-medium text-gray-400">Avg Response Time</p>
                        <p class="text-2xl font-bold text-white">{{ $stats['avg_response_time'] ?? '2h' }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <a href="{{ route('frontend.moderator.content') }}" 
               class="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-green-500 transition-colors">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-lg font-semibold text-white mb-2">Review Content</h3>
                        <p class="text-sm text-gray-400">Approve or reject pending submissions</p>
                    </div>
                    <span class="material-icons-round text-green-500 text-3xl">rate_review</span>
                </div>
            </a>

            <a href="{{ route('frontend.moderator.reports') }}" 
               class="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-red-500 transition-colors">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-lg font-semibold text-white mb-2">Handle Reports</h3>
                        <p class="text-sm text-gray-400">Review user reports and flags</p>
                    </div>
                    <span class="material-icons-round text-red-500 text-3xl">report</span>
                </div>
            </a>

            <a href="#" 
               class="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-lg font-semibold text-white mb-2">Moderation Log</h3>
                        <p class="text-sm text-gray-400">View your moderation history</p>
                    </div>
                    <span class="material-icons-round text-blue-500 text-3xl">history</span>
                </div>
            </a>
        </div>

        <!-- Recent Activity -->
        <div class="bg-gray-800 rounded-lg border border-gray-700">
            <div class="p-6 border-b border-gray-700">
                <h2 class="text-xl font-bold text-white">Recent Activity</h2>
            </div>
            <div class="p-6">
                <div class="space-y-4">
                    @forelse($recentActivity ?? [] as $activity)
                    <div class="flex items-center justify-between py-3 border-b border-gray-700 last:border-0">
                        <div class="flex items-center space-x-4">
                            <span class="material-icons-round text-gray-400">{{ $activity['icon'] ?? 'info' }}</span>
                            <div>
                                <p class="text-white font-medium">{{ $activity['title'] ?? 'Activity' }}</p>
                                <p class="text-sm text-gray-400">{{ $activity['description'] ?? '' }}</p>
                            </div>
                        </div>
                        <span class="text-sm text-gray-500">{{ $activity['time'] ?? 'Just now' }}</span>
                    </div>
                    @empty
                    <div class="text-center py-8">
                        <span class="material-icons-round text-gray-600 text-5xl mb-4">inbox</span>
                        <p class="text-gray-400">No recent activity</p>
                    </div>
                    @endforelse
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
