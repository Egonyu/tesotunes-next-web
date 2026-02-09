@extends('frontend.layouts.artist')

@section('title', 'Analytics')

@section('artist-content')
<div x-data="analyticsData()">
    <!-- Page Header -->
    <div class="mb-8">
        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
                <p class="text-gray-400">Track your music performance and audience insights</p>
            </div>
            <div class="flex items-center gap-3">
                <select
                    x-model="selectedPeriod"
                    @change="updateAnalytics()"
                    class="bg-gray-800 text-white rounded-lg px-4 py-2 text-sm border border-gray-700 focus:border-green-500 focus:outline-none"
                >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 3 months</option>
                    <option value="365">Last year</option>
                </select>
                <button
                    @click="exportData()"
                    class="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-white transition-colors"
                >
                    <span class="material-icons-round text-sm">download</span>
                    Export
                </button>
            </div>
        </div>
    </div>

    <!-- Overview Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Plays -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                    <span class="material-icons-round text-green-500">play_arrow</span>
                </div>
                <div class="flex items-center gap-1 text-green-500 text-sm">
                    <span class="material-icons-round text-sm">trending_up</span>
                    <span x-text="`+${stats.playsGrowth}%`"></span>
                </div>
            </div>
            <div>
                <p class="text-2xl font-bold text-white" x-text="formatNumber(stats.totalPlays)"></p>
                <p class="text-gray-400 text-sm">Total Plays</p>
            </div>
        </div>

        <!-- Unique Listeners -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <span class="material-icons-round text-blue-500">people</span>
                </div>
                <div class="flex items-center gap-1 text-blue-500 text-sm">
                    <span class="material-icons-round text-sm">trending_up</span>
                    <span x-text="`+${stats.listenersGrowth}%`"></span>
                </div>
            </div>
            <div>
                <p class="text-2xl font-bold text-white" x-text="formatNumber(stats.uniqueListeners)"></p>
                <p class="text-gray-400 text-sm">Unique Listeners</p>
            </div>
        </div>

        <!-- Revenue -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                    <span class="material-icons-round text-yellow-500">monetization_on</span>
                </div>
                <div class="flex items-center gap-1 text-yellow-500 text-sm">
                    <span class="material-icons-round text-sm">trending_up</span>
                    <span x-text="`+${stats.revenueGrowth}%`"></span>
                </div>
            </div>
            <div>
                <p class="text-2xl font-bold text-white">UGX <span x-text="formatNumber(stats.totalRevenue)"></span></p>
                <p class="text-gray-400 text-sm">Total Revenue</p>
            </div>
        </div>

        <!-- Avg Play Duration -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                    <span class="material-icons-round text-purple-500">schedule</span>
                </div>
                <div class="flex items-center gap-1 text-purple-500 text-sm">
                    <span class="material-icons-round text-sm">trending_up</span>
                    <span x-text="`+${stats.durationGrowth}%`"></span>
                </div>
            </div>
            <div>
                <p class="text-2xl font-bold text-white" x-text="formatDuration(stats.avgPlayDuration)"></p>
                <p class="text-gray-400 text-sm">Avg Play Duration</p>
            </div>
        </div>
    </div>

    <!-- Charts Row -->
    <div class="grid lg:grid-cols-2 gap-8 mb-8">
        <!-- Plays Over Time Chart -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-bold text-white">Plays Over Time</h2>
                <div class="flex items-center gap-2">
                    <button
                        @click="chartType = 'plays'"
                        :class="chartType === 'plays' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'"
                        class="px-3 py-1 rounded text-sm transition-colors"
                    >
                        Plays
                    </button>
                    <button
                        @click="chartType = 'revenue'"
                        :class="chartType === 'revenue' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'"
                        class="px-3 py-1 rounded text-sm transition-colors"
                    >
                        Revenue
                    </button>
                </div>
            </div>
            <div class="h-64 bg-gray-700/50 rounded-lg flex items-center justify-center">
                <div class="text-center">
                    <span class="material-icons-round text-4xl text-gray-500 mb-2">show_chart</span>
                    <p class="text-gray-400">Chart visualization would go here</p>
                    <p class="text-gray-500 text-sm">Integration with Chart.js or similar</p>
                </div>
            </div>
        </div>

        <!-- Top Countries -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 class="text-xl font-bold text-white mb-6">Top Countries</h2>
            <div class="space-y-4">
                <template x-for="country in topCountries" :key="country.code">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-6 h-4 bg-gray-600 rounded-sm flex items-center justify-center">
                                <span class="text-xs" x-text="country.flag"></span>
                            </div>
                            <span class="text-white font-medium" x-text="country.name"></span>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="w-24 bg-gray-700 rounded-full h-2">
                                <div class="bg-green-600 h-2 rounded-full" :style="`width: ${country.percentage}%`"></div>
                            </div>
                            <span class="text-gray-400 text-sm w-12 text-right" x-text="`${country.percentage}%`"></span>
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </div>

    <!-- Data Tables Row -->
    <div class="grid lg:grid-cols-2 gap-8 mb-8">
        <!-- Top Tracks -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-bold text-white">Top Performing Tracks</h2>
                <a href="{{ route('frontend.artist.music.index') }}" class="text-green-500 hover:text-green-400 text-sm">
                    View All
                </a>
            </div>
            <div class="space-y-4">
                <template x-for="(track, index) in topTracks" :key="track.id">
                    <div class="flex items-center gap-4 p-3 hover:bg-gray-700/50 rounded-lg transition-colors">
                        <span class="text-gray-400 font-medium text-sm w-6" x-text="index + 1"></span>
                        <div class="w-12 h-12 bg-gray-600 rounded overflow-hidden">
                            <img :src="track.artwork || '/images/default-track.jpg'" :alt="track.title" class="w-full h-full object-cover">
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-white font-medium truncate" x-text="track.title"></p>
                            <p class="text-gray-400 text-sm" x-text="`${formatNumber(track.plays)} plays`"></p>
                        </div>
                        <div class="text-right">
                            <p class="text-green-500 text-sm font-medium" x-text="formatNumber(track.revenue)"></p>
                            <p class="text-gray-400 text-xs">UGX</p>
                        </div>
                    </div>
                </template>
            </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 class="text-xl font-bold text-white mb-6">Recent Activity</h2>
            <div class="space-y-4">
                <template x-for="activity in recentActivity" :key="activity.id">
                    <div class="flex items-start gap-3">
                        <div class="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center mt-1">
                            <span class="material-icons-round text-gray-400 text-sm" x-text="activity.icon"></span>
                        </div>
                        <div class="flex-1">
                            <p class="text-white text-sm" x-text="activity.description"></p>
                            <p class="text-gray-400 text-xs" x-text="activity.time"></p>
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </div>

    <!-- Detailed Analytics -->
    <div class="bg-gray-800 rounded-lg border border-gray-700">
        <div class="p-6 border-b border-gray-700">
            <div class="flex items-center justify-between">
                <h2 class="text-xl font-bold text-white">Detailed Analytics</h2>
                <div class="flex items-center gap-2">
                    <button
                        @click="detailView = 'tracks'"
                        :class="detailView === 'tracks' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'"
                        class="px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                        By Track
                    </button>
                    <button
                        @click="detailView = 'demographics'"
                        :class="detailView === 'demographics' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'"
                        class="px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                        Demographics
                    </button>
                    <button
                        @click="detailView = 'devices'"
                        :class="detailView === 'devices' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'"
                        class="px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                        Devices
                    </button>
                </div>
            </div>
        </div>

        <!-- Track Analytics -->
        <div x-show="detailView === 'tracks'" class="p-6">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-gray-700">
                            <th class="text-left py-3 text-gray-400 font-medium">Track</th>
                            <th class="text-left py-3 text-gray-400 font-medium">Plays</th>
                            <th class="text-left py-3 text-gray-400 font-medium">Unique Listeners</th>
                            <th class="text-left py-3 text-gray-400 font-medium">Completion Rate</th>
                            <th class="text-left py-3 text-gray-400 font-medium">Revenue</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-700">
                        <template x-for="track in detailedTracks" :key="track.id">
                            <tr class="hover:bg-gray-700/50">
                                <td class="py-4">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 bg-gray-600 rounded overflow-hidden">
                                            <img :src="track.artwork || '/images/default-track.jpg'" :alt="track.title" class="w-full h-full object-cover">
                                        </div>
                                        <div>
                                            <p class="text-white font-medium" x-text="track.title"></p>
                                            <p class="text-gray-400 text-sm" x-text="track.genre"></p>
                                        </div>
                                    </div>
                                </td>
                                <td class="py-4 text-white" x-text="formatNumber(track.plays)"></td>
                                <td class="py-4 text-white" x-text="formatNumber(track.uniqueListeners)"></td>
                                <td class="py-4">
                                    <div class="flex items-center gap-2">
                                        <div class="w-16 bg-gray-700 rounded-full h-2">
                                            <div class="bg-green-600 h-2 rounded-full" :style="`width: ${track.completionRate}%`"></div>
                                        </div>
                                        <span class="text-white text-sm" x-text="`${track.completionRate}%`"></span>
                                    </div>
                                </td>
                                <td class="py-4 text-white" x-text="`UGX ${formatNumber(track.revenue)}`"></td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Demographics -->
        <div x-show="detailView === 'demographics'" class="p-6">
            <div class="grid md:grid-cols-2 gap-8">
                <!-- Age Groups -->
                <div>
                    <h3 class="text-lg font-semibold text-white mb-4">Age Distribution</h3>
                    <div class="space-y-3">
                        <template x-for="age in ageGroups" :key="age.range">
                            <div class="flex items-center justify-between">
                                <span class="text-gray-300" x-text="age.range"></span>
                                <div class="flex items-center gap-3">
                                    <div class="w-24 bg-gray-700 rounded-full h-2">
                                        <div class="bg-blue-600 h-2 rounded-full" :style="`width: ${age.percentage}%`"></div>
                                    </div>
                                    <span class="text-white text-sm w-10 text-right" x-text="`${age.percentage}%`"></span>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>

                <!-- Gender -->
                <div>
                    <h3 class="text-lg font-semibold text-white mb-4">Gender Distribution</h3>
                    <div class="space-y-3">
                        <template x-for="gender in genderDistribution" :key="gender.type">
                            <div class="flex items-center justify-between">
                                <span class="text-gray-300" x-text="gender.type"></span>
                                <div class="flex items-center gap-3">
                                    <div class="w-24 bg-gray-700 rounded-full h-2">
                                        <div class="bg-purple-600 h-2 rounded-full" :style="`width: ${gender.percentage}%`"></div>
                                    </div>
                                    <span class="text-white text-sm w-10 text-right" x-text="`${gender.percentage}%`"></span>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>

        <!-- Devices -->
        <div x-show="detailView === 'devices'" class="p-6">
            <div class="grid md:grid-cols-2 gap-8">
                <!-- Device Types -->
                <div>
                    <h3 class="text-lg font-semibold text-white mb-4">Device Types</h3>
                    <div class="space-y-3">
                        <template x-for="device in deviceTypes" :key="device.type">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <span class="material-icons-round text-gray-400 text-sm" x-text="device.icon"></span>
                                    <span class="text-gray-300" x-text="device.type"></span>
                                </div>
                                <div class="flex items-center gap-3">
                                    <div class="w-24 bg-gray-700 rounded-full h-2">
                                        <div class="bg-green-600 h-2 rounded-full" :style="`width: ${device.percentage}%`"></div>
                                    </div>
                                    <span class="text-white text-sm w-10 text-right" x-text="`${device.percentage}%`"></span>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>

                <!-- Platforms -->
                <div>
                    <h3 class="text-lg font-semibold text-white mb-4">Platforms</h3>
                    <div class="space-y-3">
                        <template x-for="platform in platforms" :key="platform.name">
                            <div class="flex items-center justify-between">
                                <span class="text-gray-300" x-text="platform.name"></span>
                                <div class="flex items-center gap-3">
                                    <div class="w-24 bg-gray-700 rounded-full h-2">
                                        <div class="bg-yellow-600 h-2 rounded-full" :style="`width: ${platform.percentage}%`"></div>
                                    </div>
                                    <span class="text-white text-sm w-10 text-right" x-text="`${platform.percentage}%`"></span>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
