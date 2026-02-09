@extends('frontend.layouts.artist')

@section('title', 'Artist Dashboard')

@section('artist-content')
<div x-data="artistDashboard()">
    <!-- Page Header -->
    <div class="mb-8">
        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="text-3xl font-bold text-white mb-2">Artist Dashboard</h1>
                <p class="text-gray-400">Welcome back, {{ $artist->name }}! Here's what's happening with your music</p>
            </div>
            <div class="flex items-center gap-3">
                <a href="{{ route('frontend.artist.analytics') }}"
                   class="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-white transition-colors">
                    <span class="material-icons-round text-sm">analytics</span>
                    Analytics
                </a>
                <a href="{{ route('frontend.artist.upload.create') }}"
                   class="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white transition-colors">
                    <span class="material-icons-round text-sm">cloud_upload</span>
                    Upload
                </a>
            </div>
        </div>
    </div>

    <!-- Success/Error Messages -->
    @if(session('success'))
        <div class="bg-green-600/10 border border-green-600/20 rounded-lg p-4 mb-8">
            <div class="flex items-center gap-3">
                <span class="material-icons-round text-green-500">check_circle</span>
                <p class="text-green-400 font-medium">{{ session('success') }}</p>
            </div>
        </div>
    @endif

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Streams -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <span class="material-icons-round text-blue-500">play_arrow</span>
                </div>
                @if($stats['streams_growth'] != 0)
                    <div class="flex items-center gap-1 text-{{ $stats['streams_growth'] > 0 ? 'green' : 'red' }}-500 text-sm">
                        <span class="material-icons-round text-sm">{{ $stats['streams_growth'] > 0 ? 'trending_up' : 'trending_down' }}</span>
                        <span>{{ $stats['streams_growth'] > 0 ? '+' : '' }}{{ $stats['streams_growth'] }}%</span>
                    </div>
                @endif
            </div>
            <div>
                <p class="text-2xl font-bold text-white">{{ number_format($stats['total_streams']) }}</p>
                <p class="text-gray-400 text-sm">Total Streams</p>
            </div>
        </div>

        <!-- Total Tracks -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                    <span class="material-icons-round text-purple-500">library_music</span>
                </div>
                @if($stats['pending_tracks'] > 0)
                    <div class="flex items-center gap-1 text-orange-500 text-sm">
                        <span class="material-icons-round text-sm">pending</span>
                        <span>{{ $stats['pending_tracks'] }}</span>
                    </div>
                @endif
            </div>
            <div>
                <p class="text-2xl font-bold text-white">{{ number_format($stats['total_tracks']) }}</p>
                <p class="text-gray-400 text-sm">Total Tracks</p>
            </div>
        </div>

        <!-- Monthly Earnings -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                    <span class="material-icons-round text-green-500">monetization_on</span>
                </div>
                <div class="flex items-center gap-1 text-green-500 text-sm">
                    <span class="material-icons-round text-sm">trending_up</span>
                    <span>+{{ $stats['earnings_growth'] }}%</span>
                </div>
            </div>
            <div>
                <p class="text-2xl font-bold text-white">${{ number_format($stats['monthly_earnings'], 2) }}</p>
                <p class="text-gray-400 text-sm">Monthly Earnings</p>
            </div>
        </div>

        <!-- Followers -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-orange-600/20 rounded-lg flex items-center justify-center">
                    <span class="material-icons-round text-orange-500">people</span>
                </div>
                @if($stats['new_followers_this_month'] > 0)
                    <div class="flex items-center gap-1 text-orange-500 text-sm">
                        <span class="material-icons-round text-sm">trending_up</span>
                        <span>+{{ $stats['new_followers_this_month'] }}</span>
                    </div>
                @endif
            </div>
            <div>
                <p class="text-2xl font-bold text-white">{{ number_format($stats['followers']) }}</p>
                <p class="text-gray-400 text-sm">Followers</p>
            </div>
        </div>
    </div>

    <!-- Content Grid -->
    <div class="grid lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-8">
            <!-- Recent Activity -->
            <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-bold text-white">Recent Activity</h2>
                    <a href="{{ route('frontend.artist.analytics') }}" class="text-green-500 hover:text-green-400 text-sm font-medium">
                        View All
                    </a>
                </div>

                <div class="space-y-4">
                    @forelse($recent_activity as $activity)
                        <div class="flex items-center gap-4 p-4 bg-gray-700/50 rounded-lg">
                            <div class="w-10 h-10 bg-{{ $activity['color'] }}-600/20 rounded-lg flex items-center justify-center">
                                <span class="material-icons-round text-{{ $activity['color'] }}-500 text-sm">{{ $activity['icon'] }}</span>
                            </div>
                            <div class="flex-1">
                                <p class="text-white text-sm font-medium">{{ $activity['message'] }}</p>
                                <p class="text-gray-400 text-xs">{{ $activity['time'] }}</p>
                            </div>
                        </div>
                    @empty
                        <div class="text-center py-8">
                            <span class="material-icons-round text-gray-500 text-4xl mb-4">timeline</span>
                            <p class="text-gray-400">No recent activity</p>
                            <p class="text-gray-500 text-sm">Upload your first track to get started</p>
                        </div>
                    @endforelse
                </div>
            </div>

            <!-- Top Performing Tracks -->
            <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-bold text-white">Top Performing Tracks</h2>
                    <a href="{{ route('frontend.artist.music.index') }}" class="text-green-500 hover:text-green-400 text-sm font-medium">
                        View All
                    </a>
                </div>

                <div class="space-y-4">
                    @forelse($top_tracks as $index => $track)
                        <div class="flex items-center gap-4 p-3 hover:bg-gray-700/50 rounded-lg transition-colors">
                            <span class="text-gray-400 font-medium text-sm w-6">{{ $index + 1 }}</span>
                            <div class="w-12 h-12 bg-gray-600 rounded-lg overflow-hidden">
                                @if($track['artwork'])
                                    <img src="{{ $track['artwork'] }}" alt="{{ $track['title'] }}" class="w-full h-full object-cover">
                                @else
                                    <div class="w-full h-full flex items-center justify-center">
                                        <span class="material-icons-round text-gray-400">music_note</span>
                                    </div>
                                @endif
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-white font-medium truncate">{{ $track['title'] }}</p>
                                <p class="text-gray-400 text-sm">{{ $track['genre'] }}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-white font-medium">{{ number_format($track['play_count']) }} plays</p>
                                <p class="text-gray-400 text-sm">${{ number_format($track['revenue'], 2) }}</p>
                            </div>
                        </div>
                    @empty
                        <div class="text-center py-8">
                            <span class="material-icons-round text-gray-500 text-4xl mb-4">library_music</span>
                            <p class="text-gray-400">No tracks uploaded yet</p>
                            <a href="{{ route('frontend.artist.upload.index') }}" class="text-green-500 hover:text-green-400 text-sm">
                                Upload your first track
                            </a>
                        </div>
                    @endforelse
                </div>
            </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
            <!-- Upload Progress -->
            @if($pending_uploads->count() > 0)
                <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <h3 class="text-lg font-bold text-white mb-4">Uploads in Progress</h3>
                    <div class="space-y-4">
                        @foreach($pending_uploads as $upload)
                            <div class="p-4 bg-gray-700/50 rounded-lg">
                                <div class="flex items-center justify-between mb-2">
                                    <p class="text-white text-sm font-medium truncate">{{ $upload['filename'] }}</p>
                                    <span class="text-yellow-500 text-xs">{{ ucfirst($upload['status']) }}</span>
                                </div>
                                @if($upload['status'] === 'processing')
                                    <div class="w-full bg-gray-600 rounded-full h-2">
                                        <div class="bg-green-600 h-2 rounded-full transition-all duration-300" style="width: {{ $upload['progress'] }}%"></div>
                                    </div>
                                @endif
                                <p class="text-gray-400 text-xs mt-2">{{ $upload['uploaded_at'] }}</p>
                            </div>
                        @endforeach
                    </div>
                </div>
            @endif

            <!-- Quick Actions -->
            <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 class="text-lg font-bold text-white mb-4">Quick Actions</h3>
                <div class="space-y-3">
                    <a
                        href="{{ route('frontend.artist.upload.index') }}"
                        class="flex items-center gap-3 p-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                    >
                        <span class="material-icons-round text-white">add</span>
                        <span class="text-white font-medium">Upload Track</span>
                    </a>
                    <a
                        href="{{ route('frontend.artist.analytics') }}"
                        class="flex items-center gap-3 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                        <span class="material-icons-round text-gray-300">analytics</span>
                        <span class="text-gray-300 font-medium">View Analytics</span>
                    </a>
                    <a
                        href="{{ route('frontend.artist.profile') }}"
                        class="flex items-center gap-3 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                        <span class="material-icons-round text-gray-300">person</span>
                        <span class="text-gray-300 font-medium">Edit Profile</span>
                    </a>
                </div>
            </div>

            <!-- Tips & Resources -->
            <div class="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-lg p-6 border border-purple-700/50">
                <h3 class="text-lg font-bold text-white mb-4">Artist Tips</h3>
                <div class="space-y-3">
                    <div class="flex items-start gap-3">
                        <span class="material-icons-round text-purple-400 text-sm mt-0.5">lightbulb</span>
                        <div>
                            <p class="text-white text-sm font-medium">Optimize Your Uploads</p>
                            <p class="text-gray-300 text-xs">Add detailed metadata to improve discoverability</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3">
                        <span class="material-icons-round text-blue-400 text-sm mt-0.5">schedule</span>
                        <div>
                            <p class="text-white text-sm font-medium">Release Schedule</p>
                            <p class="text-gray-300 text-xs">Consistent releases help grow your audience</p>
                        </div>
                    </div>
                </div>
                <a href="#" class="inline-block mt-4 text-purple-400 hover:text-purple-300 text-sm font-medium">
                    Learn More →
                </a>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
function artistDashboard() {
    return {
        init() {
            // Initialize dashboard data
            this.loadDashboardData();
        },

        loadDashboardData() {
            // Load real-time dashboard data
            // This would typically make AJAX calls to get updated stats
        }
    }
}
</script>
@endpush
@endsection