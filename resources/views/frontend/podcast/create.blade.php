@extends('frontend.layouts.music')

@section('title', 'Create Podcast - Tesotunes')

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
    .cover-upload-zone {
        transition: all 0.3s ease;
    }
    .cover-upload-zone:hover {
        border-color: #1db954;
    }
    .cover-upload-zone.dragover {
        border-color: #1db954;
        background: rgba(29, 185, 84, 0.1);
    }
</style>
@endpush

@section('content')
<div class="max-w-4xl mx-auto space-y-6">
    <!-- Header Panel -->
    <div class="glass-panel rounded-2xl p-6 relative overflow-hidden">
        <div class="absolute -right-20 -top-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div class="relative z-10">
            <!-- Breadcrumb -->
            <nav class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <a href="{{ route('frontend.social.feed') }}" class="hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1">
                    <span class="material-symbols-outlined text-base">home</span>
                    Home
                </a>
                <span class="material-symbols-outlined text-base">chevron_right</span>
                <a href="{{ route('podcast.index') }}" class="hover:text-gray-900 dark:hover:text-white transition-colors">Podcasts</a>
                <span class="material-symbols-outlined text-base">chevron_right</span>
                <span class="text-gray-900 dark:text-white">Create</span>
            </nav>

            <div class="flex items-center gap-4">
                <div class="w-14 h-14 bg-purple-100 dark:bg-purple-600/20 rounded-xl flex items-center justify-center">
                    <span class="material-symbols-outlined text-purple-600 dark:text-purple-400 text-2xl">podcasts</span>
                </div>
                <div>
                    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Create Your Podcast</h1>
                    <p class="text-gray-500 dark:text-gray-400">Start sharing your voice with the world</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Form Panel -->
    <div class="glass-panel rounded-2xl p-6">
        <form action="{{ route('podcast.store') }}" method="POST" enctype="multipart/form-data" x-data="podcastForm()">
            @csrf

            <!-- Podcast Cover -->
            <div class="mb-8">
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Podcast Cover</label>
                <div class="flex flex-col sm:flex-row items-start gap-6">
                    <!-- Preview -->
                    <div class="cover-upload-zone w-40 h-40 bg-gray-100 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden cursor-pointer"
                         @click="$refs.coverInput.click()"
                         @dragover.prevent="dragover = true"
                         @dragleave.prevent="dragover = false"
                         @drop.prevent="handleDrop($event)"
                         :class="{ 'dragover': dragover }">
                        <template x-if="!coverPreview">
                            <div class="text-center p-4">
                                <span class="material-symbols-outlined text-4xl text-gray-400 dark:text-gray-500 mb-2">add_photo_alternate</span>
                                <p class="text-xs text-gray-500 dark:text-gray-400">Click or drag to upload</p>
                            </div>
                        </template>
                        <template x-if="coverPreview">
                            <img :src="coverPreview" class="w-full h-full object-cover">
                        </template>
                    </div>
                    
                    <div class="flex-1">
                        <input type="file" name="cover_image" x-ref="coverInput" @change="handleCoverUpload($event)" accept="image/*" class="hidden">
                        <button type="button" @click="$refs.coverInput.click()" 
                                class="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-green hover:bg-green-600 text-white rounded-lg font-medium transition-colors">
                            <span class="material-symbols-outlined">upload</span>
                            Choose Image
                        </button>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-3">
                            Recommended: 1400x1400px or larger, square format<br>
                            Formats: JPG, PNG (max 5MB)
                        </p>
                        <template x-if="coverPreview">
                            <button type="button" @click="removeCover()" class="mt-2 text-sm text-red-500 hover:text-red-600 flex items-center gap-1">
                                <span class="material-symbols-outlined text-sm">delete</span>
                                Remove image
                            </button>
                        </template>
                    </div>
                </div>
                @error('cover_image')
                    <p class="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <span class="material-symbols-outlined text-sm">error</span>
                        {{ $message }}
                    </p>
                @enderror
            </div>

            <!-- Podcast Title -->
            <div class="mb-6">
                <label for="title" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Podcast Title <span class="text-red-500">*</span>
                </label>
                <input type="text" name="title" id="title" value="{{ old('title') }}" required
                       placeholder="Enter your podcast title"
                       class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-brand-green focus:border-brand-green transition-colors">
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
                    Description <span class="text-red-500">*</span>
                </label>
                <textarea name="description" id="description" rows="5" required
                          placeholder="Tell listeners what your podcast is about..."
                          class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-brand-green focus:border-brand-green transition-colors resize-none">{{ old('description') }}</textarea>
                @error('description')
                    <p class="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <span class="material-symbols-outlined text-sm">error</span>
                        {{ $message }}
                    </p>
                @enderror
            </div>

            <!-- Two Column Layout -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <!-- Category -->
                <div>
                    <label for="category_id" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Category <span class="text-red-500">*</span>
                    </label>
                    <select name="category_id" id="category_id" required
                            class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-green focus:border-brand-green transition-colors">
                        <option value="">Select a category</option>
                        @foreach($categories as $category)
                            <option value="{{ $category->id }}" {{ old('category_id') == $category->id ? 'selected' : '' }}>
                                {{ $category->name }}
                            </option>
                        @endforeach
                    </select>
                    @error('category_id')
                        <p class="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <span class="material-symbols-outlined text-sm">error</span>
                            {{ $message }}
                        </p>
                    @enderror
                </div>

                <!-- Language -->
                <div>
                    <label for="language" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Language <span class="text-red-500">*</span>
                    </label>
                    <select name="language" id="language" required
                            class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-green focus:border-brand-green transition-colors">
                        <option value="en" {{ old('language') == 'en' ? 'selected' : '' }}>English</option>
                        <option value="lg" {{ old('language') == 'lg' ? 'selected' : '' }}>Luganda</option>
                        <option value="sw" {{ old('language') == 'sw' ? 'selected' : '' }}>Swahili</option>
                    </select>
                    @error('language')
                        <p class="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <span class="material-symbols-outlined text-sm">error</span>
                            {{ $message }}
                        </p>
                    @enderror
                </div>
            </div>

            <!-- Explicit Content -->
            <div class="mb-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <label class="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="explicit" value="1" {{ old('explicit') ? 'checked' : '' }}
                           class="w-5 h-5 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded text-brand-green focus:ring-brand-green focus:ring-offset-0">
                    <div>
                        <span class="font-medium text-gray-900 dark:text-white">Explicit Content</span>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Check this if your podcast contains adult language or themes</p>
                    </div>
                </label>
            </div>

            <!-- Submit Buttons -->
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <a href="{{ route('podcast.index') }}" 
                   class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium transition-colors">
                    <span class="material-symbols-outlined">arrow_back</span>
                    Cancel
                </a>
                <button type="submit" 
                        class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-brand-green hover:bg-green-600 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-green-500/20">
                    <span class="material-symbols-outlined">podcasts</span>
                    Create Podcast
                </button>
            </div>
        </form>
    </div>

    <!-- Tips Panel -->
    <div class="glass-panel rounded-xl p-6">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-brand-green">tips_and_updates</span>
            Tips for a Great Podcast
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex items-start gap-3">
                <div class="w-8 h-8 bg-blue-100 dark:bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span class="material-symbols-outlined text-blue-600 dark:text-blue-400 text-sm">image</span>
                </div>
                <div>
                    <p class="font-medium text-gray-900 dark:text-white text-sm">Eye-catching Cover</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Use a high-quality square image that stands out</p>
                </div>
            </div>
            <div class="flex items-start gap-3">
                <div class="w-8 h-8 bg-purple-100 dark:bg-purple-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span class="material-symbols-outlined text-purple-600 dark:text-purple-400 text-sm">edit_note</span>
                </div>
                <div>
                    <p class="font-medium text-gray-900 dark:text-white text-sm">Clear Description</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Tell listeners what to expect from your show</p>
                </div>
            </div>
            <div class="flex items-start gap-3">
                <div class="w-8 h-8 bg-orange-100 dark:bg-orange-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span class="material-symbols-outlined text-orange-600 dark:text-orange-400 text-sm">schedule</span>
                </div>
                <div>
                    <p class="font-medium text-gray-900 dark:text-white text-sm">Consistent Schedule</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Release episodes on a regular schedule</p>
                </div>
            </div>
            <div class="flex items-start gap-3">
                <div class="w-8 h-8 bg-green-100 dark:bg-green-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span class="material-symbols-outlined text-green-600 dark:text-green-400 text-sm">mic</span>
                </div>
                <div>
                    <p class="font-medium text-gray-900 dark:text-white text-sm">Quality Audio</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Use a good microphone and quiet environment</p>
                </div>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
function podcastForm() {
    return {
        coverPreview: null,
        dragover: false,
        
        handleCoverUpload(event) {
            const file = event.target.files[0];
            if (file) {
                this.previewImage(file);
            }
        },
        
        handleDrop(event) {
            this.dragover = false;
            const file = event.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.$refs.coverInput.files = event.dataTransfer.files;
                this.previewImage(file);
            }
        },
        
        previewImage(file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.coverPreview = e.target.result;
            };
            reader.readAsDataURL(file);
        },
        
        removeCover() {
            this.coverPreview = null;
            this.$refs.coverInput.value = '';
        }
    }
}
</script>
@endpush
@endsection