function analyticsData() {
    return {
        selectedPeriod: '30',
        chartType: 'plays',
        detailView: 'tracks',

        // Mock data - in real app, this would come from API
        stats: {
            totalPlays: 125430,
            playsGrowth: 15.2,
            uniqueListeners: 8920,
            listenersGrowth: 12.5,
            totalRevenue: 2840000,
            revenueGrowth: 18.7,
            avgPlayDuration: 145,
            durationGrowth: 8.3
        },

        topCountries: [
            { code: 'UG', name: 'Uganda', flag: '🇺🇬', percentage: 45 },
            { code: 'KE', name: 'Kenya', flag: '🇰🇪', percentage: 25 },
            { code: 'TZ', name: 'Tanzania', flag: '🇹🇿', percentage: 15 },
            { code: 'RW', name: 'Rwanda', flag: '🇷🇼', percentage: 10 },
            { code: 'US', name: 'United States', flag: '🇺🇸', percentage: 5 }
        ],

        topTracks: @json($topTracks ?? []),
        detailedTracks: @json($detailedTracks ?? []),

        recentActivity: [
            { id: 1, icon: 'play_arrow', description: 'Your track "Sunset Vibes" reached 1,000 plays', time: '2 hours ago' },
            { id: 2, icon: 'favorite', description: '50 new listeners added your music to favorites', time: '5 hours ago' },
            { id: 3, icon: 'share', description: 'Your track was shared 25 times on social media', time: '1 day ago' }
        ],

        ageGroups: [
            { range: '18-24', percentage: 35 },
            { range: '25-34', percentage: 40 },
            { range: '35-44', percentage: 20 },
            { range: '45+', percentage: 5 }
        ],

        genderDistribution: [
            { type: 'Male', percentage: 55 },
            { type: 'Female', percentage: 42 },
            { type: 'Other', percentage: 3 }
        ],

        deviceTypes: [
            { type: 'Mobile', icon: 'smartphone', percentage: 70 },
            { type: 'Desktop', icon: 'computer', percentage: 25 },
            { type: 'Tablet', icon: 'tablet', percentage: 5 }
        ],

        platforms: [
            { name: 'Android', percentage: 60 },
            { name: 'iOS', percentage: 30 },
            { name: 'Web', percentage: 10 }
        ],

        formatNumber(num) {
            if (num >= 1000000) {
                return (num / 1000000).toFixed(1) + 'M';
            } else if (num >= 1000) {
                return (num / 1000).toFixed(1) + 'K';
            }
            return num.toString();
        },

        formatDuration(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        },

        updateAnalytics() {
            // Fetch new data based on selected period
            console.log('Updating analytics for period:', this.selectedPeriod);
        },

        exportData() {
            // Export analytics data
            console.log('Exporting analytics data...');
        }
    }
}
</script>
@endpush
@endsection