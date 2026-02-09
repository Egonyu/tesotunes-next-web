@extends('layouts.app')

@section('title', 'Music Uploads')

@section('left-sidebar')
    @include('frontend.partials.artist-left-sidebar')
@endsection

@push('styles')
<style>
    .glass-panel {
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(0, 0, 0, 0.08);
    }
    .dark .glass-panel {
        background: rgba(22, 27, 34, 0.7);
        border: 1px solid rgba(48, 54, 61, 0.5);
    }
</style>
@endpush

@section('content')
<div class="max-w-6xl mx-auto space-y-8" x-data="uploadDashboard()">
    <!-- Page Header -->
    <div class="glass-panel rounded-2xl p-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Music Uploads</h1>
                <p class="text-gray-500 dark:text-gray-400 mt-1">Manage your uploaded tracks and create songs</p>
            </div>
            <div class="flex items-center gap-3">
                <a href="{{ route('frontend.artist.music.index') }}"
                   class="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-4 py-2 rounded-xl text-gray-700 dark:text-white transition-colors">
                    <span class="material-symbols-outlined text-lg">library_music</span>
                    My Music
                </a>
                <a href="{{ route('frontend.artist.upload.create') }}"
                   class="flex items-center gap-2 bg-brand text-white hover:bg-green-600 px-4 py-2 rounded-xl transition-colors">
                    <span class="material-symbols-outlined text-lg">cloud_upload</span>
                    Upload New
                </a>
            </div>
        </div>
    </div>

    <!-- Success/Error Messages -->
    @if(session('success'))
        <div class="bg-green-500/10 border border-green-500/30 text-green-500 dark:text-green-400 px-6 py-4 rounded-xl flex items-center gap-3" role="alert">
            <span class="material-symbols-outlined">check_circle</span>
            <span>{{ session('success') }}</span>
            <button type="button" onclick="this.parentElement.remove()" class="ml-auto hover:text-green-300">
                <span class="material-symbols-outlined">close</span>
            </button>
        </div>
    @endif

    @if(session('error'))
        <div class="bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 px-6 py-4 rounded-xl flex items-center gap-3" role="alert">
            <span class="material-symbols-outlined">error</span>
            <span>{{ session('error') }}</span>
            <button type="button" onclick="this.parentElement.remove()" class="ml-auto hover:text-red-300">
                <span class="material-symbols-outlined">close</span>
            </button>
        </div>
    @endif

    @if($errors->any())
        <div class="bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 px-6 py-4 rounded-xl" role="alert">
            <div class="flex items-center gap-3 mb-2">
                <span class="material-symbols-outlined">error</span>
                <span class="font-bold">Please fix the following errors:</span>
            </div>
            <ul class="list-disc list-inside space-y-1 text-sm">
                @foreach($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <!-- Quick Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Total Uploads -->
        <div class="glass-panel rounded-xl p-5">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <span class="material-symbols-outlined text-blue-500">cloud_upload</span>
                </div>
                <div>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ number_format($stats['total_uploads']) }}</p>
                    <p class="text-gray-500 dark:text-gray-400 text-sm">Total Uploads</p>
                </div>
            </div>
        </div>

        <!-- Pending Review -->
        <div class="glass-panel rounded-xl p-5">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <span class="material-symbols-outlined text-orange-500">schedule</span>
                </div>
                <div>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ number_format($stats['pending_review']) }}</p>
                    <p class="text-gray-500 dark:text-gray-400 text-sm">Processing</p>
                </div>
            </div>
        </div>

        <!-- Approved -->
        <div class="glass-panel rounded-xl p-5">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <span class="material-symbols-outlined text-green-500">check_circle</span>
                </div>
                <div>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ number_format($stats['approved']) }}</p>
                    <p class="text-gray-500 dark:text-gray-400 text-sm">Processed</p>
                </div>
            </div>
        </div>

        <!-- Songs Created -->
        <div class="glass-panel rounded-xl p-5">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <span class="material-symbols-outlined text-purple-500">library_music</span>
                </div>
                <div>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ number_format($stats['songs_created']) }}</p>
                    <p class="text-gray-500 dark:text-gray-400 text-sm">Songs Created</p>
                </div>
            </div>
        </div>
    </div>
                <p class="text-gray-400 text-sm">Approved</p>
            </div>
        </div>

        <!-- Songs Created -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                    <span class="material-icons-round text-purple-500">library_music</span>
                </div>
            </div>
            <div>
                <p class="text-2xl font-bold text-white">{{ number_format($stats['songs_created']) }}</p>
                <p class="text-gray-400 text-sm">Songs Created</p>
            </div>
        </div>
    </div>

    <!-- Content Grid -->
    <div class="grid lg:grid-cols-4 gap-6">
        <!-- Main Content (Uploads List) -->
        <div class="lg:col-span-3 space-y-6">
            <!-- Uploads Table -->
            <div class="glass-panel rounded-2xl overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-[#30363D]">
                    <div class="flex items-center justify-between">
                        <h2 class="text-lg font-bold text-gray-900 dark:text-white">Recent Uploads</h2>
                        <select class="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand focus:border-transparent">
                            <option value="">All Status</option>
                            <option value="processing">Processing</option>
                            <option value="processed">Processed</option>
                            <option value="failed">Failed</option>
                            <option value="converted_to_song">Converted to Song</option>
                        </select>
                    </div>
                </div>

                @if($uploads->count() > 0)
                    <div class="divide-y divide-gray-200 dark:divide-[#30363D]">
                        @foreach($uploads as $upload)
                            <div class="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-4">
                                        <div class="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                                            @if($upload->processing_status === 'processed')
                                                <span class="material-symbols-outlined text-green-500">library_music</span>
                                            @elseif($upload->processing_status === 'processing')
                                                <span class="material-symbols-outlined text-orange-500 animate-spin">progress_activity</span>
                                            @elseif($upload->processing_status === 'failed')
                                                <span class="material-symbols-outlined text-red-500">error</span>
                                            @else
                                                <span class="material-symbols-outlined text-gray-400 dark:text-gray-500">cloud_upload</span>
                                            @endif
                                        </div>
                                        <div class="min-w-0">
                                            <h4 class="font-medium text-gray-900 dark:text-white truncate">{{ $upload->original_filename }}</h4>
                                            <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                @if($upload->processing_status === 'processed')
                                                    <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                                        <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                        Processed
                                                    </span>
                                                @elseif($upload->processing_status === 'processing')
                                                    <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                                                        <span class="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                                                        Processing
                                                    </span>
                                                @elseif($upload->processing_status === 'failed')
                                                    <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                                                        <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                                        Failed
                                                    </span>
                                                @else
                                                    <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                                        {{ ucfirst($upload->processing_status) }}
                                                    </span>
                                                @endif
                                                <span>•</span>
                                                <span>{{ $upload->created_at->diffForHumans() }}</span>
                                                @if($upload->file_size_bytes)
                                                    <span class="hidden sm:inline">•</span>
                                                    <span class="hidden sm:inline">{{ number_format($upload->file_size_bytes / (1024*1024), 1) }} MB</span>
                                                @endif
                                            </div>
                                            @if($upload->processing_status === 'processing' && $upload->processing_progress)
                                                <div class="mt-2 w-48">
                                                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                        <div class="bg-brand h-2 rounded-full transition-all duration-300"
                                                             style="width: {{ $upload->processing_progress }}%"></div>
                                                    </div>
                                                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ $upload->processing_progress }}% complete</p>
                                                </div>
                                            @endif
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        @if($upload->song)
                                            <a href="{{ route('frontend.artist.music.show', $upload->song) }}"
                                               class="flex items-center gap-1 bg-brand hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                                                <span class="material-symbols-outlined text-sm">visibility</span>
                                                View Song
                                            </a>
                                        @elseif($upload->isReadyForSongCreation())
                                            <a href="{{ route('frontend.artist.upload.create-song', $upload) }}"
                                               class="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                                                <span class="material-symbols-outlined text-sm">add</span>
                                                Create Song
                                            </a>
                                        @endif
                                        <a href="{{ route('frontend.artist.upload.show', $upload) }}"
                                           class="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                                            <span class="material-symbols-outlined text-sm">info</span>
                                            Details
                                        </a>
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>

                    <!-- Pagination -->
                    @if($uploads->hasPages())
                        <div class="px-6 py-4 border-t border-gray-200 dark:border-[#30363D]">
                            {{ $uploads->links() }}
                        </div>
                    @endif
                @else
                    <div class="px-6 py-16 text-center">
                        <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                            <span class="material-symbols-outlined text-gray-400 text-3xl">cloud_upload</span>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No uploads yet</h3>
                        <p class="text-gray-500 dark:text-gray-400 mb-6">Start by uploading your first track to get started.</p>
                        <a href="{{ route('frontend.artist.upload.create') }}"
                           class="inline-flex items-center gap-2 bg-brand hover:bg-green-600 px-6 py-3 rounded-xl font-medium text-white transition-colors">
                            <span class="material-symbols-outlined">cloud_upload</span>
                            Upload Your First Track
                        </a>
                    </div>
                @endif
            </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
            <!-- Quick Actions -->
            <div class="glass-panel rounded-2xl p-5">
                <h3 class="text-base font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                <div class="space-y-2">
                    <a href="{{ route('frontend.artist.upload.create') }}"
                       class="flex items-center gap-3 p-3 bg-brand hover:bg-green-600 rounded-xl transition-colors">
                        <span class="material-symbols-outlined text-white">cloud_upload</span>
                        <span class="text-white font-medium">Upload Music</span>
                    </a>
                    <a href="{{ route('frontend.artist.albums', auth()->user()->artist ?? auth()->user()) }}"
                       class="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors">
                        <span class="material-symbols-outlined text-gray-600 dark:text-gray-300">album</span>
                        <span class="text-gray-700 dark:text-gray-300 font-medium">Create Album</span>
                    </a>
                    @if(auth()->user()->store)
                        <a href="{{ route('esokoni.my-store.index') }}"
                           class="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors">
                            <span class="material-symbols-outlined text-gray-600 dark:text-gray-300">storefront</span>
                            <span class="text-gray-700 dark:text-gray-300 font-medium">Business Hub</span>
                        </a>
                    @else
                        <a href="{{ route('frontend.store.create') }}"
                           class="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors">
                            <span class="material-symbols-outlined text-gray-600 dark:text-gray-300">storefront</span>
                            <span class="text-gray-700 dark:text-gray-300 font-medium">Create Store</span>
                        </a>
                    @endif
                    <a href="{{ route('frontend.artist.rights.index') }}"
                       class="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors">
                        <span class="material-symbols-outlined text-gray-600 dark:text-gray-300">gavel</span>
                        <span class="text-gray-700 dark:text-gray-300 font-medium">Rights & Royalties</span>
                    </a>
                </div>
            </div>

            <!-- Upload Status Summary -->
            <div class="glass-panel rounded-2xl p-5">
                <h3 class="text-base font-bold text-gray-900 dark:text-white mb-4">Upload Status</h3>
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <span class="w-3 h-3 rounded-full bg-green-500"></span>
                            <span class="text-gray-600 dark:text-gray-300 text-sm">Processed</span>
                        </div>
                        <span class="text-gray-900 dark:text-white font-medium">{{ $stats['approved'] }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <span class="w-3 h-3 rounded-full bg-orange-500"></span>
                            <span class="text-gray-600 dark:text-gray-300 text-sm">Processing</span>
                        </div>
                        <span class="text-gray-900 dark:text-white font-medium">{{ $stats['pending_review'] }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <span class="w-3 h-3 rounded-full bg-purple-500"></span>
                            <span class="text-gray-600 dark:text-gray-300 text-sm">Songs Created</span>
                        </div>
                        <span class="text-gray-900 dark:text-white font-medium">{{ $stats['songs_created'] }}</span>
                    </div>
                </div>
            </div>

            <!-- Upload Tips -->
            <div class="bg-gradient-to-br from-blue-500/10 to-emerald-500/10 dark:from-blue-900/50 dark:to-green-900/50 rounded-2xl p-5 border border-blue-200/50 dark:border-blue-700/50">
                <h3 class="text-base font-bold text-gray-900 dark:text-white mb-4">Upload Tips</h3>
                <div class="space-y-3">
                    <div class="flex items-start gap-3">
                        <span class="material-symbols-outlined text-blue-500 text-sm mt-0.5">high_quality</span>
                        <div>
                            <p class="text-gray-900 dark:text-white text-sm font-medium">High Quality Audio</p>
                            <p class="text-gray-600 dark:text-gray-400 text-xs">Upload WAV or high-bitrate MP3 files</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3">
                        <span class="material-symbols-outlined text-green-500 text-sm mt-0.5">image</span>
                        <div>
                            <p class="text-gray-900 dark:text-white text-sm font-medium">Album Artwork</p>
                            <p class="text-gray-600 dark:text-gray-400 text-xs">Add cover art for better visibility</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3">
                        <span class="material-symbols-outlined text-purple-500 text-sm mt-0.5">label</span>
                        <div>
                            <p class="text-gray-900 dark:text-white text-sm font-medium">Complete Metadata</p>
                            <p class="text-gray-600 dark:text-gray-400 text-xs">Fill in all song details for discoverability</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
function uploadDashboard() {
    return {
        // Dashboard functionality
    }
}

// Auto-refresh processing uploads every 30 seconds
const processingUploads = document.querySelectorAll('[data-status="processing"]');
if (processingUploads.length > 0) {
    setTimeout(() => {
        window.location.reload();
    }, 30000);
}
</script>
@endpush
@endsection
