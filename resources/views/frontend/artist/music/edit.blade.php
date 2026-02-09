@extends('layouts.app')

@section('title', 'Edit Track - ' . $song->title)

@section('left-sidebar')
    @include('frontend.partials.modern-left-sidebar')
@endsection

@push('styles')
<style>
    .glass-panel {
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 0, 0, 0.08);
    }
    .dark .glass-panel {
        background: rgba(22, 27, 34, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.05);
    }
</style>
@endpush

@section('content')
<div x-data="trackEdit()" class="max-w-[1600px] mx-auto">
    <!-- Page Header -->
    <div class="glass-panel rounded-2xl p-6 relative overflow-hidden mb-6">
        <div class="absolute -right-20 -top-20 w-80 h-80 bg-green-500/10 rounded-full blur-3xl"></div>
        <div class="relative z-10">
            <!-- Breadcrumb -->
            <nav class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <a href="{{ route('frontend.artist.dashboard') }}" class="hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1">
                    <span class="material-symbols-outlined text-base">home</span>
                    Dashboard
                </a>
                <span class="material-symbols-outlined text-base">chevron_right</span>
                <a href="{{ route('frontend.artist.music.index') }}" class="hover:text-gray-900 dark:hover:text-white transition-colors">Music Library</a>
                <span class="material-symbols-outlined text-base">chevron_right</span>
                <span class="text-gray-900 dark:text-white">Edit Track</span>
            </nav>

            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div class="flex items-center gap-4">
                    @if($song->artwork_url)
                        <img src="{{ $song->artwork_url }}" alt="{{ $song->title }}" class="w-16 h-16 rounded-xl object-cover shadow-lg">
                    @else
                        <div class="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                            <span class="material-symbols-outlined text-gray-400 dark:text-gray-500 text-2xl">music_note</span>
                        </div>
                    @endif
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $song->title }}</h1>
                        <p class="text-gray-500 dark:text-gray-400">Update your track details</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <a href="{{ route('frontend.artist.music.index') }}"
                       class="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors">
                        <span class="material-symbols-outlined">arrow_back</span>
                        Back to Library
                    </a>
                </div>
            </div>
        </div>
    </div>

    <form action="{{ route('frontend.artist.music.update', $song->id) }}" method="POST" enctype="multipart/form-data">
        @csrf
        @method('PUT')
        
        <div class="grid lg:grid-cols-3 gap-6">
            <!-- Main Content -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Track Information -->
                <div class="glass-panel rounded-xl p-6">
                    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <span class="material-symbols-outlined text-brand-green">edit_note</span>
                        Track Information
                    </h2>

                    <!-- Title -->
                    <div class="mb-6">
                        <label for="title" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Track Title <span class="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value="{{ old('title', $song->title) }}"
                            required
                            class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-brand-green focus:border-brand-green transition-colors"
                            placeholder="Enter track title"
                        >
                        @error('title')
                            <p class="text-red-500 text-sm mt-1 flex items-center gap-1">
                                <span class="material-symbols-outlined text-sm">error</span>
                                {{ $message }}
                            </p>
                        @enderror
                    </div>

                    <!-- Description -->
                    <div class="mb-6">
                        <label for="description" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows="4"
                            class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-brand-green focus:border-brand-green transition-colors resize-none"
                            placeholder="Tell us about your track..."
                        >{{ old('description', $song->description) }}</textarea>
                        @error('description')
                            <p class="text-red-500 text-sm mt-1 flex items-center gap-1">
                                <span class="material-symbols-outlined text-sm">error</span>
                                {{ $message }}
                            </p>
                        @enderror
                    </div>

                    <!-- Genre -->
                    <div class="mb-6">
                        <label for="genre_id" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Genre <span class="text-red-500">*</span>
                        </label>
                        <select
                            id="genre_id"
                            name="genre_id"
                            required
                            class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-green focus:border-brand-green transition-colors"
                        >
                            <option value="">Select a genre</option>
                            @foreach($genres as $genre)
                                <option value="{{ $genre->id }}" {{ (old('genre_id', $song->genres->first()?->id) == $genre->id) ? 'selected' : '' }}>
                                    {{ $genre->name }}
                                </option>
                            @endforeach
                        </select>
                        @error('genre_id')
                            <p class="text-red-500 text-sm mt-1 flex items-center gap-1">
                                <span class="material-symbols-outlined text-sm">error</span>
                                {{ $message }}
                            </p>
                        @enderror
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Language -->
                        <div>
                            <label for="primary_language" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Language
                            </label>
                            <select
                                id="primary_language"
                                name="primary_language"
                                class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-green focus:border-brand-green transition-colors"
                            >
                                <option value="English" {{ old('primary_language', $song->primary_language) == 'English' ? 'selected' : '' }}>English</option>
                                <option value="Luganda" {{ old('primary_language', $song->primary_language) == 'Luganda' ? 'selected' : '' }}>Luganda</option>
                                <option value="Swahili" {{ old('primary_language', $song->primary_language) == 'Swahili' ? 'selected' : '' }}>Swahili</option>
                                <option value="Other" {{ old('primary_language', $song->primary_language) == 'Other' ? 'selected' : '' }}>Other</option>
                            </select>
                        </div>

                        <!-- Release Date -->
                        <div>
                            <label for="release_date" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Release Date
                            </label>
                            <input
                                type="date"
                                id="release_date"
                                name="release_date"
                                value="{{ old('release_date', $song->release_date?->format('Y-m-d') ?? now()->format('Y-m-d')) }}"
                                class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-green focus:border-brand-green transition-colors"
                            >
                        </div>
                    </div>
                </div>

                <!-- Artwork -->
                <div class="glass-panel rounded-xl p-6">
                    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <span class="material-symbols-outlined text-purple-500">image</span>
                        Track Artwork
                    </h2>

                    <div class="flex flex-col sm:flex-row items-start gap-6">
                        <!-- Current Artwork -->
                        @if($song->artwork_url)
                            <div class="flex-shrink-0">
                                <img src="{{ $song->artwork_url }}" alt="{{ $song->title }}" class="w-32 h-32 rounded-xl object-cover shadow-lg border border-gray-200 dark:border-gray-700">
                                <p class="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">Current artwork</p>
                            </div>
                        @endif

                        <!-- Upload New Artwork -->
                        <div class="flex-1">
                            <label for="artwork" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                {{ $song->artwork_url ? 'Update' : 'Upload' }} Artwork
                            </label>
                            <input
                                type="file"
                                id="artwork"
                                name="artwork"
                                accept="image/*"
                                class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-green file:text-white hover:file:bg-green-600 transition-colors"
                            >
                            <p class="text-gray-500 dark:text-gray-400 text-xs mt-2">Recommended: 3000x3000px, JPG or PNG (Max 10MB)</p>
                            @error('artwork')
                                <p class="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <span class="material-symbols-outlined text-sm">error</span>
                                    {{ $message }}
                                </p>
                            @enderror
                        </div>
                    </div>
                </div>

                <!-- Audio File -->
                <div class="glass-panel rounded-xl p-6">
                    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <span class="material-symbols-outlined text-blue-500">audio_file</span>
                        Audio File
                    </h2>

                    <div class="space-y-4">
                        <!-- Current Audio Info -->
                        @if($song->audio_file_original || $song->file_path)
                            <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                                <div class="flex items-center gap-4">
                                    <div class="w-12 h-12 bg-green-100 dark:bg-green-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <span class="material-symbols-outlined text-green-600 dark:text-green-400">audio_file</span>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-gray-900 dark:text-white font-medium truncate">{{ $song->original_filename ?? 'Current audio file' }}</p>
                                        <div class="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            @if($song->duration_seconds)
                                                <span class="flex items-center gap-1">
                                                    <span class="material-symbols-outlined text-sm">schedule</span>
                                                    {{ gmdate('i:s', $song->duration_seconds) }}
                                                </span>
                                            @endif
                                            @if($song->file_size_bytes)
                                                <span class="flex items-center gap-1">
                                                    <span class="material-symbols-outlined text-sm">hard_drive</span>
                                                    {{ number_format($song->file_size_bytes / 1024 / 1024, 2) }} MB
                                                </span>
                                            @endif
                                            @if($song->file_format)
                                                <span class="uppercase bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-xs font-medium">{{ $song->file_format }}</span>
                                            @endif
                                        </div>
                                    </div>
                                    <!-- Play Preview Button -->
                                    <button
                                        type="button"
                                        onclick="window.dispatchEvent(new CustomEvent('play-track', { detail: { track: {{ json_encode(['id' => $song->id, 'title' => $song->title, 'artist_name' => $song->artist->stage_name ?? 'Unknown', 'artwork_url' => $song->artwork_url]) }} } }))"
                                        class="w-12 h-12 bg-brand-green hover:bg-green-600 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 shadow-lg shadow-green-500/20"
                                        title="Preview current audio"
                                    >
                                        <span class="material-symbols-outlined text-white">play_arrow</span>
                                    </button>
                                </div>
                            </div>
                        @endif

                        <!-- Re-upload Audio -->
                        <div x-data="{ showUpload: false }">
                            <button
                                type="button"
                                @click="showUpload = !showUpload"
                                class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-brand-green dark:hover:border-brand-green rounded-xl px-4 py-3 text-gray-900 dark:text-white transition-colors flex items-center justify-between"
                            >
                                <span class="flex items-center gap-2">
                                    <span class="material-symbols-outlined">upload</span>
                                    <span>Replace Audio File</span>
                                </span>
                                <span class="material-symbols-outlined" x-text="showUpload ? 'expand_less' : 'expand_more'">expand_more</span>
                            </button>

                            <div x-show="showUpload" x-collapse class="mt-4">
                                <div class="bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/30 rounded-xl p-4 mb-4">
                                    <div class="flex items-start gap-3">
                                        <span class="material-symbols-outlined text-yellow-600 dark:text-yellow-500 mt-0.5">warning</span>
                                        <div class="flex-1 text-sm">
                                            <p class="text-yellow-700 dark:text-yellow-500 font-medium mb-1">Warning: Replacing Audio File</p>
                                            <p class="text-yellow-600 dark:text-gray-300">Uploading a new audio file will replace the current one. This action cannot be undone. Make sure you have a backup of the original file if needed.</p>
                                        </div>
                                    </div>
                                </div>

                                <label for="audio_file" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Upload New Audio File <span class="text-gray-500">(Optional)</span>
                                </label>
                                <input
                                    type="file"
                                    id="audio_file"
                                    name="audio_file"
                                    accept="audio/mpeg,audio/mp3,audio/wav,audio/flac"
                                    class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-green file:text-white hover:file:bg-green-600 transition-colors"
                                >
                                <p class="text-gray-500 dark:text-gray-400 text-xs mt-2">
                                    Supported formats: MP3, WAV, FLAC • Max file size: 100MB • Recommended: 320kbps MP3
                                </p>
                                @error('audio_file')
                                    <p class="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <span class="material-symbols-outlined text-sm">error</span>
                                        {{ $message }}
                                    </p>
                                @enderror
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="glass-panel rounded-xl p-6">
                    <div class="flex flex-col sm:flex-row items-center gap-4">
                        <button
                            type="submit"
                            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-brand-green hover:bg-green-600 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-green-500/20"
                        >
                            <span class="material-symbols-outlined">save</span>
                            Save Changes
                        </button>

                        <a
                            href="{{ route('frontend.artist.music.index') }}"
                            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium transition-colors"
                        >
                            Cancel
                        </a>

                        @if($song->status !== 'published')
                            <button
                                type="button"
                                @click="confirmDelete"
                                class="w-full sm:w-auto sm:ml-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
                            >
                                <span class="material-symbols-outlined">delete</span>
                                Delete Track
                            </button>
                        @endif
                    </div>
                </div>
            </div>

            <!-- Sidebar -->
            <div class="space-y-6">
                <!-- Quick Actions -->
                <div class="glass-panel rounded-xl p-6">
                    <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Quick Actions</h3>
                    <div class="space-y-3">
                        <a href="{{ route('frontend.artist.upload.create') }}" class="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl text-gray-700 dark:text-gray-200 transition-colors">
                            <span class="material-symbols-outlined text-brand-green">add</span>
                            <span class="font-medium">Upload New Track</span>
                        </a>
                        <a href="{{ route('frontend.artist.analytics') }}" class="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl text-gray-700 dark:text-gray-200 transition-colors">
                            <span class="material-symbols-outlined text-blue-500">analytics</span>
                            <span class="font-medium">View Analytics</span>
                        </a>
                        <a href="{{ route('frontend.artist.music.index') }}" class="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl text-gray-700 dark:text-gray-200 transition-colors">
                            <span class="material-symbols-outlined text-purple-500">library_music</span>
                            <span class="font-medium">Music Library</span>
                        </a>
                    </div>
                </div>

                <!-- Pricing & Availability -->
                <div class="glass-panel rounded-xl p-6">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <span class="material-symbols-outlined text-orange-500">sell</span>
                        Pricing & Status
                    </h3>

                    <!-- Price -->
                    <div class="mb-6">
                        <label for="price" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Price (UGX)
                        </label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value="{{ old('price', $song->price ?? 0) }}"
                            min="0"
                            step="1000"
                            class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-brand-green focus:border-brand-green transition-colors"
                            placeholder="0"
                        >
                        <p class="text-gray-500 dark:text-gray-400 text-xs mt-1">Set to 0 for free track</p>
                    </div>

                    <!-- Status -->
                    <div class="mb-6">
                        <label for="status" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Status
                        </label>
                        <select
                            id="status"
                            name="status"
                            class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-green focus:border-brand-green transition-colors"
                        >
                            <option value="draft" {{ old('status', $song->status) == 'draft' ? 'selected' : '' }}>Draft</option>
                            <option value="published" {{ old('status', $song->status) == 'published' ? 'selected' : '' }}>Published</option>
                            <option value="private" {{ old('status', $song->status) == 'private' ? 'selected' : '' }}>Private</option>
                        </select>
                    </div>

                    <!-- Options -->
                    <div class="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <label class="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                            <input
                                type="checkbox"
                                name="allow_downloads"
                                value="1"
                                {{ old('allow_downloads', $song->is_downloadable) ? 'checked' : '' }}
                                class="w-5 h-5 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded text-brand-green focus:ring-brand-green focus:ring-offset-0"
                            >
                            <div>
                                <span class="text-gray-900 dark:text-white font-medium">Allow downloads</span>
                                <p class="text-xs text-gray-500 dark:text-gray-400">Users can download this track</p>
                            </div>
                        </label>

                        <label class="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                            <input
                                type="checkbox"
                                name="is_explicit"
                                value="1"
                                {{ old('is_explicit', $song->is_explicit) ? 'checked' : '' }}
                                class="w-5 h-5 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded text-brand-green focus:ring-brand-green focus:ring-offset-0"
                            >
                            <div>
                                <span class="text-gray-900 dark:text-white font-medium">Explicit content</span>
                                <p class="text-xs text-gray-500 dark:text-gray-400">Contains adult language/themes</p>
                            </div>
                        </label>
                    </div>
                </div>

                <!-- Track Stats -->
                <div class="glass-panel rounded-xl p-6">
                    <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Track Stats</h3>
                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                            <span class="text-gray-600 dark:text-gray-400">Total Plays</span>
                            <span class="text-gray-900 dark:text-white font-semibold">{{ number_format($song->play_count ?? 0) }}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-gray-600 dark:text-gray-400">Downloads</span>
                            <span class="text-gray-900 dark:text-white font-semibold">{{ number_format($song->download_count ?? 0) }}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-gray-600 dark:text-gray-400">Likes</span>
                            <span class="text-gray-900 dark:text-white font-semibold">{{ number_format($song->likes_count ?? 0) }}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-gray-600 dark:text-gray-400">Created</span>
                            <span class="text-gray-900 dark:text-white font-semibold">{{ $song->created_at->format('M d, Y') }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </form>

    <!-- Delete Confirmation Modal -->
    <div x-show="showDeleteModal" x-cloak class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" @keydown.escape.window="showDeleteModal = false">
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200 dark:border-gray-700" @click.outside="showDeleteModal = false">
            <div class="flex items-center gap-4 mb-4">
                <div class="w-14 h-14 bg-red-100 dark:bg-red-600/20 rounded-xl flex items-center justify-center">
                    <span class="material-symbols-outlined text-red-600 dark:text-red-500 text-2xl">warning</span>
                </div>
                <div>
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white">Delete Track?</h3>
                    <p class="text-gray-500 dark:text-gray-400 text-sm">This action cannot be undone</p>
                </div>
            </div>

            <p class="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete "<span class="font-semibold text-gray-900 dark:text-white">{{ $song->title }}</span>"? This will permanently remove the track and all associated data.
            </p>

            <div class="flex items-center gap-3">
                <form action="{{ route('frontend.artist.music.destroy', $song->id) }}" method="POST" class="flex-1">
                    @csrf
                    @method('DELETE')
                    <button
                        type="submit"
                        class="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
                    >
                        <span class="material-symbols-outlined">delete</span>
                        Yes, Delete
                    </button>
                </form>

                <button
                    type="button"
                    @click="showDeleteModal = false"
                    class="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
    function trackEdit() {
        return {
            showDeleteModal: false,

            confirmDelete() {
                this.showDeleteModal = true;
            }
        }
    }
</script>
@endpush
@endsection
