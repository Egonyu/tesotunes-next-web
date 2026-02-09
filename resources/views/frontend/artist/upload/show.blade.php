@extends('frontend.layouts.artist')

@section('title', 'Upload Details - ' . $upload->original_filename)

@section('artist-content')
<div x-data="uploadDetails()">
    <!-- Page Header -->
    <div class="mb-8">
        <div class="flex items-center justify-between">
            <div>
                <div class="flex items-center gap-3 mb-2">
                    <a href="{{ route('frontend.artist.upload.index') }}"
                       class="text-gray-400 hover:text-white transition-colors">
                        <span class="material-icons-round">arrow_back</span>
                    </a>
                    <h1 class="text-3xl font-bold text-white">Upload Details</h1>
                </div>
                <p class="text-gray-400">{{ $upload->original_filename }}</p>
            </div>
            <div class="flex items-center gap-3">
                @if($upload->song)
                    <a href="{{ route('frontend.artist.music.show', $upload->song) }}"
                       class="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-full font-medium text-white transition-colors">
                        <span class="material-icons-round text-sm">visibility</span>
                        View Song
                    </a>
                @elseif($upload->isReadyForSongCreation())
                    <a href="{{ route('frontend.artist.upload.create-song', $upload) }}"
                       class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full font-medium text-white transition-colors">
                        <span class="material-icons-round text-sm">add</span>
                        Create Song
                    </a>
                @endif
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

    @if(session('error'))
        <div class="bg-red-600/10 border border-red-600/20 rounded-lg p-4 mb-8">
            <div class="flex items-center gap-3">
                <span class="material-icons-round text-red-500">error</span>
                <p class="text-red-400 font-medium">{{ session('error') }}</p>
            </div>
        </div>
    @endif

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Upload Information -->
        <div class="bg-gray-800 rounded-lg border border-gray-700">
            <div class="border-b border-gray-700 p-6">
                <h3 class="text-xl font-bold text-white flex items-center gap-2">
                    <span class="material-icons-round text-blue-500">info</span>
                    Upload Information
                </h3>
            </div>
            <div class="p-6 space-y-4">
                <!-- Status -->
                <div class="flex items-center justify-between">
                    <span class="text-gray-400">Status:</span>
                    <div class="flex items-center gap-2">
                        @if($upload->processing_status === 'processed')
                            <span class="material-icons-round text-green-500 text-sm">check_circle</span>
                            <span class="text-green-500 font-medium">Processed</span>
                        @elseif($upload->processing_status === 'processing')
                            <span class="material-icons-round text-orange-500 text-sm animate-spin">refresh</span>
                            <span class="text-orange-500 font-medium">Processing</span>
                        @elseif($upload->processing_status === 'failed')
                            <span class="material-icons-round text-red-500 text-sm">error</span>
                            <span class="text-red-500 font-medium">Failed</span>
                        @elseif($upload->processing_status === 'converted_to_song')
                            <span class="material-icons-round text-purple-500 text-sm">library_music</span>
                            <span class="text-purple-500 font-medium">Converted to Song</span>
                        @else
                            <span class="material-icons-round text-gray-400 text-sm">cloud_upload</span>
                            <span class="text-gray-400 font-medium">{{ ucfirst($upload->processing_status) }}</span>
                        @endif
                    </div>
                </div>

                <!-- Progress Bar -->
                @if($upload->processing_status === 'processing' && $upload->processing_progress)
                    <div>
                        <div class="flex justify-between text-sm mb-2">
                            <span class="text-gray-400">Progress:</span>
                            <span class="text-white">{{ $upload->processing_progress }}%</span>
                        </div>
                        <div class="w-full bg-gray-600 rounded-full h-2">
                            <div class="bg-green-500 h-2 rounded-full transition-all duration-300"
                                 style="width: {{ $upload->processing_progress }}%"></div>
                        </div>
                    </div>
                @endif

                <!-- File Details -->
                <div class="flex items-center justify-between">
                    <span class="text-gray-400">File Size:</span>
                    <span class="text-white">
                        @if($upload->file_size_bytes)
                            {{ number_format($upload->file_size_bytes / (1024*1024), 2) }} MB
                        @else
                            Unknown
                        @endif
                    </span>
                </div>

                <div class="flex items-center justify-between">
                    <span class="text-gray-400">Format:</span>
                    <span class="text-white">{{ strtoupper($upload->file_extension ?? 'Unknown') }}</span>
                </div>

                <div class="flex items-center justify-between">
                    <span class="text-gray-400">Upload Type:</span>
                    <span class="text-white">{{ ucfirst($upload->upload_type ?? 'Single') }}</span>
                </div>

                <div class="flex items-center justify-between">
                    <span class="text-gray-400">Uploaded:</span>
                    <span class="text-white">{{ $upload->created_at->format('M d, Y \a\t g:i A') }}</span>
                </div>

                @if($upload->upload_completed_at)
                    <div class="flex items-center justify-between">
                        <span class="text-gray-400">Completed:</span>
                        <span class="text-white">{{ $upload->upload_completed_at->format('M d, Y \a\t g:i A') }}</span>
                    </div>
                @endif
            </div>
        </div>

        <!-- Audio Metadata -->
        <div class="bg-gray-800 rounded-lg border border-gray-700">
            <div class="border-b border-gray-700 p-6">
                <h3 class="text-xl font-bold text-white flex items-center gap-2">
                    <span class="material-icons-round text-purple-500">audiotrack</span>
                    Audio Metadata
                </h3>
            </div>
            <div class="p-6 space-y-4">
                @if($upload->duration_seconds)
                    <div class="flex items-center justify-between">
                        <span class="text-gray-400">Duration:</span>
                        <span class="text-white">{{ gmdate('i:s', $upload->duration_seconds) }}</span>
                    </div>
                @endif

                @if($upload->bitrate)
                    <div class="flex items-center justify-between">
                        <span class="text-gray-400">Bitrate:</span>
                        <span class="text-white">{{ $upload->bitrate }} kbps</span>
                    </div>
                @endif

                @if($upload->sample_rate)
                    <div class="flex items-center justify-between">
                        <span class="text-gray-400">Sample Rate:</span>
                        <span class="text-white">{{ number_format($upload->sample_rate) }} Hz</span>
                    </div>
                @endif

                @if($upload->audio_format)
                    <div class="flex items-center justify-between">
                        <span class="text-gray-400">Audio Format:</span>
                        <span class="text-white">{{ strtoupper($upload->audio_format) }}</span>
                    </div>
                @endif

                @if($upload->file_hash)
                    <div class="flex items-center justify-between">
                        <span class="text-gray-400">File Hash:</span>
                        <span class="text-white font-mono text-sm">{{ substr($upload->file_hash, 0, 16) }}...</span>
                    </div>
                @endif

                @if(!$upload->duration_seconds && !$upload->bitrate && !$upload->sample_rate)
                    <div class="text-center py-8">
                        <span class="material-icons-round text-gray-500 text-4xl mb-2">info</span>
                        <p class="text-gray-400">Audio metadata will be available after processing</p>
                    </div>
                @endif
            </div>
        </div>

        <!-- Processing Details -->
        @if($upload->processing_error || $upload->processing_notes)
            <div class="bg-gray-800 rounded-lg border border-gray-700 lg:col-span-2">
                <div class="border-b border-gray-700 p-6">
                    <h3 class="text-xl font-bold text-white flex items-center gap-2">
                        <span class="material-icons-round text-orange-500">build</span>
                        Processing Details
                    </h3>
                </div>
                <div class="p-6 space-y-4">
                    @if($upload->processing_error)
                        <div class="bg-red-600/10 border border-red-600/20 rounded-lg p-4">
                            <div class="flex items-start gap-3">
                                <span class="material-icons-round text-red-500 mt-0.5">error</span>
                                <div>
                                    <h4 class="text-red-400 font-medium mb-2">Processing Error</h4>
                                    <p class="text-red-300 text-sm">{{ $upload->processing_error }}</p>
                                </div>
                            </div>
                        </div>
                    @endif

                    @if($upload->processing_notes)
                        <div class="bg-blue-600/10 border border-blue-600/20 rounded-lg p-4">
                            <div class="flex items-start gap-3">
                                <span class="material-icons-round text-blue-500 mt-0.5">info</span>
                                <div>
                                    <h4 class="text-blue-400 font-medium mb-2">Processing Notes</h4>
                                    <p class="text-blue-300 text-sm">{{ $upload->processing_notes }}</p>
                                </div>
                            </div>
                        </div>
                    @endif
                </div>
            </div>
        @endif

        <!-- Linked Song -->
        @if($upload->song)
            <div class="bg-gray-800 rounded-lg border border-gray-700 lg:col-span-2">
                <div class="border-b border-gray-700 p-6">
                    <h3 class="text-xl font-bold text-white flex items-center gap-2">
                        <span class="material-icons-round text-green-500">library_music</span>
                        Linked Song
                    </h3>
                </div>
                <div class="p-6">
                    <div class="flex items-center justify-between p-4 bg-gray-700 rounded-lg border border-gray-600">
                        <div class="flex items-center space-x-4">
                            <div class="w-12 h-12 rounded-lg bg-green-600/20 flex items-center justify-center">
                                <span class="material-icons-round text-green-500">library_music</span>
                            </div>
                            <div>
                                <h4 class="font-medium text-white">{{ $upload->song->title }}</h4>
                                <p class="text-gray-400 text-sm">{{ $upload->song->artist->name }}</p>
                                @if($upload->song->album)
                                    <p class="text-gray-500 text-xs">{{ $upload->song->album->title }}</p>
                                @endif
                            </div>
                        </div>
                        <div class="flex items-center space-x-2">
                            <span class="px-2 py-1 bg-{{ $upload->song->status === 'published' ? 'green' : 'orange' }}-600/20
                                         text-{{ $upload->song->status === 'published' ? 'green' : 'orange' }}-400
                                         text-xs rounded-full">
                                {{ ucfirst($upload->song->status) }}
                            </span>
                            <a href="{{ route('frontend.artist.music.show', $upload->song) }}"
                               class="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                                <span class="material-icons-round text-sm">visibility</span>
                                View Song
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        @endif
    </div>
</div>

@push('scripts')
<script>
    function uploadDetails() {
        return {
            // Upload details functionality
        }
    }

    // Auto-refresh if still processing
    @if($upload->processing_status === 'processing')
        setTimeout(() => {
            window.location.reload();
        }, 30000);
    @endif
</script>
@endpush
@endsection