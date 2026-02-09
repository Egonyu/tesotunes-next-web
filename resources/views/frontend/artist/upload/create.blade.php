@extends('layouts.app')

@section('title', 'Upload Music')

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
    .upload-zone {
        border: 2px dashed rgba(16, 185, 129, 0.3);
        transition: all 0.3s ease;
    }
    .upload-zone:hover, .upload-zone.dragover {
        border-color: rgba(16, 185, 129, 0.6);
        background: rgba(16, 185, 129, 0.05);
    }
</style>
@endpush

@section('content')
<div class="max-w-4xl mx-auto space-y-8" x-data="uploadForm()" x-init="init()">
    <!-- Page Header -->
    <div class="glass-panel rounded-2xl p-6">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Upload Music</h1>
                <p class="text-gray-500 dark:text-gray-400 mt-1">Upload your tracks and get them ready for distribution</p>
            </div>
            <div class="flex items-center gap-4">
                <a href="{{ route('frontend.artist.upload.index') }}"
                   class="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-4 py-2 rounded-xl text-gray-700 dark:text-white transition-colors">
                    <span class="material-symbols-outlined text-lg">arrow_back</span>
                    Back to Uploads
                </a>
            </div>
        </div>
    </div>

    <!-- Upload Form -->
    <div class="glass-panel rounded-2xl overflow-hidden">
        <div class="border-b border-gray-200 dark:border-[#30363D] p-6">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Upload Your Music</h3>
            <p class="text-gray-500 dark:text-gray-400 mt-1 text-sm">Supported formats: {{ implode(', ', $supportedFormats) }}. Max size: {{ number_format($maxFileSize / (1024*1024)) }}MB</p>
        </div>

        <form action="{{ route('frontend.artist.upload.store') }}" method="POST" enctype="multipart/form-data" class="p-6 space-y-6">
            @csrf

            <input type="hidden" name="upload_type" value="{{ $uploadType }}">
            @if($batchId)
                <input type="hidden" name="batch_id" value="{{ $batchId }}">
            @endif

            <!-- File Upload Area -->
            <div>
                <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">Select Music Files</label>
                <div
                    x-on:dragover.prevent="dragOver = true"
                    x-on:dragleave.prevent="dragOver = false"
                    x-on:drop.prevent="handleDrop($event)"
                    x-bind:class="dragOver ? 'border-brand bg-emerald-500/10' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'"
                    class="upload-zone border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200"
                >
                    <div class="w-20 h-20 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <span class="material-symbols-outlined text-gray-500 dark:text-gray-400 text-4xl">cloud_upload</span>
                    </div>
                    <h4 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Drag & drop your music files here</h4>
                    <p class="text-gray-500 dark:text-gray-400 mb-4">or click to browse and select files</p>

                    <input
                        type="file"
                        name="files[]"
                        id="music_files"
                        multiple
                        accept=".mp3,.wav,.flac,.m4a,.aac"
                        class="hidden"
                        x-on:change="handleFileSelect($event)"
                        required
                    >

                    <button
                        type="button"
                        onclick="document.getElementById('music_files').click()"
                        class="bg-brand hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium inline-flex items-center gap-2 transition-colors"
                    >
                        <span class="material-symbols-outlined">folder_open</span>
                        Browse Files
                    </button>
                </div>

                <!-- Selected Files Display -->
                <div x-show="selectedFiles.length > 0" class="mt-4">
                    <h5 class="text-sm font-medium text-gray-900 dark:text-white mb-2">Selected Files:</h5>
                    <div class="space-y-2">
                        <template x-for="(file, index) in selectedFiles" :key="index">
                            <div class="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                                <div class="flex items-center gap-3">
                                    <span class="material-symbols-outlined text-blue-500">audio_file</span>
                                    <div>
                                        <p class="text-gray-900 dark:text-white font-medium" x-text="file.name"></p>
                                        <p class="text-gray-500 dark:text-gray-400 text-sm" x-text="formatFileSize(file.size)"></p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    x-on:click="removeFile(index)"
                                    class="text-red-500 hover:text-red-400 p-1"
                                >
                                    <span class="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        </template>
                    </div>
                </div>
            </div>

            <!-- Upload Options -->
            <div class="grid md:grid-cols-2 gap-6">
                <!-- Primary Genre -->
                <div>
                    <label for="primary_genre" class="block text-sm font-medium text-gray-900 dark:text-white mb-2">Primary Genre</label>
                    <select name="primary_genre" id="primary_genre" class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all">
                        <option value="">Select a genre</option>
                        @foreach($ugandanGenres as $key => $description)
                            <option value="{{ $key }}">{{ $key }} - {{ $description }}</option>
                        @endforeach
                    </select>
                    @error('primary_genre')
                        <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Primary Language -->
                <div>
                    <label for="primary_language" class="block text-sm font-medium text-gray-900 dark:text-white mb-2">Primary Language</label>
                    <select name="primary_language" id="primary_language" class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all">
                        <option value="">Select a language</option>
                        @foreach($ugandanLanguages as $key => $label)
                            <option value="{{ $key }}">{{ $label }}</option>
                        @endforeach
                    </select>
                    @error('primary_language')
                        <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                    @enderror
                </div>
            </div>

            <!-- Upload Notes -->
            <div>
                <label for="upload_notes" class="block text-sm font-medium text-gray-900 dark:text-white mb-2">Upload Notes (Optional)</label>
                <textarea
                    name="upload_notes"
                    id="upload_notes"
                    rows="3"
                    placeholder="Add any notes about this upload..."
                    class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all resize-none"
                ></textarea>
                @error('upload_notes')
                    <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                @enderror
            </div>

            <!-- Upload Guidelines -->
            <div class="bg-blue-500/10 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/50 rounded-xl p-5">
                <div class="flex items-start gap-3">
                    <span class="material-symbols-outlined text-blue-500 mt-0.5">info</span>
                    <div>
                        <h4 class="text-blue-700 dark:text-blue-400 font-medium mb-2">Upload Guidelines</h4>
                        <ul class="text-gray-600 dark:text-gray-300 text-sm space-y-1">
                            <li>• Ensure your audio files are high quality (preferably 320kbps MP3 or lossless)</li>
                            <li>• Make sure you own the rights to all uploaded music</li>
                            <li>• Files will be processed and analyzed for metadata</li>
                            <li>• You can create songs from processed uploads in the next step</li>
                            <li>• Processing may take a few minutes depending on file size</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Submit Buttons -->
            <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-[#30363D]">
                <a
                    href="{{ route('frontend.artist.upload.index') }}"
                    class="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-6 py-3 rounded-xl font-medium text-gray-700 dark:text-white transition-colors"
                >
                    <span class="material-symbols-outlined">arrow_back</span>
                    Cancel
                </a>

                <button
                    type="submit"
                    x-bind:disabled="selectedFiles.length === 0 || uploading"
                    x-bind:class="selectedFiles.length === 0 || uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'"
                    class="flex items-center gap-2 bg-brand px-6 py-3 rounded-xl font-medium text-white transition-colors"
                >
                    <span class="material-symbols-outlined" x-show="!uploading">cloud_upload</span>
                    <span class="material-symbols-outlined animate-spin" x-show="uploading">progress_activity</span>
                    <span x-text="uploading ? 'Uploading...' : 'Upload Files'"></span>
                </button>
            </div>
        </form>
    </div>
</div>

@push('scripts')
<script>
    function uploadForm() {
        return {
            selectedFiles: [],
            dragOver: false,
            uploading: false,

            handleDrop(event) {
                this.dragOver = false;
                const files = Array.from(event.dataTransfer.files);
                this.addFiles(files);
            },

            handleFileSelect(event) {
                const files = Array.from(event.target.files);
                this.addFiles(files);
            },

            addFiles(files) {
                const validExtensions = ['.mp3', '.wav', '.flac', '.m4a', '.aac'];
                const maxSize = {{ $maxFileSize }};

                files.forEach(file => {
                    const extension = '.' + file.name.split('.').pop().toLowerCase();

                    if (!validExtensions.includes(extension)) {
                        alert(`${file.name} is not a supported audio format.`);
                        return;
                    }

                    if (file.size > maxSize) {
                        alert(`${file.name} is too large. Maximum size is {{ number_format($maxFileSize / (1024*1024)) }}MB.`);
                        return;
                    }

                    // Check if file already selected
                    if (this.selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
                        return;
                    }

                    this.selectedFiles.push(file);
                });

                // Update file input
                this.updateFileInput();
            },

            removeFile(index) {
                this.selectedFiles.splice(index, 1);
                this.updateFileInput();
            },

            updateFileInput() {
                const fileInput = document.getElementById('music_files');
                if (!fileInput) return;
                
                const dt = new DataTransfer();
                this.selectedFiles.forEach(file => {
                    dt.items.add(file);
                });
                fileInput.files = dt.files;
            },

            formatFileSize(bytes) {
                if (bytes === 0) return '0 Bytes';
                const k = 1024;
                const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
            },

            init() {
                // Initialize component
                this.selectedFiles = [];
                this.dragOver = false;
                this.uploading = false;
                
                // Re-attach form submit handler
                const form = this.$el.querySelector('form');
                if (form) {
                    form.addEventListener('submit', () => {
                        this.uploading = true;
                    });
                }
            }
        }
    }
</script>
@endpush
@endsection