@extends('layouts.app')

@section('title', 'Promotions')

@section('left-sidebar')
    @include('frontend.partials.modern-left-sidebar')
@endsection

@section('content')
<div x-data="promotionsPage()">
    <!-- Page Header -->
    <div class="mb-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Promotions</h1>
                <p class="text-gray-600 dark:text-gray-400">Boost your music visibility with targeted promotions</p>
            </div>
            <div class="flex items-center gap-3">
                <a href="{{ route('frontend.artist.analytics') }}"
                   class="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-4 py-2 rounded-lg text-gray-700 dark:text-white transition-colors">
                    <span class="material-icons-round text-sm">analytics</span>
                    Analytics
                </a>
                <button @click="openCreatePromotion()"
                        class="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white transition-colors">
                    <span class="material-icons-round text-sm">campaign</span>
                    Create Promotion
                </button>
            </div>
        </div>
    </div>

    <!-- Success/Error Messages -->
    @if(session('success'))
        <div class="bg-green-100 dark:bg-green-600/10 border border-green-300 dark:border-green-600/20 rounded-lg p-4 mb-6">
            <div class="flex items-center gap-3">
                <span class="material-icons-round text-green-600 dark:text-green-500">check_circle</span>
                <p class="text-green-700 dark:text-green-400 font-medium">{{ session('success') }}</p>
            </div>
        </div>
    @endif

    @if(session('error'))
        <div class="bg-red-100 dark:bg-red-600/10 border border-red-300 dark:border-red-600/20 rounded-lg p-4 mb-6">
            <div class="flex items-center gap-3">
                <span class="material-icons-round text-red-600 dark:text-red-500">error</span>
                <p class="text-red-700 dark:text-red-400 font-medium">{{ session('error') }}</p>
            </div>
        </div>
    @endif

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Active Campaigns -->
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-green-100 dark:bg-green-600/20 rounded-lg flex items-center justify-center">
                    <span class="material-icons-round text-green-600 dark:text-green-500">campaign</span>
                </div>
            </div>
            <div>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ $stats['active'] ?? 0 }}</p>
                <p class="text-gray-600 dark:text-gray-400 text-sm">Active Campaigns</p>
            </div>
        </div>

        <!-- Total Impressions -->
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-blue-100 dark:bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <span class="material-icons-round text-blue-600 dark:text-blue-500">visibility</span>
                </div>
            </div>
            <div>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ number_format($stats['impressions'] ?? 0) }}</p>
                <p class="text-gray-600 dark:text-gray-400 text-sm">Total Impressions</p>
            </div>
        </div>

        <!-- Total Clicks -->
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-purple-100 dark:bg-purple-600/20 rounded-lg flex items-center justify-center">
                    <span class="material-icons-round text-purple-600 dark:text-purple-500">touch_app</span>
                </div>
            </div>
            <div>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ number_format($stats['clicks'] ?? 0) }}</p>
                <p class="text-gray-600 dark:text-gray-400 text-sm">Total Clicks</p>
            </div>
        </div>

        <!-- Total Spent -->
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-orange-100 dark:bg-orange-600/20 rounded-lg flex items-center justify-center">
                    <span class="material-icons-round text-orange-600 dark:text-orange-500">payments</span>
                </div>
            </div>
            <div>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">UGX {{ number_format($stats['spent'] ?? 0) }}</p>
                <p class="text-gray-600 dark:text-gray-400 text-sm">Total Spent</p>
            </div>
        </div>
    </div>

    <!-- Content Grid -->
    <div class="grid lg:grid-cols-4 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-3 space-y-6">
            <!-- Filter Tabs -->
            <div class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div class="flex items-center gap-1 flex-wrap">
                    <button @click="currentTab = 'all'" 
                            :class="currentTab === 'all' ? 'bg-green-100 dark:bg-green-600/10 text-green-600 dark:text-green-500' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
                            class="px-4 py-2 text-sm font-medium rounded-lg transition-colors">
                        All ({{ $counts['all'] ?? 0 }})
                    </button>
                    <button @click="currentTab = 'active'" 
                            :class="currentTab === 'active' ? 'bg-green-100 dark:bg-green-600/10 text-green-600 dark:text-green-500' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
                            class="px-4 py-2 text-sm font-medium rounded-lg transition-colors">
                        Active ({{ $counts['active'] ?? 0 }})
                    </button>
                    <button @click="currentTab = 'scheduled'" 
                            :class="currentTab === 'scheduled' ? 'bg-green-100 dark:bg-green-600/10 text-green-600 dark:text-green-500' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
                            class="px-4 py-2 text-sm font-medium rounded-lg transition-colors">
                        Scheduled ({{ $counts['scheduled'] ?? 0 }})
                    </button>
                    <button @click="currentTab = 'completed'" 
                            :class="currentTab === 'completed' ? 'bg-green-100 dark:bg-green-600/10 text-green-600 dark:text-green-500' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
                            class="px-4 py-2 text-sm font-medium rounded-lg transition-colors">
                        Completed ({{ $counts['completed'] ?? 0 }})
                    </button>
                    <button @click="currentTab = 'paused'" 
                            :class="currentTab === 'paused' ? 'bg-green-100 dark:bg-green-600/10 text-green-600 dark:text-green-500' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
                            class="px-4 py-2 text-sm font-medium rounded-lg transition-colors">
                        Paused ({{ $counts['paused'] ?? 0 }})
                    </button>
                </div>
            </div>

            <!-- Promotions List -->
            @if(isset($promotions) && count($promotions) > 0)
                <div class="space-y-4">
                    @foreach($promotions as $promotion)
                        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-green-500/50 transition-colors shadow-sm">
                            <div class="flex items-start justify-between">
                                <!-- Promotion Info -->
                                <div class="flex-1">
                                    <div class="flex items-center space-x-3 mb-3">
                                        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">{{ $promotion['title'] ?? 'Campaign' }}</h3>
                                        <span class="px-2.5 py-1 {{ $promotion['status_color'] ?? 'bg-gray-200 dark:bg-gray-700' }} text-xs rounded-full font-medium">
                                            {{ strtoupper($promotion['status'] ?? 'Unknown') }}
                                        </span>
                                        @if($promotion['is_featured'] ?? false)
                                            <span class="px-2.5 py-1 bg-yellow-100 dark:bg-yellow-600/20 text-yellow-700 dark:text-yellow-500 text-xs rounded-full font-medium">FEATURED</span>
                                        @endif
                                    </div>

                                    <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">
                                        {{ $promotion['description'] ?? 'No description' }}
                                    </p>

                                    <!-- Target Content -->
                                    @if(isset($promotion['content']))
                                        <div class="flex items-center space-x-4 mb-4">
                                            <img src="{{ $promotion['content']['artwork'] ?? '/images/default-song-artwork.svg' }}" 
                                                 alt="Content" 
                                                 class="w-16 h-16 rounded-lg object-cover">
                                            <div>
                                                <p class="text-gray-900 dark:text-white font-medium">{{ $promotion['content']['title'] ?? 'Content' }}</p>
                                                <p class="text-gray-600 dark:text-gray-400 text-sm">{{ $promotion['content']['type'] ?? 'Song' }}</p>
                                            </div>
                                        </div>
                                    @endif

                                    <!-- Stats -->
                                    <div class="grid grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <p class="text-gray-500 dark:text-gray-400">Budget</p>
                                            <p class="text-gray-900 dark:text-white font-semibold">UGX {{ number_format($promotion['budget'] ?? 0) }}</p>
                                        </div>
                                        <div>
                                            <p class="text-gray-500 dark:text-gray-400">Impressions</p>
                                            <p class="text-gray-900 dark:text-white font-semibold">{{ number_format($promotion['impressions'] ?? 0) }}</p>
                                        </div>
                                        <div>
                                            <p class="text-gray-500 dark:text-gray-400">Clicks</p>
                                            <p class="text-gray-900 dark:text-white font-semibold">{{ number_format($promotion['clicks'] ?? 0) }}</p>
                                        </div>
                                        <div>
                                            <p class="text-gray-500 dark:text-gray-400">CTR</p>
                                            <p class="text-gray-900 dark:text-white font-semibold">{{ $promotion['ctr'] ?? '0' }}%</p>
                                        </div>
                                    </div>

                                    <!-- Timeline -->
                                    <div class="mt-4 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                        <span class="flex items-center gap-1">
                                            <span class="material-icons-round text-xs">schedule</span>
                                            Start: {{ $promotion['start_date'] ?? 'Not set' }}
                                        </span>
                                        <span>•</span>
                                        <span>End: {{ $promotion['end_date'] ?? 'Not set' }}</span>
                                    </div>
                                </div>

                                <!-- Actions -->
                                <div class="flex flex-col space-y-2 ml-6">
                                    <button class="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-white text-sm rounded-lg transition-colors flex items-center gap-2">
                                        <span class="material-icons-round text-sm">analytics</span>
                                        View Stats
                                    </button>
                                    @if(($promotion['status'] ?? '') === 'active')
                                        <button class="px-4 py-2 bg-yellow-100 dark:bg-yellow-600/20 hover:bg-yellow-200 dark:hover:bg-yellow-600/30 text-yellow-700 dark:text-yellow-500 text-sm rounded-lg transition-colors flex items-center gap-2">
                                            <span class="material-icons-round text-sm">pause</span>
                                            Pause
                                        </button>
                                    @elseif(($promotion['status'] ?? '') === 'paused')
                                        <button class="px-4 py-2 bg-green-100 dark:bg-green-600/20 hover:bg-green-200 dark:hover:bg-green-600/30 text-green-700 dark:text-green-500 text-sm rounded-lg transition-colors flex items-center gap-2">
                                            <span class="material-icons-round text-sm">play_arrow</span>
                                            Resume
                                        </button>
                                    @endif
                                    <button class="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-white text-sm rounded-lg transition-colors flex items-center gap-2">
                                        <span class="material-icons-round text-sm">edit</span>
                                        Edit
                                    </button>
                                </div>
                            </div>

                            <!-- Progress Bar -->
                            @if(isset($promotion['progress']))
                                <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div class="flex items-center justify-between text-sm mb-2">
                                        <span class="text-gray-500 dark:text-gray-400">Campaign Progress</span>
                                        <span class="text-gray-900 dark:text-white font-medium">{{ $promotion['progress'] }}%</span>
                                    </div>
                                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div class="bg-green-600 h-2 rounded-full transition-all" style="width: {{ $promotion['progress'] }}%"></div>
                                    </div>
                                </div>
                            @endif
                        </div>
                    @endforeach
                </div>
            @else
                <!-- Empty State -->
                <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center shadow-sm">
                    <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <span class="material-icons-round text-gray-400 dark:text-gray-400 text-3xl">campaign</span>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Promotions Yet</h3>
                    <p class="text-gray-600 dark:text-gray-400 mb-6">Start promoting your music to reach more listeners</p>
                    <button @click="openCreatePromotion()" 
                            class="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-medium text-white transition-colors">
                        <span class="material-icons-round text-sm">campaign</span>
                        Create Your First Promotion
                    </button>
                </div>
            @endif
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
            <!-- Quick Actions -->
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                <div class="space-y-3">
                    <button @click="openCreatePromotion()"
                            class="w-full flex items-center gap-3 p-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                        <span class="material-icons-round text-white">campaign</span>
                        <span class="text-white font-medium">Create Promotion</span>
                    </button>
                    <a href="{{ route('frontend.artist.upload.create') }}"
                       class="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                        <span class="material-icons-round text-gray-600 dark:text-gray-300">cloud_upload</span>
                        <span class="text-gray-700 dark:text-gray-300 font-medium">Upload Music</span>
                    </a>
                    <a href="{{ route('frontend.artist.music.index') }}"
                       class="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                        <span class="material-icons-round text-gray-600 dark:text-gray-300">library_music</span>
                        <span class="text-gray-700 dark:text-gray-300 font-medium">Music Library</span>
                    </a>
                    <a href="{{ route('frontend.artist.rights.index') }}"
                       class="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                        <span class="material-icons-round text-gray-600 dark:text-gray-300">gavel</span>
                        <span class="text-gray-700 dark:text-gray-300 font-medium">Rights & Royalties</span>
                    </a>
                </div>
            </div>

            <!-- Promotion Tips -->
            <div class="bg-gradient-to-br from-green-100 dark:from-green-900/50 to-blue-100 dark:to-blue-900/50 rounded-xl p-6 border border-green-200 dark:border-green-700/50 shadow-sm">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Promotion Tips</h3>
                <div class="space-y-3">
                    <div class="flex items-start gap-3">
                        <span class="material-icons-round text-green-600 dark:text-green-400 text-sm mt-0.5">lightbulb</span>
                        <div>
                            <p class="text-gray-900 dark:text-white text-sm font-medium">Target Your Audience</p>
                            <p class="text-gray-600 dark:text-gray-300 text-xs">Use demographic targeting for better results</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3">
                        <span class="material-icons-round text-blue-600 dark:text-blue-400 text-sm mt-0.5">schedule</span>
                        <div>
                            <p class="text-gray-900 dark:text-white text-sm font-medium">Timing Matters</p>
                            <p class="text-gray-600 dark:text-gray-300 text-xs">Promote during peak listening hours</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3">
                        <span class="material-icons-round text-purple-600 dark:text-purple-400 text-sm mt-0.5">trending_up</span>
                        <div>
                            <p class="text-gray-900 dark:text-white text-sm font-medium">Track Performance</p>
                            <p class="text-gray-600 dark:text-gray-300 text-xs">Monitor metrics and adjust campaigns</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Campaign Summary -->
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Campaign Summary</h3>
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <span class="w-3 h-3 rounded-full bg-green-500"></span>
                            <span class="text-gray-600 dark:text-gray-300 text-sm">Active</span>
                        </div>
                        <span class="text-gray-900 dark:text-white font-medium">{{ $counts['active'] ?? 0 }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <span class="w-3 h-3 rounded-full bg-blue-500"></span>
                            <span class="text-gray-600 dark:text-gray-300 text-sm">Scheduled</span>
                        </div>
                        <span class="text-gray-900 dark:text-white font-medium">{{ $counts['scheduled'] ?? 0 }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <span class="w-3 h-3 rounded-full bg-yellow-500"></span>
                            <span class="text-gray-600 dark:text-gray-300 text-sm">Paused</span>
                        </div>
                        <span class="text-gray-900 dark:text-white font-medium">{{ $counts['paused'] ?? 0 }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <span class="w-3 h-3 rounded-full bg-gray-500"></span>
                            <span class="text-gray-600 dark:text-gray-300 text-sm">Completed</span>
                        </div>
                        <span class="text-gray-900 dark:text-white font-medium">{{ $counts['completed'] ?? 0 }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
function promotionsPage() {
    return {
        currentTab: 'all',
        
        openCreatePromotion() {
            // Navigate to create promotion page or open modal
            alert('Create promotion functionality to be implemented');
        }
    }
}
</script>
@endpush
@endsection
