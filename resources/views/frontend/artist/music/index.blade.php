@extends('layouts.app')

@section('title', 'My Music')

@section('left-sidebar')
    @include('frontend.partials.modern-left-sidebar')
@endsection

@section('content')
<div x-data="musicLibrary()">
    <!-- Page Header -->
    <div class="mb-8">
        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Music Library</h1>
                <p class="text-gray-600 dark:text-gray-400">Manage and organize your music catalog</p>
            </div>
            <div class="flex items-center gap-3">
                <a href="{{ route('frontend.artist.analytics') }}"
                   class="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-4 py-2 rounded-lg text-gray-900 dark:text-white transition-colors">
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

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Tracks -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-purple-100 dark:bg-purple-600/20 rounded-lg flex items-center justify-center">
                    <span class="material-icons-round text-purple-600 dark:text-purple-500">library_music</span>
                </div>
            </div>
            <div>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ number_format($stats['total_songs']) }}</p>
                <p class="text-gray-600 dark:text-gray-400 text-sm">Total Tracks</p>
            </div>
        </div>

        <!-- Published -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-green-100 dark:bg-green-600/20 rounded-lg flex items-center justify-center">
                    <span class="material-icons-round text-green-600 dark:text-green-500">check_circle</span>
                </div>
            </div>
            <div>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ number_format($stats['published_songs']) }}</p>
                <p class="text-gray-600 dark:text-gray-400 text-sm">Published</p>
            </div>
        </div>

        <!-- Total Streams -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-blue-100 dark:bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <span class="material-icons-round text-blue-600 dark:text-blue-500">play_arrow</span>
                </div>
            </div>
            <div>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ number_format($stats['total_plays']) }}</p>
                <p class="text-gray-600 dark:text-gray-400 text-sm">Total Streams</p>
            </div>
        </div>

        <!-- Revenue -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-orange-100 dark:bg-orange-600/20 rounded-lg flex items-center justify-center">
                    <span class="material-icons-round text-orange-600 dark:text-orange-500">monetization_on</span>
                </div>
            </div>
            <div>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">${{ number_format($stats['total_revenue'], 2) }}</p>
                <p class="text-gray-600 dark:text-gray-400 text-sm">Total Revenue</p>
            </div>
        </div>
    </div>

    <!-- Content Grid -->
    <div class="grid lg:grid-cols-4 gap-8">
        <!-- Main Content (Tracks Table) -->
        <div class="lg:col-span-3 space-y-6">
            <!-- Filters & Search -->
            <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <!-- Tabs -->
                    <div class="flex items-center gap-1 border-b border-gray-200 dark:border-gray-700 md:border-0">
                        <button @click="currentTab = 'all'" 
                                :class="currentTab === 'all' ? 'bg-green-100 dark:bg-green-600/10 text-green-700 dark:text-green-500 border-green-500' : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white'"
                                class="px-4 py-2 text-sm font-medium border-b-2 md:border-b-0 md:rounded-lg transition-colors">
                            All ({{ $stats['total_songs'] }})
                        </button>
                        <button @click="currentTab = 'published'" 
                                :class="currentTab === 'published' ? 'bg-green-100 dark:bg-green-600/10 text-green-700 dark:text-green-500 border-green-500' : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white'"
                                class="px-4 py-2 text-sm font-medium border-b-2 md:border-b-0 md:rounded-lg transition-colors">
                            Published ({{ $stats['published_songs'] }})
                        </button>
                        <button @click="currentTab = 'pending'" 
                                :class="currentTab === 'pending' ? 'bg-green-100 dark:bg-green-600/10 text-green-700 dark:text-green-500 border-green-500' : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white'"
                                class="px-4 py-2 text-sm font-medium border-b-2 md:border-b-0 md:rounded-lg transition-colors flex items-center gap-2">
                            Pending
                            @if($stats['pending_songs'] > 0)
                                <span class="bg-orange-100 dark:bg-orange-600/20 text-orange-600 dark:text-orange-500 text-xs px-2 py-0.5 rounded-full">{{ $stats['pending_songs'] }}</span>
                            @endif
                        </button>
                    </div>

                    <!-- Search & Filter -->
                    <div class="flex items-center gap-3">
                        <div class="relative">
                            <span class="material-icons-round absolute left-3 top-2.5 text-gray-400 dark:text-gray-400 text-sm">search</span>
                            <input x-model="searchQuery" 
                                   type="text" 
                                   placeholder="Search tracks..." 
                                   class="w-full md:w-64 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg pl-10 pr-4 py-2 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder-gray-500 dark:placeholder-gray-400">
                        </div>
                        <select x-model="genreFilter" 
                                class="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500">
                            <option value="">All Genres</option>
                            @foreach($genres as $genre)
                                <option value="{{ $genre->id }}">{{ $genre->name }}</option>
                            @endforeach
                        </select>
                    </div>
                </div>
            </div>

            <!-- Tracks Table -->
            <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead>
                            <tr class="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                <th class="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    <input type="checkbox" id="select-all" class="rounded bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-green-600 focus:ring-green-500">
                                </th>
                                <th class="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Track</th>
                                <th class="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden xl:table-cell">Genre</th>
                                <th class="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Release Date</th>
                                <th class="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th class="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Streams</th>
                                <th class="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                            @forelse($tracks as $track)
                                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group track-row"
                                    data-track-id="{{ $track['id'] }}"
                                    data-title="{{ strtolower($track['title']) }}"
                                    data-genre="{{ $track['genre']['id'] ?? '' }}"
                                    data-status="{{ $track['status'] }}">
                                    <td class="px-4 py-3">
                                        <input type="checkbox" value="{{ $track['id'] }}" class="track-checkbox rounded bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-green-600 focus:ring-green-500">
                                    </td>
                                    <td class="px-4 py-3">
                                        <div class="flex items-center gap-3">
                                            <div class="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                                                @if($track['artwork'])
                                                    <img src="{{ $track['artwork'] }}" alt="{{ $track['title'] }}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">
                                                @else
                                                    <div class="w-full h-full flex items-center justify-center">
                                                        <span class="material-icons-round text-gray-400 dark:text-gray-500">music_note</span>
                                                    </div>
                                                @endif
                                                <div class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onclick="playTrack({{ $track['id'] }})" class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-500 transition-colors">
                                                        <span class="material-icons-round text-white text-lg">play_arrow</span>
                                                    </button>
                                                </div>
                                            </div>
                                            <div class="min-w-0">
                                                <p class="text-gray-900 dark:text-white font-medium truncate group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{{ $track['title'] }}</p>
                                                <p class="text-gray-500 dark:text-gray-400 text-sm truncate">{{ $track['artist_name'] }}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-4 py-3 hidden xl:table-cell">
                                        @if($track['genre'])
                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                                {{ $track['genre']['name'] }}
                                            </span>
                                        @else
                                            <span class="text-gray-400 dark:text-gray-500">-</span>
                                        @endif
                                    </td>
                                    <td class="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm hidden md:table-cell">{{ $track['created_at'] }}</td>
                                    <td class="px-4 py-3">
                                        @if($track['status'] === 'published')
                                            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-600/10 text-green-700 dark:text-green-500 border border-green-200 dark:border-green-600/20">
                                                <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                Live
                                            </span>
                                        @elseif($track['status'] === 'pending' || $track['status'] === 'pending_review')
                                            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-600/10 text-orange-700 dark:text-orange-500 border border-orange-200 dark:border-orange-600/20">
                                                <span class="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                                                Pending
                                            </span>
                                        @elseif($track['status'] === 'draft')
                                            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
                                                Draft
                                            </span>
                                        @else
                                            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
                                                {{ ucfirst($track['status']) }}
                                            </span>
                                        @endif
                                    </td>
                                    <td class="px-4 py-3 text-right">
                                        <span class="text-gray-900 dark:text-white font-medium">{{ number_format($track['play_count'] ?? 0) }}</span>
                                    </td>
                                    <td class="px-4 py-3">
                                        <div class="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <a href="{{ route('frontend.artist.music.edit', $track['id']) }}" 
                                               class="p-2 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-600/10 rounded-lg transition-colors"
                                               title="Edit">
                                                <span class="material-icons-round text-sm">edit</span>
                                            </a>
                                            <button onclick="deleteTrack({{ $track['id'] }}, '{{ addslashes($track['title']) }}')"
                                                    class="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-600/10 rounded-lg transition-colors"
                                                    title="Delete">
                                                <span class="material-icons-round text-sm">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="7" class="px-4 py-12 text-center">
                                        <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <span class="material-icons-round text-gray-400 dark:text-gray-400 text-2xl">library_music</span>
                                        </div>
                                        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No tracks yet</h3>
                                        <p class="text-gray-500 dark:text-gray-400 mb-6">Upload your first track to get started</p>
                                        <a href="{{ route('frontend.artist.upload.create') }}" 
                                           class="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-medium text-white transition-colors">
                                            <span class="material-icons-round text-sm">add</span>
                                            Upload Your First Track
                                        </a>
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>

                @if(count($tracks) > 0)
                    <div class="px-4 py-3 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                            Showing <span class="font-medium text-gray-900 dark:text-white" id="showing-count">{{ count($tracks) }}</span> 
                            of <span class="font-medium text-gray-900 dark:text-white" id="total-count">{{ count($tracks) }}</span> tracks
                        </p>
                    </div>
                @endif
            </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
            <!-- Quick Actions -->
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                <div class="space-y-3">
                    <a href="{{ route('frontend.artist.upload.create') }}"
                       class="flex items-center gap-3 p-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                        <span class="material-icons-round text-white">cloud_upload</span>
                        <span class="text-white font-medium">Upload Music</span>
                    </a>
                    <a href="{{ route('frontend.artist.albums', auth()->user()->artist ?? auth()->user()) }}"
                       class="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                        <span class="material-icons-round text-gray-700 dark:text-gray-300">album</span>
                        <span class="text-gray-700 dark:text-gray-300 font-medium">Create Album</span>
                    </a>
                    @if(auth()->user()->store)
                        <a href="{{ route('esokoni.my-store.index') }}"
                           class="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                            <span class="material-icons-round text-gray-700 dark:text-gray-300">storefront</span>
                            <span class="text-gray-700 dark:text-gray-300 font-medium">Business Hub</span>
                        </a>
                    @else
                        <a href="{{ route('frontend.store.create') }}"
                           class="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                            <span class="material-icons-round text-gray-700 dark:text-gray-300">storefront</span>
                            <span class="text-gray-700 dark:text-gray-300 font-medium">Create Store</span>
                        </a>
                    @endif
                    <a href="{{ route('frontend.artist.rights.index') }}"
                       class="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                        <span class="material-icons-round text-gray-700 dark:text-gray-300">gavel</span>
                        <span class="text-gray-700 dark:text-gray-300 font-medium">Rights & Royalties</span>
                    </a>
                </div>
            </div>

            <!-- Track Status Summary -->
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Track Status</h3>
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <span class="w-3 h-3 rounded-full bg-green-500"></span>
                            <span class="text-gray-700 dark:text-gray-300 text-sm">Published</span>
                        </div>
                        <span class="text-gray-900 dark:text-white font-medium">{{ $stats['published_songs'] }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <span class="w-3 h-3 rounded-full bg-orange-500"></span>
                            <span class="text-gray-700 dark:text-gray-300 text-sm">Pending Review</span>
                        </div>
                        <span class="text-gray-900 dark:text-white font-medium">{{ $stats['pending_songs'] }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <span class="w-3 h-3 rounded-full bg-gray-500"></span>
                            <span class="text-gray-700 dark:text-gray-300 text-sm">Draft</span>
                        </div>
                        <span class="text-gray-900 dark:text-white font-medium">{{ $stats['draft_songs'] ?? 0 }}</span>
                    </div>
                </div>
            </div>

            <!-- Tips -->
            <div class="bg-gradient-to-br from-purple-100 dark:from-purple-900/50 to-blue-100 dark:to-blue-900/50 rounded-lg p-6 border border-purple-200 dark:border-purple-700/50 shadow-sm">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Pro Tips</h3>
                <div class="space-y-3">
                    <div class="flex items-start gap-3">
                        <span class="material-icons-round text-purple-600 dark:text-purple-400 text-sm mt-0.5">lightbulb</span>
                        <div>
                            <p class="text-gray-900 dark:text-white text-sm font-medium">Quality Artwork</p>
                            <p class="text-gray-600 dark:text-gray-300 text-xs">Use high-resolution album art to attract listeners</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3">
                        <span class="material-icons-round text-blue-600 dark:text-blue-400 text-sm mt-0.5">schedule</span>
                        <div>
                            <p class="text-gray-900 dark:text-white text-sm font-medium">Consistent Releases</p>
                            <p class="text-gray-600 dark:text-gray-300 text-xs">Regular uploads help grow your audience</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3">
                        <span class="material-icons-round text-green-600 dark:text-green-400 text-sm mt-0.5">tag</span>
                        <div>
                            <p class="text-gray-900 dark:text-white text-sm font-medium">Good Metadata</p>
                            <p class="text-gray-600 dark:text-gray-300 text-xs">Detailed tags improve discoverability</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
function musicLibrary() {
    return {
        currentTab: 'all',
        searchQuery: '',
        genreFilter: '',
        
        init() {
            // Set up watchers for filtering
            this.$watch('currentTab', () => this.filterTracks());
            this.$watch('searchQuery', () => this.filterTracks());
            this.$watch('genreFilter', () => this.filterTracks());
            
            // Setup select all checkbox
            this.setupSelectAll();
        },
        
        filterTracks() {
            const rows = document.querySelectorAll('.track-row');
            let visibleCount = 0;
            
            rows.forEach(row => {
                const title = row.dataset.title;
                const genre = row.dataset.genre;
                const status = row.dataset.status;
                
                // Tab filter
                let matchesTab = true;
                if (this.currentTab === 'published') {
                    matchesTab = status === 'published';
                } else if (this.currentTab === 'pending') {
                    matchesTab = status === 'pending' || status === 'pending_review';
                }
                
                // Search filter
                const matchesSearch = !this.searchQuery || title.includes(this.searchQuery.toLowerCase());
                
                // Genre filter
                const matchesGenre = !this.genreFilter || genre === this.genreFilter;
                
                if (matchesTab && matchesSearch && matchesGenre) {
                    row.style.display = '';
                    visibleCount++;
                } else {
                    row.style.display = 'none';
                }
            });
            
            document.getElementById('showing-count').textContent = visibleCount;
        },
        
        setupSelectAll() {
            const selectAll = document.getElementById('select-all');
            const checkboxes = document.querySelectorAll('.track-checkbox');
            
            if (selectAll) {
                selectAll.addEventListener('change', function() {
                    checkboxes.forEach(cb => cb.checked = this.checked);
                });
            }
        }
    }
}

function playTrack(trackId) {
    console.log('Playing track:', trackId);
    // Integrate with music player
}

function deleteTrack(trackId, trackTitle) {
    if (confirm(`Are you sure you want to delete "${trackTitle}"?`)) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/artist/music/${trackId}`;
        
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_token';
        csrfInput.value = csrfToken;
        
        const methodInput = document.createElement('input');
        methodInput.type = 'hidden';
        methodInput.name = '_method';
        methodInput.value = 'DELETE';
        
        form.appendChild(csrfInput);
        form.appendChild(methodInput);
        document.body.appendChild(form);
        form.submit();
    }
}
</script>
@endpush
@endsection
