@extends('frontend.layouts.music')

@section('title', 'Create Playlist')

@section('content')
<div class="min-h-screen bg-gray-50 dark:bg-[#0D1117] text-gray-900 dark:text-white">
    <div class="container mx-auto px-4 py-8">
        <div class="max-w-2xl mx-auto">
            <!-- Header -->
            <div class="flex items-center mb-8">
                <a href="{{ route('frontend.playlists.index') }}" class="mr-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <span class="material-symbols-outlined">arrow_back</span>
                </a>
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Create Playlist</h1>
            </div>

            <form action="{{ route('frontend.playlists.store') }}" method="POST" enctype="multipart/form-data" class="space-y-6">
                @csrf

                <!-- Playlist Cover Image -->
                <div class="bg-white dark:bg-[#161B22] rounded-2xl border border-gray-200 dark:border-[#30363D] p-6">
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Playlist Cover</label>
                    <div class="flex items-center space-x-6">
                        <div class="w-32 h-32 bg-gray-100 dark:bg-[#21262D] rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 dark:border-[#30363D]" id="cover-preview">
                            <span class="material-symbols-outlined text-4xl text-gray-400 dark:text-gray-500">queue_music</span>
                        </div>
                        <div>
                            <input type="file" name="artwork" id="artwork" accept="image/*" class="hidden">
                            <label for="artwork" class="bg-gray-100 dark:bg-[#21262D] hover:bg-gray-200 dark:hover:bg-[#30363D] text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-xl cursor-pointer transition-colors inline-flex items-center gap-2 font-medium border border-gray-200 dark:border-[#30363D]">
                                <span class="material-symbols-outlined text-[18px]">upload</span>
                                Choose Image
                            </label>
                            <p class="text-gray-500 dark:text-gray-400 text-sm mt-2">JPG, PNG, GIF up to 2MB</p>
                        </div>
                    </div>
                    @error('artwork')
                        <p class="text-red-500 dark:text-red-400 text-sm mt-2">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Playlist Name -->
                <div class="bg-white dark:bg-[#161B22] rounded-2xl border border-gray-200 dark:border-[#30363D] p-6">
                    <label for="name" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Playlist Name *</label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        value="{{ old('name') }}"
                        class="w-full px-4 py-3 bg-gray-50 dark:bg-[#21262D] border border-gray-200 dark:border-[#30363D] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                        placeholder="My awesome playlist"
                        required
                        maxlength="100"
                    >
                    @error('name')
                        <p class="text-red-500 dark:text-red-400 text-sm mt-2">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Playlist Description -->
                <div class="bg-white dark:bg-[#161B22] rounded-2xl border border-gray-200 dark:border-[#30363D] p-6">
                    <label for="description" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                    <textarea
                        name="description"
                        id="description"
                        rows="4"
                        class="w-full px-4 py-3 bg-gray-50 dark:bg-[#21262D] border border-gray-200 dark:border-[#30363D] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent resize-none transition-all"
                        placeholder="Tell people what your playlist is about..."
                        maxlength="300"
                    >{{ old('description') }}</textarea>
                    <div class="flex justify-between mt-2">
                        @error('description')
                            <p class="text-red-500 dark:text-red-400 text-sm">{{ $message }}</p>
                        @else
                            <span></span>
                        @enderror
                        <span class="text-gray-500 dark:text-gray-400 text-sm" id="description-count">0/300</span>
                    </div>
                </div>

                <!-- Privacy Settings -->
                <div class="bg-white dark:bg-[#161B22] rounded-2xl border border-gray-200 dark:border-[#30363D] p-6">
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Privacy</label>
                    <div class="space-y-3">
                        <label class="flex items-center p-3 rounded-xl bg-gray-50 dark:bg-[#21262D] border border-gray-200 dark:border-[#30363D] cursor-pointer hover:border-brand-green transition-colors group">
                            <input type="radio" name="is_private" value="0" {{ old('is_private', '0') == '0' ? 'checked' : '' }} class="sr-only peer">
                            <div class="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-[#30363D] flex items-center justify-center mr-3 peer-checked:border-brand-green peer-checked:bg-brand-green transition-all">
                                <span class="w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100"></span>
                            </div>
                            <div class="flex-1">
                                <div class="text-gray-900 dark:text-white font-medium flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[18px] text-brand-green">public</span>
                                    Public
                                </div>
                                <div class="text-gray-500 dark:text-gray-400 text-sm">Anyone can listen to this playlist</div>
                            </div>
                        </label>
                        <label class="flex items-center p-3 rounded-xl bg-gray-50 dark:bg-[#21262D] border border-gray-200 dark:border-[#30363D] cursor-pointer hover:border-brand-green transition-colors group">
                            <input type="radio" name="is_private" value="1" {{ old('is_private') == '1' ? 'checked' : '' }} class="sr-only peer">
                            <div class="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-[#30363D] flex items-center justify-center mr-3 peer-checked:border-brand-green peer-checked:bg-brand-green transition-all">
                                <span class="w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100"></span>
                            </div>
                            <div class="flex-1">
                                <div class="text-gray-900 dark:text-white font-medium flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[18px] text-amber-500">lock</span>
                                    Private
                                </div>
                                <div class="text-gray-500 dark:text-gray-400 text-sm">Only you can access this playlist</div>
                            </div>
                        </label>
                    </div>
                    @error('is_private')
                        <p class="text-red-500 dark:text-red-400 text-sm mt-2">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Collaborative Option -->
                <div class="bg-white dark:bg-[#161B22] rounded-2xl border border-gray-200 dark:border-[#30363D] p-6">
                    <label class="flex items-center p-3 rounded-xl bg-gray-50 dark:bg-[#21262D] border border-gray-200 dark:border-[#30363D] cursor-pointer hover:border-brand-green transition-colors">
                        <input type="checkbox" name="is_collaborative" value="1" {{ old('is_collaborative') ? 'checked' : '' }} class="sr-only peer">
                        <div class="w-5 h-5 rounded border-2 border-gray-300 dark:border-[#30363D] flex items-center justify-center mr-3 peer-checked:border-brand-green peer-checked:bg-brand-green transition-all">
                            <span class="material-symbols-outlined text-white text-[14px] opacity-0 peer-checked:opacity-100">check</span>
                        </div>
                        <div class="flex-1">
                            <div class="text-gray-900 dark:text-white font-medium flex items-center gap-2">
                                <span class="material-symbols-outlined text-[18px] text-purple-500">group_add</span>
                                Make collaborative
                            </div>
                            <div class="text-gray-500 dark:text-gray-400 text-sm">Let others add songs to this playlist</div>
                        </div>
                    </label>
                    @error('is_collaborative')
                        <p class="text-red-500 dark:text-red-400 text-sm mt-2">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Action Buttons -->
                <div class="flex justify-between items-center pt-6">
                    <a href="{{ route('frontend.playlists.index') }}" class="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
                        Cancel
                    </a>
                    <button type="submit" class="bg-brand-green hover:bg-green-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-brand-green/25 flex items-center gap-2">
                        <span class="material-symbols-outlined">add</span>
                        Create Playlist
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<style>
    /* Custom Radio Styles */
    input[type="radio"]:checked ~ div:first-of-type {
        border-color: #10b981;
        background-color: #10b981;
    }
    
    input[type="radio"]:checked ~ div:first-of-type span {
        opacity: 1;
    }
    
    /* Custom Checkbox Styles */
    input[type="checkbox"]:checked ~ div:first-of-type {
        border-color: #10b981;
        background-color: #10b981;
    }
    
    input[type="checkbox"]:checked ~ div:first-of-type span {
        opacity: 1;
    }
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // Character counter for description
    const descriptionTextarea = document.getElementById('description');
    const descriptionCounter = document.getElementById('description-count');

    function updateCounter() {
        const count = descriptionTextarea.value.length;
        descriptionCounter.textContent = `${count}/300`;

        if (count > 280) {
            descriptionCounter.classList.add('text-red-500', 'dark:text-red-400');
        } else {
            descriptionCounter.classList.remove('text-red-500', 'dark:text-red-400');
        }
    }

    descriptionTextarea.addEventListener('input', updateCounter);
    updateCounter(); // Initial count

    // Image preview
    const artworkInput = document.getElementById('artwork');
    const coverPreview = document.getElementById('cover-preview');

    artworkInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                coverPreview.innerHTML = `<img src="${e.target.result}" alt="Cover preview" class="w-full h-full object-cover rounded-xl">`;
                coverPreview.classList.remove('border-dashed');
            }
            reader.readAsDataURL(file);
        }
    });
});
</script>
@endsection