@extends('layouts.app')

@section('title', 'Upload New Music')

@section('left-sidebar')
    @include('frontend.partials.artist-left-sidebar')
@endsection

@push('styles')
<style>
    /* Light mode styles */
    .glass-panel {
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(0, 0, 0, 0.08);
    }
    /* Dark mode styles */
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
<div class="max-w-4xl mx-auto space-y-8">
    <!-- Session Alerts -->
    @if(session('success'))
    <div class="bg-green-500/10 border border-green-500/30 text-green-400 px-6 py-4 rounded-xl flex items-center gap-3" role="alert">
        <span class="material-symbols-outlined">check_circle</span>
        <span>{{ session('success') }}</span>
        <button type="button" onclick="this.parentElement.remove()" class="ml-auto text-green-400 hover:text-green-300">
            <span class="material-symbols-outlined">close</span>
        </button>
    </div>
    @endif
    
    @if(session('error'))
    <div class="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-xl flex items-center gap-3" role="alert">
        <span class="material-symbols-outlined">error</span>
        <span>{{ session('error') }}</span>
        <button type="button" onclick="this.parentElement.remove()" class="ml-auto text-red-400 hover:text-red-300">
            <span class="material-symbols-outlined">close</span>
        </button>
    </div>
    @endif

    @if($errors->any())
    <div class="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-xl" role="alert">
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

    <!-- Page Header -->
    <div class="glass-panel rounded-2xl p-6">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Upload New Music</h1>
                <p class="text-gray-500 dark:text-gray-400 mt-1">Add a new release to your library</p>
            </div>
            <div class="flex items-center gap-4">
                <div class="text-right">
                    <span class="text-xs font-bold text-brand uppercase tracking-wider">Step 1 of 4</span>
                    <div class="flex items-center gap-2 mt-1">
                        <div class="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div class="h-full w-1/4 bg-brand rounded-full"></div>
                        </div>
                        <span class="text-xs text-gray-500 dark:text-gray-400">Basic Info</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <form action="{{ route('frontend.artist.music.store') }}" method="POST" enctype="multipart/form-data" class="space-y-8">
        @csrf
        
        <!-- Release Type Section -->
        <div class="glass-panel rounded-2xl p-6">
            <div class="flex items-center justify-between mb-4">
                <label class="block text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Release Type</label>
                <span class="text-xs text-brand hover:underline cursor-pointer">What's the difference?</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label class="group relative flex items-center gap-4 p-5 rounded-xl bg-gray-100 dark:bg-gray-800/50 border-2 border-brand cursor-pointer transition-all hover:bg-gray-200 dark:hover:bg-gray-800">
                    <input checked name="release_type" type="radio" value="single" class="peer sr-only"/>
                    <div class="w-14 h-14 rounded-full bg-brand/20 flex flex-shrink-0 items-center justify-center text-brand peer-checked:bg-brand peer-checked:text-white transition-colors">
                        <span class="material-symbols-outlined text-2xl">music_note</span>
                    </div>
                    <div>
                        <span class="block text-lg font-bold text-gray-900 dark:text-white">Single</span>
                        <span class="block text-sm text-gray-500 dark:text-gray-400">One track release</span>
                    </div>
                    <div class="absolute top-5 right-5 w-5 h-5 rounded-full border-2 border-brand bg-brand flex items-center justify-center">
                        <span class="material-symbols-outlined text-sm text-white">check</span>
                    </div>
                </label>
                <label class="group relative flex items-center gap-4 p-5 rounded-xl bg-gray-100 dark:bg-gray-800/50 border-2 border-transparent hover:border-gray-400 dark:hover:border-gray-600 cursor-pointer transition-all hover:bg-gray-200 dark:hover:bg-gray-800">
                    <input name="release_type" type="radio" value="album" class="peer sr-only"/>
                    <div class="w-14 h-14 rounded-full bg-gray-300 dark:bg-gray-700 flex flex-shrink-0 items-center justify-center text-gray-500 dark:text-gray-400 peer-checked:bg-brand peer-checked:text-white transition-colors">
                        <span class="material-symbols-outlined text-2xl">album</span>
                    </div>
                    <div>
                        <span class="block text-lg font-bold text-gray-900 dark:text-white">Album / EP</span>
                        <span class="block text-sm text-gray-500 dark:text-gray-400">Two or more tracks</span>
                    </div>
                    <div class="absolute top-5 right-5 w-5 h-5 rounded-full border-2 border-gray-400 dark:border-gray-600 peer-checked:border-brand peer-checked:bg-brand flex items-center justify-center">
                        <span class="material-symbols-outlined text-sm text-white opacity-0 peer-checked:opacity-100">check</span>
                    </div>
                </label>
            </div>
        </div>

        <!-- Track Details Section -->
        <div class="glass-panel rounded-2xl p-6 space-y-6">
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">Track Details</h2>
            
            <div>
                <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">Track Title <span class="text-brand">*</span></label>
                <input name="title" type="text" required
                       class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all placeholder-gray-500 text-lg"
                       placeholder="e.g. Midnight Memories"/>
                @error('title')
                    <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">Primary Artist(s) <span class="text-brand">*</span></label>
                    <div class="relative">
                        <span class="absolute left-4 top-3.5 material-symbols-outlined text-gray-500">person</span>
                        <input type="text" readonly
                               class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl pl-11 pr-4 py-3 text-gray-900 dark:text-white font-medium"
                               value="{{ auth()->user()->artist->stage_name ?? auth()->user()->display_name }}"/>
                        <div class="absolute right-2 top-2 flex items-center gap-1 bg-brand/20 text-brand px-2 py-1 rounded-lg text-xs font-bold border border-brand/20 uppercase tracking-wide">
                            Main Profile
                        </div>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">Featured Artist(s)</label>
                    <div class="relative">
                        <span class="absolute left-4 top-3.5 material-symbols-outlined text-gray-500">group_add</span>
                        <input name="featured_artists" type="text"
                               class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl pl-11 pr-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all placeholder-gray-500"
                               placeholder="Search for artists..."/>
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">Primary Genre <span class="text-brand">*</span></label>
                    <div class="relative">
                        <select name="genre_id" required
                                class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all appearance-none cursor-pointer">
                            <option value="" disabled selected>Select a genre</option>
                            @foreach(\App\Models\Genre::orderBy('name')->get() as $genre)
                                <option value="{{ $genre->id }}">{{ $genre->name }}</option>
                            @endforeach
                        </select>
                        <span class="material-symbols-outlined absolute right-4 top-3.5 text-gray-500 pointer-events-none">expand_more</span>
                    </div>
                    @error('genre_id')
                        <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                    @enderror
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">Secondary Genre</label>
                    <div class="relative">
                        <select name="secondary_genre_id"
                                class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all appearance-none cursor-pointer">
                            <option value="" disabled selected>Select sub-genre (Optional)</option>
                            @foreach(\App\Models\Genre::orderBy('name')->get() as $genre)
                                <option value="{{ $genre->id }}">{{ $genre->name }}</option>
                            @endforeach
                        </select>
                        <span class="material-symbols-outlined absolute right-4 top-3.5 text-gray-500 pointer-events-none">expand_more</span>
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">Release Date <span class="text-brand">*</span></label>
                    <input name="release_date" type="date" required
                           class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                           value="{{ date('Y-m-d') }}"/>
                    @error('release_date')
                        <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                    @enderror
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">Primary Language <span class="text-brand">*</span></label>
                    <div class="relative">
                        <select name="language" required
                                class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all appearance-none cursor-pointer">
                            <option value="en" selected>English</option>
                            <option value="sw">Swahili</option>
                            <option value="lg">Luganda</option>
                            <option value="ate">Ateso</option>
                            <option value="other">Other</option>
                        </select>
                        <span class="material-symbols-outlined absolute right-4 top-3.5 text-gray-500 pointer-events-none">expand_more</span>
                    </div>
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">Description</label>
                <textarea name="description" rows="3"
                          class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all placeholder-gray-500 resize-none"
                          placeholder="Tell your fans about this track..."></textarea>
            </div>
        </div>

        <!-- Audio Upload Section -->
        <div class="glass-panel rounded-2xl p-6 space-y-6">
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">Audio File</h2>
            
            <div class="upload-zone rounded-xl p-8 text-center cursor-pointer" id="audio-upload-zone">
                <input type="file" name="audio_file" id="audio-file" accept="audio/*" class="hidden" required/>
                <div class="space-y-4">
                    <div class="w-16 h-16 mx-auto bg-brand/20 rounded-full flex items-center justify-center">
                        <span class="material-symbols-outlined text-3xl text-brand">audio_file</span>
                    </div>
                    <div>
                        <p class="text-gray-900 dark:text-white font-medium">Drag and drop your audio file here</p>
                        <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">or click to browse</p>
                    </div>
                    <p class="text-xs text-gray-500">Supported formats: MP3, WAV, FLAC, AAC (Max 100MB)</p>
                </div>
            </div>
            <div id="audio-preview" class="hidden bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-brand/20 rounded-lg flex items-center justify-center">
                        <span class="material-symbols-outlined text-brand">audio_file</span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-gray-900 dark:text-white font-medium truncate" id="audio-filename"></p>
                        <p class="text-gray-500 dark:text-gray-400 text-sm" id="audio-filesize"></p>
                    </div>
                    <button type="button" id="remove-audio" class="text-red-400 hover:text-red-300">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                </div>
            </div>
            @error('audio_file')
                <p class="text-red-500 text-sm">{{ $message }}</p>
            @enderror
        </div>

        <!-- Artwork Upload Section -->
        <div class="glass-panel rounded-2xl p-6 space-y-6">
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">Cover Artwork</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="upload-zone rounded-xl p-6 text-center cursor-pointer aspect-square flex flex-col items-center justify-center" id="artwork-upload-zone">
                    <input type="file" name="artwork" id="artwork-file" accept="image/*" class="hidden"/>
                    <div class="space-y-3">
                        <div class="w-12 h-12 mx-auto bg-brand/20 rounded-full flex items-center justify-center">
                            <span class="material-symbols-outlined text-2xl text-brand">image</span>
                        </div>
                        <div>
                            <p class="text-gray-900 dark:text-white font-medium">Upload artwork</p>
                            <p class="text-gray-500 dark:text-gray-400 text-sm">1400x1400 recommended</p>
                        </div>
                    </div>
                </div>
                <div id="artwork-preview" class="hidden aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img id="artwork-preview-img" src="" alt="Artwork preview" class="w-full h-full object-cover"/>
                </div>
            </div>
            @error('artwork')
                <p class="text-red-500 text-sm">{{ $message }}</p>
            @enderror
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-between pt-4 pb-20">
            <a href="{{ route('frontend.artist.music.index') }}" class="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Cancel
            </a>
            <div class="flex items-center gap-4">
                <button type="submit" name="publish_type" value="draft" class="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                    Save as Draft
                </button>
                <button type="submit" name="publish_type" value="now" class="px-8 py-3 rounded-xl bg-brand text-white font-bold shadow-lg shadow-brand/25 hover:bg-green-400 transition-all flex items-center gap-2">
                    <span>Upload & Publish</span>
                    <span class="material-symbols-outlined">upload</span>
                </button>
            </div>
        </div>
    </form>
</div>
@endsection

@push('scripts')
<script>
/**
 * Upload Page Script
 * Works with both normal page loads and SPA navigation
 */
(function initUploadPage() {
    // Prevent double initialization
    if (window.uploadPageInitialized) return;
    
    // Audio upload handling
    const audioZone = document.getElementById('audio-upload-zone');
    const audioInput = document.getElementById('audio-file');
    const audioPreview = document.getElementById('audio-preview');
    const audioFilename = document.getElementById('audio-filename');
    const audioFilesize = document.getElementById('audio-filesize');
    const removeAudio = document.getElementById('remove-audio');

    // Check if elements exist (might not if on different page)
    if (!audioZone || !audioInput) {
        return;
    }

    window.uploadPageInitialized = true;

    function setupAudioUpload() {
        audioZone.addEventListener('click', () => audioInput.click());
        
        audioZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            audioZone.classList.add('dragover');
        });
        
        audioZone.addEventListener('dragleave', () => {
            audioZone.classList.remove('dragover');
        });
        
        audioZone.addEventListener('drop', (e) => {
            e.preventDefault();
            audioZone.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                audioInput.files = e.dataTransfer.files;
                handleAudioFile(e.dataTransfer.files[0]);
            }
        });

        audioInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleAudioFile(e.target.files[0]);
            }
        });

        if (removeAudio) {
            removeAudio.addEventListener('click', () => {
                audioInput.value = '';
                audioZone.classList.remove('hidden');
                audioPreview.classList.add('hidden');
            });
        }
    }

    function handleAudioFile(file) {
        if (audioFilename) audioFilename.textContent = file.name;
        if (audioFilesize) audioFilesize.textContent = formatFileSize(file.size);
        audioZone.classList.add('hidden');
        if (audioPreview) audioPreview.classList.remove('hidden');
    }

    // Artwork upload handling
    const artworkZone = document.getElementById('artwork-upload-zone');
    const artworkInput = document.getElementById('artwork-file');
    const artworkPreview = document.getElementById('artwork-preview');
    const artworkPreviewImg = document.getElementById('artwork-preview-img');

    function setupArtworkUpload() {
        if (!artworkZone || !artworkInput) return;
        
        artworkZone.addEventListener('click', () => artworkInput.click());
        
        artworkZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            artworkZone.classList.add('dragover');
        });
        
        artworkZone.addEventListener('dragleave', () => {
            artworkZone.classList.remove('dragover');
        });
        
        artworkZone.addEventListener('drop', (e) => {
            e.preventDefault();
            artworkZone.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                artworkInput.files = e.dataTransfer.files;
                handleArtworkFile(e.dataTransfer.files[0]);
            }
        });

        artworkInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleArtworkFile(e.target.files[0]);
            }
        });
    }

    function handleArtworkFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (artworkPreviewImg) artworkPreviewImg.src = e.target.result;
            if (artworkZone) artworkZone.classList.add('hidden');
            if (artworkPreview) artworkPreview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Initialize
    setupAudioUpload();
    setupArtworkUpload();
    
    console.log('[Upload] Page initialized');
})();

// Reset flag when leaving page via SPA navigation
window.addEventListener('spa:navigated', function() {
    window.uploadPageInitialized = false;
});
</script>
@endpush
